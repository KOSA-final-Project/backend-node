#!/bin/bash

BEFORE_PORT=$1
AFTER_PORT=$2

# NGINX 설정 변경
sudo sed -i "s/${BEFORE_PORT}/${AFTER_PORT}/" /etc/nginx/conf.d/service-url.inc

# NGINX 재시작
sudo nginx -s reload
echo "NGINX 설정 변경 및 재시작 완료"