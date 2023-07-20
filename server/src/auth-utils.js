const jwt = require('jsonwebtoken');
const issuer = process.env.T_JWT_ISSUER || 'Tangerine';
const expiresIn = process.env.T_JWT_EXPIRES_IN || '1h';
const jwtTokenSecret = require('crypto').randomBytes(256).toString('base64');
// Switch algorithm from 'HS256' to 'none' to test without encryption
const algorithm  =  process.env.T_JWT_SIGNING_ALGORITHM || 'HS256';
const algorithms  =  process.env.T_JWT_VERIFICATION_ALGORITHMS || ['HS256', 'HS384', 'HS512'];
const clog = require('tangy-log').clog

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
  // clog("Verifying JWT" + token)
  try {
    const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer, algorithms });
    // clog("JWT verify result: " + JSON.stringify(jwtPayload))
    return !!jwtPayload;
  } catch (error) {
    clog("JWT verify failed: " + error)
    return false;
  }
};

const decodeJWT = (token) => {
  // clog("Decoding JWT" + token)
  try {
    const jwtPayload = jwt.verify(token, jwtTokenSecret, { issuer, algorithms });
    // clog("JWT decode result: " + JSON.stringify(jwtPayload))
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
