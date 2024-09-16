/**
 * fileName       : consumer
 * author         : Yeong-Huns
 * date           : 2024-09-05
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-05        Yeong-Huns       최초 생성
 * 2024-09-05        Yeong-Huns       라운드 로빈 방식 -> 각 서버 고유 큐 지정
 */
const amqp = require('amqplib');
const asyncHandler = require('express-async-handler');
require('dotenv').config();
const queueHandler = require('../handler/queueHandlers');
const {v4: uuidv4} = require('uuid');
const { emitAlarm  } = require('../handler/alarmHandler');

const serverId = uuidv4();
console.log(`ServerID :  ${serverId}`);
let channel;

const receiveMessages = async () => {
	try {
		// RabbitMQ 서버에 연결
		const connection = await amqp.connect(process.env.RABBITMQ_URI);
		channel = await connection.createChannel();

		await channel.assertExchange('alarmExchange', 'topic', { durable: true });
		console.log('Exchange(alarmExchange) 동작확인...');

		await channel.assertExchange('chatExchange', 'topic', { durable: true });
		console.log('Exchange(chatExchange) 동작확인...');

		await channel.assertQueue(serverId, {
			durable: false,
			arguments: {
				'x-dead-letter-exchange': 'deadLetterExchange',
				'x-dead-letter-routing-key': 'deadLetter',
			},
		});
		console.log(`큐(${serverId}) 동작확인...`);

		/*await channel.bindQueue(serverId, 'alarmExchange', 'application');
		await channel.bindQueue(serverId, 'alarmExchange', 'approval');
		console.log('알람 Exchange 바인딩 확인 ...');*/

		await channel.consume(serverId, async (msg) => {
			if (msg !== null) {
				const messageContent = JSON.parse(msg.content.toString());
				const type = messageContent.type;

				console.log(`메세지 수신: ${JSON.stringify(messageContent)}`);
				console.log(`메세지 타입: ${type}`);

				// 라우팅 키에 따른 처리
				switch (type) {
					case 'application':
						await handleApplicationMessage(messageContent);
						break;
					case 'approval':
						await handleApprovalMessage(messageContent);
						break;
					default:
						console.log('지정되지 않은 라우팅 키입니다.');
				}
				channel.ack(msg);
			} else {
				console.error('RabbitMQ 메세지 수신 실패');
			}
		});

		const queues = ['member.create.queue', 'member.update.queue', 'member.delete.queue'];

		for (const queue of queues) {
			await channel.assertQueue(queue, {
				durable: true,
				arguments: {
					'x-dead-letter-exchange': 'deadLetterExchange',
					'x-dead-letter-routing-key': 'deadLetter',
				},
			});
			console.log(`${queue} : 메세지 수신 대기중`);

			// 각 큐의 메시지 수신
			channel.consume(queue, async (msg) => {
				if (msg !== null) {
					console.log(`메세지 수신: ${msg.content.toString()}`);
					const messageContent = JSON.parse(msg.content.toString());

					const handler = queueHandler[queue];

					if (handler) {
						// 요청 객체를 만들어 핸들러 호출
						const req = { body: messageContent };
						const res = {
							status: (code) => ({
								send: (message) => console.log(`Status: ${code}, Message: ${message}`),
							}),
						};
						await handler(req, res);
					} else {
						console.log(`해당 queue 를 처리할 함수가 없습니다 : ${queue}`);
					}
					channel.ack(msg);
				} else {
					console.log("RabbitMQ 메세지 수신 실패");
				}
			});
		}
	} catch (error) {
		console.error('RabbitMQ 설정 중 오류 발생:', error);
	}
};

const handleApplicationMessage = async (message) => {
	const content = JSON.parse(JSON.stringify(message));
	const applicationAlarm = {
		type: 'application-message',
		projectName: content.projectName,
		nickName: content.nickname,
		imgUrl: content.imgUrl,
		jobName: content.jobName,
	}
	emitAlarm(content.projectLeaderId, applicationAlarm);
	console.log(`Application 처리 로직 실행: ${applicationAlarm}`);
};

const handleApprovalMessage = async (message) => {
	const content = JSON.parse(JSON.stringify(message));
	const approvalAlarm = {
		type: 'approval-message',
		projectName: content.projectName,
		acceptStatus: content.acceptStatus,
	}
	emitAlarm(content.receiverMemberId, approvalAlarm);
	console.log(`Approval 처리 로직 실행: ${approvalAlarm}`);
};



module.exports ={
	receiveMessages,
	getServerId: () => serverId,
	getChannel: () => channel,
}
