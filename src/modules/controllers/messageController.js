const asyncHandler = require("express-async-handler");
const Message = require('../models/message'); // Message 모델 가져오기

// POST Message 생성
const postMessage = asyncHandler(async (req, res) => {
    const { chat_room_id, sender_id, sender_nickname, content } = req.body; // 요청에서 필요한 데이터 가져오기

    // 필수 데이터 확인
    if (!chat_room_id || !sender_id || !sender_nickname || !content) {
        return res.status(400).send("필수 데이터가 누락되었습니다.");
    }

    // 새로운 Message 인스턴스 생성
    const newMessage = new Message({
        chat_room_id: chat_room_id,
        sender_id: sender_id,
        sender_nickname: sender_nickname,
        content: content,
    });

    // MongoDB에 메시지 저장
    await newMessage.save();

    // 성공 응답
    res.status(201).json({
        message: "메시지 저장 성공",
        data: newMessage
    });
});

module.exports = { postMessage };
