# Getting up and running

#### Ensure you have an SSH key added to your GitHub

https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh

##### request access to d19n npm registry

Contact IT

## Windows users setup

1. Install [GnuWin32](https://sourceforge.net/projects/gnuwin32/). Go to installation folder (ex.
   Program Files/GnuWin32) and copy all files in bin directory over to the odin-dev-environment.
2. Install [Docker](https://www.docker.com/).
2. Install [nvm-windows](https://github.com/coreybutler/nvm-windows).

Install Node version 12.18.2

## Setup procedure with Makefile

```
Get Docker running.
git clone --recursive git@github.com:d19n-llc/odin-dev-environment.git
npm install -g @nestjs/cli
npm install typescript -g
npm login
make setup BRANCH=develop
add .env files into modules

make stack/infra/up
make stack/modules/up
```

## Setup procedure without Makefile

```
Get the Docker running.
git clone --recursive git@github.com:d19n-llc/odin-dev-environment.git
npm install -g @nestjs/cli
npm install typescript -g
npm login
add .env files into modules

cd into module/odin-api-<module_name>
git pull
git submodule update --init
git checkout develop
git pull origin develop
npm login
cat ~/.npmrc >> .npmrc
npm install

To test that everything was initialized run: 
git remote -v 
origin	git@github.com:d19n-llc/<module-name>.git (fetch)
origin	git@github.com:d19n-llc/<module-name>.git (push)

vim .git/config

output should be: 
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
[remote "origin"]
	url = git@github.com:d19n-llc/odin-api-field-service.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
[branch "develop"]
	remote = origin
	merge = refs/heads/develop
[branch "staging"]
	remote = origin
	merge = refs/heads/staging


cd to the odin-dev-environment directory

docker-compose -f docker/docker-compose.yaml up -d --build

modules/odin-api-identity npm run start:dev
modules/odin-api-service npm run start:dev
modules/platform-desktop npm run start
```

> To add additional submodules cd into the modules directory and run the following command:
`git submodule add <repository url> <repository name>`

## Updating the dev environment

When there are changes you want to pull in from github, this command will `git pull` the main dev
directory and then pull each submodule to master:

```bash
make update
```

## (Re)starting Services

This command will start (or restart if something is running) all of the infrastructure services like
postgres, elasticsearch, HAproxy, etc:

```bash
make stack/infra/restart
```

This command will re-build and restart the modules configured in the `Makefile`:

```bash
make stack/modules/buildrestart
```

# Proxy

In order to achieve "virtual hosting" of service endpoints we must proxy each docker container
service through HAproxy. This will map http://localhost:8080/<path-to-service> to a specific
container (i.e.: http://99.0.0.105/schemas).

HAproxy is automatically started with `make stack/infra/restart` (above).

> When a new module service is addded the [docker/proxy/haproxy.cfg](docker/proxy/haproxy.cfg) file *must* be updated and the container rebuilt + restarted.

## Swagger UI's - When running modules in Docker

| API                           | URL                                          |
|-------------------------------|----------------------------------------------|
| Identity Management API       | http://localhost:8080/IdentityModule/swagger |
| Schema Management API         | http://localhost:8080/SchemaModule/swagger   |
| CRM Module API                | http://localhost:8080/CrmModule/swagger      |
| Product Catalog API           | http://localhost:8080/ProductModule/swagger  |
| Orders Module API             | http://localhost:8080/OrderModule/swagger    |

## Swagger UI's - When running modules in Localhost

| API                           | URL                                       |
|-------------------------------|-------------------------------------------|
| Identity Management API       | http://localhost:10100/identity/swagger   |
| Schema Management API         | http://localhost:10105/schemas/swagger    |
| CRM Module API                | http://localhost:10104/crm/swagger        |
| Product Catalog API           | http://localhost:10109/products/swagger   |
| Orders Module API             | http://localhost:10110/orders/swagger     |

## Container Services

Start docker containers with:

```bash
docker-compose up -d
```

Once you start all of the services each service will be available at:

| Name          | Port  | URL                                                   |
|---------------|-------|-------------------------------------------------------|
| Elasticsearch | 9200  | http://localhost:9200                                 |
| pgAdmin       | 5050  | http://localhost:5050                                 |
| InfluxDB      | 8083  | http://localhost:8083                                 |
| Jaeger        | 16686 | http://localhost:16686                                |
| Kibana        | 5601  | http://localhost:5601                                 |
| MySQL         | 10003 | mysql -h127.0.0.1 -P 10096 -uroot -pmysql odin    |
| RabbitMQ      | 15672 | http://localhost:10093                                |

> See [docker/docker-compose.yaml](docker/docker-compose.yaml) for specifics.

## pgAdmin setup

Connect to the postgres docker container you can inspect the running container, find the following
IP address

```bash

host: 99.0.0.7
port: 5432

"IPAddress": "99.0.0.7",

"Ports": {
    "5432/tcp": [
        {
            "HostIp": "0.0.0.0",
            "HostPort": "5432"
        }
    ]
},
```

# Node Dependency Management

Each module needs to have their node modules installed. You can do this for all repo/modules in one
shot with:

```bash
make node/install/all
```

## Updating a specific package in all repo's

Once you've published a change you can install this new version across all of the module repo's
with:

```bash
make node/install/module MODULE='@d19n/models'
```

# Database Management

## Connecting using the `psql` cli

Login to the running docker container and grab a shell:

```bash
docker exec -it odin-postgres sh
```

Login to the postgres database:

```bash
psql --user postgres odin
```

# Fixing submodule merge conflicts

1. Run git status - make a note of the submodule folder with conflicts
2. Reset the submodule to the version that was last committed in the current branch:
   git reset HEAD path/to/submodule

3. At this point, you have a conflict-free version of your submodule which you can now update to the
   latest version in the submodule's repository:

cd path/to/directory-with-submodules git submodule foreach git pull origin SUBMODULE-BRANCH-NAME

4. And now you can commit the changes and push.

## Removing submodules

https://gist.github.com/myusuf3/7f645819ded92bda6677
