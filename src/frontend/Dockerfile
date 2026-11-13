FROM node:24-alpine AS build

WORKDIR /app/src/frontend

COPY src/frontend/package.json src/frontend/package-lock.json ./

RUN npm ci

COPY src/frontend/ ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/src/frontend/dist /usr/share/nginx/html
COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]