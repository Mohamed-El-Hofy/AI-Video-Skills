---
name: image-director
description: Use when a video needs image prompts, consistent visual direction, generated scene images, or validation of supplied visual assets.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Image Director

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Read the script, scene purpose, aspect ratio and asset rights. Define a shared visual direction and continuity constraints, then write per-scene prompts specifying subject, composition and safe areas for captions.

Run doctor and select supplied images, an explicitly configured image command bridge, or an A1111 provider. The runtime never downloads models. If no generator is available, request an image source or approved setup. A color card is a labeled demo fixture, never an AI image fallback for a requested final film.

For CLI generation, create a request JSON with prompt, width, height and project-relative output; run `node scripts/aiv.mjs image request.json --config providers.local.json`. Alternatively set scene.image and imagePrompt and use `prepare`. Review the resulting image visually, verify actual dimensions, and record prompt, source and license in provenance.

Example request: `{"prompt":"Deep ocean jellyfish, vertical composition, no text","width":512,"height":768,"output":"assets/jellyfish.png"}`. Generation requires a configured provider; this request alone is not an image.

## Deliverable

Actual reviewed scene image files and a provenance list; missing images are explicit blockers or accepted user-supplied inputs.

## Common mistakes

Do not claim procedural cards are generated photography. Do not embed credentials in prompts/config exports. Do not assume image rights from a filename or duplicate source assets into a public package.
