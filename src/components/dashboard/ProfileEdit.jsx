import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProfileEdit = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Book Enthusiast',
    bio: 'Passionate reader exploring worlds through pages 📚',
    profilePic: null,
    interestedGenres: ['Fiction', 'Mystery', 'Science Fiction'],
    location: 'New York, USA',
    favoriteAuthor: 'J.K. Rowling',
    readingGoal: '50 books/year'
  });
  const [previewImage, setPreviewImage] = useState(null);

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

  const handleSave = () => {
    // TODO: Save to database/Firebase
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
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
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isEditing
                ? 'bg-[#4a6359] text-white hover:bg-[#3d5248]'
                : 'bg-[#a56b8a] text-white hover:bg-[#8e5a75]'
            }`}
          >
            {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
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
            <span className="text-[#4a6359]">Not Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
