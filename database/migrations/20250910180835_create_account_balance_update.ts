import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE OR REPLACE FUNCTION process_transaction_entry()
        RETURNS TRIGGER AS $$
        DECLARE
          account_direction TEXT;
        BEGIN
            IF TG_OP = 'INSERT' THEN
                SELECT direction INTO account_direction
                FROM accounts
                WHERE id = NEW.account_id;
                
                UPDATE accounts
                SET balance = balance + CASE
                  WHEN account_direction = NEW.direction THEN NEW.amount
                  ELSE -NEW.amount
                END,
                updated_at = NOW()
                WHERE id = NEW.account_id;
                
                RETURN NEW;
            ELSIF TG_OP = 'UPDATE' THEN
                RAISE EXCEPTION 'Updates to transaction entries are not allowed';
            ELSIF TG_OP = 'DELETE' THEN
                RAISE EXCEPTION 'Deletes from transaction entries are not allowed';
            END IF;
            
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER process_transaction_entry_trigger
            BEFORE INSERT OR UPDATE OR DELETE ON transaction_entries
            FOR EACH ROW
            EXECUTE FUNCTION process_transaction_entry();
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TRIGGER IF EXISTS process_transaction_entry_trigger ON transaction_entries;
        
        DROP FUNCTION IF EXISTS process_transaction_entry();
    `);
}