# discover-projects.ps1 — artifact discovery for clean-cache.cmd
#
# A directory name alone is not evidence. Distinctive names (.next, __pycache__,
# .turbo) stand alone; generic names (target, build, obj, bin, vendor, venv)
# additionally require the owning project's manifest, so a Maven target/ or a
# bin/ folder is never mistaken for a build cache. Dormancy uses the newest
# file, not the directory mtime, and risky locations are tagged for report-only.
#
# Modes:
#   (default)  print one "<mb>|<path>|<risk>|<age-days>|<kind>" line per artifact
#   -OutFile F write the same lines to F as ASCII (findstr cannot match UTF-16LE)
#   -Claim P   exit 0 when P is still the same dormant artifact, else exit 1

param(
    [string]$Roots = "",
    [int]$DormantDays = 14,
    [string]$Claim = "",
    [string]$OutFile = "",
    [int]$Depth = 5
)

$ErrorActionPreference = "SilentlyContinue"

function Test-Artifact([string]$Path, [string]$Name) {
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $null }
    # A junction or symlink is not the artifact; it may point anywhere.
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { return $null }
    $parent = Split-Path -Parent $Path
    switch -Regex ($Name) {
        '^node_modules$' { return "node" }
        '^(\.venv|venv|\.virtualenv)$' {
            if (Test-Path -LiteralPath (Join-Path $Path "pyvenv.cfg")) { return "python" }
            return $null
        }
        '^target$' {
            if ((Test-Path -LiteralPath (Join-Path $parent "Cargo.toml")) -or
                (Test-Path -LiteralPath (Join-Path $Path "CACHEDIR.TAG"))) { return "rust" }
            return $null
        }
        '^vendor$' {
            if (Test-Path -LiteralPath (Join-Path $parent "go.mod")) { return "go-vendor" }
            return $null
        }
        '^(obj|bin)$' {
            if (Get-ChildItem -LiteralPath $parent -Filter *.csproj -File -ErrorAction SilentlyContinue) {
                return "dotnet"
            }
            return $null
        }
        '^build$' {
            if ((Test-Path -LiteralPath (Join-Path $Path "CMakeCache.txt")) -or
                (Test-Path -LiteralPath (Join-Path $parent "pubspec.yaml"))) { return "build" }
            return $null
        }
        '^\.next$' { return "next" }
        '^\.nuxt$' { return "nuxt" }
        '^\.svelte-kit$' { return "svelte" }
        '^\.turbo$' { return "turbo" }
        '^\.parcel-cache$' { return "parcel" }
        '^\.pytest_cache$' { return "pytest" }
        '^__pycache__$' { return "pycache" }
        '^\.mypy_cache$' { return "mypy" }
        '^\.ruff_cache$' { return "ruff" }
        '^\.nyc_output$' { return "nyc" }
        '^coverage$' { return "coverage" }
        '^\.angular$' { return "angular" }
        default { return $null }
    }
}

function Get-Risk([string]$Path) {
    $x = $Path.ToLower().Replace('\', '/')
    if ($x -match '/applications/[^/]+\.app/') { return "macOS .app bundle" }
    if ($x -match '/program files( \(x86\))?/') { return "Program Files" }
    if ($x -match '/appdata/roaming/') { return "Windows AppData Roaming" }
    if ($x -match '/appdata/local/') {
        if ($x -notmatch '/appdata/local/(\.cache|\.npm|\.pnpm)/') { return "Windows AppData Local" }
    }
    $uhome = $env:USERPROFILE
    if ($uhome) {
        $h = $uhome.ToLower().Replace('\', '/')
        if ($x.StartsWith($h + "/")) {
            $rel = $x.Substring($h.Length + 1)
            if ($rel -match '^\.config(/|$)') { return "user configuration (~/.config)" }
            if ($rel -match '^\.local/share(/|$)') { return "user data (~/.local/share)" }
            if ($rel -match '^\.cache(/|$)') { return "system cache (~/.cache)" }
            if ($rel -match '^\.[^/]+(/|$)') { return "hidden top-level folder" }
        }
    }
    return ""
}

function Measure-Artifact([string]$Path) {
    $files = @(Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue)
    $sum = 0
    $max = $null
    foreach ($file in $files) {
        $sum += $file.Length
        if ($null -eq $max -or $file.LastWriteTime -gt $max) { $max = $file.LastWriteTime }
    }
    if ($null -eq $max) {
        $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
        if ($item) { $max = $item.LastWriteTime }
    }
    return @{ Bytes = $sum; Newest = $max }
}

if ($Claim -ne "") {
    if (-not (Test-Path -LiteralPath $Claim -PathType Container)) { exit 1 }
    $item = Get-Item -LiteralPath $Claim -Force -ErrorAction SilentlyContinue
    if (-not $item) { exit 1 }
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { exit 1 }
    $kind = Test-Artifact $Claim $item.Name
    if (-not $kind) { exit 1 }
    $report = Measure-Artifact $Claim
    if ($null -ne $report.Newest -and $report.Newest -ge (Get-Date).AddDays(-$DormantDays)) { exit 1 }
    exit 0
}

$old = (Get-Date).AddDays(-$DormantDays)
$out = New-Object System.Collections.ArrayList

function Walk([string]$Dir, [int]$Level) {
    if ($Level -lt 0) { return }
    $item = Get-Item -LiteralPath $Dir -Force -ErrorAction SilentlyContinue
    if (-not $item) { return }
    # Never descend through a junction or symlink, even under another name.
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { return }
    $name = Split-Path -Leaf $Dir
    $kind = Test-Artifact $Dir $name
    if ($kind) {
        $report = Measure-Artifact $Dir
        if ($null -eq $report.Newest) { $report.Newest = (Get-Item -LiteralPath $Dir -Force).LastWriteTime }
        if ($report.Newest -lt $old) {
            $mb = [math]::Round($report.Bytes / 1MB)
            $age = [math]::Floor(((Get-Date) - $report.Newest).TotalDays)
            $risk = Get-Risk $Dir
            if (-not $risk) { $risk = "none" }
            [void]$script:out.Add(("{0}|{1}|{2}|{3}|{4}" -f $mb, $Dir, $risk, $age, $kind))
        }
        return
    }
    Get-ChildItem -LiteralPath $Dir -Directory -Force -ErrorAction SilentlyContinue |
        ForEach-Object { Walk $_.FullName ($Level - 1) }
}

foreach ($root in ($Roots -split ";")) {
    if ($root -and (Test-Path -LiteralPath $root -PathType Container)) { Walk $root $Depth }
}

if ($out.Count -eq 0) {
    "none"
} else {
    $out
}

if ($OutFile) {
    $lines = if ($out.Count -eq 0) { @("none") } else { $out }
    Set-Content -LiteralPath $OutFile -Value $lines -Encoding ASCII
}
