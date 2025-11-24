# 🔧 Deploy Operator Service Workflow

**Service**: `blackroad-os-operator`  
**Owner**: Infra Team  
**Automation Level**: High (with mandatory manual approval for production)

---

## Overview

The Operator is the **core job execution engine** for BlackRoad OS. Deploying it requires extra caution as it orchestrates other services' deployments. This workflow ensures the Operator itself is deployed safely without disrupting ongoing operations.

---

## Prerequisites

- ✅ CI pipeline is green on the target branch
- ✅ No critical jobs currently running in the Operator
- ✅ `blackroad-os-infra` config is up to date
- ✅ Staging Operator has been running successfully for 24+ hours
- ✅ Manual approval from Infra Team Lead

---

## Workflow Steps

### 1️⃣ Pre-Checks ✅

**Responsible**: `Infra.OncallEngineer` (manual trigger required)

**Inputs**:
- `branch`: Git branch to deploy
- `commit_sha`: Specific commit SHA
- `target_environment`: Initially `staging`

**Actions**:
1. Verify CI status for the commit
2. Check current Operator health:
   - Query job queue status
   - Confirm no stuck or failed jobs
   - Verify no critical jobs scheduled in next 30 minutes
3. Check `blackroad-os-infra` compatibility:
   - Validate infrastructure requirements
   - Confirm job definitions are compatible
4. Review recent changes:
   - Assess risk level of code changes
   - Check for database migrations
   - Verify backward compatibility

**Outputs**:
- `pre_check_status`: `pass` | `fail`
- `active_jobs_count`: Number of currently active jobs
- `proceed_to_build`: `true` | `false`

**Failure Handling**:
- If critical jobs are running, wait until completion
- If pre-checks fail, abort and investigate
- Create incident ticket for blocking issues

---

### 2️⃣ Build & Test 🏗️

**Responsible**: CI System + `Infra.DeployBot`

**Inputs**:
- `commit_sha`: From pre-checks
- `build_config`: Operator-specific build configuration

**Actions**:
1. Build Operator application:
   - Build Docker image
   - Tag: `blackroad-os-operator-{env}-{sha}-{timestamp}`
2. Run comprehensive test suite:
   - Unit tests
   - Integration tests (with mock job execution)
   - Job queue tests
   - Worker pool tests
3. Run security scans:
   - Container image scanning
   - Dependency vulnerability check
4. Push artifact to registry

**Outputs**:
- `artifact_id`: Unique build identifier
- `test_results`: Complete test report
- `security_scan_results`: Vulnerability report
- `build_status`: `success` | `failed`

**Failure Handling**:
- If any tests fail, abort deployment
- If security issues found (high/critical), block deployment
- Notify Infra team

---

### 3️⃣ Staging Deploy 🌱

**Responsible**: `Infra.DeployBot` with manual coordination

**Inputs**:
- `artifact_id`: From build step
- `environment`: `staging`

**Actions**:
1. **Graceful shutdown** of current staging Operator:
   - Stop accepting new jobs
   - Wait for active jobs to complete (timeout: 10 minutes)
   - Drain job queue or transfer to backup instance
2. Deploy new version:
   - Use blue-green deployment strategy
   - Deploy to new instances
   - Keep old instances running initially
3. Start new Operator instances:
   - Initialize job queue
   - Start worker pools
   - Connect to database and message queues
4. Health verification:
   - `/health` endpoint responds
   - `/metrics` shows healthy state
   - Job queue is accessible
5. Smoke test job execution:
   - Submit test job: `infra.test_job`
   - Verify job is picked up and executed
   - Confirm job completion callback works
6. Switch traffic to new instances:
   - Update load balancer / service discovery
   - Monitor for errors
7. Decommission old instances:
   - After 15 minutes of stable operation

**Outputs**:
- `deployment_id`: Staging deployment identifier
- `staging_status`: `healthy` | `degraded` | `failed`
- `jobs_executed`: Number of test jobs successfully run

**Failure Handling**:
- If deployment fails, keep old instances running
- If job execution fails, investigate before proceeding
- Do not proceed to production if staging isn't stable

---

### 4️⃣ Staging Validation Period ⏱️

**Responsible**: `Infra.OncallEngineer` + `Infra.SmokeTester`

**Inputs**:
- `deployment_id`: From staging deploy
- `validation_duration`: Minimum 24 hours (recommended)

**Actions**:
1. Monitor Operator performance over 24-48 hours:
   - Job execution success rate (target: > 99%)
   - Job queue latency
   - Worker pool utilization
   - Error rates
2. Run varied job workloads:
   - Different job types
   - High concurrency scenarios
   - Long-running jobs
   - Priority queue handling
3. Test failure scenarios:
   - Job retry logic
   - Worker failure handling
   - Queue overflow behavior
4. Review logs for anomalies:
   - Unexpected errors
   - Performance warnings
   - Resource constraints

**Outputs**:
- `validation_status`: `passed` | `failed`
- `issues_found`: List of issues (if any)
- `recommendation`: `proceed` | `hold` | `rollback`

**Failure Handling**:
- If critical issues found, rollback staging
- If minor issues, assess risk before production deploy
- Document all findings

---

### 5️⃣ Production Approval Gate 🚦

**Responsible**: Infra Team Lead (human approval required)

**Inputs**:
- `validation_status`: From staging validation
- `deployment_id`: Staging deployment ID
- `change_summary`: Summary of what's changing

**Actions**:
1. Review staging validation report:
   - Metrics comparison
   - Issue list
   - Test results
2. Assess production readiness:
   - Risk evaluation
   - Rollback plan verification
   - Team availability (for monitoring)
3. Choose deployment window:
   - Low-traffic period preferred
   - Ensure oncall coverage
   - Avoid change freeze periods
4. Manual approval sign-off:
   - Record approver and timestamp
   - Document any special instructions

**Outputs**:
- `approval_status`: `approved` | `rejected` | `deferred`
- `approver`: Name of team lead
- `deployment_window`: Scheduled time for production deploy

**Failure Handling**:
- If rejected, document reasons
- Create tasks for addressing blockers
- Reschedule when ready

---

### 6️⃣ Production Deploy 🌍

**Responsible**: `Infra.OncallEngineer` + `Infra.DeployBot`

**Inputs**:
- `artifact_id`: Same artifact from staging
- `environment`: `production`
- `approval_status`: Must be `approved`
- `deployment_window`: Scheduled time

**Actions**:
1. **Pre-deployment freeze** (optional):
   - Temporarily pause new job submissions
   - Or use backup Operator for new jobs
2. **Blue-green deployment**:
   - Deploy new Operator instances (green)
   - Keep old instances running (blue)
3. **Gradual traffic shift**:
   - Route 10% of new jobs to green
   - Monitor for 10 minutes
   - If stable, route 50%
   - Monitor for 10 minutes
   - If stable, route 100%
4. **Job queue migration** (if needed):
   - Ensure jobs in progress complete on blue
   - New jobs go to green
5. Health monitoring:
   - Job execution rates
   - Queue depths
   - Error rates
   - Worker health
6. **Decommission blue** after stability confirmed:
   - Wait 30 minutes minimum
   - Drain remaining jobs
   - Shutdown old instances

**Outputs**:
- `production_deployment_id`: Production deployment identifier
- `rollout_status`: Current rollout state
- `production_health`: Health metrics

**Failure Handling**:
- If errors spike, pause rollout
- If critical failure, immediate rollback to blue
- If rollback fails, escalate to P0 incident
- Keep old instances available for quick rollback

---

### 7️⃣ Post-Deploy Monitoring 🔍

**Responsible**: `Infra.OncallEngineer` + automated monitoring

**Inputs**:
- `production_deployment_id`: From production deploy

**Actions**:
1. Intensive monitoring for first 2 hours:
   - Job execution success rate
   - Queue processing latency
   - Worker pool health
   - Database connection pool
   - Memory and CPU usage
2. Execute test jobs:
   - Submit various job types
   - Verify completion
   - Check result accuracy
3. Monitor dependent services:
   - Services that rely on Operator
   - Check if they're affected
4. Compare metrics to baseline:
   - Pre-deployment vs post-deployment
   - Look for regressions

**Outputs**:
- `monitoring_status`: `normal` | `degraded` | `critical`
- `metric_comparison`: Before/after analysis
- `issues_detected`: List of problems (if any)

**Failure Handling**:
- If degraded, investigate immediately
- If critical, trigger rollback
- Document all anomalies

---

### 8️⃣ Record & Archive 📝

**Responsible**: `Infra.DeployBot`

**Inputs**:
- `production_deployment_id`: From production deploy
- `monitoring_status`: From post-deploy monitoring

**Actions**:
1. Update deployment registry in Prism Console
2. Document deployment:
   - Commit and PR links
   - Approval trail
   - Deployment timeline
   - Issues encountered
3. Archive deployment artifacts:
   - Keep for 60 days (longer than regular services)
4. Update runbooks if needed:
   - New operational procedures
   - Changed job specifications
5. Team notification:
   - Deployment success announcement
   - Link to deployment record

**Outputs**:
- `deployment_record_id`: Permanent record
- `archive_location`: Artifact storage location

---

## Rollback Procedure

**Critical**: Operator rollback must be faster than regular services

1. Keep old instances running during initial rollout
2. If rollback needed, re-route traffic to old instances
3. Verify job execution on old version
4. Investigate issue with new version
5. Follow `workflows/rollback.md` for detailed steps

**Rollback Time Target**: < 5 minutes

---

## Special Considerations

### Job Queue Handling
- Ensure no job data loss during deployment
- Use persistent job queue (database-backed)
- Test job queue migration in staging

### Worker Pools
- Consider worker pool draining strategy
- Plan for graceful worker shutdown
- Monitor worker restart behavior

### Database Migrations
- Test migrations thoroughly in staging
- Ensure backward compatibility
- Have migration rollback script ready

### Message Queues
- Verify message queue connectivity
- Test message handling during switchover
- Monitor for message loss

---

## Metrics to Monitor

- **Job Execution Rate**: Jobs completed per minute
- **Job Success Rate**: % of jobs completing successfully
- **Queue Latency**: Time from job submission to execution
- **Worker Health**: % of healthy workers
- **Error Rate**: Failed jobs / total jobs
- **Resource Usage**: CPU, memory per worker

**Critical Thresholds**:
- Job success rate < 95%: Investigate
- Job success rate < 90%: Consider rollback
- Queue latency > 5x baseline: Alert oncall
- Worker health < 80%: Immediate attention

---

## Related Workflows

- `workflows/rollback.md` - Emergency rollback
- `workflows/change-management.md` - Change approval

## Related Jobs

- `jobs/operator-jobs.yml` - Job definitions that Operator executes
- `jobs/health-check-jobs.yml` - Operator health validation

## Related Runbooks

- `runbooks/incident-operator-failure.md` - Operator service failure
- `runbooks/incident-job-queue-stuck.md` - Job queue issues
