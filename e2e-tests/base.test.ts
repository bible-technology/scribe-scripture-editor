// @ts-check

import { test, expect } from './myFixtures';
import packageInfo from '../package.json';
import {
  showLoginPage, checkLogInOrNot, userFile,
  userFolder, userJson, createProjectValidation,
  createProjects, unstarProject, starProject,
  userValidation, signOut, showActiveUsers,
  searchProject, checkProjectName, checkNotification,
  goToProjectPage, exportProjects, archivedProjects,
  unarchivedProjects, goToEditProject, changeAppLanguage,
  projectTargetLanguage, userProfileValidaiton,
  exportAudioProject, updateDescriptionAbbriviation, changeLicense,
  customAddEditLanguage, customProjectTargetLanguage
} from './common';

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
// This test case checks if the user is already logged in
test('Check whether the app is being logged IN', async () => {
  await checkLogInOrNot(window, expect)
});

// This test case handles the user's login or logout actions and related operations.
test('If logged IN then logout and delete that user from the backend', async ({ userName }) => {
  // Here you handle user login and logout logic, user data, and folder management.
  //user json
  const json = await userJson(window, packageInfo, fs, path)
  // user file
  const file = await userFile(window, packageInfo, path)
  // user folde name
  const folder = await userFolder(window, userName, packageInfo, path)

  if (await checkLogInOrNot(window, expect)) {
    // Check if user profile image is visible
    const userProfileImage = window.locator('//*[@id="user-profile-image"]');
    expect(await userProfileImage.isVisible()).toBeTruthy();
    await userProfileImage.click();

    // Get the current user's name
    const currentUser = await window.textContent('[aria-label="userName"]');
    expect(currentUser).not.toBeNull();

    // Check if signout button is visible
    const signoutButton = window.locator('//*[@aria-label="signout"]');
    expect(await signoutButton.isVisible()).toBeTruthy();
    await signoutButton.click();

    // If the current user matches and the folder exists, log out and delete the user
    if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect);
    }
  } else {
    // On the login page, if the playwright user exists, reload the app and remove it
    const existUser = json.some((item) => item.username.toLowerCase() === userName.toLowerCase());
    if (existUser && await fs.existsSync(folder)) {
      await showLoginPage(fs, folder, userName, json, file, window, expect);
    }
  }

});

// This test case creates a new user and logs in.
test('Create a new user and login', async ({ userName }) => {
  // Here you create a new user and validate the login.
  await userValidation(window, expect)
  await window.locator('//input[@placeholder="Username"]').fill(userName)
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
})


/*CREATE PROJECTS FOR ALL FLAVOR TYPE */
/* Translation Project    */
test('Click New and Fill project page details to create a new project for text translation with custom book', async ({ textProject }) => {
  // Here you create a new text translation project with custom settings.
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await createProjectValidation(window, expect)
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(textProject)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill('test description')
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill('ttp')
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible()
  await window.locator('//*[@id="open-advancesettings"]').click()
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible()
  await window.locator('//*[@aria-label="custom-book"]').click()
  await window.locator('//*[@aria-label="nt-Matthew"]').click()
  await window.locator('//*[@id="save-canon"]').click()
  await window.locator('//button[@aria-label="create"]').click()
  const projectName = await window.innerText(`//div[@id="${textProject}"]`)
  await expect(projectName).toBe(textProject);
})

/* Obs translation project */
test('Click New and Fill project page details to create a new project for obs', async ({ obsProject }) => {
  //  Here you create a new OBS project.
  await createProjects(window, expect, obsProject, "OBS", "test description", "otp")
})

/* Audio project */
test('Click New and Fill project page details to create a new project for audio', async ({ audioProject }) => {
  // Here you create a new audio project
  await createProjects(window, expect, audioProject, "Audio", "test description", "atp")
})

/* STAR & UNSTAR PROJECT */
// text translation
test("Star the text translation project", async ({ textProject }) => {
  // Here you star a text translation project.
  await starProject(window, expect, textProject)
})

test("Unstar the text translation project", async ({ textProject }) => {
  // Here you unstar a text translation project.
  await unstarProject(window, expect, textProject)
})

// obs
test("Star the obs project", async ({ obsProject }) => {
  // Here you star a OBS project.
  await starProject(window, expect, obsProject)
})

test("Unstar the obs project", async ({ obsProject }) => {
  // Here you unstar a OBS project.
  await unstarProject(window, expect, obsProject)
})

// audio
test("Star the audio project", async ({ audioProject }) => {
  // Here you star a Audio project.
  await starProject(window, expect, audioProject)
})

test("Unstar the audio project", async ({ audioProject }) => {
  // Here you unstar a Audio project.
  await unstarProject(window, expect, audioProject)
})

/* text transaltion project */
test('Search a text translation project in all projects list', async ({ textProject }) => {
  await searchProject(window, expect, textProject, 'translation')
});

test('Click on a text translation project and Check the text Translation project name in the editor', async ({ textProject }) => {
  await checkProjectName(window, expect, textProject)
});

test('Check text Translation project Notifications', async () => {
  await checkNotification(window, expect)
});

test('Return to the project page', async () => {
  await goToProjectPage(window, expect)
});

/* obs project */
test('Search an obs project in all projects list', async ({ obsProject }) => {
  await searchProject(window, expect, obsProject, 'obs')
});

test('Click on a obs project and Check the obs project name in the editor', async ({ obsProject }) => {
  await checkProjectName(window, expect, obsProject)
});

test('Check obs project Notifications', async () => {
  await checkNotification(window, expect)
});

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

test('Check audio project Notifications', async () => {
  await checkNotification(window, expect)
});

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
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
})

/* exports project */
test("Export text translation project in the Downloads folder", async ({ textProject }) => {
  await exportProjects(window, expect, textProject)
})

test("Export the obs project in the Downloads folder", async ({ obsProject }) => {
  await exportProjects(window, expect, obsProject)
})

test("Export the audio project in the Downloads folder", async ({ audioProject }) => {
  await exportProjects(window, expect, audioProject)
})

//export chapter wise and full audio project
test("Export chapter wise audio project in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "Chapter")
})

test("Export full audio project in the Downloads folder", async ({ audioProject }) => {
  await exportAudioProject(window, expect, audioProject, "full")
})

/* archive and unarchive project */
test("Archive text translation project", async ({ textProject }) => {
  await archivedProjects(window, expect, textProject)
})

test("Restore text translation project from archived page", async ({ textProject }) => {
  await unarchivedProjects(window, expect, textProject)
})

test("Archive obs project", async ({ obsProject }) => {
  await archivedProjects(window, expect, obsProject)
})

test("Restore the obs project from archived page", async ({ obsProject }) => {
  await unarchivedProjects(window, expect, obsProject)
})

test("Archive audio project", async ({ audioProject }) => {
  await archivedProjects(window, expect, audioProject)
})

test("Restore the audio project from the archived page", async ({ audioProject }) => {
  await unarchivedProjects(window, expect, audioProject)
})

/* Update/Edit the text translation project */
test("Update/Edit text translation project of description and abbreviation", async ({ textProject }) => {
  await goToEditProject(window, expect, textProject)
  await updateDescriptionAbbriviation(window, expect, "edit text translation project", "ettp")
})

test("Update/Edit text translation project scope mark and luke", async ({ textProject }) => {
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
  await window.waitForTimeout(2500);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
})

test("Update/Edit text translation project scope custom book into NT", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Select the New Testament option
  await expect(window.locator('//*[@aria-label="new-testament"]')).toBeVisible();
  await window.locator('//*[@aria-label="new-testament"]').click();

  // Confirm the change and save
  await window.locator('//button[contains(text(),"Ok")]').click();
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  await window.waitForTimeout(3000);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
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
  await window.waitForTimeout(3000);

  // Verify that the title is "Projects"
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects');
})

test("Update/Edit text translation project license", async ({ textProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, textProject);

  // Open advanced settings
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, "CC BY-SA", "CC BY");
})

/* Update/Edit the obs project */
test("Update/Edit obs project of description and abbreviation", async ({ obsProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, "edit obs project", "eop");
})

test("Update/Edit obs project license", async ({ obsProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, obsProject);

  // Change the license from "CC BY-SA" to "CC BY"
  await changeLicense(window, expect, "CC BY-SA", "CC BY");
})

/* Update/Edit the audio project */
test("Update/Edit audio project of description and abbreviation", async ({ audioProject }) => {
  // Navigate to the edit project page
  await goToEditProject(window, expect, audioProject);

  // Update description and abbreviation
  await updateDescriptionAbbriviation(window, expect, "edit audio project", "eap")
})


// custom project with custom language for text translation
test("Custom text translation with custom language project", async ({ customTextTargetLanguage }) => {
  // Navigate to the new project creation page
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible();
  await window.locator('//a[@aria-label="new"]').click();

  // Perform initial project creation steps and provide details
  await createProjectValidation(window, expect);
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible();
  await window.locator('//input[@id="project_name"]').fill(customTextTargetLanguage);
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible();
  await window.locator('//textarea[@id="project_description"]').fill('test description');
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible();
  await window.locator('//input[@id="version_abbreviated"]').fill('ttp');

  // Adding a new custom text translation language
  await customAddEditLanguage(window, expect, "add-language", "custom text translation language", 'cttl', "RTL", "create-language");

  // Open advanced settings and configure project scope
  await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
  await window.locator('//*[@id="open-advancesettings"]').click();
  await expect(window.locator('//*[@aria-label="custom-book"]')).toBeVisible();
  await window.locator('//*[@aria-label="custom-book"]').click();
  await window.locator('//*[@aria-label="nt-Matthew"]').click();
  await window.locator('//*[@id="save-canon"]').click();

  // Create the project and verify the project name
  await window.locator('//button[@aria-label="create"]').click();
  const projectName = await window.innerText(`//div[@id="${customTextTargetLanguage}"]`);
  await expect(projectName).toBe(customTextTargetLanguage);
})

//Obs and Audio custom target language RTL project 
test("Custom obs project with custom language project", async ({ customObsTargetLanguage }) => {
  // Create a custom OBS project with a custom language
  await customProjectTargetLanguage(window, expect, customObsTargetLanguage, "OBS", "custom obs language test description", "cotp", "add-language", "custom obs project language", 'copl', "RTL", "create-language")
})

test("Custom audio project with custom language project", async ({ customAudioTargetLanguage }) => {
  // Create a custom audio project with a custom language
  await customProjectTargetLanguage(window, expect, customAudioTargetLanguage, "Audio", "custom audio language test description", "catp", "add-language", "custom audio project language", 'capl', "RTL", "create-language")
})

/* Changing text translation project target language */
//text translation project
test("Changing text translation project language from English to Persian", async ({ textProject }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "persian", "Persian (Farsi)")
})

test("Changing text translation project language from Persian to English", async ({ textProject }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "english", "English")
})

test("Changing text translation project language from English to new custom text translation language", async ({ textProject }) => {
  // Change the text translation project language
  await projectTargetLanguage(window, expect, textProject, "custom text", "custom text translation language")
  await checkProjectName(window, expect, textProject)
  await goToProjectPage(window, expect)
})

// obs project
test("Changing obs project language from English to new custom obs project language", async ({ obsProject }) => {
  // Change the OBS project language
  await projectTargetLanguage(window, expect, obsProject, "custom obs", "custom obs project language")
  await checkProjectName(window, expect, obsProject)
  await goToProjectPage(window, expect)
})

/* updating user profile */
test("Update user Profile", async () => {
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
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent();
  expect(snackbar).toBe("Updated the Profile.");
})

/*changing app language english to hindi */
test("App language change English to hindi", async () => {
  // Change the app language from English to Hindi
  await changeAppLanguage(window, expect, "English", "Hindi");

  // Verify the language change and UI update
  const snackbar = await window.locator('//*[@id="__next"]/div[2]/div/div').isVisible();
  expect(await snackbar === true);

  const textHindi = await window.locator('//*[@aria-label="projects"]').allTextContents();
  expect(await textHindi[0]).toBe("प्रोफ़ाइल");
})

/*changing app language hindi to english */
test("App language change Hindi to English", async () => {
  expect(await window.locator('//*[@aria-label="projectList"]')).toBeVisible();
  await window.locator('//*[@aria-label="projectList"]').click();
  await window.waitForTimeout(2000);

  // Verify the current page title
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(await title).toBe('प्रोजेक्ट्स');

  // Change the app language from Hindi to English
  await changeAppLanguage(window, expect, "Hindi", "English");

  // Verify the language change and UI update
  const snackbar = await window.locator('//*[@id="__next"]/div[2]/div/div').isVisible();
  const profile = await window.locator('//*[@aria-label="projects"]').allTextContents();
  expect(await profile[0]).toBe("Profile");
  expect(await snackbar === true);
})

/*signing out */
test("Sign out the Application", async () => {
  await signOut(window, expect)
})

/* view users */
test("Click the view users button, log in with playwright user, and sign out", async ({ userName }) => {
  await showActiveUsers(window, expect)
  const tabContent = await window.locator('//*[@id="active-tab-content"]')
  const div = await tabContent.locator("div > div")
  for (let i = 0; i < await div.count(); i++) {
    if (await div.nth(i).textContent() === userName.toLowerCase()) {
      await div.nth(i).click()
      await window.waitForTimeout(1000)
      const title = await window.locator('//*[@aria-label="projects"]').textContent();
      await expect(title).toBe('Projects')
      await signOut(window, expect)
      break
    }
  }
})

/* user delete, check in archive and restore */
test("Delete the user from the active tab and check in the archived tab", async ({ userName }) => {
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
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects')
})

/* logout and delete the playwright user */
test("Logout and delete that playwright user from the backend", async ({ userName }) => {
  // user json
  const json = await userJson(window, packageInfo, fs, path)
  // user file
  const file = await userFile(window, packageInfo, path)
  // user folde name
  const folder = await userFolder(window, userName, packageInfo, path)
  expect(await window.locator('//*[@id="user-profile-image"]')).toBeVisible()
  await window.locator('//*[@id="user-profile-image"]').click()
  const currentUser = await window.textContent('[aria-label="userName"]')
  expect(await window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  // projects page then logout and delete playwright user
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    await showLoginPage(fs, folder, userName, json, file, window, expect)
  }
})
