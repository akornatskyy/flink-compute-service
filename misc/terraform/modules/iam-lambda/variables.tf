variable "name" {
  type = string
}

variable "ec2_role_arn" {
  type = string
}

variable "permissions_boundary" {
  type    = string
  default = null
}
