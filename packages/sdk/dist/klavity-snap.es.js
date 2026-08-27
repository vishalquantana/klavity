var pd = Object.defineProperty;
var hd = (e, t, r) => t in e ? pd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var gn = (e, t, r) => hd(e, typeof t != "symbol" ? t + "" : t, r);
function fd(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Jl = 112, Zl = 72, Ql = 89, ec = 115;
let wi;
function md() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function gd(e) {
  let t = -1;
  wi || (wi = md());
  for (let r = 0; r < e.length; r++)
    t = wi[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function yd(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Jl && e[r - 2] === Zl && e[r - 1] === Ql && e[r] === ec)
      return r - 3;
  return 0;
}
function bd(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Jl, n[1] = Zl, n[2] = Ql, n[3] = ec, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = gd(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = yd(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const vd = "AAlwSFlz", kd = "AAAJcEhZ", wd = "AAAACXBI";
function xd(e) {
  let t = e.indexOf(vd);
  return t === -1 && (t = e.indexOf(kd)), t === -1 && (t = e.indexOf(wd)), t;
}
const tc = "[modern-screenshot]", Kt = typeof window < "u", Sd = Kt && "Worker" in window, Cd = Kt && "atob" in window, Ed = Kt && "btoa" in window;
var Kl;
const Vs = Kt ? (Kl = window.navigator) == null ? void 0 : Kl.userAgent : "", rc = Vs.includes("Chrome"), zn = Vs.includes("AppleWebKit") && !rc, Ys = Vs.includes("Firefox"), Md = (e) => e && "__CONTEXT__" in e, Rd = (e) => e.constructor.name === "CSSFontFaceRule", Ad = (e) => e.constructor.name === "CSSImportRule", Td = (e) => e.constructor.name === "CSSLayerBlockRule", Nt = (e) => e.nodeType === 1, sn = (e) => typeof e.className == "object", nc = (e) => e.tagName === "image", _d = (e) => e.tagName === "use", Zr = (e) => Nt(e) && typeof e.style < "u" && !sn(e), Id = (e) => e.nodeType === 8, Ld = (e) => e.nodeType === 3, Dr = (e) => e.tagName === "IMG", Xn = (e) => e.tagName === "VIDEO", Od = (e) => e.tagName === "CANVAS", Nd = (e) => e.tagName === "TEXTAREA", Pd = (e) => e.tagName === "INPUT", Dd = (e) => e.tagName === "STYLE", zd = (e) => e.tagName === "SCRIPT", $d = (e) => e.tagName === "SELECT", Fd = (e) => e.tagName === "SLOT", Ud = (e) => e.tagName === "IFRAME", Bd = (...e) => console.warn(tc, ...e);
function qd(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ds = (e) => e.startsWith("data:");
function ic(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Kt && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Kt)
    return e;
  const r = Kn().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Kn(e) {
  return (e && Nt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Jn = "http://www.w3.org/2000/svg";
function Wd(e, t, r) {
  const n = Kn(r).createElementNS(Jn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function jd(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Hd(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Vd = (e) => Hd(e, "dataUrl");
function Lr(e, t) {
  const r = Kn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Qr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? Lr(e, Kn(i)) : e;
    let l = null, d = null;
    function o() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(o, n)), Xn(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Qr(c.poster, t).then(r) : o();
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
      const h = nc(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const p = async () => {
        if (Dr(c) && "decode" in c)
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
      if (Dr(c) && c.complete)
        return p();
      d = () => {
        c.removeEventListener("load", p), c.removeEventListener("error", u);
      }, c.addEventListener("load", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function Yd(e, t) {
  Zr(e) && (Dr(e) || Xn(e) ? await Qr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Qr(n, t)))
  ));
}
const sc = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function oc(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Yo = 0;
function Gd(e) {
  const t = `${tc}[#${Yo}]`;
  return Yo++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Bd(...r)
  };
}
function Xd(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Zn(e, t) {
  return Md(e) ? e : Kd(e, { ...t, autoDestruct: !0 });
}
async function Kd(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Kt ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Kt ? window : void 0), d = /* @__PURE__ */ new Map(), o = {
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
      requestInit: Xd((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Gd(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: ac(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Jn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Sd && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var b, S, w, k;
          const { url: x, result: y } = g.data;
          y ? (S = (b = d.get(x)) == null ? void 0 : b.resolve) == null || S.call(b, y) : (k = (w = d.get(x)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${x}`));
        }, f.onmessageerror = (g) => {
          var y, b;
          const { url: x } = g.data;
          (b = (y = d.get(x)) == null ? void 0 : y.reject) == null || b.call(y, new Error(`Error receiving message from worker: ${x}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      qd(c) && "image/webp",
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
  o.log.time("wait until load"), await Yd(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: p } = Jd(e, o);
  return o.width = h, o.height = p, o;
}
function ac(e) {
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
function Jd(e, t) {
  let { width: r, height: n } = t;
  if (Nt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Zd(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await Qr(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Qd(e.ownerDocument, t), d = () => {
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
function Qd(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function lc(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Lr(s, e.ownerDocument);
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
function ep(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Gs(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function tp(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function rp(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Lr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Qr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Lr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Lr(e.poster, e.ownerDocument) : r;
    }
    return lc(s, t);
  }
  return r;
}
function np(e, t) {
  return Od(e) ? lc(e, t) : Ud(e) ? ep(e, t) : Dr(e) ? tp(e) : Xn(e) ? rp(e, t) : e.cloneNode(!1);
}
function ip(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${sc()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const sp = [
  "width",
  "height",
  "-webkit-text-fill-color"
], op = [
  "stroke",
  "fill"
];
function cc(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = sn(e) && i !== "svg", a = s ? op.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = ip(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const o = d == null ? void 0 : d.document;
  let h, p;
  s ? (h = o.createElementNS(Jn, "svg"), p = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, g]) => {
    p.setAttributeNS(null, f, g);
  }), h.appendChild(p)) : h = p = o.createElement(i), p.textContent = " ", o.body.appendChild(h);
  const u = d.getComputedStyle(p, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    sp.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function uc(e, t, r) {
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
function ap(e, t, r, n) {
  var h, p, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), d = cc(e, null, n);
  a == null || a.forEach((f, g) => {
    d.delete(g);
  });
  const o = uc(l, d, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), rc && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((p = o.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return o.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), o;
}
function lp(e, t) {
  (Nd(e) || Pd(e) || $d(e)) && t.setAttribute("value", e.value);
}
const cp = [
  "::before",
  "::after"
  // '::placeholder', TODO
], up = [
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
function dp(e, t, r, n, i) {
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
    const u = [sc()], m = cc(e, o, n);
    l == null || l.forEach((S, w) => {
      m.delete(w);
    });
    const f = uc(h, m, n.includeStyleProperties);
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
    let y = c.get(x);
    y || (y = [], c.set(x, y)), y.push(`.${u[0]}${o}`);
  }
  cp.forEach(d), r && up.forEach(d);
}
const Go = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Xo(e, t, r, n, i) {
  if (Nt(r) && (Dd(r) || zd(r)) || n.filter && !n.filter(r))
    return;
  Go.has(t.nodeName) || Go.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await Gs(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && pp(e, s), t.appendChild(s);
}
async function Ko(e, t, r, n) {
  var s;
  let i = e.firstChild;
  Nt(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!Id(a))
      if (Nt(a) && Fd(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await Xo(e, t, c[l], r, n);
      } else
        await Xo(e, t, a, r, n);
}
function pp(e, t) {
  if (!Zr(e) || !Zr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = d, t.style.transform = s.toString();
}
function hp(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const fp = /^[\w-:]+$/;
async function Gs(e, t, r = !1, n) {
  var d, o, h, p;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && Ld(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && Nt(e) && (Zr(e) || sn(e))) {
    const u = await np(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let S = b.length, w = 0; w < S; w++) {
        const k = b[w];
        fp.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = ap(e, u, r, t);
    r && hp(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (d = m.get("overflow-x")) == null ? void 0 : d[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = oc((p = m.get("font-family")) == null ? void 0 : p[0]), y = x ? (b) => {
      g === "uppercase" ? b = b.toUpperCase() : g === "lowercase" ? b = b.toLowerCase() : g === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), x.forEach((S) => {
        let w = a.get(S);
        w || a.set(S, w = /* @__PURE__ */ new Set()), b.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return dp(
      e,
      u,
      f,
      t,
      y
    ), lp(e, u), Xn(e) || await Ko(
      e,
      u,
      t,
      y
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Ko(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function mp(e) {
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
function gp(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Vd);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function en(e, t) {
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
  n === "image" && (zn || Ys) && e.drawImageCount++;
  let x = d.get(r);
  if (!x) {
    p && p instanceof RegExp && p.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const y = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    y && n.split(";")[1].split(",").forEach((C) => {
      g.has(C) && g.get(C).forEach((I) => b.add(I));
    });
    const S = y && b.size, w = {
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
      return !zn && r.startsWith("http") && f.length ? new Promise((k, C) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...w }), x.resolve = k, x.reject = C;
      }) : gp(w);
    })().catch((k) => {
      if (d.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw k;
    }), d.set(r, x);
  }
  return x.response;
}
async function dc(e, t, r, n) {
  if (!pc(e))
    return e;
  for (const [i, s] of yp(e, t))
    try {
      const a = await en(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(bp(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function pc(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const hc = /url\((['"]?)([^'"]+?)\1\)/g;
function yp(e, t) {
  const r = [];
  return e.replace(hc, (n, i, s) => (r.push([s, ic(s, t)]), n)), r.filter(([n]) => !Ds(n));
}
function bp(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const vp = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function kp(e, t) {
  return vp.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((zn || Ys) && t.drawImageCount++, dc(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function wp(e, t) {
  if (Dr(e)) {
    const r = e.currentSrc || e.src;
    if (!Ds(r))
      return [
        en(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (zn || Ys) && t.drawImageCount++;
  } else if (sn(e) && !Ds(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      en(t, {
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
function xp(e, t) {
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
        en(t, {
          url: s,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function fc(e, t) {
  const { tasks: r } = t;
  Nt(e) && ((Dr(e) || nc(e)) && r.push(...wp(e, t)), _d(e) && r.push(...xp(e, t))), Zr(e) && r.push(...kp(e.style, t)), e.childNodes.forEach((n) => {
    fc(n, t);
  });
}
async function Sp(e, t) {
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
      const l = Zo(c.cssText, t);
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
          if (Ad(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await en(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (y) {
              t.log.warn(`Error fetch remote css import from ${f}`, y);
            }
            const x = g.replace(
              hc,
              (y, b, S) => y.replace(S, ic(S, f))
            );
            for (const y of Ep(x))
              try {
                h.insertRule(y, h.cssRules.length);
              } catch (b) {
                t.log.warn("Error inserting rule from remote css import", { rule: y, error: b });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const p = [];
      l.forEach((u) => {
        zs(u.cssRules, p);
      }), p.filter((u) => {
        var m;
        return Rd(u) && pc(u.style.getPropertyValue("src")) && ((m = oc(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          dc(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = Zo(g, t), s.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const Cp = /(\/\*[\s\S]*?\*\/)/g, Jo = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Ep(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Cp, "");
  for (; ; ) {
    const s = Jo.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Jo, "");
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
const Mp = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Rp = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Zo(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Rp, (i) => {
    for (; ; ) {
      const [s, , a] = Mp.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function zs(e, t = []) {
  for (const r of Array.from(e))
    Td(r) ? t.push(...zs(r.cssRules)) : "cssRules" in r ? zs(r.cssRules, t) : t.push(r);
  return t;
}
const Ap = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Tp(e) {
  return Ap.test(e.innerHTML);
}
async function _p(e, t) {
  const r = await Zn(e, t);
  if (Nt(r.node) && sn(r.node) && !Tp(r.node))
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
  const f = await Gs(r.node, r, !0);
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
  i.timeEnd("clone node"), await (p == null ? void 0 : p(f)), d !== !1 && Nt(f) && (i.time("embed web font"), await Sp(f, r), i.timeEnd("embed web font")), i.time("embed node"), fc(f, r);
  const g = s.length;
  let x = 0;
  const y = async () => {
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
  o == null || o(x, g), await Promise.all([...Array.from({ length: 4 })].map(y)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = Ip(f, r);
  return c && b.insertBefore(c, b.children[0]), a && b.insertBefore(a, b.children[0]), h && mp(r), await (m == null ? void 0 : m(b)), b;
}
function Ip(e, t) {
  const { width: r, height: n } = t, i = Wd(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function Lp(e, t) {
  var a;
  const r = await Zn(e, t), n = await _p(r), i = jd(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = ac(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(Jn, "defs"), r.svgStyles.clear());
  const s = Lr(i, n.ownerDocument);
  return await Zd(s, r);
}
async function Op(e, t) {
  const r = await Zn(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await Lp(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && Cd && Ed) {
    const [d, o] = l.split(",");
    let h = 0, p = !1;
    if (s === "image/png") {
      const b = xd(o);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, p = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let b = 0; b < g.length; b++)
      g[b] = f.charCodeAt(b);
    const x = s === "image/png" ? bd(g, a, p) : fd(g, a), y = window.btoa(String.fromCharCode(...x));
    l = [d, ",", y, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Np(e, t) {
  return Op(
    await Zn(e, { ...t, type: "image/png" })
  );
}
const Pp = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Dp = 8e3, zp = 16384, Qo = 4096, $p = 16e6, Fp = 500, Up = 1e4, xi = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", mc = 600, Bp = 1200, qp = 24, Wp = 1024, ft = 32, jp = 4, gc = 400, Hp = 0.985, Vp = 250;
function yc(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Yp(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return yc(r, location.origin);
}
function Gp(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && yc(t.src || "", location.origin)) return !0;
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
function Si(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function ea(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Xp(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Qo / i, Qo / s), l = Math.min(a, c, Math.sqrt($p / (i * s))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(s * l));
    const o = d.getContext("2d");
    if (!o) return { dataUrl: xi, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + Fp;
    let p = 0;
    const u = () => p >= Up || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (p++, !x && t && !t(g))) return;
      const y = getComputedStyle(g);
      if (y.display === "none" || y.visibility === "hidden" || Number(y.opacity) === 0) return;
      const b = g.getBoundingClientRect(), S = b.left - n.left, w = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        ea(y.backgroundColor) || (o.fillStyle = y.backgroundColor, o.fillRect(S, w, b.width, b.height));
        const C = parseFloat(y.borderTopWidth);
        C > 0 && y.borderTopStyle !== "none" && !ea(y.borderTopColor) && (o.strokeStyle = y.borderTopColor, o.lineWidth = C, o.strokeRect(S, w, b.width, b.height)), g.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(S, w, b.width, b.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(S, w, b.width, b.height));
      }
      for (const C of Array.from(g.childNodes)) {
        if (u()) break;
        if (C instanceof HTMLElement) {
          m(C);
          continue;
        }
        if (!(C.nodeType !== Node.TEXT_NODE || !((k = C.textContent) != null && k.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(C);
            const P = I.getBoundingClientRect();
            if (P.width <= 0 || P.height <= 0) continue;
            o.save(), o.beginPath(), o.rect(P.left - n.left, P.top - n.top, P.width, P.height), o.clip(), o.fillStyle = y.color, o.font = `${y.fontStyle} ${y.fontWeight} ${y.fontSize} ${y.fontFamily}`, o.textBaseline = "top", o.fillText(C.textContent.trim(), P.left - n.left, P.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: xi, scale: 1 };
  } catch {
    return { dataUrl: xi, scale: 1 };
  }
}
function Kp() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Ci(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Jp(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < qp; s++) {
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
async function ta(e, t = mc) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Ci(i.ready, n());
    const s = Jp(e);
    s.length && await Ci(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Ci(Kp(), Math.min(n(), 50));
  } catch {
  }
}
function bc(e, t) {
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
async function Zp(e) {
  if (typeof document > "u") return null;
  const t = await bc(e, gc);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = ft, r.height = ft;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, ft, ft);
    const { data: i } = n.getImageData(0, 0, ft, ft);
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
async function Ei(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Wp) return !0;
  try {
    const i = await Zp(e);
    if (i !== null && i <= jp) return !0;
  } catch {
  }
  return !1;
}
async function Qp(e) {
  if (typeof document > "u") return null;
  const t = await bc(e, gc);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = ft, r.height = ft;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, ft, ft);
    const { data: i } = n.getImageData(0, 0, ft, ft);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * o + 0.114 * h >= Vp && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function eh(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Qp(e);
    if (r !== null && r >= Hp) return !0;
  } catch {
  }
  return !1;
}
const th = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], rh = /* @__PURE__ */ new Set([
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
function nh(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function ih(e) {
  const t = (e || "").toLowerCase();
  return th.some((r) => t.includes(r));
}
const sh = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function oh(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : sh.test(t);
}
function ah(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = nh(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(ih(r) || n && !rh.has(n) && t.includes("_") && oh(t));
}
function lh(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    ah({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const On = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, ch = 3e3, uh = 4e3, ra = 24, na = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function dh(e, t = uh) {
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
function ph(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < ra; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < ra; l++) {
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
function hh(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function fh(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${hh(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function mh(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? ph(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => dh(c)), a = [];
  for (const c of n) {
    const l = [];
    na.lastIndex = 0;
    let d;
    for (; (d = na.exec(c.src)) !== null; ) {
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
      m && (o = fh(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function gh() {
  try {
    return await Promise.race([
      mh({}).catch(() => On),
      new Promise((e) => setTimeout(() => e(On), ch))
    ]);
  } catch {
    return On;
  }
}
function yh(e, t) {
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
async function bh(e, t = {}) {
  return (await vh(e, t)).dataUrl;
}
async function vh(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? On : await gh(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await yh(Np(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (p) => lh(p, c.embeddedFamilies),
      maximumCanvasSize: zp,
      fetch: { placeholderImage: Pp },
      filter: (p) => n && !n(p) || Gp(p) ? !1 : Yp(p) ? (r++, !1) : !0
    }), Dp);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await ta(e, mc);
  try {
    let o = await d(), h = await Ei(o);
    if (h) {
      await ta(e, Bp);
      try {
        const u = await d();
        await Ei(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && Si(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Si("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = h ? !1 : await eh(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: p, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    Si(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const p = Xp(e, n, a), u = await Ei(p.dataUrl);
    return { ...p, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const kh = {
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
function wh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ee(e, t = {}) {
  const r = kh[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${wh(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const vc = "https://klavity.in", Sr = {
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
function xh(e) {
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
function Sh(e) {
  const t = xh(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function Mi(e) {
  return Sh(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class ia {
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
    const s = Mi(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = Mi(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = Mi(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
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
        for (let y = o; y < g; y++)
          for (let b = h; b < x; b++) {
            const S = (y * s + b) * 4;
            p += d[S], u += d[S + 1], m += d[S + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(p / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + o, x - h, g - o));
      }
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function Ch(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: vc }, i = {
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
const Eh = 50, Mh = 2e3, Rh = 1e3, Ah = 500, sa = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function yn(e, t) {
  e.push(t), e.length > Eh && e.shift();
}
function Xs(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Ri(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      sa.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => sa.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Xs(t, Rh);
}
function Th(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Xs(JSON.stringify(e), Ah);
  } catch {
    return String(e);
  }
}
function _h(e, t = {}) {
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
function Ih(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, o) => {
    yn(e.consoleErrors, { message: Xs(d, Mh), stack: o, timestamp: Date.now(), level: l });
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
          n() && i(d, h.map(Th).join(" "));
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
      return yn(e.networkFailures, { url: Ri(o), status: u.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    } catch (u) {
      throw yn(e.networkFailures, { url: Ri(o), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
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
            yn(e.networkFailures, {
              url: Ri(h.url),
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
const Lh = ["light", "dark", "glass", "neon", "custom", "liquid"], Oh = ["hidden", "icon", "full", "custom"], Nh = ["lightbulb", "bug"], Ph = ["full", "reportOnly", "off"], Dh = /^#[0-9a-fA-F]{3,8}$/, zh = /^[\w \-,'"().]+$/, oa = (e) => typeof e == "object" && e !== null, bn = (e) => typeof e == "string" && Dh.test(e.trim()) ? e.trim() : void 0, vn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, $h = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && zh.test(t) ? t : void 0;
}, aa = {
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
function la(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function kc(e) {
  const t = oa(e) ? e : {}, n = { theme: typeof t.theme == "string" && Lh.includes(t.theme) ? t.theme : "light" }, i = bn(t.primary), s = bn(t.secondary), a = bn(t.background), c = vn(t.thankYou, 140), l = $h(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Oh.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = vn(t.launcherText, 60);
  d && (n.launcherText = d);
  const o = bn(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && Nh.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Ph.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = vn(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const p = oa(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || p.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = vn(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Fh(e) {
  const t = kc(e), r = t.theme === "custom" ? { ...aa.light } : { ...aa[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = la(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && la(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
const Xe = class Xe {
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
    this._recording || !Xe.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), Xe.SESSION_MS), this._begin());
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
      if (i && i in Xe.TERMINAL_ERRORS) {
        this.onError(i, Xe.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > Xe.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? Xe.BENIGN_RESTART_MS : Math.min(Xe.MAX_BACKOFF_MS, Xe.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
Xe.MAX_CONSEC_FAILURES = 6, Xe.BASE_BACKOFF_MS = 400, Xe.MAX_BACKOFF_MS = 8e3, Xe.BENIGN_RESTART_MS = 250, Xe.SESSION_MS = 18e4, Xe.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Gr = Xe;
function Uh() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Bh = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function wc(e) {
  for (const t of Bh)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Ir = class Ir {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Uh(), ...t.deps || {} };
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
    this._stream = t, this._mime = wc(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Ir.MAX_SESSION_MS), this._beginSegment();
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
      }, Ir.SEGMENT_MS);
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
Ir.SEGMENT_MS = 5e3, Ir.MAX_SESSION_MS = 18e4;
let $n = Ir;
function qh() {
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
const et = class et {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...qh(), ...t.deps || {} };
  }
  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(t = {}) {
    const r = globalThis, n = typeof navigator < "u" ? navigator.mediaDevices : void 0, i = !!(t.getUserMedia || n && typeof n.getUserMedia == "function"), s = t.MediaRecorder ?? r.MediaRecorder, a = t.WebSocket ?? r.WebSocket;
    return i && typeof s < "u" && typeof a < "u";
  }
  async start() {
    var r;
    if (this._recording) return;
    this._recording = !0, this._stopped = !1, this._everConnected = !1, this._reconnects = 0;
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
    this._stream = t, this._mime = wc(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), et.MAX_SESSION_MS), this._openSocket();
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
    }, et.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
      this._clearConnectTimer(), this._ws = null, this._onDrop();
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
    if (this._reconnects >= et.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(et.MAX_BACKOFF_MS, et.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(et.TIMESLICE_MS);
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
        this._recorder.start(et.TIMESLICE_MS);
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
    var t, r;
    if (!this._recording) {
      this._stopped || (this._stopped = !0);
      return;
    }
    this._recording = !1, this._stopped = !0;
    try {
      (r = (t = this._ws) == null ? void 0 : t.send) == null || r.call(t, JSON.stringify({ type: "stop" }));
    } catch {
    }
    this._teardown(!0);
  }
  _teardown(t) {
    var r, n;
    this._recording = !1, this._clearConnectTimer(), this._sessTimer != null && (this._deps.clearTimeout(this._sessTimer), this._sessTimer = null), this._stopRecorder(), this._recorder && (this._recorder.ondataavailable = null, this._recorder = null);
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
et.MAX_SESSION_MS = 18e4, et.TIMESLICE_MS = 250, et.CONNECT_TIMEOUT_MS = 4e3, et.MAX_RECONNECTS = 3, et.BASE_BACKOFF_MS = 500, et.MAX_BACKOFF_MS = 4e3;
let Fn = et;
function Wh(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function $e(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const jh = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function ir(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (jh.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    $e(a);
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
        for (const o of l) o.parentNode === a && $e(o);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const xc = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Hh = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, Vh = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Yh = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Gh = /* @__PURE__ */ new Set([
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
]), Xh = { needs: "Needs detail", good: "Good", great: "Great" };
function Kh(e) {
  let t = e;
  for (const r of xc) t = t.split(r).join(" ");
  return t;
}
function Jh(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Gh.has(n) || r++;
  return r;
}
function Sc(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Kh(r), i = Jh(n), s = t.length > 0 && xc.some((p) => r.includes(p)) && i < 3, a = i >= 3 && t.length >= 12, c = Yh.test(r), l = Hh.test(r) || Vh.test(t), d = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: d, level: h, label: Xh[h], vague: s };
}
function Zh(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Sc(t).level !== "great";
}
const Qh = [
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
function ef(e) {
  const t = (e || "").toLowerCase();
  return t ? Qh.some((r) => t.includes(r)) : !1;
}
function Cc(e) {
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
function Ec(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", Cc(t.source)],
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
const tf = 1, rf = 6, nf = 1.08;
function sf(e, t = tf, r = rf) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function of(e, t = nf) {
  return e < 0 ? t : 1 / t;
}
function af(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Mc(e, t) {
  return t > 0 ? e.width / t : 1;
}
function lf(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function cf(e, t, r, n, i, s) {
  const a = Mc(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), d = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, p = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: d, y: h, w: Math.max(0, o - d), h: Math.max(0, p - h) };
}
function uf(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function df(e, t, r, n, i, s) {
  const a = Mc(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function pf(e) {
  return Ec("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || Cc()
  });
}
function hf(e) {
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
function ff(e, t, r) {
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
function vt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ca(e) {
  let t = vt(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function ua(e) {
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
function mf(e) {
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
function da(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function pa(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Lt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp };
}
function gf(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function yf(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const bf = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Rc(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function vf(e) {
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
const kf = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", wf = 100, xf = wf * 1024 * 1024;
function Sf(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function wr(e) {
  return Rc(e) ? "video" : Sf(e) ? "image" : "file";
}
function Cf(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function kn(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Ef(e, t, r = {}) {
  var Po, Do, zo, $o;
  const n = kc(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, d = [], o = [], h = [], p = [], u = !1;
  const m = !!t.onMinimize, f = m ? 8 : 5, g = 15e3, x = 10 * 1024 * 1024, y = !!t.allowFileAttachments, b = 5, S = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : xf, w = t.reporterRole ?? "anon", k = t.upgradeUrl, C = Math.max(120 * 1024 * 1024, S + 20 * 1024 * 1024);
  let I = [], P = null;
  const L = !!(t.allowRecording && t.onRecord), K = Wh({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: $n.isSupported(),
    webSpeechSupported: Gr.isSupported()
  }), V = K !== "none", _ = 2;
  let ie = [];
  const Ae = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, G = {};
  let J = null;
  const Ee = () => {
    const v = Object.keys(G);
    if (!v.length && !J) return null;
    const R = {};
    if (v.length) {
      const E = {};
      for (const A of v) E[A] = G[A];
      const M = G[0] ?? G[Number(v[0])] ?? {};
      Object.assign(R, M, { byIndex: E });
    }
    return J && (R.selector = J.selector, R.selectorText = J.text), R;
  };
  let Se = e, oe = 0, Q = null, ve = null, D = null, Ve = t.replayState === "attached", Fe = null, We = null, Me = null, Ie = !1;
  const ut = 4e3, lt = 5e3, H = {}, ae = {}, he = (v) => v ? JSON.parse(JSON.stringify(v)) : null, Ce = (v) => ({
    url: c[v],
    compressed: d[v],
    ann: he(G[v])
  }), Pe = (v) => {
    (H[v] ?? (H[v] = [])).push(Ce(v));
  }, ke = (v, R) => {
    c[v] = R.url, d[v] = R.compressed, R.ann ? G[v] = he(R.ann) : delete G[v];
  }, Bt = (v) => {
    const R = H[v];
    if (!R || !R.length) return !1;
    const E = R.pop(), M = ae[v];
    for (; M && M.length && M[M.length - 1].mark >= R.length; ) M.pop();
    return ke(v, E), Te(), !0;
  }, xe = (v) => {
    const R = ae[v];
    if (!R || !R.length) return !1;
    const { snap: E, mark: M } = R.pop();
    return H[v] && (H[v].length = Math.min(H[v].length, M)), ke(v, E), Te(), !0;
  }, De = document.createElement("style");
  De.textContent = `
    ${Fh(n)}
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
    .kl-minimap-vp{position:absolute;box-sizing:border-box;border:2px solid var(--kl-accent,#6c63ff);background:color-mix(in srgb,var(--kl-accent,#6c63ff) 20%,transparent);box-shadow:0 0 0 9999px rgba(0,0,0,.3);pointer-events:none;}
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
  `, a.appendChild(De);
  const Je = document.createElement("div");
  Je.className = "klavity-overlay";
  const te = document.createElement("div");
  te.className = "klavity-modal", te.innerHTML = `
    ${m ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${ee("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${ee("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${Ae ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${Ae.map((v) => `<button type="button" class="kl-type-chip${v.value === e ? " active" : ""}" data-kind="${vt(v.value)}" role="radio" aria-checked="${v.value === e ? "true" : "false"}">${vt(v.label)}${v.mappingLabel ? `<span class="kl-type-map">${vt(v.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${ee("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${ee("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${ee("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${ee("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${y ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${ee(y ? "paperclip" : "image")}</span><span class="kl-upload-label">${y ? "Attach" : "Upload"}</span></button>
        ${L ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${ee("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${ee("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${ee("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${y ? kf : "image/*,.heic,.heif"}" multiple style="display:none">
      ${y ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(S / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${f} images</div>
        ${V ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${ee("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${y ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${y ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${ee("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${ee("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${ee("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${ee("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${vt(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb">${ee("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, Je.appendChild(te), a.appendChild(Je);
  const ue = a.getElementById("klavity-sharp"), Dt = a.querySelector(".klavity-info-pop");
  if (ue && Dt) {
    const v = document.createElement("div");
    v.className = "kl-float-tip", v.setAttribute("role", "tooltip"), v.innerHTML = Dt.innerHTML, a.appendChild(v);
    const R = () => {
      const M = ue.getBoundingClientRect(), A = Math.min(228, window.innerWidth - 16), T = 8, O = window.innerWidth, $ = window.innerHeight, z = M.left + M.width / 2 - A / 2, F = Math.max(T, Math.min(z, O - A - T));
      v.style.left = F + "px", v.style.top = "-9999px", v.style.visibility = "hidden", v.style.display = "block";
      const B = v.offsetHeight;
      v.style.display = "", v.style.visibility = "";
      let q = M.bottom + 8;
      q + B + T > $ && (q = M.top - B - 8), q = Math.max(T, Math.min(q, $ - B - T)), v.style.top = q + "px", v.classList.add("kl-show");
    }, E = () => v.classList.remove("kl-show");
    ue.addEventListener("mouseenter", R), ue.addEventListener("mouseleave", E), ue.addEventListener("focus", R), ue.addEventListener("blur", E);
  }
  let Ur = !1, qt = null;
  function ui() {
    try {
      qt == null || qt.remove();
    } catch {
    }
    qt = null;
    try {
      ue == null || ue.classList.remove("kl-pulse");
    } catch {
    }
  }
  function ju() {
    var z;
    if (Ur || !ue || Ie) return;
    Ur = !0;
    const v = document.createElement("div");
    v.className = "kl-float-tip kl-nudge", v.setAttribute("role", "status"), v.setAttribute("aria-live", "polite"), v.innerHTML = `<div class="kl-nudge-row"><span><b>Get pixel-perfect screenshots by sharing</b> — try it now.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${ee("x", { size: 13 })}</button></div>`, a.appendChild(v), qt = v;
    const R = ue.getBoundingClientRect(), E = Math.min(228, window.innerWidth - 16), M = 8, A = window.innerWidth, T = window.innerHeight;
    v.style.left = Math.max(M, Math.min(R.left + R.width / 2 - E / 2, A - E - M)) + "px", v.style.top = "-9999px", v.style.visibility = "hidden", v.style.display = "block";
    const O = v.offsetHeight;
    v.style.display = "", v.style.visibility = "";
    let $ = R.bottom + 8;
    $ + O + M > T && ($ = R.top - O - 8), v.style.top = Math.max(M, Math.min($, T - O - M)) + "px", v.classList.add("kl-show"), (z = v.querySelector(".kl-nudge-x")) == null || z.addEventListener("click", ui);
    try {
      ue.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => ui(), 9e3);
    } catch {
    }
    ue.addEventListener("click", ui, { once: !0 });
  }
  function Hu(v) {
    Ve = v === "attached", ct();
  }
  const vo = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (v, R, E, M, A) => dt(v, R, E, !1, !!M, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (v, R, E, M, A) => dt(v, R, E, !0, !!M, A),
    close: gr,
    setReplayState: Hu,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (v) => {
      if (P = kn(v), !Ie)
        try {
          Te(), hi();
        } catch {
        }
    }
  };
  function Te() {
    const v = a.getElementById("klavity-strip"), R = a.getElementById("klavity-counter");
    v.innerHTML = "", c.forEach((E, M) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb", M === oe && A.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = E, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && A.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        oe = M, Q = null, ve = null, Te();
      });
      const O = document.createElement("button");
      O.className = "klavity-rm", O.innerHTML = ee("x", { size: 13 }), O.title = "Remove", O.addEventListener("click", (F) => {
        var B;
        F.stopPropagation(), c.splice(M, 1), d.splice(M, 1), o.splice(M, 1), h.splice(M, 1), p.splice(M, 1);
        try {
          (B = t.onShotRemoved) == null || B.call(t, M);
        } catch {
        }
        delete G[M];
        for (const q of Object.keys(G).map(Number).filter((j) => j > M).sort((j, de) => j - de))
          G[q - 1] = G[q], delete G[q];
        delete H[M], delete ae[M];
        for (const q of Object.keys(H).map(Number).filter((j) => j > M).sort((j, de) => j - de))
          H[q - 1] = H[q], delete H[q];
        for (const q of Object.keys(ae).map(Number).filter((j) => j > M).sort((j, de) => j - de))
          ae[q - 1] = ae[q], delete ae[q];
        c.length === 0 && Tt(null), Te();
      });
      const $ = document.createElement("button");
      $.className = "klavity-mk", $.innerHTML = ee("pencil", { size: 13 }), $.title = "Mark up", $.addEventListener("click", (F) => {
        F.stopPropagation(), id(M);
      }), A.append(T, O, $);
      const z = o[M];
      if (z) {
        const F = bf[z], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + z, B.title = z === "real-pixel" ? "Pixel-perfect capture (every image included)" : z === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", B.innerHTML = ee(F.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + vt(F.label) + "</span>", A.appendChild(B), F.degraded && t.onRetakeSharp) {
          const q = document.createElement("button");
          q.type = "button", q.className = "klavity-retake", q.innerHTML = ee("zap", { size: 11 }) + "<span>Retake sharp</span>", q.title = "Recapture this shot at full pixel quality", q.addEventListener("click", (j) => {
            j.stopPropagation(), Vu(M, q);
          }), A.appendChild(q);
        }
      }
      if (ko.has(M)) {
        const F = document.createElement("div");
        F.className = "klavity-retake-note", F.textContent = "Markup cleared for the retake.", A.appendChild(F);
      }
      v.appendChild(A);
    }), I.forEach((E, M) => {
      if (wr(E) !== "video") return;
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb", Q === M && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = ee("play", { size: 16 });
      const $ = document.createElement("span");
      $.className = "kl-video-badge", $.innerHTML = ee("play", { size: 9 }) + "<span>Video</span>", A.title = "Click to play " + E.name, A.addEventListener("click", () => {
        Q = M, ve = null, Te();
      });
      const z = document.createElement("button");
      z.className = "klavity-rm", z.innerHTML = ee("x", { size: 13 }), z.title = "Remove", z.addEventListener("click", (B) => {
        B.stopPropagation(), xo(M);
      }), A.append(T, O, $, z);
      const F = kn(P);
      if (F != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = F + "%", B.appendChild(q), A.appendChild(B);
      }
      v.appendChild(A);
    }), ie.forEach((E, M) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb kl-rec-tile", ve === M && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = ee("play", { size: 16 });
      const $ = Math.round(E.durationMs / 1e3), z = document.createElement("span");
      z.className = "kl-video-badge", z.innerHTML = ee("play", { size: 9 }) + `<span>${Math.floor($ / 60)}:${String($ % 60).padStart(2, "0")}${E.screenOnly ? " · screen" : ""}</span>`, A.title = "Click to play your recording", A.addEventListener("click", () => {
        ve = M, Q = null, Te();
      });
      const F = document.createElement("button");
      F.type = "button", F.className = "kl-rerec", F.innerHTML = ee("refresh-cw", { size: 12 }), F.title = "Re-record", F.setAttribute("aria-label", "Re-record"), F.addEventListener("click", (j) => {
        var de;
        j.stopPropagation(), ie.splice(M, 1), ve === M ? ve = null : ve != null && ve > M && (ve -= 1), fi();
        try {
          (de = a.getElementById("klavity-record")) == null || de.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = ee("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (j) => {
        j.stopPropagation(), ie.splice(M, 1), ve === M ? ve = null : ve != null && ve > M && (ve -= 1), fi();
      }), A.append(T, O, z, F, B);
      const q = kn(P);
      if (q != null) {
        const j = document.createElement("div");
        j.className = "kl-att-prog";
        const de = document.createElement("i");
        de.style.width = q + "%", j.appendChild(de), A.appendChild(j);
      }
      v.appendChild(A);
    });
    try {
      const E = v.children[oe];
      E && typeof E.scrollIntoView == "function" && E.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const E = document.createElement("div");
      E.className = "kl-thumb-skel kl-loading", E.setAttribute("role", "status"), E.setAttribute("aria-label", "Capturing screenshot"), E.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', v.appendChild(E);
    }
    R.textContent = `${c.length}/${f} images`, R instanceof HTMLElement && (R.hidden = c.length === 0), ct(), un(), Oo();
  }
  function un() {
    const v = a.getElementById("klavity-sharphint");
    if (!v) return;
    if (c.length > 0 && oe >= 0 && oe < c.length && !!h[oe] && !u && !!t.onCaptureSharp && !gt) {
      if (!v.dataset.built) {
        v.dataset.built = "1", v.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = ee("triangle-alert", { size: 15 });
        const A = document.createElement("span");
        A.className = "kl-sh-txt", A.textContent = "Some areas can't be captured this way (embedded frames or cross-origin images) - click Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          u = !0, un(), ue == null || ue.click();
        });
        const O = document.createElement("button");
        O.type = "button", O.className = "kl-sh-x", O.setAttribute("aria-label", "Dismiss"), O.title = "Dismiss", O.innerHTML = ee("x", { size: 12 }), O.addEventListener("click", () => {
          u = !0, un();
        }), v.append(M, A, T, O);
      }
      v.hidden = !1, ue == null || ue.classList.add("kl-suggest");
    } else
      v.hidden = !0, ue == null || ue.classList.remove("kl-suggest");
  }
  function Rt(v) {
    const R = a.getElementById("klavity-err");
    R && (R.textContent = v, R.style.display = "block");
  }
  function di() {
    const v = a.getElementById("klavity-err");
    v && (v.style.display = "none");
  }
  function dt(v, R, E, M = !0, A = !1, T) {
    var O;
    if (c.length >= f) {
      Rt(`You can attach up to ${f} images.`);
      return;
    }
    if (di(), c.push(v), d.push(t.compressImage ? t.compressImage(v) : Promise.resolve(v)), o.push(R), h.push(A && R !== "real-pixel"), p.push(T), M && (oe = c.length - 1, Q = null, ve = null), Te(), M)
      try {
        (O = t.onShotAdded) == null || O.call(t, v, R);
      } catch {
      }
  }
  const ko = /* @__PURE__ */ new Set();
  async function Vu(v, R) {
    if (!(gt || !t.onRetakeSharp)) {
      Ze(!0), R.classList.add("kl-loading"), s.style.display = "none";
      try {
        const E = i ? ir(document.body) : null;
        let M;
        try {
          M = await t.onRetakeSharp(p[v]);
        } finally {
          E == null || E();
        }
        if (M) {
          const { dataUrl: A, quality: T } = Lt(M);
          A && (c[v] = A, d[v] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), o[v] = T ?? "real-pixel", h[v] = !1, G[v] && (delete G[v], ko.add(v)), delete H[v], delete ae[v]);
        }
      } catch {
      } finally {
        s.style.display = "", Ze(!1), Te();
      }
    }
  }
  function wo(v) {
    return v.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(v.name);
  }
  async function pi(v) {
    di();
    for (const R of v) {
      if (c.length >= f) {
        Rt(`You can attach up to ${f} images.`);
        break;
      }
      if (!wo(R)) {
        Rt(`"${R.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (R.size > x) {
        Rt(`"${R.name}" is too large — images must be under ${Math.round(x / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        dt(await ha(R));
      } catch {
        Rt(`Couldn't add "${R.name}". Please try a different image.`);
      }
    }
  }
  function hi() {
    const v = a.getElementById("klavity-files");
    if (!v) return;
    v.innerHTML = "";
    const R = I.filter((E) => wr(E) === "file");
    v.hidden = R.length === 0, I.forEach((E, M) => {
      if (wr(E) !== "file") return;
      const A = document.createElement("div");
      A.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = ee("file-text", { size: 14 });
      const O = document.createElement("span");
      O.className = "kl-file-nm", O.textContent = E.name, O.title = E.name;
      const $ = document.createElement("span");
      $.className = "kl-file-sz", $.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const z = document.createElement("button");
      z.type = "button", z.className = "kl-file-rm", z.setAttribute("aria-label", `Remove ${E.name}`), z.title = "Remove", z.innerHTML = ee("x", { size: 11 }), z.addEventListener("click", () => {
        xo(M);
      }), A.append(T, O, $, z);
      const F = kn(P);
      if (F != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = F + "%", B.appendChild(q), A.appendChild(B);
      }
      v.appendChild(A);
    }), ct();
  }
  function xo(v) {
    const R = I[v] && wr(I[v]) === "video";
    I.splice(v, 1), Q != null && (R && Q === v ? Q = null : Q > v && (Q -= 1)), hi(), Te();
  }
  function Yu(v, R) {
    if (v.kind === "upgrade") {
      if (!v.url) return null;
      const M = document.createElement("a");
      return M.className = "kl-capmsg-cta", M.href = v.url, M.target = "_blank", M.rel = "noopener noreferrer", M.textContent = v.label, M;
    }
    if (!t.onRequestUpgrade) return null;
    const E = document.createElement("button");
    return E.type = "button", E.className = "kl-capmsg-cta kl-capmsg-req", E.textContent = v.label, E.addEventListener("click", async () => {
      if (E.disabled) return;
      const M = E.textContent || v.label;
      E.disabled = !0, E.textContent = "Requesting…";
      let A = !1;
      try {
        A = await t.onRequestUpgrade({ reason: v.reason || "upgrade", context: R });
      } catch {
        A = !1;
      }
      if (A) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${ee("check")}</span>Request sent to your team`, E.replaceWith(T);
      } else
        E.disabled = !1, E.textContent = M;
    }), E;
  }
  function Gu(v, R) {
    const E = a.getElementById("klavity-capmsg");
    if (!E || !v.overCap) return;
    E.innerHTML = "";
    const M = document.createElement("span");
    if (M.className = "kl-capmsg-t", M.textContent = v.message || "", E.appendChild(M), v.cta) {
      const A = Yu(v.cta, R);
      if (A && E.appendChild(A), v.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = v.cta.hint, E.appendChild(T);
      }
    }
    E.hidden = !1;
  }
  function Xu() {
    const v = a.getElementById("klavity-capmsg");
    v && (v.hidden = !0, v.innerHTML = "");
  }
  async function Ku(v) {
    di(), Xu();
    for (const R of v) {
      if (wo(R)) {
        await pi([R]);
        continue;
      }
      if (I.length >= b) {
        Rt(`You can attach up to ${b} files.`);
        break;
      }
      const E = Cf(R, { capBytes: S, role: w, upgradeUrl: k });
      if (E.overCap) {
        Gu(E, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: R.name, sizeMb: Math.round(R.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (I.reduce((A, T) => A + T.size, 0) + R.size > C) {
        Rt(`Attachments exceed the ${Math.round(C / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const A = R.type || (Rc(R) ? vf(R.name) : ""), T = I.push({ name: R.name, type: A, size: R.size, dataUrl: await ha(R) }) - 1;
        hi(), wr(I[T]) === "video" && (Q = T), Te();
      } catch {
        Rt(`Couldn't add "${R.name}". Please try a different file.`);
      }
    }
  }
  function fi() {
    Ie || (Te(), ct());
  }
  let Zt = null;
  function gr(v) {
    var M;
    if (Ie) return;
    Ie = !0, Zt == null || Zt(), Me && (clearTimeout(Me), Me = null), document.removeEventListener("keydown", Qt, { capture: !0 }), document.removeEventListener("paste", Co);
    try {
      (M = t.onClose) == null || M.call(t, v == null ? void 0 : v.reason);
    } catch {
    }
    const R = a.querySelector(".klavity-modal");
    if (v != null && v.immediate || !R) {
      $e(s);
      return;
    }
    R.classList.add("kl-closing");
    const E = () => $e(s);
    R.addEventListener("animationend", E, { once: !0 }), setTimeout(E, 700);
  }
  function So(v, R) {
    if (Me || Ie) return;
    const E = document.createElement("div");
    E.className = "klavity-toast-progress", E.style.animationDuration = R + "ms", v.appendChild(E);
    let M = R, A = Date.now();
    const T = () => {
      A = Date.now(), Me = setTimeout(() => {
        gr();
      }, M);
    }, O = () => {
      Me && (clearTimeout(Me), Me = null, M = Math.max(0, M - (Date.now() - A)), E.style.animationPlayState = "paused");
    }, $ = () => {
      Me || v.classList.contains("kl-closing") || (E.style.animationPlayState = "running", T());
    };
    v.addEventListener("mouseenter", O), v.addEventListener("mouseleave", $), v.addEventListener("focusin", O), v.addEventListener("focusout", (z) => {
      v.contains(z.relatedTarget) || $();
    }), T();
  }
  function Qt(v) {
    var R;
    if (v.key === "Escape") {
      v.stopPropagation(), gr();
      return;
    }
    if ((v.key === "s" || v.key === "S") && !v.metaKey && !v.ctrlKey && !v.altKey) {
      const E = typeof v.composedPath == "function" && v.composedPath()[0] || v.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable || ((R = E.getAttribute) == null ? void 0 : R.call(E, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const M = a.getElementById("klavity-submit");
      M && !M.disabled && (v.preventDefault(), v.stopPropagation(), M.click());
    }
  }
  document.addEventListener("keydown", Qt, { capture: !0 });
  const Co = (v) => {
    if (!v.clipboardData) return;
    const R = Array.from(v.clipboardData.items).filter((E) => E.type.startsWith("image/")).map((E) => E.getAsFile()).filter((E) => !!E);
    R.length && pi(R);
  };
  document.addEventListener("paste", Co);
  const mi = () => {
    const v = te.querySelector("#klavity-desc");
    v && (v.placeholder = Se === "feature" ? "Describe the feature you'd like..." : Se === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (Ae) {
    const v = Array.from(te.querySelectorAll(".kl-type-chip"));
    v.forEach((R) => {
      R.addEventListener("click", () => {
        Se = R.getAttribute("data-kind") || "bug", v.forEach((E) => {
          const M = E === R;
          E.classList.toggle("active", M), E.setAttribute("aria-checked", M ? "true" : "false");
        }), mi();
      });
    });
  } else {
    const v = te.querySelector(".bug"), R = te.querySelector(".feat");
    v.addEventListener("click", () => {
      Se = "bug", v.classList.add("active"), R.classList.remove("active"), mi();
    }), R.addEventListener("click", () => {
      Se = "feature", R.classList.add("active"), v.classList.remove("active"), mi();
    });
  }
  let Eo = "project";
  {
    const v = te.querySelector("#klavity-target");
    if (v) {
      const R = Array.from(v.querySelectorAll(".kl-tgt-opt"));
      for (const E of R)
        E.addEventListener("click", () => {
          Eo = E.dataset.target === "klavity" ? "klavity" : "project";
          for (const A of R) {
            const T = A === E;
            A.classList.toggle("on", T), A.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const re = te.querySelector("#klavity-desc");
  {
    const v = () => {
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
      const A = v();
      if (!A || !A.rangeCount) return -1;
      try {
        const T = A.getRangeAt(0);
        if (!re.contains(T.endContainer)) return -1;
        const O = T.cloneRange();
        return O.selectNodeContents(re), O.setEnd(T.endContainer, T.endOffset), O.toString().length;
      } catch {
        return -1;
      }
    }, E = (A) => {
      const T = v();
      if (T)
        try {
          const O = document.createRange(), $ = document.createTreeWalker(re, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let z, F = A, B = !1;
          for (; z = $.nextNode(); ) {
            if (z.nodeName === "BR") {
              if (F === 0) {
                O.setStartBefore(z), B = !0;
                break;
              }
              F -= 1;
              continue;
            }
            if (z.nodeType === 3) {
              const q = (z.textContent || "").length;
              if (F <= q) {
                O.setStart(z, F), B = !0;
                break;
              }
              F -= q;
            }
          }
          B ? O.collapse(!0) : (O.selectNodeContents(re), O.collapse(!1)), T.removeAllRanges(), T.addRange(O);
        } catch {
        }
    }, M = () => {
      const A = R(), T = ua(re).replace(/\n$/, "");
      re.innerHTML = T ? ca(T) : "", A >= 0 && E(A);
    };
    re.addEventListener("input", M), Object.defineProperty(re, "value", {
      configurable: !0,
      get() {
        return ua(re);
      },
      set(A) {
        const T = String(A ?? "").replace(/\n$/, "");
        re.innerHTML = T ? ca(T) : "";
      }
    }), Object.defineProperty(re, "disabled", {
      configurable: !0,
      get() {
        return re.getAttribute("contenteditable") === "false";
      },
      set(A) {
        re.setAttribute("contenteditable", A ? "false" : "true"), re.classList.toggle("kl-desc-disabled", !!A);
      }
    }), Object.defineProperty(re, "placeholder", {
      configurable: !0,
      get() {
        return re.getAttribute("data-ph") || "";
      },
      set(A) {
        re.setAttribute("data-ph", String(A ?? ""));
      }
    });
  }
  const er = te.querySelector("#klavity-submit"), At = te.querySelector("#klavity-remail");
  At && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (At.value = t.prefillEmail);
  const Mo = te.querySelector("#klavity-desc-hint"), Ju = () => !t.requireEmail || !!At && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(At.value.trim()), Ro = () => c.length > 0 || Ve || I.length > 0 || ie.length > 0, Zu = () => {
  }, ct = () => {
    const v = re.value.trim() === "";
    er.disabled = v && !Ro() || !Ju(), Mo && (Mo.hidden = !(v && Ro()));
  };
  if (re.addEventListener("input", Zu), re.addEventListener("input", ct), At == null || At.addEventListener("input", ct), t.onEnhance) {
    const v = t.onEnhance, R = te.querySelector("#klavity-enhance"), E = te.querySelector("#klavity-enhance-undo"), M = te.querySelector("#klavity-enhance-regen"), A = te.querySelector("#klavity-enhance-spin");
    let T = 0, O = null;
    const $ = () => c[oe] || c[0] || "", z = async () => {
      if (gt) return;
      const F = re.value.trim();
      O = re.value;
      const B = ++T;
      R && (R.disabled = !0), A && (A.hidden = !1);
      try {
        const q = J ? { selector: J.selector, text: J.text } : null, j = await v(F, { images: c.length, shot: $(), picked: q });
        if (B !== T || !j) return;
        re.value = mf(j), re.dispatchEvent(new Event("input", { bubbles: !0 })), Fe = j.suggestedSeverity || null, We = j.suggestedPriority || null, re.classList.add("kl-just-enhanced"), setTimeout(() => re.classList.remove("kl-just-enhanced"), 700), E && (E.hidden = !1), M && (M.hidden = !1), ct();
      } catch {
      } finally {
        B === T && (R && (R.disabled = !1), A && (A.hidden = !0));
      }
    };
    R == null || R.addEventListener("click", () => {
      z();
    }), M == null || M.addEventListener("click", () => {
      z();
    }), E == null || E.addEventListener("click", () => {
      O !== null && (re.value = O, re.dispatchEvent(new Event("input", { bubbles: !0 })), ct()), O = null, Fe = null, We = null, E && (E.hidden = !0), M && (M.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const v = te.querySelector("#klavity-known"), R = t.onCheckKnown;
    let E = null, M = 0, A = "";
    const T = () => {
      v && (v.hidden = !0, v.textContent = "");
    }, O = (z) => {
      var B;
      if (!v) return;
      const F = z.headline ? vt(z.headline) : "Already reported";
      v.innerHTML = `<span class="kl-known-ic">${ee("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${vt(z.statusLabel)}</span>. We're already tracking "${vt(z.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, v.hidden = !1, (B = v.querySelector("#klavity-known-dismiss")) == null || B.addEventListener("click", () => {
        A = re.value.trim(), T();
      });
    }, $ = async () => {
      const z = re.value.trim();
      if (z.length < 12 || z === A) {
        T();
        return;
      }
      const F = ++M;
      try {
        const B = await R(z);
        if (F !== M) return;
        if (re.value.trim() === A) {
          T();
          return;
        }
        B ? O(B) : T();
      } catch {
      }
    };
    re.addEventListener("input", () => {
      re.value.trim() !== A && (A = ""), E && clearTimeout(E), E = setTimeout($, 500);
    });
  }
  if (n.reportClarity) {
    const v = te.querySelector("#klavity-clarity"), R = te.querySelector("#klavity-clarity-status"), E = {
      problem: te.querySelector("#klavity-clarity-problem"),
      expected: te.querySelector("#klavity-clarity-expected"),
      repro: te.querySelector("#klavity-clarity-repro")
    }, M = te.querySelector("#klavity-clarity-tip"), A = te.querySelector("#klavity-clarity-tip-text"), T = te.querySelector("#klavity-nudge"), O = t.onClarityTip, $ = /* @__PURE__ */ new Map();
    let z = null, F = 0;
    const B = (ne, Y, fe) => {
      if (!ne) return;
      ne.classList.toggle("done", Y);
      const Be = ne.querySelector(".kl-clr-mark");
      Be && (Be.innerHTML = Y ? ee("check", { size: 12 }) : "○"), ne.setAttribute("aria-label", (Y ? "covered: " : "missing: ") + fe);
    }, q = () => {
      M && (M.hidden = !0);
    }, j = (ne) => {
      !M || !A || ef(ne) || (A.innerHTML = vt(ne) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, de = () => {
      const ne = re.value, Y = Sc(ne);
      v && (v.hidden = ne.trim().length === 0, v.classList.remove("l1", "l2", "l3"), v.classList.add(Y.level === "great" ? "l3" : Y.level === "good" ? "l2" : "l1")), R && (R.textContent = Y.label), B(E.problem, Y.coverage.problem, "What's broken"), B(E.expected, Y.coverage.expected, "What you expected"), B(E.repro, Y.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), Y.level === "great" && q();
    }, Ue = () => {
      !O || !M || (z && clearTimeout(z), z = setTimeout(async () => {
        const ne = re.value.trim();
        if (!Zh(ne)) {
          q();
          return;
        }
        if ($.has(ne)) {
          j($.get(ne));
          return;
        }
        const Y = ++F;
        try {
          const fe = await O(ne, { images: c.length });
          if (Y !== F || re.value.trim() !== ne) return;
          fe && fe.tip && ($.set(ne, fe.tip), j(fe.tip));
        } catch {
        }
      }, 1e3));
    };
    re.addEventListener("input", () => {
      de(), Ue();
    }), de(), (Po = te.querySelector("#klavity-nudge-add")) == null || Po.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        re.focus();
      } catch {
      }
    }), (Do = te.querySelector("#klavity-nudge-anyway")) == null || Do.addEventListener("click", () => {
      T && (T.hidden = !0), er.click();
    });
  }
  Je.addEventListener("click", (v) => {
    v.target === Je && gr();
  }), (zo = te.querySelector("#klavity-x")) == null || zo.addEventListener("click", () => gr()), ($o = te.querySelector("#klavity-min")) == null || $o.addEventListener("click", () => {
    var v;
    try {
      (v = t.onMinimize) == null || v.call(t);
    } catch {
    }
  });
  const Ao = () => Array.from(te.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let gt = !1;
  const Ze = (v) => {
    gt = v, Ao().forEach((E) => {
      E.disabled = v;
    }), re.disabled = v;
    const R = te.querySelector("#klavity-voice");
    R && (R.disabled = v), te.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((E) => {
      E.disabled = v;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((E) => {
      E.disabled = v;
    }), v ? (Zt == null || Zt(), er.disabled = !0) : (ct(), un());
  }, Tt = (v) => {
    Ao().forEach((R) => {
      R.classList.remove("kl-active"), R.removeAttribute("aria-pressed");
    }), v && (v.classList.add("kl-active"), v.setAttribute("aria-pressed", "true"));
  }, zt = te.querySelector("#klavity-voice");
  if (zt) {
    const E = zt.querySelector(".kl-vring-prog");
    let M = 0, A = 0, T = !1, O, $ = "";
    const z = () => {
      A = Date.now();
      const le = () => {
        const Re = Date.now() - A, me = Math.min(Re / 18e4, 1);
        if (E == null || E.setAttribute("stroke-dashoffset", String(me * 81.68)), Re >= 165e3 && zt.classList.add("kl-voice-warn"), Re >= 18e4) {
          O.stop();
          return;
        }
        M = requestAnimationFrame(le);
      };
      M = requestAnimationFrame(le);
    }, F = () => {
      cancelAnimationFrame(M), E == null || E.setAttribute("stroke-dashoffset", String(81.68)), zt.classList.remove("kl-voice-warn");
    }, B = te.querySelector("#klavity-voice-status");
    let q = null;
    const j = () => {
      q && (clearTimeout(q), q = null), B && (B.hidden = !0, B.textContent = "", B.classList.remove("kl-vs-info", "kl-vs-err"));
    }, de = (le, Re, me) => {
      !B || !Re || (q && (clearTimeout(q), q = null), B.classList.remove("kl-vs-info", "kl-vs-err"), B.classList.add(le === "err" ? "kl-vs-err" : "kl-vs-info"), B.textContent = Re, B.hidden = !1, me && (q = setTimeout(j, me)));
    }, Ue = "Recording — tap to stop", ne = () => {
      B && B.classList.contains("kl-vs-info") && j();
    }, Y = (le) => {
      zt.classList.toggle("kl-voice-rec", le), zt.setAttribute("aria-pressed", le ? "true" : "false"), zt.setAttribute("aria-label", le ? "Stop recording" : "Voice dictation"), zt.title = le ? Ue : "Voice dictation";
    }, fe = (le) => {
      le.onTranscript = (Re) => {
        const me = re.value;
        re.value = me + (me.length > 0 && !/\s$/.test(me) ? " " : "") + Re, ct();
      }, le.onStatus = (Re, me) => {
        Re === "idle" ? ne() : de("info", me);
      }, le.onError = (Re, me) => {
        me && de("err", me, 4e3);
      }, le.onStop = () => {
        T = !1, Y(!1), F(), ne();
      };
    }, Be = () => {
      const le = new Gr();
      return fe(le), le;
    }, Ye = () => {
      if (!T) {
        Y(!1), F(), ne();
        return;
      }
      Gr.isSupported() ? (O = Be(), de("info", "Reconnecting dictation…"), O.start()) : (T = !1, Y(!1), F(), de("err", "Voice dictation is unavailable right now", 4e3));
    }, Qe = () => {
      if (!(K === "server" && t.onDictate)) return null;
      const le = new $n({ transcribe: (Re) => t.onDictate(Re) });
      return fe(le), le.onUnavailable = Ye, le;
    }, Wt = (le) => {
      const Re = () => $.length > 0 && !/\s$/.test($) ? " " : "";
      le.onTranscript = (me) => {
        $ = $ + Re() + me, re.value = $, ct();
      }, le.onInterim = (me) => {
        re.value = $ + Re() + me, ct();
      }, le.onStatus = (me, Z) => {
        me === "idle" ? ne() : de("info", Z);
      }, le.onError = (me, Z) => {
        Z && de("err", Z, 4e3);
      }, le.onStop = () => {
        re.value = $, T = !1, Y(!1), F(), ne(), ct();
      }, le.onUnavailable = () => {
        if (re.value = $, !T) {
          Y(!1), F(), ne();
          return;
        }
        const me = Qe();
        if (me) {
          O = me, de("info", "Reconnecting dictation…"), O.start();
          return;
        }
        Ye();
      };
    }, _t = () => {
      if (K === "server" && t.dictationStreamUrl && Fn.isSupported()) {
        const le = new Fn({ url: t.dictationStreamUrl });
        return Wt(le), le;
      }
      return Qe() ?? Be();
    };
    O = _t(), zt.addEventListener("click", () => {
      T ? O.stop() : (j(), $ = re.value, O = _t(), T = !0, Y(!0), O.start(), z());
    }), Zt = () => {
      T && O.stop();
    };
  }
  er.addEventListener("click", async () => {
    var ne;
    if (gt || er.disabled) return;
    const v = re.value.trim(), R = te.querySelector("#klavity-title"), E = R ? R.value.trim() : "", M = Se === "feature" ? "feature" : "bug", A = d.slice(), T = Ee(), O = I.slice(), $ = ie.slice(), z = Se, F = (At == null ? void 0 : At.value.trim()) || void 0;
    Ze(!0), er.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const q = a.getElementById("klavity-progress"), j = a.getElementById("klavity-progress-fill");
    q && j && (q.classList.add("show"), j.style.transition = "none", j.style.width = "8%", j.offsetWidth, j.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      j.style.width = "90%";
    }));
    const de = () => {
      j && (j.style.transition = "width .25s ease", j.style.width = "100%");
    }, Ue = () => {
      q && j && (q.classList.remove("show"), j.style.transition = "none", j.style.width = "0");
    };
    try {
      const Y = await Promise.all(A), fe = {
        type: M,
        ...Ae ? { kind: z } : {},
        ...E ? { title: E } : {},
        description: v,
        screenshots: Y,
        ...O.length ? { files: O } : {},
        ...$.length ? { recordings: $ } : {},
        annotations: T,
        reporterEmail: F,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Eo } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...Fe ? { suggestedSeverity: Fe } : {},
        ...We ? { suggestedPriority: We } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((ne = a.getElementById("klavity-conlog-cb")) != null && ne.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(fe), gr({ immediate: !0, reason: "submitted" });
        return;
      }
      const Be = await t.onSubmit(fe);
      if (Ie) return;
      de(), t.success ? od(Be.issueKey, Be.issueUrl, t.success) : sd(Be.issueKey, Be.issueUrl);
    } catch (Y) {
      Ue();
      const fe = (Y == null ? void 0 : Y.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", Y);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${fe}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", er.textContent = "Submit", Ze(!1);
    }
  });
  function Qu(v, R) {
    const { dataUrl: E, quality: M, suggestSharp: A } = Lt(R);
    if (!E) return;
    const T = c.indexOf(v);
    T < 0 || (c[T] = E, d[T] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), o[T] = M, h[T] = !!A && M !== "real-pixel", G[T] && delete G[T], delete H[T], delete ae[T], Te());
  }
  async function ed(v) {
    if (!t.onCaptureViewport) return !1;
    let R = null;
    const E = i ? ir(document.body) : null;
    try {
      const { dataUrl: M } = Lt(await t.onCaptureViewport());
      M && (R = M, l = !1, dt(M, "rendered", void 0, !0, !1), v && Tt(v));
    } catch {
    } finally {
      E == null || E();
    }
    return (async () => {
      const M = i ? ir(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (R) Qu(R, A);
        else {
          l = !1;
          const { dataUrl: T, quality: O, suggestSharp: $ } = Lt(A);
          T && (dt(T, O, void 0, !0, !!$), v && Tt(v));
        }
      } catch {
        l = !1, Te();
      } finally {
        M == null || M();
      }
    })(), !0;
  }
  async function To(v) {
    if (!t.onCaptureViewport) return !1;
    const R = i ? ir(document.body) : null;
    try {
      const { dataUrl: E } = Lt(await t.onCaptureViewport());
      E ? (l = !1, dt(E, "rendered", void 0, !0, !1)) : (l = !1, Te());
    } catch {
      l = !1, Te();
    } finally {
      R == null || R();
    }
    return !0;
  }
  const tr = te.querySelector("#klavity-full");
  tr.addEventListener("click", async () => {
    if (!gt && !(t.onCaptureSharp && await gi())) {
      Ze(!0), tr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await ed(tr);
          return;
        }
        const v = i ? ir(document.body) : null;
        try {
          const { dataUrl: R, quality: E, suggestSharp: M } = Lt(await t.onCaptureFull());
          dt(R, E, void 0, !0, !!M), Tt(tr);
        } finally {
          v == null || v();
        }
      } catch {
      } finally {
        tr.classList.remove("kl-loading"), Ze(!1);
      }
    }
  });
  async function gi(v) {
    const R = v != null && v.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (gt || !R || !ue) return !1;
    const E = ue.querySelector(".kl-sharp-label");
    Ze(!0), ue.classList.add("kl-loading"), s.style.display = "none";
    const M = E ?? ue, A = M.textContent;
    M.textContent = "Capturing…";
    let T = !1;
    try {
      const O = i ? ir(document.body) : null;
      let $;
      try {
        $ = await R();
      } finally {
        O == null || O();
      }
      if ($) {
        const { dataUrl: z, quality: F } = Lt($);
        z && (dt(z, F ?? "real-pixel", void 0, !0, !1, { kind: v != null && v.viewport ? "viewport" : "full" }), Tt(ue), T = !0);
      }
    } catch (O) {
      if (yf(O))
        try {
          ju();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", O);
        } catch {
        }
    } finally {
      s.style.display = "", M.textContent = A, ue.classList.remove("kl-loading"), Ze(!1);
    }
    return T;
  }
  ue && t.onCaptureSharp && ue.addEventListener("click", () => {
    gi();
  });
  const _o = te.querySelector("#klavity-file"), Io = te.querySelector("#klavity-upload");
  Io.addEventListener("click", () => {
    if (!gt) {
      if (!y && c.length >= f) {
        Rt(`You can attach up to ${f} images.`);
        return;
      }
      _o.click();
    }
  }), _o.addEventListener("change", async (v) => {
    const R = v.target, E = R.files ? Array.from(R.files) : [];
    if (R.value = "", !E.length) return;
    const M = c.length, A = I.length;
    y ? await Ku(E) : await pi(E), (c.length > M || I.length > A) && Tt(Io);
  });
  const Br = a.getElementById("klavity-record");
  Br && t.onRecord && Br.addEventListener("click", async () => {
    if (gt) return;
    if (ie.length >= _) {
      Rt(`You can attach up to ${_} recordings.`);
      return;
    }
    Ze(!0), Br.classList.add("kl-loading");
    const v = (R) => {
      s.style.display = R === "recording" ? "none" : "";
    };
    try {
      const R = await t.onRecord(v);
      R && (ie.push(R), ve = ie.length - 1, Q = null, fi(), Tt(Br));
    } catch {
    } finally {
      s.style.display = "", Br.classList.remove("kl-loading"), Ze(!1);
    }
  });
  const yi = a.getElementById("klavity-region");
  yi && t.onRegionCapture && (yi.onclick = () => {
    gt || (Ze(!0), document.removeEventListener("keydown", Qt, { capture: !0 }), s.style.display = "none", Mf(async (v) => {
      document.addEventListener("keydown", Qt, { capture: !0 });
      try {
        const R = i ? ir(document.body) : null;
        let E;
        try {
          E = await t.onRegionCapture(v);
        } finally {
          R == null || R();
        }
        if (E) {
          const { dataUrl: M, quality: A, suggestSharp: T } = Lt(E);
          M && (dt(M, A, void 0, !0, !!T, { kind: "region", rect: v }), Tt(yi));
        }
      } finally {
        s.style.display = "", Ze(!1);
      }
    }, () => {
      document.addEventListener("keydown", Qt, { capture: !0 }), s.style.display = "", Ze(!1);
    }));
  });
  const yr = a.getElementById("klavity-pick"), br = a.getElementById("klavity-pickinfo"), Lo = () => {
    var E;
    if (yr && (yr.classList.toggle("kl-active", !!J), J ? yr.setAttribute("aria-pressed", "true") : yr.removeAttribute("aria-pressed")), !br) return;
    if (!J) {
      br.hidden = !0, br.innerHTML = "";
      return;
    }
    br.hidden = !1;
    const { text: v } = J, R = v ? `: <span class="kl-pick-txt">${vt(v)}</span>` : "";
    br.innerHTML = `<span class="kl-pick-ic">${ee("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${R}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (E = br.querySelector("#klavity-pick-clear")) == null || E.addEventListener("click", () => {
      J = null, Lo();
    });
  };
  yr && t.onPickElement && (yr.onclick = async () => {
    if (!gt) {
      Ze(!0), document.removeEventListener("keydown", Qt, { capture: !0 }), s.style.display = "none";
      try {
        const v = await t.onPickElement();
        v && (J = v, Lo(), v.shot && dt(v.shot, v.shotQuality, void 0, !0, !1, { kind: "element", selector: v.selector, rect: v.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Qt, { capture: !0 }), s.style.display = "", Ze(!1);
      }
    }
  });
  function yt(v, R = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${R}" height="${R}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${v}</svg>`;
  }
  function td(v) {
    const R = (T, O, $, z) => `<button type="button" class="kl-htool" data-tool="${T}" title="${O} (${z.toUpperCase()})" aria-label="${O}">${$}<span class="kl-hk">${z.toUpperCase()}</span></button>`, E = (T) => {
      const O = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(O)) return !1;
      const $ = parseInt(O.slice(0, 2), 16), z = parseInt(O.slice(2, 4), 16), F = parseInt(O.slice(4, 6), 16);
      return (0.2126 * $ + 0.7152 * z + 0.0722 * F) / 255 > 0.7;
    }, M = (T) => `<button type="button" class="kl-hcolor${E(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + R("pen", "Pen", ee("pencil", { size: 15 }), "p") + R("line", "Line", yt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + R("rect", "Rectangle", ee("square", { size: 15 }), "r") + R("circle", "Circle", yt('<circle cx="12" cy="12" r="9"/>'), "o") + R("arrow", "Arrow", yt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + R("text", "Text", yt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + R("count", "Numbers", yt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${ee("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + R("pixelate", "Redact (pixelate)", yt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + R("crop", "Crop", yt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + M("#ef4444") + M("#f97316") + M("#16a34a") + M("#3b82f6") + M("#ffffff") + M("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${yt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (v ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${yt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${ee("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${yt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${yt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function qr() {
    D && (document.removeEventListener("keydown", D, { capture: !0 }), D = null);
  }
  function bi() {
    const v = a.getElementById("klavity-hero-stage"), R = a.getElementById("klavity-hero-tools");
    R && (R.innerHTML = ""), v && (v.innerHTML = `<div class="kl-hero-empty">${ee("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), qr();
  }
  function Oo() {
    var v;
    if (Q != null && !(I[Q] && wr(I[Q]) === "video") && (Q = null), ve != null && !ie[ve] && (ve = null), ve != null) {
      No(ie[ve].dataUrl);
      return;
    }
    if (Q != null) {
      No((v = I[Q]) == null ? void 0 : v.dataUrl);
      return;
    }
    if (c.length === 0) {
      oe = 0, bi();
      return;
    }
    oe >= c.length && (oe = c.length - 1), oe < 0 && (oe = 0), nd(oe);
  }
  function No(v) {
    const R = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!R || !v) {
      bi();
      return;
    }
    qr(), E && (E.innerHTML = ""), R.innerHTML = "";
    const M = document.createElement("video");
    M.src = v, M.controls = !0, M.setAttribute("playsinline", ""), M.preload = "metadata", M.className = "kl-hero-video", M.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", R.appendChild(M);
  }
  function rd(v, R, E, M, A) {
    const T = c[v];
    if (!T) return;
    const O = new Image();
    O.onload = () => {
      var de, Ue;
      if (c[v] !== T) return;
      const $ = document.createElement("canvas");
      $.width = Math.max(1, Math.round(M)), $.height = Math.max(1, Math.round(A));
      const z = $.getContext("2d");
      if (!z) return;
      z.drawImage(O, R, E, M, A, 0, 0, $.width, $.height);
      let F;
      try {
        F = $.toDataURL("image/png");
      } catch {
        return;
      }
      const B = ((de = H[v]) == null ? void 0 : de.length) ?? 0, q = Ce(v);
      c[v] = F, d[v] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const j = (Ue = G[v]) == null ? void 0 : Ue.shapes;
      Array.isArray(j) && j.length ? G[v] = { w: $.width, h: $.height, shapes: ff(j, -R, -E) } : delete G[v], (H[v] ?? (H[v] = [])).push(q), (ae[v] ?? (ae[v] = [])).push({ snap: q, mark: B }), Te();
    }, O.src = T;
  }
  function nd(v) {
    var z, F, B, q, j, de, Ue;
    const R = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!R || !E) return;
    const M = c[v];
    if (!M) {
      bi();
      return;
    }
    qr(), R.innerHTML = "";
    const A = document.createElement("canvas");
    A.width = 1, A.height = 1, A.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new ia(A, M), O = (z = G[v]) == null ? void 0 : z.shapes;
    Array.isArray(O) && O.forEach((ne) => T.shapes.push({ ...ne })), R.appendChild(A);
    const $ = new Image();
    $.onload = () => {
      !document.body.contains(s) || oe !== v || c[v] !== M || (A.width = $.naturalWidth || 1, A.height = $.naturalHeight || 1, T.redraw());
    }, $.src = M, T.redraw();
    {
      E.innerHTML = td((((F = ae[v]) == null ? void 0 : F.length) ?? 0) > 0);
      const ne = E.querySelector("#kl-hero-logo");
      ne && (ne.href = pf(n.projectId));
      let Y = "pen", fe = "#ef4444", Be = 26, Ye = "black", Qe = null;
      const Wt = E.querySelector("#kl-hero-textopts"), _t = () => {
        T.shapes.length ? G[v] = { w: A.width, h: A.height, shapes: T.shapes.map((N) => ({ ...N })) } : delete G[v];
      }, le = (N) => {
        Y = N, E.querySelectorAll("[data-tool]").forEach((U) => U.classList.toggle("kl-on", U.dataset.tool === N)), Wt && (Wt.hidden = N !== "text");
      }, Re = E.querySelector(".kl-hcolor-custom"), me = E.querySelector(".kl-hcolor-input"), Z = (N, U) => {
        fe = N, E.querySelectorAll("[data-color]").forEach((X) => X.classList.toggle("kl-on", X === U)), Re && Re.classList.toggle("kl-on", Re === U);
      };
      if (E.querySelectorAll("[data-tool]").forEach((N) => N.addEventListener("click", () => le(N.dataset.tool))), E.querySelectorAll("[data-color]").forEach((N) => N.addEventListener("click", () => Z(N.dataset.color, N))), Re && me) {
        Re.addEventListener("click", () => me.click());
        const N = () => {
          Re.style.background = me.value, Z(me.value, Re);
        };
        me.addEventListener("input", N), me.addEventListener("change", N);
      }
      const se = E.querySelector(".kl-hmask-cb");
      se && se.addEventListener("change", () => {
        i = se.checked;
      }), E.querySelectorAll("[data-outline]").forEach((N) => N.addEventListener("click", () => {
        Ye = N.dataset.outline, E.querySelectorAll("[data-outline]").forEach((U) => U.classList.toggle("kl-on", U === N));
      })), E.querySelectorAll("[data-size]").forEach((N) => N.addEventListener("click", () => {
        Be = Number(N.dataset.size), E.querySelectorAll("[data-size]").forEach((U) => U.classList.toggle("kl-on", U === N));
      })), E.querySelectorAll("[data-stroke]").forEach((N) => N.addEventListener("click", () => {
        T.strokeScale = Number(N.dataset.stroke) || 1, E.querySelectorAll("[data-stroke]").forEach((U) => U.classList.toggle("kl-on", U === N)), T.redraw();
      })), (B = E.querySelector("#kl-hero-undo")) == null || B.addEventListener("click", () => {
        Bt(v);
      }), (q = E.querySelector("#kl-hero-revert")) == null || q.addEventListener("click", () => {
        xe(v);
      }), (j = E.querySelector("#kl-hero-clear")) == null || j.addEventListener("click", () => {
        Pe(v), T.clearAll(), _t();
      }), le(Y), Z(fe, E.querySelector("[data-color]"));
      const Le = (N) => {
        const U = A.getBoundingClientRect(), X = Math.min(U.width / A.width, U.height / A.height) || 1, ge = A.width * X, ye = A.height * X, He = (U.width - ge) / 2, It = (U.height - ye) / 2;
        return { x: (N.clientX - U.left - He) / X, y: (N.clientY - U.top - It) / X };
      }, dn = () => {
        const N = A.getBoundingClientRect();
        return Math.min(N.width / A.width, N.height / A.height) || 1;
      }, ad = (N, U, X, ge, ye, He) => N === "line" ? { type: "line", color: He, x1: U, y1: X, x2: ge, y2: ye } : N === "arrow" ? { type: "arrow", color: He, x1: U, y1: X, x2: ge, y2: ye } : N === "rect" ? { type: "rect", color: He, x: Math.min(U, ge), y: Math.min(X, ye), w: Math.abs(ge - U), h: Math.abs(ye - X) } : N === "circle" ? { type: "circle", color: He, x: (U + ge) / 2, y: (X + ye) / 2, rx: Math.abs(ge - U) / 2, ry: Math.abs(ye - X) / 2 } : N === "pixelate" ? { type: "pixelate", x: Math.min(U, ge), y: Math.min(X, ye), w: Math.abs(ge - U), h: Math.abs(ye - X) } : null;
      let Ge = 1, jt = 0, Ht = 0, pn = null;
      const ld = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), hn = af(ld), vi = () => {
        if (pn) return pn;
        const N = A.style.transform;
        return A.style.transform = "", pn = A.getBoundingClientRect(), A.style.transform = N, pn;
      }, je = document.createElement("div");
      je.className = "kl-minimap", je.hidden = !0, je.setAttribute("role", "navigation"), je.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Wr = document.createElement("img");
      Wr.className = "kl-minimap-img", Wr.alt = "", Wr.draggable = !1, Wr.src = M;
      const vr = document.createElement("div");
      vr.className = "kl-minimap-vp", je.append(Wr, vr), R.appendChild(je);
      const Fo = () => {
        const N = A.width, U = A.height;
        if (Ge <= 1 || N < 2 || U < 2) {
          je.hidden = !0;
          return;
        }
        const X = vi();
        if (!X) {
          je.hidden = !0;
          return;
        }
        const ge = 148, ye = Math.min(ge / N, ge / U), He = Math.max(1, Math.round(N * ye)), It = Math.max(1, Math.round(U * ye));
        je.style.width = He + "px", je.style.height = It + "px";
        const bt = R.getBoundingClientRect(), Vt = cf(
          { left: bt.left, top: bt.top, right: bt.right, bottom: bt.bottom },
          { left: X.left, top: X.top, width: X.width, height: X.height },
          { panX: jt, panY: Ht },
          Ge,
          N,
          U
        );
        vr.style.left = Vt.x * ye + "px", vr.style.top = Vt.y * ye + "px", vr.style.width = Math.max(3, Vt.w * ye) + "px", vr.style.height = Math.max(3, Vt.h * ye) + "px", je.hidden = !1;
      }, jr = () => {
        if (Ge === 1) {
          jt = 0, Ht = 0, A.style.transform = "", A.style.cursor = "crosshair", Fo();
          return;
        }
        A.style.transformOrigin = "0 0", A.style.transform = `translate(${jt}px,${Ht}px) scale(${Ge})`, A.style.cursor = "grab", Fo();
      }, fn = (N, U, X) => {
        const ge = vi();
        if (!ge) return;
        const ye = Ge;
        if (Ge = sf(Ge * X), Ge === ye) return;
        const He = lf(N, U, { left: ge.left, top: ge.top, width: ge.width, height: ge.height }, ye, Ge, { panX: jt, panY: Ht });
        jt = He.panX, Ht = He.panY, A.style.transition = hn, jr();
      }, ki = () => {
        const N = R.getBoundingClientRect();
        return { cx: N.left + N.width / 2, cy: N.top + N.height / 2 };
      }, cd = () => {
        Ge = 1, A.style.transition = hn, jr();
      };
      (de = E.querySelector("#kl-hero-zoomin")) == null || de.addEventListener("click", () => {
        const { cx: N, cy: U } = ki();
        fn(N, U, 1.25);
      }), (Ue = E.querySelector("#kl-hero-zoomout")) == null || Ue.addEventListener("click", () => {
        const { cx: N, cy: U } = ki();
        fn(N, U, 0.8);
      });
      const ud = (N, U) => {
        const X = vi();
        if (!X) return;
        const ge = R.getBoundingClientRect(), ye = df(N, U, { left: ge.left, top: ge.top, right: ge.right, bottom: ge.bottom }, { left: X.left, top: X.top, width: X.width, height: X.height }, Ge, A.width);
        jt = ye.panX, Ht = ye.panY, A.style.transition = hn, jr();
      };
      let mn = !1;
      const Uo = (N, U) => {
        const X = je.getBoundingClientRect(), { ix: ge, iy: ye } = uf(N - X.left, U - X.top, X.width, X.height, A.width, A.height);
        ud(ge, ye);
      };
      je.addEventListener("pointerdown", (N) => {
        mn = !0;
        try {
          je.setPointerCapture(N.pointerId);
        } catch {
        }
        Uo(N.clientX, N.clientY), N.preventDefault(), N.stopPropagation();
      }), je.addEventListener("pointermove", (N) => {
        mn && (Uo(N.clientX, N.clientY), N.preventDefault());
      });
      const Bo = (N) => {
        if (mn) {
          mn = !1;
          try {
            je.releasePointerCapture(N.pointerId);
          } catch {
          }
        }
      };
      je.addEventListener("pointerup", Bo), je.addEventListener("pointercancel", Bo), R.addEventListener("wheel", (N) => {
        Y !== "crop" && (N.preventDefault(), fn(N.clientX, N.clientY, of(N.deltaY)));
      }, { passive: !1 }), R.addEventListener("dblclick", () => {
        Ge = 1, A.style.transition = hn, jr();
      });
      let dd = T.shapes.reduce((N, U) => U.type === "count" ? Math.max(N, U.n) : N, 0), rr = !1, it = 0, st = 0, nr = [], kr = !1, qo = 0, Wo = 0, jo = 0, Ho = 0, ot = null, Hr = { x: 0, y: 0 };
      A.addEventListener("pointerdown", (N) => {
        if (N.shiftKey && Ge > 1) {
          kr = !0, qo = N.clientX, Wo = N.clientY, jo = jt, Ho = Ht, A.style.transition = "none", A.style.cursor = "grabbing";
          try {
            A.setPointerCapture(N.pointerId);
          } catch {
          }
          N.preventDefault();
          return;
        }
        const U = Le(N);
        if (it = U.x, st = U.y, Y === "crop") {
          rr = !0;
          try {
            A.setPointerCapture(N.pointerId);
          } catch {
          }
          Hr = { x: N.clientX, y: N.clientY }, ot = document.createElement("div"), ot.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", R.appendChild(ot);
          return;
        }
        if (Y === "text") {
          const X = document.createElement("input"), ge = Ye === "none" ? "none" : `0 0 2px ${Ye}, 0 0 2px ${Ye}`, ye = dn(), He = Math.max(6, Be * ye), It = Be, bt = Ye;
          X.style.cssText = `position:fixed;left:${N.clientX}px;top:${N.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${fe};font-size:${He}px;font-family:sans-serif;font-weight:700;text-shadow:${ge};outline:1px dashed ${fe};z-index:2147483647;min-width:80px;`, document.body.appendChild(X), Qe = X, requestAnimationFrame(() => {
            document.body.contains(X) && X.focus();
          }), X.addEventListener("blur", () => {
            Qe = null, X.value.trim() && (Pe(v), T.addShape({ type: "text", color: fe, x: it, y: st, text: X.value.trim(), size: It, outline: bt }), _t()), $e(X);
          }, { once: !0 }), X.addEventListener("keydown", (Vt) => {
            Vt.key === "Enter" && X.blur(), Vt.key === "Escape" && (X.value = "", X.blur()), Vt.stopPropagation();
          });
          return;
        }
        if (Y === "count") {
          Pe(v), T.addShape({ type: "count", color: fe, x: U.x, y: U.y, n: ++dd }), _t();
          return;
        }
        rr = !0;
        try {
          A.setPointerCapture(N.pointerId);
        } catch {
        }
        Y === "pen" && (nr = [U]);
      }), A.addEventListener("pointermove", (N) => {
        if (kr) {
          A.style.transition = "none", jt = jo + (N.clientX - qo), Ht = Ho + (N.clientY - Wo), jr(), A.style.cursor = "grabbing";
          return;
        }
        if (!rr) return;
        if (Y === "pen") {
          nr.push(Le(N)), nr.length > 1 && T.drawPreview({ type: "pen", color: fe, points: nr });
          return;
        }
        if (Y === "crop" && ot) {
          const ge = R.getBoundingClientRect(), ye = Math.min(Hr.x, N.clientX), He = Math.min(Hr.y, N.clientY), It = Math.max(Hr.x, N.clientX), bt = Math.max(Hr.y, N.clientY);
          ot.style.left = ye - ge.left + "px", ot.style.top = He - ge.top + "px", ot.style.width = It - ye + "px", ot.style.height = bt - He + "px";
          return;
        }
        const U = Le(N), X = ad(Y, it, st, U.x, U.y, fe);
        X && T.drawPreview(X);
      }), A.addEventListener("pointerup", (N) => {
        if (kr) {
          kr = !1, A.style.cursor = Ge > 1 ? "grab" : "crosshair";
          try {
            A.releasePointerCapture(N.pointerId);
          } catch {
          }
          return;
        }
        if (!rr) return;
        rr = !1;
        try {
          A.releasePointerCapture(N.pointerId);
        } catch {
        }
        const U = Le(N);
        if (Y === "crop") {
          ot && ($e(ot), ot = null);
          const ye = Math.max(0, Math.min(it, U.x)), He = Math.max(0, Math.min(st, U.y)), It = Math.abs(U.x - it), bt = Math.abs(U.y - st);
          It > 4 && bt > 4 && rd(v, ye, He, It, bt);
          return;
        }
        const X = Y === "pixelate" && Math.abs(U.x - it) > 4 && Math.abs(U.y - st) > 4;
        (Y === "pen" && nr.length > 1 || Y === "line" || Y === "rect" || Y === "circle" || Y === "arrow" || X) && Pe(v), Y === "pen" && nr.length > 1 ? T.addShape({ type: "pen", color: fe, points: nr }) : Y === "line" ? T.addShape({ type: "line", color: fe, x1: it, y1: st, x2: U.x, y2: U.y }) : Y === "rect" ? T.addShape({ type: "rect", color: fe, x: Math.min(it, U.x), y: Math.min(st, U.y), w: Math.abs(U.x - it), h: Math.abs(U.y - st) }) : Y === "circle" ? T.addShape({ type: "circle", color: fe, x: (it + U.x) / 2, y: (st + U.y) / 2, rx: Math.abs(U.x - it) / 2, ry: Math.abs(U.y - st) / 2 }) : Y === "arrow" ? T.addShape({ type: "arrow", color: fe, x1: it, y1: st, x2: U.x, y2: U.y }) : X && T.addShape({ type: "pixelate", x: Math.min(it, U.x), y: Math.min(st, U.y), w: Math.abs(U.x - it), h: Math.abs(U.y - st) }), _t();
      }), A.addEventListener("pointercancel", (N) => {
        try {
          A.releasePointerCapture(N.pointerId);
        } catch {
        }
        ot && ($e(ot), ot = null), kr && (kr = !1, A.style.cursor = Ge > 1 ? "grab" : "crosshair"), rr && (rr = !1, T.redraw());
      });
      const Vo = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      D = (N) => {
        if (!document.body.contains(s)) {
          qr();
          return;
        }
        if (Qe && document.body.contains(Qe)) return;
        const U = typeof N.composedPath == "function" && N.composedPath()[0] || N.target;
        if (U && (U.tagName === "INPUT" || U.tagName === "TEXTAREA" || U.tagName === "SELECT" || U.isContentEditable)) return;
        if ((N.metaKey || N.ctrlKey) && N.key.toLowerCase() === "z") {
          N.preventDefault(), Bt(v);
          return;
        }
        if (N.metaKey || N.ctrlKey || N.altKey) return;
        const X = N.key.toLowerCase();
        if (X === "z") {
          if (N.preventDefault(), Ge > 1) cd();
          else {
            const { cx: ge, cy: ye } = ki();
            fn(ge, ye, 2);
          }
          return;
        }
        Vo[X] && (N.preventDefault(), le(Vo[X]));
      }, document.addEventListener("keydown", D, { capture: !0 });
    }
  }
  function id(v) {
    const R = c[v], E = new Image();
    E.onload = () => {
      const M = document.createElement("canvas");
      M.width = E.naturalWidth, M.height = E.naturalHeight;
      const A = new ia(M, R);
      A.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
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
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const $ = document.createElement("div");
      $.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", $.appendChild(M);
      const z = document.createElement("style");
      z.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(z, O, $), a.appendChild(T), qr();
      let F = 1;
      const B = (Z) => Math.max(0.05, Math.min(5, Z || 1));
      function q(Z) {
        F = B(Z), M.style.width = Math.round(M.width * F) + "px", M.style.height = Math.round(M.height * F) + "px";
        const se = O.querySelector("#klavity-zoom-pct");
        se && (se.textContent = Math.round(F * 100) + "%");
      }
      const j = () => Math.max(1, $.clientWidth - 24) / M.width, de = () => Math.min(Math.max(1, $.clientWidth - 24) / M.width, Math.max(1, $.clientHeight - 24) / M.height), Ue = M.height / M.width > Math.max(1, $.clientHeight) / Math.max(1, $.clientWidth);
      q(Ue ? j() : de()), O.querySelector("#klavity-zoom-in").addEventListener("click", () => q(F * 1.25)), O.querySelector("#klavity-zoom-out").addEventListener("click", () => q(F / 1.25)), O.querySelector("#klavity-fit-width").addEventListener("click", () => q(j())), O.querySelector("#klavity-fit-page").addEventListener("click", () => q(de()));
      let ne = "rect", Y = "#ef4444", fe = !1, Be = [], Ye = 0, Qe = 0;
      function Wt(Z) {
        ne = Z, O.querySelectorAll("[data-tool]").forEach((se) => {
          const Le = se.dataset.tool === Z;
          se.style.background = Le ? "#585b70" : "#313244", se.style.outline = Le ? "2px solid #89b4fa" : "none";
        });
      }
      O.querySelectorAll("[data-tool]").forEach((Z) => Z.addEventListener("click", () => Wt(Z.dataset.tool))), O.querySelectorAll("[data-color]").forEach((Z) => Z.addEventListener("click", () => {
        Y = Z.dataset.color;
      }));
      {
        const Z = O.querySelector("#klavity-color-custom"), se = O.querySelector("#klavity-color-input");
        if (Z && se) {
          Z.addEventListener("click", () => se.click());
          const Le = () => {
            Z.style.background = se.value, Y = se.value;
          };
          se.addEventListener("input", Le), se.addEventListener("change", Le);
        }
      }
      O.querySelector("#klavity-undo").addEventListener("click", () => A.undo()), O.querySelector("#klavity-clear-ann").addEventListener("click", () => A.clearAll());
      const _t = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function le(Z) {
        const se = Z.target;
        if (se && (se.tagName === "INPUT" || se.tagName === "TEXTAREA" || se.isContentEditable)) return;
        if (Z.key === "Escape") {
          Z.stopPropagation(), Re();
          return;
        }
        if ((Z.metaKey || Z.ctrlKey) && Z.key.toLowerCase() === "z") {
          Z.preventDefault(), A.undo();
          return;
        }
        if (Z.metaKey || Z.ctrlKey || Z.altKey) return;
        const Le = Z.key.toLowerCase();
        _t[Le] ? (Z.preventDefault(), Wt(_t[Le])) : Le === "u" && (Z.preventDefault(), A.undo());
      }
      function Re() {
        document.removeEventListener("keydown", le, { capture: !0 }), $e(T), Oo();
      }
      document.addEventListener("keydown", le, { capture: !0 }), Wt(ne), O.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        Pe(v), A.shapes.length ? G[v] = { w: M.width, h: M.height, shapes: A.shapes.map((Z) => ({ ...Z })) } : delete G[v], Re(), Te();
      }), O.querySelector("#klavity-cancel-ann").addEventListener("click", () => Re());
      function me(Z) {
        const se = M.getBoundingClientRect();
        return { x: (Z.clientX - se.left) / se.width * M.width, y: (Z.clientY - se.top) / se.height * M.height };
      }
      M.addEventListener("pointerdown", (Z) => {
        fe = !0;
        const se = me(Z);
        if ({ x: Ye, y: Qe } = se, ne === "pen" && (Be = [se]), ne === "text") {
          fe = !1;
          const Le = document.createElement("input");
          Le.style.cssText = `position:fixed;left:${Z.clientX}px;top:${Z.clientY}px;background:transparent;border:1px dashed ${Y};color:${Y};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Le), requestAnimationFrame(() => {
            document.body.contains(Le) && Le.focus();
          }), Le.addEventListener("blur", () => {
            Le.value.trim() && A.addShape({ type: "text", color: Y, x: Ye, y: Qe, text: Le.value.trim() }), $e(Le);
          }, { once: !0 }), Le.addEventListener("keydown", (dn) => {
            dn.key === "Enter" && Le.blur(), dn.stopPropagation();
          });
        }
      }), M.addEventListener("pointermove", (Z) => {
        fe && ne === "pen" && Be.push(me(Z));
      }), M.addEventListener("pointerup", (Z) => {
        if (!fe) return;
        fe = !1;
        const se = me(Z);
        ne === "pen" && Be.length > 1 ? A.addShape({ type: "pen", color: Y, points: Be }) : ne === "rect" ? A.addShape({ type: "rect", color: Y, x: Math.min(Ye, se.x), y: Math.min(Qe, se.y), w: Math.abs(se.x - Ye), h: Math.abs(se.y - Qe) }) : ne === "circle" ? A.addShape({ type: "circle", color: Y, x: (Ye + se.x) / 2, y: (Qe + se.y) / 2, rx: Math.abs(se.x - Ye) / 2, ry: Math.abs(se.y - Qe) / 2 }) : ne === "arrow" && A.addShape({ type: "arrow", color: Y, x1: Ye, y1: Qe, x2: se.x, y2: se.y });
      });
    }, E.src = R;
  }
  function sd(v, R) {
    const E = document.createElement("div");
    E.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const M = document.createElement("div");
    M.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = ee("check", { label: "Sent", size: 22 }), M.appendChild(A);
    const T = document.createElement("h2");
    T.textContent = "Report sent", M.appendChild(T);
    const O = document.createElement("p");
    if (O.textContent = n.thankYou || "We filed it and emailed you a copy.", M.appendChild(O), v) {
      const $ = document.createElement("div");
      $.className = "klavity-ref";
      const z = document.createElement("span");
      z.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = da(v), $.append(z, F);
      const B = pa(R);
      if (B) {
        const q = document.createElement("a");
        q.href = B, q.target = "_blank", q.rel = "noopener", q.textContent = "Open in Klavity", $.appendChild(q);
      }
      M.appendChild($);
    }
    E.appendChild(M), $e(Je), a.appendChild(E), So(M, ut);
  }
  function od(v, R, E) {
    const { copy: M, onLead: A } = E;
    te.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const O = document.createElement("h2");
    if (O.innerHTML = M.headline, T.appendChild(O), M.body) {
      const z = document.createElement("p");
      z.textContent = M.body, T.appendChild(z);
    }
    if (v) {
      const z = document.createElement("div");
      z.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = da(v), z.append(F, B);
      const q = pa(R);
      if (q) {
        const j = document.createElement("a");
        j.href = q, j.target = "_blank", j.rel = "noopener", j.textContent = "View in dashboard", z.appendChild(j);
      }
      T.appendChild(z);
    }
    const $ = () => So(te, lt);
    if (M.showEmail) {
      const z = document.createElement("div");
      z.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const B = document.createElement("button"), q = M.emailLabel;
      B.textContent = q;
      const j = document.createElement("div");
      j.className = "klavity-lead-err", j.setAttribute("role", "alert"), j.style.display = "none";
      const de = async () => {
        const Ue = F.value.trim();
        if (!Ue || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ue)) {
          j.textContent = "Please enter a valid email so we can reach you.", j.style.display = "block", F.focus();
          return;
        }
        B.disabled = !0, B.textContent = "Saving…", j.style.display = "none";
        try {
          A && await A(v, Ue);
        } catch (Y) {
          try {
            console.warn("[Klavity] lead capture failed:", (Y == null ? void 0 : Y.message) || Y);
          } catch {
          }
          j.textContent = "Couldn't save your email — please try again.", j.style.display = "block", B.disabled = !1, B.textContent = "Retry", F.focus();
          return;
        }
        const ne = document.createElement("div");
        ne.className = "klavity-thanks", ne.textContent = "Thanks — we'll be in touch.", $e(j), z.replaceWith(ne), M.showCta || $();
      };
      B.addEventListener("click", de), F.addEventListener("keydown", (Ue) => {
        Ue.key === "Enter" && de();
      }), z.append(F, B), T.appendChild(z), T.appendChild(j);
    }
    if (M.showCta && M.ctaUrl) {
      const z = document.createElement("a");
      z.className = "klavity-cta", z.href = M.ctaUrl, z.target = "_blank", z.rel = "noopener", z.textContent = M.ctaText, T.appendChild(z);
    }
    if (te.appendChild(T), !n.whiteLabel) {
      const z = document.createElement("div");
      z.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = Ec("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", z.append("Powered by ", F), te.appendChild(z);
    }
    !M.showEmail && !M.showCta && $();
  }
  if (t.autoCaptureOnOpen) {
    let v = 0;
    try {
      v = document.getElementsByTagName("*").length;
    } catch {
      v = 0;
    }
    if (v <= g) {
      if (l = !0, Te(), gf(t) === "screen")
        return (async () => {
          if (await gi({ viewport: !0 })) {
            l = !1, Te();
            return;
          }
          if (c.length) {
            l = !1, Te();
            return;
          }
          if (l = !0, Te(), t.onCaptureViewport) {
            To(null).catch(() => {
              l = !1, Te();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: T, quality: O, suggestSharp: $ } = Lt(A);
            l = !1, dt(T, O, void 0, !0, !!$), Tt(tr);
          }).catch(() => {
            l = !1, Te();
          });
        })(), vo;
      const R = () => {
        if (t.onCaptureViewport) {
          To(null).catch(() => {
            l = !1, Te();
          });
          return;
        }
        t.onCaptureFull().then((M) => {
          const { dataUrl: A, quality: T, suggestSharp: O } = Lt(M);
          l = !1, dt(A, T, void 0, !0, !!O), Tt(tr);
        }).catch(() => {
          l = !1, Te();
        });
      }, E = window.requestIdleCallback;
      typeof E == "function" ? E(() => R(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(R, 0));
    }
  }
  return vo;
}
function Mf(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), $e(r), $e(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    a = !0, i = d.clientX, s = d.clientY, $e(n);
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
async function ha(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return fa(r);
    } catch {
    }
  return fa(e);
}
function fa(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const Rf = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Af(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Tf(e) {
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
const _f = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function sr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function If(e) {
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
  } = e, o = sr(e.initials || Af(t)), h = i !== "none" ? Rf[i] : null, p = h ? `<span class="ksim-mark ${l ? _f[h.mark] : ""}" style="color:${sr(h.accent)}">${Tf(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${sr(r)}" alt="${sr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), x = `--ksim-persona:${sr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${sr(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${sr(t)}">${p}${m}${f}</span>`;
}
function Lf(e) {
  const t = document.createElement("template");
  return t.innerHTML = If(e).trim(), t.content.firstElementChild;
}
const Of = `
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
function Nf(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Of, t.appendChild(r);
}
function $s(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function Pf(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function Df(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", $s(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm";
        t.append("recording", $s(n.dataUrl), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return Pf(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function zf(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = Df({
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
        l.append("screenshot_thumbs", $s(u), "thumb.jpg");
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
const $f = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Ff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Uf(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Ff + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Bf(e) {
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
function qf(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function Ai(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Bf(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = qf(n);
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
const Wf = 180 * 1e3, jf = 50 * 1024 * 1024, Ac = {
  maxDurationMs: Wf,
  maxBytes: jf
}, Hf = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function Ks() {
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
function Vf(e, t = Hf) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Tc(e = Ks()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Yf() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function Gf(e = {}, t = Ks()) {
  var x, y, b, S, w, k, C, I, P, L, K, V;
  const r = { ...Ac, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? 24)), a = Vf(
    (x = t.MediaRecorder) != null && x.isTypeSupported ? (_) => t.MediaRecorder.isTypeSupported(_) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Yf(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0;
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0;
  let p = "idle";
  const u = (_) => {
    var ie;
    p = _;
    try {
      (ie = e.onState) == null || ie.call(e, _);
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
    for (const ie of [m, f])
      try {
        (_ = ie == null ? void 0 : ie.getTracks) == null || _.call(ie).forEach((Ae) => {
          var G;
          return (G = Ae.stop) == null ? void 0 : G.call(Ae);
        });
      } catch {
      }
  };
  try {
    let _ = function() {
      if (!he) {
        he = !0;
        try {
          We.state !== "inactive" && We.stop();
        } catch {
        }
      }
    };
    const ie = (y = m.getVideoTracks) == null ? void 0 : y.call(m)[0], Ae = ((b = ie == null ? void 0 : ie.getSettings) == null ? void 0 : b.call(ie)) ?? {}, G = Ae.width && Ae.height ? Ae.width / Ae.height : 16 / 9;
    l.width = 1280, l.height = Math.round(1280 / G);
    try {
      o.srcObject = m, await (((S = o.play) == null ? void 0 : S.call(o)) ?? Promise.resolve());
    } catch {
    }
    let J = null, Ee = !1, Se = !0;
    if (n || i)
      try {
        if (f = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((w = f.getVideoTracks) != null && w.call(f).length)) {
          Ee = !0, Se = !1;
          try {
            h.srcObject = f, await (((k = h.play) == null ? void 0 : k.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (J = ((C = f.getAudioTracks) == null ? void 0 : C.call(f)[0]) || null, J && (Se = !1));
      } catch (xe) {
        let De = !1;
        if (i && n)
          try {
            if (f = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), J = ((I = f.getAudioTracks) == null ? void 0 : I.call(f)[0]) || null, J) {
              Se = !1, De = !0;
              try {
                (P = e.onFallback) == null || P.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!De) {
          try {
            (L = e.onFallback) == null || L.call(e, (xe == null ? void 0 : xe.name) === "NotAllowedError" ? "permissions-policy" : (xe == null ? void 0 : xe.name) || "camera-mic-blocked");
          } catch {
          }
          Se = !0;
        }
      }
    const oe = !!J;
    let Q = 0;
    const ve = () => {
      if (Q = t.raf(ve), !d) return;
      const xe = l.width, De = l.height;
      if (o.videoWidth) {
        const Je = o.videoWidth / o.videoHeight, te = xe / De;
        let ue = xe, Dt = De, Ur = 0, qt = 0;
        Je > te ? (Dt = xe / Je, qt = (De - Dt) / 2) : (ue = De * Je, Ur = (xe - ue) / 2), d.fillStyle = "#000", d.fillRect(0, 0, xe, De), d.drawImage(o, Ur, qt, ue, Dt);
      }
      if (Ee && h.videoWidth) {
        const Je = Math.round(xe * 0.22), te = Math.round(Je * (h.videoHeight / h.videoWidth)), ue = xe - Je - 20, Dt = De - te - 20;
        d.drawImage(h, ue, Dt, Je, te), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(ue, Dt, Je, te);
      }
      p === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    ve();
    const D = l.captureStream(s), Ve = [(K = D.getVideoTracks) == null ? void 0 : K.call(D)[0]].filter(Boolean);
    J && Ve.push(J);
    const Fe = new t.MediaStream(Ve), We = new t.MediaRecorder(Fe, { mimeType: a, videoBitsPerSecond: 25e5, audioBitsPerSecond: 128e3 }), Me = [];
    let Ie = 0, ut = 0, lt = 0, H = 0, ae = 0, he = !1;
    const Ce = () => {
      if (p === "idle") return 0;
      const xe = t.now() - ut - lt;
      return Math.max(0, xe - (H ? t.now() - H : 0));
    };
    We.ondataavailable = (xe) => {
      var De;
      xe != null && xe.data && xe.data.size && (Me.push(xe.data), Ie += xe.data.size);
      try {
        (De = e.onStats) == null || De.call(e, { elapsedMs: Ce(), bytes: Ie });
      } catch {
      }
      Ie >= r.maxBytes && _();
    };
    let Pe;
    const ke = new Promise((xe) => {
      Pe = xe;
    }), Bt = g;
    We.onstop = () => {
      t.caf(Q), ae && (t.clearInterval(ae), ae = 0);
      const xe = Ce(), De = new Blob(Me, { type: a.split(";")[0] });
      Bt(), u("stopped"), Pe({
        id: c,
        blob: De,
        mime: De.type || a,
        durationMs: xe,
        bytes: De.size || Ie,
        width: l.width,
        height: l.height,
        screenOnly: Se,
        hadCamera: Ee,
        hadAudio: oe
      });
    };
    try {
      (V = ie == null ? void 0 : ie.addEventListener) == null || V.call(ie, "ended", () => _());
    } catch {
    }
    return We.start(1e3), ut = t.now(), u("recording"), ae = t.setInterval(() => {
      var De;
      const xe = Ce();
      try {
        (De = e.onStats) == null || De.call(e, { elapsedMs: xe, bytes: Ie });
      } catch {
      }
      xe >= r.maxDurationMs && _();
    }, 200), {
      pause() {
        if (p === "recording") {
          try {
            We.pause();
          } catch {
          }
          H = t.now(), u("paused");
        }
      },
      resume() {
        if (p === "paused") {
          try {
            We.resume();
          } catch {
          }
          lt += t.now() - H, H = 0, u("recording");
        }
      },
      stop() {
        _();
      },
      state() {
        return p;
      },
      screenOnly() {
        return Se;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Ee && f ? f : null;
      },
      done: ke
    };
  } catch (_) {
    throw g(), _;
  }
}
function Xf(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Kf(e) {
  return {
    id: e.id,
    dataUrl: await Xf(e.blob),
    mime: e.mime,
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Jf(e) {
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
async function Zf(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? Ks();
  return Tc(t) ? new Promise((r) => {
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
    }, x = (k) => `${(k / 1048576).toFixed(1)} MB`, y = { ...Ac, ...e.caps || {} }, b = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const k = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${k}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(y.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const C = i.querySelector("#klr-cam").checked, I = i.querySelector("#klr-mic").checked;
        S(C, I);
      };
    }, S = async (k, C) => {
      var P;
      let I = null;
      try {
        d = await Gf({
          wantCamera: k,
          wantMic: C,
          caps: e.caps,
          onFallback: (L) => {
            I = L;
          },
          onStats: ({ elapsedMs: L, bytes: K }) => {
            const V = i.querySelector("#klr-timer");
            V && (V.textContent = "REC " + g(L));
            const _ = i.querySelector("#klr-meta");
            _ && (_.innerHTML = `${g(Math.max(0, y.maxDurationMs - L))} left<br>~${x(K)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      w(I);
      try {
        const L = Jf((P = d == null ? void 0 : d.cameraStream) == null ? void 0 : P.call(d));
        L && n.appendChild(L);
      } catch {
      }
      d.done.then(async (L) => {
        f(await Kf(L));
      });
    }, w = (k) => {
      const C = k === "camera-blocked", P = C ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!k && !C ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:600;white-space:nowrap"><span aria-hidden="true" style="width:9px;height:9px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-pause" style="padding:7px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><button id="klr-stop" style="padding:7px 12px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Stop</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:right;white-space:nowrap"></span></div>' + P;
      const L = i.querySelector("#klr-pause");
      L.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), L.textContent = "Resume") : (d.resume(), L.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    b();
  }) : null;
}
async function ma(e, t = {}) {
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
async function Qf(e, t = {}) {
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
var em = Object.defineProperty, tm = (e, t, r) => t in e ? em(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, W = (e, t, r) => tm(e, typeof t != "symbol" ? t + "" : t, r), ga, rm = Object.defineProperty, nm = (e, t, r) => t in e ? rm(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ya = (e, t, r) => nm(e, typeof t != "symbol" ? t + "" : t, r), qe = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(qe || {});
const ba = {
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
}, va = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, wn = {}, _c = {}, im = () => !!globalThis.Zone;
function Js(e) {
  if (wn[e])
    return wn[e];
  const t = globalThis[e], r = t.prototype, n = e in ba ? ba[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in va ? va[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !im())
    return wn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), _c[e] = () => c.remove()) : c.remove(), wn[e] = d;
  } catch {
    return r;
  }
}
const Ti = {};
function Ft(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ti[i])
    return Ti[i].call(
      t
    );
  const s = Js(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Ti[i] = a, a.call(t)) : t[r];
}
const _i = {};
function Ic(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (_i[n])
    return _i[n].bind(
      t
    );
  const s = Js(e)[r];
  return typeof s != "function" ? t[r] : (_i[n] = s, s.bind(t));
}
function sm(e) {
  return Ft("Node", e, "ownerDocument");
}
function om(e) {
  return Ft("Node", e, "childNodes");
}
function am(e) {
  return Ft("Node", e, "parentNode");
}
function lm(e) {
  return Ft("Node", e, "parentElement");
}
function cm(e) {
  return Ft("Node", e, "textContent");
}
function um(e, t) {
  return Ic("Node", e, "contains")(t);
}
function dm(e) {
  return Ic("Node", e, "getRootNode")();
}
function pm(e) {
  return !e || !("host" in e) ? null : Ft("ShadowRoot", e, "host");
}
function hm(e) {
  return e.styleSheets;
}
function fm(e) {
  return !e || !("shadowRoot" in e) ? null : Ft("Element", e, "shadowRoot");
}
function mm(e, t) {
  return Ft("Element", e, "querySelector")(t);
}
function gm(e, t) {
  return Ft("Element", e, "querySelectorAll")(t);
}
function ym() {
  return [
    Js("MutationObserver").constructor,
    _c.MutationObserver ?? (() => {
    })
  ];
}
let Lc = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Lc = () => (/* @__PURE__ */ new Date()).getTime());
function bm(e, t, r) {
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
const Ke = {
  ownerDocument: sm,
  childNodes: om,
  parentNode: am,
  parentElement: lm,
  textContent: cm,
  contains: um,
  getRootNode: dm,
  host: pm,
  styleSheets: hm,
  shadowRoot: fm,
  querySelector: mm,
  querySelectorAll: gm,
  nowTimestamp: Lc,
  mutationObserverCtor: ym,
  patch: bm
};
function Oc(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Xr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Ke.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Ke.shadowRoot(t) === e);
}
function Kr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function vm(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function km(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Fs(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Nc(i, r)
    ).join("");
    return vm(n);
  } catch {
    return null;
  }
}
function Nc(e, t) {
  if (xm(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Fs(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      km(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? qn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Sm(e) && e.selectorText.includes(":") && (r = wm(r)), t ? qn(r, t) : r;
  }
}
function wm(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function xm(e) {
  return "styleSheet" in e;
}
function Sm(e) {
  return "selectorText" in e;
}
class Pc {
  constructor() {
    ya(this, "idNodeMap", /* @__PURE__ */ new Map()), ya(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Cm() {
  return new Pc();
}
function Un({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && pr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function pr(e) {
  return e.toLowerCase();
}
const ka = "__rrweb_original__";
function Em(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = ka in s ? s[ka] : s;
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
function Bn(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    pr(t)
  ) : null;
}
function Dc(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Mm(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Rm = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Am = /^(?:[a-z+]+:)?\/\//i, Tm = /^www\..*/i, _m = /^(data:)([^,]*),(.*)/i;
function qn(e, t) {
  return (e || "").replace(
    Rm,
    (r, n, i, s, a, c) => {
      const l = i || a || c, d = n || s || "";
      if (!l)
        return r;
      if (Am.test(l) || Tm.test(l))
        return `url(${d}${l}${d})`;
      if (_m.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${Mm(t) + l}${d})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const p of h)
        p !== "." && (p === ".." ? o.pop() : o.push(p));
      return `url(${d}${o.join("/")}${d})`;
    }
  );
}
function xn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Im(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = xn(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = xn(
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
              const g = xn(f).length;
              m = a.indexOf(p, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const g = xn(
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
function Lm(e, t) {
  return Im(e, t).join("/* rr_split */");
}
let Om = 1;
const Nm = new RegExp("[^a-z0-9-_:]"), tn = -2;
function zc() {
  return Om++;
}
function Pm(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = pr(e.tagName);
  return Nm.test(t) ? "div" : t;
}
let xr, wa;
const Dm = /^[^ \t\n\r\u000c]+/, zm = /^[, \t\n\r\u000c]+/;
function $m(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(zm), !(r >= t.length); ) {
    let s = n(Dm);
    if (s.slice(-1) === ",")
      s = Mr(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Mr(e, s);
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
const xa = /* @__PURE__ */ new WeakMap();
function Mr(e, t) {
  return !t || t.trim() === "" ? t : Zs(e, t);
}
function Fm(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Zs(e, t) {
  let r = xa.get(e);
  if (r || (r = e.createElement("a"), xa.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function $c(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Mr(e, n) : r === "srcset" ? $m(e, n) : r === "style" ? qn(n, Zs(e)) : t === "object" && r === "data" ? Mr(e, n) : n);
}
function Fc(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Um(e, t, r) {
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
function Wn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Wn(Ke.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Wn(Ke.parentNode(e), t, r) : !1;
}
function Uc(e, t, r, n) {
  let i;
  if (Oc(e)) {
    if (i = e, !Ke.childNodes(i).length)
      return !1;
  } else {
    if (Ke.parentElement(e) === null)
      return !1;
    i = Ke.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Wn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Bm(e, t, r) {
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
function qm(e, t, r) {
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
function Wm(e, t) {
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
  } = t, x = jm(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: qe.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: qe.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: qe.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return Vm(e, {
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
      return Hm(e, {
        doc: r,
        needsMask: a,
        maskTextFn: d,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: qe.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: qe.Comment,
        textContent: Ke.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function jm(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Hm(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = Ke.parentNode(e), c = a && a.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = Ke.textContent(e), d && l && (l = qn(l, Zs(t.doc)))), !d && !o && l && r && (l = n ? n(l, Ke.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: qe.Text,
    textContent: l || "",
    rootId: i
  };
}
function Vm(e, t) {
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
  } = t, m = Um(e, n, i), f = Pm(e);
  let g = {};
  const x = e.attributes.length;
  for (let b = 0; b < x; b++) {
    const S = e.attributes[b];
    Fc(f, S.name, S.value) || (g[S.name] = $c(
      r,
      f,
      pr(S.name),
      S.value
    ));
  }
  if (f === "link" && s) {
    const b = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let S = null;
    b && (S = Fs(b)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let b = Fs(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = Lm(b, e)), g._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && b ? g.value = Un({
      element: e,
      type: Bn(e),
      tagName: f,
      value: b,
      maskInputOptions: a,
      maskInputFn: c
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !a.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      Em(e) || (g.rr_dataURL = e.toDataURL(
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
    xr || (xr = r.createElement("canvas"), wa = xr.getContext("2d"));
    const b = e, S = b.currentSrc || b.getAttribute("src") || "<unknown-src>", w = b.crossOrigin, k = () => {
      b.removeEventListener("load", k);
      try {
        xr.width = b.naturalWidth, xr.height = b.naturalHeight, wa.drawImage(b, 0, 0), g.rr_dataURL = xr.toDataURL(
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
  let y;
  try {
    customElements.get(f) && (y = !0);
  } catch {
  }
  return {
    type: qe.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Fm(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: y
  };
}
function _e(e) {
  return e == null ? "" : e.toLowerCase();
}
function Bc(e) {
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
function Ym(e, t) {
  if (t.comment && e.type === qe.Comment)
    return !0;
  if (e.type === qe.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Dc(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (_e(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || _e(e.attributes.name) === "application-name" || _e(e.attributes.rel) === "icon" || _e(e.attributes.rel) === "apple-touch-icon" || _e(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && _e(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (_e(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      _e(e.attributes.name).match(/^(og|twitter):/) || _e(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (_e(e.attributes.name) === "robots" || _e(e.attributes.name) === "googlebot" || _e(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (_e(e.attributes.name) === "author" || _e(e.attributes.name) === "generator" || _e(e.attributes.name) === "framework" || _e(e.attributes.name) === "publisher" || _e(e.attributes.name) === "progid" || _e(e.attributes.property).match(/^article:/) || _e(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (_e(e.attributes.name) === "google-site-verification" || _e(e.attributes.name) === "yandex-verification" || _e(e.attributes.name) === "csrf-token" || _e(e.attributes.name) === "p:domain_verify" || _e(e.attributes.name) === "verify-v1" || _e(e.attributes.name) === "verification" || _e(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Rr(e, t) {
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
    onIframeLoad: y,
    iframeLoadTimeout: b = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: C = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: P } = t, { preserveWhiteSpace: L = !0 } = t;
  P || (P = Uc(
    e,
    a,
    c,
    P === void 0
  ));
  const K = Wm(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: P,
    inlineStylesheet: d,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: p,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: k,
    newlyAddedElement: C,
    cssCaptured: I
  });
  if (!K)
    return console.warn(e, "not serialized"), null;
  let V;
  n.hasNode(e) ? V = n.getId(e) : Ym(K, u) || !L && K.type === qe.Text && !K.textContent.replace(/^\s+|\s+$/gm, "").length ? V = tn : V = zc();
  const _ = Object.assign(K, { id: V });
  if (n.add(e, _), V === tn)
    return null;
  x && x(e);
  let ie = !l;
  if (_.type === qe.Element) {
    ie = ie && !_.needBlock, delete _.needBlock;
    const G = Ke.shadowRoot(e);
    G && Kr(G) && (_.isShadowHost = !0);
  }
  if ((_.type === qe.Document || _.type === qe.Element) && ie) {
    u.headWhitespace && _.type === qe.Element && _.tagName === "head" && (L = !1);
    const G = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: P,
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
      preserveWhiteSpace: L,
      onSerialize: x,
      onIframeLoad: y,
      iframeLoadTimeout: b,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(_.type === qe.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === qe.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (G.cssCaptured = !0);
      for (const Ee of Array.from(Ke.childNodes(e))) {
        const Se = Rr(Ee, G);
        Se && _.childNodes.push(Se);
      }
    }
    let J = null;
    if (Oc(e) && (J = Ke.shadowRoot(e)))
      for (const Ee of Array.from(Ke.childNodes(J))) {
        const Se = Rr(Ee, G);
        Se && (Kr(J) && (Se.isShadow = !0), _.childNodes.push(Se));
      }
  }
  const Ae = Ke.parentNode(e);
  return Ae && Xr(Ae) && Kr(Ae) && (_.isShadow = !0), _.type === qe.Element && _.tagName === "iframe" && Bm(
    e,
    () => {
      const G = e.contentDocument;
      if (G && y) {
        const J = Rr(G, {
          doc: G,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: P,
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
          preserveWhiteSpace: L,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: b,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        J && y(
          e,
          J
        );
      }
    },
    b
  ), _.type === qe.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && Dc(_.attributes.href) === "css") && qm(
    e,
    () => {
      if (S) {
        const G = Rr(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: P,
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
          preserveWhiteSpace: L,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: b,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        G && S(
          e,
          G
        );
      }
    },
    w
  ), _;
}
function Gm(e, t) {
  const {
    mirror: r = new Pc(),
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
    iframeLoadTimeout: y,
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
  } : o, C = Bc(u);
  return Rr(e, {
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
    iframeLoadTimeout: y,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function Xm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Km(e) {
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
var Sn = { exports: {} }, Sa;
function Jm() {
  if (Sa) return Sn.exports;
  Sa = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Sn.exports = t(), Sn.exports.createColors = t, Sn.exports;
}
const Zm = {}, Qm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Zm
}, Symbol.toStringTag, { value: "Module" })), Et = /* @__PURE__ */ Km(Qm);
var Ii, Ca;
function Qs() {
  if (Ca) return Ii;
  Ca = 1;
  let e = /* @__PURE__ */ Jm(), t = Et;
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
  return Ii = r, r.default = r, Ii;
}
var Cn = {}, Ea;
function eo() {
  return Ea || (Ea = 1, Cn.isClean = Symbol("isClean"), Cn.my = Symbol("my")), Cn;
}
var Li, Ma;
function qc() {
  if (Ma) return Li;
  Ma = 1;
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
  return Li = r, r.default = r, Li;
}
var Oi, Ra;
function Qn() {
  if (Ra) return Oi;
  Ra = 1;
  let e = qc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Oi = t, t.default = t, Oi;
}
var Ni, Aa;
function ei() {
  if (Aa) return Ni;
  Aa = 1;
  let { isClean: e, my: t } = eo(), r = Qs(), n = qc(), i = Qn();
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
  return Ni = a, a.default = a, Ni;
}
var Pi, Ta;
function ti() {
  if (Ta) return Pi;
  Ta = 1;
  let e = ei();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Pi = t, t.default = t, Pi;
}
var Di, _a;
function eg() {
  if (_a) return Di;
  _a = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Di = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Di;
}
var zi, Ia;
function Wc() {
  if (Ia) return zi;
  Ia = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Et, { existsSync: r, readFileSync: n } = Et, { dirname: i, join: s } = Et;
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
  return zi = c, c.default = c, zi;
}
var $i, La;
function ri() {
  if (La) return $i;
  La = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Et, { fileURLToPath: r, pathToFileURL: n } = Et, { isAbsolute: i, resolve: s } = Et, { nanoid: a } = /* @__PURE__ */ eg(), c = Et, l = Qs(), d = Wc(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!p || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), p && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let b, S, w;
      if (g && typeof g == "object") {
        let C = g, I = x;
        if (typeof C.offset == "number") {
          let P = this.fromOffset(C.offset);
          g = P.line, x = P.col;
        } else
          g = C.line, x = C.column;
        if (typeof I.offset == "number") {
          let P = this.fromOffset(I.offset);
          S = P.line, w = P.col;
        } else
          S = I.line, w = I.column;
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
        y.plugin
      ) : b = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        y.plugin
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
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let b = x.length - 2, S;
        for (; y < b; )
          if (S = y + (b - y >> 1), f < x[S])
            b = S - 1;
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
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let b = this.map.consumer(), S = b.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: y, line: x }));
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
      let I = b.sourceContentFor(S.source);
      return I && (C.source = I), C;
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
  return $i = u, u.default = u, c && c.registerInput && c.registerInput(u), $i;
}
var Fi, Oa;
function jc() {
  if (Oa) return Fi;
  Oa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Et, { dirname: r, relative: n, resolve: i, sep: s } = Et, { pathToFileURL: a } = Et, c = ri(), l = !!(e && t), d = !!(r && i && n && s);
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
      this.stringify(this.root, (y, b, S) => {
        if (this.css += y, b && S !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (p += g.length, x = y.lastIndexOf(`
`), u = y.length - x) : u += y.length, b && S !== "start") {
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
  return Fi = o, Fi;
}
var Ui, Na;
function ni() {
  if (Na) return Ui;
  Na = 1;
  let e = ei();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ui = t, t.default = t, Ui;
}
var Bi, Pa;
function hr() {
  if (Pa) return Bi;
  Pa = 1;
  let { isClean: e, my: t } = eo(), r = ti(), n = ni(), i = ei(), s, a, c, l;
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
      for (let b of x) this.proxyOf.nodes.splice(f, 0, b);
      let y;
      for (let b in this.indexes)
        y = this.indexes[b], f <= y && (this.indexes[b] = y + x.length);
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
  }, Bi = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Bi;
}
var qi, Da;
function to() {
  if (Da) return qi;
  Da = 1;
  let e = hr(), t, r;
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
  }, qi = n, n.default = n, qi;
}
var Wi, za;
function Hc() {
  if (za) return Wi;
  za = 1;
  let e = {};
  return Wi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Wi;
}
var ji, $a;
function Vc() {
  if ($a) return ji;
  $a = 1;
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
  return ji = e, e.default = e, ji;
}
var Hi, Fa;
function ro() {
  if (Fa) return Hi;
  Fa = 1;
  let e = Vc();
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
  return Hi = t, t.default = t, Hi;
}
var Vi, Ua;
function tg() {
  if (Ua) return Vi;
  Ua = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, y = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return Vi = function(I, P = {}) {
    let L = I.css.valueOf(), K = P.ignoreErrors, V, _, ie, Ae, G, J, Ee, Se, oe, Q, ve = L.length, D = 0, Ve = [], Fe = [];
    function We() {
      return D;
    }
    function Me(H) {
      throw I.error("Unclosed " + H, D);
    }
    function Ie() {
      return Fe.length === 0 && D >= ve;
    }
    function ut(H) {
      if (Fe.length) return Fe.pop();
      if (D >= ve) return;
      let ae = H ? H.ignoreUnclosed : !1;
      switch (V = L.charCodeAt(D), V) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = D;
          do
            _ += 1, V = L.charCodeAt(_);
          while (V === s || V === i || V === c || V === l || V === a);
          Q = ["space", L.slice(D, _)], D = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let he = String.fromCharCode(V);
          Q = [he, he, D];
          break;
        }
        case h: {
          if (Se = Ve.length ? Ve.pop()[1] : "", oe = L.charCodeAt(D + 1), Se === "url" && oe !== e && oe !== t && oe !== s && oe !== i && oe !== c && oe !== a && oe !== l) {
            _ = D;
            do {
              if (J = !1, _ = L.indexOf(")", _ + 1), _ === -1)
                if (K || ae) {
                  _ = D;
                  break;
                } else
                  Me("bracket");
              for (Ee = _; L.charCodeAt(Ee - 1) === r; )
                Ee -= 1, J = !J;
            } while (J);
            Q = ["brackets", L.slice(D, _ + 1), D, _], D = _;
          } else
            _ = L.indexOf(")", D + 1), Ae = L.slice(D, _ + 1), _ === -1 || w.test(Ae) ? Q = ["(", "(", D] : (Q = ["brackets", Ae, D, _], D = _);
          break;
        }
        case e:
        case t: {
          ie = V === e ? "'" : '"', _ = D;
          do {
            if (J = !1, _ = L.indexOf(ie, _ + 1), _ === -1)
              if (K || ae) {
                _ = D + 1;
                break;
              } else
                Me("string");
            for (Ee = _; L.charCodeAt(Ee - 1) === r; )
              Ee -= 1, J = !J;
          } while (J);
          Q = ["string", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        case y: {
          b.lastIndex = D + 1, b.test(L), b.lastIndex === 0 ? _ = L.length - 1 : _ = b.lastIndex - 2, Q = ["at-word", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        case r: {
          for (_ = D, G = !0; L.charCodeAt(_ + 1) === r; )
            _ += 1, G = !G;
          if (V = L.charCodeAt(_ + 1), G && V !== n && V !== s && V !== i && V !== c && V !== l && V !== a && (_ += 1, k.test(L.charAt(_)))) {
            for (; k.test(L.charAt(_ + 1)); )
              _ += 1;
            L.charCodeAt(_ + 1) === s && (_ += 1);
          }
          Q = ["word", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        default: {
          V === n && L.charCodeAt(D + 1) === g ? (_ = L.indexOf("*/", D + 2) + 1, _ === 0 && (K || ae ? _ = L.length : Me("comment")), Q = ["comment", L.slice(D, _ + 1), D, _], D = _) : (S.lastIndex = D + 1, S.test(L), S.lastIndex === 0 ? _ = L.length - 1 : _ = S.lastIndex - 2, Q = ["word", L.slice(D, _ + 1), D, _], Ve.push(Q), D = _);
          break;
        }
      }
      return D++, Q;
    }
    function lt(H) {
      Fe.push(H);
    }
    return {
      back: lt,
      endOfFile: Ie,
      nextToken: ut,
      position: We
    };
  }, Vi;
}
var Yi, Ba;
function no() {
  if (Ba) return Yi;
  Ba = 1;
  let e = hr();
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
  return Yi = t, t.default = t, e.registerAtRule(t), Yi;
}
var Gi, qa;
function on() {
  if (qa) return Gi;
  qa = 1;
  let e = hr(), t, r;
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
  }, Gi = n, n.default = n, e.registerRoot(n), Gi;
}
var Xi, Wa;
function Yc() {
  if (Wa) return Xi;
  Wa = 1;
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
  return Xi = e, e.default = e, Xi;
}
var Ki, ja;
function io() {
  if (ja) return Ki;
  ja = 1;
  let e = hr(), t = Yc();
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
  return Ki = r, r.default = r, e.registerRule(r), Ki;
}
var Ji, Ha;
function rg() {
  if (Ha) return Ji;
  Ha = 1;
  let e = ti(), t = tg(), r = ni(), n = no(), i = on(), s = io();
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
      let p, u, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? y.push(p === "(" ? ")" : "]") : p === "{" && y.length > 0 ? y.push("}") : p === y[y.length - 1] && y.pop(), y.length === 0)
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
        let y = o[0][0];
        if (y === ":" || y === "space" || y === "comment")
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
      for (let y = o.length - 1; y >= 0; y--) {
        if (m = o[y], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, y);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), S = "";
          for (let w = y; w > 0; w--) {
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
      o.some((y) => y[0] !== "space" && y[0] !== "comment") && (p.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(p, "value", f.concat(o), h), p.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, p = null, u = !1, m = null, f = [], g = o[1].startsWith("--"), x = [], y = o;
      for (; y; ) {
        if (p = y[0], x.push(y), p === "(" || p === "[")
          m || (m = y), f.push(p === "(" ? ")" : "]");
        else if (g && u && p === "{")
          m || (m = y), f.push("}");
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
      let m, f, g = p.length, x = "", y = !0, b, S;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? y = !1 : f === "comment" ? (S = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[S] && !a[b] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
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
  return Ji = l, Ji;
}
var Zi, Va;
function so() {
  if (Va) return Zi;
  Va = 1;
  let e = hr(), t = rg(), r = ri();
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
  return Zi = n, n.default = n, e.registerParse(n), Zi;
}
var Qi, Ya;
function Gc() {
  if (Ya) return Qi;
  Ya = 1;
  let { isClean: e, my: t } = eo(), r = jc(), n = Qn(), i = hr(), s = to(), a = Hc(), c = ro(), l = so(), d = on();
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
  let y = {};
  class b {
    constructor(w, k, C) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = x(k);
      else if (k instanceof b || k instanceof c)
        I = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let P = l;
        C.syntax && (P = C.syntax.parse), C.parser && (P = C.parser), P.parse && (P = P.parse);
        try {
          I = P(k, C);
        } catch (L) {
          this.processed = !0, this.error = L;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, C), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
          let I = C.postcssPlugin, P = C.postcssVersion, L = this.result.processor.version, K = P.split("."), V = L.split(".");
          (K[0] !== V[0] || parseInt(K[1]) > parseInt(V[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + L + ", but " + I + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, C, I) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, I]);
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
                for (let I in k[C])
                  I === "*" ? w(k, C, k[C][I]) : w(
                    k,
                    C + "-" + I.toLowerCase(),
                    k[C][I]
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
          } catch (I) {
            throw this.handleError(I);
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
              } catch (I) {
                let P = k[k.length - 1].node;
                throw this.handleError(I, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  (P) => C(P, this.helpers)
                );
                await Promise.all(I);
              } else
                await C(w, this.helpers);
            } catch (I) {
              throw this.handleError(I);
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
      let I = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
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
      for (let [C, I] of w) {
        this.result.lastPlugin = C;
        let P;
        try {
          P = I(k, this.helpers);
        } catch (L) {
          throw this.handleError(L, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(P))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: C, visitors: I } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [L, K] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = L;
        try {
          return K(C.toProxy(), this.helpers);
        } catch (V) {
          throw this.handleError(V, C);
        }
      }
      if (k.iterator !== 0) {
        let L = k.iterator, K;
        for (; K = C.nodes[C.indexes[L]]; )
          if (C.indexes[L] += 1, !K[e]) {
            K[e] = !0, w.push(g(K));
            return;
          }
        k.iterator = 0, delete C.indexes[L];
      }
      let P = k.events;
      for (; k.eventIndex < P.length; ) {
        let L = P[k.eventIndex];
        if (k.eventIndex += 1, L === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[L]) {
          k.visitors = this.listeners[L];
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
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[C];
          if (I && this.visitSync(I, w.toProxy()))
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
    y = S;
  }, Qi = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), Qi;
}
var es, Ga;
function ng() {
  if (Ga) return es;
  Ga = 1;
  let e = jc(), t = Qn(), r = Hc(), n = so();
  const i = ro();
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
  return es = s, s.default = s, es;
}
var ts, Xa;
function ig() {
  if (Xa) return ts;
  Xa = 1;
  let e = ng(), t = Gc(), r = to(), n = on();
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
  return ts = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ts;
}
var rs, Ka;
function sg() {
  if (Ka) return rs;
  Ka = 1;
  let e = ti(), t = Wc(), r = ni(), n = no(), i = ri(), s = on(), a = io();
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
  return rs = c, c.default = c, rs;
}
var ns, Ja;
function og() {
  if (Ja) return ns;
  Ja = 1;
  let e = Qs(), t = ti(), r = Gc(), n = hr(), i = ig(), s = Qn(), a = sg(), c = to(), l = Vc(), d = ni(), o = no(), h = ro(), p = ri(), u = so(), m = Yc(), f = io(), g = on(), x = ei();
  function y(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return y.plugin = function(S, w) {
    let k = !1;
    function C(...P) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let L = w(...P);
      return L.postcssPlugin = S, L.postcssVersion = new i().version, L;
    }
    let I;
    return Object.defineProperty(C, "postcss", {
      get() {
        return I || (I = C()), I;
      }
    }), C.process = function(P, L, K) {
      return y([C(K)]).process(P, L);
    }, C;
  }, y.stringify = s, y.parse = u, y.fromJSON = a, y.list = m, y.comment = (b) => new d(b), y.atRule = (b) => new o(b), y.decl = (b) => new t(b), y.rule = (b) => new f(b), y.root = (b) => new g(b), y.document = (b) => new c(b), y.CssSyntaxError = e, y.Declaration = t, y.Container = n, y.Processor = i, y.Document = c, y.Comment = d, y.Warning = l, y.AtRule = o, y.Result = h, y.Input = p, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), ns = y, y.default = y, ns;
}
var ag = og();
const Oe = /* @__PURE__ */ Xm(ag);
Oe.stringify;
Oe.fromJSON;
Oe.plugin;
Oe.parse;
Oe.list;
Oe.document;
Oe.comment;
Oe.atRule;
Oe.rule;
Oe.decl;
Oe.root;
Oe.CssSyntaxError;
Oe.Declaration;
Oe.Container;
Oe.Processor;
Oe.Document;
Oe.Comment;
Oe.Warning;
Oe.AtRule;
Oe.Result;
Oe.Input;
Oe.Rule;
Oe.Root;
Oe.Node;
var lg = Object.defineProperty, cg = (e, t, r) => t in e ? lg(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, pt = (e, t, r) => cg(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function ug(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function dg(e) {
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
var En = { exports: {} }, Za;
function pg() {
  if (Za) return En.exports;
  Za = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return En.exports = t(), En.exports.createColors = t, En.exports;
}
const hg = {}, fg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: hg
}, Symbol.toStringTag, { value: "Module" })), Mt = /* @__PURE__ */ dg(fg);
var is, Qa;
function oo() {
  if (Qa) return is;
  Qa = 1;
  let e = /* @__PURE__ */ pg(), t = Mt;
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
  return is = r, r.default = r, is;
}
var Mn = {}, el;
function ao() {
  return el || (el = 1, Mn.isClean = Symbol("isClean"), Mn.my = Symbol("my")), Mn;
}
var ss, tl;
function Xc() {
  if (tl) return ss;
  tl = 1;
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
  return ss = r, r.default = r, ss;
}
var os, rl;
function ii() {
  if (rl) return os;
  rl = 1;
  let e = Xc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return os = t, t.default = t, os;
}
var as, nl;
function si() {
  if (nl) return as;
  nl = 1;
  let { isClean: e, my: t } = ao(), r = oo(), n = Xc(), i = ii();
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
  return as = a, a.default = a, as;
}
var ls, il;
function oi() {
  if (il) return ls;
  il = 1;
  let e = si();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ls = t, t.default = t, ls;
}
var cs, sl;
function mg() {
  if (sl) return cs;
  sl = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return cs = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, cs;
}
var us, ol;
function Kc() {
  if (ol) return us;
  ol = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Mt, { existsSync: r, readFileSync: n } = Mt, { dirname: i, join: s } = Mt;
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
  return us = c, c.default = c, us;
}
var ds, al;
function ai() {
  if (al) return ds;
  al = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Mt, { fileURLToPath: r, pathToFileURL: n } = Mt, { isAbsolute: i, resolve: s } = Mt, { nanoid: a } = /* @__PURE__ */ mg(), c = Mt, l = oo(), d = Kc(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!p || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), p && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let b, S, w;
      if (g && typeof g == "object") {
        let C = g, I = x;
        if (typeof C.offset == "number") {
          let P = this.fromOffset(C.offset);
          g = P.line, x = P.col;
        } else
          g = C.line, x = C.column;
        if (typeof I.offset == "number") {
          let P = this.fromOffset(I.offset);
          S = P.line, w = P.col;
        } else
          S = I.line, w = I.column;
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
        y.plugin
      ) : b = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        y.plugin
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
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let b = x.length - 2, S;
        for (; y < b; )
          if (S = y + (b - y >> 1), f < x[S])
            b = S - 1;
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
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let b = this.map.consumer(), S = b.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: y, line: x }));
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
      let I = b.sourceContentFor(S.source);
      return I && (C.source = I), C;
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
  return ds = u, u.default = u, c && c.registerInput && c.registerInput(u), ds;
}
var ps, ll;
function Jc() {
  if (ll) return ps;
  ll = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Mt, { dirname: r, relative: n, resolve: i, sep: s } = Mt, { pathToFileURL: a } = Mt, c = ai(), l = !!(e && t), d = !!(r && i && n && s);
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
      this.stringify(this.root, (y, b, S) => {
        if (this.css += y, b && S !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (p += g.length, x = y.lastIndexOf(`
`), u = y.length - x) : u += y.length, b && S !== "start") {
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
  return ps = o, ps;
}
var hs, cl;
function li() {
  if (cl) return hs;
  cl = 1;
  let e = si();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return hs = t, t.default = t, hs;
}
var fs, ul;
function fr() {
  if (ul) return fs;
  ul = 1;
  let { isClean: e, my: t } = ao(), r = oi(), n = li(), i = si(), s, a, c, l;
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
      for (let b of x) this.proxyOf.nodes.splice(f, 0, b);
      let y;
      for (let b in this.indexes)
        y = this.indexes[b], f <= y && (this.indexes[b] = y + x.length);
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
  }, fs = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, fs;
}
var ms, dl;
function lo() {
  if (dl) return ms;
  dl = 1;
  let e = fr(), t, r;
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
  }, ms = n, n.default = n, ms;
}
var gs, pl;
function Zc() {
  if (pl) return gs;
  pl = 1;
  let e = {};
  return gs = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, gs;
}
var ys, hl;
function Qc() {
  if (hl) return ys;
  hl = 1;
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
  return ys = e, e.default = e, ys;
}
var bs, fl;
function co() {
  if (fl) return bs;
  fl = 1;
  let e = Qc();
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
  return bs = t, t.default = t, bs;
}
var vs, ml;
function gg() {
  if (ml) return vs;
  ml = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, y = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return vs = function(I, P = {}) {
    let L = I.css.valueOf(), K = P.ignoreErrors, V, _, ie, Ae, G, J, Ee, Se, oe, Q, ve = L.length, D = 0, Ve = [], Fe = [];
    function We() {
      return D;
    }
    function Me(H) {
      throw I.error("Unclosed " + H, D);
    }
    function Ie() {
      return Fe.length === 0 && D >= ve;
    }
    function ut(H) {
      if (Fe.length) return Fe.pop();
      if (D >= ve) return;
      let ae = H ? H.ignoreUnclosed : !1;
      switch (V = L.charCodeAt(D), V) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = D;
          do
            _ += 1, V = L.charCodeAt(_);
          while (V === s || V === i || V === c || V === l || V === a);
          Q = ["space", L.slice(D, _)], D = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let he = String.fromCharCode(V);
          Q = [he, he, D];
          break;
        }
        case h: {
          if (Se = Ve.length ? Ve.pop()[1] : "", oe = L.charCodeAt(D + 1), Se === "url" && oe !== e && oe !== t && oe !== s && oe !== i && oe !== c && oe !== a && oe !== l) {
            _ = D;
            do {
              if (J = !1, _ = L.indexOf(")", _ + 1), _ === -1)
                if (K || ae) {
                  _ = D;
                  break;
                } else
                  Me("bracket");
              for (Ee = _; L.charCodeAt(Ee - 1) === r; )
                Ee -= 1, J = !J;
            } while (J);
            Q = ["brackets", L.slice(D, _ + 1), D, _], D = _;
          } else
            _ = L.indexOf(")", D + 1), Ae = L.slice(D, _ + 1), _ === -1 || w.test(Ae) ? Q = ["(", "(", D] : (Q = ["brackets", Ae, D, _], D = _);
          break;
        }
        case e:
        case t: {
          ie = V === e ? "'" : '"', _ = D;
          do {
            if (J = !1, _ = L.indexOf(ie, _ + 1), _ === -1)
              if (K || ae) {
                _ = D + 1;
                break;
              } else
                Me("string");
            for (Ee = _; L.charCodeAt(Ee - 1) === r; )
              Ee -= 1, J = !J;
          } while (J);
          Q = ["string", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        case y: {
          b.lastIndex = D + 1, b.test(L), b.lastIndex === 0 ? _ = L.length - 1 : _ = b.lastIndex - 2, Q = ["at-word", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        case r: {
          for (_ = D, G = !0; L.charCodeAt(_ + 1) === r; )
            _ += 1, G = !G;
          if (V = L.charCodeAt(_ + 1), G && V !== n && V !== s && V !== i && V !== c && V !== l && V !== a && (_ += 1, k.test(L.charAt(_)))) {
            for (; k.test(L.charAt(_ + 1)); )
              _ += 1;
            L.charCodeAt(_ + 1) === s && (_ += 1);
          }
          Q = ["word", L.slice(D, _ + 1), D, _], D = _;
          break;
        }
        default: {
          V === n && L.charCodeAt(D + 1) === g ? (_ = L.indexOf("*/", D + 2) + 1, _ === 0 && (K || ae ? _ = L.length : Me("comment")), Q = ["comment", L.slice(D, _ + 1), D, _], D = _) : (S.lastIndex = D + 1, S.test(L), S.lastIndex === 0 ? _ = L.length - 1 : _ = S.lastIndex - 2, Q = ["word", L.slice(D, _ + 1), D, _], Ve.push(Q), D = _);
          break;
        }
      }
      return D++, Q;
    }
    function lt(H) {
      Fe.push(H);
    }
    return {
      back: lt,
      endOfFile: Ie,
      nextToken: ut,
      position: We
    };
  }, vs;
}
var ks, gl;
function uo() {
  if (gl) return ks;
  gl = 1;
  let e = fr();
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
  return ks = t, t.default = t, e.registerAtRule(t), ks;
}
var ws, yl;
function an() {
  if (yl) return ws;
  yl = 1;
  let e = fr(), t, r;
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
  }, ws = n, n.default = n, e.registerRoot(n), ws;
}
var xs, bl;
function eu() {
  if (bl) return xs;
  bl = 1;
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
  return xs = e, e.default = e, xs;
}
var Ss, vl;
function po() {
  if (vl) return Ss;
  vl = 1;
  let e = fr(), t = eu();
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
  return Ss = r, r.default = r, e.registerRule(r), Ss;
}
var Cs, kl;
function yg() {
  if (kl) return Cs;
  kl = 1;
  let e = oi(), t = gg(), r = li(), n = uo(), i = an(), s = po();
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
      let p, u, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? y.push(p === "(" ? ")" : "]") : p === "{" && y.length > 0 ? y.push("}") : p === y[y.length - 1] && y.pop(), y.length === 0)
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
        let y = o[0][0];
        if (y === ":" || y === "space" || y === "comment")
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
      for (let y = o.length - 1; y >= 0; y--) {
        if (m = o[y], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, y);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), S = "";
          for (let w = y; w > 0; w--) {
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
      o.some((y) => y[0] !== "space" && y[0] !== "comment") && (p.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(p, "value", f.concat(o), h), p.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, p = null, u = !1, m = null, f = [], g = o[1].startsWith("--"), x = [], y = o;
      for (; y; ) {
        if (p = y[0], x.push(y), p === "(" || p === "[")
          m || (m = y), f.push(p === "(" ? ")" : "]");
        else if (g && u && p === "{")
          m || (m = y), f.push("}");
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
      let m, f, g = p.length, x = "", y = !0, b, S;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? y = !1 : f === "comment" ? (S = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[S] && !a[b] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
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
  return Cs = l, Cs;
}
var Es, wl;
function ho() {
  if (wl) return Es;
  wl = 1;
  let e = fr(), t = yg(), r = ai();
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
  return Es = n, n.default = n, e.registerParse(n), Es;
}
var Ms, xl;
function tu() {
  if (xl) return Ms;
  xl = 1;
  let { isClean: e, my: t } = ao(), r = Jc(), n = ii(), i = fr(), s = lo(), a = Zc(), c = co(), l = ho(), d = an();
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
  let y = {};
  class b {
    constructor(w, k, C) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = x(k);
      else if (k instanceof b || k instanceof c)
        I = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let P = l;
        C.syntax && (P = C.syntax.parse), C.parser && (P = C.parser), P.parse && (P = P.parse);
        try {
          I = P(k, C);
        } catch (L) {
          this.processed = !0, this.error = L;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, C), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
          let I = C.postcssPlugin, P = C.postcssVersion, L = this.result.processor.version, K = P.split("."), V = L.split(".");
          (K[0] !== V[0] || parseInt(K[1]) > parseInt(V[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + L + ", but " + I + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, C, I) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, I]);
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
                for (let I in k[C])
                  I === "*" ? w(k, C, k[C][I]) : w(
                    k,
                    C + "-" + I.toLowerCase(),
                    k[C][I]
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
          } catch (I) {
            throw this.handleError(I);
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
              } catch (I) {
                let P = k[k.length - 1].node;
                throw this.handleError(I, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  (P) => C(P, this.helpers)
                );
                await Promise.all(I);
              } else
                await C(w, this.helpers);
            } catch (I) {
              throw this.handleError(I);
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
      let I = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
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
      for (let [C, I] of w) {
        this.result.lastPlugin = C;
        let P;
        try {
          P = I(k, this.helpers);
        } catch (L) {
          throw this.handleError(L, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(P))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: C, visitors: I } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [L, K] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = L;
        try {
          return K(C.toProxy(), this.helpers);
        } catch (V) {
          throw this.handleError(V, C);
        }
      }
      if (k.iterator !== 0) {
        let L = k.iterator, K;
        for (; K = C.nodes[C.indexes[L]]; )
          if (C.indexes[L] += 1, !K[e]) {
            K[e] = !0, w.push(g(K));
            return;
          }
        k.iterator = 0, delete C.indexes[L];
      }
      let P = k.events;
      for (; k.eventIndex < P.length; ) {
        let L = P[k.eventIndex];
        if (k.eventIndex += 1, L === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[L]) {
          k.visitors = this.listeners[L];
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
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[C];
          if (I && this.visitSync(I, w.toProxy()))
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
    y = S;
  }, Ms = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), Ms;
}
var Rs, Sl;
function bg() {
  if (Sl) return Rs;
  Sl = 1;
  let e = Jc(), t = ii(), r = Zc(), n = ho();
  const i = co();
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
  return Rs = s, s.default = s, Rs;
}
var As, Cl;
function vg() {
  if (Cl) return As;
  Cl = 1;
  let e = bg(), t = tu(), r = lo(), n = an();
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
  return As = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), As;
}
var Ts, El;
function kg() {
  if (El) return Ts;
  El = 1;
  let e = oi(), t = Kc(), r = li(), n = uo(), i = ai(), s = an(), a = po();
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
  return Ts = c, c.default = c, Ts;
}
var _s, Ml;
function wg() {
  if (Ml) return _s;
  Ml = 1;
  let e = oo(), t = oi(), r = tu(), n = fr(), i = vg(), s = ii(), a = kg(), c = lo(), l = Qc(), d = li(), o = uo(), h = co(), p = ai(), u = ho(), m = eu(), f = po(), g = an(), x = si();
  function y(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return y.plugin = function(S, w) {
    let k = !1;
    function C(...P) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let L = w(...P);
      return L.postcssPlugin = S, L.postcssVersion = new i().version, L;
    }
    let I;
    return Object.defineProperty(C, "postcss", {
      get() {
        return I || (I = C()), I;
      }
    }), C.process = function(P, L, K) {
      return y([C(K)]).process(P, L);
    }, C;
  }, y.stringify = s, y.parse = u, y.fromJSON = a, y.list = m, y.comment = (b) => new d(b), y.atRule = (b) => new o(b), y.decl = (b) => new t(b), y.rule = (b) => new f(b), y.root = (b) => new g(b), y.document = (b) => new c(b), y.CssSyntaxError = e, y.Declaration = t, y.Container = n, y.Processor = i, y.Document = c, y.Comment = d, y.Warning = l, y.AtRule = o, y.Result = h, y.Input = p, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), _s = y, y.default = y, _s;
}
var xg = wg();
const Ne = /* @__PURE__ */ ug(xg);
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
class fo {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    pt(this, "parentElement", null), pt(this, "parentNode", null), pt(this, "ownerDocument"), pt(this, "firstChild", null), pt(this, "lastChild", null), pt(this, "previousSibling", null), pt(this, "nextSibling", null), pt(this, "ELEMENT_NODE", 1), pt(this, "TEXT_NODE", 3), pt(this, "nodeType"), pt(this, "nodeName"), pt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof fo) {
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
const Rl = {
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
}, Al = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Rn = {}, ru = {}, Sg = () => !!globalThis.Zone;
function mo(e) {
  if (Rn[e])
    return Rn[e];
  const t = globalThis[e], r = t.prototype, n = e in Rl ? Rl[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in Al ? Al[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Sg())
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
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), ru[e] = () => c.remove()) : c.remove(), Rn[e] = d;
  } catch {
    return r;
  }
}
const Is = {};
function Ut(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Is[i])
    return Is[i].call(
      t
    );
  const s = mo(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Is[i] = a, a.call(t)) : t[r];
}
const Ls = {};
function nu(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Ls[n])
    return Ls[n].bind(
      t
    );
  const s = mo(e)[r];
  return typeof s != "function" ? t[r] : (Ls[n] = s, s.bind(t));
}
function Cg(e) {
  return Ut("Node", e, "ownerDocument");
}
function Eg(e) {
  return Ut("Node", e, "childNodes");
}
function Mg(e) {
  return Ut("Node", e, "parentNode");
}
function Rg(e) {
  return Ut("Node", e, "parentElement");
}
function Ag(e) {
  return Ut("Node", e, "textContent");
}
function Tg(e, t) {
  return nu("Node", e, "contains")(t);
}
function _g(e) {
  return nu("Node", e, "getRootNode")();
}
function Ig(e) {
  return !e || !("host" in e) ? null : Ut("ShadowRoot", e, "host");
}
function Lg(e) {
  return e.styleSheets;
}
function Og(e) {
  return !e || !("shadowRoot" in e) ? null : Ut("Element", e, "shadowRoot");
}
function Ng(e, t) {
  return Ut("Element", e, "querySelector")(t);
}
function Pg(e, t) {
  return Ut("Element", e, "querySelectorAll")(t);
}
function iu() {
  return [
    mo("MutationObserver").constructor,
    ru.MutationObserver ?? (() => {
    })
  ];
}
let rn = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (rn = () => (/* @__PURE__ */ new Date()).getTime());
function mr(e, t, r) {
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
const ce = {
  ownerDocument: Cg,
  childNodes: Eg,
  parentNode: Mg,
  parentElement: Rg,
  textContent: Ag,
  contains: Tg,
  getRootNode: _g,
  host: Ig,
  styleSheets: Lg,
  shadowRoot: Og,
  querySelector: Ng,
  querySelectorAll: Pg,
  nowTimestamp: rn,
  mutationObserverCtor: iu,
  patch: mr
};
function rt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const Cr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Tl = {
  map: {},
  getId() {
    return console.error(Cr), -1;
  },
  getNode() {
    return console.error(Cr), null;
  },
  removeNodeFromMap() {
    console.error(Cr);
  },
  has() {
    return console.error(Cr), !1;
  },
  reset() {
    console.error(Cr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Tl = new Proxy(Tl, {
  get(e, t, r) {
    return t === "map" && console.error(Cr), Reflect.get(e, t, r);
  }
}));
function nn(e, t, r = {}) {
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
function ci(e, t, r, n, i = window) {
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
  ), () => ci(e, t, s || {}, !0);
}
function su(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = ce.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = ce.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function ou() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function au() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function lu(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ce.parentElement(e) : null;
}
function nt(e, t, r, n) {
  if (!e)
    return !1;
  const i = lu(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Wn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Dg(e, t) {
  return t.getId(e) !== -1;
}
function Os(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === tn;
}
function cu(e, t) {
  if (Xr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ce.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? cu(n, t) : !0;
}
function Us(e) {
  return !!e.changedTouches;
}
function zg(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function uu(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function du(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Bs(e) {
  return e ? e instanceof fo && "shadowRoot" in e ? !!e.shadowRoot : !!ce.shadowRoot(e) : !1;
}
class $g {
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
function pu(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ce.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ce.host(ce.getRootNode(e)) && (r = ce.host(ce.getRootNode(e))), r;
}
function Fg(e) {
  let t = e, r;
  for (; r = pu(t); )
    t = r;
  return t;
}
function Ug(e) {
  const t = ce.ownerDocument(e);
  if (!t) return !1;
  const r = Fg(e);
  return ce.contains(t, r);
}
function hu(e) {
  const t = ce.ownerDocument(e);
  return t ? ce.contains(t, e) || Ug(e) : !1;
}
var we = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(we || {}), pe = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(pe || {}), at = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(at || {}), $t = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))($t || {}), zr = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(zr || {}), Er = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Er || {}), fu = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(fu || {});
function _l(e) {
  return "__ln" in e;
}
class Bg {
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
    if (t.__ln = r, t.previousSibling && _l(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && _l(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Il = (e, t) => `${e}@${t}`;
class qg {
  constructor() {
    W(this, "frozen", !1), W(this, "locked", !1), W(this, "texts", []), W(this, "attributes", []), W(this, "attributeMap", /* @__PURE__ */ new WeakMap()), W(this, "removes", []), W(this, "mapRemoves", []), W(this, "movedMap", {}), W(this, "addedSet", /* @__PURE__ */ new Set()), W(this, "movedSet", /* @__PURE__ */ new Set()), W(this, "droppedSet", /* @__PURE__ */ new Set()), W(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), W(this, "mutationCb"), W(this, "blockClass"), W(this, "blockSelector"), W(this, "maskTextClass"), W(this, "maskTextSelector"), W(this, "inlineStylesheet"), W(this, "maskInputOptions"), W(this, "maskTextFn"), W(this, "maskInputFn"), W(this, "keepIframeSrcFn"), W(this, "recordCanvas"), W(this, "inlineImages"), W(this, "slimDOMOptions"), W(this, "dataURLOptions"), W(this, "doc"), W(this, "mirror"), W(this, "iframeManager"), W(this, "stylesheetManager"), W(this, "shadowDomManager"), W(this, "canvasManager"), W(this, "processedNodeManager"), W(this, "unattachedDoc"), W(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), W(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Bg(), i = (l) => {
        let d = l, o = tn;
        for (; o === tn; )
          d = d && d.nextSibling, o = d && this.mirror.getId(d);
        return o;
      }, s = (l) => {
        const d = ce.parentNode(l);
        if (!d || !hu(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (o = !0);
        }
        const h = Xr(d) ? this.mirror.getId(pu(l)) : this.mirror.getId(d), p = i(l);
        if (h === -1 || p === -1)
          return n.addNode(l);
        const u = Rr(l, {
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
            uu(m, this.mirror) && this.iframeManager.addIframe(m), du(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Bs(l) && this.shadowDomManager.addShadowRoot(ce.shadowRoot(l), this.doc);
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
        Ll(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(ce.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Ol(this.droppedSet, l) && !Ll(this.removesSubTreeCache, l, this.mirror) || Ol(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const d = this.mirror.getId(ce.parentNode(a.value)), o = i(a.value);
          d !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let d = n.tail;
          for (; d; ) {
            const o = d;
            if (d = d.previous, o) {
              const h = this.mirror.getId(ce.parentNode(o.value));
              if (i(o.value) === -1) continue;
              if (h !== -1) {
                l = o;
                break;
              } else {
                const u = o.value, m = ce.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = ce.host(m);
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
          const d = l.node, o = ce.parentNode(d);
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
        ce.childNodes(t),
        (i) => ce.textContent(i) || ""
      ).join("");
      r.attributes.value = Un({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Bn(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), W(this, "processMutation", (t) => {
      if (!Os(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ce.textContent(t.target);
            !nt(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Uc(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, lu(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Bn(r);
              i = Un({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (nt(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Fc(r.tagName, n))
              if (s.attributes[n] = $c(
                this.doc,
                pr(r.tagName),
                pr(n),
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
            if (nt(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Xr(t.target) ? this.mirror.getId(ce.host(t.target)) : this.mirror.getId(t.target);
              nt(t.target, this.blockClass, this.blockSelector, !1) || Os(r, this.mirror, this.slimDOMOptions) || !Dg(r, this.mirror) || (this.addedSet.has(r) ? (qs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || cu(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Il(n, i)] ? qs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Xr(t.target) && Kr(t.target) ? !0 : void 0
              }), Wg(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), W(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Os(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Il(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        nt(t, this.blockClass, this.blockSelector, !1) || (ce.childNodes(t).forEach((n) => this.genAdds(n)), Bs(t) && ce.childNodes(ce.shadowRoot(t)).forEach((n) => {
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
function qs(e, t) {
  e.delete(t), ce.childNodes(t).forEach((r) => qs(e, r));
}
function Wg(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ce.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Ll(e, t, r) {
  return e.size === 0 ? !1 : jg(e, t);
}
function jg(e, t, r) {
  const n = ce.parentNode(t);
  return n ? e.has(n) : !1;
}
function Ol(e, t) {
  return e.size === 0 ? !1 : mu(e, t);
}
function mu(e, t) {
  const r = ce.parentNode(t);
  return r ? e.has(r) ? !0 : mu(e, r) : !1;
}
let Jr;
function Hg(e) {
  Jr = e;
}
function Vg() {
  Jr = void 0;
}
const be = (e) => Jr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Jr && Jr(n) === !0)
      return;
    throw n;
  }
} : e, cr = [];
function ln(e) {
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
function gu(e, t) {
  const r = new qg();
  cr.push(r), r.init(e);
  const [n, i] = iu(), s = new n(
    be(r.processMutations.bind(r))
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
function Yg({
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
  const l = nn(
    be(
      (h) => {
        const p = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= p, u)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), d = be(
    nn(
      be((h) => {
        const p = ln(h), { clientX: u, clientY: m } = Us(h) ? h.changedTouches[0] : h;
        c || (c = rn()), a.push({
          x: u,
          y: m,
          id: n.getId(p),
          timeOffset: rn() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? pe.Drag : h instanceof MouseEvent ? pe.MouseMove : pe.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    rt("mousemove", d, r),
    rt("touchmove", d, r),
    rt("drag", d, r)
  ];
  return be(() => {
    o.forEach((h) => h());
  });
}
function Gg({
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
    const p = ln(h);
    if (nt(p, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = $t.Mouse;
          break;
        case "touch":
          u = $t.Touch;
          break;
        case "pen":
          u = $t.Pen;
          break;
      }
      u === $t.Touch ? at[o] === at.MouseDown ? m = "TouchStart" : at[o] === at.MouseUp && (m = "TouchEnd") : $t.Pen;
    } else Us(h) && (u = $t.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === $t.Touch || m.startsWith("Mouse") && u === $t.Mouse) && (u = null)) : at[o] === at.Click && (u = l, l = null);
    const f = Us(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(p), { clientX: x, clientY: y } = f;
    be(e)({
      type: at[m],
      id: g,
      x,
      y,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(at).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = pr(o);
    const p = d(o);
    if (window.PointerEvent)
      switch (at[o]) {
        case at.MouseDown:
        case at.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case at.TouchStart:
        case at.TouchEnd:
          return;
      }
    c.push(rt(h, p, t));
  }), be(() => {
    c.forEach((o) => o());
  });
}
function yu({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = be(
    nn(
      be((c) => {
        const l = ln(c);
        if (!l || nt(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const o = su(t.defaultView);
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
  return rt("scroll", a, t);
}
function Xg({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = be(
    nn(
      be(() => {
        const s = ou(), a = au();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return rt("resize", i, t);
}
const Kg = ["INPUT", "TEXTAREA", "SELECT"], Nl = /* @__PURE__ */ new WeakMap();
function Jg({
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
  function h(y) {
    let b = ln(y);
    const S = y.isTrusted, w = b && b.tagName;
    if (b && w === "OPTION" && (b = ce.parentElement(b)), !b || !w || Kg.indexOf(w) < 0 || nt(b, n, i, !0) || b.classList.contains(s) || a && b.matches(a))
      return;
    let k = b.value, C = !1;
    const I = Bn(b) || "";
    I === "radio" || I === "checkbox" ? C = b.checked : (c[w.toLowerCase()] || c[I]) && (k = Un({
      element: b,
      maskInputOptions: c,
      tagName: w,
      type: I,
      value: k,
      maskInputFn: l
    })), p(
      b,
      o ? { text: k, isChecked: C, userTriggered: S } : { text: k, isChecked: C }
    );
    const P = b.name;
    I === "radio" && P && C && t.querySelectorAll(`input[type="radio"][name="${P}"]`).forEach((L) => {
      if (L !== b) {
        const K = L.value;
        p(
          L,
          o ? { text: K, isChecked: !C, userTriggered: !1 } : { text: K, isChecked: !C }
        );
      }
    });
  }
  function p(y, b) {
    const S = Nl.get(y);
    if (!S || S.text !== b.text || S.isChecked !== b.isChecked) {
      Nl.set(y, b);
      const w = r.getId(y);
      be(e)({
        ...b,
        id: w
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (y) => rt(y, be(h), t)
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
      (y) => ci(
        y[0],
        y[1],
        {
          set() {
            be(h)({
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
  ), be(() => {
    m.forEach((y) => y());
  });
}
function jn(e) {
  const t = [];
  function r(n, i) {
    if (An("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || An("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || An("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || An("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Yt(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Zg({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: be(
      (o, h, p) => {
        const [u, m] = p, { id: f, styleId: g } = Yt(
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
    apply: be(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Yt(
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
    apply: be(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Yt(
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
    apply: be(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = Yt(
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
  Tn("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Tn("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Tn("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Tn("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: be(
          (p, u, m) => {
            const [f, g] = m, { id: x, styleId: y } = Yt(
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
                    ...jn(u),
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
        apply: be(
          (p, u, m) => {
            const [f] = m, { id: g, styleId: x } = Yt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...jn(u), f] }
              ]
            }), p.apply(u, m);
          }
        )
      }
    );
  }), be(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = d[o].insertRule, h.prototype.deleteRule = d[o].deleteRule;
    });
  });
}
function bu({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(ce.host(r));
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
  }), be(() => {
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
function Qg({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: be(
      (c, l, d) => {
        var o;
        const [h, p, u] = d;
        if (r.has(h))
          return s.apply(l, [h, p, u]);
        const { id: m, styleId: f } = Yt(
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
          index: jn(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: be(
      (c, l, d) => {
        var o;
        const [h] = d;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: p, styleId: u } = Yt(
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
          index: jn(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), be(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function ey({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = be(
    (l) => nn(
      be((d) => {
        const o = ln(d);
        if (!o || nt(o, t, r, !0))
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
    rt("play", a(Er.Play), s),
    rt("pause", a(Er.Pause), s),
    rt("seeked", a(Er.Seeked), s),
    rt("volumechange", a(Er.VolumeChange), s),
    rt("ratechange", a(Er.RateChange), s)
  ];
  return be(() => {
    c.forEach((l) => l());
  });
}
function ty({ fontCb: e, doc: t }) {
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
  const a = mr(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          be(() => {
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
  }), n.push(a), be(() => {
    n.forEach((c) => c());
  });
}
function ry(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = be(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const d = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const p = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = p;
      nt(u, n, i, !0) || nt(f, n, i, !0) || d.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: d });
  });
  return c(), rt("selectionchange", c);
}
function ny({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : mr(
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
function iy(e, t) {
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
function sy(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  iy(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = gu(e, e.doc));
  const s = Yg(e), a = Gg(e), c = yu(e), l = Xg(e, {
    win: r
  }), d = Jg(e), o = ey(e);
  let h = () => {
  }, p = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Zg(e, { win: r }), p = bu(e, e.doc), u = Qg(e, {
    win: r
  }), e.collectFonts && (m = ty(e)));
  const f = ry(e), g = ny(e), x = [];
  for (const y of e.plugins)
    x.push(
      y.observer(y.callback, r, y.options)
    );
  return be(() => {
    cr.forEach((y) => y.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), d(), o(), h(), p(), u(), m(), f(), g(), x.forEach((y) => y());
  });
}
function An(e) {
  return typeof window[e] < "u";
}
function Tn(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Pl {
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
class oy {
  constructor(t) {
    W(this, "iframes", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMirror", new Pl(zc)), W(this, "crossOriginIframeStyleMirror"), W(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), W(this, "mirror"), W(this, "mutationCb"), W(this, "wrappedEmit"), W(this, "loadListener"), W(this, "stylesheetManager"), W(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Pl(
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
            source: pe.Mutation,
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
          case pe.Mutation:
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
          case pe.Drag:
          case pe.TouchMove:
          case pe.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case pe.ViewportResize:
            return !1;
          case pe.MediaInteraction:
          case pe.MouseInteraction:
          case pe.Scroll:
          case pe.CanvasMutation:
          case pe.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case pe.StyleSheetRule:
          case pe.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case pe.Font:
            return r;
          case pe.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case pe.AdoptedStyleSheet:
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
    t.type !== fu.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class ay {
  constructor(t) {
    W(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "scrollCb"), W(this, "bypassOptions"), W(this, "mirror"), W(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Kr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = gu(
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
      yu({
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
        this.mirror.getId(ce.host(t))
      ), this.restoreHandlers.push(
        bu(
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
      mr(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = ce.shadowRoot(this);
            return c && hu(this) && n.addShadowRoot(c, r), a;
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
var Ar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ly = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var _n = 0; _n < Ar.length; _n++)
  ly[Ar.charCodeAt(_n)] = _n;
var cy = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Ar[t[r] >> 2], i += Ar[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Ar[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Ar[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Dl = /* @__PURE__ */ new Map();
function uy(e, t) {
  let r = Dl.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Dl.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const vu = (e, t, r) => {
  if (!e || !(wu(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = uy(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Nn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Nn(n, t, r));
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
    const n = e.constructor.name, i = cy(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Nn(e.buffer, t, r),
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
          args: [Nn(e.data, t, r), e.width, e.height]
        };
      if (wu(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = vu(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const ku = (e, t, r) => e.map((n) => Nn(n, t, r)), wu = (e, t) => !![
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
function dy(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = mr(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...d) {
            return nt(this.canvas, r, n, !0) || setTimeout(() => {
              const o = ku(d, t, this);
              e(this.canvas, {
                type: zr["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = ci(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: zr["2D"],
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
function py(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function zl(e, t, r, n) {
  const i = [];
  try {
    const s = mr(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!nt(this, t, r, !0)) {
            const d = py(c);
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
function $l(e, t, r, n, i, s) {
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
        const d = mr(
          e,
          l,
          function(o) {
            return function(...h) {
              const p = o.apply(this, h);
              if (vu(p, s, this), "tagName" in this.canvas && !nt(this.canvas, n, i, !0)) {
                const u = ku(h, s, this), m = {
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
        const d = ci(e, l, {
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
function hy(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...$l(
      t.WebGLRenderingContext.prototype,
      zr.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...$l(
      t.WebGL2RenderingContext.prototype,
      zr.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const xu = `(function() {
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
`, Fl = typeof self < "u" && self.Blob && new Blob([xu], { type: "text/javascript;charset=utf-8" });
function fy(e) {
  let t;
  try {
    if (t = Fl && (self.URL || self.webkitURL).createObjectURL(Fl), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(xu),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class my {
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
    const a = zl(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new fy();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: y, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: zr["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, y, b]
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
        nt(f, n, i, !0) || m.push(f);
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
        const y = await createImageBitmap(f);
        l.postMessage(
          {
            id: x,
            bitmap: y,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
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
    const i = zl(
      t,
      r,
      n,
      !1
    ), s = dy(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = hy(
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
class gy {
  constructor(t) {
    W(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "adoptedStyleSheetCb"), W(this, "styleMirror", new $g()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: Nc(c, s.href),
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
class yy {
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
let ze, Pn, Ns, Hn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((ga = e.contentWindow) == null ? void 0 : ga.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const kt = Cm();
function Jt(e = {}) {
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
    sampling: y = {},
    dataURLOptions: b = {},
    mousemoveWait: S,
    recordDOM: w = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: C = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: P = !1,
    collectFonts: L = !1,
    inlineImages: K = !1,
    plugins: V,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: ie = /* @__PURE__ */ new Set([]),
    errorHandler: Ae
  } = e;
  Hg(Ae);
  const G = C ? window.parent === window : !0;
  let J = !1;
  if (!G)
    try {
      window.parent.document && (J = !1);
    } catch {
      J = !0;
    }
  if (G && !t)
    throw new Error("emit function is required");
  if (!G && !J)
    return () => {
    };
  S !== void 0 && y.mousemove === void 0 && (y.mousemove = S), kt.reset();
  const Ee = h === !0 ? {
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
  } : p !== void 0 ? p : { password: !0 }, Se = Bc(u);
  zg();
  let oe, Q = 0;
  const ve = (H) => {
    for (const ae of V || [])
      ae.eventProcessor && (H = ae.eventProcessor(H));
    return x && // Disable packing events which will be emitted to parent frames.
    !J && (H = x(H)), H;
  };
  ze = (H, ae) => {
    var he;
    const Ce = H;
    if (Ce.timestamp = rn(), (he = cr[0]) != null && he.isFrozen() && Ce.type !== we.FullSnapshot && !(Ce.type === we.IncrementalSnapshot && Ce.data.source === pe.Mutation) && cr.forEach((Pe) => Pe.unfreeze()), G)
      t == null || t(ve(Ce), ae);
    else if (J) {
      const Pe = {
        type: "rrweb",
        event: ve(Ce),
        origin: window.location.origin,
        isCheckout: ae
      };
      window.parent.postMessage(Pe, "*");
    }
    if (Ce.type === we.FullSnapshot)
      oe = Ce, Q = 0;
    else if (Ce.type === we.IncrementalSnapshot) {
      if (Ce.data.source === pe.Mutation && Ce.data.isAttachIframe)
        return;
      Q++;
      const Pe = n && Q >= n, ke = r && Ce.timestamp - oe.timestamp > r;
      (Pe || ke) && Pn(!0);
    }
  };
  const D = (H) => {
    ze({
      type: we.IncrementalSnapshot,
      data: {
        source: pe.Mutation,
        ...H
      }
    });
  }, Ve = (H) => ze({
    type: we.IncrementalSnapshot,
    data: {
      source: pe.Scroll,
      ...H
    }
  }), Fe = (H) => ze({
    type: we.IncrementalSnapshot,
    data: {
      source: pe.CanvasMutation,
      ...H
    }
  }), We = (H) => ze({
    type: we.IncrementalSnapshot,
    data: {
      source: pe.AdoptedStyleSheet,
      ...H
    }
  }), Me = new gy({
    mutationCb: D,
    adoptedStyleSheetCb: We
  }), Ie = new oy({
    mirror: kt,
    mutationCb: D,
    stylesheetManager: Me,
    recordCrossOriginIframes: C,
    wrappedEmit: ze
  });
  for (const H of V || [])
    H.getMirror && H.getMirror({
      nodeMirror: kt,
      crossOriginIframeMirror: Ie.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Ie.crossOriginIframeStyleMirror
    });
  const ut = new yy();
  Ns = new my({
    recordCanvas: k,
    mutationCb: Fe,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: kt,
    sampling: y.canvas,
    dataURLOptions: b
  });
  const lt = new ay({
    mutationCb: D,
    scrollCb: Ve,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskInputOptions: Ee,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: K,
      sampling: y,
      slimDOMOptions: Se,
      iframeManager: Ie,
      stylesheetManager: Me,
      canvasManager: Ns,
      keepIframeSrcFn: _,
      processedNodeManager: ut
    },
    mirror: kt
  });
  Pn = (H = !1) => {
    if (!w)
      return;
    ze(
      {
        type: we.Meta,
        data: {
          href: window.location.href,
          width: au(),
          height: ou()
        }
      },
      H
    ), Me.reset(), lt.init(), cr.forEach((he) => he.lock());
    const ae = Gm(document, {
      mirror: kt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskAllInputs: Ee,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Se,
      dataURLOptions: b,
      recordCanvas: k,
      inlineImages: K,
      onSerialize: (he) => {
        uu(he, kt) && Ie.addIframe(he), du(he, kt) && Me.trackLinkElement(he), Bs(he) && lt.addShadowRoot(ce.shadowRoot(he), document);
      },
      onIframeLoad: (he, Ce) => {
        Ie.attachIframe(he, Ce), lt.observeAttachShadow(he);
      },
      onStylesheetLoad: (he, Ce) => {
        Me.attachLinkElement(he, Ce);
      },
      keepIframeSrcFn: _
    });
    if (!ae)
      return console.warn("Failed to snapshot the document");
    ze(
      {
        type: we.FullSnapshot,
        data: {
          node: ae,
          initialOffset: su(window)
        }
      },
      H
    ), cr.forEach((he) => he.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Me.adoptStyleSheets(
      document.adoptedStyleSheets,
      kt.getId(document)
    );
  };
  try {
    const H = [], ae = (Ce) => {
      var Pe;
      return be(sy)(
        {
          mutationCb: D,
          mousemoveCb: (ke, Bt) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: Bt,
              positions: ke
            }
          }),
          mouseInteractionCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.MouseInteraction,
              ...ke
            }
          }),
          scrollCb: Ve,
          viewportResizeCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.ViewportResize,
              ...ke
            }
          }),
          inputCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.Input,
              ...ke
            }
          }),
          mediaInteractionCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.MediaInteraction,
              ...ke
            }
          }),
          styleSheetRuleCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.StyleSheetRule,
              ...ke
            }
          }),
          styleDeclarationCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.StyleDeclaration,
              ...ke
            }
          }),
          canvasMutationCb: Fe,
          fontCb: (ke) => ze({
            type: we.IncrementalSnapshot,
            data: {
              source: pe.Font,
              ...ke
            }
          }),
          selectionCb: (ke) => {
            ze({
              type: we.IncrementalSnapshot,
              data: {
                source: pe.Selection,
                ...ke
              }
            });
          },
          customElementCb: (ke) => {
            ze({
              type: we.IncrementalSnapshot,
              data: {
                source: pe.CustomElement,
                ...ke
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: Ee,
          inlineStylesheet: o,
          sampling: y,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: K,
          userTriggeredOnInput: P,
          collectFonts: L,
          doc: Ce,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: s,
          slimDOMOptions: Se,
          dataURLOptions: b,
          mirror: kt,
          iframeManager: Ie,
          stylesheetManager: Me,
          shadowDomManager: lt,
          processedNodeManager: ut,
          canvasManager: Ns,
          ignoreCSSAttributes: ie,
          plugins: ((Pe = V == null ? void 0 : V.filter((ke) => ke.observer)) == null ? void 0 : Pe.map((ke) => ({
            observer: ke.observer,
            options: ke.options,
            callback: (Bt) => ze({
              type: we.Plugin,
              data: {
                plugin: ke.name,
                payload: Bt
              }
            })
          }))) || []
        },
        g
      );
    };
    Ie.addLoadListener((Ce) => {
      try {
        H.push(ae(Ce.contentDocument));
      } catch (Pe) {
        console.warn(Pe);
      }
    });
    const he = () => {
      Pn(), H.push(ae(document)), Hn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? he() : (H.push(
      rt("DOMContentLoaded", () => {
        ze({
          type: we.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && he();
      })
    ), H.push(
      rt(
        "load",
        () => {
          ze({
            type: we.Load,
            data: {}
          }), I === "load" && he();
        },
        window
      )
    )), () => {
      H.forEach((Ce) => {
        try {
          Ce();
        } catch (Pe) {
          String(Pe).toLowerCase().includes("cross-origin") || console.warn(Pe);
        }
      }), ut.destroy(), Hn = !1, Vg();
    };
  } catch (H) {
    console.warn(H);
  }
}
Jt.addCustomEvent = (e, t) => {
  if (!Hn)
    throw new Error("please add custom event after start recording");
  ze({
    type: we.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Jt.freezePage = () => {
  cr.forEach((e) => e.freeze());
};
Jt.takeFullSnapshot = (e) => {
  if (!Hn)
    throw new Error("please take full snapshot after start recording");
  Pn(e);
};
Jt.mirror = kt;
var Ul;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Ul || (Ul = {}));
const { addCustomEvent: lb } = Jt, { freezePage: cb } = Jt, { takeFullSnapshot: ub } = Jt, In = 2, Ps = 4;
class by {
  constructor(t) {
    gn(this, "events", []);
    gn(this, "lastMeta", null);
    gn(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Ps && (this.lastMeta = t), t.type === In && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === In), n = this.events.some((i) => i.type === Ps);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === In), n = t.some((i) => i.type !== In && i.type !== Ps);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function vy(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new by({
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
const Su = "klav-sims-live", Cu = "klav-sims-overlay", Bl = "klav-sims-ext-css";
let xt = null, ar = null, ht = null, Tr = null;
const Vn = /* @__PURE__ */ new Map(), mt = /* @__PURE__ */ new Map();
let Eu = 0, Pt = !1, ur = null, Or = null, cn = !1, tt = null, Yr = null, Gt = null, Xt = null, St = null, dr = null, wt = null, Ot = null, Ct = null, _r = null;
const Yn = /* @__PURE__ */ new Set();
function ky(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Mu(e, t) {
  return `${e}::${ky(t.text)}`;
}
function Ru(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const wy = `
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
`, xy = `
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
function ql(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Sy(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Ws() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Cy(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Nr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Au = { HIGH: "h", MED: "m", LOW: "l" }, Wl = { HIGH: 0, MED: 1, LOW: 2 };
function Ey(e) {
  if (!e) return !1;
  if (e === ht || e === xt || e.id === Cu || e.id === Su || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function My(e) {
  const t = [];
  for (const r of [ht, xt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Tu(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function _u(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function jl(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Ry(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Ay(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Iu(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Ey(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Ty(e, t) {
  return My(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Iu(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function _y(e, t) {
  const r = Tu(t), n = _u(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Ty(i, s);
  if (!a.length) return null;
  const c = Math.max(1, jl(n));
  let l = null, d = -1 / 0;
  for (const o of a) {
    const h = Ay(o.getBoundingClientRect()), p = Ry(h, n);
    if (p <= 0) continue;
    const u = Math.max(1, jl(h)), m = p / c, f = Math.max(0, (u - p) / u), g = o.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, y = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + x - y;
    b > d && (l = o, d = b);
  }
  return l ?? a[0] ?? null;
}
async function Iy(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: Ws() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Cy(Ws() ? 80 : 520);
}
const Ly = /* @__PURE__ */ new Set([
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
function Oy(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Ly.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Ny(e) {
  const t = Oy(e.text);
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
    if (!Iu(a)) continue;
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
async function Py(e, t = {}) {
  if (e.region) {
    const r = Tu(e), n = _u(e.region, r);
    t.scroll !== !1 && await Iy(n.left + n.width / 2, n.top + n.height / 2);
    const i = _y(e.region, e);
    if (i) return i;
  }
  return Ny(e);
}
function Dy() {
  if (xt && ar) return ar;
  xt = document.createElement("div"), xt.id = Su, xt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", ar = xt.attachShadow({ mode: "open" }), Nf(ar);
  const e = document.createElement("style");
  return e.textContent = wy, ar.appendChild(e), document.body.appendChild(xt), ar;
}
function Lu() {
  if (ht) return ht;
  if (!document.getElementById(Bl)) {
    const e = document.createElement("style");
    e.id = Bl, e.textContent = xy, document.head.appendChild(e);
  }
  return ht = document.createElement("div"), ht.id = Cu, ht.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(ht), ht;
}
function Ou(e, t) {
  return Lf({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function zy(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Hs();
  const n = Dy();
  Lu(), Tr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Hs();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const p = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Vn.set(h.id, { simId: h.id, accent: p, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Ct = document.createElement("div"), Ct.className = "ksl-sr", Ct.id = "ksl-announcer", Ct.setAttribute("aria-live", "polite"), Ct.setAttribute("aria-atomic", "true"), s.appendChild(Ct), tt = document.createElement("button"), tt.type = "button", tt.className = "ksl-launcher", tt.setAttribute("aria-label", "Open Sims feedback panel"), tt.addEventListener("click", () => $y());
  const a = document.createElement("span");
  a.className = "ksl-pill", Yr = document.createElement("span"), Yr.className = "ksl-pill-avatars", Gt = document.createElement("span"), Gt.className = "ksl-pill-txt", a.append(Yr, Gt), Xt = document.createElement("span"), Xt.className = "ksl-pill-badge", Xt.hidden = !0, tt.append(a, Xt), s.appendChild(tt), i.slice(0, 3).forEach((h) => {
    const p = Vn.get(h.id);
    p && Yr.appendChild(Ou(p, 26));
  }), St = document.createElement("section"), St.className = "ksl-panel", St.setAttribute("aria-label", "Sims feedback"), St.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const o = document.createElement("button");
  o.type = "button", o.className = "ksl-icon-btn", o.title = "Minimize", o.setAttribute("aria-label", "Minimize Sims feedback panel"), o.innerHTML = ee("x", { size: 15 }), o.addEventListener("click", () => Hl()), l.append(d, o), dr = document.createElement("div"), dr.className = "ksl-count", wt = document.createElement("div"), wt.className = "ksl-chips", c.append(l, dr, wt), Ot = document.createElement("div"), Ot.className = "ksl-list", Ot.setAttribute("role", "list"), St.append(c, Ot), s.appendChild(St), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && Pt && Hl();
  }, { signal: Tr.signal }), Ru(!0), Fr();
}
function Nu(e) {
  cn = e, tt == null || tt.classList.toggle("is-reviewing", e), Fr(), Pt && $r();
}
function $y() {
  !St || !tt || (Pt = !0, St.classList.add("is-open"), tt.hidden = !0, $r());
}
function Hl() {
  !St || !tt || (Pt = !1, St.classList.remove("is-open"), tt.hidden = !1, Fr());
}
function Pu() {
  const e = Array.from(mt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Nr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Fr() {
  const e = Pu();
  Gt && (cn && e.total === 0 ? Gt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Gt.innerHTML = "Sims are watching this page" : Gt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Xt && (Xt.hidden = e.high === 0, Xt.textContent = `${e.high} high`), Pt && Du(e);
}
function Du(e) {
  dr && (e.total === 0 ? dr.innerHTML = cn ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : dr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Fy();
}
function Fy() {
  if (!wt) return;
  const e = Array.from(mt.values());
  if (wt.hidden = e.length === 0, wt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", wt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (ur === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(ur === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      ur = ur === i.simId ? null : i.simId, $r();
    }), wt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", wt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => Nr(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Or === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${Au[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      Or = Or === i ? null : i, $r();
    }), wt.appendChild(a);
  });
}
function Uy() {
  return Array.from(mt.values()).filter((e) => !ur || e.entry.simId === ur).filter((e) => !Or || Nr(e.obs) === Or).sort((e, t) => {
    const r = Nr(e.obs), n = Nr(t.obs), i = r ? Wl[r] : 3, s = n ? Wl[n] : 3;
    return i - s;
  });
}
function By(e) {
  const { entry: t, obs: r } = e, n = Nr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Ou(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Au[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
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
    (m = Dn.onTriage) == null || m.call(Dn, r, t.name), Vl(e.id);
  });
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act jump", p.innerHTML = ee("map-pin", { size: 12 }) + " Jump to on page", p.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), p.addEventListener("click", () => {
    Wy(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Vl(e.id);
  }), o.append(h, p, u), i.appendChild(o), i;
}
function qy(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function $r() {
  if (!Ot || !Pt) {
    Fr();
    return;
  }
  const e = Pu();
  Du(e);
  const t = Uy();
  if (Ot.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = mt.size > 0;
    if (cn && !i) {
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
    Ot.appendChild(n), mt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = By(n);
    n.rowEl = i, Ot.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  mt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), qy(Ot);
}
function js() {
  _r == null || _r(), _r = null;
}
async function Wy(e) {
  const t = mt.get(e);
  if (!t) return;
  const r = await Py(t.obs, { scroll: !0 });
  !r || !ht || jy(r, t.entry.accent);
}
function jy(e, t) {
  js();
  const r = Lu(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${ql(t, 0.16)},0 0 24px ${ql(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), o = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      _r === l && js();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), $e(n);
  };
  _r = l;
}
function Hy(e, t) {
  const r = `f_${e.simId}_${++Eu}`;
  mt.set(r, { id: r, entry: e, obs: t, rowEl: null }), Pt ? $r() : Fr(), Ct && (Ct.textContent = "", requestAnimationFrame(() => {
    Ct && (Ct.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function Vy(e) {
  const t = mt.get(e);
  if (!t) return;
  const r = () => {
    mt.delete(e), Pt ? $r() : Fr();
  };
  t.rowEl && Pt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Ws() ? 0 : 300)) : r();
}
function Vl(e) {
  const t = mt.get(e);
  t && (Yn.add(Mu(t.entry.simId, t.obs)), Vy(e));
}
function Yy(e, t, r) {
  if (!xt) return;
  const n = Vn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Nu(!1);
    for (const i of r) {
      if (!Sy(i)) continue;
      const s = Mu(e, i);
      Yn.has(s) || (Yn.add(s), Hy(n, i));
    }
  }
}
function Hs() {
  js(), mt.clear(), Eu = 0, Vn.clear(), Yn.clear(), Pt = !1, ur = null, Or = null, cn = !1, Tr == null || Tr.abort(), Tr = null, tt = null, Yr = null, Gt = null, Xt = null, St = null, dr = null, wt = null, Ot = null, Ct = null, $e(ht), ht = null, $e(xt), xt = null, ar = null, Ru(!1);
}
const Dn = {
  deploy: zy,
  setReviewing: Nu,
  renderFeedback: Yy,
  undeploy: Hs,
  onTriage: null
};
function Gy() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Dn);
}
typeof window < "u" && Gy();
const Yl = "klav-ao-css", Xy = "klav-ao-overlay";
function Ky(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), d = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(d, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const Jy = `
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
let or = null, Zy = 1;
const Gn = /* @__PURE__ */ new Map();
function Gl(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Qy() {
  if (or) return or;
  if (!document.getElementById(Yl)) {
    const e = document.createElement("style");
    e.id = Yl, e.textContent = Jy, document.head.appendChild(e);
  }
  return or = document.createElement("div"), or.id = Xy, or.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(or), or;
}
function db(e, t, r = {}) {
  const n = Qy(), i = r.color ?? "#6366f1", s = `klav-ao-${Zy++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Gl(i, 0.14)},0 0 24px ${Gl(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: p, top: u, below: m } = Ky(
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
    const y = document.createElement("button");
    y.className = "klav-ao-dismiss", y.textContent = "Dismiss", y.addEventListener("click", () => zu(s)), l.appendChild(f), l.appendChild(y), n.appendChild(l);
  }
  return Gn.set(s, { halo: c, pin: l }), s;
}
function zu(e) {
  const t = Gn.get(e);
  if (!t) return;
  Gn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    $e(n), $e(r);
  }, 240)) : $e(r);
}
function pb() {
  for (const e of [...Gn.keys()]) zu(e);
}
let go = Sr, lr = "";
const $u = { consoleErrors: [], networkFailures: [] };
let yo, Fu, Pr = null;
function Vr() {
  return go.backendUrl || vc;
}
const eb = 15e3;
function Ln(e, t = {}, r = eb) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Uu(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Xl() {
  return bh(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function tb() {
  return _h($u, { identity: yo, metadata: Fu });
}
async function rb(e) {
  return Ch(
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
      projectId: lr || void 0,
      replayEvents: e.replayEvents
    },
    go,
    { backend: zf }
  );
}
function bo(e = "bug") {
  const t = Ef(e, {
    onCaptureFull: Xl,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: ma,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Ln(Vr() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: lr, text: r, url: location.href })
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
        const i = await Ln(Vr() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: lr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: Ai() })
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
        const i = await Ln(Vr() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: lr, text: r, pageUrl: location.href, shot: (n == null ? void 0 : n.shot) || "", picked: (n == null ? void 0 : n.picked) || null, images: (n == null ? void 0 : n.images) ?? 0, client: Ai() })
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
        n.append("projectId", lr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Ln(Vr() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(Vr() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", lr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Tc();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => Zf({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => ma(a))), i = await Promise.all(n.map((a) => Qf(a))), s = tb();
      return r.attachConsole !== !0 && (s.consoleErrors = []), rb({
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
        reporter: yo,
        clientInfo: Ai(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (Pr == null ? void 0 : Pr.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Xl();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function nb() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function ib() {
  Ih($u, { consoleLevels: !0 });
}
function Bu(e) {
  yo = e ? Uu(e) : void 0;
}
function qu(e) {
  Fu = e ? Uu(e) : void 0;
}
function sb() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = $f, (document.head || document.documentElement).appendChild(e);
}
function ob() {
  document.addEventListener("contextmenu", (e) => {
    if (hf(e.target)) return;
    e.preventDefault(), sb();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, o, h, p, u = {}) => {
      const m = Uf(document, { iconHtml: ee(d), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), bo(p);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      $e(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Wu(e = {}) {
  if (go = {
    ...Sr,
    ...e,
    jira: { ...Sr.jira, ...e.jira },
    linear: { ...Sr.linear, ...e.linear },
    github: { ...Sr.github, ...e.github },
    plane: { ...Sr.plane, ...e.plane }
  }, typeof e.projectId == "string" && (lr = e.projectId), ib(), nb(), ob(), !Pr)
    try {
      Pr = vy(Jt);
    } catch {
      Pr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Wu, openModal: bo, identify: Bu, setMetadata: qu });
const hb = { init: Wu, openModal: bo, identify: Bu, setMetadata: qu };
export {
  Dn as KlavitySims,
  Dn as SimsLive,
  zu as clearAnnotation,
  pb as clearAnnotations,
  hb as default,
  Bu as identify,
  Wu as init,
  Gy as installKlavitySims,
  bo as openModal,
  qu as setMetadata,
  db as showAnnotation
};
