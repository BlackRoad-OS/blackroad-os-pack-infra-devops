# 🚨 Incident Runbook: 5xx Error Spike

**Severity**: P1 (High) - May escalate to P0 if prolonged  
**Owner**: API Team + Infra Oncall  
**Response Time**: < 5 minutes

---

## Overview

This runbook addresses sudden spikes in 5xx server errors, which indicate backend service failures. Quick response is critical to minimize user impact.

**5xx errors indicate**:
- Server-side application errors
- Infrastructure problems
- Database connection issues
- Timeout or resource exhaustion
- Downstream service failures

---

## Detection & Alerting 📈

### Trigger Conditions

Alert triggers when:
- **5xx error rate > 1%** of total requests (sustained for 2+ minutes)
- **5xx error count > 100** in a 5-minute window
- **Specific endpoint**: > 10% error rate
- **User reports**: Multiple complaints about errors

### Alert Sources

- Prism Console monitoring dashboard
- Application metrics (e.g., Datadog, New Relic, CloudWatch)
- Log aggregation alerts
- External uptime monitoring
- User support tickets

### Initial Alert Information

When alert fires, gather:
- **Error rate**: Current % of 5xx errors
- **Affected services**: Which services are erroring
- **Time started**: When did spike begin
- **Affected endpoints**: Which API routes

---

## Incident Response Steps

### 1️⃣ Acknowledge & Assess (0-2 minutes) ⏱️

**Responsible**: `Infra.OncallEngineer`

**Actions**:

1. **Acknowledge alert**:
   - Acknowledge in monitoring system
   - Post in #incidents channel: "Investigating 5xx spike on {service}"

2. **Quick assessment**:
   - Check Prism Console dashboard
   - Identify scope:
     - Which service(s)?
     - All endpoints or specific ones?
     - All users or subset?
   - Check current error rate

3. **Determine severity**:
   - **P0**: > 10% error rate OR total outage
   - **P1**: 1-10% error rate
   - **P2**: < 1% error rate, isolated

4. **Page additional help if needed**:
   - P0: Page API team lead
   - P1: Notify API team in Slack
   - P2: Handle solo, notify team

**Outputs**:
- Incident acknowledged
- Severity assigned
- Team notified

---

### 2️⃣ Triage (2-5 minutes) 🔍

**Responsible**: `Infra.OncallEngineer` + `Infra.IncidentCommander` (if P0)

**Actions**:

1. **Check recent changes**:
   - Query deployment history (last 2 hours)
   - Review change calendar
   - Check if any changes deployed recently
   - **If recent deploy found**: Consider rollback (skip to Step 3)

2. **Examine error logs**:
   ```bash
   # Check recent error logs
   # Look for patterns: specific error types, affected endpoints
   ```
   - Look for common error messages
   - Identify stack traces
   - Note affected endpoints

3. **Check resource utilization**:
   - CPU usage: Maxed out?
   - Memory: OOM errors?
   - Disk space: Full disk?
   - Network: Connection issues?

4. **Verify dependencies**:
   - Database: Connection errors? Slow queries?
   - External APIs: Third-party service down?
   - Message queues: Backed up?
   - Cache: Redis/Memcached available?

5. **Check infrastructure**:
   - All instances running?
   - Load balancer healthy?
   - Auto-scaling working?
   - Network connectivity?

6. **Identify root cause category**:
   - 🚀 **Recent deployment**: Code or config issue
   - 💾 **Database issue**: Connection, query, deadlock
   - 📊 **Resource exhaustion**: CPU, memory, connections
   - 🌐 **Dependency failure**: External service down
   - 🔧 **Infrastructure**: Instance failure, network issue

**Outputs**:
- Root cause hypothesis
- Evidence supporting hypothesis
- Next action decision

---

### 3️⃣ Mitigate (5-15 minutes) 🧯

**Responsible**: `Infra.OncallEngineer`

Choose mitigation based on root cause:

#### Scenario A: Recent Deployment 🚀

**If** deployment in last 2 hours correlates with spike:

1. **Initiate rollback**:
   - Follow `workflows/rollback.md`
   - Rollback to last known good version
   - Monitor error rate during rollback

2. **Verify rollback helps**:
   - Error rate should decrease within 2-5 minutes
   - If not, may be coincidental - continue investigation

**Expected time to mitigate**: 5-10 minutes

---

#### Scenario B: Database Issue 💾

**If** database errors in logs (connection refused, timeout, deadlock):

1. **Check database health**:
   - Connection pool exhausted?
   - Long-running queries?
   - Deadlocks?
   - Disk full on database?

2. **Immediate actions**:
   - **If connection pool exhausted**: Restart application to reset pool
   - **If long query**: Kill problematic query (if safe)
   - **If deadlock**: Restart affected service or database (last resort)
   - **If disk full**: Free space or scale storage

3. **Scale if needed**:
   - Increase database resources temporarily
   - Add read replicas if read-heavy

**Expected time to mitigate**: 10-20 minutes

---

#### Scenario C: Resource Exhaustion 📊

**If** CPU/memory maxed out:

1. **Scale immediately**:
   - Increase instance count (horizontal scaling)
   - Or increase instance size (vertical scaling)
   - Auto-scaling should handle, but may need manual trigger

2. **Identify resource hog**:
   - Check which process using resources
   - Look for memory leaks
   - Identify expensive operations

3. **Temporary relief**:
   - Restart affected instances (rolling restart)
   - Clear caches if appropriate
   - Disable non-critical features temporarily

**Expected time to mitigate**: 5-15 minutes

---

#### Scenario D: Dependency Failure 🌐

**If** external service is down or slow:

1. **Verify external service status**:
   - Check third-party status pages
   - Test connectivity to external API
   - Check timeout settings

2. **Apply circuit breaker**:
   - If circuit breaker not in code, may need to:
     - Disable feature relying on external service
     - Return cached/fallback data
     - Show degraded experience to users

3. **Coordinate with external service**:
   - Contact third-party support
   - Check for known incidents
   - Request ETA for resolution

**Expected time to mitigate**: Variable (depends on external service)

---

#### Scenario E: Infrastructure Issue 🔧

**If** instances failing or network problems:

1. **Check instance health**:
   - Are all instances running?
   - Any failing health checks?
   - Recent instance terminations?

2. **Replace unhealthy instances**:
   - Terminate and replace failed instances
   - Check why instances failing (resource issue? deployment problem?)

3. **Check network**:
   - Load balancer routing correctly?
   - DNS resolving properly?
   - Firewall/security group rules correct?

**Expected time to mitigate**: 10-20 minutes

---

### 4️⃣ Communicate (Parallel with mitigation) 📣

**Responsible**: `Infra.IncidentCommander` or `Infra.OncallEngineer`

**Actions**:

1. **Update incident channel** (every 5-10 minutes):
   ```
   Status Update: 5xx Spike Incident
   - Current error rate: X%
   - Root cause: [hypothesis]
   - Action taken: [what we did]
   - Next steps: [what we're doing next]
   - ETA to resolution: [estimate]
   ```

2. **Update status page** (if customer-facing):
   - Post incident notice
   - Describe user impact
   - Provide updates every 15-30 minutes

3. **Notify stakeholders**:
   - **P0**: Notify leadership immediately
   - **P1**: Notify product/eng leads
   - **P2**: Team notification only

4. **Coordinate with support team**:
   - Give them talking points for users
   - Provide ETA if available
   - Keep them updated

---

### 5️⃣ Verify Resolution (15-30 minutes) ✅

**Responsible**: `Infra.OncallEngineer`

**Actions**:

1. **Monitor error rate**:
   - Error rate should return to < 0.1%
   - No new error spikes
   - Stable for at least 15 minutes

2. **Run smoke tests**:
   - Execute `workflows/smoke-tests.md`
   - All critical paths should pass

3. **Check metrics**:
   - Response times normal
   - Throughput normal
   - Resource utilization healthy

4. **Verify user experience**:
   - Manually test affected features
   - Check support channels for new complaints
   - Monitor social media if applicable

**Outputs**:
- Error rate back to normal: Yes/No
- Smoke tests pass: Yes/No
- Incident resolved: Yes/No

---

### 6️⃣ Recover & Document (30+ minutes) 📝

**Responsible**: `Infra.OncallEngineer` + `Infra.PostmortemWriter`

**Actions**:

1. **Declare incident resolved**:
   - Post in #incidents: "5xx spike resolved, monitoring for stability"
   - Update status page: "Incident resolved"
   - Thank teams involved

2. **Document timeline**:
   - When detected
   - When acknowledged
   - Actions taken and when
   - When resolved
   - Total duration

3. **Create incident report** (within 24 hours):
   - What happened
   - Root cause
   - Impact (users affected, duration)
   - Mitigation steps taken
   - Why it happened
   - How to prevent recurrence

4. **Schedule postmortem** (for P0/P1):
   - Within 3 business days
   - Include all responders
   - Follow blameless postmortem format

5. **Create follow-up tasks**:
   - Fix root cause (if not fixed)
   - Add monitoring/alerting improvements
   - Add safeguards (circuit breakers, etc.)
   - Update runbooks with learnings
   - Improve tests to catch issue

**Outputs**:
- Incident report published
- Postmortem scheduled
- Follow-up tasks created

---

## Common Patterns & Quick Checks

### Pattern: Gradual Increase
- **Likely**: Memory leak, connection pool leak
- **Action**: Restart instances, investigate leak

### Pattern: Sudden Spike then Steady
- **Likely**: Deployment introduced bug
- **Action**: Rollback immediately

### Pattern: Periodic Spikes
- **Likely**: Scheduled job or cron task causing load
- **Action**: Optimize job, reschedule, or scale during spike

### Pattern: Spike on Specific Endpoint
- **Likely**: Code issue in that endpoint, or abuse
- **Action**: Investigate endpoint code, check for abuse, consider rate limiting

### Pattern: Spike Across All Endpoints
- **Likely**: Infrastructure or dependency issue
- **Action**: Check database, external services, infrastructure

---

## Escalation Criteria

Escalate to P0 and page leadership if:
- Error rate > 10% for > 5 minutes
- Complete service outage
- Mitigation attempts failing
- External visibility (social media, press)
- Data loss or security implications

---

## Tools & Dashboards

- **Prism Console**: Main monitoring dashboard
- **Application Logs**: Check for error details and stack traces
- **Metrics Dashboard**: Error rates, latency, throughput
- **Deployment History**: Recent changes
- **Database Dashboard**: Query performance, connections
- **Infrastructure Dashboard**: Instance health, resource usage

---

## Prevention

To reduce 5xx spike incidents:

1. **Better testing**:
   - Improve integration tests
   - Load testing before deployment
   - Chaos engineering / fault injection

2. **Gradual rollouts**:
   - Use canary deployments
   - Monitor closely during deploy
   - Auto-rollback on error spike

3. **Circuit breakers**:
   - Implement for external dependencies
   - Fail gracefully

4. **Monitoring & alerting**:
   - Alert on early warning signs
   - Track error budgets
   - Dashboard for quick triage

5. **Capacity planning**:
   - Ensure adequate resources
   - Auto-scaling configured correctly
   - Load testing to find limits

---

## Related Workflows

- `workflows/rollback.md` - Rollback procedure
- `workflows/smoke-tests.md` - Verification tests
- `workflows/deploy-api.md` - Deployment process

## Related Runbooks

- `runbooks/incident-high-cpu.md` - Resource issues
- `runbooks/incident-db-latency.md` - Database problems

## Related Jobs

- `jobs/operator-jobs.yml` - Deployment and rollback jobs
- `jobs/health-check-jobs.yml` - Smoke tests
