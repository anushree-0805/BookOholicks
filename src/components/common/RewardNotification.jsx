import { useState, useEffect } from 'react';
import { NFT_EMOJIS } from '../../config/blockchain';

const RewardNotification = ({ reward, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#d4a960] max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <h3 className="font-bold text-lg">New Reward Earned!</h3>
                <p className="text-sm opacity-90">You've unlocked an NFT</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* NFT Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0] rounded-xl p-6 mb-4 text-center border-2 border-[#d4a960]">
            <div className="text-7xl mb-3">
              {NFT_EMOJIS[reward.type] || '🎁'}
            </div>
            <h4 className="font-bold text-[#4a6359] text-lg mb-2">{reward.name}</h4>
            <p className="text-sm text-[#6b7f75]">{reward.description}</p>

            {/* Rarity Badge */}
            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(reward.rarity)}`}>
                {reward.rarity}
              </span>
            </div>
          </div>

          {/* Benefits Preview */}
          {reward.benefits && reward.benefits.length > 0 && (
            <div className="bg-[#f5f1e8] p-4 rounded-xl">
              <h5 className="font-bold text-[#4a6359] mb-2 text-sm">Unlocked Benefits:</h5>
              <ul className="space-y-1">
                {reward.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-[#6b7f75]">
                    <svg className="w-4 h-4 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                handleClose();
                window.location.href = '/dashboard?tab=nfts';
              }}
              className="flex-1 bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all text-sm"
            >
              View in Collection
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

export default RewardNotification;
