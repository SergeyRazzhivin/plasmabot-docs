# Ежедневный лог Плазмобота: запускается планировщиком Windows в 12:00.
# Headless Claude собирает важное за сутки, дописывает docs/log/README.md
# и передеплоивает сайт (см. daily-log-prompt.md).
$ErrorActionPreference = "Continue"
Set-Location (Join-Path $PSScriptRoot "..")

$runLog = Join-Path $PSScriptRoot "daily-log-run.log"
"=== run $(Get-Date -Format s) ===" | Add-Content $runLog

$prompt = Get-Content -Raw (Join-Path $PSScriptRoot "daily-log-prompt.md")
& claude -p $prompt --model sonnet --permission-mode acceptEdits 2>&1 |
    Out-String | Add-Content $runLog

"=== end $(Get-Date -Format s) exit=$LASTEXITCODE ===" | Add-Content $runLog
