create table if not exists exception_ticket (
    id bigserial primary key,
    task_id bigint not null references service_task(id),
    level varchar(16) not null,
    code varchar(32) not null,
    status varchar(16) not null,
    note varchar(512),
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists delivery_report (
    id bigserial primary key,
    task_id bigint not null unique references service_task(id),
    report_no varchar(64) not null unique,
    report_content text not null,
    hash_sha256 varchar(64) not null,
    generated_at timestamptz not null
);

create table if not exists archive_binding (
    id bigserial primary key,
    task_id bigint not null references service_task(id),
    archive_system varchar(32) not null,
    archive_no varchar(128) not null,
    archive_status varchar(16) not null,
    created_at timestamptz not null
);

create index if not exists idx_exception_task_status on exception_ticket(task_id, status);
