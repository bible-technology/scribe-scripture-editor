import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: './e2e-tests',
	maxFailures: 2,
	timeout: 5 * 60 * 1000,
	globalTimeout: 60 * 60 * 1000,
	// Run all tests in parallel.
	fullyParallel: false,
	retries: 3,
	use: {
		// trace: 'on-first-retry', // record traces on first retry of each test

		// Run browser in headless mode.
		// headless: false,
	},
	expect: {
		timeout: 60 * 1000,
	},
};

export default config;
