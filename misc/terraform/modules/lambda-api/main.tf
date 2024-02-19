resource "aws_lambda_function" "this" {
  function_name = var.name
  role          = var.lambda_role

  architectures = ["arm64"]
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = var.filename

  environment {
    variables = {
      FCS_NAME           = var.name
      FCS_API_AUTH_TOKEN = var.api_auth_token
    }
  }
}

resource "aws_lambda_function_url" "this" {
  count              = var.function_url ? 1 : 0
  function_name      = aws_lambda_function.this.function_name
  authorization_type = "NONE"
}
