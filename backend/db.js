const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'sprout.db');
const db = new Database(dbPath);

// SQLite ignores foreign keys unless this is turned on per connection
db.pragma('foreign_keys = ON');

module.exports = db;