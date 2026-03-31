create table if not exists service_audit_log (
    id bigserial primary key,
    action_type varchar(64) not null,
    actor varchar(128) not null,
    resource_type varchar(64) not null,
    resource_id varchar(64) not null,
    action_time timestamptz not null default now()
);
