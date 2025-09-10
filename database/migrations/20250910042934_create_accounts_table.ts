import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("accounts", (table) => {
        table.uuid("id").primary();
        table.string("name").notNullable();
        table.enu("direction", ["debit", "credit"]).notNullable();
        table.bigInteger("balance").notNullable().defaultTo(0);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("accounts");
}

