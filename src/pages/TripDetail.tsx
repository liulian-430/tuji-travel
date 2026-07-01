import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Users, Calendar, Edit2, Trash2, ChevronLeft, Plus, Clock, Navigation, AlertTriangle, Wallet, Route as RouteIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import { useTripStore } from '@/store/useTripStore';
import type { DayScheduleSimple } from '@/store/useTripStore';
import type { TripPOI } from '../data/mock';

// 时段配置
const slotConfig = [
  { key: 'morning' as const, label: '上午', icon: '🌅' },
  { key: 'afternoon' as const, label: '下午', icon: '☀️' },
  { key: 'evening' as const, label: '晚上', icon: '🌙' },
];

// POI 类型样式
const typeColors: Record<string, string> = {
  scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
  food: 'bg-red-500/20 text-red-600 border-red-500/30',
  hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  shopping: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

const typeLabels: Record<string, string> = {
  scenic: '景点',
  food: '美食',
  hotel: '住宿',
  shopping: '购物',
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, expenses, removeTrip, completeTrip } = useTripStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const trip = trips.find((t) => t.id === id);

  // 行程不存在：展示空状态
  if (!trip) {
    return (
      <div className="min-h-screen pt-20 md:pt-8 flex items-center justify-center px-4">
        <EmptyState
          icon={RouteIcon}
          title="行程不存在"
          description="该行程可能已被删除，返回看看其他行程吧。"
          actionText="返回我的行程"
          onAction={() => navigate('/profile')}
        />
      </div>
    );
  }

  const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
  const totalSpent = tripExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalBudget = trip.budget || 3000;
  const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const remaining = totalBudget - totalSpent;

  const nights = trip.nights ?? Math.max(0, trip.days - 1);
  const people = trip.people ?? 1;
  const coverImage = trip.coverImage || 'https://picsum.photos/seed/trip-detail/600/400';

  // 状态映射（兼容 in_progress / ongoing）
  const statusInfo: Record<string, { label: string; color: string }> = {
    planning: { label: '规划中', color: 'bg-blue-500/20 text-blue-600' },
    in_progress: { label: '进行中', color: 'bg-green-500/20 text-green-600' },
    ongoing: { label: '进行中', color: 'bg-green-500/20 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-500/20 text-gray-600' },
  };
  const status = statusInfo[trip.status] || statusInfo.planning;

  // 日程列表：优先使用 daysList，否则按天数生成空日程
  const daySchedules: DayScheduleSimple[] = trip.daysList && trip.daysList.length > 0
    ? [...trip.daysList].sort((a, b) => a.day - b.day)
    : Array.from({ length: trip.days }, (_, i) => ({ day: i + 1 }));

  // 统计 POI 数量
  const poiCount = trip.pois?.length || 0;

  // 删除行程
  const handleDelete = () => {
    removeTrip(trip.id);
    navigate('/profile');
  };

  // 完成行程
  const handleComplete = () => {
    completeTrip(trip.id);
  };

  // 打开导航（高德地图）
  const openNavigation = (poi: TripPOI) => {
    if (typeof poi.latitude === 'number' && typeof poi.longitude === 'number') {
      const url = `https://uri.amap.com/marker?position=${poi.longitude},${poi.latitude}&name=${encodeURIComponent(poi.name)}&coordinate=wgs84&callnative=1`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-8">
      {/* Header Image */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => navigate(`/map?trip=${trip.id}`)}
            className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
            aria-label="在地图查看"
          >
            <MapPin size={20} className="text-white" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <h1 className="text-white text-2xl font-bold mt-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{trip.startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{people}人</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{trip.days}天{nights}夜 · {poiCount}个景点</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6 relative z-10">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate(`/budget/${trip.id}`)}
            className="glass-card flex-1 p-4 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Wallet size={20} className="text-primary-mid" />
            <span className="text-gray-700 font-medium">预算管理</span>
          </button>
          <button
            onClick={() => navigate(`/map?trip=${trip.id}`)}
            className="glass-card p-4 hover:bg-white/20 transition-colors"
            aria-label="查看地图"
          >
            <MapPin size={20} className="text-gray-600" />
          </button>
          {trip.status !== 'completed' && (
            <button
              onClick={handleComplete}
              className="glass-card p-4 hover:bg-green-50 transition-colors group"
              aria-label="完成行程"
            >
              <Edit2 size={20} className="text-gray-600 group-hover:text-green-600" />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="glass-card p-4 hover:bg-red-50 transition-colors group"
            aria-label="删除行程"
          >
            <Trash2 size={20} className="text-gray-600 group-hover:text-red-500" />
          </button>
        </div>

        {/* Budget Overview */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">预算概览</h2>
            <button
              onClick={() => navigate(`/budget/${trip.id}`)}
              className="text-xs text-primary-mid hover:underline"
            >
              查看明细
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">总预算</p>
              <p className="text-2xl font-bold gradient-text">¥{totalBudget.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">已花费</p>
              <p className="text-xl font-bold text-gray-700">
                ¥{totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed >= 90 ? 'bg-red-500' : 'bg-gradient-primary'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>已用 {Math.round(percentUsed)}%</span>
            <span className={remaining < 0 ? 'text-red-500 font-medium' : ''}>
              剩余 ¥{remaining.toLocaleString()}
            </span>
          </div>
          {remaining < 0 && (
            <div className="mt-3 p-2.5 bg-red-50 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-xs text-red-600">已超出预算 ¥{Math.abs(remaining).toLocaleString()}</p>
            </div>
          )}
        </GlassCard>

        {/* Itinerary */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">行程安排</h2>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm text-primary-mid hover:underline"
            >
              <Plus size={16} />
              添加景点
            </button>
          </div>
          <div className="timeline-line" />
          {daySchedules.map((day, dayIndex) => {
            const dayPois: TripPOI[] = [
              ...(day.morning || []),
              ...(day.afternoon || []),
              ...(day.evening || []),
            ];
            return (
              <div key={dayIndex} className="relative pl-12 mb-6">
                <div className="timeline-dot" />
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">
                      第 {day.day} 天
                    </h3>
                    <span className="text-sm text-gray-500">{dayPois.length} 个安排</span>
                  </div>

                  {dayPois.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-400 mb-3">这一天还没有安排</p>
                      <button
                        onClick={() => navigate('/search')}
                        className="text-sm text-primary-mid hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Plus size={14} />
                        添加景点
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {slotConfig.map((slot) => {
                        const slotPois = day[slot.key] || [];
                        if (slotPois.length === 0) return null;
                        return (
                          <div key={slot.key}>
                            <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                              <span>{slot.icon}</span>
                              {slot.label}
                            </p>
                            <div className="space-y-3">
                              {slotPois.map((poi) => (
                                <div
                                  key={poi.id}
                                  className="relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary-mid/30 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={poi.image}
                                      alt={poi.name}
                                      className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[poi.type] || typeColors.scenic}`}>
                                          {typeLabels[poi.type] || '景点'}
                                        </span>
                                        {poi.duration && (
                                          <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                            <Clock size={10} />
                                            {poi.duration}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-medium text-gray-800 truncate">
                                        {poi.name}
                                      </h4>
                                      {poi.price > 0 && (
                                        <p className="text-sm text-primary-mid mt-1">
                                          ¥{poi.price}
                                        </p>
                                      )}
                                      {typeof poi.latitude === 'number' && (
                                        <button
                                          onClick={() => openNavigation(poi)}
                                          className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                        >
                                          <Navigation size={12} />
                                          导航到这里
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-bounce-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">删除行程</h3>
              <p className="text-sm text-gray-500 mb-6">
                确定要删除「{trip.name}」吗？该操作不可撤销，行程及相关消费记录将被一并删除。
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
