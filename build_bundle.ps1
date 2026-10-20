# =============================================================================
# Kitchen Accountability ERP - Bundle React Components
# Combines all modular React JSX components into static/js/app-bundle.jsx
# =============================================================================

$files = @(
  "static/js/components/Common.jsx",
  "static/js/components/Toast.jsx",
  "static/js/components/Header.jsx",
  "static/js/components/Navigation.jsx",
  "static/js/components/SyncBanner.jsx",
  "static/js/components/Common/ModernDonutChart.jsx",
  "static/js/components/Orders/StatsCards.jsx",
  "static/js/components/Orders/OrdersToolbar.jsx",
  "static/js/components/Orders/OrdersTable.jsx",
  "static/js/components/Orders/OrdersMobileCards.jsx",
  "static/js/components/Orders/Pagination.jsx",
  "static/js/components/Vendors/VendorSection.jsx",
  "static/js/components/Cooks/CookSection.jsx",
  "static/js/components/Analytics/AnalyticsSection.jsx",
  "static/js/components/Policy/PolicySection.jsx",
  "static/js/components/Common/CreateSheetModal.jsx",
  "static/js/components/Orders/OrderModals.jsx",
  "static/js/components/Vendors/VendorModals.jsx",
  "static/js/components/Cooks/CookModals.jsx",
  "static/js/components/Modals.jsx",
  "static/js/App.jsx",
  "static/js/index.jsx"
)

$bundleContent = "// =============================================================================`n// Kitchen Accountability ERP - Consolidated App Bundle (React 19)`n// =============================================================================`n`n"

foreach ($f in $files) {
  $filePath = Join-Path $PSScriptRoot $f
  if (Test-Path $filePath) {
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $bundleContent += "// --- Component: $f ---`n" + $content + "`n`n"
  } else {
    Write-Error "File not found: $filePath"
  }
}

$destPath = Join-Path $PSScriptRoot "static/js/app-bundle.jsx"
[System.IO.File]::WriteAllText($destPath, $bundleContent, [System.Text.Encoding]::UTF8)
Write-Output "Successfully generated app-bundle.jsx ($(([System.IO.FileInfo]$destPath).Length) bytes)"
