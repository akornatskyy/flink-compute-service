locals {
  app = "flink-compute-service"
  env = "demo"

  name = "${local.app}-${local.env}"
}

provider "aws" {
  default_tags {
    tags = {
      app    = local.app
      env    = local.env
      origin = "terraform"
      owner  = ""
    }
  }
}


module "iam-ec2" {
  source = "../../modules/iam-ec2"

  name                 = local.name
  jars_bucket          = var.jars_bucket
  permissions_boundary = var.permissions_boundary
}

module "iam-lambda" {
  source = "../../modules/iam-lambda"

  name                 = local.name
  ec2_role_arn         = module.iam-ec2.ec2_role_arn
  permissions_boundary = var.permissions_boundary
}

module "lambda-api" {
  source = "../../modules/lambda-api"

  name           = local.name
  api_auth_token = var.api_auth_token
  filename       = "../../../../flink-compute-service-lambda.zip"
  function_url   = true
  lambda_role    = module.iam-lambda.lambda_role
}

module "api-gateway" {
  source = "../../modules/api-gateway"

  name       = local.name
  invoke_arn = module.lambda-api.invoke_arn
  stage_name = local.env
}
