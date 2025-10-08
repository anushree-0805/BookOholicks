// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BookoholicsNFT (Optimized for Gas)
 * @dev NFT contract for Bookoholics rewards system on U2U Mainnet
 */
contract BookoholicsNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

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
     */
    function mintNFT(
        address to,
        string calldata name,
        string calldata description,
        Category category,
        Rarity rarity,
        RewardType rewardType,
        string calldata brand,
        string[] calldata benefits,
        string calldata tokenURI
    ) external onlyOwner returns (uint256) {
        require(
            !hasEarnedReward[rewardType][to],
            "User already earned this reward"
        );

        unchecked {
            ++_tokenIds;
        }
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(newTokenId, tokenURI);
        }

        // Store metadata
        NFTMetadata storage metadata = nftMetadata[newTokenId];
        metadata.name = name;
        metadata.description = description;
        metadata.category = category;
        metadata.rarity = rarity;
        metadata.rewardType = rewardType;
        metadata.brand = brand;
        metadata.redeemed = false;
        metadata.dateEarned = block.timestamp;
        metadata.redeemedAt = 0;
        metadata.benefits = benefits;

        // Track user's tokens
        userTokens[to].push(newTokenId);

        // Mark reward as earned
        hasEarnedReward[rewardType][to] = true;

        emit NFTMinted(to, newTokenId, rewardType, rarity, name);

        return newTokenId;
    }

    /**
     * @dev Redeem an NFT's benefits
     */
    function redeemNFT(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(!nftMetadata[tokenId].redeemed, "NFT already redeemed");

        nftMetadata[tokenId].redeemed = true;
        nftMetadata[tokenId].redeemedAt = block.timestamp;

        emit NFTRedeemed(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Get all token IDs owned by a user
     */
    function getTokensByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return userTokens[owner];
    }

    /**
     * @dev Get NFT metadata
     */
    function getMetadata(uint256 tokenId)
        external
        view
        returns (NFTMetadata memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get benefits for an NFT
     */
    function getBenefits(uint256 tokenId)
        external
        view
        returns (string[] memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId].benefits;
    }

    /**
     * @dev Check if user has earned a specific reward type
     */
    function hasReward(RewardType rewardType, address user)
        external
        view
        returns (bool)
    {
        return hasEarnedReward[rewardType][user];
    }

    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Get unredeemed NFTs for a user
     */
    function getUnredeemedTokens(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory allTokens = userTokens[owner];
        uint256 unredeemedCount = 0;

        // Count unredeemed tokens
        uint256 length = allTokens.length;
        for (uint256 i = 0; i < length; ) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unchecked {
                    ++unredeemedCount;
                }
            }
            unchecked {
                ++i;
            }
        }

        // Create array of unredeemed tokens
        uint256[] memory unredeemedTokens = new uint256[](unredeemedCount);
        uint256 index = 0;

        for (uint256 i = 0; i < length; ) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unredeemedTokens[index] = allTokens[i];
                unchecked {
                    ++index;
                }
            }
            unchecked {
                ++i;
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
            uint256 length = fromTokens.length;
            for (uint256 i = 0; i < length; ) {
                if (fromTokens[i] == tokenId) {
                    fromTokens[i] = fromTokens[length - 1];
                    fromTokens.pop();
                    break;
                }
                unchecked {
                    ++i;
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
     */
    function mintToEscrow(
        address escrowWallet,
        string calldata name,
        string calldata description,
        Category category,
        Rarity rarity,
        string calldata brand,
        string[] calldata benefits,
        string calldata tokenURI
    ) external onlyOwner returns (uint256) {
        unchecked {
            ++_tokenIds;
        }
        uint256 newTokenId = _tokenIds;

        _safeMint(escrowWallet, newTokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(newTokenId, tokenURI);
        }

        // Store metadata
        NFTMetadata storage metadata = nftMetadata[newTokenId];
        metadata.name = name;
        metadata.description = description;
        metadata.category = category;
        metadata.rarity = rarity;
        metadata.rewardType = RewardType.ACTIVE_POSTER;
        metadata.brand = brand;
        metadata.redeemed = false;
        metadata.dateEarned = block.timestamp;
        metadata.redeemedAt = 0;
        metadata.benefits = benefits;

        userTokens[escrowWallet].push(newTokenId);

        emit NFTMinted(escrowWallet, newTokenId, RewardType.ACTIVE_POSTER, rarity, name);

        return newTokenId;
    }

    /**
     * @dev Batch pre-mint NFTs to escrow wallet
     */
    function batchMintToEscrow(
        address escrowWallet,
        uint256 quantity,
        string calldata name,
        string calldata description,
        Category category,
        Rarity rarity,
        string calldata brand,
        string[] calldata benefits,
        string calldata tokenURI
    ) external onlyOwner returns (uint256[] memory) {
        require(quantity > 0 && quantity <= 100, "Invalid quantity"); // Reduced max to 100 for gas

        uint256[] memory tokenIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; ) {
            tokenIds[i] = this.mintToEscrow(
                escrowWallet,
                name,
                description,
                category,
                rarity,
                brand,
                benefits,
                tokenURI
            );
            unchecked {
                ++i;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Transfer NFT from escrow to user
     */
    function transferFromEscrow(
        address from,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        require(_ownerOf(tokenId) == from, "Token not owned by escrow");
        require(to != address(0), "Invalid recipient");

        _transfer(from, to, tokenId);
    }

    /**
     * @dev Batch transfer NFTs from escrow
     */
    function batchTransferFromEscrow(
        address from,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        require(recipients.length == tokenIds.length, "Array length mismatch");

        uint256 length = recipients.length;
        for (uint256 i = 0; i < length; ) {
            this.transferFromEscrow(from, recipients[i], tokenIds[i]);
            unchecked {
                ++i;
            }
        }
    }
}
