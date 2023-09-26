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

///function for creating a project for obs and audio
export const createProjects = async (window, expect, projectname, type, description, abb) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.getByRole('link', { name: 'new' }).click()
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible()
  await window.locator('//button[@aria-label="open-popover"]').click()
  await expect(window.locator(`//a[@data-id="${type}"]`)).toBeVisible()
  await window.locator(`//a[@data-id="${type}"]`).click()
  ////checking for create project validation
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