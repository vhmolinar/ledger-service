import { v4 as uuid } from "uuid";
import { Knex } from "knex";

import { knexSession } from "@/database/knex";
import { TransactionResource, CreateTransactionBody, TransactionEntry } from "@/schemas/transactions.schema";
import { lockAccount } from "./accounts.service";
import { AccountResource } from "@/schemas/accounts.schema";
import { toCents } from "@/formatters/money";

export const TRANSACTIONS_TABLE = "transactions";
export const ENTRIES_TABLE = "transaction_entries";

export async function create(
    body: CreateTransactionBody,
    trxExternal?: Knex.Transaction
): Promise<TransactionResource> {
    const trx = trxExternal || (await knexSession().transaction());

    try {
        const transactionId = body.id ?? uuid();

        // Idempotency check
        const existing = await fetchTransaction(transactionId, trx);
        if (existing) {
            // TODO: we should also check if the payload matches to the existing transaction
            return existing as TransactionResource;
        }

        await trx(TRANSACTIONS_TABLE).insert({
            id: transactionId,
            name: body.name ?? null,
        });

        // Sort entries by account ID to avoid deadlocks
        const sortedEntries = body.entries.sort((a, b) => a.accountId.localeCompare(b.accountId));
        const accounts: (AccountResource)[] = await Promise.all(
            sortedEntries.map(async(e) => lockAccount(e.accountId, trx))
        );

        const futures = sortedEntries.map(async(entry, index) => {
            const account = accounts[index];
            return await ledger(
                account,
                entry,
                transactionId,
                trx
            );
        });

        const entries = await Promise.all(futures);
        await trx.commit();

        return {
            id: transactionId,
            name: body.name,
            entries,
        };
    } catch (err) {
        await trx.rollback();
        throw err;
    }
}

async function ledger(
    account: AccountResource,
    entry: TransactionEntry,
    transactionId: string,
    trx: Knex.Transaction
): Promise<Required<TransactionEntry>> {
    if (!entry.id) {
        entry.id = uuid();
    }

    // TODO: should the balance be validated?

    // const delta =
    //     account.direction === entry.direction ? entry.amount : -entry.amount;
    //
    // const newBalance = account.balance + delta;

    // if (newBalance < 0) {
    //     throw new InsufficientFundsError(
    //         `Insufficient funds: account ${account.id} would go negative`
    //     );
    // }

    await trx(ENTRIES_TABLE).insert({
        id: entry.id,
        transaction_id: transactionId,
        account_id: entry.accountId,
        amount: toCents(entry.amount),
        direction: entry.direction,
    });

    return {
        id: entry.id,
        accountId: entry.accountId,
        amount: entry.amount,
        direction: entry.direction,
    } as Required<TransactionEntry>;
}

async function fetchTransaction(transactionId: string, trx: Knex.Transaction): Promise<TransactionResource | null> {
    const existing = await trx(TRANSACTIONS_TABLE)
        .where({ id: transactionId })
        .first();

    if (!existing)
        return null;


    const entries = await trx(ENTRIES_TABLE)
        .where({ transaction_id: transactionId })
        .select<Required<TransactionEntry>[]>([
            "id as id",
            "account_id as accountId",
            "amount",
            "direction",
        ]);


    return {
        id: existing.id,
        name: existing.name,
        entries,
    };
}