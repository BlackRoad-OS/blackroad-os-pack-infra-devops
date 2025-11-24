output "zone_id" {
  description = "Cloudflare zone id"
  value       = cloudflare_zone.main.id
}

output "cname_record_id" {
  description = "ID of the created CNAME record"
  value       = cloudflare_record.cname.id
}
