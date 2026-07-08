import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, BarChart3, User } from 'lucide-react';

const navItems = [
  { id: 'home', label: '首页', Icon: Home, path: '/' },
  { id: 'add', label: '记账', Icon: Plus, path: '/add' },
  { id: 'stats', label: '统计', Icon: BarChart3, path: '/stats' },
  { id: 'profile', label: '我的', Icon: User, path: '/profile' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/add')) return 'add';
    if (path.startsWith('/stats')) return 'stats';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeItem = getActiveItem();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-clay-bg border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          if (item.id === 'add') {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-clay-primary shadow-lg scale-110'
                    : 'bg-clay-primary/80'
                }`}
              >
                <item.Icon size={24} className="text-white" />
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                activeItem === item.id 
                  ? 'bg-white text-clay-primary shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] scale-105 font-bold' 
                  : 'text-text-tertiary hover:bg-white/50'
              }`}
            >
              <item.Icon size={22} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
