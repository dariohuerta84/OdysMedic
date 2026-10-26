# OdyssMedic - Plataforma de Entrenamiento Clinico Adaptativo

Iniciativa desarrollada para el curso de Proyectos de Ingenieria 2 (Universidad Peruana Cayetano Heredia - UPCH) y vinculada a la BioIncubadora Cayetano 2026.

Autores: Dario Huerta Cruz & Elvis Deiwis Pilco Cruz.  
Evaluador: Mag. Noe Bazan.

---

## 1. Vision del Producto y Proposito del Prototipo

OdyssMedic es una plataforma de aprendizaje y entrenamiento clinico adaptativo disenada para internos y estudiantes de medicina que se preparan para examenes de alto impacto (ENAM, EsSalud y Residentado Medico).

A diferencia de los bancos de preguntas tradicionales basados en memorizacion de respuestas estaticas, OdyssMedic implementa un **motor de evaluacion retrospectiva y deteccion de brechas cognitivas** sustentado en casos clinicos reales extraidos de literatura medica indexada (Springer / BMC).

---

## 2. Como Funciona el Prototipo

El prototipo opera mediante un ciclo cerrado de simulacion, evaluacion formativa y adaptabilidad:

```
[ Viñeta Clinica Sanitizada ] 
              |
              v
[ Toma de Decisiones del Estudiante ] 
  (Diagnostico + Farmacos + Dosis + Via)
              |
              v
[ Motor de Evaluacion Retrospectiva ] 
  (Cotejo contra Estandar de Oro y Criterios)
              |
              v
[ Clasificacion de Brechas Cognitivas (OCRI) ]
              |
              v
[ Debriefing + Perla Clinica Accionable + Radar ]
```

### Pasos de la Interaccion

1. **Presentacion de la Vineta Clinica Sanitizada**:
   El estudiante recibe un caso con datos fidedignos del paciente: edad, sexo, antecedentes, motivo de consulta, signos vitales basales, examen fisico y pruebas de laboratorio iniciales.  
   *Nota de diseno:* El backend sanitiza la respuesta correcta (`diagnosis.primary`), las intervenciones del equipo medico y los criterios de evaluacion para evitar sesgos o filtraciones previas a la respuesta.

2. **Toma de Decisiones Clinicas**:
   El estudiante ingresa su hipotesis diagnostica y su esquema de intervencion (farmaco propuesto, dosis numerica, unidad de medida, via de administracion y frecuencia).

3. **Evaluacion Retrospectiva**:
   El motor clinico analiza el desempeno del usuario contrastando sus respuestas con la matriz de criterios del caso (`evaluation_blueprint`):
   - **Precision Diagnostica**: Coincidencia contra el diagnostico principal, sinónimos aceptados (`accepted_aliases`) y descartes diferenciales.
   - **Manejo Farmacologico**: Coincidencia de principio activo y margen de tolerancia en dosis, unidad y via.
   - **Seguridad y Criterios Criticos**: Identificacion de conductas omitidas o contraindicadas.

4. **Deteccion de Brechas Cognitivas (Taxonomia OCRI)**:
   Cada error detectado se categoriza en una de las cuatro brechas cognitivas fundamentales:
   - `GAP_TRIAGE_SEVERITY`: Incapacidad para reconocer signos de alarma, inestabilidad vital o priorizacion de urgencia.
   - `GAP_DIAGNOSTIC_REASONING`: Falla en articular sintomas, signos y factores de riesgo en una entidad nosologica certera.
   - `GAP_LAB_INTERPRETATION`: Interpretacion incorrecta u omision de hallazgos criticos en examenes auxiliares o frotis.
   - `GAP_INITIAL_MANAGEMENT`: Eleccion incorrecta del tratamiento de primera linea, dosis erronea o retraso en medidas de sosten.

5. **Entrega de Perla Clinica y Actualizacion del Perfil**:
   El usuario recibe una devolucion inmediata estructurada con un puntaje porcentual (0 a 100), el desglose por dimensiones clinicas, una perla clinica de 1 a 2 oraciones para fijar el concepto clave y la actualizacion de su radar de competencias.

---

## 3. Especialidades Medicas Soportadas

El dataset base recopila 7 casos clinicos reales de alta complejidad distribuidos en 5 especialidades medicas evidentes:

| N | Especialidad | Casos Representativos en el Dataset | Diagnosticos y Tematicas Clave |
| :--- | :--- | :--- | :--- |
| 1 | **Neurologia** | `s13256-023-04294-1`, `s13256-025-05577-5`, `s13256-026-05974-4` | Ictus isquemico vertebrobasilar con afecto pseudobulbar; secuelas de ictus hemorragico con deterioro motor/cognitivo; disartria lúpica inicial. |
| 2 | **Nefrologia y Medio Interno** | `s13256-019-2334-y`, `s13256-022-03392-w` | Sindrome uremico hemolitico atipico (aHUS), microangiopatia trombotica, LRA oligurica con dialisis; hipopotasemia severa sintomatica (2.5 mmol/L). |
| 3 | **Endocrinologia y Metabolismo** | `s13256-022-03392-w`, `s13256-025-05650-z` | Debut diabetico severo inducido por quimioterapia (capecitabina) con glucemia > 21 mmol/L; hipoparatiroidismo primario severo con hipocalcemia sintomatica. |
| 4 | **Reumatologia / Inmunologia** | `s13256-026-05974-4` | Lupus Eritematoso Sistemico con compromiso neuropsiquiatrico, consumo de complemento (C3/C4), autoanticuerpos positivos y terapia con pulsos. |
| 5 | **Ginecologia y Obstetricia** | `s13256-025-05650-z` | Gestante en 3er trimestre con antecedente de abortos recurrentes, sindrome genetico de DiGeorge y riesgo perinatal. |

*Nota respecto a Oftalmologia:* El caso `s13256-024-04496-1` (sindrome de efusion uveal con presion ocular de 46 mmHg) esta indexado en el backend y accesible en el modulo de emergencias medico-quirurgicas especializadas.

---

## 4. Estructura del Repositorio

```
OdysMedic/
├── README.md                      # Documento maestro de arquitectura y prototipo
├── .gitignore                     # Exclusion de binarios, entornos y dependencias
├── frontend/                      # Modulo reservado para la interfaz de usuario (Next.js)
│   └── .gitkeep
└── backend/                       # Modulo backend en Python (FastAPI)
    ├── README.md                  # Documentacion tecnica de la API y el motor
    ├── requirements.txt           # Dependencias del servicio
    ├── app/
    │   ├── main.py                # Punto de entrada de la aplicacion FastAPI
    │   ├── config.py              # Configuracion global de la aplicacion
    │   ├── data/
    │   │   └── clinical_cases.json # Dataset de casos clinicos reales (RAG)
    │   ├── models/                # Esquemas y contratos de datos (Pydantic)
    │   │   ├── enums.py           # Especialidades, Brechas Cognitivas y Estados
    │   │   ├── clinical_case.py   # Modelos del caso clinico y viñeta
    │   │   └── evaluation.py      # Modelos de envio, resultado y radar
    │   ├── engine/                # Logica del motor clinico y evaluacion
    │   │   ├── evaluator.py       # Evaluador retrospectivo contra ground truth
    │   │   ├── gap_classifier.py  # Clasificador de brechas cognitivas OCRI
    │   │   ├── scoring.py         # Algoritmo de puntuacion dimensional
    │   │   └── pearls_catalog.py  # Catalogo curado de perlas clinicas
    │   ├── services/
    │   │   └── case_service.py    # Servicio de ingestion, filtrado y sanitizacion
    │   └── api/                   # Controladores y rutas HTTP
    │       ├── routes_cases.py    # Rutas para consultar casos y viñetas
    │       ├── routes_specialties.py # Rutas de especialidades soportadas
    │       └── routes_evaluation.py # Rutas de ejecucion de evaluacion retrospectiva
    └── tests/                     # Suite de pruebas automatizadas
        ├── test_cases.py          # Verificacion de carga y sanitizacion
        └── test_evaluator.py      # Verificacion del motor de evaluacion retrospectiva
```

---

## 5. Guia Rapida de Instalacion y Ejecucion del Backend

### Requisitos Previos
- Python 3.10 o superior.
- Git.

### Pasos de Instalacion

1. Navegar a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Crear y activar un entorno virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instalar las dependencias requeridas:
   ```bash
   pip install -r requirements.txt
   ```

4. Ejecutar el servidor de desarrollo:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Acceso a la documentacion interactiva:
   - Swagger UI: `http://localhost:8000/docs`
   - Redoc: `http://localhost:8000/redoc`

### Ejecucion de la Suite de Pruebas

Para validar que el dataset este integro y el motor de evaluacion retrospectiva funcione con precision:
```bash
pytest
```

---

## 6. Proximos Pasos (Frontend)

El directorio `frontend/` se encuentra reservado para la implementacion de la interfaz de usuario en la siguiente fase. Esta incluira el lienzo interactivo de mundos clinicos (`Clinical Worlds Canvas`), el reproductor de viñetas clinicas (`Vignette Player`), el modal de brecha cognitiva y perla clinica, y la grilla Bento de radar de competencias.
