(function () {
  "use strict";

  const APP_VER = "12.2";   // 사용자 메뉴에 표시 — 기기가 새 코드를 받았는지 확인용

  const STORAGE_KEY = "onething-notebook-v1";

  // ===== 클라우드 동기화 설정 =====
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyASo_vj9aOyAfv0F6HlOlJ7e2oPjmKqfSo",
    authDomain: "onething-7f4d7.firebaseapp.com",
    databaseURL: "https://onething-7f4d7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "onething-7f4d7",
    storageBucket: "onething-7f4d7.firebasestorage.app",
    messagingSenderId: "9113682878",
    appId: "1:9113682878:web:b7b4571af1d5bed37defef"
  };

  const $ = (s) => document.querySelector(s);
  const $id = (id) => document.getElementById(id);
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ===== i18n =====
  let LANG = "ko";
  const I18N = {
    // toolbar / static
    sync_title: { ko: "기기 간 동기화", en: "Sync across devices" },
    search_ph: { ko: "할 일 검색…", en: "Search to-dos…" },
    t_stats: { ko: "통계", en: "Stats" },
    t_trash: { ko: "휴지통", en: "Trash" },
    t_backup: { ko: "백업", en: "Backup" },
    t_settings: { ko: "설정", en: "Settings" },
    left_title: { ko: "할 일들", en: "To-Dos" },
    relock: { ko: "다시 집중", en: "Refocus" },
    new_ph: { ko: "해야 할 일을 적어보세요…", en: "Write something to do…" },
    add_btn: { ko: "＋ 추가", en: "＋ Add" },
    add_title: { ko: "추가", en: "Add" },
    np_title: { ko: "우선순위", en: "Priority" },
    add_hint: { ko: "<kbd>Enter</kbd> Routine · <kbd>Shift+Enter</kbd> Next · <kbd>Ctrl+Enter</kbd> Now", en: "<kbd>Enter</kbd> Routine · <kbd>Shift+Enter</kbd> Next · <kbd>Ctrl+Enter</kbd> Now" },
    later_h: { ko: "나중에", en: "Later" },
    done_h: { ko: "끝난 일", en: "Done" },
    prev_day: { ko: "이전 날", en: "Previous day" },
    next_day: { ko: "다음 날", en: "Next day" },
    today_btn: { ko: "오늘", en: "Today" },
    goal_badge: { ko: "◉ 오늘의 단 하나, 완료!", en: "◉ Today's one thing — done!" },
    lock_title: { ko: "지금은 단 하나에 집중할 시간", en: "Time to focus on the one thing" },
    hold_t: { ko: "🔒 잠금 해제", en: "🔒 Unlock" },
    hold_d: { ko: "정말 목록을 열어야 하나요? 그렇다면 버튼을 3초간 길게 누르세요.", en: "Do you really need the list? Hold the button for 3 seconds." },
    hold_btn: { ko: "길게 눌러 열기", en: "Hold to open" },
    hold_sec: { ko: "초…", en: "s…" },
    hold_cancel: { ko: "놓으면 처음부터예요", en: "Released — start over" },
    lock_msg: { ko: "지금은 오른쪽 <b>단 하나</b>에 집중 중", en: "Focusing on the <b>one thing</b> on the right" },
    lock_sub: { ko: "목록 보기·원씽 교체 — 버튼을 3초간 길게 누르면 열립니다", en: "View list & swap — hold the button for 3 seconds to open" },
    // sync modal
    sync_head: { ko: "기기 간 동기화", en: "Sync across devices" },
    sync_label: { ko: "동기화 코드 — 두 기기에 <b>똑같이</b> 입력하세요", en: "Sync code — enter the <b>same</b> code on both devices" },
    sync_ph: { ko: "예: my-note-7Fk29q", en: "e.g. my-note-7Fk29q" },
    save_btn: { ko: "저장", en: "Save" },
    sync_gen: { ko: "새 코드 만들기", en: "New code" },
    sync_copy: { ko: "코드 복사", en: "Copy code" },
    sync_help: { ko: "① 윈도우·맥북 두 곳에서 이 노트를 엽니다.\n② 똑같은 ‘동기화 코드’를 양쪽에 입력하면 자동으로 같은 내용이 됩니다.\n③ 코드는 남이 못 맞히게 길고 특이하게 정하세요.", en: "① Open this note on both devices.\n② Enter the same 'sync code' on each to share the same data automatically.\n③ Make the code long and unique so others can't guess it." },
    // settings
    set_head: { ko: "설정", en: "Settings" },
    set_theme: { ko: "테마(배경)", en: "Theme" },
    th_auto: { ko: "자동(시스템)", en: "Auto" }, th_light: { ko: "라이트", en: "Light" }, th_dark: { ko: "다크", en: "Dark" },
    set_timer: { ko: "집중 타이머 길이", en: "Timer length" },
    min_unit: { ko: "분", en: "min" },
    set_reminder: { ko: "매일 ‘오늘의 원씽 정하기’ 알림", en: "Daily 'pick your One Thing' reminder" },
    // modal heads
    stats_head: { ko: "통계", en: "Stats" },
    trash_head: { ko: "휴지통", en: "Trash" },
    trash_desc: { ko: "삭제한 일은 여기로 옵니다. 되돌리거나 완전히 지울 수 있어요. (30일 지나면 자동 정리)", en: "Deleted items come here. Restore or delete them for good. (auto-cleared after 30 days)" },
    trash_empty: { ko: "휴지통 비우기", en: "Empty trash" },
    backup_head: { ko: "백업", en: "Backup" },
    backup_desc: { ko: "클라우드와 별개로, 파일로 백업하고 불러올 수 있어요. (불러오면 현재 내용을 덮어씁니다 — 확인 후 진행)", en: "Back up and restore via a file, separate from the cloud. (Import overwrites current data — confirmed first)" },
    export_btn: { ko: "파일로 내보내기", en: "Export to file" },
    import_btn: { ko: "파일에서 불러오기", en: "Import from file" },
    help_head: { ko: "도움말 · 단축키", en: "Help · Shortcuts" },
    help_body: {
      ko: "<b>왜 '단 하나'인가</b><br>모든 게 급해 보여도, 성과는 언제나 가장 중요한 하나에서 나옵니다. 이 도구는 그 하나를 정하고, 끝날 때까지 지키게 합니다.<br><br><b>어떻게 쓰나</b><br>① 왼쪽에 할 일을 모으고, 매일 스스로 묻습니다 — \"이걸 끝내면 나머지가 쉬워지는 일은?\"<br>② 그 하나를 ◉ 눌러 오른쪽으로 보냅니다. 나머지 할 일은 잠깁니다.<br>③ 원씽을 정하면 팀에게 '원씽 중'으로 보이고, 요청 알림은 조용히 쌓였다가 나중에 전달됩니다.<br>④ 완료하면 도미노가 하나 넘어가고, 요청으로 받은 일이면 보낸 사람에게 자동으로 전해집니다.<br><br><b>단축키</b><br>N: 할 일 입력 · / : 검색 · S: 통계 · T: 테마 · ? : 도움말 · Esc: 닫기<br>Enter: Routine · Shift+Enter: Next · Ctrl+Enter: Now / 보내기",
      en: "<b>Why one thing</b><br>Everything feels urgent, but results come from the single most important thing. This tool helps you pick it and protect it until it's done.<br><br><b>How it works</b><br>① Collect to-dos on the left and ask daily — \"What makes everything else easier once done?\"<br>② Send that one to the right with ◉. The rest locks.<br>③ With a One Thing set, teammates see you as 'Focusing' and request alerts pile up quietly.<br>④ Completing it topples a domino — and auto-notifies the requester if it came from a request.<br><br><b>Shortcuts</b><br>N: input · / : search · S: stats · T: theme · ? : help · Esc: close<br>Enter: Routine · Shift+Enter: Next · Ctrl+Enter: Now / Send"
    },
    // dynamic — toasts & messages
    swap_done: { ko: "단 하나를 교체했어요 — 나머지는 다시 잠겼습니다", en: "Swapped your one thing — the rest is locked again" },
    sent_done: { ko: "이제 이것 하나만. 나머지는 잠겼습니다", en: "Now just this one. Everything else is locked" },
    putback_done: { ko: "목록으로 되돌렸어요 — 다시 선택하세요", en: "Moved back to the list — pick again" },
    confirm_empty: { ko: "휴지통을 완전히 비울까요? 되돌릴 수 없어요.", en: "Empty the trash completely? This can't be undone." },
    alarm_title: { ko: "⏰ 집중 시간 종료", en: "⏰ Focus time's up" },
    alarm_body: { ko: "{0} — 잠깐 쉬거나 계속하세요. (자동 완료되지 않아요)", en: "{0} — take a break or keep going. (Not auto-completed)" },
    alarm_toast: { ko: "집중 시간이 끝났어요 — 이어가거나 잠시 쉬세요 (자동 완료되지 않아요)", en: "Focus time's up — keep going or take a break (not auto-completed)" },
    onething_word: { ko: "원씽", en: "the One Thing" },
    cheer0: { ko: "오늘의 도미노가 넘어졌습니다 — 내일은 더 큰 것이 넘어갑니다", en: "Today's domino has fallen — tomorrow a bigger one falls" },
    cheer1: { ko: "단 하나를 끝냈습니다. 오늘은 이미 성공이에요", en: "The one thing is done. Today is already a win" },
    cheer2: { ko: "가장 중요한 일이 끝났습니다 — 나머지는 덤입니다", en: "The most important thing is done — the rest is bonus" },
    cheer3: { ko: "흔들리지 않고 하나를 끝내는 것, 그게 실력입니다", en: "Finishing one thing without wavering — that's mastery" },
    cheer4: { ko: "작은 도미노가 쌓이고 있어요. 이 흐름을 믿으세요", en: "Small dominoes are stacking up. Trust the momentum" },
    solved_status: { ko: "통과! 할 일 목록이 열립니다", en: "Solved! Opening your to-do list" },
    solved_toast: { ko: "할 일 목록이 열렸어요 — 다 보면 ‘다시 집중’", en: "List opened — tap 'Refocus' when done" },
    // todo rows
    ti_done: { ko: "완료", en: "Done" },
    ti_color: { ko: "색 라벨", en: "Color label" },
    ti_edit: { ko: "더블클릭하면 수정", en: "Double-click to edit" },
    rep_daily: { ko: "매일 반복", en: "Daily" },
    rep_weekly: { ko: "매주 반복", en: "Weekly" },
    rep_none: { ko: "반복 없음", en: "No repeat" },
    badge_prog: { ko: "◉ 원씽", en: "◉ One Thing" },
    ot_cancel_t: { ko: "원씽 취소(목록으로 되돌리기)", en: "Cancel One Thing (back to list)" },
    ot_tagline: { ko: "성과를 결정하는, 가장 중요한 단 하나", en: "The one thing that decides your results" },
    tt_reset: { ko: "카운트다운을 처음으로 (누적 집중 시간은 유지)", en: "Reset countdown (total focus time is kept)" },
    tt_acc: { ko: "이 원씽에 쌓인 실제 집중 시간 — 리셋되지 않아요", en: "Total real focus on this One Thing — never resets" },
    send_swap: { ko: "이걸로 원씽 교체", en: "Swap the One Thing" },
    send_to: { ko: "오른쪽 원씽으로 보내기", en: "Send to the One Thing" },
    ti_more: { ko: "더보기", en: "More" },
    no_results: { ko: "검색 결과가 없어요.", en: "No results." },
    empty_list: { ko: "위 칸에 할 일을 적어 시작하세요", en: "Write a to-do above to start" },
    prio_urgent: { ko: "Now", en: "Now" },
    prio_important: { ko: "Next", en: "Next" },
    prio_normal: { ko: "Routine", en: "Routine" },
    prio_drop: { ko: "여기로 끌어다 놓기", en: "Drag items here" },
    sub_ph: { ko: "+ 하위 할 일 추가 후 Enter", en: "+ Add a subtask, then Enter" },
    ti_due: { ko: "마감일", en: "Due date" },
    ti_later: { ko: "나중에", en: "Later" },
    ti_delete: { ko: "삭제", en: "Delete" },
    subs_head: { ko: "☑ {0}/{1} · 하위 할 일", en: "☑ {0}/{1} · Subtasks" },
    subs_empty: { ko: "하위 할 일 — 작게 쪼개기", en: "Subtasks — break it down" },
    ot_break_h: { ko: "◉ \"원씽\" 작게 조각내기", en: "◉ Break it into small pieces" },
    ot_break_sub: { ko: "작게 조각내면, 해야 할 일이 명확해집니다.", en: "Break it into small pieces, and the next step becomes clear." },
    ot_break_sub2: { ko: "차례대로 하나씩 — 지금 조각만 생각하세요.", en: "One piece at a time — think only of the current one." },
    ot_break_first: { ko: "＋ 첫 번째 조각을 적고 Enter", en: "＋ Write the first piece, then Enter" },
    ot_break_next: { ko: "＋ 다음 조각 추가 후 Enter", en: "＋ Add the next piece, then Enter" },
    tmr_reset: { ko: "처음부터", en: "Restart" },
    ti_restore: { ko: "되돌리기", en: "Restore" },
    ti_backtodo: { ko: "다시 할 일로", en: "Back to to-dos" },
    ti_totrash: { ko: "휴지통으로", en: "To trash" },
    ti_delrec: { ko: "기록 삭제", en: "Delete record" },
    // timer / one thing
    timer_pause: { ko: "일시정지", en: "Pause" },
    timer_start: { ko: "집중 시작", en: "Start focus" },
    focus_acc: { ko: "집중 {0}", en: "Focused {0}" },
    tp_label: { ko: "길이", en: "Length" },
    tp_custom: { ko: "직접", en: "Custom" },
    complete: { ko: "완료", en: "Done" },
    pick_again: { ko: "↩ 다시 선택", en: "↩ Pick again" },
    hint_active: { ko: "지금은 이것만. 나머지는 잠시 잊어도 됩니다.", en: "Just this, for now. The rest can wait." },
    empty_ot: { ko: "<b>모든 우선순위를 넘어서는,<br>단 하나!</b><br><span style='font-size:.82em'>할 일에서 <span class='arrow'>◉</span> 눌러 그 하나를 보내세요</span>", en: "<b>The one thing<br>above every priority!</b><br><span style='font-size:.82em'>Send it here with <span class='arrow'>◉</span></span>" },
    hint_count: { ko: "오늘 {0}개의 원씽을 끝냈어요. 다음 하나를 골라보세요.", en: "You finished {0} One Thing(s) today. Pick the next one." },
    hint_key: { ko: "성과는 개수가 아니라, 하나의 선택에서 나옵니다.", en: "Results come from one choice, not from how many you juggle." },
    ro_has: { ko: "이 날의 원씽 기록이에요 ☝", en: "The One Thing log for this day ☝" },
    ro_none: { ko: "이 날엔 끝낸 원씽이 없어요", en: "No One Things finished this day" },
    hint_today: { ko: "‘오늘’ 버튼으로 돌아오면 원씽을 고를 수 있어요.", en: "Tap 'Today' to pick a One Thing." },
    // stats
    hero0: { ko: "아직 시작 전 — 오늘 첫 원씽을 완료해 보세요", en: "Not started yet — topple your first domino today" },
    hero_fire: { ko: "{0}일 연속 실천 중 — 대단한 흐름이에요", en: "{0}-day streak — great momentum" },
    hero_going: { ko: "{0}일째 실천 중 — 이 흐름을 이어가요", en: "Day {0} going — keep the streak" },
    hero_restart: { ko: "다시 시작하기 좋은 날 — 오늘 하나만 해볼까요?", en: "A good day to restart — just one today?" },
    lbl_cur: { ko: "연속 도미노", en: "Domino streak" },
    lbl_best: { ko: "최고 연속", en: "Best streak" },
    lbl_total: { ko: "넘어뜨린 도미노", en: "Dominoes toppled" },
    ms_top: { ko: "최고 등급 달성", en: "Top tier reached" },
    ms_count: { ko: "{0}개", en: "{0}" },
    ms_next: { ko: "다음 목표 {0}개", en: "Next goal: {0}" },
    ms_note: { ko: "{0}개만 더 하면 달성", en: "{0} more to go" },
    week_h: { ko: "이번 주 · {0}/7일 실천", en: "This week · {0}/7 days" },
    // trash / later
    trash_emptynote: { ko: "휴지통이 비어 있어요.", en: "Trash is empty." },
    tr_restore: { ko: "↩ 복구", en: "↩ Restore" },
    tr_purge: { ko: "🗑 완전삭제", en: "🗑 Delete forever" },
    later_empty: { ko: "미뤄둔 일이 없어요.", en: "Nothing put aside." },
    lt_now: { ko: "▶ 오늘 할 일로", en: "▶ To today" },
    lt_now_title: { ko: "오늘 할 일들로 옮기기", en: "Move to today's to-dos" },
    lt_del: { ko: "삭제", en: "Delete" },
    // backup
    bk_exported: { ko: "백업 파일을 내보냈어요 💾", en: "Exported a backup file 💾" },
    bk_export_fail: { ko: "내보내기에 실패했어요", en: "Export failed" },
    bk_invalid: { ko: "올바른 백업 파일이 아니에요", en: "Not a valid backup file" },
    bk_confirm: { ko: "불러오면 지금 내용을 덮어씁니다. 진행할까요?", en: "Importing will overwrite current data. Continue?" },
    bk_imported: { ko: "백업을 불러왔어요 ✓", en: "Backup imported ✓" },
    bk_import_fail: { ko: "불러오기에 실패했어요", en: "Import failed" },
    rem_on: { ko: "켜짐 ✓", en: "On ✓" },
    rem_off: { ko: "꺼짐", en: "Off" },
    // sync status
    s_on: { ko: "● 동기화 켜짐", en: "● Sync on" },
    s_on_msg: { ko: "켜짐 · 코드: {0}", en: "On · code: {0}" },
    s_nocode: { ko: "동기화 대기", en: "Sync pending" },
    s_nocode_msg: { ko: "로그인하면 계정 기준으로 자동 동기화됩니다.", en: "Sign in and your data syncs automatically by account." },
    s_err: { ko: "동기화 오류", en: "Sync error" },
    s_err_msg: { ko: "연결에 문제가 있어요. 설정값과 인터넷을 확인하세요.", en: "Connection problem. Check settings and internet." },
    s_unconf: { ko: "동기화 설정", en: "Set up sync" },
    s_unconf_msg: { ko: "아직 클라우드 설정이 비어 있어요.", en: "Cloud config is empty yet." },
    s_saved: { ko: "동기화 코드를 저장했어요 — 다른 기기에도 같은 코드를 넣으세요", en: "Saved the sync code — enter the same code on other devices" },
    s_copied: { ko: "코드를 복사했어요", en: "Code copied" },
    s_copyfail: { ko: "이 환경에선 복사를 못 해요 — 직접 적어두세요", en: "Can't copy here — note it down manually" },
    s_pulled: { ko: "다른 기기의 변경을 받아왔어요 ☁️", en: "Pulled changes from another device ☁️" },
    // reminder / timer presets / relock / theme
    rem_title: { ko: "✦ 오늘의 원씽", en: "✦ Today's One Thing" },
    rem_body: { ko: "오늘 집중할 단 하나를 정해보세요.", en: "Pick the single thing to focus on today." },
    rem_toast: { ko: "✦ 오늘 집중할 단 하나를 정해보세요", en: "✦ Pick the single thing to focus on today" },
    tp_prompt: { ko: "집중 시간을 분 단위로 입력하세요 (1~180)", en: "Enter focus minutes (1–180)" },
    tp_range: { ko: "1~180 사이 숫자를 입력하세요", en: "Enter a number between 1 and 180" },
    tp_set: { ko: "집중 시간을 {0}분으로 정했어요", en: "Set focus time to {0} min" },
    relock_toast: { ko: "다시 단 하나로 — 나머지를 잠갔어요", en: "Back to the one thing — the rest is locked" },
    theme_toast: { ko: "테마: {0}", en: "Theme: {0}" },
    rq_need_name: { ko: "이름을 입력하세요", en: "Enter a name" },
    rq_need_pin: { ko: "숫자 4자리를 입력하세요", en: "Enter a 4-digit PIN" },
    rq_offline: { ko: "인터넷 연결이 필요해요 (요청 기능)", en: "Internet required for requests" },
    rq_dup_name: { ko: "이미 있는 이름이에요 — 본인이면 목록에서 골라 로그인하세요", en: "Name taken — if it's you, pick it to log in" },
    rq_no_user: { ko: "사용자를 찾을 수 없어요", en: "User not found" },
    rq_wrong_pin: { ko: "비밀번호가 틀렸어요", en: "Wrong PIN" },
    uc_login: { ko: "로그인", en: "Log in" },
    t_sendreq: { ko: "요청 보내기", en: "Send request" },
    lg_title: { ko: "누구로 시작할까요?", en: "Who are you?" },
    lg_hero: { ko: "모든 게 급하다고 말하는 시대,<br><b>성과는 언제나 '단 하나'에서 나옵니다.</b>", en: "In a world where everything feels urgent,<br><b>results always come from one thing.</b>" },
    lg_story: { ko: "우리의 이야기 →", en: "Our story →" },
    lg_guide: { ko: "이용 가이드 →", en: "User guide →" },
    guide_corner: { ko: "? 이용 가이드", en: "? Guide" },
    au_google: { ko: "Google로 계속하기", en: "Continue with Google" },
    au_or: { ko: "또는 이메일로", en: "or with email" },
    au_email_ph: { ko: "이메일", en: "Email" },
    au_pw_ph: { ko: "비밀번호", en: "Password" },
    au_pw2_ph: { ko: "비밀번호 확인", en: "Confirm password" },
    au_name_ph: { ko: "이름 (팀에 보이는 이름)", en: "Name (shown to your team)" },
    au_pw_rule: { ko: "비밀번호: 8자 이상, 영문과 숫자 포함 (특수문자 권장)", en: "Password: 8+ chars with letters & numbers (symbols recommended)" },
    au_login: { ko: "로그인", en: "Log in" },
    au_signup: { ko: "가입하기", en: "Sign up" },
    au_to_signup: { ko: "이메일로 회원가입 →", en: "Sign up with email →" },
    au_to_login: { ko: "← 로그인으로", en: "← Back to log in" },
    au_forgot: { ko: "비밀번호 찾기", en: "Forgot password" },
    au_forgot_need: { ko: "이메일을 먼저 입력하세요", en: "Enter your email first" },
    au_forgot_sent: { ko: "비밀번호 재설정 메일을 보냈어요 — 받은편지함을 확인하세요", en: "Password reset email sent — check your inbox" },
    au_e_email: { ko: "올바른 이메일을 입력하세요", en: "Enter a valid email" },
    au_e_dup: { ko: "이미 가입된 이메일이에요 — 로그인하거나 비밀번호 찾기를 이용하세요", en: "Email already registered — log in or reset password" },
    au_e_weak: { ko: "비밀번호는 8자 이상, 영문과 숫자를 포함해야 해요", en: "Password needs 8+ chars with letters & numbers" },
    au_e_pw2: { ko: "비밀번호 확인이 일치하지 않아요", en: "Passwords don't match" },
    au_e_cred: { ko: "이메일 또는 비밀번호가 올바르지 않아요", en: "Wrong email or password" },
    au_e_nouser: { ko: "가입되지 않은 이메일이에요", en: "No account with this email" },
    au_e_many: { ko: "시도가 너무 많아요 — 잠시 후 다시 해주세요", en: "Too many attempts — try again later" },
    au_e_off: { ko: "관리자 설정 대기 중이에요 (콘솔에서 로그인 방법을 켜주세요)", en: "Sign-in method not enabled yet" },
    au_e_popup: { ko: "팝업이 닫혔거나 차단됐어요 — 다시 시도해주세요", en: "Popup closed or blocked — try again" },
    pf_head: { ko: "프로필 설정", en: "Set up your profile" },
    pf_desc: { ko: "팀에 보일 이름을 정해주세요.", en: "Choose the name your team will see." },
    pf_start: { ko: "시작하기", en: "Get started" },
    pf_legacy_h: { ko: "예전 이름+PIN 계정이 있나요? 연결하면 할 일·소속이 그대로 이어져요.", en: "Have an old name+PIN account? Link it to keep your data." },
    pf_link: { ko: "연결", en: "Link" },
    pf_linking: { ko: "계정을 연결하는 중…", en: "Linking account…" },
    pw_reset: { ko: "비밀번호 재설정 메일", en: "Send password reset" },
    pw_reset_noemail: { ko: "이 계정에 이메일이 없어요(구계정) — 본인이 이메일 가입 후 '계정 연결'을 하면 돼요", en: "No email on this account — they should sign up and link it" },
    pw_reset_confirm: { ko: "{0}님({1})에게 비밀번호 재설정 메일을 보낼까요?", en: "Send a password reset email to {0} ({1})?" },
    set_g_me: { ko: "개인", en: "Personal" },
    set_g_team: { ko: "팀에 공개", en: "Shared with team" },
    set_g_data: { ko: "데이터", en: "Data" },
    set_unlock: { ko: "잠금 해제 방식", en: "Unlock method" },
    ul_puzzle: { ko: "3초 길게 누르기", en: "Hold 3s" },
    ul_button: { ko: "버튼 한 번", en: "One click" },
    ws_regen: { ko: "초대 코드 재발급", en: "Regenerate invite code" },
    ws_regen_confirm: { ko: "초대 코드를 새로 만들까요? 기존 코드는 더 이상 쓸 수 없어요.", en: "Regenerate the invite code? The old one stops working." },
    ws_regen_done: { ko: "새 초대 코드: {0}", en: "New invite code: {0}" },
    role_admin: { ko: "관리자", en: "Admin" },
    role_promote: { ko: "관리자로", en: "Make admin" },
    role_demote: { ko: "관리자 해제", en: "Remove admin" },
    kick_btn: { ko: "내보내기", en: "Remove from team" },
    kick_confirm: { ko: "'{0}'님을 워크스페이스에서 내보낼까요? 계정은 유지되고, 미완료 요청은 나에게 전달됩니다.", en: "Remove '{0}' from the workspace? Their account stays; pending requests come to you." },
    kick_done: { ko: "{0}님을 내보냈어요 — 미완료 요청은 나에게 전달됐습니다", en: "{0} removed — pending requests forwarded to you" },
    undo_btn: { ko: "실행 취소", en: "Undo" },
    undo_deleted: { ko: "삭제했어요", en: "Deleted" },
    rq_edit: { ko: "수정", en: "Edit" },
    rq_recall: { ko: "회수", en: "Recall" },
    rq_recall_confirm: { ko: "이 요청을 회수할까요? 상대에게는 '회수됨'으로 표시되고 내용은 보이지 않아요.", en: "Recall this request? The recipient will see it marked as recalled, without its content." },
    rq_recalled: { ko: "요청을 회수했어요", en: "Request recalled" },
    rq_recalled_pill: { ko: "회수됨", en: "Recalled" },
    rq_recalled_body: { ko: "보낸 사람이 이 요청을 회수했어요.", en: "The sender recalled this request." },
    pf_h: { ko: "플랫폼 관리 (최고관리자)", en: "Platform admin (super admin)" },
    pf_open: { ko: "간단 현황", en: "Quick view" },
    pf_head: { ko: "🛠 플랫폼 전체 현황", en: "🛠 Platform overview" },
    pf_search_ph: { ko: "회사·회원 이름/이메일 검색", en: "Search companies or members" },
    pf_sum: { ko: "워크스페이스(회사) {0}곳 · 전체 회원 {1}명 · 무소속 {2}명", en: "{0} workspaces · {1} members total · {2} unaffiliated" },
    pf_owner: { ko: "오너", en: "Owner" },
    pf_admin: { ko: "관리자", en: "Admin" },
    pf_members_n: { ko: "구성원 {0}명", en: "{0} members" },
    pf_solo_h: { ko: "무소속 회원", en: "Unaffiliated members" },
    pf_empty: { ko: "검색 결과가 없어요", en: "No results" },
    pf_org: { ko: "권한 흐름도", en: "Permission chart" },
    pf_console: { ko: "🛠 관제 센터 열기", en: "🛠 Open control center" },
    qna_btn: { ko: "문의하기 (Q&A)", en: "Contact us (Q&A)" },
    qna_head: { ko: "💬 문의하기 (Q&A)", en: "💬 Contact us (Q&A)" },
    qna_desc: { ko: "서비스 이용 중 궁금한 점이나 문제를 남겨주세요. 운영진이 확인 후 답변을 달아드려요.", en: "Leave a question or issue. The operators will reply here." },
    qna_ph: { ko: "질문이나 불편한 점을 적어주세요", en: "Write your question or issue" },
    qna_send: { ko: "보내기", en: "Send" },
    qna_mine: { ko: "내 문의 내역", en: "My questions" },
    qna_sent: { ko: "문의를 보냈어요. 답변이 달리면 이곳에서 확인할 수 있어요.", en: "Sent. Replies will appear here." },
    qna_wait: { ko: "답변 대기 중", en: "Awaiting reply" },
    qna_ans: { ko: "답변", en: "Reply" },
    qna_empty: { ko: "아직 남긴 문의가 없어요", en: "No questions yet" },
    qna_del: { ko: "삭제", en: "Delete" },
    badge_tip_in: { ko: "아직 처리하지 않은 요청 수 — 읽기만 해선 줄지 않고, 즉시완료하거나 내 할 일로 추가해야 줄어요", en: "Unhandled requests — reading alone doesn't clear it; complete or add to your list" },
    badge_tip_sent: { ko: "상대가 아직 안 읽은 요청 + 새 답장 + 확인 안 한 완료 소식", en: "Unread by recipient + new replies + unseen completions" },
    wd_btn: { ko: "회원 탈퇴", en: "Delete account" },
    wd_confirm1: { ko: "정말 탈퇴할까요? 할 일·원씽 기록·문의 내역이 모두 삭제되고 되돌릴 수 없어요.", en: "Really delete your account? All your data will be permanently removed." },
    wd_confirm2: { ko: "마지막 확인입니다. 탈퇴하려면 확인을 누르세요.", en: "Final confirmation. Press OK to delete." },
    wd_done: { ko: "탈퇴가 완료됐어요. 그동안 함께해서 감사했습니다.", en: "Your account has been deleted. Thank you." },
    vf_sent_spam: { ko: "인증 메일을 보냈어요 — 안 보이면 스팸함(프로모션함)을 꼭 확인하세요", en: "Verification email sent — check your spam folder if missing" },
    vf_throttle: { ko: "요청이 너무 잦아요. 15분쯤 뒤에 다시 시도해주세요 (이전 메일이 스팸함에 있을 수 있어요)", en: "Too many requests — try again in ~15 minutes (check spam for earlier emails)" },
    vf_already: { ko: "이미 인증된 계정이에요 ✓", en: "Already verified ✓" },
    wd_relogin: { ko: "보안을 위해 최근 로그인이 필요해요. 로그아웃 후 다시 로그인한 뒤 탈퇴를 진행해주세요.", en: "For security, please log in again, then retry deletion." },
    fo_head: { ko: "◉ 첫 원씽 정하기", en: "◉ Your first One Thing" },
    fo_q: { ko: "<b>\"이걸 끝내면 나머지가 쉬워지는 일은 무엇인가요?\"</b>", en: "<b>\"What's the one thing that makes everything else easier?\"</b>" },
    fo_ph: { ko: "예: 견적서 마무리해서 보내기", en: "e.g. Finish and send the quote" },
    fo_go: { ko: "◉ 이걸로 시작하기", en: "◉ Start with this" },
    fo_hint: { ko: "거창하지 않아도 돼요 — 3분짜리 일이어도 좋습니다. 완료의 감각이 첫 도미노예요.", en: "It doesn't have to be big — even a 3-minute task. Finishing is your first domino." },
    fo_done: { ko: "첫 원씽이 정해졌어요! 끝나면 완료 버튼을 누르세요 — 그게 첫 도미노예요.", en: "Your first One Thing is set! Press done when finished — your first domino." },
    rq_edited: { ko: "(수정됨)", en: "(edited)" },
    rq_edited_done: { ko: "요청을 수정했어요", en: "Request updated" },
    au_verify_sent: { ko: "인증 메일을 보냈어요 — 받은편지함을 확인하세요", en: "Verification email sent — check your inbox" },
    um_verify: { ko: "이메일 인증이 아직 완료되지 않았어요", en: "Your email isn't verified yet" },
    um_verify_btn: { ko: "인증 메일 재발송", en: "Resend verification" },
    audit_h: { ko: "최근 관리 기록", en: "Recent admin activity" },
    st_tab_me: { ko: "나", en: "Me" },
    st_tab_team: { ko: "팀 (관리자)", en: "Team (admin)" },
    kb_to_doing: { ko: "→ 진행 중", en: "→ In progress" },
    kb_to_done: { ko: "→ 완료", en: "→ Done" },
    kb_to_todo: { ko: "← 할 일", en: "← To do" },
    rt_kicker: { ko: "오늘의 시작", en: "START YOUR DAY" },
    rt_q: { ko: "이걸 끝내면, 나머지가 쉬워지는<br><b>단 하나</b>는 무엇인가요?", en: "What's the <b>one thing</b> that makes<br>everything else easier?" },
    rt_sub: { ko: "여러 개를 잘하는 사람보다, 하나를 끝내는 사람이 이깁니다.", en: "The one who finishes one thing beats the one who juggles many." },
    rt_go: { ko: "오늘의 단 하나 정하기", en: "Set today's One Thing" },
    rt_skip: { ko: "오늘은 그냥 둘러볼게요 →", en: "Just looking around today →" },
    lg_or: { ko: "또는 새로 등록", en: "Or register" },
    lg_name_ph: { ko: "이름", en: "Name" },
    lg_pin_ph: { ko: "숫자 4자리", en: "4-digit PIN" },
    lg_register: { ko: "등록하고 시작", en: "Register & start" },
    lg_empty: { ko: "아직 등록된 사람이 없어요 — 아래에서 새로 등록하세요", en: "No users yet — register below" },
    lg_skip: { ko: "그냥 둘러보기 →", en: "Just browse →" },
    lg_pin_prompt: { ko: "{0} 님의 4자리 비밀번호를 입력하세요", en: "Enter {0}'s 4-digit PIN" },
    lg_pin_head: { ko: "비밀번호 입력", en: "Enter PIN" },
    lg_pin_confirm: { ko: "확인", en: "OK" },
    lg_pin_cancel: { ko: "취소", en: "Cancel" },
    lg_welcome: { ko: "{0} 님 환영합니다", en: "Welcome, {0}" },
    um_head: { ko: "사용자", en: "User" },
    um_who: { ko: "현재 로그인: {0}", en: "Logged in as {0}" },
    um_switch: { ko: "사용자 바꾸기 / 로그아웃", en: "Switch user / Log out" },
    um_rename: { ko: "이름 변경", en: "Rename" },
    um_rename_prompt: { ko: "새 이름을 입력하세요", en: "Enter a new name" },
    um_renamed: { ko: "이름을 바꿨어요 — 이전 기록에는 옛 이름이 남을 수 있어요", en: "Renamed — old records may keep the previous name" },
    sr_head: { ko: "요청 보내기", en: "Send request" },
    sr_to: { ko: "받는 사람", en: "To" },
    sr_text_ph: { ko: "요청 내용을 적어보세요…", en: "Write your request…" },
    sr_send: { ko: "보내기", en: "Send" },
    sr_no_one: { ko: "보낼 상대가 없어요 (상대가 먼저 등록해야 해요)", en: "No one to send to (they must register first)" },
    sr_need_text: { ko: "내용을 입력하세요", en: "Enter a message" },
    sr_sent: { ko: "보냈어요 — 상대의 집중에 맞춰 전달됩니다", en: "Sent — delivered around their focus" },
    rq_inbox_h: { ko: "받은 요청", en: "Received" },
    rq_sent_h: { ko: "보낸 요청", en: "Sent" },
    rq_inbox_empty: { ko: "받은 요청이 없어요", en: "No received requests" },
    rq_sent_empty: { ko: "보낸 요청이 없어요", en: "No sent requests" },
    rq_to_prefix: { ko: "받는 사람:", en: "To:" },
    rq_status_sent: { ko: "안 읽음", en: "Unread" },
    rq_status_read: { ko: "읽음", en: "Read" },
    rq_status_done: { ko: "완료", en: "Done" },
    rq_status_done_now: { ko: "즉시완료됨", en: "Done instantly" },
    rq_status_onething: { ko: "⭐ 원씽으로 처리 중", en: "⭐ Doing as One Thing" },
    rq_to_todo: { ko: "내 할 일로 추가", en: "Add to my todos" },
    rq_added: { ko: "내 할 일에 추가됨", en: "Added to my todos" },
    rq_done: { ko: "즉시완료", en: "Done now" },
    rp_head: { ko: "답장", en: "Reply" },
    rp_to: { ko: "받는 사람: {0}", en: "To: {0}" },
    rp_ph: { ko: "답장 내용을 적어보세요…", en: "Write your reply…" },
    rq_delete: { ko: "삭제", en: "Delete" },
    rq_added_todo: { ko: "할 일에 추가했어요", en: "Added to your todos" },
    rq_reply: { ko: "↩ 답장", en: "↩ Reply" },
    rq_reply_prompt: { ko: "답장을 입력하세요", en: "Enter your reply" },
    rq_replied: { ko: "답장을 보냈어요", en: "Reply sent" },
    rq_reply_new: { ko: "{0}님이 답장했어요", en: "{0} replied" },
    rq_done_new: { ko: "{0}님이 요청을 완료했어요", en: "{0} completed your request" },
    rq_done_now_new: { ko: "{0}님이 요청을 즉시완료했어요", en: "{0} instantly completed your request" },
    rq_newrep: { ko: "새 답장 {0}", en: "{0} new" },
    rq_sel: { ko: "선택 삭제", en: "Select delete" },
    rq_sel_del: { ko: "삭제 ({0})", en: "Delete ({0})" },
    rq_cancel: { ko: "취소", en: "Cancel" },
    rq_delall: { ko: "전체 삭제", en: "Delete all" },
    rq_del_confirm: { ko: "요청 {0}건을 삭제할까요? 내 요청함에서만 사라지고 상대방에게는 남아 있어요.", en: "Delete {0} request(s)? They disappear only from your box." },
    rq_deleted: { ko: "{0}건을 삭제했어요", en: "Deleted {0}" },
    ti_openreq: { ko: "원본 요청 보기", en: "Open original request" },
    rq_gone: { ko: "원본 요청을 찾을 수 없어요(삭제됨)", en: "Original request not found" },
    rq_added_by: { ko: "할 일로 등록됨", en: "Added as to-do" },
    rq_prog_btn: { ko: "진행 상황", en: "Progress" },
    rq_prog_head: { ko: "진행 상황 남기기", en: "Leave progress note" },
    rq_prog_desc: { ko: "완료 전 중간 상태를 보낸 사람에게 알려요. 비우고 저장하면 지워집니다.", en: "Share an interim status with the sender. Save empty to clear." },
    rq_prog_ph: { ko: "예: 자료 절반 수집 완료, 내일 마무리 예정", en: "e.g. half done, finishing tomorrow" },
    rq_prog: { ko: "진행: {0}", en: "Progress: {0}" },
    rq_prog_saved: { ko: "진행 상황을 남겼어요", en: "Progress saved" },
    rq_fwd: { ko: "전달", en: "Forward" },
    rq_fwd_head: { ko: "다른 사람에게 전달", en: "Forward to someone" },
    rq_fwd_desc: { ko: "이 요청의 담당을 넘깁니다. 보낸 사람에게 전달 사실이 표시돼요.", en: "Hand this request over. The sender will see it was forwarded." },
    rq_fwd_done: { ko: "{0}님에게 전달했어요", en: "Forwarded to {0}" },
    rq_fwd_by: { ko: "{0}님이 전달", en: "Forwarded by {0}" },
    rq_search_ph: { ko: "요청 검색(내용·이름)…", en: "Search requests…" },
    rq_due_sum: { ko: "오늘 마감 {0}건 · 지난 마감 {1}건이 있어요", en: "{0} due today · {1} overdue — check your inbox" },
    rq_remind: { ko: "리마인드", en: "Remind" },
    rq_reminded: { ko: "리마인드를 보냈어요", en: "Reminder sent" },
    rq_nudged: { ko: "{0}님이 요청을 리마인드했어요", en: "{0} sent a reminder" },
    rq_overdue: { ko: "지연", en: "Overdue" },
    sr_repeat: { ko: "반복", en: "Repeat" },
    rep_none2: { ko: "없음", en: "None" },
    rep_d: { ko: "매일", en: "Daily" },
    rep_w: { ko: "매주", en: "Weekly" },
    rep_m: { ko: "매월", en: "Monthly" },
    rq_repeat_pill: { ko: "반복 {0}", en: "Repeats {0}" },
    prj_add: { ko: "＋ Project", en: "＋ Project" },
    prj_add_t: { ko: "팀과 공유하는 프로젝트 목록 만들기", en: "Create a shared project list" },
    prj_name_prompt: { ko: "Project 이름을 입력하세요", en: "Project name" },
    prj_del_t: { ko: "Project 삭제(팀 전체에서 삭제됨)", en: "Delete project (for everyone)" },
    prj_del_confirm: { ko: "'{0}' Project를 삭제할까요? 팀 전체에서 사라지며 되돌릴 수 없어요.", en: "Delete project '{0}'? It disappears for everyone." },
    prj_empty: { ko: "팀과 함께 쓰는 목록이에요 — 첫 할 일을 적어보세요", en: "A board your team shares — add the first card" },
    prj_todo_del: { ko: "이 항목을 삭제할까요? (팀 전체에서 삭제)", en: "Delete this card for the whole team?" },
    grp_ctx_t: { ko: "우클릭: 이름 변경 · 드래그: 순서 이동", en: "Right-click: rename · Drag: reorder" },
    prj_owner_only: { ko: "프로젝트를 만든 사람(또는 관리자)만 바꿀 수 있어요", en: "Only the owner (or admin) can change this" },
    prj_members: { ko: "멤버", en: "Members" },
    prj_invite: { ko: "＋ 초대", en: "＋ Invite" },
    prj_invite_head: { ko: "프로젝트에 초대", en: "Invite to project" },
    prj_invite_desc: { ko: "초대한 사람에게만 이 프로젝트 탭이 보여요.", en: "Only invited members can see this project." },
    prj_invited: { ko: "{0}님을 초대했어요", en: "Invited {0}" },
    prj_inv_none: { ko: "초대할 사람이 없어요 — 모두 이미 멤버예요", en: "No one to invite — everyone's already in" },
    prj_member_del_t: { ko: "내보내기", en: "Remove" },
    prj_member_del_confirm: { ko: "'{0}'님을 이 프로젝트에서 내보낼까요?", en: "Remove '{0}' from this project?" },
    kb_todo: { ko: "할 일", en: "To do" },
    kb_doing: { ko: "진행 중", en: "In progress" },
    kb_done: { ko: "완료", en: "Done" },
    kb_take: { ko: "◉ 내 원씽으로", en: "◉ Make it my One Thing" },
    kb_taken: { ko: "내 원씽으로 가져왔어요 — 이제 이것 하나만", en: "Taken as your One Thing — now just this" },
    kb_assign: { ko: "담당", en: "Assign" },
    kb_assign_head: { ko: "담당자 지정", en: "Assign to" },
    kb_unassign: { ko: "담당 없음", en: "Unassigned" },
    kb_anyone: { ko: "담당 없음 — 누구든 가져갈 수 있어요", en: "Unassigned — anyone can take it" },
    kb_due: { ko: "마감", en: "Due" },
    kb_due_head: { ko: "마감일", en: "Due date" },
    kb_reopen: { ko: "되돌리기", en: "Reopen" },
    kb_drop: { ko: "카드를 끌어다 놓기", en: "Drag cards here" },
    ds_btn: { ko: "오늘 요약 쪽지 보내기", en: "Send today's summary" },
    ds_head: { ko: "[오늘 업무 요약] {0}", en: "[Daily summary] {0}" },
    ds_ot: { ko: "완료한 원씽 {0}개", en: "{0} One Thing(s) done" },
    ds_focus: { ko: "집중 시간 {0}", en: "Focus time {0}" },
    ds_req: { ko: "받은 요청 처리 {0}건 · 보낸 요청 {1}건", en: "{0} requests done · {1} sent" },
    adm_h: { ko: "팀 현황 (관리자)", en: "Team (admin)" },
    adm_row: { ko: "이번 주 처리 {0} · 보냄 {1}", en: "done {0} · sent {1} this week" },
    rq_modal_head: { ko: "요청", en: "Requests" },
    rq_tab_inbox: { ko: "받은 요청", en: "Received" },
    rq_tab_sent: { ko: "보낸 요청", en: "Sent" },
    rq_more: { ko: "더 보기 ({0}개 더)", en: "Show {0} more" },
    rq_new: { ko: "🔔 {0}님이 요청을 보냈어요", en: "🔔 {0} sent you a request" },
    rq_inbox_title: { ko: "받은 요청", en: "Inbox" },
    rq_tray_title: { ko: "요청함", en: "Requests" },
    s_on_acct: { ko: "계정 기준으로 자동 동기화 중 — {0}", en: "Auto-syncing by account — {0}" },
    sync_acct_help: { ko: "로그인한 계정 기준으로 자동 동기화됩니다. 같은 계정으로 다른 기기에서 로그인하면 같은 할 일이 보여요.", en: "Auto-syncs by your account. Log in with the same account on another device to see the same todos." },
    acct_migrated: { ko: "기존 할 일을 이 계정으로 가져왔어요", en: "Imported your existing todos into this account" },
    // 상태(프레즌스)
    st_head: { ko: "내 상태", en: "My status" },
    st_focus: { ko: "원씽 중", en: "Focusing" },
    st_focus_d: { ko: "'단 하나'에 집중 — 알림은 조용히 쌓여요", en: "On the one thing — notifications pile up quietly" },
    st_work: { ko: "업무 중", en: "Working" },
    st_work_d: { ko: "요청이 오면 바로 알림을 받아요", en: "Get notified as requests arrive" },
    st_away: { ko: "자리비움", en: "Away" },
    st_away_d: { ko: "자리에 없음 — 알림은 그대로 표시돼요", en: "Not at desk — notifications still show" },
    st_changed: { ko: "상태: {0}", en: "Status: {0}" },
    st_focus_hint: { ko: "지금 '단 하나'에 집중하는 중이에요 — 급하지 않다면 잠시 지켜주세요", en: "Focusing on their one thing — if it can wait, let it wait" },
    st_focus_req: { ko: "원씽을 먼저 정하면 '원씽 중'이 돼요", en: "Pick your One Thing first to go 'Focusing'" },
    st_vacation: { ko: "휴가 중", en: "On vacation" },
    st_vacation_d: { ko: "복귀일과 대리인을 알려요", en: "Shares your return date and deputy with the team" },
    vac_head: { ko: "휴가 설정", en: "Vacation" },
    vac_until: { ko: "복귀일", en: "Return date" },
    vac_deputy: { ko: "대리인(선택)", en: "Deputy (optional)" },
    vac_need_date: { ko: "복귀일을 선택하세요", en: "Pick a return date" },
    vac_deputy_is: { ko: "급하면 {0}님에게", en: "If urgent, ask {0}" },
    // 쪽지 / 업무 요청
    kind_memo: { ko: "쪽지", en: "Memo" },
    kind_task: { ko: "업무 요청", en: "Work request" },
    sr_title_ph: { ko: "제목", en: "Title" },
    sr_need_title: { ko: "제목을 입력하세요", en: "Enter a title" },
    sr_need_body: { ko: "내용을 입력하세요", en: "Enter the content" },
    sr_attach: { ko: "파일 첨부", en: "Attach files" },
    sr_att_limit: { ko: "파일당 1MB · 합계 2MB", en: "1MB per file · 2MB total" },
    sr_att_too_big: { ko: "'{0}' 파일이 너무 커요 (1MB 이하만)", en: "'{0}' is too big (max 1MB)" },
    sr_att_total: { ko: "첨부 합계가 2MB를 넘어요", en: "Attachments exceed 2MB total" },
    rq_flush: { ko: "집중하는 동안 요청 {0}건이 도착했어요", en: "{0} request(s) arrived while you were focusing" },
    st_until: { ko: "약 {0}분 후 종료 예정", en: "ends in ~{0} min" },
    sr_due: { ko: "마감일", en: "Due" },
    rq_due: { ko: "마감 {0}", en: "due {0}" },
    set_shareot: { ko: "오늘의 원씽을 팀에 공개", en: "Share today's One Thing with team" },
    tb_me: { ko: "나", en: "me" },
    sp_title: { ko: "팀 현황", en: "Team" },
    sp_search_ph: { ko: "이름 검색…", en: "Search names…" },
    sp_sum: { ko: "{0}명", en: "{0} members" },
    sp_pin_t: { ko: "사이드바 고정", en: "Pin sidebar" },
    sp_pin_on_t: { ko: "고정됨 — 요청을 보내도 패널이 열려 있어요 (클릭해 해제)", en: "Pinned — stays open while you work (click to unpin)" },
    sp_pin_off_t: { ko: "고정 안 됨 — 사람을 클릭해 요청을 보내면 패널이 닫혀요 (클릭해 고정)", en: "Unpinned — closes when you message someone (click to pin)" },
    sp_pinned: { ko: "사이드바 고정 — 요청을 보내도 열려 있어요", en: "Sidebar pinned — stays open" },
    sp_unpinned: { ko: "고정 해제 — 요청을 보내면 자동으로 닫혀요", en: "Unpinned — closes after you message someone" },
    sp_share: { ko: "초대 공유하기", en: "Share invite" },
    sp_share_copy: { ko: "초대 링크 복사", en: "Copy invite link" },
    sp_share_msg: { ko: "{0}님이 The One Thing \"{1}\" 팀에 초대했어요. 아래 링크를 열고 가입하면 바로 합류됩니다 → {2}", en: "{0} invited you to \"{1}\" on The One Thing. Open the link and sign up to join → {2}" },
    iv_banner: { ko: "🎉 팀에 초대받았어요 — 가입하거나 로그인하면 바로 참여됩니다", en: "🎉 You've been invited — sign up or log in to join" },
    iv_join_q: { ko: "\"{0}\" 팀에 참여할까요?", en: "Join the team \"{0}\"?" },
    iv_switch_q: { ko: "지금 소속된 팀에서 나와 \"{0}\"(으)로 옮깁니다. 계속할까요?", en: "You will leave your current team and move to \"{0}\". Continue?" },
    iv_joined: { ko: "\"{0}\" 팀에 합류했어요! 🎉", en: "You joined \"{0}\"! 🎉" },
    sp_need_ot: { ko: "먼저 오늘의 원씽을 정해주세요 — 할 일에서 ◉를 누르면 원씽 중이 돼요", en: "Set your One Thing first — press ◉ on a task" },
    sp_alone: { ko: "아직 혼자예요", en: "It's just you so far" },
    sp_alone_d: { ko: "이 초대 코드를 동료에게 보내면, 서로의 원씽과 요청이 여기에 나타나요.", en: "Share this invite code — teammates will appear here." },
    sp_alone_member: { ko: "관리자에게 동료 초대를 요청해보세요.", en: "Ask your admin to invite teammates." },
    sp_copy: { ko: "복사", en: "Copy" },
    sp_copied: { ko: "초대 안내를 복사했어요 — 동료에게 붙여넣기 하세요", en: "Invite message copied — paste it to a teammate" },
    sp_invite_msg: { ko: "The One Thing에서 함께 일해요! 1) https://nadoodugui-spec.github.io/onething/ 접속해 가입 2) 사용자 메뉴에서 초대 코드 입력: {0}", en: "Join me on The One Thing! 1) Sign up at https://nadoodugui-spec.github.io/onething/ 2) Enter invite code: {0}" },
    sp_feed_h: { ko: "최근 활동", en: "Recent activity" },
    fd_del: { ko: "이 활동 지우기(내 화면에서만)", en: "Dismiss (only for me)" },
    set_teamfeed: { ko: "팀 최근 활동 표시(사이드바)", en: "Show team activity (sidebar)" },
    ago_now: { ko: "방금", en: "just now" },
    ago_min: { ko: "{0}분 전", en: "{0}m ago" },
    ago_hr: { ko: "{0}시간 전", en: "{0}h ago" },
    ago_day: { ko: "{0}일 전", en: "{0}d ago" },
    fd_sent: { ko: "{0} → {1} 요청", en: "{0} → {1} request" },
    fd_done: { ko: "{0}님이 요청 완료", en: "{0} completed a request" },
    fd_reply: { ko: "{0}님이 답장", en: "{0} replied" },
    sr_tpl: { ko: "템플릿", en: "Template" },
    sr_tpl_none: { ko: "템플릿 선택…", en: "Choose template…" },
    sr_tpl_save: { ko: "현재 내용 템플릿으로 저장", en: "Save current as template" },
    sr_tpl_del: { ko: "삭제", en: "Delete" },
    sr_tpl_name: { ko: "템플릿 이름을 입력하세요", en: "Template name" },
    sr_tpl_saved: { ko: "템플릿을 저장했어요", en: "Template saved" },
    sr_tpl_need: { ko: "저장할 제목/내용을 먼저 적어주세요", en: "Write a title/body first" },
    sr_pick_to: { ko: "받는 사람을 선택하세요", en: "Pick a recipient" },
    sr_hint: { ko: "<kbd>Ctrl+Enter</kbd> 보내기", en: "<kbd>Ctrl+Enter</kbd> Send" },
    wk_sum_h: { ko: "이번 주 업무 요약", en: "This week's summary" },
    wk_ot: { ko: "원씽 완료", en: "One Things done" },
    wk_focus: { ko: "집중 시간", en: "Focus time" },
    wk_reqdone: { ko: "받은 요청 처리", en: "Requests done" },
    wk_reqsent: { ko: "보낸 요청", en: "Requests sent" },
    wk_story: { ko: "이번 주 도미노 {0}개를 넘어뜨렸고, {1}을 '단 하나'에 썼습니다.", en: "This week you toppled {0} dominoes and spent {1} on the one thing." },
    wk_guard: { ko: "집중하는 동안 알림 {0}건이 조용히 기다렸습니다 — 지켜진 집중이에요.", en: "{0} notifications waited quietly while you focused — protected focus." },
    cmd_ph: { ko: "전체 검색 — 할 일 · 요청 · 프로젝트 (Ctrl+K)", en: "Search everything — todos · requests · projects (Ctrl+K)" },
    set_backup_open: { ko: "백업 열기", en: "Open backup" },
    bk_all: { ko: "전체 백업 — 팀 데이터 포함 (관리자)", en: "Full backup — team data (admin)" },
    bk_scope: { ko: "일반 백업에는 내 할 일만 담겨요. 요청·프로젝트까지 담으려면 전체 백업(관리자)을 사용하세요.", en: "Regular backup covers only your to-dos. Use full backup (admin) for requests & projects." },
    pin_reset: { ko: "PIN 재설정", en: "Reset PIN" },
    pin_new_prompt: { ko: "{0}님의 새 4자리 PIN을 입력하세요", en: "New 4-digit PIN for {0}" },
    pin_reset_done: { ko: "PIN을 재설정했어요", en: "PIN has been reset" },
    break_btn: { ko: "휴식 5분", en: "Break 5m" },
    break_t: { ko: "5분 휴식 후 다시 집중", en: "5-minute break, then refocus" },
    break_started: { ko: "휴식 시작 — 5분 뒤에 알려드릴게요", en: "Break started — I'll ping you in 5 minutes" },
    break_done: { ko: "휴식 끝 — 다시 단 하나로 돌아갈 시간이에요", en: "Break's over — back to your one thing" },
    cmd_todos: { ko: "할 일", en: "To-dos" },
    cmd_reqs: { ko: "요청", en: "Requests" },
    cmd_prj: { ko: "프로젝트", en: "Projects" },
    br_h: { ko: "오늘의 단 하나 후보", en: "Candidates for today's one thing" },
    br_req: { ko: "받은 요청 · 마감", en: "Request · due" },
    br_todo: { ko: "내 할 일", en: "My to-do" },
    br_prj: { ko: "프로젝트 · {0}", en: "Project · {0}" },
    domino_note: { ko: "작은 하나가 다음 것을 넘어뜨립니다", en: "Each one topples the next" },
    hm_h: { ko: "최근 12주 실천", en: "Last 12 weeks" },
    card_desc: { ko: "설명", en: "Description" },
    card_desc_ph: { ko: "이 카드에 대한 배경·기준을 적어두세요…", en: "Add context or acceptance criteria…" },
    card_cmts: { ko: "댓글", en: "Comments" },
    card_cmt_ph: { ko: "댓글을 남기세요… (Enter)", en: "Leave a comment… (Enter)" },
    card_no_cmt: { ko: "아직 댓글이 없어요", en: "No comments yet" },
    card_by: { ko: "작성 {0}", en: "by {0}" },
    tour_prev: { ko: "이전", en: "Back" },
    tour_next: { ko: "다음", en: "Next" },
    tour_start: { ko: "시작하기", en: "Get started" },
    tour_t1: { ko: "모든 게 급하다고 말하는 시대,<br><b>성과는 '단 하나'에서 나옵니다</b>", en: "When everything feels urgent,<br><b>results come from one thing</b>" },
    tour_b1: { ko: "The One Thing은 가장 중요한 하나를 정하고,<br>끝날 때까지 지키게 하는 팀 도구예요.", en: "The One Thing helps you pick the most important thing<br>and protect it until it's done." },
    tour_t2: { ko: "할 일을 모으고,<br><b>단 하나를 ◉로 보내세요</b>", en: "Collect to-dos,<br><b>send one with ◉</b>" },
    tour_b2: { ko: "그 하나가 화면의 주인공이 되고, 나머지 할 일은 끝날 때까지 잠깁니다. 완료하면 도미노가 하나 넘어가요.", en: "That one becomes the star of your screen — the rest locks until it's done." },
    tour_t3: { ko: "동료의 집중은<br><b>팀이 함께 지킵니다</b>", en: "Focus is<br><b>protected by the team</b>" },
    ws_h: { ko: "워크스페이스", en: "Workspace" },
    ws_current: { ko: "소속: {0}", en: "Workspace: {0}" },
    ws_code: { ko: "초대 코드: {0} — 동료에게 알려주세요", en: "Invite code: {0} — share with teammates" },
    ws_none: { ko: "아직 소속이 없어요. 팀 기능(쪽지·업무 요청·프로젝트·팀 현황)은 워크스페이스에 참여하면 열립니다. 개인 할 일·원씽은 그대로 쓸 수 있어요.", en: "No workspace yet. Team features unlock when you join one — personal to-dos work as-is." },
    ws_join_ph: { ko: "초대 코드 6자리", en: "6-digit invite code" },
    ws_name_ph: { ko: "새 워크스페이스(회사) 이름", en: "New workspace name" },
    ws_join: { ko: "참여", en: "Join" },
    ws_create: { ko: "만들기", en: "Create" },
    ws_created: { ko: "'{0}' 워크스페이스가 만들어졌어요!\n초대 코드: {1}\n동료에게 이 코드를 알려주세요. (사용자 메뉴에서 다시 볼 수 있어요)", en: "Workspace '{0}' created!\nInvite code: {1}" },
    ws_bad_code: { ko: "초대 코드를 찾을 수 없어요", en: "Invite code not found" },
    ws_err: { ko: "실패했어요 — 인터넷 연결을 확인하세요", en: "Failed — check your connection" },
    tour_b3: { ko: "쪽지·업무 요청으로 일을 주고받고,<br>상대가 '원씽 중'이면 알림은 조용히 기다립니다.<br>급하지 않은 일은 기다려주세요.", en: "Send memos and work requests —<br>while someone is focusing, alerts wait quietly." },
    // 할 일 폴더 / 관리자
    grp_add: { ko: "＋ List", en: "＋ List" },
    grp_add_t: { ko: "새 List(독립된 할 일 목록) 만들기", en: "Create a new list" },
    grp_main: { ko: "Inbox", en: "Inbox" },
    grp_name_prompt: { ko: "List 이름을 입력하세요", en: "List name" },
    grp_rename_t: { ko: "더블클릭하면 이름 변경", en: "Double-click to rename" },
    grp_del_t: { ko: "List 삭제(할 일은 Inbox로 이동)", en: "Delete list (to-dos move to Inbox)" },
    grp_del_confirm: { ko: "'{0}' List를 삭제할까요? 안의 할 일은 Inbox로 이동합니다.", en: "Delete list '{0}'? Its to-dos move to Inbox." },
    um_members: { ko: "구성원 관리 (관리자)", en: "Members (admin)" },
    um_del: { ko: "삭제", en: "Delete" },
    um_del_confirm: { ko: "'{0}' 사용자를 삭제할까요? 로그인 계정과 상태 정보가 삭제됩니다. (되돌릴 수 없음)", en: "Delete user '{0}'? Their account and status will be removed. (Cannot be undone)" },
    um_deleted: { ko: "사용자를 삭제했어요", en: "User deleted" },
    set_sharefocus: { ko: "원씽 중일 때 남은 시간 공개", en: "Share remaining focus time" }
  };
  function t(key) {
    const e = I18N[key]; let s = e ? (e[LANG] || e.ko) : key;
    for (let i = 1; i < arguments.length; i++) s = s.split("{" + (i - 1) + "}").join(arguments[i]);
    return s;
  }

  // ---------- date utils ----------
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function dstr(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function todayStr() { return dstr(new Date()); }
  function parseDate(s) { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDaysStr(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return dstr(d); }
  const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];
  const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dowLabel(i) { return (LANG === "en" ? DOW_EN : DOW_KO)[i]; }
  function fmtNice(s) {
    const d = parseDate(s);
    if (LANG === "en") return MON_EN[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " (" + DOW_EN[d.getDay()] + ")";
    return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate() + ". (" + DOW_KO[d.getDay()] + ")";
  }
  function fmtDur(sec) {
    sec = sec || 0;
    if (LANG === "en") { if (sec < 60) return sec + "s"; const m = Math.round(sec / 60); if (m < 60) return m + "m"; return Math.floor(m / 60) + "h " + (m % 60) + "m"; }
    if (sec < 60) return sec + "초"; const m = Math.round(sec / 60); if (m < 60) return m + "분"; return Math.floor(m / 60) + "시간 " + (m % 60) + "분";
  }
  function fmtMMSS(sec) { sec = Math.max(0, sec | 0); return pad2(Math.floor(sec / 60)) + ":" + pad2(sec % 60); }

  // ---------- state & migration ----------
  function migrate(s) {
    const base = { version: 2, todos: [], history: [], trash: [],
      settings: { theme: "auto", pomodoroMin: 25, reminder: false, lang: "ko", shareFocusTime: true, shareOneThing: false },
      doneCollapsed: true, laterCollapsed: true,
      prioCollapsed: { urgent: false, important: false, normal: false }, lastReminderDate: null };
    if (!s || typeof s !== "object") return base;
    const out = Object.assign({}, base, s);
    if (!s.doneCollapsedV2) { out.doneCollapsed = true; out.doneCollapsedV2 = true; }   // 기본 접힘으로 1회 전환
    out.settings = Object.assign({}, base.settings, s.settings || {});
    out.prioCollapsed = Object.assign({}, base.prioCollapsed, s.prioCollapsed || {});
    out.todos = Array.isArray(s.todos) ? s.todos.map((t) => ({
      id: t.id || uid(), text: t.text || "", color: t.color || null, due: t.due || null,
      priority: (t.priority === "urgent" || t.priority === "important") ? t.priority : "normal",
      subtasks: Array.isArray(t.subtasks) ? t.subtasks : [], repeat: t.repeat || null,
      later: !!t.later, status: (t.status === "active" || t.status === "done") ? t.status : "todo",
      reqId: t.reqId || null, group: t.group || null, prjRef: t.prjRef || null,
      activatedAt: t.activatedAt || null, focusSec: t.focusSec || 0,
      createdAt: t.createdAt || Date.now(), completedAt: t.completedAt || null
    })) : [];
    out.history = Array.isArray(s.history) ? s.history.map((h) => ({
      id: h.id || uid(), text: h.text || "", date: h.date || todayStr(),
      completedAt: h.completedAt || null, focusSec: h.focusSec || 0, note: h.note || ""
    })) : [];
    out.trash = Array.isArray(s.trash) ? s.trash : [];
    out.groups = Array.isArray(s.groups) ? s.groups.map((g) => ({ id: g.id || uid(), name: g.name || "?", collapsed: !!g.collapsed })) : [];
    out.tabOrder = Array.isArray(s.tabOrder) ? s.tabOrder : [];
    out.guarded = (s.guarded && typeof s.guarded === "object") ? s.guarded : {};
    out.version = 2;
    return out;
  }
  let currentUser = null;   // 로그인 계정 (notebookKey가 참조 — loadState보다 먼저 선언해야 함)
  function notebookKey() { return currentUser ? "onething-notebook::" + currentUser.id : STORAGE_KEY; }
  function loadState() {
    try { const raw = localStorage.getItem(notebookKey()); return migrate(raw ? JSON.parse(raw) : null); }
    catch (e) { return migrate(null); }
  }
  let state = loadState();
  let viewDate = todayStr();
  let searchQuery = "";
  const expanded = new Set();

  function save() {
    try { localStorage.setItem(notebookKey(), JSON.stringify(state)); } catch (e) {}
    pushCloud();
  }

  // ---------- helpers ----------
  let currentGroup = null;   // 현재 보고 있는 폴더 id (null = 메인 목록)
  function inCurrentGroup(t) {
    const groupIds = new Set((state.groups || []).map((g) => g.id));
    const g = t.group && groupIds.has(t.group) ? t.group : null;   // 없는 폴더 소속은 메인 취급
    return g === currentGroup;
  }
  function activeTodo() { return state.todos.find((t) => t.status === "active") || null; }
  function visibleTodos() {
    const q = searchQuery.trim().toLowerCase();
    return state.todos.filter((t) => t.status !== "done" && !t.later && inCurrentGroup(t) &&
      (!q || (t.text || "").toLowerCase().includes(q)));
  }
  function doneTodos() { return state.todos.filter((t) => t.status === "done" && inCurrentGroup(t)); }
  function laterTodos() { return state.todos.filter((t) => t.later && t.status !== "done" && inCurrentGroup(t)); }

  let toastTimer = null;
  function toast(msg) {
    const el = $id("toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  // 실행 취소 가능한 토스트 (6초)
  let undoFn = null;
  function toastUndo(msg, fn) {
    const el = $id("toast"); el.textContent = msg + " ";
    const b = document.createElement("button");
    b.textContent = t("undo_btn");
    b.style.cssText = "margin-left:8px;border:none;background:transparent;color:#a9c0ff;font-weight:700;cursor:pointer;font-family:inherit;font-size:inherit;text-decoration:underline";
    b.addEventListener("click", () => { if (undoFn) { const f = undoFn; undoFn = null; f(); } el.classList.remove("show"); });
    el.appendChild(b); el.classList.add("show");
    undoFn = fn;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove("show"); undoFn = null; }, 6000);
  }

  // ---------- actions ----------
  function addTodo(text, opts) {
    text = (text || "").trim(); if (!text) return;
    state.todos.push({ id: uid(), text, color: null, priority: (opts && opts.priority) || "normal", due: (opts && opts.due) || null, subtasks: [], repeat: null,
      later: false, status: "todo", activatedAt: null, focusSec: 0, createdAt: Date.now(), completedAt: null,
      reqId: (opts && opts.reqId) || null, group: (opts && opts.group !== undefined) ? opts.group : currentGroup,
      prjRef: (opts && opts.prjRef) || null });
    save(); render();
  }
  function sendToOneThing(id) {
    const td = state.todos.find((x) => x.id === id); if (!td || td.status === "done") return;
    viewDate = todayStr();
    const cur = activeTodo(); if (cur && cur.id === id) return;
    if (cur) cur.status = "todo";
    td.status = "active"; td.activatedAt = Date.now();
    // 요청에서 온 할 일이면 보낸 사람에게 '원씽으로 처리 중' 표시
    if (td.reqId && msgDb && requestsCache[td.reqId] && requestsCache[td.reqId].status !== "done") {
      try { wsRef("requests/" + td.reqId + "/status").set("onething"); } catch (_) {}
    }
    state.todos = [td, ...state.todos.filter((x) => x.id !== td.id)];
    leftUnlocked = false; resetTimer(true);
    save(); render(); syncFocusPresence();
    toast(cur ? t("swap_done") : t("sent_done"));
  }
  function putBack(id) {
    const td = state.todos.find((x) => x.id === id); if (!td) return;
    // 원씽에서 내려놓으면 '원씽으로 처리 중' 표시 해제
    if (td.reqId && msgDb && requestsCache[td.reqId] && requestsCache[td.reqId].status === "onething") {
      try { wsRef("requests/" + td.reqId + "/status").set("read"); } catch (_) {}
    }
    td.status = "todo"; pauseTimer(); save(); render(); syncFocusPresence(); toast(t("putback_done"));
  }
  function completeTodo(id) {
    const t = state.todos.find((x) => x.id === id); if (!t || t.status === "done") return;
    const wasActive = t.status === "active";
    if (wasActive) {
      state.history.push({ id: uid(), text: t.text, date: todayStr(), completedAt: Date.now(), focusSec: t.focusSec || 0, note: "" });
      pauseTimer();
    }
    if (t.repeat) {
      state.todos.push({ id: uid(), text: t.text, color: t.color, priority: t.priority || "normal", due: null,
        subtasks: (t.subtasks || []).map((s) => ({ id: uid(), text: s.text, done: false })),
        repeat: t.repeat, later: false, status: "todo", activatedAt: null, focusSec: 0,
        createdAt: Date.now(), completedAt: null });
    }
    t.status = "done"; t.completedAt = Date.now();
    // 요청에서 온 할 일이면 보낸 사람에게 '완료됨' 자동 전달
    if (t.reqId && msgDb && requestsCache[t.reqId]) {
      try { wsRef("requests/" + t.reqId).update({ status: "done", doneAt: Date.now() }); } catch (_) {}
    }
    // 프로젝트 보드에서 가져온 원씽이면 카드도 '완료' 열로
    if (t.prjRef && msgDb) {
      try { wsRef("projectTodos/" + t.prjRef.pid + "/" + t.prjRef.tid).update({ status: "done", done: true, doneBy: currentUser ? currentUser.name : "", doneAt: Date.now() }); } catch (_) {}
    }
    save(); render();
    if (wasActive) { syncFocusPresence(); celebrate(); toast(pickCheer()); }
  }
  function restoreTodo(id) { const t = state.todos.find((x) => x.id === id); if (!t) return; t.status = "todo"; t.completedAt = null; save(); render(); }
  function deleteTodo(id) {
    const i = state.todos.findIndex((x) => x.id === id); if (i < 0) return;
    const t = state.todos[i]; if (t.status === "active") pauseTimer();
    state.trash.unshift(Object.assign({}, t, { deletedAt: Date.now() }));
    state.todos.splice(i, 1); save(); render();
  }
  function deleteHistory(id) { const i = state.history.findIndex((h) => h.id === id); if (i >= 0) state.history.splice(i, 1); save(); render(); }
  function editText(kind, id, v) {
    v = (v || "").trim();
    if (kind === "todo") { const t = state.todos.find((x) => x.id === id); if (!t) return; if (!v) { deleteTodo(id); return; } t.text = v; }
    else if (kind === "history") { const h = state.history.find((x) => x.id === id); if (!h || !v) return; h.text = v; }
    save(); render();
  }
  function setDue(id, v) { const t = state.todos.find((x) => x.id === id); if (!t) return; t.due = v || null; save(); render(); }
  function cycleRepeat(id) { const t = state.todos.find((x) => x.id === id); if (!t) return; t.repeat = t.repeat === null ? "daily" : t.repeat === "daily" ? "weekly" : null; save(); render(); }
  function toggleLater(id) { const t = state.todos.find((x) => x.id === id); if (!t) return; if (t.status === "active") { t.status = "todo"; pauseTimer(); } t.later = !t.later; save(); render(); }
  function addSub(id, text) { text = (text || "").trim(); if (!text) return; const t = state.todos.find((x) => x.id === id); if (!t) return; t.subtasks.push({ id: uid(), text, done: false }); save(); render(); }
  function toggleSub(id, sid) { const t = state.todos.find((x) => x.id === id); if (!t) return; const s = t.subtasks.find((x) => x.id === sid); if (s) s.done = !s.done; save(); render(); }
  function delSub(id, sid) { const t = state.todos.find((x) => x.id === id); if (!t) return; t.subtasks = t.subtasks.filter((x) => x.id !== sid); save(); render(); }

  function restoreTrash(id) { const i = state.trash.findIndex((x) => x.id === id); if (i < 0) return; const t = state.trash[i]; delete t.deletedAt; t.status = t.status === "active" || t.status === "done" ? "todo" : (t.status || "todo"); state.trash.splice(i, 1); state.todos.push(t); save(); render(); openTrash(); }
  function purgeTrash(id) { state.trash = state.trash.filter((x) => x.id !== id); save(); render(); openTrash(); }
  function emptyTrash() { if (!state.trash.length) return; if (!confirm(t("confirm_empty"))) return; state.trash = []; save(); render(); openTrash(); }

  // ---------- drag reorder ----------
  let dragId = null;
  function reorder(draggedId, targetId, after, destPriority, destGroup) {
    const dragged = state.todos.find((t) => t.id === draggedId); if (!dragged) return;
    if (destPriority) dragged.priority = destPriority;
    if (destGroup !== undefined) dragged.group = destGroup;   // null = 폴더 밖으로
    const vis = visibleTodos().map((t) => t.id);
    const from = vis.indexOf(draggedId); if (from < 0) return;
    vis.splice(from, 1);
    let to = targetId == null ? vis.length : vis.indexOf(targetId);
    if (to < 0) to = vis.length; if (after) to += 1;
    vis.splice(to, 0, draggedId);
    const map = Object.fromEntries(state.todos.map((t) => [t.id, t]));
    const others = state.todos.filter((t) => vis.indexOf(t.id) < 0);
    state.todos = vis.map((id) => map[id]).concat(others);
    save(); render();
  }

  // ---------- timer ----------
  let timerRunning = false, timerRemaining = 0, timerIv = null;
  function pomoSec() { return (state.settings.pomodoroMin || 25) * 60; }
  function resetTimer(silent) { pauseTimer(); timerRemaining = pomoSec(); if (!silent) updateTimerUI(); }
  let breakIv = null, breakRemaining = 0;
  function startBreak() {   // 집중 사이클: 5분 휴식
    pauseTimer();
    if (breakIv) clearInterval(breakIv);
    breakRemaining = 300;
    const d0 = $id("timeDisp"); if (d0) d0.textContent = fmtMMSS(breakRemaining);
    breakIv = setInterval(() => {
      breakRemaining--;
      const d = $id("timeDisp"); if (d) d.textContent = fmtMMSS(breakRemaining);
      if (breakRemaining <= 0) { clearInterval(breakIv); breakIv = null; beep(); toast(t("break_done")); resetTimer(); }
    }, 1000);
    toast(t("break_started"));
  }
  function startTimer() {
    const a = activeTodo(); if (!a) return;
    if (breakIv) { clearInterval(breakIv); breakIv = null; }   // 휴식 중이면 종료
    if (timerRemaining <= 0) timerRemaining = pomoSec();
    timerRunning = true; requestNotify();
    if (myStatus() !== "focus") beforeFocusStatus = myStatus();
    currentFocusUntil = Date.now() + timerRemaining * 1000;
    setMyStatus("focus", { auto: true, until: currentFocusUntil });
    if (timerIv) clearInterval(timerIv);
    timerIv = setInterval(() => {
      if (!timerRunning) return; const act = activeTodo(); if (!act) { pauseTimer(); return; }
      timerRemaining--; act.focusSec = (act.focusSec || 0) + 1;
      if (act.focusSec % 15 === 0) { try { localStorage.setItem(notebookKey(), JSON.stringify(state)); } catch (e) {} pushCloud(); }
      updateTimerUI();
      if (timerRemaining <= 0) { pauseTimer(); save(); alarmDone(); }
    }, 1000);
    updateTimerUI();
  }
  function pauseTimer() {
    const wasRunning = timerRunning;
    timerRunning = false; if (timerIv) { clearInterval(timerIv); timerIv = null; } updateTimerUI();
    // 타이머 종료: 남은 시간 공유만 해제 — 원씽이 남아 있으면 '원씽 중' 유지 (B안)
    if (wasRunning) { currentFocusUntil = null; syncFocusPresence(); }
  }
  function toggleTimer() { if (timerRunning) pauseTimer(); else startTimer(); }
  function updateTimerUI() {
    const disp = $id("timeDisp"); if (disp) disp.textContent = fmtMMSS(timerRemaining > 0 ? timerRemaining : pomoSec());
    const btn = $id("timerToggle"); if (btn) btn.textContent = timerRunning ? t("timer_pause") : t("timer_start");
    const acc = $id("focusAcc"); const a = activeTodo(); if (acc && a) acc.textContent = t("focus_acc", fmtDur(a.focusSec || 0));
  }
  function requestNotify() {
    try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
  }
  function beep() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const a = new AC();
      const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination);
      o.type = "sine"; o.frequency.value = 880; o.start();
      g.gain.setValueAtTime(0.18, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.7);
      o.stop(a.currentTime + 0.72);
    } catch (e) {}
  }
  function alarmDone() {
    const a = activeTodo(); const name = a ? a.text : t("onething_word");
    beep();
    try { if (window.Notification && Notification.permission === "granted") new Notification(t("alarm_title"), { body: t("alarm_body", name) }); } catch (e) {}
    toast(t("alarm_toast"));
  }

  // ---------- celebrate ----------
  function pickCheer() { return t("cheer" + Math.floor(Math.random() * 5)); }
  function celebrate() {
    const c = $id("confetti"); if (!c) return; const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight; c.style.display = "block";
    const colors = ["#c2603f", "#e6b54a", "#5b8a72", "#cf9b39", "#d98b6a", "#7aa6d8"];
    const parts = [];
    for (let i = 0; i < 130; i++) parts.push({
      x: window.innerWidth / 2 + (Math.random() * 200 - 100), y: window.innerHeight / 3,
      vx: (Math.random() * 2 - 1) * 7, vy: (Math.random() * -1 - 2) * 5,
      g: 0.18 + Math.random() * 0.12, s: 5 + Math.random() * 6,
      col: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * 6, vr: (Math.random() * 2 - 1) * 0.3
    });
    let frame = 0;
    function tick() {
      frame++; ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
      });
      if (frame < 90) requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, c.width, c.height); c.style.display = "none"; }
    }
    requestAnimationFrame(tick);
  }

  // ---------- focus lock: 3초 길게 누르기 해제 (의도적 마찰 — 장난기 없이 번거롭게) ----------
  let leftUnlocked = false;
  function onSolved() {
    $id("puzzleStatus").textContent = t("solved_status");
    setTimeout(() => { $id("puzzleModal").hidden = true; leftUnlocked = true; render(); toast(t("solved_toast")); }, 400);
  }
  function openPuzzle() {
    $id("puzzleTitle").textContent = t("hold_t");
    $id("puzzleDesc").textContent = t("hold_d");
    const stage = $id("puzzleStage"), status = $id("puzzleStatus");
    stage.innerHTML = ""; status.textContent = "";
    stage.style.height = "auto"; stage.style.background = "transparent"; stage.style.border = "none";
    const wrap = document.createElement("div"); wrap.className = "hold-wrap";
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "hold-btn";
    btn.innerHTML = '<span class="hold-fill"></span><span class="hold-label">' + t("hold_btn") + "</span>";
    wrap.append(btn); stage.append(wrap);
    const fill = btn.querySelector(".hold-fill");
    const DUR = 3000; let timer = null, start = 0, raf = null, done = false;
    function tick() {
      const p = Math.min(1, (Date.now() - start) / DUR);
      fill.style.width = (p * 100) + "%";
      status.textContent = p < 1 ? Math.ceil((DUR - (Date.now() - start)) / 1000) + t("hold_sec") : "";
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    function begin(e) { if (done) return; e.preventDefault(); start = Date.now(); btn.classList.add("holding"); tick(); timer = setTimeout(() => { done = true; onSolved(); }, DUR); }
    function cancel() { if (done) return; clearTimeout(timer); cancelAnimationFrame(raf); btn.classList.remove("holding"); fill.style.width = "0"; status.textContent = t("hold_cancel"); }
    btn.addEventListener("pointerdown", begin);
    btn.addEventListener("pointerup", cancel);
    btn.addEventListener("pointerleave", cancel);
    btn.addEventListener("pointercancel", cancel);
    $id("puzzleModal").hidden = false;
  }

  // ---------- editable ----------
  function makeEditable(el, kind, id) {
    el.addEventListener("dblclick", () => {
      const old = el.textContent; const input = document.createElement("input");
      input.type = "text"; input.value = old; input.style.cssText = "font:inherit;width:100%;border:none;border-bottom:2px solid var(--accent);background:transparent;color:inherit;outline:none";
      el.replaceWith(input); input.focus(); input.setSelectionRange(old.length, old.length);
      input.addEventListener("blur", () => editText(kind, id, input.value));
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); input.blur(); } if (e.key === "Escape") { input.value = old; input.blur(); } });
    });
  }

  // ---------- render ----------
  const PRIO_GROUPS = ["urgent", "important", "normal"];
  // 빈 원씽 자리 일러스트 — 단 하나를 비추는 전등
  const EMPTY_OT_SVG = '<svg class="ot-lamp" width="132" height="118" viewBox="0 0 132 118" fill="none" aria-hidden="true">'
    + '<line x1="66" y1="2" x2="66" y2="20" stroke="var(--border)" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M49 36c0-9.4 7.6-17 17-17s17 7.6 17 17H49z" fill="var(--surface-2)" stroke="var(--text-soft)" stroke-width="1.5" stroke-linejoin="round"/>'
    + '<circle cx="66" cy="40" r="5" fill="#f2c14e"/>'
    + '<path d="M66 44L38 96h56L66 44z" fill="var(--accent-soft)" opacity=".6"/>'
    + '<rect x="44" y="94" width="44" height="12" rx="6" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5"/>'
    + '<circle cx="53" cy="100" r="2.6" fill="var(--accent)"/>'
    + '<line x1="60" y1="100" x2="80" y2="100" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" opacity=".5"/>'
    + '</svg>';
  function buildTodoLi(td, cur) {
    const li = document.createElement("li");
    li.className = "todo prio-" + (td.priority || "normal") + (td.status === "active" ? " active" : "");
    li.dataset.id = td.id; li.draggable = true;
    const grip = document.createElement("span"); grip.className = "grip"; grip.textContent = "⠿";
    const check = document.createElement("button"); check.className = "check"; check.title = t("ti_done"); check.addEventListener("click", () => completeTodo(td.id));
    const text = document.createElement("span"); text.className = "todo-text"; text.textContent = td.text; text.title = t("ti_edit"); makeEditable(text, "todo", td.id);
    li.append(grip, check, text);
    if (td.due) { const c = document.createElement("span"); const today = todayStr(); c.className = "chip" + (td.due < today ? " due-over" : td.due === today ? " due-soon" : ""); c.textContent = td.due.slice(5); li.append(c); }
    if (td.repeat) { const c = document.createElement("span"); c.className = "chip"; c.textContent = td.repeat === "daily" ? t("rep_daily") : t("rep_weekly"); li.append(c); }
    if (td.subtasks && td.subtasks.length) { const d = td.subtasks.filter((s) => s.done).length; const c = document.createElement("span"); c.className = "chip"; c.textContent = "☑ " + d + "/" + td.subtasks.length; li.append(c); }
    if (td.status === "active") {
      const b = document.createElement("span"); b.className = "badge"; b.textContent = t("badge_prog"); li.append(b);
      const cx = document.createElement("button"); cx.className = "row-x ot-cancel"; cx.textContent = "✕"; cx.title = t("ot_cancel_t");
      cx.addEventListener("click", () => putBack(td.id));
      li.append(cx);
    }
    else { const s = document.createElement("button"); s.className = "send-btn"; s.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>'; s.title = cur ? t("send_swap") : t("send_to"); s.addEventListener("click", () => sendToOneThing(td.id)); li.append(s); }
    if (td.reqId) {   // 요청에서 온 할 일 — 원본 요청 열기
      const rq = document.createElement("button"); rq.className = "more-btn req-link"; rq.title = t("ti_openreq");
      rq.innerHTML = '<svg class="icon" style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
      rq.addEventListener("click", () => openRequestById(td.reqId));
      li.append(rq);
    }
    const more = document.createElement("button"); more.className = "more-btn"; more.textContent = "⋯"; more.title = t("ti_more"); more.addEventListener("click", () => { if (expanded.has(td.id)) expanded.delete(td.id); else expanded.add(td.id); render(); }); li.append(more);
    if (expanded.has(td.id)) li.append(buildDetail(td));
    li.addEventListener("dragstart", (e) => { dragId = td.id; li.classList.add("dragging"); document.body.classList.add("dragging-todo"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", td.id); } catch (_) {} });
    li.addEventListener("dragend", () => { dragId = null; li.classList.remove("dragging"); document.body.classList.remove("dragging-todo"); document.querySelectorAll(".drop-before, .drop-into, .ot-drop").forEach((n) => n.classList.remove("drop-before", "drop-into", "ot-drop")); });
    li.addEventListener("dragover", (e) => { e.preventDefault(); e.stopPropagation(); if (dragId && dragId !== td.id) li.classList.add("drop-before"); });
    li.addEventListener("dragleave", () => li.classList.remove("drop-before"));
    li.addEventListener("drop", (e) => { e.preventDefault(); e.stopPropagation(); li.classList.remove("drop-before"); if (dragId && dragId !== td.id) reorder(dragId, td.id, false, td.priority || "normal", td.group || null); });
    return li;
  }
  function renderTodos() {
    const box = $id("todoList"); box.innerHTML = "";
    if (currentProject) { renderProjectTodos(box); return; }   // 공유 프로젝트 보기
    const vis = visibleTodos(), cur = activeTodo();
    if (vis.length === 0) {
      const e = document.createElement("li"); e.className = "prio-empty"; e.style.listStyle = "none";
      e.textContent = searchQuery ? t("no_results") : t("empty_list"); box.append(e); return;
    }
    PRIO_GROUPS.forEach((key) => {
      const items = vis.filter((td) => (td.priority || "normal") === key);
      const collapsed = !!(state.prioCollapsed && state.prioCollapsed[key]);
      const group = document.createElement("div"); group.className = "prio-group" + (collapsed ? " collapsed" : ""); group.dataset.prio = key;
      const head = document.createElement("div"); head.className = "prio-head " + key;
      head.innerHTML = '<span class="tri">▾</span><span class="ph-label">' + t("prio_" + key) + '</span>';
      const cnt = document.createElement("span"); cnt.className = "prio-count"; cnt.textContent = items.length ? "(" + items.length + ")" : ""; head.append(cnt);
      head.addEventListener("click", () => { state.prioCollapsed[key] = !state.prioCollapsed[key]; save(); renderTodos(); });
      group.append(head);
      const ul = document.createElement("ul"); ul.className = "prio-list"; ul.dataset.prio = key;
      items.forEach((td) => ul.append(buildTodoLi(td, cur)));
      if (items.length === 0 && !searchQuery) { const e = document.createElement("li"); e.className = "prio-empty"; e.textContent = t("prio_drop"); ul.append(e); }
      group.append(ul);
      group.addEventListener("dragover", (e) => { e.preventDefault(); if (dragId) group.classList.add("drop-into"); });
      group.addEventListener("dragleave", (e) => { if (!group.contains(e.relatedTarget)) group.classList.remove("drop-into"); });
      group.addEventListener("drop", (e) => { e.preventDefault(); group.classList.remove("drop-into"); if (dragId) reorder(dragId, null, true, key); });
      box.append(group);
    });
  }
  // ----- 공유 Project (팀 공동 할 일 목록, Firebase) -----
  let projectsCache = {};        // { pid: {name, owner, ownerName, createdAt} }
  let projectTodosCache = {};    // { pid: { tid: {text, done, ts, by, doneBy, doneAt} } }
  let currentProject = null;     // 보고 있는 프로젝트 id (null=개인 목록)
  function kbStatusOf(td) { return td.status || (td.done ? "done" : "todo"); }   // 구버전 호환
  function projectStats(pid) {
    const todos = projectTodosCache[pid] || {};
    const keys = Object.keys(todos);
    return { total: keys.length, done: keys.filter((k) => todos[k] && kbStatusOf(todos[k]) === "done").length };
  }
  function addProject() {
    if (!currentUser || !msgDb) { toast(t("rq_offline")); return; }
    const name = (prompt(t("prj_name_prompt"), "") || "").trim(); if (!name) return;
    const pid = uid();
    const members = {}; members[currentUser.id] = true;   // 초대제 — 만든 사람만으로 시작
    try { wsRef("projects/" + pid).set({ name: name, owner: currentUser.id, ownerName: currentUser.name, createdAt: Date.now(), members: members }); } catch (_) {}
    projectsCache[pid] = { name: name, owner: currentUser.id, members: members };   // 낙관적 반영
    currentProject = pid; currentGroup = null;
    render();
  }
  // 초대받은 사람에게만 보임 (members 없는 구버전 프로젝트는 전체 공개로 유지)
  function projectVisible(p) { return !p.members || (currentUser && p.members[currentUser.id]); }
  let inviteTargetPid = null;
  function openInvite(pid) {
    const p = projectsCache[pid] || {}; if (!currentUser || !msgDb) return;
    inviteTargetPid = pid;
    const box = $id("invList"); box.innerHTML = "";
    const memberSet = p.members ? new Set(Object.keys(p.members)) : new Set(teamIds());
    const cands = teamIds().filter((u) => !memberSet.has(u))
      .sort((a, b) => (((usersCache[a] || {}).name || "")).localeCompare((usersCache[b] || {}).name || ""));
    if (!cands.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("prj_inv_none"); box.append(e); }
    cands.forEach((u) => {
      const b = document.createElement("button"); b.className = "st-opt"; b.type = "button";
      b.appendChild(statusDot(u));
      const nm = document.createElement("span"); nm.textContent = toLabelOf(u); b.appendChild(nm);
      b.addEventListener("click", () => {
        try {
          if (!p.members) {   // 구버전(전체 공개) → 현재 전원을 멤버로 확정한 뒤 추가
            const m = {}; teamIds().forEach((x) => { m[x] = true; }); m[u] = true;
            wsRef("projects/" + pid + "/members").set(m);
          } else wsRef("projects/" + pid + "/members/" + u).set(true);
        } catch (_) {}
        $id("inviteModal").hidden = true;
        toast(t("prj_invited", (usersCache[u] || {}).name || "?"));
      });
      box.append(b);
    });
    $id("inviteModal").hidden = false;
  }
  function buildPrjMemberBar(pid, p) {
    const bar = document.createElement("div"); bar.className = "prj-members";
    const lab = document.createElement("span"); lab.className = "mlabel"; lab.textContent = t("prj_members"); bar.append(lab);
    const members = p.members ? Object.keys(p.members) : teamIds();
    members.sort((a, b) => (a === p.owner ? -1 : b === p.owner ? 1 : 0)).forEach((u) => {
      if (!usersCache[u]) return;
      const chip = document.createElement("span"); chip.className = "prj-m";
      chip.appendChild(statusDot(u));
      chip.append(document.createTextNode(((usersCache[u] || {}).name || "?") + (u === p.owner ? " ★" : "")));
      if (p.members && u !== p.owner && currentUser && (isAdmin() || p.owner === currentUser.id)) {
        const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.title = t("prj_member_del_t");
        x.addEventListener("click", () => {
          if (!confirm(t("prj_member_del_confirm", (usersCache[u] || {}).name || "?"))) return;
          try { wsRef("projects/" + pid + "/members/" + u).remove(); } catch (_) {}
        });
        chip.append(x);
      }
      bar.append(chip);
    });
    const inv = document.createElement("button"); inv.className = "rq-btn"; inv.type = "button"; inv.textContent = t("prj_invite");
    inv.addEventListener("click", () => openInvite(pid));
    bar.append(inv);
    return bar;
  }
  function deleteProject(pid) {
    const p = projectsCache[pid]; if (!p || !msgDb) return;
    if (!(isAdmin() || p.owner === currentUser.id)) return;
    if (!confirm(t("prj_del_confirm", p.name))) return;
    const pCopy = Object.assign({}, p);
    const tCopy = Object.assign({}, projectTodosCache[pid] || {});
    try { wsRef("projects/" + pid).remove(); wsRef("projectTodos/" + pid).remove(); } catch (_) {}
    delete projectsCache[pid];
    if (currentProject === pid) currentProject = null;
    render();
    toastUndo(t("undo_deleted"), () => {
      try { wsRef("projects/" + pid).set(pCopy); if (Object.keys(tCopy).length) wsRef("projectTodos/" + pid).set(tCopy); } catch (_) {}
    });
  }
  // ----- 프로젝트 칸반 보드: 할 일 → 진행 중 → 완료 -----
  let prjDragId = null;
  let assignTarget = null;   // {pid, tid}
  let dueTarget = null;      // {pid, tid}
  function kbUpdate(pid, tid, patch) { if (msgDb) { try { wsRef("projectTodos/" + pid + "/" + tid).update(patch); } catch (_) {} } }
  // 카드를 내 원씽으로 — 담당 = 나, 진행 중으로 이동, 내 화면의 '단 하나'가 됨
  function takeAsOneThing(pid, td) {
    if (!currentUser || !msgDb) { toast(t("rq_offline")); return; }
    kbUpdate(pid, td.id, { status: "doing", done: false, assignee: currentUser.id, assigneeName: currentUser.name });
    let mine = state.todos.find((x) => x.prjRef && x.prjRef.pid === pid && x.prjRef.tid === td.id && x.status !== "done");
    if (!mine) {
      addTodo(td.text || "", { group: null, prjRef: { pid: pid, tid: td.id } });
      mine = state.todos[state.todos.length - 1];
    }
    sendToOneThing(mine.id);
    toast(t("kb_taken"));
  }
  function openAssign(pid, td) {
    assignTarget = { pid: pid, tid: td.id };
    const p = projectsCache[pid] || {};
    const box = $id("asgList"); box.innerHTML = "";
    const members = p.members ? Object.keys(p.members) : teamIds();
    members.filter((u) => usersCache[u]).forEach((u) => {
      const b = document.createElement("button"); b.className = "st-opt" + (td.assignee === u ? " sel" : ""); b.type = "button";
      b.appendChild(statusDot(u));
      const nm = document.createElement("span"); nm.textContent = (usersCache[u] || {}).name || "?"; b.appendChild(nm);
      b.addEventListener("click", () => { kbUpdate(pid, td.id, { assignee: u, assigneeName: (usersCache[u] || {}).name || "?" }); $id("assignModal").hidden = true; });
      box.append(b);
    });
    const none = document.createElement("button"); none.className = "st-opt"; none.type = "button"; none.textContent = t("kb_unassign");
    none.addEventListener("click", () => { kbUpdate(pid, td.id, { assignee: null, assigneeName: null }); $id("assignModal").hidden = true; });
    box.append(none);
    $id("assignModal").hidden = false;
  }
  function openDue(pid, td) {
    dueTarget = { pid: pid, tid: td.id };
    $id("kbDueInput").value = td.due || "";
    $id("dueModal").hidden = false;
  }
  // 카드 상세(설명 + 댓글)
  let cardTarget = null;   // {pid, tid}
  function openCard(pid, td) {
    cardTarget = { pid: pid, tid: td.id };
    $id("cardTitle").textContent = td.text || "";
    const metaBits = [];
    if (td.assigneeName) metaBits.push(t("kb_assign") + ": " + td.assigneeName);
    if (td.due) metaBits.push(t("kb_due") + " " + td.due);
    if (td.by) metaBits.push(t("card_by", td.by));
    $id("cardMeta").textContent = metaBits.join(" · ");
    $id("cardDesc").value = td.desc || "";
    renderCardComments(td);
    $id("cardCmt").value = "";
    $id("cardModal").hidden = false;
  }
  function renderCardComments(td) {
    const box = $id("cardComments"); box.innerHTML = "";
    const cmts = Array.isArray(td.comments) ? td.comments : [];
    if (!cmts.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("card_no_cmt"); box.append(e); return; }
    cmts.forEach((c) => {
      const d = document.createElement("div"); d.className = "rq-reply";
      d.textContent = ((c && c.by) || "?") + ": " + ((c && c.text) || "") + (c && c.ts ? " · " + fmtAgo(c.ts) : "");
      box.append(d);
    });
  }
  function saveCardDesc() {
    if (!cardTarget) return;
    kbUpdate(cardTarget.pid, cardTarget.tid, { desc: $id("cardDesc").value.trim() || null });
  }
  function sendCardComment() {
    if (!cardTarget || !currentUser || !msgDb) return;
    const text = $id("cardCmt").value.trim(); if (!text) return;
    const td = (projectTodosCache[cardTarget.pid] || {})[cardTarget.tid] || {};
    const cmts = Array.isArray(td.comments) ? td.comments.slice() : [];
    cmts.push({ by: currentUser.name, text: text, ts: Date.now() });
    kbUpdate(cardTarget.pid, cardTarget.tid, { comments: cmts });
    $id("cardCmt").value = "";
    renderCardComments(Object.assign({}, td, { comments: cmts }));
  }
  function buildKbCard(pid, td) {
    const st = kbStatusOf(td);
    const card = document.createElement("div"); card.className = "kb-card";
    card.draggable = true;
    const tx = document.createElement("div"); tx.className = "kb-text"; tx.textContent = td.text || ""; card.append(tx);
    const meta = document.createElement("div"); meta.className = "kb-meta";
    if (td.assignee && usersCache[td.assignee]) {
      const a = document.createElement("span"); a.className = "prj-m";
      a.appendChild(statusDot(td.assignee));
      a.append(document.createTextNode(td.assigneeName || (usersCache[td.assignee] || {}).name || "?"));
      meta.append(a);
    } else if (st !== "done") { const a = document.createElement("span"); a.textContent = t("kb_anyone"); meta.append(a); }
    if (td.due && st !== "done") {
      const today = todayStr();
      const dc = document.createElement("span"); dc.className = "chip" + (td.due < today ? " due-over" : td.due === today ? " due-soon" : "");
      dc.textContent = t("rq_due", td.due.slice(5)); meta.append(dc);
    }
    if (st === "done" && td.doneBy) { const d = document.createElement("span"); d.textContent = "✓ " + td.doneBy + (td.doneAt ? " · " + fmtAgo(td.doneAt) : ""); meta.append(d); }
    if (meta.children.length) card.append(meta);
    // hover 액션
    const acts = document.createElement("div"); acts.className = "kb-acts";
    if (st !== "done") {
      const take = document.createElement("button"); take.className = "rq-btn"; take.type = "button"; take.textContent = t("kb_take");
      take.addEventListener("click", () => takeAsOneThing(pid, td));
      acts.append(take);
      acts.append(reqBtn(t("kb_assign"), () => openAssign(pid, td)));
      acts.append(reqBtn(t("kb_due"), () => openDue(pid, td)));
    } else {
      acts.append(reqBtn(t("kb_reopen"), () => kbUpdate(pid, td.id, { status: "todo", done: false, doneBy: null, doneAt: null })));
    }
    // 열 이동 버튼 (모바일에선 드래그가 안 되므로 필수)
    if (st === "todo") acts.append(reqBtn(t("kb_to_doing"), () => {
      const patch = { status: "doing", done: false };
      if (!td.assignee && currentUser) { patch.assignee = currentUser.id; patch.assigneeName = currentUser.name; }
      kbUpdate(pid, td.id, patch);
    }));
    if (st === "doing") {
      acts.append(reqBtn(t("kb_to_done"), () => kbUpdate(pid, td.id, { status: "done", done: true, doneBy: currentUser ? currentUser.name : "", doneAt: Date.now() })));
      acts.append(reqBtn(t("kb_to_todo"), () => kbUpdate(pid, td.id, { status: "todo", done: false })));
    }
    acts.append(reqBtn(t("rq_delete"), () => {
      if (!confirm(t("prj_todo_del"))) return;
      const copy = Object.assign({}, td); delete copy.id;
      try { wsRef("projectTodos/" + pid + "/" + td.id).remove(); } catch (_) {}
      toastUndo(t("undo_deleted"), () => { try { wsRef("projectTodos/" + pid + "/" + td.id).set(copy); } catch (_) {} });
    }));
    card.append(acts);
    card.dataset.tid = td.id;
    // 카드 클릭 → 상세(설명·댓글)
    card.addEventListener("click", (e) => { if (e.target.closest("button")) return; openCard(pid, td); });
    if (Array.isArray(td.comments) && td.comments.length) {
      const cc = document.createElement("span"); cc.textContent = "💬 " + td.comments.length;
      cc.style.cssText = "font-size:.75rem;color:var(--text-soft)"; meta.append(cc);
      if (!meta.parentNode) card.append(meta);
    }
    card.addEventListener("dragstart", (e) => { e.stopPropagation(); prjDragId = td.id; dragId = null; card.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; });
    card.addEventListener("dragend", () => { prjDragId = null; card.classList.remove("dragging"); document.querySelectorAll(".kb-col.drop-into").forEach((n) => n.classList.remove("drop-into")); });
    return card;
  }
  function renderProjectTodos(box) {
    const pid = currentProject;
    const p = projectsCache[pid] || {};
    const todos = projectTodosCache[pid] || {};
    const q = searchQuery.trim().toLowerCase();
    const all = Object.keys(todos).map((k) => Object.assign({ id: k }, todos[k]))
      .filter((td) => !q || (td.text || "").toLowerCase().includes(q));
    box.append(buildPrjMemberBar(pid, p));   // 멤버 바 + 초대
    const board = document.createElement("div"); board.className = "kb-board";
    [["todo", "kb_todo"], ["doing", "kb_doing"], ["done", "kb_done"]].forEach((pair) => {
      const key = pair[0];
      const items = all.filter((td) => kbStatusOf(td) === key)
        .sort((a, b) => key === "done" ? (b.doneAt || 0) - (a.doneAt || 0) : (a.ts || 0) - (b.ts || 0));
      const col = document.createElement("div"); col.className = "kb-col kb-" + key;
      const h = document.createElement("div"); h.className = "kb-col-h";
      h.innerHTML = '<span class="st-dot ' + (key === "todo" ? "st-away" : key === "doing" ? "st-focus" : "st-work") + '"></span>';
      h.append(document.createTextNode(t(pair[1]) + " (" + items.length + ")"));
      col.append(h);
      items.forEach((td) => col.append(buildKbCard(pid, td)));
      if (!items.length) { const e = document.createElement("div"); e.className = "kb-empty"; e.textContent = t("kb_drop"); col.append(e); }
      col.addEventListener("dragover", (e) => { if (prjDragId) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; col.classList.add("drop-into"); } });
      col.addEventListener("dragleave", (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove("drop-into"); });
      col.addEventListener("drop", (e) => {
        if (!prjDragId) return;
        e.preventDefault(); col.classList.remove("drop-into");
        const td = todos[prjDragId]; if (!td) { prjDragId = null; return; }
        const patch = { status: key, done: key === "done" };
        if (key === "done") { patch.doneBy = currentUser ? currentUser.name : ""; patch.doneAt = Date.now(); }
        else { patch.doneBy = null; patch.doneAt = null; }
        if (key === "doing" && !td.assignee && currentUser) { patch.assignee = currentUser.id; patch.assigneeName = currentUser.name; }
        kbUpdate(pid, prjDragId, patch);
        prjDragId = null;
      });
      board.append(col);
    });
    box.append(board);
  }

  // ----- 폴더 탭 — 각 폴더는 독립된 할 일 목록 -----
  function openTodosOf(gid) {
    const groupIds = new Set((state.groups || []).map((g) => g.id));
    return state.todos.filter((t) => {
      const g = t.group && groupIds.has(t.group) ? t.group : null;
      return g === gid && t.status !== "done" && !t.later;
    }).length;
  }
  let tabDragKey = null;   // 탭 순서 이동용
  function saveTabOrder(orderedKeys) { state.tabOrder = orderedKeys; save(); render(); }
  function renderGroupTabs() {
    const box = $id("groupTabs"); if (!box) return;
    box.innerHTML = "";
    // List(개인)·Project(공유) 항목을 사용자 지정 순서로 합침
    const entries = [];
    (state.groups || []).forEach((g) => entries.push({ key: "g:" + g.id, type: "g", g: g }));
    if (currentUser && cloudConfigured() && myWsId) {   // Project는 워크스페이스 소속만 (개인 List는 누구나)
      Object.keys(projectsCache).filter((pid) => projectVisible(projectsCache[pid] || {}))
        .sort((a, b) => ((projectsCache[a] || {}).createdAt || 0) - ((projectsCache[b] || {}).createdAt || 0))
        .forEach((pid) => entries.push({ key: "p:" + pid, type: "p", pid: pid }));
    }
    const orderIdx = {};
    (state.tabOrder || []).forEach((k, i) => { orderIdx[k] = i; });
    entries.sort((a, b) => ((a.key in orderIdx) ? orderIdx[a.key] : 999) - ((b.key in orderIdx) ? orderIdx[b.key] : 999));
    const attachReorder = (b, key) => {   // 탭 자체 드래그로 순서 이동
      b.draggable = true;
      b.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        tabDragKey = key; dragId = null;   // 할 일 드래그와 확실히 구분
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", "tab:" + key); } catch (_) {}
      });
      b.addEventListener("dragend", () => { tabDragKey = null; document.querySelectorAll(".group-tabs .drop-into").forEach((n) => n.classList.remove("drop-into")); });
      b.addEventListener("dragover", (e) => {
        if (!tabDragKey || tabDragKey === key) return;
        e.preventDefault(); e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        b.classList.add("drop-into");
      });
      b.addEventListener("dragleave", () => { if (tabDragKey) b.classList.remove("drop-into"); });
      b.addEventListener("drop", (e) => {
        if (!tabDragKey || tabDragKey === key) return;
        e.preventDefault(); e.stopPropagation(); b.classList.remove("drop-into");
        const keys = entries.map((en) => en.key).filter((k) => k !== tabDragKey);
        keys.splice(keys.indexOf(key), 0, tabDragKey);
        tabDragKey = null; saveTabOrder(keys);
      });
    };
    const renameGroup = (g) => {
      const name = (prompt(t("grp_name_prompt"), g.name) || "").trim();
      if (name) { g.name = name; save(); render(); }
    };
    const renameProject = (pid, p) => {
      if (!(isAdmin() || p.owner === (currentUser || {}).id)) { toast(t("prj_owner_only")); return; }
      const name = (prompt(t("prj_name_prompt"), p.name) || "").trim();
      if (name && msgDb) { try { wsRef("projects/" + pid + "/name").set(name); } catch (_) {} }
    };
    const mkTab = (gid, name) => {
      const b = document.createElement("button"); b.type = "button";
      b.className = (gid === currentGroup && !currentProject) ? "active" : "";
      const lab = document.createElement("span"); lab.textContent = name; b.append(lab);
      const n = openTodosOf(gid);
      if (n) { const c = document.createElement("span"); c.className = "gt-count"; c.textContent = "(" + n + ")"; b.append(c); }
      b.addEventListener("click", () => { if (currentGroup !== gid || currentProject) { currentGroup = gid; currentProject = null; render(); } });
      // 드래그한 할 일을 탭에 떨어뜨리면 그 폴더로 이동 (탭 드래그와 구분)
      b.addEventListener("dragover", (e) => { e.preventDefault(); if (dragId || tabDragKey) b.classList.add("drop-into"); });
      b.addEventListener("dragleave", () => b.classList.remove("drop-into"));
      b.addEventListener("drop", (e) => {
        if (tabDragKey) return;   // 탭 순서 이동은 attachReorder가 처리
        e.preventDefault(); b.classList.remove("drop-into");
        if (!dragId) return;
        const td = state.todos.find((x) => x.id === dragId); if (!td) return;
        td.group = gid; save(); render();
      });
      return b;
    };
    const inboxTab = mkTab(null, t("grp_main"));
    // 탭을 Inbox 위에 떨어뜨리면 맨 앞으로
    inboxTab.addEventListener("dragover", (e) => { if (tabDragKey) { e.preventDefault(); e.stopPropagation(); inboxTab.classList.add("drop-into"); } });
    inboxTab.addEventListener("drop", (e) => {
      if (!tabDragKey) return;
      e.preventDefault(); e.stopPropagation(); inboxTab.classList.remove("drop-into");
      const keys = entries.map((en) => en.key).filter((k) => k !== tabDragKey);
      keys.unshift(tabDragKey);
      tabDragKey = null; saveTabOrder(keys);
    });
    box.append(inboxTab);
    entries.forEach((en) => {
      if (en.type === "g") {
        const g = en.g;
        const b = mkTab(g.id, g.name);
        b.title = t("grp_ctx_t");
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); renameGroup(g); });   // 우클릭 = 이름 변경
        if (g.id === currentGroup && !currentProject) {
          b.addEventListener("dblclick", () => renameGroup(g));
          const del = document.createElement("button"); del.className = "row-x"; del.textContent = "✕"; del.title = t("grp_del_t");
          del.addEventListener("click", (e) => { e.stopPropagation(); deleteGroup(g.id); });
          b.append(del);
        }
        attachReorder(b, en.key);
        box.append(b);
      } else {
        const pid = en.pid, p = projectsCache[pid] || {};
        const b = document.createElement("button"); b.type = "button";
        b.className = (currentProject === pid ? "active " : "") + "gt-prj";
        b.title = t("grp_ctx_t");
        b.innerHTML = '<svg class="icon" style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c1-2.7 3-4 5.5-4s4.5 1.3 5.5 4"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.3.2 4 1.4 4.8 3.4"/></svg>';
        const lab = document.createElement("span"); lab.textContent = p.name || "?"; b.append(lab);
        const s = projectStats(pid);
        const c = document.createElement("span"); c.className = "gt-count"; c.textContent = "(" + s.done + "/" + s.total + ")"; b.append(c);
        b.addEventListener("click", () => { if (currentProject !== pid) { currentProject = pid; render(); } });
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); renameProject(pid, p); });   // 우클릭 = 이름 변경
        if (currentProject === pid && (isAdmin() || p.owner === (currentUser || {}).id)) {
          b.addEventListener("dblclick", () => renameProject(pid, p));
          const del = document.createElement("button"); del.className = "row-x"; del.textContent = "✕"; del.title = t("prj_del_t");
          del.addEventListener("click", (e) => { e.stopPropagation(); deleteProject(pid); });
          b.append(del);
        }
        attachReorder(b, en.key);
        box.append(b);
      }
    });
    const add = document.createElement("button"); add.type = "button"; add.className = "gt-new";
    add.textContent = t("grp_add"); add.title = t("grp_add_t");
    add.addEventListener("click", addGroup);
    box.append(add);
    if (currentUser && cloudConfigured() && myWsId) {
      const addP = document.createElement("button"); addP.type = "button"; addP.className = "gt-new";
      addP.innerHTML = '<svg class="icon" style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c1-2.7 3-4 5.5-4s4.5 1.3 5.5 4"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.3.2 4 1.4 4.8 3.4"/></svg>';
      addP.append(document.createTextNode(" " + t("prj_add"))); addP.title = t("prj_add_t");
      addP.addEventListener("click", addProject);
      box.append(addP);
    }
  }
  function addGroup() {
    const name = (prompt(t("grp_name_prompt"), "") || "").trim(); if (!name) return;
    state.groups = state.groups || [];
    const g = { id: uid(), name, collapsed: false };
    state.groups.push(g);
    currentGroup = g.id;   // 새 폴더로 바로 전환 — 빈 목록에서 새로 적기 시작
    save(); render();
  }
  function deleteGroup(id) {
    const g = (state.groups || []).find((x) => x.id === id); if (!g) return;
    if (!confirm(t("grp_del_confirm", g.name))) return;
    state.todos.forEach((td) => { if (td.group === id) td.group = null; });   // 할 일은 메인으로 복귀
    state.groups = state.groups.filter((x) => x.id !== id);
    if (currentGroup === id) currentGroup = null;
    save(); render();
  }
  function buildDetail(td) {
    const d = document.createElement("div"); d.className = "detail";
    const ul = document.createElement("ul"); ul.className = "sub-list";
    (td.subtasks || []).forEach((s) => {
      const li = document.createElement("li");
      const cb = document.createElement("button"); cb.className = "check scheck"; cb.textContent = s.done ? "✓" : ""; cb.addEventListener("click", () => toggleSub(td.id, s.id));
      const tx = document.createElement("span"); tx.className = "stext" + (s.done ? " done" : ""); tx.textContent = s.text;
      const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.addEventListener("click", () => delSub(td.id, s.id));
      li.append(cb, tx, x); ul.append(li);
    });
    d.append(ul);
    const sa = document.createElement("div"); sa.className = "sub-add";
    const si = document.createElement("input"); si.placeholder = t("sub_ph");
    si.addEventListener("keydown", (e) => { if (e.key === "Enter") { addSub(td.id, si.value); } });
    sa.append(si); d.append(sa);
    const act = document.createElement("div"); act.className = "detail-actions";
    // 우선순위 변경 (모바일에서도 가능하게)
    PRIO_GROUPS.forEach((key) => {
      const pb = document.createElement("button"); pb.textContent = t("prio_" + key);
      pb.className = "det-prio" + ((td.priority || "normal") === key ? " sel-" + key : "");
      pb.addEventListener("click", () => { td.priority = key; save(); render(); });
      act.append(pb);
    });
    const due = document.createElement("input"); due.type = "date"; due.value = td.due || ""; due.title = t("ti_due"); due.addEventListener("change", () => setDue(td.id, due.value));
    const rep = document.createElement("button"); rep.textContent = td.repeat ? (td.repeat === "daily" ? t("rep_daily") : t("rep_weekly")) : t("rep_none"); rep.addEventListener("click", () => cycleRepeat(td.id));
    const lat = document.createElement("button"); lat.textContent = t("ti_later"); lat.addEventListener("click", () => toggleLater(td.id));
    const del = document.createElement("button"); del.className = "del"; del.textContent = t("ti_delete"); del.addEventListener("click", () => deleteTodo(td.id));
    act.append(due, rep, lat, del); d.append(act);
    return d;
  }
  // '원씽 부수기' — 큰 원씽을 조각으로 쪼개 차례대로 실행
  function buildOtSubs(td) {
    const wrap = document.createElement("div"); wrap.className = "ot-subs";
    const subs = td.subtasks || [];
    const doneN = subs.filter((s) => s.done).length;
    const head = document.createElement("div"); head.className = "ot-subs-head";
    head.innerHTML = '<b>' + t("ot_break_h") + '</b>' + (subs.length ? ' <span class="obs-cnt">' + doneN + '/' + subs.length + '</span>' : '');
    wrap.append(head);
    if (!subs.length) {   // 조각이 생기면 설명문은 치움 — 화면 간결하게
      const subline = document.createElement("div"); subline.className = "ot-break-sub";
      subline.textContent = t("ot_break_sub");
      wrap.append(subline);
    }
    if (subs.length) {   // 진행률 바
      const bar = document.createElement("div"); bar.className = "ms-bar"; bar.style.height = "6px"; bar.style.margin = "6px 0 8px";
      const fill = document.createElement("div"); fill.className = "ms-fill"; fill.style.width = Math.round((doneN / subs.length) * 100) + "%";
      if (!doneN) fill.style.minWidth = "0";
      bar.append(fill); wrap.append(bar);
    }
    const ul = document.createElement("ul"); ul.className = "ot-sub-list";
    let nowMarked = false;
    subs.forEach((s, i) => {
      const li = document.createElement("li");
      if (!s.done && !nowMarked) { li.className = "now-step"; nowMarked = true; }   // 지금 부술 조각
      const num = document.createElement("span"); num.className = "step-num"; num.textContent = (i + 1) + ".";
      const cb = document.createElement("button"); cb.className = "check scheck"; cb.textContent = s.done ? "✓" : ""; cb.addEventListener("click", () => toggleSub(td.id, s.id));
      const tx = document.createElement("span"); tx.className = "stext" + (s.done ? " done" : ""); tx.textContent = s.text;
      const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.addEventListener("click", () => delSub(td.id, s.id));
      li.append(num, cb, tx, x); ul.append(li);
    });
    wrap.append(ul);
    const sa = document.createElement("div"); sa.className = "sub-add";
    const si = document.createElement("input"); si.placeholder = subs.length ? t("ot_break_next") : t("ot_break_first");
    si.addEventListener("keydown", (e) => { if (e.key === "Enter") addSub(td.id, si.value); });
    sa.append(si); wrap.append(sa);
    return wrap;
  }
  let doneShown = 5;   // 끝난 일: 최근 5개 + 더 보기
  function renderDone() {
    const wrap = $id("doneWrap"), list = $id("doneList"); const dones = doneTodos();
    wrap.classList.toggle("collapsed", !!state.doneCollapsed);
    $id("doneCount").textContent = dones.length ? "(" + dones.length + ")" : "";
    list.innerHTML = "";
    const all = dones.slice().reverse();
    const rest = all.length - doneShown;
    all.slice(0, doneShown).forEach((td) => {
      const li = document.createElement("li"); li.className = "done";
      const mark = document.createElement("span"); mark.className = "check"; mark.style.borderColor = "var(--done)"; mark.style.color = "var(--accent)"; mark.textContent = "✓"; mark.style.cursor = "pointer"; mark.title = t("ti_restore"); mark.addEventListener("click", () => restoreTodo(td.id));
      const text = document.createElement("span"); text.className = "done-text"; text.textContent = td.text;
      const restore = document.createElement("button"); restore.className = "restore"; restore.textContent = "↩"; restore.title = t("ti_backtodo"); restore.addEventListener("click", () => restoreTodo(td.id));
      const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.title = t("ti_totrash"); x.addEventListener("click", () => deleteTodo(td.id));
      li.append(mark, text, restore, x); list.append(li);
    });
    if (rest > 0) {
      const li = document.createElement("li"); li.className = "done"; li.style.justifyContent = "center";
      const btn = document.createElement("button"); btn.className = "rq-more-btn"; btn.type = "button";
      btn.textContent = t("rq_more", rest);
      btn.addEventListener("click", () => { doneShown += 10; renderDone(); });
      li.append(btn); list.append(li);
    }
  }
  function renderRight() {
    const today = todayStr(); const isToday = viewDate === today;
    $id("todayDate").textContent = fmtNice(viewDate);
    $id("todayBtn").hidden = isToday;
    $id("nextDay").hidden = viewDate >= today;   // 미래 날짜는 필요 없음 — 오늘이면 ▶ 숨김
    const dayHist = state.history.filter((h) => h.date === viewDate);
    $id("goalBadge").hidden = !(isToday && dayHist.length > 0);

    const hist = $id("historyList"); hist.innerHTML = "";
    dayHist.forEach((h, i) => {
      const li = document.createElement("li"); li.className = "hist";
      const num = document.createElement("span"); num.className = "hist-num"; num.textContent = (i + 1) + ".";
      const ck = document.createElement("span"); ck.className = "check done"; ck.textContent = "✓";
      const tx = document.createElement("span"); tx.className = "hist-text"; tx.textContent = h.text; makeEditable(tx, "history", h.id);
      li.append(num, ck, tx);
      if (h.focusSec) { const tm = document.createElement("span"); tm.className = "hist-time"; tm.textContent = fmtDur(h.focusSec); li.append(tm); }
      const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.title = t("ti_delrec"); x.addEventListener("click", () => deleteHistory(h.id)); li.append(x);
      hist.append(li);
    });

    const slot = $id("activeSlot"); slot.innerHTML = ""; const cur = activeTodo();
    if (isToday && cur) {
      const card = document.createElement("div"); card.className = "onething-card";
      const text = document.createElement("div"); text.className = "ot-text"; text.textContent = cur.text; text.title = t("ti_edit"); makeEditable(text, "todo", cur.id);
      // 타이머 — 완료 버튼과 같은 줄(하단)에 간결하게: 시간 · 집중 시작 · 길이 선택만
      const pm = state.settings.pomodoroMin || 25;
      const timer = document.createElement("div"); timer.className = "timer";
      timer.innerHTML = '<span class="time" id="timeDisp">' + fmtMMSS(timerRemaining > 0 ? timerRemaining : pomoSec()) + '</span>'
        + '<button id="timerToggle" class="tmr-main">' + (timerRunning ? t("timer_pause") : t("timer_start")) + '</button>'
        + '<span class="len-wrap"><button id="lenBtn" class="tmr-len" type="button">' + pm + t("min_unit") + ' ▾</button>'
        + '<div class="to-menu len-menu" id="lenMenu" hidden>'
        + [15, 25, 30, 45, 60].map((n) => '<button class="to-opt" data-min="' + n + '"' + (n === pm ? ' style="color:var(--accent);font-weight:700"' : '') + '>' + n + t("min_unit") + '</button>').join("")
        + '<button class="to-opt" data-min="custom">' + t("tp_custom") + '</button></div></span>';
      const foot = document.createElement("div"); foot.className = "ot-foot";
      const done = document.createElement("button"); done.className = "complete-btn"; done.innerHTML = '<span class="box"></span> ' + t("complete"); done.addEventListener("click", () => completeTodo(cur.id));
      foot.append(timer, done); card.append(text, buildOtSubs(cur), foot); slot.append(card);
      $id("rightHint").textContent = t("hint_active");
      setTimeout(() => {
        const tb = $id("timerToggle"), lb = $id("lenBtn"), lm = $id("lenMenu");
        if (tb) tb.onclick = toggleTimer;
        if (lb && lm) lb.onclick = (e) => { e.stopPropagation(); lm.hidden = !lm.hidden; };
      }, 0);
    } else if (isToday) {
      const empty = document.createElement("div"); empty.className = "empty-ot";
      empty.innerHTML = EMPTY_OT_SVG + "<div>" + t("empty_ot") + "</div>";
      slot.append(empty);
      $id("rightHint").textContent = dayHist.length ? t("hint_count", dayHist.length) : t("hint_key");
    } else {
      const empty = document.createElement("div"); empty.className = "empty-ot readonly";
      empty.textContent = dayHist.length ? t("ro_has") : t("ro_none");
      slot.append(empty);
      $id("rightHint").textContent = t("hint_today");
    }
  }
  function renderLater() {
    const wrap = $id("laterWrap"), list = $id("laterList"); const items = laterTodos();
    wrap.classList.toggle("collapsed", !!state.laterCollapsed);
    $id("laterCount").textContent = items.length ? "(" + items.length + ")" : "";
    list.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li"); li.className = "later-item"; li.style.color = "var(--text-soft)";
      li.textContent = t("later_empty"); list.append(li); return;
    }
    items.forEach((td) => {
      const li = document.createElement("li"); li.className = "later-item";
      const tx = document.createElement("span"); tx.className = "lt-text"; tx.textContent = td.text;
      const now = document.createElement("button"); now.className = "lt-now"; now.textContent = t("lt_now"); now.title = t("lt_now_title");
      now.addEventListener("click", () => toggleLater(td.id));
      const x = document.createElement("button"); x.className = "row-x"; x.textContent = "✕"; x.title = t("lt_del"); x.addEventListener("click", () => deleteTodo(td.id));
      li.append(tx, now, x); list.append(li);
    });
  }
  function render() {
    // ★ 잠금을 목록보다 먼저 적용 — 그리는 도중 오류·지연이 생겨도 잠기지 않은 화면이 절대 노출되지 않게
    {
      const a0 = activeTodo(); if (!a0) leftUnlocked = false;
      const lk = !!a0 && !leftUnlocked && viewDate === todayStr();
      $(".notebook").classList.toggle("locked", lk);
      try { (window.__renders = window.__renders || []).push({ t: Math.round(performance.now()), lk: lk, act: !!a0, lu: leftUnlocked, uid: !!authUser, todos: (state.todos || []).length, vd: viewDate }); } catch (_) {}
    }
    renderGroupTabs(); renderTodos(); renderLater(); renderDone(); renderRight();
    // 프로젝트 보기에서는 나중에/끝난 일 섹션 숨김 (프로젝트는 자체 완료 표시)
    const lw = $id("laterWrap"), dw = $id("doneWrap"), ah = $id("addHint");
    if (lw) lw.style.display = currentProject ? "none" : "";
    if (dw) dw.style.display = currentProject ? "none" : "";
    if (ah && currentProject) ah.hidden = true;
    const active = activeTodo(); if (!active) leftUnlocked = false;
    const locked = !!active && !leftUnlocked && viewDate === todayStr();
    $(".notebook").classList.toggle("locked", locked);
    $id("relockBtn").hidden = !(active && leftUnlocked);
    applyTheme();
  }
  function applyTheme() {
    let th = state.settings.theme;
    if (th !== "auto" && th !== "light" && th !== "dark") th = "light";   // 구버전(paper 등) → 라이트
    if (state.settings.theme !== th) state.settings.theme = th;
    const eff = th === "auto"
      ? (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : th;
    document.body.dataset.theme = eff;
  }
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (state.settings.theme === "auto") applyTheme(); }); } catch (_) {}
  function applyLang() {
    LANG = state.settings.lang || "ko";
    document.body.dataset.lang = LANG;
    document.documentElement.lang = LANG;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    const ll = $id("langLabel"); if (ll) ll.textContent = LANG === "ko" ? "EN" : "한";
  }
  function toggleLang() {
    state.settings.lang = (LANG === "ko") ? "en" : "ko";
    save(); applyLang(); render(); refreshSyncState(); renderRequests();
  }

  // ---------- modals: stats / trash / later / backup / settings ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  // 오늘 업무 요약 텍스트 (일일 보고 쪽지용)
  function buildDailySummary() {
    const today = todayStr();
    const doneOT = state.history.filter((h) => h.date === today);
    const focus = doneOT.reduce((s, h) => s + (h.focusSec || 0), 0);
    const dayStart = parseDate(today).getTime();
    let reqDone = 0, reqSent = 0;
    if (currentUser) Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id]; if (!r) return;
      if (r.to === currentUser.id && r.status === "done" && (r.doneAt || 0) >= dayStart) reqDone++;
      if (r.from === currentUser.id && (r.ts || 0) >= dayStart) reqSent++;
    });
    let txt = t("ds_head", fmtNice(today));
    txt += "\n" + t("ds_ot", doneOT.length);
    if (doneOT.length) txt += "\n" + doneOT.map((h) => "· " + h.text).join("\n");
    txt += "\n" + t("ds_focus", fmtDur(focus));
    txt += "\n" + t("ds_req", reqDone, reqSent);
    return txt.slice(0, 500);
  }
  function bestStreak(set) {
    if (!set.size) return 0;
    const dates = [...set].sort(); let best = 1, run = 1;
    for (let i = 1; i < dates.length; i++) { if (dates[i] === addDaysStr(dates[i - 1], 1)) { run++; if (run > best) best = run; } else run = 1; }
    return best;
  }
  function openStats() {
    const set = new Set(state.history.map((h) => h.date));
    const total = state.history.length;
    let streak = 0, day = todayStr(); if (!set.has(day)) day = addDaysStr(day, -1);
    while (set.has(day)) { streak++; day = addDaysStr(day, -1); }
    const best = bestStreak(set);
    const dow = (parseDate(todayStr()).getDay() + 6) % 7;
    const weekStart = addDaysStr(todayStr(), -dow);
    let weekCount = 0; const pills = [];
    for (let i = 0; i < 7; i++) {
      const ds = addDaysStr(weekStart, i); const done = set.has(ds); if (done) weekCount++;
      const isT = ds === todayStr(); const fut = ds > todayStr(); const lab = dowLabel(parseDate(ds).getDay());
      pills.push('<div class="day-pill' + (done ? " done" : "") + (isT ? " today" : "") + (fut ? " future" : "") + '"><span class="dmark">' + (done ? "✓" : (fut ? "·" : "○")) + '</span>' + lab + '</div>');
    }
    let hero;
    if (total === 0) hero = t("hero0");
    else if (streak >= 7) hero = t("hero_fire", streak);
    else if (streak > 0) hero = t("hero_going", streak);
    else hero = t("hero_restart");

    let html = '<div class="stat-hero">' + hero + '</div>';
    html += '<div class="stat-row">'
      + '<div class="stat-card"><div class="num">' + streak + '</div><div class="lbl">' + t("lbl_cur") + '</div></div>'
      + '<div class="stat-card"><div class="num">' + best + '</div><div class="lbl">' + t("lbl_best") + '</div></div>'
      + '<div class="stat-card"><div class="num">' + total + '</div><div class="lbl">' + t("lbl_total") + '</div></div></div>';
    // 도미노 시각화 — 작은 도미노가 더 큰 도미노를 넘어뜨린다
    let dom = '<div class="domino-row">';
    for (let i = 0; i < 8; i++) dom += '<span class="domino' + (i < Math.min(streak, 8) ? ' on' : '') + '" style="height:' + (10 + i * 5) + 'px"></span>';
    dom += '<span class="domino-note">' + t("domino_note") + '</span></div>';
    html += dom;

    const MS = [1, 3, 7, 15, 30, 60, 100];
    if (total >= 100) {
      html += '<div class="ms-wrap"><div class="ms-label"><span>' + t("ms_top") + '</span><span>' + t("ms_count", total) + '</span></div>'
        + '<div class="ms-bar"><div class="ms-fill" style="width:100%"></div></div></div>';
    } else {
      const next = MS.find((m) => total < m); let prev = 0; MS.forEach((m) => { if (m <= total) prev = m; });
      const pct = Math.round(((total - prev) / (next - prev)) * 100);
      html += '<div class="ms-wrap"><div class="ms-label"><span>' + t("ms_next", next) + '</span><span>' + total + ' / ' + next + '</span></div>'
        + '<div class="ms-bar"><div class="ms-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="ms-note">' + t("ms_note", next - total) + '</div></div>';
    }

    html += '<div class="section-h">' + t("week_h", weekCount) + '</div><div class="week-strip">' + pills.join("") + '</div>';

    // 최근 12주 실천 히트맵 (잔디)
    let hm = '<div class="section-h">' + t("hm_h") + '</div><div class="hm">';
    const hmStart = addDaysStr(weekStart, -77);   // 11주 전 월요일부터
    for (let w = 0; w < 12; w++) {
      hm += '<div class="hm-col">';
      for (let d = 0; d < 7; d++) {
        const ds = addDaysStr(hmStart, w * 7 + d);
        const fut = ds > todayStr();
        hm += '<span class="hm-cell' + (set.has(ds) ? " on" : "") + (fut ? " fut" : "") + '" title="' + ds + '"></span>';
      }
      hm += '</div>';
    }
    hm += '</div>';
    html += hm;

    // 이번 주 업무 요약 (원씽·집중시간·요청 처리)
    const weekHist = state.history.filter((h) => h.date >= weekStart && h.date <= todayStr());
    const weekFocus = weekHist.reduce((s, h) => s + (h.focusSec || 0), 0);
    const wsMs = parseDate(weekStart).getTime();
    let reqDone = 0, reqSent = 0;
    if (currentUser) {
      Object.keys(requestsCache).forEach((id) => {
        const r = requestsCache[id]; if (!r) return;
        if (r.to === currentUser.id && r.status === "done" && (r.doneAt || 0) >= wsMs) reqDone++;
        if (r.from === currentUser.id && (r.ts || 0) >= wsMs) reqSent++;
      });
    }
    html += '<div class="section-h">' + t("wk_sum_h") + '</div>'
      + '<div class="ms-note" style="margin:0 0 8px">' + t("wk_story", weekHist.length, fmtDur(weekFocus))
      + (((state.guarded || {})[weekStart] || 0) > 0 ? "<br>" + t("wk_guard", (state.guarded || {})[weekStart]) : "") + '</div>'
      + '<div class="stat-row">'
      + '<div class="stat-card"><div class="num">' + weekHist.length + '</div><div class="lbl">' + t("wk_ot") + '</div></div>'
      + '<div class="stat-card"><div class="num" style="font-size:1.15rem;line-height:1.4">' + fmtDur(weekFocus) + '</div><div class="lbl">' + t("wk_focus") + '</div></div>'
      + (currentUser ? '<div class="stat-card"><div class="num">' + reqDone + '</div><div class="lbl">' + t("wk_reqdone") + '</div></div>'
      + '<div class="stat-card"><div class="num">' + reqSent + '</div><div class="lbl">' + t("wk_reqsent") + '</div></div>' : '')
      + '</div>';

    // (배지 수집은 B2B 신뢰감을 위해 제거 — 연속 기록·잔디·주간 요약만 유지)


    // 일일 요약 쪽지 보내기
    if (currentUser && cloudConfigured()) {
      html += '<div class="mrow" style="margin-top:16px;justify-content:flex-end"><button id="dailySumBtn" class="mbtn ghost">' + t("ds_btn") + '</button></div>';
    }

    // 관리자용 팀 현황 — 별도 탭
    let teamHtml = "";
    if (isAdmin()) {
      teamHtml += '<div class="section-h" style="margin-top:4px">' + t("adm_h") + '</div>';
      teamIds().forEach((uid2) => {
        const name = (usersCache[uid2] || {}).name || "?";
        const st = ((statusCache[uid2] || {}).state) || "away";
        let dn = 0, sn2 = 0;
        Object.keys(requestsCache).forEach((rid) => {
          const r = requestsCache[rid]; if (!r) return;
          if (r.to === uid2 && r.status === "done" && (r.doneAt || 0) >= wsMs) dn++;
          if (r.from === uid2 && (r.ts || 0) >= wsMs) sn2++;
        });
        teamHtml += '<div class="sp-feed-item"><span><span class="st-dot st-' + st + '"></span> <b>' + esc(name) + '</b> · ' + t("st_" + st) + '</span>'
          + '<span>' + t("adm_row", dn, sn2) + '</span></div>';
      });
    }

    if (teamHtml) {
      $id("statsBody").innerHTML =
        '<div class="pop-tabs" style="margin:0 0 12px"><button class="pop-tab active" id="stTabMe" type="button">' + t("st_tab_me") + '</button>'
        + '<button class="pop-tab" id="stTabTeam" type="button">' + t("st_tab_team") + '</button></div>'
        + '<div id="stPaneMe">' + html + '</div><div id="stPaneTeam" hidden>' + teamHtml + '</div>';
      const tm = $id("stTabMe"), tt = $id("stTabTeam");
      const sw = (me) => {
        tm.classList.toggle("active", me); tt.classList.toggle("active", !me);
        $id("stPaneMe").hidden = !me; $id("stPaneTeam").hidden = me;
      };
      tm.addEventListener("click", () => sw(true));
      tt.addEventListener("click", () => sw(false));
    } else $id("statsBody").innerHTML = html;
    const dsb = $id("dailySumBtn");
    if (dsb) dsb.addEventListener("click", () => {
      $id("statsModal").hidden = true;
      openSendReq("memo");
      $id("sendReqText").value = buildDailySummary();
    });
    $id("statsModal").hidden = false;
  }
  function openTrash() {
    const list = $id("trashList"); list.innerHTML = "";
    if (!state.trash.length) { list.innerHTML = '<div class="empty-note">' + t("trash_emptynote") + '</div>'; }
    state.trash.forEach((td) => {
      const li = document.createElement("li");
      const tx = document.createElement("span"); tx.className = "mtext"; tx.textContent = td.text;
      const r = document.createElement("button"); r.textContent = t("tr_restore"); r.addEventListener("click", () => restoreTrash(td.id));
      const x = document.createElement("button"); x.textContent = t("tr_purge"); x.addEventListener("click", () => purgeTrash(td.id));
      li.append(tx, r, x); list.append(li);
    });
    $id("trashModal").hidden = false;
  }
  function openBackup() {
    const ab = $id("exportAllBtn"); if (ab) ab.hidden = !isAdmin();
    $id("backupModal").hidden = false;
  }
  function downloadJson(obj, name) {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
      toast(t("bk_exported"));
    } catch (e) { toast(t("bk_export_fail")); }
  }
  function exportAllBackup() {   // 관리자: 팀 데이터 전체 (PIN은 제외)
    const users = {};
    Object.keys(usersCache).forEach((id) => {
      const u = Object.assign({}, usersCache[id]); delete u.pin; delete u.pinH; users[id] = u;
    });
    downloadJson({ exportedAt: Date.now(), users: users, requests: requestsCache, projects: projectsCache, projectTodos: projectTodosCache, status: statusCache },
      "onething-full-backup-" + todayStr() + ".json");
  }
  function exportBackup() {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = "onething-backup-" + todayStr() + ".json"; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
      toast(t("bk_exported"));
    } catch (e) { toast(t("bk_export_fail")); }
  }
  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || !Array.isArray(obj.todos)) { toast(t("bk_invalid")); return; }
        if (!confirm(t("bk_confirm"))) return;
        state = migrate(obj); save(); applyLang(); render();
        $id("backupModal").hidden = true; toast(t("bk_imported"));
      } catch (e) { toast(t("bk_import_fail")); }
    };
    reader.readAsText(file);
  }
  function openSettings() {
    const curTh = ["auto", "light", "dark"].includes(state.settings.theme) ? state.settings.theme : "light";
    $id("themeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("sel", b.dataset.theme === curTh));
    const curUl = state.settings.unlockMode === "button" ? "button" : "puzzle";
    $id("unlockSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("sel", b.dataset.unlock === curUl));
    $id("pomoInput").value = state.settings.pomodoroMin || 25;
    $id("shareFocusToggle").textContent = state.settings.shareFocusTime !== false ? t("rem_on") : t("rem_off");
    $id("shareOtToggle").textContent = state.settings.shareOneThing ? t("rem_on") : t("rem_off");
    $id("teamFeedToggle").textContent = state.settings.teamFeed ? t("rem_on") : t("rem_off");
    $id("settingsModal").hidden = false;
  }

  // ---------- cloud sync ----------
  const CLIENT_KEY = "onething-client";
  let clientId = localStorage.getItem(CLIENT_KEY); if (!clientId) { clientId = uid() + uid(); try { localStorage.setItem(CLIENT_KEY, clientId); } catch (_) {} }
  let syncRef = null, cloudReady = false, lastTs = 0, applyingRemote = false;
  let authReady = false, cloudStarted = false;   // 익명 인증 완료/클라우드 연결 시작 여부
  function cloudConfigured() { return typeof firebase !== "undefined" && FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL; }
  function initSync() {
    if (!cloudConfigured()) { setSyncStatus("unconfigured"); return; }
    if (!cloudStarted) { return; }   // 인증 결과(성공/실패)가 나온 뒤 startCloud()에서 연결
    if (!currentUser) { if (syncRef) { syncRef.off(); syncRef = null; } cloudReady = false; setSyncStatus("nocode"); return; }
    try {
      const db = ensureFirebase(); if (!db) { setSyncStatus("error"); return; }
      if (syncRef) { syncRef.off(); syncRef = null; }
      cloudReady = false; lastTs = 0; syncRef = db.ref("notes/user_" + currentUser.id);
      syncRef.on("value", (snap) => {
        cloudReady = true; const val = snap.val();
        if (!val) { setSyncStatus("ok"); pushCloud(); return; }
        // 첫 연결(lastTs=0)에는 origin이 나여도 무조건 받아온다 — 같은 기기에서 계정 이전 시 데이터가 안 내려오던 문제 방지
        if (val.origin === clientId && lastTs > 0) { lastTs = Math.max(lastTs, val.ts || 0); setSyncStatus("ok"); return; }
        if ((val.ts || 0) <= lastTs) { setSyncStatus("ok"); return; }
        applyingRemote = true; state = migrate(val.data); lastTs = val.ts || 0;
        try { localStorage.setItem(notebookKey(), JSON.stringify(state)); } catch (_) {}
        applyLang(); render(); applyingRemote = false; setSyncStatus("ok"); toast(t("s_pulled"));
      }, () => setSyncStatus("error"));
    } catch (e) { setSyncStatus("error"); }
  }
  function pushCloud() {
    if (!cloudReady || !syncRef || applyingRemote) return;
    if (document.hidden) return;   // 백그라운드 탭이 최신 데이터를 덮어쓰지 않도록
    const ts = Date.now(); lastTs = ts;
    try { syncRef.set({ data: state, ts: ts, origin: clientId }); } catch (_) {}
  }
  function setSyncStatus(kind, code) {
    const chip = $id("syncChip"), stateEl = $id("syncState"); if (!chip) return; chip.classList.remove("on", "warn", "err");
    let c, m, cls;
    if (kind === "ok") { chip.classList.add("on"); c = t("s_on"); m = t("s_on_acct", currentUser ? currentUser.name : ""); cls = "on"; }
    else if (kind === "nocode") { chip.classList.add("warn"); c = t("s_nocode"); m = t("s_nocode_msg"); cls = "warn"; }
    else if (kind === "error") { chip.classList.add("err"); c = t("s_err"); m = t("s_err_msg"); cls = "err"; }
    else { c = t("s_unconf"); m = t("s_unconf_msg"); cls = "warn"; }
    chip.hidden = (kind !== "error"); chip.textContent = c; if (stateEl) { stateEl.textContent = m; stateEl.className = "sync-state " + cls; }
  }
  function refreshSyncState() { if (!cloudConfigured()) setSyncStatus("unconfigured"); else if (!currentUser) setSyncStatus("nocode"); else if (cloudReady) setSyncStatus("ok"); else setSyncStatus("nocode"); }
  function openSync() {
    $id("syncHelp").textContent = t("sync_acct_help");
    refreshSyncState(); $id("syncModal").hidden = false;
  }

  // ===== 요청(메신저) — 노트와 분리된 별도 데이터 =====
  const USER_KEY = "onething-user";   // 이 기기에 기억되는 로그인: JSON {id,name}
  // ===== 워크스페이스(회사 공간) =====
  let myWsId = null;                   // 내 소속 워크스페이스 id (null = 무소속 개인)
  let wsMeta = null;                   // 내 워크스페이스 메타 {name, code, owner}
  let wsAttached = null;               // 팀 리스너가 붙은 wsId
  function wsRef(p) { return msgDb.ref("ws/" + myWsId + "/" + p); }
  function teamIds() {                 // 같은 워크스페이스 구성원만
    if (!myWsId) return [];
    return Object.keys(usersCache).filter((id) => (usersCache[id] || {}).ws === myWsId);
  }
  function genWsCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c = "";
    for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  }
  let usersCache = {};                 // { userId: {name, pinH, createdAt, ws, role} }
  let requestsCache = {};              // { reqId: {from, fromName, to, toName, text, ts, status, replies, hiddenFor} }
  let msgDb = null;                    // firebase database (messaging)
  let knownReqIds = null;              // 토스트용: 이미 본 요청 id 집합(null=첫 로드 전)
  let reqTab = null;                   // 요청 팝업 활성 탭(null=닫힘)
  const REQ_PAGE = 10;                 // 한 번에 보여줄 요청 수
  let reqShown = { inbox: REQ_PAGE, sent: REQ_PAGE };  // 받은/보낸 현재 표시 개수

  // ===== 상태(프레즌스) =====
  const STATUS_KEY = "onething-status";        // 이 기기에 기억되는 마지막 수동 상태
  let statusCache = {};                        // { userId: {state, ts} }
  let prevManualStatus = localStorage.getItem(STATUS_KEY) || "work";
  if (prevManualStatus === "focus") prevManualStatus = "work";   // focus는 수동 상태가 아님 — 과거 잔류값 정리
  let vacInfo = {};   // {until(ms), deputy, deputyName}
  try { vacInfo = JSON.parse(localStorage.getItem("onething-vac") || "{}") || {}; } catch (_) {}
  if (prevManualStatus === "vacation" && (!vacInfo.until || vacInfo.until < Date.now())) prevManualStatus = "work";   // 복귀일 지남 → 자동 복귀
  let beforeFocusStatus = null;                // 타이머 자동 전환 전 상태(복원용)
  let presenceUid = null;                      // onDisconnect가 등록된 사용자 id
  function myStatus() {
    const s = currentUser && statusCache[currentUser.id];
    return (s && s.state) || "work";
  }
  function setMyStatus(state, opts) {
    if (!currentUser || !msgDb || !myWsId) return;
    const leavingFocus = myStatus() === "focus" && state !== "focus";
    if ((!opts || !opts.auto) && state !== "focus") { prevManualStatus = state; try { localStorage.setItem(STATUS_KEY, state); } catch (_) {} }
    const rec = { state: state, ts: Date.now() };
    if (state === "vacation" && vacInfo.until) {
      rec.until = vacInfo.until;
      if (vacInfo.deputy) { rec.deputy = vacInfo.deputy; rec.deputyName = vacInfo.deputyName || ""; }
    }
    // 타이머 종료 예정 시각 — 설정에서 공개를 켠 경우에만 공유
    if (state === "focus" && opts && opts.until && sharesFocusTime()) rec.until = opts.until;
    // 오늘의 원씽 공개(선택제)
    if (sharesOneThing()) { const a = activeTodo(); if (a) rec.ot = a.text; }
    statusCache[currentUser.id] = rec;   // 낙관적 반영
    try { wsRef("status/" + currentUser.id).set(rec); } catch (_) {}
    renderMyStatus();
    if (leavingFocus) flushPendingNotifies();
  }
  function sharesFocusTime() { return !state || !state.settings || state.settings.shareFocusTime !== false; }
  function sharesOneThing() { return !!(state && state.settings && state.settings.shareOneThing); }   // 기본: 비공개(선택제)
  let currentFocusUntil = null;   // 재공개(설정 토글)용으로 기억
  // 상태는 그대로 두고 부가 정보(남은 시간·공개 원씽)만 다시 발행
  function republishPresence() {
    if (!currentUser || !msgDb || !presenceUid) return;
    setMyStatus(myStatus(), { auto: true, until: currentFocusUntil || undefined });
  }
  // B안: 원씽이 지정되어 있으면 상태 = 원씽 중, 내려놓으면 이전 상태 복원
  function syncFocusPresence() {
    if (!currentUser || !msgDb) return;
    if (activeTodo()) setMyStatus("focus", { auto: true, until: (timerRunning && currentFocusUntil) ? currentFocusUntil : undefined });
    else if (myStatus() === "focus") setMyStatus(prevManualStatus || "work", { auto: true });
  }
  function ensureMyPresence() {
    if (!currentUser || !msgDb || !myWsId || presenceUid === currentUser.id) return;
    presenceUid = currentUser.id;
    const ref = wsRef("status/" + currentUser.id);
    try { ref.onDisconnect().set({ state: "away", ts: firebase.database.ServerValue.TIMESTAMP }); } catch (_) {}
    setMyStatus(prevManualStatus || "work", { auto: true });
    syncFocusPresence();   // 원씽이 이미 지정돼 있으면 로그인 직후에도 '원씽 중'
    requestNotify();   // 요청 도착 OS 알림용 권한 (한 번만 물어봄)
  }
  function releaseMyPresence() {
    if (!presenceUid || !msgDb || !myWsId) { presenceUid = null; return; }
    try {
      const ref = wsRef("status/" + presenceUid);
      ref.onDisconnect().cancel();
      ref.set({ state: "away", ts: Date.now() });
    } catch (_) {}
    presenceUid = null;
  }
  function renderMyStatus() {
    const btn = $id("statusBtn"); if (!btn) return;
    const show = !!currentUser && !!msgDb && !!myWsId;
    btn.hidden = !show; if (!show) return;
    const st = myStatus();
    const dot = $id("stDot"); if (dot) dot.className = "st-dot st-" + st;
    const lbl = $id("stLabel"); if (lbl) lbl.textContent = t("st_" + st);
    const modal = $id("statusModal");
    if (modal) modal.querySelectorAll(".st-opt").forEach((b) => {
      b.classList.toggle("sel", b.dataset.st === st);
      // '원씽 중'은 원씽이 지정되어 있어야 선택 가능 (B안)
      if (b.dataset.st === "focus") b.classList.toggle("disabled", !activeTodo());
    });
  }
  function statusDot(userId) {
    const s = statusCache[userId];
    const span = document.createElement("span");
    span.className = "st-dot st-" + ((s && s.state) || "away");
    return span;
  }
  // 팀 사이드바 — 내 카드 + 상태별 그룹 + 검색 + 최근 활동
  let spQuery = "";
  let spPinned = localStorage.getItem("onething-sp-pin") === "1";
  function fmtAgo(ts) {
    if (!ts) return "";
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return t("ago_now");
    if (m < 60) return t("ago_min", m);
    const h = Math.floor(m / 60);
    if (h < 24) return t("ago_hr", h);
    return t("ago_day", Math.floor(h / 24));
  }
  function fmtShortDate(ts) { const d = new Date(ts); return (d.getMonth() + 1) + "/" + d.getDate(); }
  function spAvatar(id) {
    const st = ((statusCache[id] || {}).state) || "away";
    const av = document.createElement("span"); av.className = "sp-av st-" + st;
    av.textContent = (((usersCache[id] || {}).name || "?").trim().charAt(0)) || "?";
    return av;
  }
  function updateBodyShift() {
    const p = $id("sidePanel");
    document.body.classList.toggle("sp-open", !!p && !p.hidden);
  }
  function applySidePin() {
    const on = spPinned && !!currentUser && cloudConfigured() && !!myWsId;
    const p = $id("sidePanel"), tab = $id("sideTab"), pin = $id("spPin");
    if (pin) { pin.classList.toggle("on", spPinned); pin.title = spPinned ? t("sp_pin_on_t") : t("sp_pin_off_t"); }
    if (on) { if (p) p.hidden = false; if (tab) tab.hidden = true; renderTeamBoard(); }
    else if (tab && currentUser && cloudConfigured() && myWsId) {
      tab.hidden = false;
      // 고정하지 않은 패널은 새로고침 시 닫힘 — 유지가 필요하면 고정핀 사용
    }
    updateBodyShift();
  }
  function openCompose(kind, toId) {
    if (!spPinned) { $id("sidePanel").hidden = true; updateBodyShift(); }
    openSendReq(kind);
    composeTo = toId; renderToChips(); updateToStatus();
  }
  function focusInfoOf(s) {   // 원씽 중 부가 정보: 남은 분 + 진행률
    if (!(s.until && s.until > Date.now())) return null;
    const left = Math.max(1, Math.round((s.until - Date.now()) / 60000));
    let pct = null;
    if (s.ts && s.until > s.ts) pct = Math.min(100, Math.max(2, Math.round(((Date.now() - s.ts) / (s.until - s.ts)) * 100)));
    return { left: left, pct: pct };
  }
  function renderTeamBoard() {
    const list = $id("spList"), badge = $id("sideTabBadge");
    if (!list) return;
    const ids = teamIds();
    const stOf = (id) => ((statusCache[id] || {}).state) || "away";
    const focusN = ids.filter((id) => stOf(id) === "focus").length;
    if (badge) { badge.textContent = focusN; badge.hidden = focusN === 0; }   // 접힘 탭 배지 = 집중 인원
    const tb = $id("teamBtnBadge"); if (tb) { tb.textContent = focusN; tb.hidden = focusN === 0; }
    if ($id("sidePanel").hidden) return;
    if (!currentUser) return;
    // 요약 한 줄
    const sum = $id("spSummary");
    if (sum) {
      const cnt = (st) => ids.filter((id) => stOf(id) === st).length;
      sum.textContent = t("sp_sum", ids.length) + " · " + t("st_focus") + " " + cnt("focus")
        + " · " + t("st_work") + " " + cnt("work") + " · " + t("st_away") + " " + cnt("away")
        + (cnt("vacation") ? " · " + t("st_vacation") + " " + cnt("vacation") : "");
    }
    // 내 카드 (상태 전환 포함)
    const meBox = $id("spMe");
    if (meBox) {
      meBox.innerHTML = "";
      const card = document.createElement("div"); card.className = "sp-me";
      const top = document.createElement("div"); top.className = "sp-me-top";
      top.appendChild(spAvatar(currentUser.id));
      const nm = document.createElement("span"); nm.className = "sp-me-name"; nm.textContent = currentUser.name; top.appendChild(nm);
      const stl = document.createElement("span"); stl.className = "sp-me-st";
      const myS = statusCache[currentUser.id] || {};
      let stTxt = t("st_" + myStatus());
      if (myStatus() === "focus") { const fi = focusInfoOf(myS); if (fi) stTxt += " · ~" + fi.left + t("min_unit"); }
      stl.textContent = stTxt; top.appendChild(stl);
      card.appendChild(top);
      const seg = document.createElement("div"); seg.className = "sp-me-seg";
      [["focus", "st_focus"], ["work", "st_work"], ["away", "st_away"]].forEach((pair) => {
        const b = document.createElement("button"); b.type = "button";
        b.className = myStatus() === pair[0] ? "sel" : "";
        const d = document.createElement("span"); d.className = "st-dot st-" + pair[0]; b.appendChild(d);
        b.appendChild(document.createTextNode(t(pair[1])));
        b.addEventListener("click", () => {
          if (pair[0] === "focus" && !activeTodo()) { toast(t("sp_need_ot")); return; }   // 원씽 중 = 원씽이 있어야
          setMyStatus(pair[0]); renderTeamBoard();
        });
        seg.appendChild(b);
      });
      card.appendChild(seg);
      meBox.appendChild(card);
    }
    // 구성원 목록 (나 제외, 상태별 그룹)
    list.innerHTML = "";
    const others = ids.filter((id) => id !== currentUser.id);
    const se = $id("spSearch"); if (se) se.hidden = others.length < 8;   // 검색은 8명 이상일 때만
    if (!others.length) {   // 아직 혼자 — 빈 화면 대신 초대 안내
      const cta = document.createElement("div"); cta.className = "sp-invite";
      const h4 = document.createElement("div"); h4.className = "sp-invite-h"; h4.textContent = t("sp_alone");
      cta.appendChild(h4);
      if (isAdmin() && wsMeta && wsMeta.code) {
        const codeRow = document.createElement("div"); codeRow.className = "sp-invite-code";
        const cd = document.createElement("b"); cd.textContent = wsMeta.code;
        const cp = document.createElement("button"); cp.type = "button";
        cp.textContent = canShareSheet() ? t("sp_share") : t("sp_share_copy");
        cp.addEventListener("click", shareInvite);
        codeRow.append(cd, cp); cta.appendChild(codeRow);
        const d = document.createElement("div"); d.className = "sp-invite-d"; d.textContent = t("sp_alone_d");
        cta.appendChild(d);
      } else {
        const d = document.createElement("div"); d.className = "sp-invite-d"; d.textContent = t("sp_alone_member");
        cta.appendChild(d);
      }
      list.appendChild(cta);
    }
    const q = spQuery.trim().toLowerCase();
    const match = (id) => !q || (((usersCache[id] || {}).name || "").toLowerCase().includes(q));
    ["focus", "work", "away", "vacation"].forEach((st) => {
      const members = ids.filter((id) => id !== currentUser.id && stOf(id) === st && match(id))
        .sort((a, b) => (((usersCache[a] || {}).name || "")).localeCompare((usersCache[b] || {}).name || ""));
      if (!members.length) return;
      const h = document.createElement("div"); h.className = "sp-group-h";
      const hd = document.createElement("span"); hd.className = "st-dot st-" + st; h.appendChild(hd);
      h.appendChild(document.createTextNode(t("st_" + st) + " (" + members.length + ")"));
      list.appendChild(h);
      members.forEach((id) => {
        const s = statusCache[id] || {};
        const row = document.createElement("div"); row.className = "sp-member";
        row.appendChild(spAvatar(id));
        const body = document.createElement("div"); body.className = "sp-m-body";
        const nm = document.createElement("div"); nm.className = "sp-m-name"; nm.textContent = (usersCache[id] || {}).name || "?";
        body.appendChild(nm);
        let info = "";
        if (st === "focus") {
          const fi = focusInfoOf(s);
          if (fi) info += "~" + fi.left + t("min_unit");
          if (s.ot) info += (info ? " · " : "") + s.ot;
          if (fi && fi.pct != null) {
            const bar = document.createElement("div"); bar.className = "sp-bar";
            const fill = document.createElement("div"); fill.className = "sp-bar-fill"; fill.style.width = fi.pct + "%";
            bar.appendChild(fill); body.appendChild(bar);
          }
        } else if (st === "vacation") {
          if (s.until) info = "~" + fmtShortDate(s.until);
          if (s.deputyName) info += (info ? " · " : "") + t("vac_deputy_is", s.deputyName);
        } else if (st === "away" && s.ts) info = fmtAgo(s.ts) + " " + t("st_away");
        else if (s.ot) info = s.ot;
        if (info) { const inf = document.createElement("div"); inf.className = "sp-m-info"; inf.textContent = info; body.appendChild(inf); }
        row.appendChild(body);
        // hover 액션: 쪽지 / 업무 요청 바로 보내기
        const acts = document.createElement("span"); acts.className = "sp-acts";
        [["memo", "kind_memo"], ["task", "kind_task"]].forEach((pair) => {
          const b = document.createElement("button"); b.type = "button"; b.textContent = t(pair[1]);
          b.addEventListener("click", (e) => { e.stopPropagation(); openCompose(pair[0], id); });
          acts.appendChild(b);
        });
        row.appendChild(acts);
        row.addEventListener("click", () => {   // 탭하면 [쪽지][업무 요청] 펼침 (터치 환경 대응)
          const was = row.classList.contains("open");
          list.querySelectorAll(".sp-member.open").forEach((r2) => r2.classList.remove("open"));
          if (!was) row.classList.add("open");
        });
        list.appendChild(row);
      });
    });
    if (others.length && !list.querySelector(".sp-member")) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("no_results"); list.appendChild(e); }
    // 최근 활동 (설정에서 켠 경우만 — 기본 꺼짐)
    const feed = $id("spFeed");
    if (feed) {
      feed.innerHTML = "";
      if (state.settings && state.settings.teamFeed) {
        const hidden = loadFeedHidden();
        const evts = [];
        Object.keys(requestsCache).forEach((id) => {
          const r = requestsCache[id]; if (!r) return;
          if (r.ts) evts.push({ key: id + ":sent:" + r.ts, ts: r.ts, txt: t("fd_sent", r.fromName || "?", r.toName || "?") });
          if (r.status === "done" && r.doneAt) evts.push({ key: id + ":done:" + r.doneAt, ts: r.doneAt, txt: t("fd_done", r.toName || "?") });
          (Array.isArray(r.replies) ? r.replies : []).forEach((rep) => { if (rep && rep.ts) evts.push({ key: id + ":rep:" + rep.ts, ts: rep.ts, txt: t("fd_reply", rep.fromName || "?") }); });
        });
        evts.sort((a, b) => b.ts - a.ts);
        const shown = evts.filter((ev) => !hidden.has(ev.key));
        if (shown.length) {
          const h = document.createElement("div"); h.className = "sp-group-h"; h.textContent = t("sp_feed_h");
          feed.appendChild(h);
          shown.slice(0, 5).forEach((ev) => {
            const it = document.createElement("div"); it.className = "sp-feed-item";
            const tx = document.createElement("span"); tx.textContent = ev.txt;
            const right = document.createElement("span"); right.style.cssText = "display:flex;gap:6px;align-items:center;flex:none";
            const tm = document.createElement("span"); tm.textContent = fmtAgo(ev.ts);
            const x = document.createElement("button"); x.className = "fd-del"; x.type = "button"; x.textContent = "✕"; x.title = t("fd_del");
            x.addEventListener("click", () => { hidden.add(ev.key); saveFeedHidden(hidden); renderTeamBoard(); });
            right.append(tm, x);
            it.append(tx, right); feed.appendChild(it);
          });
        }
      }
    }
  }
  // 최근 활동 개별 숨김 — 내 브라우저에만 적용(기기별)
  function feedHideKey() { return "onething-feedhide::" + ((currentUser && currentUser.id) || "anon"); }
  function loadFeedHidden() {
    try { return new Set(JSON.parse(localStorage.getItem(feedHideKey()) || "[]")); } catch (_) { return new Set(); }
  }
  function saveFeedHidden(set) {
    try { localStorage.setItem(feedHideKey(), JSON.stringify(Array.from(set).slice(-200))); } catch (_) {}
  }
  // 경과 시간·진행 바 갱신 — 패널이 열려 있을 때만 1분마다
  setInterval(() => { const p = $id("sidePanel"); if (p && !p.hidden) renderTeamBoard(); }, 60000);
  // focus 해제 시 쌓인 알림(새 요청 + 새 답장) 몰아서 표시 + '지켜진 집중' 기록
  function weekStartStr() { const dow = (parseDate(todayStr()).getDay() + 6) % 7; return addDaysStr(todayStr(), -dow); }
  function flushPendingNotifies() {
    const n = pendingNotifyIds.size + pendingReplyIds.size;
    if (!n) return;
    pendingNotifyIds = new Set(); pendingReplyIds = new Set();
    state.guarded = state.guarded || {};
    const wk = weekStartStr();
    state.guarded[wk] = (state.guarded[wk] || 0) + n;
    save();
    toast(t("rq_flush", n));
    renderUnreadBadge();
  }

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
      usersLoaded = true;
      resolveCurrentUser(); renderTeamBoard();
      maybeProfileSetup();   // 첫 로그인이면 이름 설정/기존 계정 연결
      attachWsListeners();   // 소속이 확인되면 팀 데이터 연결
    });
  }
  // 워크스페이스가 정해진 뒤에만 팀 데이터(요청·상태·프로젝트) 연결
  function attachWsListeners() {
    if (!msgDb || !myWsId || wsAttached === myWsId) return;
    wsAttached = myWsId;
    msgDb.ref("workspaces/" + myWsId).on("value", (snap) => { wsMeta = snap.val(); });
    wsRef("requests").on("value", (snap) => {
      requestsCache = snap.val() || {};
      notifyNewRequests();
      renderRequests(); renderUnreadBadge();
    });
    wsRef("status").on("value", (snap) => {
      statusCache = snap.val() || {};
      renderMyStatus(); renderTeamBoard();
      const m = $id("sendReqModal"); if (m && !m.hidden) { renderToChips(); updateToStatus(); }
    });
    wsRef("projects").on("value", (snap) => {
      projectsCache = snap.val() || {};
      const cp = currentProject && projectsCache[currentProject];
      if (currentProject && (!cp || !projectVisible(cp))) { currentProject = null; render(); }
      else if (currentProject) render();   // 멤버 바 등 갱신
      else renderGroupTabs();
    });
    wsRef("projectTodos").on("value", (snap) => {
      projectTodosCache = snap.val() || {};
      renderGroupTabs();
      if (currentProject) renderTodos();
    });
  }
  // 익명 인증 성공 후 한 번만 클라우드(메신저+노트) 연결
  function startCloud() {
    if (cloudStarted) return; cloudStarted = true;
    initMessaging();
    if (currentUser) initSync();
    refreshSyncState();
  }
  // ===== 정식 인증(Firebase Auth): 이메일+비밀번호 / Google =====
  let authUser = null;       // firebase auth user
  let usersLoaded = false;   // users 프로필 목록 1회 로드 여부
  function ensureAuth() {
    const db = ensureFirebase();
    if (!db) return;
    try {
      const auth = firebase.auth();
      try { auth.languageCode = "ko"; } catch (_) {}   // 인증·재설정 메일과 확인 화면을 한국어로
      auth.onAuthStateChanged((user) => {
        if (user && user.isAnonymous) { try { auth.signOut(); } catch (_) {} return; }   // 구버전 익명 세션 정리
        try { if (user) localStorage.setItem("onething-has-session", "1"); else localStorage.removeItem("onething-has-session"); } catch (_) {}
        setTimeout(() => document.body.classList.remove("auth-wait"), 60);   // 세션 판정 완료 — 노트 표시
        authUser = user || null;
        if (authUser) { authReady = true; startCloud(); resolveCurrentUser(); maybeProfileSetup(); }
        else { currentUser = null; myWsId = null; updateLoginGate(); showLoginGate(); }
      });
    } catch (e) {}
  }
  function mapAuthErr(e) {
    const c = (e && e.code) || "";
    if (c.includes("invalid-email")) return t("au_e_email");
    if (c.includes("email-already-in-use")) return t("au_e_dup");
    if (c.includes("weak-password")) return t("au_e_weak");
    if (c.includes("wrong-password") || c.includes("invalid-credential") || c.includes("invalid-login")) return t("au_e_cred");
    if (c.includes("user-not-found")) return t("au_e_nouser");
    if (c.includes("too-many-requests")) return t("au_e_many");
    if (c.includes("operation-not-allowed")) return t("au_e_off");
    if (c.includes("popup")) return t("au_e_popup");
    return t("ws_err");
  }
  // 비밀번호 정책: 8자 이상 + 영문 + 숫자 (특수문자 권장)
  function pwPolicyOk(pw) { return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw); }
  function pwScore(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(4, s);
  }
  let lastResolvedUid = null;   // 계정이 바뀐 순간에만 노트를 다시 연결
  function resolveCurrentUser() {
    if (authUser && usersCache[authUser.uid]) currentUser = Object.assign({ id: authUser.uid }, usersCache[authUser.uid]);
    else currentUser = null;
    myWsId = (currentUser && currentUser.ws) || null;
    claimAdmin();
    if (currentUser) hideLoginGate();
    const uidNow = currentUser ? currentUser.id : null;
    if (uidNow !== lastResolvedUid) {
      lastResolvedUid = uidNow;
      if (uidNow) { switchNotebook(); setTimeout(maybeJoinInvite, 900); }   // ★ 로그인 확정 시 노트 연결 + 초대 링크 자동 참여
    }
    updateLoginGate();
  }
  // 로그인은 됐는데 프로필(users/{uid})이 없으면 → 이름 설정 + (선택) 기존 계정 연결
  function maybeProfileSetup() {
    if (!authUser || !usersLoaded) return;
    if (usersCache[authUser.uid]) { $id("profileModal").hidden = true; return; }
    hideLoginGate();
    $id("pfName").value = authUser.displayName || "";
    $id("pfMsg").textContent = "";
    $id("profileModal").hidden = false;
  }
  async function createProfile() {
    if (!authUser || !msgDb) return;
    const name = ($id("pfName").value || "").trim();
    if (!name) { $id("pfMsg").textContent = t("rq_need_name"); return; }
    if (findUserByName(name)) { $id("pfMsg").textContent = t("rq_dup_name"); return; }
    try {
      await msgDb.ref("users/" + authUser.uid).set({ name: name, email: authUser.email || "", createdAt: Date.now() });
      $id("profileModal").hidden = true;
    } catch (_) { $id("pfMsg").textContent = t("ws_err"); }
  }
  // ----- 워크스페이스 만들기/참여/이전 -----
  async function createWs(name) {
    if (!msgDb || !currentUser) { toast(t("rq_offline")); return; }
    name = (name || "").trim(); if (!name) return;
    const wsId = uid(); const code = genWsCode();
    try {
      await msgDb.ref("workspaces/" + wsId).set({ name: name, code: code, owner: currentUser.id, createdAt: Date.now() });
      await msgDb.ref("users/" + currentUser.id).update({ ws: wsId, role: "owner" });
      alert(t("ws_created", name, code));
      location.reload();
    } catch (_) { toast(t("ws_err")); }
  }
  // ── 초대 링크 공유 (A안): OS 공유 시트(카톡·문자 등) 또는 클립보드 ──
  function inviteLink(code) { return location.origin + location.pathname + "?invite=" + code; }
  // 공유 시트는 터치 기기(폰·태블릿)에서만 — PC에선 복사가 더 빠르고 확실
  function canShareSheet() { try { return !!navigator.share && matchMedia("(pointer: coarse)").matches; } catch (_) { return false; } }
  async function shareInvite() {
    if (!wsMeta || !wsMeta.code || !currentUser) return;
    const msg = t("sp_share_msg", currentUser.name, wsMeta.name || "", inviteLink(wsMeta.code));
    if (canShareSheet()) {
      try { await navigator.share({ text: msg }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(msg); toast(t("sp_copied")); } catch (_) {}
  }
  // 초대 링크(?invite=코드)로 들어온 경우: 로그인 후 자동 참여
  let pendingInvite = null;
  try {
    const im = location.search.match(/[?&]invite=([A-Za-z0-9]{4,10})/);
    if (im) {
      pendingInvite = im[1].toUpperCase();
      localStorage.setItem("onething-pending-invite", pendingInvite);
      history.replaceState(null, "", location.pathname);   // 주소창에서 코드 감춤
    } else pendingInvite = localStorage.getItem("onething-pending-invite") || null;
  } catch (_) {}
  function clearInvite() {
    pendingInvite = null;
    try { localStorage.removeItem("onething-pending-invite"); } catch (_) {}
    const ib = $id("inviteBanner"); if (ib) ib.hidden = true;
  }
  let inviteJoining = false;
  async function maybeJoinInvite() {
    if (!pendingInvite || !currentUser || !msgDb || inviteJoining) return;
    inviteJoining = true;
    try {
      const snap = await msgDb.ref("workspaces").once("value");
      const all = snap.val() || {};
      const wsId = Object.keys(all).find((k2) => ((all[k2] || {}).code || "") === pendingInvite);
      if (!wsId) { clearInvite(); toast(t("ws_bad_code")); return; }
      if (myWsId === wsId) { clearInvite(); return; }
      const nm = (all[wsId] || {}).name || wsId;
      if (!confirm(t("iv_join_q", nm))) { clearInvite(); return; }
      if (myWsId && !confirm(t("iv_switch_q", nm))) { clearInvite(); return; }
      await msgDb.ref("users/" + currentUser.id).update({ ws: wsId, role: "member" });
      clearInvite();
      alert(t("iv_joined", nm));
      location.reload();
    } catch (_) {} finally { inviteJoining = false; }
  }
  async function joinWs(code) {
    if (!msgDb || !currentUser) { toast(t("rq_offline")); return; }
    code = (code || "").trim().toUpperCase(); if (!code) return;
    try {
      const snap = await msgDb.ref("workspaces").once("value");
      const all = snap.val() || {};
      const wsId = Object.keys(all).find((k) => ((all[k] || {}).code || "") === code);
      if (!wsId) { toast(t("ws_bad_code")); return; }
      await msgDb.ref("users/" + currentUser.id).update({ ws: wsId, role: "member" });
      location.reload();
    } catch (_) { toast(t("ws_err")); }
  }
  // ----- 관리자 -----
  // 제작자(나두혁) 계정에 최초 1회 admin 플래그를 자동 부여
  function claimAdmin() {
    if (!currentUser || !msgDb) return;
    const rec = usersCache[currentUser.id];
    if (rec && rec.name === "나두혁" && !rec.admin) {
      try { msgDb.ref("users/" + currentUser.id + "/admin").set(true); rec.admin = true; } catch (_) {}
    }
  }
  function isAdmin() {
    const u = currentUser && usersCache[currentUser.id];
    return !!(u && (u.role === "owner" || u.role === "admin" || u.admin));
  }
  function renderUmWs() {
    const info = $id("umWsInfo"), join = $id("umWsJoin");
    if (!info || !join) return;
    const vb = $id("umVerify");
    const needVerify = () => !!(authUser && authUser.providerData.some((pd) => pd.providerId === "password") && !authUser.emailVerified);
    if (vb) {
      vb.hidden = !needVerify();
      // 표시 전 서버에서 최신 인증 상태 재확인 — 다른 기기·메일 링크에서 인증한 직후에도 배너가 남지 않게
      if (!vb.hidden && authUser) authUser.reload().then(() => { vb.hidden = !needVerify(); }).catch(() => {});
    }
    const pf = $id("umPlatform"); if (pf) pf.hidden = !isSuperAdmin();
    if (myWsId) {
      join.hidden = true;
      let txt = t("ws_current", (wsMeta && wsMeta.name) || myWsId);
      if (isAdmin() && wsMeta && wsMeta.code) txt += "\n" + t("ws_code", wsMeta.code);
      info.textContent = txt;
      const rb = $id("wsRegenBtn"); if (rb) rb.hidden = !isAdmin();
      const sb2 = $id("wsShareBtn");
      if (sb2) { sb2.hidden = !(isAdmin() && wsMeta && wsMeta.code); sb2.textContent = canShareSheet() ? t("sp_share") : t("sp_share_copy"); }
    } else {
      const rb = $id("wsRegenBtn"); if (rb) rb.hidden = true;
      info.textContent = t("ws_none");
      join.hidden = false;
    }
  }
  // ─── 플랫폼 관리(최고관리자 전용) ───
  const SUPER_ADMIN_UID = "srqAaRgdmLhYeCyEFeiUA552cvA3";   // 서비스 운영자(나두혁) 계정
  function isSuperAdmin() { return !!(currentUser && currentUser.id === SUPER_ADMIN_UID); }
  let pfWsCache = {};
  async function openPlatform() {
    if (!isSuperAdmin() || !msgDb) return;
    try { const snap = await msgDb.ref("workspaces").once("value"); pfWsCache = snap.val() || {}; } catch (_) { pfWsCache = {}; }
    $id("pfModal").hidden = false;
    const si = $id("pfSearch"); if (si) { si.value = ""; si.focus(); }
    renderPlatform("");
  }
  function pfDelBtn(id) {   // 최고관리자 전용: 비밀번호 재설정 메일 + 계정(프로필) 삭제
    const wrap = document.createElement("span"); wrap.style.cssText = "display:flex;gap:4px;flex:none";
    const rec = usersCache[id] || {};
    const rp = document.createElement("button"); rp.className = "rq-btn"; rp.textContent = t("pw_reset");
    rp.addEventListener("click", async () => {
      if (!rec.email) { toast(t("pw_reset_noemail")); return; }
      if (!confirm(t("pw_reset_confirm", rec.name || "?", rec.email))) return;
      try { await firebase.auth().sendPasswordResetEmail(rec.email); toast(t("au_forgot_sent")); } catch (e) { toast(mapAuthErr(e)); }
    });
    wrap.append(rp);
    const b = document.createElement("button"); b.className = "rq-btn"; b.textContent = t("um_del");
    if (id === SUPER_ADMIN_UID) { b.disabled = true; b.style.opacity = ".4"; }
    else b.addEventListener("click", () => { deleteUser(id); setTimeout(() => renderPlatform(($id("pfSearch") || {}).value || ""), 300); });
    wrap.append(b);
    return wrap;
  }
  function renderPlatform(q) {
    const body = $id("pfBody"), sum = $id("pfSummary");
    if (!body) return;
    q = (q || "").trim().toLowerCase();
    const allUids = Object.keys(usersCache);
    const wsIds = Object.keys(pfWsCache);
    const soloUids = allUids.filter((u2) => !(usersCache[u2] || {}).ws);
    if (sum) sum.textContent = t("pf_sum", wsIds.length, allUids.length, soloUids.length);
    const hitUser = (u2) => { const rec = usersCache[u2] || {}; return !q || (rec.name || "").toLowerCase().includes(q) || (rec.email || "").toLowerCase().includes(q); };
    body.innerHTML = "";
    let shown = 0;
    wsIds.sort((a, b) => ((pfWsCache[b] || {}).createdAt || 0) - ((pfWsCache[a] || {}).createdAt || 0)).forEach((wid) => {
      const w = pfWsCache[wid] || {};
      const members = allUids.filter((u2) => (usersCache[u2] || {}).ws === wid);
      const wsHit = !q || (w.name || "").toLowerCase().includes(q);
      const memberHits = members.filter(hitUser);
      if (!wsHit && !memberHits.length) return;
      shown++;
      const card = document.createElement("div");
      card.style.cssText = "border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin:10px 0;background:var(--surface)";
      const h = document.createElement("div"); h.style.cssText = "font-weight:700;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap";
      const hl = document.createElement("span"); hl.textContent = (w.name || wid);
      const hr = document.createElement("span"); hr.className = "rq-meta";
      hr.textContent = t("pf_members_n", members.length) + (w.createdAt ? " · " + fmtReqTime(w.createdAt) : "") + (w.code ? " · " + w.code : "");
      h.append(hl, hr); card.append(h);
      const ul = document.createElement("div"); ul.style.marginTop = "6px";
      (q ? memberHits : members).forEach((u2) => {
        const rec = usersCache[u2] || {};
        const row = document.createElement("div"); row.className = "sp-feed-item";
        const nm = document.createElement("span");
        nm.textContent = (rec.name || "?") + (rec.email ? " · " + rec.email : "");
        if (rec.role === "owner" || rec.role === "admin") {
          const rc = document.createElement("span"); rc.className = "rq-kind-chip task"; rc.style.marginLeft = "6px";
          rc.textContent = rec.role === "owner" ? t("pf_owner") : t("pf_admin"); nm.append(rc);
        }
        const tm = document.createElement("span"); tm.className = "rq-meta"; tm.textContent = rec.createdAt ? fmtReqTime(rec.createdAt) : "";
        row.append(nm, tm, pfDelBtn(u2)); ul.append(row);
      });
      card.append(ul); body.append(card);
    });
    const soloHits = soloUids.filter(hitUser);
    if (soloHits.length) {
      shown++;
      const sc = document.createElement("div");
      sc.style.cssText = "border:1px dashed var(--border);border-radius:10px;padding:10px 12px;margin:10px 0";
      const sh = document.createElement("div"); sh.style.fontWeight = "700"; sh.textContent = t("pf_solo_h") + " (" + soloHits.length + ")";
      sc.append(sh);
      soloHits.forEach((u2) => {
        const rec = usersCache[u2] || {};
        const row = document.createElement("div"); row.className = "sp-feed-item";
        const nm = document.createElement("span"); nm.textContent = (rec.name || "?") + (rec.email ? " · " + rec.email : "");
        const tm = document.createElement("span"); tm.className = "rq-meta"; tm.textContent = rec.createdAt ? fmtReqTime(rec.createdAt) : "";
        row.append(nm, tm, pfDelBtn(u2)); sc.append(row);
      });
      body.append(sc);
    }
    if (!shown) { const em = document.createElement("p"); em.className = "empty-note"; em.textContent = t("pf_empty"); body.append(em); }
  }
  // ─── 플랫폼 문의(Q&A) ───
  function renderQna() {
    const list = $id("qnaList"); if (!list || !currentUser || !msgDb) return;
    msgDb.ref("qna/" + currentUser.id).once("value").then((s) => {
      const d = s.val() || {}; list.innerHTML = "";
      const ids = Object.keys(d).sort((a, b) => (d[b].ts || 0) - (d[a].ts || 0));
      if (!ids.length) { const p = document.createElement("p"); p.className = "empty-note"; p.textContent = t("qna_empty"); list.append(p); return; }
      ids.forEach((qid) => {
        const q = d[qid] || {};
        const box = document.createElement("div");
        box.style.cssText = "border:1px solid var(--border);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:.9rem";
        const head = document.createElement("div"); head.className = "rq-meta"; head.style.marginBottom = "3px";
        head.textContent = fmtReqTime(q.ts) + " · " + (q.answer ? t("qna_ans") + " ✓" : t("qna_wait"));
        const del = document.createElement("button"); del.className = "rq-btn"; del.style.float = "right"; del.textContent = t("qna_del");
        del.addEventListener("click", () => { msgDb.ref("qna/" + currentUser.id + "/" + qid).remove().then(renderQna); });
        head.append(del);
        const tx = document.createElement("div"); tx.textContent = q.text || "";
        box.append(head, tx);
        if (q.answer && q.answer.text) {
          const an = document.createElement("div");
          an.style.cssText = "margin-top:7px;padding:7px 10px;border-radius:8px;background:var(--accent-soft);white-space:pre-line";
          an.textContent = "↩ " + (q.answer.byName || "운영진") + ": " + q.answer.text;
          const at = document.createElement("div"); at.className = "rq-meta"; at.textContent = fmtReqTime(q.answer.ts);
          an.append(at); box.append(an);
        }
        list.append(box);
      });
    }).catch(() => {});
  }
  // ─── 회원 탈퇴 (본인): 데이터 삭제 + 로그인 계정까지 완전 삭제 ───
  (function wireWithdraw() {
    const b = $id("withdrawBtn"); if (!b) return;
    b.addEventListener("click", async () => {
      if (!authUser || !msgDb) return;
      if (!confirm(t("wd_confirm1"))) return;
      if (!confirm(t("wd_confirm2"))) return;
      const uid0 = authUser.uid;
      try {
        const myWs = (usersCache[uid0] || {}).ws || null;
        const jobs = [
          msgDb.ref("notes/user_" + uid0).remove(),
          msgDb.ref("qna/" + uid0).remove(),
          msgDb.ref("users/" + uid0).remove()
        ];
        if (myWs) jobs.push(msgDb.ref("ws/" + myWs + "/status/" + uid0).remove().catch(() => {}));
        await Promise.all(jobs);
        await authUser.delete();   // 로그인 계정(Auth)까지 삭제 — 껍데기 안 남김
        try { localStorage.removeItem("onething-notebook::" + uid0); } catch (_) {}
        alert(t("wd_done"));
        location.reload();
      } catch (e) {
        if (e && e.code === "auth/requires-recent-login") toast(t("wd_relogin"));
        else toast((e && e.message) || "오류");
      }
    });
  })();
  (function wireQna() {
    const ob = $id("qnaBtn"), md = $id("qnaModal"), cb = $id("qnaClose"), sd = $id("qnaSend"), tx = $id("qnaText");
    if (ob) ob.addEventListener("click", () => { $id("userModal").hidden = true; md.hidden = false; renderQna(); });
    if (cb) cb.addEventListener("click", () => { md.hidden = true; });
    if (md) md.addEventListener("click", (e) => { if (e.target === md) md.hidden = true; });
    if (sd) sd.addEventListener("click", () => {
      const v = (tx.value || "").trim(); if (!v || !currentUser || !msgDb) return;
      const qid = uid();
      msgDb.ref("qna/" + currentUser.id + "/" + qid).set({
        text: v, ts: Date.now(), name: currentUser.name || "?", email: (usersCache[currentUser.id] || {}).email || ""
      }).then(() => { tx.value = ""; toast(t("qna_sent")); renderQna(); }).catch(() => {});
    });
  })();
  (function wirePlatform() {
    const ob = $id("pfOpenBtn"), cb = $id("pfClose"), si = $id("pfSearch"), md = $id("pfModal");
    if (ob) ob.addEventListener("click", () => { $id("userModal").hidden = true; openPlatform(); });
    if (cb) cb.addEventListener("click", () => { md.hidden = true; });
    if (md) md.addEventListener("click", (e) => { if (e.target === md) md.hidden = true; });
    if (si) si.addEventListener("input", () => renderPlatform(si.value));
  })();
  // 관리자 행위 기록
  function logAdmin(action, target) {
    if (!msgDb || !myWsId || !currentUser) return;
    try { wsRef("audit/" + uid()).set({ ts: Date.now(), by: currentUser.name, action: action, target: target || "" }); } catch (_) {}
  }
  function renderAudit() {
    const box = $id("umAudit"), list = $id("umAuditList");
    if (!box || !list) return;
    if (!isAdmin() || !myWsId) { box.hidden = true; return; }
    wsRef("audit").limitToLast(5).once("value").then((s) => {
      const d = s.val() || {};
      const items = Object.keys(d).map((k) => d[k]).sort((a, b) => (b.ts || 0) - (a.ts || 0));
      if (!items.length) { box.hidden = true; return; }
      box.hidden = false; list.innerHTML = "";
      items.forEach((it) => {
        const row = document.createElement("div"); row.className = "sp-feed-item";
        const tx = document.createElement("span"); tx.textContent = it.by + " — " + it.action + (it.target ? " (" + it.target + ")" : "");
        const tm = document.createElement("span"); tm.textContent = fmtAgo(it.ts);
        row.append(tx, tm); list.append(row);
      });
    }).catch(() => {});
  }
  function renderMembers() {
    const box = $id("umAdmin"), ul = $id("umMemberList"); if (!box || !ul) return;
    renderAudit();
    if (!isAdmin()) { box.hidden = true; return; }
    box.hidden = false; ul.innerHTML = "";
    teamIds().forEach((id) => {
      if (id === currentUser.id) return;
      const u = usersCache[id] || {};
      const li = document.createElement("li");
      const dot = statusDot(id);
      const tx = document.createElement("span"); tx.className = "mtext"; tx.textContent = u.name || "?";
      if (u.role === "admin") { const rc = document.createElement("span"); rc.className = "rq-kind-chip task"; rc.textContent = t("role_admin"); tx.append(document.createTextNode(" "), rc); }
      li.append(dot, tx);   // 비밀번호는 본인 셀프 재설정(로그인 화면) — 사내관리자 권한 아님
      // 오너: 관리자 승격/해제
      if ((usersCache[currentUser.id] || {}).role === "owner") {
        const pr = document.createElement("button");
        pr.textContent = u.role === "admin" ? t("role_demote") : t("role_promote");
        pr.addEventListener("click", () => {
          try { msgDb.ref("users/" + id + "/role").set(u.role === "admin" ? "member" : "admin"); logAdmin(u.role === "admin" ? "관리자 해제" : "관리자 승격", u.name || "?"); } catch (_) {}
          setTimeout(renderMembers, 300);
        });
        li.append(pr);
      }
      // 내보내기(퇴사 처리): 소속 해제 + 미완료 요청을 나에게 전달
      const kick = document.createElement("button"); kick.textContent = t("kick_btn");
      kick.addEventListener("click", () => {
        if (!confirm(t("kick_confirm", u.name || "?"))) return;
        try {
          const ups = {};
          Object.keys(requestsCache).forEach((rid) => {
            const r = requestsCache[rid];
            if (r && r.to === id && r.status !== "done") {
              ups[rid + "/to"] = currentUser.id; ups[rid + "/toName"] = currentUser.name;
              ups[rid + "/status"] = "sent"; ups[rid + "/forwardedBy"] = u.name || "?"; ups[rid + "/forwardedAt"] = Date.now();
            }
          });
          if (Object.keys(ups).length) wsRef("requests").update(ups);
          wsRef("status/" + id).remove();
          const oldWs = u.ws || null, oldRole = u.role || null;
          const amOwner = (usersCache[currentUser.id] || {}).role === "owner";
          const upd = { ws: null }; if (amOwner) upd.role = null;   // 직책 변경은 오너만(규칙과 일치)
          msgDb.ref("users/" + id).update(upd);
          logAdmin("내보내기", u.name || "?");
          toastUndo(t("kick_done", u.name || "?"), () => {
            try { const back = { ws: oldWs }; if (amOwner) back.role = oldRole; msgDb.ref("users/" + id).update(back); } catch (_) {}
          });
        } catch (_) {}
        setTimeout(renderMembers, 300);
      });
      li.append(kick); ul.append(li);   // 계정 삭제는 사내관리자 권한이 아님 — 플랫폼 관리(최고관리자)에서만
    });
    if (!ul.children.length) { const li = document.createElement("li"); li.className = "empty-note"; li.textContent = t("lg_empty"); ul.append(li); }
  }
  function deleteUser(id) {
    if (!isSuperAdmin() || !msgDb) return;   // 계정(프로필) 삭제는 플랫폼 운영자만
    const u = usersCache[id]; if (!u) return;
    if (!confirm(t("um_del_confirm", u.name || "?"))) return;
    try {
      const targetWs = u.ws || null;
      msgDb.ref("users/" + id).remove();
      if (targetWs) msgDb.ref("ws/" + targetWs + "/status/" + id).remove().catch(() => {});
      delete usersCache[id];
    } catch (_) {}
    logAdmin("구성원 삭제", (u || {}).name || "?");
    renderMembers(); renderTeamBoard();
    toast(t("um_deleted"));
  }
  function findUserByName(name) {
    name = (name || "").trim();
    for (const id in usersCache) if (((usersCache[id] || {}).name || "").trim() === name) return Object.assign({ id }, usersCache[id]);
    return null;
  }
  // ----- 이메일/구글 인증 액션 -----
  let signupMode = false;
  function setAuthMode(signup) {
    signupMode = signup;
    $id("signupExtra").hidden = !signup;
    $id("authPrimary").textContent = signup ? t("au_signup") : t("au_login");
    $id("authToggle").textContent = signup ? t("au_to_login") : t("au_to_signup");
    $id("authMsg").textContent = "";
  }
  async function doAuthPrimary() {
    const auth = firebase.auth();
    const email = ($id("auEmail").value || "").trim();
    const pw = $id("auPw").value || "";
    const msg = $id("authMsg");
    msg.textContent = "";
    if (!email) { msg.textContent = t("au_e_email"); return; }
    try {
      if (signupMode) {
        const name = ($id("auName").value || "").trim();
        if (!name) { msg.textContent = t("rq_need_name"); return; }
        if (!pwPolicyOk(pw)) { msg.textContent = t("au_e_weak"); return; }
        if (pw !== $id("auPw2").value) { msg.textContent = t("au_e_pw2"); return; }
        const cred = await auth.createUserWithEmailAndPassword(email, pw);
        try { await cred.user.updateProfile({ displayName: name }); } catch (_) {}
        try { await cred.user.sendEmailVerification(); toast(t("au_verify_sent")); } catch (_) {}
        // 프로필은 로그인 후 users 스냅샷 기준으로 maybeProfileSetup에서 생성(이름 미리 채움)
      } else {
        await auth.signInWithEmailAndPassword(email, pw);
      }
    } catch (e) { msg.textContent = mapAuthErr(e); }
  }
  async function doGoogle() {
    try {
      await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (e) { $id("authMsg").textContent = mapAuthErr(e); }
  }
  async function doForgot() {
    const email = ($id("auEmail").value || "").trim();
    if (!email) { $id("authMsg").textContent = t("au_forgot_need"); return; }
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      $id("authMsg").textContent = t("au_forgot_sent");
    } catch (e) { $id("authMsg").textContent = mapAuthErr(e); }
  }
  function logoutUser() {
    releaseMyPresence();
    currentUser = null;
    if (syncRef) { syncRef.off(); syncRef = null; } cloudReady = false;
    try { firebase.auth().signOut(); } catch (_) {}
    state = migrate(null); render(); updateLoginGate(); refreshSyncState();
  }
  function switchNotebook() {
    state = loadState();
    try {   // 잠금 해제 방식 1회 초기화(계정별) — 클라우드에서 복원된 설정에도 적용
      const k = "onething-ul-reset::" + (currentUser ? currentUser.id : "anon");
      if (!localStorage.getItem(k)) {
        if (state.settings.unlockMode === "button") state.settings.unlockMode = "puzzle";
        localStorage.setItem(k, "1");
      }
    } catch (_) {}
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

  // ----- 서식 본문 sanitize (타 사용자 발신 HTML — 표시·저장 전 필수) -----
  const OK_TAGS = { B:1, STRONG:1, U:1, EM:1, I:1, P:1, BR:1, DIV:1, SPAN:1, UL:1, OL:1, LI:1, TABLE:1, TBODY:1, TR:1, TD:1, TH:1, FONT:1, INPUT:1 };
  function sanitizeHtml(html) {
    const tpl = document.createElement("template"); tpl.innerHTML = html || "";
    (function walk(node) {
      let el = node.firstElementChild;
      while (el) {
        const next = el.nextElementSibling;
        if (!OK_TAGS[el.tagName] || (el.tagName === "INPUT" && (el.getAttribute("type") || "") !== "checkbox")) {
          while (el.firstChild) node.insertBefore(el.firstChild, el);   // 태그만 벗기고 내용 유지
          node.removeChild(el);
          el = node.firstElementChild;                                   // 처음부터 다시 검사
          continue;
        }
        Array.from(el.attributes).forEach((a) => {
          const n = a.name.toLowerCase();
          const keep = (el.tagName === "FONT" && n === "color") ||
                       (n === "style" && /^\s*color:\s*[#a-zA-Z0-9(),.\s%]+;?\s*$/.test(a.value)) ||
                       (el.tagName === "INPUT" && (n === "type" || n === "checked" || n === "disabled")) ||
                       n === "class";
          if (!keep) el.removeAttribute(a.name);
        });
        if (el.tagName === "INPUT") el.setAttribute("disabled", "");
        walk(el);
        el = next;
      }
    })(tpl.content);
    return tpl.innerHTML;
  }

  // ----- 보내기 폼 (쪽지 / 업무 요청) -----
  let composeKind = "memo";
  let pendingAtts = [];                       // [{name,type,size,data}]
  const ATT_FILE_MAX = 1048576;               // 1MB
  const ATT_TOTAL_MAX = 2097152;              // 2MB
  function setComposeKind(k) {
    composeKind = k;
    $id("srKindMemo").classList.toggle("active", k === "memo");
    $id("srKindTask").classList.toggle("active", k === "task");
    $id("sendReqText").style.display = k === "memo" ? "" : "none";
    $id("srTaskForm").hidden = k !== "task";
    // 업무 요청은 넓게(900×700), 쪽지는 기존 크기
    const box = $id("sendReqModal").querySelector(".modal-box");
    if (box) {
      box.style.width = k === "task" ? "min(94vw, 900px)" : "min(94vw, 580px)";
      box.style.height = k === "task" ? "min(88vh, 700px)" : "";
    }
    const ed = $id("srEditor"); if (ed) { ed.style.minHeight = k === "task" ? "300px" : ""; ed.style.maxHeight = "none"; }
  }
  function renderAttList() {
    const ul = $id("srAttachList"); ul.innerHTML = "";
    pendingAtts.forEach((a, i) => {
      const li = document.createElement("li");
      const nm = document.createElement("span"); nm.className = "att-name"; nm.textContent = a.name;
      const sz = document.createElement("span"); sz.textContent = Math.round(a.size / 1024) + "KB";
      const x = document.createElement("button"); x.type = "button"; x.textContent = "✕";
      x.addEventListener("click", () => { pendingAtts.splice(i, 1); renderAttList(); });
      li.append(nm, sz, x); ul.append(li);
    });
  }
  // ----- 업무 요청 템플릿 (이 기기·계정에 저장) -----
  function tplKey() { return "onething-req-tpl::" + (currentUser ? currentUser.id : "anon"); }
  function loadTpls() { try { return JSON.parse(localStorage.getItem(tplKey()) || "[]") || []; } catch (_) { return []; } }
  function saveTpls(list) { try { localStorage.setItem(tplKey(), JSON.stringify(list)); } catch (_) {} }
  function renderTplSel(selName) {
    const sel = $id("srTplSel"); if (!sel) return; sel.innerHTML = "";
    const o0 = document.createElement("option"); o0.value = ""; o0.textContent = t("sr_tpl_none"); sel.appendChild(o0);
    loadTpls().forEach((tp, i) => {
      const o = document.createElement("option"); o.value = String(i); o.textContent = tp.name;
      if (selName && tp.name === selName) o.selected = true;
      sel.appendChild(o);
    });
  }

  let composeTo = null;      // 선택된 받는 사람 id
  let srToQuery = "";        // 받는 사람 검색어(10명 이상일 때)
  function toLabelOf(id) { // "이름 (자리비움)" 형식
    const st = ((statusCache[id] || {}).state) || "away";
    return ((usersCache[id] || {}).name || "?") + " (" + t("st_" + st) + ")";
  }
  function renderToChips() {   // 받는 사람 드롭다운(버튼 라벨 + 옵션 목록) 갱신
    const label = $id("srToLabel"), opts = $id("srToOptions"), search = $id("srToSearch");
    if (!label || !opts || !currentUser) return;
    // 선택 버튼 라벨
    label.innerHTML = ""; label.className = "to-sel-label" + (composeTo ? "" : " placeholder");
    if (composeTo && usersCache[composeTo]) {
      label.appendChild(statusDot(composeTo));
      label.appendChild(document.createTextNode(toLabelOf(composeTo)));
    } else label.textContent = t("sr_pick_to");
    // 옵션 목록
    const others = teamIds().filter((id) => id !== currentUser.id);
    if (search) search.hidden = others.length < 10;   // 인원이 많아지면 검색 표시
    const q = srToQuery.trim().toLowerCase();
    const shown = others.filter((id) => !q || (((usersCache[id] || {}).name || "").toLowerCase().includes(q)))
      .sort((a, b) => (((usersCache[a] || {}).name || "")).localeCompare((usersCache[b] || {}).name || ""));
    opts.innerHTML = "";
    if (!others.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("sr_no_one"); opts.append(e); return; }
    if (!shown.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("no_results"); opts.append(e); return; }
    shown.forEach((id) => {
      const b = document.createElement("button"); b.type = "button";
      b.className = "to-opt" + (id === composeTo ? " sel" : "");
      b.appendChild(statusDot(id));
      const nm = document.createElement("span"); nm.textContent = (usersCache[id] || {}).name || "?"; b.appendChild(nm);
      const st = document.createElement("span"); st.className = "to-opt-st";
      st.textContent = "(" + t("st_" + (((statusCache[id] || {}).state) || "away")) + ")"; b.appendChild(st);
      b.addEventListener("click", () => { composeTo = id; $id("srToMenu").hidden = true; renderToChips(); updateToStatus(); });
      opts.append(b);
    });
  }
  function updateToStatus() {
    const box = $id("srToStatus"); if (!box) return;
    box.innerHTML = ""; box.className = "sr-to-status"; box.hidden = true;
    const to = composeTo; if (!to || !statusCache[to]) return;
    const s = statusCache[to] || {};
    const st = s.state || "away";
    box.hidden = false;
    box.appendChild(statusDot(to));
    const lbl = document.createElement("span");
    let txt = t("st_" + st);
    if (st === "focus") {
      const leftMin = s.until && s.until > Date.now() ? Math.max(1, Math.round((s.until - Date.now()) / 60000)) : null;
      txt += " · " + (leftMin ? t("st_until", leftMin) : t("st_focus_hint"));
      box.classList.add("focus-warn");
    } else if (st === "vacation") {
      if (s.until) txt += " · ~" + fmtShortDate(s.until);
      if (s.deputyName) txt += " · " + t("vac_deputy_is", s.deputyName);
      box.classList.add("focus-warn");
    }
    lbl.textContent = txt;
    box.appendChild(lbl);
  }
  let editReqId = null;   // 보낸 요청 수정 모드
  function openEditRequest(r) {
    openSendReq(reqKindOf(r));
    editReqId = r.id;
    composeTo = r.to; renderToChips(); updateToStatus();
    if (reqKindOf(r) === "memo") $id("sendReqText").value = r.text || "";
    else {
      $id("srTitle").value = r.title || "";
      $id("srEditor").innerHTML = sanitizeHtml(r.html || "");
      $id("srDue").value = r.due || "";
      $id("srRepeat").value = r.repeat || "";
    }
  }
  function openSendReq(kind) {
    if (!currentUser) { showLoginGate(); return; }
    editReqId = null;
    composeTo = null; srToQuery = "";
    const search = $id("srToSearch"); if (search) search.value = "";
    const menu = $id("srToMenu"); if (menu) menu.hidden = true;
    renderToChips();
    $id("sendReqText").value = ""; $id("srTitle").value = ""; $id("srEditor").innerHTML = ""; $id("srDue").value = ""; $id("srRepeat").value = "";
    pendingAtts = []; renderAttList();
    $id("sendReqMsg").textContent = "";
    setComposeKind(kind === "task" ? "task" : "memo");
    renderTplSel();
    updateToStatus();
    $id("sendReqModal").hidden = false;
  }
  function sendRequest() {
    if (!currentUser || !msgDb) { $id("sendReqMsg").textContent = t("rq_offline"); return; }
    const to = composeTo;
    if (!to || !usersCache[to]) { $id("sendReqMsg").textContent = t("sr_pick_to"); return; }
    const rec = {
      from: currentUser.id, fromName: currentUser.name,
      to: to, toName: (usersCache[to] || {}).name || "?",
      kind: composeKind, ts: Date.now(), status: "sent", replies: [], hiddenFor: []
    };
    if (composeKind === "memo") {
      const text = $id("sendReqText").value.trim();
      if (!text) { $id("sendReqMsg").textContent = t("sr_need_text"); return; }
      rec.text = text;
    } else {
      const title = $id("srTitle").value.trim();
      if (!title) { $id("sendReqMsg").textContent = t("sr_need_title"); return; }
      const html = sanitizeHtml($id("srEditor").innerHTML);
      const plain = $id("srEditor").textContent.trim();
      if (!plain && !pendingAtts.length) { $id("sendReqMsg").textContent = t("sr_need_body"); return; }
      const total = pendingAtts.reduce((s, a) => s + a.size, 0);
      if (total > ATT_TOTAL_MAX) { $id("sendReqMsg").textContent = t("sr_att_total"); return; }
      rec.title = title; rec.html = html; rec.text = title;
      const due = $id("srDue").value; if (due) rec.due = due;
      const rpt = $id("srRepeat").value; if (rpt) rec.repeat = rpt;
      if (pendingAtts.length) rec.attachments = pendingAtts;
    }
    if (editReqId && requestsCache[editReqId]) {
      // 수정 모드: 같은 요청을 갱신 (읽기 전만 가능)
      const patch = { to: rec.to, toName: rec.toName, text: rec.text || null, title: rec.title || null,
        html: rec.html || null, due: rec.due || null, repeat: rec.repeat || null,
        attachments: rec.attachments || null, edited: Date.now() };
      try { wsRef("requests/" + editReqId).update(patch); } catch (_) {}
      editReqId = null;
      $id("sendReqModal").hidden = true; toast(t("rq_edited_done"));
      return;
    }
    wsRef("requests/" + uid()).set(rec);
    $id("sendReqModal").hidden = true; toast(t("sr_sent"));
  }

  // 아래 4개는 Task 2/4에서 본문이 채워진다. Task 1 시점엔 안전한 no-op 스텁.
  function updateLoginGate() {
    const chip = $id("userChip"), gate = $id("loginGate");
    const msgEls = [$id("tbInboxBtn"), $id("tbSentBtn"), $id("tbComposeBtn"), $id("tbTeamBtn"), $id("sideTab")];
    if (!cloudConfigured()) {                       // 메시징 비활성 — 기존 앱 그대로
      if (chip) chip.hidden = true; msgEls.forEach((el) => { if (el) el.hidden = true; });
      const p = $id("sidePanel"); if (p) p.hidden = true;
      if (gate) gate.hidden = true;
      return;
    }
    const loggedIn = !!currentUser;
    const inTeam = loggedIn && !!myWsId;   // 팀 기능은 워크스페이스 소속일 때만
    if (chip) { chip.hidden = false; const n = $id("userChipName"); if (n) n.textContent = loggedIn ? currentUser.name : t("uc_login"); }
    msgEls.forEach((el) => { if (el) el.hidden = !inTeam; });
    if (!inTeam) { const p = $id("sidePanel"); if (p) p.hidden = true; }
    if (loggedIn && gate) gate.hidden = true;
    renderUnreadBadge();
    if (inTeam) { renderRequests(); ensureMyPresence(); }
    renderMyStatus(); applySidePin(); renderTeamBoard();
  }
  function showLoginGate() { const g = $id("loginGate"); if (g && cloudConfigured() && !currentUser) { g.hidden = false; const m = $id("authMsg"); if (m) m.textContent = ""; } }
  function hideLoginGate() { const g = $id("loginGate"); if (g) g.hidden = true; }
  function reqKindOf(r) { return r && r.kind === "task" ? "task" : "memo"; }   // 구버전 데이터는 쪽지 취급
  let reqKind = "memo";   // 요청 팝업의 쪽지/업무요청 서브탭
  function setReqKind(k) {
    reqKind = k;
    reqShown = { inbox: REQ_PAGE, sent: REQ_PAGE };
    const m = $id("rqKindMemo"), tk = $id("rqKindTask");
    if (m) m.classList.toggle("active", k === "memo");
    if (tk) tk.classList.toggle("active", k === "task");
    renderRequests();
  }
  function renderRequests() {
    const inboxUl = $id("rqInboxList"), sentUl = $id("rqSentList");
    if (!inboxUl || !sentUl || !currentUser) return;
    const all = Object.keys(requestsCache).map((id) => Object.assign({ id }, requestsCache[id]));
    const mine = (r) => !((r.hiddenFor || []).includes(currentUser.id));
    const inboxAll = all.filter((r) => r.to === currentUser.id && mine(r));
    const sentAll = all.filter((r) => r.from === currentUser.id && mine(r));
    const byTs = (a, b) => lastActivity(b) - lastActivity(a);   // 마지막 활동(답장 포함) 순
    // 업무 요청은 마감 임박 순(마감 없는 건 뒤), 쪽지는 최신 순
    const byDue = (a, b) => {
      if (a.due && b.due && a.due !== b.due) return a.due < b.due ? -1 : 1;
      if (!!a.due !== !!b.due) return a.due ? -1 : 1;
      return byTs(a, b);
    };
    const sorter = reqKind === "task" ? byDue : byTs;
    // 검색: 내용·제목·이름
    const rq = rqQuery.trim().toLowerCase();
    const hits = (r) => !rq || [r.text, r.title, r.fromName, r.toName].some((v) => (v || "").toLowerCase().includes(rq));
    const inbox = inboxAll.filter((r) => reqKindOf(r) === reqKind && hits(r)).sort(sorter);
    const sent = sentAll.filter((r) => reqKindOf(r) === reqKind && hits(r)).sort(sorter);
    lastLists = { inbox: inbox, sent: sent };
    renderReqList(inboxUl, inbox, "inbox");
    renderReqList(sentUl, sent, "sent");
    // 서브탭별 미처리 수 (받은함 기준 — 즉시완료/할 일로 옮기기 전까지 유지)
    const unreadOf = (k) => inboxAll.filter((r) => reqKindOf(r) === k && !isHandledByMe(r.id, r)).length;
    const mu = $id("memoUnread"); if (mu) mu.textContent = unreadOf("memo") || "";
    const tu = $id("taskUnread"); if (tu) tu.textContent = unreadOf("task") || "";
    if (reqTab === "inbox") { markInboxRead(); markRepliesSeen(inbox); }
    if (reqTab === "sent") { markRepliesSeen(sent); markDoneSeen(sent); }
    renderUnreadBadge();
  }
  const EMPTY_RQ_SVG = '<svg width="84" height="66" viewBox="0 0 84 66" fill="none" aria-hidden="true">'
    + '<rect x="10" y="12" width="64" height="44" rx="7" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.6"/>'
    + '<path d="M12 16l30 22 30-22" stroke="var(--text-soft)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    + '</svg>';
  function renderReqList(ul, items, kind) {
    ul.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li"); li.className = "rq-empty-state";
      li.innerHTML = EMPTY_RQ_SVG + "<div>" + t(kind === "inbox" ? "rq_inbox_empty" : "rq_sent_empty") + "</div>";
      const b = document.createElement("button"); b.className = "mbtn"; b.type = "button"; b.textContent = t("t_sendreq");
      b.addEventListener("click", () => { closeReqPopup(); openSendReq(composeKind); });
      li.appendChild(b);
      ul.appendChild(li); return;
    }
    const limit = reqShown[kind] || REQ_PAGE;
    items.slice(0, limit).forEach((r) => ul.appendChild(buildReqCard(r, kind)));
    const rest = items.length - limit;
    if (rest > 0) {
      const li = document.createElement("li"); li.className = "rq-more";
      const btn = document.createElement("button"); btn.className = "rq-more-btn"; btn.type = "button";
      btn.textContent = t("rq_more", rest);
      btn.addEventListener("click", () => { reqShown[kind] = limit + REQ_PAGE; renderRequests(); });
      li.appendChild(btn); ul.appendChild(li);
    }
  }
  function buildReqCard(r, kind) {
    const st = r.status || "sent";
    const stKey = (st === "done" && r.instant) ? "done_now" : st;
    const li = document.createElement("li");
    li.className = "rq-card st-" + st + (kind === "inbox" && st === "sent" ? " unread" : "");
    li.dataset.rid = r.id;
    if (r.recalled) {   // 회수된 요청: 수신자에겐 내용 대신 회수 표시, 발신자에겐 회수됨 상태
      li.className = "rq-card st-done";
      const rhead = document.createElement("div"); rhead.className = "rq-card-head";
      const rwho = document.createElement("span"); rwho.className = "rq-who";
      rwho.textContent = kind === "inbox" ? (r.fromName || "?") : (t("rq_to_prefix") + " " + (r.toName || "?"));
      const rchip = document.createElement("span"); rchip.className = "rq-kind-chip " + reqKindOf(r); rchip.textContent = t("kind_" + reqKindOf(r)); rwho.prepend(rchip);
      const rmeta = document.createElement("span"); rmeta.className = "rq-meta"; rmeta.textContent = fmtReqTime(r.ts) + " ";
      const rpill = document.createElement("span"); rpill.className = "rq-status-pill pill-read"; rpill.textContent = t("rq_recalled_pill") + " " + fmtReqTime(r.recalled);
      rmeta.appendChild(rpill); rhead.append(rwho, rmeta); li.append(rhead);
      const rbody = document.createElement("div"); rbody.className = "rq-text"; rbody.style.opacity = ".6";
      rbody.textContent = kind === "inbox" ? t("rq_recalled_body") : (r.title || r.text || "");
      li.append(rbody);
      const racts = document.createElement("div"); racts.className = "rq-acts";
      racts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
      li.appendChild(racts);
      return li;
    }
    const head = document.createElement("div"); head.className = "rq-card-head";
    if (reqSelectMode) {   // 선택 삭제 모드: 체크박스
      const cb = document.createElement("button"); cb.type = "button";
      cb.className = "rq-sel-check" + (selectedReqIds.has(r.id) ? " on" : "");
      cb.textContent = selectedReqIds.has(r.id) ? "✓" : "";
      cb.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedReqIds.has(r.id)) selectedReqIds.delete(r.id); else selectedReqIds.add(r.id);
        cb.classList.toggle("on"); cb.textContent = selectedReqIds.has(r.id) ? "✓" : "";
        updateManageUI();
      });
      head.appendChild(cb);
    }
    const who = document.createElement("span"); who.className = "rq-who";
    who.textContent = kind === "inbox" ? (r.fromName || "?") : (t("rq_to_prefix") + " " + (r.toName || "?"));
    const meta = document.createElement("span"); meta.className = "rq-meta";
    let metaTxt = fmtReqTime(r.ts);
    if (r.edited) metaTxt += " · " + t("rq_edited") + " " + fmtReqTime(r.edited);
    if (st === "read" && r.readAt) metaTxt += " · " + t("rq_status_read") + " " + fmtReqTime(r.readAt);
    if (st === "done" && r.doneAt) metaTxt += " · " + fmtReqTime(r.doneAt);
    meta.textContent = metaTxt + " ";
    const pill = document.createElement("span"); pill.className = "rq-status-pill pill-" + st;
    pill.textContent = t("rq_status_" + stKey);
    meta.appendChild(pill);
    if (r.due && st !== "done" && r.due < todayStr()) {   // 마감 지연 표시 (양쪽)
      const od = document.createElement("span"); od.className = "rq-status-pill pill-sent"; od.textContent = t("rq_overdue");
      meta.appendChild(od);
    }
    if (r.addedTodo && st !== "done" && st !== "onething" && kind === "sent") {
      const ap = document.createElement("span"); ap.className = "rq-status-pill pill-read"; ap.textContent = t("rq_added_by");
      meta.appendChild(ap);
    }
    const chip = document.createElement("span"); chip.className = "rq-kind-chip " + reqKindOf(r); chip.textContent = t("kind_" + reqKindOf(r));
    who.prepend(chip);
    head.append(who, meta);
    li.append(head);
    if (reqKindOf(r) === "task") {
      const title = document.createElement("div"); title.className = "rq-title"; title.textContent = r.title || "";
      if (r.due) {
        const today = todayStr();
        const dc = document.createElement("span"); dc.className = "chip" + (r.due < today ? " due-over" : r.due === today ? " due-soon" : "");
        dc.style.marginLeft = "6px"; dc.textContent = t("rq_due", r.due.slice(5));
        title.append(dc);
      }
      li.append(title);
      if (r.html) { const body = document.createElement("div"); body.className = "rq-html"; body.innerHTML = sanitizeHtml(r.html); li.append(body); }
      if (Array.isArray(r.attachments) && r.attachments.length) {
        const atts = document.createElement("div"); atts.className = "rq-atts";
        r.attachments.forEach((a) => {
          if (!a || typeof a.data !== "string" || a.data.slice(0, 5) !== "data:") return;
          if ((a.type || "").slice(0, 6) === "image/") {
            const img = document.createElement("img"); img.className = "rq-att-img"; img.src = a.data; img.alt = a.name || "";
            atts.append(img);
          }
          const link = document.createElement("a"); link.href = a.data; link.download = a.name || "file";
          link.textContent = "⤓ " + (a.name || "file") + " (" + Math.round((a.size || 0) / 1024) + "KB)";
          atts.append(link);
        });
        li.append(atts);
      }
    } else {
      const body = document.createElement("div"); body.className = "rq-text"; body.textContent = r.text || "";
      li.append(body);
    }
    if (r.forwardedBy) {   // 전달된 요청 표시
      const fw = document.createElement("div"); fw.className = "rq-meta"; fw.style.margin = "2px 0";
      fw.textContent = t("rq_fwd_by", r.forwardedBy) + (r.forwardedAt ? " · " + fmtReqTime(r.forwardedAt) : "");
      li.appendChild(fw);
    }
    if (r.progress && r.progress.text && st !== "done") {   // 진행 상황 코멘트
      const pg = document.createElement("div"); pg.className = "rq-progress";
      pg.textContent = t("rq_prog", r.progress.text) + " · " + fmtAgo(r.progress.ts);
      li.appendChild(pg);
    }
    const seenN = (r.replySeen && currentUser && r.replySeen[currentUser.id]) || 0;
    const newReps = unseenReplies(r);
    if (newReps > 0) {
      const np = document.createElement("span"); np.className = "rq-status-pill pill-sent";
      np.textContent = t("rq_newrep", newReps);
      meta.appendChild(np);
    }
    (r.replies || []).forEach((rep, i) => {
      const re = document.createElement("div");
      re.className = "rq-reply" + (currentUser && i >= seenN && rep && rep.from !== currentUser.id ? " rq-reply-new" : "");
      if (rep && rep.html) {   // 서식 답장(업무 요청)
        const whoEl = document.createElement("b"); whoEl.textContent = "↩ " + (rep.fromName || "?") + ":";
        const bd = document.createElement("div"); bd.className = "rq-html"; bd.innerHTML = sanitizeHtml(rep.html);
        re.append(whoEl, bd);
      } else re.textContent = "↩ " + ((rep && rep.fromName) || "?") + ": " + ((rep && rep.text) || "");
      li.appendChild(re);
    });
    const acts = document.createElement("div"); acts.className = "rq-acts";
    if (kind === "inbox") {
      const already = state.todos.some((td) => td.reqId === r.id);   // 한 번만 추가되게
      if (already) {
        const s = document.createElement("span"); s.className = "rq-added"; s.textContent = "✓ " + t("rq_added");
        acts.appendChild(s);
      } else {
        const pick = document.createElement("span"); pick.className = "rq-prio-pick"; pick.hidden = true;
        [["urgent", "prio_urgent"], ["important", "prio_important"], ["normal", "prio_normal"]].forEach((pair) => {
          const pb = reqBtn(t(pair[1]), () => {
            markRead(r.id);
            addTodo(r.text || "", { reqId: r.id, due: r.due || null, priority: pair[0], group: null });
            try { wsRef("requests/" + r.id + "/addedTodo").set(Date.now()); } catch (_) {}   // 보낸 사람에게 '할 일로 등록됨' 표시
            toast(t("rq_added_todo")); renderRequests();
          });
          pb.classList.add("pk-" + pair[0]);
          pick.appendChild(pb);
        });
        acts.appendChild(reqBtn(t("rq_to_todo") + " ▾", () => { pick.hidden = !pick.hidden; }));
        acts.appendChild(pick);
      }
      acts.appendChild(reqBtn(t("rq_done"), () => { markRead(r.id); setReqStatus(r.id, "done", true); }));
      acts.appendChild(reqBtn(t("rq_reply"), () => { markRead(r.id); doReply(r.id); }));
      if (st !== "done") {
        acts.appendChild(reqBtn(t("rq_prog_btn"), () => openProgress(r.id)));
        acts.appendChild(reqBtn(t("rq_fwd"), () => openForward(r.id)));
      }
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    } else {
      acts.appendChild(reqBtn(t("rq_reply"), () => doReply(r.id)));
      if (st === "sent") {   // 상대가 읽기 전: 수정·회수 가능
        acts.appendChild(reqBtn(t("rq_edit"), () => openEditRequest(r)));
        acts.appendChild(reqBtn(t("rq_recall"), () => {
          if (!confirm(t("rq_recall_confirm"))) return;
          try { wsRef("requests/" + r.id + "/recalled").set(Date.now()); } catch (_) {}
          toastUndo(t("rq_recalled"), () => { try { wsRef("requests/" + r.id + "/recalled").set(null); } catch (_) {} });
        }));
      }
      if (st !== "done") {
        acts.appendChild(reqBtn(t("rq_remind"), () => {   // 재촉 — 상대에게 알림 한 번 더
          try { wsRef("requests/" + r.id + "/nudge").set({ ts: Date.now(), by: currentUser.name }); } catch (_) {}
          toast(t("rq_reminded"));
        }));
      }
      acts.appendChild(reqBtn(t("rq_delete"), () => hideRequest(r.id)));
    }
    li.appendChild(acts);
    if (kind === "inbox" && r.status === "sent") li.addEventListener("click", (e) => { if (!e.target.closest(".rq-acts")) markRead(r.id); });
    return li;
  }
  function reqBtn(label, fn) { const b = document.createElement("button"); b.className = "rq-btn"; b.textContent = label; b.addEventListener("click", (e) => { e.stopPropagation(); fn(); }); return b; }
  function fmtReqTime(ts) { if (!ts) return ""; const d = new Date(ts); return (d.getMonth() + 1) + "/" + d.getDate() + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function markRead(id) { const r = requestsCache[id]; if (r && r.status === "sent" && msgDb) wsRef("requests/" + id).update({ status: "read", readAt: Date.now() }); }
  function setReqStatus(id, st, instant) {
    if (!msgDb) return;
    const patch = { status: st };
    if (st === "done") { patch.doneAt = Date.now(); if (instant) patch.instant = true; }
    wsRef("requests/" + id).update(patch);
  }
  // ----- 진행 상황 코멘트 -----
  let progTargetId = null;
  function openProgress(id) {
    const r = requestsCache[id]; if (!r) return;
    progTargetId = id;
    $id("progText").value = (r.progress && r.progress.text) || "";
    $id("progressModal").hidden = false;
    setTimeout(() => $id("progText").focus(), 30);
  }
  function saveProgress() {
    const r = requestsCache[progTargetId]; if (!r || !msgDb || !currentUser) return;
    const text = $id("progText").value.trim();
    try {
      wsRef("requests/" + progTargetId + "/progress").set(text ? { text: text, ts: Date.now(), by: currentUser.name } : null);
    } catch (_) {}
    $id("progressModal").hidden = true; progTargetId = null;
    toast(t("rq_prog_saved"));
  }
  // ----- 전달(위임) -----
  let fwdTargetId = null;
  function openForward(id) {
    const r = requestsCache[id]; if (!r || !currentUser) return;
    fwdTargetId = id;
    const box = $id("fwdList"); box.innerHTML = "";
    const others = teamIds().filter((uid2) => uid2 !== currentUser.id && uid2 !== r.from);
    if (!others.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("sr_no_one"); box.append(e); }
    others.sort((a, b) => (((usersCache[a] || {}).name || "")).localeCompare((usersCache[b] || {}).name || "")).forEach((uid2) => {
      const b = document.createElement("button"); b.className = "st-opt"; b.type = "button";
      b.appendChild(statusDot(uid2));
      const nm = document.createElement("span"); nm.textContent = toLabelOf(uid2); b.appendChild(nm);
      b.addEventListener("click", () => doForward(uid2));
      box.append(b);
    });
    $id("forwardModal").hidden = false;
  }
  function doForward(toId) {
    const r = requestsCache[fwdTargetId]; if (!r || !msgDb || !currentUser) return;
    const name = (usersCache[toId] || {}).name || "?";
    try {
      wsRef("requests/" + fwdTargetId).update({
        to: toId, toName: name, status: "sent", readAt: null,
        forwardedBy: currentUser.name, forwardedAt: Date.now()
      });
    } catch (_) {}
    $id("forwardModal").hidden = true; fwdTargetId = null;
    toast(t("rq_fwd_done", name));
  }
  // ----- 선택/전체 삭제 (내 화면에서만 숨김) -----
  let reqSelectMode = false;
  let selectedReqIds = new Set();
  let rqQuery = "";   // 요청 검색어
  let lastLists = { inbox: [], sent: [] };   // 현재 탭·종류 기준 전체 목록(페이징 무관)
  function updateManageUI() {
    const sel = $id("rqSelBtn"), del = $id("rqSelDelBtn"), cancel = $id("rqSelCancel"), all = $id("rqDelAllBtn");
    if (!sel) return;
    sel.hidden = reqSelectMode; all.hidden = reqSelectMode;
    del.hidden = !reqSelectMode; cancel.hidden = !reqSelectMode;
    del.textContent = t("rq_sel_del", selectedReqIds.size);
  }
  function exitSelectMode() { reqSelectMode = false; selectedReqIds = new Set(); updateManageUI(); renderRequests(); }
  function hideMany(ids) {
    if (!msgDb || !currentUser || !ids.length) return;
    const updates = {};
    ids.forEach((id) => {
      const r = requestsCache[id]; if (!r) return;
      const hf = Array.isArray(r.hiddenFor) ? r.hiddenFor.slice() : [];
      if (!hf.includes(currentUser.id)) hf.push(currentUser.id);
      updates[id + "/hiddenFor"] = hf;
    });
    try { wsRef("requests").update(updates); } catch (_) {}
    toast(t("rq_deleted", ids.length));
  }
  function hideRequest(id) {
    const r = requestsCache[id]; if (!r || !msgDb || !currentUser) return;
    const hf = Array.isArray(r.hiddenFor) ? r.hiddenFor.slice() : [];
    if (!hf.includes(currentUser.id)) hf.push(currentUser.id);
    wsRef("requests/" + id + "/hiddenFor").set(hf);
  }
  let replyTargetId = null;
  let replyRich = false;   // 업무 요청 답장 = 서식 에디터
  function doReply(id) {
    const r = requestsCache[id]; if (!r || !currentUser) return;
    replyTargetId = id;
    replyRich = reqKindOf(r) === "task";
    const other = r.from === currentUser.id ? r.toName : r.fromName;
    $id("replyToWho").textContent = t("rp_to", other || "?");
    $id("replyText").value = ""; $id("replyEditor").innerHTML = ""; $id("replyMsg").textContent = "";
    $id("replyText").style.display = replyRich ? "none" : "";
    $id("replyRich").hidden = !replyRich;
    const box = $id("replyModal").querySelector(".modal-box");
    if (box) { box.style.width = replyRich ? "min(94vw, 900px)" : "min(94vw, 520px)"; }
    $id("replyModal").hidden = false;
    setTimeout(() => (replyRich ? $id("replyEditor") : $id("replyText")).focus(), 30);
  }
  function sendReply() {
    const r = requestsCache[replyTargetId];
    if (!r || !msgDb || !currentUser) { $id("replyMsg").textContent = t("rq_offline"); return; }
    let text, html = null;
    if (replyRich) {
      html = sanitizeHtml($id("replyEditor").innerHTML);
      text = $id("replyEditor").textContent.trim();
    } else text = $id("replyText").value.trim();
    if (!text) { $id("replyMsg").textContent = t("sr_need_text"); return; }
    const reps = Array.isArray(r.replies) ? r.replies.slice() : [];
    const rep = { from: currentUser.id, fromName: currentUser.name, text: text, ts: Date.now() };
    if (replyRich && html) rep.html = html;
    reps.push(rep);
    wsRef("requests/" + replyTargetId + "/replies").set(reps);
    wsRef("requests/" + replyTargetId + "/replySeen/" + currentUser.id).set(reps.length);   // 내 답장은 본 것으로
    $id("replyModal").hidden = true; replyTargetId = null;
    toast(t("rq_replied"));
  }
  let pendingNotifyIds = new Set();   // 원씽 중(focus)에 조용히 쌓인 새 요청 id
  let pendingReplyIds = new Set();    // 원씽 중에 조용히 쌓인 새 답장(요청 id)
  let knownRepCounts = null;          // 답장 알림용: 요청별 답장 개수 기억
  let knownStatuses = null;           // 완료 알림용: 요청별 상태 기억
  function doneUnseen(r) {            // 내가 보낸 요청이 완료됐는데 아직 확인 안 함
    return !!(currentUser && r.from === currentUser.id && r.status === "done" && !(r.doneSeen && r.doneSeen[currentUser.id]));
  }
  function markDoneSeen(items) {
    if (!currentUser || !msgDb) return;
    items.forEach((r) => {
      if (doneUnseen(r)) { try { wsRef("requests/" + r.id + "/doneSeen/" + currentUser.id).set(true); } catch (_) {} }
    });
  }
  function lastActivity(r) {          // 마지막 활동 시각(답장 포함) — 정렬용
    const reps = Array.isArray(r.replies) ? r.replies : [];
    return Math.max(r.ts || 0, reps.length ? (reps[reps.length - 1].ts || 0) : 0);
  }
  function unseenReplies(r) {         // 내가 아직 안 본 (상대의) 답장 수
    if (!currentUser) return 0;
    const reps = Array.isArray(r.replies) ? r.replies : [];
    const seen = (r.replySeen && r.replySeen[currentUser.id]) || 0;
    return reps.slice(seen).filter((rep) => rep && rep.from !== currentUser.id).length;
  }
  function markRepliesSeen(items) {   // 목록이 화면에 보일 때 '봤음' 기록
    if (!currentUser || !msgDb) return;
    items.forEach((r) => {
      const reps = Array.isArray(r.replies) ? r.replies : [];
      const seen = (r.replySeen && r.replySeen[currentUser.id]) || 0;
      if (reps.length !== seen) {
        try { wsRef("requests/" + r.id + "/replySeen/" + currentUser.id).set(reps.length); } catch (_) {}
      }
    });
  }
  // '처리됨' = 즉시완료(완료 상태) 또는 내 할 일로 옮김. 단순히 읽기만 한 건 처리 아님.
  function isHandledByMe(id, r) {
    return !!r.recalled || r.status === "done" || state.todos.some((td) => td.reqId === id);
  }
  function renderUnreadBadge() {
    const b = $id("unreadBadge"), sb = $id("sentBadge");
    if (!currentUser) { if (b) b.hidden = true; if (sb) sb.hidden = true; return; }
    const focus = myStatus() === "focus";
    let n = 0, sn = 0;
    Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id]; if (!r) return;
      if ((r.hiddenFor || []).includes(currentUser.id)) return;
      if (r.to === currentUser.id) {
        // 받은 요청: 아직 처리(즉시완료/할 일 이동) 안 한 건 + 새 답장
        if (!isHandledByMe(id, r) && !(focus && pendingNotifyIds.has(id))) n++;
        if (!(focus && pendingReplyIds.has(id))) n += unseenReplies(r);
      } else if (r.from === currentUser.id) {
        // 보낸 요청: 상대가 아직 확인 안 한 건 + 나에게 온 새 답장 + 확인 안 한 완료 처리
        if (r.status === "sent" && !r.recalled) sn++;
        if (!(focus && pendingReplyIds.has(id))) {
          sn += unseenReplies(r);
          if (doneUnseen(r)) sn++;
        }
      }
    });
    if (b) { b.textContent = n; b.hidden = false; b.classList.toggle("zero", n === 0); b.title = t("badge_tip_in"); }
    const pb = $id("popUnread"); if (pb) { pb.textContent = n; pb.hidden = n === 0; pb.title = t("badge_tip_in"); }
    if (sb) { sb.textContent = sn; sb.hidden = false; sb.classList.toggle("zero", sn === 0); sb.title = t("badge_tip_sent"); }
  }
  function snapshotRepCounts(ids) {
    const c = {}; ids.forEach((id) => { const r = requestsCache[id]; c[id] = (r && Array.isArray(r.replies)) ? r.replies.length : 0; });
    return c;
  }
  function snapshotStatuses(ids) {
    const s = {}; ids.forEach((id) => { const r = requestsCache[id]; s[id] = (r && r.status) || "sent"; });
    return s;
  }
  let knownTos = null;   // 전달 감지용: 요청별 수신자
  let knownNudges = null;   // 리마인드 감지용
  function snapshotNudges(ids) {
    const m = {}; ids.forEach((id) => { const r = requestsCache[id]; m[id] = (r && r.nudge && r.nudge.ts) || 0; });
    return m;
  }
  // 완료 후 90일 지난 요청 자동 정리 (용량·로딩 보호, 한 번에 최대 50건)
  function cleanupOldRequests() {
    if (!msgDb || !currentUser) return;
    const cutoff = Date.now() - 90 * 864e5;
    const updates = {}; let n = 0;
    Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id];
      if (r && r.status === "done" && (r.doneAt || r.ts || 0) < cutoff && n < 50) { updates[id] = null; n++; }
    });
    if (n) { try { wsRef("requests").update(updates); } catch (_) {} }
  }
  // 반복 요청: 보낸 사람 접속 시 주기가 지난 반복 요청을 자동 재발송
  function checkRepeats() {
    if (!currentUser || !msgDb) return;
    const now = Date.now();
    Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id];
      if (!r || r.from !== currentUser.id || !r.repeat || r.recalled) return;
      const iv = r.repeat === "daily" ? 864e5 : r.repeat === "weekly" ? 7 * 864e5 : 30 * 864e5;
      if (now - (r.ts || 0) < iv) return;
      const nid = uid();
      const copy = { from: r.from, fromName: r.fromName, to: r.to, toName: r.toName, kind: r.kind || "memo",
        ts: now, status: "sent", replies: [], hiddenFor: [], repeat: r.repeat };
      if (r.title) copy.title = r.title;
      if (r.html) copy.html = r.html;
      if (r.text) copy.text = r.text;
      if (r.attachments) copy.attachments = r.attachments;
      if (r.due) copy.due = todayStr();
      try { wsRef("requests/" + nid).set(copy); wsRef("requests/" + id + "/repeat").set(null); } catch (_) {}
    });
  }
  function snapshotTos(ids) {
    const m = {}; ids.forEach((id) => { const r = requestsCache[id]; m[id] = (r && r.to) || ""; });
    return m;
  }
  // 접속 시 1회: 오늘/지난 마감 요약
  let dueToastShown = false;
  function dueSummaryToast() {
    if (dueToastShown || !currentUser) return; dueToastShown = true;
    const today = todayStr();
    let dueToday = 0, overdue = 0;
    Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id]; if (!r || r.to !== currentUser.id || !r.due) return;
      if ((r.hiddenFor || []).includes(currentUser.id) || isHandledByMe(id, r)) return;
      if (r.due === today) dueToday++;
      else if (r.due < today) overdue++;
    });
    if (dueToday || overdue) setTimeout(() => toast(t("rq_due_sum", dueToday, overdue)), 900);
  }
  function notifyNewRequests() {
    const ids = Object.keys(requestsCache);
    if (knownReqIds === null || !currentUser) {
      // 첫 로드(또는 로그인 전): 알림 없이 기준점만 기록 — 이후 변화부터 감지
      knownReqIds = new Set(ids);
      knownRepCounts = snapshotRepCounts(ids);
      knownStatuses = snapshotStatuses(ids);
      knownTos = snapshotTos(ids);
      knownNudges = snapshotNudges(ids);
      if (currentUser) { dueSummaryToast(); setTimeout(checkRepeats, 1500); setTimeout(cleanupOldRequests, 4000); }
      return;
    }
    ids.forEach((id) => {
      if (knownReqIds.has(id)) return;
      const r = requestsCache[id];
      if (r && r.to === currentUser.id && r.from !== currentUser.id && !((r.hiddenFor || []).includes(currentUser.id))) {
        if (myStatus() === "focus") pendingNotifyIds.add(id);   // 조용히 쌓기
        else {
          toast(t("rq_new", r.fromName || "?"));
          // 탭이 백그라운드면 OS 알림으로도 (권한이 있을 때만)
          try {
            if (document.hidden && window.Notification && Notification.permission === "granted")
              new Notification(t("rq_new", r.fromName || "?"), { body: r.title || r.text || "", icon: "icon-192.png" });
          } catch (_) {}
        }
      }
    });
    knownReqIds = new Set(ids);
    // ----- 새 답장 감지 -----
    const counts = snapshotRepCounts(ids);
    if (knownRepCounts && currentUser) {
      ids.forEach((id) => {
        const r = requestsCache[id]; if (!r) return;
        if (r.to !== currentUser.id && r.from !== currentUser.id) return;
        if ((r.hiddenFor || []).includes(currentUser.id)) return;
        if (counts[id] <= (knownRepCounts[id] || 0)) return;
        const last = r.replies[counts[id] - 1];
        if (!last || last.from === currentUser.id) return;
        if (myStatus() === "focus") pendingReplyIds.add(id);   // 조용히 쌓기
        else {
          toast(t("rq_reply_new", last.fromName || "?"));
          try {
            if (document.hidden && window.Notification && Notification.permission === "granted")
              new Notification(t("rq_reply_new", last.fromName || "?"), { body: last.text || "", icon: "icon-192.png" });
          } catch (_) {}
        }
      });
    }
    knownRepCounts = counts;
    // ----- 내가 보낸 요청의 완료 감지 -----
    const statuses = snapshotStatuses(ids);
    if (knownStatuses && currentUser) {
      ids.forEach((id) => {
        const r = requestsCache[id]; if (!r || r.from !== currentUser.id) return;
        if ((r.hiddenFor || []).includes(currentUser.id)) return;
        if (statuses[id] !== "done" || knownStatuses[id] === "done") return;
        if (myStatus() === "focus") { pendingReplyIds.add(id); return; }   // 조용히 쌓기
        const msg = t(r.instant ? "rq_done_now_new" : "rq_done_new", r.toName || "?");
        toast(msg);
        try {
          if (document.hidden && window.Notification && Notification.permission === "granted")
            new Notification(msg, { body: r.title || r.text || "", icon: "icon-192.png" });
        } catch (_) {}
      });
    }
    knownStatuses = statuses;
    // ----- 전달로 나에게 온 요청 감지 -----
    const tos = snapshotTos(ids);
    if (knownTos && currentUser) {
      ids.forEach((id) => {
        const r = requestsCache[id]; if (!r) return;
        if (tos[id] !== currentUser.id || knownTos[id] === currentUser.id || !knownTos[id]) return;
        if ((r.hiddenFor || []).includes(currentUser.id)) return;
        if (myStatus() === "focus") { pendingNotifyIds.add(id); return; }
        toast(t("rq_new", r.forwardedBy || r.fromName || "?"));
      });
    }
    knownTos = tos;
    // ----- 리마인드(재촉) 감지 -----
    const nudges = snapshotNudges(ids);
    if (knownNudges && currentUser) {
      ids.forEach((id) => {
        const r = requestsCache[id]; if (!r || r.to !== currentUser.id) return;
        if ((r.hiddenFor || []).includes(currentUser.id)) return;
        if (!(nudges[id] > (knownNudges[id] || 0))) return;
        if (myStatus() === "focus") { pendingNotifyIds.add(id); return; }
        toast(t("rq_nudged", (r.nudge && r.nudge.by) || r.fromName || "?"));
        try {
          if (document.hidden && window.Notification && Notification.permission === "granted")
            new Notification(t("rq_nudged", (r.nudge && r.nudge.by) || "?"), { body: r.title || r.text || "", icon: "icon-192.png" });
        } catch (_) {}
      });
    }
    knownNudges = nudges;
  }
  function openReqPopup(tab) { if (!currentUser) { showLoginGate(); return; } setReqTab(tab); setReqKind(reqKind); $id("reqPopup").hidden = false; }
  // 할 일에서 원본 요청 카드 열기
  function openRequestById(id) {
    const r = requestsCache[id];
    if (!r || !currentUser) { toast(t("rq_gone")); return; }
    reqKind = reqKindOf(r);
    const tab = r.to === currentUser.id ? "inbox" : "sent";
    reqShown[tab] = 999;   // 페이징에 가려지지 않게 전부 표시
    openReqPopup(tab);
    setTimeout(() => {
      const el = document.querySelector('.rq-card[data-rid="' + id + '"]');
      if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); }
    }, 80);
  }
  function closeReqPopup() { $id("reqPopup").hidden = true; setReqTab(null); if (reqSelectMode) exitSelectMode(); }
  function setReqTab(tab) {
    reqTab = tab;
    if (tab === "inbox" || tab === "sent") reqShown[tab] = REQ_PAGE;   // 탭 열 때 최신 10개부터
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
      if (r && r.to === currentUser.id && r.status === "sent" && reqKindOf(r) === reqKind && !((r.hiddenFor || []).includes(currentUser.id))) wsRef("requests/" + id).update({ status: "read", readAt: Date.now() });
    });
  }

  // ---------- PWA ----------
  function setupPWA() {
    try {
      if ((location.protocol === "http:" || location.protocol === "https:") && "serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      }
    } catch (e) {}
  }

  // ---------- events ----------
  function addFromInput(prio) {
    const i = $id("newTodo");
    if (currentProject) {   // 프로젝트 보드의 '할 일' 열에 카드 추가
      const text = (i.value || "").trim(); if (!text) return;
      if (!msgDb || !currentUser) { toast(t("rq_offline")); return; }
      try { wsRef("projectTodos/" + currentProject + "/" + uid()).set({ text: text, status: "todo", done: false, ts: Date.now(), by: currentUser.name }); } catch (_) {}
      i.value = ""; i.focus(); return;
    }
    addTodo(i.value, { priority: prio || "normal" });
    i.value = ""; i.focus();
  }
  $id("addBtn").addEventListener("click", () => addFromInput());
  // Enter = 기본(드롭다운 값) · Shift+Enter = Next · Ctrl+Enter = Now
  $id("newTodo").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addFromInput(e.ctrlKey || e.metaKey ? "urgent" : e.shiftKey ? "important" : null);
  });
  $id("newTodo").addEventListener("focus", () => { const h = $id("addHint"); if (h) h.hidden = !!currentProject; });
  $id("newTodo").addEventListener("blur", () => { const h = $id("addHint"); if (h) h.hidden = true; });
  $id("doneHead").addEventListener("click", () => { state.doneCollapsed = !state.doneCollapsed; save(); renderDone(); });
  $id("laterHead").addEventListener("click", () => { state.laterCollapsed = !state.laterCollapsed; save(); renderLater(); });
  $id("todoList").addEventListener("dragover", (e) => e.preventDefault());
  $id("todoList").addEventListener("drop", (e) => { if (e.target.id === "todoList" && dragId) { e.preventDefault(); reorder(dragId, null, false); } });
  $id("searchInput").addEventListener("input", (e) => { searchQuery = e.target.value; renderTodos(); });

  // 할 일을 오른쪽(원씽 자리)에 끌어다 놓으면 오늘의 단 하나로
  (function () {
    const rp = document.querySelector(".page.right"); if (!rp) return;
    rp.addEventListener("dragover", (e) => { if (dragId) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; rp.classList.add("ot-drop"); } });
    rp.addEventListener("dragleave", (e) => { if (!rp.contains(e.relatedTarget)) rp.classList.remove("ot-drop"); });
    rp.addEventListener("drop", (e) => {
      if (!dragId) return;
      e.preventDefault(); rp.classList.remove("ot-drop");
      sendToOneThing(dragId); dragId = null;
    });
  })();

  $id("prevDay").addEventListener("click", () => { viewDate = addDaysStr(viewDate, -1); render(); });
  $id("nextDay").addEventListener("click", () => { viewDate = addDaysStr(viewDate, 1); render(); });
  $id("todayBtn").addEventListener("click", () => { viewDate = todayStr(); render(); });

  $id("activeSlot").addEventListener("click", (e) => {
    const b = e.target.closest("[data-min]"); if (!b) return;
    let v;
    if (b.dataset.min === "custom") {
      const inp = prompt(t("tp_prompt"), state.settings.pomodoroMin || 25);
      if (inp === null) return; v = parseInt(inp, 10);
    } else v = parseInt(b.dataset.min, 10);
    if (!v || v < 1) { if (b.dataset.min === "custom") toast(t("tp_range")); return; }
    v = Math.min(180, v);
    state.settings.pomodoroMin = v;
    if (!timerRunning) timerRemaining = v * 60;
    save(); render();
    toast(t("tp_set", v));
  });

  $id("lockOverlay").addEventListener("click", () => {
    if (state.settings.unlockMode === "button") {   // 퍼즐 없이 바로 열기 (설정 선택제)
      leftUnlocked = true; render(); toast(t("solved_toast"));
    } else openPuzzle();
  });
  $id("puzzleClose").addEventListener("click", () => { $id("puzzleModal").hidden = true; });
  $id("relockBtn").addEventListener("click", () => { leftUnlocked = false; render(); toast(t("relock_toast")); });

  $(".tools").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; const act = b.dataset.act;
    if (act === "lang") toggleLang();
    else if (act === "stats") openStats(); else if (act === "trash") openTrash();
    else if (act === "settings") openSettings(); else if (act === "help") $id("helpModal").hidden = false;
    else if (act === "user") { if (currentUser) { $id("userWho").textContent = t("um_who", currentUser.name) + " · v" + APP_VER; renderMembers(); renderUmWs(); $id("userModal").hidden = false; } else showLoginGate(); }
    else if (act === "status") { if (currentUser) { renderMyStatus(); $id("statusModal").hidden = false; } else showLoginGate(); }
    else if (act === "inbox") openReqPopup("inbox");
    else if (act === "sentbox") openReqPopup("sent");
    else if (act === "team") {
      $id("sidePanel").hidden = false;
      updateBodyShift(); renderTeamBoard();
    }
    else if (act === "compose") openSendReq(composeKind);
  });

  $id("sideTab").addEventListener("click", () => {
    $id("sidePanel").hidden = false;
    updateBodyShift();
    renderTeamBoard();
    if (matchMedia("(min-width: 900px)").matches) setTimeout(() => { const se2 = $id("spSearch"); if (se2 && !se2.hidden) se2.focus(); }, 30);
  });
  $id("spClose").addEventListener("click", () => {
    if (spPinned) { spPinned = false; try { localStorage.setItem("onething-sp-pin", "0"); } catch (_) {} }
    $id("sidePanel").hidden = true; applySidePin();
  });
  (function spSwipeClose() {   // 모바일 바텀 시트: 헤더를 아래로 쓸면 닫기
    const p = $id("sidePanel"); if (!p) return;
    const head = p.querySelector(".sp-head"); if (!head) return;
    let y0 = null;
    head.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true });
    head.addEventListener("touchmove", (e) => {
      if (y0 === null) return;
      if (e.touches[0].clientY - y0 > 55) { y0 = null; p.hidden = true; applySidePin(); }
    }, { passive: true });
    head.addEventListener("touchend", () => { y0 = null; }, { passive: true });
  })();
  $id("spPin").addEventListener("click", () => {
    spPinned = !spPinned;
    try { localStorage.setItem("onething-sp-pin", spPinned ? "1" : "0"); } catch (_) {}
    applySidePin();
    toast(t(spPinned ? "sp_pinned" : "sp_unpinned"));
  });
  $id("spSearch").addEventListener("input", (e) => { spQuery = e.target.value; renderTeamBoard(); });

  $id("statusClose").addEventListener("click", () => { $id("statusModal").hidden = true; });
  $id("statusModal").addEventListener("click", (e) => {
    const b = e.target.closest(".st-opt"); if (!b) return;
    if (b.dataset.st === "focus" && !activeTodo()) { toast(t("st_focus_req")); return; }
    if (b.dataset.st === "vacation") {   // 복귀일·대리인 입력 후 설정
      $id("statusModal").hidden = true;
      const sel = $id("vacDeputy"); sel.innerHTML = "";
      const o0 = document.createElement("option"); o0.value = ""; o0.textContent = t("kb_unassign"); sel.appendChild(o0);
      teamIds().filter((u) => u !== currentUser.id).forEach((u) => {
        const o = document.createElement("option"); o.value = u; o.textContent = (usersCache[u] || {}).name || "?"; sel.appendChild(o);
      });
      $id("vacDate").value = "";
      $id("vacModal").hidden = false;
      return;
    }
    setMyStatus(b.dataset.st);
    $id("statusModal").hidden = true;
    toast(t("st_changed", t("st_" + b.dataset.st)));
  });
  $id("vacClose").addEventListener("click", () => { $id("vacModal").hidden = true; });
  $id("vacSave").addEventListener("click", () => {
    const d = $id("vacDate").value; if (!d) { toast(t("vac_need_date")); return; }
    const dep = $id("vacDeputy").value;
    vacInfo = { until: parseDate(d).getTime() + 864e5 - 1, deputy: dep || null, deputyName: dep ? ((usersCache[dep] || {}).name || "") : null };
    try { localStorage.setItem("onething-vac", JSON.stringify(vacInfo)); } catch (_) {}
    setMyStatus("vacation");
    $id("vacModal").hidden = true;
    toast(t("st_changed", t("st_vacation")));
  });

  // ----- 인증 UI 이벤트 -----
  $id("googleBtn").addEventListener("click", doGoogle);
  $id("authPrimary").addEventListener("click", doAuthPrimary);
  $id("authToggle").addEventListener("click", () => setAuthMode(!signupMode));
  $id("pwForgot").addEventListener("click", doForgot);
  $id("auPw").addEventListener("keydown", (e) => { if (e.key === "Enter" && !signupMode) doAuthPrimary(); });
  $id("auName").addEventListener("keydown", (e) => { if (e.key === "Enter") doAuthPrimary(); });
  $id("auPw").addEventListener("input", () => {
    if (!signupMode) return;
    const sc = pwScore($id("auPw").value);
    const bar = $id("pwBar");
    bar.style.width = (sc * 25) + "%";
    bar.style.background = sc <= 1 ? "var(--danger)" : sc <= 2 ? "var(--warn)" : "var(--ok)";
  });
  $id("pfStart").addEventListener("click", createProfile);
  $id("pfName").addEventListener("keydown", (e) => { if (e.key === "Enter") createProfile(); });
  $id("userClose").addEventListener("click", () => { $id("userModal").hidden = true; });
  $id("switchUserBtn").addEventListener("click", () => { $id("userModal").hidden = true; logoutUser(); showLoginGate(); });
  $id("verifyResend").addEventListener("click", async () => {
    const u = firebase.auth().currentUser; if (!u) return;
    try {
      await u.reload();   // 이미 인증됐는데 화면만 낡은 경우 — 배너만 정리
      if (u.emailVerified) { $id("umVerify").hidden = true; toast(t("vf_already")); return; }
      await u.sendEmailVerification();
      toast(t("vf_sent_spam"));
    } catch (e) {
      if (e && e.code === "auth/too-many-requests") toast(t("vf_throttle"));
      else toast(mapAuthErr(e));
    }
  });
  $id("renameBtn").addEventListener("click", () => {
    if (!currentUser || !msgDb) return;
    const name = (prompt(t("um_rename_prompt"), currentUser.name) || "").trim();
    if (!name || name === currentUser.name) return;
    if (findUserByName(name)) { toast(t("rq_dup_name")); return; }
    try {
      msgDb.ref("users/" + currentUser.id + "/name").set(name);
      currentUser.name = name;
      if (usersCache[currentUser.id]) usersCache[currentUser.id].name = name;
      const n = $id("userChipName"); if (n) n.textContent = name;
      $id("userWho").textContent = t("um_who", name);
      renderTeamBoard();
      toast(t("um_renamed"));
    } catch (_) { toast(t("ws_err")); }
  });
  $id("wsJoinBtn").addEventListener("click", () => joinWs($id("wsCodeInput").value));
  $id("wsCodeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") joinWs($id("wsCodeInput").value); });
  $id("wsCreateBtn").addEventListener("click", () => createWs($id("wsNameInput").value));
  $id("wsShareBtn").addEventListener("click", shareInvite);
  $id("wsRegenBtn").addEventListener("click", async () => {
    if (!isAdmin() || !msgDb || !myWsId) return;
    if (!confirm(t("ws_regen_confirm"))) return;
    const code = genWsCode();
    try {
      await msgDb.ref("workspaces/" + myWsId + "/code").set(code);
      if (wsMeta) wsMeta.code = code;
      logAdmin("초대 코드 재발급", "");
      renderUmWs(); toast(t("ws_regen_done", code));
    } catch (_) { toast(t("ws_err")); }
  });
  $id("sendReqClose").addEventListener("click", () => { $id("sendReqModal").hidden = true; });
  $id("sendReqSend").addEventListener("click", sendRequest);
  $id("srKindMemo").addEventListener("click", () => setComposeKind("memo"));
  $id("srKindTask").addEventListener("click", () => setComposeKind("task"));
  $id("srToSearch").addEventListener("input", (e) => { srToQuery = e.target.value; renderToChips(); });
  $id("srToBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const m = $id("srToMenu"); m.hidden = !m.hidden;
    if (!m.hidden) { renderToChips(); const s = $id("srToSearch"); if (s && !s.hidden) setTimeout(() => s.focus(), 30); }
  });
  document.addEventListener("click", (e) => {
    const m = $id("srToMenu");
    if (m && !m.hidden && !e.target.closest("#srToSel")) m.hidden = true;
    const lm = $id("lenMenu");
    if (lm && !lm.hidden && !e.target.closest(".len-wrap")) lm.hidden = true;
  });
  // Ctrl+Enter = 보내기 (쪽지 본문·업무 요청 제목/본문 공통)
  ["sendReqText", "srTitle", "srEditor"].forEach((id) => {
    $id(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendRequest(); }
    });
  });
  $id("rqKindMemo").addEventListener("click", () => setReqKind("memo"));
  $id("rqKindTask").addEventListener("click", () => setReqKind("task"));
  // 서식 에디터 툴바 (작성·답장 공용)
  function bindEditorToolbar(tbId, edId) {
    const tb = $id(tbId); if (!tb) return;
    tb.addEventListener("mousedown", (e) => e.preventDefault());   // 에디터 포커스 유지
    tb.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $id(edId).focus();
      if (b.dataset.cmd) document.execCommand(b.dataset.cmd, false, null);
      else if (b.dataset.color) {
        document.execCommand("foreColor", false, b.dataset.color === "default" ? (document.body.dataset.theme === "dark" ? "#e4e7ee" : "#1f2430") : b.dataset.color);
      } else if (b.dataset.ins === "table") {
        document.execCommand("insertHTML", false,
          "<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>");
      } else if (b.dataset.ins === "check") {
        document.execCommand("insertHTML", false, '<ul class="cklist"><li><input type="checkbox"> 항목</li></ul><p><br></p>');
      }
    });
  }
  bindEditorToolbar("edToolbar", "srEditor");
  bindEditorToolbar("edToolbar2", "replyEditor");
  // 템플릿: 선택 시 제목/본문 채움, 저장/삭제
  $id("srTplSel").addEventListener("change", () => {
    const i = $id("srTplSel").value; if (i === "") return;
    const tp = loadTpls()[Number(i)]; if (!tp) return;
    $id("srTitle").value = tp.title || "";
    $id("srEditor").innerHTML = sanitizeHtml(tp.html || "");
  });
  $id("srTplSave").addEventListener("click", () => {
    const title = $id("srTitle").value.trim();
    const html = sanitizeHtml($id("srEditor").innerHTML);
    if (!title && !$id("srEditor").textContent.trim()) { toast(t("sr_tpl_need")); return; }
    const name = (prompt(t("sr_tpl_name"), title) || "").trim(); if (!name) return;
    const list = loadTpls().filter((tp) => tp.name !== name);   // 같은 이름은 덮어쓰기
    list.push({ name, title, html });
    saveTpls(list); renderTplSel(name); toast(t("sr_tpl_saved"));
  });
  $id("srTplDel").addEventListener("click", () => {
    const i = $id("srTplSel").value; if (i === "") return;
    const list = loadTpls(); list.splice(Number(i), 1);
    saveTpls(list); renderTplSel();
  });
  // 첨부: 파일당 1MB, 합계 2MB — dataURL로 변환해 DB에 내장
  $id("srAttach").addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []); e.target.value = "";
    files.forEach((f) => {
      if (f.size > ATT_FILE_MAX) { toast(t("sr_att_too_big", f.name)); return; }
      const total = pendingAtts.reduce((s, a) => s + a.size, 0);
      if (total + f.size > ATT_TOTAL_MAX) { toast(t("sr_att_total")); return; }
      const rd = new FileReader();
      rd.onload = () => { pendingAtts.push({ name: f.name, type: f.type || "", size: f.size, data: rd.result }); renderAttList(); };
      rd.readAsDataURL(f);
    });
  });
  $id("rqSearch").addEventListener("input", (e) => { rqQuery = e.target.value; reqShown = { inbox: REQ_PAGE, sent: REQ_PAGE }; renderRequests(); });
  $id("progClose").addEventListener("click", () => { $id("progressModal").hidden = true; });
  $id("progSave").addEventListener("click", saveProgress);
  $id("progText").addEventListener("keydown", (e) => { if (e.key === "Enter") saveProgress(); });
  $id("fwdClose").addEventListener("click", () => { $id("forwardModal").hidden = true; });
  $id("invClose").addEventListener("click", () => { $id("inviteModal").hidden = true; });
  $id("asgClose").addEventListener("click", () => { $id("assignModal").hidden = true; });
  $id("cardClose").addEventListener("click", () => { saveCardDesc(); $id("cardModal").hidden = true; cardTarget = null; });
  $id("cardDesc").addEventListener("blur", saveCardDesc);
  $id("cardCmtSend").addEventListener("click", sendCardComment);
  $id("cardCmt").addEventListener("keydown", (e) => { if (e.key === "Enter") sendCardComment(); });
  $id("dueClose").addEventListener("click", () => { $id("dueModal").hidden = true; });
  $id("kbDueSave").addEventListener("click", () => {
    if (dueTarget) kbUpdate(dueTarget.pid, dueTarget.tid, { due: $id("kbDueInput").value || null });
    $id("dueModal").hidden = true; dueTarget = null;
  });
  $id("rqSelBtn").addEventListener("click", () => { reqSelectMode = true; selectedReqIds = new Set(); updateManageUI(); renderRequests(); });
  $id("rqSelCancel").addEventListener("click", exitSelectMode);
  $id("rqSelDelBtn").addEventListener("click", () => {
    if (!selectedReqIds.size) return;
    if (!confirm(t("rq_del_confirm", selectedReqIds.size))) return;
    hideMany([...selectedReqIds]);
    exitSelectMode();
  });
  $id("rqDelAllBtn").addEventListener("click", () => {
    const list = lastLists[reqTab === "sent" ? "sent" : "inbox"] || [];
    if (!list.length) return;
    if (!confirm(t("rq_del_confirm", list.length))) return;
    hideMany(list.map((r) => r.id));
  });
  $id("replyClose").addEventListener("click", () => { $id("replyModal").hidden = true; });
  $id("replySend").addEventListener("click", sendReply);
  $id("replyText").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(); } });
  $id("replyEditor").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(); } });
  $id("rqTabInbox").addEventListener("click", () => setReqTab("inbox"));
  $id("rqTabSent").addEventListener("click", () => setReqTab("sent"));
  $id("reqPopClose").addEventListener("click", closeReqPopup);
  $id("reqPopup").addEventListener("click", (e) => { if (e.target.id === "reqPopup") closeReqPopup(); });

  $id("syncChip").addEventListener("click", openSync);
  $id("syncClose").addEventListener("click", () => { $id("syncModal").hidden = true; });

  $id("settingsClose").addEventListener("click", () => { $id("settingsModal").hidden = true; });
  $id("openBackupBtn").addEventListener("click", () => { $id("settingsModal").hidden = true; openBackup(); });
  $id("themeSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state.settings.theme = b.dataset.theme; save(); openSettings(); applyTheme(); });
  $id("unlockSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state.settings.unlockMode = b.dataset.unlock; save(); openSettings(); });
  $id("pomoInput").addEventListener("change", (e) => { const v = Math.max(1, Math.min(180, parseInt(e.target.value, 10) || 25)); state.settings.pomodoroMin = v; if (!timerRunning) resetTimer(); save(); });
  $id("shareFocusToggle").addEventListener("click", () => {
    state.settings.shareFocusTime = state.settings.shareFocusTime === false;   // 토글
    $id("shareFocusToggle").textContent = state.settings.shareFocusTime ? t("rem_on") : t("rem_off");
    save();
    // 지금 타이머로 원씽 중이면 즉시 반영(공개↔비공개)
    if (timerRunning && myStatus() === "focus") setMyStatus("focus", { auto: true, until: currentFocusUntil });
  });
  $id("shareOtToggle").addEventListener("click", () => {
    state.settings.shareOneThing = !state.settings.shareOneThing;
    $id("shareOtToggle").textContent = state.settings.shareOneThing ? t("rem_on") : t("rem_off");
    save(); republishPresence();
  });
  $id("teamFeedToggle").addEventListener("click", () => {
    state.settings.teamFeed = !state.settings.teamFeed;
    $id("teamFeedToggle").textContent = state.settings.teamFeed ? t("rem_on") : t("rem_off");
    save(); renderTeamBoard();
  });

  $id("statsClose").addEventListener("click", () => { $id("statsModal").hidden = true; });
  $id("trashClose").addEventListener("click", () => { $id("trashModal").hidden = true; });
  $id("trashEmptyBtn").addEventListener("click", emptyTrash);
  $id("backupClose").addEventListener("click", () => { $id("backupModal").hidden = true; });
  $id("exportBtn").addEventListener("click", exportBackup);
  $id("exportAllBtn").addEventListener("click", exportAllBackup);
  $id("importBtn").addEventListener("click", () => $id("importFile").click());
  $id("importFile").addEventListener("change", (e) => { if (e.target.files && e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ""; });
  $id("helpClose").addEventListener("click", () => { $id("helpModal").hidden = true; });

  document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.hidden = true; }));

  // ----- 전역 검색 (Ctrl+K) -----
  function flashEl(sel) {
    setTimeout(() => {
      const el = document.querySelector(sel);
      if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); }
    }, 120);
  }
  function openCmd() {
    $id("cmdInput").value = ""; $id("cmdResults").innerHTML = "";
    $id("cmdModal").hidden = false;
    setTimeout(() => $id("cmdInput").focus(), 30);
  }
  function cmdSection(box, label) { const h = document.createElement("div"); h.className = "sp-group-h"; h.textContent = label; box.append(h); }
  function cmdItem(box, label, sub, run) {
    const b = document.createElement("button"); b.className = "to-opt"; b.type = "button";
    const nm = document.createElement("span"); nm.textContent = label; b.append(nm);
    if (sub) { const s = document.createElement("span"); s.className = "to-opt-st"; s.textContent = sub; b.append(s); }
    b.addEventListener("click", () => { $id("cmdModal").hidden = true; run(); });
    box.append(b);
  }
  function renderCmd() {
    const q = $id("cmdInput").value.trim().toLowerCase();
    const box = $id("cmdResults"); box.innerHTML = "";
    if (!q) return;
    const hit = (s) => (s || "").toLowerCase().includes(q);
    // 내 할 일
    const todos = state.todos.filter((td) => hit(td.text)).slice(0, 7);
    if (todos.length) {
      cmdSection(box, t("cmd_todos"));
      todos.forEach((td) => {
        const gname = td.group ? (((state.groups || []).find((g) => g.id === td.group) || {}).name || "Inbox") : "Inbox";
        cmdItem(box, td.text, gname + (td.status === "done" ? " · " + t("done_h") : ""), () => {
          currentProject = null; currentGroup = td.group || null;
          searchQuery = ""; const si = $id("searchInput"); if (si) si.value = "";
          if (td.status === "done") state.doneCollapsed = false;
          render();
          flashEl('li.todo[data-id="' + td.id + '"]');
        });
      });
    }
    // 요청
    if (currentUser) {
      const reqs = Object.keys(requestsCache).filter((id) => {
        const r = requestsCache[id];
        return r && (r.to === currentUser.id || r.from === currentUser.id) && !((r.hiddenFor || []).includes(currentUser.id))
          && (hit(r.text) || hit(r.title) || hit(r.fromName) || hit(r.toName));
      }).slice(0, 7);
      if (reqs.length) {
        cmdSection(box, t("cmd_reqs"));
        reqs.forEach((id) => {
          const r = requestsCache[id];
          cmdItem(box, r.title || r.text || "", (r.from === currentUser.id ? r.toName : r.fromName) || "", () => { rqQuery = ""; const s = $id("rqSearch"); if (s) s.value = ""; openRequestById(id); });
        });
      }
      // 프로젝트 카드
      let prjHeadDone = false;
      Object.keys(projectsCache).forEach((pid) => {
        const p = projectsCache[pid] || {}; if (!projectVisible(p)) return;
        const ts = projectTodosCache[pid] || {};
        Object.keys(ts).forEach((tid) => {
          const c = ts[tid]; if (!c || !hit(c.text)) return;
          if (!prjHeadDone) { cmdSection(box, t("cmd_prj")); prjHeadDone = true; }
          cmdItem(box, c.text || "", p.name || "", () => { currentProject = pid; render(); flashEl('.kb-card[data-tid="' + tid + '"]'); });
        });
      });
    }
    if (!box.children.length) { const e = document.createElement("div"); e.className = "sp-empty"; e.textContent = t("no_results"); box.append(e); }
  }
  $id("cmdInput").addEventListener("input", renderCmd);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openCmd(); return; }
    if (e.key === "Escape") { document.querySelectorAll(".modal").forEach((m) => (m.hidden = true)); return; }
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.key === "n" || e.key === "N") { e.preventDefault(); $id("newTodo").focus(); }
    else if (e.key === "/") { e.preventDefault(); $id("searchInput").focus(); }
    else if (e.key === "s" || e.key === "S") openStats();
    else if (e.key === "t" || e.key === "T") { const order = ["auto", "light", "dark"]; state.settings.theme = order[(order.indexOf(state.settings.theme) + 1) % 3]; save(); applyTheme(); toast(t("theme_toast", t("th_" + state.settings.theme))); }
    else if (e.key === "?") $id("helpModal").hidden = false;
  });

  // ---------- init ----------
  state.trash = (state.trash || []).filter((td) => !td.deletedAt || (Date.now() - td.deletedAt) < 30 * 864e5);
  if (activeTodo()) timerRemaining = pomoSec();
  setupPWA();
  applyTheme();
  // 로그인 이력이 있는 기기: 세션 판정(0.3~1초) 전까지 노트를 그리지 않음 — 옛 로컬 데이터가 잠깐 비치는 것 원천 차단
  try { if (localStorage.getItem("onething-has-session") === "1") { document.body.classList.add("auth-wait"); setTimeout(() => document.body.classList.remove("auth-wait"), 4000); } } catch (_) {}
  { const ib = $id("inviteBanner"); if (ib) ib.hidden = !pendingInvite; }
  // 잠금 해제 방식 1회 초기화: 예전 '버튼 한 번' 저장값을 새 기본(3초 길게 누르기)으로 — 원하면 설정에서 다시 선택 가능
  try {
    if (!localStorage.getItem("onething-ul-reset")) {
      if (state.settings.unlockMode === "button") { state.settings.unlockMode = "puzzle"; save(); }
      localStorage.setItem("onething-ul-reset", "1");
    }
  } catch (_) {}
  // 로그인 화면은 여기서 미리 띄우지 않는다 — 세션 확인(onAuthStateChanged)이 끝난 뒤에만 표시(깜빡임 방지)
  applyLang(); render();
  refreshSyncState();
  ensureAuth();                        // 익명 인증 → 성공 시 startCloud()에서 클라우드 연결
  // 하루의 의식 — 오늘 원씽을 아직 안 정했으면 하루 1회 질문
  // ----- 온보딩 투어 (기기당 1회) -----
  const TOUR = [
    { title: "tour_t1", body: "tour_b1" },
    { title: "tour_t2", body: "tour_b2" },
    { title: "tour_t3", body: "tour_b3" }
  ];
  let tourIdx = 0;
  function renderTour() {
    $id("tourStep").textContent = (tourIdx + 1) + " / " + TOUR.length;
    $id("tourTitle").innerHTML = t(TOUR[tourIdx].title);
    $id("tourBody").innerHTML = t(TOUR[tourIdx].body);
    $id("tourPrev").style.display = tourIdx === 0 ? "none" : "";   // 1페이지에선 '다음'이 중앙에
    $id("tourNext").textContent = tourIdx === TOUR.length - 1 ? t("tour_start") : t("tour_next");
  }
  function closeTour() {
    try {
      localStorage.setItem("onething-tour", "1");
      localStorage.setItem("onething-ritual", todayStr());   // 첫날은 팝업 하나만 — 브리핑은 내일부터
    } catch (_) {}
    $id("tourModal").hidden = true;
    maybeFirstOT();   // 투어 직후: 첫 원씽을 3분 안에 정해보게
  }
  // ----- 첫 원씽 안내 (계정당 1회 — 빈 화면 대신 바로 하나 정하게) -----
  function maybeFirstOT() {
    try {
      if (!currentUser) return;
      if (localStorage.getItem("onething-firstot::" + currentUser.id)) return;
      if (activeTodo() || (state.todos || []).length || (state.history || []).length) {
        localStorage.setItem("onething-firstot::" + currentUser.id, "1"); return;   // 이미 쓰던 사람은 건너뜀
      }
      $id("firstOtModal").hidden = false;
      setTimeout(() => { try { $id("foInput").focus(); } catch (_) {} }, 100);
    } catch (_) {}
  }
  function closeFirstOT() {
    try { if (currentUser) localStorage.setItem("onething-firstot::" + currentUser.id, "1"); } catch (_) {}
    $id("firstOtModal").hidden = true;
  }
  $id("foClose").addEventListener("click", closeFirstOT);
  function firstOTGo() {
    const v = ($id("foInput").value || "").trim(); if (!v) { $id("foInput").focus(); return; }
    addTodo(v, { priority: "urgent" });
    const td = state.todos[state.todos.length - 1];
    if (td) sendToOneThing(td.id);
    closeFirstOT();
    toast(t("fo_done"));
  }
  $id("foGo").addEventListener("click", firstOTGo);
  $id("foInput").addEventListener("keydown", (e) => { if (e.key === "Enter") firstOTGo(); });
  function maybeShowTour() {
    try {
      if (localStorage.getItem("onething-tour")) return false;
      const g = $id("loginGate"); if (g && !g.hidden) return false;
      if (!cloudConfigured() || !currentUser) return false;
      tourIdx = 0; renderTour();
      $id("tourModal").hidden = false;
      return true;
    } catch (_) { return false; }
  }
  $id("tourClose").addEventListener("click", closeTour);
  $id("tourPrev").addEventListener("click", () => { if (tourIdx > 0) { tourIdx--; renderTour(); } });
  $id("tourNext").addEventListener("click", () => { if (tourIdx < TOUR.length - 1) { tourIdx++; renderTour(); } else closeTour(); });

  function buildRitualCands() {
    const box = $id("ritualCands"); if (!box) return; box.innerHTML = "";
    const today = todayStr();
    const cands = [];
    // ① 오늘/지난 마감의 미처리 요청
    if (currentUser) Object.keys(requestsCache).forEach((id) => {
      const r = requestsCache[id];
      if (!r || r.to !== currentUser.id) return;
      if ((r.hiddenFor || []).includes(currentUser.id) || isHandledByMe(id, r)) return;
      if (!(r.due && r.due <= today)) return;
      cands.push({ label: r.title || r.text || "", sub: t("br_req") + (r.due < today ? " · " + t("rq_overdue") : ""), run: () => {
        markRead(id);
        addTodo(r.text || "", { reqId: id, due: r.due || null, priority: "urgent", group: null });
        try { wsRef("requests/" + id + "/addedTodo").set(Date.now()); } catch (_) {}
        sendToOneThing(state.todos[state.todos.length - 1].id);
      } });
    });
    // ② 내 할 일: Now 그룹 또는 마감 임박
    state.todos.filter((td) => td.status === "todo" && !td.later && (td.priority === "urgent" || (td.due && td.due <= today)))
      .slice(0, 5).forEach((td) => cands.push({ label: td.text, sub: t("br_todo"), run: () => sendToOneThing(td.id) }));
    // ③ 프로젝트에서 내가 담당인 카드
    if (currentUser) Object.keys(projectsCache).forEach((pid) => {
      const p = projectsCache[pid] || {}; if (!projectVisible(p)) return;
      const ts = projectTodosCache[pid] || {};
      Object.keys(ts).forEach((tid) => {
        const c = ts[tid];
        if (c && kbStatusOf(c) !== "done" && c.assignee === currentUser.id)
          cands.push({ label: c.text || "", sub: t("br_prj", p.name || ""), run: () => takeAsOneThing(pid, Object.assign({ id: tid }, c)) });
      });
    });
    const seen = new Set();
    const list = cands.filter((c) => { if (!c.label || seen.has(c.label)) return false; seen.add(c.label); return true; }).slice(0, 6);
    if (!list.length) return;
    const h = document.createElement("div"); h.className = "sp-group-h"; h.textContent = t("br_h"); box.append(h);
    list.forEach((c) => {
      const b = document.createElement("button"); b.className = "st-opt rt-cand"; b.type = "button";
      const nm = document.createElement("span"); nm.textContent = c.label; b.append(nm);
      const sm = document.createElement("small"); sm.textContent = c.sub; b.append(sm);
      b.addEventListener("click", () => { closeRitual(); c.run(); });
      box.append(b);
    });
  }
  function maybeShowRitual() {
    try {
      if (localStorage.getItem("onething-ritual") === todayStr()) return;
      if (activeTodo() || state.history.some((h) => h.date === todayStr())) { localStorage.setItem("onething-ritual", todayStr()); return; }
      const g = $id("loginGate"); if (g && !g.hidden) return;   // 로그인 화면이 떠 있으면 생략
      if (!$id("tourModal").hidden) return;                     // 투어 중이면 투어가 끝난 뒤에
      if (!$id("firstOtModal").hidden) return;                  // 첫 원씽 안내 중이면 생략(팝업 겹침 방지)
      buildRitualCands();   // 오늘 브리핑: 단 하나 후보를 차려줌
      $id("ritualModal").hidden = false;
    } catch (_) {}
  }
  function closeRitual() {
    try { localStorage.setItem("onething-ritual", todayStr()); } catch (_) {}
    $id("ritualModal").hidden = true;
    $id("newTodo").focus();
  }
  $id("ritualGo").addEventListener("click", closeRitual);
  $id("ritualClose").addEventListener("click", closeRitual);
  $id("ritualSkip").addEventListener("click", closeRitual);
  $id("ritualModal").addEventListener("click", (e) => { if (e.target.id === "ritualModal") closeRitual(); });
  setTimeout(() => { if (!maybeShowTour()) { maybeFirstOT(); maybeShowRitual(); } }, 1800);   // 첫 방문은 투어 → 첫 원씽 → 이후 매일 브리핑
  $id("newTodo").focus();
})();
