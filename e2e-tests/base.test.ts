// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import { showLoginPage, checkLogInOrNot, userFile, userFolder, userJson, createUserValidation, createProjectValidation } from './common';

const fs = require('fs');
const path = require('path');
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

test('Check whether the app is being logged IN', async () => {
  await checkLogInOrNot(window, expect)
});

test('If logged IN then logout and delete that user from the backend', async ({ userName }) => {
  ///user json
  const json = await userJson(window, packageInfo, fs, path)
  /// user file
  const file = await userFile(window, packageInfo, path)
  /// user folde name
  const folder = await userFolder(window, userName, packageInfo, path)

  if (await checkLogInOrNot(window, expect)) {
    await window.getByRole('button', { name: "Open user menu" }).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    await window.getByRole('menuitem', { name: "Sign out" }).click()
    /// projects page then logout and delete playwright user
    if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect)
    }
  } else {
    ///loging page, if playwright user exist then reload app and remove 
    const existUser = json.some((item) => item.username.toLowerCase() === userName.toLowerCase())
    if (existUser && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect)
    }
  }

});


test('Create a new user and login', async ({ userName }) => {
  await createUserValidation(window, expect)
  await window.getByPlaceholder('Username').fill(userName)
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})

/*CREATE PROJECTS FOR ALL FLAVOR TYPE */
// // /* Translation Project    */
test('Click New and Fill project page details to create a new project for text translation with custom book', async ({ textProject }) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.getByRole('link', { name: 'new' }).click()
  await createProjectValidation(window, expect)
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(textProject)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill('test description')
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill('ttp')
  await expect(window.locator('//button[@id="open-advancesettings"]')).toBeVisible()
  await window.locator('//button[@id="open-advancesettings"]').click()
  await expect(window.locator('//div[@aria-label="custom-book"]')).toBeVisible()
  await window.locator('//div[@aria-label="custom-book"]').click()
  await window.getByLabel('nt-Matthew').click()
  await window.getByRole('button', { name: 'Save' }).click()
  await window.locator('//button[@aria-label="create"]').click()
  const notifyMe = await window.textContent('//*[@id="__next"]/div/div[2]/div[2]/div/div')
  expect(await notifyMe).toBe('New project created')
  const projectName = await window.innerText(`//div[@id="${textProject}"]`)
  expect(projectName).toBe(textProject);
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})

test("Logout and delete that playwright user from the backend", async ({ userName }) => {
  ///user json
  const json = await userJson(window, packageInfo, fs, path)
  /// user file
  const file = await userFile(window, packageInfo, path)
  /// user folde name
  const folder = await userFolder(window, userName, packageInfo, path)
  await window.getByRole('button', { name: "Open user menu" }).click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  await window.getByRole('menuitem', { name: "Sign out" }).click()
  /// projects page then logout and delete playwright user
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    await showLoginPage(fs, folder, userName, json, file, window, expect)
  }
})
