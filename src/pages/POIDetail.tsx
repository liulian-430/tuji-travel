import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Share2, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import POICard from '../components/poi/POICard';
import { mockPOIs } from '../data/mock';
import { useState } from 'react';

export default function POIDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const poi = mockPOIs.find((p) => p.id === id) || mockPOIs[0];
  const relatedPOIs = mockPOIs.filter((p) => p.id !== poi.id).slice(0, 3);

  const typeMap = {
    scenic: { label: '景点', color: 'bg-green-500/20 text-green-600' },
    food: { label: '美食', color: 'bg-red-500/20 text-red-600' },
    hotel: { label: '酒店', color: 'bg-blue-500/20 text-blue-600' },
    shopping: { label: '购物', color: 'bg-purple-500/20 text-purple-600' },
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-8">
      {/* Image Gallery */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={poi.images[currentImage]}
          alt={poi.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        {poi.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? poi.images.length - 1 : prev - 1))}
              className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === poi.images.length - 1 ? 0 : prev + 1))}
              className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {poi.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentImage ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
              isFavorited ? 'bg-favorite text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors">
            <Share2 size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* Main Info */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${typeMap[poi.type].color}`}>
              {typeMap[poi.type].label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{poi.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-800">{poi.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={16} />
              <span className="text-sm">{poi.city}</span>
            </div>
            {poi.price > 0 && (
              <span className="text-xl font-bold text-primary-mid">
                ¥{poi.price}
                <span className="text-sm text-gray-500 font-normal">/人</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{poi.openTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{poi.address}</span>
            <button className="ml-2 p-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
              <Navigation size={14} />
            </button>
          </div>
        </GlassCard>

        {/* Description */}
        <GlassCard className="p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3">景点介绍</h2>
          <p className="text-gray-600 leading-relaxed">{poi.description}</p>
        </GlassCard>

        {/* Related POIs */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-800 mb-4">相关推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPOIs.map((related) => (
              <POICard key={related.id} poi={related} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-card mx-4 mb-4 p-4 flex items-center gap-4 md:hidden">
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className={`flex flex-col items-center gap-1 p-2 ${
            isFavorited ? 'text-favorite' : 'text-gray-500'
          }`}
        >
          <Heart size={22} className={isFavorited ? 'fill-current' : ''} />
          <span className="text-xs">收藏</span>
        </button>
        <button
          onClick={() => navigate('/ai-planner')}
          className="flex-1 gradient-button flex items-center justify-center gap-2"
        >
          添加到行程
        </button>
      </div>
    </div>
  );
}
