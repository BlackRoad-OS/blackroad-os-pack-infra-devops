# 🚬 Smoke Tests Workflow

**Purpose**: Validate core functionality after deployment  
**Owner**: Infra Team  
**Automation Level**: Fully automated  
**Execution**: Post-deployment, on-demand, scheduled

---

## Overview

Smoke tests are lightweight, fast tests that verify the most critical functionality of a service is working. They run after every deployment and can be triggered on-demand to validate system health.

**Key Principles**:
- ⚡ **Fast**: Complete in < 5 minutes
- 🎯 **Focused**: Test only critical paths
- 🤖 **Automated**: No manual intervention
- 📊 **Clear**: Pass/fail with actionable output

---

## When to Run Smoke Tests

- ✅ After every deployment (staging and production)
- ✅ After rollback to verify restoration
- ✅ As part of scheduled health checks
- ✅ On-demand when investigating issues
- ✅ Before major events (product launches, etc.)

---

## Smoke Test Definitions by Service

### API Service Smoke Tests 🔌

**Test Suite**: `smoke-tests-api`  
**Duration**: ~2-3 minutes  
**Job**: `infra.run_smoke_tests` with `service_id: blackroad-os-api`

#### Critical Endpoints

1. **Health Check** ✅
   - **Endpoint**: `GET /health`
   - **Expected**: `200 OK` with `{ "status": "healthy" }`
   - **Validates**: Service is running and responding

2. **Version Check** 🏷️
   - **Endpoint**: `GET /version` or `GET /api/version`
   - **Expected**: `200 OK` with version info
   - **Validates**: Correct version deployed, API is accessible

3. **Authentication** 🔐
   - **Endpoint**: `POST /auth/login` or similar
   - **Test Data**: Test user credentials
   - **Expected**: `200 OK` with valid token
   - **Validates**: Authentication system working

4. **Core Business Endpoint** 💼
   - **Endpoint**: Primary business logic endpoint (e.g., `GET /api/users/me`)
   - **Expected**: `200 OK` with valid data
   - **Validates**: Core functionality operational

5. **Database Connectivity** 🗄️
   - **Endpoint**: Any endpoint requiring database read
   - **Expected**: `200 OK` with data from database
   - **Validates**: Database connection healthy

6. **Write Operation** ✍️
   - **Endpoint**: `POST` endpoint that writes data (e.g., `POST /api/test-data`)
   - **Expected**: `201 Created` or `200 OK`
   - **Cleanup**: Delete test data after
   - **Validates**: Write operations working

#### Performance Checks

- **Response Time**: All endpoints < 500ms (p95)
- **Error Rate**: 0% errors in smoke test
- **Throughput**: Service can handle test load

#### Test Implementation

```yaml
api_smoke_tests:
  - name: Health Check
    method: GET
    endpoint: /health
    expected_status: 200
    expected_body_contains: "healthy"
    timeout_ms: 2000

  - name: Version Check
    method: GET
    endpoint: /version
    expected_status: 200
    expected_body_has_keys: ["version", "commit"]
    timeout_ms: 2000

  - name: Auth Test
    method: POST
    endpoint: /auth/login
    body:
      email: "test@blackroad.test"
      password: "test-password-smoke"
    expected_status: 200
    expected_body_has_keys: ["token"]
    timeout_ms: 3000

  - name: User Data Test
    method: GET
    endpoint: /api/users/me
    headers:
      Authorization: "Bearer {token_from_auth}"
    expected_status: 200
    timeout_ms: 3000
```

---

### Web Service Smoke Tests 🌐

**Test Suite**: `smoke-tests-web`  
**Duration**: ~1-2 minutes  
**Job**: `infra.run_smoke_tests` with `service_id: blackroad-os-web`

#### Critical Pages

1. **Homepage** 🏠
   - **URL**: `/` or `/home`
   - **Expected**: `200 OK`, page loads without errors
   - **Validates**: Web app is accessible

2. **Status Page** 📊
   - **URL**: `/status` or `/health`
   - **Expected**: `200 OK`, shows system status
   - **Validates**: Static hosting working

3. **Key Route** 📄
   - **URL**: Primary user-facing route (e.g., `/dashboard`, `/app`)
   - **Expected**: `200 OK`, JavaScript loads
   - **Validates**: SPA routing working

4. **Static Assets** 🖼️
   - **Check**: Main JS bundle, CSS, critical images
   - **Expected**: All assets return `200 OK`
   - **Validates**: CDN/static hosting working

5. **API Integration** 🔌
   - **Action**: Load page that makes API call
   - **Expected**: Page loads, API call succeeds
   - **Validates**: Frontend → Backend integration

#### Browser Checks

- **JavaScript Errors**: 0 console errors
- **Network Errors**: 0 failed requests
- **Performance**: FCP < 2s, LCP < 3s

#### Test Implementation

```yaml
web_smoke_tests:
  - name: Homepage Load
    url: https://app.blackroad.io/
    expected_status: 200
    expected_content_contains: "<html"
    check_no_js_errors: true
    timeout_ms: 5000

  - name: App Route
    url: https://app.blackroad.io/dashboard
    expected_status: 200
    check_no_js_errors: true
    timeout_ms: 5000

  - name: Static Asset
    url: https://app.blackroad.io/main.js
    expected_status: 200
    expected_content_type: "application/javascript"
    timeout_ms: 3000
```

---

### Operator Service Smoke Tests ⚙️

**Test Suite**: `smoke-tests-operator`  
**Duration**: ~3-5 minutes  
**Job**: `infra.run_smoke_tests` with `service_id: blackroad-os-operator`

#### Critical Functionality

1. **Service Health** ✅
   - **Endpoint**: `GET /health`
   - **Expected**: `200 OK`
   - **Validates**: Operator service running

2. **Job Queue Status** 📋
   - **Endpoint**: `GET /queue/status` or similar
   - **Expected**: `200 OK` with queue metrics
   - **Validates**: Job queue accessible

3. **Submit Test Job** 📤
   - **Action**: Submit `infra.test_job` via API or internal call
   - **Expected**: Job accepted, returns job ID
   - **Validates**: Job submission working

4. **Job Execution** ⚡
   - **Action**: Wait for test job to execute
   - **Expected**: Job completes successfully within timeout
   - **Validates**: Job execution engine working

5. **Job Result Retrieval** 📥
   - **Action**: Query job result
   - **Expected**: Result available, status is "completed"
   - **Validates**: Job result storage/retrieval working

6. **Worker Health** 👷
   - **Endpoint**: `GET /workers/health` or similar
   - **Expected**: `200 OK`, at least 1 healthy worker
   - **Validates**: Worker pool operational

#### Test Implementation

```yaml
operator_smoke_tests:
  - name: Operator Health
    method: GET
    endpoint: /health
    expected_status: 200
    timeout_ms: 2000

  - name: Submit Test Job
    method: POST
    endpoint: /jobs
    body:
      job_type: "infra.test_job"
      params: {}
    expected_status: 201
    save_response: "job_id"
    timeout_ms: 3000

  - name: Wait for Job Completion
    action: poll
    endpoint: /jobs/{job_id}
    poll_interval_ms: 1000
    max_polls: 60
    success_condition: "status == 'completed'"
    timeout_ms: 60000

  - name: Verify Job Result
    method: GET
    endpoint: /jobs/{job_id}/result
    expected_status: 200
    expected_body_contains: "success"
    timeout_ms: 2000
```

---

## Smoke Test Workflow

### 1️⃣ Trigger 🎯

**Inputs**:
- `service_id`: Which service to smoke test
- `environment`: `staging` | `production`
- `deployment_id`: Optional, to link to specific deployment

**Triggers**:
- Automatically after deployment
- Scheduled (e.g., hourly, daily)
- Manual on-demand trigger

---

### 2️⃣ Setup ⚙️

**Actions**:
1. Select appropriate test suite based on `service_id`
2. Configure test environment:
   - Set base URL for environment
   - Load test credentials
   - Prepare test data (if needed)
3. Initialize test runner

**Outputs**:
- `test_suite`: Selected test suite
- `test_config`: Configuration for tests

---

### 3️⃣ Execute Tests 🏃

**Actions**:
1. Run tests sequentially or in parallel:
   - Execute each test in suite
   - Record pass/fail for each
   - Capture timing and response data
2. Handle failures:
   - Continue to next test even if one fails
   - Record all failures for reporting
3. Cleanup:
   - Delete test data created
   - Release test resources

**Outputs**:
- `test_results`: Array of individual test results
- `overall_status`: `passed` | `failed`
- `execution_time`: Total time taken

---

### 4️⃣ Report Results 📊

**Actions**:
1. Aggregate results:
   - Count passed vs failed tests
   - Calculate success rate
   - Identify which tests failed
2. Generate report:
   - Summary of results
   - Details of any failures
   - Performance metrics
3. Store results:
   - Save to test results database
   - Link to deployment if applicable
4. Notify stakeholders:
   - If all pass: success notification
   - If any fail: alert oncall, relevant teams
   - Post to monitoring dashboard

**Outputs**:
- `test_report_url`: Link to detailed report
- `notifications_sent`: List of notifications

---

## Test Result Handling

### All Tests Pass ✅

- **Action**: Mark deployment as healthy
- **Notification**: Success message to deployment channel
- **Next Step**: Proceed with deployment workflow

### Some Tests Fail ⚠️

- **Action**: Mark deployment as degraded
- **Notification**: Alert oncall engineer, service team
- **Next Step**: Investigate failures
  - If critical path broken: Consider rollback
  - If non-critical: May proceed with monitoring

### All Tests Fail ❌

- **Action**: Mark deployment as failed
- **Notification**: Urgent alert to oncall, trigger incident
- **Next Step**: Immediate rollback likely needed

---

## Smoke Test Job Specifications

Defined in `jobs/health-check-jobs.yml`:

```yaml
jobs:
  - id: infra.run_smoke_tests
    description: "Execute smoke tests for a service"
    inputs:
      service_id:
        type: string
        required: true
        description: "Service to test (blackroad-os-api, blackroad-os-web, etc.)"
      environment:
        type: string
        required: true
        enum: ["staging", "production"]
      deployment_id:
        type: string
        required: false
        description: "Optional deployment to link results to"
    outputs:
      overall_status:
        type: string
        enum: ["passed", "failed", "error"]
      tests_passed:
        type: integer
        description: "Number of tests that passed"
      tests_failed:
        type: integer
        description: "Number of tests that failed"
      test_report_url:
        type: string
        description: "Link to detailed test report"
    retry_policy:
      max_retries: 2
      backoff_seconds: 10
    timeout_seconds: 600
```

---

## Extending Smoke Tests

To add a new smoke test:

1. Define test in appropriate section above
2. Implement test in test suite codebase
3. Update `jobs/health-check-jobs.yml` if new job needed
4. Add test to CI/CD pipeline
5. Document in this file
6. Test in staging before production

---

## Monitoring Smoke Tests

Track metrics:
- **Success Rate**: % of smoke test runs that pass
- **Execution Time**: How long tests take
- **Failure Patterns**: Which tests fail most often
- **Coverage**: % of critical paths tested

**Goals**:
- Success rate > 99%
- Execution time < 5 minutes
- Zero flaky tests (tests that fail intermittently)

---

## Related Workflows

- `workflows/deploy-api.md` - Uses API smoke tests
- `workflows/deploy-web.md` - Uses Web smoke tests
- `workflows/deploy-operator.md` - Uses Operator smoke tests
- `workflows/rollback.md` - Runs smoke tests after rollback

## Related Jobs

- `jobs/health-check-jobs.yml` - Smoke test job definitions
- `jobs/operator-jobs.yml` - Operator integration

## Related Runbooks

- `runbooks/incident-smoke-test-failure.md` - What to do when smoke tests fail
