import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: './e2e-tests',
	maxFailures: 2,
	timeout: 60 * 1000,
	globalTimeout: 60 * 60 * 1000,
	retries: 3,
	use: {
		// trace: 'on-first-retry', // record traces on first retry of each test
		headless: true,
	  },
	expect: {
		timeout: 30 * 1000,
	},  
};

export default config;
