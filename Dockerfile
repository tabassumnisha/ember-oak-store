# Build from the repository root:  docker build -t ember-oak .
# Stage 1: build the React front end
FROM node:22.14.0-alpine3.21 AS web
WORKDIR /web
COPY ["React Web/package.json", "React Web/package-lock.json", "./"]
RUN npm ci
COPY ["React Web/", "./"]
RUN npm run build

# Stage 2: run the API and serve the built site. The server has no npm dependencies of its own.
FROM node:22.14.0-alpine3.21
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/ember-oak.db
WORKDIR /app
COPY ["Node API/package.json", "./"]
COPY ["Node API/server", "./server"]
COPY database ./database
COPY --from=web /web/dist ./dist
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server/index.js"]
