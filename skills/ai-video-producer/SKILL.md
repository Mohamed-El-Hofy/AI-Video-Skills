---
name: ai-video-producer
description: Use when a user requests a complete AI video, documentary, narrated short, or production from script to final MP4.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Ai Video Producer

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Coordinate the nine production roles. Confirm only missing audience, duration, language, aspect ratio and source material that would change the result. Reuse accepted decisions and existing assets.

1. Run `node scripts/aiv.mjs doctor`; route missing requirements to environment-doctor. Keep installation and publication approval separate from routine production.
2. Have script-writer produce a sourced script and frame-aligned scene plan. Have image-director and voice-director supply real files and provenance. Do not request optional tools when local inputs suffice.
3. Have camera-animator specify bounded motion, then video-editor assemble project.json. Use `validate --assets`; resolve missing speech or timing before rendering.
4. Render a short representative preview first, review it with quality-inspector, then render the full project. Use `resume` after interruption; retain the output directory.
5. Have export-manager deliver the verified video, captions and production report. Report estimates separately from measured render time. Maintain HANDOFF.md throughout long work.

Example: For a five-minute Egyptian Arabic ocean documentary, create the script and a 300-second scene plan, check available image/voice tools, produce a representative Arabic preview, review it, then resume the full render and deliver locally. Do not reuse the demonstration ocean assets without rights.

## Deliverable

A project directory containing script, scene plan, provenance, real assets, validated MP4, captions, production report and current HANDOFF.md.

## Common mistakes

Do not claim a complete video after merely generating a plan. Do not silently downgrade requested speech or required captions. Never assume optional providers are installed.
