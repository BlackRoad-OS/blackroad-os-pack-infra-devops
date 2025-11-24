import json
import pathlib
import sys
from jsonschema import Draft7Validator
import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1]


def validate_file(data, schema, path):
    validator = Draft7Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    if errors:
        message_lines = [f"Schema validation failed for {path}:"]
        for error in errors:
            message_lines.append(f" - {list(error.path)}: {error.message}")
        raise SystemExit("\n".join(message_lines))


def load_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def main():
    infra_schema = load_json(ROOT / "schemas" / "infra_pack.schema.json")
    workflow_schema = load_json(ROOT / "schemas" / "workflow.schema.json")

    pack_manifest = load_yaml(ROOT / "pack.yaml")
    validate_file(pack_manifest, infra_schema, "pack.yaml")

    workflow_dir = ROOT / "workflows"
    for workflow_file in workflow_dir.glob("*.workflow.yaml"):
        data = load_yaml(workflow_file)
        validate_file(data, workflow_schema, workflow_file.name)

    print("Schema validation succeeded for pack manifest and workflows.")


if __name__ == "__main__":
    main()
