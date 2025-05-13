FROM oven/bun:alpine

RUN apk add --no-cache openssl3 

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bunx prisma generate


CMD [ "bun", "src/index.ts" ]