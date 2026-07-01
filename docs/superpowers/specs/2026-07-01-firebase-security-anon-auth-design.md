# Firebase 보안 규칙 잠금 + 익명 인증 (설계)

- 날짜: 2026-07-01
- 배경: Firebase가 `onething-7f4d7-default-rtdb`의 보안 규칙이 공개(`.read/.write = true`)라 "누구나 읽고 쓸 수 있음"을 경고. 운영 비용·데이터 도용/삭제 위험.

## 현재 구조
- Firebase 정식 인증(Auth) 미사용. 자체 로그인: **이름 + 4자리 PIN** (`users/<id> = {name, pin, createdAt}`).
- 데이터: `notes/user_<id>`(노트), `users/<id>`(사용자·PIN 평문), `requests/<id>`(요청 메시지).
- 규칙이 정식 Auth를 이해하므로, 자체 로그인만으로는 규칙을 `auth != null`로 잠글 수 없음(앱이 못 읽음).

## 선택한 방향: 익명 인증 + 규칙 잠금
사용자 선택(2026-07-01): "익명 인증 + 규칙 잠그기 (추천)". 이름+PIN 로그인 UX는 그대로 유지.

### 앱 변경
1. `firebase-auth-compat.js` 스크립트 추가.
2. 앱 시작 시 로컬 데이터로 **먼저 렌더**(오프라인/인증 전에도 사용 가능) → 뒤에서 `signInAnonymously()`.
3. 익명 인증 성공(`onAuthStateChanged`에서 user 존재) 후에만 클라우드 연결:
   - `initMessaging()` (users/requests 리스너), `initSync()` (notes 리스너).
4. `initSync()`에 `cloudStarted` 가드 추가 — 인증 결과가 나오기 전 호출 시 skip, 인증 결과(성공/실패) 후 `startCloud()`에서 재호출.
5. 배포 순서 안전장치: 익명 로그인이 아직 안 켜졌거나 실패해도, **규칙이 열려 있는 동안엔** `startCloud()`로 폴백 연결 → 앱이 안 끊김. 익명 로그인을 켜면 다음 새로고침부터 자동 인증됨. 오프라인이면 기존처럼 **이 컴퓨터에만 저장**.

### 규칙 (database.rules.json)
```json
{ "rules": { ".read": "auth != null", ".write": "auth != null" } }
```

### 콘솔에서 사람이 할 일 (순서 중요)
1. Authentication → Sign-in method → **익명(Anonymous) 사용 설정** (먼저!).
2. 새 앱 배포 후 정상 동작 확인.
3. Realtime Database → 규칙에 위 JSON 붙여넣고 **게시**.
   - 규칙을 먼저 잠그면 익명 인증 설정 전까지 앱이 먹통이 되므로 순서 준수.

## 한계 (솔직히)
- Firebase 설정값이 공개 웹페이지 안에 있어, 마음먹으면 남도 자기 익명 세션 생성 가능 → "완벽한 개인별 잠금"은 아님. 가족/소규모용으로 충분한 수준 + 경고 해제 + 무단 봇 차단이 목표.

## 이번 범위에서 제외 (다음 단계 권장)
- **PIN 평문 저장** 개선(구조 분리/해시화 + 기존 PIN 이전). 이 보안 변경을 작고 안전하게 끝낸 뒤 별도로 진행.
