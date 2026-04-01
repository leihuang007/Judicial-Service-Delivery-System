# API Quickstart

## Base URL

- `http://localhost:8080`

## Core endpoints

### Case

- `POST /api/cases`
- `GET /api/cases`
- `GET /api/cases/{caseId}`

### Party

- `POST /api/parties`
- `GET /api/parties?caseId={id}`
- `POST /api/parties/contacts`
- `GET /api/parties/contacts?partyId={id}`

### Task

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{taskId}`

### Channel Dispatch and Callback

- `POST /api/channels/dispatch`
- `POST /api/channels/callbacks/sms`
- `POST /api/channels/callbacks/email`
- `POST /api/channels/callbacks/postal`
- `POST /api/channels/callbacks/notary`
- `GET /api/channels/tasks/{taskId}/attempts`

### Strategy

- `POST /api/strategies`
- `GET /api/strategies`
- `GET /api/strategies/{id}`

### Evidence

- `POST /api/evidence`
- `GET /api/evidence?taskId={id}`

### Orchestration

- `GET /api/orchestration/alerts?hours=24`
- `POST /api/orchestration/tasks/{taskId}/evaluate`
- `GET /api/orchestration/exceptions/open`
- `POST /api/orchestration/tasks/{taskId}/report`
- `POST /api/orchestration/tasks/{taskId}/archive`

### Audit

- `GET /api/audit/recent`

## Minimal E2E order

1. Create case
2. Create party
3. Create contact
4. Create service task
5. Dispatch channel request
6. Send callback update
7. Create evidence

## Automated smoke

From repository root:

```powershell
pnpm e2e:smoke
```
