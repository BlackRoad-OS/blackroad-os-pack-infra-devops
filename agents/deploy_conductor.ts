export type ServiceSpec = {
  name: string;
  dependencies?: string[];
  strategy?: 'rolling' | 'blue_green' | 'canary';
};

export type DeploymentStep = {
  service: string;
  strategy: ServiceSpec['strategy'];
  dependsOn: string[];
};

export type DeploymentPlan = {
  orderedServices: DeploymentStep[];
  notes: string[];
};

export type ServiceResult = {
  service: string;
  success: boolean;
  details?: string;
};

export type DeploymentSummary = {
  success: boolean;
  servicesAttempted: number;
  failures: string[];
  notes: string[];
};

function topoSort(services: ServiceSpec[]): DeploymentStep[] {
  const adjacency = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  services.forEach((service) => {
    adjacency.set(service.name, service.dependencies ?? []);
    incoming.set(service.name, 0);
  });

  services.forEach((service) => {
    (service.dependencies ?? []).forEach((dep) => {
      if (!incoming.has(dep)) {
        incoming.set(dep, 0);
      }
      incoming.set(service.name, (incoming.get(service.name) ?? 0) + 1);
    });
  });

  const queue: string[] = [];
  incoming.forEach((count, name) => {
    if (count === 0) {
      queue.push(name);
    }
  });

  const ordered: DeploymentStep[] = [];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const spec = services.find((s) => s.name === current);
    ordered.push({
      service: current,
      strategy: spec?.strategy ?? 'rolling',
      dependsOn: adjacency.get(current) ?? [],
    });

    services
      .filter((s) => (s.dependencies ?? []).includes(current))
      .forEach((s) => {
        const value = (incoming.get(s.name) ?? 1) - 1;
        incoming.set(s.name, value);
        if (value === 0) {
          queue.push(s.name);
        }
      });
  }

  if (ordered.length !== incoming.size) {
    throw new Error('Circular dependency detected in service graph');
  }

  return ordered;
}

export function planDeployment(services: ServiceSpec[]): DeploymentPlan {
  if (services.length === 0) {
    return { orderedServices: [], notes: ['No services provided for deployment.'] };
  }

  const orderedServices = topoSort(services);
  const notes = ['Plan generated with dependency-aware ordering.',
    'Defaulting unspecified strategies to rolling deployments.'];
  return { orderedServices, notes };
}

export function summarizeDeploymentResult(
  plan: DeploymentPlan,
  results: ServiceResult[],
): DeploymentSummary {
  const failureSet = new Set(
    results.filter((r) => !r.success).map((r) => r.service),
  );
  const notes: string[] = [];

  plan.orderedServices.forEach((step) => {
    if (!results.find((r) => r.service === step.service)) {
      notes.push(`No result reported for ${step.service}`);
    }
  });

  if (failureSet.size > 0) {
    notes.push('Failures detected; consider rollback or canary pause.');
  } else {
    notes.push('All reported services deployed successfully.');
  }

  return {
    success: failureSet.size === 0,
    servicesAttempted: results.length,
    failures: Array.from(failureSet),
    notes,
  };
}
