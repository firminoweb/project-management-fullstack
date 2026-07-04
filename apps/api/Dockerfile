# syntax=docker/dockerfile:1
# Build a partir da raiz do monorepo:
#   docker build -f apps/api/Dockerfile -t pm-api .

# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Ferramentas para compilar o better-sqlite3 (dependência nativa).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Instala as dependências a partir dos manifests (melhor cache de camadas).
COPY package.json yarn.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN yarn install --frozen-lockfile

# Copia o restante e compila apenas a API.
COPY . .
RUN yarn workspace @app/api build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# node_modules já traz o binário nativo compilado na mesma imagem base.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "dist/main"]
