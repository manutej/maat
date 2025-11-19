# Maat 𓐙𓌗𓂣𓏏𓁦

> *Named after the Egyptian goddess of truth, cosmic order, and observability*

**Pure Functional Workspace Observability with Categorical Foundations**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![fp-ts](https://img.shields.io/badge/fp--ts-2.16-purple)](https://gcanti.github.io/fp-ts/)

---

## 📚 Documentation

- **[QUICK-START.md](./QUICK-START.md)** - ⚡ Get productive in <1 minute
- **[CLI-ALIASES.md](./CLI-ALIASES.md)** - 🎯 Shell aliases and usage examples
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - 📦 Complete deployment record
- **[README.md](./README.md)** - 📖 This file (architecture, theory, API)

**First time here?** Start with [QUICK-START.md](./QUICK-START.md) → then come back for the deep dive.

---

## 🏛️ Overview

**Maat** (Egyptian: 𓐙𓌗𓂣𓏏𓁦, *Maʽat*) was the goddess who personified truth, balance, and cosmic order. Just as Maat weighed hearts against her feather to determine truth, this tool weighs your workspace health against ideal states to reveal the truth of your codebase.

This is a **pure functional observability system** built on categorical foundations that

- ✅ **Separates concerns**: Pure core (logic) + Impure shell (I/O)
- ✅ **Path agnostic**: Configuration-driven, no hardcoded paths
- ✅ **No side effects** in core functions
- ✅ **Fully testable**: Pure functions need no mocks
- ✅ **Categorical foundations**: Comonad laws verified
- ✅ **Type-safe**: Leverages fp-ts for functional composition

---

## Architecture

### Functional Core, Imperative Shell

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
│  ┌───────────────────────────────────────────┐  │
│  │           index.ts (Composition)          │  │
│  │  Wires pure core + impure shell together  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### File Structure

```
scripts/observe/
├── observe-core.ts         # Pure logic (0 side effects)
├── observe-io.ts           # Impure I/O (all side effects)
├── index.ts                # Main entry point (composition)
├── observe-core.test.ts    # Pure function tests
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

---

## Key Features

### 1. Pure Functional Core

**All business logic is pure**:
- Same inputs → same outputs (deterministic)
- No side effects (no I/O, no mutation)
- Referentially transparent
- Trivially testable

```typescript
// Pure function - no side effects
export const calculateHealthScore = (
  clean: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (clean / total) * 100;
};

// Test without mocks!
expect(calculateHealthScore(7, 10)).toBe(70);
```

### 2. Path Agnostic

**No hardcoded paths** - everything is configurable:

```typescript
interface ObservationConfig {
  readonly workspaceRoot: string;      // Inject any path
  readonly cc2Root: Option<string>;    // Optional CC2.0 root
  readonly linearTeam: Option<string>; // Optional Linear team
  readonly maxDepth: number;           // Configurable scan depth
  readonly excludePatterns: ReadonlyArray<string>;
}
```

### 3. Categorical Foundations

**Comonad Laws Verified**:

```typescript
// Law 1: extract ∘ duplicate = id
const duplicated = duplicate(obs);
expect(extract(duplicated)).toEqual(obs);

// Law 2: fmap extract ∘ duplicate = id
const mapped = map(extract)(duplicate(obs));
expect(mapped.focus).toEqual(obs.focus);

// Law 3: Associativity
const dup1 = duplicate(duplicate(obs));
const dup2 = map(duplicate)(duplicate(obs));
expect(dup1.focus.focus).toEqual(dup2.focus.focus);
```

### 4. Composable Effects

**Uses fp-ts TaskEither** for composable async operations:

```typescript
const main = pipe(
  // Step 1: Scan repos (I/O)
  scanGitRepositories(io, config),

  // Step 2: Get metrics (I/O)
  TE.bindTo('repos'),
  TE.bind('metrics', () => getWorkspaceMetrics(io, config)),

  // Step 3: Observe (Pure!)
  TE.chainW(({ repos, metrics }) =>
    TE.fromEither(observe(config, repos, metrics))
  ),

  // Step 4: Write reports (I/O)
  TE.chainFirst(({ obs }) => writeReports(io, obs))
);
```

### 5. Dependency Injection

**I/O operations are injectable** for testing:

```typescript
interface IODeps {
  readonly exec: (cmd: string, cwd: string) => Promise<{...}>;
  readonly readdir: (path: string) => Promise<string[]>;
  readonly stat: (path: string) => Promise<{...}>;
  readonly writeFile: (path: string, data: string) => Promise<void>;
}

// Production
const productionIO: IODeps = { ... };

// Testing
const mockIO: IODeps = { ... };
```

---

## Usage

### Installation

```bash
cd /Users/manu/Documents/LUXOR/scripts/observe
npm install
npm run build
```

### CLI Usage

```bash
# Observe current directory
npm run observe

# Observe specific path
npm run observe /path/to/workspace

# With CC2.0 and Linear
npm run observe /workspace /path/to/cc2.0 my-linear-team
```

### Programmatic Usage

```typescript
import { Observe } from './observe-core';
import { ObserveIO, productionIO } from './observe-io';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

const config = {
  workspaceRoot: '/my/workspace',
  cc2Root: O.none,
  linearTeam: O.none,
  maxDepth: 4,
  excludePatterns: ['node_modules'],
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

### Test Pure Functions

Pure functions are trivially testable - no mocks needed!

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

### Test Comonad Laws

```typescript
it('should satisfy extract ∘ duplicate = id', () => {
  const obs = createTestObservation();
  const result = extract(duplicate(obs));
  expect(result).toEqual(obs);
});
```

### Test I/O with Mocks

```typescript
const mockIO: IODeps = {
  exec: jest.fn().mockResolvedValue({ stdout: 'main', stderr: '' }),
  readdir: jest.fn().mockResolvedValue(['repo1', 'repo2']),
  // ...
};

const result = await scanGitRepositories(mockIO, config)();
```

---

## Benefits of This Architecture

### 1. **Testability**

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

### 2. **Composability**

**Before**:
```bash
# Hard to compose bash functions
function1 && function2 && function3  # Sequential only
```

**After**:
```typescript
// Compose with algebraic structures
pipe(
  step1,
  TE.chain(step2),
  TE.map(step3),
  TE.mapLeft(handleError)
);
```

### 3. **Type Safety**

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

### 4. **Path Flexibility**

**Before**:
```bash
# Hardcoded paths
LUXOR_ROOT="/Users/manu/Documents/LUXOR"  # Not reusable!
```

**After**:
```typescript
// Configuration-driven
const config: ObservationConfig = {
  workspaceRoot: process.env.WORKSPACE || process.cwd(),
  // Works anywhere!
};
```

### 5. **No Side Effects in Core**

**Before**:
```bash
# Side effects mixed with logic
calculate_health() {
  git status > /tmp/status  # I/O!
  health=$(cat /tmp/status | wc -l)  # More I/O!
  echo $health  # Yet more I/O!
}
```

**After**:
```typescript
// Pure calculation
const calculateHealthScore = (clean: number, total: number): number => {
  return (clean / total) * 100;
  // No I/O, no mutation, just math!
};
```

---

## Categorical Theory

### Observation as a Comonad

```typescript
interface Observation<A> {
  readonly focus: A;              // The "value" at current position
  readonly context: SystemState;  // Full contextual information
  readonly patterns: Pattern[];
  readonly anomalies: Anomaly[];
}
```

**Comonad Operations**:

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

- **Functor**: Transform observations while preserving structure
- **Comonad**: Access full context for any transformation
- **Dual of Monad**: Instead of wrapping values (monad), unwrap context (comonad)

---

## Mathematical Guarantees

### Verified Laws

✅ **Functor Laws**:
- Identity: `map(id) = id`
- Composition: `map(g ∘ f) = map(g) ∘ map(f)`

✅ **Comonad Laws**:
- Left identity: `extract ∘ duplicate = id`
- Right identity: `fmap extract ∘ duplicate = id`
- Associativity: `duplicate ∘ duplicate = fmap duplicate ∘ duplicate`

✅ **Purity**:
- Deterministic: Same inputs always produce same outputs
- No side effects: Functions don't modify external state
- Referential transparency: Can replace function calls with their values

---

## Migration Guide

### From Bash Script to TypeScript

**Old (Bash)**:
```bash
./luxor-observe-cc2.sh
```

**New (TypeScript)**:
```bash
cd scripts/observe
npm run observe
```

### Programmatic Integration

```typescript
// In your TypeScript code
import { main } from './scripts/observe';

const config = { workspaceRoot: '/my/workspace', ... };
const result = await main(config)();

if (E.isRight(result)) {
  console.log('Success!');
} else {
  console.error('Failed:', result.left);
}
```

---

## Future Enhancements

- [ ] Property-based testing with fast-check
- [ ] Streaming observations (Observable pattern)
- [ ] Historical trend analysis
- [ ] Visual dashboard generation
- [ ] Integration with CI/CD pipelines
- [ ] Distributed observation (multi-machine)

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

**Status**: ✅ **PRODUCTION READY**
*Pure, testable, composable, categorical observability*
