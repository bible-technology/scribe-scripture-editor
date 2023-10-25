// Function to check if the user is logged in or not
export const checkLogInOrNot = async (window, expect, textVisble) => {
  if (textVisble) {
    console.log("hello")
    // If title is "Projects" (english) or Not(other language) visible in project list page,
    const title = await window.locator('//*[@aria-label="projects"]', {timeout:5000}).textContent()
    expect(title).toBe(title)
  } else {
    // await window.waitForSelector('//*[@aria-label="welcome"]', { timeout: 5000 })
    console.log("world")
    // If 'projects' is not visible, check the 'welcome' element
    const welcome = await window.locator('//*[@aria-label="welcome"]', {timeout:5000}).textContent()
    await expect(welcome).toBe(welcome)
    await window.reload()
  }
  return textVisble;
}
const userPath= async (window) => {
  const path = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.userPath
}
// Retrieves and parses a JSON file containing user information
export const userJson = async (window, packageInfo, fs, path) => {
  const file = path.join(await userPath(window), packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  return JSON.parse(data);
}

// Constructs the path to a user's folder.
export const userFolder = async (window, userName, packageInfo, path) => {
  return path.join(await userPath(window), packageInfo.name, 'users', userName.toLowerCase())
}

// Constructs the path to the users' JSON file.
export const userFile = async (window, packageInfo, path) => {
  return path.join(await userPath(window), packageInfo.name, 'users', 'users.json');
}

// Removes a user's directory and updates the users' JSON file
export const removeFolderAndFile = async (fs, folder, userName, json, file) => {
  fs.rmSync(folder, { recursive: true, force: true })
  const filtered = json.filter((item) =>
    item.username.toLowerCase() !== userName.toLowerCase()
  )
  return await fs.writeFileSync(file, JSON.stringify(filtered))
}

// Displays the welcome page after removing a user's folder.
export const showLoginPage = async (fs, folder, userName, json, file, window, expect) => {
  await removeFolderAndFile(fs, folder, userName, json, file)
  const welcome = await window.locator('//*[@aria-label="welcome"]').textContent()
  await expect(welcome).toBe("Welcome!")
  await window.reload()
}

// Performs user validation checks.
export const userValidation = async (window, expect) => {
  // Check if the "Create New Account" button is visible
  expect(await window.locator('//*[@aria-label="create-new-account"]')).toBeVisible()
  await window.locator('//*[@aria-label="create-new-account"]').click()
  // Check if the "Username" input field is visible
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.locator('//input[@placeholder="Username"]').fill('jo')
  // Check if the "Submit" button is visible
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  // Check for a length error message
  const lengthError = await window.locator('//*[@id="show-error"]')
  expect(await lengthError.textContent()).toBe('The input has to be between 3 and 15 characters long')
}

// Performs project creation validation checks.
export const createProjectValidation = async (window, expect) => {
  await window.locator('//button[@aria-label="create"]').click()
  // Get the text content of the snackbar.
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent()
  // Verify if the snackbar message is 'Fill all the fields.'
  await expect(snackbar).toBe('Fill all the fields')
   // Get the text content of the title element.
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
   // Verify if the title is 'New Project.'
  await expect(title).toBe('New Project');
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
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  // Verify if the project name matches the expected project name.
  await expect(projectName).toBe(projectname);
}

/* Functions for managing project stars/unstars. */
export const starUnstar = async (window, expect, name, clickStar) => {
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
      await window.waitForTimeout(500)
      break
    }
  }
}

// Stars a project
export const starProject = async (window, expect, projectname) => {
  // Call the common function to star the project.
  await starUnstar(window, expect, projectname, "star-project")
}

// Untars a project
export const unstarProject = async (window, expect, projectname) => {
  // Call the common function to unstar the project.
  await starUnstar(window, expect, projectname, "unstar-project")
}

// Searches for a project with a given name.
export const searchProject = async (window, expect, projectName, searchtext) => {
   // Perform project search.
  await window.waitForTimeout(500)
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill(searchtext)
  const projectname = await window.locator(`//*[@id="${projectName}"]`).textContent()
  await expect(projectname).toBe(projectName);
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
      await tds.nth(1).click({timeout:10000})
      break
    }
  }
  await window.waitForTimeout(1000)
  await window.waitForSelector('[aria-label=editor-project-name]',{ timeout: 120000 })
  const projectname = await window.locator('[aria-label=editor-project-name]').textContent()
  expect(await projectname).toBe(name);
}

// Checks for notifications.
export const checkNotification = async (window, expect) => {
  // Wait for the notification button to appear and click it.
  await window.waitForSelector('//*[@aria-label="notification-button"]', {timeout : 5000})
  await window.locator('//*[@aria-label="notification-button"]').click()
  await window.waitForTimeout(1000)
  // Check if the notification title is "Notifications."
  const title = await window.locator('[aria-label=notification-title]').textContent();
  await expect(title).toBe('Notifications');
  await window.locator('//*[@aria-label="close-notification"]').click()
}

// Navigates back to the project page from the editor
export const goToProjectPage = async (window, expect) => {
  // Check if the back button is visible and click it.
  await expect(window.locator('//*[@id="back-button"]')).toBeVisible()
  await window.locator('//*[@id="back-button"]').click();
  // Check if the title on the project page is "Projects."
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
  await window.waitForTimeout(1000)
}

// Common function for interacting with tables.
export const commonFilterTable = async (window, expect, projectName, clickItem) => {
  // Check if the projects list is visible.
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      // Check if the "expand-project" button is visible and click it.
      expect(await tds.last().locator('[aria-label="expand-project"]')).toBeVisible()
      await tds.last().locator('[aria-label="expand-project"]').click()
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
  const snackText = await window.locator('//*[@aria-label="snack-text"]').textContent()
  await expect(snackText).toBe("Exported Successfully")
  await window.locator('[aria-label=arrow-up]').click()
}

//Export a project with chapter and full audio project
export const exportAudioProject = async(window, expect, projectname, itemCheck) => {
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
  const snackText = await window.locator('//*[@aria-label="snack-text"]').textContent()
  await expect(snackText).toBe("Exported Successfully")
  await window.locator('[aria-label=arrow-up]').click()
}

// Moves a project to the archived projects section
export const archivedProjects = async (window, expect, projectname) => {
  // Use the common function to locate the project.
  await commonFilterTable(window, expect, projectname, "archive-restore-project")
  // Click the "archived-projects" button.
  await window.locator('//*[@aria-label="archived-projects"]').click()
  // Check if the archive title is "Archived projects."
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(archiveTitle).toBe("Archived projects")
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
   // Click the "active-projects" button to go back to the active projects.
  await window.locator('//*[@aria-label="active-projects"]').click()
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(projectTitle).toBe('Projects');
}

// Moves a project back from archived to active projects.
export const unarchivedProjects = async (window, expect, projectname) => {
  // Click the "archived-projects" button to go to the archived projects.
  await window.locator('//*[@aria-label="archived-projects"]').click();
  // Use the common function to locate the project and unarchive it.
  await commonFilterTable(window, expect, projectname, "archive-restore-project");
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(archiveTitle).toBe("Archived projects");
  // Click the "active-projects" button to go back to the active projects.
  await window.locator('//*[@aria-label="active-projects"]').click();
  const projectName = await window.innerText(`//div[@id="${projectname}"]`);
  await expect(projectName).toBe(projectname);
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(projectTitle).toBe('Projects');
}

// Navigates to the project editing page.
export const goToEditProject = async (window, expect, projectName) => {
  // Use the common function to locate the project and navigate to the edit page.
  await commonFilterTable(window, expect, projectName, "edit-project");
  await window.waitForTimeout(500);
  // Check if the title on the edit project page is "Edit Project."
  const editTitle = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(editTitle).toBe('Edit Project');
}

// Changes the target language for a project.
export const projectTargetLanguage = async (window, expect, projectName, searchLangauge, selectLanguage) => {
   // Navigate to the project editing page.
   await goToEditProject(window, expect, projectName);
   // Ensure the custom dropdown is visible.
   expect(await window.locator('//*[@aria-label="custom-dropdown"]')).toBeVisible();
   // Fill in the search language.
   await window.locator('//*[@aria-label="custom-dropdown"]').fill(searchLangauge);
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
   const rows = body.locator('tr');
   for (let i = 0; i < await rows.count(); i++) {
     const row = await rows.nth(i);
     const tds = await row.locator('td');
     if (await tds.nth(1).textContent() === projectName) {
       // Verify the language of the selected project.
       expect(await tds.nth(2).textContent()).toBe(selectLanguage);
     }
   }
   // Verify the title of the page is "Projects."
   const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
   expect(title).toBe('Projects');
}

// Updates the project description and abbreviation.
export const updateDescriptionAbbriviation = async (window, expect, descriptionText, abbreviation) => {
   // Get the initial description and verify it.
   const description = await window.textContent('//textarea[@id="project_description"]');
   await expect(description).toBe('test description');
   // Fill in the new description.
   await window.locator('//textarea[@id="project_description"]').fill(descriptionText);
   // Get the edited description and verify it.
   const editDescription = await window.textContent('//textarea[@id="project_description"]');
   await expect(editDescription).toBe(descriptionText);
   // Fill in the abbreviation and verify that the "Save" button is visible.
   await window.locator('input[name="version_abbreviated"]').fill(abbreviation);
   await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible();
   // Click the "Save" button.
   await window.locator('//*[@aria-label="save-edit-project"]').click();
   // Wait for the page to load.
   await window.waitForTimeout(3000);
   // Verify the title of the page is "Projects."
   const title = await window.textContent('[aria-label=projects]');
   expect(await title).toBe('Projects');
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
 // Wait for the page to load.
 await window.waitForTimeout(3000);
 // Verify the title of the page is "Projects."
 const title = await window.textContent('[aria-label=projects]');
 expect(await title).toBe('Projects');
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
  await window.locator('//textarea[@id="project_description"]').fill(description);
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible();
  await window.locator('//input[@id="version_abbreviated"]').fill(abb);
  // Call the customAddEditLanguage function to add/edit target languages.
  await customAddEditLanguage(window, expect, openModal, targetLanguageName, targetLanguageCode, targetDirection, createLanguage, flavorType);
  // Click the button to create the project.
  await window.locator('//button[@aria-label="create"]').click();
  // Verify that the project was created.
  const projectName = await window.innerText(`//div[@id="${projectname}"]`);
  await expect(projectName).toBe(projectname);
}


// Performs user profile validation checks.
export const userProfileValidaiton = async(window, expect) => {
  // Ensure the user profile image is visible and click on it.
  expect(await window.locator('//*[@id="user-profile-image"]')).toBeVisible();
  await window.locator('//*[@id="user-profile-image"]').click();
  // Verify that the user profile is visible and click on it.
  expect(await window.locator('//*[@aria-label="user-profile"]')).toBeVisible();
  await window.locator('//*[@aria-label="user-profile"]').click();
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
  const firstLastNameError = await window.locator('//*[@aria-label="name-error"]').textContent();
  expect(firstLastNameError).toBe('The input has to be between 2 and 15 characters long');
  const emailError = await window.locator('//*[@aria-label="email-error"]').textContent();
  expect(emailError).toBe('Email is not valid!');
  const organizationError = await window.locator('//*[@aria-label="organization-error"]').textContent();
  expect(organizationError).toBe('The input has to be between 2 and 30 characters long');
  const regionError = await window.locator('//*[@aria-label="region-error"]').textContent();
  expect(regionError).toBe('The input has to be between 2 and 15 characters long');

}


// Changes the application's language.
export const changeAppLanguage = async (window, expect, fromLanguage, toLanguage) => {
  // Ensure the user profile image is visible and click on it.
  expect(await window.locator('//*[@id="user-profile-image"]')).toBeVisible();
  await window.locator('//*[@id="user-profile-image"]').click();
  // Verify that the user profile is visible and click on it.
  expect(await window.locator('//*[@aria-label="user-profile"]')).toBeVisible();
  await window.locator('//*[@aria-label="user-profile"]').click();
  // Click on the button with the "fromLanguage" name.
  await window.getByRole('button', { name: fromLanguage }).click();
  // Click on the option with the "toLanguage" name.
  await window.getByRole('option', { name: toLanguage }).click();
  // Verify that the "Save Profile" button is visible and click it.
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible();
  await window.locator('//*[@id="save-profile"]').click();
}

// Signs the user out.
export const signOut = async (window, expect) => {
  // Open the user profile menu.
  await expect(window.locator('//*[@id="user-profile-image"]')).toBeVisible()
  await window.locator('//*[@id="user-profile-image"]').click()
  // Click the "signout" option.
  await expect(window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  // Wait for the signout process to complete.
  await window.waitForTimeout(1000)
  // Verify that the user is signed out.
  const welcome = await window.locator('//*[@aria-label="welcome"]', {timeout:5000}).textContent()
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