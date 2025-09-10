import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("transaction_entries", (table) => {
        table.uuid("id").primary();
        table
            .uuid("transaction_id")
            .notNullable()
            .references("id")
            .inTable("transactions")
            .onDelete("CASCADE");

        table.uuid("account_id").notNullable();

        table.enu("direction", ["debit", "credit"]).notNullable();
        table.bigInteger("amount").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("transaction_entries");
    await knex.schema.raw('DROP TYPE IF EXISTS entry_direction');
}