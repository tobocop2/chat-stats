FROM node:14-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production  

COPY . .
RUN npm run build:ts
USER node
