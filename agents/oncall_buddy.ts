export type IncidentEvent = {
  impact: 'global' | 'regional' | 'limited';
  customerFacing: boolean;
  dataRisk?: boolean;
  durationMinutes?: number;
};

export type IncidentClassification = {
  severity: 'SEV1' | 'SEV2' | 'SEV3';
  rationale: string;
};

export type RunbookStep = {
  title: string;
  description: string;
};

export type IncidentRecord = {
  id: string;
  summary: string;
  classification: IncidentClassification;
};

export type PostmortemOutline = {
  sections: string[];
  prompts: string[];
};

export function classifyIncident(event: IncidentEvent): IncidentClassification {
  if (event.impact === 'global' || event.dataRisk) {
    return { severity: 'SEV1', rationale: 'Global impact or data risk detected.' };
  }
  if (event.customerFacing && event.impact === 'regional') {
    return { severity: 'SEV2', rationale: 'Regional customer-facing impact.' };
  }
  return { severity: 'SEV3', rationale: 'Limited blast radius or internal-only impact.' };
}

export function suggestRunbookSteps(classification: IncidentClassification): RunbookStep[] {
  const baseSteps: RunbookStep[] = [
    { title: 'Acknowledge', description: 'Confirm alert receipt and page responders.' },
    { title: 'Assess', description: 'Gather context, dashboards, and Beacon status.' },
    { title: 'Assign Roles', description: 'Incident commander, comms, and scribe.' },
  ];

  if (classification.severity === 'SEV1') {
    baseSteps.push({ title: 'Executive Comms', description: 'Notify leadership channels.' });
  }

  baseSteps.push({ title: 'Containment', description: 'Mitigate blast radius before full fix.' });
  baseSteps.push({ title: 'Postmortem Prep', description: 'Capture notes for later analysis.' });
  return baseSteps;
}

export function generatePostmortemOutline(incident: IncidentRecord): PostmortemOutline {
  const sections = [
    'Summary',
    'Timeline',
    'Impact',
    'Root Cause',
    'Fix & Mitigations',
    'Follow-ups',
  ];
  const prompts = [
    `What happened during incident ${incident.id}?`,
    'When did symptoms start and end?',
    'Who or what was impacted?',
    'What was the primary and contributing root cause?',
    'What remediations were applied and when?',
    'What actions prevent recurrence? Who owns them?',
  ];
  return { sections, prompts };
}
