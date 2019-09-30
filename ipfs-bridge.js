const caverConfig = require('./config/caver');
const secret = require('./config/secret');
const contract = require('./config/contract');
const constant = require('./config/constant');

const vault = secret.vault;
const caver = caverConfig.caver;

const cloudbricIpfsBridgeAuth = contract.cloudbricIpfsBridgeAuth;
const cloudbricIpfsBridge = contract.cloudbricIpfsBridge;

const GAS_LIMIT = constant.GAS_LIMIT;

// method ABI collection
const abiWafBlackIpsSize = cloudbricIpfsBridge.methods.wafBlackIpsSize.call().encodeABI();

// init wallet
caver.klay.accounts.wallet.add(
    vault.local.accounts.deployer.privateKey, 
    vault.local.accounts.deployer.address
);
caver.klay.accounts.wallet.add(
    vault.local.accounts.alice.privateKey, 
    vault.local.accounts.alice.address
);

/**
 * 
 * @from address of user. each transaction will be executed by uniuqe user.
 * @to address of smart conrtract.
 * @delegate address of fee delagte
 * @abiOfMethod encoded ABI of smart contract method.
 */
async function feeDelegatedSmartContractExecute (from, to, delegate, abiOfMethod) {
    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: from,
        to: to,
        data: abiOfMethod,
        gas: GAS_LIMIT
    };

    let rlpEncodedTransaction = null;
    try {
        rlpEncodedTransaction = await caver.klay.accounts.signTransaction(
            feeDelegatedSmartContractObject,
            caver.klay.accounts.wallet[from].privateKey
        );
    } catch (error) {
        throw Error(error);
    }
    console.log(rlpEncodedTransaction);

    let recipt = null;
    try {
        receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rlpEncodedTransaction.rawTransaction,
            feePayer: delegate,
        });
    } catch (error) {
        throw Error(error);
    }
    console.log(receipt);
}

feeDelegatedSmartContractExecute(
        vault.local.accounts.alice.address,
        contract.addressOfIpfsBridge,
        vault.local.accounts.delegate.address,
        abiWafBlackIpsSize    
    ).catch(
        (error) => {
            console.log(error);
        }
    );

