import { useState, useCallback } from 'react';
import { Star, Heart, Plus, X } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { POI, TripPOI } from '../../data/mock';
import { useTripStore } from '@/store/useTripStore';
import { useToastStore } from '@/store/useToastStore';
import { useEscKey } from '@/hooks/useEscKey';

interface POICardProps {
  poi: POI;
  onClick?: () => void;
  compact?: boolean;
  showAddButton?: boolean;
}

export default function POICard({ poi, onClick, compact = false, showAddButton = false }: POICardProps) {
  const { favoritePOIs, toggleFavoritePOI, trips, addPOIToTrip } = useTripStore();
  const { showToast } = useToastStore();
  const isFavorited = favoritePOIs.includes(poi.id) || favoritePOIs.includes(poi.name);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string>('');

  const typeMap = {
    scenic: { label: '景点', color: 'bg-green-500/20 text-green-600' },
    food: { label: '美食', color: 'bg-red-500/20 text-red-600' },
    hotel: { label: '酒店', color: 'bg-blue-500/20 text-blue-600' },
    shopping: { label: '购物', color: 'bg-purple-500/20 text-purple-600' },
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoritePOI(poi.id);
    if (!favoritePOIs.includes(poi.id)) {
      showToast('已收藏', 'success');
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trips.length === 0) {
      showToast('请先创建一个行程', 'info');
      return;
    }
    setSelectedTrip(trips[0].id);
    setShowAddModal(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedTrip) return;
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
    addPOIToTrip(selectedTrip, newPoi);
    setShowAddModal(false);
    showToast('已添加到行程', 'success');
  };

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  useEscKey(closeAddModal, showAddModal);

  if (compact) {
    return (
      <GlassCard className="p-3 flex gap-3" onClick={onClick}>
        <img
          src={poi.images[0]}
          alt={poi.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{poi.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600">{poi.rating}</span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{poi.address}</p>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={handleFavorite} className="p-1">
            <Heart size={16} className={`transition-colors ${isFavorited ? 'text-favorite fill-favorite' : 'text-gray-400 hover:text-favorite'}`} />
          </button>
          {showAddButton && (
            <button onClick={handleAddClick} className="p-1">
              <Plus size={16} className="text-primary-mid" />
            </button>
          )}
        </div>

        {showAddModal && (
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 w-[85%] max-w-sm animate-bounce-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">添加到行程</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {trips.map((trip) => {
                  const active = trip.id === selectedTrip;
                  return (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip.id)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        active
                          ? 'bg-primary-mid/10 ring-2 ring-primary-mid'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    >
                      <img
                        src={trip.coverImage}
                        alt={trip.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-gray-800 text-sm truncate">{trip.name}</p>
                        <p className="text-xs text-gray-500">{trip.days}天 · {trip.pois?.length || 0}个景点</p>
                      </div>
                      {active && <Plus size={16} className="text-primary-mid flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleConfirmAdd}
                className="w-full py-2.5 rounded-xl bg-gradient-primary text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all"
              >
                确认添加
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden" onClick={onClick}>
      <div className="relative h-44 overflow-hidden group">
        <img
          src={poi.images[0]}
          alt={poi.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeMap[poi.type].color}`}>
            {typeMap[poi.type].label}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart size={16} className={`transition-colors ${isFavorited ? 'text-favorite fill-favorite' : 'text-gray-600 hover:text-favorite'}`} />
          </button>
          {showAddButton && (
            <button
              onClick={handleAddClick}
              className="p-2 rounded-full bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {poi.price > 0 && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm">
              ¥{poi.price}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 truncate">{poi.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-700 font-medium">{poi.rating}</span>
          </div>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500 truncate">{poi.city}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{poi.description}</p>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-[90%] max-w-sm animate-bounce-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">添加到行程</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
              {trips.map((trip) => {
                const active = trip.id === selectedTrip;
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      active
                        ? 'bg-primary-mid/10 ring-2 ring-primary-mid'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  >
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-800 truncate">{trip.name}</p>
                      <p className="text-xs text-gray-500">{trip.days}天 · {trip.pois?.length || 0}个景点</p>
                    </div>
                    {active && <Plus size={18} className="text-primary-mid flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleConfirmAdd}
              className="w-full py-3 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              确认添加
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
