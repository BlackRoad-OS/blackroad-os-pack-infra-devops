# Environments Matrix

| Environment | Domains / DNS Expectations | Deploy Frequency | Allowed Risk |
|-------------|----------------------------|------------------|--------------|
| dev         | `*.dev.example.com`; wildcard DNS for rapid spins | Multiple times daily | Medium (non-customer) |
| stage       | `*.stage.example.com`; mirrors prod DNS records   | Daily or before releases | Low-Medium |
| prod        | `*.prod.example.com`; locked-down DNS changes     | Weekly or approved windows | Low |

## Notes
- Dev allows experimental flags; Beacon alerts are informational.
- Stage requires change tickets for risky migrations.
- Prod enforces canary or blue/green via Deploy Conductor plans.
