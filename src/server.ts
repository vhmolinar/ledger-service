import app from "./app";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

try {
    await app.listen({ port, host });
    console.log(`Server is running on ${host}:${port}`);
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
