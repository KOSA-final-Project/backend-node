const express = require('express');
const jwt = require('jsonwebtoken');
const {getAllMembers, postMember, getMember, updateMember, deleteMember} = require('../modules/controllers/memberController');
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

router.route('/member/:id')
	.get(getMember)
	.put(updateMember)
	.delete(deleteMember);

router.route('/get-member-id')
	.get((req,res)=>{
		const result = decode(req.cookies, secretKey);
		console.log(result.memberId);
		res.status(200).json(result);
	});


const decode = (tokens, secretKey) => {
	const jwtToken = tokens.jwt;
	try {
		const decoded = jwt.verify(jwtToken, secretKey);
		console.log(decoded);
		return decoded;
	} catch (err) {
		console.error('토큰 파싱 오류:', err.message);
		return null;
	}
};

module.exports = router;