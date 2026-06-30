import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, DollarSign, Share2, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { mockTrips, mockDaySchedules, mockBudgets } from '../data/mock';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const trip = mockTrips.find((t) => t.id === id) || mockTrips[0];
  const schedules = mockDaySchedules.filter((s) => s.tripId === trip.id);
  const budget = mockBudgets.find((b) => b.tripId === trip.id);

  const statusMap = {
    planning: { label: '规划中', color: 'bg-blue-500/20 text-blue-600' },
    ongoing: { label: '进行中', color: 'bg-green-500/20 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-500/20 text-gray-600' },
  };

  const typeColors = {
    scenic: 'bg-green-500/20 text-green-600 border-green-500/30',
    food: 'bg-red-500/20 text-red-600 border-red-500/30',
    hotel: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    transport: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-8">
      {/* Header Image */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
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
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[trip.status].color}`}>
            {statusMap[trip.status].label}
          </span>
          <h1 className="text-white text-2xl font-bold mt-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm mt-2">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{trip.startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{trip.people}人</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6 relative z-10">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate(`/budget/${trip.id}`)}
            className="glass-card flex-1 p-4 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
          >
            <DollarSign size={20} className="text-primary-mid" />
            <span className="text-gray-700 font-medium">预算管理</span>
          </button>
          <button className="glass-card p-4 hover:bg-white/20 transition-colors">
            <Share2 size={20} className="text-gray-600" />
          </button>
          <button className="glass-card p-4 hover:bg-white/20 transition-colors">
            <Edit2 size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Budget Overview */}
        {budget && (
          <GlassCard className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">预算概览</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">总预算</p>
                <p className="text-2xl font-bold gradient-text">¥{budget.totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">已花费</p>
                <p className="text-xl font-bold text-gray-700">
                  ¥{(budget.totalBudget * 0.4).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: '40%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>已用 40%</span>
              <span>剩余 ¥{(budget.totalBudget * 0.6).toLocaleString()}</span>
            </div>
          </GlassCard>
        )}

        {/* Itinerary */}
        <div className="relative">
          <div className="timeline-line" />
          {schedules.map((day, dayIndex) => (
            <div key={day.id} className="relative pl-12 mb-6">
              <div className="timeline-dot" />
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">
                    第 {day.dayIndex} 天
                  </h3>
                  <span className="text-sm text-gray-500">{day.date}</span>
                </div>

                <div className="space-y-4">
                  {day.items.map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.poi.images[0]}
                          alt={item.poi.name}
                          className="w-20 h-20 rounded-lg object-cover"
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
                          {item.poi.price > 0 && (
                            <p className="text-sm text-primary-mid mt-1">
                              ¥{item.poi.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
