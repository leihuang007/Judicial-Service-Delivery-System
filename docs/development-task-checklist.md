# Development Task Checklist

This checklist defines the full development scope and tracks completion progress.

## Phase 0 - Foundation

- [x] Monorepo scaffold
- [x] Frontend i18n baseline (`zh-CN`, `en-US`)
- [x] Backend bootstrap and health endpoint
- [x] Docker local dependencies
- [x] CI baseline and branch protection guidance

## Phase 1 - Core Business (In Progress)

- [x] Create development checklist and phased execution plan
- [x] Case management API (create/list/query)
- [x] Party/contact API
- [x] Service task API (create/list/detail/status flow)
- [x] Flyway schema for case/task core tables
- [x] API request validation and error responses
- [x] Audit event persistence for write operations

## Phase 1 Status

- Completed: Case API, Party/Contact API, Task API, Flyway core schema, validation, write-audit persistence
- Next: Phase 2 delivery channel adapters and callback ingestion

## Phase 2 - Delivery Channels

- [x] SMS channel adapter and callback receiver
- [x] Email channel adapter and callback receiver
- [x] Postal adapter and tracking ingestion
- [x] Notary adapter and certificate ingestion
- [x] Unified attempt log model and channel status mapping

## Phase 3 - Rule and Orchestration

- [x] Strategy/rule configuration model
- [x] Channel selection and retry policy
- [x] Deadline alerts and escalation policy
- [x] Effective service determination pipeline

## Phase 4 - Evidence and Archive

- [x] Evidence record model and storage integration
- [x] Delivery report generation
- [x] Archive integration API
- [x] Hash/timestamp persistence

## Phase 5 - Frontend Business Console

- [x] Dashboard data integration
- [x] Case list/detail pages
- [x] Task list/detail pages
- [x] Exception workbench
- [x] Rule configuration pages
- [x] Audit query pages

## Phase 6 - Quality and Release

- [x] Unit/integration tests for core APIs
- [x] E2E smoke flow for create->deliver->evidence
- [ ] Security hardening and sensitive field masking
- [ ] Performance baseline and operational metrics
- [ ] Release checklist and production readiness

## Current Sprint Target

Deliver Phase 1 core API slices for Case + Service Task with Flyway schema and validation.
