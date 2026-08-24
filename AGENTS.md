# Repository agent instructions

## Mission

We are building a full-stack Solid 2.0 app for managing and viewing a shopping list. This is our pet project, so we must always be on the frontier: avoid legacy code, backwards compatibility concerns etc. If a plan calls for a fundamentally different architecture, implement it differently — don't rename the existing one and call it new.

## Communication and non-code writing

- Communicate intent precisely and concisely, not throat clearing.
- If question could be answered with one-liner, do so.
- Use ASD-STE100 Simplified Technical English.

## Development guidelines

- Edge cases matter.
- There is an idiomatic way to do it.
- Implement explicit requirements and selected structural decisions as written. Report any material mismatch before a divergent edit. Before handoff, account for every requested behavior and affected domain invariant with implementation or verification evidence.
- If you can't implement what was asked, say so and explain what you don't understand. Never silently substitute an easier alternative.
- If a design or proposal isn't fully clear, ask questions first. Don't start coding until the model is understood.
- Take the time to get it right. A wrong implementation that passes tests is worse than no implementation.
- Take advantage from TypeScript type safety.

### Documenting API friction

- Read [API-FRICTION.md](./API-FRICTION.md) before changing the public API, examples, adapters, or production migrations.
- While using the API, record observed friction in [API-FRICTION.md](./API-FRICTION.md) when work requires an unexpected workaround, assertion, duplicated setup, hidden import, unclear ownership boundary, or repeated correction.
- Log evidence from the actual task. Do not add speculative wishlist items.
- Classify each finding as an API, documentation, skill, application, or tooling concern. Resolve it at the narrowest correct layer.
- Update an existing entry instead of creating duplicates. Include the verification that closes a resolved entry.

### Verification

- Use browser to inspect integrations and end-to-end behavior instead of inventing e2e harnesses or mocking everything.
- Run diagnostics regularly during work: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`.
- In Codex on macOS, run pnpm scripts and commands with escalated sandbox permissions on the first attempt, for example `pnpm dev`

### Commit messages

- Use conventional commits for commit messages.
- Write an imperative subject of at most 50 characters, with a hard cap of 72.
- Use a body only for non-obvious rationale, breaking changes, security fixes, data migrations, or reverts. A body is required for the last four.
- Omit AI attribution and “this commit does X”. Use emoji only when established by project history.

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

This repo uses the default canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo. See `docs/agents/domain.md`.

@RTK.md
