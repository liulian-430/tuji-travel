import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { Trip } from '../../data/mock';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const statusMap = {
    planning: { label: '规划中', color: 'bg-blue-500/20 text-blue-600' },
    ongoing: { label: '进行中', color: 'bg-green-500/20 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-500/20 text-gray-600' },
  };

  return (
    <GlassCard className="overflow-hidden" onClick={onClick}>
      <div className="relative h-40 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[trip.status].color}`}>
            {statusMap[trip.status].label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg">{trip.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-primary-mid" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-primary-mid" />
            <span>{trip.days}天{trip.nights}夜</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} className="text-primary-mid" />
            <span>{trip.people}人</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">出发日期: {trip.startDate}</span>
          <ArrowRight size={16} className="text-primary-mid" />
        </div>
      </div>
    </GlassCard>
  );
}
