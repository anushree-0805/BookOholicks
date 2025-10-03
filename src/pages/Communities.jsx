import React, { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp } from 'lucide-react';
import api from '../config/api';
import CommunityCard from '../components/community/CommunityCard';
import CreateCommunityModal from '../components/community/CreateCommunityModal';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [filter, setFilter] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'popular', label: 'Popular' },
    { id: 'trending', label: 'Trending' },
    { id: 'newest', label: 'Newest' }
  ];

  const categories = [
    'all', 'fiction', 'non-fiction', 'sci-fi', 'fantasy', 'mystery', 'romance', 'biography', 'self-help'
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCommunities();
    fetchMyCommunities();
    fetchSuggested();
  }, [filter, selectedCategory, searchTerm]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ filter });
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/communities?${params}`);
      setCommunities(response.data);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    try {
      const response = await api.get('/communities/user/my-communities');
      setMyCommunities(response.data);
    } catch (error) {
      console.error('Error fetching my communities:', error);
    }
  };

  const fetchSuggested = async () => {
    try {
      const response = await api.get('/communities/suggested/for-you');
      setSuggested(response.data);
    } catch (error) {
      console.error('Error fetching suggested communities:', error);
    }
  };

  const handleCommunityCreated = (newCommunity) => {
    setCommunities(prev => [newCommunity, ...prev]);
    setMyCommunities(prev => [newCommunity, ...prev]);
    setShowCreateModal(false);
  };

  const handleJoin = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      fetchCommunities();
      fetchMyCommunities();
      fetchSuggested();
    } catch (error) {
      console.error('Error joining community:', error);
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* My Communities */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">My Communities</h3>
                {myCommunities.length > 0 ? (
                  <div className="space-y-2">
                    {myCommunities.slice(0, 5).map((community) => (
                      <a
                        key={community._id}
                        href={`/communities/${community._id}`}
                        className="block p-2 hover:bg-gray-50 rounded text-sm"
                      >
                        {community.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No communities yet</p>
                )}
              </div>

              {/* Create Community Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Create Community</span>
              </button>

              {/* Suggested */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Suggested</h3>
                {suggested.slice(0, 3).map((community) => (
                  <div key={community._id} className="mb-3 last:mb-0">
                    <h4 className="font-semibold text-sm">{community.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{community.stats?.memberCount || 0} members</p>
                    <button
                      onClick={() => handleJoin(community._id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-4">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Communities Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communities.map((community) => (
                  <CommunityCard
                    key={community._id}
                    community={community}
                    onJoin={() => handleJoin(community._id)}
                  />
                ))}
              </div>
            )}

            {!loading && communities.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No communities found</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Trending Tags */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <TrendingUp size={18} className="mr-2" />
                  Trending Tags
                </h3>
                <div className="space-y-2">
                  {['#fantasy', '#scifi', '#bookclub', '#reading2025', '#thriller'].map((tag) => (
                    <div key={tag} className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-3">Platform Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Communities</span>
                    <span className="font-semibold">{communities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Communities</span>
                    <span className="font-semibold">{myCommunities.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onCommunityCreated={handleCommunityCreated}
        />
      )}
    </div>
  );
};

export default Communities;
