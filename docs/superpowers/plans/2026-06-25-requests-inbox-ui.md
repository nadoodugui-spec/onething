# 요청 UI 정리(인박스 모달) Implementation Plan

> REQUIRED SUB-SKILL: superpowers:executing-plans. 단일 `index.html` 인라인 실행 + 배포.

**Goal:** 노트 아래 요청 띠 제거 → 상단 📥 버튼(배지) + 요청 모달(받은/보낸 탭). 새 요청 토스트, 받은 탭 열면 자동 읽음.

**Constraints:** index.html 한 파일. 데이터·전송·카드 버튼 로직 변경 없음. 새 문구 ko/en. 검증=node --check + 수동. 완료 시 자동 배포(프로젝트 규칙).

## 재사용(변경 없음)
`renderRequests`, `renderReqList`, `buildReqCard`, `reqBtn`, `markRead`, `setReqStatus`, `hideRequest`, `doReply`, `renderUnreadBadge` — 그대로. (리스트 ids `rqInboxList`/`rqSentList`/`rqInboxCount`/`rqSentCount`가 모달 안으로 이동할 뿐.)

---

## Task 1: HTML (툴바·모달·요청영역 제거) + i18n

- [ ] **툴바**: `index.html`의 `sendReqBtn`/`userChip` 줄(현재 477–478)을 교체:
```html
      <button data-act="sendreq" type="button" id="sendReqBtn" data-i18n="t_sendreq" hidden>✉️ 요청 보내기</button>
      <button data-act="inbox" type="button" id="inboxBtn" data-i18n-title="rq_inbox_title" title="받은 요청" hidden>📥 <span class="unread-badge" id="unreadBadge" hidden>0</span></button>
      <button data-act="user" type="button" id="userChip" hidden>👤 <span id="userChipName"></span> ▾</button>
```
(배지를 userChip→inboxBtn으로 이동, userChip에서 unread-badge span 제거.)

- [ ] **요청 띠 제거**: 아래 블록 전체 삭제:
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

- [ ] **요청 모달 추가**: `<script>\n(function () {` 바로 앞(마지막 모달 닫힘 `  </div>` 뒤)에 삽입:
```html
  <div class="modal" id="reqModal" hidden>
    <div class="modal-box">
      <div class="modal-head"><span data-i18n="rq_modal_head">✉️ 요청</span><button class="modal-close" id="reqClose">✕</button></div>
      <div class="rq-tabs">
        <button class="rq-tab active" id="rqTabInbox" type="button"><span data-i18n="rq_tab_inbox">받은</span> <span id="rqInboxCount"></span></button>
        <button class="rq-tab" id="rqTabSent" type="button"><span data-i18n="rq_tab_sent">보낸</span> <span id="rqSentCount"></span></button>
      </div>
      <ul class="rq-list" id="rqInboxList"></ul>
      <ul class="rq-list" id="rqSentList" hidden></ul>
    </div>
  </div>
```

- [ ] **i18n 추가**(`rq_replied` 줄 뒤 등):
```js
    rq_modal_head: { ko: "✉️ 요청", en: "✉️ Requests" },
    rq_tab_inbox: { ko: "받은", en: "Received" },
    rq_tab_sent: { ko: "보낸", en: "Sent" },
    rq_new: { ko: "🔔 {0}님이 요청을 보냈어요", en: "🔔 {0} sent you a request" },
    rq_inbox_title: { ko: "받은 요청", en: "Inbox" }
```

## Task 2: CSS

- [ ] `.requests-zone`/`.requests-zone[hidden]`/`.rq-col`/`@media(max-width:480px){.requests-zone...}` (429–432) + `.rq-h`/`.rq-count`(432–433) 제거하고 탭 스타일로 교체. `.rq-empty` 색을 ink-soft로:
```css
  .rq-tabs { display: flex; gap: 8px; margin-bottom: 10px; }
  .rq-tab { border: none; background: var(--paper-edge); color: var(--ink-soft); border-radius: 999px; padding: 6px 14px; font-size: .92rem; cursor: pointer; font-family: var(--font-body); }
  .rq-tab.active { background: var(--accent); color: #fff; }
  .rq-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow: auto; }
  .rq-list[hidden] { display: none; }
  .rq-empty { color: var(--ink-soft); opacity: .8; font-size: .92rem; padding: 12px 2px; }
```
(`.rq-card` 등 나머지 카드 스타일은 유지 — 모달=종이 배경이라 ink 글자가 잘 보임.)

## Task 3: JS

- [ ] 전역 추가(메시징 globals 근처): `let knownReqIds = null; let reqTab = "inbox";`

- [ ] requests 리스너에 토스트 추가:
```js
    msgDb.ref("requests").on("value", (snap) => {
      requestsCache = snap.val() || {};
      notifyNewRequests();
      renderRequests(); renderUnreadBadge();
    });
```

- [ ] 함수 추가(`renderUnreadBadge` 근처):
```js
  function notifyNewRequests() {
    const ids = Object.keys(requestsCache);
    if (knownReqIds === null || !currentUser) { knownReqIds = new Set(ids); return; }
    ids.forEach((id) => {
      if (knownReqIds.has(id)) return;
      const r = requestsCache[id];
      if (r && r.to === currentUser.id && r.from !== currentUser.id && !((r.hiddenFor || []).includes(currentUser.id))) toast(t("rq_new", r.fromName || "?"));
    });
    knownReqIds = new Set(ids);
  }
  function openInbox() { if (!currentUser) { showLoginGate(); return; } setReqTab("inbox"); $id("reqModal").hidden = false; }
  function setReqTab(tab) {
    reqTab = tab;
    const tabIn = $id("rqTabInbox"), tabSent = $id("rqTabSent"), inboxList = $id("rqInboxList"), sentList = $id("rqSentList");
    if (tabIn) tabIn.classList.toggle("active", tab === "inbox");
    if (tabSent) tabSent.classList.toggle("active", tab === "sent");
    if (inboxList) inboxList.hidden = tab !== "inbox";
    if (sentList) sentList.hidden = tab !== "sent";
    if (tab === "inbox") markInboxRead();
  }
  function markInboxRead() {
    if (!currentUser || !msgDb) return;
    Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id];
      if (r && r.to === currentUser.id && r.status === "sent" && !((r.hiddenFor || []).includes(currentUser.id))) msgDb.ref("requests/" + id + "/status").set("read");
    });
  }
```

- [ ] `updateLoginGate` 교체: `zone`(requestsZone) → `inbox`(inboxBtn):
```js
  function updateLoginGate() {
    const chip = $id("userChip"), send = $id("sendReqBtn"), inbox = $id("inboxBtn"), gate = $id("loginGate");
    if (!cloudConfigured()) {
      if (chip) chip.hidden = true; if (send) send.hidden = true; if (inbox) inbox.hidden = true; if (gate) gate.hidden = true;
      return;
    }
    const loggedIn = !!currentUser;
    if (chip) { chip.hidden = false; const n = $id("userChipName"); if (n) n.textContent = loggedIn ? currentUser.name : t("uc_login"); }
    if (send) send.hidden = !loggedIn;
    if (inbox) inbox.hidden = !loggedIn;
    if (loggedIn && gate) gate.hidden = true;
    renderUnreadBadge();
    if (loggedIn) renderRequests();
  }
```

- [ ] `.tools` 핸들러에 분기 추가(`act === "sendreq"` 줄 뒤): `else if (act === "inbox") openInbox();`

- [ ] 이벤트 배선 추가:
```js
  $id("reqClose").addEventListener("click", () => { $id("reqModal").hidden = true; });
  $id("rqTabInbox").addEventListener("click", () => setReqTab("inbox"));
  $id("rqTabSent").addEventListener("click", () => setReqTab("sent"));
```

## Task 4: 검증 + 배포
- [ ] node --check 추출 SYNTAX OK. 정적 점검(잔존 requestsZone 0, 신규 id 존재, 중복 함수 0).
- [ ] 수동: 평소 노트 아래 깨끗 / 📥 배지 / 모달 탭 전환 / 새 요청 토스트 / 받은 탭 자동읽음 / 버튼 동작 / 🌐.
- [ ] commit + push (자동 배포).

## Self-Review
스펙 §3~5 전부 Task 매핑. renderRequests/badge 재사용으로 회귀 위험 낮음. id 이동(rqInboxList 등)은 모달로만 존재(중복 없음). knownReqIds 첫 로드 초기화로 토스트 폭주 방지. ✅
