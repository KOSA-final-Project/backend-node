const jwt = require("jsonwebtoken");
export const decode = (tokens, secretKey) => {
    console.log('decode 함수 호출됨')
    try {
        console.log(tokens);
        const decoded = jwt.verify(tokens, secretKey);
        console.log(decoded);
        return decoded;
    } catch (err) {
        console.error('토큰 파싱 오류:', err.message);
        return null;
    }
};