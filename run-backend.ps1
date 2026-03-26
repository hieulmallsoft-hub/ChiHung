$ErrorActionPreference = 'Stop'
$mavenBin = Join-Path $env:USERPROFILE 'tools\apache-maven-3.9.6\bin'
$mvnCmd = Join-Path $mavenBin 'mvn.cmd'

if (!(Test-Path $mvnCmd)) {
  throw "Maven not found at $mvnCmd"
}

$env:Path = "$mavenBin;$env:Path"
$jdkRoot = Join-Path $env:USERPROFILE 'tools\temurin-17'
if (Test-Path $jdkRoot) {
  $jdkHome = Get-ChildItem $jdkRoot -Directory | Select-Object -First 1 -ExpandProperty FullName
  if ($jdkHome -and (Test-Path (Join-Path $jdkHome 'bin\java.exe'))) {
    $env:JAVA_HOME = $jdkHome
    $env:Path = "$jdkHome\bin;$env:Path"
  }
}

if (-not $env:DB_URL) { $env:DB_URL = 'jdbc:postgresql://localhost:5432/sportshop_graduation' }
if (-not $env:DB_USERNAME) { $env:DB_USERNAME = 'postgres' }
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = 'postgres' }
if (-not $env:SPRING_FLYWAY_ENABLED) { $env:SPRING_FLYWAY_ENABLED = 'false' }
if (-not $env:SPRING_JPA_DDL_AUTO) { $env:SPRING_JPA_DDL_AUTO = 'update' }
Write-Host "[backend] Using DB_URL=$($env:DB_URL)"
Write-Host "[backend] Using DB_USERNAME=$($env:DB_USERNAME)"
Write-Host "[backend] Using SPRING_FLYWAY_ENABLED=$($env:SPRING_FLYWAY_ENABLED)"
Write-Host "[backend] Using SPRING_JPA_DDL_AUTO=$($env:SPRING_JPA_DDL_AUTO)"

Push-Location (Join-Path $PSScriptRoot 'backend')
try {
  $localRepo = Join-Path $PSScriptRoot '.m2\repository'
  New-Item -ItemType Directory -Force -Path $localRepo | Out-Null
  & $mvnCmd "-Dmaven.repo.local=$localRepo" 'spring-boot:run'
}
finally {
  Pop-Location
}
