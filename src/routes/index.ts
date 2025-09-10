import { FastifyInstance } from "fastify";
import accountRoutes from "./accounts.route";
import transactionsRoutes from "./transactions.route"

export default async function routes(fastify: FastifyInstance) {
    fastify.register(accountRoutes, { prefix: "/accounts" });
    fastify.register(transactionsRoutes, { prefix: "/transaction" });
}
