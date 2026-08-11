const { Horizon, rpc, Keypair, TransactionBuilder, Networks, Account, Address, Symbol, Contract, xdr } = require('@stellar/stellar-sdk');
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

    // 1. Upload Remittance WASM
    const wasmPath = path.join(__dirname, '../contracts/target/wasm32v1-none/release/soroban_remittance_contract.wasm');
    console.log(`Reading Remittance WASM from ${wasmPath}...`);
    
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found at ${wasmPath}. Please compile the contracts first.`);
    }
    
    const wasm = fs.readFileSync(wasmPath);
    const wasmHash = crypto.createHash('sha256').update(wasm).digest();
    console.log(`Remittance WASM Hash: ${wasmHash.toString('hex')}`);

    console.log('Building Remittance upload transaction...');
    const { Operation } = require('@stellar/stellar-sdk');
    let tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.uploadContractWasm({ wasm: wasm }))
    .setTimeout(60)
    .build();

    let txStatus = await sendTransaction(tx, deployer);
    console.log('Remittance WASM uploaded successfully.');

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 2. Instantiate Remittance Contract
    console.log('Building Remittance instantiation transaction...');
    tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.createCustomContract({
      wasmHash: wasmHash,
      address: new Address(deployer.publicKey())
    }))
    .setTimeout(60)
    .build();

    txStatus = await sendTransaction(tx, deployer);
    const contractId = getContractIdFromMeta(txStatus);
    console.log(`>>> Remittance Contract Address: ${contractId}`);

    // Create contract helper
    const remittanceContract = new Contract(contractId);

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 3. Initialize Contract
    console.log('Initializing Remittance Contract with admin authority...');
    const adminAddress = new Address(deployer.publicKey());
    const initOp = remittanceContract.call('initialize', adminAddress.toScVal());

    tx = new TransactionBuilder(account, {
      fee: '200',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(initOp)
    .setTimeout(60)
    .build();

    await sendTransaction(tx, deployer);
    console.log('Contract initialized successfully.');

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // 4. Set Default Rates
    console.log('Setting default conversion rates (INR=850, EUR=10, PHP=600)...');
    
    // INR = 850 (1 XLM = 8.50 INR)
    const setInrRateOp = remittanceContract.call(
      'set_rate',
      adminAddress.toScVal(),
      xdr.ScVal.scvSymbol('INR'),
      xdr.ScVal.scvU32(850)
    );

    tx = new TransactionBuilder(account, {
      fee: '200',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(setInrRateOp)
    .setTimeout(60)
    .build();

    await sendTransaction(tx, deployer);
    console.log('INR rate configured.');

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // EUR = 10 (1 XLM = 0.10 EUR)
    const setEurRateOp = remittanceContract.call(
      'set_rate',
      adminAddress.toScVal(),
      xdr.ScVal.scvSymbol('EUR'),
      xdr.ScVal.scvU32(10)
    );

    tx = new TransactionBuilder(account, {
      fee: '200',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(setEurRateOp)
    .setTimeout(60)
    .build();

    await sendTransaction(tx, deployer);
    console.log('EUR rate configured.');

    // Reload account info
    accountInfo = await horizonServer.loadAccount(deployer.publicKey());
    account = new Account(deployer.publicKey(), accountInfo.sequenceNumber());

    // PHP = 600 (1 XLM = 6.00 PHP)
    const setPhpRateOp = remittanceContract.call(
      'set_rate',
      adminAddress.toScVal(),
      xdr.ScVal.scvSymbol('PHP'),
      xdr.ScVal.scvU32(600)
    );

    tx = new TransactionBuilder(account, {
      fee: '200',
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(setPhpRateOp)
    .setTimeout(60)
    .build();

    await sendTransaction(tx, deployer);
    console.log('PHP rate configured.');

    console.log('\nDeployment Complete!');
    console.log('====================================');
    console.log(`Remittance Contract ID: ${contractId}`);
    console.log(`Admin/Deployer Public Key: ${deployer.publicKey()}`);
    console.log(`Admin/Deployer Secret Key: ${deployer.secret()}`);
    console.log('====================================');

    // Save configuration file for frontend reference
    const configPath = path.join(__dirname, '../lib/remittance-config.json');
    const configData = {
      contractId: contractId,
      adminPublicKey: deployer.publicKey(),
      adminSecretKey: deployer.secret(),
      network: 'testnet',
      nativeToken: 'CDLZFC3SYJYDZT7K67VZ75HPJBMK2CGBSTW6AWSFBATCEWAFMT3IS7FL' // Testnet Native Token
    };
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log(`Config saved to ${configPath}`);

  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

main();
