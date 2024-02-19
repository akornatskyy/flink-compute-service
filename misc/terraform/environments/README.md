# Environments

It is common to have multiple environments, e.g. local, demo, dev, staging,
live, prod, etc.

Environment-specific directories provide a straightforward approach to organize
Terraform configurations into separate directories per environment and offers
better isolation.

| Name | Description | Status |
| - | - | - |
| [demo](./demo) | Used for demo purpose | Active |

## Input

Required:

- AWS bucket with .jar files.
- API auth token (`FCS_API_AUTH_TOKEN`).

Optional:

- IAM permission boundary.

## Prepare

Change working directory per environment of choice, e.g.:

```sh
cd demo
```

Initialize working directories by creating initial files.

```sh
terraform init -upgrade
```

Create `.auto.tfvar` and update per your preferences:

```ini
# api_auth_token       = "..." # or source from .env file
jars_bucket            = "..."
# permissions_boundary = "..."
```

## Provision

Provision infrastructure:

```sh
terraform apply
```

## Destroy

Destroy Terraform-managed infrastructure.

```sh
terraform destroy
```
