// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import { showLoginPage, checkLogInOrNot, userFile, userFolder, userJson, createUserValidation, createProjectValidation, createProjects, unstarProject, starProject, searchProject, checkProjectName, checkNotification, goToProjectPage, exportProject, archivedProjects, unarchivedProjects } from './common';

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
  //user json
  const json = await userJson(window, packageInfo, fs, path)
  // user file
  const file = await userFile(window, packageInfo, path)
  // user folde name
  const folder = await userFolder(window, userName, packageInfo, path)

  if (await checkLogInOrNot(window, expect)) {
    await window.getByRole('button', { name: "Open user menu" }).click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    await window.getByRole('menuitem', { name: "Sign out" }).click()
    // projects page then logout and delete playwright user
    if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect)
    }
  } else {
    // loging page, if playwright user exist then reload app and remove 
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
/* Translation Project    */
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

/* Obs translation project */
test('Click New and Fill project page details to create a new project for obs', async ({ obsProject }) => {
  await createProjects(window, expect, obsProject, "OBS", "test description", "otp")
})

/* Audio project */
test('Click Click New and Fill project page details to create a new project for audio', async ({ audioProject }) => {
  await createProjects(window, expect, audioProject, "Audio", "test description", "atp")
})

/* STAR & UNSTAR PROJECT */
// text translation
test("Star the text project", async ({ textProject }) => {
  await starProject(window, expect, textProject)
})

test("Unstar the text project", async ({ textProject }) => {
  await unstarProject(window, expect, textProject)
})

// obs
test("Star the obs project", async ({ obsProject }) => {
  await starProject(window, expect, obsProject)
})

test("Unstar the obs project", async ({ obsProject }) => {
  await unstarProject(window, expect, obsProject)
})

// audio
test("Star the audio project", async ({ audioProject }) => {
  await starProject(window, expect, audioProject)
})

test("Unstar the audio project", async ({ audioProject }) => {
  await unstarProject(window, expect, audioProject)
})

// text transaltion project
test('Search a text project in all projects list', async ({ textProject }) => {
  await searchProject(window, expect, textProject, 'translation')
});

test('Click and Check the text Translation project name to the editor', async ({ textProject }) => {
  await checkProjectName(window, expect, textProject)
});

test('Check text Translation project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Return to the projects page', async () => {
  await goToProjectPage(window, expect)
});


// obs project
test('Search an obs project in all projects list', async ({ obsProject }) => {
  await searchProject(window, expect, obsProject, 'obs')
});

test('Click and Check the obs project name to the editor', async ({ obsProject }) => {
  await checkProjectName(window, expect, obsProject)
});

test('Check obs project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Add content in verses 1 and 2 in the obs story 1 editor.', async () => {
  const editorpane = await window.innerText('[aria-label=editor-pane]', { timeout: 120000 });
  expect(editorpane).toBe('EDITOR');
  await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
  const verse2 = await window.textContent('div:nth-child(2) > .flex-grow')
  expect(verse2).toBe('god created heavens and earth');
  const verse3 = await window.textContent('div:nth-child(3) > .flex-grow')
  expect(verse3).toBe('story content added in verse 3');
});

test('Increase the font size of the obs editor', async ({ obsProject }) => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
  const editorpane = await window.innerText('[aria-label=editor-pane]', { timeout: 120000 });
  expect(editorpane).toBe('EDITOR');
  const div = await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]')
  const fontSize = await div.evaluate((ele) => {
    console.log(ele, 'ele')
    return window.getComputedStyle(ele).getPropertyValue('font-size')

  })
  expect(fontSize).toBe('22.4px');
});

test('Decrease the font size of the obs editor', async ({ obsProject }) => {
  const editorpane = await window.innerText('[aria-label=editor-pane]', { timeout: 120000 });
  expect(editorpane).toBe('EDITOR');
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
  const div = await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]')
  const fontSize = await div.evaluate((ele) => {
    console.log(ele, 'ele')
    return window.getComputedStyle(ele).getPropertyValue('font-size')

  })
  expect(fontSize).toBe('16px');
});

test('Change the obs navigation story  from 1 to 12 and edit the title', async () => {
  const editorpane = await window.innerText('[aria-label=editor-pane]', { timeout: 120000 });
  expect(editorpane).toBe('EDITOR');
  await expect(window.locator('//*[@id="__next"]/main/div/div[3]/div[1]/div[1]/div/span[2]')).toBeVisible()
  await window.locator('//*[@id="__next"]/main/div/div[3]/div[1]/div[1]/div/span[2]').click()
  await window.getByRole('button', { name: "12" }).click();
  await expect(window.locator('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea')).toBeVisible()
  await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea').fill('12. The Exodus Edit title')
  const title = await window.textContent('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea')
  expect(title).toBe('12. The Exodus Edit title');
});

test('Return to the projects page from obs editor', async () => {
  await goToProjectPage(window, expect)
});


// audio project
test('Search an audio project in all projects list', async ({ audioProject }) => {
  await searchProject(window, expect, audioProject, 'audio')
});

test('Click and Check the audio project name to the editor', async ({ audioProject }) => {
  await checkProjectName(window, expect, audioProject)
});

test('Check audio project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Return to the projects page from audio editor', async () => {
  await goToProjectPage(window, expect)
});

test("About scribe Application and License", async () => {
  await window.getByLabel('about-button').click()
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.getByRole('button', { name: 'About', exact: true }).click()
  await window.click('[aria-label=close-about]');
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
})

test("Export text translation project in Downloads folder", async ({ textProject }) => {
  await exportProject(window, expect, textProject)
})

test("Export obs project in Downloads folder", async ({ obsProject }) => {
  await exportProject(window, expect, obsProject)
})

test("Export audio audio in Downloads folder", async ({ audioProject }) => {
  await exportProject(window, expect, audioProject)
})

test("Archive text translation project", async ({ textProject }) => {
  await archivedProjects(window, expect, textProject)
})

test("restore text transaltion project from achived page", async ({ textProject }) => {
  await unarchivedProjects(window, expect, textProject)
})

test("Logout and delete that playwright user from the backend", async ({ userName }) => {
  // user json
  const json = await userJson(window, packageInfo, fs, path)
  // user file
  const file = await userFile(window, packageInfo, path)
  // user folde name
  const folder = await userFolder(window, userName, packageInfo, path)
  await window.getByRole('button', { name: "Open user menu" }).click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  await window.getByRole('menuitem', { name: "Sign out" }).click()
  // projects page then logout and delete playwright user
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    await showLoginPage(fs, folder, userName, json, file, window, expect)
  }
})
