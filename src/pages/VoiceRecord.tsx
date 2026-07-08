import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { useTransactionStore, useCategoryStore, useMerchantRuleStore } from '@/store/useStore';
import { getIcon } from '@/utils/icons';
import { ArrowLeft, Mic, MicOff, Check, X, RefreshCw } from 'lucide-react';

interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'result';

interface ParsedResult {
  amount: string;
  merchant: string;
  categoryL1: string;
  categoryL2: string;
  note: string;
  type: 'expense' | 'income';
}

const categoryKeywords: Record<string, { l1: string; l2: string }> = {
  早餐: { l1: 'food', l2: 'food-breakfast' },
  午餐: { l1: 'food', l2: 'food-lunch' },
  晚餐: { l1: 'food', l2: 'food-dinner' },
  外卖: { l1: 'food', l2: 'food-lunch' },
  零食: { l1: 'food', l2: 'food-snack' },
  咖啡: { l1: 'food', l2: 'food-snack' },
  奶茶: { l1: 'food', l2: 'food-snack' },
  衣服: { l1: 'shopping', l2: 'shopping-clothes' },
  购物: { l1: 'shopping', l2: 'shopping-daily' },
  淘宝: { l1: 'shopping', l2: 'shopping-daily' },
  京东: { l1: 'shopping', l2: 'shopping-electronics' },
  公交: { l1: 'transport', l2: 'transport-bus' },
  地铁: { l1: 'transport', l2: 'transport-subway' },
  打车: { l1: 'transport', l2: 'transport-taxi' },
  滴滴: { l1: 'transport', l2: 'transport-taxi' },
  加油: { l1: 'transport', l2: 'transport-fuel' },
  电影: { l1: 'entertainment', l2: 'entertainment-movie' },
  游戏: { l1: 'entertainment', l2: 'entertainment-game' },
  旅行: { l1: 'entertainment', l2: 'entertainment-travel' },
  运动: { l1: 'entertainment', l2: 'entertainment-sport' },
  房租: { l1: 'living', l2: 'living-rent' },
  水电: { l1: 'living', l2: 'living-water' },
  工资: { l1: 'salary', l2: 'salary-monthly' },
  奖金: { l1: 'salary', l2: 'salary-bonus' },
  理财: { l1: 'investment', l2: 'investment-fund' },
  兼职: { l1: 'part-time', l2: 'part-time-gig' },
  红包: { l1: 'gift-income', l2: 'gift-income-redpacket' },
};

const merchantKeywords: Record<string, string> = {
  美团: '美团外卖',
  饿了么: '饿了么',
  滴滴: '滴滴出行',
  淘宝: '淘宝',
  京东: '京东',
  星巴克: '星巴克',
  肯德基: '肯德基',
  麦当劳: '麦当劳',
  瑞幸: '瑞幸咖啡',
};

export const VoiceRecord = () => {
  const navigate = useNavigate();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  const matchMerchant = useMerchantRuleStore((state) => state.matchMerchant);
  
  const [state, setState] = useState<RecordingState>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedResult>({
    amount: '',
    merchant: '',
    categoryL1: '',
    categoryL2: '',
    note: '',
    type: 'expense',
  });
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      recognition.onstart = () => {
        setState('recording');
        setError('');
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setRecognizedText(finalTranscript);
      };
      
      recognition.onend = () => {
        if (state === 'recording') {
          if (!recognizedText.trim()) {
            setError('未检测到语音，请重试');
            setState('idle');
          } else {
            setState('processing');
          }
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError('语音识别失败，请检查麦克风权限');
        setState('idle');
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [state, recognizedText]);

  useEffect(() => {
    if (state === 'processing' && recognizedText) {
      const parsed = parseVoiceInput(recognizedText);
      setParsedResult(parsed);
      setState('result');
    }
  }, [state, recognizedText]);

  const parseVoiceInput = (text: string): ParsedResult => {
    const result: ParsedResult = {
      amount: '',
      merchant: '',
      categoryL1: '',
      categoryL2: '',
      note: text,
      type: 'expense',
    };

    if (text.includes('收入') || text.includes('工资') || text.includes('奖金') || text.includes('理财') || text.includes('兼职')) {
      result.type = 'income';
    }

    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(元|块|块钱|元钱|块儿)/);
    if (amountMatch) {
      result.amount = amountMatch[1];
    }

    for (const [keyword, category] of Object.entries(categoryKeywords)) {
      if (text.includes(keyword)) {
        result.categoryL1 = category.l1;
        result.categoryL2 = category.l2;
        break;
      }
    }

    for (const [keyword, merchant] of Object.entries(merchantKeywords)) {
      if (text.includes(keyword)) {
        result.merchant = merchant;
        break;
      }
    }

    if (!result.merchant) {
      const matched = matchMerchant(text);
      if (matched) {
        result.categoryL1 = matched.categoryL1;
        result.categoryL2 = matched.categoryL2;
      }
    }

    if (!result.categoryL1) {
      result.categoryL1 = result.type === 'expense' ? 'other-expense' : 'other-income';
      result.categoryL2 = result.type === 'expense' ? 'other-expense-gift' : 'other-income-unknown';
    }

    return result;
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setRecognizedText('');
      setParsedResult({
        amount: '',
        merchant: '',
        categoryL1: '',
        categoryL2: '',
        note: '',
        type: 'expense',
      });
      recognitionRef.current.start();
    } else {
      setError('当前浏览器不支持语音识别，请使用Chrome浏览器');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSave = () => {
    if (!parsedResult.amount || !parsedResult.categoryL1 || !parsedResult.categoryL2) return;
    
    addTransaction({
      amount: parseFloat(parsedResult.amount),
      type: parsedResult.type,
      categoryL1: parsedResult.categoryL1,
      categoryL2: parsedResult.categoryL2,
      merchant: parsedResult.merchant || '语音记账',
      note: parsedResult.note,
      date: new Date().toISOString().split('T')[0],
      source: 'voice',
    });
    
    navigate('/');
  };

  const mainCategory = getCategoryById(parsedResult.categoryL1);
  const subCategory = getCategoryById(parsedResult.categoryL2);
  const MainIcon = getIcon(mainCategory?.icon || 'other');

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-text-secondary text-lg"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">语音记账</h1>
          <div className="w-6" />
        </div>

        {state === 'idle' && (
          <div className="text-center py-20">
            <ClayCard 
              className="w-40 h-40 mx-auto flex items-center justify-center cursor-pointer mb-6"
              onClick={startRecording}
            >
              <Mic size={48} className="text-clay-primary" />
            </ClayCard>
            <p className="text-text-primary font-medium mb-2">点击开始说话</p>
            <p className="text-text-tertiary text-sm">支持语音识别金额、商户、分类</p>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        )}

        {state === 'recording' && (
          <div className="text-center py-20">
            <div className="w-40 h-40 mx-auto rounded-full bg-clay-primary/20 flex items-center justify-center mb-6 animate-pulse">
              <MicOff size={48} className="text-clay-primary" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-clay-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-clay-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-clay-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-text-primary font-medium">正在听...</p>
            <p className="text-text-tertiary text-sm mt-2">说完后自动停止</p>
            <button 
              className="mt-6 text-red-400 text-sm"
              onClick={stopRecording}
            >
              停止录音
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center py-20">
            <div className="w-40 h-40 mx-auto rounded-full bg-clay-primary/20 flex items-center justify-center mb-6">
              <RefreshCw size={48} className="text-clay-primary animate-spin" />
            </div>
            <p className="text-text-primary font-medium">正在解析...</p>
          </div>
        )}

        {state === 'result' && (
          <div className="space-y-4">
            <ClayCard className="p-4">
              <p className="text-text-tertiary text-xs mb-2">识别内容</p>
              <p className="text-text-primary">{recognizedText}</p>
            </ClayCard>

            <ClayCard className="p-4">
              <p className="text-text-tertiary text-xs mb-2">金额</p>
              <p className="text-3xl font-bold text-text-primary">¥{parsedResult.amount || '0.00'}</p>
            </ClayCard>

            <ClayCard className="p-4">
              <p className="text-text-tertiary text-xs mb-2">分类</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${mainCategory?.color}20` }}
                >
                  <MainIcon size={20} style={{ color: mainCategory?.color }} />
                </div>
                <div>
                  <p className="text-text-primary font-medium">{mainCategory?.name}</p>
                  <p className="text-text-tertiary text-sm">{subCategory?.name}</p>
                </div>
              </div>
            </ClayCard>

            <ClayCard className="p-4">
              <p className="text-text-tertiary text-xs mb-2">商户</p>
              <p className="text-text-primary">{parsedResult.merchant || '未识别'}</p>
            </ClayCard>

            <ClayCard className="p-4">
              <p className="text-text-tertiary text-xs mb-2">备注</p>
              <p className="text-text-primary">{parsedResult.note}</p>
            </ClayCard>

            <div className="flex gap-4">
              <ClayButton className="flex-1" variant="secondary" onClick={startRecording}>
                <RefreshCw size={18} className="mr-2" />
                重新识别
              </ClayButton>
              <ClayButton className="flex-1" onClick={handleSave} disabled={!parsedResult.amount}>
                <Check size={18} className="mr-2" />
                保存账单
              </ClayButton>
            </div>

            <button 
              className="w-full text-text-tertiary text-sm"
              onClick={() => navigate('/add')}
            >
              <X size={16} className="inline mr-1" />
              手动修改
            </button>
          </div>
        )}
      </div>
    </div>
  );
};