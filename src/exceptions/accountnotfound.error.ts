export default class AccountNotFoundError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "AccountNotFoundError";
        this.statusCode = 404;
    }
}
