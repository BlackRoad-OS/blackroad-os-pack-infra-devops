# BlackRoad OS · Infra-DevOps Pack (Gen-0)

InfraPack-Gen-0 is the starter kit for BlackRoad's infra/devops automation. It ships reusable Terraform modules, GitHub Actions templates, thin agent scripts, and a tiny CLI (`br-infra`) to render workflows and trigger deployments.

## Quickstart

```bash
pnpm install
pnpm br-infra render build-and-deploy > .github/workflows/build.yaml
pnpm br-infra deploy core
```

## What you get

- **IaC**: Terraform modules for Cloudflare zones and Railway services under [`/iac`](./iac).
- **Pipelines**: Handlebars-flavored GitHub Actions templates in [`/pipelines`](./pipelines).
- **Agents**: Bash + TypeScript utilities in [`/agents`](./agents) for deploy/rollback/scale.
- **Runbooks**: Text-first ops guides in [`/runbooks`](./runbooks) with Mermaid diagrams.
- **CLI**: `br-infra` wrapper to render pipelines and invoke agents from [`/src`](./src/cli.ts).
- **Tooling**: ESLint/Prettier/TypeScript config, plus a postbuild beacon script.

## Development

- `pnpm lint` runs ESLint + Prettier checks.
- `pnpm build` compiles TypeScript.
- `pnpm br-infra --help` shows available subcommands.

> **Note:** This scaffold intentionally leaves hooks for future extensions such as Kubernetes charts and chaos testing agents. See inline `TODO(infra-pack-next)` markers.

## Environment

Copy [`infra-devops.env.example`](./infra-devops.env.example) to `.env` and populate the values before running deployment agents locally. Credentials are pulled from environment variables to keep commits secret-free.
