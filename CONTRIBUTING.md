# Contributing to blackroad-os-pack-infra-devops

🙏 Thanks for considering contributing to the BlackRoad OS Infrastructure & DevOps Pack!

---

## 🎯 What This Pack Is

This pack provides **infrastructure-grade automation** for BlackRoad OS:
- Infrastructure as Code (IaC) templates
- CI/CD pipeline configurations
- Deployment workflows and runbooks
- DevOps agent configurations

---

## 🤝 How to Contribute

### 1. 🔍 Check existing issues and PRs
- Look for open issues or discussions
- Comment on an issue if you'd like to work on it
- Avoid duplicating work already in progress

### 2. 🍴 Fork and create a branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. ✅ Follow conventions
- **Directory structure**: See `codex.prompt.json` for suggested structure
- **Naming**: Use `{environment}-{service}-{resource}` pattern
- **Security**: NO live credentials, API keys, or production IDs
- **Documentation**: Update README.md if adding major features

### 4. 🧪 Test your changes
- Ensure IaC templates are valid (terraform validate, etc.)
- Test workflows in non-production environments
- Add dry-run examples for destructive operations
- Include rollback procedures

### 5. 📝 Write clear commit messages
```
feat: add terraform template for compute resources
fix: correct rollback procedure in deployment workflow
docs: update agent configuration examples
```

### 6. 🚀 Submit a pull request
- Describe what you changed and why
- Link any related issues
- Include test results or validation steps
- Mark as draft if still in progress

---

## 🔐 Security Guidelines

This pack deals with **operationally critical infrastructure**. Please:

- 🚫 **NO live credentials** in code or examples
- 🚫 **NO production resource IDs** or real infrastructure names
- ✅ Use synthetic placeholders (e.g., `{project-id}`, `{resource-name}`)
- ✅ Mark high-risk operations with comments:
  ```
  // HIGH-RISK INFRA OPERATION – HUMAN APPROVAL REQUIRED
  ```

---

## 🤖 Agent Behavior

When adding or modifying workflows, clearly define:

**Auto-allowed operations:**
- ✅ Staging environment deploys
- ✅ Resource tagging/labeling
- ✅ Backup operations
- ✅ Non-destructive monitoring setup

**Human approval required:**
- 🧍‍♀️ Production deploys
- 🧍‍♀️ Database migrations
- 🧍‍♀️ Resource deletions
- 🧍‍♀️ Security policy changes

---

## 📊 Integration Requirements

If your contribution affects integration with other BlackRoad OS components:

- **Prism Console**: Document any new dashboard metrics or visualizations
- **Archive**: Ensure infrastructure events are logged for audit trails
- **Operator**: Document any new scheduled jobs or automation

---

## 📏 Code Review Process

1. Maintainers will review your PR within 1-3 business days
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in release notes

---

## 🧬 Emoji Legend

Use these emojis in issues and PRs to improve clarity:

- 💼 pack / vertical product
- ☁️ cloud / infrastructure
- ⚙️ automation / workflows
- 🧬 templates / IaC shapes
- 🤖 helper agents
- ⚠️ operational risk / failure
- 🧾 audit / change logs
- 🚀 deployment / delivery
- 🔐 secrets / security

---

## 💬 Questions?

- Open a GitHub issue for questions or discussions
- Check the main README.md for pack overview
- Review codex.prompt.json for detailed specifications

---

🖤 Thank you for helping make BlackRoad OS infrastructure better! 🛣️
