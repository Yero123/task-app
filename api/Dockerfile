FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install @hono/node-server tsx

COPY . .

EXPOSE 8787

CMD ["npx", "tsx", "src/server.node.ts"]
