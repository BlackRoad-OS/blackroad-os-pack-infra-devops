# Infra & DevOps Pack Playbook

## What the Pack Is
The Infra & DevOps Pack provides baseline infrastructure operations for BlackRoad deployments. It bundles agents and workflows to handle environment bootstrapping, CI/CD orchestration, and oncall routines that align with BlackRoad platform standards.

## When to Use It
- Launching a new service that needs DNS, Railway, and Beacon wiring.
- Coordinating recurring releases across multiple services.
- Responding to SEV incidents with structured guidance.

## Core Agents
- **Deploy Conductor**: orchestrates ordered deployments, canary safety checks, and traffic shifts.
- **Infra Steward**: validates infrastructure blueprints and service templates for compliance.
- **Oncall Buddy**: classifies incidents, recommends runbooks, and scaffolds postmortems.

## Integrations
- **blackroad-os-infra**: uses DNS blueprints and Railway templates as inputs to Infra Steward checks.
- **blackroad-os-beacon**: consumes Beacon health signals to gate deploys and record incident evidence.
- **blackroad-os-operator**: executes workflows such as onboarding and blue/green deployments.
