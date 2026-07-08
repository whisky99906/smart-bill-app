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
  apiKey: 'sk-ws-H.EMLYLLM.qs74.MEUCIQCtaiRZZIjsg-3c8RyGytu3PGs_Ou-b3GGXku67ReEy7wIgFrB8pOyLWMHJyiYRZlrdy8uoP-gdQHdJKqvbB5U07_8',
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

可用的支出分类（categoryL1 -> categoryL2）：
- food（餐饮）：food-breakfast（早餐）, food-lunch（午餐）, food-dinner（晚餐）, food-snack（零食）
- shopping（购物）：shopping-clothes（服装）, shopping-daily（日用品）, shopping-electronics（数码）, shopping-beauty（美妆）
- transport（交通）：transport-bus（公交）, transport-subway（地铁）, transport-taxi（打车）, transport-fuel（加油）
- entertainment（娱乐）：entertainment-movie（电影）, entertainment-game（游戏）, entertainment-travel（旅行）, entertainment-sport（运动）
- living（居住）：living-rent（房租）, living-water（水电）, living-internet（网费）
- medical（医疗）：medical-hospital（看病）, medical-drug（买药）
- study（学习）：study-book（书籍）, study-course（课程）
- other-expense（其他支出）：other-expense-gift（礼物）, other-expense-redpacket（红包）

可用的收入分类（categoryL1 -> categoryL2）：
- salary（工资）：salary-monthly（月薪）, salary-bonus（奖金）
- investment（理财）：investment-fund（基金收益）, investment-stock（股票收益）, investment-deposit（存款利息）
- part-time（兼职）：part-time-freelance（自由职业）, part-time-gig（副业）
- gift-income（礼金）：gift-income-redpacket（红包收入）, gift-income-birthday（生日礼物）
- other-income（其他收入）：other-income-refund（退款）, other-income-unknown（其他收入）

请分析：
1. 根据商户名称和商品备注，判断这笔交易的实际消费项目是什么（如"美团外卖"->餐饮，"滴滴出行"->交通）
2. 选择最合适的分类
3. 给出置信度（0-1）
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