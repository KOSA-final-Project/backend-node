const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

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

app.use((req,res,next) => {
    res.status(404).send('Not Found_페이지를 찾을 수 없습니다.');
    next();
});
app.use((err,req,res,next) => {
    console.error(err);
    res.status(500).send(err.message);
})

const PORT = process.env.PORT || 7070;
app.listen(app.get('port'), ()=>{
    console.log(`현재 이 서버는 ${PORT}번 포트에서 가동 중입니다.`);
})

// aa