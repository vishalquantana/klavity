// KD-2255: AutoSim Projects → Test Case Groups → Test Cases → AutoSims.
// Mounted inside the dashboard's AutoSims view (sidebar + top bar stay), as the "Projects & Test Cases"
// sub-tab. State lives in the URL so Back/refresh/links work:
//   /dashboard?project=P&asp=list#autosims                      → project list
//   /dashboard?project=P&asp=<apId>&asp_tab=<tab>#autosims      → project detail
//   /dashboard?project=P&asp=<apId>&asp_tc=<tcId>#autosims      → test case detail
// The dashboard calls window.klavAsp.sync() whenever the AutoSims view is shown.
(function () {
  var PAGE = 12
  var listState = { q: '', sort: 'updated', page: 1 }
  var tcState = { q: '', group: 'all', status: 'all', page: 1 }
  var role = null, cur = null, listData = []
  var PARAMS = ['asp', 'asp_tc', 'asp_tab']

  function $(id) { return document.getElementById(id) }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function fmtDate(ms) { try { return ms ? new Date(Number(ms)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '' } catch (e) { return '' } }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's') }
  function pid() {
    try { return (window.klavCurProjId && window.klavCurProjId()) || new URLSearchParams(location.search).get('project') || '' } catch (e) { return '' }
  }
  function card() { return document.querySelector('.autosims-card') }

  // ── Styles (scoped; buttons/cards/modals/seg reuse the dashboard's own classes) ─
  var css = document.createElement('style')
  css.textContent = [
    '.autosims-card.asp-on>.autosims-wrap:not(#aspRoot){display:none}',
    '.autosims-card:not(.asp-on)>#aspRoot{display:none}',
    '.asp-switch{padding:18px 26px 0}',
    '#aspRoot .asp-crumbs{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--paper-faint);margin-bottom:14px;display:flex;flex-wrap:wrap;gap:6px}',
    '#aspRoot .asp-crumbs a{color:var(--indigo);text-decoration:none}',
    '#aspRoot .asp-back{display:inline-flex;align-items:center;gap:4px;margin-bottom:10px;color:var(--paper-dim);font:600 12.5px var(--body);text-decoration:none;cursor:pointer;transition:color .15s}',
    '#aspRoot .asp-back:hover,#aspRoot .asp-back:focus-visible{color:var(--indigo);outline:none}',
    '#aspRoot .asp-back svg{flex-shrink:0}',
    '#aspRoot .head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px}',
    '#aspRoot .lead{color:var(--paper-dim);font-size:14px;margin-top:4px;max-width:70ch;white-space:pre-wrap}',
    '#aspRoot .actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
    '#aspRoot .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}',
    '#aspRoot input,#aspRoot select,#aspModalBg input,#aspModalBg select,#aspModalBg textarea{font:14px var(--body);color:var(--paper);background:var(--ink-2);border:1px solid var(--line);border-radius:8px;padding:7px 10px}',
    '#aspRoot .toolbar input[type=search]{flex:1;min-width:180px}',
    '#aspRoot .asp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}',
    '#aspRoot .asp-card{background:var(--ink-2);border:1px solid var(--line);border-radius:18px;padding:18px}',
    '#aspRoot .asp-card h3{font-size:16px;margin-bottom:4px;word-break:break-word}',
    '#aspRoot .asp-card h3 a{color:var(--paper);text-decoration:none}#aspRoot .asp-card h3 a:hover{color:var(--indigo)}',
    '#aspRoot .desc{color:var(--paper-dim);font-size:13px;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '#aspRoot .stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px}',
    '#aspRoot .stat .n{font:500 20px var(--display)}',
    '#aspRoot .stat .k{font:10px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--paper-faint)}',
    '#aspRoot .meta{font:11px var(--mono);color:var(--paper-faint);margin-bottom:10px}',
    '#aspRoot .asp-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:18px;overflow-x:auto}',
    '#aspRoot .asp-tab{background:none;border:none;border-bottom:2px solid transparent;padding:9px 14px;font:600 13px var(--body);color:var(--paper-dim);cursor:pointer;white-space:nowrap}',
    '#aspRoot .asp-tab[aria-selected=true]{color:var(--paper);border-bottom-color:var(--indigo)}',
    '#aspRoot .table-wrap{overflow-x:auto;background:var(--ink-2);border:1px solid var(--line);border-radius:18px}',
    '#aspRoot table{width:100%;border-collapse:collapse;font-size:13.5px}',
    '#aspRoot th{text-align:left;font:10px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--paper-faint);padding:10px;border-bottom:1px solid var(--line)}',
    '#aspRoot td{padding:10px;border-bottom:1px solid var(--line);vertical-align:middle}',
    '#aspRoot tr:last-child td{border-bottom:none}',
    '#aspRoot td a{color:var(--indigo);text-decoration:none;font-weight:600}',
    '#aspRoot .asp-pill{display:inline-block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.05em;padding:2px 8px;border-radius:999px;background:var(--ink-3);color:var(--paper-dim)}',
    '#aspRoot .asp-pill.active,#aspRoot .asp-pill.green{background:rgba(15,157,107,.14);color:var(--green)}',
    '#aspRoot .asp-pill.draft,#aspRoot .asp-pill.paused{background:rgba(217,131,36,.14);color:var(--amber)}',
    '#aspRoot .asp-pill.red{background:rgba(219,39,119,.12);color:var(--rose)}',
    '#aspRoot .empty{text-align:center;color:var(--paper-dim);padding:36px 16px;font-size:14px}',
    '#aspRoot .muted,#aspModalBg .muted{color:var(--paper-faint);font-size:12.5px}',
    '#aspRoot .note{font-size:13px;color:var(--paper-dim);background:var(--ink-3);border-radius:10px;padding:10px 12px;margin-bottom:14px}',
    '#aspRoot .note a{color:var(--indigo)}',
    '#aspRoot .pager{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:12px;font-size:13px;color:var(--paper-dim)}',
    '#aspRoot .loading{padding:48px 0;text-align:center;color:var(--paper-faint);font:12px var(--mono)}',
    '#aspRoot .kv{display:grid;grid-template-columns:160px 1fr;gap:10px 16px;font-size:14px}',
    '#aspRoot .kv dt{color:var(--paper-faint);font:11px var(--mono);text-transform:uppercase;letter-spacing:.05em;padding-top:3px}',
    '#aspRoot .kv dd{word-break:break-word}',
    '#aspRoot .asp-steps{margin:4px 0 4px 18px;display:grid;gap:6px;font-size:13px;color:var(--paper)}',
    '#aspRoot .asp-steps-row td{background:var(--ink-3)}',
    '#aspRoot .steps{white-space:pre-wrap;background:var(--ink-3);border-radius:10px;padding:10px 12px;font-size:13.5px}',
    '#aspRoot .btn-danger,#aspModalBg .btn-danger{color:var(--rose)}',
    '#aspModalBg .modal{max-width:520px;width:100%;max-height:90vh;overflow-y:auto;padding:22px}',
    '#aspModalBg h2{font:500 21px var(--display);margin-bottom:14px}',
    '#aspModalBg .field{margin-bottom:12px}',
    '#aspModalBg .field>label{display:block;font-size:12.5px;font-weight:600;margin-bottom:4px}',
    '#aspModalBg .field input,#aspModalBg .field select,#aspModalBg .field textarea{width:100%}',
    '#aspModalBg textarea{min-height:110px;resize:vertical}',
    '#aspModalBg .radios{display:grid;gap:8px}',
    '#aspModalBg .field .radio{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:10px 12px;cursor:pointer;font-weight:400}',
    '#aspModalBg .radio:has(input:checked){border-color:var(--indigo);background:rgba(99,102,241,.06)}',
    '#aspModalBg .radio input{width:auto;margin-top:3px}',
    '#aspModalBg .radio span{display:grid;gap:2px;font-size:13.5px}',
    '#aspModalBg .err{color:var(--rose);font-size:13px;min-height:18px}',
    '#aspModalBg .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}',
    '#aspRoot .toolbar .btn svg{vertical-align:-3px;margin-right:2px}',
    // Test case list: AI badge, one-line URL, side-by-side icon actions
    '#aspRoot .asp-tcname{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '#aspRoot .asp-ai{display:inline-flex;align-items:center;gap:3px;font:700 10px var(--body);letter-spacing:.04em;padding:2px 7px;border-radius:99px;color:#fff;background:linear-gradient(135deg,#8b5cf6,var(--indigo));white-space:nowrap;cursor:default}',
    '#aspRoot .asp-url{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#aspRoot .asp-nowrap{white-space:nowrap}',
    '#aspRoot .asp-tc-acts{display:flex;gap:6px;justify-content:flex-end}',
    '#aspRoot .asp-ibtn{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--line);background:var(--ink-2);color:var(--paper-dim);cursor:pointer;transition:background .15s,color .15s,border-color .15s}',
    '#aspRoot .asp-ibtn:hover{color:var(--indigo);border-color:var(--indigo);background:rgba(99,102,241,.07)}',
    '#aspRoot .asp-ibtn.danger:hover{color:var(--rose);border-color:var(--rose);background:rgba(225,29,72,.07)}',
    '#aspRoot .asp-ibtn:focus-visible{outline:2px solid var(--indigo);outline-offset:1px}',
    // Upload & Extract dialog
    '#aspUxBg .asp-ux{max-width:560px;width:100%;max-height:90vh;overflow-y:auto;padding:22px 24px}',
    '#aspUxBg .ux-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}',
    '#aspUxBg .ux-eyebrow{font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--paper-faint);margin-bottom:4px}',
    '#aspUxBg h2{font:600 21px var(--display);margin:0}',
    '#aspUxBg .ux-x{background:none;border:0;color:var(--paper-faint);cursor:pointer;padding:4px;border-radius:6px;line-height:0}#aspUxBg .ux-x:hover{color:var(--paper);background:var(--ink-3)}',
    '#aspUxBg .ux-stepper{display:flex;align-items:center;justify-content:center;gap:0;margin:6px auto 6px;max-width:260px}',
    '#aspUxBg .ux-dot{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:600 12px var(--body);border:1.5px solid var(--line);color:var(--paper-faint);background:var(--ink-2);flex-shrink:0}',
    '#aspUxBg .ux-dot.on{background:var(--indigo);border-color:var(--indigo);color:#fff}',
    '#aspUxBg .ux-dot.done{border-color:var(--green);color:var(--green);background:rgba(15,157,107,.08)}',
    '#aspUxBg .ux-line{flex:1;height:1.5px;background:var(--line);margin:0 6px}#aspUxBg .ux-line.done{background:var(--green)}',
    '#aspUxBg .ux-steplbl{text-align:center;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--paper-faint);margin-bottom:14px}',
    '#aspUxBg .ux-lead{color:var(--paper-dim);font-size:13.5px;margin:0 0 12px}',
    '#aspUxBg .ux-drop{border:1.5px dashed var(--line);border-radius:14px;padding:26px 16px;text-align:center;color:var(--paper-dim);cursor:pointer;display:grid;gap:6px;justify-items:center;font-size:13.5px;transition:border-color .15s,background .15s}',
    '#aspUxBg .ux-drop:hover,#aspUxBg .ux-drop.over,#aspUxBg .ux-drop:focus-visible{border-color:var(--indigo);background:rgba(99,102,241,.05);outline:none}',
    '#aspUxBg .ux-drop svg{color:var(--paper-faint)}#aspUxBg .ux-linktxt{color:var(--indigo);font-weight:600}',
    '#aspUxBg .ux-hint{font-size:12px;color:var(--paper-faint)}',
    '#aspUxBg .ux-file{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-bottom:12px;background:var(--ink-2)}',
    '#aspUxBg .ux-fic{width:34px;height:34px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;background:rgba(219,39,119,.1);color:var(--rose);flex-shrink:0}',
    '#aspUxBg .ux-fmeta{display:grid;flex:1;min-width:0}#aspUxBg .ux-fmeta b{font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#aspUxBg .ux-fmeta span{font-size:12px;color:var(--paper-faint)}',
    '#aspUxBg .ux-fok{width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}',
    '#aspUxBg .ux-link{background:none;border:0;color:var(--indigo);font:600 12.5px var(--body);cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0}',
    '#aspUxBg .ux-remove{margin:-4px 0 6px}',
    '#aspUxBg .ux-note{display:flex;gap:9px;align-items:flex-start;background:rgba(99,102,241,.07);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--paper-dim);margin:4px 0}#aspUxBg .ux-note svg{color:var(--indigo);flex-shrink:0;margin-top:1px}',
    '#aspUxBg .ux-center{text-align:center;padding:6px 0 4px;color:var(--paper-dim);font-size:13.5px}',
    '#aspUxBg .ux-hero{position:relative;width:70px;height:70px;border-radius:18px;margin:4px auto 10px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.08);color:var(--indigo)}',
    '#aspUxBg .ux-spark{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--indigo);color:#fff;display:flex;align-items:center;justify-content:center;animation:uxPulse 1.4s ease-in-out infinite}',
    '@keyframes uxPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}',
    '#aspUxBg .ux-progress{display:flex;align-items:center;gap:10px;margin:10px 0 4px}',
    '#aspUxBg .ux-bar{flex:1;height:8px;border-radius:99px;background:var(--ink-3);overflow:hidden}#aspUxBg .ux-bar span{display:block;height:100%;background:var(--indigo);border-radius:99px;transition:width .4s ease}',
    '#aspUxBg #uxPct{font:600 12px var(--mono);color:var(--paper-dim);min-width:34px;text-align:right}',
    '#aspUxBg .ux-tiles{display:grid;gap:8px;margin-bottom:12px}#aspUxBg .ux-tiles.four{grid-template-columns:repeat(4,1fr)}#aspUxBg .ux-tiles.three{grid-template-columns:repeat(3,1fr)}#aspUxBg .ux-tiles.two{grid-template-columns:repeat(2,1fr)}#aspUxBg .ux-tiles.one{grid-template-columns:1fr}',
    '#aspUxBg .ux-tile{border-radius:12px;padding:12px;background:var(--ink-3);text-align:center;display:grid;justify-items:center;gap:2px}',
    '#aspUxBg .ux-tic{color:var(--indigo)}#aspUxBg .ux-tn{font:600 20px var(--display)}#aspUxBg .ux-tk{font-size:11.5px;color:var(--paper-dim)}',
    '#aspUxBg .ux-tile.green .ux-tic{color:var(--green)}#aspUxBg .ux-tile.warn{background:rgba(217,131,36,.12)}#aspUxBg .ux-tile.warn .ux-tic{color:var(--amber)}',
    '#aspUxBg .ux-clar{font-size:13px;color:var(--paper-dim);margin-bottom:6px}#aspUxBg .ux-clar summary{cursor:pointer;color:var(--amber);font-weight:600}#aspUxBg .ux-clar ul{margin:6px 0 0 18px;display:grid;gap:4px}',
    '#aspUxBg .ux-list{border:1px solid var(--line);border-radius:12px;max-height:340px;overflow-y:auto;scrollbar-width:thin}',
    '#aspUxBg .ux-row{border-bottom:1px solid var(--line)}#aspUxBg .ux-row:last-child{border-bottom:0}',
    '#aspUxBg .ux-rhead{display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13px}',
    '#aspUxBg .ux-rhead input[type=checkbox]{width:16px;height:16px;accent-color:var(--indigo);flex-shrink:0}',
    '#aspUxBg .ux-id{font:600 11px var(--mono);color:var(--paper-faint);flex-shrink:0}',
    '#aspUxBg .ux-rt{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#aspUxBg .ux-pill{font:600 10.5px var(--body);padding:2px 8px;border-radius:99px;flex-shrink:0}#aspUxBg .ux-pill.ok{background:rgba(15,157,107,.13);color:var(--green)}#aspUxBg .ux-pill.warn{background:rgba(217,131,36,.15);color:var(--amber)}',
    '#aspUxBg .ux-chev{background:none;border:0;color:var(--paper-faint);cursor:pointer;line-height:0;padding:2px;transition:transform .15s}#aspUxBg .ux-chev[aria-expanded=true]{transform:rotate(180deg)}',
    '#aspUxBg .ux-rbody{padding:0 12px 12px 38px;display:grid;gap:6px}',
    '#aspUxBg .ux-steps{white-space:pre-wrap;font-size:12.5px;color:var(--paper-dim);background:var(--ink-3);border-radius:8px;padding:8px 10px}',
    '#aspUxBg .ux-miss{display:flex;gap:6px;align-items:flex-start;font-size:12.5px;color:var(--amber)}#aspUxBg .ux-miss svg{flex-shrink:0;margin-top:2px}',
    '#aspUxBg .ux-allready{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-top:10px}#aspUxBg .ux-allready input{width:16px;height:16px;accent-color:var(--indigo)}',
    '#aspUxBg .ux-form{display:grid;gap:6px}',
    '#aspUxBg .ux-fl{font-size:12.5px;font-weight:600;margin-top:6px;display:flex;align-items:center;gap:6px}',
    '#aspUxBg .ux-tag{font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.04em;padding:1px 6px;border-radius:5px;background:rgba(99,102,241,.1);color:var(--indigo)}#aspUxBg .ux-tag.warn{background:rgba(217,131,36,.15);color:var(--amber)}',
    '#aspUxBg input[type=url],#aspUxBg .ux-name,#aspUxBg select,#aspUxBg textarea{font:13.5px var(--body);color:var(--paper);background:var(--ink-2);border:1px solid var(--line);border-radius:8px;padding:7px 10px;width:100%}',
    '#aspUxBg .ux-name{padding:5px 8px;flex:1;min-width:0;font-weight:600}',
    '#aspUxBg textarea{resize:vertical;min-height:90px}',
    '#aspUxBg .ux-radios{display:grid;gap:6px}#aspUxBg .ux-radio{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:9px 12px;cursor:pointer;font-size:13px}',
    '#aspUxBg .ux-radio:has(input:checked){border-color:var(--indigo);background:rgba(99,102,241,.06)}#aspUxBg .ux-radio input{margin-top:3px}#aspUxBg .ux-radio span{display:grid;gap:1px}',
    '#aspUxBg .ux-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '#aspUxBg .ux-fails{margin:0 0 10px 18px;font-size:12.5px;color:var(--rose);display:grid;gap:4px}',
    '#aspUxBg .ux-err{color:var(--rose);font-size:13px;margin-top:10px}',
    '#aspUxBg .ux-acts{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:18px}#aspUxBg .ux-acts>div{display:flex;gap:8px}',
    // Figma look for every card of this popup: black primary buttons (cream in dark theme), compact
    // white secondary buttons, bold sans titles, black active step, neutral selected radios.
    '#aspUxBg .asp-ux{max-width:520px;border-radius:16px;padding:20px 22px}',
    '#aspUxBg h2{font:700 19px var(--body);letter-spacing:-.01em}',
    '#aspUxBg .ux-eyebrow{font:700 10px var(--body);letter-spacing:.06em;color:var(--paper-dim)}',
    '#aspUxBg .ux-acts .btn{font-size:13px;padding:8px 16px;border-radius:8px;box-shadow:none}',
    '#aspUxBg .ux-acts .btn-indigo{background:var(--paper);color:var(--ink-2)}#aspUxBg .ux-acts .btn-indigo:hover:not(:disabled){opacity:.88}',
    '#aspUxBg .ux-acts .btn-indigo:disabled{opacity:.4;cursor:not-allowed}',
    '#aspUxBg .ux-acts .btn-ghost{background:var(--ink-2);border:1px solid var(--line);color:var(--paper)}#aspUxBg .ux-acts .btn-ghost:hover{background:var(--ink-3)}',
    '#aspUxBg .ux-acts .btn-ghost svg{vertical-align:-2px}',
    '#aspUxBg .ux-dot{width:24px;height:24px;font-size:11px}#aspUxBg .ux-dot.on{background:var(--paper);border-color:var(--paper);color:var(--ink-2)}',
    '#aspUxBg .ux-steplbl{font:700 10px var(--body);letter-spacing:.06em}',
    '#aspUxBg .ux-lead{font-size:13px}',
    '#aspUxBg .ux-radio{border-radius:10px;padding:10px 12px}#aspUxBg .ux-radio:has(input:checked){border-color:var(--paper);background:var(--ink-3)}',
    '#aspUxBg .ux-radio input,#aspUxBg .ux-rhead input[type=checkbox],#aspUxBg .ux-allready input{accent-color:var(--paper)}',
    '#aspUxBg input[type=url],#aspUxBg .ux-name,#aspUxBg select,#aspUxBg textarea{font-size:13px}',
    '#aspUxBg input[type=url]:focus,#aspUxBg .ux-name:focus,#aspUxBg select:focus,#aspUxBg textarea:focus{outline:none;border-color:var(--paper)}',
    '#aspUxBg .ux-fl{font-size:12.5px;font-weight:700}',
    '#aspUxBg .ux-app{grid-template-columns:1fr 1fr;gap:10px}#aspUxBg .ux-app .ux-radio{align-items:center}@media (max-width:480px){#aspUxBg .ux-app{grid-template-columns:1fr}}',
    '#aspUxBg .ux-list{border-radius:10px}#aspUxBg .ux-rhead{padding:8px 12px}',
    '#aspUxBg .ux-acts .btn{display:inline-flex;align-items:center;gap:4px}',
    '#aspUxBg .muted{color:var(--paper-faint);font-size:12px}',
    '@media (max-width:560px){#aspUxBg .ux-tiles.four{grid-template-columns:repeat(2,1fr)}#aspUxBg .ux-two{grid-template-columns:1fr}}',
    // Live view of the running test case in the queue
    '#aspUxBg .ux-live,#aspRoot .ux-live{padding:0 12px 12px;display:grid;gap:8px;font-size:12.5px}',
    '#aspUxBg .ux-live a,#aspRoot .ux-live a{color:var(--indigo);font-weight:600}',
    '#aspUxBg .ux-live-shot,#aspRoot .ux-live-shot{width:100%;max-height:220px;object-fit:contain;border-radius:8px;border:1px solid var(--line);background:var(--ink-3)}',
    '#aspUxBg .ux-live-empty,#aspRoot .ux-live-empty{display:flex;align-items:center;justify-content:center;height:90px;color:var(--paper-faint)}',
    '#aspUxBg .ux-live-steps,#aspRoot .ux-live-steps{margin:0 0 0 16px;display:grid;gap:3px;color:var(--paper-dim)}',
    '#aspUxBg .ux-live-steps li.bad,#aspRoot .ux-live-steps li.bad{color:var(--rose)}#aspUxBg .ux-live-err,#aspRoot .ux-live-err{color:var(--rose)}',
    '#aspUxBg .ux-indet span{width:35%!important;animation:uxIndet 1.2s ease-in-out infinite}@keyframes uxIndet{0%{margin-left:-35%}100%{margin-left:100%}}',
    // Back link, progress bars, tiles + validation rows (shared by test case pages and Upload & Extract)
    '#aspRoot .asp-back{display:inline-flex;align-items:center;gap:4px;margin-bottom:10px;background:none;border:0;padding:0;color:var(--paper-dim);font:600 12.5px var(--body);cursor:pointer}#aspRoot .asp-back:hover{color:var(--indigo)}',
    '#aspRoot .asp-reqhead .head{margin-bottom:12px}',
    '#aspRoot .ux-bar{height:8px;border-radius:99px;background:var(--ink-3);overflow:hidden}#aspRoot .ux-bar span{display:block;height:100%;background:var(--indigo);border-radius:99px;transition:width .4s ease}',
    '#aspRoot .asp-runbox{margin-bottom:14px;border-color:rgba(99,102,241,.35)}',
    '#aspRoot .asp-reqtiles{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}',
    '#aspRoot .ux-tile{border-radius:12px;padding:10px;background:var(--ink-2);border:1px solid var(--line);text-align:center}#aspRoot .ux-tn{font:600 20px var(--display)}#aspRoot .ux-tk{font-size:11.5px;color:var(--paper-dim)}',
    '#aspRoot .asp-reqdetail{display:grid;gap:8px;font-size:13px;padding:4px 0}',
    '#aspRoot .asp-reqdetail blockquote{margin:0;padding:6px 10px;border-left:3px solid var(--line);color:var(--paper-dim);font-style:italic}',
    '#aspRoot .asp-reqtc{border-top:1px solid var(--line);padding-top:8px;display:grid;gap:4px}',
    '#aspRoot .asp-val{display:grid;gap:3px;font-size:13px;padding:8px 0;border-bottom:1px solid var(--line)}#aspRoot .asp-val:last-child{border-bottom:0}',
    '#aspRoot .asp-ev{font-size:12.5px;color:var(--paper-faint)}#aspRoot .asp-ev a{color:var(--indigo);text-decoration:none;font-weight:600}',
    '@media (max-width:760px){#aspRoot .asp-reqtiles{grid-template-columns:repeat(3,1fr)}}',
    // KD-3106: loading state while a form submits (spinner in the primary button, form locked).
    '#aspModalBg .asp-spin{display:inline-block;width:13px;height:13px;margin-right:7px;vertical-align:-2px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:asp-spin .7s linear infinite}',
    '@keyframes asp-spin{to{transform:rotate(360deg)}}',
    '#aspModalBg .modal[aria-busy=true] #aspModalBody{opacity:.6;pointer-events:none}',
    '#aspModalBg .modal[aria-busy=true] #aspModalOk{cursor:progress;opacity:1}',
    '@media (prefers-reduced-motion:reduce){#aspModalBg .asp-spin{animation-duration:2s}}',
    '@media (max-width:640px){#aspRoot .kv{grid-template-columns:1fr}.asp-switch{padding:14px 16px 0}}',
  ].join('\n')
  document.head.appendChild(css)

  function toast(msg, bad) {
    var t = $('aspToast')
    if (!t) { t = document.createElement('div'); t.id = 'aspToast'; document.body.appendChild(t) }
    t.className = 'tg-toast show' + (bad ? ' tg-toast-warn' : '')
    t.innerHTML = '<span class="tg-toast-msg">' + esc(msg) + '</span>'
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = 'tg-toast' }, 3200)
  }

  async function api(method, path, body) {
    var p = pid(), sep = path.indexOf('?') >= 0 ? '&' : '?'
    var r = await fetch(path + (p ? sep + 'project=' + encodeURIComponent(p) : ''), {
      method: method, credentials: 'include',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (r.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname + location.search + location.hash); throw new Error('Signed out') }
    var d = await r.json().catch(function () { return {} })
    if (!r.ok) { var e = new Error(d.error || ('Request failed (' + r.status + ')')); e.status = r.status; throw e }
    return d
  }

  // ── Modal form (dashboard .modal-bg/.modal) + confirm (dashboard klavConfirm) ──
  var modalSubmit = null
  var modalBusy = false   // KD-3106: true while a form submit is in flight — the modal can't be closed mid-save
  function ensureModal() {
    if ($('aspModalBg')) return
    var bg = document.createElement('div')
    bg.className = 'modal-bg'; bg.id = 'aspModalBg'
    bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="aspModalTitle"><h2 id="aspModalTitle"></h2>' +
      '<form id="aspModalForm" novalidate><div id="aspModalBody"></div><div class="err" id="aspModalErr" role="alert"></div>' +
      '<div class="acts"><button type="button" class="btn btn-ghost" id="aspModalCancel">Cancel</button><button type="submit" class="btn btn-indigo" id="aspModalOk">Save</button></div></form></div>'
    document.body.appendChild(bg)
    $('aspModalForm').addEventListener('submit', function (e) { e.preventDefault(); if (modalSubmit) modalSubmit() })
    $('aspModalCancel').addEventListener('click', function () { if (!modalBusy) closeModal() })
    bg.addEventListener('click', function (e) { if (e.target === bg && !modalBusy) closeModal() })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bg.classList.contains('show') && !modalBusy) closeModal() })
  }
  // KD-3106: show/hide the submit loading state — spinner + busy label, fields and Cancel disabled.
  function setModalBusy(on, busyLabel, idleLabel) {
    modalBusy = !!on
    var ok = $('aspModalOk'), modal = ok && ok.closest('.modal')
    if (!ok) return
    ok.disabled = !!on
    $('aspModalCancel').disabled = !!on
    if (modal) modal.setAttribute('aria-busy', on ? 'true' : 'false')
    $('aspModalBody').querySelectorAll('input,textarea,select').forEach(function (el) {
      if (on) { el.dataset.aspWasDisabled = el.disabled ? '1' : ''; el.disabled = true }
      else { el.disabled = el.dataset.aspWasDisabled === '1'; delete el.dataset.aspWasDisabled }
    })
    if (on) ok.innerHTML = '<span class="asp-spin" aria-hidden="true"></span>' + esc(busyLabel || 'Saving…')
    else ok.textContent = idleLabel || 'Save'
  }
  function closeModal() { var bg = $('aspModalBg'); if (bg) bg.classList.remove('show'); modalSubmit = null }
  function openForm(opts) {
    ensureModal()
    setModalBusy(false, '', opts.okLabel)   // never open a new form in a stale loading state
    $('aspModalTitle').textContent = opts.title
    $('aspModalErr').textContent = ''
    $('aspModalOk').textContent = opts.okLabel || 'Save'
    $('aspModalBody').innerHTML = (opts.message ? '<p class="muted" style="margin-bottom:12px;font-size:13.5px">' + esc(opts.message) + '</p>' : '') +
      (opts.fields || []).map(function (f) {
        var id = 'mf_' + f.key, v = f.value == null ? '' : f.value, ctl
        if (f.type === 'radio') ctl = '<div id="' + id + '" role="radiogroup" class="radios">' + f.options.map(function (o) {
          return '<label class="radio"><input type="radio" name="' + id + '" value="' + esc(o.value) + '"' + (String(o.value) === String(v) ? ' checked' : '') + (o.disabled ? ' disabled' : '') + '><span><b>' + esc(o.label) + '</b>' + (o.hint ? '<span class="muted">' + esc(o.hint) + '</span>' : '') + '</span></label>'
        }).join('') + '</div>'
        else if (f.type === 'textarea') ctl = '<textarea id="' + id + '" maxlength="' + (f.max || 4000) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(v) + '</textarea>'
        else if (f.type === 'select') ctl = '<select id="' + id + '">' + f.options.map(function (o) { return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(v) ? ' selected' : '') + '>' + esc(o.label) + '</option>' }).join('') + '</select>'
        else ctl = '<input id="' + id + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '" maxlength="' + (f.max || 200) + '"' + (f.type === 'password' ? ' autocomplete="new-password"' : '') + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>'
        return '<div class="field" id="fld_' + f.key + '"><label for="' + id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>' + ctl + (f.hint ? '<div class="muted">' + esc(f.hint) + '</div>' : '') + '</div>'
      }).join('')
    // showIf: { key, value } — shown (and validated/submitted) only while that radio has that value.
    var radioVal = function (key) { var c = document.querySelector('input[name="mf_' + key + '"]:checked'); return c ? c.value : '' }
    var shown = function (f) { return !f.showIf || radioVal(f.showIf.key) === f.showIf.value }
    var sync = function () { (opts.fields || []).forEach(function (f) { if (f.showIf) $('fld_' + f.key).style.display = shown(f) ? '' : 'none' }) }
    $('aspModalBody').querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', sync) })
    sync()
    modalSubmit = async function () {
      var vals = {}
      for (var i = 0; i < (opts.fields || []).length; i++) {
        var f = opts.fields[i], el = $('mf_' + f.key)
        if (!shown(f)) continue
        if (f.type === 'radio') { vals[f.key] = radioVal(f.key); continue }
        var v = f.type === 'password' ? el.value : el.value.trim()
        if (f.required && !v) { $('aspModalErr').textContent = f.label + ' is required.'; el.focus(); return }
        if (f.pattern && v && !f.pattern.test(v)) { $('aspModalErr').textContent = f.patternMsg; el.focus(); return }
        vals[f.key] = v
      }
      $('aspModalErr').textContent = ''
      setModalBusy(true, opts.busyLabel, opts.okLabel)
      try { await opts.submit(vals); setModalBusy(false, '', opts.okLabel); closeModal() }
      catch (e) { setModalBusy(false, '', opts.okLabel); $('aspModalErr').textContent = e.message }
    }
    $('aspModalBg').classList.add('show')
    var first = $('aspModalBody').querySelector('input:not([type=radio]),textarea,select'); if (first) first.focus()
  }
  // cancelLabel: the dismiss button's text (default "Cancel") — pass one when the action itself is a "cancel"
  // so the two buttons can't be confused ("Cancel" vs "Cancel run").
  async function confirmDanger(title, message, okLabel, fn, cancelLabel) {
    var ok = typeof window.klavConfirm === 'function'
      ? await window.klavConfirm({ title: title, message: message, confirmText: okLabel, cancelText: cancelLabel || 'Cancel' })
      : window.confirm(title + '\n\n' + message)
    if (!ok) return
    try { await fn() } catch (e) { toast(e.message, true) }
  }

  // ── URL state + routing ───────────────────────────────────────────────────────
  function state() { var q = new URLSearchParams(location.search); return { asp: q.get('asp'), tc: q.get('asp_tc'), tab: q.get('asp_tab') } }
  function urlFor(s) {
    var u = new URL(location.href)
    PARAMS.forEach(function (k) { u.searchParams.delete(k) })
    if (s) { u.searchParams.set('asp', s.asp || 'list'); if (s.tc) u.searchParams.set('asp_tc', s.tc); if (s.tab) u.searchParams.set('asp_tab', s.tab) }
    var p = pid(); if (p) u.searchParams.set('project', p)
    return u.pathname + (u.search || '') + '#autosims'
  }
  function go(s, replace) { history[replace ? 'replaceState' : 'pushState'](null, '', urlFor(s)); sync() }
  function navLink(s, label) { return '<a href="' + esc(urlFor(s)) + '" data-asp-nav="' + esc(JSON.stringify(s)) + '">' + esc(label) + '</a>' }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-asp-nav]')
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault(); go(JSON.parse(a.getAttribute('data-asp-nav')))
  })
  window.addEventListener('popstate', function () { if (document.body.getAttribute('data-view') === 'autosims') sync() })

  // back = { to: <state for go(); null = the AutoSims sub-tab>, label } — every level gets a "← <parent>"
  // button above the breadcrumb, so the flow never relies on the breadcrumb or the browser's Back alone.
  function crumbs(items, back) {
    $('aspCrumbs').innerHTML = items.join('<span aria-hidden="true">/</span>')
    var b = $('aspBack')
    if (!b) { b = document.createElement('div'); b.id = 'aspBack'; $('aspCrumbs').parentNode.insertBefore(b, $('aspCrumbs')) }
    b.innerHTML = back
      ? '<a class="asp-back" href="' + esc(urlFor(back.to)) + '" data-asp-nav="' + esc(JSON.stringify(back.to)) + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
        esc(back.label) + '</a>'
      : ''
  }
  function setSwitch(on) {
    var c = card(); if (!c) return
    c.classList.toggle('asp-on', on)
    document.querySelectorAll('[data-asp-switch]').forEach(function (b) {
      var active = (b.getAttribute('data-asp-switch') === 'projects') === on
      b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active))
    })
  }

  // Show the sub-tab the URL asks for. Called by the dashboard each time the AutoSims view is shown.
  async function sync() {
    // A direct /dashboard…#autosims load runs setView before initTrailsView exists, leaving the AutoSims
    // list (and the wizard this tab opens) uninitialised. initTrailsView is idempotent, so make sure here.
    if (typeof window.initTrailsView === 'function') window.initTrailsView()
    var s = state()
    setSwitch(!!s.asp)
    if (!s.asp) return
    $('aspMain').innerHTML = '<div class="loading">Loading…</div>'
    try {
      if (s.asp === 'list') await renderList()
      else if (s.tc) await renderTestCase(s.asp, s.tc)
      else await renderProject(s.asp, s.tab || 'overview')
    } catch (e) {
      // A project/test case from another Klavity project (e.g. after switching projects) → back to the list.
      if (e.status === 404 && s.asp !== 'list') { go({ asp: 'list' }, true); return }
      $('aspMain').innerHTML = '<div class="empty">' + esc(e.message) + '<br><br>' + navLink({ asp: 'list' }, 'Back to projects') + '</div>'
    }
  }
  async function refresh() { if (state().asp) await sync() }

  // ── Project list ──────────────────────────────────────────────────────────────
  function stat(n, k) { return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="k">' + esc(k) + '</div></div>' }
  function pager(page, pages, total, key) {
    if (pages <= 1) return ''
    return '<div class="pager"><span>' + total + ' total</span><button class="btn btn-ghost btn-sm" data-pg-' + key + '="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>Previous</button>' +
      '<span>Page ' + page + ' of ' + pages + '</span><button class="btn btn-ghost btn-sm" data-pg-' + key + '="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>Next</button></div>'
  }
  function bindPager(key, fn) { document.querySelectorAll('[data-pg-' + key + ']').forEach(function (b) { b.onclick = function () { fn(Number(b.getAttribute('data-pg-' + key))) } }) }

  async function renderList() {
    crumbs(['<span>Projects</span>'])   // top level: the AUTOSIMS tab above already goes back, no back link
    var d = await api('GET', '/api/autosim-projects')
    role = d.role; listData = d.projects
    $('aspMain').innerHTML =
      '<div class="head"><div><h1>Projects &amp; Test Cases</h1><p class="lead">Group AutoSims into projects and test cases. Each project keeps its own login credentials.</p></div>' +
      '<button class="btn btn-indigo" id="aspNewProj">+ New project</button></div>' +
      '<div class="toolbar"><input type="search" id="aspPq" placeholder="Search projects" aria-label="Search projects" value="' + esc(listState.q) + '">' +
      '<select id="aspPsort" aria-label="Sort"><option value="updated">Last updated</option><option value="created">Newest</option><option value="name">Name</option><option value="trails">Most AutoSims</option></select></div>' +
      '<div id="aspPlist"></div>'
    $('aspPsort').value = listState.sort
    $('aspPq').addEventListener('input', function () { listState.q = this.value; listState.page = 1; drawList() })
    $('aspPsort').addEventListener('change', function () { listState.sort = this.value; drawList() })
    $('aspNewProj').addEventListener('click', function () { editProject(null) })
    drawList()
  }
  function drawList() {
    var q = listState.q.trim().toLowerCase()
    var rows = listData.filter(function (p) { return !q || (p.name + ' ' + p.description).toLowerCase().indexOf(q) >= 0 })
    rows.sort({ updated: function (a, b) { return b.updatedAt - a.updatedAt }, created: function (a, b) { return b.createdAt - a.createdAt }, name: function (a, b) { return a.name.localeCompare(b.name) }, trails: function (a, b) { return b.trailCount - a.trailCount } }[listState.sort])
    if (!listData.length) { $('aspPlist').innerHTML = '<div class="empty">No projects yet. Create one to start organising your AutoSims into test cases.</div>'; return }
    if (!rows.length) { $('aspPlist').innerHTML = '<div class="empty">No projects match "' + esc(listState.q) + '".</div>'; return }
    var pages = Math.max(1, Math.ceil(rows.length / PAGE)); listState.page = Math.min(listState.page, pages)
    $('aspPlist').innerHTML = '<div class="asp-grid">' + rows.slice((listState.page - 1) * PAGE, listState.page * PAGE).map(function (p) {
      var s = { asp: p.id }
      return '<div class="asp-card"><h3>' + navLink(s, p.name) + '</h3>' +
        '<div class="desc">' + (p.description ? esc(p.description) : '<span class="muted">No description</span>') + '</div>' +
        '<div class="stats">' + stat(p.groupCount, 'Groups') + stat(p.testCaseCount, 'Test cases') + stat(p.trailCount, 'AutoSims') + '</div>' +
        '<div class="meta">Created ' + esc(fmtDate(p.createdAt)) + ' · Updated ' + esc(fmtDate(p.updatedAt)) + '</div>' +
        '<div class="actions"><a class="btn btn-ghost btn-sm" href="' + esc(urlFor(s)) + '" data-asp-nav="' + esc(JSON.stringify(s)) + '">View</a>' +
        '<button class="btn btn-ghost btn-sm" data-edit="' + esc(p.id) + '">Edit</button>' +
        '<button class="btn btn-ghost btn-sm btn-danger" data-del="' + esc(p.id) + '">Delete</button></div></div>'
    }).join('') + '</div>' + pager(listState.page, pages, rows.length, 'p')
    var byId = function (id) { return listData.find(function (p) { return p.id === id }) }
    $('aspPlist').querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { editProject(byId(b.dataset.edit)) } })
    $('aspPlist').querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { deleteProject(byId(b.dataset.del), true) } })
    bindPager('p', function (n) { listState.page = n; drawList() })
  }
  function editProject(p) {
    openForm({
      title: p ? 'Edit project' : 'New project', okLabel: p ? 'Save' : 'Create project',
      fields: [
        { key: 'name', label: 'Project name', required: true, max: 80, value: p && p.name, placeholder: 'e.g. Website Automation' },
        { key: 'description', label: 'Description', type: 'textarea', max: 2000, value: p && p.description },
        // Setup steps are not asked here: the project may not be a PX4 app. Upload & Extract asks
        // "PX4 or other application" at the Start URL step and adds the PX4 steps only for PX4.
      ],
      submit: async function (v) {
        if (p) { await api('PATCH', '/api/autosim-projects/' + encodeURIComponent(p.id), v); toast('Project updated'); sync() }
        else {
          var d = await api('POST', '/api/autosim-projects', v)
          toast('Project created'); go({ asp: d.project.id })
        }
      },
    })
  }
  function deleteProject(p, stay) {
    confirmDanger('Delete "' + p.name + '"?',
      'Its ' + plural(p.groupCount, 'group') + ' and ' + plural(p.testCaseCount, 'test case') + ' will be deleted. Its ' + plural(p.trailCount, 'AutoSim') + ' and credentials are kept and become unassigned. This cannot be undone.',
      'Delete project',
      async function () { await api('DELETE', '/api/autosim-projects/' + encodeURIComponent(p.id)); toast('Project deleted'); if (stay) sync(); else go({ asp: 'list' }) })
  }

  // ── Project detail ────────────────────────────────────────────────────────────
  async function loadProject(apId) {
    var d = await api('GET', '/api/autosim-projects/' + encodeURIComponent(apId))
    role = d.role
    var accs = []
    try { accs = (await api('GET', '/api/projects/' + encodeURIComponent(d.projectId) + '/test-accounts')).accounts || [] } catch (e) { }
    d.accounts = accs.filter(function (a) { return !a.autosimProjectId || a.autosimProjectId === apId })
    cur = d
    return d
  }
  function groupName(gid) { var g = cur.groups.find(function (x) { return x.id === gid }); return g ? g.name : '' }

  async function renderProject(apId, tab) {
    await loadProject(apId)
    var p = cur.project
    crumbs([navLink({ asp: 'list' }, 'Projects'), '<span>' + esc(p.name) + '</span>'], { to: { asp: 'list' }, label: 'Back to Projects' })
    var TABS = [['overview', 'Overview'], ['credentials', 'Credentials'], ['groups', 'Test Case Groups'], ['test-cases', 'Test Cases']]
    if (tab === 'requirements') tab = 'test-cases'   // the Requirements tab was removed: extracted test cases live under Test Cases
    if (!TABS.some(function (t) { return t[0] === tab })) tab = 'overview'
    $('aspMain').innerHTML =
      '<div class="head"><div><h1>' + esc(p.name) + '</h1>' + (p.description ? '<p class="lead">' + esc(p.description) + '</p>' : '') + '</div>' +
      '<div class="actions"><button class="btn btn-ghost" id="aspPEdit">Edit</button><button class="btn btn-ghost btn-danger" id="aspPDel">Delete</button></div></div>' +
      '<div class="asp-tabs" role="tablist">' + TABS.map(function (t) { return '<button class="asp-tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>' }).join('') + '</div>' +
      '<section id="aspTab"></section>'
    $('aspPEdit').onclick = function () { editProject(p) }
    $('aspPDel').onclick = function () { deleteProject(p, false) }
    $('aspMain').querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { switchTab(b.dataset.tab) } })
    drawTab(tab)
  }
  function switchTab(tab) {
    history.replaceState(null, '', urlFor({ asp: cur.project.id, tab: tab }))
    $('aspMain').querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === tab)) })
    drawTab(tab)
  }
  async function refreshTab(tab) { await loadProject(cur.project.id); drawTab(tab) }
  function drawTab(tab) {
    if (tab === 'credentials') return drawCreds()
    if (tab === 'groups') return drawGroups()
    if (tab === 'test-cases') return drawTestCases()
    var p = cur.project
    $('aspTab').innerHTML = '<div class="asp-card"><div class="stats" style="margin-bottom:16px">' +
      stat(p.groupCount, 'Test case groups') + stat(p.testCaseCount, 'Test cases') + stat(p.trailCount, 'AutoSims') + stat(cur.accounts.length, 'Credentials') + '</div>' +
      '<dl class="kv"><dt>Name</dt><dd>' + esc(p.name) + '</dd><dt>Description</dt><dd>' + (p.description ? esc(p.description) : '<span class="muted">None</span>') + '</dd>' +
      '<dt>Created</dt><dd>' + esc(fmtDate(p.createdAt)) + (p.createdBy ? ' <span class="muted">by ' + esc(p.createdBy) + '</span>' : '') + '</dd><dt>Last updated</dt><dd>' + esc(fmtDate(p.updatedAt)) + '</dd></dl></div>'
  }

  // ── Credentials (existing Test Accounts API; secrets are write-only) ─────────
  function drawCreds() {
    var isAdmin = role === 'admin', apId = cur.project.id, rows = cur.accounts
    var base = '/api/projects/' + encodeURIComponent(cur.projectId) + '/test-accounts'
    $('aspTab').innerHTML =
      '<p class="note">Store as many logins as this project needs, each with its own reference name. Passwords are encrypted and never shown again after saving. ' +
      '<b>Shared</b> credentials are available to every project. <a href="/autosims/auth?project=' + esc(encodeURIComponent(cur.projectId)) + '">Verify a login</a></p>' +
      (isAdmin ? '<div class="toolbar"><button class="btn btn-indigo" id="aspCredAdd">+ Add credentials</button></div>' : '<p class="note">Only project admins can add or change credentials.</p>') +
      (rows.length ? '<div class="table-wrap"><table><thead><tr><th>Reference name</th><th>Email / username</th><th>Type</th><th>Password</th><th>Scope</th><th>Updated</th><th></th></tr></thead><tbody>' +
        rows.map(function (a) {
          var mine = a.autosimProjectId === apId
          return '<tr><td><b>' + esc(a.name) + '</b></td><td>' + esc(a.loginEmail) + '</td><td>' + esc(a.authShape) + '</td>' +
            '<td>' + (a.authShape === 'otp' ? '<span class="muted">n/a</span>' : '<span aria-label="hidden">••••••••</span>') + '</td>' +
            '<td>' + (mine ? '<span class="asp-pill green">This project</span>' : '<span class="asp-pill">Shared</span>') + '</td>' +
            '<td class="muted">' + esc(fmtDate(a.updatedAt)) + '</td><td><div class="actions">' +
            (isAdmin ? '<button class="btn btn-ghost btn-sm" data-cedit="' + esc(a.id) + '">Edit</button>' +
              (a.authShape !== 'otp' ? '<button class="btn btn-ghost btn-sm" data-cpw="' + esc(a.id) + '">Update password</button>' : '') +
              '<button class="btn btn-ghost btn-sm" data-cscope="' + esc(a.id) + '">' + (mine ? 'Make shared' : 'Use only here') + '</button>' +
              '<button class="btn btn-ghost btn-sm btn-danger" data-cdel="' + esc(a.id) + '">Delete</button>' : '') +
            '</div></td></tr>'
        }).join('') + '</tbody></table></div>'
        : '<div class="empty">No credentials yet. Add the login an AutoSim should use for this project.</div>')
    var acc = function (id) { return rows.find(function (a) { return a.id === id }) }
    if ($('aspCredAdd')) $('aspCredAdd').onclick = function () {
      openForm({
        title: 'Add credentials', okLabel: 'Save credentials',
        fields: [
          { key: 'name', label: 'Reference name', required: true, max: 40, placeholder: 'e.g. admin', pattern: /^[a-z0-9_-]{1,40}$/, patternMsg: 'Reference name: lowercase letters, digits, _ or - (max 40).', hint: 'Test cases pick credentials by this name.' },
          { key: 'login_email', label: 'Email ID / username', required: true, type: 'email', max: 200 },
          { key: 'auth_shape', label: 'Login type', type: 'select', value: 'password', options: [{ value: 'password', label: 'Email + password' }, { value: 'otp', label: 'Email + one-time code' }, { value: 'token', label: 'API token' }] },
          { key: 'password', label: 'Password / token', type: 'password', max: 2000, hint: 'Leave empty for one-time-code logins.' },
        ],
        submit: async function (v) {
          if (v.auth_shape !== 'otp' && !v.password) throw new Error('Password is required for this login type.')
          var body = { name: v.name, login_email: v.login_email, auth_shape: v.auth_shape, autosim_project_id: apId }
          if (v.auth_shape !== 'otp') body.password = v.password
          await api('POST', base, body); toast('Credentials saved'); refreshTab('credentials')
        },
      })
    }
    $('aspTab').querySelectorAll('[data-cedit]').forEach(function (b) {
      b.onclick = function () {
        var a = acc(b.dataset.cedit)
        openForm({ title: 'Edit "' + a.name + '"', fields: [{ key: 'login_email', label: 'Email ID / username', required: true, type: 'email', max: 200, value: a.loginEmail }],
          submit: async function (v) { await api('PATCH', base + '/' + encodeURIComponent(a.id), v); toast('Credentials updated'); refreshTab('credentials') } })
      }
    })
    $('aspTab').querySelectorAll('[data-cpw]').forEach(function (b) {
      b.onclick = function () {
        var a = acc(b.dataset.cpw)
        openForm({ title: 'Update password for "' + a.name + '"', okLabel: 'Update password', fields: [{ key: 'password', label: 'New password / token', type: 'password', required: true, max: 2000 }],
          submit: async function (v) { await api('PATCH', base + '/' + encodeURIComponent(a.id), { password: v.password }); toast('Password updated') } })
      }
    })
    $('aspTab').querySelectorAll('[data-cscope]').forEach(function (b) {
      b.onclick = async function () {
        var a = acc(b.dataset.cscope); b.disabled = true
        try { await api('PATCH', base + '/' + encodeURIComponent(a.id), { autosim_project_id: a.autosimProjectId === apId ? null : apId }); toast('Scope updated'); refreshTab('credentials') }
        catch (e) { toast(e.message, true); b.disabled = false }
      }
    })
    $('aspTab').querySelectorAll('[data-cdel]').forEach(function (b) {
      b.onclick = function () {
        var a = acc(b.dataset.cdel)
        confirmDanger('Delete "' + a.name + '"?', 'Test cases and AutoSims that log in with these credentials will stop working. Deletion is blocked while any of them still uses them.', 'Delete credentials',
          async function () { await api('DELETE', base + '/' + encodeURIComponent(a.id)); toast('Credentials deleted'); refreshTab('credentials') })
      }
    })
  }

  // ── Groups ────────────────────────────────────────────────────────────────────
  function drawGroups() {
    var apBase = '/api/autosim-projects/' + encodeURIComponent(cur.project.id)
    var count = function (gid) { return cur.testCases.filter(function (t) { return t.groupId === gid }).length }
    var ungrouped = count(null)
    $('aspTab').innerHTML = '<div class="toolbar"><button class="btn btn-indigo" id="aspGAdd">+ New group</button></div>' +
      (cur.groups.length || ungrouped ? '<div class="asp-grid">' + cur.groups.map(function (g) {
        return '<div class="asp-card"><h3>' + esc(g.name) + '</h3><div class="desc">' + (g.description ? esc(g.description) : '<span class="muted">No description</span>') + '</div>' +
          '<div class="stats">' + stat(count(g.id), 'Test cases') + '</div><div class="actions">' +
          '<button class="btn btn-ghost btn-sm" data-gview="' + esc(g.id) + '">View test cases</button><button class="btn btn-ghost btn-sm" data-gedit="' + esc(g.id) + '">Edit</button>' +
          '<button class="btn btn-ghost btn-sm btn-danger" data-gdel="' + esc(g.id) + '">Delete</button></div></div>'
      }).join('') +
        '<div class="asp-card"><h3>Ungrouped</h3><div class="desc muted">Test cases not in any group.</div><div class="stats">' + stat(ungrouped, 'Test cases') + '</div>' +
        '<div class="actions"><button class="btn btn-ghost btn-sm" data-gview="none">View test cases</button></div></div></div>'
        : '<div class="empty">No groups yet. Groups keep large projects tidy, for example Login Scenarios or Payment Scenarios.</div>')
    var grp = function (id) { return cur.groups.find(function (g) { return g.id === id }) }
    var form = function (g) {
      openForm({ title: g ? 'Edit group' : 'New group', okLabel: g ? 'Save' : 'Create group',
        fields: [{ key: 'name', label: 'Group name', required: true, max: 80, value: g && g.name }, { key: 'description', label: 'Description', type: 'textarea', max: 2000, value: g && g.description }],
        submit: async function (v) {
          if (g) await api('PATCH', apBase + '/groups/' + encodeURIComponent(g.id), v); else await api('POST', apBase + '/groups', v)
          toast(g ? 'Group updated' : 'Group created'); refreshTab('groups')
        } })
    }
    $('aspGAdd').onclick = function () { form(null) }
    $('aspTab').querySelectorAll('[data-gedit]').forEach(function (b) { b.onclick = function () { form(grp(b.dataset.gedit)) } })
    $('aspTab').querySelectorAll('[data-gview]').forEach(function (b) { b.onclick = function () { tcState.group = b.dataset.gview; tcState.page = 1; switchTab('test-cases') } })
    $('aspTab').querySelectorAll('[data-gdel]').forEach(function (b) {
      b.onclick = function () {
        var g = grp(b.dataset.gdel)
        confirmDanger('Delete group "' + g.name + '"?', 'Its ' + plural(count(g.id), 'test case') + ' will become ungrouped. No test cases or AutoSims are deleted.', 'Delete group',
          async function () { await api('DELETE', apBase + '/groups/' + encodeURIComponent(g.id)); toast('Group deleted'); refreshTab('groups') })
      }
    })
  }

  // ── Test cases ────────────────────────────────────────────────────────────────
  function credLabel(a) { return a.name + ' (' + a.loginEmail + ')' + (a.autosimProjectId ? '' : ' · shared') }
  function credOf(tc) { return tc && tc.testAccountId ? cur.accounts.find(function (a) { return a.id === tc.testAccountId }) || null : null }
  function testCaseForm(tc) {
    var apBase = '/api/autosim-projects/' + encodeURIComponent(cur.project.id)
    var accs = cur.accounts, curCred = credOf(tc)
    openForm({ title: tc ? 'Edit test case' : 'New test case', okLabel: tc ? 'Save' : 'Create test case', busyLabel: tc ? 'Saving…' : 'Creating test case…',
      fields: [
        { key: 'name', label: 'Test case name', required: true, max: 120, value: tc && tc.name, placeholder: 'e.g. Valid login' },
        { key: 'start_url', label: 'Start URL', required: true, type: 'url', max: 500, value: tc && tc.startUrl, placeholder: 'https://app.example.com/login',
          pattern: /^https?:\/\/\S+$/, patternMsg: 'Start URL must start with http:// or https://', hint: 'Where the AutoSim opens the browser.' },
        { key: 'description', label: 'Execution steps', type: 'textarea', max: 4000, value: tc && tc.description,
          placeholder: '1. Log in\n2. Choose the "PX4 Softwares" company\n3. Open Reports and check the totals load',
          hint: 'What the AutoSim should do and check, in plain words. Used as the AutoSim objective.' },
        { key: 'preconditions', label: 'Preconditions', type: 'textarea', max: 1000, value: tc && tc.preconditions,
          placeholder: 'e.g. The user account exists and has at least one project', hint: 'State that must hold before the steps run (optional).' },
        { key: 'expected_result', label: 'Expected result', type: 'textarea', max: 1000, value: tc && tc.expectedResult,
          placeholder: 'e.g. The dashboard opens and shows "Welcome back"', hint: 'What must be true at the end for this test case to pass. Runs are validated against it.' },
        { key: 'exec', label: 'How should this test case run?', type: 'radio', value: curCred ? 'creds' : 'none', options: [
          { value: 'none', label: 'Execute without credentials', hint: 'Public pages only. No login step.' },
          { value: 'creds', label: 'Execute with credentials', disabled: !accs.length,
            hint: accs.length ? 'For flows with a login form: the AutoSim types this email/username and password.' : 'Add credentials in the Credentials tab first.' },
        ] },
        { key: 'test_account_id', label: 'Credentials (reference name)', type: 'select', showIf: { key: 'exec', value: 'creds' },
          value: curCred ? curCred.id : (accs[0] && accs[0].id), options: accs.map(function (a) { return { value: a.id, label: credLabel(a) } }) },
        { key: 'group_id', label: 'Group', type: 'select', value: tc ? (tc.groupId || '') : (tcState.group !== 'all' && tcState.group !== 'none' ? tcState.group : ''), options: [{ value: '', label: 'No group' }].concat(cur.groups.map(function (g) { return { value: g.id, label: g.name } })) },
        { key: 'status', label: 'Status', type: 'select', value: tc ? tc.status : 'active', options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }] },
      ],
      submit: async function (v) {
        v.group_id = v.group_id || null
        v.test_account_id = v.exec === 'creds' ? v.test_account_id : null
        delete v.exec
        if (tc) await api('PATCH', apBase + '/test-cases/' + encodeURIComponent(tc.id), v); else await api('POST', apBase + '/test-cases', v)
        await sync()   // keep the spinner until the list shows the new/updated test case
        toast(tc ? 'Test case updated' : 'Test case created')
      } })
  }
  function deleteTestCaseConfirm(tc, after) {
    confirmDanger('Delete test case "' + tc.name + '"?', 'Its ' + plural(tc.trailCount, 'AutoSim') + ' stay in this project, unassigned to a test case. No AutoSims are deleted.', 'Delete test case',
      async function () { await api('DELETE', '/api/autosim-projects/' + encodeURIComponent(cur.project.id) + '/test-cases/' + encodeURIComponent(tc.id)); toast('Test case deleted'); after() })
  }
  async function moveTestCase(tc, groupId) {
    await api('PATCH', '/api/autosim-projects/' + encodeURIComponent(cur.project.id) + '/test-cases/' + encodeURIComponent(tc.id), { group_id: groupId || null })
    toast(groupId ? 'Moved to ' + groupName(groupId) : 'Moved to Ungrouped')
  }
  function drawTestCases() {
    $('aspTab').innerHTML = '<div class="toolbar"><input type="search" id="aspTq" placeholder="Search test cases" aria-label="Search test cases" value="' + esc(tcState.q) + '">' +
      '<select id="aspTgroup" aria-label="Group"><option value="all">All groups</option><option value="none">Ungrouped</option>' + cur.groups.map(function (g) { return '<option value="' + esc(g.id) + '">' + esc(g.name) + '</option>' }).join('') + '</select>' +
      '<select id="aspTstatus" aria-label="Status"><option value="all">Any status</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select>' +
      '<button class="btn btn-ghost" id="aspTcExtract" title="Create test cases from a requirements document (PDF, DOCX, TXT)">' + ui('upload', 15) + ' Upload &amp; Extract</button>' +
      '<button class="btn btn-indigo" id="aspTcAdd">+ New test case</button></div><div id="aspTcList"></div>'
    if (tcState.group !== 'all' && tcState.group !== 'none' && !cur.groups.some(function (g) { return g.id === tcState.group })) tcState.group = 'all'
    $('aspTgroup').value = tcState.group; $('aspTstatus').value = tcState.status
    $('aspTq').oninput = function () { tcState.q = this.value; tcState.page = 1; drawTcRows() }
    $('aspTgroup').onchange = function () { tcState.group = this.value; tcState.page = 1; drawTcRows() }
    $('aspTstatus').onchange = function () { tcState.status = this.value; tcState.page = 1; drawTcRows() }
    $('aspTcAdd').onclick = function () { testCaseForm(null) }
    $('aspTcExtract').onclick = function () { uxOpen() }
    drawTcRows()
  }
  function drawTcRows() {
    var q = tcState.q.trim().toLowerCase()
    var rows = cur.testCases.filter(function (t) {
      if (q && (t.name + ' ' + t.description).toLowerCase().indexOf(q) < 0) return false
      if (tcState.group === 'none' && t.groupId) return false
      if (tcState.group !== 'all' && tcState.group !== 'none' && t.groupId !== tcState.group) return false
      return tcState.status === 'all' || t.status === tcState.status
    })
    if (!cur.testCases.length) { $('aspTcList').innerHTML = '<div class="empty">No test cases yet. Create one, then add AutoSims to it.</div>'; return }
    if (!rows.length) { $('aspTcList').innerHTML = '<div class="empty">No test cases match these filters.</div>'; return }
    var pages = Math.max(1, Math.ceil(rows.length / 20)); tcState.page = Math.min(tcState.page, pages)
    var opts = function (sel) { return '<option value="">Ungrouped</option>' + cur.groups.map(function (g) { return '<option value="' + esc(g.id) + '"' + (g.id === sel ? ' selected' : '') + '>' + esc(g.name) + '</option>' }).join('') }
    $('aspTcList').innerHTML = '<div class="table-wrap"><table><thead><tr><th>Test case</th><th>Start URL</th><th>Group</th><th>Login</th><th>Status</th><th>AutoSims</th><th>Updated</th><th></th></tr></thead><tbody>' +
      rows.slice((tcState.page - 1) * 20, tcState.page * 20).map(function (t) {
        var c = credOf(t)
        // Created from an uploaded requirements document (Upload & Extract) → AI badge.
        var ai = t.requirementId ? ' <span class="asp-ai" title="Created by AI from an uploaded requirements document">' + ui('spark', 11) + 'AI</span>' : ''
        return '<tr><td><div class="asp-tcname">' + navLink({ asp: cur.project.id, tc: t.id }, t.name) + ai + '</div></td>' +
          '<td class="muted"><div class="asp-url"' + (t.startUrl ? ' title="' + esc(t.startUrl) + '"' : '') + '>' + (t.startUrl ? esc(t.startUrl.replace(/^https?:\/\//, '')) : '<span style="color:var(--amber)">Not set</span>') + '</div></td>' +
          '<td><select data-move="' + esc(t.id) + '" aria-label="Move ' + esc(t.name) + ' to group">' + opts(t.groupId) + '</select></td>' +
          '<td>' + (c ? '<span class="asp-pill green">' + esc(c.name) + '</span>' : '<span class="muted">None</span>') + '</td>' +
          '<td><span class="asp-pill ' + esc(t.status) + '">' + esc(t.status) + '</span></td><td>' + t.trailCount + '</td><td class="muted asp-nowrap">' + esc(fmtDate(t.updatedAt)) + '</td>' +
          '<td><div class="asp-tc-acts">' +
          '<button type="button" class="asp-ibtn" data-tedit="' + esc(t.id) + '" title="Edit" aria-label="Edit ' + esc(t.name) + '">' + ui('pencil', 15) + '</button>' +
          '<button type="button" class="asp-ibtn danger" data-tdel="' + esc(t.id) + '" title="Delete" aria-label="Delete ' + esc(t.name) + '">' + ui('trash', 15) + '</button>' +
          '</div></td></tr>'
      }).join('') + '</tbody></table></div>' + pager(tcState.page, pages, rows.length, 't')
    var tcOf = function (id) { return cur.testCases.find(function (t) { return t.id === id }) }
    $('aspTcList').querySelectorAll('[data-move]').forEach(function (s) {
      s.onchange = async function () {
        s.disabled = true
        try { await moveTestCase(tcOf(s.dataset.move), s.value); await refreshTab('test-cases') } catch (e) { toast(e.message, true); s.disabled = false }
      }
    })
    $('aspTcList').querySelectorAll('[data-tedit]').forEach(function (b) { b.onclick = function () { testCaseForm(tcOf(b.dataset.tedit)) } })
    $('aspTcList').querySelectorAll('[data-tdel]').forEach(function (b) { b.onclick = function () { deleteTestCaseConfirm(tcOf(b.dataset.tdel), function () { refreshTab('test-cases') }) } })
    bindPager('t', function (n) { tcState.page = n; drawTcRows() })
  }

  // ── Test case detail ──────────────────────────────────────────────────────────
  // One AutoSim per test case: recorded ONCE (AI drives the steps and saves a script), then every Run
  // replays that saved script without AI. If the app changed and runs fail, Re-record replaces it.
  var RESULT = {
    green: ['Passed', 'green'], amber: ['Passed with fixes', 'draft'], red: ['Failed', 'red'],
    running: ['Running', 'draft'], paused: ['Waiting for input', 'draft'], needs_auth: ['Needs login', 'red'], skip: ['Skipped', ''],
  }
  // KD-3107: who/what started the run — readable label + tooltip instead of the raw enum.
  var TRIGGER = {
    manual: ['You', 'Started from the dashboard'],
    scheduled: ['Schedule', 'Started automatically by this AutoSim’s schedule'],
    ci: ['CI pipeline', 'Started automatically by your CI pipeline'],
    api: ['API', 'Started through the Klavity API'],
  }
  function triggerCell(t) {
    var v = TRIGGER[t] || [t || '–', '']
    return '<td class="muted"' + (v[1] ? ' title="' + esc(v[1]) + '"' : '') + '>' + esc(v[0]) + '</td>'
  }
  function fmtDur(ms) { if (ms == null) return '…'; var s = Math.round(ms / 1000); return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's' }
  function fmtWhen(ms) { try { return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch (e) { return '' } }
  var pollTimer = null
  var openRuns = {}   // runId → true while its step list is expanded (kept across live refreshes)
  var STEP_RESULT = { green: ['Passed', 'green'], amber: ['Fixed', 'draft'], red: ['Failed', 'red'], skip: ['Skipped', ''] }
  function credRef(v) {   // {{cred:karthik:password}} → "karthik's password" (references only, never secrets)
    return String(v || '').replace(/\{\{cred:([^:}]+):([^}]+)\}\}/g, function (_, n, f) { return '[' + n + "'s " + f + ']' })
  }
  function stepText(st) {
    var t = st.target ? '"' + st.target + '"' : 'the element', v = credRef(st.value)
    switch (st.action) {
      case 'navigate': return 'Open ' + v
      case 'click': return 'Click ' + t
      case 'type': return 'Type ' + (v ? '"' + v + '"' : '') + ' into ' + t
      case 'select': return 'Select "' + v + '" in ' + t
      case 'assert': return 'Check: ' + (st.checkpoint || v || t)
      case 'wait': return 'Wait ' + (v ? v + ' ms' : '')
      case 'waitForSelector': return 'Wait for ' + t
      case 'hover': return 'Hover ' + t
      case 'keyPress': return 'Press ' + v
      case 'clearField': return 'Clear ' + t
      case 'upload': return 'Upload ' + v + ' to ' + t
      case 'pauseForSecret': return 'Ask for ' + (v || 'a code')
      case 'callModule': return 'Run module ' + v
      default: return st.action + (v ? ' ' + v : '')
    }
  }
  async function drawRunSteps(tcBase, run) {
    var el = $('aspSteps_' + run.runId); if (!el) return
    var d
    try { d = await api('GET', tcBase + '/runs/' + encodeURIComponent(run.runId) + '/steps') } catch (e) { el.innerHTML = '<span class="muted">' + esc(e.message) + '</span>'; return }
    var done = run.status !== 'running' && run.status !== 'paused'
    el.innerHTML = d.steps.length ? '<ol class="asp-steps">' + d.steps.map(function (st) {
      var r = st.verdict ? (STEP_RESULT[st.verdict] || [st.verdict, '']) : (done ? ['Not reached', ''] : ['Pending', ''])
      if (st.verdict === 'green' && st.healed) r = ['Fixed', 'draft']
      return '<li><span class="asp-pill ' + r[1] + '">' + esc(r[0]) + '</span> <span>' + esc(stepText(st)) + '</span>' +
        (st.verdict === 'red' && st.diagnosis ? ' <span class="muted">(' + esc(String(st.diagnosis).replace(/_/g, ' ')) + ')</span>' : '') + '</li>'
    }).join('') + '</ol>' : '<span class="muted">This AutoSim has no recorded steps.</span>'
  }

  async function renderTestCase(apId, tcId) {
    clearTimeout(pollTimer)
    await loadProject(apId)
    var tc = cur.testCases.find(function (t) { return t.id === tcId })
    if (!tc) { var e = new Error('This test case no longer exists.'); e.status = 404; throw e }
    var p = cur.project, P = encodeURIComponent(cur.projectId)
    crumbs([navLink({ asp: 'list' }, 'Projects'), navLink({ asp: p.id }, p.name), navLink({ asp: p.id, tab: 'test-cases' }, 'Test Cases'), '<span>' + esc(tc.name) + '</span>'], { to: { asp: p.id, tab: 'test-cases' }, label: 'Back to Test Cases' })
    var auto = cur.trails.filter(function (t) { return t.testCaseId === tc.id })[0] || null
    var cred = credOf(tc)
    var tcBase = '/api/autosim-projects/' + encodeURIComponent(p.id) + '/test-cases/' + encodeURIComponent(tc.id)

    var autoHtml = auto
      ? '<div class="asp-card" style="margin-bottom:18px"><div class="head" style="margin-bottom:10px"><div>' +
        '<div class="muted" style="font:10px var(--mono);text-transform:uppercase;letter-spacing:.06em">AutoSim</div>' +
        '<h2 style="font:500 20px var(--display);margin-top:2px">' + esc(auto.name) + ' <span class="asp-pill ' + esc(auto.status) + '">' + esc(auto.status) + '</span></h2></div>' +
        '<div class="actions"><button class="btn btn-indigo" id="aspRun">Run</button>' +
        (auto.status === 'draft' ? '<button class="btn btn-ghost" id="aspActivate" title="Active AutoSims can run on a schedule and file findings">Activate</button>' : '') +
        '<button class="btn btn-ghost" id="aspRerecord">Re-record</button>' +
        '<a class="btn btn-ghost" href="' + esc(tcBase + '/script?project=' + P) + '" download title="Playwright script; also importable on another Klavity server">Export script</a>' +
        '<button class="btn btn-ghost btn-danger" id="aspUnlink">Remove</button></div></div>' +
        '<p class="muted">Run replays the recorded script exactly, without AI. If your app changed and runs start failing, update the execution steps if needed, then Re-record to generate a new script. Past results are kept.</p>' +
        (auto.status === 'draft' ? '<p class="muted" style="margin-top:6px">This AutoSim is a draft: you can run it now; activate it to run it on a schedule and file findings.</p>' : '') +
        (auto.status === 'paused' ? '<p class="muted" style="margin-top:6px;color:var(--amber)">This AutoSim is paused in AutoSims. Resume it there to run it.</p>' : '') +
        '</div>'
      : '<div class="asp-card" style="margin-bottom:18px"><div class="head" style="margin-bottom:8px"><div>' +
        '<h2 style="font:500 20px var(--display)">No AutoSim yet</h2>' +
        '<p class="muted" style="margin-top:4px">Create AutoSim records these steps once and saves them as a script. After that, every run replays the script without AI.</p></div>' +
        '<div class="actions"><button class="btn btn-ghost" id="aspImport" title="Use a script exported from Klavity (this or another server)">Import script</button><button class="btn btn-indigo" id="aspTcCreate">+ Create AutoSim</button></div></div></div>'

    $('aspMain').innerHTML =
      '<div class="head"><div><h1>' + esc(tc.name) + (tc.requirementId ? ' <span class="asp-ai" style="vertical-align:middle" title="Created by AI from an uploaded requirements document">' + ui('spark', 11) + 'AI</span>' : '') + '</h1></div>' +
      '<div class="actions"><button class="btn btn-ghost" id="aspTcEdit">Edit</button><button class="btn btn-ghost btn-danger" id="aspTcDel">Delete</button></div></div>' +
      '<div class="asp-card" style="margin-bottom:18px"><dl class="kv">' +
      '<dt>Start URL</dt><dd>' + (tc.startUrl ? '<a href="' + esc(tc.startUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--indigo)">' + esc(tc.startUrl) + '</a>' : '<span style="color:var(--amber)">Not set. Edit the test case to add where it starts.</span>') + '</dd>' +
      (tc.preconditions ? '<dt>Preconditions</dt><dd><div class="steps">' + esc(tc.preconditions) + '</div></dd>' : '') +
      '<dt>Execution steps</dt><dd>' + (tc.description ? '<div class="steps">' + esc(tc.description) + '</div>' : '<span class="muted">None yet. Edit the test case to describe what the AutoSim should do.</span>') + '</dd>' +
      '<dt>Expected result</dt><dd>' + (tc.expectedResult ? '<div class="steps">' + esc(tc.expectedResult) + '</div>' : '<span class="muted">Not set. Add one so runs are validated against it.</span>') + '</dd>' +
      (tc.requirementId ? '<dt>Requirement</dt><dd id="aspTcReq"><span class="muted">Loading…</span></dd>' : '') +
      '<dt>Execution</dt><dd>' + (cred
        ? 'With credentials: <b>' + esc(cred.name) + '</b> <span class="muted">(' + esc(cred.loginEmail) + ')</span>'
        : (tc.testAccountId ? '<span style="color:var(--rose)">Its credentials are no longer available.</span> ' : 'Without credentials <span class="muted">(no login step)</span>')) + '</dd>' +
      '<dt>Group</dt><dd><select id="aspTcGroup" aria-label="Group"><option value="">Ungrouped</option>' + cur.groups.map(function (g) { return '<option value="' + esc(g.id) + '"' + (g.id === tc.groupId ? ' selected' : '') + '>' + esc(g.name) + '</option>' }).join('') + '</select></dd>' +
      '<dt>Status</dt><dd><span class="asp-pill ' + esc(tc.status) + '">' + esc(tc.status) + '</span></dd>' +
      '<dt>Last updated</dt><dd>' + esc(fmtDate(tc.updatedAt)) + '</dd></dl></div>' +
      autoHtml +
      '<div id="aspVal"></div>' +
      '<h2 style="font:500 20px var(--display);margin-bottom:10px">Execution results</h2><div id="aspRuns"><div class="loading">Loading results…</div></div>'

    $('aspTcEdit').onclick = function () { testCaseForm(tc) }
    $('aspTcDel').onclick = function () { deleteTestCaseConfirm(tc, function () { go({ asp: p.id, tab: 'test-cases' }) }) }
    $('aspTcGroup').onchange = async function () {
      var s = this; s.disabled = true
      try { await moveTestCase(tc, s.value); await renderTestCase(apId, tcId) } catch (e) { toast(e.message, true); s.disabled = false }
    }

    // F-01: the requirement this test case verifies + its validation history (actual vs expected).
    var tcReq = null
    api('GET', tcBase + '/validation').then(function (d) {
      tcReq = d.requirement
      if ($('aspTcReq')) $('aspTcReq').innerHTML = tcReq ? '<b>' + esc(tcReq.ref) + '</b> ' + esc(tcReq.title) + ' <span class="muted">· ' + esc(tcReq.docFilename) + (tcReq.section ? ' · ' + esc(tcReq.section) : '') + '</span>' : '<span class="muted">The requirements document was removed.</span>'
      if ($('aspVal') && d.validations.length) $('aspVal').innerHTML = '<h2 style="font:500 20px var(--display);margin-bottom:10px">Requirement validation</h2><div class="asp-card" style="margin-bottom:18px;padding:6px 18px">' + d.validations.map(valRow).join('') + '</div>'
    }).catch(function () { if ($('aspTcReq')) $('aspTcReq').innerHTML = '<span class="muted">Could not load.</span>' })

    // Record (first time) / re-record (replace) from this test case's own details — no wizard.
    async function record(btn, replace) {
      if (!tc.startUrl) { toast('Add a Start URL to this test case first.', true); testCaseForm(tc); return }
      if ((tc.description || '').trim().length < 10) { toast('Describe the execution steps (at least 10 characters) first.', true); testCaseForm(tc); return }
      if (tc.testAccountId && !cred) { toast('This test case\'s credentials no longer exist. Pick another login first.', true); testCaseForm(tc); return }
      if (typeof window.klavStartAutosimForTestCase !== 'function') { toast('AutoSims is still loading. Try again in a moment.', true); return }
      var label = btn.textContent; btn.disabled = true; btn.textContent = 'Starting…'
      try { await window.klavStartAutosimForTestCase({ id: tc.id, name: tc.name, url: tc.startUrl, objective: objectiveFor(tc, tcReq), cred: cred ? cred.name : '-', replace: replace }) }
      catch (e) { toast(e.message, true) }
      finally { btn.disabled = false; btn.textContent = label }
    }
    if ($('aspTcCreate')) $('aspTcCreate').onclick = function () { record(this, false) }

    // Import a script exported by Export script (this or another Klavity server). Only offered while the
    // test case has no AutoSim; to replace an existing one, Remove it first.
    if ($('aspImport')) $('aspImport').onclick = function () {
      var btn = this, input = document.createElement('input')
      input.type = 'file'; input.accept = '.ts,.js,text/plain'
      input.onchange = async function () {
        var f = input.files && input.files[0]; if (!f) return
        btn.disabled = true; btn.textContent = 'Importing…'
        try { await api('POST', tcBase + '/script', { script: await f.text() }); toast('Script imported'); renderTestCase(apId, tcId) }
        catch (e) { toast(e.message, true); btn.disabled = false; btn.textContent = 'Import script' }
      }
      input.click()
    }

    if (auto) {
      $('aspRun').onclick = async function () {
        var b = this; b.disabled = true; b.textContent = 'Starting…'
        try { await api('POST', '/api/trails/' + encodeURIComponent(auto.id) + '/walk'); toast('Run started') ; await drawRuns(tc, tcBase) }
        catch (e) { toast(e.status === 409 ? (e.message.indexOf('paused') >= 0 ? e.message : 'Another AutoSim run is in progress. Try again when it finishes.') : e.message, true) }
        finally { b.disabled = false; b.textContent = 'Run' }
      }
      $('aspRerecord').onclick = function () {
        var b = this
        confirmDanger('Re-record "' + tc.name + '"?',
          'The AI walks the current execution steps again and saves a new script. The current AutoSim is replaced only if the new recording succeeds. Past results are kept.',
          'Re-record', function () { return record(b, true) })
      }
      if ($('aspActivate')) $('aspActivate').onclick = async function () {
        this.disabled = true
        try { await api('POST', '/api/trails/' + encodeURIComponent(auto.id) + '/approve'); toast('AutoSim activated'); renderTestCase(apId, tcId) }
        catch (e) { toast(e.message, true); this.disabled = false }
      }
      $('aspUnlink').onclick = function () {
        confirmDanger('Remove "' + auto.name + '" from this test case?', 'The AutoSim itself is not deleted. It stays in AutoSims, and this test case can record a new one.', 'Remove',
          async function () { await api('DELETE', tcBase + '/trails/' + encodeURIComponent(auto.id)); toast('AutoSim removed from test case'); renderTestCase(apId, tcId) })
      }
    }
    drawRuns(tc, tcBase)
  }

  // Execution results: summary strip + one row per run. Polls while a run is in progress.
  // "12/12 executed" + "9 passed · 3 fixed · 3 failed · 1 needs review · 1 not run" (parts with 0 are left out).
  function runStepsSummary(r) {
    var executed = r.executed != null ? r.executed : (r.passed + r.healed + (r.review || 0) + r.failed)
    var notRun = r.notRun != null ? r.notRun : Math.max(0, r.steps - executed)
    var parts = []
    if (r.passed) parts.push(r.passed + ' passed')
    if (r.healed) parts.push(r.healed + ' fixed')
    if (r.failed) parts.push('<span style="color:var(--rose)">' + r.failed + ' failed</span>')
    if (r.review) parts.push(r.review + ' needs review')
    if (notRun) parts.push('<span class="muted">' + notRun + ' not run</span>')
    var tip = 'Executed ' + executed + ' of ' + r.steps + ' steps. Fixed = ran and passed after Klavity repaired a changed selector (counts as executed).'
    return '<span title="' + esc(tip) + '"><b>' + executed + '/' + r.steps + ' executed</b>' + (parts.length ? '<div class="muted" style="font-size:12px">' + parts.join(' · ') + '</div>' : '') + '</span>'
  }
  async function drawRuns(tc, tcBase) {
    clearTimeout(pollTimer)
    var self = function () { return drawRuns(tc, tcBase) }
    var box = $('aspRuns'); if (!box) return
    var runs
    try { runs = (await api('GET', tcBase + '/runs')).runs } catch (e) { box.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; return }
    if (!$('aspRuns') || box !== $('aspRuns')) return   // navigated away meanwhile
    if (!runs.length) { box.innerHTML = '<div class="empty">No runs yet. Results of every run appear here.</div>'; return }
    runs.forEach(function (r) { if ((r.status === 'running' || r.status === 'paused') && openRuns[r.runId] === undefined) openRuns[r.runId] = true })
    var done = runs.filter(function (r) { return r.status === 'green' || r.status === 'amber' || r.status === 'red' })
    var passed = done.filter(function (r) { return r.status !== 'red' }).length
    var last = runs[0]
    var P = encodeURIComponent(cur.projectId)
    box.innerHTML =
      '<div class="asp-card" style="margin-bottom:12px"><div class="stats" style="margin:0">' +
      stat(runs.length, 'Runs') + stat(passed, 'Passed') + stat(done.length - passed, 'Failed') +
      stat(done.length ? Math.round(passed * 100 / done.length) + '%' : '–', 'Pass rate') +
      stat((RESULT[last.status] || [last.status])[0], 'Last result') + '</div></div>' +
      '<div class="table-wrap"><table><thead><tr><th>When</th><th>Result</th><th>Steps</th><th>Duration</th><th>Mode</th><th title="How the run started: by you, its schedule, your CI pipeline or the API">Started by</th><th></th></tr></thead><tbody>' +
      runs.map(function (r) {
        var res = RESULT[r.status] || [r.status, '']
        // Agreed formula: executed / total steps. Every executed step is in exactly one bucket — passed, fixed
        // (self-healed, then passed), needs review, failed — so the breakdown always adds up to "executed".
        var steps = r.steps ? runStepsSummary(r) : '<span class="muted">–</span>'
        var mode = r.aiCalls === 0 ? 'Script replay' : 'Replay + AI fixes (' + r.aiCalls + ')'
        return '<tr><td>' + esc(fmtWhen(r.startedAt)) + (r.current ? '' : '<div class="muted">previous recording</div>') + '</td>' +
          '<td><span class="asp-pill ' + res[1] + '">' + esc(res[0]) + '</span>' + (r.findings ? '<div class="muted">' + plural(r.findings, 'finding') + '</div>' : '') + '</td>' +
          '<td>' + steps + '</td><td>' + esc(fmtDur(r.durationMs)) + '</td><td class="muted">' + esc(mode) + '</td>' + triggerCell(r.trigger) +
          '<td><div class="actions"><button class="btn btn-ghost btn-sm" data-steps="' + esc(r.runId) + '" aria-expanded="' + !!openRuns[r.runId] + '">' + (openRuns[r.runId] ? 'Hide steps' : 'Steps') + '</button>' +
          // from= lets the report page offer "Back to test case" (it only accepts a /dashboard path).
          '<a class="btn btn-ghost btn-sm" href="/autosims/walk/' + esc(encodeURIComponent(r.runId)) + '?project=' + P + '&from=' + encodeURIComponent(urlFor({ asp: cur.project.id, tc: tc.id })) + '">Report</a>' +
          (r.durationMs != null ? '<a class="btn btn-ghost btn-sm" href="/api/trails/walks/' + esc(encodeURIComponent(r.runId)) + '/report.pdf?project=' + P + '" target="_blank" rel="noopener">PDF</a>' : '') +
          '</div></td></tr>' +
          (openRuns[r.runId] ? '<tr class="asp-steps-row"><td colspan="7"><div id="aspSteps_' + esc(r.runId) + '" class="muted">Loading steps…</div></td></tr>' : '')
      }).join('') + '</tbody></table></div>'
    box.querySelectorAll('[data-steps]').forEach(function (b) {
      b.onclick = function () { var id = b.getAttribute('data-steps'); openRuns[id] = !openRuns[id]; self() }
    })
    runs.forEach(function (r) { if (openRuns[r.runId]) drawRunSteps(tcBase, r) })
    if (runs.some(function (r) { return r.status === 'running' || r.status === 'paused' })) {
      pollTimer = setTimeout(function () { if ($('aspRuns') === box) drawRuns(tc, tcBase) }, 3000)
    }
  }

  // ── Requirement validation helpers (F-01) ─────────────────────────────────────
  // Extracted test cases keep their requirement link + validation history (actual vs expected, evidence),
  // shown on the test case page. There is no separate Requirements tab: everything lives under Test Cases.
  var VAL = {
    passed: ['Passed', 'green'], failed: ['Failed', 'red'], blocked: ['Blocked', 'paused'], error: ['Error', 'paused'],
    partial: ['Partly passed', 'paused'], not_run: ['Not run', ''], no_tests: ['No test cases', ''],
    queued: ['Queued', ''], running: ['Running…', 'draft'], cancelled: ['Cancelled', ''],
  }
  function valPill(st) { var v = VAL[st] || [st, '']; return '<span class="asp-pill ' + v[1] + '">' + esc(v[0]) + '</span>' }
  function withProj(url) { var p = pid(); return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'project=' + encodeURIComponent(p) }
  function fmtWhenShort(ms) { try { return ms ? new Date(Number(ms)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '' } catch (e) { return '' } }
  // Evidence links stored on a validation (screenshots, verification report, PDF).
  function evidenceLinks(ev) {
    if (!ev) return ''
    var out = []
    ;(ev.screenshots || []).forEach(function (s, i) { out.push('<a href="' + esc(withProj(s.url)) + '" target="_blank" rel="noopener">Screenshot ' + (i + 1) + '</a>') })
    if (ev.reportUrl) out.push('<a href="' + esc(withProj(ev.reportUrl)) + '" target="_blank" rel="noopener">Run report</a>')
    if (ev.pdfUrl) out.push('<a href="' + esc(withProj(ev.pdfUrl)) + '" target="_blank" rel="noopener">PDF</a>')
    return out.length ? '<div class="asp-ev">Evidence: ' + out.join(' · ') + '</div>' : ''
  }
  // One validation result (a requirement-run item).
  function valRow(v) {
    return '<div class="asp-val">' + valPill(v.status) +
      ' <span class="muted">' + esc(fmtWhenShort(v.finishedAt || v.startedAt)) + (v.mode ? ' · ' + (v.mode === 'record' ? 'recorded' : 'replayed') : '') + '</span>' +
      (v.expectedResult ? '<div><b>Expected:</b> ' + esc(v.expectedResult) + '</div>' : '') +
      (v.observed ? '<div><b>Observed:</b> ' + esc(v.observed) + '</div>' : '') +
      (v.reason ? '<div class="muted">' + esc(v.reason) + '</div>' : '') + evidenceLinks(v.evidence) + '</div>'
  }
  // Objective handed to the AutoSim when recording (mirrors lib/requirement-runs.ts buildObjective).
  function objectiveFor(tc, req) {
    var parts = [String(tc.description || '').trim()]
    if ((tc.preconditions || '').trim()) parts.push('Preconditions (make sure these hold before you start): ' + tc.preconditions.trim())
    if ((tc.expectedResult || '').trim()) parts.push('Expected result (before finishing, confirm this is actually shown/true in the application): ' + tc.expectedResult.trim())
    if (req) parts.push('This checks requirement ' + req.ref + ': ' + req.title)
    return parts.filter(Boolean).join('\n\n')
  }
  function reqBase() { return '/api/autosim-projects/' + encodeURIComponent(cur.project.id) }

  // Project "Common setup steps" (e.g. PX4: log in → security code → choose company → wait for dashboard) go in
  // FRONT of a test case's own steps, renumbered as one list. Idempotent: never added twice.
  function stepLines(s) { return String(s || '').split(/\r?\n/).map(function (l) { return l.trim().replace(/^\d+\s*[.)]\s*/, '') }).filter(Boolean) }
  function hasSetupSteps(setup, steps) {
    var a = stepLines(setup), b = stepLines(steps)
    if (!a.length || b.length < a.length) return false
    var norm = function (l) { return l.toLowerCase().replace(/\s+/g, ' ') }
    return a.every(function (l, i) { return norm(l) === norm(b[i]) })
  }
  function withSetupSteps(setup, steps) {
    if (!stepLines(setup).length || hasSetupSteps(setup, steps)) return String(steps || '').trim()
    return stepLines(setup).concat(stepLines(steps)).map(function (l, i) { return (i + 1) + '. ' + l }).join('\n')
  }


  // ── Upload & Extract ──────────────────────────────────────────────────────────
  // Test Cases tab → "Upload & Extract": upload a requirements document → the server extracts test
  // scenarios (POST …/extract, saves nothing) → review/select them → "Run Tests" opens "Complete details"
  // where each scenario is shown PRE-FILLED (name, execution steps, start URL) and the user fills only what
  // the document lacked (start URL, credentials, group) → the test cases are created via the normal API.
  // Like New AutoSim, the dialog never closes on a backdrop click — only via ✕ / Cancel (with a warning
  // once extracted work would be lost).
  var UX_MAX = 25 * 1024 * 1024
  var UX_EXT = /\.(pdf|docx|txt|md)$/i
  var ux = null
  function uxOpen() {
    ensureUx()
    ux = { step: 'upload', file: null, result: null, err: '', selected: {}, open: {}, edits: {}, shared: null, progress: 0 }
    $('aspUxBg').classList.add('show')
    uxDraw()
  }
  function ensureUx() {
    if ($('aspUxBg')) return
    var bg = document.createElement('div')
    bg.className = 'modal-bg'; bg.id = 'aspUxBg'
    bg.innerHTML = '<div class="modal asp-ux" role="dialog" aria-modal="true" aria-labelledby="aspUxTitle"><div id="aspUxBody"></div></div>'
    document.body.appendChild(bg)
    var body = $('aspUxBody')
    body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ux]'); if (!t || t.disabled) return
      uxAction(t.getAttribute('data-ux'), t)
    })
    body.addEventListener('change', function (e) {
      var t = e.target
      if (t.id === 'uxFile') { uxPick(t.files && t.files[0]); return }
      if (t.hasAttribute('data-ux-sel')) { ux.selected[t.getAttribute('data-ux-sel')] = t.checked; uxSyncSel(); return }
      if (t.id === 'uxAllReady') {
        uxScenarios().forEach(function (s) { ux.selected[s.id] = t.checked })
        body.querySelectorAll('[data-ux-sel]').forEach(function (cb) { cb.checked = !!ux.selected[cb.getAttribute('data-ux-sel')] })
        uxSyncSel(); return
      }
      if (t.name === 'uxExec' || t.name === 'uxApp' || t.id === 'uxCred' || t.id === 'uxGroup' || t.id === 'uxStatus') uxReadShared()
      if (t.name === 'uxExec' || t.name === 'uxApp') uxDraw()
    })
    body.addEventListener('input', function (e) {
      var t = e.target, id = t.getAttribute('data-ux-id')
      if (id) {
        ux.edits[id] = ux.edits[id] || {}; ux.edits[id][t.getAttribute('data-ux-f')] = t.value
        uxSyncRow(id)
      }
      else if (t.id === 'uxUrl') uxReadShared()
    })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bg.classList.contains('show')) uxRequestClose() })
  }
  async function uxRequestClose() {
    if (!ux || ux.step === 'creating') return   // creation finishes on its own in a few seconds
    // Extracted but not created yet → those test cases would be lost, so confirm first.
    if (ux.result && ['review', 'generated', 'scenarios', 'details'].indexOf(ux.step) >= 0) {
      var mine = ux
      return confirmDanger('Discard the extracted test cases?', 'None of the ' + plural(uxScenarios().length, 'extracted test case') + ' have been added yet. Closing now discards them, and you would need to upload the document again.', 'Discard',
        function () { if (ux === mine) uxClose() }, 'Keep editing')
    }
    uxClose()
  }
  function uxClose() {
    if (ux) { if (ux.ctrl) try { ux.ctrl.abort() } catch (e) { } clearInterval(ux.timer); if (ux.srcUrl) URL.revokeObjectURL(ux.srcUrl) }
    var touched = ux && ux.created && ux.created.length
    ux = null
    var bg = $('aspUxBg'); if (bg) bg.classList.remove('show')
    if (!touched || !cur) return
    // The new test cases (and their run results) are listed under Test Cases.
    if (currentTab() === 'test-cases') refreshTab('test-cases'); else go({ asp: cur.project.id, tab: 'test-cases' })
  }
  function currentTab() { var t = document.querySelector('#aspMain .asp-tab[aria-selected="true"]'); return t ? t.dataset.tab : 'test-cases' }
  // Selection changed on "Review Test Scenarios": update the Run button + "Run N ready" box in place
  // (a full redraw would jump the scenario list back to the top).
  function uxSyncSel() {
    var n = uxSel().length, run = document.querySelector('#aspUxBody [data-ux="run"]'), all = $('uxAllReady')
    if (run) { run.disabled = !n; run.textContent = n ? uxAddLabel(n) : 'Select test cases' }
    var total = uxScenarios().length
    if (all) { all.checked = total > 0 && n === total; all.indeterminate = n > 0 && n < total }
  }
  // Editing a test case on the review step: update its title + "Needs Info" pill in place (no redraw,
  // so the textarea keeps focus and the list keeps its scroll position).
  function uxSyncRow(id) {
    var s = uxScenarios().filter(function (x) { return x.id === id })[0]; if (!s) return
    var row = document.querySelector('#aspUxBody [data-ux-row="' + id + '"]'); if (!row) return
    var rt = row.querySelector('.ux-rt'); if (rt) rt.textContent = uxVal(s, 'title')
    var pill = row.querySelector('.ux-pill'); if (pill) pill.outerHTML = uxPill(s)
    var miss = row.querySelector('.ux-miss'), m = uxMissing(s)
    if (miss) { miss.style.display = m.length ? '' : 'none'; var sp = miss.querySelector('span'); if (sp) sp.textContent = 'Still missing: ' + m.join(', ') + '. Add it to the steps or the expected result below.' }
    var allLbl = $('uxAllCount'); if (allLbl) allLbl.textContent = uxAllLabel()
  }
  // PX4 apps need the same first steps in every test case (log in, security code, choose the company,
  // wait for the dashboard). Added only when the user says the application is PX4.
  var PX4_SETUP = '1. Log in to the application with the attached credentials\n2. Security code: 147852\n3. Choose "PX4 Softwaress" company\n4. Wait until the dashboard page is visible.'
  // What the document left out that the Start URL step already asks for (start URL, login/credentials,
  // PX4 security code/company) is NOT "needs info" — only what the user must still write in.
  var UX_COVERED = /(url|link|web ?address|website|credential|log ?in|sign ?in|user ?name|email|password|account|security code|otp|one[- ]time|company|environment)/i
  function uxMissing(s) {
    var m = (s.missing || []).filter(function (x) { return !UX_COVERED.test(x) && !/expected/i.test(x) })
    var e = ux.edits[s.id]
    if (e && ('steps' in e || 'pre' in e)) m = []   // the user rewrote the steps/preconditions: trust them
    if (!uxVal(s, 'exp').trim()) m.push('expected result')
    return m
  }
  function uxReady(s) { return !uxMissing(s).length }
  function uxPill(s) {
    var m = uxMissing(s)
    return m.length ? '<span class="ux-pill warn" title="Missing: ' + esc(m.join(', ')) + '">Needs Info</span>' : '<span class="ux-pill ok">Ready</span>'
  }
  function uxAllLabel() {
    var sc = uxScenarios(), need = sc.filter(function (s) { return !uxReady(s) }).length
    return 'Select all ' + plural(sc.length, 'test case') + (need ? ' (' + need + ' need info: open one to fill it in)' : '')
  }
  // Button label for adding the selected test cases: 'Add 22 Test Cases' / 'Add 1 Test Case'.
  function uxAddLabel(n) { return 'Add ' + n + ' Test Case' + (n === 1 ? '' : 's') }
  function uxScenarios() { return (ux.result && ux.result.scenarios) || [] }
  function uxSel() { return uxScenarios().filter(function (s) { return ux.selected[s.id] }) }
  function uxVal(s, f) {
    var e = ux.edits[s.id]
    if (e && f in e) return e[f]
    return ({ title: s.title, steps: s.steps, pre: s.preconditions || '', exp: s.expectedResult || '', url: s.startUrl || '' })[f] || ''
  }
  function uxPick(f) {
    ux.err = ''
    if (!f) return uxDraw()
    if (!UX_EXT.test(f.name)) ux.err = 'Upload a PDF, DOCX or TXT file.'
    else if (f.size > UX_MAX) ux.err = 'The file is larger than 25 MB.'
    else if (!f.size) ux.err = 'The file is empty.'
    else ux.file = f
    uxDraw()
  }
  function uxReadShared() {
    var exec = document.querySelector('input[name="uxExec"]:checked'), app = document.querySelector('input[name="uxApp"]:checked')
    ux.shared = {
      app: app ? app.value : (ux.shared && ux.shared.app) || '',   // required: no default
      url: $('uxUrl') ? $('uxUrl').value.trim() : (ux.shared && ux.shared.url) || '',
      exec: exec ? exec.value : 'none',
      cred: $('uxCred') ? $('uxCred').value : '',
      group: $('uxGroup') ? $('uxGroup').value : '',
      status: $('uxStatus') ? $('uxStatus').value : 'active',
      setup: cur.project.setupSteps || PX4_SETUP,   // PX4 steps (not shown to the user)
    }
  }
  async function uxExtract() {
    ux.step = 'extracting'; ux.err = ''; ux.progress = 4; uxDraw()
    // The server answers in one go; ease the bar toward 90% meanwhile so the wait is visible.
    ux.timer = setInterval(function () {
      if (!ux || ux.step !== 'extracting') return
      ux.progress = Math.min(90, ux.progress + (90 - ux.progress) * 0.05 + 0.3)
      var bar = $('uxBar'), pct = $('uxPct'); if (bar) bar.style.width = ux.progress + '%'; if (pct) pct.textContent = Math.round(ux.progress) + '%'
    }, 400)
    var mine = ux, fd = new FormData()
    fd.append('file', ux.file, ux.file.name)
    ux.ctrl = new AbortController()
    try {
      var p = pid()
      var r = await fetch('/api/autosim-projects/' + encodeURIComponent(cur.project.id) + '/extract' + (p ? '?project=' + encodeURIComponent(p) : ''),
        { method: 'POST', body: fd, credentials: 'include', signal: ux.ctrl.signal })
      var d = await r.json().catch(function () { return {} })
      if (ux !== mine) return
      if (r.status === 401) { location.href = '/login'; return }
      if (!r.ok) throw new Error(d.error || ('Extraction failed (' + r.status + ')'))
      clearInterval(ux.timer); ux.progress = 100; uxDraw()
      ux.result = d
      ux.selected = {}
      d.scenarios.forEach(function (s) { ux.selected[s.id] = true })   // all extracted test cases are created by default
      setTimeout(function () { if (ux === mine) { ux.step = 'review'; uxDraw() } }, 350)
    } catch (e) {
      if (ux !== mine || e.name === 'AbortError') return
      clearInterval(ux.timer); ux.step = 'uploaded'; ux.err = e.message; uxDraw()
    }
  }
  async function uxCreate() {
    uxReadShared()
    var sh = ux.shared, sel = uxSel(), urlRe = /^https?:\/\/\S+$/
    if (sh.url && !urlRe.test(sh.url)) { ux.err = 'Start URL must start with http:// or https://'; return uxDraw() }
    for (var i = 0; i < sel.length; i++) {
      // A problem with one test case opens its row (listed on this step) so it can be fixed in place.
      var s = sel[i], u = uxVal(s, 'url').trim() || sh.url
      if (!uxVal(s, 'title').trim()) { ux.err = s.id + ': add a test case name.'; ux.open[s.id] = true; return uxDraw() }
      if (!u) { ux.err = 'Add a Start URL (or one for ' + s.id + ').'; return uxDraw() }
      if (!urlRe.test(u)) { ux.err = s.id + ': Start URL must start with http:// or https://'; ux.open[s.id] = true; return uxDraw() }
    }
    if (sh.exec === 'creds' && !sh.cred) { ux.err = 'Pick the credentials to use.'; return uxDraw() }
    if (sh.app !== 'px4' && sh.app !== 'other') { ux.err = 'Choose which application this is: PX4 or Other.'; return uxDraw() }
    ux.err = ''; ux.step = 'creating'; ux.created = []; ux.failed = []; uxDraw()
    // PX4 → its setup steps go in front of every test case; any other application → none.
    // Remembered on the project so the next upload pre-selects the same choice.
    var setup = sh.app === 'px4' ? String(sh.setup || '').trim() : ''
    if (setup !== String(cur.project.setupSteps || '').trim()) {
      try { await api('PATCH', reqBase(), { setup_steps: setup }); cur.project.setupSteps = setup } catch (e) { /* steps still prepended below */ }
    }
    var mine = ux, byDb = {}; sel.forEach(function (sc) { byDb[sc.dbId] = sc })
    try {
      // One call: the server creates each test case and links it to its scenario + requirement.
      var out = await api('POST', reqBase() + '/requirement-docs/' + encodeURIComponent(ux.result.docId) + '/test-cases', {
        items: sel.map(function (sc) {
          return { scenario_id: sc.dbId, name: uxVal(sc, 'title').trim().slice(0, 120), start_url: uxVal(sc, 'url').trim() || sh.url,
            steps: withSetupSteps(setup, uxVal(sc, 'steps')).slice(0, 4000), preconditions: uxVal(sc, 'pre').trim().slice(0, 1000), expected_result: uxVal(sc, 'exp').trim().slice(0, 1000) }
        }),
        test_account_id: sh.exec === 'creds' ? sh.cred : null, group_id: sh.group || null, status: sh.status,
      })
      if (ux !== mine) return
      ux.created = out.created.map(function (c) { return Object.assign({ testCaseId: c.testCaseId }, byDb[c.scenarioId]) })
      ux.failed = out.failed.map(function (f) { return { s: byDb[f.scenarioId] || { id: '?', title: '' }, msg: f.error } })
    } catch (e) {
      if (ux !== mine) return
      ux.failed = sel.map(function (sc) { return { s: sc, msg: e.message } })
    }
    if (ux.failed.length) { ux.step = 'done'; return uxDraw() }
    var n = ux.created.length
    uxClose()   // → Test Cases tab, refreshed with the new test cases
    toast(plural(n, 'test case') + ' added to Test Cases')
  }
  function uxAction(a, el) {
    if (a === 'close' || a === 'cancel') return uxRequestClose()
    if (a === 'browse') return $('uxFile').click()
    if (a === 'remove') { ux.file = null; return uxDraw() }
    if (a === 'upload') { ux.step = 'uploaded'; ux.err = ''; return uxDraw() }
    if (a === 'extract') return uxExtract()
    if (a === 'source') { if (!ux.srcUrl) ux.srcUrl = URL.createObjectURL(ux.file); window.open(ux.srcUrl, '_blank', 'noopener'); return }
    if (a === 'toggle') { var id = el.getAttribute('data-id'); ux.open[id] = !ux.open[id]; return uxDraw() }
    if (a === 'run') { ux.step = 'details'; ux.err = ''; return uxDraw() }
    if (a === 'create') return uxCreate()
    if (a === 'finish') return uxClose()
    var NEXT = { generate: 'generated', scenarios: 'scenarios' }
    if (NEXT[a]) { ux.step = NEXT[a]; ux.err = ''; return uxDraw() }
    if (a === 'back') {
      if (ux.step === 'details') uxReadShared()
      ux.step = { uploaded: 'upload', review: 'uploaded', generated: 'review', scenarios: 'generated', details: 'scenarios' }[ux.step] || 'upload'
      ux.err = ''; return uxDraw()
    }
  }

  var UX_ICONS = {
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    cloud: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    flow: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    chevron: '<polyline points="6 9 12 15 18 9"/>',
    back: '<polyline points="15 18 9 12 15 6"/>',
    spark: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  }
  function ui(name, size) {
    return '<svg width="' + (size || 16) + '" height="' + (size || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + UX_ICONS[name] + '</svg>'
  }
  function uxSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB' }
  function uxStepper(active) {   // 1..3 = that step is current; 4 = all three done
    var h = '<div class="ux-stepper">'
    for (var i = 1; i <= 3; i++) {
      h += '<span class="ux-dot' + (i < active ? ' done' : i === active ? ' on' : '') + '">' + (i < active ? ui('check', 13) : i) + '</span>'
      if (i < 3) h += '<span class="ux-line' + (i < active ? ' done' : '') + '"></span>'
    }
    return h + '</div>' + (active <= 3 ? '<div class="ux-steplbl">Step ' + active + ' of 3</div>' : '')
  }
  function uxBtn(act, label, primary, opts) {
    opts = opts || {}
    return '<button type="button" class="btn ' + (primary ? 'btn-indigo' : 'btn-ghost') + '" data-ux="' + act + '"' + (opts.disabled ? ' disabled' : '') + '>' +
      (opts.back ? ui('back', 14) + ' ' : '') + esc(label) + '</button>'
  }
  function uxFileCard(done, source) {
    var f = ux.file
    return '<div class="ux-file"><span class="ux-fic">' + ui('doc', 18) + '</span><div class="ux-fmeta"><b>' + esc(f.name) + '</b><span>' + esc(uxSize(f.size)) + '</span></div>' +
      (source ? '<button type="button" class="ux-link" data-ux="source">View source ' + ui('ext', 12) + '</button>' : '') +
      (done ? '<span class="ux-fok" aria-label="Uploaded">' + ui('check', 12) + '</span>' : '') + '</div>'
  }
  function uxTile(icon, n, label, cls) {
    return '<div class="ux-tile ' + (cls || '') + '"><span class="ux-tic">' + ui(icon, 17) + '</span><div class="ux-tn">' + esc(n) + '</div><div class="ux-tk">' + esc(label) + '</div></div>'
  }
  function uxNote(text) { return '<div class="ux-note">' + ui('info', 15) + '<span>' + text + '</span></div>' }
  function uxErr() { return ux.err ? '<div class="ux-err" role="alert">' + esc(ux.err) + '</div>' : '' }
  function uxFrame(title, inner, left, right) {
    return '<div class="ux-head"><div><div class="ux-eyebrow">Upload &amp; Extract</div><h2 id="aspUxTitle">' + esc(title) + '</h2></div>' +
      '<button type="button" class="ux-x" data-ux="close" aria-label="Close"' + (ux.step === 'creating' ? ' disabled' : '') + '>' + ui('x', 18) + '</button></div>' +
      inner + uxErr() + '<div class="ux-acts"><div>' + (left || '') + '</div><div>' + (right || '') + '</div></div>'
  }

  // One extracted test case: header (name + Needs Info/Ready pill) and, when opened, its edit form.
  // Used on "Review Test Cases" (pickable: with its checkbox) and on "Complete Test Case Details".
  function uxRow(s, pickable) {
    var open = !!ux.open[s.id], m = uxMissing(s), sid = esc(s.id)
    return '<div class="ux-row' + (open ? ' open' : '') + '" data-ux-row="' + sid + '"><div class="ux-rhead">' +
      (pickable ? '<input type="checkbox" data-ux-sel="' + sid + '" aria-label="Select ' + sid + '"' + (ux.selected[s.id] ? ' checked' : '') + '>' : '') +
      '<span class="ux-id">' + sid + '</span><span class="ux-rt">' + esc(uxVal(s, 'title')) + '</span>' + uxPill(s) +
      '<button type="button" class="ux-chev" data-ux="toggle" data-id="' + sid + '" aria-expanded="' + open + '" aria-label="Edit ' + sid + '">' + ui('chevron', 15) + '</button></div>' +
      // Expanded = an edit form: everything the test case will be created with.
      (open ? '<div class="ux-rbody">' +
        (s.requirementRefs.length ? '<div class="muted">Verifies ' + esc(s.requirementRefs.join(', ')) + (s.needsLogin ? ' · needs a signed-in user' : '') + '</div>' : (s.needsLogin ? '<div class="muted">Needs a signed-in user.</div>' : '')) +
        '<div class="ux-miss"' + (m.length ? '' : ' style="display:none"') + '>' + ui('alert', 13) + '<span>Still missing: ' + esc(m.join(', ')) + '. Add it to the steps or the expected result below.</span></div>' +
        '<label class="ux-fl" for="uxT_' + sid + '">Test case name</label><input class="ux-name" id="uxT_' + sid + '" data-ux-id="' + sid + '" data-ux-f="title" maxlength="120" value="' + esc(uxVal(s, 'title')) + '">' +
        '<label class="ux-fl" for="uxP_' + sid + '">Preconditions</label><textarea id="uxP_' + sid + '" data-ux-id="' + sid + '" data-ux-f="pre" maxlength="1000" rows="2" placeholder="State that must hold first (optional)">' + esc(uxVal(s, 'pre')) + '</textarea>' +
        '<label class="ux-fl" for="uxS_' + sid + '">Execution steps</label><textarea id="uxS_' + sid + '" data-ux-id="' + sid + '" data-ux-f="steps" maxlength="4000" rows="6">' + esc(uxVal(s, 'steps')) + '</textarea>' +
        '<label class="ux-fl" for="uxE_' + sid + '">Expected result</label><textarea id="uxE_' + sid + '" data-ux-id="' + sid + '" data-ux-f="exp" maxlength="1000" rows="2" placeholder="What must be true at the end for this to pass">' + esc(uxVal(s, 'exp')) + '</textarea>' +
        '<label class="ux-fl" for="uxU_' + sid + '">Start URL <span class="muted">(optional, only if this one starts somewhere else)</span></label><input id="uxU_' + sid + '" type="url" data-ux-id="' + sid + '" data-ux-f="url" maxlength="500" placeholder="' + (pickable ? 'Uses the Start URL from the next step' : 'Uses the Start URL above') + '" value="' + esc(uxVal(s, 'url')) + '">' +
        '</div>' : '') + '</div>'
  }
  function uxDraw() {
    if (!ux) return
    var box = $('aspUxBody'), sc = uxScenarios(), r = ux.result
    var ready = sc.filter(uxReady), sel = uxSel()
    var h
    switch (ux.step) {
      case 'upload':
        h = uxFrame('Upload Requirements', uxStepper(1) +
          '<p class="ux-lead">Upload the functional requirement document to generate test scenarios.</p>' +
          (ux.file ? uxFileCard(false) + '<button type="button" class="ux-link ux-remove" data-ux="remove">Choose a different file</button>'
            : '<div class="ux-drop" id="uxDrop" data-ux="browse" role="button" tabindex="0">' + ui('cloud', 30) +
              '<div><b>Drag &amp; drop a file here</b>, or <span class="ux-linktxt">browse</span></div><div class="ux-hint">PDF, DOCX, TXT · Max 25 MB</div></div>') +
          '<input type="file" id="uxFile" accept=".pdf,.docx,.txt,.md" hidden>',
          '', uxBtn('cancel', 'Cancel') + uxBtn('upload', 'Upload', true, { disabled: !ux.file }))
        break
      case 'uploaded':
        h = uxFrame('Document Uploaded', uxStepper(2) + uxFileCard(true) +
          uxNote('We\'ll extract requirements, features, and expected results from your document.'),
          uxBtn('back', 'Back', false, { back: true }), uxBtn('extract', ux.err ? 'Try again' : 'Extract Requirements', true))
        break
      case 'extracting':
        h = uxFrame('Extracting Requirements', uxStepper(3) +
          '<div class="ux-center"><div class="ux-hero">' + ui('doc', 34) + '<span class="ux-spark">' + ui('spark', 14) + '</span></div>' +
          '<p>Analyzing document and extracting details…</p>' +
          '<div class="ux-progress"><div class="ux-bar"><span id="uxBar" style="width:' + ux.progress + '%"></span></div><span id="uxPct">' + Math.round(ux.progress) + '%</span></div></div>',
          '', uxBtn('cancel', 'Cancel'))
        break
      case 'review':
        var reqs = r.requirements || []
        h = uxFrame('Review Extracted Requirements', uxStepper(4) +
          '<div class="ux-tiles four">' + uxTile('layers', r.counts.requirements, 'Requirements') + uxTile('grid', r.counts.features, 'Features') +
          uxTile('flow', r.counts.workflows, 'Workflows') + uxTile('alert', r.counts.clarifications, 'Need Clarification', r.counts.clarifications ? 'warn' : '') + '</div>' +
          uxFileCard(false, true) +
          ((r.documentIssues || []).length ? '<div class="ux-miss" style="margin-bottom:8px">' + ui('alert', 13) + ' Document issues: ' + esc(r.documentIssues.join(' · ')) + '</div>' : '') +
          (reqs.length ? '<div class="ux-fl">Requirements</div><div class="ux-list">' + reqs.map(function (q) {
            var key = 'q:' + q.ref, open = !!ux.open[key]
            return '<div class="ux-row' + (open ? ' open' : '') + '"><div class="ux-rhead"><span class="ux-id">' + esc(q.ref) + '</span><span class="ux-rt">' + esc(q.title) + '</span>' +
              (q.ambiguous ? '<span class="ux-pill warn">Unclear</span>' : '<span class="ux-pill ok">' + (q.type === 'business_rule' ? 'Rule' : 'Functional') + '</span>') +
              '<button type="button" class="ux-chev" data-ux="toggle" data-id="' + esc(key) + '" aria-expanded="' + open + '" aria-label="Show requirement">' + ui('chevron', 15) + '</button></div>' +
              (open ? '<div class="ux-rbody">' + (q.description ? '<div>' + esc(q.description) + '</div>' : '') +
                (q.quote ? '<div class="ux-steps">“' + esc(q.quote) + '”' + (q.section ? ' — ' + esc(q.section) : '') + '</div>' : (q.section ? '<div class="muted">Section: ' + esc(q.section) + '</div>' : '')) +
                (q.expectedResult ? '<div><b>Expected:</b> ' + esc(q.expectedResult) + '</div>' : '') +
                (q.ambiguous ? '<div class="ux-miss">' + ui('alert', 13) + ' ' + esc(q.clarification) + '</div>' : '') + '</div>' : '') + '</div>'
          }).join('') + '</div>' : ''),
          uxBtn('back', 'Back', false, { back: true }), uxBtn('generate', 'Generate Test Scenarios', true))
        break
      case 'generated':
        h = uxFrame('Test Scenarios Generated', uxStepper(4) +
          '<div class="ux-tiles three">' + uxTile('list', sc.length, 'Test Scenarios', 'blue') + uxTile('check', ready.length, 'Ready', 'green') +
          uxTile('alert', sc.length - ready.length, 'Incomplete', sc.length - ready.length ? 'warn' : '') + '</div>' +
          uxNote('All of them will be added to Test Cases. Each one is linked to the requirement it verifies.' + (sc.length - ready.length ? ' Incomplete ones are missing details you can fill in before adding them.' : '')),
          uxBtn('back', 'Back', false, { back: true }), uxBtn('scenarios', 'Review Test Cases', true))
        break
      case 'scenarios':
        var allSel = sc.length > 0 && sel.length === sc.length
        h = uxFrame('Review Test Cases',
          '<p class="ux-lead">Every test case extracted from <b>' + esc(ux.file.name) + '</b> is selected and will be added to Test Cases. Open one to edit its steps; untick any you don&#39;t want. Start URL and login are set on the next step.</p>' +
          (sc.length ? '<div class="ux-list">' + sc.map(function (s) { return uxRow(s, true) }).join('') + '</div>' +
          '<label class="ux-allready"><input type="checkbox" id="uxAllReady"' + (allSel ? ' checked' : '') + '> <span id="uxAllCount">' + esc(uxAllLabel()) + '</span></label>'
            : '<div class="empty">No test cases were found in this document.</div>'),
          uxBtn('back', 'Back', false, { back: true }), uxBtn('run', sel.length ? uxAddLabel(sel.length) : 'Select test cases', true, { disabled: !sel.length }))
        break
      case 'details':
        var sh = ux.shared || { url: r.startUrl || '', exec: '', cred: '', group: '', status: 'active' }
        var accs = cur.accounts || [], needLogin = sel.filter(function (s) { return s.needsLogin }).length
        if (!sh.exec) sh.exec = needLogin && accs.length ? 'creds' : 'none'
        if (!sh.cred && accs[0]) sh.cred = accs[0].id
        if (sh.setup == null) sh.setup = cur.project.setupSteps || PX4_SETUP
        ux.shared = sh
        h = uxFrame('Complete Test Case Details',
          '<p class="ux-lead">' + plural(sel.length, 'test case') + ' will be added to Test Cases from <b>' + esc(ux.file.name) + '</b>, each linked to its requirement. Nothing runs now; run them from Test Cases whenever you want.</p>' +
          '<div class="ux-form">' +
          '<label class="ux-fl" for="uxUrl">Start URL' + (r.startUrl ? ' <span class="ux-tag">from document</span>' : ' <span class="ux-tag warn">needed</span>') + '</label>' +
          '<input id="uxUrl" type="url" maxlength="500" placeholder="https://app.example.com/login" value="' + esc(sh.url) + '">' +
          '<div class="muted">Used by every test case that has no start URL of its own.</div>' +
          // Required. PX4 → the PX4 setup steps are added (behind the scenes) in front of every test case;
          // Other → none. The steps themselves are not shown.
          '<div class="ux-fl" id="uxAppLbl">Which application is this? *</div>' +
          '<div class="ux-radios ux-app" role="radiogroup" aria-labelledby="uxAppLbl" aria-required="true">' +
          '<label class="ux-radio"><input type="radio" name="uxApp" value="px4"' + (sh.app === 'px4' ? ' checked' : '') + '><span><b>PX4 application</b></span></label>' +
          '<label class="ux-radio"><input type="radio" name="uxApp" value="other"' + (sh.app === 'other' ? ' checked' : '') + '><span><b>Other application</b></span></label></div>' +
          '<div class="ux-fl">How should these test cases run?' + (needLogin ? ' <span class="ux-tag">' + needLogin + ' need a login</span>' : '') + '</div>' +
          '<div class="ux-radios"><label class="ux-radio"><input type="radio" name="uxExec" value="none"' + (sh.exec !== 'creds' ? ' checked' : '') + '><span><b>Without credentials</b><span class="muted">Public pages only. No login step.</span></span></label>' +
          '<label class="ux-radio"><input type="radio" name="uxExec" value="creds"' + (sh.exec === 'creds' ? ' checked' : '') + (accs.length ? '' : ' disabled') + '><span><b>With credentials</b><span class="muted">' + (accs.length ? 'The AutoSim logs in with the credentials below.' : 'Add credentials in the Credentials tab first.') + '</span></span></label></div>' +
          (sh.exec === 'creds' && accs.length ? '<select id="uxCred" aria-label="Credentials">' + accs.map(function (a) { return '<option value="' + esc(a.id) + '"' + (a.id === sh.cred ? ' selected' : '') + '>' + esc(credLabel(a)) + '</option>' }).join('') + '</select>' : '') +
          '<div class="ux-two"><div><label class="ux-fl" for="uxGroup">Group</label><select id="uxGroup"><option value="">No group</option>' + cur.groups.map(function (g) { return '<option value="' + esc(g.id) + '"' + (g.id === sh.group ? ' selected' : '') + '>' + esc(g.name) + '</option>' }).join('') + '</select></div>' +
          '<div><label class="ux-fl" for="uxStatus">Status</label><select id="uxStatus">' + [['active', 'Active'], ['draft', 'Draft']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === sh.status ? ' selected' : '') + '>' + o[1] + '</option>' }).join('') + '</select></div></div>' +
          '<div class="ux-fl">Test cases to add <span class="ux-tag">' + sel.length + '</span></div>' +
          '<div class="ux-list">' + sel.map(function (s) { return uxRow(s, false) }).join('') + '</div>' +
          '</div>',
          uxBtn('back', 'Back', false, { back: true }), uxBtn('create', uxAddLabel(sel.length), true))
        break
      case 'creating':
        h = uxFrame('Adding Test Cases',
          '<div class="ux-center"><div class="ux-hero">' + ui('list', 32) + '</div><p>Adding ' + plural(sel.length, 'test case') + ' and linking them to their requirements…</p>' +
          '<div class="ux-progress"><div class="ux-bar ux-indet"><span></span></div></div></div>',
          '', '')
        break
      case 'done':   // only shown when some test cases could not be added
        h = uxFrame('Some Test Cases Were Not Added',
          '<div class="ux-tiles two">' + uxTile('check', ux.created.length, 'Added', 'green') + uxTile('alert', ux.failed.length, 'Not added', 'warn') + '</div>' +
          '<ul class="ux-fails">' + ux.failed.map(function (f) { return '<li><b>' + esc(f.s.id) + ' ' + esc(f.s.title) + '</b>: ' + esc(f.msg) + '</li>' }).join('') + '</ul>' +
          (ux.created.length ? uxNote('The added ones are listed under Test Cases.') : ''),
          '', uxBtn('finish', 'Close', true))
        break
    }
    // Keep scroll positions across redraws on the same step (expanding a scenario redraws the dialog).
    var modal = box.parentNode, oldList = box.querySelector('.ux-list')
    var keep = ux.lastStep === ux.step ? { m: modal.scrollTop, l: oldList ? oldList.scrollTop : 0 } : null
    ux.lastStep = ux.step
    box.innerHTML = h
    if (keep) { modal.scrollTop = keep.m; var nl = box.querySelector('.ux-list'); if (nl) nl.scrollTop = keep.l }
    if (ux.step === 'upload') {
      var drop = $('uxDrop')
      if (drop) {
        drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('uxFile').click() } })
        ;['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over') }) })
        drop.addEventListener('dragleave', function () { drop.classList.remove('over') })
        drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('over'); uxPick(e.dataTransfer.files && e.dataTransfer.files[0]) })
      }
    }
  }

  // Sub-tab switch (markup lives in dashboard.html's AutoSims card).
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-asp-switch]')
    if (!b) return
    e.preventDefault()
    go(b.getAttribute('data-asp-switch') === 'projects' ? { asp: 'list' } : null)
  })

  window.klavAsp = { sync: sync, refresh: refresh, params: PARAMS }
  if (document.body && document.body.getAttribute('data-view') === 'autosims') sync()
})()
