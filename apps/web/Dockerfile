# syntax=docker/dockerfile:1
# Build a partir da raiz do monorepo:
#   docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=http://localhost:3000 -t pm-web .

# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# A URL da API é embutida no bundle em tempo de build (Vite).
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Build tools porque o yarn instala todo o workspace (inclui o nativo da API).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn workspace @app/web build

# ---- runtime (nginx serve os estáticos) ----
FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
