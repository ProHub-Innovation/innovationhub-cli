# Template FastAPI — Innovation Hub

Template base para inicialização de projetos backend com **FastAPI**. Inclui autenticação completa, gerenciamento de usuários e uma estrutura modular pronta para expandir.

## ✨ Funcionalidades Incluídas

- **Autenticação e Autorização**: Sistema completo de login com JWT (JSON Web Tokens), refresh tokens rotativos e controle de acesso baseado em papéis (Roles).
- **Gerenciamento de Usuários**: CRUD de usuários com criptografia de senhas (bcrypt), soft delete, paginação e reset de senha por admin.
- **Base Genérica Reutilizável**: `BaseModel`, `BaseRepository` com generics Python para criar novos módulos rapidamente.
- **Documentação de API**: Geração automática de documentação interativa com **Swagger (OpenAPI)** — nativa do FastAPI.
- **Utilitários**: Paginação, geração de slugs, constantes de erro centralizadas e query params base.

## 🚀 Tecnologias Utilizadas

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Linguagem**: [Python](https://www.python.org/) (3.11+)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (async)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Containerização**: [Docker](https://www.docker.com/) e Docker Compose
- **Autenticação**: [python-jose](https://python-jose.readthedocs.io/) (JWT) + [passlib](https://passlib.readthedocs.io/) (bcrypt)
- **Validação de Dados**: [Pydantic v2](https://docs.pydantic.dev/)
- **Configuração**: [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Testes**: [pytest](https://pytest.org/) + [httpx](https://www.python-httpx.org/)
- **Lint/Formatação**: [ruff](https://docs.astral.sh/ruff/)

---

## 🏁 Como Começar

### Pré-requisitos

- [Python](https://www.python.org/) (3.11 ou superior)
- [Docker](https://www.docker.com/get-started) e Docker Compose

### 1. Clone o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### 2. Configure as Variáveis de Ambiente

```bash
# No Windows
copy .env.example .env

# No Linux ou macOS
cp .env.example .env
```

Preencha as variáveis no arquivo `.env`. As credenciais padrão do Postgres já funcionam com o Docker Compose.

### 3. Instale as Dependências

```bash
# Crie um ambiente virtual
python -m venv .venv

# Ative o ambiente virtual
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Instale o projeto
pip install -e ".[dev]"
```

---

## 🐳 Executando com Docker (Recomendado)

### Subir o Ambiente de Desenvolvimento

```bash
docker-compose --profile dev up -d --build
```

### Subir o Ambiente de Produção

```bash
docker-compose --profile prod up -d --build
```

- A API estará disponível em `http://localhost:3000`.
- O banco de dados PostgreSQL estará acessível na porta `5432`.

### Parar o Ambiente

```bash
docker-compose down
```

---

## ⚙️ Executando Localmente (Sem Docker)

### 1. Execute um Banco de Dados PostgreSQL

Garanta que uma instância do PostgreSQL esteja rodando e que as credenciais no `.env` estejam corretas.

### 2. Execute as Migrations

```bash
alembic upgrade head
```

### 3. Inicie a Aplicação

```bash
uvicorn app.main:app --reload --port 3000
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📄 Documentação e Endpoints

### Acessar a Documentação

Com a aplicação em execução:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **ReDoc**: [http://localhost:3000/api/redoc](http://localhost:3000/api/redoc)

### Resumo dos Endpoints Principais

- `POST /auth/login`: Autentica um usuário e retorna tokens JWT.
- `POST /auth/logout`: Faz logout (revoga refresh token).
- `POST /auth/refresh`: Atualiza os tokens de acesso usando um refresh token.
- `PATCH /auth/change-password`: Altera a senha do usuário logado.
- `GET /users/me`: Retorna o perfil do usuário autenticado.
- `PATCH /users/me`: Atualiza o perfil do usuário autenticado.
- `GET /users/`: Lista todos os usuários (admin).
- `GET /users/paginated`: Lista usuários com paginação e busca (admin).
- `GET /users/{user_id}`: Busca um usuário pelo ID (admin).
- `POST /users/`: Cria um novo usuário (admin).
- `PATCH /users/{user_id}`: Atualiza um usuário pelo ID (admin).
- `PATCH /users/{user_id}/reset-password`: Reseta a senha de um usuário (admin).
- `DELETE /users/{user_id}`: Deleta um usuário (admin).

---

## 📂 Estrutura do Projeto

```
app/
├── auth/           # Autenticação: JWT, dependencies, schemas, service, router
├── common/         # Base genérica (model, repository), utilitários, paginação, schemas
├── core/           # Configuração (settings) e banco de dados (SQLAlchemy async)
├── user/           # Módulo de gerenciamento de usuários (CRUD completo)
└── main.py         # Ponto de entrada da aplicação (FastAPI bootstrap)

alembic/
├── env.py          # Configuração do Alembic
├── script.py.mako  # Template de migration
└── versions/       # Arquivos de migration gerados
```

---

## 🔌 Addons Disponíveis

Na pasta `addons/` do repositório de templates, você encontra módulos opcionais:

| Addon        | Descrição                                                             |
| ------------ | --------------------------------------------------------------------- |
| `.github`    | Workflows de CI/CD, Dependabot, labeler, semantic PR, stale issues    |
| `pre-commit` | `.pre-commit-config.yaml` para Conventional Commits e lint pré-commit |
| `cloudinary` | Módulo Python para upload, delete e replace de imagens no Cloudinary  |

---

## 🔧 Scripts Úteis

### Migrations com Alembic

```bash
# Gerar uma nova migration
alembic revision --autogenerate -m "descricao da migration"

# Executar migrations pendentes
alembic upgrade head

# Reverter a última migration
alembic downgrade -1

# Ver status das migrations
alembic current
```

### Testes

```bash
# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=app

# Executar em modo verboso
pytest -v
```

### Lint e Formatação

```bash
# Verificar erros com ruff
ruff check .

# Corrigir automaticamente
ruff check --fix .

# Formatar código
ruff format .
```
