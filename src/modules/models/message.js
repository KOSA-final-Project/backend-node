/**
 * fileName       : message
 * author         : Yeong-Huns
 * date           : 2024-09-04
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-04        Yeong-Huns       최초 생성
 */


const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
		chat_rood_id: {
			type: String,
			required: true,
			index: true,
		},
		sender_id: {
			type: Number,
			ref: "Member",
			required: [true, "sender_id 는 필수 입력 사항입니다."],
			index: true,
		},
		sender_nickname: {
			type: String,
			required: [true, "sender_nickname 은 필수 입력 사항입니다."],
		},
		content: {
			type: String,
			required: true,
		},
	}, {
		timestamps: {createdAt: 'created_at', updatedAt: false}
	},{ versionKey: false });

messageSchema.index({ chat_room_id: 1, created_at: -1 }); // chatRoom & 생성시간 인덱스

const MessageCollections = mongoose.model("Message", messageSchema);

module.exports = MessageCollections;