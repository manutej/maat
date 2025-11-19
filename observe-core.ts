/**
 * Pure Functional Observability Core
 *
 * Category Theory Foundation:
 * - All functions are pure (no side effects)
 * - Uses fp-ts for functional composition
 * - Separates observation logic from I/O
 *
 * Architecture:
 * - Pure core: Data transformations only
 * - Impure shell: I/O operations (git, filesystem, etc.)
 * - Configuration-driven: No hardcoded paths
 */

import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

// ============================================================================
// TYPES - Domain Model
// ============================================================================

/**
 * Configuration for observation (injected, not hardcoded)
 */
export interface ObservationConfig {
  readonly workspaceRoot: string;
  readonly cc2Root: O.Option<string>;
  readonly linearTeam: O.Option<string>;
  readonly maxDepth: number;
  readonly excludePatterns: ReadonlyArray<string>;
}

/**
 * Git repository state (pure data)
 */
export interface GitRepository {
  readonly path: string;
  readonly name: string;
  readonly branch: string;
  readonly isClean: boolean;
  readonly commitsAhead: number;
  readonly totalCommits: number;
  readonly lastCommitTime: O.Option<Date>;
  readonly hasRemote: boolean;
}

/**
 * Workspace metrics (pure data)
 */
export interface WorkspaceMetrics {
  readonly totalProjects: number;
  readonly totalFiles: number;
  readonly filesByType: Record<string, number>;
}

/**
 * Pattern detected in observations
 */
export interface Pattern {
  readonly type: string;
  readonly significance: number;
  readonly evidence: string;
  readonly recommendation: string;
}

/**
 * Anomaly detected in observations
 */
export interface Anomaly {
  readonly type: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly deviation: number;
  readonly description: string;
  readonly recommendation: string;
}

/**
 * CC2.0 SystemState (following canonical schema)
 */
export interface SystemState {
  readonly context: {
    readonly workspace: string;
    readonly timestamp: Date;
    readonly observationType: string;
  };
  readonly current: {
    readonly git: {
      readonly totalRepositories: number;
      readonly cleanRepositories: number;
      readonly dirtyRepositories: number;
      readonly unpushedRepositories: number;
      readonly totalCommits: number;
      readonly healthScore: number;
    };
    readonly workspace: WorkspaceMetrics;
  };
  readonly history: {
    readonly snapshots: ReadonlyArray<unknown>;
  };
}

/**
 * Categorical observation (comonad wrapper)
 */
export interface Observation<A> {
  readonly focus: A;
  readonly context: SystemState;
  readonly patterns: ReadonlyArray<Pattern>;
  readonly anomalies: ReadonlyArray<Anomaly>;
}

/**
 * Observation errors (explicit type)
 */
export type ObservationError =
  | { readonly _tag: 'InvalidConfig'; readonly reason: string }
  | { readonly _tag: 'GitError'; readonly details: string }
  | { readonly _tag: 'FilesystemError'; readonly details: string }
  | { readonly _tag: 'ParseError'; readonly details: string };

// ============================================================================
// PURE FUNCTIONS - Core Logic
// ============================================================================

/**
 * Calculate health score from repository stats
 * Pure: Same inputs -> same output
 */
export const calculateHealthScore = (
  clean: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (clean / total) * 100;
};

/**
 * Classify repository by status
 * Pure: No side effects
 */
export const classifyRepository = (
  repo: GitRepository
): 'clean' | 'dirty' | 'unpushed' => {
  if (!repo.isClean) return 'dirty';
  if (repo.commitsAhead > 0) return 'unpushed';
  return 'clean';
};

/**
 * Detect HIGH_DIRTY_RATIO pattern
 * Pure: Deterministic pattern detection
 */
export const detectDirtyRatioPattern = (
  repos: ReadonlyArray<GitRepository>
): O.Option<Pattern> => {
  const total = repos.length;
  if (total === 0) return O.none;

  const dirty = repos.filter(r => !r.isClean).length;
  const ratio = dirty / total;

  if (ratio > 0.5) {
    return O.some({
      type: 'HIGH_DIRTY_RATIO',
      significance: 0.8,
      evidence: `${dirty} of ${total} repositories uncommitted`,
      recommendation: 'Batch commit workflow needed',
    });
  }

  return O.none;
};

/**
 * Detect HIGH_UNPUSHED_COUNT anomaly
 * Pure: Deterministic anomaly detection
 */
export const detectUnpushedAnomaly = (
  repos: ReadonlyArray<GitRepository>,
  threshold: number = 5
): O.Option<Anomaly> => {
  const unpushed = repos.filter(r => r.commitsAhead > 0);

  if (unpushed.length > threshold) {
    return O.some({
      type: 'HIGH_UNPUSHED_COUNT',
      severity: 'MEDIUM',
      deviation: unpushed.length / repos.length,
      description: `${unpushed.length} repositories with unpushed commits`,
      recommendation: 'Review and push or create PRs',
    });
  }

  return O.none;
};

/**
 * Aggregate all patterns from repositories
 * Pure: Functional composition
 */
export const detectPatterns = (
  repos: ReadonlyArray<GitRepository>
): ReadonlyArray<Pattern> => {
  return pipe(
    [detectDirtyRatioPattern(repos)],
    A.filterMap(p => p)
  );
};

/**
 * Aggregate all anomalies from repositories
 * Pure: Functional composition
 */
export const detectAnomalies = (
  repos: ReadonlyArray<GitRepository>
): ReadonlyArray<Anomaly> => {
  return pipe(
    [detectUnpushedAnomaly(repos)],
    A.filterMap(a => a)
  );
};

/**
 * Build SystemState from repositories and workspace metrics
 * Pure: Data transformation only
 */
export const buildSystemState = (
  config: ObservationConfig,
  repos: ReadonlyArray<GitRepository>,
  workspace: WorkspaceMetrics
): SystemState => {
  const total = repos.length;
  const clean = repos.filter(r => r.isClean).length;
  const dirty = total - clean;
  const unpushed = repos.filter(r => r.commitsAhead > 0).length;
  const totalCommits = repos.reduce((sum, r) => sum + r.totalCommits, 0);

  return {
    context: {
      workspace: config.workspaceRoot,
      timestamp: new Date(),
      observationType: 'workspace-health',
    },
    current: {
      git: {
        totalRepositories: total,
        cleanRepositories: clean,
        dirtyRepositories: dirty,
        unpushedRepositories: unpushed,
        totalCommits,
        healthScore: calculateHealthScore(clean, total),
      },
      workspace,
    },
    history: {
      snapshots: [],
    },
  };
};

// ============================================================================
// COMONAD OPERATIONS - Categorical Core
// ============================================================================

/**
 * Create observation (comonad constructor)
 * Pure: Wraps data in categorical structure
 */
export const createObservation = <A>(
  focus: A,
  context: SystemState,
  patterns: ReadonlyArray<Pattern>,
  anomalies: ReadonlyArray<Anomaly>
): Observation<A> => ({
  focus,
  context,
  patterns,
  anomalies,
});

/**
 * Extract focused view (comonad extract)
 * Pure: Comonad law - extract ∘ duplicate = id
 */
export const extract = <A>(obs: Observation<A>): A => obs.focus;

/**
 * Duplicate observation (comonad duplicate)
 * Pure: Creates meta-observation
 */
export const duplicate = <A>(
  obs: Observation<A>
): Observation<Observation<A>> => ({
  focus: obs,
  context: obs.context,
  patterns: obs.patterns,
  anomalies: obs.anomalies,
});

/**
 * Extend observation (comonad extend)
 * Pure: Context-aware transformation
 */
export const extend = <A, B>(
  f: (obs: Observation<A>) => B
) => (obs: Observation<A>): Observation<B> => ({
  focus: f(obs),
  context: obs.context,
  patterns: obs.patterns,
  anomalies: obs.anomalies,
});

/**
 * Map over observation (functor map)
 * Pure: Functor law - map(id) = id
 */
export const map = <A, B>(
  f: (a: A) => B
) => (obs: Observation<A>): Observation<B> => ({
  focus: f(obs.focus),
  context: obs.context,
  patterns: obs.patterns,
  anomalies: obs.anomalies,
});

// ============================================================================
// OBSERVATION PIPELINE - Pure Composition
// ============================================================================

/**
 * Main observation function
 * Pure: Composes all transformations
 *
 * Type: (Config, Repos, Workspace) -> Either<Error, Observation<SystemState>>
 */
export const observe = (
  config: ObservationConfig,
  repos: ReadonlyArray<GitRepository>,
  workspace: WorkspaceMetrics
): E.Either<ObservationError, Observation<SystemState>> => {
  // Validate configuration
  if (config.workspaceRoot === '') {
    return E.left({
      _tag: 'InvalidConfig',
      reason: 'workspaceRoot cannot be empty',
    });
  }

  // Build system state (pure)
  const systemState = buildSystemState(config, repos, workspace);

  // Detect patterns (pure)
  const patterns = detectPatterns(repos);

  // Detect anomalies (pure)
  const anomalies = detectAnomalies(repos);

  // Create observation (pure)
  const observation = createObservation(
    systemState,
    systemState,
    patterns,
    anomalies
  );

  return E.right(observation);
};

/**
 * Calculate trend from observation
 * Pure: Used with extend for context-aware analysis
 */
export const calculateTrend = (
  obs: Observation<SystemState>
): 'HEALTHY' | 'NEEDS_CLEANUP' | 'CRITICAL' => {
  const { healthScore } = obs.context.current.git;

  if (healthScore >= 80) return 'HEALTHY';
  if (healthScore >= 50) return 'NEEDS_CLEANUP';
  return 'CRITICAL';
};

/**
 * Calculate velocity from observation
 * Pure: Extracts velocity metric
 */
export const calculateVelocity = (
  obs: Observation<SystemState>
): number => {
  return obs.context.current.git.totalCommits;
};

// ============================================================================
// EXPORTS - Public API
// ============================================================================

export const Observe = {
  // Core observation
  observe,

  // Comonad operations
  extract,
  duplicate,
  extend,
  map,

  // Pattern/anomaly detection
  detectPatterns,
  detectAnomalies,

  // Utilities
  calculateHealthScore,
  classifyRepository,
  calculateTrend,
  calculateVelocity,

  // Constructors
  createObservation,
  buildSystemState,
};
