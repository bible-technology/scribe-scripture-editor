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
export const createUserValidation = async (window, expect) => {
  await window.getByRole('button', { name: 'Create New Account' }).click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await window.getByPlaceholder('Username').fill('jo')
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
  await window.getByRole('link', { name: 'new' }).click()
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
  await window.getByRole('button', { name: "notification-button" }).click()
  const title = await window.innerText('[aria-label=notification-title]');
  expect(title).toBe('NOTIFICATIONS');
  await window.getByRole('button', { name: "close-notification" }).click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
}

export const goToProjectPage = async (window, expect) => {
  await window.getByRole('button', { name: "Back" }).click();
  const title = await window.textContent('[aria-label=projects]', {timeout:10000});
  expect(title).toBe('Projects');
  await window.waitForTimeout(1000)
}

export const exportProject = async(window, expect, projectname) => {
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
      await window.getByRole('menuitem', {name: "Export"}).click()
      await expect(window.locator('input[name="location"]')).toBeVisible()
      await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
      await window.getByRole('button', {name: "Export"}).click()
      await window.waitForTimeout(2000)
      const notifyMe = await window.locator('//*[@id="__next"]/div[2]/div').isVisible()
      expect(await notifyMe === true)
      expect(await rows.count()).toBe(4)
      await window.locator('[aria-label=unstar-arrow-up]').click()
    }
  }

}

export const archivedProjects = async (window, expect, projectname) => {
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
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
      await window.getByRole('menuitem', { name: 'Archive' }).click()
      expect(await rows.count()).toBe(4)
      await window.getByRole('button', { name: 'Archived' }).click()
      const projectName = await window.innerText(`//div[@id="${projectname}"]`)
      expect(projectName).toBe(projectname);
      await window.getByRole('button', { name: 'Active' }).click()
      const title = await window.textContent('[aria-label=projects]', {timeout:10000});
      expect(title).toBe('Projects');
    }
  }
}

export const unarchivedProjects = async (window, expect, projectname) => {
  await window.getByRole('button', { name: 'Archived' }).click()
  await expect(window.locator('//*[@id="projects-list"]')).toBeVisible()
  const table = window.locator('//*[@id="projects-list"]')
  const body = table.locator('//*[@id="projects-list-unstar"]')
  const rows = await body.locator('tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = await rows.nth(i);
    const tds = await row.locator('td');
    if (await tds.nth(1).textContent() === projectname) {
      expect(await tds.first().locator('[aria-label=unstar-project]')).toBeVisible()
      await tds.last().locator('[aria-label=unstar-expand-project]').click()
      await window.locator('.pl-5 > div > div').click({timeout:4000})
      await window.getByRole('menuitem', { name: 'Restore' }).click()
      expect(await rows.count()).toBe(2)
      const title = await window.getByLabel('projects').textContent()
      expect(await title).toBe("Archived projects")
    }
  }
  await window.getByRole('button', { name: 'Active' }).click()
  const title = await window.textContent('[aria-label=projects]', {timeout:10000} );
  expect(title).toBe('Projects');
}