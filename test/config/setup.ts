import { TestDatabase } from "./test.database"
import { TestApp } from "./test.app";
import teardown from "./teardown";

declare global {
    var testDb: TestDatabase;
    var testApp: TestApp;
    var testServer: any;
}

beforeAll(async () => {
    console.log("Initializing shared test environment...");
    global.testDb = new TestDatabase();
    global.testApp = new TestApp();
    global.testServer = await global.testApp.init(global.testDb);
    console.log("Shared test environment initialized");
});

afterAll(async () => {
    await teardown();
});