const fs = require('fs');
const constant = require(`${__dirname}/config/constant`);
const common = require(`${__dirname}/klaytn_bridge/common`);

async function splitWorkload () {
    const numOfWorkers = process.argv[2];
    const quota = constant.WORKLOAD / numOfWorkers;
    let workSheet = [];

    const whiteListAddIndexList = await common.getWhiteListAddIndexList(); 
    const whiteListStartingIndex = whiteListAddIndexList[0];
    const whiteListDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
    
    console.log(whiteListStartingIndex);
    console.log(whiteListDestinationIndex);
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {};
        workQuota.from = whiteListStartingIndex + (quota * (i - 1));
        workQuota.current = workQuota.from;

        let destinationIndex = whiteListStartingIndex + (quota * i) - 1;
        if (destinationIndex > whiteListDestinationIndex) {
            destinationIndex = whiteListDestinationIndex;
        }
        workQuota.to = destinationIndex;
        workQuota = JSON.stringify(workQuota);
        console.log(workQuota);
        workSheet.push(workQuota);
    }

    for (let i  = 0; i < workSheet.length; i++) {
        const directoryPath = `${__dirname}/work`;
        fs.writeFileSync(`${directoryPath}/white_list_worker_${i}.json`, workSheet[i], 'utf-8', 'w');
    }
}

splitWorkload();