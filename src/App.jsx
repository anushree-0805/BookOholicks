import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BrandDashboard from './pages/BrandDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ActiveCampaigns from './pages/ActiveCampaigns'
import Home from './pages/Home'
import GlobalFeed from './pages/GlobalFeed'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import NFTGallery from './components/community/NFTGallery'
import RewardNotification from './components/common/RewardNotification'
import { useRewardNotifications } from './hooks/useRewardNotifications'

function App() {
  const { notification, closeNotification } = useRewardNotifications();

  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/campaigns" element={<ActiveCampaigns />} />
          <Route path="/feed" element={<GlobalFeed />} />
          <Route path="/nft-gallery" element={<NFTGallery />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:communityId" element={<CommunityDetail />} />
        </Routes>

        {/* Reward Notifications */}
        {notification && (
          <RewardNotification reward={notification} onClose={closeNotification} />
        )}
      </div>
    </Router>
  )
}

export default App