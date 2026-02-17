import { execa } from 'execa';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';

const REPOS = {
    nest: 'https://github.com/ProHub-Innovation/template-nest.git',
    python: 'https://github.com/ProHub-Innovation/template-fastapi.git',
    java: 'https://github.com/ProHub-Innovation/template-spring.git',
    next: 'https://github.com/ProHub-Innovation/template-nextjs.git',
    vue: 'https://github.com/ProHub-Innovation/template-vue.git',
    angular: 'https://github.com/ProHub-Innovation/template-angular.git',
};

export async function setupProject(stack, projectName) {
    const s = p.spinner();
    s.start(`Baixando template oficial para ${stack}...`);

    try {
        if (!REPOS[stack]) {
            throw new Error(`Template para '${stack}' não encontrado.`);
        }

        await execa('git', ['clone', REPOS[stack], projectName]);

        // Remove .git folder to detach from the template repository
        const gitPath = `${projectName}/.git`;
        await fs.rm(gitPath, { recursive: true, force: true });

        // Initialize a new git repository
        await execa('git', ['init'], { cwd: projectName });

        s.stop(pc.green('Template configurado com sucesso!'));

        p.note(`
        Pŕoximos passos:
        1. cd ${projectName}
        2. npm install (ou gerenciador de preferência)
        3. Validar variáveis de ambiente (.env)
        `, 'Tudo pronto!');

    } catch (error) {
        s.stop(pc.red('Erro ao configurar o projeto.'));
        p.cancel(error.message);
        process.exit(1);
    }
}