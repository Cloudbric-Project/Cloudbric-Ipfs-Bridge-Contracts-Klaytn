const fs = require('fs');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 
// logging process setup
const INITIAL_INSERTED_IDX = 210511986;

async function wafBlackIpInsert(startIdx, limit) {
    for (let i = 0; i < limit; i++) {
        let idx = startIdx + i;
        const wafBlackIpJson = fs.readFileSync(`./data/waf_black_ip/${idx}.json`).toString();
        const bufferedWafBlackIp = Buffer.from(wafBlackIpJson);

        try {
            const wafBlackIpAdded = await ipfs.add(bufferedWafBlackIp, {pin: true});
            console.log(wafBlackIpAdded);
        } catch (error) { 
            console.log(error);
        }
    }
}

wafBlackIpInsert(INITIAL_INSERTED_IDX, 100);