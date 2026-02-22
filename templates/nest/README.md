# Template NestJS — Innovation Hub

Template base para inicialização de projetos backend com **NestJS**. Inclui autenticação completa, gerenciamento de usuários e uma estrutura modular pronta para expandir.

## ✨ Funcionalidades Incluídas

- **Autenticação e Autorização**: Sistema completo de login com JWT (JSON Web Tokens), refresh tokens rotativos e controle de acesso baseado em papéis (Roles).
- **Gerenciamento de Usuários**: CRUD de usuários com criptografia de senhas (bcrypt), soft delete, paginação e reset de senha por admin.
- **Base Genérica Reutilizável**: `BaseEntity`, `BaseRepository`, `BaseService` e `IRepository` para criar novos módulos rapidamente.
- **Documentação de API**: Geração automática de documentação interativa com **Swagger (OpenAPI)**.
- **Envio de E-mails**: Serviço de e-mail configurável com templates Handlebars.
- **Utilitários**: Paginação, geração de slugs, parsing de duração, validadores customizados e constantes de erro centralizadas.

## 🚀 Tecnologias Utilizadas

- **Framework**: [NestJS](https://nestjs.com/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Containerização**: [Docker](https://www.docker.com/) e Docker Compose
- **Autenticação**: [Passport.js](http://www.passportjs.org/) (Estratégias `local`, `jwt` e `jwt-refresh`)
- **Validação de Dados**: `class-validator` e `class-transformer`
- **Testes**: [Jest](https://jestjs.io/) para testes unitários e E2E.

---

## 🏁 Como Começar

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (v18 ou superior)
- [Docker](https://www.docker.com/get-started) e Docker Compose
- [NPM](https://www.npmjs.com/)

### 1. Clone o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### 2. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env` e preencha as variáveis.

```bash
# No Windows (prompt de comando)
copy .env.example .env

# No Linux ou macOS
cp .env.example .env
```

Abra o arquivo `.env` e preencha todas as variáveis necessárias, como as credenciais do banco de dados e segredos do JWT. Para o ambiente Docker padrão, as credenciais do Postgres já vêm configuradas no `docker-compose.yml`.

### 3. Instale as Dependências

```bash
npm install
```

---

## 🐳 Executando com Docker (Recomendado)

O projeto está configurado para rodar facilmente com Docker, simplificando a configuração do banco de dados e da API.

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

Garanta que você tenha uma instância do PostgreSQL rodando e que as credenciais no seu arquivo `.env` apontem para ela.

### 2. Execute as Migrations

```bash
npm run migration:run
```

### 3. Inicie a Aplicação

```bash
# Modo de desenvolvimento com hot-reload
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📄 Documentação e Endpoints

### Acessar a Documentação

Com a aplicação em execução, acesse a documentação interativa da API gerada pelo Swagger em:
**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Resumo dos Endpoints Principais

- `POST /auth/login`: Autentica um usuário e retorna tokens JWT.
- `POST /auth/logout`: Faz logout (revoga refresh token).
- `POST /auth/refresh`: Atualiza os tokens de acesso usando um refresh token.
- `PATCH /auth/change-password`: Altera a senha do usuário logado.
- `GET /users/me`: Retorna o perfil do usuário autenticado.
- `PATCH /users/me`: Atualiza o perfil do usuário autenticado.
- `GET /users`: Lista todos os usuários (admin).
- `GET /users/paginated`: Lista usuários com paginação e busca (admin).
- `GET /users/:id`: Busca um usuário pelo ID (admin).
- `POST /users`: Cria um novo usuário (admin).
- `PATCH /users/:id`: Atualiza um usuário pelo ID (admin).
- `PATCH /users/:id/reset-password`: Reseta a senha de um usuário (admin).
- `DELETE /users/:id`: Deleta um usuário (admin).

---

## 📂 Estrutura do Projeto

```
src/
├── auth/         # Autenticação: estratégias (JWT, local, refresh), guards, decorators, DTOs
├── common/       # Base genérica (entity, repository, service), utilitários, validadores, DTOs
├── user/         # Módulo de gerenciamento de usuários (CRUD completo)
├── app.module.ts # Módulo raiz da aplicação
├── main.ts       # Arquivo de entrada (bootstrap da aplicação)
└── data-source.ts# Configuração da conexão com o banco de dados para o TypeORM
```

---

## 🔌 Addons Disponíveis

Na pasta `addons/` do repositório de templates, você encontra módulos opcionais que podem ser adicionados ao projeto:

| Addon        | Descrição                                                            |
| ------------ | -------------------------------------------------------------------- |
| `.github`    | Workflows de CI/CD, Dependabot, labeler, semantic PR, stale issues   |
| `.husky`     | Git hooks para Conventional Commits e lint pré-commit                |
| `cloudinary` | Módulo NestJS para upload, delete e replace de imagens no Cloudinary |

---

## 🔧 Scripts Úteis

### Migrations do TypeORM

- **Gerar uma nova migration a partir das mudanças nas entidades:**

  ```bash
  npm run migration:generate -- -n NomeDaMigration
  ```

- **Executar migrations pendentes:**

  ```bash
  npm run migration:run
  ```

- **Reverter a última migration:**
  ```bash
  npm run migration:revert
  ```

### Testes

- **Executar todos os testes unitários e de integração:**

  ```bash
  npm run test
  ```

- **Executar testes em modo de observação:**

  ```bash
  npm run test:watch
  ```

- **Verificar a cobertura de testes:**

  ```bash
  npm run test:cov
  ```

- **Executar testes end-to-end (E2E):**
  ```bash
  npm run test:e2e
  ```

### Lint e Formatação

- **Verificar e corrigir erros de lint com ESLint:**

  ```bash
  npm run lint
  ```

- **Formatar o código com Prettier:**
  ```bash
  npm run format
  ```
