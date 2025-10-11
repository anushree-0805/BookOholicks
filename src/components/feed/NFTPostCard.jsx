import { useState } from 'react';
import { Heart, MessageCircle, Eye, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const NFTPostCard = ({ sharedNFT, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLiked = () => {
    if (!user) return false;
    return sharedNFT.likes?.some(like => like.userId === user.uid);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to like NFTs');
      return;
    }

    try {
      const response = await api.post(`/shared-nfts/${sharedNFT._id}/like`);

      // Update parent with new data
      if (onUpdate) {
        onUpdate({
          ...sharedNFT,
          likes: response.data.liked
            ? [...(sharedNFT.likes || []), { userId: user.uid, likedAt: new Date() }]
            : (sharedNFT.likes || []).filter(l => l.userId !== user.uid),
          likeCount: response.data.likeCount
        });
      }
    } catch (error) {
      console.error('Error liking NFT:', error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/shared-nfts/${sharedNFT._id}/comment`, {
        text: comment
      });

      // Update parent with new data
      if (onUpdate) {
        onUpdate({
          ...sharedNFT,
          comments: [...(sharedNFT.comments || []), response.data.comment],
          commentCount: response.data.commentCount
        });
      }

      setComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error commenting:', error);
      alert('Error adding comment: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      Common: 'bg-gray-200 text-gray-700',
      Rare: 'bg-blue-200 text-blue-700',
      Epic: 'bg-purple-200 text-purple-700',
      Legendary: 'bg-yellow-200 text-yellow-700',
      Mythic: 'bg-red-200 text-red-700',
    };
    return colors[rarity] || 'bg-gray-200 text-gray-700';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
            {sharedNFT.userProfilePic ? (
              <img src={sharedNFT.userProfilePic} alt={sharedNFT.userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              sharedNFT.userName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{sharedNFT.userName}</span>
              <span className="text-xs text-gray-500">shared an NFT</span>
              <Award className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500">{formatDate(sharedNFT.sharedAt)}</p>
          </div>
        </div>
      </div>

      {/* Caption */}
      {sharedNFT.caption && (
        <div className="px-4 pt-3">
          <p className="text-gray-800">{sharedNFT.caption}</p>
        </div>
      )}

      {/* NFT Display */}
      <div className="relative mt-3">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex flex-col items-center">
          {/* NFT Image */}
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg mb-4">
            {sharedNFT.nftId?.image && sharedNFT.nftId.image.startsWith('http') ? (
              <img src={sharedNFT.nftId.image} alt={sharedNFT.nftId.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                {sharedNFT.nftId?.image || '📦'}
              </div>
            )}
            {/* Rarity Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getRarityColor(sharedNFT.nftId?.rarity)}`}>
                {sharedNFT.nftId?.rarity}
              </span>
            </div>
          </div>

          {/* NFT Info */}
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{sharedNFT.nftId?.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{sharedNFT.nftId?.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">{sharedNFT.nftId?.brand}</span>
              <span>•</span>
              <span>{sharedNFT.nftId?.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{sharedNFT.likes?.length || 0} likes</span>
            <span>{sharedNFT.comments?.length || 0} comments</span>
            <span>{sharedNFT.views || 0} views</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              isLiked() ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked() ? 'fill-current' : ''}`} />
            <span className="font-medium text-sm">Like</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Comment</span>
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium text-sm">View</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {/* Comment Input */}
          {user && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-2">
            {sharedNFT.comments?.slice(0, 3).map((c, index) => (
              <div key={index} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.userName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 bg-white rounded-lg p-2">
                  <p className="font-semibold text-sm text-gray-900">{c.userName || c.userId}</p>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              </div>
            ))}
            {sharedNFT.comments?.length > 3 && (
              <button className="text-sm text-blue-600 hover:underline">
                View all {sharedNFT.comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPostCard;
