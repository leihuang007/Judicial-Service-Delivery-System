-- Chinese demo dataset for web portal pages.
-- Keep status codes in English to preserve existing orchestration logic.

insert into case_info(case_no, case_type, court_code, tribunal_code, case_status, accepted_at, created_at, updated_at)
values
('（2026）沪0115民初12876号', '买卖合同纠纷', '上海市浦东新区人民法院', '民事审判第一庭', 'REGISTERED', now() - interval '26 days', now() - interval '26 days', now() - interval '2 days'),
('（2026）京0105执恢452号', '执行异议之诉', '北京市朝阳区人民法院', '执行裁判庭', 'IN_SERVICE', now() - interval '19 days', now() - interval '19 days', now() - interval '1 days'),
('（2026）粤0304民初9032号', '物业服务合同纠纷', '深圳市福田区人民法院', '民事审判第二庭', 'IN_SERVICE', now() - interval '12 days', now() - interval '12 days', now() - interval '4 hours'),
('（2026）苏0104民初7761号', '劳动争议', '南京市秦淮区人民法院', '民事审判第三庭', 'CLOSED', now() - interval '35 days', now() - interval '35 days', now() - interval '6 days')
on conflict (case_no) do nothing;

insert into service_task(task_no, case_id, doc_type, party_name, current_status, legal_deadline_at, created_at, updated_at)
values
('RW202604010001', (select id from case_info where case_no = '（2026）沪0115民初12876号'), '起诉状副本', '被告 张三', 'PENDING', now() + interval '20 hours', now() - interval '3 days', now() - interval '3 hours'),
('RW202604010002', (select id from case_info where case_no = '（2026）京0105执恢452号'), '执行通知书', '被执行人 北京某科技有限公司', 'IN_PROGRESS', now() + interval '44 hours', now() - interval '2 days', now() - interval '2 hours'),
('RW202604010003', (select id from case_info where case_no = '（2026）粤0304民初9032号'), '开庭传票', '被告 深圳某物业管理有限公司', 'FAILED_NEED_REMEDY', now() - interval '6 hours', now() - interval '2 days', now() - interval '40 minutes'),
('RW202604010004', (select id from case_info where case_no = '（2026）苏0104民初7761号'), '判决书', '原告 李四', 'EFFECTIVE', now() - interval '30 hours', now() - interval '7 days', now() - interval '20 hours'),
('RW202604010005', (select id from case_info where case_no = '（2026）苏0104民初7761号'), '裁定书', '被告 南京某贸易有限公司', 'ARCHIVED', now() - interval '72 hours', now() - interval '9 days', now() - interval '3 days')
on conflict (task_no) do nothing;

insert into case_party(case_id, party_name, party_type, legal_role, created_at, updated_at)
values
((select id from case_info where case_no = '（2026）沪0115民初12876号'), '张三', 'PERSON', 'DEFENDANT', now() - interval '26 days', now() - interval '2 days'),
((select id from case_info where case_no = '（2026）京0105执恢452号'), '北京某科技有限公司', 'ORG', 'RESPONDENT', now() - interval '19 days', now() - interval '1 days'),
((select id from case_info where case_no = '（2026）粤0304民初9032号'), '深圳某物业管理有限公司', 'ORG', 'DEFENDANT', now() - interval '12 days', now() - interval '4 hours')
on conflict do nothing;

insert into party_contact(party_id, contact_type, contact_value, is_primary, created_at, updated_at)
values
((select p.id from case_party p join case_info c on c.id = p.case_id where c.case_no = '（2026）沪0115民初12876号' and p.party_name = '张三' limit 1), 'mobile', '13800138011', true, now() - interval '25 days', now() - interval '2 days'),
((select p.id from case_party p join case_info c on c.id = p.case_id where c.case_no = '（2026）京0105执恢452号' and p.party_name = '北京某科技有限公司' limit 1), 'email', 'legal@demo-company.cn', true, now() - interval '18 days', now() - interval '1 days'),
((select p.id from case_party p join case_info c on c.id = p.case_id where c.case_no = '（2026）粤0304民初9032号' and p.party_name = '深圳某物业管理有限公司' limit 1), 'mobile', '13800138022', true, now() - interval '11 days', now() - interval '4 hours')
on conflict do nothing;

insert into service_attempt(task_id, attempt_no, channel_type, provider_id, send_status, receipt_status, failure_code, failure_message, request_payload, response_payload, receipt_time, created_at, updated_at)
values
((select id from service_task where task_no = 'RW202604010002'), 1, 'sms', (select id from channel_provider where provider_name = 'default-sms' and channel_type = 'sms' limit 1), 'SENT', 'DELIVERED', null, null, '{"mobile":"13800138099","template":"EXEC_NOTICE"}', '{"providerReceiptNo":"SMS-20260401002"}', now() - interval '30 minutes', now() - interval '2 hours', now() - interval '30 minutes'),
((select id from service_task where task_no = 'RW202604010003'), 1, 'postal', (select id from channel_provider where provider_name = 'default-postal' and channel_type = 'postal' limit 1), 'SENT', 'UNDELIVERED', 'ADDR_NOT_FOUND', '退件：地址信息不完整', '{"address":"深圳市福田区某路88号"}', '{"trackingNo":"YZ20260401003"}', now() - interval '50 minutes', now() - interval '22 hours', now() - interval '50 minutes')
on conflict (task_id, attempt_no) do nothing;

insert into evidence_record(task_id, attempt_id, evidence_type, content, hash_sha256, created_at)
values
((select id from service_task where task_no = 'RW202604010002'),
 (select id from service_attempt where task_id = (select id from service_task where task_no = 'RW202604010002') and attempt_no = 1),
 'receipt',
 '短信送达回执：已送达，接收号码尾号0099。',
 '3ca0f8f43eeb17c6816f25de4c8606e3a4f8ccd27f6ef2c4987af28fdc7c5821',
 now() - interval '20 minutes'),
((select id from service_task where task_no = 'RW202604010003'),
 (select id from service_attempt where task_id = (select id from service_task where task_no = 'RW202604010003') and attempt_no = 1),
 'postal_return',
 '邮寄退件记录：投递地址缺失门牌号，建议补正后再次邮寄。',
 '6d93a2e3235a453b605f4d63f65fbc07a3d5ab52d250d95dc50f0dbe54b8095f',
 now() - interval '35 minutes')
on conflict do nothing;
