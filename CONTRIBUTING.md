# Contributing to Maat

Thank you for your interest in contributing to Maat! This document provides guidelines for contributing to the project.

---

## Philosophy

Maat is built on **categorical foundations** and **pure functional principles**. All contributions should adhere to these core tenets:

1. **Pure Core, Impure Shell**: Business logic must be pure; side effects isolated to I/O layer
2. **Mathematical Rigor**: Categorical laws (functor, comonad) must be verified
3. **Type Safety**: Leverage TypeScript and fp-ts for maximum safety
4. **No Side Effects**: Core functions must be deterministic and referentially transparent
5. **Testability**: Pure functions should need no mocks

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- TypeScript >= 5.3
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/manutej/maat.git
cd maat

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run type checking
npm run typecheck
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

Follow the architecture:

- **Pure logic** → `observe-core.ts`
- **I/O operations** → `observe-io.ts`
- **Composition** → `index.ts`
- **Tests** → `*.test.ts`

### 3. Write Tests

All new functionality must include tests:

```typescript
// Pure function test (no mocks!)
describe('myPureFunction', () => {
  it('should be deterministic', () => {
    const result1 = myPureFunction(input);
    const result2 = myPureFunction(input);
    expect(result1).toEqual(result2);
  });
});

// Categorical law test
it('should satisfy functor identity', () => {
  const id = <A>(a: A) => a;
  expect(map(id)(obs)).toEqual(obs);
});
```

### 4. Verify Categorical Properties

If adding new categorical structures, verify the laws:

- **Functor**: Identity, composition
- **Comonad**: extract ∘ duplicate = id, etc.
- **Monoidal**: Associativity, identity

### 5. Run Quality Checks

```bash
npm run typecheck    # TypeScript compilation
npm test             # All tests
npm run test:coverage # Coverage report
npm run lint         # ESLint
```

### 6. Commit Changes

Follow conventional commits:

```bash
git commit -m "feat: add pattern detection for repository health"
git commit -m "fix: correct health score calculation edge case"
git commit -m "docs: update README with new examples"
git commit -m "test: add comonad law verification tests"
```

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style

### TypeScript Conventions

```typescript
// Use readonly for immutability
interface Config {
  readonly workspaceRoot: string;
  readonly maxDepth: number;
}

// Use fp-ts Option instead of null/undefined
import * as O from 'fp-ts/Option';
const maybeValue: O.Option<string> = O.some('value');

// Use fp-ts Either for error handling
import * as E from 'fp-ts/Either';
const result: E.Either<Error, number> = E.right(42);

// Pure functions - no side effects
export const pure = (x: number): number => x * 2;

// Impure functions - return TaskEither
export const impure = (path: string): TE.TaskEither<Error, string> => {
  return TE.tryCatch(
    () => fs.readFile(path, 'utf-8'),
    (error) => new Error(String(error))
  );
};
```

### Naming Conventions

- **Types**: PascalCase (`GitRepository`, `ObservationError`)
- **Functions**: camelCase (`calculateHealthScore`, `detectPatterns`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_DEPTH`, `DEFAULT_CONFIG`)
- **Files**: kebab-case (`observe-core.ts`, `observe-io.ts`)

---

## Testing Guidelines

### Pure Function Tests

```typescript
// Determinism test
it('should be deterministic', () => {
  expect(fn(input)).toEqual(fn(input));
});

// Property-based test
it('should satisfy associativity', () => {
  fc.assert(
    fc.property(fc.integer(), (x) => {
      return fn(fn(x)) === fn(x);
    })
  );
});
```

### I/O Tests

```typescript
// Mock I/O dependencies
const mockIO: IODeps = {
  exec: jest.fn().mockResolvedValue({ stdout: 'main', stderr: '' }),
  readdir: jest.fn().mockResolvedValue(['repo1']),
};

// Test with mock
const result = await scanGitRepositories(mockIO, config)();
expect(E.isRight(result)).toBe(true);
```

### Coverage Requirements

- **Core functions**: 100% coverage required
- **I/O functions**: 80% coverage minimum
- **Integration tests**: All main workflows

---

## Adding New Features

### Pattern Detection

1. Add pure detection function to `observe-core.ts`:
   ```typescript
   export const detectMyPattern = (
     repos: ReadonlyArray<GitRepository>
   ): O.Option<Pattern> => {
     // Pure logic only
   };
   ```

2. Add to pattern aggregation:
   ```typescript
   export const detectPatterns = (repos) => {
     return pipe(
       [detectDirtyRatioPattern(repos), detectMyPattern(repos)],
       A.filterMap(p => p)
     );
   };
   ```

3. Write tests:
   ```typescript
   describe('detectMyPattern', () => {
     it('should detect pattern when conditions met', () => {
       const pattern = detectMyPattern(testRepos);
       expect(O.isSome(pattern)).toBe(true);
     });
   });
   ```

### I/O Operations

1. Add to `IODeps` interface if needed:
   ```typescript
   export interface IODeps {
     readonly myNewOp: (param: string) => Promise<Result>;
   }
   ```

2. Implement in production:
   ```typescript
   export const productionIO: IODeps = {
     myNewOp: async (param) => {
       // Implementation
     },
   };
   ```

3. Use in TaskEither pipeline:
   ```typescript
   export const myOperation = (
     io: IODeps,
     param: string
   ): TE.TaskEither<Error, Result> => {
     return TE.tryCatch(
       () => io.myNewOp(param),
       (error) => new Error(String(error))
     );
   };
   ```

---

## Documentation

### Code Comments

```typescript
/**
 * Calculate health score from repository statistics
 *
 * Pure function - no side effects
 *
 * @param clean - Number of clean repositories
 * @param total - Total number of repositories
 * @returns Health score as percentage (0-100)
 *
 * @example
 * calculateHealthScore(7, 10) // => 70
 */
export const calculateHealthScore = (
  clean: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (clean / total) * 100;
};
```

### README Updates

Update README.md when adding:
- New features
- New configuration options
- New CLI commands
- Breaking changes

---

## Pull Request Process

1. **Update tests**: All new code must have tests
2. **Update docs**: README, JSDoc comments, CHANGELOG
3. **Pass CI**: All checks must pass
4. **Request review**: Tag maintainers
5. **Address feedback**: Respond to review comments
6. **Squash commits**: Keep history clean

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Categorical Properties
- [ ] Functor laws verified
- [ ] Comonad laws verified
- [ ] Pure functions (no side effects)
- [ ] Tests added

## Checklist
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

---

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release

---

## Questions?

- Open an issue for bugs
- Discussions for questions
- PRs for contributions

Thank you for contributing to Maat! 🏛️
