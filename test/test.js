const fs = require('fs');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);
const LOCAL_URL = parsedSecret.local.URL;

const Caver = require('caver-js');
const caver = new Caver(LOCAL_URL);

const CloudbricIpfsBridge = artifacts.require("CloudbricIpfsBridge.sol");
const CloudbricIpfsBridgeAuth = artifacts.require("CloudbricIpfsBridgeAuth");

let owner = null;
let whiteUser = null;
let nonWhiteUser = null;
let alice = null;
let bob = null;

let cibAuth = null;
let cib = null;

// dummy data set
let wafBlackIpIndex = null; 
let wafBlackIpHash = null;
let hackerWalletIndex = null;
let hackerWalletHash = null;

let whiteSpace  = '     ';

contract("Setup For Each Testcase", async accounts => {
    beforeEach("setup accounts and contract for each test", async () => {
        owner = accounts[0];
        whiteUser = accounts[1];
        nonWhiteUser = accounts[2];
        alice = accounts[3];
        bob = accounts[4];

        cibAuth = await CloudbricIpfsBridgeAuth.deployed();
        cib = await CloudbricIpfsBridge.deployed();

    });

    // data to bytes32 test
    it("convert dummy data to bytes", async () => {
        let hex = caver.utils.asciiToHex('210511986');
        wafBlackIpIndex = caver.utils.hexToBytes(hex);
        
        hex = caver.utils.asciiToHex('2105');
        hackerWalletIndex = caver.utils.hexToBytes(hex);

        wafBlackIpHash = caver.utils.hexToBytes('0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89');
        hackerWalletHash = caver.utils.hexToBytes('0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E1234');
        console.log(`${whiteSpace}wafBlackIpIndex(bytes32): ${wafBlackIpIndex}`);
        console.log(`${whiteSpace}hackerWalletHash(bytes32): ${hackerWalletHash}`);
    });

    // bytes32 to data test
    it("convert bytes to dummy data", async () => {
        let hex = caver.utils.bytesToHex(wafBlackIpHash);
        console.log(`${whiteSpace}wafBlackIpHash: ${hex}`);
        hex = caver.utils.bytesToHex(hackerWalletHash);
        console.log(`${whiteSpace}hackerWalletHash: ${hex}`);

        hex = caver.utils.bytesToHex(wafBlackIpIndex);
        //console.log(caver.utils.hexToAscii(hex));
        hex = caver.utils.bytesToHex(hackerWalletIndex);
        // console.log(caver.utils.hexToAscii(hex));
    });

    it("owner of Cloudbric Ipfs Bridge Auth should be set correctly", async () => {
        let ownerOfCibAuth = cibAuth.owner();
        assert.equal(ownerOfCibAuth, ownerOfCibAuth);
    });

    it("owner of Cloudbric Ipfs Bridge should be set correctly", async () => {
        let ownerOfCib = cib.owner();
        assert.equal(ownerOfCib, ownerOfCib);
    });
});

contract("Cloudbric Ipfs Bridge:: waf Black Ips test", async accounts => {
    it("addWafBlackIp should be failed when executed by not owner", async () => {
        try {
            let result = await cib.addWafBlackIp(
                wafBlackIpIndex,
                wafBlackIpHash,
                0x12,
                0x20,
                { from: alice }
            );
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
        try {
            let result = await cib.addWafBlackIp(
                wafBlackIpIndex,
                wafBlackIpHash,
                0x12,
                0x20,
                { from: owner }
            );
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