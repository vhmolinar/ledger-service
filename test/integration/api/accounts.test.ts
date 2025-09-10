import { testTransaction } from "../../config/test.database";
import { getServer } from "../../config/test.app";
import { v4 as uuid } from "uuid";
import { Direction } from "@/domain/direction";

describe("Accounts API", () => {

    beforeEach(async () => {
        await testTransaction.start();
    });

    afterEach(async () => {
        await testTransaction.rollback();
    });

    describe("POST /accounts", () => {
        it("should create a new account", async () => {
            const accountData = {
                name: "Test Account",
                direction: "debit" as Direction
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: accountData
            });

            expect(response.statusCode).toBe(200);

            const account = response.json();
            expect(account).toMatchObject({
                name: "Test Account",
                direction: "debit",
                balance: 0
            });
            expect(account.id).toBeDefined();
        });

        it("should create an account with a provided ID", async () => {
            const accountId = uuid();
            const accountData = {
                id: accountId,
                name: "Account with ID",
                direction: "credit" as Direction
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: accountData
            });

            expect(response.statusCode).toBe(200);

            const account = response.json();
            expect(account).toMatchObject({
                id: accountId,
                name: "Account with ID",
                direction: "credit",
                balance: 0
            });
        });

        it("should return an idempotent response", async () => {
            const accountId = uuid();
            const accountData = {
                id: accountId,
                name: "Original Account",
                direction: "debit" as Direction
            };

            await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: accountData
            });

            const response = await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: accountData
            });

            expect(response.statusCode).toBe(200);

            const account = response.json();
            expect(account).toMatchObject({
                id: accountId,
                name: accountData.name,
                direction: accountData.direction,
                balance: 0
            });
        });

        it("should validate the account data", async () => {
            const invalidData = {
                name: "Invalid Account",
                direction: "invalid"
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: invalidData
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("GET /accounts/:id", () => {
        it("should fetch an existing account", async () => {
            const accountData = {
                name: "Account to Fetch",
                direction: "debit" as Direction
            };

            const createResponse = await getServer().inject({
                method: "POST",
                url: "/accounts",
                payload: accountData
            });

            const createdAccount = createResponse.json();
            const accountId = createdAccount.id;

            const response = await getServer().inject({
                method: "GET",
                url: `/accounts/${accountId}`
            });

            expect(response.statusCode).toBe(200);

            const account = response.json();
            expect(account).toMatchObject({
                id: accountId,
                name: "Account to Fetch",
                direction: "debit",
                balance: 0
            });
        });

        it("should return 404 for non-existent account", async () => {
            const nonExistentId = uuid();

            const response = await getServer().inject({
                method: "GET",
                url: `/accounts/${nonExistentId}`
            });

            expect(response.statusCode).toBe(404);
        });

        it("should validate the account ID format", async () => {
            const invalidId = "not-a-uuid";

            const response = await getServer().inject({
                method: "GET",
                url: `/accounts/${invalidId}`
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
