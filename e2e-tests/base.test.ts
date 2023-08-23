// @ts-check


import { test, expect} from './myFixtures';
import packageInfo from '../package.json';
import ProjectList from '@/modules/projects/ProjectList';

// import { _electron as electron } from 'playwright';
import { removeUser } from '../renderer/src/core/Login/removeUser';

const fs = require('fs');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;
let user

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
        window = await electronApp.firstWindow();
        //application title
        expect(await window.title()).toBe('Scribe Scripture');
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
  
    if (testInfo.status !== testInfo.expectedStatus)
      console.log(`Did not run as expected, ended up at ${page.url()}`);
});

test.afterAll(async() => {
    await electronApp.close();
}); 

test('Start with the new user created', async ({userName}) => {
  const textVisible = await window.locator('//h1["@aria-label=projects"]').isVisible()
  test.setTimeout(2000)
  if (textVisible) {
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
    if (await fs.existsSync(folder)) {
      fs.rmdirSync(folder, {recursive: true})
    }
    console.error('users.json', `${userName} data removed from json`);
    const filtered = json.filter((item) => 
      item.username.toLowerCase() !== currentUser.toLowerCase()
    )
    console.log(filtered)
    return await fs.writeFileSync(file, JSON.stringify(filtered))
  }else{
    await window.getByRole('button', {name: 'Create New Account'}).click()
    await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
    await expect(window.locator('//button[@type="submit"]')).toBeVisible()
    await window.getByPlaceholder('Username').fill(userName)
    await window.click('[type=submit]');
    await window.waitForTimeout(2000)
    const title = await window.textContent('[aria-label=projects]');
    expect(title).toBe('Projects');
  }
    
  });

  test('Delete playwright user', async ({userName}) => {

  })

})
