# Environments Matrix

| Environment | Domains / DNS Expectations | Deploy Frequency | Allowed Risk |
|-------------|----------------------------|------------------|--------------|
| dev         | `*.dev.<placeholder-domain>`; wildcard DNS for rapid spins | Multiple times daily | Medium (non-customer) |
| stage       | `*.stage.<placeholder-domain>`; mirrors prod DNS records   | Daily or before releases | Low-Medium |
| prod        | `*.prod.<placeholder-domain>`; locked-down DNS changes     | Weekly or approved windows | Low |

## Notes
- Dev allows experimental flags; Beacon alerts are informational.
- Stage requires change tickets for risky migrations.
- Prod enforces canary or blue/green via Deploy Conductor plans.
