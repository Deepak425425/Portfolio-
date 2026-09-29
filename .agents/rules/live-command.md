---
description: Rule for handling the "LIVE" command to trigger Vercel Preview Deployments.
---

# LIVE Command Workflow

Whenever the user types exactly `LIVE`, treat it as a DEPLOYMENT REQUEST to Vercel Preview.

Follow these steps exactly:
1. Check the current project state, git branch, and uncommitted changes.
2. Run the required validation and build (`npm run build`). Fix any critical errors that prevent deployment.
3. Commit any uncommitted changes to the current feature branch (ask for confirmation if changes seem unrelated).
4. Push the current feature branch to the remote repository.
5. Create a GitHub Pull Request targeting `main`. This action will automatically trigger a Vercel Preview deployment.
6. **DO NOT** push directly to `main`.
7. **DO NOT** merge the PR automatically. 
8. **DO NOT** deploy to Production automatically.
9. Stop after the PR is created, wait for Vercel to generate the preview, and provide the user with the Vercel Preview URL and the PR link.

Report format before stopping:
BUILD: PASS / FAIL
BRANCH: <branch>
CHANGES: <short summary>
PR: <link>
PREVIEW URL: <link>
