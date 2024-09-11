/**
 * fileName       : privateChatRoomController
 * author         : yunbin
 * date           : 2024-09-06
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-06        yunbin       최초 생성
 */

const asyncHandler = require("express-async-handler");
const PrivateChatRoom = require('../models/privateChatRoom');
const Member = require('../models/member');
const Message = require("../models/message");
const {decode} = require("../jwt/decodeToken");
const secretKey = process.env.COOKIE_SECRET;

// Private Chat Room 생성
const postPrivateChatRoom = asyncHandler(async (req, res) => {
    const { participants } = req.body; // 참가자 ID 배열을 받음

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).send("참가자 목록이 유효하지 않습니다.");
    }

    // participant 배열을 participant 객체에 맞게 변환
    const participantData = participants.map(memberId => ({
        member_id: memberId, // member_id 필드로 변환
    }));

    // 새로운 PrivateChatRoom 생성
    const privateChatRoom = new PrivateChatRoom({
        participant: participantData // 변환된 participantData를 저장
    });

    // MongoDB에 저장
    await privateChatRoom.save();

    // 참가자들의 chat_room_list 필드 업데이트
    await Promise.all(
        participants.map(async (memberId) => {
            await Member.findByIdAndUpdate(memberId, {
                $push: { chat_room_list: privateChatRoom._id }
            });
        })
    );

    res.status(201).json({ message: "Private chat room 생성 성공", room_id: privateChatRoom._id });
});

const getPrivateChatRooms =
    asyncHandler(async (req, res)=>{
        // JWT 토큰에서 현재 사용자 memberId 추출
        console.log("jwt", req.cookies.jwt);
        const result = decode(req.cookies.jwt, secretKey);
        const currentMemberId = result.memberId;
        //const currentMemberId = 13;

        // 해당 멤버의 chat_room_list를 가져옴
        const member = await Member.findById(currentMemberId);
        if (!member || !member.chat_room_list) {
            return res.status(404).send("채팅방 목록이 존재하지 않습니다.");
        }

        // chat_room_list에 있는 모든 채팅방을 찾기
        const chatRoomIds = member.chat_room_list; // 멤버의 chat_room_list 가져오기

        // PrivateChatRoom에서 해당 chat_room_list와 일치하는 채팅방과 그 참가자 가져오기
        const chatRooms = await PrivateChatRoom.find({ _id: { $in: chatRoomIds } });

        // currentUser 정보 추출
        const currentUser = await Member.findById(currentMemberId).lean();

        // 각 채팅방의 참가자와 해당 채팅방의 메시지를 함께 가져옴
        const chatRoomData = await Promise.all(chatRooms.map(async (room) => {
            // 해당 채팅방의 참가자 목록
            const participantIds = room.participant.map(p => p.member_id);

            // 참가자의 상세 정보를 가져옴
            const participants = await Member.find({ _id: { $in: participantIds } }).lean();

            // 본인을 제외한 나머지 참가자 필터링
            const otherParticipants = participants.filter(participant => participant._id.toString() !== currentMemberId.toString());

            // 해당 채팅방의 메시지 가져오기
            const messages = await Message.find({ chat_room_id: room._id })
                .sort({ created_at: 1 }) // 오래된 메세지부터 정렬
                .exec();

            return {
                room_id: room._id,
                participants: otherParticipants,
                messages: messages // 메시지 목록
            };
        }));

        res.status(200).json({
            currentUser,
            chatRoom: chatRoomData
        });
    })
module.exports = { postPrivateChatRoom, getPrivateChatRooms};