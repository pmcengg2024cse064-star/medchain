import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Dna, 
  BarChart2, 
  HeartPulse, 
  Lock, 
  ShieldCheck, 
  Database, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  FileCheck,
  CheckCircle
} from 'lucide-react';

export default function ProcessPipelineModal({ type, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const analysisSteps = [
    {
      title: "1. Biometric Vector Normalization",
      desc: "Standardizing patient-donor BMI, age differential, HLA typing, and organ health scores.",
      icon: Dna,
      color: "from-cyan-500 to-indigo-500",
      detail: "Scaling 10 clinical features using robust standard scaler transform"
    },
    {
      title: "2. Ensemble Gradient Boosting Inference",
      desc: "Executing 100 decision trees to evaluate post-transplant survival probabilities.",
      icon: Cpu,
      color: "from-indigo-500 to-cyan-400",
      detail: "Model loss optimization: log-loss baseline minimization"
    },
    {
      title: "3. SHAP Feature Attribution Weighting",
      desc: "Calculating Shapley values to extract top clinical feature importances for explainability.",
      icon: BarChart2,
      color: "from-cyan-400 to-emerald-400",
      detail: "Quantifying marginal feature contributions across cohort data"
    },
    {
      title: "4. Kaplan-Meier & DeepSurv Hazard Ratios",
      desc: "Projecting 60-month survival probabilities and Cox proportional hazard risk ratios.",
      icon: HeartPulse,
      color: "from-emerald-400 to-emerald-500",
      detail: "Generating milestone survival curves for 1, 3, and 5 years"
    }
  ];

  const mintingSteps = [
    {
      title: "1. Keccak256 Cryptographic Hashing",
      desc: "Hashing patient ID, donor ID, organ type, and AI confidence score tuple with Keccak256.",
      icon: Lock,
      color: "from-cyan-500 to-indigo-500",
      detail: "Computing SHA-3 keccak digest string on client environment"
    },
    {
      title: "2. PBFT Peer Endorsement Collection",
      desc: "Broadcasting match tuple across 5 Hospital Consortium Nodes for digital mTLS signatures.",
      icon: ShieldCheck,
      color: "from-indigo-500 to-cyan-400",
      detail: "Collecting consensus votes from Johns Hopkins, Mayo Clinic & Mass General"
    },
    {
      title: "3. EVM Smart Contract State Execution",
      desc: "Executing mintMatchRecord on MedChainLedger.sol and mining transaction to block.",
      icon: Database,
      color: "from-cyan-400 to-emerald-400",
      detail: "Writing immutable state payload & emitting MatchMinted event"
    },
    {
      title: "4. ERC-721 NFT Digital Twin Generation",
      desc: "Minting scannable QR code, unique token ID, and PDF-exportable certificate.",
      icon: Award,
      color: "from-emerald-400 to-emerald-500",
      detail: "Finalizing cryptographic provenance certificate & digital twin"
    }
  ];

  const steps = type === 'minting' ? mintingSteps : analysisSteps;
  const isFinished = currentStep === steps.length - 1 && progress >= 100;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    setCurrentStep(0);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          let reachedEnd = false;
          setCurrentStep(c => {
            if (c < steps.length - 1) {
              return c + 1;
            } else {
              reachedEnd = true;
              return c;
            }
          });
          if (reachedEnd) {
            clearInterval(interval);
            return 100;
          }
          return 0;
        }
        return prev + 10;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  // Auto-close modal 1.2s after completion to reveal the output certificate/results
  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onClose]);

  if (!isOpen) return null;

  const safeIndex = Math.min(Math.max(0, currentStep), steps.length - 1);
  const activeStepObj = steps[safeIndex] || steps[0];
  const StepIcon = activeStepObj.icon || Cpu;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40 bg-slate-950/95 shadow-2xl space-y-6 glow-cyan relative overflow-hidden text-left"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30 glow-cyan">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                {type === 'minting' ? 'EVM Blockchain Workflow' : 'AI Matching Workflow'}
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {type === 'minting' ? 'Smart Contract Minting Pipeline' : 'DeepSurv AI Analysis Pipeline'}
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-slate-900 text-cyan-300 border border-slate-800">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* 4-Step Stepper Progress Bar Row */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((st, idx) => {
            const isDone = idx < currentStep || (idx === currentStep && progress >= 100);
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-200 bg-gradient-to-r ${
                      isDone ? 'from-emerald-500 to-cyan-400 w-full' :
                      isCurrent ? 'from-cyan-500 to-indigo-500' : 'w-0'
                    }`}
                    style={{ width: isCurrent ? `${progress}%` : isDone ? '100%' : '0%' }}
                  />
                </div>
                <span className={`text-[10px] font-bold block text-center truncate ${
                  isDone ? 'text-emerald-400' : isCurrent ? 'text-cyan-300 font-extrabold' : 'text-slate-600'
                }`}>
                  Stage {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Stage Animated Card */}
        <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 bg-slate-900/90 relative overflow-hidden space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg text-white">
              <StepIcon className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">{activeStepObj.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeStepObj.desc}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Technical Details:</span>
            <span className="text-cyan-300 font-semibold">{activeStepObj.detail}</span>
          </div>
        </div>

        {/* Finished Success Banner & Action Button */}
        <div className="flex items-center justify-between pt-2">
          {isFinished ? (
            <>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>
                  {type === 'minting' 
                    ? 'EVM Block Mined & Certificate Generated!' 
                    : 'AI Inference Completed Successfully!'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg glow-emerald"
              >
                <span>View Output Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Pipeline ({progress}%)...</span>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
