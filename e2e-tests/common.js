export const checkLogInOrNot = async(window, expect, userName) => {
  const textVisble = await window.locator('//h1["@aria-label=projects"]', {timeout:3000}).isVisible()
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
  const filtered = json.filter((item) =>
        item.username.toLowerCase() !== name.toLowerCase()
      )
    return filtered
  } 

export const commonJson = async(window, userName, packageInfo, fs) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const path = require('path');
  const file = path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  return JSON.parse(data);
}

export const commonFolder = async (window, userName, packageInfo) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const path = require('path');
  return path.join(newpath.userPath, packageInfo.name, 'users', userName.toLowerCase())
}

export const commonFile = async (window, packageInfo) => {
  const newpath = await window.evaluate(() => Object.assign({}, window.localStorage))
  const path = require('path');
  return path.join(newpath.userPath, packageInfo.name, 'users', 'users.json');
}

export const removeFolderAndFile = async (fs, folder, userName, json, file) => {
  fs.rmSync(folder, { recursive: true, force: true })
  const filtered = json.filter((item) =>
  item.username.toLowerCase() !== userName.toLowerCase()
)
  return await fs.writeFileSync(file, JSON.stringify(filtered))
}