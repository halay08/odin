#resource "kubernetes_manifest" "certificate" {
#
#    provider = kubernetes-alpha
#
#    manifest = {
#
#        apiVersion = "cert-manager.io/v1"
#        kind       = "Certificate"
#
#        metadata = {
#
#            name      = var.name
#            namespace = "default"
#
#        }
#
#        spec = {
#
#            secretName = var.name
#
#            issuerRef = {
#
#                name = "letsencrypt"
#
#            }
#
#            commonName = var.ingress_hostname
#
#            dnsNames = [
#
#                var.ingress_hostname
#
#            ]
#
#        }
#
#    }
#
#}
