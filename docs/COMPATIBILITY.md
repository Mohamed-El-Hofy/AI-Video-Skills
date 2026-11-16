# Agent and OS compatibility

All nine skills use the open [Agent Skills format](https://agentskills.io/specification), with compact metadata, task-specific instructions and bundled relative references. The engine uses Node's platform-neutral path/process APIs, argument arrays and shell=false.

| Host | Project scope | User scope | Evidence |
| --- | --- | --- | --- |
| Codex | .agents/skills | ~/.agents/skills | Folder/launcher tests; native automatic discovery not exercised |
| Claude Code | .claude/skills | ~/.claude/skills | Folder/launcher tests; native automatic discovery not exercised |
| Antigravity current | .agents/skills | ~/.gemini/config/skills | Folder/launcher tests; native automatic discovery not exercised |

Current Antigravity still supports legacy .agent/skills and ~/.gemini/antigravity/skills according to its docs. The installer targets the current default; an older installed host may need explicit legacy folder placement. Do not install both current and legacy copies blindly, since discovery can duplicate names.

Sources checked 2026-11-16: [Antigravity skills](https://antigravity.google/docs/skills), [Claude Code skills](https://code.claude.com/docs/en/skills), [Codex skill guide](https://learn.chatgpt.com/docs/build-skills).

The repository must remain available to installed skill launchers. `.runtime.json` is a machine-local locator created only by explicit installation; it is not shipped or committed. `AIV_HOME` overrides the locator. To distribute, share the repository archive and install complete folders from that copy. Copying SKILL.md alone breaks operational references by design and is not supported.

Windows is the locally executed platform. Linux/macOS are portability targets with a 3-OS, Node 22/24 CI matrix prepared. Their successful execution is not claimed until the workflow actually runs. Package manager guidance is Debian/Ubuntu/Homebrew/winget-specific; no claim of every Linux distribution is made.

For host verification after explicit installation: refresh skills, confirm all nine names in the host inventory, ask for an environment check, confirm doctor is invoked using the installed launcher, then request the offline demo. Record host version and actual result. Merely having files on disk is not host-discovery proof.
