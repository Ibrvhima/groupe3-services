#!/bin/sh
# Substitue UNIQUEMENT ${BACKEND_INTERNAL_URL} — laisse les variables nginx ($uri, $host...) intactes
envsubst '${BACKEND_INTERNAL_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf
