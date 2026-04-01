create table if not exists case_info (
    id bigserial primary key,
    case_no varchar(64) not null unique,
    case_type varchar(32) not null,
    court_code varchar(32) not null,
    tribunal_code varchar(32) not null,
    case_status varchar(32) not null,
    accepted_at timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists service_task (
    id bigserial primary key,
    task_no varchar(64) not null unique,
    case_id bigint not null references case_info(id),
    doc_type varchar(32) not null,
    party_name varchar(128) not null,
    current_status varchar(32) not null,
    legal_deadline_at timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index if not exists idx_case_info_case_status on case_info(case_status);
create index if not exists idx_service_task_status_deadline on service_task(current_status, legal_deadline_at);
create index if not exists idx_service_task_case_id on service_task(case_id);
