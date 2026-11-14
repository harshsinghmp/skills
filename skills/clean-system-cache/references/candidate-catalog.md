# candidate-catalog — what each candidate owns and what it costs to delete

The script's registry is the source of truth. This file explains the entries so a
user (or an agent presenting a menu) can describe them without guessing.

List live entries with sizes before quoting any number:

```bash
clean-cache.sh --list          # human table, numbered
clean-cache.sh --list --json   # agent-parseable: id, tier, size_kb, paths
clean-cache.sh --browse <id>   # exact files/folders, largest first
```

## Tiers

| Tier | Meaning | When deleted |
|:---|:---|:---|
| `T1` | Regenerable on next tool use | Automatically on a normal run |
| `ASK` | Regenerable but expensive, or needs `sudo` | Only when selected via `--only` / `--interactive` |
| `ASK!` | Irreversible | Only when selected **and** confirmed |

`--browse` never deletes. `--only` without `--yes` refuses `ASK`/`ASK!` selections in
non-interactive shells, so an agent cannot silently destroy data.

## Linux / macOS

### Package helpers (`aur`)

| id | Path | Notes |
|:---|:---|:---|
| `pkg-yay` | `~/.cache/yay` | AUR clones and built packages; re-cloned on next build |
| `pkg-shelly` | `~/.cache/Shelly` | Shelly downloads/extractions |
| `pkg-paru` | `~/.cache/paru` | paru clone cache |

### Desktop index, thumbnails, fonts, themes (`desktop`)

| id | Path | Notes |
|:---|:---|:---|
| `desktop-tracker` | `~/.cache/tracker3` | File index; `tracker3 reset --hard`, reindexes in background |
| `desktop-thumbs` | `~/.cache/thumbnails`, `~/.cache/quickshell-img-thumbs` | Regenerated when files are viewed |
| `desktop-quickshell` | `~/.cache/quickshell` | Shell UI cache |
| `desktop-fonts` | `~/.cache/fontconfig` | `fc-cache -f` rebuild |
| `desktop-appstream` | `~/.cache/appstream` | App metadata |
| `desktop-gstreamer` | `~/.cache/gstreamer-1.0` | Plugin registry |
| `desktop-kcache` | `~/.cache/*.kcache` | KDE theme/kpackage caches |
| `desktop-kpackage` | `~/.cache/kpackage-knshandler` | Package handler cache |
| `desktop-settings` | `~/.cache/systemsettings` | Settings app cache |
| `desktop-flatpak` | `~/.cache/flatpak` | Repo metadata |
| `desktop-shaders` | `~/.cache/mesa_shader_cache`, `~/.cache/radv_builtin_shaders`, `~/.cache/nvidia` | GPU shaders; first run after purge is slower |

### Browser automation (`test`)

| id | Path | Notes |
|:---|:---|:---|
| `dev-playwright` | `~/.cache/ms-playwright`, `~/Library/Caches/ms-playwright` | `npx playwright install` restores |
| `dev-puppeteer` | `~/.cache/puppeteer` | Chrome download cache |

### Build-side scratch

| id | Path | Notes |
|:---|:---|:---|
| `dev-aria-template` | `~/.cache/aria-template` | Template scaffold including its `node_modules` |
| `dev-pnpm-meta` | `~/.cache/pnpm` | Metadata/tarballs; the store is separate (`pnpm store prune`) |
| `dev-typescript` | `~/.cache/typescript` | tsserver cache |
| `dev-mise` | `~/.cache/mise` | Tool download/build cache |
| `dev-nvm-cache` | `~/.nvm/.cache` | Node tarballs (`~/.nvm/versions` is separate) |
| `dev-headless` | `~/.cache/chromium-headless`, `~/.cache/hyperframes` | Headless Chrome profiles |

### App extraction caches

| id | Path | Notes |
|:---|:---|:---|
| `app-orca` | `~/.cache/orca/appimage` | Re-extracted from the AppImage; skipped while orca runs |
| `app-ryoku-install` | `~/.cache/ryoku-shell-install` | Git clone cache |

### Agent logs

| id | Path | Notes |
|:---|:---|:---|
| `agent-logs` | `~/.local/share/opencode/log` | Logs only; session DB, storage, and skills untouched |

### macOS

| id | Path | Notes |
|:---|:---|:---|
| `mac-brew` | `~/Library/Caches/Homebrew` | `brew cleanup --prune=all` |
| `ask-xcode-archives` | `~/Library/Developer/Xcode/Archives` | `ASK` — needed to re-submit existing builds |
| `ask-xcode-device` | `~/Library/Developer/Xcode/iOS DeviceSupport` | `ASK` — re-synced from device |

## Confirmation-gated candidates (both platforms)

| id | Path / action | Tier | Why it is gated |
|:---|:---|:---|:---|
| `ask-trash` | `~/.local/share/Trash`, `~/.Trash` | `ASK!` | Irreversible |
| `ask-pacman` | `/var/cache/pacman/pkg` | `ASK` | `paccache -r -k3` keeps 3 versions; needs sudo |
| `ask-apt` | `/var/cache/apt/archives` | `ASK` | `apt-get clean`; sudo |
| `ask-dnf` | `/var/cache/dnf`, `/var/cache/libdnf5` | `ASK` | `dnf clean all`; sudo |
| `ask-journal` | `journalctl --vacuum-size=100M` | `ASK` | Manual command |
| `ask-tmp` | `/tmp` entries older than 7 days | `ASK!` | Irreversible; `systemd-private*` skipped |
| `ask-rustup` | `~/.rustup/toolchains` | `ASK` | Manual `rustup toolchain uninstall` |
| `ask-nvm` | `~/.nvm/versions` | `ASK` | Manual `nvm uninstall` |
| `ask-go-modcache` | `~/go/pkg/mod` | `ASK` | `go clean -modcache` |
| `ask-docker` | Docker images/build cache | `ASK` | Manual `docker system prune` |
| `ask-flatpak` | Unused runtimes | `ASK` | Manual `flatpak uninstall --unused` |
| `ask-ryoku-store` | `~/.cache/ryoku/ryostore` | `ASK` | Re-downloaded by `ryoku update` |
| `ask-opencode-snap` | `~/.local/share/opencode/snapshot` | `ASK` | Removes revert/undo history |
| `ask-token-sessions` | `~/.local/share/token-optimizer/sessions` | `ASK` | Transcripts |
| `ask-psd-backups` | `~/.config/*-backup*` | `ASK` | Live lowerdirs while `psd` runs; stop it first |
| `ask-node-modules` | Dormant `node_modules` | `ASK` | Audit first with `--scan-node-modules` |

## Windows

| id | Path | Tier |
|:---|:---|:---|
| `win-playwright` | `%LOCALAPPDATA%\ms-playwright` | `T1` |
| `win-puppeteer` | `%USERPROFILE%\.cache\puppeteer` | `T1` |
| `win-yarn` | `%LOCALAPPDATA%\Yarn\Cache` | `T1` |
| `win-pip` | `%LOCALAPPDATA%\pip\Cache` | `T1` |
| `win-typescript` | `%LOCALAPPDATA%\Microsoft\TypeScript` | `T1` |
| `win-vscode-cache` / `-codedata` / `-gpu` / `-logs` | `%APPDATA%\Code\...` | `T1` |
| `win-cursor-cache` / `-codedata` | `%APPDATA%\Cursor\...` | `T1` |
| `win-crashdumps` | `%LOCALAPPDATA%\CrashDumps` | `T1` |
| `win-electron` | `%LOCALAPPDATA%\electron\Cache` | `T1` |
| `win-nuget` | `%LOCALAPPDATA%\NuGet\v3-cache` | `T1` |
| `win-temp` | `%LOCALAPPDATA%\Temp` | `ASK!` |
| `win-update` | `%SYSTEMROOT%\SoftwareDistribution\Download` | `ASK` |
| `win-thumbs` | `%LOCALAPPDATA%\Microsoft\Windows\Explorer` | `ASK` |
| `win-recyclebin` | Recycle Bin | `ASK!` |
| `win-docker` | Docker images/build cache | `ASK` |

## Presenting a menu

1. `clean-cache.sh --discover` (or `--discover --json` style parsing of `--list --json`).
2. Show each `ASK`/`ASK!` entry with its measured size and paths, grouped **per app**
   and **per project**.
3. For anything the user asks about, run `--browse <key>` and paste the listing.
4. Apply only the chosen keys: `--only <key,key> --yes`.
5. Never bundle `ASK!` entries into an "all safe" answer — call them out separately.

## Discovered keys

Discovery adds items the fixed catalog cannot know about. Keys are stable and are what
`--only`, `--browse`, and `--learn` accept:

| Key shape | Example | Scope | Tier |
|:---|:---|:---|:---|
| `app:<name>` | `app:mpv` | `~/.cache/<name>` | `SAFE` |
| `cfg:<rel>` | `cfg:obsidian:Cache` | `~/.config/<rel>` (cache dirs only) | `SAFE` |
| `flatpak:<app-id>` | `flatpak:org.mozilla.thunderbird` | `~/.var/app/<id>/cache` | `ASK` |
| `proj:<abs path>` | `proj:/home/me/shop/.next` | dormant project build cache | `ASK` |

Rules the discovery layer enforces:

- `~/.cache/<name>` is skipped when the name is a catalog entry or a protected app
  (browsers, agent runtimes, `orca`, `ryoku`).
- Config discovery matches only `Cache`, `GPUCache`, `CachedData`, `Code Cache`,
  `ShaderCache`, `DawnCache`, `GrShaderCache`, `Crashpad`, and never descends into
  `*-backup*` / `*-ovfs*` trees.
- Project discovery prunes `.git`, `.venv`, `venv`, `target`, `vendor`, `dist`, `build`,
  `.cache`, and requires an mtime older than `--dormant` days.
- Flatpak app caches are skipped while `flatpak ps` shows that app running.

## Learned decisions

Stored in `~/.local/state/clean-system-cache/learned.conf` as
`<key> TAB <allow|deny> TAB <epoch>`; config in `~/.config/clean-system-cache/config.conf`;
last scan in `~/.local/state/clean-system-cache/last-scan.tsv`.

```bash
clean-cache.sh --learned
clean-cache.sh --learn allow app:mpv
clean-cache.sh --learn deny  proj:/home/me/shop/.next
clean-cache.sh --learn forget proj:/home/me/shop/.next
clean-cache.sh --learn forget all
```

- `allow` on `ASK` → cleaned automatically on later runs while the item's conditions
  still hold (still dormant, app still closed).
- `deny` → hidden from `--discover` and the interactive menu; `--only` reports it as
  "marked keep".
- `ASK!` keys ignore `allow` entirely. Trash, Downloads, `/tmp` strays, and Flatpak app
  caches always ask again.
