variable "aws_vpc_id" {
  type    = string
  default = env("AWS_VPC_ID")
}

variable "aws_subnet_id" {
  type    = string
  default = env("AWS_SUBNET_ID")
}

variable "security_group_id" {
  type    = string
  default = env("AWS_SECURITY_GROUP_ID")
}

variable "ami_architecture" {
  type    = string
  default = "x86_64"

  validation {
    condition     = can(regex("^(x86_64|arm64)$", var.ami_architecture))
    error_message = "The ami_architecture must be x86_64 or arm64."
  }
}

variable "java_version" {
  type    = string
  default = env("JAVA_VERSION")

  validation {
    condition     = length(var.java_version) == 0 || can(regex("^(1.8.0|11)$", var.java_version))
    error_message = "The java_version must be 1.8.0 or 11."
  }
}

variable "flink_version" {
  type    = string
  default = env("FLINK_VERSION")

  validation {
    condition     = length(var.flink_version) > 0
    error_message = "The flink_version is required."
  }
}

locals {
  java_version = coalesce(var.java_version, "11")
  arch = lookup(
    { x86_64 : "amd64" },
    var.ami_architecture,
    var.ami_architecture
  )

  # https://www.packer.io/docs/templates/hcl_templates/functions
  timestamp = formatdate("YYYYMMDD-hhmm", timestamp())
}

packer {
  required_plugins {
    amazon = {
      version = ">= 1.3.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "null" "flink" {
  communicator = "ssh"

  ssh_host             = ""
  ssh_username         = ""
  ssh_private_key_file = ""
}

source "amazon-ebs" "flink" {
  ami_name            = "flink-${var.flink_version}-java-${local.java_version}-debian-12-${local.arch}-${local.timestamp}"
  spot_instance_types = ["t3.micro", "t3a.micro", "t4g.micro"]
  spot_price          = "auto"
  # instance_type       = "t3.micro"

  ami_virtualization_type = "hvm"
  ebs_optimized           = true
  force_delete_snapshot   = true

  vpc_id                      = var.aws_vpc_id
  subnet_id                   = var.aws_subnet_id
  security_group_id           = var.security_group_id
  associate_public_ip_address = true

  metadata_options {
    # IMDSv2
    http_tokens = "required"
  }

  source_ami_filter {
    filters = {
      # name                = "debian-12-backports-amd64-daily-*"
      name                = "debian-12-${local.arch}-daily-*"
      ena-support         = true
      architecture        = var.ami_architecture
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["903794441882"]
  }
  run_tags = {
    Name = ""
  }
  tags = {
    Name = ""
  }
  ssh_interface             = "public_ip"
  ssh_username              = "admin"
  ssh_clear_authorized_keys = true
}

build {
  sources = [
    "source.amazon-ebs.flink",
    "source.null.flink",
  ]

  provisioner "shell" {
    environment_vars = [
      "DEBUG=1",
      "JAVA_VERSION=${var.java_version}",
      "FLINK_VERSION=${var.flink_version}",
    ]
    execute_command = "{{ .Vars }} exec sudo -E -S bash '{{ .Path }}'"
    scripts = [
      "misc/scripts/apt-up.sh",
      "misc/scripts/install-aws-cli.sh",
      "misc/scripts/install-java.sh",
      "misc/scripts/install-flink.sh",
    ]
  }
}
