const httpStatus = require('http-status');
const { assert, Errors, throws } = require('../utils/validator');
const tokenUtil = require('../utils/token');

exports.errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (![400, 401, 404].includes(err.status)) {
      console.log(err);
    }
    console.log(err);
    if (
      err.status &&
      err.status >= httpStatus.BAD_REQUEST &&
      err.status < httpStatus.INTERNAL_SERVER_ERROR
    ) {
      ctx.throws(err);
      return;
    }
    throw err;
  }
};

exports.extendCtx = async (ctx, next) => {
  ctx.ok = data => {
    ctx.body = data;
  };
  ctx.er = (error, code) => {
    ctx.status = code || 400;
    ctx.body = error;
  };
  ctx.throws = (err) => {
    const code = err.code;
    if (code === 'ERR_NOT_FOUND') {
      ctx.status = httpStatus.NOT_FOUND;
    } else if (code === 'ERR_TOO_MANY_REQUEST') {
      ctx.status = httpStatus.TOO_MANY_REQUESTS;
    } else {
      ctx.status = err.status || httpStatus.BAD_REQUEST;
    }
    ctx.body = {
      code,
      message: err.message
    };
  };
  await next();
};

exports.ensurePermission = async (ctx, next) => {
  const authorization = ctx.headers['authorization'];
  assert(authorization, Errors.ERR_IS_REQUIRED('authorization'));
  const token = authorization.split('Bearer ')[1];
  assert(token, Errors.ERR_IS_REQUIRED('token'));
  try {
    const tokenData = tokenUtil.verify(token);
    ctx.verification = {
      userId: tokenData.data
    }
  } catch (_) {
    throws(Errors.ERR_IS_INVALID('token'));
  }
  await next();
}