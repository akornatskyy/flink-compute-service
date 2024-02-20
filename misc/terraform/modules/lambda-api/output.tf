output "invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "function_url" {
  value = length(aws_lambda_function_url.this) > 0 ? aws_lambda_function_url.this[0].function_url : null
}
