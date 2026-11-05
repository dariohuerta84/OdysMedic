import json
from pathlib import Path
from typing import Optional

from app.config import settings
from app.models.reference import ClinicalGuidelineExcerpt, MedicalReferenceBook


class ReferenceRepository:
    def __init__(self, references_file: Optional[Path] = None):
        self._file_path = references_file or getattr(
            settings,
            "medical_references_file",
            settings.data_dir / "medical_references.json",
        )
        self._books: dict[str, MedicalReferenceBook] = {}
        self._all_excerpts: list[ClinicalGuidelineExcerpt] = []
        self._excerpts_by_case: dict[str, list[ClinicalGuidelineExcerpt]] = {}
        self._excerpts_by_specialty: dict[str, list[ClinicalGuidelineExcerpt]] = {}
        self._load_references()

    def _load_references(self):
        if not self._file_path.exists():
            return

        with open(self._file_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        raw_books = raw_data.get("books", []) if isinstance(raw_data, dict) else raw_data

        for raw_b in raw_books:
            excerpts: list[ClinicalGuidelineExcerpt] = []
            for raw_e in raw_b.get("excerpts", []):
                excerpt = ClinicalGuidelineExcerpt(
                    reference_id=raw_e.get("reference_id", ""),
                    source_title=raw_e.get("source_title", raw_b.get("title", "")),
                    organization_or_publisher=raw_e.get(
                        "organization_or_publisher", raw_b.get("authors_or_organization", "")
                    ),
                    year=int(raw_e.get("year", 2024)),
                    edition_or_version=raw_e.get("edition_or_version"),
                    section_title=raw_e.get("section_title", ""),
                    page_or_doi=raw_e.get("page_or_doi", raw_b.get("isbn_or_doi")),
                    key_recommendation=raw_e.get("key_recommendation", ""),
                    evidence_level=raw_e.get("evidence_level", "Level B"),
                    associated_specialty=raw_e.get("associated_specialty", raw_b.get("specialty", "")),
                    associated_cases=raw_e.get("associated_cases", []),
                )
                excerpts.append(excerpt)
                self._all_excerpts.append(excerpt)

                # Index by specialty
                spec = excerpt.associated_specialty.lower()
                if spec not in self._excerpts_by_specialty:
                    self._excerpts_by_specialty[spec] = []
                self._excerpts_by_specialty[spec].append(excerpt)

                # Index by case
                for cid in excerpt.associated_cases:
                    if cid not in self._excerpts_by_case:
                        self._excerpts_by_case[cid] = []
                    self._excerpts_by_case[cid].append(excerpt)

            book = MedicalReferenceBook(
                book_id=raw_b.get("book_id", ""),
                title=raw_b.get("title", ""),
                authors_or_organization=raw_b.get("authors_or_organization", ""),
                edition=raw_b.get("edition", ""),
                specialty=raw_b.get("specialty", ""),
                isbn_or_doi=raw_b.get("isbn_or_doi"),
                excerpts_count=len(excerpts),
                excerpts=excerpts,
            )
            self._books[book.book_id] = book

    def get_all_books(self) -> list[MedicalReferenceBook]:
        return list(self._books.values())

    def get_book_by_id(self, book_id: str) -> Optional[MedicalReferenceBook]:
        return self._books.get(book_id)

    def get_citations_for_case(self, case_id: str) -> list[ClinicalGuidelineExcerpt]:
        return self._excerpts_by_case.get(case_id, [])

    def get_excerpts_by_specialty(self, specialty: str) -> list[ClinicalGuidelineExcerpt]:
        return self._excerpts_by_specialty.get(specialty.lower(), [])

    def get_all_excerpts(self) -> list[ClinicalGuidelineExcerpt]:
        return list(self._all_excerpts)


reference_repository = ReferenceRepository()
