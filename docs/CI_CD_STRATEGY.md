# CI/CD Strategy

## Repo-Level CI
- Validate pack manifest and workflow schemas.
- Run TypeScript unit tests for agent logic.
- Run Python validations for Infra Steward helpers.

## Environment-Level CD
- Deploy Conductor coordinates canary or blue/green strategies per environment.
- Infra Steward validates target DNS and Railway templates before promotion.
- Beacon gates traffic shifts based on health signals.

## Branching Model
- Default to trunk-based with short-lived feature branches.
- Require checks to pass before merging to main.

## Deploy Conductor Role
- Generates dependency-aware deployment plans.
- Surfaces failures and missing results to guide rollback decisions.
- Integrates with Beacon for health verification steps.
