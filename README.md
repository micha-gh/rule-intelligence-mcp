# Rule Intelligence MCP – Universal Rulebase Analyzer

**Author:** Michael Tittmar

---

## Overview

**Rule Intelligence MCP** is an open-source, extensible CLI and library to analyze, validate, and manage rulebases of any kind – for any language, team, or workflow. It supports custom schemas, flexible formats, plugins, LLM integration, and more.

---

## Features

- Analyze rulebases for missing categories, duplicate rules, empty content, and more
- Validate against any JSON schema (fully configurable)
- Filter rules by status, tags, or custom fields
- Output as JSON, Markdown, CSV, or HTML
- Interactive rule editing via CLI
- Memory bank for audit trail and LLM context
- LLM integration (OpenAI, Azure, local, ...)
- Watch mode for live analysis (optional)
- Plugin system for custom checks (JavaScript)
- Flexible input: JSON, YAML, TOML, Markdown (optional dependencies)
- Fully tested (unit/integration), CI-ready

---

## Quickstart

### Prerequisites
- Node.js ≥ 14
- npm or yarn

### Installation
```bash
git clone https://github.com/micha-gh/rule-intelligence-mcp.git
cd rule-intelligence-mcp
npm install
```

---

## CLI Usage

```bash
rule-intelligence-mcp <command> [options]
```

### Common CLI Options

| Option                | Description                                                      | Example                                  |
|----------------------|------------------------------------------------------------------|------------------------------------------|
| `-r, --rulebase`     | Path to rulebase file (JSON/YAML/TOML/MD)                        | `-r rules.json`                          |
| `-s, --schema`       | Path to JSON schema file                                         | `-s my-schema.json`                      |
| `--format-in`        | Input format: json, yaml, toml, md (auto by extension)            | `--format-in yaml`                       |
| `-o, --output`       | Output format: json, md, csv, html                               | `--output csv`                           |
| `--status`           | Filter rules by status                                           | `--status active`                        |
| `--tag`              | Filter rules by tag(s), comma-separated                          | `--tag security,style`                   |
| `--plugin`           | Path to JS plugin for custom analysis                            | `--plugin ./plugins/my-check.js`         |
| `--llm-provider`     | LLM provider (openai, azure, local, ...)                         | `--llm-provider openai`                  |
| `--llm-api-url`      | LLM API base URL (for custom providers)                          | `--llm-api-url https://api.example.com`  |
| `--llm-model`        | LLM model name                                                  | `--llm-model gpt-4`                      |
| `--memory`           | Path to memory bank file                                         | `--memory .data/mem.json`                |

---

### Example Commands

```bash
# Analyze your rulebase (auto-detects format by extension)
rule-intelligence-mcp analyze -r myrules.json --output md
rule-intelligence-mcp analyze -r myrules.yaml --format-in yaml --output csv
rule-intelligence-mcp analyze -r myrules.json --plugin ./plugins/example-plugin.js --output json

# Edit a rule
rule-intelligence-mcp edit rule-2 --title "Use parameterized queries"

# Show memory bank
rule-intelligence-mcp memory:list --memory .data/mem.json

# LLM suggestions (optional, install openai or your provider)
npm install openai
rule-intelligence-mcp suggest -r myrules.json --llm-provider openai --llm-model gpt-3.5-turbo

# Watch mode (optional, install chokidar)
npm install chokidar
rule-intelligence-mcp watch -r myrules.json
```

---

## Flexible Schema & Rulebase Format
- Use any JSON schema for validation (`--schema my-schema.json`)
- Rulebase can be JSON, YAML, TOML, or Markdown (with frontmatter)
- Auto-detects format by file extension, or set with `--format-in`
- Example for YAML: `rule-intelligence-mcp analyze -r rules.yaml --format-in yaml`
- Example for Markdown: `rule-intelligence-mcp analyze -r rules.md --format-in md`

---

## Output Formats
- `--output json` (default)
- `--output md` (Markdown)
- `--output csv` (CSV table)
- `--output html` (HTML report)

---

## Plugins: Custom Analysis
- Add your own checks as a JS file: `--plugin ./my-check.js`
- Plugin receives the rulebase and current analysis as input, returns an object to merge into the output
- See `plugins/example-plugin.js` for a template
- Example: Count deprecated rules and add to output

---

## LLM Provider Configuration
- Use any LLM provider: OpenAI, Azure, local, etc.
- Flags: `--llm-provider`, `--llm-api-url`, `--llm-model`
- Example: `rule-intelligence-mcp suggest --llm-provider openai --llm-model gpt-4`
- Install the required package for your provider (see docs)
- Set API keys as environment variables (e.g. `OPENAI_API_KEY`)

---

## Memory Bank
- Stores all `edit` and `suggest` interactions with timestamps
- Configurable location and backend (`--memory memory.json`, `--memory .data/mem.json`)
- Use `memory:list` and `memory:clear` to manage

---

## Testing & CI
- Run all tests: `npm test`
- Coverage: `npm test -- --coverage`
- GitHub Actions workflow in `.github/workflows/ci.yml`

---

## Testing with Example Rulebases, Schemas, and Plugins

The `examples/` and `plugins/` folders contain ready-to-use files for testing and learning:

### Example Rulebases
- `examples/rulebase-minimal.json` – Minimal valid rulebase
- `examples/rulebase-complex.yaml` – Complex rulebase with edge cases (duplicates, deprecated, missing fields)
- `examples/rulebase-invalid.json` – Invalid rulebase for validation testing
- `examples/rulebase-markdown.md` – Rulebase in Markdown frontmatter

### Example Schemas
- `rule-schema.json` – Standard schema
- `examples/rule-schema-custom.json` – Custom schema with extra fields

### Example Plugins
- `plugins/example-plugin.js` – Counts deprecated rules
- `plugins/conflict-check.js` – Finds conflicting rules (e.g. allow/forbid)

### How to Test

```bash
# Validate a minimal rulebase
rule-intelligence-mcp validate -r examples/rulebase-minimal.json

# Analyze a complex YAML rulebase
rule-intelligence-mcp analyze -r examples/rulebase-complex.yaml --format-in yaml --output md

# Validate an invalid rulebase (should show errors)
rule-intelligence-mcp validate -r examples/rulebase-invalid.json

# Analyze a Markdown rulebase
rule-intelligence-mcp analyze -r examples/rulebase-markdown.md --format-in md --output json

# Use a custom schema
rule-intelligence-mcp validate -r examples/rulebase-minimal.json --schema examples/rule-schema-custom.json

# Run with a plugin (conflict check)
rule-intelligence-mcp analyze -r examples/rulebase-complex.yaml --format-in yaml --plugin plugins/conflict-check.js --output json
```

### Automated Example Testing

You can run all example tests automatically:

```bash
bash test/examples.test.sh
```

### Example Test Matrix

| Datei                                 | Erwartetes Ergebnis      | Testbefehl                                                                 |
|---------------------------------------|-------------------------|----------------------------------------------------------------------------|
| rulebase-minimal.json                 | valid                   | validate -r examples/rulebase-minimal.json                                 |
| rulebase-markdown.md                  | valid                   | validate -r examples/rulebase-markdown.md --format-in md                   |
| rulebase-minimal.json + custom-schema | valid                   | validate -r examples/rulebase-minimal.json --schema examples/rule-schema-custom.json |
| analyze + conflict-check plugin       | valid                   | analyze -r examples/rulebase-complex.yaml --format-in yaml --plugin plugins/conflict-check.js --output json |

### Error Test Matrix

| Datei                                 | Erwartetes Ergebnis      | Testbefehl                                                                 |
|---------------------------------------|-------------------------|----------------------------------------------------------------------------|
| rulebase-invalid.json                 | invalid (Fehler)        | validate -r examples/rulebase-invalid.json                                 |
| rulebase-complex.yaml                 | invalid (Fehler)        | validate -r examples/rulebase-complex.yaml --format-in yaml                |

**Hinweis:**
- Für Markdown-Rulebases (`.md`) wird das Paket `gray-matter` benötigt: `npm install gray-matter`
- Für das Custom-Schema mit `format: "date"` kann Ajv (der Validator) eine Warnung ausgeben, dass das Format unbekannt ist. Das beeinträchtigt die Validierung nicht, kann aber mit einem Ajv-Plugin für zusätzliche Formate gelöst werden (siehe [Ajv-Doku](https://ajv.js.org/)).

---

## Library/API Usage

You can use all core functions as a Node.js/TypeScript library:

```ts
import { findDuplicateTitles, validateRulebase, formatMarkdown, loadHistory } from 'rule-intelligence-mcp/lib';

const rules = [/* ... */];
const duplicates = findDuplicateTitles(rules);
const { valid, errors } = validateRulebase(rules, './my-schema.json');
console.log(formatMarkdown({
  totalRules: rules.length,
  missingCategories: [],
  duplicateTitles: duplicates,
  emptyContents: [],
  categoryStats: { /* ... */ }
}));

const mem = loadHistory(10, './my-mem.json');
```

---

## FAQ

**Q: What if I want to use a different LLM or memory backend?**  
A: Just install the required package and use the appropriate CLI flags (`--llm-provider`, `--llm-api-url`, `--memory`).

**Q: Can I add my own analysis logic?**  
A: Yes! Use the `--plugin` flag and provide a JS file that exports a function.

**Q: How do I contribute a new format, plugin, or translation?**  
A: Open a PR or issue – contributions are welcome!

---

## License
MIT © Michael Tittmar

## Optional Features & Installation

Some features require extra dependencies. They are only needed if you use the corresponding command:

- **LLM Suggest (`suggest` command):**
  - Requires: `openai`
  - Install with: `npm install openai`
- **Watch Mode (`watch` command):**
  - Requires: `chokidar`
  - Install with: `npm install chokidar`

If you run a command and the dependency is missing, you will get a clear error message with the install command.

The base install is minimal and only includes core analysis, validation, editing, and memory features.

## Continuous Integration & Coverage

- Every push and pull request on `main` runs all tests automatically via GitHub Actions (see `.github/workflows/ci.yml`).
- Coverage is reported with Jest and can be uploaded to Codecov.
- To check coverage locally:
  ```bash
  npm test -- --coverage
  open coverage/lcov-report/index.html
  ```

## Library/API Usage

You can use all core functions as a Node.js/TypeScript library:

```ts
import { findDuplicateTitles, validateRulebase, formatMarkdown, loadHistory } from 'rule-intelligence-mcp/lib';

const rules = [/* ... */];
const duplicates = findDuplicateTitles(rules);
const { valid, errors } = validateRulebase(rules, './my-schema.json');
console.log(formatMarkdown({
  totalRules: rules.length,
  missingCategories: [],
  duplicateTitles: duplicates,
  emptyContents: [],
  categoryStats: { /* ... */ }
}));

const mem = loadHistory(10, './my-mem.json');
```

## Integration with Cursor AI

You can use Rule Intelligence MCP as a Custom Tool in [Cursor AI](https://www.cursor.so/). This allows you to analyze and validate rulebases directly from your IDE.

See the full guide here: [docs/cursor-integration.md](docs/cursor-integration.md)