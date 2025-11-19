# Maat CLI Aliases

**Quick access commands** for the Maat categorical observability tool.

---

## Shell Aliases

The following aliases have been added to `~/.zshrc`:

```bash
# Maat - Categorical Observability (𓐙𓌗𓂣𓏏𓁦)
alias maat='npm run observe /Users/manu/Documents/LUXOR'
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
  Total: 32
  Clean: 13 (40.6%)
  Dirty: 19
  Unpushed: 3
  Total Commits: 2382

Patterns Detected:
  ⚠  HIGH_DIRTY_RATIO: 19 of 32 repositories uncommitted
     Recommendation: Batch commit workflow needed

Anomalies Detected:
  ✓ No anomalies detected

📄 Reports Generated:
  JSON: /Users/manu/Documents/LUXOR/logs/observation-2025-11-19T05-29-30-080Z.json
  Markdown: /Users/manu/Documents/LUXOR/logs/observation-2025-11-19T05-29-30-080Z.md

Comonad Operations Demonstrated:
  extract(): Health Score = 40.6%
  extend(calculateTrend): CRITICAL
  extend(calculateVelocity): 2382 commits

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
