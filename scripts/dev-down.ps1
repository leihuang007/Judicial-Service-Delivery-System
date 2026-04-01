$ErrorActionPreference = "SilentlyContinue"

Write-Host "[dev-down] Stopping frontend/backend processes..." -ForegroundColor Cyan

$ports = @(3000, 3001, 8080)
foreach ($p in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $connections) {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "[dev-down] Stopping infrastructure..." -ForegroundColor Cyan
docker compose -f infra/docker/docker-compose.yml down

Write-Host "[dev-down] Done." -ForegroundColor Green
