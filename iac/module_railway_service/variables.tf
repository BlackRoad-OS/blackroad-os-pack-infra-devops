variable "token" {
  description = "Railway API token"
  type        = string
}

variable "project_name" {
  description = "Project name to create/use"
  type        = string
}

variable "environment_name" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "service_name" {
  description = "Service identifier"
  type        = string
}

variable "repository" {
  description = "Git repository URL containing the service"
  type        = string
}
