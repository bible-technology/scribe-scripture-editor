export const checkLogInOrNot = async(window, expect, userName) => {
  const textVisble = await window.locator('//h1["@aria-label=projects"]', {timeout:3000}).isVisible()
  if (textVisble) {
    const title = await window.textContent('[aria-label=projects]')
    console.log('app is Logged In')
    await expect(title).toBe('Projects')

  } else {
    const welcome = await window.textContent('//*[@id="__next"]/div/div[1]/div/h2')
    console.log('app is not Logged In')
    await expect(welcome).toBe("Welcome!")
  }
  return textVisble;
}

export const filterUser = (json, name) => {
  const filtered = json.filter((item) =>
        item.username.toLowerCase() !== name.toLowerCase()
      )
    return filtered
  } 