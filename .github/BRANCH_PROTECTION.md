# Branch Protection Checklist

Apply these settings in GitHub repository settings for `main` (or `master`).

## Rules to Enable

- Require a pull request before merging.
- Require approvals: at least 1.
- Dismiss stale pull request approvals when new commits are pushed.
- Require review from code owners if you add CODEOWNERS later.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Include administrators (recommended for production governance).
- Restrict force pushes.
- Restrict branch deletions.

## Recommended Required Status Checks

- Build and test
- Validate PR title
- dependency-review
- Analyze

## Nice-to-Have Repository Settings

- Enable auto-delete of head branches after merge.
- Enable squash merge with default pull request title.
- Enable Dependabot alerts and Dependabot security updates.
- Enable private vulnerability reporting.
