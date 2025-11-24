import pathlib
import sys

# Ensure repository root is on path for agent imports
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from agents.infra_steward import (
    summarize_infra_drift,
    validate_dns_blueprint,
    validate_service_template,
)


def test_validate_dns_blueprint_success():
    blueprint = {
        "domain": "example.dev",
        "owner": "team-infra",
        "subdomains": [
            {"name": "api", "target": "api.dev.internal"},
            {"name": "web", "target": "web.dev.internal"},
        ],
    }

    result = validate_dns_blueprint(blueprint)
    assert result["valid"] is True
    assert result["issues"] == []
    assert result["checked_subdomains"] == 2


def test_validate_dns_blueprint_missing_fields():
    result = validate_dns_blueprint({"subdomains": [{}]})
    assert result["valid"] is False
    assert any("Missing required dns fields" in issue for issue in result["issues"])
    assert any("Subdomain missing name" in issue for issue in result["issues"])
    assert any("Subdomain missing target" in issue for issue in result["issues"])


def test_validate_service_template_variables():
    template = {
        "service": "api",
        "environment": "stage",
        "variables": {"DATABASE_URL": "postgres://"},
        "required_envs": ["DATABASE_URL", "SECRET_KEY"],
    }
    result = validate_service_template(template)
    assert result["valid"] is False
    assert "Missing environment variable: SECRET_KEY" in result["issues"]


def test_summarize_infra_drift_detection():
    desired = {"replicas": 3, "region": "us-west"}
    actual = {"replicas": 2, "region": "us-west"}
    summary = summarize_infra_drift(desired, actual)
    assert summary["status"] == "drift_detected"
    assert summary["drift_keys"] == ["replicas"]
