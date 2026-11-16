# AI Video Skills implementation plan

Goal: independently usable, tested video skills and portable production runtime.
Spec: ARCHITECTURE.md and user's approved source-conversation architecture.

## Global constraints
- Node 22+, no mandatory npm dependencies; no automatic downloads, credentials, global modifications or publication.
- Preserve source; use platform-neutral paths and explicit provider configuration.
- Every completion claim requires recorded verification.

## Tasks
- [x] Core: schema, confinement, invalid timeline/cues, project validation, atomic JSON and hashes.
- [x] Doctor/setup: missing/optional states, denied/approved mocked installs, read-only probes and exact confirmation.
- [x] Renderer: real render, audio/captions, resume, simulated failure checkpoints, asset changes and corruption.
- [x] Providers: mock contracts, malformed media and missing tools; six optional interfaces. Actual live coverage is reported separately.
- [x] Skills: individual format/reference checks, scenario evaluation, runtime launchers and explicit project/user installer.
- [x] Distribution: English/Arabic docs, schema/examples, Apache-2.0, provenance/security notes and 3-OS CI.
- [x] Verification: source hash comparison, Windows integration evidence, deployed-target checks and complete handoff; local archive verified at delivery.

## Review focus
- Missing optional tools must not block local-asset FFmpeg rendering.
- Paths with spaces, apostrophes, Arabic names, traversal and symlinks.
- Changed asset contents must invalidate the correct checkpoint; corrupt files must rebuild.
- Denied installation must execute nothing; model downloads remain explicit.
- No mock or platform-targeted check may be reported as live integration or OS verification.
