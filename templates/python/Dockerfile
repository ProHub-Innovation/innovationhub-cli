FROM python:3.11-slim AS base
WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

FROM base AS production
WORKDIR /app
COPY --from=base /usr/local /usr/local
COPY . .
RUN alembic upgrade head || true
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]

FROM base AS development
WORKDIR /app
COPY --from=base /usr/local /usr/local
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000", "--reload"]
