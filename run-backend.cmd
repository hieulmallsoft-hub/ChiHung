@echo off
set JDK17_ROOT=%USERPROFILE%\tools\temurin-17
for /d %%D in ("%JDK17_ROOT%\*") do (
  set JAVA_HOME=%%~fD
  goto :jdk_found
)
:jdk_found
if not defined JAVA_HOME (
  echo JDK 17 not found in %JDK17_ROOT%
  exit /b 1
)
set PATH=%JAVA_HOME%\bin;%PATH%

set MAVEN_BIN=%USERPROFILE%\tools\apache-maven-3.9.6\bin
if not exist "%MAVEN_BIN%\mvn.cmd" (
  echo Maven not found at %MAVEN_BIN%\mvn.cmd
  exit /b 1
)
set LOCAL_M2=%~dp0.m2\repository
if not exist "%LOCAL_M2%" mkdir "%LOCAL_M2%"

if "%DB_URL%"=="" set DB_URL=jdbc:postgresql://localhost:5432/sportshop_graduation
if "%DB_USERNAME%"=="" set DB_USERNAME=postgres
if "%DB_PASSWORD%"=="" set DB_PASSWORD=postgres
if "%SPRING_FLYWAY_ENABLED%"=="" set SPRING_FLYWAY_ENABLED=false
if "%SPRING_JPA_DDL_AUTO%"=="" set SPRING_JPA_DDL_AUTO=update

echo [backend] Using DB_URL=%DB_URL%
echo [backend] Using DB_USERNAME=%DB_USERNAME%
echo [backend] Using SPRING_FLYWAY_ENABLED=%SPRING_FLYWAY_ENABLED%
echo [backend] Using SPRING_JPA_DDL_AUTO=%SPRING_JPA_DDL_AUTO%

"%MAVEN_BIN%\mvn.cmd" -Dmaven.repo.local="%LOCAL_M2%" -f "%~dp0backend\pom.xml" spring-boot:run
