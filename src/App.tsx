import React, { useState, useEffect, useRef } from 'react';
import { F1_TRACKS } from './data/f1Tracks';
import { generateRaceGridForTrack } from './data/f1Drivers';
import { DriverTelemetry, TrackCircuit, PitOptionScenario, LiveRaceEventLog } from './types';
import { calculatePitScenarios } from './utils/f1Calculators';
import { Header } from './components/Header';
import { StrategyWall } from './components/StrategyWall';
import { TelemetryAnalytics } from './components/TelemetryAnalytics';
import { TyreDegradationMatrix } from './components/TyreDegradationMatrix';
import { AiRaceCopilot } from './components/AiRaceCopilot';

export function App() {
  const [tracks] = useState<TrackCircuit[]>(F1_TRACKS);
  const [selectedTrack, setSelectedTrack] = useState<TrackCircuit>(F1_TRACKS[0]); // Silverstone default
  
  // Initialize driver grid dynamically for selected track
  const [drivers, setDrivers] = useState<DriverTelemetry[]>(() => generateRaceGridForTrack(F1_TRACKS[0], 24));
  const [selectedDriver, setSelectedDriver] = useState<DriverTelemetry>(() => drivers[1] || drivers[0]);
  const [currentLap, setCurrentLap] = useState<number>(24);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [activeScreen, setActiveScreen] = useState<string>('screen-1');
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [raceLogs, setRaceLogs] = useState<LiveRaceEventLog[]>([]);

  // Track switch handler - resets race simulation for newly chosen track
  const handleSelectTrack = (track: TrackCircuit) => {
    setSelectedTrack(track);
    const newGrid = generateRaceGridForTrack(track, 1);
    setDrivers(newGrid);
    setSelectedDriver(newGrid[0]);
    setCurrentLap(1);
    setRaceLogs([
      {
        id: 'log-' + Date.now(),
        lap: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'SAFETY_CAR',
        driverCode: 'RACE CONTROL',
        message: `GREEN LIGHT! Grand Prix underway at ${track.name} (${track.totalLaps} Laps).`,
      },
    ]);
  };

  // Reset simulation to Lap 1 for active track
  const handleResetSim = () => {
    const newGrid = generateRaceGridForTrack(selectedTrack, 1);
    setDrivers(newGrid);
    setSelectedDriver(newGrid[0]);
    setCurrentLap(1);
    setRaceLogs([]);
  };

  // Live Simulation Engine Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(300, 2000 / simSpeed);
    const timer = setInterval(() => {
      setCurrentLap((prevLap) => {
        const isFinish = prevLap >= selectedTrack.totalLaps;
        const nextLap = isFinish ? 1 : prevLap + 1;

        if (isFinish) {
          // Restart race for selected track with fresh grid
          const freshGrid = generateRaceGridForTrack(selectedTrack, 1);
          setDrivers(freshGrid);
          return 1;
        }

        // Random stochastic safety car / yellow flag event check
        const scRoll = Math.random();
        const isSafetyCarActive = scRoll < (selectedTrack.safetyCarProbability * 0.03);
        if (isSafetyCarActive && raceLogs.length < 10) {
          setRaceLogs((prev) => [
            {
              id: 'sc-' + Date.now(),
              lap: nextLap,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: 'SAFETY_CAR',
              driverCode: 'RACE CONTROL',
              message: `SAFETY CAR DEPLOYED (Lap ${nextLap}) · Debris / Incident Sector 2. Pit window discount active!`,
            },
            ...prev,
          ]);
        }

        // Simulate 1 Lap for all drivers
        setDrivers((prevDrivers) => {
          // 1. Calculate new lap times, wear, and pit stop states
          const updated = prevDrivers.map((drv) => {
            // Check if driver is already retired
            if (drv.status === 'Retired') {
              return drv;
            }

            let isPittingNow = false;
            let currentStatus = drv.status;
            let currentPitStops = drv.pitStops;
            let pittedLaps = [...drv.pittedLaps];
            let pitDuration = drv.lastPitStopDurationSec;

            // Handle Pit Stop status transitions
            if (currentStatus === 'In Pit') {
              // Complete pit stop!
              currentStatus = 'Out Lap';
              currentPitStops += 1;
              pittedLaps.push(nextLap);
              pitDuration = Number((2.1 + Math.random() * 0.7).toFixed(2));
            } else if (currentStatus === 'Out Lap') {
              currentStatus = 'On Track';
            }

            // Auto-Pit Decision for AI Drivers if wear is critical (> 78%) or forced emergency pit
            if ((drv.tyre.wearPercent > 78 || drv.tyre.wearPercent >= 100) && currentStatus === 'On Track') {
              isPittingNow = true;
              currentStatus = 'In Pit';
            }

            // Compound wear per lap scaled by track abrasion index
            const compoundFactor = drv.tyre.compound.includes('Soft')
              ? 1.6
              : drv.tyre.compound.includes('Hard')
              ? 0.45
              : 0.95;

            const wearIncrement = (selectedTrack.tyreAbrasionIndex * 0.75) * compoundFactor + (Math.random() * 0.3);

            let newWear = isPittingNow || currentStatus === 'Out Lap' ? 2 : Math.min(100, Math.round(drv.tyre.wearPercent + wearIncrement));
            let newAge = isPittingNow || currentStatus === 'Out Lap' ? 1 : drv.tyre.ageLaps + 1;
            let newCompound = isPittingNow
              ? (drv.tyre.compound.includes('Medium') ? 'C2 (Hard)' : 'C3 (Medium)')
              : drv.tyre.compound;

            // Non-linear Tyre Degradation ("The Tyre Cliff")
            // Exponential degradation curve: sharp pace loss past 75% wear
            let wearPenaltySec = 0;
            if (newWear >= 100) {
              // CRITICAL TYRE FAILURE / PUNCTURE LIMP MODE
              wearPenaltySec = 14.5; // Extreme +14.5s limp mode!
            } else if (newWear >= 75) {
              const cliffRatio = (newWear - 75) / 25;
              wearPenaltySec = 2.2 + Math.pow(cliffRatio, 2.8) * 5.8; // +2.2s to +8.0s sharp drop-off!
            } else if (newWear >= 50) {
              wearPenaltySec = 0.8 + Math.pow((newWear - 50) / 25, 1.8) * 1.4;
            } else {
              wearPenaltySec = (newWear / 50) * 0.75;
            }

            // Base lap time calculation with stochastic fluctuations
            const pitLoss = isPittingNow
              ? (isSafetyCarActive ? selectedTrack.pitLaneLossSec * 0.55 : selectedTrack.pitLaneLossSec) + (pitDuration || 2.4)
              : 0;

            const driverPaceNoise = (Math.random() - 0.5) * 0.45;
            const scPacePenalty = isSafetyCarActive ? 22.0 : 0;
            
            const lapTimeSec = selectedTrack.avgLapTimeSec + (drv.position * 0.06) + wearPenaltySec + pitLoss + scPacePenalty + driverPaceNoise;

            const formatTime = (sec: number) => {
              const m = Math.floor(sec / 60);
              const s = (sec % 60).toFixed(3);
              return `${m}:${s.padStart(6, '0')}`;
            };

            const s1 = (lapTimeSec * 0.315).toFixed(3);
            const s2 = (lapTimeSec * 0.400).toFixed(3);
            const s3 = (lapTimeSec * 0.285).toFixed(3);

            // 4-Wheel Corner Wear
            const fl = Math.min(100, Math.round(newWear * 1.05));
            const fr = Math.min(100, Math.round(newWear * 0.95));
            const rl = Math.min(100, Math.round(newWear * 1.02));
            const rr = Math.min(100, Math.round(newWear * 0.92));

            // Check if 100% wear causes retirement after 2 consecutive 100% laps
            if (newWear >= 100 && drv.tyre.wearPercent >= 100 && !isPittingNow && currentStatus !== 'In Pit') {
              currentStatus = 'Retired';
            }

            // Pit window status badge
            let windowStatus: DriverTelemetry['pitWindowStatus'] = 'Closed';
            if (currentStatus === 'Retired') windowStatus = 'CRITICAL WEAR';
            else if (newWear >= 80) windowStatus = 'CRITICAL WEAR';
            else if (newWear >= 55) windowStatus = 'Overdue';
            else if (newWear >= 30) windowStatus = 'OPTIMAL WINDOW';
            else if (newWear >= 18) windowStatus = 'Opening Soon';

            return {
              ...drv,
              totalRaceTimeSec: drv.totalRaceTimeSec + lapTimeSec,
              lastLapTimeSec: lapTimeSec,
              lastLapTime: formatTime(lapTimeSec),
              sector1Time: s1,
              sector2Time: s2,
              sector3Time: s3,
              pitStops: currentPitStops,
              pittedLaps,
              lastPitStopDurationSec: pitDuration,
              status: currentStatus,
              pitWindowStatus: windowStatus,
              tyre: {
                ...drv.tyre,
                compound: newCompound as any,
                ageLaps: newAge,
                wearPercent: newWear,
                cornerWear: { fl, fr, rl, rr },
                surfaceTemp: Math.round(98 + (newWear * 0.22) + (Math.random() * 3)),
                coreTemp: Math.round(95 + (newWear * 0.14)),
                thermalBandStatus: newWear > 65 ? 'Overheated' : 'Optimal',
                grainingRisk: newWear > 60 ? 'Severe' : newWear > 35 ? 'Moderate' : 'Low',
              },
            };
          });

          // 2. Sort leaderboard dynamically by cumulative race time (Retired drivers move to back)
          updated.sort((a, b) => {
            if (a.status === 'Retired' && b.status !== 'Retired') return 1;
            if (a.status !== 'Retired' && b.status === 'Retired') return -1;
            return a.totalRaceTimeSec - b.totalRaceTimeSec;
          });

          // 3. Update positions and recalculate gaps to leader and interval
          const leaderTime = updated[0].totalRaceTimeSec;
          return updated.map((drv, idx) => {
            const pos = idx + 1;
            const gapLeader = drv.status === 'Retired'
              ? 'RETIRED'
              : pos === 1
              ? 'LEADER'
              : `+${(drv.totalRaceTimeSec - leaderTime).toFixed(3)}s`;
            
            const prevTime = idx === 0 ? leaderTime : updated[idx - 1].totalRaceTimeSec;
            const gapAhead = drv.status === 'Retired'
              ? 'RETIRED'
              : pos === 1
              ? 'INTERVAL'
              : `+${(drv.totalRaceTimeSec - prevTime).toFixed(3)}s`;

            return {
              ...drv,
              position: pos,
              gapToLeader: gapLeader,
              gapToAhead: gapAhead,
              predictedRejoinPos: Math.min(updated.length, pos + 3),
            };
          });
        });

        return nextLap;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, simSpeed, selectedTrack, raceLogs.length]);

  // Sync selected driver object when grid drivers array updates
  useEffect(() => {
    const updated = drivers.find((d) => d.driverCode === selectedDriver.driverCode);
    if (updated) setSelectedDriver(updated);
  }, [drivers, selectedDriver.driverCode]);

  const pitScenarios: PitOptionScenario[] = calculatePitScenarios(
    selectedDriver,
    drivers,
    selectedTrack.pitLaneLossSec,
    currentLap,
    selectedTrack.totalLaps
  );

  const handleQuickPit = (driverCode: string, compound: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.driverCode === driverCode) {
          const newPittedLaps = [...d.pittedLaps, currentLap];
          return {
            ...d,
            status: 'In Pit',
            pitStops: d.pitStops + 1,
            pittedLaps: newPittedLaps,
            lastPitStopDurationSec: 2.38,
            tyre: {
              ...d.tyre,
              compound: compound as any,
              ageLaps: 0,
              wearPercent: 2,
              cornerWear: { fl: 2, fr: 2, rl: 2, rr: 2 },
              surfaceTemp: 98,
              coreTemp: 95,
              grainingRisk: 'Low',
              blisteringRisk: 'Low',
              thermalBandStatus: 'Optimal',
            },
            pitWindowStatus: 'Closed',
          };
        }
        return d;
      })
    );
  };

  const handleSwitchToCopilotWithPrompt = (promptText: string) => {
    setCopilotPrompt(promptText);
    setActiveScreen('screen-4');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-slate-100 font-sans antialiased selection:bg-[#E10600] selection:text-white">
      {/* Top Cockpit Header & Navigation Bar */}
      <Header
        tracks={tracks}
        selectedTrack={selectedTrack}
        onSelectTrack={handleSelectTrack}
        currentLap={currentLap}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onResetSim={handleResetSim}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        voiceActive={voiceActive}
        onToggleVoice={() => setVoiceActive(!voiceActive)}
      />

      {/* Primary Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeScreen === 'screen-1' && (
          <StrategyWall
            drivers={drivers}
            selectedDriver={selectedDriver}
            onSelectDriver={setSelectedDriver}
            track={selectedTrack}
            currentLap={currentLap}
            pitScenarios={pitScenarios}
            onTriggerQuickPit={handleQuickPit}
            onSwitchToCopilot={handleSwitchToCopilotWithPrompt}
          />
        )}

        {activeScreen === 'screen-2' && (
          <TelemetryAnalytics drivers={drivers} selectedTrack={selectedTrack} />
        )}

        {activeScreen === 'screen-3' && (
          <TyreDegradationMatrix
            drivers={drivers}
            selectedDriver={selectedDriver}
            onSelectDriver={setSelectedDriver}
            track={selectedTrack}
          />
        )}

        {activeScreen === 'screen-4' && (
          <AiRaceCopilot
            selectedDriver={selectedDriver}
            selectedTrack={selectedTrack}
            currentLap={currentLap}
            initialPrompt={copilotPrompt}
            voiceActive={voiceActive}
            onToggleVoice={() => setVoiceActive(!voiceActive)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
