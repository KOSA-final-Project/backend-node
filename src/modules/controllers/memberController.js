/**
 * fileName       : memberController
 * author         : Yeong-Huns
 * date           : 2024-09-05
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-05        Yeong-Huns       최초 생성
 */

const asyncHandler = require("express-async-handler");
const Member = require('../models/member');

// GET Members
const getAllMembers =
	asyncHandler(async (req, res) => {
		const members = await Member.find();
		res.status(200).send(members);
	});

// Create Member
const postMember =
	asyncHandler(async (req, res) => {
		console.log(req.body);
		const {_id, email, nickname, img_url} = req.body;
		if (!_id || !email || !nickname || !img_url) {
			return res.status(400).send("필수 값이 입력되지 않았습니다.")
		}
		const member = await Member.create({
			_id, email, nickname, img_url
		});
		res.status(201).send("멤버 생성 성공");
	})

// GET Member/:id
const getMember =
	asyncHandler(async (req, res) => {
		const member = await Member.findById(req.params.id);
		res.status(200).send(member);
	});

// UPDATE Member/:id
const updateMember =
	asyncHandler(async (req, res) => {
		const id = req.params.id;
		const {nickname, img_url} = req.body;
		const member = await Member.findById(id);
		if (!member) throw new Error("결과 없음 update 실패")

		member.nickname = nickname;
		member.img_url = img_url;

		await member.save();
		res.status(200).send("업데이트 성공");
	});

//DELETE Member/ :id
const deleteMember =
	asyncHandler(async (req, res) => {
		const id = req.params.id;

		const member = await Member.findById(id);
		if (!member) throw new Error("member 조회 실패");
		await Member.deleteOne();
		res.send("member 삭제 완료");
	});


module.exports = {getAllMembers, postMember, getMember, updateMember, deleteMember};