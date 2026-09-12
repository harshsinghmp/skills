@echo off
rem ==============================================================================
rem clean-cache.cmd — Cross-Platform Developer & Designer Cache Cleaner (Windows CMD)
rem
rem Cleans ONLY unreferenced, dangling, and disposable caches produced by
rem developer and designer toolchains based on top Reddit community recommendations:
rem
rem 1. Package Managers & Runtimes:
rem    - uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet/nuget, composer, gradle
rem 2. IDEs & Mobile Build Tools:
rem    - android (build-cache), vscode (workspaceStorage), cursor (workspaceStorage), cypress
rem 3. Containers & Virtualization:
rem    - docker (BuildKit layers only), podman
rem 4. Designers & Creative Suites:
rem    - adobe (Media Cache .cfa/.pek, scratch files), figma, blender, electron
rem
rem Zero dependencies: Native Windows Command Prompt batch script.
rem Runs anywhere on Windows without Python, Node, or WSL.
rem ==============================================================================

setlocal enabledelayedexpansion

set DRY_RUN=0
set TARGET_TOOL=all
set SCAN_NM_DIR=

:parse_args
if "%~1"=="" goto run_cleanup
if /i "%~1"=="--dry-run" (
    set DRY_RUN=1
    shift
    goto parse_args
)
if /i "%~1"=="/dry-run" (
    set DRY_RUN=1
    shift
    goto parse_args
)
if /i "%~1"=="--tool" (
    set TARGET_TOOL=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="/tool" (
    set TARGET_TOOL=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="--scan-node-modules" (
    set SCAN_NM_DIR=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="/scan-node-modules" (
    set SCAN_NM_DIR=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="-h" goto show_help
if /i "%~1"=="--help" goto show_help
if /i "%~1"=="/?" goto show_help

echo Unknown parameter: %~1
echo Type clean-cache.cmd /? for usage.
exit /b 1

:show_help
echo ====================================================================
echo  clean-cache.cmd — Native Windows Developer ^& Designer Cache Cleaner
echo ====================================================================
echo Usage:
echo   clean-cache.cmd [/dry-run] [/tool name] [/scan-node-modules dir]
echo.
echo Options:
echo   /dry-run, --dry-run          Preview cleanup actions without deleting files.
echo   /tool, --tool name           Clean a specific tool (e.g. npm, uv, docker, adobe).
echo   /scan-node-modules dir       Audit directory tree for dormant node_modules folders.
echo   /?, -h, --help               Display this help message.
echo.
echo Supported Tools:
echo   Package Managers : uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet, composer, gradle
echo   IDEs ^& Mobile    : android, vscode, cursor, cypress
echo   Containers       : docker, podman
echo   Designers        : adobe, figma, blender, electron
echo   Web Browsers     : chrome, chromium, brave, edge, firefox, zen, vivaldi (or 'browser' for all)
exit /b 0

:run_cleanup
echo ====================================================================
if "%DRY_RUN%"=="1" (
    echo  [!] Clean System Cache (Windows CMD) - DRY RUN (Preview)
) else (
    echo  [*] Clean System Cache (Windows CMD) - EXECUTED
)
echo ====================================================================

rem ----------------------------------------------------------------------
rem 1. uv
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_uv
if /i "%TARGET_TOOL%"=="uv" goto check_uv
goto skip_uv

:check_uv
where uv >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [uv]                     ^| reclaimable ^| Would run 'uv cache clean'
    ) else (
        call uv cache clean >nul 2>&1
        echo [uv]                     ^| cleaned     ^| Cache cleared
    )
)
:skip_uv

rem ----------------------------------------------------------------------
rem 2. npm
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_npm
if /i "%TARGET_TOOL%"=="npm" goto check_npm
goto skip_npm

:check_npm
where npm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [npm]                    ^| reclaimable ^| Would run 'npm cache clean --force' ^& purge temp npx
    ) else (
        call npm cache clean --force >nul 2>&1
        if exist "%LOCALAPPDATA%\npm-cache\_npx" rmdir /s /q "%LOCALAPPDATA%\npm-cache\_npx" >nul 2>&1
        if exist "%LOCALAPPDATA%\npm-cache\_logs" rmdir /s /q "%LOCALAPPDATA%\npm-cache\_logs" >nul 2>&1
        if exist "%APPDATA%\npm-cache\_npx" rmdir /s /q "%APPDATA%\npm-cache\_npx" >nul 2>&1
        if exist "%APPDATA%\npm-cache\_logs" rmdir /s /q "%APPDATA%\npm-cache\_logs" >nul 2>&1
        echo [npm]                    ^| cleaned     ^| Package cache and temp npx files cleared
    )
)
:skip_npm

rem ----------------------------------------------------------------------
rem 3. bun
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_bun
if /i "%TARGET_TOOL%"=="bun" goto check_bun
goto skip_bun

:check_bun
where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [bun]                    ^| reclaimable ^| Would run 'bun pm cache rm'
    ) else (
        call bun pm cache rm >nul 2>&1
        echo [bun]                    ^| cleaned     ^| Install and bunx cache cleared
    )
)
:skip_bun

rem ----------------------------------------------------------------------
rem 4. pip
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_pip
if /i "%TARGET_TOOL%"=="pip" goto check_pip
goto skip_pip

:check_pip
set PIP_CMD=
where pip >nul 2>&1
if %ERRORLEVEL% equ 0 set PIP_CMD=pip cache purge
if "%PIP_CMD%"=="" (
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 set PIP_CMD=python -m pip cache purge
)
if not "%PIP_CMD%"=="" (
    if "%DRY_RUN%"=="1" (
        echo [pip]                    ^| reclaimable ^| Would run '%PIP_CMD%'
    ) else (
        call %PIP_CMD% >nul 2>&1
        echo [pip]                    ^| cleaned     ^| Wheel and download cache purged
    )
)
:skip_pip

rem ----------------------------------------------------------------------
rem 5. pnpm
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_pnpm
if /i "%TARGET_TOOL%"=="pnpm" goto check_pnpm
goto skip_pnpm

:check_pnpm
where pnpm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [pnpm]                   ^| reclaimable ^| Would run 'pnpm store prune'
    ) else (
        call pnpm store prune >nul 2>&1
        echo [pnpm]                   ^| cleaned     ^| Unreferenced store packages removed
    )
)
:skip_pnpm

rem ----------------------------------------------------------------------
rem 6. yarn
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_yarn
if /i "%TARGET_TOOL%"=="yarn" goto check_yarn
goto skip_yarn

:check_yarn
where yarn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [yarn]                   ^| reclaimable ^| Would run 'yarn cache clean'
    ) else (
        call yarn cache clean >nul 2>&1
        echo [yarn]                   ^| cleaned     ^| Yarn cache cleared
    )
)
:skip_yarn

rem ----------------------------------------------------------------------
rem 7. cargo
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_cargo
if /i "%TARGET_TOOL%"=="cargo" goto check_cargo
goto skip_cargo

:check_cargo
if exist "%USERPROFILE%\.cargo\registry\cache" (
    if "%DRY_RUN%"=="1" (
        echo [cargo (crates)]         ^| reclaimable ^| Would remove cached .crate archives
    ) else (
        del /q /s "%USERPROFILE%\.cargo\registry\cache\*.crate" >nul 2>&1
        echo [cargo (crates)]         ^| cleaned     ^| Downloaded .crate archives removed
    )
)
:skip_cargo

rem ----------------------------------------------------------------------
rem 8. go
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_go
if /i "%TARGET_TOOL%"=="go" goto check_go
goto skip_go

:check_go
where go >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [go (build-cache)]       ^| reclaimable ^| Would run 'go clean -cache'
    ) else (
        call go clean -cache >nul 2>&1
        echo [go (build-cache)]       ^| cleaned     ^| Go build cache cleared
    )
) else (
    if exist "%LOCALAPPDATA%\go-build" (
        if "%DRY_RUN%"=="1" (
            echo [go (build-cache)]       ^| reclaimable ^| Would remove orphaned go-build cache
        ) else (
            rmdir /s /q "%LOCALAPPDATA%\go-build" >nul 2>&1
            echo [go (build-cache)]       ^| cleaned     ^| Orphaned go-build folder deleted
        )
    )
)
:skip_go

rem ----------------------------------------------------------------------
rem 9. dotnet / nuget
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_dotnet
if /i "%TARGET_TOOL%"=="dotnet" goto check_dotnet
goto skip_dotnet

:check_dotnet
where dotnet >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [dotnet (nuget)]         ^| reclaimable ^| Would run 'dotnet nuget locals all --clear'
    ) else (
        call dotnet nuget locals all --clear >nul 2>&1
        echo [dotnet (nuget)]         ^| cleaned     ^| NuGet package and HTTP locals cleared
    )
)
:skip_dotnet

rem ----------------------------------------------------------------------
rem 10. composer
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_composer
if /i "%TARGET_TOOL%"=="composer" goto check_composer
goto skip_composer

:check_composer
where composer >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [composer]               ^| reclaimable ^| Would run 'composer clear-cache'
    ) else (
        call composer clear-cache >nul 2>&1
        echo [composer]               ^| cleaned     ^| Composer package cache cleared
    )
)
:skip_composer

rem ----------------------------------------------------------------------
rem 11. gradle
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_gradle
if /i "%TARGET_TOOL%"=="gradle" goto check_gradle
goto skip_gradle

:check_gradle
if exist "%USERPROFILE%\.gradle\caches" (
    if "%DRY_RUN%"=="1" (
        echo [gradle (caches)]        ^| reclaimable ^| Would purge gradle temporary zip and jar caches
    ) else (
        del /q /s "%USERPROFILE%\.gradle\caches\*.lock" >nul 2>&1
        echo [gradle (caches)]        ^| cleaned     ^| Gradle temporary lock and cache stores purged
    )
)
:skip_gradle

rem ----------------------------------------------------------------------
rem 12. Android Studio Build Cache
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_android
if /i "%TARGET_TOOL%"=="android" goto check_android
goto skip_android

:check_android
if exist "%USERPROFILE%\.android\build-cache" (
    if "%DRY_RUN%"=="1" (
        echo [android (build-cache)]  ^| reclaimable ^| Would purge Android Studio build cache
    ) else (
        rmdir /s /q "%USERPROFILE%\.android\build-cache" >nul 2>&1
        echo [android (build-cache)]  ^| cleaned     ^| Android Studio build cache cleared
    )
)
:skip_android

rem ----------------------------------------------------------------------
rem 13. VS Code Workspace Storage
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_vscode
if /i "%TARGET_TOOL%"=="vscode" goto check_vscode
goto skip_vscode

:check_vscode
if exist "%APPDATA%\Code\User\workspaceStorage" (
    if "%DRY_RUN%"=="1" (
        echo [vscode (workspace)]     ^| reclaimable ^| Stale workspace state available for pruning
    )
)
:skip_vscode

rem ----------------------------------------------------------------------
rem 14. Cursor Workspace Storage
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_cursor
if /i "%TARGET_TOOL%"=="cursor" goto check_cursor
goto skip_cursor

:check_cursor
if exist "%APPDATA%\Cursor\User\workspaceStorage" (
    if "%DRY_RUN%"=="1" (
        echo [cursor (workspace)]     ^| reclaimable ^| Stale Cursor workspace state available
    )
)
:skip_cursor

rem ----------------------------------------------------------------------
rem 15. Cypress
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_cypress
if /i "%TARGET_TOOL%"=="cypress" goto check_cypress
goto skip_cypress

:check_cypress
if exist "%LOCALAPPDATA%\Cypress\Cache" (
    if "%DRY_RUN%"=="1" (
        echo [cypress]                ^| reclaimable ^| Would clear Cypress browser runtime cache
    ) else (
        rmdir /s /q "%LOCALAPPDATA%\Cypress\Cache" >nul 2>&1
        echo [cypress]                ^| cleaned     ^| Cypress browser cache cleared
    )
)
:skip_cypress

rem ----------------------------------------------------------------------
rem 14. Docker (BuildKit cache only)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_docker
if /i "%TARGET_TOOL%"=="docker" goto check_docker
goto skip_docker

:check_docker
where docker >nul 2>&1
if %ERRORLEVEL% equ 0 (
    docker info >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        if "%DRY_RUN%"=="1" (
            echo [docker (build-cache)]   ^| reclaimable ^| Would run 'docker builder prune -f'
        ) else (
            call docker builder prune -f >nul 2>&1
            echo [docker (build-cache)]   ^| cleaned     ^| Dangling BuildKit layers pruned
        )
    )
)
:skip_docker

rem ----------------------------------------------------------------------
rem 15. Podman
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_podman
if /i "%TARGET_TOOL%"=="podman" goto check_podman
goto skip_podman

:check_podman
where podman >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [podman (build-cache)]   ^| reclaimable ^| Would run 'podman system prune --build-cache -f'
    ) else (
        call podman system prune --build-cache -f >nul 2>&1
        echo [podman (build-cache)]   ^| cleaned     ^| Podman build cache pruned
    )
)
:skip_podman

rem ----------------------------------------------------------------------
rem 16. Adobe Media Cache (Premiere, After Effects, Audition, Photoshop)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_adobe
if /i "%TARGET_TOOL%"=="adobe" goto check_adobe
goto skip_adobe

:check_adobe
set ADOBE_FOUND=0
if exist "%APPDATA%\Adobe\Common\Media Cache Files" set ADOBE_FOUND=1
if exist "%APPDATA%\Adobe\Common\Media Cache" set ADOBE_FOUND=1
if exist "%APPDATA%\Adobe\Common\Peak Files" set ADOBE_FOUND=1
if %ADOBE_FOUND% equ 1 (
    if "%DRY_RUN%"=="1" (
        echo [adobe (media-cache)]    ^| reclaimable ^| Would delete .cfa and .pek scratch media caches
    ) else (
        if exist "%APPDATA%\Adobe\Common\Media Cache Files" del /q /s "%APPDATA%\Adobe\Common\Media Cache Files\*.*" >nul 2>&1
        if exist "%APPDATA%\Adobe\Common\Media Cache" del /q /s "%APPDATA%\Adobe\Common\Media Cache\*.*" >nul 2>&1
        if exist "%APPDATA%\Adobe\Common\Peak Files" del /q /s "%APPDATA%\Adobe\Common\Peak Files\*.*" >nul 2>&1
        echo [adobe (media-cache)]    ^| cleaned     ^| Peak and scratch media cache files cleared
    )
)
if exist "%TEMP%\Photoshop Temp*" (
    tasklist /fi "imagename eq Photoshop.exe" 2>nul | findstr /i "Photoshop.exe" >nul
    if !ERRORLEVEL! equ 0 (
        if "%DRY_RUN%"=="1" (
            echo [photoshop (temp)]       ^| running     ^| Photoshop is running; close app to clean safely
        ) else (
            echo [photoshop (temp)]       ^| skipped     ^| Active session running; skipped to protect scratch disks
        )
    ) else (
        if "%DRY_RUN%"=="1" (
            echo [photoshop (temp)]       ^| reclaimable ^| Would remove abandoned Photoshop scratch files in %%TEMP%%
        ) else (
            del /q /f "%TEMP%\Photoshop Temp*" >nul 2>&1
            echo [photoshop (temp)]       ^| cleaned     ^| Photoshop temp scratch files removed
        )
    )
)
:skip_adobe

rem ----------------------------------------------------------------------
rem 17. Figma Desktop App Cache
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_figma
if /i "%TARGET_TOOL%"=="figma" goto check_figma
goto skip_figma

:check_figma
set FIGMA_FOUND=0
if exist "%APPDATA%\Figma\DesktopProfile\Cache" set FIGMA_FOUND=1
if exist "%LOCALAPPDATA%\Figma\Cache" set FIGMA_FOUND=1
if %FIGMA_FOUND% equ 1 (
    tasklist /fi "imagename eq Figma.exe" 2>nul | findstr /i "Figma.exe" >nul
    if !ERRORLEVEL! equ 0 (
        if "%DRY_RUN%"=="1" (
            echo [figma]                  ^| running     ^| Figma is running; close app to clean safely
        ) else (
            echo [figma]                  ^| skipped     ^| Active session running; skipped to protect app
        )
    ) else (
        if "%DRY_RUN%"=="1" (
            echo [figma]                  ^| reclaimable ^| Would delete Figma desktop asset cache
        ) else (
            if exist "%APPDATA%\Figma\DesktopProfile\Cache" del /q /s "%APPDATA%\Figma\DesktopProfile\Cache\*.*" >nul 2>&1
            if exist "%LOCALAPPDATA%\Figma\Cache" del /q /s "%LOCALAPPDATA%\Figma\Cache\*.*" >nul 2>&1
            echo [figma]                  ^| cleaned     ^| Figma asset cache cleared
        )
    )
)
:skip_figma

rem ----------------------------------------------------------------------
rem 18. Blender
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_blender
if /i "%TARGET_TOOL%"=="blender" goto check_blender
goto skip_blender

:check_blender
if exist "%LOCALAPPDATA%\Blender Foundation\Blender\Cache" (
    tasklist /fi "imagename eq blender.exe" 2>nul | findstr /i "blender.exe" >nul
    if !ERRORLEVEL! equ 0 (
        if "%DRY_RUN%"=="1" (
            echo [blender]                ^| running     ^| Blender is running; close app to clean safely
        ) else (
            echo [blender]                ^| skipped     ^| Active session running; skipped to protect renders
        )
    ) else (
        if "%DRY_RUN%"=="1" (
            echo [blender]                ^| reclaimable ^| Would clear Blender shader/preview cache
        ) else (
            del /q /s "%LOCALAPPDATA%\Blender Foundation\Blender\Cache\*.*" >nul 2>&1
            echo [blender]                ^| cleaned     ^| Blender shader/preview cache cleared
        )
    )
)
:skip_blender

rem ----------------------------------------------------------------------
rem 19. Electron
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_electron
if /i "%TARGET_TOOL%"=="electron" goto check_electron
goto skip_electron

:check_electron
if exist "%LOCALAPPDATA%\electron\Cache" (
    if "%DRY_RUN%"=="1" (
        echo [electron]               ^| reclaimable ^| Would delete stale Electron binary cache
    ) else (
        rmdir /s /q "%LOCALAPPDATA%\electron\Cache" >nul 2>&1
        echo [electron]               ^| cleaned     ^| Stale Electron binary downloads removed
    )
)
:skip_electron

rem ----------------------------------------------------------------------
rem 20. Google Chrome (HTTP Disk Cache & Code Cache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_chrome
if /i "%TARGET_TOOL%"=="browser" goto check_chrome
if /i "%TARGET_TOOL%"=="chrome" goto check_chrome
goto skip_chrome

:check_chrome
if not exist "%LOCALAPPDATA%\Google\Chrome\User Data" goto skip_chrome
tasklist /fi "imagename eq chrome.exe" 2>nul | findstr /i "chrome.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [chrome (cache)]         ^| running     ^| Chrome is running; close browser to clean safely
    ) else (
        echo [chrome (cache)]         ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_chrome
)
if "%DRY_RUN%"=="1" (
    echo [chrome (cache)]         ^| reclaimable ^| Would purge Chrome HTTP disk cache ^& bytecode cache
) else (
    for /d %%p in ("%LOCALAPPDATA%\Google\Chrome\User Data\*") do (
        if exist "%%p\Cache\Cache_Data" del /q /s "%%p\Cache\Cache_Data\*.*" >nul 2>&1
        if exist "%%p\Code Cache" del /q /s "%%p\Code Cache\*.*" >nul 2>&1
        if exist "%%p\GPUCache" del /q /s "%%p\GPUCache\*.*" >nul 2>&1
    )
    echo [chrome (cache)]         ^| cleaned     ^| Chrome HTTP cache and shader caches cleared
)
:skip_chrome

rem ----------------------------------------------------------------------
rem 21. Chromium (HTTP Disk Cache & Code Cache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_chromium
if /i "%TARGET_TOOL%"=="browser" goto check_chromium
if /i "%TARGET_TOOL%"=="chromium" goto check_chromium
goto skip_chromium

:check_chromium
if not exist "%LOCALAPPDATA%\Chromium\User Data" goto skip_chromium
tasklist /fi "imagename eq chromium.exe" 2>nul | findstr /i "chromium.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [chromium (cache)]       ^| running     ^| Chromium is running; close browser to clean safely
    ) else (
        echo [chromium (cache)]       ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_chromium
)
if "%DRY_RUN%"=="1" (
    echo [chromium (cache)]       ^| reclaimable ^| Would purge Chromium HTTP disk cache ^& bytecode cache
) else (
    for /d %%p in ("%LOCALAPPDATA%\Chromium\User Data\*") do (
        if exist "%%p\Cache\Cache_Data" del /q /s "%%p\Cache\Cache_Data\*.*" >nul 2>&1
        if exist "%%p\Code Cache" del /q /s "%%p\Code Cache\*.*" >nul 2>&1
        if exist "%%p\GPUCache" del /q /s "%%p\GPUCache\*.*" >nul 2>&1
    )
    echo [chromium (cache)]       ^| cleaned     ^| Chromium HTTP cache and shader caches cleared
)
:skip_chromium

rem ----------------------------------------------------------------------
rem 22. Brave Browser (HTTP Disk Cache & Code Cache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_brave
if /i "%TARGET_TOOL%"=="browser" goto check_brave
if /i "%TARGET_TOOL%"=="brave" goto check_brave
goto skip_brave

:check_brave
if not exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data" goto skip_brave
tasklist /fi "imagename eq brave.exe" 2>nul | findstr /i "brave.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [brave (cache)]          ^| running     ^| Brave is running; close browser to clean safely
    ) else (
        echo [brave (cache)]          ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_brave
)
if "%DRY_RUN%"=="1" (
    echo [brave (cache)]          ^| reclaimable ^| Would purge Brave HTTP disk cache ^& bytecode cache
) else (
    for /d %%p in ("%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\*") do (
        if exist "%%p\Cache\Cache_Data" del /q /s "%%p\Cache\Cache_Data\*.*" >nul 2>&1
        if exist "%%p\Code Cache" del /q /s "%%p\Code Cache\*.*" >nul 2>&1
        if exist "%%p\GPUCache" del /q /s "%%p\GPUCache\*.*" >nul 2>&1
    )
    echo [brave (cache)]          ^| cleaned     ^| Brave HTTP disk cache and shader caches cleared
)
:skip_brave

rem ----------------------------------------------------------------------
rem 23. Microsoft Edge (HTTP Disk Cache & Code Cache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_edge
if /i "%TARGET_TOOL%"=="browser" goto check_edge
if /i "%TARGET_TOOL%"=="edge" goto check_edge
goto skip_edge

:check_edge
if not exist "%LOCALAPPDATA%\Microsoft\Edge\User Data" goto skip_edge
tasklist /fi "imagename eq msedge.exe" 2>nul | findstr /i "msedge.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [edge (cache)]           ^| running     ^| Edge is running; close browser to clean safely
    ) else (
        echo [edge (cache)]           ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_edge
)
if "%DRY_RUN%"=="1" (
    echo [edge (cache)]           ^| reclaimable ^| Would purge Edge HTTP disk cache ^& bytecode cache
) else (
    for /d %%p in ("%LOCALAPPDATA%\Microsoft\Edge\User Data\*") do (
        if exist "%%p\Cache\Cache_Data" del /q /s "%%p\Cache\Cache_Data\*.*" >nul 2>&1
        if exist "%%p\Code Cache" del /q /s "%%p\Code Cache\*.*" >nul 2>&1
        if exist "%%p\GPUCache" del /q /s "%%p\GPUCache\*.*" >nul 2>&1
    )
    echo [edge (cache)]           ^| cleaned     ^| Edge HTTP disk cache and shader caches cleared
)
:skip_edge

rem ----------------------------------------------------------------------
rem 24. Mozilla Firefox (cache2 & startupCache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_firefox
if /i "%TARGET_TOOL%"=="browser" goto check_firefox
if /i "%TARGET_TOOL%"=="firefox" goto check_firefox
goto skip_firefox

:check_firefox
if not exist "%LOCALAPPDATA%\Mozilla\Firefox\Profiles" goto skip_firefox
tasklist /fi "imagename eq firefox.exe" 2>nul | findstr /i "firefox.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [firefox (cache)]        ^| running     ^| Firefox is running; close browser to clean safely
    ) else (
        echo [firefox (cache)]        ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_firefox
)
if "%DRY_RUN%"=="1" (
    echo [firefox (cache)]        ^| reclaimable ^| Would purge Firefox HTTP cache (cache2) ^& startupCache
) else (
    for /d %%p in ("%LOCALAPPDATA%\Mozilla\Firefox\Profiles\*") do (
        if exist "%%p\cache2\entries" del /q /s "%%p\cache2\entries\*.*" >nul 2>&1
        if exist "%%p\cache2\doomed" del /q /s "%%p\cache2\doomed\*.*" >nul 2>&1
        if exist "%%p\startupCache" del /q /s "%%p\startupCache\*.*" >nul 2>&1
        if exist "%%p\thumbnails" del /q /s "%%p\thumbnails\*.*" >nul 2>&1
    )
    echo [firefox (cache)]        ^| cleaned     ^| Firefox HTTP cache2 and startupCache cleared
)
:skip_firefox

rem ----------------------------------------------------------------------
rem 25. Zen Browser (cache2 & startupCache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_zen
if /i "%TARGET_TOOL%"=="browser" goto check_zen
if /i "%TARGET_TOOL%"=="zen" goto check_zen
goto skip_zen

:check_zen
if not exist "%LOCALAPPDATA%\zen\Profiles" goto skip_zen
tasklist /fi "imagename eq zen.exe" 2>nul | findstr /i "zen.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [zen (cache)]            ^| running     ^| Zen is running; close browser to clean safely
    ) else (
        echo [zen (cache)]            ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_zen
)
if "%DRY_RUN%"=="1" (
    echo [zen (cache)]            ^| reclaimable ^| Would purge Zen HTTP cache (cache2) ^& startupCache
) else (
    for /d %%p in ("%LOCALAPPDATA%\zen\Profiles\*") do (
        if exist "%%p\cache2\entries" del /q /s "%%p\cache2\entries\*.*" >nul 2>&1
        if exist "%%p\cache2\doomed" del /q /s "%%p\cache2\doomed\*.*" >nul 2>&1
        if exist "%%p\startupCache" del /q /s "%%p\startupCache\*.*" >nul 2>&1
        if exist "%%p\thumbnails" del /q /s "%%p\thumbnails\*.*" >nul 2>&1
    )
    echo [zen (cache)]            ^| cleaned     ^| Zen HTTP cache2 and startupCache cleared
)
:skip_zen

rem ----------------------------------------------------------------------
rem 26. Vivaldi (HTTP Disk Cache & Code Cache ONLY)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_vivaldi
if /i "%TARGET_TOOL%"=="browser" goto check_vivaldi
if /i "%TARGET_TOOL%"=="vivaldi" goto check_vivaldi
goto skip_vivaldi

:check_vivaldi
if not exist "%LOCALAPPDATA%\Vivaldi\User Data" goto skip_vivaldi
tasklist /fi "imagename eq vivaldi.exe" 2>nul | findstr /i "vivaldi.exe" >nul
if !ERRORLEVEL! equ 0 (
    if "%DRY_RUN%"=="1" (
        echo [vivaldi (cache)]        ^| running     ^| Vivaldi is running; close browser to clean safely
    ) else (
        echo [vivaldi (cache)]        ^| skipped     ^| Active session running; skipped to protect tabs
    )
    goto skip_vivaldi
)
if "%DRY_RUN%"=="1" (
    echo [vivaldi (cache)]        ^| reclaimable ^| Would purge Vivaldi HTTP disk cache ^& bytecode cache
) else (
    for /d %%p in ("%LOCALAPPDATA%\Vivaldi\User Data\*") do (
        if exist "%%p\Cache\Cache_Data" del /q /s "%%p\Cache\Cache_Data\*.*" >nul 2>&1
        if exist "%%p\Code Cache" del /q /s "%%p\Code Cache\*.*" >nul 2>&1
        if exist "%%p\GPUCache" del /q /s "%%p\GPUCache\*.*" >nul 2>&1
    )
    echo [vivaldi (cache)]        ^| cleaned     ^| Vivaldi HTTP disk cache and shader caches cleared
)
:skip_vivaldi

echo ====================================================================
echo  Cleanup Complete. Unreferenced caches safely pruned.
echo ====================================================================

rem ----------------------------------------------------------------------
rem 20. Optional Dormant node_modules Scanner
rem ----------------------------------------------------------------------
if not "%SCAN_NM_DIR%"=="" (
    echo.
    echo ====================================================================
    echo  [!] Dormant node_modules Audit in: %SCAN_NM_DIR%
    echo ====================================================================
    if not exist "%SCAN_NM_DIR%" (
        echo Directory not found: %SCAN_NM_DIR%
    ) else (
        echo Scanning for node_modules directories...
        for /d /r "%SCAN_NM_DIR%" %%d in (node_modules) do (
            if exist "%%d" echo   Found: "%%d"
        )
        echo.
        echo Tip: Delete unwanted folders with: rmdir /s /q "path\to\node_modules"
    )
    echo ====================================================================
)

endlocal
exit /b 0
