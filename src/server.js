const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const dbConnect = require('./modules/config/mongodb');
const errorHandler = require('./modules/middlewares/errorHandler');


dbConnect();
dotenv.config();
const indexRouter = require('./router/index');
const app = express();
app.set('port', process.env.PORT || 7070);

app.use(
    morgan('dev'),
    express.json(),
    express.urlencoded({extended: false}),
    cookieParser(process.env.COOKIE_SECRET),
    );

app.use((req, res, next) => {
    console.log("모든 요청 처리중..");
    next();
})

app.use('/node-api', indexRouter); // 라우터


// 테스트용
app.get('/error-test', (req, res, next) => {
    const error = new Error('에러 핸들러 테스트입니다!');
    error.status = 500;
    next(error);
});


app.use(errorHandler);

const PORT = process.env.PORT || 7070;
app.listen(app.get('port'), ()=>{
    console.log(`현재 이 서버는 ${PORT}번 포트에서 가동 중입니다.`);
})

