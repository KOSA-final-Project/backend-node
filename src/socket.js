const SocketIO = require('socket.io');
const { decode } = require('./modules/jwt/decodeToken');

module.exports = (server) => {
    const io = SocketIO(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/socket.io'
    });

    // 연결된 클라이언트 저장용 객체
    let clients = {}

    io.on('connection', (socket) => { // 웹 소켓 연결 시
        const req = socket.request;
        const ip = req.socket.remoteAddress; // 클라이언트의 ip 주소
        console.log('새로운 클라이언트 접속!', ip, socket.id);

        // 쿠키에서 JWT 토큰을 가져와 memberId 추출
        const cookies = req.headers.cookie;
        const secretKey = process.env.COOKIE_SECRET;

        if (cookies) {
            const jwtToken = cookies.split('; ').find(row => row.startsWith('jwt=')).split('=')[1];

            const member = decode(jwtToken, secretKey);

            if (member && member.memberId) {
                clients[member.memberId] = socket.id; // memberId 등록
                console.log(`${member.memberId}(${socket.id}) 등록됨`);
                console.log(clients);
            } else {
                console.log('토큰에서 memberId를 가져오지 못했습니다.');
            }
        } else {
            console.log('쿠키가 존재하지 않습니다.');
        }

        // 특정 클라이언트에게 메시지 보내기
        socket.on('private message', (targetMemberId, msg) => {
            // memberId를 이용해 socket.id 찾기
            const targetSocketId = Object.keys(clients).find(id => clients[id] === targetMemberId);

            if (targetSocketId) {
                // 해당 클라이언트에게 메시지 보내기
                io.to(targetSocketId).emit('private message', {
                    from: clients[socket.id], // 메시지를 보낸 사용자
                    message: msg
                });
                console.log(`메시지 전송: ${clients[socket.id]} -> ${targetMemberId}: ${msg}`);
            } else {
                console.log(`사용자 ${targetMemberId}를 찾을 수 없음`);
            }
        });

        socket.on('disconnect', ()=>{ // 연결 종료 시
            console.log('클라이언트 접속 해제', ip, socket.id);
            delete clients[socket.id]; // 연결 해제 시 클라이언트 목록에서 제거
            console.log(clients);
            clearInterval(socket.interval);
        });

        socket.on('error', (error)=> { // 에러 시
            console.error(error);
        });
    });
};