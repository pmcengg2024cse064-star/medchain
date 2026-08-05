import React from 'react';
import { User, Activity, Heart, Scale, Stethoscope, Dna, AlertCircle, Play, RotateCcw } from 'lucide-react';

export default function ClinicalForm({ formData, setFormData, onSubmit, isLoading, onReset }) {

  const handleChange = (field, value) => {
    const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
    
    setFormData((prev) => {
      const updated = { ...prev, [field]: numVal };

      // Auto-compute Abs_Age_Diff if Patient_Age or Donor_Age changes
      if (field === 'Patient_Age' || field === 'Donor_Age') {
        const patientAge = field === 'Patient_Age' ? numVal : prev.Patient_Age;
        const donorAge = field === 'Donor_Age' ? numVal : prev.Donor_Age;
        updated.Abs_Age_Diff = Math.abs(patientAge - donorAge);
      }

      return updated;
    });
  };

  const handleToggleBlood = () => {
    setFormData((prev) => ({
      ...prev,
      Blood_Compatible: prev.Blood_Compatible === 1 ? 0 : 1,
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Clinical Vector Parameters</h2>
            <p className="text-xs text-slate-400">Input donor-recipient biometrics to calculate allocation score</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        
        {/* Recipient & Donor Biometrics Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Recipient & Donor Demographics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Patient Age */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Patient Age (yrs)</label>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                  {formData.Patient_Age} y/o
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="85"
                value={formData.Patient_Age}
                onChange={(e) => handleChange('Patient_Age', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>18y</span>
                <span>50y</span>
                <span>85y</span>
              </div>
            </div>

            {/* Donor Age */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Donor Age (yrs)</label>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {formData.Donor_Age} y/o
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                value={formData.Donor_Age}
                onChange={(e) => handleChange('Donor_Age', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>15y</span>
                <span>45y</span>
                <span>80y</span>
              </div>
            </div>

            {/* Patient BMI */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Patient BMI</label>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                  {formData.Patient_BMI} kg/m²
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="14"
                max="50"
                value={formData.Patient_BMI}
                onChange={(e) => handleChange('Patient_BMI', e.target.value)}
                className="glass-input w-full px-3 py-1.5 text-xs rounded-lg text-white"
              />
            </div>

            {/* Donor Weight */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Donor Weight (kg)</label>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {formData.Donor_Weight} kg
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="35"
                max="150"
                value={formData.Donor_Weight}
                onChange={(e) => handleChange('Donor_Weight', e.target.value)}
                className="glass-input w-full px-3 py-1.5 text-xs rounded-lg text-white"
              />
            </div>

          </div>
        </div>

        {/* Organ Viability & Clinical Compatibility */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Organ Viability & Immunological Match
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* RealTime Organ Health Score */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">RealTime Organ Health</label>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  {formData.RealTime_Organ_HealthScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.RealTime_Organ_HealthScore}
                onChange={(e) => handleChange('RealTime_Organ_HealthScore', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Organ Condition Score */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Organ Condition Rating</label>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  {formData.Organ_Condition_Score} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.Organ_Condition_Score}
                onChange={(e) => handleChange('Organ_Condition_Score', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Organ Match Grade (HLA 1 to 5) */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">HLA / Organ Match Rating</label>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                  Grade {formData.Organ_Match} / 5
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleChange('Organ_Match', grade)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                      formData.Organ_Match === grade
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Group Compatibility Toggle */}
            <div className="glass-card rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-slate-300 block">Blood Group Compatibility</label>
                <span className="text-[10px] text-slate-400">ABO/Rh Immunological Cross-match</span>
              </div>
              <button
                type="button"
                onClick={handleToggleBlood}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                  formData.Blood_Compatible === 1
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${formData.Blood_Compatible === 1 ? 'text-emerald-400 fill-emerald-400' : 'text-rose-400'}`} />
                {formData.Blood_Compatible === 1 ? 'Compatible' : 'Incompatible'}
              </button>
            </div>

          </div>
        </div>

        {/* Baseline Prognosis & Age Difference */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5" /> Baseline Prognosis & Differential
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Predicted Baseline Survival Chance */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Baseline Survival Est.</label>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {formData.Predicted_Survival_Chance <= 1 
                    ? (formData.Predicted_Survival_Chance * 100).toFixed(0) + '%' 
                    : formData.Predicted_Survival_Chance + '%'}
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1.0"
                value={formData.Predicted_Survival_Chance}
                onChange={(e) => handleChange('Predicted_Survival_Chance', e.target.value)}
                className="glass-input w-full px-3 py-1.5 text-xs rounded-lg text-white"
              />
            </div>

            {/* Absolute Age Difference (Readonly / Calculated) */}
            <div className="glass-card rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Abs Age Differential</label>
                <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  Δ {formData.Abs_Age_Diff} years
                </span>
              </div>
              <input
                type="number"
                readOnly
                value={formData.Abs_Age_Diff}
                className="glass-input w-full px-3 py-1.5 text-xs rounded-lg text-slate-400 bg-slate-900/50 cursor-not-allowed"
              />
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running AuraChain AI Inference...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Evaluate Organ Allocation & Survival</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
