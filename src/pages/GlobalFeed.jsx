import React, { useState, useEffect } from 'react';
import { Home, Users, Trophy, Gift, Bell, Award, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import NFTPostCard from '../components/feed/NFTPostCard';
import NFTGallery from '../components/community/NFTGallery';
import api from '../config/api';

const GlobalFeed = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [sharedNFTs, setSharedNFTs] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-posts', label: 'My Posts', icon: User },
    { id: 'nft-gallery', label: 'NFT Gallery', icon: Award },
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
      fetchFeed();
    } else if (activeTab === 'my-posts' && user) {
      fetchMyPosts();
    }
  }, [filter, page, activeTab, user]);

  const fetchFeed = async () => {
    try {
      setLoading(true);

      // Fetch both posts and shared NFTs
      const [postsResponse, nftsResponse] = await Promise.all([
        api.get(`/posts/feed?page=${page}&limit=20&filter=${filter}`),
        api.get(`/shared-nfts/gallery?sortBy=${filter}`)
      ]);

      const postsData = postsResponse.data.map(post => ({ ...post, type: 'post' }));
      const nftsData = nftsResponse.data.sharedNFTs.map(nft => ({ ...nft, type: 'nft' }));

      // Mix posts and NFTs based on filter
      let combinedFeed = [...postsData, ...nftsData];

      // Sort combined feed based on filter
      if (filter === 'recent') {
        combinedFeed.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.sharedAt);
          const dateB = new Date(b.createdAt || b.sharedAt);
          return dateB - dateA;
        });
      } else if (filter === 'popular') {
        combinedFeed.sort((a, b) => {
          const likesA = a.stats?.likeCount || a.likes?.length || 0;
          const likesB = b.stats?.likeCount || b.likes?.length || 0;
          return likesB - likesA;
        });
      } else if (filter === 'trending') {
        combinedFeed.sort((a, b) => {
          const viewsA = a.stats?.viewCount || a.views || 0;
          const viewsB = b.stats?.viewCount || b.views || 0;
          return viewsB - viewsA;
        });
      }

      if (page === 1) {
        setFeedItems(combinedFeed);
      } else {
        setFeedItems(prev => [...prev, ...combinedFeed]);
      }

      setHasMore(postsData.length === 20);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get(`/posts/user/${user.uid}`);
      setMyPosts(response.data);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    const newPostWithType = { ...newPost, type: 'post' };
    setFeedItems(prev => [newPostWithType, ...prev]);
    if (activeTab === 'my-posts') {
      setMyPosts(prev => [newPost, ...prev]);
    }
  };

  const handlePostUpdate = (updatedItem) => {
    setFeedItems(prev => prev.map(item =>
      item._id === updatedItem._id ? { ...updatedItem, type: item.type } : item
    ));
    setMyPosts(prev => prev.map(post =>
      post._id === updatedItem._id ? updatedItem : post
    ));
  };

  const handlePostDelete = (postId) => {
    setFeedItems(prev => prev.filter(item => item._id !== postId));
    setMyPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handleNFTUpdate = (updatedNFT) => {
    setFeedItems(prev => prev.map(item =>
      item._id === updatedNFT._id && item.type === 'nft' ? { ...updatedNFT, type: 'nft' } : item
    ));
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

            {/* Feed Items (Posts + NFTs) */}
            <div className="space-y-6">
              {feedItems.map((item) =>
                item.type === 'post' ? (
                  <PostCard
                    key={item._id}
                    post={item}
                    onUpdate={handlePostUpdate}
                    onDelete={handlePostDelete}
                  />
                ) : (
                  <NFTPostCard
                    key={item._id}
                    sharedNFT={item}
                    onUpdate={handleNFTUpdate}
                  />
                )
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Load More Button */}
            {!loading && hasMore && feedItems.length > 0 && (
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
            {!loading && feedItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No posts or NFTs yet. Be the first to share!</p>
              </div>
            )}
          </>
        )}

        {/* My Posts Tab */}
        {activeTab === 'my-posts' && (
          <>
            {!user ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your posts</h2>
                <p className="text-gray-600">You need to be logged in to see your posts</p>
              </div>
            ) : (
              <>
                {/* Create Post */}
                <CreatePost onPostCreated={handlePostCreated} />

                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{user.email}</h2>
                      <p className="text-gray-600">{myPosts.length} {myPosts.length === 1 ? 'Post' : 'Posts'}</p>
                    </div>
                  </div>
                </div>

                {/* My Posts */}
                <div className="space-y-6">
                  {loading && myPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : myPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">You haven't posted anything yet</p>
                      <p className="text-gray-400">Share your thoughts with the community!</p>
                    </div>
                  ) : (
                    myPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onUpdate={handlePostUpdate}
                        onDelete={handlePostDelete}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* NFT Gallery Tab */}
        {activeTab === 'nft-gallery' && (
          <div className="max-w-7xl mx-auto">
            <NFTGallery />
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'home' && activeTab !== 'nft-gallery' && activeTab !== 'my-posts' && (
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
