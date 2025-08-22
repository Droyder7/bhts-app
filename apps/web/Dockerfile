# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY apps/web/package.json /temp/dev/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY apps/web/package.json /temp/prod/
RUN cd /temp/prod && bun install --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY apps/server /usr/src/server
COPY apps/web/src ./src
COPY apps/web/public ./public
COPY apps/web/package.json ./package.json
COPY apps/web/tsconfig.json ./tsconfig.json
COPY apps/web/vite.config.ts ./vite.config.ts
COPY apps/web/components.json ./components.json

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.nitro .nitro
COPY --from=prerelease /usr/src/app/.output .output
COPY --from=prerelease /usr/src/app/.tanstack .tanstack
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/vite.config.ts .
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "start" ]
