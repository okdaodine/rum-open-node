const router = require('koa-router')();
const { assert, Errors } = require('../utils/validator');
const db = require('../utils/db');
const { ensurePermission } = require('../middleware/api');

router.get('/me', ensurePermission, get);

async function get(ctx) {
  await db.read();
  const user = db.data.users.find(user => user.id === ctx.verification.userId);
  assert(user, Errors.ERR_NOT_FOUND('user'));
  ctx.body = user;
}

module.exports = router;