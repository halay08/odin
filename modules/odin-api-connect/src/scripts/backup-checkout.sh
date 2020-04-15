#!/bin/sh

DB_HOSTNAME=odin-prod.cvleggfozj2t.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_NAME=odin
DB_PASSWORD=POonl3ZGe3uvuMcmvphgFoIzQs

#DB_HOSTNAME=odin-dev-2020-05-04-10-29.c0bfvabolc0x.us-east-1.rds.amazonaws.com
#DB_PORT=5432
#DB_USERNAME=postgres
#DB_PASSWORD=QSe0m1VTXeAUou9L
#DB_NAME=odin
#DB_SYNCHRONIZE=true

psql -h $DB_HOSTNAME -U $DB_USERNAME $DB_NAME << EOF

CREATE EXTENSION postgis;

DROP TABLE checkout_backup_requests;
CREATE TABLE checkout_backup_requests
(
    id SERIAL PRIMARY KEY,
    body jsonb
);
ALTER TABLE checkout_backup_requests OWNER to postgres;

EOF


