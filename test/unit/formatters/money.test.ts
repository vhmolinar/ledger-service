import { toCents, fromCents } from "@/formatters/money";

describe("toCents", () => {
    test("should convert decimal amounts to cents correctly", () => {
        expect(toCents(10.45)).toBe(1045);
        expect(toCents(0.01)).toBe(1);
    });
});

describe("fromCents", () => {
    test("should convert cents to decimal amounts correctly", () => {
        expect(fromCents(1045)).toBe(10.45);
        expect(fromCents(1)).toBe(0.01);
    });
});