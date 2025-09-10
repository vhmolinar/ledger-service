import Fastify, { FastifyInstance } from "fastify";
import routes from "@/routes";
import {TestDatabase} from "./test.database";

export class TestApp {
    readonly app: FastifyInstance;

    constructor() {
        this.app = Fastify({ logger: false });
    }

    async init(db: TestDatabase): Promise<FastifyInstance> {
        await this.app.register(routes);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.addHook("onRequest", async (request, reply) => {
            request.tx = db.activeTransaction();
        });

        return this.app;
    }

    async close(): Promise<void> {
        await this.app.close();
    }
}

export function getInstance(): TestApp {
    if (!global.testApp) {
        throw new Error("Test app not initialized. Make sure globalSetup is configured in Jest.");
    }
    return global.testApp;
}

export function getServer(): FastifyInstance {
    return getInstance().app;
}

