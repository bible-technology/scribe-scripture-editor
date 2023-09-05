// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import { checkLogInOrNot, filterUser } from './common';

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
  console.log(appPath);
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');
  await window.waitForSelector('//*[@id="__next"]/div', '//*[@id="__next"]/div[1]')

})

test('Check whether the app is being logged IN', async ({ userName }) => {
  await checkLogInOrNot(window, expect, userName)
});

test('If logged IN then logout and delete that user from the backend', async ({ userName }) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const path = require('path');
  const folder = path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  const textVisble = await window.locator('//h1["@aria-label=projects"]').isVisible()

  if (textVisble) {
    await window.getByRole('button', { name: "Open user menu" }).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    if (currentUser !== userName.toLowerCase()) {
      await window.getByRole('menuitem', { name: "Sign out" }).click()
      console.log(`current user is not a ${userName}`)
    } else {
      /// projects page then logout and delete playwright user
      await window.getByRole('menuitem', { name: "Sign out" }).click()
      if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true, force: true })
        console.log(`${userName} data removed from users.json`);
        const userfilterd = await filterUser(json, userName)
        console.log(`user is ${userName}`)
        await fs.writeFileSync(file, JSON.stringify(userfilterd))
        await window.reload()
      }
      expect(await window.title()).toBe('Scribe Scripture');
    }

  } else {
    ///loging page, if playwright user exist then reload app and remove 
    const existUser = json.some((item) => item.username.toLowerCase() === userName.toLowerCase())
    if (existUser && await fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true })

      console.log(`${userName} data removed from users.json`);
      const userfilterd = await filterUser(json, userName)
      await fs.writeFileSync(file, JSON.stringify(userfilterd))
      await window.reload()

    } else {
      const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
      await expect(welcome).toBe("Welcome!")
      await window.reload()
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
  const newpath = await window?.evaluate(() => Object.assign({}, window.localStorage))
  const path = require('path');
  const folder = path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  const title = await window.textContent('[aria-label=projects]');
  await expect(title).toBe('Projects')
  await window.getByRole('button', { name: "Open user menu" }).click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  await window.getByRole('menuitem', { name: "Sign out" }).click()
  expect(await window.title()).toBe('Scribe Scripture');
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true })
    console.log('users.json', `${currentUser} data removed from json`);
    const userfilterd = await filterUser(json, currentUser)
    await fs.writeFileSync(file, JSON.stringify(userfilterd))
    await window.reload()
  }
  const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
  await expect(welcome).toBe("Welcome!")
  await window.close()
})