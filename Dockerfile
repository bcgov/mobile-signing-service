FROM node:10.9

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm ci --silent

COPY . .

EXPOSE 8089 9229
CMD [ "npm", "run", "dev" ]
