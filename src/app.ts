import Fastify from "fastify";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

app.register(routes);

export default app;
