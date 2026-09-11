const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId fehlt' });
    }

    const beds = db.prepare('SELECT * FROM beds WHERE user_id = ? ORDER BY id').all(Number(userId));

    res.json(beds);
});

router.post('/', (req, res) => {
    const { user_id, name, rows, row_length_cm, location, notes } = req.body;

    // rows checked against undefined, not truthiness, so a valid rows: 0 reaches the range check below
    if (!user_id || !name || rows === undefined || !row_length_cm || !location) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    if (rows < 1 || rows > 6) {
        return res.status(400).json({ error: 'rows muss zwischen 1 und 6 liegen' });
    }

    let result;
    try {
        result = db.prepare(
            'INSERT INTO beds (user_id, name, rows, row_length_cm, location, notes) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(user_id, name, rows, row_length_cm, location, notes || '');
    } catch (err) {
        return res.status(400).json({ error: 'Ungültiger Nutzer' });
    }

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(bed);
});

router.post('/:id/plants', (req, res) => {
    const bedId = Number(req.params.id);
    const { plant_id, row_index } = req.body;

    if (!plant_id || !row_index) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plant_id);
    if (!plant) {
        return res.status(404).json({ error: 'Pflanze existiert nicht' });
    }

    if (row_index < 1 || row_index > bed.rows) {
        return res.status(400).json({ error: 'row_index liegt außerhalb des Beetes' });
    }

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

router.get('/:id', (req, res) => {
    const bedId = Number(req.params.id);

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    const plants = db.prepare(`
        SELECT bed_plants.id AS bed_plant_id, bed_plants.row_index, plants.id AS plant_id,
               plants.name, plants.spacing_cm, plants.height_cm
        FROM bed_plants
                 JOIN plants ON plants.id = bed_plants.plant_id
        WHERE bed_plants.bed_id = ?
        ORDER BY bed_plants.row_index
    `).all(bedId);

    const uniquePlantIds = [];
    for (const plant of plants) {
        if (!uniquePlantIds.includes(plant.plant_id)) {
            uniquePlantIds.push(plant.plant_id);
        }
    }

    const warnings = [];

    const ruleQuery = db.prepare(`
        SELECT * FROM companion_rules
        WHERE (plant_a_id = ? AND plant_b_id = ?)
           OR (plant_a_id = ? AND plant_b_id = ?)
    `);

    // F-09: the whole bed counts, so check every pair regardless of row
    for (let i = 0; i < uniquePlantIds.length; i++) {
        for (let j = i + 1; j < uniquePlantIds.length; j++) {
            const a = uniquePlantIds[i];
            const b = uniquePlantIds[j];

            // F-07: a pair is stored only once, so check both directions
            const rule = ruleQuery.get(a, b, b, a);

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
        notes: bed.notes,
        plants,
        warnings
    });
});

router.put('/:id/notes', (req, res) => {
    const bedId = Number(req.params.id);
    const { notes } = req.body;

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    db.prepare('UPDATE beds SET notes = ? WHERE id = ?').run(notes || '', bedId);

    res.json({ notes: notes || '' });
});

router.delete('/:id/plants/:bedPlantId', (req, res) => {
    const bedId = Number(req.params.id);
    const bedPlantId = Number(req.params.bedPlantId);

    const result = db.prepare(
        'DELETE FROM bed_plants WHERE id = ? AND bed_id = ?'
    ).run(bedPlantId, bedId);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Eintrag existiert nicht' });
    }

    res.status(204).send();
});

router.delete('/:id', (req, res) => {
    const bedId = Number(req.params.id);

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bedId);
    if (!bed) {
        return res.status(404).json({ error: 'Beet existiert nicht' });
    }

    // delete the bed_plants first, otherwise their foreign key blocks removing the bed
    db.prepare('DELETE FROM bed_plants WHERE bed_id = ?').run(bedId);
    db.prepare('DELETE FROM beds WHERE id = ?').run(bedId);

    res.status(204).send();
});

module.exports = router;
