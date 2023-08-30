// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';

const fs = require('fs');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;

test.beforeEach(async () => {
  electronApp = await electron.launch({ args: ['main/index.js'] });
  appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script
    return app.getAppPath();
  });
  console.log(appPath);
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');
  await window.waitForSelector('//*[@id="__next"]/div[1]', '//*[@id="__next"]/div')

});

test('Check whether the app is being logged IN', async ({userName}) => {
  const newpath = await window.evaluate(() =>  Object.assign({}, window.localStorage))
  const path = require('path');
  const folder = path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  const textVisble = await window.locator('//h1["@aria-label=projects"]').isVisible()

  if (textVisble) {
    const title = await window.textContent('[aria-label=projects]')
    console.log('user is Logged In')
    await expect(title).toBe('Projects')
    await window.getByRole('button', {name: "Open user menu"}).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    if(currentUser !== userName.toLowerCase()){
      await window.getByRole('menuitem', {name: "Sign out"}).click()
      console.log('user is not playwright user')
    }else{
      await window.getByRole('menuitem', {name: "Sign out"}).click()
      if (currentUser === userName.toLowerCase() && await fs.existsSync(folder)) {
        fs.rmSync(folder, {recursive: true, force: true})
  
      }
      console.error('users.json', `${userName} data removed from json`);
      const filtered = json.filter((item) => 
        item.username.toLowerCase() !== userName.toLowerCase()
      )
      console.log('user is playwright user')
      expect(await window.title()).toBe('Scribe Scripture');
      await fs.writeFileSync(file, JSON.stringify(filtered))  
    }
    
  }else {
    const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
    console.log('user is not Logged In')
    await expect(welcome).toBe("Welcome!")
  }
});

