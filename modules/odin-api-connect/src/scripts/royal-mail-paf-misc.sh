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

DROP TABLE royal_mail.pafmisc;

CREATE SCHEMA IF NOT EXISTS royal_mail AUTHORIZATION postgres;

CREATE TABLE royal_mail.pafmisc
(
    id SERIAL PRIMARY KEY,
    postcode VARCHAR,
    posttown VARCHAR,
    dependent_locality VARCHAR,
    double_dependent_locality VARCHAR,
    thoroughfare_and_descriptor VARCHAR,
    dependent_thoroughfare_and_descriptor VARCHAR,
    building_number VARCHAR,
    building_name VARCHAR,
    sub_building_name VARCHAR,
    po_box VARCHAR,
    department_name VARCHAR,
    organization_name VARCHAR,
    udprn INTEGER,
    postcode_type VARCHAR,
    su_organization_indicator VARCHAR,
    delivery_point_suffix VARCHAR,
    address_key VARCHAR,
    organization_key VARCHAR,
    number_of_households VARCHAR,
    locality_key VARCHAR
);

ALTER TABLE royal_mail.pafmisc OWNER to postgres;

DROP INDEX IF EXISTS pafmisc_postcode_idx;
CREATE INDEX IF NOT EXISTS pafmisc_postcode_idx ON royal_mail.pafmisc (postcode);

DROP INDEX IF EXISTS pafmisc_udprn_idx;
CREATE INDEX IF NOT EXISTS pafmisc_udprn_idx ON royal_mail.pafmisc (udprn);

EOF

# CREATE SEQUENCE royal_mail.pafmisc_udprn_seq START 100000000;
# SELECT nextval('royal_mail.pafmisc_udprn_seq');


## Check file encoding
# file  ~/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv
# /Users/franktruglio/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv: ASCII text, with CRLF line terminators

