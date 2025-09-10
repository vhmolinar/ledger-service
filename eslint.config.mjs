import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        node: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "semi": ["error", "always"],
      "quotes": ["error", "double", {
        "avoidEscape": true,
        "allowTemplateLiterals": false
      }]
    }
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        node: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "writable",
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        beforeAll: "readonly",
        afterEach: "readonly",
        afterAll: "readonly",
        jest: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "semi": ["error", "always"],
      "quotes": ["error", "double", {
        "avoidEscape": true,
        "allowTemplateLiterals": false
      }]
    }
  },
  {
    ignores: ["dist/", "node_modules/", "**/*.js"]
  }
];