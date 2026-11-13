FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app/src/backend

COPY src/backend/package.json src/backend/package-lock.json ./

RUN npm ci --omit=dev

COPY src/backend/ ./

USER node

EXPOSE 3000

CMD ["node", "index.js"]