import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Users, Calendar, Edit2, Trash2, ChevronLeft, Plus, Clock, Navigation, AlertTriangle, Wallet, Route as RouteIcon, Share2, UserPlus, X, Copy, Check, Link as LinkIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import WeatherWidget from '../components/ui/WeatherWidget';
import { useTripStore } from '@/store/useTripStore';
import type { DayScheduleSimple } from '@/data/mock';
import type { TripPOI } from '../data/mock';
import { DEFAULT_BUDGET } from '@/config/constants';
import { useToastStore } from '@/store/useToastStore';

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
  const { trips, expenses, removeTrip, completeTrip, collaborators, addCollaborator, removeCollaborator, userProfile, removePOIFromTrip } = useTripStore();
  const { showToast } = useToastStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [copied, setCopied] = useState(false);

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
  const totalBudget = trip.budget || DEFAULT_BUDGET;
  const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const remaining = totalBudget - totalSpent;

  const nights = trip.nights ?? Math.max(0, trip.days - 1);
  const people = trip.people ?? 1;
  const coverImage = trip.coverImage || 'https://picsum.photos/seed/trip-detail/600/400';

  // 行程成员列表（含当前用户作为所有者）
  const tripCollaborators = [
    {
      id: 'owner',
      nickname: userProfile.nickname,
      avatar: userProfile.avatar,
      role: 'owner' as const,
      tripId: trip.id,
    },
    ...collaborators.filter((c) => c.tripId === trip.id),
  ];

  const roleLabels: Record<string, string> = {
    owner: '所有者',
    editor: '编辑者',
    viewer: '查看者',
  };
  const roleColors: Record<string, string> = {
    owner: 'bg-gradient-primary text-white',
    editor: 'bg-blue-100 text-blue-600',
    viewer: 'bg-gray-100 text-gray-600',
  };

  // 复制邀请链接
  const shareLink = `${window.location.origin}/trip/${trip.id}`;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 原生分享
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.name,
          text: `${trip.destination} · ${trip.days}天${nights}夜行程，一起出发吧！`,
          url: shareLink,
        });
      } catch {
        // 用户取消，不处理
      }
    } else {
      handleCopyLink();
    }
  };

  // 添加成员
  const handleAddMember = () => {
    if (!inviteName.trim()) return;
    const avatarChar = inviteName.trim()[0];
    addCollaborator({
      nickname: inviteName.trim(),
      avatar: avatarChar,
      role: 'editor',
      tripId: trip.id,
    });
    setInviteName('');
    setShowInviteModal(false);
  };

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
            onClick={() => setShowShareModal(true)}
            className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
            aria-label="分享"
          >
            <Share2 size={20} className="text-white" />
          </button>
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

        {/* Members */}
        <GlassCard className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-primary-mid" />
              行程成员
              <span className="text-sm font-normal text-gray-400">({tripCollaborators.length})</span>
            </h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 text-sm text-primary-mid hover:underline"
            >
              <UserPlus size={14} />
              邀请
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {tripCollaborators.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-white/40 rounded-full pr-3 pl-1 py-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  member.role === 'owner' ? 'bg-gradient-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {member.avatar}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {member.nickname}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[member.role] || roleColors.viewer}`}>
                  {roleLabels[member.role] || '查看者'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

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

        {/* Weather */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">目的地天气</h2>
          <WeatherWidget city={trip.destination} compact />
        </div>

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
                                  className="relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary-mid/30 transition-colors group"
                                >
                                  <button
                                    onClick={() => {
                                      removePOIFromTrip(trip.id, poi.id);
                                      showToast('已删除景点', 'success');
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="删除景点"
                                  >
                                    <Trash2 size={14} />
                                  </button>
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

      {/* 分享弹窗 */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">分享行程</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 行程摘要 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <img
                  src={coverImage}
                  alt={trip.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{trip.name}</p>
                  <p className="text-xs text-gray-500">
                    {trip.destination} · {trip.days}天{nights}夜
                  </p>
                </div>
              </div>

              {/* 分享链接 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">复制链接</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 truncate">
                    <LinkIcon size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{shareLink}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-primary text-white hover:opacity-90'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 原生分享 */}
              <button
                onClick={handleNativeShare}
                className="w-full py-3 rounded-xl bg-gradient-primary text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Share2 size={18} />
                分享给好友
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 邀请成员弹窗 */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-bounce-in max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">邀请成员</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* 添加新成员 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">添加同行者</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="输入昵称"
                    maxLength={12}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={!inviteName.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-1"
                  >
                    <Plus size={16} />
                    添加
                  </button>
                </div>
              </div>

              {/* 成员列表 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  当前成员 ({tripCollaborators.length})
                </p>
                <div className="space-y-2">
                  {tripCollaborators.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        member.role === 'owner' ? 'bg-gradient-primary text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{member.nickname}</p>
                        <p className="text-xs text-gray-500">{roleLabels[member.role] || '查看者'}</p>
                      </div>
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => removeCollaborator(member.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="移除成员"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 分享邀请链接 */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  或分享链接邀请好友加入：
                </p>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-600 text-sm hover:border-primary-mid hover:text-primary-mid transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      链接已复制
                    </>
                  ) : (
                    <>
                      <LinkIcon size={16} />
                      复制邀请链接
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
