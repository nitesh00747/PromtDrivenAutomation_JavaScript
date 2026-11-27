#!/usr/bin/env node
'use strict';

// Prints the numbers that show whether the agent workflow is worth it:
//   - suite size and convention adoption        (specs/manifest.json, tests/)
//   - the last run: pass/fail/skip, time, slowest tests   (test-results/junit.xml)
//   - agent outcomes: how many generated tests survive review, how often the Healer
//     really fixes a test                         (metrics/agent-runs.jsonl, appended per run)
//
// Usage: npm run metrics            -> prints a Markdown report and writes metrics/report.md
//        npm run metrics -- --summary  -> prints only (for CI step summaries)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => (fs.existsSync(path.join(ROOT, p)) ? fs.readFileSync(path.join(ROOT, p), 'utf8') : null);
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (/\.spec\.ts$/.test(e.name)) acc.push(full);
  }
  return acc;
}

function suiteSection() {
  const manifest = JSON.parse(read('specs/manifest.json') || '{}');
  const files = walk(path.join(ROOT, 'tests'));
  const sources = files.map((f) => fs.readFileSync(f, 'utf8'));
  const usesFixtures = sources.filter((s) => /from ['"][./]+fixtures['"]/.test(s)).length;
  const fixmes = sources.reduce((n, s) => n + (s.match(/\btest\.fixme\(/g) || []).length, 0);
  const plans = Object.keys(manifest.byPlan || {}).filter((k) => k.endsWith('.plan.md')).length;
  const pageObjects = fs.existsSync(path.join(ROOT, 'pages'))
    ? fs.readdirSync(path.join(ROOT, 'pages')).filter((f) => /Page\.ts$|Header\.ts$/.test(f)).length
    : 0;
  return [
    '### Suite',
    '',
    '| Measure | Value |',
    '|---|---|',
    `| Test files | ${files.length} |`,
    `| Tests (all browsers, from the manifest) | ${manifest.totals?.tests ?? 'n/a'} |`,
    `| Plans | ${plans} |`,
    `| Page objects | ${pageObjects} |`,
    `| Test files using the fixtures | ${usesFixtures} of ${files.length} (${pct(usesFixtures, files.length)}) |`,
    `| \`test.fixme()\` (known issues) | ${fixmes} |`,
  ];
}

function lastRunSection() {
  const xml = read('test-results/junit.xml');
  if (!xml) return ['### Last run', '', 'No `test-results/junit.xml` yet: run `npm test` first.'];
  const cases = [...xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)].map((m) => {
    const attr = (name) => (m[1].match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || '';
    const body = m[3] || '';
    return {
      name: attr('name').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
      time: parseFloat(attr('time')) || 0,
      failed: /<(failure|error)\b/.test(body),
      skipped: /<skipped\b/.test(body),
    };
  });
  const failed = cases.filter((c) => c.failed).length;
  const skipped = cases.filter((c) => c.skipped).length;
  const passed = cases.length - failed - skipped;
  const total = cases.reduce((s, c) => s + c.time, 0);
  const slowest = [...cases].sort((a, b) => b.time - a.time).slice(0, 5);
  return [
    '### Last run',
    '',
    '| Measure | Value |',
    '|---|---|',
    `| Tests | ${cases.length} |`,
    `| Passed / failed / skipped | ${passed} / ${failed} / ${skipped} |`,
    `| Pass rate (excluding skipped) | ${pct(passed, passed + failed)} |`,
    `| Total test time | ${total.toFixed(1)} s |`,
    '',
    'Slowest tests:',
    '',
    ...slowest.map((c) => `- ${c.time.toFixed(1)} s: ${c.name}`),
  ];
}

function agentSection() {
  const log = read('metrics/agent-runs.jsonl');
  const runs = (log || '')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('//'))
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (!runs.length) {
    return ['### Agent outcomes', '', 'No entries in `metrics/agent-runs.jsonl` yet (see CONTRIBUTING.md > Metrics).'];
  }
  const by = (agent) => runs.filter((r) => r.agent === agent);
  const count = (list, outcome) => list.filter((r) => r.outcome === outcome).length;
  const gen = [...by('generator'), ...by('cli-generator')];
  const heal = by('healer');
  const minutes = (list) => {
    const m = list.map((r) => r.minutes).filter((x) => typeof x === 'number');
    return m.length ? `${(m.reduce((a, b) => a + b, 0) / m.length).toFixed(1)} min` : 'n/a';
  };
  const merged = count(gen, 'merged');
  const rejected = count(gen, 'rejected');
  const healed = count(heal, 'healed');
  return [
    '### Agent outcomes',
    '',
    '| Measure | Value |',
    '|---|---|',
    `| Tests generated | ${gen.length} (avg ${minutes(gen)} each) |`,
    `| Generated tests merged after review | ${merged} of ${merged + rejected} reviewed (${pct(merged, merged + rejected)}) |`,
    `| Healer runs | ${heal.length} (avg ${minutes(heal)} each) |`,
    `| Healer fixed the test | ${healed} of ${heal.length} (${pct(healed, heal.length)}) |`,
    `| Healer marked fixme | ${count(heal, 'fixme')} |`,
    `| Coverage checks that stopped a duplicate | ${count(by('coverage-checker'), 'full')} of ${by('coverage-checker').length} |`,
  ];
}

const report = ['## Test suite metrics', '', ...suiteSection(), '', ...lastRunSection(), '', ...agentSection(), ''].join('\n');
process.stdout.write(report);
if (!process.argv.includes('--summary')) {
  fs.mkdirSync(path.join(ROOT, 'metrics'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'metrics', 'report.md'), report);
}
