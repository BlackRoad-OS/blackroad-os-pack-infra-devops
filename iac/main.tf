module "module_cloudflare" {
  source       = "./module_cloudflare"
  api_token    = var.cloudflare_api_token
  account_id   = var.cloudflare_account_id
  zone         = var.cloudflare_zone
  cname_name   = var.cloudflare_cname_name
  cname_target = var.cloudflare_cname_target
}

module "module_railway_service" {
  source           = "./module_railway_service"
  token            = var.railway_token
  project_name     = var.railway_project_name
  environment_name = var.railway_environment
  service_name     = var.railway_service_name
  repository       = var.railway_repository
}
