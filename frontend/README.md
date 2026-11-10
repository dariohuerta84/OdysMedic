# OdyssMedic - Frontend Web Application (React + TypeScript + Vite)

Interfaz clinica editorial e interactiva de **OdyssMedic** (Universidad Peruana Cayetano Heredia - Proyectos de Ingenieria 2 / BioIncubadora Cayetano 2026).

---

## 1. Proposito y Experiencia del Estudiante

El modulo `frontend/` materializa la experiencia formativa completa del estudiante e interno de medicina sobre una interfaz **Editorial Medica Clasica** de alta legibilidad, libre de sobrecarga visual y adaptada tanto para sesiones de estudio como para exposiciones academicas en una sola sesion:

1. **Calibracion Diagnostica Obligatoria (`DiagnosticExamPage.tsx`)**:
   - Todo usuario registrado debe calibrar su linea base antes de visualizar porcentajes de rendimiento.
   - Ofrece dos modalidades seleccionables: **Examen General** (multi-especialidad) o **Examen Focalizado por Especialidad**.
2. **Panel de Ruta Clinica y Rombo Dinamico (`DashboardPage.tsx` + `CompetencyRadar.tsx`)**:
   - Anillo circular animado e indicadores reales de aptitud: **Rojo Carmesi (`#B6222A`)** en notas bajas (`< 50%`), **Ambar (`#AE7A1E`)** en nivelacion (`50% - 74%`) y **Verde Teal (`#0E6F65`)** en dominio consolidado (`>= 75%`).
   - **Equilibrio de Razonamiento Clinico (Rombo SVG animado)**: interpola geometricamente sus 4 ejes cognitivos (`GAP_TRIAGE_SEVERITY`, `GAP_DIAGNOSTIC_REASONING`, `GAP_LAB_INTERPRETATION`, `GAP_INITIAL_MANAGEMENT`) y cambia progresivamente hacia rojo con halos pulsantes de alerta cuando detecta brechas severas.
3. **Simulador Longitudinal de Dias Transcurridos (`TimePassageSimulator.tsx`)**:
   - Disenado para demostrar en vivo durante una exposicion la evolucion multi-semana del motor sin esperar dias reales:
     - **`+1 dia (Constancia)`**, **`+7 dias (Activar Ciclo D7)`** y **`+21 dias (Activar Ciclo D21)`**.
     - **`14 dias sin practicar (Curva de olvido de Ebbinghaus)`**: evidencia la perdida de racha, el descenso de retencion y el viraje hacia rojo/ambar del rombo junto con la activacion de repasos urgentes.
     - **`Restablecer al Dia 0`**: reinicia el calendario simulado para repetir demostraciones ante el jurado.
4. **Cola Adaptativa de Repasos Espaciados (`SpacedRepetitionQueue.tsx`)**:
   - Se alimenta dinamicamente de las estaciones falladas en el diagnostico y en el simulador con sus titulos clinicos reales, priorizando refuerzos urgentes (`Plan de rescate activado`) y descontandolos en tiempo real al superarlos.
5. **Simulador Clinico en 3 Estaciones (`SimulatorPage.tsx` + `ClinicalPearlModal.tsx`)**:
   - Presenta los 7 casos clinicos reales de *Journal of Medical Case Reports* (BMC) sanitizados, con retroalimentacion animada en dos tiempos:
     - **Acierto:** impulso suave (`animate-correct-pop`), trazo vectorial animado del check, onda concentrica y conteo progresivo de puntos.
     - **Fallo:** vibracion clinica (`animate-clinical-shake`), resaltado en carmesi de la opcion elegida, revelacion inmediata de la conducta recomendada y apertura de la Perla Clinica con cita DOI/PubMed.
6. **Biblioteca Clinica y Recoleccion Semiologica (`LibraryPage.tsx`)**:
   - Consulta abierta de **27 guias internacionales y tratados medicos** distribuidos en **9 especialidades**, incluyendo fichas completas de recoleccion de datos (anamnesis dirigida, examen fisico, puntos de corte y signos de alarma).
   - La lectura bibliografica es abierta, mientras que la evaluacion practica exige autenticacion previa.

---

## 2. Pila Tecnologica y Sistema de Diseno Editorial Clasico

- **Framework**: React 18 + TypeScript estricto.
- **Bundler**: Vite 6 con recarga instantanea (HMR).
- **Estilos y Movimiento**: Tailwind CSS 3 + animaciones CSS dedicadas (`fadeInUp`, `scaleIn`, `clinicalShake`, `correctPop`, `ringExpand`, `useAnimatedNumber`) respetando `prefers-reduced-motion` y portales `createPortal` para modales sin recortes de pantalla.
- **Tipografia**:
  - Titulares y jerarquia editorial: `Playfair Display` (serif clasica).
  - Lectura clinica, formularios y tablas: `Inter` (sans-serif de alta legibilidad).
- **Paleta Semantica**:
  - Lienzo principal marfil calido: `#FDFCFA` y superficies `#FFFFFF` / `#F7FAF9`.
  - Acento clinico primario (Teal medico): `#0E6F65` / `#0D4A44`.
  - Nivelacion condicional (Ambar): `#AE7A1E` / `#FDF7E7`.
  - Alerta clinica y baja nota (Carmesi): `#B6222A` / `#FFF9F9`.
- **Iconografia**: `lucide-react` (vectorial limpia, cero emojis).

---

## 3. Estructura de Directorios (`frontend/src`)

```text
frontend/src/
├── App.tsx                                 # Orquestador de vistas, sesion y guardas de autenticacion
├── index.css                               # Tokens editoriales, tipografias y utilidades de animacion
├── context/
│   └── AuthContext.tsx                     # Estado global JWT, perfil del alumno y sincronizacion en vivo
├── hooks/
│   └── useAnimatedNumber.ts                # Interpolacion numerica fluida con requestAnimationFrame
├── services/
│   └── api.ts                              # Cliente Axios tipado hacia /api/v1 (auth, cases, evaluation, leveling, references)
├── types/
│   └── api.ts                              # Contratos TypeScript alineados con Pydantic v2 del backend
├── pages/
│   ├── LandingPage.tsx                     # Portada editorial clasica con vista previa estatica y tarjetas divididas
│   ├── DiagnosticExamPage.tsx              # Evaluacion inicial (General vs Especialidad) con retroalimentacion visual
│   ├── DashboardPage.tsx                   # Ruta clinica, Simulador de Dias, Rombo dinamico y Mundos Clinicos
│   ├── SimulatorPage.tsx                   # Reproductor interactivo de casos reales BMC en 3 estaciones
│   └── LibraryPage.tsx                     # Compendio de 27 fuentes y fichas de recoleccion semiologica
└── components/
    ├── auth/
    │   └── AuthModal.tsx                   # Registro progresivo en 2 pasos e inicio de sesion en portal
    ├── common/
    │   ├── Navbar.tsx                      # Navegacion principal con indicadores de racha, puntos y perfil
    │   └── CognitiveGapBadge.tsx           # Etiquetas naturales de las 4 brechas cognitivas OCRI
    ├── dashboard/
    │   ├── BentoStats.tsx                  # Indicadores animados de nivel, racha, puntos y repasos
    │   ├── TimePassageSimulator.tsx        # Simulador longitudinal (+1d, +7d, +21d y curva de Ebbinghaus)
    │   ├── CompetencyRadar.tsx             # Rombo SVG dinamico con interpolacion continua rojo -> ambar -> teal
    │   ├── SpacedRepetitionQueue.tsx       # Cola adaptativa D7 / D21 con prioridad urgente en bajas notas
    │   └── SpecialtyCard.tsx               # Tarjetas de especialidad con estado real de maestria
    └── simulator/
        ├── StationStepper.tsx              # Progreso secuencial de las 3 estaciones clinicas
        ├── VignettePlayer.tsx              # Signos vitales, anamnesis, examen fisico y laboratorios
        ├── OptionCard.tsx                  # Alternativas con animaciones de acierto y fallo clinico
        └── ClinicalPearlModal.tsx          # Debriefing retrospectivo, perla clinica y cita cientifica
```

---

## 4. Instalacion y Ejecucion Local

### Requisitos Previos
- Node.js 18 o superior.
- Backend FastAPI activo en `http://localhost:8000` (ver `../backend/README.md`).

### Comandos Principales

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

La interfaz estara disponible en `http://localhost:3000`.

### Compilacion y Verificacion de Tipos

```bash
npm run build
```
