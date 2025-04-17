# 1. Сборка frontend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src

RUN npm install && npm run build

# 2. Сборка backend
FROM node:18-alpine AS server-build

WORKDIR /server

COPY server/package*.json ./
COPY server/tsconfig.json ./
COPY server/server.ts ./server.ts

RUN npm install
RUN npx tsc

# 3. Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем фронт
COPY --from=builder /app/dist ./public

# Копируем бэкенд
COPY --from=server-build /server/dist ./dist
COPY --from=server-build /server/node_modules ./node_modules
COPY server/package.json ./

# Экспонируем порт
EXPOSE 4000

# Запуск сервера
CMD ["node", "dist/server.js"]
