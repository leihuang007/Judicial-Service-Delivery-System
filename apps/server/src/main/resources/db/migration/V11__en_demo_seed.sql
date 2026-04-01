-- English demo dataset for Account 2 (Suzhou scope).

insert into case_info(case_no, case_type, court_code, tribunal_code, case_status, accepted_at, created_at, updated_at)
values
('（2026）苏05民初3341号', 'Contract Dispute', '苏州市中级人民法院', 'Civil Tribunal II', 'IN_SERVICE', now() - interval '10 days', now() - interval '10 days', now() - interval '3 hours')
on conflict (case_no) do nothing;

insert into service_task(task_no, case_id, doc_type, party_name, current_status, legal_deadline_at, created_at, updated_at)
values
('RW202604010101', (select id from case_info where case_no = '（2026）苏05民初3341号'), 'NOTICE', 'Defendant Suzhou Orion Trading Co., Ltd.', 'IN_PROGRESS', now() + interval '18 hours', now() - interval '1 days', now() - interval '30 minutes'),
('RW202604010102', (select id from case_info where case_no = '（2026）苏05民初3341号'), 'SUMMONS', 'Plaintiff Daniel Wu', 'PENDING', now() + interval '40 hours', now() - interval '8 hours', now() - interval '20 minutes')
on conflict (task_no) do nothing;

insert into case_party(case_id, party_name, party_type, legal_role, created_at, updated_at)
values
((select id from case_info where case_no = '（2026）苏05民初3341号'), 'Suzhou Orion Trading Co., Ltd.', 'ORG', 'DEFENDANT', now() - interval '9 days', now() - interval '3 hours'),
((select id from case_info where case_no = '（2026）苏05民初3341号'), 'Daniel Wu', 'PERSON', 'PLAINTIFF', now() - interval '9 days', now() - interval '3 hours')
on conflict do nothing;

insert into party_contact(party_id, contact_type, contact_value, is_primary, created_at, updated_at)
values
((select p.id from case_party p join case_info c on c.id = p.case_id where c.case_no = '（2026）苏05民初3341号' and p.party_name = 'Suzhou Orion Trading Co., Ltd.' limit 1), 'email', 'legal@orion-demo.com', true, now() - interval '9 days', now() - interval '3 hours'),
((select p.id from case_party p join case_info c on c.id = p.case_id where c.case_no = '（2026）苏05民初3341号' and p.party_name = 'Daniel Wu' limit 1), 'mobile', '13800138123', true, now() - interval '9 days', now() - interval '3 hours')
on conflict do nothing;
