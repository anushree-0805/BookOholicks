import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('reader'); // 'reader' or 'brand'
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { user, userProfile, signUp, signIn, logOut } = useAuth();
  const navigate = useNavigate();

  // MetaMask wallet connection
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask to use this feature');
    }
  };

  // Handle authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!isSignIn && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = isSignIn
      ? await signIn(email, password)
      : await signUp(email, password, accountType);

    if (result.error) {
      setError(result.error);
    } else {
      setIsAuthModalOpen(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAccountType('reader');

      // Redirect based on account type
      if (result.accountType === 'brand') {
        navigate('/brand-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logOut();
    setShowProfileMenu(false);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  return (
    <>
      <nav className="bg-[#f9fff1] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0">
              <img src={logo} alt="Logo" width={100} height={100} />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              
              {user && (
                <>
                <a
                href="/"
                className="text-[#4a6359] hover:text-[#427898] px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </a>
                  <a
                    href={userProfile?.accountType === 'brand' ? '/brand-dashboard' : '/dashboard'}
                    className="text-[#4a6359] hover:text-[#995a90] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </a>

                  <a
                    href="/campaigns"
                    className="text-[#4a6359] hover:text-[#995a90] px-3 py-2 text-sm font-medium transition-colors relative"
                  >
                     Campaigns
                    
                  </a>
                  <a
                    href="/feed"
                    className="text-[#4a6359] hover:text-[#995a90] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Feed
                  </a>
                  <a
                    href="/communities"
                    className="text-[#4a6359] hover:text-[#995a90] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Communities
                  </a>
                </>
              )}
            </div>

            {/* Auth and Wallet Buttons */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet Button */}
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="bg-[#427898] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#995a90] transition-all"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="bg-[#427898]  px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#995a90] transition-all flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9"
                      />
                    </svg>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left px-4 py-2 text-sm text-[#4a6359] hover:bg-gray-100 transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sign In/Sign Up Button or Profile */}
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#427898] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#995a90] transition-all"
                >
                  Sign In / Sign Up
                </button>
              ) : (
                <div className="relative">
              <button
  onClick={() => setShowProfileMenu(!showProfileMenu)}
 className="relative w-10 h-10 rounded-full overflow-hidden border border-white bg-[#427898] hover:bg-[#995a90] transition-all flex items-center justify-center"

>
  <img
    src="src/assets/user.png"
   
    className="absolute inset-0 w-full h-full object-cover"
  />
</button>



                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 text-sm text-[#4a6359] border-b">
                        {user.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[#4a6359] hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-[#427898] ">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0   flex items-center justify-center z-50 ">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#427898]">
                {isSignIn ? 'Sign In' : 'Sign Up'}
              </h2>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setError('');
                }}
                className="text-[#427898] hover:text-[#4a6359]"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#427898] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-[#427898] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#427898]"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#427898] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-[#427898] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#427898]"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isSignIn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#427898] mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-[#427898] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#427898]"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#427898] mb-2">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAccountType('reader')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          accountType === 'reader'
                            ? 'border-[#4a6359] bg-[#427898] bg-opacity-10'
                            : 'border-gray-300 hover:border-[#427898]'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">📚</div>
                          <div className="font-medium text-sm">Reader</div>
                          <div className="text-xs text-white mt-1">
                            Track reading & earn NFTs
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('brand')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          accountType === 'brand'
                            ? 'border-[#427898] bg-[#427898] bg-opacity-10'
                            : 'border-gray-300 hover:border-[#427898]'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏢</div>
                          <div className="font-medium text-sm">Brand</div>
                          <div className="text-xs text-white mt-1">
                            Create NFT campaigns
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#427898] text-white py-2 rounded-lg font-medium hover:bg-[#427898] transition-all"
              >
                {isSignIn ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setError('');
                }}
                className="text-sm text-[#427898] "
              >
                {isSignIn
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
