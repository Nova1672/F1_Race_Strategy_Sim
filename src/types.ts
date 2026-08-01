export type CompoundName = 'C1 (Hardest)' | 'C2 (Hard)' | 'C3 (Medium)' | 'C4 (Soft)' | 'C5 (Softest)' | 'Intermediate' | 'Full Wet';

export interface CornerWear {
  fl: number; // Front Left 0-100%
  fr: number; // Front Right 0-100%
  rl: number; // Rear Left 0-100%
  rr: number; // Rear Right 0-100%
}

export interface TyreInfo {
  compound: CompoundName;
  ageLaps: number;
  wearPercent: number; // 0 to 100 overall
  cornerWear: CornerWear;
  coreTemp: number; // °C
  surfaceTemp: number; // °C
  grainingRisk: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  blisteringRisk: 'Low' | 'Moderate' | 'High';
  thermalBandStatus: 'Optimal' | 'Underheated' | 'Overheated';
}

export interface DriverTelemetry {
  driverCode: string;
  driverName: string;
  number: number;
  team: string;
  teamColor: string;
  position: number;
  totalRaceTimeSec: number; // Total cumulative time in seconds
  gapToLeader: string;
  gapToAhead: string;
  intervalMs: number;
  lastLapTime: string;
  bestLapTime: string;
  lastLapTimeSec: number;
  sector1Time: string;
  sector2Time: string;
  sector3Time: string;
  currentSpeed: number; // km/h
  throttle: number; // %
  brake: number; // %
  gear: number; // 1-8
  rpm: number; // 0-15000
  drsActive: boolean;
  steerAngle: number; // degrees
  tyre: TyreInfo;
  pitStops: number;
  pittedLaps: number[];
  lastPitStopDurationSec?: number;
  lastPitCompound?: string;
  status: 'On Track' | 'In Pit' | 'Out Lap' | 'Retired';
  predictedRejoinPos: number;
  pitWindowStatus: 'Closed' | 'Opening Soon' | 'OPTIMAL WINDOW' | 'Overdue' | 'CRITICAL WEAR';
}

export interface TelemetryTracePoint {
  distance: number; // meters along circuit
  cornerName?: string;
  driver1Speed: number;
  driver2Speed: number;
  driver1Throttle: number;
  driver2Throttle: number;
  driver1Brake: number;
  driver2Brake: number;
  driver1Gear: number;
  driver2Gear: number;
  driver1Drs: number; // 0 or 1
  driver2Drs: number; // 0 or 1
  timeDeltaMs: number; // + or - relative to Driver 1
}

export interface TyreDegradationCurvePoint {
  lapAge: number;
  c1PaceLossSec: number;
  c2PaceLossSec: number;
  c3PaceLossSec: number;
  c4PaceLossSec: number;
  c5PaceLossSec: number;
  interPaceLossSec: number;
  wetPaceLossSec: number;
  c3ThermalDegTemp: number;
}

export interface TrackCircuit {
  id: string;
  name: string;
  country: string;
  flagEmoji: string;
  lengthKm: number;
  totalLaps: number;
  pitLaneLossSec: number;
  avgLapTimeSec: number;
  drsZonesCount: number;
  turnsCount: number;
  tyreAbrasionIndex: number; // 1 to 5 scale
  overtakingDifficulty: 'Low' | 'Medium' | 'High' | 'Extreme';
  airTemp: number;
  trackTemp: number;
  rainIntensityPercent: number;
  trackCondition: 'Dry' | 'Damp' | 'Wet' | 'Torrential';
  safetyCarProbability: number; // 0 to 1
  sectors: {
    s1LengthM: number;
    s2LengthM: number;
    s3LengthM: number;
  };
}

export interface PitOptionScenario {
  id: string;
  name: string;
  strategyName: string;
  targetPitLap: number;
  newCompound: CompoundName;
  estimatedStint2Length: number;
  rejoinPosition: number;
  rejoinGapSec: number;
  rejoinTrafficCar: string;
  undercutDeltaSec: number;
  overallRaceTimeDeltaSec: number;
  confidenceScore: number; // 0 to 100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  recommendationReason: string;
}

export interface MonteCarloSimResult {
  simulationsRun: number;
  p1ProbabilityPercent: number;
  podiumProbabilityPercent: number;
  top5ProbabilityPercent: number;
  avgFinishPosition: number;
  bestFinishPosition: number;
  worstFinishPosition: number;
  safetyCarTriggeredCount: number;
  rainInterventionCount: number;
  strategyWinRates: {
    strategyName: string;
    winRatePercent: number;
    avgRaceTimeSec: number;
  }[];
}

export interface LiveRaceEventLog {
  id: string;
  lap: number;
  timestamp: string;
  type: 'PIT_STOP' | 'OVERTAKE' | 'FASTEST_LAP' | 'TYRE_CRITICAL' | 'SAFETY_CAR';
  driverCode: string;
  message: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  recommendations?: string[];
}
