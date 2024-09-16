const jwt = require("jsonwebtoken");

export const decode = (token, secretKey) => {
    console.log('decode 함수 호출됨');
    if (!token) {
        console.error('토큰이 제공되지 않았습니다.');
        return null;
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('디코딩된 토큰:', decoded);
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('토큰이 만료되었습니다.');
        } else if (err.name === 'JsonWebTokenError') {
            console.error('유효하지 않은 토큰입니다.');
        } else {
            console.error('토큰 파싱 오류:', err.message);
        }
        return null;
    }
};
