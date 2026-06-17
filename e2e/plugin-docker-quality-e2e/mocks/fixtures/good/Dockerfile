FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json .
RUN npm ci

FROM node:20-bookworm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["node", "index.js"]
