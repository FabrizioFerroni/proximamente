# Use official node image as the base image
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN npm run build

# Use official nginx image as the base image
FROM nginx:stable-alpine-perl

COPY --from=build /app/dist/proximamente-v8-2/browser /usr/share/nginx/html

COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
