// @ts-check


import { test, expect} from './myFixtures';
import packageInfo from '../package.json';

// import { _electron as electron } from 'playwright';
import { removeUser } from '../renderer/src/core/Login/removeUser';

const fs = require('fs');
const { _electron: electron } = require('playwright');

let electronApp;
let appPath;
let window;
let user

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
        window = await electronApp.firstWindow();
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
  const newpath = await window.evaluate(() =>  Object.assign({}, window.localStorage))
  console.log(newpath)
  const path = require('path');
  const folder = path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  user = json.filter((item) => item.username.toLowerCase() !== userName.toLowerCase())
  const title = await window.textContent('[aria-label=projects]');
    if(title === "Projects"){
      await expect(title).toBe('Projects')
      await window.getByRole('button', {name: "Open user menu"}).click()
      await window.getByRole('menuitem', {name: "Sign out"}).click()
      expect(await window.title()).toBe('Scribe Scripture');
      if (await fs.existsSync(folder)) {
        fs.rmdirSync(folder, {recursive: true})
      }
      console.error('users.json', 'removing data from json');
      const filtered = json.filter((item) => item.username.toLowerCase() !== userName.toLowerCase())
      return await fs.writeFileSync(file, JSON.stringify(filtered))
    }
  });

})
