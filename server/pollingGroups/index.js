const sleep = require('../utils/sleep');
const config = require('../config');
const db = require('../utils/db');
const { keyBy } = require('lodash');
const moment = require('moment');
const { RumFullNodeClient } = require('rum-fullnode-sdk');

module.exports = async () => {
  while(true) {
    await sleep(60 * 1000);
    try {
      const client = RumFullNodeClient(config.node);
      const { groups } = await client.Group.list();
      const groupMap = keyBy(groups, 'group_id');
      console.log(`${moment().format('HH:mm')} Polled ${groups.length} groups`);
      await db.read();
      db.data.groups = db.data.groups.map(group => {
        const remoteGroup = groupMap[group.raw.groupId];
        if (remoteGroup) {
          group.lastUpdated = Math.round(remoteGroup.last_updated / 1000000);
        }
        return group;
      });
      await db.write();
    } catch (err) {
      console.log(err);
    }
  }
}