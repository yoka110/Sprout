// get the database connection from db.js
const db = require('./db');

// delete all tables first, children before parents
db.exec(`
    DROP TABLE IF EXISTS bed_plants;
    DROP TABLE IF EXISTS companion_rules;
    DROP TABLE IF EXISTS beds;
    DROP TABLE IF EXISTS plant_problems;
    DROP TABLE IF EXISTS growth_stages;
    DROP TABLE IF EXISTS plants;
    DROP TABLE IF EXISTS users;
`);

// create all seven tables, parents before children
db.exec(`
  -- user accounts, username must be unique
  CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- plants; owner_id empty means it is a guide for everyone
  CREATE TABLE plants (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    family     TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    location   TEXT NOT NULL,
    spacing_cm INTEGER NOT NULL,
    height_cm  INTEGER NOT NULL,
    owner_id   INTEGER,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  -- the five stages of a plant guide, position keeps them in order
  CREATE TABLE growth_stages (
    id          INTEGER PRIMARY KEY,
    plant_id    INTEGER NOT NULL,
    position    INTEGER NOT NULL,
    title       TEXT NOT NULL,
    period      TEXT NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

  -- diseases and pests of a plant
  CREATE TABLE plant_problems (
    id             INTEGER PRIMARY KEY,
    plant_id       INTEGER NOT NULL,
    name           TEXT NOT NULL,
    countermeasure TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

  -- garden beds, each one belongs to a user
  CREATE TABLE beds (
    id            INTEGER PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    name          TEXT NOT NULL,
    rows          INTEGER NOT NULL,
    row_length_cm INTEGER NOT NULL,
    location      TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- links beds and plants: which plant sits in which row
  CREATE TABLE bed_plants (
    id        INTEGER PRIMARY KEY,
    bed_id    INTEGER NOT NULL,
    plant_id  INTEGER NOT NULL,
    row_index INTEGER NOT NULL,
    FOREIGN KEY (bed_id) REFERENCES beds(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

  -- which two plants go well together, type is good or bad
  CREATE TABLE companion_rules (
    id         INTEGER PRIMARY KEY,
    plant_a_id INTEGER NOT NULL,
    plant_b_id INTEGER NOT NULL,
    type       TEXT NOT NULL,
    reason     TEXT NOT NULL,
    FOREIGN KEY (plant_a_id) REFERENCES plants(id),
    FOREIGN KEY (plant_b_id) REFERENCES plants(id)
  );
`);

// insert one example plant with its stages and problems
db.exec(`
    INSERT INTO plants (id, name, family, difficulty, location, spacing_cm, height_cm, owner_id)
    VALUES (1, 'Tomate', 'Nachtschattengewaechse', 'Mittel', 'Sonne', 60, 180, NULL);

    INSERT INTO growth_stages (plant_id, position, title, period, instruction)
    VALUES (1, 1, 'Aussaat', 'Maerz bis April',
            'Samen 1 cm tief in Anzuchterde saeen und hell bei 20 bis 24 Grad aufstellen.'),
           (1, 2, 'Pikieren', 'April', 'Ab dem zweiten Blattpaar einzeln in Toepfe umsetzen und etwas tiefer setzen.'),
           (1, 3, 'Auspflanzen', 'Mitte Mai',
            'Nach den Eisheiligen ins Beet, 60 cm Abstand, Stuetze gleich mit einsetzen.'),
           (1, 4, 'Pflege', 'Juni bis August',
            'Regelmaessig giessen, Seitentriebe ausgeizen, alle zwei Wochen duengen.'),
           (1, 5, 'Ernte', 'Juli bis Oktober', 'Fruechte ernten, sobald sie durchgefaerbt und leicht weich sind.');

    INSERT INTO plant_problems (plant_id, name, countermeasure)
    VALUES (1, 'Braunfaeule', 'Pflanzen ueberdachen, Blaetter trocken halten, befallene Teile entfernen.'),
           (1, 'Bluetenendfaeule', 'Gleichmaessig giessen und Kalkmangel im Boden ausgleichen.');
`);

console.log('Database seeded.');