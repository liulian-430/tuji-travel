import { Menu, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="hidden md:block glass-card fixed top-4 left-4 right-4 z-50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">途</span>
          </div>
          <span className="text-xl font-bold gradient-text">途迹</span>
        </div>
        <nav className="flex items-center gap-8">
          <a href="/" className="text-gray-600 hover:text-primary-mid transition-colors">首页</a>
          <a href="/ai-planner" className="text-gray-600 hover:text-primary-mid transition-colors">AI规划</a>
          <a href="/map" className="text-gray-600 hover:text-primary-mid transition-colors">地图</a>
          <a href="/search" className="text-gray-600 hover:text-primary-mid transition-colors">搜索</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
          <a href="/profile" className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-medium">我</span>
          </a>
        </div>
      </div>
    </header>
  );
}
