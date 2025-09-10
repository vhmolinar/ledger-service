# Builder
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

RUN npm prune --omit=dev

# Runner
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production \
 PORT=3000

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000
CMD ["node", "dist/server.js"]