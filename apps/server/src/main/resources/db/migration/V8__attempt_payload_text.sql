alter table service_attempt
    alter column request_payload type text using request_payload::text,
    alter column response_payload type text using response_payload::text;
