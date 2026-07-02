import { useState } from 'react';
import { Star, Heart, Plus, X } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { POI, TripPOI } from '../../data/mock';
import { useTripStore } from '@/store/useTripStore';
import { useToastStore } from '@/store/useToastStore';
import { useEscKey } from '@/hooks/useEscKey';
import { useCallback } from 'react';

interface POICardProps {
  poi: POI;
  onClick?: () => void;
  compact?: boolean;
  showAddButton?: boolean;
}

const dayButtonColors = [
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-orange-500',
  'from-orange-500 to-amber-500',
];

export default function POICard({ poi, onClick, compact = false, showAddButton = false }: POICardProps) {
  const { favoritePOIs, toggleFavoritePOI, trips, addPOIToTrip, addDayToTrip } = useTripStore();
  const { showToast } = useToastStore();
  const isFavorited = favoritePOIs.includes(poi.id) || favoritePOIs.includes(poi.name);
  const [showAddModal, setShowAddModal] = useState(false);

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
    setShowAddModal(true);
  };

  const handleAddToDay = (day: number) => {
    if (trips.length === 0) return;
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
    addPOIToTrip(trips[0].id, newPoi, day);
    setShowAddModal(false);
    showToast(`已添加到 Day ${day}`, 'success');
  };

  const handleAddDay = () => {
    if (trips.length === 0) return;
    addDayToTrip(trips[0].id);
    showToast('已添加新天数', 'success');
  };

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  useEscKey(closeAddModal, showAddModal);

  const currentTrip = trips[0];
  const dayOptions = currentTrip?.daysList
    ? currentTrip.daysList.map((s) => s.day).sort((a, b) => a - b)
    : currentTrip
    ? Array.from({ length: currentTrip.days }, (_, i) => i + 1)
    : [];

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">添加到行程</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dayOptions.map((day) => {
                  const colorIndex = (day - 1) % dayButtonColors.length;
                  return (
                    <button
                      key={day}
                      onClick={() => handleAddToDay(day)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between transition-all hover:bg-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${dayButtonColors[colorIndex]}`}
                        >
                          {day}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">Day {day}</span>
                      </div>
                      <Plus size={16} className="text-primary-mid" />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleAddDay}
                className="w-full mt-3 py-2.5 rounded-xl text-sm text-primary-mid border-2 border-dashed border-primary-mid/30 hover:bg-primary-mid/5 transition-colors font-medium flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                添加新的一天
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
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {dayOptions.map((day) => {
                const colorIndex = (day - 1) % dayButtonColors.length;
                return (
                  <button
                    key={day}
                    onClick={() => handleAddToDay(day)}
                    className="w-full p-3 rounded-xl flex items-center justify-between transition-all hover:bg-white/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${dayButtonColors[colorIndex]}`}
                      >
                        {day}
                      </div>
                      <span className="font-medium text-gray-800">Day {day}</span>
                    </div>
                    <Plus size={18} className="text-primary-mid" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleAddDay}
              className="w-full mt-4 py-3 rounded-xl text-primary-mid border-2 border-dashed border-primary-mid/30 hover:bg-primary-mid/5 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              添加新的一天
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
