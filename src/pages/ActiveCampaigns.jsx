import { useState, useEffect } from 'react';
import { Trophy, Clock, Gift, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../config/api';

const ActiveCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

  const fetchActiveCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/active/all');
      setCampaigns(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4a6359] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a6359] to-[#a56b8a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Active Campaigns</h1>
              <p className="text-lg opacity-90 mt-2">Claim exclusive NFTs and rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-[#4a6359] mb-2">No active campaigns</h3>
            <p className="text-gray-600">Check back soon for new campaigns!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onClaimed={fetchActiveCampaigns}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignCard = ({ campaign, onClaimed }) => {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, [campaign, user]);

  const checkEligibility = async () => {
    if (!user) {
      setEligibilityResult({ eligible: false, reason: 'Please sign in' });
      setCheckingEligibility(false);
      return;
    }

    try {
      const response = await api.get(
        `/campaigns/${campaign._id}/check-eligibility/${user.uid}`
      );
      setEligibilityResult(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityResult({ eligible: false, reason: 'Error checking eligibility' });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      alert('Please sign in to claim NFTs');
      return;
    }

    try {
      setClaiming(true);
      const response = await api.post(`/campaign-claims/${campaign._id}/claim`);

      alert(
        `🎉 NFT Claimed Successfully!\n\n` +
        `Transaction Hash: ${response.data.transactionHash}\n\n` +
        `Check your NFT collection!`
      );

      onClaimed();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert('Error claiming NFT: ' + errorMsg);
    } finally {
      setClaiming(false);
    }
  };

  const progress = campaign.totalSupply
    ? ((campaign.claimed || 0) / campaign.totalSupply) * 100
    : 0;

  const nftsRemaining = campaign.totalSupply - (campaign.claimed || 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* NFT Image */}
      <div className="h-48 bg-gradient-to-br from-[#4a6359] to-[#a56b8a] flex items-center justify-center text-6xl">
        {campaign.nftImage}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#4a6359] mb-1">{campaign.campaignName}</h3>
          <p className="text-sm text-gray-600 capitalize">
            {campaign.campaignType} • {campaign.rarity}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{campaign.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-[#4a6359]">
              {campaign.claimed || 0}/{campaign.totalSupply}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4a6359] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {nftsRemaining > 0 ? `${nftsRemaining} remaining` : 'Sold out'}
          </div>
        </div>

        {/* Phygital Badge */}
        {campaign.campaignType === 'phygital' && campaign.physicalItem?.enabled && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-purple-800 font-medium text-sm mb-1">
              <Gift className="w-4 h-4" />
              Phygital NFT
            </div>
            <div className="text-xs text-purple-600">
              Includes: {campaign.physicalItem.name}
            </div>
          </div>
        )}

        {/* Benefits */}
        {campaign.benefits && campaign.benefits.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Benefits:</div>
            <ul className="text-xs text-gray-600 space-y-1">
              {campaign.benefits.slice(0, 2).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#4a6359]">✓</span>
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
              {campaign.benefits.length > 2 && (
                <li className="text-gray-500">+{campaign.benefits.length - 2} more...</li>
              )}
            </ul>
          </div>
        )}

        {/* Eligibility Info */}
        {campaign.eligibility?.type !== 'open' && eligibilityResult && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Requirement: </span>
              {campaign.eligibility?.description || 'Check eligibility'}
            </div>
          </div>
        )}

        {/* Claim Button */}
        {checkingEligibility ? (
          <button
            disabled
            className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium"
          >
            Checking eligibility...
          </button>
        ) : !user ? (
          <button
            disabled
            className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium"
          >
            Sign in to claim
          </button>
        ) : nftsRemaining <= 0 ? (
          <button
            disabled
            className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium"
          >
            Sold Out
          </button>
        ) : !eligibilityResult?.eligible ? (
          <div>
            <button
              disabled
              className="w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium mb-2"
            >
              Not Eligible
            </button>
            {eligibilityResult?.reason && (
              <div className="text-xs text-red-600 text-center">
                {eligibilityResult.reason}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-2 bg-[#4a6359] text-white rounded-lg text-sm font-medium hover:bg-[#3d5248] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {claiming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Claiming...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Claim NFT
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveCampaigns;
