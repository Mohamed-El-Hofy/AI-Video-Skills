# Local release checklist

- [ ] Re-run tests, skill validation and synthetic smoke on all target OS/Node jobs; record actual evidence.
- [ ] Complete live native discovery checks in Codex, Claude Code and Antigravity.
- [ ] Complete optional provider live checks needed by the release claims; retain mock/live distinction.
- [ ] Review complete source video with listening and temporal playback; run representative long-form benchmark.
- [ ] Confirm no credentials, local runtime locators, private configs/models or unauthorized source media in archive.
- [ ] Review LICENSE/NOTICE/THIRD_PARTY against the exact files distributed.
- [x] User explicitly approved public source upload to the user-created Mohamed-El-Hofy/AI-Video-Skills repository on 2026-11-16. Future release/package publishing needs its own authorization.

Local Git initialization and a local archive are not publication. Keep package.json private=true to prevent accidental npm publication. No remote URL or auto-publishing workflow is configured.
