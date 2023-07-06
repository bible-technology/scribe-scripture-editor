// @ts-check

// import { _electron as electron } from 'playwright';
import { removeUser } from '../renderer/src/core/Login/removeUser';
import { test, expect } from '@playwright/test';

const fs = require('fs');
const { _electron: electron } = require('playwright');

let electronApp;
let appPath;
let window;

test.describe('Scribe scripture editor', async() => {
  test.beforeAll(async() => {
      electronApp = await electron.launch({ args: ['main/index.js']} );
      window = await electronApp.firstWindow();
      expect(await window.title()).toBe('Scribe Scripture');
  });

  // test.afterEach(async ({ page }, testInfo) => {
  //     console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
    
  //     if (testInfo.status !== testInfo.expectedStatus)
  //       console.log(`Did not run as expected, ended up at ${page.url()}`);
  // });

  test.afterAll(async() => {
      await electronApp.close();
  });

test('Create a new user and Navigate the projects page', async () => {
  await window.getByRole('button', {name: 'Create New Account'}).click()
  await window.getByPlaceholder('Username').fill('playwright user')
  await window.click('[type=submit]');
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

/* Translation Project    */
test('Click New and Fill translation project page details to create a new project', async () => {
  await window.getByRole('link', {name : 'new'}).click()
  await window.fill('#project_name', 'translation project');
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'tv');
  await window.click('#open-advancesettings');
  await window.click('[aria-label=new-testament]');
  await window.click('[aria-label=close-custombiblenavigation]');
  await window.click('[aria-label=create]');
});

// test('Click user and Navigate projects', async () => {
// 	await window.getByRole('button', {name: "playwright user"}).click()
// 	const title = await window.textContent('[aria-label=projects]');
// 	expect(title).toBe('Projects');
// });


test('Star the project', async () => {
  await window.getByRole('button', {name: 'unstar-project', exact:true}).click()
  const projectname = await window.innerText(
    '[aria-label=unstar-project-name]',
    );
    expect(projectname).toBe('translation project');
});

test('Untar the project', async () => {
  await window.getByRole('button', {name: 'star-project', exact:true}).click()
  const projectname = await window.innerText(
    '[aria-label=unstar-project-name]',
    );
    expect(projectname).toBe('translation project');
});

test('Search and test translation for resulting project', async () => {
  await window.fill('#search_box', 'translation');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe('translation project');
});

test('Click on a project to open the editor page for textTranslation', async () => {
  await window.click('id=translation project');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check textTranslation project name', async () => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe('TRANSLATION PROJECT');
});

test('Increase font size of textTranslation project', async () => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
});

test('Decrease font size textTranslation project', async () => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
});

test('Check textTranslation project Notifications', async () => {
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

test('Write full name book MAT of textTranslation Scribe Scripture', async () => {
  await window.locator('p:has-text("MAT")').fill("MATTHEW")
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

// // test('Add verse in the book of MAT of textTranslation Scribe Scripture', async () => {
// //   await window.locator('#ch1v1').click()("MATTHEWThis is the genealogy[a] of Jesus the Messiah[b] the son of David")
// //   const editorpane = await window.innerText('[aria-label=editor-pane]');
// //   expect(editorpane).toBe('EDITOR');
// // });

test('Return to projects page', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Edit the text translation project along with change target project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "translation project") {
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


///Obs translation project
test('Click New and Fill OBS project page details to create a new project.', async () => {
  await window.getByRole('link', {name: 'new'}).click()
  await window.click('[aria-label=open-popover]')
  await window.getByRole('link', {name: 'OBS'}).click()
  await window.fill('#project_name', 'Obs project');
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'op');
  await window.click('[aria-label=create]');
})

test('Create an OBS project with Urdu language and license.', async () => {
  await window.getByRole('link', {name: 'new'}).click()
  await window.click('[aria-label=open-popover]')
  await window.getByRole('link', {name: 'OBS'}).click()
  await window.fill('#project_name', 'urdu project');
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'up');
  //adding a urdu language
  await window.getByRole('button', {name: 'add-language'}).click()
  await window.locator('input[name="language"]').fill('urdu new')
  await window.locator('input[name="code"]').fill('un')
  await window.locator('input[type="radio"]').nth(1).click()
  await window.getByRole('button', {name: 'edit-language'}).click()
  //select a new license
  await window.getByRole('button', {name: 'CC BY-SA'}).click()
  await window.getByRole('option', {name: 'CC BY'}).click()
  await window.click('[aria-label=create]');
})

test('Update the Urdu project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "urdu project") {
        console.log(await tds.nth(1).textContent())
        await tds.last().locator('[aria-label=unstar-expand-project]').click()
        await window.locator('[aria-label=unstar-menu-project]').click()
        await window.getByRole('menuitem', {name: "edit-project"}).click()
        await window.getByText('test version').fill('edit test version')
        await window.locator('input[name="version_abbreviated"]').fill('ep')
        await window.getByRole('button', {name:"save-edit-project"}).click();
        const title = await window.textContent('[aria-label=projects]');
        expect(title).toBe('Projects');
      }
    }
  }

})

test('Star the obs project', async () => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=unstar-project]').click()
      // expect(await tds.nth(1).textContent()).toBe("Obs project")
      }

    }

  }
});

test('Unstar the obs project', async () => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
  const row = rows.nth(i);
  const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=star-project]').click()
      // expect(await tds.nth(1).textContent()).toBe("Obs project")
      }
    }
  }
});

test('Search and test obs project for resulting project', async () => {
  await window.fill('#search_box', 'obs');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe('Obs project');
});

test('Click on the project to open the OBS editor page', async () => {
  await window.click('id=Obs project');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the OBS project name', async () => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe('OBS PROJECT');
});

test('Increase the font size of the OBS project.', async () => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
});

test('Decrease the font size of the OBS project.', async () => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
});

test('Check OBS project Notifications', async () => {
    await window.getByRole('button', {name: "notification-button"}).click()
    const title = await window.innerText('[aria-label=notification-title]');
    expect(title).toBe('NOTIFICATIONS');
    await window.getByRole('button', {name: "close-notification"}).click()

});

test('About and Licence of OBS Scribe Scripture', async () => {
  await window.click('[aria-label=about-button]');
  const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
  await window.click('[aria-label=license-button]');
  await window.click('[aria-label=close-about]');
});

test('Edit the OBS editor heading title ', async () => {
  await window.getByText('1. The Creation').fill("1. The Creation edit");
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});
test('Add content in verses 1 and 2 OBS editor.', async () => {
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

// test("Add obs panel", async ()=> {
//  window.getByRole('button', {name:"add-panels"}).click();
//  let title = await window.innerText('[aria-label=number-of-panels]');
//  expect(title).toBe('1');
//  // await window.click('[aria-label=add-panels]');
//  // title = await window.innerText('[aria-label=number-of-panels]');
//  // expect(title).toBe('2');

//  // await window.click('[aria-label=add-panels]');
//  // title = await window.innerText('[aria-label=number-of-panels]');
//  // expect(title).toBe('0');
// })

test('Return to the projects page to see all projects have been created already.', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Edit the Obs project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
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


/////Audio project
test('Click New and Fill Audio project page details to create a new project', async () => {
  await window.getByRole('link', {name: 'new'}).click()
  await window.click('[aria-label=open-popover]')
  await window.getByRole('link', {name: 'Audio'}).click()
  await window.fill('#project_name', 'Audio project');
  await window.fill('#project_description', 'test version');
  await window.fill('#version_abbreviated', 'ap');
  await window.click('#open-advancesettings');
  await window.click('[aria-label=new-testament]');
  await window.click('[aria-label=close-custombiblenavigation]');
  await window.click('[aria-label=create]');
})

test('Star the audio project', async () => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Audio project") {
        console.log(await tds.nth(1).textContent())
        await tds.first().locator('[aria-label=unstar-project]').click()
        // expect(await tds.nth(1).textContent()).toBe("Obs project")
      }
    }
  }
});

test('Untar the audio project', async () => {
  const table =  window.locator('table#tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Audio project") {
      console.log(await tds.nth(1).textContent())
      await tds.first().locator('[aria-label=star-project]').click()
      // expect(await tds.nth(1).textContent()).toBe("Obs project")
      }
    }
  }

});

test('Search and test audio for resulting project', async () => {
  await window.fill('#search_box', 'audio');
  const projectname = await window.innerText(
  '[aria-label=unstar-project-name]',
  );
  expect(projectname).toBe('Audio project');
});

test('Click on the Audio project to open the editor page.', async () => {
  await window.click('id=Audio project');
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
});

test('Check the Audio project name', async () => {
  const projectname = await window.innerText(
  '[aria-label=editor-project-name]',
  );
  expect(projectname).toBe('AUDIO PROJECT');
});

test('Increase font size Audio project', async () => {
  await window.click('[aria-label=increase-font]');
  await window.click('[aria-label=increase-font]');
});

test('Decrease font size of Audio project', async () => {
  await window.click('[aria-label=decrease-font]');
  await window.click('[aria-label=decrease-font]');
});

test('Check Audio projects Notifications', async () => {
    await window.getByRole('button', {name: "notification-button"}).click()
    const title = await window.innerText('[aria-label=notification-title]');
    expect(title).toBe('NOTIFICATIONS');
    await window.getByRole('button', {name: "close-notification"}).click()

});

test('About and Licence of Audio Scribe Scripture', async () => {
    await window.getByRole('button', {name: "about-button"}).click()
    const developedby = await window.innerText('[aria-label=developed-by]');
  expect(developedby).toBe('Developed by Bridge Connectivity Solutions');
    await window.getByRole('button', {name: "license-button"}).click()
    await window.getByRole('button', {name: "close-about"}).click()
});

test('Check Audio book bookmarks and close', async () => {
    await window.getByRole('button', {name: "select-menu-file"}).click()
    await window.getByRole('button', {name: "select-bookmarks"}).click()
    await window.getByRole('button', {name: "close-button"}).click()    
});

test('Saving bookmark for the Audio book and check the all bookmarks', async ()=>{
  await window.getByRole('button', {name: "save-bookmark"}).click()
  await window.getByRole('button', {name: "select-menu-file"}).click()
    await window.getByRole('button', {name: "select-bookmarks"}).click()
  await window.getByRole('button', {name: "close-button"}).click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
} )

test('Lock/Unlock the Audio editor', async () => {
    await window.getByRole('button', {name: "select-menu-file"}).click()
    await window.getByRole('none', {name: "selected-font"}).click()
    await window.getByRole('option', {name: "aakar"}).click()  
    const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
});

test('Record the audio for verse 1', async () => {
    await window.getByRole('button', {name: "1"}).first().click()  
  await window.locator('.flex > div > .p-2').first().click()
  await window.waitForTimeout(4000)
  await window.locator('div:nth-child(2) > .p-2').first().click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
})

test('Rewind the audio verse 1', async () => {
    await window.getByRole('button', {name: "1"}).first().click()  
  await window.locator('div:nth-child(4) > div > .p-2').first().click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');  
})
test('Playing the audio verse 1', async () => {
    await window.getByRole('button', {name: "1"}).first().click()  
  await window.locator('div:nth-child(4) > div:nth-child(2) > .p-2').first().click()
  await window.waitForTimeout(4000)
  // const editorpane = await window.innerText('[aria-label=editor-pane]');
  // expect(editorpane).toBe('EDITOR');
})

test('Stop the audio verse 1', async () => {
  await window.locator('div:nth-child(3) > .p-2').first().click()
  const editorpane = await window.innerText('[aria-label=editor-pane]');
  expect(editorpane).toBe('EDITOR');
})

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


// test('Delete the audio verse 1', async () => {
//     await window.getByRole('button', {name: "1"}).first().click()  
//  await window.locator('.flex div:nth-child(4) > div:nth(2) > .p-2').first().click()
//  await window.getByRole('button', {name:"Delete"})
//  const editorpane = await window.innerText('[aria-label=editor-pane]');
//  expect(editorpane).toBe('EDITOR');
// })



test('Return and see created projects in projects page', async () => {
  await window.getByRole('button', {name: "Back"}).click();
  const title = await window.textContent('[aria-label=projects]');
  expect(title).toBe('Projects');
});

test('Edit the Audio project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());
  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Audio project") {
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

//Export all the project
test('Export the text Translation project in Downloads folder', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "translation project") {
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

test('Export the OBS Translation project in Downloads folder', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
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

test('Export the Audio Translation project Downloads folder', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
        if (await tds.nth(j).textContent() === "Audio project") {
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


/////Archive projects
/////texttranslation
test('Archive the textTranslation project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "translation project") {
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


////OBS
test('Archive the OBS project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
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


///audio
test('Archive the Audio project', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Audio project") {
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

/////Restore the project from archived
test('Restore the textTranslation project from the archive tab and return to the projects', async () => {
  await window.getByRole('button', {name: "Archived"}).click()
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "translation project") {
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

test('Restore the OBS project from the archive tab and return to the projects', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Obs project") {
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

test('Restore the Audio project from the archive tab and return to the projects', async () => {
  const table =  window.getByTestId('tablelayout')
  const headers = table.locator('thead')
  console.log(await headers.allTextContents());

  const rows = table.locator('tbody tr')
  // const cols = rows.first().locator('td')
  for (let i = 0; i < await rows.count(); i++) {
    const row = rows.nth(i);
    const tds = row.locator('td');
    for (let j = 0; j < await tds.count(); j++) {
      if (await tds.nth(j).textContent() === "Audio project") {
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

test("Update the app language for the user english to hindi and than hindi to english", async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Your Profile"}).click()
  await window.getByRole('button', {name: "English"}).click()
  await window.getByRole('option', {name: "Hindi"}).click()
  await window.getByRole('button', {name: "Save"}).click()
  await window.getByRole('button', {name: "Hindi"}).click()
  await window.getByRole('option', {name: "English"}).click()
  await window.getByRole('button', {name: "सहेजें"}).click()
})

test('Sign out and return to Autographa app', async () => {
  await window.getByRole('button', {name: "Open user menu"}).click()
  await window.getByRole('menuitem', {name: "Sign out"}).click()
  expect(await window.title()).toBe('Scribe Scripture');
});


////Login page
test('Click the View More button, see active users in the tab, and click See the project. ',async () => {
  await window.getByRole('button', {name: "View More"}).click()
  const active = await window.getByRole('tab').allInnerTexts()
  expect(active[0]).toBe('Active')
  await window.getByRole('tabpanel', {name: "Active"}).getByRole("button", {name: "playwright user"}).click()
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

// test('Removing user from backend', async () => {
//     // const newpath = await localStorage.getItem('userPath');
//  await removeUser('playwright user')

// })

});
