# Diseño Técnico — OdyssMedic Enfoque A: Ruta Clínica Progresiva, Motor OCRI-HLR, Persistencia Real y Rediseño Editorial

**Fecha:** 2026-11-22  
**Proyecto:** OdyssMedic (`Odyss-PM` — UPCH / BioIncubadora Cayetano 2026)  
**Estado:** Borrador para revisión y aprobación

---

## 1. Intención y Por Qué

OdyssMedic ya cuenta con un prototipo Full-Stack funcional (`React 18 + TypeScript + Vite 6` y `FastAPI + SQLAlchemy 2.0`) con 7 casos clínicos reales arbitrados, 27 guías clínicas y un simulador longitudinal de días transcurridos. Sin embargo, presenta cuatro brechas críticas frente a un producto educativo médico de alto estándar:

1. **Progresión plana en lugar de ruta progresiva:** hoy el panel presenta tarjetas de especialidades sueltas e intervalos fijos (`D7` / `D21`) con una media móvil simple (`EMA`). Falta una progresión escalonada tipo Duolingo adaptada al rigor médico (unidades secuenciales, nodos desbloqueables, hitos de verificación y dificultad en la *Goldilocks Zone*).
2. **Base científica ampliable en el motor OCRI:** el motor puede enriquecerse formalmente con modelos validados de memoria y razonamiento clínico (**Half-Life Regression** de Duolingo, **FSRS**, **Birdbrain / IRT**, **Script Concordance Test**, **Teoría de Proceso Dual** y **Teoría de Carga Cognitiva**).
3. **Persistencia de registros de usuario en producción serverless:** en local SQLite guarda en disco (`./odyssmedic.db`), pero en Vercel sin `DATABASE_URL` externa recurre a `sqlite:////tmp/odyssmedic.db`, que se borra al reciclarse la instancia serverless. Además, el frontend llama a `getMe()` inmediatamente tras `register()`, arriesgando una condición de carrera entre instancias.
4. **Estilo visual y animaciones (frontend y backend):** el frontend todavía emplea tarjetas redondeadas pastel repetitivas, `font-mono` mapeada erróneamente a `Inter` y revelados discretos con `IntersectionObserver`, mientras el backend expone el Swagger `/docs` por defecto sin identidad editorial.

---

## 2. Objetivos, No-Objetivos y Anti-Objetivos

### Objetivos
* **O1 — Motor OCRI-HLR + Referencias:** incorporar un módulo determinista `hlr_scheduler.py` (Half-Life Regression $p = 2^{-\Delta/h}$, estabilidad/dificultad estilo FSRS y selector de dificultad *Goldilocks Zone* tipo Birdbrain/IRT) respaldado por **7 nuevas referencias científicas verificadas con DOI** integradas en `referencias/` (elevando el catálogo de 50 a 57 fuentes).
* **O2 — Ruta Clínica Progresiva (Backend + Frontend):** exponer y renderizar una ruta progresiva por **5 Unidades Clínicas** (ordenadas dinámicamente según las brechas del estudiante) con **4 nodos secuenciales por unidad** (`Triaje` -> `Diagnóstico/Exámenes` -> `Manejo Inicial` -> `Guardia Integradora`), desbloqueo progresivo, indicador de retención HLR (`h` en días y `%` de recuerdo) y sincronización viva con el Simulador Longitudinal de Días (`+1d`, `+7d`, `+21d`, `14d sin practicar`).
* **O3 — Persistencia Real de Registro de Usuarios:** asegurar que el registro y progreso se guarden de forma fiable en desarrollo local y estén 100% preparados para **PostgreSQL gestionado (Neon o Supabase)** en Vercel: migraciones idempotentes compatibles con SQLite **y** PostgreSQL, normalización de correos, hidratación inmediata en `AuthContext` tras `register()`/`login()`, y telemetría `storage_mode` en `/api/v1/health`.
* **O4 — Rediseño Editorial y Animaciones Nativas Scroll-Driven (Frontend + Backend):** migrar la interfaz a estética editorial médica limpia (`Source Serif 4` + `Inter` + `JetBrains Mono`, divisores finos de `1px`, cero píldoras eyebrow redondeadas ni tarjetas SaaS repetitivas, cero neón), añadir coreografía continua bidireccional con CSS Scroll-Driven Animations (`scroll()` / `view()`, `@supports`, fallback `rAF`/estático y `prefers-reduced-motion`), transiciones de vista (`document.startViewTransition`) y estilizar el portal de la API `/` y Swagger `/docs` en el backend.

### No-Objetivos
* No se implementa todavía el reproductor interactivo de ejercicios **Script Concordance Test (escala `-2` a `+2`)** ni mecánicas de vidas/corazones (correspondientes al Enfoque B; el SCT se integra como referencia bibliográfica y fundamento del motor).
* No se introducen mascotas ni gamificación infantilizada: toda la progresión mantiene sobriedad clínica.
* No se añaden dependencias pesadas de animación (como GSAP o polyfills de scroll-timeline).
* No se rompen los contratos REST existentes ni las 85 pruebas actuales de `pytest`.

### Anti-Objetivos (criterios de fallo)
* Romper cualquier flujo existente (`auth`, examen diagnóstico general/por especialidad, simulador de 3 estaciones, biblioteca abierta o simulador de días).
* Introducir patrones visuales prohibidos: píldoras redondeadas `rounded-full` sobre títulos, etiquetas pastel repetitivas sobre tarjetas, rejillas de tarjetas `rounded-2xl` idénticas, brillo artificial o colores neón.
* Construir una ruta progresiva cosmética/estática que no refleje los intentos reales en BD ni reaccione al paso de días simulado.
* Ocultar al usuario o desarrollador si el despliegue corre en almacenamiento efímero (`/tmp`) frente a PostgreSQL persistente.

---

## 3. Enfoques Considerados

| Enfoque | Resumen | Trade-offs | Decisión |
| :--- | :--- | :--- | :--- |
| **Enfoque A** | Ruta Clínica Progresiva + Motor OCRI-HLR/FSRS/IRT + Persistencia PostgreSQL/SQLite robusta + Rediseño editorial con CSS Scroll-Driven + Portal/Docs backend estilizados + 7 nuevas referencias. | Equilibra impacto visual, rigor científico y compatibilidad con las 85 pruebas existentes. | **Seleccionado por el usuario** |
| **Enfoque B** | Todo lo de A + nueva modalidad de ejercicios SCT (`-2` a `+2`) y metas diarias con escudo de racha. | Duplica superficie de endpoints, UI y curación de ítems clínicos nuevos. | Descartado por alcance |
| **Enfoque C** | Solo HLR en backend, PostgreSQL y retoques CSS manteniendo la cuadrícula actual sin ruta progresiva. | Más rápido, pero no entrega la experiencia progresiva tipo Duolingo solicitada. | Descartado por menor impacto UX |

---

## 4. Restricciones Técnicas y de Diseño

1. **Estándar Editorial Obligatorio (Frontend y Backend):**
   - **Prohibido:** píldoras eyebrow redondeadas (`rounded-full`) encima de títulos, etiquetas pastel repetitivas sobre tarjetas, rejillas SaaS de tarjetas `rounded-xl`/`rounded-2xl` idénticas, pies repetitivos tipo `✓ Respuesta...` y paletas neón/cyberpunk.
   - **Tipografía:** `Source Serif 4` en titulares, `Inter` en cuerpo y `JetBrains Mono` en telemetría clínica (`h`, `%` retención, signos vitales, códigos de estación, XP).
   - **Superficies:** lienzo marfil clínico `#FAF9F6`, papel `#F3F1EC`, divisores finos de `1px` `#DEDBD2`, tinta `#0D1F26`, texto secundario `#3D525A`, acento teal clínico `#0E6F65`, ámbar clínico `#9A6B1F` y carmesí clínico `#A6262E`.
2. **Animaciones Scroll-Driven (`modern-web-guidance`):**
   - Usar exclusivamente CSS nativo envuelto en `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))` y `@supports (animation-timeline: view())`.
   - Declarar `animation-timeline` y `animation-range` **siempre después** de la propiedad `animation`.
   - Animar solo propiedades del compositor (`transform`, `opacity`, `clip-path`). No usar `scroll-timeline-polyfill`.
   - Respetar estrictamente `@media (prefers-reduced-motion: reduce)` y proveer fallback limpio cuando el navegador no soporte `animation-timeline`.
3. **Compatibilidad y Despliegue:**
   - Compatible con `vercel.json` (Vercel Services: Vite SPA + FastAPI serverless `backend/main.py`).
   - `GET /` debe seguir devolviendo JSON cuando el cliente no solicite HTML explícitamente (`test_health_and_root_endpoints` usa `client.get("/")` y valida `resp.json()["health"] == "/health"`).
   - Todas las 85 pruebas existentes + las nuevas pruebas deben pasar en `.venv/bin/pytest`, y `npm run build` debe compilar sin errores TypeScript.

---

## 5. Diseño Detallado por Pilar

### 5.1 Enriquecimiento Bibliográfico (`referencias/`)

Se añaden **7 nuevas referencias científicas verificadas** a `referencias/03_fundamentos_pedagogicos_y_cognitivos.md` (subiendo de 9 a 16 fuentes pedagógico-cognitivas y de 50 a 57 fuentes totales), sincronizando `referencias/README.md`, `referencias/catalogo_completo_referencias.json` y `referencias/referencias_odyssmedic.bib`:

1. **Settles, B., & Meeder, B. (2016).** *A Trainable Spaced Repetition Model for Language Learning*. Proceedings of ACL 2016. DOI: `10.18653/v1/P16-1174` (modelo Half-Life Regression de Duolingo).
2. **Ye, J., Su, J., & Cao, Y. (2022).** *A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling*. Proceedings of KDD 2022. DOI: `10.1145/3534678.3539081` (modelo FSRS / DSR: Estabilidad, Dificultad y Recuperabilidad).
3. **Settles, B., LaFlair, G. T., & Hagiwara, M. (2020).** *Machine Learning–Driven Language Assessment (Birdbrain / IRT Adaptive Difficulty Ecosystem)*. Transactions of the Association for Computational Linguistics (TACL), 8, 247–263. DOI: `10.1162/tacl_a_00310`.
4. **Lubarsky, S., Dory, V., Duggan, P., Gagnon, R., & Charlin, B. (2013).** *Script concordance testing: from theory to practice: AMEE Guide No. 75*. Medical Teacher, 35(3), 184–193. DOI: `10.3109/0142159X.2013.760036`.
5. **Gagnon, R., Lubarsky, S., Lambert, C., Meterissian, S., & Charlin, B. (2017).** *Evolutions in clinical reasoning assessment: The Evolving Script Concordance Test*. Medical Teacher, 39(7), 701–707. DOI: `10.1080/0142159X.2017.1327706`.
6. **Croskerry, P. (2009).** *A universal model of diagnostic reasoning*. Academic Medicine, 84(8), 1022–1028. DOI: `10.1097/ACM.0b013e3181ace703` (Teoría de Proceso Dual Sistema 1 / Sistema 2).
7. **van Merriënboer, J. J. G., & Sweller, J. (2010).** *Cognitive load theory in health professional education: design principles and strategies*. Medical Education, 44(1), 85–93. DOI: `10.1111/j.1365-2923.2009.03498.x`.

### 5.2 Motor OCRI-HLR y Ruta Clínica Progresiva (Backend)

#### A. Coexistencia con el Motor Actual (Decisión de ingeniería — Compatibilidad Total)
* Para garantizar que las **85 pruebas existentes de `pytest` sigan pasando sin modificar sus aserciones** (`EMA alpha=0.25`, programación `D7`/`D21` en `SpacedRepetitionTask` y baremos de `generate_leveling_prescription`), **HLR y el selector Goldilocks/IRT se integran de forma aditiva junto al motor actual**, sin reemplazar los campos ni intervalos existentes de `SpacedRepetitionTask`.
* En cada intento (`record_mcq_attempt()`), se mantiene intacta la lógica `EMA` + `D7`/`D21` y, además, se actualiza `UserMemoryTrace` y se exponen `hlr_summary`, `goldilocks_target_tier` y `learning_path` en las respuestas de dashboard y ruta progresiva.

#### B. Nuevo módulo `backend/app/engine/hlr_scheduler.py`
Funciones deterministas puras (sin acceso directo a BD, fáciles de probar):
* **`compute_recall_probability(delta_days: float, half_life_days: float) -> float`:**
  $$p = \text{clamp}\!\left(2^{-\max(0, \Delta) / \max(1.0, h)},\; 0.05,\; 1.0\right)$$
* **`update_memory_trace(half_life_days, difficulty_index, passed, gap_type=None, response_time_ms=0) -> dict`:**
  * Acierto (`passed=True`): $h_{\text{new}} = \min(90.0,\; h \cdot (1.65 + 0.35 \cdot (1 - D)))$, $D_{\text{new}} = \max(0.15,\; D - 0.06)$. Si `response_time_ms` indica respuesta analítica rápida y precisa (`0 < ms <= 25000`), aplica bono de fluidez `+0.08` al factor multiplicativo (Sistema 1 consolidado).
  * Fallo (`passed=False`): $h_{\text{new}} = \max(1.0,\; h \cdot 0.48)$, $D_{\text{new}} = \min(0.95,\; D + (0.18\text{ si } \text{GAP\_TRIAGE\_SEVERITY}\text{ else } 0.12))$.
  * Retorna también `hlr_next_review_days = max(1, min(30, round(-h_new * log2(0.80))))` (momento óptimo cuando el recuerdo cae al `80%`) como métrica aditiva de telemetría HLR.
* **`select_goldilocks_tier(mastery_score: float, recall_probability: float, critical_safety_flag: bool = False) -> dict`:**
  * Calcula habilidad estimada $\theta = \frac{\text{mastery} - 50}{25} + (p - 0.75)$ y evalúa la probabilidad logística $P(\text{éxito} \mid \theta, \beta_k) = \frac{1}{1 + e^{-(\theta - \beta_k)}}$ contra tres umbrales de dificultad ($\beta_1 = -0.9$, $\beta_2 = 0.0$, $\beta_3 = +0.95$).
  * Selecciona el nivel más cercano a la **Goldilocks Zone (`0.78`)**, forzando `Nivel 1` si `critical_safety_flag=True` (regla de seguridad clínica inviolable).

#### C. Nueva tabla ORM `UserMemoryTrace` (`user_memory_traces`) y Reglas en `simulate_elapsed_days()` (Decisión de ingeniería)
* **Granularidad única (`concept_type = "specialty"`):** se mantiene exactamente **1 traza por especialidad cardinal por usuario** (5 filas por estudiante: `nefrologia`, `endocrinologia`, `neurologia`, `reumatologia`, `ginecologia_obstetricia`) con `concept_key = specialty_slug` y `UniqueConstraint("user_id", "concept_key", name="uq_user_memory_concept")`. Esto garantiza escritura O(1) en `record_mcq_attempt()` y promedios limpios en `hlr_summary`.
* Columnas: `id`, `user_id` (`ForeignKey("users.id", ondelete="CASCADE")`), `concept_key` (`String(100)`), `concept_type` (`String(30)`, default `"specialty"`), `half_life_days` (`Float`, default `4.0`), `difficulty_index` (`Float`, default `0.5`), `reps_count` (`Integer`, default `0`), `lapses_count` (`Integer`, default `0`), `last_practiced_at` (`DateTime`), `updated_at` (`DateTime`).
* Al registrarse o completar el diagnóstico inicial (`submit_diagnostic_exam`), se inicializan/calibran las 5 trazas cardinales con $h_0$ según puntaje (`2.0d` si `<50%`, `5.0d` si `50-74%`, `10.0d` si `>=75%`) y `last_practiced_at = now_utc`.
* **Mutación coherente en `simulate_elapsed_days()`:**
  * **`active_streak` (`+1d`, `+7d`, `+21d`):** simula práctica constante en las especialidades activas/prioritarias (sus trazas avanzan `last_practiced_at = effective_now_utc` e incrementan `half_life_days` progresivamente `×1.15 / ×1.35 / ×1.65`, manteniendo $p \ge 0.80$), mientras las especialidades con brecha/tarea vencida sin repaso reciente conservan su `last_practiced_at` anterior para que su retención $p$ decaiga de forma realista y marque nodos en `needs_review` coherentes con D7/D21.
  * **`inactivity_decay` (`14d sin practicar`):** no avanza `last_practiced_at` en ninguna traza y comprime suavemente `half_life_days = max(1.5, h * 0.85)`, provocando que $p = 2^{-\Delta/h}$ caiga bruscamente en todas las unidades y active alertas `needs_review` (Curva del Olvido de Ebbinghaus + HLR).
  * **`reset` (`Restablecer al Día 0`):** restaura las 5 trazas al baseline post-diagnóstico (`h_0` según `diagnostic_score`, `difficulty_index = 0.5`, `last_practiced_at = now_utc`), devolviendo $p = 1.0$.

#### D. Máquina de Estados de la Ruta Clínica Progresiva (`build_progressive_learning_path`) (Decisión de ingeniería)
* **Ordenamiento de las 5 Unidades Cardinales:** se ordenan priorizando primero la unidad correspondiente a la especialidad elegida en el diagnóstico/onboarding (si es no-cardinal —`medicina_interna`, `pediatria`, `cirugia_general`, `medicina_familiar`—, se mapea automáticamente a la especialidad cardinal de su caso principal en `SPECIALTY_TO_CASE_CANDIDATES[spec][0]`), seguida de las unidades con menor maestría / menor retención HLR.
* **Desbloqueo pre-diagnóstico vs. post-diagnóstico:**
  * Antes de completar el examen diagnóstico (`diagnostic_completed == False`): las 5 unidades retornan todos sus nodos como `"locked"` y hacer clic redirige al examen diagnóstico (coherente con el bloqueo actual de `DashboardPage`).
  * Tras completar el diagnóstico (`diagnostic_completed == True`): **las 5 unidades tienen su Nodo 1 desbloqueado** (`"active"` si no ha sido superado), permitiendo seguir la Unidad 1 prioritaria o iniciar cualquier especialidad cardinal; dentro de cada unidad, los nodos 1 -> 2 -> 3 -> 4 se desbloquean secuencialmente.
* **Los 4 nodos por unidad y resolución del Nodo 4 (`Guardia Integradora`):**
  1. `Estación 1 · Triaje y Estabilización` (`station_id=1`, `node_type="triage"`, `Nivel 1`)
  2. `Estación 2 · Diagnóstico y Exámenes` (`station_id=2`, `node_type="labs"`, `Nivel 2`)
  3. `Estación 3 · Conducta Inicial` (`station_id=3`, `node_type="management"`, `Nivel 3`)
  4. `Guardia Integradora · Sello de Unidad` (`station_id=1`, `node_type="checkpoint"`): **sello de consolidación que nunca se auto-completa solo por la nota diagnóstica**; pasa a `"completed"` exclusivamente cuando las Estaciones 1, 2 y 3 tienen al menos un intento aprobado (`passed=True`), y cambia a `"needs_review"` (lanzando repaso integral desde Estación 1 en `SimulatorPage`) si la retención HLR de la unidad cae por debajo de `0.72`.
* **Navegación directa a estación:** `App.tsx` y `SimulatorPage.tsx` incorporan el parámetro opcional `initialStationNumber?: number` (`1 | 2 | 3`) en `onSelectCase(caseId, stationNumber?)` para abrir el simulador exactamente en la estación seleccionada desde la ruta.
* **Nuevos contratos API (100% aditivos y retrocompatibles):**
  * `GET /api/v1/leveling/learning-path`: devuelve `{ units, active_node, hlr_summary, total_nodes, completed_nodes }`.
  * `GET /api/v1/leveling/dashboard`: mantiene todas sus llaves actuales y añade `hlr_summary` y `learning_path`.
  * `POST /api/v1/leveling/simulate-days`: actualiza y devuelve el `dashboard` ya recalculado con la nueva probabilidad de recuerdo HLR y nodos en `needs_review`.

### 5.3 Persistencia Real de Registro de Usuarios y Estabilidad de Sesión

* **Decisión técnica asumida (nuestra propuesta):** dado que el usuario aún no especificó proveedor PostgreSQL, el sistema queda listo para funcionar **de inmediato sin configuración extra en local (SQLite persistente)** y **listo en un paso para PostgreSQL en Vercel (Neon o Supabase)** apenas se asigne `DATABASE_URL` en el proyecto de Vercel.
* **Correcciones concretas:**
  1. **Normalización y validación de correo:** `email.strip().lower()` en `register_user` y `authenticate_user` (`student_service.py`) para evitar fallos de inicio de sesión por mayúsculas o espacios.
  2. **Migración idempotente multi-motor (`backend/app/db/session.py`):** extender `_ensure_user_columns()` para soportar **PostgreSQL** (`ALTER TABLE users ADD COLUMN IF NOT EXISTS ...`) además de SQLite, y asegurar la creación de `user_memory_traces` en `init_db()`.
  3. **Telemetría de persistencia en `/api/v1/health` y Portal `/` (Decisión de ingeniería):** añadir `storage_mode` (`"postgresql"` | `"sqlite_local"` | `"sqlite_ephemeral"`) y `persistent: bool` en `/api/v1/health` y mostrarlo claramente en el portal backend `/`, manteniendo la interfaz estudiantil libre de banners técnicos invasivos durante exposiciones.
  4. **Eliminación de carrera en registro (`frontend/src/context/AuthContext.tsx`):** en `register()` y `login()`, usar directamente `res.user` si viene en la respuesta (evitando un `getMe()` redundante inmediato) y solo invocar `getMe()` si el payload no incluye `user`. Al restaurar sesión o fallar conexión, exponer mensajes claros en español.

### 5.4 Estilo Editorial en el Backend (`backend/app/main.py`)

* **Portal API Editorial (`GET /` y `GET /portal`):**
  * Cuando el cliente envía `Accept` priorizando `text/html` (navegador web), `GET /` sirve una página HTML editorial médica (`Source Serif 4` + `Inter` + `JetBrains Mono`, fondo `#FAF9F6`, acento `#0E6F65`, divisores `1px`) con estado del motor OCRI-HLR, modo de persistencia activo y accesos directos a `/docs`, `/redoc` y `/api/v1/health`.
  * Cuando el cliente solicita JSON o `Accept: */*` (como `TestClient`, `curl` o integraciones), `GET /` conserva exactamente la respuesta JSON `{ "message", "docs", "health" }`.
* **Swagger UI Estilizado (`GET /docs`):**
  * Configurar `docs_url=None` en `FastAPI(...)` y servir `/docs` mediante `get_swagger_ui_html` con hoja de estilos embebida editorial (tipografía limpia, paleta `#FAF9F6` / `#0D1F26` / `#0E6F65`, sin botones verdes chillones ni sombras pesadas).

### 5.5 Rediseño Editorial Frontend, Ruta Progresiva y Animaciones Scroll-Driven

* **Tipografía y Tokens (`frontend/index.html`, `frontend/tailwind.config.js`, `frontend/src/index.css`):**
  * Cargar `Source Serif 4`, `Inter` y `JetBrains Mono` desde Google Fonts.
  * Corregir `fontFamily.mono` en `tailwind.config.js` a `['"JetBrains Mono"', 'ui-monospace', 'monospace']` y `fontFamily.serif` a `['"Source Serif 4"', 'Georgia', 'serif']`.
  * Aplicar la paleta editorial `#FAF9F6` / `#F3F1EC` / `#DEDBD2` / `#0D1F26` / `#0E6F65` / `#9A6B1F` / `#A6262E`.
* **Alcance editorial unificado (Decisión de ingeniería):**
  * **Rediseño estructural principal:** `LandingPage.tsx`, `DashboardPage.tsx`, `Navbar.tsx`, `BentoStats.tsx`, `SpacedRepetitionQueue.tsx` y `TimePassageSimulator.tsx` eliminando tarjetas `rounded-2xl` pastel repetitivas, píldoras eyebrow `rounded-full` y badges pastel sobre tarjetas, adoptando columnas asimétricas separadas por líneas finas de `1px` y telemetría en `JetBrains Mono`.
  * **Reemplazo de la cuadrícula redundante de `SpecialtyCard` en `DashboardPage`:** `ClinicalLearningPath` sustituye la cuadrícula repetitiva de 5 tarjetas en `DashboardPage` como vista principal de avance (manteniendo `SpecialtyCard.tsx` exportado y estilizado en editorial plano solo por compatibilidad de imports).
  * **Armonización de vistas secundarias:** alinear los tokens de color, bordes finos de `1px` y tipografía (`Source Serif 4` + `JetBrains Mono`) en `SimulatorPage.tsx`, `DiagnosticExamPage.tsx`, `LibraryPage.tsx` y `AuthModal.tsx` para evitar cortes visuales entre pantallas.
* **Nuevo componente `frontend/src/components/dashboard/ClinicalLearningPath.tsx`:**
  * Muestra las unidades progresivas con encabezado editorial (título de unidad, barra de retención HLR `p` y vida media `h` en `JetBrains Mono`, nivel *Goldilocks* recomendado).
  * Traza una columna vertebral clínica limpia de `1px` conectando los 4 nodos por unidad con anillos SVG de progreso:
    * `completed`: círculo sólido `#0E6F65` con trazo animado de confirmación.
    * `active`: anillo doble `#0E6F65` con pulso suave y acción directa `"Iniciar estación"` / `"Continuar"`.
    * `needs_review`: anillo `#A6262E` o `#9A6B1F` mostrando el `%` de recuerdo decaído y acción `"Rescatar retención"`.
    * `locked`: trazo fino `#DEDBD2` con indicador discreto de requisito previo.
  * Al hacer clic en un nodo desbloqueado, abre directamente el simulador en ese caso y estación (`onSelectCase(node.case_id, node.station_id)`).
* **Coreografía Continua Bidireccional CSS Scroll-Driven + View Transitions:**
  * En `frontend/src/index.css`:
    * Barra superior fina de progreso de lectura (`2px`, `#0E6F65`, `transform: scaleX(...)` con `animation-timeline: scroll(root)`).
    * Encabezado sticky que refina su altura y borde al hacer scroll (`animation-timeline: scroll(block root)`, `animation-range: 0px 120px`, con `@supports ((animation-timeline: scroll()) and (animation-range: 0% 100%))`).
    * Revelado y desplazamiento editorial continuo bidireccional en todas las secciones (`class="scroll-editorial-reveal"`, `animation-timeline: view()`, `animation-range: entry 0% cover 28%`) con fallback automático a `useScrollReveal` cuando `CSS.supports('animation-timeline: view()')` es falso.
  * Nuevo componente ligero `frontend/src/components/common/ScrollParticlesBackdrop.tsx`: partículas geométricas clínicas bien espaciadas y de muy baja opacidad detrás del contenido en `LandingPage`, acopladas suavemente al scroll con `requestAnimationFrame` y desactivadas automáticamente bajo `prefers-reduced-motion: reduce`.
  * En `frontend/src/App.tsx`: envolver cambios de pestaña (`landing` / `dashboard` / `simulator` / `library` / `diagnostic`) con `document.startViewTransition` cuando el navegador lo soporte.

---

## 6. Decisiones Dejadas al Implementador

* Curvas de easing exactas y duraciones finas de las micro-animaciones de desbloqueo de nodos.
* Coordenadas SVG internas del anillo de progreso y espaciado exacto de partículas del canvas de fondo.
* Redacción detallada de mensajes de ayuda secundarios y títulos de las pruebas unitarias nuevas (`test_hlr_and_learning_path.py`).
* Pasos concretos del archivo `.env.example` / guía breve para enlazar `DATABASE_URL` en Vercel con Neon o Supabase.
