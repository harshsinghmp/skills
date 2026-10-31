# Changelog

Notable changes to {{PROJECT_NAME}} are recorded here. Entries are maintained as part of each shipped change.

## [Unreleased]

### Added

- Release invariants now include **derived-artifact sync**: every version bump regenerates the repo's declared derived artifacts in the same commit, each artifact declared together with the command that regenerates it and the `--check` gate that fails CI on drift. Branch names in the git-workflow and landing-gate standards are scaffold placeholders (`{{integration_branch}}` / `{{production_branch}}`) rather than hardcoded names. Already-scaffolded projects adopt these changes on their next `updateagents` update pass.

### Changed

-

### Fixed

-
