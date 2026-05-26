# GitHub 접속 우회 설정

이 환경에서는 방화벽 또는 네트워크 정책 때문에 `github.com:443` 기본 연결이 실패할 수 있다. Claude Code와 Codex가 GitHub 원격 저장소에 접속할 때는 전역 Git 설정의 `http.curloptResolve` 값을 우선 사용한다.

## 현재 권장 설정

```bash
git config --global http.curloptResolve github.com:443:140.82.112.3
```

## 확인 명령

```bash
git config --global --get http.curloptResolve
git ls-remote origin HEAD
```

## 장애 시 복구 절차

기존 IP가 막히면 후보 IP의 443 포트를 확인한다.

```powershell
Test-NetConnection 140.82.112.3 -Port 443
Test-NetConnection 140.82.113.3 -Port 443
Test-NetConnection 140.82.114.3 -Port 443
```

`TcpTestSucceeded : True`인 IP를 찾으면 전역 Git 설정을 갱신한다.

```bash
git config --global http.curloptResolve github.com:443:<열려있는-IP>
git ls-remote origin HEAD
```

## 2026-05-20 확인 기록

- 실패 IP: `140.82.112.4`.
- 성공 IP: `140.82.112.3`, `140.82.113.3`, `140.82.114.3`.
- 적용값: `github.com:443:140.82.112.3`.
- 검증: `git ls-remote origin HEAD` 성공.
