import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BrandDashboard from './pages/BrandDashboard'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App