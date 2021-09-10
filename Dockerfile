FROM node:15-alpine3.12 AS builder-base
RUN mkdir /opt/node-analyser

WORKDIR /opt/node-analyser
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .

### DEV

FROM builder-base AS node-analyser-dev
ENTRYPOINT [ "yarn", "start-dev" ]

### PROD

FROM builder-base AS builder-node-analyser-prod
ENV NODE_ENV=production
RUN yarn build

FROM node:15-alpine3.12 AS node-analyser-prod
ENV NODE_ENV=production
RUN mkdir /opt/node-analyser
WORKDIR /opt/node-analyser
COPY ./package.json .
COPY ./yarn.lock .
COPY --from=builder-node-analyser-prod /opt/node-analyser/dist /opt/node-analyser
ENTRYPOINT [ "node", "app.js" ]