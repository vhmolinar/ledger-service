import { knex } from "../database/knex"
import { AccountResource, CreateAccountBody } from "../schemas/accounts.schema";
import { v4 as uuid } from "uuid";

const TABLE = "accounts";

export async function fetchAccount(id: string): Promise<AccountResource | null> {
    const row = await knex<AccountResource>(TABLE).where({ id }).first();
    return row || null;
}

export async function createAccount(data: CreateAccountBody): Promise<AccountResource> {
    const id = data.id ?? uuid();

    const existing = await fetchAccount(id);
    if (existing) {
        return existing;
    }

    const account: AccountResource = {
        id,
        name: data.name,
        direction: data.direction,
        balance: 0,
    };

    await knex<AccountResource>(TABLE).insert(account);
    return account;
}