resource "kubernetes_service" "service" {

    metadata {

        name      = var.name
        namespace = "default"

        labels = {

            app = var.name

        }

    }

    spec {

        selector = {

            app = var.name

        }

        port {

            port     = var.port
            protocol = "TCP"

        }

    }

}
