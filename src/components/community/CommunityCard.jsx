import React from 'react';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community, onJoin }) => {
  const navigate = useNavigate();

  const categoryColors = {
    fiction: 'bg-purple-100 text-purple-700',
    'non-fiction': 'bg-blue-100 text-blue-700',
    'sci-fi': 'bg-cyan-100 text-cyan-700',
    fantasy: 'bg-pink-100 text-pink-700',
    mystery: 'bg-gray-100 text-gray-700',
    romance: 'bg-red-100 text-red-700',
    biography: 'bg-yellow-100 text-yellow-700',
    'self-help': 'bg-green-100 text-green-700',
    general: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      {/* Banner */}
      <div
        className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"
        style={community.banner ? { backgroundImage: `url(${community.banner})`, backgroundSize: 'cover' } : {}}
      />

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
              onClick={() => navigate(`/communities/${community._id}`)}
            >
              {community.name}
              {community.isVerified && (
                <CheckCircle size={16} className="inline ml-1 text-blue-500" />
              )}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {community.description}
            </p>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[community.category] || categoryColors.general}`}>
            {community.category}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{community.stats?.memberCount || 0} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={16} />
            <span>{community.stats?.weeklyActivity || 0} active</span>
          </div>
        </div>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {community.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex space-x-2">
          {community.isMember ? (
            <button
              onClick={() => navigate(`/communities/${community._id}`)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/communities/${community._id}`)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Preview
              </button>
              <button
                onClick={onJoin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Join
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
