import { useState, useMemo } from 'react';
import { MapPin, Search, Plus, Navigation, Layers } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { mockTrips, mockDaySchedules } from '../data/mock';

export default function Map() {
  const [selectedTrip] = useState(mockTrips[0]);
  const [viewMode, setViewMode] = useState<'all' | number>('all'); // 'all' | 1 | 2 | 3...
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);

  const schedules = mockDaySchedules.filter((s) => s.tripId === selectedTrip.id);

  // 根据行程天数生成 Day 选项
  const dayOptions = useMemo(() => {
    const days = schedules.map(s => s.dayIndex);
    return days.sort((a, b) => a - b);
  }, [schedules]);

  // 获取当前显示的景点
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

  // 生成连线路径
  const linePath = useMemo(() => {
    if (displayedPois.length < 2) return '';
    
    // 模拟点位坐标（实际项目中使用真实经纬度）
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

  // Day 按钮颜色
  const dayButtonColors = [
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500',
    'from-rose-500 to-orange-500',
    'from-orange-500 to-amber-500',
  ];

  const handlePoiClick = (poiId: string, dayIndex: number) => {
    setSelectedPoi(poiId);
    // 如果当前查看全部行程，点击景点时切换到对应的天
    if (viewMode === 'all') {
      setViewMode(dayIndex);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-20 md:pt-8">
      {/* Map Area */}
      <div className="relative h-[50vh] md:h-[60vh] bg-gradient-to-br from-slate-100 via-indigo-50/30 to-pink-50/20 overflow-hidden">
        {/* SVG for markers and lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 连线 */}
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

        {/* 景点标记点 */}
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
              {/* Marker */}
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isSelected ? 'ring-4 ring-white ring-opacity-80' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${dayButtonColors[dayColorIndex].split(' ').slice(0, 2).join(', ')})`,
                }}
              >
                {/* 序号 */}
                <span className="text-white font-bold text-sm">{index + 1}</span>
                
                {/* 脉冲动画 */}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-gradient-primary opacity-50 animate-ping" style={{ animationDelay: '0.15s' }} />
                  </>
                )}
              </div>
              
              {/* 景点名称标签 */}
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

        {/* 当前位置标记 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Navigation size={16} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">当前位置</p>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="glass-card p-3 hover:bg-white/30 transition-colors">
            <Layers size={20} className="text-gray-700" />
          </button>
        </div>

        {/* 地图提示 */}
        <div className="absolute bottom-4 right-4 glass-card px-3 py-2 text-xs text-gray-500">
          <span>点击景点可切换到对应行程</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="px-4 md:px-6 py-4 bg-white/80 backdrop-blur-xl sticky top-20 md:top-8 z-40 border-b border-white/20">
        <div className="max-w-4xl mx-auto">
          {/* 行程选择器 */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
            {/* 全部行程 */}
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
            
            {/* Day 选择 */}
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

          {/* 当前显示信息 */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              {viewMode === 'all' 
                ? `显示全部行程，共 ${displayedPois.length} 个景点`
                : `Day ${viewMode} 行程，共 ${displayedPois.length} 个景点`
              }
            </p>
            {viewMode !== 'all' && (
              <p className="text-xs text-gray-400">
                景点按顺序连线展示
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 景点列表 */}
      <div className="px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedPois.map((item, index) => {
              const isSelected = selectedPoi === item.id;
              const dayColorIndex = (item.dayIndex - 1) % dayButtonColors.length;
              
              return (
                <GlassCard
                  key={item.id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-mid' : ''
                  }`}
                  onClick={() => handlePoiClick(item.id, item.dayIndex)}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* 序号 */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${dayButtonColors[dayColorIndex].split(' ').slice(0, 2).join(', ')})`,
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    {/* 图片 */}
                    <img
                      src={item.poi.images[0]}
                      alt={item.poi.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[item.type]}`}>
                          {typeLabels[item.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.startTime}
                        </span>
                        {viewMode === 'all' && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{
                              background: `linear-gradient(135deg, ${dayButtonColors[dayColorIndex].split(' ').slice(0, 2).join(', ')})`,
                            }}
                          >
                            Day{item.dayIndex}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800 truncate">
                        {item.poi.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {item.poi.address}
                      </p>
                    </div>
                  </div>
                </GlassCard>
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
    </div>
  );
}