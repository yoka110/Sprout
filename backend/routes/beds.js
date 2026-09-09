// web framework, needed for the Router
const express = require('express');
// the database connection
const db = require('./../db');

// a mini app that only handles the routes defined in this file
const router = express.Router();

// GET /api/beds?userId=1 - return all beds of one user
router.get('/', (req, res) => {
    // read the userId from the query string, e.g. ?userId=1
    const userId = req.query.userId;

    // userId is required (Datenmodell-und-API 3.3); without a login
    // system the frontend must always send it
    if (!userId) {
        return res.status(400).json({ error: 'userId fehlt' });
    }

    // ? is a placeholder, userId is bound to it separately - required
    // for any value that comes from outside the code (F-16)
    const beds = db.prepare('SELECT * FROM beds WHERE user_id = ?').all(userId);

    res.json(beds);
});

// POST /api/beds - create a new bed
router.post('/', (req, res) => {
    // pull the five expected fields out of the JSON request body
    const { user_id, name, rows, row_length_cm, location } = req.body;

    // all five are required fields
    if (!user_id || !name || !rows || !row_length_cm || !location) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    // F-08: a bed has between 1 and 6 rows
    if (rows < 1 || rows > 6) {
        return res.status(400).json({ error: 'rows muss zwischen 1 und 6 liegen' });
    }

    // insert the new row; .run() executes the statement and returns
    // metadata about it, not the row itself
    const result = db.prepare(
        'INSERT INTO beds (user_id, name, rows, row_length_cm, location) VALUES (?, ?, ?, ?, ?)'
    ).run(user_id, name, rows, row_length_cm, location);

    // fetch the just-created row so the response includes the new id;
    // .get() returns a single object instead of an array
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(bed);
});

// hand the router over to server.js
module.exports = router;