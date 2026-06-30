import { useState, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Header() {
  const [isRecording, setIsRecording] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsRecording(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isRecording) {
      setIsRecording(false);
      window.location.href = '/ai-planner?voice=true';
    }
  }, [isRecording]);

  const handleClick = useCallback(() => {
    if (!isRecording) {
      window.location.href = '/new-trip';
    }
  }, [isRecording]);

  return (
    <header className="hidden md:block fixed top-4 left-4 right-4 z-50">
      <div className="bg-white/30 backdrop-blur-2xl rounded-3xl border border-white/40 px-8 py-4 shadow-xl shadow-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-semibold text-gray-800 tracking-tight">途迹</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="/" className="text-gray-600/80 hover:text-primary-mid transition-colors font-medium">首页</a>
            <a href="/ai-planner" className="text-gray-600/80 hover:text-primary-mid transition-colors font-medium">AI</a>
            <button
              onClick={handleClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
              className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-300"
              style={{
                background: isRecording
                  ? 'linear-gradient(135deg, #ec4899, #f43f5e)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)',
                transform: isRecording ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <span className={`transition-transform duration-300 ${isRecording ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                ＋
              </span>
              {isRecording && (
                <span className="absolute text-white text-lg">🎙</span>
              )}
              
              {/* Wave animation for desktop */}
              {isRecording && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 pointer-events-none">
                  <svg 
                    className="w-16 h-16 opacity-50"
                    viewBox="0 0 64 64"
                  >
                    <defs>
                      <linearGradient id="waveGradDesktop" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 32 Q16 20 24 32 Q32 44 40 32 Q48 20 56 32"
                      fill="none"
                      stroke="url(#waveGradDesktop)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{
                        animation: 'waveMove 0.8s ease-in-out infinite',
                      }}
                    />
                    <path
                      d="M8 40 Q16 28 24 40 Q32 52 40 40 Q48 28 56 40"
                      fill="none"
                      stroke="url(#waveGradDesktop)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.5"
                      style={{
                        animation: 'waveMove 0.8s ease-in-out infinite 0.2s',
                      }}
                    />
                  </svg>
                </div>
              )}
            </button>
            <a href="/map" className="text-gray-600/80 hover:text-primary-mid transition-colors font-medium">地图</a>
            <a href="/profile" className="text-gray-600/80 hover:text-primary-mid transition-colors font-medium">我的</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-white/30 transition-colors">
              <Bell size={20} className="text-gray-600/70" />
            </button>
            <a href="/profile" className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary-mid/30">
              <span className="text-white font-medium">我</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waveMove {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </header>
  );
}
