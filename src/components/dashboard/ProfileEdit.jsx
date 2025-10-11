import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/api';

const ProfileEdit = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profilePic: null,
    interestedGenres: [],
    location: '',
    favoriteAuthor: '',
    readingGoal: '',
    walletAddress: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Load user profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        profilePic: null,
        interestedGenres: userProfile.interestedGenres || [],
        location: userProfile.location || '',
        favoriteAuthor: userProfile.favoriteAuthor || '',
        readingGoal: userProfile.readingGoal || '',
        walletAddress: userProfile.walletAddress || ''
      });
      if (userProfile.profilePic) {
        setPreviewImage(userProfile.profilePic);
      }
    }
  }, [userProfile]);

  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Science Fiction',
    'Fantasy', 'Romance', 'Horror', 'Biography', 'History',
    'Self-Help', 'Philosophy', 'Poetry', 'Classic Literature',
    'Young Adult', 'Graphic Novel', 'Crime', 'Adventure'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileData({ ...profileData, profilePic: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGenre = (genre) => {
    if (profileData.interestedGenres.includes(genre)) {
      setProfileData({
        ...profileData,
        interestedGenres: profileData.interestedGenres.filter(g => g !== genre)
      });
    } else {
      setProfileData({
        ...profileData,
        interestedGenres: [...profileData.interestedGenres, genre]
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Prepare update payload
      const updatePayload = {
        name: profileData.name,
        bio: profileData.bio,
        interestedGenres: profileData.interestedGenres,
        location: profileData.location,
        favoriteAuthor: profileData.favoriteAuthor,
        readingGoal: profileData.readingGoal,
        walletAddress: profileData.walletAddress
      };

      // Update user profile
      await api.put(`/users/${user.uid}`, updatePayload);

      // If there's a new profile picture, upload it
      if (profileData.profilePic) {
        const formData = new FormData();
        formData.append('profilePic', profileData.profilePic);

        await api.post(`/users/${user.uid}/profile-pic`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Refresh user profile to get updated data
      await refreshUserProfile();

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-white to-[#faf7f0] rounded-2xl shadow-lg p-8 border-t-4 border-[#a56b8a]">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#4a6359] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#a56b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing
                ? 'bg-[#4a6359] text-white hover:bg-[#3d5248]'
                : 'bg-[#a56b8a] text-white hover:bg-[#8e5a75]'
            }`}
          >
            {loading ? '⏳ Saving...' : isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#a56b8a] to-[#8e5a75] flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{profileData.name.charAt(0)}</span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-[#d4a960] p-2 rounded-full cursor-pointer hover:bg-[#c99a50] transition-colors shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-[#6b7f75] mt-3">Member since {new Date().toLocaleDateString()}</p>
              <div className="mt-4 inline-block bg-[#d4a960] text-white px-4 py-1 rounded-full text-sm font-medium">
                📖 Verified Reader
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-lg font-semibold text-[#4a6359]">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a6359] mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white resize-none"
                  rows="3"
                  placeholder="Tell us about your reading journey..."
                />
              ) : (
                <p className="text-[#6b7f75]">{profileData.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white"
                    placeholder="Your location"
                  />
                ) : (
                  <p className="text-[#6b7f75] flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profileData.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4a6359] mb-2">Favorite Author</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.favoriteAuthor}
                    onChange={(e) => setProfileData({ ...profileData, favoriteAuthor: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white"
                    placeholder="Favorite author"
                  />
                ) : (
                  <p className="text-[#6b7f75] flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {profileData.favoriteAuthor}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Preferences Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-[#4a6359] mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#a56b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Reading Preferences
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#4a6359] mb-3">Interested Genres</label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => isEditing && toggleGenre(genre)}
                disabled={!isEditing}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  profileData.interestedGenres.includes(genre)
                    ? 'bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white shadow-md'
                    : 'bg-[#f5f1e8] text-[#6b7f75] hover:bg-[#d4a960] hover:text-white'
                } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a6359] mb-2">Annual Reading Goal</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.readingGoal}
              onChange={(e) => setProfileData({ ...profileData, readingGoal: e.target.value })}
              className="w-full max-w-md px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white"
              placeholder="e.g., 50 books/year"
            />
          ) : (
            <p className="text-[#6b7f75] flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-semibold">{profileData.readingGoal}</span>
            </p>
          )}
        </div>
      </div>

      {/* Account Information Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-[#4a6359] mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#a56b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Account Information
        </h3>
        <div className="space-y-3 text-[#6b7f75]">
          <div className="flex items-center justify-between p-3 bg-[#f5f1e8] rounded-lg">
            <span className="font-medium">Email</span>
            <span>{user?.email || 'user@example.com'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f5f1e8] rounded-lg">
            <span className="font-medium">Account Status</span>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f5f1e8] rounded-lg">
            <span className="font-medium">Wallet Connected</span>
            <span className={profileData.walletAddress ? "text-green-600" : "text-[#4a6359]"}>
              {profileData.walletAddress ? '✓ Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Connection Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#d4a960]">
        <h3 className="text-xl font-bold text-[#4a6359] mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#a56b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Wallet Connection (Required for NFT Claims)
        </h3>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> You need to connect your wallet address to claim NFTs from campaigns.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a6359] mb-2">
            Wallet Address (U2U Network)
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={profileData.walletAddress}
                onChange={(e) => setProfileData({ ...profileData, walletAddress: e.target.value })}
                className="w-full px-4 py-2 border-2 border-[#d4a960] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a56b8a] bg-white font-mono text-sm"
                placeholder="0x..."
              />
              <p className="mt-2 text-xs text-gray-600">
                Enter your U2U wallet address. This is where your NFTs will be sent.
              </p>
            </div>
          ) : (
            <div>
              {profileData.walletAddress ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <span className="font-mono text-sm text-gray-700">{profileData.walletAddress}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600">✗</span>
                  <span className="text-sm text-red-700">No wallet connected. Click "Edit Profile" to add your wallet address.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
