# Verification record — 2026-11-16

## Executed locally

Environment: Windows, Node 24.22.1, FFmpeg/FFprobe 9.0.2 full build with libx264/AAC/libass. The required runtime floor is Node22; its local execution is not implied by running Node24.

| Check | Observed result |
| --- | --- |
| `node --test` | 35 tests passed, 0 failed, 0 skipped after final regression additions |
| `node scripts/check-skills.mjs` | All 9 skill frontmatters, bundled links and operational guidance passed |
| JSON Schema draft2020-12 + demo | Checked using already installed Python jsonschema; all distribution JSON parsed |
| `node cli/aiv.mjs doctor` without local providers | DEGRADED; FFmpeg/FFprobe and baseline capabilities available; optional providers unconfigured |
| Explicit installer tests | Complete folders, runtime locators and launchers worked for Codex/Claude/Antigravity project layouts; collisions refused |
| Installation gate | Denied/noninteractive operations execute nothing; approved fixed plan dispatch tested with a stub, no package actually installed |
| FFmpeg synthetic smoke | 4.010667s, 640x360, 24 FPS, H.264/AAC, Arabic burn, image motion, per-scene tone/music mix; full decode passed |
| FFmpeg smoke resume | 0 scenes rendered, 2 reused; final validation passed |
| Real installed Remotion4.0.541 | Existing headless Chrome, original template, PNG motion/audio, Arabic burn; 3.994s, 640x360, 24 FPS H.264/AAC |
| Remotion resume | Both scenes reused; output fully decoded |
| Failure/recovery | Simulated exception after first saved scene retained checkpoint, marked FAILED, released lock; next run reused scene. Changed image content invalidated one scene; corrupted scene rebuilt; occupied lock refused |
| Five-minute synthetic timeline | Ten 30s color-card scenes, 160x90/15 FPS, silent audio; exported 300.021354s H.264/AAC, full decode passed; resume reused all ten scenes |
| Original studio preservation | 84 files outside dependencies/build/renders/logs compared; zero changes observed after engine/provider tests |

The short motion smoke uses an original deterministic gradient plus sine tones. The five-minute fixture is low-resolution synthetic timing/resumability evidence, not an AI documentary quality/performance benchmark. No image/speech generation is claimed for either fixture.

## Test scope

Core tests cover strict fields, frame alignment, unique ids, cue ranges, input confinement and symlink escape, atomic state and content hashes. Rendering checks real FFmpeg media, Arabic/spaces/apostrophes in paths, missing or oversized narration, output ownership, locks, checkpoint failure/reuse, asset invalidation and corrupt artifacts. Caption tests verify explicit family selection and reject ASS delimiter injection.

Provider tests use a loopback HTTP mock for VoiceTuT jobs and A1111 responses, plus a real subprocess bridge. Returned media is real decodable test WAV/PNG; malformed WAV/truncated PNG are rejected. This proves protocol, validation and failure behavior, not a live model's quality. Remotion bridge/template/package/configured local command changes affect cache fingerprints; mutable external dependencies require cacheRevision.

Two local HTTP tests failed EACCES in the restricted execution environment during review; the full authorized ordinary-local run passed all tests. No test was skipped or rewritten to hide that restriction.

Two independent agent reviews were performed: nine instruction-use scenarios and read-only runtime review. Findings were corrected with regressions: inspect failure exit code, provider configured states, Concat relative-path basis, custom font family, bridge/template cache invalidation and malformed provider media acceptance. Simulated instruction review does not establish live host discovery.

## Uploaded source video

Independently probed 30.000s, 1080x1920/30 FPS H.264/AAC, 20,706,020 bytes. Full decode/filter scan completed without errors or qualifying black/freeze/silence events under the documented thresholds. Six stills were inspected. Mean audio volume -20.1dB, max -1.5dB; not LUFS. See SOURCE_AUDIT.md for thresholds, original report claims and review limits.

## Unperformed / not claimed

- Linux/macOS execution and Node22 local execution. The six-job OS/Node CI matrix is prepared locally, never run on GitHub.
- Actual native discovery/invocation inside all three agent products. Folder/launcher tests passed; no global skill installation was performed.
- Live VoiceTuT synthesis/listening, model-backed image generation, real Whisper inference/model loading, native Concat import.
- Complete subjective listening, pronunciation, word-level sync and temporal-motion review of uploaded source video.
- Real 5–20-minute AI documentary benchmark, high-resolution long-form performance guarantee or quality guarantee.
- Dependency/model/browser installation or paid service use during the local implementation. The later public GitHub upload was explicitly authorized by the user; see the publication note below.

## Delivery

The independent repository was copied to `D:/AI-Video-Skills` and initialized as a separate local Git repository. Tests were re-executed from that destination: 35 passed, 0 failed, 0 skipped; all nine skill checks and the synthetic motion/audio/caption smoke also passed there. No GitHub remote was configured.

The source-only archive excludes local configs, tokens, runtime locators, private source media, node_modules, generated work and models. Local archive integrity is verified as part of delivery. See HANDOFF.md for continuation; remote release remains subject to explicit approval.


## Subsequent authorized public upload
On 2026-11-16 the user explicitly approved Public visibility and supplied the user-created empty repository https://github.com/Mohamed-El-Hofy/AI-Video-Skills. The intended upstream is origin/main. The pre-upload privacy/artifact check passed for all 74 tracked files and both prior local commits. Earlier no-remote statements describe the initial local-only delivery. Remote HEAD, file presence, visibility and CI results must be verified separately after pushing.
