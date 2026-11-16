# Project format v1

Use schemas/project.schema.json for editor assistance and `validate` for semantic checks. Unknown fields are rejected. The runtime schema is intentionally smaller than the original studio schema and is not drop-in compatible; the source is never changed by conversion. Preserve original projects and create a new v1 project from the script/asset plan.

Paths are forward-slash, project-relative, existing files at render time. Absolute paths, URLs, traversal and realpath escapes are rejected. Output is a dedicated owned directory; inputs cannot reside in it. No fetching of imagePath URLs is implicit.

Required: schemaVersion=1; lowercase id; nonempty title; even width/height 64–3840; integer fps 15–60; 1–2000 scenes. Total duration is bounded to two hours. Each scene is 1 frame to 600 seconds and aligns exactly to a frame. Long shots can be split into smaller scenes to reduce the rerender unit.

Scene: unique id, duration seconds, exactly one image path or demo color `#RRGGBB`. Optional imagePrompt, narration, audio path, camera and transition. A nonempty narration needs real audio at render time. Audio longer than the scene is rejected instead of silently cutting speech. Short audio is padded.

Subtitles: ordered, nonoverlapping {start,end,text} cues in seconds on the complete timeline; start >= 0, end > start and end <= duration. Correct ASR/manual cues before rendering. No automatic unverified script-to-word alignment is fabricated. `font` can reference an authorized local font; set `fontFamily` to its internal family name, such as Noto Sans Arabic. Burnt captions use that family (Arial by default) and libass with fontsdir pointing to copied project font. Font filenames alone do not select a family. Test that the selected font supports the language.

Audio: optional music path, musicDb and voiceDb in [-60,6]. Final normalization targets -16 LUFS with -1.5 dBTP and an 11 LU loudness-range target. These are filter settings, not measured output guarantees. Inspect/listen and measure the actual exported file when loudness compliance matters.

Checkpoint schema includes project identity, scene keys, content hashes and validated artifact hashes. Scene keys include source asset contents, scene settings, dimensions/FPS, rendering implementation, renderer/provider configuration and FFmpeg version. Remotion keys also include packaged bridge/template contents, configured executable/argument files and installed package manifests. For external bridge dependencies, mutable PATH tools or remote state not represented by those files, change provider cacheRevision explicitly. Changed project-level music/cues regenerate the final assembly while reusing unchanged scene media. Credentials are never included; configuration uses token environment-variable names only. Hash verification is not a substitute for creative QA.

A render.lock records PID/start time. Concurrency is blocked. After a crash, verify the process is gone before removing the lock. Partials are replaced during retry, verified scenes survive. Corrupt checkpoint JSON requires manual review/backup; it is not silently treated as a valid cache.
