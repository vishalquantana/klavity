/* KLAVITY ATTRIBUTION · attr.js — tiny, dependency-free FIRST-TOUCH capture, no network calls.
   utm_source/medium/campaign/term/content, gclid/fbclid, `?ref=` from the URL, else classify
   document.referrer's hostname (self-referral/empty → direct). First touch
   (localStorage['klav_attr']) is written once, never again;
   ['klav_attr_last'] tracks the latest real-param visit. Mirrors first touch to cookie `klav_attr`
   (90d) so the server can recover it without attach(). Fields clamp to 200 chars, strip control
   chars. All storage/cookie access try/catch'd (Safari private mode throws).
   Defer-load: <script src="/attr.js" defer></script> */
(function () {
  "use strict";

  var LS_FIRST = "klav_attr", LS_LAST = "klav_attr_last", COOKIE_NAME = "klav_attr";
  var COOKIE_MAX_AGE = 90 * 24 * 60 * 60, COOKIE_MAX_BYTES = 1500, FIELD_MAX = 200;
  var PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ref"];
  // hostname → friendly source, first match wins.
  var REF_MAP = [
    [/(^|\.)reddit\.com$/i, "reddit"], [/(^|\.)x\.com$/i, "x"], [/(^|\.)twitter\.com$/i, "x"],
    [/(^|\.)news\.ycombinator\.com$/i, "hackernews"], [/(^|\.)google\.[a-z.]+$/i, "google"],
    [/(^|\.)linkedin\.com$/i, "linkedin"],
  ];

  function clampStr(v) {
    var s = v == null ? "" : String(v).replace(/[\x00-\x1F\x7F]/g, "");
    return s.length > FIELD_MAX ? s.slice(0, FIELD_MAX) : s;
  }
  function safeReferrer() { try { return document.referrer || ""; } catch (e) { return ""; } }
  function safeLandingPage() { try { return location.pathname || ""; } catch (e) { return ""; } }

  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      var v = raw ? JSON.parse(raw) : null;
      return v && typeof v === "object" ? v : null;
    } catch (e) { return null; }
  }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  // Refreshes Max-Age on every visit so a 90d-stale cookie doesn't expire on an active user.
  function mirrorCookie(rec) {
    try {
      var enc = encodeURIComponent(JSON.stringify(rec));
      if (enc.length > COOKIE_MAX_BYTES) return;
      var secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = COOKIE_NAME + "=" + enc + "; Max-Age=" + COOKIE_MAX_AGE + "; Path=/; SameSite=Lax" + secure;
    } catch (e) {}
  }

  function paramsFromSearch() {
    var out = {};
    try {
      var sp = new URLSearchParams(location.search);
      for (var i = 0; i < PARAM_KEYS.length; i++) { var v = sp.get(PARAM_KEYS[i]); if (v) out[PARAM_KEYS[i]] = v; }
    } catch (e) {}
    return out;
  }
  function baseFields() {
    return { referrer: clampStr(safeReferrer()), landing_page: clampStr(safeLandingPage()), first_seen_at: Date.now() };
  }
  function buildFromParams(p) {
    var rec = baseFields();
    rec.source = clampStr(p.utm_source || p.ref || "");
    rec.medium = clampStr(p.utm_medium || (p.ref ? "referral" : ""));
    rec.campaign = clampStr(p.utm_campaign || "");
    rec.term = clampStr(p.utm_term || "");
    rec.content = clampStr(p.utm_content || "");
    rec.gclid = clampStr(p.gclid || "");
    rec.fbclid = clampStr(p.fbclid || "");
    return rec;
  }
  function classifyReferrer() {
    var ref = safeReferrer();
    if (!ref) return { source: "direct", medium: "none" };
    var host;
    try { host = new URL(ref).hostname.replace(/^www\./, ""); } catch (e) { return { source: "direct", medium: "none" }; }
    if (!host) return { source: "direct", medium: "none" };
    if (host === String(location.hostname || "").replace(/^www\./, "")) return { source: "direct", medium: "none" };
    for (var i = 0; i < REF_MAP.length; i++) if (REF_MAP[i][0].test(host)) return { source: REF_MAP[i][1], medium: "referral" };
    return { source: host, medium: "referral" };
  }
  function buildFromReferrer() {
    var c = classifyReferrer(), rec = baseFields();
    rec.source = clampStr(c.source); rec.medium = clampStr(c.medium);
    rec.campaign = ""; rec.term = ""; rec.content = ""; rec.gclid = ""; rec.fbclid = "";
    return rec;
  }

  function init() {
    var params = paramsFromSearch(), hasReal = Object.keys(params).length > 0, first = readJSON(LS_FIRST);
    if (hasReal) {
      var rec = buildFromParams(params);
      writeJSON(LS_LAST, rec); // last-touch always reflects the freshest real params
      if (!first) { writeJSON(LS_FIRST, rec); first = rec; }
    } else if (!first) {
      first = buildFromReferrer();
      writeJSON(LS_FIRST, first);
    }
    if (first) mirrorCookie(first);
  }

  function get() {
    var v = readJSON(LS_FIRST);
    if (v) return v;
    var params = paramsFromSearch(); // storage blocked — compute ephemeral value, don't persist
    return Object.keys(params).length ? buildFromParams(params) : buildFromReferrer();
  }
  function getLast() { return readJSON(LS_LAST) || get(); }
  function attach(body) {
    var out = {};
    if (body && typeof body === "object") for (var k in body) if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
    out.attr = get();
    return out;
  }
  function clear() {
    try { localStorage.removeItem(LS_FIRST); } catch (e) {}
    try { localStorage.removeItem(LS_LAST); } catch (e) {}
    try { document.cookie = COOKIE_NAME + "=; Max-Age=0; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : ""); } catch (e) {}
  }

  try { init(); } catch (e) {}

  window.KlavAttr = { get: get, getLast: getLast, attach: attach, clear: clear };
})();
