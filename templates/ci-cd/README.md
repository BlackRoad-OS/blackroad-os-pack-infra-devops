# CI/CD Templates

Continuous Integration and Continuous Deployment pipeline configurations.

## Templates

- `github-actions.yml` - GitHub Actions workflow template
- `railway-config.json` - Railway deployment configuration

## Features

Standard CI/CD pipeline includes:
1. **Build** - Compile, package, containerize
2. **Test** - Unit tests, integration tests, security scans
3. **Deploy** - Automated deployment to environments
4. **Monitor** - Post-deployment health checks

## Environments

- **Development** - Auto-deploy on merge to `dev` branch
- **Staging** - Auto-deploy on merge to `staging` branch
- **Production** - Manual approval required, deploy from `main` branch

## Approval Gates

- 🤖 Auto-deploy: dev, staging
- 🧍‍♀️ Human approval: production

## Integration

Pipelines integrate with:
- `blackroad-os-archive` for deployment event logging
- `blackroad-os-prism-console` for deployment status
- `blackroad-os-operator` for post-deployment jobs
