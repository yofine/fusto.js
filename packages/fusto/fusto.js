#!/usr/bin/env node
'use strict';

// Hardcode supported Node.js version so we don't have to read differently in CJS & ESM.
const engines = '>=18.14.1';
const skipSemverCheckIfAbove = 19;

async function main() {
	const version = process.versions.node;
	// Fast-path for higher Node.js versions
	if ((parseInt(version) || 0) <= skipSemverCheckIfAbove) {
		try {
			const semver = await import('semver');
			if (!semver.satisfies(version, engines)) {
				await errorNodeUnsupported();
				return;
			}
		} catch {
			await errorNodeUnsupported();
			return;
		}
	}

	// windows drive letters can sometimes be lowercase, which vite cannot process
	if (process.platform === 'win32') {
		const cwd = process.cwd();
		const correctedCwd = cwd.slice(0, 1).toUpperCase() + cwd.slice(1);
		if (correctedCwd !== cwd) process.chdir(correctedCwd);
	}

	return import('./dist/cli/index.js')
		.then(({ cli }) => cli(process.argv))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}

main()
	.then(() => process.exit(0))
	.catch(() => process.exit(1));
