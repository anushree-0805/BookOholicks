import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const CampaignWizard = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    // Step 1: Campaign Type
    campaignType: 'reward',
    campaignName: '',
    description: '',

    // Step 2: Utility & Benefits
    utilityType: 'discount',
    utilityValue: '',
    utilityDescription: '',
    benefits: [],
    rarity: 'Common',

    // Step 3: NFT Design
    nftImage: null,
    totalSupply: 100,
    unlimited: false,

    // Step 4: Distribution
    distributionMethod: 'qr_code',
    startDate: '',
    endDate: '',
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // TODO: API call to create campaign
    console.log('Creating campaign:', campaignData);
    onClose();
  };

  const updateData = (field, value) => {
    setCampaignData({ ...campaignData, [field]: value });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#4a6359]">Choose Campaign Type</h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'reward', title: 'Reward', desc: 'Loyalty rewards for customers', icon: '🎁' },
                { type: 'access', title: 'Access', desc: 'Event or exclusive access', icon: '🎫' },
                { type: 'phygital', title: 'Phygital', desc: 'Physical + Digital rewards', icon: '🔗' },
                { type: 'achievement', title: 'Achievement', desc: 'Milestone achievements', icon: '🏆' },
              ].map((campaign) => (
                <button
                  key={campaign.type}
                  onClick={() => updateData('campaignType', campaign.type)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    campaignData.campaignType === campaign.type
                      ? 'border-[#4a6359] bg-[#4a6359] bg-opacity-10'
                      : 'border-gray-300 hover:border-[#4a6359]'
                  }`}
                >
                  <div className="text-3xl mb-2">{campaign.icon}</div>
                  <div className="font-bold text-[#4a6359]">{campaign.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{campaign.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignData.campaignName}
                onChange={(e) => updateData('campaignName', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                placeholder="e.g., Summer Reading Rewards"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Description
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => updateData('description', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                rows="3"
                placeholder="Describe your campaign..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#4a6359]">Define Utility & Benefits</h2>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Utility Type
              </label>
              <select
                value={campaignData.utilityType}
                onChange={(e) => updateData('utilityType', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              >
                <option value="discount">Discount</option>
                <option value="event_access">Event Access</option>
                <option value="book_unlock">Book Unlock</option>
                <option value="merchandise">Merchandise</option>
                <option value="signed_copy">Signed Copy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Utility Value
              </label>
              <input
                type="text"
                value={campaignData.utilityValue}
                onChange={(e) => updateData('utilityValue', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                placeholder="e.g., 20% off, VIP Access, Free Book"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Rarity Level
              </label>
              <select
                value={campaignData.rarity}
                onChange={(e) => updateData('rarity', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
                <option value="Mythic">Mythic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                Additional Benefits
              </label>
              <textarea
                value={campaignData.utilityDescription}
                onChange={(e) => updateData('utilityDescription', e.target.value)}
                className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                rows="3"
                placeholder="Describe additional benefits..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#4a6359]">NFT Design</h2>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">
                NFT Image
              </label>
              <div className="border-2 border-dashed border-[#4a6359] rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateData('nftImage', e.target.files[0])}
                  className="hidden"
                  id="nft-image"
                />
                <label htmlFor="nft-image" className="cursor-pointer">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-[#4a6359] font-medium">Upload NFT Image</div>
                  <div className="text-sm text-gray-600 mt-1">PNG, JPG up to 10MB</div>
                  {campaignData.nftImage && (
                    <div className="text-sm text-[#a56b8a] mt-2">
                      Selected: {campaignData.nftImage.name}
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={campaignData.unlimited}
                  onChange={(e) => updateData('unlimited', e.target.checked)}
                  className="w-4 h-4 text-[#4a6359] rounded focus:ring-[#a56b8a]"
                />
                <span className="text-sm font-medium text-[#4a6359]">Unlimited Supply</span>
              </label>
            </div>

            {!campaignData.unlimited && (
              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">
                  Total Supply
                </label>
                <input
                  type="number"
                  value={campaignData.totalSupply}
                  onChange={(e) => updateData('totalSupply', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                  min="1"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#4a6359]">Distribution Method</h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { method: 'qr_code', title: 'QR Code', desc: 'In-store QR scanning', icon: '📱' },
                { method: 'airdrop', title: 'Airdrop', desc: 'Send to wallet addresses', icon: '✈️' },
                { method: 'redeem_code', title: 'Redeem Code', desc: 'Unique claim codes', icon: '🎟️' },
                { method: 'manual', title: 'Manual', desc: 'Manual distribution', icon: '👤' },
              ].map((dist) => (
                <button
                  key={dist.method}
                  onClick={() => updateData('distributionMethod', dist.method)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    campaignData.distributionMethod === dist.method
                      ? 'border-[#4a6359] bg-[#4a6359] bg-opacity-10'
                      : 'border-gray-300 hover:border-[#4a6359]'
                  }`}
                >
                  <div className="text-3xl mb-2">{dist.icon}</div>
                  <div className="font-bold text-[#4a6359]">{dist.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{dist.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={campaignData.startDate}
                  onChange={(e) => updateData('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={campaignData.endDate}
                  onChange={(e) => updateData('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-[#4a6359]">Create Campaign</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#4a6359] hover:text-[#a56b8a] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-[#4a6359]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderStep()}</div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#4a6359] hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#a56b8a] text-white px-6 py-2 rounded-lg hover:bg-[#8e5a75] transition-all"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-[#4a6359] text-white px-6 py-2 rounded-lg hover:bg-[#3d5248] transition-all"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
