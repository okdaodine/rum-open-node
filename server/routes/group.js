const router = require('koa-router')();
const config = require('../config');
const { assert, Errors, throws } = require('../utils/validator');
const db = require('../utils/db');
const { ensurePermission } = require('../middleware/api');
const sleep = require('../utils/sleep');
const { RumFullNodeClient } = require('rum-fullnode-sdk');

router.get('/:groupId', ensurePermission, get);
router.post('/', ensurePermission, create);
router.get('/', ensurePermission, list);
router.delete('/:groupId', ensurePermission, remove);

const client = RumFullNodeClient(config.node);

async function create(ctx) {
  try {
    const { seed, group_id } = await client.Group.create({
      group_name: ctx.request.body.groupName,
      app_key: ctx.request.body.appKey,
      encryption_type: ctx.request.body.encryptionType,
      consensus_type: 'poa'
    });
    await sleep(2000);
    assert(seed, Errors.ERR_NOT_FOUND('seed'));
    const { groups } = await client.Group.list();
    const rawGroup = groups.find(group => group.group_id === group_id);
    assert(rawGroup, Errors.ERR_NOT_FOUND('rawGroup'));
    const group = {
      userId: ctx.verification.userId,
      lastUpdated: Date.now(),
      seed,
      raw: rawGroup
    };
    await db.read();
    db.data.groups.push(group);
    await db.write();
    ctx.body = group;
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

async function get(ctx) {
  await db.read();
  const group = db.data.groups.find(group => group.userId === ctx.verification.userId && ctx.params.groupId === group.raw.group_id);
  assert(group, Errors.ERR_NOT_FOUND('group'));
  ctx.body = group;
}

async function list(ctx) {
  await db.read();
  const groups = db.data.groups.filter(group => group.userId === ctx.verification.userId);
  ctx.body = groups.sort((a, b) => b.lastUpdated - a.lastUpdated);
}

async function remove(ctx) {
  await db.read();
  const group = db.data.groups.find(group => group.userId === ctx.verification.userId && ctx.params.groupId === group.raw.group_id);
  assert(group, Errors.ERR_NOT_FOUND('group'));
  await client.Group.leave(group.raw.group_id);
  const groups = db.data.groups.filter(group => ctx.params.groupId !== group.raw.group_id);
  db.data.groups = groups;
  await db.write();
  ctx.body = true;
}

module.exports = router;