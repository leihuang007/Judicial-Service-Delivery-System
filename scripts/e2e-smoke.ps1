$ErrorActionPreference = "Stop"

function Invoke-JsonPost($url, $body) {
  return Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body ($body | ConvertTo-Json -Depth 10)
}

$base = "http://localhost:8080"

Write-Host "[e2e] Creating case..." -ForegroundColor Cyan
$case = Invoke-JsonPost "$base/api/cases" @{
  caseNo = "(2026)E2E" + (Get-Random -Maximum 99999)
  caseType = "civil"
  courtCode = "ZJ01"
  tribunalCode = "T01"
  caseStatus = "REGISTERED"
  acceptedAt = (Get-Date).ToUniversalTime().ToString("o")
}

Write-Host "[e2e] Creating party..." -ForegroundColor Cyan
$party = Invoke-JsonPost "$base/api/parties" @{
  caseId = $case.id
  partyName = "E2E Party"
  partyType = "PERSON"
  legalRole = "DEFENDANT"
}

Write-Host "[e2e] Creating contact..." -ForegroundColor Cyan
$null = Invoke-JsonPost "$base/api/parties/contacts" @{
  partyId = $party.id
  contactType = "mobile"
  contactValue = "13800138000"
  isPrimary = $true
}

Write-Host "[e2e] Creating task..." -ForegroundColor Cyan
$deadline = (Get-Date).AddHours(2).ToUniversalTime().ToString("o")
$task = Invoke-JsonPost "$base/api/tasks" @{
  caseId = $case.id
  docType = "NOTICE"
  partyName = "E2E Party"
  legalDeadlineAt = $deadline
}

Write-Host "[e2e] Dispatching sms..." -ForegroundColor Cyan
$attempt = Invoke-JsonPost "$base/api/channels/dispatch" @{
  taskId = $task.id
  channelType = "sms"
  receiver = "13800138000"
  content = "E2E message"
}

Write-Host "[e2e] Callback delivered..." -ForegroundColor Cyan
$null = Invoke-JsonPost "$base/api/channels/callbacks/sms" @{
  attemptId = $attempt.id
  receiptStatus = "DELIVERED"
  failureCode = $null
  failureMessage = $null
}

Write-Host "[e2e] Evaluating task..." -ForegroundColor Cyan
$null = Invoke-JsonPost "$base/api/orchestration/tasks/$($task.id)/evaluate" @{}

Write-Host "[e2e] Creating evidence..." -ForegroundColor Cyan
$null = Invoke-JsonPost "$base/api/evidence" @{
  taskId = $task.id
  attemptId = $attempt.id
  evidenceType = "receipt"
  content = "delivery receipt from e2e"
}

Write-Host "[e2e] Generating report and archive..." -ForegroundColor Cyan
$null = Invoke-JsonPost "$base/api/orchestration/tasks/$($task.id)/report" @{}
$archive = Invoke-JsonPost "$base/api/orchestration/tasks/$($task.id)/archive" @{}

Write-Host "[e2e] Done. Archived with no: $($archive.archiveNo)" -ForegroundColor Green
