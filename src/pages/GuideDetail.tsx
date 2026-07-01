import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Clock, MapPin, Bookmark, Plus, User, Share2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { mockTrips } from '../data/mock';
import { useState } from 'react';

const userGuides = [
  {
    id: '1',
    title: '北京4天3晚深度游攻略',
    author: '旅行达人小王',
    avatar: '王',
    image: 'https://picsum.photos/seed/tuji119/800/600',
    likes: 1256,
    views: 8934,
    days: 4,
    nights: 3,
    destination: '北京',
    budget: 3000,
    people: 2,
    description: '本次北京之旅，我们将带你探访故宫、长城、天坛等著名景点，品尝正宗北京烤鸭，体验老北京胡同文化。行程安排合理，适合首次来京的游客。',
    poiDetails: [
      {
        name: '故宫博物院',
        type: 'scenic',
        duration: '3小时',
        price: 60,
        description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
        image: 'https://picsum.photos/seed/tuji120/800/600',
      },
      {
        name: '八达岭长城',
        type: 'scenic',
        duration: '4小时',
        price: 45,
        description: '万里长城的代表段落之一，是明长城中保存最完整的一段。',
        image: 'https://picsum.photos/seed/tuji121/800/600',
      },
      {
        name: '北京烤鸭店',
        type: 'food',
        duration: '1.5小时',
        price: 200,
        description: '正宗北京烤鸭，皮脆肉嫩，香气四溢。',
        image: 'https://picsum.photos/seed/tuji122/800/600',
      },
      {
        name: '天坛公园',
        type: 'scenic',
        duration: '2小时',
        price: 34,
        description: '明清两代帝王祭天、祈谷的场所，建筑宏伟壮观。',
        image: 'https://picsum.photos/seed/tuji123/800/600',
      },
    ],
  },
  {
    id: '2',
    title: '上海迪士尼亲子游全攻略',
    author: '妈妈爱旅行',
    avatar: '妈',
    image: 'https://picsum.photos/seed/tuji124/800/600',
    likes: 892,
    views: 5621,
    days: 3,
    nights: 2,
    destination: '上海',
    budget: 4500,
    people: 3,
    description: '带孩子玩转上海迪士尼，包含最佳游玩路线、快速通行证攻略、亲子餐厅推荐，让你的迪士尼之旅不留遗憾。',
    poiDetails: [
      {
        name: '上海迪士尼乐园',
        type: 'scenic',
        duration: '全天',
        price: 599,
        description: '中国内地首座迪士尼主题乐园，包含七大主题园区。',
        image: 'https://picsum.photos/seed/tuji125/800/600',
      },
      {
        name: '外滩',
        type: 'scenic',
        duration: '2小时',
        price: 0,
        description: '上海最具代表性的景观，可欣赏陆家嘴天际线夜景。',
        image: 'https://picsum.photos/seed/tuji126/800/600',
      },
    ],
  },
];

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');

  const guide = userGuides.find((g) => g.id === id) || userGuides[0];
  const currentTrips = mockTrips.filter((t) => t.status !== 'completed');

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

  const handleAddPoi = (poiName: string) => {
    setSelectedPoi(poiName);
    setSelectedTrip(currentTrips[0]?.id || '');
    setShowAddModal(true);
  };

  const handleAddAll = () => {
    setSelectedPoi('全部景点');
    setSelectedTrip(currentTrips[0]?.id || '');
    setShowAddModal(true);
  };

  const confirmAdd = () => {
    setShowAddModal(false);
  };

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
                        className="p-2 rounded-lg bg-primary-mid/10 text-primary-mid hover:bg-primary-mid/20 transition-colors"
                      >
                        <Bookmark size={16} />
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
      <div className="fixed bottom-0 left-0 right-0 glass-card mx-4 mb-4 p-4 flex items-center gap-4 md:hidden">
        <button className="flex flex-col items-center gap-1 p-2 text-gray-500">
          <Heart size={22} />
          <span className="text-xs">收藏</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-gray-500">
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
            <div className="space-y-2">
              {currentTrips.length > 0 ? (
                currentTrips.map((trip) => (
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
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">暂无进行中的行程</p>
              )}
              <button
                onClick={() => navigate('/new-trip')}
                className="w-full p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary-mid hover:text-primary-mid transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>创建新行程</span>
              </button>
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
