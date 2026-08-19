param(
  [string]$InputPath = "",
  [string]$OutputPath = "",
  [switch]$ChangePassword
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

$passwordPointer = [IntPtr]::Zero
$currentPasswordPointer = [IntPtr]::Zero
$confirmationPointer = [IntPtr]::Zero

try {
  if ($ChangePassword) {
    $currentSecurePassword = Read-Host "Current vault password" -AsSecureString
    $securePassword = Read-Host "New vault password" -AsSecureString
    $confirmation = Read-Host "Confirm new vault password" -AsSecureString
    $currentPasswordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentSecurePassword)
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $confirmationPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirmation)

    $newPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $confirmedPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($confirmationPointer)
    if ($newPassword -cne $confirmedPassword) {
      throw "The new vault passwords do not match."
    }

    $env:VAULT_CURRENT_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($currentPasswordPointer)
    $env:VAULT_PASSWORD = $newPassword
  }
  else {
    $securePassword = Read-Host "Vault password" -AsSecureString
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:VAULT_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  }

  & node $nodeScript $InputPath $OutputPath
  if ($LASTEXITCODE -ne 0) {
    throw "Vault encryption failed with exit code $LASTEXITCODE."
  }
}
finally {
  Remove-Item Env:VAULT_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:VAULT_CURRENT_PASSWORD -ErrorAction SilentlyContinue
  if ($passwordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
  if ($currentPasswordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($currentPasswordPointer)
  }
  if ($confirmationPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmationPointer)
  }
}
