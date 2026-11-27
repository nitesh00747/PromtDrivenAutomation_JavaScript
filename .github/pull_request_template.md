## Summary

<!-- What changed and why. -->

## Review checklist

- [ ] **Agent / lane**: which agent or lane wrote this (Planner+MCP Generator, or the CLI Generator)?
- [ ] **Plan file linked**: the `specs/*.plan.md` this test implements — <!-- link it here -->
- [ ] **Ran locally on all 3 browsers**: `npx playwright test --project=chromium --project=firefox --project=webkit`
- [ ] **Any `test.fixme()` acknowledged**: discussed with a human, not just silenced (see `CONTRIBUTING.md`)
- [ ] **Manifest regenerated**: `npm run test:index` run and `specs/manifest.json` committed
- [ ] **Conventions**: fixtures and page objects used, no hard-coded URLs or credentials (`npm run guardrails`)
- [ ] **Assertions not loosened**: any changed expected value is explained above
- [ ] **Metrics logged**: a line in `metrics/agent-runs.jsonl` for each agent run in this PR
