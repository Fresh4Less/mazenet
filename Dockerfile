FROM node:carbon as builder

WORKDIR /usr/src/mazenet
COPY ./client/package*.json ./client/
COPY ./server/package*.json ./server/
COPY ./package*.json ./

RUN npm install
ADD ./common ./common

WORKDIR ./client/
RUN npm install
ADD ./client .
RUN npm run build

WORKDIR ../server/
RUN npm install gulp-cli -g
RUN npm install
ADD ./server .
RUN gulp

FROM node:carbon

WORKDIR /usr/src/mazenet
COPY --from=builder /usr/src/mazenet/client/build ./client/build/
COPY --from=builder /usr/src/mazenet/server/build ./server/build/
COPY --from=builder /usr/src/mazenet/server/node_modules ./server/node_modules/
COPY ./server/package*.json ./server/
WORKDIR ./server

EXPOSE 8080
CMD ["npm", "start"]