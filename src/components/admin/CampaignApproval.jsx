import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const CampaignApproval = () => {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPendingCampaigns();
    }
  }, [user]);

  const fetchPendingCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/campaigns/pending/all');
      setCampaigns(response.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/approve`);
      alert('Campaign approved!');
      fetchPendingCampaigns();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (campaignId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.post(`/campaigns/${campaignId}/reject`, { reason });
      alert('Campaign rejected');
      fetchPendingCampaigns();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4a6359] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 text-xl font-bold mb-4">Please sign in to access admin panel</div>
          <p className="text-gray-600">You need to be signed in to approve campaigns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4a6359]">Campaign Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve pending campaigns</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-[#4a6359] mb-2">No pending campaigns</h3>
          <p className="text-gray-600">All campaigns have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#4a6359]">{campaign.campaignName}</h3>
                    <p className="text-sm text-gray-600 capitalize mt-1">
                      {campaign.campaignType} Campaign
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Brand:</span>
                  <span className="text-sm text-gray-600 ml-2">{campaign.brandName}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total Supply:</span>
                    <span className="text-sm text-gray-600 ml-2">{campaign.totalSupply}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Rarity:</span>
                    <span className="text-sm text-gray-600 ml-2">{campaign.rarity}</span>
                  </div>
                </div>

                {campaign.campaignType === 'phygital' && campaign.physicalItem?.enabled && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium text-purple-800 mb-1">🎁 Phygital NFT</div>
                    <div className="text-xs text-purple-600">
                      Physical Item: {campaign.physicalItem.name}
                    </div>
                    <div className="text-xs text-purple-600">
                      Value: ${campaign.physicalItem.estimatedValue}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Benefits:</span>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    {campaign.benefits?.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(campaign._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(campaign._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignApproval;
