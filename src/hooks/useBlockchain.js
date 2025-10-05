import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG, NFT_CONTRACT_ABI, CATEGORY, RARITY, REWARD_TYPE, NFT_EMOJIS } from '../config/blockchain';

export const useBlockchain = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      initializeProvider();
      setupEventListeners();
    }
  }, []);

  const initializeProvider = async () => {
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error('Error initializing provider:', error);
    }
  };

  const setupEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount(null);
      setSigner(null);
      setContract(null);
    } else {
      setAccount(accounts[0]);
      await updateSignerAndContract();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const updateSignerAndContract = async () => {
    try {
      if (!provider) return;

      const web3Signer = await provider.getSigner();
      setSigner(web3Signer);

      const nftContract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.contractAddress,
        NFT_CONTRACT_ABI,
        web3Signer
      );
      setContract(nftContract);

      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === BLOCKCHAIN_CONFIG.chainId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error updating signer and contract:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature');
      return { success: false, error: 'MetaMask not installed' };
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      await handleAccountsChanged(accounts);

      // Check network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== BLOCKCHAIN_CONFIG.chainIdHex) {
        await switchNetwork();
      }

      return { success: true, account: accounts[0] };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BLOCKCHAIN_CONFIG.chainIdHex }]
      });
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BLOCKCHAIN_CONFIG.chainIdHex,
              chainName: BLOCKCHAIN_CONFIG.networkName,
              nativeCurrency: BLOCKCHAIN_CONFIG.nativeCurrency,
              rpcUrls: [BLOCKCHAIN_CONFIG.rpcUrl],
              blockExplorerUrls: [BLOCKCHAIN_CONFIG.explorerUrl]
            }]
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const getUserNFTs = async (address = account) => {
    if (!contract || !address) {
      return { success: false, error: 'Contract not initialized or no address' };
    }

    try {
      const tokenIds = await contract.getTokensByOwner(address);
      const nfts = [];

      for (const tokenId of tokenIds) {
        const metadata = await contract.getMetadata(tokenId);

        nfts.push({
          tokenId: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          category: CATEGORY[metadata.category],
          rarity: RARITY[metadata.rarity],
          rewardType: REWARD_TYPE[metadata.rewardType],
          image: NFT_EMOJIS[REWARD_TYPE[metadata.rewardType]] || '🎁',
          brand: metadata.brand,
          redeemed: metadata.redeemed,
          dateEarned: new Date(Number(metadata.dateEarned) * 1000).toISOString().split('T')[0],
          redeemedAt: metadata.redeemed ? new Date(Number(metadata.redeemedAt) * 1000).toISOString().split('T')[0] : null,
          benefits: metadata.benefits,
          onChain: true
        });
      }

      return { success: true, nfts };
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return { success: false, error: error.message };
    }
  };

  const redeemNFT = async (tokenId) => {
    if (!contract) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const tx = await contract.redeemNFT(tokenId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error redeeming NFT:', error);
      return { success: false, error: error.message };
    }
  };

  const getContractStats = async () => {
    if (!contract) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const totalSupply = await contract.totalSupply();

      return {
        success: true,
        stats: {
          totalNFTsMinted: totalSupply.toString(),
          contractAddress: BLOCKCHAIN_CONFIG.contractAddress
        }
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    provider,
    signer,
    contract,
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    switchNetwork,
    getUserNFTs,
    redeemNFT,
    getContractStats
  };
};
