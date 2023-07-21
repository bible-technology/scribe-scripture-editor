// @ts-check

import { removeUser } from '../renderer/src/core/Login/removeUser';
import { test, expect } from './myFixtures';



const fs = require('fs');
const { _electron: electron,chromium } = require('playwright');


let electronApp;
let window;

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
      const appPath = await electronApp.evaluate(async ({ app }) => {
        // This runs in the main Electron process, parameter here is always
        // the result of the require('electron') in the main app script.
        return app.getAppPath();
      });
      console.log(appPath);
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

test('Create a new user and Navigate the projects page', async ({userName}) => {
  await window.getByRole('button', {name: 'Create New Account'}).click()
  await window.getByPlaceholder('Username').fill(userName)
  await window.click('[type=submit]');
  await window.waitForTimeout(2000)
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});


// // /* Translation Project    */
test('Click New and Fill translation project page details to create a new project', async ({textProject}) => {
  await window.getByRole('link', {name : 'new'}).click()
  await window.waitForTimeout(2000) 
  await window.fill('#project_name', textProject);
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'ttp');
  await window.click('#open-advancesettings');
  await window.click('[aria-label=new-testament]');
  await window.click('[aria-label=close-custombiblenavigation]');
  await window.click('[aria-label=create]');
  await window.waitForTimeout(5000) 

});

// // test('Click user and Navigate all the projects', async () => {
// // 	await window.getByRole('button', {name: "playwright user"}).click()
// // 	const title = await window.textContent('[aria-label=projects]');
// // 	expect(title).toBe('Projects');
// // });
test('Star text project', async ({textProject}) => {
      const table =  window.locator('table#tablelayout')
      const headers = table.locator('thead')
      console.log(await headers.allTextContents());

      const rows = table.locator('tbody tr')
      for (let i = 0; i < await rows.count(); i++) {
        const row = rows.nth(i);
        const tds = row.locator('td');
        for (let j = 0; j < await tds.count(); j++) {
          if (await tds.nth(j).textContent() === textProject) {
            console.log(await tds.nth(1).textContent())
            await tds.first().locator('[aria-label=unstar-project]').click()
          }

        }

      }
});

test('Untar text project', async ({textProject}) => {
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
          await tds.first().locator('[aria-label=star-project]').click()
        }
      }
    }
});

test('Search a text project in all projects list', async ({textProject}) => {
  test.slow()
  await window.fill('#search_box', 'translation');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe(textProject);
});

test('Click on a project to open the editor page for text Translation', async ({textProject}) => {
  await window.click(`id=${textProject}`);
  test.setTimeout(60*1000)
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the text Translation project name', async ({textProject}) => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe(textProject.toUpperCase());
});

test('Increase the font size of the text Translation project', async ({textProject}) => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
  const projectname = await window.innerText(
    '[aria-label=editor-project-name]',
    );
    expect(projectname).toBe(textProject.toUpperCase());
});

test('Decrease the font size the text Translation project', async ({textProject}) => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
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
});

test('About and Licence of textTranslation Scribe Scripture', async () => {
  await window.click('[aria-label=about-button]');
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.click('[aria-label=close-about]');
});

test('Write the full name of the MAT book in the text Translation project', async () => {
  await window.locator('p:has-text("MAT")').fill("MATTHEW")
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
        await window.getByText('test version').fill('edit test version')
        await window.locator('input[name="version_abbreviated"]').fill('tvs')
        await window.getByRole('button', {name:"save-edit-project"}).click();
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects')
      }
    }
  }
})


// // ///Obs translation project
test('Click New and Fill in the OBS project page details to create urdu project.', async ({obsProject}) => {
  await window.getByRole('link', {name: 'new'}).click()
  await window.click('[aria-label=open-popover]')
  await window.getByRole('link', {name: 'OBS'}).click()
  await window.fill('#project_name', obsProject);
  await window.fill('#project_description', 'test version');
  await window.getByPlaceholder('Select Language').fill('Persian')
  await window.click('[aria-label=create]');
})

test('Star the obs project', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=unstar-project]').click()
      }
    }
  }
});

test('Unstar the obs project', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
  const row = rows.nth(i);
  const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=star-project]').click()
      }
    }
  }
});

test('Search an obs project in all projects list', async ({obsProject}) => {
  await window.fill('#search_box', 'obs');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe(obsProject);
});

test('Click on an obs project to open the editor page for the obs project', async ({obsProject}) => {
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

test('Increase the font size of the obs project', async ({obsProject}) => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
  const projectname = await window.innerText(
    '[aria-label=editor-project-name]',
    );
    expect(projectname).toBe(obsProject.toUpperCase());
});

test('Decrease the font size of the obs project.', async ({obsProject}) => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
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

});

test('About and Licence of obs Scribe Scripture', async () => {
  await window.click('[aria-label=about-button]');
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.click('[aria-label=close-about]');
});

test('Edit the obs editor heading title ', async () => {
  await window.getByText('1. The Creation').fill("1. The Creation edit");
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Add content in verses 1 and 2 in the obs story 1 editor.', async () => {
  await window.locator('div:nth-child(2) > .flex-grow').fill("god created heavens and earth");
  await window.locator('div:nth-child(3) > .flex-grow').fill("story content added in verse 3");
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Change the obs navigation story  from 1 to 12 and edit the title', async () => {
  await window.getByRole('button', {name:"obs-navigation"}).click();
  await window.getByRole('button', {name:"12"}).click();
  await window.getByText('12. The Exodus').fill("12. The Exodus edit");
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Lock/Unlock the OBS editor', async () => {
  await window.click('[aria-label=close-lock]');
  await window.click('[aria-label=open-lock]');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Change the OBS font-family', async () => {
  await window.getByRole('button', {name: "select-menu-file"}).click()
  await window.getByRole('none', {name: "selected-font"}).click()
  await window.getByRole('option', {name: "aakar"}).click()  
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
});

test('Return to the projects page to see all projects have been created.', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Update/Edit the obs project description along with abbreviated', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('[aria-label=unstar-menu-project]').click()
        await window.getByRole('menuitem', {name: "edit-project"}).click()
        await window.getByText('test version').fill('edit test version for obs')
        await window.locator('input[name="version_abbreviated"]').fill('ep')
        await window.getByRole('button', {name:"save-edit-project"}).click();
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
})


// // /////Audio project
test('Click New and Fill in the audio project page details to create a new project.', async ({audioProject}) => {
  await window.getByRole('link', {name: 'new'}).click()
  await window.click('[aria-label=open-popover]')
  await window.getByRole('link', {name: 'Audio'}).click()
  await window.fill('#project_name', audioProject);
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'atp');
  await window.click('#open-advancesettings');
  await window.click('[aria-label=new-testament]');
  await window.click('[aria-label=close-custombiblenavigation]');
  await window.click('[aria-label=create]');
})

test('Star the audio project', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === audioProject) {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=unstar-project]').click()
      }
    }
  }
});

test('Untar the audio project', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === audioProject) {
      console.log(await tds.nth(1).textContent())
      await tds.first().locator('[aria-label=star-project]').click()
      }
    }
  }

});

test('Search an audio project in all projects list  ', async ({audioProject}) => {
  await window.fill('#search_box', 'audio');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe(audioProject);
});

test('Click on an audio project to open the editor page for the audio editor', async ({audioProject}) => {
  await window.click(`id=${audioProject}`);
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the audio project name', async ({audioProject}) => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe(audioProject.toUpperCase());
});

test('Increase the font size of the audio project', async ({audioProject}) => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
  const projectname = await window.innerText(
    '[aria-label=editor-project-name]',
    );
    expect(projectname).toBe(audioProject.toUpperCase());
});

test('Decrease the font size of the audio project', async ({audioProject}) => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
  const projectname = await window.innerText(
    '[aria-label=editor-project-name]',
    );
    expect(projectname).toBe(audioProject.toUpperCase());
});

test('Check Audio projects Notifications', async () => {
  await window.getByRole('button', {name: "notification-button"}).click()
  const title = await window.innerText('[aria-label=notification-title]');
  expect(title).toBe('NOTIFICATIONS');
  await window.getByRole('button', {name: "close-notification"}).click()

});

test('About and Licence of audio Scribe Scripture', async () => {
  await window.getByRole('button', {name: "about-button"}).click()
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.getByRole('button', {name: "license-button"}).click()
  await window.getByRole('button', {name: "close-about"}).click()
});

test('Check the bookmarks of an audio project and close', async () => {
  await window.getByRole('button', {name: "select-menu-file"}).click()
  await window.getByRole('button', {name: "select-bookmarks"}).click()
  await window.getByRole('button', {name: "close-button"}).click()    
});

test('Lock/Unlock the audio editor', async () => {
  await window.getByRole('button', {name: "select-menu-file"}).click()
  await window.getByRole('none', {name: "selected-font"}).click()
  await window.getByRole('option', {name: "aakar"}).click()  
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
});

test('Increase/Decrease the volume of the audio verse 1', async () => {
    await window.getByRole('button', {name: "1"}).first().click();
  // await window.locator('div:nth-child(4) > div:nth-child(2) > .p-2').first().click()
  //decrease volume
  await window.locator('div:nth-child(4) > div:nth-child(5) > .flex > button').first().click()
  await window.locator('div:nth-child(4) > div:nth-child(5) > .flex > button').first().click()
  await window.waitForTimeout(1000)

  // increase volume
  await window.locator('.flex > button:nth-child(3)').first().click()
  await window.locator('.flex > button:nth-child(3)').first().click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
})

test('Return and see created projects in projects page', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Update/Edit the audio project description along with abbreviated', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === audioProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('[aria-label=unstar-menu-project]').click()
        await window.getByRole('menuitem', {name: "edit-project"}).click()
        await window.getByText('test version').fill('edit test version for audio')
        await window.locator('input[name="version_abbreviated"]').fill('ep')
        await window.getByRole('button', {name:"save-edit-project"}).click();
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }

})


// ///////Export all the project
test('Export the text Translation project in Downloads folder', async ({textProject}) => {
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
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Export"}).click()
        await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
        await window.getByRole('button', {name: "Export"}).click()
        await window.waitForTimeout(1000)
        await window.locator('[aria-label=unstar-arrow-up]').click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
})

test('Export the obs project in the Downloads folder', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Export"}).click()
        await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
        await window.getByRole('button', {name: "Export"}).click()
        await window.locator('[aria-label=unstar-arrow-up]').click()
        await window.waitForTimeout(1000)
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
})

test('Export the audio project in the Downloads folder', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
        if (await tds.nth(j).textContent() === audioProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Export"}).click()
        await window.locator('input[name="location"]').fill('/home/bobby/Downloads')
        await window.getByRole('button', {name: "Export"}).click()
        await window.locator('[aria-label=unstar-arrow-up]').click()
        await window.waitForTimeout(1000)
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
})


//////Archive projects
//////texttranslation
test('Archive the text Translation project', async ({textProject}) => {
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
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Archive"}).click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
});

/////OBS
test('Archive the obs project', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Archive"}).click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
});

//////audio
test('Archive the audio project', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === audioProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Archive"}).click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }
});

///Restore the project from archived
test('Restore the text Translation project from the archive tab and return to the projects', async ({textProject}) => {
  await window.getByRole('button', {name: "Archived"}).click()
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
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Restore"}).click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Archived Projects');
      }
    }
  }
});

test('Restore the obs project from the archive tab and return to the projects', async ({obsProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === obsProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Restore"}).click()
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Archived Projects');
      }
    }
  }
});

test('Restore the audio project from the archive tab and return to the projects', async ({audioProject}) => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === audioProject) {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('.pl-5 > div > div').click()
        await window.getByRole('menuitem', {name: "Restore"}).click()
        await window.getByRole('button', {name: 'Active'}).click()

        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }

  }
});

////////SYNC
test('Click the Sync button and login door43 the page ', async ({doorUser, doorPassword}) => {
  await window.getByRole('link', {name: 'sync'}).click()
  await window.locator('[data-test="username-input"]').getByRole('textbox').fill(doorUser)
  await window.locator('[data-test="password-input"]').getByRole('textbox').fill(doorPassword)
  await window.getByLabel('Keep me logged in').check()
  await window.locator('[data-test="submit-button"]').click()
  await window.waitForTimeout(5000) 
  const title = await window.textContent('div.flex.justify-between.items-center > span.font-semibold')
  expect(title).toBe("Sync")
})

test('Taking a pull from git.door43.org and offline sync project from user benz', async ({syncName}) => {
  await window.getByLabel('Owner').fill('benz')
  await window.getByRole('button', { name: `en-textStories-${syncName} Benz/en-textStories-${syncName}` }).click()
  await window.waitForTimeout(4000)
  await window.getByRole('button', { name: 'Offline Sync' }).click()
  await window.waitForTimeout(5000)
  await window.getByRole('link', {name: 'projectList'}).click()
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
  
})

test('Click on a sync project download from the sync page and open it in the editor', async ({syncName}) => {
  await window.click(`id=${syncName}`)
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Push new text translation project in git.door43.org.', async ({textProject, doorUser, doorPassword}) => {
  await window.getByRole('link', {name: 'sync'}).click()
  await window.locator('[data-test="username-input"]').getByRole('textbox').fill(doorUser)
  await window.locator('[data-test="password-input"]').getByRole('textbox').fill(doorPassword)
  await window.getByLabel('Keep me logged in').check()
  await window.locator('[data-test="submit-button"]').click()
  await window.waitForTimeout(3000) 
  await window.getByRole('button', { name: `${textProject} -` }).click()
  await window.getByRole('button', { name: 'Cloud Sync' }).click()
  await window.waitForTimeout(5000) 
  const title = await window.textContent('div.flex.justify-between.items-center > span.font-semibold')
  expect(title).toBe("Sync")
})

test('Push new obs project in git.door43.org.', async ({obsProject, doorUser, doorPassword}) => {
  await window.getByRole('button', { name: `${obsProject} -` }).click()
  await window.getByRole('button', { name: 'Cloud Sync' }).click()
  await window.waitForTimeout(5000) 
  const title = await window.textContent('div.flex.justify-between.items-center > span.font-semibold')
  expect(title).toBe("Sync")
})


/////update the user profile
test('Update user profile', async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Your Profile"}).click()
  await window.locator('input[name="given-name"]').fill('Bobby')
  await window.locator('input[name="family-name"]').fill('kumar')
  await window.locator('input[name="email"]').fill('kumar@gmal.com')
  await window.locator('input[name="organization"]').fill('vidya')
  await window.locator('input[name="selectedregion"]').fill('india')
  await window.getByRole('button', {name: "Save"}).click()
});

test("Update the app language for the user from English to Hindi and then Hindi to English.", async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Your Profile"}).click()
  await window.getByRole('button', {name: "English"}).click()
  await window.getByRole('option', {name: "Hindi"}).click()
  await window.getByRole('button', {name: "Save"}).click()
  await window.getByRole('button', {name: "Hindi"}).click()
  await window.getByRole('option', {name: "English"}).click()
  await window.getByRole('button', {name: "सहेजें"}).click()
})

test('Sign out and return to the Scribe scripture app', async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Sign out"}).click()
  expect(await window.title()).toBe('Scribe Scripture');
});


////Login page
test('Click the View More button, see active users in the tab, and click See the project.',async ({userName}) => {
  await window.getByRole('button', {name: "View More"}).click()
  const active = await window.getByRole('tab').allInnerTexts()
  expect(active[0]).toBe('Active')
  await window.getByRole('tabpanel', {name: "Active"}).getByRole("button", {name: userName}).click()
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
})

test('Sign out return app', async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Sign out"}).click()
  expect(await window.title()).toBe('Scribe Scripture');
});

test('Delete the user from the active tab',async () => {
  await window.getByRole('button', {name: "View More"}).click()
  await window.getByRole('tabpanel', {name: "Active"}).locator('button').click()
  const active = await window.getByRole('tab').allInnerTexts()
  expect(active[0]).toBe('Active')
})

test('Restore the deleted user from Archive tab',async () => {
  // await window.getByRole('button', {name: "View More"}).click()
  await window.getByRole('tab', {name: "Archived"}).click()
  await window.getByRole('tabpanel', {name: "Archived"}).locator('button').click()
  const archive = await window.getByRole('tab').allInnerTexts()
  expect(archive[1]).toBe('Archived')
})

test("Deleting all the created repository from git.door43.org", async ({textProject, obsProject, doorUser, doorPassword, flavorText, flavorObs, textUnderscore, obsUnderscore}) => {
  await window.goto("https://git.door43.org/")
  await window.getByRole('link', { name: 'Sign In' }).click()
  await window.getByLabel('Username or Email Address').fill(doorUser);
  await window.getByLabel('Password').fill(doorPassword);
  await window.getByRole('button', { name: 'Sign In' }).click();
  await window.getByRole('link', { name: `${doorUser}/en-${flavorText}-${textUnderscore} 0` }).click()
  await window.getByRole('link', { name: 'Settings' }).click()
  await window.getByRole('button', { name: 'Delete This Repository' }).click()
  await window.locator('#delete-repo-modal #repo_name').fill(`en-${flavorText}-${textUnderscore}`)
  await window.getByRole('button', { name: 'Delete Repository' }).click()
  await window.getByRole('link', { name: 'Dashboard' }).click()
  await window.getByRole('link', { name: `${doorUser}/en-${flavorObs}-${obsUnderscore} 0` }).click()
  await window.getByRole('link', { name: 'Settings' }).click()
  await window.getByRole('button', { name: 'Delete This Repository' }).click()
  await window.locator('#delete-repo-modal #repo_name').fill(`en-${flavorObs}-${obsUnderscore}`)
  await window.getByRole('button', { name: 'Delete Repository' }).click()
})

// test('Delete user from the json and and created project', async ({userName}) => {
//   // const path = require('path')
//   const local = await window.evaluate(() => JSON.stringify(window.localStorage));
//   const newpath = JSON.parse(local)
//   // const getKey = Object.keys(path)
//   // const newPath = getKey[1]
//   const path = require('path');
//   const fs = require('fs')
//   const folder = path.join(local, packageInfo.name, 'users', `${userName}`);
//   const file = path.join(local, packageInfo.name, 'users', 'users.json');
//   if (fs.existsSync(folder)) {
//     await fs.rmdir(folder, (err) => {
//       if (err) { throw err; }
//       logger.error('users.json', 'Directory removed');
//     });
//   logger.error('users.json', 'removing data from json');
//   const data = await fs.readFileSync(file);
//   const json = JSON.parse(data);
//   const filtered = json.filter((item) => item.username.toLowerCase() !== userName.toLowerCase())
//   await fs.writeFileSync(file, JSON.stringify(json));
//   return filtered;
//   }
//   // console.log(getKey[1], 'local')
// })

});
