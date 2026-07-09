import { AI_CLASSIFY_PROMPT } from '@/utils/prompts';

export interface AiClassifyRequest {
  merchant: string;
  description?: string;
  amount?: number;
  type?: 'expense' | 'income';
}

export interface AiClassifyResult {
  type: 'expense' | 'income';
  category: string;
  subCategory: string;
  merchantShortName: string;
  confidence: number;
  reason: string;
}

export interface AIModelConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
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
  apiKey: '',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-turbo',
  maxConcurrency: 3,
  maxRetries: 2,
  timeout: 15000,
};

const keywordRules: Array<{
  keywords: string[];
  type: 'expense' | 'income';
  category: string;
  subCategory: string;
  reason: string;
}> = [
  { keywords: ['美团', '饿了么', '外卖', '订餐'], type: 'expense', category: 'food', subCategory: 'food-meals', reason: '外卖平台消费' },
  { keywords: ['微信支付', '支付宝'], type: 'expense', category: 'food', subCategory: 'food-meals', reason: '移动支付消费' },
  { keywords: ['食堂', '餐厅', '饭店', '餐馆', '小吃', '早餐', '午餐', '晚餐'], type: 'expense', category: 'food', subCategory: 'food-meals', reason: '餐饮消费' },
  { keywords: ['奶茶', '咖啡', '星巴克', '瑞幸', '喜茶', '奈雪'], type: 'expense', category: 'food', subCategory: 'food-milktea', reason: '饮品消费' },
  { keywords: ['零食', '超市', '便利店', '7-11', '全家'], type: 'expense', category: 'food', subCategory: 'food-snack', reason: '零食购物' },
  { keywords: ['水果'], type: 'expense', category: 'food', subCategory: 'food-fruit', reason: '水果消费' },
  { keywords: ['牛奶'], type: 'expense', category: 'food', subCategory: 'food-milk', reason: '牛奶消费' },
  { keywords: ['聚餐'], type: 'expense', category: 'food', subCategory: 'food-dinner', reason: '聚餐消费' },
  
  { keywords: ['淘宝', '天猫', '京东', '拼多多', '唯品会', '抖音商城', '快手小店'], type: 'expense', category: 'shopping', subCategory: 'shopping-daily', reason: '电商购物' },
  { keywords: ['服饰', '衣服', '鞋子', '包包', '鞋服'], type: 'expense', category: 'shopping', subCategory: 'shopping-clothes', reason: '服装购物' },
  { keywords: ['手机', '电脑', '数码', '电器'], type: 'expense', category: 'shopping', subCategory: 'shopping-electronics', reason: '数码电器' },
  { keywords: ['厨房'], type: 'expense', category: 'shopping', subCategory: 'shopping-kitchen', reason: '厨房用品' },
  { keywords: ['物料'], type: 'expense', category: 'shopping', subCategory: 'shopping-material', reason: '物料采购' },
  
  { keywords: ['地铁', '公交', '滴滴', '打车', '出租车', '网约车'], type: 'expense', category: 'transport', subCategory: 'transport-taxi', reason: '交通出行' },
  { keywords: ['飞机', '机票', '高铁', '火车票', '火车'], type: 'expense', category: 'transport', subCategory: 'transport-train', reason: '长途出行' },
  { keywords: ['加油', '停车'], type: 'expense', category: 'transport', subCategory: 'transport-fuel', reason: '车辆费用' },
  { keywords: ['共享单车', '青桔', '哈啰'], type: 'expense', category: 'transport', subCategory: 'transport-bike', reason: '共享单车' },
  { keywords: ['大巴'], type: 'expense', category: 'transport', subCategory: 'transport-bus', reason: '大巴出行' },
  
  { keywords: ['房租', '租金'], type: 'expense', category: 'accommodation', subCategory: 'accommodation-rent', reason: '房租支出' },
  { keywords: ['水电', '物业', '电费', '水费'], type: 'expense', category: 'accommodation', subCategory: 'accommodation-utility', reason: '物业水电' },
  { keywords: ['维修'], type: 'expense', category: 'accommodation', subCategory: 'accommodation-repair', reason: '维修费用' },
  
  { keywords: ['快递', '顺丰', '中通', '圆通', '韵达'], type: 'expense', category: 'daily', subCategory: 'daily-express', reason: '快递费用' },
  { keywords: ['理发', '美发'], type: 'expense', category: 'daily', subCategory: 'daily-haircut', reason: '理发消费' },
  
  { keywords: ['网课', '课程', '培训', '考试', '书籍', '资料', '教材'], type: 'expense', category: 'study', subCategory: 'study-online', reason: '学习支出' },
  { keywords: ['比赛'], type: 'expense', category: 'study', subCategory: 'study-competition', reason: '比赛费用' },
  
  { keywords: ['红包', '转账', '送礼', '请客', '孝心', '亲密付'], type: 'expense', category: 'social', subCategory: 'social-redpacket', reason: '人情往来' },
  
  { keywords: ['电影', '游戏', '演唱会', 'KTV', '健身', '约会'], type: 'expense', category: 'entertainment', subCategory: 'entertainment-movie', reason: '娱乐消费' },
  { keywords: ['休闲'], type: 'expense', category: 'entertainment', subCategory: 'entertainment-leisure', reason: '休闲娱乐' },
  
  { keywords: ['化妆品', '护肤品', '面膜', '洗面奶', '护理', '美妆'], type: 'expense', category: 'beauty', subCategory: 'beauty-cosmetics', reason: '美妆消费' },
  
  { keywords: ['旅游', '景点', '门票', '酒店', '团费', '伴手礼'], type: 'expense', category: 'travel', subCategory: 'travel-ticket', reason: '旅游支出' },
  
  { keywords: ['医院', '药品', '医疗', '就诊', '体检', '保健'], type: 'expense', category: 'medical', subCategory: 'medical-consult', reason: '医疗支出' },
  
  { keywords: ['会员', '视频', '音乐', '话费', '宽带'], type: 'expense', category: 'membership', subCategory: 'membership-video', reason: '会员/通讯费用' },
  
  { keywords: ['工资', '薪资', '薪酬'], type: 'income', category: 'salary', subCategory: 'salary-monthly', reason: '工资收入' },
  { keywords: ['奖金', '绩效'], type: 'income', category: 'salary', subCategory: 'salary-bonus', reason: '奖金收入' },
  { keywords: ['理财', '基金', '股票', '利息', '收益'], type: 'income', category: 'investment', subCategory: 'investment-fund', reason: '理财收益' },
  { keywords: ['兼职', '副业'], type: 'income', category: 'part-time', subCategory: 'part-time-gig', reason: '兼职收入' },
  { keywords: ['红包收入'], type: 'income', category: 'gift-income', subCategory: 'gift-income-redpacket', reason: '红包收入' },
];

const localClassify = (request: AiClassifyRequest): AiClassifyResult => {
  const text = (request.merchant + ' ' + (request.description || '')).toLowerCase();
  
  for (const rule of keywordRules) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return {
          type: rule.type,
          category: rule.category,
          subCategory: rule.subCategory,
          merchantShortName: request.merchant.slice(0, 10),
          confidence: 0.85,
          reason: rule.reason,
        };
      }
    }
  }
  
  if (request.type === 'income') {
    return {
      type: 'income',
      category: 'other-income',
      subCategory: 'other-income',
      merchantShortName: request.merchant.slice(0, 10),
      confidence: 0.5,
      reason: '未知收入来源',
    };
  }
  
  return {
    type: 'expense',
    category: 'other-expense',
    subCategory: 'other-expense',
    merchantShortName: request.merchant.slice(0, 10),
    confidence: 0.5,
    reason: '无法识别商户类型',
  };
};

const classifyCache = new Map<string, AiClassifyResult>();
let runtimeConfig: Partial<AiServiceConfig> = {};

export const setAiConfig = (config: AIModelConfig) => {
  runtimeConfig = { 
    apiKey: config.apiKey, 
    baseUrl: config.baseUrl, 
    model: config.model 
  };
  localStorage.setItem('aiConfig', JSON.stringify(config));
};

const getConfig = (): AiServiceConfig => {
  const savedConfig = localStorage.getItem('aiConfig');
  let storedKey = '';
  let storedBaseUrl = '';
  let storedModel = '';
  
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      storedKey = parsed.apiKey || '';
      storedBaseUrl = parsed.baseUrl || '';
      storedModel = parsed.model || '';
    } catch {
      storedKey = localStorage.getItem('aiApiKey') || '';
    }
  }
  
  return { 
    ...DEFAULT_CONFIG, 
    ...runtimeConfig, 
    apiKey: runtimeConfig.apiKey || storedKey || '',
    baseUrl: runtimeConfig.baseUrl || storedBaseUrl || DEFAULT_CONFIG.baseUrl,
    model: runtimeConfig.model || storedModel || DEFAULT_CONFIG.model,
  };
};

export const isAiAvailable = (): boolean => {
  return !!getConfig().apiKey;
};

export const getAIConfig = (): AIModelConfig => {
  const saved = localStorage.getItem('aiConfig');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    name: 'qwen',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
  };
};

export const clearClassifyCache = () => {
  classifyCache.clear();
};

export const suggestCategory = async (
  merchant: string,
  note: string,
  type: string = 'expense'
): Promise<{ categoryL1: string; categoryL2: string; confidence: number } | null> => {
  if (!isAiAvailable()) {
    const result = localClassify({
      merchant,
      description: note,
      type: type === 'skip' ? undefined : type as any,
    });
    if (result.confidence > 0) {
      return {
        categoryL1: result.category,
        categoryL2: result.subCategory,
        confidence: result.confidence,
      };
    }
    return null;
  }

  try {
    const results = await batchClassify([{
      merchant,
      description: note,
      type: type === 'skip' ? undefined : type as any,
    }]);

    if (results.length > 0 && results[0].confidence > 0) {
      return {
        categoryL1: results[0].category,
        categoryL2: results[0].subCategory,
        confidence: results[0].confidence,
      };
    }
    return null;
  } catch {
    return null;
  }
};

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

const validateResult = (result: any): AiClassifyResult => {
  const validTypes = ['expense', 'income'];
  const validCategories = [
    'food', 'shopping', 'transport', 'accommodation', 'daily', 'study', 'social',
    'entertainment', 'beauty', 'travel', 'medical', 'membership', 'other-expense',
    'salary', 'investment', 'part-time', 'gift-income', 'other-income',
  ];

  let type = (result.type || 'expense') as 'expense' | 'income';
  if (!validTypes.includes(type)) {
    type = 'expense';
  }

  let category = result.category || 'other-expense';
  let subCategory = result.subCategory || 'other-expense';

  if (!validCategories.includes(category)) {
    category = 'other-expense';
    subCategory = 'other-expense';
  }

  const confidence = Math.min(1, Math.max(0, result.confidence ?? 0.5));
  const merchantShortName = result.merchantShortName?.trim() || '';

  return {
    type,
    category,
    subCategory,
    merchantShortName: merchantShortName.slice(0, 20),
    confidence,
    reason: result.reason || '',
  };
};

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
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    type: 'expense',
    category: 'other-expense',
    subCategory: 'other-expense',
    merchantShortName: request.merchant.slice(0, 10),
    confidence: 0,
    reason: `AI 调用失败: ${lastError?.message}`,
  };
};

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

export const batchClassify = async (
  requests: AiClassifyRequest[],
  onProgress?: ProgressCallback
): Promise<AiClassifyResult[]> => {
  const config = getConfig();

  if (!config.apiKey) {
    return requests.map((req, index) => {
      if (onProgress) {
        onProgress({ processed: index + 1, total: requests.length, currentMerchant: req.merchant });
      }
      return localClassify(req);
    });
  }

  const total = requests.length;
  let processed = 0;
  const resultMap = new Map<string, AiClassifyResult>();

  const uniqueMerchants = new Map<string, AiClassifyRequest>();
  requests.forEach(req => {
    const key = req.merchant + '|' + (req.description || '');
    if (!uniqueMerchants.has(key)) {
      uniqueMerchants.set(key, req);
    }
  });

  const toProcess: { key: string; request: AiClassifyRequest }[] = [];
  uniqueMerchants.forEach((request, key) => {
    const cached = classifyCache.get(key);
    if (cached) {
      resultMap.set(key, cached);
      processed++;
    } else {
      toProcess.push({ key, request });
    }
  });

  onProgress?.({ processed, total });

  if (toProcess.length > 0) {
    await promisePool(
      toProcess,
      async ({ key, request }) => {
        const result = await classifyWithRetry(request, config);
        resultMap.set(key, result);
        classifyCache.set(key, result);
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

  return requests.map(req => {
    const key = req.merchant + '|' + (req.description || '');
    return resultMap.get(key) || {
      type: req.type || 'expense',
      category: 'other-expense',
      subCategory: 'other-expense',
      merchantShortName: req.merchant.slice(0, 10),
      confidence: 0,
      reason: '分类失败',
    };
  });
};

export const simplifyMerchantName = (merchantName: string): string => {
  const prefixPatterns = [
    /^(支付宝|微信支付|银联)-?/,
    /^(美团外卖|饿了么)-/,
  ];

  let result = merchantName;

  for (const pattern of prefixPatterns) {
    result = result.replace(pattern, '');
  }

  const dashMatch = result.match(/[-–—]([^-–—]+)$/);
  if (dashMatch && dashMatch[1].length <= 10) {
    result = dashMatch[1].trim();
  }

  result = result.replace(/[（(][^)）]*[)）]/g, '').trim();
  result = result.replace(/(有限公司|集团|股份公司|科技|发展)$/g, '').trim();
  result = result.replace(/^(.*?(大学|公司|集团|有限公司|股份有限公司|科技有限公司|服务中心|后勤保障部|管理处|营业部|分店|门店))[^]*?/, '').trim();

  return result || merchantName.slice(0, 10);
};
