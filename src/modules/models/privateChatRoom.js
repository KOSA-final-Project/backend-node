/**
 * fileName       : privateChatRoom
 * author         : Yeong-Huns
 * date           : 2024-09-04
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-04        Yeong-Huns       최초 생성
 */

const mongoose = require('mongoose');

const privateChatRoomSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		auto: true,
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

privateChatRoomSchema.index({ 'participant.member_id': 1 });

const PrivateChatRoomCollections = mongoose.model("Private_chat_room", privateChatRoomSchema);

module.exports = PrivateChatRoomCollections;