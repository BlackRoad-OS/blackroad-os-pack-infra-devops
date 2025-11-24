# Deployment Runbook

## Purpose
Provide a standard sequence for safe deployments across BlackRoad services using the Infra & DevOps Pack.

## Pre-flight Checklist
- All automated tests green.
- Beacon health signals green for target environment.
- DNS blueprints validated by Infra Steward.
- Change control approved for production.

## Execution Steps
1. Use Deploy Conductor to generate the deployment plan.
2. Run canary where applicable; monitor Beacon for anomalies.
3. Promote traffic gradually or shift blue/green allocation per plan.
4. Record outcomes for each service in deployment results.

## Rollback Strategy
- If any service fails health verification, pause and roll back the last step.
- Revert to previous stable artifact or environment snapshot.
- Notify stakeholders and create follow-up tasks for remediation.

## Linked Workflows and Agents
- Workflow: `infra_blue_green_deploy` (blue/green and canary)
- Agents: `infra-deploy-conductor-01` orchestrates ordering; `infra-steward-01` validates guardrails.
