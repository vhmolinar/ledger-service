import { FastifyInstance } from "fastify";
import { create } from "../schemas/transactions.schema";
import * as TransactionsController from "../controllers/transactions.controller";

export default async function transactionRoutes(fastify: FastifyInstance) {
    fastify.post(
        "/",
        { schema: create },
        TransactionsController.create
    );
}
