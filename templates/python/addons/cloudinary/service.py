"""
Addon: Cloudinary — Serviço de upload de imagens.

Para usar, adicione 'cloudinary' ao pyproject.toml:
    dependencies = [..., "cloudinary>=1.36.0"]

E copie este arquivo para app/cloudinary/service.py
"""

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.common.errors import ERRORS
from app.core.config import settings


def configure_cloudinary() -> None:
    """Configura o Cloudinary. Chame no startup da aplicação."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_image(file: UploadFile, folder: str) -> dict:
    """Faz upload de uma imagem para o Cloudinary."""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERRORS["IMAGE"]["REQUIRED"],
        )

    contents = await file.read()
    import base64

    file_base64 = base64.b64encode(contents).decode("utf-8")
    data_uri = f"data:{file.content_type};base64,{file_base64}"

    result = cloudinary.uploader.upload(data_uri, folder=folder, resource_type="image")
    return result


async def delete_image(public_id: str) -> dict:
    """Deleta uma imagem do Cloudinary pelo public_id."""
    return cloudinary.uploader.destroy(public_id)


async def replace_image(file: UploadFile, folder: str, old_public_id: str | None = None) -> dict:
    """Substitui uma imagem: deleta a antiga (se existir) e faz upload da nova."""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERRORS["IMAGE"]["REQUIRED"],
        )
    if old_public_id:
        await delete_image(old_public_id)
    return await upload_image(file, folder)


async def delete_images(public_ids: list[str]) -> dict:
    """Deleta múltiplas imagens do Cloudinary."""
    if not public_ids:
        return {}
    return cloudinary.api.delete_resources(public_ids)
