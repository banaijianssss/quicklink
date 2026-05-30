# QuickLink 本地一键安装
Set-Location $PSScriptRoot\..

Write-Host "Installing dependencies..."
npm install --no-fund --no-audit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing database schema..."
npm run db:push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Seeding demo user..."
npm run db:seed

Write-Host "Running tests..."
npm test

Write-Host ""
Write-Host "Done! Run: npm run dev"
Write-Host "Demo login: demo@quicklink.test / demo12345"
