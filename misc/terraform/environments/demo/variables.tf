variable "api_auth_token" {
  type      = string
  default   = null
  sensitive = true
}

variable "jars_bucket" {
  type = string
}

variable "permissions_boundary" {
  type    = string
  default = null
}
