import { test as myTest } from "@playwright/test"

type myFixture = {
    userName: string
    textProject: string,
    obsProject: string,
    audioProject: string,
    syncName: string,
    doorUser: string,
    doorPassword: string,
    flavorText: string,
    flavorObs: string
    textUnderscore: string,
    obsUnderscore: string,
    obsUrduProject: string,
}
const myFixtureTest = myTest.extend<myFixture>({
    userName: "Playwright user",
    textProject: "Translation test project",
    obsProject: "Obs test project",
    textUnderscore: "Translation_test_project",
    obsUnderscore: "Obs_test_project",
    audioProject: "Audio test project",
    syncName: "Sync_Collab_Test",
    doorUser: "bobby",
    doorPassword: "Bobby@123",
    flavorText: "textTranslation",
    flavorObs: "textStories",
    obsUrduProject: "Obs urdu project",
})

export const test = myFixtureTest;
export { expect } from '@playwright/test';