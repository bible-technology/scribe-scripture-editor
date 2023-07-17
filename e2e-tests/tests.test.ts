// @ts-check

import { removeUser } from '../renderer/src/core/Login/removeUser';
import { test, expect } from './myFixtures';
import * as logger from '../renderer/src/logger';
import packageInfo from '../package.json';


const fs = require('fs');
const { _electron: electron,chromium } = require('playwright');


let electronApp;
let window;

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
      const appPath = await electronApp.evaluate(async ({ app }) => {
        // This runs in the main Electron process, parameter here is always
        // the result of the require('electron') in the main app script.
        return app.getAppPath();
      });
      console.log(appPath);
      window = await electronApp.firstWindow();
      expect(await window.title()).toBe('Scribe Scripture');
  });

     // Extend timeout for all tests running this hook by 30 seconds.
  // test.beforeEach(async ({ page }, testInfo) => {
  //   testInfo.setTimeout(testInfo.timeout + 30000);
  // });
  // test.afterEach(async ({ page }, testInfo) => {
  //     console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
    
  //     if (testInfo.status !== testInfo.expectedStatus)
  //       console.log(`Did not run as expected, ended up at ${page.url()}`);
  // });

  test.afterAll(async() => {
      await electronApp.close();
  });  




  test("Deleting all the created repository from git.door43.org", async ({textProject, obsProject, doorUser, doorPassword, flavorText, flavorObs, textUnderscore, obsUnderscore}) => {
    await window.goto("https://git.door43.org/")
    await window.getByRole('link', { name: 'Sign In' }).click()
    await window.getByLabel('Username or Email Address').fill(doorUser);
    await window.getByLabel('Password').fill(doorPassword);
    await window.getByRole('button', { name: 'Sign In' }).click();
    await window.getByRole('link', { name: `${doorUser}/en-${flavorText}-${textUnderscore} 0` }).click()
    await window.getByRole('link', { name: 'Settings' }).click()
    await window.getByRole('button', { name: 'Delete This Repository' }).click()
    await window.locator('#delete-repo-modal #repo_name').fill(`en-${flavorText}-${textUnderscore}`)
    await window.getByRole('button', { name: 'Delete Repository' }).click()
    await window.getByRole('link', { name: 'Dashboard' }).click()
    await window.getByRole('link', { name: `${doorUser}/en-${flavorObs}-${obsUnderscore} 0` }).click()
    await window.getByRole('link', { name: 'Settings' }).click()
    await window.getByRole('button', { name: 'Delete This Repository' }).click()
    await window.locator('#delete-repo-modal #repo_name').fill(`en-${flavorObs}-${obsUnderscore}`)
    await window.getByRole('button', { name: 'Delete Repository' }).click()
  })
});
