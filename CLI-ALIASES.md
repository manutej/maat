# Maat CLI Aliases

**Quick access commands** for the Maat categorical observability tool.

---

## Shell Aliases

The following aliases have been added to `~/.zshrc`:

```bash
# Maat - Categorical Observability (𓐙𓌗𓂣𓏏𓁦)
alias maat='cd /Users/manu/Documents/LUXOR/scripts/observe && npm run observe /Users/manu/Documents/LUXOR'
alias maat-test='cd /Users/manu/Documents/LUXOR/scripts/observe && npm test'
alias maat-build='cd /Users/manu/Documents/LUXOR/scripts/observe && npm run build'
alias maat-cov='cd /Users/manu/Documents/LUXOR/scripts/observe && npm run test:coverage'
```

---

## Usage

### Quick Observation

```bash
maat
```

Runs observation on the LUXOR workspace and generates:
- JSON report: `logs/observation-<timestamp>.json`
- Markdown report: `logs/observation-<timestamp>.md`

**Output includes**:
- Git repository health metrics
- Pattern detection (HIGH_DIRTY_RATIO, etc.)
- Anomaly detection
- Comonad operations (extract, extend demonstrations)

---

### Run Tests

```bash
maat-test
```

Runs the test suite including:
- Comonad law verification (left identity, right identity, associativity)
- Functor law verification (identity, composition)
- Pure function tests
- Pattern detection tests
- Anomaly detection tests

---

### Build TypeScript

```bash
maat-build
```

Compiles TypeScript source to JavaScript in `dist/` directory.

---

### Test Coverage

```bash
maat-cov
```

Runs tests with code coverage report.

---

## Alternative: Direct npm commands

If you prefer not to use aliases, you can run directly:

```bash
# From scripts/observe directory
npm run observe /path/to/workspace
npm test
npm run build
npm run test:coverage
```

---

## Example Session

```bash
# Quick health check
$ maat

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

Anomalies Detected:
  ✓ No anomalies detected

📄 Reports Generated:
  JSON: /Users/manu/Documents/LUXOR/logs/observation-2025-11-19T07-00-44-957Z.json
  Markdown: /Users/manu/Documents/LUXOR/logs/observation-2025-11-19T07-00-44-957Z.md

Comonad Operations Demonstrated:
  extract(): Health Score = 51.5%
  extend(calculateTrend): NEEDS_CLEANUP
  extend(calculateVelocity): 2405 commits

✅ Pure functional observation complete!
```

---

## Activating Aliases

After adding to `~/.zshrc`, reload your shell:

```bash
source ~/.zshrc
```

Or open a new terminal window.

---

**Generated**: 2025-11-19
**Maat Version**: 2.0.0
**Repository**: https://github.com/manutej/maat

---

*Truth, Justice, and Cosmic Order through Pure Functional Observation* 𓐙𓌗𓂣𓏏𓁦
