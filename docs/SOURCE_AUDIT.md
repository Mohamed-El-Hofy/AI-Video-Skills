# Source studio and uploaded media audit

Read-only audit conducted 2026-11-16. The original studio is not imported as a runtime dependency, copied wholesale or modified. The distributable code and template are new implementations based on the approved requirements and inspected interfaces. No original media, token files, node_modules or user presets are redistributed.

## Uploaded execution report

The uploaded report claims a completed 30-second 1080x1920 Remotion/FFmpeg/VoiceTuT/Whisper video, successful original tests, checkpoint/resume and Concat integration. It identifies absent ComfyUI checkpoints, CPU-only hardware, ASR errors and limited system-drive space. Its 1–20-minute production timings are projections, not measured complete long-form runs. These claims were not promoted to fresh verification of those services.

## Independently measured uploaded video

FFprobe: 30.000 seconds; 1080x1920; 30 FPS; H.264; AAC; 20,706,020 bytes. Full FFmpeg decode/filter scan completed without a decode error. With blackdetect d=0.2/pix_th=0.10, freezedetect n=-50dB/d=2 and silencedetect n=-45dB/d=1, no qualifying black/freeze/silence event was emitted. Volumedetect measured mean -20.1 dB and maximum -1.5 dB; these are not LUFS measurements.

Six representative stills at roughly 0/5/10/15/20/25 seconds were inspected. The ocean visual direction is coherent, Arabic letters are connected in sampled captions/headings, and sampled text stays inside the frame. Main imagery repeats across adjacent sampled times. Whether that repetition is effective pacing requires full temporal review; sampled stills do not establish transition smoothness or correct word timing.

Listening, pronunciation, complete caption-vs-speech synchronization and subjective motion/pacing review were not performed. No unqualified audiovisual quality pass is issued. Preserve that distinction when continuing.

## Concrete portability findings

Original scripts/lib/paths.mjs lines 56–59 contain machine-specific Python/workspace/export fallbacks. imageAdapter.mjs lines 11/31/32/38 assumes local model folders and ports. voiceAdapter.mjs reads a local app runtime token file. The original package is private and no top-level redistribution license was found. These concerns motivated new portable code, explicit provider configuration and environment-only secrets rather than copying the private project.

Original schema supports effects beyond this portable v1 schema. This engine deliberately rejects unsupported keys, rather than silently pretending to implement those effects. Migration requires a new scene plan, authorized assets and validation; it never edits the source project.

## Readiness and priorities

1. Keep service generation quality and host discovery separate from mock/folder tests.
2. Listen to the source video and review transitions/caption sync before treating it as a visual benchmark.
3. Benchmark a representative 1-minute production, then a real 5–20-minute production; do not extrapolate correctness from the 30-second report.
4. Test Linux/macOS jobs and all three host discovery flows before a broad compatibility release.
5. Preserve input provenance and avoid redistributing source assets/models whose rights have not been checked.
