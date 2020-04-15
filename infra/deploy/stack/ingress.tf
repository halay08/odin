resource "kubernetes_ingress" "main" {

    metadata {

        name = var.name

        labels = {

            app = var.name

        }

        annotations = {

            "cert-manager.io/cluster-issuer" = var.ingress_issuer

        }

    }

    spec {

        tls {

            hosts       = [ var.ingress_hostname ]
            secret_name = var.ingress_hostname

        }

        rule {

            host = var.ingress_hostname

            http {

                path {

                    path = var.ingress_path

                    backend {

                        service_name = var.name
                        service_port = 80

                    }

                }

            }

        }

    }

}
