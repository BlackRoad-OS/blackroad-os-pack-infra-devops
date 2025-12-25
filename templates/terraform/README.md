# Terraform Templates

Terraform modules for provisioning BlackRoad OS infrastructure.

## Modules

- `compute.tf` - Compute resources (VMs, containers, serverless)
- `networking.tf` - VPCs, subnets, load balancers, DNS
- `database.tf` - Managed databases (PostgreSQL, Redis, etc.)
- `storage.tf` - Object storage, block storage, file systems

## Usage

```hcl
module "compute" {
  source = "./templates/terraform/compute"
  
  environment = var.environment
  service     = var.service
  region      = var.region
}
```

## Best Practices

1. **Use variables** for all configurable values
2. **Tag all resources** with: environment, service, owner, cost-center
3. **Include outputs** for resource IDs and endpoints
4. **Add lifecycle rules** to prevent accidental deletions
5. **Use remote state** with locking enabled

## Security

- Store Terraform state in secure remote backend
- Use least-privilege service accounts
- Encrypt sensitive outputs
- Mark high-risk operations with comments
