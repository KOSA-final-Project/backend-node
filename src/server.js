const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const dbConnect = require('./modules/config/mongo/mongodb');
const errorHandler = require('./modules/middlewares/errorHandler');
const receiveMessages = require('./modules/config/rabbitmq/consumer/consumer');
const cors = require('cors');
const socket = require('./socket');


dbConnect();
dotenv.config();
const indexRouter = require('./router/index');
const app = express();
app.set('port', process.env.PORT || 7070);

// CORS 설정을 동적으로 생성
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://latteve.site'
        : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
};

// 미들웨어 설정
app.use(
    morgan('dev'),
    express.json(),
    express.urlencoded({extended: false}),
    cookieParser(process.env.COOKIE_SECRET),
    cors(corsOptions)
    );

// 모든 요청 처리 로그 미들웨어
app.use((req, res, next) => {
    console.log("모든 요청 처리중..");
    next();
})

app.use('/', indexRouter); // 라우터

receiveMessages();

// 테스트용
app.get('/error-test', (req, res, next) => {
    const error = new Error('에러 핸들러 테스트입니다!');
    error.status = 500;
    next(error);
});



// 서버 생성
const server = http.createServer(app);

// Socket.io를 서버에 통합
socket(server); // socket.js에서 Socket.io 로직을 설정

app.use(errorHandler);
const PORT = process.env.PORT || 7070;
server.listen(PORT, ()=>{
    console.log(`현재 이 서버는 ${PORT}번 포트에서 가동 중입니다.`);
})

