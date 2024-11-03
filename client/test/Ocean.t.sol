// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ocean} from "../src/Ocean.sol";

contract TestOcean is Test {
    Ocean public ocean;

    function setUp() public {
        address a = vm.randomAddress();
        ocean = new Ocean(a);
    }

    function test1() public view {
        assertEq(ocean.assetCount(), 0);
    }
}
