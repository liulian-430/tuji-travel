import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useRef, useCallback, useEffect } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import AIPlanner from './pages/AIPlanner';
import NewTrip from './pages/NewTrip';
import Map from './pages/Map';
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
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isDragging = useRef(false);

  const currentPageIndex = mainPages.indexOf(location.pathname);
  const isMainPage = currentPageIndex !== -1;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMainPage) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
    isDragging.current = true;
  }, [isMainPage]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !isMainPage) return;
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;

    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  }, [isMainPage]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !isMainPage) {
      isDragging.current = false;
      return;
    }
    isDragging.current = false;

    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;

    if (Math.abs(diffX) < Math.abs(diffY)) return;
    if (Math.abs(diffX) < 80) return;

    if (diffX > 0) {
      if (currentPageIndex > 0) {
        navigate(mainPages[currentPageIndex - 1]);
      }
    } else {
      if (currentPageIndex < mainPages.length - 1) {
        navigate(mainPages[currentPageIndex + 1]);
      }
    }
  }, [currentPageIndex, isMainPage, navigate]);

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

  return <>{children}</>;
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
            <Route path="/poi/:id" element={<POIDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/budget/:tripId" element={<Budget />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/guide/:id" element={<GuideDetail />} />
          </Routes>
          <BottomNav />
        </div>
      </SwipeContainer>
    </Router>
  );
}
