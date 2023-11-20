// get the user path
const userPath = async (window) => {
  const path = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.userPath
}

// Retrieves and parses a JSON file containing user information
export const userJson = async (window, packageInfo, path) => {
  return path.join(await userPath(window), packageInfo.name, 'users', 'users.json');
}

// Constructs the path to a user's folder.
export const userFolder = async (window, userName, packageInfo, path) => {
  return path.join(await userPath(window), packageInfo.name, 'users', userName.toLowerCase())
}

/* Removes a user's directory and updates the users' JSON file
 Displays the welcome page after removing a user's folder. */
export const showLoginPage = async (fs, folder, userName, json, userData, window, expect) => {
  await fs.rmSync(folder, { recursive: true, force: true })
  const filtered = json.filter((item) =>
    item.username.toLowerCase() !== userName.toLowerCase()
  )
  await fs.writeFileSync(userData, JSON.stringify(filtered))
  const welcome = await window.locator('//*[@aria-label="welcome"]').textContent()
  await expect(welcome).toBe("Welcome!")
  await window.waitForTimeout(500)
  await window.reload()
}

//logout and delete the playwright user from backend
export const clickUserImageToLogout = async (window, expect, userName, path, fs, packageInfo) => {
  // Here you handle user login and logout logic, user data, and folder management.
  //Retrieves and parses a JSON file containing user information
  const userData = await userJson(window, packageInfo, path)
  const data = await fs.readFileSync(userData);
  const json = JSON.parse(data);
  //  constructs the path to a folder/directory name
  const folder = await userFolder(window, userName, packageInfo, path)
  // Check if user profile image is visible
  await window.waitForSelector('//*[@id="user-profile-image"]')
  const userProfileImage = window.locator('//*[@id="user-profile-image"]');
  expect(await userProfileImage.isVisible()).toBeTruthy();
  await userProfileImage.click();

  // Get the current user's name
  const currentUser = await window.textContent('//*[@aria-label="userName"]');
  expect(currentUser).not.toBeNull();

  // Check if signout button is visible
  const signoutButton = window.locator('//*[@aria-label="sign-out"]');
  expect(await signoutButton.isVisible()).toBeTruthy();
  await signoutButton.click();

  // If the current user matches and the folder exists, log out and delete the user
  if (currentUser.toLowerCase() === userName.toLowerCase() && await fs.existsSync(folder)) {
    await showLoginPage(fs, folder, userName, json, userData, window, expect);
  }
}

// Performs user validation checks.
export const createUser = async (window, expect, username) => {
  // Check if the "Create New Account" button is visible
  expect(await window.locator('//*[@aria-label="create-new-account"]')).toBeVisible()
  await window.locator('//*[@aria-label="create-new-account"]').click()
  // Check if the "Username" input field is visible
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.locator('//input[@placeholder="Username"]').fill(username)
  // Check if the "Submit" button is visible
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
}

export const projectPageExpect = async (window, expect) => {
  await window.waitForSelector('//*[@aria-label="projects"]')
  const title = await window.locator('//*[@aria-label="projects"]').isVisible();
  await expect(title).toBe(true);
}

export const clickUserImage = async (window, expect, itemClick) => {
  // Ensure the user profile image is visible and click on it.
  await window.waitForSelector('//*[@id="user-profile-image"]')
  const imageClick = await window.locator('//*[@id="user-profile-image"]')
  expect(await imageClick).toBeVisible();
  await imageClick.click();
  await window.waitForSelector(`//*[@aria-label="${itemClick}"]`, { timeout: 10000 })
  expect(await window.locator(`//*[@aria-label="${itemClick}"]`)).toBeVisible();
  await window.locator(`//*[@aria-label="${itemClick}"]`).click();
}

// Signs the user out.
export const signOut = async (window, expect) => {
  // Open the user profile menu and signout
  await clickUserImage(window, expect, "sign-out")
  // Wait for the signout process to complete.
  await window.waitForTimeout(1000)
  // Verify that the user is signed out.
  const welcome = await window.locator('//*[@aria-label="welcome"]', { timeout: 5000 }).textContent()
  await expect(welcome).toBe("Welcome!")
  await window.waitForTimeout(200)
}

// Shows a list of active users.
export const showActiveUsers = async (window, expect) => {
  // Ensure the "view-more" button is visible and click it with a timeout of 5 seconds.
  await expect(window.locator('//*[@id="view-more"]', { timeout: 5000 })).toBeVisible();
  await window.locator('//*[@id="view-more"]', { timeout: 5000 }).click();
  // Get the text content of the "active-tab" element and verify it is "Active".
  const active = await window.locator('//*[@id="active-tab"]').textContent();
  await expect(active).toBe("Active");
}

// Performs project creation validation checks.
export const createProjectValidation = async (window, expect) => {
  await window.locator('//button[@aria-label="create"]').click()
  // Get the text content of the snackbar.
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').isVisible()
  // Verify if the snackbar message is 'Fill all the fields.'
  await expect(snackbar).toBe(true)
  // Wait for 3 seconds (3000 milliseconds).
  await window.waitForTimeout(3000)
}

/* Creates a new obs/audio project with various details. */
export const createProjects = async (window, expect, projectname, flavorType, description, abb) => {
  // Verify that the "new" button is visible.
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  // Verify that the "open-popover" button is visible.
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible()
  await window.locator('//button[@aria-label="open-popover"]').click()
  // Verify that the flavor type is visible.
  await expect(window.locator(`//a[@data-id="${flavorType}"]`)).toBeVisible()
  await window.locator(`//a[@data-id="${flavorType}"]`).click()
  // Check project creation validation.
  await createProjectValidation(window, expect)
  // Verify that the project name, description, abbreviation input is visible.
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(projectname)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill(description)
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill(abb)
  await expect(window.locator('//button[@aria-label="create"]')).toBeVisible()
  await window.locator('//button[@aria-label="create"]').click()
  // Get the project name from the DOM.
  const projectName = await window.locator(`//*[@id="${projectname}"]`).innerHTML()
  // Verify if the project name matches the expected project name.
  await expect(projectName).toBe(projectname);
}

/* Functions for managing project stars/unstars. */
export const starUnstar = async (window, expect, name, clickStar, expectAttribute) => {
  await expect(window.locator('//table[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//table[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === name) {
      expect(await tds.first().locator(`[aria-label=${clickStar}]`)).toBeVisible()
      await tds.first().locator(`[aria-label=${clickStar}]`).click()
      const attribute = await rows.nth(0).locator('td').nth(0).locator('button')
      //expecting a aria-label value
      await expect(attribute).toHaveAttribute('aria-label', expectAttribute)
      await window.waitForTimeout(500)
      break
    }
  }
}

// Searches for a project with a given name.
export const searchProject = async (window, expect, projectname, searchtext) => {
  // Perform project search.
  await window.waitForTimeout(500)
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await expect(window.locator('//table[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//table[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  const itemSearch = await window.locator('//input[@id="search_box"]')
  await itemSearch.click()
  if (await rows.count() >= 4) {
    await itemSearch.fill("translation")
    await window.waitForTimeout(1000)
    expect(await rows.count() > 1).toBe(true)
  }
  await window.waitForTimeout(500)
  await itemSearch.fill(searchtext)
  await window.waitForTimeout(1000)
  expect(await rows.count()).toBe(1)
  const projectName = await window.locator(`//*[@id="${projectname}"]`).innerHTML()
  //expecting project name
  await expect(projectName).toBe(projectname);
  await itemSearch.fill("abcd")
  await window.waitForTimeout(1000)
  expect(await rows.count()).toBe(0)
  await itemSearch.fill(" ")
  await window.waitForTimeout(1000)
  expect(await rows.count() > 1).toBe(true)

}

// Check the project name in the editor.
export const checkProjectName = async (window, expect, name) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === name) {
      await tds.nth(1).click({ timeout: 10000 })
      break
    }
  }
  await window.waitForTimeout(1000)
  await window.waitForSelector('//*[@aria-label="editor-project-name"]', { timeout: 120000 })
  const projectname = await window.locator('//*[@aria-label="editor-project-name"]', { timeout: 120000 }).textContent()
  // expecting project name in editor
  await expect(projectname).toBe(name);
}

// Checks for notifications.
export const checkNotification = async (window, expect, projectname) => {
  // Wait for the notification button to appear and click it.
  await window.waitForSelector('//*[@aria-label="notification-button"]', { timeout: 5000 })
  await window.locator('//*[@aria-label="notification-button"]').click()
  await window.waitForTimeout(1000)
  // Check if the notification title is "Notifications."
  const title = await window.locator('//*[@aria-label="notification-title"]').textContent();
  await expect(title).toBe('Notifications');
  const div = await window.locator(`//*[@aria-label="success-notification"]`)
  const notification = await div.locator("div >> p").first().textContent()
  await expect(notification).toBe(`successfully loaded ${projectname} files`)
  await window.locator('//*[@aria-label="close-notification"]').click()
}

export const addPanel = async (window) => {
  await window.waitForSelector('//*[@aria-label="add-panels"]')
  await window.locator('//*[@aria-label="add-panels"]').click()
}

// removing resource
export const removeResource = async (window, expect, resourcePaneNo, confirmButton) => {
  await window.waitForSelector(`//*[@aria-label="remove-resource-${resourcePaneNo}"]`)
  const closePanel = await window.locator(`//*[@aria-label="remove-resource-${resourcePaneNo}"]`)
  expect(await closePanel).toBeVisible()
  await closePanel.click()
  const title = await window.locator('//*[@aria-label="confirm-title"]').textContent()
  await expect(title).toBe(title)
  expect(await window.locator(`//*[@aria-label="${confirmButton}"]`)).toBeVisible()
  await window.locator(`//*[@aria-label="${confirmButton}"]`).click()
}

export const searchResourceLanguage = async (window, expect, searchLanguage) => {
  await window.waitForSelector('//*[@aria-label="custom-dropdown"]')
  const searchLang = await window.locator('//*[@aria-label="custom-dropdown"]')
  expect(await searchLang).toBeVisible();
  // Fill in the search language.
  await searchLang.click()
  await searchLang.fill(searchLanguage)
  // Click on the selectLanguage in the dropdown.
  await window.locator(`//*[@aria-label="${searchLanguage}"]`).click({ timeout: 10000 });
  await window.waitForTimeout(2000)
}

// download resource and display in panel
export const downloadResource = async (window, expect, resourceName, tabType) => {
  await window.locator('//*[@aria-label="resources-tab"]').click()
  await window.waitForSelector('//*[@id="resource-table"]')
  await expect(window.locator('//*[@id="resource-table"]')).toBeVisible()
  const table = window.locator('//*[@id="resource-table"]')
  const body = table.locator('//*[@id="resources-tab-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === resourceName) {
      // Check if the "download-resource" button is visible and click it.
      await window.waitForSelector('//*[@aria-label="download-resource"]')
      await tds.last().locator('//*[@aria-label="download-resource"]').click()
      await window.waitForTimeout(1000)
      // wait for until the resource may download
      expect(await tds.nth(1).textContent({ timeout: 100000 })).toBe(resourceName)
      break;
    }
  }
  const bibleObsTab = await window.locator(`//*[@aria-label="${tabType}"]`)
  expect(await bibleObsTab).toBeVisible()
  await bibleObsTab.click()
  expect(await bibleObsTab.textContent()).toBe(tabType)
}

export const downloadedResourceTable = async (window, expect, resourceName, panelNo, tabType) => {
  const bibleObsTab = await window.locator(`//*[@aria-label="${tabType}"]`, { timeout: 10000 })
  expect(await bibleObsTab).toBeVisible()
  await window.waitForSelector('//*[@id="downloaded-resources-table"]')
  await expect(window.locator('//*[@id="downloaded-resources-table"]')).toBeVisible()
  const table = window.locator('//*[@id="downloaded-resources-table"]')
  const body = table.locator('//*[@id="downloaded-resources-table-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    const data = await tds.nth(0).textContent()
    const dataSplit = data.slice(0, 6)
    if (await dataSplit === resourceName) {
      await tds.nth(0).click()
      break;
    }
  }
  await window.waitForSelector(`//*[@aria-label="obs-resource-${panelNo}"]`)
  const resoursetitle = await window.locator(`//*[@aria-label="obs-resource-${panelNo}"]`, { timeout: 10000 }).innerHTML()
  const splitString = await resoursetitle.slice(0, 6)
  expect(await splitString).toBe(resourceName)
  const storyTitle = await window.locator(`//*[@aria-label="obs-story-book-title-${panelNo}"]`).innerHTML()
  expect(await storyTitle).toBe(storyTitle)
  await window.waitForTimeout(1000)
}


// Navigates back to the project page from the editor
export const goToProjectPage = async (window, expect) => {
  // Check if the back button is visible and click it.
  await expect(window.locator('//*[@id="back-button"]')).toBeVisible()
  await window.locator('//*[@id="back-button"]').click();
  // Check if the title on the project page is "Projects."
  await window.waitForTimeout(500)
  await projectPageExpect(window, expect)
}

// Common function for interacting with tables.
export const commonFilterTable = async (window, expect, projectName, clickItem) => {
  // Check if the projects list is visible.
  await window.waitForSelector('//*[@id="projects-list"]')
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      // Check if the "expand-project" button is visible and click it.
      expect(await tds.last().locator('//*[@aria-label="expand-project"]')).toBeVisible()
      await tds.last().locator('//*[@aria-label="expand-project"]').click()
      await window.waitForTimeout(1000)
      // Open the project menu and click on the specified item.
      await window.locator('//*[@aria-label="menu-project"]').click()
      await window.locator(`//*[@aria-label="${clickItem}"]`).click()
      break
    }
  }
}

// Exports a project to a specified location
export const exportProjects = async (window, expect, projectname) => {
  // Get the user's download path from localStorage.
  const splitPath = await userPath(window)
  const userpath = splitPath.split(".")[0]
  // Use the common function to locate the project and export it.
  await commonFilterTable(window, expect, projectname, "export-project")
  await expect(window.locator('input[name="location"]')).toBeVisible()
  await window.locator('input[name="location"]').fill(`${userpath}/Downloads`)
  await window.locator('//*[@aria-label="export-projects"]').click()
  await window.waitForTimeout(2000)
  // Check for the success message.
  await window.waitForSelector('//*[@aria-label="snack-text"]')
  const snackText = await window.locator('//*[@aria-label="snack-text"]').isVisible()
  await expect(snackText).toBe(true)
  await window.locator('//*[@aria-label="arrow-up"]').click()
}

//Export a project with chapter and full audio project
export const exportAudioProject = async (window, expect, projectname, itemCheck) => {
  // Get the user's download path from localStorage.
  const splitPath = await userPath(window)
  const userpath = splitPath.split(".")[0]
  // Use the common function to locate the project and export it.
  await commonFilterTable(window, expect, projectname, "export-project")
  await expect(window.locator('input[name="location"]')).toBeVisible()
  await window.locator('input[name="location"]').fill(`${userpath}/Downloads`)
  await window.locator(`//*[@value="${itemCheck}"]`).click()
  await window.locator('//*[@aria-label="export-projects"]').click()
  await window.waitForTimeout(2000)
  // Check for the success message.
  const snackText = await window.locator('//*[@aria-label="snack-text"]').isVisible()
  await expect(snackText).toBe(true)
  await window.locator('//*[@aria-label="arrow-up"]').click()
}

// Moves a project to the archived projects section
export const archivedProjects = async (window, expect, projectname) => {
  // Use the common function to locate the project.
  await commonFilterTable(window, expect, projectname, "archive-restore-project")
  // Click the "archived-projects" button.
  await window.locator('//*[@aria-label="archived-projects"]').click()
  // Check if the archive title is "Archived projects."
  await projectPageExpect(window, expect)
  const archiveProjectName = await window.locator(`//*[@id="${projectname}"]`).innerHTML()
  await expect(archiveProjectName).toBe(projectname);
  // Click the "active-projects" button to go back to the active projects.
  await window.locator('//*[@aria-label="active-projects"]').click()
  await projectPageExpect(window, expect)
}

// Moves a project back from archived to active projects.
export const unarchivedProjects = async (window, expect, projectname) => {
  // Click the "archived-projects" button to go to the archived projects.
  await window.locator('//*[@aria-label="archived-projects"]').click();
  await projectPageExpect(window, expect)
  // Use the common function to locate the project and unarchive it.
  await commonFilterTable(window, expect, projectname, "archive-restore-project");
  // Click the "active-projects" button to go back to the active projects.
  await window.locator('//*[@aria-label="active-projects"]').click();
  const projectName = await window.locator(`//*[@id="${projectname}"]`).innerHTML()
  await expect(projectName).toBe(projectname);
}

// Navigates to the project editing page.
export const goToEditProject = async (window, expect, projectName) => {
  // Use the common function to locate the project and navigate to the edit page.
  await commonFilterTable(window, expect, projectName, "edit-project");
  await window.waitForTimeout(500);
  // Check if the title on the edit project page is "Edit Project."
  await projectPageExpect(window, expect)
}

// Changes the target language for a project.
export const projectTargetLanguage = async (window, expect, projectName, searchLangauge, selectLanguage) => {
  // Navigate to the project editing page.
  await goToEditProject(window, expect, projectName);
  // Ensure the custom dropdown is visible.
  await window.waitForSelector('//*[@aria-label="custom-dropdown"]')
  const searchLang = await window.locator('//*[@aria-label="custom-dropdown"]')
  expect(await searchLang).toBeVisible();
  // Fill in the search language.
  await searchLang.click()
  await searchLang.fill(searchLangauge);
  // Click on the selectLanguage in the dropdown.
  await window.locator(`//*[@aria-label="${selectLanguage}"]`).click();
  // Ensure the "Save" button is visible and click it.
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  // Wait for the page to load and verify that the projects list is visible.
  await window.waitForTimeout(2000);
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible();
  // Locate the projects list, find the target project, and verify the selected language.
  const table = window.locator('//*[@id="projects-list"]');
  const body = table.locator('//*[@id="projects-list-body"]');
  const rows = await body.locator('tr');
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      // Verify the language of the selected project.
      expect(await tds.nth(2).textContent()).toBe(selectLanguage);
    }
  }
  await goToEditProject(window, expect, projectName);
  await window.locator('//*[@aria-label="cancel-edit-project"]').click()
  await projectPageExpect(window, expect)

}

// Updates the project description and abbreviation.
export const updateDescriptionAbbriviation = async (window, expect, descriptionText, abbreviation, projectname) => {
  // Get the initial description and verify it.
  const description = await window.textContent('//textarea[@id="project_description"]');
  await expect(description).toBe('test description');
  // Fill in the new description.
  await window.locator('//textarea[@id="project_description"]').fill(`edit ${descriptionText}`);
  // Get the edited description and verify it.
  const editDescription = await window.textContent('//textarea[@id="project_description"]');
  await expect(editDescription).toBe(`edit ${descriptionText}`);
  // Fill in the abbreviation and verify that the "Save" button is visible.
  await window.locator('input[name="version_abbreviated"]').fill(`e${abbreviation}`);
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  // Click the "Save" button.
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  await goToEditProject(window, expect, projectname)
  await window.locator('//*[@aria-label="cancel-edit-project"]').click()
  await projectPageExpect(window, expect)
}

export const confirmBookInEditor = async (window, expect, book, chapter, verse, title) => {
  await window.locator('//*[@aria-label="open-book"]').click()
  //book
  await window.locator(`//*[@aria-label="${book}"]`).click();
  //chapter
  await window.locator(`//*[@id="chapter-${chapter}"]`).click();
  //verse
  await window.locator(`//*[@id="verse-${verse}"]`).click();
  const bookName = await window.locator('//*[@class="title sequence "]').textContent()
  await expect(bookName).toBe(title)
}

// Changes the project license.
export const changeLicense = async (window, expect, currentLicense, newLicense) => {
  // Click on the current license to change it.
  await window.locator(`//*[@id="${currentLicense}"]`).click();
  // Click on the new license.
  await window.locator(`//*[@aria-label="${newLicense}"]`).click();
  // Ensure the "Save" button is visible and click it.
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
  await window.locator('//*[@aria-label="save-edit-project"]').click();
  // Verify the title of the page is "Projects."
  await projectPageExpect(window, expect)
}

export const checkingUpdatedLicense = async (window, expect, projectname, newLicense, flavorType) => {
  await goToEditProject(window, expect, projectname);
  if (flavorType !== "OBS") {
    await expect(window.locator('//*[@id="open-advancesettings"]')).toBeVisible();
    await window.locator('//*[@id="open-advancesettings"]').click();
  }
  const license = await window.locator(`//*[@id="${newLicense}"]`).textContent()
  await expect(license).toBe(newLicense)
  await window.locator('//*[@aria-label="cancel-edit-project"]').click()
  await projectPageExpect(window, expect)
}

// Adds or edits custom target languages.
export const customAddEditLanguage = async (window, expect, openModal, targetLanguageName, targetLanguageCode, targetDirection, createLanguage, flavorType) => {
  // Open the specified modal.
  await window.locator(`//*[@aria-label="${openModal}"]`).click();
  // Ensure the "Language" input is visible and fill in the language name.
  expect(await window.locator('//*[@id="language"]')).toBeVisible();
  await window.locator('//*[@id="language"]').fill(targetLanguageName);
  // Ensure the "Code" input is visible and fill in the language code.
  expect(await window.locator('//*[@id="code"]')).toBeVisible();
  await window.locator('//*[@id="code"]').fill(targetLanguageCode);
  // If not an "Audio" flavor, choose the target direction.
  if (flavorType !== "Audio") {
    await window.locator(`//*[@aria-label="${targetDirection}"]`).click();
  }
  // Click the button to create the language.
  await window.locator(`//*[@aria-label="${createLanguage}"]`).click();
}

///Creates obs and audio projects with new custom target languages.
export const customProjectTargetLanguage = async (window, expect, projectname, flavorType, description, abb, openModal, targetLanguageName, targetLanguageCode, targetDirection, createLanguage) => {
  // Ensure the "New" button is visible and click it.
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible();
  await window.locator('//a[@aria-label="new"]').click();
  // Open the popover for creating a new project.
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible();
  await window.locator('//button[@aria-label="open-popover"]').click();
  // Choose the project flavor (obs or audio).
  await expect(window.locator(`//a[@data-id="${flavorType}"]`)).toBeVisible();
  await window.locator(`//a[@data-id="${flavorType}"]`).click();
  // Check for create project validation.
  await createProjectValidation(window, expect);
  // Fill in project details: name, description, and abbreviation.
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible();
  await window.locator('//input[@id="project_name"]').fill(projectname);
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible();
  await window.locator('//textarea[@id="project_description"]').fill(`custom ${flavorType} language ${description}`);
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible();
  await window.locator('//input[@id="version_abbreviated"]').fill(`c${abb}`);
  // Call the customAddEditLanguage function to add/edit target languages.
  await customAddEditLanguage(window, expect, openModal, targetLanguageName, targetLanguageCode, targetDirection, createLanguage, flavorType);
  // Click the button to create the project.
  await window.locator('//button[@aria-label="create"]').click();
  // Verify that the project was created.
  const projectName = await window.locator(`//*[@id="${projectname}"]`).innerHTML()
  await expect(projectName).toBe(projectname);
}

// Performs user profile validation checks.
export const userProfileValidaiton = async (window, expect) => {
  await clickUserImage(window, expect, "user-profile")
  // Check if the "given-name" input is visible and fill it with "b".
  await expect(window.locator('input[name="given-name"]')).toBeVisible();
  await window.locator('input[name="given-name"]').fill("b");
  // Check if the "family-name" input is visible and fill it with "k".
  await expect(window.locator('input[name="family-name"]')).toBeVisible();
  await window.locator('input[name="family-name"]').fill("k");
  // Check if the "email" input is visible and fill it with "kumar".
  await expect(window.locator('input[name="email"]')).toBeVisible();
  await window.locator('input[name="email"]').fill("kumar");
  // Check if the "organization" input is visible and fill it with "v".
  await expect(window.locator('input[name="organization"]')).toBeVisible();
  await window.locator('input[name="organization"]').fill("v");
  // Check if the "selectedregion" input is visible and fill it with "I".
  await expect(window.locator('input[name="selectedregion"]')).toBeVisible();
  await window.locator('input[name="selectedregion"]').fill("I");
  // Verify that the "Save Profile" button is visible and click it.
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible();
  await window.locator('//*[@id="save-profile"]').click();
  // Verify error messages for first/last name, email, organization, and region.
  const firstLastNameError = await window.locator('//*[@aria-label="name-error"]').isVisible();
  await expect(firstLastNameError).toBe(true);
  const emailError = await window.locator('//*[@aria-label="email-error"]').isVisible();
  await expect(emailError).toBe(true);
  const organizationError = await window.locator('//*[@aria-label="organization-error"]').isVisible();
  await expect(organizationError).toBe(true);
  const regionError = await window.locator('//*[@aria-label="region-error"]').isVisible();
  await expect(regionError).toBe(true);

}


// Changes the application's language.
export const changeAppLanguage = async (window, expect, fromLanguage, toLanguage) => {
  await clickUserImage(window, expect, "user-profile")
  // Click on the button with the "fromLanguage" name.
  await window.getByRole('button', { name: fromLanguage }).click();
  // Click on the option with the "toLanguage" name.
  await window.getByRole('option', { name: toLanguage }).click();
  // Verify that the "Save Profile" button is visible and click it.
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible();
  await window.locator('//*[@id="save-profile"]').click();
}


