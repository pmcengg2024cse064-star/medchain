import React from 'react';
import { Calendar, Clock, Activity } from 'lucide-react';

export default function SurvivalCurve({ survivalData }) {
  const milestones = survivalData?.survival_milestones || {
    "1_year": 0.92,
    "3_year": 0.81,
    "5_year": 0.74
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Cohort Kaplan-Meier Milestones</h3>
            <p className="text-xs text-slate-400">Baseline population survival probabilities</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
          Median Survival: ~{survivalData?.median_survival_days_cohort || 1845} Days
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '1-Year Survival', key: '1_year', color: 'from-cyan-500 to-indigo-500', desc: 'Acute Graft Function' },
          { label: '3-Year Survival', key: '3_year', color: 'from-indigo-500 to-emerald-500', desc: 'Mid-term Allograft Stability' },
          { label: '5-Year Survival', key: '5_year', color: 'from-emerald-500 to-teal-400', desc: 'Long-term Organ Retention' },
        ].map((item) => {
          const probVal = milestones[item.key] || 0.75;
          const pct = Math.round(probVal * (probVal <= 1 ? 100 : 1));

          return (
            <div key={item.key} className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-black text-white mb-1">
                {pct}%
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{item.desc}</p>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
