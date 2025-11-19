# Maat Quick Start

**Maat (𓐙𓌗𓂣𓏏𓁦)** - Categorical Observability for Git Workspaces

---

## ⚡ Instant Usage

```bash
# Reload aliases (first time only)
source ~/.zshrc

# Run observation
maat

# That's it! 🎉
```

---

## 📊 What You Get

### Immediate Insights

- **Health Score**: Overall workspace cleanliness (0-100%)
- **Repository Status**: Clean vs dirty counts
- **Unpushed Work**: Repos with commits not pushed to remote
- **Total Activity**: Cumulative commit count across all repos
- **Pattern Detection**: Structural issues (HIGH_DIRTY_RATIO, etc.)
- **Anomaly Detection**: Statistical deviations requiring attention
- **Trend Analysis**: HEALTHY, NEEDS_CLEANUP, or CRITICAL

### Generated Reports

Two comprehensive reports in `/logs/`:
- **JSON**: `observation-<timestamp>.json` - Machine-readable metrics
- **Markdown**: `observation-<timestamp>.md` - Human-readable report

---

## 🎯 Common Commands

```bash
# Quick health check
maat

# Run tests (verify category theory laws)
maat-test

# Rebuild TypeScript
maat-build

# Test coverage
maat-cov
```

---

## 📈 Example Output

```
╔═══════════════════════════════════════════════════════════╗
║  CATEGORICAL OBSERVABILITY - Pure Functional Core      ║
╚═══════════════════════════════════════════════════════════╝

📊 Observation Complete

Git Repositories:
  Total: 33
  Clean: 17 (51.5%)
  Dirty: 16
  Unpushed: 3
  Total Commits: 2405

Patterns Detected:
  ✓ No significant patterns detected

Comonad Operations Demonstrated:
  extract(): Health Score = 51.5%
  extend(calculateTrend): NEEDS_CLEANUP
  extend(calculateVelocity): 2405 commits

✅ Pure functional observation complete!
```

---

## 🔍 Understanding the Metrics

### Health Score
- **80-100%**: HEALTHY - Most repos clean
- **50-79%**: NEEDS_CLEANUP - Some maintenance required
- **0-49%**: CRITICAL - Significant uncommitted work

### Patterns
- **HIGH_DIRTY_RATIO**: >60% repos have uncommitted changes
- **HIGH_UNPUSHED_COUNT**: Many repos not pushed to remote
- **STALE_REPOSITORIES**: Repos with no recent activity

### Comonad Operations
- **extract()**: Direct value extraction (current health score)
- **extend(calculateTrend)**: Contextual computation (trend from context)
- **extend(calculateVelocity)**: Derived metric (total commits)

These demonstrate category theory in practice!

---

## 📝 Interpreting Trends

| Trend | Health Score | Meaning | Action |
|-------|--------------|---------|--------|
| HEALTHY | 80-100% | Excellent workspace hygiene | Keep it up! |
| NEEDS_CLEANUP | 50-79% | Moderate maintenance needed | Review dirty repos |
| CRITICAL | 0-49% | Significant uncommitted work | Batch commit workflow |

---

## 🎨 Category Theory in Action

Maat isn't just a script - it's a **comonad on observable systems**.

### Functor
Maps SystemState to insights while preserving structure:
```typescript
map(f)(observation) // Transforms focus while keeping context
```

### Comonad
Provides contextual computation:
```typescript
extract(observation)        // Get current value
duplicate(observation)      // Create nested context
extend(f)(observation)      // Compute using full context
```

### Laws Verified
✅ Functor identity: `map(id) = id`
✅ Functor composition: `map(g ∘ f) = map(g) ∘ map(f)`
✅ Comonad left identity: `extract ∘ duplicate = id`
✅ Comonad right identity: `fmap extract ∘ duplicate = id`
✅ Comonad associativity: `duplicate ∘ duplicate = fmap duplicate ∘ duplicate`

All verified in `observe-core.test.ts`!

---

## 🛠️ Manual Execution

If aliases aren't working:

```bash
cd /Users/manu/Documents/LUXOR/scripts/observe
npm run observe /Users/manu/Documents/LUXOR
```

---

## 📚 More Information

- **Full Reference**: `CLI-ALIASES.md`
- **Deployment Details**: `DEPLOYMENT-SUMMARY.md`
- **Architecture**: `README.md`
- **Repository**: https://github.com/manutej/maat
- **Tests**: `npm test` (run from observe directory)

---

## 💡 Pro Tips

### Daily Workflow
```bash
# Morning check
maat

# After work session
maat

# Before end of day
maat
```

### CI/CD Integration
```bash
# Add to your build pipeline
npm run observe /path/to/workspace
```

### Custom Analysis
```bash
# View JSON report with jq
jq . logs/observation-*.json | head -50

# Search markdown reports
grep -i "critical" logs/observation-*.md
```

---

## 🎯 Next Steps

1. **First Run**: `maat` - See your workspace health
2. **Review Reports**: Check `logs/` directory
3. **Clean Up**: Address dirty repos if health score is low
4. **Automate**: Add to daily workflow or CI/CD
5. **Explore**: Read category theory foundations in README.md

---

**Truth, Justice, and Cosmic Order through Pure Functional Observation** 𓐙𓌗𓂣𓏏𓁦

---

*Maat v2.0.0 - Deployed 2025-11-19*

Generated with [Claude Code](https://claude.ai/code) via [Happy](https://happy.engineering)
