import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Heart, ChevronRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Logo from '../components/ui/Logo';
import { hotCities, mockPOIs, mockTrips, userGuides } from '../data/mock';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const hotPois = mockPOIs.filter(p => p.type === 'scenic').slice(0, 6);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <section className="relative px-4 pt-20 md:pt-24 md:px-8">
        {/* Background with soft gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-[900px] h-[900px] bg-gradient-primary rounded-full opacity-10 blur-[100px]" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-200/30 to-pink-200/20 rounded-full blur-[60px]" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Header with Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Logo size={52} />
            <span className="text-2xl font-bold text-gray-800 tracking-widest" style={{ fontFamily: "'Noto Sans SC', sans-serif", letterSpacing: '0.18em' }}>TUJI</span>
          </div>

          {/* Search Bar - More transparent/glass */}
          <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 shadow-xl shadow-white/20">
            <Search size={20} className="text-gray-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索景点、美食、酒店..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400/60 text-base"
            />
            <button 
              onClick={() => navigate('/search')}
              className="px-4 py-2 bg-gradient-primary rounded-xl text-white text-sm font-medium shadow-lg shadow-primary-mid/30"
            >
              搜索
            </button>
          </div>

          {/* Hot Cities */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800/80 mb-5">热门城市</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {hotCities.map((city) => (
                <GlassCard
                  key={city.id}
                  className="flex-shrink-0 w-36 overflow-hidden p-0 cursor-pointer"
                  onClick={() => navigate(`/map?city=${city.name}`)}
                >
                  <div className="relative h-40">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-white font-medium text-lg">{city.name}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Hot POIs */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800/80 mb-5">热门景点</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {hotPois.map((poi) => (
                <GlassCard
                  key={poi.id}
                  className="overflow-hidden cursor-pointer p-0"
                  onClick={() => navigate(`/poi/${poi.id}`)}
                >
                  <div className="relative h-32">
                    <img
                      src={poi.images[0]}
                      alt={poi.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-sm font-medium truncate block">{poi.name}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500/80">{poi.city}</span>
                      <span className="text-xs text-yellow-500/80">★ {poi.rating}</span>
                    </div>
                    {poi.price > 0 && (
                      <span className="text-sm text-primary-mid/80 font-medium mt-1 block">
                        ¥{poi.price}
                      </span>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Recommended Guides */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800/80">发现</h2>
              <button className="flex items-center gap-1 text-primary-mid/80 text-sm font-medium">
                <span>更多</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {userGuides.map((guide) => (
                <GlassCard
                  key={guide.id}
                  className="overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/guide/${guide.id}`)}
                >
                  <div className="flex gap-4">
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <img
                        src={guide.image}
                        alt={guide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                          <Clock size={10} />
                          {guide.days}天
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-3 pr-3">
                      <h3 className="font-semibold text-gray-800 text-base truncate">{guide.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-white text-xs">{guide.avatar}</span>
                        </div>
                        <span className="text-sm text-gray-500/70">{guide.author}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {guide.pois.map((poi, idx) => (
                          <div key={idx} className="flex items-center">
                            <span className="px-2 py-0.5 rounded-full bg-primary-mid/10 text-primary-mid/80 text-xs">
                              {poi}
                            </span>
                            {idx < guide.pois.length - 1 && (
                              <span className="text-gray-300/60 mx-1">·</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400/60">
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {guide.likes}
                        </span>
                        <span>{guide.views} 阅读</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
