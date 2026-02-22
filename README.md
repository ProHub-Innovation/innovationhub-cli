# InnovationHub CLI

Ferramenta oficial para inicializar projetos Backend na InnovationHub.

## Instalação

Para usar sem instalar (recomendado):

```bash
npx innovationhub-cli
```

Para instalar globalmente:

```bash
npm install -g innovationhub-cli
```

## Como Usar

### Modo Interativo

Execute o comando e siga os passos:

```bash
innovationhub
```

O CLI vai guiar você por:

1. **Nome do Projeto** — nome da pasta
2. **Stack** — NestJS ou Python (FastAPI)
3. **Addons** — recursos opcionais (variam por stack)
4. **Resumo** — revise e confirme
5. **Dependências** — instalar automaticamente (opcional)

### Modo Direto (CLI Flags)

Para automação ou uso rápido via flags:

```bash
# Criar projeto completo
innovationhub --name meu-api --stack nest --addons cloudinary,.github --install

# Mínimo, sem addons e sem confirmações
innovationhub -n meu-api -s nest -y

# Python com todos os addons
innovationhub -n minha-api -s python -a cloudinary,.github,pre-commit -i -y
```

#### Flags Disponíveis

| Flag               | Short | Descrição                             |
| ------------------ | ----- | ------------------------------------- |
| `--name <nome>`    | `-n`  | Nome do projeto                       |
| `--stack <stack>`  | `-s`  | Stack (`nest` ou `python`)            |
| `--addons <lista>` | `-a`  | Addons separados por vírgula          |
| `--install`        | `-i`  | Instalar dependências automaticamente |
| `--yes`            | `-y`  | Pular confirmações                    |
| `--version`        | `-v`  | Mostrar versão                        |
| `--help`           | `-h`  | Mostrar ajuda                         |

> **Dica:** as flags são opcionais — se faltar alguma, o CLI pergunta interativamente.

## Stacks Disponíveis

| Stack                | Descrição                                         |
| -------------------- | ------------------------------------------------- |
| **NestJS**           | Backend Node.js com TypeScript, TypeORM, JWT Auth |
| **Python (FastAPI)** | Backend Python com SQLAlchemy, Alembic, JWT Auth  |

### Criando Novas Stacks

Para adicionar uma nova stack, crie uma pasta em `templates/{nome}/` com um `template.json`:

```json
{
  "label": "Nome Exibido",
  "description": "Descrição curta da stack"
}
```

O CLI descobre as stacks automaticamente — sem precisar alterar o código.

## Addons por Stack

Cada stack possui addons específicos. Ao selecionar uma stack, o CLI mostra apenas os addons disponíveis para ela.

**NestJS:**

- Cloudinary (Upload de Imagens)
- GitHub Actions (CI/CD)
- Husky (Lint & Commits)

**Python (FastAPI):**

- Cloudinary (Upload de Imagens)
- GitHub Actions (CI/CD)
- Pre-commit (Lint & Formatação)

### Criando Novos Addons

Para adicionar um novo addon a uma stack:

1. Crie uma pasta em `templates/{stack}/addons/{nome-do-addon}/`
2. Adicione a entrada no `templates/{stack}/addons/addons.json`:
   ```json
   {
     "name": "nome-do-addon",
     "label": "Nome Amigável",
     "dest": "caminho/destino"
   }
   ```

O CLI descobre os addons automaticamente — sem precisar alterar o código.

## Desenvolvimento

```bash
# Clone este repositório
git clone https://github.com/ProHub-Innovation/innovationhub-cli.git
cd innovationhub-cli

# Instale as dependências
npm install

# Link globalmente para testar
npm link

# Rode o comando
innovationhub
```

## Publicação

```bash
# Atualizar versão (semver)
npm version patch|minor|major

# Login no NPM (primeira vez)
npm login

# Publicar
npm publish --access public
```

Os usuários que usam `npx innovationhub-cli` pegarão a nova versão automaticamente.

## Autor

Desenvolvido por **[Guilherme Araújo](https://github.com/Slotov7)** ·

[Liga Acadêmica de Empreendedorismo Innovation Hub](https://github.com/ProHub-Innovation)

## Licença

[MIT](LICENSE) © 2026 Innovation Hub
