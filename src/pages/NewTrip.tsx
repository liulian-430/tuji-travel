import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Calendar, MapPin, DollarSign, ChevronDown } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { Trip } from '@/data/mock';

export default function NewTrip() {
  const navigate = useNavigate();
  const { pendingTrip, clearPendingTrip, addTrip, trips } = useTripStore();
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    if (pendingTrip) {
      setTripName(pendingTrip.name);
    }
  }, [pendingTrip]);

  const handleSave = () => {
    if (!pendingTrip) return;
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: tripName || pendingTrip.name,
      destination: pendingTrip.destination,
      days: pendingTrip.days,
      startDate: new Date().toISOString().split('T')[0],
      budget: 3000,
      spent: 0,
      pois: pendingTrip.pois,
      status: 'in_progress',
      daysList: pendingTrip.schedules,
    };
    addTrip(newTrip);
    clearPendingTrip();
    navigate(`/trip/${newTrip.id}`);
  };

  if (pendingTrip) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">确认行程</h1>
          
          <div className="glass-card p-5 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">行程名称</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 outline-none transition-all"
            />
          </div>

          <div className="glass-card p-5 mb-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary-mid" />
              </div>
              <div>
                <p className="text-sm text-gray-500">目的地</p>
                <p className="font-medium text-gray-800">{pendingTrip.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid/10 flex items-center justify-center">
                <Calendar size={18} className="text-primary-mid" />
              </div>
              <div>
                <p className="text-sm text-gray-500">行程天数</p>
                <p className="font-medium text-gray-800">{pendingTrip.days} 天</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid/10 flex items-center justify-center">
                <DollarSign size={18} className="text-primary-mid" />
              </div>
              <div>
                <p className="text-sm text-gray-500">景点数量</p>
                <p className="font-medium text-gray-800">{pendingTrip.pois.length} 个景点</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-800">行程预览</p>
              <button className="text-sm text-primary-mid flex items-center gap-1">
                <span>展开</span>
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {pendingTrip.schedules.map((day, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/40">
                  <p className="text-sm font-medium text-primary-mid mb-2">Day {idx + 1}</p>
                  <div className="space-y-1">
                    {day.morning?.map((p) => (
                      <p key={p.id} className="text-xs text-gray-600">🌅 {p.name}</p>
                    ))}
                    {day.afternoon?.map((p) => (
                      <p key={p.id} className="text-xs text-gray-600">☀️ {p.name}</p>
                    ))}
                    {day.evening?.map((p) => (
                      <p key={p.id} className="text-xs text-gray-600">🌙 {p.name}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                clearPendingTrip();
                navigate('/ai-planner');
              }}
              className="flex-1 glass-card py-3 text-gray-600 hover:bg-white/20 transition-colors"
            >
              返回修改
            </button>
            <button
              onClick={handleSave}
              className="flex-1 gradient-button flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>保存行程</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-primary mx-auto mb-6 flex items-center justify-center animate-float">
          <span className="text-5xl text-white">＋</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">创建新行程</h1>
        <p className="text-gray-500 mb-8">选择规划方式开始您的旅行</p>
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            onClick={() => navigate('/ai-planner')}
            className="gradient-button flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            <span>AI 智能规划</span>
          </button>
          <button
            onClick={() => navigate('/ai-planner')}
            className="glass-card px-6 py-3 text-gray-700 hover:bg-white/20 transition-colors"
          >
            从空白行程开始
          </button>
        </div>
      </div>
    </div>
  );
}
