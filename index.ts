#!/usr/bin/env ts-node
/**
 * Categorical Observability - Main Entry Point
 *
 * Architecture Pattern: Functional Core, Imperative Shell
 *
 * Pure Core (observe-core.ts):
 * - All business logic
 * - No side effects
 * - Fully testable
 * - Category theory foundations
 *
 * Impure Shell (observe-io.ts):
 * - All I/O operations
 * - Side effect boundary
 * - Dependency injectable
 *
 * This File (index.ts):
 * - Composes core + shell
 * - Executes the program
 * - CLI interface
 */

import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as path from 'path';

import { Observe, ObservationConfig } from './observe-core';
import { ObserveIO, productionIO } from './observe-io';

// ============================================================================
// CONFIGURATION - Injected from CLI or Environment
// ============================================================================

/**
 * Parse CLI arguments to configuration
 * Pure: String transformation only
 */
const parseConfig = (args: string[]): ObservationConfig => {
  const workspaceRoot = args[2] || process.cwd();
  const cc2Root = args[3] ? { _tag: 'Some' as const, value: args[3] } : { _tag: 'None' as const };
  const linearTeam = args[4] ? { _tag: 'Some' as const, value: args[4] } : { _tag: 'None' as const };

  return {
    workspaceRoot,
    cc2Root,
    linearTeam,
    maxDepth: 4,
    excludePatterns: ['node_modules', '.git', '.venv'],
  };
};

/**
 * Generate output paths from config
 * Pure: Path calculation
 */
const getOutputPaths = (config: ObservationConfig) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logsDir = path.join(config.workspaceRoot, 'logs');

  return {
    logsDir,
    jsonPath: path.join(logsDir, `observation-${timestamp}.json`),
    mdPath: path.join(logsDir, `observation-${timestamp}.md`),
  };
};

// ============================================================================
// MAIN PROGRAM - Composition of Pure + Impure
// ============================================================================

/**
 * Main observation pipeline
 * Composes: I/O -> Pure Logic -> I/O
 */
const main = (
  config: ObservationConfig,
  io = productionIO
): TE.TaskEither<Error, void> => {
  const outputs = getOutputPaths(config);

  return pipe(
    // Step 1: Scan git repositories (Impure I/O)
    ObserveIO.scanGitRepositories(io, config),

    // Step 2: Get workspace metrics (Impure I/O)
    TE.bindTo('repos'),
    TE.bind('metrics', () => ObserveIO.getWorkspaceMetrics(io, config)),

    // Step 3: Observe (Pure Logic)
    TE.chainW(({ repos, metrics }) =>
      pipe(
        Observe.observe(config, repos, metrics),
        TE.fromEither,
        TE.map(observation => ({ observation, repos }))
      )
    ),

    // Step 4: Write reports (Impure I/O)
    TE.chainFirst(({ observation }) =>
      ObserveIO.writeObservationJSON(io, outputs.jsonPath, observation.focus)
    ),

    TE.chainFirst(({ observation, repos }) =>
      ObserveIO.writeMarkdownReport(io, outputs.mdPath, observation, repos)
    ),

    // Step 5: Display results (Impure I/O)
    TE.map(({ observation }) => {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║  CATEGORICAL OBSERVABILITY - Pure Functional Core      ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');

      console.log('📊 Observation Complete\n');

      const { git } = observation.context.current;
      console.log('Git Repositories:');
      console.log(`  Total: ${git.totalRepositories}`);
      console.log(`  Clean: ${git.cleanRepositories} (${git.healthScore.toFixed(1)}%)`);
      console.log(`  Dirty: ${git.dirtyRepositories}`);
      console.log(`  Unpushed: ${git.unpushedRepositories}`);
      console.log(`  Total Commits: ${git.totalCommits}\n`);

      console.log('Patterns Detected:');
      if (observation.patterns.length > 0) {
        observation.patterns.forEach(pattern => {
          console.log(`  ⚠  ${pattern.type}: ${pattern.evidence}`);
          console.log(`     Recommendation: ${pattern.recommendation}`);
        });
      } else {
        console.log('  ✓ No significant patterns detected');
      }

      console.log('\nAnomalies Detected:');
      if (observation.anomalies.length > 0) {
        observation.anomalies.forEach(anomaly => {
          console.log(`  ✗ ${anomaly.type} (${anomaly.severity}): ${anomaly.description}`);
          console.log(`     Recommendation: ${anomaly.recommendation}`);
        });
      } else {
        console.log('  ✓ No anomalies detected');
      }

      console.log('\n📄 Reports Generated:');
      console.log(`  JSON: ${outputs.jsonPath}`);
      console.log(`  Markdown: ${outputs.mdPath}\n`);

      console.log('Comonad Operations Demonstrated:');
      const healthFocus = Observe.extract(observation);
      console.log(`  extract(): Health Score = ${healthFocus.current.git.healthScore.toFixed(1)}%`);

      const trend = Observe.calculateTrend(observation);
      console.log(`  extend(calculateTrend): ${trend}`);

      const velocity = Observe.calculateVelocity(observation);
      console.log(`  extend(calculateVelocity): ${velocity} commits\n`);

      console.log('✅ Pure functional observation complete!\n');
    }),

    // Convert ObservationError to Error for consistent type
    TE.mapLeft((obsError): Error => {
      return new Error(`Observation failed: ${obsError._tag} - ${
        'reason' in obsError ? obsError.reason :
        'details' in obsError ? obsError.details : 'Unknown error'
      }`);
    })
  );
};

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const config = parseConfig(process.argv);

  console.log('Starting categorical observation...');
  console.log(`Workspace: ${config.workspaceRoot}\n`);

  main(config)()
    .then(result =>
      pipe(
        result,
        E.fold(
          error => {
            console.error('❌ Observation failed:');
            console.error(error.message);
            process.exit(1);
          },
          () => {
            process.exit(0);
          }
        )
      )
    );
}

// ============================================================================
// EXPORTS - For Testing and Programmatic Use
// ============================================================================

export { main, parseConfig, getOutputPaths };
