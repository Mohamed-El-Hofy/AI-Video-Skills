# AI Video Skills — handoff

Status: v0.1.0 implemented and deployed at D:/AI-Video-Skills; destination verification passed 35/35 tests, nine skill checks and synthetic smoke. Final evidence is in docs/VERIFICATION.md. Updated 2026-11-16 (Africa/Cairo). User explicitly requests this continuation record for Antigravity before context limits.

## Binding instructions
- Source `D:/AI-Video-Studio` is read-only. Do not run its prepare/render commands or alter its configuration.
- Deliver independent repository `D:/AI-Video-Skills`. Development staging is this chat's `work/ai-video-skills`; final deployment/archive state is recorded in VERIFICATION.md.
- Exactly nine reusable skills: ai-video-producer, environment-doctor, script-writer, image-director, voice-director, camera-animator, video-editor, quality-inspector, export-manager.
- Cross-platform design; distinguish Windows execution evidence from unexecuted Linux/macOS and agent discovery tests.
- Ask before any dependency/model installation. No GitHub publish/push without explicit approval. No credential or personal media redistribution.
- Keep this handoff current before context limits; user explicitly requests Antigravity continuation without repeating completed work.

## Decisions and evidence
- Approved source conversation: 6afa7680-057c-83e9-9b6f-9ca4f53a0f5f, read through desktop read_thread.
- Source has Node 22+, Remotion 4.0.541, private package, no top-level redistribution license found. New implementation will use original code rather than copying the private engine or assets.
- Source adapters hardcode local Windows paths and VoiceTuT runtime auth. Do not carry those into package.
- New engine: Node.js 22 built-ins, FFmpeg baseline renderer, optional providers. No mandatory npm dependency install.
- Uploaded media probed independently: 30 s, 1080x1920, 30 FPS, H.264/AAC, 20,706,020 bytes. Full decode/filter scan and six stills inspected; listening and full subjective temporal review not performed. See docs/SOURCE_AUDIT.md.
- Uploaded report claims successful 30-second production and estimates longer renders. Treat estimates as estimates, not long-form test evidence.

## Resume instructions
1. Read docs/ARCHITECTURE.md and docs/IMPLEMENTATION_PLAN.md, then tests and current source.
2. Run `node --test` in repository. Run `node cli/aiv.mjs doctor` and the documented smoke render.
3. Update docs/VERIFICATION.md with commands, counts and limitations, never infer unrun success.
4. Finish remaining checklist, copy verified staging to target if not deployed, confirm source hash manifest unchanged.

## Implemented and already observed
- Nine SKILL.md folders with bundled runtime launchers/references; individual format/link checks and independent nine-scenario instruction evaluation passed.
- cli/aiv.mjs: doctor, init, validate, prepare, render/resume/status, inspect, image/voice/transcribe, Concat interchange and approval-gated FFmpeg setup.
- engine/core.mjs: strict schema semantics, realpath-confined assets, atomic JSON, hashes and shell-disabled subprocesses.
- engine/doctor.mjs: CPU/RAM/storage/tool diagnostics, configured-but-unprobed services, fixed OS installation plans; noninteractive/denied installation executes nothing.
- engine/render.mjs: bounded per-scene cache, artifact checksums/probes, output ownership/lock, failure checkpoints, FFmpeg and optional Remotion, music ducking/normalization, SRT/ASS/burn captions, final report.
- engine/adapters/index.mjs: optional A1111, VoiceTuT jobs, offline faster-whisper, Remotion, command bridges and labeled provider-neutral Concat interchange. New image/audio files are probed/decoded before success; malformed new media is removed.
- scripts/remotion-bridge.mjs and original templates/remotion/index.tsx use explicitly existing modules/browser; no implicit browser download. scripts/whisper-bridge.py requires an existing local model and offline mode.
- scripts/install-skills.mjs supports explicit project/user install, complete folders/locators and no overwrites. Current Codex/Antigravity share .agents/skills; Claude uses .claude/skills.
- English/Arabic README, schema/examples, Apache-2.0/NOTICE/third-party boundaries and Windows/Linux/macOS Node22/24 CI are present. No remote publication or global skill installation occurred.
- Actual Windows FFmpeg motion/audio/music/Arabic-burn smoke and Remotion motion/audio/Arabic-burn render passed. Both resumed with two scenes reused. Fixtures are gradients and tones, not AI imagery/speech.
- Tests cover changed image content, corruption, missing narration, unowned output, locks, simulated failure-after-checkpoint, denied/approved mocked installation, provider protocol and malformed media. Final test counts belong in VERIFICATION.md.
- Fresh reviewer findings corrected: inspect failure exit, provider configuration states, Concat path basis, explicit fontFamily, renderer/bridge/package cache fingerprint and malformed media validation.
- Source preservation baseline: 84 non-dependency/build/render/log files; comparison after Remotion execution found zero changes. Final confirmation belongs in VERIFICATION.md.

## Remaining external verification / honest limits
1. Linux/macOS CI is configured, not run remotely. Do not claim a platform pass from workflow existence.
2. Native discovery inside actual Codex, Claude Code and Antigravity hosts has not been exercised. Folder/launcher tests passed; no global skills were installed during this build.
3. Real VoiceTuT speech, model-backed image generation, live Whisper inference and native Concat import are not claimed. Interfaces/mocks/failure handling are tested; configure user-approved providers or use supplied assets.
4. Concat output is interchange, not a native project. Keep it beside project.json and use the host's actual MCP schema for an authorized native import.
5. A real 5–20-minute AI documentary benchmark is unperformed. A synthetic five-minute low-resolution timeline test is separate evidence if recorded in VERIFICATION.md.
6. Full listening, pronunciation, word-sync and subjective motion review of uploaded video remain unperformed.
7. Supported motion is bounded zoom/pan; transitions are cut/fade through black. True parallax, arbitrary 3D and overlapping crossfade are not implemented. Agent skills direct the host's script/research work; there is no bundled writing model.
8. Bump provider config.cacheRevision for external state/dependencies not captured by local bridge/template/package hashes. For a custom font, use font plus its actual internal fontFamily.

## Continuation procedure
Read this file, docs/ARCHITECTURE.md, docs/VERIFICATION.md and git status before editing. Preserve user changes. Run node --test, node scripts/check-skills.mjs and node scripts/smoke.mjs. Local HTTP mock tests may fail EACCES in a restricted environment; use an authorized ordinary local context rather than hiding those tests. Run doctor: DEGRADED is expected without optional configuration and permits supplied-asset FFmpeg production.

For live agent checks, explicitly install only in a selected scope, refresh the host inventory and record actual versions/results. The installer refuses collisions; do not overwrite existing skills blindly. Keep this repository available to locators, or set AIV_HOME after moving it. Before live provider work, inspect explicit config and existing tools; ask only for installations actually needed and never read unrelated token files.

For interrupted production, retain its output directory and verified checkpoints; check that the process is gone before removing a stale render.lock. Do not manually mark state COMPLETE. Keep this handoff and verification report current before context limits. Do not ask the user to repeat approved architecture decisions. No GitHub remote/push/release without explicit permission.

## README refresh — 2026-11-16
English and Arabic READMEs were redesigned with three example briefs and expected deliveries, an actual synthetic smoke-test screenshot, workflow diagram, CLI walkthrough, output tree, integration matrix, verification boundaries and license at the end. Screenshot is an original deterministic test fixture, not source-studio imagery. Documentation-only change; no engine, provider configuration or source-studio files changed. Relative links, image references and Markdown fences were checked; existing runtime verification remains recorded separately. Release archive updated locally; no GitHub publication.


## Public GitHub publication — 2026-11-16
The user explicitly changed the visibility decision to Public, created the empty upstream and supplied https://github.com/Mohamed-El-Hofy/AI-Video-Skills. This upload is authorized; do not revert it to private. Local publication preflight inspected all 74 tracked files and both existing commits for excluded private artifacts and selected credential patterns, with no matches. This is a bounded scan, not a universal secret guarantee. Only tracked project files are uploaded; local provider configs, models and working media remain excluded. Record the actual remote verification and CI result separately; prior statements about no remote describe the pre-publication state.


## macOS CI diagnosis and correction — 2026-11-16
Initial public CI run 43807884164 passed Windows/Linux Node22/24 but both macOS jobs failed smoke with `No such filter: subtitles`; unit tests already passed there. Cause: Homebrew standard ffmpeg lacked libass/subtitles. Fix selects official ffmpeg-full and its keg-only bin in GitHub Actions PATH, adds a CI capability gate and early caption requirement error, and corrects the approved macOS setup plan. Added regression checks for formula/PATH guidance and burnt-vs-sidecar behavior. No local dependency was installed. Re-run and record actual final matrix outcome; do not infer success before jobs finish.
