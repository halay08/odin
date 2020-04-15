## Build step 1
FROM node:12.18.2 AS builder

ARG NPM_TOKEN=$(NPM_TOKEN)

WORKDIR /app

RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /root/.npmrc
COPY package*.json ./

RUN npm install
RUN rm -rf /root/.npmrc

COPY . .
RUN npm run build

## Build step 2
FROM node:12.18.2-alpine
WORKDIR /app
# Only add what we need to run the app
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/node_modules /app/node_modules

ENTRYPOINT ["node", "/app/dist/main.js"]
