import React, { useState, useMemo } from 'react';
import { DriverTelemetry, TrackCircuit } from '../types';
import { generateTelemetryTraceData } from '../utils/f1Calculators';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Activity, Gauge, Zap, BarChart3, AlertCircle } from 'lucide-react';

interface TelemetryAnalyticsProps {
  drivers: DriverTelemetry[];
  selectedTrack: TrackCircuit;
}

export const TelemetryAnalytics: React.FC<TelemetryAnalyticsProps> = ({ drivers, selectedTrack }) => {
  const [driver1Code, setDriver1Code] = useState<string>('HAM');
  const [driver2Code, setDriver2Code] = useState<string>('VER');

  const d1 = drivers.find((d) => d.driverCode === driver1Code) || drivers[1] || drivers[0];
  const d2 = drivers.find((d) => d.driverCode === driver2Code) || drivers[0];

  const traceData = useMemo(() => {
    return generateTelemetryTraceData(driver1Code, driver2Code, selectedTrack);
  }, [driver1Code, driver2Code, selectedTrack]);

  return (
    <div className="space-y-6">
      {/* Telemetry Control & Comparison Header */}
      <div className="bento-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E10600]/20 text-[#E10600] rounded-lg border border-[#E10600]/40">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Driver Telemetry & Speed Trace Analytics
            </h2>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              CIRCUIT: {selectedTrack.name} ({selectedTrack.lengthKm} km) · 10Hz TELEMETRY SAMPLING
            </div>
          </div>
        </div>

        {/* Driver A vs Driver B Selectors */}
        <div className="flex items-center gap-3 font-mono text-xs w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d1.teamColor }} />
            <span className="label-caps">DRIVER A:</span>
            <select
              value={driver1Code}
              onChange={(e) => setDriver1Code(e.target.value)}
              className="bg-[#0B0B0E] text-slate-100 border border-[#2D2D37] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E10600] font-bold cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.driverCode} value={d.driverCode}>
                  {d.driverCode} ({d.driverName})
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#E10600] font-black">VS</span>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d2.teamColor }} />
            <span className="label-caps">DRIVER B:</span>
            <select
              value={driver2Code}
              onChange={(e) => setDriver2Code(e.target.value)}
              className="bg-[#0B0B0E] text-slate-100 border border-[#2D2D37] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E10600] font-bold cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.driverCode} value={d.driverCode}>
                  {d.driverCode} ({d.driverName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Driver Telemetry Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bento-card bento-card-red flex flex-col justify-between">
          <div className="label-caps">Speed Delta Peak</div>
          <div className="metric-value italic text-[#E10600] mt-1">+4.8 km/h ({d1.driverCode})</div>
          <div className="text-[10px] text-zinc-400 mt-1">DRS Zone Hangar Straight</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps">Min Corner Apex Speed</div>
          <div className="metric-value italic text-white mt-1">118 km/h (T3)</div>
          <div className="text-[10px] text-zinc-400 mt-1">Gear 3 · Full lock steering</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps">Sector 2 Time Delta</div>
          <div className="metric-value italic text-emerald-400 mt-1">-0.084s ({d1.driverCode})</div>
          <div className="text-[10px] text-zinc-400 mt-1">Maggotts-Becketts S-curves</div>
        </div>

        <div className="bento-card flex flex-col justify-between">
          <div className="label-caps">Throttle Point</div>
          <div className="metric-value italic text-amber-400 mt-1">12m earlier ({d2.driverCode})</div>
          <div className="text-[10px] text-zinc-400 mt-1">Exit of T15 Stowe corner</div>
        </div>
      </div>

      {/* Speed Trace Graph */}
      <div className="bento-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2D2D37]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#E10600]" />
            Speed Trace Overlay (km/h) across Circuit Distance
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-1.5 rounded" style={{ backgroundColor: d1.teamColor }} />
              {d1.driverCode} Speed
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-1.5 rounded" style={{ backgroundColor: d2.teamColor }} />
              {d2.driverCode} Speed
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={traceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D37" />
              <XAxis dataKey="distance" stroke="#8E9299" fontSize={10} tickFormatter={(val) => `${val}m`} />
              <YAxis domain={[60, 340]} stroke="#8E9299" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#15151B', borderColor: '#2D2D37', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: any, name: any) => [`${value} km/h`, name === 'driver1Speed' ? d1.driverCode : d2.driverCode]}
              />
              <Line type="monotone" dataKey="driver1Speed" stroke={d1.teamColor} strokeWidth={2} dot={false} name={d1.driverCode} />
              <Line type="monotone" dataKey="driver2Speed" stroke={d2.teamColor} strokeWidth={2} strokeDasharray="4 4" dot={false} name={d2.driverCode} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Throttle & Brake Channels Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throttle Input % */}
        <div className="bento-card space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Throttle Application (%)
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D37" />
                <XAxis dataKey="distance" stroke="#8E9299" fontSize={10} tickFormatter={(val) => `${val}m`} />
                <YAxis domain={[0, 100]} stroke="#8E9299" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#15151B', borderColor: '#2D2D37', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="stepAfter" dataKey="driver1Throttle" stroke={d1.teamColor} strokeWidth={1.5} dot={false} name={`${d1.driverCode} Throttle`} />
                <Line type="stepAfter" dataKey="driver2Throttle" stroke={d2.teamColor} strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={`${d2.driverCode} Throttle`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brake Input % */}
        <div className="bento-card space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E10600]" />
            Brake Pressure (%)
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D37" />
                <XAxis dataKey="distance" stroke="#8E9299" fontSize={10} tickFormatter={(val) => `${val}m`} />
                <YAxis domain={[0, 100]} stroke="#8E9299" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#15151B', borderColor: '#2D2D37', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="stepAfter" dataKey="driver1Brake" stroke="#E10600" strokeWidth={1.5} dot={false} name={`${d1.driverCode} Brake`} />
                <Line type="stepAfter" dataKey="driver2Brake" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={`${d2.driverCode} Brake`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
