/**
 * fileName       : mongodb
 * author         : Yeong-Huns
 * date           : 2024-09-04
 * ===========================================================
 * DATE              AUTHOR             NOTE
 * -----------------------------------------------------------
 * 2024-09-04        Yeong-Huns       최초 생성
 */

const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGODB_URI);
		console.log("DB 연결완료");
	} catch (err) {
		console.log("DB 연결실패");
	}
}
module.exports = dbConnect;