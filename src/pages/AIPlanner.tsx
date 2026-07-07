import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mic, ChevronUp, ChevronDown, Trash2, Plus, MapPin, Calendar, Users, DollarSign, Utensils, Building, X } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AILoadingState from '../components/ui/Skeleton';
import { mockPOIs, DaySchedule, TripPOI } from '../data/mock';
import { useTripStore } from '@/store/useTripStore';
import { useToastStore } from '@/store/useToastStore';
import { DEFAULT_BUDGET, MIN_BUDGET, MAX_BUDGET, MIN_DAYS, MAX_DAYS, MIN_PEOPLE, MAX_PEOPLE } from '@/config/constants';
import { aiApi, AiTripDay } from '@/api/ai';

export default function AIPlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setPendingTrip } = useTripStore();
  const { showToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'ai' | 'custom'>('ai');
  const [aiInput, setAiInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const voiceToastShownRef = useRef(false);

  useEffect(() => {
    const voice = searchParams.get('voice');
    if (voice === 'true' && !voiceToastShownRef.current) {
      voiceToastShownRef.current = true;
      setAiInput('我想去北京玩3天，想去故宫和长城，想吃北京烤鸭，住靠近市中心的酒店，预算3000元');
      showToast('已识别语音输入', 'success');
    }
  }, [searchParams, showToast]);

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      setAiInput('我想去北京玩3天，想去故宫和长城，想吃北京烤鸭，住靠近市中心的酒店，预算3000元');
      showToast('语音识别完成', 'success');
    } else {
      setIsListening(true);
      showToast('正在聆听...', 'info');
      setTimeout(() => {
        setIsListening(false);
        setAiInput('我想去北京玩3天，想去故宫和长城，想吃北京烤鸭，住靠近市中心的酒店，预算3000元');
        showToast('语音识别完成', 'success');
      }, 2000);
    }
  };

  // 个性化规划状态
  const [destination, setDestination] = useState('');
  const [poisText, setPoisText] = useState('');
  const [foodsText, setFoodsText] = useState('');
  const [hotelsText, setHotelsText] = useState('');
  const [days, setDays] = useState(3);
  const [nights, setNights] = useState(2);
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);

  const allPois = mockPOIs.filter(p => p.type === 'scenic');
  const allFoods = mockPOIs.filter(p => p.type === 'food');
  const allHotels = mockPOIs.filter(p => p.type === 'hotel');

  const toggleItem = (id: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(i => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  /**
   * 将 AI 返回的行程数据转换为本地 DaySchedule 格式
   */
  const convertAiToSchedules = (aiTrips: AiTripDay[]): DaySchedule[] => {
    return aiTrips.map((day) => ({
      id: `${day.day}`,
      tripId: 'new',
      dayIndex: day.day,
      date: day.date,
      items: day.items.map((item, idx) => {
        // 尝试在 mockPOIs 中查找匹配的 POI（用于显示图片和经纬度）
        const matchedPoi = mockPOIs.find(p => p.name === item.name);
        return {
          id: `${day.day}-${idx}`,
          poiId: matchedPoi?.id || `ai-${day.day}-${idx}`,
          poi: matchedPoi || {
            id: `ai-${day.day}-${idx}`,
            name: item.name,
            type: item.type,
            description: item.description || '',
            latitude: 0,
            longitude: 0,
            address: item.description || '',
            rating: 0,
            duration: '2小时',
            price: item.estimatedCost || 0,
            images: ['https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400'],
            tags: '',
            city: destination || '北京',
          },
          startTime: item.startTime,
          endTime: item.endTime,
          type: item.type,
        };
      }),
    }));
  };

  const handleAIGenerate = async () => {
    if (!aiInput.trim()) {
      showToast('请描述你的旅行需求', 'error');
      return;
    }
    setIsGenerating(true);
    setIsGenerated(false);
    try {
      const result = await aiApi.generateTrip({
        userInput: aiInput,
        startDate,
      });
      const converted = convertAiToSchedules(result);
      setSchedules(converted);
      setIsGenerated(true);
      showToast('AI 行程生成成功', 'success');
    } catch (error: any) {
      // 失败时使用模拟数据作为降级
      const mockDays = Math.max(2, Math.min(7, parseInt(aiInput.match(/\d+天/)?.[0]) || 2));
      const mockSchedule: DaySchedule[] = Array.from({ length: mockDays }, (_, dayIdx) => ({
        id: `${dayIdx + 1}`,
        tripId: 'new',
        dayIndex: dayIdx + 1,
        date: new Date(new Date(startDate).getTime() + dayIdx * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: mockPOIs.slice(dayIdx * 2, (dayIdx + 1) * 2).map((poi, idx) => ({
          id: `${dayIdx + 1}-${idx}`,
          poiId: poi.id,
          poi,
          startTime: `${9 + idx * 3}:00`,
          endTime: `${11 + idx * 3}:00`,
          type: poi.type as 'scenic' | 'food' | 'hotel' | 'transport',
        })),
      }));
      setSchedules(mockSchedule);
      setIsGenerated(true);
      showToast(error.message || 'AI 调用失败，使用推荐行程', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!destination.trim()) {
      showToast('请输入目的地城市', 'error');
      return;
    }
    if (days < MIN_DAYS || days > MAX_DAYS) {
      showToast(`行程天数应在${MIN_DAYS}-${MAX_DAYS}天之间`, 'error');
      return;
    }
    if (people < MIN_PEOPLE || people > MAX_PEOPLE) {
      showToast(`出行人数应在${MIN_PEOPLE}-${MAX_PEOPLE}人之间`, 'error');
      return;
    }
    if (budget < MIN_BUDGET || budget > MAX_BUDGET) {
      showToast(`预算应在${MIN_BUDGET}-${MAX_BUDGET}元之间`, 'error');
      return;
    }
    setIsGenerating(true);
    setIsGenerated(false);
    try {
      const result = await aiApi.generateTrip({
        destination,
        days,
        people,
        budget,
        startDate,
        preferences: {
          poisText,
          foodsText,
          hotelsText,
        },
      });
      const converted = convertAiToSchedules(result);
      setSchedules(converted);
      setIsGenerated(true);
      showToast('AI 行程生成成功', 'success');
    } catch (error: any) {
      // 失败时使用模拟数据作为降级
      const selectedItems = [
        ...mockPOIs.filter(p => p.type === 'scenic'),
        ...mockPOIs.filter(p => p.type === 'food'),
        ...mockPOIs.filter(p => p.type === 'hotel'),
      ].slice(0, days * 2);

      const mockSchedule: DaySchedule[] = Array.from({ length: days }, (_, dayIdx) => ({
        id: `${dayIdx + 1}`,
        tripId: 'new',
        dayIndex: dayIdx + 1,
        date: new Date(new Date(startDate).getTime() + dayIdx * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: selectedItems.slice(dayIdx * 2, (dayIdx + 1) * 2).map((poi, idx) => ({
          id: `${dayIdx + 1}-${idx}`,
          poiId: poi.id,
          poi,
          startTime: `${9 + idx * 3}:00`,
          endTime: `${11 + idx * 3}:00`,
          type: poi.type as 'scenic' | 'food' | 'hotel' | 'transport',
        })),
      }));

      setSchedules(mockSchedule);
      setIsGenerated(true);
      showToast(error.message || 'AI 调用失败，使用推荐行程', 'info');
    } finally {
      setIsGenerating(false);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          <span className="gradient-text">AI 智能规划</span>
        </h1>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'glass-card text-gray-600 hover:bg-white/20'
            }`}
          >
            AI 规划
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'glass-card text-gray-600 hover:bg-white/20'
            }`}
          >
            个性化规划
          </button>
        </div>

        {isGenerating ? (
          /* AI 生成中加载状态 */
          <AILoadingState days={activeTab === 'ai' ? 2 : days} />
        ) : !isGenerated ? (
          activeTab === 'ai' ? (
            /* AI 规划 - 文字/语音输入 */
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">描述你的旅行想法</h2>
              <p className="text-sm text-gray-500 mb-4">
                例如：我想去北京玩3天，想去故宫和长城，想吃北京烤鸭
              </p>
              <div className="relative">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="描述你的旅行需求..."
                  className="glass-input w-full h-40 resize-none pr-12"
                />
                <button
                  onClick={handleMicClick}
                  className={`absolute bottom-3 right-3 p-3 rounded-full transition-all ${
                    isListening
                      ? 'bg-favorite text-white animate-pulse'
                      : 'bg-white/20 text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <Mic size={20} />
                </button>
              </div>
              <button
                onClick={handleAIGenerate}
                disabled={!aiInput.trim() || isGenerating}
                className="gradient-button w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={20} />
                <span>{isGenerating ? 'AI 正在规划...' : 'AI 生成行程'}</span>
              </button>
            </GlassCard>
          ) : (
            /* 个性化规划 - 表单输入 */
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">填写行程信息</h2>
              <div className="space-y-6">
                {/* 目的地 */}
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

                {/* 想去的景点 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Building size={16} className="inline mr-1 text-primary-mid" />
                    想去的景点
                  </label>
                  <textarea
                    value={poisText}
                    onChange={(e) => setPoisText(e.target.value)}
                    placeholder="例如：故宫、长城、天坛"
                    rows={3}
                    className="glass-input w-full resize-none"
                  />
                </div>

                {/* 想吃的美食 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Utensils size={16} className="inline mr-1 text-primary-mid" />
                    想吃的美食
                  </label>
                  <textarea
                    value={foodsText}
                    onChange={(e) => setFoodsText(e.target.value)}
                    placeholder="例如：北京烤鸭、炸酱面、涮羊肉"
                    rows={3}
                    className="glass-input w-full resize-none"
                  />
                </div>

                {/* 想住的酒店 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Building size={16} className="inline mr-1 text-primary-mid" />
                    想住的酒店
                  </label>
                  <textarea
                    value={hotelsText}
                    onChange={(e) => setHotelsText(e.target.value)}
                    placeholder="例如：王府井附近、靠近地铁站、四星级"
                    rows={3}
                    className="glass-input w-full resize-none"
                  />
                </div>

                {/* 天数和夜数 */}
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
                        const d = Number(e.target.value);
                        setDays(d);
                        if (nights > d) setNights(d);
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
                      onChange={(e) => setNights(Math.min(Number(e.target.value), days))}
                      min={0}
                      max={days}
                      className="glass-input w-full"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">夜</span>
                  </div>
                </div>

                {/* 出行人数和预算 */}
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
                      <DollarSign size={16} className="inline mr-1 text-primary-mid" />
                      预算
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={1000}
                      max={50000}
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                {/* 出发日期 */}
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

              <button
                onClick={handleCustomGenerate}
                disabled={isGenerating}
                className="gradient-button w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={20} />
                <span>{isGenerating ? 'AI 正在规划...' : '生成行程'}</span>
              </button>
            </GlassCard>
          )
        ) : (
          /* Generated Itinerary */
          <>
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
                    onClick={() => {
                      // 将 DaySchedule (mock, 含 items) 转换为 DayScheduleSimple (store, 含 morning/afternoon/evening)
                      const allPOIs: TripPOI[] = [];
                      const simpleSchedules = schedules.map((day) => {
                        const morning: TripPOI[] = [];
                        const afternoon: TripPOI[] = [];
                        const evening: TripPOI[] = [];
                        day.items.forEach((item) => {
                          const poi = item.poi;
                          const tripPoi: TripPOI = {
                            id: poi.id,
                            name: poi.name,
                            type: poi.type,
                            duration: '2小时',
                            price: poi.price,
                            image: poi.images[0] || '',
                            latitude: poi.latitude,
                            longitude: poi.longitude,
                          };
                          allPOIs.push(tripPoi);
                          const hour = parseInt(item.startTime.split(':')[0], 10);
                          if (hour < 12) morning.push(tripPoi);
                          else if (hour < 18) afternoon.push(tripPoi);
                          else evening.push(tripPoi);
                        });
                        return {
                          day: day.dayIndex,
                          morning: morning.length ? morning : undefined,
                          afternoon: afternoon.length ? afternoon : undefined,
                          evening: evening.length ? evening : undefined,
                        };
                      });
                      setPendingTrip({
                        name: `${destination || '北京'}${days}日游`,
                        destination: destination || '北京',
                        days,
                        nights,
                        people,
                        budget,
                        schedules: simpleSchedules,
                        pois: allPOIs,
                      });
                      navigate('/trip/new');
                    }}
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
