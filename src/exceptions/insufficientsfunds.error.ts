export default class InsufficientFundsError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "InsufficientFundsError";
        this.statusCode = 412;
    }
}
