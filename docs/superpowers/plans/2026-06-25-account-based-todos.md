# 계정별 할 일(per-account notebook) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** 할 일을 계정별로 저장·동기화하고(`notes/user_<id>`), 로그인 화면을 불투명하게, 기존 할 일을 나두혁 계정으로 1회 이전한다. 동기화 칩은 계정 동기화 상태 표시로 유지.

**Architecture:** 단일 `index.html`. 저장/로드 키를 `notebookKey()`로 계정별 분기, 클라우드 동기화 ref를 계정 기준으로 변경, 로그인/전환 시 노트북 교체. 메시징(users/requests)·UI 골격은 그대로.

**Tech Stack:** Vanilla JS, Firebase RTDB(compat).

## Global Constraints

- 모든 변경은 `C:\AI\OneThing\index.html` 안에서.
- 메시징(`users/`,`requests/`)·테마·통계·타이머 등 기존 기능 회귀 금지.
- 새 문구는 `I18N` ko/en 등록.
- `Date.now()`/`new Date()`는 브라우저 코드이므로 정상 사용.

## Testing Approach
자동 테스트 러너 없음. 각 Task는 **문법 검사(`node --check` 추출 스크립트)** + **수동 브라우저 시나리오**로 검증.

## ⚠️ 핵심 주의 (TDZ)
`let currentUser`는 현재 `loadState()`/`let state = loadState()`보다 **뒤(메시징 블록)**에 선언돼 있다. `notebookKey()`가 `currentUser`를 참조하므로, **`currentUser` 선언을 `loadState()` 앞으로 옮기고** 메시징 블록의 기존 선언은 제거한다. (안 그러면 로드 시 ReferenceError.)

---

## Task 1: 계정별 저장 토대 (notebookKey + currentUser 선언 이동)

**Files:** Modify `index.html`

- [ ] **Step 1: currentUser 선언을 앞으로 이동**

앵커(메시징 블록): `  let currentUser = null;             // { id, name, ... }` → 이 줄을 **삭제**.

앵커(loadState 앞): `  function loadState() {` → 이 줄 **위**에 삽입:
```js
  let currentUser = null;   // 로그인 계정 (notebookKey가 참조 — loadState보다 먼저 선언해야 함)
  function notebookKey() { return currentUser ? "onething-notebook::" + currentUser.id : STORAGE_KEY; }
```

- [ ] **Step 2: loadState/save를 notebookKey로**

`function loadState() {` 블록의 `const raw = localStorage.getItem(STORAGE_KEY);` → `const raw = localStorage.getItem(notebookKey());`

`function save() {` 블록의 `localStorage.setItem(STORAGE_KEY, JSON.stringify(state));` → `localStorage.setItem(notebookKey(), JSON.stringify(state));`

- [ ] **Step 3: 타이머 직접 저장도 notebookKey로**

앵커: `if (act.focusSec % 15 === 0) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} pushCloud(); }`
→ `STORAGE_KEY` 를 `notebookKey()` 로 교체.

- [ ] **Step 4: 문법 검사 + 커밋**

추출 후 `node --check` → SYNTAX OK 확인.
```bash
git add index.html && git commit -m "계정별 할 일 1: notebookKey 저장 토대 + currentUser 선언 이동"
```

---

## Task 2: 계정 기준 클라우드 동기화 + 노트북 교체 + 마이그레이션

**Files:** Modify `index.html`

**Interfaces:** `switchNotebook()`, `maybeMigrateLegacy()`; `initSync()` 재작성(계정 ref); `pushCloud`/`setSyncStatus`/`refreshSyncState`/`logoutUser` 수정.

- [ ] **Step 1: initSync를 계정 기준으로 재작성**

`function initSync() { ... }` (현재 `notes/<코드>` 구독) 전체를 다음으로 교체:
```js
  function initSync() {
    if (!cloudConfigured()) { setSyncStatus("unconfigured"); return; }
    if (!currentUser) { if (syncRef) { syncRef.off(); syncRef = null; } cloudReady = false; setSyncStatus("nocode"); return; }
    try {
      const db = ensureFirebase(); if (!db) { setSyncStatus("error"); return; }
      if (syncRef) { syncRef.off(); syncRef = null; }
      cloudReady = false; lastTs = 0; syncRef = db.ref("notes/user_" + currentUser.id);
      syncRef.on("value", (snap) => {
        cloudReady = true; const val = snap.val();
        if (!val) { setSyncStatus("ok"); maybeMigrateLegacy(); pushCloud(); return; }
        if (val.origin === clientId) { lastTs = Math.max(lastTs, val.ts || 0); setSyncStatus("ok"); return; }
        if ((val.ts || 0) <= lastTs) { setSyncStatus("ok"); return; }
        applyingRemote = true; state = migrate(val.data); lastTs = val.ts || 0;
        try { localStorage.setItem(notebookKey(), JSON.stringify(state)); } catch (_) {}
        applyLang(); render(); applyingRemote = false; setSyncStatus("ok"); toast(t("s_pulled"));
      }, () => setSyncStatus("error"));
    } catch (e) { setSyncStatus("error"); }
  }
```

- [ ] **Step 2: setSyncStatus/refreshSyncState 계정형으로**

`setSyncStatus`의 `if (kind === "ok") { chip.classList.add("on"); c = t("s_on"); m = t("s_on_msg", code || getSyncCode()); cls = "on"; }`
→ `if (kind === "ok") { chip.classList.add("on"); c = t("s_on"); m = t("s_on_acct", currentUser ? currentUser.name : ""); cls = "on"; }`

`function refreshSyncState() { ... }` 전체를 다음으로 교체:
```js
  function refreshSyncState() { if (!cloudConfigured()) setSyncStatus("unconfigured"); else if (!currentUser) setSyncStatus("nocode"); else if (cloudReady) setSyncStatus("ok"); else setSyncStatus("nocode"); }
```

- [ ] **Step 3: switchNotebook + maybeMigrateLegacy 추가**

앵커: `function logoutUser() { localStorage.removeItem(USER_KEY); currentUser = null; updateLoginGate(); }` → 이 줄을 다음으로 교체:
```js
  function logoutUser() {
    localStorage.removeItem(USER_KEY); currentUser = null;
    if (syncRef) { syncRef.off(); syncRef = null; } cloudReady = false;
    state = migrate(null); render(); updateLoginGate(); refreshSyncState();
  }
  function switchNotebook() {
    state = loadState();
    state.trash = (state.trash || []).filter((td) => !td.deletedAt || (Date.now() - td.deletedAt) < 30 * 864e5);
    if (activeTodo()) timerRemaining = pomoSec();
    applyLang(); render(); initSync();
  }
  function maybeMigrateLegacy() {
    if (!currentUser || currentUser.name !== "나두혁") return;
    if (localStorage.getItem("onething-acct-migrated")) return;
    if ((state.todos || []).length || (state.history || []).length) { localStorage.setItem("onething-acct-migrated", "1"); return; }
    let legacy = null; try { legacy = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) {}
    if (legacy && ((legacy.todos || []).length || (legacy.history || []).length)) {
      state = migrate(legacy); save(); render(); toast(t("acct_migrated"));
    }
    localStorage.setItem("onething-acct-migrated", "1");
  }
```

- [ ] **Step 4: 로그인/등록 성공 시 노트북 교체**

`registerUser`의 `    resolveCurrentUser();\n    return { ok: true };` → `    resolveCurrentUser(); switchNotebook();\n    return { ok: true };`

`loginUser`의 `    resolveCurrentUser();\n    return { ok: true };` → `    resolveCurrentUser(); switchNotebook();\n    return { ok: true };`

- [ ] **Step 5: pushCloud는 그대로(syncRef가 계정 ref)** — 변경 없음. 확인만.

- [ ] **Step 6: init 재배치**

앵커(init 블록):
```js
  applyTheme();
  applyLang();
  render();
  initSync();
  resolveCurrentUser();
  initMessaging();
  if (cloudConfigured() && !currentUser) showLoginGate();
  checkReminder();
```
→ 다음으로 교체:
```js
  applyTheme();
  resolveCurrentUser();
  initMessaging();
  if (cloudConfigured() && !currentUser) showLoginGate();
  if (currentUser) switchNotebook();
  else { applyLang(); render(); }
  refreshSyncState();
  checkReminder();
```

- [ ] **Step 7: i18n 추가**

앵커: `    rq_replied: { ko: "답장을 보냈어요", en: "Reply sent" }` 줄 끝에 콤마를 더하고 그 아래 삽입:
```js
    rq_replied: { ko: "답장을 보냈어요", en: "Reply sent" },
    s_on_acct: { ko: "계정 기준으로 자동 동기화 중 — {0}", en: "Auto-syncing by account — {0}" },
    sync_acct_help: { ko: "로그인한 계정 기준으로 자동 동기화됩니다. 같은 계정으로 다른 기기에서 로그인하면 같은 할 일이 보여요.", en: "Auto-syncs by your account. Log in with the same account on another device to see the same todos." },
    acct_migrated: { ko: "기존 할 일을 이 계정으로 가져왔어요", en: "Imported your existing todos into this account" }
```

- [ ] **Step 8: 문법 검사 + 커밋**

`node --check` SYNTAX OK.
```bash
git add index.html && git commit -m "계정별 할 일 2: 계정 기준 클라우드 동기화·전환·마이그레이션"
```

---

## Task 3: 로그인 게이트 불투명 + 스킵 제거 + 동기화 칩 계정 안내

**Files:** Modify `index.html`

- [ ] **Step 1: 로그인 게이트 불투명**

앵커: `  .login-gate { position: fixed; inset: 0; z-index: 200; background: rgba(40,34,28,.86);`
→ `background: rgba(40,34,28,.86)` 를 `background: var(--desk2)` 로 교체(불투명 솔리드).

- [ ] **Step 2: '둘러보기' 스킵 버튼 제거 (마크업 + 리스너 둘 다)**

앵커(마크업): `      <button id="lgSkip" class="login-skip" data-i18n="lg_skip">그냥 둘러보기 →</button>` → 이 줄 **삭제**.

앵커(리스너): `  $id("lgSkip").addEventListener("click", hideLoginGate);` → 이 줄 **삭제**.
> 둘 중 하나만 지우면 안 된다(마크업만 지우면 `$id("lgSkip")`가 null → addEventListener에서 오류).

- [ ] **Step 3: openSync를 계정 안내로 재작성**

`function openSync() { ... }` 전체를 다음으로 교체:
```js
  function openSync() {
    const box = $id("syncModal");
    box.querySelectorAll(".mlabel, .sync-row, .mrow").forEach((el) => { el.style.display = "none"; });
    $id("syncHelp").textContent = t("sync_acct_help");
    refreshSyncState(); box.hidden = false;
  }
```

- [ ] **Step 4: 문법 검사 + 커밋**

`node --check` SYNTAX OK.
```bash
git add index.html && git commit -m "계정별 할 일 3: 로그인 불투명·스킵 제거·동기화 칩 계정 안내"
```

---

## Task 4: 회귀 점검

- [ ] **Step 1: 정적 검사** — i18n 키/요소 id/중복 함수 스크립트 재실행, 새 항목 누락 0건 확인.
- [ ] **Step 2: 시나리오(브라우저 2프로필)**
  1. 나두혁 로그인 → 기존 할 일 보임(이전 토스트), 동기화 칩 "✅ 동기화 켜짐".
  2. 사용자 바꾸기 → 양수민 로그인 → **빈 목록**. 양수민으로 할 일 추가.
  3. 다시 나두혁 → 양수민이 추가한 건 **안 보임**(분리), 나두혁 기존 할 일만.
  4. 다른 시크릿창에서 나두혁 로그인 → 같은 할 일(계정 동기화).
  5. 로그인 화면 배경 불투명(뒤 안 비침), 스킵 버튼 없음.
  6. 동기화 칩 클릭 → 코드 입력 없이 계정 동기화 안내만.
  7. 메시징(요청 보내기/받기/배지/답장) 정상.
- [ ] **Step 3: 콘솔 오류 0건.**

## Self-Review
- 스펙 §2~5 전부 Task로 매핑(저장 §3→T1, 동기화/전환/이전 §4·5→T2, 게이트/칩 §4.4·4.5→T3). ✅
- TDZ 주의 반영(T1 Step1 currentUser 이동). ✅
- 타입/이름: notebookKey/switchNotebook/maybeMigrateLegacy/initSync 일관, i18n 키 정의·사용 일치. ✅
