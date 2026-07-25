# Sprout

## Commit-Regeln

Jede Commit-Nachricht in diesem Repo wird automatisch geprüft. Passt sie nicht,
wird der Commit abgelehnt und **nichts gespeichert** — die Änderungen bleiben aber
erhalten, du kannst einfach mit korrigierter Nachricht neu committen.

### Wer prüft was

- **husky** — sorgt dafür, dass Git beim Commit überhaupt eine Prüfung startet. Hat selbst keine Regeln.
- **commitlint** — die eigentliche Prüfung. Alle Regeln kommen aus `commitlint.config.js`,
  die das Regelwerk `@commitlint/config-conventional` (Standard "Conventional Commits") lädt.

### Format

```
type(bereich): beschreibung
```

Der `(bereich)` ist optional, alles andere Pflicht.

### Erlaubte Typen

| Typ | Wofür |
|---|---|
| `feat` | Neue Funktion |
| `fix` | Fehlerbehebung |
| `docs` | Nur Dokumentation |
| `style` | Formatierung, Einrückung — keine inhaltliche Änderung |
| `refactor` | Umbau ohne neue Funktion und ohne Bugfix |
| `perf` | Performance-Verbesserung |
| `test` | Tests hinzufügen oder ändern |
| `build` | Build-Prozess, Abhängigkeiten |
| `ci` | CI-Konfiguration |
| `chore` | Sonstiges Aufräumen, Tooling |
| `revert` | Zurücknehmen eines früheren Commits |

### Regeln im Detail

- Typ **kleingeschrieben**
- Nach dem Doppelpunkt **ein Leerzeichen**
- Beschreibung darf nicht leer sein
- Beschreibung **nicht** mit Großbuchstaben beginnen
- **Kein Punkt** am Ende
- Erste Zeile maximal 100 Zeichen
- Commit-Nachrichten auf **Englisch**

### Beispiele

| Nachricht | Gültig |
|---|---|
| `feat: add plant search endpoint` | ja |
| `fix(backend): correct bed capacity calculation` | ja |
| `chore: update dependencies` | ja |
| `docs: add commit guidelines` | ja |
| `Add new feature` | nein — kein Typ |
| `feat: Add new feature` | nein — Großbuchstabe |
| `feat: add feature.` | nein — Punkt am Ende |
| `feat:add feature` | nein — Leerzeichen fehlt |
| `Feat: add feature` | nein — Typ großgeschrieben |

### Nachricht testen, ohne zu committen

```powershell
echo "feat: test message" | npx commitlint
```

Keine Ausgabe = gültig. Sonst erscheint die Fehlerliste.

### Einrichtung nach dem Klonen

Nach `git clone` einmalig im Projekt-Root ausführen:

```powershell
npm install
git config core.hooksPath .husky/_
```

Ohne die zweite Zeile findet Git die Prüfung nicht und alle Commits gehen ungeprüft durch.

### Weiterführend

- Standard auf Deutsch: https://www.conventionalcommits.org/de/
- Regel-Referenz: https://commitlint.js.org/reference/rules.html