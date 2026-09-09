const express = require('express');
const db = require('./../db');

const router = express.Router();

router.get('/', (req, res) => {
    const userId = Number(req.query.userId);

    if(!userId) {
        const guides = db.prepare('SELECT * FROM plants where owner_id IS NULL ODER BY name').all();
        return res.json(guides);
    }

    const plants = db.prepare('SELECT * FROM plants WHERE owner_id IS NULL OR owner_id = ? ORDER BY name').all(userId);
    res.json(plants);
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);

    if(!plant) {
        return res.status(404).json({ error: 'Pflanze existiert nicht' });
    }

    const stages = db.prepare('Select * FROM growth_stages WHERE plant_id = ? ORDER BY position').all(id);

    const problems = db.prepare('SELECT * FROM plant_problems WHERE plant_id = ?').all(id);

    res.json({ ...plant, stages: stages, problems: problems });
});

router.post('/', (req, res) => {
    const { name, family, difficulty, location, spacing_cm, height_cm, owner_id } = req.body;

    if(!name || !family || !difficulty || !location || !owner_id) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    if(!Number.isInteger(spacing_cm) || spacing_cm <= 0) {
        return res.status(400).json({ error: 'Pflanzenabstand muss eine positive Zahl sein'});
    }

    if(!Number.isInteger(height_cm) || height_cm <= 0) {
        return res.status(400).json({ error: 'Wuchshöhe muss eine positive Zahl sein' });
    }

    try{
        const result = db
        .prepare('INSERT INTO plants (name, family, difficulty, location, spacing_cm, height_cm, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(name, family, difficulty, location, spacing_cm, height_cm, owner_id);

        res.status(201).json({
            id: result.lastInsertRowid,
            name: name,
            family: family,
            difficulty: difficulty,
            location: location,
            spacing_cm: spacing_cm,
            height_cm: height_cm,
            owner_id: owner_id
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Pflanze konnte nicht angelegt werden' });
    }
});

module.exports = router;