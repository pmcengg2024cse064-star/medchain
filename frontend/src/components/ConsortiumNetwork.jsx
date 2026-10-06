import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Server, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  Zap, 
  Radio, 
  Database,
  Lock,
  Layers
} from 'lucide-react';

export default function ConsortiumNetwork() {
  const [selectedNode, setSelectedNode] = useState('HOS-01');

  // 5 Hospital Consortium Nodes
  const nodes = [
    { id: 'HOS-01', name: 'Johns Hopkins Organ Center', loc: 'Baltimore, MD', x: 200, y: 100, ping: '14ms', blocks: 14892, status: 'ONLINE', peers: 12, cpu: '22%' },
    { id: 'HOS-02', name: 'Mayo Clinic Transplant Hub', loc: 'Rochester, MN', x: 500, y: 80, ping: '18ms', blocks: 14890, status: 'ONLINE', peers: 12, cpu: '28%' },
    { id: 'HOS-03', name: 'Mass General Allocation Node', loc: 'Boston, MA', x: 750, y: 190, ping: '12ms', blocks: 14892, status: 'ONLINE', peers: 12, cpu: '19%' },
    { id: 'HOS-04', name: 'Stanford Medical Blockchain', loc: 'Palo Alto, CA', x: 180, y: 340, ping: '24ms', blocks: 14889, status: 'ONLINE', peers: 12, cpu: '34%' },
    { id: 'HOS-05', name: 'Cleveland Clinic FedNet', loc: 'Cleveland, OH', x: 580, y: 320, ping: '16ms', blocks: 14892, status: 'ONLINE', peers: 12, cpu: '25%' },
  ];

  // Interconnection links between nodes
  const connections = [
    { from: 'HOS-01', to: 'HOS-02', delay: 0 },
    { from: 'HOS-02', to: 'HOS-03', delay: 0.5 },
    { from: 'HOS-03', to: 'HOS-05', delay: 1.0 },
    { from: 'HOS-05', to: 'HOS-04', delay: 1.5 },
    { from: 'HOS-04', to: 'HOS-01', delay: 2.0 },
    { from: 'HOS-01', to: 'HOS-05', delay: 0.8 },
    { from: 'HOS-02', to: 'HOS-04', delay: 1.2 },
  ];

  const getNodeById = (id) => nodes.find(n => n.id === id);

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Live Badge */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl bg-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 glow-cyan">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">Consortium Federated Network</h2>
              {/* Blinking Live Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 glow-emerald">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                🔴 LIVE: Hyperledger Fabric Network
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              5 Enterprise Hospital Peers &bull; PBFT Consensus &bull; Zero-Knowledge Encrypted Organ Vector Synchronization
            </p>
          </div>
        </div>

        {/* Global Network Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Active Peers</span>
            <span className="text-cyan-400 font-bold text-sm">5 / 5 Nodes</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Network Latency</span>
            <span className="text-emerald-400 font-bold text-sm">16.8 ms avg</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Block Height</span>
            <span className="text-indigo-400 font-bold text-sm">#14,892</span>
          </div>
        </div>
      </div>

      {/* Network Map & Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Visual Map Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-950/90 relative overflow-hidden min-h-[480px]">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Peer Topology &amp; Packet Flow
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Topology: Multi-Region Mesh &bull; TLS 1.3
            </span>
          </div>

          {/* Animated Map SVG Canvas */}
          <div className="relative w-full h-[380px] bg-slate-900/40 rounded-xl border border-slate-800/80 overflow-hidden">
            <svg className="w-full h-full absolute inset-0">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Connection Lines */}
              {connections.map((conn, idx) => {
                const nodeA = getNodeById(conn.from);
                const nodeB = getNodeById(conn.to);
                if (!nodeA || !nodeB) return null;

                return (
                  <g key={idx}>
                    {/* Background Static Line */}
                    <line
                      x1={`${(nodeA.x / 900) * 100}%`}
                      y1={`${(nodeA.y / 420) * 100}%`}
                      x2={`${(nodeB.x / 900) * 100}%`}
                      y2={`${(nodeB.y / 420) * 100}%`}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    
                    {/* Glowing Active Connection Line */}
                    <line
                      x1={`${(nodeA.x / 900) * 100}%`}
                      y1={`${(nodeA.y / 420) * 100}%`}
                      x2={`${(nodeB.x / 900) * 100}%`}
                      y2={`${(nodeB.y / 420) * 100}%`}
                      stroke="url(#lineGrad)"
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                    />

                    {/* Animated Data Packets Traveling Along Lines */}
                    <motion.circle
                      r="4"
                      fill="#06b6d4"
                      filter="url(#glow)"
                      initial={{
                        cx: `${(nodeA.x / 900) * 100}%`,
                        cy: `${(nodeA.y / 420) * 100}%`
                      }}
                      animate={{
                        cx: [
                          `${(nodeA.x / 900) * 100}%`,
                          `${(nodeB.x / 900) * 100}%`
                        ],
                        cy: [
                          `${(nodeA.y / 420) * 100}%`,
                          `${(nodeB.y / 420) * 100}%`
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: conn.delay
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hospital Node Badges overlay */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  style={{
                    left: `${(node.x / 900) * 100}%`,
                    top: `${(node.y / 420) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute cursor-pointer group z-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 p-2 rounded-2xl border transition-all shadow-xl backdrop-blur-md ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-white glow-cyan scale-110'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                      <Server className="w-4 h-4" />
                    </div>
                    <div className="text-left pr-1 hidden sm:block">
                      <span className="text-xs font-black block leading-none">{node.id}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[110px] block mt-0.5 font-sans">
                        {node.name.split(' ')[0]}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Telemetry Card (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {nodes.map(node => {
            if (node.id !== selectedNode) return null;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-slate-950/90 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                      Peer Telemetry Inspector
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{node.name}</h3>
                    <p className="text-xs text-slate-400">{node.loc}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Node Status</span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {node.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Roundtrip Ping</span>
                    <span className="text-cyan-300 font-mono font-bold block mt-1">{node.ping}</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Blocks Committed</span>
                    <span className="text-indigo-300 font-mono font-bold block mt-1">#{node.blocks}</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">CPU Utilization</span>
                    <span className="text-amber-300 font-mono font-bold block mt-1">{node.cpu}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Consensus State:</span>
                    <span className="text-cyan-400 font-mono font-semibold">PBFT Agreement</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Encrypted Channels:</span>
                    <span className="text-emerald-400 font-mono font-semibold">mTLS Active</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Chaincode Version:</span>
                    <span className="text-slate-200 font-mono">medchain-cc:v3.2</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center font-mono pt-1">
                  Click any node badge on the network map to inspect peer telemetry.
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
