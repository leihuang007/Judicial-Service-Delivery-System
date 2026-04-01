create table if not exists case_party (
    id bigserial primary key,
    case_id bigint not null references case_info(id),
    party_name varchar(128) not null,
    party_type varchar(32) not null,
    legal_role varchar(32) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists party_contact (
    id bigserial primary key,
    party_id bigint not null references case_party(id),
    contact_type varchar(16) not null,
    contact_value varchar(256) not null,
    is_primary boolean not null default false,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index if not exists idx_case_party_case_id on case_party(case_id);
create index if not exists idx_party_contact_party_id on party_contact(party_id);
