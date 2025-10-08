// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BookoholicsNFT
 * @dev NFT contract for Bookoholics rewards system on U2U Mainnet
 * Fixed for stack too deep errors
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
    }

    // Mint parameters to avoid stack too deep
    struct MintParams {
        address to;
        string name;
        string description;
        Category category;
        Rarity rarity;
        RewardType rewardType;
        string brand;
        string tokenURI;
    }

    // Mapping from token ID to metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Mapping from token ID to benefits (separate to reduce struct size)
    mapping(uint256 => string[]) public nftBenefits;

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
     * @dev Mint a new NFT reward with parameters struct
     */
    function mintNFT(
        MintParams calldata params,
        string[] calldata benefits
    ) external onlyOwner returns (uint256) {
        require(
            !hasEarnedReward[params.rewardType][params.to],
            "User already earned this reward"
        );

        unchecked {
            ++_tokenIds;
        }
        uint256 newTokenId = _tokenIds;

        _safeMint(params.to, newTokenId);

        if (bytes(params.tokenURI).length > 0) {
            _setTokenURI(newTokenId, params.tokenURI);
        }

        // Store metadata
        nftMetadata[newTokenId] = NFTMetadata({
            name: params.name,
            description: params.description,
            category: params.category,
            rarity: params.rarity,
            rewardType: params.rewardType,
            brand: params.brand,
            redeemed: false,
            dateEarned: block.timestamp,
            redeemedAt: 0
        });

        // Store benefits separately
        nftBenefits[newTokenId] = benefits;

        // Track user's tokens
        userTokens[params.to].push(newTokenId);

        // Mark reward as earned
        hasEarnedReward[params.rewardType][params.to] = true;

        emit NFTMinted(params.to, newTokenId, params.rewardType, params.rarity, params.name);

        return newTokenId;
    }

    /**
     * @dev Redeem an NFT's benefits
     */
    function redeemNFT(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!nftMetadata[tokenId].redeemed, "Already redeemed");

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
        return nftBenefits[tokenId];
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
        uint256 unredeemedCount;

        uint256 length = allTokens.length;
        for (uint256 i; i < length; ) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unchecked {
                    ++unredeemedCount;
                }
            }
            unchecked {
                ++i;
            }
        }

        uint256[] memory unredeemedTokens = new uint256[](unredeemedCount);
        uint256 index;

        for (uint256 i; i < length; ) {
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

        if (from != address(0)) {
            _removeTokenFromOwner(from, tokenId);
        }

        if (to != address(0)) {
            userTokens[to].push(tokenId);
        }

        return previousOwner;
    }

    /**
     * @dev Internal function to remove token from owner
     */
    function _removeTokenFromOwner(address owner, uint256 tokenId) private {
        uint256[] storage tokens = userTokens[owner];
        uint256 length = tokens.length;

        for (uint256 i; i < length; ) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[length - 1];
                tokens.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Mint NFT to escrow wallet (for campaigns)
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

        nftMetadata[newTokenId] = NFTMetadata({
            name: name,
            description: description,
            category: category,
            rarity: rarity,
            rewardType: RewardType.ACTIVE_POSTER,
            brand: brand,
            redeemed: false,
            dateEarned: block.timestamp,
            redeemedAt: 0
        });

        nftBenefits[newTokenId] = benefits;
        userTokens[escrowWallet].push(newTokenId);

        emit NFTMinted(escrowWallet, newTokenId, RewardType.ACTIVE_POSTER, rarity, name);

        return newTokenId;
    }

    /**
     * @dev Batch mint to escrow
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
        require(quantity > 0 && quantity <= 100, "Invalid quantity");

        uint256[] memory tokenIds = new uint256[](quantity);

        for (uint256 i; i < quantity; ) {
            unchecked {
                ++_tokenIds;
            }
            uint256 newTokenId = _tokenIds;

            _safeMint(escrowWallet, newTokenId);

            if (bytes(tokenURI).length > 0) {
                _setTokenURI(newTokenId, tokenURI);
            }

            nftMetadata[newTokenId] = NFTMetadata({
                name: name,
                description: description,
                category: category,
                rarity: rarity,
                rewardType: RewardType.ACTIVE_POSTER,
                brand: brand,
                redeemed: false,
                dateEarned: block.timestamp,
                redeemedAt: 0
            });

            nftBenefits[newTokenId] = benefits;
            userTokens[escrowWallet].push(newTokenId);
            tokenIds[i] = newTokenId;

            emit NFTMinted(escrowWallet, newTokenId, RewardType.ACTIVE_POSTER, rarity, name);

            unchecked {
                ++i;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Transfer from escrow to user
     */
    function transferFromEscrow(
        address from,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        require(_ownerOf(tokenId) == from, "Not owned by escrow");
        require(to != address(0), "Invalid recipient");

        _transfer(from, to, tokenId);
    }

    /**
     * @dev Batch transfer from escrow
     */
    function batchTransferFromEscrow(
        address from,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        require(recipients.length == tokenIds.length, "Length mismatch");

        uint256 length = recipients.length;
        for (uint256 i; i < length; ) {
            require(_ownerOf(tokenIds[i]) == from, "Not owned by escrow");
            require(recipients[i] != address(0), "Invalid recipient");

            _transfer(from, recipients[i], tokenIds[i]);

            unchecked {
                ++i;
            }
        }
    }
}
