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
- `--status <status>`       Filter rules by status (e.g. active, deprecated)
- `--tag <tag>`             Filter rules by tag (comma-separated for multiple)

### Commands & Examples

#### analyze
Analyze the rulebase and display statistics. Supports filtering by status and tags.
```bash
rule-intelligence-mcp analyze -r rulebase.json --status active
rule-intelligence-mcp analyze -r rulebase.json --tag php
rule-intelligence-mcp analyze -r rulebase.json --tag php,style --status active
rule-intelligence-mcp analyze --rulebase rulebase.json --format md
```

#### validate
Validate the rulebase against the JSON schema.
```bash
rule-intelligence-mcp validate -r rulebase.json -s rule-schema.json
```

#### edit <id>
Update an existing rule by its ID. This also logs the edit to the memory bank.
```bash
rule-intelligence-mcp edit rule-2 --title "Use parameterized queries" --severity high --tags security,database
```

#### suggest
Request new rule suggestions via the OpenAI LLM. Suggestions are logged to the memory bank.
```bash
# Requires OPENAI_API_KEY environment variable
rule-intelligence-mcp suggest -r rulebase.json
```

#### watch
Watch the rulebase file and re-run analysis on changes.
```bash
rule-intelligence-mcp watch -r rulebase.json
```

#### memory:list
List stored interaction history (suggestions, edits).
```bash
rule-intelligence-mcp memory:list --limit 5
```

#### memory:clear
Clear the memory bank and remove all stored interactions.
```bash
rule-intelligence-mcp memory:clear
```

## Memory Bank
- The memory bank (`memory.json`) stores all `edit` and `suggest` interactions with timestamps.
- Use `memory:list` to review history and `memory:clear` to reset.
- Useful for audit trails and LLM context.

## OpenAI API Key
- The `suggest` command requires an OpenAI API key.
- Set it via environment variable: `export OPENAI_API_KEY=sk-...`
- If not set, the suggest integration test is skipped.

## Testing
- Run all tests (unit + integration):
  ```bash
  npm test
  ```
- Tests cover:
  - Core analysis logic (`lib/analyze.test.ts`)
  - CLI commands and memory bank (`lib/cli.integration.test.ts`)
  - LLM suggest (if API key is set)

## Using Your Own Rulebase
- Copy `rulebase-sample.json` and edit as needed.
- Validate with:
  ```bash
  rule-intelligence-mcp validate -r myrules.json
  ```
- Analyze with:
  ```bash
  rule-intelligence-mcp analyze -r myrules.json
  ```

## Error Handling
- Invalid rulebases or schema errors are shown in the CLI with details.
- Example:
  ```
  Rulebase validation failed:
  [ { instancePath: '/0', message: 'must have required property ...' } ]
  ```
- Fix your JSON or schema and re-run the command.

## Project Structure
```
rule-intelligence-mcp/
├── index.ts                 # CLI entry point
├── rule-schema.json         # JSON schema for the rulebase
├── rulebase-sample.json     # Sample rulebase
├── memory.json              # Memory bank storage (auto-generated)
├── lib/
│   ├── analyze.ts           # Analysis and validation functions
│   ├── memory.ts            # Memory storage for interactions
│   ├── analyze.test.ts      # Unit tests for analysis
│   └── cli.integration.test.ts # Integration tests for CLI
├── tsconfig.json            # TypeScript configuration
├── package.json             # Node project metadata & scripts
├── LICENSE                  # License
└── README.md                # This documentation
```

## Contributing
1. Fork the repository
2. Create a branch named `feature/...`
3. Implement your changes and write unit tests
4. Open a pull request

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