// web framework, needed for the Router
const express = require('express');
// the database connection
const db = require('./../db');

// a mini app that only handles the routes defined in this file
const router = express.Router();

// GET /api/plants - return all plants
router.get('/', (req, res) => {
    // prepare the SQL statement, then run it and get all rows back
    const plants = db.prepare('SELECT * FROM plants').all();
    // send the rows to the browser as JSON
    res.json(plants);
});

// hand the router over to server.js
module.exports = router;