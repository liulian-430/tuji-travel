import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Clock, MapPin, Plus, User, Share2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useState, useCallback } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { userGuides } from '@/data/mock';
import type { TripPOI } from '@/data/mock';
import { useToastStore } from '@/store/useToastStore';
import { mockPOIs } from '@/data/mock';
import { useEscKey } from '@/hooks/useEscKey';

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, addPOIToTrip, favoritePOIs, toggleFavoritePOI } = useTripStore();
  const { showToast } = useToastStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');

  const guide = userGuides.find((g) => g.id === id) || userGuides[0];
  const allTrips = trips;
  const isAddAll = selectedPoi === '全部景点';

  const typeColors = {
    scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
    food: 'bg-red-500/20 text-red-600 border-red-500/30',
    hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  };

  const typeLabels = {
    scenic: '景点',
    food: '美食',
    hotel: '住宿',
  };

  const guidePoiToTripPoi = (guidePoi: typeof guide.poiDetails[0], idx: number): TripPOI => {
    const matchedPoi = mockPOIs.find((p) => p.name === guidePoi.name);
    return {
      id: `guide-poi-${Date.now()}-${idx}`,
      name: guidePoi.name,
      type: guidePoi.type,
      duration: guidePoi.duration,
      price: guidePoi.price,
      image: guidePoi.image,
      latitude: matchedPoi?.latitude,
      longitude: matchedPoi?.longitude,
    };
  };

  const handleAddPoi = (poiName: string) => {
    setSelectedPoi(poiName);
    setSelectedTrip(allTrips[0]?.id || '');
    setShowAddModal(true);
  };

  const handleAddAll = () => {
    setSelectedPoi('全部景点');
    setSelectedTrip(allTrips[0]?.id || '');
    setShowAddModal(true);
  };

  const confirmAdd = () => {
    if (!selectedTrip) return;
    if (isAddAll) {
      guide.poiDetails.forEach((poi, idx) => {
        addPOIToTrip(selectedTrip, guidePoiToTripPoi(poi, idx));
      });
      showToast(`已添加 ${guide.poiDetails.length} 个景点到行程`, 'success');
    } else {
      const poi = guide.poiDetails.find((p) => p.name === selectedPoi);
      if (poi) {
        addPOIToTrip(selectedTrip, guidePoiToTripPoi(poi, 0));
        showToast('已添加到行程', 'success');
      }
    }
    setShowAddModal(false);
  };

  const handleFavorite = () => {
    const firstPoi = guide.poiDetails[0];
    if (firstPoi) {
      toggleFavoritePOI(firstPoi.name);
      const isFav = favoritePOIs.includes(firstPoi.name);
      showToast(isFav ? '已取消收藏' : '已收藏攻略', 'success');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: guide.title,
      text: guide.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('链接已复制到剪贴板', 'success');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('链接已复制到剪贴板', 'success');
      } catch {
        showToast('分享失败', 'error');
      }
    }
  };

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  useEscKey(closeAddModal, showAddModal);

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-8">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={guide.image}
          alt={guide.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-2xl font-bold mb-2">{guide.title}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-xs">{guide.avatar}</span>
              </div>
              <span>{guide.author}</span>
            </div>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {guide.likes}
            </span>
            <span>{guide.views} 阅读</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6 relative z-10">
        {/* Guide Stats */}
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary-mid" />
              <span className="text-gray-700">{guide.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-mid" />
              <span className="text-gray-700">{guide.days}天{guide.nights}夜</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-primary-mid" />
              <span className="text-gray-700">{guide.people}人</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-mid">¥{guide.budget}</span>
            </div>
          </div>
        </GlassCard>

        {/* Description */}
        <GlassCard className="p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">攻略介绍</h2>
          <p className="text-gray-600 leading-relaxed">{guide.description}</p>
        </GlassCard>

        {/* POI Details */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">行程安排</h2>
            <button
              onClick={handleAddAll}
              className="gradient-button text-sm px-4 py-2 flex items-center gap-1"
            >
              <Plus size={14} />
              <span>添加全部</span>
            </button>
          </div>
          <div className="space-y-4">
            {guide.poiDetails.map((poi, idx) => (
              <GlassCard key={idx} className="overflow-hidden">
                <div className="flex">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <img
                      src={poi.image}
                      alt={poi.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded border ${typeColors[poi.type as keyof typeof typeColors]}`}>
                        {typeLabels[poi.type as keyof typeof typeLabels]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-800">{poi.name}</h3>
                      <button
                        onClick={() => handleAddPoi(poi.name)}
                        className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-lg shadow-primary-mid/30 hover:shadow-xl hover:shadow-primary-mid/40 transition-all active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>游玩时间：{poi.duration}</span>
                      {poi.price > 0 && (
                        <span>¥{poi.price}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{poi.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-24 left-0 right-0 glass-card mx-4 p-4 flex items-center gap-4 md:hidden z-30">
        <button onClick={handleFavorite} className={`flex flex-col items-center gap-1 p-2 ${favoritePOIs.includes(guide.poiDetails[0]?.name) ? 'text-favorite' : 'text-gray-500'}`}>
          <Heart size={22} fill={favoritePOIs.includes(guide.poiDetails[0]?.name) ? 'currentColor' : 'none'} />
          <span className="text-xs">收藏</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 p-2 text-gray-500">
          <Share2 size={22} />
          <span className="text-xs">分享</span>
        </button>
        <button
          onClick={handleAddAll}
          className="flex-1 gradient-button flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>添加全部到行程</span>
        </button>
      </div>

      {/* Add to Trip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-[90%] max-w-sm animate-bounce-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加到行程</h3>
            <p className="text-gray-600 mb-4">
              将「{selectedPoi}」添加到：
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {allTrips.length > 0 ? (
                <>
                  {allTrips.filter(t => t.status !== 'completed').length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 font-medium mb-2">进行中</p>
                      {allTrips.filter(t => t.status !== 'completed').map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => setSelectedTrip(trip.id)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedTrip === trip.id
                              ? 'bg-primary-mid/10 ring-2 ring-primary-mid'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{trip.name}</p>
                              <p className="text-xs text-gray-500">{trip.destination} · {trip.days}天</p>
                            </div>
                            {selectedTrip === trip.id && (
                              <div className="w-5 h-5 rounded-full bg-primary-mid flex items-center justify-center">
                                <Plus size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {allTrips.filter(t => t.status === 'completed').length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 font-medium mb-2 mt-4">历史行程</p>
                      {allTrips.filter(t => t.status === 'completed').map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => setSelectedTrip(trip.id)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedTrip === trip.id
                              ? 'bg-primary-mid/10 ring-2 ring-primary-mid'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800 flex items-center gap-2">
                                {trip.name}
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">已完成</span>
                              </p>
                              <p className="text-xs text-gray-500">{trip.destination} · {trip.days}天</p>
                            </div>
                            {selectedTrip === trip.id && (
                              <div className="w-5 h-5 rounded-full bg-primary-mid flex items-center justify-center">
                                <Plus size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">暂无行程，快去创建一个吧</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmAdd}
                disabled={!selectedTrip}
                className="flex-1 py-3 rounded-xl bg-gradient-primary text-white disabled:opacity-50 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
