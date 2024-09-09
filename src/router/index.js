const { decode } = require('../modules/jwt/decodeToken');

const express = require('express');
const {getAllMembers, postMember, getMember, updateMember, deleteMember} = require('../modules/controllers/memberController');
const {postPrivateChatRoom, getPrivateChatRooms} = require("../modules/controllers/privateChatRoomController");
const {postMessage} = require("../modules/controllers/messageController");
const router = express.Router();
const secretKey = process.env.COOKIE_SECRET;

router.route('/')
	.get((req, res) => {
		res.send('Welcome');
	});


router.route('/health-check')
	.get((req,res)=>{
		res.send('up')
	});

router.route('/member')
	.get(getAllMembers)
	.post(postMember);

router.route('/members')
	.get(getMember)
	.put(updateMember)
	.delete(deleteMember);

router.route('/get-member-id')
	.get((req,res)=>{
		const result = decode(req.cookies.jwt, secretKey);
		console.log(result.memberId);
		res.status(200).json(result);
	});

router.route('/private-chat-rooms')
	.get(getPrivateChatRooms)
	.post(postPrivateChatRoom);

router.route('/messages')
	.post(postMessage);


module.exports = router;