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

function emitPrivateMessage(roomId, message) {
	if (!io) throw new Error('Socket.io 가 초기화 되지 않았습니다.');
	const room = io.sockets.adapter.rooms.get(roomId);
	// 방에 클라이언트가 있는 경우에만 메시지 전송
	if (room && room.size > 0) {
		io.to(roomId).emit('private message', {message}); // 특정 방에 이벤트 전달
		console.log(`메세지 수신: ${message.from} 방 번호: ${roomId}: ${message}`);
	}
}

function emitJoinRoom(roomInfo){
	if(!io) throw new Error('Socket.io 가 초기화 되지 않았습니다.');

	const socketId = clients[roomInfo.target];
	if(socketId){
		const socket = io.sockets.sockets.get(socketId);
		if(socket){
			socket.join(roomInfo.roomId);
			console.log(` ${roomInfo.roomId} 방입장 ${roomInfo.roomId}`);
		}
	}
}

function setClients(clientObj) {
	clients = clientObj;
}

module.exports = {
	setIO,
	emitAlarm,
	emitPrivateMessage,
	setClients,
	emitJoinRoom,
};