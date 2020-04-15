### 2019-12-14


#### Identity Module:
- MD Removed `command` from `docker-compose.yaml`
- MD Added support for detecting `dev` hostname for swagger endpoint option as to not show in prod.

#### Modesl Module:
- MD Removed docker-compose.yaml.
- MD Moved schema models out to schema-manager module.
- MD Added `entities` param to sync.ts for manually defining which models to sync specifically.

#### Makefile
- MD Added `stack/infra(restart|down|up).
- MD Added `stack/modules/(restart|down|up|buildrestart).
- MD Added `MODULES_TO_COMPOSE` for `stack/modules/*` only.        
- MD Added `stack/network/(create|recreate)`. *Checks for existence first before creation.*
