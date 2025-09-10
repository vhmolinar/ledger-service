import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\.ts$": ["ts-jest", {
            useESM: true
        }],
        "^.+\\.m?js$": "ts-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!uuid)",
    ],
    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/?(*.)+(spec|test).ts"
    ],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/server.ts"
    ],
    testTimeout: 60000,
    setupFilesAfterEnv: ["<rootDir>/test/config/setup.ts"],
    globalTeardown: "<rootDir>/test/config/teardown.ts"
};

export default jestConfig;
