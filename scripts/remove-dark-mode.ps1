# Remove Dark Mode Classes Script
# This script removes all dark: prefixed Tailwind classes from the codebase

Write-Host "Scanning for dark: classes..." -ForegroundColor Cyan

# Find all files with dark: classes
$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts,*.jsx,*.js -File | 
    Where-Object { (Get-Content $_.FullName -Raw) -match "dark:" }

Write-Host "Found $($files.Count) files with dark: classes" -ForegroundColor Yellow

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove dark: classes from className strings
    # Pattern 1: Remove dark:class-name from className
    $content = $content -replace '\s+dark:[a-zA-Z0-9\-\/\[\]\.]+', ''
    
    # Pattern 2: Remove dark: from template literals  
    $content = $content -replace 'dark:[a-zA-Z0-9\-\/\[\]\.]+\s*', ''
    
    # Count changes
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $changes = ([regex]::Matches($originalContent, 'dark:')).Count
        $totalReplacements += $changes
        Write-Host "  Fixed $($file.Name): Removed $changes dark: classes" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Complete! Removed $totalReplacements dark: classes from $($files.Count) files" -ForegroundColor Green
Write-Host "Running build to verify..." -ForegroundColor Cyan

# Run build to verify
npm run build

Write-Host ""
Write-Host "Dark mode cleanup complete!" -ForegroundColor Green
