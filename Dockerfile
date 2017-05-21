FROM node:6.10.2
MAINTAINER sascha.bialon@shabbtech.com

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 8001
CMD ["node", "index.js"]
