import { useState, useEffect } from 'react';
import { Gift, Lock, Unlock, Check, X, Clock, Users, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const AvailableCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [eligibilityStatus, setEligibilityStatus] = useState({});
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/active/all');
      setCampaigns(response.data);

      // Check eligibility for all campaigns
      if (user) {
        checkAllEligibility(response.data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const checkAllEligibility = async (campaignsList) => {
    const statusMap = {};

    for (const campaign of campaignsList) {
      try {
        const response = await api.get(`/campaigns/${campaign._id}/check-eligibility/${user.uid}`);
        statusMap[campaign._id] = response.data;
      } catch (err) {
        console.error(`Error checking eligibility for campaign ${campaign._id}:`, err);
        statusMap[campaign._id] = { eligible: false, reason: 'Error checking eligibility' };
      }
    }

    setEligibilityStatus(statusMap);
  };

  const handleClaimClick = (campaign) => {
    setSelectedCampaign(campaign);
    setClaimSuccess(null);
  };

  const handleClaim = async () => {
    if (!selectedCampaign) return;

    try {
      setClaiming(true);
      const response = await api.post(`/campaign-claims/${selectedCampaign._id}/claim`);

      setClaimSuccess({
        message: 'NFT claimed successfully!',
        transactionHash: response.data.transactionHash,
        nft: response.data.nft
      });

      // Refresh campaigns
      fetchCampaigns();
    } catch (err) {
      console.error('Error claiming NFT:', err);
      alert('Failed to claim NFT: ' + (err.response?.data?.message || err.message));
    } finally {
      setClaiming(false);
    }
  };

  const closeModal = () => {
    setSelectedCampaign(null);
    setClaimSuccess(null);
  };

  const getTypeIcon = (type) => {
    const icons = {
      reward: '🎁',
      access: '🎫',
      phygital: '🔗',
      achievement: '🏆',
    };
    return icons[type] || '📦';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      Common: 'text-gray-600',
      Rare: 'text-blue-600',
      Epic: 'text-purple-600',
      Legendary: 'text-yellow-600',
      Mythic: 'text-red-600',
    };
    return colors[rarity] || 'text-gray-600';
  };

  const getEligibilityIcon = (campaignId) => {
    const status = eligibilityStatus[campaignId];
    if (!status) return <Clock className="w-5 h-5 text-gray-400" />;

    return status.eligible ? (
      <Unlock className="w-5 h-5 text-green-600" />
    ) : (
      <Lock className="w-5 h-5 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4a6359] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4a6359] mb-2">Available Campaigns</h1>
        <p className="text-gray-600">Claim exclusive NFTs and rewards from your favorite brands</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-[#4a6359] mb-2">No campaigns available</h3>
          <p className="text-gray-600">Check back later for new campaigns and rewards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Campaign Image/Icon */}
              <div className="bg-gradient-to-br from-[#4a6359] to-[#a56b8a] p-8 text-center">
                <div className="text-6xl mb-2">{getTypeIcon(campaign.campaignType)}</div>
                <div className={`text-sm font-semibold ${getRarityColor(campaign.rarity)}`}>
                  {campaign.rarity}
                </div>
              </div>

              {/* Campaign Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-[#4a6359] flex-1">{campaign.campaignName}</h3>
                  {getEligibilityIcon(campaign._id)}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {campaign.description || 'Exclusive campaign reward'}
                </p>

                {/* Brand */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{campaign.brandName}</span>
                </div>

                {/* Benefits */}
                {campaign.benefits && campaign.benefits.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-[#4a6359] mb-2">Benefits:</div>
                    <div className="flex flex-wrap gap-1">
                      {campaign.benefits.slice(0, 2).map((benefit, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#4a6359] bg-opacity-10 text-[#4a6359] px-2 py-1 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                      {campaign.benefits.length > 2 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{campaign.benefits.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Supply Info */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">
                    {campaign.unlimited ? (
                      'Unlimited Supply'
                    ) : (
                      `${campaign.claimed || 0}/${campaign.totalSupply} Claimed`
                    )}
                  </span>
                  {!campaign.unlimited && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#4a6359] h-2 rounded-full transition-all"
                        style={{
                          width: `${((campaign.claimed || 0) / campaign.totalSupply) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Eligibility Status */}
                {eligibilityStatus[campaign._id] && (
                  <div
                    className={`text-xs p-2 rounded-lg mb-4 ${
                      eligibilityStatus[campaign._id].eligible
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {eligibilityStatus[campaign._id].reason}
                  </div>
                )}

                {/* Claim Button */}
                <button
                  onClick={() => handleClaimClick(campaign)}
                  disabled={!eligibilityStatus[campaign._id]?.eligible}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    eligibilityStatus[campaign._id]?.eligible
                      ? 'bg-[#a56b8a] text-white hover:bg-[#8e5a75]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  {eligibilityStatus[campaign._id]?.eligible ? 'Claim NFT' : 'Not Eligible'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      {selectedCampaign && !claimSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#4a6359] mb-4">Confirm Claim</h2>

            <div className="bg-gradient-to-br from-[#4a6359] to-[#a56b8a] p-6 rounded-lg text-center mb-4">
              <div className="text-5xl mb-2">{getTypeIcon(selectedCampaign.campaignType)}</div>
              <div className="text-white font-bold text-lg">{selectedCampaign.campaignName}</div>
              <div className={`text-sm font-semibold ${getRarityColor(selectedCampaign.rarity)}`}>
                {selectedCampaign.rarity}
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              {selectedCampaign.description || 'Claim this exclusive NFT reward'}
            </p>

            {selectedCampaign.benefits && selectedCampaign.benefits.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-[#4a6359] mb-2">You'll receive:</div>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {selectedCampaign.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
              ⚠️ This action will mint/transfer an NFT to your wallet. Make sure you have your wallet connected.
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={claiming}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 px-4 py-3 bg-[#a56b8a] text-white rounded-lg hover:bg-[#8e5a75] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Claiming...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {claimSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#4a6359] mb-2">Success!</h2>
              <p className="text-gray-600">{claimSuccess.message}</p>
            </div>

            {claimSuccess.transactionHash && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-[#4a6359] mb-1">Transaction Hash:</div>
                <a
                  href={`https://testnet.u2uscan.xyz/tx/${claimSuccess.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {claimSuccess.transactionHash}
                </a>
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full px-4 py-3 bg-[#4a6359] text-white rounded-lg hover:bg-[#3d5248] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableCampaigns;
