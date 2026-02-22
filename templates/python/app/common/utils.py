import re
import unicodedata


def create_slug(title: str) -> str:
    """Gera um slug URL-friendly a partir de um título."""
    slug = unicodedata.normalize("NFD", title.lower())
    slug = re.sub(r"[\u0300-\u036f]", "", slug)  # Remove acentos
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")

    if len(slug) > 50:
        slug = slug[:50].rstrip("-")

    return slug
