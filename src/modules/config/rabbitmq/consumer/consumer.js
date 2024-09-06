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

const receiveMessages = asyncHandler(async () => {
	// RabbitMQ 서버에 연결
	const connection = await amqp.connect(process.env.RABBITMQ_URI);
	const channel = await connection.createChannel();

	const queues = ['member.create.queue', 'member.update.queue', 'member.delete.queue'];

	for (const queue of queues) {
		await channel.assertQueue(queue, {durable: true,
			arguments : {
				'x-dead-letter-exchange': 'deadLetterExchange',
				'x-dead-letter-routing-key': 'deadLetter',
			}
		});
		console.log(`${queue} : 메세지 수신 대기중`);

		channel.consume(queue, async (msg) => {
			if (msg !== null) {
				console.log(`메세지 수신: ${msg.content.toString()}`);
				const messageContent = JSON.parse(msg.content.toString());


				const handler = queueHandler[queue];

				if (handler) {
					// 요청 객체를 만들어 핸들러 호출
					const req = {body: messageContent};
					const res = {
						status: (code) => ({
							send: (message) => console.log(`Status: ${code}, Message: ${message}`),
						}),
					};
					await handler(req, res);
				} else {
					console.log(`해당 queue 를 처리할 함수가 없습니다 : ${queue}`)
				}
				channel.ack(msg);
			} else {
				console.log("RabbitMQ 메세지 수신 실패")
			}
		});
	}
});

module.exports = receiveMessages;