# 🧾 Change Management Workflow

**Purpose**: Coordinate, track, and audit changes to production systems  
**Owner**: Infra Team + All Service Teams  
**Scope**: All production changes (deploys, config, infra, data)

---

## Overview

Change management ensures that all changes to production systems are:
- 📝 **Documented**: What's changing and why
- 🔍 **Reviewed**: Appropriate approval before execution
- 📅 **Scheduled**: Changes happen at appropriate times
- 🔐 **Auditable**: Complete history for compliance and debugging
- 🛡️ **Safe**: Risks assessed and mitigated

This workflow applies to **all production changes**, not just code deployments.

---

## Change Categories

### 1️⃣ Standard Changes (Low Risk) 🟢

**Definition**: Routine, low-risk changes following established procedures

**Examples**:
- Regular service deployments (following standard deploy workflow)
- Scaling resources within approved ranges
- Rotating credentials (automated)
- Minor config updates (non-breaking)

**Approval**: Automated or minimal review  
**Change Window**: Anytime (except freeze periods)  
**Notification**: Team channel post  

---

### 2️⃣ Normal Changes (Medium Risk) 🟡

**Definition**: Changes requiring review but not emergency

**Examples**:
- New feature deployments with API changes
- Infrastructure modifications (new services, major scaling)
- Database schema changes
- Third-party integration updates
- Certificate renewals (manual)

**Approval**: Team lead or oncall engineer  
**Change Window**: Scheduled, during low-traffic periods  
**Notification**: Team channel + stakeholders  

---

### 3️⃣ Major Changes (High Risk) 🟠

**Definition**: Significant changes with substantial impact potential

**Examples**:
- Major version upgrades (framework, database, etc.)
- Architecture changes (service split/merge)
- Data migrations
- Network topology changes
- Multi-service coordinated deployments

**Approval**: Multiple team leads + platform lead  
**Change Window**: Scheduled, with stakeholder coordination  
**Notification**: All teams, status page update  
**Requirements**: Detailed runbook, rollback plan, extended monitoring

---

### 4️⃣ Emergency Changes (Incident Response) 🔴

**Definition**: Urgent changes to resolve active incidents

**Examples**:
- Rollbacks
- Hotfixes for critical bugs
- Emergency scaling
- Configuration fixes for outages

**Approval**: Oncall engineer (post-incident review required)  
**Change Window**: Immediate  
**Notification**: Incident channel, status page  
**Requirements**: Document in incident record, follow-up review

---

## Change Workflow

### 1️⃣ Propose Change 📝

**Responsible**: Change requester (engineer, product manager, etc.)

**Actions**:
1. **Create change request**:
   - Open GitHub issue with label `change-request`
   - Or use dedicated change management system
   - Use change request template

2. **Document the change**:
   - **What**: What is changing (code, config, infra)
   - **Why**: Business reason, bug fix, improvement
   - **Impact**: What systems/users affected
   - **Risk Level**: Low/Medium/High
   - **Rollback Plan**: How to undo if needed

3. **Provide details**:
   - **Implementation Steps**: How will change be made
   - **Testing**: What testing has been done
   - **Dependencies**: What else needs to change
   - **Timeline**: Proposed schedule

**Outputs**:
- `change_request_id`: Unique identifier
- `change_category`: Low/Medium/High/Emergency
- `proposed_date`: When change should happen

---

### 2️⃣ Assess & Label 🔍

**Responsible**: Infra team or change review board

**Actions**:
1. **Review change request**:
   - Validate completeness
   - Verify risk assessment
   - Check for dependencies

2. **Assign category**:
   - Confirm risk level (may upgrade/downgrade)
   - Assign `change-standard`, `change-normal`, `change-major`, or `change-emergency` label

3. **Check for conflicts**:
   - Review change calendar
   - Identify overlapping changes
   - Check for freeze periods

4. **Assign reviewers**:
   - Based on category and systems affected
   - Include service owners, infra team

**Outputs**:
- `assigned_category`: Confirmed category
- `reviewers`: List of required approvers
- `conflicts`: Any scheduling conflicts

---

### 3️⃣ Review & Approve 🚦

**Responsible**: Assigned reviewers

**Actions**:
1. **Technical review**:
   - Is the change technically sound?
   - Is testing adequate?
   - Is rollback plan viable?
   - Are there better alternatives?

2. **Risk assessment**:
   - What could go wrong?
   - What's the blast radius?
   - Are safeguards in place?
   - Is timing appropriate?

3. **Approval decision**:
   - **Approve**: Change can proceed
   - **Request Changes**: Needs modification
   - **Reject**: Should not proceed

4. **Provide feedback**:
   - Comments on the change request
   - Suggested improvements
   - Additional requirements

**Outputs**:
- `approval_status`: Approved/Changes Requested/Rejected
- `approver`: Who approved
- `approval_timestamp`: When approved
- `conditions`: Any special conditions or requirements

---

### 4️⃣ Schedule 📅

**Responsible**: Change requester + Infra team

**Actions**:
1. **Choose deployment window**:
   - Consider traffic patterns
   - Avoid peak hours for high-risk changes
   - Check team availability
   - Respect change freeze periods

2. **Add to change calendar**:
   - Record in shared calendar
   - Mark time slot as reserved
   - Link to change request

3. **Coordinate dependencies**:
   - If multiple changes needed, sequence appropriately
   - Ensure required changes complete first
   - Communicate dependencies to all involved

4. **Send notifications**:
   - Notify relevant teams of scheduled change
   - Update status page if user-facing
   - Set up monitoring alerts

**Outputs**:
- `scheduled_time`: When change will occur
- `calendar_entry`: Link to calendar
- `notifications_sent`: Who was notified

---

### 5️⃣ Implement Change 🔧

**Responsible**: Change requester or designated engineer

**Actions**:
1. **Pre-change verification**:
   - Confirm approval still valid
   - Verify no blocking incidents
   - Check that timing is still appropriate

2. **Execute change**:
   - Follow appropriate workflow:
     - Deploy: Use `workflows/deploy-*.md`
     - Infrastructure: Use `blackroad-os-infra` procedures
     - Config: Use configuration management
     - Data: Use data migration procedures
   - Document progress in change request
   - Monitor during execution

3. **Real-time monitoring**:
   - Watch metrics, logs, alerts
   - Be ready to rollback if issues
   - Communicate progress for major changes

4. **Handle issues**:
   - If problems occur, follow rollback plan
   - Escalate if needed
   - Update change request with status

**Outputs**:
- `implementation_status`: Success/Failed/Rolled Back
- `completion_time`: When change completed
- `issues_encountered`: Any problems during implementation

---

### 6️⃣ Verify & Monitor 🔍

**Responsible**: Change requester + Infra oncall

**Actions**:
1. **Immediate verification**:
   - Run smoke tests
   - Check health endpoints
   - Verify expected behavior

2. **Extended monitoring**:
   - **Standard changes**: 15-30 minutes
   - **Normal changes**: 1-2 hours
   - **Major changes**: 24 hours
   - Watch for:
     - Error rate increases
     - Performance degradation
     - Unexpected behavior

3. **Stability confirmation**:
   - Metrics stable
   - No new alerts
   - User experience normal

4. **Document results**:
   - Update change request with results
   - Note any unexpected behavior
   - Record actual vs expected impact

**Outputs**:
- `verification_status`: Verified/Issues Found
- `stability_confirmed`: Yes/No
- `actual_impact`: Observed impact

---

### 7️⃣ Close & Archive 📚

**Responsible**: Change requester

**Actions**:
1. **Update change request**:
   - Mark as complete
   - Add final summary
   - Link to deployment records

2. **Document lessons learned**:
   - What went well
   - What could improve
   - Unexpected issues
   - Time taken vs estimated

3. **Archive artifacts**:
   - Deployment logs
   - Metrics before/after
   - Screenshots (if UI change)
   - Configuration snapshots

4. **Update documentation**:
   - If procedures changed
   - If new runbooks needed
   - If architecture diagrams affected

5. **Close change request**:
   - Mark as resolved
   - Add to change history
   - Update change calendar

**Outputs**:
- `change_record_id`: Permanent record
- `archive_location`: Where artifacts stored
- `documentation_updated`: Yes/No

---

## Change Calendar

Maintain a shared change calendar showing:

- **Scheduled Changes**: All approved changes with time slots
- **Freeze Periods**: Times when changes are restricted
- **Major Events**: Product launches, high-traffic periods
- **Maintenance Windows**: Scheduled maintenance

**Change Freeze Periods**:
- During major product launches
- During known high-traffic events
- Holiday periods (if applicable)
- After major incidents (cooldown period)

**Exception**: Emergency changes can override freeze periods

---

## Change Request Template

```markdown
## Change Request: [Brief Description]

### Change Details
- **Change ID**: [Auto-generated or manual]
- **Requester**: [Name/Team]
- **Category**: [Standard/Normal/Major/Emergency]
- **Date Requested**: [YYYY-MM-DD]
- **Proposed Date**: [YYYY-MM-DD HH:MM UTC]

### Description
[Detailed description of what is changing]

### Reason
[Why this change is needed]

### Systems Affected
- [ ] blackroad-os-api
- [ ] blackroad-os-web
- [ ] blackroad-os-operator
- [ ] blackroad-os-infra
- [ ] Database
- [ ] Other: [Specify]

### Impact Assessment
- **User Impact**: [None/Low/Medium/High]
- **Service Downtime**: [None/Brief/Extended]
- **Risk Level**: [Low/Medium/High]
- **Blast Radius**: [Specific service/Multiple services/All systems]

### Implementation Plan
1. [Step 1]
2. [Step 2]
3. [...]

### Testing Completed
- [ ] Unit tests
- [ ] Integration tests
- [ ] Staging deployment
- [ ] Manual testing
- [ ] Load testing (if applicable)

### Rollback Plan
[Detailed steps to revert if change causes issues]

### Dependencies
[Other changes or systems this depends on]

### Monitoring Plan
[What metrics to watch, for how long]

### Approval
- **Required Approvers**: [List]
- **Approved By**: [To be filled]
- **Approval Date**: [To be filled]
```

---

## Metrics & KPIs

Track change management effectiveness:

- **Change Volume**: Number of changes per week/month
- **Change Success Rate**: % of changes that complete without rollback
- **Change Cycle Time**: Time from request to implementation
- **Change Approval Time**: Time from request to approval
- **Incident-Causing Changes**: % of changes that cause incidents

**Goals**:
- Success rate > 95%
- Emergency changes < 10% of total
- Approval time < 24 hours for normal changes
- Incident-causing changes < 2%

---

## Communication

### Before Change
- Notify relevant teams (at scheduling)
- Update status page for user-facing changes
- Post in team channels

### During Change
- Update change request with progress
- Post status updates for major changes
- Alert immediately if issues

### After Change
- Announce completion
- Report results
- Thank reviewers and participants

---

## Compliance & Audit

For audit purposes, maintain:

- **Complete change history**: All change requests with full details
- **Approval trail**: Who approved what and when
- **Implementation logs**: What was actually done
- **Verification records**: How change was validated
- **Retention**: Keep records for [compliance period, e.g., 2 years]

**Audit queries should support**:
- All changes in a time period
- All changes to a specific system
- All changes by a specific person/team
- All emergency changes
- All changes that resulted in incidents

---

## Related Workflows

- `workflows/deploy-api.md` - API deployments
- `workflows/deploy-operator.md` - Operator deployments
- `workflows/deploy-web.md` - Web deployments
- `workflows/rollback.md` - Emergency changes

## Related Documentation

- `integration/with-infra.md` - Infrastructure changes
- `integration/with-prism-console.md` - Change tracking in Prism

## Related Runbooks

- All runbooks may reference change management for root cause analysis
