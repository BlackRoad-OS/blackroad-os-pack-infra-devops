# ⏪ Rollback Workflow

**Purpose**: Safe, fast rollback to last known good version  
**Owner**: Infra Team  
**Trigger**: Deployment issues, incidents, critical bugs  
**Priority**: P0/P1 (urgent)

---

## Overview

This workflow provides a standardized, repeatable process for rolling back any service to a previous stable version. Speed and safety are paramount.

**Target Rollback Time**: < 10 minutes for most services

---

## When to Trigger Rollback

Rollback should be initiated when:

- 🚨 **Error rate spike** (> 1% for critical services)
- 🐛 **Critical bug** discovered in production
- 📉 **Performance degradation** (> 2x baseline latency)
- ⚠️ **Health check failures** after deployment
- 🔥 **Cascading failures** affecting multiple services
- 📱 **User-reported critical issues** (authentication, payment, data loss)

**Decision Criteria**: When in doubt, rollback. Investigation can happen after stability is restored.

---

## Prerequisites

- ✅ Last known good version is identified
- ✅ Deployment artifacts for rollback version exist
- ✅ Oncall engineer is available to monitor
- ✅ Communication channels are open (Slack, status page)

---

## Workflow Steps

### 1️⃣ Declare Rollback 🚨

**Responsible**: `Infra.OncallEngineer` or `Infra.IncidentCommander`

**Inputs**:
- `current_deployment_id`: Currently deployed version (the broken one)
- `service_id`: Which service to rollback
- `reason`: Why rollback is needed

**Actions**:
1. Declare rollback in appropriate channels:
   - Post in #incidents or #oncall channel
   - Update Prism Console incident status
2. Notify relevant teams:
   - Service owner team
   - Platform team
   - Support team (if customer-facing)
3. Document decision:
   - Record reason for rollback
   - Note time of declaration
   - Link to metrics/logs showing the problem

**Outputs**:
- `rollback_initiated`: Timestamp
- `rollback_id`: Unique identifier for this rollback
- `incident_id`: Link to incident record (if exists)

---

### 2️⃣ Identify Last Known Good Version 📌

**Responsible**: `Infra.DeployBot` (automated) or `Infra.OncallEngineer` (manual)

**Inputs**:
- `service_id`: Service being rolled back
- `current_deployment_id`: Current broken deployment

**Actions**:
1. Query deployment registry:
   - Fetch deployment history for service
   - Identify deployments before current one
2. Determine last known good:
   - **Option A**: Previous deployment (if recent deploy broke it)
   - **Option B**: Last deployment with healthy metrics
   - **Option C**: Specific version if known good state
3. Verify artifact availability:
   - Check that deployment artifacts still exist
   - Confirm Docker image / build artifacts accessible
4. Check compatibility:
   - Ensure no breaking database migrations since then
   - Verify infra compatibility
   - Check for external dependency changes

**Outputs**:
- `rollback_target_deployment_id`: Deployment to rollback to
- `rollback_target_version`: Version identifier
- `rollback_artifact_id`: Artifact to deploy
- `compatibility_check`: `pass` | `warning` | `fail`

**Failure Handling**:
- If artifact missing, escalate (may need emergency rebuild)
- If compatibility issues, choose different version or accept risk

---

### 3️⃣ Prepare Rollback ⚙️

**Responsible**: `Infra.DeployBot`

**Inputs**:
- `rollback_artifact_id`: From previous step
- `service_id`: Service being rolled back
- `environment`: `production` (usually)

**Actions**:
1. Retrieve rollback artifact:
   - Pull from artifact registry
   - Verify integrity (checksum)
2. Validate rollback package:
   - Ensure all required components present
   - Check configuration files
3. Prepare deployment:
   - Set up deployment configuration
   - Configure for fast rollback (skip non-critical steps)
4. Create rollback job:
   - Prepare `infra.deploy_service` job with rollback parameters
   - Set high priority
   - Disable approval gates (emergency mode)

**Outputs**:
- `rollback_job_id`: Job prepared for execution
- `rollback_ready`: `true` | `false`
- `estimated_rollback_time`: Expected time to complete

---

### 4️⃣ Execute Rollback 🔄

**Responsible**: `Infra.DeployBot` via `blackroad-os-operator`

**Inputs**:
- `rollback_job_id`: From prepare step
- `service_id`: Service being rolled back
- `rollback_artifact_id`: Artifact to deploy

**Actions**:
1. **Stop new traffic to broken version** (if possible):
   - Route traffic to healthy instances
   - Or take broken instances out of load balancer
2. **Deploy rollback version**:
   - Execute via `infra.deploy_service` job
   - Use fast deployment strategy (atomic if possible)
   - Priority: speed over progressive rollout
3. **Deployment strategies by service type**:
   - **API/Backend**: Blue-green instant switch
   - **Web/Frontend**: Re-upload previous build, invalidate CDN
   - **Operator**: Switch traffic back to previous instances
   - **Database**: Rollback migration (if safe) or keep forward-compatible
4. **Monitor deployment progress**:
   - Track rollout status
   - Watch for errors during rollback
5. **Update traffic routing**:
   - Switch 100% traffic to rolled-back version
   - Verify traffic is flowing

**Outputs**:
- `rollback_deployment_id`: New deployment ID for rollback
- `rollback_status`: `in_progress` | `completed` | `failed`
- `traffic_switched`: Timestamp when traffic switched

**Failure Handling**:
- If rollback deployment fails:
  - Try previous version if different from rollback target
  - Escalate to P0 incident
  - Consider manual intervention
- If traffic switch fails:
  - Manual routing update
  - Use backup infrastructure if available

---

### 5️⃣ Verify Rollback ✅

**Responsible**: `Infra.SmokeTester` + `Infra.OncallEngineer`

**Inputs**:
- `rollback_deployment_id`: From execute step
- `service_id`: Service that was rolled back

**Actions**:
1. **Immediate health checks**:
   - `/health` endpoint responds
   - `/version` shows expected version
   - Service is in rotation
2. **Run smoke tests**:
   - Execute `jobs/health-check-jobs.yml`
   - Test critical paths
   - Verify core functionality
3. **Monitor metrics** (first 5-10 minutes):
   - Error rate should decrease
   - Latency should return to normal
   - Resource usage should stabilize
4. **Compare to baseline**:
   - Error rate back to < 0.1%?
   - Latency at pre-incident levels?
   - Throughput normal?
5. **Check dependencies**:
   - Services depending on this one are healthy
   - No cascading issues

**Outputs**:
- `verification_status`: `passed` | `failed` | `partial`
- `metrics_comparison`: Before/after metrics
- `rollback_successful`: `true` | `false`

**Failure Handling**:
- If rollback verification fails:
  - Investigate why old version also broken
  - May indicate infrastructure or external issue
  - Escalate incident
  - Consider emergency hotfix or deeper rollback

---

### 6️⃣ Monitor & Stabilize 📊

**Responsible**: `Infra.OncallEngineer`

**Inputs**:
- `rollback_deployment_id`: Rolled-back version
- `verification_status`: From verification step

**Actions**:
1. **Extended monitoring** (30-60 minutes):
   - Continuously watch key metrics
   - Monitor for any delayed issues
   - Check user reports / support tickets
2. **Gradual confidence building**:
   - 0-10 min: Intensive monitoring
   - 10-30 min: Regular monitoring
   - 30-60 min: Standard monitoring
3. **Verify stability**:
   - No error rate increase
   - No new alerts triggered
   - User experience normal
4. **Declare stability** when:
   - Metrics stable for 30+ minutes
   - No new incidents
   - Service performing normally

**Outputs**:
- `stability_status`: `stable` | `unstable` | `degraded`
- `monitoring_notes`: Observations during monitoring

---

### 7️⃣ Cleanup & Communicate 📝

**Responsible**: `Infra.OncallEngineer` + `Infra.IncidentCommander`

**Inputs**:
- `rollback_id`: From initial declaration
- `stability_status`: From monitoring step
- `rollback_successful`: From verification

**Actions**:
1. **Update incident status**:
   - Mark incident as resolved (if stable)
   - Or update with current status
2. **Communicate resolution**:
   - Announce rollback success in team channels
   - Update status page (if customer-facing)
   - Notify stakeholders
3. **Document rollback**:
   - Record in deployment registry
   - Link to incident
   - Note reason for rollback
   - Document time taken
4. **Decommission broken version**:
   - Remove broken instances
   - Keep artifacts for investigation
5. **Schedule follow-up**:
   - Create tasks for root cause analysis
   - Plan fix for original issue
   - Schedule re-deployment when ready

**Outputs**:
- `rollback_record_id`: Permanent record
- `incident_updated`: `true` | `false`
- `followup_tasks`: List of follow-up items

---

### 8️⃣ Post-Rollback Analysis 🔍

**Responsible**: `Infra.PostmortemWriter` + service owner team

**Inputs**:
- `rollback_id`: This rollback's identifier
- `incident_id`: Related incident
- `original_deployment_id`: The deployment that was rolled back

**Actions**:
1. **Gather data**:
   - Deployment logs
   - Error logs from broken version
   - Metrics before/during/after
   - Timeline of events
2. **Root cause analysis**:
   - Why did the deployment break?
   - What was missed in testing?
   - Could it have been caught earlier?
3. **Document lessons learned**:
   - What went well in rollback process
   - What could be improved
   - New checks to add
4. **Create action items**:
   - Improve testing
   - Add monitoring
   - Update deployment checklist
   - Fix the original bug
5. **Update processes**:
   - Improve deploy workflow if needed
   - Add safeguards
   - Update runbooks

**Outputs**:
- `postmortem_doc`: Link to postmortem document
- `action_items`: List of improvements to make

---

## Rollback Time Estimates

**Target times by service type**:

- **Web/Frontend**: 2-5 minutes (re-upload + CDN invalidation)
- **API/Backend**: 5-10 minutes (instance swap or redeploy)
- **Operator**: 10-15 minutes (careful job queue handling)
- **Database**: Variable (depends on migration rollback complexity)

**If rollback exceeds targets**, escalate and investigate infrastructure issues.

---

## Special Cases

### Database Migrations

**Forward-compatible migrations**: No action needed  
**Breaking migrations**: May need to rollback migration
- Have migration rollback script ready
- Test rollback in staging first
- Coordinate with DBA or data team

### Configuration Changes

If config change caused issue:
- Revert configuration via `blackroad-os-infra`
- May not need full deployment rollback
- Faster than full rollback

### External Dependencies

If external API/service caused issue:
- Rollback may not help
- Implement circuit breaker or fallback
- Coordinate with external service provider

### Multi-Service Deployments

If multiple services deployed together:
- Rollback all related services
- Maintain compatibility between services
- Document dependencies

---

## Rollback Decision Tree

```
Issue Detected
├─ Error rate > 5% → Immediate Rollback
├─ Error rate 1-5% → Investigate (5 min), then Rollback if not resolved
├─ Latency > 3x baseline → Immediate Rollback
├─ Critical bug (data loss, security) → Immediate Rollback
├─ Non-critical bug → Evaluate, may hotfix instead
└─ Configuration issue → Revert config, may avoid full rollback
```

---

## Communication Templates

### Rollback Initiation
```
🚨 ROLLBACK INITIATED
Service: {service_id}
From: {current_version}
To: {rollback_version}
Reason: {reason}
Initiated by: {engineer}
```

### Rollback Success
```
✅ ROLLBACK COMPLETE
Service: {service_id}
Version: {rollback_version}
Status: Stable
Downtime: {duration}
Next: Root cause analysis
```

### Rollback Failure
```
⚠️ ROLLBACK FAILED
Service: {service_id}
Status: {current_status}
Action: Escalating to P0
Team: All hands on deck
```

---

## Metrics to Track

For each rollback, track:
- **Time to Decision**: Time from issue detection to rollback decision
- **Rollback Duration**: Time from decision to successful rollback
- **Verification Time**: Time to confirm stability
- **Total Incident Time**: Time from issue to resolution
- **Success Rate**: % of rollbacks that resolved the issue

**Goals**:
- Time to Decision: < 2 minutes
- Rollback Duration: < 10 minutes
- Total Incident Time: < 30 minutes

---

## Related Workflows

- `workflows/deploy-api.md` - API deployment
- `workflows/deploy-operator.md` - Operator deployment
- `workflows/deploy-web.md` - Web deployment

## Related Runbooks

- `runbooks/incident-5xx-spike.md` - Error rate spikes
- `runbooks/incident-high-cpu.md` - Performance issues
- All incident runbooks may reference rollback

## Related Jobs

- `jobs/operator-jobs.yml` - `infra.deploy_service` (used for rollback)
