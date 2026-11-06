# OdyssMedic - Frontend Web Application (SPA / PWA)

Simulador Clinico Adaptativo y Evaluador Retrospectivo para internos y estudiantes de medicina (UPCH - Proyectos de Ingenieria 2 / BioIncubadora Cayetano 2026).

---

## 1. Vision y Proposito

OdyssMedic transforma el entrenamiento medico tradicional basado en bancos estaticos de preguntas en un entorno clinico adaptativo. En lugar de limitarse a calificar respuestas como "Correcto o Incorrecto", diagnostica la causa raiz del error del estudiante en cuatro dimensiones cognitivas clinicas (Taxonomia OCRI):

1. **GAP_TRIAGE_SEVERITY**: Falla en el reconocimiento temprano de inestabilidad hemodinamica o signos de alarma.
2. **GAP_DIAGNOSTIC_REASONING**: Falla en la integracion fisiopatologica de sintomas y hallazgos fisicos.
3. **GAP_LAB_INTERPRETATION**: Falla en la lectura de examenes auxiliares, laboratorio y perfiles de gases o imagenes.
4. **GAP_INITIAL_MANAGEMENT**: Seleccion de estudios secundarios antes de estabilizar o indicar la terapia de primera linea segun guias internacionales.

Cada error desbloquea una **Perla Clinica Accionable de 60 segundos**, cita la guia de practica clinica de referencia (KDIGO 2024, ADA 2024, AHA/ASA 2023, EULAR 2023, FIGO 2024) y programa el caso en la cola de **Repaso Espaciado (D7 y D21)** para vencer la curva del olvido de Ebbinghaus.

---

## 2. Pila Tecnologica y Arquitectura

- **Framework**: React 18 con TypeScript en modo estricto.
- **Herramienta de Construccion**: Vite 6 con soporte de recarga rapida (HMR) y empaquetado optimizado.
- **Estilos**: Tailwind CSS 3 con sistema de diseno clinico personalizado (*Clinical Dark Engine*).
- **Iconografia**: Lucide React (vectorial limpia, estrictamente sin emojis).
- **Cliente HTTP**: Axios con interceptores automaticos de token JWT Bearer, gestion de expiracion 401 y reintentos.
- **Politica de Accesibilidad**: Cumplimiento WCAG 2.1 (escalado responsivo, dialogos ARIA accesibles, objetivos tactiles mobile-first).

---

## 3. Sistema de Diseno Clinico (*Precision Clinical Dark Engine*)

### Paleta de Colores
- Fondo Principal (`bg`): `#090A0F`
- Superficies y Bento Cards (`surface`): `#0E1117`
- Teal Hospitalario Primario (`primary`): `#0D665D` (hover `#0A524A`)
- Esmeralda / Maestria Clinica: `#10B981`
- Cian Electrico / Foco Activo: `#06B6D4`
- Ambar / Alertas y Advertencias: `#F59E0B`
- Coral / Triaje Critico y Shock: `#F43F5E`
- Violeta / Exploracion de Mundos Clinicos: `#6366F1`

### Tipografia
- Textos, Rotulos y Editorial: `Plus Jakarta Sans`, sans-serif.
- Constantes Vitales, Dosis, Laboratorios, XP y Telemetria: `JetBrains Mono`, monospace.

---

## 4. Arquitectura de Pantallas y Componentes

### 1. Vision UPCH / Landing Page (`LandingPage.tsx`)
- Encabezado institucional de BioIncubadora Cayetano y Proyectos de Ingenieria 2.
- Titular enfocado en superar el burnout de internado medico mediante micro-aprendizaje de alta fidelidad.
- Bento grid comparativo: Deteccion de causa raiz OCRI, Repaso D7/D21, Accesibilidad inmediata en sala (sin barreras de instalacion en smartphones), y costo accesible (S/ 28/mes vs cursos comerciales tradicionales de USD 300+).
- Demostracion interactiva en vivo del Stepper de 3 estaciones (Triaje -> Diagnostico -> Manejo).
- Creditos academicos: Dario Huerta Cruz, Elvis Deiwis Pilco Cruz, Mag. Noe Bazan.

### 2. Panel Principal / Dashboard del Estudiante (`DashboardPage.tsx`)
- Encabezado con bienvenida clinica personalizada, turno de guardia activo y estado academico.
- BentoStats: Nivel de competencia global (Nivel 1, 2 o 3), Puntos de Experiencia (XP), Racha de Guardia en dias y Casos Pendientes de Repaso.
- CompetencyRadar: Grafico de radar SVG vectorial de 4 ejes con anillos concentricos (25%, 50%, 75%, 100%), HUD interactivo en tiempo real y evaluacion automatica de fortaleza vs foco prioritario de refuerzo.
- SpacedRepetitionQueue: Lista de refuerzos espaciados programados en intervalos D7 y D21 con etiquetas de brecha cognitiva previa y estados de vencimiento.
- Mundos Clinicos: Selector de especialidades (Nefrologia, Endocrinologia, Neurologia, Reumatologia, Ginecologia y Obstetricia) con barras de progreso de maestria, contadores de casos y botones de inicio de guardia.

### 3. Simulador Clinico Adaptativo (`SimulatorPage.tsx`)
- StationStepper: Navegacion visual por 3 estaciones graduadas:
  * Estacion 1: Fundacional (Triaje y Reconocimiento de Gravedad).
  * Estacion 2: Intermedio (Razonamiento Diagnostico Diferencial).
  * Estacion 3: Avanzado (Manejo Farmacologico y Procedimientos de Emergencia).
- VignettePlayer:
  * Constantes vitales en formato monospace (`VitalSignBadge`) con evaluador clinico heuristico para taquicardia/bradicardia, taquipnea/bradipnea, hipotension, desaturacion e hipo/hipertermia.
  * Anamnesis estructurada y examen fisico categorizado por sistemas.
  * Tabla interactiva de laboratorio con deteccion automatica de rangos patologicos y soporte para comas decimales.
  * Vista colapsable adaptada para visualizacion en salas de guardia desde smartphones (390px).
- OptionCard: Opciones de seleccion clinica con navegacion por teclado (Enter / Espacio), insignias A/B/C/D y estados interactivos.
- Temporizador clinico de precision: Registro de tiempo de respuesta por estacion sin desincronizacion durante revisiones.

### 4. Modal de Retroalimentacion Retrospectiva (`ClinicalPearlModal.tsx`)
- Desglose inmediato tras confirmar la conducta:
  * Insignia de acierto (+XP ganado) o de brecha cognitiva identificada (`CognitiveGapBadge`).
  * Tarjeta diagnostica de la causa raiz del error.
  * Perla Clinica de 60 Segundos con foco de alta rentabilidad para ENAM/EsSalud.
  * Evidencia cientifica internacional con enlace directo a DOI o PubMed.
  * Prescripcion de nivelacion adaptativa (variacion de maestria y programacion en cola D7/D21).
  * Boton de revision de vineta con barra de accion inferior persistente.

### 5. Biblioteca de Guias Clinicas Internacionales (`LibraryPage.tsx`)
- Buscador y filtrado por especialidad medica.
- Guias indexadas: KDIGO 2024, ADA Standards of Care 2024, AHA/ASA Stroke 2023, EULAR SLE 2023, FIGO 2024, ACOG 2023, AAO 2024.
- Recomendaciones terapeuticas clave y acceso directo a fuentes primarias.
- Enlace directo "Entrenar Caso Basado en esta Guia" hacia el simulador.

---

## 5. Instrucciones de Instalacion y Ejecucion Local

### Requisitos Previos
- Node.js version 18+ o superior (probado en Node v26).
- Servidor Backend FastAPI de OdyssMedic ejecutandose en `http://localhost:8000/api/v1`.

### Instalacion de Dependencias
```bash
cd frontend
npm install
```

### Ejecucion en Modo Desarrollo
```bash
npm run dev
```
La aplicacion estara disponible en `http://localhost:3000`.

### Verificacion de Tipos y Compilacion para Produccion
```bash
npx tsc --noEmit
npm run build
```

### Vista Previa del Paquete de Produccion
```bash
npm run preview
```

---

## 6. Variables de Entorno

Crear un archivo `.env` en la raiz de `frontend/` si se requiere personalizar la direccion del backend:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Si no se define, la aplicacion utilizara por defecto `http://localhost:8000/api/v1` y contara con respaldo de datos clinicos fuera de linea para demostraciones sin conexion.

---

## 7. Cuenta de Demostracion Medica UPCH

Para pruebas rapidas del evaluador adaptativo y telemetria:
- **Correo**: `demo.medico@upch.pe`
- **Contrasena**: `OdyssMed2026!`
- **Rol**: Interno Medico (UPCH)
- **Acceso Directo**: Boton "Acceso Rapido: Medico Demo UPCH" disponible en la barra de navegacion y en el modal de autenticacion.
