---
name: script-writer
description: Use when a video needs a narration script, documentary structure, scene breakdown, factual sourcing, or Arabic adaptation.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Script Writer

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Collect the brief and target duration. For factual material, verify claims against suitable sources and retain a source list; distinguish dramatization and uncertainty. Write for the requested spoken language, including Egyptian Arabic when requested.

Break the story into hook, development, reveal and ending as appropriate. Give each scene an id, purpose, spoken narration, visual prompt, proposed duration, camera suggestion and evidence/source references. Estimate speech duration from a representative recording, then correct durations using the actual generated audio; words-per-minute is planning evidence only.

Create project.json or a scene-plan handoff using the runtime project contract. Durations must align to frames, scene ids must be unique, and cue times must remain inside the complete timeline. Never manufacture source citations or claim audio exists because narration text exists.

Example: For a 60-second Arabic explanation at 30 FPS, plan four scenes with durations totaling exactly 1800 frames, record a sample sentence, and adjust the narration before handing it to voice-director.

## Deliverable

A narration script, source list, scene plan and unresolved factual questions; runtime validation result for any project JSON created.

## Common mistakes

Do not use guessed timings as final subtitle alignment. Do not pad an unfinished script with repeated narration merely to reach duration. Avoid unsourced documentary claims.
