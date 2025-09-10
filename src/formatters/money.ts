// TODO: currently only supports currencies with two decimal digits

/**
 * Converts a money amount from decimal format to cents (long format)
 * @param amount - The money amount as a decimal number (e.g., 10.45)
 * @returns The amount in cents as an integer (e.g., 1045)
 */
export function toCents(amount: number): number {
    return Math.floor(amount * 100);
}

/**
 * Converts a money amount from cents (long format) back to decimal format
 * @param cents - The money amount in cents as an integer (e.g., 1045)
 * @returns The amount as a decimal number (e.g., 10.45)
 */
export function fromCents(cents: number): number {
    return cents / 100;
}