data "aws_iam_policy_document" "ec2" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "s3-read-only" {
  statement {
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "arn:aws:s3:::${var.jars_bucket}/*.jar"
    ]
  }
}

data "aws_iam_policy_document" "cloud-watch-logs" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:*:*:log-group:/${var.name}/*"
    ]
  }
}

data "aws_iam_policy" "permissions_boundary" {
  count = var.permissions_boundary == null ? 0 : 1
  name  = var.permissions_boundary
}

resource "aws_iam_role" "this" {
  name               = "${var.name}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2.json

  inline_policy {
    name   = "s3-read-only"
    policy = data.aws_iam_policy_document.s3-read-only.json
  }

  inline_policy {
    name   = "cloud-watch-logs"
    policy = data.aws_iam_policy_document.cloud-watch-logs.json
  }

  permissions_boundary = var.permissions_boundary == null ? null : data.aws_iam_policy.permissions_boundary[0].arn
}

resource "aws_iam_instance_profile" "this" {
  name = "${var.name}-ec2-profile"
  role = aws_iam_role.this.name
}
