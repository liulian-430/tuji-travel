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
    pressStartY.current = e.touches[0].clientY;
    longPressTimer.current = setTimeout(() => {
      setIsRecording(true);
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 0) {
      const currentY = e.touches[0].clientY;
      // If swiped up more than 50px, cancel recording
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

            {/* + Button */}
            <div className="relative">
              <button
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-300"
                style={{
                  background: isRecording
                    ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isRecording
                    ? '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)'
                    : '0 8px 32px rgba(139, 92, 246, 0.4)',
                  transform: isRecording ? 'scale(1.15)' : 'scale(1)',
                  animation: isRecording ? 'pulseGlow 1s ease-in-out infinite' : 'none',
                }}
              >
                <span className={`transition-transform duration-300 ${isRecording ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                  ＋
                </span>
                {isRecording && (
                  <span className="absolute text-white text-lg animate-pulse">🎙</span>
                )}
              </button>

              {/* Recording wave animation */}
              {isRecording && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none">
                  {/* Large expanding rings */}
                  <div className="relative w-32 h-32 -translate-x-1/2">
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
                    <div 
                      className="absolute inset-12 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30"
                      style={{
                        animation: 'waveExpand 2s ease-out infinite 1.5s',
                      }}
                    />
                  </div>
                  
                  {/* Animated upward waves */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 overflow-hidden">
                    <svg 
                      className="w-full h-full"
                      viewBox="0 0 64 64"
                    >
                      <defs>
                        <linearGradient id="waveGradBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Multiple wave layers */}
                      <path
                        d="M-8 48 Q8 32 24 48 Q40 64 56 48 Q72 32 88 48"
                        fill="none"
                        stroke="url(#waveGradBottom)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.8"
                        style={{
                          animation: 'waveRise 1.5s ease-in-out infinite',
                        }}
                      />
                      <path
                        d="M-8 56 Q8 40 24 56 Q40 72 56 56 Q72 40 88 56"
                        fill="none"
                        stroke="url(#waveGradBottom)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.5"
                        style={{
                          animation: 'waveRise 1.5s ease-in-out infinite 0.3s',
                        }}
                      />
                      <path
                        d="M-8 64 Q8 48 24 64 Q40 80 56 64 Q72 48 88 64"
                        fill="none"
                        stroke="url(#waveGradBottom)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.3"
                        style={{
                          animation: 'waveRise 1.5s ease-in-out infinite 0.6s',
                        }}
                      />
                    </svg>
                  </div>
                  
                  {/* Recording text */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-600/90 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg font-medium">
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

      {/* New Trip Modal */}
      {showTripModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setShowTripModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white/70 backdrop-blur-3xl rounded-t-3xl p-6 pb-10 space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 text-center">新建行程</h3>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="输入行程名称"
              className="w-full bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-mid/30 text-center text-lg"
              autoFocus
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowTripModal(false)}
                className="flex-1 py-4 rounded-2xl bg-gray-100/80 backdrop-blur-sm text-gray-600 font-medium hover:bg-gray-200/80 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={!tripName.trim()}
                className="flex-1 py-4 rounded-2xl bg-gradient-primary text-white font-medium shadow-lg shadow-primary-mid/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-primary-mid/40"
              >
                创建
              </button>
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
            transform: translateY(-20px);
            opacity: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0px rgba(236, 72, 153, 0.4), 0 0 20px rgba(236, 72, 153, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(236, 72, 153, 0), 0 0 40px rgba(236, 72, 153, 0.5);
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
