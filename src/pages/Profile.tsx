import { useState } from 'react';
import { Camera, ChevronRight, Moon, Bell, Shield, HelpCircle, LogOut, MapPin, Star, Heart } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    { icon: MapPin, label: '我的足迹', value: '12个目的地', color: 'text-blue-500' },
    { icon: Heart, label: '我的收藏', value: '28个收藏', color: 'text-favorite' },
    { icon: Star, label: '我的评价', value: '15条评价', color: 'text-yellow-500' },
  ];

  const settings = [
    { icon: Moon, label: '深色模式', toggle: true, value: isDarkMode, onChange: () => setIsDarkMode(!isDarkMode) },
    { icon: Bell, label: '消息通知', toggle: true, value: notifications, onChange: () => setNotifications(!notifications) },
    { icon: Shield, label: '隐私设置', link: true },
    { icon: HelpCircle, label: '帮助与反馈', link: true },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">旅</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">旅行爱好者</h2>
              <p className="text-sm text-gray-500 mt-1">世界那么大，一起去看看</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span><strong className="text-gray-700">12</strong> 行程</span>
                <span><strong className="text-gray-700">28</strong> 收藏</span>
                <span><strong className="text-gray-700">156</strong> 足迹</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {menuItems.map((item) => (
            <GlassCard
              key={item.label}
              className="p-4 text-center cursor-pointer hover:bg-white/20 transition-colors"
            >
              <item.icon size={24} className={`mx-auto mb-2 ${item.color}`} />
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{item.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">设置</h3>
          <GlassCard className="divide-y divide-white/10">
            {settings.map((item, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={item.toggle ? item.onChange : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="text-gray-500" />
                  <span className="text-gray-700">{item.label}</span>
                </div>
                {item.toggle ? (
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      item.value ? 'bg-gradient-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        item.value ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Logout */}
        <button className="w-full glass-card p-4 text-center text-red-500 hover:bg-red-50/50 transition-colors flex items-center justify-center gap-2">
          <LogOut size={20} />
          <span>退出登录</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 mt-6">
          途迹 v1.0.0
        </p>
      </div>
    </div>
  );
}
