import { FastifyInstance } from "fastify";
import { create as createSchema, fetch as fetchSchema } from "../schemas/accounts.schema"
import { create, fetch } from "../controllers/accounts.controller"

export default async function routes(fastify: FastifyInstance) {
    fastify.post(
        "/",
        { schema: createSchema },
        create
    );

    fastify.get(
        "/:id",
        { schema: fetchSchema },
        fetch
    );
}
