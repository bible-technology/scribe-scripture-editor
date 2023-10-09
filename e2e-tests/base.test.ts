// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import { showLoginPage, checkLogInOrNot, userFile, userFolder, userJson, createProjectValidation, createProjects, unstarProject, starProject, userValidation, signOut, showActiveUsers, searchProject, checkProjectName, checkNotification, goToProjectPage } from './common';

const fs = require('fs');
const path = require('path');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;


test("Check to start the Scribe Application", async () => {
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
    expect(await window.locator('//*[@id="user-profile"]')).toBeVisible()
    await window.locator('//*[@id="user-profile"]').click()
    const currentUser = await window.textContent('[aria-label="userName"]')
    expect(await window.locator('//*[@aria-label="signout"]')).toBeVisible()
    await window.locator('//*[@aria-label="signout"]').click()
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

// create new user
test('Check for new user creation and login', async ({ userName }) => {
  await userValidation(window, expect)
  await window.locator('//input[@placeholder="Username"]').fill(userName)
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const title = await window.locator('//h1[@aria-label="projects"]', { timeout: 10000 }).textContent();
  expect(title).toBe('Projects');
})


/*CREATE PROJECTS FOR ALL FLAVOR TYPE */
/* Translation Project    */
test('Check for new project of text translation with custom book creation', async ({ textProject }) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
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
  await window.locator('//*[@aria-label="nt-Matthew"]').click()
  await window.locator('//*[@id="save-canon"]').click()
  await window.locator('//button[@aria-label="create"]').click()
  const notifyMe = await window.textContent('//*[@id="__next"]/div/div[2]/div[2]/div/div')
  await expect(notifyMe).toBe('New project created')
  const projectName = await window.innerText(`//div[@id="${textProject}"]`)
  await expect(projectName).toBe(textProject);
})

/* Obs translation project */
test('Check for obs project creation', async ({ obsProject }) => {
  await createProjects(window, expect, obsProject, "OBS", "test description", "otp")
})

/* Audio project */
test('Check for new audio project creation', async ({ audioProject }) => {
  await createProjects(window, expect, audioProject, "Audio", "test description", "atp")
})

/* STAR & UNSTAR PROJECT */
// text translation
test("Check for star the text translation project", async ({ textProject }) => {
  await starProject(window, expect, textProject)
})

test("Check for unstar the text translation project", async ({ textProject }) => {
  await unstarProject(window, expect, textProject)
})

// obs
test("Check for star the obs project", async ({ obsProject }) => {
  await starProject(window, expect, obsProject)
})

test("Check for unstar the obs project", async ({ obsProject }) => {
  await unstarProject(window, expect, obsProject)
})

// audio
test("Check for star the audio project", async ({ audioProject }) => {
  await starProject(window, expect, audioProject)
})

test("Check for unstar the audio project", async ({ audioProject }) => {
  await unstarProject(window, expect, audioProject)
})

/* text transaltion project */
test('Check for Search text translation project in all projects list', async ({ textProject }) => {
  await searchProject(window, expect, textProject, 'translation')
});

test('Check for text Translation project name in the editor page', async ({ textProject }) => {
  await checkProjectName(window, expect, textProject)
});

test('Check for text Translation project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Check for return to the project page', async () => {
  await goToProjectPage(window, expect)
});

/* obs project */
test('Check for Search obs project in all projects list', async ({ obsProject }) => {
  await searchProject(window, expect, obsProject, 'obs')
});

test('Check for obs project name in the editor page', async ({ obsProject }) => {
  await checkProjectName(window, expect, obsProject)
});

test('Check for obs project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Check for add content in verses 1 and 2 in the obs story 1 editor.', async () => {
  await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
  const verse2 = await window.textContent('div:nth-child(2) > .flex-grow')
  expect(verse2).toBe('god created heavens and earth');
  const verse3 = await window.textContent('div:nth-child(3) > .flex-grow')
  expect(verse3).toBe('story content added in verse 3');
});

test('Check for increase the font size in obs editor', async () => {
  await window.locator('//*[@aria-label="increase-font"]').click();
  await window.locator('//*[@aria-label="increase-font"]').click();
  const div = await window.locator('//*[@aria-label="editor"]')
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size')

  })
  expect(await fontSize).toBe('22.4px');
});

test('Check for decrease the font size in obs editor', async () => {
  await window.locator('//*[@aria-label="decrease-font"]').click();
  await window.locator('//*[@aria-label="decrease-font"]').click();
  const div = await window.locator('//*[@aria-label="editor"]')
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size')
  })
  expect(await fontSize).toBe('16px');
});

test('Check for change the obs navigation story from 1 to 12 and edit the title', async () => {
  await expect(window.locator('//*[@aria-label="obs-navigation"]')).toBeVisible()
  await window.locator('//*[@aria-label="obs-navigation"]').click()
  await window.locator('//*[@aria-label="12"]').click();
  await expect(window.locator('//*[@name="12. The Exodus"]')).toBeVisible()
  await window.locator('//*[@name="12. The Exodus"]').fill('12. The Exodus Edit title')
  const title = await window.textContent('//*[@name="12. The Exodus Edit title"]')
  expect(title).toBe('12. The Exodus Edit title');
});

test('Check for return to the projects page from obs editor', async () => {
  await goToProjectPage(window, expect)
});


/* audio project */
test('Check for Search audio project in all projects list', async ({ audioProject }) => {
  await searchProject(window, expect, audioProject, 'audio')
});

test('Check for audio project name in the editor page', async ({ audioProject }) => {
  await checkProjectName(window, expect, audioProject)
});

test('Check for audio project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Check for return to the projects from audio editor page', async () => {
  await goToProjectPage(window, expect)
});

/* about the scribe */
test("Check for about scribe Application and License", async () => {
  await window.locator('//*[@aria-label="about-button"]').click()
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.locator('//*[@aria-label="about-description"]').click()
  await window.click('[aria-label=close-about]');
  const title = await window.locator('//h1[@aria-label="projects"]', { timeout: 10000 }).textContent();
  expect(title).toBe('Projects');
})

/*signing out */
test("Check for sign out the Application", async () => {
  await signOut(window, expect)
})

/* view users */
test("Check for view userss, log in with playwright user, and sign out", async ({ userName }) => {
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]')
  const div = await tabContent.locator("div > div")
  for (let i = 0; i < await div.count(); i++) {
    if (await div.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await window.waitForTimeout(1000)
      const title = await window.locator('//h1[@aria-label="projects"]', { timeout: 10000 }).textContent();
      expect(title).toBe('Projects')
      await signOut(window, expect)
      break
    }
  }
})

/* user delete, check in archive and restore */
test("Check for delete user from the active tab and confirm in the archived tab", async ({ userName }) => {
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]', { timeout: 5000 })
  const items = await tabContent.locator('div > div')
  const div = await tabContent.locator("div > button")
  const archiveTabContent = await window.locator('//*[@id="archive-tab-content"]')
  const archiveItems = await archiveTabContent.locator('div > div')
  const archiveDiv = await archiveTabContent.locator('div > button')
  for (let i = 0; i < await items.count(); i++) {
    if (await items.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await expect(window.locator('//*[@id="archived-tab"]')).toBeVisible()
      await window.locator('//*[@id="archived-tab"]').click()
      const text = await window.locator('//*[@id="archived-tab"]').textContent()
      await expect(text).toBe('Archived')
      if (await archiveItems.nth(i).textContent() === userName.toLowerCase()) {
        await archiveDiv.nth(i).click()
      }
      await window.locator('//*[@id="active-tab"]').click()
      await window.locator(`//*[@dataId="${userName.toLowerCase()}"]`).click()
      break
    }
  }
  const title = await window.locator('//h1[@aria-label="projects"]', { timeout: 10000 }).textContent();
  expect(title).toBe('Projects')
})

/* logout and delete the playwright user */
test("Check for logout and delete that playwright user from the backend", async ({ userName }) => {
  // user json
  const json = await userJson(window, packageInfo, fs, path)
  // user file
  const file = await userFile(window, packageInfo, path)
  // user folde name
  const folder = await userFolder(window, userName, packageInfo, path)
  expect(await window.locator('//*[@id="user-profile"]')).toBeVisible()
  await window.locator('//*[@id="user-profile"]').click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  expect(await window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  // projects page then logout and delete playwright user
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    await showLoginPage(fs, folder, userName, json, file, window, expect)
  }
})
