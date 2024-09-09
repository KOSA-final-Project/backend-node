/**
 * fileName       : member
 * author         : Yeong-Huns
 * date           : 2024-09-04
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-04        Yeong-Huns       최초 생성
 */


const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
	_id: {
		type: Number,
		required: true,
	},
	email: {
		type: String,
		required: true
	},
	nickname: {
		type: String,
		required: true
	},
	img_url: {
		type: String,
		required: true
	},
	is_deleted: {
		type: Date
	},
	chat_room_list: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PrivateChatRoom'
	}]
},{ versionKey: false })
const MemberCollections = mongoose.model("Member", memberSchema);

module.exports = MemberCollections;