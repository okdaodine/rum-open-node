const router = require('koa-router')();
const axios = require('axios');
const config = require('../config');
const { assert, Errors, throws } = require('../utils/validator');
const SDK = require('rum-sdk-nodejs');
const db = require('../utils/db');
const { ensurePermission } = require('../middleware/api');
const sleep = require('../utils/sleep');

router.get('/:groupId', ensurePermission, get);
router.post('/', ensurePermission, create);
router.get('/', ensurePermission, list);
router.delete('/:groupId', ensurePermission, remove);

async function create(ctx) {
  try {
    const res = await axios.post(`${config.node.origin}/api/v1/group`, {
      group_name: ctx.request.body.groupName,
      consensus_type: 'poa',
      encryption_type: 'public',
      app_key: 'group_timeline',
    }, {
      headers: {
        Authorization: `Bearer ${config.node.jwt}`,
      },
    });
    const groupId = res.data.group_id;
    assert(groupId, Errors.ERR_NOT_FOUND('groupId'));
    await sleep(2000);
    const seedRes = await axios.get(`${config.node.origin}/api/v1/group/${groupId}/seed`, {
      headers: {
        Authorization: `Bearer ${config.node.jwt}`,
      },
    });
    const { seed } = seedRes.data;
    assert(seed, Errors.ERR_NOT_FOUND('seed'));
    const rawGroup = SDK.utils.seedUrlToGroup(seedRes.data.seed);
    delete rawGroup.chainAPIs;
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
  const group = db.data.groups.find(group => group.userId === ctx.verification.userId && ctx.params.groupId === group.raw.groupId);
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
  const group = db.data.groups.find(group => group.userId === ctx.verification.userId && ctx.params.groupId === group.raw.groupId);
  assert(group, Errors.ERR_NOT_FOUND('group'));
  await axios.post(`${config.node.origin}/api/v1/group/leave`, {
    group_id: group.raw.groupId,
  }, {
    headers: {
      Authorization: `Bearer ${config.node.jwt}`,
    },
  });
  const groups = db.data.groups.filter(group => ctx.params.groupId !== group.raw.groupId);
  db.data.groups = groups;
  await db.write();
  ctx.body = true;
}

module.exports = router;