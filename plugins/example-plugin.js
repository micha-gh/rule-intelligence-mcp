// Example plugin for rule-intelligence-mcp
// Usage: --plugin ./plugins/example-plugin.js
module.exports = function (rules, analysis) {
  // Example: count rules with 'deprecated' status
  const deprecated = rules.filter(r => r.status === 'deprecated');
  return {
    deprecatedCount: deprecated.length,
    deprecatedRuleIds: deprecated.map(r => r.id)
  };
}; 