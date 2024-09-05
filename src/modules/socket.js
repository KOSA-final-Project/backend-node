const SocketIO = require('socket.io');

module.exports = (server) => {
    const io = SocketIO(server, {path: '/socket.io'});

    io.on('connection', (socket) => { // 웹 소켓 연결 시
        const req = socket.request;
        const ip = req.header['x-forwarded-for'] || req.socket.remoteAddress;
        console.log('새로운 클라이언트 접속!', ip, socket.id);
        
        socket.on('disconnect', ()=>{ // 연결 종료 시
            console.log('클라이언트 접속 해제', ip, socket.id);
            clearInterval(socket.interval);
        });
        socket.on('error', (error)=> { // 에러 시
            console.error(error);
        });
        socket.on('reply', (data)=> { // 클라이언트로부터 메세지 수신 시
            console.log(data);
        });
        socket.interval = setInterval(()=> { // 3초마다 클라이언트로 메세지 전송
            socket.emit('news', 'Hello Socket.IO'); // 이벤트 이름, 데이터
        }, 3000);
    });
};