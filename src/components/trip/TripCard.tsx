import { useState, useRef } from 'react';
import { MapPin, Users, Calendar, ArrowRight, CheckCircle2, Share2, X, ImagePlus } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { Trip, mockDaySchedules } from '../../data/mock';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  onComplete?: () => void;
  onShare?: () => void;
}

export default function TripCard({ trip, onClick, onComplete, onShare }: TripCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [shareImages, setShareImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusMap = {
    planning: { label: '规划中', color: 'bg-blue-500/20 text-blue-600' },
    ongoing: { label: '进行中', color: 'bg-green-500/20 text-green-600' },
    completed: { label: '已完成', color: 'bg-gray-500/20 text-gray-600' },
  };

  const tripSchedule = mockDaySchedules.filter(s => s.tripId === trip.id);
  const pois = tripSchedule.flatMap(s => s.items.map(i => i.poi));

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    }
    setShowShareModal(true);
    setShareImages([]);
    // Generate default content
    const defaultContent = `【${trip.name}】\n\n目的地：${trip.destination}\n行程天数：${trip.days}天${trip.nights}夜\n出发日期：${trip.startDate}\n\n行程亮点：\n${pois.slice(0, 5).map(p => `📍 ${p.name}`).join('\n')}\n\n分享我的精彩旅程！`;
    setShareContent(defaultContent);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setShareImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setShareImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmShare = () => {
    setShowShareModal(false);
    // In real app, this would post to backend
    alert('攻略分享成功！');
  };

  const isCompleted = trip.status === 'completed';

  return (
    <>
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

          {/* Action buttons for current trips */}
          {!isCompleted && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onComplete) onComplete();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium text-sm shadow-lg shadow-green-500/20 flex items-center justify-center gap-1 hover:shadow-xl transition-all"
              >
                <CheckCircle2 size={16} />
                完成行程
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareClick();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1 hover:shadow-xl transition-all"
              >
                <Share2 size={16} />
                分享
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">分享</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Trip preview */}
              <div className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-mid/5 to-pink-500/5">
                <img
                  src={trip.coverImage}
                  alt={trip.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-lg">{trip.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{trip.destination} · {trip.days}天{trip.nights}夜</p>
                  <p className="text-xs text-gray-400 mt-1">{trip.startDate}</p>
                </div>
              </div>

              {/* Images section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">添加图片</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-mid/10 text-primary-mid text-xs font-medium hover:bg-primary-mid/20 transition-colors"
                  >
                    <ImagePlus size={14} />
                    添加
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {shareImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {shareImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {shareImages.length < 9 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-mid/50 hover:bg-primary-mid/5 transition-colors"
                      >
                        <ImagePlus size={20} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-mid/50 hover:bg-primary-mid/5 transition-all"
                  >
                    <ImagePlus size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">点击添加旅行照片</p>
                  </div>
                )}
              </div>

              {/* POI tags */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">引用景点</p>
                <div className="flex flex-wrap gap-2">
                  {pois.map((poi, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShareContent(prev => prev + `\n📍 ${poi.name}`)}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:border-primary-mid/50 hover:bg-primary-mid/5 transition-colors flex items-center gap-1"
                    >
                      <MapPin size={12} className="text-primary-mid" />
                      {poi.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content textarea */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">分享内容</p>
                <textarea
                  value={shareContent}
                  onChange={(e) => setShareContent(e.target.value)}
                  placeholder="分享你的旅行心得..."
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid/30 resize-none transition-all"
                />
              </div>

              {/* Share button */}
              <button
                onClick={handleConfirmShare}
                className="w-full py-4 rounded-2xl bg-gradient-primary text-white font-semibold shadow-lg shadow-primary-mid/30 hover:shadow-xl hover:shadow-primary-mid/40 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                发布攻略
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}