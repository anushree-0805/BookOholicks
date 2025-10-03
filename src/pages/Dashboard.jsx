import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Book, TrendingUp, Award, User } from 'lucide-react';
import ProfileEdit from '../components/dashboard/ProfileEdit';
import ReadingStreak from '../components/dashboard/ReadingStreak';
import NFTCollection from '../components/dashboard/NFTCollection';
import Overview from '../components/dashboard/Overview';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Book className="w-16 h-16 text-[#4a6359] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to continue</h2>
          <p className="text-gray-600">Access your reading journey, streaks, and NFT collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-[#4a6359] text-[#4a6359]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Book className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-[#4a6359] text-[#4a6359]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('streaks')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'streaks'
                  ? 'border-[#4a6359] text-[#4a6359]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Reading Streaks
            </button>
            <button
              onClick={() => setActiveTab('nfts')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'nfts'
                  ? 'border-[#4a6359] text-[#4a6359]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award className="w-4 h-4" />
              NFT Collection
            </button>
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'profile' && <ProfileEdit />}
        {activeTab === 'streaks' && <ReadingStreak />}
        {activeTab === 'nfts' && <NFTCollection />}
      </div>
    </div>
  );
};

export default Dashboard;
