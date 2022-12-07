FROM node:18-alpine

ENV IN_DOCKER 1

RUN apk add make

RUN mkdir -p /apps

WORKDIR /apps
