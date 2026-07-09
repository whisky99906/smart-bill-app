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
    'food', 'shopping', 'transport', 'accommodation', 'study', 'social',
    'beauty', 'travel', 'medical', 'membership', 'other-expense',
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
    return requests.map(req => ({
      type: req.type || 'expense',
      category: 'other-expense',
      subCategory: 'other-expense',
      merchantShortName: req.merchant.slice(0, 10),
      confidence: 0,
      reason: '未配置 AI API Key',
    }));
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
