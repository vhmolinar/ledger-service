# Ledger Service

Double-entry ledgering is a fundamental accounting principle where every financial transaction is recorded in at least two accounts, ensuring that debits always equal credits. This system maintains the accounting equation: **Assets = Liabilities + Equity**.

### Key Principles
- **Dual Impact**: Every transaction affects at least two accounts
- **Balance Requirement**: Total debits must equal total credits
- **Error Detection**: Imbalanced entries indicate mistakes
- **Complete Picture**: Shows both sources and uses of funds

### Example Transaction
When a company receives $1,000 cash from a customer:
- **Debit**: Cash Account (+$1,000) - Asset increases
- **Credit**: Revenue Account (+$1,000) - Income increases

## Proof of concept

This ledger service is built as a containerized REST API using modern Node.js technologies. The stack consists of:

**Backend Framework:** Fastify (v4.28.1) - A fast and low overhead web framework for Node.js, providing high-performance HTTP server capabilities.

**Language & Runtime:** TypeScript (v5.4.5) with Node.js - Offering type safety and modern JavaScript features for robust development.

**Database:** PostgreSQL 17 with Knex.js (v3.1.0) - A reliable relational database with a flexible query builder for database operations and migrations.

**Testing:** Jest (v30.1.3) with Supertest - Comprehensive testing framework with API testing capabilities, including Testcontainers (v11.5.1) for integration testing with real database instances.

**Development Tools:**
- ESLint with TypeScript support for code quality
- ts-node-dev for hot-reloading during development
- Docker Compose for orchestrating multi-container deployment


## Running

Start the application
```shell
cp .env.sample .env
docker compose up
```

### Endpoints

#### Accounts
Account creation
```shell
curl --location 'http://localhost:3000/accounts' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Bank",
    "direction": "debit"
}'
```
```json
{
    "id": "715547ec-40cd-4394-81ab-2b7bbf9e0fad",
    "name": "Bank",
    "direction": "debit",
    "balance": 0
}
```

Account fetch
```shell
curl --location 'http://localhost:3000/accounts/715547ec-40cd-4394-81ab-2b7bbf9e0fad'
```
```json
{
    "id": "715547ec-40cd-4394-81ab-2b7bbf9e0fad",
    "name": "Bank",
    "direction": "debit",
    "balance": 0
}
```

#### Transactions
Creation
```shell
curl --location 'http://localhost:3000/transactions' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Roll debit",
  "entries": [
    {
      "direction": "debit",
      "accountId": "1f64eeb3-6bee-4f47-9481-40a60f89a396",
      "amount": 1000
    },
     {
      "direction": "credit",
      "accountId": "d8c1d52c-954a-4f58-8db8-f4f55c6f5509",
      "amount": 1000
    }
  ]
}'
```
```json
{
    "id": "5cb573b0-29ab-421c-8c1e-3ae58c349a49",
    "entries": [
        {
            "id": "87e027ed-bb55-4e19-b351-e25cdf202bea",
            "accountId": "1f64eeb3-6bee-4f47-9481-40a60f89a396",
            "amount": 1000,
            "direction": "debit"
        },
        {
            "id": "3af054ce-b304-4fe9-afdf-30a7ed988ff3",
            "accountId": "d8c1d52c-954a-4f58-8db8-f4f55c6f5509",
            "amount": 1000,
            "direction": "credit"
        }
    ],
    "name": "Roll debit"
}
```

## Automated tests

Creating the test database
```shell
docker exec -it ledger-service-db psql -U ledger_service -d ledger_service -c "CREATE DATABASE ledger_service_test;"
```

Running migrations
```shell
NODE_ENV=test npm run migrate:apply
```

Running the tests
```shell
npm run test
```