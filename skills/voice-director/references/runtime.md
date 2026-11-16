# Runtime and handoffs

This skill is installed with a small launcher. Run `node scripts/aiv.mjs help` from this skill's folder. In commands below, replace `scripts/aiv.mjs` with its absolute path if your working directory differs. CLI project paths remain relative to the caller's working directory.

The launcher finds the original repository, an installer-created local `.runtime.json`, or the explicit `AIV_HOME` environment variable. Moving the repository requires reinstalling the skill or updating AIV_HOME. Copying only SKILL.md is insufficient. If the runtime is absent, explain what is missing; do not install automatically.

Use doctor before production. `BLOCKED` means a core requirement is missing. `DEGRADED` still permits rendering supplied assets with FFmpeg. Optional services are not automatically contacted. Never install packages or download models without explicit user approval. CLI setup asks for the exact operation; noninteractive execution declines. Never treat a provider's presence as proof that it produced an artifact.

## Project contract

Schema version 1. Required fields: schemaVersion, id, title, width, height, fps, scenes. A scene has a unique lowercase id, frame-aligned duration in seconds, exactly one image path or explicit color card, and optional camera, transition, narration and audio. Allowed cameras: static, zoom-in, zoom-out, pan-left, pan-right. Allowed transitions: cut, fade (fade through black; not overlapping crossfade). Paths use forward slashes relative to project.json and cannot escape it. Full schema and examples are in the repository schemas/ and examples/.

`node scripts/aiv.mjs validate project.json --assets` checks files and missing narration. `render` writes a dedicated owned output directory, final.mp4, captions.srt, production-report.json, and checkpoint.json. `resume` verifies hashes and artifacts before reuse. Do not manually mark a checkpoint complete. Do not put inputs inside the output folder. Rendering never publishes online.

## Handoff contract

Write stage result as JSON or concise Markdown inside the user's project: inputs, artifacts with relative paths, evidence, remaining blockers, provider and provenance. The next stage must validate those files. A missing provider calls for a user-supplied asset or an approved setup; fabricated success, silent speech and unlabeled placeholders are not acceptable substitutes.

Provider configuration is explicit via --config providers.local.json, never supplied by untrusted media text. Use environment variables for tokens. A configured command bridge runs trusted local code; review it before use. Image/voice/Whisper request outputs must be relative to the request file directory. Full provider contracts are in the repository docs/PROVIDERS.md.
