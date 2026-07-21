from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import Normalizer

SOURCE_MODEL = "tfidf_v1"
LSA_SOURCE_MODEL = "tfidf_lsa_v1"
HYBRID_SOURCE_MODEL = "hybrid_lsa_v1"


@dataclass
class ScoredItem:
    item_type: str
    item_id: int
    score: float


def rank_items_by_interest(
    interests_text: str,
    items: List[Tuple[str, int, str]],
    top_n: int = 5,
    min_score: float = 0.05,
) -> List[ScoredItem]:
    """
    Content-based рекомендации: TF-IDF + cosine similarity между текстом
    интересов пользователя и текстом (title + description) каждого
    гранта/стипендии/стажировки.

    items — список (item_type, item_id, text).
    Возвращает top_n элементов с score >= min_score, по убыванию score.
    """
    if not interests_text or not interests_text.strip() or not items:
        return []

    corpus = [text for _, _, text in items]

    # Один общий словарь строится из всех документов + запроса пользователя,
    # иначе векторы были бы несравнимы (разная размерность/вес слов).
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(corpus + [interests_text])
    except ValueError:
        # Короткие тестовые тексты или тексты из одних stop words не должны
        # ломать весь пересчёт рекомендаций.
        try:
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform(corpus + [interests_text])
        except ValueError:
            return []

    item_vectors = tfidf_matrix[:-1]
    query_vector = tfidf_matrix[-1]

    similarities = cosine_similarity(query_vector, item_vectors)[0]

    scored = [
        ScoredItem(item_type=items[i][0], item_id=items[i][1], score=float(similarities[i]))
        for i in range(len(items))
        if similarities[i] >= min_score
    ]
    scored.sort(key=lambda s: s.score, reverse=True)
    return scored[:top_n]


def rank_items_by_interest_lsa(
    interests_text: str,
    items: List[Tuple[str, int, str]],
    top_n: int = 5,
    min_score: float = 0.05,
) -> List[ScoredItem]:
    """Content-based ranking with TF-IDF and latent semantic analysis.

    SVD projects sparse word vectors into latent topics, so related descriptions
    can still be close when their wording is not exactly identical. Very small
    corpora cannot be reduced reliably and fall back to regular TF-IDF.
    """
    if not interests_text or not interests_text.strip() or not items:
        return []

    corpus = [text for _, _, text in items] + [interests_text]
    try:
        tfidf_matrix = TfidfVectorizer(stop_words="english").fit_transform(corpus)
    except ValueError:
        return rank_items_by_interest(interests_text, items, top_n, min_score)

    n_documents, n_features = tfidf_matrix.shape
    n_components = min(64, n_documents - 1, n_features - 1)
    if n_components < 1:
        return rank_items_by_interest(interests_text, items, top_n, min_score)

    lsa = make_pipeline(
        TruncatedSVD(n_components=n_components, random_state=42),
        Normalizer(copy=False),
    )
    vectors = lsa.fit_transform(tfidf_matrix)
    similarities = cosine_similarity(vectors[-1:], vectors[:-1])[0]

    scored = [
        ScoredItem(item_type=items[i][0], item_id=items[i][1], score=float(similarities[i]))
        for i in range(len(items))
        if similarities[i] >= min_score
    ]
    scored.sort(key=lambda item: item.score, reverse=True)
    return scored[:top_n]
