import { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/ai-planner', label: 'AI' },
  { path: '/map', label: '地图' },
  { path: '/profile', label: '我的' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartY = useRef<number>(0);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    pressStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      setIsRecording(true);
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 0) {
      const currentY = e.touches[0].clientY;
      if (pressStartY.current - currentY > 50) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setIsRecording(false);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isRecording) {
      setIsRecording(false);
      navigate('/ai-planner?voice=true');
    }
  }, [isRecording, navigate]);

  const handleMouseDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsRecording(true);
    }, 500);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isRecording) {
      setIsRecording(false);
      navigate('/ai-planner?voice=true');
    }
  }, [isRecording, navigate]);

  const handleClick = useCallback(() => {
    if (!isRecording) {
      setShowTripModal(true);
    }
  }, [isRecording]);

  const handleCreateTrip = () => {
    if (tripName.trim()) {
      setShowTripModal(false);
      setTripName('');
      navigate('/profile');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        {/* Background gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/95 via-white/60 to-transparent pointer-events-none" />
        
        {/* Nav bar */}
        <div className="relative mx-4 mb-4 bg-white/40 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/30 px-6 py-4">
          <div className="flex items-center justify-between">
            {navItems.slice(0, 2).map(({ path, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-center min-w-[3rem] transition-all duration-300 ${
                  isActive(path)
                    ? 'text-primary-mid font-semibold'
                    : 'text-gray-400/70 hover:text-gray-600'
                }`}
              >
                <span className="text-sm tracking-wide">{label}</span>
              </button>
            ))}

            {/* + Button - protruding upward */}
            <div className="relative -mt-10">
              <button
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-300"
                style={{
                  background: isRecording
                    ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isRecording
                    ? '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)'
                    : '0 10px 40px rgba(139, 92, 246, 0.5)',
                  transform: isRecording ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {isRecording ? (
                  <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="white">
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                  </svg>
                ) : (
                  <span>＋</span>
                )}
              </button>

              {/* Recording wave animation */}
              {isRecording && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 pointer-events-none">
                  {/* Large expanding rings */}
                  <div className="relative w-40 h-40 -translate-x-1/2">
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-pink-400/50"
                      style={{
                        animation: 'waveExpand 2s ease-out infinite',
                      }}
                    />
                    <div 
                      className="absolute inset-4 rounded-full border-4 border-purple-400/60"
                      style={{
                        animation: 'waveExpand 2s ease-out infinite 0.5s',
                      }}
                    />
                    <div 
                      className="absolute inset-8 rounded-full border-4 border-indigo-400/70"
                      style={{
                        animation: 'waveExpand 2s ease-out infinite 1s',
                      }}
                    />
                  </div>
                  
                  {/* Animated upward waves */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-20 overflow-hidden">
                    <svg 
                      className="w-full h-full"
                      viewBox="0 0 64 40"
                    >
                      <defs>
                        <linearGradient id="waveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M-8 32 Q8 16 24 32 Q40 48 56 32 Q72 16 88 32"
                        fill="none"
                        stroke="url(#waveGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ animation: 'waveRise 1.5s ease-in-out infinite' }}
                      />
                      <path
                        d="M-8 40 Q8 24 24 40 Q40 56 56 40 Q72 24 88 40"
                        fill="none"
                        stroke="url(#waveGrad)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.6"
                        style={{ animation: 'waveRise 1.5s ease-in-out infinite 0.3s' }}
                      />
                    </svg>
                  </div>
                  
                  {/* Recording text */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-600/90 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg font-medium">
                      松手进入AI规划 · 上划取消
                    </span>
                  </div>
                </div>
              )}
            </div>

            {navItems.slice(2).map(({ path, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-center min-w-[3rem] transition-all duration-300 ${
                  isActive(path)
                    ? 'text-primary-mid font-semibold'
                    : 'text-gray-400/70 hover:text-gray-600'
                }`}
              >
                <span className="text-sm tracking-wide">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* New Trip Modal - Centered floating card */}
      {showTripModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
          onClick={() => setShowTripModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5">
              <h3 className="text-xl font-bold text-white text-center">新建行程</h3>
              <p className="text-white/80 text-sm text-center mt-1">开始规划你的下一次旅行</p>
            </div>
            
            {/* Form content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">行程名称</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="例如：北京三日游"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-mid/30 focus:border-primary-mid/30 text-base transition-all"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTripModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateTrip}
                  disabled={!tripName.trim()}
                  className="flex-1 py-4 rounded-2xl bg-gradient-primary text-white font-semibold shadow-lg shadow-primary-mid/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-primary-mid/40"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes waveExpand {
          0% {
            transform: scale(0.2);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes waveRise {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-16px);
            opacity: 0;
          }
        }
        @keyframes modalPopIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}