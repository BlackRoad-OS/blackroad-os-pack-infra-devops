# 🌐 Deploy Web Service Workflow

**Service**: `blackroad-os-web` (Frontend/Web Application)  
**Owner**: Web Team + Infra Team  
**Automation Level**: High (with optional manual approval)

---

## Overview

This workflow defines the deployment process for the web frontend application. Web deploys are typically lower risk than API/backend deploys but still require proper validation to ensure user experience quality.

---

## Prerequisites

- ✅ CI pipeline is green on the target branch
- ✅ Frontend build succeeds with no errors
- ✅ Assets are properly bundled and optimized
- ✅ No active incidents affecting web infrastructure
- ✅ CDN and edge caching configured correctly

---

## Workflow Steps

### 1️⃣ Pre-Checks ✅

**Responsible**: `Infra.DeployBot` (automated)

**Inputs**:
- `branch`: Git branch to deploy
- `commit_sha`: Specific commit SHA
- `target_environment`: Initially `staging`

**Actions**:
1. Verify CI status for the commit:
   - Frontend build successful
   - Linting passed
   - Type checking passed (if TypeScript)
2. Check asset integrity:
   - Bundle size within acceptable limits
   - Source maps generated
   - Images optimized
3. Verify infrastructure:
   - CDN is healthy
   - Static hosting is available
   - DNS configuration is correct
4. Check dependencies:
   - API compatibility (if version coupling exists)
   - Required backend features available

**Outputs**:
- `pre_check_status`: `pass` | `fail`
- `bundle_size`: Total bundle size in MB
- `proceed_to_build`: `true` | `false`

**Failure Handling**:
- If pre-checks fail, abort deployment
- If bundle size too large, alert Web team
- Create ticket for blocking issues

---

### 2️⃣ Build & Optimize 🏗️

**Responsible**: CI System + `Infra.DeployBot`

**Inputs**:
- `commit_sha`: From pre-checks
- `build_config`: Environment-specific configuration
- `environment`: Target environment

**Actions**:
1. Install dependencies:
   - `npm install` or equivalent
   - Verify lockfile integrity
2. Run production build:
   - Execute build command (e.g., `npm run build`)
   - Use environment-specific config
   - Enable production optimizations
3. Optimize assets:
   - Minify JavaScript and CSS
   - Compress images
   - Generate service worker (if PWA)
4. Run build validations:
   - Check for build warnings
   - Verify all routes built
   - Validate asset hashes
5. Package for deployment:
   - Create deployment artifact
   - Include metadata (version, commit, timestamp)

**Outputs**:
- `artifact_id`: Unique build identifier
- `build_artifact_url`: Location of build output
- `bundle_report`: Bundle size analysis
- `build_status`: `success` | `failed`

**Failure Handling**:
- If build fails, abort deployment
- If bundle too large, alert for review
- Notify Web team of build failures

---

### 3️⃣ Staging Deploy 🌱

**Responsible**: `Infra.DeployBot` via `blackroad-os-operator`

**Inputs**:
- `artifact_id`: From build step
- `environment`: `staging`

**Actions**:
1. Deploy to staging hosting:
   - Upload static assets to hosting (e.g., Railway, Vercel, S3+CloudFront)
   - Update routing rules
   - Invalidate CDN cache
2. Verify deployment:
   - Check that new version is accessible
   - Verify `/version.json` or similar
   - Confirm correct commit hash deployed
3. Run automated browser tests:
   - Execute E2E test suite
   - Test critical user flows:
     - Homepage loads
     - Navigation works
     - Forms submit correctly
     - Authentication flow
4. Validate performance:
   - Run Lighthouse or similar
   - Check Core Web Vitals
   - Verify lazy loading works

**Outputs**:
- `deployment_id`: Staging deployment identifier
- `staging_url`: URL of staging deployment
- `staging_status`: `healthy` | `degraded` | `failed`
- `test_results`: E2E test results
- `performance_metrics`: Lighthouse scores

**Failure Handling**:
- If deployment fails, investigate hosting issues
- If tests fail, alert Web team
- Do not proceed to production if staging broken

---

### 4️⃣ Visual & Functional QA 👀

**Responsible**: `Infra.SmokeTester` (automated) + optional manual review

**Inputs**:
- `staging_url`: From staging deploy
- `deployment_id`: Staging deployment ID

**Actions**:
1. Automated visual regression tests:
   - Screenshot key pages
   - Compare with baseline
   - Flag visual changes
2. Cross-browser testing:
   - Test in Chrome, Firefox, Safari
   - Test on mobile viewports
   - Verify responsive design
3. Functional smoke tests:
   - All routes load correctly
   - Navigation between pages works
   - External links functional
   - API calls succeed (if applicable)
4. Accessibility checks:
   - Run axe-core or similar
   - Verify keyboard navigation
   - Check screen reader compatibility
5. Optional manual QA:
   - For major changes, request human review
   - Verify design implementation

**Outputs**:
- `qa_status`: `passed` | `failed` | `needs_review`
- `visual_diff_report`: URL to visual comparison
- `accessibility_score`: Accessibility audit score
- `issues_found`: List of problems

**Failure Handling**:
- If critical issues found, fix before production
- If minor issues, document for follow-up
- If needs review, request manual approval

---

### 5️⃣ Approval Gate (if needed) 🚦

**Responsible**: Web Team Lead or automated

**Inputs**:
- `qa_status`: From QA step
- `staging_url`: For manual review
- `test_results`: All test results

**Actions**:
1. Review staging deployment:
   - Check visual changes
   - Verify functionality
   - Review performance metrics
2. Assess production readiness:
   - No critical bugs
   - Performance acceptable
   - Accessibility requirements met
3. Make approval decision:
   - **Auto-approve** if all automated checks pass
   - **Manual review** if flagged changes
   - **Reject** if issues found

**Outputs**:
- `approval_status`: `approved` | `rejected`
- `approver`: Who approved (agent/human)
- `approval_notes`: Any special instructions

---

### 6️⃣ Production Deploy 🌍

**Responsible**: `Infra.DeployBot`

**Inputs**:
- `artifact_id`: Same artifact from staging
- `environment`: `production`
- `approval_status`: Must be `approved`

**Actions**:
1. Deploy to production hosting:
   - Upload static assets
   - Use atomic deployment strategy (all or nothing)
   - Update version identifier
2. CDN cache invalidation:
   - Invalidate old assets
   - Ensure new assets served
   - Handle versioned assets (keep old for a period)
3. DNS/routing update (if needed):
   - Update routing rules
   - Verify traffic routing correctly
4. Monitor rollout:
   - Watch for 404 errors (missing assets)
   - Monitor for JavaScript errors
   - Check real user monitoring (RUM) metrics
5. Progressive rollout (if supported):
   - Route 10% traffic to new version
   - Monitor error rates
   - Gradually increase to 100%

**Outputs**:
- `production_deployment_id`: Production deployment identifier
- `production_url`: Production URL
- `rollout_status`: Current rollout state
- `production_health`: Health metrics

**Failure Handling**:
- If errors spike, rollback immediately
- If assets missing, re-deploy
- If critical JavaScript error, rollback
- Monitor social media / support channels for user reports

---

### 7️⃣ Post-Deploy Verification 🔍

**Responsible**: `Infra.SmokeTester` + monitoring

**Inputs**:
- `production_deployment_id`: From production deploy
- `production_url`: Production URL

**Actions**:
1. Automated smoke tests on production:
   - All key routes accessible
   - No console errors
   - Assets loading correctly
2. Monitor real user metrics:
   - Error rates from browser
   - JavaScript exceptions
   - Performance metrics (FCP, LCP, CLS, FID)
   - API call success rates from frontend
3. Check analytics:
   - Users can access the site
   - Navigation patterns normal
   - Conversion funnels working
4. Monitor for 30-60 minutes:
   - Watch for anomalies
   - Compare to baseline metrics
   - Check support channels for issues

**Outputs**:
- `verification_status`: `passed` | `failed` | `degraded`
- `rum_metrics`: Real user monitoring data
- `error_rate`: Frontend error rate
- `issues_detected`: List of problems

**Failure Handling**:
- If verification fails, investigate and potentially rollback
- If errors detected, assess severity
- Alert Web team of any issues

---

### 8️⃣ Record & Archive 📝

**Responsible**: `Infra.DeployBot`

**Inputs**:
- `production_deployment_id`: From production deploy
- `verification_status`: From post-deploy verification

**Actions**:
1. Update deployment registry:
   - Record in Prism Console
   - Link to commit, PR, build artifacts
2. Update changelog:
   - Document frontend changes
   - Note any breaking changes
   - Update version number
3. Archive deployment:
   - Store build artifacts
   - Keep for rollback (retention: 30 days)
4. Notify stakeholders:
   - Announce deployment
   - Share changelog
   - Update status page

**Outputs**:
- `deployment_record_id`: Permanent record
- `archive_location`: Artifact storage
- `changelog_updated`: `true` | `false`

---

## Rollback Procedure

Web rollbacks are typically fast:

1. Identify last known good deployment
2. Re-deploy previous version's artifacts
3. Invalidate CDN cache
4. Verify previous version is live
5. Monitor for resolution of issues

**Rollback Time Target**: < 5 minutes

See `workflows/rollback.md` for detailed steps.

---

## Special Considerations

### CDN and Caching
- Clear CDN cache after deployment
- Use versioned asset URLs (cache busting)
- Consider cache TTLs for different asset types

### Service Workers
- Handle service worker updates carefully
- Test update mechanism
- Ensure old service workers don't cache broken versions

### Environment Variables
- Verify environment-specific config
- Check API endpoints are correct
- Validate feature flags

### SEO
- Verify meta tags rendered correctly
- Check robots.txt and sitemap
- Validate OpenGraph and social tags

---

## Metrics to Monitor

- **Error Rate**: JavaScript errors per pageview
- **Performance**: Core Web Vitals (LCP, FID, CLS, FCP)
- **Availability**: % of users able to load site
- **Asset Load Time**: Time to load all assets
- **API Success Rate**: Frontend API calls success rate

**Critical Thresholds**:
- Error rate > 1%: Investigate
- Error rate > 5%: Consider rollback
- LCP > 4s: Performance issue
- FID > 300ms: Interactivity issue

---

## Related Workflows

- `workflows/rollback.md` - Rollback procedure
- `workflows/smoke-tests.md` - Smoke test definitions
- `workflows/change-management.md` - Change approval

## Related Jobs

- `jobs/operator-jobs.yml` - `infra.deploy_service`
- `jobs/health-check-jobs.yml` - Web health checks

## Related Runbooks

- `runbooks/incident-web-down.md` - Web outage response
- `runbooks/incident-performance-degradation.md` - Slow performance
