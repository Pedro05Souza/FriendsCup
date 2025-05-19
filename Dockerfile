FROM node:22-alpine as build

WORKDIR /app

COPY package.json ./yarn.lock ./

COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

CMD ["node", "dist/index.js"]