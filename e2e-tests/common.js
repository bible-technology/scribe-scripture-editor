export const checkLogInOrNot = async (window, expect) => {
  await window.waitForSelector('//*[@id="__next"]/div', '//*[@id="__next"]/div[1]', { timeout: 5000 })
  const textVisble = await window.locator('//h1[@aria-label="projects"]', { timeout: 5000 }).isVisible()
  if (textVisble) {
    const title = await window.locator('//h1[@aria-label="projects"]').textContent()
    await expect(title).toBe('Projects')

  } else {
    const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
    await expect(welcome).toBe("Welcome!")
    await window.reload()
  }
  return textVisble;
}

export const userJson = async (window, packageInfo, fs, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  return JSON.parse(data);
}

export const userFolder = async (window, userName, packageInfo, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase())
}

export const userFile = async (window, packageInfo, path) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  return path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
}

export const removeFolderAndFile = async (fs, folder, userName, json, file) => {
  fs.rmSync(folder, { recursive: true, force: true })
  const filtered = json.filter((item) =>
    item.username.toLowerCase() !== userName.toLowerCase()
  )
  return await fs.writeFileSync(file, JSON.stringify(filtered))
}

// display welcome page
export const showLoginPage = async (fs, folder, userName, json, file, window, expect) => {
  await removeFolderAndFile(fs, folder, userName, json, file)
  const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
  await expect(welcome).toBe("Welcome!")
  await window.reload()
}

// user validation
export const userValidation = async (window, expect) => {
  expect(await window.locator('//*[@aria-label="create-new-account"]')).toBeVisible()
  await window.locator('//*[@aria-label="create-new-account"]').click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.locator('//input[@placeholder="Username"]').fill('jo')
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.click('[type=submit]');
  const lengthError = await window.locator('//*[@id="show-error"]')
  expect(await lengthError === true)
  expect(await lengthError.textContent()).toBe('The input has to be between 3 and 15 characters long')
}

// project creation validation
export const createProjectValidation = async (window, expect) => {
  await window.locator('//button[@aria-label="create"]').click()
  const snackbar = await window.textContent('//*[@id="__next"]/div/div[2]/div[2]/div/div')
  expect(await snackbar).toBe('Fill all the fields')
  const title = await window.locator('//h1[@aria-label="projects"]').textContent();
  await expect(title).toBe('New Project');
  await window.waitForTimeout(3000)
}

/* function for creating a project for obs and audio */
export const createProjects = async (window, expect, projectname, type, description, abb) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible()
  await window.locator('//button[@aria-label="open-popover"]').click()
  await expect(window.locator(`//a[@data-id="${type}"]`)).toBeVisible()
  await window.locator(`//a[@data-id="${type}"]`).click()
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

// star the project
export const starProject = async (window, expect, projectname) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const starBody = table.locator('//*[@id="projects-list-star"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.first().locator('[aria-label=unstar-project]')).toBeVisible()
      await tds.first().locator('[aria-label=unstar-project]').click()
      expect(await rows.count()).toBe(2)
      const starRows = await starBody.locator('tr')
      const starProjectName = await starRows.locator("td").nth(1).innerText()
      expect(await starProjectName).toBe(projectname)
      expect(await starRows.count()).toBe(1)
      break
    }
  }
}

// unstar the project
export const unstarProject = async (window, expect, projectname) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-star"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.first().locator('[aria-label=star-project]')).toBeVisible()
      await tds.first().locator('[aria-label=star-project]').click()
      const unstarBody = table.locator('//*[@id="projects-list-unstar"]')
      const unstarRows = await unstarBody.locator('tr')
      expect(await rows.count()).toBe(0)
      expect(await unstarRows.count()).toBe(3)      
      break;
    }
  }
}

// search projects
export const searchProject = async (window, expect, projectName, searchtext) => {
  await window.waitForTimeout(500)
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill(searchtext)
  const projectname = await window.innerText(`//*[@id="${projectName}"]`);
  await expect(projectname).toBe(projectName);
}

// check project name in editor
export const checkProjectName = async (window, expect, name) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
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
  const projectname = await window.locator('[aria-label=editor-project-name]', { timeout: 10000 }).textContent()
  expect(projectname).toBe(name);
}

// check notification
export const checkNotification = async (window, expect) => {
  await window.locator('//*[@aria-label="notification-button"]').click()
  const title = await window.innerText('[aria-label=notification-title]');
  await expect(title).toBe('NOTIFICATIONS');
  await window.locator('//*[@aria-label="close-notification"]').click()
}

// back button in editor page
export const goToProjectPage = async (window, expect) => {
  await expect(window.locator('//*[@id="back-button"]')).toBeVisible()
  await window.locator('//*[@id="back-button"]').click();
  const title = await window.locator('//h1[@aria-label="projects"]', { timeout: 10000 }).textContent();
  expect(title).toBe('Projects');
  await window.waitForTimeout(1000)
}

// export projects
export const exportProjects = async (window, expect, projectname) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.last().locator('[aria-label=unstar-expand-project]')).toBeVisible()
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.waitForTimeout(1000)
      await window.locator('.pl-5 > div > div').click()
      await window.locator('//*[@aria-label="unstar-export-project"]').click()
      await expect(window.locator('input[name="location"]')).toBeVisible()
      await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
      await window.locator('//*[@aria-label="export-projects"]').click()
      await window.waitForTimeout(2000)
      const notifyMe = await window.locator('//*[@id="__next"]/div[2]/div').isVisible()
      expect(await notifyMe === true)
      expect(await rows.count()).toBe(4)
      await window.locator('[aria-label=unstar-arrow-up]').click()
      break
    }
  }
}

// archived projects
export const archivedProjects = async (window, expect, projectname) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.last().locator('[aria-label=unstar-expand-project]')).toBeVisible()
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.waitForTimeout(1000)
      await window.locator('.pl-5 > div > div').click()
      await window.locator('//*[@aria-label="unstar-archive-restore-project"]').click()
      expect(await rows.count()).toBe(4)
      break
    }
  }
  await window.locator('//*[@aria-label="archived-projects"]').click()
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(archiveTitle).toBe("Archived projects")
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
  await window.locator('//*[@aria-label="active-projects"]').click()
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(projectTitle).toBe('Projects');
}

// unarchived projects
export const unarchivedProjects = async (window, expect, projectname) => {
  await window.locator('//*[@aria-label="archived-projects"]').click()
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.last().locator('[aria-label=unstar-expand-project]')).toBeVisible()
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.locator('.pl-5 > div > div').click({ timeout: 4000 })
      await window.locator('//*[@aria-label="unstar-archive-restore-project"]').click()
      await window.waitForTimeout(500)
      expect(await rows.count()).toBe(0)
      break
    }
  }
  const archiveTitle = await window.locator('//*[@aria-label="projects"]').textContent()

  await expect(archiveTitle).toBe("Archived projects")
  await window.locator('//*[@aria-label="active-projects"]').click()
  const projectName = await window.innerText(`//div[@id="${projectname}"]`)
  await expect(projectName).toBe(projectname);
  const projectTitle = await window.locator('//*[@aria-label="projects"]').textContent()
  await expect(projectTitle).toBe('Projects');
}

export const goToEditProject = async (window, expect, projectName) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    if (await tds.nth(1).textContent() === projectName) {
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.locator('[aria-label=unstar-menu-project]').click()
      await window.locator('//*[@aria-label="edit-project"]').click()
      const text = await window.innerText('//*[@id="__next"]/div/div[2]/header/div/div[1]/div/h1')
      await expect(text).toBe('EDIT PROJECT')
    }
  }
}

export const changeAppLanguage = async (window, expect, fromLanguage, toLanguage) => {
  expect(await window.locator('//*[@id="user-profile"]')).toBeVisible()
  await window.locator('//*[@id="user-profile"]').click()
  expect(await window.locator('//*[@aria-label="user-profile"]')).toBeVisible()
  await window.locator('//*[@aria-label="user-profile"]').click()
  await window.getByRole('button', { name: fromLanguage }).click()
  await window.getByRole('option', { name: toLanguage }).click()
  expect(await window.locator('//*[@id="save-profile"]')).toBeVisible()
  await window.locator('//*[@id="save-profile"]').click()
}

// sing out
export const signOut = async (window, expect) => {
  await expect(window.locator('//*[@id="user-profile"]')).toBeVisible()
  await window.locator('//*[@id="user-profile"]').click()
  await expect(window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  await window.waitForTimeout(1000)
  const welcome = await window.locator('//h2[@aria-label="welcome"]', {timeout:5000}).textContent()
  await expect(welcome).toBe("Welcome!")
  await window.waitForTimeout(200)
}

// show active user by clicking the view more but in login page
export const showActiveUsers = async (window, expect) => {
  await expect(window.locator('//*[@id="view-more"]', {timeout:5000})).toBeVisible()
  await window.locator('//*[@id="view-more"]', {timeout:5000}).click()
  const active = await window.locator('//*[@id="active-tab"]').textContent()
  await expect(active).toBe("Active")
}