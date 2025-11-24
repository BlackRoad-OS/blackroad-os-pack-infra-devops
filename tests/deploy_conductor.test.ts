import { describe, expect, test } from 'vitest';
import { planDeployment } from '../agents/deploy_conductor';

describe('planDeployment', () => {
  test('orders services based on dependencies', () => {
    const services = [
      { name: 'web', dependencies: ['api'] },
      { name: 'api', dependencies: ['db'] },
      { name: 'db' },
      { name: 'prism', dependencies: ['api'] },
    ];

    const plan = planDeployment(services);
    const order = plan.orderedServices.map((step) => step.service);

    expect(order.indexOf('db')).toBeLessThan(order.indexOf('api'));
    expect(order.indexOf('api')).toBeLessThan(order.indexOf('web'));
    expect(order.indexOf('api')).toBeLessThan(order.indexOf('prism'));
  });

  test('throws on circular dependencies', () => {
    const services = [
      { name: 'alpha', dependencies: ['beta'] },
      { name: 'beta', dependencies: ['alpha'] },
    ];

    expect(() => planDeployment(services)).toThrow('Circular dependency detected');
  });
});
