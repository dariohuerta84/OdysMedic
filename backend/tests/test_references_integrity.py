import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REF_DIR = ROOT / "referencias"

REQUIRED_NEW_DOIS = [
    "10.18653/v1/P16-1174",
    "10.1145/3534678.3539081",
    "10.1162/tacl_a_00310",
    "10.3109/0142159X.2013.760036",
    "10.1080/0142159X.2017.1327706",
    "10.1097/ACM.0b013e3181ace703",
    "10.1111/j.1365-2923.2009.03498.x",
]


def test_references_catalog_contains_57_sources_and_new_ocri_models():
    raw = json.loads((REF_DIR / "catalogo_completo_referencias.json").read_text(encoding="utf-8"))
    ped_md = (REF_DIR / "03_fundamentos_pedagogicos_y_cognitivos.md").read_text(encoding="utf-8")
    bib = (REF_DIR / "referencias_odyssmedic.bib").read_text(encoding="utf-8")
    readme = (REF_DIR / "README.md").read_text(encoding="utf-8")

    total = raw["total_referencias"] if isinstance(raw, dict) and "total_referencias" in raw else len(raw)
    assert total == 57
    json_text = json.dumps(raw)
    for doi in REQUIRED_NEW_DOIS:
        assert doi in json_text
        assert doi in ped_md
        assert doi in bib
    assert "57" in readme
