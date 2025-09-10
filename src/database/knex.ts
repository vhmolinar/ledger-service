import knexLib, { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "pg",
        connection: {
            host: process.env.POSTGRES_HOST || "localhost",
            port: Number(process.env.POSTGRES_PORT) || 5432,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_NAME || "ledger-service",
        },
        migrations: {
            directory: "../../database/migrations",
            tableName: "migrations",
        },
        pool: { min: 2, max: 10 },
        debug: true,
    },
};

export default config;

const knexConfig: Knex.Config = (config as any)[process.env.NODE_ENV || "development"];

export const knex = knexLib(knexConfig);
