var Rd = Object.defineProperty;
var Td = (e, t, r) => t in e ? Rd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var wn = (e, t, r) => Td(e, typeof t != "symbol" ? t + "" : t, r);
function Ad(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const uc = 112, dc = 72, pc = 89, hc = 115;
let Ii;
function _d() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Id(e) {
  let t = -1;
  Ii || (Ii = _d());
  for (let r = 0; r < e.length; r++)
    t = Ii[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Ld(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === uc && e[r - 2] === dc && e[r - 1] === pc && e[r] === hc)
      return r - 3;
  return 0;
}
function Od(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = uc, n[1] = dc, n[2] = pc, n[3] = hc, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Id(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Ld(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const Nd = "AAlwSFlz", Pd = "AAAJcEhZ", Dd = "AAAACXBI";
function zd(e) {
  let t = e.indexOf(Nd);
  return t === -1 && (t = e.indexOf(Pd)), t === -1 && (t = e.indexOf(Dd)), t;
}
const fc = "[modern-screenshot]", Zt = typeof window < "u", Fd = Zt && "Worker" in window, $d = Zt && "atob" in window, Ud = Zt && "btoa" in window;
var cc;
const no = Zt ? (cc = window.navigator) == null ? void 0 : cc.userAgent : "", mc = no.includes("Chrome"), Wn = no.includes("AppleWebKit") && !mc, io = no.includes("Firefox"), Bd = (e) => e && "__CONTEXT__" in e, qd = (e) => e.constructor.name === "CSSFontFaceRule", Wd = (e) => e.constructor.name === "CSSImportRule", Hd = (e) => e.constructor.name === "CSSLayerBlockRule", Dt = (e) => e.nodeType === 1, ln = (e) => typeof e.className == "object", gc = (e) => e.tagName === "image", jd = (e) => e.tagName === "use", tn = (e) => Dt(e) && typeof e.style < "u" && !ln(e), Vd = (e) => e.nodeType === 8, Yd = (e) => e.nodeType === 3, $r = (e) => e.tagName === "IMG", ti = (e) => e.tagName === "VIDEO", Gd = (e) => e.tagName === "CANVAS", Xd = (e) => e.tagName === "TEXTAREA", Kd = (e) => e.tagName === "INPUT", Jd = (e) => e.tagName === "STYLE", Zd = (e) => e.tagName === "SCRIPT", Qd = (e) => e.tagName === "SELECT", ep = (e) => e.tagName === "SLOT", tp = (e) => e.tagName === "IFRAME", rp = (...e) => console.warn(fc, ...e);
function np(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ys = (e) => e.startsWith("data:");
function yc(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Zt && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Zt)
    return e;
  const r = ri().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function ri(e) {
  return (e && Dt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const ni = "http://www.w3.org/2000/svg";
function ip(e, t, r) {
  const n = ri(r).createElementNS(ni, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function sp(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function op(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const ap = (e) => op(e, "dataUrl");
function Pr(e, t) {
  const r = ri(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function rn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? Pr(e, ri(i)) : e;
    let l = null, d = null;
    function o() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(o, n)), ti(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? rn(c.poster, t).then(r) : o();
      if (c.readyState >= 2)
        return o();
      const p = o, u = (m) => {
        a == null || a(
          "Failed video load",
          h,
          m
        ), s == null || s(m), o();
      };
      d = () => {
        c.removeEventListener("loadeddata", p), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = gc(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const p = async () => {
        if ($r(c) && "decode" in c)
          try {
            await c.decode();
          } catch (m) {
            a == null || a(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              m
            );
          }
        o();
      }, u = (m) => {
        a == null || a(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), o();
      };
      if ($r(c) && c.complete)
        return p();
      d = () => {
        c.removeEventListener("load", p), c.removeEventListener("error", u);
      }, c.addEventListener("load", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function lp(e, t) {
  tn(e) && ($r(e) || ti(e) ? await rn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => rn(n, t)))
  ));
}
const bc = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function vc(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let oa = 0;
function cp(e) {
  const t = `${fc}[#${oa}]`;
  return oa++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && rp(...r)
  };
}
function up(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function ii(e, t) {
  return Bd(e) ? e : dp(e, { ...t, autoDestruct: !0 });
}
async function dp(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Zt ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Zt ? window : void 0), d = /* @__PURE__ */ new Map(), o = {
    // Options
    width: 0,
    height: 0,
    quality: 1,
    type: "image/png",
    scale: r,
    backgroundColor: null,
    style: null,
    filter: null,
    maximumCanvasSize: 0,
    timeout: 3e4,
    progress: null,
    debug: s,
    fetch: {
      requestInit: up((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
      placeholderImage: "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      bypassingCache: !1,
      ...t == null ? void 0 : t.fetch
    },
    fetchFn: null,
    font: {},
    drawImageInterval: 100,
    workerUrl: null,
    workerNumber: i,
    onCloneEachNode: null,
    onCloneNode: null,
    onEmbedNode: null,
    onCreateForeignObjectSvg: null,
    includeStyleProperties: null,
    autoDestruct: !1,
    ...t,
    // InternalContext
    __CONTEXT__: !0,
    log: cp(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: kc(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(ni, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Fd && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var b, S, w, k;
          const { url: x, result: v } = g.data;
          v ? (S = (b = d.get(x)) == null ? void 0 : b.resolve) == null || S.call(b, v) : (k = (w = d.get(x)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${x}`));
        }, f.onmessageerror = (g) => {
          var v, b;
          const { url: x } = g.data;
          (b = (v = d.get(x)) == null ? void 0 : v.reject) == null || b.call(v, new Error(`Error receiving message from worker: ${x}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      np(c) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: d,
    drawImageCount: 0,
    tasks: [],
    features: a,
    isEnable: (f) => f === "restoreScrollPosition" ? typeof a == "boolean" ? !1 : a[f] ?? !1 : typeof a == "boolean" ? a : a[f] ?? !0,
    shadowRoots: []
  };
  o.log.time("wait until load"), await lp(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: p } = pp(e, o);
  return o.width = h, o.height = p, o;
}
function kc(e) {
  if (!e)
    return;
  const t = e.createElement("style"), r = t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);
  return t.appendChild(r), t;
}
function pp(e, t) {
  let { width: r, height: n } = t;
  if (Dt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function hp(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await rn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = fp(e.ownerDocument, t), d = () => {
    try {
      l == null || l.drawImage(a, 0, 0, c.width, c.height);
    } catch (o) {
      t.log.warn("Failed to drawImage", o);
    }
  };
  if (d(), t.isEnable("fixSvgXmlDecode"))
    for (let o = 0; o < i; o++)
      await new Promise((h) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, c.width, c.height), d(), h();
        }, o + s);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function fp(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function wc(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Pr(s, e.ownerDocument);
    } catch (s) {
      t.log.warn("Failed to clone canvas", s);
    }
  const r = e.cloneNode(!1), n = e.getContext("2d"), i = r.getContext("2d");
  try {
    return n && i && i.putImageData(
      n.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), r;
  } catch (s) {
    t.log.warn("Failed to clone canvas", s);
  }
  return r;
}
function mp(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return so(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function gp(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function yp(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Pr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await rn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Pr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Pr(e.poster, e.ownerDocument) : r;
    }
    return wc(s, t);
  }
  return r;
}
function bp(e, t) {
  return Gd(e) ? wc(e, t) : tp(e) ? mp(e, t) : $r(e) ? gp(e) : ti(e) ? yp(e, t) : e.cloneNode(!1);
}
function vp(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${bc()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const kp = [
  "width",
  "height",
  "-webkit-text-fill-color"
], wp = [
  "stroke",
  "fill"
];
function xc(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = ln(e) && i !== "svg", a = s ? wp.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = vp(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const o = d == null ? void 0 : d.document;
  let h, p;
  s ? (h = o.createElementNS(ni, "svg"), p = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, g]) => {
    p.setAttributeNS(null, f, g);
  }), h.appendChild(p)) : h = p = o.createElement(i), p.textContent = " ", o.body.appendChild(h);
  const u = d.getComputedStyle(p, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    kp.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function Sc(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], s = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      a(l);
  else
    for (let l = e.length, d = 0; d < l; d++) {
      const o = e.item(d);
      a(o);
    }
  for (let l = i.length, d = 0; d < l; d++)
    (c = s.get(i[d])) == null || c.forEach((o, h) => n.set(h, o));
  function a(l) {
    const d = e.getPropertyValue(l), o = e.getPropertyPriority(l), h = l.lastIndexOf("-"), p = h > -1 ? l.substring(0, h) : void 0;
    if (p) {
      let u = s.get(p);
      u || (u = /* @__PURE__ */ new Map(), s.set(p, u)), u.set(l, [d, o]);
    }
    t.get(l) === d && !o || (p ? i.push(p) : n.set(l, [d, o]));
  }
  return n;
}
function xp(e, t, r, n) {
  var h, p, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), d = xc(e, null, n);
  a == null || a.forEach((f, g) => {
    d.delete(g);
  });
  const o = Sc(l, d, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), mc && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((p = o.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return o.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), o;
}
function Sp(e, t) {
  (Xd(e) || Kd(e) || Qd(e)) && t.setAttribute("value", e.value);
}
const Cp = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Ep = [
  "::-webkit-scrollbar",
  "::-webkit-scrollbar-button",
  // '::-webkit-scrollbar:horizontal', TODO
  "::-webkit-scrollbar-thumb",
  "::-webkit-scrollbar-track",
  "::-webkit-scrollbar-track-piece",
  // '::-webkit-scrollbar:vertical', TODO
  "::-webkit-scrollbar-corner",
  "::-webkit-resizer"
];
function Mp(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !s)
    return;
  function d(o) {
    var b;
    const h = s.getComputedStyle(e, o);
    let p = h.getPropertyValue("content");
    if (!p || p === "none")
      return;
    i == null || i(p), p = p.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [bc()], m = xc(e, o, n);
    l == null || l.forEach((S, w) => {
      m.delete(w);
    });
    const f = Sc(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((b = f.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${p}';`
    ];
    if (f.forEach(([S, w], k) => {
      g.push(`${k}: ${S}${w ? " !important" : ""};`);
    }), g.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (S) {
      n.log.warn("Failed to copyPseudoClass", S);
      return;
    }
    const x = g.join(`
  `);
    let v = c.get(x);
    v || (v = [], c.set(x, v)), v.push(`.${u[0]}${o}`);
  }
  Cp.forEach(d), r && Ep.forEach(d);
}
const aa = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function la(e, t, r, n, i) {
  if (Dt(r) && (Jd(r) || Zd(r)) || n.filter && !n.filter(r))
    return;
  aa.has(t.nodeName) || aa.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await so(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Rp(e, s), t.appendChild(s);
}
async function ca(e, t, r, n) {
  var s;
  let i = e.firstChild;
  Dt(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!Vd(a))
      if (Dt(a) && ep(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await la(e, t, c[l], r, n);
      } else
        await la(e, t, a, r, n);
}
function Rp(e, t) {
  if (!tn(e) || !tn(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = d, t.style.transform = s.toString();
}
function Tp(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const Ap = /^[\w-:]+$/;
async function so(e, t, r = !1, n) {
  var d, o, h, p;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && Yd(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && Dt(e) && (tn(e) || ln(e))) {
    const u = await bp(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let S = b.length, w = 0; w < S; w++) {
        const k = b[w];
        Ap.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = xp(e, u, r, t);
    r && Tp(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (d = m.get("overflow-x")) == null ? void 0 : d[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = vc((p = m.get("font-family")) == null ? void 0 : p[0]), v = x ? (b) => {
      g === "uppercase" ? b = b.toUpperCase() : g === "lowercase" ? b = b.toLowerCase() : g === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), x.forEach((S) => {
        let w = a.get(S);
        w || a.set(S, w = /* @__PURE__ */ new Set()), b.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return Mp(
      e,
      u,
      f,
      t,
      v
    ), Sp(e, u), ti(e) || await ca(
      e,
      u,
      t,
      v
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await ca(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function _p(e) {
  if (e.ownerDocument = void 0, e.ownerWindow = void 0, e.svgStyleElement = void 0, e.svgDefsElement = void 0, e.svgStyles.clear(), e.defaultComputedStyles.clear(), e.sandbox) {
    try {
      e.sandbox.remove();
    } catch (t) {
      e.log.warn("Failed to destroyContext", t);
    }
    e.sandbox = void 0;
  }
  e.workers = [], e.fontFamilies.clear(), e.fontCssTexts.clear(), e.requests.clear(), e.tasks = [], e.shadowRoots = [];
}
function Ip(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(ap);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function nn(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: s } = t;
  let a = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: d,
    fetchFn: o,
    fetch: {
      requestInit: h,
      bypassingCache: p,
      placeholderImage: u
    },
    font: m,
    workers: f,
    fontFamilies: g
  } = e;
  n === "image" && (Wn || io) && e.drawImageCount++;
  let x = d.get(r);
  if (!x) {
    p && p instanceof RegExp && p.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((C) => {
      g.has(C) && g.get(C).forEach((L) => b.add(L));
    });
    const S = v && b.size, w = {
      url: a,
      timeout: c,
      responseType: S ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: l } : void 0,
      ...h
    };
    x = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, x.response = (async () => {
      if (o && n === "image") {
        const k = await o(r);
        if (k)
          return k;
      }
      return !Wn && r.startsWith("http") && f.length ? new Promise((k, C) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...w }), x.resolve = k, x.reject = C;
      }) : Ip(w);
    })().catch((k) => {
      if (d.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw k;
    }), d.set(r, x);
  }
  return x.response;
}
async function Cc(e, t, r, n) {
  if (!Ec(e))
    return e;
  for (const [i, s] of Lp(e, t))
    try {
      const a = await nn(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Op(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function Ec(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Mc = /url\((['"]?)([^'"]+?)\1\)/g;
function Lp(e, t) {
  const r = [];
  return e.replace(Mc, (n, i, s) => (r.push([s, yc(s, t)]), n)), r.filter(([n]) => !Ys(n));
}
function Op(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Np = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Pp(e, t) {
  return Np.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Wn || io) && t.drawImageCount++, Cc(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Dp(e, t) {
  if ($r(e)) {
    const r = e.currentSrc || e.src;
    if (!Ys(r))
      return [
        nn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Wn || io) && t.drawImageCount++;
  } else if (ln(e) && !Ys(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      nn(t, {
        url: r,
        imageDom: e,
        requestType: "image",
        responseType: "dataUrl"
      }).then((n) => {
        n && (e.dataset.originalSrc = r, e.href.baseVal = n || "");
      })
    ];
  }
  return [];
}
function zp(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [s, a] = i.split("#");
  if (a) {
    const c = `#${a}`, l = t.shadowRoots.reduce(
      (d, o) => d ?? o.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (s && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (s)
      return [
        nn(t, {
          url: s,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function Rc(e, t) {
  const { tasks: r } = t;
  Dt(e) && (($r(e) || gc(e)) && r.push(...Dp(e, t)), jd(e) && r.push(...zp(e, t))), tn(e) && r.push(...Pp(e.style, t)), e.childNodes.forEach((n) => {
    Rc(n, t);
  });
}
async function Fp(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: s,
    tasks: a,
    font: c
  } = t;
  if (!(!r || !n || !i.size))
    if (c && c.cssText) {
      const l = da(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), d = r.implementation.createHTMLDocument(""), o = d.createElement("style");
      d.head.appendChild(o);
      const h = o.sheet;
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if (Wd(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await nn(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const x = g.replace(
              Mc,
              (v, b, S) => v.replace(S, yc(S, f))
            );
            for (const v of Up(x))
              try {
                h.insertRule(v, h.cssRules.length);
              } catch (b) {
                t.log.warn("Error inserting rule from remote css import", { rule: v, error: b });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const p = [];
      l.forEach((u) => {
        Gs(u.cssRules, p);
      }), p.filter((u) => {
        var m;
        return qd(u) && Ec(u.style.getPropertyValue("src")) && ((m = vc(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          Cc(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = da(g, t), s.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const $p = /(\/\*[\s\S]*?\*\/)/g, ua = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Up(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace($p, "");
  for (; ; ) {
    const s = ua.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(ua, "");
  const n = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, i = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let s = n.exec(r);
    if (s)
      i.lastIndex = n.lastIndex;
    else if (s = i.exec(r), s)
      n.lastIndex = i.lastIndex;
    else
      break;
    t.push(s[0]);
  }
  return t;
}
const Bp = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, qp = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function da(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(qp, (i) => {
    for (; ; ) {
      const [s, , a] = Bp.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function Gs(e, t = []) {
  for (const r of Array.from(e))
    Hd(r) ? t.push(...Gs(r.cssRules)) : "cssRules" in r ? Gs(r.cssRules, t) : t.push(r);
  return t;
}
const Wp = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Hp(e) {
  return Wp.test(e.innerHTML);
}
async function jp(e, t) {
  const r = await ii(e, t);
  if (Dt(r.node) && ln(r.node) && !Hp(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: s,
    svgStyleElement: a,
    svgDefsElement: c,
    svgStyles: l,
    font: d,
    progress: o,
    autoDestruct: h,
    onCloneNode: p,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await so(r.node, r, !0);
  if (a && n) {
    let S = "";
    l.forEach((w, k) => {
      S += `${w.join(`,
`)} {
  ${k}
}
`;
    }), a.appendChild(n.createTextNode(S));
  }
  i.timeEnd("clone node"), await (p == null ? void 0 : p(f)), d !== !1 && Dt(f) && (i.time("embed web font"), await Fp(f, r), i.timeEnd("embed web font")), i.time("embed node"), Rc(f, r);
  const g = s.length;
  let x = 0;
  const v = async () => {
    for (; ; ) {
      const S = s.pop();
      if (!S)
        break;
      try {
        await S;
      } catch (w) {
        r.log.warn("Failed to run task", w);
      }
      o == null || o(++x, g);
    }
  };
  o == null || o(x, g), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = Vp(f, r);
  return c && b.insertBefore(c, b.children[0]), a && b.insertBefore(a, b.children[0]), h && _p(r), await (m == null ? void 0 : m(b)), b;
}
function Vp(e, t) {
  const { width: r, height: n } = t, i = ip(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function Yp(e, t) {
  var a;
  const r = await ii(e, t), n = await jp(r), i = sp(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = kc(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(ni, "defs"), r.svgStyles.clear());
  const s = Pr(i, n.ownerDocument);
  return await hp(s, r);
}
async function Gp(e, t) {
  const r = await ii(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await Yp(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && $d && Ud) {
    const [d, o] = l.split(",");
    let h = 0, p = !1;
    if (s === "image/png") {
      const b = zd(o);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, p = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let b = 0; b < g.length; b++)
      g[b] = f.charCodeAt(b);
    const x = s === "image/png" ? Od(g, a, p) : Ad(g, a), v = window.btoa(String.fromCharCode(...x));
    l = [d, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Xp(e, t) {
  return Gp(
    await ii(e, { ...t, type: "image/png" })
  );
}
const Kp = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Jp = 8e3, Zp = 16384, pa = 4096, Qp = 16e6, eh = 500, th = 1e4, Li = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", Tc = 600, rh = 1200, nh = 24, ih = 1024, yt = 32, sh = 4, Ac = 400, oh = 0.985, ah = 250;
function _c(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function lh(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return _c(r, location.origin);
}
function ch(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && _c(t.src || "", location.origin)) return !0;
  let n;
  try {
    n = getComputedStyle(t);
  } catch {
    return !1;
  }
  if (n.display === "none" || Number(n.opacity) === 0) return !0;
  let i;
  try {
    i = t.getBoundingClientRect();
  } catch {
    return !1;
  }
  const s = window.scrollX || window.pageXOffset || 0, a = window.scrollY || window.pageYOffset || 0;
  return i.right + s <= 0 || i.bottom + a <= 0;
}
function Oi(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function ha(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function uh(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(pa / i, pa / s), l = Math.min(a, c, Math.sqrt(Qp / (i * s))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(s * l));
    const o = d.getContext("2d");
    if (!o) return { dataUrl: Li, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + eh;
    let p = 0;
    const u = () => p >= th || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (p++, !x && t && !t(g))) return;
      const v = getComputedStyle(g);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const b = g.getBoundingClientRect(), S = b.left - n.left, w = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        ha(v.backgroundColor) || (o.fillStyle = v.backgroundColor, o.fillRect(S, w, b.width, b.height));
        const C = parseFloat(v.borderTopWidth);
        C > 0 && v.borderTopStyle !== "none" && !ha(v.borderTopColor) && (o.strokeStyle = v.borderTopColor, o.lineWidth = C, o.strokeRect(S, w, b.width, b.height)), g.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(S, w, b.width, b.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(S, w, b.width, b.height));
      }
      for (const C of Array.from(g.childNodes)) {
        if (u()) break;
        if (C instanceof HTMLElement) {
          m(C);
          continue;
        }
        if (!(C.nodeType !== Node.TEXT_NODE || !((k = C.textContent) != null && k.trim())))
          try {
            const L = document.createRange();
            L.selectNodeContents(C);
            const D = L.getBoundingClientRect();
            if (D.width <= 0 || D.height <= 0) continue;
            o.save(), o.beginPath(), o.rect(D.left - n.left, D.top - n.top, D.width, D.height), o.clip(), o.fillStyle = v.color, o.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, o.textBaseline = "top", o.fillText(C.textContent.trim(), D.left - n.left, D.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: Li, scale: 1 };
  } catch {
    return { dataUrl: Li, scale: 1 };
  }
}
function dh() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Ni(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function ph(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < nh; s++) {
    const a = i[s];
    if (!a || a.complete) continue;
    let c;
    try {
      c = a.getBoundingClientRect();
    } catch {
      continue;
    }
    c.bottom < 0 || c.right < 0 || c.top > r || c.left > t || n.push(a);
  }
  return n;
}
async function fa(e, t = Tc) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Ni(i.ready, n());
    const s = ph(e);
    s.length && await Ni(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Ni(dh(), Math.min(n(), 50));
  } catch {
  }
}
function Ic(e, t) {
  return new Promise((r) => {
    if (typeof Image > "u") {
      r(null);
      return;
    }
    let n = !1;
    const i = new Image(), s = (c) => {
      n || (n = !0, r(c ? i : null));
    }, a = setTimeout(() => s(!1), Math.max(0, t));
    i.onload = () => {
      clearTimeout(a), s(!0);
    }, i.onerror = () => {
      clearTimeout(a), s(!1);
    };
    try {
      i.src = e;
    } catch {
      clearTimeout(a), s(!1);
    }
  });
}
async function hh(e) {
  if (typeof document > "u") return null;
  const t = await Ic(e, Ac);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = yt, r.height = yt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, yt, yt);
    const { data: i } = n.getImageData(0, 0, yt, yt);
    let s = 0, a = 0, c = 0;
    for (let d = 0; d < i.length; d += 4) {
      const o = i[d + 3] / 255, h = i[d] * o + 255 * (1 - o), p = i[d + 1] * o + 255 * (1 - o), u = i[d + 2] * o + 255 * (1 - o), m = 0.299 * h + 0.587 * p + 0.114 * u;
      a += m, c += m * m, s++;
    }
    if (!s) return null;
    const l = a / s;
    return c / s - l * l;
  } catch {
    return null;
  }
}
async function Pi(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= ih) return !0;
  try {
    const i = await hh(e);
    if (i !== null && i <= sh) return !0;
  } catch {
  }
  return !1;
}
async function fh(e) {
  if (typeof document > "u") return null;
  const t = await Ic(e, Ac);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = yt, r.height = yt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, yt, yt);
    const { data: i } = n.getImageData(0, 0, yt, yt);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * o + 0.114 * h >= ah && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function mh(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await fh(e);
    if (r !== null && r >= oh) return !0;
  } catch {
  }
  return !1;
}
const gh = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], yh = /* @__PURE__ */ new Set([
  "sans-serif",
  "serif",
  "monospace",
  "system-ui",
  "cursive",
  "fantasy",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "-apple-system",
  "blinkmacsystemfont"
]);
function bh(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function vh(e) {
  const t = (e || "").toLowerCase();
  return gh.some((r) => t.includes(r));
}
const kh = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function wh(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : kh.test(t);
}
function xh(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = bh(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(vh(r) || n && !yh.has(n) && t.includes("_") && wh(t));
}
function Sh(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    xh({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const $n = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Ch = 3e3, Eh = 4e3, ma = 24, ga = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Mh(e, t = Eh) {
  if (typeof fetch != "function") return null;
  const r = typeof AbortController == "function" ? new AbortController() : null, n = r ? setTimeout(() => {
    try {
      r.abort();
    } catch {
    }
  }, t) : null;
  try {
    const i = await fetch(e, { signal: r == null ? void 0 : r.signal, cache: "force-cache", mode: "cors", credentials: "omit" });
    if (!i || !i.ok) return null;
    const s = await i.blob();
    return await new Promise((a) => {
      try {
        const c = new FileReader();
        c.onload = () => a(typeof c.result == "string" ? c.result : null), c.onerror = () => a(null), c.readAsDataURL(s);
      } catch {
        a(null);
      }
    });
  } catch {
    return null;
  } finally {
    n && clearTimeout(n);
  }
}
function Rh(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < ma; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < ma; l++) {
        const d = c[l];
        if (!(d && (((n = d.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || d.type === 5))) continue;
        let h = "", p = "";
        try {
          h = (((i = d.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), p = ((s = d.style) == null ? void 0 : s.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !p || t.push({ cssText: d.cssText, family: h, src: p });
      }
  }
  return t;
}
function Th(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ah(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Th(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function _h(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Rh(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => Mh(c)), a = [];
  for (const c of n) {
    const l = [];
    ga.lastIndex = 0;
    let d;
    for (; (d = ga.exec(c.src)) !== null; ) {
      const u = d[2];
      u && !u.startsWith("data:") && l.push(u);
    }
    if (!l.length) {
      a.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let o = c.cssText, h = !1;
    const p = await Promise.all(l.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await s(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of p)
      m && (o = Ah(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Ih() {
  try {
    return await Promise.race([
      _h({}).catch(() => $n),
      new Promise((e) => setTimeout(() => e($n), Ch))
    ]);
  } catch {
    return $n;
  }
}
function Lh(e, t) {
  return new Promise((r, n) => {
    const i = setTimeout(() => n(new Error(`capture timed out after ${t}ms`)), t);
    e.then(
      (s) => {
        clearTimeout(i), r(s);
      },
      (s) => {
        clearTimeout(i), n(s);
      }
    );
  });
}
async function Oh(e, t = {}) {
  return (await Nh(e, t)).dataUrl;
}
async function Nh(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? $n : await Ih(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Lh(Xp(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (p) => Sh(p, c.embeddedFamilies),
      maximumCanvasSize: Zp,
      fetch: { placeholderImage: Kp },
      filter: (p) => n && !n(p) || ch(p) ? !1 : lh(p) ? (r++, !1) : !0
    }), Jp);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await fa(e, Tc);
  try {
    let o = await d(), h = await Pi(o);
    if (h) {
      await fa(e, rh);
      try {
        const u = await d();
        await Pi(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && Oi(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Oi("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = h ? !1 : await mh(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: p, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    Oi(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const p = uh(e, n, a), u = await Pi(p.dataUrl);
    return { ...p, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const Ph = {
  "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" />',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" /> <path d="M8 16h.01" />',
  dna: '<path d="m10 16 1.5 1.5" /> <path d="m14 8-1.5-1.5" /> <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" /> <path d="m16.5 10.5 1 1" /> <path d="m17 6-2.891-2.891" /> <path d="M2 15c6.667-6 13.333 0 20-6" /> <path d="m20 9 .891.891" /> <path d="M3.109 14.109 4 15" /> <path d="m6.5 12.5 1 1" /> <path d="m7 18 2.891 2.891" /> <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />',
  bug: '<path d="M12 20v-9" /> <path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" /> <path d="M14.12 3.88 16 2" /> <path d="M21 21a4 4 0 0 0-3.81-4" /> <path d="M21 5a4 4 0 0 1-3.55 3.97" /> <path d="M22 13h-4" /> <path d="M3 21a4 4 0 0 1 3.81-4" /> <path d="M3 5a4 4 0 0 0 3.55 3.97" /> <path d="M6 13H2" /> <path d="m8 2 1.88 1.88" /> <path d="M9 7.13V6a3 3 0 1 1 6 0v1.13" />',
  search: '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" />',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  sun: '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />',
  "mouse-pointer-2": '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />',
  "eye-off": '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /> <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /> <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /> <path d="m2 2 20 20" />',
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />',
  meh: '<circle cx="12" cy="12" r="10" /> <line x1="8" x2="16" y1="15" y2="15" /> <line x1="9" x2="9.01" y1="9" y2="9" /> <line x1="15" x2="15.01" y1="9" y2="9" />',
  angry: '<circle cx="12" cy="12" r="10" /> <path d="M16 16s-1.5-2-4-2-4 2-4 2" /> <path d="M7.5 8 10 9" /> <path d="m14 9 2.5-1" /> <path d="M9 10h.01" /> <path d="M15 10h.01" />',
  frown: '<circle cx="12" cy="12" r="10" /> <path d="M16 16s-1.5-2-4-2-4 2-4 2" /> <line x1="9" x2="9.01" y1="9" y2="9" /> <line x1="15" x2="15.01" y1="9" y2="9" />',
  check: '<path d="M20 6 9 17l-5-5" />',
  "check-circle": '<path d="M21.801 10A10 10 0 1 1 17 3.335" /> <path d="m9 11 3 3L22 4" />',
  x: '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',
  "x-circle": '<circle cx="12" cy="12" r="10" /> <path d="m15 9-6 6" /> <path d="m9 9 6 6" />',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" />',
  mic: '<path d="M12 19v3" /> <path d="M19 10v2a7 7 0 0 1-14 0v-2" /> <rect x="9" y="2" width="6" height="13" rx="3" />',
  puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />',
  sprout: '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /> <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /> <path d="M5 21h14" />',
  camera: '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /> <circle cx="12" cy="13" r="3" />',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /> <circle cx="9" cy="9" r="2" /> <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /> <circle cx="12" cy="10" r="3" />',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2" /> <line x1="8" x2="16" y1="21" y2="21" /> <line x1="12" x2="12" y1="17" y2="21" />',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',
  scissors: '<circle cx="6" cy="6" r="3" /> <path d="M8.12 8.12 12 12" /> <path d="M20 4 8.12 15.88" /> <circle cx="6" cy="18" r="3" /> <path d="M14.8 14.8 20 20" />',
  square: '<rect width="18" height="18" x="3" y="3" rx="2" />',
  "trash-2": '<path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  chrome: '<path d="M10.88 21.94 15.46 14" /> <path d="M21.17 8H12" /> <path d="M3.95 6.06 8.54 14" /> <circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="4" />',
  "app-window": '<rect x="2" y="4" width="20" height="16" rx="2" /> <path d="M10 4v4" /> <path d="M2 8h20" /> <path d="M6 4v4" />',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />',
  plug: '<path d="M12 22v-5" /> <path d="M9 8V2" /> <path d="M15 8V2" /> <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /> <path d="M13 5v2" /> <path d="M13 17v2" /> <path d="M13 11v2" />',
  "message-circle": '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" />',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /> <circle cx="12" cy="12" r="3" />',
  "radio-tower": '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9" /> <path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5" /> <circle cx="12" cy="9" r="2" /> <path d="M16.2 4.8c2 2 2.26 5.11.8 7.47" /> <path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1" /> <path d="M9.5 18h5" /> <path d="m8 22 4-11 4 11" />',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  plus: '<path d="M5 12h14" /> <path d="M12 5v14" />',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" />',
  paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />',
  "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /> <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /> <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /> <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />',
  footprints: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /> <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /> <path d="M16 17h4" /> <path d="M4 13h4" />',
  satellite: '<path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5" /> <path d="M16.5 7.5 19 5" /> <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5" /> <path d="M9 21a6 6 0 0 0-6-6" /> <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z" />',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
  pause: '<rect x="14" y="3" width="5" height="18" rx="1" /> <rect x="5" y="3" width="5" height="18" rx="1" />',
  "rotate-cw": '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" />',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />',
  bot: '<path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" />',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />',
  "chevron-left": '<path d="m15 18-6-6 6-6" />',
  "chevron-right": '<path d="m9 18 6-6-6-6" />',
  clock: '<path d="M12 6v6l4 2" /> <circle cx="12" cy="12" r="10" />',
  loader: '<path d="M12 2v4" /> <path d="m16.2 7.8 2.9-2.9" /> <path d="M18 12h4" /> <path d="m16.2 16.2 2.9 2.9" /> <path d="M12 18v4" /> <path d="m4.9 19.1 2.9-2.9" /> <path d="M2 12h4" /> <path d="m4.9 4.9 2.9 2.9" />',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1" /> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /> <path d="M10 12h4" />',
  "user-check": '<path d="m16 11 2 2 4-4" /> <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" />'
};
function Dh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ee(e, t = {}) {
  const r = Ph[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${Dh(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const Lc = "https://klavity.in", Mr = {
  integration: "jira",
  backendUrl: "",
  autoFileErrors: !1,
  connectionMode: "direct",
  klavToken: "",
  jira: { baseUrl: "", email: "", token: "", projectKey: "" },
  linear: { apiKey: "", teamId: "" },
  github: { token: "", repo: "" },
  plane: { token: "", host: "https://api.plane.so", workspace: "", projectId: "" }
};
function Di(e, t, r) {
  const n = r > 0 && Number.isFinite(r) ? r : 1 / 0, i = [];
  for (const s of String(t ?? "").split(`
`)) {
    if (!s.length) {
      i.push("");
      continue;
    }
    let a = "";
    for (const c of s.split(" ")) {
      let l = c;
      const d = a ? " " : "";
      if (a && e(a + d + l) <= n) {
        a += d + l;
        continue;
      }
      for (a && (i.push(a), a = ""); l.length > 1 && e(l) > n; ) {
        let o = 1, h = l.length, p = 1;
        for (; o <= h; ) {
          const u = o + h >> 1;
          e(l.slice(0, u)) <= n ? (p = u, o = u + 1) : h = u - 1;
        }
        i.push(l.slice(0, p)), l = l.slice(p);
      }
      a = l;
    }
    i.push(a);
  }
  return i.length ? i : [""];
}
function xn(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function zh(e) {
  const t = (e || "").trim(), r = t.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(r))
    return [parseInt(r[0] + r[0], 16), parseInt(r[1] + r[1], 16), parseInt(r[2] + r[2], 16)];
  if (/^[0-9a-fA-F]{6}$/.test(r))
    return [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)];
  const n = t.match(/rgba?\(([^)]+)\)/i);
  if (n) {
    const i = n[1].split(",").map((s) => parseFloat(s));
    if (i.length >= 3 && i.every((s) => !Number.isNaN(s))) return [i[0], i[1], i[2]];
  }
  return null;
}
function Fh(e) {
  const t = zh(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function zi(e) {
  return Fh(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class ya {
  constructor(t, r) {
    this.shapes = [], this.strokeScale = 1, this.baseImg = null, this.canvas = t, this.imageDataUrl = r;
  }
  computeLineWidth() {
    return Math.max(3, this.canvas.width / 400) * this.strokeScale;
  }
  computeFontSize() {
    return Math.max(16, this.canvas.width / 60);
  }
  addShape(t) {
    this.shapes.push(t), this.redraw();
  }
  undo() {
    this.shapes.pop(), this.redraw();
  }
  clearAll() {
    this.shapes.length = 0, this.redraw();
  }
  redraw() {
    if (typeof Image > "u") return;
    const t = this.canvas.getContext("2d");
    if (!t) return;
    if (this.baseImg && this.baseImg.complete && this.baseImg.naturalWidth) {
      this.paint(t, this.baseImg);
      return;
    }
    const r = new Image();
    r.onload = () => {
      this.baseImg = r, this.paint(t, r);
    }, r.src = this.imageDataUrl;
  }
  paint(t, r, n) {
    t.clearRect(0, 0, this.canvas.width, this.canvas.height), t.drawImage(r, 0, 0), this.shapes.forEach((i) => this.drawShape(t, i)), n && this.drawShape(t, n);
  }
  /** KLAVITYKLA-507: live rubber-band preview during a drag — base image + committed shapes + ONE
   *  provisional shape, WITHOUT mutating the shape history. Synchronous when the base bitmap has already
   *  decoded; otherwise falls back to a plain redraw (which will cache the bitmap for the next move). */
  drawPreview(t) {
    if (typeof Image > "u") return;
    const r = this.canvas.getContext("2d");
    r && (this.baseImg && this.baseImg.complete && this.baseImg.naturalWidth ? this.paint(r, this.baseImg, t) : this.redraw());
  }
  /** Total extra width (px) of the contrasting halo relative to the colour stroke — split half each side,
   *  so it reads as a ~1-1.5px contrasting edge at the base weight and scales subtly for thick strokes. */
  haloPad(t) {
    return Math.max(3, t * 0.55);
  }
  /** Draw a stroked path TWICE: first a slightly-wider contrasting halo underneath, then the colour on top,
   *  so the mark stays visible on any background (incl. a white line on white). `buildPath` must (re)issue
   *  the path commands each call. */
  strokeWithHalo(t, r, n, i) {
    const s = zi(r);
    t.lineWidth = n + this.haloPad(n), t.strokeStyle = s, i(), t.stroke(), t.lineWidth = n, t.strokeStyle = r, i(), t.stroke();
  }
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(), t.lineCap = "round", t.lineJoin = "round", r.type === "pen") {
      const n = this.computeLineWidth();
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), r.points.forEach(
          (i, s) => s === 0 ? t.moveTo(i.x, i.y) : t.lineTo(i.x, i.y)
        );
      });
    } else if (r.type === "rect") {
      const n = this.computeLineWidth();
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = zi(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
    } else if (r.type === "arrow") {
      const n = this.computeLineWidth() * 1.7, i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), s = Math.max(16, n * 4);
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
          r.x2 - s * Math.cos(i - Math.PI / 6),
          r.y2 - s * Math.sin(i - Math.PI / 6)
        ), t.moveTo(r.x2, r.y2), t.lineTo(
          r.x2 - s * Math.cos(i + Math.PI / 6),
          r.y2 - s * Math.sin(i + Math.PI / 6)
        );
      });
    } else if (r.type === "line") {
      const n = this.computeLineWidth() * 1.7;
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2);
      });
    } else if (r.type === "circle") {
      const n = this.computeLineWidth();
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.ellipse(r.x, r.y, Math.abs(r.rx), Math.abs(r.ry), 0, 0, Math.PI * 2);
      });
    } else if (r.type === "count") {
      const n = Math.max(13, this.computeFontSize());
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = zi(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = Di((o) => xn(t, o), r.text, a), l = s * 1.25, d = r.outline ?? "none";
      c.forEach((o, h) => {
        const p = i + h * l;
        d !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, s * 0.18), t.strokeStyle = d === "white" ? "#ffffff" : "#111111", t.strokeText(o, n, p)), t.fillStyle = r.color, t.fillText(o, n, p);
      }), t.textBaseline = "alphabetic";
    } else r.type === "pixelate" && this.drawPixelate(t, r);
  }
  /** Redaction: replace the pixels inside the region with a coarse mosaic (block-averaged colours). Reads
   *  back what's already painted (base image + any earlier shapes) so the redaction bakes into save()/export.
   *  No-ops safely on headless/tainted canvases (getImageData throws) — the region just isn't redacted. */
  drawPixelate(t, r) {
    const n = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), i = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), s = Math.min(this.canvas.width - n, Math.ceil(Math.abs(r.w))), a = Math.min(this.canvas.height - i, Math.ceil(Math.abs(r.h)));
    if (s <= 0 || a <= 0) return;
    const c = Math.max(8, Math.round(this.canvas.width / 90));
    let l;
    try {
      l = t.getImageData(n, i, s, a);
    } catch {
      l = void 0;
    }
    if (!l || !l.data) {
      t.fillStyle = "rgba(30,30,40,1)", t.fillRect(n, i, s, a);
      return;
    }
    const d = l.data;
    for (let o = 0; o < a; o += c)
      for (let h = 0; h < s; h += c) {
        let p = 0, u = 0, m = 0, f = 0;
        const g = Math.min(o + c, a), x = Math.min(h + c, s);
        for (let v = o; v < g; v++)
          for (let b = h; b < x; b++) {
            const S = (v * s + b) * 4;
            p += d[S], u += d[S + 1], m += d[S + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(p / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + o, x - h, g - o));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), a = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, Di((h) => xn(r, h), t.text, a).length));
    const d = l * c, o = Math.max(0, Math.min(t.y, Math.max(0, this.canvas.height - d)));
    return { x: s, y: o, size: n, maxW: a };
  }
  /** KLA-770: the image-pixel bounding box of a committed text shape (accounting for the clamp + wrap), used
   *  by the inline annotator to hit-test a click for drag/resize. Returns null for non-text shapes or when no
   *  2D context is available (headless envs). */
  textBounds(t) {
    if (t.type !== "text") return null;
    const r = this.canvas.getContext("2d");
    if (!r || typeof r.measureText != "function") return null;
    const { x: n, y: i, size: s, maxW: a } = this.textAnchor(t, r);
    r.font = `bold ${s}px sans-serif`;
    const c = Di((p) => xn(r, p), t.text, a);
    let l = 0;
    for (const p of c) l = Math.max(l, xn(r, p));
    const d = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(d, c.length * d), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function $h(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: Lc }, i = {
    type: e.type,
    description: e.description,
    context: e.context,
    screenshots: e.screenshots,
    settings: n,
    ...e.projectId ? { projectId: e.projectId } : {},
    // KLA-729: forward the full evidence set so the backend integration reaches widget parity. All optional —
    // absent fields are simply undefined on IntegrationConfig and the serializer skips them.
    title: e.title,
    kind: e.kind,
    files: e.files,
    recordings: e.recordings,
    reporter: e.reporter,
    clientInfo: e.clientInfo,
    annotations: e.annotations,
    reporterEmail: e.reporterEmail,
    referrer: e.referrer,
    screenshotThumbs: e.screenshotThumbs,
    replayEvents: e.replayEvents
  };
  if (!r.backend)
    throw new Error("No backend handler: cannot submit report (client-direct mode removed — KLA-720)");
  return r.backend(i);
}
const Uh = 50, Bh = 2e3, qh = 1e3, Wh = 500, ba = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Sn(e, t) {
  e.push(t), e.length > Uh && e.shift();
}
function oo(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Fi(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      ba.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => ba.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return oo(t, qh);
}
function Hh(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return oo(JSON.stringify(e), Wh);
  } catch {
    return String(e);
  }
}
function jh(e, t = {}) {
  const r = {
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    consoleErrors: [...e.consoleErrors],
    networkFailures: [...e.networkFailures]
  };
  return t.identity && Object.keys(t.identity).length && (r.identity = t.identity), t.metadata && Object.keys(t.metadata).length && (r.metadata = t.metadata), r;
}
function Vh(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, o) => {
    Sn(e.consoleErrors, { message: oo(d, Bh), stack: o, timestamp: Date.now(), level: l });
  }, s = window.onerror;
  if (window.onerror = (l, d, o, h, p) => {
    var u;
    if (n()) {
      const m = String(l);
      i("error", m, p == null ? void 0 : p.stack), (u = t.onError) == null || u.call(t, m, p == null ? void 0 : p.stack);
    }
    return typeof s == "function" ? s.call(window, l, d, o, h, p) : !1;
  }, window.addEventListener("unhandledrejection", (l) => {
    var h;
    if (!n()) return;
    const d = l.reason, o = String((d == null ? void 0 : d.message) ?? d);
    i("error", o, d == null ? void 0 : d.stack), (h = t.onError) == null || h.call(t, o, d == null ? void 0 : d.stack);
  }), t.consoleLevels) {
    const l = ["log", "info", "warn", "error"];
    for (const d of l) {
      const o = console[d];
      typeof o == "function" && (console[d] = (...h) => {
        try {
          n() && i(d, h.map(Hh).join(" "));
        } catch {
        }
        return o.apply(console, h);
      });
    }
  }
  const a = window.fetch;
  window.fetch = async (...l) => {
    var p;
    if (!n()) return a(...l);
    const d = Date.now(), o = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (p = l[1]) == null ? void 0 : p.method) || "GET";
    try {
      const u = await a(...l);
      return Sn(e.networkFailures, { url: Fi(o), status: u.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    } catch (u) {
      throw Sn(e.networkFailures, { url: Fi(o), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, d = c.prototype.send;
    c.prototype.open = function(o, h, ...p) {
      return this.__klav = { method: String(o || "GET").toUpperCase(), url: String(h || "") }, l.call(this, o, h, ...p);
    }, c.prototype.send = function(...o) {
      const h = this.__klav;
      if (h && n()) {
        const p = Date.now();
        this.addEventListener("loadend", () => {
          try {
            Sn(e.networkFailures, {
              url: Fi(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: p,
              durationMs: Date.now() - p
            });
          } catch {
          }
        });
      }
      return d.apply(this, o);
    };
  }
  return e;
}
const Yh = ["light", "dark", "glass", "neon", "custom", "liquid"], Gh = ["hidden", "icon", "full", "custom"], Xh = ["lightbulb", "bug"], Kh = ["full", "reportOnly", "off"], Jh = /^#[0-9a-fA-F]{3,8}$/, Zh = /^[\w \-,'"().]+$/, va = (e) => typeof e == "object" && e !== null, Cn = (e) => typeof e == "string" && Jh.test(e.trim()) ? e.trim() : void 0, En = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Qh = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Zh.test(t) ? t : void 0;
}, ka = {
  // Default = the marketing home surface: warm cream paper with Klavity-purple and amber atmosphere.
  // The panel is intentionally not stark white; chips/inputs are only a step lighter for affordance.
  light: {
    "--kl-overlay": "var(--ink-overlay, rgba(28,22,40,.30))",
    "--kl-bg": "var(--ink, #f5f3ee)",
    "--kl-fg": "var(--paper, #19140f)",
    "--kl-muted": "var(--paper-dim, #574f45)",
    "--kl-border": "var(--line, rgba(25,20,15,.12))",
    "--kl-chip": "var(--ink-2, #fffdf8)",
    "--kl-input-bg": "var(--ink-2, #fffdf8)",
    "--kl-accent": "var(--accent, #6366f1)",
    "--kl-on-accent": "var(--accent-on, #fff)",
    "--kl-accent2": "var(--accent2, var(--amber, #d98324))",
    "--kl-radius": "16px",
    "--kl-shadow": "0 24px 60px rgba(40,28,70,.18), 0 10px 30px rgba(99,102,241,.10)",
    "--kl-backdrop": "none"
  },
  dark: { "--kl-overlay": "rgba(0,0,0,.5)", "--kl-bg": "#1e1e2e", "--kl-fg": "#cdd6f4", "--kl-muted": "#a6adc8", "--kl-border": "#45475a", "--kl-chip": "#313244", "--kl-input-bg": "#181825", "--kl-accent": "#89b4fa", "--kl-on-accent": "#1e1e2e", "--kl-accent2": "#fab387", "--kl-radius": "12px", "--kl-shadow": "0 20px 60px rgba(0,0,0,.5)", "--kl-backdrop": "none" },
  glass: { "--kl-overlay": "rgba(10,10,18,.25)", "--kl-bg": "rgba(255,255,255,.14)", "--kl-fg": "#fff", "--kl-muted": "rgba(255,255,255,.7)", "--kl-border": "rgba(255,255,255,.28)", "--kl-chip": "rgba(255,255,255,.16)", "--kl-input-bg": "rgba(255,255,255,.10)", "--kl-accent": "rgba(255,255,255,.92)", "--kl-on-accent": "#15121d", "--kl-accent2": "rgba(255,255,255,.55)", "--kl-radius": "22px", "--kl-shadow": "0 24px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.25)", "--kl-backdrop": "blur(22px) saturate(180%)" },
  neon: { "--kl-overlay": "rgba(8,4,20,.55)", "--kl-bg": "#0e0b1e", "--kl-fg": "#f4f0ff", "--kl-muted": "#a99fd6", "--kl-border": "#3a2d6b", "--kl-chip": "#1c1640", "--kl-input-bg": "#140f2c", "--kl-accent": "#ff2d95", "--kl-on-accent": "#fff", "--kl-accent2": "#15e0ff", "--kl-radius": "14px", "--kl-shadow": "0 0 0 1px rgba(255,45,149,.4), 0 24px 70px rgba(255,45,149,.25)", "--kl-backdrop": "none" },
  // 'liquid' on a real page can't do clone-refraction; render as frosted glass.
  liquid: { "--kl-overlay": "rgba(10,10,18,.25)", "--kl-bg": "rgba(255,255,255,.10)", "--kl-fg": "#fff", "--kl-muted": "rgba(255,255,255,.7)", "--kl-border": "rgba(255,255,255,.4)", "--kl-chip": "rgba(255,255,255,.16)", "--kl-input-bg": "rgba(255,255,255,.08)", "--kl-accent": "rgba(255,255,255,.92)", "--kl-on-accent": "#15121d", "--kl-accent2": "rgba(255,255,255,.55)", "--kl-radius": "22px", "--kl-shadow": "0 30px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)", "--kl-backdrop": "blur(14px) saturate(170%)" }
};
function wa(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Oc(e) {
  const t = va(e) ? e : {}, n = { theme: typeof t.theme == "string" && Yh.includes(t.theme) ? t.theme : "light" }, i = Cn(t.primary), s = Cn(t.secondary), a = Cn(t.background), c = En(t.thankYou, 140), l = Qh(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Gh.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = En(t.launcherText, 60);
  d && (n.launcherText = d);
  const o = Cn(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && Xh.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Kh.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = En(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const p = va(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || p.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = En(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function ef(e) {
  const t = Oc(e), r = t.theme === "custom" ? { ...ka.light } : { ...ka[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = wa(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && wa(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
const Qe = class Qe {
  constructor() {
    this.onTranscript = (t) => {
    }, this.onError = (t, r) => {
    }, this.onStop = () => {
    }, this.onStatus = (t, r) => {
    }, this._recognition = null, this._timer = null, this._retryTimer = null, this._recording = !1, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0;
  }
  static isSupported() {
    return typeof window < "u" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  }
  start() {
    this._recording || !Qe.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), Qe.SESSION_MS), this._begin());
  }
  // Spin up a fresh SpeechRecognition instance. Called on start() and again on every auto-restart (a
  // silence timeout, an unexpected end, or a reconnect after a transient error) so a dropped backend
  // reconnects transparently while _recording stays true.
  _begin() {
    if (!this._recording) return;
    const t = window.SpeechRecognition ?? window.webkitSpeechRecognition, r = new t();
    this._recognition = r, r.continuous = !0, r.interimResults = !1, r.lang = typeof document < "u" && document.documentElement.lang || "en-US", r.onstart = () => {
      this._recovered();
    }, r.onresult = (n) => {
      this._recovered();
      for (let i = n.resultIndex; i < n.results.length; i++)
        n.results[i].isFinal && this.onTranscript(n.results[i][0].transcript);
    }, r.onerror = (n) => {
      if (this._stopping || !this._recording) return;
      const i = n == null ? void 0 : n.error;
      if (i && i in Qe.TERMINAL_ERRORS) {
        this.onError(i, Qe.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > Qe.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? Qe.BENIGN_RESTART_MS : Math.min(Qe.MAX_BACKOFF_MS, Qe.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
      this._retryTimer = setTimeout(() => {
        this._retryTimer = null, this._begin();
      }, n);
    };
    try {
      r.start();
    } catch {
    }
  }
  // Recognition (re)connected — clear the consecutive-failure budget and any reconnecting status.
  _recovered() {
    this._consecFailures = 0, this._showedReconnecting && (this._showedReconnecting = !1, this.onStatus("idle", ""));
  }
  stop() {
    if (this._recording) {
      if (this._recording = !1, this._stopping = !0, this._clearTimers(), this._recognition)
        try {
          this._recognition.stop();
        } catch {
        }
      this._emitStop();
    }
  }
  // Tear down after an unrecoverable error (no user stop): release + notify exactly once.
  _teardown() {
    this._recording = !1, this._stopping = !0, this._clearTimers(), this._recognition = null, this._emitStop();
  }
  _emitStop() {
    this._stopFired || (this._stopFired = !0, this.onStop());
  }
  _clearTimers() {
    this._timer !== null && (clearTimeout(this._timer), this._timer = null), this._retryTimer !== null && (clearTimeout(this._retryTimer), this._retryTimer = null);
  }
};
Qe.MAX_CONSEC_FAILURES = 6, Qe.BASE_BACKOFF_MS = 400, Qe.MAX_BACKOFF_MS = 8e3, Qe.BENIGN_RESTART_MS = 250, Qe.SESSION_MS = 18e4, Qe.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Jr = Qe;
function tf() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const rf = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Nc(e) {
  for (const t of rf)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Nr = class Nr {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...tf(), ...t.deps || {} };
  }
  // Feature-detect: mic capture + MediaRecorder. False on iOS Safari / anywhere without MediaRecorder.
  static isSupported(t = {}) {
    const r = typeof navigator < "u" ? navigator.mediaDevices : void 0, n = !!(t.getUserMedia || r && typeof r.getUserMedia == "function"), i = t.MediaRecorder ?? globalThis.MediaRecorder;
    return n && typeof i < "u";
  }
  async start() {
    var r;
    if (this._recording) return;
    this._recording = !0, this._firstSegment = !0;
    let t;
    try {
      t = await this._deps.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !0 } });
    } catch (n) {
      this._recording = !1;
      const i = (n == null ? void 0 : n.name) === "NotAllowedError" || (n == null ? void 0 : n.name) === "SecurityError";
      this.onError(i ? "not-allowed" : "mic-error", i ? "Microphone access was denied" : "Could not access the microphone"), this.onStop();
      return;
    }
    if (!this._recording) {
      try {
        (r = t == null ? void 0 : t.getTracks) == null || r.call(t).forEach((n) => {
          var i;
          return (i = n.stop) == null ? void 0 : i.call(n);
        });
      } catch {
      }
      return;
    }
    this._stream = t, this._mime = Nc(this._deps);
    try {
      this._recorder = this._mime ? new this._deps.MediaRecorder(this._stream, { mimeType: this._mime }) : new this._deps.MediaRecorder(this._stream);
    } catch {
      try {
        this._recorder = new this._deps.MediaRecorder(this._stream);
      } catch {
        this._teardown(!0), this.onError("mic-error", "Recording is not supported here");
        return;
      }
    }
    this._recorder.ondataavailable = (n) => {
      n != null && n.data && n.data.size && this._chunks.push(n.data);
    }, this._recorder.onstop = () => {
      this._flushSegment();
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Nr.MAX_SESSION_MS), this._beginSegment();
  }
  _beginSegment() {
    if (!(!this._recording || !this._recorder)) {
      this._chunks = [];
      try {
        this._recorder.start();
      } catch {
      }
      this._segTimer = this._deps.setTimeout(() => {
        try {
          this._recorder && this._recorder.state !== "inactive" && this._recorder.stop();
        } catch {
        }
      }, Nr.SEGMENT_MS);
    }
  }
  async _flushSegment() {
    this._segTimer != null && (this._deps.clearTimeout(this._segTimer), this._segTimer = null);
    const t = this._chunks;
    this._chunks = [];
    const r = this._firstSegment;
    this._firstSegment = !1;
    const n = this._recording;
    if (t.length) {
      const i = new Blob(t, { type: (this._mime || "audio/webm").split(";")[0] });
      let s = null;
      try {
        s = await this._transcribe(i);
      } catch {
        s = null;
      }
      if (s === null) {
        if (r) {
          this._teardown(!1), this.onUnavailable();
          return;
        }
        this.onStatus("retrying", "Reconnecting dictation…");
      } else {
        this._firstSegment === !1 && this.onStatus("idle", "");
        const a = (s.text || "").trim();
        a && this.onTranscript(a);
      }
    }
    n && this._recording ? this._beginSegment() : this._teardown(!0);
  }
  stop() {
    if (!this._recording) return;
    this._recording = !1, this._segTimer != null && (this._deps.clearTimeout(this._segTimer), this._segTimer = null);
    let t = !1;
    try {
      this._recorder && this._recorder.state !== "inactive" && (this._recorder.stop(), t = !0);
    } catch {
    }
    t || this._teardown(!0);
  }
  _teardown(t) {
    var r, n;
    this._recording = !1, this._segTimer != null && (this._deps.clearTimeout(this._segTimer), this._segTimer = null), this._sessTimer != null && (this._deps.clearTimeout(this._sessTimer), this._sessTimer = null);
    try {
      (n = (r = this._stream) == null ? void 0 : r.getTracks) == null || n.call(r).forEach((i) => {
        var s;
        return (s = i.stop) == null ? void 0 : s.call(i);
      });
    } catch {
    }
    this._stream = null, this._recorder && (this._recorder.ondataavailable = null, this._recorder.onstop = null, this._recorder = null), t && this.onStop();
  }
};
Nr.SEGMENT_MS = 5e3, Nr.MAX_SESSION_MS = 18e4;
let Hn = Nr;
function nf() {
  const e = globalThis, t = e.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    WebSocket: e.WebSocket,
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Ve = class Ve {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...nf(), ...t.deps || {} };
  }
  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(t = {}) {
    const r = globalThis, n = typeof navigator < "u" ? navigator.mediaDevices : void 0, i = !!(t.getUserMedia || n && typeof n.getUserMedia == "function"), s = t.MediaRecorder ?? r.MediaRecorder, a = t.WebSocket ?? r.WebSocket;
    return i && typeof s < "u" && typeof a < "u";
  }
  async start() {
    var r;
    if (this._recording) return;
    (this._awaitingFinal || this._ws || this._stream || this._recorder) && this._teardown(!1), this._recording = !0, this._stopped = !1, this._everConnected = !1, this._reconnects = 0, this._awaitingFinal = !1, this._torn = !1, this._stopFired = !1, this._graceTimer != null && (this._deps.clearTimeout(this._graceTimer), this._graceTimer = null), this._flushFallbackTimer != null && (this._deps.clearTimeout(this._flushFallbackTimer), this._flushFallbackTimer = null);
    let t;
    try {
      t = await this._deps.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !0 } });
    } catch (n) {
      this._recording = !1;
      const i = (n == null ? void 0 : n.name) === "NotAllowedError" || (n == null ? void 0 : n.name) === "SecurityError";
      this.onError(i ? "not-allowed" : "mic-error", i ? "Microphone access was denied" : "Could not access the microphone"), this.onStop();
      return;
    }
    if (!this._recording) {
      try {
        (r = t == null ? void 0 : t.getTracks) == null || r.call(t).forEach((n) => {
          var i;
          return (i = n.stop) == null ? void 0 : i.call(n);
        });
      } catch {
      }
      return;
    }
    this._stream = t, this._mime = Nc(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), Ve.MAX_SESSION_MS), this._openSocket();
  }
  _openSocket() {
    if (!this._recording) return;
    this._connected = !1;
    let t;
    try {
      t = new this._deps.WebSocket(this._url);
    } catch {
      this._onDrop();
      return;
    }
    this._ws = t;
    try {
      t.binaryType = "arraybuffer";
    } catch {
    }
    this._connectTimer = this._deps.setTimeout(() => {
      if (!this._connected)
        try {
          t.close();
        } catch {
          this._onDrop();
        }
    }, Ve.CONNECT_TIMEOUT_MS), t.onopen = () => {
      this._startRecorder();
    }, t.onmessage = (r) => {
      let n = null;
      try {
        n = typeof r.data == "string" ? JSON.parse(r.data) : null;
      } catch {
        n = null;
      }
      if (n)
        if (this._connected || (this._connected = !0, this._everConnected = !0, this._reconnects = 0, this._clearConnectTimer(), this._statusShown && (this._statusShown = !1, this.onStatus("idle", ""))), n.type === "interim")
          n.text && this.onInterim(n.text);
        else if (n.type === "final") {
          const i = (n.text || "").trim();
          i && this.onTranscript(i);
        } else n.type;
    }, t.onerror = () => {
    }, t.onclose = () => {
      if (this._clearConnectTimer(), this._ws = null, this._stopped) {
        this._finishGrace();
        return;
      }
      this._onDrop();
    };
  }
  // A socket closed/failed. If we were mid-session and had connected at least once, reconnect with backoff;
  // if we never connected at all → onUnavailable so the host falls back to batch dictation.
  _onDrop() {
    if (this._stopped || !this._recording) {
      this._finishStop();
      return;
    }
    if (!this._everConnected) {
      this._teardown(!1), this.onUnavailable();
      return;
    }
    if (this._reconnects >= Ve.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(Ve.MAX_BACKOFF_MS, Ve.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(Ve.TIMESLICE_MS);
        } catch {
        }
        return;
      }
      try {
        this._recorder = this._mime ? new this._deps.MediaRecorder(this._stream, { mimeType: this._mime }) : new this._deps.MediaRecorder(this._stream);
      } catch {
        try {
          this._recorder = new this._deps.MediaRecorder(this._stream);
        } catch {
          this._teardown(!0), this.onError("mic-error", "Recording is not supported here");
          return;
        }
      }
      this._recorder.ondataavailable = (t) => {
        const r = t == null ? void 0 : t.data;
        if (r && r.size && this._ws)
          try {
            this._ws.send(r);
          } catch {
          }
      };
      try {
        this._recorder.start(Ve.TIMESLICE_MS);
      } catch {
      }
    }
  }
  _stopRecorder() {
    try {
      this._recorder && this._recorder.state !== "inactive" && this._recorder.stop();
    } catch {
    }
  }
  stop() {
    var n;
    if (!this._recording) {
      this._stopped || (this._stopped = !0);
      return;
    }
    this._recording = !1, this._stopped = !0;
    const t = this._ws;
    if (!!t && (t.readyState === 1 || t.readyState === void 0)) {
      let i = !1;
      const s = t, a = () => {
        if (!(i || this._torn || this._ws !== s)) {
          i = !0, this._flushFallbackTimer != null && (this._deps.clearTimeout(this._flushFallbackTimer), this._flushFallbackTimer = null);
          try {
            s.send(JSON.stringify({ type: "stop" }));
          } catch {
          }
          this._awaitingFinal = !0;
        }
      }, c = this._recorder;
      if (c && c.state !== "inactive") {
        try {
          c.onstop = () => a();
        } catch {
        }
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, Ve.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), Ve.STOP_GRACE_MS);
    } else {
      this._stopRecorder();
      try {
        (n = t == null ? void 0 : t.send) == null || n.call(t, JSON.stringify({ type: "stop" }));
      } catch {
      }
      this._teardown(!0);
    }
  }
  // KLA-774: end the post-Stop grace window (final arrived, socket closed, or timeout) and tear down once.
  _finishGrace() {
    this._graceTimer != null && (this._deps.clearTimeout(this._graceTimer), this._graceTimer = null), this._flushFallbackTimer != null && (this._deps.clearTimeout(this._flushFallbackTimer), this._flushFallbackTimer = null), this._awaitingFinal = !1, this._teardown(!0);
  }
  _teardown(t) {
    var r, n;
    if (this._torn) {
      t && this._finishStop();
      return;
    }
    this._torn = !0, this._graceTimer != null && (this._deps.clearTimeout(this._graceTimer), this._graceTimer = null), this._flushFallbackTimer != null && (this._deps.clearTimeout(this._flushFallbackTimer), this._flushFallbackTimer = null), this._awaitingFinal = !1, this._recording = !1, this._clearConnectTimer(), this._sessTimer != null && (this._deps.clearTimeout(this._sessTimer), this._sessTimer = null), this._stopRecorder(), this._recorder && (this._recorder.ondataavailable = null, this._recorder = null);
    try {
      (n = (r = this._stream) == null ? void 0 : r.getTracks) == null || n.call(r).forEach((i) => {
        var s;
        return (s = i.stop) == null ? void 0 : s.call(i);
      });
    } catch {
    }
    if (this._stream = null, this._ws) {
      try {
        this._ws.onclose = null, this._ws.onmessage = null, this._ws.onerror = null, this._ws.close();
      } catch {
      }
      this._ws = null;
    }
    t && this._finishStop();
  }
  _finishStop() {
    this._stopFired || (this._stopFired = !0, this.onStop());
  }
  _clearConnectTimer() {
    this._connectTimer != null && (this._deps.clearTimeout(this._connectTimer), this._connectTimer = null);
  }
};
Ve.MAX_SESSION_MS = 18e4, Ve.TIMESLICE_MS = 250, Ve.CONNECT_TIMEOUT_MS = 4e3, Ve.MAX_RECONNECTS = 3, Ve.BASE_BACKOFF_MS = 500, Ve.MAX_BACKOFF_MS = 4e3, Ve.STOP_GRACE_MS = 2e3, Ve.STOP_FLUSH_FALLBACK_MS = 1200;
let jn = Ve;
function sf(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Be(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const of = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function or(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (of.has(c.tagName)) return NodeFilter.FILTER_REJECT;
        c = c.parentElement;
      }
      return /\d/.test(a.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let s;
  for (; s = n.nextNode(); ) i.push(s);
  for (const a of i) {
    const l = (a.textContent ?? "").split(/(\d+)/);
    if (l.length <= 1) continue;
    const d = a.parentNode, o = a.nextSibling, h = l.map((p, u) => {
      if (u % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = p, m;
      }
      return document.createTextNode(p);
    });
    Be(a);
    for (const p of h) d.insertBefore(p, o);
    t.push({ parent: d, original: a, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((a) => {
    const c = a.value;
    /\d/.test(c) && (r.push({ el: a, original: c }), a.value = "█".repeat(c.length));
  }), () => {
    for (const { parent: a, original: c, replacements: l } of t) {
      const d = l[0];
      if ((d == null ? void 0 : d.parentNode) === a) {
        a.insertBefore(c, d);
        for (const o of l) o.parentNode === a && Be(o);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const Pc = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], af = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, lf = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, cf = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, uf = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "its",
  "i",
  "im",
  "i'm",
  "and",
  "or",
  "to",
  "of",
  "my",
  "me",
  "this",
  "that",
  "but",
  "no",
  "not",
  "on",
  "in",
  "at",
  "so",
  "as",
  "do",
  "does",
  "did",
  "has",
  "have",
  "had",
  "with",
  "for",
  "you",
  "your",
  "we",
  "they",
  "he",
  "she",
  "from",
  "by"
]), df = { needs: "Needs detail", good: "Good", great: "Great" };
function pf(e) {
  let t = e;
  for (const r of Pc) t = t.split(r).join(" ");
  return t;
}
function hf(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || uf.has(n) || r++;
  return r;
}
function Dc(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = pf(r), i = hf(n), s = t.length > 0 && Pc.some((p) => r.includes(p)) && i < 3, a = i >= 3 && t.length >= 12, c = cf.test(r), l = af.test(r) || lf.test(t), d = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: d, level: h, label: df[h], vague: s };
}
function ff(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Dc(t).level !== "great";
}
const mf = [
  "screenshot",
  "screen shot",
  "screengrab",
  "screen grab",
  "snip",
  "url",
  "link to the page",
  "page link",
  "web address",
  "address bar",
  "browser name",
  "browser version",
  "which browser",
  "what browser",
  "your browser",
  "user agent",
  "user-agent",
  "operating system",
  "os version",
  "which os",
  "what os",
  "device type",
  "screen size",
  "window size",
  "viewport size",
  "resolution"
];
function gf(e) {
  const t = (e || "").toLowerCase();
  return t ? mf.some((r) => t.includes(r)) : !1;
}
function zc(e) {
  if (e && typeof e == "string") return e;
  try {
    const t = typeof window < "u" ? window.location : void 0, r = t && t.hostname;
    if (typeof r == "string" && r) return r;
  } catch {
  }
  try {
    const t = typeof document < "u" ? document.referrer : "";
    if (typeof t == "string" && t) {
      const r = new URL(t).hostname;
      if (r) return r;
    }
  } catch {
  }
  return "widget";
}
function Fc(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", zc(t.source)],
    ["utm_medium", t.medium || "widget"],
    ["utm_campaign", t.campaign]
  ];
  t.ref && n.push(["utm_content", t.ref]);
  try {
    for (const [i, s] of n)
      s && !r.searchParams.has(i) && r.searchParams.set(i, s);
    return r.toString();
  } catch {
    return e;
  }
}
async function yf() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function bf() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let vf = 0;
function kf(e) {
  const t = e.host || bf(), r = "kl-shp-" + ++vf, n = document.createElement("div");
  n.className = "kl-shp " + r, n.setAttribute("role", "status");
  const i = document.createElement("style");
  i.textContent = `
    .kl-shp{position:absolute;width:288px;max-width:calc(100vw - 24px);box-sizing:border-box;background:#fff;color:#2a2f3a;
      border:1px solid #e6e3f5;border-radius:16px;padding:13px 13px 14px;box-shadow:0 26px 60px -20px rgba(40,30,80,.5);
      font-family:system-ui,-apple-system,"Segoe UI",sans-serif;z-index:2147483647;opacity:0;transform:translateY(6px);
      transition:opacity .18s ease,transform .18s cubic-bezier(.2,.7,.2,1);pointer-events:none;}
    .kl-shp.kl-show{opacity:1;transform:translateY(0);pointer-events:auto;}
    .kl-shp .kl-shp-hd{display:flex;align-items:center;gap:8px;margin:2px 0 10px;}
    .kl-shp .kl-shp-k{flex:0 0 auto;width:22px;height:22px;border-radius:6px;background:#6366f1;color:#fff;display:grid;place-items:center;font-weight:800;font-size:12px;}
    .kl-shp .kl-shp-hd b{font-size:13px;font-weight:800;letter-spacing:-.01em;line-height:1.2;}
    .kl-shp .kl-shp-dlg{border:1px solid #33383f;border-radius:12px;overflow:hidden;background:#202124;color:#e8eaed;box-shadow:0 6px 18px -6px rgba(0,0,0,.55);}
    .kl-shp .kl-shp-dh{padding:11px 12px 2px;}
    .kl-shp .kl-shp-dt{font-size:12px;font-weight:700;color:#e8eaed;line-height:1.25;}
    .kl-shp .kl-shp-ds{font-size:10.5px;color:#9aa0a6;margin-top:3px;line-height:1.3;}
    .kl-shp .kl-shp-prev{margin:10px 12px 6px;border:1.5px solid #1a73e8;border-radius:8px;overflow:hidden;background:#fff;}
    .kl-shp .kl-shp-shot{height:74px;background:linear-gradient(180deg,#fff,#f3f5f8);position:relative;}
    .kl-shp .kl-shp-shot:before{content:"";position:absolute;left:0;top:0;bottom:0;width:26px;background:#f7f8fa;border-right:1px solid #eceef2;}
    .kl-shp .kl-shp-shot:after{content:"";position:absolute;left:36px;right:10px;top:12px;height:8px;border-radius:3px;background:#e7ebf1;box-shadow:0 16px 0 -2px #eef1f5,0 30px 0 -2px #eef1f5,0 44px 0 -2px #eef1f5;}
    .kl-shp .kl-shp-cap{display:flex;align-items:center;gap:7px;padding:6px 8px;background:#fff;border-top:1px solid #eef1f5;}
    .kl-shp .kl-shp-fav{flex:0 0 auto;width:15px;height:15px;border-radius:4px;background:linear-gradient(135deg,#ef4444,#f97316);display:grid;place-items:center;color:#fff;font-size:8px;font-weight:800;}
    .kl-shp .kl-shp-rt{font-size:10.5px;color:#3c4043;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .kl-shp .kl-shp-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 12px 11px;}
    .kl-shp .kl-shp-cancel{font-size:11px;font-weight:700;color:#c9ccd1;background:#33373d;border-radius:999px;padding:6px 14px;}
    .kl-shp .kl-shp-allow{position:relative;font-size:11px;font-weight:800;color:#fff;background:#1a73e8;border-radius:999px;padding:6px 18px;box-shadow:0 4px 12px -3px rgba(26,115,232,.7);}
    .kl-shp .kl-shp-allow:after{content:"";position:absolute;inset:-3px;border-radius:999px;border:2px solid #1a73e8;opacity:0;animation:kl-shp-ring 1.8s ease-out infinite;}
    .kl-shp .kl-shp-steer{display:flex;gap:7px;align-items:flex-start;margin-top:11px;font-size:12px;line-height:1.45;color:#4b5160;}
    .kl-shp .kl-shp-n{flex:0 0 auto;width:16px;height:16px;border-radius:50%;background:#6366f1;color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center;margin-top:1px;}
    .kl-shp .kl-shp-steer b{color:#2a2f3a;font-weight:800;}
    .kl-shp .kl-shp-tail{position:absolute;width:13px;height:13px;background:#fff;border-right:1px solid #e6e3f5;border-bottom:1px solid #e6e3f5;}
    @keyframes kl-shp-ring{0%{opacity:.6;transform:scale(1)}70%{opacity:0;transform:scale(1.14)}100%{opacity:0}}
    @media (prefers-reduced-motion: reduce){.kl-shp{transition:none!important}.kl-shp .kl-shp-allow:after{animation:none!important}}
  `;
  const s = document.createElement("div");
  s.className = "kl-shp-hd";
  const a = document.createElement("span");
  a.className = "kl-shp-k", a.textContent = "K";
  const c = document.createElement("b");
  c.textContent = e.title, s.append(a, c);
  const l = document.createElement("div");
  l.className = "kl-shp-dlg";
  const d = document.createElement("div");
  d.className = "kl-shp-dh";
  const o = document.createElement("div");
  o.className = "kl-shp-dt", o.textContent = `Allow ${t} to see this tab?`;
  const h = document.createElement("div");
  h.className = "kl-shp-ds", h.textContent = "The site will be able to see the contents of this tab", d.append(o, h);
  const p = document.createElement("div");
  p.className = "kl-shp-prev";
  const u = document.createElement("div");
  u.className = "kl-shp-shot";
  const m = document.createElement("div");
  m.className = "kl-shp-cap";
  const f = document.createElement("span");
  f.className = "kl-shp-fav", f.textContent = (t[0] || "K").toUpperCase();
  const g = document.createElement("span");
  g.className = "kl-shp-rt", g.textContent = "This tab", m.append(f, g), p.append(u, m);
  const x = document.createElement("div");
  x.className = "kl-shp-foot";
  const v = document.createElement("span");
  v.className = "kl-shp-cancel", v.textContent = "Cancel";
  const b = document.createElement("span");
  b.className = "kl-shp-allow", b.textContent = "Allow", x.append(v, b), l.append(d, p, x);
  const S = document.createElement("div");
  S.className = "kl-shp-steer";
  const w = document.createElement("span");
  w.className = "kl-shp-n", w.textContent = "1";
  const k = document.createElement("span");
  return k.textContent = e.steer, S.append(w, k), n.append(i, s, l, S), n;
}
const wf = 1, xf = 6, Sf = 1.08;
function Cf(e, t = wf, r = xf) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Ef(e, t = Sf) {
  return e < 0 ? t : 1 / t;
}
function Mf(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function $c(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Rf(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Tf(e, t, r, n, i, s) {
  const a = $c(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), d = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, p = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: d, y: h, w: Math.max(0, o - d), h: Math.max(0, p - h) };
}
function Af(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function _f(e, t, r, n, i, s) {
  const a = $c(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function If(e) {
  return Fc("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || zc()
  });
}
function Lf(e) {
  const t = e;
  if (!t || typeof t.tagName != "string") return !1;
  const r = t.tagName;
  if (r === "INPUT" || r === "TEXTAREA" || r === "SELECT" || t.isContentEditable === !0) return !0;
  if (typeof t.closest == "function") {
    const n = t.closest("[contenteditable]");
    if (n && (n.getAttribute("contenteditable") || "").toLowerCase() !== "false") return !0;
  }
  return !1;
}
function Of(e, t, r) {
  return e.map((n) => {
    switch (n.type) {
      case "pen":
        return { ...n, points: n.points.map((i) => ({ x: i.x + t, y: i.y + r })) };
      case "rect":
        return { ...n, x: n.x + t, y: n.y + r };
      case "circle":
        return { ...n, x: n.x + t, y: n.y + r };
      case "count":
        return { ...n, x: n.x + t, y: n.y + r };
      case "text":
        return { ...n, x: n.x + t, y: n.y + r };
      case "arrow":
        return { ...n, x1: n.x1 + t, y1: n.y1 + r, x2: n.x2 + t, y2: n.y2 + r };
      case "line":
        return { ...n, x1: n.x1 + t, y1: n.y1 + r, x2: n.x2 + t, y2: n.y2 + r };
    }
  });
}
function mt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function xa(e) {
  let t = mt(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Sa(e) {
  let t = "";
  const r = (n) => {
    for (const i of Array.from(n.childNodes))
      if (i.nodeType === 3)
        t += i.textContent || "";
      else if (i.nodeName === "BR")
        t += `
`;
      else if (i.nodeType === 1) {
        const s = i;
        /^(DIV|P)$/.test(s.nodeName) && t && !t.endsWith(`
`) && (t += `
`), r(s);
      }
  };
  return r(e), t;
}
function Nf(e) {
  const t = [];
  e.summary && t.push(`*${e.summary}*`);
  const r = [];
  if (e.actualResult && r.push(`*Actual:* ${e.actualResult}`), e.expectedResult && r.push(`*Expected:* ${e.expectedResult}`), r.length && t.push(r.join(`
`)), e.stepsToReproduce && e.stepsToReproduce.length) {
    const n = e.stepsToReproduce.map((i, s) => `${s + 1}. ${i}`).join(`
`);
    t.push(`*Steps to reproduce:*
${n}`);
  }
  return (e.suggestedSeverity || e.suggestedPriority) && t.push(`*Severity: ${e.suggestedSeverity}* · Priority: ${e.suggestedPriority}`), t.join(`

`);
}
function Pf(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const Df = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function zf(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return Df.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Ca(e, t) {
  return zf(t) || Pf(e);
}
function Ea(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Nt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function Ff(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function $f(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Uf = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Uc(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Bf(e) {
  var r, n;
  switch ((n = (r = /\.([a-z0-9]+)$/i.exec(e || "")) == null ? void 0 : r[1]) == null ? void 0 : n.toLowerCase()) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mkv":
      return "video/x-matroska";
    case "ogv":
      return "video/ogg";
    case "3gp":
      return "video/3gpp";
    default:
      return "";
  }
}
const qf = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", Wf = 100, Hf = Wf * 1024 * 1024;
function jf(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function Cr(e) {
  return Uc(e) ? "video" : jf(e) ? "image" : "file";
}
function Vf(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function Mn(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Yf(e, t, r = {}) {
  var Yo, Go, Xo, Ko;
  const n = Oc(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, d = [], o = [], h = [], p = [], u = !1, m = !1, f = !1;
  const g = !!t.onMinimize, x = g ? 8 : 5, v = 15e3, b = 10 * 1024 * 1024, S = !!t.allowFileAttachments, w = 5, k = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : Hf, C = t.reporterRole ?? "anon", L = t.upgradeUrl, D = Math.max(120 * 1024 * 1024, k + 20 * 1024 * 1024);
  let I = [], J = null;
  const H = !!(t.allowRecording && t.onRecord), _ = sf({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Hn.isSupported(),
    webSpeechSupported: Jr.isSupported()
  }), ye = _ !== "none", Le = 2;
  let oe = [];
  const le = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, K = {};
  let he = null;
  const Oe = () => {
    const y = Object.keys(K);
    if (!y.length && !he) return null;
    const M = {};
    if (y.length) {
      const E = {};
      for (const T of y) E[T] = K[T];
      const R = K[0] ?? K[Number(y[0])] ?? {};
      Object.assign(M, R, { byIndex: E });
    }
    return he && (M.selector = he.selector, M.selectorText = he.text), M;
  };
  let ce = e, Me = 0, P = null, me = null, qe = null, Xe = t.replayState === "attached", De = null, Fe = null, We = null, He = !1;
  const Q = 4e3, Ae = 5e3, te = {}, ue = {}, $e = (y) => y ? JSON.parse(JSON.stringify(y)) : null, fe = (y) => {
    var M;
    try {
      (M = t.onAnnotationsChanged) == null || M.call(t, y, $e(K[y]));
    } catch {
    }
  }, er = () => {
    const y = {};
    for (const M of Object.keys(K)) {
      const E = K[M];
      E && (y[Number(M)] = $e(E));
    }
    return y;
  }, ke = (y) => ({
    url: c[y],
    compressed: d[y],
    ann: $e(K[y])
  }), _e = (y) => {
    (te[y] ?? (te[y] = [])).push(ke(y));
  }, vt = (y, M) => {
    c[y] = M.url, d[y] = M.compressed, M.ann ? K[y] = $e(M.ann) : delete K[y];
  }, Wt = (y) => {
    const M = te[y];
    if (!M || !M.length) return !1;
    const E = M.pop(), R = ue[y];
    for (; R && R.length && R[R.length - 1].mark >= M.length; ) R.pop();
    return vt(y, E), fe(y), Re(), !0;
  }, Ht = (y) => {
    const M = ue[y];
    if (!M || !M.length) return !1;
    const { snap: E, mark: R } = M.pop();
    return te[y] && (te[y].length = Math.min(te[y].length, R)), vt(y, E), fe(y), Re(), !0;
  }, Ft = document.createElement("style");
  Ft.textContent = `
    ${ef(n)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    /* height:94vh (definite, not just max-height) + grid-template-rows:minmax(0,1fr) so the row has a
       resolved height. This is what makes the hero canvas's object-fit:contain actually shrink a tall
       screenshot to fit (KLAVITYKLA-402) instead of the tall image blowing out the row and pushing the
       right-pane Submit button below the clipped fold. min-height:0 tracks let both panes scroll internally. */
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;width:92vw;max-width:min(1160px,92vw);height:94vh;max-height:94vh;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom right;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) 384px;grid-template-rows:minmax(0,1fr);}
    /* Image-hero two-pane layout: big annotatable screenshot on the left, controls on the right. */
    .kl-hero{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--kl-hero-bg,#0e1424);}
    .kl-hero-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:8px 14px;min-height:48px;border-bottom:1px solid rgba(255,255,255,.06);}
    .kl-hero-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;}
    .kl-hero-empty{display:flex;flex-direction:column;align-items:center;gap:12px;color:#7d879f;font-size:13.5px;font-weight:500;text-align:center;max-width:260px;line-height:1.5;}
    .kl-hero-empty svg{opacity:.6;}
    .kl-side{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--kl-border);padding:22px 20px;overflow-y:auto;}
    /* KLA-586: Submit is pinned to the bottom by the DESCRIPTION field's flex:1 grow (it consumes the free
       space and pushes the target-toggle + Submit down to sit right beneath it — no awkward gap). We must NOT
       use margin-top:auto here: an auto margin claims positive free space BEFORE flex-grow, which would steal
       the space back from the description and reopen the gap ABOVE Submit. position:sticky keeps Submit in
       view when the panel scrolls (long forms / small viewports) so it's ALWAYS reachable (KLAVITYKLA-402).
       The -12px top shadow gutter blends content scrolling up beneath the button. */
    .kl-side>.klavity-submit{position:sticky;bottom:0;box-shadow:0 -12px 14px -8px var(--kl-bg);}
    @media (max-width:760px){.klavity-modal{grid-template-columns:1fr;grid-template-rows:auto auto;height:auto;max-height:96vh;width:96vw;}.kl-hero{max-height:44vh;}.kl-side{overflow-y:visible;border-left:none;border-top:1px solid var(--kl-border);}.kl-side>.klavity-submit{position:static;box-shadow:none;}}
    /* Hero annotation toolbar — always-on tools over the image. Tap targets ≥36px for touch. */
    .kl-htool,.kl-htbtn{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:38px;height:38px;padding:0 8px;border:1px solid transparent;border-radius:9px;background:transparent;color:#cfd5ea;cursor:pointer;line-height:1;transition:transform .12s ease,background .12s ease;}
    .kl-htool .kl-hk{font-size:9px;font-weight:700;opacity:.5;}
    /* #449 "Revert crop" affordance — accent-tinted, with a small visible label under the glyph. */
    .kl-htbtn.kl-hrevert{color:var(--kl-accent);min-width:44px;}
    .kl-htbtn.kl-hrevert .kl-hrevert-lbl{font-size:8.5px;font-weight:700;opacity:.85;}
    .kl-htool:hover,.kl-htbtn:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
    .kl-htool.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .kl-htool.kl-on .kl-hk{opacity:.85;}
    .kl-hcolor{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.65);cursor:pointer;padding:0;transition:transform .12s ease;}
    .kl-hcolor:hover{transform:scale(1.14);}
    .kl-hcolor.kl-on{outline:2px solid #fff;outline-offset:2px;}
    /* Light swatches (white/yellow) need a dark inset ring so they read against the toolbar. */
    .kl-hcolor-light{border-color:rgba(0,0,0,.35);box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);}
    .kl-hcolor-cwrap{position:relative;display:inline-flex;}
    /* Rainbow "custom colour" swatch — opens the native picker; its bg is overwritten with the chosen colour. */
    .kl-hcolor-custom{background:conic-gradient(from 0deg,#ef4444,#f59e0b,#facc15,#16a34a,#3b82f6,#a855f7,#ef4444);}
    .kl-hcolor-input{position:absolute;left:0;bottom:-2px;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0;pointer-events:none;}
    .kl-hsep{width:1px;height:24px;background:rgba(255,255,255,.14);margin:0 3px;}
    .kl-hgrow{flex:1;}
    /* #626: keep the six preset swatches + custom picker on ONE line as a single unit (never split across
       two rows at the narrow widget width). Gap matches the toolbar's swatch spacing. */
    .kl-hcolors{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:6px;flex:none;}
    /* Contextual text options (outline colour + size) — only visible while the Text tool is active. */
    .kl-htextopts{display:inline-flex;align-items:center;gap:5px;}
    .kl-htextopts[hidden]{display:none;}
    .kl-hlabel{color:#7d879f;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 1px;}
    /* Keep the "Stroke" label glued to its S/M/L/XL sizes as one control — never let flex-wrap split the
       label onto one row and the size buttons onto another at the narrow widget width. */
    .kl-hgroup{display:inline-flex;align-items:center;gap:5px;flex:none;flex-wrap:nowrap;}
    .kl-hopt{min-width:28px;height:30px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#cfd5ea;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
    .kl-hopt:hover{background:rgba(255,255,255,.08);}
    .kl-hopt.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);border-color:transparent;}
    .kl-osq{width:13px;height:13px;border-radius:3px;display:inline-block;}
    .kl-hmask{display:inline-flex;align-items:center;gap:5px;height:38px;padding:0 8px;border-radius:9px;color:#cfd5ea;font-size:11px;font-weight:600;cursor:pointer;user-select:none;white-space:nowrap;}
    .kl-hmask:hover{background:rgba(255,255,255,.08);}
    .kl-hmask input{cursor:pointer;margin:0;accent-color:var(--kl-accent);}
    /* Top-left Klavity logo — a link to the (UTM'd) homepage. Sits flush left in the editor toolbar. */
    .kl-hlogo{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 8px 0 4px;border-radius:9px;text-decoration:none;color:#e6e9f5;font-weight:800;font-size:13px;letter-spacing:-.01em;cursor:pointer;transition:background .12s ease,transform .12s ease;}
    .kl-hlogo:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
    .kl-hlogo:active{transform:scale(.97);}
    .kl-hlogo svg{display:block;flex:none;}
    .kl-hlogo-word{white-space:nowrap;}
    @media (max-width:520px){.kl-hlogo-word{display:none;}}
    /* Zoom minimap / navigator — a corner thumbnail shown only while zoomed. The viewport rect dims the
       off-screen area (the big spread box-shadow) so the visible region reads at a glance. */
    .kl-minimap{position:absolute;right:12px;bottom:12px;z-index:7;border:1px solid rgba(255,255,255,.4);border-radius:6px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.5);background:#0b0f1c;cursor:crosshair;touch-action:none;}
    .kl-minimap[hidden]{display:none;}
    .kl-minimap-img{display:block;width:100%;height:100%;object-fit:fill;opacity:.9;pointer-events:none;user-select:none;-webkit-user-drag:none;}
    .kl-minimap-vp{position:absolute;box-sizing:border-box;border:2px solid var(--kl-accent,#6366f1);background:color-mix(in srgb,var(--kl-accent,#6366f1) 20%,transparent);box-shadow:0 0 0 9999px rgba(0,0,0,.3);pointer-events:none;}
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible,.kl-hlogo:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    /* #627: zoom −/+ buttons sit tight together as their own group. */
    .kl-hzoom{gap:2px;}
    @media (prefers-reduced-motion:reduce){.kl-htool,.kl-htbtn,.kl-hcolor,.kl-hlogo{transition:none;}.kl-htool:hover,.kl-htbtn:hover,.kl-hcolor:hover,.kl-hlogo:hover{transform:none;}}
    .klavity-modal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to right,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(to bottom,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px;opacity:.36;}
    .klavity-modal>*{position:relative;z-index:1;}
    /* Staggered content reveal — the genie scales the panel in while its rows softly rise + fade so it feels
       alive (not a flat box). Subtle; zeroed under prefers-reduced-motion below. */
    @keyframes kl-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .kl-side>.klavity-toggle,.kl-side>.klavity-page,.kl-side>.klavity-proof,.kl-hero>.klavity-strip,.kl-side>.klavity-actions,.kl-side>.klavity-desc,.kl-side>input.klavity-remail,.kl-side>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .kl-side>.klavity-toggle{animation-delay:.05s}.kl-side>.klavity-page{animation-delay:.09s}.kl-side>.klavity-proof{animation-delay:.11s}.kl-hero>.klavity-strip{animation-delay:.12s}.kl-side>.klavity-actions{animation-delay:.15s}.kl-side>.klavity-desc{animation-delay:.18s}.kl-side>input.klavity-remail{animation-delay:.21s}.kl-side>.klavity-submit{animation-delay:.23s}
    .klavity-modal.kl-closing{animation:kl-genie-out .5s cubic-bezier(.55,0,.85,.25) both;}
    .klavity-toggle{display:flex;gap:8px;margin-bottom:16px;padding-right:34px;}
    .klavity-toggle button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:var(--kl-chip);color:var(--kl-fg);line-height:1;}
    .klavity-toggle .bug.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-toggle .feat.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    /* PX4 #411: Title field. */
    .klavity-title-label{display:block;font-size:12px;font-weight:600;color:var(--kl-muted);margin-bottom:12px;padding-right:34px;}
    input.klavity-title{width:100%;margin-top:5px;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:9px 11px;font-size:14px;font-weight:500;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    input.klavity-title:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 18%,transparent);}
    /* PX4 #411: issue-type chips (Bug/Feature/Task/Query) — replaces the toggle when host supplies issueTypes. */
    .klavity-types{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding-right:34px;}
    .kl-type-chip{flex:1;min-width:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 6px;border-radius:9px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);cursor:pointer;font-size:13px;font-weight:600;line-height:1.2;transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease;}
    .kl-type-chip:hover{transform:translateY(-1px);}
    .kl-type-chip .kl-type-map{font-size:10.5px;font-weight:500;color:var(--kl-muted);}
    .kl-type-chip.active{border-color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 12%,var(--kl-chip));box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 16%,transparent);}
    .kl-type-chip.active .kl-type-map{color:var(--kl-fg);}
    .kl-type-chip:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* PX4 #425: attached non-image file chips (evidence strip). */
    .klavity-files{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
    /* KLA-586 (founder-flagged stray amber bar): these boxes carry the hidden attribute but their author
       display:flex declaration overrode the UA hidden rule (display:none) — so an EMPTY .klavity-capmsg
       (amber bg + border + padding) rendered as a stray amber pill between the images-count row and the
       description. Restore the hidden semantics explicitly so they only take space when they have content. */
    .klavity-files[hidden]{display:none;}
    .kl-file-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px 6px 9px;border-radius:8px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);font-size:12px;}
    .kl-file-chip .kl-file-ic{display:inline-flex;flex:none;color:var(--kl-muted);}
    .kl-file-chip .kl-file-nm{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;}
    .kl-file-chip .kl-file-sz{color:var(--kl-muted);font-variant-numeric:tabular-nums;font-size:11px;}
    .kl-file-rm{flex:none;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:color-mix(in srgb,var(--kl-fg) 12%,transparent);color:var(--kl-fg);cursor:pointer;padding:0;}
    .kl-file-rm:hover{background:color-mix(in srgb,var(--kl-fg) 22%,transparent);}
    /* KLA-591 unified attach: hint line + role-aware over-cap message + video tiles + upload progress. */
    .klavity-attach-hint{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--kl-muted);margin:-2px 0 10px;}
    .klavity-attach-hint svg{flex:none;opacity:.8;}
    .klavity-capmsg{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;line-height:1.4;color:var(--kl-fg);background:color-mix(in srgb,#f59e0b 14%,transparent);border:1px solid color-mix(in srgb,#f59e0b 45%,transparent);border-radius:8px;padding:8px 10px;margin-bottom:10px;}
    .klavity-capmsg .kl-capmsg-t{font-weight:600;}
    .klavity-capmsg .kl-capmsg-cta{color:var(--kl-accent);font-weight:700;text-decoration:none;white-space:nowrap;}
    .klavity-capmsg a.kl-capmsg-cta:hover{text-decoration:underline;}
    /* KLA-612: the guest "Request upgrade" action is a real button (POSTs an admin nudge). Styled as a compact
       accent pill so it reads as the primary action in the notice, with the standard hover/press micro-anim. */
    .klavity-capmsg button.kl-capmsg-req{border:none;cursor:pointer;font-size:12px;line-height:1;padding:6px 11px;border-radius:7px;background:var(--kl-accent);color:var(--kl-on-accent);font-weight:700;transition:transform .15s cubic-bezier(.2,.7,.2,1),filter .15s ease;will-change:transform;}
    .klavity-capmsg button.kl-capmsg-req:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.06);text-decoration:none;}
    .klavity-capmsg button.kl-capmsg-req:active{transform:scale(.97);}
    .klavity-capmsg button.kl-capmsg-req:disabled{opacity:.6;cursor:default;transform:none;}
    .klavity-capmsg button.kl-capmsg-req:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* Confirmation after the request lands — a check glyph + green tint (no emoji; uses core icon()). */
    .klavity-capmsg .kl-capmsg-sent{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:#059669;}
    .klavity-capmsg .kl-capmsg-sent-ic{display:inline-flex;}
    .klavity-capmsg .kl-capmsg-sent-ic svg{width:14px;height:14px;display:block;}
    .klavity-capmsg .kl-capmsg-hint{color:var(--kl-muted);}
    @media (prefers-reduced-motion: reduce){.klavity-capmsg button.kl-capmsg-req{transition:none;}}
    .klavity-capmsg[hidden]{display:none;}
    .kl-video-thumb{width:104px;height:72px;border-radius:8px;overflow:hidden;cursor:pointer;background:#000;outline:1px solid var(--kl-img-outline);outline-offset:-1px;}
    .kl-video-thumb.kl-thumb-active{outline:2px solid var(--kl-accent);outline-offset:1px;}
    .kl-video-thumb video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
    .kl-video-thumb .kl-video-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.28);transition:background .12s;}
    .kl-video-thumb:hover .kl-video-play{background:rgba(0,0,0,.12);}
    .kl-video-thumb .kl-video-play svg{filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));}
    .kl-video-thumb .kl-video-badge{position:absolute;left:4px;bottom:4px;display:inline-flex;align-items:center;gap:3px;padding:1px 5px 1px 4px;border-radius:5px;background:rgba(0,0,0,.62);color:#fff;font-size:9px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;}
    /* KLA-602(a): a "Re-record" action on a recording tile — a small circular control in the top-LEFT corner
       (Remove is top-right), so a reporter can redo a walkthrough without hunting for the Record button. */
    .kl-rerec{position:absolute;top:3px;left:3px;z-index:2;width:19px;height:19px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;}
    .kl-rerec:hover{transform:scale(1.08);background:var(--kl-accent);}
    .kl-rerec:active{transform:scale(.94);}
    .kl-rerec:focus-visible{outline:2px solid var(--kl-accent);outline-offset:1px;}
    .kl-att-prog{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(0,0,0,.35);overflow:hidden;}
    .kl-att-prog i{display:block;height:100%;width:0;background:var(--kl-accent);transition:width .2s ease;}
    .kl-file-chip{position:relative;overflow:hidden;}
    @media (prefers-reduced-motion:reduce){.kl-type-chip{transition:none;}.kl-type-chip:hover{transform:none;}}
    .klavity-page{font-size:12px;color:var(--kl-muted);margin-bottom:12px;}
    /* JTBD 1.8 attached-proof chip: tells the reporter (and later the reviewer, in the drawer) that a
       rolling session replay will ride along with the report. Sits under the page path, above the strip. */
    .klavity-proof{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
    .klavity-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;line-height:1;padding:5px 9px;border-radius:999px;background:var(--kl-chip);color:var(--kl-muted);border:1px solid var(--kl-border);}
    .klavity-chip svg{display:block;width:12px;height:12px;}
    .klavity-chip.kl-chip-on{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 78%,var(--kl-accent) 22%);border-color:color-mix(in srgb,var(--kl-border) 60%,var(--kl-accent) 40%);}
    .klavity-chip.kl-chip-off{opacity:.72;}
    /* overflow-x:auto forces overflow-y to auto (not visible) per CSS spec — adding vertical padding gives
       the absolutely-positioned rm/mk badge ::after hit-area extensions room so they're not clipped. */
    .klavity-strip{display:flex;gap:8px;overflow-x:auto;padding:6px 4px 16px;margin-bottom:6px;min-height:64px;align-items:flex-start;}
    /* KLAVITYKLA-473: blank/partial-capture callout under the strip — steers the user to the Screen button
       (in-browser detection; NEVER auto-triggers the screen-share). Warm amber warning tone, non-blocking. */
    .klavity-sharphint{display:flex;align-items:center;gap:8px;margin:0 4px 8px;padding:9px 11px;border-radius:9px;font-size:12px;line-height:1.4;color:var(--kl-fg);background:color-mix(in srgb,#d97706 12%,var(--kl-chip));border:1px solid color-mix(in srgb,#d97706 55%,transparent);}
    .klavity-sharphint[hidden]{display:none;}
    .klavity-sharphint .kl-sh-ic{flex:none;display:inline-flex;color:#d97706;}
    .klavity-sharphint .kl-sh-txt{flex:1 1 auto;min-width:0;}
    .klavity-sharphint .kl-sh-use{flex:none;border:none;border-radius:7px;padding:5px 10px;font-size:11.5px;font-weight:700;cursor:pointer;background:var(--kl-accent);color:var(--kl-on-accent);transition:transform .15s cubic-bezier(.2,.7,.2,1),filter .15s ease;will-change:transform;}
    .klavity-sharphint .kl-sh-use:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.06);}
    .klavity-sharphint .kl-sh-use:active{transform:scale(.97);}
    .klavity-sharphint .kl-sh-x{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:6px;background:transparent;color:var(--kl-fg);opacity:.6;cursor:pointer;transition:opacity .15s ease,background .15s ease;}
    .klavity-sharphint .kl-sh-x:hover{opacity:1;background:color-mix(in srgb,var(--kl-fg) 12%,transparent);}
    /* Pulse the Screen button while a suggestion is live so the eye is drawn to it. */
    @keyframes kl-sharp-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 55%,transparent)}70%{box-shadow:0 0 0 7px color-mix(in srgb,var(--kl-accent) 0%,transparent)}100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 0%,transparent)}}
    #klavity-sharp.kl-suggest{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);animation:kl-sharp-pulse 1.7s ease-out infinite;}
    @media (prefers-reduced-motion: reduce){#klavity-sharp.kl-suggest{animation:none;}.klavity-sharphint .kl-sh-use{transition:none;}}
    .klavity-thumb{position:relative;flex-shrink:0;}
    /* The image + its overlay badges (remove/markup/quality) live in this fixed-size media box so the
       absolutely-positioned badges anchor to the IMAGE, not the whole thumb column. Without it the markup
       pencil (bottom:4px) rode the bottom of the taller wrap and overlapped the "Retake sharp" pill below. */
    .klavity-thumb-media{position:relative;width:104px;}
    .klavity-thumb.kl-tall .klavity-thumb-media{width:68px;}
    /* KLAVITYKLA-509: capture-in-progress skeleton tile — same footprint as a real thumbnail so the strip
       doesn't jump when the shot swaps in. Pulses (kl-cap-pulse) unless reduced-motion is requested. */
    .kl-thumb-skel{width:104px;height:72px;border-radius:8px;background:var(--kl-chip);outline:1px solid var(--kl-img-outline);outline-offset:-1px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:10.5px;font-weight:600;color:var(--kl-muted);}
    .kl-thumb-skel.kl-loading{animation:kl-cap-pulse 1s ease-in-out infinite;}
    .kl-thumb-skel .kl-skel-spin{width:11px;height:11px;border:2px solid var(--kl-muted);border-top-color:transparent;border-radius:50%;animation:kl-skel-rot .7s linear infinite;}
    @keyframes kl-skel-rot{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion: reduce){.kl-thumb-skel.kl-loading{animation:none;}.kl-thumb-skel .kl-skel-spin{animation:none;}}
    .klavity-thumb img{height:72px;width:104px;object-fit:cover;object-position:top center;background:var(--kl-chip);display:block;border-radius:8px;outline:1px solid var(--kl-img-outline);outline-offset:-1px;cursor:pointer;transition:filter .12s;}
    .klavity-thumb img:hover{filter:brightness(.85);}
    /* Portrait (tall) screenshots: widen the thumbnail vertically so more page content is visible. */
    .klavity-thumb.kl-tall img{width:68px;height:110px;}
    /* Remove badge: dark semi-transparent circle — universally visible on all themes/backgrounds. */
    .klavity-rm{position:absolute;top:4px;right:4px;z-index:2;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    .klavity-mk{position:absolute;bottom:4px;right:4px;z-index:2;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:50%;width:22px;height:22px;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    /* Extend the 22px badges to a ≥40px hit area without enlarging the visible button. The top (X) and
       bottom (pencil) pseudo-areas don't overlap each other; the pencil shares the image's markup action. */
    .klavity-rm::after,.klavity-mk::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    /* JTBD 1.9 capture-quality badge — a small pill on the top-LEFT of each thumbnail. Sits opposite the
       remove (top-right) + markup (bottom-right) badges so nothing overlaps. Colour-coded by quality:
       sharp = accent, rendered = neutral, wireframe = amber warning (so a degraded shot is never silent). */
    .klavity-qb{position:absolute;top:4px;left:4px;z-index:2;display:inline-flex;align-items:center;gap:3px;max-width:calc(100% - 30px);font-size:9.5px;font-weight:700;line-height:1;padding:3px 6px;border-radius:999px;background:var(--kl-chip);color:var(--kl-fg);box-shadow:0 1px 3px rgba(0,0,0,.28);border:1px solid var(--kl-border);pointer-events:none;}
    .klavity-qb svg{display:block;width:10px;height:10px;}
    .klavity-qb .klavity-qb-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .klavity-qb.kl-q-real-pixel{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 74%,var(--kl-accent) 26%);border-color:color-mix(in srgb,var(--kl-border) 55%,var(--kl-accent) 45%);}
    .klavity-qb.kl-q-wireframe{color:#8a5a00;background:#fef3c7;border-color:#f59e0b;}
    /* "Retake sharp" affordance — a full-width pill under the degraded thumbnail (rendered/wireframe).
       Uses the accent so it reads as the fix. Hidden when no onRetakeSharp host callback is wired. */
    .klavity-retake{margin-top:5px;width:100%;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:700;line-height:1;padding:5px 6px;border:none;border-radius:7px;background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);color:var(--kl-accent);cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,box-shadow .15s ease;will-change:transform;}
    .klavity-retake svg{display:block;width:11px;height:11px;}
    .klavity-retake:hover{transform:var(--kl-lift);background:color-mix(in srgb,var(--kl-chip) 55%,var(--kl-accent) 45%);box-shadow:0 3px 10px color-mix(in srgb,var(--kl-accent) 26%,transparent);}
    .klavity-retake:active{transform:var(--kl-press);}
    .klavity-retake:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-retake:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-retake.kl-loading{animation:kl-cap-pulse 1s ease-in-out infinite;}
    /* A one-line notice under a thumbnail whose annotations were cleared by a retake (JTBD 1.9 AC). */
    .klavity-retake-note{margin-top:4px;font-size:9.5px;line-height:1.3;color:var(--kl-muted);text-wrap:pretty;}
    @media (prefers-reduced-motion: reduce){.klavity-retake{transition:none!important;}.klavity-retake.kl-loading{animation:none;}}
    .klavity-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
    .klavity-actions button{position:relative;flex:1 1 auto;min-width:76px;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--kl-chip);color:var(--kl-fg);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:1;}
    .klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;transition:transform .2s cubic-bezier(.34,1.56,.64,1);line-height:1;}
    .klavity-actions .kl-cap-ic svg,.klavity-toggle .kl-cap-ic svg{display:block;width:15px;height:15px;vertical-align:middle;margin:0;}
    .klavity-actions button:hover .kl-cap-ic,.klavity-toggle button:hover .kl-cap-ic,.klavity-actions button:focus-visible .kl-cap-ic,.klavity-toggle button:focus-visible .kl-cap-ic{transform:scale(1.14) rotate(-6deg);}
    .klavity-actions button:active .kl-cap-ic,.klavity-toggle button:active .kl-cap-ic{transform:scale(1.04);}
    /* Re-entrancy state: while a capture/submit is in flight every capture button is disabled (dimmed, no
       hover/press), and the one doing the work pulses to read as "working". */
    .klavity-actions button:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-actions button:disabled .kl-cap-ic{transform:none;}
    .klavity-actions button.kl-loading{opacity:.9;animation:kl-cap-pulse 1s ease-in-out infinite;}
    @keyframes kl-cap-pulse{0%,100%{opacity:.55}50%{opacity:.95}}
    /* KLAVITYKLA-228 — pinned-element chip: shows the selector captured by the on-page picker, with a
       one-tap Clear. Sits under the capture actions row, above the mask toggle. */
    .klavity-pickinfo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:-4px 0 12px;font-size:11.5px;color:var(--kl-muted);line-height:1.4;}
    .klavity-pickinfo[hidden]{display:none;}
    .klavity-pickinfo .kl-pick-ic{color:var(--kl-accent);display:inline-flex;flex:none;}
    .klavity-pickinfo code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--kl-fg);background:var(--kl-chip);padding:2px 6px;border-radius:6px;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .klavity-pickinfo .kl-pick-txt{font-size:11px;color:var(--kl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}
    .klavity-pickinfo .kl-pick-clear{background:none;border:none;color:var(--kl-muted);cursor:pointer;font-size:11px;text-decoration:underline;padding:2px 2px;border-radius:5px;}
    .klavity-pickinfo .kl-pick-clear:hover{color:var(--kl-fg);}
    .klavity-pickinfo .kl-pick-clear:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klav-mask-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--kl-muted);cursor:pointer;margin-bottom:10px;user-select:none;}
    .klav-mask-row input[type=checkbox]{accent-color:var(--kl-accent);width:13px;height:13px;cursor:pointer;}
    .klav-mask-row:hover{color:var(--kl-fg);}
    .klavity-counter{font-size:11px;color:var(--kl-muted);font-variant-numeric:tabular-nums;}
    /* KLA composer-polish: images-count + Voice-mic row (Mevak style). The circular mic sits at the right end;
       margin-left:auto keeps it pinned right even when the counter is hidden (no images yet). */
    .klavity-descbar{display:flex;align-items:center;gap:8px;min-height:36px;margin-bottom:8px;}
    .kl-voice-circle{position:relative;flex:none;margin-left:auto;width:36px;height:36px;min-width:36px;padding:0;border:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--kl-chip);color:var(--kl-fg);cursor:pointer;transition:background .15s ease,color .15s ease,transform .12s ease;}
    .kl-voice-circle .kl-cap-ic{display:inline-flex;align-items:center;justify-content:center;line-height:1;}
    .kl-voice-circle .kl-cap-ic svg{display:block;width:17px;height:17px;}
    .kl-voice-circle:hover{color:var(--kl-accent);transform:scale(1.06);}
    .kl-voice-circle:active{transform:scale(.95);}
    .kl-voice-circle:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .kl-voice-circle:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    @media (prefers-reduced-motion: reduce){.kl-voice-circle{transition:none!important;}.kl-voice-circle:hover,.kl-voice-circle:active{transform:none;}}
    /* KLA-586: the description is a WhatsApp-style Markdown field — a contenteditable that HOLDS raw Markdown
       (its source of truth is plain text, exposed via a .value accessor so every existing call site is
       unchanged) but renders bold/italic/strike/mono live as the reporter types, markers kept + dimmed.
       flex:1 so it GROWS to fill the freed vertical space in the scrollable side panel (founder ask) — the
       target toggle + Submit sit right below it with no awkward gap. min-height keeps it usable + it stays
       user-resizable; on short viewports the .kl-side panel scrolls (overflow-y:auto) rather than overflowing. */
    .klavity-desc{flex:1 1 auto;width:100%;min-height:200px;resize:vertical;overflow:auto;white-space:pre-wrap;word-break:break-word;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;line-height:1.55;margin-bottom:12px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);outline:none;}
    /* placeholder — shown only when the field is genuinely empty (render() clears stray <br> so :empty holds). */
    .klavity-desc:empty:before{content:attr(data-ph);color:var(--kl-muted);opacity:.75;pointer-events:none;}
    /* WhatsApp live-format: the markers stay in the raw text but render dimmed; the wrapped text is styled. */
    .klavity-desc .kl-mk{color:var(--kl-muted);opacity:.65;}
    .klavity-desc b{font-weight:750;}
    .klavity-desc i{font-style:italic;}
    .klavity-desc s{text-decoration:line-through;opacity:.85;}
    .klavity-desc code{background:color-mix(in srgb,var(--kl-fg) 8%,transparent);border-radius:4px;padding:0 3px;font-size:.92em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
    .klavity-desc.kl-desc-disabled{opacity:.6;cursor:not-allowed;}
    /* brief accent ring right after an AI-enhance replaces the field content, so the change is noticed. */
    .klavity-desc.kl-just-enhanced{box-shadow:0 0 0 2px color-mix(in srgb,var(--kl-accent) 45%,transparent);transition:box-shadow .5s ease;}
    /* KLA-586: AI-Enhance affordance — Enhance / Undo / Regenerate row + a drafting spinner, under the field. */
    .klavity-enhance-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;}
    .klavity-enhance-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--kl-accent) 40%,var(--kl-border));background:color-mix(in srgb,var(--kl-accent) 10%,var(--kl-input-bg));color:var(--kl-accent);font-weight:700;font-size:12.5px;border-radius:9px;padding:8px 12px;cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),box-shadow .15s ease,filter .15s ease;will-change:transform;}
    .klavity-enhance-btn:hover{transform:scale(1.02);box-shadow:0 3px 12px color-mix(in srgb,var(--kl-accent) 25%,transparent);}
    .klavity-enhance-btn:active{transform:scale(.97);}
    .klavity-enhance-btn:disabled{opacity:.55;cursor:default;transform:none;box-shadow:none;}
    .klavity-enhance-undo,.klavity-enhance-regen{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--kl-border);background:var(--kl-input-bg);color:var(--kl-muted);font-weight:650;font-size:12px;border-radius:9px;padding:8px 11px;cursor:pointer;transition:background .15s ease,color .15s ease;}
    .klavity-enhance-regen{margin-left:auto;color:var(--kl-accent);border-color:color-mix(in srgb,var(--kl-accent) 40%,var(--kl-border));}
    .klavity-enhance-undo:hover,.klavity-enhance-regen:hover{background:color-mix(in srgb,var(--kl-accent) 8%,var(--kl-input-bg));color:var(--kl-accent);}
    .klavity-enhance-undo[hidden],.klavity-enhance-regen[hidden]{display:none;}
    .klavity-enhance-spin{display:flex;align-items:center;gap:9px;margin:0 2px 12px;font-size:12px;color:var(--kl-accent);font-weight:600;}
    .klavity-enhance-spin[hidden]{display:none;}
    .kl-enh-loader{width:15px;height:15px;border:2.5px solid color-mix(in srgb,var(--kl-accent) 30%,transparent);border-top-color:var(--kl-accent);border-radius:50%;animation:kl-enh-spin .7s linear infinite;}
    @keyframes kl-enh-spin{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion: reduce){.kl-enh-loader{animation-duration:1.4s;}.klavity-enhance-btn{transition:none;}.klavity-enhance-btn:hover{transform:none;}}
    /* JTBD 1.10: hint shown when the reporter has attached a screenshot but typed nothing — Submit is
       enabled and the AI will title the report. Sits just under the textarea; hidden by default. */
    .klavity-desc-hint{display:flex;align-items:center;gap:6px;margin:-8px 0 14px;font-size:12.5px;color:var(--kl-muted);line-height:1.4;}
    .klavity-desc-hint[hidden]{display:none;}
    .klavity-desc-hint .icon{color:var(--kl-accent);flex:none;}
    /* KLAVITYKLA-241 (JTBD A.11): pre-submit "we already know about this" acknowledgment. Appears above
       Submit when the typed description matches a known/recurring issue. Non-blocking — the user can still
       submit or dismiss. Uses a muted-info tone (not an error) so it reassures rather than alarms. */
    .klavity-known{display:flex;align-items:flex-start;gap:8px;margin:-6px 0 14px;padding:10px 12px;font-size:12.5px;line-height:1.45;color:var(--kl-fg);background:color-mix(in srgb,var(--kl-accent) 8%,var(--kl-input-bg));border:1px solid color-mix(in srgb,var(--kl-accent) 30%,var(--kl-border));border-radius:8px;}
    .klavity-known[hidden]{display:none;}
    .klavity-known .kl-known-ic{color:var(--kl-accent);flex:none;margin-top:1px;}
    .klavity-known .kl-known-body{flex:1;min-width:0;}
    .klavity-known .kl-known-title{font-weight:600;}
    .klavity-known .kl-known-status{color:var(--kl-accent);font-weight:600;}
    .klavity-known .kl-known-dismiss{flex:none;background:none;border:none;color:var(--kl-muted);cursor:pointer;font-size:11px;padding:2px 4px;border-radius:6px;line-height:1;text-decoration:underline;}
    .klavity-known .kl-known-dismiss:hover{color:var(--kl-fg);}
    .klavity-known .kl-known-dismiss:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* Report-clarity helper (like password-strength, for bug reports). Sits directly under the description:
       a 3-segment meter, a status label, coverage chips, and (when vague) a debounced AI tip. Hidden until
       the reporter types. Non-blocking + informational — never gates Submit. */
    .klavity-clarity{margin:-8px 0 14px;}
    .klavity-clarity[hidden]{display:none;}
    .klavity-clarity .kl-clr-bar{height:6px;border-radius:999px;display:flex;gap:3px;}
    .klavity-clarity .kl-clr-bar i{flex:1;background:var(--kl-border);border-radius:999px;transition:background .2s;}
    .klavity-clarity.l1 .kl-clr-bar i:nth-child(1){background:var(--kl-bad,#dc2626);}
    .klavity-clarity.l2 .kl-clr-bar i:nth-child(-n+2){background:var(--kl-warn,#d97706);}
    .klavity-clarity.l3 .kl-clr-bar i:nth-child(-n+3){background:var(--kl-ok,#16a34a);}
    .klavity-clarity .kl-clr-row{display:flex;align-items:center;justify-content:space-between;margin-top:6px;font-size:11.5px;color:var(--kl-muted);}
    .klavity-clarity .kl-clr-st{font-weight:700;}
    .klavity-clarity.l1 .kl-clr-st{color:var(--kl-bad,#dc2626);}
    .klavity-clarity.l2 .kl-clr-st{color:var(--kl-warn,#d97706);}
    .klavity-clarity.l3 .kl-clr-st{color:var(--kl-ok,#16a34a);}
    .klavity-clarity .kl-clr-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
    .klavity-clarity .kl-clr-chip{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--kl-border);color:var(--kl-muted);display:inline-flex;align-items:center;gap:4px;background:var(--kl-chip);}
    .klavity-clarity .kl-clr-chip.done{color:var(--kl-ok,#16a34a);border-color:color-mix(in srgb,var(--kl-ok,#16a34a) 40%,transparent);background:color-mix(in srgb,var(--kl-ok,#16a34a) 8%,transparent);}
    /* #731: the standalone clarity-coach "AI" tip message was removed (owner: not needed now).
       The coverage pills + score above stay; only the LLM tip row and its CSS are gone. */
    /* Soft pre-submit nudge (mockup panel D). Shown ONLY when the reporter hits Submit on a still-weak
       report. "Submit anyway" always proceeds — never a hard block. */
    .klavity-nudge{margin:0 0 12px;border:1px solid var(--kl-warn,#d97706);background:color-mix(in srgb,var(--kl-warn,#d97706) 8%,var(--kl-input-bg));border-radius:10px;padding:11px;}
    .klavity-nudge[hidden]{display:none;}
    .klavity-nudge .kl-nudge-h{font-weight:650;font-size:12.5px;margin-bottom:3px;color:var(--kl-fg);}
    .klavity-nudge .kl-nudge-d{font-size:11.5px;color:var(--kl-muted);line-height:1.45;}
    .klavity-nudge .kl-nudge-row{display:flex;gap:8px;margin-top:9px;}
    .klavity-nudge button{padding:7px 12px;border-radius:8px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);font-weight:600;font-size:12px;cursor:pointer;}
    .klavity-nudge button.kl-nudge-add{background:var(--kl-accent);border-color:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-nudge button.kl-nudge-anyway{background:none;color:var(--kl-muted);}
    .klavity-nudge button:hover{filter:brightness(1.03);}
    .klavity-nudge button:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    input.klavity-remail{width:100%;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    .klavity-submit{width:100%;min-height:40px;padding:12px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;}
    .klavity-submit:disabled{opacity:.5;cursor:not-allowed;}
    /* KLA submit-target: segmented "Where should this go?" control sitting just above Submit. Matches the
       composer's chip styling and works at the narrow widget width (two flex columns, wrapping sub-labels). */
    .klavity-target{margin:0 0 12px;}
    .kl-tgt-label{font-size:11px;font-weight:650;color:var(--kl-muted);margin:0 0 6px 2px;text-transform:uppercase;letter-spacing:.04em;}
    .kl-tgt-seg{display:flex;background:var(--kl-chip);border-radius:10px;padding:3px;gap:3px;}
    .kl-tgt-opt{position:relative;flex:1;min-width:0;border:none;background:transparent;border-radius:8px;padding:8px 18px 8px 8px;font-size:12.5px;font-weight:600;color:var(--kl-muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.2;text-align:center;transition:background .15s ease,color .15s ease,box-shadow .15s ease,transform .12s ease;}
    .kl-tgt-opt small{font-weight:500;font-size:10px;opacity:.85;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .kl-tgt-opt:hover:not(.on){color:var(--kl-fg);}
    .kl-tgt-opt:active{transform:scale(.97);}
    /* Apple-HIG selected state: unmistakable at a glance — accent-tinted fill, a crisp accent ring
       (inset box-shadow so there's no layout shift vs the borderless unselected segment), higher-contrast
       bold label, an accent sub-label, a subtle lift shadow, and an accent checkmark tick in the corner.
       Unselected segments stay muted + flat (rules above). */
    .kl-tgt-opt.on{background:color-mix(in srgb,var(--kl-accent) 14%,var(--kl-input-bg));color:var(--kl-fg);font-weight:700;transform:translateY(-1px);box-shadow:inset 0 0 0 1.5px var(--kl-accent),0 3px 10px color-mix(in srgb,var(--kl-accent) 28%,transparent);}
    .kl-tgt-opt.on small{color:var(--kl-accent);opacity:1;font-weight:600;}
    /* CSS-drawn check tick (no glyph/emoji) — accent, top-right corner of the selected segment. */
    .kl-tgt-opt.on::after{content:"";position:absolute;top:7px;right:8px;width:5px;height:9px;border:solid var(--kl-accent);border-width:0 2px 2px 0;transform:rotate(45deg);}
    @media (prefers-reduced-motion:reduce){.kl-tgt-opt{transition:background .15s ease,color .15s ease,box-shadow .15s ease;}.kl-tgt-opt.on{transform:none;}.kl-tgt-opt:active{transform:none;}}
    /* #638: "Attach console logs" toggle — a compact opt-in row just above Submit, OFF by default. Mirrors
       the mask-numbers checkbox affordance (native checkbox tinted with the accent) so it reads as a control. */
    .klavity-conlog{display:flex;align-items:center;margin:0 0 12px;}
    .kl-conlog-lbl{display:inline-flex;align-items:center;gap:7px;color:var(--kl-muted);font-size:12px;font-weight:600;cursor:pointer;user-select:none;line-height:1.3;}
    .kl-conlog-lbl:hover{color:var(--kl-fg);}
    .kl-conlog-lbl input{margin:0;width:14px;height:14px;cursor:pointer;accent-color:var(--kl-accent);flex:0 0 auto;}
    .kl-conlog-lbl svg{flex:0 0 auto;opacity:.8;}
    /* Upload progress under Submit — collapsed until a submit is in flight; the fill is animated toward 90%
       over ~10s and snapped to 100% when the request resolves (fetch can't report real upload %). */
    .klavity-progress{height:5px;border-radius:999px;background:var(--kl-chip);overflow:hidden;opacity:0;max-height:0;margin-top:0;transition:opacity .2s ease,max-height .2s ease,margin-top .2s ease;}
    .klavity-progress.show{opacity:1;max-height:5px;margin-top:10px;}
    .klavity-progress-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--kl-accent) 65%,#fff),var(--kl-accent));}
    .klavity-toast-progress{position:absolute;top:0;left:0;height:3px;background:var(--kl-accent);width:100%;transform-origin:left;animation:kl-toast-decay 5s linear forwards;z-index:10;}
    @keyframes kl-toast-decay{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    /* #448 — post-submit terminal confirmation card ("Report sent"). Self-contained (the composer body
       is removed); the countdown line sits along the BOTTOM edge, matching the approved mock. */
    /* Compact card (post-submit-box fix): tightened to a small confirmation, never a big centered box.
       The countdown progress line runs along the BOTTOM edge and auto-closes after SUBMIT_AUTOCLOSE_MS. */
    .klavity-sent{position:relative;overflow:hidden;background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:22px 22px 20px;width:90vw;max-width:340px;text-align:center;box-shadow:var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;align-items:center;gap:9px;animation:kl-genie-in .5s cubic-bezier(.16,1,.3,1) both;}
    .klavity-sent .kl-sent-check{width:42px;height:42px;border-radius:50%;background:color-mix(in srgb,#16a34a 15%,transparent);color:#16a34a;display:grid;place-items:center;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .04s both;}
    .klavity-sent h2{margin:0;font-size:17px;font-weight:600;color:var(--kl-fg);line-height:1.2;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .09s both;}
    .klavity-sent p{margin:0;font-size:13px;color:var(--kl-muted);line-height:1.45;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .14s both;}
    .klavity-sent .klavity-ref{margin:4px 0 0;justify-content:center;}
    .klavity-sent .klavity-toast-progress{top:auto;bottom:0;}
    .klavity-error{color:#f38ba8;font-size:13px;margin-bottom:8px;display:none;}
    .klavity-success h2{margin:0 0 10px;font-size:24px;font-family:var(--kl-font-display, var(--display, 'Fraunces', serif));font-weight:480;color:var(--kl-fg);display:flex;align-items:center;gap:8px;line-height:1.2;letter-spacing:-.01em;}
    .klavity-success p{margin:0 0 20px;font-size:14.5px;color:var(--kl-muted);line-height:1.5;}
    .klavity-success>h2{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .05s both;}.klavity-success>p{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .12s both;}.klavity-lead,.klavity-thanks{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .18s both;}.klavity-success>.klavity-cta{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .24s both;}
    .klavity-lead{display:flex;gap:10px;margin-bottom:16px;}
    .klavity-lead input{flex:1;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:99px;padding:9px 16px;font-size:14px;box-sizing:border-box;}
    .klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-lead button{position:relative;overflow:hidden;min-height:40px;padding:9px 18px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-lead button::after, .klavity-cta::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:translateX(-100%);transition:transform .6s ease;}
    .klavity-lead button:hover::after, .klavity-cta:hover::after{transform:translateX(100%);}
    .klavity-lead button:disabled{opacity:.5;cursor:not-allowed;}
    .klavity-thanks{font-size:13px;color:var(--kl-fg);margin-bottom:12px;}
    .klavity-lead-err{font-size:12.5px;color:#f38ba8;margin:-6px 0 14px;line-height:1.4;animation:kl-rise .3s cubic-bezier(.16,1,.3,1) both;}
    .klavity-ref{margin:0 0 18px;font-size:13px;color:var(--kl-muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .15s both;}
    .klavity-ref code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:var(--kl-chip);color:var(--kl-fg);padding:2px 8px;border-radius:6px;user-select:all;}
    .klavity-ref a{color:var(--kl-accent);font-weight:600;text-decoration:underline;text-underline-offset:2px;transition:color .15s ease,transform .15s cubic-bezier(.2,.7,.2,1);display:inline-block;}
    .klavity-ref a:hover{transform:var(--kl-lift);}
    .klavity-ref a:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;border-radius:4px;}
    .klavity-cta{position:relative;overflow:hidden;display:inline-block;padding:12px 20px;background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));color:var(--kl-on-accent);border-radius:99px;font-size:14px;font-weight:700;text-decoration:none;margin-bottom:12px;text-align:center;box-shadow:0 4px 14px color-mix(in srgb,var(--kl-accent) 35%,transparent);}
    .klavity-pb{text-align:center;font-size:10px;color:var(--kl-muted);margin-top:12px;}
    .klavity-pb a{color:var(--kl-muted);text-decoration:none;transition:color .15s ease;}
    .klavity-pb a:hover{color:var(--kl-accent);}
    /* ── Button micro-interactions — subtle hover lift/scale + press, Klavity-accent on hover, focus
       rings. Same feel as the right-click menu + dashboard buttons. Transform amounts are CSS vars so
       prefers-reduced-motion can zero them (below). color-mix degrades gracefully if unsupported. ── */
    .klavity-modal{--kl-lift:translateY(-1px) scale(1.02);--kl-press:scale(.97);--kl-bhover:scale(1.05);--kl-bpress:scale(.97);}
    .klavity-toggle button,.klavity-actions button,.klavity-submit,.klavity-lead button,.klavity-cta,.klavity-desc,input.klavity-remail,.klavity-lead input{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,border-color .15s ease,box-shadow .15s ease,color .15s ease,filter .15s ease;will-change:transform;}
    .klavity-rm,.klavity-mk{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,color .15s ease,box-shadow .15s ease;will-change:transform;}
    .klavity-desc:hover,input.klavity-remail:hover,.klavity-lead input:hover{transform:var(--kl-lift);border-color:var(--kl-accent);box-shadow:0 7px 18px color-mix(in srgb,var(--kl-accent) 16%,transparent),0 0 0 1px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-desc:focus-within,.klavity-desc:focus,input.klavity-remail:focus,.klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent),0 8px 20px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    /* Bug/Feature toggle — lift + soft accent glow (keeps the active chip's highlight intact) */
    .klavity-toggle button:hover{transform:var(--kl-lift);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-toggle button:active{transform:var(--kl-press);}
    /* Full Page / Upload / Region — lift + accent tint + accent text */
    .klavity-actions button:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 80%,var(--kl-accent) 20%);box-shadow:0 5px 14px color-mix(in srgb,var(--kl-accent) 22%,transparent);}
    .klavity-actions button:active{transform:var(--kl-press);}
    /* Submit + lead submit + CTA (accent buttons) — lift + brighten + accent-tinted glow */
    .klavity-submit:hover:not(:disabled),.klavity-lead button:hover:not(:disabled),.klavity-cta:hover{transform:var(--kl-lift);filter:brightness(1.05);background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));box-shadow:0 8px 22px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .klavity-submit:active:not(:disabled),.klavity-lead button:active:not(:disabled),.klavity-cta:active{transform:var(--kl-press);}
    /* Thumbnail action badges (X remove, pencil edit) — pop on hover, press in */
    .klavity-rm:hover{transform:var(--kl-bhover);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 82%,var(--kl-accent) 18%);box-shadow:0 3px 9px rgba(0,0,0,.22);}
    .klavity-mk:hover{transform:var(--kl-bhover);background:color-mix(in srgb,var(--kl-accent) 85%,#fff);box-shadow:0 3px 9px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-rm:active,.klavity-mk:active{transform:var(--kl-bpress);}
    .klavity-rm svg,.klavity-mk svg{transition:transform .2s ease;will-change:transform;}
    .klavity-rm:hover svg{transform:rotate(90deg);}
    .klavity-mk:hover svg{transform:rotate(15deg) scale(1.1);}
    /* Close (×) — top-right corner; same lift+accent / press / focus feel as the rest. 30px visible button
       with a ::after pseudo extending the hit area to ≥40×40 (sits in the reserved toggle padding, so it
       never overlaps the Bug/Feature buttons). */
    .klavity-x{position:absolute;top:14px;right:14px;z-index:3;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:var(--kl-muted);border:none;border-radius:9px;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease,color .15s ease;will-change:transform;}
    .klavity-x svg{display:block;transition:transform .25s ease;will-change:transform;}
    .klavity-x:hover svg{transform:rotate(90deg) scale(1.12);}
    .klavity-x::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-x:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-x:active{transform:var(--kl-press);}
    /* KLA-412 minimize (─) — sits just left of the close (×). Same lift/press/focus feel. The toggle
       reserves extra right padding (via :has) so neither header button overlaps the Bug/Feature chips. */
    .klavity-min{position:absolute;top:14px;right:50px;z-index:3;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:var(--kl-muted);border:none;border-radius:9px;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease,color .15s ease;will-change:transform;}
    .klavity-min::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-min:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-min:active{transform:var(--kl-press);}
    .klavity-min:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-modal:has(.klavity-min) .klavity-toggle{padding-right:66px;}
    /* KLA-412 per-shot page label — the mono path each screenshot came from, under its thumbnail. Only
       rendered for shots that carry page metadata, so single-page reports show no label. */
    .klavity-pglabel{margin-top:4px;max-width:104px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.3;color:var(--kl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .klavity-pglabel b{color:var(--kl-accent);font-weight:600;}
    /* Keyboard accessibility — visible focus ring on every control */
    .klavity-toggle button:focus-visible,.klavity-actions button:focus-visible,.klavity-submit:focus-visible,.klavity-lead button:focus-visible,.klavity-cta:focus-visible,.klavity-rm:focus-visible,.klavity-mk:focus-visible,.klavity-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* ── Screen button: the (i) badge is a purely visual affordance nested inside the button.
       Hovering the entire Screen button shows the floating tooltip (KLA-15/KLA-26/KLA-31). ── */
    /* KLA-587: "Snap" is the primary default capture — real tab pixels (every image, embedded frame and web
       font, no CORS gaps). Style it as the primary/accent button so the reporter's eye + first click land
       here; Full Page (the DOM re-render) stays the neutral fallback. Snap still requires a user gesture, so
       "default" = the primary button + steer, NOT an auto-fired permission prompt (see KLAVITYKLA-473).
       (The stacked "RECOMMENDED" pill was dropped per founder ask — accent styling carries the emphasis.) */
    #klavity-sharp{flex:1.4;background:var(--kl-accent);color:var(--kl-on-accent);font-weight:600;}
    #klavity-sharp:hover{filter:brightness(1.06);}
    #klavity-sharp .kl-cap-main{display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1;}
    #klavity-sharp .kl-info-badge{opacity:.7;}
    #klavity-sharp:hover .kl-info-badge,#klavity-sharp:focus-visible .kl-info-badge{opacity:1;}
    /* Faded (i) circle inside the Screen button — lights up on button hover to signal "info here". */
    /* Absolutely-positioned in the button's top-right corner so it never consumes flex-row width and
       can't overflow the button edge (the "Screen (i)" overflow). Button is position:relative. */
    .kl-info-badge{position:absolute;top:3px;right:4px;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;opacity:0.4;transition:opacity .15s ease;pointer-events:none;}
    .klavity-actions button:hover .kl-info-badge,.klavity-actions button:focus-visible .kl-info-badge{opacity:0.85;}
    /* .klavity-info-pop is kept in markup for its text; visibility is JS-driven via .kl-float-tip so
       the tooltip is rendered outside the overflow:hidden modal and is never clipped. */
    .klavity-info-pop{display:none;}
    /* Floating tooltip — appended to the shadow root (sibling of overlay), position:fixed to viewport so
       overflow:hidden on .klavity-modal cannot clip it. JS positions it with full viewport edge-detection. */
    .kl-float-tip{position:fixed;width:228px;max-width:calc(100vw - 16px);padding:10px 12px;border-radius:10px;background:var(--kl-bg);color:var(--kl-fg);box-shadow:0 0 0 1px var(--kl-border),0 12px 30px rgba(20,16,40,.22);font-size:12px;line-height:1.45;text-align:left;text-wrap:pretty;z-index:2147483647;pointer-events:none;visibility:hidden;opacity:0;transition:opacity .15s ease,visibility .15s step-end;}
    .kl-float-tip.kl-show{visibility:visible;opacity:1;transition:opacity .15s ease;}
    .kl-float-tip b{color:var(--kl-fg);font-weight:600;}
    /* KLA-601: the Screen-decline NUDGE — an action-oriented callout anchored to the Screen button after the
       reporter cancels the share picker (we keep the rendered fallback). It reuses the floating-tip shell but
       is DISMISSIBLE (its own close affordance / auto-hide), captures pointer events, and gets an accent hairline
       + a small arrow so it reads as a proactive tip, not the passive hover tooltip. Shown at most once/session. */
    .kl-float-tip.kl-nudge{pointer-events:auto;box-shadow:0 0 0 1.5px var(--kl-accent),0 12px 30px rgba(20,16,40,.26);}
    .kl-float-tip.kl-nudge .kl-nudge-row{display:flex;align-items:flex-start;gap:8px;}
    .kl-float-tip.kl-nudge .kl-nudge-x{flex:none;margin:-2px -2px 0 auto;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:6px;background:transparent;color:var(--kl-muted);cursor:pointer;transition:background .15s ease,color .15s ease;}
    .kl-float-tip.kl-nudge .kl-nudge-x:hover{background:color-mix(in srgb,var(--kl-accent) 14%,transparent);color:var(--kl-accent);}
    .kl-float-tip.kl-nudge .kl-nudge-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:1px;}
    /* Gently pulse the Screen button to draw the eye toward the one-tap retry. */
    @keyframes kl-screen-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 60%,transparent);}70%{box-shadow:0 0 0 8px rgba(124,58,237,0);}100%{box-shadow:0 0 0 0 rgba(124,58,237,0);}}
    #klavity-sharp.kl-pulse{animation:kl-screen-pulse 1.4s cubic-bezier(.4,0,.2,1) 3;}
    @media (prefers-reduced-motion:reduce){#klavity-sharp.kl-pulse{animation:none;}}
    /* ── Capture-source active/selected indicator (KLA-21) ──────────────────────────────────────
       .kl-active is applied to whichever capture button the user most recently used successfully.
       Uses the same accent palette and transition system as the rest of the modal so it reads as
       "native" — no custom keyframes; the existing press→release spring on transform is enough.
       A small CSS checkmark (rotated L-shape border) appears at the top-right corner as a clear
       "selected" badge without adding any DOM weight. ── */
    .klavity-actions button.kl-active{
      position:relative;
      color:var(--kl-accent);
      background:color-mix(in srgb,var(--kl-accent) 12%,var(--kl-chip));
      box-shadow:0 0 0 1.5px var(--kl-accent),0 4px 14px color-mix(in srgb,var(--kl-accent) 18%,transparent);
    }
    .klavity-actions button.kl-active .kl-cap-ic{color:var(--kl-accent);transform:scale(1.08) rotate(3deg);}
    /* KLA-612: the primary Snap button (#klavity-sharp) ALWAYS has a SOLID accent (purple) background — even
       when it's the .kl-active capture source. The generic .kl-active .kl-cap-ic rule above paints the glyph
       --kl-accent (purple), which on this button = purple-on-purple → the app-window icon vanishes (same class
       of bug as the "missing Bug icon"). Pin the Snap icon to on-accent (white) so it stays visible next to the
       "Snap" label in BOTH rest and active states. ID specificity (1,0,1) beats the .kl-active rule (0,3,1). */
    #klavity-sharp .kl-cap-ic{color:var(--kl-on-accent);}
    /* KLA composer-polish: the Bug/Feature toggle's ACTIVE chip has a SOLID accent (purple) background, so
       the icon must be on-accent (white) — NOT accent, which would paint the glyph the same colour as its
       background and make it invisible (the "missing Bug icon" report). Inactive chips inherit --kl-fg. */
    .klavity-toggle button.active .kl-cap-ic{color:var(--kl-on-accent);transform:scale(1.08) rotate(3deg);}
    .klavity-actions button.kl-active::after{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;border-radius:50%;
      background:var(--kl-accent);
      box-shadow:0 1px 3px rgba(0,0,0,.25);
      z-index:2;
    }
    .klavity-actions button.kl-active::before{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;
      background-color:var(--kl-on-accent);
      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      z-index:3;
    }
    @media (max-width:430px){.klavity-lead{flex-direction:column}.klavity-lead button{width:100%;}}
    #klavity-voice{position:relative;}
    #klavity-voice .kl-cap-ic{position:relative;}
    .kl-vring{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;pointer-events:none;}
    .kl-vring-bg{stroke:color-mix(in srgb,var(--kl-border) 80%,transparent);}
    .kl-vring-prog{stroke:var(--kl-accent);transition:stroke .3s ease;}
    #klavity-voice.kl-voice-rec .kl-vring{display:block;}
    /* KLA-613: the recording state is unmistakable AT THE CONTROL — a clearly red, GLOWING/PULSING circle with
       the stop-square glyph — so we no longer need (and no longer render) the disconnected "Recording — tap to
       stop" text row far below the description. Action + feedback are now co-located where the user clicked. */
    #klavity-voice.kl-voice-rec{color:rgb(220 38 38);background:color-mix(in srgb,rgb(220 38 38) 16%,var(--kl-chip));box-shadow:0 0 0 2px rgba(220,38,38,.55),0 0 12px 2px rgba(220,38,38,.45);animation:kl-rec-glow 1.4s ease-in-out infinite;}
    @keyframes kl-rec-glow{0%{box-shadow:0 0 0 0 rgba(220,38,38,.55),0 0 10px 1px rgba(220,38,38,.35);}50%{box-shadow:0 0 0 4px rgba(220,38,38,.28),0 0 18px 5px rgba(220,38,38,.55);}100%{box-shadow:0 0 0 0 rgba(220,38,38,.55),0 0 10px 1px rgba(220,38,38,.35);}}
    @media (prefers-reduced-motion: reduce){#klavity-voice.kl-voice-rec{animation:none;box-shadow:0 0 0 2px rgba(220,38,38,.6);}}
    #klavity-voice.kl-voice-warn .kl-vring-prog{stroke:#f97316;}
    .kl-vdot{display:none;position:absolute;top:0;right:0;width:6px;height:6px;border-radius:50%;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-vdot{display:block;animation:kl-vdot-pulse 1.2s ease infinite;}
    @media (prefers-reduced-motion: reduce){#klavity-voice.kl-voice-rec .kl-vdot{animation:none;}}
    /* KLA voice-fix / KLA-613: an OBVIOUS Stop affordance while recording — the mic icon swaps to a solid red
       stop square so the user can clearly see it's live and that tapping stops it. This glyph + the red glow ARE
       the recording feedback now (no separate status text). */
    .kl-vstop{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:11px;height:11px;border-radius:2px;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-cap-ic>svg{opacity:0;}
    #klavity-voice.kl-voice-rec .kl-vstop{display:block;}
    @keyframes kl-vdot-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}
    /* KLAVITYKLA-495: the voice status/error gets its OWN block row (was dynamically inserted right after
       the textarea, where the Report-clarity bar's negative top margin painted over it). It sits between
       the description and the clarity helper, so the two never collide. */
    .klavity-voice-status{margin:6px 0 10px;font-size:12px;line-height:1.4;display:flex;align-items:center;gap:6px;}
    .klavity-voice-status[hidden]{display:none;}
    .klavity-voice-status.kl-vs-info{color:var(--kl-muted);}
    .klavity-voice-status.kl-vs-info::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--kl-accent);flex:0 0 auto;animation:kl-vdot-pulse 1.2s ease infinite;}
    .klavity-voice-status.kl-vs-err{color:rgb(220 38 38);}
    @media (prefers-reduced-motion: reduce){.klavity-overlay,.klavity-modal,.klavity-modal.kl-closing,.klavity-modal>*, .klavity-toast-progress{animation-duration:.01ms!important;}.klavity-modal{--kl-lift:none;--kl-press:none;--kl-bhover:none;--kl-bpress:none;}.klavity-info,.klavity-rm,.klavity-mk{transition:none!important;}.klavity-actions button.kl-loading{animation:none;}.klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{transition:none;transform:none!important;}}
  `, a.appendChild(Ft);
  const _t = document.createElement("div");
  _t.className = "klavity-overlay";
  const ae = document.createElement("div");
  ae.className = "klavity-modal", ae.innerHTML = `
    ${g ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${ee("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${ee("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${le ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${le.map((y) => `<button type="button" class="kl-type-chip${y.value === e ? " active" : ""}" data-kind="${mt(y.value)}" role="radio" aria-checked="${y.value === e ? "true" : "false"}">${mt(y.label)}${y.mappingLabel ? `<span class="kl-type-map">${mt(y.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${ee("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${ee("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${ee("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${ee("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${S ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${ee(S ? "paperclip" : "image")}</span><span class="kl-upload-label">${S ? "Attach" : "Upload"}</span></button>
        ${H ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${ee("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${ee("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${ee("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${S ? qf : "image/*,.heic,.heif"}" multiple style="display:none">
      ${S ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(k / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${x} images</div>
        ${ye ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${ee("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${S ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${S ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${ee("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${ee("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${ee("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${ee("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      ${ye ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
      ${n.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
      </div>` : ""}
      ${t.onCheckKnown ? '<div class="klavity-known" id="klavity-known" role="status" aria-live="polite" hidden></div>' : ""}
      ${t.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ""}
      ${n.reportClarity && n.preSubmitNudge !== !1 ? `<div class="klavity-nudge" id="klavity-nudge" role="alert" hidden>
        <div class="kl-nudge-h">This might be hard for the team to act on</div>
        <div class="kl-nudge-d">Adding what you expected + one step to reproduce gets it fixed faster. Or send it as-is — your call.</div>
        <div class="kl-nudge-row"><button type="button" class="kl-nudge-add" id="klavity-nudge-add">Add detail</button><button type="button" class="kl-nudge-anyway" id="klavity-nudge-anyway">Submit anyway</button></div>
      </div>` : ""}
      ${n.submitTargetToggle !== !1 ? `<div class="klavity-target" id="klavity-target">
        <div class="kl-tgt-label">Where should this go?</div>
        <div class="kl-tgt-seg" role="radiogroup" aria-label="Where should this report go?">
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${mt(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${ee("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, _t.appendChild(ae), a.appendChild(_t);
  const xe = a.getElementById("klavity-sharp"), _o = a.querySelector(".klavity-info-pop");
  if (xe && _o) {
    const y = document.createElement("div");
    y.className = "kl-float-tip", y.setAttribute("role", "tooltip"), y.innerHTML = _o.innerHTML, a.appendChild(y);
    const M = kf({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    M.style.position = "fixed", a.appendChild(M);
    let E = !1;
    yf().then((O) => {
      E = O;
    }).catch(() => {
    });
    const R = (O, F) => {
      const z = xe.getBoundingClientRect(), B = Math.min(F, window.innerWidth - 16), U = 8, V = window.innerWidth, q = window.innerHeight;
      O.style.left = Math.max(U, Math.min(z.left + z.width / 2 - B / 2, V - B - U)) + "px", O.style.top = "-9999px", O.style.visibility = "hidden", O.style.display = "block";
      const re = O.offsetHeight;
      O.style.display = "";
      let Ce = z.bottom + 8;
      Ce + re + U > q && (Ce = z.top - re - 8), O.style.top = Math.max(U, Math.min(Ce, q - re - U)) + "px", O.style.visibility = "";
    }, T = () => {
      !f && !E ? (y.classList.remove("kl-show"), R(M, 288), M.classList.add("kl-show")) : (M.classList.remove("kl-show"), R(y, 228), y.classList.add("kl-show"));
    }, A = () => {
      y.classList.remove("kl-show"), M.classList.remove("kl-show");
    };
    xe.addEventListener("mouseenter", T), xe.addEventListener("mouseleave", A), xe.addEventListener("focus", T), xe.addEventListener("blur", A);
  }
  let Io = !1, br = null;
  function gi() {
    try {
      br == null || br.remove();
    } catch {
    }
    br = null;
    try {
      xe == null || xe.classList.remove("kl-pulse");
    } catch {
    }
  }
  function nd() {
    var A;
    if (Io || !xe || He) return;
    Io = !0;
    const y = document.createElement("div");
    y.className = "kl-float-tip kl-nudge", y.setAttribute("role", "status"), y.setAttribute("aria-live", "polite"), y.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${ee("x", { size: 13 })}</button></div>`, a.appendChild(y), br = y, y.style.visibility = "hidden", y.style.left = "-9999px", y.style.top = "-9999px", y.style.display = "block";
    const M = 8, E = Math.min(228, window.innerWidth - 16);
    let R = 0;
    const T = () => {
      if (!br || He) return;
      const O = xe.getBoundingClientRect();
      if ((O.width === 0 || O.height === 0) && R++ < 20) {
        requestAnimationFrame(T);
        return;
      }
      const F = window.innerWidth, z = window.innerHeight;
      y.style.visibility = "hidden", y.style.display = "block";
      const B = y.offsetHeight;
      y.style.left = Math.max(M, Math.min(O.right - E, F - E - M)) + "px";
      let U = O.bottom + 8;
      U + B + M > z && (U = O.top - B - 8), y.style.top = Math.max(M, Math.min(U, z - B - M)) + "px", y.style.visibility = "", y.classList.add("kl-show");
    };
    requestAnimationFrame(T), (A = y.querySelector(".kl-nudge-x")) == null || A.addEventListener("click", gi);
    try {
      xe.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => gi(), 9e3);
    } catch {
    }
    xe.addEventListener("click", gi, { once: !0 });
  }
  function id(y) {
    Xe = y === "attached", dt();
  }
  const Lo = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (y, M, E, R, T, A) => pt(y, M, E, !1, !!R, T, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (y, M, E, R, T) => pt(y, M, E, !0, !!R, T),
    close: Wr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: er,
    setReplayState: id,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (y) => {
      if (J = Mn(y), !He)
        try {
          Re(), ki();
        } catch {
        }
    }
  };
  function Re() {
    const y = a.getElementById("klavity-strip"), M = a.getElementById("klavity-counter");
    y.innerHTML = "", c.forEach((E, R) => {
      const T = document.createElement("div");
      T.className = "klavity-thumb", R === Me && T.classList.add("kl-thumb-active");
      const A = document.createElement("img");
      A.src = E, A.title = "Click to select + mark up", A.addEventListener("load", () => {
        A.naturalHeight > A.naturalWidth * 1.4 && T.classList.add("kl-tall");
      }, { once: !0 }), A.addEventListener("click", () => {
        Me = R, P = null, me = null, Re();
      });
      const O = document.createElement("button");
      O.className = "klavity-rm", O.innerHTML = ee("x", { size: 13 }), O.title = "Remove", O.addEventListener("click", (U) => {
        var V;
        U.stopPropagation(), c.splice(R, 1), d.splice(R, 1), o.splice(R, 1), h.splice(R, 1), p.splice(R, 1), delete K[R];
        for (const q of Object.keys(K).map(Number).filter((re) => re > R).sort((re, Ce) => re - Ce))
          K[q - 1] = K[q], delete K[q];
        try {
          (V = t.onShotRemoved) == null || V.call(t, R);
        } catch {
        }
        delete te[R], delete ue[R];
        for (const q of Object.keys(te).map(Number).filter((re) => re > R).sort((re, Ce) => re - Ce))
          te[q - 1] = te[q], delete te[q];
        for (const q of Object.keys(ue).map(Number).filter((re) => re > R).sort((re, Ce) => re - Ce))
          ue[q - 1] = ue[q], delete ue[q];
        c.length === 0 && Ot(null), Re();
      });
      const F = document.createElement("button");
      F.className = "klavity-mk", F.innerHTML = ee("pencil", { size: 13 }), F.title = "Mark up", F.addEventListener("click", (U) => {
        U.stopPropagation(), bd(R);
      });
      const z = document.createElement("div");
      z.className = "klavity-thumb-media", z.append(A, O, F), T.append(z);
      const B = o[R];
      if (B) {
        const U = Uf[B], V = document.createElement("span");
        if (V.className = "klavity-qb kl-q-" + B, V.title = B === "real-pixel" ? "Pixel-perfect capture (every image included)" : B === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', V.innerHTML = ee(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + mt(U.label) + "</span>", z.appendChild(V), U.degraded && t.onRetakeSharp) {
          const q = document.createElement("button");
          q.type = "button", q.className = "klavity-retake", q.innerHTML = ee("zap", { size: 11 }) + "<span>Retake sharp</span>", q.title = "Recapture this shot at full pixel quality", q.addEventListener("click", (re) => {
            re.stopPropagation(), od(R, q);
          }), T.appendChild(q);
        }
      }
      if (Oo.has(R)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", T.appendChild(U);
      }
      y.appendChild(T);
    }), I.forEach((E, R) => {
      if (Cr(E) !== "video") return;
      const T = document.createElement("div");
      T.className = "klavity-thumb kl-video-thumb", P === R && T.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      A.src = E.dataUrl, A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = ee("play", { size: 16 });
      const F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = ee("play", { size: 9 }) + "<span>Video</span>", T.title = "Click to play " + E.name, T.addEventListener("click", () => {
        P = R, me = null, Re();
      });
      const z = document.createElement("button");
      z.className = "klavity-rm", z.innerHTML = ee("x", { size: 13 }), z.title = "Remove", z.addEventListener("click", (U) => {
        U.stopPropagation(), Po(R);
      }), T.append(A, O, F, z);
      const B = Mn(J);
      if (B != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const V = document.createElement("i");
        V.style.width = B + "%", U.appendChild(V), T.appendChild(U);
      }
      y.appendChild(T);
    }), oe.forEach((E, R) => {
      const T = document.createElement("div");
      T.className = "klavity-thumb kl-video-thumb kl-rec-tile", me === R && T.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      A.src = E.dataUrl, A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = ee("play", { size: 16 });
      const F = Math.round(E.durationMs / 1e3), z = document.createElement("span");
      z.className = "kl-video-badge", z.innerHTML = ee("play", { size: 9 }) + `<span>${Math.floor(F / 60)}:${String(F % 60).padStart(2, "0")}${E.screenOnly ? " · screen" : ""}</span>`, T.title = "Click to play your recording", T.addEventListener("click", () => {
        me = R, P = null, Re();
      });
      const B = document.createElement("button");
      B.type = "button", B.className = "kl-rerec", B.innerHTML = ee("refresh-cw", { size: 12 }), B.title = "Re-record", B.setAttribute("aria-label", "Re-record"), B.addEventListener("click", (q) => {
        var re;
        q.stopPropagation(), oe.splice(R, 1), me === R ? me = null : me != null && me > R && (me -= 1), wi();
        try {
          (re = a.getElementById("klavity-record")) == null || re.click();
        } catch {
        }
      });
      const U = document.createElement("button");
      U.className = "klavity-rm", U.innerHTML = ee("x", { size: 13 }), U.title = "Remove", U.addEventListener("click", (q) => {
        q.stopPropagation(), oe.splice(R, 1), me === R ? me = null : me != null && me > R && (me -= 1), wi();
      }), T.append(A, O, z, B, U);
      const V = Mn(J);
      if (V != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const re = document.createElement("i");
        re.style.width = V + "%", q.appendChild(re), T.appendChild(q);
      }
      y.appendChild(T);
    });
    try {
      const E = y.children[Me];
      E && typeof E.scrollIntoView == "function" && E.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const E = document.createElement("div");
      E.className = "kl-thumb-skel kl-loading", E.setAttribute("role", "status"), E.setAttribute("aria-label", "Capturing screenshot"), E.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', y.appendChild(E);
    }
    M.textContent = `${c.length}/${x} images`, M instanceof HTMLElement && (M.hidden = c.length === 0), dt(), hn(), jo();
  }
  function hn() {
    const y = a.getElementById("klavity-sharphint");
    if (!y) return;
    if (c.length > 0 && Me >= 0 && Me < c.length && !!h[Me] && !u && !!t.onCaptureSharp && !kt) {
      if (!y.dataset.built) {
        y.dataset.built = "1", y.innerHTML = "";
        const R = document.createElement("span");
        R.className = "kl-sh-ic", R.innerHTML = ee("triangle-alert", { size: 15 });
        const T = document.createElement("span");
        T.className = "kl-sh-txt", T.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-use", A.textContent = "Use Snap", A.addEventListener("click", () => {
          u = !0, hn(), xe == null || xe.click();
        });
        const O = document.createElement("button");
        O.type = "button", O.className = "kl-sh-x", O.setAttribute("aria-label", "Dismiss"), O.title = "Dismiss", O.innerHTML = ee("x", { size: 12 }), O.addEventListener("click", () => {
          u = !0, hn();
        }), y.append(R, T, A, O);
      }
      y.hidden = !1, xe == null || xe.classList.add("kl-suggest");
    } else
      y.hidden = !0, xe == null || xe.classList.remove("kl-suggest");
  }
  function yi() {
    m = !0, l = !1, Re();
  }
  function sd() {
    return m ? t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function It(y) {
    const M = a.getElementById("klavity-err");
    M && (M.textContent = y, M.style.display = "block");
  }
  function bi() {
    const y = a.getElementById("klavity-err");
    y && (y.style.display = "none");
  }
  function pt(y, M, E, R = !0, T = !1, A, O) {
    var z;
    if (c.length >= x) {
      It(`You can attach up to ${x} images.`);
      return;
    }
    bi(), m = !1, c.push(y);
    const F = c.length - 1;
    if (O && Array.isArray(O.shapes) && O.shapes.length && (K[F] = $e(O)), d.push(t.compressImage ? t.compressImage(y) : Promise.resolve(y)), o.push(M), h.push(T && M !== "real-pixel"), p.push(A), R && (Me = c.length - 1, P = null, me = null), Re(), R)
      try {
        (z = t.onShotAdded) == null || z.call(t, y, M);
      } catch {
      }
  }
  const Oo = /* @__PURE__ */ new Set();
  async function od(y, M) {
    if (!(kt || !t.onRetakeSharp)) {
      tt(!0), M.classList.add("kl-loading"), s.style.display = "none";
      try {
        const E = i ? or(document.body) : null;
        let R;
        try {
          R = await t.onRetakeSharp(p[y]);
        } finally {
          E == null || E();
        }
        if (R) {
          const { dataUrl: T, quality: A } = Nt(R);
          T && (c[y] = T, d[y] = t.compressImage ? t.compressImage(T) : Promise.resolve(T), o[y] = A ?? "real-pixel", h[y] = !1, K[y] && (delete K[y], Oo.add(y), fe(y)), delete te[y], delete ue[y]);
        }
      } catch {
      } finally {
        s.style.display = "", tt(!1), Re();
      }
    }
  }
  function No(y) {
    return y.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(y.name);
  }
  async function vi(y) {
    bi();
    for (const M of y) {
      if (c.length >= x) {
        It(`You can attach up to ${x} images.`);
        break;
      }
      if (!No(M)) {
        It(`"${M.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (M.size > b) {
        It(`"${M.name}" is too large — images must be under ${Math.round(b / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        pt(await Ma(M));
      } catch {
        It(`Couldn't add "${M.name}". Please try a different image.`);
      }
    }
  }
  function ki() {
    const y = a.getElementById("klavity-files");
    if (!y) return;
    y.innerHTML = "";
    const M = I.filter((E) => Cr(E) === "file");
    y.hidden = M.length === 0, I.forEach((E, R) => {
      if (Cr(E) !== "file") return;
      const T = document.createElement("div");
      T.className = "kl-file-chip";
      const A = document.createElement("span");
      A.className = "kl-file-ic", A.innerHTML = ee("file-text", { size: 14 });
      const O = document.createElement("span");
      O.className = "kl-file-nm", O.textContent = E.name, O.title = E.name;
      const F = document.createElement("span");
      F.className = "kl-file-sz", F.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const z = document.createElement("button");
      z.type = "button", z.className = "kl-file-rm", z.setAttribute("aria-label", `Remove ${E.name}`), z.title = "Remove", z.innerHTML = ee("x", { size: 11 }), z.addEventListener("click", () => {
        Po(R);
      }), T.append(A, O, F, z);
      const B = Mn(J);
      if (B != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const V = document.createElement("i");
        V.style.width = B + "%", U.appendChild(V), T.appendChild(U);
      }
      y.appendChild(T);
    }), dt();
  }
  function Po(y) {
    const M = I[y] && Cr(I[y]) === "video";
    I.splice(y, 1), P != null && (M && P === y ? P = null : P > y && (P -= 1)), ki(), Re();
  }
  function ad(y, M) {
    if (y.kind === "upgrade") {
      if (!y.url) return null;
      const R = document.createElement("a");
      return R.className = "kl-capmsg-cta", R.href = y.url, R.target = "_blank", R.rel = "noopener noreferrer", R.textContent = y.label, R;
    }
    if (!t.onRequestUpgrade) return null;
    const E = document.createElement("button");
    return E.type = "button", E.className = "kl-capmsg-cta kl-capmsg-req", E.textContent = y.label, E.addEventListener("click", async () => {
      if (E.disabled) return;
      const R = E.textContent || y.label;
      E.disabled = !0, E.textContent = "Requesting…";
      let T = !1;
      try {
        T = await t.onRequestUpgrade({ reason: y.reason || "upgrade", context: M });
      } catch {
        T = !1;
      }
      if (T) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-sent", A.innerHTML = `<span class="kl-capmsg-sent-ic">${ee("check")}</span>Request sent to your team`, E.replaceWith(A);
      } else
        E.disabled = !1, E.textContent = R;
    }), E;
  }
  function ld(y, M) {
    const E = a.getElementById("klavity-capmsg");
    if (!E || !y.overCap) return;
    E.innerHTML = "";
    const R = document.createElement("span");
    if (R.className = "kl-capmsg-t", R.textContent = y.message || "", E.appendChild(R), y.cta) {
      const T = ad(y.cta, M);
      if (T && E.appendChild(T), y.cta.hint) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-hint", A.textContent = y.cta.hint, E.appendChild(A);
      }
    }
    E.hidden = !1;
  }
  function cd() {
    const y = a.getElementById("klavity-capmsg");
    y && (y.hidden = !0, y.innerHTML = "");
  }
  async function ud(y) {
    bi(), cd();
    for (const M of y) {
      if (No(M)) {
        await vi([M]);
        continue;
      }
      if (I.length >= w) {
        It(`You can attach up to ${w} files.`);
        break;
      }
      const E = Vf(M, { capBytes: k, role: C, upgradeUrl: L });
      if (E.overCap) {
        ld(E, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: M.name, sizeMb: Math.round(M.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (I.reduce((T, A) => T + A.size, 0) + M.size > D) {
        It(`Attachments exceed the ${Math.round(D / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const T = M.type || (Uc(M) ? Bf(M.name) : ""), A = I.push({ name: M.name, type: T, size: M.size, dataUrl: await Ma(M) }) - 1;
        ki(), Cr(I[A]) === "video" && (P = A), Re();
      } catch {
        It(`Couldn't add "${M.name}". Please try a different file.`);
      }
    }
  }
  function wi() {
    He || (Re(), dt());
  }
  let tr = null;
  function Wr(y) {
    var R;
    if (He) return;
    He = !0, tr == null || tr(), We && (clearTimeout(We), We = null), document.removeEventListener("keydown", rr, { capture: !0 }), document.removeEventListener("paste", zo);
    try {
      (R = t.onClose) == null || R.call(t, y == null ? void 0 : y.reason);
    } catch {
    }
    const M = a.querySelector(".klavity-modal");
    if (y != null && y.immediate || !M) {
      Be(s);
      return;
    }
    M.classList.add("kl-closing");
    const E = () => Be(s);
    M.addEventListener("animationend", E, { once: !0 }), setTimeout(E, 700);
  }
  function Do(y, M) {
    if (We || He) return;
    const E = document.createElement("div");
    E.className = "klavity-toast-progress", E.style.animationDuration = M + "ms", y.appendChild(E);
    let R = M, T = Date.now();
    const A = () => {
      T = Date.now(), We = setTimeout(() => {
        Wr();
      }, R);
    }, O = () => {
      We && (clearTimeout(We), We = null, R = Math.max(0, R - (Date.now() - T)), E.style.animationPlayState = "paused");
    }, F = () => {
      We || y.classList.contains("kl-closing") || (E.style.animationPlayState = "running", A());
    };
    y.addEventListener("mouseenter", O), y.addEventListener("mouseleave", F), y.addEventListener("focusin", O), y.addEventListener("focusout", (z) => {
      y.contains(z.relatedTarget) || F();
    }), A();
  }
  function rr(y) {
    var M;
    if (mn) {
      y.key === "Escape" ? (y.stopPropagation(), mn()) : (y.key === "s" || y.key === "S") && y.stopPropagation();
      return;
    }
    if (y.key === "Escape") {
      y.stopPropagation(), Ci();
      return;
    }
    if ((y.key === "s" || y.key === "S") && !y.metaKey && !y.ctrlKey && !y.altKey) {
      const E = typeof y.composedPath == "function" && y.composedPath()[0] || y.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable || ((M = E.getAttribute) == null ? void 0 : M.call(E, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const R = a.getElementById("klavity-submit");
      R && !R.disabled && (y.preventDefault(), y.stopPropagation(), R.click());
    }
  }
  document.addEventListener("keydown", rr, { capture: !0 });
  const zo = (y) => {
    if (!y.clipboardData) return;
    const M = Array.from(y.clipboardData.items).filter((E) => E.type.startsWith("image/")).map((E) => E.getAsFile()).filter((E) => !!E);
    M.length && vi(M);
  };
  document.addEventListener("paste", zo);
  const xi = () => {
    const y = ae.querySelector("#klavity-desc");
    y && (y.placeholder = ce === "feature" ? "Describe the feature you'd like..." : ce === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (le) {
    const y = Array.from(ae.querySelectorAll(".kl-type-chip"));
    y.forEach((M) => {
      M.addEventListener("click", () => {
        ce = M.getAttribute("data-kind") || "bug", y.forEach((E) => {
          const R = E === M;
          E.classList.toggle("active", R), E.setAttribute("aria-checked", R ? "true" : "false");
        }), xi();
      });
    });
  } else {
    const y = ae.querySelector(".bug"), M = ae.querySelector(".feat");
    y.addEventListener("click", () => {
      ce = "bug", y.classList.add("active"), M.classList.remove("active"), xi();
    }), M.addEventListener("click", () => {
      ce = "feature", M.classList.add("active"), y.classList.remove("active"), xi();
    });
  }
  let Fo = "project";
  {
    const y = ae.querySelector("#klavity-target");
    if (y) {
      const M = Array.from(y.querySelectorAll(".kl-tgt-opt"));
      for (const E of M)
        E.addEventListener("click", () => {
          Fo = E.dataset.target === "klavity" ? "klavity" : "project";
          for (const T of M) {
            const A = T === E;
            T.classList.toggle("on", A), T.setAttribute("aria-checked", A ? "true" : "false");
          }
        });
    }
  }
  const ne = ae.querySelector("#klavity-desc");
  {
    const y = () => {
      try {
        return a.getSelection ? a.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, M = () => {
      const T = y();
      if (!T || !T.rangeCount) return -1;
      try {
        const A = T.getRangeAt(0);
        if (!ne.contains(A.endContainer)) return -1;
        const O = A.cloneRange();
        return O.selectNodeContents(ne), O.setEnd(A.endContainer, A.endOffset), O.toString().length;
      } catch {
        return -1;
      }
    }, E = (T) => {
      const A = y();
      if (A)
        try {
          const O = document.createRange(), F = document.createTreeWalker(ne, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let z, B = T, U = !1;
          for (; z = F.nextNode(); ) {
            if (z.nodeName === "BR") {
              if (B === 0) {
                O.setStartBefore(z), U = !0;
                break;
              }
              B -= 1;
              continue;
            }
            if (z.nodeType === 3) {
              const V = (z.textContent || "").length;
              if (B <= V) {
                O.setStart(z, B), U = !0;
                break;
              }
              B -= V;
            }
          }
          U ? O.collapse(!0) : (O.selectNodeContents(ne), O.collapse(!1)), A.removeAllRanges(), A.addRange(O);
        } catch {
        }
    }, R = () => {
      const T = M(), A = Sa(ne).replace(/\n$/, "");
      ne.innerHTML = A ? xa(A) : "", T >= 0 && E(T);
    };
    ne.addEventListener("input", R), Object.defineProperty(ne, "value", {
      configurable: !0,
      get() {
        return Sa(ne);
      },
      set(T) {
        const A = String(T ?? "").replace(/\n$/, "");
        ne.innerHTML = A ? xa(A) : "";
      }
    }), Object.defineProperty(ne, "disabled", {
      configurable: !0,
      get() {
        return ne.getAttribute("contenteditable") === "false";
      },
      set(T) {
        ne.setAttribute("contenteditable", T ? "false" : "true"), ne.classList.toggle("kl-desc-disabled", !!T);
      }
    }), Object.defineProperty(ne, "placeholder", {
      configurable: !0,
      get() {
        return ne.getAttribute("data-ph") || "";
      },
      set(T) {
        ne.setAttribute("data-ph", String(T ?? ""));
      }
    });
  }
  const nr = ae.querySelector("#klavity-submit"), Lt = ae.querySelector("#klavity-remail");
  Lt && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (Lt.value = t.prefillEmail);
  const $o = ae.querySelector("#klavity-desc-hint"), dd = () => !t.requireEmail || !!Lt && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Lt.value.trim()), Si = () => c.length > 0 || Xe || I.length > 0 || oe.length > 0;
  let fn = null, mn = null;
  const Ci = () => {
    var R, T, A;
    if (!Si()) {
      Wr();
      return;
    }
    if (fn) return;
    const y = document.createElement("div");
    fn = y, y.setAttribute("role", "alertdialog"), y.setAttribute("aria-modal", "true"), y.setAttribute("aria-labelledby", "kl-cc-title"), y.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", y.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const M = () => {
      Be(y), fn === y && (fn = null, mn = null);
    };
    mn = M, y.addEventListener("click", (O) => {
      O.target === y && M();
    }), (R = y.querySelector("#kl-cc-keep")) == null || R.addEventListener("click", M), (T = y.querySelector("#kl-cc-discard")) == null || T.addEventListener("click", () => {
      M(), Wr();
    }), (a.querySelector(".klavity-modal") || _t).appendChild(y);
    try {
      (A = y.querySelector("#kl-cc-keep")) == null || A.focus();
    } catch {
    }
  }, pd = () => {
  }, dt = () => {
    const y = ne.value.trim() === "";
    nr.disabled = y && !Si() || !dd(), $o && ($o.hidden = !(y && Si()));
  };
  if (ne.addEventListener("input", pd), ne.addEventListener("input", dt), Lt == null || Lt.addEventListener("input", dt), t.onEnhance) {
    const y = t.onEnhance, M = ae.querySelector("#klavity-enhance"), E = ae.querySelector("#klavity-enhance-undo"), R = ae.querySelector("#klavity-enhance-regen"), T = ae.querySelector("#klavity-enhance-spin");
    let A = 0, O = null;
    const F = () => c[Me] || c[0] || "", z = async () => {
      if (kt) return;
      const B = ne.value.trim();
      O = ne.value;
      const U = ++A;
      M && (M.disabled = !0), T && (T.hidden = !1);
      try {
        const V = he ? { selector: he.selector, text: he.text } : null, q = await y(B, { images: c.length, shot: F(), picked: V });
        if (U !== A || !q) return;
        ne.value = Nf(q), ne.dispatchEvent(new Event("input", { bubbles: !0 })), De = q.suggestedSeverity || null, Fe = q.suggestedPriority || null, ne.classList.add("kl-just-enhanced"), setTimeout(() => ne.classList.remove("kl-just-enhanced"), 700), E && (E.hidden = !1), R && (R.hidden = !1), dt();
      } catch {
      } finally {
        U === A && (M && (M.disabled = !1), T && (T.hidden = !0));
      }
    };
    M == null || M.addEventListener("click", () => {
      z();
    }), R == null || R.addEventListener("click", () => {
      z();
    }), E == null || E.addEventListener("click", () => {
      O !== null && (ne.value = O, ne.dispatchEvent(new Event("input", { bubbles: !0 })), dt()), O = null, De = null, Fe = null, E && (E.hidden = !0), R && (R.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const y = ae.querySelector("#klavity-known"), M = t.onCheckKnown;
    let E = null, R = 0, T = "";
    const A = () => {
      y && (y.hidden = !0, y.textContent = "");
    }, O = (z) => {
      var U;
      if (!y) return;
      const B = z.headline ? mt(z.headline) : "Already reported";
      y.innerHTML = `<span class="kl-known-ic">${ee("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${B}</span> — status: <span class="kl-known-status">${mt(z.statusLabel)}</span>. We're already tracking "${mt(z.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, y.hidden = !1, (U = y.querySelector("#klavity-known-dismiss")) == null || U.addEventListener("click", () => {
        T = ne.value.trim(), A();
      });
    }, F = async () => {
      const z = ne.value.trim();
      if (z.length < 12 || z === T) {
        A();
        return;
      }
      const B = ++R;
      try {
        const U = await M(z);
        if (B !== R) return;
        if (ne.value.trim() === T) {
          A();
          return;
        }
        U ? O(U) : A();
      } catch {
      }
    };
    ne.addEventListener("input", () => {
      ne.value.trim() !== T && (T = ""), E && clearTimeout(E), E = setTimeout(F, 500);
    });
  }
  if (n.reportClarity) {
    const y = ae.querySelector("#klavity-clarity"), M = ae.querySelector("#klavity-clarity-status"), E = {
      problem: ae.querySelector("#klavity-clarity-problem"),
      expected: ae.querySelector("#klavity-clarity-expected"),
      repro: ae.querySelector("#klavity-clarity-repro")
    }, R = ae.querySelector("#klavity-clarity-tip"), T = ae.querySelector("#klavity-clarity-tip-text"), A = ae.querySelector("#klavity-nudge"), O = t.onClarityTip, F = /* @__PURE__ */ new Map();
    let z = null, B = 0;
    const U = (ie, j, be) => {
      if (!ie) return;
      ie.classList.toggle("done", j);
      const je = ie.querySelector(".kl-clr-mark");
      je && (je.innerHTML = j ? ee("check", { size: 12 }) : "○"), ie.setAttribute("aria-label", (j ? "covered: " : "missing: ") + be);
    }, V = () => {
      R && (R.hidden = !0);
    }, q = (ie) => {
      !R || !T || gf(ie) || (T.innerHTML = mt(ie) + '<span class="kl-clr-aitag">AI</span>', R.hidden = !1);
    }, re = () => {
      const ie = ne.value, j = Dc(ie);
      y && (y.hidden = ie.trim().length === 0, y.classList.remove("l1", "l2", "l3"), y.classList.add(j.level === "great" ? "l3" : j.level === "good" ? "l2" : "l1")), M && (M.textContent = j.label), U(E.problem, j.coverage.problem, "What's broken"), U(E.expected, j.coverage.expected, "What you expected"), U(E.repro, j.coverage.repro, "How to reproduce"), A && !A.hidden && (A.hidden = !0), j.level === "great" && V();
    }, Ce = () => {
      !O || !R || (z && clearTimeout(z), z = setTimeout(async () => {
        const ie = ne.value.trim();
        if (!ff(ie)) {
          V();
          return;
        }
        if (F.has(ie)) {
          q(F.get(ie));
          return;
        }
        const j = ++B;
        try {
          const be = await O(ie, { images: c.length });
          if (j !== B || ne.value.trim() !== ie) return;
          be && be.tip && (F.set(ie, be.tip), q(be.tip));
        } catch {
        }
      }, 1e3));
    };
    ne.addEventListener("input", () => {
      re(), Ce();
    }), re(), (Yo = ae.querySelector("#klavity-nudge-add")) == null || Yo.addEventListener("click", () => {
      A && (A.hidden = !0);
      try {
        ne.focus();
      } catch {
      }
    }), (Go = ae.querySelector("#klavity-nudge-anyway")) == null || Go.addEventListener("click", () => {
      A && (A.hidden = !0), nr.click();
    });
  }
  _t.addEventListener("click", (y) => {
    y.target === _t && Ci();
  }), (Xo = ae.querySelector("#klavity-x")) == null || Xo.addEventListener("click", () => Ci()), (Ko = ae.querySelector("#klavity-min")) == null || Ko.addEventListener("click", () => {
    var y;
    try {
      (y = t.onMinimize) == null || y.call(t);
    } catch {
    }
  });
  const Uo = () => Array.from(ae.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let kt = !1;
  const tt = (y) => {
    kt = y, Uo().forEach((E) => {
      E.disabled = y;
    }), ne.disabled = y;
    const M = ae.querySelector("#klavity-voice");
    M && (M.disabled = y), ae.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((E) => {
      E.disabled = y;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((E) => {
      E.disabled = y;
    }), y ? (tr == null || tr(), nr.disabled = !0) : (dt(), hn());
  }, Ot = (y) => {
    Uo().forEach((M) => {
      M.classList.remove("kl-active"), M.removeAttribute("aria-pressed");
    }), y && (y.classList.add("kl-active"), y.setAttribute("aria-pressed", "true"));
  }, $t = ae.querySelector("#klavity-voice");
  if ($t) {
    const E = $t.querySelector(".kl-vring-prog");
    let R = 0, T = 0, A = !1, O, F = "";
    const z = () => {
      T = Date.now();
      const de = () => {
        const Ee = Date.now() - T, Se = Math.min(Ee / 18e4, 1);
        if (E == null || E.setAttribute("stroke-dashoffset", String(Se * 81.68)), Ee >= 165e3 && $t.classList.add("kl-voice-warn"), Ee >= 18e4) {
          O.stop();
          return;
        }
        R = requestAnimationFrame(de);
      };
      R = requestAnimationFrame(de);
    }, B = () => {
      cancelAnimationFrame(R), E == null || E.setAttribute("stroke-dashoffset", String(81.68)), $t.classList.remove("kl-voice-warn");
    }, U = ae.querySelector("#klavity-voice-status");
    let V = null;
    const q = () => {
      V && (clearTimeout(V), V = null), U && (U.hidden = !0, U.textContent = "", U.classList.remove("kl-vs-info", "kl-vs-err"));
    }, re = (de, Ee, Se) => {
      !U || !Ee || (V && (clearTimeout(V), V = null), U.classList.remove("kl-vs-info", "kl-vs-err"), U.classList.add(de === "err" ? "kl-vs-err" : "kl-vs-info"), U.textContent = Ee, U.hidden = !1, Se && (V = setTimeout(q, Se)));
    }, Ce = "Recording — tap to stop", ie = () => {
      U && U.classList.contains("kl-vs-info") && q();
    }, j = (de) => {
      $t.classList.toggle("kl-voice-rec", de), $t.setAttribute("aria-pressed", de ? "true" : "false"), $t.setAttribute("aria-label", de ? "Stop recording" : "Voice dictation"), $t.title = de ? Ce : "Voice dictation";
    }, be = (de) => {
      de.onTranscript = (Ee) => {
        const Se = ne.value;
        ne.value = Se + (Se.length > 0 && !/\s$/.test(Se) ? " " : "") + Ee, dt();
      }, de.onStatus = (Ee, Se) => {
        Ee === "idle" ? ie() : re("info", Se);
      }, de.onError = (Ee, Se) => {
        Se && re("err", Se, 4e3);
      }, de.onStop = () => {
        A = !1, j(!1), B(), ie();
      };
    }, je = () => {
      const de = new Jr();
      return be(de), de;
    }, Ke = () => {
      if (!A) {
        j(!1), B(), ie();
        return;
      }
      Jr.isSupported() ? (O = je(), re("info", "Reconnecting dictation…"), O.start()) : (A = !1, j(!1), B(), re("err", "Voice dictation is unavailable right now", 4e3));
    }, rt = () => {
      if (!(_ === "server" && t.onDictate)) return null;
      const de = new Hn({ transcribe: (Ee) => t.onDictate(Ee) });
      return be(de), de.onUnavailable = Ke, de;
    }, jt = (de) => {
      const Ee = () => F.length > 0 && !/\s$/.test(F) ? " " : "";
      let Se = "";
      de.onTranscript = (Y) => {
        Se = "", F = F + Ee() + Y, ne.value = F, dt();
      }, de.onInterim = (Y) => {
        Se = Y || "", ne.value = F + Ee() + Y, dt();
      }, de.onStatus = (Y, se) => {
        Y === "idle" ? ie() : re("info", se);
      }, de.onError = (Y, se) => {
        se && re("err", se, 4e3);
      }, de.onStop = () => {
        Se && (F = F + Ee() + Se, Se = ""), ne.value = F, A = !1, j(!1), B(), ie(), dt();
      }, de.onUnavailable = () => {
        if (ne.value = F, !A) {
          j(!1), B(), ie();
          return;
        }
        const Y = rt();
        if (Y) {
          O = Y, re("info", "Reconnecting dictation…"), O.start();
          return;
        }
        Ke();
      };
    }, ht = () => {
      if (_ === "server" && t.dictationStreamUrl && jn.isSupported()) {
        const de = new jn({ url: t.dictationStreamUrl });
        return jt(de), de;
      }
      return rt() ?? je();
    };
    O = ht(), $t.addEventListener("click", () => {
      A ? O.stop() : (q(), F = ne.value, O = ht(), A = !0, j(!0), O.start(), z());
    }), tr = () => {
      A && O.stop();
    };
  }
  nr.addEventListener("click", async () => {
    var ie;
    if (kt || nr.disabled) return;
    const y = ne.value.trim(), M = ae.querySelector("#klavity-title"), E = M ? M.value.trim() : "", R = ce === "feature" ? "feature" : "bug", T = d.slice(), A = Oe(), O = I.slice(), F = oe.slice(), z = ce, B = (Lt == null ? void 0 : Lt.value.trim()) || void 0;
    tt(!0), nr.textContent = "Uploading…";
    const U = a.getElementById("klavity-err");
    U.style.display = "none";
    const V = a.getElementById("klavity-progress"), q = a.getElementById("klavity-progress-fill");
    V && q && (V.classList.add("show"), q.style.transition = "none", q.style.width = "8%", q.offsetWidth, q.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      q.style.width = "90%";
    }));
    const re = () => {
      q && (q.style.transition = "width .25s ease", q.style.width = "100%");
    }, Ce = () => {
      V && q && (V.classList.remove("show"), q.style.transition = "none", q.style.width = "0");
    };
    try {
      const j = await Promise.all(T), be = {
        type: R,
        ...le ? { kind: z } : {},
        ...E ? { title: E } : {},
        description: y,
        screenshots: j,
        ...O.length ? { files: O } : {},
        ...F.length ? { recordings: F } : {},
        annotations: A,
        reporterEmail: B,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Fo } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...De ? { suggestedSeverity: De } : {},
        ...Fe ? { suggestedPriority: Fe } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((ie = a.getElementById("klavity-conlog-cb")) != null && ie.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(be), Wr({ immediate: !0, reason: "submitted" });
        return;
      }
      const je = await t.onSubmit(be);
      if (He) return;
      re(), t.success ? kd(je.issueKey, je.issueUrl, t.success) : vd(je.issueKey, je.issueUrl);
    } catch (j) {
      Ce();
      const be = (j == null ? void 0 : j.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", j);
      } catch {
      }
      U.textContent = n.debug ? `Couldn't submit your report — ${be}` : "Couldn't submit your report. Please check your connection and try again.", U.style.display = "block", nr.textContent = "Submit", tt(!1);
    }
  });
  function hd(y, M) {
    const { dataUrl: E, quality: R, suggestSharp: T } = Nt(M);
    if (!E) return;
    const A = c.indexOf(y);
    A < 0 || (c[A] = E, d[A] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), o[A] = R, h[A] = !!T && R !== "real-pixel", K[A] && delete K[A], delete te[A], delete ue[A], Re());
  }
  async function fd(y) {
    if (!t.onCaptureViewport) return !1;
    let M = null;
    const E = i ? or(document.body) : null;
    try {
      const { dataUrl: R } = Nt(await t.onCaptureViewport());
      R && (M = R, l = !1, pt(R, "rendered", void 0, !0, !1), y && Ot(y));
    } catch {
    } finally {
      E == null || E();
    }
    return (async () => {
      const R = i ? or(document.body) : null;
      try {
        const T = await t.onCaptureFull();
        if (M) hd(M, T);
        else {
          l = !1;
          const { dataUrl: A, quality: O, suggestSharp: F } = Nt(T);
          A && (pt(A, O, void 0, !0, !!F), y && Ot(y));
        }
      } catch {
        l = !1, Re();
      } finally {
        R == null || R();
      }
    })(), !0;
  }
  async function Bo(y) {
    if (!t.onCaptureViewport) return !1;
    const M = i ? or(document.body) : null;
    try {
      const { dataUrl: E, blank: R } = Nt(await t.onCaptureViewport());
      R && c.length === 0 ? yi() : E ? (l = !1, pt(E, "rendered", void 0, !0, !1)) : (l = !1, Re());
    } catch {
      l = !1, Re();
    } finally {
      M == null || M();
    }
    return !0;
  }
  const ir = ae.querySelector("#klavity-full");
  ir.addEventListener("click", async () => {
    if (!kt && !(t.onCaptureSharp && await Ei())) {
      tt(!0), ir.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await fd(ir);
          return;
        }
        const y = i ? or(document.body) : null;
        try {
          const { dataUrl: M, quality: E, suggestSharp: R } = Nt(await t.onCaptureFull());
          pt(M, E, void 0, !0, !!R), Ot(ir);
        } finally {
          y == null || y();
        }
      } catch {
      } finally {
        ir.classList.remove("kl-loading"), tt(!1);
      }
    }
  });
  async function Ei(y) {
    const M = y != null && y.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (kt || !M || !xe) return !1;
    const E = xe.querySelector(".kl-sharp-label");
    tt(!0), xe.classList.add("kl-loading"), s.style.display = "none";
    const R = E ?? xe, T = R.textContent;
    R.textContent = "Capturing…";
    let A = !1;
    try {
      const O = i ? or(document.body) : null;
      let F;
      try {
        F = await M();
      } finally {
        O == null || O();
      }
      if (F) {
        const { dataUrl: z, quality: B } = Nt(F);
        z && (pt(z, B ?? "real-pixel", void 0, !0, !1, { kind: y != null && y.viewport ? "viewport" : "full" }), Ot(xe), A = !0, f = !0);
      }
    } catch (O) {
      if ($f(O))
        try {
          nd();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", O);
        } catch {
        }
    } finally {
      s.style.display = "", R.textContent = T, xe.classList.remove("kl-loading"), tt(!1);
    }
    return A;
  }
  xe && t.onCaptureSharp && xe.addEventListener("click", () => {
    Ei();
  });
  const qo = ae.querySelector("#klavity-file"), Wo = ae.querySelector("#klavity-upload");
  Wo.addEventListener("click", () => {
    if (!kt) {
      if (!S && c.length >= x) {
        It(`You can attach up to ${x} images.`);
        return;
      }
      qo.click();
    }
  }), qo.addEventListener("change", async (y) => {
    const M = y.target, E = M.files ? Array.from(M.files) : [];
    if (M.value = "", !E.length) return;
    const R = c.length, T = I.length;
    S ? await ud(E) : await vi(E), (c.length > R || I.length > T) && Ot(Wo);
  });
  const Hr = a.getElementById("klavity-record");
  Hr && t.onRecord && Hr.addEventListener("click", async () => {
    if (kt) return;
    if (oe.length >= Le) {
      It(`You can attach up to ${Le} recordings.`);
      return;
    }
    tt(!0), Hr.classList.add("kl-loading");
    const y = (M) => {
      s.style.display = M === "recording" ? "none" : "";
    };
    try {
      const M = await t.onRecord(y);
      M && (oe.push(M), me = oe.length - 1, P = null, wi(), Ot(Hr));
    } catch {
    } finally {
      s.style.display = "", Hr.classList.remove("kl-loading"), tt(!1);
    }
  });
  const Mi = a.getElementById("klavity-region");
  Mi && t.onRegionCapture && (Mi.onclick = () => {
    kt || (tt(!0), document.removeEventListener("keydown", rr, { capture: !0 }), s.style.display = "none", Gf(async (y) => {
      document.addEventListener("keydown", rr, { capture: !0 });
      try {
        const M = i ? or(document.body) : null;
        let E;
        try {
          E = await t.onRegionCapture(y);
        } finally {
          M == null || M();
        }
        if (E) {
          const { dataUrl: R, quality: T, suggestSharp: A } = Nt(E);
          R && (pt(R, T, void 0, !0, !!A, { kind: "region", rect: y }), Ot(Mi));
        }
      } finally {
        s.style.display = "", tt(!1);
      }
    }, () => {
      document.addEventListener("keydown", rr, { capture: !0 }), s.style.display = "", tt(!1);
    }));
  });
  const vr = a.getElementById("klavity-pick"), kr = a.getElementById("klavity-pickinfo"), Ho = () => {
    var E;
    if (vr && (vr.classList.toggle("kl-active", !!he), he ? vr.setAttribute("aria-pressed", "true") : vr.removeAttribute("aria-pressed")), !kr) return;
    if (!he) {
      kr.hidden = !0, kr.innerHTML = "";
      return;
    }
    kr.hidden = !1;
    const { text: y } = he, M = y ? `: <span class="kl-pick-txt">${mt(y)}</span>` : "";
    kr.innerHTML = `<span class="kl-pick-ic">${ee("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${M}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (E = kr.querySelector("#klavity-pick-clear")) == null || E.addEventListener("click", () => {
      he = null, Ho();
    });
  };
  vr && t.onPickElement && (vr.onclick = async () => {
    if (!kt) {
      tt(!0), document.removeEventListener("keydown", rr, { capture: !0 }), s.style.display = "none";
      try {
        const y = await t.onPickElement();
        y && (he = y, Ho(), y.shot && pt(y.shot, y.shotQuality, void 0, !0, !1, { kind: "element", selector: y.selector, rect: y.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", rr, { capture: !0 }), s.style.display = "", tt(!1);
      }
    }
  });
  function wt(y, M = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${y}</svg>`;
  }
  function md(y) {
    const M = (A, O, F, z) => `<button type="button" class="kl-htool" data-tool="${A}" title="${O} (${z.toUpperCase()})" aria-label="${O}">${F}<span class="kl-hk">${z.toUpperCase()}</span></button>`, E = (A) => {
      const O = A.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(O)) return !1;
      const F = parseInt(O.slice(0, 2), 16), z = parseInt(O.slice(2, 4), 16), B = parseInt(O.slice(4, 6), 16);
      return (0.2126 * F + 0.7152 * z + 0.0722 * B) / 255 > 0.7;
    }, R = (A) => `<button type="button" class="kl-hcolor${E(A) ? " kl-hcolor-light" : ""}" data-color="${A}" style="background:${A}" title="${A}" aria-label="Colour ${A}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + M("pen", "Pen", ee("pencil", { size: 15 }), "p") + M("line", "Line", wt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + M("rect", "Rectangle", ee("square", { size: 15 }), "r") + M("circle", "Circle", wt('<circle cx="12" cy="12" r="9"/>'), "o") + M("arrow", "Arrow", wt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + M("text", "Text", wt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + M("count", "Numbers", wt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${ee("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + M("pixelate", "Redact (pixelate)", wt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + M("crop", "Crop", wt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + R("#ef4444") + R("#f97316") + R("#16a34a") + R("#3b82f6") + R("#ffffff") + R("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${wt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (y ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${wt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${ee("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function jr() {
    qe && (document.removeEventListener("keydown", qe, { capture: !0 }), qe = null);
  }
  function Ri() {
    const y = a.getElementById("klavity-hero-stage"), M = a.getElementById("klavity-hero-tools");
    M && (M.innerHTML = ""), y && (y.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${ee("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${mt(sd())}</span></div>`), jr();
  }
  function jo() {
    var y;
    if (P != null && !(I[P] && Cr(I[P]) === "video") && (P = null), me != null && !oe[me] && (me = null), me != null) {
      Vo(oe[me].dataUrl);
      return;
    }
    if (P != null) {
      Vo((y = I[P]) == null ? void 0 : y.dataUrl);
      return;
    }
    if (c.length === 0) {
      Me = 0, Ri();
      return;
    }
    Me >= c.length && (Me = c.length - 1), Me < 0 && (Me = 0), yd(Me);
  }
  function Vo(y) {
    const M = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!M || !y) {
      Ri();
      return;
    }
    jr(), E && (E.innerHTML = ""), M.innerHTML = "";
    const R = document.createElement("video");
    R.src = y, R.controls = !0, R.setAttribute("playsinline", ""), R.preload = "metadata", R.className = "kl-hero-video", R.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", M.appendChild(R);
  }
  function gd(y, M, E, R, T) {
    const A = c[y];
    if (!A) return;
    const O = new Image();
    O.onload = () => {
      var re, Ce;
      if (c[y] !== A) return;
      const F = document.createElement("canvas");
      F.width = Math.max(1, Math.round(R)), F.height = Math.max(1, Math.round(T));
      const z = F.getContext("2d");
      if (!z) return;
      z.drawImage(O, M, E, R, T, 0, 0, F.width, F.height);
      let B;
      try {
        B = F.toDataURL("image/png");
      } catch {
        return;
      }
      const U = ((re = te[y]) == null ? void 0 : re.length) ?? 0, V = ke(y);
      c[y] = B, d[y] = t.compressImage ? t.compressImage(B) : Promise.resolve(B);
      const q = (Ce = K[y]) == null ? void 0 : Ce.shapes;
      Array.isArray(q) && q.length ? K[y] = { w: F.width, h: F.height, shapes: Of(q, -M, -E) } : delete K[y], (te[y] ?? (te[y] = [])).push(V), (ue[y] ?? (ue[y] = [])).push({ snap: V, mark: U }), fe(y), Re();
    }, O.src = A;
  }
  function yd(y) {
    var z, B, U, V, q, re, Ce;
    const M = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!M || !E) return;
    const R = c[y];
    if (!R) {
      Ri();
      return;
    }
    jr(), M.innerHTML = "";
    const T = document.createElement("canvas");
    T.width = 1, T.height = 1, T.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const A = new ya(T, R), O = (z = K[y]) == null ? void 0 : z.shapes;
    Array.isArray(O) && O.forEach((ie) => A.shapes.push({ ...ie })), M.appendChild(T);
    const F = new Image();
    F.onload = () => {
      !document.body.contains(s) || Me !== y || c[y] !== R || (T.width = F.naturalWidth || 1, T.height = F.naturalHeight || 1, A.redraw());
    }, F.src = R, A.redraw();
    {
      E.innerHTML = md((((B = ue[y]) == null ? void 0 : B.length) ?? 0) > 0);
      const ie = E.querySelector("#kl-hero-logo");
      ie && (ie.href = If(n.projectId));
      let j = "pen", be = "#ef4444", je = 26, Ke = "black", rt = null;
      const jt = E.querySelector("#kl-hero-textopts"), ht = () => {
        A.shapes.length ? K[y] = { w: T.width, h: T.height, shapes: A.shapes.map((N) => ({ ...N })) } : delete K[y], fe(y);
      }, de = (N) => {
        j = N, E.querySelectorAll("[data-tool]").forEach(($) => $.classList.toggle("kl-on", $.dataset.tool === N)), jt && (jt.hidden = N !== "text");
      }, Ee = E.querySelector(".kl-hcolor-custom"), Se = E.querySelector(".kl-hcolor-input"), Y = (N, $) => {
        be = N, E.querySelectorAll("[data-color]").forEach((X) => X.classList.toggle("kl-on", X === $)), Ee && Ee.classList.toggle("kl-on", Ee === $);
      };
      if (E.querySelectorAll("[data-tool]").forEach((N) => N.addEventListener("click", () => de(N.dataset.tool))), E.querySelectorAll("[data-color]").forEach((N) => N.addEventListener("click", () => Y(N.dataset.color, N))), Ee && Se) {
        Ee.addEventListener("click", () => Se.click());
        const N = () => {
          Ee.style.background = Se.value, Y(Se.value, Ee);
        };
        Se.addEventListener("input", N), Se.addEventListener("change", N);
      }
      const se = E.querySelector(".kl-hmask-cb");
      se && se.addEventListener("change", () => {
        i = se.checked;
      }), E.querySelectorAll("[data-outline]").forEach((N) => N.addEventListener("click", () => {
        Ke = N.dataset.outline, E.querySelectorAll("[data-outline]").forEach(($) => $.classList.toggle("kl-on", $ === N));
      })), E.querySelectorAll("[data-size]").forEach((N) => N.addEventListener("click", () => {
        je = Number(N.dataset.size), E.querySelectorAll("[data-size]").forEach(($) => $.classList.toggle("kl-on", $ === N));
      })), E.querySelectorAll("[data-stroke]").forEach((N) => N.addEventListener("click", () => {
        A.strokeScale = Number(N.dataset.stroke) || 1, E.querySelectorAll("[data-stroke]").forEach(($) => $.classList.toggle("kl-on", $ === N)), A.redraw();
      })), (U = E.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        Wt(y);
      }), (V = E.querySelector("#kl-hero-revert")) == null || V.addEventListener("click", () => {
        Ht(y);
      }), (q = E.querySelector("#kl-hero-clear")) == null || q.addEventListener("click", () => {
        _e(y), A.clearAll(), ht();
      }), de(j), Y(be, E.querySelector("[data-color]"));
      const Te = (N) => {
        const $ = T.getBoundingClientRect(), X = Math.min($.width / T.width, $.height / T.height) || 1, G = T.width * X, Z = T.height * X, ze = ($.width - G) / 2, nt = ($.height - Z) / 2;
        return { x: (N.clientX - $.left - ze) / X, y: (N.clientY - $.top - nt) / X };
      }, gn = () => {
        const N = T.getBoundingClientRect();
        return Math.min(N.width / T.width, N.height / T.height) || 1;
      }, wd = (N, $, X, G, Z, ze) => N === "line" ? { type: "line", color: ze, x1: $, y1: X, x2: G, y2: Z } : N === "arrow" ? { type: "arrow", color: ze, x1: $, y1: X, x2: G, y2: Z } : N === "rect" ? { type: "rect", color: ze, x: Math.min($, G), y: Math.min(X, Z), w: Math.abs(G - $), h: Math.abs(Z - X) } : N === "circle" ? { type: "circle", color: ze, x: ($ + G) / 2, y: (X + Z) / 2, rx: Math.abs(G - $) / 2, ry: Math.abs(Z - X) / 2 } : N === "pixelate" ? { type: "pixelate", x: Math.min($, G), y: Math.min(X, Z), w: Math.abs(G - $), h: Math.abs(Z - X) } : null;
      let Je = 1, Vt = 0, Yt = 0, yn = null;
      const xd = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), bn = Mf(xd), Ti = () => {
        if (yn) return yn;
        const N = T.style.transform;
        return T.style.transform = "", yn = T.getBoundingClientRect(), T.style.transform = N, yn;
      }, Ge = document.createElement("div");
      Ge.className = "kl-minimap", Ge.hidden = !0, Ge.setAttribute("role", "navigation"), Ge.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Vr = document.createElement("img");
      Vr.className = "kl-minimap-img", Vr.alt = "", Vr.draggable = !1, Vr.src = R;
      const wr = document.createElement("div");
      wr.className = "kl-minimap-vp", Ge.append(Vr, wr), M.appendChild(Ge);
      const Jo = () => {
        const N = T.width, $ = T.height;
        if (Je <= 1 || N < 2 || $ < 2) {
          Ge.hidden = !0;
          return;
        }
        const X = Ti();
        if (!X) {
          Ge.hidden = !0;
          return;
        }
        const G = 148, Z = Math.min(G / N, G / $), ze = Math.max(1, Math.round(N * Z)), nt = Math.max(1, Math.round($ * Z));
        Ge.style.width = ze + "px", Ge.style.height = nt + "px";
        const xt = M.getBoundingClientRect(), Sr = Tf(
          { left: xt.left, top: xt.top, right: xt.right, bottom: xt.bottom },
          { left: X.left, top: X.top, width: X.width, height: X.height },
          { panX: Vt, panY: Yt },
          Je,
          N,
          $
        );
        wr.style.left = Sr.x * Z + "px", wr.style.top = Sr.y * Z + "px", wr.style.width = Math.max(3, Sr.w * Z) + "px", wr.style.height = Math.max(3, Sr.h * Z) + "px", Ge.hidden = !1;
      }, Yr = () => {
        if (Je === 1) {
          Vt = 0, Yt = 0, T.style.transform = "", T.style.cursor = "crosshair", Jo();
          return;
        }
        T.style.transformOrigin = "0 0", T.style.transform = `translate(${Vt}px,${Yt}px) scale(${Je})`, T.style.cursor = "grab", Jo();
      }, vn = (N, $, X) => {
        const G = Ti();
        if (!G) return;
        const Z = Je;
        if (Je = Cf(Je * X), Je === Z) return;
        const ze = Rf(N, $, { left: G.left, top: G.top, width: G.width, height: G.height }, Z, Je, { panX: Vt, panY: Yt });
        Vt = ze.panX, Yt = ze.panY, T.style.transition = bn, Yr();
      }, Ai = () => {
        const N = M.getBoundingClientRect();
        return { cx: N.left + N.width / 2, cy: N.top + N.height / 2 };
      }, Sd = () => {
        Je = 1, T.style.transition = bn, Yr();
      };
      (re = E.querySelector("#kl-hero-zoomin")) == null || re.addEventListener("click", () => {
        const { cx: N, cy: $ } = Ai();
        vn(N, $, 1.25);
      }), (Ce = E.querySelector("#kl-hero-zoomout")) == null || Ce.addEventListener("click", () => {
        const { cx: N, cy: $ } = Ai();
        vn(N, $, 0.8);
      });
      const Cd = (N, $) => {
        const X = Ti();
        if (!X) return;
        const G = M.getBoundingClientRect(), Z = _f(N, $, { left: G.left, top: G.top, right: G.right, bottom: G.bottom }, { left: X.left, top: X.top, width: X.width, height: X.height }, Je, T.width);
        Vt = Z.panX, Yt = Z.panY, T.style.transition = bn, Yr();
      };
      let kn = !1;
      const Zo = (N, $) => {
        const X = Ge.getBoundingClientRect(), { ix: G, iy: Z } = Af(N - X.left, $ - X.top, X.width, X.height, T.width, T.height);
        Cd(G, Z);
      };
      Ge.addEventListener("pointerdown", (N) => {
        kn = !0;
        try {
          Ge.setPointerCapture(N.pointerId);
        } catch {
        }
        Zo(N.clientX, N.clientY), N.preventDefault(), N.stopPropagation();
      }), Ge.addEventListener("pointermove", (N) => {
        kn && (Zo(N.clientX, N.clientY), N.preventDefault());
      });
      const Qo = (N) => {
        if (kn) {
          kn = !1;
          try {
            Ge.releasePointerCapture(N.pointerId);
          } catch {
          }
        }
      };
      Ge.addEventListener("pointerup", Qo), Ge.addEventListener("pointercancel", Qo), M.addEventListener("wheel", (N) => {
        j !== "crop" && (N.preventDefault(), vn(N.clientX, N.clientY, Ef(N.deltaY)));
      }, { passive: !1 }), M.addEventListener("dblclick", () => {
        Je = 1, T.style.transition = bn, Yr();
      });
      let Ed = A.shapes.reduce((N, $) => $.type === "count" ? Math.max(N, $.n) : N, 0), Gt = !1, at = 0, lt = 0, sr = [], xr = !1, ea = 0, ta = 0, ra = 0, na = 0, ct = null, Gr = { x: 0, y: 0 }, Ze = null;
      const Md = () => Math.max(14, A.computeFontSize() * 0.6), ia = (N, $) => {
        for (let X = A.shapes.length - 1; X >= 0; X--) {
          const G = A.shapes[X];
          if (G.type !== "text") continue;
          const Z = A.textBounds(G);
          if (!Z) continue;
          const ze = Md();
          if (N >= Z.x + Z.w - ze && N <= Z.x + Z.w + ze && $ >= Z.y + Z.h - ze && $ <= Z.y + Z.h + ze)
            return { shape: G, mode: "resize" };
          const nt = 6;
          if (N >= Z.x - nt && N <= Z.x + Z.w + nt && $ >= Z.y - nt && $ <= Z.y + Z.h + nt)
            return { shape: G, mode: "move" };
        }
        return null;
      };
      T.addEventListener("pointerdown", (N) => {
        if (N.shiftKey && Je > 1) {
          xr = !0, ea = N.clientX, ta = N.clientY, ra = Vt, na = Yt, T.style.transition = "none", T.style.cursor = "grabbing";
          try {
            T.setPointerCapture(N.pointerId);
          } catch {
          }
          N.preventDefault();
          return;
        }
        const $ = Te(N);
        if (at = $.x, lt = $.y, j === "crop") {
          Gt = !0;
          try {
            T.setPointerCapture(N.pointerId);
          } catch {
          }
          Gr = { x: N.clientX, y: N.clientY }, ct = document.createElement("div"), ct.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", M.appendChild(ct);
          return;
        }
        if (j === "text") {
          const X = ia($.x, $.y);
          if (X) {
            _e(y), Ze = { shape: X.shape, mode: X.mode, grabX: $.x, grabY: $.y, origX: X.shape.x, origY: X.shape.y, origSize: X.shape.size ?? A.computeFontSize() };
            try {
              T.setPointerCapture(N.pointerId);
            } catch {
            }
            T.style.cursor = X.mode === "resize" ? "nwse-resize" : "move", N.preventDefault();
            return;
          }
          const G = document.createElement("input"), Z = Ke === "none" ? "none" : `0 0 2px ${Ke}, 0 0 2px ${Ke}`, ze = gn(), nt = Math.max(6, je * ze), xt = je, Sr = Ke;
          G.style.cssText = `position:fixed;left:${N.clientX}px;top:${N.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${be};font-size:${nt}px;font-family:sans-serif;font-weight:700;text-shadow:${Z};outline:1px dashed ${be};z-index:2147483647;min-width:80px;`, document.body.appendChild(G), rt = G, requestAnimationFrame(() => {
            document.body.contains(G) && G.focus();
          }), G.addEventListener("blur", () => {
            rt = null, G.value.trim() && (_e(y), A.addShape({ type: "text", color: be, x: at, y: lt, text: G.value.trim(), size: xt, outline: Sr }), ht()), Be(G);
          }, { once: !0 }), G.addEventListener("keydown", (_i) => {
            _i.key === "Enter" && G.blur(), _i.key === "Escape" && (G.value = "", G.blur()), _i.stopPropagation();
          });
          return;
        }
        if (j === "count") {
          _e(y), A.addShape({ type: "count", color: be, x: $.x, y: $.y, n: ++Ed }), ht();
          return;
        }
        Gt = !0;
        try {
          T.setPointerCapture(N.pointerId);
        } catch {
        }
        j === "pen" && (sr = [$]);
      }), T.addEventListener("pointermove", (N) => {
        if (xr) {
          T.style.transition = "none", Vt = ra + (N.clientX - ea), Yt = na + (N.clientY - ta), Yr(), T.style.cursor = "grabbing";
          return;
        }
        if (Ze) {
          const G = Te(N);
          Ze.mode === "move" ? (Ze.shape.x = Ze.origX + (G.x - Ze.grabX), Ze.shape.y = Ze.origY + (G.y - Ze.grabY)) : Ze.shape.size = Math.max(10, Math.min(240, Ze.origSize + (G.y - Ze.grabY))), A.redraw();
          return;
        }
        if (j === "text" && !Gt) {
          const G = Te(N), Z = ia(G.x, G.y);
          T.style.cursor = Z ? Z.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Gt) return;
        if (j === "pen") {
          sr.push(Te(N)), sr.length > 1 && A.drawPreview({ type: "pen", color: be, points: sr });
          return;
        }
        if (j === "crop" && ct) {
          const G = M.getBoundingClientRect(), Z = Math.min(Gr.x, N.clientX), ze = Math.min(Gr.y, N.clientY), nt = Math.max(Gr.x, N.clientX), xt = Math.max(Gr.y, N.clientY);
          ct.style.left = Z - G.left + "px", ct.style.top = ze - G.top + "px", ct.style.width = nt - Z + "px", ct.style.height = xt - ze + "px";
          return;
        }
        const $ = Te(N), X = wd(j, at, lt, $.x, $.y, be);
        X && A.drawPreview(X);
      }), T.addEventListener("pointerup", (N) => {
        if (xr) {
          xr = !1, T.style.cursor = Je > 1 ? "grab" : "crosshair";
          try {
            T.releasePointerCapture(N.pointerId);
          } catch {
          }
          return;
        }
        if (Ze) {
          Ze = null;
          try {
            T.releasePointerCapture(N.pointerId);
          } catch {
          }
          T.style.cursor = "crosshair", A.redraw(), ht();
          return;
        }
        if (!Gt) return;
        Gt = !1;
        try {
          T.releasePointerCapture(N.pointerId);
        } catch {
        }
        const $ = Te(N);
        if (j === "crop") {
          ct && (Be(ct), ct = null);
          const Z = Math.max(0, Math.min(at, $.x)), ze = Math.max(0, Math.min(lt, $.y)), nt = Math.abs($.x - at), xt = Math.abs($.y - lt);
          nt > 4 && xt > 4 && gd(y, Z, ze, nt, xt);
          return;
        }
        const X = j === "pixelate" && Math.abs($.x - at) > 4 && Math.abs($.y - lt) > 4;
        (j === "pen" && sr.length > 1 || j === "line" || j === "rect" || j === "circle" || j === "arrow" || X) && _e(y), j === "pen" && sr.length > 1 ? A.addShape({ type: "pen", color: be, points: sr }) : j === "line" ? A.addShape({ type: "line", color: be, x1: at, y1: lt, x2: $.x, y2: $.y }) : j === "rect" ? A.addShape({ type: "rect", color: be, x: Math.min(at, $.x), y: Math.min(lt, $.y), w: Math.abs($.x - at), h: Math.abs($.y - lt) }) : j === "circle" ? A.addShape({ type: "circle", color: be, x: (at + $.x) / 2, y: (lt + $.y) / 2, rx: Math.abs($.x - at) / 2, ry: Math.abs($.y - lt) / 2 }) : j === "arrow" ? A.addShape({ type: "arrow", color: be, x1: at, y1: lt, x2: $.x, y2: $.y }) : X && A.addShape({ type: "pixelate", x: Math.min(at, $.x), y: Math.min(lt, $.y), w: Math.abs($.x - at), h: Math.abs($.y - lt) }), ht();
      }), T.addEventListener("pointercancel", (N) => {
        try {
          T.releasePointerCapture(N.pointerId);
        } catch {
        }
        ct && (Be(ct), ct = null), xr && (xr = !1, T.style.cursor = Je > 1 ? "grab" : "crosshair"), Ze && (Ze = null, T.style.cursor = "crosshair", A.redraw(), ht()), Gt && (Gt = !1, A.redraw());
      });
      const sa = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      qe = (N) => {
        if (!document.body.contains(s)) {
          jr();
          return;
        }
        if (rt && document.body.contains(rt)) return;
        const $ = typeof N.composedPath == "function" && N.composedPath()[0] || N.target;
        if ($ && ($.tagName === "INPUT" || $.tagName === "TEXTAREA" || $.tagName === "SELECT" || $.isContentEditable)) return;
        if ((N.metaKey || N.ctrlKey) && N.key.toLowerCase() === "z") {
          N.preventDefault(), Wt(y);
          return;
        }
        if (N.metaKey || N.ctrlKey || N.altKey) return;
        const X = N.key.toLowerCase();
        if (X === "z") {
          if (N.preventDefault(), Je > 1) Sd();
          else {
            const { cx: G, cy: Z } = Ai();
            vn(G, Z, 2);
          }
          return;
        }
        sa[X] && (N.preventDefault(), de(sa[X]));
      }, document.addEventListener("keydown", qe, { capture: !0 });
    }
  }
  function bd(y) {
    const M = c[y], E = new Image();
    E.onload = () => {
      const R = document.createElement("canvas");
      R.width = E.naturalWidth, R.height = E.naturalHeight;
      const T = new ya(R, M);
      T.redraw();
      const A = document.createElement("div");
      A.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const O = document.createElement("div");
      O.className = "kl-edtb", O.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", O.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ee("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ee("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-color="#ef4444" style="background:#ef4444;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#f97316" style="background:#f97316;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#16a34a" style="background:#16a34a;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#3b82f6" style="background:#3b82f6;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#ffffff" style="background:#ffffff;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);"></button>
        <button data-color="#111827" style="background:#111827;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;border:1px solid #555;"></button>
        <span style="position:relative;display:inline-flex;">
          <button id="klavity-color-custom" title="Custom colour" aria-label="Choose a custom colour" style="width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;background:conic-gradient(from 0deg,#ef4444,#f59e0b,#facc15,#16a34a,#3b82f6,#a855f7,#ef4444);"></button>
          <input type="color" id="klavity-color-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1" style="position:absolute;left:0;bottom:-2px;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0;pointer-events:none;">
        </span>
        <span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;">
          <button id="klavity-zoom-out" class="kl-zb" title="Zoom out" aria-label="Zoom out">−</button>
          <span id="klavity-zoom-pct" style="min-width:46px;text-align:center;color:#a6adc8;font-size:12px;font-variant-numeric:tabular-nums;">100%</span>
          <button id="klavity-zoom-in" class="kl-zb" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="klavity-fit-width" class="kl-zb" title="Fit to width (best for tall pages)" style="font-size:11.5px;">Fit&nbsp;W</button>
          <button id="klavity-fit-page" class="kl-zb" title="Fit the whole page" style="font-size:11.5px;">Fit&nbsp;page</button>
        </span>
        <button id="klavity-undo" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;margin-left:auto;">↩ Undo</button>
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ee("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${ee("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ee("x", { size: 14 })}</button>
      `, R.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const F = document.createElement("div");
      F.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", F.appendChild(R);
      const z = document.createElement("style");
      z.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", A.append(z, O, F), a.appendChild(A), jr();
      let B = 1;
      const U = (Y) => Math.max(0.05, Math.min(5, Y || 1));
      function V(Y) {
        B = U(Y), R.style.width = Math.round(R.width * B) + "px", R.style.height = Math.round(R.height * B) + "px";
        const se = O.querySelector("#klavity-zoom-pct");
        se && (se.textContent = Math.round(B * 100) + "%");
      }
      const q = () => Math.max(1, F.clientWidth - 24) / R.width, re = () => Math.min(Math.max(1, F.clientWidth - 24) / R.width, Math.max(1, F.clientHeight - 24) / R.height), Ce = R.height / R.width > Math.max(1, F.clientHeight) / Math.max(1, F.clientWidth);
      V(Ce ? q() : re()), O.querySelector("#klavity-zoom-in").addEventListener("click", () => V(B * 1.25)), O.querySelector("#klavity-zoom-out").addEventListener("click", () => V(B / 1.25)), O.querySelector("#klavity-fit-width").addEventListener("click", () => V(q())), O.querySelector("#klavity-fit-page").addEventListener("click", () => V(re()));
      let ie = "rect", j = "#ef4444", be = !1, je = [], Ke = 0, rt = 0;
      function jt(Y) {
        ie = Y, O.querySelectorAll("[data-tool]").forEach((se) => {
          const Te = se.dataset.tool === Y;
          se.style.background = Te ? "#585b70" : "#313244", se.style.outline = Te ? "2px solid #89b4fa" : "none";
        });
      }
      O.querySelectorAll("[data-tool]").forEach((Y) => Y.addEventListener("click", () => jt(Y.dataset.tool))), O.querySelectorAll("[data-color]").forEach((Y) => Y.addEventListener("click", () => {
        j = Y.dataset.color;
      }));
      {
        const Y = O.querySelector("#klavity-color-custom"), se = O.querySelector("#klavity-color-input");
        if (Y && se) {
          Y.addEventListener("click", () => se.click());
          const Te = () => {
            Y.style.background = se.value, j = se.value;
          };
          se.addEventListener("input", Te), se.addEventListener("change", Te);
        }
      }
      O.querySelector("#klavity-undo").addEventListener("click", () => T.undo()), O.querySelector("#klavity-clear-ann").addEventListener("click", () => T.clearAll());
      const ht = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function de(Y) {
        const se = Y.target;
        if (se && (se.tagName === "INPUT" || se.tagName === "TEXTAREA" || se.isContentEditable)) return;
        if (Y.key === "Escape") {
          Y.stopPropagation(), Ee();
          return;
        }
        if ((Y.metaKey || Y.ctrlKey) && Y.key.toLowerCase() === "z") {
          Y.preventDefault(), T.undo();
          return;
        }
        if (Y.metaKey || Y.ctrlKey || Y.altKey) return;
        const Te = Y.key.toLowerCase();
        ht[Te] ? (Y.preventDefault(), jt(ht[Te])) : Te === "u" && (Y.preventDefault(), T.undo());
      }
      function Ee() {
        document.removeEventListener("keydown", de, { capture: !0 }), Be(A), jo();
      }
      document.addEventListener("keydown", de, { capture: !0 }), jt(ie), O.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        _e(y), T.shapes.length ? K[y] = { w: R.width, h: R.height, shapes: T.shapes.map((Y) => ({ ...Y })) } : delete K[y], fe(y), Ee(), Re();
      }), O.querySelector("#klavity-cancel-ann").addEventListener("click", () => Ee());
      function Se(Y) {
        const se = R.getBoundingClientRect();
        return { x: (Y.clientX - se.left) / se.width * R.width, y: (Y.clientY - se.top) / se.height * R.height };
      }
      R.addEventListener("pointerdown", (Y) => {
        be = !0;
        const se = Se(Y);
        if ({ x: Ke, y: rt } = se, ie === "pen" && (je = [se]), ie === "text") {
          be = !1;
          const Te = document.createElement("input");
          Te.style.cssText = `position:fixed;left:${Y.clientX}px;top:${Y.clientY}px;background:transparent;border:1px dashed ${j};color:${j};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Te), requestAnimationFrame(() => {
            document.body.contains(Te) && Te.focus();
          }), Te.addEventListener("blur", () => {
            Te.value.trim() && T.addShape({ type: "text", color: j, x: Ke, y: rt, text: Te.value.trim() }), Be(Te);
          }, { once: !0 }), Te.addEventListener("keydown", (gn) => {
            gn.key === "Enter" && Te.blur(), gn.stopPropagation();
          });
        }
      }), R.addEventListener("pointermove", (Y) => {
        be && ie === "pen" && je.push(Se(Y));
      }), R.addEventListener("pointerup", (Y) => {
        if (!be) return;
        be = !1;
        const se = Se(Y);
        ie === "pen" && je.length > 1 ? T.addShape({ type: "pen", color: j, points: je }) : ie === "rect" ? T.addShape({ type: "rect", color: j, x: Math.min(Ke, se.x), y: Math.min(rt, se.y), w: Math.abs(se.x - Ke), h: Math.abs(se.y - rt) }) : ie === "circle" ? T.addShape({ type: "circle", color: j, x: (Ke + se.x) / 2, y: (rt + se.y) / 2, rx: Math.abs(se.x - Ke) / 2, ry: Math.abs(se.y - rt) / 2 }) : ie === "arrow" && T.addShape({ type: "arrow", color: j, x1: Ke, y1: rt, x2: se.x, y2: se.y });
      });
    }, E.src = M;
  }
  function vd(y, M) {
    const E = document.createElement("div");
    E.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const R = document.createElement("div");
    R.className = "klavity-sent";
    const T = document.createElement("div");
    T.className = "kl-sent-check", T.innerHTML = ee("check", { label: "Sent", size: 22 }), R.appendChild(T);
    const A = document.createElement("h2");
    A.textContent = "Report sent", R.appendChild(A);
    const O = document.createElement("p");
    if (O.textContent = n.thankYou || "We filed it and emailed you a copy.", R.appendChild(O), y) {
      const F = document.createElement("div");
      F.className = "klavity-ref";
      const z = document.createElement("span");
      z.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = Ca(y, M), F.append(z, B);
      const U = Ea(M);
      if (U) {
        const V = document.createElement("a");
        V.href = U, V.target = "_blank", V.rel = "noopener", V.textContent = "Open in Klavity", F.appendChild(V);
      }
      R.appendChild(F);
    }
    E.appendChild(R), Be(_t), a.appendChild(E), Do(R, Q);
  }
  function kd(y, M, E) {
    const { copy: R, onLead: T } = E;
    ae.innerHTML = "";
    const A = document.createElement("div");
    A.className = "klavity-success";
    const O = document.createElement("h2");
    if (O.innerHTML = R.headline, A.appendChild(O), R.body) {
      const z = document.createElement("p");
      z.textContent = R.body, A.appendChild(z);
    }
    if (y) {
      const z = document.createElement("div");
      z.className = "klavity-ref";
      const B = document.createElement("span");
      B.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = Ca(y, M), z.append(B, U);
      const V = Ea(M);
      if (V) {
        const q = document.createElement("a");
        q.href = V, q.target = "_blank", q.rel = "noopener", q.textContent = "Open in Klavity", z.appendChild(q);
      }
      A.appendChild(z);
    }
    const F = () => Do(ae, Ae);
    if (R.showEmail) {
      const z = document.createElement("div");
      z.className = "klavity-lead";
      const B = document.createElement("input");
      B.type = "email", B.placeholder = "you@company.com";
      const U = document.createElement("button"), V = R.emailLabel;
      U.textContent = V;
      const q = document.createElement("div");
      q.className = "klavity-lead-err", q.setAttribute("role", "alert"), q.style.display = "none";
      const re = async () => {
        const Ce = B.value.trim();
        if (!Ce || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ce)) {
          q.textContent = "Please enter a valid email so we can reach you.", q.style.display = "block", B.focus();
          return;
        }
        U.disabled = !0, U.textContent = "Saving…", q.style.display = "none";
        try {
          T && await T(y, Ce);
        } catch (j) {
          try {
            console.warn("[Klavity] lead capture failed:", (j == null ? void 0 : j.message) || j);
          } catch {
          }
          q.textContent = "Couldn't save your email — please try again.", q.style.display = "block", U.disabled = !1, U.textContent = "Retry", B.focus();
          return;
        }
        const ie = document.createElement("div");
        ie.className = "klavity-thanks", ie.textContent = "Thanks — we'll be in touch.", Be(q), z.replaceWith(ie), R.showCta || F();
      };
      U.addEventListener("click", re), B.addEventListener("keydown", (Ce) => {
        Ce.key === "Enter" && re();
      }), z.append(B, U), A.appendChild(z), A.appendChild(q);
    }
    if (R.showCta && R.ctaUrl) {
      const z = document.createElement("a");
      z.className = "klavity-cta", z.href = R.ctaUrl, z.target = "_blank", z.rel = "noopener", z.textContent = R.ctaText, A.appendChild(z);
    }
    if (ae.appendChild(A), !n.whiteLabel) {
      const z = document.createElement("div");
      z.className = "klavity-pb";
      const B = document.createElement("a");
      B.href = Fc("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), B.target = "_blank", B.rel = "noopener", B.textContent = "Klavity", z.append("Powered by ", B), ae.appendChild(z);
    }
    !R.showEmail && !R.showCta && F();
  }
  if (t.autoCaptureOnOpen) {
    let y = 0;
    try {
      y = document.getElementsByTagName("*").length;
    } catch {
      y = 0;
    }
    if (y <= v) {
      if (l = !0, Re(), Ff(t) === "screen")
        return (async () => {
          if (await Ei({ viewport: !0 })) {
            l = !1, Re();
            return;
          }
          if (c.length) {
            l = !1, Re();
            return;
          }
          if (l = !0, Re(), t.onCaptureViewport) {
            Bo(null).catch(() => {
              l = !1, Re();
            });
            return;
          }
          t.onCaptureFull().then((T) => {
            const { dataUrl: A, quality: O, suggestSharp: F, blank: z } = Nt(T);
            if (l = !1, z && c.length === 0) {
              yi();
              return;
            }
            pt(A, O, void 0, !0, !!F), Ot(ir);
          }).catch(() => {
            l = !1, Re();
          });
        })(), Lo;
      const M = () => {
        if (t.onCaptureViewport) {
          Bo(null).catch(() => {
            l = !1, Re();
          });
          return;
        }
        t.onCaptureFull().then((R) => {
          const { dataUrl: T, quality: A, suggestSharp: O, blank: F } = Nt(R);
          if (l = !1, F && c.length === 0) {
            yi();
            return;
          }
          pt(T, A, void 0, !0, !!O), Ot(ir);
        }).catch(() => {
          l = !1, Re();
        });
      }, E = window.requestIdleCallback;
      typeof E == "function" ? E(() => M(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(M, 0));
    }
  }
  return Lo;
}
function Gf(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Be(r), Be(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    a = !0, i = d.clientX, s = d.clientY, Be(n);
  }), r.addEventListener("pointermove", (d) => {
    if (!a) return;
    const o = Math.min(d.clientX, i), h = Math.min(d.clientY, s), p = Math.abs(d.clientX - i), u = Math.abs(d.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${o}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o + p}px 0/calc(100% - ${o + p}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px 0/${p}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px ${h + u}px/${p}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (d) => {
    if (!a) return;
    a = !1;
    const o = Math.abs(d.clientX - i), h = Math.abs(d.clientY - s);
    if (o < 8 || h < 8) {
      c(), t();
      return;
    }
    const p = { x: Math.min(d.clientX, i), y: Math.min(d.clientY, s), w: o, h };
    c(), e(p);
  });
}
async function Ma(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return Ra(r);
    } catch {
    }
  return Ra(e);
}
const Xf = 3e4;
function Ra(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    let i = !1;
    const s = setTimeout(() => {
      if (!i) {
        i = !0;
        try {
          n.abort();
        } catch {
        }
        r(new Error("file read timed out"));
      }
    }, Xf), a = (c) => {
      i || (i = !0, clearTimeout(s), c());
    };
    n.onload = () => a(() => t(n.result)), n.onerror = () => a(() => r(n.error || new Error("file read failed"))), n.onabort = () => a(() => r(n.error || new Error("file read aborted")));
    try {
      n.readAsDataURL(e);
    } catch (c) {
      a(() => r(c instanceof Error ? c : new Error("file read failed")));
    }
  });
}
const Kf = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Jf(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Zf(e) {
  switch (e) {
    case "vein":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 L8 6 M11 3 L14 6 M21 11 L18 8 M21 11 L18 14 M13 21 L16 18 M13 21 L10 18 M3 13 L6 16 M3 13 L6 10"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>';
    case "spark":
      return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z"/><path d="M5.5 13c.3 1.9 1.3 2.9 3.2 3.2-1.9.3-2.9 1.3-3.2 3.2-.3-1.9-1.3-2.9-3.2-3.2 1.9-.3 2.9-1.3 3.2-3.2Z" opacity=".85"/></svg>';
    case "bulb":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17.5h6M9.5 20.5h5"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/><path d="M10 9.5c.4-1 1-1.5 2-1.5" opacity=".7"/></svg>';
    case "check":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-11"/></svg>';
    case "dots":
      return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.3"/><circle cx="12" cy="12" r="2.3"/><circle cx="19" cy="12" r="2.3"/></svg>';
    case "bang":
      return '<span class="ksim-glyph">!</span>';
    case "q":
      return '<span class="ksim-glyph">?</span>';
  }
}
const Qf = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function ar(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function em(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: s = 58,
    eyes: a = !0,
    legs: c = !0,
    animate: l = !0,
    className: d = ""
  } = e, o = ar(e.initials || Jf(t)), h = i !== "none" ? Kf[i] : null, p = h ? `<span class="ksim-mark ${l ? Qf[h.mark] : ""}" style="color:${ar(h.accent)}">${Zf(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${ar(r)}" alt="${ar(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), x = `--ksim-persona:${ar(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${ar(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${ar(t)}">${p}${m}${f}</span>`;
}
function tm(e) {
  const t = document.createElement("template");
  return t.innerHTML = em(e).trim(), t.content.firstElementChild;
}
const rm = `
/* The Sim is a single rigid unit: head + legs must always move together.
   isolation:isolate + transform-style:flat rasterize head and legs into ONE
   compositing layer so the z-indexed head can never split onto its own GPU
   layer and visually detach from the legs when an ancestor is transformed
   (bob), focused (glow), or walked (left/top clone). */
.ksim{--ksim-size:58px;position:relative;display:inline-flex;flex-direction:column;align-items:center;line-height:1;vertical-align:bottom;
  isolation:isolate;transform-style:flat;backface-visibility:hidden}
.ksim.is-animated{animation:ksim-bob 3.1s ease-in-out infinite;will-change:transform}
@keyframes ksim-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
/* z-index:2 keeps the head above the legs WITHIN the .ksim isolation context;
   because .ksim isolates, this no longer promotes the head to its own layer. */
.ksim-head{position:relative;width:var(--ksim-size);height:var(--ksim-size);border-radius:50%;display:grid;place-items:center;
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7);z-index:2}
.ksim-mono{background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 14%),var(--ksim-persona) 58%,color-mix(in srgb,var(--ksim-persona) 55%,#000 38%));
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7),inset 0 2px 4px rgba(255,255,255,.25),inset 0 -6px 12px rgba(0,0,0,.28)}
.ksim-ini{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;color:#fff;letter-spacing:.02em;
  font-size:calc(var(--ksim-size)*.31);text-shadow:0 1px 2px rgba(0,0,0,.35)}
/* photo identity — thin persona ring, monogram fallback */
.ksim-photo{background:var(--ksim-persona);box-shadow:0 8px 22px -6px rgba(0,0,0,.7),0 0 0 2px var(--ksim-persona)}
.ksim-photo img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.ksim-photo .ksim-ini{position:absolute;inset:0;display:none;place-items:center;border-radius:50%;
  background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 12%),var(--ksim-persona) 60%)}
.ksim-photo.ksim-fallback .ksim-ini{display:grid}
/* character eyes (monogram) */
.ksim-eyes{position:absolute;bottom:calc(var(--ksim-size)*.16);left:50%;transform:translateX(-50%);display:flex;gap:calc(var(--ksim-size)*.1);z-index:3}
.ksim-eyes i{width:calc(var(--ksim-size)*.086);height:calc(var(--ksim-size)*.086);border-radius:50%;background:rgba(12,10,8,.8)}
.ksim-mono:has(.ksim-eyes) .ksim-ini{transform:translateY(calc(var(--ksim-size)*-.1));font-size:calc(var(--ksim-size)*.26)}
/* legs */
.ksim-legs{display:flex;gap:calc(var(--ksim-size)*.12);margin-top:calc(var(--ksim-size)*.07)}
.ksim-legs i{width:calc(var(--ksim-size)*.12);height:calc(var(--ksim-size)*.29);border-radius:calc(var(--ksim-size)*.07);
  background:color-mix(in srgb,var(--ksim-persona) 60%,#000 30%);transform-origin:top center}
.ksim.is-animated .ksim-legs i:nth-child(1){animation:ksim-la 1.6s ease-in-out infinite}
.ksim.is-animated .ksim-legs i:nth-child(2){animation:ksim-lb 1.6s ease-in-out infinite}
@keyframes ksim-la{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(7deg)}}
@keyframes ksim-lb{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-7deg)}}
/* floating emotion mark */
.ksim-mark{position:absolute;top:calc(var(--ksim-size)*-.2);right:calc(var(--ksim-size)*-.2);
  width:calc(var(--ksim-size)*.45);height:calc(var(--ksim-size)*.45);color:var(--ksim-accent);z-index:5;
  display:grid;place-items:center;filter:drop-shadow(0 2px 5px rgba(0,0,0,.55));transform-origin:center}
.ksim-mark svg{width:100%;height:100%;display:block}
.ksim-glyph{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;font-size:calc(var(--ksim-size)*.36);color:var(--ksim-accent)}
.ksim-m-vein{animation:ksim-vein 1.1s ease-in-out infinite}@keyframes ksim-vein{0%,100%{transform:scale(1) rotate(0)}45%{transform:scale(1.22) rotate(-6deg)}}
.ksim-m-spark{animation:ksim-tw 1.5s ease-in-out infinite}@keyframes ksim-tw{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(1.18) rotate(18deg);opacity:.7}}
.ksim-m-bulb{animation:ksim-bulb 1.7s ease-in-out infinite}@keyframes ksim-bulb{0%,100%{filter:drop-shadow(0 0 0 transparent) drop-shadow(0 2px 5px rgba(0,0,0,.55))}50%{filter:drop-shadow(0 0 9px var(--ksim-accent)) drop-shadow(0 2px 5px rgba(0,0,0,.55))}}
.ksim-m-bang{animation:ksim-bang 1.2s ease-in-out infinite}@keyframes ksim-bang{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-2px) rotate(-7deg)}75%{transform:translateX(2px) rotate(7deg)}}
.ksim-m-q{animation:ksim-q 2.2s ease-in-out infinite}@keyframes ksim-q{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
.ksim-m-dots{animation:ksim-dots 2s linear infinite}@keyframes ksim-dots{0%,100%{opacity:.45}50%{opacity:1}}
.ksim-m-check{animation:ksim-check 2.4s ease-in-out infinite}@keyframes ksim-check{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@media (prefers-reduced-motion: reduce){.ksim,.ksim *{animation:none !important}}
`;
function nm(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = rm, t.appendChild(r);
}
function Xs(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function im(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function sm(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", Xs(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm";
        t.append("recording", Xs(n.dataUrl), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return im(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function om(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = sm({
    type: e.kind ?? r,
    description: n,
    pageUrl: i.pageUrl,
    context: i,
    projectId: a,
    replayEvents: c,
    title: e.title,
    referrer: e.referrer,
    reporter: e.reporter,
    clientInfo: e.clientInfo,
    files: e.files,
    recordings: e.recordings,
    annotations: e.annotations
  });
  e.reporterEmail && l.set("reporter_email", e.reporterEmail);
  const d = t.connectionMode === "klavity" && !!t.klavToken;
  if (!d) {
    const { plane: u } = t;
    l.append("plane_token", u.token), l.append("plane_workspace", u.workspace), l.append("plane_project_id", u.projectId), l.append("plane_host", u.host);
  }
  for (let u = 0; u < s.length; u++) {
    const m = await (await fetch(s[u])).blob();
    l.append("screenshots", m, `screenshot-${u}.png`);
  }
  if (e.screenshotThumbs)
    for (const u of e.screenshotThumbs)
      try {
        l.append("screenshot_thumbs", Xs(u), "thumb.jpg");
      } catch {
      }
  const o = d ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: o, body: l });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const p = await h.json();
  return {
    issueKey: p.jira_key ?? p.id,
    issueUrl: p.issue_url ?? t.backendUrl
  };
}
const am = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), lm = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function cm(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + lm + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function um(e) {
  const t = [
    ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/]
  ];
  for (const [r, n] of t) {
    const i = e.match(n);
    if (i) return { browser: r, version: i[1] };
  }
  return {};
}
function dm(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function $i(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = um(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = dm(n);
  s && (r.os = s), r.deviceType = /Mobi|Android|iPhone|iPod/i.test(n) && !/iPad|Tablet/i.test(n) ? "mobile" : /iPad|Tablet/i.test(n) ? "tablet" : "desktop";
  try {
    e && (r.viewport = `${e.innerWidth}x${e.innerHeight}`);
  } catch {
  }
  try {
    e && e.screen && (r.screen = `${e.screen.width}x${e.screen.height}`);
  } catch {
  }
  try {
    e && e.devicePixelRatio && (r.devicePixelRatio = Math.round(e.devicePixelRatio * 100) / 100);
  } catch {
  }
  try {
    t && t.language && (r.locale = String(t.language).slice(0, 35));
  } catch {
  }
  try {
    t && Array.isArray(t.languages) && t.languages.length && (r.languages = t.languages.slice(0, 10).join(",").slice(0, 120));
  } catch {
  }
  try {
    const a = Intl.DateTimeFormat().resolvedOptions().timeZone;
    a && (r.timezone = String(a).slice(0, 60));
  } catch {
  }
  return r;
}
const pm = 180 * 1e3, hm = 50 * 1024 * 1024, Bc = {
  maxDurationMs: pm,
  maxBytes: hm
}, fm = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function ao() {
  const e = globalThis;
  return {
    mediaDevices: typeof navigator < "u" ? navigator.mediaDevices : void 0,
    MediaRecorder: e.MediaRecorder,
    MediaStream: e.MediaStream,
    createElement: (t) => document.createElement(t),
    now: () => typeof performance < "u" ? performance.now() : Date.now(),
    raf: (t) => typeof requestAnimationFrame < "u" ? requestAnimationFrame(t) : setTimeout(() => t(Date.now()), 16),
    caf: (t) => {
      typeof cancelAnimationFrame < "u" ? cancelAnimationFrame(t) : clearTimeout(t);
    },
    setInterval: (t, r) => setInterval(t, r),
    clearInterval: (t) => clearInterval(t)
  };
}
function mm(e, t = fm) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function qc(e = ao()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function gm() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function ym(e = {}, t = ao()) {
  var x, v, b, S, w, k, C, L, D, I, J, H;
  const r = { ...Bc, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? 24)), a = mm(
    (x = t.MediaRecorder) != null && x.isTypeSupported ? (_) => t.MediaRecorder.isTypeSupported(_) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = gm(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0;
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0;
  let p = "idle";
  const u = (_) => {
    var ye;
    p = _;
    try {
      (ye = e.onState) == null || ye.call(e, _);
    } catch {
    }
  }, m = await t.mediaDevices.getDisplayMedia({
    video: { frameRate: s, displaySurface: "monitor" },
    audio: !1,
    preferCurrentTab: !1,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "include",
    monitorTypeSurfaces: "include"
  });
  let f = null;
  const g = () => {
    var _;
    for (const ye of [m, f])
      try {
        (_ = ye == null ? void 0 : ye.getTracks) == null || _.call(ye).forEach((Le) => {
          var oe;
          return (oe = Le.stop) == null ? void 0 : oe.call(Le);
        });
      } catch {
      }
  };
  try {
    let _ = function() {
      if (!te) {
        te = !0;
        try {
          Xe.state !== "inactive" && Xe.stop();
        } catch {
        }
      }
    };
    const ye = (v = m.getVideoTracks) == null ? void 0 : v.call(m)[0], Le = ((b = ye == null ? void 0 : ye.getSettings) == null ? void 0 : b.call(ye)) ?? {}, oe = Le.width && Le.height ? Le.width / Le.height : 16 / 9;
    l.width = 1280, l.height = Math.round(1280 / oe);
    try {
      o.srcObject = m, await (((S = o.play) == null ? void 0 : S.call(o)) ?? Promise.resolve());
    } catch {
    }
    let le = null, K = !1, he = !0;
    if (n || i)
      try {
        if (f = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((w = f.getVideoTracks) != null && w.call(f).length)) {
          K = !0, he = !1;
          try {
            h.srcObject = f, await (((k = h.play) == null ? void 0 : k.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (le = ((C = f.getAudioTracks) == null ? void 0 : C.call(f)[0]) || null, le && (he = !1));
      } catch (ke) {
        let _e = !1;
        if (i && n)
          try {
            if (f = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), le = ((L = f.getAudioTracks) == null ? void 0 : L.call(f)[0]) || null, le) {
              he = !1, _e = !0;
              try {
                (D = e.onFallback) == null || D.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!_e) {
          try {
            (I = e.onFallback) == null || I.call(e, (ke == null ? void 0 : ke.name) === "NotAllowedError" ? "permissions-policy" : (ke == null ? void 0 : ke.name) || "camera-mic-blocked");
          } catch {
          }
          he = !0;
        }
      }
    const Oe = !!le;
    let ce = 0;
    const Me = () => {
      if (ce = t.raf(Me), !d) return;
      const ke = l.width, _e = l.height;
      if (o.videoWidth) {
        const vt = o.videoWidth / o.videoHeight, Wt = ke / _e;
        let Ht = ke, Ft = _e, _t = 0, ae = 0;
        vt > Wt ? (Ft = ke / vt, ae = (_e - Ft) / 2) : (Ht = _e * vt, _t = (ke - Ht) / 2), d.fillStyle = "#000", d.fillRect(0, 0, ke, _e), d.drawImage(o, _t, ae, Ht, Ft);
      }
      if (K && h.videoWidth) {
        const vt = Math.round(ke * 0.22), Wt = Math.round(vt * (h.videoHeight / h.videoWidth)), Ht = ke - vt - 20, Ft = _e - Wt - 20;
        d.drawImage(h, Ht, Ft, vt, Wt), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(Ht, Ft, vt, Wt);
      }
      p === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    Me();
    const P = l.captureStream(s), me = [(J = P.getVideoTracks) == null ? void 0 : J.call(P)[0]].filter(Boolean);
    le && me.push(le);
    const qe = new t.MediaStream(me), Xe = new t.MediaRecorder(qe, { mimeType: a, videoBitsPerSecond: 25e5, audioBitsPerSecond: 128e3 }), De = [];
    let Fe = 0, We = 0, He = 0, Q = 0, Ae = 0, te = !1;
    const ue = () => {
      if (p === "idle") return 0;
      const ke = t.now() - We - He;
      return Math.max(0, ke - (Q ? t.now() - Q : 0));
    };
    Xe.ondataavailable = (ke) => {
      var _e;
      ke != null && ke.data && ke.data.size && (De.push(ke.data), Fe += ke.data.size);
      try {
        (_e = e.onStats) == null || _e.call(e, { elapsedMs: ue(), bytes: Fe });
      } catch {
      }
      Fe >= r.maxBytes && _();
    };
    let $e;
    const fe = new Promise((ke) => {
      $e = ke;
    }), er = g;
    Xe.onstop = () => {
      t.caf(ce), Ae && (t.clearInterval(Ae), Ae = 0);
      const ke = ue(), _e = new Blob(De, { type: a.split(";")[0] });
      er(), u("stopped"), $e({
        id: c,
        blob: _e,
        mime: _e.type || a,
        durationMs: ke,
        bytes: _e.size || Fe,
        width: l.width,
        height: l.height,
        screenOnly: he,
        hadCamera: K,
        hadAudio: Oe
      });
    };
    try {
      (H = ye == null ? void 0 : ye.addEventListener) == null || H.call(ye, "ended", () => _());
    } catch {
    }
    return Xe.start(1e3), We = t.now(), u("recording"), Ae = t.setInterval(() => {
      var _e;
      const ke = ue();
      try {
        (_e = e.onStats) == null || _e.call(e, { elapsedMs: ke, bytes: Fe });
      } catch {
      }
      ke >= r.maxDurationMs && _();
    }, 200), {
      pause() {
        if (p === "recording") {
          try {
            Xe.pause();
          } catch {
          }
          Q = t.now(), u("paused");
        }
      },
      resume() {
        if (p === "paused") {
          try {
            Xe.resume();
          } catch {
          }
          He += t.now() - Q, Q = 0, u("recording");
        }
      },
      stop() {
        _();
      },
      state() {
        return p;
      },
      screenOnly() {
        return he;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return K && f ? f : null;
      },
      done: fe
    };
  } catch (_) {
    throw g(), _;
  }
}
function bm(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function vm(e) {
  return {
    id: e.id,
    dataUrl: await bm(e.blob),
    mime: e.mime,
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function km(e) {
  var h, p;
  if (typeof document > "u" || !e || !((h = e.getVideoTracks) != null && h.call(e).length)) return null;
  const t = document.createElement("div");
  t.setAttribute("data-klavity-ui", "camera-preview"), t.setAttribute("role", "img"), t.setAttribute("aria-label", "Your camera preview"), t.style.cssText = "position:fixed;left:24px;bottom:24px;width:128px;height:128px;border-radius:50%;overflow:hidden;z-index:2147483647;pointer-events:auto;cursor:grab;background:#000;border:3px solid #7c3aed;box-shadow:0 10px 30px rgba(28,22,40,.42);touch-action:none";
  const r = document.createElement("video");
  r.muted = !0, r.playsInline = !0, r.setAttribute("playsinline", ""), r.autoplay = !0, r.setAttribute("aria-hidden", "true"), r.style.cssText = "width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:block";
  try {
    r.srcObject = e;
  } catch {
  }
  try {
    const u = (p = r.play) == null ? void 0 : p.call(r);
    u && typeof u.catch == "function" && u.catch(() => {
    });
  } catch {
  }
  t.appendChild(r);
  let n = !1, i = 0, s = 0, a = 0, c = 0;
  const l = (u) => {
    var f;
    n = !0, t.style.cursor = "grabbing";
    const m = t.getBoundingClientRect();
    a = m.left, c = m.top, i = u.clientX, s = u.clientY, t.style.right = "auto", t.style.bottom = "auto", t.style.left = a + "px", t.style.top = c + "px";
    try {
      (f = t.setPointerCapture) == null || f.call(t, u.pointerId);
    } catch {
    }
  }, d = (u) => {
    n && (t.style.left = Math.max(0, a + (u.clientX - i)) + "px", t.style.top = Math.max(0, c + (u.clientY - s)) + "px");
  }, o = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", d), t.addEventListener("pointerup", o), t;
}
async function wm(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? ao();
  return qc(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', a = (k) => {
      k === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:92vw") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (k) => {
      var C;
      try {
        (C = e.onPhase) == null || C.call(e, k);
      } catch {
      }
    };
    a("modal");
    let l = !1, d = null, o = !1;
    const h = () => {
      try {
        d == null || d.stop();
      } catch {
      }
    }, p = (k) => {
      k.key === "Escape" && (k.stopPropagation(), k.preventDefault(), f(null));
    }, u = () => {
      h();
    }, m = (k) => {
      o && k.target === n && (k.preventDefault(), k.stopPropagation(), f(null));
    };
    n.addEventListener("pointerdown", m), document.addEventListener("keydown", p, { capture: !0 }), typeof window < "u" && (window.addEventListener("pagehide", u), window.addEventListener("beforeunload", u));
    const f = (k) => {
      if (!l) {
        l = !0, h(), n.removeEventListener("pointerdown", m), document.removeEventListener("keydown", p, { capture: !0 }), typeof window < "u" && (window.removeEventListener("pagehide", u), window.removeEventListener("beforeunload", u));
        try {
          n.remove();
        } catch {
        }
        r(k);
      }
    }, g = (k) => {
      const C = Math.max(0, Math.round(k / 1e3));
      return `${Math.floor(C / 60)}:${String(C % 60).padStart(2, "0")}`;
    }, x = (k) => `${(k / 1048576).toFixed(1)} MB`, v = { ...Bc, ...e.caps || {} }, b = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const k = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${k}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const C = i.querySelector("#klr-cam").checked, L = i.querySelector("#klr-mic").checked;
        S(C, L);
      };
    }, S = async (k, C) => {
      var D;
      let L = null;
      try {
        d = await ym({
          wantCamera: k,
          wantMic: C,
          caps: e.caps,
          onFallback: (I) => {
            L = I;
          },
          onStats: ({ elapsedMs: I, bytes: J }) => {
            const H = i.querySelector("#klr-timer");
            H && (H.textContent = "REC " + g(I));
            const _ = i.querySelector("#klr-meta");
            _ && (_.innerHTML = `${g(Math.max(0, v.maxDurationMs - I))} left<br>~${x(J)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      w(L);
      try {
        const I = km((D = d == null ? void 0 : d.cameraStream) == null ? void 0 : D.call(d));
        I && n.appendChild(I);
      } catch {
      }
      d.done.then(async (I) => {
        f(await vm(I));
      });
    }, w = (k) => {
      const C = k === "camera-blocked", D = C ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!k && !C ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:600;white-space:nowrap"><span aria-hidden="true" style="width:9px;height:9px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-pause" style="padding:7px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><button id="klr-stop" style="padding:7px 12px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Stop</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:right;white-space:nowrap"></span></div>' + D;
      const I = i.querySelector("#klr-pause");
      I.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), I.textContent = "Resume") : (d.resume(), I.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    b();
  }) : null;
}
async function Ta(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((u, m) => {
      const f = new Image();
      f.onload = () => u(f), f.onerror = m, f.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight;
    if (!s || !a) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), d = Math.round(a * c), o = document.createElement("canvas");
    o.width = l, o.height = d;
    const h = o.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, d), h.drawImage(i, 0, 0, l, d);
    const p = o.toDataURL("image/jpeg", n);
    return p.length < e.length ? p : e;
  } catch {
    return e;
  }
}
async function xm(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((u, m) => {
      const f = new Image();
      f.onload = () => u(f), f.onerror = m, f.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight;
    if (!s || !a) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), d = Math.round(a * c), o = document.createElement("canvas");
    o.width = l, o.height = d;
    const h = o.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, d), h.drawImage(i, 0, 0, l, d);
    const p = o.toDataURL("image/jpeg", n);
    return p.length < e.length ? p : e;
  } catch {
    return e;
  }
}
var Sm = Object.defineProperty, Cm = (e, t, r) => t in e ? Sm(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, W = (e, t, r) => Cm(e, typeof t != "symbol" ? t + "" : t, r), Aa, Em = Object.defineProperty, Mm = (e, t, r) => t in e ? Em(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, _a = (e, t, r) => Mm(e, typeof t != "symbol" ? t + "" : t, r), Ye = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Ye || {});
const Ia = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, La = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Rn = {}, Wc = {}, Rm = () => !!globalThis.Zone;
function lo(e) {
  if (Rn[e])
    return Rn[e];
  const t = globalThis[e], r = t.prototype, n = e in Ia ? Ia[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in La ? La[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Rm())
    return Rn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Wc[e] = () => c.remove()) : c.remove(), Rn[e] = d;
  } catch {
    return r;
  }
}
const Ui = {};
function Bt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ui[i])
    return Ui[i].call(
      t
    );
  const s = lo(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Ui[i] = a, a.call(t)) : t[r];
}
const Bi = {};
function Hc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Bi[n])
    return Bi[n].bind(
      t
    );
  const s = lo(e)[r];
  return typeof s != "function" ? t[r] : (Bi[n] = s, s.bind(t));
}
function Tm(e) {
  return Bt("Node", e, "ownerDocument");
}
function Am(e) {
  return Bt("Node", e, "childNodes");
}
function _m(e) {
  return Bt("Node", e, "parentNode");
}
function Im(e) {
  return Bt("Node", e, "parentElement");
}
function Lm(e) {
  return Bt("Node", e, "textContent");
}
function Om(e, t) {
  return Hc("Node", e, "contains")(t);
}
function Nm(e) {
  return Hc("Node", e, "getRootNode")();
}
function Pm(e) {
  return !e || !("host" in e) ? null : Bt("ShadowRoot", e, "host");
}
function Dm(e) {
  return e.styleSheets;
}
function zm(e) {
  return !e || !("shadowRoot" in e) ? null : Bt("Element", e, "shadowRoot");
}
function Fm(e, t) {
  return Bt("Element", e, "querySelector")(t);
}
function $m(e, t) {
  return Bt("Element", e, "querySelectorAll")(t);
}
function Um() {
  return [
    lo("MutationObserver").constructor,
    Wc.MutationObserver ?? (() => {
    })
  ];
}
let jc = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (jc = () => (/* @__PURE__ */ new Date()).getTime());
function Bm(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const n = e[t], i = r(n);
    return typeof i == "function" && (i.prototype = i.prototype || {}, Object.defineProperties(i, {
      __rrweb_original__: {
        enumerable: !1,
        value: n
      }
    })), e[t] = i, () => {
      e[t] = n;
    };
  } catch {
    return () => {
    };
  }
}
const et = {
  ownerDocument: Tm,
  childNodes: Am,
  parentNode: _m,
  parentElement: Im,
  textContent: Lm,
  contains: Om,
  getRootNode: Nm,
  host: Pm,
  styleSheets: Dm,
  shadowRoot: zm,
  querySelector: Fm,
  querySelectorAll: $m,
  nowTimestamp: jc,
  mutationObserverCtor: Um,
  patch: Bm
};
function Vc(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Zr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && et.host(e) || null
  );
  return !!(t && "shadowRoot" in t && et.shadowRoot(t) === e);
}
function Qr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function qm(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Wm(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Ks(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Yc(i, r)
    ).join("");
    return qm(n);
  } catch {
    return null;
  }
}
function Yc(e, t) {
  if (jm(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Ks(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Wm(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Gn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Vm(e) && e.selectorText.includes(":") && (r = Hm(r)), t ? Gn(r, t) : r;
  }
}
function Hm(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function jm(e) {
  return "styleSheet" in e;
}
function Vm(e) {
  return "selectorText" in e;
}
class Gc {
  constructor() {
    _a(this, "idNodeMap", /* @__PURE__ */ new Map()), _a(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(t) {
    var r;
    return t ? ((r = this.getMeta(t)) == null ? void 0 : r.id) ?? -1 : -1;
  }
  getNode(t) {
    return this.idNodeMap.get(t) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(t) {
    return this.nodeMetaMap.get(t) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(t) {
    const r = this.getId(t);
    this.idNodeMap.delete(r), t.childNodes && t.childNodes.forEach(
      (n) => this.removeNodeFromMap(n)
    );
  }
  has(t) {
    return this.idNodeMap.has(t);
  }
  hasNode(t) {
    return this.nodeMetaMap.has(t);
  }
  add(t, r) {
    const n = r.id;
    this.idNodeMap.set(n, t), this.nodeMetaMap.set(t, r);
  }
  replace(t, r) {
    const n = this.getNode(t);
    if (n) {
      const i = this.nodeMetaMap.get(n);
      i && this.nodeMetaMap.set(r, i);
    }
    this.idNodeMap.set(t, r);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function Ym() {
  return new Gc();
}
function Vn({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && fr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function fr(e) {
  return e.toLowerCase();
}
const Oa = "__rrweb_original__";
function Gm(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = Oa in s ? s[Oa] : s;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        a.call(
          t,
          n,
          i,
          Math.min(r, e.width - n),
          Math.min(r, e.height - i)
        ).data.buffer
      ).some((l) => l !== 0)) return !1;
    }
  return !0;
}
function Yn(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    fr(t)
  ) : null;
}
function Xc(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Xm(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Km = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Jm = /^(?:[a-z+]+:)?\/\//i, Zm = /^www\..*/i, Qm = /^(data:)([^,]*),(.*)/i;
function Gn(e, t) {
  return (e || "").replace(
    Km,
    (r, n, i, s, a, c) => {
      const l = i || a || c, d = n || s || "";
      if (!l)
        return r;
      if (Jm.test(l) || Zm.test(l))
        return `url(${d}${l}${d})`;
      if (Qm.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${Xm(t) + l}${d})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const p of h)
        p !== "." && (p === ".." ? o.pop() : o.push(p));
      return `url(${d}${o.join("/")}${d})`;
    }
  );
}
function Tn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function eg(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Tn(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = Tn(
          n[l].textContent,
          r
        ), o = 100;
        let h = 3;
        for (; h < d.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (d[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        d.indexOf(d.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < d.length; h++) {
          let p = d.substring(0, h), u = a.split(p), m = -1;
          if (u.length === 2)
            m = u[0].length;
          else if (u.length > 2 && u[0] === "" && n[l - 1].textContent !== "")
            m = a.indexOf(p, 1);
          else if (u.length === 1) {
            if (p = p.substring(
              0,
              p.length - 1
            ), u = a.split(p), u.length <= 1)
              return i.push(e), i;
            h = o + 1;
          } else h === d.length - 1 && (m = a.indexOf(p));
          if (u.length >= 2 && h > o) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const g = Tn(f).length;
              m = a.indexOf(p, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const g = Tn(
                e.substring(0, f),
                r
              );
              if (g.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), a = a.substring(m);
                break;
              } else g.length < m ? f += Math.max(
                1,
                Math.floor((m - g.length) / c)
              ) : f -= Math.max(
                1,
                Math.floor((g.length - m) * c)
              );
            }
            break;
          }
        }
      }
  }
  return i.push(e), i;
}
function tg(e, t) {
  return eg(e, t).join("/* rr_split */");
}
let rg = 1;
const ng = new RegExp("[^a-z0-9-_:]"), sn = -2;
function Kc() {
  return rg++;
}
function ig(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = fr(e.tagName);
  return ng.test(t) ? "div" : t;
}
let Er, Na;
const sg = /^[^ \t\n\r\u000c]+/, og = /^[, \t\n\r\u000c]+/;
function ag(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(og), !(r >= t.length); ) {
    let s = n(sg);
    if (s.slice(-1) === ",")
      s = Ar(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Ar(e, s);
      let c = !1;
      for (; ; ) {
        const l = t.charAt(r);
        if (l === "") {
          i.push((s + a).trim());
          break;
        } else if (c)
          l === ")" && (c = !1);
        else if (l === ",") {
          r += 1, i.push((s + a).trim());
          break;
        } else l === "(" && (c = !0);
        a += l, r += 1;
      }
    }
  }
  return i.join(", ");
}
const Pa = /* @__PURE__ */ new WeakMap();
function Ar(e, t) {
  return !t || t.trim() === "" ? t : co(e, t);
}
function lg(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function co(e, t) {
  let r = Pa.get(e);
  if (r || (r = e.createElement("a"), Pa.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Jc(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Ar(e, n) : r === "srcset" ? ag(e, n) : r === "style" ? Gn(n, co(e)) : t === "object" && r === "data" ? Ar(e, n) : n);
}
function Zc(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function cg(e, t, r) {
  try {
    if (typeof t == "string") {
      if (e.classList.contains(t))
        return !0;
    } else
      for (let n = e.classList.length; n--; ) {
        const i = e.classList[n];
        if (t.test(i))
          return !0;
      }
    if (r)
      return e.matches(r);
  } catch {
  }
  return !1;
}
function Xn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Xn(et.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Xn(et.parentNode(e), t, r) : !1;
}
function Qc(e, t, r, n) {
  let i;
  if (Vc(e)) {
    if (i = e, !et.childNodes(i).length)
      return !1;
  } else {
    if (et.parentElement(e) === null)
      return !1;
    i = et.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Xn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function ug(e, t, r) {
  const n = e.contentWindow;
  if (!n)
    return;
  let i = !1, s;
  try {
    s = n.document.readyState;
  } catch {
    return;
  }
  if (s !== "complete") {
    const c = setTimeout(() => {
      i || (t(), i = !0);
    }, r);
    e.addEventListener("load", () => {
      clearTimeout(c), i = !0, t();
    });
    return;
  }
  const a = "about:blank";
  if (n.location.href !== a || e.src === a || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function dg(e, t, r) {
  let n = !1, i;
  try {
    i = e.sheet;
  } catch {
    return;
  }
  if (i) return;
  const s = setTimeout(() => {
    n || (t(), n = !0);
  }, r);
  e.addEventListener("load", () => {
    clearTimeout(s), n = !0, t();
  });
}
function pg(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: a,
    inlineStylesheet: c,
    maskInputOptions: l = {},
    maskTextFn: d,
    maskInputFn: o,
    dataURLOptions: h = {},
    inlineImages: p,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, x = hg(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Ye.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Ye.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Ye.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return mg(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: o,
        dataURLOptions: h,
        inlineImages: p,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: x
      });
    case e.TEXT_NODE:
      return fg(e, {
        doc: r,
        needsMask: a,
        maskTextFn: d,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Ye.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: Ye.Comment,
        textContent: et.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function hg(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function fg(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = et.parentNode(e), c = a && a.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = et.textContent(e), d && l && (l = Gn(l, co(t.doc)))), !d && !o && l && r && (l = n ? n(l, et.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: Ye.Text,
    textContent: l || "",
    rootId: i
  };
}
function mg(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: s,
    maskInputOptions: a = {},
    maskInputFn: c,
    dataURLOptions: l = {},
    inlineImages: d,
    recordCanvas: o,
    keepIframeSrcFn: h,
    newlyAddedElement: p = !1,
    rootId: u
  } = t, m = cg(e, n, i), f = ig(e);
  let g = {};
  const x = e.attributes.length;
  for (let b = 0; b < x; b++) {
    const S = e.attributes[b];
    Zc(f, S.name, S.value) || (g[S.name] = Jc(
      r,
      f,
      fr(S.name),
      S.value
    ));
  }
  if (f === "link" && s) {
    const b = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let S = null;
    b && (S = Ks(b)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let b = Ks(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = tg(b, e)), g._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && b ? g.value = Vn({
      element: e,
      type: Yn(e),
      tagName: f,
      value: b,
      maskInputOptions: a,
      maskInputFn: c
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !a.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      Gm(e) || (g.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const b = e.toDataURL(
        l.type,
        l.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const w = S.toDataURL(
        l.type,
        l.quality
      );
      b !== w && (g.rr_dataURL = b);
    }
  }
  if (f === "img" && d) {
    Er || (Er = r.createElement("canvas"), Na = Er.getContext("2d"));
    const b = e, S = b.currentSrc || b.getAttribute("src") || "<unknown-src>", w = b.crossOrigin, k = () => {
      b.removeEventListener("load", k);
      try {
        Er.width = b.naturalWidth, Er.height = b.naturalHeight, Na.drawImage(b, 0, 0), g.rr_dataURL = Er.toDataURL(
          l.type,
          l.quality
        );
      } catch (C) {
        if (b.crossOrigin !== "anonymous") {
          b.crossOrigin = "anonymous", b.complete && b.naturalWidth !== 0 ? k() : b.addEventListener("load", k);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${C}`
          );
      }
      b.crossOrigin === "anonymous" && (w ? g.crossOrigin = w : b.removeAttribute("crossorigin"));
    };
    b.complete && b.naturalWidth !== 0 ? k() : b.addEventListener("load", k);
  }
  if (["audio", "video"].includes(f)) {
    const b = g;
    b.rr_mediaState = e.paused ? "paused" : "played", b.rr_mediaCurrentTime = e.currentTime, b.rr_mediaPlaybackRate = e.playbackRate, b.rr_mediaMuted = e.muted, b.rr_mediaLoop = e.loop, b.rr_mediaVolume = e.volume;
  }
  if (p || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: b, height: S } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${b}px`,
      rr_height: `${S}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: Ye.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: lg(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: v
  };
}
function Ie(e) {
  return e == null ? "" : e.toLowerCase();
}
function eu(e) {
  return e === !0 || e === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaVerification: !0,
    // the following are off for slimDOMOptions === true,
    // as they destroy some (hidden) info:
    headMetaAuthorship: e === "all",
    headMetaDescKeywords: e === "all",
    headTitleMutations: e === "all"
  } : e || {};
}
function gg(e, t) {
  if (t.comment && e.type === Ye.Comment)
    return !0;
  if (e.type === Ye.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Xc(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (Ie(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || Ie(e.attributes.name) === "application-name" || Ie(e.attributes.rel) === "icon" || Ie(e.attributes.rel) === "apple-touch-icon" || Ie(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && Ie(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (Ie(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      Ie(e.attributes.name).match(/^(og|twitter):/) || Ie(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (Ie(e.attributes.name) === "robots" || Ie(e.attributes.name) === "googlebot" || Ie(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (Ie(e.attributes.name) === "author" || Ie(e.attributes.name) === "generator" || Ie(e.attributes.name) === "framework" || Ie(e.attributes.name) === "publisher" || Ie(e.attributes.name) === "progid" || Ie(e.attributes.property).match(/^article:/) || Ie(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (Ie(e.attributes.name) === "google-site-verification" || Ie(e.attributes.name) === "yandex-verification" || Ie(e.attributes.name) === "csrf-token" || Ie(e.attributes.name) === "p:domain_verify" || Ie(e.attributes.name) === "verify-v1" || Ie(e.attributes.name) === "verification" || Ie(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function _r(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    maskTextClass: a,
    maskTextSelector: c,
    skipChild: l = !1,
    inlineStylesheet: d = !0,
    maskInputOptions: o = {},
    maskTextFn: h,
    maskInputFn: p,
    slimDOMOptions: u,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: x,
    onIframeLoad: v,
    iframeLoadTimeout: b = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: C = !1,
    cssCaptured: L = !1
  } = t;
  let { needsMask: D } = t, { preserveWhiteSpace: I = !0 } = t;
  D || (D = Qc(
    e,
    a,
    c,
    D === void 0
  ));
  const J = pg(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: D,
    inlineStylesheet: d,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: p,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: k,
    newlyAddedElement: C,
    cssCaptured: L
  });
  if (!J)
    return console.warn(e, "not serialized"), null;
  let H;
  n.hasNode(e) ? H = n.getId(e) : gg(J, u) || !I && J.type === Ye.Text && !J.textContent.replace(/^\s+|\s+$/gm, "").length ? H = sn : H = Kc();
  const _ = Object.assign(J, { id: H });
  if (n.add(e, _), H === sn)
    return null;
  x && x(e);
  let ye = !l;
  if (_.type === Ye.Element) {
    ye = ye && !_.needBlock, delete _.needBlock;
    const oe = et.shadowRoot(e);
    oe && Qr(oe) && (_.isShadowHost = !0);
  }
  if ((_.type === Ye.Document || _.type === Ye.Element) && ye) {
    u.headWhitespace && _.type === Ye.Element && _.tagName === "head" && (I = !1);
    const oe = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: D,
      maskTextClass: a,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: d,
      maskInputOptions: o,
      maskTextFn: h,
      maskInputFn: p,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: I,
      onSerialize: x,
      onIframeLoad: v,
      iframeLoadTimeout: b,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(_.type === Ye.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === Ye.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (oe.cssCaptured = !0);
      for (const K of Array.from(et.childNodes(e))) {
        const he = _r(K, oe);
        he && _.childNodes.push(he);
      }
    }
    let le = null;
    if (Vc(e) && (le = et.shadowRoot(e)))
      for (const K of Array.from(et.childNodes(le))) {
        const he = _r(K, oe);
        he && (Qr(le) && (he.isShadow = !0), _.childNodes.push(he));
      }
  }
  const Le = et.parentNode(e);
  return Le && Zr(Le) && Qr(Le) && (_.isShadow = !0), _.type === Ye.Element && _.tagName === "iframe" && ug(
    e,
    () => {
      const oe = e.contentDocument;
      if (oe && v) {
        const le = _r(oe, {
          doc: oe,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: D,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: I,
          onSerialize: x,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        le && v(
          e,
          le
        );
      }
    },
    b
  ), _.type === Ye.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && Xc(_.attributes.href) === "css") && dg(
    e,
    () => {
      if (S) {
        const oe = _r(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: D,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: I,
          onSerialize: x,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        oe && S(
          e,
          oe
        );
      }
    },
    w
  ), _;
}
function yg(e, t) {
  const {
    mirror: r = new Gc(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: a = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: d = !1,
    maskAllInputs: o = !1,
    maskTextFn: h,
    maskInputFn: p,
    slimDOM: u = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: w = () => !1
  } = t, k = o === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : o === !1 ? {
    password: !0
  } : o, C = eu(u);
  return _r(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: s,
    maskTextSelector: a,
    skipChild: !1,
    inlineStylesheet: c,
    maskInputOptions: k,
    maskTextFn: h,
    maskInputFn: p,
    slimDOMOptions: C,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function bg(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function vg(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function n() {
      return this instanceof n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(n) {
    var i = Object.getOwnPropertyDescriptor(e, n);
    Object.defineProperty(r, n, i.get ? i : {
      enumerable: !0,
      get: function() {
        return e[n];
      }
    });
  }), r;
}
var An = { exports: {} }, Da;
function kg() {
  if (Da) return An.exports;
  Da = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return An.exports = t(), An.exports.createColors = t, An.exports;
}
const wg = {}, xg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wg
}, Symbol.toStringTag, { value: "Module" })), Tt = /* @__PURE__ */ vg(xg);
var qi, za;
function uo() {
  if (za) return qi;
  za = 1;
  let e = /* @__PURE__ */ kg(), t = Tt;
  class r extends Error {
    constructor(i, s, a, c, l, d) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), d && (this.plugin = d), typeof s < "u" && typeof a < "u" && (typeof s == "number" ? (this.line = s, this.column = a) : (this.line = s.line, this.column = s.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let a = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), d = String(l).length, o, h;
      if (i) {
        let { bold: p, gray: u, red: m } = e.createColors(!0);
        o = (f) => p(m(f)), h = (f) => u(f);
      } else
        o = h = (p) => p;
      return a.slice(c, l).map((p, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + p + `
 ` + g + o("^");
        }
        return " " + h(f) + p;
      }).join(`
`);
    }
    toString() {
      let i = this.showSourceCode();
      return i && (i = `

` + i + `
`), this.name + ": " + this.message + i;
    }
  }
  return qi = r, r.default = r, qi;
}
var _n = {}, Fa;
function po() {
  return Fa || (Fa = 1, _n.isClean = Symbol("isClean"), _n.my = Symbol("my")), _n;
}
var Wi, $a;
function tu() {
  if ($a) return Wi;
  $a = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(n) {
    return n[0].toUpperCase() + n.slice(1);
  }
  class r {
    constructor(i) {
      this.builder = i;
    }
    atrule(i, s) {
      let a = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? a += i.raws.afterName : c && (a += " "), i.nodes)
        this.block(i, a + c);
      else {
        let l = (i.raws.between || "") + (s ? ";" : "");
        this.builder(a + c + l, i);
      }
    }
    beforeAfter(i, s) {
      let a;
      i.type === "decl" ? a = this.raw(i, null, "beforeDecl") : i.type === "comment" ? a = this.raw(i, null, "beforeComment") : s === "before" ? a = this.raw(i, null, "beforeRule") : a = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (a.includes(`
`)) {
        let d = this.raw(i, null, "indent");
        if (d.length)
          for (let o = 0; o < l; o++) a += d;
      }
      return a;
    }
    block(i, s) {
      let a = this.raw(i, "between", "beforeOpen");
      this.builder(s + a + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let a = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], d = this.raw(l, "before");
        d && this.builder(d), this.stringify(l, s !== c || a);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), a = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + a + "*/", i);
    }
    decl(i, s) {
      let a = this.raw(i, "between", "colon"), c = i.prop + a + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), s && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, a) {
      let c;
      if (a || (a = s), s && (c = i.raws[s], typeof c < "u"))
        return c;
      let l = i.parent;
      if (a === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[a];
      let d = i.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[a] < "u")
        return d.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let o = "raw" + t(a);
        this[o] ? c = this[o](d, i) : d.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), d.rawCache[a] = c, c;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length > 0 && typeof a.raws.after < "u")
          return s = a.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let a;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(s, null, "beforeDecl") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeDecl(i, s) {
      let a;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(s, null, "beforeRule") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((a) => {
        if (a.type !== "decl" && (s = a.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && (a.parent !== i || i.first !== a) && typeof a.raws.before < "u")
          return s = a.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((a) => {
        if (typeof a.raws.between < "u")
          return s = a.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length === 0 && (s = a.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((a) => {
        let c = a.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof a.raws.before < "u") {
          let l = a.raws.before.split(`
`);
          return s = l[l.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length && a.last.type === "decl" && (s = a.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let a = i[s], c = i.raws[s];
      return c && c.value === a ? c.raw : a;
    }
    root(i) {
      this.body(i), i.raws.after && this.builder(i.raws.after);
    }
    rule(i) {
      this.block(i, this.rawValue(i, "selector")), i.raws.ownSemicolon && this.builder(i.raws.ownSemicolon, i, "end");
    }
    stringify(i, s) {
      if (!this[i.type])
        throw new Error(
          "Unknown AST node type " + i.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[i.type](i, s);
    }
  }
  return Wi = r, r.default = r, Wi;
}
var Hi, Ua;
function si() {
  if (Ua) return Hi;
  Ua = 1;
  let e = tu();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Hi = t, t.default = t, Hi;
}
var ji, Ba;
function oi() {
  if (Ba) return ji;
  Ba = 1;
  let { isClean: e, my: t } = po(), r = uo(), n = tu(), i = si();
  function s(c, l) {
    let d = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], p = typeof h;
      o === "parent" && p === "object" ? l && (d[o] = l) : o === "source" ? d[o] = h : Array.isArray(h) ? d[o] = h.map((u) => s(u, d)) : (p === "object" && h !== null && (h = s(h)), d[o] = h);
    }
    return d;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in l)
        if (d === "nodes") {
          this.nodes = [];
          for (let o of l[d])
            typeof o.clone == "function" ? this.append(o.clone()) : this.append(o);
        } else
          this[d] = l[d];
    }
    addToError(l) {
      if (l.postcssNode = this, l.stack && this.source && /\n\s{4}at /.test(l.stack)) {
        let d = this.source;
        l.stack = l.stack.replace(
          /\n\s{4}at /,
          `$&${d.input.from}:${d.start.line}:${d.start.column}$&`
        );
      }
      return l;
    }
    after(l) {
      return this.parent.insertAfter(this, l), this;
    }
    assign(l = {}) {
      for (let d in l)
        this[d] = l[d];
      return this;
    }
    before(l) {
      return this.parent.insertBefore(this, l), this;
    }
    cleanRaws(l) {
      delete this.raws.before, delete this.raws.after, l || delete this.raws.between;
    }
    clone(l = {}) {
      let d = s(this);
      for (let o in l)
        d[o] = l[o];
      return d;
    }
    cloneAfter(l = {}) {
      let d = this.clone(l);
      return this.parent.insertAfter(this, d), d;
    }
    cloneBefore(l = {}) {
      let d = this.clone(l);
      return this.parent.insertBefore(this, d), d;
    }
    error(l, d = {}) {
      if (this.source) {
        let { end: o, start: h } = this.rangeBy(d);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: o.column, line: o.line },
          d
        );
      }
      return new r(l);
    }
    getProxyProcessor() {
      return {
        get(l, d) {
          return d === "proxyOf" ? l : d === "root" ? () => l.root().toProxy() : l[d];
        },
        set(l, d, o) {
          return l[d] === o || (l[d] = o, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
          d === "text") && l.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let l = this;
        for (; l = l.parent; )
          l[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l + 1];
    }
    positionBy(l, d) {
      let o = this.source.start;
      if (l.index)
        o = this.positionInside(l.index, d);
      else if (l.word) {
        d = this.toString();
        let h = d.indexOf(l.word);
        h !== -1 && (o = this.positionInside(h, d));
      }
      return o;
    }
    positionInside(l, d) {
      let o = d || this.toString(), h = this.source.start.column, p = this.source.start.line;
      for (let u = 0; u < l; u++)
        o[u] === `
` ? (h = 1, p += 1) : h += 1;
      return { column: h, line: p };
    }
    prev() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l - 1];
    }
    rangeBy(l) {
      let d = {
        column: this.source.start.column,
        line: this.source.start.line
      }, o = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (l.word) {
        let h = this.toString(), p = h.indexOf(l.word);
        p !== -1 && (d = this.positionInside(p, h), o = this.positionInside(p + l.word.length, h));
      } else
        l.start ? d = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (d = this.positionInside(l.index)), l.end ? o = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? o = this.positionInside(l.endIndex) : l.index && (o = this.positionInside(l.index + 1));
      return (o.line < d.line || o.line === d.line && o.column <= d.column) && (o = { column: d.column + 1, line: d.line }), { end: o, start: d };
    }
    raw(l, d) {
      return new n().raw(this, l, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let d = this, o = !1;
        for (let h of l)
          h === this ? o = !0 : o ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
        o || this.remove();
      }
      return this;
    }
    root() {
      let l = this;
      for (; l.parent && l.parent.type !== "document"; )
        l = l.parent;
      return l;
    }
    toJSON(l, d) {
      let o = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let p = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          o[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          o[u] = m.toJSON(null, d);
        else if (u === "source") {
          let f = d.get(m.input);
          f == null && (f = p, d.set(m.input, p), p++), o[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[u] = m;
      }
      return h && (o.inputs = [...d.keys()].map((u) => u.toJSON())), o;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let d = "";
      return l(this, (o) => {
        d += o;
      }), d;
    }
    warn(l, d, o) {
      let h = { node: this };
      for (let p in o) h[p] = o[p];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return ji = a, a.default = a, ji;
}
var Vi, qa;
function ai() {
  if (qa) return Vi;
  qa = 1;
  let e = oi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Vi = t, t.default = t, Vi;
}
var Yi, Wa;
function Sg() {
  if (Wa) return Yi;
  Wa = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Yi = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Yi;
}
var Gi, Ha;
function ru() {
  if (Ha) return Gi;
  Ha = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Tt, { existsSync: r, readFileSync: n } = Tt, { dirname: i, join: s } = Tt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, o) {
      if (o.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, p = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), p && (this.text = p);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, p = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (p.test(d) || u.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (o.test(d) || h.test(d))
        return a(d.substr(RegExp.lastMatch.length));
      let m = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(d) {
      return d.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(d) {
      return typeof d != "object" ? !1 : typeof d.mappings == "string" || typeof d._mappings == "string" || Array.isArray(d.sections);
    }
    loadAnnotation(d) {
      let o = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!o) return;
      let h = d.lastIndexOf(o.pop()), p = d.indexOf("*/", h);
      h > -1 && p > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, p)));
    }
    loadFile(d) {
      if (this.root = i(d), r(d))
        return this.mapFile = d, n(d, "utf-8").toString().trim();
    }
    loadMap(d, o) {
      if (o === !1) return !1;
      if (o) {
        if (typeof o == "string")
          return o;
        if (typeof o == "function") {
          let h = o(d);
          if (h) {
            let p = this.loadFile(h);
            if (!p)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return p;
          }
        } else {
          if (o instanceof e)
            return t.fromSourceMap(o).toString();
          if (o instanceof t)
            return o.toString();
          if (this.isMap(o))
            return JSON.stringify(o);
          throw new Error(
            "Unsupported previous source map format: " + o.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return d && (h = s(i(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, o) {
      return d ? d.substr(0, o.length) === o : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Gi = c, c.default = c, Gi;
}
var Xi, ja;
function li() {
  if (ja) return Xi;
  ja = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Tt, { fileURLToPath: r, pathToFileURL: n } = Tt, { isAbsolute: i, resolve: s } = Tt, { nanoid: a } = /* @__PURE__ */ Sg(), c = Tt, l = uo(), d = ru(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!p || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), p && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let v = x.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, v = {}) {
      let b, S, w;
      if (g && typeof g == "object") {
        let C = g, L = x;
        if (typeof C.offset == "number") {
          let D = this.fromOffset(C.offset);
          g = D.line, x = D.col;
        } else
          g = C.line, x = C.column;
        if (typeof L.offset == "number") {
          let D = this.fromOffset(L.offset);
          S = D.line, w = D.col;
        } else
          S = L.line, w = L.column;
      } else if (!x) {
        let C = this.fromOffset(g);
        g = C.line, x = C.col;
      }
      let k = this.origin(g, x, S, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: x, endColumn: w, endLine: S, line: g, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let g, x;
      if (this[o])
        x = this[o];
      else {
        let b = this.css.split(`
`);
        x = new Array(b.length);
        let S = 0;
        for (let w = 0, k = b.length; w < k; w++)
          x[w] = S, S += b[w].length + 1;
        this[o] = x;
      }
      g = x[x.length - 1];
      let v = 0;
      if (f >= g)
        v = x.length - 1;
      else {
        let b = x.length - 2, S;
        for (; v < b; )
          if (S = v + (b - v >> 1), f < x[S])
            b = S - 1;
          else if (f >= x[S + 1])
            v = S + 1;
          else {
            v = S;
            break;
          }
      }
      return {
        col: f - x[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, v) {
      if (!this.map) return !1;
      let b = this.map.consumer(), S = b.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: v, line: x }));
      let k;
      i(S.source) ? k = n(S.source) : k = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let C = {
        column: S.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: S.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          C.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = b.sourceContentFor(S.source);
      return L && (C.source = L), C;
    }
    toJSON() {
      let f = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (f[g] = this[g]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return Xi = u, u.default = u, c && c.registerInput && c.registerInput(u), Xi;
}
var Ki, Va;
function nu() {
  if (Va) return Ki;
  Va = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Tt, { dirname: r, relative: n, resolve: i, sep: s } = Tt, { pathToFileURL: a } = Tt, c = li(), l = !!(e && t), d = !!(r && i && n && s);
  class o {
    constructor(p, u, m, f) {
      this.stringify = p, this.mapOpts = m.map || {}, this.root = u, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let p;
      this.isInline() ? p = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? p = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? p = this.mapOpts.annotation(this.opts.to, this.root) : p = this.outputFile() + ".map";
      let u = `
`;
      this.css.includes(`\r
`) && (u = `\r
`), this.css += u + "/*# sourceMappingURL=" + p + " */";
    }
    applyPrevMaps() {
      for (let p of this.previous()) {
        let u = this.toUrl(this.path(p.file)), m = p.root || r(p.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(p.text), f.sourcesContent && (f.sourcesContent = null)) : f = p.consumer(), this.map.applySourceMap(f, u, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let p;
          for (let u = this.root.nodes.length - 1; u >= 0; u--)
            p = this.root.nodes[u], p.type === "comment" && p.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(u);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && l && this.isMap())
        return this.generateMap();
      {
        let p = "";
        return this.stringify(this.root, (u) => {
          p += u;
        }), [p];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let p = this.previous()[0].consumer();
        p.file = this.outputFile(), this.map = t.fromSourceMap(p, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let p = 1, u = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (v, b, S) => {
        if (this.css += v, b && S !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (p += g.length, x = v.lastIndexOf(`
`), u = v.length - x) : u += v.length, b && S !== "start") {
          let w = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== w.last || w.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = p, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = p, f.generated.column = u - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((p) => p.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let p = this.mapOpts.annotation;
      return typeof p < "u" && p !== !0 ? !1 : this.previous().length ? this.previous().some((u) => u.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((p) => p.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(p) {
      if (this.mapOpts.absolute || p.charCodeAt(0) === 60 || /^\w+:\/\//.test(p)) return p;
      let u = this.memoizedPaths.get(p);
      if (u) return u;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, p);
      return this.memoizedPaths.set(p, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((p) => {
            if (p.source && p.source.input.map) {
              let u = p.source.input.map;
              this.previousMaps.includes(u) || this.previousMaps.push(u);
            }
          });
        else {
          let p = new c(this.originalCSS, this.opts);
          p.map && this.previousMaps.push(p.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let p = {};
      if (this.root)
        this.root.walk((u) => {
          if (u.source) {
            let m = u.source.input.from;
            if (m && !p[m]) {
              p[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, u.source.input.css);
            }
          }
        });
      else if (this.css) {
        let u = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(u, this.css);
      }
    }
    sourcePath(p) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(p.source.input.from) : this.toUrl(this.path(p.source.input.from));
    }
    toBase64(p) {
      return Buffer ? Buffer.from(p).toString("base64") : window.btoa(unescape(encodeURIComponent(p)));
    }
    toFileUrl(p) {
      let u = this.memoizedFileURLs.get(p);
      if (u) return u;
      if (a) {
        let m = a(p).toString();
        return this.memoizedFileURLs.set(p, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(p) {
      let u = this.memoizedURLs.get(p);
      if (u) return u;
      s === "\\" && (p = p.replace(/\\/g, "/"));
      let m = encodeURI(p).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(p, m), m;
    }
  }
  return Ki = o, Ki;
}
var Ji, Ya;
function ci() {
  if (Ya) return Ji;
  Ya = 1;
  let e = oi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ji = t, t.default = t, Ji;
}
var Zi, Ga;
function mr() {
  if (Ga) return Zi;
  Ga = 1;
  let { isClean: e, my: t } = po(), r = ai(), n = ci(), i = oi(), s, a, c, l;
  function d(p) {
    return p.map((u) => (u.nodes && (u.nodes = d(u.nodes)), delete u.source, u));
  }
  function o(p) {
    if (p[e] = !1, p.proxyOf.nodes)
      for (let u of p.proxyOf.nodes)
        o(u);
  }
  class h extends i {
    append(...u) {
      for (let m of u) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(u) {
      if (super.cleanRaws(u), this.nodes)
        for (let m of this.nodes) m.cleanRaws(u);
    }
    each(u) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = u(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(u) {
      return this.nodes.every(u);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let u = this.lastEach;
      return this.indexes[u] = 0, u;
    }
    getProxyProcessor() {
      return {
        get(u, m) {
          return m === "proxyOf" ? u : u[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => u[m](
            ...f.map((g) => typeof g == "function" ? (x, v) => g(x.toProxy(), v) : g)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (g, ...x) => f(g.toProxy(), ...x)
          ) : m === "root" ? () => u.root().toProxy() : m === "nodes" ? u.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? u[m].toProxy() : u[m] : u[m];
        },
        set(u, m, f) {
          return u[m] === f || (u[m] = f, (m === "name" || m === "params" || m === "selector") && u.markDirty()), !0;
        }
      };
    }
    index(u) {
      return typeof u == "number" ? u : (u.proxyOf && (u = u.proxyOf), this.proxyOf.nodes.indexOf(u));
    }
    insertAfter(u, m) {
      let f = this.index(u), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(u);
      for (let v of g) this.proxyOf.nodes.splice(f + 1, 0, v);
      let x;
      for (let v in this.indexes)
        x = this.indexes[v], f < x && (this.indexes[v] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let b of x) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + x.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(s(u).nodes);
      else if (typeof u > "u")
        u = [];
      else if (Array.isArray(u)) {
        u = u.slice(0);
        for (let g of u)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (u.type === "root" && this.type !== "document") {
        u = u.nodes.slice(0);
        for (let g of u)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (u.type)
        u = [u];
      else if (u.prop) {
        if (typeof u.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof u.value != "string" && (u.value = String(u.value)), u = [new r(u)];
      } else if (u.selector)
        u = [new a(u)];
      else if (u.name)
        u = [new c(u)];
      else if (u.text)
        u = [new n(u)];
      else
        throw new Error("Unknown node type in node creation");
      return u.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && o(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...u) {
      u = u.reverse();
      for (let m of u) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(u) {
      return u.parent = this, this.proxyOf.nodes.push(u), this;
    }
    removeAll() {
      for (let u of this.proxyOf.nodes) u.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(u) {
      u = this.index(u), this.proxyOf.nodes[u].parent = void 0, this.proxyOf.nodes.splice(u, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= u && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(u, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(u, f));
      }), this.markDirty(), this;
    }
    some(u) {
      return this.nodes.some(u);
    }
    walk(u) {
      return this.each((m, f) => {
        let g;
        try {
          g = u(m, f);
        } catch (x) {
          throw m.addToError(x);
        }
        return g !== !1 && m.walk && (g = m.walk(u)), g;
      });
    }
    walkAtRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && u.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(u) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return u(m, f);
      });
    }
    walkDecls(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && u.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && u.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "rule")
          return m(f, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return h.registerParse = (p) => {
    s = p;
  }, h.registerRule = (p) => {
    a = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, Zi = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Zi;
}
var Qi, Xa;
function ho() {
  if (Xa) return Qi;
  Xa = 1;
  let e = mr(), t, r;
  class n extends e {
    constructor(s) {
      super({ type: "document", ...s }), this.nodes || (this.nodes = []);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Qi = n, n.default = n, Qi;
}
var es, Ka;
function iu() {
  if (Ka) return es;
  Ka = 1;
  let e = {};
  return es = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, es;
}
var ts, Ja;
function su() {
  if (Ja) return ts;
  Ja = 1;
  class e {
    constructor(r, n = {}) {
      if (this.type = "warning", this.text = r, n.node && n.node.source) {
        let i = n.node.rangeBy(n);
        this.line = i.start.line, this.column = i.start.column, this.endLine = i.end.line, this.endColumn = i.end.column;
      }
      for (let i in n) this[i] = n[i];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return ts = e, e.default = e, ts;
}
var rs, Za;
function fo() {
  if (Za) return rs;
  Za = 1;
  let e = su();
  class t {
    constructor(n, i, s) {
      this.processor = n, this.messages = [], this.root = i, this.opts = s, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(n, i = {}) {
      i.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (i.plugin = this.lastPlugin.postcssPlugin);
      let s = new e(n, i);
      return this.messages.push(s), s;
    }
    warnings() {
      return this.messages.filter((n) => n.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return rs = t, t.default = t, rs;
}
var ns, Qa;
function Cg() {
  if (Qa) return ns;
  Qa = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return ns = function(L, D = {}) {
    let I = L.css.valueOf(), J = D.ignoreErrors, H, _, ye, Le, oe, le, K, he, Oe, ce, Me = I.length, P = 0, me = [], qe = [];
    function Xe() {
      return P;
    }
    function De(Q) {
      throw L.error("Unclosed " + Q, P);
    }
    function Fe() {
      return qe.length === 0 && P >= Me;
    }
    function We(Q) {
      if (qe.length) return qe.pop();
      if (P >= Me) return;
      let Ae = Q ? Q.ignoreUnclosed : !1;
      switch (H = I.charCodeAt(P), H) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = P;
          do
            _ += 1, H = I.charCodeAt(_);
          while (H === s || H === i || H === c || H === l || H === a);
          ce = ["space", I.slice(P, _)], P = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let te = String.fromCharCode(H);
          ce = [te, te, P];
          break;
        }
        case h: {
          if (he = me.length ? me.pop()[1] : "", Oe = I.charCodeAt(P + 1), he === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            _ = P;
            do {
              if (le = !1, _ = I.indexOf(")", _ + 1), _ === -1)
                if (J || Ae) {
                  _ = P;
                  break;
                } else
                  De("bracket");
              for (K = _; I.charCodeAt(K - 1) === r; )
                K -= 1, le = !le;
            } while (le);
            ce = ["brackets", I.slice(P, _ + 1), P, _], P = _;
          } else
            _ = I.indexOf(")", P + 1), Le = I.slice(P, _ + 1), _ === -1 || w.test(Le) ? ce = ["(", "(", P] : (ce = ["brackets", Le, P, _], P = _);
          break;
        }
        case e:
        case t: {
          ye = H === e ? "'" : '"', _ = P;
          do {
            if (le = !1, _ = I.indexOf(ye, _ + 1), _ === -1)
              if (J || Ae) {
                _ = P + 1;
                break;
              } else
                De("string");
            for (K = _; I.charCodeAt(K - 1) === r; )
              K -= 1, le = !le;
          } while (le);
          ce = ["string", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        case v: {
          b.lastIndex = P + 1, b.test(I), b.lastIndex === 0 ? _ = I.length - 1 : _ = b.lastIndex - 2, ce = ["at-word", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        case r: {
          for (_ = P, oe = !0; I.charCodeAt(_ + 1) === r; )
            _ += 1, oe = !oe;
          if (H = I.charCodeAt(_ + 1), oe && H !== n && H !== s && H !== i && H !== c && H !== l && H !== a && (_ += 1, k.test(I.charAt(_)))) {
            for (; k.test(I.charAt(_ + 1)); )
              _ += 1;
            I.charCodeAt(_ + 1) === s && (_ += 1);
          }
          ce = ["word", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        default: {
          H === n && I.charCodeAt(P + 1) === g ? (_ = I.indexOf("*/", P + 2) + 1, _ === 0 && (J || Ae ? _ = I.length : De("comment")), ce = ["comment", I.slice(P, _ + 1), P, _], P = _) : (S.lastIndex = P + 1, S.test(I), S.lastIndex === 0 ? _ = I.length - 1 : _ = S.lastIndex - 2, ce = ["word", I.slice(P, _ + 1), P, _], me.push(ce), P = _);
          break;
        }
      }
      return P++, ce;
    }
    function He(Q) {
      qe.push(Q);
    }
    return {
      back: He,
      endOfFile: Fe,
      nextToken: We,
      position: Xe
    };
  }, ns;
}
var is, el;
function mo() {
  if (el) return is;
  el = 1;
  let e = mr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "atrule";
    }
    append(...n) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...n);
    }
    prepend(...n) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...n);
    }
  }
  return is = t, t.default = t, e.registerAtRule(t), is;
}
var ss, tl;
function cn() {
  if (tl) return ss;
  tl = 1;
  let e = mr(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, a, c) {
      let l = super.normalize(s);
      if (a) {
        if (c === "prepend")
          this.nodes.length > 1 ? a.raws.before = this.nodes[1].raws.before : delete a.raws.before;
        else if (this.first !== a)
          for (let d of l)
            d.raws.before = a.raws.before;
      }
      return l;
    }
    removeChild(s, a) {
      let c = this.index(s);
      return !a && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, ss = n, n.default = n, e.registerRoot(n), ss;
}
var os, rl;
function ou() {
  if (rl) return os;
  rl = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, n) {
      let i = [], s = "", a = !1, c = 0, l = !1, d = "", o = !1;
      for (let h of t)
        o ? o = !1 : h === "\\" ? o = !0 : l ? h === d && (l = !1) : h === '"' || h === "'" ? (l = !0, d = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (s !== "" && i.push(s.trim()), s = "", a = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return os = e, e.default = e, os;
}
var as, nl;
function go() {
  if (nl) return as;
  nl = 1;
  let e = mr(), t = ou();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, a = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(a);
    }
  }
  return as = r, r.default = r, e.registerRule(r), as;
}
var ls, il;
function Eg() {
  if (il) return ls;
  il = 1;
  let e = ai(), t = Cg(), r = ci(), n = mo(), i = cn(), s = go();
  const a = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let o = d.length - 1; o >= 0; o--) {
      let h = d[o], p = h[3] || h[2];
      if (p) return p;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let p, u, m, f = !1, g = !1, x = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            g = !0;
            break;
          } else if (p === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, u = x[m]; u && u[0] === "space"; )
                u = x[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            x.push(o);
        else
          x.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (o = x[x.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let p = 0, u;
      for (let m = h - 1; m >= 0 && (u = o[m], !(u[0] !== "space" && (p += 1, p === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(o) {
      let h = 0, p, u, m;
      for (let [f, g] of o.entries()) {
        if (p = g, u = p[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
          if (!m)
            this.doubleColon(p);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = p;
      }
      return !1;
    }
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let p = o[1].slice(2, -2);
      if (/^\s*$/.test(p))
        h.text = "", h.raws.left = p, h.raws.right = "";
      else {
        let u = p.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = u[2], h.raws.left = u[1], h.raws.right = u[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let p = new e();
      this.init(p, o[0][2]);
      let u = o[o.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, o.pop()), p.source.end = this.getPosition(
        u[3] || u[2] || c(o)
      ), p.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), p.raws.before += o.shift()[1];
      for (p.source.start = this.getPosition(o[0][2]), p.prop = ""; o.length; ) {
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        p.prop += o.shift()[1];
      }
      p.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          p.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), p.raws.between += m[1];
      (p.prop[0] === "_" || p.prop[0] === "*") && (p.raws.before += p.prop[0], p.prop = p.prop.slice(1));
      let f = [], g;
      for (; o.length && (g = o[0][0], !(g !== "space" && g !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, v);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), S = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (S.trim().indexOf("!") === 0 && k !== "space")
              break;
            S = b.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = S, o = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (p.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(p, "value", f.concat(o), h), p.value.includes(":") && !h && this.checkMissedSemicolon(o);
    }
    doubleColon(o) {
      throw this.input.error(
        "Double colon",
        { offset: o[2] },
        { offset: o[2] + o[1].length }
      );
    }
    emptyRule(o) {
      let h = new s();
      this.init(h, o[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(o) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(o[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(o);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(o) {
      if (this.spaces += o[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(o) {
      let h = this.input.fromOffset(o);
      return {
        column: h.col,
        line: h.line,
        offset: o
      };
    }
    init(o, h) {
      this.current.push(o), o.source = {
        input: this.input,
        start: this.getPosition(h)
      }, o.raws.before = this.spaces, this.spaces = "", o.type !== "comment" && (this.semicolon = !1);
    }
    other(o) {
      let h = !1, p = null, u = !1, m = null, f = [], g = o[1].startsWith("--"), x = [], v = o;
      for (; v; ) {
        if (p = v[0], x.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (g && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(x);
            return;
          } else if (p === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (v = x[x.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let o;
      for (; !this.tokenizer.endOfFile(); )
        switch (o = this.tokenizer.nextToken(), o[0]) {
          case "space":
            this.spaces += o[1];
            break;
          case ";":
            this.freeSemicolon(o);
            break;
          case "}":
            this.end(o);
            break;
          case "comment":
            this.comment(o);
            break;
          case "at-word":
            this.atrule(o);
            break;
          case "{":
            this.emptyRule(o);
            break;
          default:
            this.other(o);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(o, h, p, u) {
      let m, f, g = p.length, x = "", v = !0, b, S;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? v = !1 : f === "comment" ? (S = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[S] && !a[b] ? x.slice(-1) === "," ? v = !1 : x += m[1] : v = !1) : x += m[1];
      if (!v) {
        let w = p.reduce((k, C) => k + C[1], "");
        o.raws[h] = { raw: w, value: x };
      }
      o[h] = x;
    }
    rule(o) {
      o.pop();
      let h = new s();
      this.init(h, o[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(o), this.raw(h, "selector", o), this.current = h;
    }
    spacesAndCommentsFromEnd(o) {
      let h, p = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        p = o.pop()[1] + p;
      return p;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, p = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        p += o.shift()[1];
      return p;
    }
    spacesFromEnd(o) {
      let h, p = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        p = o.pop()[1] + p;
      return p;
    }
    stringFrom(o, h) {
      let p = "";
      for (let u = h; u < o.length; u++)
        p += o[u][1];
      return o.splice(h, o.length - h), p;
    }
    unclosedBlock() {
      let o = this.current.source.start;
      throw this.input.error("Unclosed block", o.line, o.column);
    }
    unclosedBracket(o) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: o[2] },
        { offset: o[2] + 1 }
      );
    }
    unexpectedClose(o) {
      throw this.input.error(
        "Unexpected }",
        { offset: o[2] },
        { offset: o[2] + 1 }
      );
    }
    unknownWord(o) {
      throw this.input.error(
        "Unknown word",
        { offset: o[0][2] },
        { offset: o[0][2] + o[0][1].length }
      );
    }
    unnamedAtrule(o, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return ls = l, ls;
}
var cs, sl;
function yo() {
  if (sl) return cs;
  sl = 1;
  let e = mr(), t = Eg(), r = li();
  function n(i, s) {
    let a = new r(i, s), c = new t(a);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return cs = n, n.default = n, e.registerParse(n), cs;
}
var us, ol;
function au() {
  if (ol) return us;
  ol = 1;
  let { isClean: e, my: t } = po(), r = nu(), n = si(), i = mr(), s = ho(), a = iu(), c = fo(), l = yo(), d = cn();
  const o = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, h = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, p = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let w = !1, k = o[S.type];
    return S.type === "decl" ? w = S.prop.toLowerCase() : S.type === "atrule" && (w = S.name.toLowerCase()), w && S.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : S.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(S) {
    let w;
    return S.type === "document" ? w = ["Document", u, "DocumentExit"] : S.type === "root" ? w = ["Root", u, "RootExit"] : w = f(S), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((w) => x(w)), S;
  }
  let v = {};
  class b {
    constructor(w, k, C) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof b || k instanceof c)
        L = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let D = l;
        C.syntax && (D = C.syntax.parse), C.parser && (D = C.parser), D.parse && (D = D.parse);
        try {
          L = D(k, C);
        } catch (I) {
          this.processed = !0, this.error = I;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(w, L, C), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((D) => typeof D == "object" && D.prepare ? { ...D, ...D.prepare(this.result) } : D);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, k) {
      let C = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = C.postcssPlugin, w.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = C.postcssPlugin, D = C.postcssVersion, I = this.result.processor.version, J = D.split("."), H = I.split(".");
          (J[0] !== H[0] || parseInt(J[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + I + ", but " + L + " uses " + D + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, C, L) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let C in k) {
            if (!h[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[C])
              if (typeof k[C] == "object")
                for (let L in k[C])
                  L === "*" ? w(k, C, k[C][L]) : w(
                    k,
                    C + "-" + L.toLowerCase(),
                    k[C][L]
                  );
              else typeof k[C] == "function" && w(k, C, k[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], C = this.runOnRoot(k);
        if (m(C))
          try {
            await C;
          } catch (L) {
            throw this.handleError(L);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [g(w)];
          for (; k.length > 0; ) {
            let C = this.visitTick(k);
            if (m(C))
              try {
                await C;
              } catch (L) {
                let D = k[k.length - 1].node;
                throw this.handleError(L, D);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let L = w.nodes.map(
                  (D) => C(D, this.helpers)
                );
                await Promise.all(L);
              } else
                await C(w, this.helpers);
            } catch (L) {
              throw this.handleError(L);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let k = this.result.root.nodes.map(
              (C) => w.Once(C, this.helpers)
            );
            return m(k[0]) ? Promise.all(k) : k;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (k) {
        throw this.handleError(k);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, k = n;
      w.syntax && (k = w.syntax.stringify), w.stringifier && (k = w.stringifier), k.stringify && (k = k.stringify);
      let L = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let k = this.runOnRoot(w);
        if (m(k))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let k of w.nodes)
              this.visitSync(this.listeners.OnceExit, k);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, k) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [C, L] of w) {
        this.result.lastPlugin = C;
        let D;
        try {
          D = L(k, this.helpers);
        } catch (I) {
          throw this.handleError(I, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(D))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: C, visitors: L } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [I, J] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = I;
        try {
          return J(C.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, C);
        }
      }
      if (k.iterator !== 0) {
        let I = k.iterator, J;
        for (; J = C.nodes[C.indexes[I]]; )
          if (C.indexes[I] += 1, !J[e]) {
            J[e] = !0, w.push(g(J));
            return;
          }
        k.iterator = 0, delete C.indexes[I];
      }
      let D = k.events;
      for (; k.eventIndex < D.length; ) {
        let I = D[k.eventIndex];
        if (k.eventIndex += 1, I === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[I]) {
          k.visitors = this.listeners[I];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let k = f(w);
      for (let C of k)
        if (C === u)
          w.nodes && w.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[C];
          if (L && this.visitSync(L, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return b.registerPostcss = (S) => {
    v = S;
  }, us = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), us;
}
var ds, al;
function Mg() {
  if (al) return ds;
  al = 1;
  let e = nu(), t = si(), r = iu(), n = yo();
  const i = fo();
  class s {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let p = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return p.root;
        }
      });
      let u = new e(h, o, this._opts, l);
      if (u.isMap()) {
        let [m, f] = u.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        u.clearAnnotation(), this.result.css = u.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(c) {
      return this.async().catch(c);
    }
    finally(c) {
      return this.async().then(c, c);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(c, l) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(c, l);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let c, l = n;
      try {
        c = l(this._css, this._opts);
      } catch (d) {
        this.error = d;
      }
      if (this.error)
        throw this.error;
      return this._root = c, c;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return ds = s, s.default = s, ds;
}
var ps, ll;
function Rg() {
  if (ll) return ps;
  ll = 1;
  let e = Mg(), t = au(), r = ho(), n = cn();
  class i {
    constructor(a = []) {
      this.version = "8.4.38", this.plugins = this.normalize(a);
    }
    normalize(a) {
      let c = [];
      for (let l of a)
        if (l.postcss === !0 ? l = l() : l.postcss && (l = l.postcss), typeof l == "object" && Array.isArray(l.plugins))
          c = c.concat(l.plugins);
        else if (typeof l == "object" && l.postcssPlugin)
          c.push(l);
        else if (typeof l == "function")
          c.push(l);
        else if (typeof l == "object" && (l.parse || l.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(l + " is not a PostCSS plugin");
      return c;
    }
    process(a, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, a, c) : new t(this, a, c);
    }
    use(a) {
      return this.plugins = this.plugins.concat(this.normalize([a])), this;
    }
  }
  return ps = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ps;
}
var hs, cl;
function Tg() {
  if (cl) return hs;
  cl = 1;
  let e = ai(), t = ru(), r = ci(), n = mo(), i = li(), s = cn(), a = go();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((p) => c(p));
    let { inputs: o, ...h } = l;
    if (o) {
      d = [];
      for (let p of o) {
        let u = { ...p, __proto__: i.prototype };
        u.map && (u.map = {
          ...u.map,
          __proto__: t.prototype
        }), d.push(u);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((p) => c(p, d))), h.source) {
      let { inputId: p, ...u } = h.source;
      h.source = u, p != null && (h.source.input = d[p]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new a(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return hs = c, c.default = c, hs;
}
var fs, ul;
function Ag() {
  if (ul) return fs;
  ul = 1;
  let e = uo(), t = ai(), r = au(), n = mr(), i = Rg(), s = si(), a = Tg(), c = ho(), l = su(), d = ci(), o = mo(), h = fo(), p = li(), u = yo(), m = ou(), f = go(), g = cn(), x = oi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(S, w) {
    let k = !1;
    function C(...D) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let I = w(...D);
      return I.postcssPlugin = S, I.postcssVersion = new i().version, I;
    }
    let L;
    return Object.defineProperty(C, "postcss", {
      get() {
        return L || (L = C()), L;
      }
    }), C.process = function(D, I, J) {
      return v([C(J)]).process(D, I);
    }, C;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new g(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = g, v.Node = x, r.registerPostcss(v), fs = v, v.default = v, fs;
}
var _g = Ag();
const Ne = /* @__PURE__ */ bg(_g);
Ne.stringify;
Ne.fromJSON;
Ne.plugin;
Ne.parse;
Ne.list;
Ne.document;
Ne.comment;
Ne.atRule;
Ne.rule;
Ne.decl;
Ne.root;
Ne.CssSyntaxError;
Ne.Declaration;
Ne.Container;
Ne.Processor;
Ne.Document;
Ne.Comment;
Ne.Warning;
Ne.AtRule;
Ne.Result;
Ne.Input;
Ne.Rule;
Ne.Root;
Ne.Node;
var Ig = Object.defineProperty, Lg = (e, t, r) => t in e ? Ig(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ft = (e, t, r) => Lg(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Og(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ng(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function n() {
      return this instanceof n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(n) {
    var i = Object.getOwnPropertyDescriptor(e, n);
    Object.defineProperty(r, n, i.get ? i : {
      enumerable: !0,
      get: function() {
        return e[n];
      }
    });
  }), r;
}
var In = { exports: {} }, dl;
function Pg() {
  if (dl) return In.exports;
  dl = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return In.exports = t(), In.exports.createColors = t, In.exports;
}
const Dg = {}, zg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dg
}, Symbol.toStringTag, { value: "Module" })), At = /* @__PURE__ */ Ng(zg);
var ms, pl;
function bo() {
  if (pl) return ms;
  pl = 1;
  let e = /* @__PURE__ */ Pg(), t = At;
  class r extends Error {
    constructor(i, s, a, c, l, d) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), d && (this.plugin = d), typeof s < "u" && typeof a < "u" && (typeof s == "number" ? (this.line = s, this.column = a) : (this.line = s.line, this.column = s.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let a = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), d = String(l).length, o, h;
      if (i) {
        let { bold: p, gray: u, red: m } = e.createColors(!0);
        o = (f) => p(m(f)), h = (f) => u(f);
      } else
        o = h = (p) => p;
      return a.slice(c, l).map((p, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + p + `
 ` + g + o("^");
        }
        return " " + h(f) + p;
      }).join(`
`);
    }
    toString() {
      let i = this.showSourceCode();
      return i && (i = `

` + i + `
`), this.name + ": " + this.message + i;
    }
  }
  return ms = r, r.default = r, ms;
}
var Ln = {}, hl;
function vo() {
  return hl || (hl = 1, Ln.isClean = Symbol("isClean"), Ln.my = Symbol("my")), Ln;
}
var gs, fl;
function lu() {
  if (fl) return gs;
  fl = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(n) {
    return n[0].toUpperCase() + n.slice(1);
  }
  class r {
    constructor(i) {
      this.builder = i;
    }
    atrule(i, s) {
      let a = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? a += i.raws.afterName : c && (a += " "), i.nodes)
        this.block(i, a + c);
      else {
        let l = (i.raws.between || "") + (s ? ";" : "");
        this.builder(a + c + l, i);
      }
    }
    beforeAfter(i, s) {
      let a;
      i.type === "decl" ? a = this.raw(i, null, "beforeDecl") : i.type === "comment" ? a = this.raw(i, null, "beforeComment") : s === "before" ? a = this.raw(i, null, "beforeRule") : a = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (a.includes(`
`)) {
        let d = this.raw(i, null, "indent");
        if (d.length)
          for (let o = 0; o < l; o++) a += d;
      }
      return a;
    }
    block(i, s) {
      let a = this.raw(i, "between", "beforeOpen");
      this.builder(s + a + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let a = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], d = this.raw(l, "before");
        d && this.builder(d), this.stringify(l, s !== c || a);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), a = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + a + "*/", i);
    }
    decl(i, s) {
      let a = this.raw(i, "between", "colon"), c = i.prop + a + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), s && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, a) {
      let c;
      if (a || (a = s), s && (c = i.raws[s], typeof c < "u"))
        return c;
      let l = i.parent;
      if (a === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[a];
      let d = i.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[a] < "u")
        return d.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let o = "raw" + t(a);
        this[o] ? c = this[o](d, i) : d.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), d.rawCache[a] = c, c;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length > 0 && typeof a.raws.after < "u")
          return s = a.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let a;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(s, null, "beforeDecl") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeDecl(i, s) {
      let a;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(s, null, "beforeRule") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((a) => {
        if (a.type !== "decl" && (s = a.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && (a.parent !== i || i.first !== a) && typeof a.raws.before < "u")
          return s = a.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((a) => {
        if (typeof a.raws.between < "u")
          return s = a.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length === 0 && (s = a.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((a) => {
        let c = a.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof a.raws.before < "u") {
          let l = a.raws.before.split(`
`);
          return s = l[l.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length && a.last.type === "decl" && (s = a.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let a = i[s], c = i.raws[s];
      return c && c.value === a ? c.raw : a;
    }
    root(i) {
      this.body(i), i.raws.after && this.builder(i.raws.after);
    }
    rule(i) {
      this.block(i, this.rawValue(i, "selector")), i.raws.ownSemicolon && this.builder(i.raws.ownSemicolon, i, "end");
    }
    stringify(i, s) {
      if (!this[i.type])
        throw new Error(
          "Unknown AST node type " + i.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[i.type](i, s);
    }
  }
  return gs = r, r.default = r, gs;
}
var ys, ml;
function ui() {
  if (ml) return ys;
  ml = 1;
  let e = lu();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return ys = t, t.default = t, ys;
}
var bs, gl;
function di() {
  if (gl) return bs;
  gl = 1;
  let { isClean: e, my: t } = vo(), r = bo(), n = lu(), i = ui();
  function s(c, l) {
    let d = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], p = typeof h;
      o === "parent" && p === "object" ? l && (d[o] = l) : o === "source" ? d[o] = h : Array.isArray(h) ? d[o] = h.map((u) => s(u, d)) : (p === "object" && h !== null && (h = s(h)), d[o] = h);
    }
    return d;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in l)
        if (d === "nodes") {
          this.nodes = [];
          for (let o of l[d])
            typeof o.clone == "function" ? this.append(o.clone()) : this.append(o);
        } else
          this[d] = l[d];
    }
    addToError(l) {
      if (l.postcssNode = this, l.stack && this.source && /\n\s{4}at /.test(l.stack)) {
        let d = this.source;
        l.stack = l.stack.replace(
          /\n\s{4}at /,
          `$&${d.input.from}:${d.start.line}:${d.start.column}$&`
        );
      }
      return l;
    }
    after(l) {
      return this.parent.insertAfter(this, l), this;
    }
    assign(l = {}) {
      for (let d in l)
        this[d] = l[d];
      return this;
    }
    before(l) {
      return this.parent.insertBefore(this, l), this;
    }
    cleanRaws(l) {
      delete this.raws.before, delete this.raws.after, l || delete this.raws.between;
    }
    clone(l = {}) {
      let d = s(this);
      for (let o in l)
        d[o] = l[o];
      return d;
    }
    cloneAfter(l = {}) {
      let d = this.clone(l);
      return this.parent.insertAfter(this, d), d;
    }
    cloneBefore(l = {}) {
      let d = this.clone(l);
      return this.parent.insertBefore(this, d), d;
    }
    error(l, d = {}) {
      if (this.source) {
        let { end: o, start: h } = this.rangeBy(d);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: o.column, line: o.line },
          d
        );
      }
      return new r(l);
    }
    getProxyProcessor() {
      return {
        get(l, d) {
          return d === "proxyOf" ? l : d === "root" ? () => l.root().toProxy() : l[d];
        },
        set(l, d, o) {
          return l[d] === o || (l[d] = o, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
          d === "text") && l.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let l = this;
        for (; l = l.parent; )
          l[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l + 1];
    }
    positionBy(l, d) {
      let o = this.source.start;
      if (l.index)
        o = this.positionInside(l.index, d);
      else if (l.word) {
        d = this.toString();
        let h = d.indexOf(l.word);
        h !== -1 && (o = this.positionInside(h, d));
      }
      return o;
    }
    positionInside(l, d) {
      let o = d || this.toString(), h = this.source.start.column, p = this.source.start.line;
      for (let u = 0; u < l; u++)
        o[u] === `
` ? (h = 1, p += 1) : h += 1;
      return { column: h, line: p };
    }
    prev() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l - 1];
    }
    rangeBy(l) {
      let d = {
        column: this.source.start.column,
        line: this.source.start.line
      }, o = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (l.word) {
        let h = this.toString(), p = h.indexOf(l.word);
        p !== -1 && (d = this.positionInside(p, h), o = this.positionInside(p + l.word.length, h));
      } else
        l.start ? d = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (d = this.positionInside(l.index)), l.end ? o = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? o = this.positionInside(l.endIndex) : l.index && (o = this.positionInside(l.index + 1));
      return (o.line < d.line || o.line === d.line && o.column <= d.column) && (o = { column: d.column + 1, line: d.line }), { end: o, start: d };
    }
    raw(l, d) {
      return new n().raw(this, l, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let d = this, o = !1;
        for (let h of l)
          h === this ? o = !0 : o ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
        o || this.remove();
      }
      return this;
    }
    root() {
      let l = this;
      for (; l.parent && l.parent.type !== "document"; )
        l = l.parent;
      return l;
    }
    toJSON(l, d) {
      let o = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let p = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          o[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          o[u] = m.toJSON(null, d);
        else if (u === "source") {
          let f = d.get(m.input);
          f == null && (f = p, d.set(m.input, p), p++), o[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[u] = m;
      }
      return h && (o.inputs = [...d.keys()].map((u) => u.toJSON())), o;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let d = "";
      return l(this, (o) => {
        d += o;
      }), d;
    }
    warn(l, d, o) {
      let h = { node: this };
      for (let p in o) h[p] = o[p];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return bs = a, a.default = a, bs;
}
var vs, yl;
function pi() {
  if (yl) return vs;
  yl = 1;
  let e = di();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return vs = t, t.default = t, vs;
}
var ks, bl;
function Fg() {
  if (bl) return ks;
  bl = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return ks = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, ks;
}
var ws, vl;
function cu() {
  if (vl) return ws;
  vl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = At, { existsSync: r, readFileSync: n } = At, { dirname: i, join: s } = At;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, o) {
      if (o.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, p = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), p && (this.text = p);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, p = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (p.test(d) || u.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (o.test(d) || h.test(d))
        return a(d.substr(RegExp.lastMatch.length));
      let m = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(d) {
      return d.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(d) {
      return typeof d != "object" ? !1 : typeof d.mappings == "string" || typeof d._mappings == "string" || Array.isArray(d.sections);
    }
    loadAnnotation(d) {
      let o = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!o) return;
      let h = d.lastIndexOf(o.pop()), p = d.indexOf("*/", h);
      h > -1 && p > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, p)));
    }
    loadFile(d) {
      if (this.root = i(d), r(d))
        return this.mapFile = d, n(d, "utf-8").toString().trim();
    }
    loadMap(d, o) {
      if (o === !1) return !1;
      if (o) {
        if (typeof o == "string")
          return o;
        if (typeof o == "function") {
          let h = o(d);
          if (h) {
            let p = this.loadFile(h);
            if (!p)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return p;
          }
        } else {
          if (o instanceof e)
            return t.fromSourceMap(o).toString();
          if (o instanceof t)
            return o.toString();
          if (this.isMap(o))
            return JSON.stringify(o);
          throw new Error(
            "Unsupported previous source map format: " + o.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return d && (h = s(i(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, o) {
      return d ? d.substr(0, o.length) === o : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return ws = c, c.default = c, ws;
}
var xs, kl;
function hi() {
  if (kl) return xs;
  kl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = At, { fileURLToPath: r, pathToFileURL: n } = At, { isAbsolute: i, resolve: s } = At, { nanoid: a } = /* @__PURE__ */ Fg(), c = At, l = bo(), d = cu(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!p || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), p && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let v = x.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, v = {}) {
      let b, S, w;
      if (g && typeof g == "object") {
        let C = g, L = x;
        if (typeof C.offset == "number") {
          let D = this.fromOffset(C.offset);
          g = D.line, x = D.col;
        } else
          g = C.line, x = C.column;
        if (typeof L.offset == "number") {
          let D = this.fromOffset(L.offset);
          S = D.line, w = D.col;
        } else
          S = L.line, w = L.column;
      } else if (!x) {
        let C = this.fromOffset(g);
        g = C.line, x = C.col;
      }
      let k = this.origin(g, x, S, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: x, endColumn: w, endLine: S, line: g, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let g, x;
      if (this[o])
        x = this[o];
      else {
        let b = this.css.split(`
`);
        x = new Array(b.length);
        let S = 0;
        for (let w = 0, k = b.length; w < k; w++)
          x[w] = S, S += b[w].length + 1;
        this[o] = x;
      }
      g = x[x.length - 1];
      let v = 0;
      if (f >= g)
        v = x.length - 1;
      else {
        let b = x.length - 2, S;
        for (; v < b; )
          if (S = v + (b - v >> 1), f < x[S])
            b = S - 1;
          else if (f >= x[S + 1])
            v = S + 1;
          else {
            v = S;
            break;
          }
      }
      return {
        col: f - x[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, v) {
      if (!this.map) return !1;
      let b = this.map.consumer(), S = b.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: v, line: x }));
      let k;
      i(S.source) ? k = n(S.source) : k = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let C = {
        column: S.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: S.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          C.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = b.sourceContentFor(S.source);
      return L && (C.source = L), C;
    }
    toJSON() {
      let f = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (f[g] = this[g]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return xs = u, u.default = u, c && c.registerInput && c.registerInput(u), xs;
}
var Ss, wl;
function uu() {
  if (wl) return Ss;
  wl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = At, { dirname: r, relative: n, resolve: i, sep: s } = At, { pathToFileURL: a } = At, c = hi(), l = !!(e && t), d = !!(r && i && n && s);
  class o {
    constructor(p, u, m, f) {
      this.stringify = p, this.mapOpts = m.map || {}, this.root = u, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let p;
      this.isInline() ? p = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? p = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? p = this.mapOpts.annotation(this.opts.to, this.root) : p = this.outputFile() + ".map";
      let u = `
`;
      this.css.includes(`\r
`) && (u = `\r
`), this.css += u + "/*# sourceMappingURL=" + p + " */";
    }
    applyPrevMaps() {
      for (let p of this.previous()) {
        let u = this.toUrl(this.path(p.file)), m = p.root || r(p.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(p.text), f.sourcesContent && (f.sourcesContent = null)) : f = p.consumer(), this.map.applySourceMap(f, u, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let p;
          for (let u = this.root.nodes.length - 1; u >= 0; u--)
            p = this.root.nodes[u], p.type === "comment" && p.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(u);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && l && this.isMap())
        return this.generateMap();
      {
        let p = "";
        return this.stringify(this.root, (u) => {
          p += u;
        }), [p];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let p = this.previous()[0].consumer();
        p.file = this.outputFile(), this.map = t.fromSourceMap(p, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let p = 1, u = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (v, b, S) => {
        if (this.css += v, b && S !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (p += g.length, x = v.lastIndexOf(`
`), u = v.length - x) : u += v.length, b && S !== "start") {
          let w = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== w.last || w.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = p, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = p, f.generated.column = u - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((p) => p.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let p = this.mapOpts.annotation;
      return typeof p < "u" && p !== !0 ? !1 : this.previous().length ? this.previous().some((u) => u.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((p) => p.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(p) {
      if (this.mapOpts.absolute || p.charCodeAt(0) === 60 || /^\w+:\/\//.test(p)) return p;
      let u = this.memoizedPaths.get(p);
      if (u) return u;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, p);
      return this.memoizedPaths.set(p, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((p) => {
            if (p.source && p.source.input.map) {
              let u = p.source.input.map;
              this.previousMaps.includes(u) || this.previousMaps.push(u);
            }
          });
        else {
          let p = new c(this.originalCSS, this.opts);
          p.map && this.previousMaps.push(p.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let p = {};
      if (this.root)
        this.root.walk((u) => {
          if (u.source) {
            let m = u.source.input.from;
            if (m && !p[m]) {
              p[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, u.source.input.css);
            }
          }
        });
      else if (this.css) {
        let u = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(u, this.css);
      }
    }
    sourcePath(p) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(p.source.input.from) : this.toUrl(this.path(p.source.input.from));
    }
    toBase64(p) {
      return Buffer ? Buffer.from(p).toString("base64") : window.btoa(unescape(encodeURIComponent(p)));
    }
    toFileUrl(p) {
      let u = this.memoizedFileURLs.get(p);
      if (u) return u;
      if (a) {
        let m = a(p).toString();
        return this.memoizedFileURLs.set(p, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(p) {
      let u = this.memoizedURLs.get(p);
      if (u) return u;
      s === "\\" && (p = p.replace(/\\/g, "/"));
      let m = encodeURI(p).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(p, m), m;
    }
  }
  return Ss = o, Ss;
}
var Cs, xl;
function fi() {
  if (xl) return Cs;
  xl = 1;
  let e = di();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Cs = t, t.default = t, Cs;
}
var Es, Sl;
function gr() {
  if (Sl) return Es;
  Sl = 1;
  let { isClean: e, my: t } = vo(), r = pi(), n = fi(), i = di(), s, a, c, l;
  function d(p) {
    return p.map((u) => (u.nodes && (u.nodes = d(u.nodes)), delete u.source, u));
  }
  function o(p) {
    if (p[e] = !1, p.proxyOf.nodes)
      for (let u of p.proxyOf.nodes)
        o(u);
  }
  class h extends i {
    append(...u) {
      for (let m of u) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(u) {
      if (super.cleanRaws(u), this.nodes)
        for (let m of this.nodes) m.cleanRaws(u);
    }
    each(u) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = u(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(u) {
      return this.nodes.every(u);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let u = this.lastEach;
      return this.indexes[u] = 0, u;
    }
    getProxyProcessor() {
      return {
        get(u, m) {
          return m === "proxyOf" ? u : u[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => u[m](
            ...f.map((g) => typeof g == "function" ? (x, v) => g(x.toProxy(), v) : g)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (g, ...x) => f(g.toProxy(), ...x)
          ) : m === "root" ? () => u.root().toProxy() : m === "nodes" ? u.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? u[m].toProxy() : u[m] : u[m];
        },
        set(u, m, f) {
          return u[m] === f || (u[m] = f, (m === "name" || m === "params" || m === "selector") && u.markDirty()), !0;
        }
      };
    }
    index(u) {
      return typeof u == "number" ? u : (u.proxyOf && (u = u.proxyOf), this.proxyOf.nodes.indexOf(u));
    }
    insertAfter(u, m) {
      let f = this.index(u), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(u);
      for (let v of g) this.proxyOf.nodes.splice(f + 1, 0, v);
      let x;
      for (let v in this.indexes)
        x = this.indexes[v], f < x && (this.indexes[v] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let b of x) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + x.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(s(u).nodes);
      else if (typeof u > "u")
        u = [];
      else if (Array.isArray(u)) {
        u = u.slice(0);
        for (let g of u)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (u.type === "root" && this.type !== "document") {
        u = u.nodes.slice(0);
        for (let g of u)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (u.type)
        u = [u];
      else if (u.prop) {
        if (typeof u.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof u.value != "string" && (u.value = String(u.value)), u = [new r(u)];
      } else if (u.selector)
        u = [new a(u)];
      else if (u.name)
        u = [new c(u)];
      else if (u.text)
        u = [new n(u)];
      else
        throw new Error("Unknown node type in node creation");
      return u.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && o(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...u) {
      u = u.reverse();
      for (let m of u) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(u) {
      return u.parent = this, this.proxyOf.nodes.push(u), this;
    }
    removeAll() {
      for (let u of this.proxyOf.nodes) u.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(u) {
      u = this.index(u), this.proxyOf.nodes[u].parent = void 0, this.proxyOf.nodes.splice(u, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= u && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(u, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(u, f));
      }), this.markDirty(), this;
    }
    some(u) {
      return this.nodes.some(u);
    }
    walk(u) {
      return this.each((m, f) => {
        let g;
        try {
          g = u(m, f);
        } catch (x) {
          throw m.addToError(x);
        }
        return g !== !1 && m.walk && (g = m.walk(u)), g;
      });
    }
    walkAtRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && u.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(u) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return u(m, f);
      });
    }
    walkDecls(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && u.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && u.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === u)
          return m(f, g);
      }) : (m = u, this.walk((f, g) => {
        if (f.type === "rule")
          return m(f, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return h.registerParse = (p) => {
    s = p;
  }, h.registerRule = (p) => {
    a = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, Es = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Es;
}
var Ms, Cl;
function ko() {
  if (Cl) return Ms;
  Cl = 1;
  let e = gr(), t, r;
  class n extends e {
    constructor(s) {
      super({ type: "document", ...s }), this.nodes || (this.nodes = []);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Ms = n, n.default = n, Ms;
}
var Rs, El;
function du() {
  if (El) return Rs;
  El = 1;
  let e = {};
  return Rs = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Rs;
}
var Ts, Ml;
function pu() {
  if (Ml) return Ts;
  Ml = 1;
  class e {
    constructor(r, n = {}) {
      if (this.type = "warning", this.text = r, n.node && n.node.source) {
        let i = n.node.rangeBy(n);
        this.line = i.start.line, this.column = i.start.column, this.endLine = i.end.line, this.endColumn = i.end.column;
      }
      for (let i in n) this[i] = n[i];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return Ts = e, e.default = e, Ts;
}
var As, Rl;
function wo() {
  if (Rl) return As;
  Rl = 1;
  let e = pu();
  class t {
    constructor(n, i, s) {
      this.processor = n, this.messages = [], this.root = i, this.opts = s, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(n, i = {}) {
      i.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (i.plugin = this.lastPlugin.postcssPlugin);
      let s = new e(n, i);
      return this.messages.push(s), s;
    }
    warnings() {
      return this.messages.filter((n) => n.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return As = t, t.default = t, As;
}
var _s, Tl;
function $g() {
  if (Tl) return _s;
  Tl = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return _s = function(L, D = {}) {
    let I = L.css.valueOf(), J = D.ignoreErrors, H, _, ye, Le, oe, le, K, he, Oe, ce, Me = I.length, P = 0, me = [], qe = [];
    function Xe() {
      return P;
    }
    function De(Q) {
      throw L.error("Unclosed " + Q, P);
    }
    function Fe() {
      return qe.length === 0 && P >= Me;
    }
    function We(Q) {
      if (qe.length) return qe.pop();
      if (P >= Me) return;
      let Ae = Q ? Q.ignoreUnclosed : !1;
      switch (H = I.charCodeAt(P), H) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = P;
          do
            _ += 1, H = I.charCodeAt(_);
          while (H === s || H === i || H === c || H === l || H === a);
          ce = ["space", I.slice(P, _)], P = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let te = String.fromCharCode(H);
          ce = [te, te, P];
          break;
        }
        case h: {
          if (he = me.length ? me.pop()[1] : "", Oe = I.charCodeAt(P + 1), he === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            _ = P;
            do {
              if (le = !1, _ = I.indexOf(")", _ + 1), _ === -1)
                if (J || Ae) {
                  _ = P;
                  break;
                } else
                  De("bracket");
              for (K = _; I.charCodeAt(K - 1) === r; )
                K -= 1, le = !le;
            } while (le);
            ce = ["brackets", I.slice(P, _ + 1), P, _], P = _;
          } else
            _ = I.indexOf(")", P + 1), Le = I.slice(P, _ + 1), _ === -1 || w.test(Le) ? ce = ["(", "(", P] : (ce = ["brackets", Le, P, _], P = _);
          break;
        }
        case e:
        case t: {
          ye = H === e ? "'" : '"', _ = P;
          do {
            if (le = !1, _ = I.indexOf(ye, _ + 1), _ === -1)
              if (J || Ae) {
                _ = P + 1;
                break;
              } else
                De("string");
            for (K = _; I.charCodeAt(K - 1) === r; )
              K -= 1, le = !le;
          } while (le);
          ce = ["string", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        case v: {
          b.lastIndex = P + 1, b.test(I), b.lastIndex === 0 ? _ = I.length - 1 : _ = b.lastIndex - 2, ce = ["at-word", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        case r: {
          for (_ = P, oe = !0; I.charCodeAt(_ + 1) === r; )
            _ += 1, oe = !oe;
          if (H = I.charCodeAt(_ + 1), oe && H !== n && H !== s && H !== i && H !== c && H !== l && H !== a && (_ += 1, k.test(I.charAt(_)))) {
            for (; k.test(I.charAt(_ + 1)); )
              _ += 1;
            I.charCodeAt(_ + 1) === s && (_ += 1);
          }
          ce = ["word", I.slice(P, _ + 1), P, _], P = _;
          break;
        }
        default: {
          H === n && I.charCodeAt(P + 1) === g ? (_ = I.indexOf("*/", P + 2) + 1, _ === 0 && (J || Ae ? _ = I.length : De("comment")), ce = ["comment", I.slice(P, _ + 1), P, _], P = _) : (S.lastIndex = P + 1, S.test(I), S.lastIndex === 0 ? _ = I.length - 1 : _ = S.lastIndex - 2, ce = ["word", I.slice(P, _ + 1), P, _], me.push(ce), P = _);
          break;
        }
      }
      return P++, ce;
    }
    function He(Q) {
      qe.push(Q);
    }
    return {
      back: He,
      endOfFile: Fe,
      nextToken: We,
      position: Xe
    };
  }, _s;
}
var Is, Al;
function xo() {
  if (Al) return Is;
  Al = 1;
  let e = gr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "atrule";
    }
    append(...n) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...n);
    }
    prepend(...n) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...n);
    }
  }
  return Is = t, t.default = t, e.registerAtRule(t), Is;
}
var Ls, _l;
function un() {
  if (_l) return Ls;
  _l = 1;
  let e = gr(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, a, c) {
      let l = super.normalize(s);
      if (a) {
        if (c === "prepend")
          this.nodes.length > 1 ? a.raws.before = this.nodes[1].raws.before : delete a.raws.before;
        else if (this.first !== a)
          for (let d of l)
            d.raws.before = a.raws.before;
      }
      return l;
    }
    removeChild(s, a) {
      let c = this.index(s);
      return !a && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Ls = n, n.default = n, e.registerRoot(n), Ls;
}
var Os, Il;
function hu() {
  if (Il) return Os;
  Il = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, n) {
      let i = [], s = "", a = !1, c = 0, l = !1, d = "", o = !1;
      for (let h of t)
        o ? o = !1 : h === "\\" ? o = !0 : l ? h === d && (l = !1) : h === '"' || h === "'" ? (l = !0, d = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (s !== "" && i.push(s.trim()), s = "", a = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return Os = e, e.default = e, Os;
}
var Ns, Ll;
function So() {
  if (Ll) return Ns;
  Ll = 1;
  let e = gr(), t = hu();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, a = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(a);
    }
  }
  return Ns = r, r.default = r, e.registerRule(r), Ns;
}
var Ps, Ol;
function Ug() {
  if (Ol) return Ps;
  Ol = 1;
  let e = pi(), t = $g(), r = fi(), n = xo(), i = un(), s = So();
  const a = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let o = d.length - 1; o >= 0; o--) {
      let h = d[o], p = h[3] || h[2];
      if (p) return p;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let p, u, m, f = !1, g = !1, x = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            g = !0;
            break;
          } else if (p === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, u = x[m]; u && u[0] === "space"; )
                u = x[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            x.push(o);
        else
          x.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (o = x[x.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let p = 0, u;
      for (let m = h - 1; m >= 0 && (u = o[m], !(u[0] !== "space" && (p += 1, p === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(o) {
      let h = 0, p, u, m;
      for (let [f, g] of o.entries()) {
        if (p = g, u = p[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
          if (!m)
            this.doubleColon(p);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = p;
      }
      return !1;
    }
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let p = o[1].slice(2, -2);
      if (/^\s*$/.test(p))
        h.text = "", h.raws.left = p, h.raws.right = "";
      else {
        let u = p.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = u[2], h.raws.left = u[1], h.raws.right = u[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let p = new e();
      this.init(p, o[0][2]);
      let u = o[o.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, o.pop()), p.source.end = this.getPosition(
        u[3] || u[2] || c(o)
      ), p.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), p.raws.before += o.shift()[1];
      for (p.source.start = this.getPosition(o[0][2]), p.prop = ""; o.length; ) {
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        p.prop += o.shift()[1];
      }
      p.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          p.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), p.raws.between += m[1];
      (p.prop[0] === "_" || p.prop[0] === "*") && (p.raws.before += p.prop[0], p.prop = p.prop.slice(1));
      let f = [], g;
      for (; o.length && (g = o[0][0], !(g !== "space" && g !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, v);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), S = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (S.trim().indexOf("!") === 0 && k !== "space")
              break;
            S = b.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = S, o = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (p.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(p, "value", f.concat(o), h), p.value.includes(":") && !h && this.checkMissedSemicolon(o);
    }
    doubleColon(o) {
      throw this.input.error(
        "Double colon",
        { offset: o[2] },
        { offset: o[2] + o[1].length }
      );
    }
    emptyRule(o) {
      let h = new s();
      this.init(h, o[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(o) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(o[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(o);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(o) {
      if (this.spaces += o[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(o) {
      let h = this.input.fromOffset(o);
      return {
        column: h.col,
        line: h.line,
        offset: o
      };
    }
    init(o, h) {
      this.current.push(o), o.source = {
        input: this.input,
        start: this.getPosition(h)
      }, o.raws.before = this.spaces, this.spaces = "", o.type !== "comment" && (this.semicolon = !1);
    }
    other(o) {
      let h = !1, p = null, u = !1, m = null, f = [], g = o[1].startsWith("--"), x = [], v = o;
      for (; v; ) {
        if (p = v[0], x.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (g && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(x);
            return;
          } else if (p === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (v = x[x.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let o;
      for (; !this.tokenizer.endOfFile(); )
        switch (o = this.tokenizer.nextToken(), o[0]) {
          case "space":
            this.spaces += o[1];
            break;
          case ";":
            this.freeSemicolon(o);
            break;
          case "}":
            this.end(o);
            break;
          case "comment":
            this.comment(o);
            break;
          case "at-word":
            this.atrule(o);
            break;
          case "{":
            this.emptyRule(o);
            break;
          default:
            this.other(o);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(o, h, p, u) {
      let m, f, g = p.length, x = "", v = !0, b, S;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? v = !1 : f === "comment" ? (S = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[S] && !a[b] ? x.slice(-1) === "," ? v = !1 : x += m[1] : v = !1) : x += m[1];
      if (!v) {
        let w = p.reduce((k, C) => k + C[1], "");
        o.raws[h] = { raw: w, value: x };
      }
      o[h] = x;
    }
    rule(o) {
      o.pop();
      let h = new s();
      this.init(h, o[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(o), this.raw(h, "selector", o), this.current = h;
    }
    spacesAndCommentsFromEnd(o) {
      let h, p = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        p = o.pop()[1] + p;
      return p;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, p = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        p += o.shift()[1];
      return p;
    }
    spacesFromEnd(o) {
      let h, p = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        p = o.pop()[1] + p;
      return p;
    }
    stringFrom(o, h) {
      let p = "";
      for (let u = h; u < o.length; u++)
        p += o[u][1];
      return o.splice(h, o.length - h), p;
    }
    unclosedBlock() {
      let o = this.current.source.start;
      throw this.input.error("Unclosed block", o.line, o.column);
    }
    unclosedBracket(o) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: o[2] },
        { offset: o[2] + 1 }
      );
    }
    unexpectedClose(o) {
      throw this.input.error(
        "Unexpected }",
        { offset: o[2] },
        { offset: o[2] + 1 }
      );
    }
    unknownWord(o) {
      throw this.input.error(
        "Unknown word",
        { offset: o[0][2] },
        { offset: o[0][2] + o[0][1].length }
      );
    }
    unnamedAtrule(o, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return Ps = l, Ps;
}
var Ds, Nl;
function Co() {
  if (Nl) return Ds;
  Nl = 1;
  let e = gr(), t = Ug(), r = hi();
  function n(i, s) {
    let a = new r(i, s), c = new t(a);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return Ds = n, n.default = n, e.registerParse(n), Ds;
}
var zs, Pl;
function fu() {
  if (Pl) return zs;
  Pl = 1;
  let { isClean: e, my: t } = vo(), r = uu(), n = ui(), i = gr(), s = ko(), a = du(), c = wo(), l = Co(), d = un();
  const o = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, h = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, p = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let w = !1, k = o[S.type];
    return S.type === "decl" ? w = S.prop.toLowerCase() : S.type === "atrule" && (w = S.name.toLowerCase()), w && S.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : S.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(S) {
    let w;
    return S.type === "document" ? w = ["Document", u, "DocumentExit"] : S.type === "root" ? w = ["Root", u, "RootExit"] : w = f(S), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((w) => x(w)), S;
  }
  let v = {};
  class b {
    constructor(w, k, C) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof b || k instanceof c)
        L = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let D = l;
        C.syntax && (D = C.syntax.parse), C.parser && (D = C.parser), D.parse && (D = D.parse);
        try {
          L = D(k, C);
        } catch (I) {
          this.processed = !0, this.error = I;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(w, L, C), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((D) => typeof D == "object" && D.prepare ? { ...D, ...D.prepare(this.result) } : D);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, k) {
      let C = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = C.postcssPlugin, w.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = C.postcssPlugin, D = C.postcssVersion, I = this.result.processor.version, J = D.split("."), H = I.split(".");
          (J[0] !== H[0] || parseInt(J[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + I + ", but " + L + " uses " + D + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, C, L) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let C in k) {
            if (!h[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[C])
              if (typeof k[C] == "object")
                for (let L in k[C])
                  L === "*" ? w(k, C, k[C][L]) : w(
                    k,
                    C + "-" + L.toLowerCase(),
                    k[C][L]
                  );
              else typeof k[C] == "function" && w(k, C, k[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], C = this.runOnRoot(k);
        if (m(C))
          try {
            await C;
          } catch (L) {
            throw this.handleError(L);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [g(w)];
          for (; k.length > 0; ) {
            let C = this.visitTick(k);
            if (m(C))
              try {
                await C;
              } catch (L) {
                let D = k[k.length - 1].node;
                throw this.handleError(L, D);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let L = w.nodes.map(
                  (D) => C(D, this.helpers)
                );
                await Promise.all(L);
              } else
                await C(w, this.helpers);
            } catch (L) {
              throw this.handleError(L);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let k = this.result.root.nodes.map(
              (C) => w.Once(C, this.helpers)
            );
            return m(k[0]) ? Promise.all(k) : k;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (k) {
        throw this.handleError(k);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, k = n;
      w.syntax && (k = w.syntax.stringify), w.stringifier && (k = w.stringifier), k.stringify && (k = k.stringify);
      let L = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let k = this.runOnRoot(w);
        if (m(k))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let k of w.nodes)
              this.visitSync(this.listeners.OnceExit, k);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, k) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [C, L] of w) {
        this.result.lastPlugin = C;
        let D;
        try {
          D = L(k, this.helpers);
        } catch (I) {
          throw this.handleError(I, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(D))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: C, visitors: L } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [I, J] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = I;
        try {
          return J(C.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, C);
        }
      }
      if (k.iterator !== 0) {
        let I = k.iterator, J;
        for (; J = C.nodes[C.indexes[I]]; )
          if (C.indexes[I] += 1, !J[e]) {
            J[e] = !0, w.push(g(J));
            return;
          }
        k.iterator = 0, delete C.indexes[I];
      }
      let D = k.events;
      for (; k.eventIndex < D.length; ) {
        let I = D[k.eventIndex];
        if (k.eventIndex += 1, I === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[I]) {
          k.visitors = this.listeners[I];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let k = f(w);
      for (let C of k)
        if (C === u)
          w.nodes && w.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[C];
          if (L && this.visitSync(L, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return b.registerPostcss = (S) => {
    v = S;
  }, zs = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), zs;
}
var Fs, Dl;
function Bg() {
  if (Dl) return Fs;
  Dl = 1;
  let e = uu(), t = ui(), r = du(), n = Co();
  const i = wo();
  class s {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let p = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return p.root;
        }
      });
      let u = new e(h, o, this._opts, l);
      if (u.isMap()) {
        let [m, f] = u.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        u.clearAnnotation(), this.result.css = u.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(c) {
      return this.async().catch(c);
    }
    finally(c) {
      return this.async().then(c, c);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(c, l) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(c, l);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let c, l = n;
      try {
        c = l(this._css, this._opts);
      } catch (d) {
        this.error = d;
      }
      if (this.error)
        throw this.error;
      return this._root = c, c;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Fs = s, s.default = s, Fs;
}
var $s, zl;
function qg() {
  if (zl) return $s;
  zl = 1;
  let e = Bg(), t = fu(), r = ko(), n = un();
  class i {
    constructor(a = []) {
      this.version = "8.4.38", this.plugins = this.normalize(a);
    }
    normalize(a) {
      let c = [];
      for (let l of a)
        if (l.postcss === !0 ? l = l() : l.postcss && (l = l.postcss), typeof l == "object" && Array.isArray(l.plugins))
          c = c.concat(l.plugins);
        else if (typeof l == "object" && l.postcssPlugin)
          c.push(l);
        else if (typeof l == "function")
          c.push(l);
        else if (typeof l == "object" && (l.parse || l.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(l + " is not a PostCSS plugin");
      return c;
    }
    process(a, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, a, c) : new t(this, a, c);
    }
    use(a) {
      return this.plugins = this.plugins.concat(this.normalize([a])), this;
    }
  }
  return $s = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), $s;
}
var Us, Fl;
function Wg() {
  if (Fl) return Us;
  Fl = 1;
  let e = pi(), t = cu(), r = fi(), n = xo(), i = hi(), s = un(), a = So();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((p) => c(p));
    let { inputs: o, ...h } = l;
    if (o) {
      d = [];
      for (let p of o) {
        let u = { ...p, __proto__: i.prototype };
        u.map && (u.map = {
          ...u.map,
          __proto__: t.prototype
        }), d.push(u);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((p) => c(p, d))), h.source) {
      let { inputId: p, ...u } = h.source;
      h.source = u, p != null && (h.source.input = d[p]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new a(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return Us = c, c.default = c, Us;
}
var Bs, $l;
function Hg() {
  if ($l) return Bs;
  $l = 1;
  let e = bo(), t = pi(), r = fu(), n = gr(), i = qg(), s = ui(), a = Wg(), c = ko(), l = pu(), d = fi(), o = xo(), h = wo(), p = hi(), u = Co(), m = hu(), f = So(), g = un(), x = di();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(S, w) {
    let k = !1;
    function C(...D) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let I = w(...D);
      return I.postcssPlugin = S, I.postcssVersion = new i().version, I;
    }
    let L;
    return Object.defineProperty(C, "postcss", {
      get() {
        return L || (L = C()), L;
      }
    }), C.process = function(D, I, J) {
      return v([C(J)]).process(D, I);
    }, C;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new g(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = g, v.Node = x, r.registerPostcss(v), Bs = v, v.default = v, Bs;
}
var jg = Hg();
const Pe = /* @__PURE__ */ Og(jg);
Pe.stringify;
Pe.fromJSON;
Pe.plugin;
Pe.parse;
Pe.list;
Pe.document;
Pe.comment;
Pe.atRule;
Pe.rule;
Pe.decl;
Pe.root;
Pe.CssSyntaxError;
Pe.Declaration;
Pe.Container;
Pe.Processor;
Pe.Document;
Pe.Comment;
Pe.Warning;
Pe.AtRule;
Pe.Result;
Pe.Input;
Pe.Rule;
Pe.Root;
Pe.Node;
class Eo {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    ft(this, "parentElement", null), ft(this, "parentNode", null), ft(this, "ownerDocument"), ft(this, "firstChild", null), ft(this, "lastChild", null), ft(this, "previousSibling", null), ft(this, "nextSibling", null), ft(this, "ELEMENT_NODE", 1), ft(this, "TEXT_NODE", 3), ft(this, "nodeType"), ft(this, "nodeName"), ft(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Eo) {
      if (t.ownerDocument !== this.ownerDocument) return !1;
      if (t === this) return !0;
    } else return !1;
    for (; t.parentNode; ) {
      if (t.parentNode === this) return !0;
      t = t.parentNode;
    }
    return !1;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(t, r) {
    throw new Error(
      "RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  toString() {
    return "RRNode";
  }
}
const Ul = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, Bl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, On = {}, mu = {}, Vg = () => !!globalThis.Zone;
function Mo(e) {
  if (On[e])
    return On[e];
  const t = globalThis[e], r = t.prototype, n = e in Ul ? Ul[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in Bl ? Bl[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Vg())
    return On[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), mu[e] = () => c.remove()) : c.remove(), On[e] = d;
  } catch {
    return r;
  }
}
const qs = {};
function qt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (qs[i])
    return qs[i].call(
      t
    );
  const s = Mo(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (qs[i] = a, a.call(t)) : t[r];
}
const Ws = {};
function gu(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Ws[n])
    return Ws[n].bind(
      t
    );
  const s = Mo(e)[r];
  return typeof s != "function" ? t[r] : (Ws[n] = s, s.bind(t));
}
function Yg(e) {
  return qt("Node", e, "ownerDocument");
}
function Gg(e) {
  return qt("Node", e, "childNodes");
}
function Xg(e) {
  return qt("Node", e, "parentNode");
}
function Kg(e) {
  return qt("Node", e, "parentElement");
}
function Jg(e) {
  return qt("Node", e, "textContent");
}
function Zg(e, t) {
  return gu("Node", e, "contains")(t);
}
function Qg(e) {
  return gu("Node", e, "getRootNode")();
}
function ey(e) {
  return !e || !("host" in e) ? null : qt("ShadowRoot", e, "host");
}
function ty(e) {
  return e.styleSheets;
}
function ry(e) {
  return !e || !("shadowRoot" in e) ? null : qt("Element", e, "shadowRoot");
}
function ny(e, t) {
  return qt("Element", e, "querySelector")(t);
}
function iy(e, t) {
  return qt("Element", e, "querySelectorAll")(t);
}
function yu() {
  return [
    Mo("MutationObserver").constructor,
    mu.MutationObserver ?? (() => {
    })
  ];
}
let on = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (on = () => (/* @__PURE__ */ new Date()).getTime());
function yr(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const n = e[t], i = r(n);
    return typeof i == "function" && (i.prototype = i.prototype || {}, Object.defineProperties(i, {
      __rrweb_original__: {
        enumerable: !1,
        value: n
      }
    })), e[t] = i, () => {
      e[t] = n;
    };
  } catch {
    return () => {
    };
  }
}
const pe = {
  ownerDocument: Yg,
  childNodes: Gg,
  parentNode: Xg,
  parentElement: Kg,
  textContent: Jg,
  contains: Zg,
  getRootNode: Qg,
  host: ey,
  styleSheets: ty,
  shadowRoot: ry,
  querySelector: ny,
  querySelectorAll: iy,
  nowTimestamp: on,
  mutationObserverCtor: yu,
  patch: yr
};
function st(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const Rr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let ql = {
  map: {},
  getId() {
    return console.error(Rr), -1;
  },
  getNode() {
    return console.error(Rr), null;
  },
  removeNodeFromMap() {
    console.error(Rr);
  },
  has() {
    return console.error(Rr), !1;
  },
  reset() {
    console.error(Rr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (ql = new Proxy(ql, {
  get(e, t, r) {
    return t === "map" && console.error(Rr), Reflect.get(e, t, r);
  }
}));
function an(e, t, r = {}) {
  let n = null, i = 0;
  return function(...s) {
    const a = Date.now();
    !i && r.leading === !1 && (i = a);
    const c = t - (a - i), l = this;
    c <= 0 || c > t ? (n && (clearTimeout(n), n = null), i = a, e.apply(l, s)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(l, s);
    }, c));
  };
}
function mi(e, t, r, n, i = window) {
  const s = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(a) {
        setTimeout(() => {
          r.set.call(this, a);
        }, 0), s && s.set && s.set.call(this, a);
      }
    }
  ), () => mi(e, t, s || {}, !0);
}
function bu(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = pe.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = pe.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function vu() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function ku() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function wu(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : pe.parentElement(e) : null;
}
function ot(e, t, r, n) {
  if (!e)
    return !1;
  const i = wu(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Xn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function sy(e, t) {
  return t.getId(e) !== -1;
}
function Hs(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === sn;
}
function xu(e, t) {
  if (Zr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = pe.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? xu(n, t) : !0;
}
function Js(e) {
  return !!e.changedTouches;
}
function oy(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Su(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Cu(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Zs(e) {
  return e ? e instanceof Eo && "shadowRoot" in e ? !!e.shadowRoot : !!pe.shadowRoot(e) : !1;
}
class ay {
  constructor() {
    W(this, "id", 1), W(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), W(this, "idStyleMap", /* @__PURE__ */ new Map());
  }
  getId(t) {
    return this.styleIDMap.get(t) ?? -1;
  }
  has(t) {
    return this.styleIDMap.has(t);
  }
  /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */
  add(t, r) {
    if (this.has(t)) return this.getId(t);
    let n;
    return r === void 0 ? n = this.id++ : n = r, this.styleIDMap.set(t, n), this.idStyleMap.set(n, t), n;
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
function Eu(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = pe.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && pe.host(pe.getRootNode(e)) && (r = pe.host(pe.getRootNode(e))), r;
}
function ly(e) {
  let t = e, r;
  for (; r = Eu(t); )
    t = r;
  return t;
}
function cy(e) {
  const t = pe.ownerDocument(e);
  if (!t) return !1;
  const r = ly(e);
  return pe.contains(t, r);
}
function Mu(e) {
  const t = pe.ownerDocument(e);
  return t ? pe.contains(t, e) || cy(e) : !1;
}
var we = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(we || {}), ge = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(ge || {}), ut = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(ut || {}), Ut = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(Ut || {}), Ur = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Ur || {}), Tr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Tr || {}), Ru = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Ru || {});
function Wl(e) {
  return "__ln" in e;
}
class uy {
  constructor() {
    W(this, "length", 0), W(this, "head", null), W(this, "tail", null);
  }
  get(t) {
    if (t >= this.length)
      throw new Error("Position outside of list range");
    let r = this.head;
    for (let n = 0; n < t; n++)
      r = (r == null ? void 0 : r.next) || null;
    return r;
  }
  addNode(t) {
    const r = {
      value: t,
      previous: null,
      next: null
    };
    if (t.__ln = r, t.previousSibling && Wl(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Wl(t.nextSibling) && t.nextSibling.__ln.previous) {
      const n = t.nextSibling.__ln.previous;
      r.previous = n, r.next = t.nextSibling.__ln, t.nextSibling.__ln.previous = r, n && (n.next = r);
    } else
      this.head && (this.head.previous = r), r.next = this.head, this.head = r;
    r.next === null && (this.tail = r), this.length++;
  }
  removeNode(t) {
    const r = t.__ln;
    this.head && (r.previous ? (r.previous.next = r.next, r.next ? r.next.previous = r.previous : this.tail = r.previous) : (this.head = r.next, this.head ? this.head.previous = null : this.tail = null), t.__ln && delete t.__ln, this.length--);
  }
}
const Hl = (e, t) => `${e}@${t}`;
class dy {
  constructor() {
    W(this, "frozen", !1), W(this, "locked", !1), W(this, "texts", []), W(this, "attributes", []), W(this, "attributeMap", /* @__PURE__ */ new WeakMap()), W(this, "removes", []), W(this, "mapRemoves", []), W(this, "movedMap", {}), W(this, "addedSet", /* @__PURE__ */ new Set()), W(this, "movedSet", /* @__PURE__ */ new Set()), W(this, "droppedSet", /* @__PURE__ */ new Set()), W(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), W(this, "mutationCb"), W(this, "blockClass"), W(this, "blockSelector"), W(this, "maskTextClass"), W(this, "maskTextSelector"), W(this, "inlineStylesheet"), W(this, "maskInputOptions"), W(this, "maskTextFn"), W(this, "maskInputFn"), W(this, "keepIframeSrcFn"), W(this, "recordCanvas"), W(this, "inlineImages"), W(this, "slimDOMOptions"), W(this, "dataURLOptions"), W(this, "doc"), W(this, "mirror"), W(this, "iframeManager"), W(this, "stylesheetManager"), W(this, "shadowDomManager"), W(this, "canvasManager"), W(this, "processedNodeManager"), W(this, "unattachedDoc"), W(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), W(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new uy(), i = (l) => {
        let d = l, o = sn;
        for (; o === sn; )
          d = d && d.nextSibling, o = d && this.mirror.getId(d);
        return o;
      }, s = (l) => {
        const d = pe.parentNode(l);
        if (!d || !Mu(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (o = !0);
        }
        const h = Zr(d) ? this.mirror.getId(Eu(l)) : this.mirror.getId(d), p = i(l);
        if (h === -1 || p === -1)
          return n.addNode(l);
        const u = _r(l, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: !0,
          newlyAddedElement: !0,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (m) => {
            Su(m, this.mirror) && this.iframeManager.addIframe(m), Cu(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Zs(l) && this.shadowDomManager.addShadowRoot(pe.shadowRoot(l), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: o
        });
        u && (t.push({
          parentId: h,
          nextId: p,
          node: u
        }), r.add(u.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        jl(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(pe.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Vl(this.droppedSet, l) && !jl(this.removesSubTreeCache, l, this.mirror) || Vl(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const d = this.mirror.getId(pe.parentNode(a.value)), o = i(a.value);
          d !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let d = n.tail;
          for (; d; ) {
            const o = d;
            if (d = d.previous, o) {
              const h = this.mirror.getId(pe.parentNode(o.value));
              if (i(o.value) === -1) continue;
              if (h !== -1) {
                l = o;
                break;
              } else {
                const u = o.value, m = pe.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = pe.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    l = o;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!l) {
          for (; n.head; )
            n.removeNode(n.head.value);
          break;
        }
        a = l.previous, n.removeNode(l.value), s(l.value);
      }
      const c = {
        texts: this.texts.map((l) => {
          const d = l.node, o = pe.parentNode(d);
          return o && o.tagName === "TEXTAREA" && this.genTextAreaValueMutation(o), {
            id: this.mirror.getId(d),
            value: l.value
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => {
          const { attributes: d } = l;
          if (typeof d.style == "string") {
            const o = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
            o.length < d.style.length && (o + h).split("var(").length === d.style.split("var(").length && (d.style = l.styleDiff);
          }
          return {
            id: this.mirror.getId(l.node),
            attributes: d
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        removes: this.removes,
        adds: t
      };
      !c.texts.length && !c.attributes.length && !c.removes.length && !c.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(c));
    }), W(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        pe.childNodes(t),
        (i) => pe.textContent(i) || ""
      ).join("");
      r.attributes.value = Vn({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Yn(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), W(this, "processMutation", (t) => {
      if (!Hs(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = pe.textContent(t.target);
            !ot(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Qc(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, wu(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Yn(r);
              i = Vn({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (ot(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
              return;
            let s = this.attributeMap.get(t.target);
            if (r.tagName === "IFRAME" && n === "src" && !this.keepIframeSrcFn(i))
              if (!r.contentDocument)
                n = "rr_src";
              else
                return;
            if (s || (s = {
              node: t.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Zc(r.tagName, n))
              if (s.attributes[n] = Jc(
                this.doc,
                fr(r.tagName),
                fr(n),
                i
              ), n === "style") {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc = document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const a = this.unattachedDoc.createElement("span");
                t.oldValue && a.setAttribute("style", t.oldValue);
                for (const c of Array.from(r.style)) {
                  const l = r.style.getPropertyValue(c), d = r.style.getPropertyPriority(c);
                  l !== a.style.getPropertyValue(c) || d !== a.style.getPropertyPriority(c) ? d === "" ? s.styleDiff[c] = l : s.styleDiff[c] = [l, d] : s._unchangedStyles[c] = [l, d];
                }
                for (const c of Array.from(a.style))
                  r.style.getPropertyValue(c) === "" && (s.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (ot(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Zr(t.target) ? this.mirror.getId(pe.host(t.target)) : this.mirror.getId(t.target);
              ot(t.target, this.blockClass, this.blockSelector, !1) || Hs(r, this.mirror, this.slimDOMOptions) || !sy(r, this.mirror) || (this.addedSet.has(r) ? (Qs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || xu(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Hl(n, i)] ? Qs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Zr(t.target) && Qr(t.target) ? !0 : void 0
              }), py(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), W(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Hs(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Hl(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        ot(t, this.blockClass, this.blockSelector, !1) || (pe.childNodes(t).forEach((n) => this.genAdds(n)), Zs(t) && pe.childNodes(pe.shadowRoot(t)).forEach((n) => {
          this.processedNodeManager.add(n, this), this.genAdds(n, t);
        }));
      }
    });
  }
  init(t) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager",
      "processedNodeManager"
    ].forEach((r) => {
      this[r] = t[r];
    });
  }
  freeze() {
    this.frozen = !0, this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = !0, this.canvasManager.lock();
  }
  unlock() {
    this.locked = !1, this.canvasManager.unlock(), this.emit();
  }
  reset() {
    this.shadowDomManager.reset(), this.canvasManager.reset();
  }
}
function Qs(e, t) {
  e.delete(t), pe.childNodes(t).forEach((r) => Qs(e, r));
}
function py(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), pe.childNodes(n).forEach((i) => r.push(i)));
  }
}
function jl(e, t, r) {
  return e.size === 0 ? !1 : hy(e, t);
}
function hy(e, t, r) {
  const n = pe.parentNode(t);
  return n ? e.has(n) : !1;
}
function Vl(e, t) {
  return e.size === 0 ? !1 : Tu(e, t);
}
function Tu(e, t) {
  const r = pe.parentNode(t);
  return r ? e.has(r) ? !0 : Tu(e, r) : !1;
}
let en;
function fy(e) {
  en = e;
}
function my() {
  en = void 0;
}
const ve = (e) => en ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (en && en(n) === !0)
      return;
    throw n;
  }
} : e, dr = [];
function dn(e) {
  try {
    if ("composedPath" in e) {
      const t = e.composedPath();
      if (t.length)
        return t[0];
    } else if ("path" in e && e.path.length)
      return e.path[0];
  } catch {
  }
  return e && e.target;
}
function Au(e, t) {
  const r = new dy();
  dr.push(r), r.init(e);
  const [n, i] = yu(), s = new n(
    ve(r.processMutations.bind(r))
  );
  return s.observe(t, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), [s, i];
}
function gy({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let a = [], c;
  const l = an(
    ve(
      (h) => {
        const p = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= p, u)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), d = ve(
    an(
      ve((h) => {
        const p = dn(h), { clientX: u, clientY: m } = Js(h) ? h.changedTouches[0] : h;
        c || (c = on()), a.push({
          x: u,
          y: m,
          id: n.getId(p),
          timeOffset: on() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? ge.Drag : h instanceof MouseEvent ? ge.MouseMove : ge.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    st("mousemove", d, r),
    st("touchmove", d, r),
    st("drag", d, r)
  ];
  return ve(() => {
    o.forEach((h) => h());
  });
}
function yy({
  mouseInteractionCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  if (s.mouseInteraction === !1)
    return () => {
    };
  const a = s.mouseInteraction === !0 || s.mouseInteraction === void 0 ? {} : s.mouseInteraction, c = [];
  let l = null;
  const d = (o) => (h) => {
    const p = dn(h);
    if (ot(p, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = Ut.Mouse;
          break;
        case "touch":
          u = Ut.Touch;
          break;
        case "pen":
          u = Ut.Pen;
          break;
      }
      u === Ut.Touch ? ut[o] === ut.MouseDown ? m = "TouchStart" : ut[o] === ut.MouseUp && (m = "TouchEnd") : Ut.Pen;
    } else Js(h) && (u = Ut.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === Ut.Touch || m.startsWith("Mouse") && u === Ut.Mouse) && (u = null)) : ut[o] === ut.Click && (u = l, l = null);
    const f = Js(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(p), { clientX: x, clientY: v } = f;
    ve(e)({
      type: ut[m],
      id: g,
      x,
      y: v,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(ut).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = fr(o);
    const p = d(o);
    if (window.PointerEvent)
      switch (ut[o]) {
        case ut.MouseDown:
        case ut.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case ut.TouchStart:
        case ut.TouchEnd:
          return;
      }
    c.push(st(h, p, t));
  }), ve(() => {
    c.forEach((o) => o());
  });
}
function _u({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = ve(
    an(
      ve((c) => {
        const l = dn(c);
        if (!l || ot(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const o = bu(t.defaultView);
          e({
            id: d,
            x: o.left,
            y: o.top
          });
        } else
          e({
            id: d,
            x: l.scrollLeft,
            y: l.scrollTop
          });
      }),
      s.scroll || 100
    )
  );
  return st("scroll", a, t);
}
function by({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = ve(
    an(
      ve(() => {
        const s = vu(), a = ku();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return st("resize", i, t);
}
const vy = ["INPUT", "TEXTAREA", "SELECT"], Yl = /* @__PURE__ */ new WeakMap();
function ky({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: s,
  ignoreSelector: a,
  maskInputOptions: c,
  maskInputFn: l,
  sampling: d,
  userTriggeredOnInput: o
}) {
  function h(v) {
    let b = dn(v);
    const S = v.isTrusted, w = b && b.tagName;
    if (b && w === "OPTION" && (b = pe.parentElement(b)), !b || !w || vy.indexOf(w) < 0 || ot(b, n, i, !0) || b.classList.contains(s) || a && b.matches(a))
      return;
    let k = b.value, C = !1;
    const L = Yn(b) || "";
    L === "radio" || L === "checkbox" ? C = b.checked : (c[w.toLowerCase()] || c[L]) && (k = Vn({
      element: b,
      maskInputOptions: c,
      tagName: w,
      type: L,
      value: k,
      maskInputFn: l
    })), p(
      b,
      o ? { text: k, isChecked: C, userTriggered: S } : { text: k, isChecked: C }
    );
    const D = b.name;
    L === "radio" && D && C && t.querySelectorAll(`input[type="radio"][name="${D}"]`).forEach((I) => {
      if (I !== b) {
        const J = I.value;
        p(
          I,
          o ? { text: J, isChecked: !C, userTriggered: !1 } : { text: J, isChecked: !C }
        );
      }
    });
  }
  function p(v, b) {
    const S = Yl.get(v);
    if (!S || S.text !== b.text || S.isChecked !== b.isChecked) {
      Yl.set(v, b);
      const w = r.getId(v);
      ve(e)({
        ...b,
        id: w
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => st(v, ve(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((v) => v());
    };
  const g = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), x = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return g && g.set && m.push(
    ...x.map(
      (v) => mi(
        v[0],
        v[1],
        {
          set() {
            ve(h)({
              target: this,
              isTrusted: !1
              // userTriggered to false as this could well be programmatic
            });
          }
        },
        !1,
        f
      )
    )
  ), ve(() => {
    m.forEach((v) => v());
  });
}
function Kn(e) {
  const t = [];
  function r(n, i) {
    if (Nn("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Nn("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Nn("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Nn("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
      const a = Array.from(
        n.parentRule.cssRules
      ).indexOf(n);
      return i.unshift(a), r(n.parentRule, i);
    } else if (n.parentStyleSheet) {
      const a = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
      i.unshift(a);
    }
    return i;
  }
  return r(e, t);
}
function Xt(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function wy({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: ve(
      (o, h, p) => {
        const [u, m] = p, { id: f, styleId: g } = Xt(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: u, index: m }]
        }), o.apply(h, p);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(o, h, p = this.cssRules.length) {
    const u = `${o} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [u, p]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: ve(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Xt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: u }]
        }), o.apply(h, p);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(o) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [o]);
  };
  let a;
  n.CSSStyleSheet.prototype.replace && (a = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(a, {
    apply: ve(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Xt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: u
        }), o.apply(h, p);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: ve(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Xt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: u
        }), o.apply(h, p);
      }
    )
  }));
  const l = {};
  Pn("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Pn("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Pn("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Pn("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
  const d = {};
  return Object.entries(l).forEach(([o, h]) => {
    d[o] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      d[o].insertRule,
      {
        apply: ve(
          (p, u, m) => {
            const [f, g] = m, { id: x, styleId: v } = Xt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (x && x !== -1 || v && v !== -1) && e({
              id: x,
              styleId: v,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Kn(u),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), p.apply(u, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      d[o].deleteRule,
      {
        apply: ve(
          (p, u, m) => {
            const [f] = m, { id: g, styleId: x } = Xt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...Kn(u), f] }
              ]
            }), p.apply(u, m);
          }
        )
      }
    );
  }), ve(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = d[o].insertRule, h.prototype.deleteRule = d[o].deleteRule;
    });
  });
}
function Iu({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(pe.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (s = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : s.ShadowRoot, l = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
    c == null ? void 0 : c.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return a === null || a === -1 || !c || !l ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: l.configurable,
    enumerable: l.enumerable,
    get() {
      var d;
      return (d = l.get) == null ? void 0 : d.call(this);
    },
    set(d) {
      var o;
      const h = (o = l.set) == null ? void 0 : o.call(this, d);
      if (a !== null && a !== -1)
        try {
          t.adoptStyleSheets(d, a);
        } catch {
        }
      return h;
    }
  }), ve(() => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: l.configurable,
      enumerable: l.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: l.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: l.set
    });
  }));
}
function xy({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: ve(
      (c, l, d) => {
        var o;
        const [h, p, u] = d;
        if (r.has(h))
          return s.apply(l, [h, p, u]);
        const { id: m, styleId: f } = Xt(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: h,
            value: p,
            priority: u
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Kn(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: ve(
      (c, l, d) => {
        var o;
        const [h] = d;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: p, styleId: u } = Xt(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (p && p !== -1 || u && u !== -1) && e({
          id: p,
          styleId: u,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Kn(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), ve(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Sy({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = ve(
    (l) => an(
      ve((d) => {
        const o = dn(d);
        if (!o || ot(o, t, r, !0))
          return;
        const { currentTime: h, volume: p, muted: u, playbackRate: m, loop: f } = o;
        e({
          type: l,
          id: n.getId(o),
          currentTime: h,
          volume: p,
          muted: u,
          playbackRate: m,
          loop: f
        });
      }),
      i.media || 500
    )
  ), c = [
    st("play", a(Tr.Play), s),
    st("pause", a(Tr.Pause), s),
    st("seeked", a(Tr.Seeked), s),
    st("volumechange", a(Tr.VolumeChange), s),
    st("ratechange", a(Tr.RateChange), s)
  ];
  return ve(() => {
    c.forEach((l) => l());
  });
}
function Cy({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(l, d, o) {
    const h = new s(l, d, o);
    return i.set(h, {
      family: l,
      buffer: typeof d != "string",
      descriptors: o,
      fontSource: typeof d == "string" ? d : JSON.stringify(Array.from(new Uint8Array(d)))
    }), h;
  };
  const a = yr(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          ve(() => {
            const d = i.get(l);
            d && (e(d), i.delete(l));
          }),
          0
        ), c.apply(this, [l]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = s;
  }), n.push(a), ve(() => {
    n.forEach((c) => c());
  });
}
function Ey(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = ve(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const d = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const p = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = p;
      ot(u, n, i, !0) || ot(f, n, i, !0) || d.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: d });
  });
  return c(), st("selectionchange", c);
}
function My({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : yr(
    r.customElements,
    "define",
    function(i) {
      return function(s, a, c) {
        try {
          t({
            define: {
              name: s
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${s}`);
        }
        return i.apply(this, [s, a, c]);
      };
    }
  );
}
function Ry(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: s,
    viewportResizeCb: a,
    inputCb: c,
    mediaInteractionCb: l,
    styleSheetRuleCb: d,
    styleDeclarationCb: o,
    canvasMutationCb: h,
    fontCb: p,
    selectionCb: u,
    customElementCb: m
  } = e;
  e.mutationCb = (...f) => {
    t.mutation && t.mutation(...f), r(...f);
  }, e.mousemoveCb = (...f) => {
    t.mousemove && t.mousemove(...f), n(...f);
  }, e.mouseInteractionCb = (...f) => {
    t.mouseInteraction && t.mouseInteraction(...f), i(...f);
  }, e.scrollCb = (...f) => {
    t.scroll && t.scroll(...f), s(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), a(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), l(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), d(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), o(...f);
  }, e.canvasMutationCb = (...f) => {
    t.canvasMutation && t.canvasMutation(...f), h(...f);
  }, e.fontCb = (...f) => {
    t.font && t.font(...f), p(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), u(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function Ty(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Ry(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Au(e, e.doc));
  const s = gy(e), a = yy(e), c = _u(e), l = by(e, {
    win: r
  }), d = ky(e), o = Sy(e);
  let h = () => {
  }, p = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = wy(e, { win: r }), p = Iu(e, e.doc), u = xy(e, {
    win: r
  }), e.collectFonts && (m = Cy(e)));
  const f = Ey(e), g = My(e), x = [];
  for (const v of e.plugins)
    x.push(
      v.observer(v.callback, r, v.options)
    );
  return ve(() => {
    dr.forEach((v) => v.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), d(), o(), h(), p(), u(), m(), f(), g(), x.forEach((v) => v());
  });
}
function Nn(e) {
  return typeof window[e] < "u";
}
function Pn(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Gl {
  constructor(t) {
    W(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), W(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const s = n || this.getIdToRemoteIdMap(t), a = i || this.getRemoteIdToIdMap(t);
    let c = s.get(r);
    return c || (c = this.generateIdFn(), s.set(r, c), a.set(c, r)), c;
  }
  getIds(t, r) {
    const n = this.getIdToRemoteIdMap(t), i = this.getRemoteIdToIdMap(t);
    return r.map(
      (s) => this.getId(t, s, n, i)
    );
  }
  getRemoteId(t, r, n) {
    const i = n || this.getRemoteIdToIdMap(t);
    if (typeof r != "number") return r;
    const s = i.get(r);
    return s || -1;
  }
  getRemoteIds(t, r) {
    const n = this.getRemoteIdToIdMap(t);
    return r.map((i) => this.getRemoteId(t, i, n));
  }
  reset(t) {
    if (!t) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(t), this.iframeRemoteIdToIdMap.delete(t);
  }
  getIdToRemoteIdMap(t) {
    let r = this.iframeIdToRemoteIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(t, r)), r;
  }
  getRemoteIdToIdMap(t) {
    let r = this.iframeRemoteIdToIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(t, r)), r;
  }
}
class Ay {
  constructor(t) {
    W(this, "iframes", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMirror", new Gl(Kc)), W(this, "crossOriginIframeStyleMirror"), W(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), W(this, "mirror"), W(this, "mutationCb"), W(this, "wrappedEmit"), W(this, "loadListener"), W(this, "stylesheetManager"), W(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Gl(
      this.stylesheetManager.styleMirror.generateId.bind(
        this.stylesheetManager.styleMirror
      )
    ), this.mirror = t.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
  }
  addIframe(t) {
    this.iframes.set(t, !0), t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t);
  }
  addLoadListener(t) {
    this.loadListener = t;
  }
  attachIframe(t, r) {
    var n, i;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(t),
          nextId: null,
          node: r
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0
    }), this.recordCrossOriginIframes && ((n = t.contentWindow) == null || n.addEventListener(
      "message",
      this.handleMessage.bind(this)
    )), (i = this.loadListener) == null || i.call(this, t), t.contentDocument && t.contentDocument.adoptedStyleSheets && t.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(
      t.contentDocument.adoptedStyleSheets,
      this.mirror.getId(t.contentDocument)
    );
  }
  handleMessage(t) {
    const r = t;
    if (r.data.type !== "rrweb" || // To filter out the rrweb messages which are forwarded by some sites.
    r.origin !== r.data.origin || !t.source) return;
    const i = this.crossOriginIframeMap.get(t.source);
    if (!i) return;
    const s = this.transformCrossOriginEvent(
      i,
      r.data.event
    );
    s && this.wrappedEmit(
      s,
      r.data.isCheckout
    );
  }
  transformCrossOriginEvent(t, r) {
    var n;
    switch (r.type) {
      case we.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: we.IncrementalSnapshot,
          data: {
            source: ge.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(t),
                nextId: null,
                node: r.data.node
              }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: !0
          }
        };
      }
      case we.Meta:
      case we.Load:
      case we.DomContentLoaded:
        return !1;
      case we.Plugin:
        return r;
      case we.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case we.IncrementalSnapshot:
        switch (r.data.source) {
          case ge.Mutation:
            return r.data.adds.forEach((i) => {
              this.replaceIds(i, t, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(i.node, t);
              const s = this.crossOriginIframeRootIdMap.get(t);
              s && this.patchRootIdOnNode(i.node, s);
            }), r.data.removes.forEach((i) => {
              this.replaceIds(i, t, ["parentId", "id"]);
            }), r.data.attributes.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r.data.texts.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case ge.Drag:
          case ge.TouchMove:
          case ge.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case ge.ViewportResize:
            return !1;
          case ge.MediaInteraction:
          case ge.MouseInteraction:
          case ge.Scroll:
          case ge.CanvasMutation:
          case ge.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case ge.StyleSheetRule:
          case ge.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case ge.Font:
            return r;
          case ge.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case ge.AdoptedStyleSheet:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleIds"]), (n = r.data.styles) == null || n.forEach((i) => {
              this.replaceStyleIds(i, t, ["styleId"]);
            }), r;
        }
    }
    return !1;
  }
  replace(t, r, n, i) {
    for (const s of i)
      !Array.isArray(r[s]) && typeof r[s] != "number" || (Array.isArray(r[s]) ? r[s] = t.getIds(
        n,
        r[s]
      ) : r[s] = t.getId(n, r[s]));
    return r;
  }
  replaceIds(t, r, n) {
    return this.replace(this.crossOriginIframeMirror, t, r, n);
  }
  replaceStyleIds(t, r, n) {
    return this.replace(this.crossOriginIframeStyleMirror, t, r, n);
  }
  replaceIdOnNode(t, r) {
    this.replaceIds(t, r, ["id", "rootId"]), "childNodes" in t && t.childNodes.forEach((n) => {
      this.replaceIdOnNode(n, r);
    });
  }
  patchRootIdOnNode(t, r) {
    t.type !== Ru.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class _y {
  constructor(t) {
    W(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "scrollCb"), W(this, "bypassOptions"), W(this, "mirror"), W(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Qr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Au(
      {
        ...this.bypassOptions,
        doc: r,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this
      },
      t
    );
    this.restoreHandlers.push(() => n.disconnect()), this.restoreHandlers.push(
      _u({
        ...this.bypassOptions,
        scrollCb: this.scrollCb,
        // https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
        // scroll is not allowed to pass the boundary, so we need to listen the shadow document
        doc: t,
        mirror: this.mirror
      })
    ), setTimeout(() => {
      t.adoptedStyleSheets && t.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(
        t.adoptedStyleSheets,
        this.mirror.getId(pe.host(t))
      ), this.restoreHandlers.push(
        Iu(
          {
            mirror: this.mirror,
            stylesheetManager: this.bypassOptions.stylesheetManager
          },
          t
        )
      );
    }, 0);
  }
  /**
   * Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
   */
  observeAttachShadow(t) {
    !t.contentWindow || !t.contentDocument || this.patchAttachShadow(
      t.contentWindow.Element,
      t.contentDocument
    );
  }
  /**
   * Patch 'attachShadow' to observe newly added shadow doms.
   */
  patchAttachShadow(t, r) {
    const n = this;
    this.restoreHandlers.push(
      yr(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = pe.shadowRoot(this);
            return c && Mu(this) && n.addShadowRoot(c, r), a;
          };
        }
      )
    );
  }
  reset() {
    this.restoreHandlers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this.restoreHandlers = [], this.shadowDoms = /* @__PURE__ */ new WeakSet();
  }
}
var Ir = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Iy = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Dn = 0; Dn < Ir.length; Dn++)
  Iy[Ir.charCodeAt(Dn)] = Dn;
var Ly = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Ir[t[r] >> 2], i += Ir[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Ir[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Ir[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Xl = /* @__PURE__ */ new Map();
function Oy(e, t) {
  let r = Xl.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Xl.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Lu = (e, t, r) => {
  if (!e || !(Nu(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Oy(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Un(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Un(n, t, r));
  if (e === null)
    return e;
  if (e instanceof Float32Array || e instanceof Float64Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Uint8Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Int8Array || e instanceof Uint8ClampedArray)
    return {
      rr_type: e.constructor.name,
      args: [Object.values(e)]
    };
  if (
    // SharedArrayBuffer disabled on most browsers due to spectre.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/SharedArrayBuffer
    // value instanceof SharedArrayBuffer ||
    e instanceof ArrayBuffer
  ) {
    const n = e.constructor.name, i = Ly(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Un(e.buffer, t, r),
          e.byteOffset,
          e.byteLength
        ]
      };
    if (e instanceof HTMLImageElement) {
      const n = e.constructor.name, { src: i } = e;
      return {
        rr_type: n,
        src: i
      };
    } else if (e instanceof HTMLCanvasElement) {
      const n = "HTMLImageElement", i = e.toDataURL();
      return {
        rr_type: n,
        src: i
      };
    } else {
      if (e instanceof ImageData)
        return {
          rr_type: e.constructor.name,
          args: [Un(e.data, t, r), e.width, e.height]
        };
      if (Nu(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Lu(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const Ou = (e, t, r) => e.map((n) => Un(n, t, r)), Nu = (e, t) => !![
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject",
  // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
  "WebGLVertexArrayObjectOES"
].filter(
  (i) => typeof t[i] == "function"
).find(
  (i) => e instanceof t[i]
);
function Ny(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = yr(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...d) {
            return ot(this.canvas, r, n, !0) || setTimeout(() => {
              const o = Ou(d, t, this);
              e(this.canvas, {
                type: Ur["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = mi(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Ur["2D"],
              property: a,
              args: [l],
              setter: !0
            });
          }
        }
      );
      i.push(c);
    }
  return () => {
    i.forEach((a) => a());
  };
}
function Py(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Kl(e, t, r, n) {
  const i = [];
  try {
    const s = yr(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!ot(this, t, r, !0)) {
            const d = Py(c);
            if ("__context" in this || (this.__context = d), n && ["webgl", "webgl2"].includes(d))
              if (l[0] && typeof l[0] == "object") {
                const o = l[0];
                o.preserveDrawingBuffer || (o.preserveDrawingBuffer = !0);
              } else
                l.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return a.apply(this, [c, ...l]);
        };
      }
    );
    i.push(s);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    i.forEach((s) => s());
  };
}
function Jl(e, t, r, n, i, s) {
  const a = [], c = Object.getOwnPropertyNames(e);
  for (const l of c)
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      ![
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(l)
    )
      try {
        if (typeof e[l] != "function")
          continue;
        const d = yr(
          e,
          l,
          function(o) {
            return function(...h) {
              const p = o.apply(this, h);
              if (Lu(p, s, this), "tagName" in this.canvas && !ot(this.canvas, n, i, !0)) {
                const u = Ou(h, s, this), m = {
                  type: t,
                  property: l,
                  args: u
                };
                r(this.canvas, m);
              }
              return p;
            };
          }
        );
        a.push(d);
      } catch {
        const d = mi(e, l, {
          set(o) {
            r(this.canvas, {
              type: t,
              property: l,
              args: [o],
              setter: !0
            });
          }
        });
        a.push(d);
      }
  return a;
}
function Dy(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Jl(
      t.WebGLRenderingContext.prototype,
      Ur.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Jl(
      t.WebGL2RenderingContext.prototype,
      Ur.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const Pu = `(function() {
  "use strict";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
    for (i2 = 0; i2 < len; i2 += 3) {
      base64 += chars[bytes[i2] >> 2];
      base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
      base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
      base64 += chars[bytes[i2 + 2] & 63];
    }
    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
  };
  const lastBlobMap = /* @__PURE__ */ new Map();
  const transparentBlobMap = /* @__PURE__ */ new Map();
  async function getTransparentBlobFor(width, height, dataURLOptions) {
    const id = \`\${width}-\${height}\`;
    if ("OffscreenCanvas" in globalThis) {
      if (transparentBlobMap.has(id)) return transparentBlobMap.get(id);
      const offscreen = new OffscreenCanvas(width, height);
      offscreen.getContext("2d");
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      transparentBlobMap.set(id, base64);
      return base64;
    } else {
      return "";
    }
  }
  const worker = self;
  worker.onmessage = async function(e) {
    if ("OffscreenCanvas" in globalThis) {
      const { id, bitmap, width, height, dataURLOptions } = e.data;
      const transparentBase64 = getTransparentBlobFor(
        width,
        height,
        dataURLOptions
      );
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const type = blob.type;
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      if (!lastBlobMap.has(id) && await transparentBase64 === base64) {
        lastBlobMap.set(id, base64);
        return worker.postMessage({ id });
      }
      if (lastBlobMap.get(id) === base64) return worker.postMessage({ id });
      worker.postMessage({
        id,
        type,
        base64,
        width,
        height
      });
      lastBlobMap.set(id, base64);
    } else {
      return worker.postMessage({ id: e.data.id });
    }
  };
})();
//# sourceMappingURL=image-bitmap-data-url-worker-IJpC7g_b.js.map
`, Zl = typeof self < "u" && self.Blob && new Blob([Pu], { type: "text/javascript;charset=utf-8" });
function zy(e) {
  let t;
  try {
    if (t = Zl && (self.URL || self.webkitURL).createObjectURL(Zl), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Pu),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Fy {
  constructor(t) {
    W(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), W(this, "rafStamps", { latestId: 0, invokeId: null }), W(this, "mirror"), W(this, "mutationCb"), W(this, "resetObservers"), W(this, "frozen", !1), W(this, "locked", !1), W(this, "processMutation", (l, d) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(l) || this.pendingCanvasMutations.set(l, []), this.pendingCanvasMutations.get(l).push(d);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: s,
      recordCanvas: a,
      dataURLOptions: c
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, a && r === "all" && this.initCanvasMutationObserver(n, i, s), a && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, s, {
      dataURLOptions: c
    });
  }
  reset() {
    this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = !0;
  }
  unfreeze() {
    this.frozen = !1;
  }
  lock() {
    this.locked = !0;
  }
  unlock() {
    this.locked = !1;
  }
  initCanvasFPSObserver(t, r, n, i, s) {
    const a = Kl(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new zy();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: v, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: Ur["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, v, b]
          },
          {
            property: "drawImage",
            // draws (semi-transparent) image
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64: g }],
                    type: x
                  }
                ]
              },
              0,
              0
            ]
          }
        ]
      });
    };
    const d = 1e3 / t;
    let o = 0, h;
    const p = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        ot(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (o && m - o < d) {
        h = requestAnimationFrame(u);
        return;
      }
      o = m, p().forEach(async (f) => {
        var g;
        const x = this.mirror.getId(f);
        if (c.get(x) || f.width === 0 || f.height === 0) return;
        if (c.set(x, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const b = f.getContext(f.__context);
          ((g = b == null ? void 0 : b.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && b.clear(b.COLOR_BUFFER_BIT);
        }
        const v = await createImageBitmap(f);
        l.postMessage(
          {
            id: x,
            bitmap: v,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [v]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Kl(
      t,
      r,
      n,
      !1
    ), s = Ny(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = Dy(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), s(), a();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const t = (r) => {
      this.rafStamps.latestId = r, requestAnimationFrame(t);
    };
    requestAnimationFrame(t);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach(
      (t, r) => {
        const n = this.mirror.getId(r);
        this.flushPendingCanvasMutationFor(r, n);
      }
    ), requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(t, r) {
    if (this.frozen || this.locked)
      return;
    const n = this.pendingCanvasMutations.get(t);
    if (!n || r === -1) return;
    const i = n.map((a) => {
      const { type: c, ...l } = a;
      return l;
    }), { type: s } = n[0];
    this.mutationCb({ id: r, type: s, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class $y {
  constructor(t) {
    W(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "adoptedStyleSheetCb"), W(this, "styleMirror", new ay()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
  }
  attachLinkElement(t, r) {
    "_cssText" in r.attributes && this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [
        {
          id: r.id,
          attributes: r.attributes
        }
      ]
    }), this.trackLinkElement(t);
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) || (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t));
  }
  adoptStyleSheets(t, r) {
    if (t.length === 0) return;
    const n = {
      id: r,
      styleIds: []
    }, i = [];
    for (const s of t) {
      let a;
      this.styleMirror.has(s) ? a = this.styleMirror.getId(s) : (a = this.styleMirror.add(s), i.push({
        styleId: a,
        rules: Array.from(s.rules || CSSRule, (c, l) => ({
          rule: Yc(c, s.href),
          index: l
        }))
      })), n.styleIds.push(a);
    }
    i.length > 0 && (n.styles = i), this.adoptedStyleSheetCb(n);
  }
  reset() {
    this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  // TODO: take snapshot on stylesheet reload by applying event listener
  trackStylesheetInLinkElement(t) {
  }
}
class Uy {
  constructor() {
    W(this, "nodeMap", /* @__PURE__ */ new WeakMap()), W(this, "active", !1);
  }
  inOtherBuffer(t, r) {
    const n = this.nodeMap.get(t);
    return n && Array.from(n).some((i) => i !== r);
  }
  add(t, r) {
    this.active || (this.active = !0, requestAnimationFrame(() => {
      this.nodeMap = /* @__PURE__ */ new WeakMap(), this.active = !1;
    })), this.nodeMap.set(t, (this.nodeMap.get(t) || /* @__PURE__ */ new Set()).add(r));
  }
  destroy() {
  }
}
let Ue, Bn, js, Jn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Aa = e.contentWindow) == null ? void 0 : Aa.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const St = Ym();
function Qt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: s = null,
    ignoreClass: a = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: l = "rr-mask",
    maskTextSelector: d = null,
    inlineStylesheet: o = !0,
    maskAllInputs: h,
    maskInputOptions: p,
    slimDOMOptions: u,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: x,
    sampling: v = {},
    dataURLOptions: b = {},
    mousemoveWait: S,
    recordDOM: w = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: C = !1,
    recordAfter: L = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: D = !1,
    collectFonts: I = !1,
    inlineImages: J = !1,
    plugins: H,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: ye = /* @__PURE__ */ new Set([]),
    errorHandler: Le
  } = e;
  fy(Le);
  const oe = C ? window.parent === window : !0;
  let le = !1;
  if (!oe)
    try {
      window.parent.document && (le = !1);
    } catch {
      le = !0;
    }
  if (oe && !t)
    throw new Error("emit function is required");
  if (!oe && !le)
    return () => {
    };
  S !== void 0 && v.mousemove === void 0 && (v.mousemove = S), St.reset();
  const K = h === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : p !== void 0 ? p : { password: !0 }, he = eu(u);
  oy();
  let Oe, ce = 0;
  const Me = (Q) => {
    for (const Ae of H || [])
      Ae.eventProcessor && (Q = Ae.eventProcessor(Q));
    return x && // Disable packing events which will be emitted to parent frames.
    !le && (Q = x(Q)), Q;
  };
  Ue = (Q, Ae) => {
    var te;
    const ue = Q;
    if (ue.timestamp = on(), (te = dr[0]) != null && te.isFrozen() && ue.type !== we.FullSnapshot && !(ue.type === we.IncrementalSnapshot && ue.data.source === ge.Mutation) && dr.forEach(($e) => $e.unfreeze()), oe)
      t == null || t(Me(ue), Ae);
    else if (le) {
      const $e = {
        type: "rrweb",
        event: Me(ue),
        origin: window.location.origin,
        isCheckout: Ae
      };
      window.parent.postMessage($e, "*");
    }
    if (ue.type === we.FullSnapshot)
      Oe = ue, ce = 0;
    else if (ue.type === we.IncrementalSnapshot) {
      if (ue.data.source === ge.Mutation && ue.data.isAttachIframe)
        return;
      ce++;
      const $e = n && ce >= n, fe = r && ue.timestamp - Oe.timestamp > r;
      ($e || fe) && Bn(!0);
    }
  };
  const P = (Q) => {
    Ue({
      type: we.IncrementalSnapshot,
      data: {
        source: ge.Mutation,
        ...Q
      }
    });
  }, me = (Q) => Ue({
    type: we.IncrementalSnapshot,
    data: {
      source: ge.Scroll,
      ...Q
    }
  }), qe = (Q) => Ue({
    type: we.IncrementalSnapshot,
    data: {
      source: ge.CanvasMutation,
      ...Q
    }
  }), Xe = (Q) => Ue({
    type: we.IncrementalSnapshot,
    data: {
      source: ge.AdoptedStyleSheet,
      ...Q
    }
  }), De = new $y({
    mutationCb: P,
    adoptedStyleSheetCb: Xe
  }), Fe = new Ay({
    mirror: St,
    mutationCb: P,
    stylesheetManager: De,
    recordCrossOriginIframes: C,
    wrappedEmit: Ue
  });
  for (const Q of H || [])
    Q.getMirror && Q.getMirror({
      nodeMirror: St,
      crossOriginIframeMirror: Fe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Fe.crossOriginIframeStyleMirror
    });
  const We = new Uy();
  js = new Fy({
    recordCanvas: k,
    mutationCb: qe,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: St,
    sampling: v.canvas,
    dataURLOptions: b
  });
  const He = new _y({
    mutationCb: P,
    scrollCb: me,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskInputOptions: K,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: J,
      sampling: v,
      slimDOMOptions: he,
      iframeManager: Fe,
      stylesheetManager: De,
      canvasManager: js,
      keepIframeSrcFn: _,
      processedNodeManager: We
    },
    mirror: St
  });
  Bn = (Q = !1) => {
    if (!w)
      return;
    Ue(
      {
        type: we.Meta,
        data: {
          href: window.location.href,
          width: ku(),
          height: vu()
        }
      },
      Q
    ), De.reset(), He.init(), dr.forEach((te) => te.lock());
    const Ae = yg(document, {
      mirror: St,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskAllInputs: K,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: he,
      dataURLOptions: b,
      recordCanvas: k,
      inlineImages: J,
      onSerialize: (te) => {
        Su(te, St) && Fe.addIframe(te), Cu(te, St) && De.trackLinkElement(te), Zs(te) && He.addShadowRoot(pe.shadowRoot(te), document);
      },
      onIframeLoad: (te, ue) => {
        Fe.attachIframe(te, ue), He.observeAttachShadow(te);
      },
      onStylesheetLoad: (te, ue) => {
        De.attachLinkElement(te, ue);
      },
      keepIframeSrcFn: _
    });
    if (!Ae)
      return console.warn("Failed to snapshot the document");
    Ue(
      {
        type: we.FullSnapshot,
        data: {
          node: Ae,
          initialOffset: bu(window)
        }
      },
      Q
    ), dr.forEach((te) => te.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && De.adoptStyleSheets(
      document.adoptedStyleSheets,
      St.getId(document)
    );
  };
  try {
    const Q = [], Ae = (ue) => {
      var $e;
      return ve(Ty)(
        {
          mutationCb: P,
          mousemoveCb: (fe, er) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: er,
              positions: fe
            }
          }),
          mouseInteractionCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.MouseInteraction,
              ...fe
            }
          }),
          scrollCb: me,
          viewportResizeCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.ViewportResize,
              ...fe
            }
          }),
          inputCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.Input,
              ...fe
            }
          }),
          mediaInteractionCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.MediaInteraction,
              ...fe
            }
          }),
          styleSheetRuleCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.StyleSheetRule,
              ...fe
            }
          }),
          styleDeclarationCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.StyleDeclaration,
              ...fe
            }
          }),
          canvasMutationCb: qe,
          fontCb: (fe) => Ue({
            type: we.IncrementalSnapshot,
            data: {
              source: ge.Font,
              ...fe
            }
          }),
          selectionCb: (fe) => {
            Ue({
              type: we.IncrementalSnapshot,
              data: {
                source: ge.Selection,
                ...fe
              }
            });
          },
          customElementCb: (fe) => {
            Ue({
              type: we.IncrementalSnapshot,
              data: {
                source: ge.CustomElement,
                ...fe
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: K,
          inlineStylesheet: o,
          sampling: v,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: J,
          userTriggeredOnInput: D,
          collectFonts: I,
          doc: ue,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: s,
          slimDOMOptions: he,
          dataURLOptions: b,
          mirror: St,
          iframeManager: Fe,
          stylesheetManager: De,
          shadowDomManager: He,
          processedNodeManager: We,
          canvasManager: js,
          ignoreCSSAttributes: ye,
          plugins: (($e = H == null ? void 0 : H.filter((fe) => fe.observer)) == null ? void 0 : $e.map((fe) => ({
            observer: fe.observer,
            options: fe.options,
            callback: (er) => Ue({
              type: we.Plugin,
              data: {
                plugin: fe.name,
                payload: er
              }
            })
          }))) || []
        },
        g
      );
    };
    Fe.addLoadListener((ue) => {
      try {
        Q.push(Ae(ue.contentDocument));
      } catch ($e) {
        console.warn($e);
      }
    });
    const te = () => {
      Bn(), Q.push(Ae(document)), Jn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? te() : (Q.push(
      st("DOMContentLoaded", () => {
        Ue({
          type: we.DomContentLoaded,
          data: {}
        }), L === "DOMContentLoaded" && te();
      })
    ), Q.push(
      st(
        "load",
        () => {
          Ue({
            type: we.Load,
            data: {}
          }), L === "load" && te();
        },
        window
      )
    )), () => {
      Q.forEach((ue) => {
        try {
          ue();
        } catch ($e) {
          String($e).toLowerCase().includes("cross-origin") || console.warn($e);
        }
      }), We.destroy(), Jn = !1, my();
    };
  } catch (Q) {
    console.warn(Q);
  }
}
Qt.addCustomEvent = (e, t) => {
  if (!Jn)
    throw new Error("please add custom event after start recording");
  Ue({
    type: we.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Qt.freezePage = () => {
  dr.forEach((e) => e.freeze());
};
Qt.takeFullSnapshot = (e) => {
  if (!Jn)
    throw new Error("please take full snapshot after start recording");
  Bn(e);
};
Qt.mirror = St;
var Ql;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Ql || (Ql = {}));
const { addCustomEvent: Ib } = Qt, { freezePage: Lb } = Qt, { takeFullSnapshot: Ob } = Qt, zn = 2, Vs = 4;
class By {
  constructor(t) {
    wn(this, "events", []);
    wn(this, "lastMeta", null);
    wn(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Vs && (this.lastMeta = t), t.type === zn && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
  }
  prune() {
    if (!this.events.length) return;
    const r = this.events[this.events.length - 1].timestamp - this.opts.windowMs;
    let n = 0;
    for (; n < this.events.length && this.events[n].timestamp < r; ) n++;
    n > 0 && (this.events = this.events.slice(n)), this.events.length > this.opts.maxEvents && (this.events = this.events.slice(this.events.length - this.opts.maxEvents));
  }
  /** A playable, head-anchored copy: [meta, fullSnapshot, ...trailing incrementals]. */
  snapshot() {
    const t = [], r = this.events.some((i) => i.type === zn), n = this.events.some((i) => i.type === Vs);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === zn), n = t.some((i) => i.type !== zn && i.type !== Vs);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function qy(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new By({
    windowMs: r,
    maxEvents: t.maxEvents ?? 2e3
  }), i = t.maskAllInputs !== !1, s = t.maskText !== !1, a = Math.max(15e3, Math.round(r / 2));
  let c;
  try {
    c = e({
      emit(l) {
        try {
          n.push(l);
        } catch {
        }
      },
      // Fresh full snapshot every ~half-window so the retained snapshot reflects the live DOM.
      checkoutEveryNms: a,
      maskAllInputs: i,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: s ? (l) => "*".repeat(l.length) : void 0,
      // Capture same-origin CSS inline so the replay renders styled (rrweb default; set explicitly so
      // a blank/unstyled replay can't regress silently). Privacy masking above is unaffected.
      inlineStylesheet: !0,
      // Don't record <script>/<noscript> contents and obvious secrets.
      blockClass: "klavity-no-record",
      ignoreClass: "klavity-no-record",
      recordCanvas: !1,
      collectFonts: !1
    });
  } catch {
  }
  return {
    getEvents: () => n.isPlayable() ? n.snapshot() : [],
    hasRecording: () => n.isPlayable(),
    stop: () => {
      try {
        c == null || c();
      } catch {
      }
      n.clear();
    }
  };
}
const Du = "klav-sims-live", zu = "klav-sims-overlay", ec = "klav-sims-ext-css";
let Et = null, cr = null, gt = null, Lr = null;
const Zn = /* @__PURE__ */ new Map(), bt = /* @__PURE__ */ new Map();
let Fu = 0, zt = !1, pr = null, Dr = null, pn = !1, it = null, Kr = null, Kt = null, Jt = null, Mt = null, hr = null, Ct = null, Pt = null, Rt = null, Or = null;
const Qn = /* @__PURE__ */ new Set();
function Wy(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function $u(e, t) {
  return `${e}::${Wy(t.text)}`;
}
function Uu(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Hy = `
  :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }

  .ksl-sr {
    position: absolute; width: 1px; height: 1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; pointer-events: none;
  }

  /* ── design tokens (mirror packages/core/demo/sims-feedback-panel.html) ── */
  .ksl-root {
    --surface:   #16110c;
    --surface-2: #1c1610;
    --surface-3: #221b13;
    --line:      #3a332b;
    --line-soft: #2a231b;
    --fg:   #f5f3ee;
    --fg-2: #cec6bd;
    --fg-3: #8a8276;
    --fg-4: #5e5852;
    --accent:   #8b5cf6;
    --accent-2: #a78bfa;
    --accent-3: #c4b5fd;
    --accent-glow: rgba(139,92,246,.28);
    --sev-h-bg: rgba(233,79,55,.22);  --sev-h-fg:#e8849a;
    --sev-m-bg: rgba(244,169,60,.20); --sev-m-fg:#e8a24a;
    --sev-l-bg: rgba(127,209,196,.15);--sev-l-fg:#7fd1c4;
    --mono: ui-monospace,'JetBrains Mono',monospace;
    --ease: cubic-bezier(.34,1.36,.64,1);
    pointer-events: none;   /* only interactive children capture events */
  }
  .ksl-root button { font-family: inherit; }

  /* ═══════════════ launcher pill ═══════════════ */
  .ksl-launcher {
    position: fixed; right: 20px; bottom: 20px;
    display: inline-flex; align-items: center; gap: 0;
    border: 0; cursor: pointer; background: transparent; padding: 0;
    pointer-events: auto;
  }
  .ksl-launcher[hidden] { display: none; }
  .ksl-pill {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--accent-glow); border-radius: 999px;
    padding: 8px 16px 8px 10px;
    box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 4px rgba(139,92,246,.1);
    transition: transform .15s var(--ease), border-color .15s;
  }
  .ksl-launcher:hover .ksl-pill { transform: translateY(-2px); border-color: var(--accent-2); }
  .ksl-launcher:active .ksl-pill { transform: scale(.97); }
  .ksl-launcher:focus-visible { outline: none; }
  .ksl-launcher:focus-visible .ksl-pill { border-color: var(--accent-2); box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 3px var(--accent-2); }
  .ksl-pill-txt { font-size: 13px; font-weight: 600; color: var(--fg); white-space: nowrap; }
  .ksl-pill-txt b { color: var(--accent-3); }
  .ksl-pill-avatars { display: flex; }
  .ksl-pill-avatars .ksim { margin-left: -10px; }
  .ksl-pill-avatars .ksim:first-child { margin-left: 0; }
  .ksl-pill-badge {
    position: absolute; top: -4px; right: -4px;
    background: var(--sev-h-fg); color: #2a0e12;
    font: 700 10px/1 var(--mono); border-radius: 20px; padding: 3px 6px;
    box-shadow: 0 4px 10px rgba(0,0,0,.5);
  }
  .ksl-pill-badge[hidden] { display: none; }

  /* reviewing shimmer inside the launcher */
  .ksl-launcher.is-reviewing .ksl-pill { border-color: var(--accent-2); }
  .ksl-launcher.is-reviewing .ksl-pill-txt::after {
    content: ''; display: inline-block; width: 7px; height: 7px; margin-left: 7px;
    border-radius: 50%; background: var(--accent-2); vertical-align: middle;
    box-shadow: 0 0 0 0 rgba(167,139,250,.55);
    animation: ksl-pulse 1.4s ease-out infinite;
  }
  @keyframes ksl-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(167,139,250,.55); opacity: 1; }
    70%  { box-shadow: 0 0 0 7px rgba(167,139,250,0); opacity: .85; }
    100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); opacity: 1; }
  }

  /* ═══════════════ floating chat panel ═══════════════ */
  .ksl-panel {
    position: fixed; right: 20px; bottom: 20px; z-index: 1;
    width: 378px; max-width: calc(100vw - 32px);
    height: min(620px, calc(100vh - 96px));
    display: none; flex-direction: column; overflow: hidden;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--line); border-radius: 18px;
    box-shadow: 0 30px 70px -20px rgba(0,0,0,.8), 0 0 0 4px rgba(139,92,246,.08);
    transform-origin: bottom right;
    color: var(--fg); pointer-events: auto;
  }
  .ksl-panel.is-open { display: flex; animation: ksl-panel-in .34s var(--ease) both; }
  @keyframes ksl-panel-in { 0% { transform: translateY(24px) scale(.9); opacity: 0; } 100% { transform: none; opacity: 1; } }

  .ksl-head { padding: 16px 16px 12px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
  .ksl-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 3px; }
  .ksl-title { font-size: 14.5px; font-weight: 700; }
  .ksl-count { font-size: 12.5px; color: var(--fg-3); }
  .ksl-count b { color: var(--accent-3); }
  .ksl-count .ksl-hi { color: var(--sev-h-fg); }
  .ksl-icon-btn {
    margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid var(--line); background: transparent; color: var(--fg-3);
    cursor: pointer; display: grid; place-items: center;
    transition: transform .15s var(--ease), background .15s, color .15s;
  }
  .ksl-icon-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.06); color: var(--fg); }
  .ksl-icon-btn:active { transform: scale(.94); }
  .ksl-icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-icon-btn svg { width: 15px; height: 15px; }

  .ksl-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .ksl-chips[hidden] { display: none; }
  .ksl-chip {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 20px; padding: 6px 10px; cursor: pointer;
    border: 1px solid var(--line); background: var(--surface-2); color: var(--fg-3);
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-chip:hover { transform: translateY(-1px); color: var(--fg); }
  .ksl-chip:active { transform: scale(.96); }
  .ksl-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-chip .ksl-dot { width: 8px; height: 8px; border-radius: 50%; }
  .ksl-chip.is-on { background: rgba(139,92,246,.16); border-color: rgba(139,92,246,.5); color: var(--accent-3); }
  .ksl-chip.sev-on-h { background: var(--sev-h-bg); border-color: var(--sev-h-fg); color: var(--sev-h-fg); }
  .ksl-chip.sev-on-m { background: var(--sev-m-bg); border-color: var(--sev-m-fg); color: var(--sev-m-fg); }
  .ksl-chip.sev-on-l { background: var(--sev-l-bg); border-color: var(--sev-l-fg); color: var(--sev-l-fg); }
  .ksl-chips-label {
    font: 700 9.5px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase;
    color: var(--fg-4); align-self: center; margin-right: 2px;
  }

  .ksl-list { flex: 1; overflow-y: auto; padding: 12px 14px 22px; display: flex; flex-direction: column; gap: 10px; }
  .ksl-list::-webkit-scrollbar { width: 9px; }
  .ksl-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 6px; border: 2px solid var(--surface); }

  /* ── empty / reviewing state ── */
  .ksl-empty { color: var(--fg-4); font-size: 13px; text-align: center; padding: 40px 18px; line-height: 1.5; }
  .ksl-empty .ksl-empty-title { color: var(--fg-2); font-size: 14px; font-weight: 600; margin-bottom: 6px; }
  .ksl-shimmer {
    display: inline-block; margin-top: 12px; height: 8px; width: 70%; border-radius: 6px;
    background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 40%, var(--accent-glow) 50%, var(--surface-3) 60%, var(--surface-2) 100%);
    background-size: 200% 100%; animation: ksl-shimmer 1.4s linear infinite;
  }
  @keyframes ksl-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── severity pill ── */
  .ksl-sev {
    display: inline-block; font: 700 9px/1 var(--mono); letter-spacing: .05em; text-transform: uppercase;
    padding: 3px 6px; border-radius: 5px; flex-shrink: 0;
  }
  .ksl-sev.h { background: var(--sev-h-bg); color: var(--sev-h-fg); }
  .ksl-sev.m { background: var(--sev-m-bg); color: var(--sev-m-fg); }
  .ksl-sev.l { background: var(--sev-l-bg); color: var(--sev-l-fg); }

  /* ── finding row ── */
  .ksl-row {
    position: relative; border: 1px solid var(--line-soft); border-left-width: 3px;
    border-radius: 12px; background: var(--surface-2); padding: 12px 13px 11px;
    text-align: left; width: 100%; display: block;
    transition: transform .15s var(--ease), background .15s, box-shadow .15s;
  }
  .ksl-row:hover { transform: translateY(-2px) scale(1.012); background: var(--surface-3); box-shadow: 0 12px 30px -12px rgba(0,0,0,.7); }
  .ksl-row .ksl-r-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
  .ksl-r-name { font: 700 9.5px/1 var(--mono); letter-spacing: .09em; text-transform: uppercase;
    color: var(--fg-2); flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .ksl-r-sent { font: 600 10px/1 system-ui,sans-serif; color: var(--fg-4); text-transform: capitalize; white-space: nowrap; }
  .ksl-r-obs { font-size: 13px; line-height: 1.5; color: var(--fg-2);
    display: -webkit-box; -webkit-line-clamp: 4; line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .ksl-row.is-expanded .ksl-r-obs { -webkit-line-clamp: unset; line-clamp: unset; overflow: visible; }
  .ksl-r-expand { font: 600 11px/1 system-ui,sans-serif; color: var(--accent-3); margin-top: 6px;
    background: none; border: 0; padding: 2px 0; cursor: pointer; display: none; }
  .ksl-row.is-clamped .ksl-r-expand { display: inline-block; }
  .ksl-r-expand:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-actions { display: flex; gap: 7px; margin-top: 11px; flex-wrap: wrap; }
  .ksl-r-act {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 7px; padding: 6px 9px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-r-act:hover { transform: translateY(-1px); }
  .ksl-r-act:active { transform: scale(.96); }
  .ksl-r-act:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-act svg { width: 12px; height: 12px; }
  .ksl-r-act.track { background: rgba(139,92,246,.18); border: 1px solid rgba(139,92,246,.38); color: var(--accent-3); }
  .ksl-r-act.track:hover { background: rgba(139,92,246,.32); border-color: rgba(139,92,246,.6); }
  .ksl-r-act.jump { background: transparent; border: 1px solid var(--line); color: var(--fg-2); }
  .ksl-r-act.jump:hover { background: rgba(255,255,255,.06); border-color: #5a5248; color: var(--fg); }
  .ksl-r-act.dismiss { background: transparent; border: 1px solid var(--line); color: var(--fg-4); margin-left: auto; }
  .ksl-r-act.dismiss:hover { background: rgba(255,255,255,.06); color: var(--fg-2); }
  .ksl-row.is-removing { opacity: 0; transform: translateX(18px) scale(.96); pointer-events: none;
    transition: opacity .28s ease, transform .28s var(--ease); }

  @media (max-width:480px) {
    .ksl-panel { right: 12px; bottom: 12px; width: calc(100vw - 24px); }
    .ksl-launcher { right: 12px; bottom: 12px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .ksl-panel.is-open,.ksl-row,.ksl-shimmer,.ksl-launcher.is-reviewing .ksl-pill-txt::after { animation: none !important; }
    .ksl-panel, .ksl-row, .ksl-pill, .ksl-chip, .ksl-r-act, .ksl-icon-btn { transition: none !important; }
  }
`, jy = `
  /* ── Halo box — TRANSIENT highlight drawn around a flagged element on "Jump to" ── */
  .klav-halo {
    position: fixed;
    pointer-events: none;
    border-radius: 8px;
    z-index: 2147483640;
    border-width: 2px;
    border-style: solid;
    animation: klav-halo-in .38s cubic-bezier(.34,1.36,.64,1) both,
               klav-halo-pulse 2.4s ease-in-out .4s infinite;
    transition: opacity .18s ease, transform .18s ease;
  }
  @keyframes klav-halo-in {
    from { transform: scale(.84); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes klav-halo-pulse {
    0%,100% { opacity: .75; }
    50%     { opacity: 1; }
  }
  @media (prefers-reduced-motion:reduce) {
    .klav-halo { animation: none !important; opacity: 1; transform: none; }
  }
`;
function tc(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Vy(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function eo() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Yy(e) {
  return new Promise((t) => setTimeout(t, e));
}
function zr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Bu = { HIGH: "h", MED: "m", LOW: "l" }, rc = { HIGH: 0, MED: 1, LOW: 2 };
function Gy(e) {
  if (!e) return !1;
  if (e === gt || e === Et || e.id === zu || e.id === Du || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Xy(e) {
  const t = [];
  for (const r of [gt, Et])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function qu(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Wu(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function nc(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Ky(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Jy(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Hu(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Gy(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Zy(e, t) {
  return Xy(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Hu(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function Qy(e, t) {
  const r = qu(t), n = Wu(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Zy(i, s);
  if (!a.length) return null;
  const c = Math.max(1, nc(n));
  let l = null, d = -1 / 0;
  for (const o of a) {
    const h = Jy(o.getBoundingClientRect()), p = Ky(h, n);
    if (p <= 0) continue;
    const u = Math.max(1, nc(h)), m = p / c, f = Math.max(0, (u - p) / u), g = o.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, v = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + x - v;
    b > d && (l = o, d = b);
  }
  return l ?? a[0] ?? null;
}
async function eb(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: eo() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Yy(eo() ? 80 : 520);
}
const tb = /* @__PURE__ */ new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "button",
  "clear",
  "could",
  "easy",
  "element",
  "feels",
  "from",
  "have",
  "into",
  "just",
  "like",
  "more",
  "page",
  "section",
  "that",
  "the",
  "their",
  "there",
  "this",
  "with",
  "would",
  "where",
  "while",
  "your"
]);
function rb(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || tb.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function nb(e) {
  const t = rb(e.text);
  if (!t.length) return null;
  const r = [
    "button",
    "a",
    "input",
    "textarea",
    "select",
    "label",
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "li",
    "nav",
    "header",
    "footer",
    "main",
    "section",
    "article",
    "form",
    "[role]",
    "[aria-label]",
    "[data-testid]",
    "div"
  ].join(",");
  let n = null, i = 0;
  const s = Array.from(document.querySelectorAll(r)).slice(0, 700);
  for (const a of s) {
    if (!Hu(a)) continue;
    const c = a.getBoundingClientRect(), l = [
      a.textContent || "",
      a.getAttribute("aria-label") || "",
      a.getAttribute("title") || "",
      a.getAttribute("placeholder") || "",
      a.getAttribute("data-testid") || "",
      a.id || "",
      typeof a.className == "string" ? a.className : ""
    ].join(" ").toLowerCase();
    if (!l.trim()) continue;
    const d = t.reduce((f, g) => f + (l.includes(g) ? 1 : 0), 0);
    if (!d) continue;
    const o = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(o) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = d / t.length + h - u;
    m > i && (n = a, i = m);
  }
  return n;
}
async function ib(e, t = {}) {
  if (e.region) {
    const r = qu(e), n = Wu(e.region, r);
    t.scroll !== !1 && await eb(n.left + n.width / 2, n.top + n.height / 2);
    const i = Qy(e.region, e);
    if (i) return i;
  }
  return nb(e);
}
function sb() {
  if (Et && cr) return cr;
  Et = document.createElement("div"), Et.id = Du, Et.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", cr = Et.attachShadow({ mode: "open" }), nm(cr);
  const e = document.createElement("style");
  return e.textContent = Hy, cr.appendChild(e), document.body.appendChild(Et), cr;
}
function ju() {
  if (gt) return gt;
  if (!document.getElementById(ec)) {
    const e = document.createElement("style");
    e.id = ec, e.textContent = jy, document.head.appendChild(e);
  }
  return gt = document.createElement("div"), gt.id = zu, gt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(gt), gt;
}
function Vu(e, t) {
  return tm({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function ob(e, t = [], r = {}) {
  if (typeof document > "u") return;
  ro();
  const n = sb();
  ju(), Lr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), ro();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const p = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Zn.set(h.id, { simId: h.id, accent: p, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Rt = document.createElement("div"), Rt.className = "ksl-sr", Rt.id = "ksl-announcer", Rt.setAttribute("aria-live", "polite"), Rt.setAttribute("aria-atomic", "true"), s.appendChild(Rt), it = document.createElement("button"), it.type = "button", it.className = "ksl-launcher", it.setAttribute("aria-label", "Open Sims feedback panel"), it.addEventListener("click", () => ab());
  const a = document.createElement("span");
  a.className = "ksl-pill", Kr = document.createElement("span"), Kr.className = "ksl-pill-avatars", Kt = document.createElement("span"), Kt.className = "ksl-pill-txt", a.append(Kr, Kt), Jt = document.createElement("span"), Jt.className = "ksl-pill-badge", Jt.hidden = !0, it.append(a, Jt), s.appendChild(it), i.slice(0, 3).forEach((h) => {
    const p = Zn.get(h.id);
    p && Kr.appendChild(Vu(p, 26));
  }), Mt = document.createElement("section"), Mt.className = "ksl-panel", Mt.setAttribute("aria-label", "Sims feedback"), Mt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const o = document.createElement("button");
  o.type = "button", o.className = "ksl-icon-btn", o.title = "Minimize", o.setAttribute("aria-label", "Minimize Sims feedback panel"), o.innerHTML = ee("x", { size: 15 }), o.addEventListener("click", () => ic()), l.append(d, o), hr = document.createElement("div"), hr.className = "ksl-count", Ct = document.createElement("div"), Ct.className = "ksl-chips", c.append(l, hr, Ct), Pt = document.createElement("div"), Pt.className = "ksl-list", Pt.setAttribute("role", "list"), Mt.append(c, Pt), s.appendChild(Mt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && zt && ic();
  }, { signal: Lr.signal }), Uu(!0), qr();
}
function Yu(e) {
  pn = e, it == null || it.classList.toggle("is-reviewing", e), qr(), zt && Br();
}
function ab() {
  !Mt || !it || (zt = !0, Mt.classList.add("is-open"), it.hidden = !0, Br());
}
function ic() {
  !Mt || !it || (zt = !1, Mt.classList.remove("is-open"), it.hidden = !1, qr());
}
function Gu() {
  const e = Array.from(bt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => zr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function qr() {
  const e = Gu();
  Kt && (pn && e.total === 0 ? Kt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Kt.innerHTML = "Sims are watching this page" : Kt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Jt && (Jt.hidden = e.high === 0, Jt.textContent = `${e.high} high`), zt && Xu(e);
}
function Xu(e) {
  hr && (e.total === 0 ? hr.innerHTML = pn ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : hr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), lb();
}
function lb() {
  if (!Ct) return;
  const e = Array.from(bt.values());
  if (Ct.hidden = e.length === 0, Ct.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Ct.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (pr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(pr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      pr = pr === i.simId ? null : i.simId, Br();
    }), Ct.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Ct.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => zr(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Dr === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${Bu[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      Dr = Dr === i ? null : i, Br();
    }), Ct.appendChild(a);
  });
}
function cb() {
  return Array.from(bt.values()).filter((e) => !pr || e.entry.simId === pr).filter((e) => !Dr || zr(e.obs) === Dr).sort((e, t) => {
    const r = zr(e.obs), n = zr(t.obs), i = r ? rc[r] : 3, s = n ? rc[n] : 3;
    return i - s;
  });
}
function ub(e) {
  const { entry: t, obs: r } = e, n = zr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Vu(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Bu[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
  }
  i.appendChild(s);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-expand", d.textContent = "Show more", d.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    d.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(d);
  const o = document.createElement("div");
  o.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = ee("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = qn.onTriage) == null || m.call(qn, r, t.name), sc(e.id);
  });
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act jump", p.innerHTML = ee("map-pin", { size: 12 }) + " Jump to on page", p.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), p.addEventListener("click", () => {
    pb(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    sc(e.id);
  }), o.append(h, p, u), i.appendChild(o), i;
}
function db(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Br() {
  if (!Pt || !zt) {
    qr();
    return;
  }
  const e = Gu();
  Xu(e);
  const t = cb();
  if (Pt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = bt.size > 0;
    if (pn && !i) {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "Your Sims are reviewing this page…";
      const a = document.createElement("div");
      a.textContent = "Findings will appear here as they spot things.";
      const c = document.createElement("div");
      c.className = "ksl-shimmer", n.append(s, a, c);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "No findings yet";
      const a = document.createElement("div");
      a.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(s, a);
    }
    Pt.appendChild(n), bt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = ub(n);
    n.rowEl = i, Pt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  bt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), db(Pt);
}
function to() {
  Or == null || Or(), Or = null;
}
async function pb(e) {
  const t = bt.get(e);
  if (!t) return;
  const r = await ib(t.obs, { scroll: !0 });
  !r || !gt || hb(r, t.entry.accent);
}
function hb(e, t) {
  to();
  const r = ju(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${tc(t, 0.16)},0 0 24px ${tc(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), o = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Or === l && to();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Be(n);
  };
  Or = l;
}
function fb(e, t) {
  const r = `f_${e.simId}_${++Fu}`;
  bt.set(r, { id: r, entry: e, obs: t, rowEl: null }), zt ? Br() : qr(), Rt && (Rt.textContent = "", requestAnimationFrame(() => {
    Rt && (Rt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function mb(e) {
  const t = bt.get(e);
  if (!t) return;
  const r = () => {
    bt.delete(e), zt ? Br() : qr();
  };
  t.rowEl && zt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, eo() ? 0 : 300)) : r();
}
function sc(e) {
  const t = bt.get(e);
  t && (Qn.add($u(t.entry.simId, t.obs)), mb(e));
}
function gb(e, t, r) {
  if (!Et) return;
  const n = Zn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Yu(!1);
    for (const i of r) {
      if (!Vy(i)) continue;
      const s = $u(e, i);
      Qn.has(s) || (Qn.add(s), fb(n, i));
    }
  }
}
function ro() {
  to(), bt.clear(), Fu = 0, Zn.clear(), Qn.clear(), zt = !1, pr = null, Dr = null, pn = !1, Lr == null || Lr.abort(), Lr = null, it = null, Kr = null, Kt = null, Jt = null, Mt = null, hr = null, Ct = null, Pt = null, Rt = null, Be(gt), gt = null, Be(Et), Et = null, cr = null, Uu(!1);
}
const qn = {
  deploy: ob,
  setReviewing: Yu,
  renderFeedback: gb,
  undeploy: ro,
  onTriage: null
};
function yb() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = qn);
}
typeof window < "u" && yb();
const oc = "klav-ao-css", bb = "klav-ao-overlay";
function vb(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), d = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(d, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const kb = `
  .klav-ao-halo {
    position: fixed;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    pointer-events: none;
    z-index: 2147483640;
    animation: klav-ao-in .38s cubic-bezier(.34,1.36,.64,1) both,
               klav-ao-pulse 2.4s ease-in-out .4s infinite;
  }
  @keyframes klav-ao-in {
    from { transform: scale(.84); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes klav-ao-pulse {
    0%,100% { opacity: .75; }
    50%     { opacity: 1; }
  }

  .klav-ao-pin {
    position: fixed;
    z-index: 2147483642;
    width: 224px;
    background: linear-gradient(168deg, rgba(22,17,12,.98), rgba(14,11,8,.99));
    border: 1px solid #3a332b;
    border-left-width: 3px;
    border-radius: 13px;
    padding: 11px 11px 10px 12px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 20px 52px rgba(0,0,0,.68), 0 6px 18px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.07);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    backdrop-filter: blur(12px) saturate(140%);
    pointer-events: auto;
    animation: klav-ao-pin-in .36s cubic-bezier(.34,1.36,.64,1) both;
  }
  @keyframes klav-ao-pin-in {
    from { transform: scale(.86) translateY(10px); opacity: 0; }
    60%  { transform: scale(1.02) translateY(-2px); opacity: 1; }
    to   { transform: scale(1)   translateY(0);    opacity: 1; }
  }
  .klav-ao-pin.is-out {
    animation: klav-ao-pin-out .22s ease-in forwards;
    pointer-events: none;
  }
  @keyframes klav-ao-pin-out {
    to { transform: scale(.88) translateY(-8px); opacity: 0; }
  }
  /* Tail pointing down toward the halo (default: pin is above the halo) */
  .klav-ao-pin::after  { content:''; position:absolute; bottom:-8px; left:18px; border:7px solid transparent; border-top-color:#3a332b; border-bottom:none; pointer-events:none; }
  .klav-ao-pin::before { content:''; position:absolute; bottom:-6px; left:19px; border:6px solid transparent; border-top-color:#16110c;  border-bottom:none; z-index:1; pointer-events:none; }
  /* Tail flipped to top when the pin is placed below the halo */
  .klav-ao-pin.tail-top::after  { bottom:auto; top:-8px; border-top:none; border-bottom:7px solid #3a332b; }
  .klav-ao-pin.tail-top::before { bottom:auto; top:-6px; border-top:none; border-bottom:6px solid #16110c; z-index:1; }

  .klav-ao-hd   { display:flex; align-items:center; gap:6px; margin-bottom:7px; }
  .klav-ao-lbl  { font-family:ui-monospace,'JetBrains Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .klav-ao-sev  { font-family:ui-monospace,monospace; font-size:9px; letter-spacing:.05em; text-transform:uppercase; padding:1px 5px; border-radius:4px; background:rgba(233,79,55,.22); color:#e8849a; flex-shrink:0; }
  .klav-ao-sev.sev-m { background:rgba(244,169,60,.2);   color:#e8a24a; }
  .klav-ao-sev.sev-l { background:rgba(127,209,196,.15); color:#7fd1c4; }

  .klav-ao-dismiss {
    background:none; border:1px solid #3a332b; color:#6e6560; font-size:11.5px;
    border-radius:7px; padding:5px 8px; cursor:pointer; font-family:system-ui,sans-serif;
    transition:background .15s,color .15s,border-color .15s; width:100%; margin-top:8px;
  }
  .klav-ao-dismiss:hover { background:rgba(255,255,255,.08); color:#f5f3ee; border-color:#5a5248; }
  .klav-ao-dismiss:focus-visible { outline:2px solid #8b5cf6; outline-offset:2px; }

  @media (prefers-reduced-motion:reduce) {
    .klav-ao-halo { animation:none !important; opacity:1; transform:none; }
    .klav-ao-pin,.klav-ao-pin.is-out { animation:none !important; opacity:1; transform:none; }
  }
`;
let lr = null, wb = 1;
const ei = /* @__PURE__ */ new Map();
function ac(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function xb() {
  if (lr) return lr;
  if (!document.getElementById(oc)) {
    const e = document.createElement("style");
    e.id = oc, e.textContent = kb, document.head.appendChild(e);
  }
  return lr = document.createElement("div"), lr.id = bb, lr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(lr), lr;
}
function Nb(e, t, r = {}) {
  const n = xb(), i = r.color ?? "#6366f1", s = `klav-ao-${wb++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${ac(i, 0.14)},0 0 24px ${ac(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: p, top: u, below: m } = vb(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = s, l.style.borderLeftColor = i, l.style.left = p + "px", l.style.top = u + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = i, g.textContent = t, f.appendChild(g);
    const x = r.priority ?? r.severity;
    if (x) {
      const b = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", S = document.createElement("span");
      S.className = `klav-ao-sev${b}`, S.textContent = x, f.appendChild(S);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => Ku(s)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return ei.set(s, { halo: c, pin: l }), s;
}
function Ku(e) {
  const t = ei.get(e);
  if (!t) return;
  ei.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Be(n), Be(r);
  }, 240)) : Be(r);
}
function Pb() {
  for (const e of [...ei.keys()]) Ku(e);
}
let Ro = Mr, ur = "";
const Ju = { consoleErrors: [], networkFailures: [] };
let To, Zu, Fr = null;
function Xr() {
  return Ro.backendUrl || Lc;
}
const Sb = 15e3;
function Fn(e, t = {}, r = Sb) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Qu(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function lc() {
  return Oh(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Cb() {
  return jh(Ju, { identity: To, metadata: Zu });
}
async function Eb(e) {
  return $h(
    {
      type: e.type,
      kind: e.kind,
      title: e.title,
      description: e.description,
      context: e.context,
      screenshots: e.screenshots,
      screenshotThumbs: e.screenshotThumbs,
      files: e.files,
      recordings: e.recordings,
      annotations: e.annotations,
      reporter: e.reporter,
      clientInfo: e.clientInfo,
      reporterEmail: e.reporterEmail,
      referrer: e.referrer,
      projectId: ur || void 0,
      replayEvents: e.replayEvents
    },
    Ro,
    { backend: om }
  );
}
function Ao(e = "bug") {
  const t = Yf(e, {
    onCaptureFull: lc,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: Ta,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Fn(Xr() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: ur, text: r, url: location.href })
        });
        if (!n.ok) return null;
        const i = await n.json().catch(() => null);
        return i && i.match ? i.match : null;
      } catch {
        return null;
      }
    },
    // Report-clarity coach (POST /api/report/clarity): a single short tip for the in-progress description.
    onClarityTip: async (r, n) => {
      try {
        const i = await Fn(Xr() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: ur, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: $i() })
        });
        if (!i.ok) return null;
        const s = await i.json().catch(() => null);
        return s && typeof s.tip == "string" && s.tip ? { tip: s.tip } : null;
      } catch {
        return null;
      }
    },
    // KLA-586 AI "Enhance" (POST /api/report/enhance): the reporter's one-liner + the primary shot + picked
    // element → a structured developer-ready draft. Longer timeout (vision call).
    onEnhance: async (r, n) => {
      try {
        const i = await Fn(Xr() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: ur, text: r, pageUrl: location.href, shot: (n == null ? void 0 : n.shot) || "", picked: (n == null ? void 0 : n.picked) || null, images: (n == null ? void 0 : n.images) ?? 0, client: $i() })
        }, 3e4);
        if (!i.ok) return null;
        const s = await i.json().catch(() => null);
        return s && s.draft ? s.draft : null;
      } catch {
        return null;
      }
    },
    // KLA-505 server-side dictation (POST /api/voice/transcribe): the Voice button hands each mic clip here;
    // resolve null on any failure so the composer falls back to Web Speech.
    onDictate: async (r) => {
      try {
        const n = new FormData();
        n.append("projectId", ur), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Fn(Xr() + "/api/voice/transcribe", { method: "POST", body: n });
        if (!i.ok) return null;
        const s = await i.json().catch(() => null);
        return s && typeof s.text == "string" ? { text: s.text } : null;
      } catch {
        return null;
      }
    },
    // #647 LIVE streaming dictation: ws(s)://…/api/voice/stream?project=… — the composer PREFERS this and
    // falls back to onDictate then Web Speech on any connect failure.
    dictationStreamUrl: (() => {
      try {
        const r = new URL(Xr() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", ur), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return qc();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => wm({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => Ta(a))), i = await Promise.all(n.map((a) => xm(a))), s = Cb();
      return r.attachConsole !== !0 && (s.consoleErrors = []), Eb({
        type: r.type,
        kind: r.kind,
        title: r.title,
        description: r.description,
        context: s,
        screenshots: n,
        screenshotThumbs: i,
        files: r.files,
        recordings: r.recordings,
        annotations: r.annotations,
        reporterEmail: r.reporterEmail,
        reporter: To,
        clientInfo: $i(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (Fr == null ? void 0 : Fr.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await lc();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Mb() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function Rb() {
  Vh(Ju, { consoleLevels: !0 });
}
function ed(e) {
  To = e ? Qu(e) : void 0;
}
function td(e) {
  Zu = e ? Qu(e) : void 0;
}
function Tb() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = am, (document.head || document.documentElement).appendChild(e);
}
function Ab() {
  document.addEventListener("contextmenu", (e) => {
    if (Lf(e.target)) return;
    e.preventDefault(), Tb();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, o, h, p, u = {}) => {
      const m = cm(document, { iconHtml: ee(d), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), Ao(p);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      Be(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
    }, c = (d) => {
      (!d || !t.contains(d.target)) && a();
    }, l = (d) => {
      d.key === "Escape" && a();
    };
    setTimeout(() => {
      document.addEventListener("click", c), document.addEventListener("keydown", l, !0);
    }, 0);
  });
}
function rd(e = {}) {
  if (Ro = {
    ...Mr,
    ...e,
    jira: { ...Mr.jira, ...e.jira },
    linear: { ...Mr.linear, ...e.linear },
    github: { ...Mr.github, ...e.github },
    plane: { ...Mr.plane, ...e.plane }
  }, typeof e.projectId == "string" && (ur = e.projectId), Rb(), Mb(), Ab(), !Fr)
    try {
      Fr = qy(Qt);
    } catch {
      Fr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: rd, openModal: Ao, identify: ed, setMetadata: td });
const Db = { init: rd, openModal: Ao, identify: ed, setMetadata: td };
export {
  qn as KlavitySims,
  qn as SimsLive,
  Ku as clearAnnotation,
  Pb as clearAnnotations,
  Db as default,
  ed as identify,
  rd as init,
  yb as installKlavitySims,
  Ao as openModal,
  td as setMetadata,
  Nb as showAnnotation
};
