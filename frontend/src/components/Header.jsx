import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Cpu, 
  Network, 
  Stethoscope, 
  BarChart2, 
  Blocks,
  GitMerge
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  isChecking, 
  onSelectPreset, 
  onRefreshStatus 
}) {
  const tabs = [
    { id: 'network', label: 'Consortium Network', icon: Network, badge: '5 Nodes' },
    { id: 'clinical', label: 'Clinical Match Engine', icon: Stethoscope, badge: 'Inputs' },
    { id: 'analytics', label: 'DeepSurv Analytics', icon: BarChart2, badge: 'SHAP + KM' },
    { id: 'blockchain', label: 'Smart Contract Ledger', icon: Blocks, badge: 'EVM NFT' },
    { id: 'global-graph', label: 'Global Graph Matching', icon: GitMerge, badge: 'Phase 2' },
  ];


  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-800 px-4 sm:px-6 py-4 mb-8 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 rounded-2xl shadow-lg shadow-indigo-500/20 animate-pulse flex-shrink-0">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  AI-Driven Organ Matching and Transplantation System for Donor-Recipient Matching and Survival Outcomes
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Organ Allocation &bull; DeepSurv Analytics &bull; Hyperledger &amp; EVM Provenance
              </p>
            </div>
          </div>

          {/* Presets & Connectivity */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="font-semibold text-slate-400 px-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Presets:
              </span>
              <button
                onClick={() => onSelectPreset('optimal')}
                className="px-2.5 py-1 font-medium bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all"
              >
                Optimal
              </button>
              <button
                onClick={() => onSelectPreset('marginal')}
                className="px-2.5 py-1 font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
              >
                Marginal
              </button>
              <button
                onClick={() => onSelectPreset('highrisk')}
                className="px-2.5 py-1 font-medium bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all"
              >
                High Risk
              </button>
            </div>

            {/* Status Dot Indicator */}
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800"
                aria-label="System status indicator"
              >
                <span className="relative flex h-2.5 w-2.5">
                  {isConnected ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm shadow-rose-500/50" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Multi-Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 via-indigo-950 to-slate-900 text-cyan-300 border-cyan-400/50 shadow-lg glow-cyan scale-[1.02]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
