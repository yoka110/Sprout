const db = require('./db');

db.exec(`
    DROP TABLE IF EXISTS bed_plants;
    DROP TABLE IF EXISTS companion_rules;
    DROP TABLE IF EXISTS beds;
    DROP TABLE IF EXISTS plant_problems;
    DROP TABLE IF EXISTS growth_stages;
    DROP TABLE IF EXISTS plants;
    DROP TABLE IF EXISTS users;
`);

db.exec(`
  CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- owner_id NULL means a guide for everyone, filled means a private plant (F-12)
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

  CREATE TABLE growth_stages (
    id          INTEGER PRIMARY KEY,
    plant_id    INTEGER NOT NULL,
    position    INTEGER NOT NULL,
    title       TEXT NOT NULL,
    period      TEXT NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

  CREATE TABLE plant_problems (
    id             INTEGER PRIMARY KEY,
    plant_id       INTEGER NOT NULL,
    name           TEXT NOT NULL,
    countermeasure TEXT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

  CREATE TABLE beds (
    id            INTEGER PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    name          TEXT NOT NULL,
    rows          INTEGER NOT NULL,
    row_length_cm INTEGER NOT NULL,
    location      TEXT NOT NULL,
    notes         TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE bed_plants (
    id        INTEGER PRIMARY KEY,
    bed_id    INTEGER NOT NULL,
    plant_id  INTEGER NOT NULL,
    row_index INTEGER NOT NULL,
    FOREIGN KEY (bed_id) REFERENCES beds(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
  );

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

// F-24: these ids 1 to 5 are fixed and companion_rules point to them, so never insert in between, only add at the end
db.exec(`
    INSERT INTO plants (id, name, family, difficulty, location, spacing_cm, height_cm, owner_id)
    VALUES (1, 'Tomate', 'Nachtschattengewaechse', 'Mittel', 'Sonne', 60, 180, NULL),
           (2, 'Moehre', 'Doldenbluetler', 'Mittel', 'Sonne', 5, 40, NULL),
           (3, 'Zwiebel', 'Lauchgewaechse', 'Einfach', 'Sonne', 15, 40, NULL),
           (4, 'Salat', 'Korbbluetler', 'Einfach', 'Halbschatten', 25, 30, NULL),
           (5, 'Buschbohne', 'Huelsenfruechtler', 'Einfach', 'Sonne', 15, 50, NULL);
`);

db.exec(`
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

db.exec(`
    INSERT INTO growth_stages (plant_id, position, title, period, instruction)
    VALUES (2, 1, 'Aussaat', 'April bis Juni',
            'Samen 1 cm tief in Reihen saeen, der Boden muss fein und steinfrei sein.'),
           (2, 2, 'Vereinzeln', 'Mai bis Juni', 'Sind die Pflanzen 5 cm hoch, auf 5 cm Abstand vereinzeln.'),
           (2, 3, 'Pflege', 'Juni bis Juli',
            'Boden locker und gleichmaessig feucht halten, sonst platzen die Wurzeln.'),
           (2, 4, 'Anhaeufeln', 'Juli', 'Erde ueber die Wurzelkoepfe ziehen, sonst werden sie gruen und bitter.'),
           (2, 5, 'Ernte', 'Juli bis Oktober', 'Wurzeln vorsichtig herausziehen, am besten nach einem Regentag.');

    INSERT INTO plant_problems (plant_id, name, countermeasure)
    VALUES (2, 'Moehrenfliege', 'Kulturschutznetz auflegen und Zwiebeln danebensetzen.');
`);

db.exec(`
    INSERT INTO growth_stages (plant_id, position, title, period, instruction)
    VALUES (3, 1, 'Stecken', 'Maerz bis April',
            'Steckzwiebeln 15 cm auseinander so setzen, dass die Spitze herausschaut.'),
           (3, 2, 'Anwachsen', 'April', 'Boden locker und unkrautfrei halten, nur wenig giessen.'),
           (3, 3, 'Pflege', 'Mai bis Juni', 'Nur bei Trockenheit giessen, Staunaesse laesst die Zwiebeln faulen.'),
           (3, 4, 'Abreifen', 'Juli', 'Sobald das Laub umknickt, das Giessen einstellen.'),
           (3, 5, 'Ernte', 'Juli bis August', 'Zwiebeln an einem trockenen Tag herausziehen und nachtrocknen lassen.');

    INSERT INTO plant_problems (plant_id, name, countermeasure)
    VALUES (3, 'Zwiebelfliege', 'Kulturschutznetz auflegen und den Anbauplatz jedes Jahr wechseln.');
`);

db.exec(`
    INSERT INTO growth_stages (plant_id, position, title, period, instruction)
    VALUES (4, 1, 'Aussaat', 'Maerz bis August', 'Samen nur duenn mit Erde bedecken, sie brauchen Licht zum Keimen.'),
           (4, 2, 'Pikieren', 'April bis August', 'Kraeftige Keimlinge einzeln in kleine Toepfe umsetzen.'),
           (4, 3, 'Auspflanzen', 'April bis September',
            'Mit 25 cm Abstand setzen, der Wurzelhals muss ueber der Erde bleiben.'),
           (4, 4, 'Pflege', 'Mai bis September', 'Morgens giessen und den Boden zwischen den Pflanzen locker halten.'),
           (4, 5, 'Ernte', 'Mai bis Oktober', 'Ganze Koepfe frueh am Morgen schneiden, dann sind die Blaetter knackig.');

    INSERT INTO plant_problems (plant_id, name, countermeasure)
    VALUES (4, 'Schnecken', 'Abends absammeln und einen Schneckenzaun um das Beet setzen.'),
           (4, 'Falscher Mehltau', 'Weiter auseinander pflanzen und nie ueber die Blaetter giessen.');
`);

db.exec(`
    INSERT INTO growth_stages (plant_id, position, title, period, instruction)
    VALUES (5, 1, 'Aussaat', 'Mai bis Juni', 'Samen 3 cm tief direkt ins Beet legen, der Boden muss warm sein.'),
           (5, 2, 'Auflaufen', 'Juni', 'Nach etwa zehn Tagen zeigen sich die Keimblaetter, Boden feucht halten.'),
           (5, 3, 'Anhaeufeln', 'Juni', 'Erde an die Stiele haeufeln, das gibt den Pflanzen Halt.'),
           (5, 4, 'Pflege', 'Juni bis Juli',
            'Regelmaessig giessen, aber nicht duengen, Bohnen versorgen sich selbst mit Stickstoff.'),
           (5, 5, 'Ernte', 'Juli bis September', 'Huelsen ernten, solange sie zart sind und beim Brechen knacken.');

    INSERT INTO plant_problems (plant_id, name, countermeasure)
    VALUES (5, 'Schwarze Bohnenlaus', 'Befallene Triebspitzen abknipsen und Marienkaefer im Beet dulden.');
`);

// F-07: each pair is stored only once, so the lookup checks both directions
db.exec(`
    INSERT INTO companion_rules (plant_a_id, plant_b_id, type, reason)
    VALUES (1, 2, 'good', 'Moehren bleiben niedrig und nutzen den Boden unter den Tomatenwurzeln, beide teilen sich das Beet ohne Konkurrenz.'),
           (1, 3, 'good', 'Der Geruch der Zwiebel vertreibt an Tomaten typische Schaedlinge wie die Weisse Fliege.'),
           (1, 4, 'good', 'Salat waechst im Schatten der Tomaten und haelt den Boden bedeckt und feucht.'),
           (1, 5, 'bad', 'Beide sind Starkzehrer und konkurrieren um Naehrstoffe; das dichte Bohnenlaub haelt die Tomatenblaetter feucht und beguenstigt Braunfaeule.'),
           (2, 3, 'good', 'Der Geruch der Zwiebeln vertreibt die Moehrenfliege, der Geruch der Moehren die Zwiebelfliege.'),
           (2, 4, 'good', 'Salat wird frueh geerntet und gibt den langsameren Moehren Platz und Schatten, solange sie noch klein sind.'),
           (2, 5, 'good', 'Bohnen reichern den Boden mit Stickstoff an, den die Moehren beim Wachsen aufnehmen.'),
           (3, 4, 'good', 'Salat wurzelt flach und bedeckt den Boden, waehrend die Zwiebel tiefer und schmaler waechst - beide konkurrieren kaum um denselben Raum.'),
           (3, 5, 'bad', 'Zwiebeln geben Stoffe ab, die den Knoellchenbakterien an den Bohnenwurzeln schaden; die Bohnen bleiben klein und wachsen schlecht.'),
           (4, 5, 'good', 'Bohnen reichern den Boden mit Stickstoff an, den der schnellwuechsige Salat braucht.');
`);

console.log('Database seeded.');
