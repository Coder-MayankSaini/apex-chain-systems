// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string productId;
        string authenticityHash;
        address manufacturer;
        address currentOwner;
        bool exists;
    }
    
    mapping(uint256 => Product) public products;
    uint256 public tokenCounter;
    
    event ProductRegistered(uint256 indexed tokenId, string productId, address owner);
    event ProductTransferred(uint256 indexed tokenId, address from, address to);
    
    function registerProduct(
        string memory _productId,
        string memory _authenticityHash
    ) public returns (uint256) {
        uint256 tokenId = tokenCounter;
        
        products[tokenId] = Product({
            productId: _productId,
            authenticityHash: _authenticityHash,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            exists: true
        });
        
        tokenCounter++;
        
        emit ProductRegistered(tokenId, _productId, msg.sender);
        
        return tokenId;
    }
    
    function transferProduct(uint256 _tokenId, address _to) public {
        require(products[_tokenId].exists, "Product does not exist");
        require(products[_tokenId].currentOwner == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid address");
        
        address from = products[_tokenId].currentOwner;
        products[_tokenId].currentOwner = _to;
        
        emit ProductTransferred(_tokenId, from, _to);
    }
    
    function verifyProduct(uint256 _tokenId) public view returns (
        bool exists,
        string memory productId,
        address currentOwner
    ) {
        Product memory product = products[_tokenId];
        return (product.exists, product.productId, product.currentOwner);
    }
    
    function getProductDetails(uint256 _tokenId) public view returns (
        string memory productId,
        string memory authenticityHash,
        address manufacturer,
        address currentOwner
    ) {
        require(products[_tokenId].exists, "Product does not exist");
        Product memory product = products[_tokenId];
        return (
            product.productId,
            product.authenticityHash,
            product.manufacturer,
            product.currentOwner
        );
    }
}
