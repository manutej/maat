/**
 * Pure Function Tests
 *
 * These tests verify:
 * - Pure functions (same input -> same output)
 * - Categorical laws (functor, comonad)
 * - No side effects
 * - Type safety
 */

import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {
  calculateHealthScore,
  classifyRepository,
  detectDirtyRatioPattern,
  detectUnpushedAnomaly,
  detectPatterns,
  detectAnomalies,
  buildSystemState,
  extract,
  duplicate,
  extend,
  map,
  observe,
  calculateTrend,
  calculateVelocity,
  GitRepository,
  ObservationConfig,
  WorkspaceMetrics,
  Observation,
  SystemState,
} from './observe-core';

// ============================================================================
// TEST DATA - Fixtures
// ============================================================================

const mockConfig: ObservationConfig = {
  workspaceRoot: '/test/workspace',
  cc2Root: O.none,
  linearTeam: O.none,
  maxDepth: 4,
  excludePatterns: ['node_modules', '.git'],
};

const cleanRepo: GitRepository = {
  path: '/test/repo1',
  name: 'repo1',
  branch: 'main',
  isClean: true,
  commitsAhead: 0,
  totalCommits: 10,
  lastCommitTime: O.some(new Date('2024-01-01')),
  hasRemote: true,
};

const dirtyRepo: GitRepository = {
  path: '/test/repo2',
  name: 'repo2',
  branch: 'feature',
  isClean: false,
  commitsAhead: 5,
  totalCommits: 20,
  lastCommitTime: O.some(new Date('2024-01-02')),
  hasRemote: true,
};

const mockMetrics: WorkspaceMetrics = {
  totalProjects: 10,
  totalFiles: 1000,
  filesByType: { '.ts': 500, '.md': 300, '.py': 200 },
};

// ============================================================================
// PURE FUNCTION TESTS
// ============================================================================

describe('Pure Functions', () => {
  describe('calculateHealthScore', () => {
    it('should calculate correct percentage', () => {
      expect(calculateHealthScore(3, 10)).toBe(30);
      expect(calculateHealthScore(10, 10)).toBe(100);
      expect(calculateHealthScore(0, 10)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateHealthScore(0, 0)).toBe(0);
      expect(calculateHealthScore(5, 5)).toBe(100);
    });

    it('should be deterministic (same input -> same output)', () => {
      const result1 = calculateHealthScore(7, 10);
      const result2 = calculateHealthScore(7, 10);
      expect(result1).toBe(result2);
      expect(result1).toBe(70);
    });
  });

  describe('classifyRepository', () => {
    it('should classify dirty repos', () => {
      expect(classifyRepository(dirtyRepo)).toBe('dirty');
    });

    it('should classify unpushed repos', () => {
      const unpushedRepo = { ...cleanRepo, commitsAhead: 3 };
      expect(classifyRepository(unpushedRepo)).toBe('unpushed');
    });

    it('should classify clean repos', () => {
      expect(classifyRepository(cleanRepo)).toBe('clean');
    });

    it('should be deterministic', () => {
      expect(classifyRepository(cleanRepo)).toBe(classifyRepository(cleanRepo));
    });
  });

  describe('detectDirtyRatioPattern', () => {
    it('should detect high dirty ratio', () => {
      const repos = [dirtyRepo, dirtyRepo, dirtyRepo, cleanRepo, cleanRepo];
      const pattern = detectDirtyRatioPattern(repos);

      expect(O.isSome(pattern)).toBe(true);
      if (O.isSome(pattern)) {
        expect(pattern.value.type).toBe('HIGH_DIRTY_RATIO');
        expect(pattern.value.significance).toBe(0.8);
      }
    });

    it('should not detect pattern when ratio is low', () => {
      const repos = [cleanRepo, cleanRepo, cleanRepo, dirtyRepo];
      const pattern = detectDirtyRatioPattern(repos);

      expect(O.isNone(pattern)).toBe(true);
    });

    it('should handle empty array', () => {
      const pattern = detectDirtyRatioPattern([]);
      expect(O.isNone(pattern)).toBe(true);
    });

    it('should be deterministic', () => {
      const repos = [dirtyRepo, dirtyRepo, cleanRepo];
      const result1 = detectDirtyRatioPattern(repos);
      const result2 = detectDirtyRatioPattern(repos);
      expect(result1).toEqual(result2);
    });
  });

  describe('detectUnpushedAnomaly', () => {
    it('should detect high unpushed count', () => {
      const unpushedRepo = { ...cleanRepo, commitsAhead: 10 };
      const repos = Array(6).fill(unpushedRepo);
      const anomaly = detectUnpushedAnomaly(repos, 5);

      expect(O.isSome(anomaly)).toBe(true);
      if (O.isSome(anomaly)) {
        expect(anomaly.value.type).toBe('HIGH_UNPUSHED_COUNT');
        expect(anomaly.value.severity).toBe('MEDIUM');
      }
    });

    it('should not detect anomaly below threshold', () => {
      const unpushedRepo = { ...cleanRepo, commitsAhead: 10 };
      const repos = Array(3).fill(unpushedRepo);
      const anomaly = detectUnpushedAnomaly(repos, 5);

      expect(O.isNone(anomaly)).toBe(true);
    });

    it('should be configurable', () => {
      const unpushedRepo = { ...cleanRepo, commitsAhead: 10 };
      const repos = Array(2).fill(unpushedRepo);

      const anomaly1 = detectUnpushedAnomaly(repos, 1);
      const anomaly2 = detectUnpushedAnomaly(repos, 3);

      expect(O.isSome(anomaly1)).toBe(true);
      expect(O.isNone(anomaly2)).toBe(true);
    });
  });

  describe('buildSystemState', () => {
    it('should build correct system state', () => {
      const repos = [cleanRepo, cleanRepo, dirtyRepo, dirtyRepo, dirtyRepo];
      const state = buildSystemState(mockConfig, repos, mockMetrics);

      expect(state.context.workspace).toBe('/test/workspace');
      expect(state.current.git.totalRepositories).toBe(5);
      expect(state.current.git.cleanRepositories).toBe(2);
      expect(state.current.git.dirtyRepositories).toBe(3);
      expect(state.current.git.healthScore).toBe(40);
    });

    it('should be deterministic', () => {
      const repos = [cleanRepo, dirtyRepo];
      const state1 = buildSystemState(mockConfig, repos, mockMetrics);
      const state2 = buildSystemState(mockConfig, repos, mockMetrics);

      expect(state1.current.git).toEqual(state2.current.git);
    });

    it('should handle empty repos', () => {
      const state = buildSystemState(mockConfig, [], mockMetrics);

      expect(state.current.git.totalRepositories).toBe(0);
      expect(state.current.git.healthScore).toBe(0);
    });
  });
});

// ============================================================================
// COMONAD LAW TESTS
// ============================================================================

describe('Comonad Laws', () => {
  let testObservation: Observation<SystemState>;

  beforeEach(() => {
    const repos = [cleanRepo, dirtyRepo];
    const state = buildSystemState(mockConfig, repos, mockMetrics);
    const patterns = detectPatterns(repos);
    const anomalies = detectAnomalies(repos);

    const result = observe(mockConfig, repos, mockMetrics);
    if (E.isRight(result)) {
      testObservation = result.right;
    }
  });

  it('should satisfy left identity: extract ∘ duplicate = id', () => {
    const duplicated = duplicate(testObservation);
    const extracted = extract(duplicated);

    expect(extracted).toEqual(testObservation);
  });

  it('should satisfy right identity: fmap extract ∘ duplicate = id', () => {
    const duplicated = duplicate(testObservation);
    const mapped = map(extract)(duplicated);

    expect(mapped.focus).toEqual(testObservation.focus);
  });

  it('should satisfy associativity', () => {
    const dup1 = duplicate(duplicate(testObservation));
    const dup2 = map(duplicate)(duplicate(testObservation));

    expect(dup1.focus.focus).toEqual(dup2.focus.focus);
  });
});

// ============================================================================
// FUNCTOR LAW TESTS
// ============================================================================

describe('Functor Laws', () => {
  let testObservation: Observation<SystemState>;

  beforeEach(() => {
    const repos = [cleanRepo];
    const result = observe(mockConfig, repos, mockMetrics);
    if (E.isRight(result)) {
      testObservation = result.right;
    }
  });

  it('should satisfy identity: map(id) = id', () => {
    const id = <A>(a: A): A => a;
    const mapped = map(id)(testObservation);

    expect(mapped.focus).toEqual(testObservation.focus);
  });

  it('should satisfy composition: map(g ∘ f) = map(g) ∘ map(f)', () => {
    const f = (s: SystemState) => s.current.git.healthScore;
    const g = (n: number) => n * 2;

    const composed = map((s: SystemState) => g(f(s)))(testObservation);
    const separate = map(g)(map(f)(testObservation));

    expect(composed.focus).toBe(separate.focus);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('observe function', () => {
  it('should create valid observation', () => {
    const repos = [cleanRepo, dirtyRepo, dirtyRepo];
    const result = observe(mockConfig, repos, mockMetrics);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.focus.current.git.totalRepositories).toBe(3);
      expect(result.right.patterns.length).toBeGreaterThan(0);
    }
  });

  it('should validate configuration', () => {
    const invalidConfig = { ...mockConfig, workspaceRoot: '' };
    const result = observe(invalidConfig, [cleanRepo], mockMetrics);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left._tag).toBe('InvalidConfig');
    }
  });

  it('should be pure (no side effects)', () => {
    const repos = [cleanRepo, dirtyRepo];

    const result1 = observe(mockConfig, repos, mockMetrics);
    const result2 = observe(mockConfig, repos, mockMetrics);

    expect(result1).toEqual(result2);
  });
});

describe('Trend Calculation', () => {
  it('should calculate HEALTHY trend', () => {
    const repos = Array(10).fill(cleanRepo);
    const result = observe(mockConfig, repos, mockMetrics);

    if (E.isRight(result)) {
      const trend = calculateTrend(result.right);
      expect(trend).toBe('HEALTHY');
    }
  });

  it('should calculate NEEDS_CLEANUP trend', () => {
    const repos = [cleanRepo, cleanRepo, cleanRepo, dirtyRepo, dirtyRepo, dirtyRepo];
    const result = observe(mockConfig, repos, mockMetrics);

    if (E.isRight(result)) {
      const trend = calculateTrend(result.right);
      expect(trend).toBe('NEEDS_CLEANUP');
    }
  });

  it('should calculate CRITICAL trend', () => {
    const repos = [cleanRepo, dirtyRepo, dirtyRepo, dirtyRepo, dirtyRepo];
    const result = observe(mockConfig, repos, mockMetrics);

    if (E.isRight(result)) {
      const trend = calculateTrend(result.right);
      expect(trend).toBe('CRITICAL');
    }
  });
});
