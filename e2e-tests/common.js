export const checkLogInOrNot = async (window, expect) => {
  await window.waitForSelector('//*[@id="__next"]/div', '//*[@id="__next"]/div[1]', { timeout: 5000 })
  const textVisble = await window.locator('//*[@aria-label="projects"]').isVisible()
  if (textVisble) {
    // If title is "Projects" (english) or Not(other language) visible in project list page, 
    const title = await window.locator('//*[@aria-label="projects"]').textContent()
    if(await title === "Projects"){
      //expecting "Projects" in english
      await expect(title).toBe("Projects")
    }else{
      //expecting "Projects" in Other langauage
      await expect(title).not.toBe('Projects')
    }
  } else {
    // If 'projects' is not visible, check the 'welcome' element
    const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
    await expect(welcome).toBe("Welcome!")
    await window.reload()
  }
  return textVisble;
}

// Retrieves and parses a JSON file containing user information
export const userJson = async (window, packageInfo, fs, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  return JSON.parse(data);
}

// Constructs the path to a user's folder.
export const userFolder = async (window, userName, packageInfo, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase())
}

// Constructs the path to the users' JSON file.
export const userFile = async (window, packageInfo, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
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
  const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
  await expect(welcome).toBe("Welcome!")
  await window.reload()
}

// Performs user validation checks.
export const userValidation = async (window, expect) => {
  expect(await window.locator('//*[@aria-label="create-new-account"]')).toBeVisible()
  await window.locator('//*[@aria-label="create-new-account"]').click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.locator('//input[@placeholder="Username"]').fill('jo')
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const lengthError = await window.locator('//*[@id="show-error"]')
  expect(await lengthError.textContent()).toBe('The input has to be between 3 and 15 characters long')
}

// Performs project creation validation checks.
export const createProjectValidation = async (window, expect) => {
  await window.locator('//button[@aria-label="create"]').click()
  const snackbar = await window.locator('//*[@aria-label="snack-text"]').textContent()
  await expect(snackbar).toBe('Fill all the fields')
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('New Project');
  await window.waitForTimeout(3000)
}

/* Creates a project with a given name, type, description, and abbreviation. */
export const createProjects = async (window, expect, projectname, flavorType, description, abb) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible()
  await window.locator('//button[@aria-label="open-popover"]').click()
  await expect(window.locator(`//a[@data-id="${flavorType}"]`)).toBeVisible()
  await window.locator(`//a[@data-id="${flavorType}"]`).click()
  // checking for create project validation
  await createProjectValidation(window, expect)
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(projectname)
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await window.locator('//textarea[@id="project_description"]').fill(description)
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="version_abbreviated"]').fill(abb)
  await expect(window.locator('//button[@aria-label="create"]')).toBeVisible()
  await window.locator('//button[@aria-label="create"]').click()
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
}

// Stars or unstars a project
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
  await starUnstar(window, expect, projectname, "star-project")
}

// Untars a project
export const unstarProject = async (window, expect, projectname) => {
  await starUnstar(window, expect, projectname, "unstar-project")
}

// Searches for a project with a given name.
export const searchProject = async (window, expect, projectName, searchtext) => {
  await window.waitForTimeout(500)
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill(searchtext)
  const projectname = await window.locator(`//*[@id="${projectName}"]`).textContent()
  await expect(projectname).toBe(projectName);
}

// check project name in editor
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
  await window.waitForSelector('//*[@aria-label="notification-button"]', {timeout : 5000})
  await window.locator('//*[@aria-label="notification-button"]').click()
  await window.waitForTimeout(1000)
  const title = await window.locator('[aria-label=notification-title]').textContent();
  await expect(title).toBe('Notifications');
  await window.locator('//*[@aria-label="close-notification"]').click()
}

// Navigates back to the project page from the editor
export const goToProjectPage = async (window, expect) => {
  await expect(window.locator('//*[@id="back-button"]')).toBeVisible()
  await window.locator('//*[@id="back-button"]').click();
  const title = await window.locator('//*[@aria-label="projects"]').textContent();
  await expect(title).toBe('Projects');
  await window.waitForTimeout(1000)
}

// Common function for interacting with tables.
export const commonFilterTable = async (window, expect, projectName, clickItem) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      expect(await tds.last().locator('[aria-label="expand-project"]')).toBeVisible()
      await tds.last().locator('[aria-label="expand-project"]').click()
      await window.waitForTimeout(1000)
      await window.locator('//*[@aria-label="menu-project"]').click()
      await window.locator(`//*[@aria-label="${clickItem}"]`).click()
      break
    }
  }
}

// Exports a project to a specified location
export const exportProjects = async (window, expect, projectname) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const userpath = newpath.userPath.split(".")[0]
  await commonFilterTable(window, expect, projectname, "export-project")
  await expect(window.locator('input[name="location"]')).toBeVisible()
  await window.locator('input[name="location"]').fill(`${userpath}/Downloads`)
  await window.locator('//*[@aria-label="export-projects"]').click()
  await window.waitForTimeout(2000)
  const snackText = await window.locator('//*[@aria-label="snack-text"]').textContent()
  await expect(snackText).toBe("Exported Successfully")
  await window.locator('[aria-label=arrow-up]').click()
}

//Export a project with chapter and full audio project
export const exportAudioProject = async(window, expect, projectname, itemCheck) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const userpath = newpath.userPath.split(".")[0]
  await commonFilterTable(window, expect, projectname, "export-project")
  await expect(window.locator('input[name="location"]')).toBeVisible()
  await window.locator('input[name="location"]').fill(`${userpath}/Downloads`)
  await window.locator(`//*[@value="${itemCheck}"]`).click()
  await window.locator('//*[@aria-label="export-projects"]').click()
  await window.waitForTimeout(2000)
  const snackText = await window.locator('//*[@aria-label="snack-text"]').textContent()
  await expect(snackText).toBe("Exported Successfully")
  await window.locator('[aria-label=arrow-up]').click()
}

// Moves a project to the archived projects section
export const archivedProjects = async (window, expect, projectname) => {
  await commonFilterTable(window, expect, projectname, "archive-restore-project")
  await window.locator('//*[@aria-label="archived-projects"]').click()
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(archiveTitle).toBe("Archived projects")
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
  await window.locator('//*[@aria-label="active-projects"]').click()
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(projectTitle).toBe('Projects');
}

// Moves a project back from archived to active projects.
export const unarchivedProjects = async (window, expect, projectname) => {
  await window.locator('//*[@aria-label="archived-projects"]').click()
  await commonFilterTable(window, expect, projectname, "archive-restore-project")
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(archiveTitle).toBe("Archived projects")
  await window.locator('//*[@aria-label="active-projects"]').click()
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(projectTitle).toBe('Projects');
}

// Navigates to the project editing page.
export const goToEditProject = async (window, expect, projectName) => {
  await commonFilterTable(window, expect, projectName, "edit-project")
  await window.waitForTimeout(500)
  const editTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(editTitle).toBe('Edit Project');
}
// change project target language
export const projectTargetLanguage = async (window, expect, projectName, searchLangauge, selectLanguage) => {
  await goToEditProject(window, expect, projectName)
  expect(await window.locator('//*[@aria-label="custom-dropdown"]')).toBeVisible()
  await window.locator('//*[@aria-label="custom-dropdown"]').fill(searchLangauge)
  await window.locator(`//*[@aria-label="${selectLanguage}"]`).click()
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible()
  await window.locator('//*[@aria-label="save-edit-project"]').click()
  await window.waitForTimeout(2000)
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-body"]')
  const rows = body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      // expecting language
      expect(await tds.nth(2).textContent()).toBe(selectLanguage)
    }
  }
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
}

// update/edit project description and abbriviation 
export const updateDescriptionAbbriviation = async (window, expect, descriptionText, abbreviation) => {
  const description = await window.textContent('//textarea[@id="project_description"]')
  await expect(description).toBe('test description')
  await window.locator('//textarea[@id="project_description"]').fill(descriptionText)
  const editDescription = await window.textContent('//textarea[@id="project_description"]')
  await expect(editDescription).toBe(descriptionText)
  await window.locator('input[name="version_abbreviated"]').fill(abbreviation)
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible()
  await window.locator('//*[@aria-label="save-edit-project"]').click()
  await window.waitForTimeout(3000)
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects')
}

// license updating
export const changeLicense = async (window, expect, currentLicense, newLicense) => {
  await window.locator(`//*[@id="${currentLicense}"]`).click()
  await window.locator(`//*[@aria-label="${newLicense}"]`).click()
  await expect(window.locator('//*[@aria-label="save-edit-project"]')).toBeVisible()
  await window.locator('//*[@aria-label="save-edit-project"]').click()
  await window.waitForTimeout(3000)
  const title = await window.textContent('[aria-label=projects]');
  expect(await title).toBe('Projects')
}

// Performs user profile validation checks.
export const userProfileValidaiton = async(window, expect) => {
  expect(await window.locator('//*[@id="user-profile-image"]')).toBeVisible()
  await window.locator('//*[@id="user-profile-image"]').click()
  expect(await window.locator('//*[@aria-label="user-profile"]')).toBeVisible()
  await window.locator('//*[@aria-label="user-profile"]').click()
  await expect(window.locator('input[name="given-name"]')).toBeVisible();
  await window.locator('input[name="given-name"]').fill("b")
  await expect(window.locator('input[name="family-name"]')).toBeVisible();
  await window.locator('input[name="family-name"]').fill("k")
  await expect(window.locator('input[name="email"]')).toBeVisible();
  await window.locator('input[name="email"]').fill("kumar")
  await expect(window.locator('input[name="organization"]')).toBeVisible();
  await window.locator('input[name="organization"]').fill("v")
  await expect(window.locator('input[name="selectedregion"]')).toBeVisible();
  await window.locator('input[name="selectedregion"]').fill("I")
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible()
  await window.locator('//*[@id="save-profile"]').click()
  const firstLastNameError = await window.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[2]/span').textContent()
  expect(firstLastNameError).toBe('The input has to be between 2 and 15 characters long')
  const emailError = await window.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[3]/span').textContent()
  expect(emailError).toBe('Email is not valid!')
  const organizationError = await window.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[4]/span').textContent()
  expect(organizationError).toBe('The input has to be between 2 and 30 characters long')
  const regionError = await window.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[5]/span').textContent()
  expect(regionError).toBe('The input has to be between 2 and 15 characters long')
}


// Changes the application's language.
export const changeAppLanguage = async (window, expect, fromLanguage, toLanguage) => {
  expect(await window.locator('//*[@id="user-profile-image"]')).toBeVisible()
  await window.locator('//*[@id="user-profile-image"]').click()
  expect(await window.locator('//*[@aria-label="user-profile"]')).toBeVisible()
  await window.locator('//*[@aria-label="user-profile"]').click()
  await window.getByRole('button', { name: fromLanguage }).click()
  await window.getByRole('option', { name: toLanguage }).click()
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible()
  await window.locator('//*[@id="save-profile"]').click()
}

// sign out
export const signOut = async (window, expect) => {
  await expect(window.locator('//*[@id="user-profile-image"]')).toBeVisible()
  await window.locator('//*[@id="user-profile-image"]').click()
  await expect(window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  await window.waitForTimeout(1000)
  const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
  await expect(welcome).toBe("Welcome!")
  await window.waitForTimeout(200)
}

// Shows a list of active users.
export const showActiveUsers = async (window, expect) => {
  await expect(window.locator('//*[@id="view-more"]', {timeout:5000})).toBeVisible()
  await window.locator('//*[@id="view-more"]', {timeout:5000}).click()
  const active = await window.locator('//*[@id="active-tab"]').textContent()
  await expect(active).toBe("Active")
}