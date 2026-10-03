# Contributing / orchestration guardrails

This file documents two things that aren't application code: how to invoke the agents safely at
scale, and what has to be true before agent-generated output merges. Both came out of hitting a
real problem in practice, not theoretical concerns.

## Generator concurrency: batch, don't fan out

**The problem:** the `playwright-test` MCP server (`.mcp.json`) holds one shared browser session.
Running many `playwright-test-generator` agents at once was tried in this repo (7 in parallel) and
caused real contention — agents got `Must setup test before interacting with the page` errors and
had their `generator_read_log` state overwritten by other agents' runs. Several fell back to
writing tests from the plan without full live verification as a result. All of them turned out
fine on this app, but that was luck, not a guarantee.

**The rule:** when generating multiple new tests for new functionality, invoke the Generator
**serially, or in batches of at most 2–3 concurrent agents.** This is slower wall-clock time, but
generation is a background/batch task, not something anyone is waiting on interactively — reliable
and slow beats fast and silently degraded.

If generation throughput genuinely becomes a bottleneck (e.g. a large weekly batch of new
functionality), the real fix is isolated MCP server instances per concurrent agent rather than
raising the batch size — that's infrastructure work, not something to reach for by default.

## Before merging agent-generated or agent-healed tests

1. **Everything lands via a PR, never a direct push to `main`/`master`.** A human reviews the
   diff before it merges — agents producing plausible-but-unverified code (see above) is exactly
   what this catches.
2. **CI must pass**, specifically:
   - the `guardrails` job (`npm run guardrails`) — fails if any `test.fixme()`/`test.skip()` is
     present, or if `specs/manifest.json` is stale relative to the actual tests.
   - the `test` job — the full suite, run fresh, independent of whatever the agent itself reported.
3. **Treat any `test.fixme()` from the Healer as a required discussion item**, not something to
   quietly delete or ignore. It means the Healer could not confidently fix the test itself — a
   human needs to look at *why*, not just make the guardrail pass.
4. **Check `specs/manifest.json` before planning new functionality** (see the README) so new
   scenarios extend an existing plan instead of silently duplicating coverage.

## What this doesn't cover

Spend/invocation caps on unattended agent runs are an organizational control (budget limits,
usage alerts), not something expressible in this repo — set that up wherever your Claude Code
usage is administered, not here.
