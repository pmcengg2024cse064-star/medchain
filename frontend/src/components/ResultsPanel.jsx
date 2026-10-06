import React from 'react';
import { ShieldCheck, ShieldAlert, Award, Activity, BarChart2, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function ResultsPanel({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] text-center border border-slate-800">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-indigo-500 border-b-emerald-400 border-l-transparent animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">AI Matching Inflight</h3>
        <p className="text-xs text-slate-400">Processing Gradient Boosting & Kaplan-Meier models...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] text-center border border-slate-800">
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4 text-slate-500">
          <Activity className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-300 mb-1">Awaiting Vector Submission</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Adjust the clinical vector parameters on the left and click "Evaluate Organ Allocation" to execute AI models.
        </p>
      </div>
    );
  }

  const { match_confidence_score, predicted_5yr_survival_rate, status, top_feature_importance } = result;
  const isApproved = status === 'APPROVED' || match_confidence_score >= 70;

  // Format feature importances for Recharts (Top 5)
  const chartData = Object.entries(top_feature_importance || {})
    .slice(0, 5)
    .map(([key, value]) => ({
      feature: key.replace(/_/g, ' '),
      importance: Number((value * 100).toFixed(2)),
      raw: value
    }));

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
      
      {/* Header Status Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Evaluation Results</h2>
            <p className="text-xs text-slate-400">Model Inference & SHAP Explainability Engine</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider border ${
          isApproved
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 glow-emerald'
            : 'bg-rose-950/80 text-rose-300 border-rose-500/40 glow-rose'
        }`}>
          {isApproved ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
          <span>{status || (isApproved ? 'APPROVED' : 'REJECTED_BY_AI')}</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Match Confidence Score */}
        <div className={`glass-card rounded-2xl p-5 relative overflow-hidden border transition-all ${
          isApproved ? 'border-emerald-500/30' : 'border-rose-500/30'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                AI Match Confidence
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-1 block">
                {match_confidence_score}%
              </span>
            </div>
            <div className={`p-3 rounded-xl ${isApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Activity className="w-6 h-6" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isApproved 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, match_confidence_score))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Threshold: &ge; 70.0%</span>
            <span className={isApproved ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {isApproved ? 'High Match' : 'Sub-Optimal Match'}
            </span>
          </p>
        </div>

        {/* 5-Year Survival Rate */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden border border-indigo-500/30">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                5-Year Survival Rate
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-1 block">
                {predicted_5yr_survival_rate}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, predicted_5yr_survival_rate))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Post-Transplant Expectancy</span>
            <span className="text-cyan-400 font-semibold">Kaplan-Meier Baseline</span>
          </p>
        </div>

      </div>

      {/* Feature Importances Recharts Horizontal Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Top 5 Clinical Feature Importances (SHAP)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> Gradient Boosting Weights
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value) => [`${value}%`, 'Importance Weight']}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
