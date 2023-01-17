const fs = require('fs');
const { Low, JSONFile } = require('@commonify/lowdb');

if (!fs.existsSync('database')){
  fs.mkdirSync('database');
}

const db = new Low(new JSONFile('./database/db.json'));
module.exports = db;

(async () => {
  await db.read();
  db.data ||= {
    users: [],
    tokens: [],
    groups: []
  };
  await db.write();
})();