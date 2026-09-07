// tool for working with file paths, so they work on Mac and Windows
const path = require('path');
// package that lets Node talk to a SQLite database
const Database = require('better-sqlite3');

// build the full path to sprout.db, in the same folder as this file
const dbPath = path.join(__dirname, 'sprout.db');
// open the database file (creates it if it doesn't exist yet)
const db = new Database(dbPath);

// make SQLite actually check foreign keys (it's off unless you turn it on)
db.pragma('foreign_keys = ON');

// give this connection to any other file that requires this file
module.exports = db;