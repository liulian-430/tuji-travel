import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Share2, Navigation, ChevronLeft, ChevronRight, Plus, X, Check, Route as RouteIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import WeatherWidget from '../components/ui/WeatherWidget';
import POICard from '../components/poi/POICard';
import { mockPOIs } from '../data/mock';
import type { TripPOI } from '../data/mock';
import { useState, useCallback, useMemo } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { useToastStore } from '@/store/useToastStore';
import { useEscKey } from '@/hooks/useEscKey';

export default function POIDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const { favoritePOIs, toggleFavoritePOI, trips, currentTripId, addPOIToTrip } = useTripStore();
  const { showToast } = useToastStore();

  const poi = mockPOIs.find((p) => p.id === id) || mockPOIs[0];
  const relatedPOIs = mockPOIs.filter((p) => p.id !== poi.id).slice(0, 3);
  const isFavorited = favoritePOIs.includes(poi.id);

  const currentTrip = useMemo(() => {
    if (currentTripId) {
      return trips.find((t) => t.id === currentTripId);
    }
    const planning = trips.filter((t) => t.status !== 'completed');
    return planning.length > 0 ? planning[0] : null;
  }, [trips, currentTripId]);

  const typeMap: Record<string, { label: string; color: string }> = {
    scenic: { label: '景点', color: 'bg-green-500/20 text-green-600' },
    food: { label: '美食', color: 'bg-red-500/20 text-red-600' },
    hotel: { label: '酒店', color: 'bg-blue-500/20 text-blue-600' },
    shopping: { label: '购物', color: 'bg-purple-500/20 text-purple-600' },
  };
  const typeInfo = typeMap[poi.type] || typeMap.scenic;

  // 打开外部地图导航（高德地图 URI，国内体验最佳）
  const openNavigation = () => {
    const url = `https://uri.amap.com/marker?position=${poi.longitude},${poi.latitude}&name=${encodeURIComponent(poi.name)}&coordinate=wgs84&callnative=1`;
    window.open(url, '_blank');
  };

  // 打开添加弹窗
  const handleAddClick = () => {
    if (!currentTrip) {
      showToast('请先创建一个行程', 'info');
      return;
    }
    setShowAddModal(true);
  };

  // 确认添加到行程
  const handleConfirmAdd = () => {
    if (!currentTrip) return;
    const newPoi: TripPOI = {
      id: `${poi.id}-${Date.now()}`,
      name: poi.name,
      type: poi.type,
      duration: '2小时',
      price: poi.price,
      image: poi.images[0] || '',
      latitude: poi.latitude,
      longitude: poi.longitude,
    };
    addPOIToTrip(currentTrip.id, newPoi);
    setShowAddModal(false);
    showToast('已添加到行程', 'success');
  };

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  useEscKey(closeAddModal, showAddModal);

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-8">
      {/* Image Gallery */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={poi.images[currentImage]}
          alt={poi.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        {poi.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? poi.images.length - 1 : prev - 1))}
              className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === poi.images.length - 1 ? 0 : prev + 1))}
              className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {poi.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentImage ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => toggleFavoritePOI(poi.id)}
            className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              isFavorited ? 'bg-favorite text-white scale-110' : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
            aria-label={isFavorited ? '取消收藏' : '收藏'}
          >
            <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: poi.name, text: poi.description, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            aria-label="分享"
          >
            <Share2 size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* Main Info */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{poi.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-800">{poi.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={16} />
              <span className="text-sm">{poi.city}</span>
            </div>
            {poi.price > 0 && (
              <span className="text-xl font-bold text-primary-mid">
                ¥{poi.price}
                <span className="text-sm text-gray-500 font-normal">/人</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{poi.openTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{poi.address}</span>
            <button
              onClick={openNavigation}
              className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors text-xs font-medium"
            >
              <Navigation size={14} />
              <span>导航</span>
            </button>
          </div>
        </GlassCard>

        {/* Weather */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-800 mb-3">当地天气</h2>
          <WeatherWidget city={poi.city} compact />
        </div>

        {/* Description */}
        <GlassCard className="p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">景点介绍</h2>
          <p className="text-gray-600 leading-relaxed">{poi.description}</p>
        </GlassCard>

        {/* Related POIs */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-800 mb-4">相关推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPOIs.map((related) => (
              <POICard key={related.id} poi={related} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-24 left-0 right-0 glass-card mx-4 p-4 flex items-center gap-4 md:hidden z-30">
        <button
          onClick={() => toggleFavoritePOI(poi.id)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isFavorited ? 'text-favorite' : 'text-gray-500'
          }`}
        >
          <Heart size={22} className={isFavorited ? 'fill-current' : ''} />
          <span className="text-xs">{isFavorited ? '已收藏' : '收藏'}</span>
        </button>
        <button
          onClick={handleAddClick}
          className="flex-1 gradient-button flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          添加到行程
        </button>
      </div>

      {/* 添加到行程弹窗 */}
      {showAddModal && currentTrip && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-bounce-in p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">添加到行程</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              将「{poi.name}」添加到：
            </p>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-mid/5 mb-6">
              <img
                src={currentTrip.coverImage}
                alt={currentTrip.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{currentTrip.name}</p>
                <p className="text-sm text-gray-500">{currentTrip.destination} · {currentTrip.days}天 · {currentTrip.pois?.length || 0}个景点</p>
              </div>
              <MapPin size={18} className="text-primary-mid flex-shrink-0" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-3 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
