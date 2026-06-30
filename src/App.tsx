import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import AIPlanner from './pages/AIPlanner';
import Map from './pages/Map';
import Search from './pages/Search';
import POIDetail from './pages/POIDetail';
import TripDetail from './pages/TripDetail';
import Budget from './pages/Budget';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-pink-50/20">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/map" element={<Map />} />
          <Route path="/search" element={<Search />} />
          <Route path="/poi/:id" element={<POIDetail />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="/budget/:tripId" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
