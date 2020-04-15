DEVOPS_PROFILE 			?= d19n-admin
DEVOPS_REGION			?= eu-west-2
ENVIRONMENT			    ?= dev
CUSTOMER_NAME			?= odin
CUSTOMER_PROFILE	    ?= d19n-admin
CUSTOMER_REGION		    ?= eu-west-2
CLUSTER_NAME			?= odin-dev-1
##RELEASE				    ?= v28-20210318
RELEASE 				?= v32-beta

#DEVOPS_PROFILE 			?= d19n-admin
#DEVOPS_REGION			?= eu-west-2
#ENVIRONMENT			    ?= prod
#CUSTOMER_NAME			?= netomnia
#CUSTOMER_PROFILE	    ?= netomnia-root
#CUSTOMER_PROFILE	    ?= netomnia-root
#CUSTOMER_REGION		    ?= eu-west-2
#CLUSTER_NAME			?= netomnia-prod-1
##RELEASE				    ?= v30-20210324
#RELEASE 				?= v31-beta

#DEVOPS_PROFILE 			?= d19n-admin
#DEVOPS_REGION			?= eu-west-2
#ENVIRONMENT			    ?= prod
#CUSTOMER_NAME			?= youfibre
#CUSTOMER_PROFILE	    ?= youfibre-admin
#CUSTOMER_REGION		    ?= eu-west-2
#CLUSTER_NAME			?= youfibre-prod-1
##RELEASE 				?= v31-20210406
#RELEASE 				?= v31-patch


# To release
# git describe --abbrev=0
# git tag -am 'automation release' v1.0.96
# git push --tags


rollout:
	rm -rf .terraform
	@terraform init		-backend-config="bucket=odin-devops-infra-terraform-state" \
						-backend-config="region=$(DEVOPS_REGION)" \
						-backend-config="profile=$(DEVOPS_PROFILE)" \
						-backend-config="key=cpe/$(CUSTOMER_NAME)/$(CLUSTER_NAME)/stack.tfstate"

	@terraform apply 	-var release="$(RELEASE)" \
						-var environment="$(ENVIRONMENT)" \
						-var aws_profile="$(CUSTOMER_PROFILE)" \
						-var aws_region="$(CUSTOMER_REGION)" \
						-var cluster_name="$(CLUSTER_NAME)" \
						-var customer_name="$(CUSTOMER_NAME)" \
						-var customer_cluster_name="$(CLUSTER_NAME)" \
						-var customer_aws_region="$(CUSTOMER_REGION)" \
						-var customer_aws_profile="$(CUSTOMER_PROFILE)"

delete:
	rm -rf .terraform
	@terraform init		-backend-config="bucket=odin-devops-infra-terraform-state" \
						-backend-config="region=$(DEVOPS_REGION)" \
						-backend-config="profile=$(DEVOPS_PROFILE)" \
						-backend-config="key=cpe/$(CUSTOMER_NAME)/$(CLUSTER_NAME)/stack.tfstate"

	@terraform destroy 	-var release="$(RELEASE)" \
						-var environment="$(ENVIRONMENT)" \
						-var aws_profile="$(CUSTOMER_PROFILE)" \
						-var aws_region="$(CUSTOMER_REGION)" \
						-var cluster_name="$(CLUSTER_NAME)" \
						-var customer_name="$(CUSTOMER_NAME)" \
						-var customer_cluster_name="$(CLUSTER_NAME)" \
						-var customer_aws_region="$(CUSTOMER_REGION)" \
						-var customer_aws_profile="$(CUSTOMER_PROFILE)"
