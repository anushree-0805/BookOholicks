import React, { useState, useEffect } from 'react';
import { Home, Users, Trophy, Gift, Bell } from 'lucide-react';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import api from '../config/api';

const GlobalFeed = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'streaks', label: 'My Streaks', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const filters = [
    { id: 'recent', label: 'Recent' },
    { id: 'popular', label: 'Popular' },
    { id: 'trending', label: 'Trending' }
  ];

  useEffect(() => {
    if (activeTab === 'home') {
      fetchPosts();
    }
  }, [filter, page, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/posts/feed?page=${page}&limit=20&filter=${filter}`
      );

      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }

      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post =>
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <>
            {/* Create Post */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
              <div className="flex space-x-4">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFilter(f.id);
                      setPage(1);
                    }}
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

            {/* Feed Posts */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Load More Button */}
            {!loading && hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
              </div>
            )}
          </>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'home' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFeed;
