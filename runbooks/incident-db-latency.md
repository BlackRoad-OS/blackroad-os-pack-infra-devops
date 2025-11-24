# 💾 Incident Runbook: Database Latency

**Severity**: P1-P0 (depending on impact)  
**Owner**: Infra Oncall + Database Team  
**Response Time**: < 10 minutes

---

## Overview

High database latency can cascade into application slowness, timeouts, and service degradation. Quick identification and mitigation is critical.

**Database latency indicates**:
- Slow queries
- Missing indexes
- Lock contention / deadlocks
- Resource exhaustion (CPU, I/O, connections)
- Replication lag
- Hardware issues

---

## Detection & Alerting 📊

### Trigger Conditions

Alert when:
- **Query latency > 1000ms** (p95)
- **Query latency > 500ms** (p99)
- **Connection pool exhaustion**
- **Slow query log entries** for critical queries
- **Application timeouts** due to database

### Alert Sources

- Database monitoring (RDS metrics, CloudWatch, etc.)
- Application performance monitoring
- Prism Console database dashboard
- Slow query logs
- Application error logs (timeout errors)

---

## Response Steps

### 1️⃣ Acknowledge & Assess (0-2 minutes) ⏱️

**Actions**:

1. **Acknowledge alert**

2. **Quick assessment**:
   - Current query latency? (p50, p95, p99)
   - Which database(s) affected?
   - Application impact? (errors, timeouts)
   - How long has latency been elevated?

3. **Check application health**:
   - Error rate spiking?
   - Timeouts increasing?
   - Users reporting issues?

4. **Determine severity**:
   - **P0**: Queries timing out, service down
   - **P1**: High latency, degraded experience
   - **P2**: Elevated but manageable

---

### 2️⃣ Identify Slow Queries (2-5 minutes) 🔍

**Actions**:

1. **Check currently running queries**:
   ```sql
   -- PostgreSQL
   SELECT pid, query, state, query_start, 
          now() - query_start AS duration
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration DESC
   LIMIT 10;

   -- MySQL
   SHOW FULL PROCESSLIST;
   ```

2. **Identify long-running queries**:
   - Queries running > 30 seconds?
   - Same query pattern repeated?
   - Specific table being accessed?

3. **Check slow query log**:
   - Recent slow queries
   - Pattern of slow queries
   - Which queries most frequent?

4. **Check for locks**:
   ```sql
   -- PostgreSQL
   SELECT * FROM pg_locks WHERE NOT granted;

   -- MySQL
   SHOW ENGINE INNODB STATUS;
   ```

---

### 3️⃣ Immediate Mitigation 🚑

Based on findings:

#### Scenario A: Specific Slow Query

**If** one or few queries are slow:

1. **Analyze the query**:
   ```sql
   EXPLAIN ANALYZE <slow_query>;
   ```
   - Missing index?
   - Full table scan?
   - Inefficient join?

2. **Quick fixes**:
   - **Add index** if missing (if safe and fast):
     ```sql
     CREATE INDEX CONCURRENTLY idx_name ON table(column);
     ```
   - **Kill query** if blocking others (last resort):
     ```sql
     -- PostgreSQL
     SELECT pg_terminate_backend(pid);
     
     -- MySQL
     KILL <process_id>;
     ```
   - **Optimize query** in application code

3. **Application-side mitigation**:
   - Add caching for expensive queries
   - Add timeout to prevent long waits
   - Reduce page size / add pagination

---

#### Scenario B: Lock Contention / Deadlock

**If** queries are waiting on locks:

1. **Identify blocking queries**:
   ```sql
   -- PostgreSQL
   SELECT blocked_locks.pid AS blocked_pid,
          blocking_locks.pid AS blocking_pid,
          blocked_activity.query AS blocked_query,
          blocking_activity.query AS blocking_query
   FROM pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
   JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
   WHERE NOT blocked_locks.granted;
   ```

2. **Resolve locks**:
   - **Kill blocking query** (if safe):
     ```sql
     SELECT pg_terminate_backend(<blocking_pid>);
     ```
   - **Restart application** to clear connection locks
   - **Deadlock detection**: Database should auto-resolve, but may need manual intervention

3. **Prevent recurrence**:
   - Review transaction isolation levels
   - Reduce transaction size
   - Acquire locks in consistent order
   - Use optimistic locking where appropriate

---

#### Scenario C: Connection Pool Exhaustion

**If** all connections in use:

1. **Check connection count**:
   ```sql
   -- PostgreSQL
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check max connections
   SHOW max_connections;
   ```

2. **Immediate action**:
   - **Kill idle connections**:
     ```sql
     SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE state = 'idle'
     AND query_start < now() - interval '5 minutes';
     ```
   - **Restart application** to reset connection pool
   - **Increase connection limit** (temporary):
     ```sql
     ALTER SYSTEM SET max_connections = <new_limit>;
     SELECT pg_reload_conf();
     ```

3. **Long-term fix**:
   - Optimize connection pool settings
   - Fix connection leaks in application
   - Implement connection pooling (PgBouncer, etc.)

---

#### Scenario D: Resource Exhaustion

**If** database CPU/I/O maxed out:

1. **Check database resources**:
   - CPU usage > 80%?
   - Disk I/O saturated?
   - Memory low?

2. **Scale database** (if possible):
   - **Vertical scaling**: Increase instance size
   - **Read replicas**: Add replica for read traffic
   - **IOPS**: Increase provisioned IOPS (if cloud)

3. **Reduce load**:
   - Add caching in application
   - Offload reads to replica
   - Defer non-critical background jobs
   - Rate limit expensive operations

---

#### Scenario E: Replication Lag

**If** read replicas lagging:

1. **Check replication lag**:
   ```sql
   -- PostgreSQL
   SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
   ```

2. **Mitigation**:
   - **Route reads to primary** temporarily
   - **Scale up replica** if under-resourced
   - **Reduce write load** if possible

3. **Investigate cause**:
   - Large transaction on primary?
   - Replica under-resourced?
   - Network issues?

---

### 4️⃣ Monitor & Verify (Ongoing) 📊

**Actions**:

1. **Monitor query latency**:
   - Should return to normal within 10-15 minutes
   - Watch for spikes

2. **Check application metrics**:
   - Error rate decreasing?
   - Response times improving?
   - Timeout errors gone?

3. **Verify no side effects**:
   - No data inconsistencies from killed queries?
   - Connection pool healthy?
   - Replication working?

---

### 5️⃣ Root Cause Analysis 🔬

**Actions**:

1. **Analyze slow query patterns**:
   - Commonalities in slow queries?
   - Missing indexes?
   - Data growth issues?

2. **Review recent changes**:
   - New feature with expensive queries?
   - Schema changes?
   - Data import?
   - Configuration changes?

3. **Check long-term trends**:
   - Gradual degradation over time?
   - Correlated with traffic increase?
   - Database size growth?

4. **Identify fixes**:
   - Indexes to add
   - Queries to optimize
   - Schema changes needed
   - Archival/purging needed

---

### 6️⃣ Document & Follow-Up 📝

**Actions**:

1. **Document incident**:
   - Which queries were slow
   - Root cause
   - Mitigation actions
   - Resolution time

2. **Create follow-up tasks**:
   - Add missing indexes
   - Optimize queries
   - Scale database if needed
   - Improve monitoring
   - Add query timeouts
   - Archive old data

3. **Update application code**:
   - Fix inefficient queries
   - Add caching
   - Implement pagination

4. **Database maintenance**:
   - Schedule `VACUUM` / `ANALYZE` (PostgreSQL)
   - Optimize tables (MySQL)
   - Update statistics

---

## Common Database Issues

### N+1 Query Problem
- **Symptom**: Many small queries instead of one larger query
- **Solution**: Use joins or eager loading

### Missing Index
- **Symptom**: Full table scans on large tables
- **Solution**: Add appropriate indexes
- **Check**: `EXPLAIN` shows Seq Scan on large table

### Inefficient Join
- **Symptom**: Slow queries with multiple joins
- **Solution**: Optimize join order, add indexes, denormalize if needed

### Large OFFSET
- **Symptom**: Slow pagination on high page numbers
- **Solution**: Use cursor-based pagination

### SELECT *
- **Symptom**: Slow queries fetching all columns
- **Solution**: Select only needed columns

### Old Statistics
- **Symptom**: Query planner making bad decisions
- **Solution**: Update table statistics (ANALYZE)

---

## Prevention

1. **Query optimization**:
   - Review all queries before deployment
   - Use EXPLAIN to check execution plans
   - Add indexes proactively

2. **Monitoring**:
   - Alert on slow queries
   - Track query performance trends
   - Monitor connection pool usage

3. **Regular maintenance**:
   - VACUUM / ANALYZE (PostgreSQL)
   - Optimize tables (MySQL)
   - Archive old data
   - Update statistics

4. **Capacity planning**:
   - Monitor database growth
   - Plan for scaling before needed
   - Test with production-like data volumes

5. **Code review**:
   - Check for N+1 queries
   - Ensure indexes exist for new queries
   - Verify pagination used for large datasets

---

## Useful Queries

### PostgreSQL

```sql
-- Top slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### MySQL

```sql
-- Slow queries
SELECT * FROM mysql.slow_log
ORDER BY query_time DESC
LIMIT 10;

-- Table sizes
SELECT table_schema, table_name,
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
ORDER BY (data_length + index_length) DESC;
```

---

## Tools

- **Database monitoring**: CloudWatch RDS, Datadog, New Relic
- **Query analyzers**: pgBadger, pt-query-digest
- **Prism Console**: Database dashboard
- **APM tools**: Application traces showing DB calls

---

## Escalation

Escalate to Database Team if:
- Cannot identify slow query cause
- Database-level issue (corruption, replication failure)
- Need schema changes in production
- Considering major database changes

---

## Related Runbooks

- `runbooks/incident-5xx-spike.md` - DB latency can cause 5xx errors
- `runbooks/incident-high-cpu.md` - Slow queries can cause high CPU

## Related Workflows

- `workflows/rollback.md` - If deployment caused DB issues
