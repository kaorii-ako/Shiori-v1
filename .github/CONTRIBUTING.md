# Contributing to Shiori

First off — thank you for taking the time to contribute! Shiori is a student project built for students, and every contribution helps make it better for everyone.

## Ways to Contribute

- **Bug reports** — Found something broken? [Open an issue](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=bug_report.md)
- **Feature requests** — Have an idea? [Request it](https://github.com/kaorii-ako/Shiori-v1/issues/new?template=feature_request.md)
- **Code** — Fix bugs, add features, improve performance
- **Design** — UI/UX improvements, new themes, accessibility
- **Docs** — Better README sections, setup guides, comments
- **Tests** — We always need more test coverage

## Development Setup

```bash
git clone https://github.com/kaorii-ako/Shiori-v1.git
cd Shiori-v1
npm install
cp .env.example .env
# Fill in your credentials, then:
npm run dev
```

## Pull Request Process

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature` or `fix/your-bug`
3. Write clean, focused code — one PR per change
4. Test your changes locally
5. Commit with conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
6. Open a PR against `master` with a clear description

## Code Style

- JavaScript/JSX — follow existing patterns in the codebase
- No unnecessary abstractions — keep it simple
- Prefer editing existing files over creating new ones
- Tailwind utility classes + inline styles for glassmorphism effects

## Good First Issues

Look for issues tagged [`good first issue`](https://github.com/kaorii-ako/Shiori-v1/issues?q=label%3A%22good+first+issue%22) — these are intentionally scoped to be approachable for new contributors.

## Questions?

Open a [GitHub Discussion](https://github.com/kaorii-ako/Shiori-v1/discussions) or an issue — we're friendly!
