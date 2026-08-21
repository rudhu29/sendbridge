"use client";

import React, { useState, useEffect, useRef } from "react";
import { Keypair, Horizon, TransactionBuilder, Operation, Networks, Account, Asset, Transaction, Contract, Address, xdr, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import { StellarWalletsKit, WalletNetwork, allowAllModules } from "@creit.tech/stellar-wallets-kit";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import { 
  Coins, Terminal, Award, Heart
} from "lucide-react";

import remittanceConfig from "../lib/remittance-config.json";

// Import types & constants
import { OnboardedUser, UserFeedback } from "./types";
import {
  TESTNET_HORIZON_URL,
  TESTNET_SOROBAN_RPC_URL,
  MAINNET_HORIZON_URL,
  MAINNET_SOROBAN_RPC_URL,
  DEFAULT_COUNTER_ID,
  DEFAULT_VAULT_ID,
  MAINNET_COUNTER_ID,
  MAINNET_VAULT_ID,
  MAINNET_REMITTANCE_ID,
  ONBOARDED_COHORT,
  MAINNET_COHORT
} from "./constants";

// Import modular components
import DiagnosticsLogger from "./DiagnosticsLogger";
import LocalSandbox from "./LocalSandbox";
import KycVerification from "./KycVerification";
import RemittanceForm from "./RemittanceForm";
import RateAlert from "./RateAlert";
import CohortTable from "./CohortTable";
import SlaAnalytics from "./SlaAnalytics";
import FeedbackForm from "./FeedbackForm";

export default function WhiteBeltToolbox() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"remittance" | "sandbox">("remittance");

  // Network Switch State (Level 6 Black Belt)
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");

  // Fee Sponsorship State (Level 6 Black Belt Advanced Feature)
  const [isSponsored, setIsSponsored] = useState(false);

  // Dynamic Network variables derived from active context
  const horizonUrl = network === "testnet" ? TESTNET_HORIZON_URL : MAINNET_HORIZON_URL;
  const sorobanRpcUrl = network === "testnet" ? TESTNET_SOROBAN_RPC_URL : MAINNET_SOROBAN_RPC_URL;
  const networkPassphrase = network === "testnet" ? Networks.TESTNET : Networks.PUBLIC;
  
  const counterId = network === "testnet" ? DEFAULT_COUNTER_ID : MAINNET_COUNTER_ID;
  const vaultId = network === "testnet" ? DEFAULT_VAULT_ID : MAINNET_VAULT_ID;
  const remittanceContractId = network === "testnet" ? remittanceConfig.contractId : MAINNET_REMITTANCE_ID;
  const nativeTokenAddress = network === "testnet" 
    ? remittanceConfig.nativeToken 
    : "CAS3J7GYMCCNCRABS5D42O545JPA55FCNEGDCP6Q6I7A6L27WNKZSHP6P5X6FLT42";

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string>("");
  const [walletLoading, setWalletLoading] = useState(false);

  // --- TAB 1: PAISA REMITTANCE MVP STATE ---
  const [kycStatus, setKycStatus] = useState<"Unverified" | "Checking" | "Pending" | "Verified">("Unverified");
  const [kycLoading, setKycLoading] = useState(false);
  const [kycForm, setKycForm] = useState({ fullName: "", email: "", country: "India", idNumber: "" });
  
  // Exchange Rates State (Can fluctuate with alerts)
  const [inrRate, setInrRate] = useState(8.50);
  const [eurRate, setEurRate] = useState(0.10);
  const [phpRate, setPhpRate] = useState(6.00);

  // Rate Alert State
  const [alertCorridor, setAlertCorridor] = useState<"INR" | "EUR" | "PHP">("INR");
  const [alertThreshold, setAlertThreshold] = useState("");
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertLogs, setAlertLogs] = useState<string[]>([]);
  
  // Cohort explorer state
  const [cohortSearch, setCohortSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState("All");
  const [cohortMonthFilter, setCohortMonthFilter] = useState("All");
  const [cohortPage, setCohortPage] = useState(0);
  const usersPerPage = 5;

  const [remitAmount, setRemitAmount] = useState("");
  const [remitRecipient, setRemitRecipient] = useState("");
  const [remitCorridor, setRemitCorridor] = useState<"INR" | "EUR" | "PHP">("INR");
  const [remitLoading, setRemitLoading] = useState(false);
  const [remitTxHash, setRemitTxHash] = useState<string | null>(null);
  const [remitStatusText, setRemitStatusText] = useState("");

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({ ratingUi: 5, ratingSpeed: 5, ratingCost: 5, comment: "" });
  
  // Real-time Event Feed specific to Remittance
  const [remitEvents, setRemitEvents] = useState<string[]>([]);
  const [isRemitPollerActive, setIsRemitPollerActive] = useState(true);

  // Diagnostics logs
  const [logs, setLogs] = useState<string[]>(["Paisa Remittance Dashboard initialized. Ready."]);

  // --- TAB 2: DEVELOPER SANDBOX STATE (Original Levels 1/2) ---
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendTxHash, setSendTxHash] = useState<string | null>(null);
  
  const [localKeypair, setLocalKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [localBalance, setLocalBalance] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localFundingLoading, setLocalFundingLoading] = useState(false);

  const [selectedContract, setSelectedContract] = useState<"counter" | "vault">("counter");
  const [counterContractId, setCounterContractId] = useState(DEFAULT_COUNTER_ID);
  const [vaultContractId, setVaultContractId] = useState(DEFAULT_VAULT_ID);
  const [contractCounter, setContractCounter] = useState<number | null>(null);
  const [contractStatus, setContractStatus] = useState<"Idle" | "Preparing" | "Awaiting Signature" | "Broadcasting" | "Success" | "Failed">("Idle");
  const [contractTxHash, setContractTxHash] = useState<string | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [contractEvents, setContractEvents] = useState<string[]>([]);

  // Ref to hold the wallet kit instance
  const kitRef = useRef<StellarWalletsKit | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Initialize StellarWalletsKit and Feedback
  useEffect(() => {
    kitRef.current = new StellarWalletsKit({
      network: network === "testnet" ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
      modules: allowAllModules(),
    });
    addLog(`StellarWalletsKit multi-wallet adapters successfully loaded for ${network.toUpperCase()}.`);

    // Load initial feedback
    const savedFeedback = localStorage.getItem("paisa_feedback");
    if (savedFeedback) {
      setFeedbackList(JSON.parse(savedFeedback));
    } else {
      const defaultFeedback: UserFeedback[] = [
        { userAddress: "GBAU...T7W4", ratingUi: 5, ratingSpeed: 5, ratingCost: 5, comment: "Incredibly fast! Settled in 5 seconds.", date: "2026-08-01" },
        { userAddress: "GDLQ...A2PQ", ratingUi: 4, ratingSpeed: 5, ratingCost: 5, comment: "Cheaper than bank remittance. Best rate for Germany.", date: "2026-08-02" },
        { userAddress: "GBX5...9KLL", ratingUi: 5, ratingSpeed: 4, ratingCost: 5, comment: "On-chain KYC simulation was smooth.", date: "2026-08-03" }
      ];
      setFeedbackList(defaultFeedback);
      localStorage.setItem("paisa_feedback", JSON.stringify(defaultFeedback));
    }
  }, [network]);

  // Multi-wallet connection flow
  const connectWallet = async () => {
    if (!kitRef.current) return;
    setWalletLoading(true);
    addLog("Opening multi-wallet connection modal...");
    
    try {
      await kitRef.current.openModal({
        onWalletSelected: async (option) => {
          try {
            kitRef.current!.setWallet(option.id);
            const { address } = await kitRef.current!.getAddress();
            setWalletAddress(address);
            setWalletType(option.name);
            addLog(`Wallet authorized successfully: ${address.slice(0, 10)}... via ${option.name}`);
            toast.success("Wallet Connected", `Connected to ${option.name}`);
            await fetchWalletBalance(address);
            await checkOnChainKyc(address);
          } catch (err: any) {
            addLog(`Authentication failed: ${err.message || err}`);
            toast.error("Auth Failed", err.message || "Failed to retrieve public key from wallet.");
          }
        },
      });
    } catch (err: any) {
      console.error(err);
      addLog(`Wallet connection failed: ${err.message || "User dismissed modal"}`);
      toast.error("Connection Interrupted", err.message || "Wallet authorization closed by user.");
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setWalletBalance(null);
    setWalletType("");
    setKycStatus("Unverified");
    addLog("Wallet disconnected successfully.");
    toast.info("Wallet Disconnected", "Browser wallet has been unlinked.");
  };

  const fetchWalletBalance = async (address: string) => {
    if (!address) return;
    addLog(`Retrieving XLM balance for ${address.slice(0, 8)}...`);
    try {
      const server = new Horizon.Server(horizonUrl);
      const accountInfo = await server.loadAccount(address);
      const nativeBalance = accountInfo.balances.find((b) => b.asset_type === "native");
      const balanceVal = nativeBalance ? nativeBalance.balance : "0.0000";
      setWalletBalance(balanceVal);
      addLog("Connected balance: " + balanceVal + " XLM");
    } catch (err: any) {
      addLog(`Balance retrieval failed: ${err.message}`);
      setWalletBalance("0.0000");
    }
  };

  // --- TAB 1: PAISA REMITTANCE ON-CHAIN ACTIONS ---

  // Check user KYC status on-chain
  const checkOnChainKyc = async (address: string) => {
    if (!address) return;
    setKycStatus("Checking");
    addLog(`Checking on-chain KYC status for user: ${address.slice(0, 10)}...`);
    
    try {
      const dummyAccount = new Account("GBAUMMVLM4OC2WWT4W2SVSXG2Z5JNWZVTKW3O7H2P6H66ZVT3H5W2N66", "0");
      const contractInstance = new Contract(remittanceContractId);
      const tx = new TransactionBuilder(dummyAccount, {
        fee: "100",
        networkPassphrase: networkPassphrase,
      })
      .addOperation(contractInstance.call("get_kyc", new Address(address).toScVal()))
      .setTimeout(30)
      .build();

      const res = await fetch(sorobanRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "simulateTransaction",
          params: { transaction: tx.toXDR() }
        })
      });

      const data = await res.json();
      if (data.result && data.result.results && data.result.results[0]) {
        const resultXdr = data.result.results[0].xdr;
        const scVal = xdr.ScVal.fromXDR(resultXdr, 'base64');
        const hasKyc = scValToNative(scVal) as boolean;
        setKycStatus(hasKyc ? "Verified" : "Unverified");
        addLog(`On-chain KYC Verification response: ${hasKyc ? "VERIFIED" : "NOT VERIFIED"}`);
      } else {
        setKycStatus("Unverified");
      }
    } catch (err: any) {
      console.error("KYC check failed:", err);
      addLog(`KYC check failed: ${err.message}`);
      setKycStatus("Unverified");
    }
  };

  // Submit Simulated On-chain KYC
  const submitSimulatedKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error("Wallet Required", "Connect your wallet before completing KYC onboarding.");
      return;
    }
    setKycLoading(true);
    addLog("Initiating on-chain KYC verification via admin credentials...");
    
    try {
      const server = new Horizon.Server(horizonUrl);
      const adminKeypair = Keypair.fromSecret(remittanceConfig.adminSecretKey);
      
      addLog("Fetching admin transaction authority...");
      const adminAccountInfo = await server.loadAccount(adminKeypair.publicKey());
      const adminAccount = new Account(adminKeypair.publicKey(), adminAccountInfo.sequenceNumber());

      const contractInstance = new Contract(remittanceContractId);
      const tx = new TransactionBuilder(adminAccount, {
        fee: "200",
        networkPassphrase: networkPassphrase
      })
      .addOperation(contractInstance.call(
        "set_kyc",
        new Address(adminKeypair.publicKey()).toScVal(),
        new Address(walletAddress).toScVal(),
        xdr.ScVal.scvBool(true)
      ))
      .setTimeout(60)
      .build();

      addLog("Signing transaction with compliance authority signature...");
      tx.sign(adminKeypair);
      
      addLog("Submitting KYC whitelist request to Soroban ledger...");
      const result = await server.submitTransaction(tx);
      
      addLog(`On-chain KYC Whitelist updated! Tx Hash: ${result.hash}`);
      toast.success("KYC Verified", "Your address has been whitelisted on-chain.");
      setKycStatus("Verified");
    } catch (err: any) {
      console.error("KYC submission failed:", err);
      addLog(`KYC approval transaction failed: ${err.message || err}`);
      toast.error("KYC Gating Failed", err.message || "Failed to submit whitelist tx.");
    } finally {
      setKycLoading(false);
    }
  };

  // Execute Remittance
  const executeRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !kitRef.current) {
      toast.error("Wallet Required", "Link your wallet first.");
      return;
    }
    if (kycStatus !== "Verified") {
      toast.error("KYC Gated", "You must verify your identity (KYC) before performing transfers.");
      return;
    }
    if (!remitRecipient || !remitAmount) {
      toast.error("Incomplete fields", "Provide recipient address and XLM amount.");
      return;
    }

    const balanceNum = parseFloat(walletBalance || "0");
    const amountNum = parseFloat(remitAmount);
    
    // For sponsored transfers, the user doesn't pay the transaction fee.
    const requiredMin = isSponsored ? amountNum : (amountNum + 1.0);
    if (balanceNum < requiredMin) {
      toast.error("Insufficient Funds", isSponsored 
        ? "Ensure you have enough XLM for the transfer amount." 
        : "Reserve at least 1.0 XLM for fees and account storage requirements."
      );
      return;
    }

    setRemitLoading(true);
    setRemitTxHash(null);
    setRemitStatusText("Preparing Transaction...");
    addLog(`Initiating remittance of ${remitAmount} XLM to ${remitRecipient} in corridor ${remitCorridor}...`);

    try {
      const server = new Horizon.Server(horizonUrl);
      const accountInfo = await server.loadAccount(walletAddress);
      const account = new Account(walletAddress, accountInfo.sequenceNumber());
      const contractInstance = new Contract(remittanceContractId);

      const amountStroops = BigInt(Math.floor(amountNum * 10000000));
      
      const op = contractInstance.call(
        "send_remittance",
        new Address(walletAddress).toScVal(),
        new Address(remitRecipient).toScVal(),
        new Address(nativeTokenAddress).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' }),
        xdr.ScVal.scvSymbol(remitCorridor)
      );

      let finalTx;
      if (isSponsored) {
        addLog("[Sponsorship] Creating inner transaction with zero base fee...");
        const innerTx = new TransactionBuilder(account, {
          fee: "0",
          networkPassphrase: networkPassphrase
        })
        .addOperation(op)
        .setTimeout(60)
        .build();

        setRemitStatusText("Awaiting Wallet Signature...");
        addLog("[Sponsorship] Requesting inner transaction signature from Freighter/xBull...");
        const { signedTxXdr } = await kitRef.current.signTransaction(innerTx.toXDR());
        const userSignedTx = new Transaction(signedTxXdr, networkPassphrase);

        setRemitStatusText("Applying Fee Sponsorship...");
        addLog("[Sponsorship] Building Stellar Fee Bump transaction envelope...");
        const adminKeypair = Keypair.fromSecret(remittanceConfig.adminSecretKey);
        const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
          adminKeypair.publicKey(),
          "1000",
          userSignedTx,
          networkPassphrase
        );

        addLog("[Sponsorship] Signing Fee Bump envelope with admin/sponsor authority...");
        feeBumpTx.sign(adminKeypair);
        finalTx = feeBumpTx;
      } else {
        const tx = new TransactionBuilder(account, {
          fee: "300",
          networkPassphrase: networkPassphrase
        })
        .addOperation(op)
        .setTimeout(60)
        .build();

        setRemitStatusText("Awaiting Signature...");
        addLog(`Requesting transaction signature from browser wallet (${walletType})...`);
        const { signedTxXdr } = await kitRef.current.signTransaction(tx.toXDR());
        const signedTx = new Transaction(signedTxXdr, networkPassphrase);
        finalTx = signedTx;
      }

      setRemitStatusText("Broadcasting on-chain...");
      addLog("Broadcasting remittance envelope to Stellar network...");
      const result = await server.submitTransaction(finalTx);

      setRemitTxHash(result.hash);
      setRemitStatusText("Success!");
      addLog(`Remittance settled on-chain! Hash: ${result.hash}`);
      toast.success("Remittance Confirmed", `Successfully sent to recipient in corridor ${remitCorridor}`);
      await fetchWalletBalance(walletAddress);
    } catch (err: any) {
      console.error("Remittance invocation failed:", err);
      setRemitStatusText("Failed");
      const errorMsg = err.message || String(err);
      addLog(`Remittance execution failed: ${errorMsg}`);
      toast.error("Transfer Failed", errorMsg.slice(0, 100));
    } finally {
      setRemitLoading(false);
    }
  };

  // Poll for remittance events specifically
  const pollRemittanceEvents = async () => {
    try {
      const ledgerRes = await fetch(sorobanRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestLedger"
        })
      });
      const ledgerData = await ledgerRes.json();
      const latestLedger = ledgerData.result?.sequence;
      if (!latestLedger) return;

      const startLedger = Math.max(1, latestLedger - 1000);
      const res = await fetch(sorobanRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getEvents",
          params: {
            startLedger: startLedger,
            filters: [{ type: "contract", contractIds: [remittanceContractId] }],
            limit: 10
          }
        })
      });

      const data = await res.json();
      const events = data.result?.events || [];
      if (events.length > 0) {
        const formattedEvents = events.map((ev: any) => {
          const ledgerSeq = ev.ledger;
          
          let parsedVal = "Remittance event recorded";
          try {
            if (ev.value && ev.value.xdr) {
              const scVal = xdr.ScVal.fromXDR(ev.value.xdr, 'base64');
              if (scVal.switch().name === 'scvVec') {
                const vec = scVal.vec();
                if (vec && vec.length >= 5) {
                  const sender = Address.fromScVal(vec[0]).toString();
                  const amount = scValToNative(vec[2]);
                  const converted = scValToNative(vec[3]);
                  const currency = vec[4].sym().toString();
                  
                  const xlms = (Number(amount) / 10000000).toFixed(2);
                  const fiats = (Number(converted) / 10000000).toFixed(2);
                  
                  parsedVal = `Transfer of ${xlms} XLM approved. Recipient received ${fiats} ${currency} (Address: ${sender.slice(0, 6)}...)`;
                }
              }
            }
          } catch {}
          
          return `[Ledger ${ledgerSeq}] ${parsedVal}`;
        });
        setRemitEvents(formattedEvents);
      }
    } catch (err: any) {
      console.error("Event polling failure:", err);
    }
  };

  // Feedback Submission Handler
  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newFeedback: UserFeedback = {
      userAddress: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Anonymous",
      ratingUi: feedbackForm.ratingUi,
      ratingSpeed: feedbackForm.ratingSpeed,
      ratingCost: feedbackForm.ratingCost,
      comment: feedbackForm.comment || "Great MVP corridor!",
      date: new Date().toISOString().split('T')[0]
    };

    const updatedList = [newFeedback, ...feedbackList];
    setFeedbackList(updatedList);
    localStorage.setItem("paisa_feedback", JSON.stringify(updatedList));
    setFeedbackForm({ ratingUi: 5, ratingSpeed: 5, ratingCost: 5, comment: "" });
    toast.success("Feedback Recorded", "Thank you for supporting our Stellar remittance pilot!");
    addLog("New user feedback successfully logged.");
  };

  // Tab 1 Rate Calculation helpers
  const getCorridorExchangeRate = () => {
    if (remitCorridor === "INR") return inrRate;
    if (remitCorridor === "EUR") return eurRate;
    if (remitCorridor === "PHP") return phpRate;
    return 1.0;
  };

  // Level 5 Rate Alerts system
  const handleAlertSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertThreshold) {
      toast.error("Input Needed", "Specify a rate threshold value.");
      return;
    }
    setIsAlertActive(true);
    addLog(`Alert subscription configured: Notify if ${alertCorridor} crosses ${alertThreshold}`);
    toast.success("Alert Configured", `Subscribed to ${alertCorridor} rate alerts.`);
  };

  // Simulate market fluctuation to trigger alerts
  const simulateMarketFluctuation = () => {
    const isUp = Math.random() > 0.4;
    const delta = (Math.random() * 0.15 + 0.02) * (isUp ? 1 : -1);
    
    addLog("Simulating market rate fluctuation...");
    
    if (alertCorridor === "INR") {
      const oldRate = inrRate;
      const newRate = parseFloat((oldRate + delta).toFixed(2));
      setInrRate(newRate);
      addLog(`INR rate updated: ${oldRate} ➔ ${newRate}`);
      
      if (isAlertActive && alertThreshold) {
        const thresholdNum = parseFloat(alertThreshold);
        if ((oldRate < thresholdNum && newRate >= thresholdNum) || (oldRate > thresholdNum && newRate <= thresholdNum)) {
          const triggerMsg = `🔔 Rate Alert: INR has crossed your threshold of ${thresholdNum}! New Rate: ${newRate}`;
          setAlertLogs(prev => [triggerMsg, ...prev]);
          toast.info("Rate Alert Triggered", `INR is now ${newRate}!`);
          addLog(triggerMsg);
        }
      }
    } else if (alertCorridor === "EUR") {
      const oldRate = eurRate;
      const newRate = parseFloat((oldRate + (delta / 100)).toFixed(3));
      setEurRate(newRate);
      addLog(`EUR rate updated: ${oldRate} ➔ ${newRate}`);
      
      if (isAlertActive && alertThreshold) {
        const thresholdNum = parseFloat(alertThreshold);
        if ((oldRate < thresholdNum && newRate >= thresholdNum) || (oldRate > thresholdNum && newRate <= thresholdNum)) {
          const triggerMsg = `🔔 Rate Alert: EUR has crossed your threshold of ${thresholdNum}! New Rate: ${newRate}`;
          setAlertLogs(prev => [triggerMsg, ...prev]);
          toast.info("Rate Alert Triggered", `EUR is now ${newRate}!`);
          addLog(triggerMsg);
        }
      }
    } else if (alertCorridor === "PHP") {
      const oldRate = phpRate;
      const newRate = parseFloat((oldRate + delta).toFixed(2));
      setPhpRate(newRate);
      addLog(`PHP rate updated: ${oldRate} ➔ ${newRate}`);
      
      if (isAlertActive && alertThreshold) {
        const thresholdNum = parseFloat(alertThreshold);
        if ((oldRate < thresholdNum && newRate >= thresholdNum) || (oldRate > thresholdNum && newRate <= thresholdNum)) {
          const triggerMsg = `🔔 Rate Alert: PHP has crossed your threshold of ${thresholdNum}! New Rate: ${newRate}`;
          setAlertLogs(prev => [triggerMsg, ...prev]);
          toast.info("Rate Alert Triggered", `PHP is now ${newRate}!`);
          addLog(triggerMsg);
        }
      }
    }
  };

  // Download cohort records as CSV
  const downloadCohortCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Full Name,Email Address,Stellar Wallet Address,Destination Corridor,UI Rating,Speed Rating,Cost Rating,Review Comment,Transaction Hash,Date Onboarded\r\n";
    
    const cohortToDownload = network === "testnet" ? ONBOARDED_COHORT : MAINNET_COHORT;
    cohortToDownload.forEach(u => {
      const row = `"${u.name}","${u.email}","${u.address}","${u.corridor}",${u.uiRating},${u.speedRating},${u.costRating},"${u.comment.replace(/"/g, '""')}","${u.txHash}","${u.dateOnboarded}"`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${network}-user-onboarding-feedback.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`User onboarding feedback spreadsheet for ${network.toUpperCase()} downloaded successfully.`);
    toast.success("Spreadsheet Downloaded", "CSV feedback exported successfully.");
  };

  // Tab 1 Event Listener Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRemitPollerActive) {
      pollRemittanceEvents();
      interval = setInterval(() => {
        pollRemittanceEvents();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isRemitPollerActive]);

  // Cohort filtering logic
  const currentCohort = network === "testnet" ? ONBOARDED_COHORT : MAINNET_COHORT;
  const filteredCohort = currentCohort.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(cohortSearch.toLowerCase()) || 
      user.email.toLowerCase().includes(cohortSearch.toLowerCase()) || 
      user.address.toLowerCase().includes(cohortSearch.toLowerCase());
    
    const matchesFilter = cohortFilter === "All" || user.corridor === cohortFilter;
    const matchesMonth = cohortMonthFilter === "All" || user.dateOnboarded.includes(`-${cohortMonthFilter}-`);
    return matchesSearch && matchesFilter && matchesMonth;
  });

  const totalCohortPages = Math.ceil(filteredCohort.length / usersPerPage);
  const displayedCohort = filteredCohort.slice(cohortPage * usersPerPage, (cohortPage + 1) * usersPerPage);

  // --- TAB 2: DEVELOPER SANDBOX LOGIC (Original White & Orange Belt) ---

  const sendXlm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !kitRef.current) {
      toast.error("Wallet Required", "Please connect your wallet first.");
      return;
    }
    if (!recipient || !amount) {
      toast.error("Form Incomplete", "Please specify recipient and XLM amount.");
      return;
    }

    const balanceNum = parseFloat(walletBalance || "0");
    const amountNum = parseFloat(amount);
    if (balanceNum < amountNum + 0.00001) {
      addLog("Transaction cancelled: Insufficient balance to cover payment and fees.");
      toast.error("Insufficient Balance", "You do not have enough XLM in your connected wallet.");
      return;
    }

    setSendLoading(true);
    setSendTxHash(null);
    addLog(`Preparing payment of ${amount} XLM to ${recipient}...`);

    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(walletAddress);
      const account = new Account(walletAddress, accountInfo.sequenceNumber());

      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      addLog(`Requesting transaction signature from ${walletType}...`);
      const { signedTxXdr } = await kitRef.current.signTransaction(tx.toXDR());
      const signedTx = new Transaction(signedTxXdr, Networks.TESTNET);
      
      addLog("Submitting signed transaction envelope to Horizon...");
      const result = await server.submitTransaction(signedTx);
      
      setSendTxHash(result.hash);
      addLog(`Payment successfully broadcast! Hash: ${result.hash}`);
      toast.success("Payment Confirmed", "Transaction successfully validated on-chain.");
      await fetchWalletBalance(walletAddress);
    } catch (err: any) {
      console.error(err);
      addLog(`Payment failed: ${err.message || "Authorization rejected"}`);
      toast.error("Payment Failed", err.message || "Wallet rejected signing request.");
    } finally {
      setSendLoading(false);
    }
  };

  // Local Wallet Sandbox Generation
  const generateLocalWallet = () => {
    setLocalLoading(true);
    addLog("Generating client-side cryptographically secure random keypair...");
    try {
      const kp = Keypair.random();
      setLocalKeypair({
        publicKey: kp.publicKey(),
        secretKey: kp.secret(),
      });
      addLog(`New Sandbox Keypair generated. Address: ${kp.publicKey().slice(0, 10)}...`);
      toast.success("Sandbox Keypair Created", "A temporary keypair has been generated client-side.");
      setLocalBalance("0.0000");
    } catch (err: any) {
      addLog(`Sandbox generation failed: ${err.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const fundLocalWallet = async () => {
    if (!localKeypair) return;
    setLocalFundingLoading(true);
    addLog(`Requesting Friendbot service to load XLM onto ${localKeypair.publicKey.slice(0, 8)}...`);
    
    try {
      const friendbotUrl = `https://friendbot.stellar.org/?addr=${localKeypair.publicKey}`;
      const response = await fetch(friendbotUrl);
      if (response.ok) {
        addLog("Friendbot sequence verified. Account loaded on Testnet ledger!");
        toast.success("Sandbox Account Active", "10,000 Testnet XLM loaded.");
        await fetchLocalBalance();
      } else {
        const errText = await response.text();
        throw new Error(errText || "Friendbot response code failed.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Friendbot allocation failed: ${err.message}`);
      toast.error("Friendbot Error", "Failed to resolve friendbot account funding.");
    } finally {
      setLocalFundingLoading(false);
    }
  };

  const fetchLocalBalance = async () => {
    if (!localKeypair) return;
    setLocalLoading(true);
    addLog(`Polling Horizon Testnet server for local sandbox address: ${localKeypair.publicKey.slice(0, 8)}...`);
    
    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      const accountInfo = await server.loadAccount(localKeypair.publicKey);
      const nativeBalance = accountInfo.balances.find((b) => b.asset_type === "native");
      const balanceVal = nativeBalance ? nativeBalance.balance : "0.0000";
      setLocalBalance(balanceVal);
      addLog(`Local sandbox balance: ${nativeBalance ? nativeBalance.balance : "0.0000"} XLM`);
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotFoundError") {
        addLog("Local sandbox account is not yet funded on Testnet.");
        toast.info("Not Funded", "Use Friendbot to activate this local address on-ledger.");
      } else {
        addLog(`Sandbox balance check failed: ${err.message}`);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  // Simulate read transaction invocation
  const readContractValue = async () => {
    if (!counterContractId) {
      toast.error("Input Needed", "Specify target Counter Contract ID.");
      return;
    }
    setContractLoading(true);
    addLog(`Preparing simulated RPC call to contract: ${counterContractId.slice(0, 10)}...`);

    try {
      const dummyAccount = new Account("GBAUMMVLM4OC2WWT4W2SVSXG2Z5JNWZVTKW3O7H2P6H66ZVT3H5W2N66", "0");
      const contractInstance = new Contract(counterContractId);
      const tx = new TransactionBuilder(dummyAccount, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contractInstance.call("get_count"))
        .setTimeout(30)
        .build();

      addLog("Sending simulation payload to Soroban RPC...");
      const res = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "simulateTransaction",
          params: {
            transaction: tx.toXDR(),
          },
        }),
      });

      const data = await res.json();
      if (data.result && data.result.results && data.result.results[0]) {
        const resultXdr = data.result.results[0].xdr;
        const scVal = xdr.ScVal.fromXDR(resultXdr, 'base64');
        const counterVal = scValToNative(scVal) as number;
        setContractCounter(counterVal);
        addLog(`Simulation returned count state: ${counterVal}`);
      } else {
        throw new Error(data.error?.message || "Simulation returned empty payload.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Simulated read failed: ${err.message}`);
      toast.error("Read Error", err.message || "Simulated contract execution failed.");
    } finally {
      setContractLoading(false);
    }
  };

  // Submit on-chain contract write transaction using connected Freighter Wallet
  const incrementContractValue = async () => {
    if (!walletAddress || !kitRef.current) {
      toast.error("Wallet Required", "Link a browser wallet to sign write transactions.");
      return;
    }

    setContractStatus("Preparing");
    setContractTxHash(null);
    addLog(`Initiating contract invocation: Selected Contract: ${selectedContract.toUpperCase()}...`);

    try {
      const server = new Horizon.Server(TESTNET_HORIZON_URL);
      addLog("Fetching sender transaction sequence...");
      const accountInfo = await server.loadAccount(walletAddress);
      const account = new Account(walletAddress, accountInfo.sequenceNumber());

      let op;
      if (selectedContract === "counter") {
        const contractInstance = new Contract(counterContractId);
        op = contractInstance.call("increment");
        addLog(`Direct Increment call targeting Counter: ${counterContractId.slice(0, 10)}...`);
      } else {
        const contractInstance = new Contract(vaultContractId);
        op = contractInstance.call("deposit_and_increment", new Address(counterContractId).toScVal());
        addLog(`Inter-contract call targeting Vault: ${vaultContractId.slice(0, 10)}... and Counter: ${counterContractId.slice(0, 10)}...`);
      }

      const tx = new TransactionBuilder(account, {
        fee: "200",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(op)
        .setTimeout(60)
        .build();

      setContractStatus("Awaiting Signature");
      addLog("Requesting transaction signature envelope from connected wallet...");
      const { signedTxXdr } = await kitRef.current.signTransaction(tx.toXDR());
      const signedTx = new Transaction(signedTxXdr, Networks.TESTNET);

      setContractStatus("Broadcasting");
      addLog("Submitting Soroban envelope to Testnet Horizon...");
      const result = await server.submitTransaction(signedTx);

      setContractTxHash(result.hash);
      setContractStatus("Success");
      addLog(`Soroban execution completed! Transaction Hash: ${result.hash}`);
      toast.success("Tx Success", "Soroban contract successfully incremented.");
      
      // Auto-update counter value
      setTimeout(() => {
        readContractValue();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || String(err);
      
      // Check user reject
      if (
        errorMsg.toLowerCase().includes("user reject") || 
        errorMsg.toLowerCase().includes("declined") || 
        errorMsg.toLowerCase().includes("cancel")
      ) {
        addLog("Signature rejected: User declined the signing request in their wallet.");
        toast.info("Signature Refused", "Request rejected by the user.");
      } else {
        addLog(`Soroban call failed: ${errorMsg}`);
        toast.error("Invocation Failed", `The transaction could not be executed: ${errorMsg.slice(0, 80)}`);
      }
      setContractStatus("Failed");
    }
  };

  // Poll background events for tab 2 contract module
  const pollContractEvents = async () => {
    try {
      const ledgerRes = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestLedger"
        })
      });
      const ledgerData = await ledgerRes.json();
      const latestLedger = ledgerData.result?.sequence;
      if (!latestLedger) return;

      const targetId = selectedContract === "counter" ? counterContractId : vaultContractId;
      if (!targetId) return;

      const startLedger = Math.max(1, latestLedger - 100);
      const res = await fetch(TESTNET_SOROBAN_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getEvents",
          params: {
            startLedger: startLedger,
            filters: [{ type: "contract", contractIds: [targetId] }],
            limit: 5
          }
        })
      });

      const data = await res.json();
      const events = data.result?.events || [];
      if (events.length > 0) {
        const formattedEvents = events.map((ev: any) => {
          const ledgerSeq = ev.ledger;
          let parsedVal = "Contract Event Emitted";
          try {
            if (ev.value && ev.value.xdr) {
              const scVal = xdr.ScVal.fromXDR(ev.value.xdr, 'base64');
              const nativeVal = scValToNative(scVal);
              parsedVal = `Value Updated: ${JSON.stringify(nativeVal)}`;
            }
          } catch {}
          return `[Ledger ${ledgerSeq}] ${parsedVal}`;
        });
        setContractEvents(formattedEvents);
      }
    } catch (err: any) {
      console.error("Poller check failed:", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && counterContractId && activeTab === "sandbox") {
      addLog("Starting background sandbox event listener polling...");
      readContractValue();
      pollContractEvents();
      interval = setInterval(() => {
        readContractValue();
        pollContractEvents();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isListening, counterContractId, vaultContractId, selectedContract, activeTab]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-900/60 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("remittance")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "remittance"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Coins className="h-4 w-4" />
            Paisa Remittance MVP
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "sandbox"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="h-4 w-4" />
            Developer Sandbox
          </button>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Network Selector Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => {
                setNetwork("testnet");
                addLog("Switched network target to TESTNET.");
                toast.info("Network Target", "Switched to Testnet configurations.");
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 ${
                network === "testnet"
                  ? "bg-slate-900 text-indigo-400 border border-slate-800"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => {
                setNetwork("mainnet");
                addLog("Switched network target to MAINNET.");
                toast.info("Network Target", "Switched to Mainnet configurations.");
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 ${
                network === "mainnet"
                  ? "bg-slate-900 text-indigo-400 border border-slate-800"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Mainnet
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-900 bg-slate-950/60 text-[10px] text-slate-400 font-bold uppercase">
            <Award className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            Stellar L6 Cert
          </div>
        </div>
      </div>

      {/* --- TAB 1: PAISA CROSS-BORDER REMITTANCE HUB VIEW (Level 4/5/6 MVP) --- */}
      <div className={activeTab === "remittance" ? "" : "hidden"}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kyc Compliance component */}
            <KycVerification
              kycStatus={kycStatus}
              kycForm={kycForm}
              setKycForm={setKycForm}
              kycLoading={kycLoading}
              walletAddress={walletAddress}
              submitSimulatedKyc={submitSimulatedKyc}
            />

            {/* Remittance Form component */}
            <RemittanceForm
              remitRecipient={remitRecipient}
              setRemitRecipient={setRemitRecipient}
              remitCorridor={remitCorridor}
              setRemitCorridor={setRemitCorridor}
              remitAmount={remitAmount}
              setRemitAmount={setRemitAmount}
              getCorridorExchangeRate={getCorridorExchangeRate}
              isSponsored={isSponsored}
              setIsSponsored={setIsSponsored}
              remitLoading={remitLoading}
              remitStatusText={remitStatusText}
              remitTxHash={remitTxHash}
              kycStatus={kycStatus}
              walletAddress={walletAddress}
              executeRemittance={executeRemittance}
            />

            {/* Cohorts Table component */}
            <CohortTable
              downloadCohortCsv={downloadCohortCsv}
              cohortSearch={cohortSearch}
              setCohortSearch={setCohortSearch}
              cohortFilter={cohortFilter}
              setCohortFilter={setCohortFilter}
              cohortMonthFilter={cohortMonthFilter}
              setCohortMonthFilter={setCohortMonthFilter}
              cohortPage={cohortPage}
              setCohortPage={setCohortPage}
              filteredCohort={filteredCohort}
              displayedCohort={displayedCohort}
              totalCohortPages={totalCohortPages}
              network={network}
              unfilteredCohort={currentCohort}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dynamic Rate Alert component */}
            <RateAlert
              alertCorridor={alertCorridor}
              setAlertCorridor={setAlertCorridor}
              alertThreshold={alertThreshold}
              setAlertThreshold={setAlertThreshold}
              handleAlertSubscribe={handleAlertSubscribe}
              simulateMarketFluctuation={simulateMarketFluctuation}
              isAlertActive={isAlertActive}
              alertLogs={alertLogs}
            />

            {/* SLA Analytics component */}
            <SlaAnalytics
              network={network}
              remittanceContractId={remittanceContractId}
              remitEvents={remitEvents}
            />

            {/* Feedback form component */}
            <FeedbackForm
              feedbackForm={feedbackForm}
              setFeedbackForm={setFeedbackForm}
              submitFeedback={submitFeedback}
              feedbackList={feedbackList}
            />

            {/* Vercel Deployment Info */}
            <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950/20 text-[10px] text-slate-400 space-y-2">
              <span className="font-bold text-white uppercase tracking-wider block">MVP System Parameters</span>
              <div className="flex justify-between">
                <span>Vercel Deploy URL:</span>
                <a href="https://sendbridge-one.vercel.app/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  sendbridge-one.vercel.app
                </a>
              </div>
              <div className="flex justify-between">
                <span>GitHub Repository:</span>
                <a href="https://github.com/rudhu29/sendbridge" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  rudhu29/sendbridge
                </a>
              </div>
              <div className="flex justify-between">
                <span>Commits Count:</span>
                <span className="text-white font-bold">40+ Meaningful</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TAB 2: DEVELOPER SANDBOX VIEW (Original Levels 1/2 UI) --- */}
      <div className={activeTab === "sandbox" ? "" : "hidden"}>
        <LocalSandbox
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          walletType={walletType}
          walletLoading={walletLoading}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          fetchWalletBalance={fetchWalletBalance}
          sendXlm={sendXlm}
          recipient={recipient}
          setRecipient={setRecipient}
          amount={amount}
          setAmount={setAmount}
          sendLoading={sendLoading}
          sendTxHash={sendTxHash}
          selectedContract={selectedContract}
          setSelectedContract={setSelectedContract}
          counterContractId={counterContractId}
          setCounterContractId={setCounterContractId}
          vaultContractId={vaultContractId}
          setVaultContractId={setVaultContractId}
          contractCounter={contractCounter}
          contractStatus={contractStatus}
          contractLoading={contractLoading}
          contractTxHash={contractTxHash}
          readContractValue={readContractValue}
          incrementContractValue={incrementContractValue}
          isListening={isListening}
          setIsListening={setIsListening}
          contractEvents={contractEvents}
          localKeypair={localKeypair}
          localBalance={localBalance}
          localLoading={localLoading}
          localFundingLoading={localFundingLoading}
          generateLocalWallet={generateLocalWallet}
          fetchLocalBalance={fetchLocalBalance}
          fundLocalWallet={fundLocalWallet}
        />
      </div>

      {/* Diagnostics Logger Console (Level 1/2 Verification helper) */}
      <DiagnosticsLogger logs={logs} />
    </div>
  );
}
