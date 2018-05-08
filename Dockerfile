FROM node:carbon as builder

WORKDIR /usr/src/mazenet
COPY ./client/package*.json ./client/
COPY ./server/package*.json ./server/

WORKDIR ./client/
RUN npm install
RUN npm run build

WORKDIR ../server/
RUN npm install gulp-cli -g
RUN npm install
RUN gulp

FROM node:carbon

WORKDIR /usr/src/mazenet
COPY --from=builder /usr/src/mazenet/client/build ./client/build/
COPY --from=builder /usr/src/mazenet/server/build ./server/build/

EXPOSE 8080
CMD ["npm", "start", "server"]
