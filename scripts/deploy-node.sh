#!/bin/bash


cd /home/ec2-user/app

DOCKER_APP_NAME=node

EXIST_BLUE=$(sudo docker-compose -p ${DOCKER_APP_NAME}-blue -f docker-compose-node.blue.yml ps | grep Up)

# 1
if [ -z "$EXIST_BLUE" ]; then
        echo "blue up"
         sudo docker-compose -p ${DOCKER_APP_NAME}-blue -f docker-compose-node.blue.yml build --no-cache
         sudo docker-compose -p ${DOCKER_APP_NAME}-blue -f docker-compose-node.blue.yml up -d


        BEFORE_COLOR="green"
        AFTER_COLOR="blue"
        BEFORE_PORT=7072
        AFTER_PORT=7071
else
        echo "green up"
         sudo docker-compose -p ${DOCKER_APP_NAME}-green -f docker-compose-node.green.yml build --no-cache
         sudo docker-compose -p ${DOCKER_APP_NAME}-green -f docker-compose-node.green.yml up -d


        BEFORE_COLOR="blue"
        AFTER_COLOR="green"
        BEFORE_PORT=7071
        AFTER_PORT=7072
fi

echo "${AFTER_COLOR} server up(port:${AFTER_PORT})"

# 2
for cnt in {1..10}
do
        echo "서버 응답 확인중(${cnt}/10)";
        UP=$(curl -s http://127.0.0.1:${AFTER_PORT}/health-check)
        if [ "${UP}" != "up" ]
                then
                        sleep 10
                        continue
                else
                        break
        fi
done

if [ $cnt -eq 10 ]
then
        echo "서버가 정상적으로 구동되지 않았습니다."
        exit 1
fi

# 3
REMOTE_EC2_USER="ec2-user"
REMOTE_EC2_IP="3.39.213.119"
SSH_KEY_PATH="~/.ssh/kosa-msa3.pem"

echo "Nginx 업데이트를 원격 EC2 인스턴스에서 실행합니다."

ssh -i ${SSH_KEY_PATH} ${REMOTE_EC2_USER}@${REMOTE_EC2_IP} "bash -s" < update-nginx.sh ${BEFORE_PORT} ${AFTER_PORT}

echo "Nginx 업데이트 완료."

# 4
echo "$BEFORE_COLOR server down(port:${BEFORE_PORT})"
sudo docker-compose -p ${DOCKER_APP_NAME}-${BEFORE_COLOR} -f docker-compose-node.${BEFORE_COLOR}.yml down