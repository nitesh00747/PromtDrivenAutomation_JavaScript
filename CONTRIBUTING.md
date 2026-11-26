# Contributing / orchestration guardrails

How to invoke the agents safely at scale, and what must be true before agent-generated output
merges. Both came out of a real problem hit in this repo, not theory.

## Plan-time workflow: coverage check → plan → human approval

**This is an orchestration policy, not something any one agent enforces.** Subagents run to
completion and report back — they can't pause mid-run for human input — so the steps below are the
top-level assistant's responsibility in every session, not a mechanism baked into the agents
themselves.

1. **Coverage check first.** Before planning anything new, run the `playwright-coverage-checker`
   agent on the user's plain-English ask. It reads `specs/manifest.json` and `specs/*.plan.md` and
   reports one of three verdicts:
   - `COVERAGE: FULL` — tell the user which existing test (`EXISTING_TEST`) already covers this.
     Stop. Don't plan or generate anything.
   - `COVERAGE: PARTIAL` — tell the user which existing scenario is related (`EXISTING_SCENARIO` in
     `EXISTING_PLAN`) and ask them to choose: extend that scenario, or write a new one. Don't
     decide this for them.
   - `COVERAGE: NONE` — proceed to step 2.
2. **Planner writes the plan.** Hand the ask off to `playwright-test-planner` as usual. It explores
   the app and calls `planner_save_plan`, which just mechanically writes `specs/*.plan.md` — note
   that neither `planner_save_plan` nor the (unused-here) `planner_submit_plan` tool has any
   approval semantics built in. Nothing stops a plan from flowing straight into test generation
   unless the orchestrating session stops it.
3. **Stop and get explicit human approval of the plan.** Always present the new or changed
   scenario(s) to the user and wait for an explicit go-ahead before invoking the Generator or
   `playwright-cli-generator`. Never generate a test against a plan the user hasn't approved in
   this session — a saved plan file is not the same thing as an approved plan.
4. **Generate, run, heal as usual** once approved — see the concurrency and merge-checklist
   sections below.

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
