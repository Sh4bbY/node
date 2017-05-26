FROM node:6.10.3-alpine

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/

RUN apk add --no-cache --virtual .gyp python make g++ \
 && yarn --pure-lockfile --production

COPY . /usr/src/app

EXPOSE 8001
CMD ["node", "index.js"]
