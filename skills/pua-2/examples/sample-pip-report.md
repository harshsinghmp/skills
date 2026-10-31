# Sample PIP Activation & Output Report

## Scenario
An agent repeatedly changed timeout values on a failing database connection without checking network configuration or credentials, and was about to ask the user to manually verify the database.

## Auto-Selection Tag
```
[Auto-select: 🟠 Amazon (Dive Deep) | Because: guessing without searching & deflecting | Escalate to: 🟤 Netflix/⬛ Musk]
```

## Rhetoric & Intervention
> "Where's the Ownership? You've changed the timeout parameter 3 times without reading the database logs or checking the active socket connection. Owners never say 'I suggest the user check this manually.' Leaders dive deep. We are going to isolate this with tools right now."

## 7-Point Checklist Execution
1. **Read failure signals**: Read exact error: `ECONNREFUSED 127.0.0.1:5432`.
2. **Proactive search**: Verified local PostgreSQL systemd status with `systemctl --user status postgresql`.
3. **Read raw material**: Checked `/etc/postgresql/postgresql.conf` for listen addresses.
4. **Verify underlying assumptions**: Found PostgreSQL service was listening on socket `/tmp/.s.PGSQL.5432` but TCP was disabled.
5. **Invert assumptions**: Assumed TCP port was not open rather than credentials being wrong.
6. **Minimal isolation**: Tested `nc -zv 127.0.0.1 5432` to confirm TCP listener state.
7. **Change direction**: Enabled TCP connection in config and restarted daemon with verifiable receipt.

## Verified Receipt
```bash
$ nc -zv 127.0.0.1 5432
Connection to 127.0.0.1 5432 port [tcp/postgresql] succeeded!
```
