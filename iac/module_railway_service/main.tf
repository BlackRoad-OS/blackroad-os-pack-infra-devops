terraform {
  required_providers {
    railway = {
      source  = "railwayapp/railway"
      version = "~> 1.6"
    }
  }
}

provider "railway" {
  token = var.token
}

resource "railway_project" "project" {
  name = var.project_name
}

resource "railway_environment" "environment" {
  project_id = railway_project.project.id
  name       = var.environment_name
}

resource "railway_service" "service" {
  project_id     = railway_project.project.id
  environment_id = railway_environment.environment.id
  name           = var.service_name
  source_repo    = var.repository
}

# TODO(infra-pack-next): wire image-based deployments and autoscaling policies.
