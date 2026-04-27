FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
COPY src ./src

RUN npm install && npm run build

ENV NODE_ENV=production

EXPOSE 1337

CMD ["node", "dist/index.js"]