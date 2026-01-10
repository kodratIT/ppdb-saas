import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const requiredFiles = ['package.json', 'svelte.config.js', 'src/app.html', 'tsconfig.json'];

/** @type {string[]} */
let missing = [];

requiredFiles.forEach((file) => {
	if (!fs.existsSync(path.resolve(process.cwd(), file))) {
		missing.push(file);
	}
});

if (missing.length > 0) {
	console.error('FAILED: Missing required SvelteKit files:', missing.join(', '));
	process.exit(1);
}

console.log('SUCCESS: SvelteKit project structure verified.');
process.exit(0);
