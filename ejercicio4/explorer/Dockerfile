FROM node:18

WORKDIR /app

COPY package.json .

COPY app.js .

RUN npm install

RUN mkdir -p /home/alertas_detectadas

CMD ["node", "app.js"]