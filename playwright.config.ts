import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: './e2e-tests',
	maxFailures: 2,
	timeout: 60000,
	globalTimeout: 60 * 60 * 1000,
	retries: process.env.CI ? 3 : 0,
	use: {
		trace: 'on-first-retry', // record traces on first retry of each test
	  },
	expect: {
		timeout: 10 * 1000,
	},  
};

export default config;
