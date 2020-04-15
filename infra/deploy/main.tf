#
# Tell terraform to use s3 as the backend for storing the state.
#
terraform {

  backend "s3" {}

}

module "deploy" {

  #
  #    Import all of the terraforms from the stack/ directory.
  #
  source = "./stack"

  #
  #    Loops through the list of modules.
  #
  count = length(local.modules)

  name             = local.modules[count.index]["name"]
  image_tag        = local.releases[var.release][local.modules[count.index]["name"]]
  ingress_hostname = "${ local.modules[ count.index ][ "ingress_prefix" ] }.${ local.environments[ var.customer_name ][ var.environment ][ "base_domain" ] }"
  ingress_path     = local.modules[count.index]["path"]
  ingress_issuer   = local.modules[count.index]["ingress_issuer"]
  port             = 80
  replicas         = 2
  node_selector    = "services"

  #
  #    These are the environment variables that will be available
  #    to ALL containers from it's deployment.
  #
  environment = {

    MODULE_NAME                  = local.modules[count.index]["label"]
    PORT                         = 80
    JWT_TOKEN_SECRET             = local.secrets[var.customer_name]["JWT_TOKEN_SECRET"]
    ENABLE_K8_ROUTING            = "true"
    K8_BASE_URL                  = "https://api.${ local.environments[ var.customer_name ][ var.environment ][ "base_domain" ] }"
    DB_HOSTNAME                  = local.secrets[var.customer_name]["DB_HOSTNAME"]
    DB_PORT                      = 5432
    DB_USERNAME                  = local.secrets[var.customer_name]["DB_USERNAME"]
    DB_PASSWORD                  = local.secrets[var.customer_name]["DB_PASSWORD"]
    DB_NAME                      = local.secrets[var.customer_name]["DB_NAME"]
    DB_HOSTNAME_SLAVE            = local.secrets[var.customer_name]["DB_HOSTNAME_SLAVE"]
    DB_PORT_SLAVE                = 5432
    DB_USERNAME_SLAVE            = local.secrets[var.customer_name]["DB_USERNAME_SLAVE"]
    DB_PASSWORD_SLAVE            = local.secrets[var.customer_name]["DB_PASSWORD_SLAVE"]
    DB_NAME_SLAVE                = local.secrets[var.customer_name]["DB_NAME_SLAVE"]
    DB_GIS_HOSTNAME              = local.secrets[var.customer_name]["DB_GIS_HOSTNAME"]
    DB_GIS_PORT                  = 5432
    DB_GIS_USERNAME              = local.secrets[var.customer_name]["DB_GIS_USERNAME"]
    DB_GIS_PASSWORD              = local.secrets[var.customer_name]["DB_GIS_PASSWORD"]
    DB_GIS_NAME                  = local.secrets[var.customer_name]["DB_GIS_NAME"]
    DB_MYAH_PORT                 = 5432
    DB_MYAH_HOSTNAME             = local.secrets[var.customer_name]["DB_MYAH_HOSTNAME"]
    DB_MYAH_USERNAME             = local.secrets[var.customer_name]["DB_MYAH_USERNAME"]
    DB_MYAH_PASSWORD             = local.secrets[var.customer_name]["DB_MYAH_PASSWORD"]
    DB_MYAH_NAME                 = local.secrets[var.customer_name]["DB_MYAH_NAME"]
    ELASTICSEARCH_HOST           = local.secrets[var.customer_name]["ELASTICSEARCH_HOST"]
    REDIS_ENDPOINT               = local.secrets[var.customer_name]["REDIS_ENDPOINT"]
    REDIS_PORT                   = 6379
    ODIN_API_TOKEN               = local.secrets[var.customer_name]["ODIN_API_TOKEN"]
    RABBITMQ_HOST                = local.secrets[var.customer_name]["RABBITMQ_HOST"]
    RABBITMQ_PORT                = 5672
    RABBITMQ_USER                = local.secrets[var.customer_name]["RABBITMQ_USER"]
    RABBITMQ_PASS                = local.secrets[var.customer_name]["RABBITMQ_PASS"]
    AWS_ACCESS_KEY_ID            = local.secrets[var.customer_name]["AWS_ACCESS_KEY_ID"]
    AWS_SECRET_ACCESS_KEY        = local.secrets[var.customer_name]["AWS_SECRET_ACCESS_KEY"]
    AWS_S3_ACCESS_KEY_ID         = local.secrets[var.customer_name]["AWS_ACCESS_KEY_ID"]
    AWS_S3_SECRET_ACCESS_KEY     = local.secrets[var.customer_name]["AWS_SECRET_ACCESS_KEY"]
    AWS_AMQP_URL                 = local.secrets[var.customer_name]["AWS_AMQP_URL"]
    S3_BUCKET_NAME_FOR_ORG_FILES = local.secrets[var.customer_name]["S3_BUCKET_NAME_FOR_ORG_FILES"]
    NETWORK_API_BASE_URL         = local.secrets[var.customer_name]["NETWORK_API_BASE_URL"]
    SIPWISE_BASE_URL             = local.secrets[var.customer_name]["SIPWISE_BASE_URL"]
    SIPWISE_USERNAME             = local.secrets[var.customer_name]["SIPWISE_USERNAME"]
    SIPWISE_PASSWORD             = local.secrets[var.customer_name]["SIPWISE_PASSWORD"]
    MAGRA_BASE_URL               = local.secrets[var.customer_name]["MAGRA_BASE_URL"]
    MAGRA_USERNAME               = local.secrets[var.customer_name]["MAGRA_USERNAME"]
    MAGRA_PASSWORD               = local.secrets[var.customer_name]["MAGRA_PASSWORD"]
    JAEGER_SERVICE_NAME          = local.modules[count.index]["name"]
    NODE_TLS_REJECT_UNAUTHORIZED = 0
  }

}
