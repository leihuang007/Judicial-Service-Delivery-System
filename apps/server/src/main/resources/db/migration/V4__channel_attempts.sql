create table if not exists channel_provider (
    id bigserial primary key,
    provider_name varchar(128) not null,
    channel_type varchar(16) not null,
    enabled_flag boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists service_attempt (
    id bigserial primary key,
    task_id bigint not null references service_task(id),
    attempt_no int not null,
    channel_type varchar(16) not null,
    provider_id bigint references channel_provider(id),
    send_status varchar(32) not null,
    receipt_status varchar(32) not null,
    failure_code varchar(32),
    failure_message varchar(512),
    request_payload jsonb,
    response_payload jsonb,
    receipt_time timestamptz,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create unique index if not exists uk_service_attempt_task_attempt_no on service_attempt(task_id, attempt_no);
create index if not exists idx_service_attempt_task_id on service_attempt(task_id);
create index if not exists idx_service_attempt_channel_status on service_attempt(channel_type, receipt_status);

insert into channel_provider(provider_name, channel_type, enabled_flag, created_at, updated_at)
values
('default-sms', 'sms', true, now(), now()),
('default-email', 'email', true, now(), now()),
('default-postal', 'postal', true, now(), now()),
('default-notary', 'notary', true, now(), now())
on conflict do nothing;
