import React, { useMemo } from 'react';
import { DriverTelemetry, TrackCircuit } from '../types';
import { generateTyreDegradationData } from '../utils/f1Calculators';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Disc, Flame, AlertTriangle, ShieldCheck, TrendingDown, Thermometer, Gauge } from 'lucide-react';

interface TyreDegradationMatrixProps {
  drivers: DriverTelemetry[];
  selectedDriver: DriverTelemetry;
  track: TrackCircuit;
}

export const TyreDegradationMatrix: React.FC<TyreDegradationMatrixProps> = ({ drivers, selectedDriver, track }) => {
  const degData = useMemo(() => {
    return generateTyreDegradationData(35, track.tyreAbrasionIndex, track.trackTemp);
  }, [track]);

  const cornerWear = selectedDriver.tyre.cornerWear || {
    fl: selectedDriver.tyre.wearPercent,
    fr: Math.round(selectedDriver.tyre.wearPercent * 0.95),
    rl: Math.round(selectedDriver.tyre.wearPercent * 1.05),
    rr: Math.round(selectedDriver.tyre.wearPercent * 0.90),
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bento-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-950/80 text-amber-400 rounded-lg border border-amber-800">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Pirelli Tyre Wear & Thermal Degradation Physics Matrix
            </h2>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              CIRCUIT: {track.name} · ABRASION INDEX: {track.tyreAbrasionIndex} / 5 · TRACK TEMP: {track.trackTemp}°C
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#0B0B0E] px-3 py-1.5 rounded-lg border border-[#2D2D37] text-slate-200">
            <span className="label-caps">Focus Driver:</span> <span className="font-bold text-white ml-1">{selectedDriver.driverCode}</span>
          </div>
          <div className="bg-[#0B0B0E] px-3 py-1.5 rounded-lg border border-[#2D2D37] text-slate-200">
            <span className="label-caps">Active Compound:</span> <span className="font-bold text-amber-400 ml-1">{selectedDriver.tyre.compound}</span>
          </div>
          <div className="bg-[#0B0B0E] px-3 py-1.5 rounded-lg border border-[#2D2D37] text-slate-200">
            <span className="label-caps">Stint Age:</span> <span className="font-bold text-white ml-1">{selectedDriver.tyre.ageLaps} Laps</span>
          </div>
        </div>
      </div>

      {/* 4-Wheel Corner Wear Diagram for Selected Driver */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="md:col-span-1 bento-card bento-card-red flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2D2D37]">
            <span className="label-caps">4-Wheel Independent Wear</span>
            <span className="text-[#E10600] font-bold text-xs">{selectedDriver.driverCode} CAR #{selectedDriver.number}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Front Left */}
            <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37] text-center">
              <div className="text-[10px] text-zinc-400 font-bold mb-1">FRONT LEFT (FL)</div>
              <div className={`text-xl font-black ${cornerWear.fl > 70 ? 'text-red-500' : cornerWear.fl > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {cornerWear.fl}%
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">High lateral load</div>
            </div>

            {/* Front Right */}
            <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37] text-center">
              <div className="text-[10px] text-zinc-400 font-bold mb-1">FRONT RIGHT (FR)</div>
              <div className={`text-xl font-black ${cornerWear.fr > 70 ? 'text-red-500' : cornerWear.fr > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {cornerWear.fr}%
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Steering apex load</div>
            </div>

            {/* Rear Left */}
            <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37] text-center">
              <div className="text-[10px] text-zinc-400 font-bold mb-1">REAR LEFT (RL)</div>
              <div className={`text-xl font-black ${cornerWear.rl > 70 ? 'text-red-500' : cornerWear.rl > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {cornerWear.rl}%
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Traction wear</div>
            </div>

            {/* Rear Right */}
            <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#2D2D37] text-center">
              <div className="text-[10px] text-zinc-400 font-bold mb-1">REAR RIGHT (RR)</div>
              <div className={`text-xl font-black ${cornerWear.rr > 70 ? 'text-red-500' : cornerWear.rr > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {cornerWear.rr}%
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Differential wear</div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 bg-[#0B0B0E] p-2.5 rounded-lg border border-[#2D2D37]">
            <span className="text-amber-400 font-bold">100% WEAR CONSTRAINTS:</span> Worn tyres inflict up to +4.5s/lap pace penalty and extreme puncture risk under braking.
          </div>
        </div>

        {/* Degradation Pace Loss Chart */}
        <div className="md:col-span-2 bento-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2D2D37]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#E10600]" />
              Theoretical Pace Loss per Lap (Seconds) vs Stint Age ({track.name})
            </h3>
            <div className="text-[11px] text-zinc-400 font-mono">
              Abrasion Factor: {track.tyreAbrasionIndex}x
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={degData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D37" />
                <XAxis dataKey="lapAge" stroke="#8E9299" fontSize={10} tickFormatter={(val) => `L${val}`} />
                <YAxis domain={[0, 'auto']} stroke="#8E9299" fontSize={10} tickFormatter={(val) => `+${val}s`} />
                <Tooltip contentStyle={{ backgroundColor: '#15151B', borderColor: '#2D2D37', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="c1PaceLossSec" stroke="#FFFFFF" strokeWidth={2} name="C1 Hardest" dot={false} />
                <Line type="monotone" dataKey="c2PaceLossSec" stroke="#94A3B8" strokeWidth={2} name="C2 Hard" dot={false} />
                <Line type="monotone" dataKey="c3PaceLossSec" stroke="#FACC15" strokeWidth={2.5} name="C3 Medium" dot={false} />
                <Line type="monotone" dataKey="c4PaceLossSec" stroke="#EF4444" strokeWidth={2} name="C4 Soft" dot={false} />
                <Line type="monotone" dataKey="c5PaceLossSec" stroke="#EC4899" strokeWidth={2} name="C5 Softest" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of Grid Drivers Tyre Thermal Matrix */}
      <div className="bento-card space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-500" />
          Grid Multi-Car Tyre Wear & Thermal Stress Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((drv) => {
            const isFocus = drv.driverCode === selectedDriver.driverCode;
            return (
              <div
                key={drv.driverCode}
                className={`p-4 rounded-xl border transition-all ${
                  isFocus
                    ? 'bg-[#0B0B0E] border-[#E10600] shadow-lg'
                    : 'bg-[#0B0B0E]/80 border-[#2D2D37] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#2D2D37] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 rounded-full" style={{ backgroundColor: drv.teamColor }} />
                    <span className="font-black text-white text-sm">{drv.driverCode}</span>
                    <span className="text-[10px] text-zinc-400">P{drv.position}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">{drv.tyre.compound}</span>
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="label-caps">Overall Wear:</span>
                    <span className={`font-bold ${drv.tyre.wearPercent > 60 ? 'text-red-400' : drv.tyre.wearPercent > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {drv.tyre.wearPercent}%
                    </span>
                  </div>

                  {/* Wear Progress Bar */}
                  <div className="w-full h-1.5 bg-[#15151B] rounded-full overflow-hidden border border-[#2D2D37]">
                    <div
                      className={`h-full transition-all ${
                        drv.tyre.wearPercent > 60 ? 'bg-[#E10600]' : drv.tyre.wearPercent > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${drv.tyre.wearPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-zinc-300 pt-1">
                    <span className="label-caps">Temp (Surface/Core):</span>
                    <span className="font-bold text-white">
                      {drv.tyre.surfaceTemp}°C / {drv.tyre.coreTemp}°C
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#2D2D37]">
                    <span className="text-zinc-400 label-caps">Thermal Status:</span>
                    <span className={`font-bold ${drv.tyre.thermalBandStatus === 'Overheated' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {drv.tyre.thermalBandStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
