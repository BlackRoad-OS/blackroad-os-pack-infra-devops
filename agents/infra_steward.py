from typing import Dict, List


def _validate_required_fields(payload: Dict[str, object], required_fields: List[str]) -> List[str]:
  return [field for field in required_fields if field not in payload or payload.get(field) in (None, "")]


def validate_dns_blueprint(blueprint: Dict[str, object]) -> Dict[str, object]:
  missing = _validate_required_fields(blueprint, ["domain", "subdomains", "owner"])
  issues = []
  if missing:
    issues.append(f"Missing required dns fields: {', '.join(missing)}")

  subdomains = blueprint.get("subdomains", []) if isinstance(blueprint.get("subdomains"), list) else []
  for record in subdomains:
    if not isinstance(record, dict):
      issues.append("Invalid subdomain record format")
      continue
    if not record.get("name"):
      issues.append("Subdomain missing name")
    if not record.get("target"):
      issues.append("Subdomain missing target")

  return {"valid": len(issues) == 0, "issues": issues, "checked_subdomains": len(subdomains)}


def validate_service_template(template: Dict[str, object]) -> Dict[str, object]:
  missing = _validate_required_fields(template, ["service", "environment", "variables"])
  issues: List[str] = []
  if missing:
    issues.append(f"Missing required template fields: {', '.join(missing)}")

  variables = template.get("variables", {}) if isinstance(template.get("variables"), dict) else {}
  required_envs = template.get("required_envs", []) if isinstance(template.get("required_envs"), list) else []
  for env in required_envs:
    if env not in variables:
      issues.append(f"Missing environment variable: {env}")

  return {
    "valid": len(issues) == 0,
    "issues": issues,
    "variables_present": list(variables.keys()),
  }


def summarize_infra_drift(desired: Dict[str, object], actual: Dict[str, object]) -> Dict[str, object]:
  drift_keys = []
  for key, desired_value in desired.items():
    actual_value = actual.get(key)
    if actual_value != desired_value:
      drift_keys.append(key)
  return {
    "drift_count": len(drift_keys),
    "drift_keys": drift_keys,
    "status": "clean" if not drift_keys else "drift_detected",
  }
