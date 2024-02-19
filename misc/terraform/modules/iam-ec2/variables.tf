variable "name" {
  type = string
}

variable "jars_bucket" {
  type = string
}

variable "permissions_boundary" {
  type    = string
  default = null
}
