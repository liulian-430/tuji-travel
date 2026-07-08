FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install
RUN npx nest build || (echo "BUILD FAILED" && exit 1)
RUN ls -la dist/ && echo "Build contents:" && ls -la dist/

EXPOSE 3000

CMD ["sh", "-c", "echo 'Starting app...' && ls -la dist/ && node dist/main.js"]
