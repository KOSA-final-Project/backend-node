const SocketIO = require('socket.io');
const { decode } = require('./modules/jwt/decodeToken');
let io;
// 연결된 클라이언트 저장용 객체
let clients = {}
const { getServerId, getChannel } = require('./modules/config/rabbitmq/consumer/consumer')
const Member = require('./modules/models/member');
const asyncHandler = require("express-async-handler");
const { setIO, setClients } = require('./modules/config/rabbitmq/handler/alarmHandler');

module.exports = (server) => {
    io = SocketIO(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://hesil.site/node-api', "https://www.latteve.site"],
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/socket.io'
    });

    setIO(io);
    setClients(clients);

    io.on('connection', asyncHandler(async (socket) => { // 웹 소켓 연결 시
        const req = socket.request;
        console.log('새로운 클라이언트 접속!', socket.id);

        //핸드쉐이크 과정에서 auth 로 토큰가져옴
        const { token } = socket.handshake.auth;
        const secretKey = process.env.COOKIE_SECRET;
        console.log(`핸드쉐이크 성공, 받은 토큰 : ${token}`);
        if (token) {

            console.log('토큰 수신 성공 : ', token);

            // JWT 토큰 디코딩
            const member = decode(token, secretKey);

            if (!member) {
                console.error('인증 실패: 유효하지 않은 토큰입니다.');
                return;
            }

            if (member && member.memberId) {
                clients[member.memberId] = socket.id; // memberId 등록
                console.log(`${member.memberId}(${socket.id}) 등록됨`);
                console.log(clients);

                const queueName = getServerId();
                const channel = getChannel();
                const routingKey = `user.${member.memberId}`;

                if (!channel) {
                    console.error('RabbitMQ 채널이 초기화되지 않았습니다.');
                    return;
                }

                await channel.bindQueue(queueName, 'alarmExchange', routingKey);
                await channel.bindQueue(queueName, 'chatExchange', routingKey);
                console.log(`RabbitMQ가 해당 라우팅 키를 수신합니다.: ${routingKey} -> ${queueName}`);

                // 사용자의 chat_room_list를 사용하여 해당하는 방들에 join
                try {
                    const user = await Member.findById(member.memberId).lean(); // Member 테이블에서 사용자 정보 가져오기

                    if (user && user.chat_room_list && user.chat_room_list.length > 0) {
                        user.chat_room_list.forEach((roomId) => {
                            socket.join(roomId.toString()); // 각 채팅방에 소켓 join
                            console.log(`Socket ${socket.id} joined room ${roomId}`);
                        });
                    } else {
                        console.log(`사용자의 채팅방 목록이 비어있습니다: ${member.memberId}`);
                    }
                } catch (err) {
                    console.error('채팅방 목록을 가져오는 중 오류 발생:', err);
                }

            } else {
                console.log('토큰에서 memberId를 가져오지 못했습니다.');
            }
        } else {
            console.log('Authorization 헤더가 존재하지 않습니다.');
        }

        // 클라이언트가 특정 채팅방에 입장 (방에 참여)
        socket.on('join room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // 특정 방에 있는 사용자들에게 메시지 보내기
        socket.on('private message', (msg) => {
            const { roomId, from, message, fromNickname, fromImgUrl } = msg;
            const sendMessage = {
                ...msg,
                type: 'private'
            }
            const channel = getChannel();
            if(channel){
                channel.publish('chatExchange', '', Buffer.from(JSON.stringify(sendMessage)));
                console.log('RabbitMQ에 메시지 발행:', msg);
            }

            // 해당 roomId에 있는 모든 클라이언트에게 메시지 전송
            /*io.to(roomId).emit('private message', {
                from, // 보낸 사람 ID
                fromNickname,
                fromImgUrl,
                message, // 메시지 내용
                roomId // 방 ID
            });
            console.log(`Message from ${from} to room ${roomId}: ${message}`);*/
        });

        socket.on('disconnect', asyncHandler(async () => { // 연결 종료 시
            console.log('클라이언트 접속 해제',socket.id);
            const memberId = Object.keys(clients).find(key => clients[key] === socket.id);
            const routingKey = `user.${memberId}`;
            const queueName = getServerId();
            const channel = getChannel();

            if (!channel) {
                console.error('RabbitMQ 채널이 초기화되지 않았습니다.');
                return;
            }

            await channel.unbindQueue(queueName, 'alarmExchange', routingKey);
            await channel.unbindQueue(queueName, 'chatExchange', routingKey);
            console.log(`RabbitMQ에서 해당 라우팅키를 제거합니다.: ${routingKey} -> ${queueName}`);
            delete clients[socket.id]; // 연결 해제 시 클라이언트 목록에서 제거
            console.log(clients);
        }));

        socket.on('error', (error) => { // 에러 시
            console.error(error);
        });
    }));
};
function getClients() {
    return clients;
}

module.exports.getClients = getClients;

