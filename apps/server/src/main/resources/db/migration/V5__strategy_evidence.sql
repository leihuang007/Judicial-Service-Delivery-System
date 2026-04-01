create table if not exists service_strategy (
    id bigserial primary key,
    strategy_name varchar(128) not null,
    case_type varchar(32),
    channel_sequence varchar(128) not null,
    retry_max_times int not null default 2,
    enabled_flag boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists evidence_record (
    id bigserial primary key,
    task_id bigint not null references service_task(id),
    attempt_id bigint references service_attempt(id),
    evidence_type varchar(32) not null,
    content text not null,
    hash_sha256 varchar(64) not null,
    created_at timestamptz not null
);

create index if not exists idx_strategy_case_type on service_strategy(case_type);
create index if not exists idx_evidence_task_id on evidence_record(task_id);

insert into service_strategy(strategy_name, case_type, channel_sequence, retry_max_times, enabled_flag, created_at, updated_at)
values
('default-civil', 'civil', 'sms,email,postal,notary', 2, true, now(), now()),
('default-enforcement', 'enforcement', 'sms,postal,notary', 3, true, now(), now())
on conflict do nothing;
