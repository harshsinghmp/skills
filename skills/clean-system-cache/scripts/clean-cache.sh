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
# 5. Agent Runtimes & Toolchains (Capability Tiering):
#    - opencode, claude, cursor, gemini/antigravity, codex, continue, mcp, lsp
#    - Three-tier classification: T1 Regenerable, T2 Capability-Coupled, T3 Irreplaceable
#    - T2 caches are PRESERVED BY DEFAULT; opt-in via --include-coupled with Rehydration Manifest
# 6. Web Browsers (HTTP Disk Cache ONLY - Zero Cookies/Session Impact):
#    - chrome, chromium, brave, edge, firefox, zen, vivaldi, safari (or 'browser')
# 7. Desktop, local-package & runtime scratch caches (or 'desktop', 'aur'):
#    - yay, shelly, paru, tracker3, thumbnails, fontconfig, appstream, gstreamer,
#      KDE .kcache/kpackage, systemsettings, flatpak metadata, GPU shader caches,
#      quickshell thumbnails, orca appimage, ryoku install, hyperframes,
#      chromium-headless, playwright, puppeteer, aria-template, pnpm metadata,
#      typescript server, mise downloads, nvm tarballs, opencode/bun logs,
#      Flatpak per-app HTTP caches
# 8. Confirmation-gated candidates (ASK / ASK! — never auto-deleted):
#    - Trash, pacman/apt/dnf package archives, systemd journal, /tmp strays,
#      rustup/nvm old editions, Go module cache, Docker images, Flatpak unused,
#      opencode session snapshots, agent session transcripts
# 9. Dead node_modules scanner:
#    - Optional scanner to detect abandoned node_modules across project directories
#
# Selection UX:
# - --list / --list --json : catalog every candidate with id, tier, size, paths
# - --browse <id>          : print the exact files/folders a candidate would delete
# - --interactive          : numbered multi-select menu for confirmation-gated items
# - --only <ids>           : delete exactly the named candidates (ids or list numbers)
#
# Invariants:
# - Dynamically skips any tool not installed or absent on the system.
# - Capability-Coupled Protection: T2 caches backing live agent capabilities (plugins,
#   skills, MCP servers, LSPs) are strictly PRESERVED BY DEFAULT.
# - Running Session Protection: Never interrupts active browser sessions, running IDEs,
#   or live agent runtimes; active sessions are gracefully skipped in execution mode.
# - Cache Only: Strictly purges disposable HTTP/disk caches. NEVER touches cookies,
#   saved passwords, logins, history, bookmarks, tabs, agent memory, or user profiles.
# - Zero external runtimes: pure POSIX / Bash with standard coreutils.
# ==============================================================================

set -eo pipefail

DRY_RUN=false
VERBOSE=false
INCLUDE_COUPLED=false
SPECIFIC_TOOLS=""
SCAN_NODE_MODULES_PATH=""
LIST_ONLY=false
JSON_OUT=false
BROWSE_TARGET=""
BROWSE_DEPTH=1
INTERACTIVE=false
ONLY_SELECTION=""
ASSUME_YES=false
CONFIRM_IRREVERSIBLE=false
INCLUDE_SYSTEM=false
DISCOVER_ONLY=false
CLEAN_SAFE=false
SHOW_LEARNED=false
LEARN_ACTION=""
LEARN_KEYS=""
PROJECT_ROOTS_OVERRIDE=""
DORMANT_OVERRIDE=""
MIN_SIZE_OVERRIDE=""
OS="$(uname -s)"
PURGED_T2_LIST=()
T2_PRESERVED_COUNT=0
CATALOG_RECLAIMED_KB=0

usage() {
    cat << 'EOF'
Usage: clean-cache.sh [OPTIONS]

Clean only unreferenced, dangling, and unnecessary caches from installed development,
design, agent, and browser tools across Linux and macOS. Requires zero external interpreters.

Options:
  --dry-run                 Inspect and calculate reclaimable cache space without deleting anything.
  --include-coupled         Opt-in to purging T2 capability-coupled caches (plugins, MCP, LSPs).
                            PRESERVED BY DEFAULT. Generates a rehydration manifest if purged.
  --all-caches              Alias for --include-coupled.
  --tool <list>             Comma-separated list of tools to clean (or 'all', 'browser', 'agents',
                            'desktop', 'aur', 'test').
  --list                    Catalog every candidate: id, tier, size, and exact paths. Deletes nothing.
  --json                    With --list, emit machine-readable JSON (for agent-driven menus).
  --discover, --scan        Scan caches, app config dirs, and project build caches; report only.
  --clean-safe              With --discover, also purge the SAFE discoveries.
  --browse <key|id|num>     Show the files and folders a candidate would delete, with sizes.
  --depth <n>               Browse depth for --browse (default: 1).
  --interactive, -i         Numbered menu of items that need a decision (grouped by scope).
  --only <key,..>           Delete exactly these items (catalog ids or discovered keys).
  --include-system          Permit sudo-backed candidates (pacman/apt/dnf/journal) in this run.
  --yes, -y                 Consent to ASK selections and skip their prompt (still prints the plan).
  --confirm-irreversible    Required for ASK! selections in non-interactive shells; --yes alone is not enough.
  --projects <dirs>         Colon-separated project roots to scan (persisted to config).
  --dormant <days>          Only treat project caches untouched this long as dormant (default 14).
  --min-size <mb>           Hide discovered items smaller than this (default 1 MB).
  --learn <act> <keys>      act = allow | deny | forget. Records a decision for future runs.
  --learned                 Show everything learned so far.
  --scan-node-modules <dir> Scan a directory tree for dormant node_modules folders and report sizes.
  -v, --verbose             Print detailed command execution outputs.
  -h, --help                Show this help message and exit.

Tiers:
  T1   Regenerable, auto-cleaned in a normal run.
  ASK  Regenerable but expensive/needs sudo — only deleted when you select it,
       then remembered (allow) so later runs can clean it automatically.
  ASK! Irreversible or personal (Trash, Downloads, /tmp strays, Flatpak app
       caches) — ALWAYS asks, never learned, never automatic.

Discovery scope (what counts as "safe to delete"):
  ~/.cache/*                      whole dirs, per the XDG cache contract
  ~/.config/<app>/{Cache,...}     exact cache dir names only
  ~/.var/app/<id>/cache           per-app caches (ASK — close the app first)
  <project>/{.next,.turbo,...}    build caches dormant for --dormant days (ASK)
Never touched: browsers, agent runtimes, orca/ryoku state, Trash, Downloads,
data folders, documents, and anything not matched by the rules above.

Supported Tools:
  Package Managers : uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet, composer, gradle, brew
  IDEs & Compilers : xcode, android, vscode, cursor, cypress
  Agent Runtimes   : opencode, claude, cursor, gemini, codex, continue, mcp, lsp (or 'agents' for all)
  Containers       : docker, podman
  Designers        : adobe, figma, blender, electron
  Web Browsers     : chrome, chromium, brave, edge, firefox, zen, vivaldi, safari (or 'browser' for all)
  Desktop & Local  : yay, shelly, paru, tracker, thumbnails, fontconfig, appstream, gstreamer,
                     kcache, kpackage, systemsettings, flatpak, shaders, quickshell, orca,
                     ryoku, hyperframes, headless-chrome, playwright, puppeteer, aria-template,
                     pnpm-meta, typescript, mise, nvm (or 'desktop' / 'aur' / 'test' for groups)
EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --include-coupled|--all-caches)
            INCLUDE_COUPLED=true
            shift
            ;;
        --tool)
            SPECIFIC_TOOLS="$2"
            shift 2
            ;;
        --list)
            LIST_ONLY=true
            shift
            ;;
        --json)
            JSON_OUT=true
            shift
            ;;
        --browse)
            BROWSE_TARGET="$2"
            shift 2
            ;;
        --depth)
            BROWSE_DEPTH="$2"
            shift 2
            ;;
        --interactive|-i)
            INTERACTIVE=true
            shift
            ;;
        --only)
            ONLY_SELECTION="$2"
            shift 2
            ;;
        --include-system)
            INCLUDE_SYSTEM=true
            shift
            ;;
        --discover|--scan)
            DISCOVER_ONLY=true
            shift
            ;;
        --clean-safe)
            CLEAN_SAFE=true
            shift
            ;;
        --learn)
            LEARN_ACTION="$2"
            LEARN_KEYS="$3"
            shift 3
            ;;
        --learned)
            SHOW_LEARNED=true
            shift
            ;;
        --projects)
            PROJECT_ROOTS_OVERRIDE="$2"
            shift 2
            ;;
        --dormant)
            DORMANT_OVERRIDE="$2"
            shift 2
            ;;
        --min-size)
            MIN_SIZE_OVERRIDE="$2"
            shift 2
            ;;
        --yes|-y)
            ASSUME_YES=true
            shift
            ;;
        --confirm-irreversible)
            CONFIRM_IRREVERSIBLE=true
            shift
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
    local target="$1" kb
    if [ -d "$target" ]; then
        # awk keeps this single-line even when du reports unreadable subdirs
        kb=$(du -sk "$target" 2>/dev/null | awk 'NR==1 {print $1}')
        echo "${kb:-0}"
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
    # If the user specified 'agents', match any supported agent runtime
    if [[ ",$SPECIFIC_TOOLS," =~ ,agents, ]] && [[ ",opencode,claude,cursor,gemini,codex,continue,mcp,lsp," =~ ,"$t", ]]; then
        return 0
    fi
    # If the user specified 'desktop', match desktop/index/font/theme caches
    if [[ ",$SPECIFIC_TOOLS," =~ ,desktop, ]] && [[ ",tracker,thumbnails,fontconfig,appstream,gstreamer,kcache,kpackage,systemsettings,flatpak,shaders,quickshell,orca,ryoku,hyperframes,headless-chrome,thunderbird," =~ ,"$t", ]]; then
        return 0
    fi
    # If the user specified 'aur', match Arch user-repository build helpers
    if [[ ",$SPECIFIC_TOOLS," =~ ,aur, ]] && [[ ",yay,shelly,paru," =~ ,"$t", ]]; then
        return 0
    fi
    # If the user specified 'test', match browser-automation runtime caches
    if [[ ",$SPECIFIC_TOOLS," =~ ,test, ]] && [[ ",playwright,puppeteer,cypress," =~ ,"$t", ]]; then
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
            # Also check command lines for agent runtimes that may run under node / python / electron
            if [ "$p" = "opencode" ] || [ "$p" = "claude" ] || [ "$p" = "antigravity" ]; then
                if pgrep -f "/$p" >/dev/null 2>&1 || pgrep -f "$p " >/dev/null 2>&1; then
                    return 0
                fi
            fi
        else
            if ps -A -o comm= 2>/dev/null | grep -i -E "^${p}$" >/dev/null 2>&1; then
                return 0
            fi
        fi
    done
    return 1
}

# Snapshot active agent capabilities before cleanup
snapshot_agent_capabilities() {
    local count=0
    local dirs=(
        "$HOME/.cache/opencode/npm"
        "$HOME/.cache/opencode/packages"
        "$HOME/.cache/opencode/skills"
        "$HOME/.cache/opencode/bin"
        "$HOME/Library/Caches/opencode/npm"
        "$HOME/Library/Caches/opencode/packages"
        "$HOME/Library/Caches/opencode/skills"
        "$HOME/.cache/claude"
        "$HOME/.claude/cache"
        "$HOME/.cache/gemini"
        "$HOME/.cache/antigravity"
        "$HOME/.continue/cache"
        "$HOME/.cache/continue"
        "$HOME/.cache/mcp"
        "$HOME/.cache/lsp"
    )
    for d in "${dirs[@]}"; do
        if [ -d "$d" ]; then
            local n
            n=$(find "$d" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l || echo 0)
            count=$(( count + n ))
        fi
    done
    echo "$count"
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

TOTAL_RECLAIMED_KB=0
MODE_LABEL="EXECUTED"
if [ "$DRY_RUN" = true ]; then
    MODE_LABEL="DRY RUN (Preview)"
fi

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

    printf "%-32s | %-11s | %-10s | %-10s | %s\n" "$tool" "$status" "$b_fmt" "$a_fmt" "$r_fmt"
    if [ "$VERBOSE" = true ] && [ -n "$details" ]; then
        echo "  └─ $details"
    fi
}

CAP_BEFORE=$(snapshot_agent_capabilities)

# ==============================================================================
# 7. Candidate Catalog — single registry behind --list, --browse, --only, -i
#
# The same entries are rendered, browsed, and deleted, so what a user inspects
# is exactly what leaves the disk. Tiers:
#   T1   regenerable, auto-cleaned on a normal run
#   ASK  regenerable but expensive or sudo-backed; only on explicit selection
#   ASK! irreversible; only on explicit selection plus typed confirmation
# ==============================================================================

CAND_ID=()
CAND_TIER=()
CAND_LABEL=()
CAND_TOOL=()
CAND_METHOD=()
CAND_PATHS=()
CAND_CMD=()
CAND_NOTE=()
CAND_GUARD=()
CAND_SIZE_KB=()
VISIBLE_IDX=()
SEL_RESULT=()
SEL_SOURCE=()

add_cand() {
    CAND_ID+=("$1")
    CAND_TIER+=("$2")
    CAND_LABEL+=("$3")
    CAND_TOOL+=("$4")
    CAND_METHOD+=("$5")
    CAND_PATHS+=("$6")
    CAND_CMD+=("${7:-}")
    CAND_NOTE+=("${8:-}")
    CAND_GUARD+=("${9:-}")
}

# Expand a ';'-separated path spec into the paths that actually exist.
# IFS is pinned to ';' so paths containing spaces survive word splitting.
cand_paths() {
    local spec="$1" p
    local IFS=';'
    for p in $spec; do
        [ -z "$p" ] && continue
        if [ -e "$p" ]; then
            printf '%s\n' "$p"
        fi
    done
}

cand_size_kb() {
    local i="$1" total=0 p
    if [ "${CAND_METHOD[$i]}" = "tmp-old" ]; then
        find /tmp -mindepth 1 -maxdepth 1 -mtime +7 ! -name 'systemd-private*' \
            -exec du -sk {} + 2>/dev/null | awk '{s+=$1} END {print s+0}'
        return 0
    fi
    if [ "${CAND_METHOD[$i]}" = "old-files" ]; then
        local old_total=0 n
        while IFS= read -r p; do
            n=$(find "$p" -mindepth 1 -maxdepth 1 -type f -mtime +60 \
                -exec du -sk {} + 2>/dev/null | awk '{s+=$1} END {print s+0}')
            old_total=$(( old_total + n ))
        done < <(cand_paths "${CAND_PATHS[$i]}")
        echo "$old_total"
        return 0
    fi
    while IFS= read -r p; do
        total=$(( total + $(get_dir_size_kb "$p") ))
    done < <(cand_paths "${CAND_PATHS[$i]}")
    echo "$total"
}

catalog_index_of() {
    local id="$1" i
    for i in "${!CAND_ID[@]}"; do
        if [ "${CAND_ID[$i]}" = "$id" ]; then
            echo "$i"
            return 0
        fi
    done
    return 1
}

catalog_build() {
    # ---- Arch & local package helpers (AUR) ----
    add_cand pkg-yay           T1   "yay AUR build cache"          aur      purge "$HOME/.cache/yay"           "" "Re-cloned and rebuilt on the next AUR operation"
    add_cand pkg-shelly        T1   "Shelly AUR extraction cache"  aur      purge "$HOME/.cache/Shelly"        "" "Re-downloaded on the next Shelly build"
    add_cand pkg-paru          T1   "paru AUR clone cache"         aur      purge "$HOME/.cache/paru"          "" "Re-cloned on the next paru build"

    # ---- Desktop index, thumbnail, font, theme caches ----
    add_cand desktop-tracker   T1   "tracker3 file index"          desktop  cmd   "$HOME/.cache/tracker3"       "tracker3 reset --hard >/dev/null 2>&1 || rm -rf \"\$HOME/.cache/tracker3\"/* 2>/dev/null" "Indexer rebuilds in the background"
    add_cand desktop-thumbs    T1   "freedesktop thumbnails"       desktop  purge "$HOME/.cache/thumbnails;$HOME/.cache/quickshell-img-thumbs" "" "Regenerated as files are browsed"
    add_cand desktop-quickshell T1  "quickshell UI cache"          desktop  purge "$HOME/.cache/quickshell"    "" "Regenerated by the shell UI"
    add_cand desktop-fonts     T1   "fontconfig cache"             desktop  cmd   "$HOME/.cache/fontconfig"     "fc-cache -f >/dev/null 2>&1 || rm -rf \"\$HOME/.cache/fontconfig\"/* 2>/dev/null" "Rebuilt by fc-cache"
    add_cand desktop-appstream T1   "AppStream metadata"           desktop  purge "$HOME/.cache/appstream"      "" "Re-fetched on the next app-listing refresh"
    add_cand desktop-gstreamer T1   "GStreamer registry"           desktop  purge "$HOME/.cache/gstreamer-1.0"   "" "Rebuilt on next media playback"
    add_cand desktop-kcache    T1   "KDE .kcache files"            desktop  purge "$HOME/.cache/*.kcache"      "" "Rewritten by KDE components on demand"
    add_cand desktop-kpackage  T1   "KDE package handler cache"    desktop  purge "$HOME/.cache/kpackage-knshandler" "" "Regenerated when a package is opened"
    add_cand desktop-settings  T1   "System Settings cache"        desktop  purge "$HOME/.cache/systemsettings" "" "Regenerated on next launch"
    add_cand desktop-flatpak   T1   "Flatpak repo metadata"        desktop  purge "$HOME/.cache/flatpak"        "" "Re-fetched via flatpak update"
    add_cand desktop-shaders   T1   "GPU shader caches"            shaders  purge "$HOME/.cache/mesa_shader_cache;$HOME/.cache/radv_builtin_shaders;$HOME/.cache/nvidia" "" "Recompiled on first GPU workload"

    # ---- Browser-automation runtimes ----
    add_cand dev-playwright    T1   "Playwright browsers"          test     purge "$HOME/.cache/ms-playwright;$HOME/Library/Caches/ms-playwright" "" "Reinstall with: npx playwright install"
    add_cand dev-puppeteer     T1   "Puppeteer Chrome download"    test     purge "$HOME/.cache/puppeteer"      "" "Re-downloaded on next puppeteer install"

    # ---- Project scaffolding & build-side scratch ----
    add_cand dev-aria-template T1   "aria template scaffold"       aria-template purge "$HOME/.cache/aria-template" "" "Re-scaffolded on next template use"
    add_cand dev-pnpm-meta     T1   "pnpm metadata cache"          pnpm-meta purge "$HOME/.cache/pnpm"         "" "Re-fetched; content store handled by 'pnpm store prune'"
    add_cand dev-typescript    T1   "TypeScript server cache"      typescript purge "$HOME/.cache/typescript"  "" "Rebuilt on the next tsserver run"
    add_cand dev-mise          T1   "mise download cache"          mise     purge "$HOME/.cache/mise"           "" "Re-downloaded when a tool version is installed"
    add_cand dev-nvm-cache     T1   "nvm node tarball cache"       nvm      purge "$HOME/.nvm/.cache"           "" "Downloaded again on next 'nvm install'"
    add_cand dev-headless      T1   "headless Chrome profiles"     headless-chrome purge "$HOME/.cache/chromium-headless;$HOME/.cache/hyperframes" "" "Recreated on the next headless run"

    # ---- App extraction caches ----
    add_cand app-orca          T1   "orca AppImage extraction"     orca     purge "$HOME/.cache/orca/appimage"  "" "Re-extracted from the AppImage on next launch" "orca|Orca"
    add_cand app-ryoku-install T1   "ryoku shell install cache"    ryoku    purge "$HOME/.cache/ryoku-shell-install" "" "Re-cloned on the next ryoku update"

    # ---- Agent logs (not capability payloads) ----
    add_cand agent-logs        T1   "opencode log files"           opencode purge "$HOME/.local/share/opencode/log" "" "Session databases and skills are untouched"

    # ---- macOS ----
    add_cand mac-brew          T1   "Homebrew download cache"      brew     cmd   "$HOME/Library/Caches/Homebrew" "brew cleanup --prune=all >/dev/null 2>&1 || true" "Re-downloaded on next install"

    # ---- Confirmation-gated (ASK / ASK!) ----
    add_cand ask-trash         ASK! "Trash"                        trash    cmd   "$HOME/.local/share/Trash/files;$HOME/.local/share/Trash/info;$HOME/.Trash" "rm -rf \"\$HOME/.local/share/Trash/files\"/* \"\$HOME/.local/share/Trash/info\"/* \"\$HOME/.Trash\"/* 2>/dev/null || true" "PERMANENT — contents cannot be recovered"
    add_cand ask-downloads     ASK! "Downloads (files untouched 60+ days)" downloads old-files "$HOME/Downloads" "" "USER DATA — browse first; only regular files older than 60 days are removed"
    add_cand ask-pacman        ASK  "pacman package archives"      system   cmd   "/var/cache/pacman/pkg" "command -v paccache >/dev/null 2>&1 && sudo -n paccache -r -k3" "Keeps the 3 newest versions; needs sudo + pacman-contrib (else: sudo pacman -Sc)"
    add_cand ask-apt           ASK  "APT package archives"         system   cmd   "/var/cache/apt/archives" "sudo -n apt-get clean" "Re-downloaded when a package is reinstalled"
    add_cand ask-dnf           ASK  "DNF metadata cache"           system   cmd   "/var/cache/dnf;/var/cache/libdnf5" "sudo -n dnf clean all" "Re-fetched on the next dnf run"
    add_cand ask-journal       ASK  "systemd journal"              system   guide "" "" "Run: sudo journalctl --vacuum-size=100M"
    add_cand ask-tmp           ASK! "stale /tmp entries (>7 days)" tmp      tmp-old "/tmp" "" "Files older than 7 days; systemd-private dirs are kept"
    add_cand ask-rustup        ASK  "old rustup toolchains"        rust     guide "$HOME/.rustup/toolchains" "" "List: rustup toolchain list | Remove: rustup toolchain uninstall <name>"
    add_cand ask-nvm           ASK  "old nvm node versions"        nvm      guide "$HOME/.nvm/versions" "" "List: nvm ls | Remove: nvm uninstall <version>"
    add_cand ask-go-modcache   ASK  "Go module cache"              go       guide "$HOME/go/pkg/mod" "" "Run: go clean -modcache (re-downloads on next build)"
    add_cand ask-docker        ASK  "Docker images/build cache"    docker   guide "" "" "Inspect: docker system df | Prune: docker system prune [-a]"
    add_cand ask-flatpak       ASK  "unused Flatpak runtimes"      flatpak  guide "" "" "Run: flatpak uninstall --unused"
    add_cand ask-ryoku-store   ASK  "ryoku downloaded asset store" ryoku    purge "$HOME/.cache/ryoku/ryostore" "" "Re-downloaded by 'ryoku update'; clipboards and colors kept"
    add_cand ask-opencode-snap ASK  "opencode session snapshots"   opencode purge "$HOME/.local/share/opencode/snapshot" "" "Removes revert/undo history for past sessions"
    add_cand ask-token-sessions ASK "token-optimizer transcripts"  tokens   guide "$HOME/.local/share/token-optimizer/sessions" "" "Session transcripts; delete only if the history is not needed"
    add_cand ask-psd-backups   ASK  "profile-sync-daemon backups"  psd      guide "" "" "Stop psd first: ~/.config/*-backup* are live lowerdirs while it runs"
    add_cand ask-node-modules  ASK  "dormant node_modules"         projects guide "" "" "Audit first: clean-cache.sh --scan-node-modules ~/projects"
    add_cand ask-xcode-archives ASK "Xcode Archives"               xcode    purge "$HOME/Library/Developer/Xcode/Archives" "" "Needed to re-submit existing builds"
    add_cand ask-xcode-device  ASK  "iOS DeviceSupport"            xcode    purge "$HOME/Library/Developer/Xcode/iOS DeviceSupport" "" "Re-synced the next time a device is connected"
}

catalog_measure() {
    CAND_SIZE_KB=()
    local i
    for i in "${!CAND_ID[@]}"; do
        CAND_SIZE_KB+=("$(cand_size_kb "$i")")
    done
}

catalog_visible() {
    VISIBLE_IDX=()
    local i
    for i in "${!CAND_ID[@]}"; do
        if [ -n "$SPECIFIC_TOOLS" ] && ! is_tool_selected "${CAND_TOOL[$i]}"; then
            continue
        fi
        if [ "${CAND_SIZE_KB[$i]:-0}" -le 0 ] && [ "${CAND_METHOD[$i]}" != "guide" ]; then
            continue
        fi
        VISIBLE_IDX+=("$i")
    done
}

print_table_header() {
    local title="${1:-Clean System Cache}"
    echo "===================================================================="
    echo " 🧹 ${title} (${OS}) — ${MODE_LABEL}"
    echo "===================================================================="
    printf "%-32s | %-11s | %-10s | %-10s | %s\n" "Tool / Suite" "Status" "Before" "After" "Reclaimed"
    echo "--------------------------------------------------------------------"
}

print_catalog() {
    local num=1 i size tier paths_line note
    if [ "$JSON_OUT" = true ]; then
        local first=1
        printf '['
        for i in "${VISIBLE_IDX[@]}"; do
            size="${CAND_SIZE_KB[$i]}"
            [ "$first" -eq 1 ] || printf ','
            first=0
            paths_line=$(cand_paths "${CAND_PATHS[$i]}" | tr '\n' '|')
            paths_line="${paths_line%|}"
            printf '{"number":%d,"id":"%s","tier":"%s","label":"%s","tool":"%s","method":"%s","size_kb":%d,"paths":"%s","note":"%s"}' \
                "$num" "${CAND_ID[$i]}" "${CAND_TIER[$i]}" "${CAND_LABEL[$i]}" \
                "${CAND_TOOL[$i]}" "${CAND_METHOD[$i]}" "$size" "$paths_line" "${CAND_NOTE[$i]}"
            num=$((num + 1))
        done
        printf ']\n'
        return 0
    fi

    echo "===================================================================="
    echo " 🧾 Cache Candidate Catalog — ${OS}"
    echo "===================================================================="
    echo " T1 = auto-cleaned   ASK = needs selection   ASK! = irreversible"
    echo "--------------------------------------------------------------------"
    for i in "${VISIBLE_IDX[@]}"; do
        tier="${CAND_TIER[$i]}"
        size=$(fmt_kb "${CAND_SIZE_KB[$i]}")
        [ "${CAND_METHOD[$i]}" = "guide" ] && [ "${CAND_SIZE_KB[$i]}" -le 0 ] && size="n/a"
        printf ' %2d. %-11s %-5s %s\n' "$num" "$size" "$tier" "${CAND_LABEL[$i]}  [${CAND_ID[$i]}]"
        while IFS= read -r p; do
            printf '      └─ %s\n' "$p"
        done < <(cand_paths "${CAND_PATHS[$i]}")
        if [ -n "${CAND_NOTE[$i]}" ]; then
            printf '      %s\n' "${CAND_NOTE[$i]}"
        fi
        num=$((num + 1))
    done
    echo "--------------------------------------------------------------------"
    echo " Inspect before deleting : clean-cache.sh --browse <key|number>"
    echo " Delete a selection      : clean-cache.sh --only <key,..> --yes"
    echo " Choose interactively    : clean-cache.sh --interactive"
    echo " Scan for new caches     : clean-cache.sh --discover"
    echo "===================================================================="
}

browse_candidate() {
    local i="$1" depth="${2:-1}" p tmpf kb entry files children shown
    echo ""
    echo "--------------------------------------------------------------------"
    printf ' %s  [%s]  %s\n' "${CAND_ID[$i]}" "${CAND_TIER[$i]}" "${CAND_LABEL[$i]}"
    echo "--------------------------------------------------------------------"
    [ -n "${CAND_NOTE[$i]}" ] && printf ' Note   : %s\n' "${CAND_NOTE[$i]}"
    if [ "${CAND_METHOD[$i]}" = "guide" ] && [ -z "${CAND_PATHS[$i]}" ]; then
        printf ' Action : manual — nothing is deleted by this skill\n'
        echo "--------------------------------------------------------------------"
        return 0
    fi
    while IFS= read -r p; do
        browse_path_body "$p" "$depth"
    done < <(cand_paths "${CAND_PATHS[$i]}")
}

browse_path_body() {
    local p="$1" depth="${2:-1}" tmpf kb entry files children shown
    printf ' Path   : %s  (%s)\n' "$p" "$(fmt_kb "$(get_dir_size_kb "$p")")"
    if [ -f "$p" ]; then
        ls -lh "$p" 2>/dev/null | sed 's/^/   /'
        echo "--------------------------------------------------------------------"
        return 0
    fi
    files=$(find "$p" -type f 2>/dev/null | wc -l | tr -d ' ')
    children=$(find "$p" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')
    printf ' Files  : %s across %s top-level entries\n' "$files" "$children"
    echo " Contents (largest first):"
    tmpf=$(mktemp 2>/dev/null) || {
        echo "[clean-cache] mktemp failed; refusing to use a predictable temp path" >&2
        return 1
    }
    : > "$tmpf" 2>/dev/null || true
    if [ "$depth" -le 1 ]; then
        find "$p" -mindepth 1 -maxdepth 1 2>/dev/null | while IFS= read -r entry; do
            printf '%s\t%s\n' "$(get_dir_size_kb "$entry")" "$entry" >> "$tmpf"
        done
    else
        find "$p" -mindepth 1 -maxdepth "$depth" -type d 2>/dev/null | while IFS= read -r entry; do
            printf '%s\t%s\n' "$(get_dir_size_kb "$entry")" "$entry" >> "$tmpf"
        done
    fi
    shown=0
    while IFS=$'\t' read -r kb entry; do
        [ "$shown" -ge 25 ] && break
        printf '   %-10s %s\n' "$(fmt_kb "$kb")" "${entry#"$p"/}"
        shown=$((shown + 1))
    done < <(sort -rn "$tmpf" 2>/dev/null)
    if [ "$children" -gt 25 ] && [ "$depth" -le 1 ]; then
        printf '   … %s more entries (use --depth 2 for a deeper listing)\n' "$((children - 25))"
    fi
    rm -f "$tmpf" 2>/dev/null || true
    echo "--------------------------------------------------------------------"
}

browse_discovered() {
    local i="$1" depth="${2:-1}"
    echo ""
    echo "--------------------------------------------------------------------"
    printf ' %s  [%s]  %s\n' "${D_KEY[$i]}" "${D_TIER[$i]}" "${D_LABEL[$i]}"
    echo "--------------------------------------------------------------------"
    [ -n "${D_NOTE[$i]}" ] && printf ' Note   : %s\n' "${D_NOTE[$i]}"
    browse_path_body "${D_PATH[$i]}" "$depth"
}

run_cand_method() {
    local i="$1" p
    case "${CAND_METHOD[$i]}" in
        purge)
            while IFS= read -r p; do purge_dir_contents "$p"; done < <(cand_paths "${CAND_PATHS[$i]}")
            ;;
        rm)
            while IFS= read -r p; do rm -rf "$p" 2>/dev/null || true; done < <(cand_paths "${CAND_PATHS[$i]}")
            ;;
        cmd)
            [ -z "${CAND_CMD[$i]}" ] && return 0
            # Catalog commands are static, but never allow dynamic substitution
            # or newline injection through the string.
            case "${CAND_CMD[$i]}" in
                *$'\n'*|*$'\r'*|*'`'*|*'$('*|*'${'*)
                    echo "[clean-cache] refusing unsafe catalog command for ${CAND_KEY[$i]}" >&2
                    return 1
                    ;;
            esac
            bash -c "${CAND_CMD[$i]}" </dev/null >/dev/null 2>&1 || return 1
            ;;
        tmp-old)
            find /tmp -mindepth 1 -maxdepth 1 -mtime +7 ! -name 'systemd-private*' \
                -exec rm -rf {} + 2>/dev/null || true
            ;;
        old-files)
            while IFS= read -r p; do
                find "$p" -mindepth 1 -maxdepth 1 -type f -mtime +60 -delete 2>/dev/null || true
            done < <(cand_paths "${CAND_PATHS[$i]}")
            ;;
        *) : ;;
    esac
    return 0
}

cand_guard_running() {
    local g old_ifs="$IFS"
    IFS='|'
    for g in $1; do
        if is_any_process_running "$g"; then
            IFS="$old_ifs"
            printf '%s\n' "$g"
            return 0
        fi
    done
    IFS="$old_ifs"
    return 1
}

run_catalog_one() {
    local i="$1" before after reclaimed
    before="${CAND_SIZE_KB[$i]}"
    if [ -z "$before" ] || [ "$before" -lt 0 ] 2>/dev/null; then before=0; fi
    if [ "$before" -eq 0 ]; then before=$(cand_size_kb "$i"); fi

    if [ "${CAND_METHOD[$i]}" = "guide" ]; then
        record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "manual" "$before" "$before" 0 "${CAND_NOTE[$i]}"
        return 0
    fi

    if [ -n "${CAND_GUARD[$i]}" ]; then
        local running
        if running=$(cand_guard_running "${CAND_GUARD[$i]}"); then
            record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "skipped" "$before" "$before" 0 "$running is running; close it to prune this cache"
            return 0
        fi
    fi

    if [ "$DRY_RUN" = true ]; then
        record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "reclaimable" "$before" 0 "$before" "${CAND_NOTE[$i]}"
        return 0
    fi

    case "${CAND_CMD[$i]}" in
        *sudo*)
            if ! sudo -n true 2>/dev/null; then
                record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "needs-sudo" "$before" "$before" 0 "Run manually: ${CAND_CMD[$i]}"
                return 0
            fi
            ;;
    esac

    if ! run_cand_method "$i"; then
        record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "failed" "$before" "$before" 0 "Command failed; run manually: ${CAND_CMD[$i]}"
        return 0
    fi
    after=$(cand_size_kb "$i")
    reclaimed=$(( before > after ? before - after : 0 ))
    record_result "${CAND_LABEL[$i]} [${CAND_TIER[$i]}]" "cleaned" "$before" "$after" "$reclaimed" "${CAND_NOTE[$i]}"
    return 0
}

# ==============================================================================
# 8. Discovery, learning, and the action list
#
# "Safe to delete" is decided by scope, not by guessing at names:
#   * a directory directly under $XDG_CACHE_HOME (~/.cache) is disposable by the
#     XDG spec, unless it is a catalog entry or a protected app (browsers, agent
#     runtimes, orca, ryoku) that holds more than cache
#   * app config dirs are touched only through exact cache names
#     (Cache, GPUCache, CachedData, Code Cache, ShaderCache, DawnCache)
#   * project build caches must be dormant (mtime older than DORMANT_DAYS)
# Everything else is reported, never auto-deleted.
#
# Learned decisions: $XDG_STATE_HOME/clean-system-cache/learned.conf
#   <key>\t<allow|deny>\t<epoch>
# A learned "allow" may promote a regenerable ASK item into the safe sweep.
# It can NEVER promote ASK! (Trash, Downloads, /tmp strays, Flatpak app caches):
# those always require an explicit selection and confirmation, every time.
# ==============================================================================

STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/clean-system-cache"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/clean-system-cache"
LEARN_FILE="$STATE_DIR/learned.conf"
CONFIG_FILE="$CONFIG_DIR/config.conf"
SCAN_FILE="$STATE_DIR/last-scan.tsv"

DORMANT_DAYS=14
MIN_SIZE_KB=1024
PROJECT_ROOTS="$HOME/projects:$HOME/Projects:$HOME/dev:$HOME/code:$HOME/src"

config_load() {
    [ -f "$CONFIG_FILE" ] || return 0
    local k v
    while IFS='=' read -r k v; do
        case "$k" in
            PROJECT_ROOTS) [ -n "$v" ] && PROJECT_ROOTS="$v" ;;
            DORMANT_DAYS)  [[ "$v" =~ ^[0-9]+$ ]] && DORMANT_DAYS="$v" ;;
            MIN_SIZE_KB)   [[ "$v" =~ ^[0-9]+$ ]] && MIN_SIZE_KB="$v" ;;
        esac
    done < "$CONFIG_FILE"
    return 0
}

config_save() {
    mkdir -p "$CONFIG_DIR" 2>/dev/null || true
    {
        echo "# clean-system-cache config (colon-separated roots)"
        echo "PROJECT_ROOTS=$PROJECT_ROOTS"
        echo "DORMANT_DAYS=$DORMANT_DAYS"
        echo "MIN_SIZE_KB=$MIN_SIZE_KB"
    } > "$CONFIG_FILE" 2>/dev/null || true
}

L_KEY=()
L_DEC=()

learn_load() {
    L_KEY=()
    L_DEC=()
    [ -f "$LEARN_FILE" ] || return 0
    local k d ts
    while IFS=$'\t' read -r k d ts; do
        case "$k" in ""|"#"*) continue ;; esac
        case "$d" in
            allow|deny) L_KEY+=("$k"); L_DEC+=("$d") ;;
        esac
    done < "$LEARN_FILE"
    return 0
}

learn_get() {
    local key="$1" i
    for i in "${!L_KEY[@]}"; do
        if [ "${L_KEY[$i]}" = "$key" ]; then
            printf '%s\n' "${L_DEC[$i]}"
            return 0
        fi
    done
    printf '\n'
    return 0
}

# Tier of a catalog key (empty for discovered or unknown keys).
learn_key_tier() {
    local idx
    if idx=$(catalog_index_of "$1"); then
        printf '%s\n' "${CAND_TIER[$idx]}"
        return 0
    fi
    return 1
}

learn_save() {
    mkdir -p "$STATE_DIR" 2>/dev/null || true
    local i now
    now=$(date +%s 2>/dev/null || echo 0)
    {
        echo "# clean-system-cache learned decisions — key<TAB>allow|deny<TAB>epoch"
        for i in "${!L_KEY[@]}"; do
            printf '%s\t%s\t%s\n' "${L_KEY[$i]}" "${L_DEC[$i]}" "$now"
        done
    } > "$LEARN_FILE" 2>/dev/null || true
}

learn_set() {
    local key="$1" dec="$2" i found=0
    for i in "${!L_KEY[@]}"; do
        if [ "${L_KEY[$i]}" = "$key" ]; then
            L_DEC[$i]="$dec"
            found=1
        fi
    done
    if [ "$found" -eq 0 ]; then
        L_KEY+=("$key")
        L_DEC+=("$dec")
    fi
    learn_save
}

learn_forget() {
    local key="$1" i
    local nk=() nd=()
    for i in "${!L_KEY[@]}"; do
        [ "${L_KEY[$i]}" = "$key" ] && continue
        nk+=("${L_KEY[$i]}")
        nd+=("${L_DEC[$i]}")
    done
    L_KEY=("${nk[@]}")
    L_DEC=("${nd[@]}")
    learn_save
}

print_learned() {
    if [ "${#L_KEY[@]}" -eq 0 ]; then
        echo "No learned decisions yet ($LEARN_FILE)."
        return 0
    fi
    echo "===================================================================="
    echo " 🧠 Learned decisions — $LEARN_FILE"
    echo "===================================================================="
    local i
    for i in "${!L_KEY[@]}"; do
        printf ' %-7s %s\n' "${L_DEC[$i]}" "${L_KEY[$i]}"
    done
    echo "===================================================================="
    echo " allow = included automatically when regenerable | deny = never offered"
    echo " Trash, Downloads, /tmp strays and Flatpak app caches are always ASK!."
}

# ------------------------------------------------------------------------------
# Discovery
# ------------------------------------------------------------------------------

D_KEY=()
D_LABEL=()
D_SCOPE=()
D_PATH=()
D_SIZE=()
D_TIER=()
D_NOTE=()
D_CLEANED=()

disc_add() {
    local key="$1" label="$2" scope="$3" path="$4" size="$5" tier="$6" note="$7"
    if [ -z "$size" ] || [ "$size" -le 0 ]; then
        return 0
    fi
    if [ "$size" -lt "$MIN_SIZE_KB" ] && [ "$tier" != "ASK!" ]; then
        return 0
    fi
    D_KEY+=("$key")
    D_LABEL+=("$label")
    D_SCOPE+=("$scope")
    D_PATH+=("$path")
    D_SIZE+=("$size")
    D_TIER+=("$tier")
    D_NOTE+=("$note")
}

disc_index_of() {
    local key="$1" i
    for i in "${!D_KEY[@]}"; do
        if [ "${D_KEY[$i]}" = "$key" ]; then
            echo "$i"
            return 0
        fi
    done
    return 1
}

# Apps are protected when the directory holds state beyond cache: browser
# profiles, agent capability caches, and app stores whose contents are curated.
DISCOVERY_PROTECTED=" mozilla zen chromium google-chrome BraveSoftware microsoft-edge vivaldi thunderbird ryoku orca opencode claude gemini antigravity continue codex mcp lsp "
DISC_SKIP=" "

build_discovery_skip() {
    DISC_SKIP="$DISCOVERY_PROTECTED"
    local i p rel name
    for i in "${!CAND_ID[@]}"; do
        while IFS= read -r p; do
            case "$p" in
                "$HOME/.cache/"*)
                    rel="${p#"$HOME/.cache/"}"
                    name="${rel%%/*}"
                    case "$name" in
                        *[\*\?\[]*) continue ;;
                        "") continue ;;
                    esac
                    DISC_SKIP="$DISC_SKIP$name "
                    ;;
            esac
        done < <(cand_paths "${CAND_PATHS[$i]}")
    done
}

discover_system_cache() {
    local d name size
    for d in "$HOME/.cache"/*; do
        [ -d "$d" ] || continue
        name=$(basename "$d")
        case "$DISC_SKIP" in *" $name "*) continue ;; esac
        size=$(get_dir_size_kb "$d")
        disc_add "app:$name" "$name cache" "app" "$d" "$size" "SAFE" "XDG cache dir; $name regenerates it on next use"
    done
}

discover_config_cache() {
    local d rel key base
    [ -d "$HOME/.config" ] || return 0
    while IFS= read -r d; do
        [ -d "$d" ] || continue
        rel="${d#"$HOME/.config/"}"
        # profile-sync-daemon and orca keep their live lowerdirs in *-backup*
        # and *-ovfs* directories; those are never safe to touch.
        case "$rel" in
            *backup*|*ovfs*|*psd*) continue ;;
        esac
        key="cfg:$(printf '%s' "$rel" | tr '/' ':')"
        disc_add "$key" "$rel" "app" "$d" "$(get_dir_size_kb "$d")" "SAFE" "Editor/app cache dir; safe to purge"
    done < <(find "$HOME/.config" -maxdepth 3 -type d \
        \( -name "Cache" -o -name "GPUCache" -o -name "CachedData" -o -name "Code Cache" \
           -o -name "ShaderCache" -o -name "DawnCache" -o -name "GrShaderCache" -o -name "Crashpad" \) \
        2>/dev/null)
}

discover_flatpak_cache() {
    local d app
    [ -d "$HOME/.var/app" ] || return 0
    for d in "$HOME/.var/app"/*/cache; do
        [ -d "$d" ] || continue
        app=$(basename "$(dirname "$d")")
        disc_add "flatpak:$app" "$app cache" "app" "$d" "$(get_dir_size_kb "$d")" "ASK" "Per-app HTTP cache; close the app before purging"
    done
}

discover_projects() {
    local root d size label
    local old_ifs="$IFS"
    IFS=':'
    for root in $PROJECT_ROOTS; do
        IFS="$old_ifs"
        [ -n "$root" ] || continue
        [ -d "$root" ] || continue
        while IFS= read -r d; do
            [ -d "$d" ] || continue
            if [ -z "$(find "$d" -maxdepth 0 -mtime +"$DORMANT_DAYS" 2>/dev/null)" ]; then
                continue
            fi
            size=$(get_dir_size_kb "$d")
            label="${d#"$root"/}"
            disc_add "proj:$d" "$label" "project" "$d" "$size" "ASK" "Dormant ${DORMANT_DAYS}+ days; rebuilt on next build/run"
        done < <(find "$root" -maxdepth 5 \
            \( -name .git -o -name .venv -o -name venv -o -name target -o -name vendor \
               -o -name dist -o -name build -o -name .cache \) -prune -o \
            -type d \( -name .next -o -name .nuxt -o -name .svelte-kit -o -name .turbo \
               -o -name .parcel-cache -o -name .pytest_cache -o -name __pycache__ \
               -o -name .mypy_cache -o -name .ruff_cache -o -name .nyc_output \
               -o -name coverage -o -name .angular -o -name node_modules/.cache \
               -o -name node_modules/.vite \) -print 2>/dev/null)
        IFS=':'
    done
    IFS="$old_ifs"
    return 0
}

disc_sort() {
    local tmp i sz
    tmp=$(mktemp 2>/dev/null) || {
        echo "[clean-cache] mktemp failed; refusing to use a predictable temp path" >&2
        return 1
    }
    : > "$tmp" 2>/dev/null || true
    for i in "${!D_KEY[@]}"; do
        printf '%s\t%s\n' "${D_SIZE[$i]}" "$i" >> "$tmp"
    done
    local nk=() nl=() ns=() np=() nz=() nt=() nn=()
    while IFS=$'\t' read -r sz i; do
        [ -n "${D_KEY[$i]:-}" ] || continue
        nk+=("${D_KEY[$i]}")
        nl+=("${D_LABEL[$i]}")
        ns+=("${D_SCOPE[$i]}")
        np+=("${D_PATH[$i]}")
        nz+=("${D_SIZE[$i]}")
        nt+=("${D_TIER[$i]}")
        nn+=("${D_NOTE[$i]}")
    done < <(sort -rn "$tmp" 2>/dev/null)
    D_KEY=("${nk[@]}")
    D_LABEL=("${nl[@]}")
    D_SCOPE=("${ns[@]}")
    D_PATH=("${np[@]}")
    D_SIZE=("${nz[@]}")
    D_TIER=("${nt[@]}")
    D_NOTE=("${nn[@]}")
    rm -f "$tmp" 2>/dev/null || true
}

discover_all() {
    D_KEY=(); D_LABEL=(); D_SCOPE=(); D_PATH=(); D_SIZE=(); D_TIER=(); D_NOTE=(); D_CLEANED=()
    build_discovery_skip
    discover_system_cache
    discover_config_cache
    discover_flatpak_cache
    discover_projects
    disc_sort
    write_scan_state
}

write_scan_state() {
    mkdir -p "$STATE_DIR" 2>/dev/null || true
    local i
    {
        echo "# key<TAB>scope<TAB>tier<TAB>path (refreshed by --discover)"
        for i in "${!D_KEY[@]}"; do
            printf '%s\t%s\t%s\t%s\n' "${D_KEY[$i]}" "${D_SCOPE[$i]}" "${D_TIER[$i]}" "${D_PATH[$i]}"
        done
    } > "$SCAN_FILE" 2>/dev/null || true
}

disc_auto_clean() {
    local i key tier dec before after reclaimed=0 count=0 app
    for i in "${!D_KEY[@]}"; do
        key="${D_KEY[$i]}"
        tier="${D_TIER[$i]}"
        dec=$(learn_get "$key")
        if [ "$tier" = "SAFE" ]; then
            [ "$dec" = "deny" ] && continue
        elif [ "$tier" = "ASK" ] && [ "$dec" = "allow" ]; then
            :
        else
            continue
        fi
        # A Flatpak app cache is only safe while the app is closed.
        case "$key" in
            flatpak:*)
                app="${key#flatpak:}"
                if command -v flatpak >/dev/null 2>&1 && \
                   flatpak ps --columns=application 2>/dev/null | grep -qx "$app"; then
                    record_result "${D_LABEL[$i]} [${D_TIER[$i]}]" "skipped" "${D_SIZE[$i]}" "${D_SIZE[$i]}" 0 "$app is running; close it to prune this cache"
                    continue
                fi
                ;;
        esac
        before="${D_SIZE[$i]}"
        if [ "$DRY_RUN" = true ]; then
            record_result "${D_LABEL[$i]} [${D_TIER[$i]}]" "reclaimable" "$before" 0 "$before" "$key"
        else
            purge_dir_contents "${D_PATH[$i]}"
            after=$(get_dir_size_kb "${D_PATH[$i]}")
            reclaimed=$(( before > after ? before - after : 0 ))
            record_result "${D_LABEL[$i]} [${D_TIER[$i]}]" "cleaned" "$before" "$after" "$reclaimed" "$key"
            D_CLEANED[$i]=1
        fi
        count=$(( count + 1 ))
    done
    return 0
}

print_discovery() {
    local i n=0
    echo "===================================================================="
    echo " 🔍 Discovery — ${OS}"
    echo "===================================================================="
    echo " Scope rule: XDG cache dirs, exact editor/app cache dirs, and dormant"
    echo " project build caches. Browsers, agent runtimes, Trash, Downloads and"
    echo " data folders are never auto-cleaned."
    echo "--------------------------------------------------------------------"
    if [ "${#D_KEY[@]}" -eq 0 ]; then
        echo " Nothing new found outside the known catalog."
        echo "===================================================================="
        return 0
    fi
    local scope title hidden=0
    for scope in system app project; do
        local printed=0
        for i in "${!D_KEY[@]}"; do
            [ "${D_SCOPE[$i]}" = "$scope" ] || continue
            if [ "${D_CLEANED[$i]:-0}" = "1" ]; then
                continue
            fi
            if [ "$(learn_get "${D_KEY[$i]}")" = "deny" ]; then
                hidden=$(( hidden + 1 ))
                continue
            fi
            if [ "$printed" -eq 0 ]; then
                title=$(scope_title "$scope")
                printf '\n ── %s ──────────────────────────────────────────\n' "$title"
                printed=1
            fi
            n=$(( n + 1 ))
            printf ' %2d. %-11s %-5s %s\n' "$n" "$(fmt_kb "${D_SIZE[$i]}")" "${D_TIER[$i]}" "${D_LABEL[$i]}"
            printf '       %s\n' "${D_PATH[$i]}"
            printf '       key: %s\n' "${D_KEY[$i]}"
        done
    done
    echo "--------------------------------------------------------------------"
    if [ "$hidden" -gt 0 ]; then
        echo " ${hidden} item(s) hidden by your learned choices (see --learned, undo with"
        echo " --learn forget <key>)."
    fi
    echo " Safe (SAFE) items are cleaned on a normal run; ASK items only by selection."
    echo " Browse: clean-cache.sh --browse <key>   Apply: clean-cache.sh --only <key,..> --yes"
    echo "===================================================================="
}

# ------------------------------------------------------------------------------
# Action list — the single numbered menu shared by --discover, -i and --only
# ------------------------------------------------------------------------------

ACT_KEY=()
ACT_LABEL=()
ACT_TIER=()
ACT_SIZE=()
ACT_SCOPE=()
ACT_SRC=()
ACT_REF=()
ACT_PATH=()
ACT_NOTE=()
ACT_KIND=()

act_add() {
    ACT_KEY+=("$1")
    ACT_LABEL+=("$2")
    ACT_TIER+=("$3")
    ACT_SIZE+=("$4")
    ACT_SCOPE+=("$5")
    ACT_SRC+=("$6")
    ACT_REF+=("$7")
    ACT_PATH+=("$8")
    ACT_NOTE+=("$9")
}

act_index_of() {
    local key="$1" i
    for i in "${!ACT_KEY[@]}"; do
        if [ "${ACT_KEY[$i]}" = "$key" ]; then
            echo "$i"
            return 0
        fi
    done
    return 1
}

# Group the menu by scope (system → apps → projects) without losing the
# size ordering inside each group, so printed numbers match selection numbers.
actions_sort() {
    local scope i
    local nk=() nl=() nt=() nz=() ns=() nsrc=() nr=() np=() nn=()
    for scope in system app project; do
        for i in "${!ACT_KEY[@]}"; do
            [ "${ACT_SCOPE[$i]}" = "$scope" ] || continue
            nk+=("${ACT_KEY[$i]}")
            nl+=("${ACT_LABEL[$i]}")
            nt+=("${ACT_TIER[$i]}")
            nz+=("${ACT_SIZE[$i]}")
            ns+=("${ACT_SCOPE[$i]}")
            nsrc+=("${ACT_SRC[$i]}")
            nr+=("${ACT_REF[$i]}")
            np+=("${ACT_PATH[$i]}")
            nn+=("${ACT_NOTE[$i]}")
        done
    done
    ACT_KEY=("${nk[@]}")
    ACT_LABEL=("${nl[@]}")
    ACT_TIER=("${nt[@]}")
    ACT_SIZE=("${nz[@]}")
    ACT_SCOPE=("${ns[@]}")
    ACT_SRC=("${nsrc[@]}")
    ACT_REF=("${nr[@]}")
    ACT_PATH=("${np[@]}")
    ACT_NOTE=("${nn[@]}")
}

# mode: ask (approval items only) | all (also include T1/Safe, for --only lookups)
actions_build() {
    local mode="$1" i
    ACT_KEY=(); ACT_LABEL=(); ACT_TIER=(); ACT_SIZE=(); ACT_SCOPE=(); ACT_SRC=(); ACT_REF=(); ACT_PATH=(); ACT_NOTE=()
    for i in "${!CAND_ID[@]}"; do
        if [ "${CAND_SIZE_KB[$i]:-0}" -le 0 ] && [ "${CAND_METHOD[$i]}" != "guide" ]; then
            continue
        fi
        if [ "$mode" = "ask" ] && [ "${CAND_TIER[$i]}" = "T1" ]; then
            continue
        fi
        [ "$(learn_get "${CAND_ID[$i]}")" = "deny" ] && continue
        act_add "${CAND_ID[$i]}" "${CAND_LABEL[$i]}" "${CAND_TIER[$i]}" "${CAND_SIZE_KB[$i]}" "system" "cat" "$i" "$(cand_paths "${CAND_PATHS[$i]}" | head -1)" "${CAND_NOTE[$i]}"
    done
    for i in "${!D_KEY[@]}"; do
        if [ "$mode" = "ask" ] && [ "${D_TIER[$i]}" = "SAFE" ]; then
            continue
        fi
        if [ "${D_CLEANED[$i]:-0}" = "1" ]; then
            continue
        fi
        [ "$(learn_get "${D_KEY[$i]}")" = "deny" ] && continue
        act_add "${D_KEY[$i]}" "${D_LABEL[$i]}" "${D_TIER[$i]}" "${D_SIZE[$i]}" "${D_SCOPE[$i]}" "disc" "$i" "${D_PATH[$i]}" "${D_NOTE[$i]}"
    done
    actions_sort
}

run_action() {
    local a="$1" ref tier key
    ref="${ACT_REF[$a]}"
    tier="${ACT_TIER[$a]}"
    key="${ACT_KEY[$a]}"
    if [ "${ACT_SRC[$a]}" = "cat" ]; then
        run_catalog_one "$ref"
    else
        local before after reclaimed
        before="${D_SIZE[$ref]}"
        if [ "$DRY_RUN" = true ]; then
            record_result "${ACT_LABEL[$a]} [$tier]" "reclaimable" "$before" 0 "$before" "$key"
        else
            purge_dir_contents "${D_PATH[$ref]}"
            after=$(get_dir_size_kb "${D_PATH[$ref]}")
            reclaimed=$(( before > after ? before - after : 0 ))
            record_result "${ACT_LABEL[$a]} [$tier]" "cleaned" "$before" "$after" "$reclaimed" "$key"
        fi
    fi
    return 0
}



scope_title() {
    case "$1" in
        system)  printf 'System & packages' ;;
        app)     printf 'Applications' ;;
        project) printf 'Projects' ;;
        *)       printf '%s' "$1" ;;
    esac
}

print_selection_plan() {
    local a num=1 p dec
    echo ""
    echo "===================================================================="
    echo " 🗂  Plan — these paths will be affected"
    echo "===================================================================="
    for a in "$@"; do
        dec=$(learn_get "${ACT_KEY[$a]}")
        printf ' %d. [%s] %s  <%s> — %s' "$num" "${ACT_TIER[$a]}" "${ACT_LABEL[$a]}" "${ACT_KEY[$a]}" "$(fmt_kb "${ACT_SIZE[$a]}")"
        if [ -n "$dec" ]; then
            if [ "${ACT_TIER[$a]}" = "ASK!" ] && [ "$dec" = "allow" ]; then
                printf '  (learning ignored — always asks)'
            else
                printf '  (learned: %s)' "$dec"
            fi
        fi
        printf '\n'
        if [ "${ACT_SRC[$a]}" = "cat" ]; then
            while IFS= read -r p; do
                printf '      └─ %s\n' "$p"
            done < <(cand_paths "${CAND_PATHS[${ACT_REF[$a]}]}")
        else
            printf '      └─ %s\n' "${ACT_PATH[$a]}"
        fi
        [ -n "${ACT_NOTE[$a]}" ] && printf '      %s\n' "${ACT_NOTE[$a]}"
        num=$((num + 1))
    done
    echo "===================================================================="
}

# Loud, unmissable warning before anything irreversible is touched. The quiet
# per-row note in print_selection_plan is easy to scroll past; this is not.
print_irreversible_hazard() {
    local a found=0
    for a in "$@"; do
        [ "${ACT_TIER[$a]}" = "ASK!" ] || continue
        found=1
        break
    done
    [ "$found" -eq 1 ] || return 0
    echo ""
    echo " ####################################################################"
    echo " #                                                                  #"
    echo " #   !!!  WARNING: IRREVERSIBLE DATA LOSS  !!!                      #"
    echo " #                                                                  #"
    echo " ####################################################################"
    echo "   These selections are NOT caches. Deleting them CANNOT be undone:"
    for a in "$@"; do
        [ "${ACT_TIER[$a]}" = "ASK!" ] || continue
        printf '     - %s\n' "${ACT_LABEL[$a]}"
    done
    echo "   There is no Trash fallback, no restore point, and no undo."
    echo "   If you are unsure, answer no and re-run with --browse first."
    echo " ####################################################################"
    echo ""
}

selection_needs_confirmation() {
    local a
    for a in "$@"; do
        case "${ACT_TIER[$a]}" in
            ASK|ASK!) return 0 ;;
        esac
    done
    return 1
}

# ASK! is irreversible data loss. --yes is consent for ASK, not for ASK!:
# an irreversible selection additionally needs --confirm-irreversible or a
# typed "yes" in a real terminal.
selection_has_irreversible() {
    local a
    for a in "$@"; do
        [ "${ACT_TIER[$a]}" = "ASK!" ] && return 0
    done
    return 1
}

resolve_selection() {
    local input="$1" quiet="${2:-}" part a b k idx
    SEL_RESULT=()
    input="${input// /}"
    case "$input" in
        ""|none) return 0 ;;
        all) SEL_RESULT=("${SEL_SOURCE[@]}"); return 0 ;;
    esac
    local IFS=','
    for part in $input; do
        if [[ "$part" =~ ^[0-9]+-[0-9]+$ ]]; then
            a="${part%%-*}"
            b="${part##*-}"
            for ((k=a; k<=b; k++)); do
                [ -n "${SEL_SOURCE[$((k-1))]:-}" ] && SEL_RESULT+=("${SEL_SOURCE[$((k-1))]}")
            done
        elif [[ "$part" =~ ^[0-9]+$ ]]; then
            [ -n "${SEL_SOURCE[$((part-1))]:-}" ] && SEL_RESULT+=("${SEL_SOURCE[$((part-1))]}")
        else
            if idx=$(act_index_of "$part"); then
                SEL_RESULT+=("$idx")
            else
                if [ "$quiet" != "quiet" ]; then
                    if [ "$(learn_get "$part")" = "deny" ]; then
                        echo "$part is marked keep — undo with: --learn forget $part" >&2
                    else
                        echo "Unknown candidate key: $part" >&2
                    fi
                fi
                unset IFS
                return 1
            fi
        fi
    done
    unset IFS
    return 0
}

# Learn the outcome so the next run already knows. ASK! items are never learned:
# Trash, Downloads and other irreversible targets must be chosen every time.
learn_from_selection() {
    local a
    for a in "$@"; do
        case "${ACT_TIER[$a]}" in
            ASK) learn_set "${ACT_KEY[$a]}" allow ;;
        esac
    done
}

execute_selection() {
    local a
    [ "$#" -gt 0 ] || return 0
    print_selection_plan "$@"
    print_irreversible_hazard "$@"
    if selection_needs_confirmation "$@"; then
        if [ "$DRY_RUN" = true ]; then
            echo " Dry run: nothing will be deleted."
        elif selection_has_irreversible "$@"; then
            if [ "$CONFIRM_IRREVERSIBLE" = true ]; then
                echo " Irreversible selection explicitly confirmed with --confirm-irreversible."
            elif [ ! -t 0 ]; then
                echo " Refusing: this selection contains irreversible ASK! candidates." >&2
                echo " --yes is not enough here. Re-run with --confirm-irreversible after the user" >&2
                echo " has approved the exact paths and warning above." >&2
                return 1
            else
                local answer
                printf ' Type "yes" to permanently delete the irreversible selections: '
                read -r answer || true
                if [ "$answer" != "yes" ]; then
                    echo " Aborted — nothing was deleted."
                    return 1
                fi
            fi
        elif [ "$ASSUME_YES" != true ]; then
            if [ ! -t 0 ]; then
                echo " Refusing: this selection contains ASK candidates." >&2
                echo " Re-run with --yes after the user has approved the plan above." >&2
                return 1
            fi
            local answer
            printf ' Type "yes" to permanently delete the selected candidates: '
            read -r answer || true
            if [ "$answer" != "yes" ]; then
                echo " Aborted — nothing was deleted."
                return 1
            fi
        fi
    fi
    print_table_header "Selected Candidates"
    for a in "$@"; do
        run_action "$a"
    done
    if [ "$DRY_RUN" != true ]; then
        learn_from_selection "$@"
    fi
    echo "--------------------------------------------------------------------"
    if [ "$DRY_RUN" = true ]; then
        echo "Total Reclaimable Space : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
    else
        echo "Total Space Reclaimed   : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
    fi
    echo "Disk Free Space (Home)  : $(df -h "$HOME" | awk 'NR==2 {print $4}') available"
    echo "===================================================================="
}

print_action_list() {
    local i num=1 scope="" dec
    for i in "${!ACT_KEY[@]}"; do
        if [ "${ACT_SCOPE[$i]}" != "$scope" ]; then
            scope="${ACT_SCOPE[$i]}"
            printf ' ── %s ──\n' "$(scope_title "$scope")"
        fi
        dec=$(learn_get "${ACT_KEY[$i]}")
        printf ' %2d. %-11s %-5s %s' "$num" "$(fmt_kb "${ACT_SIZE[$i]}")" "${ACT_TIER[$i]}" "${ACT_LABEL[$i]}"
        if [ -n "$dec" ]; then
            if [ "${ACT_TIER[$i]}" = "ASK!" ] && [ "$dec" = "allow" ]; then
                printf '  (learning ignored — always asks)'
            else
                printf '  (learned: %s)' "$dec"
            fi
        fi
        printf '\n'
        printf '       %s\n' "${ACT_PATH[$i]}"
        printf '       key: %s\n' "${ACT_KEY[$i]}"
        num=$((num + 1))
    done
}

browse_action() {
    local a="$1" i
    if [ "${ACT_SRC[$a]}" = "cat" ]; then
        browse_candidate "${ACT_REF[$a]}" "$BROWSE_DEPTH"
    else
        i="${ACT_REF[$a]}"
        browse_discovered "$i" "$BROWSE_DEPTH"
    fi
}

interactive_menu() {
    local sel n dec kept=()
    actions_build ask
    if [ "${#ACT_KEY[@]}" -eq 0 ]; then
        echo "No confirmation-gated candidates found — everything present is already auto-safe."
        return 0
    fi
    echo "===================================================================="
    echo " 🧹 What needs your decision — ${OS}"
    echo "===================================================================="
    print_action_list
    echo "--------------------------------------------------------------------"
    echo " Select: 1,3 | 1-3 | all | none | b <n> browse | k <n> always keep | q quit"
    echo " Selections are remembered: allowed items clean automatically next run."
    echo " Trash, Downloads, /tmp strays and Flatpak app caches always ask again."
    echo "--------------------------------------------------------------------"
    if [ ! -t 0 ]; then
        echo " Non-interactive shell: use --only <key,..> --yes after approval."
        echo "===================================================================="
        return 1
    fi
    while true; do
        printf ' Selection: '
        read -r sel || true
        case "$sel" in
            ""|q|quit) echo " Nothing selected."; return 0 ;;
            k\ *)
                SEL_SOURCE=()
                for n in "${!ACT_KEY[@]}"; do SEL_SOURCE+=("$n"); done
                if resolve_selection "${sel#k }"; then
                    for n in "${SEL_RESULT[@]}"; do
                        learn_set "${ACT_KEY[$n]}" deny
                        printf ' Kept: %s (will not be suggested again)\n' "${ACT_KEY[$n]}"
                    done
                fi
                echo ""
                print_action_list
                echo "--------------------------------------------------------------------"
                continue
                ;;
            b\ *)
                n="${sel#b }"
                if [[ "$n" =~ ^[0-9]+$ ]] && [ -n "${ACT_KEY[$((n-1))]:-}" ]; then
                    browse_action "$((n-1))"
                else
                    echo " Unknown entry: $n"
                fi
                continue
                ;;
        esac
        SEL_SOURCE=()
        for n in "${!ACT_KEY[@]}"; do SEL_SOURCE+=("$n"); done
        if resolve_selection "$sel"; then
            break
        fi
    done
    echo "===================================================================="
    execute_selection "${SEL_RESULT[@]}"
}


config_load
if [ -n "$PROJECT_ROOTS_OVERRIDE" ]; then
    PROJECT_ROOTS="$PROJECT_ROOTS_OVERRIDE"
    config_save
fi
if [ -n "$DORMANT_OVERRIDE" ]; then
    DORMANT_DAYS="$DORMANT_OVERRIDE"
    config_save
fi
if [ -n "$MIN_SIZE_OVERRIDE" ]; then
    MIN_SIZE_KB=$(( MIN_SIZE_OVERRIDE * 1024 ))
    config_save
fi
learn_load
catalog_build
catalog_measure
catalog_visible

if [ -n "$LEARN_ACTION" ]; then
    if [ -z "$LEARN_KEYS" ]; then
        echo "Usage: --learn <allow|deny|forget> <key,key>" >&2
        exit 1
    fi
    if [ "$LEARN_KEYS" = "all" ] && [ "$LEARN_ACTION" = "forget" ]; then
        L_KEY=()
        L_DEC=()
        learn_save
        echo "Cleared all learned decisions."
        exit 0
    fi
    IFS_SAVE="$IFS"
    IFS=','
    for k in $LEARN_KEYS; do
        case "$LEARN_ACTION" in
            allow)
                if [ "$(learn_key_tier "$k")" = "ASK!" ]; then
                    printf ' %s is irreversible — it always asks; no decision recorded.\n' "$k"
                    continue
                fi
                learn_set "$k" allow
                printf ' Learned: %s = allow\n' "$k"
                ;;
            deny)
                learn_set "$k" deny
                printf ' Learned: %s = deny\n' "$k"
                ;;
            forget)
                learn_forget "$k"
                printf ' Forgotten: %s\n' "$k"
                ;;
            *)
                echo "Unknown --learn action: $LEARN_ACTION (allow|deny|forget)" >&2
                exit 1
                ;;
        esac
    done
    IFS="$IFS_SAVE"
    exit 0
fi

if [ "$SHOW_LEARNED" = true ]; then
    print_learned
    exit 0
fi

if [ "$LIST_ONLY" = true ]; then
    print_catalog
    exit 0
fi

if [ -n "$BROWSE_TARGET" ]; then
    if [ "$BROWSE_TARGET" = "all" ]; then
        for i in "${VISIBLE_IDX[@]}"; do
            browse_candidate "$i" "$BROWSE_DEPTH"
        done
        exit 0
    fi
    if [[ "$BROWSE_TARGET" =~ ^[0-9]+$ ]]; then
        idx="${VISIBLE_IDX[$((BROWSE_TARGET-1))]:-}"
        if [ -z "$idx" ]; then
            echo "Unknown candidate number: $BROWSE_TARGET. Run --list to see ids." >&2
            exit 1
        fi
        browse_candidate "$idx" "$BROWSE_DEPTH"
        exit 0
    fi
    if idx=$(catalog_index_of "$BROWSE_TARGET"); then
        browse_candidate "$idx" "$BROWSE_DEPTH"
        exit 0
    fi
    discover_all
    if idx=$(disc_index_of "$BROWSE_TARGET"); then
        browse_discovered "$idx" "$BROWSE_DEPTH"
        exit 0
    fi
    echo "Unknown candidate: $BROWSE_TARGET. Run --list or --discover to see keys." >&2
    exit 1
fi

if [ -n "$ONLY_SELECTION" ]; then
    actions_build all
    SEL_SOURCE=()
    for i in "${!ACT_KEY[@]}"; do SEL_SOURCE+=("$i"); done
    if ! resolve_selection "$ONLY_SELECTION" quiet; then
        discover_all
        actions_build all
        SEL_SOURCE=()
        for i in "${!ACT_KEY[@]}"; do SEL_SOURCE+=("$i"); done
        resolve_selection "$ONLY_SELECTION" || exit 1
    fi
    if [ "${#SEL_RESULT[@]}" -eq 0 ]; then
        echo "No valid candidates in selection: $ONLY_SELECTION" >&2
        exit 1
    fi
    execute_selection "${SEL_RESULT[@]}" || exit 1
    exit 0
fi

if [ "$INTERACTIVE" = true ]; then
    discover_all
    interactive_menu || exit 1
    exit 0
fi

if [ "$DISCOVER_ONLY" = true ]; then
    discover_all
    if [ "$CLEAN_SAFE" = true ]; then
        print_table_header "Discovery — safe caches"
        disc_auto_clean
    fi
    print_discovery
    exit 0
fi

# ==============================================================================
# Standard safe sweep. T1 catalog entries and discovered SAFE caches are
# cleaned; everything else is reported for an explicit decision.
# ==============================================================================

print_table_header "Clean System Cache"

discover_all
disc_auto_clean

handle_coupled_agent_cache() {
    local tool_id="$1"
    local label="$2"
    local cache_dir="$3"
    local what_removed="$4"
    local reinstalls="$5"
    local network_req="$6"
    local restart_req="$7"
    local restore_cmd="$8"
    shift 8
    local proc_candidates=("$@")

    if ! is_tool_selected "$tool_id"; then
        return
    fi
    [ -z "$cache_dir" ] || [ ! -d "$cache_dir" ] && return

    local size_before
    size_before=$(get_dir_size_kb "$cache_dir")
    [ "$size_before" -le 0 ] && return

    # T2 Capability-Coupled: PRESERVED BY DEFAULT
    if [ "$INCLUDE_COUPLED" != true ]; then
        T2_PRESERVED_COUNT=$(( T2_PRESERVED_COUNT + 1 ))
        record_result "$label" "preserved" "$size_before" "$size_before" 0 "T2 Capability-coupled: Preserved by default (pass --include-coupled to override)"
        return
    fi

    # Explicit opt-in (--include-coupled): Enforce running session protection
    if is_any_process_running "${proc_candidates[@]}"; then
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "running" "$size_before" 0 "$size_before" "Agent runtime running; reclaimable when process exits"
        else
            record_result "$label" "skipped" "$size_before" "$size_before" 0 "Active runtime session running; skipped to protect live capabilities"
        fi
    else
        if [ "$DRY_RUN" = true ]; then
            record_result "$label" "reclaimable" "$size_before" 0 "$size_before" "Would purge T2 cache (rehydration manifest below)"
            PURGED_T2_LIST+=("$label|$cache_dir|$what_removed|$reinstalls|$network_req|$restart_req|$restore_cmd")
        else
            purge_dir_contents "$cache_dir"
            local size_after
            size_after=$(get_dir_size_kb "$cache_dir")
            local reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
            record_result "$label" "cleaned" "$size_before" "$size_after" "$reclaimed" "T2 capability cache purged (rehydration required)"
            PURGED_T2_LIST+=("$label|$cache_dir|$what_removed|$reinstalls|$network_req|$restart_req|$restore_cmd")
        fi
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
# 5. Desktop, local-package & runtime scratch caches (T1, catalog-driven)
# These are regenerated by the owning tool on next use; ASK candidates are
# deliberately excluded here and only run through --only / --interactive.
# ------------------------------------------------------------------------------
for cand_i in "${VISIBLE_IDX[@]}"; do
    if [ "${CAND_TIER[$cand_i]}" = "T1" ]; then
        run_catalog_one "$cand_i"
    fi
done

# ------------------------------------------------------------------------------
# 6. Agent Runtimes & Toolchains (T2 Capability-Coupled & T1 Regenerable)
# Invariants:
# - Three-Tier Classification:
#   * T1 Regenerable: Pure download/build artifacts (models metadata cache, temp zips).
#   * T2 Capability-Coupled: Installed plugins, skills, MCP servers, LSPs. PRESERVED BY DEFAULT.
#   * T3 Irreplaceable: Auth tokens, session DBs, memory, git repos. NEVER TOUCHED.
# - Active Runtime Protection: If agent runtime is running, caches are treated
#   as live referenced and skipped in execution mode.
# - Rehydration Manifest: Any T2 purge emits deterministic restoration steps.
# ------------------------------------------------------------------------------

# OpenCode: packages (T2)
opencode_pkg="$HOME/.cache/opencode/packages"
[ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/opencode/packages" ] && opencode_pkg="$HOME/Library/Caches/opencode/packages"
handle_coupled_agent_cache "opencode" "opencode (packages) [T2]" "$opencode_pkg" \
    "Installed plugin packages & git repositories" \
    "Automatically on next command execution" \
    "YES (requires npm / git network access)" \
    "YES (takes effect on next session start)" \
    "opencode (or relaunch agent session)" \
    "opencode" "open-code"

# OpenCode: npm (T2)
opencode_npm="$HOME/.cache/opencode/npm"
[ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/opencode/npm" ] && opencode_npm="$HOME/Library/Caches/opencode/npm"
handle_coupled_agent_cache "opencode" "opencode (npm) [T2]" "$opencode_npm" \
    "OpenCode plugin npm tarballs & node_modules payloads" \
    "Automatically on next plugin fetch" \
    "YES (downloads from registry.npmjs.org)" \
    "NO" \
    "opencode" \
    "opencode" "open-code"

# OpenCode: skills (T2)
opencode_skills="$HOME/.cache/opencode/skills"
[ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/opencode/skills" ] && opencode_skills="$HOME/Library/Caches/opencode/skills"
handle_coupled_agent_cache "opencode" "opencode (skills) [T2]" "$opencode_skills" \
    "Cached remote skill payloads" \
    "Automatically on next skill call" \
    "YES (downloads remote skills)" \
    "NO" \
    "opencode" \
    "opencode" "open-code"

# OpenCode: bin / LSP (T2)
opencode_bin="$HOME/.cache/opencode/bin"
[ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/opencode/bin" ] && opencode_bin="$HOME/Library/Caches/opencode/bin"
handle_coupled_agent_cache "opencode" "opencode (bin) [T2]" "$opencode_bin" \
    "Language server binaries & tool executables" \
    "Automatically on LSP/tool invocation" \
    "YES (downloads language server binaries)" \
    "YES" \
    "opencode" \
    "opencode" "open-code"

# OpenCode: models.json (T1 Regenerable metadata)
if is_tool_selected "opencode"; then
    opencode_models="$HOME/.cache/opencode/models.json"
    [ "$OS" = "Darwin" ] && [ -f "$HOME/Library/Caches/opencode/models.json" ] && opencode_models="$HOME/Library/Caches/opencode/models.json"
    if [ -f "$opencode_models" ]; then
        size_before=$(get_dir_size_kb "$opencode_models")
        if [ "$size_before" -gt 0 ]; then
            if is_any_process_running "opencode" "open-code"; then
                if [ "$DRY_RUN" = true ]; then
                    record_result "opencode (models) [T1]" "running" "$size_before" 0 "$size_before" "opencode is running; reclaimable when closed"
                else
                    record_result "opencode (models) [T1]" "skipped" "$size_before" "$size_before" 0 "Running session protected; close opencode to prune"
                fi
            else
                if [ "$DRY_RUN" = true ]; then
                    record_result "opencode (models) [T1]" "reclaimable" "$size_before" 0 "$size_before" "Would delete regenerable models metadata"
                else
                    rm -f "$opencode_models" 2>/dev/null || true
                    size_after=$(get_dir_size_kb "$opencode_models")
                    reclaimed=$(( size_before > size_after ? size_before - size_after : 0 ))
                    record_result "opencode (models) [T1]" "cleaned" "$size_before" "$size_after" "$reclaimed" "Models metadata cache pruned"
                fi
            fi
        fi
    fi
fi

# Claude Code (T2)
claude_cache="$HOME/.cache/claude"
[ "$OS" = "Darwin" ] && [ -d "$HOME/Library/Caches/claude" ] && claude_cache="$HOME/Library/Caches/claude"
handle_coupled_agent_cache "claude" "claude (cache) [T2]" "$claude_cache" \
    "Language server binaries & tool downloads" \
    "Automatically on tool/LSP launch" \
    "YES (downloads tool dependencies)" \
    "YES" \
    "claude (restarts LSP on next file touch)" \
    "claude" "claude-code"

claude_runtime="$HOME/.claude/cache"
handle_coupled_agent_cache "claude" "claude (runtime) [T2]" "$claude_runtime" \
    "Temporary agent runtime cache" \
    "Automatically on next session" \
    "NO" \
    "YES" \
    "claude" \
    "claude" "claude-code"

# Gemini CLI / Antigravity (T2)
gemini_cache="$HOME/.cache/gemini"
handle_coupled_agent_cache "gemini" "gemini (cache) [T2]" "$gemini_cache" \
    "MCP schemas & downloaded tool dependencies" \
    "Automatically on MCP tool initialization" \
    "YES" \
    "YES" \
    "agy (or relaunch Antigravity)" \
    "gemini" "antigravity"

antigravity_cache="$HOME/.cache/antigravity"
handle_coupled_agent_cache "gemini" "antigravity (cache) [T2]" "$antigravity_cache" \
    "Antigravity CLI tool schemas & scratch caches" \
    "Automatically on next session" \
    "NO" \
    "YES" \
    "antigravity" \
    "gemini" "antigravity"

# Continue (T2)
continue_cache="$HOME/.continue/cache"
[ ! -d "$continue_cache" ] && [ -d "$HOME/.cache/continue" ] && continue_cache="$HOME/.cache/continue"
handle_coupled_agent_cache "continue" "continue (cache) [T2]" "$continue_cache" \
    "Codebase indices & cached model context" \
    "Rebuilt on next indexing run" \
    "NO" \
    "YES" \
    "Reload Continue in IDE" \
    "continue"

# Codex (T2)
codex_cache="$HOME/.cache/codex"
handle_coupled_agent_cache "codex" "codex (cache) [T2]" "$codex_cache" \
    "Downloaded tools & runtime cache" \
    "Automatically on invocation" \
    "YES" \
    "YES" \
    "codex" \
    "codex"

# MCP Server Shared Caches (T2)
mcp_cache="$HOME/.cache/mcp"
[ ! -d "$mcp_cache" ] && [ -d "$HOME/.cache/modelcontextprotocol" ] && mcp_cache="$HOME/.cache/modelcontextprotocol"
handle_coupled_agent_cache "mcp" "mcp (servers) [T2]" "$mcp_cache" \
    "MCP server installs and runtime environments" \
    "Rebuilt on next MCP server spawn" \
    "YES (reinstalls MCP server packages)" \
    "YES" \
    "Restart MCP client / host" \
    "opencode" "claude" "cursor" "code" "gemini" "antigravity"

# LSP Language Server Shared Caches (T2)
lsp_cache="$HOME/.cache/lsp"
[ ! -d "$lsp_cache" ] && [ -d "$HOME/.cache/language-servers" ] && lsp_cache="$HOME/.cache/language-servers"
handle_coupled_agent_cache "lsp" "lsp (servers) [T2]" "$lsp_cache" \
    "Language server symbol caches & binaries" \
    "Re-indexed on file open" \
    "NO" \
    "YES" \
    "Restart language server or IDE" \
    "cursor" "code" "opencode" "claude"

# ------------------------------------------------------------------------------
# 6. Web Browsers (HTTP Disk Cache ONLY — Zero Cookies/Session Impact)
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

CAP_AFTER=$(snapshot_agent_capabilities)

if [ "$INCLUDE_COUPLED" = false ] && [ "$DRY_RUN" = false ]; then
    if [ "$CAP_AFTER" -lt "$CAP_BEFORE" ]; then
        echo "" >&2
        echo "====================================================================" >&2
        echo " 🚨 FATAL ERROR: Capability Inventory Regression Detected!" >&2
        echo "====================================================================" >&2
        echo " Live agent capability count dropped from $CAP_BEFORE to $CAP_AFTER" >&2
        echo " during default safe cache cleaning." >&2
        echo " T2 capability caches must NEVER be dropped without --include-coupled." >&2
        echo "====================================================================" >&2
        exit 1
    fi
fi

echo "--------------------------------------------------------------------"
if [ "$DRY_RUN" = true ]; then
    echo "Total Reclaimable Space : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
else
    echo "Total Space Reclaimed   : ~$(fmt_kb "$TOTAL_RECLAIMED_KB")"
fi
free_disk=$(df -h "$HOME" | awk 'NR==2 {print $4}')
echo "Disk Free Space (Home)  : ${free_disk} available"
if [ "$T2_PRESERVED_COUNT" -gt 0 ]; then
    echo "T2 Capability Caches    : ${T2_PRESERVED_COUNT} preserved (safe default; pass --include-coupled to override)"
fi
if [ "$INCLUDE_COUPLED" = false ]; then
    echo "Capability Inventory    : PASS (${CAP_BEFORE} capability items verified intact)"
else
    diff_lost=$(( CAP_BEFORE > CAP_AFTER ? CAP_BEFORE - CAP_AFTER : 0 ))
    echo "Capability Inventory    : ${diff_lost} capability items unlinked (rehydration required)"
fi
echo "===================================================================="

# Confirmation-gated and discovered candidates are never touched by the safe
# sweep. Surface them with measured sizes and exact paths, grouped by scope.
actions_build ask
ask_count="${#ACT_KEY[@]}"
ask_total_kb=0
for i in "${!ACT_SIZE[@]}"; do
    ask_total_kb=$(( ask_total_kb + ACT_SIZE[i] ))
done
if [ "$ask_count" -gt 0 ]; then
    echo ""
    echo "===================================================================="
    echo " 🔎 ${ask_count} item(s) need your decision — ~$(fmt_kb "$ask_total_kb") extra"
    echo "===================================================================="
    print_action_list
    echo "--------------------------------------------------------------------"
    echo " Browse : clean-cache.sh --browse <key>"
    echo " Choose : clean-cache.sh --interactive    (decisions are remembered)"
    echo " Apply  : clean-cache.sh --only <key,..> --yes"
    echo "===================================================================="
fi

if [ "${#PURGED_T2_LIST[@]}" -gt 0 ]; then
    echo ""
    echo "===================================================================="
    if [ "$DRY_RUN" = true ]; then
        echo " 📋 REHYDRATION MANIFEST (Preview — Rehydration Impact if Executed)"
    else
        echo " 📋 REHYDRATION MANIFEST (T2 Capability-Coupled Caches Purged)"
    fi
    echo "===================================================================="
    echo "The following capability-coupled caches were targeted under explicit opt-in."
    echo "Restore and rehydration requirements are detailed below:"
    echo "--------------------------------------------------------------------"
    for entry in "${PURGED_T2_LIST[@]}"; do
        IFS='|' read -r m_label m_path m_removed m_reinstalls m_net m_restart m_cmd <<< "$entry"
        echo "• $m_label ($m_path)"
        echo "    Removed           : $m_removed"
        echo "    Reinstalls        : $m_reinstalls"
        echo "    Network Required  : $m_net"
        echo "    Restart Required  : $m_restart"
        echo "    Restore Command   : $m_cmd"
        echo ""
    done
    echo "===================================================================="
fi

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
