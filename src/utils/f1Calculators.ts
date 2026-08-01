import { CompoundName, TyreDegradationCurvePoint, TelemetryTracePoint, DriverTelemetry, PitOptionScenario, MonteCarloSimResult, TrackCircuit } from '../types';

// Generate Tyre Degradation Curves customized per track abrasion index & track temperature
export function generateTyreDegradationData(maxLaps: number = 35, abrasionIndex: number = 4.0, trackTemp: number = 34): TyreDegradationCurvePoint[] {
  const points: TyreDegradationCurvePoint[] = [];

  // Abrasion multiplier scaled against baseline (3.0)
  const abrMult = Math.max(0.5, abrasionIndex / 3.0);
  const tempMult = 1 + (trackTemp - 30) * 0.015;

  for (let lap = 1; lap <= maxLaps; lap++) {
    // Non-linear wear formulas scaled by track abrasion and temperature
    const c1 = (0.018 * lap + 0.0006 * Math.pow(lap, 2)) * abrMult * tempMult; // Hardest, ultra low wear
    const c2 = (0.030 * lap + 0.0010 * Math.pow(lap, 2)) * abrMult * tempMult;
    const c3 = (0.050 * lap + 0.0020 * Math.pow(lap, 2)) * abrMult * tempMult; // Medium
    const c4 = (0.085 * lap + 0.0040 * Math.pow(lap, 2)) * abrMult * tempMult; // Soft
    const c5 = (0.140 * lap + 0.0085 * Math.pow(lap, 2)) * abrMult * tempMult; // Softest, rapid cliff
    const inter = (0.038 * lap + 0.0014 * Math.pow(lap, 2)) * abrMult;
    const wet = (0.028 * lap + 0.0009 * Math.pow(lap, 2)) * abrMult;

    const c3Temp = 95 + (0.8 * lap * abrMult) + (lap > 18 ? Math.pow(lap - 18, 1.4) * abrMult : 0);

    points.push({
      lapAge: lap,
      c1PaceLossSec: Number(c1.toFixed(3)),
      c2PaceLossSec: Number(c2.toFixed(3)),
      c3PaceLossSec: Number(c3.toFixed(3)),
      c4PaceLossSec: Number(c4.toFixed(3)),
      c5PaceLossSec: Number(c5.toFixed(3)),
      interPaceLossSec: Number(inter.toFixed(3)),
      wetPaceLossSec: Number(wet.toFixed(3)),
      c3ThermalDegTemp: Math.round(c3Temp),
    });
  }

  return points;
}

// Generate high-resolution telemetry trace for Driver 1 vs Driver 2 across a lap on a specific track
export function generateTelemetryTraceData(
  driver1Code: string = 'HAM',
  driver2Code: string = 'VER',
  track?: TrackCircuit
): TelemetryTracePoint[] {
  const trace: TelemetryTracePoint[] = [];
  const trackLength = track ? track.lengthKm * 1000 : 5891; // Meters
  const step = 50; // Every 50 meters

  for (let dist = 0; dist <= trackLength; dist += step) {
    let cornerName: string | undefined = undefined;
    const trackId = track?.id || 'silverstone';

    if (trackId === 'monaco') {
      if (dist >= 200 && dist <= 350) cornerName = 'T1 (Sainte Dévote)';
      else if (dist >= 700 && dist <= 850) cornerName = 'T4 (Casino)';
      else if (dist >= 1100 && dist <= 1250) cornerName = 'T6 (Grand Hôtel Hairpin)';
      else if (dist >= 1500 && dist <= 1750) cornerName = 'T8 (Portier / Tunnel)';
      else if (dist >= 2200 && dist <= 2450) cornerName = 'T10-T11 (Nouvelle Chicane)';
      else if (dist >= 2800 && dist <= 3000) cornerName = 'T15-T16 (Piscine)';
    } else if (trackId === 'monza') {
      if (dist >= 900 && dist <= 1200) cornerName = 'T1-T2 (Variante del Rettifilo)';
      else if (dist >= 2000 && dist <= 2250) cornerName = 'T4-T5 (Variante della Roggia)';
      else if (dist >= 3000 && dist <= 3300) cornerName = 'T6-T7 (Lesmo 1 & 2)';
      else if (dist >= 4200 && dist <= 4500) cornerName = 'T8-T10 (Variante Ascari)';
      else if (dist >= 5100 && dist <= 5400) cornerName = 'T11 (Curva Parabolica)';
    } else if (trackId === 'spa') {
      if (dist >= 300 && dist <= 500) cornerName = 'T1 (La Source)';
      else if (dist >= 900 && dist <= 1300) cornerName = 'T2-T4 (Eau Rouge / Raidillon)';
      else if (dist >= 2400 && dist <= 2800) cornerName = 'T7-T8 (Les Combes)';
      else if (dist >= 4000 && dist <= 4400) cornerName = 'T10-T11 (Pouhon)';
      else if (dist >= 6200 && dist <= 6600) cornerName = 'T18-T19 (Bus Stop Chicane)';
    } else {
      if (dist >= 400 && dist <= 600) cornerName = 'T1 (Abbey)';
      else if (dist >= 1200 && dist <= 1400) cornerName = 'T3 (Village)';
      else if (dist >= 2100 && dist <= 2400) cornerName = 'T6 (Brooklands)';
      else if (dist >= 3200 && dist <= 3600) cornerName = 'T9 (Copse)';
      else if (dist >= 4100 && dist <= 4600) cornerName = 'T10-T14 (Maggotts-Becketts)';
      else if (dist >= 5200 && dist <= 5500) cornerName = 'T15 (Stowe)';
    }

    // Top speed calculation
    const topSpeedTrack = trackId === 'monza' ? 352 : trackId === 'monaco' ? 290 : 325;
    let baseSpeed = topSpeedTrack - 20 + 12 * Math.sin(dist / 350);
    let d1Throttle = 100;
    let d1Brake = 0;
    let d1Gear = 8;
    let d1Drs = 0;

    let d2Throttle = 100;
    let d2Brake = 0;
    let d2Gear = 8;
    let d2Drs = 0;

    // Corner braking zones
    if (cornerName) {
      if (cornerName.includes('Hairpin') || cornerName.includes('La Source') || cornerName.includes('Rettifilo')) {
        baseSpeed = 75 + 15 * Math.cos(dist / 40);
        d1Throttle = 15;
        d1Brake = 85;
        d1Gear = 1;
        d2Throttle = 20;
        d2Brake = 75;
        d2Gear = 2;
      } else if (cornerName.includes('Eau Rouge') || cornerName.includes('Copse') || cornerName.includes('Parabolica')) {
        baseSpeed = 265 + 20 * Math.sin(dist / 120);
        d1Throttle = 92;
        d1Brake = 5;
        d1Gear = 7;
        d2Throttle = 96;
        d2Brake = 0;
        d2Gear = 7;
      } else {
        baseSpeed = 160 + 25 * Math.sin(dist / 70);
        d1Throttle = 55;
        d1Brake = 40;
        d1Gear = 4;
        d2Throttle = 60;
        d2Brake = 30;
        d2Gear = 4;
      }
    } else {
      // Straight lines DRS
      if ((dist > 1500 && dist < 2100) || (dist > 3600 && dist < 4200)) {
        d1Drs = 1;
        d2Drs = 1;
        baseSpeed += 14;
      }
    }

    const d1Speed = Math.round(baseSpeed + (Math.sin(dist / 180) * 3));
    const d2Speed = Math.round(baseSpeed + (Math.cos(dist / 160) * 4) + 1.2);

    const delta = (d1Speed - d2Speed) * -0.008;

    trace.push({
      distance: dist,
      cornerName,
      driver1Speed: Math.max(65, d1Speed),
      driver2Speed: Math.max(65, d2Speed),
      driver1Throttle: Math.min(100, Math.max(0, d1Throttle)),
      driver2Throttle: Math.min(100, Math.max(0, d2Throttle)),
      driver1Brake: Math.min(100, Math.max(0, d1Brake)),
      driver2Brake: Math.min(100, Math.max(0, d2Brake)),
      driver1Gear: d1Gear,
      driver2Gear: d2Gear,
      driver1Drs: d1Drs,
      driver2Drs: d2Drs,
      timeDeltaMs: Number(delta.toFixed(3)),
    });
  }

  return trace;
}

// Calculate Pit Options and Rejoin positions dynamically
export function calculatePitScenarios(
  driver: DriverTelemetry,
  driversList: DriverTelemetry[],
  pitLossSec: number = 20.5,
  currentLap: number = 24,
  totalLaps: number = 52
): PitOptionScenario[] {
  const currentPos = driver.position;

  // Scenario 1: Undercut Box Now
  const lap1Pits = currentLap + 1;
  const hardStintLaps = totalLaps - lap1Pits;
  const hardRejoinPos = Math.min(driversList.length, Math.max(1, currentPos + 2));
  const hardTrafficCar = driversList.find((d) => d.position === hardRejoinPos)?.driverCode || 'RUS';

  // Scenario 2: Extend 4 Laps
  const lap2Pits = currentLap + 4;
  const softStintLaps = totalLaps - lap2Pits;
  const softRejoinPos = Math.min(driversList.length, Math.max(1, currentPos + 1));
  const softTrafficCar = driversList.find((d) => d.position === softRejoinPos)?.driverCode || 'PIA';

  // Scenario 3: Safety Car Reaction
  const scRejoinPos = Math.max(1, currentPos);
  const scTrafficCar = driversList.find((d) => d.position === scRejoinPos)?.driverCode || 'VER';

  return [
    {
      id: 'scen-1',
      name: 'Plan A: Immediate Undercut',
      strategyName: 'Box Lap ' + lap1Pits + ' -> C2 Hard',
      targetPitLap: lap1Pits,
      newCompound: 'C2 (Hard)',
      estimatedStint2Length: hardStintLaps,
      rejoinPosition: hardRejoinPos,
      rejoinGapSec: 2.4,
      rejoinTrafficCar: hardTrafficCar,
      undercutDeltaSec: -1.85,
      overallRaceTimeDeltaSec: -4.2,
      confidenceScore: 92,
      riskLevel: 'Low Risk',
      recommendationReason: 'Pits into clear air ahead of ' + hardTrafficCar + '. Fresh Hards yield a 1.85s lap advantage.',
    },
    {
      id: 'scen-2',
      name: 'Plan B: Extend Stint & Soft Sprint',
      strategyName: 'Box Lap ' + lap2Pits + ' -> C4 Soft',
      targetPitLap: lap2Pits,
      newCompound: 'C4 (Soft)',
      estimatedStint2Length: softStintLaps,
      rejoinPosition: softRejoinPos,
      rejoinGapSec: 0.8,
      rejoinTrafficCar: softTrafficCar,
      undercutDeltaSec: +0.65,
      overallRaceTimeDeltaSec: +1.1,
      confidenceScore: 74,
      riskLevel: 'Medium Risk',
      recommendationReason: 'Extends stint to build pit window gap. Rejoins close to ' + softTrafficCar + ' with high soft tyre degradation in final laps.',
    },
    {
      id: 'scen-3',
      name: 'Plan C: Safety Car Opportunity',
      strategyName: 'VSC / SC Trigger -> C3 Medium',
      targetPitLap: Math.min(totalLaps - 1, currentLap + 2),
      newCompound: 'C3 (Medium)',
      estimatedStint2Length: Math.max(1, totalLaps - (currentLap + 2)),
      rejoinPosition: scRejoinPos,
      rejoinGapSec: 4.8,
      rejoinTrafficCar: scTrafficCar,
      undercutDeltaSec: -6.40,
      overallRaceTimeDeltaSec: -11.5,
      confidenceScore: 88,
      riskLevel: 'High Risk',
      recommendationReason: 'Saves ' + (pitLossSec * 0.4).toFixed(1) + 's in pit lane under VSC conditions. Rejoins right on the tail of leader.',
    },
  ];
}

// Monte Carlo Stochastic Race Simulator Engine
export function runMonteCarloSimulation(
  simCount: number = 10000,
  safetyCarProb: number = 0.62,
  trackTemp: number = 34
): MonteCarloSimResult {
  let p1Wins = 0;
  let podiums = 0;
  let top5s = 0;
  let scTriggers = 0;
  let rainInterventions = 0;

  for (let i = 0; i < simCount; i++) {
    const scRoll = Math.random();
    const pitTimeSec = 2.45 + (Math.random() - 0.5) * 0.7;
    const trafficDelaySec = Math.random() < 0.2 ? Math.random() * 2.5 : 0;
    const paceVariance = (Math.random() - 0.5) * 0.4;

    const netDelta = (pitTimeSec - 2.45) + trafficDelaySec + paceVariance;

    if (scRoll < safetyCarProb) scTriggers++;
    if (Math.random() < 0.08) rainInterventions++;

    if (netDelta < -0.5) {
      p1Wins++;
      podiums++;
      top5s++;
    } else if (netDelta < 1.2) {
      podiums++;
      top5s++;
    } else if (netDelta < 3.5) {
      top5s++;
    }
  }

  const p1Pct = Number(((p1Wins / simCount) * 100).toFixed(1));
  const podiumPct = Number(((podiums / simCount) * 100).toFixed(1));
  const top5Pct = Number(((top5s / simCount) * 100).toFixed(1));

  return {
    simulationsRun: simCount,
    p1ProbabilityPercent: p1Pct,
    podiumProbabilityPercent: podiumPct,
    top5ProbabilityPercent: top5Pct,
    avgFinishPosition: Number((1 + (100 - p1Pct) * 0.02).toFixed(1)),
    bestFinishPosition: 1,
    worstFinishPosition: 5,
    safetyCarTriggeredCount: scTriggers,
    rainInterventionCount: rainInterventions,
    strategyWinRates: [
      { strategyName: 'Plan A (Undercut Lap 25 -> C2 Hard)', winRatePercent: p1Pct, avgRaceTimeSec: 4620.4 },
      { strategyName: 'Plan B (Extend Lap 28 -> C4 Soft)', winRatePercent: Number((p1Pct * 0.65).toFixed(1)), avgRaceTimeSec: 4625.8 },
      { strategyName: 'Plan C (SC Reaction -> C3 Medium)', winRatePercent: Number((p1Pct * 0.85).toFixed(1)), avgRaceTimeSec: 4615.2 },
    ],
  };
}
