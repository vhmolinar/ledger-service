import { testTransaction } from "../../config/test.database";
import { getServer } from "../../config/test.app";
import { Direction } from "@/domain/direction";
import { AccountResource } from "@/schemas/accounts.schema";
import { v4 as uuid } from "uuid";

describe("Transactions Service", () => {
    beforeEach(async () => {
        await testTransaction.start();
    });

    afterEach(async () => {
        await testTransaction.rollback();
    });

    async function createAccount(name: string, direction: Direction): Promise<AccountResource> {
        const accountData = { name, direction };
        const response = await getServer().inject({
            method: "POST",
            url: "/accounts",
            payload: accountData
        });
        return response.json();
    }

    async function fetchAccount(accountId: string): Promise<AccountResource> {
        const response = await getServer().inject({
            method: "GET",
            url: `/accounts/${accountId}`
        });
        return response.json();
    }

    describe("create", () => {
        it("transaction from credit account to debit account", async () => {
            // Given one credit account and one debit account
            let revenueAccount = await createAccount("Revenue Account", "credit");
            let cashAccount = await createAccount("Cash Account", "debit");

            // When transferring from credit to debit
            const amount = 150.25;
            const transactionData = {
                name: "Revenue collection",
                entries: [
                    {
                        accountId: revenueAccount.id,
                        amount: amount,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then, both accounts should have their balance updated
            expect(response.statusCode).toBe(200);

            const result = response.json();
            expect(result).toMatchObject({
                name: "Revenue collection",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        accountId: revenueAccount.id,
                        amount: amount,
                        direction: "debit"
                    }),
                    expect.objectContaining({
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "credit"
                    })
                ])
            });
            expect(result.id).toBeDefined();
            expect(result.entries).toHaveLength(2);
            expect(result.entries[0].id).toBeDefined();
            expect(result.entries[1].id).toBeDefined();

            revenueAccount = await fetchAccount(revenueAccount.id);
            cashAccount = await fetchAccount(cashAccount.id);

            expect(revenueAccount.balance).toBe(-amount);
            expect(cashAccount.balance).toBe(-amount);
        });

        it("transaction from debit account to credit account", async () => {
            // Given one debit account and one credit account
            let cashAccount = await createAccount("Cash Account", "debit");
            let liabilityAccount = await createAccount("Liability Account", "credit");

            // When transferring from debit to credit
            const amount = 300.50;
            const transactionData = {
                name: "Liability payment",
                entries: [
                    {
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: liabilityAccount.id,
                        amount: amount,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then, both accounts should have their balance updated
            expect(response.statusCode).toBe(200);

            const result = response.json();
            expect(result).toMatchObject({
                name: "Liability payment",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "debit"
                    }),
                    expect.objectContaining({
                        accountId: liabilityAccount.id,
                        amount: amount,
                        direction: "credit"
                    })
                ])
            });
            expect(result.id).toBeDefined();
            expect(result.entries).toHaveLength(2);
            expect(result.entries[0].id).toBeDefined();
            expect(result.entries[1].id).toBeDefined();

            cashAccount = await fetchAccount(cashAccount.id);
            liabilityAccount = await fetchAccount(liabilityAccount.id);

            expect(cashAccount.balance).toBe(amount);
            expect(liabilityAccount.balance).toBe(amount);
        });

        it("transaction with one debit and multiple credit accounts", async () => {
            // Given one debit account and three credit accounts
            let cashAccount = await createAccount("Cash Account", "debit");
            let revenueAccount1 = await createAccount("Product Sales", "credit");
            let revenueAccount2 = await createAccount("Service Revenue", "credit");
            let revenueAccount3 = await createAccount("Consulting Revenue", "credit");

            // When creating a transaction with 1 debit (300.00) and 3 credits (100.00 each)
            const debitAmount = 300.00;
            const creditAmount = 100.00;

            const transactionData = {
                name: "Multi-source revenue collection",
                entries: [
                    {
                        accountId: cashAccount.id,
                        amount: debitAmount,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: revenueAccount1.id,
                        amount: creditAmount,
                        direction: "credit" as Direction
                    },
                    {
                        accountId: revenueAccount2.id,
                        amount: creditAmount,
                        direction: "credit" as Direction
                    },
                    {
                        accountId: revenueAccount3.id,
                        amount: creditAmount,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then the transaction should be successful
            expect(response.statusCode).toBe(200);

            const result = response.json();
            expect(result).toMatchObject({
                name: "Multi-source revenue collection",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        accountId: cashAccount.id,
                        amount: debitAmount,
                        direction: "debit"
                    }),
                    expect.objectContaining({
                        accountId: revenueAccount1.id,
                        amount: creditAmount,
                        direction: "credit"
                    }),
                    expect.objectContaining({
                        accountId: revenueAccount2.id,
                        amount: creditAmount,
                        direction: "credit"
                    }),
                    expect.objectContaining({
                        accountId: revenueAccount3.id,
                        amount: creditAmount,
                        direction: "credit"
                    })
                ])
            });

            cashAccount = await fetchAccount(cashAccount.id);
            revenueAccount1 = await fetchAccount(revenueAccount1.id);
            revenueAccount2 = await fetchAccount(revenueAccount2.id);
            revenueAccount3 = await fetchAccount(revenueAccount3.id);

            expect(cashAccount.balance).toBe(debitAmount);
            expect(revenueAccount1.balance).toBe(creditAmount);
            expect(revenueAccount2.balance).toBe(creditAmount);
            expect(revenueAccount3.balance).toBe(creditAmount);
        });

        it("transaction between two debit accounts", async () => {
            // Given two debit accounts
            let cashAccount = await createAccount("Cash Account", "debit");
            let expenseAccount = await createAccount("Expense Account", "debit");

            // When one transaction is place for these accounts
            const amount = 100.45;
            const transactionData = {
                name: "Rolling debt",
                entries: [
                    {
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "credit" as Direction
                    },
                    {
                        accountId: expenseAccount.id,
                        amount: amount,
                        direction: "debit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then, both accounts should have their balance updated
            expect(response.statusCode).toBe(200);

            const result = response.json();
            expect(result).toMatchObject({
                name: "Rolling debt",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        accountId: cashAccount.id,
                        amount: amount,
                        direction: "credit"
                    }),
                    expect.objectContaining({
                        accountId: expenseAccount.id,
                        amount: amount,
                        direction: "debit"
                    })
                ])
            });
            expect(result.id).toBeDefined();
            expect(result.entries).toHaveLength(2);
            expect(result.entries[0].id).toBeDefined();
            expect(result.entries[1].id).toBeDefined();

            cashAccount = await fetchAccount(cashAccount.id);
            expenseAccount = await fetchAccount(expenseAccount.id);

            expect(cashAccount.balance).toBe(-amount);
            expect(expenseAccount.balance).toBe(amount);
        });

        it("transaction between two credit accounts", async () => {
            // Given two credit accounts
            let liabilityAccount = await createAccount("Liability Account", "credit");
            let revenueAccount = await createAccount("Revenue Account", "credit");

            // When one transaction is placed for these accounts
            const amount = 250.75;
            const transactionData = {
                name: "Credit transfer",
                entries: [
                    {
                        accountId: liabilityAccount.id,
                        amount: amount,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: revenueAccount.id,
                        amount: amount,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then, both accounts should have their balance updated
            expect(response.statusCode).toBe(200);

            const result = response.json();
            expect(result).toMatchObject({
                name: "Credit transfer",
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        accountId: liabilityAccount.id,
                        amount: amount,
                        direction: "debit"
                    }),
                    expect.objectContaining({
                        accountId: revenueAccount.id,
                        amount: amount,
                        direction: "credit"
                    })
                ])
            });
            expect(result.id).toBeDefined();
            expect(result.entries).toHaveLength(2);
            expect(result.entries[0].id).toBeDefined();
            expect(result.entries[1].id).toBeDefined();

            liabilityAccount = await fetchAccount(liabilityAccount.id);
            revenueAccount = await fetchAccount(revenueAccount.id);

            expect(liabilityAccount.balance).toBe(-amount);
            expect(revenueAccount.balance).toBe(amount);
        });

        it("should reject transactions when account is not found", async () => {
            const transactionData = {
                name: "Invalid transaction",
                entries: [
                    {
                        accountId: uuid(),
                        amount: 100,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: uuid(),
                        amount: 100,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then it should be rejected with status 404
            expect(response.statusCode).toBe(404);
            expect(response.json().message).toContain("not found");
        });

        it("should reject transactions that don't balance to zero", async () => {
            // Given two accounts
            const cashAccount = await createAccount("Cash Account", "debit");
            const expenseAccount = await createAccount("Expense Account", "debit");

            // When creating a transaction where debits don't equal credits
            const transactionData = {
                name: "Unbalanced transaction",
                entries: [
                    {
                        accountId: cashAccount.id,
                        amount: 100.00,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: expenseAccount.id,
                        amount: 75.00,
                        direction: "credit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then it should be rejected with status 412
            expect(response.statusCode).toBe(412);
            expect(response.json().message).toContain("must balance");
        });

        it("should reject transactions with all entries having the same direction", async () => {
            // Given two accounts
            const cashAccount = await createAccount("Cash Account", "debit");
            const expenseAccount = await createAccount("Expense Account", "debit");

            // When creating a transaction with all entries having the same direction
            const transactionData = {
                name: "Same direction transaction",
                entries: [
                    {
                        accountId: cashAccount.id,
                        amount: 100.00,
                        direction: "debit" as Direction
                    },
                    {
                        accountId: expenseAccount.id,
                        amount: 100.00,
                        direction: "debit" as Direction
                    }
                ]
            };

            const response = await getServer().inject({
                method: "POST",
                url: "/transactions",
                payload: transactionData
            });

            // Then it should be rejected with status 412
            expect(response.statusCode).toBe(412);
            expect(response.json().message).toContain("at least one debit and one credit");
        });
    });
});