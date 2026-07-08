import { useNavigate } from 'react-router-dom';
import { ClayCard } from '@/components';
import { ArrowLeft, Shield, Bell, Database, Info, FileText, ChevronRight } from 'lucide-react';

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
