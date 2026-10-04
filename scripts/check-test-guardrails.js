#!/usr/bin/env node
'use strict';

// CI guardrail, not a style lint. Fails the build when either is true:
//
//   1. A committed test uses test.fixme()/test.skip() WITHOUT an "acknowledged-fixme:" comment
//      directly above it. fixme()/skip() is the Healer's escape hatch for "couldn't confidently
//      fix this," and by default that should force a human to look, not merge silently. A human
//      who has actually looked and decided the test is permanently, intentionally broken (e.g. a
//      real, seeded bug in the app under test with nothing to fix) can mark that explicitly:
//
//        // acknowledged-fixme: <why this is permanent/expected, not a thing to fix later>
//        test.fixme('...', async ({ page }) => { ... });
//
//      That marker is a deliberate, reviewed decision — not a way to bulk-silence this check.
//   2. specs/manifest.json doesn't match what generate-test-index.js would produce right now —
//      i.e. someone added/changed tests without regenerating the index, so the manifest can't be
//      trusted for the "does this already exist?" check the Planner relies on.
//
// Both exist because agent-authored/healed output can look correct without having been fully
// verified (see README's "Avoiding duplicate coverage" section) — this is the mechanical half of
// the review gate; the human-review half still has to happen in the PR.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const MANIFEST_PATH = path.join(ROOT, 'specs', 'manifest.json');

function walkSpecFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSpecFiles(full, acc);
    else if (entry.isFile() && /\.spec\.ts$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const ACK_MARKER = /acknowledged-fixme:/;

function isAcknowledged(lines, matchIndex) {
  for (let i = matchIndex - 1; i >= 0; i--) {
    const line = lines[i];
    if (!/^\s*\/\//.test(line)) break; // stop at the first non-comment line above
    if (ACK_MARKER.test(line)) return true;
  }
  return false;
}

function checkFixmeAndSkip() {
  const offenders = [];
  for (const file of walkSpecFiles(TESTS_DIR)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (/\btest\.fixme\s*\(/.test(line) || /\btest\.skip\s*\(/.test(line)) {
        if (isAcknowledged(lines, i)) return;
        offenders.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    });
  }
  return offenders;
}

function checkManifestFresh() {
  const before = fs.existsSync(MANIFEST_PATH) ? fs.readFileSync(MANIFEST_PATH, 'utf8') : null;
  execSync('node scripts/generate-test-index.js', { cwd: ROOT, stdio: 'pipe' });
  const after = fs.readFileSync(MANIFEST_PATH, 'utf8');
  // Restore the original file so running this check locally doesn't leave an uncommitted
  // regeneration behind as a side effect — the point is to *detect* staleness, not fix it.
  if (before !== null) fs.writeFileSync(MANIFEST_PATH, before, 'utf8');
  return before !== after;
}

function main() {
  let failed = false;

  const fixmeOffenders = checkFixmeAndSkip();
  if (fixmeOffenders.length > 0) {
    failed = true;
    console.error('\nFAIL: unacknowledged test.fixme()/test.skip() found in tests/.');
    console.error('These need explicit human review before merging - either fix the test, or if');
    console.error('it is a genuine, permanent known issue, add an "// acknowledged-fixme: <why>"');
    console.error('comment directly above it:\n');
    for (const line of fixmeOffenders) console.error(`  ${line}`);
  } else {
    console.log('OK: no unacknowledged test.fixme()/test.skip() in tests/.');
  }

  const manifestStale = checkManifestFresh();
  if (manifestStale) {
    failed = true;
    console.error('\nFAIL: specs/manifest.json is stale.');
    console.error('Run `npm run test:index` and commit the result.');
  } else {
    console.log('OK: specs/manifest.json is up to date.');
  }

  if (failed) {
    console.error('\nGuardrail check failed.\n');
    process.exit(1);
  }
  console.log('\nAll guardrail checks passed.');
}

main();
