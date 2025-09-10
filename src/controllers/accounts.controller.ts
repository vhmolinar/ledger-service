import { FastifyReply, FastifyRequest } from "fastify";
import { CreateAccountBody, GetAccountParams, AccountResource } from "@/schemas/accounts.schema";
import * as AccountService from "../services/accounts.service";

export async function create(
    request: FastifyRequest<{ Body: CreateAccountBody }>,
    reply: FastifyReply
): Promise<AccountResource> {
    const { tx } = request;
    const account = await AccountService.createAccount(request.body, tx);
    return reply.code(200).send(account);
}

export async function fetch(
    request: FastifyRequest<{ Params: GetAccountParams }>,
    reply: FastifyReply
): Promise<AccountResource> {
    const { tx } = request;
    const account = await AccountService.fetchAccount(request.params.id, tx);

    if (!account) {
        return reply.code(404).send({ error: "Account not found" });
    }

    return reply.code(200).send(account);
}
