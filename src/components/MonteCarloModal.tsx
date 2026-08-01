import React, { useState } from 'react';
import { runMonteCarloSimulation } from '../utils/f1Calculators';
import { MonteCarloSimResult, TrackCircuit } from '../types';
import { Cpu, X, Play, ShieldAlert, Trophy, BarChart2, RefreshCw } from 'lucide-react';

interface MonteCarloModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackCircuit;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({ isOpen, onClose, track }) => {
  const [safetyCarProb, setSafetyCarProb] = useState<number>(track.safetyCarProbability);
  const [simCount, setSimCount] = useState<number>(10000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [results, setResults] = useState<MonteCarloSimResult>(() =>
    runMonteCarloSimulation(10000, track.safetyCarProbability, track.trackTemp)
  );

  if (!isOpen) return null;

  const handleRunSim = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runMonteCarloSimulation(simCount, safetyCarProb, track.trackTemp);
      setResults(res);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0E]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#15151B] border border-[#2D2D37] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="p-4 bg-[#0B0B0E] border-b border-[#2D2D37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E10600] text-white rounded-lg shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Monte Carlo Stochastic Race Strategy Simulator
              </h2>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                STOCHASTIC MODELING ENGINE · {track.name} ({track.totalLaps} LAPS)
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 font-mono text-xs">
          {/* Controls */}
          <div className="bg-[#0B0B0E] p-4 rounded-xl border border-[#2D2D37] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-caps block mb-1">
                  SAFETY CAR PROBABILITY: {Math.round(safetyCarProb * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={safetyCarProb}
                  onChange={(e) => setSafetyCarProb(parseFloat(e.target.value))}
                  className="w-full accent-[#E10600] cursor-pointer"
                />
              </div>

              <div>
                <label className="label-caps block mb-1">
                  SIMULATION ITERATIONS: {simCount.toLocaleString()} RACES
                </label>
                <div className="flex gap-2">
                  {[1000, 5000, 10000, 25000].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSimCount(num)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        simCount === num ? 'bg-[#E10600] text-white' : 'bg-[#15151B] text-zinc-300 border border-[#2D2D37]'
                      }`}
                    >
                      {num / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSim}
              disabled={isSimulating}
              className="w-full py-2.5 bg-[#E10600] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {isSimulating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>{isSimulating ? 'COMPUTING 10,000 STOCHASTIC SIMULATIONS...' : 'EXECUTE MONTE CARLO SIMULATION'}</span>
            </button>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0B0B0E] p-4 rounded-xl border border-[#2D2D37] text-center">
              <div className="label-caps">P1 Win Probability</div>
              <div className="metric-value italic text-amber-400 mt-1">{results.p1ProbabilityPercent}%</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Top Strategy Result</div>
            </div>

            <div className="bg-[#0B0B0E] p-4 rounded-xl border border-[#2D2D37] text-center">
              <div className="label-caps">Podium Probability</div>
              <div className="metric-value italic text-indigo-400 mt-1">{results.podiumProbabilityPercent}%</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Finish P1-P3</div>
            </div>

            <div className="bg-[#0B0B0E] p-4 rounded-xl border border-[#2D2D37] text-center">
              <div className="label-caps">Top 5 Probability</div>
              <div className="metric-value italic text-emerald-400 mt-1">{results.top5ProbabilityPercent}%</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Points Security</div>
            </div>
          </div>

          {/* Strategy Win Rate Breakdown */}
          <div className="bg-[#0B0B0E] p-4 rounded-xl border border-[#2D2D37] space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Strategy Win Rate Comparison across {results.simulationsRun.toLocaleString()} Iterations
            </div>

            <div className="space-y-2 pt-1">
              {results.strategyWinRates.map((st, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">{st.strategyName}</span>
                    <span className="text-amber-400 font-bold">{st.winRatePercent}% Win Rate</span>
                  </div>
                  <div className="w-full h-2 bg-[#15151B] rounded-full overflow-hidden border border-[#2D2D37]">
                    <div
                      className="h-full bg-[#E10600] transition-all duration-500"
                      style={{ width: `${st.winRatePercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
