import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useTripStore, type Trip } from '@/store/useTripStore';
import { useToastStore } from '@/store/useToastStore';
import { DEFAULT_BUDGET } from '@/config/constants';

export default function NewTrip() {
  const navigate = useNavigate();
  const { pendingTrip, clearPendingTrip, createTrip, trips } = useTripStore();
  const { showToast } = useToastStore();
  const [tripName, setTripName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (pendingTrip) {
      setTripName(pendingTrip.name);
    }
  }, [pendingTrip]);

  const handleSave = async () => {
    if (!pendingTrip) return;
    try {
      const createdTrip = await createTrip({
        name: tripName || pendingTrip.name,
        destination: pendingTrip.destination,
        days: pendingTrip.days,
        nights: pendingTrip.nights ?? Math.max(0, pendingTrip.days - 1),
        people: pendingTrip.people ?? 1,
        startDate: new Date().toISOString().split('T')[0],
        budget: pendingTrip.budget ?? DEFAULT_BUDGET,
        spent: 0,
        status: 'in_progress',
        coverImage: pendingTrip.pois[0]?.image || 'https://picsum.photos/seed/trip-new/600/400',
        pois: pendingTrip.pois,
        schedules: pendingTrip.schedules,
      });
      clearPendingTrip();
      showToast('行程保存成功', 'success');
      navigate(`/trip/${createdTrip.id}`);
    } catch (error) {
      console.error('创建行程失败:', error);
      showToast('创建行程失败，请重试', 'error');
    }
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
                <p className="font-medium text-gray-800">{pendingTrip.days} 天 {pendingTrip.nights ?? Math.max(0, pendingTrip.days - 1)} 晚</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid/10 flex items-center justify-center">
                <Users size={18} className="text-primary-mid" />
              </div>
              <div>
                <p className="text-sm text-gray-500">出行人数</p>
                <p className="font-medium text-gray-800">{pendingTrip.people ?? 1} 人</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid/10 flex items-center justify-center">
                <DollarSign size={18} className="text-primary-mid" />
              </div>
              <div>
                <p className="text-sm text-gray-500">预计预算</p>
                <p className="font-medium text-gray-800">¥{pendingTrip.budget ?? DEFAULT_BUDGET}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-800">行程预览</p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-primary-mid flex items-center gap-1 hover:text-primary-dark transition-colors"
              >
                <span>{isExpanded ? '收起' : '展开'}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] overflow-y-auto' : 'max-h-60 overflow-hidden'}`}>
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
            {!isExpanded && pendingTrip.schedules.length > 3 && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-400">还有 {pendingTrip.schedules.length - 3} 天行程...</span>
              </div>
            )}
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
