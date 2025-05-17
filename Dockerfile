FROM oven/bun:latest

RUN apt update && apt install -y openssl

RUN apt install openssl

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

CMD ["sh", "-c", "bun db:deploy && bun dev"]
