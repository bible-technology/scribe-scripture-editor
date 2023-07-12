import {test as myTest} from "@playwright/test"


type scribeTest = {
    userName: string
    textProject: string,
    obsProject: string,
    audioProject: string,
    syncName:string,
    doorUser:string,
    doorPassword:string

}
const myFixtureTest = myTest.extend<scribeTest>({
    userName : "Playwright user",
    textProject: "Translation test project ",
    obsProject: "Obs test project",
    audioProject: "Audio test project",
    syncName:"Sync_Collab_Test",
    doorUser:"bobby",
    doorPassword:"Bobby@123"

})

export const test = myFixtureTest;
export const expect = test.expect;