// web framework, needed for the Router
const express = require('express');
// package for hashing passwords and checking them later
const bcrypt = require('bcryptjs');
// the database connection
const db = require('./../db');
// a mini app that only handles the routes defined in this file
const router = express.Router();
// shortest password we accept
const MIN_PASSWORD_LENGTH = 4;

// POST /api/auth/register - create a new account
router.post('/register', (req, res) => {
    // read the two fields out of the JSON body
    const username = req.body.username;
    const password = req.body.password;

    // both fields must be there and must not be empty
    if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind Pflicht' });
    }

    // the password must be long enough
    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: 'Das Passwort muss mindestens 4 Zeichen lang sein' });
    }

    // look for an account that already uses this username
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

    // stop here if the username is taken
    if (existingUser) {
        return res.status(409).json({ error: 'Benutzername ist bereits vergeben' });
    }

    // turn the password into a hash, 10 is how much work bcrypt puts in
    const passwordHash = bcrypt.hashSync(password, 10);

    // write the new account, created_at is filled in by SQLite
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);

    // send back the new id and the username, never the hash
    res.status(201).json({ id: result.lastInsertRowid, username: username });
});

// POST /api/auth/login - check username and password
router.post('/login', (req, res) => {
    // read the two fields out of the JSON body
    const username = req.body.username;
    const password = req.body.password;

    // both fields must be there and must not be empty
    if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind Pflicht' });
    }

    // load the account with this username
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    // no account with this username
    if (!user) {
        return res.status(401).json({ error: 'Benutzername oder Passwort ist falsch' });
    }

    // compare the typed password with the stored hash
    const passwordIsCorrect = bcrypt.compareSync(password, user.password_hash);

    // wrong password, on purpose the same message as above
    if (!passwordIsCorrect) {
        return res.status(401).json({ error: 'Benutzername oder Passwort ist falsch' });
    }

    // send back id and username, never the hash
    res.json({ id: user.id, username: user.username });
});

// hand the router over to server.js
module.exports = router;