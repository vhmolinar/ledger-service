export default class InvalidEntriesError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "InvalidEntriesError";
        this.statusCode = 412;
    }
}
