# Maat 𓐙𓌗𓂣𓏏𓁦

> *Named after the Egyptian goddess of truth, cosmic order, and observability*

**Git workspace health monitoring with mathematical guarantees**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![fp-ts](https://img.shields.io/badge/fp--ts-2.16-purple)](https://gcanti.github.io/fp-ts/)

---

## What is Maat?

**Maat is a workspace observability tool that scans all your git repositories and tells you the truth about your codebase health.**

Just as the Egyptian goddess Maat weighed hearts against her feather to reveal truth, this tool weighs your workspace against ideal states to show you exactly where you stand.

### The Problem It Solves

When you're working on multiple projects, it's hard to answer simple questions:
- **How many repositories have uncommitted changes?**
- **Which repos have unpushed commits?**
- **What's my overall workspace health?**
- **Are there any concerning patterns in my workflow?**

Maat answers these questions in seconds and generates comprehensive reports.

---

## Quick Start

⚡ **New here?** Check out [QUICK-START.md](./QUICK-START.md) for instant setup.

### Installation

```bash
cd /path/to/maat
npm install
npm run build
```

### Usage

```bash
# Basic usage - scan current directory
npm run observe

# Scan specific workspace
npm run observe /path/to/your/workspace

# With shell alias (see CLI-ALIASES.md)
maat
```

### What You Get

**Instant health metrics:**
```
Git Repositories:
  Total: 33
  Clean: 17 (51.5%)
  Dirty: 16
  Unpushed: 3
  Total Commits: 2405
```

**Pattern detection:**
- HIGH_DIRTY_RATIO - More than 50% of repos have uncommitted changes
- HIGH_UNPUSHED_COUNT - Many repos with commits not pushed to remote

**Generated reports in `/logs/`:**
- `observation-<timestamp>.json` - Machine-readable metrics
- `observation-<timestamp>.md` - Human-readable report with recommendations

---

## What Maat Can Do Right Now (v2.0.0)

### Core Features

✅ **Multi-repository scanning**
- Recursively scans your workspace for git repositories
- Configurable depth and exclusion patterns
- Works with any directory structure

✅ **Health metrics**
- Overall workspace health score (0-100%)
- Clean vs dirty repository counts
- Unpushed commit tracking
- Total commit counts across all repos
- Per-repository branch and status information

✅ **Pattern detection**
- Identifies HIGH_DIRTY_RATIO when too many repos are dirty
- Detects HIGH_UNPUSHED_COUNT when many commits aren't pushed
- Provides actionable recommendations

✅ **Anomaly detection**
- Statistical deviation analysis
- Severity classification (LOW/MEDIUM/HIGH)
- Contextualized recommendations

✅ **Report generation**
- JSON reports for machine processing
- Markdown reports for human reading
- Timestamped for historical tracking
- Full context and metrics included

✅ **Pure functional architecture**
- 100% testable code with no mocks needed
- Deterministic - same inputs always produce same outputs
- Type-safe with full TypeScript support
- Path-agnostic configuration (works anywhere)

---

## What Maat Is Intended To Do

### The Vision

Maat is designed to become a **comprehensive workspace observability platform** that helps developers and teams understand their development ecosystem at a glance.

The ultimate goal is to answer questions like:
- "How healthy is my workspace right now?"
- "What patterns emerge in my development workflow?"
- "Are there any anomalies I should address?"
- "How has my workspace evolved over time?"
- "What's the state of my project across distributed machines?"

### Philosophical Foundation

Maat is built on **category theory** and **pure functional programming** principles, which means:
- **Mathematical correctness** - All operations follow verified mathematical laws
- **Reliability** - Pure functions guarantee consistent behavior
- **Testability** - Every component can be tested in isolation
- **Composability** - Features can be combined in powerful ways

This isn't just academic - it means Maat is **trustworthy** in a way most tools aren't. When it reports your health score, you can trust the calculation is correct and reproducible.

---

## Roadmap

### v2.1.0 - Enhanced Analysis (Planned)

- [ ] **Property-based testing** with fast-check for even stronger guarantees
- [ ] **Historical trend analysis** - Track workspace health over time
- [ ] **Visual dashboard generation** - HTML/web-based reports
- [ ] **Streaming observations** - Real-time updates as workspace changes

### v3.0.0 - Distributed & Integrated (Future)

- [ ] **Distributed observation** - Monitor workspaces across multiple machines
- [ ] **Real-time streaming** - WebSocket-based live updates
- [ ] **CI/CD integration** - Built-in support for GitHub Actions, GitLab CI, etc.
- [ ] **Performance optimizations** - Parallel scanning for large workspaces
- [ ] **Linear integration** - Connect workspace health to Linear issues
- [ ] **CC2.0 integration** - Full Claude Code 2.0 OBSERVE protocol support

### Future Possibilities

- 📊 **Team dashboards** - Aggregate metrics across team members
- 📈 **Productivity insights** - Understand commit patterns and velocity
- 🔔 **Alerting system** - Notifications when health drops below thresholds
- 🤖 **AI recommendations** - Smart suggestions based on patterns
- 📦 **Plugin system** - Extensible architecture for custom analyzers

---

## Documentation

- **[QUICK-START.md](./QUICK-START.md)** - ⚡ Get productive in <1 minute
- **[CLI-ALIASES.md](./CLI-ALIASES.md)** - 🎯 Shell aliases and usage examples
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - 📦 Complete deployment record
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - 🤝 How to contribute
- **[CHANGELOG.md](./CHANGELOG.md)** - 📋 Version history and changes

---

## Example: A Day with Maat

### Morning Check
```bash
$ maat
Git Repositories:
  Total: 33
  Clean: 28 (84.8%)
  Dirty: 5
  Unpushed: 2

  extend(calculateTrend): HEALTHY
```

**Interpretation:** You started the day with a clean workspace. Only 5 repos have uncommitted work (probably from yesterday). Good to go!

### After Lunch
```bash
$ maat
Git Repositories:
  Total: 33
  Clean: 20 (60.6%)
  Dirty: 13
  Unpushed: 5

Patterns Detected:
  ⚠ HIGH_DIRTY_RATIO: 13 of 33 repositories uncommitted
     Recommendation: Batch commit workflow needed

  extend(calculateTrend): NEEDS_CLEANUP
```

**Interpretation:** You've been productive! Working across multiple projects. Time to review and commit your changes.

### End of Day
```bash
$ maat
Git Repositories:
  Total: 33
  Clean: 31 (93.9%)
  Dirty: 2
  Unpushed: 0

  extend(calculateTrend): HEALTHY
```

**Interpretation:** Nice work! Everything's committed and pushed. You can end the day with confidence.

---

## Architecture

### High-Level Design

Maat follows the **Functional Core, Imperative Shell** pattern:

```
┌─────────────────────────────────────────────────┐
│              IMPERATIVE SHELL (I/O)             │
│  ┌───────────────────────────────────────────┐  │
│  │     observe-io.ts (Side Effects)          │  │
│  │  • Git commands                           │  │
│  │  • Filesystem operations                  │  │
│  │  • File reading/writing                   │  │
│  │  • TaskEither for async                   │  │
│  └───────────────────────────────────────────┘  │
│                       ↕                          │
│  ┌───────────────────────────────────────────┐  │
│  │         FUNCTIONAL CORE (Pure)            │  │
│  │     observe-core.ts (No Side Effects)     │  │
│  │  • Pattern detection                      │  │
│  │  • Anomaly detection                      │  │
│  │  • Health score calculation               │  │
│  │  • Comonad operations                     │  │
│  │  • All business logic                     │  │
│  └───────────────────────────────────────────┘  │
│                       ↕                          │
│  │           index.ts (Composition)          │  │
│  │  Wires pure core + impure shell together  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Why this matters:**
- The **pure core** contains all business logic and is 100% testable without mocks
- The **impure shell** handles all I/O operations and is dependency-injectable
- They're **completely separated**, making the codebase easy to understand and maintain

### Key Principles

1. **Pure Functions** - No side effects in core logic
2. **Type Safety** - Full TypeScript with strict mode enabled
3. **Configuration-Driven** - No hardcoded paths, works anywhere
4. **Testable** - Pure functions need no mocks
5. **Composable** - Functions combine using algebraic structures

---

## Programmatic Usage

Maat isn't just a CLI tool - you can use it as a library in your TypeScript projects:

```typescript
import { Observe } from './observe-core';
import { ObserveIO, productionIO } from './observe-io';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

const config = {
  workspaceRoot: '/my/workspace',
  cc2Root: { _tag: 'None' },
  linearTeam: { _tag: 'None' },
  maxDepth: 4,
  excludePatterns: ['node_modules', '.git'],
};

// Run observation
pipe(
  ObserveIO.scanGitRepositories(productionIO, config),
  TE.chain(repos =>
    TE.fromEither(Observe.observe(config, repos, mockMetrics))
  ),
  TE.map(observation => {
    console.log('Health:', observation.focus.current.git.healthScore);
    console.log('Patterns:', observation.patterns);
  })
)();
```

---

## Testing

### Run Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### Pure Functions = Easy Testing

Because the core logic is pure, testing requires no mocks:

```typescript
describe('calculateHealthScore', () => {
  it('should be deterministic', () => {
    const result1 = calculateHealthScore(7, 10);
    const result2 = calculateHealthScore(7, 10);
    expect(result1).toBe(result2);
    expect(result1).toBe(70);
  });
});
```

### Mathematical Guarantees

Maat verifies category theory laws in tests:

✅ **Functor Laws**
- Identity: `map(id) = id`
- Composition: `map(g ∘ f) = map(g) ∘ map(f)`

✅ **Comonad Laws**
- Left identity: `extract ∘ duplicate = id`
- Right identity: `fmap extract ∘ duplicate = id`
- Associativity: `duplicate ∘ duplicate = fmap duplicate ∘ duplicate`

This isn't just academic - these laws ensure the tool behaves predictably and reliably.

---

## Why the Name "Maat"?

**Maat** (Egyptian: 𓐙𓌗𓂣𓏏𓁦, *Maʽat*) was the ancient Egyptian goddess who personified:
- **Truth** - Revealing what is, not what we wish to see
- **Cosmic Order** - Maintaining balance and harmony
- **Justice** - Weighing hearts against her feather

In Egyptian mythology, Maat would weigh the heart of the deceased against her feather of truth. If the heart was lighter than the feather (free from sin), the soul could enter the afterlife.

**Similarly, Maat the tool:**
- **Reveals truth** about your workspace health
- **Maintains order** by detecting patterns and anomalies
- **Weighs your repositories** against ideal states to determine health

The feather metaphor is particularly apt - a healthy codebase should be "light" (clean, organized, pushed), not heavy with uncommitted changes and chaos.

---

## Category Theory Deep Dive

> **Note:** This section is for those interested in the mathematical foundations. You don't need to understand this to use Maat!

### Observation as a Comonad

Maat's core data structure is a **comonad**:

```typescript
interface Observation<A> {
  readonly focus: A;              // The "value" at current position
  readonly context: SystemState;  // Full contextual information
  readonly patterns: Pattern[];
  readonly anomalies: Anomaly[];
}
```

**Comonad Operations:**

1. **extract**: Get focused value
   ```typescript
   extract(obs) → obs.focus
   ```

2. **duplicate**: Create meta-observation
   ```typescript
   duplicate(obs) → Observation<Observation<A>>
   ```

3. **extend**: Context-aware transformation
   ```typescript
   extend(f)(obs) → Observation<B>
   // where f: Observation<A> → B
   ```

**Why Comonad?**

Comonads are perfect for **contextual computation**. Unlike monads (which wrap values in context), comonads let you **compute using context**.

For observability, this means:
- You can always **extract** the current value (health score)
- You can **extend** computations that need full context (trend analysis needs history)
- You can **duplicate** to create nested observations (meta-analysis)

This structure ensures all operations are **composable** and **mathematically sound**.

---

## Benefits Over Traditional Approaches

### 1. Testability

**Before** (Imperative):
```bash
# Hard to test - relies on actual filesystem
test_observe() {
  cd /real/path  # Side effect!
  git status     # Side effect!
  # How do we test without a real git repo?
}
```

**After** (Functional):
```typescript
// Easy to test - pure functions
test('observe', () => {
  const result = observe(mockConfig, mockRepos, mockMetrics);
  expect(E.isRight(result)).toBe(true);
  // No filesystem, no git commands, just pure logic!
});
```

### 2. Type Safety

**Before**:
```bash
# No types - runtime errors
result=$(git status)  # What type is result?
```

**After**:
```typescript
// Compiler-verified types
const result: E.Either<ObservationError, Observation<SystemState>>
             = observe(config, repos, metrics);
// Type error if you use it wrong!
```

### 3. Reliability

**Before**:
- Side effects anywhere
- Hard to reason about
- Silent failures possible
- Not reproducible

**After**:
- Pure functions guarantee same output for same input
- Easy to reason about
- All errors typed and explicit
- Completely reproducible

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Areas where we'd love help:**
- Historical trend analysis implementation
- Visual dashboard generation
- Performance optimizations for large workspaces
- Additional pattern detectors
- Documentation improvements

---

## References

### Category Theory
- **Comonads**: Uustalu & Vene (2008) - "Comonadic Notions of Computation"
- **Functors**: Awodey (2010) - "Category Theory"

### Functional Programming
- **fp-ts**: https://gcanti.github.io/fp-ts/
- **Railway Oriented Programming**: Scott Wlaschin

### Architecture
- **Functional Core, Imperative Shell**: Gary Bernhardt
- **Hexagonal Architecture**: Alistair Cockburn

---

## License

MIT - See [LICENSE](./LICENSE) for details.

---

## Status

**Current Version:** v2.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-11-19

*Pure, testable, composable, categorical observability*

**Truth, Justice, and Cosmic Order** 𓐙𓌗𓂣𓏏𓁦
