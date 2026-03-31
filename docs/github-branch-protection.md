# GitHub Branch Protection Baseline

This document defines the recommended protection policy for the main branch.

## Target branch

- main

## Required settings

1. Require a pull request before merging
2. Require approvals: at least 1
3. Dismiss stale pull request approvals when new commits are pushed
4. Require status checks to pass before merging
5. Required checks:
   - frontend-checks
   - backend-checks
6. Require conversation resolution before merging
7. Require linear history
8. Do not allow force pushes
9. Do not allow deletions

## Optional hardening

1. Require signed commits
2. Restrict who can push to matching branches
3. Enable secret scanning and push protection

## Setup path in GitHub

1. Open repository settings
2. Select Branches
3. Add branch protection rule for main
4. Apply the settings listed above
