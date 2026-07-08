export interface AIModelConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface CategorySuggestion {
  categoryL1: string;
  categoryL2: string;
  confidence: number;
  reason: string;
}

const DEFAULT_CONFIG: AIModelConfig = {
  name: 'qwen',
  apiKey: '',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-turbo',
};

let currentConfig = { ...DEFAULT_CONFIG };

export const setAIConfig = (config: Partial<AIModelConfig>) => {
  currentConfig = { ...currentConfig, ...config };
  localStorage.setItem('aiConfig', JSON.stringify(currentConfig));
};

export const getAIConfig = (): AIModelConfig => {
  const saved = localStorage.getItem('aiConfig');
  return saved ? JSON.parse(saved) : currentConfig;
};

export const suggestCategory = async (
  merchant: string,
  note: string,
  type: 'expense' | 'income' | ''
): Promise<CategorySuggestion | null> => {
  const config = getAIConfig();
  
  if (!config.apiKey) {
    console.warn('AI API key not configured');
    return null;
  }

  const prompt = `
你是一个智能记账分类助手。请根据以下交易信息，判断最合适的收支分类。

交易信息：
- 商户/商家：${merchant}
- 商品/备注：${note}
- 收支类型：${type || '未知'}

分类体系说明：
一级分类（共7类）：
1. expense（支出）：日常消费支出
2. income（收入）：各种收入来源
3. transfer（转账）：账户间转账
4. borrow（借还）：借出、借入、还款
5. reimburse（报销）：申请报销、收到报销
6. refund（退款）：商品退款、服务退款
7. deposit（存钱）：存入储蓄、存入理财

支出分类（categoryL1=expense）：
- food（餐饮）：food-breakfast（早餐）, food-lunch（午餐）, food-dinner（晚餐）, food-snack（下午茶/零食）, food-takeout（外卖）
- shopping（购物）：shopping-clothes（服装）, shopping-daily（日用品）, shopping-electronics（数码电器）, shopping-baby（母婴用品）, shopping-stationery（书籍文具）
- transport（交通）：transport-subway（地铁）, transport-bus（公交）, transport-taxi（打车/网约车）, transport-fuel（加油/停车）, transport-travel（火车/飞机）
- accommodation（住宿）：accommodation-rent（房租）, accommodation-utility（水电燃气）, accommodation-property（物业费）, accommodation-hotel（酒店/民宿）
- study（学习）：study-book（书籍）, study-course（课程培训）, study-exam（考试费）, study-stationery（文具用品）
- social（人情娱乐）：social-gift（红包礼金）, social-party（聚会聚餐）, social-entertainment（电影演出）, social-game（游戏娱乐）
- beauty（美妆）：beauty-skincare（护肤品）, beauty-makeup（彩妆）, beauty-hair（美发美甲）
- travel（旅游）：travel-ticket（景点门票）, travel-group（旅游团费）, travel-shopping（旅游购物）
- medical（医疗）：medical-hospital（门诊挂号）, medical-drug（药品）, medical-checkup（体检）
- membership（会员）：membership-video（视频会员）, membership-music（音乐会员）, membership-fitness（健身会员）
- other-expense（其他支出）

收入分类（categoryL1=income）：
- salary（工资）：salary-monthly（月薪）, salary-bonus（奖金）
- investment（理财）：investment-fund（基金收益）, investment-stock（股票收益）, investment-deposit（存款利息）
- part-time（兼职）：part-time-freelance（自由职业）, part-time-gig（副业）
- gift-income（礼金）：gift-income-redpacket（红包收入）, gift-income-birthday（生日礼物）
- other-income（其他收入）

转账分类（categoryL1=transfer）：
- transfer-out（转出）, transfer-in（转入）

借还分类（categoryL1=borrow）：
- borrow-lend（借出）, borrow-borrow（借入）, borrow-repay（还款）

报销分类（categoryL1=reimburse）：
- reimburse-apply（申请报销）, reimburse-receive（收到报销）

退款分类（categoryL1=refund）：
- refund-product（商品退款）, refund-service（服务退款）

存钱分类（categoryL1=deposit）：
- deposit-savings（存入储蓄）, deposit-investment（存入理财）

分类判断规则：
1. 优先判断收支类型：收入、支出、转账、借还、报销、退款、存钱
2. 根据商户名称和备注判断具体场景：
   - 餐饮类：餐厅、饭店、外卖、咖啡、早餐、午餐、晚餐、零食等
   - 购物类：淘宝、京东、拼多多、超市、服装店、数码店等
   - 交通类：地铁、公交、打车、滴滴、火车、飞机、加油等
   - 住宿类：房租、水电、物业费、酒店等
   - 学习类：书籍、课程、培训、考试等
   - 人情娱乐：电影、游戏、KTV、聚会、红包等
   - 美妆类：护肤品、彩妆、美发、美甲等
   - 旅游类：景点门票、旅行社、旅游购物等
   - 医疗类：医院、药店、体检等
   - 会员类：视频会员、音乐会员、健身会员等
3. 注意区分收入和支出：工资、奖金、理财收益等是收入，消费是支出
4. 根据消费时间判断餐饮小类：早餐(6-10点)、午餐(11-14点)、晚餐(17-22点)、下午茶(14-17点)
5. 退款是指收到退款，属于收入性质但归为退款分类

请分析：
1. 根据商户名称和商品备注，判断这笔交易的实际消费项目是什么
2. 选择最合适的一级分类和二级分类
3. 给出置信度（0-1，越高越确定）
4. 简要说明理由

请严格按照以下JSON格式输出，不要包含任何额外文本：
{
  "categoryL1": "分类大类ID",
  "categoryL2": "分类小类ID",
  "confidence": 0.8,
  "reason": "分类理由"
}
`;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个专业的记账分类助手，精通各种消费场景的分类判断。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      categoryL1: result.categoryL1 || '',
      categoryL2: result.categoryL2 || '',
      confidence: result.confidence || 0.5,
      reason: result.reason || '',
    };
  } catch (error) {
    console.error('AI category suggestion failed:', error);
    return null;
  }
};

export const batchSuggestCategories = async (
  transactions: { merchant: string; note: string; type: 'expense' | 'income' | '' }[]
): Promise<(CategorySuggestion | null)[]> => {
  const results: (CategorySuggestion | null)[] = [];
  
  for (const tx of transactions) {
    const suggestion = await suggestCategory(tx.merchant, tx.note, tx.type);
    results.push(suggestion);
  }
  
  return results;
};
