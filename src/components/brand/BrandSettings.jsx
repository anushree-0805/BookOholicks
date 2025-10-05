import { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const BrandSettings = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [brandData, setBrandData] = useState({
    name: '',
    logo: null,
    description: '',
    website: '',
    category: 'bookstore',
    twitter: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    walletAddress: '',
    subscription: 'free',
  });

  // Load brand profile data
  useEffect(() => {
    if (userProfile?.brandProfile) {
      const brand = userProfile.brandProfile;
      setBrandData({
        name: brand.name || brand.brandName || '',
        logo: brand.logo || null,
        description: brand.description || '',
        website: brand.website || '',
        category: brand.category || 'bookstore',
        twitter: brand.socialMedia?.twitter || brand.socialLinks?.twitter || '',
        instagram: brand.socialMedia?.instagram || brand.socialLinks?.instagram || '',
        facebook: brand.socialMedia?.facebook || brand.socialLinks?.facebook || '',
        linkedin: brand.socialMedia?.linkedin || brand.socialLinks?.linkedin || '',
        walletAddress: brand.walletAddress || '',
        subscription: brand.subscription || 'free',
      });
      if (brand.logo) {
        setPreviewLogo(brand.logo);
      }
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Prepare update payload
      const updatePayload = {
        name: brandData.name,
        brandName: brandData.name, // Also update brandName for backward compatibility
        description: brandData.description,
        website: brandData.website,
        category: brandData.category,
        socialMedia: {
          twitter: brandData.twitter,
          instagram: brandData.instagram,
          facebook: brandData.facebook,
          linkedin: brandData.linkedin,
        },
        socialLinks: { // Also update socialLinks for backward compatibility
          twitter: brandData.twitter,
          instagram: brandData.instagram,
          facebook: brandData.facebook,
          linkedin: brandData.linkedin,
        },
        walletAddress: brandData.walletAddress,
        subscription: brandData.subscription,
      };

      // Update brand profile
      await api.put(`/brands/${user.uid}`, updatePayload);

      // If there's a new logo, upload it
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);

        await api.post(`/brands/${user.uid}/logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Refresh user profile
      await refreshUserProfile();

      alert('Brand settings updated successfully!');
    } catch (error) {
      console.error('Error saving brand settings:', error);
      alert('Error updating brand settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#4a6359]">Brand Settings</h2>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-[#4a6359] mb-2">Brand Logo</label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {previewLogo ? (
                <img src={previewLogo} alt="Brand logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🏢</span>
              )}
            </div>
            <label
              htmlFor="logo-upload"
              className="absolute bottom-0 right-0 bg-[#a56b8a] text-white p-2 rounded-full cursor-pointer hover:bg-[#8e5a75] transition-all"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>Recommended: Square image, at least 400x400px</p>
            <p className="mt-1">Max file size: 2MB</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#4a6359] mb-2">Brand Name</label>
          <input
            type="text"
            value={brandData.name}
            onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
            className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
            placeholder="Your Brand Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a6359] mb-2">Category</label>
          <select
            value={brandData.category}
            onChange={(e) => setBrandData({ ...brandData, category: e.target.value })}
            className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          >
            <option value="bookstore">Bookstore</option>
            <option value="publisher">Publisher</option>
            <option value="author">Author</option>
            <option value="event">Event Organizer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4a6359] mb-2">Description</label>
        <textarea
          value={brandData.description}
          onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
          className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          rows="4"
          placeholder="Tell readers about your brand..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4a6359] mb-2">Website</label>
        <input
          type="url"
          value={brandData.website}
          onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
          className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          placeholder="https://yourbrand.com"
        />
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-bold text-[#4a6359] mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4a6359] mb-2">Twitter</label>
            <input
              type="text"
              value={brandData.twitter}
              onChange={(e) => setBrandData({ ...brandData, twitter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              placeholder="@yourbrand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a6359] mb-2">Instagram</label>
            <input
              type="text"
              value={brandData.instagram}
              onChange={(e) => setBrandData({ ...brandData, instagram: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              placeholder="@yourbrand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a6359] mb-2">Facebook</label>
            <input
              type="text"
              value={brandData.facebook}
              onChange={(e) => setBrandData({ ...brandData, facebook: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              placeholder="facebook.com/yourbrand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a6359] mb-2">LinkedIn</label>
            <input
              type="text"
              value={brandData.linkedin}
              onChange={(e) => setBrandData({ ...brandData, linkedin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
              placeholder="linkedin.com/company/yourbrand"
            />
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div>
        <label className="block text-sm font-medium text-[#4a6359] mb-2">Wallet Address</label>
        <input
          type="text"
          value={brandData.walletAddress}
          onChange={(e) => setBrandData({ ...brandData, walletAddress: e.target.value })}
          className="w-full px-4 py-2 border border-[#4a6359] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a]"
          placeholder="0x..."
          readOnly
        />
        <p className="text-sm text-gray-600 mt-2">Connected wallet for NFT minting and distributions</p>
      </div>

      {/* Subscription Plan */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-[#4a6359] mb-4">Subscription Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[#4a6359] capitalize">{brandData.subscription} Plan</p>
            <p className="text-sm text-gray-600 mt-1">
              {brandData.subscription === 'free' && 'Up to 3 campaigns, 500 NFTs/month'}
              {brandData.subscription === 'basic' && 'Up to 10 campaigns, 2000 NFTs/month'}
              {brandData.subscription === 'premium' && 'Unlimited campaigns and NFTs'}
            </p>
          </div>
          <button className="bg-[#a56b8a] text-white px-4 py-2 rounded-lg hover:bg-[#8e5a75] transition-all">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#4a6359] text-white px-6 py-2 rounded-lg hover:bg-[#3d5248] transition-all"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BrandSettings;
