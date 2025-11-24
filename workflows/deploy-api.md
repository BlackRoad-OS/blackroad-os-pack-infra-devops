# 🚀 Deploy API Service Workflow

**Service**: `blackroad-os-api` (or similar API service)  
**Owner**: API Team + Infra Team  
**Automation Level**: High (with optional manual approval gates)

---

## Overview

This workflow defines the step-by-step process for deploying the API service to staging and production environments. It ensures safe, repeatable deployments with proper validation at each stage.

---

## Prerequisites

- ✅ CI pipeline is green on the target branch
- ✅ `blackroad-os-infra` config is up to date
- ✅ No active P0/P1 incidents affecting the API service
- ✅ Deploy window is clear (check change calendar)

---

## Workflow Steps

### 1️⃣ Pre-Checks ✅

**Responsible**: `Infra.DeployBot` (automated) or `Infra.OncallEngineer` (manual trigger)

**Inputs**:
- `branch`: Git branch to deploy (e.g., `main`, `release/v1.2.3`)
- `commit_sha`: Specific commit SHA to deploy
- `target_environment`: Initially `staging`

**Actions**:
1. Verify CI status for the commit:
   - All tests passing
   - Code coverage meets threshold
   - Security scans clear
2. Check `blackroad-os-infra` for environment readiness:
   - Database migrations are compatible
   - Required infrastructure is provisioned
3. Query incident management system:
   - Confirm no active incidents blocking deploys
4. Verify deployment window:
   - Check if current time is within allowed deploy window
   - Validate against change freeze periods

**Outputs**:
- `pre_check_status`: `pass` | `fail`
- `blocking_issues`: List of issues preventing deployment
- `proceed_to_build`: `true` | `false`

**Failure Handling**:
- If pre-checks fail, abort deployment
- Notify relevant team via Prism Console / Slack
- Create incident ticket if critical blocking issue

---

### 2️⃣ Build & Artifact 🏗️

**Responsible**: `Infra.DeployBot` + CI System

**Inputs**:
- `commit_sha`: From pre-checks
- `build_config`: Environment-specific build configuration

**Actions**:
1. Trigger build pipeline:
   - Build Docker image or deployment artifact
   - Tag with version: `{service}-{env}-{sha}-{timestamp}`
2. Run unit tests:
   - Execute full test suite
   - Generate test reports
3. Run integration tests:
   - Test against mocked/test dependencies
   - Validate API contracts
4. Push artifact to registry:
   - Store Docker image in container registry
   - Record artifact metadata in deployment log

**Outputs**:
- `artifact_id`: Unique identifier for the build artifact
- `artifact_url`: Location of the artifact
- `test_results`: Summary of test execution
- `build_status`: `success` | `failed`

**Failure Handling**:
- If build fails, abort deployment
- Notify development team
- Link to build logs and test reports

---

### 3️⃣ Staging Deploy 🌱

**Responsible**: `Infra.DeployBot` via `blackroad-os-operator`

**Inputs**:
- `artifact_id`: From build step
- `environment`: `staging`
- `deployment_strategy`: `rolling` | `blue-green` | `canary`

**Actions**:
1. Invoke `infra.deploy_service` job via Operator:
   ```yaml
   job_id: infra.deploy_service
   params:
     service_id: blackroad-os-api
     environment: staging
     artifact_id: {artifact_id}
     strategy: rolling
   ```
2. Monitor deployment progress:
   - Track pod/container rollout
   - Watch for startup errors
3. Run automated health checks:
   - `/health` endpoint responds with 200
   - `/version` endpoint returns expected version
4. Execute smoke tests:
   - Run `infra.run_smoke_tests` job
   - Validate core API endpoints
   - Check database connectivity

**Outputs**:
- `deployment_id`: Unique identifier for this deployment
- `staging_status`: `healthy` | `degraded` | `failed`
- `health_check_results`: Detailed health metrics
- `smoke_test_results`: Test execution summary

**Failure Handling**:
- If deployment fails, auto-rollback to previous version
- If health checks fail, alert oncall engineer
- Do not proceed to production

---

### 4️⃣ Approval Gate 🚦

**Responsible**: `Infra.OncallEngineer` or automated based on metrics

**Inputs**:
- `staging_status`: From staging deploy
- `smoke_test_results`: From staging tests
- `deployment_id`: From staging deploy

**Actions**:
1. Review staging deployment metrics:
   - Error rates (target: < 0.1%)
   - Response times (p95, p99)
   - Resource utilization
2. Check for anomalies:
   - Compare against baseline metrics
   - Review recent logs for errors/warnings
3. Make approval decision:
   - **Auto-approve** if all metrics green and no anomalies
   - **Manual review** if metrics show slight degradation
   - **Reject** if clear issues detected

**Outputs**:
- `approval_status`: `approved` | `rejected` | `needs_review`
- `approver`: Agent/human who approved
- `approval_timestamp`: When approval was granted

**Failure Handling**:
- If rejected, halt deployment
- Create follow-up tasks for issues found
- Notify development team

---

### 5️⃣ Production Deploy 🌍

**Responsible**: `Infra.DeployBot` via `blackroad-os-operator`

**Inputs**:
- `artifact_id`: Same artifact deployed to staging
- `environment`: `production`
- `deployment_strategy`: `canary` (recommended) or `rolling`
- `approval_status`: Must be `approved`

**Actions**:
1. Invoke `infra.deploy_service` job for production:
   ```yaml
   job_id: infra.deploy_service
   params:
     service_id: blackroad-os-api
     environment: production
     artifact_id: {artifact_id}
     strategy: canary
     canary_percentage: 10
   ```
2. Progressive rollout (if canary):
   - Deploy to 10% of instances
   - Monitor for 5-10 minutes
   - If stable, proceed to 50%
   - If stable, proceed to 100%
3. Monitor key metrics continuously:
   - Request rate
   - Error rate (4xx, 5xx)
   - Latency (p50, p95, p99)
   - Database query performance
4. Watch for alerts:
   - Any triggered alerts should pause rollout

**Outputs**:
- `production_deployment_id`: Unique identifier
- `rollout_status`: `in_progress` | `completed` | `paused` | `rolled_back`
- `production_health`: Current health status

**Failure Handling**:
- If error rate spikes, pause and investigate
- If critical failure, auto-rollback
- If rollback fails, escalate to P0 incident

---

### 6️⃣ Post-Deploy Verification 🔍

**Responsible**: `Infra.SmokeTester` (automated)

**Inputs**:
- `production_deployment_id`: From production deploy
- `expected_version`: Version that should be running

**Actions**:
1. Verify version deployment:
   - Check `/version` endpoint returns expected version
   - Confirm all instances updated
2. Run comprehensive smoke tests:
   - Execute `jobs/health-check-jobs.yml` suite
   - Test critical user journeys:
     - Authentication flow
     - Core API operations
     - Data read/write operations
3. Monitor metrics over 15-30 minutes:
   - Compare to baseline pre-deployment
   - Look for anomalies:
     - Increased error rates
     - Latency spikes
     - Unusual traffic patterns
4. Check logs:
   - Review error logs for new error patterns
   - Validate expected log entries present

**Outputs**:
- `verification_status`: `passed` | `failed` | `degraded`
- `metric_comparison`: Before/after metrics
- `issues_detected`: List of any problems found

**Failure Handling**:
- If verification fails, consider rollback
- If degraded, monitor closely and be ready to rollback
- Alert oncall engineer for manual review

---

### 7️⃣ Record & Archive 📝

**Responsible**: `Infra.DeployBot`

**Inputs**:
- `deployment_id`: From production deploy
- `artifact_id`: Deployed artifact
- `verification_status`: From post-deploy verification

**Actions**:
1. Update deployment registry:
   - Record deployment in Prism Console
   - Link to commit, PR, and infra snapshot
2. Update change log:
   - Document what changed
   - Note any configuration changes
   - Record rollback procedures if custom
3. Archive deployment artifacts:
   - Store deployment metadata
   - Keep artifacts for rollback (retention: 30 days)
4. Notify stakeholders:
   - Send deployment summary to team channels
   - Update status page if applicable

**Outputs**:
- `deployment_record_id`: Permanent record identifier
- `archive_location`: Where artifacts are stored
- `changelog_updated`: `true` | `false`

---

## Rollback Procedure

If deployment fails at any stage or issues are detected post-deployment:

1. Invoke `workflows/rollback.md`
2. Reference this deployment via `deployment_id`
3. Target rollback to last known good version
4. Follow same health check and verification process

---

## Metrics to Monitor

During and after deployment, monitor:

- **Error Rates**: 4xx, 5xx responses
- **Latency**: p50, p95, p99 response times
- **Throughput**: Requests per second
- **Resource Usage**: CPU, memory, disk
- **Database**: Query performance, connection pool
- **External Dependencies**: API call success rates

**Thresholds** (trigger rollback if exceeded):
- Error rate > 1%
- p99 latency > 2x baseline
- 5xx errors > 0.5%

---

## Related Workflows

- `workflows/rollback.md` - Rollback procedure
- `workflows/smoke-tests.md` - Smoke test definitions
- `workflows/change-management.md` - Change approval process

## Related Jobs

- `jobs/operator-jobs.yml` - `infra.deploy_service`
- `jobs/health-check-jobs.yml` - Health and smoke tests

## Related Runbooks

- `runbooks/incident-5xx-spike.md` - If 5xx errors spike during deploy
- `runbooks/incident-high-cpu.md` - If resource issues after deploy
