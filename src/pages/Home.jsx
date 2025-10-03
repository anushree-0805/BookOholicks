import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#faf7f0] to-[#f0ebe2]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#4a6359] mb-6 leading-tight">
              Transform Your Love for Reading
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a56b8a] to-[#d4a960]">
                Into Lasting Rewards
              </span>
            </h1>
            <p className="text-xl text-[#6b7f75] mb-8 max-w-3xl mx-auto">
              Join Bookoholics - where every page you read earns you phygital NFT rewards
              that never expire. Unlock exclusive books, author events, and special editions!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white px-8 py-4 rounded-xl text-lg font-medium hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {user ? '📖 Go to Dashboard' : '🚀 Get Started'}
              </button>
              <button className="bg-white text-[#4a6359] px-8 py-4 rounded-xl text-lg font-medium border-2 border-[#d4a960] hover:bg-[#f5f1e8] transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Floating Book Icons */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-3">📚</div>
              <p className="font-bold text-[#4a6359]">Read & Earn</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-3">🎨</div>
              <p className="font-bold text-[#4a6359]">Collect NFTs</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-3">🎁</div>
              <p className="font-bold text-[#4a6359]">Unlock Rewards</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-3">👥</div>
              <p className="font-bold text-[#4a6359]">Join Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#4a6359] mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-[#a56b8a] to-[#8e5a75] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-4">Read Your Favorite Books</h3>
              <p className="text-[#6b7f75]">
                Read physical books or on Kindle. Log your reading time and maintain your streak.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-[#d4a960] to-[#c99a50] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-4">Earn Phygital NFTs</h3>
              <p className="text-[#6b7f75]">
                Complete streaks, engage with community, and unlock exclusive NFT rewards.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-[#4a6359] to-[#3d5248] w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-4">Redeem Amazing Rewards</h3>
              <p className="text-[#6b7f75]">
                Use your NFTs for special events, signed copies, limited editions, and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-br from-[#f5f1e8] to-[#faf7f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#4a6359] mb-16">
            Why Bookoholics?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-3">Reading Streaks</h3>
              <p className="text-[#6b7f75]">
                Build consistent reading habits and get rewarded for your dedication.
                Track your progress and earn exclusive NFTs for milestone streaks.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-3">Never-Expiring Rewards</h3>
              <p className="text-[#6b7f75]">
                Unlike traditional loyalty programs, our NFT rewards never expire.
                Keep your benefits forever and use them whenever you want!
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-3">Exclusive Access</h3>
              <p className="text-[#6b7f75]">
                Get VIP access to author events, signed books, limited editions,
                and special pre-orders that aren't available to the general public.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-[#4a6359] mb-3">Vibrant Community</h3>
              <p className="text-[#6b7f75]">
                Connect with fellow book lovers, join discussions, share reviews,
                and build your digital identity in the book world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#a56b8a] to-[#8e5a75]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of readers who are already earning rewards for doing what they love.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-[#a56b8a] px-8 py-4 rounded-xl text-lg font-medium hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            {user ? '📖 Go to Dashboard' : '🚀 Sign Up Now - It\'s Free!'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
