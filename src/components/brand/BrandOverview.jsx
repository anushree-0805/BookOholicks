import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../config/api';

const BrandOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [brandData, setBrandData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Total Campaigns', value: '0', change: '+0', icon: Package, color: '#4a6359' },
    { label: 'NFTs Minted', value: '0', change: '+0', icon: TrendingUp, color: '#a56b8a' },
    { label: 'NFTs Claimed', value: '0', change: '+0', icon: Users, color: '#d4a960' },
    { label: 'Conversion Rate', value: '0%', change: '+0%', icon: DollarSign, color: '#4a6359' },
  ]);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await user.getIdToken();

        // Fetch brand profile
        const brandResponse = await apiClient.get(`/api/brands/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBrandData(brandResponse.data);

        // Fetch campaigns
        const campaignsResponse = await apiClient.get(`/api/campaigns/brand/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampaigns(campaignsResponse.data.slice(0, 3)); // Latest 3 campaigns

        // Update stats
        const brand = brandResponse.data;
        const conversionRate = brand.totalNFTsClaimed > 0
          ? ((brand.totalNFTsClaimed / brand.totalNFTsMinted) * 100).toFixed(0)
          : 0;

        setStats([
          { label: 'Total Campaigns', value: brand.totalCampaigns.toString(), change: '+0', icon: Package, color: '#4a6359' },
          { label: 'NFTs Minted', value: brand.totalNFTsMinted.toLocaleString(), change: '+0', icon: TrendingUp, color: '#a56b8a' },
          { label: 'NFTs Claimed', value: brand.totalNFTsClaimed.toLocaleString(), change: '+0', icon: Users, color: '#d4a960' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, change: '+0%', icon: DollarSign, color: '#4a6359' },
        ]);
      } catch (error) {
        console.error('Error fetching brand data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-[#4a6359]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#4a6359]">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#4a6359] mb-4">Recent Campaigns</h3>
        {campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-[#4a6359]">{campaign.campaignName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {campaign.claimed}/{campaign.minted} claimed
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No campaigns yet. Create your first campaign to get started!
          </div>
        )}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#4a6359] mb-4">Performance Overview</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart visualization coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default BrandOverview;
