data "aws_iam_policy_document" "lambda" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "pass-ec2-role" {
  statement {
    actions = [
      "iam:PassRole"
    ]
    resources = [
      var.ec2_role_arn
    ]
  }
}

data "aws_iam_policy_document" "ec2" {
  statement {
    actions = [
      "ec2:DescribeImages",
      "ec2:DescribeInstances",
      "ec2:DescribeSpotPriceHistory",
      "ec2:RunInstances",
      "ec2:CreateTags"
    ]
    resources = [
      "*"
    ]
  }
}

data "aws_iam_policy" "lambda-execute" {
  name = "AWSLambdaExecute"
}

data "aws_iam_policy" "permissions_boundary" {
  count = var.permissions_boundary == null ? 0 : 1
  name  = var.permissions_boundary
}

resource "aws_iam_role" "this" {
  name               = "${var.name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda.json

  inline_policy {
    name   = "pass-ec2-role"
    policy = data.aws_iam_policy_document.pass-ec2-role.json
  }

  inline_policy {
    name   = "ec2"
    policy = data.aws_iam_policy_document.ec2.json
  }

  managed_policy_arns = [data.aws_iam_policy.lambda-execute.arn]

  permissions_boundary = var.permissions_boundary == null ? null : data.aws_iam_policy.permissions_boundary[0].arn
}
