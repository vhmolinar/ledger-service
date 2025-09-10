export default async function teardown() {
    console.log("Tearing down test environment...");

    if (global.testDb) {
        await global.testDb.close();
    }

    if (global.testApp) {
        await global.testApp.close();
    }
}
