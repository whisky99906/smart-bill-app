import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { setAIConfig, getAIConfig, type AIModelConfig } from '@/utils/aiService';
import { ArrowLeft, Shield, Bell, Database, Info, FileText, ChevronRight, Bot, Check } from 'lucide-react';

const modelTemplates: Record<string, { baseUrl: string; model: string; name: string }> = {
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    name: 'Qwen-turbo (通义千问)',
  },
  doubao: {
    baseUrl: 'https://api.doubao.com/v1',
    model: 'doubao-3',
    name: 'Doubao 3.0 (豆包)',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
  },
  custom: {
    baseUrl: '',
    model: '',
    name: '自定义',
  },
};

const settingsItems = [
  { label: '账户与安全', Icon: Shield },
  { label: '通知设置', Icon: Bell },
  { label: '数据管理', Icon: Database },
  { label: '关于我们', Icon: Info },
  { label: '隐私政策', Icon: FileText },
  { label: '用户协议', Icon: FileText },
];

export const Settings = () => {
  const navigate = useNavigate();
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [config, setConfig] = useState<AIModelConfig>(getAIConfig());

  useEffect(() => {
    setConfig(getAIConfig());
  }, []);

  const handleModelChange = (modelKey: string) => {
    const template = modelTemplates[modelKey];
    if (template) {
      setConfig({
        ...config,
        name: modelKey,
        baseUrl: template.baseUrl,
        model: template.model,
      });
    }
  };

  const handleSaveAIConfig = () => {
    setAIConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <h1 className="text-xl font-bold text-text-primary">设置</h1>
          <div className="w-6" />
        </div>

        <ClayCard 
          className="p-4 flex items-center justify-between mb-6 cursor-pointer"
          onClick={() => setShowAIConfig(!showAIConfig)}
        >
          <div className="flex items-center gap-3">
            <Bot size={22} className="text-clay-primary" />
            <span className="text-text-primary">AI 智能分类</span>
          </div>
          <ChevronRight size={18} className={`text-text-tertiary transition-transform ${showAIConfig ? 'rotate-90' : ''}`} />
        </ClayCard>

        {showAIConfig && (
          <ClayCard className="p-4 mb-6">
            <p className="text-text-tertiary text-xs mb-4">配置 AI 服务以启用智能分类功能</p>
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-sm mb-2 block">选择模型</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(modelTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      className={`p-2 text-xs rounded-xl border-2 transition-all ${
                        config.name === key 
                          ? 'border-clay-primary bg-clay-primary/10' 
                          : 'border-transparent bg-gray-100'
                      }`}
                      onClick={() => handleModelChange(key)}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-sm mb-2 block">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="请输入您的 API Key"
                  className="clay-input w-full"
                />
              </div>

              <div>
                <label className="text-text-secondary text-sm mb-2 block">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="API 基础地址"
                  className="clay-input w-full"
                />
              </div>

              <div>
                <label className="text-text-secondary text-sm mb-2 block">模型名称</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="模型标识符"
                  className="clay-input w-full"
                />
              </div>

              <ClayButton className="w-full" onClick={handleSaveAIConfig}>
                {saved ? <Check size={18} className="mr-2" /> : null}
                {saved ? '已保存' : '保存配置'}
              </ClayButton>
            </div>
          </ClayCard>
        )}

        <div className="space-y-3">
          {settingsItems.map((item) => (
            <ClayCard 
              key={item.label} 
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <item.Icon size={22} className="text-clay-primary" />
                <span className="text-text-primary">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-text-tertiary" />
            </ClayCard>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-xs">智能记账 App v1.0</p>
          <p className="text-text-tertiary text-xs mt-1">Made with care</p>
        </div>
      </div>
    </div>
  );
};