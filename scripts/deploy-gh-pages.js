import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoUrl = 'https://github.com/leminhhuy1122/Translation.git';
const branch = 'gh-pages';
const distDir = path.resolve('dist');

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        ...options
    });

    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(' ')} failed`);
    }
}

async function main() {
    await fs.access(distDir);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'translation-gh-pages-'));
    await fs.cp(distDir, tempDir, { recursive: true });
    await fs.writeFile(path.join(tempDir, '.nojekyll'), '');

    run('git', ['init'], { cwd: tempDir });
    run('git', ['checkout', '-b', branch], { cwd: tempDir });
    run('git', ['remote', 'add', 'origin', repoUrl], { cwd: tempDir });
    run('git', ['add', '-A'], { cwd: tempDir });
    run('git', ['commit', '-m', 'Deploy Vite build'], { cwd: tempDir });
    run('git', ['push', '-f', 'origin', `${branch}:${branch}`], { cwd: tempDir });

    console.warn(`Published ${distDir} to ${branch}.`);
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
