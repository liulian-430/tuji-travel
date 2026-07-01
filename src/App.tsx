import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useRef, useCallback, useEffect, useState } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import AIPlanner from './pages/AIPlanner';
import NewTrip from './pages/NewTrip';
import Map from './pages/Map';
import Search from './pages/Search';
import POIDetail from './pages/POIDetail';
import TripDetail from './pages/TripDetail';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import GuideDetail from './pages/GuideDetail';

const mainPages = ['/', '/ai-planner', '/map', '/profile'];

function SwipeContainer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontal = useRef(false);
  const isAnimating = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const isEdgeSwipe = useRef(false);
  const EDGE_THRESHOLD = 35;

  const currentPageIndex = mainPages.indexOf(location.pathname);
  const isMainPage = currentPageIndex !== -1;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMainPage) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isDragging.current = true;
    isHorizontal.current = false;
    
    const isLeftEdge = touch.clientX < EDGE_THRESHOLD;
    const isRightEdge = touch.clientX > window.innerWidth - EDGE_THRESHOLD;
    isEdgeSwipe.current = isLeftEdge || isRightEdge;
  }, [isMainPage]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !isMainPage || !isEdgeSwipe.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;

    if (!isHorizontal.current) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isHorizontal.current = true;
      } else if (Math.abs(diffY) > 10) {
        return;
      }
    }

    if (isHorizontal.current) {
      e.preventDefault();
      let offset = diffX;
      if ((currentPageIndex === 0 && offset > 0) || (currentPageIndex === mainPages.length - 1 && offset < 0)) {
        offset = offset * 0.3;
      }
      setDragOffset(offset);
    }
  }, [currentPageIndex, isMainPage]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !isMainPage || !isHorizontal.current || !isEdgeSwipe.current) {
      isDragging.current = false;
      isHorizontal.current = false;
      isEdgeSwipe.current = false;
      return;
    }
    isDragging.current = false;
    isHorizontal.current = false;
    isEdgeSwipe.current = false;

    const diffX = dragOffset;
    const threshold = 80;

    if (Math.abs(diffX) > threshold) {
      isAnimating.current = true;
      setDragOffset(diffX > 0 ? window.innerWidth : -window.innerWidth);
      setTimeout(() => {
        if (diffX > 0 && currentPageIndex > 0) {
          navigate(mainPages[currentPageIndex - 1]);
        } else if (diffX < 0 && currentPageIndex < mainPages.length - 1) {
          navigate(mainPages[currentPageIndex + 1]);
        }
        setDragOffset(0);
        isAnimating.current = false;
      }, 250);
    } else {
      isAnimating.current = true;
      setDragOffset(0);
      setTimeout(() => {
        isAnimating.current = false;
      }, 300);
    }
  }, [currentPageIndex, dragOffset, isMainPage, navigate]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getSwipeStyle = (): React.CSSProperties => {
    if (isAnimating.current || dragOffset !== 0) {
      return {
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging.current && isHorizontal.current ? 'none' : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      };
    }
    return {
      animation: 'pageFadeIn 0.35s ease-out',
    };
  };

  return (
    <div style={getSwipeStyle()}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SwipeContainer>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-planner" element={<AIPlanner />} />
            <Route path="/new-trip" element={<NewTrip />} />
            <Route path="/map" element={<Map />} />
            <Route path="/search" element={<Search />} />
            <Route path="/poi/:id" element={<POIDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/budget/:tripId" element={<Budget />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/guide/:id" element={<GuideDetail />} />
          </Routes>
          <BottomNav />
          <style>{`
            @keyframes pageFadeIn {
              0% {
                opacity: 0.3;
                transform: scale(0.99);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </SwipeContainer>
    </Router>
  );
}
