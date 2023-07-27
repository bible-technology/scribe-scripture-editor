// @ts-check

import { removeUser } from '../renderer/src/core/Login/removeUser';
import { test, expect} from './myFixtures';



const fs = require('fs');
const { _electron: electron,chromium } = require('playwright');


let electronApp;
let window;

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
        window = await electronApp.firstWindow();
        expect(await window.title()).toBe('Scribe Scripture');
  });

     // Extend timeout for all tests running this hook by 30 seconds.
  // test.beforeEach(async ({ page }, testInfo) => {
  //   testInfo.setTimeout(testInfo.timeout + 30000);
  // });
  test.afterEach(async ({ page }, testInfo) => {
      console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
    
      if (testInfo.status !== testInfo.expectedStatus)
        console.log(`Did not run as expected, ended up at ${page.url()}`);
  });

  test.afterAll(async() => {
      await electronApp.close();
  });  

test('Start from the new user', async ({userName}) => {
  await window.getByRole('button', {name: 'Create New Account'}).click()
  await expect(window.locator('//input[@placeholder="Username"]')).toBeVisible()
  await expect(window.locator('//button[@type="submit"]')).toBeVisible()
  await window.getByPlaceholder('Username').fill(userName)
  await window.click('[type=submit]');
  await window.waitForTimeout(2000)
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});


// // // // /* Translation Project    */
test('Create and Check the text translation project in the projects list page', async ({textProject}) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.getByRole('link', {name : 'new'}).click()
  await window.waitForTimeout(9000) 
  await expect(window.locator('//h1[@aria-label="projects"]')).toBeVisible()
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await expect(window.locator('//button[@id="open-advancesettings"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(textProject)
  await window.locator('//textarea[@id="project_description"]').fill('test description')
  await window.locator('//input[@id="version_abbreviated"]').fill('ttp')
  await window.locator('//button[@id="open-advancesettings"]').click()
  await expect(window.locator('//div[@aria-label="new-testament"]')).toBeVisible()
  await window.locator('//div[@aria-label="new-testament"]').click()
  await window.locator('//button[contains(text(),"Ok")]').click()
  await window.locator('//button[@aria-label="create"]').click()
  await window.waitForTimeout(5000)
  const projectName = await window.innerText('//div[@id="Translation test project"]')
  expect(projectName).toBe(textProject);

});



test('Search a text project in all projects list', async ({textProject}) => {
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill('translation')
  const projectname = await window.innerText(
  '[id="Translation test project"]',
  );
  expect(projectname).toBe(textProject);
});


test('Click on a project to open the editor page for text Translation', async ({textProject}) => {
  test.setTimeout(30000)
  await window.click(`id=${textProject}`);
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the text Translation project name', async ({textProject}) => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe(textProject.toUpperCase());
});

test('Check text Translation project Notifications', async () => {
    await window.getByRole('button', {name: "notification-button"}).click()
    const title = await window.innerText('[aria-label=notification-title]');
    expect(title).toBe('NOTIFICATIONS');
    await window.getByRole('button', {name: "close-notification"}).click()
    const editorpane = await window.innerText('[aria-label=editor-pane]');
    expect(editorpane).toBe('EDITOR');
});

test('About and Licence of textTranslation Scribe Scripture', async () => {
  await window.click('[aria-label=about-button]');
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.click('[aria-label=close-about]');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});


test('Return to the projects page', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Update/Edit the text translation project description along with abbreviated', async ({textProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === textProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('[aria-label=unstar-menu-project]').click()
        await window.getByRole('menuitem', {name: "edit-project"}).click()
        const text = await window.innerText('//*[@id="__next"]/div/div[2]/header/div/div[1]/div/h1')
        await expect(text).toBe('EDIT PROJECT')
        const description = await window.textContent('//textarea[@id="project_description"]')
        await expect(description).toBe('test description')
        await window.locator('//textarea[@id="project_description"]').fill('edit test version')
        const editDescription = await window.textContent('//textarea[@id="project_description"]')
        await expect(editDescription).toBe('edit test version')
        await window.locator('input[name="version_abbreviated"]').fill('tvs')
        await expect(window.locator('//button[@aria-label="save-edit-project"]')).toBeVisible()
        await window.locator('//button[@aria-label="save-edit-project"]').click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects')
      }
    }
  }
})


// // ///Obs translation project
test('Check and create the obs urdu project in project list', async ({obsProject}) => {
  await expect(window.locator('//a[@aria-label="new"]')).toBeVisible()
  await window.locator('//a[@aria-label="new"]').click()
  await expect(window.locator('//h1[@aria-label="projects"]')).toBeVisible()
  await expect(window.locator('//button[@aria-label="open-popover"]')).toBeVisible()
  await window.locator('//button[@aria-label="open-popover"]').click()
  await expect(window.locator('//a[@data-id="OBS"]')).toBeVisible()
  await window.locator('//a[@data-id="OBS"]').click()
  await expect(window.locator('//input[@id="project_name"]')).toBeVisible()
  await expect(window.locator('//textarea[@id="project_description"]')).toBeVisible()
  await expect(window.locator('//input[@id="version_abbreviated"]')).toBeVisible()
  await window.locator('//input[@id="project_name"]').fill(obsProject)
  await window.locator('//textarea[@id="project_description"]').fill('test description')
  await window.locator('//input[@id="version_abbreviated"]').fill('ttp')
  await expect(window.locator('//input[@placeholder="Select Language"]')).toBeVisible()
  await window.locator('//input[@placeholder="Select Language"]').fill("Persian")
  await window.getByRole('option', {name:"Persian (Farsi) (fa)"}).click()
  await expect(window.locator('//button[@aria-label="create"]')).toBeVisible()
  await window.locator('//button[@aria-label="create"]').click()
  const projectName = await window.innerText('//div[@id="Obs test project"]')
  expect(projectName).toBe(obsProject);
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})

test('Search an obs project in all projects list', async ({obsProject}) => {
  await expect(window.locator('//input[@id="search_box"]')).toBeVisible()
  await window.locator('//input[@id="search_box"]').fill('obs')
  const projectname = await window.innerText(
  '[id="Obs test project"]'
  );
  expect(projectname).toBe(obsProject);
});

test('Click on an obs project to open the editor page', async ({obsProject}) => {
  await window.click(`id=${obsProject}`);
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the obs project name', async ({obsProject}) => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe(obsProject.toUpperCase());
});

test('Check obs project Notifications', async () => {
    await window.getByRole('button', {name: "notification-button"}).click()
    const title = await window.innerText('[aria-label=notification-title]');
    expect(title).toBe('NOTIFICATIONS');
    await window.getByRole('button', {name: "close-notification"}).click()
    const editorpane = await window.innerText('[aria-label=editor-pane]');
    expect(editorpane).toBe('EDITOR');
});

test('About and Licence of obs Scribe Scripture', async () => {
  await window.click('[aria-label=about-button]');
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.click('[aria-label=close-about]');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Edit the obs editor heading title ', async () => {
  await expect(window.locator('//textarea[@data-id="1"]')).toBeVisible()
  await window.locator('//textarea[@data-id="1"]').fill('1. The Creation edited')
  const title = await window.textContent('//textarea[@data-id="1"]')
  expect(title).toBe('1. The Creation edited');
});

test('Add content in verses 1 and 2 in the obs story 1 editor.', async () => {
  await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
  const verse2 = await window.textContent('div:nth-child(2) > .flex-grow')
  expect(verse2).toBe('god created heavens and earth');
  const verse3 = await window.textContent('div:nth-child(3) > .flex-grow')
  expect(verse3).toBe('story content added in verse 3');
});

test('Increase the font size of the obs editor', async ({obsProject}) => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
  const div = await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]')
  const fontSize = await div.evaluate((ele) => {
    console.log(ele, 'ele')
    return window.getComputedStyle(ele).getPropertyValue('font-size')

  })
    expect(fontSize).toBe('22.4px');
});

test('Decrease the font size of the obs editor', async ({obsProject}) => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
  const div = await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]')
  const fontSize = await div.evaluate((ele) => {
    console.log(ele, 'ele')
    return window.getComputedStyle(ele).getPropertyValue('font-size')

  })
    expect(fontSize).toBe('16px');
});


test('Change the obs navigation story  from 1 to 12 and edit the title', async () => {
  await expect(window.locator('//*[@id="__next"]/main/div/div[3]/div[1]/div[1]/div/span[2]')).toBeVisible() 
  await window.locator('//*[@id="__next"]/main/div/div[3]/div[1]/div[1]/div/span[2]').click()
  await window.getByRole('button', {name:"12"}).click();
  await expect(window.locator('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea')).toBeVisible()
  await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea').fill('12. The Exodus Edit title')
  const title = await window.textContent('//*[@id="__next"]/main/div/div[3]/div[2]/div[1]/textarea')
  expect(title).toBe('12. The Exodus Edit title');
});

test('Change the OBS font-family default to aakar', async () => {
  await expect(window.locator('//button[@aria-label="select-menu-file"]')).toBeVisible()
  await window.locator('//button[@aria-label="select-menu-file"]').click()
  await expect(window.locator('//button[@aria-label="selected-font"]')).toBeVisible()
  const defaultFont = await window.textContent('//button[@aria-label="selected-font"]')
  expect(defaultFont).toBe('sans-serif')
  await window.locator('//button[@aria-label="selected-font"]').click()
  await window.getByRole('option', {name: "aakar"}).click()
  const div = await window.locator('//*[@id="__next"]/main/div/div[3]/div[2]')
  const fontFamily = await div.evaluate((ele) => {
    console.log(ele, 'ele')
    return window.getComputedStyle(ele).getPropertyValue('font-family')
  })
  expect(fontFamily).toBe('aakar');
});
});
