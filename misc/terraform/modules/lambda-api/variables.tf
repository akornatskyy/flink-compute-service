variable "name" {
  type = string
}

variable "api_auth_token" {
  type      = string
  sensitive = true
}

variable "function_url" {
  type = bool
}

variable "filename" {
  type = string
}

variable "lambda_role" {
  type = string
}
