# OdyssMedic Responsive Frontend SPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, responsive Single-Page Web Application (SPA) for OdyssMedic inside `frontend/` that connects directly to the FastAPI backend, featuring the precision clinical design system, 3-station graduated clinical simulator, OCRI cognitive gap detector with 60-second clinical pearls, interactive competency radar, and D7/D21 spaced repetition queue.

**Architecture:** React 18+ with TypeScript and Vite for ultra-fast local development and instant bundling. Tailwind CSS with custom precision tokens (`#090A0F`, `#0D665D`, `#10B981`, `#06B6D4`, `#F59E0B`, `#F43F5E`), Lucide icons (strictly no emojis), client-side routing, and Axios client with automatic Bearer token interceptor.

**Tech Stack:** React 18, TypeScript 5, Vite 5/6, Tailwind CSS 3, Lucide React, Axios.

---

### Task 1: Scaffolding Vite + React + TypeScript + Tailwind CSS Environment

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

- [x] **Step 1: Create package.json and configuration files**
Create `frontend/package.json` with React, Vite, TypeScript, Tailwind CSS, Lucide React, and Axios dependencies.

- [x] **Step 2: Configure Tailwind CSS and PostCSS**
Configure `tailwind.config.js` with OdyssMedic's precision clinical palette (`slate-950`, hospital teal `#0D665D`, emerald `#10B981`, cyan `#06B6D4`, amber `#F59E0B`, rose `#F43F5E`) and monospace font family.

- [x] **Step 3: Install dependencies with npm**
Run: `cd frontend && npm install`
Expected: Dependencies installed without errors.

- [x] **Step 4: Verify build works**
Run: `cd frontend && npm run build`
Expected: `dist/` directory generated successfully with 0 errors.

- [x] **Step 5: Commit**
`git add frontend/`
`git commit -m "feat(frontend): scaffold vite react typescript and tailwind css with clinical theme"`

---

### Task 2: TypeScript Domain Interfaces and API Client

**Files:**
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/services/api.ts`

- [x] **Step 1: Define TypeScript domain models in `src/types/api.ts`**
Define interfaces mirroring backend schemas: `User`, `AuthToken`, `SpecialtyMastery`, `Specialty`, `CaseSummary`, `CaseDetail`, `VitalSigns`, `MCQOption`, `MCQStation`, `MCQSubmissionRequest`, `MCQEvaluationResult`, `LevelingDashboard`, `SpacedRepetitionItem`, `MedicalReference`, and `CognitiveGapTag`.

- [x] **Step 2: Implement Axios client with Bearer token interceptor in `src/services/api.ts`**
Implement typed API wrapper methods:
  - `authApi.login(email, password)`
  - `authApi.register(name, email, password, role)`
  - `authApi.getMe()`
  - `specialtiesApi.getAll()`
  - `casesApi.getBySpecialty(specialtyId)`
  - `casesApi.getById(caseId)`
  - `casesApi.getStations(caseId)`
  - `evaluationApi.submitMCQ(submission)`
  - `levelingApi.getDashboard()`
  - `referencesApi.getByCase(caseId)`
  - `referencesApi.getAll(specialtyId)`

- [x] **Step 3: Verify TypeScript compilation**
Run: `cd frontend && npx tsc --noEmit`
Expected: 0 type errors.

- [x] **Step 4: Commit**
`git add frontend/src/types frontend/src/services`
`git commit -m "feat(frontend): add typescript medical models and axios api client"`

---

### Task 3: Authentication Context and Login / Register / Demo Prefill

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/components/auth/AuthModal.tsx`

- [x] **Step 1: Implement AuthContext**
Create `AuthContext` providing `user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`, and a one-click `loginDemo()` helper using `demo.medico@upch.pe` / `OdyssMed2026!`. Persist token in `localStorage`.

- [x] **Step 2: Implement AuthModal with dual tabs (Login / Register) and Demo Shortcut**
Build responsive modal with dark precision aesthetic, email/password inputs, validation, error alert banner, and one-click "Acceder como Medico Demo UPCH".

- [x] **Step 3: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 4: Commit**
`git add frontend/src/context frontend/src/components/auth`
`git commit -m "feat(frontend): implement auth context and responsive login modal with demo prefill"`

---

### Task 4: Common Precision UI Components

**Files:**
- Create: `frontend/src/components/common/Navbar.tsx`
- Create: `frontend/src/components/common/VitalSignBadge.tsx`
- Create: `frontend/src/components/common/CognitiveGapBadge.tsx`
- Create: `frontend/src/components/common/LevelBadge.tsx`
- Create: `frontend/src/components/common/ProgressBar.tsx`

- [x] **Step 1: Implement VitalSignBadge.tsx**
Monospace vital sign pill with label (PA, FC, FR, SpO2, T, Glasg), value, unit, and auto-flagging of pathological values (e.g., SpO2 < 92% in red/coral, FC > 100 in amber).

- [x] **Step 2: Implement CognitiveGapBadge.tsx**
Component that renders human-readable Spanish clinical competency badges for:
  - `GAP_TRIAGE_SEVERITY` -> "Triaje y Reconocimiento de Gravedad"
  - `GAP_DIAGNOSTIC_REASONING` -> "Razonamiento Diagnostico Clinico"
  - `GAP_LAB_INTERPRETATION` -> "Interpretacion de Examenes y Labs"
  - `GAP_INITIAL_MANAGEMENT` -> "Manejo Terapeutico Inicial"

- [x] **Step 3: Implement LevelBadge.tsx and ProgressBar.tsx**
Level badge with color coding for Nivel 1 (Fundacional - Cyan), Nivel 2 (Intermedio - Emerald), Nivel 3 (Avanzado - Violet). Animated progress bar for XP and mastery.

- [x] **Step 4: Implement Navbar.tsx**
Responsive header featuring OdyssMedic logo, active route indicator, user streak counter, total XP badge, specialty quick-select, and user profile / logout button. Includes mobile hamburger drawer.

- [x] **Step 5: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 6: Commit**
`git add frontend/src/components/common`
`git commit -m "feat(frontend): implement clinical navbar, vitals badges, and competency tags"`

---

### Task 5: Student Dashboard & 4-Gap Competency Radar

**Files:**
- Create: `frontend/src/components/dashboard/CompetencyRadar.tsx`
- Create: `frontend/src/components/dashboard/BentoStats.tsx`
- Create: `frontend/src/components/dashboard/SpecialtyCard.tsx`
- Create: `frontend/src/components/dashboard/SpacedRepetitionQueue.tsx`
- Create: `frontend/src/pages/DashboardPage.tsx`

- [x] **Step 1: Implement CompetencyRadar.tsx**
Interactive SVG polygon radar chart showing student competence across the 4 OCRI gaps: Triaje, Diagnostico, Laboratorio, and Manejo. Shows grid rings (25%, 50%, 75%, 100%), axis labels, and glowing teal data polygon.

- [x] **Step 2: Implement BentoStats.tsx**
Asymmetric bento grid displaying:
  - Global Competency Level (Nivel 1, 2, or 3)
  - Total Experience Points (XP)
  - Daily Guard Streak (Dias de Racha)
  - Pending Spaced Repetitions count

- [x] **Step 3: Implement SpecialtyCard.tsx and SpacedRepetitionQueue.tsx**
Specialty card for each clinical world (Nefrologia, Endocrinologia, Neurologia, Reumatologia, Ginecologia) with mastery percentage bar, available cases, and "Iniciar Guardia" action button. Spaced repetition list displaying D7 and D21 scheduled cases.

- [x] **Step 4: Implement DashboardPage.tsx**
Assemble the Bento grid, Radar chart, World selector, and Spaced Repetition queue into a responsive layout (single column on mobile, 3-column bento on desktop).

- [x] **Step 5: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 6: Commit**
`git add frontend/src/components/dashboard frontend/src/pages/DashboardPage.tsx`
`git commit -m "feat(frontend): build student dashboard with bento grid and ocri competency radar"`

---

### Task 6: Clinical Simulator & Vignette Player

**Files:**
- Create: `frontend/src/components/simulator/VignettePlayer.tsx`
- Create: `frontend/src/components/simulator/StationStepper.tsx`
- Create: `frontend/src/components/simulator/OptionCard.tsx`
- Create: `frontend/src/pages/SimulatorPage.tsx`

- [x] **Step 1: Implement VignettePlayer.tsx**
Clinical scenario view displaying:
  - Patient demographics (Age, Biological Sex, Chief Complaint)
  - Monospace Vital Signs banner (`VitalSignBadge` for PA, FC, FR, SatO2, Temp)
  - Patient Anamnesis / History of Present Illness
  - Physical Examination and Initial Laboratory Findings
  - Collapsible clinical tabs for laboratory and imaging results

- [x] **Step 2: Implement StationStepper.tsx and OptionCard.tsx**
3-Station Stepper:
  - Station 1: Fundacional (Triaje y Priorizacion)
  - Station 2: Intermedio (Diagnostico Diferencial)
  - Station 3: Avanzado (Manejo Farmacologico y Procedimientos)
Option card with letter identifier (A, B, C, D), clear hover state, selected ring, and submit confirmation button.

- [x] **Step 3: Implement SimulatorPage.tsx**
Coordinates case fetching, station progression, decision submission, timer tracking, and integration with retrospective feedback modal.

- [x] **Step 4: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 5: Commit**
`git add frontend/src/components/simulator frontend/src/pages/SimulatorPage.tsx`
`git commit -m "feat(frontend): build clinical simulator with vignette player and 3-station stepper"`

---

### Task 7: Retrospective Feedback Modal with 60s Clinical Pearl and Guideline Citation

**Files:**
- Create: `frontend/src/components/simulator/ClinicalPearlModal.tsx`

- [x] **Step 1: Implement ClinicalPearlModal.tsx**
Modal displayed immediately after submitting an answer:
  - Success banner (Correct: Emerald glow, XP earned badge; Incorrect: Coral banner with identified OCRI Cognitive Gap)
  - Cognitive Gap Diagnostic Card: Explains why the chosen option represents a diagnostic or management pitfall
  - 60-Second Actionable Clinical Pearl: Ultra-concise high-yield takeaway for ENAM/EsSalud
  - Evidence & Guideline Reference: Title, Year, DOI/PMID, and clinical summary
  - Leveling Prescription: Informs student whether mastery increased or if case was scheduled for D7/D21 spaced repetition
  - Navigation action: "Siguiente Estacion Clinica" or "Finalizar Caso y Volver al Panel"

- [x] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 3: Commit**
`git add frontend/src/components/simulator/ClinicalPearlModal.tsx`
`git commit -m "feat(frontend): implement retrospective feedback modal with clinical pearls and guideline citations"`

---

### Task 8: Clinical Reference Library Page and Editorial Landing Page

**Files:**
- Create: `frontend/src/pages/LibraryPage.tsx`
- Create: `frontend/src/pages/LandingPage.tsx`
- Modify: `frontend/src/App.tsx`

- [x] **Step 1: Implement LibraryPage.tsx**
Direct browser for international clinical practice guidelines (KDIGO 2024, ADA 2024, AHA/ASA 2023, EULAR 2023, FIGO 2024) with specialty filtering, evidence summaries, and direct external DOI links.

- [x] **Step 2: Implement LandingPage.tsx**
Editorial responsive landing page:
  - Hero with high-impact value proposition: Micro-learning adaptativo frente al burnout de internado
  - Cost comparison: S/ 28/mes vs cursos tradicionales de USD 300+
  - Interactive demonstration preview of the 3 graduated stations
  - Call to action: "Iniciar Prueba Gratuita (Demo UPCH)" and "Explorar Mundos Clinicos"

- [x] **Step 3: Wire all routes and modal states in App.tsx**
Connect navigation between Landing, Dashboard, Simulator, and Library pages with persistent authentication state.

- [x] **Step 4: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

- [x] **Step 5: Commit**
`git add frontend/src/pages frontend/src/App.tsx`
`git commit -m "feat(frontend): build clinical library, landing page, and router integration"`

---

### Task 9: Full End-to-End Testing, Mobile Responsiveness Audit, and GitHub Remote Push

**Files:**
- Modify: `frontend/README.md`

- [x] **Step 1: Verify production build output**
Run: `cd frontend && npm run build`
Expected: Zero TypeScript errors, clean bundle generation.

- [x] **Step 2: End-to-End smoke test with Backend**
Start backend API in background or run live requests to test:
  - Login with `demo.medico@upch.pe`
  - Fetch specialties and cases
  - Submit station answer and receive retrospective evaluation with clinical pearl
  - Check leveling dashboard updates

- [x] **Step 3: Create frontend documentation in `frontend/README.md`**
Document architecture, design system tokens, local development instructions, and integration endpoints.

- [x] **Step 4: Commit and push changes to remote GitHub**
`git push origin main`
Expected: All commits pushed cleanly to remote.
