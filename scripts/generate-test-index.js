#!/usr/bin/env node
'use strict';

// Regenerates specs/manifest.json from the actual test files (via `playwright test --list`)
// plus each file's `// spec:` / `// seed:` header comment. Nothing here is hand-maintained -
// re-run this (npm run test:index) any time tests/specs change, and before asking the
// playwright-test-planner to plan new functionality, so the manifest reflects what already
// exists instead of relying on anyone's memory of prior sessions.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const OUTPUT_PATH = path.join(ROOT, 'specs', 'manifest.json');

function listTests() {
  const raw = execSync('npx playwright test --list --reporter=json', {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(raw);
}

function readHeader(relFile) {
  const fullPath = path.join(TESTS_DIR, relFile);
  const firstLines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).slice(0, 5);

  let specPlan = null;
  let seed = null;
  for (const line of firstLines) {
    const specMatch = line.match(/^\/\/\s*spec:\s*(.+)$/);
    const seedMatch = line.match(/^\/\/\s*seed:\s*(.+)$/);
    if (specMatch) specPlan = specMatch[1].trim();
    if (seedMatch) seed = seedMatch[1].trim();
  }
  return { specPlan, seed };
}

function collectTestTitles(suite, acc) {
  for (const spec of suite.specs || []) {
    acc.push(spec.title);
  }
  for (const nested of suite.suites || []) {
    collectTestTitles(nested, acc);
  }
}

function buildFileEntry(fileSuite) {
  const relFile = fileSuite.file.replace(/\\/g, '/');
  const { specPlan, seed } = readHeader(relFile);

  const suites = (fileSuite.suites || []).map((describeSuite) => {
    const tests = [];
    collectTestTitles(describeSuite, tests);
    return { suite: describeSuite.title, tests, count: tests.length };
  });

  return {
    file: `tests/${relFile}`,
    specPlan,
    seed,
    suites,
    count: suites.reduce((sum, s) => sum + s.count, 0),
  };
}

function main() {
  const report = listTests();
  const files = (report.suites || []).map(buildFileEntry).sort((a, b) => a.file.localeCompare(b.file));

  const byPlan = {};
  for (const entry of files) {
    const key = entry.specPlan || '(no spec header)';
    (byPlan[key] = byPlan[key] || []).push(entry.file);
  }

  const totals = {
    files: files.length,
    tests: files.reduce((sum, e) => sum + e.count, 0),
    plans: Object.keys(byPlan).length,
  };

  // No generatedAt/timestamp field on purpose: this file should only diff when test
  // content actually changes, not on every regeneration.
  const manifest = { totals, byPlan, files };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`  ${totals.files} files, ${totals.tests} tests, ${totals.plans} plan(s)`);

  const missingHeader = files.filter((f) => !f.specPlan);
  if (missingHeader.length > 0) {
    console.warn(`  Warning: ${missingHeader.length} file(s) have no "// spec:" header:`);
    for (const f of missingHeader) console.warn(`    - ${f.file}`);
  }
}

main();
