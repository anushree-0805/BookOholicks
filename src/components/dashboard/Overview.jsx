import { Book, Award, TrendingUp, Flame } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useReadingStreak } from '../../hooks/useReadingStreak';
import { useNFTs } from '../../hooks/useNFTs';

const Overview = () => {
  const { profile } = useUserProfile();
  const { streakData } = useReadingStreak();
  const { nfts } = useNFTs();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {streakData?.currentStreak || 0} days
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total NFTs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {nfts?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {streakData?.longestStreak || 0} days
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {streakData?.totalDays || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reading Goal</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.readingGoal || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Favorite Genre</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.interestedGenres?.[0] || 'None selected'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Available NFTs</span>
              <span className="text-sm font-medium text-gray-900">
                {nfts?.filter(nft => !nft.redeemed).length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Last Read</span>
              <span className="text-sm font-medium text-gray-900">
                {streakData?.lastReadDate
                  ? new Date(streakData.lastReadDate).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent NFTs</h3>
          {nfts && nfts.length > 0 ? (
            <div className="space-y-3">
              {nfts.slice(0, 4).map((nft) => (
                <div key={nft._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      nft.rarity === 'Common' ? 'bg-gray-100' :
                      nft.rarity === 'Rare' ? 'bg-blue-100' :
                      nft.rarity === 'Epic' ? 'bg-purple-100' :
                      nft.rarity === 'Legendary' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nft.name}</p>
                      <p className="text-xs text-gray-500">{nft.rarity}</p>
                    </div>
                  </div>
                  {nft.redeemed ? (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Redeemed
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Available
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No NFTs yet</p>
              <p className="text-xs text-gray-400 mt-1">Start reading to earn rewards</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
