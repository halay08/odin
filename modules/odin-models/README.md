# Generate list of all models

```bash
find . -name '*.ts' -exec basename {} \; | sort | uniq | awk -F '.' '{print $1}'

generate a new migration when making changes to entities: 

EX: ts-node ./node_modules/typeorm/cli.js migration:generate -n ODIN-510
ts-node ./node_modules/typeorm/cli.js migration:create -n <JIRA_TICKET_NUMBER>

```

