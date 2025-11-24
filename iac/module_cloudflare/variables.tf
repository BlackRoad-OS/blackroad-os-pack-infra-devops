variable "api_token" {
  description = "Cloudflare API token"
  type        = string
}

variable "account_id" {
  description = "Cloudflare account identifier"
  type        = string
}

variable "zone" {
  description = "Root zone (example.com)"
  type        = string
}

variable "cname_name" {
  description = "Hostname to map (app.example.com)"
  type        = string
}

variable "cname_target" {
  description = "Origin hostname for the CNAME"
  type        = string
}
