/**
 * fileName       : alarmHandler
 * author         : Yeong-Huns
 * date           : 2024-09-14
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-14        Yeong-Huns       최초 생성
 */
let io;
let clients = {};

function setIO(socketIOInstance) {
	io = socketIOInstance;
}

function emitAlarm(target, message) {
	if (!io) {
		throw new Error('Socket.io 가 초기화 되지 않았습니다.');
	}
	const targetId = target;
	const targetSocketId = clients[targetId];
	console.log(`타겟아이디: ${targetId}, 타겟의 소켓ID: ${targetSocketId}`);


	if (targetSocketId) {
		io.to(targetSocketId).emit('alarm', { message }); // 특정 소켓에만 이벤트 전달
		console.log(`알람 전달 대상: ${targetId}, 메시지: ${JSON.stringify(message)}`);
	}
}

function setClients(clientObj) {
	clients = clientObj;
}

module.exports = {
	setIO,
	emitAlarm,
	setClients,
};