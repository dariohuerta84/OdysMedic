# OdyssMedic - Modulo Backend (API, Motor Clinico y Nivelacion Adaptativa)

Backend clinico de **OdyssMedic**, implementado con **FastAPI (Python 3.10+)** y **SQLAlchemy 2.0 ORM**.

Su proposito es gobernar el banco de casos clinicos reales basados en literatura medica (RAG), administrar la autenticacion y persistencia de estudiantes de medicina, ejecutar el **motor de evaluacion retrospectiva y diagnostico de brechas cognitivas OCRI**, y generar la **prescripcion adaptativa de nivelacion** y repeticion espaciada (D7 / D21) personalizada por especialidad.

---

## 1. Arquitectura del Sistema

```
backend/
├── README.md                           # Especificacion integral del backend
├── requirements.txt                    # Dependencias de produccion y testing
├── data/
│   ├── clinical_cases.json             # Dataset de casos clinicos reales indexados (Springer / BMC)
│   └── medical_references.json         # Guias de practica clinica y libros canonicos (KDIGO, ADA, AHA, EULAR, FIGO, etc.)
├── app/
│   ├── main.py                         # Aplicacion FastAPI, ciclo de vida (lifespan) y montaje de routers
│   ├── config.py                       # Variables de entorno y configuracion general
│   ├── db/                             # Capa de persistencia (SQLAlchemy 2.0)
│   │   ├── __init__.py                 # Exportacion de componentes de base de datos
│   │   ├── session.py                  # DeclarativeBase, SessionLocal, engine SQLite/PostgreSQL y get_db
│   │   ├── models.py                   # Modelos ORM (User, StudentMastery, StudentGapMetric, CaseAttempt, etc.)
│   │   └── seeder.py                   # Semillero idempotente de referencias medicas y usuario demo UPCH
│   ├── models/                         # Modelos de dominio y esquemas Pydantic v2
│   │   ├── enums.py                    # MedicalSpecialty, CognitiveGap, StudentCompetencyLevel, DeficiencyType
│   │   ├── clinical_case.py            # Viñeta sanitizada y esquema completo de casos clinicos
│   │   ├── evaluation.py               # Evaluacion retrospectiva clasica y radar OCRI
│   │   ├── mcq.py                      # Estaciones graduadas (Nivel 1, 2, 3), opciones de alumno y resultados
│   │   ├── student.py                  # Perfiles de maestria, radar y prescripcion de nivelacion
│   │   └── reference.py                # Modelos de libros y citas bibliograficas
│   ├── engine/                         # Motor clinico y algoritmos adaptativos
│   │   ├── evaluator.py                # Evaluador retrospectivo y de estaciones MCQ con enlace a guias
│   │   ├── leveling_engine.py          # Calculo de maestria (EMA), niveles de competencia y prescripcion adaptativa
│   │   ├── gap_classifier.py           # Clasificador heuristico de brechas cognitivas OCRI
│   │   ├── scoring.py                  # Baremos de calificacion dimensional
│   │   └── pearls_catalog.py           # Catalogo curado de perlas clinicas de alta rentabilidad (<60s)
│   ├── services/                       # Servicios de negocio
│   │   ├── auth_service.py             # Hashing seguro con bcrypt y emision/verificacion de JWT
│   │   ├── student_service.py          # Estado del estudiante, dashboard, registro de intentos y repeticion espaciada
│   │   ├── case_service.py             # Repositorio de viñetas y casos clinicos sanitizados
│   │   ├── mcq_service.py              # Catalogo de estaciones MCQ multinivel con mapeo de distractores a brechas
│   │   └── reference_service.py        # Catalogo e indexador RAG de guias y libros de referencia
│   └── api/                            # Controladores REST (/api/v1)
│       ├── deps.py                     # Dependencias (get_db, get_current_user, get_active_student)
│       ├── routes_auth.py              # Registro, login, perfil protegido y conmutacion de plan
│       ├── routes_specialties.py       # Catalogo de especialidades clinicas (mundos)
│       ├── routes_cases.py             # Viñetas clinicas y estaciones MCQ de simulacion
│       ├── routes_evaluation.py        # Envio de propuestas retrospectivas y evaluacion de MCQ
│       ├── routes_leveling.py          # Dashboard de radar OCRI y prescripcion de nivelacion adaptativa
│       └── routes_references.py        # Catalogo de libros canonicos y citas bibliograficas
└── tests/                              # Suite exhaustiva de pruebas automatizadas (Pytest)
    ├── test_cases.py                   # Pruebas de sanitizacion y metadatos de casos
    ├── test_evaluator.py               # Pruebas de evaluacion retrospectiva y deteccion de brechas
    ├── test_reference_service.py       # Pruebas de citacion RAG y guias clinicas
    ├── test_leveling_engine.py         # Pruebas de baremos, calculo de niveles y prescripcion adaptativa
    ├── test_db_persistence.py          # Pruebas de modelos ORM, cascadas, claves foraneas e idempotencia
    ├── test_mcq_evaluation.py          # Pruebas de estaciones MCQ, distractores mapeados y perlas
    ├── test_student_service.py         # Pruebas de autenticacion, EMA, ciclos D7/D21 y dashboard
    └── test_api_integration.py         # Pruebas de integracion E2E sobre todos los endpoints REST
```

---

## 2. Taxonomia de Competencias y Brechas Cognitivas (Modelo OCRI)

El motor evalua al estudiante a lo largo de un espectro cognitivo multinivel:

### 2.1 Niveles de Maestria por Especialidad
El puntaje de maestria se calcula en escala de 0 a 100% mediante Media Movil Exponencial (EMA con alfa = 0.25):

* **Deficiente (< 60%):** Requiere nivelacion obligatoria prioritaria.
* **En Desarrollo (60% - 74%):** Requiere refuerzo en conceptos intermedios.
* **Competente (75% - 89%):** Dominio solido de protocolos estandar; no requiere nivelacion inmediata.
* **Avanzado (>= 90%):** Dominio sobresaliente y manejo seguro de casos atipicos.

*Regla de Inviolabilidad de Seguridad Clinica:* Cualquier error tipificado como `CRITICA_SEGURIDAD` (fallo en deteccion de riesgo vital o sobredosis toxica) fuerza la necesidad de nivelacion (`needs_leveling = True`), independientemente del puntaje numerico alcanzado.

### 2.2 Las 4 Brechas Cognitivas OCRI
Cada distractor u omision se vincula a una causa raiz formativa:
1. `GAP_TRIAGE_SEVERITY`: Error en clasificacion de severidad, signos de alarma o via aerea/hemodinamia.
2. `GAP_LAB_INTERPRETATION`: Error en interpretacion de gases arteriales, electrolitos, hemograma o imagenes.
3. `GAP_DIAGNOSTIC_REASONING`: Confusion en diagnosticos diferenciales clave o sesgo de anclaje.
4. `GAP_INITIAL_MANAGEMENT`: Eleccion inadecuada de farmaco, dosis erronea o contraindicacion formal.

### 2.3 Estaciones Graduadas por Dificultad
Cada caso clinico cuenta con 3 estaciones secuenciales de opcion multiple:
* **Nivel 1 (Fundacional):** Triaje, reconocimiento de peligro vital e identificacion inicial.
* **Nivel 2 (Intermedio):** Pruebas auxiliares, laboratorio y razonamiento diferencial.
* **Nivel 3 (Avanzado):** Manejo farmacologico urgente, dosificacion y titulacion segura.

---

## 3. Repeticion Espaciada Adaptativa (D7 / D21)

Cuando un estudiante comete un fallo en una estacion clinica:
1. El error se registra en `StudentGapMetric` y se recalcula el puntaje EMA de la especialidad.
2. Si es el primer error en dicho caso/brecha, se programa una tarea de repeticion espaciada para **7 dias despues (Ciclo D7)**.
3. Si el estudiante reincide en el error sobre el mismo caso o acumula fallos en la misma brecha cognitiva, el sistema eleva la tarea a **21 dias despues (Ciclo D21)** para consolidacion a largo plazo.
4. Al resolver correctamente el caso en una revision posterior, las tareas pendientes asociadas pasan automaticamente a estado `completed`.

---

## 4. Catalogo de Guias Clinicas RAG Indexadas

Los 7 casos clinicos reales estan anclados a guias y libros de texto canonicos:
* **Nefrologia (aHUS y Falla Renal Aguda):** KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS (doi:10.1016/j.kisu.2024.01.002).
* **Endocrinologia (Cetoacidosis e Hipokalemia por Capecitabina):** ADA Standards of Care in Diabetes 2024 (Diabetes Care 2024;47(Suppl. 1)).
* **Neurologia (Afecto Pseudobulbar Post-Ictus):** AHA/ASA Guidelines for the Management of Stroke and Pseudobulbar Affect 2023.
* **Reumatologia (Lupus Eritematoso Sistemico Neuropsiquiatrico):** EULAR/ACR 2023 Recommendations for the Management of NPSLE (Ann Rheum Dis 2023).
* **Ginecologia y Obstetricia (Hipoparatiroidismo en Gestante):** Endocrine Society / ACOG Guidelines for Hypoparathyroidism in Pregnancy.
* **Oftalmologia (Sindrome de Efusion Uveal):** American Academy of Ophthalmology (AAO) Preferred Practice Pattern for Uveal Diseases 2024.
* **Ginecologia Oncologica (Coriocarcinoma Metastasico Pulmonar):** FIGO 2024 Guidelines for the Diagnosis and Management of Gestational Trophoblastic Disease.

---

## 5. Catalogo de Endpoints REST API (`/api/v1`)

### 5.1 Autenticacion y Perfil (`/api/v1/auth`)
* `POST /api/v1/auth/register`: Registro rapido (<30s). Inicializa automaticamente el perfil de maestria en las 5 especialidades cardinales y devuelve token JWT Bearer.
* `POST /api/v1/auth/login`: Autenticacion mediante correo y contraseña. Devuelve token JWT Bearer.
* `GET /api/v1/auth/me`: Retorna los datos del perfil autenticado, XP, racha y nivel de suscripcion.
* `PATCH /api/v1/auth/toggle-plan`: Alterna la suscripcion entre plan "free" y "premium" (util para pruebas y demostraciones).

### 5.2 Especialidades Clinicas (`/api/v1/specialties`)
* `GET /api/v1/specialties`: Retorna el catalogo de especialidades con recuento de casos.
* `GET /api/v1/specialties/{specialty_id}/cases`: Retorna los resumenes de casos asociados a una especialidad.

### 5.3 Casos y Estaciones Sanitizadas (`/api/v1/cases`)
* `GET /api/v1/cases`: Lista de casos clinicos en formato resumen. Filtro opcional `?specialty=nefrologia`.
* `GET /api/v1/cases/{case_id}`: Viñeta clinica sanitizada para el estudiante (sin diagnosticos ni claves).
* `GET /api/v1/cases/{case_id}/stations`: Retorna las 3 estaciones de simulacion MCQ sanitizadas (sin respuestas ni distractores revelados).
* `GET /api/v1/cases/{case_id}/stations/{n}`: Retorna una estacion MCQ especifica.
* `GET /api/v1/cases/{case_id}/ground-truth`: Caso completo con estandar de oro y citas (auditoria docente).

### 5.4 Evaluacion y Deteccion de Brechas (`/api/v1/evaluation`)
* `POST /api/v1/evaluation/submit-mcq`: Evaluacion instantanea de la opcion seleccionada por el estudiante.
  * Otorga 100 puntos en caso de acierto o 0 puntos en caso de distractor.
  * Diagnostica la brecha cognitiva exacta y retorna la evidencia bibliografica y perla clinica.
  * Actualiza la maestria EMA y devuelve la receta de nivelacion adaptativa (`leveling_prescription`).
* `POST /api/v1/evaluation/submit`: Evaluacion retrospectiva clasica (propuesta diagnostica y terapeutica libre).
* `GET /api/v1/evaluation/taxonomy`: Descripcion formativa de las 4 Brechas Cognitivas.

### 5.5 Nivelacion Adaptativa, Diagnostico Dual y Simulador Longitudinal (`/api/v1/leveling`)
* `GET /api/v1/leveling/diagnostic/specialties`: Lista las especialidades habilitadas para el examen diagnostico focalizado.
* `GET /api/v1/leveling/diagnostic/questions`: Entrega las 5 estaciones de autoevaluacion inicial (`?mode=general` o `?mode=specialty&specialty=<id>`).
* `POST /api/v1/leveling/diagnostic/submit`: Califica el diagnostico inicial, calibra honestamente el rombo cognitivo y las especialidades (incluyendo puntajes bajos en rojo) y agenda automaticamente en `SpacedRepetitionTask` las estaciones falladas.
* `GET /api/v1/leveling/dashboard`: Tablero analitico del estudiante con `cognitive_gap_radar` dinamico, perfiles por especialidad, `simulated_days_elapsed` y cola adaptativa de repaso espaciado.
* `POST /api/v1/leveling/simulate-days`: Simulador longitudinal de paso del tiempo para exposiciones en una sola sesion (`mode="active_streak"` para `+1`, `+7`, `+21` dias; `mode="inactivity_decay"` para evidenciar la curva del olvido de Ebbinghaus; `mode="reset"` para volver al Dia 0).
* `GET /api/v1/leveling/prescription/{specialty}`: Prescripcion de micro-ejercicios y nivel de dificultad recomendado para cerrar brechas en la especialidad.

### 5.6 Guias y Literatura Medica (`/api/v1/references`)
* `GET /api/v1/references/books`: Catalogo de libros y guias de practica clinica indexadas.
* `GET /api/v1/references/by-case/{case_id}`: Citas y recomendaciones clave aplicadas a un caso clinico especifico.
* `GET /api/v1/references/by-specialty/{specialty}`: Citas filtradas por especialidad medica.

---

## 6. Ejemplos de Peticion y Respuesta

### 6.1 Envio de Respuesta MCQ (`POST /api/v1/evaluation/submit-mcq`)
**Peticion:**
```json
{
  "case_id": "s13256-019-2334-y",
  "station_number": 2,
  "chosen_option_id": "A",
  "response_time_ms": 28500
}
```

**Respuesta Retornada:**
```json
{
  "is_correct": false,
  "points_earned": 0.0,
  "correct_option_id": "C",
  "chosen_option_id": "A",
  "associated_gap": "GAP_DIAGNOSTIC_REASONING",
  "clinical_feedback": "Atencion: la opcion seleccionada no es la mas adecuada para este escenario. Razonamiento clinico: Confundir aHUS con PTT induce a retrasar la terapia dirigida de inhibicion de C5...",
  "citation_evidence": "Guia: KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS (Kidney Disease: Improving Global Outcomes (KDIGO), 2024). Nivel de evidencia: Grade 1A. Recomendacion: In patients presenting with microangiopathic hemolytic anemia...",
  "clinical_pearl": "Ante una anemia hemolitica microangiopatica con trombocitopenia e insuficiencia renal aguda en ausencia de diarrea sanguinolenta, sospechar Sindrome Uremico Hemolitico Atipico (aHUS)...",
  "recommended_difficulty": "Nivel 1 (Fundacional)",
  "leveling_prescription": {
    "specialty": "nefrologia",
    "current_mastery": 37.5,
    "assigned_deficiency": "razonamiento_diferencial",
    "recommended_exercise_difficulty": "Nivel 1 (Fundacional)",
    "target_exercise_ids": ["s13256-019-2334-y-st1"],
    "rationale": "El estudiante presenta una brecha en Razonamiento y Diagnostico Diferencial. Se prescribe revision prioritaria en Nivel 1 (Fundacional)...",
    "next_repetition_date": "2026-11-13T13:21:00Z",
    "is_active": true
  }
}
```

---

## 7. Instalacion y Ejecucion Local

### 7.1 Requisitos Previos
* Python 3.10 o superior (disponible via gestor de paquetes o uv).

### 7.2 Preparacion del Entorno Virtual
```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

### 7.3 Ejecucion del Servidor de Desarrollo
```bash
uvicorn app.main:app --reload --port 8000
```
La documentacion interactiva Swagger UI estara disponible de inmediato en:
`http://localhost:8000/docs`

### 7.4 Ejecucion de la Suite de Pruebas
```bash
PYTHONPATH=. pytest -v tests/
```
Toda la suite (71 pruebas unitarias y de integracion) debe pasar con cero errores:
```
============================== 71 passed in ~7s ==============================
```
