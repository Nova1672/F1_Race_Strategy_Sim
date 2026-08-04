import React from 'react';
import { Play, Pause, RotateCcw, CloudRain, Flame, Clock, Sparkles, Layers, Activity, Disc, AlertTriangle, ShieldAlert } from 'lucide-react';
import { TrackCircuit } from '../types';

interface HeaderProps {
  tracks: TrackCircuit[];
  selectedTrack: TrackCircuit;
  onSelectTrack: (track: TrackCircuit) => void;
  currentLap: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onResetSim: () => void;
  activeScreen: string;
  onSelectScreen: (screenId: string) => void;
  raceFlag?: 'GREEN' | 'SC' | 'VSC' | 'YELLOW';
}

export const Header: React.FC<HeaderProps> = ({
  tracks,
  selectedTrack,
  onSelectTrack,
  currentLap,
  isPlaying,
  onTogglePlay,
  simSpeed,
  onChangeSimSpeed,
  onResetSim,
  activeScreen,
  onSelectScreen,
  raceFlag = 'GREEN',
}) => {
  const screens = [
    { id: 'screen-1', name: 'Strategy Wall', icon: Layers, badge: 'LIVE' },
    { id: 'screen-2', name: 'Telemetry Analytics', icon: Activity, badge: '10Hz' },
    { id: 'screen-3', name: 'Tyre Deg Matrix', icon: Disc, badge: 'C1-C5' },
    { id: 'screen-5', name: 'AI Race Copilot', icon: Sparkles, badge: 'Gemini' },
  ];

  return (
    <header className="bg-[#15151B] border-b border-[#2D2D37] text-white sticky top-0 z-40 shadow-2xl">
      {/* Top Banner Control Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand & Circuit Selector */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#E10600] px-3 py-1 font-black text-lg tracking-tighter text-white rounded">
              F1
            </div>
            <div className="h-6 w-px bg-[#2D2D37]"></div>
            <div>
              <div className="text-xs font-bold uppercase text-zinc-400">INTELLIGENCE PLATFORM</div>
              <div className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                RACE STRATEGY VISUALIZER <span className="f1-red text-xs">v2.0</span>
              </div>
            </div>
          </div>

          {/* Track Switcher */}
          <div className="relative">
            <select
              value={selectedTrack.id}
              onChange={(e) => {
                const tr = tracks.find((t) => t.id === e.target.value);
                if (tr) onSelectTrack(tr);
              }}
              className="bg-[#0B0B0E] hover:bg-zinc-900 text-xs text-slate-200 border border-[#2D2D37] rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-[#E10600] cursor-pointer"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flagEmoji} {t.name} ({t.totalLaps} Laps)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Replay & Telemetry Simulator Controls */}
        <div className="flex items-center gap-3 bg-[#0B0B0E] border border-[#2D2D37] rounded-lg px-3 py-1.5 w-full lg:w-auto justify-center">
          {/* Lap Status */}
          <div className="flex items-center gap-2 font-mono text-xs pr-3 border-r border-[#2D2D37]">
            <Clock className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
            <span className="label-caps">LAP</span>
            <span className="text-[#E10600] font-black text-sm">
              {currentLap} <span className="text-zinc-500 text-xs">/ {selectedTrack.totalLaps}</span>
            </span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded-md transition-all flex items-center gap-1.5 text-xs font-bold ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
            title={isPlaying ? 'Pause Simulator' : 'Play Simulator'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-400" /> : <Play className="w-3.5 h-3.5 fill-emerald-400" />}
            <span>{isPlaying ? 'PAUSE' : 'LIVE SIM'}</span>
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-[#15151B] rounded border border-[#2D2D37] p-0.5">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSimSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold transition-colors ${
                  simSpeed === s ? 'bg-[#E10600] text-white' : 'text-zinc-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={onResetSim}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Reset Race Simulator to Lap 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Weather & Track Status Environment */}
        <div className="flex items-center gap-3 text-xs font-mono w-full lg:w-auto justify-end">
          {raceFlag !== 'GREEN' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold border animate-pulse ${
              raceFlag === 'SC'
                ? 'bg-amber-950 text-amber-300 border-amber-500'
                : raceFlag === 'VSC'
                ? 'bg-yellow-950 text-yellow-300 border-yellow-500'
                : 'bg-orange-950 text-orange-300 border-orange-500'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{raceFlag === 'SC' ? 'SAFETY CAR' : raceFlag === 'VSC' ? 'VSC ACTIVE' : 'YELLOW FLAG'}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-zinc-300 bg-[#0B0B0E] px-2.5 py-1.5 rounded border border-[#2D2D37]">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="label-caps">TRACK:</span>
            <span className="text-amber-400 font-bold">{selectedTrack.trackTemp}°C</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300 bg-[#0B0B0E] px-2.5 py-1.5 rounded border border-[#2D2D37]">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="label-caps">CONDITION:</span>
            <span className="text-cyan-300 font-bold">{selectedTrack.trackCondition || 'Dry'}</span>
          </div>
        </div>
      </div>

      {/* Primary Cockpit Navigation Screen Tabs */}
      <div className="bg-[#0B0B0E] border-t border-[#2D2D37]">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {screens.map((scr) => {
            const Icon = scr.icon;
            const isActive = activeScreen === scr.id;
            return (
              <button
                key={scr.id}
                onClick={() => onSelectScreen(scr.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all whitespace-nowrap border-t-2 ${
                  isActive
                    ? 'bg-[#15151B] text-white border-[#E10600] shadow-lg'
                    : 'bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'f1-red' : 'text-zinc-500'}`} />
                <span>{scr.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive ? 'bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {scr.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
