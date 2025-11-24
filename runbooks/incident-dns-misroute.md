# 🌐 Incident Runbook: DNS Misroute

**Severity**: P0 (Critical - Service Unavailable)  
**Owner**: Infra Team  
**Response Time**: Immediate (< 2 minutes)

---

## Overview

DNS misrouting prevents users from reaching services entirely. This is a complete outage scenario requiring immediate action.

**DNS issues indicate**:
- Incorrect DNS records
- DNS propagation issues
- DNS provider outage
- Configuration errors
- Expired domains
- DDoS on DNS

---

## Detection & Alerting 🚨

### Symptoms

- **Users cannot reach service** (site not found, connection timeout)
- **External monitoring** shows service unreachable
- **DNS queries failing** or resolving to wrong IP
- **Social media reports** of site being down
- **Support tickets** flooding in

### How to Detect

```bash
# Check DNS resolution
dig app.blackroad.io
nslookup app.blackroad.io

# Check from multiple locations
# Use online tools: whatsmydns.net, dnschecker.org
```

---

## Response Steps

### 1️⃣ Confirm DNS Issue (0-2 minutes) 🔍

**Actions**:

1. **Verify it's DNS**:
   ```bash
   # Check if domain resolves
   dig app.blackroad.io
   
   # Check if IP is reachable directly
   curl -I http://<ip-address>
   
   # If IP works but domain doesn't → DNS issue
   ```

2. **Check what domain resolves to**:
   - Correct IP?
   - Wrong IP?
   - No response?
   - Timeout?

3. **Test from multiple locations**:
   - Different DNS servers (8.8.8.8, 1.1.1.1, ISP)
   - Different geographic regions
   - Multiple devices

4. **Check DNS provider status**:
   - CloudFlare status page
   - Route53 status page
   - Your DNS provider's status

---

### 2️⃣ Immediate Mitigation (2-5 minutes) 🚑

#### Scenario A: Wrong IP Address

**If** domain resolves to incorrect IP:

1. **Update DNS record immediately**:
   - Log into DNS provider (CloudFlare, Route53, etc.)
   - Find A record or CNAME for the domain
   - Update to correct IP address
   - Reduce TTL to 60 seconds (if not already low)

2. **Verify change**:
   ```bash
   # Query authoritative nameserver directly
   dig @ns1.your-dns-provider.com app.blackroad.io
   ```

3. **Flush DNS caches** (if possible):
   - CloudFlare: Purge DNS cache
   - Your local resolver
   - Note: Cannot force global cache flush

**Expected resolution time**: 5-15 minutes (depends on TTL)

---

#### Scenario B: No DNS Record

**If** domain doesn't resolve at all:

1. **Add DNS record**:
   - Log into DNS provider
   - Create A record: `app.blackroad.io → <correct-ip>`
   - Set TTL to 300 seconds initially

2. **Verify record added**:
   ```bash
   dig @<authoritative-nameserver> app.blackroad.io
   ```

3. **Check for typos**:
   - Domain name spelled correctly?
   - Subdomain correct?

**Expected resolution time**: 5-15 minutes

---

#### Scenario C: DNS Provider Outage

**If** DNS provider itself is down:

1. **Check provider status page**

2. **Switch DNS provider** (if critical):
   - Update NS records at domain registrar
   - Point to backup DNS provider
   - Note: NS record changes can take 24-48 hours to propagate

3. **Temporary workaround**:
   - Share IP address directly with users (emergency)
   - Use social media to communicate
   - Set up backup domain if available

**Expected resolution time**: Variable (depends on provider)

---

#### Scenario D: Domain Expired

**If** domain registration expired:

1. **Renew domain immediately**:
   - Log into domain registrar
   - Renew domain (may take hours to restore)

2. **Contact registrar**:
   - Request expedited restoration
   - Explain it's production outage

3. **Prevent recurrence**:
   - Set up auto-renewal
   - Set up expiration alerts (90, 60, 30 days)

**Expected resolution time**: Hours to days (worst case)

---

#### Scenario E: Recent DNS Change Caused Issue

**If** recent DNS change broke things:

1. **Revert DNS change**:
   - Restore previous DNS configuration
   - Use DNS provider's change history if available

2. **Verify reversion works**:
   ```bash
   dig @<authoritative-nameserver> app.blackroad.io
   ```

3. **Investigate what went wrong**:
   - Typo in new configuration?
   - Wrong IP used?
   - Deleted record accidentally?

**Expected resolution time**: 5-15 minutes + TTL

---

### 3️⃣ Verify Resolution 📊

**Actions**:

1. **Test DNS resolution**:
   ```bash
   # From multiple DNS servers
   dig @8.8.8.8 app.blackroad.io
   dig @1.1.1.1 app.blackroad.io
   
   # Check propagation globally
   # Use: whatsmydns.net
   ```

2. **Test service accessibility**:
   ```bash
   curl -I https://app.blackroad.io
   # Should return 200 OK
   ```

3. **Run smoke tests**:
   - Execute `workflows/smoke-tests.md`
   - Verify critical paths work

4. **Monitor for propagation**:
   - Check from different locations
   - Monitor support channels
   - Track external monitoring

**Note**: DNS changes can take up to TTL time to fully propagate

---

### 4️⃣ Communicate (Parallel with mitigation) 📣

**Actions**:

1. **Update status page immediately**:
   ```
   OUTAGE: Service Unreachable
   We are aware of DNS issues preventing access to our service.
   Our team is working to resolve this immediately.
   ETA: <time> (will update every 5 minutes)
   
   Workaround: Access directly via http://<ip-address> (temporary)
   ```

2. **Social media**:
   - Post on Twitter, etc.
   - Acknowledge the issue
   - Provide updates every 5-10 minutes

3. **Internal communication**:
   - #incidents channel
   - Page leadership (P0 incident)
   - Alert all teams

4. **Support team**:
   - Brief them on issue
   - Provide talking points
   - Give workaround if available

---

### 5️⃣ Monitor Propagation 🌍

**Actions**:

1. **Track DNS propagation**:
   - Use whatsmydns.net or similar
   - Check multiple geographic regions
   - Monitor until 90%+ servers show correct IP

2. **Watch metrics**:
   - Traffic should start recovering
   - Error rates should decrease
   - User reports should slow

3. **Verify across ISPs**:
   - Different ISPs cache DNS differently
   - Some may take longer to update

4. **Patience**:
   - Cannot force global DNS cache refresh
   - Must wait for TTL expiration
   - Can take minutes to hours depending on old TTL

---

### 6️⃣ Post-Resolution 📝

**Actions**:

1. **Declare resolved when**:
   - 90%+ DNS servers show correct IP
   - Traffic recovered to normal levels
   - No new user reports

2. **Update status page**:
   ```
   RESOLVED: Service Accessible
   DNS issue has been resolved. Service is fully accessible.
   We apologize for the inconvenience.
   ```

3. **Document incident**:
   - What caused the DNS issue
   - How long the outage lasted
   - How it was resolved
   - User impact

4. **Create follow-up tasks**:
   - Fix root cause
   - Improve DNS monitoring
   - Add safeguards
   - Update procedures

---

## Prevention

### 1. DNS Configuration Management

- **Infrastructure as Code**: Manage DNS via Terraform/etc.
- **Version Control**: Track all DNS changes in git
- **Review Process**: Require approval for DNS changes
- **Testing**: Test DNS changes in staging first

### 2. Monitoring

- **DNS monitoring**: Alert on DNS resolution failures
  ```bash
  # Monitor DNS resolution
  dig app.blackroad.io | grep "ANSWER: 0"
  ```
- **Multi-location checks**: Monitor from different regions
- **Continuous checks**: Check every 1-5 minutes
- **Alert on changes**: Alert when DNS record changes unexpectedly

### 3. Redundancy

- **Multiple DNS providers**: Use primary + secondary
- **Low TTL**: Keep TTL low (300-600 seconds) for production domains
- **Health checks**: Automatic failover if primary fails
- **Backup domains**: Have backup domain ready

### 4. Domain Management

- **Auto-renewal**: Enable for all critical domains
- **Expiration alerts**: 90, 60, 30, 7 days before expiration
- **Lock domain**: Prevent unauthorized transfers
- **Multiple contacts**: Ensure multiple people have registrar access

### 5. Change Management

- **Change windows**: Only change DNS during low-traffic periods
- **Rollback plan**: Know how to revert DNS changes quickly
- **Communication**: Announce DNS changes in advance
- **Staged rollout**: Test on subdomain first

---

## DNS Best Practices

### TTL Settings

- **Production**: 300-600 seconds (allows quick changes)
- **Before change**: Reduce to 60 seconds 24 hours before
- **After change**: Increase back to 300-600 after verifying

### Record Types

- **A record**: For IPv4 (most common)
- **AAAA record**: For IPv6
- **CNAME**: For subdomains pointing to other domains
- **Never**: CNAME at apex (use A record or ALIAS)

### DNS Security

- **DNSSEC**: Enable if provider supports
- **Rate limiting**: Protect against DDoS
- **Access control**: Limit who can change DNS
- **Audit logs**: Track all DNS changes

---

## Useful Commands

```bash
# Check DNS resolution
dig app.blackroad.io
dig +short app.blackroad.io
nslookup app.blackroad.io

# Query specific nameserver
dig @8.8.8.8 app.blackroad.io
dig @1.1.1.1 app.blackroad.io

# Check authoritative nameserver
dig NS blackroad.io
dig @<nameserver> app.blackroad.io

# Check DNS propagation
dig +trace app.blackroad.io

# Check TTL
dig app.blackroad.io | grep -A 1 "ANSWER SECTION"

# Flush local DNS cache (varies by OS)
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

---

## Escalation

Escalate if:
- DNS provider itself is down (contact their support)
- Domain registrar issue (contact registrar)
- DDoS on DNS (need DDoS protection)
- Cannot access DNS management (locked out)

---

## Communication Templates

### Initial Alert
```
🚨 P0 INCIDENT: Service Unreachable (DNS Issue)
Impact: All users unable to access app.blackroad.io
Cause: DNS issue under investigation
Status: Team actively working on resolution
ETA: TBD (will update in 5 minutes)
```

### Resolution
```
✅ RESOLVED: Service Accessible
The DNS issue has been resolved.
Service is fully accessible.
Duration: <X> minutes
Cause: <brief explanation>
Apologies for the disruption.
```

---

## Related Runbooks

- `runbooks/incident-service-down.md` - General outage response
- `runbooks/incident-ddos.md` - DDoS attacks (may affect DNS)

## Related Workflows

- `workflows/change-management.md` - DNS changes should follow this
