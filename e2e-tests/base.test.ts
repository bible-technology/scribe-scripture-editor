// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import { DisplayLogin, checkLogInOrNot, commonFile, commonFolder, commonJson, removeFolderAndFile } from './common';

const fs = require('fs');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;


test("Start the scribe application", async () => {
  electronApp = await electron.launch({ args: ['main/index.js'] });
  appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script
    return app.getAppPath();
  });
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');

})

test('Check whether the app is being logged IN', async ({ userName }) => {
  await checkLogInOrNot(window, expect, userName)
});

test('If logged IN then logout and delete that user from the backend', async ({ userName }) => {
  ///return json
  const json = await commonJson(window, userName, packageInfo, fs)
  /// return file
  const file = await commonFile(window, packageInfo)
  /// return folde name
  const folder = await commonFolder(window, userName, packageInfo)

  if (await checkLogInOrNot(window, expect, userName)) {
    await window.getByRole('button', { name: "Open user menu" }).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    await window.getByRole('menuitem', { name: "Sign out" }).click()
    /// projects page then logout and delete playwright user
    if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
      await DisplayLogin(fs, folder, userName, json, file, window, expect)
    }
  } else {
    ///loging page, if playwright user exist then reload app and remove 
    const existUser = json.some((item) => item.username.toLowerCase() === userName.toLowerCase())
    if (existUser && await fs.existsSync(folder)) {
      await DisplayLogin(fs, folder, userName, json, file, window, expect)
    }
  }

});


test('Create a new user and login', async ({ userName }) => {
  await window.getByRole('button', { name: 'Create New Account' }).click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.getByPlaceholder('Username').fill(userName)
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})


test("Logout and delete that playwright user from the backend", async ({ userName }) => {
  ///return json
  const json = await commonJson(window, userName, packageInfo, fs)
  /// return file
  const file = await commonFile(window, packageInfo)
  /// return folde name
  const folder = await commonFolder(window, userName, packageInfo)
  if (await checkLogInOrNot(window, expect, userName)) {
    await window.getByRole('button', { name: "Open user menu" }).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    await window.getByRole('menuitem', { name: "Sign out" }).click()
    /// projects page then logout and delete playwright user
    if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
      await DisplayLogin(fs, folder, userName, json, file, window, expect)
    }
  }
})