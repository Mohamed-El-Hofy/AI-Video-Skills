# AI Video Skills

Nine reusable Agent Skills and a portable video production engine for Claude Code, Codex and Google Antigravity. Write a short brief; the agent coordinates script, images, narration, camera motion, editing, QA and local export. [Arabic guide](README.ar.md).

Version **0.1.0**. Node.js 22+ and an existing FFmpeg/FFprobe installation are the baseline. The core uses Node built-ins only: no npm install is required. AI services, models and browser binaries are not bundled. New code and skills are Apache-2.0; see [third-party boundaries](THIRD_PARTY.md).

## Quick start

From the repository directory:

```sh
node cli/aiv.mjs doctor
node cli/aiv.mjs render examples/demo/project.json --out work/demo
node cli/aiv.mjs inspect work/demo/final.mp4
node cli/aiv.mjs resume examples/demo/project.json --out work/demo
```

The demo intentionally uses colored cards and silence. It verifies the runtime, not image generation or speech synthesis. Arabic caption burn requires a FFmpeg build with libass and an Arabic-capable installed font. For a deterministic motion/audio test, run `node scripts/smoke.mjs`; its audio is test tones.

If doctor reports BLOCKED, review the missing tools. `node cli/aiv.mjs setup ffmpeg` displays the exact package-manager operation and asks for `INSTALL`; piped/noninteractive invocation declines. Debian/Ubuntu, Homebrew macOS and winget Windows plans are provided. Other distributions need manual installation. It never installs optional providers, models or browsers implicitly.

## Install the skills explicitly

```sh
node scripts/install-skills.mjs --agent codex --project /path/to/video-project
node scripts/install-skills.mjs --agent claude --project /path/to/video-project
node scripts/install-skills.mjs --agent antigravity --project /path/to/video-project
```

For an explicit permanent personal installation, replace `--project ...` with `--user`. Project folders are `.agents/skills` for current Codex/Antigravity and `.claude/skills` for Claude Code. Current Antigravity personal scope uses `.gemini/config/skills`; legacy `.agent/skills` is documented separately. Installing Codex and Antigravity into the same project shares `.agents/skills`: run only one installation, since the installer refuses to overwrite existing skills.

The installer copies complete folders including references/launchers and creates a local ignored runtime locator. Keep this repository at its installed location, reinstall after moving it, or set `AIV_HOME`. No skills or global settings are installed just by unpacking the repository. Refresh/restart the host and verify its discovered inventory. [Compatibility details and evidence](docs/COMPATIBILITY.md).

Example request: “Create a five-minute Egyptian Arabic documentary about the deep ocean, landscape 1080p, with narration and subtitles. Check available tools first.” Discovery activates the relevant skills where supported; absent assets/providers are reported rather than faked.

## Skills

| Skill | Responsibility |
| --- | --- |
| ai-video-producer | Orchestrate full production and handoffs |
| environment-doctor | Detect requirements and request installation approval |
| script-writer | Write sourced narration and scene plan |
| image-director | Art direction, real image artifacts and provenance |
| voice-director | Narration, measured timing and corrected transcripts |
| camera-animator | Bounded pans/zooms and framing review |
| video-editor | Timeline, music ducking, captions and resumable render |
| quality-inspector | Technical, visual, listening and temporal QA |
| export-manager | Verified local delivery and authorized packaging |

## Production workflow

1. `init project.json`, replace demo cards with authorized images; the agent writes narration and prompts.
2. Supply audio manually or configure optional providers using a private `providers.local.json`. `prepare project.json --config providers.local.json` generates missing image/narration artifacts when configured.
3. Correct scene durations using the real recordings; engine refuses speech longer than its scene. Add manually reviewed subtitle cues, or use the local Whisper adapter and review its cue JSON.
4. `validate project.json --assets`, then `render project.json --out work/my-video`. FFmpeg is default; select `--renderer remotion --config ...` for the optional Remotion adapter.
5. Inspect output, decode it, review motion/captions and listen. `resume` uses the same output directory and verifies hashes before reusing a scene.

Outputs: final.mp4, captions.srt, captions.ass, checkpoint.json, production-report.json and reusable per-scene media. The final file uses H.264/AAC. `captionMode` is sidecar (default), burn or none. Arabic strings stay in logical Unicode order; libass handles shaping. Cut and fade through black are supported; overlapping crossfades/parallax are not implemented in v0.1.

See [project format](docs/PROJECT_FORMAT.md), [providers](docs/PROVIDERS.md), [doctor matrix](docs/DEPENDENCY_MATRIX.md), [architecture](docs/ARCHITECTURE.md), [original source/video audit](docs/SOURCE_AUDIT.md) and [handoff](HANDOFF.md).

## Verification and limits

```sh
node --test
node scripts/check-skills.mjs
node scripts/smoke.mjs
```

Windows execution evidence is recorded in [VERIFICATION.md](docs/VERIFICATION.md). Linux/macOS Node 22/24 CI is prepared but is not evidence of execution until those jobs run. Agent folder installation/launcher tests are distinct from native discovery tests inside each actual host.

The scene cache supports bounded resumable production, but a complete 5–20-minute production benchmark is not yet recorded. TTS/image/transcription quality depends on actual configured services/models; mock tests only verify contracts. Long projects should begin with a representative preview and measured estimates. No dependency or publication action is authorized merely by a video request.

There is no GitHub remote or automatic release. [Release checklist](docs/RELEASE_CHECKLIST.md) requires explicit publication approval.
