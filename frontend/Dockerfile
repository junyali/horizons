FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter frontend

COPY frontend ./frontend
RUN pnpm --filter frontend run build

FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/frontend/build ./build
COPY --from=builder /app/frontend/package.json ./
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "./build/index.js"]
