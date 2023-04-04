const router = require('koa-router')();
const config = require('../config');
const { ensurePermission } = require('../middleware/api');
const { RumFullNodeClient } = require('rum-fullnode-sdk');

router.get('/', ensurePermission, get);

const client = RumFullNodeClient(config.node);

async function get(ctx) {
  try {
    await client.Network.get();
    ctx.body = true;
  } catch (err) {
    console.log(err);
    ctx.body = false;
  }
}

module.exports = router;