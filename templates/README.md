# Templates

Reusable Infrastructure as Code (IaC) and CI/CD templates for BlackRoad OS.

## Structure

- `terraform/` - Terraform modules for cloud resources
- `ci-cd/` - CI/CD pipeline configurations

## Security Guidelines

🚫 **NEVER** commit:
- Live cloud credentials or API keys
- Production resource IDs or names
- Real account numbers or secrets

✅ **ALWAYS** use:
- Placeholders: `{project-id}`, `{region}`, `{resource-name}`
- Variable references: `var.project_id`, `${PROJECT_ID}`
- Secret manager references: `secretmanager:///projects/{project}/secrets/{secret}`

## Naming Convention

Follow the pattern: `{environment}-{service}-{resource}`

Examples:
- `prod-api-compute`
- `staging-db-postgres`
- `dev-cache-redis`

## Usage

These templates are referenced by:
- Deployment workflows in `workflows/`
- DevOps agents for infrastructure provisioning
- Manual operations via `blackroad-os-prism-console`
