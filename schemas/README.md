# Schemas

JSON schemas for infrastructure requests, state management, and resource inventory.

## Schemas

- `deployment-request.json` - Schema for deployment requests
- `infrastructure-state.json` - Schema for infrastructure state tracking
- `resource-inventory.json` - Schema for resource inventory and tagging

## Purpose

These schemas ensure:
1. **Consistency** - All infrastructure operations use standard data shapes
2. **Validation** - Requests are validated before processing
3. **Documentation** - Self-documenting API contracts
4. **Agent-friendly** - LLMs and agents can understand expected formats

## Usage

Schemas are used by:
- Deployment workflows for request validation
- `blackroad-os-operator` for job definitions
- `blackroad-os-prism-console` for UI forms
- DevOps agents for structured operations

## Example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["environment", "service", "action"],
  "properties": {
    "environment": {"type": "string", "enum": ["dev", "staging", "prod"]},
    "service": {"type": "string"},
    "action": {"type": "string", "enum": ["deploy", "rollback", "scale"]}
  }
}
```
