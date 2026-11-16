---
name: voice-director
description: Use when a video needs narration audio, Egyptian Arabic TTS, VoiceTuT synthesis, transcription, or subtitle alignment.
license: Apache-2.0
compatibility: Node.js 22+ runtime; FFmpeg/FFprobe for rendering; optional providers require separate setup.
---

# Voice Director

Read [runtime and handoff contract](references/runtime.md) before invoking the engine. Use `node scripts/aiv.mjs help` to locate supported commands. Preserve the user's project and record actual artifacts rather than inferred success.

Read approved narration, language, intended pronunciation and scene timing. Run doctor and choose supplied audio, a configured VoiceTuT bridge, or a reviewed command bridge. An absent TTS provider requires user input or approved setup; never create silent audio and label it speech.

For VoiceTuT, configure its endpoint and token environment-variable name explicitly, without reading credentials from unrelated apps. Create a voice request containing text and relative output. Run `node scripts/aiv.mjs voice request.json --config providers.local.json`; inspect the artifact, listen for pronunciation and measure duration. `prepare project.json --config ...` can generate missing scene narration files.

If audio exceeds a scene, revise the script or extend the timeline explicitly; the engine rejects accidental truncation. Keep the original spoken text and the final audio paired. To transcribe, configure an existing local faster-whisper model, create a request with audio, language and output, then run `transcribe`. Read the resulting cue JSON, correct recognition errors and offset scene cues onto the master timeline. Manual cues or user SRT are valid alternatives.

Example voice request: `{"text":"في أعماق المحيط عالم مختلف","language":"arz","output":"assets/intro.wav"}`. A mock job test proves the protocol only; actual listening is separate evidence.

## Deliverable

Recorded/generated audio, measured durations, pronunciation review and manually checked subtitle cues; provider and model provenance where applicable.

## Common mistakes

Never reverse Arabic strings to fix display. Do not call heuristic timing Whisper alignment. A timed-out service job may still run; inspect it before retrying.
