const jwt = require('jsonwebtoken');
const expiresIn = process.env.JWT_TOKEN_VALIDITY || '15 minutes';
const issuer = process.env.JWT_TOKEN_ISSUER || 'Tangerine Devs';
const jwtTokenSecret =
  process.env.JWT_TOKEN_SECRET ||
  'tstststsgsvdsjheytetew4567823e76tfvbendi876tfvewbndfitw562yhwbdnfjytf2wvedtrrfwvbhytfwhystrwfgtwfgwhygwvbtwtgvwftwghbb';

const createLoginJWT = ({ username }) => {
  const signingOptions = {
    expiresIn,
    issuer,
    subject: username,
  };
  return jwt.sign({ username }, jwtTokenSecret, signingOptions);
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
