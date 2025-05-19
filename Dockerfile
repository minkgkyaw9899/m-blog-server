FROM oven/bun:latest

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

CMD ["sh", "-c", "bun db:generate && bun db:push && bun dev"]
