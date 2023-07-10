import {test as myTest} from "@playwright/test"


type scribeTest = {
    userName: string
    window : any
}
const myFixtureTest = myTest.extend<scribeTest>({
    userName : "Playwright user",
})

export const test = myFixtureTest;
export const expect = test.expect;