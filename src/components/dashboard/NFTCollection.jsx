import { useState, useEffect } from 'react';
import { useNFTs } from '../../hooks/useNFTs';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const NFTCollection = ({ preview = false }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [sharing, setSharing] = useState(false);
  const { nfts, loading, redeemNFT } = useNFTs();
  const { user } = useAuth();

  // Mock NFT data - will be replaced with blockchain data
  const nftCollection = [
    {
      id: 1,
      name: '7-Day Reading Streak',
      image: '🔥',
      category: 'streak',
      rarity: 'Common',
      description: 'Earned by maintaining a 7-day reading streak',
      dateEarned: '2025-09-15',
      benefits: ['10% discount on next book purchase', 'Early access to new releases'],
      redeemed: false,
      brand: 'Bookoholics'
    },
    {
      id: 2,
      name: 'Mystery Reader Badge',
      image: '🔍',
      category: 'genre',
      rarity: 'Rare',
      description: 'Awarded for reading 10 mystery novels',
      dateEarned: '2025-09-20',
      benefits: ['Exclusive mystery book club access', 'Free signed mystery novel'],
      redeemed: false,
      brand: 'Mystery House Publishers'
    },
    {
      id: 3,
      name: 'Limited Edition Pre-Order',
      image: '📚',
      category: 'reward',
      rarity: 'Epic',
      description: 'Access to limited edition signed copy',
      dateEarned: '2025-09-25',
      benefits: ['Pre-order upcoming bestseller', 'Author signature included', 'Numbered edition'],
      redeemed: false,
      brand: 'Penguin Random House'
    },
    {
      id: 4,
      name: 'Author Meet & Greet',
      image: '✨',
      category: 'event',
      rarity: 'Legendary',
      description: 'VIP access to exclusive author event',
      dateEarned: '2025-09-28',
      benefits: ['Virtual meet with bestselling author', 'Q&A session access', 'Signed bookplate'],
      redeemed: false,
      brand: 'Simon & Schuster'
    },
    {
      id: 5,
      name: 'Bookstore Loyalty Reward',
      image: '🏪',
      category: 'reward',
      rarity: 'Rare',
      description: 'Never-expiring bookstore credit',
      dateEarned: '2025-09-30',
      benefits: ['$25 store credit', 'Never expires', 'Stackable with other offers'],
      redeemed: false,
      brand: 'Barnes & Noble'
    },
    {
      id: 6,
      name: 'Early Bird Reader',
      image: '🌅',
      category: 'achievement',
      rarity: 'Common',
      description: 'Read before 8 AM for 5 consecutive days',
      dateEarned: '2025-10-01',
      benefits: ['Morning reader badge', '5% discount on coffee table books'],
      redeemed: true,
      brand: 'Bookoholics'
    },
    {
      id: 7,
      name: 'Community Champion',
      image: '👥',
      category: 'community',
      rarity: 'Epic',
      description: 'Top contributor in book discussions',
      dateEarned: '2025-10-02',
      benefits: ['Moderator access', 'Exclusive community events', 'Custom profile badge'],
      redeemed: false,
      brand: 'Bookoholics'
    },
    {
      id: 8,
      name: 'Fantasy World Explorer',
      image: '🐉',
      category: 'genre',
      rarity: 'Rare',
      description: 'Completed 15 fantasy novels',
      dateEarned: '2025-10-02',
      benefits: ['Fantasy book recommendations', 'Access to fantasy-only events'],
      redeemed: false,
      brand: 'Tor Books'
    }
  ];

  const categories = [
    { id: 'all', name: 'All NFTs', icon: '🎨' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'genre', name: 'Genre', icon: '📖' },
    { id: 'reward', name: 'Rewards', icon: '🎁' },
    { id: 'event', name: 'Events', icon: '✨' },
    { id: 'achievement', name: 'Achievements', icon: '🏆' },
    { id: 'community', name: 'Community', icon: '👥' }
  ];

  // Use actual NFTs from API or mock data
  const nftData = nfts.length > 0 ? nfts : nftCollection;

  const filteredNFTs = filterCategory === 'all'
    ? nftData
    : nftData.filter(nft => nft.category === filterCategory);

  const displayNFTs = preview ? filteredNFTs.slice(0, 4) : filteredNFTs;

  const handleRedeem = async (nftId) => {
    const result = await redeemNFT(nftId);
    if (result.success) {
      alert('NFT redeemed successfully!');
      setSelectedNFT(null);
    } else {
      alert('Error redeeming NFT: ' + result.error);
    }
  };

  const handleShareClick = (nft) => {
    setSelectedNFT(nft);
    setShowShareModal(true);
    setShareCaption('');
  };

  const handleShare = async () => {
    if (!selectedNFT) return;

    try {
      setSharing(true);
      const response = await api.post('/shared-nfts', {
        nftId: selectedNFT._id || selectedNFT.id,
        caption: shareCaption
      });

      alert('NFT shared successfully to the community!');
      setShowShareModal(false);
      setShareCaption('');
    } catch (error) {
      console.error('Error sharing NFT:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already shared')) {
        alert('You have already shared this NFT. You can view it in the Community Gallery!');
      } else {
        alert('Error sharing NFT: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSharing(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-200 text-gray-700';
      case 'Rare': return 'bg-blue-200 text-blue-700';
      case 'Epic': return 'bg-purple-200 text-purple-700';
      case 'Legendary': return 'bg-yellow-200 text-yellow-700';
      case 'Mythic': return 'bg-red-200 text-red-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (preview) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayNFTs.map((nft) => (
          <div
            key={nft.id}
            className="bg-gradient-to-br from-white to-[#f5f1e8] rounded-xl p-4 border-2 border-[#d4a960] hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="text-5xl mb-2 text-center">{nft.image}</div>
            <p className="text-sm font-bold text-[#4a6359] text-center truncate">{nft.name}</p>
            <p className="text-xs text-center mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                {nft.rarity}
              </span>
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Collection Stats */}
        <div className="bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] rounded-2xl p-6 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{nftData.length}</p>
              <p className="text-sm opacity-90 mt-1">Total NFTs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{nftData.filter(n => !n.redeemed).length}</p>
              <p className="text-sm opacity-90 mt-1">Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{nftData.filter(n => n.redeemed).length}</p>
              <p className="text-sm opacity-90 mt-1">Redeemed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{nftData.filter(n => n.onChain).length}</p>
              <p className="text-sm opacity-90 mt-1">On Blockchain</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a6359] mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterCategory === cat.id
                    ? 'bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white shadow-md'
                    : 'bg-[#f5f1e8] text-[#6b7f75] hover:bg-[#d4a960] hover:text-white'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayNFTs.map((nft) => (
            <div
              key={nft.id}
              onClick={() => setSelectedNFT(nft)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
            >
              {/* NFT Image */}
              <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] h-48 flex items-center justify-center border-b-4 border-[#d4a960] overflow-hidden">
                {nft.image && nft.image.startsWith('http') ? (
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl">{nft.image || '📦'}</span>
                )}
              </div>

              {/* NFT Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-[#4a6359] text-sm line-clamp-2">{nft.name}</h4>
                  <div className="flex gap-1">
                    {nft.redeemed && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">✓</span>
                    )}
                    {nft.onChain && (
                      <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full" title="On blockchain">⛓️</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#6b7f75] mb-3 line-clamp-2">{nft.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </span>
                  <span className="text-xs text-[#6b7f75]">{nft.category}</span>
                </div>

                <div className="text-xs text-[#6b7f75] mb-3">
                  <span className="font-medium">Earned:</span> {nft.dateEarned}
                </div>

                <div className="text-xs text-[#6b7f75] mb-3">
                  <span className="font-medium">Brand:</span> {nft.brand}
                </div>

                <button
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    nft.redeemed
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white hover:shadow-lg'
                  }`}
                  disabled={nft.redeemed}
                >
                  {nft.redeemed ? 'Already Redeemed' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayNFTs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-[#4a6359] mb-2">No NFTs in this category yet</h3>
            <p className="text-[#6b7f75]">Keep reading and engaging to earn more NFT rewards!</p>
          </div>
        )}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-[#d4a960] p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#4a6359]">NFT Details</h3>
              <button
                onClick={() => setSelectedNFT(null)}
                className="text-[#6b7f75] hover:text-[#4a6359]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* NFT Image */}
              <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] rounded-2xl h-64 flex items-center justify-center border-4 border-[#d4a960] overflow-hidden">
                {selectedNFT.image && selectedNFT.image.startsWith('http') ? (
                  <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-9xl">{selectedNFT.image || '📦'}</span>
                )}
              </div>

              {/* NFT Info */}
              <div>
                <h4 className="text-2xl font-bold text-[#4a6359] mb-2">{selectedNFT.name}</h4>
                <p className="text-[#6b7f75]">{selectedNFT.description}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f5f1e8] p-4 rounded-xl">
                  <p className="text-xs text-[#6b7f75] mb-1">Rarity</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(selectedNFT.rarity)}`}>
                    {selectedNFT.rarity}
                  </span>
                </div>
                <div className="bg-[#f5f1e8] p-4 rounded-xl">
                  <p className="text-xs text-[#6b7f75] mb-1">Category</p>
                  <p className="font-semibold text-[#4a6359] capitalize">{selectedNFT.category}</p>
                </div>
                <div className="bg-[#f5f1e8] p-4 rounded-xl">
                  <p className="text-xs text-[#6b7f75] mb-1">Date Earned</p>
                  <p className="font-semibold text-[#4a6359]">{selectedNFT.dateEarned}</p>
                </div>
                <div className="bg-[#f5f1e8] p-4 rounded-xl">
                  <p className="text-xs text-[#6b7f75] mb-1">Brand</p>
                  <p className="font-semibold text-[#4a6359]">{selectedNFT.brand}</p>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h5 className="font-bold text-[#4a6359] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  Unlockable Benefits
                </h5>
                <ul className="space-y-2">
                  {selectedNFT.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#6b7f75]">
                      <svg className="w-5 h-5 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Blockchain Info */}
              {selectedNFT.onChain && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className="font-bold text-[#4a6359] mb-2 flex items-center gap-2">
                    <span>⛓️</span>
                    Blockchain Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-[#6b7f75]">Token ID: </span>
                      <span className="font-mono text-[#4a6359]">{selectedNFT.tokenId}</span>
                    </div>
                    {selectedNFT.transactionHash && (
                      <div>
                        <span className="text-[#6b7f75]">TX Hash: </span>
                        <a
                          href={`https://testnet.u2uscan.xyz/tx/${selectedNFT.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:underline text-xs"
                        >
                          {selectedNFT.transactionHash.substring(0, 10)}...
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleRedeem(selectedNFT._id || selectedNFT.id)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    selectedNFT.redeemed
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white hover:shadow-lg'
                  }`}
                  disabled={selectedNFT.redeemed}
                >
                  {selectedNFT.redeemed ? '✓ Already Redeemed' : '🎁 Redeem Benefits'}
                </button>
                <button
                  onClick={() => handleShareClick(selectedNFT)}
                  className="px-6 py-3 bg-[#d4a960] text-white rounded-lg font-medium hover:bg-[#c99a50] transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                {selectedNFT.onChain && (
                  <button
                    onClick={() => window.open(`https://testnet.u2uscan.xyz/token/${process.env.NFT_CONTRACT_ADDRESS}?a=${selectedNFT.tokenId}`, '_blank')}
                    className="px-6 py-3 bg-[#4a6359] text-white rounded-lg font-medium hover:bg-[#3d5248] transition-all"
                  >
                    View on Chain
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#d4a960] to-[#c99a50] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Your NFT
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* NFT Preview */}
              <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] rounded-xl p-4 border-2 border-[#d4a960]">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedNFT.image && selectedNFT.image.startsWith('http') ? (
                      <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{selectedNFT.image || '📦'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#4a6359]">{selectedNFT.name}</h4>
                    <p className="text-sm text-[#6b7f75]">{selectedNFT.rarity} • {selectedNFT.brand}</p>
                  </div>
                </div>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">
                  Add a caption (optional)
                </label>
                <textarea
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  placeholder="Tell the community about your achievement..."
                  className="w-full px-4 py-3 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white resize-none"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-xs text-[#6b7f75] mt-1 text-right">{shareCaption.length}/500</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Sharing your NFT will display it in the Community Gallery where other users can see and appreciate your achievements!
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  disabled={sharing}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d4a960] to-[#c99a50] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sharing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Share to Community
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCollection;
