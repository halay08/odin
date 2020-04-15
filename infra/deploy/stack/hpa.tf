resource "kubernetes_horizontal_pod_autoscaler" "hpa" {

  metadata {

    name = "${ var.name }-hpa"

  }

  spec {

    max_replicas = 10
    min_replicas = 2

    target_cpu_utilization_percentage = 40

    scale_target_ref {

      api_version = "apps/v1"
      kind        = "Deployment"
      name        = var.name

    }
  }
}
