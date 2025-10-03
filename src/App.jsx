import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BrandDashboard from './pages/BrandDashboard'
import Home from './pages/Home'
import GlobalFeed from './pages/GlobalFeed'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
          <Route path="/feed" element={<GlobalFeed />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:communityId" element={<CommunityDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App