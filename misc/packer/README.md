# Packer

## Setup

```sh
packer init -upgrade misc/packer/flink.pkr.hcl
```

## Build

```sh
packer build -only=amazon-ebs.flink -var flink_version=1.17.2 \
  misc/packer/flink.pkr.hcl

packer build -only=amazon-ebs.flink -var flink_version=1.18.1 \
  -var ami_architecture=arm64 misc/packer/flink.pkr.hcl

packer build -only=amazon-ebs.flink -var flink_version=1.18.1 \
  -var java_version=1.8.0 -var ami_architecture=arm64 \
  misc/packer/flink.pkr.hcl
```
