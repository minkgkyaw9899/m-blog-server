FROM oven/bun:latest

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

# COPY .env.production .env
EXPOSE 5000

CMD [ "bun", "src/index.ts" ]