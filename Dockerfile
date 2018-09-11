FROM node:10.9

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8088 9228
CMD [ "npm", "run", "dev" ]
