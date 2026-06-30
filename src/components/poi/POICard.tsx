import { Star, Heart } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { POI } from '../../data/mock';

interface POICardProps {
  poi: POI;
  onClick?: () => void;
  compact?: boolean;
}

export default function POICard({ poi, onClick, compact = false }: POICardProps) {
  const typeMap = {
    scenic: { label: '景点', color: 'bg-green-500/20 text-green-600' },
    food: { label: '美食', color: 'bg-red-500/20 text-red-600' },
    hotel: { label: '酒店', color: 'bg-blue-500/20 text-blue-600' },
    shopping: { label: '购物', color: 'bg-purple-500/20 text-purple-600' },
  };

  if (compact) {
    return (
      <GlassCard className="p-3 flex gap-3" onClick={onClick}>
        <img
          src={poi.images[0]}
          alt={poi.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{poi.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600">{poi.rating}</span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">{poi.address}</p>
        </div>
        <button className="self-start p-1">
          <Heart size={16} className="text-gray-400 hover:text-favorite transition-colors" />
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden" onClick={onClick}>
      <div className="relative h-44 overflow-hidden group">
        <img
          src={poi.images[0]}
          alt={poi.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeMap[poi.type].color}`}>
            {typeMap[poi.type].label}
          </span>
        </div>
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white transition-colors">
          <Heart size={16} className="text-gray-600 hover:text-favorite transition-colors" />
        </button>
        {poi.price > 0 && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm">
              ¥{poi.price}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 truncate">{poi.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-700 font-medium">{poi.rating}</span>
          </div>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500 truncate">{poi.city}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{poi.description}</p>
      </div>
    </GlassCard>
  );
}
