import { JSONSchemaType } from "ajv";
import { Direction, DirectionValues } from "../domain/direction";

export interface TransactionEntry {
    id?: string;
    accountId: string;
    amount: number;
    direction: Direction;
}

export interface CreateTransactionBody {
    id?: string;
    name?: string;
    entries: TransactionEntry[];
}

export interface TransactionResource {
    id: string;
    name?: string;
    entries: Required<TransactionEntry>[];
}

export const transactionResourceSchema: JSONSchemaType<TransactionResource> = {
    type: "object",
    required: ["id", "entries"],
    properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", nullable: true },
        entries: {
            type: "array",
            items: {
                type: "object",
                required: ["id", "accountId", "amount", "direction"],
                properties: {
                    id: { type: "string", format: "uuid" },
                    accountId: { type: "string", format: "uuid" },
                    amount: { type: "number" },
                    direction: { type: "string", enum: ["debit", "credit"] as Direction[] },
                },
                additionalProperties: false,
            },
        },
    },
    additionalProperties: false,
};

export const create: {
    body: JSONSchemaType<CreateTransactionBody>;
    response: { 200: typeof transactionResourceSchema };
} = {
    body: {
        type: "object",
        required: ["entries"],
        properties: {
            id: { type: "string", format: "uuid", nullable: true },
            name: { type: "string", nullable: true },
            entries: {
                type: "array",
                items: {
                    type: "object",
                    required: ["accountId", "amount", "direction"],
                    properties: {
                        id: { type: "string", format: "uuid", nullable: true },
                        accountId: { type: "string", format: "uuid" },
                        amount: { type: "number", minimum: 0.01 },
                        direction: { type: "string", enum: DirectionValues },
                    },
                    additionalProperties: false,
                },
            },
        },
        additionalProperties: false,
    },
    response: {
        200: transactionResourceSchema,
    },
};
