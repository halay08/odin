#!/bin/sh

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

DROP TABLE royal_mail.pafmr;

CREATE SCHEMA IF NOT EXISTS royal_mail AUTHORIZATION postgres;

CREATE TABLE royal_mail.pafmr
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

ALTER TABLE royal_mail.pafmr OWNER to postgres;

DROP INDEX IF EXISTS pafmr_postcode_idx;
CREATE INDEX IF NOT EXISTS pafmr_postcode_idx ON royal_mail.pafmr (postcode);

DROP INDEX IF EXISTS pafmr_udprn_idx;
CREATE INDEX IF NOT EXISTS pafmr_udprn_idx ON royal_mail.pafmr (udprn);

DROP INDEX IF EXISTS paf_udmprn_idx;
CREATE INDEX IF NOT EXISTS paf_udmprn_idx ON royal_mail.pafmr (umprn);

\copy royal_mail.pafmr (postcode, \
    posttown, \
    dependent_locality, \
    double_dependent_locality, \
    thoroughfare_and_descriptor, \
    dependent_thoroughfare_and_descriptor, \
    building_number_owning_dp, \
    building_name_owning_dp, \
    sub_building_name_owning_dp, \
    department_name_owning_dp, \
    organisation_name_owning_dp, \
    udprn, \
    postcode_type, \
    su_organisation_indicator_owning_dp, \
    delivery_point_suffix, \
    building_number, \
    building_name, \
    sub_building_name, \
    department_name, \
    organisation_name, \
    umprn, \
    su_organisation_indicator \
) from ~/Desktop/Y20M05/CSV_MULRES/CSV_Multiple_Residence.csv WITH (FORMAT csv, null " ", DELIMITER ',', FORCE_NULL(building_number,building_number_owning_dp));

EOF

