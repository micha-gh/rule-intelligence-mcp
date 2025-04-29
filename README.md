# rule-intelligence-mcp

A **Rule Intelligence MCP** tool (Node.js + TypeScript) for analyzing, validating, and managing rulebases (JSON) via a simple CLI.

## Features

- Analyze rulebases for missing categories, duplicate titles, and empty contents
- Validate against a JSON schema (AJV)
- Output results as JSON or Markdown
- Interactive rule editing via CLI commands
- Automated rule suggestions via OpenAI LLM
- Watch mode for live analysis on file changes
- Memory bank for storing interactions (`memory:list`, `memory:clear`)

## Quickstart

### Prerequisites

- Node.js ≥ 14
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/micha-gh/rule-intelligence-mcp.git
cd rule-intelligence-mcp

# Install dependencies
npm install
```

### Development & Run

```bash
# Development mode with auto-reload
npm run dev -- analyze

# Production / Start
npm start -- analyze
```

## CLI Commands

All commands are exposed via the `rule-intelligence-mcp` binary (alias: `npm start -- <command>`):

```bash
rule-intelligence-mcp <command> [options]
```

### Global Options

- `-r, --rulebase <path>`  Path to the rulebase JSON file (default: `rulebase-sample.json`)
- `-s, --schema <path>`     Path to the JSON schema file (default: `rule-schema.json`)
- `-f, --format <json|md>`  Output format: JSON or Markdown (default: `json`)

### Commands

#### analyze

Analyze the rulebase and display statistics.

```bash
# JSON output (default)
rule-intelligence-mcp analyze \
  -r rulebase.json \
  -f json

# Markdown report
rule-intelligence-mcp analyze \
  --rulebase rulebase.json \
  --format md
```

#### validate

Validate the rulebase against the JSON schema.

```bash
rule-intelligence-mcp validate \
  -r rulebase.json \
  -s rule-schema.json
```

#### edit <id>

Update an existing rule by its ID.

```bash
rule-intelligence-mcp edit rule-2 \
  --title "Use parameterized queries" \
  --severity high \
  --tags security,database
```

#### suggest

Request new rule suggestions via the OpenAI LLM.

```bash
rule-intelligence-mcp suggest \
  -r rulebase.json
```

#### watch

Watch the rulebase file and re-run analysis on changes.

```bash
rule-intelligence-mcp watch \
  -r rulebase.json
```

#### memory:list

List stored interaction history (suggestions, edits).

```bash
rule-intelligence-mcp memory:list \
  --limit 5
```

#### memory:clear

Clear the memory bank and remove all stored interactions.

```bash
rule-intelligence-mcp memory:clear
```

## Project Structure

```
rule-intelligence-mcp/
├── index.ts             # CLI entry point
├── rule-schema.json     # JSON schema for the rulebase
├── rulebase-sample.json # Sample rulebase
├── memory.json          # Memory bank storage (auto-generated)
├── lib/
│   ├── analyze.ts       # Analysis and validation functions
│   └── memory.ts        # Memory storage for interactions
├── tsconfig.json        # TypeScript configuration
├── package.json         # Node project metadata & scripts
└── README.md            # This documentation
```

## Contributing

1. Fork the repository
2. Create a branch named `feature/...`
3. Implement your changes and write unit tests
4. Open a pull request

## License

MIT © Michael Tittmar