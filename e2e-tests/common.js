export const checkLogInOrNot = async (window, expect) => {
  await window.waitForSelector('//*[@id="__next"]/div', '//*[@id="__next"]/div[1]')
  const textVisble = await window.locator('//h1["@aria-label=projects"]', { timeout: 3000 }).isVisible()
  if (textVisble) {
    const title = await window.textContent('[aria-label=projects]')
    await expect(title).toBe('Projects')

  } else {
    const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
    await expect(welcome).toBe("Welcome!")
    await window.reload()
  }
  return textVisble;
}

export const filterUser = (json, name) => {
  const filtered = json.filter((user) =>
    user.username.toLowerCase() !== name.toLowerCase()
  )
  return filtered
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

export const showLoginPage = async (fs, folder, userName, json, file, window, expect) => {
  await removeFolderAndFile(fs, folder, userName, json, file)
  const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
  await expect(welcome).toBe("Welcome!")
  await window.reload()
}
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

export const createProjectValidation = async (window, expect) => {
  await window.locator('//button[@aria-label="create"]').click()
  const snackbar = await window.textContent('//*[@id="__next"]/div/div[2]/div[2]/div/div')
  expect(await snackbar).toBe('Fill all the fields')
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('New Project');
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
  expect(projectName).toBe(projectname);
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
}

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
    }
  }
}

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
    }
  }
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
}

export const searchProject = async (window, expect, projectName, searchtext) => {
  await window.waitForTimeout(1000)
  expect(await window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill(searchtext)
  const projectname = await window.innerText(`//*[@id="${projectName}"]`);
  expect(await projectname).toBe(projectName);
}

export const checkProjectName = async (window, expect, name) => {
  expect(await window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = await window.locator('//*[@id="projects-list"]')
  const body = await table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === name) {
      await tds.nth(1).click()
    }
  }
  const editorpane = await window.innerText('[aria-label=editor-pane]', { timeout: 120000 });
  expect(editorpane).toBe('EDITOR');
  const projectname = await window.innerText('[aria-label=editor-project-name]');
  expect(projectname).toBe(name.toUpperCase());
}

export const checkNotification = async (window, expect) => {
  await window.locator('//*[@aria-label="notification-button"]').click()
  const title = await window.innerText('[aria-label=notification-title]');
  expect(title).toBe('NOTIFICATIONS');
  await window.locator('//*[@aria-label="close-notification"]').click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
}

export const goToProjectPage = async (window, expect) => {
  expect(await window.locator('//*[@id="back-button"]')).toBeVisible()
  await window.locator('//*[@id="back-button"]').click();
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
  await window.waitForTimeout(1000)
}

export const exportProject = async (window, expect, projectname) => {
  expect(await window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.first().locator('[aria-label=unstar-project]')).toBeVisible()
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.waitForTimeout(1000)
      await window.locator('.pl-5 > div > div').click()
      await window.locator('//*[@aria-label="export-project"]').click()
      await expect(window.locator('input[name="location"]')).toBeVisible()
      await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
      await window.locator('//*[@aria-label="project-export"]').click()
      await window.waitForTimeout(2000)
      const notifyMe = await window.locator('//*[@id="__next"]/div[2]/div').isVisible()
      expect(await notifyMe === true)
      expect(await rows.count()).toBe(4)
      await window.locator('[aria-label=unstar-arrow-up]').click()
    }
  }

}

export const archivedProjects = async (window, expect, projectname) => {
  await expect(await window.locator('//*[@id="projects-list"]')).toBeVisible()
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
      await window.locator('//*[@aria-label="archive-project"]').click()
      expect(await rows.count()).toBe(4)
      await window.locator('//*[@aria-label="archive-active-button"]').click()
      const title = await window.locator('//*[@aria-label="projects"]').textContent()
      expect(await title).toBe("Archived projects")
      const projectName = await window.innerText(`//div[@id="${projectname}"]`)
      expect(projectName).toBe(projectname);
    }
  }
  await window.locator('//*[@aria-label="archive-active-button"]').click()
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
}

export const unarchivedProjects = async (window, expect, projectname) => {
  await window.locator('//*[@aria-label="archive-active-button"]').click()
  await expect(await window.locator('//*[@id="projects-list"]')).toBeVisible()
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
      await window.locator('//*[@aria-label="archive-project"]').click()
      await window.waitForTimeout(500)
      expect(await rows.count()).toBe(0)
      const title = await window.locator('//*[@aria-label="projects"]').textContent()
      expect(await title).toBe("Archived projects")
    }
  }
  await window.locator('//*[@aria-label="archive-active-button"]').click()
  const title = await window.textContent('[aria-label=projects]', { timeout: 10000 });
  expect(title).toBe('Projects');
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



export const projectTargetLanguage = async (window, expect, projectName, searchLangauge, selectLanguage) => {
  await goToEditProject(window, expect, projectName)
  expect(await window.locator('//*[@aria-label="custom-dropdown"]')).toBeVisible()
  await window.locator('//*[@aria-label="custom-dropdown"]').fill(searchLangauge)
  await window.locator(`//*[@aria-label="${selectLanguage}"]`).click()
  await expect(window.locator('//button[@aria-label="save-edit-project"]')).toBeVisible()
  await window.locator('//button[@aria-label="save-edit-project"]').click()
  await window.waitForTimeout(2000)
  expect(await window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
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

export const userProfileValidaiton = async (window, expect) => {
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
  await window.locator('//*[@id="save-profile"]').click()
  const firstLastNameError = await window.textContent('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[2]/span')
  expect(await firstLastNameError).toBe('The input has to be between 2 and 15 characters long')
  const emailError = await window.textContent('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[3]/span')
  expect(await emailError).toBe('Email is not valid!')
  const organizationError = await window.textContent('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[4]/span')
  expect(await organizationError).toBe('The input has to be between 2 and 30 characters long')
  const regionError = await window.textContent('//*[@id="__next"]/div[1]/div[2]/div/div[2]/form/div[5]/span')
  expect(await regionError).toBe('The input has to be between 2 and 15 characters long')
}

export const signOut = async (window, expect) => {
  expect(await window.locator('//*[@id="user-profile"]')).toBeVisible()
  await window.locator('//*[@id="user-profile"]').click()
  expect(await window.locator('//*[@aria-label="signout"]')).toBeVisible()
  await window.locator('//*[@aria-label="signout"]').click()
  await window.waitForTimeout(1000)
  const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
  await expect(welcome).toBe("Welcome!")

}

export const showActiveUsers = async (window, expect) => {
  expect(await window.locator('//*[@id="view-more"]')).toBeVisible()
  await window.locator('//*[@id="view-more"]').click()
  const active = await window.locator('//*[@id="active-tab"]').textContent()
  expect(await active).toBe("Active")
}