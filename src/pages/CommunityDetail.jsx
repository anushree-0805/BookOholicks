import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Calendar, Award, FileText } from 'lucide-react';
import api from '../config/api';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import CommunityMembers from '../components/community/CommunityMembers';
import CommunityEvents from '../components/community/CommunityEvents';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'rewards', label: 'Rewards', icon: Award }
  ];

  useEffect(() => {
    fetchCommunity();
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [communityId, activeTab]);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communities/${communityId}`);
      setCommunity(response.data);
      setIsMember(response.data.isMember || false);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/communities/${communityId}/join`);
      setIsMember(true);
      fetchCommunity();
    } catch (error) {
      console.error('Error joining community:', error);
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        await api.post(`/communities/${communityId}/leave`);
        setIsMember(false);
        fetchCommunity();
      } catch (error) {
        console.error('Error leaving community:', error);
      }
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"
        style={community.banner ? { backgroundImage: `url(${community.banner})`, backgroundSize: 'cover' } : {}}
      />

      {/* Community Header */}
      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
              <p className="text-gray-600 mb-4">{community.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users size={18} />
                  <span>{community.stats?.memberCount || 0} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText size={18} />
                  <span>{community.stats?.postCount || 0} posts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>{community.stats?.weeklyActivity || 0} weekly activity</span>
                </div>
              </div>
            </div>

            {/* Join/Leave Button */}
            <div>
              {isMember ? (
                <button
                  onClick={handleLeave}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Leave
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {community.tags && community.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {community.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {isMember ? (
                  <CreatePost onPostCreated={handlePostCreated} communityId={communityId} />
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <p className="text-blue-900 font-medium mb-2">Join this community to post</p>
                    <button
                      onClick={handleJoin}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Community
                    </button>
                  </div>
                )}

                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={handlePostUpdate}
                    onDelete={handlePostDelete}
                  />
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No posts yet. {isMember && 'Be the first to post!'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && <CommunityMembers communityId={communityId} />}

            {activeTab === 'events' && <CommunityEvents communityId={communityId} isMember={isMember} />}

            {activeTab === 'rewards' && (
              <div className="text-center py-12">
                <Award size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Rewards</h3>
                <p className="text-gray-600">
                  Earn NFT badges by contributing to this community!
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900">Top Contributor</p>
                    <p className="text-sm text-blue-700 mt-1">Weekly leaderboard winner</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900">Event Host</p>
                    <p className="text-sm text-purple-700 mt-1">Host community events</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-semibold text-green-900">Active Member</p>
                    <p className="text-sm text-green-700 mt-1">Consistent engagement</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
