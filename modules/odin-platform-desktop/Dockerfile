# build environment
FROM node:12.18.2 AS build

WORKDIR /app

ARG NPM_TOKEN=$(NPM_TOKEN)


RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /root/.npmrc

COPY package*.json ./

ENV NODE_ENV=production

RUN npm rebuild node-sass
RUN npm install react-scripts -g --silent
RUN npm install

COPY . .
RUN npm run build

# production environment
FROM nginx:1.15.8-alpine
COPY --from=build /app/build /usr/share/nginx/html

ENV NODE_ENV=production

# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

