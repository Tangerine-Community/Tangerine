const jwt = require('jsonwebtoken');
const issuer = process.env.T_JWT_ISSUER || 'Tangerine';
const expiresIn = process.env.T_JWT_EXPIRES_IN || '1h';
const jwtTokenSecret = require('crypto').randomBytes(256).toString('base64');

const createLoginJWT = ({ username, permissions }) => {
  const signingOptions = {
    expiresIn,
    issuer,
    subject: username,
  };
  return jwt.sign({ username, permissions }, jwtTokenSecret, signingOptions);
};

const verifyJWT = (token) => {
  try {
    const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer });
    return !!jwtPayload;
  } catch (error) {
    return false;
  }
};

const decodeJWT = (token) => {
  try {
    const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer });
    return jwtPayload;
  } catch (error) {
    return undefined;
  }
};

module.exports = {
  createLoginJWT,
  decodeJWT,
  verifyJWT,
};
