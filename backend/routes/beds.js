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

// POST /api/beds/:id/plants - assign a plant to a row of a bed
router.post('/:id/plants', (req, res) => {
    const bedId = req.params.id;
    const { plant_id, row_index } = req.body;

    if (!plant_id || !row_index) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    // .get() returns one row, or undefined if nothing matches -
    // that's how we check "does this exist at all"
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plant_id);
    if (!plant) {
        return res.status(404).json({ error: 'Pflanze existiert nicht' });
    }

    // F-08: row_index must be a real row of this bed
    if (row_index < 1 || row_index > bed.rows) {
        return res.status(400).json({ error: 'row_index liegt außerhalb des Beetes' });
    }

    // is this row already taken by another plant?
    const taken = db.prepare(
        'SELECT * FROM bed_plants WHERE bed_id = ? AND row_index = ?'
    ).get(bedId, row_index);
    if (taken) {
        return res.status(400).json({ error: 'Reihe ist bereits belegt' });
    }

    const result = db.prepare(
        'INSERT INTO bed_plants (bed_id, plant_id, row_index) VALUES (?, ?, ?)'
    ).run(bedId, plant_id, row_index);

    res.status(201).json({ bed_plant_id: result.lastInsertRowid });
});

// GET /api/beds/:id - one bed with its plants and companion warnings
router.get('/:id', (req, res) => {
    const bedId = req.params.id;

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    // all plants currently placed in this bed, joined with plant details
    const plants = db.prepare(`
        SELECT bed_plants.id AS bed_plant_id, bed_plants.row_index, plants.id AS plant_id,
               plants.name, plants.spacing_cm, plants.height_cm
        FROM bed_plants
        JOIN plants ON plants.id = bed_plants.plant_id
        WHERE bed_plants.bed_id = ?
        ORDER BY bed_plants.row_index
    `).all(bedId);

    // distinct plant ids in this bed - the same plant could sit in two rows
    const uniquePlantIds = [...new Set(plants.map(p => p.plant_id))];

    const warnings = [];

    // check every possible pair among the distinct plants (F-09: the
    // whole bed counts, row position is irrelevant)
    for (let i = 0; i < uniquePlantIds.length; i++) {
        for (let j = i + 1; j < uniquePlantIds.length; j++) {
            const a = uniquePlantIds[i];
            const b = uniquePlantIds[j];

            // F-07: a pair is stored only once, so check both directions
            const rule = db.prepare(`
                SELECT * FROM companion_rules
                WHERE (plant_a_id = ? AND plant_b_id = ?)
                   OR (plant_a_id = ? AND plant_b_id = ?)
            `).get(a, b, b, a);

            if (rule) {
                const plantA = plants.find(p => p.plant_id === rule.plant_a_id);
                const plantB = plants.find(p => p.plant_id === rule.plant_b_id);
                warnings.push({
                    plant_a: plantA.name,
                    plant_b: plantB.name,
                    type: rule.type,
                    reason: rule.reason
                });
            }
        }
    }

    res.json({
        id: bed.id,
        name: bed.name,
        rows: bed.rows,
        row_length_cm: bed.row_length_cm,
        location: bed.location,
        plants,
        warnings
    });
});

// hand the router over to server.js
module.exports = router;