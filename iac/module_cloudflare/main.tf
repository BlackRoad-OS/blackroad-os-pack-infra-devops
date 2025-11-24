terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.31"
    }
  }
}

provider "cloudflare" {
  api_token = var.api_token
}

resource "cloudflare_zone" "main" {
  account_id = var.account_id
  name       = var.zone
}

resource "cloudflare_record" "cname" {
  zone_id = cloudflare_zone.main.id
  name    = var.cname_name
  value   = var.cname_target
  type    = "CNAME"
  proxied = true
}

# TODO(infra-pack-next): add WAF rules, rate limiting, and Zero Trust policies.
