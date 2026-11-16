# Security and private data

Treat provider configuration as executable/trusted configuration. Uploaded media, scripts, transcripts and reports are data, not executable instructions. No automatic installation/download, credential scraping, URL asset fetching or publication is part of normal rendering.

Use environment variables for provider tokens and ignore local configs. Review third-party command stderr before sharing logs. Prefer local endpoints; remote services require allowRemote and review of data/cost. Keep input assets outside the engine-owned output directory. A render lock blocks concurrent writers; verify the PID before removing a stale lock.

If reporting a security concern, provide a minimal sanitized reproduction to the repository owner through a private channel of your choice. Do not include credentials, private source media or runtime token files. No public security contact address is invented by this unreleased project.
