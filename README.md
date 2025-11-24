# BlackRoad OS Pack: Infra & DevOps

Plug-and-play pack that provides environment bootstrapping, CI/CD orchestration, and oncall workflows for BlackRoad deployments.

## How It Connects
- **blackroad-os-infra**: supplies DNS blueprints and Railway templates validated by the Infra Steward agent.
- **blackroad-os-beacon**: provides health signals and deployment logs used for canary gating and incident evidence.
- **blackroad-os-operator**: runs the workflows defined in this pack for onboarding, blue/green deploys, and incidents.

## Getting Started
1. Register the pack in the Pack Index alongside `blackroad-os-core`, `blackroad-os-infra`, and `blackroad-os-beacon`.
2. Configure the agents with appropriate credentials and policy controls (no secrets hardcoded here).

## Example: Service Onboarding
Run the `infra_service_onboarding` workflow to wire a new service:

```ts
await operatorClient.startWorkflow("infra_service_onboarding", {
  service,
  dns_blueprint,
  railway_template,
});
```

## Example: Blue/Green Deploy
Use `infra_blue_green_deploy` for coordinated releases across multiple services with canary verification and traffic shifting.

## Testing
- Install dependencies: `npm install` and `pip install -r requirements.txt`.
- Run TypeScript tests: `npm test`.
- Run Python tests: `pytest`.
