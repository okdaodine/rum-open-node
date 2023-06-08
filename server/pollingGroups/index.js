const sleep = require('../utils/sleep');
const config = require('../config');
const db = require('../utils/db');
const moment = require('moment');
const { RumFullNodeClient } = require('rum-fullnode-sdk');

module.exports = async () => {
  while(true) {
    await sleep(60 * 1000);
    try {
      console.log(`${moment().format('HH:mm')} Polling`);
      const client = RumFullNodeClient(config.node);
      await db.read();
      const removed = [];
      for (const group of db.data.groups) {
        try {
          const remoteGroup = await client.Group.get(group.raw.group_id);
          group.raw = remoteGroup;
          group.lastUpdated = Math.round(remoteGroup.last_updated / 1000000);
          console.log(remoteGroup.group_id, remoteGroup.group_name, '✅');
        } catch (err) {
          try {
            if (err.response.status === 400 && err.response.data.message === 'Group not found') {
              removed.push(group);
            }
          } catch (err) {
            console.log(err);
          }
        }
        await sleep(500);
      }
      if (removed.length > 0) {
        console.log('❌', { removed });
        db.data.groups = db.data.groups.filter(group => !removed.includes(group));
      }
      await db.write();
    } catch (err) {
      console.log(err);
    }
  }
}