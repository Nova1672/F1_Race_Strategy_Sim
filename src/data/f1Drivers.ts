import { DriverTelemetry, TrackCircuit } from '../types';

export const ALL_F1_DRIVERS_BASE = [
  { driverCode: 'VER', driverName: 'Max Verstappen', number: 1, team: 'Red Bull Racing', teamColor: '#3671C6', basePaceRating: 9.9 },
  { driverCode: 'NOR', driverName: 'Lando Norris', number: 4, team: 'McLaren F1 Team', teamColor: '#FF8000', basePaceRating: 9.7 },
  { driverCode: 'HAM', driverName: 'Lewis Hamilton', number: 44, team: 'Scuderia Ferrari', teamColor: '#E8002D', basePaceRating: 9.6 },
  { driverCode: 'LEC', driverName: 'Charles Leclerc', number: 16, team: 'Scuderia Ferrari', teamColor: '#E8002D', basePaceRating: 9.6 },
  { driverCode: 'PIA', driverName: 'Oscar Piastri', number: 81, team: 'McLaren F1 Team', teamColor: '#FF8000', basePaceRating: 9.5 },
  { driverCode: 'RUS', driverName: 'George Russell', number: 63, team: 'Mercedes-AMG F1', teamColor: '#27F4D2', basePaceRating: 9.4 },
  { driverCode: 'ALO', driverName: 'Fernando Alonso', number: 14, team: 'Aston Martin F1', teamColor: '#229971', basePaceRating: 9.2 },
  { driverCode: 'ANT', driverName: 'Kimi Antonelli', number: 12, team: 'Mercedes-AMG F1', teamColor: '#27F4D2', basePaceRating: 9.0 },
  { driverCode: 'SAI', driverName: 'Carlos Sainz', number: 55, team: 'Williams Racing', teamColor: '#64C4FF', basePaceRating: 9.0 },
  { driverCode: 'LAW', driverName: 'Liam Lawson', number: 30, team: 'Red Bull Racing', teamColor: '#3671C6', basePaceRating: 8.9 },
  { driverCode: 'GAS', driverName: 'Pierre Gasly', number: 10, team: 'Alpine F1 Team', teamColor: '#0093CC', basePaceRating: 8.7 },
  { driverCode: 'ALB', driverName: 'Alex Albon', number: 23, team: 'Williams Racing', teamColor: '#64C4FF', basePaceRating: 8.6 },
  { driverCode: 'HUL', driverName: 'Nico Hülkenberg', number: 27, team: 'Kick Sauber F1', teamColor: '#52E252', basePaceRating: 8.5 },
  { driverCode: 'OCO', driverName: 'Esteban Ocon', number: 31, team: 'Haas F1 Team', teamColor: '#B6BABD', basePaceRating: 8.5 },
  { driverCode: 'TSU', driverName: 'Yuki Tsunoda', number: 22, team: 'RB Formula One Team', teamColor: '#6692FF', basePaceRating: 8.5 },
  { driverCode: 'STR', driverName: 'Lance Stroll', number: 18, team: 'Aston Martin F1', teamColor: '#229971', basePaceRating: 8.2 },
  { driverCode: 'BEA', driverName: 'Oliver Bearman', number: 87, team: 'Haas F1 Team', teamColor: '#B6BABD', basePaceRating: 8.4 },
  { driverCode: 'HAD', driverName: 'Isack Hadjar', number: 6, team: 'RB Formula One Team', teamColor: '#6692FF', basePaceRating: 8.3 },
  { driverCode: 'DOO', driverName: 'Jack Doohan', number: 7, team: 'Alpine F1 Team', teamColor: '#0093CC', basePaceRating: 8.1 },
  { driverCode: 'BOR', driverName: 'Gabriel Bortoleto', number: 5, team: 'Kick Sauber F1', teamColor: '#52E252', basePaceRating: 8.2 },
  { driverCode: 'COL', driverName: 'Franco Colapinto', number: 43, team: 'Williams Reserve', teamColor: '#64C4FF', basePaceRating: 8.3 },
  { driverCode: 'BOT', driverName: 'Valtteri Bottas', number: 77, team: 'Mercedes Reserve', teamColor: '#27F4D2', basePaceRating: 8.4 },
  { driverCode: 'RIC', driverName: 'Daniel Ricciardo', number: 3, team: 'Red Bull Reserve', teamColor: '#3671C6', basePaceRating: 8.3 },
  { driverCode: 'MAG', driverName: 'Kevin Magnussen', number: 20, team: 'Haas Reserve', teamColor: '#B6BABD', basePaceRating: 8.2 },
];

export function generateRaceGridForTrack(track: TrackCircuit, startLap: number = 1): DriverTelemetry[] {
  const baseAvgLapSec = track.avgLapTimeSec;
  
  // Create randomized qualifying performance score influenced by driver pace + track specific luck
  const qualified = ALL_F1_DRIVERS_BASE.map((drv) => {
    const randomQualifyingFactor = (Math.random() - 0.5) * 1.8;
    const trackSeed = (drv.driverCode.charCodeAt(0) * track.name.length * 17) % 30;
    const qualifyingScore = (drv.basePaceRating * 10) + randomQualifyingFactor - (trackSeed * 0.1);
    return { ...drv, qualifyingScore };
  }).sort((a, b) => b.qualifyingScore - a.qualifyingScore);

  let accumulatedRaceTimeSec = 0;

  return qualified.map((drv, idx) => {
    const pos = idx + 1;
    const gapFromPrev = idx === 0 ? 0 : 0.8 + (Math.random() * 2.2);
    accumulatedRaceTimeSec += (pos === 1 ? (startLap - 1) * baseAvgLapSec : gapFromPrev);

    const baseLap = baseAvgLapSec + (pos * 0.10) + (Math.random() * 0.4 - 0.2);
    const s1 = (baseLap * 0.315).toFixed(3);
    const s2 = (baseLap * 0.400).toFixed(3);
    const s3 = (baseLap * 0.285).toFixed(3);
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = (sec % 60).toFixed(3);
      return `${m}:${s.padStart(6, '0')}`;
    };

    // Stint & compound setup
    const initialCompoundChoice = pos <= 8 ? 'C3 (Medium)' : pos <= 16 ? 'C4 (Soft)' : 'C2 (Hard)';
    const age = Math.max(1, startLap - 1);
    
    // Wear calculation dynamically tied to track abrasion index!
    const baseWearPerLap = (track.tyreAbrasionIndex * 0.85) + (initialCompoundChoice.includes('Soft') ? 1.4 : initialCompoundChoice.includes('Hard') ? -0.4 : 0);
    const currentWear = Math.min(95, Math.round(age * baseWearPerLap));

    const fl = Math.min(100, Math.round(currentWear * (1 + (track.id === 'silverstone' ? 0.2 : 0))));
    const fr = Math.min(100, Math.round(currentWear * 0.95));
    const rl = Math.min(100, Math.round(currentWear * (1 + (track.id === 'monza' ? 0.2 : 0))));
    const rr = Math.min(100, Math.round(currentWear * 0.9));

    return {
      driverCode: drv.driverCode,
      driverName: drv.driverName,
      number: drv.number,
      team: drv.team,
      teamColor: drv.teamColor,
      position: pos,
      totalRaceTimeSec: accumulatedRaceTimeSec,
      gapToLeader: pos === 1 ? 'LEADER' : `+${(accumulatedRaceTimeSec - (startLap - 1) * baseAvgLapSec).toFixed(3)}s`,
      gapToAhead: pos === 1 ? 'INTERVAL' : `+${gapFromPrev.toFixed(3)}s`,
      intervalMs: Math.round(gapFromPrev * 1000),
      lastLapTime: formatTime(baseLap),
      bestLapTime: formatTime(baseAvgLapSec - 0.9 + (pos * 0.04)),
      lastLapTimeSec: baseLap,
      sector1Time: s1,
      sector2Time: s2,
      sector3Time: s3,
      currentSpeed: Math.round(310 + (drv.basePaceRating * 1.5) - (pos * 0.3)),
      throttle: pos <= 3 ? 100 : 98,
      brake: 0,
      gear: 8,
      rpm: Math.round(12000 + (drv.basePaceRating * 50)),
      drsActive: pos > 1 && gapFromPrev < 1.0,
      steerAngle: Math.round((Math.random() - 0.5) * 4),
      tyre: {
        compound: initialCompoundChoice as any,
        ageLaps: age,
        wearPercent: currentWear,
        cornerWear: { fl, fr, rl, rr },
        coreTemp: Math.round(98 + (currentWear * 0.15)),
        surfaceTemp: Math.round(102 + (currentWear * 0.25)),
        grainingRisk: currentWear > 60 ? 'Severe' : currentWear > 35 ? 'Moderate' : 'Low',
        blisteringRisk: currentWear > 70 ? 'High' : 'Low',
        thermalBandStatus: currentWear > 65 ? 'Overheated' : 'Optimal',
      },
      pitStops: 0,
      pittedLaps: [],
      status: 'On Track',
      predictedRejoinPos: Math.min(24, pos + 4),
      pitWindowStatus: currentWear > 75 ? 'CRITICAL WEAR' : currentWear > 50 ? 'Overdue' : currentWear > 25 ? 'OPTIMAL WINDOW' : 'Closed',
    };
  });
}

export const INITIAL_DRIVERS: DriverTelemetry[] = generateRaceGridForTrack({
  id: 'silverstone',
  name: 'Silverstone Circuit',
  country: 'Great Britain',
  flagEmoji: '🇬🇧',
  lengthKm: 5.891,
  totalLaps: 52,
  pitLaneLossSec: 20.5,
  avgLapTimeSec: 88.2,
  drsZonesCount: 2,
  turnsCount: 18,
  tyreAbrasionIndex: 4.5,
  overtakingDifficulty: 'Medium',
  airTemp: 22,
  trackTemp: 34,
  rainIntensityPercent: 0,
  trackCondition: 'Dry',
  safetyCarProbability: 0.62,
  sectors: { s1LengthM: 1850, s2LengthM: 2150, s3LengthM: 1891 },
}, 24);

