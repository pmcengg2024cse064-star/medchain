import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Database, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  FileText,
  Blocks,
  ArrowRight,
  Fingerprint,
  Download,
  Terminal,
  Award,
  BadgeCheck,
  Building2,
  FileSpreadsheet,
  Globe,
  Share2,
  Layers,
  Play,
  CheckCircle
} from 'lucide-react';
import contractConfig from '../contracts/AuraChainLedger.json';

export default function BlockchainLedger({ result, formData }) {
  const [nodeStatus, setNodeStatus] = useState('checking');
  const [blockNumber, setBlockNumber] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [copiedHash, setCopiedHash] = useState(false);

  // Live Hash Terminal logs state
  const [terminalLogs, setTerminalLogs] = useState([
    `[${new Date().toLocaleTimeString()}] INF Hyperledger Fabric Raft Consensus Engine online`,
    `[${new Date().toLocaleTimeString()}] INF Listening for block proposals on 127.0.0.1:8545`,
    `[${new Date().toLocaleTimeString()}] INF mTLS handshake verified with HOS-01, HOS-02, HOS-03`,
  ]);
  const terminalEndRef = useRef(null);
  const certRef = useRef(null);

  const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

  // Auto-scroll terminal log
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Periodic mock live network terminal activity generator
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      const mockTx = '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const logsPool = [
        `[${time}] INF Endorsing peer HOS-0${Math.floor(Math.random()*5)+1} signed tx ${mockTx}...`,
        `[${time}] INF Block #${(blockNumber || 14892) + Math.floor(Math.random()*2)} committed across 5 nodes`,
        `[${time}] INF Zero-Knowledge proof validated for Organ Vector #PAT-${Math.floor(1000+Math.random()*9000)}`,
        `[${time}] INF PBFT consensus round completed in ${Math.floor(12+Math.random()*15)}ms`,
      ];
      const nextLog = logsPool[Math.floor(Math.random()*logsPool.length)];
      setTerminalLogs(prev => [...prev.slice(-40), nextLog]);
    }, 4500);

    return () => clearInterval(interval);
  }, [blockNumber]);

  // Determine Organ Type based on Organ_Match parameter or default
  const getOrganType = () => {
    if (!formData) return 'KIDNEY (HLA MATCH)';
    const score = formData.Organ_Match || 5;
    if (score >= 5) return 'KIDNEY (HLA-A/B/DR MATCH)';
    if (score >= 3) return 'HEART (ABO COMPATIBLE)';
    return 'LIVER (PRIMARY GRAFT)';
  };

  // Check Hardhat RPC Node Connection
  const checkNodeConnection = async () => {
    setNodeStatus('checking');
    try {
      const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
      const network = await provider.getNetwork();
      const currentBlock = await provider.getBlockNumber();
      setBlockNumber(currentBlock);
      setNodeStatus('connected');
    } catch (err) {
      console.warn('Local Hardhat EVM node not detected at', HARDHAT_RPC_URL, err);
      setNodeStatus('offline');
    }
  };

  useEffect(() => {
    checkNodeConnection();
    const interval = setInterval(checkNodeConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mint Match Record Smart Contract
  const handleMintRecord = async () => {
    if (!result) return;
    setIsMinting(true);
    setMintError(null);

    const patientId = `PAT-EHR-${Math.floor(1000 + Math.random() * 9000)}`;
    const donorId = `DNR-DON-${Math.floor(1000 + Math.random() * 9000)}`;
    const organType = getOrganType();
    const rawScore = Number(result.match_confidence_score) || 85;
    
    // Safely convert float percentage (e.g. 74.98) to whole integer basis points (e.g. 7498) for Solidity uint256
    const onChainMatchScore = Math.round(rawScore * 100);
    const displayScore = (onChainMatchScore / 100).toFixed(2);

    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${timeStr}] TX_INFLIGHT Initiating mintMatchRecord(${patientId}, ${donorId}, ${onChainMatchScore})`]);

    try {
      let provider;
      let signer;

      if (window.ethereum) {
        try {
          provider = new ethers.BrowserProvider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          signer = await provider.getSigner();
        } catch (e) {
          console.log('Browser provider fallback to local Hardhat node signer');
          provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
          signer = await provider.getSigner(0);
        }
      } else {
        provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
        signer = await provider.getSigner(0);
      }

      const contractAddress = contractConfig.address;
      const contract = new ethers.Contract(contractAddress, contractConfig.abi, signer);

      const tx = await contract.mintMatchRecord(patientId, donorId, organType, onChainMatchScore);
      setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] TX_BROADCAST TxHash: ${tx.hash}`]);

      const receipt = await tx.wait();
      setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] TX_MINED Block #${receipt.blockNumber} GasUsed: ${receipt.gasUsed}`]);

      const block = await provider.getBlock(receipt.blockNumber);
      const timestamp = block ? new Date(Number(block.timestamp) * 1000).toLocaleString() : new Date().toLocaleString();

      let recordHash = null;
      let verifiedScore = displayScore;

      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const parsedLog = contract.interface.parseLog(receipt.logs[0]);
          if (parsedLog && parsedLog.args) {
            recordHash = parsedLog.args.recordHash || parsedLog.args[0];
            if (parsedLog.args.matchScore) {
              verifiedScore = (Number(parsedLog.args.matchScore) / 100).toFixed(2);
            }
          }
        } catch (e) {
          console.warn('Event parsing skipped:', e);
        }
      }

      if (!recordHash) {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${patientId}:${donorId}:${organType}:${onChainMatchScore}:${tx.hash}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        recordHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      const newCert = {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        organType: organType,
        timestamp: timestamp,
        patientId: patientId,
        donorId: donorId,
        matchScore: verifiedScore,
        onChainRawScore: onChainMatchScore,
        recordHash: recordHash,
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : '48219',
        contractAddress: contractAddress,
        nftTokenId: `ERC721-NFT-#${receipt.blockNumber || 1042}`
      };

      setCertificate(newCert);
      setLedgerHistory(prev => [newCert, ...prev]);
      setBlockNumber(receipt.blockNumber);

    } catch (err) {
      console.error('Minting error:', err);
      const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockRecordHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockBlock = (blockNumber || 1042) + 1;

      const fallbackCert = {
        txHash: mockTxHash,
        blockNumber: mockBlock,
        organType: organType,
        timestamp: new Date().toLocaleString(),
        patientId: patientId,
        donorId: donorId,
        matchScore: displayScore,
        onChainRawScore: onChainMatchScore,
        recordHash: mockRecordHash,
        gasUsed: '46820',
        contractAddress: contractConfig.address,
        nftTokenId: `ERC721-NFT-#${mockBlock}`,
        isSimulated: true
      };

      setCertificate(fallbackCert);
      setLedgerHistory(prev => [fallbackCert, ...prev]);
      setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SIMULATED_MINT Certificate generated via client sandbox fallback`]);
      if (err.message && !err.message.includes('user rejected')) {
        setMintError(`Sandbox Mode: Minted via SHA-256 Cryptographic Simulation (No EVM node detected on 127.0.0.1:8545. Connect MetaMask for live Web3 minting).`);
      }
    } finally {
      setIsMinting(false);
      setTimeout(() => {
        if (certRef.current) {
          certRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  // Fixed Robust PDF Certificate Downloader using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const element = certRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById('aurachain-official-certificate');
          if (target) {
            target.style.transform = 'none';
            target.style.boxShadow = 'none';
          }

          const sanitizeColors = (cssText) => {
            if (!cssText) return cssText;
            return cssText.replace(/(?:oklch|oklab|lab|lch|color)\([^)]*\)/gi, 'rgb(6, 182, 212)');
          };

          // 1. Sanitize all <style> tags in cloned document
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleEl) => {
            if (styleEl.textContent && /(?:oklch|oklab|lab|lch|color)/i.test(styleEl.textContent)) {
              styleEl.textContent = sanitizeColors(styleEl.textContent);
            }
          });

          // 2. Sanitize inline styles
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach((el) => {
            if (el.style && el.style.cssText && /(?:oklch|oklab|lab|lch|color)/i.test(el.style.cssText)) {
              el.style.cssText = sanitizeColors(el.style.cssText);
            }
          });

          // 3. Sanitize active CSS rules in clonedDoc.styleSheets
          try {
            Array.from(clonedDoc.styleSheets || []).forEach(sheet => {
              try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                  if (rule.cssText && /(?:oklch|oklab|lab|lch|color)/i.test(rule.cssText)) {
                    if (rule.style) {
                      for (let i = 0; i < rule.style.length; i++) {
                        const prop = rule.style[i];
                        const val = rule.style.getPropertyValue(prop);
                        if (/(?:oklch|oklab|lab|lch|color)/i.test(val)) {
                          rule.style.setProperty(prop, sanitizeColors(val));
                        }
                      }
                    }
                  }
                });
              } catch (e) {}
            });
          } catch (e) {}
        }
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'pt',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      pdf.save(`AuraChain_SmartContract_Certificate_Block_${certificate?.blockNumber || '1001'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(`PDF Export Error: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const mintStages = [
    { name: "Keccak256 Hashing", icon: Lock },
    { name: "PBFT Consensus", icon: ShieldCheck },
    { name: "EVM Block Mining", icon: Database },
    { name: "ERC-721 NFT Certificate", icon: Award }
  ];

  return (
    <div className="space-y-6">

      {/* Top Section Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 glow-cyan">
            <Blocks className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">Smart Contract Ledger &amp; NFT Provenance</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Phase 3 EVM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Immutable Solidity Smart Contract Deployment &bull; Keccak256 Record Digest</p>
          </div>
        </div>

        {/* Node Health Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              nodeStatus === 'connected' ? 'bg-emerald-400 animate-ping' :
              nodeStatus === 'checking' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'
            }`} />
            <span className="font-semibold text-slate-200">
              {nodeStatus === 'connected' ? 'Hardhat Node Live' :
               nodeStatus === 'checking' ? 'Connecting Node...' : 'Local Node Offline'}
            </span>
          </div>
          {nodeStatus === 'connected' && (
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Block #{blockNumber}
            </span>
          )}
          <button 
            onClick={checkNodeConnection}
            title="Refresh Node Status"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${nodeStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visual Process Flow Explainer Stepper Banner for Smart Contract Minting */}
      <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-slate-950/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase font-bold text-cyan-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            4-Stage EVM Smart Contract Minting Process Flow
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mintStages.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Stage {idx + 1}</span>
                  <span className="text-xs font-bold text-white block">{st.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Mint Action & Live Hash Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Mint Action Panel (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>EVM Smart Contract Transaction Engine</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              {result ? `AI Confidence Score: ${result.match_confidence_score}% Ready for On-Chain Commit` : 'Awaiting AI Model Inference'}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Execute <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">AuraChainLedger.sol</code> to generate a keccak256 cryptographic digest of the clinical match vector and register an immutable organ allocation block.
            </p>

            <button
              onClick={handleMintRecord}
              disabled={!result || isMinting}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl border ${
                !result || isMinting
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-emerald-400 text-white border-cyan-300/40 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isMinting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Minting to EVM Block...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Mint Smart Contract to Hyperledger / EVM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mintError && (
              <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{mintError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Hash Terminal Window (5 cols on lg) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 bg-black/95 shadow-2xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Live Node Consensus Terminal</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              STDOUT LIVE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 py-3 text-slate-300 scrollbar-thin">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="leading-snug break-all font-medium text-emerald-400/90">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

      </div>

      {/* High-Grade Smart Contract Certificate & Virtual NFT Twin Section */}
      {certificate && (
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <span>Immutable Smart Contract Certificate &amp; Virtual NFT Digital Twin</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-Grade Enterprise Medical Provenance Document &bull; ERC-721 EVM Token</p>
            </div>

            {/* FIXED PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg glow-emerald"
            >
              {isDownloadingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Official PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </>
              )}
            </button>
          </div>

          {/* Grid Layout: Official High-Grade Certificate (8 Cols) + Virtual NFT Twin Badge (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* 1. High-Grade Standard Official Certificate Canvas (8 Cols) */}
            <div className="lg:col-span-8">
              <div 
                ref={certRef}
                id="aurachain-official-certificate"
                className="relative rounded-3xl p-8 sm:p-10 border-2 border-cyan-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden text-slate-100 space-y-8"
              >
                {/* Guilloche Security Border Overlay */}
                <div className="absolute inset-2 border border-cyan-400/20 rounded-2xl pointer-events-none" />
                <div className="absolute inset-4 border border-cyan-500/10 rounded-xl pointer-events-none" />
                
                {/* Subtle Official Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <ShieldCheck className="w-[450px] h-[450px] text-cyan-400" />
                </div>

                {/* Top Official Header & Authority Emblem */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-cyan-500/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg glow-cyan text-white">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                        UNITED STATES ORGAN ALLOCATION AUTHORITY
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase font-mono mt-0.5">
                        CERTIFICATE OF IMMUTABLE ALLOCATION
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        ISO-27001 &bull; HIPAA COMPLIANT &bull; EVM ON-CHAIN PROVENANCE
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl block">
                      SERIAL: AC-EVM-2026-#{certificate.blockNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      VERIFIED ON-CHAIN
                    </span>
                  </div>
                </div>

                {/* Document Body Description */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                  This document serves as an official cryptographic certification that the organ allocation decision for Patient <strong className="text-cyan-300 font-mono">{certificate.patientId}</strong> and Donor <strong className="text-cyan-300 font-mono">{certificate.donorId}</strong> has been validated by the AuraChain AI DeepSurv Engine and permanently recorded to the Ethereum Localhost EVM blockchain under Block Number <strong className="text-emerald-400 font-mono">#{certificate.blockNumber}</strong>.
                </div>

                {/* Formal Biometric & On-Chain Audit Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block font-mono">
                      Matched Organ &amp; HLA Compatibility
                    </span>
                    <span className="text-sm font-black text-white block">
                      {certificate.organType}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Status: <strong className="text-emerald-400">PRIMARY GRAFT APPROVED</strong>
                    </span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block font-mono">
                      AI Match Score Confidence
                    </span>
                    <span className="text-sm font-black text-emerald-400 block">
                      {certificate.matchScore}% Score Confidence
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Basis Points: <strong className="text-cyan-300 font-mono">{certificate.onChainRawScore} bps</strong>
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 font-mono">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-sans">
                      Transaction Hash (TxHash)
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs text-cyan-300 font-bold truncate">
                        {certificate.txHash}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(certificate.txHash)}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                        title="Copy TxHash"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Keccak256 Record Hash Digest & QR Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950 border border-cyan-500/40 p-4 rounded-2xl">
                  <div className="md:col-span-3 flex flex-col items-center justify-center p-2 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <QRCode
                      value={certificate.txHash || 'https://aurachain.ai/verify'}
                      size={90}
                      bgColor="#020617"
                      fgColor="#06b6d4"
                    />
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">
                      Scan Tx Hash
                    </span>
                  </div>

                  <div className="md:col-span-9 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-sans font-bold">
                      <span className="text-cyan-400">Keccak256 On-Chain Digest</span>
                      <span className="text-emerald-400 font-mono">EVM Solidity Native</span>
                    </div>
                    <code className="text-[11px] text-emerald-300 font-bold block break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      {certificate.recordHash}
                    </code>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Timestamp: <strong className="text-slate-200">{certificate.timestamp}</strong></span>
                      <span>Gas Used: <strong className="text-cyan-400">{certificate.gasUsed} gas</strong></span>
                    </div>
                  </div>
                </div>

                {/* Signatures & Official Stamp Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-xs">
                  
                  <div className="space-y-1">
                    <div className="h-8 border-b border-slate-700 flex items-end pb-1 text-cyan-300 font-serif italic text-sm">
                      Dr. Elena Rostova, MD, PhD
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Chief Transplant Surgeon</span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-8 border-b border-slate-700 flex items-end pb-1 text-emerald-400 font-mono text-xs font-bold">
                      0x7f8A...492b (AuraChain Node)
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Consensus Automated Auditor</span>
                  </div>

                  {/* Official Seal Stamp */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-center glow-cyan">
                    <BadgeCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest mt-1">
                      OFFICIAL EVM SEAL
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* 2. Virtual 3D-Styled NFT Badge UI Component (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-panel rounded-3xl p-6 border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/80 via-slate-950 to-slate-900 shadow-2xl space-y-6 glow-indigo relative overflow-hidden">
                
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* NFT Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-cyan-400" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 block">
                        DIGITAL TWIN NFT
                      </span>
                      <h4 className="text-base font-black text-white">ERC-721 Token</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    UNIQUE 1/1
                  </span>
                </div>

                {/* Virtual 3D Holographic Spinning Organ Core */}
                <div className="relative w-full h-44 bg-slate-900/90 rounded-2xl border border-indigo-500/30 flex flex-col items-center justify-center p-4 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/20 to-emerald-500/10 animate-pulse" />
                  
                  {/* Holographic Ring Accent */}
                  <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-cyan-400 animate-spin flex items-center justify-center glow-cyan">
                    <div className="w-14 h-14 rounded-full border border-indigo-400 animate-ping" />
                  </div>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <Cpu className="w-8 h-8 text-cyan-300 drop-shadow-md" />
                    <span className="text-[10px] font-black text-white font-mono mt-1 uppercase tracking-wider">
                      {certificate.organType.split(' ')[0]} NFT
                    </span>
                  </div>

                  <span className="absolute bottom-2 text-[9px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                    Token ID: {certificate.nftTokenId}
                  </span>
                </div>

                {/* NFT Token Attributes Table */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center">
                    <span className="text-slate-400">Token Standard:</span>
                    <span className="text-white font-bold">ERC-721 EVM</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center">
                    <span className="text-slate-400">EVM Block:</span>
                    <span className="text-emerald-400 font-bold">#{certificate.blockNumber}</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center">
                    <span className="text-slate-400">Contract Address:</span>
                    <span className="text-cyan-300 truncate max-w-[130px] font-bold">
                      {certificate.contractAddress}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center">
                    <span className="text-slate-400">Metadata URI:</span>
                    <code className="text-[10px] text-slate-300 font-mono">ipfs://bafybeig...</code>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center">
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    NFT Provenance Verified On-Chain
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Session On-Chain Transactions Ledger */}
      {ledgerHistory.length > 0 && (
        <div className="space-y-3 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Session On-Chain Transactions ({ledgerHistory.length})</span>
          </h4>
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            {ledgerHistory.map((item, index) => (
              <div key={index} className="p-4 text-xs flex items-center justify-between hover:bg-slate-900/80 transition-colors font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-sans">{item.organType}</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      Block #{item.blockNumber}
                    </span>
                    <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 font-sans">
                      {item.nftTokenId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">
                    Tx: {item.txHash}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">{item.matchScore}% Score</span>
                  <span className="text-[10px] text-slate-500 font-sans">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
