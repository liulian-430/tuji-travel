import { useState, useMemo, useRef } from 'react';
import { MapPin, Search, Plus, Navigation, Layers, ChevronDown, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { mockTrips, mockDaySchedules, mockPOIs } from '../data/mock';

export default function Map() {
  const [selectedTrip] = useState(mockTrips[0]);
  const [viewMode, setViewMode] = useState<'all' | number>('all');
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [poiToAdd, setPoiToAdd] = useState<string | null>(null);
  const [schedules, setSchedules] = useState(mockDaySchedules.filter((s) => s.tripId === selectedTrip.id));

  const dayOptions = useMemo(() => {
    const days = schedules.map(s => s.dayIndex);
    return days.sort((a, b) => a - b);
  }, [schedules]);

  const displayedPois = useMemo(() => {
    if (viewMode === 'all') {
      return schedules.flatMap(day => day.items.map(item => ({
        ...item,
        dayIndex: day.dayIndex,
      })));
    }
    const daySchedule = schedules.find(s => s.dayIndex === viewMode);
    return daySchedule ? daySchedule.items.map(item => ({
      ...item,
      dayIndex: daySchedule.dayIndex,
    })) : [];
  }, [schedules, viewMode]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mockPOIs.filter(poi =>
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const linePath = useMemo(() => {
    if (displayedPois.length < 2) return '';
    
    const positions = displayedPois.map((item, index) => ({
      x: 15 + (index % 4) * 22,
      y: 30 + Math.floor(index / 4) * 25,
    }));

    return positions.map((pos, i) => 
      i === 0 ? `M ${pos.x}% ${pos.y}%` : `L ${pos.x}% ${pos.y}%`
    ).join(' ');
  }, [displayedPois]);

  const typeColors = {
    scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
    food: 'bg-red-500/20 text-red-600 border-red-500/30',
    hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    transport: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
    shopping: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  };

  const typeLabels = {
    scenic: '景点',
    food: '美食',
    hotel: '住宿',
    transport: '交通',
    shopping: '购物',
  };

  const dayButtonColors = [
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500',
    'from-rose-500 to-orange-500',
    'from-orange-500 to-amber-500',
  ];

  const handlePoiClick = (poiId: string, dayIndex: number) => {
    setSelectedPoi(poiId);
    if (viewMode === 'all') {
      setViewMode(dayIndex);
    }
  };

  const handleSearchPoiClick = (poiId: string) => {
    setPoiToAdd(poiId);
    setShowAddDayModal(true);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleAddToDay = (dayIndex: number) => {
    if (!poiToAdd) return;
    const poi = mockPOIs.find(p => p.id === poiToAdd);
    if (!poi) return;

    const newItem = {
      id: `${dayIndex}-${Date.now()}`,
      poiId: poi.id,
      poi,
      startTime: '09:00',
      endTime: '11:00',
      type: poi.type as 'scenic' | 'food' | 'hotel' | 'transport' | 'shopping',
    };

    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayIndex === dayIndex) {
        return { ...schedule, items: [...schedule.items, newItem] };
      }
      return schedule;
    }));

    setShowAddDayModal(false);
    setPoiToAdd(null);
    setViewMode(dayIndex);
  };

  const handleMoveToDay = (poiId: string, currentDay: number, newDay: number) => {
    if (currentDay === newDay) return;

    setSchedules(prev => {
      const newSchedules = prev.map(schedule => {
        if (schedule.dayIndex === currentDay) {
          return { ...schedule, items: schedule.items.filter(i => i.id !== poiId) };
        }
        if (schedule.dayIndex === newDay) {
          const movedItem = prev
            .find(s => s.dayIndex === currentDay)
            ?.items.find(i => i.id === poiId);
          if (movedItem) {
            return { ...schedule, items: [...schedule.items, movedItem] };
          }
        }
        return schedule;
      });
      return newSchedules;
    });

    if (viewMode === currentDay) {
      setSelectedPoi(null);
    }
  };

  const handleDeletePoi = (poiId: string, dayIndex: number) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayIndex === dayIndex) {
        return { ...schedule, items: schedule.items.filter(i => i.id !== poiId) };
      }
      return schedule;
    }));
    if (selectedPoi === poiId) {
      setSelectedPoi(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-20 md:pt-8">
      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 bg-white/30 backdrop-blur-xl border-b border-white/20 sticky top-20 md:top-8 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.trim() !== '');
              }}
              placeholder="搜索景点、美食、酒店..."
              className="w-full bg-white/30 backdrop-blur-xl border border-white/30 rounded-xl pl-11 pr-4 py-3 text-gray-700 placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-primary-mid/30"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white/80 backdrop-blur-xl rounded-xl border border-white/40 shadow-xl max-h-64 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => handleSearchPoiClick(poi.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/50 transition-colors text-left"
                  >
                    <img
                      src={poi.images[0]}
                      alt={poi.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{poi.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded ${typeColors[poi.type]}`}>
                          {typeLabels[poi.type]}
                        </span>
                        <span className="text-xs text-gray-500">{poi.city}</span>
                      </div>
                    </div>
                    <Plus size={18} className="text-primary-mid" />
                  </button>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 text-sm">未找到相关结果</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[40vh] md:h-[45vh] bg-gradient-to-br from-slate-100 via-indigo-50/30 to-pink-50/20 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={viewMode !== 'all' ? '0.8' : '0.5'}
            />
          )}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {displayedPois.map((item, index) => {
          const x = 15 + (index % 4) * 22;
          const y = 30 + Math.floor(index / 4) * 25;
          const isSelected = selectedPoi === item.id;
          const dayColorIndex = (item.dayIndex - 1) % dayButtonColors.length;
          
          return (
            <button
              key={item.id}
              onClick={() => handlePoiClick(item.id, item.dayIndex)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isSelected ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isSelected ? 'ring-4 ring-white ring-opacity-80' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${dayButtonColors[dayColorIndex].split(' ').slice(0, 2).join(', ')})`,
                }}
              >
                <span className="text-white font-bold text-sm">{index + 1}</span>
                {isSelected && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-gradient-primary opacity-50 animate-ping" style={{ animationDelay: '0.15s' }} />
                  </>
                )}
              </div>
              
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white shadow-lg text-gray-800'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600'
                }`}
              >
                {item.poi.name}
                {viewMode === 'all' && (
                  <span className={`ml-1 text-xs opacity-60`}>
                    Day{item.dayIndex}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Navigation size={16} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">当前位置</p>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="glass-card p-3 hover:bg-white/30 transition-colors">
            <Layers size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="px-4 md:px-6 py-4 bg-white/30 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setViewMode('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
            >
              全部行程
            </button>
            
            {dayOptions.map((day) => {
              const colorIndex = (day - 1) % dayButtonColors.length;
              return (
                <button
                  key={day}
                  onClick={() => setViewMode(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                    viewMode === day
                      ? `bg-gradient-to-r ${dayButtonColors[colorIndex]} text-white shadow-lg`
                      : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }`}
                >
                  Day {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* POI List */}
      <div className="px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPois.map((item, index) => {
              const isSelected = selectedPoi === item.id;
              const dayColorIndex = (item.dayIndex - 1) % dayButtonColors.length;
              
              return (
                <SwipeableCard
                  key={item.id}
                  onDelete={() => handleDeletePoi(item.id, item.dayIndex)}
                >
                  <GlassCard
                    className={`overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary-mid' : ''
                    }`}
                    onClick={() => handlePoiClick(item.id, item.dayIndex)}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${dayButtonColors[dayColorIndex].split(' ').slice(0, 2).join(', ')})`,
                        }}
                      >
                        {index + 1}
                      </div>
                      
                      <img
                        src={item.poi.images[0]}
                        alt={item.poi.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[item.type]}`}>
                            {typeLabels[item.type]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.startTime}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800 truncate">
                          {item.poi.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {item.poi.address}
                        </p>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPoiToAdd(item.id);
                            setShowAddDayModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/50 transition-colors flex items-center gap-1"
                        >
                          <span className="text-xs text-gray-500">Day{item.dayIndex}</span>
                          <ChevronDown size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </SwipeableCard>
              );
            })}
          </div>

          {displayedPois.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={32} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无景点数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Add to Day Modal */}
      {showAddDayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-[90%] max-w-sm animate-bounce-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {poiToAdd ? '选择添加到哪一天' : '移动到哪一天'}
            </h3>
            <div className="space-y-2">
              {dayOptions.map((day) => {
                const colorIndex = (day - 1) % dayButtonColors.length;
                return (
                  <button
                    key={day}
                    onClick={() => handleAddToDay(day)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all hover:bg-white/50 ${
                      viewMode === day ? `ring-2 ring-primary-mid` : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${dayButtonColors[colorIndex].split(' ').slice(0, 2).join(', ')})`,
                        }}
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
              onClick={() => {
                setShowAddDayModal(false);
                setPoiToAdd(null);
              }}
              className="w-full mt-6 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SwipeableCard({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const DELETE_THRESHOLD = 80;
  const DELETE_WIDTH = 72;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startXRef.current;
    let newX = currentXRef.current + diff;
    if (newX > 0) newX = newX * 0.3;
    if (newX < -DELETE_WIDTH * 1.5) newX = -DELETE_WIDTH * 1.5;
    setTranslateX(newX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < -DELETE_THRESHOLD) {
      setTranslateX(-DELETE_WIDTH);
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    currentXRef.current = translateX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    let newX = currentXRef.current + diff;
    if (newX > 0) newX = newX * 0.3;
    if (newX < -DELETE_WIDTH * 1.5) newX = -DELETE_WIDTH * 1.5;
    setTranslateX(newX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (translateX < -DELETE_THRESHOLD) {
      setTranslateX(-DELETE_WIDTH);
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (translateX < -DELETE_THRESHOLD) {
        setTranslateX(-DELETE_WIDTH);
      } else {
        setTranslateX(0);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-2xl"
        style={{
          width: DELETE_WIDTH,
          opacity: translateX < -5 ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.55), rgba(220, 38, 38, 0.45))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.15)',
        }}
      >
        <button
          onClick={onDelete}
          className="flex flex-col items-center gap-1 text-red-50"
          style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }}
        >
          <Trash2 size={20} />
          <span className="text-xs font-medium">删除</span>
        </button>
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
