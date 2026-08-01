# F1 Race Strategy Intelligence Platform — Product Requirements Document (PRD)

**Document Version:** 1.0.0-PROD  
**Status:** Approved for Implementation (Engineering Ready)  
**Authors:** Principal Product Manager, Senior Software Architect, Lead F1 Data Analytics Engineer  
**Classification:** Enterprise Strategic Engineering Standard  
**Target Launch:** 2026 Formula 1 World Championship Season  

---

## 1. Document Control & Metadata

| Attribute | Specification |
|---|---|
| **Project Title** | F1 Race Strategy Intelligence Platform |
| **System Code** | `F1-STRAT-INTEL` |
| **Target Runtime** | Node.js 22 LTS / Express / Vite 6 SPA / Containerized Cloud Infrastructure |
| **Primary Latency SLA** | Telemetry Stream < 50ms ingestion; Pit Window Recommendation < 100ms |
| **Data Ingestion Standard** | FIA Telemetry Protocol v4.2 / UDP Broadcast / WebSocket SSE Stream |
| **AI Subsystem** | Google Gemini 3.6 Flash Server-Side Direct Proxy (`@google/genai`) |

---

## 2. Executive Summary & Vision

The **F1 Race Strategy Intelligence Platform** is an enterprise-grade telemetry visualization, predictive race strategy modeling, and real-time decision-support system designed for Formula 1 pit wall operations, strategy engineers, team principals, and data analysts.

In modern Formula 1, race outcomes are determined in fractions of a second. Factors such as tyre thermal degradation curves, micro-climate weather changes, safety car deployment probability, traffic gap re-entry positions, and rival undercut threats create high-dimensional, time-sensitive decision spaces. 

This platform bridges raw telemetry streams (over 10,000 data points per second per car) with predictive Monte Carlo race simulations and natural language AI strategy synthesis. By synthesizing lap times, tyre degradation physics, telemetry telemetry channels (throttle, brake, RPM, gear, DRS, steering angle), track evolution, and competitor pit window gaps, the system delivers immediate actionable pit call directives.

---

## 3. System Architecture & High-Level Topology

### 3.1 Architecture Overview
The platform follows an **Event-Driven Micro-Architecture** combined with an **In-Memory Physics & Monte Carlo Engine** and **Server-Side AI Proxying**:

```
[ FIA Telemetry / Stream Ingestion ]
                │
                ▼
  [ Node.js / Express Ingestion Engine ] ──► [ In-Memory Telemetry Buffer / Redis Cache ]
                │                                         │
                ├──► [ Tyre Degradation Engine ] ────────┤
                ├──► [ Pit Window / Rejoin Predictor ] ──┤
                └──► [ Monte Carlo Race Simulator ] ─────┘
                                  │
                                  ▼
           [ Server-Side Gemini 3.6 Flash AI Strategy Agent ]
                                  │
                                  ▼
           [ React 19 / Vite SPA Pit Wall Dashboard (Port 3000) ]
```

---

## 4. Core Personas & User Stories

### Persona 1: Head of Race Strategy ("Chief Strategist")
- **Goal:** Real-time visibility into tyre degradation, gap to traffic, and undercut/overcut windows to make high-stakes pit call decisions within a 3-second decision window.
- **User Story:** "As Chief Strategist, I want real-time notifications when rival cars enter my driver's undercut pit window so I can react before they box."

### Persona 2: Performance & Telemetry Engineer
- **Goal:** Compare telemetry traces (throttle, brake, apex speed, speed delta) between two drivers across corners to advise on driver pace optimization and thermal management.
- **User Story:** "As Performance Engineer, I need overlay traces of Speed and Throttle between Driver 1 and Driver 2 to spot where time is lost in Sector 2."

### Persona 3: Race Engineer (Driver Communications)
- **Goal:** Natural language AI assistant queries to ask complex tactical questions ("If safety car comes out on Lap 24, where do we rejoin on Hards vs Softs?") without leaving the primary dashboard.
- **User Story:** "As Race Engineer, I want to type or speak natural language tactical queries to receive clear, synthesized pit options in under 1 second."

---

## 5. Comprehensive Functional Requirements (V1 MVP vs Future Scope)

### Module V1 (MVP Capabilities)
1. **Multi-Car Executive Pit Wall Monitor:** Real-time leaderboard, live gap to leader/car ahead, active tyre compound, stint age, pit stop counter, and live risk badges.
2. **Telemetry Trace Comparison Engine:** Interactive line charts rendering Speed, Throttle, Brake, Gear, DRS usage, and Time Delta between any two selected drivers.
3. **Tyre Degradation Physics Visualizer:** Non-linear degradation curves for C1-C5 Pirelli compounds, core vs surface temperature tracking, and graining/blistering indicators.
4. **Pit Window & Rejoin Predictor:** Gap-to-traffic visualizer with projected track re-entry position upon pit exit, taking pit lane delta time into account.
5. **Monte Carlo Stochastic Simulator:** 1,000-to-10,000 run simulation engine factoring Safety Car probabilities, pit stop time variance, and track evolution.
6. **Gemini 3.6 Flash AI Strategy Copilot:** Server-proxied natural language strategist providing automated pit calls, risk assessments, and tactical summaries.
7. **Interactive Master PRD Documentation Viewer:** Full engineering documentation module embedded directly in the application.

### Module V2 / V3 (Future Horizon Capabilities)
1. **Automated FIA Radio Transcription & NLP Sentiment Mining:** Real-time speech-to-text analysis of competitor radio feeds.
2. **Computer Vision Pit Stop Execution Analysis:** Camera feed tracking of tyre wheel nut torque and jack clearance time.
3. **Direct Wind Tunnel Data Fusion:** Real-time aerodynamic downforce degradation mapping based on front wing damage.

---

## 6. Non-Functional Requirements (NFRs) & SLA Benchmarks

- **Latency:** Telemetry packet processing < 15ms. React visual rerenders < 16ms (60 FPS).
- **Availability:** 99.99% uptime during active race sessions.
- **Scalability:** Handles 20 simultaneous driver channels + 1,000 synthetic Monte Carlo threads.
- **Security:** Zero client-side API key exposure; all LLM calls route through server-side `/api/gemini` endpoint.

---

## 7. Real-Time Telemetry & Data Ingestion Pipeline

### Data Fields Processed
- `speed` (km/h)
- `throttle` (0 - 100%)
- `brake` (0 - 100%)
- `gear` (1 - 8)
- `rpm` (0 - 15,000)
- `drs` (0 = closed, 1 = active)
- `steerAngle` (-360° to +360°)
- `tyreCoreTemp` (°C)
- `tyreSurfaceTemp` (°C)
- `tyreWearPercent` (%)

---

## 8. Tyre Degradation & Physics Engine

### Mathematical Formula
The non-linear tyre wear model follows a modified cubic polynomial with thermal acceleration:

$$\text{Wear}(t) = \alpha \cdot t + \beta \cdot t^2 + \gamma \cdot \left(\frac{T_{\text{surf}}}{T_{\text{opt}}}\right)^3$$

Where:
- $t$ = Lap age on current compound
- $\alpha, \beta$ = Compound degradation coefficients (C1 hard compound lowest, C5 soft compound highest)
- $T_{\text{surf}}$ = Current tyre surface temperature (°C)
- $T_{\text{opt}}$ = Optimal operating window temperature (°C)

---

## 9. Pit Window & Undercut/Overcut Strategy Engine

### Undercut Delta Calculation

$$\Delta_{\text{undercut}} = t_{\text{in\_lap}} + t_{\text{pit\_loss}} + t_{\text{out\_lap\_fresh\_compound}} - (t_{\text{in\_lap\_competitor}} + t_{\text{stay\_out\_worn\_compound}})$$

If $\Delta_{\text{undercut}} < 0$, the undercut is successful and the driver re-joins ahead of the rival.

---

## 10. Monte Carlo Race Simulation & Stochastic Modeling

The simulation executes $N = 10,000$ iterations prior to pit windows. Random variables include:
- Safety Car / VSC probability ($P_{\text{SC}} \sim \text{Bernoulli}(p)$)
- Pit Stop Duration ($t_{\text{pit}} \sim \mathcal{N}(\mu=2.45\text{s}, \sigma=0.35\text{s})$)
- Lapped Traffic Hold-up Delay ($\Delta t_{\text{traffic}} \sim \text{Exponential}(\lambda)$)

---

## 11. Weather Radar & Micro-Climate Impact Engine

Monitors track temperature changes and rainfall intensity (mm/h). Triggers crossover point recommendations between Slick (Dry) $\leftrightarrow$ Intermediate $\leftrightarrow$ Full Wet tyres.

---

## 12. Competitor Strategy Tracker

Tracks rival pit stop windows, current stint age, and remaining mandatory tyre compound allocations (FIA rule: driver must use at least two different dry compounds during a dry race).

---

## 13. Generative AI Race Strategist (Powered by Gemini)

Utilizes **Google Gemini 3.6 Flash** configured via server-side Express routes with context-aware prompts including current race state, gap matrix, weather forecast, and tyre degradation status.

---

## 14. Interactive UI/UX Wireframe Specifications

- **Screen 1:** Executive Live Strategy Wall & Multi-Car Pit Wall Overview
- **Screen 2:** Real-Time Telemetry & Driver Performance Analytics (Speed, Throttle, Brake)
- **Screen 3:** Tyre Wear & Thermal Degradation Matrix (C1-C5 Compounds)
- **Screen 4:** Pit Window & Undercut/Overcut Simulator
- **Screen 5:** AI Race Engineer Strategy Copilot & Natural Language Console
- **Screen 6:** Master PRD & Engineering Architecture Documentation Explorer

---

## 15. API Specifications

### REST Endpoints
- `GET /api/telemetry/live`: Returns current telemetry snapshot for all 20 drivers.
- `GET /api/tracks`: Returns circuit specs, pit loss times, and weather micro-climates.
- `POST /api/strategy/simulate`: Runs Monte Carlo simulation with given parameters.
- `POST /api/gemini/strategy`: Routes natural language strategy query to Gemini 3.6 Flash.

---

## 16. Database Schema & Data Models

### Telemetry Record Entity
```json
{
  "session_id": "2026-SILVERSTONE-RACE",
  "car_number": 1,
  "driver_code": "VER",
  "lap_number": 24,
  "telemetry": {
    "speed": 312.4,
    "throttle": 100,
    "brake": 0,
    "gear": 8,
    "drs": 1,
    "tyre_wear_fl": 18.4,
    "tyre_wear_fr": 22.1,
    "tyre_temp_fl": 104.2
  }
}
```

---

## 17. Security & Role-Based Access Control
- Encryption in transit (TLS 1.3) and at rest (AES-256).
- Role levels: `Strategist`, `Engineer`, `PitCrewRead`, `Admin`.

---

## 18. Edge & Low-Latency Deployment Strategy
Deployed as containerized Cloud Run / Docker instance with Express server proxying Vite static assets and serving API endpoints on port `3000`.

---

## 19. Testing, QA & Validation Strategy
- Unit test suite for tyre degradation calculations.
- Regression testing against historical race telemetry (e.g., Silverstone 2024, Spa 2025).

---

## 20. Telemetry Ingestion Mocking & Replay Engine
Includes built-in synthetic telemetry generator with Play/Pause, Fast Forward (1x, 2x, 5x, 10x), custom lap slider, and track preset selection.

---

## 21. Hardware & Pit Wall Infrastructure Specs
Designed for triple-monitor 4K Pit Wall displays and mobile tablet viewports.

---

## 22. Disaster Recovery & Failover Protocol
Automatic fallback to local offline physics engine if cloud AI service is disconnected.

---

## 23. Regulatory & FIA Compliance
Adheres to FIA Formula 1 Financial Regulations (Cap compliance) and Sporting Regulations Article 30 (Tyre usage rules).

---

## 24. Key Risk Register & Mitigation Matrix
- **Risk:** High latency on AI responses during safety car windows.
  - **Mitigation:** Pre-cached decision trees + lightweight local mathematical models.

---

## 25. Future Roadmap & Horizon 2/3 Capabilities
Integration with live pit telemetry IoT sensors and automated driver radio synthesizers.

---

## 26. Appendices & Formula 1 Mathematical Models
Contains complete equations for Optimum Crossover Lap, Fuel Mass Correction ($0.035\text{s per kg of fuel}$), and DRS Delta Advantage ($\approx 12 - 18\text{ km/h}$ top speed boost).
