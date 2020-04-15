#!/bin/sh

DB_HOSTNAME=cosmos.chbucothrs1f.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=3b3zrMrnxAcvusTtf8g2
DB_NAME=cosmos
DB_SYNCHRONIZE=true

psql -h $DB_HOSTNAME -U $DB_USERNAME $DB_NAME <<EOF

DROP TABLE os.lr_master;

CREATE TABLE os.lr_master
(
    id SERIAL PRIMARY KEY,
    poly_id numeric(9),
    title_no character varying(9),
    geom geometry,
    uprn bigint,
    el character varying (255),
    af character varying (255),
    tenure character varying (255),
    address text,
    postcode character varying (255),
    price integer,
    main_proprietor character varying (255),
    country character varying (255),
    company_reg_num integer,
    proprietorship_category character varying (255),
    proprietor_address text,
    num_of_addresses smallint,
    additional_properties smallint,
    borough text
);

ALTER TABLE os.lr_master OWNER to postgres;

DROP INDEX IF EXISTS os_lr_master_uprn_idx;
CREATE INDEX IF NOT EXISTS os_lr_master_uprn_idx ON os.lr_master (uprn);

\copy os.lr_master (poly_id, \
    title_no, \
    geom, \
    uprn, \
    el, \
    af, \
    tenure, \
    address, \
    postcode, \
    price, \
    main_proprietor, \
    country, \
    company_reg_num, \
    proprietorship_category, \
    proprietor_address, \
    num_of_addresses, \
    additional_properties, \
    borough \
) from ./lr_master.csv WITH (FORMAT csv, HEADER true, DELIMITER ',', encoding 'windows-1251');

EOF

## Check file encoding
# file  ~/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv
# /Users/franktruglio/Desktop/Y20M05/CSV_PAF/CSV_PAF.csv: ASCII text, with CRLF line terminators
