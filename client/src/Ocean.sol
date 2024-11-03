// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Ocean {
    struct DataAsset {
        address owner;
        string metadataCID;
        string dataCID;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => DataAsset) public dataAssets;
    uint256 public assetCount;

    // Ocean token contract address
    ERC20 public oceanToken;

    event AssetPublished(
        uint256 indexed assetId,
        address indexed owner,
        string metadataCID,
        uint256 price
    );

    event AssetPurchased(
        uint256 indexed assetId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    constructor(address _oceanTokenAddress) {
        oceanToken = ERC20(_oceanTokenAddress);
    }

    function publishDataAsset(
        string memory _metadataCID,
        string memory _dataCID,
        uint256 _price
    ) external returns (uint256) {
        require(bytes(_metadataCID).length > 0, "Invalid metadata CID");
        require(bytes(_dataCID).length > 0, "Invalid data CID");
        require(_price > 0, "Price must be greater than 0");

        uint256 assetId = assetCount++;

        dataAssets[assetId] = DataAsset({
            owner: msg.sender,
            metadataCID: _metadataCID,
            dataCID: _dataCID,
            price: _price,
            isActive: true
        });

        emit AssetPublished(assetId, msg.sender, _metadataCID, _price);
        return assetId;
    }

    function purchaseDataAsset(uint256 _assetId) external {
        DataAsset storage asset = dataAssets[_assetId];
        require(asset.isActive, "Asset is not active");
        require(msg.sender != asset.owner, "Owner cannot purchase own asset");

        uint256 price = asset.price;
        require(
            oceanToken.allowance(msg.sender, address(this)) >= price,
            "Insufficient allowance"
        );

        require(
            oceanToken.transferFrom(msg.sender, asset.owner, price),
            "Transfer failed"
        );

        emit AssetPurchased(_assetId, msg.sender, asset.owner, price);
    }

    function getDataAsset(
        uint256 _assetId
    )
        external
        view
        returns (
            address owner,
            string memory metadataCID,
            uint256 price,
            bool isActive
        )
    {
        DataAsset storage asset = dataAssets[_assetId];
        return (asset.owner, asset.metadataCID, asset.price, asset.isActive);
    }

    function toggleDataAsset(uint256 _assetId) external {
        require(msg.sender == dataAssets[_assetId].owner, "Not the owner");
        dataAssets[_assetId].isActive = !dataAssets[_assetId].isActive;
    }
}
