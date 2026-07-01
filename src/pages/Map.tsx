import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Plus, Navigation, Layers, ChevronDown, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import { mockPOIs } from '../data/mock';
import type { POI, TripPOI } from '../data/mock';
import { useTripStore } from '@/store/useTripStore';

// POI 类型对应的圆点颜色（用于地图 Marker）
const poiTypeColors: Record<string, string> = {
  scenic: '#22c55e',
  food: '#ef4444',
  hotel: '#3b82f6',
  shopping: '#a855f7',
};

// 类型样式配置
const typeColors = {
  scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
  food: 'bg-red-500/20 text-red-600 border-red-500/30',
  hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  transport: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  shopping: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

// 类型标签
const typeLabels = {
  scenic: '景点',
  food: '美食',
  hotel: '住宿',
  transport: '交通',
  shopping: '购物',
};

// Day 按钮渐变配色
const dayButtonColors = [
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-orange-500',
  'from-orange-500 to-amber-500',
];

// 创建自定义圆点图标：根据 POI 类型上色，选中时放大高亮
const createPoiIcon = (type: string, selected: boolean) => {
  const color = poiTypeColors[type] || '#6366f1';
  const size = selected ? 26 : 18;
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        border:3px solid #fff;
        box-shadow:0 0 0 2px ${color}55, 0 2px 8px rgba(0,0,0,0.35);
        transition:all 0.2s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// 捕获地图实例并根据 Marker 列表自动调整视野
function MapController({
  positions,
  mapRef,
}: {
  positions: [number, number][];
  mapRef: { current: L.Map | null };
}) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50], maxZoom: 14 });
    }
  }, [positions, map]);
  return null;
}

export default function Map() {
  const navigate = useNavigate();
  const { trips, addPOIToTrip, removePOIFromTrip } = useTripStore();

  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | number>('all');
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [poiToAdd, setPoiToAdd] = useState<POI | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // 默认选中第一个行程
  useEffect(() => {
    if (trips.length > 0 && !trips.find((t) => t.id === selectedTripId)) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  const selectedTrip = useMemo(() => {
    if (trips.length === 0) return null;
    return trips.find((t) => t.id === selectedTripId) || trips[0];
  }, [trips, selectedTripId]);

  // Day 选项：优先使用 daysList，否则按行程天数生成
  const dayOptions = useMemo(() => {
    if (!selectedTrip) return [];
    const daysList = selectedTrip.daysList;
    if (daysList && daysList.length > 0) {
      return daysList.map((s) => s.day).sort((a, b) => a - b);
    }
    return Array.from({ length: selectedTrip.days }, (_, i) => i + 1);
  }, [selectedTrip]);

  // 获取某一天的 POI 列表（合并早中晚）
  const getPoisForDay = (day: number): TripPOI[] => {
    if (!selectedTrip?.daysList) return [];
    const sched = selectedTrip.daysList.find((s) => s.day === day);
    if (!sched) return [];
    return [
      ...(sched.morning || []),
      ...(sched.afternoon || []),
      ...(sched.evening || []),
    ];
  };

  // 根据 POI id 查找所属天数
  const getDayForPoi = (poiId: string): number | null => {
    if (!selectedTrip?.daysList) return null;
    for (const d of selectedTrip.daysList) {
      const all = [...(d.morning || []), ...(d.afternoon || []), ...(d.evening || [])];
      if (all.some((p) => p.id === poiId)) return d.day;
    }
    return null;
  };

  // 当前展示的 POI 列表
  const displayedPois = useMemo(() => {
    if (!selectedTrip) return [];
    if (viewMode === 'all') return selectedTrip.pois;
    return getPoisForDay(viewMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip, viewMode]);

  // 用于地图 Marker 的位置数据
  const markerData = useMemo(() => {
    return displayedPois
      .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
      .map((p) => ({
        poi: p,
        position: [p.latitude as number, p.longitude as number] as [number, number],
        day: getDayForPoi(p.id),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedPois, selectedTrip]);

  const fitPositions = useMemo(() => markerData.map((m) => m.position), [markerData]);

  // 默认中心点（无坐标 POI 时回退到北京）
  const mapCenter: [number, number] = markerData[0]?.position ?? [39.9042, 116.4074];

  // 搜索结果（基于 mockPOIs 景点池）
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return mockPOIs.filter(
      (poi) => poi.name.toLowerCase().includes(q) || poi.city.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // 点击 POI 卡片：高亮并平移到该坐标
  const handlePoiClick = (poi: TripPOI) => {
    setSelectedPoi(poi.id);
    if (typeof poi.latitude === 'number' && typeof poi.longitude === 'number') {
      mapRef.current?.panTo([poi.latitude, poi.longitude]);
    }
  };

  // 点击搜索结果：打开"添加到某天"弹窗
  const handleSearchPoiClick = (poi: POI) => {
    setPoiToAdd(poi);
    setShowAddDayModal(true);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // 确认添加到某天：转换为 TripPOI 写入 store
  const handleAddToDay = (day: number) => {
    if (!poiToAdd || !selectedTrip) return;
    const newPoi: TripPOI = {
      id: `${poiToAdd.id}-${Date.now()}`,
      name: poiToAdd.name,
      type: poiToAdd.type,
      duration: '2小时',
      price: poiToAdd.price,
      image: poiToAdd.images[0] || '',
      latitude: poiToAdd.latitude,
      longitude: poiToAdd.longitude,
    };
    addPOIToTrip(selectedTrip.id, newPoi);
    setShowAddDayModal(false);
    setPoiToAdd(null);
    setViewMode('all');
  };

  // 右滑删除：从 store 中移除
  const handleDeletePoi = (poiId: string) => {
    if (!selectedTrip) return;
    removePOIFromTrip(selectedTrip.id, poiId);
    if (selectedPoi === poiId) setSelectedPoi(null);
  };

  // 重置地图视野
  const handleResetView = () => {
    if (fitPositions.length > 1) {
      mapRef.current?.fitBounds(L.latLngBounds(fitPositions), { padding: [50, 50], maxZoom: 14 });
    } else if (fitPositions.length === 1) {
      mapRef.current?.setView(fitPositions[0], 14);
    } else {
      mapRef.current?.setView(mapCenter, 12);
    }
  };

  // 空状态：store 中没有行程数据
  if (trips.length === 0 || !selectedTrip) {
    return (
      <div className="min-h-screen pt-20 md:pt-8 flex items-center justify-center px-4">
        <EmptyState
          icon={MapPin}
          title="还没有行程"
          description="创建你的第一个行程，即可在地图上查看景点分布与每日路线。"
          actionText="去创建行程"
          onAction={() => navigate('/ai-planner')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-20 md:pt-8">
      {/* 顶部搜索框 */}
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

          {/* 搜索结果下拉 */}
          {showSearchResults && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white/80 backdrop-blur-xl rounded-xl border border-white/40 shadow-xl max-h-64 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => handleSearchPoiClick(poi)}
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

      {/* 地图区域 */}
      <div className="relative h-[40vh] md:h-[45vh] overflow-hidden">
        <MapContainer
          key={selectedTrip.id}
          center={mapCenter}
          zoom={12}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markerData.map(({ poi, position, day }) => (
            <Marker
              key={poi.id}
              position={position}
              icon={createPoiIcon(poi.type, selectedPoi === poi.id)}
              eventHandlers={{ click: () => setSelectedPoi(poi.id) }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: poiTypeColors[poi.type] || '#6366f1' }}
                    />
                    <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[poi.type]}`}>
                      {typeLabels[poi.type]}
                    </span>
                    {day && <span className="text-xs text-gray-500">Day {day}</span>}
                  </div>
                  <p className="font-semibold text-gray-800">{poi.name}</p>
                  {poi.duration && (
                    <p className="text-xs text-gray-500 mt-1">游玩时长：{poi.duration}</p>
                  )}
                  {poi.price > 0 && <p className="text-xs text-primary-mid mt-0.5">¥{poi.price}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController positions={fitPositions} mapRef={mapRef} />
        </MapContainer>

        {/* 行程选择器（存在多个行程时显示） */}
        {trips.length > 1 && (
          <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2 overflow-x-auto scrollbar-hide">
            {trips.map((trip) => {
              const active = trip.id === selectedTrip.id;
              return (
                <button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setViewMode('all');
                    setSelectedPoi(null);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-xl border transition-all ${
                    active
                      ? 'bg-gradient-primary text-white border-transparent shadow-lg'
                      : 'bg-white/60 text-gray-700 border-white/40 hover:bg-white/80'
                  }`}
                >
                  {trip.name}
                </button>
              );
            })}
          </div>
        )}

        {/* 地图右上角工具按钮 */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button className="glass-card p-3 hover:bg-white/40 transition-colors">
            <Layers size={20} className="text-gray-700" />
          </button>
          <button
            onClick={handleResetView}
            className="glass-card p-3 hover:bg-white/40 transition-colors"
          >
            <Navigation size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Marker 颜色图例 */}
        <div className="absolute bottom-3 left-3 z-[1000] glass-card px-3 py-2 flex flex-col gap-1">
          {(['scenic', 'food', 'hotel', 'shopping'] as const).map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: poiTypeColors[t] }}
              />
              <span className="text-xs text-gray-700">{typeLabels[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day 切换栏 */}
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

      {/* POI 卡片列表 */}
      <div className="px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPois.map((poi, index) => {
              const isSelected = selectedPoi === poi.id;
              const dayColorIndex = index % dayButtonColors.length;
              const day = getDayForPoi(poi.id);

              return (
                <SwipeableCard key={poi.id} onDelete={() => handleDeletePoi(poi.id)}>
                  <GlassCard
                    className={`overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary-mid' : ''
                    }`}
                    onClick={() => handlePoiClick(poi)}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 bg-gradient-to-br ${dayButtonColors[dayColorIndex]}`}
                      >
                        {index + 1}
                      </div>

                      <img
                        src={poi.image}
                        alt={poi.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[poi.type]}`}>
                            {typeLabels[poi.type]}
                          </span>
                          {poi.duration && (
                            <span className="text-xs text-gray-500">{poi.duration}</span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-800 truncate">{poi.name}</h4>
                        {poi.price > 0 && (
                          <p className="text-sm text-primary-mid mt-1">¥{poi.price}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>{day ? `Day${day}` : '全部'}</span>
                        <ChevronDown size={14} className="text-gray-400" />
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
              <p className="text-gray-500">这一天还没有安排景点</p>
              <p className="text-gray-400 text-sm mt-1">通过顶部搜索添加景点到行程</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加到某天弹窗 */}
      {showAddDayModal && poiToAdd && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-[90%] max-w-sm animate-bounce-in">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={poiToAdd.images[0]}
                alt={poiToAdd.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-800">添加到某一天</h3>
                <p className="text-xs text-gray-500">{poiToAdd.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              {dayOptions.map((day) => {
                const colorIndex = (day - 1) % dayButtonColors.length;
                return (
                  <button
                    key={day}
                    onClick={() => handleAddToDay(day)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all hover:bg-white/50 ${
                      viewMode === day ? 'ring-2 ring-primary-mid' : ''
                    }`}
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
              {dayOptions.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">暂无可选天数</p>
              )}
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

/* 右滑删除卡片组件（保持不变） */
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
