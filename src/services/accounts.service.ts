import { knexSession } from "@/database/knex";
import { AccountResource, CreateAccountBody } from "@/schemas/accounts.schema";
import { v4 as uuid } from "uuid";
import {Knex} from "knex";

const TABLE = "accounts";

export async function fetchAccount(
    id: string,
    tx?: Knex.Transaction
): Promise<AccountResource | undefined> {
    const knex = tx ?? knexSession();
    return (await knex<AccountResource>(TABLE).where({ id }).first());
}

export async function createAccount(
    data: CreateAccountBody,
    tx?: Knex.Transaction
): Promise<AccountResource> {
    const id = data.id ?? uuid();

    const existing = await fetchAccount(id, tx);
    if (existing) {
        return existing;
    }

    const account: AccountResource = {
        id,
        name: data.name,
        direction: data.direction,
        balance: 0,
    };

    const knex = tx ?? knexSession();
    try {
        await knex<AccountResource>(TABLE).insert(account);
    } catch (e) {
        console.error(e);
        throw e;
    }
    return account;
}