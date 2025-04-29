// Example plugin: Find conflicting rules (e.g. allow X and forbid X)
module.exports = function (rules) {
  const conflicts = [];
  for (const r1 of rules) {
    for (const r2 of rules) {
      if (r1.id !== r2.id && r1.category === r2.category) {
        if (r1.content && r2.content &&
            r1.content.toLowerCase().includes('allow') &&
            r2.content.toLowerCase().includes('forbid')) {
          conflicts.push({
            rule1: r1.id,
            rule2: r2.id,
            category: r1.category
          });
        }
      }
    }
  }
  return { conflicts };
}; 