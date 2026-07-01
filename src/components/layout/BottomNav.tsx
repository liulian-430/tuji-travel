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

  const bubbleLayers = [
    { count: 40, sizeMin: 1.5, sizeMax: 3, durationMin: 2, durationMax: 3, spread: 50, scaleMax: 2, delayStep: 0.04 },
    { count: 35, sizeMin: 3, sizeMax: 6, durationMin: 2.5, durationMax: 3.5, spread: 65, scaleMax: 2.2, delayStep: 0.05 },
    { count: 25, sizeMin: 5, sizeMax: 10, durationMin: 3, durationMax: 4, spread: 85, scaleMax: 2.5, delayStep: 0.07 },
  ];

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    size: 1.5 + Math.random() * 2,
    offsetX: (Math.random() - 0.5) * 140,
    delay: i * 0.1,
    duration: 2.5 + Math.random() * 1.5,
  }));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/95 via-white/60 to-transparent pointer-events-none" />
        
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

            <div className="relative -mt-10">
              <button
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isRecording
                    ? '0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(99, 102, 241, 0.2), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 10px 40px rgba(139, 92, 246, 0.5), inset 0 1px 1px rgba(255,255,255,0.3)',
                  transform: isRecording ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {isRecording ? (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white" style={{ animation: 'recordPulse 1.2s ease-in-out infinite' }}>
                    <rect x="6" y="6" width="12" height="12" rx="3" />
                  </svg>
                ) : (
                  <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>＋</span>
                )}

                {isRecording && (
                  <>
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '2px solid rgba(255,255,255,0.6)',
                        animation: 'ringPulse 2s ease-out infinite',
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '2px solid rgba(165, 180, 252, 0.5)',
                        animation: 'ringPulse 2s ease-out infinite 0.7s',
                      }}
                    />
                  </>
                )}
              </button>

              {isRecording && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none" style={{ width: '280px' }}>
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: '200px',
                      height: '140px',
                      background: 'radial-gradient(ellipse at center bottom, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
                      filter: 'blur(10px)',
                      animation: 'glowBreath 3s ease-in-out infinite',
                    }}
                  />

                  <div className="relative w-full h-72">
                    {bubbleLayers.flatMap((layer, layerIdx) =>
                      Array.from({ length: layer.count }, (_, i) => {
                        const idx = layerIdx * 40 + i;
                        const side = i % 2 === 0 ? 1 : -1;
                        const spreadRatio = (i % Math.ceil(layer.count / 2)) / Math.ceil(layer.count / 2);
                        const offsetX = side * spreadRatio * layer.spread + (Math.sin(idx * 0.5) * 12);
                        const startX = side * (Math.random() * 28 - 14);
                        const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
                        const duration = layer.durationMin + Math.random() * (layer.durationMax - layer.durationMin);
                        const delay = (idx * layer.delayStep) % layer.durationMax;
                        const wobble = 4 + Math.random() * 8;
                        const popDelay = 0.82 + Math.random() * 0.08;
                        return (
                          <div
                            key={`bubble-${idx}`}
                            className="absolute rounded-full"
                            style={{
                              left: '50%',
                              bottom: '0',
                              width: `${size}px`,
                              height: `${size}px`,
                              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(219, 234, 254, 0.8) 25%, rgba(165, 180, 252, 0.55) 55%, rgba(129, 140, 248, 0.35) 100%)`,
                              boxShadow: `inset 0 -${size/4}px ${size/2}px rgba(99, 102, 241, 0.2), 0 0 ${size/2}px rgba(139, 92, 246, 0.25)`,
                              animation: `bubbleFloat ${duration}s linear infinite`,
                              animationDelay: `${delay}s`,
                              '--bubble-x': `${offsetX}px`,
                              '--bubble-start-x': `${startX}px`,
                              '--bubble-scale': `${layer.scaleMax}`,
                              '--bubble-wobble': `${wobble}px`,
                              '--bubble-pop': `${popDelay}`,
                            } as React.CSSProperties}
                          />
                        );
                      })
                    )}

                    {sparkles.map((s, i) => (
                      <div
                        key={`sparkle-${i}`}
                        className="absolute rounded-full"
                        style={{
                          left: '50%',
                          bottom: '20px',
                          width: `${s.size}px`,
                          height: `${s.size}px`,
                          background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(191, 219, 254, 0.8) 40%, transparent 70%)',
                          boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                          animation: `sparkleRise ${s.duration}s linear infinite`,
                          animationDelay: `${s.delay}s`,
                          '--sparkle-x': `${s.offsetX}px`,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>

                  <div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    style={{ animation: 'hintFloat 2s ease-in-out infinite' }}
                  >
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-full blur-md"
                        style={{
                          background: 'rgba(139, 92, 246, 0.3)',
                          transform: 'scale(1.1)',
                        }}
                      />
                      <span className="relative text-xs text-indigo-600/90 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-xl font-medium border border-indigo-100">
                        🎙️ 正在聆听...
                      </span>
                    </div>
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
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5">
              <h3 className="text-xl font-bold text-white text-center">新建行程</h3>
              <p className="text-white/80 text-sm text-center mt-1">开始规划你的下一次旅行</p>
            </div>
            
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
        @keyframes bubbleFloat {
          0% {
            transform: translateY(0) translateX(var(--bubble-start-x)) scale(0.2);
            opacity: 0;
          }
          6% {
            opacity: 0.9;
          }
          15% {
            transform: translateY(-40px) translateX(calc(var(--bubble-start-x) + var(--bubble-wobble) * 0.3)) scale(0.4);
            opacity: 1;
          }
          30% {
            transform: translateY(-80px) translateX(calc(var(--bubble-x) * 0.2 - var(--bubble-wobble) * 0.2)) scale(0.6);
          }
          50% {
            transform: translateY(-130px) translateX(calc(var(--bubble-x) * 0.45 + var(--bubble-wobble) * 0.15)) scale(0.8);
            opacity: 0.95;
          }
          65% {
            transform: translateY(-170px) translateX(calc(var(--bubble-x) * 0.7 - var(--bubble-wobble) * 0.1)) scale(0.95);
            opacity: 0.85;
          }
          78% {
            transform: translateY(calc(-200px + var(--bubble-wobble))) translateX(calc(var(--bubble-x) * 0.9)) scale(var(--bubble-scale));
            opacity: 0.6;
          }
          83% {
            transform: translateY(calc(-205px + var(--bubble-wobble))) translateX(calc(var(--bubble-x) * 0.92)) scale(calc(var(--bubble-scale) * 1.35));
            opacity: 0.3;
            filter: blur(0.5px);
          }
          86% {
            transform: translateY(calc(-210px + var(--bubble-wobble))) translateX(calc(var(--bubble-x) * 0.95)) scale(calc(var(--bubble-scale) * 2));
            opacity: 0.08;
            filter: blur(2px);
          }
          90% {
            transform: translateY(calc(-215px + var(--bubble-wobble))) translateX(var(--bubble-x)) scale(calc(var(--bubble-scale) * 2.8));
            opacity: 0;
            filter: blur(5px);
          }
          100% {
            transform: translateY(-220px) translateX(var(--bubble-x)) scale(0);
            opacity: 0;
            filter: blur(8px);
          }
        }

        @keyframes sparkleRise {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          15% {
            transform: translateY(-40px) translateX(calc(var(--sparkle-x) * 0.2)) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-200px) translateX(var(--sparkle-x)) scale(0.2);
            opacity: 0;
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @keyframes recordPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes glowBreath {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.15);
          }
        }

        @keyframes hintFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-4px);
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
