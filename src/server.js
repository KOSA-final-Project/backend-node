const express = require('express');
const app = express();

app.get("/node-api/health-check", (req, res)=> {
    res.send("up");
})

const PORT = process.env.PORT || 7070;
app.listen(PORT, ()=>{
    console.log(`현재 이 서버는 ${PORT}번 포트에서 가동 중입니다.`);
})

// aa