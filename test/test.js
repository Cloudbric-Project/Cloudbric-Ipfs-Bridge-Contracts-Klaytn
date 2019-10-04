const caverConfig = require('../config/caver');
const helper = require('../helper/helper');

const caver = caverConfig.caver;

const WhiteList = artifacts.require("WhiteList.sol");
const CloudbricIpfsBridge = artifacts.require("CloudbricIpfsBridge.sol");

let cloudbricIpfsBridge = null;
let whiteList = null;

let whiteSpace  = '     ';

let owner = null;
let alice = null;
let bob = null;

contract("Setup For Each Testcase", async accounts => {
    beforeEach("setup accounts and contract for each test", async () => {
        owner = accounts[0];
        alice = accounts[1];
        bob = accounts[2];

        whiteList = await WhiteList.deployed();
        cloudbricIpfsBridge = await CloudbricIpfsBridge.deployed();
    });

    it("owner of White List should be set correctly", async () => {
        const ownerOfWhiteList = await whiteList.owner.call();
        assert.equal(ownerOfWhiteList, owner);
    });

    it("owner of Cloudbric Ipfs Bridge should be set correctly", async () => {
        const ownerOfCloudbricIpfsBridge = await cloudbricIpfsBridge.owner.call();
        assert.equal(ownerOfCloudbricIpfsBridge, owner); 
    });
});

contract("WhiteList:: authentication test", async accounts => {
    it("addWhiteList must be executed by owner", async () => {
        try {
            await whiteList.addWhiteList(bob, {from: owner});
        } catch (error) {
            assert.fail(error);
        }
        assert.ok(true);
    });

    it("addWhiteList must be failed when exectued by not owner", async () => {
        try {
            await whiteList.addWhiteList(bob, {from: alice});
        } catch (error) {
            assert.ok(true);
        }
    });
})

contract("Cloudbric Ipfs Bridge:: waf Black Ips test", async accounts => {
    beforeEach("setup dummy dataset", async () => {
        let dummy = helper.createDummy(0);
        dummy = helper.encodeDataSet(dummy);
    });

    it("addWafBlackIp must be executed by owner", async () => {
        try {
            await cloudbricIpfsBridge.addWafBlackIp(
                dummy.encodedIdxWafBlackIpList,
                dummy.encodedWafBlackIpHash,
                dummy.encodedHashFunction,
                dummy.encodedSize,
                { from: owner }
            );
            assert.ok(true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("addWafBlackIp must be failed when executed by not owner", async () => {
        try {
            await cloudbricIpfsBridge.addWafBlackIp(
                dummy.encodedIdxWafBlackIpList,
                dummy.encodedWafBlackIpHash,
                dummy.encodedHashFunction,
                dummy.encodedSize,
                { from: alice }
            );
        } catch (e) {
            assert.ok(true);
        }
    });

});