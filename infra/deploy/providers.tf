provider "aws" {

    profile = var.aws_profile
    region  = var.aws_region

}

provider "kubernetes" {

    config_path = "~/.kube/config"
    host        = data.aws_eks_cluster.cluster.endpoint
    token       = data.aws_eks_cluster_auth.cluster.token
    insecure    = true

}

provider "kubernetes-alpha" {

    host     = data.aws_eks_cluster.cluster.endpoint
    token    = data.aws_eks_cluster_auth.cluster.token
    insecure = true

}
