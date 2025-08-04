# Use official node image as the base image
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm i -g npm@latest

RUN npm clean-install

COPY . .

RUN npm run build

# Use official nginx image as the base image
FROM nginx:stable-alpine-perl

COPY --from=build /app/dist/proximamente-v8-2/browser /usr/share/nginx/html

# Copia la plantilla y script de arranque
COPY ./conf/nginx.conf  /etc/nginx/nginx.template.conf
COPY ./conf/start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
