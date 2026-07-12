# OneThing DB 자동 백업 — Firebase RTDB 전체를 날짜 파일로 저장하고 60일 지난 백업은 정리
# 등록: 작업 스케줄러 "OneThing DB Backup" (매일 09:00) — 수동 실행도 가능
$ErrorActionPreference = "Stop"
$dir = "C:\AI\OneThing\backups"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$file = Join-Path $dir "onething-$stamp.json"
& npx --yes firebase-tools database:get / --project onething-7f4d7 -o $file
if ((Test-Path $file) -and ((Get-Item $file).Length -gt 100)) {
  Write-Output "백업 완료: $file ($([math]::Round((Get-Item $file).Length/1KB)) KB)"
} else {
  Write-Output "백업 실패 또는 빈 파일: $file"
  exit 1
}
# 60일 지난 백업 삭제
Get-ChildItem $dir -Filter "onething-*.json" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-60) } | Remove-Item -Force -Confirm:$false
