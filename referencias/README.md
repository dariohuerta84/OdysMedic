# Carpeta Maestra de Referencias del Proyecto OdyssMedic

Este directorio centraliza **todas las fuentes bibliograficas, clinicas, pedagogicas, normativas y tecnologicas** utilizadas para el diseno, validacion e implementacion del prototipo **OdyssMedic** (Universidad Peruana Cayetano Heredia - Proyectos de Ingenieria 2 / BioIncubadora Cayetano 2026).

---

## Estructura del Repositorio Bibliografico (50 Fuentes Totales)

| Archivo | Categoria | Cantidad | Contenido Principal |
| :--- | :--- | :--- | :--- |
| [`01_casos_clinicos_indexados.md`](./01_casos_clinicos_indexados.md) | Casos Clinicos Reales (RAG) | **7 articulos** | Reportes clinicos arbitrados de *Journal of Medical Case Reports* (Springer Nature / BioMed Central) con enlaces DOI verificables (`10.1186/s13256-...`). |
| [`02_guias_y_tratados_clinicos.md`](./02_guias_y_tratados_clinicos.md) | Guias Internacionales y Tratados | **27 obras** | Compendio completo de guias KDIGO, ADA, AHA/ASA, ESC, Surviving Sepsis, EULAR, ACOG, FIGO, AAP, TG18, WSES, ATLS y tratados (Harrison, Brenner, Nelson, Kanski) en 9 especialidades. |
| [`03_fundamentos_pedagogicos_y_cognitivos.md`](./03_fundamentos_pedagogicos_y_cognitivos.md) | Ciencia Cognitiva y Evaluacion | **9 fuentes** | Curva del olvido de Ebbinghaus, practica distribuida (Cepeda et al.), educacion espaciada en medicina (Kerfoot et al.), errores cognitivos diagnosticos (Croskerry), Piramide de Miller y marcos ENAM/CONAREME. |
| [`04_arquitectura_y_diseno_editorial.md`](./04_arquitectura_y_diseno_editorial.md) | Ingenieria de Software y UX | **7 especificaciones** | Documentacion oficial de FastAPI, SQLAlchemy 2.0, Pydantic v2, React 18, TypeScript, Vite 6, Tailwind CSS, accesibilidad WCAG 2.1 y sistema editorial clasico. |
| [`catalogo_completo_referencias.json`](./catalogo_completo_referencias.json) | Datos Estructurados (JSON) | **50 registros** | Exportacion legible por maquina de todas las referencias para auditoria automatizada o integracion RAG. |
| [`referencias_odyssmedic.bib`](./referencias_odyssmedic.bib) | Bibliografia Academica (BibTeX) | **43 entradas** | Archivo compatible con LaTeX, Overleaf, Zotero y Mendeley para informes academicos y articulos. |

---

## Trazabilidad con el Codigo Fuente

- **Dataset de casos clinicos sanitizados:** [`../backend/data/clinical_cases.json`](../backend/data/clinical_cases.json)
- **Dataset de guias y listas de recoleccion semiologica:** [`../backend/data/medical_references.json`](../backend/data/medical_references.json)
- **Interfaz de consulta abierta con examenes protegidos:** [`../frontend/src/pages/LibraryPage.tsx`](../frontend/src/pages/LibraryPage.tsx)
