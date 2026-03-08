FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install @hono/node-server tsx

COPY . .

EXPOSE 8787

CMD ["npm", "run", "start:docker"]
