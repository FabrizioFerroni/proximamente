#!/bin/sh

# Reemplaza la variable de entorno en el template y genera el archivo final
envsubst '$API_URL' < /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf

# Inicia nginx
nginx -g 'daemon off;'
