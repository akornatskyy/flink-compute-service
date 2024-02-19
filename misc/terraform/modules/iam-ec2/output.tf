output "ec2_role_arn" {
  value = aws_iam_role.this.arn
}

output "ec2_profile_arn" {
  value = aws_iam_instance_profile.this.arn
}
