const config = require('../config');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const DEFAULT_EXPIRED_DAY = 365;
const HOUR_SECONDS = 60 * 60;
const DAY_SECONDS = HOUR_SECONDS * 24;
exports.HOUR_SECONDS = HOUR_SECONDS;

exports.create = (data, options = {}) => {
  const jwtOptions = {};

  if (!options.noExpiration) {
    jwtOptions.expiresIn = ~~options.expiresIn || DEFAULT_EXPIRED_DAY * DAY_SECONDS;
  }

  const payload = {
    iat: Math.floor(Date.now() / 1000),
    jti: uuid.v4(),
    data,
  };

  const token = jwt.sign(
    payload,
    config.jwtKey,
    jwtOptions
  );

  return token;
};

exports.verify = token => {
  const decodedToken = jwt.verify(token, config.jwtKey);
  return decodedToken;
};
