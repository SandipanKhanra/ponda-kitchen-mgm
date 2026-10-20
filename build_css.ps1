# =============================================================================
# Kitchen Accountability ERP - Bundle Component Stylesheets
# Combines all modular component CSS files into static/css/styles.bundle.css
# =============================================================================

$files = @(
  "static/css/variables.css",
  "static/css/base.css",
  "static/css/layout.css",
  "static/css/animations.css",
  "static/css/components/buttons.css",
  "static/css/components/badges.css",
  "static/css/components/cards.css",
  "static/css/components/table.css",
  "static/css/components/navigation.css",
  "static/css/components/banner.css",
  "static/css/components/toast.css",
  "static/css/components/modals.css",
  "static/css/components/orders.css",
  "static/css/components/vendors.css",
  "static/css/components/cooks.css",
  "static/css/components/analytics.css",
  "static/css/components/policy.css",
  "static/css/responsive.css"
)

$bundleHeader = "/* =============================================================================`n   Kitchen Accountability ERP - Consolidated Production Stylesheet`n   Auto-generated from modular component stylesheets`n   ============================================================================= */`n`n"
$bundleContent = $bundleHeader

foreach ($f in $files) {
  $filePath = Join-Path $PSScriptRoot $f
  if (Test-Path $filePath) {
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $bundleContent += "/* --- Module: $f --- */`n" + $content + "`n`n"
  } else {
    Write-Error "File not found: $filePath"
  }
}

$destPath = Join-Path $PSScriptRoot "static/css/styles.bundle.css"
[System.IO.File]::WriteAllText($destPath, $bundleContent, [System.Text.Encoding]::UTF8)
Write-Output "Successfully compiled styles.bundle.css ($(([System.IO.FileInfo]$destPath).Length) bytes)"

