# Shopping list API friction log

This is the durable feedback loop for the shopping list API. It records
observed difficulty from application code, tests, migrations, and agent
evaluations so later API and documentation work is based on evidence.

Last updated: 2026-08-24

## Triage rule

| Owner         | Use when                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| API           | Correct code is repeatedly verbose, error-prone, ambiguous, or untypable |
| Documentation | The API is sound but the correct pattern is hard to discover             |
| Skill         | The difficulty is agent guidance or multi-step authoring                 |
| Application   | The behavior is specific to the shopping list application                |
| Tooling       | The issue is imports, bundle inspection, testing, or generation          |

Do not hide API problems in a skill. Resolve each problem at the narrowest
correct ownership boundary.

## Entry format

Each entry records:

- status: `open`, `monitoring`, or `resolved`;
- owner and severity;
- the concrete task where it appeared;
- expected and actual authoring experience;
- decision and verification;
- follow-up if the evidence is not yet sufficient.

## Index

| ID  | Finding | Owner | Status |
| --- | ------- | ----- | ------ |
|     |         |       |        |
