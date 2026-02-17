#!/usr/bin/env node
import * as p from '@clack/prompts';
import { setupProject } from './utils/git.js';

async function main() {
    p.intro('InnovationHub Project Generator');

    const projectName = await p.text({
        message: 'Qual o nome do seu projeto?',
        placeholder: 'meu-projeto',
        validate: (value) => {
            if (!value) return 'Por favor, insira um nome.';
            if (/[^a-z0-9-]/.test(value)) return 'Use apenas letras minúsculas, números e hífens.';
        },
    });

    if (p.isCancel(projectName)) {
        p.cancel('Operação cancelada.');
        process.exit(0);
    }

    const category = await p.select({
        message: 'O que você vai iniciar agora?',
        options: [
            { value: 'back', label: 'Backend (Repositório de API)' },
            { value: 'front', label: 'Frontend (Repositório de Interface)' },
        ],
    });

    if (p.isCancel(category)) {
        p.cancel('Operação cancelada.');
        process.exit(0);
    }

    let stack;

    if (category === 'back') {
        stack = await p.select({
            message: 'Qual a stack do Backend?',
            options: [
                { value: 'nest', label: 'NestJS' },
                { value: 'python', label: 'Python (FastAPI)' },
                { value: 'java', label: 'Java (Spring)' },
            ],
        });
    } else if (category === 'front') {
        stack = await p.select({
            message: 'Qual a stack do Frontend?',
            options: [
                { value: 'next', label: 'Next.js' },
                { value: 'vue', label: 'Vue.js' },
                { value: 'angular', label: 'Angular' },
            ],
        });
    }

    if (p.isCancel(stack)) {
        p.cancel('Operação cancelada.');
        process.exit(0);
    }

    await setupProject(stack, projectName);

    p.outro('Projeto criado com sucesso!');
}

main().catch(console.error);