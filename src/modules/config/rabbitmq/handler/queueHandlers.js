/**
 * fileName       : queueHandlers
 * author         : Yeong-Huns
 * date           : 2024-09-06
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-06        Yeong-Huns       최초 생성
 */
 const { postMember, updateMember, deleteMember } = require('../../../controllers/memberController');
 // const {} = require();  웹 소켓

const queueHandlers = {
	'member.create.queue': postMember,
	'member.update.queue': updateMember,
	'member.delete.queue': deleteMember,
};

module.exports = queueHandlers;