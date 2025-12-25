# Workflows

This directory contains deployment, rollback, scaling, and backup workflow definitions.

## Structure

- `deployment.yaml` - Standard deployment workflow
- `rollback.yaml` - Rollback and recovery procedures
- `scaling.yaml` - Auto-scaling and manual scaling workflows
- `backup-restore.yaml` - Backup and restore procedures

## Workflow States

Each workflow follows the state machine pattern:
- planned → approved → applying → applied → verified
- Or: failed → rolled-back

## Usage

Workflows are referenced by:
- `blackroad-os-operator` for scheduled and triggered operations
- `blackroad-os-prism-console` for manual initiations
- DevOps agents for automated operations (with approval gates)

## Adding New Workflows

1. Define clear state transitions
2. Include rollback procedures
3. Specify approval gates (human vs auto-allowed)
4. Document integration points
5. Add dry-run mode for testing
