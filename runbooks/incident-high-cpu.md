# 🔥 Incident Runbook: High CPU Usage

**Severity**: P2-P1 (May escalate to P0 if causes outage)  
**Owner**: Infra Oncall  
**Response Time**: < 15 minutes

---

## Overview

High CPU usage can lead to slow response times, request timeouts, and eventually service unavailability. This runbook addresses sustained high CPU usage on application or infrastructure instances.

**High CPU indicates**:
- Inefficient code or algorithms
- Unexpected traffic spike
- Resource-intensive operations
- CPU-bound background jobs
- Infinite loops or runaway processes

---

## Detection & Alerting 📊

### Trigger Conditions

Alert when:
- **CPU usage > 80%** sustained for 5+ minutes
- **CPU usage > 90%** sustained for 2+ minutes
- **CPU usage 100%** for any duration
- **Response time degradation** correlating with CPU spike

### Alert Sources

- Infrastructure monitoring (CloudWatch, Datadog, etc.)
- Prism Console metrics
- Auto-scaling events
- Performance degradation alerts

---

## Response Steps

### 1️⃣ Acknowledge & Assess (0-3 minutes) ⏱️

**Actions**:

1. **Acknowledge alert** in monitoring system

2. **Quick assessment**:
   - Which service/instances affected?
   - Current CPU percentage?
   - How long has it been elevated?
   - Are users experiencing issues?

3. **Check for immediate impact**:
   - Error rate elevated?
   - Response times degraded?
   - Requests timing out?

4. **Determine severity**:
   - **P0**: CPU at 100%, service degraded/down
   - **P1**: CPU > 90%, performance impacted
   - **P2**: CPU 80-90%, no user impact yet

---

### 2️⃣ Immediate Mitigation (3-10 minutes) 🚑

**Priority**: Restore service health first, investigate later

#### Quick Win: Scale Horizontally

1. **Add more instances** (if auto-scaling not handling):
   ```bash
   # Increase instance count
   # Via infrastructure management or cloud provider console
   ```
   - Spread load across more instances
   - Should provide immediate relief

2. **Verify scaling helps**:
   - CPU per instance should decrease
   - Response times should improve

**If scaling doesn't help** → Likely inefficient code or runaway process

---

#### Identify CPU-Intensive Process

3. **SSH into affected instance** (or use monitoring):
   ```bash
   # Check processes by CPU usage
   top -o %CPU
   # or
   htop
   ```

4. **Identify culprit**:
   - Application process using 90%+?
   - Specific background job?
   - Unexpected process (virus, crypto miner)?

5. **Quick actions based on finding**:
   - **Background job**: Kill the job if safe
   - **Application process**: Restart instance (rolling restart)
   - **Unexpected process**: Kill it, investigate security implications

---

### 3️⃣ Triage & Root Cause (Parallel with mitigation) 🔍

**Actions**:

1. **Check recent changes**:
   - Recent deployments?
   - New features enabled?
   - Configuration changes?
   - Increased traffic?

2. **Analyze application performance**:
   - Use profiler or APM tool
   - Identify hot code paths
   - Look for inefficient queries or loops
   - Check for N+1 query problems

3. **Check for traffic anomalies**:
   - Sudden traffic spike?
   - DDoS or abuse pattern?
   - Specific endpoint getting hammered?
   - Bot traffic?

4. **Review background jobs**:
   - Any CPU-intensive jobs running?
   - Jobs scheduled at same time?
   - Job frequency increased?

5. **Check external factors**:
   - Cloud provider issues?
   - Noisy neighbor (shared resources)?
   - Network saturation?

---

### 4️⃣ Targeted Mitigation 🎯

Based on root cause:

#### Scenario A: Recent Code Deployment

**If** recent deploy correlates with CPU spike:

1. **Rollback** following `workflows/rollback.md`
2. **Monitor** CPU after rollback
3. **Investigate** what in the new code caused high CPU
4. **Fix** and re-deploy with testing

---

#### Scenario B: Traffic Spike

**If** legitimate traffic increase:

1. **Scale up** to handle load:
   - Horizontal: More instances
   - Vertical: Larger instances (if CPU-bound task)

2. **Optimize** if needed:
   - Add caching for expensive operations
   - Optimize database queries
   - Add rate limiting if appropriate

3. **Plan capacity** for sustained higher traffic

**If** illegitimate traffic (abuse/DDoS):

1. **Implement rate limiting**:
   - Per IP
   - Per user
   - Per endpoint

2. **Block** abusive IPs or patterns

3. **Enable** DDoS protection if available

---

#### Scenario C: Inefficient Code Path

**If** specific code causing high CPU:

1. **Identify** the expensive operation:
   - Use profiler
   - Check APM slow transaction traces
   - Review recent code changes

2. **Short-term mitigation**:
   - Disable feature if possible
   - Add caching
   - Rate limit the expensive endpoint

3. **Long-term fix**:
   - Optimize algorithm
   - Move to background job
   - Pre-compute results
   - Add database indexes

---

#### Scenario D: Background Job Issue

**If** background job consuming CPU:

1. **Identify the job**:
   - Check job queue/scheduler
   - Look for long-running jobs

2. **Immediate action**:
   - Kill the job if safe
   - Pause job queue temporarily
   - Reduce job concurrency

3. **Fix**:
   - Optimize job logic
   - Break into smaller chunks
   - Add throttling
   - Schedule during off-peak hours

---

#### Scenario E: Runaway Process / Infinite Loop

**If** process stuck in loop:

1. **Kill the process**:
   - Restart affected instances
   - Or kill specific process

2. **Investigate**:
   - Review stack trace
   - Check for deadlock
   - Look for infinite loop in code

3. **Hotfix**:
   - Add timeout
   - Add circuit breaker
   - Fix logic error

---

### 5️⃣ Verify Resolution ✅

**Actions**:

1. **Monitor CPU levels**:
   - Should return to normal (< 50%)
   - Stable for 15+ minutes

2. **Check application health**:
   - Response times back to normal
   - Error rate normal
   - Throughput normal

3. **Run smoke tests**:
   - Execute `workflows/smoke-tests.md`
   - Verify critical paths working

4. **Monitor for recurrence**:
   - Watch for 30-60 minutes
   - Ensure CPU stays stable

---

### 6️⃣ Document & Follow-Up 📝

**Actions**:

1. **Document incident**:
   - What triggered high CPU
   - Impact on users
   - Mitigation steps taken
   - Resolution time

2. **Create follow-up tasks**:
   - Fix root cause (if temporary mitigation used)
   - Add monitoring for specific code paths
   - Optimize inefficient code
   - Improve alerting
   - Load testing for similar scenarios

3. **Update runbooks** with learnings

4. **Schedule postmortem** if P0/P1

---

## Common CPU Issues & Solutions

### Issue: N+1 Query Problem
- **Symptom**: High CPU when loading lists of items
- **Solution**: Use eager loading, batch queries

### Issue: Inefficient Sorting/Filtering
- **Symptom**: CPU spikes when sorting large datasets
- **Solution**: Sort in database, add indexes, use pagination

### Issue: Heavy Serialization
- **Symptom**: CPU high when returning large JSON responses
- **Solution**: Paginate responses, optimize serialization, use streaming

### Issue: Regex or String Operations
- **Symptom**: CPU high during text processing
- **Solution**: Optimize regex, cache results, use more efficient algorithms

### Issue: Cryptographic Operations
- **Symptom**: CPU high during password hashing, encryption
- **Solution**: Use async operations, batch processing, rate limit

### Issue: Memory Garbage Collection
- **Symptom**: CPU spikes periodically (especially Java, Node.js)
- **Solution**: Tune GC settings, reduce memory pressure, fix memory leaks

---

## Prevention Strategies

1. **Performance testing**:
   - Load test before deployment
   - Profile code for hot paths
   - Benchmark critical operations

2. **Code review checklist**:
   - Efficient algorithms used?
   - Database queries optimized?
   - Caching where appropriate?
   - Pagination for large datasets?

3. **Monitoring**:
   - Set up CPU alerts
   - Track CPU by service/endpoint
   - Monitor trends over time

4. **Auto-scaling**:
   - Configure properly
   - Set appropriate thresholds
   - Test scaling behavior

5. **Resource limits**:
   - Set request timeouts
   - Limit concurrent operations
   - Use circuit breakers

---

## Tools & Commands

### Check CPU Usage
```bash
# Overall CPU usage
top

# Per-process CPU
ps aux | sort -nrk 3,3 | head -n 5

# CPU usage over time
sar -u 1 10

# Application-specific (Node.js example)
node --prof app.js
# Then analyze with --prof-process
```

### Profiling
```bash
# Node.js profiling
node --inspect app.js
# Connect with Chrome DevTools

# Python profiling
python -m cProfile -o output.prof script.py

# Ruby profiling
ruby-prof script.rb
```

### Monitoring
- Prism Console CPU dashboard
- APM tool (New Relic, Datadog, etc.)
- Cloud provider metrics (CloudWatch, etc.)

---

## Escalation

Escalate if:
- Scaling doesn't reduce CPU
- Unknown process causing high CPU (security concern)
- CPU causing complete service outage
- Cannot identify root cause within 30 minutes

---

## Related Runbooks

- `runbooks/incident-5xx-spike.md` - May be caused by high CPU
- `runbooks/incident-memory-leak.md` - Often correlated with CPU issues
- `runbooks/incident-db-latency.md` - Database issues can cause CPU spikes

## Related Workflows

- `workflows/rollback.md` - If deployment caused issue
- `workflows/smoke-tests.md` - Verification after resolution
