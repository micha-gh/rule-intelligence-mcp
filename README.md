# rule-intelligence-mcp

Ein **Rule Intelligence MCP**-Tool (Node.js + TypeScript) zur Analyse, Validierung und Verwaltung von Rulebases (JSON) über eine einfache CLI.

## Features

- Analysiert Rulebases auf fehlende Kategorien, doppelte Titel und leere Inhalte
- JSON-Schema-Validierung via AJV
- Ausgabe als JSON oder Markdown
- Interaktives Editieren von Regeln per CLI
- Automatisierte Regel-Suggestions via OpenAI LLM
- Watch-Modus zur Live-Analyse bei Dateiänderungen

## Quickstart

### 1. Voraussetzungen

- Node.js ≥ 14
- npm oder yarn

### 2. Installation

```bash
# Repository klonen
git clone https://github.com/micha-gh/rule-intelligence-mcp.git
cd rule-intelligence-mcp

# Abhängigkeiten installieren
npm install
```

### 3. Kompilierung & Dev-Mode

```bash
# Entwicklermodus mit automatischem Reload
npm run dev -- analyze

# Produktion / Start
npm start -- analyze
```

## CLI-Befehle

Alle Befehle werden über das bin-Skript `rule-intelligence-mcp` (alias `npm start -- <cmd>`) ausgeführt.

```bash
rule-intelligence-mcp <command> [options]
```

### Globale Optionen

- `-r, --rulebase <path>`  Pfad zur Rulebase-JSON (default: `rulebase-sample.json`)
- `-s, --schema <path>`     JSON-Schema-Datei (default: `rule-schema.json`)
- `-f, --format <json|md>`  Ausgabeformat JSON oder Markdown (default: `json`)

### Befehle

#### analyze
Analysiert die Rulebase und gibt Statistik zurück.

```bash
# JSON-Ausgabe (Standard)
rule-intelligence-mcp analyze \
  -r rulebase.json \
  -f json

# Markdown-Report
rule-intelligence-mcp analyze \
  --rulebase rules.json \
  --format md
```

#### validate
Validiert die Rulebase gegen das JSON-Schema.

```bash
rule-intelligence-mcp validate \
  -r rulebase.json \
  -s rule-schema.json
```

#### edit <id>
Aktualisiert eine bestehende Regel anhand ihrer ID.

```bash
rule-intelligence-mcp edit rule-2 \
  --title "Use parameterized queries" \
  --severity high \
  --tags security,database
```

#### suggest
Fragt das OpenAI LLM nach Vorschlägen für neue Regeln.

```bash
rule-intelligence-mcp suggest \
  -r rulebase.json
```

#### watch
Beobachtet die Rulebase-Datei und führt bei jeder Änderung eine Analyse aus.

```bash
rule-intelligence-mcp watch \
  -r rulebase.json
```

## Projektstruktur

```
rule-intelligence-mcp/
├── index.ts             # CLI-Entrypoint
├── rule-schema.json     # JSON-Schema für Rulebase
├── rulebase-sample.json # Beispiel-Rulebase
├── lib/
│   └── analyze.ts       # Analyse- und Validierungsfunktionen
├── tsconfig.json        # TypeScript-Konfiguration
├── package.json         # Node-Projektmetadaten & Skripte
└── README.md            # Diese Dokumentation
```

## Contributing

1. Forke das Repo
2. Erstelle einen Branch `feature/...`
3. Implementiere deine Änderungen und schreibe Unit-Tests
4. Öffne einen Pull Request

## License

MIT © Dein Name oder Organisation 