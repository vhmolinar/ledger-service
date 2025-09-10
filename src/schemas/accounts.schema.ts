import { JSONSchemaType } from "ajv";
import { Direction, DirectionValues } from "../domain/direction"

export interface CreateAccountBody {
    id?: string;
    name: string;
    direction: Direction;
}

export interface GetAccountParams {
    id: string;
}

export interface AccountResource {
    id: string;
    name: string;
    direction: Direction;
    balance: number;
}

export const accountResourceSchema: JSONSchemaType<AccountResource> = {
    type: "object",
    required: ["id", "name", "direction", "balance"],
    properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        direction: { type: "string", enum: DirectionValues },
        balance: { type: "number" },
    },
    additionalProperties: false,
};

export const create: {
    body: JSONSchemaType<CreateAccountBody>;
    response: { 200: typeof accountResourceSchema };
} = {
    body: {
        type: "object",
        required: ["name", "direction"],
        properties: {
            id: { type: "string", format: "uuid", nullable: true },
            name: { type: "string", minLength: 1 },
            direction: { type: "string", enum: DirectionValues },
        },
        additionalProperties: false,
    },
    response: {
        200: accountResourceSchema,
    },
};

export const fetch: {
    params: JSONSchemaType<GetAccountParams>;
    response: { 200: typeof accountResourceSchema };
} = {
    params: {
        type: "object",
        required: ["id"],
        properties: {
            id: { type: "string", format: "uuid" },
        },
        additionalProperties: false,
    },
    response: {
        200: accountResourceSchema,
    },
};
