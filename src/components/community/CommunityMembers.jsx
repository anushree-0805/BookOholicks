import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import api from '../../config/api';

const CommunityMembers = ({ communityId }) => {
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  const sortOptions = [
    { id: 'recent', label: 'Recent' },
    { id: 'reputation', label: 'Reputation' },
    { id: 'contributions', label: 'Contributions' }
  ];

  useEffect(() => {
    fetchMembers();
    fetchLeaderboard();
  }, [communityId, sortBy]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/communities/${communityId}/members?sort=${sortBy}`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Leaderboard */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Trophy size={24} className="mr-2 text-yellow-600" />
          Weekly Top Contributors
        </h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((contributor, idx) => (
            <div key={contributor.userId} className="flex items-center justify-between bg-white p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{contributor.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    {contributor.weeklyContributions?.posts || 0} posts � {contributor.weeklyContributions?.comments || 0} comments
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">{contributor.reputation} rep</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">All Members ({members.length})</h3>
          <div className="flex space-x-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.user?.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">{member.reputation} rep</p>
                    <p className="text-xs text-gray-500">
                      {member.totalContributions?.posts || 0} posts
                    </p>
                  </div>
                </div>

                {member.badges && member.badges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {member.badges.slice(0, 3).map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMembers;
