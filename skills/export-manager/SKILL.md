---
name: export-manager
description: Use when delivering a finished local MP4, subtitle sidecars, production report, release archive, or final video export verification.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Export Manager

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Read the approved output brief and quality-inspector's findings. Resolve blocking issues before delivery. Run `node scripts/aiv.mjs inspect final.mp4`, compare expected resolution/FPS/duration and verify the actual report status and output hash.

Deliver final.mp4 and captions.srt when requested, along with provenance and a concise production report. A captionMode of none is acceptable only when it matches the brief. Include any licensing/attribution obligations for images, voices, music and tools; the runtime's license does not grant media rights.

Retain checkpoint.json and scene cache for future edits. Do not claim a portable export if it references missing external assets. For a shareable project, include authorized assets and relative paths while excluding local provider configs, tokens and private source media.

Packaging locally is permitted by an export request. Uploading, publishing to GitHub/social platforms, or enabling paid providers needs explicit authorization. Never infer publication permission from a request to create an open-source-ready package.

Example: Deliver the verified local documentary plus SRT and measured render statistics, state any unperformed listening review, and leave online publication pending explicit approval.

## Deliverable

Usable local deliverables, validated specifications, checksums, provenance and concise remaining limitations; current HANDOFF.md for unfinished production.

## Common mistakes

Do not publish because a repository is ready. Do not include private configs or models in an archive. Do not report an estimated duration as a measured export result.
