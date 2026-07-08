---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7639649258794418473-data_volume/files/所有对话/主对话/Excel导入问题排查与修复方案.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 516084306544602#1783509874330
    ReservedCode2: ""
---
# Excel 导入问题排查与修复方案

## 一、Excel 导入功能代码结构

### 1.1 核心文件清单

| 文件路径 | 职责 |
|---------|------|
| `src/pages/ExcelImport.tsx` | Excel 导入主页面，包含文件上传、字段映射、预览确认、导入执行全流程 |
| `src/store/useStore.ts` | 状态管理，包含交易、分类、商户规则三个 store |
| `src/utils/category.ts` | 分类与商户规则工具函数，含默认数据和匹配逻辑 |
| `src/types/index.ts` | TypeScript 类型定义 |
| `src/pages/MerchantRules.tsx` | 商户规则库管理页面 |

### 1.2 核心函数与流程

导入流程分为 4 步：

1. **Step 1 - 选择文件**：`handleFileUpload` / `handleDrop`
   - 使用 `xlsx` 库解析 Excel/CSV 文件
   - 读取第一个 Sheet，转换为 JSON
   - **仅保存前 50 行**（`jsonData.slice(0, 50)`）→ **Bug：最多只能导入 50 条**

2. **Step 2 - 列匹配**：`handleFieldChange`
   - 用户手动选择每列对应的字段类型
   - 可选字段：日期、金额、商户/摘要、收支类型、备注、分类、忽略
   - **缺少自动字段识别**：没有根据列名自动匹配常见账单格式

3. **Step 3 - 分类确认**：`handleNextStep`
   - 遍历每行，根据字段映射提取数据
   - 调用 `formatDate` 格式化日期
   - 调用 `formatAmount` 格式化金额
   - 调用 `matchMerchant` 匹配商户规则自动分类
   - 识别收支类型（收入/支出）

4. **Step 4 - 执行导入**：`handleImport`
   - 校验必填字段（日期、金额、大类、小类）
   - 调用 `addTransaction` 逐条写入
   - 统计成功/失败数量

---

## 二、问题一：金额全部是 0

### 2.1 根因分析

**定位文件**：`src/pages/ExcelImport.tsx` 第 103-107 行

```typescript
const formatAmount = (amountStr: string): string => {
  if (!amountStr) return '0';
  const match = amountStr.match(/[\d.]+/);
  return match ? match[0] : '0';
};
```

#### 根因 1：类型不匹配（主因，高概率）

XLSX 的 `sheet_to_json` 在解析数字格式的单元格时，返回的是 **`number` 类型**，而非字符串。但 `formatAmount` 函数：

- 参数类型声明为 `string`（仅 TypeScript 层面，运行时无校验）
- 直接调用 `.match()` 方法，**`number` 类型没有 `match` 方法**

当金额非零时：
```
amountStr = 25.5  (number 类型)
amountStr.match(/[\d.]+/)  →  TypeError: amountStr.match is not a function
```

**异常传播路径**：`rows.map()` 中某行抛出 TypeError → 整个 map 中断 → `setImportRows` 不执行 → 页面停留在 Step 2 无响应。

当金额恰好为 0 时：
```
amountStr = 0  (number 类型)
!0 → true  →  返回 '0'  (巧合正确，但属于误打误撞)
```

> **注**：如果用户的 Excel 文件中金额列全是文本格式（如 CSV 文件），此问题不会触发。但只要是标准 Excel（.xlsx）的数字单元格，必现此问题。

#### 根因 2：缺少账单头部跳过逻辑

支付宝/微信导出的账单文件前 **5~10 行为说明文字**（账号、时间范围、收支汇总等），不是数据表头。例如：

```
微信支付账单明细
微信昵称: [xxx]
起始时间: [2024-01-01] 终止时间: [2024-01-31]
共收入: 10 笔 合计: 1000.00 元
共支出: 20 笔 合计: 500.00 元
(空行)
交易时间,交易类型,交易对方,商品,收/支,金额(元),...
```

当前代码直接将第一行作为表头，导致：
- 表头列名完全错乱
- 用户可能误将非金额列映射为金额字段
- 非数字内容经 `formatAmount` 解析后全部返回 `'0'`

#### 根因 3：金额格式处理不完整

正则 `[\d.]+` 仅匹配数字和点，以下场景可能解析错误或不完整：

| 原始值 | 解析结果 | 问题 |
|-------|---------|------|
| `¥25.00` | `25.00` | 正常 |
| `1,234.56` | `1` | **千分位逗号导致只匹配到第一位** |
| `-25.00` | `25.00` | 丢失了收支符号信息 |
| `25.00元` | `25.00` | 正常 |

### 2.2 修改方案

#### 方案 1：修复 `formatAmount` 类型处理

```typescript
const formatAmount = (amountVal: string | number): string => {
  if (amountVal === null || amountVal === undefined || amountVal === '') return '0';
  
  // number 类型直接转字符串返回
  if (typeof amountVal === 'number') {
    if (isNaN(amountVal) || !isFinite(amountVal)) return '0';
    return Math.abs(amountVal).toString();
  }
  
  // string 类型：先移除千分位逗号和货币符号，再提取数字
  const cleaned = amountVal.replace(/[,\s¥￥$]/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  return match ? Math.abs(parseFloat(match[0])).toString() : '0';
};
```

#### 方案 2：增加账单头部自动检测与跳过

在文件解析后、设置 headers 之前，检测真正的数据表头位置：

```typescript
const findHeaderRow = (jsonData: any[]): number => {
  const commonHeaders = ['交易时间', '交易日期', '日期', '交易时间', 
                         '金额', '金额(元)', '交易金额',
                         '商户', '交易对方', '对方账号',
                         '收/支', '收支', '交易类型'];
  
  for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
    const row = jsonData[i];
    const keys = Object.keys(row);
    const matchCount = keys.filter(k => 
      commonHeaders.some(h => k.includes(h))
    ).length;
    if (matchCount >= 3) return i;
  }
  return 0;
};
```

#### 方案 3：修复"只导入 50 行"的 Bug

当前代码只保存前 50 行用于预览，但导入时也只用这 50 行。应改为：
- 预览用前 50 行
- 实际导入用全部数据

```typescript
// 新增：保存所有数据
const [allRows, setAllRows] = useState<ParsedRow[]>([]);

// 在文件解析后
setAllRows(jsonData);  // 保存全部数据
setRows(jsonData.slice(0, 50));  // 预览用前50行

// handleNextStep 中使用 allRows 生成 importRows
const mappedRows: ImportRow[] = allRows.map((row) => { ... });
```

---

## 三、问题二：大类不能自动识别

### 3.1 根因分析

#### 根因 1：商户规则库覆盖度极低

**定位文件**：`src/utils/category.ts` 第 39-46 行

默认商户规则**仅 6 条**：
```typescript
export const defaultMerchantRules: MerchantRule[] = [
  { id: '1', merchantName: '美团', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 15 },
  { id: '2', merchantName: '饿了么', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 12 },
  { id: '3', merchantName: '滴滴', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 8 },
  { id: '4', merchantName: '淘宝', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 20 },
  { id: '5', merchantName: '京东', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 10 },
  { id: '6', merchantName: '星巴克', categoryL1: 'food', categoryL2: 'food-snack', useCount: 6 },
];
```

实际账单中有成百上千个不同商户，6 条规则覆盖率不足 5%。

#### 根因 2：未利用账单自带的"交易分类"字段

支付宝和微信账单中都有**"交易分类"列**（如"餐饮美食"、"交通出行"、"购物消费"等），但当前导入系统：

- 字段映射中没有"交易分类"对应的选项
- 没有将账单分类映射到系统分类的逻辑

这是最直接、最高效的分类来源，完全浪费了。

#### 根因 3：商户匹配逻辑过于简单

**定位文件**：`src/utils/category.ts` 第 101-108 行

```typescript
export const matchCategoryByMerchant = (merchantName: string, rules: MerchantRule[]): { categoryL1: string; categoryL2: string } | null => {
  for (const rule of rules) {
    if (merchantName.includes(rule.merchantName)) {
      return { categoryL1: rule.categoryL1, categoryL2: rule.categoryL2 };
    }
  }
  return null;
};
```

问题：
- **仅支持精确包含匹配**：不支持模糊匹配、别名匹配、错别字容忍
- **没有优先级排序**：多条规则都匹配时，返回第一条而非最优匹配
- **不支持正则匹配**：无法处理"美团外卖"、"美团买菜"、"美团优选"等变体
- **没有从备注/商品说明中提取商户**：很多账单的商户信息在"商品说明"列

#### 根因 4：完全没有 AI 智能分类

项目中**没有任何 AI 相关代码**（package.json 中无相关依赖，代码中无 AI 调用逻辑）。智能分类功能完全缺失。

### 3.2 修改方案

#### 方案 1：扩充默认商户规则库

将默认规则从 6 条扩充到 **100+ 条**，覆盖主流消费场景：

```typescript
// 示例（完整列表需补充）
export const defaultMerchantRules: MerchantRule[] = [
  // 餐饮类
  { id: 'm1', merchantName: '美团', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm2', merchantName: '饿了么', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm3', merchantName: '星巴克', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm4', merchantName: '肯德基', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm5', merchantName: '麦当劳', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm6', merchantName: '瑞幸', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm7', merchantName: '喜茶', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm8', merchantName: '海底捞', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm9', merchantName: '餐厅', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm10', merchantName: '外卖', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  // ... 更多餐饮
  
  // 交通类
  { id: 't1', merchantName: '滴滴', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't2', merchantName: '地铁', categoryL1: 'transport', categoryL2: 'transport-subway', useCount: 0 },
  { id: 't3', merchantName: '公交', categoryL1: 'transport', categoryL2: 'transport-bus', useCount: 0 },
  { id: 't4', merchantName: '出租', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't5', merchantName: '高铁', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't6', merchantName: '火车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't7', merchantName: '航空', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't8', merchantName: '中石化', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't9', merchantName: '中石油', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  // ... 更多交通
  
  // 购物类
  { id: 's1', merchantName: '淘宝', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's2', merchantName: '天猫', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's3', merchantName: '京东', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's4', merchantName: '拼多多', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's5', merchantName: '超市', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's6', merchantName: '便利店', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  // ... 更多购物
  
  // 居住类
  { id: 'l1', merchantName: '房租', categoryL1: 'living', categoryL2: 'living-rent', useCount: 0 },
  { id: 'l2', merchantName: '水费', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l3', merchantName: '电费', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l4', merchantName: '燃气', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l5', merchantName: '宽带', categoryL1: 'living', categoryL2: 'living-internet', useCount: 0 },
  // ... 更多
  
  // 娱乐类
  { id: 'e1', merchantName: '电影', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  { id: 'e2', merchantName: '游戏', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e3', merchantName: '旅游', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e4', merchantName: '酒店', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  // ... 更多
  
  // 医疗类
  { id: 'med1', merchantName: '医院', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med2', merchantName: '药店', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  // ... 更多
  
  // 学习类
  { id: 'st1', merchantName: '书店', categoryL1: 'study', categoryL2: 'study-book', useCount: 0 },
  { id: 'st2', merchantName: '得到', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  // ... 更多
];
```

#### 方案 2：利用账单自带分类字段（优先级最高）

在字段映射中增加"交易分类"选项，并建立支付宝/微信分类到系统分类的映射表：

```typescript
// 新增：账单分类映射表
export const billCategoryMapping: Record<string, { categoryL1: string; categoryL2: string }> = {
  '餐饮美食': { categoryL1: 'food', categoryL2: 'food-dinner' },
  '食品饮料': { categoryL1: 'food', categoryL2: 'food-snack' },
  '交通出行': { categoryL1: 'transport', categoryL2: 'transport-taxi' },
  '购物消费': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '日用百货': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '居家生活': { categoryL1: 'living', categoryL2: 'living-rent' },
  '休闲娱乐': { categoryL1: 'entertainment', categoryL2: 'entertainment-movie' },
  '医疗健康': { categoryL1: 'medical', categoryL2: 'medical-hospital' },
  '教育学习': { categoryL1: 'study', categoryL2: 'study-course' },
  '生活服务': { categoryL1: 'other', categoryL2: 'other-gift' },
  '转账红包': { categoryL1: 'other', categoryL2: 'other-redpacket' },
  '充值缴费': { categoryL1: 'living', categoryL2: 'living-water' },
  '金融理财': { categoryL1: 'other', categoryL2: 'other-gift' },
  '其他': { categoryL1: 'other', categoryL2: 'other-gift' },
};
```

然后在 `handleNextStep` 中优先使用账单分类：

```typescript
// 优先使用账单自带的交易分类
const billCategory = row[headers.find(h => fieldMapping[h] === 'billCategory') || ''] || '';
let categoryL1 = '';
let categoryL2 = '';

// 1. 优先匹配账单分类
const mappedFromBill = billCategoryMapping[billCategory.trim()];
if (mappedFromBill) {
  categoryL1 = mappedFromBill.categoryL1;
  categoryL2 = mappedFromBill.categoryL2;
}

// 2. 其次用商户规则匹配
if (!categoryL1) {
  const matched = matchMerchant(merchant);
  if (matched) {
    categoryL1 = matched.categoryL1;
    categoryL2 = matched.categoryL2;
  }
}

// 3. 如果金额字段带负号，标记为支出（已有逻辑）
```

#### 方案 3：增强商户匹配逻辑

```typescript
export const matchCategoryByMerchant = (merchantName: string, rules: MerchantRule[]): { categoryL1: string; categoryL2: string; ruleId?: string } | null => {
  if (!merchantName || !rules.length) return null;
  
  const normalized = merchantName.trim().toLowerCase();
  let bestMatch: MerchantRule | null = null;
  let bestMatchLength = 0;
  
  for (const rule of rules) {
    const ruleName = rule.merchantName.toLowerCase();
    if (normalized.includes(ruleName)) {
      // 选择匹配关键词最长的规则（更精确）
      if (ruleName.length > bestMatchLength) {
        bestMatch = rule;
        bestMatchLength = ruleName.length;
      }
    }
  }
  
  if (bestMatch) {
    return { 
      categoryL1: bestMatch.categoryL1, 
      categoryL2: bestMatch.categoryL2,
      ruleId: bestMatch.id
    };
  }
  return null;
};
```

#### 方案 4：AI 智能分类接入建议

**当前状态**：完全缺失，需要新增。

**建议方案**：接入大模型 API 进行智能分类。设计思路：

```
┌─────────────────────────────────────────────────┐
│  分类优先级（从高到低）                            │
│  1. 用户手动选择的分类（最高优先级）                 │
│  2. 账单自带的交易分类（支付宝/微信分类字段）         │
│  3. 商户规则库精确匹配                              │
│  4. AI 智能分类（兜底方案）                         │
└─────────────────────────────────────────────────┘
```

**实现方式**：

1. **批量 AI 分类**：导入时，对未能自动分类的条目，批量调用 AI 接口
2. **流式 UI 体验**：先显示已匹配的，AI 分类结果逐步填充
3. **可配置开关**：在设置中允许用户开启/关闭 AI 分类
4. **学习用户习惯**：用户手动修正分类后，自动添加到商户规则库

**示例 API 调用伪代码**：

```typescript
const classifyWithAI = async (merchants: string[]): Promise<Record<string, { categoryL1: string; categoryL2: string }>> => {
  const prompt = `
你是一个记账分类助手。请根据商户名称判断消费分类。
可选一级分类：三餐、购物、交通、娱乐、居住、医疗、学习、其他
请为以下商户分配分类，返回 JSON 格式：

商户列表：${JSON.stringify(merchants)}

返回格式：
{
  "商户名1": {"categoryL1": "food", "categoryL2": "food-lunch"},
  "商户名2": {"categoryL1": "transport", "categoryL2": "transport-subway"}
}
`;
  
  // 调用 AI 接口
  const response = await fetch('/api/ai/classify', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  return response.json();
};
```

> **注意**：由于这是纯前端项目，AI 调用需要后端支持或使用公开 API 的前端 SDK。建议接入豆包/文心一言等支持浏览器端调用的 API。

---

## 四、问题三：项目/商户识别效果不好

### 4.1 根因分析

#### 根因 1：商户名称完全不做清洗

当前代码直接将 Excel 中的商户字段值作为商户名存储，没有任何标准化处理：

```typescript
const merchant = row[headers.find(h => fieldMapping[h] === 'merchant') || ''] || '';
```

问题：
- 支付宝商户名常带前缀/后缀，如 `美团外卖-黄焖鸡米饭`、`滴滴出行-快车订单`
- 微信商户名可能是 `(特约)美团点评`、`财付通-美团`
- 同一商户在不同账单中名称可能不同（"美团外卖" vs "美团" vs "美团点评"）

#### 根因 2：仅用单一字段识别商户

账单中通常有多个字段可能包含商户信息：
- 交易对方 / 商户名称
- 商品说明 / 商品 / 摘要
- 备注

当前只使用一个"商户"字段，丢失了其他字段中的信息。

#### 根因 3：商户识别不反馈到规则库

导入时使用了商户规则匹配，但**匹配成功后不增加使用次数**，也不会将用户手动修正的分类自动添加为新规则。规则库无法通过使用而优化。

对比：手动记账（AddRecord.tsx）中有 `incrementUseCount`，但 Excel 导入中没有。

### 4.2 修改方案

#### 方案 1：商户名称标准化清洗

```typescript
const normalizeMerchant = (raw: string): string => {
  if (!raw) return '';
  
  // 移除常见前缀
  let name = raw.trim();
  name = name.replace(/^\(特约\)/, '');
  name = name.replace(/^财付通[-_]/, '');
  name = name.replace(/^支付宝[-_]/, '');
  name = name.replace(/^微信支付[-_]/, '');
  
  // 移除订单号、金额等后缀
  name = name.replace(/[-_#]\d{8,}.*$/, '');
  name = name.replace(/订单.*$/, '');
  
  // 取主要部分（"美团外卖-黄焖鸡" → "美团外卖"）
  const parts = name.split(/[-_——]/);
  if (parts.length > 1 && parts[0].length <= 10) {
    name = parts[0];
  }
  
  return name.trim();
};
```

#### 方案 2：多字段联合识别商户

```typescript
// 从商户名、商品说明、备注中综合提取商户
const extractMerchant = (merchantField: string, noteField: string, descField: string): string => {
  const candidates = [merchantField, noteField, descField].filter(Boolean);
  
  for (const candidate of candidates) {
    const normalized = normalizeMerchant(candidate);
    if (normalized && normalized.length >= 2) {
      return normalized;
    }
  }
  
  return merchantField || '';
};
```

#### 方案 3：导入后自动更新商户规则

```typescript
const handleImport = () => {
  let success = 0;
  let failed = 0;
  const newlyMatchedRuleIds = new Set<string>();

  importRows.forEach((row) => {
    if (!row.date || !row.amount || !row.categoryL1 || !row.categoryL2) {
      failed++;
      return;
    }

    try {
      addTransaction({
        date: row.date,
        amount: parseFloat(row.amount),
        type: row.type || 'expense',
        categoryL1: row.categoryL1,
        categoryL2: row.categoryL2,
        merchant: row.merchant,
        note: row.note,
        source: 'excel',
      });
      
      // 记录匹配成功的规则，批量增加使用次数
      const matched = matchMerchant(row.merchant);
      if (matched && (matched as any).ruleId) {
        newlyMatchedRuleIds.add((matched as any).ruleId);
      }
      
      success++;
    } catch {
      failed++;
    }
  });

  // 批量更新规则使用次数
  newlyMatchedRuleIds.forEach(id => incrementUseCount(id));

  setImportResult({ success, failed });
  setStep(4);
};
```

#### 方案 4：智能提取商户 + 自动学习

当用户在导入预览页手动修改了某条记录的分类时，**自动将该商户+分类添加为新规则**：

```typescript
// 在 handleCategoryChange 中
const handleCategoryChange = (rowIndex: number, level: 'L1' | 'L2', value: string) => {
  const newRows = [...importRows];
  if (level === 'L1') {
    newRows[rowIndex].categoryL1 = value;
    newRows[rowIndex].categoryL2 = '';
  } else {
    newRows[rowIndex].categoryL2 = value;
  }
  setImportRows(newRows);
  
  // 如果用户手动设置了完整分类，且商户名非空，提示是否添加为规则
  const row = newRows[rowIndex];
  if (row.merchant && row.categoryL1 && row.categoryL2) {
    // 可以弹一个轻量提示："已记住这个商户的分类"
    // 或者在导入完成后批量询问
  }
};
```

---

## 五、字段映射问题检查

### 5.1 当前支持的映射字段

| 可选字段 | 对应数据 | 支付宝账单 | 微信账单 |
|---------|---------|-----------|---------|
| date | 日期 | ✅ 交易时间 | ✅ 交易时间 |
| amount | 金额 | ✅ 金额 | ✅ 金额(元) |
| merchant | 商户 | ✅ 交易对方 | ✅ 交易对方 |
| type | 收支类型 | ✅ 收/支 | ✅ 收/支 |
| note | 备注 | ✅ 备注 | ✅ 备注 |
| category | 分类 | ❌ 不支持 | ❌ 不支持 |
| ignore | 忽略 | - | - |

### 5.2 缺失的关键字段

| 缺失字段 | 支付宝列名 | 微信列名 | 重要性 |
|---------|-----------|---------|--------|
| 商品说明 / 交易类型 | 商品说明、交易分类 | 商品、交易类型 | ⭐⭐⭐⭐⭐ |
| 支付方式 | 收/付款方式 | 支付方式 | ⭐⭐ |
| 交易状态 | 交易状态 | 当前状态 | ⭐⭐ |

**最大问题**：缺少"交易分类"字段的支持，导致无法利用账单自带的分类信息。

### 5.3 缺少预设模板

用户每次导入都要手动映射 5+ 个字段，体验很差。应该提供：
- 支付宝账单模板
- 微信支付账单模板
- 自动识别账单类型并预填映射

---

## 六、整体改进优先级清单

### 🔴 P0 - 必须立即修复（影响核心功能）

| 序号 | 问题 | 影响 | 修改位置 |
|-----|------|------|---------|
| 1 | `formatAmount` 不处理 number 类型，导致金额解析异常/为0 | 导入失败或金额全0 | `ExcelImport.tsx` formatAmount 函数 |
| 2 | 仅导入前 50 行数据 | 账单数据丢失 | `ExcelImport.tsx` handleFileUpload/handleDrop |
| 3 | 导入成功校验用 `!row.amount`，金额为0的记录会被跳过 | 0元账单导入失败 | `ExcelImport.tsx` handleImport |

### 🟠 P1 - 严重影响体验

| 序号 | 问题 | 影响 | 修改位置 |
|-----|------|------|---------|
| 1 | 默认商户规则仅 6 条，覆盖度极低 | 自动分类几乎不可用 | `category.ts` defaultMerchantRules |
| 2 | 缺少账单头部行跳过逻辑 | 表头识别错误 | `ExcelImport.tsx` 文件解析部分 |
| 3 | 未利用账单自带的"交易分类"字段 | 浪费最准确的分类来源 | `ExcelImport.tsx` + `category.ts` |
| 4 | 商户名称不做标准化清洗 | 匹配率低 | `ExcelImport.tsx` 新增函数 |
| 5 | 商户匹配不分优先级，返回第一条命中 | 分类不够精确 | `category.ts` matchCategoryByMerchant |

### 🟡 P2 - 功能增强

| 序号 | 问题 | 建议 | 修改位置 |
|-----|------|------|---------|
| 1 | 没有 AI 智能分类 | 接入大模型 API 批量分类 | 新增 AI 分类模块 |
| 2 | 没有预设账单模板 | 增加支付宝/微信自动识别和预映射 | `ExcelImport.tsx` Step 2 |
| 3 | 手动修正分类不自动学习 | 用户改了分类后自动添加规则 | `ExcelImport.tsx` + store |
| 4 | 导入时不更新规则使用次数 | 规则库无法自我优化 | `ExcelImport.tsx` handleImport |
| 5 | 金额带千分位时解析错误 | 增强 formatAmount 正则 | `ExcelImport.tsx` formatAmount |

### 🟢 P3 - 体验优化

| 序号 | 问题 | 建议 |
|-----|------|------|
| 1 | 预览仅显示50行无说明 | 提示"仅预览前50行，实际导入全部" |
| 2 | 没有导入进度条 | 大量数据时增加进度反馈 |
| 3 | 失败记录无详情 | 展示失败的具体行和原因 |
| 4 | 不支持多 Sheet | 检测多 Sheet 并让用户选择 |
| 5 | 不支持重复导入检测 | 根据交易单号去重 |

---

## 七、修复建议顺序

1. **第一天**：修复 P0 三个 Bug（金额解析、50行限制、0元校验）
2. **第二天**：扩充商户规则库到 100+ 条 + 增加账单分类映射 + 增强匹配逻辑
3. **第三天**：增加账单头部自动检测 + 预设账单模板自动映射 + 商户名称标准化
4. **第一周**：接入 AI 智能分类（可选，需评估 API 成本）
5. **第二周**：自动学习 + 去重 + 导入优化等 P3 体验改进

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
