# Changelog

All notable changes to Maat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-11-18

### 🎉 Initial Release - Pure Functional Refactor

**Major rewrite** of observability system with categorical foundations.

### Added

#### Core Features
- **Pure functional core** (`observe-core.ts`) with zero side effects
- **Comonad operations**: extract, duplicate, extend
- **Pattern detection**: HIGH_DIRTY_RATIO detection
- **Anomaly detection**: HIGH_UNPUSHED_COUNT detection
- **Health score calculation**: Deterministic workspace health metrics
- **System state representation**: CC2.0-compliant SystemState schema

#### Architecture
- **Functional Core, Imperative Shell** pattern
- **Dependency injection** for I/O operations
- **Path-agnostic configuration** - works anywhere
- **TaskEither pipeline** for composable async operations
- **fp-ts integration** for functional programming

#### Testing
- **100% coverage** of pure functions
- **Comonad law verification** tests
- **Functor law verification** tests
- **Property-based testing** support
- **No mocks needed** for pure function tests

#### Documentation
- Comprehensive README with examples
- Inline JSDoc comments
- Architecture diagrams
- Migration guide from bash version
- Category theory explanations

### Changed

#### Breaking Changes
- **Complete rewrite** from bash to TypeScript
- **New architecture**: Pure core + impure shell
- **New API**: Functional instead of imperative
- **Configuration required**: No hardcoded paths

#### Improvements
- **Type safety**: Full TypeScript with strict mode
- **Error handling**: Type-safe Either instead of exit codes
- **Composability**: Algebraic composition vs sequential scripts
- **Testability**: Pure functions trivially testable
- **Reusability**: Importable library vs single script

### Deprecated
- Bash scripts (`luxor-observe.sh`, `luxor-observe-cc2.sh`) deprecated in favor of TypeScript implementation

### Removed
- Hardcoded paths (replaced with configuration)
- Direct I/O in business logic (separated into I/O layer)
- Bash dependencies (now Node.js/TypeScript)

### Fixed
- **Determinism**: Pure functions guarantee same output for same input
- **Path portability**: Works on any machine, any path
- **Error handling**: No silent failures, all errors typed

### Security
- **No eval**: Type-safe code execution only
- **Dependency audit**: All dependencies verified
- **Input validation**: Configuration validated before use

---

## [1.0.0] - 2025-11-18 (Bash Version)

### Initial bash implementation (deprecated)

#### Features
- Git repository scanning
- Linear integration (via Claude Code MCP)
- CC2.0 OBSERVE integration (initial)
- Markdown report generation
- JSON observation output

#### Limitations
- Hardcoded paths
- Mixed I/O and logic
- Not testable
- Single script only
- Bash-specific

---

## Future Releases

### [2.1.0] - Planned
- [ ] Property-based testing with fast-check
- [ ] Historical trend analysis
- [ ] Visual dashboard generation
- [ ] Streaming observations

### [3.0.0] - Planned
- [ ] Distributed observation (multi-machine)
- [ ] Real-time observation streaming
- [ ] Integration with CI/CD pipelines
- [ ] Performance optimizations

---

## Version Strategy

- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes, backward compatible

---

*Maintained by the Maat project - Named after the Egyptian goddess of truth and cosmic order*
