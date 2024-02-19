output "function_url" {
  value = length(aws_lambda_function_url.this) > 0 ? aws_lambda_function_url.this[0].function_url : null
}
