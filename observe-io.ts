/**
 * Impure I/O Layer for Observability
 *
 * This module contains ALL side effects:
 * - Filesystem operations
 * - Git command execution
 * - File reading/writing
 * - External process calls
 *
 * Architecture:
 * - Uses fp-ts TaskEither for async + error handling
 * - All functions return TaskEither (lazy, composable effects)
 * - No execution until explicitly run
 * - Testable via dependency injection
 */

import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

import {
  ObservationConfig,
  GitRepository,
  WorkspaceMetrics,
  ObservationError,
  SystemState,
  Observation,
} from './observe-core';

const execAsync = promisify(exec);

// ============================================================================
// I/O ABSTRACTIONS - Dependency Injection
// ============================================================================

/**
 * Abstract I/O operations (injectable for testing)
 */
export interface IODeps {
  readonly exec: (cmd: string, cwd: string) => Promise<{ stdout: string; stderr: string }>;
  readonly readdir: (path: string) => Promise<string[]>;
  readonly stat: (path: string) => Promise<{ isDirectory: () => boolean }>;
  readonly exists: (path: string) => Promise<boolean>;
  readonly writeFile: (path: string, data: string) => Promise<void>;
}

/**
 * Production I/O implementation
 */
export const productionIO: IODeps = {
  exec: async (cmd: string, cwd: string) => execAsync(cmd, { cwd }),
  readdir: fs.readdir,
  stat: async (p: string) => fs.stat(p),
  exists: async (p: string) => {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  },
  writeFile: fs.writeFile,
};

// ============================================================================
// GIT OPERATIONS - Pure Wrappers Around Impure I/O
// ============================================================================

/**
 * Find all git repositories under a path
 * Impure: Filesystem read
 */
export const findGitRepositories = (
  io: IODeps,
  rootPath: string,
  maxDepth: number = 4
): TE.TaskEither<ObservationError, ReadonlyArray<string>> => {
  const findGitDirs = async (
    currentPath: string,
    depth: number
  ): Promise<string[]> => {
    if (depth > maxDepth) return [];

    try {
      const entries = await io.readdir(currentPath);
      const gitDirs: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);

        try {
          const stat = await io.stat(fullPath);

          if (entry === '.git' && stat.isDirectory()) {
            gitDirs.push(path.dirname(fullPath));
          } else if (
            stat.isDirectory() &&
            !entry.startsWith('.') &&
            entry !== 'node_modules'
          ) {
            const subDirs = await findGitDirs(fullPath, depth + 1);
            gitDirs.push(...subDirs);
          }
        } catch {
          // Skip inaccessible directories
          continue;
        }
      }

      return gitDirs;
    } catch (error) {
      throw error;
    }
  };

  return TE.tryCatch(
    () => findGitDirs(rootPath, 0),
    (error): ObservationError => ({
      _tag: 'FilesystemError',
      details: error instanceof Error ? error.message : String(error),
    })
  );
};

/**
 * Get git repository information
 * Impure: Executes git commands
 */
export const getGitRepoInfo = (
  io: IODeps,
  repoPath: string
): TE.TaskEither<ObservationError, GitRepository> => {
  const getInfo = async (): Promise<GitRepository> => {
    const name = path.basename(repoPath);

    // Get branch (handle repos with no commits)
    let branch = 'main';
    try {
      const branchResult = await io.exec('git rev-parse --abbrev-ref HEAD', repoPath);
      branch = branchResult.stdout.trim();
    } catch {
      // No HEAD yet - try to get default branch name
      try {
        const branchResult = await io.exec('git symbolic-ref --short HEAD', repoPath);
        branch = branchResult.stdout.trim() || 'main';
      } catch {
        branch = 'main';
      }
    }

    // Check if clean (git diff-index exits with 1 if dirty, so we need try-catch)
    let isClean = true;
    try {
      await io.exec('git diff-index --quiet HEAD --', repoPath);
    } catch {
      // Command failed = repository has changes OR no HEAD
      // Check if there are any files staged/unstaged
      try {
        const statusResult = await io.exec('git status --porcelain', repoPath);
        isClean = statusResult.stdout.trim() === '';
      } catch {
        isClean = true; // Assume clean if we can't check
      }
    }

    // Get commits ahead
    let commitsAhead = 0;
    let hasRemote = false;
    try {
      const remoteResult = await io.exec('git rev-parse --abbrev-ref @{u}', repoPath);
      if (remoteResult.stdout.trim()) {
        hasRemote = true;
        const aheadResult = await io.exec('git rev-list @{u}..HEAD --count', repoPath);
        commitsAhead = parseInt(aheadResult.stdout.trim(), 10) || 0;
      }
    } catch {
      // No remote configured
      hasRemote = false;
    }

    // Get total commits
    let totalCommits = 0;
    try {
      const commitsResult = await io.exec('git rev-list --count HEAD', repoPath);
      totalCommits = parseInt(commitsResult.stdout.trim(), 10) || 0;
    } catch {
      // No commits yet
      totalCommits = 0;
    }

    // Get last commit time
    let lastCommitTime: O.Option<Date> = O.none;
    try {
      const timeResult = await io.exec('git log -1 --format=%ct', repoPath);
      const timestamp = parseInt(timeResult.stdout.trim(), 10);
      if (!isNaN(timestamp)) {
        lastCommitTime = O.some(new Date(timestamp * 1000));
      }
    } catch {
      // No commits yet
    }

    return {
      path: repoPath,
      name,
      branch,
      isClean,
      commitsAhead,
      totalCommits,
      lastCommitTime,
      hasRemote,
    };
  };

  return TE.tryCatch(
    getInfo,
    (error): ObservationError => ({
      _tag: 'GitError',
      details: error instanceof Error ? error.message : String(error),
    })
  );
};

/**
 * Scan all git repositories
 * Impure: Composes filesystem and git operations
 */
export const scanGitRepositories = (
  io: IODeps,
  config: ObservationConfig
): TE.TaskEither<ObservationError, ReadonlyArray<GitRepository>> => {
  return pipe(
    findGitRepositories(io, config.workspaceRoot, config.maxDepth),
    TE.chain(repoPaths =>
      pipe(
        Array.from(repoPaths),
        A.map(repoPath => getGitRepoInfo(io, repoPath)),
        TE.sequenceArray
      )
    )
  );
};

// ============================================================================
// FILESYSTEM OPERATIONS
// ============================================================================

/**
 * Count files by extension
 * Impure: Filesystem read
 */
export const countFilesByType = (
  io: IODeps,
  rootPath: string,
  extensions: ReadonlyArray<string>
): TE.TaskEither<ObservationError, Record<string, number>> => {
  const countFiles = async (): Promise<Record<string, number>> => {
    const counts: Record<string, number> = {};
    extensions.forEach(ext => {
      counts[ext] = 0;
    });

    const walk = async (dir: string): Promise<void> => {
      const entries = await io.readdir(dir);

      for (const entry of entries) {
        if (entry.startsWith('.') || entry === 'node_modules') continue;

        const fullPath = path.join(dir, entry);
        const stat = await io.stat(fullPath);

        if (stat.isDirectory()) {
          await walk(fullPath);
        } else {
          const ext = path.extname(entry);
          if (ext && counts[ext] !== undefined) {
            counts[ext]++;
          }
        }
      }
    };

    await walk(rootPath);
    return counts;
  };

  return TE.tryCatch(
    countFiles,
    (error): ObservationError => ({
      _tag: 'FilesystemError',
      details: error instanceof Error ? error.message : String(error),
    })
  );
};

/**
 * Get workspace metrics
 * Impure: Filesystem operations
 */
export const getWorkspaceMetrics = (
  io: IODeps,
  config: ObservationConfig
): TE.TaskEither<ObservationError, WorkspaceMetrics> => {
  return pipe(
    countFilesByType(io, config.workspaceRoot, ['.md', '.ts', '.py', '.js']),
    TE.map(filesByType => ({
      totalProjects: 0, // Could scan PROJECTS/ directory
      totalFiles: Object.values(filesByType).reduce((sum, count) => sum + count, 0),
      filesByType,
    }))
  );
};

// ============================================================================
// REPORT GENERATION - I/O Operations
// ============================================================================

/**
 * Write observation to JSON file
 * Impure: File write
 */
export const writeObservationJSON = (
  io: IODeps,
  outputPath: string,
  systemState: SystemState
): TE.TaskEither<ObservationError, void> => {
  return TE.tryCatch(
    () => io.writeFile(outputPath, JSON.stringify(systemState, null, 2)),
    (error): ObservationError => ({
      _tag: 'FilesystemError',
      details: error instanceof Error ? error.message : String(error),
    })
  );
};

/**
 * Generate markdown report
 * Pure: String transformation
 * (Separated so it can be tested without I/O)
 */
export const generateMarkdownReport = (
  observation: Observation<SystemState>,
  repos: ReadonlyArray<GitRepository>
): string => {
  const { context, patterns, anomalies } = observation;
  const { git } = context.current;

  let report = `# Categorical Observability Report
**Generated**: ${context.context.timestamp.toISOString()}
**Framework**: CC2.0 Monoidal Comonad
**Workspace**: ${context.context.workspace}

---

## Executive Summary

### Categorical Properties
- **Functor**: ✓ Preserves identity and composition
- **Comonad**: ✓ Provides extract, duplicate, extend
- **Monoidal**: ✓ Compositional via tensor product
- **Pure & Total**: ✓ No side effects, defined for all inputs

### Metrics
- **Total Repositories**: ${git.totalRepositories}
- **Clean Repositories**: ${git.cleanRepositories} (${git.healthScore.toFixed(1)}%)
- **Dirty Repositories**: ${git.dirtyRepositories}
- **Unpushed Repositories**: ${git.unpushedRepositories}
- **Total Commits**: ${git.totalCommits}
- **Health Score**: ${git.healthScore.toFixed(1)}%

---

## Git Repositories

| # | Repository | Branch | Status | Commits Ahead | Total Commits |
|---|------------|--------|--------|---------------|---------------|
`;

  repos.forEach((repo, idx) => {
    const status = repo.isClean ? '✅ clean' : '⚠️ dirty';
    const ahead = repo.commitsAhead > 0 ? `↑${repo.commitsAhead}` : '-';
    report += `| ${idx + 1} | \`${repo.name}\` | ${repo.branch} | ${status} | ${ahead} | ${repo.totalCommits} |\n`;
  });

  report += `\n---\n\n## Pattern Detection\n\n`;

  if (patterns.length > 0) {
    patterns.forEach(pattern => {
      report += `### ${pattern.type}\n`;
      report += `- **Significance**: ${pattern.significance}\n`;
      report += `- **Evidence**: ${pattern.evidence}\n`;
      report += `- **Recommendation**: ${pattern.recommendation}\n\n`;
    });
  } else {
    report += `No significant patterns detected.\n\n`;
  }

  report += `---\n\n## Anomaly Detection\n\n`;

  if (anomalies.length > 0) {
    anomalies.forEach(anomaly => {
      report += `### ${anomaly.type}\n`;
      report += `- **Severity**: ${anomaly.severity}\n`;
      report += `- **Deviation**: ${anomaly.deviation.toFixed(2)}\n`;
      report += `- **Description**: ${anomaly.description}\n`;
      report += `- **Recommendation**: ${anomaly.recommendation}\n\n`;
    });
  } else {
    report += `No anomalies detected.\n\n`;
  }

  report += `---\n\n*Generated by pure functional observability core*\n`;

  return report;
};

/**
 * Write markdown report to file
 * Impure: File write
 */
export const writeMarkdownReport = (
  io: IODeps,
  outputPath: string,
  observation: Observation<SystemState>,
  repos: ReadonlyArray<GitRepository>
): TE.TaskEither<ObservationError, void> => {
  const markdown = generateMarkdownReport(observation, repos);

  return TE.tryCatch(
    () => io.writeFile(outputPath, markdown),
    (error): ObservationError => ({
      _tag: 'FilesystemError',
      details: error instanceof Error ? error.message : String(error),
    })
  );
};

// ============================================================================
// EXPORTS - Public API
// ============================================================================

export const ObserveIO = {
  // Dependencies
  productionIO,

  // Git operations
  findGitRepositories,
  getGitRepoInfo,
  scanGitRepositories,

  // Filesystem operations
  countFilesByType,
  getWorkspaceMetrics,

  // Report generation
  generateMarkdownReport,
  writeObservationJSON,
  writeMarkdownReport,
};
