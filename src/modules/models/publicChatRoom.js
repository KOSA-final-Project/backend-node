/**
 * fileName       : publicChatRoom
 * author         : Yeong-Huns
 * date           : 2024-09-04
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-04        Yeong-Huns       최초 생성
 */

const mongoose = require('mongoose');

const publicChatRoomSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		auto: true,
	},
	title: {
		type: String,
		required: [true, "채팅방 이름은 필수입니다."],
	},
	participant: [
		{
			member_id: {
				type: Number,
				ref: 'Member',
				required: true,
			},
			_id: false
		},
	],
},{ versionKey: false })

publicChatRoomSchema.index({ 'participant.member_id': 1 });

const PublicChatRoomCollections = mongoose.model("Public_chat_room", publicChatRoomSchema);

module.exports = PublicChatRoomCollections;