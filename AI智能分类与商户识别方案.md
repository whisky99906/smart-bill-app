---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7639649258794418473-data_volume/files/所有对话/主对话/AI智能分类与商户识别方案.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 516084306544602#1783516034351
    ReservedCode2: ""
---
# AI 智能分类与商户识别方案

## 一、最新代码检查结果

> 说明：`git pull` 因网络问题失败，以下基于本地最新 commit (`66976d5 更新UI：浅蓝色主题 + lucide图标 + 圆润风格`) 进行检查。

### 1.1 P0 问题修复状态

| 问题 | 状态 | 所在位置 | 说明 |
|------|------|----------|------|
| formatAmount 类型判断 | ❌ 未修复 | `ExcelImport.tsx` 第144行 | 数字类型调用 `.match()` 会报错 |
| 50行导入限制 | ❌ 未修复 | `ExcelImport.tsx` 第47行、第63行 | `jsonData.slice(0, 50)` 仅导入50条 |
| 金额为0的校验过滤 | ❌ 未修复 | `ExcelImport.tsx` 第160行 | `!row.amount` 将 0 判定为无效 |

**详细问题分析：**

#### 问题1：formatAmount 类型错误
```tsx
// 当前代码
const formatAmount = (amountStr: string): string => {
  if (!amountStr) return '0';
  const match = amountStr.match(/[\d.]+/);  // ❌ 数字类型无 .match() 方法
  return match ? match[0] : '0';
};
```
XLSX 的 `sheet_to_json` 会将 Excel 中的数字单元格解析为 `number` 类型，直接调用 `.match()` 会抛出 `TypeError: amountStr.match is not a function`。

#### 问题2：50行导入硬限制
```tsx
// 当前代码（handleFileUpload 和 handleDrop 两处）
setRows(jsonData.slice(0, 50));  // ❌ 只保留前50行
```
`rows` 状态既用于列匹配步骤的预览，也用于最终导入。导致超过 50 行的 Excel 文件只能导入 50 条。

#### 问题3：金额为0被过滤
```tsx
// 当前代码（handleImport 中）
if (!row.date || !row.amount || !row.categoryL1 || !row.categoryL2) {
  failed++;  // ❌ amount 为 '0' 时 !'0' 为 false，实际不会被过滤
  return;
}
```
> 补充验证：`!'0'` 结果为 `false`（因为非空字符串是 truthy），所以 **金额为 0 的字符串不会被过滤**。但如果 amount 是数字 0（因 formatAmount 未做类型转换导致），则 `!0` 为 `true`，会被错误过滤。这是问题1的连锁反应。

---

### 1.2 其他发现的问题

#### 问题4：字段映射验证逻辑错误（P1）
```tsx
// 当前代码
disabled={!fieldMapping.date || !fieldMapping.amount || !fieldMapping.merchant}
```
`fieldMapping` 的类型是 `Record<string, FieldType>`，**键是表头名称，值是字段类型**。上述代码在检查是否存在名为 `'date'` 的键，而非检查是否有表头映射到了 `'date'` 类型。这会导致"下一步"按钮可能永远无法启用（除非表头恰好叫 date/amount/merchant）。

#### 问题5：预览数据与导入数据混用（P1）
`rows` 状态同时承担了"步骤2的表头匹配预览"和"步骤3的全部待导入数据"两个职责。如果想保留 50 行预览但导入全部数据，需要拆分状态。

#### 问题6：收支类型判断过于简单（P2）
```tsx
type: (type.includes('收入') || type.includes('+')) ? 'income' : 
      (type.includes('支出') || type.includes('-')) ? 'expense' : '',
```
- 未考虑通过金额正负号判断收支
- 未考虑中文/英文混合的各种表述
- 空值时默认 expense 可能造成误判

#### 问题7：日期解析失败静默降级为当天（P2）
`formatDate` 解析失败时返回当前日期，可能导致错误数据被导入而用户无感知。

#### 问题8：商户简称字段缺失（P2）
`Transaction` 类型和 `MerchantRule` 中均无 `merchantShortName` 字段，无法存储商户简称。

---

## 二、AI 智能识别完整技术方案

### 2.1 技术选型

| 项目 | 选型 | 说明 |
|------|------|------|
| 大模型 | 通义千问 qwen-turbo | 成本低、速度快、中文能力强，适合分类和提取任务 |
| 接入方式 | 阿里云百炼平台 OpenAI 兼容 API | 无需额外 SDK，直接用 fetch 调用 |
| 调用模式 | 批量 + 并发控制 | 未命中规则的记录批量调用，控制并发数 |
| 缓存策略 | 商户名 + 描述 → 结果的内存缓存 | 相同商户名直接复用上一次结果 |

### 2.2 成本控制策略

```
规则库命中（0成本） → 缓存命中（0成本） → AI 调用（有成本）
```

1. **优先规则库**：先查商户规则库，命中则直接使用，不调用 AI
2. **内存缓存**：同一次导入会话中，相同商户名的记录复用 AI 结果
3. **去重调用**：提取所有未命中规则的唯一商户名，批量调用一次，而非每条都调
4. **置信度阈值**：低置信度结果标记为待确认，不自动入库
5. **主动学习**：用户确认/修改后自动更新规则库，越用越准

### 2.3 批量处理策略

- **并发控制**：最大 3 并发，避免触发 API 限流
- **错误重试**：指数退避，最多重试 2 次
- **超时处理**：单条请求超时 15s，超时则标记为待人工处理
- **进度反馈**：实时显示 AI 处理进度（已处理/总数）

---

## 三、Prompt 设计

### 3.1 System Prompt

```
你是一个专业的个人账单分类助手，擅长从交易记录中提取关键信息并进行准确分类。

## 任务
根据用户提供的交易记录（商户名称、交易描述、金额等），完成以下任务：
1. 智能分类：判断该笔交易的大类和小类
2. 商户简称：从冗长的商户名称中提取最核心的简称

## 分类体系（必须严格从此列表中选择，不得自创）

### 三餐 food
- 早餐 food-breakfast
- 午餐 food-lunch  
- 晚餐 food-dinner
- 零食 food-snack

### 购物 shopping
- 服装 shopping-clothes
- 日用品 shopping-daily
- 数码 shopping-electronics
- 美妆 shopping-beauty

### 交通 transport
- 公交 transport-bus
- 地铁 transport-subway
- 打车 transport-taxi
- 加油 transport-fuel

### 娱乐 entertainment
- 电影 entertainment-movie
- 游戏 entertainment-game
- 旅行 entertainment-travel
- 运动 entertainment-sport

### 居住 living
- 房租 living-rent
- 水电 living-water
- 网费 living-internet

### 医疗 medical
- 看病 medical-hospital
- 买药 medical-drug

### 学习 study
- 书籍 study-book
- 课程 study-course

### 其他 other
- 礼物 other-gift
- 红包 other-redpacket

## 商户简称提取规则
1. 去掉机构全称中的"xx大学/xx公司/xx集团/xx服务中心/xx后勤保障部"等前缀后缀
2. 保留最核心的消费内容或品牌名
3. 优先提取用户可识别的具体名称
4. 长度控制在 2-8 个字
5. 示例：
   - "中南财经政法大学xx服务中心后勤保障部接水服务" → "接水"
   - "美团外卖-黄焖鸡米饭" → "黄焖鸡米饭"
   - "支付宝-滴滴出行科技有限公司" → "滴滴"
   - "星巴克咖啡（武汉）有限公司光谷店" → "星巴克"

## 输出格式
严格输出 JSON，不要有任何额外文字：
{
  "category": "大类ID",
  "subCategory": "小类ID",
  "merchantShortName": "商户简称",
  "confidence": 0.95,
  "reason": "分类理由简述"
}

## 注意事项
- 收入类交易统一归为 other / other-redpacket
- 分类不确定时 confidence 降低，并在 reason 中说明
- 商户名已经很简洁的，直接返回原名
```

### 3.2 输入字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| merchant | string | 商户名称（必填） |
| description | string | 交易描述/备注（可选） |
| amount | number | 交易金额（可选，辅助判断） |
| type | string | 收支类型（可选，income/expense） |

### 3.3 输出 JSON 结构

```typescript
interface AiClassifyResult {
  category: string;           // 大类 ID，如 'food'
  subCategory: string;        // 小类 ID，如 'food-lunch'
  merchantShortName: string;  // 商户简称
  confidence: number;         // 置信度 0-1
  reason: string;             // 分类理由（用于调试/展示）
}
```

---

## 四、处理流程设计

### 4.1 完整流程图

```
Excel 导入
    │
    ▼
解析 Excel 数据（全部行，取消 50 行限制）
    │
    ▼
字段映射确认（用户选择各列对应字段）
    │
    ▼
┌─────────────────────────────────────────┐
│          逐条预处理记录                   │
│  1. 格式化日期、金额、类型                │
│  2. 商户规则库匹配 → 命中则直接填充分类    │
│  3. 未命中 → 加入待 AI 处理列表           │
└─────────────────────────────────────────┘
    │
    ▼
  有待 AI 处理的记录？
    │
    ├─ 否 → 直接进入分类确认页面
    │
    └─ 是 → 提取唯一商户名，去重
              │
              ▼
        ┌───────────────────┐
        │  内存缓存匹配      │  ← 同一会话内已处理过的直接复用
        └───────────────────┘
              │
              ▼
        还有未命中缓存的？
              │
              ├─ 否 → 合并结果，进入确认页
              │
              └─ 是 → 批量调用 AI（并发控制+重试）
                        │
                        ▼
                  合并 AI 结果
                        │
                        ▼
                  进入分类确认页面
                        │
                        ▼
        ┌──────────────────────────────┐
        │  用户确认/修改分类和商户简称    │
        │  - 高置信度自动勾选确认        │
        │  - 低置信度标红提醒            │
        └──────────────────────────────┘
                        │
                        ▼
                  确认导入
                        │
                        ▼
        ┌──────────────────────────────┐
        │  自动学习更新规则库             │
        │  1. 用户修改过的 → 更新/新增规则 │
        │  2. AI 高置信度确认的 → 新增规则 │
        │  3. 规则使用次数累加            │
        └──────────────────────────────┘
```

### 4.2 关键设计决策

1. **去重优先**：同一商户名在一次导入中只调用一次 AI，显著降低成本
2. **渐进式确认**：高置信度（≥0.85）自动确认，低置信度标红待人工审核
3. **学习闭环**：用户每次修改都是一次训练数据，规则库持续增长
4. **可降级**：AI 服务不可用时退化为纯规则库 + 手动分类模式

---

## 五、核心代码实现

### 5.1 `src/services/aiService.ts`（AI 服务封装）

```typescript
/**
 * AI 智能分类服务
 * 使用 OpenAI 兼容格式调用阿里云百炼平台的 qwen-turbo 模型
 */

import { AI_CLASSIFY_PROMPT } from '@/utils/prompts';

export interface AiClassifyRequest {
  merchant: string;
  description?: string;
  amount?: number;
  type?: 'income' | 'expense';
}

export interface AiClassifyResult {
  category: string;
  subCategory: string;
  merchantShortName: string;
  confidence: number;
  reason: string;
}

interface AiServiceConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxConcurrency: number;
  maxRetries: number;
  timeout: number;
}

const DEFAULT_CONFIG: AiServiceConfig = {
  apiKey: '', // 从设置中读取
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-turbo',
  maxConcurrency: 3,
  maxRetries: 2,
  timeout: 15000,
};

// 内存缓存：商户名 -> 结果
const classifyCache = new Map<string, AiClassifyResult>();

// 运行时配置
let runtimeConfig: Partial<AiServiceConfig> = {};

export const setAiConfig = (config: Partial<AiServiceConfig>) => {
  runtimeConfig = { ...runtimeConfig, ...config };
};

const getConfig = (): AiServiceConfig => {
  const storedKey = localStorage.getItem('aiApiKey') || '';
  return { ...DEFAULT_CONFIG, ...runtimeConfig, apiKey: runtimeConfig.apiKey || storedKey };
};

/**
 * 检查 AI 服务是否可用（是否配置了 API Key）
 */
export const isAiAvailable = (): boolean => {
  return !!getConfig().apiKey;
};

/**
 * 清空分类缓存
 */
export const clearClassifyCache = () => {
  classifyCache.clear();
};

/**
 * 单条记录分类调用
 */
const classifySingle = async (
  request: AiClassifyRequest,
  config: AiServiceConfig
): Promise<AiClassifyResult> => {
  const { apiKey, baseUrl, model, timeout } = config;

  const userMessage = JSON.stringify({
    merchant: request.merchant,
    description: request.description || '',
    amount: request.amount,
    type: request.type || 'expense',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: AI_CLASSIFY_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API 返回内容为空');
    }

    const result = JSON.parse(content);
    return validateResult(result);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * 校验并修正 AI 返回结果
 */
const validateResult = (result: any): AiClassifyResult => {
  const validCategories = [
    'food', 'shopping', 'transport', 'entertainment',
    'living', 'medical', 'study', 'other',
  ];

  let category = result.category || 'other';
  let subCategory = result.subCategory || 'other-gift';

  // 校验大类合法性
  if (!validCategories.includes(category)) {
    category = 'other';
    subCategory = 'other-gift';
  }

  // 校验置信度范围
  const confidence = Math.min(1, Math.max(0, result.confidence ?? 0.5));

  // 商户简称兜底
  const merchantShortName = result.merchantShortName?.trim() || '';

  return {
    category,
    subCategory,
    merchantShortName: merchantShortName.slice(0, 20), // 最长20字
    confidence,
    reason: result.reason || '',
  };
};

/**
 * 带重试的单条分类
 */
const classifyWithRetry = async (
  request: AiClassifyRequest,
  config: AiServiceConfig
): Promise<AiClassifyResult> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await classifySingle(request, config);
    } catch (error) {
      lastError = error as Error;
      if (attempt < config.maxRetries) {
        // 指数退避：500ms, 1000ms
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 全部重试失败，返回兜底结果
  return {
    category: 'other',
    subCategory: 'other-gift',
    merchantShortName: request.merchant.slice(0, 10),
    confidence: 0,
    reason: `AI 调用失败: ${lastError?.message}`,
  };
};

/**
 * 并发控制的 Promise 池
 */
const promisePool = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await processor(items[currentIndex]);
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
};

export interface BatchClassifyProgress {
  processed: number;
  total: number;
  currentMerchant?: string;
}

export type ProgressCallback = (progress: BatchClassifyProgress) => void;

/**
 * 批量分类（去重 + 缓存 + 并发控制）
 * 
 * 优化策略：
 * 1. 先按商户名去重，相同商户只调用一次 AI
 * 2. 检查内存缓存
 * 3. 并发控制调用剩余的
 */
export const batchClassify = async (
  requests: AiClassifyRequest[],
  onProgress?: ProgressCallback
): Promise<AiClassifyResult[]> => {
  const config = getConfig();

  if (!config.apiKey) {
    // 未配置 API Key，返回兜底结果
    return requests.map(req => ({
      category: 'other',
      subCategory: 'other-gift',
      merchantShortName: req.merchant.slice(0, 10),
      confidence: 0,
      reason: '未配置 AI API Key',
    }));
  }

  const total = requests.length;
  let processed = 0;

  // 结果映射表：按商户名存储结果
  const resultMap = new Map<string, AiClassifyResult>();

  // 步骤1：收集所有唯一商户名
  const uniqueMerchants = new Map<string, AiClassifyRequest>();
  requests.forEach(req => {
    const key = req.merchant + '|' + (req.description || '');
    if (!uniqueMerchants.has(key)) {
      uniqueMerchants.set(key, req);
    }
  });

  // 步骤2：检查缓存，分离已缓存和未缓存的
  const toProcess: { key: string; request: AiClassifyRequest }[] = [];
  uniqueMerchants.forEach((request, key) => {
    const cached = classifyCache.get(key);
    if (cached) {
      resultMap.set(key, cached);
      // 缓存命中也算处理进度
      processed++;
    } else {
      toProcess.push({ key, request });
    }
  });

  // 报告初始进度
  onProgress?.({ processed, total });

  // 步骤3：并发处理未缓存的
  if (toProcess.length > 0) {
    await promisePool(
      toProcess,
      async ({ key, request }) => {
        const result = await classifyWithRetry(request, config);
        resultMap.set(key, result);
        classifyCache.set(key, result); // 写入缓存
        processed++;
        onProgress?.({
          processed,
          total,
          currentMerchant: request.merchant,
        });
      },
      config.maxConcurrency
    );
  }

  // 步骤4：按原始顺序组装结果
  return requests.map(req => {
    const key = req.merchant + '|' + (req.description || '');
    return resultMap.get(key) || {
      category: 'other',
      subCategory: 'other-gift',
      merchantShortName: req.merchant.slice(0, 10),
      confidence: 0,
      reason: '分类失败',
    };
  });
};

/**
 * 商户名称智能简化（规则兜底 + AI）
 * 优先使用规则提取，无法提取时调用 AI
 */
export const simplifyMerchantName = (merchantName: string): string => {
  // 规则1：去除常见前缀
  const prefixPatterns = [
    /^(支付宝|微信支付|银联)-?/,
    /^(美团外卖|饿了么)-/,
    /^.*?(大学|公司|集团|有限公司|股份有限公司|科技有限公司|服务中心|后勤保障部|管理处|营业部|分店|门店)[^]*?/,
  ];

  let result = merchantName;

  // 提取分隔符后的内容（常见模式）
  const dashMatch = merchantName.match(/[-–—]([^-–—]+)$/);
  if (dashMatch && dashMatch[1].length <= 10) {
    result = dashMatch[1].trim();
  }

  // 去除括号及内容
  result = result.replace(/[（(][^)）]*[)）]/g, '').trim();

  // 去除常见后缀
  result = result.replace(/(有限公司|集团|股份公司|科技|发展)$/g, '').trim();

  return result || merchantName.slice(0, 10);
};
```

### 5.2 `src/utils/prompts.ts`（Prompt 模板）

```typescript
/**
 * AI Prompt 模板集合
 */

export const AI_CLASSIFY_PROMPT = `你是一个专业的个人账单分类助手，擅长从交易记录中提取关键信息并进行准确分类。

## 任务
根据用户提供的交易记录（商户名称、交易描述、金额等），完成以下任务：
1. 智能分类：判断该笔交易的大类和小类
2. 商户简称：从冗长的商户名称中提取最核心的简称

## 分类体系（必须严格从此列表中选择，不得自创）

### 三餐 food
- 早餐 food-breakfast
- 午餐 food-lunch  
- 晚餐 food-dinner
- 零食 food-snack

### 购物 shopping
- 服装 shopping-clothes
- 日用品 shopping-daily
- 数码 shopping-electronics
- 美妆 shopping-beauty

### 交通 transport
- 公交 transport-bus
- 地铁 transport-subway
- 打车 transport-taxi
- 加油 transport-fuel

### 娱乐 entertainment
- 电影 entertainment-movie
- 游戏 entertainment-game
- 旅行 entertainment-travel
- 运动 entertainment-sport

### 居住 living
- 房租 living-rent
- 水电 living-water
- 网费 living-internet

### 医疗 medical
- 看病 medical-hospital
- 买药 medical-drug

### 学习 study
- 书籍 study-book
- 课程 study-course

### 其他 other
- 礼物 other-gift
- 红包 other-redpacket

## 商户简称提取规则
1. 去掉机构全称中的"xx大学/xx公司/xx集团/xx服务中心/xx后勤保障部"等前缀后缀
2. 保留最核心的消费内容或品牌名
3. 优先提取用户可识别的具体名称
4. 长度控制在 2-8 个字
5. 示例：
   - "中南财经政法大学xx服务中心后勤保障部接水服务" → "接水"
   - "美团外卖-黄焖鸡米饭" → "黄焖鸡米饭"
   - "支付宝-滴滴出行科技有限公司" → "滴滴"
   - "星巴克咖啡（武汉）有限公司光谷店" → "星巴克"
   - "中国铁路网络有限公司12306" → "12306"
   - "学校食堂-一楼窗口3" → "食堂"

## 分类判断提示
- 早 6-9 点的餐饮倾向早餐，11-13 点倾向午餐，17-20 点倾向晚餐
- 金额和描述是重要参考
- 平台型商户（美团、饿了么）要看具体消费内容
- 不确定时给低置信度，不要强行分类

## 输出格式
严格输出 JSON 对象，不要有任何额外文字、标记或解释：
{
  "category": "大类ID",
  "subCategory": "小类ID",
  "merchantShortName": "商户简称",
  "confidence": 0.95,
  "reason": "分类理由简述"
}

## 注意事项
- 收入类交易统一归为 other / other-redpacket
- 分类不确定时 confidence 降低，并在 reason 中说明
- 商户名已经很简洁的（2-6字），直接返回原名
- reason 字段用一句话说明分类依据，不要超过 30 字
- 所有字段都必须存在，不能为空`;
```

---

## 六、集成到现有导入流程的步骤

### 6.1 数据模型更新

#### 更新 `src/types/index.ts`

```typescript
// 在 MerchantRule 中新增 merchantShortName
export interface MerchantRule {
  id: string;
  merchantName: string;
  merchantShortName?: string;  // 新增：商户简称
  categoryL1: string;
  categoryL2: string;
  useCount: number;
}

// 在 Transaction 中新增 merchantShortName
export interface Transaction {
  // ... 现有字段
  merchantShortName?: string;  // 新增：商户简称
}
```

#### 更新 ImportRow 类型（ExcelImport.tsx 内）

```typescript
interface ImportRow {
  original: ParsedRow;
  date: string;
  amount: string;
  merchant: string;
  merchantShortName: string;  // 新增
  type: 'expense' | 'income' | '';
  note: string;
  categoryL1: string;
  categoryL2: string;
  aiConfidence?: number;      // 新增：AI 置信度
  aiReason?: string;          // 新增：AI 分类理由
  source: 'rule' | 'ai' | 'manual';  // 新增：分类来源
}
```

### 6.2 商户规则库 Store 更新

#### `src/store/useStore.ts` 中 MerchantRuleStore 新增方法

```typescript
interface MerchantRuleStore {
  // ... 现有方法
  matchMerchant: (merchantName: string) => { 
    categoryL1: string; 
    categoryL2: string;
    merchantShortName?: string;
    ruleId?: string;
  } | null;
  learnFromUser: (merchantName: string, categoryL1: string, categoryL2: string, merchantShortName?: string) => void;
}

// 实现 learnFromUser
learnFromUser: (merchantName, categoryL1, categoryL2, merchantShortName) => {
  const existing = get().rules.find(r => merchantName.includes(r.merchantName));
  if (existing) {
    // 更新已有规则
    updateRule(existing.id, { categoryL1, categoryL2, merchantShortName });
  } else {
    // 新增规则（使用完整商户名，后续可优化为关键词提取）
    addRule({ merchantName, categoryL1, categoryL2, merchantShortName });
  }
},
```

同时更新 `category.ts` 中的 `matchCategoryByMerchant` 返回 merchantShortName。

### 6.3 ExcelImport.tsx 改造要点

#### 1. 修复 P0 问题

```tsx
// 修复 formatAmount 类型问题
const formatAmount = (value: string | number): string => {
  if (value === null || value === undefined || value === '') return '0';
  // 数字类型直接转字符串
  if (typeof value === 'number') {
    return value.toString();
  }
  const match = value.match(/[\d.]+/);
  return match ? match[0] : '0';
};

// 修复 50 行限制：拆分为预览数据和全量数据
const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
const [allRows, setAllRows] = useState<ParsedRow[]>([]);

// 读取文件时
const allData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
setAllRows(allData);
setPreviewRows(allData.slice(0, 50)); // 预览只显示50行

// 修复金额为0的校验
if (!row.date || row.amount === '' || !row.categoryL1 || !row.categoryL2) {
```

#### 2. 字段映射验证修复

```tsx
// 修复：检查是否有表头映射到了指定类型
const hasMapping = (type: FieldType): boolean => {
  return Object.values(fieldMapping).includes(type);
};

// 按钮 disabled
disabled={!hasMapping('date') || !hasMapping('amount') || !hasMapping('merchant')}
```

#### 3. AI 处理集成（在 handleNextStep 中）

```tsx
import { batchClassify, isAiAvailable, clearClassifyCache, type AiClassifyRequest } from '@/services/aiService';

// 新增状态
const [aiProcessing, setAiProcessing] = useState(false);
const [aiProgress, setAiProgress] = useState({ processed: 0, total: 0 });

const handleNextStep = async () => {
  // 先用全量数据 rows (allRows)
  const mappedRows: ImportRow[] = allRows.map((row) => {
    // ... 现有映射逻辑
    
    // 先查规则库
    const matched = matchMerchant(merchant);
    if (matched) {
      return {
        // ... 其他字段
        categoryL1: matched.categoryL1,
        categoryL2: matched.categoryL2,
        merchantShortName: matched.merchantShortName || simplifyMerchantName(merchant),
        source: 'rule' as const,
      };
    }
    
    return {
      // ... 其他字段
      categoryL1: '',
      categoryL2: '',
      merchantShortName: simplifyMerchantName(merchant),
      source: 'manual' as const,
    };
  });

  // 收集未命中规则的记录，准备 AI 处理
  const unmatchedRows = mappedRows.filter(r => r.source === 'manual');
  
  if (isAiAvailable() && unmatchedRows.length > 0) {
    setAiProcessing(true);
    clearClassifyCache(); // 每次导入清空缓存（可选策略）
    
    const aiRequests: AiClassifyRequest[] = unmatchedRows.map(r => ({
      merchant: r.merchant,
      description: r.note,
      amount: parseFloat(r.amount),
      type: r.type || 'expense',
    }));
    
    const aiResults = await batchClassify(aiRequests, (progress) => {
      setAiProgress(progress);
    });
    
    // 将 AI 结果合并回 mappedRows
    let aiIndex = 0;
    mappedRows.forEach((row) => {
      if (row.source === 'manual') {
        const result = aiResults[aiIndex++];
        if (result.confidence >= 0.3) { // 有一定置信度就填充
          row.categoryL1 = result.category;
          row.categoryL2 = result.subCategory;
          row.merchantShortName = result.merchantShortName;
          row.aiConfidence = result.confidence;
          row.aiReason = result.reason;
          row.source = 'ai';
        }
      }
    });
    
    setAiProcessing(false);
  }

  setImportRows(mappedRows);
  setStep(3);
};
```

#### 4. 导入时的学习更新

```tsx
const handleImport = () => {
  let success = 0;
  let failed = 0;
  const rulesToLearn: Array<{ merchant: string; categoryL1: string; categoryL2: string; shortName: string }> = [];

  importRows.forEach((row) => {
    if (!row.date || row.amount === '' || !row.categoryL1 || !row.categoryL2) {
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
        merchantShortName: row.merchantShortName,
        note: row.note,
        source: 'excel',
      });
      success++;
      
      // 用户手动修改过的 AI 结果或规则未命中的，加入学习列表
      if (row.source === 'ai' && row.aiConfidence && row.aiConfidence >= 0.85) {
        rulesToLearn.push({
          merchant: row.merchant,
          categoryL1: row.categoryL1,
          categoryL2: row.categoryL2,
          shortName: row.merchantShortName,
        });
      }
    } catch {
      failed++;
    }
  });

  // 批量学习更新规则库（去重）
  const learnFromUser = useMerchantRuleStore.getState().learnFromUser;
  const learned = new Set<string>();
  rulesToLearn.forEach(rule => {
    if (!learned.has(rule.merchant)) {
      learned.add(rule.merchant);
      learnFromUser(rule.merchant, rule.categoryL1, rule.categoryL2, rule.shortName);
    }
  });

  setImportResult({ success, failed });
  setStep(4);
};
```

### 6.4 设置页面新增 AI 配置

在 `Settings.tsx` 中新增 AI 配置入口：
- API Key 输入框（加密存储）
- 模型选择（qwen-turbo / qwen-plus）
- 开关：是否启用 AI 智能分类
- 置信度阈值设置

### 6.5 分类确认页 UI 增强

在步骤 3 的每条记录上：
- 显示置信度标签（高/中/低，用颜色区分）
- 显示分类来源图标（规则/AI/手动）
- 商户简称可编辑（输入框）
- 低置信度记录默认展开，方便用户检查
- 批量操作：全选确认、批量修改分类

---

## 七、实施阶段划分

### 第一阶段：P0  Bug 修复（1-2天）
- [ ] 修复 formatAmount 类型判断
- [ ] 修复 50 行导入限制（拆分预览和全量）
- [ ] 修复字段映射验证逻辑
- [ ] 修复金额为 0 的校验

### 第二阶段：数据模型 + AI 服务基础（2-3天）
- [ ] 新增 Transaction 和 MerchantRule 的 merchantShortName 字段
- [ ] 创建 aiService.ts（含批量调用、缓存、重试）
- [ ] 创建 prompts.ts
- [ ] 设置页面新增 API Key 配置

### 第三阶段：导入流程集成（2-3天）
- [ ] ExcelImport 集成 AI 分类流程
- [ ] 进度条和状态提示
- [ ] 商户简称显示和编辑
- [ ] 置信度可视化

### 第四阶段：学习闭环 + 优化（2天）
- [ ] 规则库自动学习更新
- [ ] 分类来源追踪
- [ ] 低置信度提醒机制
- [ ] 性能优化和边界情况处理

---

## 八、成本估算

以 qwen-turbo 价格为例（约 0.008 元/千 tokens）：

| 场景 | 每次导入 AI 调用次数 | 每次调用 token 数 | 单次成本 | 月度成本（10次导入/月） |
|------|---------------------|-------------------|----------|-------------------------|
| 100 条记录，50个唯一商户 | ~25 次（规则命中50%） | ~500 tokens | ~0.01 元 | ~0.1 元 |
| 500 条记录，200个唯一商户 | ~100 次（规则命中50%） | ~500 tokens | ~0.04 元 | ~0.4 元 |
| 1000 条记录，300个唯一商户 | ~150 次（规则命中50%） | ~500 tokens | ~0.06 元 | ~0.6 元 |

> 随着规则库增长，AI 调用次数会逐渐减少，长期成本趋近于零。qwen-turbo 对于个人记账场景几乎可以忽略成本。

---

## 九、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| API Key 泄漏 | 经济损失 | 本地存储不明文，只在用户设备上；支持自定义 API endpoint |
| AI 分类错误 | 数据质量 | 置信度标记 + 用户确认 + 学习修正 |
| API 限流/不可用 | 导入失败 | 自动降级为手动分类模式，不阻塞导入流程 |
| 隐私顾虑 | 用户信任 | 明确告知哪些数据会发送给 AI，提供开关控制 |
| 首次导入规则少 | AI 调用多 | 预置常见商户规则库（如 Top 100 商户） |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
