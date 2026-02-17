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

## Publicação e Atualização

Para liberar uma nova versão para todos os usuários:

1.  **Atualize a versão**:
    Use o comando do npm para atualizar o `package.json` automaticamente (seguindo semantic versioning):
    
    ```bash
    # Para correções de bugs (1.0.0 -> 1.0.1)
    npm version patch

    # Para novas funcionalidades (1.0.0 -> 1.1.0)
    npm version minor

    # Para mudanças que quebram compatibilidade (1.0.0 -> 2.0.0)
    npm version major
    ```

2.  **Login no NPM** (se executado pela primeira vez):
    ```bash
    npm login
    ```

3.  **Publique**:
    ```bash
    npm publish --access public
    ```

Os usuários que usam `npx innovationhub-cli` pegarão a nova versão automaticamente (pode levar alguns minutos para o cache do npx atualizar).
Quem instalou globalmente precisará rodar `npm install -g innovationhub-cli` novamente para atualizar.
