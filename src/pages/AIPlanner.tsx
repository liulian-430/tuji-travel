import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Sparkles, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { travelPreferences, mockPOIs, DaySchedule } from '../data/mock';

export default function AIPlanner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [nights, setNights] = useState(2);
  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [budget, setBudget] = useState(3000);
  const [isGenerated, setIsGenerated] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);

  const togglePref = (id: string) => {
    setSelectedPrefs(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    const mockSchedule: DaySchedule[] = [
      {
        id: '1',
        tripId: 'new',
        dayIndex: 1,
        date: startDate || '2026-07-15',
        items: mockPOIs.slice(0, 3).map((poi, idx) => ({
          id: `1-${idx}`,
          poiId: poi.id,
          poi,
          startTime: `${9 + idx * 3}:00`,
          endTime: `${11 + idx * 3}:00`,
          type: poi.type as 'scenic' | 'food' | 'hotel' | 'transport',
        })),
      },
      {
        id: '2',
        tripId: 'new',
        dayIndex: 2,
        date: startDate || '2026-07-16',
        items: mockPOIs.slice(3, 5).map((poi, idx) => ({
          id: `2-${idx}`,
          poiId: poi.id,
          poi,
          startTime: `${9 + idx * 3}:00`,
          endTime: `${11 + idx * 3}:00`,
          type: poi.type as 'scenic' | 'food' | 'hotel' | 'transport',
        })),
      },
    ];
    setSchedules(mockSchedule);
    setIsGenerated(true);
  };

  const moveItem = (dayIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    setSchedules(prev => prev.map((day, di) => {
      if (di !== dayIndex) return day;
      const items = [...day.items];
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex < 0 || newIndex >= items.length) return day;
      [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
      return { ...day, items };
    }));
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    setSchedules(prev => prev.map((day, di) => {
      if (di !== dayIndex) return day;
      return { ...day, items: day.items.filter((_, i) => i !== itemIndex) };
    }));
  };

  const typeColors = {
    scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
    food: 'bg-red-500/20 text-red-600 border-red-500/30',
    hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    transport: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          <span className="gradient-text">AI 智能规划</span>
        </h1>

        {!isGenerated ? (
          <>
            {/* Step 1: Basic Info */}
            <div className={`mb-8 ${step === 1 ? 'block' : 'hidden md:block'}`}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">行程基本信息</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <MapPin size={16} className="inline mr-1 text-primary-mid" />
                      目的地城市
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="例如：北京、上海、成都"
                      className="glass-input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        <Calendar size={16} className="inline mr-1 text-primary-mid" />
                        行程天数
                      </label>
                      <input
                        type="number"
                        value={days}
                        onChange={(e) => {
                          setDays(Number(e.target.value));
                          if (Number(e.target.value) <= nights) {
                            setNights(Number(e.target.value) - 1);
                          }
                        }}
                        min={1}
                        max={30}
                        className="glass-input w-full"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">天</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        <Calendar size={16} className="inline mr-1 text-primary-mid" />
                        住宿夜数
                      </label>
                      <input
                        type="number"
                        value={nights}
                        onChange={(e) => {
                          if (Number(e.target.value) < days) {
                            setNights(Number(e.target.value));
                          }
                        }}
                        min={0}
                        max={days - 1}
                        className="glass-input w-full"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">夜</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        <Users size={16} className="inline mr-1 text-primary-mid" />
                        出行人数
                      </label>
                      <input
                        type="number"
                        value={people}
                        onChange={(e) => setPeople(Number(e.target.value))}
                        min={1}
                        max={20}
                        className="glass-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        <Calendar size={16} className="inline mr-1 text-primary-mid" />
                        出发日期
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="glass-input w-full"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="gradient-button w-full mt-6"
                >
                  下一步：偏好设置
                </button>
              </GlassCard>
            </div>

            {/* Step 2: Preferences */}
            <div className={`mb-8 ${step === 2 ? 'block' : 'hidden md:block'}`}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">旅行偏好设置</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-3">
                    选择您感兴趣的旅行主题（可多选）
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {travelPreferences.map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => togglePref(pref.id)}
                        className={`tag flex items-center gap-2 ${
                          selectedPrefs.includes(pref.id)
                            ? 'bg-primary-mid/30 border-primary-mid text-primary-mid'
                            : ''
                        }`}
                      >
                        {pref.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-3">
                    预算范围：¥{budget.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    min={1000}
                    max={20000}
                    step={500}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${(budget / 20000) * 100}%, #e5e7eb ${(budget / 20000) * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>¥1,000</span>
                    <span>¥20,000</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="glass-card px-6 py-3 flex-1 text-center hover:bg-white/20 transition-colors"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="gradient-button flex-1 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    <span>AI 生成行程</span>
                  </button>
                </div>
              </GlassCard>
            </div>
          </>
        ) : (
          <>
            {/* Generated Itinerary */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">生成的行程安排</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsGenerated(false)}
                    className="tag text-sm"
                  >
                    重新生成
                  </button>
                  <button
                    onClick={() => navigate('/trip/new')}
                    className="gradient-button text-sm px-4 py-2"
                  >
                    保存行程
                  </button>
                </div>
              </div>

              {/* Trip Summary */}
              <GlassCard className="p-4 mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-primary-mid" />
                    <span>{destination || '北京'}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span>{days}天{nights}夜</span>
                  <span className="text-gray-300">|</span>
                  <span>{people}人</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-primary-mid">¥{budget.toLocaleString()}</span>
                </div>
              </GlassCard>

              {/* Timeline */}
              <div className="relative">
                <div className="timeline-line" />
                {schedules.map((day, dayIndex) => (
                  <div key={day.id} className="relative pl-12 mb-8">
                    <div className="timeline-dot" />
                    <GlassCard className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">
                          第 {day.dayIndex} 天
                        </h3>
                        <span className="text-sm text-gray-500">{day.date}</span>
                      </div>

                      <div className="space-y-4">
                        {day.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="relative bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={item.poi.images[0]}
                                alt={item.poi.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[item.type]}`}>
                                    {item.type === 'scenic' ? '景点' :
                                     item.type === 'food' ? '美食' :
                                     item.type === 'hotel' ? '住宿' : '交通'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-800 truncate">
                                  {item.poi.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {item.poi.address}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => moveItem(dayIndex, itemIndex, 'up')}
                                  disabled={itemIndex === 0}
                                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <button
                                  onClick={() => moveItem(dayIndex, itemIndex, 'down')}
                                  disabled={itemIndex === day.items.length - 1}
                                  className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(dayIndex, itemIndex)}
                              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button className="w-full mt-4 py-2 border border-dashed border-white/20 rounded-lg text-gray-500 text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                        <Plus size={14} />
                        添加景点
                      </button>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
