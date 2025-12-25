# Checklists

Structured guides for launches, migrations, and reviews.

## Checklists

- `new-service-launch.md` - Checklist for launching a new service
- `environment-migration.md` - Guide for migrating between environments
- `security-review.md` - Security review checklist for infrastructure changes

## Purpose

Checklists ensure:
1. **Completeness** - No steps are forgotten
2. **Consistency** - Same process every time
3. **Quality** - Standards are maintained
4. **Collaboration** - Clear ownership of tasks

## Format

Each checklist should include:
- **Pre-requisites**: What needs to be ready first
- **Tasks**: Clear, actionable items with checkboxes
- **Owners**: Who is responsible for each item
- **Success criteria**: How to know you're done
- **Post-completion**: What happens next

## Usage

Checklists are used:
- Before launching new services or features
- During environment migrations or major changes
- For security reviews and compliance audits
- As templates for creating tickets/issues

## Example Format

```markdown
## New Service Launch

### Pre-requisites
- [ ] Service design approved
- [ ] Resources allocated
- [ ] Team members identified

### Infrastructure
- [ ] Create IaC templates
- [ ] Provision dev environment
- [ ] Provision staging environment
- [ ] Provision production environment (approval required)

### Security
- [ ] Security review completed
- [ ] Secrets configured in secret manager
- [ ] IAM roles and policies defined
```
