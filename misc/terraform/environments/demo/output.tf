output "api_gateway_url" {
  value = module.api-gateway.url
}

output "function_url" {
  value = module.lambda-api.function_url
}
