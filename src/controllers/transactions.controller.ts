import { FastifyReply, FastifyRequest } from "fastify";
import { CreateTransactionBody, TransactionResource } from "@/schemas/transactions.schema";
import * as TransactionService from "@/services/transactions.service";
import InvalidEntriesError from "@/exceptions/invalidentries.error";
import {toCents} from "@/formatters/money";

export async function create(
    request: FastifyRequest<{ Body: CreateTransactionBody }>,
    reply: FastifyReply
): Promise<TransactionResource> {
    validateTransactionEntries(request.body.entries);

    const { tx } = request;
    const transaction = await TransactionService.create(request.body, tx);
    return reply.code(200).send(transaction);
}

function validateTransactionEntries(entries: CreateTransactionBody["entries"]): void {
    if (entries.length < 2) {
        throw new InvalidEntriesError("Transaction must have at least 2 entries");
    }

    const hasDebit = entries.some(entry => entry.direction === "debit");
    const hasCredit = entries.some(entry => entry.direction === "credit");

    if (!hasDebit || !hasCredit) {
        throw new InvalidEntriesError("Transaction must have at least one debit and one credit entry");
    }

    const totalDebits = entries
        .filter(entry => entry.direction === "debit")
        .reduce((sum, entry) => sum + toCents(entry.amount), 0);

    const totalCredits = entries
        .filter(entry => entry.direction === "credit")
        .reduce((sum, entry) => sum + toCents(entry.amount), 0);

    if (totalDebits - totalCredits != 0) {
        throw new InvalidEntriesError(
            `Transaction must balance: total debits (${totalDebits}) must equal total credits (${totalCredits})`
        );
    }
}