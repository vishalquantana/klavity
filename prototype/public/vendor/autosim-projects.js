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
  function ensureModal() {
    if ($('aspModalBg')) return
    var bg = document.createElement('div')
    bg.className = 'modal-bg'; bg.id = 'aspModalBg'
    bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="aspModalTitle"><h2 id="aspModalTitle"></h2>' +
      '<form id="aspModalForm" novalidate><div id="aspModalBody"></div><div class="err" id="aspModalErr" role="alert"></div>' +
      '<div class="acts"><button type="button" class="btn btn-ghost" id="aspModalCancel">Cancel</button><button type="submit" class="btn btn-indigo" id="aspModalOk">Save</button></div></form></div>'
    document.body.appendChild(bg)
    $('aspModalForm').addEventListener('submit', function (e) { e.preventDefault(); if (modalSubmit) modalSubmit() })
    $('aspModalCancel').addEventListener('click', closeModal)
    bg.addEventListener('click', function (e) { if (e.target === bg) closeModal() })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bg.classList.contains('show')) closeModal() })
  }
  function closeModal() { var bg = $('aspModalBg'); if (bg) bg.classList.remove('show'); modalSubmit = null }
  function openForm(opts) {
    ensureModal()
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
      $('aspModalOk').disabled = true
      try { await opts.submit(vals); closeModal() }
      catch (e) { $('aspModalErr').textContent = e.message }
      finally { $('aspModalOk').disabled = false }
    }
    $('aspModalBg').classList.add('show')
    var first = $('aspModalBody').querySelector('input:not([type=radio]),textarea,select'); if (first) first.focus()
  }
  async function confirmDanger(title, message, okLabel, fn) {
    var ok = typeof window.klavConfirm === 'function'
      ? await window.klavConfirm({ title: title, message: message, confirmText: okLabel })
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

  function crumbs(items) {
    $('aspCrumbs').innerHTML = items.join('<span aria-hidden="true">/</span>')
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
    crumbs(['<span>Projects</span>'])
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
      ],
      submit: async function (v) {
        if (p) { await api('PATCH', '/api/autosim-projects/' + encodeURIComponent(p.id), v); toast('Project updated'); sync() }
        else { var d = await api('POST', '/api/autosim-projects', v); toast('Project created'); go({ asp: d.project.id }) }
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
    crumbs([navLink({ asp: 'list' }, 'Projects'), '<span>' + esc(p.name) + '</span>'])
    var TABS = [['overview', 'Overview'], ['credentials', 'Credentials'], ['groups', 'Test Case Groups'], ['test-cases', 'Test Cases']]
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
    openForm({ title: tc ? 'Edit test case' : 'New test case', okLabel: tc ? 'Save' : 'Create test case',
      fields: [
        { key: 'name', label: 'Test case name', required: true, max: 120, value: tc && tc.name, placeholder: 'e.g. Valid login' },
        { key: 'start_url', label: 'Start URL', required: true, type: 'url', max: 500, value: tc && tc.startUrl, placeholder: 'https://app.example.com/login',
          pattern: /^https?:\/\/\S+$/, patternMsg: 'Start URL must start with http:// or https://', hint: 'Where the AutoSim opens the browser.' },
        { key: 'description', label: 'Execution steps', type: 'textarea', max: 4000, value: tc && tc.description,
          placeholder: '1. Log in\n2. Choose the "PX4 Softwares" company\n3. Open Reports and check the totals load',
          hint: 'What the AutoSim should do and check, in plain words. Used as the AutoSim objective.' },
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
        toast(tc ? 'Test case updated' : 'Test case created'); sync()
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
      '<button class="btn btn-indigo" id="aspTcAdd">+ New test case</button></div><div id="aspTcList"></div>'
    if (tcState.group !== 'all' && tcState.group !== 'none' && !cur.groups.some(function (g) { return g.id === tcState.group })) tcState.group = 'all'
    $('aspTgroup').value = tcState.group; $('aspTstatus').value = tcState.status
    $('aspTq').oninput = function () { tcState.q = this.value; tcState.page = 1; drawTcRows() }
    $('aspTgroup').onchange = function () { tcState.group = this.value; tcState.page = 1; drawTcRows() }
    $('aspTstatus').onchange = function () { tcState.status = this.value; tcState.page = 1; drawTcRows() }
    $('aspTcAdd').onclick = function () { testCaseForm(null) }
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
        return '<tr><td>' + navLink({ asp: cur.project.id, tc: t.id }, t.name) + '</td>' +
          '<td class="muted" style="max-width:220px;word-break:break-all">' + (t.startUrl ? esc(t.startUrl) : '<span style="color:var(--amber)">Not set</span>') + '</td>' +
          '<td><select data-move="' + esc(t.id) + '" aria-label="Move ' + esc(t.name) + ' to group">' + opts(t.groupId) + '</select></td>' +
          '<td>' + (c ? '<span class="asp-pill green">' + esc(c.name) + '</span>' : '<span class="muted">None</span>') + '</td>' +
          '<td><span class="asp-pill ' + esc(t.status) + '">' + esc(t.status) + '</span></td><td>' + t.trailCount + '</td><td class="muted">' + esc(fmtDate(t.updatedAt)) + '</td>' +
          '<td><div class="actions"><button class="btn btn-ghost btn-sm" data-tedit="' + esc(t.id) + '">Edit</button><button class="btn btn-ghost btn-sm btn-danger" data-tdel="' + esc(t.id) + '">Delete</button></div></td></tr>'
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
    crumbs([navLink({ asp: 'list' }, 'Projects'), navLink({ asp: p.id }, p.name), navLink({ asp: p.id, tab: 'test-cases' }, 'Test Cases'), '<span>' + esc(tc.name) + '</span>'])
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
        '<a class="btn btn-ghost" href="' + esc(tcBase + '/script?project=' + P) + '" download>Download script</a>' +
        '<button class="btn btn-ghost" data-open-autosims>Open in AutoSims</button>' +
        '<button class="btn btn-ghost btn-danger" id="aspUnlink">Remove</button></div></div>' +
        '<p class="muted">Run replays the recorded script exactly, without AI. If your app changed and runs start failing, update the execution steps if needed, then Re-record to generate a new script. Past results are kept.</p>' +
        (auto.status === 'draft' ? '<p class="muted" style="margin-top:6px">This AutoSim is a draft: you can run it now; activate it to run it on a schedule and file findings.</p>' : '') +
        (auto.status === 'paused' ? '<p class="muted" style="margin-top:6px;color:var(--amber)">This AutoSim is paused in AutoSims. Resume it there to run it.</p>' : '') +
        '</div>'
      : '<div class="asp-card" style="margin-bottom:18px"><div class="head" style="margin-bottom:8px"><div>' +
        '<h2 style="font:500 20px var(--display)">No AutoSim yet</h2>' +
        '<p class="muted" style="margin-top:4px">Create AutoSim records these steps once and saves them as a script. After that, every run replays the script without AI.</p></div>' +
        '<div class="actions"><button class="btn btn-ghost" id="aspTcLink">Add existing AutoSim</button><button class="btn btn-indigo" id="aspTcCreate">+ Create AutoSim</button></div></div></div>'

    $('aspMain').innerHTML =
      '<div class="head"><div><h1>' + esc(tc.name) + '</h1></div>' +
      '<div class="actions"><button class="btn btn-ghost" id="aspTcEdit">Edit</button><button class="btn btn-ghost btn-danger" id="aspTcDel">Delete</button></div></div>' +
      '<div class="asp-card" style="margin-bottom:18px"><dl class="kv">' +
      '<dt>Start URL</dt><dd>' + (tc.startUrl ? '<a href="' + esc(tc.startUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--indigo)">' + esc(tc.startUrl) + '</a>' : '<span style="color:var(--amber)">Not set. Edit the test case to add where it starts.</span>') + '</dd>' +
      '<dt>Execution steps</dt><dd>' + (tc.description ? '<div class="steps">' + esc(tc.description) + '</div>' : '<span class="muted">None yet. Edit the test case to describe what the AutoSim should do.</span>') + '</dd>' +
      '<dt>Execution</dt><dd>' + (cred
        ? 'With credentials: <b>' + esc(cred.name) + '</b> <span class="muted">(' + esc(cred.loginEmail) + ')</span>'
        : (tc.testAccountId ? '<span style="color:var(--rose)">Its credentials are no longer available.</span> ' : 'Without credentials <span class="muted">(no login step)</span>')) + '</dd>' +
      '<dt>Group</dt><dd><select id="aspTcGroup" aria-label="Group"><option value="">Ungrouped</option>' + cur.groups.map(function (g) { return '<option value="' + esc(g.id) + '"' + (g.id === tc.groupId ? ' selected' : '') + '>' + esc(g.name) + '</option>' }).join('') + '</select></dd>' +
      '<dt>Status</dt><dd><span class="asp-pill ' + esc(tc.status) + '">' + esc(tc.status) + '</span></dd>' +
      '<dt>Last updated</dt><dd>' + esc(fmtDate(tc.updatedAt)) + '</dd></dl></div>' +
      autoHtml +
      '<h2 style="font:500 20px var(--display);margin-bottom:10px">Execution results</h2><div id="aspRuns"><div class="loading">Loading results…</div></div>'

    $('aspTcEdit').onclick = function () { testCaseForm(tc) }
    $('aspTcDel').onclick = function () { deleteTestCaseConfirm(tc, function () { go({ asp: p.id, tab: 'test-cases' }) }) }
    $('aspTcGroup').onchange = async function () {
      var s = this; s.disabled = true
      try { await moveTestCase(tc, s.value); await renderTestCase(apId, tcId) } catch (e) { toast(e.message, true); s.disabled = false }
    }
    $('aspMain').querySelectorAll('[data-open-autosims]').forEach(function (b) { b.onclick = function () { go(null) } })

    // Record (first time) / re-record (replace) from this test case's own details — no wizard.
    async function record(btn, replace) {
      if (!tc.startUrl) { toast('Add a Start URL to this test case first.', true); testCaseForm(tc); return }
      if ((tc.description || '').trim().length < 10) { toast('Describe the execution steps (at least 10 characters) first.', true); testCaseForm(tc); return }
      if (tc.testAccountId && !cred) { toast('This test case\'s credentials no longer exist. Pick another login first.', true); testCaseForm(tc); return }
      if (typeof window.klavStartAutosimForTestCase !== 'function') { toast('AutoSims is still loading. Try again in a moment.', true); return }
      var label = btn.textContent; btn.disabled = true; btn.textContent = 'Starting…'
      try { await window.klavStartAutosimForTestCase({ id: tc.id, name: tc.name, url: tc.startUrl, objective: tc.description.trim(), cred: cred ? cred.name : '-', replace: replace }) }
      catch (e) { toast(e.message, true) }
      finally { btn.disabled = false; btn.textContent = label }
    }
    if ($('aspTcCreate')) $('aspTcCreate').onclick = function () { record(this, false) }

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
    } else {
      $('aspTcLink').onclick = function () {
        var cands = cur.unassignedTrails.map(function (t) { return { value: t.id, label: t.name + ' (unassigned)' } })
          .concat(cur.trails.filter(function (t) { return !t.testCaseId }).map(function (t) { return { value: t.id, label: t.name + ' (no test case)' } }))
        if (!cands.length) { toast('No unassigned AutoSims available. Create one instead.'); return }
        openForm({ title: 'Add existing AutoSim', okLabel: 'Add to test case', message: 'A test case has one AutoSim. Its steps, schedule and history are kept.',
          fields: [{ key: 'trail', label: 'AutoSim', type: 'select', value: cands[0].value, options: cands }],
          submit: async function (v) { await api('PUT', tcBase + '/trails/' + encodeURIComponent(v.trail)); toast('AutoSim added'); renderTestCase(apId, tcId) } })
      }
    }
    drawRuns(tc, tcBase)
  }

  // Execution results: summary strip + one row per run. Polls while a run is in progress.
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
      '<div class="table-wrap"><table><thead><tr><th>When</th><th>Result</th><th>Steps</th><th>Duration</th><th>Mode</th><th>Trigger</th><th></th></tr></thead><tbody>' +
      runs.map(function (r) {
        var res = RESULT[r.status] || [r.status, '']
        var steps = r.steps ? (r.passed + '/' + r.steps + ' passed' + (r.failed ? ' · <span style="color:var(--rose)">' + r.failed + ' failed</span>' : '') + (r.healed ? ' · ' + r.healed + ' fixed' : '')) : '<span class="muted">–</span>'
        var mode = r.aiCalls === 0 ? 'Script replay' : 'Replay + AI fixes (' + r.aiCalls + ')'
        return '<tr><td>' + esc(fmtWhen(r.startedAt)) + (r.current ? '' : '<div class="muted">previous recording</div>') + '</td>' +
          '<td><span class="asp-pill ' + res[1] + '">' + esc(res[0]) + '</span>' + (r.findings ? '<div class="muted">' + plural(r.findings, 'finding') + '</div>' : '') + '</td>' +
          '<td>' + steps + '</td><td>' + esc(fmtDur(r.durationMs)) + '</td><td class="muted">' + esc(mode) + '</td><td class="muted">' + esc(r.trigger) + '</td>' +
          '<td><div class="actions"><button class="btn btn-ghost btn-sm" data-steps="' + esc(r.runId) + '" aria-expanded="' + !!openRuns[r.runId] + '">' + (openRuns[r.runId] ? 'Hide steps' : 'Steps') + '</button>' +
          '<a class="btn btn-ghost btn-sm" href="/autosims/walk/' + esc(encodeURIComponent(r.runId)) + '?project=' + P + '">Report</a>' +
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
