# Contributing to voiceyBill-server

Thanks for your interest in contributing.

## Ground rules

- Be respectful and constructive in all discussions.
- Focus pull requests on one clear change.
- Open an issue before starting major features.
- Do not include secrets or production credentials in any commit.

## Development setup

1. Fork and clone the repository.
2. Use Node.js 20 or later.
3. Install dependencies:

```bash
npm ci
```

4. Start the development server:

```bash
npm run dev
```

## Branch and commit conventions

- Branch names should be descriptive, for example:
  - `feat/add-voice-summary`
  - `fix/report-cron-timezone`
- Use clear commits that explain why the change is needed.

## Pull request requirements

- PR titles are validated in CI and should follow Conventional Commits style:
  - `feat(auth): Add refresh token endpoint`
  - `fix(report): Handle empty transaction list`
- Keep PRs small and easy to review.
- Link related issues, for example `Closes #123`.
- Include screenshots or API examples if behavior changed.

## Quality checks

Before opening a PR, run:

```bash
npm run build
npm test --if-present
```

## Issue reporting

- Use the bug template for defects.
- Use the feature template for enhancements.
- Use the question template for usage help.

## Security policy

- Do not open public issues for security vulnerabilities.
- Use GitHub Security Advisories for responsible disclosure.
