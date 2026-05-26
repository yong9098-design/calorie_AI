# Codex Project Instructions

## GitHub Connection Bypass

This Windows environment can fail on the default `github.com:443` route because of firewall or network policy. Before using GitHub remotes, prefer the global Git `http.curloptResolve` bypass.

Current preferred setting:

```bash
git config --global http.curloptResolve github.com:443:140.82.112.3
```

Verify with:

```bash
git config --global --get http.curloptResolve
git ls-remote origin HEAD
```

If GitHub access fails, test candidate IPs with `Test-NetConnection <IP> -Port 443`, then update the global `http.curloptResolve` value. Known working candidates on 2026-05-20 were `140.82.112.3`, `140.82.113.3`, and `140.82.114.3`; `140.82.112.4` failed.
