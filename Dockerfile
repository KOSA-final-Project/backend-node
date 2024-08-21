FROM node:20.15-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 7070

CMD ["node", "src/server.js"]