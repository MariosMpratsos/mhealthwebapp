terraform {
  required_version = ">= 1.5.0"

  required_providers {
    contabo = {
      source  = "contabo/contabo"
      version = "~> 0.1"
    }
  }
}

variable "contabo_client_id" {
  type      = string
  sensitive = true
}

variable "contabo_client_secret" {
  type      = string
  sensitive = true
}

variable "contabo_user" {
  type      = string
  sensitive = true
}

variable "contabo_pass" {
  type      = string
  sensitive = true
}

variable "instance_id" {
  type        = string
  description = "Το Contabo Instance ID του VPS σου"
}

provider "contabo" {
  oauth2_client_id     = var.contabo_client_id
  oauth2_client_secret = var.contabo_client_secret
  oauth2_user          = var.contabo_user
  oauth2_pass          = var.contabo_pass
}

# Contabo Network Firewall 
# Ανοίγει την πόρτα 22 (SSH), 80 (HTTP / Certbot challenges & E-commerce), και 443 (HTTPS για bratsos.online)
resource "contabo_firewall" "vps_fw" {
  name        = "vps-main-firewall"
  description = "Managed by Terraform for Nginx ports"
  status      = "active"
  instances   = [var.instance_id]

  rules {
    inbound {
      protocol   = "tcp"
      action     = "accept"
      status     = "active"
      dest_ports = ["22", "80", "443"]
      src_cidr {
        ipv4 = ["0.0.0.0/0"]
        ipv6 = ["::/0"]
      }
    }
  }
}
