$ErrorActionPreference = "Stop"

Write-Host "[dev-up] Starting infrastructure..." -ForegroundColor Cyan
docker compose -f infra/docker/docker-compose.yml up -d

$root = Get-Location

Write-Host "[dev-up] Ensuring frontend dependencies..." -ForegroundColor Cyan
pnpm install | Out-Host

Write-Host "[dev-up] Starting backend on :8080..." -ForegroundColor Cyan
$backendRunning = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if (-not $backendRunning) {
  Start-Process powershell -ArgumentList "-NoProfile", "-Command", "Set-Location '$root\\apps\\server'; mvn -q test; mvn -f pom.xml org.springframework.boot:spring-boot-maven-plugin:3.3.5:run"
} else {
  Write-Host "[dev-up] Backend already running on 8080" -ForegroundColor Yellow
}

Write-Host "[dev-up] Starting frontend on :3000..." -ForegroundColor Cyan
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $frontendRunning) {
  Start-Process powershell -ArgumentList "-NoProfile", "-Command", "Set-Location '$root'; pnpm --filter web-portal dev -- --port 3000"
} else {
  Write-Host "[dev-up] Frontend already running on 3000" -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

Write-Host "[dev-up] Done." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:8080/api/system/healthz"
Write-Host "RabbitMQ: http://localhost:15672"
Write-Host "MinIO:    http://localhost:9001"
