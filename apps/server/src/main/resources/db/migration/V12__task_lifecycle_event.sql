create table if not exists task_lifecycle_event (
    id bigserial primary key,
    task_id bigint not null references service_task(id),
    event_type varchar(64) not null,
    from_status varchar(32),
    to_status varchar(32),
    event_note varchar(512),
    actor varchar(128) not null,
    created_at timestamptz not null
);

create index if not exists idx_task_lifecycle_event_task_time
on task_lifecycle_event(task_id, created_at desc, id desc);
