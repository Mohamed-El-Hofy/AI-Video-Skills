---
name: quality-inspector
description: Use when auditing a generated video, checking Arabic captions, diagnosing black frames or audio problems, or assessing production readiness.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Quality Inspector

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Read the brief, actual media and production report; treat prior success reports as claims to verify. Run `node scripts/aiv.mjs inspect final.mp4` and compare codec, dimensions, frame rate, duration and audio presence with the brief. Container metadata is only one check.

Decode the complete video with FFmpeg and inspect errors. Use blackdetect, freezedetect and silencedetect where useful, interpreting intentional stills, fades and pauses in context. Extract representative scene starts, middles, ends and transitions, then inspect actual images. Listen to narration and music for clipping, pronunciation, missing words and synchronization. If playback is unavailable, mark listening/temporal review unperformed.

For Arabic, inspect connected letters, reading direction, mixed punctuation, cue timing, wrapping and safe margins. Compare spoken words with the approved script. Measure a representative render before estimating a long video. Do not assert 20-minute readiness from a 30-second render.

Example: A 1080x1920/30 FPS MP4 can pass metadata checks yet still have unreadable captions. Report separate technical, visual, temporal and listening verdicts with timestamps and evidence.

## Deliverable

A timestamped quality report, reproducible checks, reviewed frames, blocking findings and explicit unperformed checks; no unqualified pass without the required evidence.

## Common mistakes

Do not equate file existence or silence-free audio with intelligible speech. Do not turn intended still scenes into automatic defects. Keep measured results separate from report claims.
