import { FastifyReply, FastifyRequest } from "fastify";
import { CreateTransactionBody, TransactionResource } from "../schemas/transactions.schema";

export async function create(
    request: FastifyRequest<{ Body: CreateTransactionBody }>,
    reply: FastifyReply
): Promise<TransactionResource> {
    throw new Error("Not implemented");
}
