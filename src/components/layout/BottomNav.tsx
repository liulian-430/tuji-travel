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
      navigate('/ai-planner');
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
                    ? '0 0 0 0px rgba(236, 72, 153, 0), 0 0 0 0px rgba(236, 72, 153, 0)'
                    : '0 8px 32px rgba(139, 92, 246, 0.4)',
                  transform: isRecording ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <span className={`transition-transform duration-300 ${isRecording ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                  ＋
                </span>
                {isRecording && (
                  <span className="absolute text-white text-lg">🎙</span>
                )}
              </button>

              {/* Recording wave animation */}
              {isRecording && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none">
                  {/* Wave circles */}
                  <div className="relative w-20 h-20">
                    <div 
                      className="absolute inset-0 rounded-full border-2 border-primary-mid/30"
                      style={{
                        animation: 'waveExpand 1.5s ease-out infinite',
                      }}
                    />
                    <div 
                      className="absolute inset-2 rounded-full border-2 border-primary-mid/40"
                      style={{
                        animation: 'waveExpand 1.5s ease-out infinite 0.3s',
                      }}
                    />
                    <div 
                      className="absolute inset-4 rounded-full border-2 border-primary-mid/50"
                      style={{
                        animation: 'waveExpand 1.5s ease-out infinite 0.6s',
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-primary/10"
                      style={{
                        animation: 'waveExpand 1.5s ease-out infinite 0.9s',
                      }}
                    />
                  </div>
                  {/* Upward waves SVG */}
                  <svg 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 opacity-60"
                    viewBox="0 0 64 64"
                  >
                    <defs>
                      <linearGradient id="waveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 32 Q16 20 24 32 Q32 44 40 32 Q48 20 56 32"
                      fill="none"
                      stroke="url(#waveGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{
                        animation: 'waveMove 0.8s ease-in-out infinite',
                      }}
                    />
                    <path
                      d="M8 40 Q16 28 24 40 Q32 52 40 40 Q48 28 56 40"
                      fill="none"
                      stroke="url(#waveGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.6"
                      style={{
                        animation: 'waveMove 0.8s ease-in-out infinite 0.2s',
                      }}
                    />
                    <path
                      d="M8 48 Q16 36 24 48 Q32 60 40 48 Q48 36 56 48"
                      fill="none"
                      stroke="url(#waveGrad)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.3"
                      style={{
                        animation: 'waveMove 0.8s ease-in-out infinite 0.4s',
                      }}
                    />
                  </svg>
                  {/* Recording text */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-500/80 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
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
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes waveMove {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
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
