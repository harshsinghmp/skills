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
rem 5. Desktop, runtime & editor scratch caches:
rem    - playwright, puppeteer, yarn, pip, typescript, VS Code/Cursor Cache,
rem      CachedData, GPUCache, logs, CrashDumps, NuGet HTTP cache
rem 6. Confirmation-gated candidates (ASK / ASK! - never auto-deleted):
rem    - Recycle Bin, %TEMP%, Windows Update download cache, thumbnail cache,
rem      Docker images
rem
rem Selection UX: /list  /browse <id>  /only <ids> [/yes]  /interactive
rem
rem Zero dependencies: Native Windows Command Prompt batch script.
rem Runs anywhere on Windows without Python, Node, or WSL.
rem ==============================================================================

setlocal enabledelayedexpansion

set DRY_RUN=0
set INCLUDE_COUPLED=0
set TARGET_TOOL=all
set SCAN_NM_DIR=
set T2_PURGED=0
set T2_PRESERVED=0
set CATALOG_MODE=
set CATALOG_ARG=
set ASSUME_YES=0
set CONFIRM_IRREV=0
set LEARN_ACTION=
set LEARN_KEYS=
set STATE_DIR=%LOCALAPPDATA%\clean-system-cache
set LEARN_FILE=%STATE_DIR%\learned.txt
set CONFIG_FILE=%STATE_DIR%\config.txt
set DISC_FILE=%STATE_DIR%\discovered.txt
set DORMANT_DAYS=14
set PROJECT_ROOTS=
set LEARNED=

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
if /i "%~1"=="--include-coupled" (
    set INCLUDE_COUPLED=1
    shift
    goto parse_args
)
if /i "%~1"=="/include-coupled" (
    set INCLUDE_COUPLED=1
    shift
    goto parse_args
)
if /i "%~1"=="--all-caches" (
    set INCLUDE_COUPLED=1
    shift
    goto parse_args
)
if /i "%~1"=="/all-caches" (
    set INCLUDE_COUPLED=1
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
if /i "%~1"=="/list" (
    set CATALOG_MODE=list
    shift
    goto parse_args
)
if /i "%~1"=="/browse" (
    set CATALOG_MODE=browse
    set CATALOG_ARG=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="/only" (
    set CATALOG_MODE=only
    set CATALOG_ARG=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="/interactive" (
    set CATALOG_MODE=interactive
    shift
    goto parse_args
)
if /i "%~1"=="/yes" (
    set ASSUME_YES=1
    shift
    goto parse_args
)
if /i "%~1"=="/confirm-irreversible" (
    set CONFIRM_IRREV=1
    shift
    goto parse_args
)
if /i "%~1"=="/discover" (
    set CATALOG_MODE=discover
    shift
    goto parse_args
)
if /i "%~1"=="/learned" (
    set CATALOG_MODE=learned
    shift
    goto parse_args
)
if /i "%~1"=="/learn" (
    set CATALOG_MODE=learn
    set LEARN_ACTION=%~2
    set LEARN_KEYS=%~3
    shift
    shift
    shift
    goto parse_args
)

echo Unknown parameter: %~1
echo Type clean-cache.cmd /? for usage.
exit /b 1

:show_help
echo ====================================================================
echo  clean-cache.cmd — Native Windows Developer ^& Designer Cache Cleaner
echo ====================================================================
echo Usage:
echo   clean-cache.cmd [/dry-run] [/include-coupled] [/tool name] [/scan-node-modules dir]
echo                  [/list] [/browse id] [/only id,id [/yes]] [/interactive]
echo.
echo Options:
echo   /dry-run, --dry-run          Preview cleanup actions without deleting files.
echo   /include-coupled             Opt-in to purging T2 capability-coupled caches (plugins, MCP, LSPs).
echo                                PRESERVED BY DEFAULT. Emits rehydration manifest if purged.
echo   /all-caches                  Alias for /include-coupled.
echo   /tool, --tool name           Clean a specific tool (e.g. npm, uv, opencode, adobe, browser, agents).
echo   /scan-node-modules dir       Audit directory tree for dormant node_modules folders.
echo   /list                        Catalog every candidate: id, tier, size, path. Deletes nothing.
echo   /discover                    Scan %USERPROFILE%\projects for dormant project build caches.
echo   /browse id^|proj:path         Show the files/folders a candidate would delete.
echo   /only id,id^|proj:path [/yes] [/confirm-irreversible]
echo                                Delete exactly these candidates. ASK! items need the
echo                                explicit flag or a typed yes; /yes alone is not enough.
echo   /interactive                 Numbered menu for confirmation-gated (ASK) candidates.
echo   /learn allow^|deny^|forget k Record a decision so later runs already know.
echo   /learned                     Show learned decisions.
echo   /?, -h, --help               Display this help message.
echo.
echo Tiers:
echo   T1   Regenerable, auto-cleaned on a normal run.
echo   ASK  Expensive or admin-gated; only deleted when you select it.
echo   ASK! Irreversible (Recycle Bin, %%TEMP%%); only deleted after typing yes.
echo.
echo Supported Tools:
echo   Package Managers : uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet, composer, gradle
echo   IDEs ^& Mobile    : android, vscode, cursor, cypress
echo   Agent Runtimes   : opencode, claude, cursor, gemini, codex, continue, mcp, lsp (or 'agents')
echo   Containers       : docker, podman
echo   Designers        : adobe, figma, blender, electron
echo   Web Browsers     : chrome, chromium, brave, edge, firefox, zen, vivaldi (or 'browser' for all)
exit /b 0

:run_cleanup
if not "%CATALOG_MODE%"=="" goto catalog_main
call :cat_init
set CAP_BEFORE=0
if exist "%LOCALAPPDATA%\opencode\cache\npm" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\npm" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%LOCALAPPDATA%\opencode\cache\packages" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\packages" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%LOCALAPPDATA%\opencode\cache\skills" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\skills" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%USERPROFILE%\.cache\opencode\npm" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\npm" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%USERPROFILE%\.cache\opencode\packages" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\packages" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%USERPROFILE%\.cache\opencode\skills" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\skills" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%LOCALAPPDATA%\claude\cache" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\claude\cache" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%USERPROFILE%\.cache\claude" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\claude" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i
if exist "%USERPROFILE%\.continue\cache" for /f %%i in ('dir /b /a "%USERPROFILE%\.continue\cache" 2^>nul ^| find /c /v ""') do set /a CAP_BEFORE+=%%i

echo ====================================================================
if "%DRY_RUN%"=="1" (
    echo  [!] Clean System Cache (Windows CMD) - DRY RUN (Preview)
) else (
    echo  [*] Clean System Cache (Windows CMD) - EXECUTED
)
echo ====================================================================

rem ----------------------------------------------------------------------
rem 0. Desktop, runtime & editor scratch caches (T1, catalog-driven)
rem ----------------------------------------------------------------------
for /l %%i in (1,1,%CAND_N%) do call :cat_auto %%i

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
rem 20. Agent Runtimes & Toolchains (T2 Capability-Coupled Caches)
rem ----------------------------------------------------------------------
if "%TARGET_TOOL%"=="all" goto check_agents
if /i "%TARGET_TOOL%"=="agents" goto check_agents
if /i "%TARGET_TOOL%"=="opencode" goto check_opencode
if /i "%TARGET_TOOL%"=="claude" goto check_claude
if /i "%TARGET_TOOL%"=="gemini" goto check_gemini
if /i "%TARGET_TOOL%"=="continue" goto check_continue
if /i "%TARGET_TOOL%"=="codex" goto check_codex
goto skip_agents

:check_agents
:check_opencode
rem --- OpenCode (packages, npm, skills) [T2] ---
set OP_CACHE=
if exist "%LOCALAPPDATA%\opencode\cache" set OP_CACHE=%LOCALAPPDATA%\opencode\cache
if "%OP_CACHE%"=="" if exist "%USERPROFILE%\.cache\opencode" set OP_CACHE=%USERPROFILE%\.cache\opencode
if not "%OP_CACHE%"=="" (
    if exist "%OP_CACHE%\packages" (
        if "%INCLUDE_COUPLED%"=="0" (
            echo [opencode (packages) [T2]]^| preserved   ^| T2 Capability-coupled: Preserved by default
            set /a T2_PRESERVED+=1
        ) else (
            tasklist /fi "imagename eq opencode.exe" 2>nul | findstr /i "opencode.exe" >nul
            if !ERRORLEVEL! equ 0 (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (packages) [T2]]^| running     ^| OpenCode is running; close agent to clean
                ) else (
                    echo [opencode (packages) [T2]]^| skipped     ^| Active session running; skipped to protect live skills
                )
            ) else (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (packages) [T2]]^| reclaimable ^| Would purge plugin packages (rehydration required)
                    set T2_PURGED=1
                ) else (
                    del /q /s "%OP_CACHE%\packages\*.*" >nul 2>&1
                    for /d %%p in ("%OP_CACHE%\packages\*") do rmdir /s /q "%%p" >nul 2>&1
                    echo [opencode (packages) [T2]]^| cleaned     ^| Plugin package cache purged
                    set T2_PURGED=1
                )
            )
        )
    )
    if exist "%OP_CACHE%\npm" (
        if "%INCLUDE_COUPLED%"=="0" (
            echo [opencode (npm) [T2]]     ^| preserved   ^| T2 Capability-coupled: Preserved by default
            set /a T2_PRESERVED+=1
        ) else (
            tasklist /fi "imagename eq opencode.exe" 2>nul | findstr /i "opencode.exe" >nul
            if !ERRORLEVEL! equ 0 (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (npm) [T2]]     ^| running     ^| OpenCode is running; close agent to clean
                ) else (
                    echo [opencode (npm) [T2]]     ^| skipped     ^| Active session running; skipped to protect live plugins
                )
            ) else (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (npm) [T2]]     ^| reclaimable ^| Would purge plugin npm payloads
                    set T2_PURGED=1
                ) else (
                    del /q /s "%OP_CACHE%\npm\*.*" >nul 2>&1
                    for /d %%p in ("%OP_CACHE%\npm\*") do rmdir /s /q "%%p" >nul 2>&1
                    echo [opencode (npm) [T2]]     ^| cleaned     ^| Plugin npm cache purged
                    set T2_PURGED=1
                )
            )
        )
    )
    if exist "%OP_CACHE%\skills" (
        if "%INCLUDE_COUPLED%"=="0" (
            echo [opencode (skills) [T2]]  ^| preserved   ^| T2 Capability-coupled: Preserved by default
            set /a T2_PRESERVED+=1
        ) else (
            tasklist /fi "imagename eq opencode.exe" 2>nul | findstr /i "opencode.exe" >nul
            if !ERRORLEVEL! equ 0 (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (skills) [T2]]  ^| running     ^| OpenCode is running; close agent to clean
                ) else (
                    echo [opencode (skills) [T2]]  ^| skipped     ^| Active session running; skipped to protect live skills
                )
            ) else (
                if "%DRY_RUN%"=="1" (
                    echo [opencode (skills) [T2]]  ^| reclaimable ^| Would purge cached remote skills
                    set T2_PURGED=1
                ) else (
                    del /q /s "%OP_CACHE%\skills\*.*" >nul 2>&1
                    for /d %%p in ("%OP_CACHE%\skills\*") do rmdir /s /q "%%p" >nul 2>&1
                    echo [opencode (skills) [T2]]  ^| cleaned     ^| Remote skills cache purged
                    set T2_PURGED=1
                )
            )
        )
    )
)
if /i "%TARGET_TOOL%"=="opencode" goto skip_agents

:check_claude
rem --- Claude Code [T2] ---
set CL_CACHE=
if exist "%LOCALAPPDATA%\claude\cache" set CL_CACHE=%LOCALAPPDATA%\claude\cache
if "%CL_CACHE%"=="" if exist "%USERPROFILE%\.cache\claude" set CL_CACHE=%USERPROFILE%\.cache\claude
if not "%CL_CACHE%"=="" (
    if "%INCLUDE_COUPLED%"=="0" (
        echo [claude (cache) [T2]]     ^| preserved   ^| T2 Capability-coupled: Preserved by default
        set /a T2_PRESERVED+=1
    ) else (
        tasklist /fi "imagename eq claude.exe" 2>nul | findstr /i "claude.exe" >nul
        if !ERRORLEVEL! equ 0 (
            if "%DRY_RUN%"=="1" (
                echo [claude (cache) [T2]]     ^| running     ^| Claude is running; close agent to clean
            ) else (
                echo [claude (cache) [T2]]     ^| skipped     ^| Active session running; skipped to protect LSP
            )
        ) else (
            if "%DRY_RUN%"=="1" (
                echo [claude (cache) [T2]]     ^| reclaimable ^| Would purge Claude language servers
                set T2_PURGED=1
            ) else (
                del /q /s "%CL_CACHE%\*.*" >nul 2>&1
                for /d %%p in ("%CL_CACHE%\*") do rmdir /s /q "%%p" >nul 2>&1
                echo [claude (cache) [T2]]     ^| cleaned     ^| Claude cache purged
                set T2_PURGED=1
            )
        )
    )
)
if /i "%TARGET_TOOL%"=="claude" goto skip_agents

:check_continue
rem --- Continue [T2] ---
if exist "%USERPROFILE%\.continue\cache" (
    if "%INCLUDE_COUPLED%"=="0" (
        echo [continue (cache) [T2]]   ^| preserved   ^| T2 Capability-coupled: Preserved by default
        set /a T2_PRESERVED+=1
    ) else (
        if "%DRY_RUN%"=="1" (
            echo [continue (cache) [T2]]   ^| reclaimable ^| Would purge Continue codebase index
            set T2_PURGED=1
        ) else (
            del /q /s "%USERPROFILE%\.continue\cache\*.*" >nul 2>&1
            for /d %%p in ("%USERPROFILE%\.continue\cache\*") do rmdir /s /q "%%p" >nul 2>&1
            echo [continue (cache) [T2]]   ^| cleaned     ^| Continue cache purged
            set T2_PURGED=1
        )
    )
)
if /i "%TARGET_TOOL%"=="continue" goto skip_agents

:check_gemini
rem --- Gemini / Antigravity [T2] ---
set GM_CACHE=
if exist "%LOCALAPPDATA%\gemini\cache" set GM_CACHE=%LOCALAPPDATA%\gemini\cache
if "%GM_CACHE%"=="" if exist "%USERPROFILE%\.gemini\cache" set GM_CACHE=%USERPROFILE%\.gemini\cache
if not "%GM_CACHE%"=="" (
    if "%INCLUDE_COUPLED%"=="0" (
        echo [gemini (cache) [T2]]     ^| preserved   ^| T2 Capability-coupled: Preserved by default
        set /a T2_PRESERVED+=1
    ) else (
        tasklist /fi "imagename eq agy.exe" 2>nul | findstr /i "agy.exe" >nul
        if !ERRORLEVEL! equ 0 (
            if "%DRY_RUN%"=="1" (
                echo [gemini (cache) [T2]]     ^| running     ^| Antigravity is running; close agent to clean
            ) else (
                echo [gemini (cache) [T2]]     ^| skipped     ^| Active session running; skipped to protect MCP
            )
        ) else (
            if "%DRY_RUN%"=="1" (
                echo [gemini (cache) [T2]]     ^| reclaimable ^| Would purge Gemini/Antigravity MCP cache
                set T2_PURGED=1
            ) else (
                del /q /s "%GM_CACHE%\*.*" >nul 2>&1
                for /d %%p in ("%GM_CACHE%\*") do rmdir /s /q "%%p" >nul 2>&1
                echo [gemini (cache) [T2]]     ^| cleaned     ^| Gemini cache purged
                set T2_PURGED=1
            )
        )
    )
)
if /i "%TARGET_TOOL%"=="gemini" goto skip_agents

:check_codex
rem --- Codex [T2] ---
if exist "%USERPROFILE%\.cache\codex" (
    if "%INCLUDE_COUPLED%"=="0" (
        echo [codex (cache) [T2]]      ^| preserved   ^| T2 Capability-coupled: Preserved by default
        set /a T2_PRESERVED+=1
    ) else (
        if "%DRY_RUN%"=="1" (
            echo [codex (cache) [T2]]      ^| reclaimable ^| Would purge Codex tools cache
            set T2_PURGED=1
        ) else (
            del /q /s "%USERPROFILE%\.cache\codex\*.*" >nul 2>&1
            for /d %%p in ("%USERPROFILE%\.cache\codex\*") do rmdir /s /q "%%p" >nul 2>&1
            echo [codex (cache) [T2]]      ^| cleaned     ^| Codex cache purged
            set T2_PURGED=1
        )
    )
)

:skip_agents

rem ----------------------------------------------------------------------
rem 21. Google Chrome (HTTP Disk Cache & Code Cache ONLY)
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

set CAP_AFTER=0
if exist "%LOCALAPPDATA%\opencode\cache\npm" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\npm" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%LOCALAPPDATA%\opencode\cache\packages" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\packages" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%LOCALAPPDATA%\opencode\cache\skills" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\opencode\cache\skills" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%USERPROFILE%\.cache\opencode\npm" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\npm" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%USERPROFILE%\.cache\opencode\packages" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\packages" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%USERPROFILE%\.cache\opencode\skills" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\opencode\skills" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%LOCALAPPDATA%\claude\cache" for /f %%i in ('dir /b /a "%LOCALAPPDATA%\claude\cache" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%USERPROFILE%\.cache\claude" for /f %%i in ('dir /b /a "%USERPROFILE%\.cache\claude" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i
if exist "%USERPROFILE%\.continue\cache" for /f %%i in ('dir /b /a "%USERPROFILE%\.continue\cache" 2^>nul ^| find /c /v ""') do set /a CAP_AFTER+=%%i

if "!INCLUDE_COUPLED!"=="0" if "%DRY_RUN%"=="0" (
    if !CAP_AFTER! lss !CAP_BEFORE! (
        echo.
        echo ====================================================================
        echo  [!] FATAL ERROR: Capability Inventory Regression Detected!
        echo ====================================================================
        echo  Capabilities dropped from !CAP_BEFORE! to !CAP_AFTER! during safe default cleanup.
        echo  T2 capability caches must never be dropped without /include-coupled.
        echo ====================================================================
        exit /b 1
    )
)

rem ----------------------------------------------------------------------
rem Discovery report: dormant project build caches that need a decision.
rem Nothing here is deleted; use /only proj:<path> [/yes] to apply.
rem ----------------------------------------------------------------------
echo.
call :cat_load_config
call :cat_discover

echo ====================================================================
echo  Cleanup Complete. Unreferenced caches safely pruned.
if !T2_PRESERVED! gtr 0 (
    echo  T2 Capability Caches    : !T2_PRESERVED! preserved ^(safe default; use /include-coupled to override^)
)
if "!INCLUDE_COUPLED!"=="0" (
    echo  Capability Inventory    : PASS ^(!CAP_BEFORE! capability items verified intact^)
)
echo ====================================================================

if "!T2_PURGED!"=="1" (
    echo.
    echo ====================================================================
    if "%DRY_RUN%"=="1" (
        echo  📋 REHYDRATION MANIFEST ^(Preview - Rehydration Impact if Executed^)
    ) else (
        echo  📋 REHYDRATION MANIFEST ^(T2 Capability-Coupled Caches Purged^)
    )
    echo ====================================================================
    echo The following capability-coupled caches were targeted under explicit opt-in:
    echo - OpenCode: packages/npm/skills ^| Reinstalls on next run ^| Restore: opencode
    echo - Claude: cache                 ^| Reinstalls on tool launch ^| Restore: claude
    echo - Continue: cache               ^| Rebuilt on next index run ^| Restore: Reload Continue
    echo - Gemini: cache                 ^| Reinstalls on MCP start   ^| Restore: agy
    echo ====================================================================
)

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

rem ==========================================================================
rem Candidate catalog: /list  /browse  /only  /interactive
rem One registry drives listing, browsing, and deletion so what a user
rem inspects is exactly what is removed.
rem   T1   regenerable, cleaned on a normal run
rem   ASK  expensive or admin-gated, only on explicit selection
rem   ASK! irreversible, only after typing yes
rem ==========================================================================

:catalog_main
call :cat_load_config
call :cat_init
if /i "%CATALOG_MODE%"=="list" (
    call :cat_list
    goto cat_done
)
if /i "%CATALOG_MODE%"=="discover" (
    call :cat_discover
    goto cat_done
)
if /i "%CATALOG_MODE%"=="learned" (
    call :cat_show_learned
    goto cat_done
)
if /i "%CATALOG_MODE%"=="learn" (
    call :cat_learn "%LEARN_ACTION%" "%LEARN_KEYS%"
    goto cat_done
)
if /i "%CATALOG_MODE%"=="browse" (
    call :cat_browse "%CATALOG_ARG%"
    goto cat_done
)
if /i "%CATALOG_MODE%"=="only" (
    call :cat_only "%CATALOG_ARG%"
    goto cat_done
)
if /i "%CATALOG_MODE%"=="interactive" (
    call :cat_interactive
    goto cat_done
)
echo Unknown catalog mode: %CATALOG_MODE%
goto cat_done

:cat_done
endlocal
exit /b 0

:cat_init
set CAND_N=0
call :cand_add win-playwright T1 "Playwright browsers" "%LOCALAPPDATA%\ms-playwright" rm "" "Reinstall with: npx playwright install"
call :cand_add win-puppeteer T1 "Puppeteer Chrome download" "%USERPROFILE%\.cache\puppeteer" rm "" "Re-downloaded on next puppeteer install"
call :cand_add win-yarn T1 "Yarn cache" "%LOCALAPPDATA%\Yarn\Cache" rm "" "Re-downloaded on next yarn install"
call :cand_add win-pip T1 "pip wheel cache" "%LOCALAPPDATA%\pip\Cache" rm "" "Re-downloaded on next pip install"
call :cand_add win-typescript T1 "TypeScript server cache" "%LOCALAPPDATA%\Microsoft\TypeScript" rm "" "Rebuilt on the next tsserver run"
call :cand_add win-vscode-cache T1 "VS Code Cache" "%APPDATA%\Code\Cache" rm "" "Regenerated by VS Code"
call :cand_add win-vscode-codedata T1 "VS Code CachedData" "%APPDATA%\Code\CachedData" rm "" "Regenerated by VS Code"
call :cand_add win-vscode-gpu T1 "VS Code GPUCache" "%APPDATA%\Code\GPUCache" rm "" "Regenerated by VS Code"
call :cand_add win-vscode-logs T1 "VS Code logs" "%APPDATA%\Code\logs" rm "" "New logs written on next launch"
call :cand_add win-cursor-cache T1 "Cursor Cache" "%APPDATA%\Cursor\Cache" rm "" "Regenerated by Cursor"
call :cand_add win-cursor-codedata T1 "Cursor CachedData" "%APPDATA%\Cursor\CachedData" rm "" "Regenerated by Cursor"
call :cand_add win-crashdumps T1 "Crash dumps" "%LOCALAPPDATA%\CrashDumps" rm "" "Only written when an app crashes"
call :cand_add win-electron T1 "Electron download cache" "%LOCALAPPDATA%\electron\Cache" rm "" "Re-downloaded on next electron install"
call :cand_add win-nuget T1 "NuGet HTTP cache" "%LOCALAPPDATA%\NuGet\v3-cache" rm "" "Re-fetched on next restore"
call :cand_add win-temp ASK! "User TEMP folder" "%LOCALAPPDATA%\Temp" rm "" "PERMANENT - open apps may hold files in use"
call :cand_add win-update ASK "Windows Update downloads" "%SYSTEMROOT%\SoftwareDistribution\Download" rm "" "Needs an elevated prompt; re-downloaded on next update"
call :cand_add win-thumbs ASK "Explorer thumbnail cache" "%LOCALAPPDATA%\Microsoft\Windows\Explorer" rm "" "Close Explorer first; thumbcache_*.db regenerate"
call :cand_add win-recyclebin ASK! "Recycle Bin" "%SYSTEMDRIVE%\$Recycle.Bin" cmd "powershell -NoProfile -Command \"Clear-RecycleBin -Force -ErrorAction SilentlyContinue\"" "PERMANENT - deleted files cannot be restored"
call :cand_add win-docker ASK "Docker images/build cache" "" guide "" "Inspect: docker system df - Prune: docker system prune [-a]"
exit /b 0

:cand_add
set /a CAND_N+=1
set "C_ID_%CAND_N%=%~1"
set "C_TIER_%CAND_N%=%~2"
set "C_LABEL_%CAND_N%=%~3"
set "C_PATH_%CAND_N%=%~4"
set "C_METHOD_%CAND_N%=%~5"
set "C_CMD_%CAND_N%=%~6"
set "C_NOTE_%CAND_N%=%~7"
exit /b 0

rem Sizes are measured with PowerShell so partial access errors never skew them.
:cat_size
set "SZ_KB=0"
if "%~1"=="" exit /b 0
if not exist "%~1" exit /b 0
set "CCP=%~1"
for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "$s=(Get-ChildItem -LiteralPath $env:CCP -Recurse -Force -ErrorAction SilentlyContinue ^| Measure-Object -Property Length -Sum).Sum; if(-not $s){$s=0}; [math]::Floor($s/1KB)" 2^>nul`) do set "SZ_KB=%%A"
exit /b 0

:cat_fmt
set /a CC_MB=%~1/1024
if %CC_MB% geq 1024 (
    set /a CC_GB=CC_MB/1024
    set "SZ_TXT=!CC_GB! GB"
) else (
    set "SZ_TXT=%CC_MB% MB"
)
exit /b 0

:cat_list
echo ====================================================================
echo  Cache Candidate Catalog - Windows
echo ====================================================================
echo  T1 = auto-cleaned   ASK = needs selection   ASK! = irreversible
echo --------------------------------------------------------------------
set /a CAT_NUM=0
for /l %%i in (1,1,%CAND_N%) do call :cat_list_one %%i
echo --------------------------------------------------------------------
echo  Browse : clean-cache.cmd /browse ^<id^>
echo  Delete : clean-cache.cmd /only ^<id,id^> [/yes]
echo  Choose : clean-cache.cmd /interactive
echo ====================================================================
exit /b 0

:cat_list_one
set "N=%~1"
set "P=!C_PATH_%N%!"
set "M=!C_METHOD_%N%!"
if not "!P!"=="" (
    call :cat_size "!P!"
) else (
    set "SZ_KB=0"
)
if "!SZ_KB!"=="0" if /i not "!M!"=="guide" exit /b 0
set /a CAT_NUM+=1
if "!SZ_KB!"=="0" (
    set "SZ_TXT=n/a"
) else (
    call :cat_fmt !SZ_KB!
)
echo  !CAT_NUM!. !SZ_TXT! [!C_TIER_%N%!] !C_LABEL_%N%!  ^[!C_ID_%N%!^]
if not "!P!"=="" echo       -^> !P!
if not "!C_NOTE_%N%!"=="" echo       !C_NOTE_%N%!
exit /b 0

rem Resolve an id or a /list number into RES_IDX (empty when unknown).
:cat_resolve
set "RES_IDX="
for /l %%i in (1,1,%CAND_N%) do (
    if /i "!C_ID_%%i!"=="%~1" set "RES_IDX=%%i"
)
if not "!RES_IDX!"=="" exit /b 0
set /a CAT_NUM=0
for /l %%i in (1,1,%CAND_N%) do call :cat_num_probe %%i %~1
exit /b 0

:cat_num_probe
set "P=!C_PATH_%~1!"
set "M=!C_METHOD_%~1!"
if "!P!"=="" if /i not "!M!"=="guide" exit /b 0
if not "!P!"=="" (
    call :cat_size "!P!"
) else (
    set "SZ_KB=0"
)
if "!SZ_KB!"=="0" if /i not "!M!"=="guide" exit /b 0
set /a CAT_NUM+=1
if "!CAT_NUM!"=="%~2" set "RES_IDX=%~1"
exit /b 0

:cat_browse
if "%~1"=="" (
    echo Usage: clean-cache.cmd /browse ^<id-or-key^>
    exit /b 1
)
echo %~1| findstr /b /i /c:"proj:" >nul
if not errorlevel 1 (
    set "BP=%~1"
    set "BP=!BP:proj:=!"
    echo.
    echo --------------------------------------------------------------------
    echo  !BP!
    echo --------------------------------------------------------------------
    if exist "!BP!" (dir /a "!BP!") else (echo  Path no longer exists.)
    echo --------------------------------------------------------------------
    exit /b 0
)
call :cat_resolve "%~1"
if "!RES_IDX!"=="" (
    echo Unknown candidate: %~1
    echo Run /list to see ids.
    exit /b 1
)
set "N=!RES_IDX!"
echo.
echo --------------------------------------------------------------------
echo  !C_ID_%N%!  [!C_TIER_%N%!]  !C_LABEL_%N%!
echo --------------------------------------------------------------------
if not "!C_NOTE_%N%!"=="" echo  Note   : !C_NOTE_%N%!
set "P=!C_PATH_%N%!"
if "!C_METHOD_%N%!"=="guide" if "!P!"=="" (
    echo  Action : manual - nothing is deleted by this skill
    echo --------------------------------------------------------------------
    exit /b 0
)
call :cat_size "!P!"
call :cat_fmt !SZ_KB!
echo  Path   : !P!  ^(!SZ_TXT!^)
if exist "!P!" (
    for /f %%c in ('dir /s /b /a-d "!P!" 2^>nul ^| find /c /v ""') do echo  Files  : %%c
    echo  Contents:
    dir /a "!P!" 2>nul | findstr /v /c:"Directory of" | findstr /v /c:"Volume in drive" | findstr /v /c:"Total Files Listed" | findstr /v /c:"bytes free"
)
echo --------------------------------------------------------------------
exit /b 0

rem Delete one candidate, honouring DRY_RUN and printing one table row.
:cat_delete
set "N=%~1"
set "P=!C_PATH_%N%!"
set "M=!C_METHOD_%N%!"
set "L=!C_LABEL_%N%!"
if /i "!M!"=="guide" (
    echo [!L!] manual - !C_CMD_%N%!
    exit /b 0
)
if "%DRY_RUN%"=="1" (
    echo [!L!] reclaimable -^> !P!
    exit /b 0
)
if /i "!M!"=="rm" (
    if exist "!P!" rmdir /s /q "!P!" >nul 2>&1
) else (
    if not "!C_CMD_%N%!"=="" call !C_CMD_%N%! >nul 2>&1
)
if /i "!C_TIER_%N%!"=="ASK" call :learn_set "!C_ID_%N%!" allow
echo [!L!] cleaned
exit /b 0

:cat_auto
if /i not "!C_TIER_%~1!"=="T1" exit /b 0
call :learn_get "!C_ID_%~1!"
if /i "!LEARNED!"=="deny" exit /b 0
call :cat_delete %~1
exit /b 0

:cat_resolve_delete
echo %~1| findstr /b /i /c:"proj:" >nul
if not errorlevel 1 (
    call :disc_delete "%~1"
    exit /b 0
)
call :cat_resolve "%~1"
if not "!RES_IDX!"=="" call :cat_delete !RES_IDX!
exit /b 0

:hazard_banner
rem Loud irreversible-data warning. Args: candidate ids (empty = warn about every ASK! candidate).
set "HAZ=0"
set "HAZ_ALL=0"
if "%~1"=="" set "HAZ_ALL=1"
for /l %%i in (1,1,%CAND_N%) do (
    if /i "!C_TIER_%%i!"=="ASK!" (
        if "!HAZ_ALL!"=="1" (
            set "HAZ=1"
        ) else (
            for %%a in (%*) do (
                if /i "!C_ID_%%i!"=="%%~a" set "HAZ=1"
            )
        )
    )
)
if "%HAZ%"=="0" exit /b 0
echo.
echo ####################################################################
echo #                                                                  #
echo #   !!!  WARNING: IRREVERSIBLE DATA LOSS  !!!                      #
echo #                                                                  #
echo ####################################################################
if "%HAZ_ALL%"=="1" (
    echo    Irreversible candidates in this catalog. If you select any of
    echo    them, the delete CANNOT be undone:
) else (
    echo    These selections are NOT caches. Deleting them CANNOT be undone:
)
for /l %%i in (1,1,%CAND_N%) do (
    if /i "!C_TIER_%%i!"=="ASK!" (
        if "!HAZ_ALL!"=="1" (
            echo      - !C_LABEL_%%i!
        ) else (
            for %%a in (%*) do (
                if /i "!C_ID_%%i!"=="%%~a" echo      - !C_LABEL_%%i!
            )
        )
    )
)
echo    There is no Recycle Bin fallback, no restore point, and no undo.
echo    If you are unsure, answer no and re-run /browse first.
echo ####################################################################
echo.
exit /b 0

:cat_only
if "%~1"=="" (
    echo Usage: clean-cache.cmd /only ^<id,id^> [/yes] [/confirm-irreversible]
    exit /b 1
)
call :hazard_banner %~1
call :has_irreversible %~1
if errorlevel 1 (
    rem ASK! is irreversible; /yes alone is not consent. Require the explicit flag
    rem or a typed yes, even in a non-interactive shell.
    if "%CONFIRM_IRREV%"=="1" goto cat_only_delete
    set "CONFIRM="
    set /p "CONFIRM=Type yes to permanently delete the irreversible selections: "
    if /i not "!CONFIRM!"=="yes" (
        echo Aborted - nothing was deleted.
        exit /b 0
    )
    goto cat_only_delete
)
if "%ASSUME_YES%"=="0" (
    set "CONFIRM="
    set /p "CONFIRM=Type yes to delete the selected candidates: "
    if /i not "!CONFIRM!"=="yes" (
        echo Aborted - nothing was deleted.
        exit /b 0
    )
)
:cat_only_delete
for %%s in (%~1) do call :cat_resolve_delete %%s
exit /b 0

:has_irreversible
for /l %%i in (1,1,%CAND_N%) do (
    for %%a in (%~1) do (
        if /i "!C_ID_%%i!"=="%%~a" if /i "!C_TIER_%%i!"=="ASK!" exit /b 0
    )
)
exit /b 1

:cat_interactive
call :cat_list
echo.
set "SEL="
set /p "SEL=Enter numbers (1,3 or 1-3 or all) / none: "
if /i "!SEL!"=="" goto cat_int_abort
if /i "!SEL!"=="none" goto cat_int_abort
call :hazard_banner
set "CONFIRM="
set /p "CONFIRM=Type yes to permanently delete the selected candidates: "
if /i not "!CONFIRM!"=="yes" goto cat_int_abort
if /i "!SEL!"=="all" (
    for /l %%i in (1,1,%CAND_N%) do call :cat_delete %%i
) else (
    for %%s in (!SEL:,= !) do call :cat_resolve_delete %%s
)
exit /b 0

:cat_int_abort
echo Aborted - nothing was deleted.
exit /b 0

rem ==========================================================================
rem Discovery and learning (Windows)
rem Learned decisions: %LOCALAPPDATA%\clean-system-cache\learned.txt
rem   key|allow|date
rem ASK! items are never learned: Recycle Bin, %TEMP% and friends always ask.
rem ==========================================================================

:cat_load_config
if not exist "%STATE_DIR%" mkdir "%STATE_DIR%" >nul 2>&1
if exist "%CONFIG_FILE%" (
    for /f "usebackq tokens=1,2 delims==" %%A in ("%CONFIG_FILE%") do (
        if /i "%%A"=="PROJECT_ROOTS" set "PROJECT_ROOTS=%%B"
        if /i "%%A"=="DORMANT_DAYS" set "DORMANT_DAYS=%%B"
    )
)
if "%PROJECT_ROOTS%"=="" set "PROJECT_ROOTS=%USERPROFILE%\projects"
exit /b 0

:learn_get
set "LEARNED="
if not exist "%LEARN_FILE%" exit /b 0
for /f "usebackq tokens=1,2 delims=|" %%A in ("%LEARN_FILE%") do (
    if /i "%%A"=="%~1" set "LEARNED=%%B"
)
exit /b 0

:learn_set
if not exist "%STATE_DIR%" mkdir "%STATE_DIR%" >nul 2>&1
set "LTMP=%STATE_DIR%\learned.tmp"
set "LFOUND=0"
if exist "%LEARN_FILE%" (
    for /f "usebackq tokens=1,2,3 delims=|" %%A in ("%LEARN_FILE%") do (
        if /i "%%A"=="%~1" (
            echo %~1^|%~2^|%DATE%>>"%LTMP%"
            set "LFOUND=1"
        ) else (
            echo %%A^|%%B^|%%C>>"%LTMP%"
        )
    )
)
if "%LFOUND%"=="0" echo %~1^|%~2^|%DATE%>>"%LTMP%"
move /y "%LTMP%" "%LEARN_FILE%" >nul 2>&1
exit /b 0

:learn_forget
set "LTMP=%STATE_DIR%\learned.tmp"
set "LFOUND=0"
if not exist "%LEARN_FILE%" exit /b 0
for /f "usebackq tokens=1,2,3 delims=|" %%A in ("%LEARN_FILE%") do (
    if /i not "%%A"=="%~1" echo %%A^|%%B^|%%C>>"%LTMP%"
)
move /y "%LTMP%" "%LEARN_FILE%" >nul 2>&1
exit /b 0

:cat_learn
if "%~1"=="" (
    echo Usage: /learn ^<allow^|deny^|forget^> ^<key,key^>
    exit /b 1
)
if "%~2"=="" (
    echo Usage: /learn ^<allow^|deny^|forget^> ^<key,key^>
    exit /b 1
)
for %%k in (%~2) do call :learn_apply "%~1" "%%k"
exit /b 0

:learn_apply
if /i "%~1"=="forget" (
    call :learn_forget "%~2"
    echo  Forgotten: %~2
    exit /b 0
)
call :learn_set "%~2" "%~1"
echo  Learned: %~2 = %~1
exit /b 0

:cat_show_learned
if not exist "%LEARN_FILE%" (
    echo No learned decisions yet ^(%LEARN_FILE%^).
    exit /b 0
)
echo ====================================================================
echo  Learned decisions - %LEARN_FILE%
echo ====================================================================
type "%LEARN_FILE%"
echo ====================================================================
echo  allow = cleaned automatically when regenerable ^| deny = never offered
exit /b 0

:cat_discover
echo ====================================================================
echo  Discovery - Windows
echo ====================================================================
echo  Roots: %PROJECT_ROOTS%   Dormant: %DORMANT_DAYS%+ days
echo --------------------------------------------------------------------
if not exist "%STATE_DIR%" mkdir "%STATE_DIR%" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "$roots='%PROJECT_ROOTS%'.Split(';'); $names=@('.next','.nuxt','.svelte-kit','.turbo','.parcel-cache','.pytest_cache','__pycache__','.mypy_cache','.ruff_cache','.nyc_output','coverage','.angular'); $old=(Get-Date).AddDays(-%DORMANT_DAYS%); $out=@(); foreach($r in $roots){ if(-not (Test-Path -LiteralPath $r)){continue}; Get-ChildItem -LiteralPath $r -Directory -Recurse -Depth 4 -Force -ErrorAction SilentlyContinue | Where-Object { ($names -contains $_.Name) -and ($_.LastWriteTime -lt $old) } | ForEach-Object { $mb=[math]::Round(((Get-ChildItem -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum)/1MB); $out += ('{0}|{1}' -f $mb,$_.FullName) } }; if($out.Count -eq 0){ 'none' } else { $out }" > "%DISC_FILE%" 2>nul
set /a DNUM=0
for /f "usebackq tokens=1,2 delims=|" %%A in ("%DISC_FILE%") do (
    if /i not "%%A"=="none" (
        set /a DNUM+=1
        echo  !DNUM!. %%A MB   proj:%%B
    )
)
if "%DNUM%"=="0" echo  No dormant project build caches found.
echo --------------------------------------------------------------------
echo  Browse : /browse proj:^<path^>
echo  Apply  : /only proj:^<path^> [/yes]
echo  Learn  : /learn allow ^<path-key^>
echo ====================================================================
exit /b 0

:disc_delete
set "P=%~1"
set "P=!P:proj:=!"
if "%P%"=="" exit /b 1
if not exist "%DISC_FILE%" (
    echo Refusing: run /discover first.
    exit /b 1
)
findstr /i /e /c:"|%P%" "%DISC_FILE%" >nul 2>&1
if errorlevel 1 (
    echo Refusing: %P% is not in the last discovery. Run /discover again.
    exit /b 1
)
if "%DRY_RUN%"=="1" (
    echo [dry-run] %P%
    exit /b 0
)
rmdir /s /q "%P%" >nul 2>&1
echo [cleaned] %P%
exit /b 0
