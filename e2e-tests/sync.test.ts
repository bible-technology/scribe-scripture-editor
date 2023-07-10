// @ts-check
import {chromium,  _electron as electron } from '@playwright/test';
import { test, expect } from './myFixtures';


let electronApp;
let appPath;
let window;

test.describe('Sync', async() => {

    test.beforeAll(async() => {
        electronApp = await electron.launch({ args: ['main/index.js']} );
        window = await electronApp.firstWindow();
        expect(await window.title()).toBe('Scribe Scripture');
    });

    test.afterAll(async() => {
      await electronApp.close();
  });

    test.beforeEach(async ({ page }, testInfo) => {
      // Extend timeout for all tests running this hook by 30 seconds.
      testInfo.setTimeout(testInfo.timeout + 30000);
    });

    test.afterEach(async ({ page }, testInfo) => {
        console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
      
        if (testInfo.status !== testInfo.expectedStatus)
          console.log(`Did not run as expected, ended up at ${page.url()}`);
    });

    test('Create a new user and Navigate the projects page', async ({userName}) => {
      await window.getByRole('button', {name: 'Create New Account'}).click()
      await window.getByPlaceholder('Username').fill(userName)
      await window.click('[type=submit]');
      await window.waitForTimeout(5000)
      const title = await window.textContent('[aria-label=projects]');
      expect(title).toBe('Projects');
    });

    test('Click Sync button and login the page ', async () => {
      await window.getByRole('link', {name: 'sync'}).click()
      await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
      await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
      await window.getByLabel('Keep me logged in').check()
      await window.locator('[data-test="submit-button"]').click()
      await window.waitForTimeout(5000) 
      const title = await window.textContent('div.flex.justify-between.items-center > span.font-semibold')
      expect(title).toBe("Sync")
    })

    test('Taking pull from git.door43.org and offline sync project from user benz', async () => {
      await window.getByLabel('Owner').fill('benz')
      await window.waitForTimeout(5000)
      await window.getByRole('button', { name: 'en-textStories-Sync_Collab_Test Benz/en-textStories-Sync_Collab_Test' }).click()
      await window.getByRole('button', { name: 'Offline Sync' }).click()
      await window.waitForTimeout(5000)
      await window.getByRole('link', {name: 'projectList'}).click()
      const title = await window.textContent('[aria-label=projects]');
      expect(title).toBe('Projects');
      
    })

    test('Click on the project to open the OBS editor page', async () => {
      await window.click('id=Sync_Collab_Test')
      const editorpane = await window.innerText('[aria-label=editor-pane]');
      expect(editorpane).toBe('EDITOR');
    });

    test('Open the download project onclick for updating', async () => {
      const projectname = await window.innerText(
        '[aria-label=editor-project-name]',
      );
      expect(projectname).toBe('SYNC_COLLAB_TEST');
    })

    test('Add content chapter 3 in verses 1 and 2 OBS editor.', async () => {
      await window.getByRole('button', { name: 'obs-navigation' }).click()
      await window.getByRole('button', { name: '3', exact: true }).click()
      await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
      await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
      const editorpane = await window.innerText('[aria-label=editor-pane]');
      expect(editorpane).toBe('EDITOR');
    });

    test('Return to the projects', async () => {
      await window.getByRole('button', {name: "Back"}).click();
      const title = await window.textContent('[aria-label=projects]');
      expect(title).toBe('Projects');
    });

    test('Push the project changes on git.door43.org', async () => {
        await window.getByRole('link', {name: 'sync'}).click()
        await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
        await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
        await window.getByLabel('Keep me logged in').check()
        await window.locator('[data-test="submit-button"]').click()
        await window.locator('id=Sync_Collab_Test').click()
        await window.getByRole('button', { name: 'Cloud Sync' }).click()
        await window.waitForTimeout(10000)
        const title = await window.textContent('span#Sync_Collab_Test')
        expect(title).toBe("Sync_Collab_Test");
    })

    test('Click New and Fill OBS project page details to create a new project.', async () => {
      await window.getByRole('link', {name: 'new'}).click()
      await window.click('[aria-label=open-popover]')
      await window.getByRole('link', {name: 'OBS'}).click()
      await window.fill('#project_name', 'Playwright sync');
      await window.fill('#project_description', 'test version');
      await window.fill('#version_abbreviated', 'op');
      await window.click('[aria-label=create]');
    })

    test('Click on the new project to open the OBS editor page', async () => {
      await window.click('id=Playwright sync')
      const editorpane = await window.innerText('[aria-label=editor-pane]');
      expect(editorpane).toBe('EDITOR');
    });

    test('Add content chapter 1 in verses 1 and 2 OBS editor.', async () => {
      await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
      await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
      const editorpane = await window.innerText('[aria-label=editor-pane]');
      expect(editorpane).toBe('EDITOR');
    });

    test('go to the projects list', async () => {
      await window.getByRole('button', {name: "Back"}).click();
      const title = await window.textContent('[aria-label=projects]');
      expect(title).toBe('Projects');
    });
    
    test('push new project on git.door43.org', async () => {
      await window.getByRole('link', {name: 'sync'}).click()
      await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
      await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
      await window.getByLabel('Keep me logged in').check()
      await window.locator('[data-test="submit-button"]').click()
      await window.waitForTimeout(5000) 
      await window.getByRole('button', { name: 'Playwright sync' }).click()
      await window.getByRole('button', { name: 'Cloud Sync' }).click()
      await window.waitForTimeout(5000) 
      const title = await window.textContent('div.flex.justify-between.items-center > span.font-semibold')
      expect(title).toBe("Sync")
    })

    test("deleting repository from git.door43.org", async () => {
      const browser = await chromium.launch({})
      const context = await browser.newContext()
      const page = await context.newPage();
      await page.goto("https://git.door43.org/")
      await page.getByRole('link', { name: 'Sign In' }).click()
      await page.getByLabel('Username or Email Address').fill('bobby');
      await page.getByLabel('Password').fill('Bobby@123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.getByRole('link', { name: 'bobby/en-textStories-Playwright_sync 0' }).click()
      await page.getByRole('link', { name: 'Settings' }).click()
      await page.getByRole('button', { name: 'Delete This Repository' }).click()
      await page.locator('#delete-repo-modal #repo_name').fill('en-textStories-Playwright_sync')
      await page.getByRole('button', { name: 'Delete Repository' }).click()
    })
  });
