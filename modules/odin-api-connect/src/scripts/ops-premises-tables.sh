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

DROP TABLE ops.premises_sales_statuses;
CREATE SCHEMA IF NOT EXISTS ops AUTHORIZATION postgres;
CREATE TYPE ops_premises_sales_statuses_enum AS ENUM ('no_status','register_interest','pre_order','order');
CREATE TABLE ops.premises_sales_statuses
(
    id SERIAL PRIMARY KEY,
    status ops_premises_sales_statuses_enum
);
ALTER TABLE ops.premises_sales_statuses OWNER to postgres;


DROP TABLE ops.premises_seasons;
CREATE TABLE ops.premises_seasons
(
    id SERIAL PRIMARY KEY,
    status VARCHAR(255)
);
ALTER TABLE ops.premises_seasons OWNER to postgres;


DROP TABLE ops.premises;
CREATE TABLE ops.premises
(
    id SERIAL PRIMARY KEY,
    uprn BIGINT,
    udprn INTEGER,
    umprn INTEGER,
    build_status_id INTEGER,
    sales_status_id INTEGER,
    season_id INTEGER,
    year INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    x_coordinate DOUBLE PRECISION,
    y_coordinate DOUBLE PRECISION,
    geom GEOMETRY,
    FOREIGN KEY (sales_status_id) REFERENCES ops.premises_sales_statuses (id)
);
ALTER TABLE ops.premises OWNER to postgres;
DROP INDEX IF EXISTS ops_premises_udprn_idx;
CREATE INDEX IF NOT EXISTS ops_premises_udprn_idx ON ops.premises (udprn);
DROP INDEX IF EXISTS ops_premises_umprn_idx;
CREATE INDEX IF NOT EXISTS ops_premises_umprn_idx ON ops.premises (umprn);

INSERT INTO ops.premises_sales_statuses (status) VALUES ('order');
INSERT INTO ops.premises_sales_statuses (status) VALUES ('pre_order');
INSERT INTO ops.premises_sales_statuses (status) VALUES ('register_interest');

EOF


