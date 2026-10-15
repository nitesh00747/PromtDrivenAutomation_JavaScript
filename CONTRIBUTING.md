# Contributing / orchestration guardrails

How to invoke the agents safely at scale, and what must be true before agent-generated output
merges. Both came out of a real problem hit in this repo, not theory.

## Generator concurrency: batch, don't fan out

**The problem:** the `playwright-test` MCP server (`.mcp.json`) holds one shared browser session.
Running 7 `playwright-test-generator` agents in parallel caused real contention — agents got
`Must setup test before interacting with the page` errors and had their `generator_read_log` state
overwritten by other agents' runs. Several fell back to writing tests from the plan without live
verification. All turned out fine on this app, but that was luck, not a guarantee.

**The rule:** generate multiple new tests **serially, or in batches of at most 2–3 concurrent
agents.** Slower wall-clock time, but generation is a background task, not something anyone is
waiting on interactively — reliable and slow beats fast and silently degraded.

If generation throughput becomes a real bottleneck, the fix is isolated MCP server instances per
concurrent agent, not raising the batch size — infrastructure work, not a default to reach for.

## Before merging agent-generated or agent-healed tests

1. **Everything lands via a PR, never a direct push to `main`/`master`.** A human reviews the diff
   — agents producing plausible-but-unverified code (see above) is exactly what this catches.
2. **CI must pass:**
   - `guardrails` (`npm run guardrails`) — fails on any `test.fixme()`/`test.skip()`, or a stale
     `specs/manifest.json`.
   - `test` — the full suite, run fresh, independent of what the agent itself reported.
3. **Treat any `test.fixme()` from the Healer as a required discussion item**, not something to
   delete or ignore. It means the Healer couldn't confidently fix the test — a human needs to look
   at *why*, not just satisfy the guardrail.
4. **Check `specs/manifest.json` before planning new functionality** (see the README) so new
   scenarios extend an existing plan instead of duplicating coverage.

## What this doesn't cover

Spend/invocation caps on unattended agent runs are an organizational control, not something
expressible in this repo — set that up wherever your Claude Code usage is administered.
