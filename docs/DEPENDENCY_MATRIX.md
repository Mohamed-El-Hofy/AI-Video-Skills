# Dependency matrix

| Component | Requirement | Detection | Fallback |
| --- | --- | --- | --- |
| Node >=22 | Core orchestration | Runtime version, explicit bootstrap if absent | Install separately with approval |
| FFmpeg + FFprobe | Core render/export | Version, encoders, baseline filters | BLOCKED until approved setup |
| FFmpeg subtitles/libass + Arabic font | Burnt captions | Filter flag; visual font QA separate | Sidecar only if brief permits |
| Remotion + React + browser | Optional cinematic scene renderer | Explicit local modules/browser or bridge probe | FFmpeg |
| faster-whisper + local model | Optional ASR | Explicit interpreter import and local path | Corrected manual cues |
| VoiceTuT | Optional speech | Explicit endpoint configuration, no implicit network probe | Supplied audio or approved bridge |
| A1111 / image bridge | Optional imagery | Explicit config, no implicit model readiness claim | Supplied authorized images |
| Concat MCP | Optional native editing | Host schema inspection/import evidence | Engine editing + interchange |

Doctor inspects CPU threads/model, RAM and current-working-directory free storage. It does not infer a GPU, model load capacity, render quality, disk capacity of a different output volume, or actual service generation performance. Service-configured is distinct from service-ready. READY is diagnostic readiness, not completed production.

Only setup ffmpeg executes a fixed installation plan, after interactive exact approval. Optional software, Python environments, models and browsers use reviewed instructions and separate approval. No credential prompts or account creation are part of doctor. A denied/noninteractive setup executes nothing.
