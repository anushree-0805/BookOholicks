import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const MySharedNFTs = () => {
  const { user } = useAuth();
  const [sharedNFTs, setSharedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMySharedNFTs();
    }
  }, [user]);

  const fetchMySharedNFTs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shared-nfts/user/${user.uid}`);
      setSharedNFTs(response.data);
    } catch (error) {
      console.error('Error fetching shared NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCaption = async () => {
    if (!selectedNFT) return;

    try {
      setUpdating(true);
      await api.put(`/shared-nfts/${selectedNFT._id}`, {
        caption: newCaption
      });

      // Update local state
      setSharedNFTs(prev => prev.map(nft =>
        nft._id === selectedNFT._id
          ? { ...nft, caption: newCaption }
          : nft
      ));

      setSelectedNFT({ ...selectedNFT, caption: newCaption });
      setEditingCaption(false);
      alert('Caption updated successfully!');
    } catch (error) {
      console.error('Error updating caption:', error);
      alert('Error updating caption: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (sharedNFTId) => {
    if (!confirm('Are you sure you want to remove this NFT from the community gallery?')) {
      return;
    }

    try {
      await api.delete(`/shared-nfts/${sharedNFTId}`);
      setSharedNFTs(prev => prev.filter(nft => nft._id !== sharedNFTId));
      setSelectedNFT(null);
      alert('NFT removed from community gallery');
    } catch (error) {
      console.error('Error deleting shared NFT:', error);
      alert('Error deleting: ' + (error.response?.data?.message || error.message));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              My Shared NFTs
            </h2>
            <p className="text-sm opacity-90">NFTs you've shared with the community</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{sharedNFTs.length}</p>
            <p className="text-sm opacity-90">Total Shared</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      {sharedNFTs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a6359] mb-4">Engagement Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#4a6359]">
                {sharedNFTs.reduce((sum, nft) => sum + (nft.likes?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-600">Total Likes</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#4a6359]">
                {sharedNFTs.reduce((sum, nft) => sum + (nft.comments?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-600">Total Comments</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#4a6359]">
                {sharedNFTs.reduce((sum, nft) => sum + (nft.views || 0), 0)}
              </p>
              <p className="text-xs text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
      )}

      {/* Shared NFTs Grid */}
      {sharedNFTs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-[#4a6359] mb-2">No Shared NFTs Yet</h3>
          <p className="text-gray-600 mb-4">
            Share your NFTs with the community to showcase your achievements!
          </p>
          <p className="text-sm text-gray-500">
            Go to "My NFTs", select an NFT, and click the "Share" button
          </p>
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
                <h3 className="font-bold text-[#4a6359] mb-2 line-clamp-1">{sharedNFT.nftId?.name}</h3>

                {/* Shared Date */}
                <p className="text-xs text-gray-500 mb-2">Shared {formatDate(sharedNFT.sharedAt)}</p>

                {/* Caption */}
                {sharedNFT.caption && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">"{sharedNFT.caption}"</p>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{sharedNFT.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>{sharedNFT.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-green-500" />
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-[#d4a960] p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-[#4a6359]">Your Shared NFT</h3>
              <button
                onClick={() => {
                  setSelectedNFT(null);
                  setEditingCaption(false);
                }}
                className="text-gray-500 hover:text-[#4a6359]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* NFT Image */}
              <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] rounded-2xl h-64 flex items-center justify-center border-4 border-[#d4a960] overflow-hidden">
                {selectedNFT.nftId?.image && selectedNFT.nftId.image.startsWith('http') ? (
                  <img src={selectedNFT.nftId.image} alt={selectedNFT.nftId.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-9xl">{selectedNFT.nftId?.image || '📦'}</span>
                )}
              </div>

              {/* NFT Info */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-2xl font-bold text-[#4a6359]">{selectedNFT.nftId?.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRarityColor(selectedNFT.nftId?.rarity)}`}>
                    {selectedNFT.nftId?.rarity}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{selectedNFT.nftId?.description}</p>
              </div>

              {/* Caption Section */}
              <div className="bg-[#f5f1e8] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-[#4a6359]">Your Caption</h5>
                  {!editingCaption && (
                    <button
                      onClick={() => {
                        setEditingCaption(true);
                        setNewCaption(selectedNFT.caption || '');
                      }}
                      className="text-sm text-[#a56b8a] hover:text-[#8e5a75] flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
                {editingCaption ? (
                  <div>
                    <textarea
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] resize-none"
                      rows="3"
                      maxLength="500"
                    />
                    <p className="text-xs text-gray-500 mb-2">{newCaption.length}/500</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateCaption}
                        disabled={updating}
                        className="px-4 py-2 bg-[#a56b8a] text-white rounded-lg text-sm hover:bg-[#8e5a75] transition-all disabled:opacity-50"
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingCaption(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#4a6359] italic">
                    {selectedNFT.caption || 'No caption added'}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-[#4a6359] mb-3">Engagement Stats</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#4a6359]">{selectedNFT.likes?.length || 0}</p>
                    <p className="text-xs text-gray-600">Likes</p>
                  </div>
                  <div className="text-center">
                    <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#4a6359]">{selectedNFT.comments?.length || 0}</p>
                    <p className="text-xs text-gray-600">Comments</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#4a6359]">{selectedNFT.views || 0}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                </div>
              </div>

              {/* Who Liked Section */}
              {selectedNFT.likes && selectedNFT.likes.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-[#4a6359] mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    People who liked ({selectedNFT.likes.length})
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedNFT.likes.map((like, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                          {like.userId?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-gray-700">{like.userId}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(like.likedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {selectedNFT.comments && selectedNFT.comments.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-[#4a6359] mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    Comments ({selectedNFT.comments.length})
                  </h5>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedNFT.comments.map((comment, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {comment.userName?.charAt(0).toUpperCase() || comment.userId?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-[#4a6359]">
                                {comment.userName || comment.userId}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(selectedNFT._id)}
                  className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Remove from Gallery
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Shared on {formatDate(selectedNFT.sharedAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySharedNFTs;
