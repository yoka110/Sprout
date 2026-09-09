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

// hand the router over to server.js
module.exports = router;