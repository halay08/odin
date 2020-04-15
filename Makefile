DIR := ${CURDIR}
MODULES = $(shell ls modules)
ALL_MODULES = odin-api-field-service odin-api-schema-manager odin-api-identity odin-api-crm odin-api-product-catalog odin-api-orders odin-api-billing odin-api-notifications odin-api-support odin-api-field-service odin-api-service odin-api-projects odin-api-connect odin-api-search
WORK_MODULES = odin-api-schema-manager odin-api-search odin-api-crm


PURPLE 		:= $(shell tput setaf 129)
GRAY  		:= $(shell tput setaf 245)
GREEN  		:= $(shell tput setaf 34)
BLUE 		:= $(shell tput setaf 25)
YELLOW 		:= $(shell tput setaf 3)
WHITE  		:= $(shell tput setaf 7)
RESET  		:= $(shell tput sgr0)

.PHONY: help h
.DEFAULT_GOAL := help

help:

	@echo Development Environment Management Targets:
	@echo
	@awk '/^[a-zA-Z\/\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-10s${RESET} ${GRAY}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo
	@echo Specific Targets:
	@echo
	@awk '/^[a-zA-Z\/\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^### (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  ${GREEN}%-30s${RESET} ${GRAY}%s${RESET}\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
	@echo

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set (make $*=.. target or export $*=.."; \
		exit 1; \
	fi

## First time environment setup.
setup: remove/npmrc setup/npmrc node/install/all stack/network/create stack/all/buildrestart stack/modules/buildrestart

## start your day
work: stack/infra/up stack/modules/up

## end your day
leave: stack/infra/down stack/modules/down

## add cloud connections
portforward:
	kubectl port-forward svc/cluster-1-es-http 9200:9200

docker/remove/odin-images:
	docker rmi $(docker images |grep 'odin')

remove/npmrc:

	@for F in $(MODULES); do echo "removing .npmrc file $$F.."; cd $(DIR)/modules/$$F && rm -rf .npmrc; done

setup/npmrc:
	@echo "contents of .npmrc"
	cat ~/.npmrc

	@for F in $(MODULES); do echo "adding token to .npmrc file $$F.."; cd $(DIR)/modules/$$F && cat ~/.npmrc >> .npmrc; done

## Perform a global update of everything (BRANCH required).
update: guard-BRANCH

	@echo "Updating main dev environment.."
	@git pull
	@git submodule update --init
	@for F in $(MODULES); do echo "pulling $$F.."; cd $(DIR)/modules/$$F && git checkout $(BRANCH) && git pull origin $(BRANCH); done

	@$(MAKE) stack/status
	@echo
	@echo "${YELLOW}To rebuild & restart all containers run: ${GREEN}make stack/all/buildrestart${RESET}"
	@echo

## Install all node_modules across all modules.
node/install/all:

	@for F in $(MODULES); do cd $(DIR)/modules/$$F && npm install; done

## Install a specific node module with @latest (requires MODULE)
node/install/module: guard-MODULE

	@for F in $(MODULES); do cd $(DIR)/modules/$$F && npm install $(MODULE); done

## Updates all @d19n/* packages to @latest version across all modules.
node/update/latest:

	@for F in $(MODULES); do \
		cd $(DIR)/modules/$$F; \
		for MODULE in `cat package.json | jq -r '.dependencies | keys[] as $$k | "\($$k)" | select(. | contains("d19n"))'`; do \
			npm install $$MODULE@latest; \
		done \
	done

## Retrieves a new JWT token and copies it to the clipboard
jwt:

	curl -vv -X POST "http://localhost:8080/identity/users/login" -H "accept: */*" -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"asdfasdf\"}" | jq -r '.token' | pbcopy


### Performs a push ONLY across all modules (BRANCH required).
git/all/push: guard-BRANCH

	@for F in $(MODULES); do cd $(DIR)/modules/$$F && git push origin HEAD:$(BRANCH); done

### Performs a pull across all modules against the current branch.
git/all/pull:

	@for F in $(MODULES); do echo "pulling $$F.."; cd $(DIR)/modules/$$F && git pull; done

### Performs a RESET + FORCE pull across all modules against the current branch.
git/all/reset-force-pull:

	@for F in $(MODULES); do echo "pulling $$F.."; cd $(DIR)/modules/$$F && git reset --hard HEAD && git pull -f; done

### Resets all origin. (BRANCH and MESSAGE required).
git/all/abort-merge:

	@for F in $(MODULES); do echo "Aborting merge $$F .." && cd $(DIR)/modules/$$F && git merge --abort; done

### Resets all origin. (BRANCH and MESSAGE required).
git/all/reset-origin:

	@for F in $(MODULES); do echo "Fetching origin $$F .." && cd $(DIR)/modules/$$F && git fetch origin && git reset --hard origin; done

### Commits local changes only. (BRANCH and MESSAGE required).
git/all/stash-local:

	@for F in $(MODULES); do echo "Stashing changes $$F .." && cd $(DIR)/modules/$$F && git stash; done

### Commits local changes only. (BRANCH and MESSAGE required).
git/all/commit-local: guard-MESSAGE

	@for F in $(MODULES); do echo "Committing $$F .." && cd $(DIR)/modules/$$F && git add . && git commit -am '$(MESSAGE)'; done

### Commits to an EXISTING branch across all modules and pushes to origin. (BRANCH and MESSAGE required).
git/all/commit-and-push: guard-BRANCH guard-MESSAGE

	@for F in $(MODULES); do echo "Committing $$F .." && cd $(DIR)/modules/$$F && git add . && git commit -am '$(MESSAGE)' && git push origin HEAD:$(BRANCH) || true; done
	@git commit -am '$(MESSAGE)' && git push origin HEAD:$(BRANCH)


### BRANCH=develop VERSION=v1.0.5
### git commit -am'deployment automation'; git push origin develop; git tag -am'automation release' v1.0.0; git push --tags
git/all/release: guard-BRANCH guard-VERSION

	@for F in $(MODULES); do echo "committing new version $$F .." && cd $(DIR)/modules/$$F &&git tag -am 'automation release' $(VERSION) && git push --tags; done


### Commits to an EXISTING branch across all modules and pushes to origin. (BRANCH and MESSAGE required).
git/all/merge-to-staging:

	@for F in $(ALL_MODULES); do echo "Committing $$F .." && cd $(DIR)/modules/$$F && git checkout staging && git merge develop && git push && git checkout develop; done

git/all/merge-to-master:

	@for F in $(ALL_MODULES); do echo "Committing $$F .." && cd $(DIR)/modules/$$F && git checkout master && git merge staging && git push && git checkout develop; done

git/all/clear-cache-and-push:

	@git checkout $(BRANCH) || git checkout -b $(BRANCH)
	@for F in $(MODULES); do echo "Clearing cache"; cd $(DIR)/modules/$$F; git rm -r --cached .; git add .; git commit -m ".gitignore fix"; git push; done

git/all/branch/create:

	@git checkout $(BRANCH) || git checkout -b $(BRANCH)
	@for F in $(MODULES); do echo "Checking out NEW branch $(BRANCH) for $$F.."; cd $(DIR)/modules/$$F; git checkout -b $(BRANCH); done

### Checks out an EXISTING branch across all modules ($BRANCH required)
git/all/branch/checkout: guard-BRANCH

	@git checkout $(BRANCH) || git checkout -b $(BRANCH)
	@git pull origin $(BRANCH) || echo "Nothing to pull @ github, ignoring.."

	@for F in $(MODULES); do echo "Checking out NEW branch $(BRANCH) for $$F.."; cd $(DIR)/modules/$$F; git checkout $(BRANCH); git pull origin $(BRANCH); done

git/add/upstream: guard-REPOSITORY
	@for F in $(MODULES); do echo "adding upstream git@github.com:$(REPOSITORY)/$$F.git"; cd $(DIR)/modules/$$F && git remote add upstream git@github.com:$(REPOSITORY)/$$F.git && git remote -v; done


## Add .npmrc file to install private npm packages
git/fetch/upstream:
	@echo "syncing upstream repositories"

	@for F in $(MODULES); do echo "fetching upstream for $$F.."; cd $(DIR)/modules/$$F && git checkout develop && git fetch upstream develop && git merge upstream/develop && git push; done

module-publish:

	cd modules/$(MODULE) && tsc && npm publish

### Reset ALL containers including volume deletion and module image rebuilding (WARNING: DELETES DATA VOLUMES!).
stack/reset:

	@echo "Resetting all containers and deleting volumes.."

	@$(MAKE) stack/infra/downdeletevolumes
	@$(MAKE) stack/infra/up
	@$(MAKE) stack/modules/buildrestart
	@$(MAKE) stack/modules/bootstrap

### Displays the output of docker.
stack/status:

	@echo "${BLUE}########################################################################################################################${RESET}"
	@echo "${GREEN}CURRENT CONTAINER STATUS:${RESET}"
	@echo "----"
	@docker ps -a --format '{{.Names}};{{.Status}};{{.Ports}}' | grep odin | column -s";" -t
	@echo "----"
	@echo "TOTAL: ${GREEN}$(shell docker ps -a | grep odin | wc -l)${RESET}"
	@echo "${BLUE}########################################################################################################################${RESET}"

### Re-builds and re-starts ALL modules including infrastructure services.
stack/all/buildrestart: stack/infra/restart stack/modules/buildrestart

### Creates the docker network (checks if it exists first).
stack/network/create:

	@docker network inspect odin_network > /dev/null || docker network create --ipam-driver default --subnet=99.0.0.0/16 --attachable odin_network

### Destroys and re-creates the docker network.
stack/network/recreate:

	@echo "Re-creating docker network.."

	#
	# Test if network exists, if so delete it.
	#
	@docker network inspect odin_network && docker network rm odin_network

	#
	# Create the network
	#
	@docker network create --ipam-driver default --subnet=99.0.0.0/16 --attachable odin_network

### Restart only the infrastructure containers.
stack/infra/restart: stack/infra/down stack/infra/up

	@osascript -e 'display notification "complete" with title "stack/infra/restart" sound name "default"'

### Bring only the infrastructure containers UP
stack/infra/up: stack/network/create

	@echo "Bringing infrastructure containers up..."
	@docker-compose -f docker/docker-compose.yaml up -d --build

	cd $(DIR)/modules/odin-api-identity && [ -f docker-compose.yaml ] && docker-compose up -d --build

	@$(MAKE) stack/status

### Bring only the infrastructure containers DOWN (does not touch the module services).
stack/infra/down:

	@echo "Bringing infrastructure containers down..."
	@docker-compose -f docker/docker-compose.yaml down

	cd $(DIR)/modules/odin-api-identity && [ -f docker-compose.yaml ] && docker-compose down

	@$(MAKE) stack/status

### Bring only the infrastructure containers DOWN (does not touch the module services) + DELETE data volumes.
stack/infra/downdeletevolumes:

	@echo "Bringing infrastructure containers down..."
	@docker-compose -f docker/docker-compose.yaml down -v

### Restart only the modules (not the main dependencies like postgres, elasticsearch, etc).
stack/modules/restart: stack/modules/down stack/modules/up

	@osascript -e 'display notification "complete" with title "stack/modules/restart" sound name "default"'

### Bring only the modules DOWN (not the main dependencies like postgres, elasticsearch, etc).
stack/modules/down:

	@echo "Bringing modules down.."
	@for F in $(ALL_MODULES); do echo "bringing down $$F.."; cd $(DIR)/modules/$$F && [ -f docker-compose.yaml ] && docker-compose down; done

### Bring only the modules UP (not the main dependencies like postgres, elasticsearch, etc).
stack/modules/up:

	@echo "Spinning up modules.."
	@for F in $(WORK_MODULES); do echo "spinning up $$F.."; cd $(DIR)/modules/$$F && [ -f docker-compose.yaml ] && docker-compose up -d; done

### Bring only the modules UP (not the main dependencies like postgres, elasticsearch, etc) + REBUILD.
stack/modules/buildrestart: stack/modules/down

	@echo "Brining modules down.."
	@for F in $(ALL_MODULES); do echo "Bringing down $$F.."; cd $(DIR)/modules/$$F && [ -f docker-compose.yaml ] && docker-compose up -d --build; done

	@$(MAKE) stack/status
	@osascript -e 'display notification "complete" with title "stack/modules/buildrestart" sound name "default"'

### Deletes package-lock.json in all modules (does not commit!).
stack/modules/node/delete-lock:

	@echo "Deleting package-lock.json in each module..."
	@for F in $(MODULES); do echo "Removing package-lock.json in $$F.."; rm -f $(DIR)/modules/$$F/package-lock.json; done

### Wipes node_modules + runs npm install across all modules.
stack/modules/node/clean:

	@echo "Deleting package-lock.json in each module..."
	@for F in $(MODULES); do echo "Removing package-lock.json in $$F.."; rm -f $(DIR)/modules/$$F/package-lock.json; done

	@echo "Deleting node_modules in each module..."
	@for F in $(MODULES); do echo "Removing package-lock.json in $$F.."; rm -rf $(DIR)/modules/$$F/node_modules; done

	@echo "Installing node_modules.."
	@$(MAKE) node/install/all


### Wipes node_modules + runs npm install across all modules.
stack/modules/lint:

	@echo "Deleting package-lock.json in each module..."
	@for F in $(MODULES); do echo "running tsc on $$F.."; (cd $(DIR)/modules/$$F && tsc) ; done

### Get the logs from all docker services down to the last N lines (N required);
logs/all/last-lines: guard-N

	@for F in $(MODULES_TO_COMPOSE); do echo "Last $(N) logs from ${GREEN}$$F${RESET}:\n\n"; docker logs --timestamps --tail $(N) $$F; echo "---------"; done


### Get the logs from the docker service and watch for more.
logs/identity-manager:

	docker logs -f odin-api-schema-manager

### Get the logs from the docker service and watch for more.
logs/schema-manager:

	docker logs -f odin-api-schema-manager

## AWS Specific

## Add .npmrc file to install private npm packages
aws/create-ecr-repositories:
	@echo "creating ecr repositories"

	@for F in $(MODULES); do echo "creating ecr repository $$F.."; aws ecr create-repository --repository-name $$F; done

aws/build-and-push:
	@for F in $(MODULES); do echo "building image and deploying to ecr repository $$F.."; (cd $(DIR)/modules/$$F && make docker/build-and-push); done

