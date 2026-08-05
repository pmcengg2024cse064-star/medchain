import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ConsortiumNetwork from './components/ConsortiumNetwork';
import ClinicalForm from './components/ClinicalForm';
import DeepSurvAnalytics from './components/DeepSurvAnalytics';
import BlockchainLedger from './components/BlockchainLedger';
import GlobalGraphTab from './components/GlobalGraphTab';

// Preset Vectors
const PRESETS = {
  optimal: {
    Predicted_Survival_Chance: 0.92,
    RealTime_Organ_HealthScore: 95.0,
    Blood_Compatible: 1,
    Organ_Match: 5,
    Patient_Age: 35.0,
    Donor_Age: 32.0,
    Organ_Condition_Score: 9,
    Abs_Age_Diff: 3.0,
    Patient_BMI: 22.5,
    Donor_Weight: 72.0,
  },
  marginal: {
    Predicted_Survival_Chance: 0.72,
    RealTime_Organ_HealthScore: 72.0,
    Blood_Compatible: 1,
    Organ_Match: 3,
    Patient_Age: 58.0,
    Donor_Age: 62.0,
    Organ_Condition_Score: 6,
    Abs_Age_Diff: 4.0,
    Patient_BMI: 28.4,
    Donor_Weight: 85.0,
  },
  highrisk: {
    Predicted_Survival_Chance: 0.55,
    RealTime_Organ_HealthScore: 52.0,
    Blood_Compatible: 0,
    Organ_Match: 1,
    Patient_Age: 68.0,
    Donor_Age: 75.0,
    Organ_Condition_Score: 4,
    Abs_Age_Diff: 7.0,
    Patient_BMI: 34.2,
    Donor_Weight: 98.0,
  }
};

const DEFAULT_FORM = PRESETS.optimal;

export default function App() {
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'clinical' | 'analytics' | 'blockchain'
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [survivalData, setSurvivalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE !== undefined 
    ? import.meta.env.VITE_API_BASE 
    : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

  // Check Backend Connectivity
  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Fetch Kaplan-Meier Baseline Data
  const fetchSurvivalCurve = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/survival-curve`);
      if (res.ok) {
        const data = await res.json();
        setSurvivalData(data);
      }
    } catch (err) {
      setSurvivalData({
        median_survival_days_cohort: 1845,
        survival_milestones: { "1_year": 0.92, "3_year": 0.81, "5_year": 0.74 }
      });
    }
  };

  useEffect(() => {
    checkHealth();
    fetchSurvivalCurve();
  }, []);

  // Submit Clinical Vector to API
  const handleSubmit = async (shouldNavigate = true) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/predict-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setIsConnected(true);
    } catch (err) {
      console.warn('API offline, generating client-side preview calculation');
      setIsConnected(false);

      const matchScore = Math.min(99, Math.max(10, Math.round(
        (formData.RealTime_Organ_HealthScore * 0.35) +
        (formData.Organ_Match * 8) +
        (formData.Blood_Compatible * 20) +
        (formData.Predicted_Survival_Chance * 20) -
        (formData.Abs_Age_Diff * 0.3)
      )));

      const survivalRate = Math.min(98, Math.max(15, Math.round(matchScore * 0.88 + 5)));

      setResult({
        match_confidence_score: matchScore,
        predicted_5yr_survival_rate: survivalRate,
        status: matchScore >= 70 ? 'APPROVED' : 'REJECTED_BY_AI',
        top_feature_importance: {
          Donor_Weight: 0.2079,
          Patient_BMI: 0.1639,
          RealTime_Organ_HealthScore: 0.1455,
          Predicted_Survival_Chance: 0.1204,
          Patient_Age: 0.1190
        }
      });
    } finally {
      setIsLoading(false);
      if (shouldNavigate) {
        setActiveTab('analytics');
      }
    }
  };

  // Run initial background prediction on load without forcing tab switch
  useEffect(() => {
    handleSubmit(false);
  }, []);

  const handleSelectPreset = (key) => {
    if (PRESETS[key]) {
      setFormData(PRESETS[key]);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header & Multi-Tab Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        isChecking={isChecking}
        onSelectPreset={handleSelectPreset}
        onRefreshStatus={checkHealth}
      />

      {/* Main Multi-Tab Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        
        {/* Offline Warning Banner if API disconnected */}
        {!isConnected && (
          <div className="mb-6 bg-amber-950/60 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                <strong>Backend Server Notice:</strong> Running in simulated preview mode. Start FastAPI on <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-100 font-mono">http://127.0.0.1:8000</code> for live model inference.
              </span>
            </div>
            <button
              onClick={checkHealth}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg border border-amber-500/40 font-semibold transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Animated Multi-Tab Switching with Framer Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Tab 1: Consortium Network Map */}
            {activeTab === 'network' && <ConsortiumNetwork />}

            {/* Tab 2: Clinical Vector Inputs */}
            {activeTab === 'clinical' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
                  <span>Input clinical parameters below and click "Evaluate Organ Allocation".</span>
                  <button
                    onClick={() => handleSubmit(true)}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all"
                  >
                    Evaluate &amp; View Analytics &rarr;
                  </button>
                </div>
                <ClinicalForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={() => handleSubmit(true)}
                  isLoading={isLoading}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Tab 3: DeepSurv Analytics & SHAP + Kaplan-Meier */}
            {activeTab === 'analytics' && (
              <DeepSurvAnalytics
                result={result}
                survivalData={survivalData}
                isLoading={isLoading}
                onNavigateToBlockchain={() => setActiveTab('blockchain')}
              />
            )}

            {/* Tab 4: Smart Contract Ledger & NFT Certificate */}
            {activeTab === 'blockchain' && (
              <BlockchainLedger result={result} formData={formData} />
            )}

            {/* Tab 5: Global Graph Matching (Phase 2) */}
            {activeTab === 'global-graph' && (
              <GlobalGraphTab isConnected={isConnected} API_BASE={API_BASE} />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AuraChain AI Executive Dashboard &copy; 2026. Built with Hardhat, Solidity, ethers.js, Framer Motion, FastAPI &amp; React Vite.</p>
      </footer>
    </div>
  );
}
