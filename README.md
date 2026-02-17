# InnovationHub CLI

Ferramenta oficial para inicializar projetos Backend e Frontend na InnovationHub.

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

Execute o comando no terminal:

```bash
innovationhub
```
Ou se não instalou:
```bash
npx innovationhub-cli
```

Siga os passos interativos:
1.  **Nome do Projeto**: Defina o nome da pasta.
2.  **Categoria**: Backend ou Frontend.
3.  **Stack**: Escolha a tecnologia (NestJS, Python, Java, Next.js, Vue, Angular).

O CLI irá baixar o template oficial do GitHub da organização `innovation-hub` e configurar o git inicial.

## Desenvolvimento

Para rodar localmente enquanto desenvolve:

```bash
# Clone este repositório
git clone https://github.com/innovation-hub/prohub-cli.git
cd prohub-cli

# Instale as dependências
npm install

# Link globalmente para testar
npm link

# Rode o comando
innovationhub
```

## Publicação

Para publicar uma nova versão no NPM:

1. Atualize a versão no `package.json`.
2. Faça login no npm (se ainda não fez):
   ```bash
   npm login
   ```
3. Publique:
   ```bash
   npm publish --access public
   ```
