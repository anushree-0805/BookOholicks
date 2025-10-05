import { useState } from 'react';
import { BarChart3, Package, Settings, PlusCircle } from 'lucide-react';
import BrandOverview from '../components/brand/BrandOverview';
import CampaignManager from '../components/brand/CampaignManager';
import CampaignWizard from '../components/brand/CampaignWizard';
import BrandSettings from '../components/brand/BrandSettings';

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCampaignCreated = () => {
    setShowWizard(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const renderContent = () => {
    if (showWizard) {
      return (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleCampaignCreated}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return <BrandOverview />;
      case 'campaigns':
        return <CampaignManager key={refreshKey} onCreateNew={() => setShowWizard(true)} />;
      case 'settings':
        return <BrandSettings />;
      default:
        return <BrandOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4a6359]">Brand Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your NFT campaigns and analytics</p>
        </div>

        {/* Action Bar */}
        {!showWizard && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#4a6359] text-white'
                        : 'text-[#4a6359] hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'campaigns' && (
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 bg-[#a56b8a] text-white px-4 py-2 rounded-lg hover:bg-[#8e5a75] transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Create Campaign
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
