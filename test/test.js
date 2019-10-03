const fs = require('fs');
const helper = require('../helper/helper');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);
const LOCAL_URL = parsedSecret.local.URL;

const Caver = require('caver-js');
const caver = new Caver(LOCAL_URL);

const CloudbricIpfsBridge = artifacts.require("CloudbricIpfsBridge.sol");
const CloudbricIpfsBridgeAuth = artifacts.require("CloudbricIpfsBridgeAuth");

let owner = null;
let alice = null;
let bob = null;

let cib = null;

// dummy data set
let wafBlackIpIndex = null; 
let wafBlackIpHash = null;

let whiteSpace  = '     ';

contract("Setup For Each Testcase", async accounts => {
    beforeEach("setup accounts and contract for each test", async () => {
        owner = accounts[0];
        alice = accounts[1];
        bob = accounts[2];

        cib = await CloudbricIpfsBridge.deployed();
    });

    it("owner of Cloudbric Ipfs Bridge should be set correctly", async () => {
        let ownerOfCib = cib.owner();
        assert.equal(ownerOfCib, ownerOfCib);
    });
});

contract("Cloudbric Ipfs Bridge:: waf Black Ips test", async accounts => {
    it("addWafBlackIp should be failed when executed by not owner", async () => {
        let { idxWafBlackIpList, wafBlackIpHash, hashFunction, size } = helper.createDummy(1);
        try {
            let result = await cib.addWafBlackIp(
                idxWafBlackIpList,
                wafBlackIpHash,
                hashFunction,
                size,
                { from: alice }
            );
            console.log(result);
        } catch (e) {
            let message = `${alice} is not not allowed to execute function.`;
            assert.fail(
                e.reason
                + '\n'
                + whiteSpace
                + message
            );
        }
    });

    it("addWafBlackIp should be failed when data already exists", async () => {
        let { idxWafBlackIpList, wafBlackIpHash, hashFunction, size } = helper.createDummy(1);
        try {
            let result = await cib.addWafBlackIp(
                idxWafBlackIpList,
                wafBlackIpHash,
                hashFunction,
                size,
                { from: owner }
            );
            console.log(result);
        } catch (e) {
            let message = `${wafBlackIpIndex} is already exists.`;
            assert.fail(
                e.reason
            );
        }
    });

    it("getWafBalckIpAtIndex should work correctly", async () => {
        try {
            let result = await cib.getWafBlackIpAtIndex(
                hackerWalletIndex,
                { from: owner });
            
        } catch (e) {
            console.log(e);
        }
    });
});