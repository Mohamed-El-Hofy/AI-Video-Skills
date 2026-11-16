---
name: environment-doctor
description: Use when video production requirements are unknown, a render tool is missing, or a user needs portable setup diagnostics.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Environment Doctor

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Run `node scripts/aiv.mjs doctor` and read its actual JSON status, hardware, tools and reasons. A Node 22+ runtime must already exist to run the doctor; if absent, explain the bootstrap requirement first.

Separate required FFmpeg/FFprobe and their capabilities from optional Remotion, Whisper, VoiceTuT, Concat and image generation. Record service configuration separately from live reachability and generation success. GPU capacity is unknown unless directly measured.

For missing FFmpeg, show `node scripts/aiv.mjs setup ffmpeg`, its OS package-manager plan and scope. Ask for approval for that exact operation. Never invoke setup with a workaround for its confirmation. Noninteractive setup declines safely. On non-Debian Linux, provide the distribution's reviewed manual instructions. Re-run doctor after approved installation; do not assume the current shell's PATH refreshed.

For optional providers, offer local images/audio/manual captions or explain isolated setup from docs/PROVIDERS.md. Models and browser downloads are separate installations requiring approval. Avoid changing global Python or unrelated projects.

Example: FFmpeg is available, Whisper and Concat are absent. Report DEGRADED, select user-supplied SRT/audio/images, and proceed with FFmpeg without requesting those optional installs.

## Deliverable

Environment JSON, an actionable dependency matrix and explicit READY/DEGRADED/BLOCKED interpretation; any proposed install includes source, scope and approval state.

## Common mistakes

A configured URL is not proof a service works. Do not infer GPU speed or long-form readiness. Do not install merely because an optional tool is missing.
