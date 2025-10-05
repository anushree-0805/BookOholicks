// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BookoholicsNFT
 * @dev NFT contract for Bookoholics rewards system on U2U testnet
 * Features:
 * - Mint NFTs for various achievements (streaks, engagement, community participation)
 * - Store NFT metadata on-chain
 * - Track redemption status
 * - Support for different rarity levels
 * - Brand association for NFTs
 */
contract BookoholicsNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // NFT Categories
    enum Category {
        STREAK,
        GENRE,
        REWARD,
        EVENT,
        ACHIEVEMENT,
        COMMUNITY
    }

    // Rarity levels
    enum Rarity {
        COMMON,
        RARE,
        EPIC,
        LEGENDARY,
        MYTHIC
    }

    // Reward types
    enum RewardType {
        ACTIVE_POSTER,
        POPULAR_OPINION,
        EXPLORER,
        EVENT_PARTICIPANT,
        EVENT_ORGANIZER,
        STREAK_BRONZE,
        STREAK_SILVER,
        STREAK_GOLD,
        STREAK_PLATINUM
    }

    // NFT metadata structure
    struct NFTMetadata {
        string name;
        string description;
        Category category;
        Rarity rarity;
        RewardType rewardType;
        string brand;
        bool redeemed;
        uint256 dateEarned;
        uint256 redeemedAt;
        string[] benefits;
    }

    // Mapping from token ID to metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Mapping from user address to their token IDs
    mapping(address => uint256[]) public userTokens;

    // Mapping from reward type to user address to check if already earned
    mapping(RewardType => mapping(address => bool)) public hasEarnedReward;

    // Events
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        RewardType rewardType,
        Rarity rarity,
        string name
    );

    event NFTRedeemed(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 redeemedAt
    );

    constructor() ERC721("Bookoholics NFT", "BNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new NFT reward
     * @param to Address to mint the NFT to
     * @param name Name of the NFT
     * @param description Description of the NFT
     * @param category Category of the NFT
     * @param rarity Rarity level
     * @param rewardType Type of reward
     * @param brand Brand associated with the NFT
     * @param benefits Array of benefit descriptions
     * @param tokenURI Metadata URI (can be empty for on-chain metadata)
     */
    function mintNFT(
        address to,
        string memory name,
        string memory description,
        Category category,
        Rarity rarity,
        RewardType rewardType,
        string memory brand,
        string[] memory benefits,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        // Check if user already has this reward type
        require(
            !hasEarnedReward[rewardType][to],
            "User already earned this reward"
        );

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(newTokenId, tokenURI);
        }

        // Store metadata
        nftMetadata[newTokenId] = NFTMetadata({
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            rewardType: rewardType,
            brand: brand,
            redeemed: false,
            dateEarned: block.timestamp,
            redeemedAt: 0,
            benefits: benefits
        });

        // Track user's tokens
        userTokens[to].push(newTokenId);

        // Mark reward as earned
        hasEarnedReward[rewardType][to] = true;

        emit NFTMinted(to, newTokenId, rewardType, rarity, name);

        return newTokenId;
    }

    /**
     * @dev Redeem an NFT's benefits
     * @param tokenId Token ID to redeem
     */
    function redeemNFT(uint256 tokenId) public {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(!nftMetadata[tokenId].redeemed, "NFT already redeemed");

        nftMetadata[tokenId].redeemed = true;
        nftMetadata[tokenId].redeemedAt = block.timestamp;

        emit NFTRedeemed(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Get all token IDs owned by a user
     * @param owner Address of the owner
     */
    function getTokensByOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return userTokens[owner];
    }

    /**
     * @dev Get NFT metadata
     * @param tokenId Token ID
     */
    function getMetadata(uint256 tokenId)
        public
        view
        returns (NFTMetadata memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get benefits for an NFT
     * @param tokenId Token ID
     */
    function getBenefits(uint256 tokenId)
        public
        view
        returns (string[] memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId].benefits;
    }

    /**
     * @dev Check if user has earned a specific reward type
     * @param rewardType Type of reward
     * @param user User address
     */
    function hasReward(RewardType rewardType, address user)
        public
        view
        returns (bool)
    {
        return hasEarnedReward[rewardType][user];
    }

    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Get unredeemed NFTs for a user
     * @param owner Address of the owner
     */
    function getUnredeemedTokens(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory allTokens = userTokens[owner];
        uint256 unredeemedCount = 0;

        // Count unredeemed tokens
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unredeemedCount++;
            }
        }

        // Create array of unredeemed tokens
        uint256[] memory unredeemedTokens = new uint256[](unredeemedCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allTokens.length; i++) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unredeemedTokens[index] = allTokens[i];
                index++;
            }
        }

        return unredeemedTokens;
    }

    /**
     * @dev Override transfer to update userTokens mapping
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);

        // Remove from old owner's tokens
        if (from != address(0)) {
            uint256[] storage fromTokens = userTokens[from];
            for (uint256 i = 0; i < fromTokens.length; i++) {
                if (fromTokens[i] == tokenId) {
                    fromTokens[i] = fromTokens[fromTokens.length - 1];
                    fromTokens.pop();
                    break;
                }
            }
        }

        // Add to new owner's tokens
        if (to != address(0)) {
            userTokens[to].push(tokenId);
        }

        return previousOwner;
    }

    /**
     * @dev Mint NFT to brand's escrow wallet (for phygital campaigns)
     * No duplicate reward check for phygital NFTs
     * @param escrowWallet Brand's escrow wallet
     * @param name Name of the NFT
     * @param description Description
     * @param category Category
     * @param rarity Rarity level
     * @param brand Brand name
     * @param benefits Benefits array
     * @param tokenURI Token URI
     */
    function mintToEscrow(
        address escrowWallet,
        string memory name,
        string memory description,
        Category category,
        Rarity rarity,
        string memory brand,
        string[] memory benefits,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(escrowWallet, newTokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(newTokenId, tokenURI);
        }

        // Store metadata - use REWARD type for phygital
        nftMetadata[newTokenId] = NFTMetadata({
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            rewardType: RewardType.ACTIVE_POSTER, // Default for phygital
            brand: brand,
            redeemed: false,
            dateEarned: block.timestamp,
            redeemedAt: 0,
            benefits: benefits
        });

        userTokens[escrowWallet].push(newTokenId);

        emit NFTMinted(escrowWallet, newTokenId, RewardType.ACTIVE_POSTER, rarity, name);

        return newTokenId;
    }

    /**
     * @dev Batch pre-mint NFTs to escrow wallet for campaigns
     * @param escrowWallet Brand's escrow wallet
     * @param quantity Number of NFTs to mint
     * @param name NFT name
     * @param description NFT description
     * @param category Category
     * @param rarity Rarity
     * @param brand Brand name
     * @param benefits Benefits
     * @param tokenURI Token URI
     */
    function batchMintToEscrow(
        address escrowWallet,
        uint256 quantity,
        string memory name,
        string memory description,
        Category category,
        Rarity rarity,
        string memory brand,
        string[] memory benefits,
        string memory tokenURI
    ) public onlyOwner returns (uint256[] memory) {
        require(quantity > 0 && quantity <= 1000, "Invalid quantity");

        uint256[] memory tokenIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = mintToEscrow(
                escrowWallet,
                name,
                description,
                category,
                rarity,
                brand,
                benefits,
                tokenURI
            );
        }

        return tokenIds;
    }

    /**
     * @dev Transfer NFT from escrow to user (for campaign claims)
     * @param from Escrow wallet address
     * @param to User wallet address
     * @param tokenId Token ID to transfer
     */
    function transferFromEscrow(
        address from,
        address to,
        uint256 tokenId
    ) public onlyOwner {
        require(_ownerOf(tokenId) == from, "Token not owned by escrow");
        require(to != address(0), "Invalid recipient");

        _transfer(from, to, tokenId);
    }

    /**
     * @dev Batch transfer NFTs from escrow to users
     * @param from Escrow wallet
     * @param recipients Array of recipient addresses
     * @param tokenIds Array of token IDs
     */
    function batchTransferFromEscrow(
        address from,
        address[] memory recipients,
        uint256[] memory tokenIds
    ) public onlyOwner {
        require(recipients.length == tokenIds.length, "Array length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            transferFromEscrow(from, recipients[i], tokenIds[i]);
        }
    }

    /**
     * @dev Batch mint NFTs for multiple users (achievement-based)
     * @param recipients Array of recipient addresses
     * @param names Array of NFT names
     * @param descriptions Array of descriptions
     * @param categories Array of categories
     * @param rarities Array of rarities
     * @param rewardTypes Array of reward types
     * @param brand Brand name (same for all)
     * @param benefits Array of benefits (same for all)
     */
    function batchMintNFT(
        address[] memory recipients,
        string[] memory names,
        string[] memory descriptions,
        Category[] memory categories,
        Rarity[] memory rarities,
        RewardType[] memory rewardTypes,
        string memory brand,
        string[] memory benefits
    ) public onlyOwner {
        require(
            recipients.length == names.length &&
            names.length == descriptions.length &&
            descriptions.length == categories.length &&
            categories.length == rarities.length &&
            rarities.length == rewardTypes.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            if (!hasEarnedReward[rewardTypes[i]][recipients[i]]) {
                mintNFT(
                    recipients[i],
                    names[i],
                    descriptions[i],
                    categories[i],
                    rarities[i],
                    rewardTypes[i],
                    brand,
                    benefits,
                    ""
                );
            }
        }
    }
}
