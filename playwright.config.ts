import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: './e2e-tests',
	maxFailures: process.env.CI ? 2 : 0,
	timeout: 5 * 60 * 1000,
	globalTimeout: process.env.CI ? 60 * 60 * 1000 : undefined,
	// Run all tests in parallel.
	fullyParallel: true,
	retries: 3,
	use: {
		// trace: 'on-first-retry', // record traces on first retry of each test
		 
		// Run browser in headless mode.
		headless: false,
	  },
	expect: {
		timeout: 60 * 1000,
	},  
};

export default config;
