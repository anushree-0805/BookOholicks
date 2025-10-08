// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BookoholicsNFT
 * @dev NFT contract for Bookoholics rewards - Optimized for deployment
 */
contract BookoholicsNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    enum Category { STREAK, GENRE, REWARD, EVENT, ACHIEVEMENT, COMMUNITY }
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY, MYTHIC }
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

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => string[]) public nftBenefits;
    mapping(address => uint256[]) public userTokens;
    mapping(RewardType => mapping(address => bool)) public hasEarnedReward;

    event NFTMinted(address indexed to, uint256 indexed tokenId, RewardType rewardType, Rarity rarity, string name);
    event NFTRedeemed(address indexed owner, uint256 indexed tokenId, uint256 redeemedAt);

    constructor() ERC721("Bookoholics NFT", "BNFT") Ownable(msg.sender) {}

    function mintNFT(MintParams calldata params, string[] calldata benefits)
        external onlyOwner returns (uint256)
    {
        require(!hasEarnedReward[params.rewardType][params.to], "Already earned");

        unchecked { ++_tokenIds; }
        uint256 newTokenId = _tokenIds;

        _safeMint(params.to, newTokenId);
        if (bytes(params.tokenURI).length > 0) {
            _setTokenURI(newTokenId, params.tokenURI);
        }

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

        nftBenefits[newTokenId] = benefits;
        userTokens[params.to].push(newTokenId);
        hasEarnedReward[params.rewardType][params.to] = true;

        emit NFTMinted(params.to, newTokenId, params.rewardType, params.rarity, params.name);
        return newTokenId;
    }

    function redeemNFT(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        require(!nftMetadata[tokenId].redeemed, "Already redeemed");

        nftMetadata[tokenId].redeemed = true;
        nftMetadata[tokenId].redeemedAt = block.timestamp;

        emit NFTRedeemed(msg.sender, tokenId, block.timestamp);
    }

    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return userTokens[owner];
    }

    function getMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Not exist");
        return nftMetadata[tokenId];
    }

    function getBenefits(uint256 tokenId) external view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "Not exist");
        return nftBenefits[tokenId];
    }

    function hasReward(RewardType rewardType, address user) external view returns (bool) {
        return hasEarnedReward[rewardType][user];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    function getUnredeemedTokens(address owner) external view returns (uint256[] memory) {
        uint256[] memory allTokens = userTokens[owner];
        uint256 unredeemedCount;
        uint256 length = allTokens.length;

        for (uint256 i; i < length;) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unchecked { ++unredeemedCount; }
            }
            unchecked { ++i; }
        }

        uint256[] memory unredeemed = new uint256[](unredeemedCount);
        uint256 index;

        for (uint256 i; i < length;) {
            if (!nftMetadata[allTokens[i]].redeemed) {
                unredeemed[index] = allTokens[i];
                unchecked { ++index; }
            }
            unchecked { ++i; }
        }

        return unredeemed;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal virtual override returns (address)
    {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);

        if (from != address(0)) {
            _removeToken(from, tokenId);
        }
        if (to != address(0)) {
            userTokens[to].push(tokenId);
        }

        return previousOwner;
    }

    function _removeToken(address owner, uint256 tokenId) private {
        uint256[] storage tokens = userTokens[owner];
        uint256 length = tokens.length;

        for (uint256 i; i < length;) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[length - 1];
                tokens.pop();
                break;
            }
            unchecked { ++i; }
        }
    }

    function mintToEscrow(
        address wallet,
        string calldata name,
        string calldata desc,
        Category cat,
        Rarity rare,
        string calldata brand,
        string[] calldata benefits,
        string calldata uri
    ) public onlyOwner returns (uint256) {
        unchecked { ++_tokenIds; }
        uint256 id = _tokenIds;

        _safeMint(wallet, id);
        if (bytes(uri).length > 0) _setTokenURI(id, uri);

        nftMetadata[id] = NFTMetadata({
            name: name,
            description: desc,
            category: cat,
            rarity: rare,
            rewardType: RewardType.ACTIVE_POSTER,
            brand: brand,
            redeemed: false,
            dateEarned: block.timestamp,
            redeemedAt: 0
        });

        nftBenefits[id] = benefits;
        userTokens[wallet].push(id);

        emit NFTMinted(wallet, id, RewardType.ACTIVE_POSTER, rare, name);
        return id;
    }

    function batchMintToEscrow(
        address wallet,
        uint256 qty,
        string calldata name,
        string calldata desc,
        Category cat,
        Rarity rare,
        string calldata brand,
        string[] calldata benefits,
        string calldata uri
    ) external onlyOwner returns (uint256[] memory) {
        require(qty > 0 && qty <= 50, "Invalid qty");

        uint256[] memory ids = new uint256[](qty);

        for (uint256 i; i < qty;) {
            ids[i] = mintToEscrow(wallet, name, desc, cat, rare, brand, benefits, uri);
            unchecked { ++i; }
        }

        return ids;
    }

    function transferFromEscrow(address from, address to, uint256 tokenId)
        external onlyOwner
    {
        require(_ownerOf(tokenId) == from, "Not escrow");
        require(to != address(0), "Invalid to");
        _transfer(from, to, tokenId);
    }

    function batchTransferFromEscrow(
        address from,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        require(recipients.length == tokenIds.length, "Length mismatch");

        uint256 length = recipients.length;
        for (uint256 i; i < length;) {
            require(_ownerOf(tokenIds[i]) == from, "Not escrow");
            require(recipients[i] != address(0), "Invalid to");
            _transfer(from, recipients[i], tokenIds[i]);
            unchecked { ++i; }
        }
    }
}
