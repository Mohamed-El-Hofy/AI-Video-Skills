# Portable architecture

Implements the user's approved full-scope, cross-platform, all-agent design. The source studio remains untouched.

Three layers: nine discoverable Agent Skills; a dependency-free Node.js 22 orchestration CLI with versioned JSON projects and content-addressed scene checkpoints; optional provider adapters. FFmpeg/FFprobe implement the minimum working render path. Remotion is an optional cinematic renderer via an explicit local bridge. No package manager runs during import, doctor, validation or rendering.

The agent writes scripts and image prompts, invokes available generators or accepts user assets, and records asset provenance. The engine validates artifacts, animates stills, assembles scenes, mixes audio, supplies subtitle sidecars or burns captions, validates output and records resumable state. It does not invent unavailable images or speech. Colored demo cards and test tones are explicitly labeled fixtures.

Inputs and outputs use paths relative to a project directory. Input path traversal and symlink escapes are rejected. Provider configuration is separate, local and excluded from release. External commands are argument arrays with shell disabled. Secrets are environment variables, never checkpoint fields.

Render state is atomic, locked against concurrent writers, checksummed and invalidated by content changes. Each scene is a bounded render unit; long projects are not sent as a single unbounded filter graph. Final assembly is serialized. A failed render preserves completed checkpoints and never claims final success.

Nine skills share a bundled runtime locator rather than brittle relative links to an installed sibling directory. An explicit installer copies the complete skill folders to a chosen project agent directory and embeds the repository location in a local locator. The distributable originals contain no machine path. User-wide installation is never implicit.

Compatibility target: Windows/Linux/macOS and Claude Code/Codex/Antigravity. Actual executed coverage is reported separately. Apache-2.0 covers new code and skills only; no source-studio code, models, FFmpeg binaries or Remotion packages are redistributed.

Ruling: FFmpeg is the minimal renderer rather than mandatory Remotion. This preserves the approved optional-integration goal and removes an unnecessary install for new users. Remotion remains selectable explicitly.
