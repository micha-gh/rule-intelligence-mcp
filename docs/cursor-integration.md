# Integration von Rule Intelligence MCP in Cursor AI

## Einleitung

Mit Cursor AI kannst du eigene CLI-Tools als sogenannte "Custom Tools" direkt in deine Entwicklungsumgebung einbinden. So kannst du Rulebases mit rule-intelligence-mcp direkt aus Cursor heraus analysieren, validieren und bearbeiten – ohne die IDE zu verlassen.

## Vorteile
- Schnelle Rulebase-Analyse per Shortcut oder Kontextmenü
- Automatische Validierung beim Speichern/Committen
- Integration in eigene Cursor-Workflows (z.B. mit Memory-Bank, Plugins, LLM)

## Schritt-für-Schritt-Anleitung

### 1. Voraussetzungen
- Node.js ≥ 14 installiert
- Das Projekt (rule-intelligence-mcp) ist lokal geklont und mit `npm install` eingerichtet

### 2. MCP-Tool testen
Stelle sicher, dass das CLI funktioniert:
```bash
npx ts-node index.ts analyze -r examples/rulebase-minimal.json
```

### 3. Cursor öffnen und Custom Tool anlegen
1. Öffne Cursor
2. Gehe zu **Settings → Custom Tools**
3. Klicke auf **Add Tool**

#### Beispiel-Konfiguration
- **Name:** Rule Intelligence MCP
- **Command:**
  ```
  npx ts-node /ABSOLUTER/PFAD/ZU/index.ts analyze -r $file --format-in $ext --output md
  ```
  (Passe den Pfad zu deinem Projekt an. `$file` ist die aktuell geöffnete Datei, `$ext` deren Extension.)
- **Working Directory:**
  - `/ABSOLUTER/PFAD/ZU/DEINEM/PROJEKT`
- **Input:**
  - `Current File`
- **Output:**
  - `Show in Panel` oder `Replace Selection` (je nach Workflow)

#### Optional: Weitere Befehle
- Für Validierung:
  ```
  npx ts-node /ABSOLUTER/PFAD/ZU/index.ts validate -r $file --format-in $ext
  ```
- Für Plugins:
  ```
  npx ts-node /ABSOLUTER/PFAD/ZU/index.ts analyze -r $file --format-in $ext --plugin plugins/conflict-check.js --output json
  ```

### 4. Tool testen
- Öffne eine Rulebase-Datei in Cursor (z.B. `.json`, `.yaml`, `.md`)
- Führe das Custom Tool aus (z.B. per Kontextmenü oder Shortcut)
- Das Ergebnis erscheint im Panel

## Beispiel-Usecases
- **Schnelle Analyse:** Markiere eine Datei und lasse sie direkt analysieren
- **Pre-Commit-Check:** Integriere die Validierung in einen Git-Hook (über Cursor oder Shell)
- **LLM-gestützte Vorschläge:** Nutze das Tool mit LLM-Optionen für automatische Rule-Vorschläge

## Troubleshooting
- **Fehler: Modul nicht gefunden:**
  - Prüfe, ob der Pfad zu `index.ts` stimmt und alle Abhängigkeiten installiert sind (`npm install`)
- **gray-matter/js-yaml fehlt:**
  - Installiere fehlende Pakete mit `npm install gray-matter js-yaml`
- **Node-Version zu alt:**
  - Aktualisiere Node.js auf ≥ 14
- **Pfad-Probleme:**
  - Nutze absolute Pfade in der Tool-Konfiguration

## Tipps
- Du kannst mehrere Custom Tools für verschiedene Befehle (analyze, validate, edit) anlegen
- Nutze die Output-Optionen von MCP (`--output md`, `--output json`) für die beste Darstellung in Cursor
- Plugins und Memory-Bank funktionieren auch in Cursor, wenn die Pfade stimmen

---

**Fragen oder Probleme?**
Öffne ein Issue im GitHub-Repo oder frage im Cursor-Discord! 