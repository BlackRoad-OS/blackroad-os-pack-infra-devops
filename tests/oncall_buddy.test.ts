import { describe, expect, test } from 'vitest';
import {
  classifyIncident,
  generatePostmortemOutline,
  suggestRunbookSteps,
} from '../agents/oncall_buddy';

describe('Oncall Buddy', () => {
  test('classifies incidents by impact', () => {
    expect(classifyIncident({ impact: 'global', customerFacing: true }).severity).toBe('SEV1');
    expect(classifyIncident({ impact: 'regional', customerFacing: true }).severity).toBe('SEV2');
    expect(classifyIncident({ impact: 'limited', customerFacing: false }).severity).toBe('SEV3');
  });

  test('recommends runbook steps with escalation for SEV1', () => {
    const steps = suggestRunbookSteps({ severity: 'SEV1', rationale: '' });
    const titles = steps.map((s) => s.title);
    expect(titles).toContain('Executive Comms');
  });

  test('generates postmortem outline with key sections', () => {
    const outline = generatePostmortemOutline({
      id: 'INC-001',
      summary: 'Sample incident',
      classification: { severity: 'SEV2', rationale: '' },
    });
    expect(outline.sections).toContain('Timeline');
    expect(outline.prompts[0]).toContain('INC-001');
  });
});
