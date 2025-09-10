import knexLib from "knex";
import type { Knex } from "knex";

import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const dbName = process.env.NODE_ENV == "test" ?
    process.env.POSTGRES_TEST_DB :
    process.env.POSTGRES_NAME;

const getConfig = (): { [key: string]: Knex.Config } => {
    const defaultConfig = {
        development: {
            client: "pg",
            connection: {
                host: process.env.POSTGRES_HOST || "localhost",
                port: Number(process.env.POSTGRES_PORT) || 5432,
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: dbName
            },
            migrations: {
                directory: "../../database/migrations",
                tableName: "migrations"
            },
            pool: { min: 2, max: 10 },
            debug: true,
        },
    };
    return {
        ...defaultConfig,
        test: {
            ...defaultConfig.development,
            pool: { min: 1, max: 5 },
        }
    };
};

const config = getConfig();

export default config;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const knexSession = (): Knex<any, any> => {
    const lazyConfig = getConfig();
    const knexConfig = lazyConfig[process.env.NODE_ENV || "development"];
    return knexLib(knexConfig);
};