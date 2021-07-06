FROM node:alpine
WORKDIR /usr/src/app/
RUN apk add --no-cache bash
COPY . /usr/src/app/
RUN yarn install


CMD ["yarn","test"] 
