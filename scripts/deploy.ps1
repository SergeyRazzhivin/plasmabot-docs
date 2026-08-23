# Сборка сайта и деплой в ветку gh-pages (GitHub Pages).
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

npm run docs:build
if ($LASTEXITCODE -ne 0) { throw "docs:build failed" }

$dist = "docs/.vuepress/dist"
New-Item -ItemType File -Force (Join-Path $dist ".nojekyll") | Out-Null

Push-Location $dist
try {
    git init -b gh-pages
    git add -A
    git commit -m "deploy $(Get-Date -Format yyyy-MM-dd_HH-mm)"
    git push -f https://github.com/SergeyRazzhivin/plasmabot-docs.git gh-pages
    if ($LASTEXITCODE -ne 0) { throw "gh-pages push failed" }
} finally {
    Pop-Location
    Remove-Item -Recurse -Force (Join-Path $dist ".git") -ErrorAction SilentlyContinue
}
"deploy ok"
