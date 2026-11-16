# AI Video Skills agent guidance

Read HANDOFF.md first, then docs/ARCHITECTURE.md and docs/VERIFICATION.md. Preserve source projects and user assets. Do not install dependencies/models/browser or publish online without explicit user approval. Use Node 22+ built-ins for core changes. Run node --test, node scripts/check-skills.mjs and node scripts/smoke.mjs for relevant engine changes. Record Windows/Linux/macOS and live-provider evidence accurately; mocks and prepared CI are not live verification.

The nine reusable production skills are under skills/. Use their bundled launchers; never hardcode a developer's machine paths. Update HANDOFF.md before context limits with files changed, commands/results, failures and next actions. New functionality outside the approved portable v1 contract should update the schema, documentation and tests together.
