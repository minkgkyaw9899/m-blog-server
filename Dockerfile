FROM oven/bun:latest

RUN apt update && apt upgrade -y

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN chmod +x ./script.sh

CMD ["bun dev", "sh script.sh"]
