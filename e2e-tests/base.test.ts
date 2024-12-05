// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import {
  showLoginPage, userFolder, userJson, createProjectValidation,
  createProjects, signOut, showActiveUsers,
  searchProject, checkProjectName, checkNotification, goToProjectPage,
  exportProjects, archivedProjects, unarchivedProjects, goToEditProject,
  changeAppLanguage, projectTargetLanguage, userProfileValidaiton,
  exportAudioProject, updateDescriptionAbbriviation, changeLicense,
  customAddEditLanguage, customProjectTargetLanguage, starUnstar,
  clickUserImageToLogout, confirmBookInEditor, checkingUpdatedLicense,
  createUser, projectPageExpect
} from './common';

const fs = require('fs');
const path = require('path');
const { _electron: electron } = require('@playwright/test');

let electronApp;
let appPath;
let window;

// This test case handles the user's login or logout actions and related operations.
// 'If logged IN then logout and delete that user from the backend'
test.beforeAll(async ({ userName }) => {
  electronApp = await electron.launch({ args: ['main/index.js'] });
  appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script
    return app.getAppPath();
  });
  window = await electronApp.firstWindow();
  expect(await window.title()).toBe('Scribe Scripture');
  // check if project text is visible 
  const textVisble = await window.locator('//*[@id="appName"]').isVisible()
  if (textVisble) {
    // logut and delete the user
    await clickUserImageToLogout(window, expect, userName, path, fs, packageInfo)
  } else {
    //Retrieves and parses a JSON file containing user information
    const userData = await userJson(window, packageInfo, path)
    const data = await fs.readFileSync(userData);
    const json = JSON.parse(data);
    //  constructs the path to a folder/directory name
    const folder = await userFolder(window, userName, packageInfo, path)
    // If 'projects' is not visible, check the 'welcome' element
    const welcome = await window.locator('//*[@aria-label="welcome"]', { timeout: 5000 }).textContent()
    await expect(welcome).toBe(welcome)
    // On the login page, if the playwright user exists, reload the app and remove it
    const existUser = await json.some((item) => item.username.toLowerCase() === userName.toLowerCase());
    if (await existUser && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, userData, window, expect);
    }
  }

});

/* logout and delete the playwright user from the backend */
test.afterAll(async ({ userName }) => {
  await clickUserImageToLogout(window, expect, userName, path, fs, packageInfo)
})

/* LOGIN PAGE */
/* check the user length */
test('check user length should be between 3 and 15 characters long', async () => {
  await window.reload()
  await window.waitForSelector('//*[@aria-label="welcome"]')
  await createUser(window, expect, "jo")
  // Check for a length error message
  const lengthError = await window.locator('//*[@id="show-error"]')
  expect(await lengthError.textContent()).toBe('The input has to be between 3 and 15 characters long')
  await window.locator('//*[@aria-label="cancel"]').click()

})

/* This test case creates a new user and logs in. */
test('Create a new user and login', async ({ userName }) => {
  await createUser(window, expect, userName)
  // landing to the project page
  await projectPageExpect(window, expect)
})

/* view users */
test("Click the view users button, log in with playwright user, and sign out", async ({ userName }) => {
  await signOut(window, expect)
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]')
  const div = await tabContent.locator("div > div")
  for (let i = 0; i < await div.count(); i++) {
    if (await div.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await projectPageExpect(window, expect)
      break
    }
  }
})

/* user is already created */
test("check the user is already created", async ({ userName }) => {
  await signOut(window, expect)
  await createUser(window, expect, userName)
  // Check for a length error message
  const userExist = await window.locator('//*[@id="show-error"]').textContent()
  expect(await userExist).toBe('User exists, Check archived and active tab by click on view more.')
  await window.waitForTimeout(200)
  await window.locator('//*[@aria-label="cancel"]').click()
  await window.locator(`//*[@id="${userName.toLowerCase()}"]`).click()
  // landing to the project page
  await projectPageExpect(window, expect)
})

/* user delete, check in archive and restore */
test("Click the view users button and delete the playwright user from the active tab and check in the archived tab", async ({ userName }) => {
  await signOut(window, expect)
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
      await window.locator(`//*[@data-id="${userName.toLowerCase()}"]`).click()
      break
    }
  }
  await projectPageExpect(window, expect)
})

/*changing app language english to hindi */
test("App language change English to hindi", async ({ english, hindi }) => {
  // Change the app language from English to hindi
  await changeAppLanguage(window, expect, english, hindi);

  // Verify the language change and UI update
  await window.waitForSelector('//*[@aria-label="snack-text"]')
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(await snackbar).toBe("Updated the Profile.");

  await window.locator('//*[@aria-label="projectList"]').click();
  await projectPageExpect(window, expect)
})

test("Logout and check application language is changed", async ({ userName }) => {
  await signOut(window, expect)
  await window.locator(`//*[@id="${userName.toLowerCase()}"]`).click()
  // landing to the project page
  await projectPageExpect(window, expect)
})

/* NEW PAGE*/
/*CREATE PROJECTS FOR ALL FLAVOR TYPE */
/* Translation Project    */
test('Click New button button and fill a new project detail for text translation english project with custom book from advance settings without importing any books from system ', async ({ textProject, description, textAbbreviation }) => {
  // Here you create a new text translation project with custom settings.
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await createProjectValidation(window, expect)
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(textProject)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill(description)
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill(textAbbreviation)
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible()
  await window.locator('//*[@id="open-advancesettings"]').click()
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible()
  await window.locator('//*[@aria-label="custom-book"]').click()
  await window.locator('//*[@aria-label="nt-Matthew"]').click()
  await window.locator('//*[@id="save-canon"]').click()
  await window.locator('//button[@aria-label="create"]').click()
  const projectName = await window.locator(`//*[@id="${textProject}"]`).innerHTML()
  await expect(projectName).toBe(textProject);
})

/* Obs translation project */
test('Click New button and fill a new project detail for obs english project without importing any books from system', async ({ obsProject, projectObsType, description, obsAbbreviation }) => {
  //  Here you create a new OBS project.
  await createProjects(window, expect, obsProject, projectObsType, description, obsAbbreviation)
})

/* Audio project */
test('Click New button and fill a new project detail for audio enlish project without importing any books from system', async ({ audioProject, projectAudioType, description, AudioAbbreviation }) => {
  // Here you create a new audio project
  await createProjects(window, expect, audioProject, projectAudioType, description, AudioAbbreviation)
})

/* STAR & UNSTAR PROJECT */
// text translation
test("Star the text translation project", async ({ textProject, starProject, unstarProject }) => {
  // Here you star a text translation project.
  await starUnstar(window, expect, textProject, starProject, unstarProject)
})

test("Unstar the text translation project", async ({ textProject, unstarProject, starProject }) => {
  // Here you unstar a text translation project.
  await starUnstar(window, expect, textProject, unstarProject, starProject)

})

// obs
test("Star the obs project", async ({ obsProject, starProject, unstarProject }) => {
  // Here you star a OBS project.
  await starUnstar(window, expect, obsProject, starProject, unstarProject)

})

test("Unstar the obs project", async ({ obsProject, unstarProject, starProject }) => {
  // Here you unstar a OBS project.
  await starUnstar(window, expect, obsProject, unstarProject, starProject)
})

// audio
test("Star the audio project", async ({ audioProject, starProject, unstarProject }) => {
  // Here you star a Audio project.
  await starUnstar(window, expect, audioProject, starProject, unstarProject)

})

test("Unstar the audio project", async ({ audioProject, unstarProject, starProject }) => {
  // Here you unstar a Audio project.
  await starUnstar(window, expect, audioProject, unstarProject, starProject)

})

/* text transaltion project */
test('Search a text translation project in all projects list', async ({ textProject }) => {
  await searchProject(window, expect, textProject, 'text translation')
});

test('Click on a created text translation project and Check the text Translation project name in the editor', async ({ textProject }) => {
  await checkProjectName(window, expect, textProject)
});
/// notification test is working for now i have commented due know issue
// test('Check text Translation project success load notification', async ({ textProject }) => {
//   await checkNotification(window, expect, textProject)
// });

test('Return to the project page', async () => {
  await goToProjectPage(window, expect)
});

/* obs project */
test('Search an obs project in all projects list', async ({ obsProject }) => {
  await searchProject(window, expect, obsProject, 'obs')
});

test('Click on a created obs project and Check the obs project name in the editor', async ({ obsProject }) => {
  await checkProjectName(window, expect, obsProject)
});

/// notification test is working for now i have commented for later once the notification fixed manually
// test('Check obs project success load notification', async ({ obsProject }) => {
//   await checkNotification(window, expect, obsProject)
// });

test('Add content in verses 1 and 2 in the obs story 1 editor', async () => {
  // Fill text in verse 2 and verse 3 fields
  await window.locator('div:nth-child(2) > .flex-grow').fill("God created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("Story content added in verse 3");
  // Verify if the content was added to verse 2 and verse 3
  const verse2 = await window.textContent('div:nth-child(2) > .flex-grow');
  expect(verse2).toBe('God created heavens and earth');
  const verse3 = await window.textContent('div:nth-child(3) > .flex-grow');
  expect(verse3).toBe('Story content added in verse 3');
});

test('Increase the font size in the obs editor', async () => {
  await window.waitForSelector('//*[@aria-label="increase-font"]', { timeout: 5000 });
  await window.locator('//*[@aria-label="increase-font"]').click();
  await window.locator('//*[@aria-label="increase-font"]').click();

  // Get and verify the font size
  const div = await window.locator('//*[@aria-label="editor"]');
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size');
  });
  expect(await fontSize).toBe('22.4px');
});

test('Decrease the font size in the obs editor', async () => {
  await window.waitForSelector('//*[@aria-label="decrease-font"]', { timeout: 5000 });
  await window.locator('//*[@aria-label="decrease-font"]').click();
  await window.locator('//*[@aria-label="decrease-font"]').click();

  // Get and verify the font size
  const div = await window.locator('//*[@aria-label="editor"]');
  const fontSize = await div.evaluate((ele) => {
    return window.getComputedStyle(ele).getPropertyValue('font-size');
  });
  expect(await fontSize).toBe('16px');
});

test('Change the obs navigation story from 1 to 12 and edit the title', async () => {
  await expect(window.locator('//*[@aria-label="obs-navigation"]')).toBeVisible();
  await window.locator('//*[@aria-label="obs-navigation"]').click();
  await window.locator('//*[@aria-label="12"]').click();

  // Edit the title of story 12 and verify the change
  await expect(window.locator('//*[@name="12. The Exodus"]')).toBeVisible();
  await window.locator('//*[@name="12. The Exodus"]').fill('12. The Exodus Edit title');
  const title = await window.textContent('//*[@name="12. The Exodus Edit title"]');
  expect(title).toBe('12. The Exodus Edit title');
});

test('Return to projects list page from obs editor', async () => {
  await goToProjectPage(window, expect)
});

/* audio project */
test('Search an audio project in all projects list', async ({ audioProject }) => {
  await searchProject(window, expect, audioProject, 'audio')
});

test('Click on a audio project and Check the audio project name in the editor', async ({ audioProject }) => {
  await checkProjectName(window, expect, audioProject)
});

/// notification test is working for now i have commented due know issue
// test('Check audio project success load notification', async ({ audioProject }) => {
//   await checkNotification(window, expect, audioProject)
// });

test('Return to the projects from audio editor page', async () => {
  await goToProjectPage(window, expect)
});

/* about the scribe */
test("About scribe Application and License", async () => {
  await window.locator('//*[@aria-label="about-button"]').click()
  const developedby = await window.locator('[aria-label=developed-by]').textContent();
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.locator('//*[@aria-label="about-description"]').click()
  await window.click('[aria-label=close-about]');
  await projectPageExpect(window, expect)
})

/* exports project */
test("Export text translation project without add any content in the Downloads folder", async ({ textProject }) => {
  await exportProjects(window, expect, textProject)
})

test("Export the obs project without add any content in the Downloads folder", async ({ obsProject }) => {
  await exportProjects(window, expect, obsProject)
})

test("Export the audio project without add any content in the Downloads folder", async ({ audioProject }) => {
  await exportProjects(window, expect, audioProject)
})

/* export chapter wise project */
test("Export chapter wise audio project without add any content in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "Chapter")
})

/* export full audio project */
test("Export full audio project without add any content in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "full")
})

/* archive and unarchive project */
// text translation
test("Archive text translation project", async ({ textProject }) => {
  await archivedProjects(window, expect, textProject)
})

test("Restore text translation project from archived page", async ({ textProject }) => {
  await unarchivedProjects(window, expect, textProject)
})

// obs project
test("Archive obs project", async ({ obsProject }) => {
  await archivedProjects(window, expect, obsProject)
})

test("Restore the obs project from archived page", async ({ obsProject }) => {
  await unarchivedProjects(window, expect, obsProject)
})

// audio project
test("Archive audio project", async ({ audioProject }) => {
  await archivedProjects(window, expect, audioProject)
})

test("Restore the audio project from the archived page", async ({ audioProject }) => {
  await unarchivedProjects(window, expect, audioProject)
})

/* Update/Edit the text translation project */
test("Update/Edit text translation project of description and abbreviation", async ({ textProject, description, textAbbreviation }) => {
  await goToEditProject(window, expect, textProject)
  await updateDescriptionAbbriviation(window, expect, description, textAbbreviation, textProject)
})

test("Update/Edit text translation project scope added new book mark and luke from custom book", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the custom book option
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();

  // Select NT-Mark and NT-Luke
  await window.locator('//*[@aria-label="nt-Mark"]').click();
  await window.locator('//*[@aria-label="nt-Luke"]').click();

  // Save the changes and return to the projects page
  await window.locator('//*[@id="save-canon"]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  // Verify that the title is "Projects"
  await projectPageExpect(window, expect)
  await checkProjectName(window, expect, textProject)
  // checking mark and luke title in editor
  await confirmBookInEditor(window, expect, "nt-Mark", 1, 1, "MRK")
  await confirmBookInEditor(window, expect, "nt-Luke", 1, 1, "LUK")
  // go back to projects page
  await goToProjectPage(window, expect)

})

test("Update/Edit text translation project scope custom book into 27 NT and checking title of john and revelation", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the New Testament option
  await expect(window.locator('//*[@aria-label="new-testament"]')).toBeVisible();
  await window.locator('//*[@aria-label="new-testament"]').click();

  // Confirm the change and save
  await window.locator('//*[@aria-label="close-bible-nav"]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  // Verify that the title is "Projects"
  await projectPageExpect(window, expect)
  await checkProjectName(window, expect, textProject)
  // checking mark and luke title in editor
  await confirmBookInEditor(window, expect, "nt-John", 1, 1, "JHN")
  await confirmBookInEditor(window, expect, "nt-Revelation", 1, 1, "REV")
  // go back to projects page
  await goToProjectPage(window, expect)
})

test("Update/Edit text transaltion project scope custom book genesis and exodus from OT", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the custom book option
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();

  // Select OT-Genesis and OT-Exodus
  await window.locator('//*[@aria-label="ot-Genesis"]').click();
  await window.locator('//*[@aria-label="ot-Exodus"]').click();

  // Save the changes and return to the projects page
  await window.locator('//*[@id="save-canon"]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  // Verify that the title is "Projects"
  await projectPageExpect(window, expect)
  await checkProjectName(window, expect, textProject)
  await confirmBookInEditor(window, expect, "ot-Genesis", 1, 1, "GEN")
  await confirmBookInEditor(window, expect, "ot-Exodus", 1, 1, "EXO")
  // go back to projects page
  await goToProjectPage(window, expect)
})

test("Update/Edit text translation project license", async ({ textProject, currentLicense, newLicense, projectTextType }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, currentLicense, newLicense);
  //checking updated license
  await checkingUpdatedLicense(window, expect, textProject, newLicense, projectTextType)
})

/* Update/Edit the obs project */
test("Update/Edit obs project of description and abbreviation", async ({ obsProject, description, obsAbbreviation }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, description, obsAbbreviation, obsProject);
})

test("Update/Edit obs project license", async ({ obsProject, currentLicense, newLicense, projectObsType }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, currentLicense, newLicense);
  //checking updated license
  await checkingUpdatedLicense(window, expect, obsProject, newLicense, projectObsType)
})

/* Update/Edit the audio project */
test("Update/Edit audio project of description and abbreviation", async ({ audioProject, description, AudioAbbreviation }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, audioProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, description, AudioAbbreviation, audioProject)
})

/*changing app language hindi to english */
test("App language change Hindi to English", async ({ hindi, english }) => {
  // Verify the current page title
  await projectPageExpect(window, expect)
  // Change the app language from Hindi to English
  await changeAppLanguage(window, expect, hindi, english);

  // Verify the language change and UI update
  await window.waitForSelector('//*[@aria-label="snack-text"]')
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(await snackbar).toBe("Updated the Profile.");

  await window.locator('//*[@aria-label="projectList"]').click();
  await projectPageExpect(window, expect)
})

/* custom project with custom language for text translation */
test("Create new text translation project with new custom language and direction, custom book and without importing any book from the system", async ({ customTextProject, description, textAbbreviation, customTextLanguage }) => {
  // Navigate to the new project creation page
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible();
  await window.locator('//a[@aria-label="new"]').click();

  // Perform initial project creation steps and provide details
  await createProjectValidation(window, expect);
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible();
  await window.locator('//input[@id="project_name"]').fill(customTextProject);
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible();
  await window.locator('//textarea[@id="project_description"]').fill(`custom text translation project ${description}`);
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible();
  await window.locator('//input[@id="version_abbreviated"]').fill(`c${textAbbreviation}`);

  // Adding a new custom text translation language
  await customAddEditLanguage(window, expect, "add-language", customTextLanguage, 'cttl', "RTL", "edit-language");

  // Open advanced settings and configure project scope
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();
  await window.locator('//*[@aria-label="nt-Matthew"]').click();
  await window.locator('//*[@id="save-canon"]').click();

  // Create the project and verify the project name
  await window.locator('//button[@aria-label="create"]').click();
  const projectName = await window.locator(`//*[@id="${customTextProject}"]`).innerHTML()
  await expect(projectName).toBe(customTextProject);
})

/* Obs and Audio custom target language RTL project */
test("Create new obs project with new custom language and direction", async ({ customObsProject, projectObsType, description, obsAbbreviation, customObsLanguage }) => {
  // Create a custom OBS project with a custom language
  await customProjectTargetLanguage(window, expect, customObsProject, projectObsType, description, obsAbbreviation, "add-language", customObsLanguage, 'copl', "RTL", "edit-language")
})

test("Create new audio project with new custom language with no direction", async ({ customAudioProject, projectAudioType, description, AudioAbbreviation, customAudioLanguage }) => {
  // Create a custom audio project with a custom language
  await customProjectTargetLanguage(window, expect, customAudioProject, projectAudioType, description, AudioAbbreviation, "add-language", customAudioLanguage, 'capl', "RTL", "edit-language")
})

test('Search a new custom text translation project in all projects list', async ({ customTextProject }) => {
  await searchProject(window, expect, customTextProject, 'custom text')
});

/* Changing text translation project target language */
//text translation project
test("Changing text translation project language from English to Persian, checking in Projects and edit page", async ({ textProject }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "persian", "Persian (Farsi)")
})

test("Changing text translation project language from Persian to English, checking in Projects and Edit page", async ({ textProject, english }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, english.toLowerCase(), english)
})

test("Changing text translation project language from English to new custom created language, checking in Projects and Edit page", async ({ textProject, customTextLanguage }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "custom text", customTextLanguage)
  await checkProjectName(window, expect, textProject)
  await goToProjectPage(window, expect)
})

// obs project
test("Changing obs project language from English to new custom obs language", async ({ obsProject, customObsLanguage }) => {
  // Change the OBS project language
  await projectTargetLanguage(window, expect, obsProject, "custom obs", customObsLanguage)
  await checkProjectName(window, expect, obsProject)
  await goToProjectPage(window, expect)
})

/* updating user profile */
test("Update user Profile details", async () => {
  // Validate user profile page elements
  await userProfileValidaiton(window, expect);
  await expect(window.locator('input[name="given-name"]')).toBeVisible();
  await window.locator('input[name="given-name"]').fill("Bobby");
  await expect(window.locator('input[name="family-name"]')).toBeVisible();
  await window.locator('input[name="family-name"]').fill("kumar");
  await expect(window.locator('input[name="email"]')).toBeVisible();
  await window.locator('input[name="email"]').fill("kumar@gamil.com");
  await expect(window.locator('input[name="organization"]')).toBeVisible();
  await window.locator('input[name="organization"]').fill("vidya foundation");
  await expect(window.locator('input[name="selectedregion"]')).toBeVisible();
  await window.locator('input[name="selectedregion"]').fill("India");

  // Save the updated profile
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible();
  await window.locator('//*[@id="save-profile"]').click();

  // Verify the success message
  await window.waitForSelector('//*[@aria-label="snack-text"]')
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(await snackbar).toBe("Updated the Profile.");
  await window.locator('//*[@aria-label="projectList"]').click();
})