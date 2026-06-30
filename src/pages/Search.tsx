import { useState } from 'react';
import { Search as SearchIcon, X, History, TrendingUp } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import POICard from '../components/poi/POICard';
import { mockPOIs } from '../data/mock';

const searchHistory = ['故宫博物院', '长城', '北京烤鸭'];
const trendingSearches = ['798艺术区', '三里屯', '南锣鼓巷', '鸟巢', '水立方'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(mockPOIs);
  const [showHistory, setShowHistory] = useState(true);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      const filtered = mockPOIs.filter(
        (poi) =>
          poi.name.toLowerCase().includes(q.toLowerCase()) ||
          poi.city.toLowerCase().includes(q.toLowerCase()) ||
          poi.description.toLowerCase().includes(q.toLowerCase())
      );
      setResults(filtered);
      setShowHistory(false);
    } else {
      setResults(mockPOIs);
      setShowHistory(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="glass-card p-2 flex items-center gap-2 mb-6 sticky top-20 md:top-24 z-40">
          <SearchIcon size={20} className="text-gray-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索景点、美食、酒店..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => handleSearch('')} className="p-1">
              <X size={18} className="text-gray-400" />
            </button>
          )}
          <button className="gradient-button px-4 py-2 text-sm">
            搜索
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['全部', '景点', '美食', '酒店', '购物'].map((filter, idx) => (
            <button
              key={filter}
              className={`tag whitespace-nowrap ${
                idx === 0 ? 'bg-primary-mid/30 border-primary-mid text-primary-mid' : ''
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Content */}
        {showHistory && !query ? (
          <div className="space-y-6">
            {/* Search History */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-gray-400" />
                <h3 className="font-medium text-gray-700">搜索历史</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="tag text-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-gray-400" />
                <h3 className="font-medium text-gray-700">热门搜索</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {trendingSearches.map((item, idx) => (
                  <GlassCard
                    key={item}
                    className="p-3 cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => handleSearch(item)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        idx < 3 ? 'text-primary-mid' : 'text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Popular POIs */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4">推荐景点</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockPOIs.slice(0, 4).map((poi) => (
                  <POICard key={poi.id} poi={poi} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              找到 {results.length} 个结果
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((poi) => (
                <POICard key={poi.id} poi={poi} />
              ))}
            </div>
            {results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">未找到相关结果</p>
                <p className="text-sm text-gray-400 mt-2">试试其他关键词</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
