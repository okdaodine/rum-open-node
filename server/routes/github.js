const router = require('koa-router')();
const { assert, Errors, throws } = require('../utils/validator');
const axios = require('axios');
const config = require('../config');
const db = require('../utils/db');
const tokenUtil = require('../utils/token');

router.get('/login', login);
router.get('/callback', callback);

async function login(ctx) {
  assert(ctx.query.redirect_to, Errors.ERR_IS_REQUIRED('redirect_to'));
  ctx.session.redirect_to = ctx.query.redirect_to;
  ctx.redirect(`https://github.com/login/oauth/authorize?client_id=${config.github.client_id}&scope=read:user`);
}

async function callback(ctx) {
  try {
    const code = ctx.query.code;
    const accessTokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: config.github.client_id,
      client_secret: config.github.client_secret,
      code,
    });
    const query = accessTokenRes.data;
    const parsedQuery = {};
    for (const item of query.split('&')) {
      const [ key, value ] = item.split('=');
      parsedQuery[key] = value;
    }
    const { data: githubUser } = await axios.get(`https://api.github.com/user`, {
      headers: {
        Authorization: `Bearer ${parsedQuery.access_token}`
      }
    });
    await db.read();
    let user = db.data.users.find(user => user.id === githubUser.login);
    if (!user) {
      user = {
        id: githubUser.login,
        avatar: githubUser.avatar_url
      };
      db.data.users.push(user);
      await db.write();
    }
    ctx.redirect(`${ctx.session.redirect_to}?token=${tokenUtil.create(user.id)}`);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

module.exports = router;