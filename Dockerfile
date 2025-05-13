FROM oven/bun:alpine

RUN apk add --no-cache openssl3 

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

COPY .env.production .env

# RUN bunx prisma db pull

CMD [ "bun", "src/index.ts" ]