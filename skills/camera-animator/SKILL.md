---
name: camera-animator
description: Use when still images in a video need Ken Burns motion, camera pans, zooms, framing, or a smoother cinematic shot plan.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Camera Animator

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Inspect the image's actual subject and safe crop before choosing motion. Select static, zoom-in, zoom-out, pan-left or pan-right for the portable engine. Keep a still shot when motion has no purpose; avoid cutting away from text or faces.

FFmpeg uses bounded 8% zoom/pan with frame-based progress. Remotion uses eased progress and bounded overscan. Both keep aspect-fill framing; neither reconstructs real depth. Advanced parallax, arbitrary 3D moves and subject tracking require a separately implemented provider and must not be claimed by setting unsupported JSON keys.

Set scene.camera, choose cut or fade through black, and run `node scripts/aiv.mjs validate project.json`. Render a representative shot with the actual resolution and inspect beginning, middle and ending frames for edges, crop and readable captions. Use quality-inspector for temporal review.

Example: A centered jellyfish can use zoom-in; a wide undersea ridge may use pan-right only after checking both crops. Reduce motion by choosing static if the safe frame is tight.

## Deliverable

Validated camera settings and reviewed sample frames; any requested unsupported effect is recorded as a limitation rather than silently ignored.

## Common mistakes

Do not promise depth/parallax from a flat image. Do not call fade through black a crossfade. Validate end framing as well as the first frame.
