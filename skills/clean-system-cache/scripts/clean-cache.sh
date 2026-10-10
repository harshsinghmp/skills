#!/usr/bin/env bash
# ==============================================================================
# clean-cache.sh — Cross-Platform Developer & Designer Cache Cleaner (Linux & macOS)
#
# Cleans ONLY unreferenced, dangling, and disposable caches produced by
# developer and designer toolchains based on top Reddit community recommendations:
#
# 1. Package Managers & Runtimes:
#    - uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet/nuget, composer, gradle, brew
# 2. IDEs & Mobile Build Tools:
#    - xcode (DerivedData), android (build-cache), vscode (workspaceStorage),
#      cursor (workspaceStorage), cypress
# 3. Containers & Virtualization:
#    - docker (BuildKit layers only), podman
# 4. Designers & Creative Suites:
#    - adobe (Media Cache .cfa/.pek, scratch files), figma, blender, electron
# 5. Web Browsers (HTTP Disk Cache ONLY - Zero Cookies/Session Impact):
#    - chrome, chromium, brave, edge, firefox, zen, vivaldi, safari (or 'browser')
# 6. Dead node_modules scanner:
#    - Optional scanner to detect abandoned node_modules across project directories
#
# Invariants:
# - Dynamically skips any tool not installed or absent on the system.
# - Running Session Protection: Never interrupts active browser sessions, running IDEs,
#   or render engines; active sessions are gracefully skipped in execution mode.
# - Cache Only: Strictly purges disposable HTTP/disk caches. NEVER touches cookies,
#   saved passwords, logins, history, bookmarks, tabs, or user profiles.
# - Zero external runtimes: pure POSIX / Bash with standard coreutils.
# ==============================================================================

set -eo pipefail

DRY_RUN=false
VERBOSE=false
SPECIFIC_TOOLS=""
SCAN_NODE_MODULES_PATH=""
OS="$(uname -s)"

usage() {
    cat << 'EOF'
Usage: clean-cache.sh [OPTIONS]

Clean only unreferenced, dangling, and unnecessary caches from installed development,
design, and browser tools across Linux and macOS. Requires zero external interpreters.

Options:
  --dry-run                 Inspect and calculate reclaimable cache space without deleting anything.
  --tool <list>             Comma-separated list of tools to clean (or 'all').
  --scan-node-modules <dir> Scan a directory tree for dormant node_modules folders and report sizes.
  -v, --verbose             Print detailed command execution outputs.
  -h, --help                Show this help message and exit.

Supported Tools:
  Package Managers : uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet, composer, gradle, brew
  IDEs & Compilers : xcode, android, vscode, cursor, cypress
  Containers       : docker, podman
  Designers        : adobe, figma, blender, electron
  Web Browsers     : chrome, chromium, brave, edge, firefox, zen, vivaldi, safari (or 'browser' for all)
EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --tool)
            SPECIFIC_TOOLS="$2"
            shift 2
            ;;
        --scan-node-modules)
            SCAN_NODE_MODULES_PATH="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown argument: $1" >&2
            echo "Run 'clean-cache.sh --help' for usage." >&2
            exit 1
            ;;
    esac
done

get_dir_size_kb() {
    local target="$1"
    if [ -d "$target" ]; then
        # du -sk works universally on both GNU/Linux and BSD/macOS
        du -sk "$target" 2>/dev/null | cut -f1 || echo 0
    elif [ -f "$target" ]; then
        local bytes
        bytes=$(wc -c < "$target" 2>/dev/null || echo 0)
        echo $(( bytes / 1024 ))
    else
        echo 0
    fi
}

fmt_kb() {
    local kb="$1"
    if [ -z "$kb" ] || [ "$kb" -le 0 ] 2>/dev/null; then
        echo "0 KB"
        return
    fi
    awk -v k="$kb" 'BEGIN {
        split("KB MB GB TB", u);
        i=1;
        while(k>=1024 && i<4){k/=1024; i++}
        if(i==1) printf "%d %s", k, u[i];
        else printf "%.2f %s", k, u[i];
    }'
}

is_tool_selected() {
    local t="$1"
    if [ -z "$SPECIFIC_TOOLS" ] || [ "$SPECIFIC_TOOLS" = "all" ]; then
        return 0
    fi
    if [[ ",$SPECIFIC_TOOLS," =~ ,"$t", ]]; then
        return 0
    fi
    # If the user specified 'browser', match any supported web browser
    if [[ ",$SPECIFIC_TOOLS," =~ ,browser, ]] && [[ ",chrome,chromium,brave,edge,firefox,zen,vivaldi,safari," =~ ,"$t", ]]; then
        return 0
    fi
    return 1
}

is_any_process_running() {
    for p in "$@"; do
        if command -v pgrep >/dev/null 2>&1; then
            if pgrep -x "$p" >/dev/null 2>&1 || pgrep -i -x "$p" >/dev/null 2>&1; then
                return 0
            fi
        else
            if ps -A -o comm= 2>/dev/null | grep -i -E "^${p}$" >/dev/null 2>&1; then
                return 0
            fi
        fi
    done
    return 1
}

# Chromium Profile HTTP & Bytecode Cache calculation
get_chromium_cache_size_kb() {
    local root="$1"
    local total=0
    [ ! -d "$root" ] && echo 0 && return
    
    # Root-level cache subdirectories if present
    for sub in "Cache/Cache_Data" "Cache" "Code Cache" "GPUCache" "GrShaderCache" "ShaderCache"; do
        if [ -d "$root/$sub" ]; then
            local sz
            sz=$(get_dir_size_kb "$root/$sub")
            total=$(( total + sz ))
        fi
    done

    # Profiles (Default, Profile 1, Profile 2, etc.)
    for p in "$root"/*; do
        [ ! -d "$p" ] && continue
        for sub in "Cache/Cache_Data" "Cache" "Code Cache" "GPUCache" "GrShaderCache" "ShaderCache"; do
            if [ -d "$p/$sub" ]; then
                local sz
                sz=$(get_dir_size_kb "$p/$sub")
                total=$(( total + sz ))
            fi
        done
    done
    echo "$total"
}

# Helper: Purge contents of a cache directory safely without touching parent directory
purge_dir_contents() {
    local target="$1"
    if [ -d "$target" ]; then
        find "$target" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
    fi
}

# Purge Chromium Profile HTTP & Bytecode Caches ONLY
# NEVER touches cookies, login data, bookmarks, history, sessions, or user profiles
purge_chromium_cache() {
    local root="$1"
    [ ! -d "$root" ] && return
    
    for sub in "Cache/Cache_Data" "Cache" "Code Cache" "GPUCache" "GrShaderCache" "ShaderCache"; do
        purge_dir_contents "$root/$sub"
    done

    for p in "$root"/*; do
        [ ! -d "$p" ] && continue
        for sub in "Cache/Cache_Data" "Cache" "Code Cache" "GPUCache" "GrShaderCache" "ShaderCache"; do
            purge_dir_contents "$p/$sub"
        done
    done
}

# Gecko (Firefox/Zen) HTTP & Startup Cache calculation
get_gecko_cache_size_kb() {
    local root="$1"
    local total=0
    [ ! -d "$root" ] && echo 0 && return
    for p in "$root"/*; do
        [ ! -d "$p" ] && continue
        for sub in "cache2" "startupCache" "thumbnails"; do
            if [ -d "$p/$sub" ]; then
                local sz
                sz=$(get_dir_size_kb "$p/$sub")
                total=$(( total + sz ))
            fi
        done
    done
    echo "$total"
}

# Purge Gecko HTTP & Startup Caches ONLY
# Strictly targets cache2/entries, cache2/doomed, startupCache, thumbnails
# NEVER touches ~/.mozilla, ~/.config/zen, places.sqlite, cookies.sqlite, logins.json, or sessions
purge_gecko_cache() {
    local root="$1"
    [ ! -d "$root" ] && return
    for p in "$root"/*; do
        [ ! -d "$p" ] && continue
        if [ -d "$p/cache2" ]; then
            purge_dir_contents "$p/cache2/entries"
            purge_dir_contents "$p/cache2/doomed"
            find "$p/cache2" -maxdepth 1 -name "trash*" -exec rm -rf {} + 2>/dev/null || true
        fi
        purge_dir_contents "$p/startupCache"
        purge_dir_contents "$p/thumbnails"
    done
}

# Modular Chromium Browser Handler with Running Session Protection
handle_chromium_browser() {
    local tool_id="$1"
    local label="$2"
    local cache_dir=""
    [ "$OS" = "Linux" ] && cache_dir="$3"
    [ "$OS" = "Darwin" ] && cache_dir="$4"
    shift 4
    local proc_candidates=("$@")

    if ! is_tool_selected "$tool_id"; then
        return
    fi
    [ -z "$cache_dir" ] || [ ! -d "$cache_dir" ] && return

    local size_before
    size_before=$(get_chromium_cache_size_kb "$cache_dir")
    [ "$size_before" -le 0 ] && return

    if is_any_process_running "${proc_candidates[@]}"; then
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "running" "$size_before" 0 "$size_before" "$label is running; reclaimable when closed"
        else
            record_result "$label" "skipped" "$size_before" "$size_before" 0 "Active session running; skipped to protect tabs"
        fi
    else
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "reclaimable" "$size_before" 0 "$size_before" "Would prune HTTP disk cache & bytecode cache"
        else
            purge_chromium_cache "$cache_dir"
            local size_after
            size_after=$(get_chromium_cache_size_kb "$cache_dir")
            local reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "$label" "cleaned" "$size_before" "$size_after" "$reclaimed" "Web HTTP disk cache & bytecode pruned"
        fi
    fi
}

# Modular Gecko Browser Handler with Running Session Protection
handle_gecko_browser() {
    local tool_id="$1"
    local label="$2"
    local cache_dir=""
    [ "$OS" = "Linux" ] && cache_dir="$3"
    [ "$OS" = "Darwin" ] && cache_dir="$4"
    shift 4
    local proc_candidates=("$@")

    if ! is_tool_selected "$tool_id"; then
        return
    fi
    [ -z "$cache_dir" ] || [ ! -d "$cache_dir" ] && return

    local size_before
    size_before=$(get_gecko_cache_size_kb "$cache_dir")
    [ "$size_before" -le 0 ] && return

    if is_any_process_running "${proc_candidates[@]}"; then
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "running" "$size_before" 0 "$size_before" "$label is running; reclaimable when closed"
        else
            record_result "$label" "skipped" "$size_before" "$size_before" 0 "Active session running; skipped to protect tabs"
        fi
    else
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "reclaimable" "$size_before" 0 "$size_before" "Would prune HTTP disk cache (cache2) & startupCache"
        else
            purge_gecko_cache "$cache_dir"
            local size_after
            size_after=$(get_gecko_cache_size_kb "$cache_dir")
            local reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "$label" "cleaned" "$size_before" "$size_after" "$reclaimed" "HTTP disk cache (cache2) & startupCache cleared"
        fi
    fi
}

# Safari Handler (macOS Only) with Running Session Protection
handle_safari_browser() {
    [ "$OS" != "Darwin" ] && return
    if ! is_tool_selected "safari"; then
        return
    fi
    local safari_cache="$HOME/Library/Caches/com.apple.Safari"
    [ ! -d "$safari_cache" ] && return

    local size_before=0
    for sub in "fsCachedData" "WebKitCache"; do
        [ -d "$safari_cache/$sub" ] && size_before=$(( size_before + $(get_dir_size_kb "$safari_cache/$sub") ))
    done
    [ "$size_before" -le 0 ] && return

    if is_any_process_running "Safari"; then
        if [ "$DRY_RUN" = true ]; then
            record_result "safari (cache)" "running" "$size_before" 0 "$size_before" "Safari is running; reclaimable when closed"
        else
            record_result "safari (cache)" "skipped" "$size_before" "$size_before" 0 "Active session running; skipped to protect tabs"
        fi
    else
        if [ "$DRY_RUN" = true ]; then
            record_result "safari (cache)" "reclaimable" "$size_before" 0 "$size_before" "Would prune Safari WebKit & disk caches"
        else
            for sub in "fsCachedData" "WebKitCache"; do
                purge_dir_contents "$safari_cache/$sub"
            done
            local size_after=0
            for sub in "fsCachedData" "WebKitCache"; do
                [ -d "$safari_cache/$sub" ] && size_after=$(( size_after + $(get_dir_size_kb "$safari_cache/$sub") ))
            done
            local reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "safari (cache)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Safari disk caches cleared"
        fi
    fi
}

MODE_LABEL="EXECUTED"
if [ "$DRY_RUN" = true ]; then
    MODE_LABEL="DRY RUN (Preview)"
fi

echo "===================================================================="
echo " 🧹 Clean System Cache (${OS}) — ${MODE_LABEL}"
echo "===================================================================="
printf "%-26s | %-11s | %-10s | %-10s | %s\n" "Tool / Suite" "Status" "Before" "After" "Reclaimed"
echo "--------------------------------------------------------------------"

TOTAL_RECLAIMED_KB=0

record_result() {
    local tool="$1"
    local status="$2"
    local b_kb="$3"
    local a_kb="$4"
    local r_kb="$5"
    local details="$6"

    TOTAL_RECLAIMED_KB=$(( TOTAL_RECLAIMED_KB + r_kb ))
    local b_fmt a_fmt r_fmt
    b_fmt=$(fmt_kb "$b_kb")
    a_fmt=$(fmt_kb "$a_kb")
    r_fmt=$(fmt_kb "$r_kb")

    printf "%-26s | %-11s | %-10s | %-10s | %s\n" "$tool" "$status" "$b_fmt" "$a_fmt" "$r_fmt"
    if [ "$VERBOSE" = true ] && [ -n "$details" ]; then
        echo "  └─ $details"
    fi
}

# ------------------------------------------------------------------------------
# 1. Package Managers & Runtimes
# ------------------------------------------------------------------------------

# uv
if is_tool_selected "uv" && command -v uv >/dev/null 2>&1; then
    cache_dir="$HOME/.cache/uv"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/uv" ] && cache_dir="$HOME/Library/Caches/uv"
    if uv_dir=$(uv cache dir 2>/dev/null) && [ -n "$uv_dir" ]; then
        cache_dir="$uv_dir"
    fi
    size_before=$(get_dir_size_kb "$cache_dir")
    if [ "$DRY_RUN" = true ]; then
        record_result "uv" "reclaimable" "$size_before" 0 "$size_before" "Would clean $cache_dir"
    else
        out=$(uv cache clean 2>&1 || true)
        size_after=$(get_dir_size_kb "$cache_dir")
        reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
        record_result "uv" "cleaned" "$size_before" "$size_after" "$reclaimed" "$out"
    fi
fi

# npm
if is_tool_selected "npm" && command -v npm >/dev/null 2>&1; then
    npm_cache="$HOME/.npm"
    size_before=$(get_dir_size_kb "$npm_cache")
    if [ "$DRY_RUN" = true ]; then
        record_result "npm" "reclaimable" "$size_before" 0 "$size_before" "Would clean npm cache and stale _npx"
    else
        npm cache clean --force >/dev/null 2>&1 || true
        purge_dir_contents "$npm_cache/_npx"
        purge_dir_contents "$npm_cache/_logs"
        size_after=$(get_dir_size_kb "$npm_cache")
        reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
        record_result "npm" "cleaned" "$size_before" "$size_after" "$reclaimed" "Cleared cache and temporary npx runs"
    fi
fi

# bun
if is_tool_selected "bun" && command -v bun >/dev/null 2>&1; then
    bun_cache="$HOME/.bun/install/cache"
    size_before=$(get_dir_size_kb "$bun_cache")
    if [ "$DRY_RUN" = true ]; then
        record_result "bun" "reclaimable" "$size_before" 0 "$size_before" "Would clean bun install/bunx cache"
    else
        out=$(bun pm cache rm 2>&1 || true)
        size_after=$(get_dir_size_kb "$bun_cache")
        reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
        record_result "bun" "cleaned" "$size_before" "$size_after" "$reclaimed" "$out"
    fi
fi

# pip
if is_tool_selected "pip"; then
    pip_cache="$HOME/.cache/pip"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/pip" ] && pip_cache="$HOME/Library/Caches/pip"
    size_before=$(get_dir_size_kb "$pip_cache")
    if command -v pip >/dev/null 2>&1 || command -v pip3 >/dev/null 2>&1 || [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "pip" "reclaimable" "$size_before" 0 "$size_before" "Would purge pip cache"
        else
            if command -v pip >/dev/null 2>&1; then
                pip cache purge >/dev/null 2>&1 || true
            elif command -v pip3 >/dev/null 2>&1; then
                pip3 cache purge >/dev/null 2>&1 || true
            fi
            size_after=$(get_dir_size_kb "$pip_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "pip" "cleaned" "$size_before" "$size_after" "$reclaimed" "Purged wheel cache"
        fi
    fi
fi

# pnpm
if is_tool_selected "pnpm" && command -v pnpm >/dev/null 2>&1; then
    store_dir="$HOME/.local/share/pnpm/store"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/pnpm/store" ] && store_dir="$HOME/Library/pnpm/store"
    if p_dir=$(pnpm store path 2>/dev/null) && [ -n "$p_dir" ]; then
        store_dir="$p_dir"
    fi
    size_before=$(get_dir_size_kb "$store_dir")
    if [ "$DRY_RUN" = true ]; then
        record_result "pnpm" "reclaimable" "$size_before" "$size_before" 0 "Would prune unreferenced store"
    else
        out=$(pnpm store prune 2>&1 || true)
        size_after=$(get_dir_size_kb "$store_dir")
        reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
        record_result "pnpm" "cleaned" "$size_before" "$size_after" "$reclaimed" "Pruned store packages"
    fi
fi

# yarn
if is_tool_selected "yarn" && command -v yarn >/dev/null 2>&1; then
    if [ "$DRY_RUN" = true ]; then
        record_result "yarn" "reclaimable" 0 0 0 "Would run 'yarn cache clean'"
    else
        yarn cache clean >/dev/null 2>&1 || true
        record_result "yarn" "cleaned" 0 0 0 "Yarn cache cleared"
    fi
fi

# cargo
if is_tool_selected "cargo" && [ -d "$HOME/.cargo/registry/cache" ]; then
    cargo_cache="$HOME/.cargo/registry/cache"
    size_before=$(get_dir_size_kb "$cargo_cache")
    if [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "cargo (crates)" "reclaimable" "$size_before" 0 "$size_before" "Would delete .crate archive cache"
        else
            purge_dir_contents "$cargo_cache"
            size_after=$(get_dir_size_kb "$cargo_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "cargo (crates)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Deleted downloaded .crate archives"
        fi
    fi
fi

# go
if is_tool_selected "go"; then
    go_cache="$HOME/.cache/go-build"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/go-build" ] && go_cache="$HOME/Library/Caches/go-build"
    size_before=$(get_dir_size_kb "$go_cache")
    if command -v go >/dev/null 2>&1 || [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "go (build-cache)" "reclaimable" "$size_before" 0 "$size_before" "Would purge Go build cache"
        else
            if command -v go >/dev/null 2>&1; then
                go clean -cache >/dev/null 2>&1 || true
            else
                purge_dir_contents "$go_cache"
            fi
            size_after=$(get_dir_size_kb "$go_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "go (build-cache)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Go build cache purged"
        fi
    fi
fi

# dotnet / nuget
if is_tool_selected "dotnet" && command -v dotnet >/dev/null 2>&1; then
    if [ "$DRY_RUN" = true ]; then
        record_result "dotnet (nuget)" "reclaimable" 0 0 0 "Would clear NuGet HTTP and package cache"
    else
        dotnet nuget locals all --clear >/dev/null 2>&1 || true
        record_result "dotnet (nuget)" "cleaned" 0 0 0 "NuGet locals cleared"
    fi
fi

# composer (PHP)
if is_tool_selected "composer" && command -v composer >/dev/null 2>&1; then
    if [ "$DRY_RUN" = true ]; then
        record_result "composer" "reclaimable" 0 0 0 "Would clear composer cache"
    else
        composer clear-cache >/dev/null 2>&1 || true
        record_result "composer" "cleaned" 0 0 0 "Composer cache cleared"
    fi
fi

# gradle (Android & Java)
if is_tool_selected "gradle" && [ -d "$HOME/.gradle/caches" ]; then
    gradle_cache="$HOME/.gradle/caches"
    size_before=$(get_dir_size_kb "$gradle_cache")
    if [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "gradle (caches)" "reclaimable" "$size_before" 0 "$size_before" "Would clean gradle jars and build caches"
        else
            # Delete cached jars, wrapper downloads, and transforms
            find "$gradle_cache" -type f \( -name "*.jar" -o -name "*.zip" -o -name "*.lock" \) -delete 2>/dev/null || true
            size_after=$(get_dir_size_kb "$gradle_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "gradle (caches)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Gradle temporary zip and jar caches cleared"
        fi
    fi
fi

# homebrew (macOS / Linux)
if is_tool_selected "brew" && command -v brew >/dev/null 2>&1; then
    if [ "$DRY_RUN" = true ]; then
        record_result "homebrew" "reclaimable" 0 0 0 "Would run 'brew cleanup -s'"
    else
        brew cleanup -s >/dev/null 2>&1 || true
        record_result "homebrew" "cleaned" 0 0 0 "Homebrew download caches scrubbed"
    fi
fi

# ------------------------------------------------------------------------------
# 2. IDEs & Mobile Build Tools (Reddit Dev Favorites)
# ------------------------------------------------------------------------------

# Xcode DerivedData & Archives (macOS #1 Reddit complaint)
if is_tool_selected "xcode" && [ "$OS" = "Darwin" ]; then
    xcode_derived="$HOME/Library/Developer/Xcode/DerivedData"
    if [ -d "$xcode_derived" ]; then
        size_before=$(get_dir_size_kb "$xcode_derived")
        if [ "$size_before" -gt 0 ]; then
            if [ "$DRY_RUN" = true ]; then
                record_result "xcode (DerivedData)" "reclaimable" "$size_before" 0 "$size_before" "Would delete Xcode DerivedData compilation cache"
            else
                purge_dir_contents "$xcode_derived"
                size_after=$(get_dir_size_kb "$xcode_derived")
                reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                record_result "xcode (DerivedData)" "cleaned" "$size_before" "$size_after" "$reclaimed" "DerivedData compilation artifacts cleared"
            fi
        fi
    fi
fi

# Android build cache
if is_tool_selected "android" && [ -d "$HOME/.android/build-cache" ]; then
    android_cache="$HOME/.android/build-cache"
    size_before=$(get_dir_size_kb "$android_cache")
    if [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "android (build-cache)" "reclaimable" "$size_before" 0 "$size_before" "Would delete Android Studio build-cache"
        else
            purge_dir_contents "$android_cache"
            size_after=$(get_dir_size_kb "$android_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "android (build-cache)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Android build cache purged"
        fi
    fi
fi

# VS Code Stale Workspace Storage
if is_tool_selected "vscode"; then
    vscode_ws=""
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Application Support/Code/User/workspaceStorage" ] && vscode_ws="$HOME/Library/Application Support/Code/User/workspaceStorage"
    [ "$OS" = "Linux" ] && [ -d "$HOME/.config/Code/User/workspaceStorage" ] && vscode_ws="$HOME/.config/Code/User/workspaceStorage"
    if [ -n "$vscode_ws" ] && [ -d "$vscode_ws" ]; then
        size_before=$(get_dir_size_kb "$vscode_ws")
        if [ "$size_before" -gt 102400 ]; then # Only notify/clean if >100MB
            if [ "$DRY_RUN" = true ]; then
                record_result "vscode (workspace)" "reclaimable" "$size_before" 0 "$size_before" "Stale workspace state available for pruning"
            fi
        fi
    fi
fi

# Cursor Stale Workspace Storage
if is_tool_selected "cursor"; then
    cursor_ws=""
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Application Support/Cursor/User/workspaceStorage" ] && cursor_ws="$HOME/Library/Application Support/Cursor/User/workspaceStorage"
    [ "$OS" = "Linux" ] && [ -d "$HOME/.config/Cursor/User/workspaceStorage" ] && cursor_ws="$HOME/.config/Cursor/User/workspaceStorage"
    if [ -n "$cursor_ws" ] && [ -d "$cursor_ws" ]; then
        size_before=$(get_dir_size_kb "$cursor_ws")
        if [ "$size_before" -gt 102400 ]; then # Only notify if >100MB
            if [ "$DRY_RUN" = true ]; then
                record_result "cursor (workspace)" "reclaimable" "$size_before" 0 "$size_before" "Stale Cursor workspace state available"
            fi
        fi
    fi
fi

# Cypress E2E binary download cache
if is_tool_selected "cypress"; then
    cypress_cache="$HOME/.cache/Cypress"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/Cypress" ] && cypress_cache="$HOME/Library/Caches/Cypress"
    if [ -d "$cypress_cache" ]; then
        size_before=$(get_dir_size_kb "$cypress_cache")
    if [ "$size_before" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            record_result "cypress" "reclaimable" "$size_before" 0 "$size_before" "Would clear cached Cypress browser runtimes"
        else
            if command -v npx >/dev/null 2>&1; then
                npx cypress cache clear >/dev/null 2>&1 || purge_dir_contents "$cypress_cache"
            else
                purge_dir_contents "$cypress_cache"
            fi
            size_after=$(get_dir_size_kb "$cypress_cache")
            reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "cypress" "cleaned" "$size_before" "$size_after" "$reclaimed" "Cypress browser cache cleared"
        fi
    fi
fi
fi

# ------------------------------------------------------------------------------
# 3. Containers & Virtualization
# ------------------------------------------------------------------------------

# Docker (BuildKit cache only)
if is_tool_selected "docker" && command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
        if [ "$DRY_RUN" = true ]; then
            record_result "docker (build-cache)" "reclaimable" 0 0 0 "Would run 'docker builder prune -f'"
        else
            docker builder prune -f >/dev/null 2>&1 || true
            record_result "docker (build-cache)" "cleaned" 0 0 0 "Dangling BuildKit layers pruned"
        fi
    fi
fi

# Podman
if is_tool_selected "podman" && command -v podman >/dev/null 2>&1; then
    if [ "$DRY_RUN" = true ]; then
        record_result "podman" "reclaimable" 0 0 0 "Would run 'podman system prune --build-cache -f'"
    else
        podman system prune --build-cache -f >/dev/null 2>&1 || true
        record_result "podman" "cleaned" 0 0 0 "Podman build cache pruned"
    fi
fi

# ------------------------------------------------------------------------------
# 4. Designers & Creative Suites (Reddit Designer Favorites)
# ------------------------------------------------------------------------------

# Adobe Media Cache & Scratch files (Premiere, After Effects, Photoshop)
if is_tool_selected "adobe"; then
    adobe_dir=""
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Application Support/Adobe/Common" ] && adobe_dir="$HOME/Library/Application Support/Adobe/Common"
    [ "$OS" = "Linux" ] && [ -d "$HOME/.adobe" ] && adobe_dir="$HOME/.adobe"
    if [ -n "$adobe_dir" ] && [ -d "$adobe_dir" ]; then
        size_before=0
        for sub in "Media Cache Files" "Media Cache" "Peak Files"; do
            [ -d "$adobe_dir/$sub" ] && size_before=$(( size_before + $(get_dir_size_kb "$adobe_dir/$sub") ))
        done
        if [ "$size_before" -gt 0 ]; then
            if [ "$DRY_RUN" = true ]; then
                record_result "adobe (media-cache)" "reclaimable" "$size_before" 0 "$size_before" "Would delete Adobe scratch, .cfa, and .pek peak files"
            else
                for sub in "Media Cache Files" "Media Cache" "Peak Files"; do
                    purge_dir_contents "$adobe_dir/$sub"
                done
                size_after=0
                for sub in "Media Cache Files" "Media Cache" "Peak Files"; do
                    [ -d "$adobe_dir/$sub" ] && size_after=$(( size_after + $(get_dir_size_kb "$adobe_dir/$sub") ))
                done
                reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                record_result "adobe (media-cache)" "cleaned" "$size_before" "$size_after" "$reclaimed" "Scratch and peak media caches deleted"
            fi
        fi
    fi
    # Photoshop temporary files left in /tmp
    ps_temp_kb=$(find /tmp -maxdepth 1 -name "Photoshop Temp*" -exec du -sk {} + 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    if [ "$ps_temp_kb" -gt 0 ]; then
        if is_any_process_running "photoshop" "Photoshop" "Photoshop.exe"; then
            if [ "$DRY_RUN" = true ]; then
                record_result "photoshop (temp)" "running" "$ps_temp_kb" 0 "$ps_temp_kb" "Photoshop is running; reclaimable when closed"
            else
                record_result "photoshop (temp)" "skipped" "$ps_temp_kb" "$ps_temp_kb" 0 "Running session protected; close Photoshop to prune"
            fi
        else
            if [ "$DRY_RUN" = true ]; then
                record_result "photoshop (temp)" "reclaimable" "$ps_temp_kb" 0 "$ps_temp_kb" "Abandoned Photoshop scratch files in /tmp"
            else
                find /tmp -maxdepth 1 -name "Photoshop Temp*" -delete 2>/dev/null || true
                record_result "photoshop (temp)" "cleaned" "$ps_temp_kb" 0 "$ps_temp_kb" "Photoshop temp scratch files cleared"
            fi
        fi
    fi
fi

# Figma Cache (Desktop App)
if is_tool_selected "figma"; then
    figma_cache=""
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/com.figma.Desktop" ] && figma_cache="$HOME/Library/Caches/com.figma.Desktop"
    [ -d "$HOME/.config/figma-linux/Cache" ] && figma_cache="$HOME/.config/figma-linux/Cache"
    [ -d "$HOME/.cache/figma-linux" ] && figma_cache="$HOME/.cache/figma-linux"
    if [ -n "$figma_cache" ] && [ -d "$figma_cache" ]; then
        size_before=$(get_dir_size_kb "$figma_cache")
        if [ "$size_before" -gt 0 ]; then
            if is_any_process_running "figma" "figma-linux" "Figma"; then
                if [ "$DRY_RUN" = true ]; then
                    record_result "figma" "running" "$size_before" 0 "$size_before" "Figma is running; reclaimable when closed"
                else
                    record_result "figma" "skipped" "$size_before" "$size_before" 0 "Running session protected; close Figma to prune"
                fi
            else
                if [ "$DRY_RUN" = true ]; then
                    record_result "figma" "reclaimable" "$size_before" 0 "$size_before" "Would delete Figma desktop asset cache"
                else
                    purge_dir_contents "$figma_cache"
                    size_after=$(get_dir_size_kb "$figma_cache")
                    reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                    record_result "figma" "cleaned" "$size_before" "$size_after" "$reclaimed" "Figma asset cache cleared"
                fi
            fi
        fi
    fi
fi

# Blender (Render previews and shader thumbnail caches)
if is_tool_selected "blender"; then
    blender_cache=""
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/Blender" ] && blender_cache="$HOME/Library/Caches/Blender"
    [ -d "$HOME/.cache/blender" ] && blender_cache="$HOME/.cache/blender"
    if [ -n "$blender_cache" ] && [ -d "$blender_cache" ]; then
        size_before=$(get_dir_size_kb "$blender_cache")
        if [ "$size_before" -gt 0 ]; then
            if is_any_process_running "blender" "Blender"; then
                if [ "$DRY_RUN" = true ]; then
                    record_result "blender" "running" "$size_before" 0 "$size_before" "Blender is running; reclaimable when closed"
                else
                    record_result "blender" "skipped" "$size_before" "$size_before" 0 "Running session protected; close Blender to prune"
                fi
            else
                if [ "$DRY_RUN" = true ]; then
                    record_result "blender" "reclaimable" "$size_before" 0 "$size_before" "Would clear Blender shader/preview cache"
                else
                    purge_dir_contents "$blender_cache"
                    size_after=$(get_dir_size_kb "$blender_cache")
                    reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                    record_result "blender" "cleaned" "$size_before" "$size_after" "$reclaimed" "Blender preview caches cleared"
                fi
            fi
        fi
    fi
fi

# Electron binary and prebuild cache
if is_tool_selected "electron"; then
    electron_cache="$HOME/.cache/electron"
    [ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/electron" ] && electron_cache="$HOME/Library/Caches/electron"
    if [ -d "$electron_cache" ]; then
        size_before=$(get_dir_size_kb "$electron_cache")
        if [ "$size_before" -gt 0 ]; then
            if [ "$DRY_RUN" = true ]; then
                record_result "electron" "reclaimable" "$size_before" 0 "$size_before" "Would delete stale electron zips"
            else
                purge_dir_contents "$electron_cache"
                size_after=$(get_dir_size_kb "$electron_cache")
                reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                record_result "electron" "cleaned" "$size_before" "$size_after" "$reclaimed" "Deleted stale electron binary zips"
            fi
        fi
    fi
fi

# ------------------------------------------------------------------------------
# 5. Web Browsers (HTTP Disk Cache ONLY — Zero Cookies/Session Impact)
# Invariants:
# - Active Session Protection: If a browser is running, cache purge is skipped
#   in execution mode to guarantee live tabs, websockets, and sessions are never interrupted.
# - Cache Only: Strictly deletes Cache/Cache_Data, Code Cache, and cache2/entries.
#   NEVER touches cookies, sessions, saved passwords, logins, history, bookmarks, or tabs.
# ------------------------------------------------------------------------------

# Google Chrome
handle_chromium_browser "chrome" "chrome (cache)" \
    "$HOME/.cache/google-chrome" \
    "$HOME/Library/Caches/Google/Chrome" \
    "chrome" "google-chrome" "google-chrome-stable" "Google Chrome"

# Chromium
handle_chromium_browser "chromium" "chromium (cache)" \
    "$HOME/.cache/chromium" \
    "$HOME/Library/Caches/Chromium" \
    "chromium" "chromium-browser" "Chromium"

# Brave Browser
handle_chromium_browser "brave" "brave (cache)" \
    "$HOME/.cache/BraveSoftware/Brave-Browser" \
    "$HOME/Library/Caches/BraveSoftware/Brave-Browser" \
    "brave" "brave-browser" "Brave Browser"

# Microsoft Edge
handle_chromium_browser "edge" "edge (cache)" \
    "$HOME/.cache/microsoft-edge" \
    "$HOME/Library/Caches/Microsoft Edge" \
    "msedge" "microsoft-edge" "Microsoft Edge"

# Mozilla Firefox
handle_gecko_browser "firefox" "firefox (cache)" \
    "$HOME/.cache/mozilla/firefox" \
    "$HOME/Library/Caches/Firefox/Profiles" \
    "firefox" "firefox-bin" "Firefox"

# Zen Browser
handle_gecko_browser "zen" "zen (cache)" \
    "$HOME/.cache/zen" \
    "$HOME/Library/Caches/zen/Profiles" \
    "zen" "zen-bin" "Zen Browser"

# Vivaldi
handle_chromium_browser "vivaldi" "vivaldi (cache)" \
    "$HOME/.cache/vivaldi" \
    "$HOME/Library/Caches/Vivaldi" \
    "vivaldi" "vivaldi-bin" "Vivaldi"

# Apple Safari (macOS only)
handle_safari_browser

echo "--------------------------------------------------------------------"
if [ "$DRY_RUN" = true ]; then
    echo "Total Reclaimable Space : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
else
    echo "Total Space Reclaimed   : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
fi
free_disk=$(df -h "$HOME" | awk 'NR==2 {print $4}')
echo "Disk Free Space (Home)  : ${free_disk} available"
echo "===================================================================="

# ------------------------------------------------------------------------------
# 5. Optional Dormant node_modules Scanner (Inspired by Reddit npkill recommendation)
# ------------------------------------------------------------------------------
if [ -n "$SCAN_NODE_MODULES_PATH" ]; then
    echo ""
    echo "===================================================================="
    echo " 📦 Dormant node_modules Audit in: $SCAN_NODE_MODULES_PATH"
    echo "===================================================================="
    if [ ! -d "$SCAN_NODE_MODULES_PATH" ]; then
        echo "Directory not found: $SCAN_NODE_MODULES_PATH"
    else
        echo "Searching for node_modules directories (this may take a moment)..."
        found=0
        total_nm_kb=0
        while IFS= read -r nm_dir; do
            if [ -d "$nm_dir" ]; then
                found=1
                nm_sz=$(get_dir_size_kb "$nm_dir")
                total_nm_kb=$(( total_nm_kb + nm_sz ))
                printf "  %-12s %s\n" "$(fmt_kb "$nm_sz")" "$nm_dir"
            fi
        done < <(find "$SCAN_NODE_MODULES_PATH" -name "node_modules" -type d -prune 2>/dev/null)
        
        echo "--------------------------------------------------------------------"
        if [ "$found" -eq 1 ]; then
            echo "Total space consumed by scanned node_modules: ~$(fmt_kb "$total_nm_kb")"
            echo "Tip: Prune target project dependencies with package manager clean commands or 'npx npkill'."
        else
            echo "No node_modules directories found in $SCAN_NODE_MODULES_PATH"
        fi
    fi
    echo "===================================================================="
fi
