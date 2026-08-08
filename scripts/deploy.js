const { Horizon, rpc, Keypair, Operation, TransactionBuilder, Networks, Account, Address, xdr } = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL = 'https://soroban-testnet.stellar.org';

const horizonServer = new Horizon.Server(HORIZON_URL);
const rpcServer = new rpc.Server(RPC_URL);

async function getFunding(publicKey) {
  console.log(`Funding account ${publicKey} via Friendbot...`);
  const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
  if (!res.ok) {
    throw new Error(`Friendbot funding failed: ${res.statusText}`);
  }
  console.log('Friendbot funding successful.');
}

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

function getContractIdFromMeta(txStatus) {
  const meta = txStatus.resultMetaXdr;
  const sorobanMeta = meta.value().sorobanMeta();
  const returnValue = sorobanMeta.returnValue();
  return Address.fromScVal(returnValue).toString();
}

async function main() {
  try {
    const deployer = Keypair.random();
    console.log(`Generated deployer account: ${deployer.publicKey()}`);
    console.log(`Secret key: ${deployer.secret()}`);

    await getFunding(deployer.publicKey());

    // Wait a bit for the ledger to reflect
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Loading deployer account info...');
    let accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    let account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 1. Upload Counter WASM
    const counterWasmPath = path.join(__dirname, '../contracts/target/wasm32-unknown-unknown/release/soroban_counter_contract.wasm');
    console.log(`Reading Counter WASM from ${counterWasmPath}...`);
    const counterWasm = fs.readFileSync(counterWasmPath);
    const counterWasmHash = crypto.createHash('sha256').update(counterWasm).digest();
    console.log(`Counter WASM Hash: ${counterWasmHash.toString('hex')}`);

    console.log('Building Counter upload transaction...');
    let tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.uploadContractWasm({ wasm: counterWasm }))
    .setTimeout(60)
    .build();

    let txStatus = await sendTransaction(tx, deployer);
    console.log('Counter WASM uploaded successfully.');

    // Reload account info for sequence number
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 2. Instantiate Counter Contract
    console.log('Building Counter instantiation transaction...');
    tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.createCustomContract({
      wasmHash: counterWasmHash,
      address: new Address(deployer.publicKey())
    }))
    .setTimeout(60)
    .build();

    txStatus = await sendTransaction(tx, deployer);
    const counterContractId = getContractIdFromMeta(txStatus);
    console.log(`>>> Counter Contract Address: ${counterContractId}`);

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 3. Upload Vault WASM
    const vaultWasmPath = path.join(__dirname, '../contracts/target/wasm32-unknown-unknown/release/soroban_vault_contract.wasm');
    console.log(`Reading Vault WASM from ${vaultWasmPath}...`);
    const vaultWasm = fs.readFileSync(vaultWasmPath);
    const vaultWasmHash = crypto.createHash('sha256').update(vaultWasm).digest();
    console.log(`Vault WASM Hash: ${vaultWasmHash.toString('hex')}`);

    console.log('Building Vault upload transaction...');
    tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.uploadContractWasm({ wasm: vaultWasm }))
    .setTimeout(60)
    .build();

    txStatus = await sendTransaction(tx, deployer);
    console.log('Vault WASM uploaded successfully.');

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 4. Instantiate Vault Contract
    console.log('Building Vault instantiation transaction...');
    tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.createCustomContract({
      wasmHash: vaultWasmHash,
      address: new Address(deployer.publicKey())
    }))
    .setTimeout(60)
    .build();

    txStatus = await sendTransaction(tx, deployer);
    const vaultContractId = getContractIdFromMeta(txStatus);
    console.log(`>>> Vault Contract Address: ${vaultContractId}`);

    console.log('\nDeployment Complete!');
    console.log('====================================');
    console.log(`Counter Contract ID: ${counterContractId}`);
    console.log(`Vault Contract ID:   ${vaultContractId}`);
    console.log('====================================');

  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

main();
