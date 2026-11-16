---
name: video-editor
description: Use when assembling video scenes, mixing narration and music, adding timed captions, resuming a render, or handing a timeline to Concat.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Video Editor

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Gather real images, speech files, scene timings and corrected caption cues. Run doctor, build schema-version-1 project.json, and validate with `node scripts/aiv.mjs validate project.json --assets`.

The FFmpeg path animates each scene, pads short audio, rejects oversized narration, concatenates scenes, ducks optional music against speech and normalizes the final mix. Cut and fade through black are supported; overlapping crossfades are not. Keep musicDb conservative and listen to the mixed output.

Set captionMode to sidecar, burn or none. Burn requires FFmpeg libass and a font supporting the language; use a project-local font when portability matters. Keep full Arabic Unicode runs intact. Inspect wrapping and safe areas visually.

Run `render project.json --out <dedicated-directory>`, or `resume` with the same directory. Completed scenes are reused only after content and artifact verification. A render.lock stops concurrent writes; remove a stale lock only after confirming the process is no longer active.

For Concat, run `concat project.json --out timeline.json`. This exports a provider-neutral interchange, not a verified native project. Use the installed host MCP's actual schema for native import, with user authorization for changes to their Concat project.

Example: After interruption, run resume against the existing output folder and verify reused counts; do not start in a fresh folder and call it checkpoint reuse.

## Deliverable

A validated timeline, rendered preview/final output, caption files and production/checkpoint reports; optional Concat import evidence is recorded separately.

## Common mistakes

Do not put input assets in the output folder. Do not bypass missing narration by deleting text without user agreement. Do not assume Concat accepted an interchange export.
