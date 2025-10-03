import React from 'react';
import { Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';

const PostEngagementBar = ({ isLiked, isReposted, onLike, onComment, onRepost, onShare }) => {
  return (
    <div className="px-4 py-3 flex items-center justify-around border-t">
      <button
        onClick={onLike}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors ${
          isLiked ? 'text-red-600' : 'text-gray-600'
        }`}
      >
        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
        <span className="font-medium">Like</span>
      </button>

      <button
        onClick={onComment}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <MessageCircle size={20} />
        <span className="font-medium">Comment</span>
      </button>

      <button
        onClick={onRepost}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors ${
          isReposted ? 'text-green-600' : 'text-gray-600'
        }`}
      >
        <Repeat2 size={20} />
        <span className="font-medium">Repost</span>
      </button>

      <button
        onClick={onShare}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-colors"
      >
        <Share2 size={20} />
        <span className="font-medium">Share</span>
      </button>
    </div>
  );
};

export default PostEngagementBar;
