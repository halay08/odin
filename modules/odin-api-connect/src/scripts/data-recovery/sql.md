
select count(*) from db_records where created_at > '2020-11-12 19:49:57.106815';
select count(*) from db_records where created_at < '2020-11-12 19:49:57.106815' AND updated_at > '2020-11-12 19:49:57.106815';

select count(*) from db_records_columns where created_at > '2020-11-12 19:49:57.106815';
select count(*) from db_records_columns where created_at < '2020-11-12 19:49:57.106815' AND updated_at > '2020-11-12 19:49:57.106815';

select count(*) from db_records_associations where created_at > '2020-11-12 19:49:57.106815';
select count(*) from db_records_associations where created_at < '2020-11-12 19:49:57.106815' AND updated_at > '2020-11-12 19:49:57.106815';

select count(*) from db_records_associations_columns where created_at > '2020-11-12 19:49:57.106815';
select count(*) from db_records_associations_columns where created_at < '2020-11-12 19:49:57.106815' AND updated_at > '2020-11-12 19:49:57.106815';


select count(*) from logs.user_activity where created_at > '2020-11-12 19:49:57.106815';
