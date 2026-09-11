const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./../db');
const router = express.Router();
const MIN_PASSWORD_LENGTH = 4;

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind Pflicht' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: 'Das Passwort muss mindestens 4 Zeichen lang sein' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

    if (existingUser) {
        return res.status(409).json({ error: 'Benutzername ist bereits vergeben' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);

    // only id and username go back, never the password hash
    res.status(201).json({ id: result.lastInsertRowid, username: username });
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind Pflicht' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        return res.status(401).json({ error: 'Benutzername oder Passwort ist falsch' });
    }

    const passwordIsCorrect = bcrypt.compareSync(password, user.password_hash);

    // same message as unknown user on purpose, so neither is revealed
    if (!passwordIsCorrect) {
        return res.status(401).json({ error: 'Benutzername oder Passwort ist falsch' });
    }

    res.json({ id: user.id, username: user.username });
});

module.exports = router;