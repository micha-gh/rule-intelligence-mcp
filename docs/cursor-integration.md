# Integrating Rule Intelligence MCP with Cursor AI

## Introduction

With Cursor AI, you can add your own CLI tools as "Custom Tools" directly into your development environment. This allows you to analyze, validate, and edit rulebases with rule-intelligence-mcp right from within Cursor—no need to leave your IDE.

## Benefits
- Fast rulebase analysis via shortcut or context menu
- Automatic validation on save/commit
- Integration into your own Cursor workflows (e.g. with memory bank, plugins, LLM)

## Step-by-Step Guide

### 1. Prerequisites
- Node.js ≥ 14 installed
- The rule-intelligence-mcp project cloned locally and set up with `npm install`

### 2. Test the MCP tool
Make sure the CLI works:
```bash
npx ts-node index.ts analyze -r examples/rulebase-minimal.json
```

### 3. Open Cursor and add a Custom Tool
1. Open Cursor
2. Go to **Settings → Custom Tools**
3. Click **Add Tool**

#### Example Configuration
- **Name:** Rule Intelligence MCP
- **Command:**
  ```
  npx ts-node /ABSOLUTE/PATH/TO/index.ts analyze -r $file --format-in $ext --output md
  ```
  (Adjust the path to your project. `$file` is the currently opened file, `$ext` its extension.)
- **Working Directory:**
  - `/ABSOLUTE/PATH/TO/YOUR/PROJECT`
- **Input:**
  - `Current File`
- **Output:**
  - `Show in Panel` or `Replace Selection` (depending on your workflow)

#### Optional: More Commands
- For validation:
  ```
  npx ts-node /ABSOLUTE/PATH/TO/index.ts validate -r $file --format-in $ext
  ```
- For plugins:
  ```
  npx ts-node /ABSOLUTE/PATH/TO/index.ts analyze -r $file --format-in $ext --plugin plugins/conflict-check.js --output json
  ```

### 4. Test the Tool
- Open a rulebase file in Cursor (e.g. `.json`, `.yaml`, `.md`)
- Run the custom tool (via context menu or shortcut)
- The result appears in the panel

## Example Use Cases
- **Quick analysis:** Select a file and analyze it directly
- **Pre-commit check:** Integrate validation into a Git hook (via Cursor or shell)
- **LLM-powered suggestions:** Use the tool with LLM options for automatic rule suggestions

## Troubleshooting
- **Error: Module not found:**
  - Check that the path to `index.ts` is correct and all dependencies are installed (`npm install`)
- **gray-matter/js-yaml missing:**
  - Install missing packages with `npm install gray-matter js-yaml`
- **Node version too old:**
  - Update Node.js to ≥ 14
- **Path issues:**
  - Use absolute paths in the tool configuration

## Tips
- You can add multiple custom tools for different commands (analyze, validate, edit)
- Use MCP's output options (`--output md`, `--output json`) for best display in Cursor
- Plugins and the memory bank also work in Cursor if the paths are correct

---

**Questions or problems?**
Open an issue on GitHub or ask in the Cursor Discord! 