import pytest
from app.models.reference import MedicalReferenceBook, ClinicalGuidelineExcerpt
from app.services.reference_service import reference_repository

def test_load_medical_references():
    books = reference_repository.get_all_books()
    assert len(books) >= 5, "Expected at least 5 canonical clinical books/guidelines"

def test_get_citation_for_case():
    citations = reference_repository.get_citations_for_case("s13256-019-2334-y")
    assert len(citations) >= 1
    assert any("KDIGO" in c.source_title or "Atypical Hemolytic" in c.source_title for c in citations)

def test_get_excerpts_by_specialty():
    excerpts = reference_repository.get_excerpts_by_specialty("nefrologia")
    assert len(excerpts) >= 1
    assert all(e.associated_specialty == "nefrologia" for e in excerpts)

def test_all_seven_cases_have_citations():
    case_ids = [
        "s13256-019-2334-y",
        "s13256-022-03392-w",
        "s13256-023-04294-1",
        "s13256-024-04496-1",
        "s13256-025-05577-5",
        "s13256-025-05650-z",
        "s13256-026-05974-4",
    ]
    for cid in case_ids:
        citations = reference_repository.get_citations_for_case(cid)
        assert len(citations) >= 1, f"Expected citation for case {cid}"

def test_reference_book_model():
    books = reference_repository.get_all_books()
    for book in books:
        assert isinstance(book, MedicalReferenceBook)
        assert book.book_id
        assert book.title
        assert book.authors_or_organization
        assert book.edition
        assert book.specialty

def test_case_repository_citation_link():
    from app.services.case_service import case_repository
    citations = case_repository.get_case_citations("s13256-019-2334-y")
    assert len(citations) >= 1
    assert any("KDIGO" in c.source_title for c in citations)

