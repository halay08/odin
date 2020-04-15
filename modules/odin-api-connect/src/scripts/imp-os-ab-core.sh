#!/bin/sh

# 2.AddressBase Core Structure

DB_HOSTNAME=cosmos.chbucothrs1f.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=3b3zrMrnxAcvusTtf8g2
DB_NAME=cosmos
DB_SYNCHRONIZE=true

psql -h $DB_HOSTNAME -U $DB_USERNAME $DB_NAME <<EOF

DROP TABLE os.ab_core;

CREATE TABLE os.ab_core
(
    id SERIAL PRIMARY KEY,
    uprn integer(12),
    parent_uprn integer(12),
    udprn integer(8),
    usrn integer(8),
    toid character varying (20),
    classification_code character varying (4),
    easting numeric(8,2),
    northing numeric(8,2),
    latitude numeric(9,7),
    longitude numeric(8,7),
    rpc integer,
    last_update_date date,
    single_line_address character varying (500),
    po_box character varying (13),
    organisation character varying (100),
    sub_building character varying (110),
    building_name character varying (110),
    building_number character varying (13),
    street_name character varying (100),
    locality character varying (35),
    town_name character varying (35),
    post_town character varying (30),
    island character varying (50),
    postcode character varying (8),
    delivery_point_suffix character varying (2),
    gss_code character varying (9),
    change_code character(1)
);

ALTER TABLE os.ab_core OWNER to postgres;

DROP INDEX IF EXISTS os_ab_core_uprn_idx;
CREATE INDEX IF NOT EXISTS os_ab_core_uprn_idx ON os.ab_core (uprn);

\copy os.ab_core (uprn, \
    parent_uprn, \
    udprn, \
    usrn, \
    toid, \
    classification_code, \
    easting, \
    northing, \
    latitude, \
    longitude, \
    rpc, \
    last_update_date, \
    single_line_address, \
    po_box, \
    organisation, \
    sub_building, \
    building_name, \
    building_number, \
    street_name, \
    locality, \
    town_name, \
    post_town, \
    island, \
    postcode, \
    delivery_point_suffix, \
    gss_code, \
    change_code \
) from ./AddressBaseCore_FULL_2020-07-20_001.csv WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '\', encoding 'windows-1251');

EOF

## Check file encoding
# file  ~/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv
# /Users/franktruglio/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv: ASCII text, with CRLF line terminators
