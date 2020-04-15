variable "name" {}
variable "port" {}
variable "replicas" {
  default = 1
}
variable "ingress_hostname" {}
variable "ingress_path" {}
variable "node_selector" {}

variable "ingress_issuer" {

  description = "set to none if you do not want certbot to pick it up or letsencrypt"
  default     = "none"

}

variable "image_tag" {

  description = "git sha or tag (i.e.: v1.0.12)"

}

variable "image_host" {

  description = "this is the d19n AWS account which hosts all the images"
  default     = "966871023032.dkr.ecr.eu-west-2.amazonaws.com"

}

variable "environment" {

  type        = map(string)
  description = "environment variables objects with key/value pairs"

}
