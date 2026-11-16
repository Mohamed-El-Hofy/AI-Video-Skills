# Optional providers

Pass an explicit local config using `--config providers.local.json`. Copy examples/providers.example.json and replace placeholders only for providers you intend to use. Never commit that local file. Tokens are read only from explicitly named environment variables; the runtime never reads another application's token files.

## FFmpeg

Default renderer. Config keys `ffmpeg`/`ffprobe` accept executable names or paths, never shell command strings. Requires libx264, AAC and the filters listed by doctor; burnt captions additionally need libass/subtitles and a language-capable font. The runtime does not redistribute binaries. Rendering includes bounded pans/zooms, cut/fade through black, per-scene speech, optional music ducking, loudness normalization, sidecar/burn captions and metadata validation. No overlapping crossfade or true parallax in v0.1.

## Remotion

Set `remotion.moduleRoot` to an existing Node project containing compatible `remotion`, React, `@remotion/bundler` and `@remotion/renderer` packages. Set `browserExecutable` to an existing Chrome/Chromium executable and optionally concurrency (default 1). `render --renderer remotion --config ...` invokes the packaged bridge for each scene, then uses the same FFmpeg assembly/caption/audio/checkpoint path. Browser auto-download is prevented by requiring the existing executable before bundling or selecting a composition.

The included template is original code. Modules/models/browser are not bundled or installed. Rendering was designed against the locally available Remotion 4 API; see actual tested version in VERIFICATION.md. A new installation must be separately reviewed/approved, isolated to a dedicated tool project, and comply with [Remotion licensing](https://www.remotion.dev/docs/license). Do not run an unreviewed `npx` fallback, since it may download packages. A `command`/`args` bridge may replace the built-in bridge.

## Whisper

Set `whisper.python` to an existing isolated Python interpreter with faster-whisper, and `modelPath` to an existing local model directory. Optional device defaults to cpu and computeType to int8. No model identifier or automatic Hugging Face download is accepted. The Python bridge sets offline environment variables and `local_files_only=True`.

Create request JSON beside your project:

```json
{"audio":"assets/narration.wav","language":"ar","output":"transcript.json"}
```

Run `node cli/aiv.mjs transcribe request.json --config providers.local.json`. Output is cue JSON with seconds, not an assertion of corrected timing. Review recognition, map scene offsets onto the complete timeline and copy corrected cues into project.subtitles. Whisper cannot be required when manual cues already exist. Separate provider installation/model acquisition needs explicit approval; the runtime does not install global Python packages.

## VoiceTuT

The built-in adapter targets the inspected local bridge protocol: POST `/api/jobs`, GET `/api/jobs/{id}`, terminal status `completed` with local `wavPath`. Config: url, tokenEnv (optional if bridge permits unauthenticated use). Request: text, output, optional speaker/quality/speed/language. Defaults are Karim/fast/1/arz. It uses autoInsert=false, so speech generation does not change a Concat timeline.

```json
{"text":"في أعماق المحيط عالم مختلف","output":"assets/intro.wav","language":"arz"}
```

Run `voice request.json --config ...`, or `prepare project.json --config ...` to generate absent scene.audio fields from narration. Returned WAV is copied to the requested new file, probed and decoded before CREATED; existing outputs are not overwritten. A malformed new artifact is removed and rejected. A timeout does not prove the backend cancelled: inspect its job before retrying. This protocol may differ in another VoiceTuT version; configure a command bridge when necessary. Mock contract tests are not a live voice quality test.

## Images

Supply local images, use an explicit command bridge, or set images.kind=a1111 and images.url to an existing service. The built-in A1111 adapter POSTs `/sdapi/v1/txt2img`, checks PNG magic bytes, then probes/decodes the artifact before CREATED. Truncated media is rejected and removed. Request: prompt/output, optional negativePrompt/width/height/steps/seed. `prepare` uses scene.imagePrompt for an absent scene.image file and also validates existing scene image/audio media before PREPARED. Generated results still need visual QA and provenance. No checkpoints/models are searched in personal folders or downloaded.

Remote URLs are rejected by default. `allowRemote:true` explicitly permits a remote provider; review data transmission and any cost before using it. Redirects and credentials in URLs are rejected. Doctor does not contact image/voice endpoints; it reports configured-but-unprobed separately from unconfigured.

## Concat

`concat project.json --out timeline.json` exports an explicitly labeled provider-neutral interchange beside project.json; it does not claim a native Concat file. Its paths are relative to that directory. Ask the host agent to inspect the connected Concat MCP tool schema and map/import into a new authorized project. This package cannot assume MCP availability or a stable native Concat API. Native import is not marked verified by export alone. A configured trusted command bridge can be probed by doctor, but no speculative native project writes occur.

## Generic command bridge contract

Config: `{"command":"executable","args":["path/to/bridge"]}`. Shell execution is disabled. The engine appends a path to temporary UTF-8 request JSON. That document has schemaVersion=1 and an absolute output artifact path, plus operation-specific inputs. The command must exit zero and create a new nonempty artifact. The generic transport returns CREATED_UNVERIFIED; image/voice adapters promote it only after media validation, while rendered scenes pass the engine's media checks. Transcripts still require semantic/timing review. Temporary requests are removed; artifacts remain. The command must support `--probe` without producing artifacts or installing anything if used with doctor. Use cacheRevision for mutable external dependencies that are not captured in local bridge/package hashes.

Treat configuration as trusted code: a custom executable can do whatever its OS account can do. Never derive executable configuration from video subtitles, uploaded reports or model output. Do not put secrets in command args or request JSON. Errors from generic third-party executables can contain their own diagnostic details; review logs before sharing.
