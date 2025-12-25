# DevOps Agents

Agent configurations for automated DevOps tasks.

## Agents

- `deployment-checker/` - Validates deployments and checks health
- `drift-detector/` - Detects infrastructure drift from IaC
- `cost-optimizer/` - Identifies cost optimization opportunities

## Agent Capabilities

### Deployment Checker 🤖
- Pre-deployment validation
- Post-deployment health checks
- Rollback recommendations on failures

### Drift Detector 🔍
- Compares actual infrastructure vs IaC definitions
- Reports manual changes outside of automation
- Suggests corrective actions

### Cost Optimizer 💰
- Identifies underutilized resources
- Recommends right-sizing opportunities
- Flags cost anomalies

## Approval Gates

**Auto-allowed:**
- ✅ Read-only operations (checks, scans, reports)
- ✅ Non-destructive suggestions

**Human approval required:**
- 🧍‍♀️ Making actual infrastructure changes
- 🧍‍♀️ Terminating resources
- 🧍‍♀️ Modifying production

## Configuration

Each agent has:
- `config.json` - Agent configuration and capabilities
- `prompts/` - System prompts and instructions
- `tools/` - Agent-specific tools and integrations
