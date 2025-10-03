import { useState } from 'react';
import { Flame, Calendar, Award, BookOpen, X, TrendingUp } from 'lucide-react';
import { useReadingStreak } from '../../hooks/useReadingStreak';

const ReadingStreak = () => {
  const { streakData, readingSessions, logReadingSession } = useReadingStreak();
  const [showLogModal, setShowLogModal] = useState(false);
  const [readingLog, setReadingLog] = useState({
    minutes: '',
    pages: '',
    bookTitle: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const streakRewards = [
    { days: 7, name: '7-Day Reading Streak', rarity: 'Common' },
    { days: 10, name: '10-Day Reading Streak', rarity: 'Rare' },
    { days: 15, name: '15-Day Reading Streak', rarity: 'Epic' },
    { days: 30, name: '30-Day Reading Streak', rarity: 'Legendary' },
    { days: 50, name: '50-Day Reading Streak', rarity: 'Mythic' }
  ];

  const handleLogReading = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await logReadingSession(readingLog);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setShowLogModal(false);
      setReadingLog({ minutes: '', pages: '', bookTitle: '', notes: '' });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Streak</span>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {streakData?.currentStreak || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Longest Streak</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {streakData?.longestStreak || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Days</span>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {streakData?.totalDays || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">all time</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Last Read</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {streakData?.lastReadDate
                ? new Date(streakData.lastReadDate).toLocaleDateString()
                : 'Never'}
            </p>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs text-[#4a6359] hover:text-[#3d5248] mt-2 font-medium"
            >
              Log session →
            </button>
          </div>
        </div>

        {/* Log Reading Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowLogModal(true)}
            className="bg-[#4a6359] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3d5248] transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Log Reading Session
          </button>
        </div>

        {/* Streak Rewards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Streak Rewards & Milestones
          </h3>
          <div className="space-y-3">
            {streakRewards.map((reward) => {
              const isAchieved = (streakData?.currentStreak || 0) >= reward.days;
              const daysRemaining = reward.days - (streakData?.currentStreak || 0);

              return (
                <div
                  key={reward.days}
                  className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                    isAchieved
                      ? 'border-[#4a6359] bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      reward.rarity === 'Common' ? 'bg-gray-100' :
                      reward.rarity === 'Rare' ? 'bg-blue-100' :
                      reward.rarity === 'Epic' ? 'bg-purple-100' :
                      reward.rarity === 'Legendary' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{reward.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          reward.rarity === 'Common' ? 'bg-gray-200 text-gray-700' :
                          reward.rarity === 'Rare' ? 'bg-blue-200 text-blue-700' :
                          reward.rarity === 'Epic' ? 'bg-purple-200 text-purple-700' :
                          reward.rarity === 'Legendary' ? 'bg-yellow-200 text-yellow-700' :
                          'bg-red-200 text-red-700'
                        }`}>
                          {reward.rarity}
                        </span>
                        <span className="text-sm text-gray-600">{reward.days} days required</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isAchieved ? (
                      <button className="bg-[#4a6359] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3d5248] transition-colors">
                        Claim NFT
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 font-medium">
                        {daysRemaining} days to go
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reading Sessions */}
        {readingSessions && readingSessions.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recent Reading Sessions
            </h3>
            <div className="space-y-3">
              {readingSessions.slice(0, 5).map((session) => (
                <div key={session._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{session.bookTitle}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{session.minutesRead} min</p>
                    <p className="text-xs text-gray-500">{session.pagesRead} pages</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Reading Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Log Reading Session
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title
                </label>
                <input
                  type="text"
                  value={readingLog.bookTitle}
                  onChange={(e) => setReadingLog({ ...readingLog, bookTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6359]"
                  placeholder="What are you reading?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minutes Read
                  </label>
                  <input
                    type="number"
                    value={readingLog.minutes}
                    onChange={(e) => setReadingLog({ ...readingLog, minutes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6359]"
                    placeholder="30"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pages Read
                  </label>
                  <input
                    type="number"
                    value={readingLog.pages}
                    onChange={(e) => setReadingLog({ ...readingLog, pages: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6359]"
                    placeholder="25"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={readingLog.notes}
                  onChange={(e) => setReadingLog({ ...readingLog, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a6359] resize-none"
                  rows="3"
                  placeholder="Any thoughts about your reading session?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4a6359] text-white py-3 rounded-lg font-medium hover:bg-[#3d5248] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging...' : 'Log Reading Session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadingStreak;
