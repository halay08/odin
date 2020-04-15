resource "kubernetes_pod_disruption_budget" "pdb" {

    metadata {

        name = var.name

    }

    spec {

        min_available = 1

        selector {

            match_labels = {

                app = var.name

            }

        }

    }

}
