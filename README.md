# Rule Intelligence MCP – Universal Rulebase Analyzer

[![Build Status](https://img.shields.io/github/actions/workflow/status/micha-gh/rule-intelligence-mcp/ci.yml?branch=main)](https://github.com/micha-gh/rule-intelligence-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Coverage Status](https://img.shields.io/badge/coverage-unknown-lightgrey)](./)

**Author:** Michael Tittmar

---

## How to contribute

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md) for how to open issues, submit PRs, and coding guidelines.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.

---

## Overview

**Rule Intelligence MCP** is a flexible open-source CLI & library to analyze, validate, and manage any kind of rulebase – for any language, team, or workflow. It supports multiple formats, custom checks (plugins), AI integration, and more.

---

## Features – What does this tool do for you?

- **Rulebase Analysis:**
  Find missing categories, duplicate rules, empty content, and other issues in your rules. Example: Detect if a coding guideline is missing a category or if two rules have the same title.

- **Schema Validation:**
  Check your rules against any JSON schema to ensure consistency and completeness. Example: Enforce that every rule has an `id`, `title`, and `category`.

- **Flexible Filtering:**
  Filter rules by status (e.g. active, deprecated), tags, or custom fields. Example: List only active security rules for a release checklist.

- **Multiple Output Formats:**
  Export results as JSON (for automation), Markdown (for docs), CSV (for Excel), or HTML (for reports). Example: Generate a Markdown summary for your team wiki.

- **Interactive Editing:**
  Edit rules directly from the CLI, e.g. update a title or category without opening a text editor.

- **Memory Bank (Change History):**
  All edits and suggestions are logged with timestamps. Example: Track who changed what and when.

- **AI Integration (LLM):**
  Get suggestions for new or improved rules from AI models like OpenAI GPT. Example: "Suggest 3 new security rules for my project."

- **Live Watch Mode:**
  Automatically re-analyze your rulebase when files change. Example: Get instant feedback while editing.

- **Plugin System:**
  Write your own checks/analysis in JavaScript. Example: Plugin that finds conflicting rules.

- **Flexible Input:**
  Supports JSON, YAML, TOML, and Markdown (frontmatter). Example: Use the tool for rules in code, docs, or config files.

- **Tested & CI-ready:**
  Includes unit and integration tests, ideal for CI pipelines to enforce rule quality before merging code.

---

## Quickstart

**Get started in minutes:**

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

## CLI Usage – How to use the tool

```bash
rule-intelligence-mcp <command> [options]
```

### Common CLI Options (Examples)

| Option                | Description                                                      | Example                                  |
|----------------------|------------------------------------------------------------------|------------------------------------------|
| `-r, --rulebase`     | Path to rulebase file (JSON/YAML/TOML/MD)                        | `-r rules.json`                          |
| `-s, --schema`       | Path to JSON schema file                                         | `-s my-schema.json`                      |
| `--format-in`        | Input format: json, yaml, toml, md (usually auto-detected)        | `--format-in yaml`                       |
| `-o, --output`       | Output format: json, md, csv, html                               | `--output csv`                           |
| `--status`           | Filter rules by status                                           | `--status active`                        |
| `--tag`              | Filter by tags (comma-separated)                                 | `--tag security,style`                   |
| `--plugin`           | Path to JS plugin for custom checks                              | `--plugin ./plugins/my-check.js`         |
| `--llm-provider`     | LLM provider (openai, azure, local, ...)                         | `--llm-provider openai`                  |
| `--llm-api-url`      | LLM API base URL (for custom providers)                          | `--llm-api-url https://api.example.com`  |
| `--llm-model`        | LLM model name                                                  | `--llm-model gpt-4`                      |
| `--memory`           | Path to memory bank file                                         | `--memory .data/mem.json`                |

---

### Example Commands

```bash
# Analyze a rulebase (format usually auto-detected)
rule-intelligence-mcp analyze -r myrules.json --output md
rule-intelligence-mcp analyze -r myrules.yaml --format-in yaml --output csv
rule-intelligence-mcp analyze -r myrules.json --plugin ./plugins/example-plugin.js --output json

# Edit a rule
rule-intelligence-mcp edit rule-2 --title "Use parameterized queries"

# Show memory bank
rule-intelligence-mcp memory:list --memory .data/mem.json

# AI suggestions (optional, install openai first)
npm install openai
rule-intelligence-mcp suggest -r myrules.json --llm-provider openai --llm-model gpt-3.5-turbo

# Watch mode (optional, install chokidar first)
npm install chokidar
rule-intelligence-mcp watch -r myrules.json
```

---

## Flexible Schema & Rulebase Format

- Use any JSON schema for validation (`--schema my-schema.json`)
- Rulebases can be JSON, YAML, TOML, or Markdown (with frontmatter)
- Format is usually auto-detected, but can be set with `--format-in`
- **YAML example:**
  ```bash
  rule-intelligence-mcp analyze -r rules.yaml --format-in yaml
  ```
- **Markdown example:**
  ```bash
  rule-intelligence-mcp analyze -r rules.md --format-in md
  ```

---

## Output Formats

- `--output json` (default, for automation)
- `--output md` (Markdown, for docs)
- `--output csv` (Excel/tables)
- `--output html` (reports)

---

## Plugins: Custom Checks & Analysis

- Write your own checks as a JS file: `--plugin ./my-check.js`
- The plugin receives the rulebase and the current analysis result as input and returns an object to merge into the output
- See `plugins/example-plugin.js` as a template
- **Example:** Count deprecated rules and add the result

---

## LLM Provider (AI) Configuration

- Use any LLM provider: OpenAI, Azure, local, etc.
- Flags: `--llm-provider`, `--llm-api-url`, `--llm-model`
- Example: `rule-intelligence-mcp suggest --llm-provider openai --llm-model gpt-4`
- Install required packages first (see docs)
- Set API keys as environment variables (e.g. `OPENAI_API_KEY`)

---

## Memory Bank

- Stores all `edit` and `suggest` interactions with timestamps
- Location and backend are configurable (`--memory memory.json`, `--memory .data/mem.json`)
- Manage with `memory:list` and `memory:clear`

---

## Testing & CI

- Run all tests: `npm test`
- Coverage: `npm test -- --coverage`
- GitHub Actions workflow in `.github/workflows/ci.yml`

---

## Testing with Example Rulebases, Schemas, and Plugins

**Get to know the tool with real examples:**

- The `examples/` folder contains various rulebases (minimal, complex, invalid, markdown)
- The `plugins/` folder contains example plugins
- The `test/` folder contains test scripts for positive and negative cases

**Run automated tests:**
```bash
bash test/examples.test.sh
bash test/examples.error.test.sh
```

**Test matrix and notes can be found further down in the README.**

---

## Integration with Cursor AI

You can use Rule Intelligence MCP as a Custom Tool in [Cursor AI](https://www.cursor.so/). This allows you to analyze and validate rulebases directly from your IDE.

**Step-by-step guide:** [docs/cursor-integration.md](docs/cursor-integration.md)