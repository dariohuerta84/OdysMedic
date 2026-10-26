# OdyssMedic - Modulo Backend (API y Motor Clinico)

Este directorio contiene el backend de **OdyssMedic**, implementado en **FastAPI (Python 3.10+)**. Su proposito es gobernar la carga de casos clinicos reales basados en evidencia (RAG), sanitizar las viñetas clinicas para la interfaz de usuario, y ejecutar el **motor de evaluacion retrospectiva y clasificacion de brechas cognitivas (OCRI)**.

---

## 1. Arquitectura de Directorios

```
backend/
├── README.md                  # Este documento
├── requirements.txt           # Dependencias (FastAPI, Uvicorn, Pydantic, Pytest)
├── data/
│   └── clinical_cases.json    # Dataset de 7 casos reales indexados de Springer/BMC
├── app/
│   ├── main.py                # Aplicacion FastAPI y configuracion CORS
│   ├── config.py              # Rutas y constantes de configuracion
│   ├── models/                # Modelos de dominio y contratos HTTP (Pydantic v2)
│   │   ├── enums.py           # MedicalSpecialty, CognitiveGap, EvaluationDimension
│   │   ├── clinical_case.py   # Esquemas del caso, vineta sanitizada y criterios
│   │   └── evaluation.py      # Esquemas de envio, calificacion y radar
│   ├── engine/                # Motor clinico y algoritmos de razonamiento
│   │   ├── evaluator.py       # Algoritmo de evaluacion retrospectiva contra ground truth
│   │   ├── gap_classifier.py  # Clasificador de errores en las 4 Brechas Cognitivas
│   │   ├── scoring.py         # Calculo de puntajes por dimension y global
│   │   └── pearls_catalog.py  # Catalogo de perlas clinicas de alta rentabilidad
│   ├── services/
│   │   └── case_service.py    # Repositorio de casos, sanitizacion e indexacion
│   └── api/                   # Controladores REST (/api/v1)
│       ├── routes_specialties.py # Rutas de catalogo de especialidades
│       ├── routes_cases.py    # Rutas de vineta y casos clinicos
│       └── routes_evaluation.py # Ruta de envio y evaluacion retrospectiva
└── tests/
    ├── test_cases.py          # Pruebas de carga de casos y sanitizacion
    └── test_evaluator.py      # Pruebas del evaluador retrospectivo y brechas
```

---

## 2. Endpoints Principales de la API (`/api/v1`)

### Especialidades
* `GET /api/v1/specialties`: Retorna las 5 especialidades cardinales cubiertas por el dataset con recuento de casos.
* `GET /api/v1/specialties/{specialty_id}/cases`: Retorna los casos asociados a una especialidad especifica.

### Casos Clinicos
* `GET /api/v1/cases`: Lista todos los casos en formato resumen (edad, sexo, motivo de consulta). Permite filtrado opcional mediante query parameter `?specialty=neurologia`.
* `GET /api/v1/cases/{case_id}`: Retorna la **viñeta clinica sanitizada** para el estudiante. Oculta deliberadamente el diagnostico confirmado, las conductas observadas y los criterios para evitar sesgos durante la resolucion.
* `GET /api/v1/cases/{case_id}/ground-truth`: Retorna el caso completo con su evidencia documental y citas de literatura (uso docente/depuracion).

### Evaluacion Retrospectiva
* `POST /api/v1/evaluation/submit`: Recibe la propuesta diagnostica y terapeutica del estudiante y retorna el reporte retrospectivo detallado.
* `GET /api/v1/evaluation/taxonomy`: Retorna la definicion de las 4 Brechas Cognitivas del modelo OCRI.

---

## 3. Ejemplo de Payload para Evaluacion Retrospectiva

**Endpoint:** `POST /api/v1/evaluation/submit`

```json
{
  "student_id": "estudiante_upch_01",
  "case_id": "s13256-019-2334-y",
  "proposed_diagnosis": "Sindrome uremico hemolitico atipico",
  "differential_diagnoses": [
    "Purpura trombocitopenica trombotica",
    "Sindrome uremico hemolitico tipico"
  ],
  "proposed_interventions": [
    {
      "drug_name": "cefuroxime",
      "dose_value": 750.0,
      "dose_unit": "mg",
      "route": "intravenous",
      "action_type": "medication"
    },
    {
      "drug_name": "metronidazole",
      "dose_value": 500.0,
      "dose_unit": "mg",
      "route": "intravenous",
      "action_type": "medication"
    },
    {
      "drug_name": "Recambio plasmatico terapeutico",
      "action_type": "procedure"
    }
  ]
}
```

**Respuesta Retrospectiva Generada:**
* `global_score`: Calificacion porcentual ponderada (0 a 100).
* `diagnostic_accuracy`: Boolean que indica si el diagnostico o sus sinónimos aceptados fueron acertados.
* `dimension_scores`: Desglose cuantitativo por dimensiones (`diagnostico`, `tratamiento`, `dosis`, etc.).
* `detected_gaps`: Lista de brechas cognitivas detectadas (`GAP_TRIAGE_SEVERITY`, `GAP_DIAGNOSTIC_REASONING`, `GAP_LAB_INTERPRETATION`, `GAP_INITIAL_MANAGEMENT`) con las causas de activacion.
* `clinical_pearl`: Perla clinica de alta rentabilidad para fijar el aprendizaje.
* `ground_truth_diagnosis`: Diagnostico definitivo revelado tras la entrega.

---

## 4. Instalacion y Ejecucion Local

1. Instalar dependencias en el entorno virtual de Python:
   ```bash
   pip install -r requirements.txt
   ```

2. Iniciar el servidor local:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Abrir la documentacion Swagger interactiva en el navegador:
   `http://localhost:8000/docs`

4. Ejecutar las pruebas unitarias:
   ```bash
   pytest tests/
   ```
