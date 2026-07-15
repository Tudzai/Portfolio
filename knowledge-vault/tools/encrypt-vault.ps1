param(
  [string]$InputPath = "",
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$vaultDirectory = Split-Path -Parent $scriptDirectory
$nodeScript = Join-Path $scriptDirectory "encrypt-vault.mjs"

if (-not $InputPath) {
  $InputPath = Join-Path $vaultDirectory "private\knowledge.json"
}

if (-not $OutputPath) {
  $OutputPath = Join-Path $vaultDirectory "vault-data.js"
}

$securePassword = Read-Host "Vault password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
  $env:VAULT_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  & node $nodeScript $InputPath $OutputPath
  if ($LASTEXITCODE -ne 0) {
    throw "Vault encryption failed with exit code $LASTEXITCODE."
  }
}
finally {
  Remove-Item Env:VAULT_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}
