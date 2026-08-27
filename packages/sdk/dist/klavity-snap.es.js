var rd = Object.defineProperty;
var nd = (e, t, r) => t in e ? rd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var un = (e, t, r) => nd(e, typeof t != "symbol" ? t + "" : t, r);
function id(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Bl = 112, ql = 72, Wl = 89, Hl = 115;
let fi;
function sd() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function od(e) {
  let t = -1;
  fi || (fi = sd());
  for (let r = 0; r < e.length; r++)
    t = fi[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function ad(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Bl && e[r - 2] === ql && e[r - 1] === Wl && e[r] === Hl)
      return r - 3;
  return 0;
}
function ld(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Bl, n[1] = ql, n[2] = Wl, n[3] = Hl, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = od(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const a = ad(e);
    return e.set(n, a), e.set(o, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const cd = "AAlwSFlz", ud = "AAAJcEhZ", dd = "AAAACXBI";
function pd(e) {
  let t = e.indexOf(cd);
  return t === -1 && (t = e.indexOf(ud)), t === -1 && (t = e.indexOf(dd)), t;
}
const jl = "[modern-screenshot]", Ht = typeof window < "u", hd = Ht && "Worker" in window, fd = Ht && "atob" in window, md = Ht && "btoa" in window;
var Ul;
const $s = Ht ? (Ul = window.navigator) == null ? void 0 : Ul.userAgent : "", Vl = $s.includes("Chrome"), _n = $s.includes("AppleWebKit") && !Vl, zs = $s.includes("Firefox"), gd = (e) => e && "__CONTEXT__" in e, yd = (e) => e.constructor.name === "CSSFontFaceRule", bd = (e) => e.constructor.name === "CSSImportRule", vd = (e) => e.constructor.name === "CSSLayerBlockRule", _t = (e) => e.nodeType === 1, Zr = (e) => typeof e.className == "object", Yl = (e) => e.tagName === "image", kd = (e) => e.tagName === "use", Vr = (e) => _t(e) && typeof e.style < "u" && !Zr(e), wd = (e) => e.nodeType === 8, xd = (e) => e.nodeType === 3, Lr = (e) => e.tagName === "IMG", qn = (e) => e.tagName === "VIDEO", Sd = (e) => e.tagName === "CANVAS", Cd = (e) => e.tagName === "TEXTAREA", Ed = (e) => e.tagName === "INPUT", Md = (e) => e.tagName === "STYLE", Rd = (e) => e.tagName === "SCRIPT", Ad = (e) => e.tagName === "SELECT", Td = (e) => e.tagName === "SLOT", _d = (e) => e.tagName === "IFRAME", Ld = (...e) => console.warn(jl, ...e);
function Id(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const As = (e) => e.startsWith("data:");
function Gl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Ht && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Ht)
    return e;
  const r = Wn().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Wn(e) {
  return (e && _t(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Hn = "http://www.w3.org/2000/svg";
function Od(e, t, r) {
  const n = Wn(r).createElementNS(Hn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Nd(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Pd(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Dd = (e) => Pd(e, "dataUrl");
function Rr(e, t) {
  const r = Wn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Yr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: a } = t ?? {}, c = typeof e == "string" ? Rr(e, Wn(i)) : e;
    let l = null, p = null;
    function s() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(s, n)), qn(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Yr(c.poster, t).then(r) : s();
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
      const h = Yl(c) ? c.href.baseVal : c.currentSrc || c.src;
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
async function $d(e, t) {
  Vr(e) && (Lr(e) || qn(e) ? await Yr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Yr(n, t)))
  ));
}
const Xl = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Kl(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let zo = 0;
function zd(e) {
  const t = `${jl}[#${zo}]`;
  return zo++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Ld(...r)
  };
}
function Fd(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function jn(e, t) {
  return gd(e) ? e : Ud(e, { ...t, autoDestruct: !0 });
}
async function Ud(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Ht ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Ht ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
      requestInit: Fd((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: zd(o),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Jl(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Hn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: hd && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var v, S, k, w;
          const { url: x, result: b } = g.data;
          b ? (S = (v = p.get(x)) == null ? void 0 : v.resolve) == null || S.call(v, b) : (w = (k = p.get(x)) == null ? void 0 : k.reject) == null || w.call(k, new Error(`Error receiving message from worker: ${x}`));
        }, f.onmessageerror = (g) => {
          var b, v;
          const { url: x } = g.data;
          (v = (b = p.get(x)) == null ? void 0 : b.reject) == null || v.call(b, new Error(`Error receiving message from worker: ${x}`));
        }, f;
      } catch (f) {
        return s.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Id(c) && "image/webp",
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
  s.log.time("wait until load"), await $d(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: d } = Bd(e, s);
  return s.width = h, s.height = d, s;
}
function Jl(e) {
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
function Bd(e, t) {
  let { width: r, height: n } = t;
  if (_t(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function qd(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const a = await Yr(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Wd(e.ownerDocument, t), p = () => {
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
function Wd(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && o && (l.fillStyle = o, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function Zl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Rr(o, e.ownerDocument);
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
function Hd(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Fs(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function jd(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Vd(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Rr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Yr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Rr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const a = o.getContext("2d");
      a && a.drawImage(r, 0, 0, o.width, o.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Rr(e.poster, e.ownerDocument) : r;
    }
    return Zl(o, t);
  }
  return r;
}
function Yd(e, t) {
  return Sd(e) ? Zl(e, t) : _d(e) ? Hd(e, t) : Lr(e) ? jd(e) : qn(e) ? Vd(e, t) : e.cloneNode(!1);
}
function Gd(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Xl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Xd = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Kd = [
  "stroke",
  "fill"
];
function Ql(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = Zr(e) && i !== "svg", a = o ? Kd.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    a.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Gd(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, d;
  o ? (h = s.createElementNS(Hn, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, g]) => {
    d.setAttributeNS(null, f, g);
  }), h.appendChild(d)) : h = d = s.createElement(i), d.textContent = " ", s.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    Xd.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return s.body.removeChild(h), n.set(c, m), m;
}
function ec(e, t, r) {
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
function Jd(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), p = Ql(e, null, n);
  a == null || a.forEach((f, g) => {
    p.delete(g);
  });
  const s = ec(l, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Vl && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((d = s.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = s.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return s.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), s;
}
function Zd(e, t) {
  (Cd(e) || Ed(e) || Ad(e)) && t.setAttribute("value", e.value);
}
const Qd = [
  "::before",
  "::after"
  // '::placeholder', TODO
], ep = [
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
function tp(e, t, r, n, i) {
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
    const u = [Xl()], m = Ql(e, s, n);
    l == null || l.forEach((S, k) => {
      m.delete(k);
    });
    const f = ec(h, m, n.includeStyleProperties);
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
    let b = c.get(x);
    b || (b = [], c.set(x, b)), b.push(`.${u[0]}${s}`);
  }
  Qd.forEach(p), r && ep.forEach(p);
}
const Fo = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Uo(e, t, r, n, i) {
  if (_t(r) && (Md(r) || Rd(r)) || n.filter && !n.filter(r))
    return;
  Fo.has(t.nodeName) || Fo.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await Fs(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && rp(e, o), t.appendChild(o);
}
async function Bo(e, t, r, n) {
  var o;
  let i = e.firstChild;
  _t(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!wd(a))
      if (_t(a) && Td(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await Uo(e, t, c[l], r, n);
      } else
        await Uo(e, t, a, r, n);
}
function rp(e, t) {
  if (!Vr(e) || !Vr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a, b: c, c: l, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = a, o.b = c, o.c = l, o.d = p, t.style.transform = o.toString();
}
function np(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) a[c] = o[c];
}
const ip = /^[\w-:]+$/;
async function Fs(e, t, r = !1, n) {
  var p, s, h, d;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && xd(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && _t(e) && (Vr(e) || Zr(e))) {
    const u = await Yd(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const v = u.getAttributeNames();
      for (let S = v.length, k = 0; k < S; k++) {
        const w = v[k];
        ip.test(w) || u.removeAttribute(w);
      }
    }
    const m = t.currentNodeStyle = Jd(e, u, r, t);
    r && np(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const v = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = v.includes("scroll") || (v.includes("auto") || v.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = Kl((d = m.get("font-family")) == null ? void 0 : d[0]), b = x ? (v) => {
      g === "uppercase" ? v = v.toUpperCase() : g === "lowercase" ? v = v.toLowerCase() : g === "capitalize" && (v = v[0].toUpperCase() + v.substring(1)), x.forEach((S) => {
        let k = a.get(S);
        k || a.set(S, k = /* @__PURE__ */ new Set()), v.split("").forEach((w) => k.add(w));
      });
    } : void 0;
    return tp(
      e,
      u,
      f,
      t,
      b
    ), Zd(e, u), qn(e) || await Bo(
      e,
      u,
      t,
      b
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Bo(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function sp(e) {
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
function op(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), a = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Dd);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function Gr(e, t) {
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
  n === "image" && (_n || zs) && e.drawImageCount++;
  let x = p.get(r);
  if (!x) {
    d && d instanceof RegExp && d.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const b = n.startsWith("font") && m && m.minify, v = /* @__PURE__ */ new Set();
    b && n.split(";")[1].split(",").forEach((M) => {
      g.has(M) && g.get(M).forEach((L) => v.add(L));
    });
    const S = b && v.size, k = {
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
      return !_n && r.startsWith("http") && f.length ? new Promise((w, M) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...k }), x.resolve = w, x.reject = M;
      }) : op(k);
    })().catch((w) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(o);
      throw w;
    }), p.set(r, x);
  }
  return x.response;
}
async function tc(e, t, r, n) {
  if (!rc(e))
    return e;
  for (const [i, o] of ap(e, t))
    try {
      const a = await Gr(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(lp(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function rc(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const nc = /url\((['"]?)([^'"]+?)\1\)/g;
function ap(e, t) {
  const r = [];
  return e.replace(nc, (n, i, o) => (r.push([o, Gl(o, t)]), n)), r.filter(([n]) => !As(n));
}
function lp(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const cp = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function up(e, t) {
  return cp.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((_n || zs) && t.drawImageCount++, tc(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function dp(e, t) {
  if (Lr(e)) {
    const r = e.currentSrc || e.src;
    if (!As(r))
      return [
        Gr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (_n || zs) && t.drawImageCount++;
  } else if (Zr(e) && !As(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Gr(t, {
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
function pp(e, t) {
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
        Gr(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function ic(e, t) {
  const { tasks: r } = t;
  _t(e) && ((Lr(e) || Yl(e)) && r.push(...dp(e, t)), kd(e) && r.push(...pp(e, t))), Vr(e) && r.push(...up(e.style, t)), e.childNodes.forEach((n) => {
    ic(n, t);
  });
}
async function hp(e, t) {
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
      const l = Wo(c.cssText, t);
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
          if (bd(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await Gr(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${f}`, b);
            }
            const x = g.replace(
              nc,
              (b, v, S) => b.replace(S, Gl(S, f))
            );
            for (const b of mp(x))
              try {
                h.insertRule(b, h.cssRules.length);
              } catch (v) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: v });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const d = [];
      l.forEach((u) => {
        Ts(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return yd(u) && rc(u.style.getPropertyValue("src")) && ((m = Kl(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          tc(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = Wo(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const fp = /(\/\*[\s\S]*?\*\/)/g, qo = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function mp(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(fp, "");
  for (; ; ) {
    const o = qo.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(qo, "");
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
const gp = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, yp = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Wo(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(yp, (i) => {
    for (; ; ) {
      const [o, , a] = gp.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${o};`;
    }
  }) : e;
}
function Ts(e, t = []) {
  for (const r of Array.from(e))
    vd(r) ? t.push(...Ts(r.cssRules)) : "cssRules" in r ? Ts(r.cssRules, t) : t.push(r);
  return t;
}
const bp = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function vp(e) {
  return bp.test(e.innerHTML);
}
async function kp(e, t) {
  const r = await jn(e, t);
  if (_t(r.node) && Zr(r.node) && !vp(r.node))
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
  const f = await Fs(r.node, r, !0);
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
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && _t(f) && (i.time("embed web font"), await hp(f, r), i.timeEnd("embed web font")), i.time("embed node"), ic(f, r);
  const g = o.length;
  let x = 0;
  const b = async () => {
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
  s == null || s(x, g), await Promise.all([...Array.from({ length: 4 })].map(b)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const v = wp(f, r);
  return c && v.insertBefore(c, v.children[0]), a && v.insertBefore(a, v.children[0]), h && sp(r), await (m == null ? void 0 : m(v)), v;
}
function wp(e, t) {
  const { width: r, height: n } = t, i = Od(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function xp(e, t) {
  var a;
  const r = await jn(e, t), n = await kp(r), i = Nd(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Jl(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(Hn, "defs"), r.svgStyles.clear());
  const o = Rr(i, n.ownerDocument);
  return await qd(o, r);
}
async function Sp(e, t) {
  const r = await jn(e, t), { log: n, quality: i, type: o, dpi: a } = r, c = await xp(r);
  n.time("canvas to data url");
  let l = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && a && fd && md) {
    const [p, s] = l.split(",");
    let h = 0, d = !1;
    if (o === "image/png") {
      const v = pd(s);
      v >= 0 ? (h = Math.ceil((v + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = s.substring(0, h), m = s.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let v = 0; v < g.length; v++)
      g[v] = f.charCodeAt(v);
    const x = o === "image/png" ? ld(g, a, d) : id(g, a), b = window.btoa(String.fromCharCode(...x));
    l = [p, ",", b, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Cp(e, t) {
  return Sp(
    await jn(e, { ...t, type: "image/png" })
  );
}
const Ep = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Mp = 8e3, Rp = 16384, Ho = 4096, Ap = 16e6, Tp = 500, _p = 1e4, mi = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", sc = 600, Lp = 1200, Ip = 24, Op = 1024, lt = 32, Np = 4, oc = 400, Pp = 0.985, Dp = 250;
function ac(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function $p(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return ac(r, location.origin);
}
function zp(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && ac(t.src || "", location.origin)) return !0;
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
function gi(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function jo(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Fp(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Ho / i, Ho / o), l = Math.min(a, c, Math.sqrt(Ap / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(o * l));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: mi, scale: 1 };
    s.scale(l, l), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + Tp;
    let d = 0;
    const u = () => d >= _p || Date.now() >= h, m = (g, x = !1) => {
      var w;
      if (u() || (d++, !x && t && !t(g))) return;
      const b = getComputedStyle(g);
      if (b.display === "none" || b.visibility === "hidden" || Number(b.opacity) === 0) return;
      const v = g.getBoundingClientRect(), S = v.left - n.left, k = v.top - n.top;
      if (v.width > 0 && v.height > 0) {
        jo(b.backgroundColor) || (s.fillStyle = b.backgroundColor, s.fillRect(S, k, v.width, v.height));
        const M = parseFloat(b.borderTopWidth);
        M > 0 && b.borderTopStyle !== "none" && !jo(b.borderTopColor) && (s.strokeStyle = b.borderTopColor, s.lineWidth = M, s.strokeRect(S, k, v.width, v.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(S, k, v.width, v.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(S, k, v.width, v.height));
      }
      for (const M of Array.from(g.childNodes)) {
        if (u()) break;
        if (M instanceof HTMLElement) {
          m(M);
          continue;
        }
        if (!(M.nodeType !== Node.TEXT_NODE || !((w = M.textContent) != null && w.trim())))
          try {
            const L = document.createRange();
            L.selectNodeContents(M);
            const P = L.getBoundingClientRect();
            if (P.width <= 0 || P.height <= 0) continue;
            s.save(), s.beginPath(), s.rect(P.left - n.left, P.top - n.top, P.width, P.height), s.clip(), s.fillStyle = b.color, s.font = `${b.fontStyle} ${b.fontWeight} ${b.fontSize} ${b.fontFamily}`, s.textBaseline = "top", s.fillText(M.textContent.trim(), P.left - n.left, P.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: mi, scale: 1 };
  } catch {
    return { dataUrl: mi, scale: 1 };
  }
}
function Up() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function yi(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Bp(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < Ip; o++) {
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
async function Vo(e, t = sc) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await yi(i.ready, n());
    const o = Bp(e);
    o.length && await yi(
      Promise.allSettled(o.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await yi(Up(), Math.min(n(), 50));
  } catch {
  }
}
function lc(e, t) {
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
async function qp(e) {
  if (typeof document > "u") return null;
  const t = await lc(e, oc);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = lt, r.height = lt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, lt, lt);
    const { data: i } = n.getImageData(0, 0, lt, lt);
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
async function bi(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Op) return !0;
  try {
    const i = await qp(e);
    if (i !== null && i <= Np) return !0;
  } catch {
  }
  return !1;
}
async function Wp(e) {
  if (typeof document > "u") return null;
  const t = await lc(e, oc);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = lt, r.height = lt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, lt, lt);
    const { data: i } = n.getImageData(0, 0, lt, lt);
    let o = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, p = i[c] * l + 255 * (1 - l), s = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * p + 0.587 * s + 0.114 * h >= Dp && a++, o++;
    }
    return o ? a / o : null;
  } catch {
    return null;
  }
}
async function Hp(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Wp(e);
    if (r !== null && r >= Pp) return !0;
  } catch {
  }
  return !1;
}
const jp = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], Vp = /* @__PURE__ */ new Set([
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
function Yp(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Gp(e) {
  const t = (e || "").toLowerCase();
  return jp.some((r) => t.includes(r));
}
const Xp = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Kp(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Xp.test(t);
}
function Jp(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Yp(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Gp(r) || n && !Vp.has(n) && t.includes("_") && Kp(t));
}
function Zp(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const o = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!o) return;
    Jp({ fontFamily: o, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Mn = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Qp = 3e3, eh = 4e3, Yo = 24, Go = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function th(e, t = eh) {
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
function rh(e) {
  var n, i, o;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < Yo; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Yo; l++) {
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
function nh(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ih(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${nh(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function sh(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? rh(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), o = e.fetchAsDataUrl ?? ((c) => th(c)), a = [];
  for (const c of n) {
    const l = [];
    Go.lastIndex = 0;
    let p;
    for (; (p = Go.exec(c.src)) !== null; ) {
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
      m && (s = ih(s, u, m), h = !0);
    h && (a.push(s), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function oh() {
  try {
    return await Promise.race([
      sh({}).catch(() => Mn),
      new Promise((e) => setTimeout(() => e(Mn), Qp))
    ]);
  } catch {
    return Mn;
  }
}
function ah(e, t) {
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
async function lh(e, t = {}) {
  return (await ch(e, t)).dataUrl;
}
async function ch(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, o = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? o, c = t.skipFonts ? Mn : await oh(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const s = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await ah(Cp(e, {
      scale: a,
      ...l ?? {},
      font: s,
      onCloneEachNode: (d) => Zp(d, c.embeddedFamilies),
      maximumCanvasSize: Rp,
      fetch: { placeholderImage: Ep },
      filter: (d) => n && !n(d) || zp(d) ? !1 : $p(d) ? (r++, !1) : !0
    }), Mp);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Vo(e, sc);
  try {
    let s = await p(), h = await bi(s);
    if (h) {
      await Vo(e, Lp);
      try {
        const u = await p();
        await bi(u) || (s = u, h = !1);
      } catch {
      }
    }
    r && gi(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && gi("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await Hp(s, { skippedImages: r });
    return { dataUrl: s, scale: a, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (s) {
    const h = s instanceof Error ? s.message : String(s);
    gi(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = Fp(e, n, a), u = await bi(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const uh = {
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
function dh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function J(e, t = {}) {
  const r = uh[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${dh(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${a}${r}</svg>`;
}
const ph = "https://klavity.in", br = {
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
function hh(e) {
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
function fh(e) {
  const t = hh(e);
  if (!t) return 0;
  const [r, n, i] = t.map((o) => o / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function vi(e) {
  return fh(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class Xo {
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
    const o = vi(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = vi(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = vi(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
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
        for (let b = s; b < g; b++)
          for (let v = h; v < x; v++) {
            const S = (b * o + v) * 4;
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
async function mh(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: ph }, i = {
    type: e.type,
    description: e.description,
    context: e.context,
    screenshots: e.screenshots,
    settings: n,
    ...e.projectId ? { projectId: e.projectId } : {},
    replayEvents: e.replayEvents
  };
  if (!r.backend)
    throw new Error("No backend handler: cannot submit report (client-direct mode removed — KLA-720)");
  return r.backend(i);
}
const gh = 50, yh = 2e3, bh = 1e3, vh = 500, Ko = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function dn(e, t) {
  e.push(t), e.length > gh && e.shift();
}
function Us(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function ki(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      Ko.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => Ko.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Us(t, bh);
}
function kh(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Us(JSON.stringify(e), vh);
  } catch {
    return String(e);
  }
}
function wh(e, t = {}) {
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
function xh(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, s) => {
    dn(e.consoleErrors, { message: Us(p, yh), stack: s, timestamp: Date.now(), level: l });
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
          n() && i(p, h.map(kh).join(" "));
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
      return dn(e.networkFailures, { url: ki(s), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw dn(e.networkFailures, { url: ki(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
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
            dn(e.networkFailures, {
              url: ki(h.url),
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
const Sh = ["light", "dark", "glass", "neon", "custom", "liquid"], Ch = ["hidden", "icon", "full", "custom"], Eh = ["lightbulb", "bug"], Mh = ["full", "reportOnly", "off"], Rh = /^#[0-9a-fA-F]{3,8}$/, Ah = /^[\w \-,'"().]+$/, Jo = (e) => typeof e == "object" && e !== null, pn = (e) => typeof e == "string" && Rh.test(e.trim()) ? e.trim() : void 0, hn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Th = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Ah.test(t) ? t : void 0;
}, Zo = {
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
function Qo(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function cc(e) {
  const t = Jo(e) ? e : {}, n = { theme: typeof t.theme == "string" && Sh.includes(t.theme) ? t.theme : "light" }, i = pn(t.primary), o = pn(t.secondary), a = pn(t.background), c = hn(t.thankYou, 140), l = Th(t.font);
  i && (n.primary = i), o && (n.secondary = o), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Ch.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = hn(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = pn(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && Eh.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Mh.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = hn(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = Jo(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = hn(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function _h(e) {
  const t = cc(e), r = t.theme === "custom" ? { ...Zo.light } : { ...Zo[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Qo(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Qo(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
const je = class je {
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
    this._recording || !je.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), je.SESSION_MS), this._begin());
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
      if (i && i in je.TERMINAL_ERRORS) {
        this.onError(i, je.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > je.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? je.BENIGN_RESTART_MS : Math.min(je.MAX_BACKOFF_MS, je.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
je.MAX_CONSEC_FAILURES = 6, je.BASE_BACKOFF_MS = 400, je.MAX_BACKOFF_MS = 8e3, je.BENIGN_RESTART_MS = 250, je.SESSION_MS = 18e4, je.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let qr = je;
function Lh() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Ih = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function uc(e) {
  for (const t of Ih)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Mr = class Mr {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Lh(), ...t.deps || {} };
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
    this._stream = t, this._mime = uc(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Mr.MAX_SESSION_MS), this._beginSegment();
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
      }, Mr.SEGMENT_MS);
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
Mr.SEGMENT_MS = 5e3, Mr.MAX_SESSION_MS = 18e4;
let Ln = Mr;
function Oh() {
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
const Xe = class Xe {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...Oh(), ...t.deps || {} };
  }
  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(t = {}) {
    const r = globalThis, n = typeof navigator < "u" ? navigator.mediaDevices : void 0, i = !!(t.getUserMedia || n && typeof n.getUserMedia == "function"), o = t.MediaRecorder ?? r.MediaRecorder, a = t.WebSocket ?? r.WebSocket;
    return i && typeof o < "u" && typeof a < "u";
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
    this._stream = t, this._mime = uc(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), Xe.MAX_SESSION_MS), this._openSocket();
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
    }, Xe.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= Xe.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(Xe.MAX_BACKOFF_MS, Xe.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(Xe.TIMESLICE_MS);
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
        this._recorder.start(Xe.TIMESLICE_MS);
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
        var o;
        return (o = i.stop) == null ? void 0 : o.call(i);
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
Xe.MAX_SESSION_MS = 18e4, Xe.TIMESLICE_MS = 250, Xe.CONNECT_TIMEOUT_MS = 4e3, Xe.MAX_RECONNECTS = 3, Xe.BASE_BACKOFF_MS = 500, Xe.MAX_BACKOFF_MS = 4e3;
let In = Xe;
function Nh(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Oe(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const Ph = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Zt(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (Ph.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    Oe(a);
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
        for (const s of l) s.parentNode === a && Oe(s);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const dc = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Dh = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, $h = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, zh = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Fh = /* @__PURE__ */ new Set([
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
]), Uh = { needs: "Needs detail", good: "Good", great: "Great" };
function Bh(e) {
  let t = e;
  for (const r of dc) t = t.split(r).join(" ");
  return t;
}
function qh(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Fh.has(n) || r++;
  return r;
}
function pc(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Bh(r), i = qh(n), o = t.length > 0 && dc.some((d) => r.includes(d)) && i < 3, a = i >= 3 && t.length >= 12, c = zh.test(r), l = Dh.test(r) || $h.test(t), p = { problem: a, expected: c, repro: l }, s = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = s >= 3 ? "great" : s === 2 ? "good" : "needs";
  return { score: s, coverage: p, level: h, label: Uh[h], vague: o };
}
function Wh(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : pc(t).level !== "great";
}
const Hh = [
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
function jh(e) {
  const t = (e || "").toLowerCase();
  return t ? Hh.some((r) => t.includes(r)) : !1;
}
function hc(e) {
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
function fc(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", hc(t.source)],
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
const Vh = 1, Yh = 6, Gh = 1.08;
function Xh(e, t = Vh, r = Yh) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Kh(e, t = Gh) {
  return e < 0 ? t : 1 / t;
}
function Jh(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function mc(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Zh(e, t, r, n, i, o) {
  const a = (e - r.left - o.panX) / n, c = (t - r.top - o.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Qh(e, t, r, n, i, o) {
  const a = mc(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(o, Math.max(0, u)), p = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, s = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, d = a > 0 ? l((e.bottom - t.top - r.panY) / a) : o;
  return { x: p, y: h, w: Math.max(0, s - p), h: Math.max(0, d - h) };
}
function ef(e, t, r, n, i, o) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * o : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(o, Math.max(0, c)) };
}
function tf(e, t, r, n, i, o) {
  const a = mc(n, o) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function rf(e) {
  return fc("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || hc()
  });
}
function nf(e) {
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
function sf(e, t, r) {
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
function ht(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ea(e) {
  let t = ht(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function ta(e) {
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
function of(e) {
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
function ra(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function na(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function At(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp };
}
function af(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function lf(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const cf = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function gc(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function uf(e) {
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
const df = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", pf = 100, hf = pf * 1024 * 1024;
function ff(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function gr(e) {
  return gc(e) ? "video" : ff(e) ? "image" : "file";
}
function mf(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", o = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: o, cta: a };
}
function fn(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function gf(e, t, r = {}) {
  var Mo, Ro, Ao, To;
  const n = cc(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], l = !1, p = [], s = [], h = [], d = [], u = !1;
  const m = !!t.onMinimize, f = m ? 8 : 5, g = 15e3, x = 10 * 1024 * 1024, b = !!t.allowFileAttachments, v = 5, S = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : hf, k = t.reporterRole ?? "anon", w = t.upgradeUrl, M = Math.max(120 * 1024 * 1024, S + 20 * 1024 * 1024);
  let L = [], P = null;
  const N = !!(t.allowRecording && t.onRecord), Z = Nh({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Ln.isSupported(),
    webSpeechSupported: qr.isSupported()
  }), Y = Z !== "none", _ = 2;
  let Le = [];
  const Fe = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, X = {};
  let re = null;
  const _e = () => {
    const y = Object.keys(X);
    if (!y.length && !re) return null;
    const R = {};
    if (y.length) {
      const C = {};
      for (const A of y) C[A] = X[A];
      const E = X[0] ?? X[Number(y[0])] ?? {};
      Object.assign(R, E, { byIndex: C });
    }
    return re && (R.selector = re.selector, R.selectorText = re.text), R;
  };
  let Re = e, ae = 0, Q = null, ve = null, $ = null, nt = t.replayState === "attached", qe = null, wt = null, Ce = null, Ne = !1;
  const It = 4e3, xt = 5e3, V = {}, me = {}, ye = (y) => y ? JSON.parse(JSON.stringify(y)) : null, Ee = (y) => ({
    url: c[y],
    compressed: p[y],
    ann: ye(X[y])
  }), Pe = (y) => {
    (V[y] ?? (V[y] = [])).push(Ee(y));
  }, be = (y, R) => {
    c[y] = R.url, p[y] = R.compressed, R.ann ? X[y] = ye(R.ann) : delete X[y];
  }, cr = (y) => {
    const R = V[y];
    if (!R || !R.length) return !1;
    const C = R.pop(), E = me[y];
    for (; E && E.length && E[E.length - 1].mark >= R.length; ) E.pop();
    return be(y, C), xe(), !0;
  }, Ou = (y) => {
    const R = me[y];
    if (!R || !R.length) return !1;
    const { snap: C, mark: E } = R.pop();
    return V[y] && (V[y].length = Math.min(V[y].length, E)), be(y, C), xe(), !0;
  }, oo = document.createElement("style");
  oo.textContent = `
    ${_h(n)}
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
  `, a.appendChild(oo);
  const ur = document.createElement("div");
  ur.className = "klavity-overlay";
  const ne = document.createElement("div");
  ne.className = "klavity-modal", ne.innerHTML = `
    ${m ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${J("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${Fe ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${Fe.map((y) => `<button type="button" class="kl-type-chip${y.value === e ? " active" : ""}" data-kind="${ht(y.value)}" role="radio" aria-checked="${y.value === e ? "true" : "false"}">${ht(y.label)}${y.mappingLabel ? `<span class="kl-type-map">${ht(y.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${J("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${J("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${J("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${J("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${b ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${J(b ? "paperclip" : "image")}</span><span class="kl-upload-label">${b ? "Attach" : "Upload"}</span></button>
        ${N ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${J("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${J("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${J("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${b ? df : "image/*,.heic,.heif"}" multiple style="display:none">
      ${b ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(S / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${f} images</div>
        ${Y ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${J("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${b ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${b ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${J("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${J("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${J("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${J("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      ${Y ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${ht(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb">${J("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, ur.appendChild(ne), a.appendChild(ur);
  const ke = a.getElementById("klavity-sharp"), ao = a.querySelector(".klavity-info-pop");
  if (ke && ao) {
    const y = document.createElement("div");
    y.className = "kl-float-tip", y.setAttribute("role", "tooltip"), y.innerHTML = ao.innerHTML, a.appendChild(y);
    const R = () => {
      const E = ke.getBoundingClientRect(), A = Math.min(228, window.innerWidth - 16), T = 8, I = window.innerWidth, z = window.innerHeight, D = E.left + E.width / 2 - A / 2, F = Math.max(T, Math.min(D, I - A - T));
      y.style.left = F + "px", y.style.top = "-9999px", y.style.visibility = "hidden", y.style.display = "block";
      const B = y.offsetHeight;
      y.style.display = "", y.style.visibility = "";
      let q = E.bottom + 8;
      q + B + T > z && (q = E.top - B - 8), q = Math.max(T, Math.min(q, z - B - T)), y.style.top = q + "px", y.classList.add("kl-show");
    }, C = () => y.classList.remove("kl-show");
    ke.addEventListener("mouseenter", R), ke.addEventListener("mouseleave", C), ke.addEventListener("focus", R), ke.addEventListener("blur", C);
  }
  let lo = !1, Pr = null;
  function ni() {
    try {
      Pr == null || Pr.remove();
    } catch {
    }
    Pr = null;
    try {
      ke == null || ke.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Nu() {
    var D;
    if (lo || !ke || Ne) return;
    lo = !0;
    const y = document.createElement("div");
    y.className = "kl-float-tip kl-nudge", y.setAttribute("role", "status"), y.setAttribute("aria-live", "polite"), y.innerHTML = `<div class="kl-nudge-row"><span><b>Get pixel-perfect screenshots by sharing</b> — try it now.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${J("x", { size: 13 })}</button></div>`, a.appendChild(y), Pr = y;
    const R = ke.getBoundingClientRect(), C = Math.min(228, window.innerWidth - 16), E = 8, A = window.innerWidth, T = window.innerHeight;
    y.style.left = Math.max(E, Math.min(R.left + R.width / 2 - C / 2, A - C - E)) + "px", y.style.top = "-9999px", y.style.visibility = "hidden", y.style.display = "block";
    const I = y.offsetHeight;
    y.style.display = "", y.style.visibility = "";
    let z = R.bottom + 8;
    z + I + E > T && (z = R.top - I - 8), y.style.top = Math.max(E, Math.min(z, T - I - E)) + "px", y.classList.add("kl-show"), (D = y.querySelector(".kl-nudge-x")) == null || D.addEventListener("click", ni);
    try {
      ke.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => ni(), 9e3);
    } catch {
    }
    ke.addEventListener("click", ni, { once: !0 });
  }
  function Pu(y) {
    nt = y === "attached", it();
  }
  const co = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (y, R, C, E, A) => st(y, R, C, !1, !!E, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (y, R, C, E, A) => st(y, R, C, !0, !!E, A),
    close: dr,
    setReplayState: Pu,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (y) => {
      if (P = fn(y), !Ne)
        try {
          xe(), oi();
        } catch {
        }
    }
  };
  function xe() {
    const y = a.getElementById("klavity-strip"), R = a.getElementById("klavity-counter");
    y.innerHTML = "", c.forEach((C, E) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb", E === ae && A.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = C, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && A.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        ae = E, Q = null, ve = null, xe();
      });
      const I = document.createElement("button");
      I.className = "klavity-rm", I.innerHTML = J("x", { size: 13 }), I.title = "Remove", I.addEventListener("click", (F) => {
        var B;
        F.stopPropagation(), c.splice(E, 1), p.splice(E, 1), s.splice(E, 1), h.splice(E, 1), d.splice(E, 1);
        try {
          (B = t.onShotRemoved) == null || B.call(t, E);
        } catch {
        }
        delete X[E];
        for (const q of Object.keys(X).map(Number).filter((H) => H > E).sort((H, le) => H - le))
          X[q - 1] = X[q], delete X[q];
        delete V[E], delete me[E];
        for (const q of Object.keys(V).map(Number).filter((H) => H > E).sort((H, le) => H - le))
          V[q - 1] = V[q], delete V[q];
        for (const q of Object.keys(me).map(Number).filter((H) => H > E).sort((H, le) => H - le))
          me[q - 1] = me[q], delete me[q];
        c.length === 0 && Et(null), xe();
      });
      const z = document.createElement("button");
      z.className = "klavity-mk", z.innerHTML = J("pencil", { size: 13 }), z.title = "Mark up", z.addEventListener("click", (F) => {
        F.stopPropagation(), Gu(E);
      }), A.append(T, I, z);
      const D = s[E];
      if (D) {
        const F = cf[D], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + D, B.title = D === "real-pixel" ? "Pixel-perfect capture (every image included)" : D === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", B.innerHTML = J(F.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + ht(F.label) + "</span>", A.appendChild(B), F.degraded && t.onRetakeSharp) {
          const q = document.createElement("button");
          q.type = "button", q.className = "klavity-retake", q.innerHTML = J("zap", { size: 11 }) + "<span>Retake sharp</span>", q.title = "Recapture this shot at full pixel quality", q.addEventListener("click", (H) => {
            H.stopPropagation(), Du(E, q);
          }), A.appendChild(q);
        }
      }
      if (uo.has(E)) {
        const F = document.createElement("div");
        F.className = "klavity-retake-note", F.textContent = "Markup cleared for the retake.", A.appendChild(F);
      }
      y.appendChild(A);
    }), L.forEach((C, E) => {
      if (gr(C) !== "video") return;
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb", Q === E && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = C.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const I = document.createElement("span");
      I.className = "kl-video-play", I.setAttribute("aria-hidden", "true"), I.innerHTML = J("play", { size: 16 });
      const z = document.createElement("span");
      z.className = "kl-video-badge", z.innerHTML = J("play", { size: 9 }) + "<span>Video</span>", A.title = "Click to play " + C.name, A.addEventListener("click", () => {
        Q = E, ve = null, xe();
      });
      const D = document.createElement("button");
      D.className = "klavity-rm", D.innerHTML = J("x", { size: 13 }), D.title = "Remove", D.addEventListener("click", (B) => {
        B.stopPropagation(), ho(E);
      }), A.append(T, I, z, D);
      const F = fn(P);
      if (F != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = F + "%", B.appendChild(q), A.appendChild(B);
      }
      y.appendChild(A);
    }), Le.forEach((C, E) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb kl-rec-tile", ve === E && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = C.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const I = document.createElement("span");
      I.className = "kl-video-play", I.setAttribute("aria-hidden", "true"), I.innerHTML = J("play", { size: 16 });
      const z = Math.round(C.durationMs / 1e3), D = document.createElement("span");
      D.className = "kl-video-badge", D.innerHTML = J("play", { size: 9 }) + `<span>${Math.floor(z / 60)}:${String(z % 60).padStart(2, "0")}${C.screenOnly ? " · screen" : ""}</span>`, A.title = "Click to play your recording", A.addEventListener("click", () => {
        ve = E, Q = null, xe();
      });
      const F = document.createElement("button");
      F.type = "button", F.className = "kl-rerec", F.innerHTML = J("refresh-cw", { size: 12 }), F.title = "Re-record", F.setAttribute("aria-label", "Re-record"), F.addEventListener("click", (H) => {
        var le;
        H.stopPropagation(), Le.splice(E, 1), ve === E ? ve = null : ve != null && ve > E && (ve -= 1), ai();
        try {
          (le = a.getElementById("klavity-record")) == null || le.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = J("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (H) => {
        H.stopPropagation(), Le.splice(E, 1), ve === E ? ve = null : ve != null && ve > E && (ve -= 1), ai();
      }), A.append(T, I, D, F, B);
      const q = fn(P);
      if (q != null) {
        const H = document.createElement("div");
        H.className = "kl-att-prog";
        const le = document.createElement("i");
        le.style.width = q + "%", H.appendChild(le), A.appendChild(H);
      }
      y.appendChild(A);
    });
    try {
      const C = y.children[ae];
      C && typeof C.scrollIntoView == "function" && C.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const C = document.createElement("div");
      C.className = "kl-thumb-skel kl-loading", C.setAttribute("role", "status"), C.setAttribute("aria-label", "Capturing screenshot"), C.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', y.appendChild(C);
    }
    R.textContent = `${c.length}/${f} images`, R instanceof HTMLElement && (R.hidden = c.length === 0), it(), nn(), Co();
  }
  function nn() {
    const y = a.getElementById("klavity-sharphint");
    if (!y) return;
    if (c.length > 0 && ae >= 0 && ae < c.length && !!h[ae] && !u && !!t.onCaptureSharp && !ut) {
      if (!y.dataset.built) {
        y.dataset.built = "1", y.innerHTML = "";
        const E = document.createElement("span");
        E.className = "kl-sh-ic", E.innerHTML = J("triangle-alert", { size: 15 });
        const A = document.createElement("span");
        A.className = "kl-sh-txt", A.textContent = "Some areas can't be captured this way (embedded frames or cross-origin images) - click Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          u = !0, nn(), ke == null || ke.click();
        });
        const I = document.createElement("button");
        I.type = "button", I.className = "kl-sh-x", I.setAttribute("aria-label", "Dismiss"), I.title = "Dismiss", I.innerHTML = J("x", { size: 12 }), I.addEventListener("click", () => {
          u = !0, nn();
        }), y.append(E, A, T, I);
      }
      y.hidden = !1, ke == null || ke.classList.add("kl-suggest");
    } else
      y.hidden = !0, ke == null || ke.classList.remove("kl-suggest");
  }
  function St(y) {
    const R = a.getElementById("klavity-err");
    R && (R.textContent = y, R.style.display = "block");
  }
  function ii() {
    const y = a.getElementById("klavity-err");
    y && (y.style.display = "none");
  }
  function st(y, R, C, E = !0, A = !1, T) {
    var I;
    if (c.length >= f) {
      St(`You can attach up to ${f} images.`);
      return;
    }
    if (ii(), c.push(y), p.push(t.compressImage ? t.compressImage(y) : Promise.resolve(y)), s.push(R), h.push(A && R !== "real-pixel"), d.push(T), E && (ae = c.length - 1, Q = null, ve = null), xe(), E)
      try {
        (I = t.onShotAdded) == null || I.call(t, y, R);
      } catch {
      }
  }
  const uo = /* @__PURE__ */ new Set();
  async function Du(y, R) {
    if (!(ut || !t.onRetakeSharp)) {
      Ye(!0), R.classList.add("kl-loading"), o.style.display = "none";
      try {
        const C = i ? Zt(document.body) : null;
        let E;
        try {
          E = await t.onRetakeSharp(d[y]);
        } finally {
          C == null || C();
        }
        if (E) {
          const { dataUrl: A, quality: T } = At(E);
          A && (c[y] = A, p[y] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), s[y] = T ?? "real-pixel", h[y] = !1, X[y] && (delete X[y], uo.add(y)), delete V[y], delete me[y]);
        }
      } catch {
      } finally {
        o.style.display = "", Ye(!1), xe();
      }
    }
  }
  function po(y) {
    return y.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(y.name);
  }
  async function si(y) {
    ii();
    for (const R of y) {
      if (c.length >= f) {
        St(`You can attach up to ${f} images.`);
        break;
      }
      if (!po(R)) {
        St(`"${R.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (R.size > x) {
        St(`"${R.name}" is too large — images must be under ${Math.round(x / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        st(await ia(R));
      } catch {
        St(`Couldn't add "${R.name}". Please try a different image.`);
      }
    }
  }
  function oi() {
    const y = a.getElementById("klavity-files");
    if (!y) return;
    y.innerHTML = "";
    const R = L.filter((C) => gr(C) === "file");
    y.hidden = R.length === 0, L.forEach((C, E) => {
      if (gr(C) !== "file") return;
      const A = document.createElement("div");
      A.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = J("file-text", { size: 14 });
      const I = document.createElement("span");
      I.className = "kl-file-nm", I.textContent = C.name, I.title = C.name;
      const z = document.createElement("span");
      z.className = "kl-file-sz", z.textContent = C.size < 1024 ? `${C.size} B` : C.size < 1024 * 1024 ? `${Math.round(C.size / 1024)} KB` : `${(C.size / 1024 / 1024).toFixed(1)} MB`;
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-file-rm", D.setAttribute("aria-label", `Remove ${C.name}`), D.title = "Remove", D.innerHTML = J("x", { size: 11 }), D.addEventListener("click", () => {
        ho(E);
      }), A.append(T, I, z, D);
      const F = fn(P);
      if (F != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = F + "%", B.appendChild(q), A.appendChild(B);
      }
      y.appendChild(A);
    }), it();
  }
  function ho(y) {
    const R = L[y] && gr(L[y]) === "video";
    L.splice(y, 1), Q != null && (R && Q === y ? Q = null : Q > y && (Q -= 1)), oi(), xe();
  }
  function $u(y, R) {
    if (y.kind === "upgrade") {
      if (!y.url) return null;
      const E = document.createElement("a");
      return E.className = "kl-capmsg-cta", E.href = y.url, E.target = "_blank", E.rel = "noopener noreferrer", E.textContent = y.label, E;
    }
    if (!t.onRequestUpgrade) return null;
    const C = document.createElement("button");
    return C.type = "button", C.className = "kl-capmsg-cta kl-capmsg-req", C.textContent = y.label, C.addEventListener("click", async () => {
      if (C.disabled) return;
      const E = C.textContent || y.label;
      C.disabled = !0, C.textContent = "Requesting…";
      let A = !1;
      try {
        A = await t.onRequestUpgrade({ reason: y.reason || "upgrade", context: R });
      } catch {
        A = !1;
      }
      if (A) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${J("check")}</span>Request sent to your team`, C.replaceWith(T);
      } else
        C.disabled = !1, C.textContent = E;
    }), C;
  }
  function zu(y, R) {
    const C = a.getElementById("klavity-capmsg");
    if (!C || !y.overCap) return;
    C.innerHTML = "";
    const E = document.createElement("span");
    if (E.className = "kl-capmsg-t", E.textContent = y.message || "", C.appendChild(E), y.cta) {
      const A = $u(y.cta, R);
      if (A && C.appendChild(A), y.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = y.cta.hint, C.appendChild(T);
      }
    }
    C.hidden = !1;
  }
  function Fu() {
    const y = a.getElementById("klavity-capmsg");
    y && (y.hidden = !0, y.innerHTML = "");
  }
  async function Uu(y) {
    ii(), Fu();
    for (const R of y) {
      if (po(R)) {
        await si([R]);
        continue;
      }
      if (L.length >= v) {
        St(`You can attach up to ${v} files.`);
        break;
      }
      const C = mf(R, { capBytes: S, role: k, upgradeUrl: w });
      if (C.overCap) {
        zu(C, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: R.name, sizeMb: Math.round(R.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (L.reduce((A, T) => A + T.size, 0) + R.size > M) {
        St(`Attachments exceed the ${Math.round(M / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const A = R.type || (gc(R) ? uf(R.name) : ""), T = L.push({ name: R.name, type: A, size: R.size, dataUrl: await ia(R) }) - 1;
        oi(), gr(L[T]) === "video" && (Q = T), xe();
      } catch {
        St(`Couldn't add "${R.name}". Please try a different file.`);
      }
    }
  }
  function ai() {
    Ne || (xe(), it());
  }
  let Vt = null;
  function dr(y) {
    var E;
    if (Ne) return;
    Ne = !0, Vt == null || Vt(), Ce && (clearTimeout(Ce), Ce = null), document.removeEventListener("keydown", Yt, { capture: !0 }), document.removeEventListener("paste", mo);
    try {
      (E = t.onClose) == null || E.call(t, y == null ? void 0 : y.reason);
    } catch {
    }
    const R = a.querySelector(".klavity-modal");
    if (y != null && y.immediate || !R) {
      Oe(o);
      return;
    }
    R.classList.add("kl-closing");
    const C = () => Oe(o);
    R.addEventListener("animationend", C, { once: !0 }), setTimeout(C, 700);
  }
  function fo(y, R) {
    if (Ce || Ne) return;
    const C = document.createElement("div");
    C.className = "klavity-toast-progress", C.style.animationDuration = R + "ms", y.appendChild(C);
    let E = R, A = Date.now();
    const T = () => {
      A = Date.now(), Ce = setTimeout(() => {
        dr();
      }, E);
    }, I = () => {
      Ce && (clearTimeout(Ce), Ce = null, E = Math.max(0, E - (Date.now() - A)), C.style.animationPlayState = "paused");
    }, z = () => {
      Ce || y.classList.contains("kl-closing") || (C.style.animationPlayState = "running", T());
    };
    y.addEventListener("mouseenter", I), y.addEventListener("mouseleave", z), y.addEventListener("focusin", I), y.addEventListener("focusout", (D) => {
      y.contains(D.relatedTarget) || z();
    }), T();
  }
  function Yt(y) {
    var R;
    if (y.key === "Escape") {
      y.stopPropagation(), dr();
      return;
    }
    if ((y.key === "s" || y.key === "S") && !y.metaKey && !y.ctrlKey && !y.altKey) {
      const C = typeof y.composedPath == "function" && y.composedPath()[0] || y.target;
      if (C && (C.tagName === "INPUT" || C.tagName === "TEXTAREA" || C.tagName === "SELECT" || C.isContentEditable || ((R = C.getAttribute) == null ? void 0 : R.call(C, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const E = a.getElementById("klavity-submit");
      E && !E.disabled && (y.preventDefault(), y.stopPropagation(), E.click());
    }
  }
  document.addEventListener("keydown", Yt, { capture: !0 });
  const mo = (y) => {
    if (!y.clipboardData) return;
    const R = Array.from(y.clipboardData.items).filter((C) => C.type.startsWith("image/")).map((C) => C.getAsFile()).filter((C) => !!C);
    R.length && si(R);
  };
  document.addEventListener("paste", mo);
  const li = () => {
    const y = ne.querySelector("#klavity-desc");
    y && (y.placeholder = Re === "feature" ? "Describe the feature you'd like..." : Re === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (Fe) {
    const y = Array.from(ne.querySelectorAll(".kl-type-chip"));
    y.forEach((R) => {
      R.addEventListener("click", () => {
        Re = R.getAttribute("data-kind") || "bug", y.forEach((C) => {
          const E = C === R;
          C.classList.toggle("active", E), C.setAttribute("aria-checked", E ? "true" : "false");
        }), li();
      });
    });
  } else {
    const y = ne.querySelector(".bug"), R = ne.querySelector(".feat");
    y.addEventListener("click", () => {
      Re = "bug", y.classList.add("active"), R.classList.remove("active"), li();
    }), R.addEventListener("click", () => {
      Re = "feature", R.classList.add("active"), y.classList.remove("active"), li();
    });
  }
  let go = "project";
  {
    const y = ne.querySelector("#klavity-target");
    if (y) {
      const R = Array.from(y.querySelectorAll(".kl-tgt-opt"));
      for (const C of R)
        C.addEventListener("click", () => {
          go = C.dataset.target === "klavity" ? "klavity" : "project";
          for (const A of R) {
            const T = A === C;
            A.classList.toggle("on", T), A.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const ee = ne.querySelector("#klavity-desc");
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
    }, R = () => {
      const A = y();
      if (!A || !A.rangeCount) return -1;
      try {
        const T = A.getRangeAt(0);
        if (!ee.contains(T.endContainer)) return -1;
        const I = T.cloneRange();
        return I.selectNodeContents(ee), I.setEnd(T.endContainer, T.endOffset), I.toString().length;
      } catch {
        return -1;
      }
    }, C = (A) => {
      const T = y();
      if (T)
        try {
          const I = document.createRange(), z = document.createTreeWalker(ee, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let D, F = A, B = !1;
          for (; D = z.nextNode(); ) {
            if (D.nodeName === "BR") {
              if (F === 0) {
                I.setStartBefore(D), B = !0;
                break;
              }
              F -= 1;
              continue;
            }
            if (D.nodeType === 3) {
              const q = (D.textContent || "").length;
              if (F <= q) {
                I.setStart(D, F), B = !0;
                break;
              }
              F -= q;
            }
          }
          B ? I.collapse(!0) : (I.selectNodeContents(ee), I.collapse(!1)), T.removeAllRanges(), T.addRange(I);
        } catch {
        }
    }, E = () => {
      const A = R(), T = ta(ee).replace(/\n$/, "");
      ee.innerHTML = T ? ea(T) : "", A >= 0 && C(A);
    };
    ee.addEventListener("input", E), Object.defineProperty(ee, "value", {
      configurable: !0,
      get() {
        return ta(ee);
      },
      set(A) {
        const T = String(A ?? "").replace(/\n$/, "");
        ee.innerHTML = T ? ea(T) : "";
      }
    }), Object.defineProperty(ee, "disabled", {
      configurable: !0,
      get() {
        return ee.getAttribute("contenteditable") === "false";
      },
      set(A) {
        ee.setAttribute("contenteditable", A ? "false" : "true"), ee.classList.toggle("kl-desc-disabled", !!A);
      }
    }), Object.defineProperty(ee, "placeholder", {
      configurable: !0,
      get() {
        return ee.getAttribute("data-ph") || "";
      },
      set(A) {
        ee.setAttribute("data-ph", String(A ?? ""));
      }
    });
  }
  const Gt = ne.querySelector("#klavity-submit"), Ct = ne.querySelector("#klavity-remail");
  Ct && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (Ct.value = t.prefillEmail);
  const yo = ne.querySelector("#klavity-desc-hint"), Bu = () => !t.requireEmail || !!Ct && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ct.value.trim()), bo = () => c.length > 0 || nt || L.length > 0 || Le.length > 0, qu = () => {
  }, it = () => {
    const y = ee.value.trim() === "";
    Gt.disabled = y && !bo() || !Bu(), yo && (yo.hidden = !(y && bo()));
  };
  if (ee.addEventListener("input", qu), ee.addEventListener("input", it), Ct == null || Ct.addEventListener("input", it), t.onEnhance) {
    const y = t.onEnhance, R = ne.querySelector("#klavity-enhance"), C = ne.querySelector("#klavity-enhance-undo"), E = ne.querySelector("#klavity-enhance-regen"), A = ne.querySelector("#klavity-enhance-spin");
    let T = 0, I = null;
    const z = () => c[ae] || c[0] || "", D = async () => {
      if (ut) return;
      const F = ee.value.trim();
      I = ee.value;
      const B = ++T;
      R && (R.disabled = !0), A && (A.hidden = !1);
      try {
        const q = re ? { selector: re.selector, text: re.text } : null, H = await y(F, { images: c.length, shot: z(), picked: q });
        if (B !== T || !H) return;
        ee.value = of(H), ee.dispatchEvent(new Event("input", { bubbles: !0 })), qe = H.suggestedSeverity || null, wt = H.suggestedPriority || null, ee.classList.add("kl-just-enhanced"), setTimeout(() => ee.classList.remove("kl-just-enhanced"), 700), C && (C.hidden = !1), E && (E.hidden = !1), it();
      } catch {
      } finally {
        B === T && (R && (R.disabled = !1), A && (A.hidden = !0));
      }
    };
    R == null || R.addEventListener("click", () => {
      D();
    }), E == null || E.addEventListener("click", () => {
      D();
    }), C == null || C.addEventListener("click", () => {
      I !== null && (ee.value = I, ee.dispatchEvent(new Event("input", { bubbles: !0 })), it()), I = null, qe = null, wt = null, C && (C.hidden = !0), E && (E.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const y = ne.querySelector("#klavity-known"), R = t.onCheckKnown;
    let C = null, E = 0, A = "";
    const T = () => {
      y && (y.hidden = !0, y.textContent = "");
    }, I = (D) => {
      var B;
      if (!y) return;
      const F = D.headline ? ht(D.headline) : "Already reported";
      y.innerHTML = `<span class="kl-known-ic">${J("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${ht(D.statusLabel)}</span>. We're already tracking "${ht(D.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, y.hidden = !1, (B = y.querySelector("#klavity-known-dismiss")) == null || B.addEventListener("click", () => {
        A = ee.value.trim(), T();
      });
    }, z = async () => {
      const D = ee.value.trim();
      if (D.length < 12 || D === A) {
        T();
        return;
      }
      const F = ++E;
      try {
        const B = await R(D);
        if (F !== E) return;
        if (ee.value.trim() === A) {
          T();
          return;
        }
        B ? I(B) : T();
      } catch {
      }
    };
    ee.addEventListener("input", () => {
      ee.value.trim() !== A && (A = ""), C && clearTimeout(C), C = setTimeout(z, 500);
    });
  }
  if (n.reportClarity) {
    const y = ne.querySelector("#klavity-clarity"), R = ne.querySelector("#klavity-clarity-status"), C = {
      problem: ne.querySelector("#klavity-clarity-problem"),
      expected: ne.querySelector("#klavity-clarity-expected"),
      repro: ne.querySelector("#klavity-clarity-repro")
    }, E = ne.querySelector("#klavity-clarity-tip"), A = ne.querySelector("#klavity-clarity-tip-text"), T = ne.querySelector("#klavity-nudge"), I = t.onClarityTip, z = /* @__PURE__ */ new Map();
    let D = null, F = 0;
    const B = (te, j, ue) => {
      if (!te) return;
      te.classList.toggle("done", j);
      const $e = te.querySelector(".kl-clr-mark");
      $e && ($e.innerHTML = j ? J("check", { size: 12 }) : "○"), te.setAttribute("aria-label", (j ? "covered: " : "missing: ") + ue);
    }, q = () => {
      E && (E.hidden = !0);
    }, H = (te) => {
      !E || !A || jh(te) || (A.innerHTML = ht(te) + '<span class="kl-clr-aitag">AI</span>', E.hidden = !1);
    }, le = () => {
      const te = ee.value, j = pc(te);
      y && (y.hidden = te.trim().length === 0, y.classList.remove("l1", "l2", "l3"), y.classList.add(j.level === "great" ? "l3" : j.level === "good" ? "l2" : "l1")), R && (R.textContent = j.label), B(C.problem, j.coverage.problem, "What's broken"), B(C.expected, j.coverage.expected, "What you expected"), B(C.repro, j.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), j.level === "great" && q();
    }, De = () => {
      !I || !E || (D && clearTimeout(D), D = setTimeout(async () => {
        const te = ee.value.trim();
        if (!Wh(te)) {
          q();
          return;
        }
        if (z.has(te)) {
          H(z.get(te));
          return;
        }
        const j = ++F;
        try {
          const ue = await I(te, { images: c.length });
          if (j !== F || ee.value.trim() !== te) return;
          ue && ue.tip && (z.set(te, ue.tip), H(ue.tip));
        } catch {
        }
      }, 1e3));
    };
    ee.addEventListener("input", () => {
      le(), De();
    }), le(), (Mo = ne.querySelector("#klavity-nudge-add")) == null || Mo.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        ee.focus();
      } catch {
      }
    }), (Ro = ne.querySelector("#klavity-nudge-anyway")) == null || Ro.addEventListener("click", () => {
      T && (T.hidden = !0), Gt.click();
    });
  }
  ur.addEventListener("click", (y) => {
    y.target === ur && dr();
  }), (Ao = ne.querySelector("#klavity-x")) == null || Ao.addEventListener("click", () => dr()), (To = ne.querySelector("#klavity-min")) == null || To.addEventListener("click", () => {
    var y;
    try {
      (y = t.onMinimize) == null || y.call(t);
    } catch {
    }
  });
  const vo = () => Array.from(ne.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let ut = !1;
  const Ye = (y) => {
    ut = y, vo().forEach((C) => {
      C.disabled = y;
    }), ee.disabled = y;
    const R = ne.querySelector("#klavity-voice");
    R && (R.disabled = y), ne.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((C) => {
      C.disabled = y;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((C) => {
      C.disabled = y;
    }), y ? (Vt == null || Vt(), Gt.disabled = !0) : (it(), nn());
  }, Et = (y) => {
    vo().forEach((R) => {
      R.classList.remove("kl-active"), R.removeAttribute("aria-pressed");
    }), y && (y.classList.add("kl-active"), y.setAttribute("aria-pressed", "true"));
  }, Ot = ne.querySelector("#klavity-voice");
  if (Ot) {
    const C = Ot.querySelector(".kl-vring-prog");
    let E = 0, A = 0, T = !1, I, z = "";
    const D = () => {
      A = Date.now();
      const se = () => {
        const we = Date.now() - A, de = Math.min(we / 18e4, 1);
        if (C == null || C.setAttribute("stroke-dashoffset", String(de * 81.68)), we >= 165e3 && Ot.classList.add("kl-voice-warn"), we >= 18e4) {
          I.stop();
          return;
        }
        E = requestAnimationFrame(se);
      };
      E = requestAnimationFrame(se);
    }, F = () => {
      cancelAnimationFrame(E), C == null || C.setAttribute("stroke-dashoffset", String(81.68)), Ot.classList.remove("kl-voice-warn");
    }, B = ne.querySelector("#klavity-voice-status");
    let q = null;
    const H = () => {
      q && (clearTimeout(q), q = null), B && (B.hidden = !0, B.textContent = "", B.classList.remove("kl-vs-info", "kl-vs-err"));
    }, le = (se, we, de) => {
      !B || !we || (q && (clearTimeout(q), q = null), B.classList.remove("kl-vs-info", "kl-vs-err"), B.classList.add(se === "err" ? "kl-vs-err" : "kl-vs-info"), B.textContent = we, B.hidden = !1, de && (q = setTimeout(H, de)));
    }, De = "Recording — tap to stop", te = () => {
      B && B.classList.contains("kl-vs-info") && H();
    }, j = (se) => {
      Ot.classList.toggle("kl-voice-rec", se), Ot.setAttribute("aria-pressed", se ? "true" : "false"), Ot.setAttribute("aria-label", se ? "Stop recording" : "Voice dictation"), Ot.title = se ? De : "Voice dictation";
    }, ue = (se) => {
      se.onTranscript = (we) => {
        const de = ee.value;
        ee.value = de + (de.length > 0 && !/\s$/.test(de) ? " " : "") + we, it();
      }, se.onStatus = (we, de) => {
        we === "idle" ? te() : le("info", de);
      }, se.onError = (we, de) => {
        de && le("err", de, 4e3);
      }, se.onStop = () => {
        T = !1, j(!1), F(), te();
      };
    }, $e = () => {
      const se = new qr();
      return ue(se), se;
    }, We = () => {
      if (!T) {
        j(!1), F(), te();
        return;
      }
      qr.isSupported() ? (I = $e(), le("info", "Reconnecting dictation…"), I.start()) : (T = !1, j(!1), F(), le("err", "Voice dictation is unavailable right now", 4e3));
    }, Ge = () => {
      if (!(Z === "server" && t.onDictate)) return null;
      const se = new Ln({ transcribe: (we) => t.onDictate(we) });
      return ue(se), se.onUnavailable = We, se;
    }, $t = (se) => {
      const we = () => z.length > 0 && !/\s$/.test(z) ? " " : "";
      se.onTranscript = (de) => {
        z = z + we() + de, ee.value = z, it();
      }, se.onInterim = (de) => {
        ee.value = z + we() + de, it();
      }, se.onStatus = (de, K) => {
        de === "idle" ? te() : le("info", K);
      }, se.onError = (de, K) => {
        K && le("err", K, 4e3);
      }, se.onStop = () => {
        ee.value = z, T = !1, j(!1), F(), te(), it();
      }, se.onUnavailable = () => {
        if (ee.value = z, !T) {
          j(!1), F(), te();
          return;
        }
        const de = Ge();
        if (de) {
          I = de, le("info", "Reconnecting dictation…"), I.start();
          return;
        }
        We();
      };
    }, Mt = () => {
      if (Z === "server" && t.dictationStreamUrl && In.isSupported()) {
        const se = new In({ url: t.dictationStreamUrl });
        return $t(se), se;
      }
      return Ge() ?? $e();
    };
    I = Mt(), Ot.addEventListener("click", () => {
      T ? I.stop() : (H(), z = ee.value, I = Mt(), T = !0, j(!0), I.start(), D());
    }), Vt = () => {
      T && I.stop();
    };
  }
  Gt.addEventListener("click", async () => {
    var te;
    if (ut || Gt.disabled) return;
    const y = ee.value.trim(), R = ne.querySelector("#klavity-title"), C = R ? R.value.trim() : "", E = Re === "feature" ? "feature" : "bug", A = p.slice(), T = _e(), I = L.slice(), z = Le.slice(), D = Re, F = (Ct == null ? void 0 : Ct.value.trim()) || void 0;
    Ye(!0), Gt.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const q = a.getElementById("klavity-progress"), H = a.getElementById("klavity-progress-fill");
    q && H && (q.classList.add("show"), H.style.transition = "none", H.style.width = "8%", H.offsetWidth, H.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      H.style.width = "90%";
    }));
    const le = () => {
      H && (H.style.transition = "width .25s ease", H.style.width = "100%");
    }, De = () => {
      q && H && (q.classList.remove("show"), H.style.transition = "none", H.style.width = "0");
    };
    try {
      const j = await Promise.all(A), ue = {
        type: E,
        ...Fe ? { kind: D } : {},
        ...C ? { title: C } : {},
        description: y,
        screenshots: j,
        ...I.length ? { files: I } : {},
        ...z.length ? { recordings: z } : {},
        annotations: T,
        reporterEmail: F,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: go } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...qe ? { suggestedSeverity: qe } : {},
        ...wt ? { suggestedPriority: wt } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((te = a.getElementById("klavity-conlog-cb")) != null && te.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(ue), dr({ immediate: !0, reason: "submitted" });
        return;
      }
      const $e = await t.onSubmit(ue);
      if (Ne) return;
      le(), t.success ? Ku($e.issueKey, $e.issueUrl, t.success) : Xu($e.issueKey, $e.issueUrl);
    } catch (j) {
      De();
      const ue = (j == null ? void 0 : j.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", j);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${ue}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", Gt.textContent = "Submit", Ye(!1);
    }
  });
  function Wu(y, R) {
    const { dataUrl: C, quality: E, suggestSharp: A } = At(R);
    if (!C) return;
    const T = c.indexOf(y);
    T < 0 || (c[T] = C, p[T] = t.compressImage ? t.compressImage(C) : Promise.resolve(C), s[T] = E, h[T] = !!A && E !== "real-pixel", X[T] && delete X[T], delete V[T], delete me[T], xe());
  }
  async function Hu(y) {
    if (!t.onCaptureViewport) return !1;
    let R = null;
    const C = i ? Zt(document.body) : null;
    try {
      const { dataUrl: E } = At(await t.onCaptureViewport());
      E && (R = E, l = !1, st(E, "rendered", void 0, !0, !1), y && Et(y));
    } catch {
    } finally {
      C == null || C();
    }
    return (async () => {
      const E = i ? Zt(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (R) Wu(R, A);
        else {
          l = !1;
          const { dataUrl: T, quality: I, suggestSharp: z } = At(A);
          T && (st(T, I, void 0, !0, !!z), y && Et(y));
        }
      } catch {
        l = !1, xe();
      } finally {
        E == null || E();
      }
    })(), !0;
  }
  async function ko(y) {
    if (!t.onCaptureViewport) return !1;
    const R = i ? Zt(document.body) : null;
    try {
      const { dataUrl: C } = At(await t.onCaptureViewport());
      C ? (l = !1, st(C, "rendered", void 0, !0, !1)) : (l = !1, xe());
    } catch {
      l = !1, xe();
    } finally {
      R == null || R();
    }
    return !0;
  }
  const Xt = ne.querySelector("#klavity-full");
  Xt.addEventListener("click", async () => {
    if (!ut && !(t.onCaptureSharp && await ci())) {
      Ye(!0), Xt.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Hu(Xt);
          return;
        }
        const y = i ? Zt(document.body) : null;
        try {
          const { dataUrl: R, quality: C, suggestSharp: E } = At(await t.onCaptureFull());
          st(R, C, void 0, !0, !!E), Et(Xt);
        } finally {
          y == null || y();
        }
      } catch {
      } finally {
        Xt.classList.remove("kl-loading"), Ye(!1);
      }
    }
  });
  async function ci(y) {
    const R = y != null && y.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (ut || !R || !ke) return !1;
    const C = ke.querySelector(".kl-sharp-label");
    Ye(!0), ke.classList.add("kl-loading"), o.style.display = "none";
    const E = C ?? ke, A = E.textContent;
    E.textContent = "Capturing…";
    let T = !1;
    try {
      const I = i ? Zt(document.body) : null;
      let z;
      try {
        z = await R();
      } finally {
        I == null || I();
      }
      if (z) {
        const { dataUrl: D, quality: F } = At(z);
        D && (st(D, F ?? "real-pixel", void 0, !0, !1, { kind: y != null && y.viewport ? "viewport" : "full" }), Et(ke), T = !0);
      }
    } catch (I) {
      if (lf(I))
        try {
          Nu();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", I);
        } catch {
        }
    } finally {
      o.style.display = "", E.textContent = A, ke.classList.remove("kl-loading"), Ye(!1);
    }
    return T;
  }
  ke && t.onCaptureSharp && ke.addEventListener("click", () => {
    ci();
  });
  const wo = ne.querySelector("#klavity-file"), xo = ne.querySelector("#klavity-upload");
  xo.addEventListener("click", () => {
    if (!ut) {
      if (!b && c.length >= f) {
        St(`You can attach up to ${f} images.`);
        return;
      }
      wo.click();
    }
  }), wo.addEventListener("change", async (y) => {
    const R = y.target, C = R.files ? Array.from(R.files) : [];
    if (R.value = "", !C.length) return;
    const E = c.length, A = L.length;
    b ? await Uu(C) : await si(C), (c.length > E || L.length > A) && Et(xo);
  });
  const Dr = a.getElementById("klavity-record");
  Dr && t.onRecord && Dr.addEventListener("click", async () => {
    if (ut) return;
    if (Le.length >= _) {
      St(`You can attach up to ${_} recordings.`);
      return;
    }
    Ye(!0), Dr.classList.add("kl-loading");
    const y = (R) => {
      o.style.display = R === "recording" ? "none" : "";
    };
    try {
      const R = await t.onRecord(y);
      R && (Le.push(R), ve = Le.length - 1, Q = null, ai(), Et(Dr));
    } catch {
    } finally {
      o.style.display = "", Dr.classList.remove("kl-loading"), Ye(!1);
    }
  });
  const ui = a.getElementById("klavity-region");
  ui && t.onRegionCapture && (ui.onclick = () => {
    ut || (Ye(!0), document.removeEventListener("keydown", Yt, { capture: !0 }), o.style.display = "none", yf(async (y) => {
      document.addEventListener("keydown", Yt, { capture: !0 });
      try {
        const R = i ? Zt(document.body) : null;
        let C;
        try {
          C = await t.onRegionCapture(y);
        } finally {
          R == null || R();
        }
        if (C) {
          const { dataUrl: E, quality: A, suggestSharp: T } = At(C);
          E && (st(E, A, void 0, !0, !!T, { kind: "region", rect: y }), Et(ui));
        }
      } finally {
        o.style.display = "", Ye(!1);
      }
    }, () => {
      document.addEventListener("keydown", Yt, { capture: !0 }), o.style.display = "", Ye(!1);
    }));
  });
  const pr = a.getElementById("klavity-pick"), hr = a.getElementById("klavity-pickinfo"), So = () => {
    var C;
    if (pr && (pr.classList.toggle("kl-active", !!re), re ? pr.setAttribute("aria-pressed", "true") : pr.removeAttribute("aria-pressed")), !hr) return;
    if (!re) {
      hr.hidden = !0, hr.innerHTML = "";
      return;
    }
    hr.hidden = !1;
    const { text: y } = re, R = y ? `: <span class="kl-pick-txt">${ht(y)}</span>` : "";
    hr.innerHTML = `<span class="kl-pick-ic">${J("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${R}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (C = hr.querySelector("#klavity-pick-clear")) == null || C.addEventListener("click", () => {
      re = null, So();
    });
  };
  pr && t.onPickElement && (pr.onclick = async () => {
    if (!ut) {
      Ye(!0), document.removeEventListener("keydown", Yt, { capture: !0 }), o.style.display = "none";
      try {
        const y = await t.onPickElement();
        y && (re = y, So(), y.shot && st(y.shot, y.shotQuality, void 0, !0, !1, { kind: "element", selector: y.selector, rect: y.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Yt, { capture: !0 }), o.style.display = "", Ye(!1);
      }
    }
  });
  function dt(y, R = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${R}" height="${R}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${y}</svg>`;
  }
  function ju(y) {
    const R = (T, I, z, D) => `<button type="button" class="kl-htool" data-tool="${T}" title="${I} (${D.toUpperCase()})" aria-label="${I}">${z}<span class="kl-hk">${D.toUpperCase()}</span></button>`, C = (T) => {
      const I = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(I)) return !1;
      const z = parseInt(I.slice(0, 2), 16), D = parseInt(I.slice(2, 4), 16), F = parseInt(I.slice(4, 6), 16);
      return (0.2126 * z + 0.7152 * D + 0.0722 * F) / 255 > 0.7;
    }, E = (T) => `<button type="button" class="kl-hcolor${C(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + R("pen", "Pen", J("pencil", { size: 15 }), "p") + R("line", "Line", dt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + R("rect", "Rectangle", J("square", { size: 15 }), "r") + R("circle", "Circle", dt('<circle cx="12" cy="12" r="9"/>'), "o") + R("arrow", "Arrow", dt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + R("text", "Text", dt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + R("count", "Numbers", dt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${J("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + R("pixelate", "Redact (pixelate)", dt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + R("crop", "Crop", dt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + E("#ef4444") + E("#f97316") + E("#16a34a") + E("#3b82f6") + E("#ffffff") + E("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${dt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (y ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${dt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${J("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${dt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${dt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function $r() {
    $ && (document.removeEventListener("keydown", $, { capture: !0 }), $ = null);
  }
  function di() {
    const y = a.getElementById("klavity-hero-stage"), R = a.getElementById("klavity-hero-tools");
    R && (R.innerHTML = ""), y && (y.innerHTML = `<div class="kl-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), $r();
  }
  function Co() {
    var y;
    if (Q != null && !(L[Q] && gr(L[Q]) === "video") && (Q = null), ve != null && !Le[ve] && (ve = null), ve != null) {
      Eo(Le[ve].dataUrl);
      return;
    }
    if (Q != null) {
      Eo((y = L[Q]) == null ? void 0 : y.dataUrl);
      return;
    }
    if (c.length === 0) {
      ae = 0, di();
      return;
    }
    ae >= c.length && (ae = c.length - 1), ae < 0 && (ae = 0), Yu(ae);
  }
  function Eo(y) {
    const R = a.getElementById("klavity-hero-stage"), C = a.getElementById("klavity-hero-tools");
    if (!R || !y) {
      di();
      return;
    }
    $r(), C && (C.innerHTML = ""), R.innerHTML = "";
    const E = document.createElement("video");
    E.src = y, E.controls = !0, E.setAttribute("playsinline", ""), E.preload = "metadata", E.className = "kl-hero-video", E.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", R.appendChild(E);
  }
  function Vu(y, R, C, E, A) {
    const T = c[y];
    if (!T) return;
    const I = new Image();
    I.onload = () => {
      var le, De;
      if (c[y] !== T) return;
      const z = document.createElement("canvas");
      z.width = Math.max(1, Math.round(E)), z.height = Math.max(1, Math.round(A));
      const D = z.getContext("2d");
      if (!D) return;
      D.drawImage(I, R, C, E, A, 0, 0, z.width, z.height);
      let F;
      try {
        F = z.toDataURL("image/png");
      } catch {
        return;
      }
      const B = ((le = V[y]) == null ? void 0 : le.length) ?? 0, q = Ee(y);
      c[y] = F, p[y] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const H = (De = X[y]) == null ? void 0 : De.shapes;
      Array.isArray(H) && H.length ? X[y] = { w: z.width, h: z.height, shapes: sf(H, -R, -C) } : delete X[y], (V[y] ?? (V[y] = [])).push(q), (me[y] ?? (me[y] = [])).push({ snap: q, mark: B }), xe();
    }, I.src = T;
  }
  function Yu(y) {
    var D, F, B, q, H, le, De;
    const R = a.getElementById("klavity-hero-stage"), C = a.getElementById("klavity-hero-tools");
    if (!R || !C) return;
    const E = c[y];
    if (!E) {
      di();
      return;
    }
    $r(), R.innerHTML = "";
    const A = document.createElement("canvas");
    A.width = 1, A.height = 1, A.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new Xo(A, E), I = (D = X[y]) == null ? void 0 : D.shapes;
    Array.isArray(I) && I.forEach((te) => T.shapes.push({ ...te })), R.appendChild(A);
    const z = new Image();
    z.onload = () => {
      !document.body.contains(o) || ae !== y || c[y] !== E || (A.width = z.naturalWidth || 1, A.height = z.naturalHeight || 1, T.redraw());
    }, z.src = E, T.redraw();
    {
      C.innerHTML = ju((((F = me[y]) == null ? void 0 : F.length) ?? 0) > 0);
      const te = C.querySelector("#kl-hero-logo");
      te && (te.href = rf(n.projectId));
      let j = "pen", ue = "#ef4444", $e = 26, We = "black", Ge = null;
      const $t = C.querySelector("#kl-hero-textopts"), Mt = () => {
        T.shapes.length ? X[y] = { w: A.width, h: A.height, shapes: T.shapes.map((O) => ({ ...O })) } : delete X[y];
      }, se = (O) => {
        j = O, C.querySelectorAll("[data-tool]").forEach((U) => U.classList.toggle("kl-on", U.dataset.tool === O)), $t && ($t.hidden = O !== "text");
      }, we = C.querySelector(".kl-hcolor-custom"), de = C.querySelector(".kl-hcolor-input"), K = (O, U) => {
        ue = O, C.querySelectorAll("[data-color]").forEach((G) => G.classList.toggle("kl-on", G === U)), we && we.classList.toggle("kl-on", we === U);
      };
      if (C.querySelectorAll("[data-tool]").forEach((O) => O.addEventListener("click", () => se(O.dataset.tool))), C.querySelectorAll("[data-color]").forEach((O) => O.addEventListener("click", () => K(O.dataset.color, O))), we && de) {
        we.addEventListener("click", () => de.click());
        const O = () => {
          we.style.background = de.value, K(de.value, we);
        };
        de.addEventListener("input", O), de.addEventListener("change", O);
      }
      const ie = C.querySelector(".kl-hmask-cb");
      ie && ie.addEventListener("change", () => {
        i = ie.checked;
      }), C.querySelectorAll("[data-outline]").forEach((O) => O.addEventListener("click", () => {
        We = O.dataset.outline, C.querySelectorAll("[data-outline]").forEach((U) => U.classList.toggle("kl-on", U === O));
      })), C.querySelectorAll("[data-size]").forEach((O) => O.addEventListener("click", () => {
        $e = Number(O.dataset.size), C.querySelectorAll("[data-size]").forEach((U) => U.classList.toggle("kl-on", U === O));
      })), C.querySelectorAll("[data-stroke]").forEach((O) => O.addEventListener("click", () => {
        T.strokeScale = Number(O.dataset.stroke) || 1, C.querySelectorAll("[data-stroke]").forEach((U) => U.classList.toggle("kl-on", U === O)), T.redraw();
      })), (B = C.querySelector("#kl-hero-undo")) == null || B.addEventListener("click", () => {
        cr(y);
      }), (q = C.querySelector("#kl-hero-revert")) == null || q.addEventListener("click", () => {
        Ou(y);
      }), (H = C.querySelector("#kl-hero-clear")) == null || H.addEventListener("click", () => {
        Pe(y), T.clearAll(), Mt();
      }), se(j), K(ue, C.querySelector("[data-color]"));
      const Me = (O) => {
        const U = A.getBoundingClientRect(), G = Math.min(U.width / A.width, U.height / A.height) || 1, pe = A.width * G, he = A.height * G, Be = (U.width - pe) / 2, Rt = (U.height - he) / 2;
        return { x: (O.clientX - U.left - Be) / G, y: (O.clientY - U.top - Rt) / G };
      }, sn = () => {
        const O = A.getBoundingClientRect();
        return Math.min(O.width / A.width, O.height / A.height) || 1;
      }, Ju = (O, U, G, pe, he, Be) => O === "line" ? { type: "line", color: Be, x1: U, y1: G, x2: pe, y2: he } : O === "arrow" ? { type: "arrow", color: Be, x1: U, y1: G, x2: pe, y2: he } : O === "rect" ? { type: "rect", color: Be, x: Math.min(U, pe), y: Math.min(G, he), w: Math.abs(pe - U), h: Math.abs(he - G) } : O === "circle" ? { type: "circle", color: Be, x: (U + pe) / 2, y: (G + he) / 2, rx: Math.abs(pe - U) / 2, ry: Math.abs(he - G) / 2 } : O === "pixelate" ? { type: "pixelate", x: Math.min(U, pe), y: Math.min(G, he), w: Math.abs(pe - U), h: Math.abs(he - G) } : null;
      let He = 1, zt = 0, Ft = 0, on = null;
      const Zu = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), an = Jh(Zu), pi = () => {
        if (on) return on;
        const O = A.style.transform;
        return A.style.transform = "", on = A.getBoundingClientRect(), A.style.transform = O, on;
      }, Ue = document.createElement("div");
      Ue.className = "kl-minimap", Ue.hidden = !0, Ue.setAttribute("role", "navigation"), Ue.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const zr = document.createElement("img");
      zr.className = "kl-minimap-img", zr.alt = "", zr.draggable = !1, zr.src = E;
      const fr = document.createElement("div");
      fr.className = "kl-minimap-vp", Ue.append(zr, fr), R.appendChild(Ue);
      const _o = () => {
        const O = A.width, U = A.height;
        if (He <= 1 || O < 2 || U < 2) {
          Ue.hidden = !0;
          return;
        }
        const G = pi();
        if (!G) {
          Ue.hidden = !0;
          return;
        }
        const pe = 148, he = Math.min(pe / O, pe / U), Be = Math.max(1, Math.round(O * he)), Rt = Math.max(1, Math.round(U * he));
        Ue.style.width = Be + "px", Ue.style.height = Rt + "px";
        const pt = R.getBoundingClientRect(), Ut = Qh(
          { left: pt.left, top: pt.top, right: pt.right, bottom: pt.bottom },
          { left: G.left, top: G.top, width: G.width, height: G.height },
          { panX: zt, panY: Ft },
          He,
          O,
          U
        );
        fr.style.left = Ut.x * he + "px", fr.style.top = Ut.y * he + "px", fr.style.width = Math.max(3, Ut.w * he) + "px", fr.style.height = Math.max(3, Ut.h * he) + "px", Ue.hidden = !1;
      }, Fr = () => {
        if (He === 1) {
          zt = 0, Ft = 0, A.style.transform = "", A.style.cursor = "crosshair", _o();
          return;
        }
        A.style.transformOrigin = "0 0", A.style.transform = `translate(${zt}px,${Ft}px) scale(${He})`, A.style.cursor = "grab", _o();
      }, ln = (O, U, G) => {
        const pe = pi();
        if (!pe) return;
        const he = He;
        if (He = Xh(He * G), He === he) return;
        const Be = Zh(O, U, { left: pe.left, top: pe.top, width: pe.width, height: pe.height }, he, He, { panX: zt, panY: Ft });
        zt = Be.panX, Ft = Be.panY, A.style.transition = an, Fr();
      }, hi = () => {
        const O = R.getBoundingClientRect();
        return { cx: O.left + O.width / 2, cy: O.top + O.height / 2 };
      }, Qu = () => {
        He = 1, A.style.transition = an, Fr();
      };
      (le = C.querySelector("#kl-hero-zoomin")) == null || le.addEventListener("click", () => {
        const { cx: O, cy: U } = hi();
        ln(O, U, 1.25);
      }), (De = C.querySelector("#kl-hero-zoomout")) == null || De.addEventListener("click", () => {
        const { cx: O, cy: U } = hi();
        ln(O, U, 0.8);
      });
      const ed = (O, U) => {
        const G = pi();
        if (!G) return;
        const pe = R.getBoundingClientRect(), he = tf(O, U, { left: pe.left, top: pe.top, right: pe.right, bottom: pe.bottom }, { left: G.left, top: G.top, width: G.width, height: G.height }, He, A.width);
        zt = he.panX, Ft = he.panY, A.style.transition = an, Fr();
      };
      let cn = !1;
      const Lo = (O, U) => {
        const G = Ue.getBoundingClientRect(), { ix: pe, iy: he } = ef(O - G.left, U - G.top, G.width, G.height, A.width, A.height);
        ed(pe, he);
      };
      Ue.addEventListener("pointerdown", (O) => {
        cn = !0;
        try {
          Ue.setPointerCapture(O.pointerId);
        } catch {
        }
        Lo(O.clientX, O.clientY), O.preventDefault(), O.stopPropagation();
      }), Ue.addEventListener("pointermove", (O) => {
        cn && (Lo(O.clientX, O.clientY), O.preventDefault());
      });
      const Io = (O) => {
        if (cn) {
          cn = !1;
          try {
            Ue.releasePointerCapture(O.pointerId);
          } catch {
          }
        }
      };
      Ue.addEventListener("pointerup", Io), Ue.addEventListener("pointercancel", Io), R.addEventListener("wheel", (O) => {
        j !== "crop" && (O.preventDefault(), ln(O.clientX, O.clientY, Kh(O.deltaY)));
      }, { passive: !1 }), R.addEventListener("dblclick", () => {
        He = 1, A.style.transition = an, Fr();
      });
      let td = T.shapes.reduce((O, U) => U.type === "count" ? Math.max(O, U.n) : O, 0), Kt = !1, Qe = 0, et = 0, Jt = [], mr = !1, Oo = 0, No = 0, Po = 0, Do = 0, tt = null, Ur = { x: 0, y: 0 };
      A.addEventListener("pointerdown", (O) => {
        if (O.shiftKey && He > 1) {
          mr = !0, Oo = O.clientX, No = O.clientY, Po = zt, Do = Ft, A.style.transition = "none", A.style.cursor = "grabbing";
          try {
            A.setPointerCapture(O.pointerId);
          } catch {
          }
          O.preventDefault();
          return;
        }
        const U = Me(O);
        if (Qe = U.x, et = U.y, j === "crop") {
          Kt = !0;
          try {
            A.setPointerCapture(O.pointerId);
          } catch {
          }
          Ur = { x: O.clientX, y: O.clientY }, tt = document.createElement("div"), tt.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", R.appendChild(tt);
          return;
        }
        if (j === "text") {
          const G = document.createElement("input"), pe = We === "none" ? "none" : `0 0 2px ${We}, 0 0 2px ${We}`, he = sn(), Be = Math.max(6, $e * he), Rt = $e, pt = We;
          G.style.cssText = `position:fixed;left:${O.clientX}px;top:${O.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${ue};font-size:${Be}px;font-family:sans-serif;font-weight:700;text-shadow:${pe};outline:1px dashed ${ue};z-index:2147483647;min-width:80px;`, document.body.appendChild(G), Ge = G, requestAnimationFrame(() => {
            document.body.contains(G) && G.focus();
          }), G.addEventListener("blur", () => {
            Ge = null, G.value.trim() && (Pe(y), T.addShape({ type: "text", color: ue, x: Qe, y: et, text: G.value.trim(), size: Rt, outline: pt }), Mt()), Oe(G);
          }, { once: !0 }), G.addEventListener("keydown", (Ut) => {
            Ut.key === "Enter" && G.blur(), Ut.key === "Escape" && (G.value = "", G.blur()), Ut.stopPropagation();
          });
          return;
        }
        if (j === "count") {
          Pe(y), T.addShape({ type: "count", color: ue, x: U.x, y: U.y, n: ++td }), Mt();
          return;
        }
        Kt = !0;
        try {
          A.setPointerCapture(O.pointerId);
        } catch {
        }
        j === "pen" && (Jt = [U]);
      }), A.addEventListener("pointermove", (O) => {
        if (mr) {
          A.style.transition = "none", zt = Po + (O.clientX - Oo), Ft = Do + (O.clientY - No), Fr(), A.style.cursor = "grabbing";
          return;
        }
        if (!Kt) return;
        if (j === "pen") {
          Jt.push(Me(O)), Jt.length > 1 && T.drawPreview({ type: "pen", color: ue, points: Jt });
          return;
        }
        if (j === "crop" && tt) {
          const pe = R.getBoundingClientRect(), he = Math.min(Ur.x, O.clientX), Be = Math.min(Ur.y, O.clientY), Rt = Math.max(Ur.x, O.clientX), pt = Math.max(Ur.y, O.clientY);
          tt.style.left = he - pe.left + "px", tt.style.top = Be - pe.top + "px", tt.style.width = Rt - he + "px", tt.style.height = pt - Be + "px";
          return;
        }
        const U = Me(O), G = Ju(j, Qe, et, U.x, U.y, ue);
        G && T.drawPreview(G);
      }), A.addEventListener("pointerup", (O) => {
        if (mr) {
          mr = !1, A.style.cursor = He > 1 ? "grab" : "crosshair";
          try {
            A.releasePointerCapture(O.pointerId);
          } catch {
          }
          return;
        }
        if (!Kt) return;
        Kt = !1;
        try {
          A.releasePointerCapture(O.pointerId);
        } catch {
        }
        const U = Me(O);
        if (j === "crop") {
          tt && (Oe(tt), tt = null);
          const he = Math.max(0, Math.min(Qe, U.x)), Be = Math.max(0, Math.min(et, U.y)), Rt = Math.abs(U.x - Qe), pt = Math.abs(U.y - et);
          Rt > 4 && pt > 4 && Vu(y, he, Be, Rt, pt);
          return;
        }
        const G = j === "pixelate" && Math.abs(U.x - Qe) > 4 && Math.abs(U.y - et) > 4;
        (j === "pen" && Jt.length > 1 || j === "line" || j === "rect" || j === "circle" || j === "arrow" || G) && Pe(y), j === "pen" && Jt.length > 1 ? T.addShape({ type: "pen", color: ue, points: Jt }) : j === "line" ? T.addShape({ type: "line", color: ue, x1: Qe, y1: et, x2: U.x, y2: U.y }) : j === "rect" ? T.addShape({ type: "rect", color: ue, x: Math.min(Qe, U.x), y: Math.min(et, U.y), w: Math.abs(U.x - Qe), h: Math.abs(U.y - et) }) : j === "circle" ? T.addShape({ type: "circle", color: ue, x: (Qe + U.x) / 2, y: (et + U.y) / 2, rx: Math.abs(U.x - Qe) / 2, ry: Math.abs(U.y - et) / 2 }) : j === "arrow" ? T.addShape({ type: "arrow", color: ue, x1: Qe, y1: et, x2: U.x, y2: U.y }) : G && T.addShape({ type: "pixelate", x: Math.min(Qe, U.x), y: Math.min(et, U.y), w: Math.abs(U.x - Qe), h: Math.abs(U.y - et) }), Mt();
      }), A.addEventListener("pointercancel", (O) => {
        try {
          A.releasePointerCapture(O.pointerId);
        } catch {
        }
        tt && (Oe(tt), tt = null), mr && (mr = !1, A.style.cursor = He > 1 ? "grab" : "crosshair"), Kt && (Kt = !1, T.redraw());
      });
      const $o = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      $ = (O) => {
        if (!document.body.contains(o)) {
          $r();
          return;
        }
        if (Ge && document.body.contains(Ge)) return;
        const U = typeof O.composedPath == "function" && O.composedPath()[0] || O.target;
        if (U && (U.tagName === "INPUT" || U.tagName === "TEXTAREA" || U.tagName === "SELECT" || U.isContentEditable)) return;
        if ((O.metaKey || O.ctrlKey) && O.key.toLowerCase() === "z") {
          O.preventDefault(), cr(y);
          return;
        }
        if (O.metaKey || O.ctrlKey || O.altKey) return;
        const G = O.key.toLowerCase();
        if (G === "z") {
          if (O.preventDefault(), He > 1) Qu();
          else {
            const { cx: pe, cy: he } = hi();
            ln(pe, he, 2);
          }
          return;
        }
        $o[G] && (O.preventDefault(), se($o[G]));
      }, document.addEventListener("keydown", $, { capture: !0 });
    }
  }
  function Gu(y) {
    const R = c[y], C = new Image();
    C.onload = () => {
      const E = document.createElement("canvas");
      E.width = C.naturalWidth, E.height = C.naturalHeight;
      const A = new Xo(E, R);
      A.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const I = document.createElement("div");
      I.className = "kl-edtb", I.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", I.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${J("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("x", { size: 14 })}</button>
      `, E.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const z = document.createElement("div");
      z.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", z.appendChild(E);
      const D = document.createElement("style");
      D.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(D, I, z), a.appendChild(T), $r();
      let F = 1;
      const B = (K) => Math.max(0.05, Math.min(5, K || 1));
      function q(K) {
        F = B(K), E.style.width = Math.round(E.width * F) + "px", E.style.height = Math.round(E.height * F) + "px";
        const ie = I.querySelector("#klavity-zoom-pct");
        ie && (ie.textContent = Math.round(F * 100) + "%");
      }
      const H = () => Math.max(1, z.clientWidth - 24) / E.width, le = () => Math.min(Math.max(1, z.clientWidth - 24) / E.width, Math.max(1, z.clientHeight - 24) / E.height), De = E.height / E.width > Math.max(1, z.clientHeight) / Math.max(1, z.clientWidth);
      q(De ? H() : le()), I.querySelector("#klavity-zoom-in").addEventListener("click", () => q(F * 1.25)), I.querySelector("#klavity-zoom-out").addEventListener("click", () => q(F / 1.25)), I.querySelector("#klavity-fit-width").addEventListener("click", () => q(H())), I.querySelector("#klavity-fit-page").addEventListener("click", () => q(le()));
      let te = "rect", j = "#ef4444", ue = !1, $e = [], We = 0, Ge = 0;
      function $t(K) {
        te = K, I.querySelectorAll("[data-tool]").forEach((ie) => {
          const Me = ie.dataset.tool === K;
          ie.style.background = Me ? "#585b70" : "#313244", ie.style.outline = Me ? "2px solid #89b4fa" : "none";
        });
      }
      I.querySelectorAll("[data-tool]").forEach((K) => K.addEventListener("click", () => $t(K.dataset.tool))), I.querySelectorAll("[data-color]").forEach((K) => K.addEventListener("click", () => {
        j = K.dataset.color;
      }));
      {
        const K = I.querySelector("#klavity-color-custom"), ie = I.querySelector("#klavity-color-input");
        if (K && ie) {
          K.addEventListener("click", () => ie.click());
          const Me = () => {
            K.style.background = ie.value, j = ie.value;
          };
          ie.addEventListener("input", Me), ie.addEventListener("change", Me);
        }
      }
      I.querySelector("#klavity-undo").addEventListener("click", () => A.undo()), I.querySelector("#klavity-clear-ann").addEventListener("click", () => A.clearAll());
      const Mt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function se(K) {
        const ie = K.target;
        if (ie && (ie.tagName === "INPUT" || ie.tagName === "TEXTAREA" || ie.isContentEditable)) return;
        if (K.key === "Escape") {
          K.stopPropagation(), we();
          return;
        }
        if ((K.metaKey || K.ctrlKey) && K.key.toLowerCase() === "z") {
          K.preventDefault(), A.undo();
          return;
        }
        if (K.metaKey || K.ctrlKey || K.altKey) return;
        const Me = K.key.toLowerCase();
        Mt[Me] ? (K.preventDefault(), $t(Mt[Me])) : Me === "u" && (K.preventDefault(), A.undo());
      }
      function we() {
        document.removeEventListener("keydown", se, { capture: !0 }), Oe(T), Co();
      }
      document.addEventListener("keydown", se, { capture: !0 }), $t(te), I.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        Pe(y), A.shapes.length ? X[y] = { w: E.width, h: E.height, shapes: A.shapes.map((K) => ({ ...K })) } : delete X[y], we(), xe();
      }), I.querySelector("#klavity-cancel-ann").addEventListener("click", () => we());
      function de(K) {
        const ie = E.getBoundingClientRect();
        return { x: (K.clientX - ie.left) / ie.width * E.width, y: (K.clientY - ie.top) / ie.height * E.height };
      }
      E.addEventListener("pointerdown", (K) => {
        ue = !0;
        const ie = de(K);
        if ({ x: We, y: Ge } = ie, te === "pen" && ($e = [ie]), te === "text") {
          ue = !1;
          const Me = document.createElement("input");
          Me.style.cssText = `position:fixed;left:${K.clientX}px;top:${K.clientY}px;background:transparent;border:1px dashed ${j};color:${j};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Me), requestAnimationFrame(() => {
            document.body.contains(Me) && Me.focus();
          }), Me.addEventListener("blur", () => {
            Me.value.trim() && A.addShape({ type: "text", color: j, x: We, y: Ge, text: Me.value.trim() }), Oe(Me);
          }, { once: !0 }), Me.addEventListener("keydown", (sn) => {
            sn.key === "Enter" && Me.blur(), sn.stopPropagation();
          });
        }
      }), E.addEventListener("pointermove", (K) => {
        ue && te === "pen" && $e.push(de(K));
      }), E.addEventListener("pointerup", (K) => {
        if (!ue) return;
        ue = !1;
        const ie = de(K);
        te === "pen" && $e.length > 1 ? A.addShape({ type: "pen", color: j, points: $e }) : te === "rect" ? A.addShape({ type: "rect", color: j, x: Math.min(We, ie.x), y: Math.min(Ge, ie.y), w: Math.abs(ie.x - We), h: Math.abs(ie.y - Ge) }) : te === "circle" ? A.addShape({ type: "circle", color: j, x: (We + ie.x) / 2, y: (Ge + ie.y) / 2, rx: Math.abs(ie.x - We) / 2, ry: Math.abs(ie.y - Ge) / 2 }) : te === "arrow" && A.addShape({ type: "arrow", color: j, x1: We, y1: Ge, x2: ie.x, y2: ie.y });
      });
    }, C.src = R;
  }
  function Xu(y, R) {
    const C = document.createElement("div");
    C.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const E = document.createElement("div");
    E.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = J("check", { label: "Sent", size: 22 }), E.appendChild(A);
    const T = document.createElement("h2");
    T.textContent = "Report sent", E.appendChild(T);
    const I = document.createElement("p");
    if (I.textContent = n.thankYou || "We filed it and emailed you a copy.", E.appendChild(I), y) {
      const z = document.createElement("div");
      z.className = "klavity-ref";
      const D = document.createElement("span");
      D.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = ra(y), z.append(D, F);
      const B = na(R);
      if (B) {
        const q = document.createElement("a");
        q.href = B, q.target = "_blank", q.rel = "noopener", q.textContent = "Open in Klavity", z.appendChild(q);
      }
      E.appendChild(z);
    }
    C.appendChild(E), Oe(ur), a.appendChild(C), fo(E, It);
  }
  function Ku(y, R, C) {
    const { copy: E, onLead: A } = C;
    ne.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const I = document.createElement("h2");
    if (I.innerHTML = E.headline, T.appendChild(I), E.body) {
      const D = document.createElement("p");
      D.textContent = E.body, T.appendChild(D);
    }
    if (y) {
      const D = document.createElement("div");
      D.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = ra(y), D.append(F, B);
      const q = na(R);
      if (q) {
        const H = document.createElement("a");
        H.href = q, H.target = "_blank", H.rel = "noopener", H.textContent = "View in dashboard", D.appendChild(H);
      }
      T.appendChild(D);
    }
    const z = () => fo(ne, xt);
    if (E.showEmail) {
      const D = document.createElement("div");
      D.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const B = document.createElement("button"), q = E.emailLabel;
      B.textContent = q;
      const H = document.createElement("div");
      H.className = "klavity-lead-err", H.setAttribute("role", "alert"), H.style.display = "none";
      const le = async () => {
        const De = F.value.trim();
        if (!De || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(De)) {
          H.textContent = "Please enter a valid email so we can reach you.", H.style.display = "block", F.focus();
          return;
        }
        B.disabled = !0, B.textContent = "Saving…", H.style.display = "none";
        try {
          A && await A(y, De);
        } catch (j) {
          try {
            console.warn("[Klavity] lead capture failed:", (j == null ? void 0 : j.message) || j);
          } catch {
          }
          H.textContent = "Couldn't save your email — please try again.", H.style.display = "block", B.disabled = !1, B.textContent = "Retry", F.focus();
          return;
        }
        const te = document.createElement("div");
        te.className = "klavity-thanks", te.textContent = "Thanks — we'll be in touch.", Oe(H), D.replaceWith(te), E.showCta || z();
      };
      B.addEventListener("click", le), F.addEventListener("keydown", (De) => {
        De.key === "Enter" && le();
      }), D.append(F, B), T.appendChild(D), T.appendChild(H);
    }
    if (E.showCta && E.ctaUrl) {
      const D = document.createElement("a");
      D.className = "klavity-cta", D.href = E.ctaUrl, D.target = "_blank", D.rel = "noopener", D.textContent = E.ctaText, T.appendChild(D);
    }
    if (ne.appendChild(T), !n.whiteLabel) {
      const D = document.createElement("div");
      D.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = fc("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", D.append("Powered by ", F), ne.appendChild(D);
    }
    !E.showEmail && !E.showCta && z();
  }
  if (t.autoCaptureOnOpen) {
    let y = 0;
    try {
      y = document.getElementsByTagName("*").length;
    } catch {
      y = 0;
    }
    if (y <= g) {
      if (l = !0, xe(), af(t) === "screen")
        return (async () => {
          if (await ci({ viewport: !0 })) {
            l = !1, xe();
            return;
          }
          if (c.length) {
            l = !1, xe();
            return;
          }
          if (l = !0, xe(), t.onCaptureViewport) {
            ko(null).catch(() => {
              l = !1, xe();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: T, quality: I, suggestSharp: z } = At(A);
            l = !1, st(T, I, void 0, !0, !!z), Et(Xt);
          }).catch(() => {
            l = !1, xe();
          });
        })(), co;
      const R = () => {
        if (t.onCaptureViewport) {
          ko(null).catch(() => {
            l = !1, xe();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: A, quality: T, suggestSharp: I } = At(E);
          l = !1, st(A, T, void 0, !0, !!I), Et(Xt);
        }).catch(() => {
          l = !1, xe();
        });
      }, C = window.requestIdleCallback;
      typeof C == "function" ? C(() => R(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(R, 0));
    }
  }
  return co;
}
function yf(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Oe(r), Oe(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    a = !0, i = p.clientX, o = p.clientY, Oe(n);
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
async function ia(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return sa(r);
    } catch {
    }
  return sa(e);
}
function sa(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const bf = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function vf(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function kf(e) {
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
const wf = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Qt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function xf(e) {
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
  } = e, s = Qt(e.initials || vf(t)), h = i !== "none" ? bf[i] : null, d = h ? `<span class="ksim-mark ${l ? wf[h.mark] : ""}" style="color:${Qt(h.accent)}">${kf(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Qt(r)}" alt="${Qt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), x = `--ksim-persona:${Qt(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${Qt(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${Qt(t)}">${d}${m}${f}</span>`;
}
function Sf(e) {
  const t = document.createElement("template");
  return t.innerHTML = xf(e).trim(), t.content.firstElementChild;
}
const Cf = `
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
function Ef(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Cf, t.appendChild(r);
}
function Mf(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Rf(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: a, replayEvents: c } = e, l = Mf({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: a, replayEvents: c }), p = t.connectionMode === "klavity" && !!t.klavToken;
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
var Af = Object.defineProperty, Tf = (e, t, r) => t in e ? Af(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, W = (e, t, r) => Tf(e, typeof t != "symbol" ? t + "" : t, r), oa, _f = Object.defineProperty, Lf = (e, t, r) => t in e ? _f(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, aa = (e, t, r) => Lf(e, typeof t != "symbol" ? t + "" : t, r), ze = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(ze || {});
const la = {
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
}, ca = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, mn = {}, yc = {}, If = () => !!globalThis.Zone;
function Bs(e) {
  if (mn[e])
    return mn[e];
  const t = globalThis[e], r = t.prototype, n = e in la ? la[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in ca ? ca[e] : void 0, a = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !If())
    return mn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), yc[e] = () => c.remove()) : c.remove(), mn[e] = p;
  } catch {
    return r;
  }
}
const wi = {};
function Pt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (wi[i])
    return wi[i].call(
      t
    );
  const o = Bs(e), a = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return a ? (wi[i] = a, a.call(t)) : t[r];
}
const xi = {};
function bc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (xi[n])
    return xi[n].bind(
      t
    );
  const o = Bs(e)[r];
  return typeof o != "function" ? t[r] : (xi[n] = o, o.bind(t));
}
function Of(e) {
  return Pt("Node", e, "ownerDocument");
}
function Nf(e) {
  return Pt("Node", e, "childNodes");
}
function Pf(e) {
  return Pt("Node", e, "parentNode");
}
function Df(e) {
  return Pt("Node", e, "parentElement");
}
function $f(e) {
  return Pt("Node", e, "textContent");
}
function zf(e, t) {
  return bc("Node", e, "contains")(t);
}
function Ff(e) {
  return bc("Node", e, "getRootNode")();
}
function Uf(e) {
  return !e || !("host" in e) ? null : Pt("ShadowRoot", e, "host");
}
function Bf(e) {
  return e.styleSheets;
}
function qf(e) {
  return !e || !("shadowRoot" in e) ? null : Pt("Element", e, "shadowRoot");
}
function Wf(e, t) {
  return Pt("Element", e, "querySelector")(t);
}
function Hf(e, t) {
  return Pt("Element", e, "querySelectorAll")(t);
}
function jf() {
  return [
    Bs("MutationObserver").constructor,
    yc.MutationObserver ?? (() => {
    })
  ];
}
let vc = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (vc = () => (/* @__PURE__ */ new Date()).getTime());
function Vf(e, t, r) {
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
const Ve = {
  ownerDocument: Of,
  childNodes: Nf,
  parentNode: Pf,
  parentElement: Df,
  textContent: $f,
  contains: zf,
  getRootNode: Ff,
  host: Uf,
  styleSheets: Bf,
  shadowRoot: qf,
  querySelector: Wf,
  querySelectorAll: Hf,
  nowTimestamp: vc,
  mutationObserverCtor: jf,
  patch: Vf
};
function kc(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Wr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Ve.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Ve.shadowRoot(t) === e);
}
function Hr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Yf(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Gf(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function _s(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => wc(i, r)
    ).join("");
    return Yf(n);
  } catch {
    return null;
  }
}
function wc(e, t) {
  if (Kf(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      _s(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Gf(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Pn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Jf(e) && e.selectorText.includes(":") && (r = Xf(r)), t ? Pn(r, t) : r;
  }
}
function Xf(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Kf(e) {
  return "styleSheet" in e;
}
function Jf(e) {
  return "selectorText" in e;
}
class xc {
  constructor() {
    aa(this, "idNodeMap", /* @__PURE__ */ new Map()), aa(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Zf() {
  return new xc();
}
function On({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let a = i || "";
  const c = n && sr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? a = o(a, e) : a = "*".repeat(a.length)), a;
}
function sr(e) {
  return e.toLowerCase();
}
const ua = "__rrweb_original__";
function Qf(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, a = ua in o ? o[ua] : o;
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
function Nn(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    sr(t)
  ) : null;
}
function Sc(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function em(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const tm = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, rm = /^(?:[a-z+]+:)?\/\//i, nm = /^www\..*/i, im = /^(data:)([^,]*),(.*)/i;
function Pn(e, t) {
  return (e || "").replace(
    tm,
    (r, n, i, o, a, c) => {
      const l = i || a || c, p = n || o || "";
      if (!l)
        return r;
      if (rm.test(l) || nm.test(l))
        return `url(${p}${l}${p})`;
      if (im.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${em(t) + l}${p})`;
      const s = t.split("/"), h = l.split("/");
      s.pop();
      for (const d of h)
        d !== "." && (d === ".." ? s.pop() : s.push(d));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function gn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function sm(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = gn(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = gn(
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
              const g = gn(f).length;
              m = a.indexOf(d, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = gn(
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
function om(e, t) {
  return sm(e, t).join("/* rr_split */");
}
let am = 1;
const lm = new RegExp("[^a-z0-9-_:]"), Xr = -2;
function Cc() {
  return am++;
}
function cm(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = sr(e.tagName);
  return lm.test(t) ? "div" : t;
}
let yr, da;
const um = /^[^ \t\n\r\u000c]+/, dm = /^[, \t\n\r\u000c]+/;
function pm(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let a;
    const c = o.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(dm), !(r >= t.length); ) {
    let o = n(um);
    if (o.slice(-1) === ",")
      o = wr(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let a = "";
      o = wr(e, o);
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
const pa = /* @__PURE__ */ new WeakMap();
function wr(e, t) {
  return !t || t.trim() === "" ? t : qs(e, t);
}
function hm(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function qs(e, t) {
  let r = pa.get(e);
  if (r || (r = e.createElement("a"), pa.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Ec(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? wr(e, n) : r === "srcset" ? pm(e, n) : r === "style" ? Pn(n, qs(e)) : t === "object" && r === "data" ? wr(e, n) : n);
}
function Mc(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function fm(e, t, r) {
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
function Dn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Dn(Ve.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Dn(Ve.parentNode(e), t, r) : !1;
}
function Rc(e, t, r, n) {
  let i;
  if (kc(e)) {
    if (i = e, !Ve.childNodes(i).length)
      return !1;
  } else {
    if (Ve.parentElement(e) === null)
      return !1;
    i = Ve.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Dn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function mm(e, t, r) {
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
function gm(e, t, r) {
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
function ym(e, t) {
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
  } = t, x = bm(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: ze.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: ze.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: ze.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return km(e, {
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
      return vm(e, {
        doc: r,
        needsMask: a,
        maskTextFn: p,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: ze.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: ze.Comment,
        textContent: Ve.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function bm(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function vm(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, a = Ve.parentNode(e), c = a && a.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, s = c === "SCRIPT" ? !0 : void 0;
  return s ? l = "SCRIPT_PLACEHOLDER" : o || (l = Ve.textContent(e), p && l && (l = Pn(l, qs(t.doc)))), !p && !s && l && r && (l = n ? n(l, Ve.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: ze.Text,
    textContent: l || "",
    rootId: i
  };
}
function km(e, t) {
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
  } = t, m = fm(e, n, i), f = cm(e);
  let g = {};
  const x = e.attributes.length;
  for (let v = 0; v < x; v++) {
    const S = e.attributes[v];
    Mc(f, S.name, S.value) || (g[S.name] = Ec(
      r,
      f,
      sr(S.name),
      S.value
    ));
  }
  if (f === "link" && o) {
    const v = Array.from(r.styleSheets).find((k) => k.href === e.href);
    let S = null;
    v && (S = _s(v)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let v = _s(
      e.sheet
    );
    v && (e.childNodes.length > 1 && (v = om(v, e)), g._cssText = v);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const v = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && v ? g.value = On({
      element: e,
      type: Nn(e),
      tagName: f,
      value: v,
      maskInputOptions: a,
      maskInputFn: c
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !a.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      Qf(e) || (g.rr_dataURL = e.toDataURL(
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
    yr || (yr = r.createElement("canvas"), da = yr.getContext("2d"));
    const v = e, S = v.currentSrc || v.getAttribute("src") || "<unknown-src>", k = v.crossOrigin, w = () => {
      v.removeEventListener("load", w);
      try {
        yr.width = v.naturalWidth, yr.height = v.naturalHeight, da.drawImage(v, 0, 0), g.rr_dataURL = yr.toDataURL(
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
  let b;
  try {
    customElements.get(f) && (b = !0);
  } catch {
  }
  return {
    type: ze.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: hm(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: b
  };
}
function Se(e) {
  return e == null ? "" : e.toLowerCase();
}
function Ac(e) {
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
function wm(e, t) {
  if (t.comment && e.type === ze.Comment)
    return !0;
  if (e.type === ze.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Sc(e.attributes.href) === "js"))
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
function xr(e, t) {
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
    onIframeLoad: b,
    iframeLoadTimeout: v = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: k = 5e3,
    keepIframeSrcFn: w = () => !1,
    newlyAddedElement: M = !1,
    cssCaptured: L = !1
  } = t;
  let { needsMask: P } = t, { preserveWhiteSpace: N = !0 } = t;
  P || (P = Rc(
    e,
    a,
    c,
    P === void 0
  ));
  const Z = ym(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: P,
    inlineStylesheet: p,
    maskInputOptions: s,
    maskTextFn: h,
    maskInputFn: d,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: w,
    newlyAddedElement: M,
    cssCaptured: L
  });
  if (!Z)
    return console.warn(e, "not serialized"), null;
  let Y;
  n.hasNode(e) ? Y = n.getId(e) : wm(Z, u) || !N && Z.type === ze.Text && !Z.textContent.replace(/^\s+|\s+$/gm, "").length ? Y = Xr : Y = Cc();
  const _ = Object.assign(Z, { id: Y });
  if (n.add(e, _), Y === Xr)
    return null;
  x && x(e);
  let Le = !l;
  if (_.type === ze.Element) {
    Le = Le && !_.needBlock, delete _.needBlock;
    const X = Ve.shadowRoot(e);
    X && Hr(X) && (_.isShadowHost = !0);
  }
  if ((_.type === ze.Document || _.type === ze.Element) && Le) {
    u.headWhitespace && _.type === ze.Element && _.tagName === "head" && (N = !1);
    const X = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: o,
      needsMask: P,
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
      preserveWhiteSpace: N,
      onSerialize: x,
      onIframeLoad: b,
      iframeLoadTimeout: v,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: k,
      keepIframeSrcFn: w,
      cssCaptured: !1
    };
    if (!(_.type === ze.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === ze.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (X.cssCaptured = !0);
      for (const _e of Array.from(Ve.childNodes(e))) {
        const Re = xr(_e, X);
        Re && _.childNodes.push(Re);
      }
    }
    let re = null;
    if (kc(e) && (re = Ve.shadowRoot(e)))
      for (const _e of Array.from(Ve.childNodes(re))) {
        const Re = xr(_e, X);
        Re && (Hr(re) && (Re.isShadow = !0), _.childNodes.push(Re));
      }
  }
  const Fe = Ve.parentNode(e);
  return Fe && Wr(Fe) && Hr(Fe) && (_.isShadow = !0), _.type === ze.Element && _.tagName === "iframe" && mm(
    e,
    () => {
      const X = e.contentDocument;
      if (X && b) {
        const re = xr(X, {
          doc: X,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: P,
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
          preserveWhiteSpace: N,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: k,
          keepIframeSrcFn: w
        });
        re && b(
          e,
          re
        );
      }
    },
    v
  ), _.type === ze.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && Sc(_.attributes.href) === "css") && gm(
    e,
    () => {
      if (S) {
        const X = xr(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: P,
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
          preserveWhiteSpace: N,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: k,
          keepIframeSrcFn: w
        });
        X && S(
          e,
          X
        );
      }
    },
    k
  ), _;
}
function xm(e, t) {
  const {
    mirror: r = new xc(),
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
    iframeLoadTimeout: b,
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
  } : s, M = Ac(u);
  return xr(e, {
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
    iframeLoadTimeout: b,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: k,
    newlyAddedElement: !1
  });
}
function Sm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Cm(e) {
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
var yn = { exports: {} }, ha;
function Em() {
  if (ha) return yn.exports;
  ha = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return yn.exports = t(), yn.exports.createColors = t, yn.exports;
}
const Mm = {}, Rm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Mm
}, Symbol.toStringTag, { value: "Module" })), vt = /* @__PURE__ */ Cm(Rm);
var Si, fa;
function Ws() {
  if (fa) return Si;
  fa = 1;
  let e = /* @__PURE__ */ Em(), t = vt;
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
  return Si = r, r.default = r, Si;
}
var bn = {}, ma;
function Hs() {
  return ma || (ma = 1, bn.isClean = Symbol("isClean"), bn.my = Symbol("my")), bn;
}
var Ci, ga;
function Tc() {
  if (ga) return Ci;
  ga = 1;
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
  return Ci = r, r.default = r, Ci;
}
var Ei, ya;
function Vn() {
  if (ya) return Ei;
  ya = 1;
  let e = Tc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Ei = t, t.default = t, Ei;
}
var Mi, ba;
function Yn() {
  if (ba) return Mi;
  ba = 1;
  let { isClean: e, my: t } = Hs(), r = Ws(), n = Tc(), i = Vn();
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
  return Mi = a, a.default = a, Mi;
}
var Ri, va;
function Gn() {
  if (va) return Ri;
  va = 1;
  let e = Yn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ri = t, t.default = t, Ri;
}
var Ai, ka;
function Am() {
  if (ka) return Ai;
  ka = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Ai = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let a = "", c = o;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Ai;
}
var Ti, wa;
function _c() {
  if (wa) return Ti;
  wa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = vt, { existsSync: r, readFileSync: n } = vt, { dirname: i, join: o } = vt;
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
  return Ti = c, c.default = c, Ti;
}
var _i, xa;
function Xn() {
  if (xa) return _i;
  xa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = vt, { fileURLToPath: r, pathToFileURL: n } = vt, { isAbsolute: i, resolve: o } = vt, { nanoid: a } = /* @__PURE__ */ Am(), c = vt, l = Ws(), p = _c(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!d || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), d && h) {
        let x = new p(this.css, g);
        if (x.text) {
          this.map = x;
          let b = x.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, b = {}) {
      let v, S, k;
      if (g && typeof g == "object") {
        let M = g, L = x;
        if (typeof M.offset == "number") {
          let P = this.fromOffset(M.offset);
          g = P.line, x = P.col;
        } else
          g = M.line, x = M.column;
        if (typeof L.offset == "number") {
          let P = this.fromOffset(L.offset);
          S = P.line, k = P.col;
        } else
          S = L.line, k = L.column;
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
        b.plugin
      ) : v = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: k, line: S },
        this.css,
        this.file,
        b.plugin
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
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; b < v; )
          if (S = b + (v - b >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            b = S + 1;
          else {
            b = S;
            break;
          }
      }
      return {
        col: f - x[b] + 1,
        line: b + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, b) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let k;
      typeof x == "number" && (k = v.originalPositionFor({ column: b, line: x }));
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
      let L = v.sourceContentFor(S.source);
      return L && (M.source = L), M;
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
  return _i = u, u.default = u, c && c.registerInput && c.registerInput(u), _i;
}
var Li, Sa;
function Lc() {
  if (Sa) return Li;
  Sa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = vt, { dirname: r, relative: n, resolve: i, sep: o } = vt, { pathToFileURL: a } = vt, c = Xn(), l = !!(e && t), p = !!(r && i && n && o);
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
      this.stringify(this.root, (b, v, S) => {
        if (this.css += b, v && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, v && S !== "start") {
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
  return Li = s, Li;
}
var Ii, Ca;
function Kn() {
  if (Ca) return Ii;
  Ca = 1;
  let e = Yn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ii = t, t.default = t, Ii;
}
var Oi, Ea;
function or() {
  if (Ea) return Oi;
  Ea = 1;
  let { isClean: e, my: t } = Hs(), r = Gn(), n = Kn(), i = Yn(), o, a, c, l;
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
            ...f.map((g) => typeof g == "function" ? (x, b) => g(x.toProxy(), b) : g)
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
      for (let b of g) this.proxyOf.nodes.splice(f + 1, 0, b);
      let x;
      for (let b in this.indexes)
        x = this.indexes[b], f < x && (this.indexes[b] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let b;
      for (let v in this.indexes)
        b = this.indexes[v], f <= b && (this.indexes[v] = b + x.length);
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
  }, Oi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Oi;
}
var Ni, Ma;
function js() {
  if (Ma) return Ni;
  Ma = 1;
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
  }, Ni = n, n.default = n, Ni;
}
var Pi, Ra;
function Ic() {
  if (Ra) return Pi;
  Ra = 1;
  let e = {};
  return Pi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Pi;
}
var Di, Aa;
function Oc() {
  if (Aa) return Di;
  Aa = 1;
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
  return Di = e, e.default = e, Di;
}
var $i, Ta;
function Vs() {
  if (Ta) return $i;
  Ta = 1;
  let e = Oc();
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
  return $i = t, t.default = t, $i;
}
var zi, _a;
function Tm() {
  if (_a) return zi;
  _a = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, a = 12, c = 9, l = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, k = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return zi = function(L, P = {}) {
    let N = L.css.valueOf(), Z = P.ignoreErrors, Y, _, Le, Fe, X, re, _e, Re, ae, Q, ve = N.length, $ = 0, nt = [], qe = [];
    function wt() {
      return $;
    }
    function Ce(V) {
      throw L.error("Unclosed " + V, $);
    }
    function Ne() {
      return qe.length === 0 && $ >= ve;
    }
    function It(V) {
      if (qe.length) return qe.pop();
      if ($ >= ve) return;
      let me = V ? V.ignoreUnclosed : !1;
      switch (Y = N.charCodeAt($), Y) {
        case i:
        case o:
        case c:
        case l:
        case a: {
          _ = $;
          do
            _ += 1, Y = N.charCodeAt(_);
          while (Y === o || Y === i || Y === c || Y === l || Y === a);
          Q = ["space", N.slice($, _)], $ = _ - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ye = String.fromCharCode(Y);
          Q = [ye, ye, $];
          break;
        }
        case h: {
          if (Re = nt.length ? nt.pop()[1] : "", ae = N.charCodeAt($ + 1), Re === "url" && ae !== e && ae !== t && ae !== o && ae !== i && ae !== c && ae !== a && ae !== l) {
            _ = $;
            do {
              if (re = !1, _ = N.indexOf(")", _ + 1), _ === -1)
                if (Z || me) {
                  _ = $;
                  break;
                } else
                  Ce("bracket");
              for (_e = _; N.charCodeAt(_e - 1) === r; )
                _e -= 1, re = !re;
            } while (re);
            Q = ["brackets", N.slice($, _ + 1), $, _], $ = _;
          } else
            _ = N.indexOf(")", $ + 1), Fe = N.slice($, _ + 1), _ === -1 || k.test(Fe) ? Q = ["(", "(", $] : (Q = ["brackets", Fe, $, _], $ = _);
          break;
        }
        case e:
        case t: {
          Le = Y === e ? "'" : '"', _ = $;
          do {
            if (re = !1, _ = N.indexOf(Le, _ + 1), _ === -1)
              if (Z || me) {
                _ = $ + 1;
                break;
              } else
                Ce("string");
            for (_e = _; N.charCodeAt(_e - 1) === r; )
              _e -= 1, re = !re;
          } while (re);
          Q = ["string", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        case b: {
          v.lastIndex = $ + 1, v.test(N), v.lastIndex === 0 ? _ = N.length - 1 : _ = v.lastIndex - 2, Q = ["at-word", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        case r: {
          for (_ = $, X = !0; N.charCodeAt(_ + 1) === r; )
            _ += 1, X = !X;
          if (Y = N.charCodeAt(_ + 1), X && Y !== n && Y !== o && Y !== i && Y !== c && Y !== l && Y !== a && (_ += 1, w.test(N.charAt(_)))) {
            for (; w.test(N.charAt(_ + 1)); )
              _ += 1;
            N.charCodeAt(_ + 1) === o && (_ += 1);
          }
          Q = ["word", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        default: {
          Y === n && N.charCodeAt($ + 1) === g ? (_ = N.indexOf("*/", $ + 2) + 1, _ === 0 && (Z || me ? _ = N.length : Ce("comment")), Q = ["comment", N.slice($, _ + 1), $, _], $ = _) : (S.lastIndex = $ + 1, S.test(N), S.lastIndex === 0 ? _ = N.length - 1 : _ = S.lastIndex - 2, Q = ["word", N.slice($, _ + 1), $, _], nt.push(Q), $ = _);
          break;
        }
      }
      return $++, Q;
    }
    function xt(V) {
      qe.push(V);
    }
    return {
      back: xt,
      endOfFile: Ne,
      nextToken: It,
      position: wt
    };
  }, zi;
}
var Fi, La;
function Ys() {
  if (La) return Fi;
  La = 1;
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
  return Fi = t, t.default = t, e.registerAtRule(t), Fi;
}
var Ui, Ia;
function Qr() {
  if (Ia) return Ui;
  Ia = 1;
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
  }, Ui = n, n.default = n, e.registerRoot(n), Ui;
}
var Bi, Oa;
function Nc() {
  if (Oa) return Bi;
  Oa = 1;
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
  return Bi = e, e.default = e, Bi;
}
var qi, Na;
function Gs() {
  if (Na) return qi;
  Na = 1;
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
  return qi = r, r.default = r, e.registerRule(r), qi;
}
var Wi, Pa;
function _m() {
  if (Pa) return Wi;
  Pa = 1;
  let e = Gn(), t = Tm(), r = Kn(), n = Ys(), i = Qr(), o = Gs();
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
      let d, u, m, f = !1, g = !1, x = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), d = s[0], d === "(" || d === "[" ? b.push(d === "(" ? ")" : "]") : d === "{" && b.length > 0 ? b.push("}") : d === b[b.length - 1] && b.pop(), b.length === 0)
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
        let b = s[0][0];
        if (b === ":" || b === "space" || b === "comment")
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
      for (let b = s.length - 1; b >= 0; b--) {
        if (m = s[b], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(s, b);
          v = this.spacesFromEnd(s) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = s.slice(0), S = "";
          for (let k = b; k > 0; k--) {
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
      s.some((b) => b[0] !== "space" && b[0] !== "comment") && (d.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(d, "value", f.concat(s), h), d.value.includes(":") && !h && this.checkMissedSemicolon(s);
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
      let h = !1, d = null, u = !1, m = null, f = [], g = s[1].startsWith("--"), x = [], b = s;
      for (; b; ) {
        if (d = b[0], x.push(b), d === "(" || d === "[")
          m || (m = b), f.push(d === "(" ? ")" : "]");
        else if (g && u && d === "{")
          m || (m = b), f.push("}");
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
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (b = x[x.length - 1][0], !(b !== "space" && b !== "comment")); )
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
      let m, f, g = d.length, x = "", b = !0, v, S;
      for (let k = 0; k < g; k += 1)
        m = d[k], f = m[0], f === "space" && k === g - 1 && !u ? b = !1 : f === "comment" ? (S = d[k - 1] ? d[k - 1][0] : "empty", v = d[k + 1] ? d[k + 1][0] : "empty", !a[S] && !a[v] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
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
  return Wi = l, Wi;
}
var Hi, Da;
function Xs() {
  if (Da) return Hi;
  Da = 1;
  let e = or(), t = _m(), r = Xn();
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
  return Hi = n, n.default = n, e.registerParse(n), Hi;
}
var ji, $a;
function Pc() {
  if ($a) return ji;
  $a = 1;
  let { isClean: e, my: t } = Hs(), r = Lc(), n = Vn(), i = or(), o = js(), a = Ic(), c = Vs(), l = Xs(), p = Qr();
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
  let b = {};
  class v {
    constructor(k, w, M) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        L = x(w);
      else if (w instanceof v || w instanceof c)
        L = x(w.root), w.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = w.map);
      else {
        let P = l;
        M.syntax && (P = M.syntax.parse), M.parser && (P = M.parser), P.parse && (P = P.parse);
        try {
          L = P(w, M);
        } catch (N) {
          this.processed = !0, this.error = N;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(k, L, M), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
          let L = M.postcssPlugin, P = M.postcssVersion, N = this.result.processor.version, Z = P.split("."), Y = N.split(".");
          (Z[0] !== Y[0] || parseInt(Z[1]) > parseInt(Y[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + N + ", but " + L + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return k;
    }
    prepareVisitors() {
      this.listeners = {};
      let k = (w, M, L) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([w, L]);
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
                for (let L in w[M])
                  L === "*" ? k(w, M, w[M][L]) : k(
                    w,
                    M + "-" + L.toLowerCase(),
                    w[M][L]
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
          } catch (L) {
            throw this.handleError(L);
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
              } catch (L) {
                let P = w[w.length - 1].node;
                throw this.handleError(L, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (k.type === "document") {
                let L = k.nodes.map(
                  (P) => M(P, this.helpers)
                );
                await Promise.all(L);
              } else
                await M(k, this.helpers);
            } catch (L) {
              throw this.handleError(L);
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
      let L = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
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
      for (let [M, L] of k) {
        this.result.lastPlugin = M;
        let P;
        try {
          P = L(w, this.helpers);
        } catch (N) {
          throw this.handleError(N, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m(P))
          throw this.getAsyncError();
      }
    }
    visitTick(k) {
      let w = k[k.length - 1], { node: M, visitors: L } = w;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        k.pop();
        return;
      }
      if (L.length > 0 && w.visitorIndex < L.length) {
        let [N, Z] = L[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === L.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = N;
        try {
          return Z(M.toProxy(), this.helpers);
        } catch (Y) {
          throw this.handleError(Y, M);
        }
      }
      if (w.iterator !== 0) {
        let N = w.iterator, Z;
        for (; Z = M.nodes[M.indexes[N]]; )
          if (M.indexes[N] += 1, !Z[e]) {
            Z[e] = !0, k.push(g(Z));
            return;
          }
        w.iterator = 0, delete M.indexes[N];
      }
      let P = w.events;
      for (; w.eventIndex < P.length; ) {
        let N = P[w.eventIndex];
        if (w.eventIndex += 1, N === u) {
          M.nodes && M.nodes.length && (M[e] = !0, w.iterator = M.getIterator());
          return;
        } else if (this.listeners[N]) {
          w.visitors = this.listeners[N];
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
          k.nodes && k.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[M];
          if (L && this.visitSync(L, k.toProxy()))
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
    b = S;
  }, ji = v, v.default = v, p.registerLazyResult(v), o.registerLazyResult(v), ji;
}
var Vi, za;
function Lm() {
  if (za) return Vi;
  za = 1;
  let e = Lc(), t = Vn(), r = Ic(), n = Xs();
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
  return Vi = o, o.default = o, Vi;
}
var Yi, Fa;
function Im() {
  if (Fa) return Yi;
  Fa = 1;
  let e = Lm(), t = Pc(), r = js(), n = Qr();
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
  return Yi = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Yi;
}
var Gi, Ua;
function Om() {
  if (Ua) return Gi;
  Ua = 1;
  let e = Gn(), t = _c(), r = Kn(), n = Ys(), i = Xn(), o = Qr(), a = Gs();
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
  return Gi = c, c.default = c, Gi;
}
var Xi, Ba;
function Nm() {
  if (Ba) return Xi;
  Ba = 1;
  let e = Ws(), t = Gn(), r = Pc(), n = or(), i = Im(), o = Vn(), a = Om(), c = js(), l = Oc(), p = Kn(), s = Ys(), h = Vs(), d = Xn(), u = Xs(), m = Nc(), f = Gs(), g = Qr(), x = Yn();
  function b(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return b.plugin = function(S, k) {
    let w = !1;
    function M(...P) {
      console && console.warn && !w && (w = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let N = k(...P);
      return N.postcssPlugin = S, N.postcssVersion = new i().version, N;
    }
    let L;
    return Object.defineProperty(M, "postcss", {
      get() {
        return L || (L = M()), L;
      }
    }), M.process = function(P, N, Z) {
      return b([M(Z)]).process(P, N);
    }, M;
  }, b.stringify = o, b.parse = u, b.fromJSON = a, b.list = m, b.comment = (v) => new p(v), b.atRule = (v) => new s(v), b.decl = (v) => new t(v), b.rule = (v) => new f(v), b.root = (v) => new g(v), b.document = (v) => new c(v), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = l, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), Xi = b, b.default = b, Xi;
}
var Pm = Nm();
const Ae = /* @__PURE__ */ Sm(Pm);
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
var Dm = Object.defineProperty, $m = (e, t, r) => t in e ? Dm(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ot = (e, t, r) => $m(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function zm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Fm(e) {
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
var vn = { exports: {} }, qa;
function Um() {
  if (qa) return vn.exports;
  qa = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return vn.exports = t(), vn.exports.createColors = t, vn.exports;
}
const Bm = {}, qm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Bm
}, Symbol.toStringTag, { value: "Module" })), kt = /* @__PURE__ */ Fm(qm);
var Ki, Wa;
function Ks() {
  if (Wa) return Ki;
  Wa = 1;
  let e = /* @__PURE__ */ Um(), t = kt;
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
  return Ki = r, r.default = r, Ki;
}
var kn = {}, Ha;
function Js() {
  return Ha || (Ha = 1, kn.isClean = Symbol("isClean"), kn.my = Symbol("my")), kn;
}
var Ji, ja;
function Dc() {
  if (ja) return Ji;
  ja = 1;
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
  return Ji = r, r.default = r, Ji;
}
var Zi, Va;
function Jn() {
  if (Va) return Zi;
  Va = 1;
  let e = Dc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Zi = t, t.default = t, Zi;
}
var Qi, Ya;
function Zn() {
  if (Ya) return Qi;
  Ya = 1;
  let { isClean: e, my: t } = Js(), r = Ks(), n = Dc(), i = Jn();
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
  return Qi = a, a.default = a, Qi;
}
var es, Ga;
function Qn() {
  if (Ga) return es;
  Ga = 1;
  let e = Zn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return es = t, t.default = t, es;
}
var ts, Xa;
function Wm() {
  if (Xa) return ts;
  Xa = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return ts = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let a = "", c = o;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, ts;
}
var rs, Ka;
function $c() {
  if (Ka) return rs;
  Ka = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = kt, { existsSync: r, readFileSync: n } = kt, { dirname: i, join: o } = kt;
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
  return rs = c, c.default = c, rs;
}
var ns, Ja;
function ei() {
  if (Ja) return ns;
  Ja = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = kt, { fileURLToPath: r, pathToFileURL: n } = kt, { isAbsolute: i, resolve: o } = kt, { nanoid: a } = /* @__PURE__ */ Wm(), c = kt, l = Ks(), p = $c(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
  class u {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!d || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), d && h) {
        let x = new p(this.css, g);
        if (x.text) {
          this.map = x;
          let b = x.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, b = {}) {
      let v, S, k;
      if (g && typeof g == "object") {
        let M = g, L = x;
        if (typeof M.offset == "number") {
          let P = this.fromOffset(M.offset);
          g = P.line, x = P.col;
        } else
          g = M.line, x = M.column;
        if (typeof L.offset == "number") {
          let P = this.fromOffset(L.offset);
          S = P.line, k = P.col;
        } else
          S = L.line, k = L.column;
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
        b.plugin
      ) : v = new l(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: k, line: S },
        this.css,
        this.file,
        b.plugin
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
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; b < v; )
          if (S = b + (v - b >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            b = S + 1;
          else {
            b = S;
            break;
          }
      }
      return {
        col: f - x[b] + 1,
        line: b + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, b) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let k;
      typeof x == "number" && (k = v.originalPositionFor({ column: b, line: x }));
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
      let L = v.sourceContentFor(S.source);
      return L && (M.source = L), M;
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
  return ns = u, u.default = u, c && c.registerInput && c.registerInput(u), ns;
}
var is, Za;
function zc() {
  if (Za) return is;
  Za = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = kt, { dirname: r, relative: n, resolve: i, sep: o } = kt, { pathToFileURL: a } = kt, c = ei(), l = !!(e && t), p = !!(r && i && n && o);
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
      this.stringify(this.root, (b, v, S) => {
        if (this.css += b, v && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, v && S !== "start") {
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
  return is = s, is;
}
var ss, Qa;
function ti() {
  if (Qa) return ss;
  Qa = 1;
  let e = Zn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return ss = t, t.default = t, ss;
}
var os, el;
function ar() {
  if (el) return os;
  el = 1;
  let { isClean: e, my: t } = Js(), r = Qn(), n = ti(), i = Zn(), o, a, c, l;
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
            ...f.map((g) => typeof g == "function" ? (x, b) => g(x.toProxy(), b) : g)
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
      for (let b of g) this.proxyOf.nodes.splice(f + 1, 0, b);
      let x;
      for (let b in this.indexes)
        x = this.indexes[b], f < x && (this.indexes[b] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(u);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let b;
      for (let v in this.indexes)
        b = this.indexes[v], f <= b && (this.indexes[v] = b + x.length);
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
  }, os = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, os;
}
var as, tl;
function Zs() {
  if (tl) return as;
  tl = 1;
  let e = ar(), t, r;
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
  }, as = n, n.default = n, as;
}
var ls, rl;
function Fc() {
  if (rl) return ls;
  rl = 1;
  let e = {};
  return ls = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ls;
}
var cs, nl;
function Uc() {
  if (nl) return cs;
  nl = 1;
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
  return cs = e, e.default = e, cs;
}
var us, il;
function Qs() {
  if (il) return us;
  il = 1;
  let e = Uc();
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
  return us = t, t.default = t, us;
}
var ds, sl;
function Hm() {
  if (sl) return ds;
  sl = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, a = 12, c = 9, l = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, k = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return ds = function(L, P = {}) {
    let N = L.css.valueOf(), Z = P.ignoreErrors, Y, _, Le, Fe, X, re, _e, Re, ae, Q, ve = N.length, $ = 0, nt = [], qe = [];
    function wt() {
      return $;
    }
    function Ce(V) {
      throw L.error("Unclosed " + V, $);
    }
    function Ne() {
      return qe.length === 0 && $ >= ve;
    }
    function It(V) {
      if (qe.length) return qe.pop();
      if ($ >= ve) return;
      let me = V ? V.ignoreUnclosed : !1;
      switch (Y = N.charCodeAt($), Y) {
        case i:
        case o:
        case c:
        case l:
        case a: {
          _ = $;
          do
            _ += 1, Y = N.charCodeAt(_);
          while (Y === o || Y === i || Y === c || Y === l || Y === a);
          Q = ["space", N.slice($, _)], $ = _ - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ye = String.fromCharCode(Y);
          Q = [ye, ye, $];
          break;
        }
        case h: {
          if (Re = nt.length ? nt.pop()[1] : "", ae = N.charCodeAt($ + 1), Re === "url" && ae !== e && ae !== t && ae !== o && ae !== i && ae !== c && ae !== a && ae !== l) {
            _ = $;
            do {
              if (re = !1, _ = N.indexOf(")", _ + 1), _ === -1)
                if (Z || me) {
                  _ = $;
                  break;
                } else
                  Ce("bracket");
              for (_e = _; N.charCodeAt(_e - 1) === r; )
                _e -= 1, re = !re;
            } while (re);
            Q = ["brackets", N.slice($, _ + 1), $, _], $ = _;
          } else
            _ = N.indexOf(")", $ + 1), Fe = N.slice($, _ + 1), _ === -1 || k.test(Fe) ? Q = ["(", "(", $] : (Q = ["brackets", Fe, $, _], $ = _);
          break;
        }
        case e:
        case t: {
          Le = Y === e ? "'" : '"', _ = $;
          do {
            if (re = !1, _ = N.indexOf(Le, _ + 1), _ === -1)
              if (Z || me) {
                _ = $ + 1;
                break;
              } else
                Ce("string");
            for (_e = _; N.charCodeAt(_e - 1) === r; )
              _e -= 1, re = !re;
          } while (re);
          Q = ["string", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        case b: {
          v.lastIndex = $ + 1, v.test(N), v.lastIndex === 0 ? _ = N.length - 1 : _ = v.lastIndex - 2, Q = ["at-word", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        case r: {
          for (_ = $, X = !0; N.charCodeAt(_ + 1) === r; )
            _ += 1, X = !X;
          if (Y = N.charCodeAt(_ + 1), X && Y !== n && Y !== o && Y !== i && Y !== c && Y !== l && Y !== a && (_ += 1, w.test(N.charAt(_)))) {
            for (; w.test(N.charAt(_ + 1)); )
              _ += 1;
            N.charCodeAt(_ + 1) === o && (_ += 1);
          }
          Q = ["word", N.slice($, _ + 1), $, _], $ = _;
          break;
        }
        default: {
          Y === n && N.charCodeAt($ + 1) === g ? (_ = N.indexOf("*/", $ + 2) + 1, _ === 0 && (Z || me ? _ = N.length : Ce("comment")), Q = ["comment", N.slice($, _ + 1), $, _], $ = _) : (S.lastIndex = $ + 1, S.test(N), S.lastIndex === 0 ? _ = N.length - 1 : _ = S.lastIndex - 2, Q = ["word", N.slice($, _ + 1), $, _], nt.push(Q), $ = _);
          break;
        }
      }
      return $++, Q;
    }
    function xt(V) {
      qe.push(V);
    }
    return {
      back: xt,
      endOfFile: Ne,
      nextToken: It,
      position: wt
    };
  }, ds;
}
var ps, ol;
function eo() {
  if (ol) return ps;
  ol = 1;
  let e = ar();
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
  return ps = t, t.default = t, e.registerAtRule(t), ps;
}
var hs, al;
function en() {
  if (al) return hs;
  al = 1;
  let e = ar(), t, r;
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
  }, hs = n, n.default = n, e.registerRoot(n), hs;
}
var fs, ll;
function Bc() {
  if (ll) return fs;
  ll = 1;
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
  return fs = e, e.default = e, fs;
}
var ms, cl;
function to() {
  if (cl) return ms;
  cl = 1;
  let e = ar(), t = Bc();
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
  return ms = r, r.default = r, e.registerRule(r), ms;
}
var gs, ul;
function jm() {
  if (ul) return gs;
  ul = 1;
  let e = Qn(), t = Hm(), r = ti(), n = eo(), i = en(), o = to();
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
      let d, u, m, f = !1, g = !1, x = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), d = s[0], d === "(" || d === "[" ? b.push(d === "(" ? ")" : "]") : d === "{" && b.length > 0 ? b.push("}") : d === b[b.length - 1] && b.pop(), b.length === 0)
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
        let b = s[0][0];
        if (b === ":" || b === "space" || b === "comment")
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
      for (let b = s.length - 1; b >= 0; b--) {
        if (m = s[b], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(s, b);
          v = this.spacesFromEnd(s) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = s.slice(0), S = "";
          for (let k = b; k > 0; k--) {
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
      s.some((b) => b[0] !== "space" && b[0] !== "comment") && (d.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(d, "value", f.concat(s), h), d.value.includes(":") && !h && this.checkMissedSemicolon(s);
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
      let h = !1, d = null, u = !1, m = null, f = [], g = s[1].startsWith("--"), x = [], b = s;
      for (; b; ) {
        if (d = b[0], x.push(b), d === "(" || d === "[")
          m || (m = b), f.push(d === "(" ? ")" : "]");
        else if (g && u && d === "{")
          m || (m = b), f.push("}");
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
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!g)
          for (; x.length && (b = x[x.length - 1][0], !(b !== "space" && b !== "comment")); )
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
      let m, f, g = d.length, x = "", b = !0, v, S;
      for (let k = 0; k < g; k += 1)
        m = d[k], f = m[0], f === "space" && k === g - 1 && !u ? b = !1 : f === "comment" ? (S = d[k - 1] ? d[k - 1][0] : "empty", v = d[k + 1] ? d[k + 1][0] : "empty", !a[S] && !a[v] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
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
  return gs = l, gs;
}
var ys, dl;
function ro() {
  if (dl) return ys;
  dl = 1;
  let e = ar(), t = jm(), r = ei();
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
  return ys = n, n.default = n, e.registerParse(n), ys;
}
var bs, pl;
function qc() {
  if (pl) return bs;
  pl = 1;
  let { isClean: e, my: t } = Js(), r = zc(), n = Jn(), i = ar(), o = Zs(), a = Fc(), c = Qs(), l = ro(), p = en();
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
  let b = {};
  class v {
    constructor(k, w, M) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        L = x(w);
      else if (w instanceof v || w instanceof c)
        L = x(w.root), w.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = w.map);
      else {
        let P = l;
        M.syntax && (P = M.syntax.parse), M.parser && (P = M.parser), P.parse && (P = P.parse);
        try {
          L = P(w, M);
        } catch (N) {
          this.processed = !0, this.error = N;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(k, L, M), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
          let L = M.postcssPlugin, P = M.postcssVersion, N = this.result.processor.version, Z = P.split("."), Y = N.split(".");
          (Z[0] !== Y[0] || parseInt(Z[1]) > parseInt(Y[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + N + ", but " + L + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return k;
    }
    prepareVisitors() {
      this.listeners = {};
      let k = (w, M, L) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([w, L]);
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
                for (let L in w[M])
                  L === "*" ? k(w, M, w[M][L]) : k(
                    w,
                    M + "-" + L.toLowerCase(),
                    w[M][L]
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
          } catch (L) {
            throw this.handleError(L);
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
              } catch (L) {
                let P = w[w.length - 1].node;
                throw this.handleError(L, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (k.type === "document") {
                let L = k.nodes.map(
                  (P) => M(P, this.helpers)
                );
                await Promise.all(L);
              } else
                await M(k, this.helpers);
            } catch (L) {
              throw this.handleError(L);
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
      let L = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
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
      for (let [M, L] of k) {
        this.result.lastPlugin = M;
        let P;
        try {
          P = L(w, this.helpers);
        } catch (N) {
          throw this.handleError(N, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m(P))
          throw this.getAsyncError();
      }
    }
    visitTick(k) {
      let w = k[k.length - 1], { node: M, visitors: L } = w;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        k.pop();
        return;
      }
      if (L.length > 0 && w.visitorIndex < L.length) {
        let [N, Z] = L[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === L.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = N;
        try {
          return Z(M.toProxy(), this.helpers);
        } catch (Y) {
          throw this.handleError(Y, M);
        }
      }
      if (w.iterator !== 0) {
        let N = w.iterator, Z;
        for (; Z = M.nodes[M.indexes[N]]; )
          if (M.indexes[N] += 1, !Z[e]) {
            Z[e] = !0, k.push(g(Z));
            return;
          }
        w.iterator = 0, delete M.indexes[N];
      }
      let P = w.events;
      for (; w.eventIndex < P.length; ) {
        let N = P[w.eventIndex];
        if (w.eventIndex += 1, N === u) {
          M.nodes && M.nodes.length && (M[e] = !0, w.iterator = M.getIterator());
          return;
        } else if (this.listeners[N]) {
          w.visitors = this.listeners[N];
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
          k.nodes && k.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[M];
          if (L && this.visitSync(L, k.toProxy()))
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
    b = S;
  }, bs = v, v.default = v, p.registerLazyResult(v), o.registerLazyResult(v), bs;
}
var vs, hl;
function Vm() {
  if (hl) return vs;
  hl = 1;
  let e = zc(), t = Jn(), r = Fc(), n = ro();
  const i = Qs();
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
  return vs = o, o.default = o, vs;
}
var ks, fl;
function Ym() {
  if (fl) return ks;
  fl = 1;
  let e = Vm(), t = qc(), r = Zs(), n = en();
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
  return ks = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ks;
}
var ws, ml;
function Gm() {
  if (ml) return ws;
  ml = 1;
  let e = Qn(), t = $c(), r = ti(), n = eo(), i = ei(), o = en(), a = to();
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
  return ws = c, c.default = c, ws;
}
var xs, gl;
function Xm() {
  if (gl) return xs;
  gl = 1;
  let e = Ks(), t = Qn(), r = qc(), n = ar(), i = Ym(), o = Jn(), a = Gm(), c = Zs(), l = Uc(), p = ti(), s = eo(), h = Qs(), d = ei(), u = ro(), m = Bc(), f = to(), g = en(), x = Zn();
  function b(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return b.plugin = function(S, k) {
    let w = !1;
    function M(...P) {
      console && console.warn && !w && (w = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let N = k(...P);
      return N.postcssPlugin = S, N.postcssVersion = new i().version, N;
    }
    let L;
    return Object.defineProperty(M, "postcss", {
      get() {
        return L || (L = M()), L;
      }
    }), M.process = function(P, N, Z) {
      return b([M(Z)]).process(P, N);
    }, M;
  }, b.stringify = o, b.parse = u, b.fromJSON = a, b.list = m, b.comment = (v) => new p(v), b.atRule = (v) => new s(v), b.decl = (v) => new t(v), b.rule = (v) => new f(v), b.root = (v) => new g(v), b.document = (v) => new c(v), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = l, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), xs = b, b.default = b, xs;
}
var Km = Xm();
const Te = /* @__PURE__ */ zm(Km);
Te.stringify;
Te.fromJSON;
Te.plugin;
Te.parse;
Te.list;
Te.document;
Te.comment;
Te.atRule;
Te.rule;
Te.decl;
Te.root;
Te.CssSyntaxError;
Te.Declaration;
Te.Container;
Te.Processor;
Te.Document;
Te.Comment;
Te.Warning;
Te.AtRule;
Te.Result;
Te.Input;
Te.Rule;
Te.Root;
Te.Node;
class no {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    ot(this, "parentElement", null), ot(this, "parentNode", null), ot(this, "ownerDocument"), ot(this, "firstChild", null), ot(this, "lastChild", null), ot(this, "previousSibling", null), ot(this, "nextSibling", null), ot(this, "ELEMENT_NODE", 1), ot(this, "TEXT_NODE", 3), ot(this, "nodeType"), ot(this, "nodeName"), ot(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof no) {
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
const yl = {
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
}, bl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, wn = {}, Wc = {}, Jm = () => !!globalThis.Zone;
function io(e) {
  if (wn[e])
    return wn[e];
  const t = globalThis[e], r = t.prototype, n = e in yl ? yl[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in bl ? bl[e] : void 0, a = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Jm())
    return wn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Wc[e] = () => c.remove()) : c.remove(), wn[e] = p;
  } catch {
    return r;
  }
}
const Ss = {};
function Dt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ss[i])
    return Ss[i].call(
      t
    );
  const o = io(e), a = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return a ? (Ss[i] = a, a.call(t)) : t[r];
}
const Cs = {};
function Hc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Cs[n])
    return Cs[n].bind(
      t
    );
  const o = io(e)[r];
  return typeof o != "function" ? t[r] : (Cs[n] = o, o.bind(t));
}
function Zm(e) {
  return Dt("Node", e, "ownerDocument");
}
function Qm(e) {
  return Dt("Node", e, "childNodes");
}
function eg(e) {
  return Dt("Node", e, "parentNode");
}
function tg(e) {
  return Dt("Node", e, "parentElement");
}
function rg(e) {
  return Dt("Node", e, "textContent");
}
function ng(e, t) {
  return Hc("Node", e, "contains")(t);
}
function ig(e) {
  return Hc("Node", e, "getRootNode")();
}
function sg(e) {
  return !e || !("host" in e) ? null : Dt("ShadowRoot", e, "host");
}
function og(e) {
  return e.styleSheets;
}
function ag(e) {
  return !e || !("shadowRoot" in e) ? null : Dt("Element", e, "shadowRoot");
}
function lg(e, t) {
  return Dt("Element", e, "querySelector")(t);
}
function cg(e, t) {
  return Dt("Element", e, "querySelectorAll")(t);
}
function jc() {
  return [
    io("MutationObserver").constructor,
    Wc.MutationObserver ?? (() => {
    })
  ];
}
let Kr = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Kr = () => (/* @__PURE__ */ new Date()).getTime());
function lr(e, t, r) {
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
  ownerDocument: Zm,
  childNodes: Qm,
  parentNode: eg,
  parentElement: tg,
  textContent: rg,
  contains: ng,
  getRootNode: ig,
  host: sg,
  styleSheets: og,
  shadowRoot: ag,
  querySelector: lg,
  querySelectorAll: cg,
  nowTimestamp: Kr,
  mutationObserverCtor: jc,
  patch: lr
};
function Je(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const vr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let vl = {
  map: {},
  getId() {
    return console.error(vr), -1;
  },
  getNode() {
    return console.error(vr), null;
  },
  removeNodeFromMap() {
    console.error(vr);
  },
  has() {
    return console.error(vr), !1;
  },
  reset() {
    console.error(vr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (vl = new Proxy(vl, {
  get(e, t, r) {
    return t === "map" && console.error(vr), Reflect.get(e, t, r);
  }
}));
function Jr(e, t, r = {}) {
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
function ri(e, t, r, n, i = window) {
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
  ), () => ri(e, t, o || {}, !0);
}
function Vc(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = oe.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = oe.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Yc() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Gc() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Xc(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : oe.parentElement(e) : null;
}
function Ze(e, t, r, n) {
  if (!e)
    return !1;
  const i = Xc(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Dn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function ug(e, t) {
  return t.getId(e) !== -1;
}
function Es(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Xr;
}
function Kc(e, t) {
  if (Wr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = oe.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Kc(n, t) : !0;
}
function Ls(e) {
  return !!e.changedTouches;
}
function dg(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Jc(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Zc(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Is(e) {
  return e ? e instanceof no && "shadowRoot" in e ? !!e.shadowRoot : !!oe.shadowRoot(e) : !1;
}
class pg {
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
function Qc(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = oe.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && oe.host(oe.getRootNode(e)) && (r = oe.host(oe.getRootNode(e))), r;
}
function hg(e) {
  let t = e, r;
  for (; r = Qc(t); )
    t = r;
  return t;
}
function fg(e) {
  const t = oe.ownerDocument(e);
  if (!t) return !1;
  const r = hg(e);
  return oe.contains(t, r);
}
function eu(e) {
  const t = oe.ownerDocument(e);
  return t ? oe.contains(t, e) || fg(e) : !1;
}
var ge = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(ge || {}), ce = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(ce || {}), rt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(rt || {}), Nt = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(Nt || {}), Ir = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Ir || {}), kr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(kr || {}), tu = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(tu || {});
function kl(e) {
  return "__ln" in e;
}
class mg {
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
    if (t.__ln = r, t.previousSibling && kl(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && kl(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const wl = (e, t) => `${e}@${t}`;
class gg {
  constructor() {
    W(this, "frozen", !1), W(this, "locked", !1), W(this, "texts", []), W(this, "attributes", []), W(this, "attributeMap", /* @__PURE__ */ new WeakMap()), W(this, "removes", []), W(this, "mapRemoves", []), W(this, "movedMap", {}), W(this, "addedSet", /* @__PURE__ */ new Set()), W(this, "movedSet", /* @__PURE__ */ new Set()), W(this, "droppedSet", /* @__PURE__ */ new Set()), W(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), W(this, "mutationCb"), W(this, "blockClass"), W(this, "blockSelector"), W(this, "maskTextClass"), W(this, "maskTextSelector"), W(this, "inlineStylesheet"), W(this, "maskInputOptions"), W(this, "maskTextFn"), W(this, "maskInputFn"), W(this, "keepIframeSrcFn"), W(this, "recordCanvas"), W(this, "inlineImages"), W(this, "slimDOMOptions"), W(this, "dataURLOptions"), W(this, "doc"), W(this, "mirror"), W(this, "iframeManager"), W(this, "stylesheetManager"), W(this, "shadowDomManager"), W(this, "canvasManager"), W(this, "processedNodeManager"), W(this, "unattachedDoc"), W(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), W(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new mg(), i = (l) => {
        let p = l, s = Xr;
        for (; s === Xr; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (l) => {
        const p = oe.parentNode(l);
        if (!p || !eu(l))
          return;
        let s = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = Wr(p) ? this.mirror.getId(Qc(l)) : this.mirror.getId(p), d = i(l);
        if (h === -1 || d === -1)
          return n.addNode(l);
        const u = xr(l, {
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
            Jc(m, this.mirror) && this.iframeManager.addIframe(m), Zc(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Is(l) && this.shadowDomManager.addShadowRoot(oe.shadowRoot(l), this.doc);
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
        xl(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(oe.parentNode(l)) || o(l);
      for (const l of this.addedSet)
        !Sl(this.droppedSet, l) && !xl(this.removesSubTreeCache, l, this.mirror) || Sl(this.movedSet, l) ? o(l) : this.droppedSet.add(l);
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
    }), W(this, "genTextAreaValueMutation", (t) => {
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
      r.attributes.value = On({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Nn(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), W(this, "processMutation", (t) => {
      if (!Es(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = oe.textContent(t.target);
            !Ze(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Rc(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Xc(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Nn(r);
              i = On({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Ze(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Mc(r.tagName, n))
              if (o.attributes[n] = Ec(
                this.doc,
                sr(r.tagName),
                sr(n),
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
            if (Ze(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Wr(t.target) ? this.mirror.getId(oe.host(t.target)) : this.mirror.getId(t.target);
              Ze(t.target, this.blockClass, this.blockSelector, !1) || Es(r, this.mirror, this.slimDOMOptions) || !ug(r, this.mirror) || (this.addedSet.has(r) ? (Os(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Kc(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[wl(n, i)] ? Os(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Wr(t.target) && Hr(t.target) ? !0 : void 0
              }), yg(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), W(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Es(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[wl(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Ze(t, this.blockClass, this.blockSelector, !1) || (oe.childNodes(t).forEach((n) => this.genAdds(n)), Is(t) && oe.childNodes(oe.shadowRoot(t)).forEach((n) => {
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
function Os(e, t) {
  e.delete(t), oe.childNodes(t).forEach((r) => Os(e, r));
}
function yg(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), oe.childNodes(n).forEach((i) => r.push(i)));
  }
}
function xl(e, t, r) {
  return e.size === 0 ? !1 : bg(e, t);
}
function bg(e, t, r) {
  const n = oe.parentNode(t);
  return n ? e.has(n) : !1;
}
function Sl(e, t) {
  return e.size === 0 ? !1 : ru(e, t);
}
function ru(e, t) {
  const r = oe.parentNode(t);
  return r ? e.has(r) ? !0 : ru(e, r) : !1;
}
let jr;
function vg(e) {
  jr = e;
}
function kg() {
  jr = void 0;
}
const fe = (e) => jr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (jr && jr(n) === !0)
      return;
    throw n;
  }
} : e, rr = [];
function tn(e) {
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
function nu(e, t) {
  const r = new gg();
  rr.push(r), r.init(e);
  const [n, i] = jc(), o = new n(
    fe(r.processMutations.bind(r))
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
function wg({
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
  const l = Jr(
    fe(
      (h) => {
        const d = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= d, u)),
          h
        ), a = [], c = null;
      }
    ),
    o
  ), p = fe(
    Jr(
      fe((h) => {
        const d = tn(h), { clientX: u, clientY: m } = Ls(h) ? h.changedTouches[0] : h;
        c || (c = Kr()), a.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: Kr() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? ce.Drag : h instanceof MouseEvent ? ce.MouseMove : ce.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    Je("mousemove", p, r),
    Je("touchmove", p, r),
    Je("drag", p, r)
  ];
  return fe(() => {
    s.forEach((h) => h());
  });
}
function xg({
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
    const d = tn(h);
    if (Ze(d, n, i, !0))
      return;
    let u = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = Nt.Mouse;
          break;
        case "touch":
          u = Nt.Touch;
          break;
        case "pen":
          u = Nt.Pen;
          break;
      }
      u === Nt.Touch ? rt[s] === rt.MouseDown ? m = "TouchStart" : rt[s] === rt.MouseUp && (m = "TouchEnd") : Nt.Pen;
    } else Ls(h) && (u = Nt.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === Nt.Touch || m.startsWith("Mouse") && u === Nt.Mouse) && (u = null)) : rt[s] === rt.Click && (u = l, l = null);
    const f = Ls(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(d), { clientX: x, clientY: b } = f;
    fe(e)({
      type: rt[m],
      id: g,
      x,
      y: b,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(rt).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && a[s] !== !1
  ).forEach((s) => {
    let h = sr(s);
    const d = p(s);
    if (window.PointerEvent)
      switch (rt[s]) {
        case rt.MouseDown:
        case rt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case rt.TouchStart:
        case rt.TouchEnd:
          return;
      }
    c.push(Je(h, d, t));
  }), fe(() => {
    c.forEach((s) => s());
  });
}
function iu({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const a = fe(
    Jr(
      fe((c) => {
        const l = tn(c);
        if (!l || Ze(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const s = Vc(t.defaultView);
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
  return Je("scroll", a, t);
}
function Sg({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = fe(
    Jr(
      fe(() => {
        const o = Yc(), a = Gc();
        (r !== o || n !== a) && (e({
          width: Number(a),
          height: Number(o)
        }), r = o, n = a);
      }),
      200
    )
  );
  return Je("resize", i, t);
}
const Cg = ["INPUT", "TEXTAREA", "SELECT"], Cl = /* @__PURE__ */ new WeakMap();
function Eg({
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
  function h(b) {
    let v = tn(b);
    const S = b.isTrusted, k = v && v.tagName;
    if (v && k === "OPTION" && (v = oe.parentElement(v)), !v || !k || Cg.indexOf(k) < 0 || Ze(v, n, i, !0) || v.classList.contains(o) || a && v.matches(a))
      return;
    let w = v.value, M = !1;
    const L = Nn(v) || "";
    L === "radio" || L === "checkbox" ? M = v.checked : (c[k.toLowerCase()] || c[L]) && (w = On({
      element: v,
      maskInputOptions: c,
      tagName: k,
      type: L,
      value: w,
      maskInputFn: l
    })), d(
      v,
      s ? { text: w, isChecked: M, userTriggered: S } : { text: w, isChecked: M }
    );
    const P = v.name;
    L === "radio" && P && M && t.querySelectorAll(`input[type="radio"][name="${P}"]`).forEach((N) => {
      if (N !== v) {
        const Z = N.value;
        d(
          N,
          s ? { text: Z, isChecked: !M, userTriggered: !1 } : { text: Z, isChecked: !M }
        );
      }
    });
  }
  function d(b, v) {
    const S = Cl.get(b);
    if (!S || S.text !== v.text || S.isChecked !== v.isChecked) {
      Cl.set(b, v);
      const k = r.getId(b);
      fe(e)({
        ...v,
        id: k
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => Je(b, fe(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((b) => b());
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
      (b) => ri(
        b[0],
        b[1],
        {
          set() {
            fe(h)({
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
  ), fe(() => {
    m.forEach((b) => b());
  });
}
function $n(e) {
  const t = [];
  function r(n, i) {
    if (xn("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || xn("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || xn("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || xn("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Bt(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Mg({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: fe(
      (s, h, d) => {
        const [u, m] = d, { id: f, styleId: g } = Bt(
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
    apply: fe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = Bt(
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
    apply: fe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = Bt(
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
    apply: fe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = Bt(
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
  Sn("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Sn("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Sn("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Sn("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: fe(
          (d, u, m) => {
            const [f, g] = m, { id: x, styleId: b } = Bt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (x && x !== -1 || b && b !== -1) && e({
              id: x,
              styleId: b,
              adds: [
                {
                  rule: f,
                  index: [
                    ...$n(u),
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
        apply: fe(
          (d, u, m) => {
            const [f] = m, { id: g, styleId: x } = Bt(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...$n(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), fe(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function su({
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
  }), fe(() => {
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
function Rg({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: fe(
      (c, l, p) => {
        var s;
        const [h, d, u] = p;
        if (r.has(h))
          return o.apply(l, [h, d, u]);
        const { id: m, styleId: f } = Bt(
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
          index: $n(l.parentRule)
        }), c.apply(l, p);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: fe(
      (c, l, p) => {
        var s;
        const [h] = p;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: d, styleId: u } = Bt(
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
          index: $n(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), fe(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Ag({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const a = fe(
    (l) => Jr(
      fe((p) => {
        const s = tn(p);
        if (!s || Ze(s, t, r, !0))
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
    Je("play", a(kr.Play), o),
    Je("pause", a(kr.Pause), o),
    Je("seeked", a(kr.Seeked), o),
    Je("volumechange", a(kr.VolumeChange), o),
    Je("ratechange", a(kr.RateChange), o)
  ];
  return fe(() => {
    c.forEach((l) => l());
  });
}
function Tg({ fontCb: e, doc: t }) {
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
  const a = lr(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          fe(() => {
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
  }), n.push(a), fe(() => {
    n.forEach((c) => c());
  });
}
function _g(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let a = !0;
  const c = fe(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const p = [], s = l.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const d = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = d;
      Ze(u, n, i, !0) || Ze(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return c(), Je("selectionchange", c);
}
function Lg({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : lr(
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
function Ig(e, t) {
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
function Og(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Ig(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = nu(e, e.doc));
  const o = wg(e), a = xg(e), c = iu(e), l = Sg(e, {
    win: r
  }), p = Eg(e), s = Ag(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Mg(e, { win: r }), d = su(e, e.doc), u = Rg(e, {
    win: r
  }), e.collectFonts && (m = Tg(e)));
  const f = _g(e), g = Lg(e), x = [];
  for (const b of e.plugins)
    x.push(
      b.observer(b.callback, r, b.options)
    );
  return fe(() => {
    rr.forEach((b) => b.reset()), n == null || n.disconnect(), i(), o(), a(), c(), l(), p(), s(), h(), d(), u(), m(), f(), g(), x.forEach((b) => b());
  });
}
function xn(e) {
  return typeof window[e] < "u";
}
function Sn(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class El {
  constructor(t) {
    W(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), W(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class Ng {
  constructor(t) {
    W(this, "iframes", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), W(this, "crossOriginIframeMirror", new El(Cc)), W(this, "crossOriginIframeStyleMirror"), W(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), W(this, "mirror"), W(this, "mutationCb"), W(this, "wrappedEmit"), W(this, "loadListener"), W(this, "stylesheetManager"), W(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new El(
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
      case ge.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: ge.IncrementalSnapshot,
          data: {
            source: ce.Mutation,
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
      case ge.Meta:
      case ge.Load:
      case ge.DomContentLoaded:
        return !1;
      case ge.Plugin:
        return r;
      case ge.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case ge.IncrementalSnapshot:
        switch (r.data.source) {
          case ce.Mutation:
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
          case ce.Drag:
          case ce.TouchMove:
          case ce.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case ce.ViewportResize:
            return !1;
          case ce.MediaInteraction:
          case ce.MouseInteraction:
          case ce.Scroll:
          case ce.CanvasMutation:
          case ce.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case ce.StyleSheetRule:
          case ce.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case ce.Font:
            return r;
          case ce.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case ce.AdoptedStyleSheet:
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
    t.type !== tu.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Pg {
  constructor(t) {
    W(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "scrollCb"), W(this, "bypassOptions"), W(this, "mirror"), W(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Hr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = nu(
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
      iu({
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
        su(
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
      lr(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const a = i.call(this, o), c = oe.shadowRoot(this);
            return c && eu(this) && n.addShadowRoot(c, r), a;
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
var Sr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Dg = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Cn = 0; Cn < Sr.length; Cn++)
  Dg[Sr.charCodeAt(Cn)] = Cn;
var $g = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Sr[t[r] >> 2], i += Sr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Sr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Sr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Ml = /* @__PURE__ */ new Map();
function zg(e, t) {
  let r = Ml.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Ml.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const ou = (e, t, r) => {
  if (!e || !(lu(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = zg(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function Rn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Rn(n, t, r));
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
    const n = e.constructor.name, i = $g(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Rn(e.buffer, t, r),
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
          args: [Rn(e.data, t, r), e.width, e.height]
        };
      if (lu(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = ou(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const au = (e, t, r) => e.map((n) => Rn(n, t, r)), lu = (e, t) => !![
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
function Fg(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = lr(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...p) {
            return Ze(this.canvas, r, n, !0) || setTimeout(() => {
              const s = au(p, t, this);
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
      const c = ri(
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
function Ug(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Rl(e, t, r, n) {
  const i = [];
  try {
    const o = lr(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!Ze(this, t, r, !0)) {
            const p = Ug(c);
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
function Al(e, t, r, n, i, o) {
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
        const p = lr(
          e,
          l,
          function(s) {
            return function(...h) {
              const d = s.apply(this, h);
              if (ou(d, o, this), "tagName" in this.canvas && !Ze(this.canvas, n, i, !0)) {
                const u = au(h, o, this), m = {
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
        const p = ri(e, l, {
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
function Bg(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Al(
      t.WebGLRenderingContext.prototype,
      Ir.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Al(
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
const cu = `(function() {
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
`, Tl = typeof self < "u" && self.Blob && new Blob([cu], { type: "text/javascript;charset=utf-8" });
function qg(e) {
  let t;
  try {
    if (t = Tl && (self.URL || self.webkitURL).createObjectURL(Tl), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(cu),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Wg {
  constructor(t) {
    W(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), W(this, "rafStamps", { latestId: 0, invokeId: null }), W(this, "mirror"), W(this, "mutationCb"), W(this, "resetObservers"), W(this, "frozen", !1), W(this, "locked", !1), W(this, "processMutation", (l, p) => {
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
    const a = Rl(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new qg();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: b, height: v } = m.data;
      this.mutationCb({
        id: f,
        type: Ir["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, b, v]
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
        Ze(f, n, i, !0) || m.push(f);
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
        const b = await createImageBitmap(f);
        l.postMessage(
          {
            id: x,
            bitmap: b,
            width: f.width,
            height: f.height,
            dataURLOptions: o.dataURLOptions
          },
          [b]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Rl(
      t,
      r,
      n,
      !1
    ), o = Fg(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = Bg(
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
class Hg {
  constructor(t) {
    W(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), W(this, "mutationCb"), W(this, "adoptedStyleSheetCb"), W(this, "styleMirror", new pg()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: wc(c, o.href),
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
class jg {
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
let Ie, An, Ms, zn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((oa = e.contentWindow) == null ? void 0 : oa.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const ft = Zf();
function jt(e = {}) {
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
    sampling: b = {},
    dataURLOptions: v = {},
    mousemoveWait: S,
    recordDOM: k = !0,
    recordCanvas: w = !1,
    recordCrossOriginIframes: M = !1,
    recordAfter: L = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: P = !1,
    collectFonts: N = !1,
    inlineImages: Z = !1,
    plugins: Y,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: Le = /* @__PURE__ */ new Set([]),
    errorHandler: Fe
  } = e;
  vg(Fe);
  const X = M ? window.parent === window : !0;
  let re = !1;
  if (!X)
    try {
      window.parent.document && (re = !1);
    } catch {
      re = !0;
    }
  if (X && !t)
    throw new Error("emit function is required");
  if (!X && !re)
    return () => {
    };
  S !== void 0 && b.mousemove === void 0 && (b.mousemove = S), ft.reset();
  const _e = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, Re = Ac(u);
  dg();
  let ae, Q = 0;
  const ve = (V) => {
    for (const me of Y || [])
      me.eventProcessor && (V = me.eventProcessor(V));
    return x && // Disable packing events which will be emitted to parent frames.
    !re && (V = x(V)), V;
  };
  Ie = (V, me) => {
    var ye;
    const Ee = V;
    if (Ee.timestamp = Kr(), (ye = rr[0]) != null && ye.isFrozen() && Ee.type !== ge.FullSnapshot && !(Ee.type === ge.IncrementalSnapshot && Ee.data.source === ce.Mutation) && rr.forEach((Pe) => Pe.unfreeze()), X)
      t == null || t(ve(Ee), me);
    else if (re) {
      const Pe = {
        type: "rrweb",
        event: ve(Ee),
        origin: window.location.origin,
        isCheckout: me
      };
      window.parent.postMessage(Pe, "*");
    }
    if (Ee.type === ge.FullSnapshot)
      ae = Ee, Q = 0;
    else if (Ee.type === ge.IncrementalSnapshot) {
      if (Ee.data.source === ce.Mutation && Ee.data.isAttachIframe)
        return;
      Q++;
      const Pe = n && Q >= n, be = r && Ee.timestamp - ae.timestamp > r;
      (Pe || be) && An(!0);
    }
  };
  const $ = (V) => {
    Ie({
      type: ge.IncrementalSnapshot,
      data: {
        source: ce.Mutation,
        ...V
      }
    });
  }, nt = (V) => Ie({
    type: ge.IncrementalSnapshot,
    data: {
      source: ce.Scroll,
      ...V
    }
  }), qe = (V) => Ie({
    type: ge.IncrementalSnapshot,
    data: {
      source: ce.CanvasMutation,
      ...V
    }
  }), wt = (V) => Ie({
    type: ge.IncrementalSnapshot,
    data: {
      source: ce.AdoptedStyleSheet,
      ...V
    }
  }), Ce = new Hg({
    mutationCb: $,
    adoptedStyleSheetCb: wt
  }), Ne = new Ng({
    mirror: ft,
    mutationCb: $,
    stylesheetManager: Ce,
    recordCrossOriginIframes: M,
    wrappedEmit: Ie
  });
  for (const V of Y || [])
    V.getMirror && V.getMirror({
      nodeMirror: ft,
      crossOriginIframeMirror: Ne.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Ne.crossOriginIframeStyleMirror
    });
  const It = new jg();
  Ms = new Wg({
    recordCanvas: w,
    mutationCb: qe,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: ft,
    sampling: b.canvas,
    dataURLOptions: v
  });
  const xt = new Pg({
    mutationCb: $,
    scrollCb: nt,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: _e,
      dataURLOptions: v,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: w,
      inlineImages: Z,
      sampling: b,
      slimDOMOptions: Re,
      iframeManager: Ne,
      stylesheetManager: Ce,
      canvasManager: Ms,
      keepIframeSrcFn: _,
      processedNodeManager: It
    },
    mirror: ft
  });
  An = (V = !1) => {
    if (!k)
      return;
    Ie(
      {
        type: ge.Meta,
        data: {
          href: window.location.href,
          width: Gc(),
          height: Yc()
        }
      },
      V
    ), Ce.reset(), xt.init(), rr.forEach((ye) => ye.lock());
    const me = xm(document, {
      mirror: ft,
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: _e,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Re,
      dataURLOptions: v,
      recordCanvas: w,
      inlineImages: Z,
      onSerialize: (ye) => {
        Jc(ye, ft) && Ne.addIframe(ye), Zc(ye, ft) && Ce.trackLinkElement(ye), Is(ye) && xt.addShadowRoot(oe.shadowRoot(ye), document);
      },
      onIframeLoad: (ye, Ee) => {
        Ne.attachIframe(ye, Ee), xt.observeAttachShadow(ye);
      },
      onStylesheetLoad: (ye, Ee) => {
        Ce.attachLinkElement(ye, Ee);
      },
      keepIframeSrcFn: _
    });
    if (!me)
      return console.warn("Failed to snapshot the document");
    Ie(
      {
        type: ge.FullSnapshot,
        data: {
          node: me,
          initialOffset: Vc(window)
        }
      },
      V
    ), rr.forEach((ye) => ye.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Ce.adoptStyleSheets(
      document.adoptedStyleSheets,
      ft.getId(document)
    );
  };
  try {
    const V = [], me = (Ee) => {
      var Pe;
      return fe(Og)(
        {
          mutationCb: $,
          mousemoveCb: (be, cr) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: cr,
              positions: be
            }
          }),
          mouseInteractionCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.MouseInteraction,
              ...be
            }
          }),
          scrollCb: nt,
          viewportResizeCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.ViewportResize,
              ...be
            }
          }),
          inputCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.Input,
              ...be
            }
          }),
          mediaInteractionCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.MediaInteraction,
              ...be
            }
          }),
          styleSheetRuleCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.StyleSheetRule,
              ...be
            }
          }),
          styleDeclarationCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.StyleDeclaration,
              ...be
            }
          }),
          canvasMutationCb: qe,
          fontCb: (be) => Ie({
            type: ge.IncrementalSnapshot,
            data: {
              source: ce.Font,
              ...be
            }
          }),
          selectionCb: (be) => {
            Ie({
              type: ge.IncrementalSnapshot,
              data: {
                source: ce.Selection,
                ...be
              }
            });
          },
          customElementCb: (be) => {
            Ie({
              type: ge.IncrementalSnapshot,
              data: {
                source: ce.CustomElement,
                ...be
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: p,
          maskInputOptions: _e,
          inlineStylesheet: s,
          sampling: b,
          recordDOM: k,
          recordCanvas: w,
          inlineImages: Z,
          userTriggeredOnInput: P,
          collectFonts: N,
          doc: Ee,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: o,
          slimDOMOptions: Re,
          dataURLOptions: v,
          mirror: ft,
          iframeManager: Ne,
          stylesheetManager: Ce,
          shadowDomManager: xt,
          processedNodeManager: It,
          canvasManager: Ms,
          ignoreCSSAttributes: Le,
          plugins: ((Pe = Y == null ? void 0 : Y.filter((be) => be.observer)) == null ? void 0 : Pe.map((be) => ({
            observer: be.observer,
            options: be.options,
            callback: (cr) => Ie({
              type: ge.Plugin,
              data: {
                plugin: be.name,
                payload: cr
              }
            })
          }))) || []
        },
        g
      );
    };
    Ne.addLoadListener((Ee) => {
      try {
        V.push(me(Ee.contentDocument));
      } catch (Pe) {
        console.warn(Pe);
      }
    });
    const ye = () => {
      An(), V.push(me(document)), zn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ye() : (V.push(
      Je("DOMContentLoaded", () => {
        Ie({
          type: ge.DomContentLoaded,
          data: {}
        }), L === "DOMContentLoaded" && ye();
      })
    ), V.push(
      Je(
        "load",
        () => {
          Ie({
            type: ge.Load,
            data: {}
          }), L === "load" && ye();
        },
        window
      )
    )), () => {
      V.forEach((Ee) => {
        try {
          Ee();
        } catch (Pe) {
          String(Pe).toLowerCase().includes("cross-origin") || console.warn(Pe);
        }
      }), It.destroy(), zn = !1, kg();
    };
  } catch (V) {
    console.warn(V);
  }
}
jt.addCustomEvent = (e, t) => {
  if (!zn)
    throw new Error("please add custom event after start recording");
  Ie({
    type: ge.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
jt.freezePage = () => {
  rr.forEach((e) => e.freeze());
};
jt.takeFullSnapshot = (e) => {
  if (!zn)
    throw new Error("please take full snapshot after start recording");
  An(e);
};
jt.mirror = ft;
var _l;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(_l || (_l = {}));
const { addCustomEvent: Ny } = jt, { freezePage: Py } = jt, { takeFullSnapshot: Dy } = jt, En = 2, Rs = 4;
class Vg {
  constructor(t) {
    un(this, "events", []);
    un(this, "lastMeta", null);
    un(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Rs && (this.lastMeta = t), t.type === En && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === En), n = this.events.some((i) => i.type === Rs);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === En), n = t.some((i) => i.type !== En && i.type !== Rs);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Yg(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new Vg({
    windowMs: r,
    maxEvents: t.maxEvents ?? 2e3
  }), i = t.maskAllInputs !== !1, o = t.maskText !== !1, a = Math.max(15e3, Math.round(r / 2));
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
      maskTextFn: o ? (l) => "*".repeat(l.length) : void 0,
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
const uu = "klav-sims-live", du = "klav-sims-overlay", Ll = "klav-sims-ext-css";
let gt = null, tr = null, at = null, Cr = null;
const Fn = /* @__PURE__ */ new Map(), ct = /* @__PURE__ */ new Map();
let pu = 0, Lt = !1, nr = null, Ar = null, rn = !1, Ke = null, Br = null, qt = null, Wt = null, yt = null, ir = null, mt = null, Tt = null, bt = null, Er = null;
const Un = /* @__PURE__ */ new Set();
function Gg(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function hu(e, t) {
  return `${e}::${Gg(t.text)}`;
}
function fu(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Xg = `
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
`, Kg = `
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
function Il(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${a},${t})`;
}
function Jg(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Ns() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Zg(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Tr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const mu = { HIGH: "h", MED: "m", LOW: "l" }, Ol = { HIGH: 0, MED: 1, LOW: 2 };
function Qg(e) {
  if (!e) return !1;
  if (e === at || e === gt || e.id === du || e.id === uu || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function ey(e) {
  const t = [];
  for (const r of [at, gt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function gu(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function yu(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Nl(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function ty(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function ry(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function bu(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Qg(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function ny(e, t) {
  return ey(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && bu(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of o) i(a);
    return n;
  });
}
function iy(e, t) {
  const r = gu(t), n = yu(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = ny(i, o);
  if (!a.length) return null;
  const c = Math.max(1, Nl(n));
  let l = null, p = -1 / 0;
  for (const s of a) {
    const h = ry(s.getBoundingClientRect()), d = ty(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Nl(h)), m = d / c, f = Math.max(0, (u - d) / u), g = s.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, v = m - f * 0.35 + x - b;
    v > p && (l = s, p = v);
  }
  return l ?? a[0] ?? null;
}
async function sy(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: Ns() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Zg(Ns() ? 80 : 520);
}
const oy = /* @__PURE__ */ new Set([
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
function ay(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || oy.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function ly(e) {
  const t = ay(e.text);
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
    if (!bu(a)) continue;
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
async function cy(e, t = {}) {
  if (e.region) {
    const r = gu(e), n = yu(e.region, r);
    t.scroll !== !1 && await sy(n.left + n.width / 2, n.top + n.height / 2);
    const i = iy(e.region, e);
    if (i) return i;
  }
  return ly(e);
}
function uy() {
  if (gt && tr) return tr;
  gt = document.createElement("div"), gt.id = uu, gt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", tr = gt.attachShadow({ mode: "open" }), Ef(tr);
  const e = document.createElement("style");
  return e.textContent = Xg, tr.appendChild(e), document.body.appendChild(gt), tr;
}
function vu() {
  if (at) return at;
  if (!document.getElementById(Ll)) {
    const e = document.createElement("style");
    e.id = Ll, e.textContent = Kg, document.head.appendChild(e);
  }
  return at = document.createElement("div"), at.id = du, at.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(at), at;
}
function ku(e, t) {
  return Sf({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function dy(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Ds();
  const n = uy();
  vu(), Cr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Ds();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const d = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Fn.set(h.id, { simId: h.id, accent: d, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), bt = document.createElement("div"), bt.className = "ksl-sr", bt.id = "ksl-announcer", bt.setAttribute("aria-live", "polite"), bt.setAttribute("aria-atomic", "true"), o.appendChild(bt), Ke = document.createElement("button"), Ke.type = "button", Ke.className = "ksl-launcher", Ke.setAttribute("aria-label", "Open Sims feedback panel"), Ke.addEventListener("click", () => py());
  const a = document.createElement("span");
  a.className = "ksl-pill", Br = document.createElement("span"), Br.className = "ksl-pill-avatars", qt = document.createElement("span"), qt.className = "ksl-pill-txt", a.append(Br, qt), Wt = document.createElement("span"), Wt.className = "ksl-pill-badge", Wt.hidden = !0, Ke.append(a, Wt), o.appendChild(Ke), i.slice(0, 3).forEach((h) => {
    const d = Fn.get(h.id);
    d && Br.appendChild(ku(d, 26));
  }), yt = document.createElement("section"), yt.className = "ksl-panel", yt.setAttribute("aria-label", "Sims feedback"), yt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = J("x", { size: 15 }), s.addEventListener("click", () => Pl()), l.append(p, s), ir = document.createElement("div"), ir.className = "ksl-count", mt = document.createElement("div"), mt.className = "ksl-chips", c.append(l, ir, mt), Tt = document.createElement("div"), Tt.className = "ksl-list", Tt.setAttribute("role", "list"), yt.append(c, Tt), o.appendChild(yt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && Lt && Pl();
  }, { signal: Cr.signal }), fu(!0), Nr();
}
function wu(e) {
  rn = e, Ke == null || Ke.classList.toggle("is-reviewing", e), Nr(), Lt && Or();
}
function py() {
  !yt || !Ke || (Lt = !0, yt.classList.add("is-open"), Ke.hidden = !0, Or());
}
function Pl() {
  !yt || !Ke || (Lt = !1, yt.classList.remove("is-open"), Ke.hidden = !1, Nr());
}
function xu() {
  const e = Array.from(ct.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Tr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Nr() {
  const e = xu();
  qt && (rn && e.total === 0 ? qt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? qt.innerHTML = "Sims are watching this page" : qt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Wt && (Wt.hidden = e.high === 0, Wt.textContent = `${e.high} high`), Lt && Su(e);
}
function Su(e) {
  ir && (e.total === 0 ? ir.innerHTML = rn ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : ir.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), hy();
}
function hy() {
  if (!mt) return;
  const e = Array.from(ct.values());
  if (mt.hidden = e.length === 0, mt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", mt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (nr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(nr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${o}`)), a.addEventListener("click", () => {
      nr = nr === i.simId ? null : i.simId, Or();
    }), mt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", mt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((l) => Tr(l.obs) === i).length;
    if (!o) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Ar === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${mu[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${o}`, a.addEventListener("click", () => {
      Ar = Ar === i ? null : i, Or();
    }), mt.appendChild(a);
  });
}
function fy() {
  return Array.from(ct.values()).filter((e) => !nr || e.entry.simId === nr).filter((e) => !Ar || Tr(e.obs) === Ar).sort((e, t) => {
    const r = Tr(e.obs), n = Tr(t.obs), i = r ? Ol[r] : 3, o = n ? Ol[n] : 3;
    return i - o;
  });
}
function my(e) {
  const { entry: t, obs: r } = e, n = Tr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(ku(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, o.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${mu[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = J("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Tn.onTriage) == null || m.call(Tn, r, t.name), Dl(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = J("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    yy(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Dl(e.id);
  }), s.append(h, d, u), i.appendChild(s), i;
}
function gy(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Or() {
  if (!Tt || !Lt) {
    Nr();
    return;
  }
  const e = xu();
  Su(e);
  const t = fy();
  if (Tt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = ct.size > 0;
    if (rn && !i) {
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
    Tt.appendChild(n), ct.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = my(n);
    n.rowEl = i, Tt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  ct.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), gy(Tt);
}
function Ps() {
  Er == null || Er(), Er = null;
}
async function yy(e) {
  const t = ct.get(e);
  if (!t) return;
  const r = await cy(t.obs, { scroll: !0 });
  !r || !at || by(r, t.entry.accent);
}
function by(e, t) {
  Ps();
  const r = vu(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Il(t, 0.16)},0 0 24px ${Il(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, a = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Er === l && Ps();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Oe(n);
  };
  Er = l;
}
function vy(e, t) {
  const r = `f_${e.simId}_${++pu}`;
  ct.set(r, { id: r, entry: e, obs: t, rowEl: null }), Lt ? Or() : Nr(), bt && (bt.textContent = "", requestAnimationFrame(() => {
    bt && (bt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function ky(e) {
  const t = ct.get(e);
  if (!t) return;
  const r = () => {
    ct.delete(e), Lt ? Or() : Nr();
  };
  t.rowEl && Lt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Ns() ? 0 : 300)) : r();
}
function Dl(e) {
  const t = ct.get(e);
  t && (Un.add(hu(t.entry.simId, t.obs)), ky(e));
}
function wy(e, t, r) {
  if (!gt) return;
  const n = Fn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    wu(!1);
    for (const i of r) {
      if (!Jg(i)) continue;
      const o = hu(e, i);
      Un.has(o) || (Un.add(o), vy(n, i));
    }
  }
}
function Ds() {
  Ps(), ct.clear(), pu = 0, Fn.clear(), Un.clear(), Lt = !1, nr = null, Ar = null, rn = !1, Cr == null || Cr.abort(), Cr = null, Ke = null, Br = null, qt = null, Wt = null, yt = null, ir = null, mt = null, Tt = null, bt = null, Oe(at), at = null, Oe(gt), gt = null, tr = null, fu(!1);
}
const Tn = {
  deploy: dy,
  setReviewing: wu,
  renderFeedback: wy,
  undeploy: Ds,
  onTriage: null
};
function xy() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Tn);
}
typeof window < "u" && xy();
const $l = "klav-ao-css", Sy = "klav-ao-overlay";
function Cy(e, t, r, n, i, o = 10) {
  const l = !(e.y - r - 14 >= o), p = l ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: l };
}
const Ey = `
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
let er = null, My = 1;
const Bn = /* @__PURE__ */ new Map();
function zl(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${a},${t})`;
}
function Ry() {
  if (er) return er;
  if (!document.getElementById($l)) {
    const e = document.createElement("style");
    e.id = $l, e.textContent = Ey, document.head.appendChild(e);
  }
  return er = document.createElement("div"), er.id = Sy, er.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(er), er;
}
function $y(e, t, r = {}) {
  const n = Ry(), i = r.color ?? "#6366f1", o = `klav-ao-${My++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${zl(i, 0.14)},0 0 24px ${zl(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: d, top: u, below: m } = Cy(
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
    const b = document.createElement("button");
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => Cu(o)), l.appendChild(f), l.appendChild(b), n.appendChild(l);
  }
  return Bn.set(o, { halo: c, pin: l }), o;
}
function Cu(e) {
  const t = Bn.get(e);
  if (!t) return;
  Bn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Oe(n), Oe(r);
  }, 240)) : Oe(r);
}
function zy() {
  for (const e of [...Bn.keys()]) Cu(e);
}
let Eu = br;
const Mu = { consoleErrors: [], networkFailures: [] };
let Ru, Au, _r = null;
function Tu(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Fl() {
  return lh(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Ay() {
  return wh(Mu, { identity: Ru, metadata: Au });
}
async function Ty(e) {
  return mh(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    Eu,
    { backend: Rf }
  );
}
function so(e = "bug") {
  const t = gf(e, {
    onCaptureFull: Fl,
    onSubmit: async (r) => Ty({
      type: r.type,
      description: r.description,
      context: Ay(),
      screenshots: r.screenshots,
      replayEvents: (_r == null ? void 0 : _r.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await Fl();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function _y() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function Ly() {
  xh(Mu, { consoleLevels: !0 });
}
function _u(e) {
  Ru = e ? Tu(e) : void 0;
}
function Lu(e) {
  Au = e ? Tu(e) : void 0;
}
function Iy() {
  document.addEventListener("contextmenu", (e) => {
    if (nf(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${J("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${J("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (Oe(t), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      Oe(t), document.removeEventListener("click", r), i && so(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function Iu(e = {}) {
  if (Eu = {
    ...br,
    ...e,
    jira: { ...br.jira, ...e.jira },
    linear: { ...br.linear, ...e.linear },
    github: { ...br.github, ...e.github },
    plane: { ...br.plane, ...e.plane }
  }, Ly(), _y(), Iy(), !_r)
    try {
      _r = Yg(jt);
    } catch {
      _r = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Iu, openModal: so, identify: _u, setMetadata: Lu });
const Fy = { init: Iu, openModal: so, identify: _u, setMetadata: Lu };
export {
  Tn as KlavitySims,
  Tn as SimsLive,
  Cu as clearAnnotation,
  zy as clearAnnotations,
  Fy as default,
  _u as identify,
  Iu as init,
  xy as installKlavitySims,
  so as openModal,
  Lu as setMetadata,
  $y as showAnnotation
};
