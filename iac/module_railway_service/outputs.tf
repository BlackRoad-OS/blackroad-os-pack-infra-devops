output "project_id" {
  value       = railway_project.project.id
  description = "Railway project id"
}

output "service_id" {
  value       = railway_service.service.id
  description = "Deployed Railway service id"
}
