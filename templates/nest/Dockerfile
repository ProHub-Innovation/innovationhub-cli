FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

FROM base AS production
WORKDIR /usr/src/app
COPY --from=base /usr/src/app ./
COPY . .
RUN npm run build
RUN npm prune --production

FROM base AS development
WORKDIR /usr/src/app
COPY --from=base /usr/src/app ./
COPY . .