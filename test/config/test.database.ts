import { Knex } from "knex";
import { knexSession } from "@/database/knex";

export class TestDatabase {
    private readonly knex: Knex;
    private trx: Knex.Transaction | null = null;

    constructor() {
        this.knex = knexSession();
    }

    async startTransaction(): Promise<void> {
        this.trx = await this.knex.transaction();
    }

    activeTransaction(): Knex.Transaction {
        return <Knex.Transaction>this.trx;
    }

    getConnection(): Knex {
        return this.knex;
    }

    async close(): Promise<void> {
        await this.trx?.destroy();
        await this.knex.destroy();
    }

    async rollbackTransaction(): Promise<void> {
        if (this.trx) {
            await this.trx.rollback();
            this.trx = null;
        }
    }
}

export const testTransaction = {
    async start(): Promise<void> {
        await getInstance().startTransaction();
    },

    async rollback(): Promise<void> {
        await getInstance().rollbackTransaction();
    }
};


export function getInstance(): TestDatabase {
    if (!global.testDb) {
        throw new Error("Test database not initialized. Make sure globalSetup is configured in Jest.");
    }
    return global.testDb;
}
