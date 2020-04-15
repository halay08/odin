variable "environment" {

    type        = string
    description = "the cluster environment (i.e.: dev, prod, prod1, prod2)"

}

variable "release" {

    type        = string
    description = "git repos release tag name (i.e.: v1.0.10)"

}

variable "customer_name" {

    type        = string
    description = "name of customer (i.e.: 'youfibre')"

}

variable "customer_cluster_name" {

    type        = string
    description = "name of kubernetes cluster to deploy to"

}

variable "customer_aws_profile" {

    type        = string
    description = "customer aws profile name"

}

variable "customer_aws_region" {

    type        = string
    description = "customer aws region"

}

variable "aws_profile" {}
variable "aws_region" {}
variable "cluster_name" {}
