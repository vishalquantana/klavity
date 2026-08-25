var Gu = Object.defineProperty;
var Ku = (e, t, r) => t in e ? Gu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var on = (e, t, r) => Ku(e, typeof t != "symbol" ? t + "" : t, r);
function Xu(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Pl = 112, $l = 72, Dl = 89, zl = 115;
let ai;
function Ju() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Zu(e) {
  let t = -1;
  ai || (ai = Ju());
  for (let r = 0; r < e.length; r++)
    t = ai[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Qu(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Pl && e[r - 2] === $l && e[r - 1] === Dl && e[r] === zl)
      return r - 3;
  return 0;
}
function ed(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Pl, n[1] = $l, n[2] = Dl, n[3] = zl, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Zu(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const a = Qu(e);
    return e.set(n, a), e.set(o, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const td = "AAlwSFlz", rd = "AAAJcEhZ", nd = "AAAACXBI";
function id(e) {
  let t = e.indexOf(td);
  return t === -1 && (t = e.indexOf(rd)), t === -1 && (t = e.indexOf(nd)), t;
}
const Fl = "[modern-screenshot]", Bt = typeof window < "u", sd = Bt && "Worker" in window, od = Bt && "atob" in window, ad = Bt && "btoa" in window;
var Nl;
const Ls = Bt ? (Nl = window.navigator) == null ? void 0 : Nl.userAgent : "", Ul = Ls.includes("Chrome"), En = Ls.includes("AppleWebKit") && !Ul, Is = Ls.includes("Firefox"), ld = (e) => e && "__CONTEXT__" in e, cd = (e) => e.constructor.name === "CSSFontFaceRule", ud = (e) => e.constructor.name === "CSSImportRule", dd = (e) => e.constructor.name === "CSSLayerBlockRule", Mt = (e) => e.nodeType === 1, Xr = (e) => typeof e.className == "object", Bl = (e) => e.tagName === "image", pd = (e) => e.tagName === "use", jr = (e) => Mt(e) && typeof e.style < "u" && !Xr(e), hd = (e) => e.nodeType === 8, fd = (e) => e.nodeType === 3, Lr = (e) => e.tagName === "IMG", $n = (e) => e.tagName === "VIDEO", md = (e) => e.tagName === "CANVAS", gd = (e) => e.tagName === "TEXTAREA", yd = (e) => e.tagName === "INPUT", bd = (e) => e.tagName === "STYLE", vd = (e) => e.tagName === "SCRIPT", kd = (e) => e.tagName === "SELECT", wd = (e) => e.tagName === "SLOT", xd = (e) => e.tagName === "IFRAME", Sd = (...e) => console.warn(Fl, ...e);
function Cd(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ws = (e) => e.startsWith("data:");
function ql(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Bt && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Bt)
    return e;
  const r = Dn().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Dn(e) {
  return (e && Mt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const zn = "http://www.w3.org/2000/svg";
function Ed(e, t, r) {
  const n = Dn(r).createElementNS(zn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Md(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Rd(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Ad = (e) => Rd(e, "dataUrl");
function Mr(e, t) {
  const r = Dn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Hr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: a } = t ?? {}, c = typeof e == "string" ? Mr(e, Dn(i)) : e;
    let l = null, p = null;
    function s() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(s, n)), $n(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Hr(c.poster, t).then(r) : s();
      if (c.readyState >= 2)
        return s();
      const d = s, u = (m) => {
        a == null || a(
          "Failed video load",
          h,
          m
        ), o == null || o(m), s();
      };
      p = () => {
        c.removeEventListener("loadeddata", d), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = Bl(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return s();
      const d = async () => {
        if (Lr(c) && "decode" in c)
          try {
            await c.decode();
          } catch (m) {
            a == null || a(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              m
            );
          }
        s();
      }, u = (m) => {
        a == null || a(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), s();
      };
      if (Lr(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function Td(e, t) {
  jr(e) && (Lr(e) || $n(e) ? await Hr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Hr(n, t)))
  ));
}
const Wl = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function jl(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Oo = 0;
function Ld(e) {
  const t = `${Fl}[#${Oo}]`;
  return Oo++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Sd(...r)
  };
}
function Id(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Fn(e, t) {
  return ld(e) ? e : Od(e, { ...t, autoDestruct: !0 });
}
async function Od(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Bt ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Bt ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
    debug: o,
    fetch: {
      requestInit: Id((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Ld(o),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Hl(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(zn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: sd && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var v, S, k, w;
          const { url: x, result: y } = g.data;
          y ? (S = (v = p.get(x)) == null ? void 0 : v.resolve) == null || S.call(v, y) : (w = (k = p.get(x)) == null ? void 0 : k.reject) == null || w.call(k, new Error(`Error receiving message from worker: ${x}`));
        }, f.onmessageerror = (g) => {
          var y, v;
          const { url: x } = g.data;
          (v = (y = p.get(x)) == null ? void 0 : y.reject) == null || v.call(y, new Error(`Error receiving message from worker: ${x}`));
        }, f;
      } catch (f) {
        return s.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Cd(c) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: p,
    drawImageCount: 0,
    tasks: [],
    features: a,
    isEnable: (f) => f === "restoreScrollPosition" ? typeof a == "boolean" ? !1 : a[f] ?? !1 : typeof a == "boolean" ? a : a[f] ?? !0,
    shadowRoots: []
  };
  s.log.time("wait until load"), await Td(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: d } = _d(e, s);
  return s.width = h, s.height = d, s;
}
function Hl(e) {
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
function _d(e, t) {
  let { width: r, height: n } = t;
  if (Mt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Nd(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const a = await Hr(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Pd(e.ownerDocument, t), p = () => {
    try {
      l == null || l.drawImage(a, 0, 0, c.width, c.height);
    } catch (s) {
      t.log.warn("Failed to drawImage", s);
    }
  };
  if (p(), t.isEnable("fixSvgXmlDecode"))
    for (let s = 0; s < i; s++)
      await new Promise((h) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, c.width, c.height), p(), h();
        }, s + o);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function Pd(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && o && (l.fillStyle = o, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function Vl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Mr(o, e.ownerDocument);
    } catch (o) {
      t.log.warn("Failed to clone canvas", o);
    }
  const r = e.cloneNode(!1), n = e.getContext("2d"), i = r.getContext("2d");
  try {
    return n && i && i.putImageData(
      n.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), r;
  } catch (o) {
    t.log.warn("Failed to clone canvas", o);
  }
  return r;
}
function $d(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Os(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Dd(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function zd(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Mr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Hr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Mr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const a = o.getContext("2d");
      a && a.drawImage(r, 0, 0, o.width, o.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Mr(e.poster, e.ownerDocument) : r;
    }
    return Vl(o, t);
  }
  return r;
}
function Fd(e, t) {
  return md(e) ? Vl(e, t) : xd(e) ? $d(e, t) : Lr(e) ? Dd(e) : $n(e) ? zd(e, t) : e.cloneNode(!1);
}
function Ud(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Wl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Bd = [
  "width",
  "height",
  "-webkit-text-fill-color"
], qd = [
  "stroke",
  "fill"
];
function Yl(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = Xr(e) && i !== "svg", a = o ? qd.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    a.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Ud(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, d;
  o ? (h = s.createElementNS(zn, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, g]) => {
    d.setAttributeNS(null, f, g);
  }), h.appendChild(d)) : h = d = s.createElement(i), d.textContent = " ", s.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    Bd.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return s.body.removeChild(h), n.set(c, m), m;
}
function Gl(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], o = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      a(l);
  else
    for (let l = e.length, p = 0; p < l; p++) {
      const s = e.item(p);
      a(s);
    }
  for (let l = i.length, p = 0; p < l; p++)
    (c = o.get(i[p])) == null || c.forEach((s, h) => n.set(h, s));
  function a(l) {
    const p = e.getPropertyValue(l), s = e.getPropertyPriority(l), h = l.lastIndexOf("-"), d = h > -1 ? l.substring(0, h) : void 0;
    if (d) {
      let u = o.get(d);
      u || (u = /* @__PURE__ */ new Map(), o.set(d, u)), u.set(l, [p, s]);
    }
    t.get(l) === p && !s || (d ? i.push(d) : n.set(l, [p, s]));
  }
  return n;
}
function Wd(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), p = Yl(e, null, n);
  a == null || a.forEach((f, g) => {
    p.delete(g);
  });
  const s = Gl(l, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Ul && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((d = s.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = s.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return s.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), s;
}
function jd(e, t) {
  (gd(e) || yd(e) || kd(e)) && t.setAttribute("value", e.value);
}
const Hd = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Vd = [
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
function Yd(e, t, r, n, i) {
  const { ownerWindow: o, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !o)
    return;
  function p(s) {
    var v;
    const h = o.getComputedStyle(e, s);
    let d = h.getPropertyValue("content");
    if (!d || d === "none")
      return;
    i == null || i(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [Wl()], m = Yl(e, s, n);
    l == null || l.forEach((S, k) => {
      m.delete(k);
    });
    const f = Gl(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((v = f.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${d}';`
    ];
    if (f.forEach(([S, k], w) => {
      g.push(`${w}: ${S}${k ? " !important" : ""};`);
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
    let y = c.get(x);
    y || (y = [], c.set(x, y)), y.push(`.${u[0]}${s}`);
  }
  Hd.forEach(p), r && Vd.forEach(p);
}
const _o = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function No(e, t, r, n, i) {
  if (Mt(r) && (bd(r) || vd(r)) || n.filter && !n.filter(r))
    return;
  _o.has(t.nodeName) || _o.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await Os(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Gd(e, o), t.appendChild(o);
}
async function Po(e, t, r, n) {
  var o;
  let i = e.firstChild;
  Mt(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!hd(a))
      if (Mt(a) && wd(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await No(e, t, c[l], r, n);
      } else
        await No(e, t, a, r, n);
}
function Gd(e, t) {
  if (!jr(e) || !jr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a, b: c, c: l, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = a, o.b = c, o.c = l, o.d = p, t.style.transform = o.toString();
}
function Kd(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) a[c] = o[c];
}
const Xd = /^[\w-:]+$/;
async function Os(e, t, r = !1, n) {
  var p, s, h, d;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && fd(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && Mt(e) && (jr(e) || Xr(e))) {
    const u = await Fd(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const v = u.getAttributeNames();
      for (let S = v.length, k = 0; k < S; k++) {
        const w = v[k];
        Xd.test(w) || u.removeAttribute(w);
      }
    }
    const m = t.currentNodeStyle = Wd(e, u, r, t);
    r && Kd(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const v = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = v.includes("scroll") || (v.includes("auto") || v.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = jl((d = m.get("font-family")) == null ? void 0 : d[0]), y = x ? (v) => {
      g === "uppercase" ? v = v.toUpperCase() : g === "lowercase" ? v = v.toLowerCase() : g === "capitalize" && (v = v[0].toUpperCase() + v.substring(1)), x.forEach((S) => {
        let k = a.get(S);
        k || a.set(S, k = /* @__PURE__ */ new Set()), v.split("").forEach((w) => k.add(w));
      });
    } : void 0;
    return Yd(
      e,
      u,
      f,
      t,
      y
    ), jd(e, u), $n(e) || await Po(
      e,
      u,
      t,
      y
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Po(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function Jd(e) {
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
function Zd(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), a = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Ad);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function Vr(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: o } = t;
  let a = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: p,
    fetchFn: s,
    fetch: {
      requestInit: h,
      bypassingCache: d,
      placeholderImage: u
    },
    font: m,
    workers: f,
    fontFamilies: g
  } = e;
  n === "image" && (En || Is) && e.drawImageCount++;
  let x = p.get(r);
  if (!x) {
    d && d instanceof RegExp && d.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const y = n.startsWith("font") && m && m.minify, v = /* @__PURE__ */ new Set();
    y && n.split(";")[1].split(",").forEach((M) => {
      g.has(M) && g.get(M).forEach((I) => v.add(I));
    });
    const S = y && v.size, k = {
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
      if (s && n === "image") {
        const w = await s(r);
        if (w)
          return w;
      }
      return !En && r.startsWith("http") && f.length ? new Promise((w, M) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...k }), x.resolve = w, x.reject = M;
      }) : Zd(k);
    })().catch((w) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(o);
      throw w;
    }), p.set(r, x);
  }
  return x.response;
}
async function Kl(e, t, r, n) {
  if (!Xl(e))
    return e;
  for (const [i, o] of Qd(e, t))
    try {
      const a = await Vr(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(ep(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function Xl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Jl = /url\((['"]?)([^'"]+?)\1\)/g;
function Qd(e, t) {
  const r = [];
  return e.replace(Jl, (n, i, o) => (r.push([o, ql(o, t)]), n)), r.filter(([n]) => !ws(n));
}
function ep(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const tp = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function rp(e, t) {
  return tp.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((En || Is) && t.drawImageCount++, Kl(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function np(e, t) {
  if (Lr(e)) {
    const r = e.currentSrc || e.src;
    if (!ws(r))
      return [
        Vr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (En || Is) && t.drawImageCount++;
  } else if (Xr(e) && !ws(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Vr(t, {
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
function ip(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [o, a] = i.split("#");
  if (a) {
    const c = `#${a}`, l = t.shadowRoots.reduce(
      (p, s) => p ?? s.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (o && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (o)
      return [
        Vr(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function Zl(e, t) {
  const { tasks: r } = t;
  Mt(e) && ((Lr(e) || Bl(e)) && r.push(...np(e, t)), pd(e) && r.push(...ip(e, t))), jr(e) && r.push(...rp(e.style, t)), e.childNodes.forEach((n) => {
    Zl(n, t);
  });
}
async function sp(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: o,
    tasks: a,
    font: c
  } = t;
  if (!(!r || !n || !i.size))
    if (c && c.cssText) {
      const l = Do(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), s = p.createElement("style");
      p.head.appendChild(s);
      const h = s.sheet;
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if (ud(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await Vr(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (y) {
              t.log.warn(`Error fetch remote css import from ${f}`, y);
            }
            const x = g.replace(
              Jl,
              (y, v, S) => y.replace(S, ql(S, f))
            );
            for (const y of ap(x))
              try {
                h.insertRule(y, h.cssRules.length);
              } catch (v) {
                t.log.warn("Error inserting rule from remote css import", { rule: y, error: v });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const d = [];
      l.forEach((u) => {
        xs(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return cd(u) && Xl(u.style.getPropertyValue("src")) && ((m = jl(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          Kl(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = Do(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const op = /(\/\*[\s\S]*?\*\/)/g, $o = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function ap(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(op, "");
  for (; ; ) {
    const o = $o.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace($o, "");
  const n = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, i = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let o = n.exec(r);
    if (o)
      i.lastIndex = n.lastIndex;
    else if (o = i.exec(r), o)
      n.lastIndex = i.lastIndex;
    else
      break;
    t.push(o[0]);
  }
  return t;
}
const lp = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, cp = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Do(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(cp, (i) => {
    for (; ; ) {
      const [o, , a] = lp.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${o};`;
    }
  }) : e;
}
function xs(e, t = []) {
  for (const r of Array.from(e))
    dd(r) ? t.push(...xs(r.cssRules)) : "cssRules" in r ? xs(r.cssRules, t) : t.push(r);
  return t;
}
const up = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function dp(e) {
  return up.test(e.innerHTML);
}
async function pp(e, t) {
  const r = await Fn(e, t);
  if (Mt(r.node) && Xr(r.node) && !dp(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: o,
    svgStyleElement: a,
    svgDefsElement: c,
    svgStyles: l,
    font: p,
    progress: s,
    autoDestruct: h,
    onCloneNode: d,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await Os(r.node, r, !0);
  if (a && n) {
    let S = "";
    l.forEach((k, w) => {
      S += `${k.join(`,
`)} {
  ${w}
}
`;
    }), a.appendChild(n.createTextNode(S));
  }
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && Mt(f) && (i.time("embed web font"), await sp(f, r), i.timeEnd("embed web font")), i.time("embed node"), Zl(f, r);
  const g = o.length;
  let x = 0;
  const y = async () => {
    for (; ; ) {
      const S = o.pop();
      if (!S)
        break;
      try {
        await S;
      } catch (k) {
        r.log.warn("Failed to run task", k);
      }
      s == null || s(++x, g);
    }
  };
  s == null || s(x, g), await Promise.all([...Array.from({ length: 4 })].map(y)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const v = hp(f, r);
  return c && v.insertBefore(c, v.children[0]), a && v.insertBefore(a, v.children[0]), h && Jd(r), await (m == null ? void 0 : m(v)), v;
}
function hp(e, t) {
  const { width: r, height: n } = t, i = Ed(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function fp(e, t) {
  var a;
  const r = await Fn(e, t), n = await pp(r), i = Md(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Hl(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(zn, "defs"), r.svgStyles.clear());
  const o = Mr(i, n.ownerDocument);
  return await Nd(o, r);
}
async function mp(e, t) {
  const r = await Fn(e, t), { log: n, quality: i, type: o, dpi: a } = r, c = await fp(r);
  n.time("canvas to data url");
  let l = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && a && od && ad) {
    const [p, s] = l.split(",");
    let h = 0, d = !1;
    if (o === "image/png") {
      const v = id(s);
      v >= 0 ? (h = Math.ceil((v + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = s.substring(0, h), m = s.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let v = 0; v < g.length; v++)
      g[v] = f.charCodeAt(v);
    const x = o === "image/png" ? ed(g, a, d) : Xu(g, a), y = window.btoa(String.fromCharCode(...x));
    l = [p, ",", y, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function gp(e, t) {
  return mp(
    await Fn(e, { ...t, type: "image/png" })
  );
}
const yp = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", bp = 8e3, vp = 16384, zo = 4096, kp = 16e6, wp = 500, xp = 1e4, li = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", Ql = 600, Sp = 1200, Cp = 24, Ep = 1024, it = 32, Mp = 4, ec = 400, Rp = 0.985, Ap = 250;
function tc(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Tp(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return tc(r, location.origin);
}
function Lp(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && tc(t.src || "", location.origin)) return !0;
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
  const o = window.scrollX || window.pageXOffset || 0, a = window.scrollY || window.pageYOffset || 0;
  return i.right + o <= 0 || i.bottom + a <= 0;
}
function ci(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Fo(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Ip(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(zo / i, zo / o), l = Math.min(a, c, Math.sqrt(kp / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(o * l));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: li, scale: 1 };
    s.scale(l, l), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + wp;
    let d = 0;
    const u = () => d >= xp || Date.now() >= h, m = (g, x = !1) => {
      var w;
      if (u() || (d++, !x && t && !t(g))) return;
      const y = getComputedStyle(g);
      if (y.display === "none" || y.visibility === "hidden" || Number(y.opacity) === 0) return;
      const v = g.getBoundingClientRect(), S = v.left - n.left, k = v.top - n.top;
      if (v.width > 0 && v.height > 0) {
        Fo(y.backgroundColor) || (s.fillStyle = y.backgroundColor, s.fillRect(S, k, v.width, v.height));
        const M = parseFloat(y.borderTopWidth);
        M > 0 && y.borderTopStyle !== "none" && !Fo(y.borderTopColor) && (s.strokeStyle = y.borderTopColor, s.lineWidth = M, s.strokeRect(S, k, v.width, v.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(S, k, v.width, v.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(S, k, v.width, v.height));
      }
      for (const M of Array.from(g.childNodes)) {
        if (u()) break;
        if (M instanceof HTMLElement) {
          m(M);
          continue;
        }
        if (!(M.nodeType !== Node.TEXT_NODE || !((w = M.textContent) != null && w.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(M);
            const $ = I.getBoundingClientRect();
            if ($.width <= 0 || $.height <= 0) continue;
            s.save(), s.beginPath(), s.rect($.left - n.left, $.top - n.top, $.width, $.height), s.clip(), s.fillStyle = y.color, s.font = `${y.fontStyle} ${y.fontWeight} ${y.fontSize} ${y.fontFamily}`, s.textBaseline = "top", s.fillText(M.textContent.trim(), $.left - n.left, $.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: li, scale: 1 };
  } catch {
    return { dataUrl: li, scale: 1 };
  }
}
function Op() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function ui(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function _p(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < Cp; o++) {
    const a = i[o];
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
async function Uo(e, t = Ql) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await ui(i.ready, n());
    const o = _p(e);
    o.length && await ui(
      Promise.allSettled(o.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await ui(Op(), Math.min(n(), 50));
  } catch {
  }
}
function rc(e, t) {
  return new Promise((r) => {
    if (typeof Image > "u") {
      r(null);
      return;
    }
    let n = !1;
    const i = new Image(), o = (c) => {
      n || (n = !0, r(c ? i : null));
    }, a = setTimeout(() => o(!1), Math.max(0, t));
    i.onload = () => {
      clearTimeout(a), o(!0);
    }, i.onerror = () => {
      clearTimeout(a), o(!1);
    };
    try {
      i.src = e;
    } catch {
      clearTimeout(a), o(!1);
    }
  });
}
async function Np(e) {
  if (typeof document > "u") return null;
  const t = await rc(e, ec);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = it, r.height = it;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, it, it);
    const { data: i } = n.getImageData(0, 0, it, it);
    let o = 0, a = 0, c = 0;
    for (let p = 0; p < i.length; p += 4) {
      const s = i[p + 3] / 255, h = i[p] * s + 255 * (1 - s), d = i[p + 1] * s + 255 * (1 - s), u = i[p + 2] * s + 255 * (1 - s), m = 0.299 * h + 0.587 * d + 0.114 * u;
      a += m, c += m * m, o++;
    }
    if (!o) return null;
    const l = a / o;
    return c / o - l * l;
  } catch {
    return null;
  }
}
async function di(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Ep) return !0;
  try {
    const i = await Np(e);
    if (i !== null && i <= Mp) return !0;
  } catch {
  }
  return !1;
}
async function Pp(e) {
  if (typeof document > "u") return null;
  const t = await rc(e, ec);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = it, r.height = it;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, it, it);
    const { data: i } = n.getImageData(0, 0, it, it);
    let o = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, p = i[c] * l + 255 * (1 - l), s = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * p + 0.587 * s + 0.114 * h >= Ap && a++, o++;
    }
    return o ? a / o : null;
  } catch {
    return null;
  }
}
async function $p(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Pp(e);
    if (r !== null && r >= Rp) return !0;
  } catch {
  }
  return !1;
}
const Dp = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], zp = /* @__PURE__ */ new Set([
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
function Fp(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Up(e) {
  const t = (e || "").toLowerCase();
  return Dp.some((r) => t.includes(r));
}
const Bp = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function qp(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Bp.test(t);
}
function Wp(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Fp(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Up(r) || n && !zp.has(n) && t.includes("_") && qp(t));
}
function jp(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const o = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!o) return;
    Wp({ fontFamily: o, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const wn = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Hp = 3e3, Vp = 4e3, Bo = 24, qo = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Yp(e, t = Vp) {
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
    const o = await i.blob();
    return await new Promise((a) => {
      try {
        const c = new FileReader();
        c.onload = () => a(typeof c.result == "string" ? c.result : null), c.onerror = () => a(null), c.readAsDataURL(o);
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
function Gp(e) {
  var n, i, o;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < Bo; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Bo; l++) {
        const p = c[l];
        if (!(p && (((n = p.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || p.type === 5))) continue;
        let h = "", d = "";
        try {
          h = (((i = p.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), d = ((o = p.style) == null ? void 0 : o.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !d || t.push({ cssText: p.cssText, family: h, src: d });
      }
  }
  return t;
}
function Kp(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Xp(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Kp(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Jp(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Gp(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), o = e.fetchAsDataUrl ?? ((c) => Yp(c)), a = [];
  for (const c of n) {
    const l = [];
    qo.lastIndex = 0;
    let p;
    for (; (p = qo.exec(c.src)) !== null; ) {
      const u = p[2];
      u && !u.startsWith("data:") && l.push(u);
    }
    if (!l.length) {
      a.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let s = c.cssText, h = !1;
    const d = await Promise.all(l.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await o(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of d)
      m && (s = Xp(s, u, m), h = !0);
    h && (a.push(s), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Zp() {
  try {
    return await Promise.race([
      Jp({}).catch(() => wn),
      new Promise((e) => setTimeout(() => e(wn), Hp))
    ]);
  } catch {
    return wn;
  }
}
function Qp(e, t) {
  return new Promise((r, n) => {
    const i = setTimeout(() => n(new Error(`capture timed out after ${t}ms`)), t);
    e.then(
      (o) => {
        clearTimeout(i), r(o);
      },
      (o) => {
        clearTimeout(i), n(o);
      }
    );
  });
}
async function eh(e, t = {}) {
  return (await th(e, t)).dataUrl;
}
async function th(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, o = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? o, c = t.skipFonts ? wn : await Zp(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const s = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Qp(gp(e, {
      scale: a,
      ...l ?? {},
      font: s,
      onCloneEachNode: (d) => jp(d, c.embeddedFamilies),
      maximumCanvasSize: vp,
      fetch: { placeholderImage: yp },
      filter: (d) => n && !n(d) || Lp(d) ? !1 : Tp(d) ? (r++, !1) : !0
    }), bp);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Uo(e, Ql);
  try {
    let s = await p(), h = await di(s);
    if (h) {
      await Uo(e, Sp);
      try {
        const u = await p();
        await di(u) || (s = u, h = !1);
      } catch {
      }
    }
    r && ci(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && ci("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await $p(s, { skippedImages: r });
    return { dataUrl: s, scale: a, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (s) {
    const h = s instanceof Error ? s.message : String(s);
    ci(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = Ip(e, n, a), u = await di(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const rh = {
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
  archive: '<rect width="20" height="5" x="2" y="3" rx="1" /> <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /> <path d="M10 12h4" />'
};
function nh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function X(e, t = {}) {
  const r = rh[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${nh(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${a}${r}</svg>`;
}
const yr = {
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
function ih(e) {
  const t = (e || "").trim(), r = t.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(r))
    return [parseInt(r[0] + r[0], 16), parseInt(r[1] + r[1], 16), parseInt(r[2] + r[2], 16)];
  if (/^[0-9a-fA-F]{6}$/.test(r))
    return [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)];
  const n = t.match(/rgba?\(([^)]+)\)/i);
  if (n) {
    const i = n[1].split(",").map((o) => parseFloat(o));
    if (i.length >= 3 && i.every((o) => !Number.isNaN(o))) return [i[0], i[1], i[2]];
  }
  return null;
}
function sh(e) {
  const t = ih(e);
  if (!t) return 0;
  const [r, n, i] = t.map((o) => o / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function pi(e) {
  return sh(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class Wo {
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
    const o = pi(r);
    t.lineWidth = n + this.haloPad(n), t.strokeStyle = o, i(), t.stroke(), t.lineWidth = n, t.strokeStyle = r, i(), t.stroke();
  }
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(), t.lineCap = "round", t.lineJoin = "round", r.type === "pen") {
      const n = this.computeLineWidth();
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), r.points.forEach(
          (i, o) => o === 0 ? t.moveTo(i.x, i.y) : t.lineTo(i.x, i.y)
        );
      });
    } else if (r.type === "rect") {
      const n = this.computeLineWidth();
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = pi(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
    } else if (r.type === "arrow") {
      const n = this.computeLineWidth() * 1.7, i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), o = Math.max(16, n * 4);
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
          r.x2 - o * Math.cos(i - Math.PI / 6),
          r.y2 - o * Math.sin(i - Math.PI / 6)
        ), t.moveTo(r.x2, r.y2), t.lineTo(
          r.x2 - o * Math.cos(i + Math.PI / 6),
          r.y2 - o * Math.sin(i + Math.PI / 6)
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = pi(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const n = r.size ?? this.computeFontSize();
      t.font = `bold ${n}px sans-serif`, t.textBaseline = "top";
      const i = r.outline ?? "none";
      i !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, n * 0.18), t.strokeStyle = i === "white" ? "#ffffff" : "#111111", t.strokeText(r.text, r.x, r.y), t.fillStyle = r.color), t.fillText(r.text, r.x, r.y), t.textBaseline = "alphabetic";
    } else r.type === "pixelate" && this.drawPixelate(t, r);
  }
  /** Redaction: replace the pixels inside the region with a coarse mosaic (block-averaged colours). Reads
   *  back what's already painted (base image + any earlier shapes) so the redaction bakes into save()/export.
   *  No-ops safely on headless/tainted canvases (getImageData throws) — the region just isn't redacted. */
  drawPixelate(t, r) {
    const n = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), i = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), o = Math.min(this.canvas.width - n, Math.ceil(Math.abs(r.w))), a = Math.min(this.canvas.height - i, Math.ceil(Math.abs(r.h)));
    if (o <= 0 || a <= 0) return;
    const c = Math.max(8, Math.round(this.canvas.width / 90));
    let l;
    try {
      l = t.getImageData(n, i, o, a);
    } catch {
      l = void 0;
    }
    if (!l || !l.data) {
      t.fillStyle = "rgba(30,30,40,1)", t.fillRect(n, i, o, a);
      return;
    }
    const p = l.data;
    for (let s = 0; s < a; s += c)
      for (let h = 0; h < o; h += c) {
        let d = 0, u = 0, m = 0, f = 0;
        const g = Math.min(s + c, a), x = Math.min(h + c, o);
        for (let y = s; y < g; y++)
          for (let v = h; v < x; v++) {
            const S = (y * o + v) * 4;
            d += p[S], u += p[S + 1], m += p[S + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(d / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + s, x - h, g - s));
      }
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function oh(e, t, r) {
  const n = {
    type: e.type,
    description: e.description,
    context: e.context,
    screenshots: e.screenshots,
    settings: t,
    ...e.projectId ? { projectId: e.projectId } : {},
    replayEvents: e.replayEvents
  };
  if (t.backendUrl) {
    if (!r.backend) throw new Error("No handler for backend mode");
    return r.backend(n);
  }
  const i = r[t.integration];
  if (!i) throw new Error(`No handler for integration: ${t.integration}`);
  return i(n);
}
const ah = 50, lh = 2e3, ch = 1e3, uh = 500, jo = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function an(e, t) {
  e.push(t), e.length > ah && e.shift();
}
function _s(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function hi(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      jo.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => jo.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return _s(t, ch);
}
function dh(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return _s(JSON.stringify(e), uh);
  } catch {
    return String(e);
  }
}
function ph(e, t = {}) {
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
function hh(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, s) => {
    an(e.consoleErrors, { message: _s(p, lh), stack: s, timestamp: Date.now(), level: l });
  }, o = window.onerror;
  if (window.onerror = (l, p, s, h, d) => {
    var u;
    if (n()) {
      const m = String(l);
      i("error", m, d == null ? void 0 : d.stack), (u = t.onError) == null || u.call(t, m, d == null ? void 0 : d.stack);
    }
    return typeof o == "function" ? o.call(window, l, p, s, h, d) : !1;
  }, window.addEventListener("unhandledrejection", (l) => {
    var h;
    if (!n()) return;
    const p = l.reason, s = String((p == null ? void 0 : p.message) ?? p);
    i("error", s, p == null ? void 0 : p.stack), (h = t.onError) == null || h.call(t, s, p == null ? void 0 : p.stack);
  }), t.consoleLevels) {
    const l = ["log", "info", "warn", "error"];
    for (const p of l) {
      const s = console[p];
      typeof s == "function" && (console[p] = (...h) => {
        try {
          n() && i(p, h.map(dh).join(" "));
        } catch {
        }
        return s.apply(console, h);
      });
    }
  }
  const a = window.fetch;
  window.fetch = async (...l) => {
    var d;
    if (!n()) return a(...l);
    const p = Date.now(), s = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (d = l[1]) == null ? void 0 : d.method) || "GET";
    try {
      const u = await a(...l);
      return an(e.networkFailures, { url: hi(s), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw an(e.networkFailures, { url: hi(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, p = c.prototype.send;
    c.prototype.open = function(s, h, ...d) {
      return this.__klav = { method: String(s || "GET").toUpperCase(), url: String(h || "") }, l.call(this, s, h, ...d);
    }, c.prototype.send = function(...s) {
      const h = this.__klav;
      if (h && n()) {
        const d = Date.now();
        this.addEventListener("loadend", () => {
          try {
            an(e.networkFailures, {
              url: hi(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: d,
              durationMs: Date.now() - d
            });
          } catch {
          }
        });
      }
      return p.apply(this, s);
    };
  }
  return e;
}
const fh = ["light", "dark", "glass", "neon", "custom", "liquid"], mh = ["hidden", "icon", "full", "custom"], gh = ["lightbulb", "bug"], yh = ["full", "reportOnly", "off"], bh = /^#[0-9a-fA-F]{3,8}$/, vh = /^[\w \-,'"().]+$/, Ho = (e) => typeof e == "object" && e !== null, ln = (e) => typeof e == "string" && bh.test(e.trim()) ? e.trim() : void 0, cn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, kh = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && vh.test(t) ? t : void 0;
}, Vo = {
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
function Yo(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function nc(e) {
  const t = Ho(e) ? e : {}, n = { theme: typeof t.theme == "string" && fh.includes(t.theme) ? t.theme : "light" }, i = ln(t.primary), o = ln(t.secondary), a = ln(t.background), c = cn(t.thankYou, 140), l = kh(t.font);
  i && (n.primary = i), o && (n.secondary = o), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && mh.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = cn(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = ln(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && gh.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && yh.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = cn(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = Ho(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = cn(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function wh(e) {
  const t = nc(e), r = t.theme === "custom" ? { ...Vo.light } : { ...Vo[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Yo(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Yo(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
const We = class We {
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
    this._recording || !We.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), We.SESSION_MS), this._begin());
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
      if (i && i in We.TERMINAL_ERRORS) {
        this.onError(i, We.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > We.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? We.BENIGN_RESTART_MS : Math.min(We.MAX_BACKOFF_MS, We.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
We.MAX_CONSEC_FAILURES = 6, We.BASE_BACKOFF_MS = 400, We.MAX_BACKOFF_MS = 8e3, We.BENIGN_RESTART_MS = 250, We.SESSION_MS = 18e4, We.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Ur = We;
function xh() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Sh = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Ch(e) {
  for (const t of Sh)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Er = class Er {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...xh(), ...t.deps || {} };
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
    this._stream = t, this._mime = Ch(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Er.MAX_SESSION_MS), this._beginSegment();
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
      }, Er.SEGMENT_MS);
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
      let o = null;
      try {
        o = await this._transcribe(i);
      } catch {
        o = null;
      }
      if (o === null) {
        if (r) {
          this._teardown(!1), this.onUnavailable();
          return;
        }
        this.onStatus("retrying", "Reconnecting dictation…");
      } else {
        this._firstSegment === !1 && this.onStatus("idle", "");
        const a = (o.text || "").trim();
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
        var o;
        return (o = i.stop) == null ? void 0 : o.call(i);
      });
    } catch {
    }
    this._stream = null, this._recorder && (this._recorder.ondataavailable = null, this._recorder.onstop = null, this._recorder = null), t && this.onStop();
  }
};
Er.SEGMENT_MS = 5e3, Er.MAX_SESSION_MS = 18e4;
let Mn = Er;
function Eh(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function _e(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const Mh = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Jt(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (Mh.has(c.tagName)) return NodeFilter.FILTER_REJECT;
        c = c.parentElement;
      }
      return /\d/.test(a.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let o;
  for (; o = n.nextNode(); ) i.push(o);
  for (const a of i) {
    const l = (a.textContent ?? "").split(/(\d+)/);
    if (l.length <= 1) continue;
    const p = a.parentNode, s = a.nextSibling, h = l.map((d, u) => {
      if (u % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = d, m;
      }
      return document.createTextNode(d);
    });
    _e(a);
    for (const d of h) p.insertBefore(d, s);
    t.push({ parent: p, original: a, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((a) => {
    const c = a.value;
    /\d/.test(c) && (r.push({ el: a, original: c }), a.value = "█".repeat(c.length));
  }), () => {
    for (const { parent: a, original: c, replacements: l } of t) {
      const p = l[0];
      if ((p == null ? void 0 : p.parentNode) === a) {
        a.insertBefore(c, p);
        for (const s of l) s.parentNode === a && _e(s);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const ic = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Rh = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, Ah = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Th = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Lh = /* @__PURE__ */ new Set([
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
]), Ih = { needs: "Needs detail", good: "Good", great: "Great" };
function Oh(e) {
  let t = e;
  for (const r of ic) t = t.split(r).join(" ");
  return t;
}
function _h(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Lh.has(n) || r++;
  return r;
}
function sc(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Oh(r), i = _h(n), o = t.length > 0 && ic.some((d) => r.includes(d)) && i < 3, a = i >= 3 && t.length >= 12, c = Th.test(r), l = Rh.test(r) || Ah.test(t), p = { problem: a, expected: c, repro: l }, s = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = s >= 3 ? "great" : s === 2 ? "good" : "needs";
  return { score: s, coverage: p, level: h, label: Ih[h], vague: o };
}
function Nh(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : sc(t).level !== "great";
}
const Ph = [
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
function $h(e) {
  const t = (e || "").toLowerCase();
  return t ? Ph.some((r) => t.includes(r)) : !1;
}
function oc(e) {
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
function ac(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", oc(t.source)],
    ["utm_medium", t.medium || "widget"],
    ["utm_campaign", t.campaign]
  ];
  t.ref && n.push(["utm_content", t.ref]);
  try {
    for (const [i, o] of n)
      o && !r.searchParams.has(i) && r.searchParams.set(i, o);
    return r.toString();
  } catch {
    return e;
  }
}
const Dh = 1, zh = 6, Fh = 1.08;
function Uh(e, t = Dh, r = zh) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Bh(e, t = Fh) {
  return e < 0 ? t : 1 / t;
}
function qh(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function lc(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Wh(e, t, r, n, i, o) {
  const a = (e - r.left - o.panX) / n, c = (t - r.top - o.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function jh(e, t, r, n, i, o) {
  const a = lc(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(o, Math.max(0, u)), p = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, s = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, d = a > 0 ? l((e.bottom - t.top - r.panY) / a) : o;
  return { x: p, y: h, w: Math.max(0, s - p), h: Math.max(0, d - h) };
}
function Hh(e, t, r, n, i, o) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * o : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(o, Math.max(0, c)) };
}
function Vh(e, t, r, n, i, o) {
  const a = lc(n, o) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function Yh(e) {
  return ac("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || oc()
  });
}
function Gh(e) {
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
function Kh(e, t, r) {
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
function lt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Go(e) {
  let t = lt(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Ko(e) {
  let t = "";
  const r = (n) => {
    for (const i of Array.from(n.childNodes))
      if (i.nodeType === 3)
        t += i.textContent || "";
      else if (i.nodeName === "BR")
        t += `
`;
      else if (i.nodeType === 1) {
        const o = i;
        /^(DIV|P)$/.test(o.nodeName) && t && !t.endsWith(`
`) && (t += `
`), r(o);
      }
  };
  return r(e), t;
}
function Xh(e) {
  const t = [];
  e.summary && t.push(`*${e.summary}*`);
  const r = [];
  if (e.actualResult && r.push(`*Actual:* ${e.actualResult}`), e.expectedResult && r.push(`*Expected:* ${e.expectedResult}`), r.length && t.push(r.join(`
`)), e.stepsToReproduce && e.stepsToReproduce.length) {
    const n = e.stepsToReproduce.map((i, o) => `${o + 1}. ${i}`).join(`
`);
    t.push(`*Steps to reproduce:*
${n}`);
  }
  return (e.suggestedSeverity || e.suggestedPriority) && t.push(`*Severity: ${e.suggestedSeverity}* · Priority: ${e.suggestedPriority}`), t.join(`

`);
}
function Xo(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function Jo(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Ct(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp };
}
function Jh(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function Zh(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Qh = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function cc(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function ef(e) {
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
const tf = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", rf = 100, nf = rf * 1024 * 1024;
function sf(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function mr(e) {
  return cc(e) ? "video" : sf(e) ? "image" : "file";
}
function of(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", o = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: o, cta: a };
}
function un(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function af(e, t, r = {}) {
  var ko, wo, xo, So;
  const n = nc(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], l = !1, p = [], s = [], h = [], d = [], u = !1;
  const m = !!t.onMinimize, f = m ? 8 : 5, g = 15e3, x = 10 * 1024 * 1024, y = !!t.allowFileAttachments, v = 5, S = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : nf, k = t.reporterRole ?? "anon", w = t.upgradeUrl, M = Math.max(120 * 1024 * 1024, S + 20 * 1024 * 1024);
  let I = [], $ = null;
  const _ = !!(t.allowRecording && t.onRecord), Q = Eh({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Mn.isSupported(),
    webSpeechSupported: Ur.isSupported()
  }), V = Q !== "none", L = 2;
  let Le = [];
  const ze = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, K = {};
  let ee = null;
  const Te = () => {
    const b = Object.keys(K);
    if (!b.length && !ee) return null;
    const R = {};
    if (b.length) {
      const E = {};
      for (const A of b) E[A] = K[A];
      const C = K[0] ?? K[Number(b[0])] ?? {};
      Object.assign(R, C, { byIndex: E });
    }
    return ee && (R.selector = ee.selector, R.selectorText = ee.text), R;
  };
  let Me = e, ae = 0, J = null, be = null, D = null, et = t.replayState === "attached", Be = null, gt = null, Ce = null, Pe = !1;
  const At = 4e3, yt = 5e3, H = {}, ue = {}, ge = (b) => b ? JSON.parse(JSON.stringify(b)) : null, Ee = (b) => ({
    url: c[b],
    compressed: p[b],
    ann: ge(K[b])
  }), $e = (b) => {
    (H[b] ?? (H[b] = [])).push(Ee(b));
  }, ye = (b, R) => {
    c[b] = R.url, p[b] = R.compressed, R.ann ? K[b] = ge(R.ann) : delete K[b];
  }, lr = (b) => {
    const R = H[b];
    if (!R || !R.length) return !1;
    const E = R.pop(), C = ue[b];
    for (; C && C.length && C[C.length - 1].mark >= R.length; ) C.pop();
    return ye(b, E), ke(), !0;
  }, Mu = (b) => {
    const R = ue[b];
    if (!R || !R.length) return !1;
    const { snap: E, mark: C } = R.pop();
    return H[b] && (H[b].length = Math.min(H[b].length, C)), ye(b, E), ke(), !0;
  }, Qs = document.createElement("style");
  Qs.textContent = `
    ${wh(n)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    /* height:94vh (definite, not just max-height) + grid-template-rows:minmax(0,1fr) so the row has a
       resolved height. This is what makes the hero canvas's object-fit:contain actually shrink a tall
       screenshot to fit (KLAVITYKLA-402) instead of the tall image blowing out the row and pushing the
       right-pane Submit button below the clipped fold. min-height:0 tracks let both panes scroll internally. */
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;width:92vw;max-width:min(1160px,92vw);height:94vh;max-height:94vh;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom center;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) 384px;grid-template-rows:minmax(0,1fr);}
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
    .kl-hhint{color:#7d879f;font-size:11px;font-weight:600;white-space:nowrap;}
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
    .kl-minimap-vp{position:absolute;box-sizing:border-box;border:2px solid var(--kl-accent,#6c63ff);background:color-mix(in srgb,var(--kl-accent,#6c63ff) 20%,transparent);box-shadow:0 0 0 9999px rgba(0,0,0,.3);pointer-events:none;}
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible,.kl-hlogo:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    @media (max-width:760px){.kl-hhint{display:none;}}
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
    .klavity-retake{margin-top:5px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:700;line-height:1;padding:5px 6px;border:none;border-radius:7px;background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);color:var(--kl-accent);cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,box-shadow .15s ease;will-change:transform;}
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
    .klavity-clarity .kl-clr-tip{margin-top:9px;font-size:12px;background:color-mix(in srgb,var(--kl-accent) 6%,var(--kl-input-bg));border:1px solid color-mix(in srgb,var(--kl-accent) 25%,transparent);border-radius:9px;padding:8px 10px;display:flex;gap:7px;line-height:1.45;color:var(--kl-fg);}
    .klavity-clarity .kl-clr-tip[hidden]{display:none;}
    .klavity-clarity .kl-clr-tip .kl-clr-ai{flex:0 0 auto;color:var(--kl-accent);margin-top:1px;}
    .klavity-clarity .kl-clr-tip .kl-clr-aitag{font-size:9px;font-weight:800;color:var(--kl-on-accent);background:var(--kl-accent);padding:1px 5px;border-radius:999px;margin-left:4px;vertical-align:middle;}
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
  `, a.appendChild(Qs);
  const cr = document.createElement("div");
  cr.className = "klavity-overlay";
  const te = document.createElement("div");
  te.className = "klavity-modal", te.innerHTML = `
    ${m ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${X("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${X("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${ze ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${ze.map((b) => `<button type="button" class="kl-type-chip${b.value === e ? " active" : ""}" data-kind="${lt(b.value)}" role="radio" aria-checked="${b.value === e ? "true" : "false"}">${lt(b.label)}${b.mappingLabel ? `<span class="kl-type-map">${lt(b.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${X("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${X("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${X("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant, but re-renders the page (may miss cross-origin images or embedded frames). Use Screen for a pixel-perfect shot."><span class="kl-cap-ic">${X("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${y ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${X(y ? "paperclip" : "image")}</span><span class="kl-upload-label">${y ? "Attach" : "Upload"}</span></button>
        ${_ ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${X("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${X("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${X("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${y ? tf : "image/*,.heic,.heif"}" multiple style="display:none">
      ${y ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(S / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${f} images</div>
        ${V ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${X("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${y ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${y ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${X("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${X("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${X("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${X("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      ${V ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
      ${n.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
        <div class="kl-clr-tip" id="klavity-clarity-tip" hidden><span class="kl-clr-ai">${X("lightbulb", { size: 14 })}</span><span id="klavity-clarity-tip-text"></span></div>
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${lt(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, cr.appendChild(te), a.appendChild(cr);
  const ve = a.getElementById("klavity-sharp"), eo = a.querySelector(".klavity-info-pop");
  if (ve && eo) {
    const b = document.createElement("div");
    b.className = "kl-float-tip", b.setAttribute("role", "tooltip"), b.innerHTML = eo.innerHTML, a.appendChild(b);
    const R = () => {
      const C = ve.getBoundingClientRect(), A = Math.min(228, window.innerWidth - 16), T = 8, O = window.innerWidth, F = window.innerHeight, P = C.left + C.width / 2 - A / 2, z = Math.max(T, Math.min(P, O - A - T));
      b.style.left = z + "px", b.style.top = "-9999px", b.style.visibility = "hidden", b.style.display = "block";
      const q = b.offsetHeight;
      b.style.display = "", b.style.visibility = "";
      let W = C.bottom + 8;
      W + q + T > F && (W = C.top - q - 8), W = Math.max(T, Math.min(W, F - q - T)), b.style.top = W + "px", b.classList.add("kl-show");
    }, E = () => b.classList.remove("kl-show");
    ve.addEventListener("mouseenter", R), ve.addEventListener("mouseleave", E), ve.addEventListener("focus", R), ve.addEventListener("blur", E);
  }
  let to = !1, Nr = null;
  function Jn() {
    try {
      Nr == null || Nr.remove();
    } catch {
    }
    Nr = null;
    try {
      ve == null || ve.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Ru() {
    var P;
    if (to || !ve || Pe) return;
    to = !0;
    const b = document.createElement("div");
    b.className = "kl-float-tip kl-nudge", b.setAttribute("role", "status"), b.setAttribute("aria-live", "polite"), b.innerHTML = `<div class="kl-nudge-row"><span><b>Get pixel-perfect screenshots by sharing</b> — try it now.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${X("x", { size: 13 })}</button></div>`, a.appendChild(b), Nr = b;
    const R = ve.getBoundingClientRect(), E = Math.min(228, window.innerWidth - 16), C = 8, A = window.innerWidth, T = window.innerHeight;
    b.style.left = Math.max(C, Math.min(R.left + R.width / 2 - E / 2, A - E - C)) + "px", b.style.top = "-9999px", b.style.visibility = "hidden", b.style.display = "block";
    const O = b.offsetHeight;
    b.style.display = "", b.style.visibility = "";
    let F = R.bottom + 8;
    F + O + C > T && (F = R.top - O - 8), b.style.top = Math.max(C, Math.min(F, T - O - C)) + "px", b.classList.add("kl-show"), (P = b.querySelector(".kl-nudge-x")) == null || P.addEventListener("click", Jn);
    try {
      ve.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Jn(), 9e3);
    } catch {
    }
    ve.addEventListener("click", Jn, { once: !0 });
  }
  function Au(b) {
    et = b === "attached", kt();
  }
  const ro = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (b, R, E, C, A) => tt(b, R, E, !1, !!C, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (b, R, E, C, A) => tt(b, R, E, !0, !!C, A),
    close: ur,
    setReplayState: Au,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (b) => {
      if ($ = un(b), !Pe)
        try {
          ke(), ei();
        } catch {
        }
    }
  };
  function ke() {
    const b = a.getElementById("klavity-strip"), R = a.getElementById("klavity-counter");
    b.innerHTML = "", c.forEach((E, C) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb", C === ae && A.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = E, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && A.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        ae = C, J = null, be = null, ke();
      });
      const O = document.createElement("button");
      O.className = "klavity-rm", O.innerHTML = X("x", { size: 13 }), O.title = "Remove", O.addEventListener("click", (z) => {
        var q;
        z.stopPropagation(), c.splice(C, 1), p.splice(C, 1), s.splice(C, 1), h.splice(C, 1), d.splice(C, 1);
        try {
          (q = t.onShotRemoved) == null || q.call(t, C);
        } catch {
        }
        delete K[C];
        for (const W of Object.keys(K).map(Number).filter((j) => j > C).sort((j, pe) => j - pe))
          K[W - 1] = K[W], delete K[W];
        delete H[C], delete ue[C];
        for (const W of Object.keys(H).map(Number).filter((j) => j > C).sort((j, pe) => j - pe))
          H[W - 1] = H[W], delete H[W];
        for (const W of Object.keys(ue).map(Number).filter((j) => j > C).sort((j, pe) => j - pe))
          ue[W - 1] = ue[W], delete ue[W];
        c.length === 0 && wt(null), ke();
      });
      const F = document.createElement("button");
      F.className = "klavity-mk", F.innerHTML = X("pencil", { size: 13 }), F.title = "Mark up", F.addEventListener("click", (z) => {
        z.stopPropagation(), Bu(C);
      }), A.append(T, O, F);
      const P = s[C];
      if (P) {
        const z = Qh[P], q = document.createElement("span");
        if (q.className = "klavity-qb kl-q-" + P, q.title = P === "real-pixel" ? "Pixel-perfect capture (every image included)" : P === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", q.innerHTML = X(z.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + lt(z.label) + "</span>", A.appendChild(q), z.degraded && t.onRetakeSharp) {
          const W = document.createElement("button");
          W.type = "button", W.className = "klavity-retake", W.innerHTML = X("zap", { size: 11 }) + "<span>Retake sharp</span>", W.title = "Recapture this shot at full pixel quality", W.addEventListener("click", (j) => {
            j.stopPropagation(), Tu(C, W);
          }), A.appendChild(W);
        }
      }
      if (no.has(C)) {
        const z = document.createElement("div");
        z.className = "klavity-retake-note", z.textContent = "Markup cleared for the retake.", A.appendChild(z);
      }
      b.appendChild(A);
    }), I.forEach((E, C) => {
      if (mr(E) !== "video") return;
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb", J === C && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = X("play", { size: 16 });
      const F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = X("play", { size: 9 }) + "<span>Video</span>", A.title = "Click to play " + E.name, A.addEventListener("click", () => {
        J = C, be = null, ke();
      });
      const P = document.createElement("button");
      P.className = "klavity-rm", P.innerHTML = X("x", { size: 13 }), P.title = "Remove", P.addEventListener("click", (q) => {
        q.stopPropagation(), so(C);
      }), A.append(T, O, F, P);
      const z = un($);
      if (z != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const W = document.createElement("i");
        W.style.width = z + "%", q.appendChild(W), A.appendChild(q);
      }
      b.appendChild(A);
    }), Le.forEach((E, C) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb kl-rec-tile", be === C && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = X("play", { size: 16 });
      const F = Math.round(E.durationMs / 1e3), P = document.createElement("span");
      P.className = "kl-video-badge", P.innerHTML = X("play", { size: 9 }) + `<span>${Math.floor(F / 60)}:${String(F % 60).padStart(2, "0")}${E.screenOnly ? " · screen" : ""}</span>`, A.title = "Click to play your recording", A.addEventListener("click", () => {
        be = C, J = null, ke();
      });
      const z = document.createElement("button");
      z.type = "button", z.className = "kl-rerec", z.innerHTML = X("refresh-cw", { size: 12 }), z.title = "Re-record", z.setAttribute("aria-label", "Re-record"), z.addEventListener("click", (j) => {
        var pe;
        j.stopPropagation(), Le.splice(C, 1), be === C ? be = null : be != null && be > C && (be -= 1), ti();
        try {
          (pe = a.getElementById("klavity-record")) == null || pe.click();
        } catch {
        }
      });
      const q = document.createElement("button");
      q.className = "klavity-rm", q.innerHTML = X("x", { size: 13 }), q.title = "Remove", q.addEventListener("click", (j) => {
        j.stopPropagation(), Le.splice(C, 1), be === C ? be = null : be != null && be > C && (be -= 1), ti();
      }), A.append(T, O, P, z, q);
      const W = un($);
      if (W != null) {
        const j = document.createElement("div");
        j.className = "kl-att-prog";
        const pe = document.createElement("i");
        pe.style.width = W + "%", j.appendChild(pe), A.appendChild(j);
      }
      b.appendChild(A);
    });
    try {
      const E = b.children[ae];
      E && typeof E.scrollIntoView == "function" && E.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const E = document.createElement("div");
      E.className = "kl-thumb-skel kl-loading", E.setAttribute("role", "status"), E.setAttribute("aria-label", "Capturing screenshot"), E.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', b.appendChild(E);
    }
    R.textContent = `${c.length}/${f} images`, R instanceof HTMLElement && (R.hidden = c.length === 0), kt(), tn(), bo();
  }
  function tn() {
    const b = a.getElementById("klavity-sharphint");
    if (!b) return;
    if (c.length > 0 && ae >= 0 && ae < c.length && !!h[ae] && !u && !!t.onCaptureSharp && !ot) {
      if (!b.dataset.built) {
        b.dataset.built = "1", b.innerHTML = "";
        const C = document.createElement("span");
        C.className = "kl-sh-ic", C.innerHTML = X("triangle-alert", { size: 15 });
        const A = document.createElement("span");
        A.className = "kl-sh-txt", A.textContent = "Some areas can't be captured this way (embedded frames or cross-origin images) - click Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          u = !0, tn(), ve == null || ve.click();
        });
        const O = document.createElement("button");
        O.type = "button", O.className = "kl-sh-x", O.setAttribute("aria-label", "Dismiss"), O.title = "Dismiss", O.innerHTML = X("x", { size: 12 }), O.addEventListener("click", () => {
          u = !0, tn();
        }), b.append(C, A, T, O);
      }
      b.hidden = !1, ve == null || ve.classList.add("kl-suggest");
    } else
      b.hidden = !0, ve == null || ve.classList.remove("kl-suggest");
  }
  function bt(b) {
    const R = a.getElementById("klavity-err");
    R && (R.textContent = b, R.style.display = "block");
  }
  function Zn() {
    const b = a.getElementById("klavity-err");
    b && (b.style.display = "none");
  }
  function tt(b, R, E, C = !0, A = !1, T) {
    var O;
    if (c.length >= f) {
      bt(`You can attach up to ${f} images.`);
      return;
    }
    if (Zn(), c.push(b), p.push(t.compressImage ? t.compressImage(b) : Promise.resolve(b)), s.push(R), h.push(A && R !== "real-pixel"), d.push(T), C && (ae = c.length - 1, J = null, be = null), ke(), C)
      try {
        (O = t.onShotAdded) == null || O.call(t, b, R);
      } catch {
      }
  }
  const no = /* @__PURE__ */ new Set();
  async function Tu(b, R) {
    if (!(ot || !t.onRetakeSharp)) {
      He(!0), R.classList.add("kl-loading"), o.style.display = "none";
      try {
        const E = i ? Jt(document.body) : null;
        let C;
        try {
          C = await t.onRetakeSharp(d[b]);
        } finally {
          E == null || E();
        }
        if (C) {
          const { dataUrl: A, quality: T } = Ct(C);
          A && (c[b] = A, p[b] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), s[b] = T ?? "real-pixel", h[b] = !1, K[b] && (delete K[b], no.add(b)), delete H[b], delete ue[b]);
        }
      } catch {
      } finally {
        o.style.display = "", He(!1), ke();
      }
    }
  }
  function io(b) {
    return b.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(b.name);
  }
  async function Qn(b) {
    Zn();
    for (const R of b) {
      if (c.length >= f) {
        bt(`You can attach up to ${f} images.`);
        break;
      }
      if (!io(R)) {
        bt(`"${R.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (R.size > x) {
        bt(`"${R.name}" is too large — images must be under ${Math.round(x / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        tt(await Zo(R));
      } catch {
        bt(`Couldn't add "${R.name}". Please try a different image.`);
      }
    }
  }
  function ei() {
    const b = a.getElementById("klavity-files");
    if (!b) return;
    b.innerHTML = "";
    const R = I.filter((E) => mr(E) === "file");
    b.hidden = R.length === 0, I.forEach((E, C) => {
      if (mr(E) !== "file") return;
      const A = document.createElement("div");
      A.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = X("file-text", { size: 14 });
      const O = document.createElement("span");
      O.className = "kl-file-nm", O.textContent = E.name, O.title = E.name;
      const F = document.createElement("span");
      F.className = "kl-file-sz", F.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const P = document.createElement("button");
      P.type = "button", P.className = "kl-file-rm", P.setAttribute("aria-label", `Remove ${E.name}`), P.title = "Remove", P.innerHTML = X("x", { size: 11 }), P.addEventListener("click", () => {
        so(C);
      }), A.append(T, O, F, P);
      const z = un($);
      if (z != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const W = document.createElement("i");
        W.style.width = z + "%", q.appendChild(W), A.appendChild(q);
      }
      b.appendChild(A);
    }), kt();
  }
  function so(b) {
    const R = I[b] && mr(I[b]) === "video";
    I.splice(b, 1), J != null && (R && J === b ? J = null : J > b && (J -= 1)), ei(), ke();
  }
  function Lu(b, R) {
    if (b.kind === "upgrade") {
      if (!b.url) return null;
      const C = document.createElement("a");
      return C.className = "kl-capmsg-cta", C.href = b.url, C.target = "_blank", C.rel = "noopener noreferrer", C.textContent = b.label, C;
    }
    if (!t.onRequestUpgrade) return null;
    const E = document.createElement("button");
    return E.type = "button", E.className = "kl-capmsg-cta kl-capmsg-req", E.textContent = b.label, E.addEventListener("click", async () => {
      if (E.disabled) return;
      const C = E.textContent || b.label;
      E.disabled = !0, E.textContent = "Requesting…";
      let A = !1;
      try {
        A = await t.onRequestUpgrade({ reason: b.reason || "upgrade", context: R });
      } catch {
        A = !1;
      }
      if (A) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${X("check")}</span>Request sent to your team`, E.replaceWith(T);
      } else
        E.disabled = !1, E.textContent = C;
    }), E;
  }
  function Iu(b, R) {
    const E = a.getElementById("klavity-capmsg");
    if (!E || !b.overCap) return;
    E.innerHTML = "";
    const C = document.createElement("span");
    if (C.className = "kl-capmsg-t", C.textContent = b.message || "", E.appendChild(C), b.cta) {
      const A = Lu(b.cta, R);
      if (A && E.appendChild(A), b.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = b.cta.hint, E.appendChild(T);
      }
    }
    E.hidden = !1;
  }
  function Ou() {
    const b = a.getElementById("klavity-capmsg");
    b && (b.hidden = !0, b.innerHTML = "");
  }
  async function _u(b) {
    Zn(), Ou();
    for (const R of b) {
      if (io(R)) {
        await Qn([R]);
        continue;
      }
      if (I.length >= v) {
        bt(`You can attach up to ${v} files.`);
        break;
      }
      const E = of(R, { capBytes: S, role: k, upgradeUrl: w });
      if (E.overCap) {
        Iu(E, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: R.name, sizeMb: Math.round(R.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (I.reduce((A, T) => A + T.size, 0) + R.size > M) {
        bt(`Attachments exceed the ${Math.round(M / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const A = R.type || (cc(R) ? ef(R.name) : ""), T = I.push({ name: R.name, type: A, size: R.size, dataUrl: await Zo(R) }) - 1;
        ei(), mr(I[T]) === "video" && (J = T), ke();
      } catch {
        bt(`Couldn't add "${R.name}". Please try a different file.`);
      }
    }
  }
  function ti() {
    Pe || (ke(), kt());
  }
  let Wt = null;
  function ur(b) {
    var C;
    if (Pe) return;
    Pe = !0, Wt == null || Wt(), Ce && (clearTimeout(Ce), Ce = null), document.removeEventListener("keydown", jt, { capture: !0 }), document.removeEventListener("paste", ao);
    try {
      (C = t.onClose) == null || C.call(t, b == null ? void 0 : b.reason);
    } catch {
    }
    const R = a.querySelector(".klavity-modal");
    if (b != null && b.immediate || !R) {
      _e(o);
      return;
    }
    R.classList.add("kl-closing");
    const E = () => _e(o);
    R.addEventListener("animationend", E, { once: !0 }), setTimeout(E, 700);
  }
  function oo(b, R) {
    if (Ce || Pe) return;
    const E = document.createElement("div");
    E.className = "klavity-toast-progress", E.style.animationDuration = R + "ms", b.appendChild(E);
    let C = R, A = Date.now();
    const T = () => {
      A = Date.now(), Ce = setTimeout(() => {
        ur();
      }, C);
    }, O = () => {
      Ce && (clearTimeout(Ce), Ce = null, C = Math.max(0, C - (Date.now() - A)), E.style.animationPlayState = "paused");
    }, F = () => {
      Ce || b.classList.contains("kl-closing") || (E.style.animationPlayState = "running", T());
    };
    b.addEventListener("mouseenter", O), b.addEventListener("mouseleave", F), b.addEventListener("focusin", O), b.addEventListener("focusout", (P) => {
      b.contains(P.relatedTarget) || F();
    }), T();
  }
  function jt(b) {
    var R;
    if (b.key === "Escape") {
      b.stopPropagation(), ur();
      return;
    }
    if ((b.key === "s" || b.key === "S") && !b.metaKey && !b.ctrlKey && !b.altKey) {
      const E = typeof b.composedPath == "function" && b.composedPath()[0] || b.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable || ((R = E.getAttribute) == null ? void 0 : R.call(E, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const C = a.getElementById("klavity-submit");
      C && !C.disabled && (b.preventDefault(), b.stopPropagation(), C.click());
    }
  }
  document.addEventListener("keydown", jt, { capture: !0 });
  const ao = (b) => {
    if (!b.clipboardData) return;
    const R = Array.from(b.clipboardData.items).filter((E) => E.type.startsWith("image/")).map((E) => E.getAsFile()).filter((E) => !!E);
    R.length && Qn(R);
  };
  document.addEventListener("paste", ao);
  const ri = () => {
    const b = te.querySelector("#klavity-desc");
    b && (b.placeholder = Me === "feature" ? "Describe the feature you'd like..." : Me === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (ze) {
    const b = Array.from(te.querySelectorAll(".kl-type-chip"));
    b.forEach((R) => {
      R.addEventListener("click", () => {
        Me = R.getAttribute("data-kind") || "bug", b.forEach((E) => {
          const C = E === R;
          E.classList.toggle("active", C), E.setAttribute("aria-checked", C ? "true" : "false");
        }), ri();
      });
    });
  } else {
    const b = te.querySelector(".bug"), R = te.querySelector(".feat");
    b.addEventListener("click", () => {
      Me = "bug", b.classList.add("active"), R.classList.remove("active"), ri();
    }), R.addEventListener("click", () => {
      Me = "feature", R.classList.add("active"), b.classList.remove("active"), ri();
    });
  }
  let lo = "project";
  {
    const b = te.querySelector("#klavity-target");
    if (b) {
      const R = Array.from(b.querySelectorAll(".kl-tgt-opt"));
      for (const E of R)
        E.addEventListener("click", () => {
          lo = E.dataset.target === "klavity" ? "klavity" : "project";
          for (const A of R) {
            const T = A === E;
            A.classList.toggle("on", T), A.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const ne = te.querySelector("#klavity-desc");
  {
    const b = () => {
      try {
        return a.getSelection ? a.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, R = () => {
      const A = b();
      if (!A || !A.rangeCount) return -1;
      try {
        const T = A.getRangeAt(0);
        if (!ne.contains(T.endContainer)) return -1;
        const O = T.cloneRange();
        return O.selectNodeContents(ne), O.setEnd(T.endContainer, T.endOffset), O.toString().length;
      } catch {
        return -1;
      }
    }, E = (A) => {
      const T = b();
      if (T)
        try {
          const O = document.createRange(), F = document.createTreeWalker(ne, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let P, z = A, q = !1;
          for (; P = F.nextNode(); ) {
            if (P.nodeName === "BR") {
              if (z === 0) {
                O.setStartBefore(P), q = !0;
                break;
              }
              z -= 1;
              continue;
            }
            if (P.nodeType === 3) {
              const W = (P.textContent || "").length;
              if (z <= W) {
                O.setStart(P, z), q = !0;
                break;
              }
              z -= W;
            }
          }
          q ? O.collapse(!0) : (O.selectNodeContents(ne), O.collapse(!1)), T.removeAllRanges(), T.addRange(O);
        } catch {
        }
    }, C = () => {
      const A = R(), T = Ko(ne).replace(/\n$/, "");
      ne.innerHTML = T ? Go(T) : "", A >= 0 && E(A);
    };
    ne.addEventListener("input", C), Object.defineProperty(ne, "value", {
      configurable: !0,
      get() {
        return Ko(ne);
      },
      set(A) {
        const T = String(A ?? "").replace(/\n$/, "");
        ne.innerHTML = T ? Go(T) : "";
      }
    }), Object.defineProperty(ne, "disabled", {
      configurable: !0,
      get() {
        return ne.getAttribute("contenteditable") === "false";
      },
      set(A) {
        ne.setAttribute("contenteditable", A ? "false" : "true"), ne.classList.toggle("kl-desc-disabled", !!A);
      }
    }), Object.defineProperty(ne, "placeholder", {
      configurable: !0,
      get() {
        return ne.getAttribute("data-ph") || "";
      },
      set(A) {
        ne.setAttribute("data-ph", String(A ?? ""));
      }
    });
  }
  const Ht = te.querySelector("#klavity-submit"), vt = te.querySelector("#klavity-remail");
  vt && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (vt.value = t.prefillEmail);
  const co = te.querySelector("#klavity-desc-hint"), Nu = () => !t.requireEmail || !!vt && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(vt.value.trim()), uo = () => c.length > 0 || et || I.length > 0 || Le.length > 0, Pu = () => {
  }, kt = () => {
    const b = ne.value.trim() === "";
    Ht.disabled = b && !uo() || !Nu(), co && (co.hidden = !(b && uo()));
  };
  if (ne.addEventListener("input", Pu), ne.addEventListener("input", kt), vt == null || vt.addEventListener("input", kt), t.onEnhance) {
    const b = t.onEnhance, R = te.querySelector("#klavity-enhance"), E = te.querySelector("#klavity-enhance-undo"), C = te.querySelector("#klavity-enhance-regen"), A = te.querySelector("#klavity-enhance-spin");
    let T = 0, O = null;
    const F = () => c[ae] || c[0] || "", P = async () => {
      if (ot) return;
      const z = ne.value.trim();
      O = ne.value;
      const q = ++T;
      R && (R.disabled = !0), A && (A.hidden = !1);
      try {
        const W = ee ? { selector: ee.selector, text: ee.text } : null, j = await b(z, { images: c.length, shot: F(), picked: W });
        if (q !== T || !j) return;
        ne.value = Xh(j), Be = j.suggestedSeverity || null, gt = j.suggestedPriority || null, ne.classList.add("kl-just-enhanced"), setTimeout(() => ne.classList.remove("kl-just-enhanced"), 700), E && (E.hidden = !1), C && (C.hidden = !1), kt();
      } catch {
      } finally {
        q === T && (R && (R.disabled = !1), A && (A.hidden = !0));
      }
    };
    R == null || R.addEventListener("click", () => {
      P();
    }), C == null || C.addEventListener("click", () => {
      P();
    }), E == null || E.addEventListener("click", () => {
      O !== null && (ne.value = O, kt()), O = null, Be = null, gt = null, E && (E.hidden = !0), C && (C.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const b = te.querySelector("#klavity-known"), R = t.onCheckKnown;
    let E = null, C = 0, A = "";
    const T = () => {
      b && (b.hidden = !0, b.textContent = "");
    }, O = (P) => {
      var q;
      if (!b) return;
      const z = P.headline ? lt(P.headline) : "Already reported";
      b.innerHTML = `<span class="kl-known-ic">${X("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${z}</span> — status: <span class="kl-known-status">${lt(P.statusLabel)}</span>. We're already tracking "${lt(P.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, b.hidden = !1, (q = b.querySelector("#klavity-known-dismiss")) == null || q.addEventListener("click", () => {
        A = ne.value.trim(), T();
      });
    }, F = async () => {
      const P = ne.value.trim();
      if (P.length < 12 || P === A) {
        T();
        return;
      }
      const z = ++C;
      try {
        const q = await R(P);
        if (z !== C) return;
        if (ne.value.trim() === A) {
          T();
          return;
        }
        q ? O(q) : T();
      } catch {
      }
    };
    ne.addEventListener("input", () => {
      ne.value.trim() !== A && (A = ""), E && clearTimeout(E), E = setTimeout(F, 500);
    });
  }
  if (n.reportClarity) {
    const b = te.querySelector("#klavity-clarity"), R = te.querySelector("#klavity-clarity-status"), E = {
      problem: te.querySelector("#klavity-clarity-problem"),
      expected: te.querySelector("#klavity-clarity-expected"),
      repro: te.querySelector("#klavity-clarity-repro")
    }, C = te.querySelector("#klavity-clarity-tip"), A = te.querySelector("#klavity-clarity-tip-text"), T = te.querySelector("#klavity-nudge"), O = t.onClarityTip, F = /* @__PURE__ */ new Map();
    let P = null, z = 0;
    const q = (G, ie, we) => {
      if (!G) return;
      G.classList.toggle("done", ie);
      const Ve = G.querySelector(".kl-clr-mark");
      Ve && (Ve.innerHTML = ie ? X("check", { size: 12 }) : "○"), G.setAttribute("aria-label", (ie ? "covered: " : "missing: ") + we);
    }, W = () => {
      C && (C.hidden = !0);
    }, j = (G) => {
      !C || !A || $h(G) || (A.innerHTML = lt(G) + '<span class="kl-clr-aitag">AI</span>', C.hidden = !1);
    }, pe = () => {
      const G = ne.value, ie = sc(G);
      b && (b.hidden = G.trim().length === 0, b.classList.remove("l1", "l2", "l3"), b.classList.add(ie.level === "great" ? "l3" : ie.level === "good" ? "l2" : "l1")), R && (R.textContent = ie.label), q(E.problem, ie.coverage.problem, "What's broken"), q(E.expected, ie.coverage.expected, "What you expected"), q(E.repro, ie.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), ie.level === "great" && W();
    }, re = () => {
      !O || !C || (P && clearTimeout(P), P = setTimeout(async () => {
        const G = ne.value.trim();
        if (!Nh(G)) {
          W();
          return;
        }
        if (F.has(G)) {
          j(F.get(G));
          return;
        }
        const ie = ++z;
        try {
          const we = await O(G, { images: c.length });
          if (ie !== z || ne.value.trim() !== G) return;
          we && we.tip && (F.set(G, we.tip), j(we.tip));
        } catch {
        }
      }, 1e3));
    };
    ne.addEventListener("input", () => {
      pe(), re();
    }), pe(), (ko = te.querySelector("#klavity-nudge-add")) == null || ko.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        ne.focus();
      } catch {
      }
    }), (wo = te.querySelector("#klavity-nudge-anyway")) == null || wo.addEventListener("click", () => {
      T && (T.hidden = !0), Ht.click();
    });
  }
  cr.addEventListener("click", (b) => {
    b.target === cr && ur();
  }), (xo = te.querySelector("#klavity-x")) == null || xo.addEventListener("click", () => ur()), (So = te.querySelector("#klavity-min")) == null || So.addEventListener("click", () => {
    var b;
    try {
      (b = t.onMinimize) == null || b.call(t);
    } catch {
    }
  });
  const po = () => Array.from(te.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let ot = !1;
  const He = (b) => {
    ot = b, po().forEach((E) => {
      E.disabled = b;
    }), ne.disabled = b;
    const R = te.querySelector("#klavity-voice");
    R && (R.disabled = b), te.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((E) => {
      E.disabled = b;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((E) => {
      E.disabled = b;
    }), b ? (Wt == null || Wt(), Ht.disabled = !0) : (kt(), tn());
  }, wt = (b) => {
    po().forEach((R) => {
      R.classList.remove("kl-active"), R.removeAttribute("aria-pressed");
    }), b && (b.classList.add("kl-active"), b.setAttribute("aria-pressed", "true"));
  }, Tt = te.querySelector("#klavity-voice");
  if (Tt) {
    const E = Tt.querySelector(".kl-vring-prog");
    let C = 0, A = 0, T = !1, O;
    const F = () => {
      A = Date.now();
      const he = () => {
        const xe = Date.now() - A, Ne = Math.min(xe / 18e4, 1);
        if (E == null || E.setAttribute("stroke-dashoffset", String(Ne * 81.68)), xe >= 165e3 && Tt.classList.add("kl-voice-warn"), xe >= 18e4) {
          O.stop();
          return;
        }
        C = requestAnimationFrame(he);
      };
      C = requestAnimationFrame(he);
    }, P = () => {
      cancelAnimationFrame(C), E == null || E.setAttribute("stroke-dashoffset", String(81.68)), Tt.classList.remove("kl-voice-warn");
    }, z = te.querySelector("#klavity-voice-status");
    let q = null;
    const W = () => {
      q && (clearTimeout(q), q = null), z && (z.hidden = !0, z.textContent = "", z.classList.remove("kl-vs-info", "kl-vs-err"));
    }, j = (he, xe, Ne) => {
      !z || !xe || (q && (clearTimeout(q), q = null), z.classList.remove("kl-vs-info", "kl-vs-err"), z.classList.add(he === "err" ? "kl-vs-err" : "kl-vs-info"), z.textContent = xe, z.hidden = !1, Ne && (q = setTimeout(W, Ne)));
    }, pe = "Recording — tap to stop", re = () => {
      z && z.classList.contains("kl-vs-info") && W();
    }, G = (he) => {
      Tt.classList.toggle("kl-voice-rec", he), Tt.setAttribute("aria-pressed", he ? "true" : "false"), Tt.setAttribute("aria-label", he ? "Stop recording" : "Voice dictation"), Tt.title = he ? pe : "Voice dictation";
    }, ie = (he) => {
      he.onTranscript = (xe) => {
        const Ne = ne.value;
        ne.value = Ne + (Ne.length > 0 && !/\s$/.test(Ne) ? " " : "") + xe, kt();
      }, he.onStatus = (xe, Ne) => {
        xe === "idle" ? re() : j("info", Ne);
      }, he.onError = (xe, Ne) => {
        Ne && j("err", Ne, 4e3);
      }, he.onStop = () => {
        T = !1, G(!1), P(), re();
      };
    }, we = () => {
      const he = new Ur();
      return ie(he), he;
    }, Ve = () => {
      if (Q === "server" && t.onDictate) {
        const he = new Mn({ transcribe: (xe) => t.onDictate(xe) });
        return ie(he), he.onUnavailable = () => {
          if (!T) {
            G(!1), P(), re();
            return;
          }
          Ur.isSupported() ? (O = we(), j("info", "Reconnecting dictation…"), O.start()) : (T = !1, G(!1), P(), j("err", "Voice dictation is unavailable right now", 4e3));
        }, he;
      }
      return we();
    };
    O = Ve(), Tt.addEventListener("click", () => {
      T ? O.stop() : (W(), O = Ve(), T = !0, G(!0), O.start(), F());
    }), Wt = () => {
      T && O.stop();
    };
  }
  Ht.addEventListener("click", async () => {
    if (ot || Ht.disabled) return;
    const b = ne.value.trim(), R = te.querySelector("#klavity-title"), E = R ? R.value.trim() : "", C = Me === "feature" ? "feature" : "bug", A = p.slice(), T = Te(), O = I.slice(), F = Le.slice(), P = Me, z = (vt == null ? void 0 : vt.value.trim()) || void 0;
    He(!0), Ht.textContent = "Uploading…";
    const q = a.getElementById("klavity-err");
    q.style.display = "none";
    const W = a.getElementById("klavity-progress"), j = a.getElementById("klavity-progress-fill");
    W && j && (W.classList.add("show"), j.style.transition = "none", j.style.width = "8%", j.offsetWidth, j.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      j.style.width = "90%";
    }));
    const pe = () => {
      j && (j.style.transition = "width .25s ease", j.style.width = "100%");
    }, re = () => {
      W && j && (W.classList.remove("show"), j.style.transition = "none", j.style.width = "0");
    };
    try {
      const G = await Promise.all(A), ie = {
        type: C,
        ...ze ? { kind: P } : {},
        ...E ? { title: E } : {},
        description: b,
        screenshots: G,
        ...O.length ? { files: O } : {},
        ...F.length ? { recordings: F } : {},
        annotations: T,
        reporterEmail: z,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: lo } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...Be ? { suggestedSeverity: Be } : {},
        ...gt ? { suggestedPriority: gt } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(ie), ur({ immediate: !0, reason: "submitted" });
        return;
      }
      const we = await t.onSubmit(ie);
      if (Pe) return;
      pe(), t.success ? Wu(we.issueKey, we.issueUrl, t.success) : qu(we.issueKey, we.issueUrl);
    } catch (G) {
      re();
      const ie = (G == null ? void 0 : G.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", G);
      } catch {
      }
      q.textContent = n.debug ? `Couldn't submit your report — ${ie}` : "Couldn't submit your report. Please check your connection and try again.", q.style.display = "block", Ht.textContent = "Submit", He(!1);
    }
  });
  function $u(b, R) {
    const { dataUrl: E, quality: C, suggestSharp: A } = Ct(R);
    if (!E) return;
    const T = c.indexOf(b);
    T < 0 || (c[T] = E, p[T] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), s[T] = C, h[T] = !!A && C !== "real-pixel", K[T] && delete K[T], delete H[T], delete ue[T], ke());
  }
  async function Du(b) {
    if (!t.onCaptureViewport) return !1;
    let R = null;
    const E = i ? Jt(document.body) : null;
    try {
      const { dataUrl: C } = Ct(await t.onCaptureViewport());
      C && (R = C, l = !1, tt(C, "rendered", void 0, !0, !1), b && wt(b));
    } catch {
    } finally {
      E == null || E();
    }
    return (async () => {
      const C = i ? Jt(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (R) $u(R, A);
        else {
          l = !1;
          const { dataUrl: T, quality: O, suggestSharp: F } = Ct(A);
          T && (tt(T, O, void 0, !0, !!F), b && wt(b));
        }
      } catch {
        l = !1, ke();
      } finally {
        C == null || C();
      }
    })(), !0;
  }
  async function ho(b) {
    if (!t.onCaptureViewport) return !1;
    const R = i ? Jt(document.body) : null;
    try {
      const { dataUrl: E } = Ct(await t.onCaptureViewport());
      E ? (l = !1, tt(E, "rendered", void 0, !0, !1)) : (l = !1, ke());
    } catch {
      l = !1, ke();
    } finally {
      R == null || R();
    }
    return !0;
  }
  const Vt = te.querySelector("#klavity-full");
  Vt.addEventListener("click", async () => {
    if (!ot) {
      He(!0), Vt.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Du(Vt);
          return;
        }
        const b = i ? Jt(document.body) : null;
        try {
          const { dataUrl: R, quality: E, suggestSharp: C } = Ct(await t.onCaptureFull());
          tt(R, E, void 0, !0, !!C), wt(Vt);
        } finally {
          b == null || b();
        }
      } catch {
      } finally {
        Vt.classList.remove("kl-loading"), He(!1);
      }
    }
  });
  async function fo(b) {
    const R = b != null && b.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (ot || !R || !ve) return !1;
    const E = ve.querySelector(".kl-sharp-label");
    He(!0), ve.classList.add("kl-loading"), o.style.display = "none";
    const C = E ?? ve, A = C.textContent;
    C.textContent = "Capturing…";
    let T = !1;
    try {
      const O = i ? Jt(document.body) : null;
      let F;
      try {
        F = await R();
      } finally {
        O == null || O();
      }
      if (F) {
        const { dataUrl: P, quality: z } = Ct(F);
        P && (tt(P, z ?? "real-pixel", void 0, !0, !1, { kind: b != null && b.viewport ? "viewport" : "full" }), wt(ve), T = !0);
      }
    } catch (O) {
      if (Zh(O))
        try {
          Ru();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", O);
        } catch {
        }
    } finally {
      o.style.display = "", C.textContent = A, ve.classList.remove("kl-loading"), He(!1);
    }
    return T;
  }
  ve && t.onCaptureSharp && ve.addEventListener("click", () => {
    fo();
  });
  const mo = te.querySelector("#klavity-file"), go = te.querySelector("#klavity-upload");
  go.addEventListener("click", () => {
    if (!ot) {
      if (!y && c.length >= f) {
        bt(`You can attach up to ${f} images.`);
        return;
      }
      mo.click();
    }
  }), mo.addEventListener("change", async (b) => {
    const R = b.target, E = R.files ? Array.from(R.files) : [];
    if (R.value = "", !E.length) return;
    const C = c.length, A = I.length;
    y ? await _u(E) : await Qn(E), (c.length > C || I.length > A) && wt(go);
  });
  const Pr = a.getElementById("klavity-record");
  Pr && t.onRecord && Pr.addEventListener("click", async () => {
    if (ot) return;
    if (Le.length >= L) {
      bt(`You can attach up to ${L} recordings.`);
      return;
    }
    He(!0), Pr.classList.add("kl-loading");
    const b = (R) => {
      o.style.display = R === "recording" ? "none" : "";
    };
    try {
      const R = await t.onRecord(b);
      R && (Le.push(R), be = Le.length - 1, J = null, ti(), wt(Pr));
    } catch {
    } finally {
      o.style.display = "", Pr.classList.remove("kl-loading"), He(!1);
    }
  });
  const ni = a.getElementById("klavity-region");
  ni && t.onRegionCapture && (ni.onclick = () => {
    ot || (He(!0), document.removeEventListener("keydown", jt, { capture: !0 }), o.style.display = "none", lf(async (b) => {
      document.addEventListener("keydown", jt, { capture: !0 });
      try {
        const R = i ? Jt(document.body) : null;
        let E;
        try {
          E = await t.onRegionCapture(b);
        } finally {
          R == null || R();
        }
        if (E) {
          const { dataUrl: C, quality: A, suggestSharp: T } = Ct(E);
          C && (tt(C, A, void 0, !0, !!T, { kind: "region", rect: b }), wt(ni));
        }
      } finally {
        o.style.display = "", He(!1);
      }
    }, () => {
      document.addEventListener("keydown", jt, { capture: !0 }), o.style.display = "", He(!1);
    }));
  });
  const dr = a.getElementById("klavity-pick"), pr = a.getElementById("klavity-pickinfo"), yo = () => {
    var E;
    if (dr && (dr.classList.toggle("kl-active", !!ee), ee ? dr.setAttribute("aria-pressed", "true") : dr.removeAttribute("aria-pressed")), !pr) return;
    if (!ee) {
      pr.hidden = !0, pr.innerHTML = "";
      return;
    }
    pr.hidden = !1;
    const { text: b } = ee, R = b ? `: <span class="kl-pick-txt">${lt(b)}</span>` : "";
    pr.innerHTML = `<span class="kl-pick-ic">${X("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${R}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (E = pr.querySelector("#klavity-pick-clear")) == null || E.addEventListener("click", () => {
      ee = null, yo();
    });
  };
  dr && t.onPickElement && (dr.onclick = async () => {
    if (!ot) {
      He(!0), document.removeEventListener("keydown", jt, { capture: !0 }), o.style.display = "none";
      try {
        const b = await t.onPickElement();
        b && (ee = b, yo(), b.shot && tt(b.shot, b.shotQuality, void 0, !0, !1, { kind: "element", selector: b.selector, rect: b.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", jt, { capture: !0 }), o.style.display = "", He(!1);
      }
    }
  });
  function Lt(b, R = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${R}" height="${R}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${b}</svg>`;
  }
  function zu(b) {
    const R = (T, O, F, P) => `<button type="button" class="kl-htool" data-tool="${T}" title="${O} (${P.toUpperCase()})" aria-label="${O}">${F}<span class="kl-hk">${P.toUpperCase()}</span></button>`, E = (T) => {
      const O = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(O)) return !1;
      const F = parseInt(O.slice(0, 2), 16), P = parseInt(O.slice(2, 4), 16), z = parseInt(O.slice(4, 6), 16);
      return (0.2126 * F + 0.7152 * P + 0.0722 * z) / 255 > 0.7;
    }, C = (T) => `<button type="button" class="kl-hcolor${E(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + R("pen", "Pen", X("pencil", { size: 15 }), "p") + R("line", "Line", Lt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + R("rect", "Rectangle", X("square", { size: 15 }), "r") + R("circle", "Circle", Lt('<circle cx="12" cy="12" r="9"/>'), "o") + R("arrow", "Arrow", Lt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + R("text", "Text", Lt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + R("count", "Numbers", Lt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${X("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + R("pixelate", "Redact (pixelate)", Lt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + R("crop", "Crop", Lt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + C("#ef4444") + C("#f97316") + C("#16a34a") + C("#3b82f6") + C("#ffffff") + C("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Lt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (b ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Lt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${X("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">scroll to zoom · shift-drag to pan</span>`
    );
  }
  function $r() {
    D && (document.removeEventListener("keydown", D, { capture: !0 }), D = null);
  }
  function ii() {
    const b = a.getElementById("klavity-hero-stage"), R = a.getElementById("klavity-hero-tools");
    R && (R.innerHTML = ""), b && (b.innerHTML = `<div class="kl-hero-empty">${X("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), $r();
  }
  function bo() {
    var b;
    if (J != null && !(I[J] && mr(I[J]) === "video") && (J = null), be != null && !Le[be] && (be = null), be != null) {
      vo(Le[be].dataUrl);
      return;
    }
    if (J != null) {
      vo((b = I[J]) == null ? void 0 : b.dataUrl);
      return;
    }
    if (c.length === 0) {
      ae = 0, ii();
      return;
    }
    ae >= c.length && (ae = c.length - 1), ae < 0 && (ae = 0), Uu(ae);
  }
  function vo(b) {
    const R = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!R || !b) {
      ii();
      return;
    }
    $r(), E && (E.innerHTML = ""), R.innerHTML = "";
    const C = document.createElement("video");
    C.src = b, C.controls = !0, C.setAttribute("playsinline", ""), C.preload = "metadata", C.className = "kl-hero-video", C.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", R.appendChild(C);
  }
  function Fu(b, R, E, C, A) {
    const T = c[b];
    if (!T) return;
    const O = new Image();
    O.onload = () => {
      var pe, re;
      if (c[b] !== T) return;
      const F = document.createElement("canvas");
      F.width = Math.max(1, Math.round(C)), F.height = Math.max(1, Math.round(A));
      const P = F.getContext("2d");
      if (!P) return;
      P.drawImage(O, R, E, C, A, 0, 0, F.width, F.height);
      let z;
      try {
        z = F.toDataURL("image/png");
      } catch {
        return;
      }
      const q = ((pe = H[b]) == null ? void 0 : pe.length) ?? 0, W = Ee(b);
      c[b] = z, p[b] = t.compressImage ? t.compressImage(z) : Promise.resolve(z);
      const j = (re = K[b]) == null ? void 0 : re.shapes;
      Array.isArray(j) && j.length ? K[b] = { w: F.width, h: F.height, shapes: Kh(j, -R, -E) } : delete K[b], (H[b] ?? (H[b] = [])).push(W), (ue[b] ?? (ue[b] = [])).push({ snap: W, mark: q }), ke();
    }, O.src = T;
  }
  function Uu(b) {
    var P, z, q, W, j;
    const R = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!R || !E) return;
    const C = c[b];
    if (!C) {
      ii();
      return;
    }
    $r(), R.innerHTML = "";
    const A = document.createElement("canvas");
    A.width = 1, A.height = 1, A.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new Wo(A, C), O = (P = K[b]) == null ? void 0 : P.shapes;
    Array.isArray(O) && O.forEach((pe) => T.shapes.push({ ...pe })), R.appendChild(A);
    const F = new Image();
    F.onload = () => {
      !document.body.contains(o) || ae !== b || c[b] !== C || (A.width = F.naturalWidth || 1, A.height = F.naturalHeight || 1, T.redraw());
    }, F.src = C, T.redraw();
    {
      E.innerHTML = zu((((z = ue[b]) == null ? void 0 : z.length) ?? 0) > 0);
      const pe = E.querySelector("#kl-hero-logo");
      pe && (pe.href = Yh(n.projectId));
      let re = "pen", G = "#ef4444", ie = 26, we = "black", Ve = null;
      const he = E.querySelector("#kl-hero-textopts"), xe = () => {
        T.shapes.length ? K[b] = { w: A.width, h: A.height, shapes: T.shapes.map((N) => ({ ...N })) } : delete K[b];
      }, Ne = (N) => {
        re = N, E.querySelectorAll("[data-tool]").forEach((U) => U.classList.toggle("kl-on", U.dataset.tool === N)), he && (he.hidden = N !== "text");
      }, xt = E.querySelector(".kl-hcolor-custom"), It = E.querySelector(".kl-hcolor-input"), Yt = (N, U) => {
        G = N, E.querySelectorAll("[data-color]").forEach((Y) => Y.classList.toggle("kl-on", Y === U)), xt && xt.classList.toggle("kl-on", xt === U);
      };
      if (E.querySelectorAll("[data-tool]").forEach((N) => N.addEventListener("click", () => Ne(N.dataset.tool))), E.querySelectorAll("[data-color]").forEach((N) => N.addEventListener("click", () => Yt(N.dataset.color, N))), xt && It) {
        xt.addEventListener("click", () => It.click());
        const N = () => {
          xt.style.background = It.value, Yt(It.value, xt);
        };
        It.addEventListener("input", N), It.addEventListener("change", N);
      }
      const Gt = E.querySelector(".kl-hmask-cb");
      Gt && Gt.addEventListener("change", () => {
        i = Gt.checked;
      }), E.querySelectorAll("[data-outline]").forEach((N) => N.addEventListener("click", () => {
        we = N.dataset.outline, E.querySelectorAll("[data-outline]").forEach((U) => U.classList.toggle("kl-on", U === N));
      })), E.querySelectorAll("[data-size]").forEach((N) => N.addEventListener("click", () => {
        ie = Number(N.dataset.size), E.querySelectorAll("[data-size]").forEach((U) => U.classList.toggle("kl-on", U === N));
      })), E.querySelectorAll("[data-stroke]").forEach((N) => N.addEventListener("click", () => {
        T.strokeScale = Number(N.dataset.stroke) || 1, E.querySelectorAll("[data-stroke]").forEach((U) => U.classList.toggle("kl-on", U === N)), T.redraw();
      })), (q = E.querySelector("#kl-hero-undo")) == null || q.addEventListener("click", () => {
        lr(b);
      }), (W = E.querySelector("#kl-hero-revert")) == null || W.addEventListener("click", () => {
        Mu(b);
      }), (j = E.querySelector("#kl-hero-clear")) == null || j.addEventListener("click", () => {
        $e(b), T.clearAll(), xe();
      }), Ne(re), Yt(G, E.querySelector("[data-color]"));
      const Z = (N) => {
        const U = A.getBoundingClientRect(), Y = Math.min(U.width / A.width, U.height / A.height) || 1, fe = A.width * Y, me = A.height * Y, Ue = (U.width - fe) / 2, St = (U.height - me) / 2;
        return { x: (N.clientX - U.left - Ue) / Y, y: (N.clientY - U.top - St) / Y };
      }, se = () => {
        const N = A.getBoundingClientRect();
        return Math.min(N.width / A.width, N.height / A.height) || 1;
      }, Ie = (N, U, Y, fe, me, Ue) => N === "line" ? { type: "line", color: Ue, x1: U, y1: Y, x2: fe, y2: me } : N === "arrow" ? { type: "arrow", color: Ue, x1: U, y1: Y, x2: fe, y2: me } : N === "rect" ? { type: "rect", color: Ue, x: Math.min(U, fe), y: Math.min(Y, me), w: Math.abs(fe - U), h: Math.abs(me - Y) } : N === "circle" ? { type: "circle", color: Ue, x: (U + fe) / 2, y: (Y + me) / 2, rx: Math.abs(fe - U) / 2, ry: Math.abs(me - Y) / 2 } : N === "pixelate" ? { type: "pixelate", x: Math.min(U, fe), y: Math.min(Y, me), w: Math.abs(fe - U), h: Math.abs(me - Y) } : null;
      let qe = 1, Pt = 0, $t = 0, rn = null;
      const ju = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), si = qh(ju), oi = () => {
        if (rn) return rn;
        const N = A.style.transform;
        return A.style.transform = "", rn = A.getBoundingClientRect(), A.style.transform = N, rn;
      }, Fe = document.createElement("div");
      Fe.className = "kl-minimap", Fe.hidden = !0, Fe.setAttribute("role", "navigation"), Fe.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Dr = document.createElement("img");
      Dr.className = "kl-minimap-img", Dr.alt = "", Dr.draggable = !1, Dr.src = C;
      const hr = document.createElement("div");
      hr.className = "kl-minimap-vp", Fe.append(Dr, hr), R.appendChild(Fe);
      const Co = () => {
        const N = A.width, U = A.height;
        if (qe <= 1 || N < 2 || U < 2) {
          Fe.hidden = !0;
          return;
        }
        const Y = oi();
        if (!Y) {
          Fe.hidden = !0;
          return;
        }
        const fe = 148, me = Math.min(fe / N, fe / U), Ue = Math.max(1, Math.round(N * me)), St = Math.max(1, Math.round(U * me));
        Fe.style.width = Ue + "px", Fe.style.height = St + "px";
        const at = R.getBoundingClientRect(), Dt = jh(
          { left: at.left, top: at.top, right: at.right, bottom: at.bottom },
          { left: Y.left, top: Y.top, width: Y.width, height: Y.height },
          { panX: Pt, panY: $t },
          qe,
          N,
          U
        );
        hr.style.left = Dt.x * me + "px", hr.style.top = Dt.y * me + "px", hr.style.width = Math.max(3, Dt.w * me) + "px", hr.style.height = Math.max(3, Dt.h * me) + "px", Fe.hidden = !1;
      }, nn = () => {
        if (qe === 1) {
          Pt = 0, $t = 0, A.style.transform = "", A.style.cursor = "crosshair", Co();
          return;
        }
        A.style.transformOrigin = "0 0", A.style.transform = `translate(${Pt}px,${$t}px) scale(${qe})`, A.style.cursor = "grab", Co();
      }, Hu = (N, U, Y) => {
        const fe = oi();
        if (!fe) return;
        const me = qe;
        if (qe = Uh(qe * Y), qe === me) return;
        const Ue = Wh(N, U, { left: fe.left, top: fe.top, width: fe.width, height: fe.height }, me, qe, { panX: Pt, panY: $t });
        Pt = Ue.panX, $t = Ue.panY, A.style.transition = si, nn();
      }, Vu = (N, U) => {
        const Y = oi();
        if (!Y) return;
        const fe = R.getBoundingClientRect(), me = Vh(N, U, { left: fe.left, top: fe.top, right: fe.right, bottom: fe.bottom }, { left: Y.left, top: Y.top, width: Y.width, height: Y.height }, qe, A.width);
        Pt = me.panX, $t = me.panY, A.style.transition = si, nn();
      };
      let sn = !1;
      const Eo = (N, U) => {
        const Y = Fe.getBoundingClientRect(), { ix: fe, iy: me } = Hh(N - Y.left, U - Y.top, Y.width, Y.height, A.width, A.height);
        Vu(fe, me);
      };
      Fe.addEventListener("pointerdown", (N) => {
        sn = !0;
        try {
          Fe.setPointerCapture(N.pointerId);
        } catch {
        }
        Eo(N.clientX, N.clientY), N.preventDefault(), N.stopPropagation();
      }), Fe.addEventListener("pointermove", (N) => {
        sn && (Eo(N.clientX, N.clientY), N.preventDefault());
      });
      const Mo = (N) => {
        if (sn) {
          sn = !1;
          try {
            Fe.releasePointerCapture(N.pointerId);
          } catch {
          }
        }
      };
      Fe.addEventListener("pointerup", Mo), Fe.addEventListener("pointercancel", Mo), R.addEventListener("wheel", (N) => {
        re !== "crop" && (N.preventDefault(), Hu(N.clientX, N.clientY, Bh(N.deltaY)));
      }, { passive: !1 }), R.addEventListener("dblclick", () => {
        qe = 1, A.style.transition = si, nn();
      });
      let Yu = T.shapes.reduce((N, U) => U.type === "count" ? Math.max(N, U.n) : N, 0), Kt = !1, Xe = 0, Je = 0, Xt = [], fr = !1, Ro = 0, Ao = 0, To = 0, Lo = 0, Ze = null, zr = { x: 0, y: 0 };
      A.addEventListener("pointerdown", (N) => {
        if (N.shiftKey && qe > 1) {
          fr = !0, Ro = N.clientX, Ao = N.clientY, To = Pt, Lo = $t, A.style.transition = "none", A.style.cursor = "grabbing";
          try {
            A.setPointerCapture(N.pointerId);
          } catch {
          }
          N.preventDefault();
          return;
        }
        const U = Z(N);
        if (Xe = U.x, Je = U.y, re === "crop") {
          Kt = !0;
          try {
            A.setPointerCapture(N.pointerId);
          } catch {
          }
          zr = { x: N.clientX, y: N.clientY }, Ze = document.createElement("div"), Ze.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", R.appendChild(Ze);
          return;
        }
        if (re === "text") {
          const Y = document.createElement("input"), fe = we === "none" ? "none" : `0 0 2px ${we}, 0 0 2px ${we}`, me = se(), Ue = Math.max(6, ie * me), St = ie, at = we;
          Y.style.cssText = `position:fixed;left:${N.clientX}px;top:${N.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${G};font-size:${Ue}px;font-family:sans-serif;font-weight:700;text-shadow:${fe};outline:1px dashed ${G};z-index:2147483647;min-width:80px;`, document.body.appendChild(Y), Ve = Y, requestAnimationFrame(() => {
            document.body.contains(Y) && Y.focus();
          }), Y.addEventListener("blur", () => {
            Ve = null, Y.value.trim() && ($e(b), T.addShape({ type: "text", color: G, x: Xe, y: Je, text: Y.value.trim(), size: St, outline: at }), xe()), _e(Y);
          }, { once: !0 }), Y.addEventListener("keydown", (Dt) => {
            Dt.key === "Enter" && Y.blur(), Dt.key === "Escape" && (Y.value = "", Y.blur()), Dt.stopPropagation();
          });
          return;
        }
        if (re === "count") {
          $e(b), T.addShape({ type: "count", color: G, x: U.x, y: U.y, n: ++Yu }), xe();
          return;
        }
        Kt = !0;
        try {
          A.setPointerCapture(N.pointerId);
        } catch {
        }
        re === "pen" && (Xt = [U]);
      }), A.addEventListener("pointermove", (N) => {
        if (fr) {
          A.style.transition = "none", Pt = To + (N.clientX - Ro), $t = Lo + (N.clientY - Ao), nn(), A.style.cursor = "grabbing";
          return;
        }
        if (!Kt) return;
        if (re === "pen") {
          Xt.push(Z(N)), Xt.length > 1 && T.drawPreview({ type: "pen", color: G, points: Xt });
          return;
        }
        if (re === "crop" && Ze) {
          const fe = R.getBoundingClientRect(), me = Math.min(zr.x, N.clientX), Ue = Math.min(zr.y, N.clientY), St = Math.max(zr.x, N.clientX), at = Math.max(zr.y, N.clientY);
          Ze.style.left = me - fe.left + "px", Ze.style.top = Ue - fe.top + "px", Ze.style.width = St - me + "px", Ze.style.height = at - Ue + "px";
          return;
        }
        const U = Z(N), Y = Ie(re, Xe, Je, U.x, U.y, G);
        Y && T.drawPreview(Y);
      }), A.addEventListener("pointerup", (N) => {
        if (fr) {
          fr = !1, A.style.cursor = qe > 1 ? "grab" : "crosshair";
          try {
            A.releasePointerCapture(N.pointerId);
          } catch {
          }
          return;
        }
        if (!Kt) return;
        Kt = !1;
        try {
          A.releasePointerCapture(N.pointerId);
        } catch {
        }
        const U = Z(N);
        if (re === "crop") {
          Ze && (_e(Ze), Ze = null);
          const me = Math.max(0, Math.min(Xe, U.x)), Ue = Math.max(0, Math.min(Je, U.y)), St = Math.abs(U.x - Xe), at = Math.abs(U.y - Je);
          St > 4 && at > 4 && Fu(b, me, Ue, St, at);
          return;
        }
        const Y = re === "pixelate" && Math.abs(U.x - Xe) > 4 && Math.abs(U.y - Je) > 4;
        (re === "pen" && Xt.length > 1 || re === "line" || re === "rect" || re === "circle" || re === "arrow" || Y) && $e(b), re === "pen" && Xt.length > 1 ? T.addShape({ type: "pen", color: G, points: Xt }) : re === "line" ? T.addShape({ type: "line", color: G, x1: Xe, y1: Je, x2: U.x, y2: U.y }) : re === "rect" ? T.addShape({ type: "rect", color: G, x: Math.min(Xe, U.x), y: Math.min(Je, U.y), w: Math.abs(U.x - Xe), h: Math.abs(U.y - Je) }) : re === "circle" ? T.addShape({ type: "circle", color: G, x: (Xe + U.x) / 2, y: (Je + U.y) / 2, rx: Math.abs(U.x - Xe) / 2, ry: Math.abs(U.y - Je) / 2 }) : re === "arrow" ? T.addShape({ type: "arrow", color: G, x1: Xe, y1: Je, x2: U.x, y2: U.y }) : Y && T.addShape({ type: "pixelate", x: Math.min(Xe, U.x), y: Math.min(Je, U.y), w: Math.abs(U.x - Xe), h: Math.abs(U.y - Je) }), xe();
      }), A.addEventListener("pointercancel", (N) => {
        try {
          A.releasePointerCapture(N.pointerId);
        } catch {
        }
        Ze && (_e(Ze), Ze = null), fr && (fr = !1, A.style.cursor = qe > 1 ? "grab" : "crosshair"), Kt && (Kt = !1, T.redraw());
      });
      const Io = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      D = (N) => {
        if (!document.body.contains(o)) {
          $r();
          return;
        }
        if (Ve && document.body.contains(Ve)) return;
        const U = typeof N.composedPath == "function" && N.composedPath()[0] || N.target;
        if (U && (U.tagName === "INPUT" || U.tagName === "TEXTAREA" || U.tagName === "SELECT" || U.isContentEditable)) return;
        if ((N.metaKey || N.ctrlKey) && N.key.toLowerCase() === "z") {
          N.preventDefault(), lr(b);
          return;
        }
        if (N.metaKey || N.ctrlKey || N.altKey) return;
        const Y = N.key.toLowerCase();
        Io[Y] && (N.preventDefault(), Ne(Io[Y]));
      }, document.addEventListener("keydown", D, { capture: !0 });
    }
  }
  function Bu(b) {
    const R = c[b], E = new Image();
    E.onload = () => {
      const C = document.createElement("canvas");
      C.width = E.naturalWidth, C.height = E.naturalHeight;
      const A = new Wo(C, R);
      A.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const O = document.createElement("div");
      O.className = "kl-edtb", O.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", O.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${X("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${X("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${X("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${X("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${X("x", { size: 14 })}</button>
      `, C.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const F = document.createElement("div");
      F.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", F.appendChild(C);
      const P = document.createElement("style");
      P.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(P, O, F), a.appendChild(T), $r();
      let z = 1;
      const q = (Z) => Math.max(0.05, Math.min(5, Z || 1));
      function W(Z) {
        z = q(Z), C.style.width = Math.round(C.width * z) + "px", C.style.height = Math.round(C.height * z) + "px";
        const se = O.querySelector("#klavity-zoom-pct");
        se && (se.textContent = Math.round(z * 100) + "%");
      }
      const j = () => Math.max(1, F.clientWidth - 24) / C.width, pe = () => Math.min(Math.max(1, F.clientWidth - 24) / C.width, Math.max(1, F.clientHeight - 24) / C.height), re = C.height / C.width > Math.max(1, F.clientHeight) / Math.max(1, F.clientWidth);
      W(re ? j() : pe()), O.querySelector("#klavity-zoom-in").addEventListener("click", () => W(z * 1.25)), O.querySelector("#klavity-zoom-out").addEventListener("click", () => W(z / 1.25)), O.querySelector("#klavity-fit-width").addEventListener("click", () => W(j())), O.querySelector("#klavity-fit-page").addEventListener("click", () => W(pe()));
      let G = "rect", ie = "#ef4444", we = !1, Ve = [], he = 0, xe = 0;
      function Ne(Z) {
        G = Z, O.querySelectorAll("[data-tool]").forEach((se) => {
          const Ie = se.dataset.tool === Z;
          se.style.background = Ie ? "#585b70" : "#313244", se.style.outline = Ie ? "2px solid #89b4fa" : "none";
        });
      }
      O.querySelectorAll("[data-tool]").forEach((Z) => Z.addEventListener("click", () => Ne(Z.dataset.tool))), O.querySelectorAll("[data-color]").forEach((Z) => Z.addEventListener("click", () => {
        ie = Z.dataset.color;
      }));
      {
        const Z = O.querySelector("#klavity-color-custom"), se = O.querySelector("#klavity-color-input");
        if (Z && se) {
          Z.addEventListener("click", () => se.click());
          const Ie = () => {
            Z.style.background = se.value, ie = se.value;
          };
          se.addEventListener("input", Ie), se.addEventListener("change", Ie);
        }
      }
      O.querySelector("#klavity-undo").addEventListener("click", () => A.undo()), O.querySelector("#klavity-clear-ann").addEventListener("click", () => A.clearAll());
      const xt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function It(Z) {
        const se = Z.target;
        if (se && (se.tagName === "INPUT" || se.tagName === "TEXTAREA" || se.isContentEditable)) return;
        if (Z.key === "Escape") {
          Z.stopPropagation(), Yt();
          return;
        }
        if ((Z.metaKey || Z.ctrlKey) && Z.key.toLowerCase() === "z") {
          Z.preventDefault(), A.undo();
          return;
        }
        if (Z.metaKey || Z.ctrlKey || Z.altKey) return;
        const Ie = Z.key.toLowerCase();
        xt[Ie] ? (Z.preventDefault(), Ne(xt[Ie])) : Ie === "u" && (Z.preventDefault(), A.undo());
      }
      function Yt() {
        document.removeEventListener("keydown", It, { capture: !0 }), _e(T), bo();
      }
      document.addEventListener("keydown", It, { capture: !0 }), Ne(G), O.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        $e(b), A.shapes.length ? K[b] = { w: C.width, h: C.height, shapes: A.shapes.map((Z) => ({ ...Z })) } : delete K[b], Yt(), ke();
      }), O.querySelector("#klavity-cancel-ann").addEventListener("click", () => Yt());
      function Gt(Z) {
        const se = C.getBoundingClientRect();
        return { x: (Z.clientX - se.left) / se.width * C.width, y: (Z.clientY - se.top) / se.height * C.height };
      }
      C.addEventListener("pointerdown", (Z) => {
        we = !0;
        const se = Gt(Z);
        if ({ x: he, y: xe } = se, G === "pen" && (Ve = [se]), G === "text") {
          we = !1;
          const Ie = document.createElement("input");
          Ie.style.cssText = `position:fixed;left:${Z.clientX}px;top:${Z.clientY}px;background:transparent;border:1px dashed ${ie};color:${ie};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Ie), requestAnimationFrame(() => {
            document.body.contains(Ie) && Ie.focus();
          }), Ie.addEventListener("blur", () => {
            Ie.value.trim() && A.addShape({ type: "text", color: ie, x: he, y: xe, text: Ie.value.trim() }), _e(Ie);
          }, { once: !0 }), Ie.addEventListener("keydown", (qe) => {
            qe.key === "Enter" && Ie.blur(), qe.stopPropagation();
          });
        }
      }), C.addEventListener("pointermove", (Z) => {
        we && G === "pen" && Ve.push(Gt(Z));
      }), C.addEventListener("pointerup", (Z) => {
        if (!we) return;
        we = !1;
        const se = Gt(Z);
        G === "pen" && Ve.length > 1 ? A.addShape({ type: "pen", color: ie, points: Ve }) : G === "rect" ? A.addShape({ type: "rect", color: ie, x: Math.min(he, se.x), y: Math.min(xe, se.y), w: Math.abs(se.x - he), h: Math.abs(se.y - xe) }) : G === "circle" ? A.addShape({ type: "circle", color: ie, x: (he + se.x) / 2, y: (xe + se.y) / 2, rx: Math.abs(se.x - he) / 2, ry: Math.abs(se.y - xe) / 2 }) : G === "arrow" && A.addShape({ type: "arrow", color: ie, x1: he, y1: xe, x2: se.x, y2: se.y });
      });
    }, E.src = R;
  }
  function qu(b, R) {
    const E = document.createElement("div");
    E.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const C = document.createElement("div");
    C.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = X("check", { label: "Sent", size: 22 }), C.appendChild(A);
    const T = document.createElement("h2");
    T.textContent = "Report sent", C.appendChild(T);
    const O = document.createElement("p");
    if (O.textContent = n.thankYou || "We filed it and emailed you a copy.", C.appendChild(O), b) {
      const F = document.createElement("div");
      F.className = "klavity-ref";
      const P = document.createElement("span");
      P.textContent = "Filed as";
      const z = document.createElement("code");
      z.textContent = Xo(b), F.append(P, z);
      const q = Jo(R);
      if (q) {
        const W = document.createElement("a");
        W.href = q, W.target = "_blank", W.rel = "noopener", W.textContent = "Open in Klavity", F.appendChild(W);
      }
      C.appendChild(F);
    }
    E.appendChild(C), _e(cr), a.appendChild(E), oo(C, At);
  }
  function Wu(b, R, E) {
    const { copy: C, onLead: A } = E;
    te.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const O = document.createElement("h2");
    if (O.innerHTML = C.headline, T.appendChild(O), C.body) {
      const P = document.createElement("p");
      P.textContent = C.body, T.appendChild(P);
    }
    if (b) {
      const P = document.createElement("div");
      P.className = "klavity-ref";
      const z = document.createElement("span");
      z.textContent = "Filed as";
      const q = document.createElement("code");
      q.textContent = Xo(b), P.append(z, q);
      const W = Jo(R);
      if (W) {
        const j = document.createElement("a");
        j.href = W, j.target = "_blank", j.rel = "noopener", j.textContent = "View in dashboard", P.appendChild(j);
      }
      T.appendChild(P);
    }
    const F = () => oo(te, yt);
    if (C.showEmail) {
      const P = document.createElement("div");
      P.className = "klavity-lead";
      const z = document.createElement("input");
      z.type = "email", z.placeholder = "you@company.com";
      const q = document.createElement("button"), W = C.emailLabel;
      q.textContent = W;
      const j = document.createElement("div");
      j.className = "klavity-lead-err", j.setAttribute("role", "alert"), j.style.display = "none";
      const pe = async () => {
        const re = z.value.trim();
        if (!re || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(re)) {
          j.textContent = "Please enter a valid email so we can reach you.", j.style.display = "block", z.focus();
          return;
        }
        q.disabled = !0, q.textContent = "Saving…", j.style.display = "none";
        try {
          A && await A(b, re);
        } catch (ie) {
          try {
            console.warn("[Klavity] lead capture failed:", (ie == null ? void 0 : ie.message) || ie);
          } catch {
          }
          j.textContent = "Couldn't save your email — please try again.", j.style.display = "block", q.disabled = !1, q.textContent = "Retry", z.focus();
          return;
        }
        const G = document.createElement("div");
        G.className = "klavity-thanks", G.textContent = "Thanks — we'll be in touch.", _e(j), P.replaceWith(G), C.showCta || F();
      };
      q.addEventListener("click", pe), z.addEventListener("keydown", (re) => {
        re.key === "Enter" && pe();
      }), P.append(z, q), T.appendChild(P), T.appendChild(j);
    }
    if (C.showCta && C.ctaUrl) {
      const P = document.createElement("a");
      P.className = "klavity-cta", P.href = C.ctaUrl, P.target = "_blank", P.rel = "noopener", P.textContent = C.ctaText, T.appendChild(P);
    }
    if (te.appendChild(T), !n.whiteLabel) {
      const P = document.createElement("div");
      P.className = "klavity-pb";
      const z = document.createElement("a");
      z.href = ac("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), z.target = "_blank", z.rel = "noopener", z.textContent = "Klavity", P.append("Powered by ", z), te.appendChild(P);
    }
    !C.showEmail && !C.showCta && F();
  }
  if (t.autoCaptureOnOpen) {
    let b = 0;
    try {
      b = document.getElementsByTagName("*").length;
    } catch {
      b = 0;
    }
    if (b <= g) {
      if (l = !0, ke(), Jh(t) === "screen")
        return (async () => {
          if (await fo({ viewport: !0 })) {
            l = !1, ke();
            return;
          }
          if (c.length) {
            l = !1, ke();
            return;
          }
          if (l = !0, ke(), t.onCaptureViewport) {
            ho(null).catch(() => {
              l = !1, ke();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: T, quality: O, suggestSharp: F } = Ct(A);
            l = !1, tt(T, O, void 0, !0, !!F), wt(Vt);
          }).catch(() => {
            l = !1, ke();
          });
        })(), ro;
      const R = () => {
        if (t.onCaptureViewport) {
          ho(null).catch(() => {
            l = !1, ke();
          });
          return;
        }
        t.onCaptureFull().then((C) => {
          const { dataUrl: A, quality: T, suggestSharp: O } = Ct(C);
          l = !1, tt(A, T, void 0, !0, !!O), wt(Vt);
        }).catch(() => {
          l = !1, ke();
        });
      }, E = window.requestIdleCallback;
      typeof E == "function" ? E(() => R(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(R, 0));
    }
  }
  return ro;
}
function lf(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), _e(r), _e(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    a = !0, i = p.clientX, o = p.clientY, _e(n);
  }), r.addEventListener("pointermove", (p) => {
    if (!a) return;
    const s = Math.min(p.clientX, i), h = Math.min(p.clientY, o), d = Math.abs(p.clientX - i), u = Math.abs(p.clientY - o);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${s}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s + d}px 0/calc(100% - ${s + d}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px 0/${d}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px ${h + u}px/${d}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!a) return;
    a = !1;
    const s = Math.abs(p.clientX - i), h = Math.abs(p.clientY - o);
    if (s < 8 || h < 8) {
      c(), t();
      return;
    }
    const d = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, o), w: s, h };
    c(), e(d);
  });
}
async function Zo(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return Qo(r);
    } catch {
    }
  return Qo(e);
}
function Qo(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const cf = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function uf(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function df(e) {
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
const pf = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Zt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function hf(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: o = 58,
    eyes: a = !0,
    legs: c = !0,
    animate: l = !0,
    className: p = ""
  } = e, s = Zt(e.initials || uf(t)), h = i !== "none" ? cf[i] : null, d = h ? `<span class="ksim-mark ${l ? pf[h.mark] : ""}" style="color:${Zt(h.accent)}">${df(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Zt(r)}" alt="${Zt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), x = `--ksim-persona:${Zt(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${Zt(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${Zt(t)}">${d}${m}${f}</span>`;
}
function ff(e) {
  const t = document.createElement("template");
  return t.innerHTML = hf(e).trim(), t.content.firstElementChild;
}
const mf = `
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
function gf(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = mf, t.appendChild(r);
}
function yf(e) {
  const { context: t, description: r } = e, n = t.consoleErrors.map((l) => `- [${l.level ?? "error"}] \`${l.message}\``).join(`
`) || "_none_", i = t.networkFailures.map((l) => `- ${l.method} ${l.url} → ${l.status}${l.durationMs != null ? ` (${l.durationMs}ms)` : ""}`).join(`
`) || "_none_", o = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], a = t.identity ? Object.entries(t.identity).filter(([, l]) => l != null) : [], c = t.metadata ? Object.entries(t.metadata) : [];
  return (a.length || c.length) && o.push(`*User / metadata:* ${[...a, ...c].map(([l, p]) => `${l}=${p}`).join(", ")}`), [
    ...o,
    "",
    "----",
    r,
    "",
    "*Console:*",
    n,
    "",
    "*Network:*",
    i
  ].join(`
`);
}
async function bf(e) {
  const { settings: t, type: r, description: n } = e, { baseUrl: i, email: o, token: a, projectKey: c } = t.jira, l = btoa(`${o}:${a}`), p = r === "bug" ? "Bug" : "Story", s = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = `[Klavity] ${n.slice(0, 180)}`, d = await fetch(`${i}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${l}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: c },
        summary: h,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: yf(e) }] }] },
        issuetype: { name: p },
        labels: s
      }
    })
  });
  if (!d.ok) {
    const g = await d.text();
    throw new Error(`Jira API error ${d.status}: ${g}`);
  }
  const m = (await d.json()).key, f = `${i}/browse/${m}`;
  for (const g of e.screenshots) {
    const x = await (await fetch(g)).blob(), y = new FormData();
    y.append("file", x, `klavity-screenshot-${Date.now()}.png`), await fetch(`${i}/rest/api/3/issue/${m}/attachments`, {
      method: "POST",
      headers: { Authorization: `Basic ${l}`, "X-Atlassian-Token": "no-check" },
      body: y
    });
  }
  return { issueKey: m, issueUrl: f };
}
async function vf(e) {
  var h, d, u;
  const { settings: t, type: r, description: n, context: i } = e, { apiKey: o, teamId: a } = t.linear, c = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`
  ].join(`
`), p = await (await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: o,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        mutation IssueCreate($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier url }
          }
        }
      `,
      variables: {
        input: {
          teamId: a,
          title: `[Klavity] ${n.slice(0, 180)}`,
          description: c,
          labelNames: r === "bug" ? ["Bug"] : []
        }
      }
    })
  })).json();
  if ((h = p.errors) != null && h.length)
    throw new Error(`Linear API error: ${p.errors[0].message}`);
  const s = (u = (d = p.data) == null ? void 0 : d.issueCreate) == null ? void 0 : u.issue;
  if (!s) throw new Error("Linear: no issue returned");
  return { issueKey: s.identifier, issueUrl: s.url };
}
async function kf(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o } = e, { token: a, repo: c } = t.github, l = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], p = o.length ? `

<details><summary>Screenshots (${o.length})</summary>

${o.map((u, m) => `![screenshot-${m + 1}](${u})`).join(`
`)}

</details>` : "", s = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`,
    `**Screen:** ${i.screenSize} | **Viewport:** ${i.viewportSize}`,
    p
  ].join(`
`), h = await fetch(`https://api.github.com/repos/${c}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${a}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: `[Klavity] ${n.slice(0, 180)}`,
      body: s,
      labels: l
    })
  });
  if (!h.ok)
    throw new Error(`GitHub API error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return { issueKey: `#${d.number}`, issueUrl: d.html_url };
}
async function wf(e) {
  const { settings: t, description: r, context: n } = e, { token: i, workspace: o, projectId: a } = t.plane, c = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), l = c === "https://api.plane.so" ? "https://app.plane.so" : c, p = await fetch(
    `${c}/api/v1/workspaces/${o}/projects/${a}/issues/`,
    {
      method: "POST",
      headers: { "X-API-Key": i, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `[Klavity] ${r.slice(0, 180)}`,
        description_html: `<p>${r}</p><p><strong>Page:</strong> ${n.pageUrl}</p>`
      })
    }
  );
  if (!p.ok) throw new Error(`Plane API error ${p.status}: ${await p.text()}`);
  const s = await p.json();
  return {
    issueKey: String(s.sequence_id),
    issueUrl: `${l}/${o}/projects/${a}/issues/`
  };
}
function xf(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Sf(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: a, replayEvents: c } = e, l = xf({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: a, replayEvents: c }), p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
    const { plane: u } = t;
    l.append("plane_token", u.token), l.append("plane_workspace", u.workspace), l.append("plane_project_id", u.projectId), l.append("plane_host", u.host);
  }
  for (let u = 0; u < o.length; u++) {
    const m = await (await fetch(o[u])).blob();
    l.append("screenshots", m, `screenshot-${u}.png`);
  }
  const s = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: s, body: l });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return {
    issueKey: d.jira_key ?? d.id,
    issueUrl: d.issue_url ?? t.backendUrl
  };
}
var Cf = Object.defineProperty, Ef = (e, t, r) => t in e ? Cf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, B = (e, t, r) => Ef(e, typeof t != "symbol" ? t + "" : t, r), ea, Mf = Object.defineProperty, Rf = (e, t, r) => t in e ? Mf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ta = (e, t, r) => Rf(e, typeof t != "symbol" ? t + "" : t, r), De = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(De || {});
const ra = {
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
}, na = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, dn = {}, uc = {}, Af = () => !!globalThis.Zone;
function Ns(e) {
  if (dn[e])
    return dn[e];
  const t = globalThis[e], r = t.prototype, n = e in ra ? ra[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in na ? na[e] : void 0, a = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Af())
    return dn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), uc[e] = () => c.remove()) : c.remove(), dn[e] = p;
  } catch {
    return r;
  }
}
const fi = {};
function _t(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (fi[i])
    return fi[i].call(
      t
    );
  const o = Ns(e), a = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return a ? (fi[i] = a, a.call(t)) : t[r];
}
const mi = {};
function dc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (mi[n])
    return mi[n].bind(
      t
    );
  const o = Ns(e)[r];
  return typeof o != "function" ? t[r] : (mi[n] = o, o.bind(t));
}
function Tf(e) {
  return _t("Node", e, "ownerDocument");
}
function Lf(e) {
  return _t("Node", e, "childNodes");
}
function If(e) {
  return _t("Node", e, "parentNode");
}
function Of(e) {
  return _t("Node", e, "parentElement");
}
function _f(e) {
  return _t("Node", e, "textContent");
}
function Nf(e, t) {
  return dc("Node", e, "contains")(t);
}
function Pf(e) {
  return dc("Node", e, "getRootNode")();
}
function $f(e) {
  return !e || !("host" in e) ? null : _t("ShadowRoot", e, "host");
}
function Df(e) {
  return e.styleSheets;
}
function zf(e) {
  return !e || !("shadowRoot" in e) ? null : _t("Element", e, "shadowRoot");
}
function Ff(e, t) {
  return _t("Element", e, "querySelector")(t);
}
function Uf(e, t) {
  return _t("Element", e, "querySelectorAll")(t);
}
function Bf() {
  return [
    Ns("MutationObserver").constructor,
    uc.MutationObserver ?? (() => {
    })
  ];
}
let pc = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (pc = () => (/* @__PURE__ */ new Date()).getTime());
function qf(e, t, r) {
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
const je = {
  ownerDocument: Tf,
  childNodes: Lf,
  parentNode: If,
  parentElement: Of,
  textContent: _f,
  contains: Nf,
  getRootNode: Pf,
  host: $f,
  styleSheets: Df,
  shadowRoot: zf,
  querySelector: Ff,
  querySelectorAll: Uf,
  nowTimestamp: pc,
  mutationObserverCtor: Bf,
  patch: qf
};
function hc(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Br(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && je.host(e) || null
  );
  return !!(t && "shadowRoot" in t && je.shadowRoot(t) === e);
}
function qr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Wf(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function jf(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Ss(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => fc(i, r)
    ).join("");
    return Wf(n);
  } catch {
    return null;
  }
}
function fc(e, t) {
  if (Vf(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Ss(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      jf(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Tn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Yf(e) && e.selectorText.includes(":") && (r = Hf(r)), t ? Tn(r, t) : r;
  }
}
function Hf(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Vf(e) {
  return "styleSheet" in e;
}
function Yf(e) {
  return "selectorText" in e;
}
class mc {
  constructor() {
    ta(this, "idNodeMap", /* @__PURE__ */ new Map()), ta(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Gf() {
  return new mc();
}
function Rn({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let a = i || "";
  const c = n && ir(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? a = o(a, e) : a = "*".repeat(a.length)), a;
}
function ir(e) {
  return e.toLowerCase();
}
const ia = "__rrweb_original__";
function Kf(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, a = ia in o ? o[ia] : o;
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
function An(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ir(t)
  ) : null;
}
function gc(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Xf(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Jf = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Zf = /^(?:[a-z+]+:)?\/\//i, Qf = /^www\..*/i, em = /^(data:)([^,]*),(.*)/i;
function Tn(e, t) {
  return (e || "").replace(
    Jf,
    (r, n, i, o, a, c) => {
      const l = i || a || c, p = n || o || "";
      if (!l)
        return r;
      if (Zf.test(l) || Qf.test(l))
        return `url(${p}${l}${p})`;
      if (em.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${Xf(t) + l}${p})`;
      const s = t.split("/"), h = l.split("/");
      s.pop();
      for (const d of h)
        d !== "." && (d === ".." ? s.pop() : s.push(d));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function pn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function tm(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = pn(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = pn(
          n[l].textContent,
          r
        ), s = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let d = p.substring(0, h), u = a.split(d), m = -1;
          if (u.length === 2)
            m = u[0].length;
          else if (u.length > 2 && u[0] === "" && n[l - 1].textContent !== "")
            m = a.indexOf(d, 1);
          else if (u.length === 1) {
            if (d = d.substring(
              0,
              d.length - 1
            ), u = a.split(d), u.length <= 1)
              return i.push(e), i;
            h = s + 1;
          } else h === p.length - 1 && (m = a.indexOf(d));
          if (u.length >= 2 && h > s) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const g = pn(f).length;
              m = a.indexOf(d, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = pn(
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
function rm(e, t) {
  return tm(e, t).join("/* rr_split */");
}
let nm = 1;
const im = new RegExp("[^a-z0-9-_:]"), Yr = -2;
function yc() {
  return nm++;
}
function sm(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = ir(e.tagName);
  return im.test(t) ? "div" : t;
}
let gr, sa;
const om = /^[^ \t\n\r\u000c]+/, am = /^[, \t\n\r\u000c]+/;
function lm(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let a;
    const c = o.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(am), !(r >= t.length); ) {
    let o = n(om);
    if (o.slice(-1) === ",")
      o = kr(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let a = "";
      o = kr(e, o);
      let c = !1;
      for (; ; ) {
        const l = t.charAt(r);
        if (l === "") {
          i.push((o + a).trim());
          break;
        } else if (c)
          l === ")" && (c = !1);
        else if (l === ",") {
          r += 1, i.push((o + a).trim());
          break;
        } else l === "(" && (c = !0);
        a += l, r += 1;
      }
    }
  }
  return i.join(", ");
}
const oa = /* @__PURE__ */ new WeakMap();
function kr(e, t) {
  return !t || t.trim() === "" ? t : Ps(e, t);
}
function cm(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Ps(e, t) {
  let r = oa.get(e);
  if (r || (r = e.createElement("a"), oa.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function bc(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? kr(e, n) : r === "srcset" ? lm(e, n) : r === "style" ? Tn(n, Ps(e)) : t === "object" && r === "data" ? kr(e, n) : n);
}
function vc(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function um(e, t, r) {
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
function Ln(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Ln(je.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Ln(je.parentNode(e), t, r) : !1;
}
function kc(e, t, r, n) {
  let i;
  if (hc(e)) {
    if (i = e, !je.childNodes(i).length)
      return !1;
  } else {
    if (je.parentElement(e) === null)
      return !1;
    i = je.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Ln(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function dm(e, t, r) {
  const n = e.contentWindow;
  if (!n)
    return;
  let i = !1, o;
  try {
    o = n.document.readyState;
  } catch {
    return;
  }
  if (o !== "complete") {
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
function pm(e, t, r) {
  let n = !1, i;
  try {
    i = e.sheet;
  } catch {
    return;
  }
  if (i) return;
  const o = setTimeout(() => {
    n || (t(), n = !0);
  }, r);
  e.addEventListener("load", () => {
    clearTimeout(o), n = !0, t();
  });
}
function hm(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: a,
    inlineStylesheet: c,
    maskInputOptions: l = {},
    maskTextFn: p,
    maskInputFn: s,
    dataURLOptions: h = {},
    inlineImages: d,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, x = fm(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: De.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: De.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: De.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return gm(e, {
        doc: r,
        blockClass: i,
        blockSelector: o,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: s,
        dataURLOptions: h,
        inlineImages: d,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: x
      });
    case e.TEXT_NODE:
      return mm(e, {
        doc: r,
        needsMask: a,
        maskTextFn: p,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: De.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: De.Comment,
        textContent: je.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function fm(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function mm(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, a = je.parentNode(e), c = a && a.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, s = c === "SCRIPT" ? !0 : void 0;
  return s ? l = "SCRIPT_PLACEHOLDER" : o || (l = je.textContent(e), p && l && (l = Tn(l, Ps(t.doc)))), !p && !s && l && r && (l = n ? n(l, je.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: De.Text,
    textContent: l || "",
    rootId: i
  };
}
function gm(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: o,
    maskInputOptions: a = {},
    maskInputFn: c,
    dataURLOptions: l = {},
    inlineImages: p,
    recordCanvas: s,
    keepIframeSrcFn: h,
    newlyAddedElement: d = !1,
    rootId: u
  } = t, m = um(e, n, i), f = sm(e);
  let g = {};
  const x = e.attributes.length;
  for (let v = 0; v < x; v++) {
    const S = e.attributes[v];
    vc(f, S.name, S.value) || (g[S.name] = bc(
      r,
      f,
      ir(S.name),
      S.value
    ));
  }
  if (f === "link" && o) {
    const v = Array.from(r.styleSheets).find((k) => k.href === e.href);
    let S = null;
    v && (S = Ss(v)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let v = Ss(
      e.sheet
    );
    v && (e.childNodes.length > 1 && (v = rm(v, e)), g._cssText = v);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const v = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && v ? g.value = Rn({
      element: e,
      type: An(e),
      tagName: f,
      value: v,
      maskInputOptions: a,
      maskInputFn: c
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !a.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      Kf(e) || (g.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const v = e.toDataURL(
        l.type,
        l.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const k = S.toDataURL(
        l.type,
        l.quality
      );
      v !== k && (g.rr_dataURL = v);
    }
  }
  if (f === "img" && p) {
    gr || (gr = r.createElement("canvas"), sa = gr.getContext("2d"));
    const v = e, S = v.currentSrc || v.getAttribute("src") || "<unknown-src>", k = v.crossOrigin, w = () => {
      v.removeEventListener("load", w);
      try {
        gr.width = v.naturalWidth, gr.height = v.naturalHeight, sa.drawImage(v, 0, 0), g.rr_dataURL = gr.toDataURL(
          l.type,
          l.quality
        );
      } catch (M) {
        if (v.crossOrigin !== "anonymous") {
          v.crossOrigin = "anonymous", v.complete && v.naturalWidth !== 0 ? w() : v.addEventListener("load", w);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${M}`
          );
      }
      v.crossOrigin === "anonymous" && (k ? g.crossOrigin = k : v.removeAttribute("crossorigin"));
    };
    v.complete && v.naturalWidth !== 0 ? w() : v.addEventListener("load", w);
  }
  if (["audio", "video"].includes(f)) {
    const v = g;
    v.rr_mediaState = e.paused ? "paused" : "played", v.rr_mediaCurrentTime = e.currentTime, v.rr_mediaPlaybackRate = e.playbackRate, v.rr_mediaMuted = e.muted, v.rr_mediaLoop = e.loop, v.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: v, height: S } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${v}px`,
      rr_height: `${S}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let y;
  try {
    customElements.get(f) && (y = !0);
  } catch {
  }
  return {
    type: De.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: cm(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: y
  };
}
function Se(e) {
  return e == null ? "" : e.toLowerCase();
}
function wc(e) {
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
function ym(e, t) {
  if (t.comment && e.type === De.Comment)
    return !0;
  if (e.type === De.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && gc(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (Se(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || Se(e.attributes.name) === "application-name" || Se(e.attributes.rel) === "icon" || Se(e.attributes.rel) === "apple-touch-icon" || Se(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && Se(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (Se(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      Se(e.attributes.name).match(/^(og|twitter):/) || Se(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (Se(e.attributes.name) === "robots" || Se(e.attributes.name) === "googlebot" || Se(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (Se(e.attributes.name) === "author" || Se(e.attributes.name) === "generator" || Se(e.attributes.name) === "framework" || Se(e.attributes.name) === "publisher" || Se(e.attributes.name) === "progid" || Se(e.attributes.property).match(/^article:/) || Se(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (Se(e.attributes.name) === "google-site-verification" || Se(e.attributes.name) === "yandex-verification" || Se(e.attributes.name) === "csrf-token" || Se(e.attributes.name) === "p:domain_verify" || Se(e.attributes.name) === "verify-v1" || Se(e.attributes.name) === "verification" || Se(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function wr(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    maskTextClass: a,
    maskTextSelector: c,
    skipChild: l = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: s = {},
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: u,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: x,
    onIframeLoad: y,
    iframeLoadTimeout: v = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: k = 5e3,
    keepIframeSrcFn: w = () => !1,
    newlyAddedElement: M = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: $ } = t, { preserveWhiteSpace: _ = !0 } = t;
  $ || ($ = kc(
    e,
    a,
    c,
    $ === void 0
  ));
  const Q = hm(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: $,
    inlineStylesheet: p,
    maskInputOptions: s,
    maskTextFn: h,
    maskInputFn: d,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: w,
    newlyAddedElement: M,
    cssCaptured: I
  });
  if (!Q)
    return console.warn(e, "not serialized"), null;
  let V;
  n.hasNode(e) ? V = n.getId(e) : ym(Q, u) || !_ && Q.type === De.Text && !Q.textContent.replace(/^\s+|\s+$/gm, "").length ? V = Yr : V = yc();
  const L = Object.assign(Q, { id: V });
  if (n.add(e, L), V === Yr)
    return null;
  x && x(e);
  let Le = !l;
  if (L.type === De.Element) {
    Le = Le && !L.needBlock, delete L.needBlock;
    const K = je.shadowRoot(e);
    K && qr(K) && (L.isShadowHost = !0);
  }
  if ((L.type === De.Document || L.type === De.Element) && Le) {
    u.headWhitespace && L.type === De.Element && L.tagName === "head" && (_ = !1);
    const K = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: o,
      needsMask: $,
      maskTextClass: a,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: p,
      maskInputOptions: s,
      maskTextFn: h,
      maskInputFn: d,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: _,
      onSerialize: x,
      onIframeLoad: y,
      iframeLoadTimeout: v,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: k,
      keepIframeSrcFn: w,
      cssCaptured: !1
    };
    if (!(L.type === De.Element && L.tagName === "textarea" && L.attributes.value !== void 0)) {
      L.type === De.Element && L.attributes._cssText !== void 0 && typeof L.attributes._cssText == "string" && (K.cssCaptured = !0);
      for (const Te of Array.from(je.childNodes(e))) {
        const Me = wr(Te, K);
        Me && L.childNodes.push(Me);
      }
    }
    let ee = null;
    if (hc(e) && (ee = je.shadowRoot(e)))
      for (const Te of Array.from(je.childNodes(ee))) {
        const Me = wr(Te, K);
        Me && (qr(ee) && (Me.isShadow = !0), L.childNodes.push(Me));
      }
  }
  const ze = je.parentNode(e);
  return ze && Br(ze) && qr(ze) && (L.isShadow = !0), L.type === De.Element && L.tagName === "iframe" && dm(
    e,
    () => {
      const K = e.contentDocument;
      if (K && y) {
        const ee = wr(K, {
          doc: K,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: s,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: _,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: k,
          keepIframeSrcFn: w
        });
        ee && y(
          e,
          ee
        );
      }
    },
    v
  ), L.type === De.Element && L.tagName === "link" && typeof L.attributes.rel == "string" && (L.attributes.rel === "stylesheet" || L.attributes.rel === "preload" && typeof L.attributes.href == "string" && gc(L.attributes.href) === "css") && pm(
    e,
    () => {
      if (S) {
        const K = wr(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: s,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: _,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: k,
          keepIframeSrcFn: w
        });
        K && S(
          e,
          K
        );
      }
    },
    k
  ), L;
}
function bm(e, t) {
  const {
    mirror: r = new mc(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: a = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: p = !1,
    maskAllInputs: s = !1,
    maskTextFn: h,
    maskInputFn: d,
    slimDOM: u = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: y,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: k = () => !1
  } = t, w = s === !0 ? {
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
  } : s === !1 ? {
    password: !0
  } : s, M = wc(u);
  return wr(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: o,
    maskTextSelector: a,
    skipChild: !1,
    inlineStylesheet: c,
    maskInputOptions: w,
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: M,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: y,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: k,
    newlyAddedElement: !1
  });
}
function vm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function km(e) {
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
var hn = { exports: {} }, aa;
function wm() {
  if (aa) return hn.exports;
  aa = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return hn.exports = t(), hn.exports.createColors = t, hn.exports;
}
const xm = {}, Sm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: xm
}, Symbol.toStringTag, { value: "Module" })), ft = /* @__PURE__ */ km(Sm);
var gi, la;
function $s() {
  if (la) return gi;
  la = 1;
  let e = /* @__PURE__ */ wm(), t = ft;
  class r extends Error {
    constructor(i, o, a, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof o < "u" && typeof a < "u" && (typeof o == "number" ? (this.line = o, this.column = a) : (this.line = o.line, this.column = o.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let a = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), p = String(l).length, s, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        s = (f) => d(m(f)), h = (f) => u(f);
      } else
        s = h = (d) => d;
      return a.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return s(">") + h(f) + d + `
 ` + g + s("^");
        }
        return " " + h(f) + d;
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
  return gi = r, r.default = r, gi;
}
var fn = {}, ca;
function Ds() {
  return ca || (ca = 1, fn.isClean = Symbol("isClean"), fn.my = Symbol("my")), fn;
}
var yi, ua;
function xc() {
  if (ua) return yi;
  ua = 1;
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
    atrule(i, o) {
      let a = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? a += i.raws.afterName : c && (a += " "), i.nodes)
        this.block(i, a + c);
      else {
        let l = (i.raws.between || "") + (o ? ";" : "");
        this.builder(a + c + l, i);
      }
    }
    beforeAfter(i, o) {
      let a;
      i.type === "decl" ? a = this.raw(i, null, "beforeDecl") : i.type === "comment" ? a = this.raw(i, null, "beforeComment") : o === "before" ? a = this.raw(i, null, "beforeRule") : a = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (a.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let s = 0; s < l; s++) a += p;
      }
      return a;
    }
    block(i, o) {
      let a = this.raw(i, "between", "beforeOpen");
      this.builder(o + a + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let a = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, o !== c || a);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), a = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + a + "*/", i);
    }
    decl(i, o) {
      let a = this.raw(i, "between", "colon"), c = i.prop + a + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, a) {
      let c;
      if (a || (a = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let l = i.parent;
      if (a === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[a];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[a] < "u")
        return p.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let s = "raw" + t(a);
        this[s] ? c = this[s](p, i) : p.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), p.rawCache[a] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length > 0 && typeof a.raws.after < "u")
          return o = a.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let a;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(o, null, "beforeDecl") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeDecl(i, o) {
      let a;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(o, null, "beforeRule") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((a) => {
        if (a.type !== "decl" && (o = a.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && (a.parent !== i || i.first !== a) && typeof a.raws.before < "u")
          return o = a.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((a) => {
        if (typeof a.raws.between < "u")
          return o = a.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length === 0 && (o = a.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((a) => {
        let c = a.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof a.raws.before < "u") {
          let l = a.raws.before.split(`
`);
          return o = l[l.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length && a.last.type === "decl" && (o = a.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let a = i[o], c = i.raws[o];
      return c && c.value === a ? c.raw : a;
    }
    root(i) {
      this.body(i), i.raws.after && this.builder(i.raws.after);
    }
    rule(i) {
      this.block(i, this.rawValue(i, "selector")), i.raws.ownSemicolon && this.builder(i.raws.ownSemicolon, i, "end");
    }
    stringify(i, o) {
      if (!this[i.type])
        throw new Error(
          "Unknown AST node type " + i.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[i.type](i, o);
    }
  }
  return yi = r, r.default = r, yi;
}
var bi, da;
function Un() {
  if (da) return bi;
  da = 1;
  let e = xc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return bi = t, t.default = t, bi;
}
var vi, pa;
function Bn() {
  if (pa) return vi;
  pa = 1;
  let { isClean: e, my: t } = Ds(), r = $s(), n = xc(), i = Un();
  function o(c, l) {
    let p = new c.constructor();
    for (let s in c) {
      if (!Object.prototype.hasOwnProperty.call(c, s) || s === "proxyCache") continue;
      let h = c[s], d = typeof h;
      s === "parent" && d === "object" ? l && (p[s] = l) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((u) => o(u, p)) : (d === "object" && h !== null && (h = o(h)), p[s] = h);
    }
    return p;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let s of l[p])
            typeof s.clone == "function" ? this.append(s.clone()) : this.append(s);
        } else
          this[p] = l[p];
    }
    addToError(l) {
      if (l.postcssNode = this, l.stack && this.source && /\n\s{4}at /.test(l.stack)) {
        let p = this.source;
        l.stack = l.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return l;
    }
    after(l) {
      return this.parent.insertAfter(this, l), this;
    }
    assign(l = {}) {
      for (let p in l)
        this[p] = l[p];
      return this;
    }
    before(l) {
      return this.parent.insertBefore(this, l), this;
    }
    cleanRaws(l) {
      delete this.raws.before, delete this.raws.after, l || delete this.raws.between;
    }
    clone(l = {}) {
      let p = o(this);
      for (let s in l)
        p[s] = l[s];
      return p;
    }
    cloneAfter(l = {}) {
      let p = this.clone(l);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(l = {}) {
      let p = this.clone(l);
      return this.parent.insertBefore(this, p), p;
    }
    error(l, p = {}) {
      if (this.source) {
        let { end: s, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: s.column, line: s.line },
          p
        );
      }
      return new r(l);
    }
    getProxyProcessor() {
      return {
        get(l, p) {
          return p === "proxyOf" ? l : p === "root" ? () => l.root().toProxy() : l[p];
        },
        set(l, p, s) {
          return l[p] === s || (l[p] = s, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && l.markDirty()), !0;
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
    positionBy(l, p) {
      let s = this.source.start;
      if (l.index)
        s = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (s = this.positionInside(h, p));
      }
      return s;
    }
    positionInside(l, p) {
      let s = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        s[u] === `
` ? (h = 1, d += 1) : h += 1;
      return { column: h, line: d };
    }
    prev() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l - 1];
    }
    rangeBy(l) {
      let p = {
        column: this.source.start.column,
        line: this.source.start.line
      }, s = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), s = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? s = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? s = this.positionInside(l.endIndex) : l.index && (s = this.positionInside(l.index + 1));
      return (s.line < p.line || s.line === p.line && s.column <= p.column) && (s = { column: p.column + 1, line: p.line }), { end: s, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, s = !1;
        for (let h of l)
          h === this ? s = !0 : s ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        s || this.remove();
      }
      return this;
    }
    root() {
      let l = this;
      for (; l.parent && l.parent.type !== "document"; )
        l = l.parent;
      return l;
    }
    toJSON(l, p) {
      let s = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          s[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          s[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), s[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          s[u] = m;
      }
      return h && (s.inputs = [...p.keys()].map((u) => u.toJSON())), s;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (s) => {
        p += s;
      }), p;
    }
    warn(l, p, s) {
      let h = { node: this };
      for (let d in s) h[d] = s[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return vi = a, a.default = a, vi;
}
var ki, ha;
function qn() {
  if (ha) return ki;
  ha = 1;
  let e = Bn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ki = t, t.default = t, ki;
}
var wi, fa;
function Cm() {
  if (fa) return wi;
  fa = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return wi = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let a = "", c = o;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, wi;
}
var xi, ma;
function Sc() {
  if (ma) return xi;
  ma = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { existsSync: r, readFileSync: n } = ft, { dirname: i, join: o } = ft;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, s) {
      if (s.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = s.map ? s.map.prev : void 0, d = this.loadMap(s.from, h);
      !this.mapFile && s.from && (this.mapFile = s.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let s = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (s.test(p) || h.test(p))
        return a(p.substr(RegExp.lastMatch.length));
      let m = p.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(p) {
      return p.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(p) {
      return typeof p != "object" ? !1 : typeof p.mappings == "string" || typeof p._mappings == "string" || Array.isArray(p.sections);
    }
    loadAnnotation(p) {
      let s = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!s) return;
      let h = p.lastIndexOf(s.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, s) {
      if (s === !1) return !1;
      if (s) {
        if (typeof s == "string")
          return s;
        if (typeof s == "function") {
          let h = s(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
          }
        } else {
          if (s instanceof e)
            return t.fromSourceMap(s).toString();
          if (s instanceof t)
            return s.toString();
          if (this.isMap(s))
            return JSON.stringify(s);
          throw new Error(
            "Unsupported previous source map format: " + s.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return p && (h = o(i(p), h)), this.loadFile(h);
        }
      }
    }
    startWith(p, s) {
      return p ? p.substr(0, s.length) === s : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return xi = c, c.default = c, xi;
}
var Si, ga;
function Wn() {
  if (ga) return Si;
  ga = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { fileURLToPath: r, pathToFileURL: n } = ft, { isAbsolute: i, resolve: o } = ft, { nanoid: a } = /* @__PURE__ */ Cm(), c = ft, l = $s(), p = Sc(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!d || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), d && h) {
        let x = new p(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let v, S, k;
      if (g && typeof g == "object") {
        let M = g, I = x;
        if (typeof M.offset == "number") {
          let $ = this.fromOffset(M.offset);
          g = $.line, x = $.col;
        } else
          g = M.line, x = M.column;
        if (typeof I.offset == "number") {
          let $ = this.fromOffset(I.offset);
          S = $.line, k = $.col;
        } else
          S = I.line, k = I.column;
      } else if (!x) {
        let M = this.fromOffset(g);
        g = M.line, x = M.col;
      }
      let w = this.origin(g, x, S, k);
      return w ? v = new l(
        f,
        w.endLine === void 0 ? w.line : { column: w.column, line: w.line },
        w.endLine === void 0 ? w.column : { column: w.endColumn, line: w.endLine },
        w.source,
        w.file,
        y.plugin
      ) : v = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: k, line: S },
        this.css,
        this.file,
        y.plugin
      ), v.input = { column: x, endColumn: k, endLine: S, line: g, source: this.css }, this.file && (n && (v.input.url = n(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let v = this.css.split(`
`);
        x = new Array(v.length);
        let S = 0;
        for (let k = 0, w = v.length; k < w; k++)
          x[k] = S, S += v[k].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; y < v; )
          if (S = y + (v - y >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            y = S + 1;
          else {
            y = S;
            break;
          }
      }
      return {
        col: f - x[y] + 1,
        line: y + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let k;
      typeof x == "number" && (k = v.originalPositionFor({ column: y, line: x }));
      let w;
      i(S.source) ? w = n(S.source) : w = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let M = {
        column: S.column,
        endColumn: k && k.column,
        endLine: k && k.line,
        line: S.line,
        url: w.toString()
      };
      if (w.protocol === "file:")
        if (r)
          M.file = r(w);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = v.sourceContentFor(S.source);
      return I && (M.source = I), M;
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
  return Si = u, u.default = u, c && c.registerInput && c.registerInput(u), Si;
}
var Ci, ya;
function Cc() {
  if (ya) return Ci;
  ya = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { dirname: r, relative: n, resolve: i, sep: o } = ft, { pathToFileURL: a } = ft, c = Wn(), l = !!(e && t), p = !!(r && i && n && o);
  class s {
    constructor(d, u, m, f) {
      this.stringify = d, this.mapOpts = m.map || {}, this.root = u, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let d;
      this.isInline() ? d = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? d = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? d = this.mapOpts.annotation(this.opts.to, this.root) : d = this.outputFile() + ".map";
      let u = `
`;
      this.css.includes(`\r
`) && (u = `\r
`), this.css += u + "/*# sourceMappingURL=" + d + " */";
    }
    applyPrevMaps() {
      for (let d of this.previous()) {
        let u = this.toUrl(this.path(d.file)), m = d.root || r(d.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(d.text), f.sourcesContent && (f.sourcesContent = null)) : f = d.consumer(), this.map.applySourceMap(f, u, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let d;
          for (let u = this.root.nodes.length - 1; u >= 0; u--)
            d = this.root.nodes[u], d.type === "comment" && d.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(u);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && l && this.isMap())
        return this.generateMap();
      {
        let d = "";
        return this.stringify(this.root, (u) => {
          d += u;
        }), [d];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let d = this.previous()[0].consumer();
        d.file = this.outputFile(), this.map = t.fromSourceMap(d, {
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
      let d = 1, u = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (y, v, S) => {
        if (this.css += y, v && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (d += g.length, x = y.lastIndexOf(`
`), u = y.length - x) : u += y.length, v && S !== "start") {
          let k = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== k.last || k.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((d) => d.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let d = this.mapOpts.annotation;
      return typeof d < "u" && d !== !0 ? !1 : this.previous().length ? this.previous().some((u) => u.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((d) => d.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(d) {
      if (this.mapOpts.absolute || d.charCodeAt(0) === 60 || /^\w+:\/\//.test(d)) return d;
      let u = this.memoizedPaths.get(d);
      if (u) return u;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, d);
      return this.memoizedPaths.set(d, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((d) => {
            if (d.source && d.source.input.map) {
              let u = d.source.input.map;
              this.previousMaps.includes(u) || this.previousMaps.push(u);
            }
          });
        else {
          let d = new c(this.originalCSS, this.opts);
          d.map && this.previousMaps.push(d.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let d = {};
      if (this.root)
        this.root.walk((u) => {
          if (u.source) {
            let m = u.source.input.from;
            if (m && !d[m]) {
              d[m] = !0;
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
    sourcePath(d) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(d.source.input.from) : this.toUrl(this.path(d.source.input.from));
    }
    toBase64(d) {
      return Buffer ? Buffer.from(d).toString("base64") : window.btoa(unescape(encodeURIComponent(d)));
    }
    toFileUrl(d) {
      let u = this.memoizedFileURLs.get(d);
      if (u) return u;
      if (a) {
        let m = a(d).toString();
        return this.memoizedFileURLs.set(d, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(d) {
      let u = this.memoizedURLs.get(d);
      if (u) return u;
      o === "\\" && (d = d.replace(/\\/g, "/"));
      let m = encodeURI(d).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(d, m), m;
    }
  }
  return Ci = s, Ci;
}
var Ei, ba;
function jn() {
  if (ba) return Ei;
  ba = 1;
  let e = Bn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ei = t, t.default = t, Ei;
}
var Mi, va;
function sr() {
  if (va) return Mi;
  va = 1;
  let { isClean: e, my: t } = Ds(), r = qn(), n = jn(), i = Bn(), o, a, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function s(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        s(u);
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
            ...f.map((g) => typeof g == "function" ? (x, y) => g(x.toProxy(), y) : g)
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
      for (let y of g) this.proxyOf.nodes.splice(f + 1, 0, y);
      let x;
      for (let y in this.indexes)
        x = this.indexes[y], f < x && (this.indexes[y] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let y;
      for (let v in this.indexes)
        y = this.indexes[v], f <= y && (this.indexes[v] = y + x.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = p(o(u).nodes);
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
      return u.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && s(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
  return h.registerParse = (d) => {
    o = d;
  }, h.registerRule = (d) => {
    a = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, Mi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Mi;
}
var Ri, ka;
function zs() {
  if (ka) return Ri;
  ka = 1;
  let e = sr(), t, r;
  class n extends e {
    constructor(o) {
      super({ type: "document", ...o }), this.nodes || (this.nodes = []);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Ri = n, n.default = n, Ri;
}
var Ai, wa;
function Ec() {
  if (wa) return Ai;
  wa = 1;
  let e = {};
  return Ai = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Ai;
}
var Ti, xa;
function Mc() {
  if (xa) return Ti;
  xa = 1;
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
  return Ti = e, e.default = e, Ti;
}
var Li, Sa;
function Fs() {
  if (Sa) return Li;
  Sa = 1;
  let e = Mc();
  class t {
    constructor(n, i, o) {
      this.processor = n, this.messages = [], this.root = i, this.opts = o, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(n, i = {}) {
      i.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (i.plugin = this.lastPlugin.postcssPlugin);
      let o = new e(n, i);
      return this.messages.push(o), o;
    }
    warnings() {
      return this.messages.filter((n) => n.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return Li = t, t.default = t, Li;
}
var Ii, Ca;
function Em() {
  if (Ca) return Ii;
  Ca = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, a = 12, c = 9, l = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, y = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, k = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return Ii = function(I, $ = {}) {
    let _ = I.css.valueOf(), Q = $.ignoreErrors, V, L, Le, ze, K, ee, Te, Me, ae, J, be = _.length, D = 0, et = [], Be = [];
    function gt() {
      return D;
    }
    function Ce(H) {
      throw I.error("Unclosed " + H, D);
    }
    function Pe() {
      return Be.length === 0 && D >= be;
    }
    function At(H) {
      if (Be.length) return Be.pop();
      if (D >= be) return;
      let ue = H ? H.ignoreUnclosed : !1;
      switch (V = _.charCodeAt(D), V) {
        case i:
        case o:
        case c:
        case l:
        case a: {
          L = D;
          do
            L += 1, V = _.charCodeAt(L);
          while (V === o || V === i || V === c || V === l || V === a);
          J = ["space", _.slice(D, L)], D = L - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ge = String.fromCharCode(V);
          J = [ge, ge, D];
          break;
        }
        case h: {
          if (Me = et.length ? et.pop()[1] : "", ae = _.charCodeAt(D + 1), Me === "url" && ae !== e && ae !== t && ae !== o && ae !== i && ae !== c && ae !== a && ae !== l) {
            L = D;
            do {
              if (ee = !1, L = _.indexOf(")", L + 1), L === -1)
                if (Q || ue) {
                  L = D;
                  break;
                } else
                  Ce("bracket");
              for (Te = L; _.charCodeAt(Te - 1) === r; )
                Te -= 1, ee = !ee;
            } while (ee);
            J = ["brackets", _.slice(D, L + 1), D, L], D = L;
          } else
            L = _.indexOf(")", D + 1), ze = _.slice(D, L + 1), L === -1 || k.test(ze) ? J = ["(", "(", D] : (J = ["brackets", ze, D, L], D = L);
          break;
        }
        case e:
        case t: {
          Le = V === e ? "'" : '"', L = D;
          do {
            if (ee = !1, L = _.indexOf(Le, L + 1), L === -1)
              if (Q || ue) {
                L = D + 1;
                break;
              } else
                Ce("string");
            for (Te = L; _.charCodeAt(Te - 1) === r; )
              Te -= 1, ee = !ee;
          } while (ee);
          J = ["string", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        case y: {
          v.lastIndex = D + 1, v.test(_), v.lastIndex === 0 ? L = _.length - 1 : L = v.lastIndex - 2, J = ["at-word", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        case r: {
          for (L = D, K = !0; _.charCodeAt(L + 1) === r; )
            L += 1, K = !K;
          if (V = _.charCodeAt(L + 1), K && V !== n && V !== o && V !== i && V !== c && V !== l && V !== a && (L += 1, w.test(_.charAt(L)))) {
            for (; w.test(_.charAt(L + 1)); )
              L += 1;
            _.charCodeAt(L + 1) === o && (L += 1);
          }
          J = ["word", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        default: {
          V === n && _.charCodeAt(D + 1) === g ? (L = _.indexOf("*/", D + 2) + 1, L === 0 && (Q || ue ? L = _.length : Ce("comment")), J = ["comment", _.slice(D, L + 1), D, L], D = L) : (S.lastIndex = D + 1, S.test(_), S.lastIndex === 0 ? L = _.length - 1 : L = S.lastIndex - 2, J = ["word", _.slice(D, L + 1), D, L], et.push(J), D = L);
          break;
        }
      }
      return D++, J;
    }
    function yt(H) {
      Be.push(H);
    }
    return {
      back: yt,
      endOfFile: Pe,
      nextToken: At,
      position: gt
    };
  }, Ii;
}
var Oi, Ea;
function Us() {
  if (Ea) return Oi;
  Ea = 1;
  let e = sr();
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
  return Oi = t, t.default = t, e.registerAtRule(t), Oi;
}
var _i, Ma;
function Jr() {
  if (Ma) return _i;
  Ma = 1;
  let e = sr(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, a, c) {
      let l = super.normalize(o);
      if (a) {
        if (c === "prepend")
          this.nodes.length > 1 ? a.raws.before = this.nodes[1].raws.before : delete a.raws.before;
        else if (this.first !== a)
          for (let p of l)
            p.raws.before = a.raws.before;
      }
      return l;
    }
    removeChild(o, a) {
      let c = this.index(o);
      return !a && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, _i = n, n.default = n, e.registerRoot(n), _i;
}
var Ni, Ra;
function Rc() {
  if (Ra) return Ni;
  Ra = 1;
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
      let i = [], o = "", a = !1, c = 0, l = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (o !== "" && i.push(o.trim()), o = "", a = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return Ni = e, e.default = e, Ni;
}
var Pi, Aa;
function Bs() {
  if (Aa) return Pi;
  Aa = 1;
  let e = sr(), t = Rc();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, a = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(a);
    }
  }
  return Pi = r, r.default = r, e.registerRule(r), Pi;
}
var $i, Ta;
function Mm() {
  if (Ta) return $i;
  Ta = 1;
  let e = qn(), t = Em(), r = jn(), n = Us(), i = Jr(), o = Bs();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(s) {
      this.input = s, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: s, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(s) {
      let h = new n();
      h.name = s[1].slice(1), h.name === "" && this.unnamedAtrule(h, s), this.init(h, s[2]);
      let d, u, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), d = s[0], d === "(" || d === "[" ? y.push(d === "(" ? ")" : "]") : d === "{" && y.length > 0 ? y.push("}") : d === y[y.length - 1] && y.pop(), y.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(s[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            g = !0;
            break;
          } else if (d === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, u = x[m]; u && u[0] === "space"; )
                u = x[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(s);
            break;
          } else
            x.push(s);
        else
          x.push(s);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (s = x[x.length - 1], h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(s) {
      let h = this.colon(s);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = s[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(s) {
      let h = 0, d, u, m;
      for (let [f, g] of s.entries()) {
        if (d = g, u = d[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
          if (!m)
            this.doubleColon(d);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = d;
      }
      return !1;
    }
    comment(s) {
      let h = new r();
      this.init(h, s[2]), h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++;
      let d = s[1].slice(2, -2);
      if (/^\s*$/.test(d))
        h.text = "", h.raws.left = d, h.raws.right = "";
      else {
        let u = d.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = u[2], h.raws.left = u[1], h.raws.right = u[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(s, h) {
      let d = new e();
      this.init(d, s[0][2]);
      let u = s[s.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, s.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(s)
      ), d.source.end.offset++; s[0][0] !== "word"; )
        s.length === 1 && this.unknownWord(s), d.raws.before += s.shift()[1];
      for (d.source.start = this.getPosition(s[0][2]), d.prop = ""; s.length; ) {
        let y = s[0][0];
        if (y === ":" || y === "space" || y === "comment")
          break;
        d.prop += s.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; s.length; )
        if (m = s.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], g;
      for (; s.length && (g = s[0][0], !(g !== "space" && g !== "comment")); )
        f.push(s.shift());
      this.precheckMissedSemicolon(s);
      for (let y = s.length - 1; y >= 0; y--) {
        if (m = s[y], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(s, y);
          v = this.spacesFromEnd(s) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = s.slice(0), S = "";
          for (let k = y; k > 0; k--) {
            let w = v[k][0];
            if (S.trim().indexOf("!") === 0 && w !== "space")
              break;
            S = v.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = S, s = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      s.some((y) => y[0] !== "space" && y[0] !== "comment") && (d.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(d, "value", f.concat(s), h), d.value.includes(":") && !h && this.checkMissedSemicolon(s);
    }
    doubleColon(s) {
      throw this.input.error(
        "Double colon",
        { offset: s[2] },
        { offset: s[2] + s[1].length }
      );
    }
    emptyRule(s) {
      let h = new o();
      this.init(h, s[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(s) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(s[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(s);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(s) {
      if (this.spaces += s[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(s) {
      let h = this.input.fromOffset(s);
      return {
        column: h.col,
        line: h.line,
        offset: s
      };
    }
    init(s, h) {
      this.current.push(s), s.source = {
        input: this.input,
        start: this.getPosition(h)
      }, s.raws.before = this.spaces, this.spaces = "", s.type !== "comment" && (this.semicolon = !1);
    }
    other(s) {
      let h = !1, d = null, u = !1, m = null, f = [], g = s[1].startsWith("--"), x = [], y = s;
      for (; y; ) {
        if (d = y[0], x.push(y), d === "(" || d === "[")
          m || (m = y), f.push(d === "(" ? ")" : "]");
        else if (g && u && d === "{")
          m || (m = y), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(x);
            return;
          } else if (d === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        y = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (y = x[x.length - 1][0], !(y !== "space" && y !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let s;
      for (; !this.tokenizer.endOfFile(); )
        switch (s = this.tokenizer.nextToken(), s[0]) {
          case "space":
            this.spaces += s[1];
            break;
          case ";":
            this.freeSemicolon(s);
            break;
          case "}":
            this.end(s);
            break;
          case "comment":
            this.comment(s);
            break;
          case "at-word":
            this.atrule(s);
            break;
          case "{":
            this.emptyRule(s);
            break;
          default:
            this.other(s);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(s, h, d, u) {
      let m, f, g = d.length, x = "", y = !0, v, S;
      for (let k = 0; k < g; k += 1)
        m = d[k], f = m[0], f === "space" && k === g - 1 && !u ? y = !1 : f === "comment" ? (S = d[k - 1] ? d[k - 1][0] : "empty", v = d[k + 1] ? d[k + 1][0] : "empty", !a[S] && !a[v] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
        let k = d.reduce((w, M) => w + M[1], "");
        s.raws[h] = { raw: k, value: x };
      }
      s[h] = x;
    }
    rule(s) {
      s.pop();
      let h = new o();
      this.init(h, s[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(s), this.raw(h, "selector", s), this.current = h;
    }
    spacesAndCommentsFromEnd(s) {
      let h, d = "";
      for (; s.length && (h = s[s.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = s.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(s) {
      let h, d = "";
      for (; s.length && (h = s[0][0], !(h !== "space" && h !== "comment")); )
        d += s.shift()[1];
      return d;
    }
    spacesFromEnd(s) {
      let h, d = "";
      for (; s.length && (h = s[s.length - 1][0], h === "space"); )
        d = s.pop()[1] + d;
      return d;
    }
    stringFrom(s, h) {
      let d = "";
      for (let u = h; u < s.length; u++)
        d += s[u][1];
      return s.splice(h, s.length - h), d;
    }
    unclosedBlock() {
      let s = this.current.source.start;
      throw this.input.error("Unclosed block", s.line, s.column);
    }
    unclosedBracket(s) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: s[2] },
        { offset: s[2] + 1 }
      );
    }
    unexpectedClose(s) {
      throw this.input.error(
        "Unexpected }",
        { offset: s[2] },
        { offset: s[2] + 1 }
      );
    }
    unknownWord(s) {
      throw this.input.error(
        "Unknown word",
        { offset: s[0][2] },
        { offset: s[0][2] + s[0][1].length }
      );
    }
    unnamedAtrule(s, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return $i = l, $i;
}
var Di, La;
function qs() {
  if (La) return Di;
  La = 1;
  let e = sr(), t = Mm(), r = Wn();
  function n(i, o) {
    let a = new r(i, o), c = new t(a);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return Di = n, n.default = n, e.registerParse(n), Di;
}
var zi, Ia;
function Ac() {
  if (Ia) return zi;
  Ia = 1;
  let { isClean: e, my: t } = Ds(), r = Cc(), n = Un(), i = sr(), o = zs(), a = Ec(), c = Fs(), l = qs(), p = Jr();
  const s = {
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
  }, d = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let k = !1, w = s[S.type];
    return S.type === "decl" ? k = S.prop.toLowerCase() : S.type === "atrule" && (k = S.name.toLowerCase()), k && S.append ? [
      w,
      w + "-" + k,
      u,
      w + "Exit",
      w + "Exit-" + k
    ] : k ? [w, w + "-" + k, w + "Exit", w + "Exit-" + k] : S.append ? [w, u, w + "Exit"] : [w, w + "Exit"];
  }
  function g(S) {
    let k;
    return S.type === "document" ? k = ["Document", u, "DocumentExit"] : S.type === "root" ? k = ["Root", u, "RootExit"] : k = f(S), {
      eventIndex: 0,
      events: k,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((k) => x(k)), S;
  }
  let y = {};
  class v {
    constructor(k, w, M) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        I = x(w);
      else if (w instanceof v || w instanceof c)
        I = x(w.root), w.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = w.map);
      else {
        let $ = l;
        M.syntax && ($ = M.syntax.parse), M.parser && ($ = M.parser), $.parse && ($ = $.parse);
        try {
          I = $(w, M);
        } catch (_) {
          this.processed = !0, this.error = _;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(k, I, M), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(k) {
      return this.async().catch(k);
    }
    finally(k) {
      return this.async().then(k, k);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(k, w) {
      let M = this.result.lastPlugin;
      try {
        if (w && w.addToError(k), this.error = k, k.name === "CssSyntaxError" && !k.plugin)
          k.plugin = M.postcssPlugin, k.setMessage();
        else if (M.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = M.postcssPlugin, $ = M.postcssVersion, _ = this.result.processor.version, Q = $.split("."), V = _.split(".");
          (Q[0] !== V[0] || parseInt(Q[1]) > parseInt(V[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + _ + ", but " + I + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return k;
    }
    prepareVisitors() {
      this.listeners = {};
      let k = (w, M, I) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([w, I]);
      };
      for (let w of this.plugins)
        if (typeof w == "object")
          for (let M in w) {
            if (!h[M] && /^[A-Z]/.test(M))
              throw new Error(
                `Unknown event ${M} in ${w.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[M])
              if (typeof w[M] == "object")
                for (let I in w[M])
                  I === "*" ? k(w, M, w[M][I]) : k(
                    w,
                    M + "-" + I.toLowerCase(),
                    w[M][I]
                  );
              else typeof w[M] == "function" && k(w, M, w[M]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let k = 0; k < this.plugins.length; k++) {
        let w = this.plugins[k], M = this.runOnRoot(w);
        if (m(M))
          try {
            await M;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let k = this.result.root;
        for (; !k[e]; ) {
          k[e] = !0;
          let w = [g(k)];
          for (; w.length > 0; ) {
            let M = this.visitTick(w);
            if (m(M))
              try {
                await M;
              } catch (I) {
                let $ = w[w.length - 1].node;
                throw this.handleError(I, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (k.type === "document") {
                let I = k.nodes.map(
                  ($) => M($, this.helpers)
                );
                await Promise.all(I);
              } else
                await M(k, this.helpers);
            } catch (I) {
              throw this.handleError(I);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(k) {
      this.result.lastPlugin = k;
      try {
        if (typeof k == "object" && k.Once) {
          if (this.result.root.type === "document") {
            let w = this.result.root.nodes.map(
              (M) => k.Once(M, this.helpers)
            );
            return m(w[0]) ? Promise.all(w) : w;
          }
          return k.Once(this.result.root, this.helpers);
        } else if (typeof k == "function")
          return k(this.result.root, this.result);
      } catch (w) {
        throw this.handleError(w);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let k = this.result.opts, w = n;
      k.syntax && (w = k.syntax.stringify), k.stringifier && (w = k.stringifier), w.stringify && (w = w.stringify);
      let I = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let k of this.plugins) {
        let w = this.runOnRoot(k);
        if (m(w))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let k = this.result.root;
        for (; !k[e]; )
          k[e] = !0, this.walkSync(k);
        if (this.listeners.OnceExit)
          if (k.type === "document")
            for (let w of k.nodes)
              this.visitSync(this.listeners.OnceExit, w);
          else
            this.visitSync(this.listeners.OnceExit, k);
      }
      return this.result;
    }
    then(k, w) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(k, w);
    }
    toString() {
      return this.css;
    }
    visitSync(k, w) {
      for (let [M, I] of k) {
        this.result.lastPlugin = M;
        let $;
        try {
          $ = I(w, this.helpers);
        } catch (_) {
          throw this.handleError(_, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(k) {
      let w = k[k.length - 1], { node: M, visitors: I } = w;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        k.pop();
        return;
      }
      if (I.length > 0 && w.visitorIndex < I.length) {
        let [_, Q] = I[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === I.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = _;
        try {
          return Q(M.toProxy(), this.helpers);
        } catch (V) {
          throw this.handleError(V, M);
        }
      }
      if (w.iterator !== 0) {
        let _ = w.iterator, Q;
        for (; Q = M.nodes[M.indexes[_]]; )
          if (M.indexes[_] += 1, !Q[e]) {
            Q[e] = !0, k.push(g(Q));
            return;
          }
        w.iterator = 0, delete M.indexes[_];
      }
      let $ = w.events;
      for (; w.eventIndex < $.length; ) {
        let _ = $[w.eventIndex];
        if (w.eventIndex += 1, _ === u) {
          M.nodes && M.nodes.length && (M[e] = !0, w.iterator = M.getIterator());
          return;
        } else if (this.listeners[_]) {
          w.visitors = this.listeners[_];
          return;
        }
      }
      k.pop();
    }
    walkSync(k) {
      k[e] = !0;
      let w = f(k);
      for (let M of w)
        if (M === u)
          k.nodes && k.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[M];
          if (I && this.visitSync(I, k.toProxy()))
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
  return v.registerPostcss = (S) => {
    y = S;
  }, zi = v, v.default = v, p.registerLazyResult(v), o.registerLazyResult(v), zi;
}
var Fi, Oa;
function Rm() {
  if (Oa) return Fi;
  Oa = 1;
  let e = Cc(), t = Un(), r = Ec(), n = qs();
  const i = Fs();
  class o {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, s, this._opts, l);
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
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = c, c;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Fi = o, o.default = o, Fi;
}
var Ui, _a;
function Am() {
  if (_a) return Ui;
  _a = 1;
  let e = Rm(), t = Ac(), r = zs(), n = Jr();
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
  return Ui = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Ui;
}
var Bi, Na;
function Tm() {
  if (Na) return Bi;
  Na = 1;
  let e = qn(), t = Sc(), r = jn(), n = Us(), i = Wn(), o = Jr(), a = Bs();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: s, ...h } = l;
    if (s) {
      p = [];
      for (let d of s) {
        let u = { ...d, __proto__: i.prototype };
        u.map && (u.map = {
          ...u.map,
          __proto__: t.prototype
        }), p.push(u);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((d) => c(d, p))), h.source) {
      let { inputId: d, ...u } = h.source;
      h.source = u, d != null && (h.source.input = p[d]);
    }
    if (h.type === "root")
      return new o(h);
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
  return Bi = c, c.default = c, Bi;
}
var qi, Pa;
function Lm() {
  if (Pa) return qi;
  Pa = 1;
  let e = $s(), t = qn(), r = Ac(), n = sr(), i = Am(), o = Un(), a = Tm(), c = zs(), l = Mc(), p = jn(), s = Us(), h = Fs(), d = Wn(), u = qs(), m = Rc(), f = Bs(), g = Jr(), x = Bn();
  function y(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return y.plugin = function(S, k) {
    let w = !1;
    function M(...$) {
      console && console.warn && !w && (w = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let _ = k(...$);
      return _.postcssPlugin = S, _.postcssVersion = new i().version, _;
    }
    let I;
    return Object.defineProperty(M, "postcss", {
      get() {
        return I || (I = M()), I;
      }
    }), M.process = function($, _, Q) {
      return y([M(Q)]).process($, _);
    }, M;
  }, y.stringify = o, y.parse = u, y.fromJSON = a, y.list = m, y.comment = (v) => new p(v), y.atRule = (v) => new s(v), y.decl = (v) => new t(v), y.rule = (v) => new f(v), y.root = (v) => new g(v), y.document = (v) => new c(v), y.CssSyntaxError = e, y.Declaration = t, y.Container = n, y.Processor = i, y.Document = c, y.Comment = p, y.Warning = l, y.AtRule = s, y.Result = h, y.Input = d, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), qi = y, y.default = y, qi;
}
var Im = Lm();
const Re = /* @__PURE__ */ vm(Im);
Re.stringify;
Re.fromJSON;
Re.plugin;
Re.parse;
Re.list;
Re.document;
Re.comment;
Re.atRule;
Re.rule;
Re.decl;
Re.root;
Re.CssSyntaxError;
Re.Declaration;
Re.Container;
Re.Processor;
Re.Document;
Re.Comment;
Re.Warning;
Re.AtRule;
Re.Result;
Re.Input;
Re.Rule;
Re.Root;
Re.Node;
var Om = Object.defineProperty, _m = (e, t, r) => t in e ? Om(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, rt = (e, t, r) => _m(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Nm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Pm(e) {
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
var mn = { exports: {} }, $a;
function $m() {
  if ($a) return mn.exports;
  $a = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return mn.exports = t(), mn.exports.createColors = t, mn.exports;
}
const Dm = {}, zm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dm
}, Symbol.toStringTag, { value: "Module" })), mt = /* @__PURE__ */ Pm(zm);
var Wi, Da;
function Ws() {
  if (Da) return Wi;
  Da = 1;
  let e = /* @__PURE__ */ $m(), t = mt;
  class r extends Error {
    constructor(i, o, a, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof o < "u" && typeof a < "u" && (typeof o == "number" ? (this.line = o, this.column = a) : (this.line = o.line, this.column = o.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let a = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), p = String(l).length, s, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        s = (f) => d(m(f)), h = (f) => u(f);
      } else
        s = h = (d) => d;
      return a.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return s(">") + h(f) + d + `
 ` + g + s("^");
        }
        return " " + h(f) + d;
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
  return Wi = r, r.default = r, Wi;
}
var gn = {}, za;
function js() {
  return za || (za = 1, gn.isClean = Symbol("isClean"), gn.my = Symbol("my")), gn;
}
var ji, Fa;
function Tc() {
  if (Fa) return ji;
  Fa = 1;
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
    atrule(i, o) {
      let a = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? a += i.raws.afterName : c && (a += " "), i.nodes)
        this.block(i, a + c);
      else {
        let l = (i.raws.between || "") + (o ? ";" : "");
        this.builder(a + c + l, i);
      }
    }
    beforeAfter(i, o) {
      let a;
      i.type === "decl" ? a = this.raw(i, null, "beforeDecl") : i.type === "comment" ? a = this.raw(i, null, "beforeComment") : o === "before" ? a = this.raw(i, null, "beforeRule") : a = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (a.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let s = 0; s < l; s++) a += p;
      }
      return a;
    }
    block(i, o) {
      let a = this.raw(i, "between", "beforeOpen");
      this.builder(o + a + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let a = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, o !== c || a);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), a = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + a + "*/", i);
    }
    decl(i, o) {
      let a = this.raw(i, "between", "colon"), c = i.prop + a + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, a) {
      let c;
      if (a || (a = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let l = i.parent;
      if (a === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[a];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[a] < "u")
        return p.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let s = "raw" + t(a);
        this[s] ? c = this[s](p, i) : p.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), p.rawCache[a] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length > 0 && typeof a.raws.after < "u")
          return o = a.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let a;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(o, null, "beforeDecl") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeDecl(i, o) {
      let a;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return a = c.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), !1;
      }), typeof a > "u" ? a = this.raw(o, null, "beforeRule") : a && (a = a.replace(/\S/g, "")), a;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((a) => {
        if (a.type !== "decl" && (o = a.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && (a.parent !== i || i.first !== a) && typeof a.raws.before < "u")
          return o = a.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((a) => {
        if (typeof a.raws.between < "u")
          return o = a.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length === 0 && (o = a.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((a) => {
        let c = a.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof a.raws.before < "u") {
          let l = a.raws.before.split(`
`);
          return o = l[l.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((a) => {
        if (a.nodes && a.nodes.length && a.last.type === "decl" && (o = a.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let a = i[o], c = i.raws[o];
      return c && c.value === a ? c.raw : a;
    }
    root(i) {
      this.body(i), i.raws.after && this.builder(i.raws.after);
    }
    rule(i) {
      this.block(i, this.rawValue(i, "selector")), i.raws.ownSemicolon && this.builder(i.raws.ownSemicolon, i, "end");
    }
    stringify(i, o) {
      if (!this[i.type])
        throw new Error(
          "Unknown AST node type " + i.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[i.type](i, o);
    }
  }
  return ji = r, r.default = r, ji;
}
var Hi, Ua;
function Hn() {
  if (Ua) return Hi;
  Ua = 1;
  let e = Tc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Hi = t, t.default = t, Hi;
}
var Vi, Ba;
function Vn() {
  if (Ba) return Vi;
  Ba = 1;
  let { isClean: e, my: t } = js(), r = Ws(), n = Tc(), i = Hn();
  function o(c, l) {
    let p = new c.constructor();
    for (let s in c) {
      if (!Object.prototype.hasOwnProperty.call(c, s) || s === "proxyCache") continue;
      let h = c[s], d = typeof h;
      s === "parent" && d === "object" ? l && (p[s] = l) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((u) => o(u, p)) : (d === "object" && h !== null && (h = o(h)), p[s] = h);
    }
    return p;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let s of l[p])
            typeof s.clone == "function" ? this.append(s.clone()) : this.append(s);
        } else
          this[p] = l[p];
    }
    addToError(l) {
      if (l.postcssNode = this, l.stack && this.source && /\n\s{4}at /.test(l.stack)) {
        let p = this.source;
        l.stack = l.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return l;
    }
    after(l) {
      return this.parent.insertAfter(this, l), this;
    }
    assign(l = {}) {
      for (let p in l)
        this[p] = l[p];
      return this;
    }
    before(l) {
      return this.parent.insertBefore(this, l), this;
    }
    cleanRaws(l) {
      delete this.raws.before, delete this.raws.after, l || delete this.raws.between;
    }
    clone(l = {}) {
      let p = o(this);
      for (let s in l)
        p[s] = l[s];
      return p;
    }
    cloneAfter(l = {}) {
      let p = this.clone(l);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(l = {}) {
      let p = this.clone(l);
      return this.parent.insertBefore(this, p), p;
    }
    error(l, p = {}) {
      if (this.source) {
        let { end: s, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: s.column, line: s.line },
          p
        );
      }
      return new r(l);
    }
    getProxyProcessor() {
      return {
        get(l, p) {
          return p === "proxyOf" ? l : p === "root" ? () => l.root().toProxy() : l[p];
        },
        set(l, p, s) {
          return l[p] === s || (l[p] = s, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && l.markDirty()), !0;
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
    positionBy(l, p) {
      let s = this.source.start;
      if (l.index)
        s = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (s = this.positionInside(h, p));
      }
      return s;
    }
    positionInside(l, p) {
      let s = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        s[u] === `
` ? (h = 1, d += 1) : h += 1;
      return { column: h, line: d };
    }
    prev() {
      if (!this.parent) return;
      let l = this.parent.index(this);
      return this.parent.nodes[l - 1];
    }
    rangeBy(l) {
      let p = {
        column: this.source.start.column,
        line: this.source.start.line
      }, s = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), s = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? s = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? s = this.positionInside(l.endIndex) : l.index && (s = this.positionInside(l.index + 1));
      return (s.line < p.line || s.line === p.line && s.column <= p.column) && (s = { column: p.column + 1, line: p.line }), { end: s, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, s = !1;
        for (let h of l)
          h === this ? s = !0 : s ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        s || this.remove();
      }
      return this;
    }
    root() {
      let l = this;
      for (; l.parent && l.parent.type !== "document"; )
        l = l.parent;
      return l;
    }
    toJSON(l, p) {
      let s = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          s[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          s[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), s[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          s[u] = m;
      }
      return h && (s.inputs = [...p.keys()].map((u) => u.toJSON())), s;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (s) => {
        p += s;
      }), p;
    }
    warn(l, p, s) {
      let h = { node: this };
      for (let d in s) h[d] = s[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Vi = a, a.default = a, Vi;
}
var Yi, qa;
function Yn() {
  if (qa) return Yi;
  qa = 1;
  let e = Vn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Yi = t, t.default = t, Yi;
}
var Gi, Wa;
function Fm() {
  if (Wa) return Gi;
  Wa = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Gi = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let a = "", c = o;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Gi;
}
var Ki, ja;
function Lc() {
  if (ja) return Ki;
  ja = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = mt, { existsSync: r, readFileSync: n } = mt, { dirname: i, join: o } = mt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, s) {
      if (s.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = s.map ? s.map.prev : void 0, d = this.loadMap(s.from, h);
      !this.mapFile && s.from && (this.mapFile = s.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let s = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (s.test(p) || h.test(p))
        return a(p.substr(RegExp.lastMatch.length));
      let m = p.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(p) {
      return p.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(p) {
      return typeof p != "object" ? !1 : typeof p.mappings == "string" || typeof p._mappings == "string" || Array.isArray(p.sections);
    }
    loadAnnotation(p) {
      let s = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!s) return;
      let h = p.lastIndexOf(s.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, s) {
      if (s === !1) return !1;
      if (s) {
        if (typeof s == "string")
          return s;
        if (typeof s == "function") {
          let h = s(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
          }
        } else {
          if (s instanceof e)
            return t.fromSourceMap(s).toString();
          if (s instanceof t)
            return s.toString();
          if (this.isMap(s))
            return JSON.stringify(s);
          throw new Error(
            "Unsupported previous source map format: " + s.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return p && (h = o(i(p), h)), this.loadFile(h);
        }
      }
    }
    startWith(p, s) {
      return p ? p.substr(0, s.length) === s : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Ki = c, c.default = c, Ki;
}
var Xi, Ha;
function Gn() {
  if (Ha) return Xi;
  Ha = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = mt, { fileURLToPath: r, pathToFileURL: n } = mt, { isAbsolute: i, resolve: o } = mt, { nanoid: a } = /* @__PURE__ */ Fm(), c = mt, l = Ws(), p = Lc(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!d || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), d && h) {
        let x = new p(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let v, S, k;
      if (g && typeof g == "object") {
        let M = g, I = x;
        if (typeof M.offset == "number") {
          let $ = this.fromOffset(M.offset);
          g = $.line, x = $.col;
        } else
          g = M.line, x = M.column;
        if (typeof I.offset == "number") {
          let $ = this.fromOffset(I.offset);
          S = $.line, k = $.col;
        } else
          S = I.line, k = I.column;
      } else if (!x) {
        let M = this.fromOffset(g);
        g = M.line, x = M.col;
      }
      let w = this.origin(g, x, S, k);
      return w ? v = new l(
        f,
        w.endLine === void 0 ? w.line : { column: w.column, line: w.line },
        w.endLine === void 0 ? w.column : { column: w.endColumn, line: w.endLine },
        w.source,
        w.file,
        y.plugin
      ) : v = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: k, line: S },
        this.css,
        this.file,
        y.plugin
      ), v.input = { column: x, endColumn: k, endLine: S, line: g, source: this.css }, this.file && (n && (v.input.url = n(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let v = this.css.split(`
`);
        x = new Array(v.length);
        let S = 0;
        for (let k = 0, w = v.length; k < w; k++)
          x[k] = S, S += v[k].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; y < v; )
          if (S = y + (v - y >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            y = S + 1;
          else {
            y = S;
            break;
          }
      }
      return {
        col: f - x[y] + 1,
        line: y + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let k;
      typeof x == "number" && (k = v.originalPositionFor({ column: y, line: x }));
      let w;
      i(S.source) ? w = n(S.source) : w = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let M = {
        column: S.column,
        endColumn: k && k.column,
        endLine: k && k.line,
        line: S.line,
        url: w.toString()
      };
      if (w.protocol === "file:")
        if (r)
          M.file = r(w);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = v.sourceContentFor(S.source);
      return I && (M.source = I), M;
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
var Ji, Va;
function Ic() {
  if (Va) return Ji;
  Va = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = mt, { dirname: r, relative: n, resolve: i, sep: o } = mt, { pathToFileURL: a } = mt, c = Gn(), l = !!(e && t), p = !!(r && i && n && o);
  class s {
    constructor(d, u, m, f) {
      this.stringify = d, this.mapOpts = m.map || {}, this.root = u, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let d;
      this.isInline() ? d = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? d = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? d = this.mapOpts.annotation(this.opts.to, this.root) : d = this.outputFile() + ".map";
      let u = `
`;
      this.css.includes(`\r
`) && (u = `\r
`), this.css += u + "/*# sourceMappingURL=" + d + " */";
    }
    applyPrevMaps() {
      for (let d of this.previous()) {
        let u = this.toUrl(this.path(d.file)), m = d.root || r(d.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(d.text), f.sourcesContent && (f.sourcesContent = null)) : f = d.consumer(), this.map.applySourceMap(f, u, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let d;
          for (let u = this.root.nodes.length - 1; u >= 0; u--)
            d = this.root.nodes[u], d.type === "comment" && d.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(u);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && l && this.isMap())
        return this.generateMap();
      {
        let d = "";
        return this.stringify(this.root, (u) => {
          d += u;
        }), [d];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let d = this.previous()[0].consumer();
        d.file = this.outputFile(), this.map = t.fromSourceMap(d, {
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
      let d = 1, u = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (y, v, S) => {
        if (this.css += y, v && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (d += g.length, x = y.lastIndexOf(`
`), u = y.length - x) : u += y.length, v && S !== "start") {
          let k = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== k.last || k.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((d) => d.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let d = this.mapOpts.annotation;
      return typeof d < "u" && d !== !0 ? !1 : this.previous().length ? this.previous().some((u) => u.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((d) => d.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(d) {
      if (this.mapOpts.absolute || d.charCodeAt(0) === 60 || /^\w+:\/\//.test(d)) return d;
      let u = this.memoizedPaths.get(d);
      if (u) return u;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, d);
      return this.memoizedPaths.set(d, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((d) => {
            if (d.source && d.source.input.map) {
              let u = d.source.input.map;
              this.previousMaps.includes(u) || this.previousMaps.push(u);
            }
          });
        else {
          let d = new c(this.originalCSS, this.opts);
          d.map && this.previousMaps.push(d.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let d = {};
      if (this.root)
        this.root.walk((u) => {
          if (u.source) {
            let m = u.source.input.from;
            if (m && !d[m]) {
              d[m] = !0;
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
    sourcePath(d) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(d.source.input.from) : this.toUrl(this.path(d.source.input.from));
    }
    toBase64(d) {
      return Buffer ? Buffer.from(d).toString("base64") : window.btoa(unescape(encodeURIComponent(d)));
    }
    toFileUrl(d) {
      let u = this.memoizedFileURLs.get(d);
      if (u) return u;
      if (a) {
        let m = a(d).toString();
        return this.memoizedFileURLs.set(d, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(d) {
      let u = this.memoizedURLs.get(d);
      if (u) return u;
      o === "\\" && (d = d.replace(/\\/g, "/"));
      let m = encodeURI(d).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(d, m), m;
    }
  }
  return Ji = s, Ji;
}
var Zi, Ya;
function Kn() {
  if (Ya) return Zi;
  Ya = 1;
  let e = Vn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Zi = t, t.default = t, Zi;
}
var Qi, Ga;
function or() {
  if (Ga) return Qi;
  Ga = 1;
  let { isClean: e, my: t } = js(), r = Yn(), n = Kn(), i = Vn(), o, a, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function s(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        s(u);
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
            ...f.map((g) => typeof g == "function" ? (x, y) => g(x.toProxy(), y) : g)
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
      for (let y of g) this.proxyOf.nodes.splice(f + 1, 0, y);
      let x;
      for (let y in this.indexes)
        x = this.indexes[y], f < x && (this.indexes[y] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let y;
      for (let v in this.indexes)
        y = this.indexes[v], f <= y && (this.indexes[v] = y + x.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = p(o(u).nodes);
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
      return u.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && s(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
  return h.registerParse = (d) => {
    o = d;
  }, h.registerRule = (d) => {
    a = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, Qi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Qi;
}
var es, Ka;
function Hs() {
  if (Ka) return es;
  Ka = 1;
  let e = or(), t, r;
  class n extends e {
    constructor(o) {
      super({ type: "document", ...o }), this.nodes || (this.nodes = []);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, es = n, n.default = n, es;
}
var ts, Xa;
function Oc() {
  if (Xa) return ts;
  Xa = 1;
  let e = {};
  return ts = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ts;
}
var rs, Ja;
function _c() {
  if (Ja) return rs;
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
  return rs = e, e.default = e, rs;
}
var ns, Za;
function Vs() {
  if (Za) return ns;
  Za = 1;
  let e = _c();
  class t {
    constructor(n, i, o) {
      this.processor = n, this.messages = [], this.root = i, this.opts = o, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(n, i = {}) {
      i.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (i.plugin = this.lastPlugin.postcssPlugin);
      let o = new e(n, i);
      return this.messages.push(o), o;
    }
    warnings() {
      return this.messages.filter((n) => n.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return ns = t, t.default = t, ns;
}
var is, Qa;
function Um() {
  if (Qa) return is;
  Qa = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, a = 12, c = 9, l = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, y = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, k = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return is = function(I, $ = {}) {
    let _ = I.css.valueOf(), Q = $.ignoreErrors, V, L, Le, ze, K, ee, Te, Me, ae, J, be = _.length, D = 0, et = [], Be = [];
    function gt() {
      return D;
    }
    function Ce(H) {
      throw I.error("Unclosed " + H, D);
    }
    function Pe() {
      return Be.length === 0 && D >= be;
    }
    function At(H) {
      if (Be.length) return Be.pop();
      if (D >= be) return;
      let ue = H ? H.ignoreUnclosed : !1;
      switch (V = _.charCodeAt(D), V) {
        case i:
        case o:
        case c:
        case l:
        case a: {
          L = D;
          do
            L += 1, V = _.charCodeAt(L);
          while (V === o || V === i || V === c || V === l || V === a);
          J = ["space", _.slice(D, L)], D = L - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ge = String.fromCharCode(V);
          J = [ge, ge, D];
          break;
        }
        case h: {
          if (Me = et.length ? et.pop()[1] : "", ae = _.charCodeAt(D + 1), Me === "url" && ae !== e && ae !== t && ae !== o && ae !== i && ae !== c && ae !== a && ae !== l) {
            L = D;
            do {
              if (ee = !1, L = _.indexOf(")", L + 1), L === -1)
                if (Q || ue) {
                  L = D;
                  break;
                } else
                  Ce("bracket");
              for (Te = L; _.charCodeAt(Te - 1) === r; )
                Te -= 1, ee = !ee;
            } while (ee);
            J = ["brackets", _.slice(D, L + 1), D, L], D = L;
          } else
            L = _.indexOf(")", D + 1), ze = _.slice(D, L + 1), L === -1 || k.test(ze) ? J = ["(", "(", D] : (J = ["brackets", ze, D, L], D = L);
          break;
        }
        case e:
        case t: {
          Le = V === e ? "'" : '"', L = D;
          do {
            if (ee = !1, L = _.indexOf(Le, L + 1), L === -1)
              if (Q || ue) {
                L = D + 1;
                break;
              } else
                Ce("string");
            for (Te = L; _.charCodeAt(Te - 1) === r; )
              Te -= 1, ee = !ee;
          } while (ee);
          J = ["string", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        case y: {
          v.lastIndex = D + 1, v.test(_), v.lastIndex === 0 ? L = _.length - 1 : L = v.lastIndex - 2, J = ["at-word", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        case r: {
          for (L = D, K = !0; _.charCodeAt(L + 1) === r; )
            L += 1, K = !K;
          if (V = _.charCodeAt(L + 1), K && V !== n && V !== o && V !== i && V !== c && V !== l && V !== a && (L += 1, w.test(_.charAt(L)))) {
            for (; w.test(_.charAt(L + 1)); )
              L += 1;
            _.charCodeAt(L + 1) === o && (L += 1);
          }
          J = ["word", _.slice(D, L + 1), D, L], D = L;
          break;
        }
        default: {
          V === n && _.charCodeAt(D + 1) === g ? (L = _.indexOf("*/", D + 2) + 1, L === 0 && (Q || ue ? L = _.length : Ce("comment")), J = ["comment", _.slice(D, L + 1), D, L], D = L) : (S.lastIndex = D + 1, S.test(_), S.lastIndex === 0 ? L = _.length - 1 : L = S.lastIndex - 2, J = ["word", _.slice(D, L + 1), D, L], et.push(J), D = L);
          break;
        }
      }
      return D++, J;
    }
    function yt(H) {
      Be.push(H);
    }
    return {
      back: yt,
      endOfFile: Pe,
      nextToken: At,
      position: gt
    };
  }, is;
}
var ss, el;
function Ys() {
  if (el) return ss;
  el = 1;
  let e = or();
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
  return ss = t, t.default = t, e.registerAtRule(t), ss;
}
var os, tl;
function Zr() {
  if (tl) return os;
  tl = 1;
  let e = or(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, a, c) {
      let l = super.normalize(o);
      if (a) {
        if (c === "prepend")
          this.nodes.length > 1 ? a.raws.before = this.nodes[1].raws.before : delete a.raws.before;
        else if (this.first !== a)
          for (let p of l)
            p.raws.before = a.raws.before;
      }
      return l;
    }
    removeChild(o, a) {
      let c = this.index(o);
      return !a && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, os = n, n.default = n, e.registerRoot(n), os;
}
var as, rl;
function Nc() {
  if (rl) return as;
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
      let i = [], o = "", a = !1, c = 0, l = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (o !== "" && i.push(o.trim()), o = "", a = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return as = e, e.default = e, as;
}
var ls, nl;
function Gs() {
  if (nl) return ls;
  nl = 1;
  let e = or(), t = Nc();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, a = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(a);
    }
  }
  return ls = r, r.default = r, e.registerRule(r), ls;
}
var cs, il;
function Bm() {
  if (il) return cs;
  il = 1;
  let e = Yn(), t = Um(), r = Kn(), n = Ys(), i = Zr(), o = Gs();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(s) {
      this.input = s, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: s, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(s) {
      let h = new n();
      h.name = s[1].slice(1), h.name === "" && this.unnamedAtrule(h, s), this.init(h, s[2]);
      let d, u, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), d = s[0], d === "(" || d === "[" ? y.push(d === "(" ? ")" : "]") : d === "{" && y.length > 0 ? y.push("}") : d === y[y.length - 1] && y.pop(), y.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(s[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            g = !0;
            break;
          } else if (d === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, u = x[m]; u && u[0] === "space"; )
                u = x[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(s);
            break;
          } else
            x.push(s);
        else
          x.push(s);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (s = x[x.length - 1], h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(s) {
      let h = this.colon(s);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = s[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(s) {
      let h = 0, d, u, m;
      for (let [f, g] of s.entries()) {
        if (d = g, u = d[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
          if (!m)
            this.doubleColon(d);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = d;
      }
      return !1;
    }
    comment(s) {
      let h = new r();
      this.init(h, s[2]), h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++;
      let d = s[1].slice(2, -2);
      if (/^\s*$/.test(d))
        h.text = "", h.raws.left = d, h.raws.right = "";
      else {
        let u = d.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = u[2], h.raws.left = u[1], h.raws.right = u[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(s, h) {
      let d = new e();
      this.init(d, s[0][2]);
      let u = s[s.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, s.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(s)
      ), d.source.end.offset++; s[0][0] !== "word"; )
        s.length === 1 && this.unknownWord(s), d.raws.before += s.shift()[1];
      for (d.source.start = this.getPosition(s[0][2]), d.prop = ""; s.length; ) {
        let y = s[0][0];
        if (y === ":" || y === "space" || y === "comment")
          break;
        d.prop += s.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; s.length; )
        if (m = s.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], g;
      for (; s.length && (g = s[0][0], !(g !== "space" && g !== "comment")); )
        f.push(s.shift());
      this.precheckMissedSemicolon(s);
      for (let y = s.length - 1; y >= 0; y--) {
        if (m = s[y], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(s, y);
          v = this.spacesFromEnd(s) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = s.slice(0), S = "";
          for (let k = y; k > 0; k--) {
            let w = v[k][0];
            if (S.trim().indexOf("!") === 0 && w !== "space")
              break;
            S = v.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = S, s = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      s.some((y) => y[0] !== "space" && y[0] !== "comment") && (d.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(d, "value", f.concat(s), h), d.value.includes(":") && !h && this.checkMissedSemicolon(s);
    }
    doubleColon(s) {
      throw this.input.error(
        "Double colon",
        { offset: s[2] },
        { offset: s[2] + s[1].length }
      );
    }
    emptyRule(s) {
      let h = new o();
      this.init(h, s[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(s) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(s[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(s);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(s) {
      if (this.spaces += s[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(s) {
      let h = this.input.fromOffset(s);
      return {
        column: h.col,
        line: h.line,
        offset: s
      };
    }
    init(s, h) {
      this.current.push(s), s.source = {
        input: this.input,
        start: this.getPosition(h)
      }, s.raws.before = this.spaces, this.spaces = "", s.type !== "comment" && (this.semicolon = !1);
    }
    other(s) {
      let h = !1, d = null, u = !1, m = null, f = [], g = s[1].startsWith("--"), x = [], y = s;
      for (; y; ) {
        if (d = y[0], x.push(y), d === "(" || d === "[")
          m || (m = y), f.push(d === "(" ? ")" : "]");
        else if (g && u && d === "{")
          m || (m = y), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(x);
            return;
          } else if (d === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        y = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (y = x[x.length - 1][0], !(y !== "space" && y !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let s;
      for (; !this.tokenizer.endOfFile(); )
        switch (s = this.tokenizer.nextToken(), s[0]) {
          case "space":
            this.spaces += s[1];
            break;
          case ";":
            this.freeSemicolon(s);
            break;
          case "}":
            this.end(s);
            break;
          case "comment":
            this.comment(s);
            break;
          case "at-word":
            this.atrule(s);
            break;
          case "{":
            this.emptyRule(s);
            break;
          default:
            this.other(s);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(s, h, d, u) {
      let m, f, g = d.length, x = "", y = !0, v, S;
      for (let k = 0; k < g; k += 1)
        m = d[k], f = m[0], f === "space" && k === g - 1 && !u ? y = !1 : f === "comment" ? (S = d[k - 1] ? d[k - 1][0] : "empty", v = d[k + 1] ? d[k + 1][0] : "empty", !a[S] && !a[v] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
        let k = d.reduce((w, M) => w + M[1], "");
        s.raws[h] = { raw: k, value: x };
      }
      s[h] = x;
    }
    rule(s) {
      s.pop();
      let h = new o();
      this.init(h, s[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(s), this.raw(h, "selector", s), this.current = h;
    }
    spacesAndCommentsFromEnd(s) {
      let h, d = "";
      for (; s.length && (h = s[s.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = s.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(s) {
      let h, d = "";
      for (; s.length && (h = s[0][0], !(h !== "space" && h !== "comment")); )
        d += s.shift()[1];
      return d;
    }
    spacesFromEnd(s) {
      let h, d = "";
      for (; s.length && (h = s[s.length - 1][0], h === "space"); )
        d = s.pop()[1] + d;
      return d;
    }
    stringFrom(s, h) {
      let d = "";
      for (let u = h; u < s.length; u++)
        d += s[u][1];
      return s.splice(h, s.length - h), d;
    }
    unclosedBlock() {
      let s = this.current.source.start;
      throw this.input.error("Unclosed block", s.line, s.column);
    }
    unclosedBracket(s) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: s[2] },
        { offset: s[2] + 1 }
      );
    }
    unexpectedClose(s) {
      throw this.input.error(
        "Unexpected }",
        { offset: s[2] },
        { offset: s[2] + 1 }
      );
    }
    unknownWord(s) {
      throw this.input.error(
        "Unknown word",
        { offset: s[0][2] },
        { offset: s[0][2] + s[0][1].length }
      );
    }
    unnamedAtrule(s, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return cs = l, cs;
}
var us, sl;
function Ks() {
  if (sl) return us;
  sl = 1;
  let e = or(), t = Bm(), r = Gn();
  function n(i, o) {
    let a = new r(i, o), c = new t(a);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return us = n, n.default = n, e.registerParse(n), us;
}
var ds, ol;
function Pc() {
  if (ol) return ds;
  ol = 1;
  let { isClean: e, my: t } = js(), r = Ic(), n = Hn(), i = or(), o = Hs(), a = Oc(), c = Vs(), l = Ks(), p = Zr();
  const s = {
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
  }, d = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let k = !1, w = s[S.type];
    return S.type === "decl" ? k = S.prop.toLowerCase() : S.type === "atrule" && (k = S.name.toLowerCase()), k && S.append ? [
      w,
      w + "-" + k,
      u,
      w + "Exit",
      w + "Exit-" + k
    ] : k ? [w, w + "-" + k, w + "Exit", w + "Exit-" + k] : S.append ? [w, u, w + "Exit"] : [w, w + "Exit"];
  }
  function g(S) {
    let k;
    return S.type === "document" ? k = ["Document", u, "DocumentExit"] : S.type === "root" ? k = ["Root", u, "RootExit"] : k = f(S), {
      eventIndex: 0,
      events: k,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((k) => x(k)), S;
  }
  let y = {};
  class v {
    constructor(k, w, M) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        I = x(w);
      else if (w instanceof v || w instanceof c)
        I = x(w.root), w.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = w.map);
      else {
        let $ = l;
        M.syntax && ($ = M.syntax.parse), M.parser && ($ = M.parser), $.parse && ($ = $.parse);
        try {
          I = $(w, M);
        } catch (_) {
          this.processed = !0, this.error = _;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(k, I, M), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(k) {
      return this.async().catch(k);
    }
    finally(k) {
      return this.async().then(k, k);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(k, w) {
      let M = this.result.lastPlugin;
      try {
        if (w && w.addToError(k), this.error = k, k.name === "CssSyntaxError" && !k.plugin)
          k.plugin = M.postcssPlugin, k.setMessage();
        else if (M.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = M.postcssPlugin, $ = M.postcssVersion, _ = this.result.processor.version, Q = $.split("."), V = _.split(".");
          (Q[0] !== V[0] || parseInt(Q[1]) > parseInt(V[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + _ + ", but " + I + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return k;
    }
    prepareVisitors() {
      this.listeners = {};
      let k = (w, M, I) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([w, I]);
      };
      for (let w of this.plugins)
        if (typeof w == "object")
          for (let M in w) {
            if (!h[M] && /^[A-Z]/.test(M))
              throw new Error(
                `Unknown event ${M} in ${w.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[M])
              if (typeof w[M] == "object")
                for (let I in w[M])
                  I === "*" ? k(w, M, w[M][I]) : k(
                    w,
                    M + "-" + I.toLowerCase(),
                    w[M][I]
                  );
              else typeof w[M] == "function" && k(w, M, w[M]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let k = 0; k < this.plugins.length; k++) {
        let w = this.plugins[k], M = this.runOnRoot(w);
        if (m(M))
          try {
            await M;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let k = this.result.root;
        for (; !k[e]; ) {
          k[e] = !0;
          let w = [g(k)];
          for (; w.length > 0; ) {
            let M = this.visitTick(w);
            if (m(M))
              try {
                await M;
              } catch (I) {
                let $ = w[w.length - 1].node;
                throw this.handleError(I, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (k.type === "document") {
                let I = k.nodes.map(
                  ($) => M($, this.helpers)
                );
                await Promise.all(I);
              } else
                await M(k, this.helpers);
            } catch (I) {
              throw this.handleError(I);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(k) {
      this.result.lastPlugin = k;
      try {
        if (typeof k == "object" && k.Once) {
          if (this.result.root.type === "document") {
            let w = this.result.root.nodes.map(
              (M) => k.Once(M, this.helpers)
            );
            return m(w[0]) ? Promise.all(w) : w;
          }
          return k.Once(this.result.root, this.helpers);
        } else if (typeof k == "function")
          return k(this.result.root, this.result);
      } catch (w) {
        throw this.handleError(w);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let k = this.result.opts, w = n;
      k.syntax && (w = k.syntax.stringify), k.stringifier && (w = k.stringifier), w.stringify && (w = w.stringify);
      let I = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let k of this.plugins) {
        let w = this.runOnRoot(k);
        if (m(w))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let k = this.result.root;
        for (; !k[e]; )
          k[e] = !0, this.walkSync(k);
        if (this.listeners.OnceExit)
          if (k.type === "document")
            for (let w of k.nodes)
              this.visitSync(this.listeners.OnceExit, w);
          else
            this.visitSync(this.listeners.OnceExit, k);
      }
      return this.result;
    }
    then(k, w) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(k, w);
    }
    toString() {
      return this.css;
    }
    visitSync(k, w) {
      for (let [M, I] of k) {
        this.result.lastPlugin = M;
        let $;
        try {
          $ = I(w, this.helpers);
        } catch (_) {
          throw this.handleError(_, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(k) {
      let w = k[k.length - 1], { node: M, visitors: I } = w;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        k.pop();
        return;
      }
      if (I.length > 0 && w.visitorIndex < I.length) {
        let [_, Q] = I[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === I.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = _;
        try {
          return Q(M.toProxy(), this.helpers);
        } catch (V) {
          throw this.handleError(V, M);
        }
      }
      if (w.iterator !== 0) {
        let _ = w.iterator, Q;
        for (; Q = M.nodes[M.indexes[_]]; )
          if (M.indexes[_] += 1, !Q[e]) {
            Q[e] = !0, k.push(g(Q));
            return;
          }
        w.iterator = 0, delete M.indexes[_];
      }
      let $ = w.events;
      for (; w.eventIndex < $.length; ) {
        let _ = $[w.eventIndex];
        if (w.eventIndex += 1, _ === u) {
          M.nodes && M.nodes.length && (M[e] = !0, w.iterator = M.getIterator());
          return;
        } else if (this.listeners[_]) {
          w.visitors = this.listeners[_];
          return;
        }
      }
      k.pop();
    }
    walkSync(k) {
      k[e] = !0;
      let w = f(k);
      for (let M of w)
        if (M === u)
          k.nodes && k.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[M];
          if (I && this.visitSync(I, k.toProxy()))
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
  return v.registerPostcss = (S) => {
    y = S;
  }, ds = v, v.default = v, p.registerLazyResult(v), o.registerLazyResult(v), ds;
}
var ps, al;
function qm() {
  if (al) return ps;
  al = 1;
  let e = Ic(), t = Hn(), r = Oc(), n = Ks();
  const i = Vs();
  class o {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, s, this._opts, l);
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
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = c, c;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return ps = o, o.default = o, ps;
}
var hs, ll;
function Wm() {
  if (ll) return hs;
  ll = 1;
  let e = qm(), t = Pc(), r = Hs(), n = Zr();
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
  return hs = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), hs;
}
var fs, cl;
function jm() {
  if (cl) return fs;
  cl = 1;
  let e = Yn(), t = Lc(), r = Kn(), n = Ys(), i = Gn(), o = Zr(), a = Gs();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: s, ...h } = l;
    if (s) {
      p = [];
      for (let d of s) {
        let u = { ...d, __proto__: i.prototype };
        u.map && (u.map = {
          ...u.map,
          __proto__: t.prototype
        }), p.push(u);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((d) => c(d, p))), h.source) {
      let { inputId: d, ...u } = h.source;
      h.source = u, d != null && (h.source.input = p[d]);
    }
    if (h.type === "root")
      return new o(h);
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
  return fs = c, c.default = c, fs;
}
var ms, ul;
function Hm() {
  if (ul) return ms;
  ul = 1;
  let e = Ws(), t = Yn(), r = Pc(), n = or(), i = Wm(), o = Hn(), a = jm(), c = Hs(), l = _c(), p = Kn(), s = Ys(), h = Vs(), d = Gn(), u = Ks(), m = Nc(), f = Gs(), g = Zr(), x = Vn();
  function y(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return y.plugin = function(S, k) {
    let w = !1;
    function M(...$) {
      console && console.warn && !w && (w = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let _ = k(...$);
      return _.postcssPlugin = S, _.postcssVersion = new i().version, _;
    }
    let I;
    return Object.defineProperty(M, "postcss", {
      get() {
        return I || (I = M()), I;
      }
    }), M.process = function($, _, Q) {
      return y([M(Q)]).process($, _);
    }, M;
  }, y.stringify = o, y.parse = u, y.fromJSON = a, y.list = m, y.comment = (v) => new p(v), y.atRule = (v) => new s(v), y.decl = (v) => new t(v), y.rule = (v) => new f(v), y.root = (v) => new g(v), y.document = (v) => new c(v), y.CssSyntaxError = e, y.Declaration = t, y.Container = n, y.Processor = i, y.Document = c, y.Comment = p, y.Warning = l, y.AtRule = s, y.Result = h, y.Input = d, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), ms = y, y.default = y, ms;
}
var Vm = Hm();
const Ae = /* @__PURE__ */ Nm(Vm);
Ae.stringify;
Ae.fromJSON;
Ae.plugin;
Ae.parse;
Ae.list;
Ae.document;
Ae.comment;
Ae.atRule;
Ae.rule;
Ae.decl;
Ae.root;
Ae.CssSyntaxError;
Ae.Declaration;
Ae.Container;
Ae.Processor;
Ae.Document;
Ae.Comment;
Ae.Warning;
Ae.AtRule;
Ae.Result;
Ae.Input;
Ae.Rule;
Ae.Root;
Ae.Node;
class Xs {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    rt(this, "parentElement", null), rt(this, "parentNode", null), rt(this, "ownerDocument"), rt(this, "firstChild", null), rt(this, "lastChild", null), rt(this, "previousSibling", null), rt(this, "nextSibling", null), rt(this, "ELEMENT_NODE", 1), rt(this, "TEXT_NODE", 3), rt(this, "nodeType"), rt(this, "nodeName"), rt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Xs) {
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
const dl = {
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
}, pl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, yn = {}, $c = {}, Ym = () => !!globalThis.Zone;
function Js(e) {
  if (yn[e])
    return yn[e];
  const t = globalThis[e], r = t.prototype, n = e in dl ? dl[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in pl ? pl[e] : void 0, a = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Ym())
    return yn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), $c[e] = () => c.remove()) : c.remove(), yn[e] = p;
  } catch {
    return r;
  }
}
const gs = {};
function Nt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (gs[i])
    return gs[i].call(
      t
    );
  const o = Js(e), a = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return a ? (gs[i] = a, a.call(t)) : t[r];
}
const ys = {};
function Dc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (ys[n])
    return ys[n].bind(
      t
    );
  const o = Js(e)[r];
  return typeof o != "function" ? t[r] : (ys[n] = o, o.bind(t));
}
function Gm(e) {
  return Nt("Node", e, "ownerDocument");
}
function Km(e) {
  return Nt("Node", e, "childNodes");
}
function Xm(e) {
  return Nt("Node", e, "parentNode");
}
function Jm(e) {
  return Nt("Node", e, "parentElement");
}
function Zm(e) {
  return Nt("Node", e, "textContent");
}
function Qm(e, t) {
  return Dc("Node", e, "contains")(t);
}
function eg(e) {
  return Dc("Node", e, "getRootNode")();
}
function tg(e) {
  return !e || !("host" in e) ? null : Nt("ShadowRoot", e, "host");
}
function rg(e) {
  return e.styleSheets;
}
function ng(e) {
  return !e || !("shadowRoot" in e) ? null : Nt("Element", e, "shadowRoot");
}
function ig(e, t) {
  return Nt("Element", e, "querySelector")(t);
}
function sg(e, t) {
  return Nt("Element", e, "querySelectorAll")(t);
}
function zc() {
  return [
    Js("MutationObserver").constructor,
    $c.MutationObserver ?? (() => {
    })
  ];
}
let Gr = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Gr = () => (/* @__PURE__ */ new Date()).getTime());
function ar(e, t, r) {
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
const oe = {
  ownerDocument: Gm,
  childNodes: Km,
  parentNode: Xm,
  parentElement: Jm,
  textContent: Zm,
  contains: Qm,
  getRootNode: eg,
  host: tg,
  styleSheets: rg,
  shadowRoot: ng,
  querySelector: ig,
  querySelectorAll: sg,
  nowTimestamp: Gr,
  mutationObserverCtor: zc,
  patch: ar
};
function Ge(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const br = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let hl = {
  map: {},
  getId() {
    return console.error(br), -1;
  },
  getNode() {
    return console.error(br), null;
  },
  removeNodeFromMap() {
    console.error(br);
  },
  has() {
    return console.error(br), !1;
  },
  reset() {
    console.error(br);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (hl = new Proxy(hl, {
  get(e, t, r) {
    return t === "map" && console.error(br), Reflect.get(e, t, r);
  }
}));
function Kr(e, t, r = {}) {
  let n = null, i = 0;
  return function(...o) {
    const a = Date.now();
    !i && r.leading === !1 && (i = a);
    const c = t - (a - i), l = this;
    c <= 0 || c > t ? (n && (clearTimeout(n), n = null), i = a, e.apply(l, o)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(l, o);
    }, c));
  };
}
function Xn(e, t, r, n, i = window) {
  const o = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(a) {
        setTimeout(() => {
          r.set.call(this, a);
        }, 0), o && o.set && o.set.call(this, a);
      }
    }
  ), () => Xn(e, t, o || {}, !0);
}
function Fc(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = oe.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = oe.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Uc() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Bc() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function qc(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : oe.parentElement(e) : null;
}
function Ke(e, t, r, n) {
  if (!e)
    return !1;
  const i = qc(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Ln(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function og(e, t) {
  return t.getId(e) !== -1;
}
function bs(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Yr;
}
function Wc(e, t) {
  if (Br(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = oe.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Wc(n, t) : !0;
}
function Cs(e) {
  return !!e.changedTouches;
}
function ag(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function jc(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Hc(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Es(e) {
  return e ? e instanceof Xs && "shadowRoot" in e ? !!e.shadowRoot : !!oe.shadowRoot(e) : !1;
}
class lg {
  constructor() {
    B(this, "id", 1), B(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), B(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function Vc(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = oe.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && oe.host(oe.getRootNode(e)) && (r = oe.host(oe.getRootNode(e))), r;
}
function cg(e) {
  let t = e, r;
  for (; r = Vc(t); )
    t = r;
  return t;
}
function ug(e) {
  const t = oe.ownerDocument(e);
  if (!t) return !1;
  const r = cg(e);
  return oe.contains(t, r);
}
function Yc(e) {
  const t = oe.ownerDocument(e);
  return t ? oe.contains(t, e) || ug(e) : !1;
}
var de = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(de || {}), le = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(le || {}), Qe = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Qe || {}), Ot = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(Ot || {}), Ir = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Ir || {}), vr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(vr || {}), Gc = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Gc || {});
function fl(e) {
  return "__ln" in e;
}
class dg {
  constructor() {
    B(this, "length", 0), B(this, "head", null), B(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && fl(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && fl(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const ml = (e, t) => `${e}@${t}`;
class pg {
  constructor() {
    B(this, "frozen", !1), B(this, "locked", !1), B(this, "texts", []), B(this, "attributes", []), B(this, "attributeMap", /* @__PURE__ */ new WeakMap()), B(this, "removes", []), B(this, "mapRemoves", []), B(this, "movedMap", {}), B(this, "addedSet", /* @__PURE__ */ new Set()), B(this, "movedSet", /* @__PURE__ */ new Set()), B(this, "droppedSet", /* @__PURE__ */ new Set()), B(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), B(this, "mutationCb"), B(this, "blockClass"), B(this, "blockSelector"), B(this, "maskTextClass"), B(this, "maskTextSelector"), B(this, "inlineStylesheet"), B(this, "maskInputOptions"), B(this, "maskTextFn"), B(this, "maskInputFn"), B(this, "keepIframeSrcFn"), B(this, "recordCanvas"), B(this, "inlineImages"), B(this, "slimDOMOptions"), B(this, "dataURLOptions"), B(this, "doc"), B(this, "mirror"), B(this, "iframeManager"), B(this, "stylesheetManager"), B(this, "shadowDomManager"), B(this, "canvasManager"), B(this, "processedNodeManager"), B(this, "unattachedDoc"), B(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), B(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new dg(), i = (l) => {
        let p = l, s = Yr;
        for (; s === Yr; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (l) => {
        const p = oe.parentNode(l);
        if (!p || !Yc(l))
          return;
        let s = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = Br(p) ? this.mirror.getId(Vc(l)) : this.mirror.getId(p), d = i(l);
        if (h === -1 || d === -1)
          return n.addNode(l);
        const u = wr(l, {
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
            jc(m, this.mirror) && this.iframeManager.addIframe(m), Hc(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Es(l) && this.shadowDomManager.addShadowRoot(oe.shadowRoot(l), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: s
        });
        u && (t.push({
          parentId: h,
          nextId: d,
          node: u
        }), r.add(u.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        gl(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(oe.parentNode(l)) || o(l);
      for (const l of this.addedSet)
        !yl(this.droppedSet, l) && !gl(this.removesSubTreeCache, l, this.mirror) || yl(this.movedSet, l) ? o(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const p = this.mirror.getId(oe.parentNode(a.value)), s = i(a.value);
          p !== -1 && s !== -1 && (l = a);
        }
        if (!l) {
          let p = n.tail;
          for (; p; ) {
            const s = p;
            if (p = p.previous, s) {
              const h = this.mirror.getId(oe.parentNode(s.value));
              if (i(s.value) === -1) continue;
              if (h !== -1) {
                l = s;
                break;
              } else {
                const u = s.value, m = oe.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = oe.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    l = s;
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
        a = l.previous, n.removeNode(l.value), o(l.value);
      }
      const c = {
        texts: this.texts.map((l) => {
          const p = l.node, s = oe.parentNode(p);
          return s && s.tagName === "TEXTAREA" && this.genTextAreaValueMutation(s), {
            id: this.mirror.getId(p),
            value: l.value
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => {
          const { attributes: p } = l;
          if (typeof p.style == "string") {
            const s = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
            s.length < p.style.length && (s + h).split("var(").length === p.style.split("var(").length && (p.style = l.styleDiff);
          }
          return {
            id: this.mirror.getId(l.node),
            attributes: p
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        removes: this.removes,
        adds: t
      };
      !c.texts.length && !c.attributes.length && !c.removes.length && !c.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(c));
    }), B(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        oe.childNodes(t),
        (i) => oe.textContent(i) || ""
      ).join("");
      r.attributes.value = Rn({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: An(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), B(this, "processMutation", (t) => {
      if (!bs(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = oe.textContent(t.target);
            !Ke(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: kc(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, qc(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = An(r);
              i = Rn({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Ke(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
              return;
            let o = this.attributeMap.get(t.target);
            if (r.tagName === "IFRAME" && n === "src" && !this.keepIframeSrcFn(i))
              if (!r.contentDocument)
                n = "rr_src";
              else
                return;
            if (o || (o = {
              node: t.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !vc(r.tagName, n))
              if (o.attributes[n] = bc(
                this.doc,
                ir(r.tagName),
                ir(n),
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
                  const l = r.style.getPropertyValue(c), p = r.style.getPropertyPriority(c);
                  l !== a.style.getPropertyValue(c) || p !== a.style.getPropertyPriority(c) ? p === "" ? o.styleDiff[c] = l : o.styleDiff[c] = [l, p] : o._unchangedStyles[c] = [l, p];
                }
                for (const c of Array.from(a.style))
                  r.style.getPropertyValue(c) === "" && (o.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? o.attributes.rr_open_mode = "modal" : o.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (Ke(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Br(t.target) ? this.mirror.getId(oe.host(t.target)) : this.mirror.getId(t.target);
              Ke(t.target, this.blockClass, this.blockSelector, !1) || bs(r, this.mirror, this.slimDOMOptions) || !og(r, this.mirror) || (this.addedSet.has(r) ? (Ms(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Wc(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[ml(n, i)] ? Ms(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Br(t.target) && qr(t.target) ? !0 : void 0
              }), hg(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), B(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (bs(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[ml(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Ke(t, this.blockClass, this.blockSelector, !1) || (oe.childNodes(t).forEach((n) => this.genAdds(n)), Es(t) && oe.childNodes(oe.shadowRoot(t)).forEach((n) => {
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
function Ms(e, t) {
  e.delete(t), oe.childNodes(t).forEach((r) => Ms(e, r));
}
function hg(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), oe.childNodes(n).forEach((i) => r.push(i)));
  }
}
function gl(e, t, r) {
  return e.size === 0 ? !1 : fg(e, t);
}
function fg(e, t, r) {
  const n = oe.parentNode(t);
  return n ? e.has(n) : !1;
}
function yl(e, t) {
  return e.size === 0 ? !1 : Kc(e, t);
}
function Kc(e, t) {
  const r = oe.parentNode(t);
  return r ? e.has(r) ? !0 : Kc(e, r) : !1;
}
let Wr;
function mg(e) {
  Wr = e;
}
function gg() {
  Wr = void 0;
}
const ce = (e) => Wr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Wr && Wr(n) === !0)
      return;
    throw n;
  }
} : e, tr = [];
function Qr(e) {
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
function Xc(e, t) {
  const r = new pg();
  tr.push(r), r.init(e);
  const [n, i] = zc(), o = new n(
    ce(r.processMutations.bind(r))
  );
  return o.observe(t, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), [o, i];
}
function yg({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, o = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let a = [], c;
  const l = Kr(
    ce(
      (h) => {
        const d = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= d, u)),
          h
        ), a = [], c = null;
      }
    ),
    o
  ), p = ce(
    Kr(
      ce((h) => {
        const d = Qr(h), { clientX: u, clientY: m } = Cs(h) ? h.changedTouches[0] : h;
        c || (c = Gr()), a.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: Gr() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? le.Drag : h instanceof MouseEvent ? le.MouseMove : le.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    Ge("mousemove", p, r),
    Ge("touchmove", p, r),
    Ge("drag", p, r)
  ];
  return ce(() => {
    s.forEach((h) => h());
  });
}
function bg({
  mouseInteractionCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  if (o.mouseInteraction === !1)
    return () => {
    };
  const a = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, c = [];
  let l = null;
  const p = (s) => (h) => {
    const d = Qr(h);
    if (Ke(d, n, i, !0))
      return;
    let u = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = Ot.Mouse;
          break;
        case "touch":
          u = Ot.Touch;
          break;
        case "pen":
          u = Ot.Pen;
          break;
      }
      u === Ot.Touch ? Qe[s] === Qe.MouseDown ? m = "TouchStart" : Qe[s] === Qe.MouseUp && (m = "TouchEnd") : Ot.Pen;
    } else Cs(h) && (u = Ot.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === Ot.Touch || m.startsWith("Mouse") && u === Ot.Mouse) && (u = null)) : Qe[s] === Qe.Click && (u = l, l = null);
    const f = Cs(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(d), { clientX: x, clientY: y } = f;
    ce(e)({
      type: Qe[m],
      id: g,
      x,
      y,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Qe).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && a[s] !== !1
  ).forEach((s) => {
    let h = ir(s);
    const d = p(s);
    if (window.PointerEvent)
      switch (Qe[s]) {
        case Qe.MouseDown:
        case Qe.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Qe.TouchStart:
        case Qe.TouchEnd:
          return;
      }
    c.push(Ge(h, d, t));
  }), ce(() => {
    c.forEach((s) => s());
  });
}
function Jc({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const a = ce(
    Kr(
      ce((c) => {
        const l = Qr(c);
        if (!l || Ke(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const s = Fc(t.defaultView);
          e({
            id: p,
            x: s.left,
            y: s.top
          });
        } else
          e({
            id: p,
            x: l.scrollLeft,
            y: l.scrollTop
          });
      }),
      o.scroll || 100
    )
  );
  return Ge("scroll", a, t);
}
function vg({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = ce(
    Kr(
      ce(() => {
        const o = Uc(), a = Bc();
        (r !== o || n !== a) && (e({
          width: Number(a),
          height: Number(o)
        }), r = o, n = a);
      }),
      200
    )
  );
  return Ge("resize", i, t);
}
const kg = ["INPUT", "TEXTAREA", "SELECT"], bl = /* @__PURE__ */ new WeakMap();
function wg({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: o,
  ignoreSelector: a,
  maskInputOptions: c,
  maskInputFn: l,
  sampling: p,
  userTriggeredOnInput: s
}) {
  function h(y) {
    let v = Qr(y);
    const S = y.isTrusted, k = v && v.tagName;
    if (v && k === "OPTION" && (v = oe.parentElement(v)), !v || !k || kg.indexOf(k) < 0 || Ke(v, n, i, !0) || v.classList.contains(o) || a && v.matches(a))
      return;
    let w = v.value, M = !1;
    const I = An(v) || "";
    I === "radio" || I === "checkbox" ? M = v.checked : (c[k.toLowerCase()] || c[I]) && (w = Rn({
      element: v,
      maskInputOptions: c,
      tagName: k,
      type: I,
      value: w,
      maskInputFn: l
    })), d(
      v,
      s ? { text: w, isChecked: M, userTriggered: S } : { text: w, isChecked: M }
    );
    const $ = v.name;
    I === "radio" && $ && M && t.querySelectorAll(`input[type="radio"][name="${$}"]`).forEach((_) => {
      if (_ !== v) {
        const Q = _.value;
        d(
          _,
          s ? { text: Q, isChecked: !M, userTriggered: !1 } : { text: Q, isChecked: !M }
        );
      }
    });
  }
  function d(y, v) {
    const S = bl.get(y);
    if (!S || S.text !== v.text || S.isChecked !== v.isChecked) {
      bl.set(y, v);
      const k = r.getId(y);
      ce(e)({
        ...v,
        id: k
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (y) => Ge(y, ce(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((y) => y());
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
      (y) => Xn(
        y[0],
        y[1],
        {
          set() {
            ce(h)({
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
  ), ce(() => {
    m.forEach((y) => y());
  });
}
function In(e) {
  const t = [];
  function r(n, i) {
    if (bn("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || bn("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || bn("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || bn("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function zt(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function xg({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: ce(
      (s, h, d) => {
        const [u, m] = d, { id: f, styleId: g } = zt(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: u, index: m }]
        }), s.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(s, h, d = this.cssRules.length) {
    const u = `${s} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [u, d]);
  };
  const o = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(o, {
    apply: ce(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = zt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: u }]
        }), s.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(s) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [s]);
  };
  let a;
  n.CSSStyleSheet.prototype.replace && (a = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(a, {
    apply: ce(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = zt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: u
        }), s.apply(h, d);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: ce(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = zt(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: u
        }), s.apply(h, d);
      }
    )
  }));
  const l = {};
  vn("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (vn("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), vn("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), vn("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
  const p = {};
  return Object.entries(l).forEach(([s, h]) => {
    p[s] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      p[s].insertRule,
      {
        apply: ce(
          (d, u, m) => {
            const [f, g] = m, { id: x, styleId: y } = zt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (x && x !== -1 || y && y !== -1) && e({
              id: x,
              styleId: y,
              adds: [
                {
                  rule: f,
                  index: [
                    ...In(u),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), d.apply(u, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      p[s].deleteRule,
      {
        apply: ce(
          (d, u, m) => {
            const [f] = m, { id: g, styleId: x } = zt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...In(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), ce(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function Zc({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(oe.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (o = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : o.ShadowRoot, l = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
    c == null ? void 0 : c.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return a === null || a === -1 || !c || !l ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: l.configurable,
    enumerable: l.enumerable,
    get() {
      var p;
      return (p = l.get) == null ? void 0 : p.call(this);
    },
    set(p) {
      var s;
      const h = (s = l.set) == null ? void 0 : s.call(this, p);
      if (a !== null && a !== -1)
        try {
          t.adoptStyleSheets(p, a);
        } catch {
        }
      return h;
    }
  }), ce(() => {
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
function Sg({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: ce(
      (c, l, p) => {
        var s;
        const [h, d, u] = p;
        if (r.has(h))
          return o.apply(l, [h, d, u]);
        const { id: m, styleId: f } = zt(
          (s = l.parentRule) == null ? void 0 : s.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: h,
            value: d,
            priority: u
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: In(l.parentRule)
        }), c.apply(l, p);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: ce(
      (c, l, p) => {
        var s;
        const [h] = p;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: d, styleId: u } = zt(
          (s = l.parentRule) == null ? void 0 : s.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (d && d !== -1 || u && u !== -1) && e({
          id: d,
          styleId: u,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: In(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), ce(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Cg({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const a = ce(
    (l) => Kr(
      ce((p) => {
        const s = Qr(p);
        if (!s || Ke(s, t, r, !0))
          return;
        const { currentTime: h, volume: d, muted: u, playbackRate: m, loop: f } = s;
        e({
          type: l,
          id: n.getId(s),
          currentTime: h,
          volume: d,
          muted: u,
          playbackRate: m,
          loop: f
        });
      }),
      i.media || 500
    )
  ), c = [
    Ge("play", a(vr.Play), o),
    Ge("pause", a(vr.Pause), o),
    Ge("seeked", a(vr.Seeked), o),
    Ge("volumechange", a(vr.VolumeChange), o),
    Ge("ratechange", a(vr.RateChange), o)
  ];
  return ce(() => {
    c.forEach((l) => l());
  });
}
function Eg({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), o = r.FontFace;
  r.FontFace = function(l, p, s) {
    const h = new o(l, p, s);
    return i.set(h, {
      family: l,
      buffer: typeof p != "string",
      descriptors: s,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), h;
  };
  const a = ar(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          ce(() => {
            const p = i.get(l);
            p && (e(p), i.delete(l));
          }),
          0
        ), c.apply(this, [l]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = o;
  }), n.push(a), ce(() => {
    n.forEach((c) => c());
  });
}
function Mg(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let a = !0;
  const c = ce(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const p = [], s = l.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const d = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = d;
      Ke(u, n, i, !0) || Ke(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return c(), Ge("selectionchange", c);
}
function Rg({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : ar(
    r.customElements,
    "define",
    function(i) {
      return function(o, a, c) {
        try {
          t({
            define: {
              name: o
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${o}`);
        }
        return i.apply(this, [o, a, c]);
      };
    }
  );
}
function Ag(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: o,
    viewportResizeCb: a,
    inputCb: c,
    mediaInteractionCb: l,
    styleSheetRuleCb: p,
    styleDeclarationCb: s,
    canvasMutationCb: h,
    fontCb: d,
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
    t.scroll && t.scroll(...f), o(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), a(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), l(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), p(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), s(...f);
  }, e.canvasMutationCb = (...f) => {
    t.canvasMutation && t.canvasMutation(...f), h(...f);
  }, e.fontCb = (...f) => {
    t.font && t.font(...f), d(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), u(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function Tg(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Ag(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Xc(e, e.doc));
  const o = yg(e), a = bg(e), c = Jc(e), l = vg(e, {
    win: r
  }), p = wg(e), s = Cg(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = xg(e, { win: r }), d = Zc(e, e.doc), u = Sg(e, {
    win: r
  }), e.collectFonts && (m = Eg(e)));
  const f = Mg(e), g = Rg(e), x = [];
  for (const y of e.plugins)
    x.push(
      y.observer(y.callback, r, y.options)
    );
  return ce(() => {
    tr.forEach((y) => y.reset()), n == null || n.disconnect(), i(), o(), a(), c(), l(), p(), s(), h(), d(), u(), m(), f(), g(), x.forEach((y) => y());
  });
}
function bn(e) {
  return typeof window[e] < "u";
}
function vn(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class vl {
  constructor(t) {
    B(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), B(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const o = n || this.getIdToRemoteIdMap(t), a = i || this.getRemoteIdToIdMap(t);
    let c = o.get(r);
    return c || (c = this.generateIdFn(), o.set(r, c), a.set(c, r)), c;
  }
  getIds(t, r) {
    const n = this.getIdToRemoteIdMap(t), i = this.getRemoteIdToIdMap(t);
    return r.map(
      (o) => this.getId(t, o, n, i)
    );
  }
  getRemoteId(t, r, n) {
    const i = n || this.getRemoteIdToIdMap(t);
    if (typeof r != "number") return r;
    const o = i.get(r);
    return o || -1;
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
class Lg {
  constructor(t) {
    B(this, "iframes", /* @__PURE__ */ new WeakMap()), B(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), B(this, "crossOriginIframeMirror", new vl(yc)), B(this, "crossOriginIframeStyleMirror"), B(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), B(this, "mirror"), B(this, "mutationCb"), B(this, "wrappedEmit"), B(this, "loadListener"), B(this, "stylesheetManager"), B(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new vl(
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
    const o = this.transformCrossOriginEvent(
      i,
      r.data.event
    );
    o && this.wrappedEmit(
      o,
      r.data.isCheckout
    );
  }
  transformCrossOriginEvent(t, r) {
    var n;
    switch (r.type) {
      case de.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: de.IncrementalSnapshot,
          data: {
            source: le.Mutation,
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
      case de.Meta:
      case de.Load:
      case de.DomContentLoaded:
        return !1;
      case de.Plugin:
        return r;
      case de.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case de.IncrementalSnapshot:
        switch (r.data.source) {
          case le.Mutation:
            return r.data.adds.forEach((i) => {
              this.replaceIds(i, t, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(i.node, t);
              const o = this.crossOriginIframeRootIdMap.get(t);
              o && this.patchRootIdOnNode(i.node, o);
            }), r.data.removes.forEach((i) => {
              this.replaceIds(i, t, ["parentId", "id"]);
            }), r.data.attributes.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r.data.texts.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case le.Drag:
          case le.TouchMove:
          case le.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case le.ViewportResize:
            return !1;
          case le.MediaInteraction:
          case le.MouseInteraction:
          case le.Scroll:
          case le.CanvasMutation:
          case le.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case le.StyleSheetRule:
          case le.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case le.Font:
            return r;
          case le.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case le.AdoptedStyleSheet:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleIds"]), (n = r.data.styles) == null || n.forEach((i) => {
              this.replaceStyleIds(i, t, ["styleId"]);
            }), r;
        }
    }
    return !1;
  }
  replace(t, r, n, i) {
    for (const o of i)
      !Array.isArray(r[o]) && typeof r[o] != "number" || (Array.isArray(r[o]) ? r[o] = t.getIds(
        n,
        r[o]
      ) : r[o] = t.getId(n, r[o]));
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
    t.type !== Gc.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Ig {
  constructor(t) {
    B(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), B(this, "mutationCb"), B(this, "scrollCb"), B(this, "bypassOptions"), B(this, "mirror"), B(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!qr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Xc(
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
      Jc({
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
        this.mirror.getId(oe.host(t))
      ), this.restoreHandlers.push(
        Zc(
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
      ar(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const a = i.call(this, o), c = oe.shadowRoot(this);
            return c && Yc(this) && n.addShadowRoot(c, r), a;
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
var xr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Og = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var kn = 0; kn < xr.length; kn++)
  Og[xr.charCodeAt(kn)] = kn;
var _g = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += xr[t[r] >> 2], i += xr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += xr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += xr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const kl = /* @__PURE__ */ new Map();
function Ng(e, t) {
  let r = kl.get(e);
  return r || (r = /* @__PURE__ */ new Map(), kl.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Qc = (e, t, r) => {
  if (!e || !(tu(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Ng(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function xn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => xn(n, t, r));
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
    const n = e.constructor.name, i = _g(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          xn(e.buffer, t, r),
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
          args: [xn(e.data, t, r), e.width, e.height]
        };
      if (tu(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Qc(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const eu = (e, t, r) => e.map((n) => xn(n, t, r)), tu = (e, t) => !![
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
function Pg(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = ar(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...p) {
            return Ke(this.canvas, r, n, !0) || setTimeout(() => {
              const s = eu(p, t, this);
              e(this.canvas, {
                type: Ir["2D"],
                property: a,
                args: s
              });
            }, 0), l.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = Xn(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Ir["2D"],
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
function $g(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function wl(e, t, r, n) {
  const i = [];
  try {
    const o = ar(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!Ke(this, t, r, !0)) {
            const p = $g(c);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
              if (l[0] && typeof l[0] == "object") {
                const s = l[0];
                s.preserveDrawingBuffer || (s.preserveDrawingBuffer = !0);
              } else
                l.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return a.apply(this, [c, ...l]);
        };
      }
    );
    i.push(o);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    i.forEach((o) => o());
  };
}
function xl(e, t, r, n, i, o) {
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
        const p = ar(
          e,
          l,
          function(s) {
            return function(...h) {
              const d = s.apply(this, h);
              if (Qc(d, o, this), "tagName" in this.canvas && !Ke(this.canvas, n, i, !0)) {
                const u = eu(h, o, this), m = {
                  type: t,
                  property: l,
                  args: u
                };
                r(this.canvas, m);
              }
              return d;
            };
          }
        );
        a.push(p);
      } catch {
        const p = Xn(e, l, {
          set(s) {
            r(this.canvas, {
              type: t,
              property: l,
              args: [s],
              setter: !0
            });
          }
        });
        a.push(p);
      }
  return a;
}
function Dg(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...xl(
      t.WebGLRenderingContext.prototype,
      Ir.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...xl(
      t.WebGL2RenderingContext.prototype,
      Ir.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const ru = `(function() {
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
`, Sl = typeof self < "u" && self.Blob && new Blob([ru], { type: "text/javascript;charset=utf-8" });
function zg(e) {
  let t;
  try {
    if (t = Sl && (self.URL || self.webkitURL).createObjectURL(Sl), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(ru),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Fg {
  constructor(t) {
    B(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), B(this, "rafStamps", { latestId: 0, invokeId: null }), B(this, "mirror"), B(this, "mutationCb"), B(this, "resetObservers"), B(this, "frozen", !1), B(this, "locked", !1), B(this, "processMutation", (l, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(l) || this.pendingCanvasMutations.set(l, []), this.pendingCanvasMutations.get(l).push(p);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: o,
      recordCanvas: a,
      dataURLOptions: c
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, a && r === "all" && this.initCanvasMutationObserver(n, i, o), a && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, o, {
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
  initCanvasFPSObserver(t, r, n, i, o) {
    const a = wl(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new zg();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: y, height: v } = m.data;
      this.mutationCb({
        id: f,
        type: Ir["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, y, v]
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
    const p = 1e3 / t;
    let s = 0, h;
    const d = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        Ke(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (s && m - s < p) {
        h = requestAnimationFrame(u);
        return;
      }
      s = m, d().forEach(async (f) => {
        var g;
        const x = this.mirror.getId(f);
        if (c.get(x) || f.width === 0 || f.height === 0) return;
        if (c.set(x, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const v = f.getContext(f.__context);
          ((g = v == null ? void 0 : v.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && v.clear(v.COLOR_BUFFER_BIT);
        }
        const y = await createImageBitmap(f);
        l.postMessage(
          {
            id: x,
            bitmap: y,
            width: f.width,
            height: f.height,
            dataURLOptions: o.dataURLOptions
          },
          [y]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = wl(
      t,
      r,
      n,
      !1
    ), o = Pg(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = Dg(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), o(), a();
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
    }), { type: o } = n[0];
    this.mutationCb({ id: r, type: o, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class Ug {
  constructor(t) {
    B(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), B(this, "mutationCb"), B(this, "adoptedStyleSheetCb"), B(this, "styleMirror", new lg()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
    for (const o of t) {
      let a;
      this.styleMirror.has(o) ? a = this.styleMirror.getId(o) : (a = this.styleMirror.add(o), i.push({
        styleId: a,
        rules: Array.from(o.rules || CSSRule, (c, l) => ({
          rule: fc(c, o.href),
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
class Bg {
  constructor() {
    B(this, "nodeMap", /* @__PURE__ */ new WeakMap()), B(this, "active", !1);
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
let Oe, Sn, vs, On = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((ea = e.contentWindow) == null ? void 0 : ea.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const ct = Gf();
function qt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: o = null,
    ignoreClass: a = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: l = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: s = !0,
    maskAllInputs: h,
    maskInputOptions: d,
    slimDOMOptions: u,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: x,
    sampling: y = {},
    dataURLOptions: v = {},
    mousemoveWait: S,
    recordDOM: k = !0,
    recordCanvas: w = !1,
    recordCrossOriginIframes: M = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: $ = !1,
    collectFonts: _ = !1,
    inlineImages: Q = !1,
    plugins: V,
    keepIframeSrcFn: L = () => !1,
    ignoreCSSAttributes: Le = /* @__PURE__ */ new Set([]),
    errorHandler: ze
  } = e;
  mg(ze);
  const K = M ? window.parent === window : !0;
  let ee = !1;
  if (!K)
    try {
      window.parent.document && (ee = !1);
    } catch {
      ee = !0;
    }
  if (K && !t)
    throw new Error("emit function is required");
  if (!K && !ee)
    return () => {
    };
  S !== void 0 && y.mousemove === void 0 && (y.mousemove = S), ct.reset();
  const Te = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, Me = wc(u);
  ag();
  let ae, J = 0;
  const be = (H) => {
    for (const ue of V || [])
      ue.eventProcessor && (H = ue.eventProcessor(H));
    return x && // Disable packing events which will be emitted to parent frames.
    !ee && (H = x(H)), H;
  };
  Oe = (H, ue) => {
    var ge;
    const Ee = H;
    if (Ee.timestamp = Gr(), (ge = tr[0]) != null && ge.isFrozen() && Ee.type !== de.FullSnapshot && !(Ee.type === de.IncrementalSnapshot && Ee.data.source === le.Mutation) && tr.forEach(($e) => $e.unfreeze()), K)
      t == null || t(be(Ee), ue);
    else if (ee) {
      const $e = {
        type: "rrweb",
        event: be(Ee),
        origin: window.location.origin,
        isCheckout: ue
      };
      window.parent.postMessage($e, "*");
    }
    if (Ee.type === de.FullSnapshot)
      ae = Ee, J = 0;
    else if (Ee.type === de.IncrementalSnapshot) {
      if (Ee.data.source === le.Mutation && Ee.data.isAttachIframe)
        return;
      J++;
      const $e = n && J >= n, ye = r && Ee.timestamp - ae.timestamp > r;
      ($e || ye) && Sn(!0);
    }
  };
  const D = (H) => {
    Oe({
      type: de.IncrementalSnapshot,
      data: {
        source: le.Mutation,
        ...H
      }
    });
  }, et = (H) => Oe({
    type: de.IncrementalSnapshot,
    data: {
      source: le.Scroll,
      ...H
    }
  }), Be = (H) => Oe({
    type: de.IncrementalSnapshot,
    data: {
      source: le.CanvasMutation,
      ...H
    }
  }), gt = (H) => Oe({
    type: de.IncrementalSnapshot,
    data: {
      source: le.AdoptedStyleSheet,
      ...H
    }
  }), Ce = new Ug({
    mutationCb: D,
    adoptedStyleSheetCb: gt
  }), Pe = new Lg({
    mirror: ct,
    mutationCb: D,
    stylesheetManager: Ce,
    recordCrossOriginIframes: M,
    wrappedEmit: Oe
  });
  for (const H of V || [])
    H.getMirror && H.getMirror({
      nodeMirror: ct,
      crossOriginIframeMirror: Pe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Pe.crossOriginIframeStyleMirror
    });
  const At = new Bg();
  vs = new Fg({
    recordCanvas: w,
    mutationCb: Be,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: ct,
    sampling: y.canvas,
    dataURLOptions: v
  });
  const yt = new Ig({
    mutationCb: D,
    scrollCb: et,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: Te,
      dataURLOptions: v,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: w,
      inlineImages: Q,
      sampling: y,
      slimDOMOptions: Me,
      iframeManager: Pe,
      stylesheetManager: Ce,
      canvasManager: vs,
      keepIframeSrcFn: L,
      processedNodeManager: At
    },
    mirror: ct
  });
  Sn = (H = !1) => {
    if (!k)
      return;
    Oe(
      {
        type: de.Meta,
        data: {
          href: window.location.href,
          width: Bc(),
          height: Uc()
        }
      },
      H
    ), Ce.reset(), yt.init(), tr.forEach((ge) => ge.lock());
    const ue = bm(document, {
      mirror: ct,
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: Te,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Me,
      dataURLOptions: v,
      recordCanvas: w,
      inlineImages: Q,
      onSerialize: (ge) => {
        jc(ge, ct) && Pe.addIframe(ge), Hc(ge, ct) && Ce.trackLinkElement(ge), Es(ge) && yt.addShadowRoot(oe.shadowRoot(ge), document);
      },
      onIframeLoad: (ge, Ee) => {
        Pe.attachIframe(ge, Ee), yt.observeAttachShadow(ge);
      },
      onStylesheetLoad: (ge, Ee) => {
        Ce.attachLinkElement(ge, Ee);
      },
      keepIframeSrcFn: L
    });
    if (!ue)
      return console.warn("Failed to snapshot the document");
    Oe(
      {
        type: de.FullSnapshot,
        data: {
          node: ue,
          initialOffset: Fc(window)
        }
      },
      H
    ), tr.forEach((ge) => ge.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Ce.adoptStyleSheets(
      document.adoptedStyleSheets,
      ct.getId(document)
    );
  };
  try {
    const H = [], ue = (Ee) => {
      var $e;
      return ce(Tg)(
        {
          mutationCb: D,
          mousemoveCb: (ye, lr) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: lr,
              positions: ye
            }
          }),
          mouseInteractionCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.MouseInteraction,
              ...ye
            }
          }),
          scrollCb: et,
          viewportResizeCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.ViewportResize,
              ...ye
            }
          }),
          inputCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.Input,
              ...ye
            }
          }),
          mediaInteractionCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.MediaInteraction,
              ...ye
            }
          }),
          styleSheetRuleCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.StyleSheetRule,
              ...ye
            }
          }),
          styleDeclarationCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.StyleDeclaration,
              ...ye
            }
          }),
          canvasMutationCb: Be,
          fontCb: (ye) => Oe({
            type: de.IncrementalSnapshot,
            data: {
              source: le.Font,
              ...ye
            }
          }),
          selectionCb: (ye) => {
            Oe({
              type: de.IncrementalSnapshot,
              data: {
                source: le.Selection,
                ...ye
              }
            });
          },
          customElementCb: (ye) => {
            Oe({
              type: de.IncrementalSnapshot,
              data: {
                source: le.CustomElement,
                ...ye
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: p,
          maskInputOptions: Te,
          inlineStylesheet: s,
          sampling: y,
          recordDOM: k,
          recordCanvas: w,
          inlineImages: Q,
          userTriggeredOnInput: $,
          collectFonts: _,
          doc: Ee,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: L,
          blockSelector: o,
          slimDOMOptions: Me,
          dataURLOptions: v,
          mirror: ct,
          iframeManager: Pe,
          stylesheetManager: Ce,
          shadowDomManager: yt,
          processedNodeManager: At,
          canvasManager: vs,
          ignoreCSSAttributes: Le,
          plugins: (($e = V == null ? void 0 : V.filter((ye) => ye.observer)) == null ? void 0 : $e.map((ye) => ({
            observer: ye.observer,
            options: ye.options,
            callback: (lr) => Oe({
              type: de.Plugin,
              data: {
                plugin: ye.name,
                payload: lr
              }
            })
          }))) || []
        },
        g
      );
    };
    Pe.addLoadListener((Ee) => {
      try {
        H.push(ue(Ee.contentDocument));
      } catch ($e) {
        console.warn($e);
      }
    });
    const ge = () => {
      Sn(), H.push(ue(document)), On = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ge() : (H.push(
      Ge("DOMContentLoaded", () => {
        Oe({
          type: de.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && ge();
      })
    ), H.push(
      Ge(
        "load",
        () => {
          Oe({
            type: de.Load,
            data: {}
          }), I === "load" && ge();
        },
        window
      )
    )), () => {
      H.forEach((Ee) => {
        try {
          Ee();
        } catch ($e) {
          String($e).toLowerCase().includes("cross-origin") || console.warn($e);
        }
      }), At.destroy(), On = !1, gg();
    };
  } catch (H) {
    console.warn(H);
  }
}
qt.addCustomEvent = (e, t) => {
  if (!On)
    throw new Error("please add custom event after start recording");
  Oe({
    type: de.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
qt.freezePage = () => {
  tr.forEach((e) => e.freeze());
};
qt.takeFullSnapshot = (e) => {
  if (!On)
    throw new Error("please take full snapshot after start recording");
  Sn(e);
};
qt.mirror = ct;
var Cl;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Cl || (Cl = {}));
const { addCustomEvent: Ly } = qt, { freezePage: Iy } = qt, { takeFullSnapshot: Oy } = qt, ks = 2, qg = 4;
class Wg {
  constructor(t) {
    on(this, "events", []);
    on(this, "lastMeta", null);
    on(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === qg && (this.lastMeta = t), t.type === ks && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
  }
  prune() {
    if (!this.events.length) return;
    const r = this.events[this.events.length - 1].timestamp - this.opts.windowMs;
    let n = 0;
    for (; n < this.events.length && this.events[n].timestamp < r; ) n++;
    n > 0 && (this.events = this.events.slice(n)), this.events.length > this.opts.maxEvents && (this.events = this.events.slice(this.events.length - this.opts.maxEvents));
  }
  /** A playable, head-anchored copy: [meta?, fullSnapshot, ...trailing incrementals]. */
  snapshot() {
    const t = [];
    return !this.events.some((n) => n.type === ks) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === ks) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function jg(e, t = {}) {
  const r = new Wg({
    windowMs: t.windowMs ?? 6e4,
    maxEvents: t.maxEvents ?? 2e3
  }), n = t.maskAllInputs !== !1, i = t.maskText !== !1;
  let o;
  try {
    o = e({
      emit(a) {
        try {
          r.push(a);
        } catch {
        }
      },
      maskAllInputs: n,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: i ? (a) => "*".repeat(a.length) : void 0,
      // Don't record <script>/<noscript> contents and obvious secrets.
      blockClass: "klavity-no-record",
      ignoreClass: "klavity-no-record",
      recordCanvas: !1,
      collectFonts: !1
    });
  } catch {
  }
  return {
    getEvents: () => r.isPlayable() ? r.snapshot() : [],
    hasRecording: () => r.isPlayable(),
    stop: () => {
      try {
        o == null || o();
      } catch {
      }
      r.clear();
    }
  };
}
const nu = "klav-sims-live", iu = "klav-sims-overlay", El = "klav-sims-ext-css";
let dt = null, er = null, nt = null, Sr = null;
const _n = /* @__PURE__ */ new Map(), st = /* @__PURE__ */ new Map();
let su = 0, Rt = !1, rr = null, Rr = null, en = !1, Ye = null, Fr = null, Ft = null, Ut = null, pt = null, nr = null, ut = null, Et = null, ht = null, Cr = null;
const Nn = /* @__PURE__ */ new Set();
function Hg(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function ou(e, t) {
  return `${e}::${Hg(t.text)}`;
}
function au(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Vg = `
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
`, Yg = `
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
function Ml(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${a},${t})`;
}
function Gg(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Rs() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Kg(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Ar(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const lu = { HIGH: "h", MED: "m", LOW: "l" }, Rl = { HIGH: 0, MED: 1, LOW: 2 };
function Xg(e) {
  if (!e) return !1;
  if (e === nt || e === dt || e.id === iu || e.id === nu || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Jg(e) {
  const t = [];
  for (const r of [nt, dt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function cu(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function uu(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Al(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Zg(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function Qg(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function du(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Xg(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function ey(e, t) {
  return Jg(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && du(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of o) i(a);
    return n;
  });
}
function ty(e, t) {
  const r = cu(t), n = uu(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = ey(i, o);
  if (!a.length) return null;
  const c = Math.max(1, Al(n));
  let l = null, p = -1 / 0;
  for (const s of a) {
    const h = Qg(s.getBoundingClientRect()), d = Zg(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Al(h)), m = d / c, f = Math.max(0, (u - d) / u), g = s.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, y = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, v = m - f * 0.35 + x - y;
    v > p && (l = s, p = v);
  }
  return l ?? a[0] ?? null;
}
async function ry(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: Rs() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Kg(Rs() ? 80 : 520);
}
const ny = /* @__PURE__ */ new Set([
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
function iy(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || ny.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function sy(e) {
  const t = iy(e.text);
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
  const o = Array.from(document.querySelectorAll(r)).slice(0, 700);
  for (const a of o) {
    if (!du(a)) continue;
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
    const p = t.reduce((f, g) => f + (l.includes(g) ? 1 : 0), 0);
    if (!p) continue;
    const s = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(s) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - u;
    m > i && (n = a, i = m);
  }
  return n;
}
async function oy(e, t = {}) {
  if (e.region) {
    const r = cu(e), n = uu(e.region, r);
    t.scroll !== !1 && await ry(n.left + n.width / 2, n.top + n.height / 2);
    const i = ty(e.region, e);
    if (i) return i;
  }
  return sy(e);
}
function ay() {
  if (dt && er) return er;
  dt = document.createElement("div"), dt.id = nu, dt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", er = dt.attachShadow({ mode: "open" }), gf(er);
  const e = document.createElement("style");
  return e.textContent = Vg, er.appendChild(e), document.body.appendChild(dt), er;
}
function pu() {
  if (nt) return nt;
  if (!document.getElementById(El)) {
    const e = document.createElement("style");
    e.id = El, e.textContent = Yg, document.head.appendChild(e);
  }
  return nt = document.createElement("div"), nt.id = iu, nt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(nt), nt;
}
function hu(e, t) {
  return ff({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function ly(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Ts();
  const n = ay();
  pu(), Sr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Ts();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const d = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    _n.set(h.id, { simId: h.id, accent: d, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), ht = document.createElement("div"), ht.className = "ksl-sr", ht.id = "ksl-announcer", ht.setAttribute("aria-live", "polite"), ht.setAttribute("aria-atomic", "true"), o.appendChild(ht), Ye = document.createElement("button"), Ye.type = "button", Ye.className = "ksl-launcher", Ye.setAttribute("aria-label", "Open Sims feedback panel"), Ye.addEventListener("click", () => cy());
  const a = document.createElement("span");
  a.className = "ksl-pill", Fr = document.createElement("span"), Fr.className = "ksl-pill-avatars", Ft = document.createElement("span"), Ft.className = "ksl-pill-txt", a.append(Fr, Ft), Ut = document.createElement("span"), Ut.className = "ksl-pill-badge", Ut.hidden = !0, Ye.append(a, Ut), o.appendChild(Ye), i.slice(0, 3).forEach((h) => {
    const d = _n.get(h.id);
    d && Fr.appendChild(hu(d, 26));
  }), pt = document.createElement("section"), pt.className = "ksl-panel", pt.setAttribute("aria-label", "Sims feedback"), pt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = X("x", { size: 15 }), s.addEventListener("click", () => Tl()), l.append(p, s), nr = document.createElement("div"), nr.className = "ksl-count", ut = document.createElement("div"), ut.className = "ksl-chips", c.append(l, nr, ut), Et = document.createElement("div"), Et.className = "ksl-list", Et.setAttribute("role", "list"), pt.append(c, Et), o.appendChild(pt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && Rt && Tl();
  }, { signal: Sr.signal }), au(!0), _r();
}
function fu(e) {
  en = e, Ye == null || Ye.classList.toggle("is-reviewing", e), _r(), Rt && Or();
}
function cy() {
  !pt || !Ye || (Rt = !0, pt.classList.add("is-open"), Ye.hidden = !0, Or());
}
function Tl() {
  !pt || !Ye || (Rt = !1, pt.classList.remove("is-open"), Ye.hidden = !1, _r());
}
function mu() {
  const e = Array.from(st.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Ar(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function _r() {
  const e = mu();
  Ft && (en && e.total === 0 ? Ft.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Ft.innerHTML = "Sims are watching this page" : Ft.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Ut && (Ut.hidden = e.high === 0, Ut.textContent = `${e.high} high`), Rt && gu(e);
}
function gu(e) {
  nr && (e.total === 0 ? nr.innerHTML = en ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : nr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), uy();
}
function uy() {
  if (!ut) return;
  const e = Array.from(st.values());
  if (ut.hidden = e.length === 0, ut.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", ut.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (rr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(rr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${o}`)), a.addEventListener("click", () => {
      rr = rr === i.simId ? null : i.simId, Or();
    }), ut.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", ut.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((l) => Ar(l.obs) === i).length;
    if (!o) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Rr === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${lu[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${o}`, a.addEventListener("click", () => {
      Rr = Rr === i ? null : i, Or();
    }), ut.appendChild(a);
  });
}
function dy() {
  return Array.from(st.values()).filter((e) => !rr || e.entry.simId === rr).filter((e) => !Rr || Ar(e.obs) === Rr).sort((e, t) => {
    const r = Ar(e.obs), n = Ar(t.obs), i = r ? Rl[r] : 3, o = n ? Rl[n] : 3;
    return i - o;
  });
}
function py(e) {
  const { entry: t, obs: r } = e, n = Ar(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(hu(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, o.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${lu[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
  }
  i.appendChild(o);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-expand", p.textContent = "Show more", p.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    p.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(p);
  const s = document.createElement("div");
  s.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = X("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Cn.onTriage) == null || m.call(Cn, r, t.name), Ll(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = X("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    fy(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Ll(e.id);
  }), s.append(h, d, u), i.appendChild(s), i;
}
function hy(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Or() {
  if (!Et || !Rt) {
    _r();
    return;
  }
  const e = mu();
  gu(e);
  const t = dy();
  if (Et.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = st.size > 0;
    if (en && !i) {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "Your Sims are reviewing this page…";
      const a = document.createElement("div");
      a.textContent = "Findings will appear here as they spot things.";
      const c = document.createElement("div");
      c.className = "ksl-shimmer", n.append(o, a, c);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "No findings yet";
      const a = document.createElement("div");
      a.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(o, a);
    }
    Et.appendChild(n), st.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = py(n);
    n.rowEl = i, Et.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  st.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), hy(Et);
}
function As() {
  Cr == null || Cr(), Cr = null;
}
async function fy(e) {
  const t = st.get(e);
  if (!t) return;
  const r = await oy(t.obs, { scroll: !0 });
  !r || !nt || my(r, t.entry.accent);
}
function my(e, t) {
  As();
  const r = pu(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Ml(t, 0.16)},0 0 24px ${Ml(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, a = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Cr === l && As();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), _e(n);
  };
  Cr = l;
}
function gy(e, t) {
  const r = `f_${e.simId}_${++su}`;
  st.set(r, { id: r, entry: e, obs: t, rowEl: null }), Rt ? Or() : _r(), ht && (ht.textContent = "", requestAnimationFrame(() => {
    ht && (ht.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function yy(e) {
  const t = st.get(e);
  if (!t) return;
  const r = () => {
    st.delete(e), Rt ? Or() : _r();
  };
  t.rowEl && Rt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Rs() ? 0 : 300)) : r();
}
function Ll(e) {
  const t = st.get(e);
  t && (Nn.add(ou(t.entry.simId, t.obs)), yy(e));
}
function by(e, t, r) {
  if (!dt) return;
  const n = _n.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    fu(!1);
    for (const i of r) {
      if (!Gg(i)) continue;
      const o = ou(e, i);
      Nn.has(o) || (Nn.add(o), gy(n, i));
    }
  }
}
function Ts() {
  As(), st.clear(), su = 0, _n.clear(), Nn.clear(), Rt = !1, rr = null, Rr = null, en = !1, Sr == null || Sr.abort(), Sr = null, Ye = null, Fr = null, Ft = null, Ut = null, pt = null, nr = null, ut = null, Et = null, ht = null, _e(nt), nt = null, _e(dt), dt = null, er = null, au(!1);
}
const Cn = {
  deploy: ly,
  setReviewing: fu,
  renderFeedback: by,
  undeploy: Ts,
  onTriage: null
};
function vy() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Cn);
}
typeof window < "u" && vy();
const Il = "klav-ao-css", ky = "klav-ao-overlay";
function wy(e, t, r, n, i, o = 10) {
  const l = !(e.y - r - 14 >= o), p = l ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: l };
}
const xy = `
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
let Qt = null, Sy = 1;
const Pn = /* @__PURE__ */ new Map();
function Ol(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${a},${t})`;
}
function Cy() {
  if (Qt) return Qt;
  if (!document.getElementById(Il)) {
    const e = document.createElement("style");
    e.id = Il, e.textContent = xy, document.head.appendChild(e);
  }
  return Qt = document.createElement("div"), Qt.id = ky, Qt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Qt), Qt;
}
function _y(e, t, r = {}) {
  const n = Cy(), i = r.color ?? "#6366f1", o = `klav-ao-${Sy++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Ol(i, 0.14)},0 0 24px ${Ol(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: d, top: u, below: m } = wy(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = o, l.style.borderLeftColor = i, l.style.left = d + "px", l.style.top = u + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = i, g.textContent = t, f.appendChild(g);
    const x = r.priority ?? r.severity;
    if (x) {
      const v = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", S = document.createElement("span");
      S.className = `klav-ao-sev${v}`, S.textContent = x, f.appendChild(S);
    }
    const y = document.createElement("button");
    y.className = "klav-ao-dismiss", y.textContent = "Dismiss", y.addEventListener("click", () => yu(o)), l.appendChild(f), l.appendChild(y), n.appendChild(l);
  }
  return Pn.set(o, { halo: c, pin: l }), o;
}
function yu(e) {
  const t = Pn.get(e);
  if (!t) return;
  Pn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    _e(n), _e(r);
  }, 240)) : _e(r);
}
function Ny() {
  for (const e of [...Pn.keys()]) yu(e);
}
let bu = yr;
const vu = { consoleErrors: [], networkFailures: [] };
let ku, wu, Tr = null;
function xu(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function _l() {
  return eh(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Ey() {
  return ph(vu, { identity: ku, metadata: wu });
}
async function My(e) {
  return oh(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    bu,
    { jira: bf, linear: vf, github: kf, plane: wf, backend: Sf }
  );
}
function Zs(e = "bug") {
  const t = af(e, {
    onCaptureFull: _l,
    onSubmit: async (r) => My({
      type: r.type,
      description: r.description,
      context: Ey(),
      screenshots: r.screenshots,
      replayEvents: (Tr == null ? void 0 : Tr.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await _l();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Ry() {
  hh(vu, { consoleLevels: !0 });
}
function Su(e) {
  ku = e ? xu(e) : void 0;
}
function Cu(e) {
  wu = e ? xu(e) : void 0;
}
function Ay() {
  document.addEventListener("contextmenu", (e) => {
    if (Gh(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${X("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${X("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (_e(t), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      _e(t), document.removeEventListener("click", r), i && Zs(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function Eu(e = {}) {
  if (bu = {
    ...yr,
    ...e,
    jira: { ...yr.jira, ...e.jira },
    linear: { ...yr.linear, ...e.linear },
    github: { ...yr.github, ...e.github },
    plane: { ...yr.plane, ...e.plane }
  }, Ry(), Ay(), !Tr)
    try {
      Tr = jg(qt);
    } catch {
      Tr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Eu, openModal: Zs, identify: Su, setMetadata: Cu });
const Py = { init: Eu, openModal: Zs, identify: Su, setMetadata: Cu };
export {
  Cn as KlavitySims,
  Cn as SimsLive,
  yu as clearAnnotation,
  Ny as clearAnnotations,
  Py as default,
  Su as identify,
  Eu as init,
  vy as installKlavitySims,
  Zs as openModal,
  Cu as setMetadata,
  _y as showAnnotation
};
