#!/bin/sh
#
#DB_HOSTNAME=odin-prod.cvleggfozj2t.eu-west-2.rds.amazonaws.com
#DB_PORT=5432
#DB_USERNAME=postgres
#DB_NAME=odin
#DB_PASSWORD=POonl3ZGe3uvuMcmvphgFoIzQs

DB_HOSTNAME=odin-dev-2020-05-04-10-29.c0bfvabolc0x.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=QSe0m1VTXeAUou9L
DB_NAME=odin
DB_SYNCHRONIZE=true

psql -h $DB_HOSTNAME -U $DB_USERNAME $DB_NAME << EOF

DROP TABLE royal_mail.pafmrmisc;

CREATE SCHEMA IF NOT EXISTS royal_mail AUTHORIZATION postgres;

CREATE TABLE royal_mail.pafmrmisc
(
    id SERIAL PRIMARY KEY,
    postcode VARCHAR,
    posttown VARCHAR,
    dependent_locality VARCHAR,
    double_dependent_locality VARCHAR,
    thoroughfare_and_descriptor VARCHAR,
    dependent_thoroughfare_and_descriptor VARCHAR,
    building_number_owning_dp INTEGER,
    building_name_owning_dp VARCHAR,
    sub_building_name_owning_dp VARCHAR,
    department_name_owning_dp VARCHAR,
    organisation_name_owning_dp VARCHAR,
    udprn INTEGER,
    postcode_type VARCHAR,
    su_organisation_indicator_owning_dp VARCHAR,
    delivery_point_suffix VARCHAR,
    building_number INTEGER,
    building_name VARCHAR,
    sub_building_name VARCHAR,
    department_name VARCHAR,
    organisation_name VARCHAR,
    umprn INTEGER,
    su_organisation_indicator VARCHAR
);

ALTER TABLE royal_mail.pafmrmisc OWNER to postgres;

DROP INDEX IF EXISTS pafmrmisc_postcode_idx;
CREATE INDEX IF NOT EXISTS pafmrmisc_postcode_idx ON royal_mail.pafmrmisc (postcode);

DROP INDEX IF EXISTS pafmrmisc_udprn_idx;
CREATE INDEX IF NOT EXISTS pafmrmisc_udprn_idx ON royal_mail.pafmrmisc (udprn);

DROP INDEX IF EXISTS paf_udmprn_idx;
CREATE INDEX IF NOT EXISTS pafmrmisc_udmprn_idx ON royal_mail.pafmrmisc (umprn);

EOF

# CREATE SEQUENCE royal_mail.pafmrmisc_udprn_seq RESTART WITH 100000000;

