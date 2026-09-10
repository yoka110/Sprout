const express = require('express');
const db = require('./../db');

const router = express.Router();

router.get('/', (req, res) => {
    const userId = Number(req.query.userId);

    if(!userId) {
        const guides = db.prepare('SELECT * FROM plants where owner_id IS NULL ORDER BY name').all();
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
    const {
        name,
        family,
        difficulty,
        location,
        spacing_cm,
        height_cm,
        owner_id,
        stages = [],
        problems = []
    } = req.body;

    if(!name || !family || !difficulty || !location || owner_id === undefined || owner_id === null) {
        return res.status(400).json({ error: 'Pflichtfeld fehlt' });
    }

    if(!Number.isInteger(spacing_cm) || spacing_cm <= 0) {
        return res.status(400).json({ error: 'Pflanzenabstand muss eine positive Zahl sein'});
    }

    if(!Number.isInteger(height_cm) || height_cm <= 0) {
        return res.status(400).json({ error: 'Wuchshöhe muss eine positive Zahl sein' });
    }

    const normalizedStages = Array.isArray(stages) ? stages : [];
    const normalizedProblems = Array.isArray(problems) ? problems : [];

    const hasInvalidStage = normalizedStages.some(stage => !stage || !stage.title || !stage.period || !stage.instruction);
    if (hasInvalidStage) {
        return res.status(400).json({ error: 'Eine Wachstumsphase ist unvollständig' });
    }

    const hasInvalidProblem = normalizedProblems.some(problem => !problem || !problem.name || !problem.countermeasure);
    if (hasInvalidProblem) {
        return res.status(400).json({ error: 'Ein Problem ist unvollständig' });
    }

    const plantExists = db.prepare('SELECT id FROM plants WHERE LOWER(name) = LOWER(?)').get(name)

    if(plantExists) {
        return res.status(409).json({ error: 'Eine Pflanze mit diesem Namen existiert bereits'});
    }

    try {
        const insertPlant = db.prepare(
            'INSERT INTO plants (name, family, difficulty, location, spacing_cm, height_cm, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        const insertStage = db.prepare(
            'INSERT INTO growth_stages (plant_id, position, title, period, instruction) VALUES (?, ?, ?, ?, ?)'
        );
        const insertProblem = db.prepare(
            'INSERT INTO plant_problems (plant_id, name, countermeasure) VALUES (?, ?, ?)'
        );

        const transaction = db.transaction(() => {
            const result = insertPlant.run(name, family, difficulty, location, spacing_cm, height_cm, owner_id);
            const plantId = Number(result.lastInsertRowid);

            normalizedStages.forEach((stage, index) => {
                insertStage.run(plantId, index + 1, stage.title, stage.period, stage.instruction);
            });

            normalizedProblems.forEach((problem) => {
                insertProblem.run(plantId, problem.name, problem.countermeasure);
            });

            return plantId;
        });

        const plantId = transaction();

        res.status(201).json({
            id: plantId,
            name,
            family,
            difficulty,
            location,
            spacing_cm,
            height_cm,
            owner_id,
            stages: normalizedStages,
            problems: normalizedProblems
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Pflanze konnte nicht angelegt werden' });
    }
});

module.exports = router;