import "fastify";
import { Knex } from "knex";

declare module "fastify" {
    interface FastifyRequest {
        tx?: Knex.Transaction;
    }
}
