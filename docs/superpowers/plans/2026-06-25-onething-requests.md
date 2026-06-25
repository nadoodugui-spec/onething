# 원씽 "요청 주고받기"(1:1 메신저) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 원씽 앱에 로그인(이름+4자리 PIN)과 사용자 간 "요청 주고받기"를 추가하되, 기존 할 일 노트·동기화 코드 기능은 건드리지 않는다.

**Architecture:** 단일 `index.html`에 모든 코드를 추가(기존 패턴 유지). 로그인은 요청 전용 "이름표"이고, 노트 동기화(`notes/<코드>`)와 **분리**된다. 요청 데이터는 Firebase의 `users/`·`requests/` 칸에 저장되며, 클라이언트는 그 두 노드를 구독해 로그인한 사용자 기준으로 화면을 그린다. UI는 `createElement`+`textContent`로 만들어 기존 렌더 방식·XSS 안전성을 따른다.

**Tech Stack:** Vanilla JS, Firebase Realtime DB(compat SDK, 이미 로드됨), 기존 i18n(`I18N`/`t()`/`data-i18n`).

## Global Constraints

- 모든 코드는 `C:\AI\OneThing\index.html` 한 파일 안에 추가한다(빌드 도구·외부 JS 파일 없음).
- 기존 노트 동기화(`notes/<동기화코드>`, `initSync`/`pushCloud`)와 `state` 구조는 **수정하지 않는다**(회귀 금지).
- 요청 데이터는 Firebase 루트의 `users/<userId>`, `requests/<reqId>`에만 저장한다.
- 새로 추가하는 모든 화면 문구는 `I18N`에 ko/en 둘 다 등록하고 `data-i18n*` 또는 `t()`로 출력한다.
- 사용자 입력(이름·요청 내용·답장)은 항상 `textContent`로 출력(절대 `innerHTML`에 끼워넣지 않음).
- PIN은 4자리 숫자 평문 저장(설계 합의됨). 민감정보 비저장 전제.
- Firebase 설정값(`FIREBASE_CONFIG`)은 파일에 이미 있음. 헬퍼 `cloudConfigured()`/`uid()`/`$id()`/`toast()`/`addTodo()`/`t()`/`fmtNice()`/`pad2()`/`dstr()`는 그대로 재사용한다.
- `Date.now()`/`new Date()`는 브라우저 앱 코드이므로 정상 사용(워크플로 스크립트 제약과 무관).

## Testing Approach (이 프로젝트의 현실)

이 저장소에는 자동 테스트 러너가 없다(단일 HTML 정적 배포). 따라서 각 Task는 **브라우저 수동 검증**으로 끝낸다 — 구체적 조작 + 기대 결과를 명시한다. 로컬에서 `index.html`을 더블클릭하거나 `file://`로 열어 확인한다(Firebase는 인터넷만 있으면 `file://`에서도 동작). 두 사용자 흐름은 **두 개의 브라우저 프로필/시크릿 창**으로 시뮬레이션한다(요청은 공용 Firebase에 있으므로 창 두 개면 충분). DevTools 콘솔/Application 탭으로 데이터도 확인한다.

> **로그인 상태 초기화:** DevTools → Application → Local Storage → `onething-user` 삭제 후 새로고침.
> **요청 데이터 확인:** DevTools 콘솔에 `requestsCache`, `usersCache` 입력.

## File Structure

| 파일 | 책임 | 변경 |
|------|------|------|
| `index.html` `<style>` | 로그인 게이트·요청 영역·배지·카드 스타일 | 추가(append before `</style>`) |
| `index.html` `<body>` 상단 | 로그인 게이트 오버레이, 상단바 칩/배지/보내기 버튼 | 추가 |
| `index.html` 모달 영역 | 요청 보내기 모달, 사용자 모달 | 추가(after `trashModal`) |
| `index.html` `.notebook` 아래 | 받은/보낸 요청 영역(`requestsZone`) | 추가 |
| `index.html` `<script>` `I18N` | 새 문구 ko/en | 추가 |
| `index.html` `<script>` 함수부 | 메시징 데이터·식별자·렌더·액션 함수 | 추가(sync 함수 뒤) |
| `index.html` `<script>` 이벤트부 | 새 버튼/모달 이벤트, `.tools` 분기, 초기화 호출 | 추가/수정 |

모든 삽입 위치는 아래 각 Task에서 **고유 문자열 앵커**로 지정한다(줄 번호는 코드가 늘면서 바뀌므로 앵커 문자열로 찾는다).

---

## Task 1: 메시징 데이터 토대 (식별자 + Firebase 구독)

화면 변화는 없고, 데이터 계층과 초기화만 만든다. 콘솔로 검증한다.

**Files:**
- Modify: `index.html` (script 함수부 — `openSync()` 함수 끝 `// ---------- daily reminder ----------` 주석 바로 위에 새 블록 삽입)
- Modify: `index.html` (script 초기화부 — `initSync();` 줄 아래)

**Interfaces (이후 Task가 사용):**
- 전역: `usersCache`(obj), `requestsCache`(obj), `currentUser`({id,name,...}|null), `msgDb`(firebase ref|null)
- `ensureFirebase(): db|null`
- `initMessaging(): void` — `users`/`requests` 구독 시작
- `resolveCurrentUser(): void` — 로컬 저장에서 `currentUser` 복원 후 `updateLoginGate()` 호출
- `findUserByName(name): {id,...}|null`
- `registerUser(name, pin): {ok, msg?}`
- `loginUser(id, pin): {ok, msg?}`
- `logoutUser(): void`
- `updateLoginGate(): void` — 누락 DOM은 `if(el)`로 건너뜀(이 Task에선 대부분 no-op)

- [ ] **Step 1: 메시징 JS 블록 삽입**

앵커: `// ---------- daily reminder ----------` (이 줄 **바로 위**에 아래 전체를 삽입)

```js
  // ===== 요청(메신저) — 노트와 분리된 별도 데이터 =====
  const USER_KEY = "onething-user";   // 이 기기에 기억되는 로그인: JSON {id,name}
  let usersCache = {};                 // { userId: {name, pin, createdAt} }
  let requestsCache = {};              // { reqId: {from, fromName, to, toName, text, ts, status, replies, hiddenFor} }
  let currentUser = null;             // { id, name, ... }
  let msgDb = null;                    // firebase database (messaging)

  function ensureFirebase() {
    if (!cloudConfigured()) return null;
    try { if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG); return firebase.database(); }
    catch (e) { return null; }
  }
  function initMessaging() {
    msgDb = ensureFirebase();
    if (!msgDb) { updateLoginGate(); return; }   // Firebase 미설정/오프라인 → 메시징 비활성
    msgDb.ref("users").on("value", (snap) => {
      usersCache = snap.val() || {};
      resolveCurrentUser(); renderLoginUsers();
    });
    msgDb.ref("requests").on("value", (snap) => {
      requestsCache = snap.val() || {};
      renderRequests(); renderUnreadBadge();
    });
  }

  function resolveCurrentUser() {
    let local = null;
    try { local = JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (_) {}
    if (local && local.id) currentUser = Object.assign({ id: local.id, name: local.name || "?" }, usersCache[local.id] || {});
    else currentUser = null;
    updateLoginGate();
  }
  function findUserByName(name) {
    name = (name || "").trim();
    for (const id in usersCache) if (((usersCache[id] || {}).name || "").trim() === name) return Object.assign({ id }, usersCache[id]);
    return null;
  }
  function registerUser(name, pin) {
    name = (name || "").trim(); pin = (pin || "").trim();
    if (!name) return { ok: false, msg: t("rq_need_name") };
    if (!/^\d{4}$/.test(pin)) return { ok: false, msg: t("rq_need_pin") };
    if (!msgDb) return { ok: false, msg: t("rq_offline") };
    if (findUserByName(name)) return { ok: false, msg: t("rq_dup_name") };
    const id = uid(); const rec = { name, pin, createdAt: Date.now() };
    msgDb.ref("users/" + id).set(rec);
    usersCache[id] = rec;                                   // 낙관적 반영
    localStorage.setItem(USER_KEY, JSON.stringify({ id, name }));
    resolveCurrentUser();
    return { ok: true };
  }
  function loginUser(id, pin) {
    const u = usersCache[id]; if (!u) return { ok: false, msg: t("rq_no_user") };
    if ((u.pin || "") !== (pin || "").trim()) return { ok: false, msg: t("rq_wrong_pin") };
    localStorage.setItem(USER_KEY, JSON.stringify({ id, name: u.name }));
    resolveCurrentUser();
    return { ok: true };
  }
  function logoutUser() { localStorage.removeItem(USER_KEY); currentUser = null; updateLoginGate(); }

  // 아래 4개는 Task 2/4에서 본문이 채워진다. Task 1 시점엔 안전한 no-op 스텁.
  function updateLoginGate() { /* Task 2에서 구현 */ }
  function renderLoginUsers() { /* Task 2에서 구현 */ }
  function renderRequests() { /* Task 4에서 구현 */ }
  function renderUnreadBadge() { /* Task 4에서 구현 */ }
```

> 주의: 같은 이름의 함수를 Task 2/4에서 "다시 선언"하면 안 된다. Task 2/4에서는 이 **스텁의 본문을 교체**한다(아래 각 Task에 교체 대상 명시).

- [ ] **Step 2: 임시 i18n 키 추가 (Task 1 검증용 메시지)**

앵커: `theme_toast: { ko: "테마: {0}", en: "Theme: {0}" }` (이 줄 끝에 콤마를 추가하고 그 아래에 삽입)

`theme_toast: ...` 줄을 다음으로 바꾼다:
```js
    theme_toast: { ko: "테마: {0}", en: "Theme: {0}" },
    rq_need_name: { ko: "이름을 입력하세요", en: "Enter a name" },
    rq_need_pin: { ko: "숫자 4자리를 입력하세요", en: "Enter a 4-digit PIN" },
    rq_offline: { ko: "인터넷 연결이 필요해요 (요청 기능)", en: "Internet required for requests" },
    rq_dup_name: { ko: "이미 있는 이름이에요 — 본인이면 목록에서 골라 로그인하세요", en: "Name taken — if it's you, pick it to log in" },
    rq_no_user: { ko: "사용자를 찾을 수 없어요", en: "User not found" },
    rq_wrong_pin: { ko: "비밀번호가 틀렸어요", en: "Wrong PIN" }
```
(나머지 요청 i18n 키는 Task 2/3/4에서 추가한다.)

- [ ] **Step 3: 초기화에서 메시징 시작**

앵커: `  initSync();` (이 줄 **아래**에 삽입)
```js
  resolveCurrentUser();
  initMessaging();
```

- [ ] **Step 4: 브라우저 검증 (콘솔)**

1. `index.html`을 브라우저로 연다(인터넷 연결 상태).
2. DevTools 콘솔에서: `registerUser("검증유저", "1234")` → `{ok: true}` 반환 확인.
3. 콘솔에서 `currentUser` → `{id, name: "검증유저", pin: "1234", ...}` 확인.
4. 콘솔에서 `usersCache` → `검증유저` 항목 존재 확인.
5. 새로고침 후 콘솔 `currentUser` → 여전히 `검증유저`(로컬 기억됨) 확인.
6. `registerUser("검증유저", "9999")` → `{ok:false, msg:"이미 있는 이름..."}` (중복 차단) 확인.
7. 정리: 콘솔에서 `msgDb.ref("users/" + currentUser.id).remove(); localStorage.removeItem("onething-user")` 실행 후 새로고침.

기대: 기존 할 일 앱은 평소와 동일하게 동작(아무 화면 변화 없음).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "요청 기능 1: 메시징 데이터 토대(식별자·Firebase 구독)"
```

---

## Task 2: 로그인 게이트 + 상단바(칩·배지·보내기 버튼)

첫 진입 시 사용자 선택/등록 화면을 띄우고, 로그인 상태를 상단바에 반영한다.

**Files:**
- Modify: `index.html` `<style>` (append before `</style>`)
- Modify: `index.html` `<body>` (여는 `<body ...>` 태그 바로 아래)
- Modify: `index.html` `.tools` (도구 버튼 묶음)
- Modify: `index.html` `I18N` (문구 추가)
- Modify: `index.html` script — Task 1의 `updateLoginGate`/`renderLoginUsers` 스텁 본문 교체 + `showLoginGate`/`hideLoginGate` 추가
- Modify: `index.html` 이벤트부 + `.tools` 클릭 핸들러 + `toggleLang`

**Interfaces:**
- Consumes (Task 1): `currentUser`, `usersCache`, `cloudConfigured()`, `registerUser`, `loginUser`, `logoutUser`, `resolveCurrentUser`
- Produces: `showLoginGate()`, `hideLoginGate()`, 본문이 채워진 `updateLoginGate()`/`renderLoginUsers()`; DOM id `loginGate`,`loginUsers`,`lgName`,`lgPin`,`lgRegisterBtn`,`lgSkip`,`lgMsg`,`userChip`,`userChipName`,`unreadBadge`,`sendReqBtn`,`userModal`,`userWho`,`switchUserBtn`

- [ ] **Step 1: CSS 추가**

앵커: `</style>` (이 줄 **바로 위**에 삽입)
```css
  /* ===== 요청(메신저) ===== */
  .login-gate { position: fixed; inset: 0; z-index: 200; background: rgba(40,34,28,.86);
    display: flex; align-items: center; justify-content: center; padding: 18px; }
  .login-gate[hidden] { display: none; }
  .login-card { background: var(--card1); color: var(--ink); width: min(420px, 94vw);
    border-radius: 16px; padding: 22px 20px; box-shadow: 0 18px 50px rgba(0,0,0,.4); font-family: var(--font-body); }
  .login-logo { font-family: var(--font-hand); color: var(--accent); font-size: 1.4rem; text-align: center; }
  .login-title { text-align: center; font-size: 1.15rem; margin: 6px 0 14px; }
  .login-users { list-style: none; margin: 0 0 6px; padding: 0; max-height: 38vh; overflow: auto; }
  .login-user { padding: 11px 12px; border: 2px dashed var(--line); border-radius: 10px; margin-bottom: 8px; cursor: pointer; }
  .login-user:hover { border-color: var(--accent); }
  .login-empty { color: var(--ink-soft); padding: 8px 2px; font-size: .92rem; }
  .login-or { text-align: center; color: var(--ink-soft); margin: 10px 0 8px; font-size: .9rem; }
  .login-form { display: flex; flex-wrap: wrap; gap: 8px; }
  .login-form input { flex: 1 1 120px; padding: 10px; border: none; border-bottom: 2px dashed var(--line);
    background: transparent; color: var(--ink); font-family: var(--font-body); font-size: 1rem; outline: none; }
  .login-form .mbtn { flex: 1 1 100%; }
  .login-msg { color: var(--accent); min-height: 1.2em; margin-top: 8px; font-size: .9rem; text-align: center; }
  .login-skip { display: block; margin: 12px auto 0; background: none; border: none; color: var(--ink-soft);
    cursor: pointer; font-family: var(--font-body); font-size: .85rem; text-decoration: underline; }
  .unread-badge { display: inline-block; min-width: 18px; padding: 0 5px; border-radius: 9px;
    background: var(--accent); color: #fff; font-size: .72rem; line-height: 18px; text-align: center; }
```

- [ ] **Step 2: 로그인 게이트 오버레이 마크업**

앵커: `<body data-theme="paper" data-font="gowun" data-lang="ko">` (이 줄 **바로 아래**에 삽입)
```html

  <div class="login-gate" id="loginGate" hidden>
    <div class="login-card">
      <div class="login-logo">★ The One Thing</div>
      <div class="login-title" data-i18n="lg_title">누구로 시작할까요?</div>
      <ul class="login-users" id="loginUsers"></ul>
      <div class="login-or" data-i18n="lg_or">또는 새로 등록</div>
      <div class="login-form">
        <input id="lgName" type="text" maxlength="20" data-i18n-ph="lg_name_ph" placeholder="이름" autocomplete="off" />
        <input id="lgPin" type="password" inputmode="numeric" maxlength="4" data-i18n-ph="lg_pin_ph" placeholder="숫자 4자리" autocomplete="off" />
        <button id="lgRegisterBtn" class="mbtn" data-i18n="lg_register">등록하고 시작</button>
      </div>
      <div class="login-msg" id="lgMsg"></div>
      <button id="lgSkip" class="login-skip" data-i18n="lg_skip">그냥 둘러보기 →</button>
    </div>
  </div>
```

- [ ] **Step 3: 상단바 버튼 + 사용자 모달 마크업**

앵커: `      <button data-act="help" type="button">❓</button>` (이 줄 **바로 아래**, 같은 `.tools` 안에 삽입)
```html
      <button data-act="sendreq" type="button" id="sendReqBtn" data-i18n="t_sendreq" hidden>✉️ 요청 보내기</button>
      <button data-act="user" type="button" id="userChip" hidden>👤 <span id="userChipName"></span> <span class="unread-badge" id="unreadBadge" hidden>0</span> ▾</button>
```

앵커: `  <div class="modal" id="trashModal" hidden>` (이 **블록 전체가 끝난 직후**, 즉 trashModal 의 닫는 `</div>` 다음 줄에 삽입) — 사용자 모달:
```html

  <div class="modal" id="userModal" hidden>
    <div class="modal-box">
      <div class="modal-head"><span data-i18n="um_head">👤 사용자</span><button class="modal-close" id="userClose">✕</button></div>
      <p class="modal-desc" id="userWho"></p>
      <div class="mrow"><button id="switchUserBtn" class="mbtn ghost" data-i18n="um_switch">사용자 바꾸기 / 로그아웃</button></div>
    </div>
  </div>
```

- [ ] **Step 4: i18n 추가**

앵커: Task 1 Step 2에서 추가한 `rq_wrong_pin: ...` 줄 끝에 콤마를 더하고 그 아래에 삽입:
```js
    rq_wrong_pin: { ko: "비밀번호가 틀렸어요", en: "Wrong PIN" },
    uc_login: { ko: "로그인", en: "Log in" },
    t_sendreq: { ko: "✉️ 요청 보내기", en: "✉️ Send request" },
    lg_title: { ko: "누구로 시작할까요?", en: "Who are you?" },
    lg_or: { ko: "또는 새로 등록", en: "Or register" },
    lg_name_ph: { ko: "이름", en: "Name" },
    lg_pin_ph: { ko: "숫자 4자리", en: "4-digit PIN" },
    lg_register: { ko: "등록하고 시작", en: "Register & start" },
    lg_empty: { ko: "아직 등록된 사람이 없어요 — 아래에서 새로 등록하세요", en: "No users yet — register below" },
    lg_skip: { ko: "그냥 둘러보기 →", en: "Just browse →" },
    lg_pin_prompt: { ko: "{0} 님의 4자리 비밀번호를 입력하세요", en: "Enter {0}'s 4-digit PIN" },
    lg_welcome: { ko: "{0} 님 환영합니다", en: "Welcome, {0}" },
    um_head: { ko: "👤 사용자", en: "👤 User" },
    um_who: { ko: "현재 로그인: {0}", en: "Logged in as {0}" },
    um_switch: { ko: "사용자 바꾸기 / 로그아웃", en: "Switch user / Log out" }
```

- [ ] **Step 5: 스텁 본문 교체 — `updateLoginGate` / `renderLoginUsers` + 게이트 표시 함수**

Task 1에서 넣은 두 스텁을 찾아 본문을 교체한다.

`function updateLoginGate() { /* Task 2에서 구현 */ }` → 다음으로 교체:
```js
  function updateLoginGate() {
    const chip = $id("userChip"), send = $id("sendReqBtn"), zone = $id("requestsZone"), gate = $id("loginGate");
    if (!cloudConfigured()) {                       // 메시징 비활성 — 기존 앱 그대로
      if (chip) chip.hidden = true; if (send) send.hidden = true;
      if (zone) zone.hidden = true; if (gate) gate.hidden = true;
      return;
    }
    const loggedIn = !!currentUser;
    if (chip) { chip.hidden = false; const n = $id("userChipName"); if (n) n.textContent = loggedIn ? currentUser.name : t("uc_login"); }
    if (send) send.hidden = !loggedIn;
    if (zone) zone.hidden = !loggedIn;
    if (loggedIn && gate) gate.hidden = true;
    renderUnreadBadge();
    if (loggedIn) renderRequests();
  }
```

`function renderLoginUsers() { /* Task 2에서 구현 */ }` → 다음으로 교체:
```js
  function renderLoginUsers() {
    const ul = $id("loginUsers"); if (!ul) return; ul.innerHTML = "";
    const ids = Object.keys(usersCache);
    if (!ids.length) { const li = document.createElement("li"); li.className = "login-empty"; li.textContent = t("lg_empty"); ul.appendChild(li); return; }
    ids.forEach((id) => {
      const li = document.createElement("li"); li.className = "login-user";
      li.textContent = "👤 " + ((usersCache[id] || {}).name || "?");
      li.addEventListener("click", () => {
        const pin = prompt(t("lg_pin_prompt", (usersCache[id] || {}).name || ""));
        if (pin === null) return;
        const r = loginUser(id, pin.trim());
        if (r.ok) { hideLoginGate(); toast(t("lg_welcome", currentUser.name)); }
        else { const m = $id("lgMsg"); if (m) m.textContent = r.msg; }
      });
      ul.appendChild(li);
    });
  }
  function showLoginGate() { const g = $id("loginGate"); if (g && cloudConfigured()) { g.hidden = false; renderLoginUsers(); const m = $id("lgMsg"); if (m) m.textContent = ""; } }
  function hideLoginGate() { const g = $id("loginGate"); if (g) g.hidden = true; }
```

- [ ] **Step 6: 이벤트 배선**

앵커: `  $id("syncChip").addEventListener("click", openSync);` (이 줄 **위**, 혹은 아래 — 이벤트부 어디든 한 곳에 모아 삽입)
```js
  $id("lgRegisterBtn").addEventListener("click", () => {
    const r = registerUser($id("lgName").value, $id("lgPin").value);
    if (r.ok) { hideLoginGate(); toast(t("lg_welcome", currentUser.name)); $id("lgName").value = ""; $id("lgPin").value = ""; const m = $id("lgMsg"); if (m) m.textContent = ""; }
    else { const m = $id("lgMsg"); if (m) m.textContent = r.msg; }
  });
  $id("lgPin").addEventListener("keydown", (e) => { if (e.key === "Enter") $id("lgRegisterBtn").click(); });
  $id("lgSkip").addEventListener("click", hideLoginGate);
  $id("userClose").addEventListener("click", () => { $id("userModal").hidden = true; });
  $id("switchUserBtn").addEventListener("click", () => { $id("userModal").hidden = true; logoutUser(); showLoginGate(); });
```

앵커: `.tools` 클릭 핸들러 안 마지막 분기 `else if (act === "help") $id("helpModal").hidden = false;` 를 다음으로 교체:
```js
    else if (act === "help") $id("helpModal").hidden = false;
    else if (act === "sendreq") openSendReq();
    else if (act === "user") { if (currentUser) { $id("userWho").textContent = t("um_who", currentUser.name); $id("userModal").hidden = false; } else showLoginGate(); }
```
> `openSendReq`는 Task 3에서 정의된다. Task 2 검증 시 "요청 보내기" 버튼은 누르지 않는다(또는 Task 3까지 미클릭).

앵커: `if (cloudConfigured() && !currentUser)` 가 아직 없으므로, Task 1 Step 3에서 넣은 `initMessaging();` **아래**에 게이트 자동 표시를 추가:
```js
  if (cloudConfigured() && !currentUser) showLoginGate();
```

- [ ] **Step 7: 브라우저 검증**

1. 로그인 상태 초기화(`onething-user` 삭제) 후 새로고침 → **로그인 게이트가 뜬다.**
2. 이름 `나두혁`, PIN `1234` 입력 → "등록하고 시작" → 게이트 닫히고 상단에 `👤 나두혁 ▾` 표시.
3. 새로고침 → 게이트 없이 바로 노트, 상단 `👤 나두혁` 유지(기억됨).
4. 상단 `👤 나두혁` 클릭 → 사용자 모달 → "사용자 바꾸기 / 로그아웃" → 게이트 다시 뜸.
5. 게이트의 목록에 `나두혁`이 보이고, 클릭 → PIN `0000`(틀림) → "비밀번호가 틀렸어요"; PIN `1234` → 로그인됨.
6. 🌐 버튼으로 영어 전환 → 게이트/버튼 문구가 영어로 바뀜(로그아웃 후 게이트로 확인).
7. (회귀) 기존 할 일 추가·동기화 칩 정상.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "요청 기능 2: 로그인 게이트 + 상단 사용자칩/로그아웃"
```

---

## Task 3: 요청 보내기 (모달 + 전송)

**Files:**
- Modify: `index.html` 모달 영역(userModal 다음)
- Modify: `index.html` `I18N`
- Modify: `index.html` script(함수 추가: `openSendReq`, `sendRequest`)
- Modify: `index.html` 이벤트부

**Interfaces:**
- Consumes: `currentUser`, `usersCache`, `msgDb`, `uid()`, `toast()`, `t()`
- Produces: `openSendReq()`, `sendRequest()`; DOM id `sendReqModal`,`sendReqTo`,`sendReqText`,`sendReqSend`,`sendReqClose`,`sendReqMsg`

- [ ] **Step 1: 보내기 모달 마크업**

앵커: Task 2에서 추가한 `userModal` 블록의 닫는 `</div>` 다음 줄에 삽입:
```html

  <div class="modal" id="sendReqModal" hidden>
    <div class="modal-box">
      <div class="modal-head"><span data-i18n="sr_head">✉️ 요청 보내기</span><button class="modal-close" id="sendReqClose">✕</button></div>
      <div class="mrow"><span class="mlabel" data-i18n="sr_to">받는 사람</span>
        <select id="sendReqTo" style="flex:1;padding:8px;border:none;border-bottom:2px dashed var(--line);background:transparent;color:var(--ink);font-family:var(--font-body);font-size:1rem;outline:none"></select>
      </div>
      <textarea id="sendReqText" rows="3" maxlength="500" data-i18n-ph="sr_text_ph" placeholder="요청 내용을 적어보세요…"
        style="width:100%;margin-top:10px;padding:10px;border:2px dashed var(--line);border-radius:10px;background:transparent;color:var(--ink);font-family:var(--font-body);font-size:1rem;outline:none;resize:vertical"></textarea>
      <div class="mrow" style="margin-top:12px"><button id="sendReqSend" class="mbtn" data-i18n="sr_send">보내기</button></div>
      <div class="login-msg" id="sendReqMsg"></div>
    </div>
  </div>
```

- [ ] **Step 2: i18n 추가**

앵커: Task 2 Step 4에서 추가한 `um_switch: ...` 줄 끝에 콤마를 더하고 그 아래에 삽입:
```js
    um_switch: { ko: "사용자 바꾸기 / 로그아웃", en: "Switch user / Log out" },
    sr_head: { ko: "✉️ 요청 보내기", en: "✉️ Send request" },
    sr_to: { ko: "받는 사람", en: "To" },
    sr_text_ph: { ko: "요청 내용을 적어보세요…", en: "Write your request…" },
    sr_send: { ko: "보내기", en: "Send" },
    sr_no_one: { ko: "보낼 상대가 없어요 (상대가 먼저 등록해야 해요)", en: "No one to send to (they must register first)" },
    sr_need_text: { ko: "내용을 입력하세요", en: "Enter a message" },
    sr_sent: { ko: "요청을 보냈어요", en: "Request sent" }
```

- [ ] **Step 3: 함수 추가**

앵커: Task 1에서 추가한 `function logoutUser() {...}` 줄 **아래**에 삽입:
```js
  function openSendReq() {
    if (!currentUser) { showLoginGate(); return; }
    const sel = $id("sendReqTo"); sel.innerHTML = "";
    const others = Object.keys(usersCache).filter((id) => id !== currentUser.id);
    if (!others.length) { const o = document.createElement("option"); o.value = ""; o.textContent = t("sr_no_one"); sel.appendChild(o); }
    else others.forEach((id) => { const o = document.createElement("option"); o.value = id; o.textContent = (usersCache[id] || {}).name || "?"; sel.appendChild(o); });
    $id("sendReqText").value = ""; $id("sendReqMsg").textContent = "";
    $id("sendReqModal").hidden = false;
  }
  function sendRequest() {
    if (!currentUser || !msgDb) { $id("sendReqMsg").textContent = t("rq_offline"); return; }
    const to = $id("sendReqTo").value; const text = $id("sendReqText").value.trim();
    if (!to) { $id("sendReqMsg").textContent = t("sr_no_one"); return; }
    if (!text) { $id("sendReqMsg").textContent = t("sr_need_text"); return; }
    const id = uid();
    msgDb.ref("requests/" + id).set({
      from: currentUser.id, fromName: currentUser.name,
      to: to, toName: (usersCache[to] || {}).name || "?",
      text: text, ts: Date.now(), status: "sent", replies: [], hiddenFor: []
    });
    $id("sendReqModal").hidden = true; toast(t("sr_sent"));
  }
```

- [ ] **Step 4: 이벤트 배선**

앵커: Task 2 Step 6에서 추가한 `$id("switchUserBtn")...` 줄 아래에 삽입:
```js
  $id("sendReqClose").addEventListener("click", () => { $id("sendReqModal").hidden = true; });
  $id("sendReqSend").addEventListener("click", sendRequest);
```

- [ ] **Step 5: 브라우저 검증 (두 사용자)**

1. 창 A: `나두혁`(1234)로 로그인. 창 B(시크릿): `양수민`(5678)로 등록/로그인.
2. 창 A에서 `✉️ 요청 보내기` → 받는 사람 드롭다운에 `양수민` 보임 → 내용 "보고서 부탁해요" → 보내기 → "요청을 보냈어요" 토스트.
3. 창 A DevTools 콘솔 `requestsCache` → `{from:나두혁id, to:양수민id, text:"보고서 부탁해요", status:"sent", ...}` 항목 확인.
4. 받는 사람이 없을 때(혼자만 등록된 상태)엔 드롭다운에 "보낼 상대가 없어요" 표시 확인.
5. 빈 내용으로 보내기 → "내용을 입력하세요".

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "요청 기능 3: 요청 보내기 모달·전송"
```

---

## Task 4: 받은/보낸 요청 영역 렌더 + 읽음/안읽음 배지

요청 카드를 화면 맨 아래에 그린다(액션 버튼 배선은 Task 5, 답장은 Task 6).

**Files:**
- Modify: `index.html` `<style>`(append)
- Modify: `index.html` `.notebook` 닫는 `</div>` 다음(요청 영역 마크업)
- Modify: `index.html` `I18N`
- Modify: `index.html` script — Task 1의 `renderRequests`/`renderUnreadBadge` 스텁 본문 교체 + 헬퍼 추가
- Modify: `index.html` `toggleLang`

**Interfaces:**
- Consumes: `requestsCache`, `currentUser`, `msgDb`, `pad2()`, `t()`
- Produces: 본문 채운 `renderRequests()`/`renderUnreadBadge()`, `renderReqList()`, `buildReqCard()`, `reqBtn()`, `fmtReqTime()`, `markRead()`; DOM id `requestsZone`,`rqInboxList`,`rqSentList`,`rqInboxCount`,`rqSentCount`

- [ ] **Step 1: CSS 추가**

앵커: `</style>` (바로 위에 삽입)
```css
  .requests-zone { display: flex; gap: 16px; flex-wrap: wrap; max-width: 980px; margin: 8px auto 40px; padding: 0 14px; }
  .requests-zone[hidden] { display: none; }
  .rq-col { flex: 1 1 320px; }
  .rq-h { color: #f3ead4; font-family: var(--font-hand); font-size: 1.15rem; margin: 0 0 8px; }
  .rq-count { color: #d8cfbb; opacity: .7; font-size: .85rem; }
  .rq-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .rq-empty { color: #d8cfbb; opacity: .7; font-size: .9rem; padding: 8px 2px; }
  .rq-card { background: var(--card1); color: var(--ink); border-radius: 12px; padding: 12px 14px; box-shadow: 0 6px 18px rgba(0,0,0,.22); }
  .rq-card.unread { box-shadow: 0 0 0 2px var(--accent), 0 6px 18px rgba(0,0,0,.22); }
  .rq-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .rq-who { font-weight: 700; }
  .rq-meta { color: var(--ink-soft); font-size: .78rem; white-space: nowrap; }
  .rq-text { margin: 6px 0; white-space: pre-wrap; word-break: break-word; }
  .rq-reply { margin: 4px 0 0 8px; padding: 6px 8px; border-left: 3px solid var(--line); color: var(--ink-soft); font-size: .9rem; white-space: pre-wrap; word-break: break-word; }
  .rq-acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .rq-btn { border: none; background: var(--paper-edge); color: var(--ink); border-radius: 8px; padding: 5px 9px; font-size: .82rem; cursor: pointer; font-family: var(--font-body); }
  .rq-btn:hover { background: var(--highlight); }
```

- [ ] **Step 2: 요청 영역 마크업**

앵커: 메인 레이아웃 `<div class="notebook">` 의 닫는 `</div>`(주석/구조상 `</div>` 다음 줄이 `  <div class="toast" id="toast"></div>` 인 지점). 그 `</div>` **다음, `<div class="toast"...>` 앞**에 삽입:
```html

  <section class="requests-zone" id="requestsZone" hidden>
    <div class="rq-col">
      <h3 class="rq-h"><span data-i18n="rq_inbox_h">📥 받은 요청</span> <span class="rq-count" id="rqInboxCount"></span></h3>
      <ul class="rq-list" id="rqInboxList"></ul>
    </div>
    <div class="rq-col">
      <h3 class="rq-h"><span data-i18n="rq_sent_h">📤 보낸 요청</span> <span class="rq-count" id="rqSentCount"></span></h3>
      <ul class="rq-list" id="rqSentList"></ul>
    </div>
  </section>
```

- [ ] **Step 3: i18n 추가**

앵커: Task 3 Step 2에서 추가한 `sr_sent: ...` 줄 끝에 콤마를 더하고 그 아래에 삽입:
```js
    sr_sent: { ko: "요청을 보냈어요", en: "Request sent" },
    rq_inbox_h: { ko: "📥 받은 요청", en: "📥 Received" },
    rq_sent_h: { ko: "📤 보낸 요청", en: "📤 Sent" },
    rq_inbox_empty: { ko: "받은 요청이 없어요", en: "No received requests" },
    rq_sent_empty: { ko: "보낸 요청이 없어요", en: "No sent requests" },
    rq_to_prefix: { ko: "받는 사람:", en: "To:" },
    rq_status_sent: { ko: "안 읽음", en: "Unread" },
    rq_status_read: { ko: "읽음", en: "Read" },
    rq_status_done: { ko: "완료", en: "Done" }
```

- [ ] **Step 4: 스텁 본문 교체 + 헬퍼 추가**

`function renderRequests() { /* Task 4에서 구현 */ }` → 다음으로 교체:
```js
  function renderRequests() {
    const inboxUl = $id("rqInboxList"), sentUl = $id("rqSentList");
    if (!inboxUl || !sentUl || !currentUser) return;
    const all = Object.keys(requestsCache).map((id) => Object.assign({ id }, requestsCache[id]));
    const mine = (r) => !((r.hiddenFor || []).includes(currentUser.id));
    const inbox = all.filter((r) => r.to === currentUser.id && mine(r)).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const sent = all.filter((r) => r.from === currentUser.id && mine(r)).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    renderReqList(inboxUl, inbox, "inbox");
    renderReqList(sentUl, sent, "sent");
    $id("rqInboxCount").textContent = inbox.length || "";
    $id("rqSentCount").textContent = sent.length || "";
  }
  function renderReqList(ul, items, kind) {
    ul.innerHTML = "";
    if (!items.length) { const li = document.createElement("li"); li.className = "rq-empty"; li.textContent = t(kind === "inbox" ? "rq_inbox_empty" : "rq_sent_empty"); ul.appendChild(li); return; }
    items.forEach((r) => ul.appendChild(buildReqCard(r, kind)));
  }
  function buildReqCard(r, kind) {
    const li = document.createElement("li");
    li.className = "rq-card" + (kind === "inbox" && r.status === "sent" ? " unread" : "");
    const head = document.createElement("div"); head.className = "rq-card-head";
    const who = document.createElement("span"); who.className = "rq-who";
    who.textContent = kind === "inbox" ? (r.fromName || "?") : (t("rq_to_prefix") + " " + (r.toName || "?"));
    const meta = document.createElement("span"); meta.className = "rq-meta";
    meta.textContent = fmtReqTime(r.ts) + " · " + t("rq_status_" + (r.status || "sent"));
    head.append(who, meta);
    const body = document.createElement("div"); body.className = "rq-text"; body.textContent = r.text || "";
    li.append(head, body);
    (r.replies || []).forEach((rep) => {
      const re = document.createElement("div"); re.className = "rq-reply";
      re.textContent = "↩ " + ((rep && rep.fromName) || "?") + ": " + ((rep && rep.text) || "");
      li.appendChild(re);
    });
    const acts = document.createElement("div"); acts.className = "rq-acts";
    li.appendChild(acts);   // 버튼은 Task 5/6에서 채운다
    if (kind === "inbox" && r.status === "sent") li.addEventListener("click", (e) => { if (!e.target.closest(".rq-acts")) markRead(r.id); });
    return li;
  }
  function reqBtn(label, fn) { const b = document.createElement("button"); b.className = "rq-btn"; b.textContent = label; b.addEventListener("click", (e) => { e.stopPropagation(); fn(); }); return b; }
  function fmtReqTime(ts) { if (!ts) return ""; const d = new Date(ts); return (d.getMonth() + 1) + "/" + d.getDate() + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function markRead(id) { const r = requestsCache[id]; if (r && r.status === "sent" && msgDb) msgDb.ref("requests/" + id + "/status").set("read"); }
```

`function renderUnreadBadge() { /* Task 4에서 구현 */ }` → 다음으로 교체:
```js
  function renderUnreadBadge() {
    const b = $id("unreadBadge"); if (!b) return;
    if (!currentUser) { b.hidden = true; return; }
    const n = Object.keys(requestsCache).filter((id) => { const r = requestsCache[id]; return r && r.to === currentUser.id && r.status === "sent" && !((r.hiddenFor || []).includes(currentUser.id)); }).length;
    b.textContent = n; b.hidden = n === 0;
  }
```

- [ ] **Step 5: 언어 전환 시 갱신**

앵커: `function toggleLang() {` 본문의 `save(); applyLang(); render(); refreshSyncState();` 를 다음으로 교체:
```js
    save(); applyLang(); render(); refreshSyncState(); renderRequests(); renderLoginUsers();
```

- [ ] **Step 6: 브라우저 검증 (두 사용자)**

1. 창 A `나두혁`, 창 B `양수민` 로그인. A→B로 "보고서 부탁해요" 전송(Task 3).
2. 창 B 새로고침/자동반영 → 페이지 맨 아래 **📥 받은 요청**에 카드: "나두혁 · MM/DD HH:MM · 안 읽음 / 보고서 부탁해요". 카드 테두리 강조(unread). 상단 칩에 `📥` 배지 `1`.
3. 창 B에서 카드 본문 클릭 → 상태 "읽음"으로 바뀌고 강조 사라짐, 배지 `0`(숨김).
4. 창 A 맨 아래 **📤 보낸 요청**에 같은 요청이 "받는 사람: 양수민 · 읽음"으로 보임(상태 동기화).
5. 빈 상태 문구("받은/보낸 요청이 없어요") 표시 확인(요청 없는 쪽).
6. 🌐 전환 → 카드 상태/제목 문구 영어로.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "요청 기능 4: 받은/보낸 요청 영역·읽음 배지"
```

---

## Task 5: 받은 요청 액션 — 할 일 추가 / 완료·확인 / 삭제

**Files:**
- Modify: `index.html` `I18N`
- Modify: `index.html` `buildReqCard`(액션 버튼 채우기) + 헬퍼 `setReqStatus`/`hideRequest` 추가

**Interfaces:**
- Consumes: `addTodo()`, `toast()`, `msgDb`, `requestsCache`, `currentUser`, `markRead()`, `reqBtn()`, `t()`
- Produces: `setReqStatus(id, st)`, `hideRequest(id)`; `buildReqCard`의 inbox/sent 버튼

- [ ] **Step 1: i18n 추가**

앵커: Task 4 Step 3에서 추가한 `rq_status_done: ...` 줄 끝에 콤마를 더하고 그 아래에 삽입:
```js
    rq_status_done: { ko: "완료", en: "Done" },
    rq_to_todo: { ko: "내 할 일로 추가", en: "Add to my todos" },
    rq_done: { ko: "완료/확인", en: "Done" },
    rq_delete: { ko: "삭제", en: "Delete" },
    rq_added_todo: { ko: "할 일에 추가했어요", en: "Added to your todos" }
```

- [ ] **Step 2: 헬퍼 추가**

앵커: Task 4에서 추가한 `function markRead(id) {...}` 줄 **아래**에 삽입:
```js
  function setReqStatus(id, st) { if (msgDb) msgDb.ref("requests/" + id + "/status").set(st); }
  function hideRequest(id) {
    const r = requestsCache[id]; if (!r || !msgDb || !currentUser) return;
    const hf = Array.isArray(r.hiddenFor) ? r.hiddenFor.slice() : [];
    if (!hf.includes(currentUser.id)) hf.push(currentUser.id);
    msgDb.ref("requests/" + id + "/hiddenFor").set(hf);
  }
```

- [ ] **Step 3: 액션 버튼 채우기**

`buildReqCard` 안의 `li.appendChild(acts);   // 버튼은 Task 5/6에서 채운다` 줄을 다음으로 교체:
```js
    if (kind === "inbox") {
      acts.appendChild(reqBtn(t("rq_to_todo"), () => { markRead(r.id); addTodo(r.text || ""); toast(t("rq_added_todo")); }));
      acts.appendChild(reqBtn(t("rq_done"), () => { markRead(r.id); setReqStatus(r.id, "done"); }));
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    } else {
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    }
    li.appendChild(acts);
```

- [ ] **Step 4: 브라우저 검증**

1. 창 B 받은 요청 카드에서 `[내 할 일로 추가]` → 왼쪽 "오늘 할 일들"에 "보고서 부탁해요" 추가됨 + "할 일에 추가했어요" 토스트.
2. `[완료/확인]` → 카드 상태 "완료", 창 A "보낸 요청"에도 "완료"로 보임.
3. 창 B `[삭제]` → 받은 요청 목록에서 사라짐. 창 A "보낸 요청"엔 **그대로 남아있음**(상대 화면만 숨김) 확인.
4. (회귀) 추가된 할 일은 동기화 코드로 다른 기기에도 반영(동기화 켜진 경우).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "요청 기능 5: 받은 요청 액션(할 일추가·완료·삭제)"
```

---

## Task 6: 한 줄 답장

**Files:**
- Modify: `index.html` `I18N`
- Modify: `index.html` `buildReqCard`(양쪽에 답장 버튼) + `doReply` 추가

**Interfaces:**
- Consumes: `requestsCache`, `currentUser`, `msgDb`, `toast()`, `reqBtn()`, `t()`
- Produces: `doReply(id)`; inbox/sent 카드의 `[↩ 답장]` 버튼

- [ ] **Step 1: i18n 추가**

앵커: Task 5 Step 1에서 추가한 `rq_added_todo: ...` 줄 끝에 콤마를 더하고 그 아래에 삽입:
```js
    rq_added_todo: { ko: "할 일에 추가했어요", en: "Added to your todos" },
    rq_reply: { ko: "↩ 답장", en: "↩ Reply" },
    rq_reply_prompt: { ko: "답장을 입력하세요", en: "Enter your reply" },
    rq_replied: { ko: "답장을 보냈어요", en: "Reply sent" }
```

- [ ] **Step 2: `doReply` 추가**

앵커: Task 5에서 추가한 `function hideRequest(id) {...}` 줄 **아래**에 삽입:
```js
  function doReply(id) {
    const r = requestsCache[id]; if (!r || !msgDb || !currentUser) return;
    const txt = prompt(t("rq_reply_prompt")); if (txt === null) return;
    const text = txt.trim(); if (!text) return;
    const reps = Array.isArray(r.replies) ? r.replies.slice() : [];
    reps.push({ from: currentUser.id, fromName: currentUser.name, text: text, ts: Date.now() });
    msgDb.ref("requests/" + id + "/replies").set(reps);
    toast(t("rq_replied"));
  }
```

- [ ] **Step 3: 답장 버튼 추가**

`buildReqCard`의 inbox 분기에서 `[삭제]` 버튼 **앞**에 답장 버튼을 끼워넣고, sent 분기에도 추가한다. Step 5(Task 5)에서 만든 블록을 다음으로 교체:
```js
    if (kind === "inbox") {
      acts.appendChild(reqBtn(t("rq_to_todo"), () => { markRead(r.id); addTodo(r.text || ""); toast(t("rq_added_todo")); }));
      acts.appendChild(reqBtn(t("rq_done"), () => { markRead(r.id); setReqStatus(r.id, "done"); }));
      acts.appendChild(reqBtn(t("rq_reply"), () => { markRead(r.id); doReply(r.id); }));
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    } else {
      acts.appendChild(reqBtn(t("rq_reply"), () => doReply(r.id)));
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    }
    li.appendChild(acts);
```

- [ ] **Step 4: 브라우저 검증**

1. 창 B 받은 요청에서 `[↩ 답장]` → "넵 확인했어요" 입력 → "답장을 보냈어요" 토스트. 카드에 `↩ 양수민: 넵 확인했어요` 표시.
2. 창 A "보낸 요청"의 같은 카드에도 답장이 보임.
3. 창 A가 자기 "보낸 요청"에서 `[↩ 답장]`으로 한 번 더 답장 → 창 B에도 누적 표시(가벼운 스레드).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "요청 기능 6: 한 줄 답장(양방향)"
```

---

## Task 7: 전체 회귀 점검 & 마무리

코드 변경이 아니라, 성공 기준 전체를 한 번에 검증하고 자잘한 문제를 정리한다.

**Files:**
- (필요 시) `index.html` 미세 수정만

- [ ] **Step 1: 성공 기준 점검 (스펙 §11)**

다음을 순서대로 확인하고 체크한다:
1. 새 기기/초기화 상태 → 로그인 게이트 표시.
2. 이름+4자리 등록 → `users/<id>` 저장(콘솔 `usersCache`), 같은 이름 재등록 차단.
3. 로그인 유지(새로고침해도 기억).
4. A→B 전송 → B "받은 요청"에 표시.
5. `[내 할 일로 추가]` → 왼쪽 목록 추가.
6. `[완료/확인]` → A의 "보낸 요청"에 "완료".
7. `[↩ 답장]` → A의 "보낸 요청"에 답장.
8. 안 읽음 배지 정확.
9. 🌐 전환 시 새 UI 번역.
10. 기존 동기화 코드/노트 데이터·동작 무영향(할 일 추가/완료/타이머/통계/휴지통/백업 빠르게 확인).

- [ ] **Step 2: 엣지/오프라인 점검**

- 인터넷 끊고 새로고침 → 이미 로그인된 사용자는 노트 정상 사용(요청 전송 시 안내). 게이트에 갇히지 않음("그냥 둘러보기" 동작).
- `cloudConfigured()`가 false인 환경(파일에서 FIREBASE_CONFIG 비웠다고 가정) → 상단 칩/보내기/영역/게이트 모두 숨김, 기존 앱 그대로. (실제로 지우지 말고, 코드상 `if (!cloudConfigured())` 분기가 그 동작을 보장하는지 코드 확인.)

- [ ] **Step 3: 콘솔 오류 확인**

DevTools 콘솔에 빨간 오류 없이 모든 흐름 동작. (특히 함수 중복 선언/미정의 참조 없음.)

- [ ] **Step 4: 배포 안내(사용자에게)**

이 계획은 코드 작성까지다. 라이브 반영은 사용자가 "저장+커밋+푸시"라고 할 때 수행한다(GitHub Pages, 1~2분 후 다른 기기 Ctrl+F5). 자동 푸시하지 않는다.

- [ ] **Step 5: (필요 시) 최종 정리 커밋**

```bash
git add index.html
git commit -m "요청 기능 7: 회귀 점검 및 마무리"
```

---

## Self-Review (작성자 점검 결과)

**1. 스펙 커버리지:** §3 분리(노트 미변경) → Global Constraints + Task 1 `ensureFirebase`(initSync 미수정). §4 데이터 모델 → Task 1 필드/경로 그대로. §5 상태 흐름 → Task 4 markRead, Task 5 done. §6 화면 → Task 2(게이트/칩) 3(보내기) 4(영역) 5/6(액션). §7 i18n → 각 Task에서 ko/en 추가. §8 예외 → 중복(Task1), 오프라인/게이트 갇힘 방지(Task2 skip, Task7), 받는사람0(Task3). §9 보안 → Global Constraints 명시. §11 성공기준 → Task 7. ✅ 누락 없음.

**2. 플레이스홀더 스캔:** Task 1의 4개 스텁은 의도된 임시 함수이며 Task 2/4에서 "본문 교체"로 명시 — TBD 아님. CSS 오타 블록은 "정확본 사용" 지시로 무력화. 그 외 모든 단계에 실제 코드 포함. ✅

**3. 타입/이름 일관성:** `requests/<id>` 필드(from/fromName/to/toName/text/ts/status/replies/hiddenFor) 전 Task 동일. 함수명 `renderRequests/renderUnreadBadge/renderLoginUsers/updateLoginGate`(스텁→교체) 일치. `markRead/setReqStatus/hideRequest/doReply/reqBtn/buildReqCard/renderReqList/fmtReqTime` 정의·호출 일치. localStorage `onething-user`(JSON {id,name}) 일관. ✅
