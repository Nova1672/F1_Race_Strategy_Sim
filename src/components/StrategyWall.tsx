import React from 'react';
import { DriverTelemetry, TrackCircuit, PitOptionScenario } from '../types';
import { AlertTriangle, ArrowRight, ShieldAlert, Disc, Clock, Zap, ArrowUpRight, TrendingDown } from 'lucide-react';

interface StrategyWallProps {
  drivers: DriverTelemetry[];
  selectedDriver: DriverTelemetry;
  onSelectDriver: (driver: DriverTelemetry) => void;
  track: TrackCircuit;
  currentLap: number;
  pitScenarios: PitOptionScenario[];
  onTriggerQuickPit: (driverCode: string, compound: string) => void;
  onSwitchToCopilot: (promptText: string) => void;
}

export const StrategyWall: React.FC<StrategyWallProps> = ({
  drivers,
  selectedDriver,
  onSelectDriver,
  track,
  currentLap,
  pitScenarios,
  onTriggerQuickPit,
  onSwitchToCopilot,
}) => {
  const leader = drivers[0];
  const p2Driver = drivers[1];
  const undercutThreat = p2Driver && p2Driver.pitWindowStatus === 'OPTIMAL WINDOW';

  return (
    <div className="space-y-6">
      {/* Executive Summary Bento Grid Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card bento-card-red flex flex-col justify-between">
          <div className="label-caps mb-1">Race Leader</div>
          <div className="metric-value italic text-[#E10600]">
            {leader?.driverCode} <span className="text-xs font-normal text-zinc-400">({leader?.team})</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">TOTAL LAPS: {currentLap} / {track.totalLaps}</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps mb-1">Optimal Pit Window</div>
          <div className="metric-value italic text-white">L18 – L28</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">CIRCUIT: {track.name}</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps mb-1">Safety Car Probability</div>
          <div className="metric-value italic text-orange-500">{Math.round(track.safetyCarProbability * 100)}%</div>
          <div className="text-[10px] text-zinc-400 mt-1">TRACK ABRASION: {track.tyreAbrasionIndex}/5</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps mb-1">Pit Lane Loss</div>
          <div className="metric-value italic text-white">{track.pitLaneLossSec}s</div>
          <div className="text-[10px] text-zinc-400 mt-1">PIT STOP LOSS TIME</div>
        </div>
      </div>

      {/* Live Tactical Undercut Alert Banner */}
      {undercutThreat && (
        <div className="bg-amber-950/60 border border-amber-600/80 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-200 flex items-center gap-2 font-mono">
                TACTICAL UNDERCUT THREAT: {p2Driver.driverCode} IN OPTIMAL PIT WINDOW
                <span className="text-[10px] bg-amber-900/90 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-700">
                  GAP: {p2Driver.gapToLeader}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5 font-sans">
                {p2Driver.driverName} ({p2Driver.team}) is inside undercut threshold. Fresh tyre delta yields +1.85s/lap out-lap advantage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerQuickPit(leader.driverCode, 'C2 (Hard)')}
              className="px-3.5 py-2 bg-[#E10600] hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 transition-all font-mono"
            >
              <Zap className="w-4 h-4 fill-white" />
              BOX {leader.driverCode} NOW
            </button>
            <button
              onClick={() =>
                onSwitchToCopilot(`Evaluate defensive strategy for ${leader.driverCode} against ${p2Driver.driverCode} undercut on Lap ${currentLap}`)
              }
              className="px-3 py-2 bg-[#0B0B0E] hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg border border-[#2D2D37] flex items-center gap-1 transition-all font-mono"
            >
              ASK AI STRATEGIST
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Pit Wall Leaderboard Grid + Active Driver Strategy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (2 cols wide): Live Telemetry Leaderboard Table */}
        <div className="lg:col-span-2 bento-card p-0 overflow-hidden">
          <div className="p-4 bg-[#0B0B0E] border-b border-[#2D2D37] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] animate-ping" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Live Pit Wall Leaderboard ({track.name})
              </h2>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              LAP {currentLap} / {track.totalLaps}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#15151B] text-[10px] text-zinc-400 font-mono uppercase tracking-wider border-b border-[#2D2D37]">
                  <th className="py-2.5 px-3">POS</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3 text-right">GAP / INTERVAL</th>
                  <th className="py-2.5 px-3 text-center">TYRE & AGE</th>
                  <th className="py-2.5 px-3 text-center">WEAR</th>
                  <th className="py-2.5 px-3 text-center">REJOIN POS</th>
                  <th className="py-2.5 px-3 text-center">PIT WINDOW</th>
                  <th className="py-2.5 px-3 text-right">LAST LAP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D37] text-xs font-mono">
                {drivers.map((drv) => {
                  const isSelected = selectedDriver.driverCode === drv.driverCode;
                  const wearColor =
                    drv.tyre.wearPercent > 65
                      ? 'text-red-500 font-black animate-pulse'
                      : drv.tyre.wearPercent > 40
                      ? 'text-red-400'
                      : drv.tyre.wearPercent > 25
                      ? 'text-amber-400'
                      : 'text-emerald-400';

                  const isInPit = drv.status === 'In Pit';
                  const isOutLap = drv.status === 'Out Lap';
                  const isRetired = drv.status === 'Retired';

                  return (
                    <tr
                      key={drv.driverCode}
                      onClick={() => onSelectDriver(drv)}
                      className={`cursor-pointer transition-colors ${
                        isRetired
                          ? 'bg-zinc-950/80 opacity-60'
                          : isSelected
                          ? 'bg-[#0B0B0E] border-l-4 border-l-[#E10600]'
                          : isInPit
                          ? 'bg-red-950/30'
                          : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* POS */}
                      <td className="py-2.5 px-3 font-black text-white">
                        {isRetired ? 'RET' : drv.position}
                      </td>

                      {/* DRIVER */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-6 rounded-full"
                            style={{ backgroundColor: drv.teamColor }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-white text-sm">
                                {drv.driverCode}
                              </span>
                              {isRetired && (
                                <span className="bg-zinc-800 text-red-400 border border-red-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  RETIRED
                                </span>
                              )}
                              {isInPit && (
                                <span className="bg-[#E10600] text-white text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                                  IN PIT
                                </span>
                              )}
                              {isOutLap && (
                                <span className="bg-purple-900 text-purple-300 border border-purple-700 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  OUT LAP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 block font-sans">
                              #{drv.number} · {drv.team} {drv.pitStops > 0 && `(${drv.pitStops} Pit)`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* GAP */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                        <div>{drv.gapToLeader}</div>
                        <div className="text-[10px] text-zinc-400 font-normal">
                          {drv.gapToAhead}
                        </div>
                      </td>

                      {/* TYRE & AGE */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B0B0E] text-slate-200 border border-[#2D2D37]">
                          <Disc className="w-3 h-3 text-amber-400" />
                          {drv.tyre.compound.split(' ')[0]} ({drv.tyre.ageLaps}L)
                        </span>
                      </td>

                      {/* WEAR % */}
                      <td className={`py-2.5 px-3 text-center font-bold ${wearColor}`}>
                        {drv.tyre.wearPercent}%
                      </td>

                      {/* REJOIN POS */}
                      <td className="py-2.5 px-3 text-center text-slate-300 font-bold">
                        P{drv.predictedRejoinPos}
                      </td>

                      {/* PIT WINDOW BADGE */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            drv.pitWindowStatus === 'CRITICAL WEAR'
                              ? 'bg-red-950 text-red-400 border border-red-600 animate-pulse font-black'
                              : drv.pitWindowStatus === 'OPTIMAL WINDOW'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 animate-pulse'
                              : drv.pitWindowStatus === 'Opening Soon'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : drv.pitWindowStatus === 'Overdue'
                              ? 'bg-orange-950 text-orange-300 border border-orange-700'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {drv.pitWindowStatus}
                        </span>
                      </td>

                      {/* LAST LAP */}
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {drv.lastLapTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Active Driver Focus Tactical Card */}
        <div className="space-y-4">
          <div className="bento-card bento-card-red">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D2D37]">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-7 rounded-full"
                  style={{ backgroundColor: selectedDriver.teamColor }}
                />
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide font-mono">
                    {selectedDriver.driverName} ({selectedDriver.driverCode})
                  </h3>
                  <div className="text-xs text-zinc-400">
                    {selectedDriver.team} · Car #{selectedDriver.number}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black italic text-[#E10600]">
                  P{selectedDriver.position}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {selectedDriver.gapToLeader}
                </div>
              </div>
            </div>

            {/* Tyre & Thermal Status Bar */}
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
              <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37]">
                <div className="label-caps">Current Tyre</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {selectedDriver.tyre.compound}
                </div>
                <div className="text-xs text-zinc-300 mt-1">
                  Age: <span className="font-bold text-white">{selectedDriver.tyre.ageLaps} laps</span> ({selectedDriver.tyre.wearPercent}% Wear)
                </div>
              </div>

              <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37]">
                <div className="label-caps">Thermal Band</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  {selectedDriver.tyre.surfaceTemp}°C / {selectedDriver.tyre.coreTemp}°C
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  {selectedDriver.tyre.thermalBandStatus}
                </div>
              </div>
            </div>

            {/* Direct Pit Box Command */}
            <div className="mt-4 bg-[#0B0B0E] p-3.5 rounded-lg border border-[#2D2D37] space-y-2.5">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between font-mono">
                <span>Direct Pit Stop Command</span>
                <span className="text-[10px] text-emerald-400">Pit Loss: {track.pitLaneLossSec}s</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onTriggerQuickPit(selectedDriver.driverCode, 'C2 (Hard)')}
                  className="py-2 bg-[#15151B] hover:bg-zinc-800 text-white font-bold text-xs rounded border border-[#2D2D37] font-mono flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-white">BOX C2</span>
                  <span className="text-[9px] text-zinc-400 font-normal">HARD</span>
                </button>

                <button
                  onClick={() => onTriggerQuickPit(selectedDriver.driverCode, 'C3 (Medium)')}
                  className="py-2 bg-[#15151B] hover:bg-zinc-800 text-amber-300 font-bold text-xs rounded border border-[#2D2D37] font-mono flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-amber-400">BOX C3</span>
                  <span className="text-[9px] text-zinc-400 font-normal">MEDIUM</span>
                </button>

                <button
                  onClick={() => onTriggerQuickPit(selectedDriver.driverCode, 'C4 (Soft)')}
                  className="py-2 bg-[#15151B] hover:bg-zinc-800 text-red-300 font-bold text-xs rounded border border-[#2D2D37] font-mono flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-[#E10600]">BOX C4</span>
                  <span className="text-[9px] text-zinc-400 font-normal">SOFT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pit Strategy Scenarios Overview Card */}
          <div className="bento-card space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Calculated Pit Scenarios
            </h3>

            <div className="space-y-2.5">
              {pitScenarios.map((scen) => (
                <div
                  key={scen.id}
                  className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37] hover:border-zinc-600 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-slate-200">{scen.name}</span>
                    <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      CONF: {scen.confidenceScore}%
                    </span>
                  </div>
                  <div className="text-xs text-amber-300 font-mono font-semibold">
                    {scen.strategyName}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {scen.recommendationReason}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-900">
                    <span>Rejoin: P{scen.rejoinPosition} ({scen.rejoinTrafficCar})</span>
                    <span className="f1-red font-bold">Undercut Δ: {scen.undercutDeltaSec}s</span>
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
