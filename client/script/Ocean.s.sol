// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import {Ocean} from "../src/Ocean.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployNFT is Script {
    Ocean public ocean;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        ocean = new Ocean(address(1));
        vm.stopBroadcast();
    }
}
