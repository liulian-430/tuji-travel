import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Share2, Navigation, ChevronLeft, ChevronRight, Plus, X, Check, Route as RouteIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import POICard from '../components/poi/POICard';
import { mockPOIs } from '../data/mock';
import type { TripPOI } from '../data/mock';
import { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';

export default function POIDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedTripId, setAddedTripId] = useState<string | null>(null);

  const { favoritePOIs, toggleFavoritePOI, trips, addPOIToTrip } = useTripStore();

  const poi = mockPOIs.find((p) => p.id === id) || mockPOIs[0];
  const relatedPOIs = mockPOIs.filter((p) => p.id !== poi.id).slice(0, 3);
  const isFavorited = favoritePOIs.includes(poi.id);

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

  // 添加到指定行程
  const handleAddToTrip = (tripId: string) => {
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
    addPOIToTrip(tripId, newPoi);
    setAddedTripId(tripId);
    // 1.2s 后关闭弹窗并跳转到行程地图
    setTimeout(() => {
      setShowAddModal(false);
      setAddedTripId(null);
      navigate(`/map?trip=${tripId}`);
    }, 1200);
  };

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
          onClick={() => setShowAddModal(true)}
          className="flex-1 gradient-button flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          添加到行程
        </button>
      </div>

      {/* 添加到行程弹窗 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !addedTripId && setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-bounce-in max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">添加到行程</h3>
              {!addedTripId && (
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <RouteIcon size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">还没有行程</p>
                  <button
                    onClick={() => navigate('/ai-planner')}
                    className="gradient-button text-sm px-6 py-2"
                  >
                    去创建行程
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => handleAddToTrip(trip.id)}
                      disabled={!!addedTripId}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        addedTripId === trip.id
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 hover:border-primary-mid/50 hover:bg-primary-mid/5'
                      } disabled:cursor-not-allowed`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{trip.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {trip.destination} · {trip.days}天 · {trip.pois?.length || 0}个景点
                        </p>
                      </div>
                      {addedTripId === trip.id ? (
                        <Check size={20} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <Plus size={18} className="text-primary-mid flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {trips.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    navigate('/ai-planner');
                  }}
                  disabled={!!addedTripId}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm hover:border-primary-mid/50 hover:text-primary-mid transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus size={16} />
                  创建新行程
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
