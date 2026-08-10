const { Horizon, rpc, TransactionBuilder, Keypair, Networks, Contract, Address, Account } = require('@stellar/stellar-sdk');

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

const DEPLOYER_SECRET = 'SBWGNLEPBBGKEWL6JK475W3X6HL4TKRBDWEB3KF6XUMSKN63MZJDOZCA';
const COUNTER_ID = 'CA3W3ZZH7CRZU5YEHII6L6TQ3P3OJ5DMVB76URY3I74S3K6NBC5LWL4B';
const VAULT_ID = 'CDQVQRVGMSL23OMWP45R5SHQ2C67TLYWW5CE6YBZPEC5HQWM6J7T4LXY';

const horizonServer = new Horizon.Server(HORIZON_URL);
const rpcServer = new rpc.Server(SOROBAN_RPC_URL);

async function sendTransaction(tx, keypair) {
  console.log('Simulating and preparing transaction...');
  const preparedTx = await rpcServer.prepareTransaction(tx);
  preparedTx.sign(keypair);

  console.log('Submitting transaction to network...');
  const response = await rpcServer.sendTransaction(preparedTx);

  if (response.status === 'ERROR') {
    throw new Error(`Transaction submission error: ${JSON.stringify(response)}`);
  }

  const txHash = response.hash;
  console.log(`Transaction submitted. Hash: ${txHash}. Polling for result...`);

  for (let i = 0; i < 30; i++) {
    const txStatus = await rpcServer.getTransaction(txHash);
    if (txStatus.status === 'SUCCESS') {
      console.log('Transaction succeeded!');
      return txStatus;
    } else if (txStatus.status === 'FAILED') {
      throw new Error(`Transaction failed: ${JSON.stringify(txStatus)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Transaction polling timed out');
}

async function main() {
  const keypair = Keypair.fromSecret(DEPLOYER_SECRET);
  console.log(`Using account: ${keypair.publicKey()}`);

  // Load account
  let accountInfo = await horizonServer.loadAccount(keypair.publicKey());
  let account = new Account(keypair.publicKey(), accountInfo.sequenceNumber());

  // 1. Interact with Counter (Call increment)
  console.log('Building Counter.increment transaction...');
  const counterContract = new Contract(COUNTER_ID);
  let tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(counterContract.call('increment'))
    .setTimeout(30)
    .build();

  const res1 = await sendTransaction(tx, keypair);
  console.log(`>>> Counter Interaction Tx Hash: ${res1.hash}`);

  // 2. Interact with Vault (Call deposit_and_increment)
  accountInfo = await horizonServer.loadAccount(keypair.publicKey());
  account = new Account(keypair.publicKey(), accountInfo.sequenceNumber());
  
  console.log('Building Vault.deposit_and_increment transaction...');
  const vaultContract = new Contract(VAULT_ID);
  const counterAddressScVal = new Address(COUNTER_ID).toScVal();
  
  tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(vaultContract.call('deposit_and_increment', counterAddressScVal))
    .setTimeout(30)
    .build();

  const res2 = await sendTransaction(tx, keypair);
  console.log(`>>> Vault Interaction Tx Hash: ${res2.hash}`);
}

main().catch(console.error);
