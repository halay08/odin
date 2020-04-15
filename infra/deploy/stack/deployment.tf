terraform {

  backend "s3" {}

}

resource "kubernetes_deployment" "deployment" {

  wait_for_rollout = false

  metadata {

    name      = var.name
    namespace = "default"

    labels = {

      app = var.name

    }

  }

  spec {

    replicas = var.replicas

    selector {

      match_labels = {

        app = var.name

      }

    }

    template {

      metadata {

        name = var.name

        labels = {

          app = var.name

        }

      }

      spec {

        termination_grace_period_seconds = 10

        node_selector = {

          role = var.node_selector

        }

        container {

          name              = var.name
          image             = "${ var.image_host }/${ var.name }:${ var.image_tag }"
          image_pull_policy = "IfNotPresent"

          dynamic "env" {

            for_each = var.environment

            content {

              name  = env.key
              value = env.value

            }

          }

          port {

            container_port = var.port
            protocol       = "TCP"

          }

          resources {

            limits = {

              cpu    = "0.5"
              memory = "1000Mi"

            }

            requests = {

              cpu    = "200m"
              memory = "500Mi"

            }

          }

          readiness_probe {

            http_get {

              path = "/monitoring"
              port = 80

              http_header {

                name  = "X-Custom-Header"
                value = "odin-readiness-probe"

              }
            }

            initial_delay_seconds = 30
            period_seconds        = 5
            timeout_seconds       = 10

          }

          liveness_probe {

            http_get {

              path = "/monitoring"
              port = 80

              http_header {

                name  = "X-Custom-Header"
                value = "odin-liveness-probe"

              }
            }

            initial_delay_seconds = 15
            period_seconds        = 5
            timeout_seconds       = 10

          }

        }

      }

    }

  }

}

