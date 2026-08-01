import React, { useState } from 'react';
import { DriverTelemetry, TrackCircuit, PitOptionScenario } from '../types';
import { GitBranch, Zap, ArrowRight, ShieldCheck, AlertTriangle, Layers, Clock } from 'lucide-react';

interface PitWindowSimulatorProps {
  selectedDriver: DriverTelemetry;
  drivers: DriverTelemetry[];
  track: TrackCircuit;
  currentLap: number;
  scenarios: PitOptionScenario[];
  onTriggerQuickPit: (driverCode: string, compound: string) => void;
}

export const PitWindowSimulator: React.FC<PitWindowSimulatorProps> = ({
  selectedDriver,
  drivers,
  track,
  currentLap,
  scenarios,
  onTriggerQuickPit,
}) => {
  const [simulatedPitLap, setSimulatedPitLap] = useState<number>(currentLap + 1);
  const [selectedCompound, setSelectedCompound] = useState<string>('C2 (Hard)');

  const pitLoss = track.pitLaneLossSec;

  // Calculate projected rejoin gap based on pit lap slider
  const lapDelta = simulatedPitLap - currentLap;
  const wornDegPaceLoss = lapDelta * 0.12; // Loss per lap staying out on worn tyres
  const freshTyreGain = selectedCompound.includes('Soft') ? 1.4 : selectedCompound.includes('Medium') ? 0.9 : 0.4;

  const netUndercutDelta = -1.85 + (lapDelta > 2 ? 0.8 : 0) - freshTyreGain;

  return (
    <div className="space-y-6">
      {/* Simulator Control Bar */}
      <div className="bento-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-[#2D2D37]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-lg border border-indigo-800">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Interactive Pit Window & Undercut Rejoin Simulator
              </h2>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                TARGET DRIVER: {selectedDriver.driverName} ({selectedDriver.driverCode}) · PIT LANE LOSS: {pitLoss}s
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="label-caps">SELECT NEW COMPOUND:</span>
            {['C2 (Hard)', 'C3 (Medium)', 'C4 (Soft)'].map((cmp) => (
              <button
                key={cmp}
                onClick={() => setSelectedCompound(cmp)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCompound === cmp
                    ? 'bg-[#E10600] text-white shadow-md'
                    : 'bg-[#0B0B0E] text-zinc-300 hover:bg-zinc-800 border border-[#2D2D37]'
                }`}
              >
                {cmp.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Pit Lap Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="label-caps">SIMULATE PIT STOP LAP:</span>
            <span className="text-[#E10600] font-black text-sm">
              LAP {simulatedPitLap} <span className="text-zinc-500 text-xs">({simulatedPitLap - currentLap} laps from now)</span>
            </span>
          </div>

          <input
            type="range"
            min={currentLap}
            max={Math.min(track.totalLaps, currentLap + 15)}
            value={simulatedPitLap}
            onChange={(e) => setSimulatedPitLap(parseInt(e.target.value))}
            className="w-full h-2 bg-[#0B0B0E] rounded-lg appearance-none cursor-pointer accent-[#E10600] border border-[#2D2D37]"
          />

          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>Lap {currentLap} (Current)</span>
            <span>Lap {currentLap + 5}</span>
            <span>Lap {currentLap + 10}</span>
            <span>Lap {track.totalLaps} (Chequered Flag)</span>
          </div>
        </div>
      </div>

      {/* Rejoin Traffic Projection Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Traffic Re-entry Position Map */}
        <div className="lg:col-span-2 bento-card space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between pb-2 border-b border-[#2D2D37]">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Projected Track Re-Entry Position Map upon Pit Stop Exit
            </span>
            <span className="text-emerald-400 text-[11px]">
              {netUndercutDelta < 0 ? 'UNDERCUT SUCCESSFUL' : 'OVERCUT AT RISK'}
            </span>
          </h3>

          <div className="space-y-2 font-mono">
            {drivers.slice(0, 8).map((drv) => {
              const isTargetDriver = drv.driverCode === selectedDriver.driverCode;
              const isProjectedRejoin = drv.position === selectedDriver.predictedRejoinPos;

              return (
                <div
                  key={drv.driverCode}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    isTargetDriver
                      ? 'bg-[#E10600]/20 border-[#E10600] font-bold'
                      : isProjectedRejoin
                      ? 'bg-amber-950/60 border-amber-500 font-bold animate-pulse'
                      : 'bg-[#0B0B0E] border-[#2D2D37]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-zinc-400 font-bold">P{drv.position}</span>
                    <span className="w-2 h-4 rounded-full" style={{ backgroundColor: drv.teamColor }} />
                    <span className="text-white font-black">{drv.driverCode}</span>
                    <span className="text-[10px] text-zinc-400">{drv.team}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="text-zinc-300">{drv.gapToLeader}</span>
                    {isProjectedRejoin && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                        REJOIN GAP: +2.4s
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Scenario Callout & Quick Trigger */}
        <div className="space-y-4">
          <div className="bento-card bento-card-red space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Simulated Pit Directives
            </h3>

            <div className="bg-[#0B0B0E] p-4 rounded-lg border border-[#2D2D37] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-300">
                <span className="label-caps">Simulated Pit Lap:</span>
                <span className="font-bold text-amber-400">Lap {simulatedPitLap}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="label-caps">Selected Compound:</span>
                <span className="font-bold text-white">{selectedCompound}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="label-caps">Undercut Delta:</span>
                <span className={`font-bold ${netUndercutDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netUndercutDelta.toFixed(2)}s
                </span>
              </div>

              <div className="pt-2 border-t border-[#2D2D37]">
                <button
                  onClick={() => onTriggerQuickPit(selectedDriver.driverCode, selectedCompound)}
                  className="w-full py-2.5 bg-[#E10600] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  EXECUTE PIT CALL (LAP {simulatedPitLap})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
