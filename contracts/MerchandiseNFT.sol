// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerchandiseNFT
 * @dev NFT Certificate for F1 merchandise authentication
 * Each product gets a unique NFT with metadata including authenticity score
 */
contract MerchandiseNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from token ID to product details
    struct ProductCertificate {
        string productId;
        uint256 authenticityScore; // Score from 0-100
        uint256 mintedAt;
        string qrCode;
        bool isRecalled;
    }

    mapping(uint256 => ProductCertificate) public certificates;
    mapping(string => uint256) public productToTokenId;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        string productId,
        address owner,
        uint256 authenticityScore
    );
    event ProductRecalled(uint256 indexed tokenId, string productId);
    event AuthenticityVerified(uint256 indexed tokenId, uint256 score);

    constructor() ERC721("F1 Merchandise Certificate", "F1CERT") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs at 1
    }

    /**
     * @dev Mint a new NFT certificate for a product
     * @param to Address to mint the NFT to
     * @param productId Unique product identifier
     * @param uri Metadata URI (IPFS link)
     * @param authenticityScore AI-generated authenticity score (0-100)
     * @param qrCode QR code data for the product
     */
    function mintCertificate(
        address to,
        string memory productId,
        string memory uri,
        uint256 authenticityScore,
        string memory qrCode
    ) public onlyOwner returns (uint256) {
        require(authenticityScore <= 100, "Score must be between 0-100");
        require(productToTokenId[productId] == 0, "Product already has certificate");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Store certificate details
        certificates[tokenId] = ProductCertificate({
            productId: productId,
            authenticityScore: authenticityScore,
            mintedAt: block.timestamp,
            qrCode: qrCode,
            isRecalled: false
        });
        
        productToTokenId[productId] = tokenId;
        
        emit CertificateMinted(tokenId, productId, to, authenticityScore);
        
        return tokenId;
    }

    /**
     * @dev Batch mint certificates for multiple products
     */
    function batchMintCertificates(
        address[] memory recipients,
        string[] memory productIds,
        string[] memory uris,
        uint256[] memory scores,
        string[] memory qrCodes
    ) external onlyOwner {
        require(
            recipients.length == productIds.length &&
            productIds.length == uris.length &&
            uris.length == scores.length &&
            scores.length == qrCodes.length,
            "Arrays must have same length"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintCertificate(
                recipients[i],
                productIds[i],
                uris[i],
                scores[i],
                qrCodes[i]
            );
        }
    }

    /**
     * @dev Recall a product by marking its certificate
     */
    function recallProduct(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        certificates[tokenId].isRecalled = true;
        emit ProductRecalled(tokenId, certificates[tokenId].productId);
    }

    /**
     * @dev Update authenticity score after re-verification
     */
    function updateAuthenticityScore(uint256 tokenId, uint256 newScore) 
        external 
        onlyOwner 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newScore <= 100, "Score must be between 0-100");
        
        certificates[tokenId].authenticityScore = newScore;
        emit AuthenticityVerified(tokenId, newScore);
    }

    /**
     * @dev Get certificate details for a product
     */
    function getCertificate(string memory productId) 
        external 
        view 
        returns (ProductCertificate memory) 
    {
        uint256 tokenId = productToTokenId[productId];
        require(tokenId != 0, "Product has no certificate");
        return certificates[tokenId];
    }

    /**
     * @dev Verify product authenticity
     */
    function verifyProduct(uint256 tokenId) 
        external 
        view 
        returns (
            bool isAuthentic,
            uint256 score,
            bool isRecalled,
            address owner
        ) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        ProductCertificate memory cert = certificates[tokenId];
        isAuthentic = cert.authenticityScore >= 70; // 70% threshold
        score = cert.authenticityScore;
        isRecalled = cert.isRecalled;
        owner = ownerOf(tokenId);
    }

    /**
     * @dev Get total supply of certificates
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // Override functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Override _update instead of _burn for OpenZeppelin v5
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        
        // If burning (to == address(0)), clean up mappings
        if (to == address(0) && from != address(0)) {
            string memory productId = certificates[tokenId].productId;
            delete productToTokenId[productId];
            delete certificates[tokenId];
        }
        
        return super._update(to, tokenId, auth);
    }
}
