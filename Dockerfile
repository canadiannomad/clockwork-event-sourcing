FROM node:14-alpine AS builder
WORKDIR /usr/src/app/
RUN apk add --no-cache bash
COPY . /usr/src/app/
RUN dos2unix /usr/src/app/bin/*.sh
RUN npm install

CMD ["npm","run","start"] 