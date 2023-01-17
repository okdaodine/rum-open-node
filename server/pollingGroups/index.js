const sleep = require('../utils/sleep');
const axios = require('axios');
const config = require('../config');
const db = require('../utils/db');
const { keyBy } = require('lodash');
const moment = require('moment');

module.exports = async () => {
  while(true) {
    await sleep(60 * 1000);
    try {
      const res = await axios.get(`${config.node.origin}/api/v1/groups`, {
        headers: {
          Authorization: `Bearer ${config.node.jwt}`,
        },
      });
      const groupMap = keyBy(res.data.groups, 'group_id');
      console.log(`${moment().format('HH:mm')} Polled ${res.data.groups.length} groups`);
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