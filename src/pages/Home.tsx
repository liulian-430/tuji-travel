import { Plus, Mic, Sparkles, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import TripCard from '../components/trip/TripCard';
import { hotCities, mockTrips } from '../data/mock';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 md:pt-28 md:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-primary rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500 to-purple-500 rounded-full opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">AI 智能规划</span>
              <br />
              让旅行更简单
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              一键生成个性化行程，智能推荐景点，轻松管理预算，记录美好旅行回忆
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/ai-planner')}
              className="gradient-button flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Sparkles size={20} />
              <span>AI 智能规划</span>
            </button>
            <button
              className="glass-card px-6 py-3 flex items-center gap-2 w-full sm:w-auto justify-center hover:scale-105 transition-transform"
              onClick={() => {}}
            >
              <div className="relative">
                <Mic size={20} className="text-primary-mid" />
                <div className="absolute inset-0 animate-ping opacity-30">
                  <Mic size={20} className="text-primary-mid" />
                </div>
              </div>
              <span className="text-gray-700">长按语音输入</span>
            </button>
          </div>

          {/* Hot Cities */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">热门目的地</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {hotCities.map((city) => (
                <GlassCard
                  key={city.id}
                  className="flex-shrink-0 w-32 overflow-hidden p-0 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate(`/search?city=${city.name}`)}
                >
                  <div className="relative h-36">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white font-medium">{city.name}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* My Trips */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">我的行程</h2>
              <button
                onClick={() => navigate('/ai-planner')}
                className="flex items-center gap-1 text-primary-mid text-sm hover:underline"
              >
                <Plus size={16} />
                <span>新建行程</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-4 text-center">
              <MapPin size={24} className="mx-auto mb-2 text-primary-mid" />
              <div className="text-2xl font-bold gradient-text">{mockTrips.length}</div>
              <div className="text-xs text-gray-500 mt-1">行程数量</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Clock size={24} className="mx-auto mb-2 text-primary-mid" />
              <div className="text-2xl font-bold gradient-text">
                {mockTrips.reduce((acc, t) => acc + t.days, 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">旅行天数</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <Sparkles size={24} className="mx-auto mb-2 text-primary-mid" />
              <div className="text-2xl font-bold gradient-text">12</div>
              <div className="text-xs text-gray-500 mt-1">打卡景点</div>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
