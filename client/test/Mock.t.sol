// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Ocean.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockOceanToken is ERC20 {
    constructor() ERC20("MockOcean", "MOCEAN") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract DataMarketplaceTest is Test {
    Ocean public marketplace;
    MockOceanToken public oceanToken;
    address public owner;
    address public buyer;

    function setUp() public {
        owner = address(this);
        buyer = address(0x1);

        oceanToken = new MockOceanToken();
        marketplace = new Ocean(address(oceanToken));

        oceanToken.transfer(buyer, 1000 * 10 ** 18);
    }

    function testPublishDataAsset() public {
        string memory metadataCID = "QmTest1";
        string memory dataCID = "QmTest2";
        uint256 price = 100 * 10 ** 18;

        uint256 assetId = marketplace.publishDataAsset(
            metadataCID,
            dataCID,
            price
        );

        (
            address assetOwner,
            string memory storedMetadataCID,
            uint256 storedPrice,
            bool isActive
        ) = marketplace.getDataAsset(assetId);

        assertEq(assetOwner, owner);
        assertEq(storedMetadataCID, metadataCID);
        assertEq(storedPrice, price);
        assertTrue(isActive);
    }

    function testPurchaseDataAsset() public {
        string memory metadataCID = "QmTest1";
        string memory dataCID = "QmTest2";
        uint256 price = 100 * 10 ** 18;

        uint256 assetId = marketplace.publishDataAsset(
            metadataCID,
            dataCID,
            price
        );

        vm.startPrank(buyer);

        oceanToken.approve(address(marketplace), price);

        uint256 buyerBalanceBefore = oceanToken.balanceOf(buyer);
        uint256 ownerBalanceBefore = oceanToken.balanceOf(owner);

        marketplace.purchaseDataAsset(assetId);

        assertEq(oceanToken.balanceOf(buyer), buyerBalanceBefore - price);
        assertEq(oceanToken.balanceOf(owner), ownerBalanceBefore + price);

        vm.stopPrank();
    }
}
