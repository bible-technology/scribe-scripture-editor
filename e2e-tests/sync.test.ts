// @ts-check
import { _electron as electron } from '@playwright/test';
import { test, expect } from '@playwright/test';

let electronApp;
let appPath;
let window;

test.describe('Sync', async() => {
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

    test('Create a new user and Navigate the projects page', async () => {
        await window.getByRole('button', {name: 'Create New Account'}).click()
        await window.getByPlaceholder('Username').fill('playwright user')
        await window.click('[type=submit]');
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      });

    test('Click New and Fill OBS project page details to create a new project.', async () => {
      await window.getByRole('link', {name: 'new'}).click()
      await window.click('[aria-label=open-popover]')
      await window.getByRole('link', {name: 'OBS'}).click()
      await window.fill('#project_name', 'Playwright sync');
      await window.fill('#project_description', 'test version');
      await window.fill('#version_abbreviated', 'op');
      await window.click('[aria-label=create]');
    })

    test('Click on the project to open the OBS editor page', async () => {
      await window.click('id=Playwright sync');
      const editorpane = await window.innerText('[aria-label=editor-pane]');
      expect(editorpane).toBe('EDITOR');
    });
    
    test('Check the OBS project name', async () => {
      const projectname = await window.innerText(
      '[aria-label=editor-project-name]',
      );
      expect(projectname).toBe('SYNC OBS');
    });
    
    test('Add content in verses 1 and 2 OBS editor.', async () => {
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

    test('Click Sync button and login the page ', async () => {
      await window.getByRole('link', {name: 'sync'}).click()
      await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
      await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
      await window.getByLabel('Keep me logged in').check()
      await window.locator('[data-test="submit-button"]').click()
    })

    test('Upload project in the cloud sync and go back to projects', async () => {
      await window.getByRole('button', { name: 'Playwright sync' }).click()
      await window.getByRole('button', { name: 'Cloud Sync' }).click()
      await window.getByRole('link', {name: 'projectList'}).click()
    })

    test('Project download by clicking offline sync button and check in editor', async () => {
      test.slow()
      await window.getByRole('link', {name: 'sync'}).click()
      await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
      await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
      await window.getByLabel('Keep me logged in').check()
      await window.locator('[data-test="submit-button"]').click()
      await window.getByRole('button', { name: 'fa-textStories-obs_flavor bobby/fa-textStories-obs_flavor' }).click()
      await window.getByText('fa-textStories-obs_flavor (obs flavor)').click()
      await window.getByRole('button', { name: 'Offline Sync' }, { timeout: 30000 }).click()
      
    })

    // test("open the download project in editor after downloading from sync page", async () =>{
    //   await window.getByRole('link', {name: 'projectList'}).click()
    //   await window.click('id=obs flavor');
    //   const projectname = await window.innerText(
    //     '[aria-label=editor-project-name]',
    //   );
    //   expect(projectname).toBe('OBS FLAVOR');
    //   await window.getByRole('button', {name: "Back"}).click();
    //   const title = await window.textContent('[aria-label=projects]');
    //   expect(title).toBe('Projects');
    // })

    test('Login to door43 sync page ', async () => {
      await window.getByRole('link', {name: 'sync'}).click()
      await window.locator('[data-test="username-input"]').getByRole('textbox').fill('bobby')
      await window.locator('[data-test="password-input"]').getByRole('textbox').fill('Bobby@123')
      await window.getByLabel('Keep me logged in').check()
      await window.locator('[data-test="submit-button"]').click()

    })

    // test('search,download and display benz project from download offline sync', async () => {
    //   test.slow()
    //   await window.getByLabel('Owner').fill('benz')
    //   await window.getByRole('button', { name: 'en-textStories-Sync_Collab_Test Benz/en-textStories-Sync_Collab_Test' }).click()
    //   await window.getByRole('button', { name: 'Offline Sync' }).click()
    //   await window.getByRole('link', {name: 'projectList'}).click()
    //   await window.click('id=Sync_Collab_Test')
    //   const projectname = await window.innerText(
    //     '[aria-label=editor-project-name]',
    //   );
    //   expect(projectname).toBe('SYNC_COLLAB_TEST');
    // })

  });
