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
        cloudbricIpfsBridge = await CloudbricIpfsBridge.deployed();
    });

    it("owner of WhiteList must be set correctly", async () => {
        const ownerOfWhiteList = await whiteList.owner.call();
        assert.equal(ownerOfWhiteList, owner);
    });

    it("owner of CloudbricIpfsBridge must be set correctly", async () => {
        const ownerOfCloudbricIpfsBridge = await cloudbricIpfsBridge.owner.call();
        assert.equal(ownerOfCloudbricIpfsBridge, owner); 
    });

    it("WhiteList must be included in CloudbricIpfsBridge", async () => {
        const addressOfWhiteList = await cloudbricIpfsBridge.whiteList.call();
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

contract("Cloudbric Ipfs Bridge", async accounts => {
    let dummy = null;
    let encodedDummy = null;
    
    before("setup dummy dataset", () => {
        dummy = helper.createDummy(0);
        encodedDummy = helper.encodeDataSet(dummy);
    });

    describe("WafBlackIp", () => {
        it("owner try to add wafBlackIp", async () => {
            try {
                await cloudbricIpfsBridge.addWafBlackIp(
                    encodedDummy.encodedIdxWafBlackIpList,
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

        it("alice try to add wafBlackIp but failed", async () => {
            try {
                await cloudbricIpfsBridge.addWafBlackIp(
                    encodedDummy.encodedIdxWafBlackIpList,
                    encodedDummy.encodedWafBlackIpHash,
                    encodedDummy.encodedHashFunction,
                    encodedDummy.encodedSize,
                    {from: alice}
                );
            } catch (error) {
                assert.ok(true);
            }
        });

        it("david try to add wafBlackIp but failed", async () => {
            try {
                await cloudbricIpfsBridge.addWafBlackIp(
                    encodedDummy.encodedIdxWafBlackIpList,
                    encodedDummy.encodedWafBlackIpHash,
                    encodedDummy.encodedHashFunction,
                    encodedDummy.encodedSize,
                    {from: david}
                );
                assert.fail(error);
            } catch (error) {
                assert.ok(true);
            }
        })

        it("get wafBlackIp at given clbIndex", async () => {
            try {
                let wafBlackIp = await cloudbricIpfsBridge.getWafBlackIpAtClbIndex(
                    encodedDummy.encodedIdxWafBlackIpList
                );
                assert.ok(true);
            } catch (error) {
                assert.fail(error);
            }
        });
    });

    describe("HackerWallet", () => {

    });
});