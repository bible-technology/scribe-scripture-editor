// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';

const fs = require('fs');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;

test('Check for Scribe Scripture app render', async () => {
  electronApp = await electron.launch({ args: ['main/index.js'] });
  appPath = await electronApp.evaluate(async ({ app }) => app.getAppPath());
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');
	//   await electronApp.close();
});

test('Check whether the app is being logged IN', async ({userName}) => {
  const textVisible = await window.locator('//h1["@aria-label=projects"]').isVisible()
  if (textVisible) {
    const title = await window.textContent('[aria-label=projects]');
    await expect(title).toBe('Projects')
    await window.getByRole('button', {name: "Open user menu"}).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    await window.getByRole('menuitem', {name: "Sign out"}).click()
    expect(await window.title()).toBe('Scribe Scripture');
  }else {
    const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
    expect(welcome).toBe('Welcome!');
  }
});

test('Create a new user and login', async ({userName}) => {
  await window.getByRole('button', {name: 'Create New Account'}).click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.getByPlaceholder('Username').fill(userName)
  await window.click('[type=submit]');
  await window.waitForTimeout(2000)
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})

test("Delete playwright test user", async ({userName}) => {
  const newpath = await window.evaluate(() =>  Object.assign({}, window.localStorage))
  const path = require('path');
  const folder = path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  const title = await window.textContent('[aria-label=projects]');
  await expect(title).toBe('Projects')
  await window.getByRole('button', {name: "Open user menu"}).click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  await window.getByRole('menuitem', {name: "Sign out"}).click()
  expect(await window.title()).toBe('Scribe Scripture');
  if (currentUser && await fs.existsSync(folder)) {
    fs.rmSync(folder, {recursive: true, force: true})
  }
  console.error('users.json', `${currentUser} data removed from json`);
  const filtered = json.filter((item) => 
    item.username.toLowerCase() !== currentUser.toLowerCase()
  )
  return await fs.writeFileSync(file, JSON.stringify(filtered))
})
  