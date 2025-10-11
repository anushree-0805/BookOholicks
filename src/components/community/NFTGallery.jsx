import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const NFTGallery = () => {
  const { user } = useAuth();
  const [sharedNFTs, setSharedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [sortBy]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shared-nfts/gallery?sortBy=${sortBy}`);
      setSharedNFTs(response.data.sharedNFTs);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (sharedNFTId) => {
    if (!user) {
      alert('Please log in to like NFTs');
      return;
    }

    try {
      const response = await api.post(`/shared-nfts/${sharedNFTId}/like`);

      // Update local state
      setSharedNFTs(prev => prev.map(nft =>
        nft._id === sharedNFTId
          ? {
              ...nft,
              likes: response.data.liked
                ? [...nft.likes, { userId: user.uid }]
                : nft.likes.filter(l => l.userId !== user.uid),
              likeCount: response.data.likeCount
            }
          : nft
      ));

      // Update selected NFT if it's the one being liked
      if (selectedNFT && selectedNFT._id === sharedNFTId) {
        setSelectedNFT(prev => ({
          ...prev,
          likes: response.data.liked
            ? [...prev.likes, { userId: user.uid }]
            : prev.likes.filter(l => l.userId !== user.uid),
          likeCount: response.data.likeCount
        }));
      }
    } catch (error) {
      console.error('Error liking NFT:', error);
      alert('Error liking NFT: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleComment = async (sharedNFTId) => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await api.post(`/shared-nfts/${sharedNFTId}/comment`, {
        text: comment
      });

      // Update local state
      setSharedNFTs(prev => prev.map(nft =>
        nft._id === sharedNFTId
          ? {
              ...nft,
              comments: [...nft.comments, response.data.comment],
              commentCount: response.data.commentCount
            }
          : nft
      ));

      // Update selected NFT
      if (selectedNFT && selectedNFT._id === sharedNFTId) {
        setSelectedNFT(prev => ({
          ...prev,
          comments: [...prev.comments, response.data.comment],
          commentCount: response.data.commentCount
        }));
      }

      setComment('');
    } catch (error) {
      console.error('Error commenting:', error);
      alert('Error adding comment: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  const isLiked = (nft) => {
    if (!user) return false;
    return nft.likes?.some(like => like.userId === user.uid);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4a6359] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4a6359] mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-[#d4a960]" />
          Community NFT Gallery
        </h1>
        <p className="text-gray-600">Discover and appreciate NFTs shared by the community</p>
      </div>

      {/* Sort Options */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="font-medium text-[#4a6359]">Sort by:</span>
          <div className="flex gap-2">
            {[
              { id: 'recent', label: 'Most Recent', icon: '🕒' },
              { id: 'popular', label: 'Most Popular', icon: '❤️' },
              { id: 'trending', label: 'Trending', icon: '🔥' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === option.id
                    ? 'bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white shadow-md'
                    : 'bg-[#f5f1e8] text-[#6b7f75] hover:bg-[#d4a960] hover:text-white'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {sharedNFTs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-[#4a6359] mb-2">No shared NFTs yet</h3>
          <p className="text-gray-600">Be the first to share your NFTs with the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedNFTs.map((sharedNFT) => (
            <div
              key={sharedNFT._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelectedNFT(sharedNFT)}
            >
              {/* NFT Image */}
              <div className="relative bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] h-64 flex items-center justify-center overflow-hidden">
                {sharedNFT.nftId?.image && sharedNFT.nftId.image.startsWith('http') ? (
                  <img src={sharedNFT.nftId.image} alt={sharedNFT.nftId.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl">{sharedNFT.nftId?.image || '📦'}</span>
                )}
                {/* Rarity Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(sharedNFT.nftId?.rarity)}`}>
                    {sharedNFT.nftId?.rarity}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a56b8a] to-[#8e5a75] flex items-center justify-center text-white font-bold">
                    {sharedNFT.userProfilePic ? (
                      <img src={sharedNFT.userProfilePic} alt={sharedNFT.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      sharedNFT.userName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#4a6359]">{sharedNFT.userName}</p>
                    <p className="text-xs text-gray-500">{formatDate(sharedNFT.sharedAt)}</p>
                  </div>
                </div>

                {/* NFT Title */}
                <h3 className="font-bold text-[#4a6359] mb-2 line-clamp-1">{sharedNFT.nftId?.name}</h3>

                {/* Caption */}
                {sharedNFT.caption && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sharedNFT.caption}</p>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(sharedNFT._id);
                    }}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked(sharedNFT) ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked(sharedNFT) ? 'fill-current' : ''}`} />
                    <span>{sharedNFT.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{sharedNFT.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{sharedNFT.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-[#d4a960] p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-[#4a6359]">Shared NFT</h3>
              <button
                onClick={() => setSelectedNFT(null)}
                className="text-gray-500 hover:text-[#4a6359]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a56b8a] to-[#8e5a75] flex items-center justify-center text-white font-bold text-lg">
                  {selectedNFT.userProfilePic ? (
                    <img src={selectedNFT.userProfilePic} alt={selectedNFT.userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedNFT.userName.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#4a6359]">{selectedNFT.userName}</p>
                  <p className="text-sm text-gray-500">{formatDate(selectedNFT.sharedAt)}</p>
                </div>
              </div>

              {/* NFT Image */}
              <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] rounded-2xl h-96 flex items-center justify-center mb-6 border-4 border-[#d4a960] overflow-hidden">
                {selectedNFT.nftId?.image && selectedNFT.nftId.image.startsWith('http') ? (
                  <img src={selectedNFT.nftId.image} alt={selectedNFT.nftId.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-9xl">{selectedNFT.nftId?.image || '📦'}</span>
                )}
              </div>

              {/* NFT Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-2xl font-bold text-[#4a6359]">{selectedNFT.nftId?.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor(selectedNFT.nftId?.rarity)}`}>
                    {selectedNFT.nftId?.rarity}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{selectedNFT.nftId?.description}</p>
                {selectedNFT.caption && (
                  <div className="bg-[#f5f1e8] p-4 rounded-lg">
                    <p className="text-[#4a6359]">"{selectedNFT.caption}"</p>
                  </div>
                )}
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <button
                  onClick={() => handleLike(selectedNFT._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isLiked(selectedNFT)
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked(selectedNFT) ? 'fill-current' : ''}`} />
                  <span>{selectedNFT.likes?.length || 0} Likes</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedNFT.comments?.length || 0} Comments</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{selectedNFT.views || 0} Views</span>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h5 className="font-bold text-[#4a6359] mb-4">Comments</h5>

                {/* Comment Input */}
                {user && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] resize-none"
                        rows="2"
                      />
                      <button
                        onClick={() => handleComment(selectedNFT._id)}
                        disabled={submittingComment || !comment.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedNFT.comments?.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
                  ) : (
                    selectedNFT.comments?.map((comment, index) => (
                      <div key={index} className="flex gap-3 bg-gray-50 p-4 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a56b8a] to-[#8e5a75] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {comment.userProfilePic ? (
                            <img src={comment.userProfilePic} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            comment.userName?.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-[#4a6359]">{comment.userName}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
