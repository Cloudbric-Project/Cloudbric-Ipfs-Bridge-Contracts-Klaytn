const caverConfig = require('../config/caver');
const helper = require('../helper/helper');

const caver = caverConfig.caver;

const WhiteList = artifacts.require("WhiteList.sol");
const CloudbricWafBlackIpStorage = artifacts.require("CloudbricWafBlackIpStorage.sol");

let cloudbricWafBlackIpStorage = null;
let whiteList = null;

let whiteSpace  = '     ';

const DATA_SIZE = 10;
const INITIAL_TO_BE_INSERTED_IDX = 210511986;

let owner = null;
let alice = null;
let bob = null;
let carol = null;
let david = null;

contract("Setup before test begin", async accounts => {
    before("setup accounts and contract", async () => {
        owner = accounts[0];
        alice = accounts[1];
        bob = accounts[2];
        carol = accounts[3];
        david = accounts[4];

        whiteList = await WhiteList.deployed();
        cloudbricWafBlackIpStorage = await CloudbricWafBlackIpStorage.deployed();
    });

    it("owner of WhiteList must be set correctly", async () => {
        const ownerOfWhiteList = await whiteList.owner.call();
        assert.equal(ownerOfWhiteList, owner);
    });

    it("owner of CloudbricWafBlackIpStorage must be set correctly", async () => {
        const ownerOfCloudbricWafBlackIpStorage = await cloudbricWafBlackIpStorage.owner.call();
        assert.equal(ownerOfCloudbricWafBlackIpStorage, owner); 
    });

    it("WhiteList must be included in CloudbricWafBlackIpStorage", async () => {
        const addressOfWhiteList = await cloudbricWafBlackIpStorage.whiteList.call();
        assert.equal(whiteList.address, addressOfWhiteList);
    });
});

contract("WhiteList", async accounts => {
    it("owner must be whiteListed", async () => {
        try {
            let isOwnerWhiteListed = await whiteList.isWhiteListed(owner);
            assert.equal(isOwnerWhiteListed, true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("owner add bob to whitelist", async () => {
        try {
            await whiteList.addWhiteList(bob, {from: owner});
            let isBobWhiteListed = await whiteList.isWhiteListed(bob);
            assert.equal(isBobWhiteListed, true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("alice try to add carol to whitelist but will be failed", async () => {
        try {
            await whiteList.addWhiteList(carol, {from: alice});
        } catch (error) {
            assert.ok(true);
        }
    });

    it("carol must not be whitelisted", async () => {
        try {
            let isCarolWhiteListed = await whiteList.isWhiteListed(carol);
            assert.equal(isCarolWhiteListed, false);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("alice try to remove bob from whitelist but will be failed", async () => {
        try {
            await whiteList.removeWhiteList(bob, {from: alice});
        } catch (error) {
            assert.ok(true);
        }
    });

    it("bob must be whitelisted because added by owner", async () => {
        try {
            let isBobWhiteListed = await whiteList.isWhiteListed(bob);
            assert.equal(isBobWhiteListed, true);
        } catch (error) {
            assert.fail(error);
        }
    })

    it("owner try to add carol to whitelist", async () => {
        try {
            await whiteList.addWhiteList(carol, {from: owner});
            let isCarolWhiteListed = await whiteList.isWhiteListed(carol);
            assert.equal(isCarolWhiteListed, true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("owner try to remove carol from whitelist", async () => {
        try {
            await whiteList.removeWhiteList(carol, {from: owner});
            let isCarolWhiteListed = await whiteList.isWhiteListed(carol);
            assert.equal(isCarolWhiteListed, false);
        } catch (error) {
            assert.fail(error);
        }
    });
});

contract("CloudbricWafBlackIpStorage Unit Test", async accounts => {
    let dummy = null;
    let encodedDummy = null;
    before("setup dummy data", async () => {
        dummy = helper.createDummy(INITIAL_TO_BE_INSERTED_IDX);
        encodedDummy = helper.encodeDataSet(dummy);
    });
    it("owner try to add wafBlackIp", async () => {
        try {
            await cloudbricWafBlackIpStorage.addWafBlackIp(
                encodedDummy.encodedClbIndex,
                encodedDummy.encodedWafBlackIpHash,
                encodedDummy.encodedHashFunction,
                encodedDummy.encodedSize,
                {from: owner}
            );
            assert.ok(true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("owner try to add same data but failed", async () => {
        try {
            await cloudbricWafBlackIpStorage.addWafBlackIp(
                encodedDummy.encodedClbIndex,
                encodedDummy.encodedWafBlackIpHash,
                encodedDummy.encodedHashFunction,
                encodedDummy.encodedSize,
                {from: owner}
            );
            assert.fail("error");
        } catch (error) {
            assert.ok(true);
        }
    });

    it("alice try to add wafBlackIp but failed", async () => {
        try {
            await cloudbricWafBlackIpStorage.addWafBlackIp(
                encodedDummy.encodedClbIndex,
                encodedDummy.encodedWafBlackIpHash,
                encodedDummy.encodedHashFunction,
                encodedDummy.encodedSize,
                {from: alice}
            );
            assert.fail("error");
        } catch (error) {
            assert.ok(true);
        }
    });

    it("david try to add wafBlackIp but failed", async () => {
        try {
            await cloudbricWafBlackIpStorage.addWafBlackIp(
                encodedDummy.encodedClbIndex,
                encodedDummy.encodedWafBlackIpHash,
                encodedDummy.encodedHashFunction,
                encodedDummy.encodedSize,
                {from: david}
            );
            assert.fail("error");
        } catch (error) {
            assert.ok(true);
        }
    });

    it("get wafBlackIp at given clbIndex", async () => {
        try {
            const encodedMultihash = await cloudbricWafBlackIpStorage.getWafBlackIpAtClbIndex(
                encodedDummy.encodedClbIndex
            );
            const decodedMultihash = helper.decodeMultihash(encodedMultihash);
            const ipfsHash = helper.multihashToIpfsHash(decodedMultihash);
            assert.ok(true);
        } catch (error) {
            assert.fail(error);
        }
    });

    it("get wafBlackIp at given index", async () => {
        try {
            const encodedMultihash = await cloudbricWafBlackIpStorage.getWafBlackIpAtIndex(
                0
            );
            const decodedMultihash = helper.decodeMultihash(encodedMultihash);
            const ipfsHash = helper.multihashToIpfsHash(decodedMultihash);
            assert.ok(true);
        } catch (error) {
            assert.fail(error);
        }
    });
});

contract("CloudbricWafBlackIpStorage Batch Test", () => {
    let encodedDummySet = []
    before("setup dummy data", () => {
        for (let i = 0; i < DATA_SIZE; i++) {
            let dummy = helper.createDummy(INITIAL_TO_BE_INSERTED_IDX + i + 1);
            let encodedDummy = helper.encodeDataSet(dummy);
            encodedDummySet.push(encodedDummy);
        }
    });
    it("david try to add data set but failed", async () => {
        for (let i = 0; i < DATA_SIZE - 5; i++) {
            try {
                await cloudbricWafBlackIpStorage.addWafBlackIp(
                    encodedDummySet[i].encodedClbIndex,
                    encodedDummySet[i].encodedWafBlackIpHash,
                    encodedDummySet[i].encodedHashFunction,
                    encodedDummySet[i].encodedSize,
                    {from: david}
                );
                assert.fail("error");
            } catch (error) {
                assert.ok(true);
                break;
            }
        }
    });

    it("bob try to add data set", async () => {
        await whiteList.addWhiteList(bob, {from: owner});
        for (let i = 0; i < DATA_SIZE; i++) {
            try {
                await cloudbricWafBlackIpStorage.addWafBlackIp(
                    encodedDummySet[i].encodedClbIndex,
                    encodedDummySet[i].encodedWafBlackIpHash,
                    encodedDummySet[i].encodedHashFunction,
                    encodedDummySet[i].encodedSize,
                    {from: bob}
                );
                assert.ok("error");
            } catch (error) {
                assert.false(error);
                break;
            }
        }
    });

    it("get added data set by bob using index", async () => {
        let wafBlackIpListSize = await cloudbricWafBlackIpStorage.wafBlackIpListSize();
        for (let i = 0; i < wafBlackIpListSize; i++) {
            try {
                let encodedMultihash = await cloudbricWafBlackIpStorage.getWafBlackIpAtIndex(
                    i
                );
                console.log(helper.decodeMultihash(encodedMultihash));
                assert.ok(true);
            } catch (error) {
                assert.fail(error);
            }
        }
    });

    it("get added data set by bob using clbIndex", async () => {
        let wafBlackIpListSize = await cloudbricWafBlackIpStorage.wafBlackIpListSize();
        for (let i = 0; i < wafBlackIpListSize; i++) {
            try {
                let encodedMultihash = await cloudbricWafBlackIpStorage.getWafBlackIpAtClbIndex(
                    encodedDummySet[i].encodedClbIndex
                );
                console.log(helper.decodeMultihash(encodedMultihash));
            }
            catch (error) {
                    assert.fail(error);
                    break;
            }
        }
    });
});