FROM node:14-alpine AS builder
WORKDIR /usr/src/app/
RUN apk add --no-cache bash
COPY aliases/ webpack.config.js /usr/src/app/aliases/
COPY src/ /usr/src/app/src/
COPY bin/ /usr/src/app/bin/
COPY package-lock.json  package.json tsconfig.json  tslint.json  webpack.config.js /usr/src/app/
RUN npm install
RUN /usr/src/app/bin/build.sh

FROM node:14-alpine
WORKDIR /usr/src/app/
RUN apk add --no-cache bash
COPY package-lock.json  package.json /usr/src/app/
COPY bin/ /usr/src/app/bin/
COPY --from=builder usr/src/app/built/ /usr/src/app/built/
RUN npm install --production
USER node:node
CMD /usr/src/app/bin/start.sh

