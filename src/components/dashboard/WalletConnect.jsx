import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBlockchain } from '../../hooks/useBlockchain';
import api from '../../config/api';

const WalletConnect = () => {
  const { user } = useAuth();
  const { account, isConnected, isCorrectNetwork, connectWallet: connectBlockchainWallet, switchNetwork } = useBlockchain();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Update wallet address from blockchain hook
    if (isConnected && account) {
      setWalletAddress(account);
    }
  }, [isConnected, account]);

  useEffect(() => {
    // Check if wallet is already connected in database
    if (user) {
      fetchWalletStatus();
    }
  }, [user]);

  const fetchWalletStatus = async () => {
    try {
      const response = await api.get(`/users/${user.uid}`);
      if (response.data.walletAddress) {
        setWalletAddress(response.data.walletAddress);
      }
    } catch (err) {
      console.error('Error fetching wallet status:', err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Use blockchain hook to connect
      const result = await connectBlockchainWallet();

      if (!result.success) {
        throw new Error(result.error);
      }

      const address = result.account;

      // Save wallet address to backend
      const response = await api.post('/blockchain/connect-wallet', {
        walletAddress: address
      });

      setWalletAddress(address);

      if (response.data.nftsMinted > 0) {
        alert(`✅ Wallet connected! ${response.data.nftsMinted} NFTs minted on blockchain.`);
      } else {
        alert('✅ Wallet connected successfully!');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    // Note: MetaMask doesn't allow programmatic disconnect
    // User needs to disconnect from MetaMask extension
    setWalletAddress(null);
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4a6359] flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Wallet Connection
        </h3>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!walletAddress ? (
        <div className="text-center py-6">
          <div className="text-6xl mb-4">👛</div>
          <p className="text-[#6b7f75] mb-4">
            Connect your wallet to mint and manage your NFT rewards on the blockchain
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-[#a56b8a] to-[#8e5a75] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <p className="text-xs text-[#6b7f75] mt-4">
            Make sure you're on U2U Testnet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#f5f1e8] to-[#faf7f0] p-4 rounded-xl">
            <p className="text-xs text-[#6b7f75] mb-1">Connected Wallet</p>
            <p className="font-mono font-bold text-[#4a6359]">{shortenAddress(walletAddress)}</p>
          </div>

          {!isCorrectNetwork ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Wrong network. Please switch to U2U Testnet.</span>
                <button
                  onClick={switchNetwork}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Switch Network
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-[#6b7f75]">Connected to U2U Testnet</span>
            </div>
          )}

          <div className="bg-[#f5f1e8] p-4 rounded-xl">
            <h4 className="font-bold text-[#4a6359] mb-2">Benefits of Connecting</h4>
            <ul className="space-y-2 text-sm text-[#6b7f75]">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>NFTs minted on blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>True ownership of rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Transferable NFTs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#a56b8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verifiable on blockchain</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => window.open('https://testnet.u2uscan.xyz/address/' + walletAddress, '_blank')}
            className="w-full bg-[#4a6359] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d5248] transition-all"
          >
            View on U2U Explorer
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
