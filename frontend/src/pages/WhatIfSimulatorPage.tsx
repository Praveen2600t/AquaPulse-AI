import React, { useState } from 'react';
import { ScenarioInput, ScenarioResult, api } from '../services/api';
import {
  FlaskConical,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Gauge,
  CheckCircle2,
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const [inputs, setInputs] = useState<ScenarioInput>({
    feed_conductivity: 850.0,
    feed_pressure: 35.0,
    temperature: 25.0,
    turbidity: 2.5,
    simulated_filter_age_days: 90,
    flow_demand: 15.0,
  });

  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runScenario(inputs);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputs({
      feed_conductivity: 850.0,
      feed_pressure: 35.0,
      temperature: 25.0,
      turbidity: 2.5,
      simulated_filter_age_days: 90,
      flow_demand: 15.0,
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            WHAT-IF SCENARIO SIMULATOR
          </span>
          <span className="text-xs text-slate-400 font-mono">Physics Engine Sandbox</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          Interactive Environmental &amp; Wear Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust water salinity, pressure, temperature, turbidity, and filter age to observe real-time impacts on rejection, pressure drops, and RUL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Scenario Parameters
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Slider 1: Feed Conductivity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Feed Conductivity (Salinity)</span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.feed_conductivity} µS/cm</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={inputs.feed_conductivity}
              onChange={(e) => setInputs({ ...inputs, feed_conductivity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Fresh Tap (200 µS)</span>
              <span>Borewell Saline (2500 µS)</span>
            </div>
          </div>

          {/* Slider 2: Feed Pressure */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Feed Tap Pressure</span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.feed_pressure} psi</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              step="1"
              value={inputs.feed_pressure}
              onChange={(e) => setInputs({ ...inputs, feed_pressure: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Low Pressure (10 psi)</span>
              <span>High Mains (65 psi)</span>
            </div>
          </div>

          {/* Slider 3: Water Temperature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Water Temperature</span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.temperature} °C</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={inputs.temperature}
              onChange={(e) => setInputs({ ...inputs, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Cold (5°C)</span>
              <span>Hot Summer (45°C)</span>
            </div>
          </div>

          {/* Slider 4: Feed Turbidity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Feed Turbidity (Silt Loading)</span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.turbidity} NTU</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="20"
              step="0.2"
              value={inputs.turbidity}
              onChange={(e) => setInputs({ ...inputs, turbidity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Clear (0.2 NTU)</span>
              <span>Muddy Monsoon (20 NTU)</span>
            </div>
          </div>

          {/* Slider 5: Simulated Filter Age */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Simulated Filter Age</span>
              <span className="text-cyan-400 font-mono font-bold">{inputs.simulated_filter_age_days} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="365"
              step="5"
              value={inputs.simulated_filter_age_days}
              onChange={(e) => setInputs({ ...inputs, simulated_filter_age_days: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Brand New (1 day)</span>
              <span>1 Year Old (365 days)</span>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Computing Physics Engine...' : 'Execute What-If Physics Calculation'}
          </button>
        </div>

        {/* Right Column: Comparative Results & Engineering Insights */}
        <div className="lg:col-span-7 space-y-5">
          {!result ? (
            <div className="h-full min-h-[400px] p-8 rounded-3xl glass-panel border border-cyan-500/20 flex flex-col items-center justify-center text-center">
              <FlaskConical className="w-16 h-16 text-cyan-500/40 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Physics Simulation Engine Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Configure the environmental sliders on the left and click "Execute What-If Physics Calculation" to evaluate hydraulic and rejection impacts.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Comparative Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400">Salt Rejection</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-white">{result.simulated_salt_rejection}%</span>
                    <span className="text-xs text-slate-400">({result.baseline_salt_rejection}%)</span>
                  </div>
                  <span className={`text-[10px] font-bold ${result.simulated_salt_rejection >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Δ: {(result.simulated_salt_rejection - result.baseline_salt_rejection).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400">Pre-Filter ΔP</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-white">{result.simulated_pre_filter_dp} psi</span>
                  </div>
                  <span className={`text-[10px] font-bold ${result.simulated_pre_filter_dp < 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Base: {result.baseline_pre_filter_dp} psi
                  </span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400">Membrane Stress</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-white">{result.membrane_stress_index} / 10</span>
                  </div>
                  <span className="text-[10px] text-cyan-300">Hydraulic Index</span>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400">RUL Shift</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-black text-amber-400">
                      {result.projected_rul_change_days} days
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Wear impact</span>
                </div>
              </div>

              {/* Engineering Insights */}
              <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Physics Calculation Findings
                </h3>
                <ul className="space-y-2">
                  {result.engineering_insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Potential Fault Risks */}
              {result.fault_risks.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Projected Malfunction Risks
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-200">
                    {result.fault_risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
