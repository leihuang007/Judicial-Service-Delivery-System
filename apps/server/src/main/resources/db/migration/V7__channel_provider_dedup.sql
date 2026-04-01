delete from channel_provider a
using channel_provider b
where a.id > b.id
  and a.provider_name = b.provider_name
  and a.channel_type = b.channel_type;

create unique index if not exists uk_channel_provider_name_type
on channel_provider(provider_name, channel_type);
