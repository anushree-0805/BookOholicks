import { useState } from 'react';
import { Search, Filter, MoreVertical, Pause, Play, Trash2, QrCode, Download } from 'lucide-react';

const CampaignManager = ({ onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Mock data - will be replaced with API calls
  const campaigns = [
    {
      id: 1,
      name: 'Summer Reading Rewards',
      type: 'reward',
      status: 'active',
      minted: 234,
      claimed: 156,
      redeemed: 89,
      totalSupply: 500,
      distribution: 'qr_code',
      startDate: '2025-01-15',
      conversionRate: 38,
    },
    {
      id: 2,
      name: 'Book Club VIP Access',
      type: 'access',
      status: 'active',
      minted: 89,
      claimed: 67,
      redeemed: 45,
      totalSupply: 100,
      distribution: 'redeem_code',
      startDate: '2025-02-01',
      conversionRate: 67,
    },
    {
      id: 3,
      name: 'Author Meet & Greet',
      type: 'phygital',
      status: 'completed',
      minted: 150,
      claimed: 150,
      redeemed: 150,
      totalSupply: 150,
      distribution: 'airdrop',
      startDate: '2025-01-01',
      conversionRate: 100,
    },
    {
      id: 4,
      name: 'Reading Streak Badges',
      type: 'achievement',
      status: 'active',
      minted: 567,
      claimed: 423,
      redeemed: 201,
      totalSupply: 1000,
      distribution: 'manual',
      startDate: '2025-01-10',
      conversionRate: 47,
    },
  ];

  const getTypeIcon = (type) => {
    const icons = {
      reward: '🎁',
      access: '🎫',
      phygital: '🔗',
      achievement: '🏆',
    };
    return icons[type] || '📦';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      draft: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getTypeIcon(campaign.type)}</div>
                <div>
                  <h3 className="font-bold text-[#4a6359]">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{campaign.type} Campaign</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <button className="text-gray-400 hover:text-[#4a6359] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-[#4a6359]">{campaign.minted}</div>
                <div className="text-xs text-gray-600">Minted</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-[#a56b8a]">{campaign.claimed}</div>
                <div className="text-xs text-gray-600">Claimed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-[#d4a960]">{campaign.redeemed}</div>
                <div className="text-xs text-gray-600">Redeemed</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-[#4a6359]">
                  {campaign.claimed}/{campaign.totalSupply}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#4a6359] h-2 rounded-full transition-all"
                  style={{ width: `${(campaign.claimed / campaign.totalSupply) * 100}%` }}
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span className="capitalize">{campaign.distribution.replace('_', ' ')}</span>
              </div>
              <div>Conversion: {campaign.conversionRate}%</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {campaign.status === 'active' && (
                <>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#4a6359] text-[#4a6359] rounded-lg hover:bg-[#4a6359] hover:text-white transition-all">
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  {campaign.distribution === 'qr_code' && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#a56b8a] text-white rounded-lg hover:bg-[#8e5a75] transition-all">
                      <QrCode className="w-4 h-4" />
                      View QR
                    </button>
                  )}
                  {campaign.distribution === 'redeem_code' && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#d4a960] text-white rounded-lg hover:bg-[#c99a50] transition-all">
                      <Download className="w-4 h-4" />
                      Export Codes
                    </button>
                  )}
                </>
              )}
              {campaign.status === 'paused' && (
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-[#4a6359] mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first NFT campaign to get started'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={onCreateNew}
              className="bg-[#a56b8a] text-white px-6 py-2 rounded-lg hover:bg-[#8e5a75] transition-all"
            >
              Create Campaign
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
