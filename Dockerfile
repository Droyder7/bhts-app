# Base image for both applications
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Server dependencies stage
FROM base AS server-deps
RUN mkdir -p /temp/server/dev /temp/server/prod
COPY apps/server/package.json /temp/server/dev/
RUN cd /temp/server/dev && bun install
COPY apps/server/package.json /temp/server/prod/
RUN cd /temp/server/prod && bun install --production

# Web dependencies stage
FROM base AS web-deps
RUN mkdir -p /temp/web/dev /temp/web/prod
COPY apps/web/package.json /temp/web/dev/
RUN cd /temp/web/dev && bun install
COPY apps/web/package.json /temp/web/prod/
RUN cd /temp/web/prod && bun install --production

# Server build stage
FROM base AS server-build
COPY --from=server-deps /temp/server/dev/node_modules node_modules
COPY apps/server/src ./src
COPY apps/server/package.json ./package.json
COPY apps/server/tsconfig.json ./tsconfig.json
ENV NODE_ENV=production
RUN bun run build

# Web build stage
FROM base AS web-build
COPY --from=web-deps /temp/web/dev/node_modules node_modules
COPY apps/server /usr/src/server
COPY apps/web/src ./src
COPY apps/web/public ./public
COPY apps/web/package.json ./package.json
COPY apps/web/tsconfig.json ./tsconfig.json
COPY apps/web/vite.config.ts ./vite.config.ts
COPY apps/web/components.json ./components.json
ENV NODE_ENV=production
RUN bun run build

# Server production stage
FROM base AS server
COPY --from=server-deps /temp/server/prod/node_modules node_modules
COPY --from=server-build /usr/src/app/dist dist
COPY --from=server-build /usr/src/app/package.json .
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]

# Web production stage
FROM base AS web
COPY --from=web-deps /temp/web/prod/node_modules node_modules
COPY --from=web-build /usr/src/app/.nitro .nitro
COPY --from=web-build /usr/src/app/.output .output
COPY --from=web-build /usr/src/app/.tanstack .tanstack
COPY --from=web-build /usr/src/app/tsconfig.json .
COPY --from=web-build /usr/src/app/vite.config.ts .
COPY --from=web-build /usr/src/app/package.json .
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "start" ]