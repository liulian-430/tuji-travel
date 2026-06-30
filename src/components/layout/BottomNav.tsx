import { Home, Sparkles, Map, Search, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/ai-planner', icon: Sparkles, label: 'AI规划' },
  { path: '/map', icon: Map, label: '地图' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="glass-nav md:hidden">
      {navItems.map(({ path, icon: Icon, label }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`nav-item ${location.pathname === path ? 'active' : ''}`}
        >
          <Icon size={24} />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </nav>
  );
}
