from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.core.config import settings
from app.user.router import router as user_router

app = FastAPI(
    title="API da Landing Page/Blog",
    description="Documentação da API do backend (FastAPI) para Autenticação e Blog.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Routers
app.include_router(auth_router)
app.include_router(user_router)


@app.get("/", tags=["health"])
async def health_check():
    return {"status": "ok"}
