const jwt = require('jsonwebtoken');
const issuer = process.env.T_JWT_ISSUER || 'Tangerine';
const expiresIn = process.env.T_JWT_EXPIRES_IN || '1h';
const jwtTokenSecret = require('crypto').randomBytes(256).toString('base64');
const algorithm = process.env.T_JWT_SIGNING_ALGORITHM || 'HS256';
const algorithms = process.env.T_JWT_VERIFICATION_ALGORITHMS || ['HS256', 'HS384', 'HS512'];
const clog = require('tangy-log').clog;
const createLoginJWT = ({ username, permissions }) => {
    const signingOptions = {
        algorithm,
        expiresIn,
        issuer,
        subject: username,
    };
    return jwt.sign({ username, permissions }, jwtTokenSecret, signingOptions);
};
const verifyJWT = (token) => {
    try {
        const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer, algorithms });
        return !!jwtPayload;
    }
    catch (error) {
        clog("JWT verify failed: " + error);
        return false;
    }
};
const decodeJWT = (token) => {
    try {
        const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer, algorithms });
        return jwtPayload;
    }
    catch (error) {
        return undefined;
    }
};
module.exports = {
    createLoginJWT,
    decodeJWT,
    verifyJWT,
};
//# sourceMappingURL=auth-utils.js.map