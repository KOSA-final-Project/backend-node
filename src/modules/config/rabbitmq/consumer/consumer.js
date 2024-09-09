/**
 * fileName       : consumer
 * author         : Yeong-Huns
 * date           : 2024-09-05
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-05        Yeong-Huns       최초 생성
 */
const amqp = require('amqplib');
const asyncHandler = require('express-async-handler');
require('dotenv').config();
const queueHandler = require('../handler/queueHandlers');

const handleApplicationMessage = asyncHandler(async (message) => {
	console.log(`Application 처리 로직 실행: ${JSON.stringify(message)}`);
	// 실제 로직 추가
});

const handleApprovalMessage = asyncHandler(async (message) => {
	console.log(`Approval 처리 로직 실행: ${JSON.stringify(message)}`);
	// 실제 로직 추가
});


const receiveMessages = asyncHandler(async () => {
	// RabbitMQ 서버에 연결
	const connection = await amqp.connect(process.env.RABBITMQ_URI);
	const channel = await connection.createChannel();

	await channel.assertExchange('alarmExchange', 'topic', { durable: true });
	console.log('Exchange(alarmExchange) 동작확인...');

	await channel.assertQueue('alarm.queue', { durable: true ,
		arguments : {
			'x-dead-letter-exchange': 'deadLetterExchange',
			'x-dead-letter-routing-key': 'deadLetter',
		}});
	console.log('큐(alarm.queue) 동작확인...');

	await channel.bindQueue('alarm.queue', 'alarmExchange', 'application');
	await channel.bindQueue('alarm.queue', 'alarmExchange', 'approval');
	console.log('알람 Exchange 바인딩 확인 ...');

	await channel.consume(
		'alarm.queue',
		asyncHandler(async (msg) => {
			if (msg !== null) {
				const messageContent = JSON.parse(msg.content.toString());
				const routingKey = msg.fields.routingKey;

				console.log(`메세지 수신: ${JSON.stringify(messageContent)}`);
				console.log(`라우팅 키: ${routingKey}`);

				// 라우팅 키에 따른 처리
				switch (routingKey) {
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
		})
	);


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
		await channel.consume(
			queue,
			asyncHandler(async (msg) => {
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
					console.log('RabbitMQ 메세지 수신 실패');
				}
			})
		);
	}
});

module.exports = receiveMessages;