variable "cloudflare_api_token" {
  description = "Token for Cloudflare provider"
  type        = string
  default     = "example-token"
}

variable "cloudflare_account_id" {
  description = "Account id for Cloudflare"
  type        = string
  default     = "example-account"
}

variable "cloudflare_zone" {
  description = "DNS zone to manage"
  type        = string
  default     = "example.com"
}

variable "cloudflare_cname_name" {
  description = "CNAME hostname"
  type        = string
  default     = "app"
}

variable "cloudflare_cname_target" {
  description = "CNAME target"
  type        = string
  default     = "railway.example.internal"
}

variable "railway_token" {
  description = "Railway API token"
  type        = string
  default     = "example-railway-token"
}

variable "railway_project_name" {
  description = "Railway project name"
  type        = string
  default     = "blackroad-platform"
}

variable "railway_environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "railway_service_name" {
  description = "Service name"
  type        = string
  default     = "core"
}

variable "railway_repository" {
  description = "Repository URL"
  type        = string
  default     = "https://github.com/blackroad/core.git"
}
