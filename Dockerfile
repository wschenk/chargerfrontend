FROM node:20 as build

WORKDIR /app

COPY package* ./
RUN npm i

COPY . .
RUN npm run build

FROM pierrezemb/gostatic
COPY --from=build /app/dist/ /srv/http/
