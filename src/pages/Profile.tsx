import { useState } from 'react';
import { MapPin, Calendar, ChevronRight, Camera, Heart, Star, MapPinned, History as HistoryIcon } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import TripCard from '../components/trip/TripCard';
import { useTripStore } from '@/store/useTripStore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { trips, favoritePOIs, visitedCities, completeTrip } = useTripStore();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const currentTrips = trips.filter(t => t.status !== 'completed');
  const historicalTrips = trips.filter(t => t.status === 'completed');

  const handleCompleteTrip = (tripId: string) => {
    completeTrip(tripId);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">旅</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">旅行爱好者</h2>
              <p className="text-sm text-gray-500 mt-1">世界那么大，一起去看看</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span><strong className="text-gray-700">{trips.length}</strong> 行程</span>
                <span><strong className="text-gray-700">{favoritePOIs.length}</strong> 收藏</span>
                <span><strong className="text-gray-700">{visitedCities.length}</strong> 足迹</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </GlassCard>

        {/* Trip Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'current'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'glass-card text-gray-600 hover:bg-white/20'
            }`}
          >
            本次行程
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'glass-card text-gray-600 hover:bg-white/20'
            }`}
          >
            历史行程
          </button>
        </div>

        {/* Trip List */}
        {activeTab === 'current' ? (
          <div className="space-y-4">
            {currentTrips.length > 0 ? (
              currentTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  onComplete={() => handleCompleteTrip(trip.id)}
                />
              ))
            ) : (
              <GlassCard className="p-4">
                <EmptyState
                  icon={MapPinned}
                  title="暂无进行中的行程"
                  description="开启一段新的旅程吧，让每一段路都成为回忆。"
                  actionText="创建新行程"
                  onAction={() => navigate('/ai-planner')}
                />
              </GlassCard>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {historicalTrips.length > 0 ? (
              historicalTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                />
              ))
            ) : (
              <GlassCard className="p-4">
                <EmptyState
                  icon={HistoryIcon}
                  title="暂无历史行程"
                  description="完成的行程将归档至此，留下你的旅行足迹。"
                />
              </GlassCard>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <GlassCard className="p-4 text-center cursor-pointer hover:bg-white/20 transition-colors">
            <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
            <p className="text-xs text-gray-500">足迹</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{visitedCities.length}个目的地</p>
          </GlassCard>
          <GlassCard className="p-4 text-center cursor-pointer hover:bg-white/20 transition-colors">
            <Heart size={24} className="mx-auto mb-2 text-favorite" />
            <p className="text-xs text-gray-500">收藏</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{favoritePOIs.length}个收藏</p>
          </GlassCard>
          <GlassCard className="p-4 text-center cursor-pointer hover:bg-white/20 transition-colors">
            <Star size={24} className="mx-auto mb-2 text-yellow-500" />
            <p className="text-xs text-gray-500">评价</p>
            <p className="text-sm font-medium text-gray-700 mt-1">0条评价</p>
          </GlassCard>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 mt-8">
          途迹 v1.0.0
        </p>
      </div>
    </div>
  );
}
