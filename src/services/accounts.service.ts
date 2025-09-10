import { knexSession } from "@/database/knex";
import { AccountResource, CreateAccountBody } from "@/schemas/accounts.schema";
import { v4 as uuid } from "uuid";
import { Knex } from "knex";
import AccountNotFoundError from "@/exceptions/accountnotfound.error";

export const TABLE = "accounts";

export async function fetchAccount(
    id: string,
    tx?: Knex.Transaction
): Promise<AccountResource | undefined> {
    const knex = tx ?? knexSession();
    return (await knex<AccountResource>(TABLE).where({ id }).first());
}

export async function lockAccount(
    id: string,
    tx?: Knex.Transaction
): Promise<AccountResource> {
    const knex = tx ?? knexSession();
    const account = (await knex<AccountResource>(TABLE)
        .where({ id })
        .forUpdate()
        .first());
    if (!account)
        throw new AccountNotFoundError(`Account not found: ${id}`);
    return account;
}

export async function createAccount(
    data: CreateAccountBody,
    tx?: Knex.Transaction
): Promise<AccountResource> {
    const id = data.id ?? uuid();

    // Idempotency check
    const existing = await fetchAccount(id, tx);
    if (existing) {
        // TODO: we should also check if the payload matches to the existing account
        return existing;
    }

    const account: AccountResource = {
        id,
        name: data.name,
        direction: data.direction,
        balance: 0,
    };

    const knex = tx ?? knexSession();

    await knex<AccountResource>(TABLE).insert(account);
    return account;
}