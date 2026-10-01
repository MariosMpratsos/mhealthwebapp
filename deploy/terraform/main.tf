terraform {
  required_version = ">= 1.5.0"
}

variable "vps_ip" {
  type    = string
  default = "169.58.201.189"
}

variable "ssh_user" {
  type    = string
  default = "root"
}

variable "ssh_key_path" {
  type    = string
  default = "~/.ssh/id_rsa"
}

resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/inventory.tpl", {
    ip           = var.vps_ip,
    user         = var.ssh_user,
    ssh_key_path = var.ssh_key_path
  })
  filename = "${path.module}/../ansible/inventory.ini"
}

output "vps_ip" {
  value = var.vps_ip
}
