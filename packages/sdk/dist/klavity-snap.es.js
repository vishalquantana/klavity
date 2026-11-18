var Ph = Object.defineProperty;
var zh = (e, t, r) => t in e ? Ph(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ki = (e, t, r) => zh(e, typeof t != "symbol" ? t + "" : t, r);
function $h(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Xu = 112, Ku = 72, Ju = 89, Zu = 115;
let zs;
function Dh() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Fh(e) {
  let t = -1;
  zs || (zs = Dh());
  for (let r = 0; r < e.length; r++)
    t = zs[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Uh(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Xu && e[r - 2] === Ku && e[r - 1] === Ju && e[r] === Zu)
      return r - 3;
  return 0;
}
function Bh(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Xu, n[1] = Ku, n[2] = Ju, n[3] = Zu, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Fh(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Uh(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const qh = "AAlwSFlz", Wh = "AAAJcEhZ", jh = "AAAACXBI";
function Hh(e) {
  let t = e.indexOf(qh);
  return t === -1 && (t = e.indexOf(Wh)), t === -1 && (t = e.indexOf(jh)), t;
}
const Qu = "[modern-screenshot]", Rr = typeof window < "u", Yh = Rr && "Worker" in window, Vh = Rr && "atob" in window, Gh = Rr && "btoa" in window;
var Gu;
const ya = Rr ? (Gu = window.navigator) == null ? void 0 : Gu.userAgent : "", ed = ya.includes("Chrome"), Wi = ya.includes("AppleWebKit") && !ed, ba = ya.includes("Firefox"), Xh = (e) => e && "__CONTEXT__" in e, Kh = (e) => e.constructor.name === "CSSFontFaceRule", Jh = (e) => e.constructor.name === "CSSImportRule", Zh = (e) => e.constructor.name === "CSSLayerBlockRule", or = (e) => e.nodeType === 1, ii = (e) => typeof e.className == "object", td = (e) => e.tagName === "image", Qh = (e) => e.tagName === "use", Zn = (e) => or(e) && typeof e.style < "u" && !ii(e), ef = (e) => e.nodeType === 8, tf = (e) => e.nodeType === 3, Nn = (e) => e.tagName === "IMG", es = (e) => e.tagName === "VIDEO", rf = (e) => e.tagName === "CANVAS", nf = (e) => e.tagName === "TEXTAREA", sf = (e) => e.tagName === "INPUT", of = (e) => e.tagName === "STYLE", af = (e) => e.tagName === "SCRIPT", lf = (e) => e.tagName === "SELECT", cf = (e) => e.tagName === "SLOT", uf = (e) => e.tagName === "IFRAME", df = (...e) => console.warn(Qu, ...e);
function pf(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ra = (e) => e.startsWith("data:");
function rd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Rr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Rr)
    return e;
  const r = ts().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function ts(e) {
  return (e && or(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const rs = "http://www.w3.org/2000/svg";
function hf(e, t, r) {
  const n = ts(r).createElementNS(rs, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function ff(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function mf(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const gf = (e) => mf(e, "dataUrl");
function An(e, t) {
  const r = ts(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Qn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? An(e, ts(i)) : e;
    let l = null, p = null;
    function o() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(o, n)), es(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Qn(c.poster, t).then(r) : o();
      if (c.readyState >= 2)
        return o();
      const d = o, u = (m) => {
        a == null || a(
          "Failed video load",
          h,
          m
        ), s == null || s(m), o();
      };
      p = () => {
        c.removeEventListener("loadeddata", d), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = td(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const d = async () => {
        if (Nn(c) && "decode" in c)
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
      if (Nn(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function yf(e, t) {
  Zn(e) && (Nn(e) || es(e) ? await Qn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Qn(n, t)))
  ));
}
const nd = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function id(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let ql = 0;
function bf(e) {
  const t = `${Qu}[#${ql}]`;
  return ql++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && df(...r)
  };
}
function kf(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function ns(e, t) {
  return Xh(e) ? e : vf(e, { ...t, autoDestruct: !0 });
}
async function vf(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Rr ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Rr ? window : void 0), p = /* @__PURE__ */ new Map(), o = {
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
      requestInit: kf((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: bf(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: sd(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(rs, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Yh && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var v, L, S, x;
          const { url: M, result: w } = y.data;
          w ? (L = (v = p.get(M)) == null ? void 0 : v.resolve) == null || L.call(v, w) : (x = (S = p.get(M)) == null ? void 0 : S.reject) == null || x.call(S, new Error(`Error receiving message from worker: ${M}`));
        }, f.onmessageerror = (y) => {
          var w, v;
          const { url: M } = y.data;
          (v = (w = p.get(M)) == null ? void 0 : w.reject) == null || v.call(w, new Error(`Error receiving message from worker: ${M}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      pf(c) && "image/webp",
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
  o.log.time("wait until load"), await yf(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: d } = wf(e, o);
  return o.width = h, o.height = d, o;
}
function sd(e) {
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
function wf(e, t) {
  let { width: r, height: n } = t;
  if (or(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function xf(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await Qn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Sf(e.ownerDocument, t), p = () => {
    try {
      l == null || l.drawImage(a, 0, 0, c.width, c.height);
    } catch (o) {
      t.log.warn("Failed to drawImage", o);
    }
  };
  if (p(), t.isEnable("fixSvgXmlDecode"))
    for (let o = 0; o < i; o++)
      await new Promise((h) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, c.width, c.height), p(), h();
        }, o + s);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function Sf(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function od(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return An(s, e.ownerDocument);
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
function Ef(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return ka(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Cf(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Mf(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return An(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Qn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? An(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? An(e.poster, e.ownerDocument) : r;
    }
    return od(s, t);
  }
  return r;
}
function Rf(e, t) {
  return rf(e) ? od(e, t) : uf(e) ? Ef(e, t) : Nn(e) ? Cf(e) : es(e) ? Mf(e, t) : e.cloneNode(!1);
}
function Tf(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${nd()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Af = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Lf = [
  "stroke",
  "fill"
];
function ad(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = ii(e) && i !== "svg", a = s ? Lf.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Tf(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const o = p == null ? void 0 : p.document;
  let h, d;
  s ? (h = o.createElementNS(rs, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, y]) => {
    d.setAttributeNS(null, f, y);
  }), h.appendChild(d)) : h = d = o.createElement(i), d.textContent = " ", o.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, y = 0; y < f; y++) {
    const M = u.item(y);
    Af.includes(M) || m.set(M, u.getPropertyValue(M));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function ld(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], s = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      a(l);
  else
    for (let l = e.length, p = 0; p < l; p++) {
      const o = e.item(p);
      a(o);
    }
  for (let l = i.length, p = 0; p < l; p++)
    (c = s.get(i[p])) == null || c.forEach((o, h) => n.set(h, o));
  function a(l) {
    const p = e.getPropertyValue(l), o = e.getPropertyPriority(l), h = l.lastIndexOf("-"), d = h > -1 ? l.substring(0, h) : void 0;
    if (d) {
      let u = s.get(d);
      u || (u = /* @__PURE__ */ new Map(), s.set(d, u)), u.set(l, [p, o]);
    }
    t.get(l) === p && !o || (d ? i.push(d) : n.set(l, [p, o]));
  }
  return n;
}
function _f(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), p = ad(e, null, n);
  a == null || a.forEach((f, y) => {
    p.delete(y);
  });
  const o = ld(l, p, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), ed && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((d = o.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return o.forEach(([f, y], M) => {
    c.setProperty(M, f, y);
  }), o;
}
function If(e, t) {
  (nf(e) || sf(e) || lf(e)) && t.setAttribute("value", e.value);
}
const Of = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Nf = [
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
function Pf(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !s)
    return;
  function p(o) {
    var v;
    const h = s.getComputedStyle(e, o);
    let d = h.getPropertyValue("content");
    if (!d || d === "none")
      return;
    i == null || i(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [nd()], m = ad(e, o, n);
    l == null || l.forEach((L, S) => {
      m.delete(S);
    });
    const f = ld(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((v = f.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${d}';`
    ];
    if (f.forEach(([L, S], x) => {
      y.push(`${x}: ${L}${S ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (L) {
      n.log.warn("Failed to copyPseudoClass", L);
      return;
    }
    const M = y.join(`
  `);
    let w = c.get(M);
    w || (w = [], c.set(M, w)), w.push(`.${u[0]}${o}`);
  }
  Of.forEach(p), r && Nf.forEach(p);
}
const Wl = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function jl(e, t, r, n, i) {
  if (or(r) && (of(r) || af(r)) || n.filter && !n.filter(r))
    return;
  Wl.has(t.nodeName) || Wl.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await ka(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && zf(e, s), t.appendChild(s);
}
async function Hl(e, t, r, n) {
  var s;
  let i = e.firstChild;
  or(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!ef(a))
      if (or(a) && cf(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await jl(e, t, c[l], r, n);
      } else
        await jl(e, t, a, r, n);
}
function zf(e, t) {
  if (!Zn(e) || !Zn(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d: p } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = p, t.style.transform = s.toString();
}
function $f(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const Df = /^[\w-:]+$/;
async function ka(e, t, r = !1, n) {
  var p, o, h, d;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && tf(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && or(e) && (Zn(e) || ii(e))) {
    const u = await Rf(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const v = u.getAttributeNames();
      for (let L = v.length, S = 0; S < L; S++) {
        const x = v[S];
        Df.test(x) || u.removeAttribute(x);
      }
    }
    const m = t.currentNodeStyle = _f(e, u, r, t);
    r && $f(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const v = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = v.includes("scroll") || (v.includes("auto") || v.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], M = id((d = m.get("font-family")) == null ? void 0 : d[0]), w = M ? (v) => {
      y === "uppercase" ? v = v.toUpperCase() : y === "lowercase" ? v = v.toLowerCase() : y === "capitalize" && (v = v[0].toUpperCase() + v.substring(1)), M.forEach((L) => {
        let S = a.get(L);
        S || a.set(L, S = /* @__PURE__ */ new Set()), v.split("").forEach((x) => S.add(x));
      });
    } : void 0;
    return Pf(
      e,
      u,
      f,
      t,
      w
    ), If(e, u), es(e) || await Hl(
      e,
      u,
      t,
      w
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Hl(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function Ff(e) {
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
function Uf(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(gf);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function ei(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: s } = t;
  let a = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: p,
    fetchFn: o,
    fetch: {
      requestInit: h,
      bypassingCache: d,
      placeholderImage: u
    },
    font: m,
    workers: f,
    fontFamilies: y
  } = e;
  n === "image" && (Wi || ba) && e.drawImageCount++;
  let M = p.get(r);
  if (!M) {
    d && d instanceof RegExp && d.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const w = n.startsWith("font") && m && m.minify, v = /* @__PURE__ */ new Set();
    w && n.split(";")[1].split(",").forEach((T) => {
      y.has(T) && y.get(T).forEach((I) => v.add(I));
    });
    const L = w && v.size, S = {
      url: a,
      timeout: c,
      responseType: L ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: l } : void 0,
      ...h
    };
    M = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, M.response = (async () => {
      if (o && n === "image") {
        const x = await o(r);
        if (x)
          return x;
      }
      return !Wi && r.startsWith("http") && f.length ? new Promise((x, T) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...S }), M.resolve = x, M.reject = T;
      }) : Uf(S);
    })().catch((x) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw x;
    }), p.set(r, M);
  }
  return M.response;
}
async function cd(e, t, r, n) {
  if (!ud(e))
    return e;
  for (const [i, s] of Bf(e, t))
    try {
      const a = await ei(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(qf(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function ud(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const dd = /url\((['"]?)([^'"]+?)\1\)/g;
function Bf(e, t) {
  const r = [];
  return e.replace(dd, (n, i, s) => (r.push([s, rd(s, t)]), n)), r.filter(([n]) => !ra(n));
}
function qf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Wf = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function jf(e, t) {
  return Wf.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Wi || ba) && t.drawImageCount++, cd(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Hf(e, t) {
  if (Nn(e)) {
    const r = e.currentSrc || e.src;
    if (!ra(r))
      return [
        ei(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Wi || ba) && t.drawImageCount++;
  } else if (ii(e) && !ra(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      ei(t, {
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
function Yf(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [s, a] = i.split("#");
  if (a) {
    const c = `#${a}`, l = t.shadowRoots.reduce(
      (p, o) => p ?? o.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (s && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (s)
      return [
        ei(t, {
          url: s,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function pd(e, t) {
  const { tasks: r } = t;
  or(e) && ((Nn(e) || td(e)) && r.push(...Hf(e, t)), Qh(e) && r.push(...Yf(e, t))), Zn(e) && r.push(...jf(e.style, t)), e.childNodes.forEach((n) => {
    pd(n, t);
  });
}
async function Vf(e, t) {
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
      const l = Vl(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), o = p.createElement("style");
      p.head.appendChild(o);
      const h = o.sheet;
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if (Jh(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await ei(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (w) {
              t.log.warn(`Error fetch remote css import from ${f}`, w);
            }
            const M = y.replace(
              dd,
              (w, v, L) => w.replace(L, rd(L, f))
            );
            for (const w of Xf(M))
              try {
                h.insertRule(w, h.cssRules.length);
              } catch (v) {
                t.log.warn("Error inserting rule from remote css import", { rule: w, error: v });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const d = [];
      l.forEach((u) => {
        na(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return Kh(u) && ud(u.style.getPropertyValue("src")) && ((m = id(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          cd(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = Vl(y, t), s.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const Gf = /(\/\*[\s\S]*?\*\/)/g, Yl = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Xf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Gf, "");
  for (; ; ) {
    const s = Yl.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Yl, "");
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
const Kf = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Jf = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Vl(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Jf, (i) => {
    for (; ; ) {
      const [s, , a] = Kf.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function na(e, t = []) {
  for (const r of Array.from(e))
    Zh(r) ? t.push(...na(r.cssRules)) : "cssRules" in r ? na(r.cssRules, t) : t.push(r);
  return t;
}
const Zf = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Qf(e) {
  return Zf.test(e.innerHTML);
}
async function em(e, t) {
  const r = await ns(e, t);
  if (or(r.node) && ii(r.node) && !Qf(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: s,
    svgStyleElement: a,
    svgDefsElement: c,
    svgStyles: l,
    font: p,
    progress: o,
    autoDestruct: h,
    onCloneNode: d,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await ka(r.node, r, !0);
  if (a && n) {
    let L = "";
    l.forEach((S, x) => {
      L += `${S.join(`,
`)} {
  ${x}
}
`;
    }), a.appendChild(n.createTextNode(L));
  }
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && or(f) && (i.time("embed web font"), await Vf(f, r), i.timeEnd("embed web font")), i.time("embed node"), pd(f, r);
  const y = s.length;
  let M = 0;
  const w = async () => {
    for (; ; ) {
      const L = s.pop();
      if (!L)
        break;
      try {
        await L;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      o == null || o(++M, y);
    }
  };
  o == null || o(M, y), await Promise.all([...Array.from({ length: 4 })].map(w)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const v = tm(f, r);
  return c && v.insertBefore(c, v.children[0]), a && v.insertBefore(a, v.children[0]), h && Ff(r), await (m == null ? void 0 : m(v)), v;
}
function tm(e, t) {
  const { width: r, height: n } = t, i = hf(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function rm(e, t) {
  var a;
  const r = await ns(e, t), n = await em(r), i = ff(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = sd(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(rs, "defs"), r.svgStyles.clear());
  const s = An(i, n.ownerDocument);
  return await xf(s, r);
}
async function nm(e, t) {
  const r = await ns(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await rm(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && Vh && Gh) {
    const [p, o] = l.split(",");
    let h = 0, d = !1;
    if (s === "image/png") {
      const v = Hh(o);
      v >= 0 ? (h = Math.ceil((v + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), y = new Uint8Array(f.length);
    for (let v = 0; v < y.length; v++)
      y[v] = f.charCodeAt(v);
    const M = s === "image/png" ? Bh(y, a, d) : $h(y, a), w = window.btoa(String.fromCharCode(...M));
    l = [p, ",", w, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function im(e, t) {
  return nm(
    await ns(e, { ...t, type: "image/png" })
  );
}
const sm = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", om = 8e3, am = 16384, Gl = 4096, lm = 16e6, cm = 500, um = 1e4, $s = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", hd = 600, dm = 1200, pm = 24, hm = 1024, Ft = 32, fm = 4, fd = 400, mm = 0.985, gm = 250;
function md(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function ym(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return md(r, location.origin);
}
function bm(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && md(t.src || "", location.origin)) return !0;
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
function Ds(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Xl(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function km(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Gl / i, Gl / s), l = Math.min(a, c, Math.sqrt(lm / (i * s))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(s * l));
    const o = p.getContext("2d");
    if (!o) return { dataUrl: $s, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + cm;
    let d = 0;
    const u = () => d >= um || Date.now() >= h, m = (y, M = !1) => {
      var x;
      if (u() || (d++, !M && t && !t(y))) return;
      const w = getComputedStyle(y);
      if (w.display === "none" || w.visibility === "hidden" || Number(w.opacity) === 0) return;
      const v = y.getBoundingClientRect(), L = v.left - n.left, S = v.top - n.top;
      if (v.width > 0 && v.height > 0) {
        Xl(w.backgroundColor) || (o.fillStyle = w.backgroundColor, o.fillRect(L, S, v.width, v.height));
        const T = parseFloat(w.borderTopWidth);
        T > 0 && w.borderTopStyle !== "none" && !Xl(w.borderTopColor) && (o.strokeStyle = w.borderTopColor, o.lineWidth = T, o.strokeRect(L, S, v.width, v.height)), y.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(L, S, v.width, v.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(L, S, v.width, v.height));
      }
      for (const T of Array.from(y.childNodes)) {
        if (u()) break;
        if (T instanceof HTMLElement) {
          m(T);
          continue;
        }
        if (!(T.nodeType !== Node.TEXT_NODE || !((x = T.textContent) != null && x.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(T);
            const F = I.getBoundingClientRect();
            if (F.width <= 0 || F.height <= 0) continue;
            o.save(), o.beginPath(), o.rect(F.left - n.left, F.top - n.top, F.width, F.height), o.clip(), o.fillStyle = w.color, o.font = `${w.fontStyle} ${w.fontWeight} ${w.fontSize} ${w.fontFamily}`, o.textBaseline = "top", o.fillText(T.textContent.trim(), F.left - n.left, F.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: $s, scale: 1 };
  } catch {
    return { dataUrl: $s, scale: 1 };
  }
}
function vm() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Fs(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function wm(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < pm; s++) {
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
async function Kl(e, t = hd) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Fs(i.ready, n());
    const s = wm(e);
    s.length && await Fs(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Fs(vm(), Math.min(n(), 50));
  } catch {
  }
}
function gd(e, t) {
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
async function xm(e) {
  if (typeof document > "u") return null;
  const t = await gd(e, fd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Ft, r.height = Ft;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Ft, Ft);
    const { data: i } = n.getImageData(0, 0, Ft, Ft);
    let s = 0, a = 0, c = 0;
    for (let p = 0; p < i.length; p += 4) {
      const o = i[p + 3] / 255, h = i[p] * o + 255 * (1 - o), d = i[p + 1] * o + 255 * (1 - o), u = i[p + 2] * o + 255 * (1 - o), m = 0.299 * h + 0.587 * d + 0.114 * u;
      a += m, c += m * m, s++;
    }
    if (!s) return null;
    const l = a / s;
    return c / s - l * l;
  } catch {
    return null;
  }
}
async function Us(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= hm) return !0;
  try {
    const i = await xm(e);
    if (i !== null && i <= fm) return !0;
  } catch {
  }
  return !1;
}
async function Sm(e) {
  if (typeof document > "u") return null;
  const t = await gd(e, fd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Ft, r.height = Ft;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Ft, Ft);
    const { data: i } = n.getImageData(0, 0, Ft, Ft);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, p = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * p + 0.587 * o + 0.114 * h >= gm && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function Em(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Sm(e);
    if (r !== null && r >= mm) return !0;
  } catch {
  }
  return !1;
}
const Cm = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], Mm = /* @__PURE__ */ new Set([
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
function Rm(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Tm(e) {
  const t = (e || "").toLowerCase();
  return Cm.some((r) => t.includes(r));
}
const Am = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Lm(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Am.test(t);
}
function _m(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Rm(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Tm(r) || n && !Mm.has(n) && t.includes("_") && Lm(t));
}
function Im(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    _m({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Di = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Om = 3e3, Nm = 4e3, Jl = 24, Zl = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Pm(e, t = Nm) {
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
function zm(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < Jl; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Jl; l++) {
        const p = c[l];
        if (!(p && (((n = p.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || p.type === 5))) continue;
        let h = "", d = "";
        try {
          h = (((i = p.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), d = ((s = p.style) == null ? void 0 : s.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !d || t.push({ cssText: p.cssText, family: h, src: d });
      }
  }
  return t;
}
function $m(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Dm(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${$m(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Fm(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? zm(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => Pm(c)), a = [];
  for (const c of n) {
    const l = [];
    Zl.lastIndex = 0;
    let p;
    for (; (p = Zl.exec(c.src)) !== null; ) {
      const u = p[2];
      u && !u.startsWith("data:") && l.push(u);
    }
    if (!l.length) {
      a.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let o = c.cssText, h = !1;
    const d = await Promise.all(l.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await s(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of d)
      m && (o = Dm(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Um() {
  try {
    return await Promise.race([
      Fm({}).catch(() => Di),
      new Promise((e) => setTimeout(() => e(Di), Om))
    ]);
  } catch {
    return Di;
  }
}
function Bm(e, t) {
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
async function qm(e, t = {}) {
  return (await Wm(e, t)).dataUrl;
}
async function Wm(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? Di : await Um(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Bm(im(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (d) => Im(d, c.embeddedFamilies),
      maximumCanvasSize: am,
      fetch: { placeholderImage: sm },
      filter: (d) => n && !n(d) || bm(d) ? !1 : ym(d) ? (r++, !1) : !0
    }), om);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Kl(e, hd);
  try {
    let o = await p(), h = await Us(o);
    if (h) {
      await Kl(e, dm);
      try {
        const u = await p();
        await Us(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && Ds(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Ds("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await Em(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    Ds(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = km(e, n, a), u = await Us(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const jm = {
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
function Hm(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function G(e, t = {}) {
  const r = jm[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${Hm(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const yd = "https://klavity.in", vn = {
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
function Bs(e, t, r) {
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
      const p = a ? " " : "";
      if (a && e(a + p + l) <= n) {
        a += p + l;
        continue;
      }
      for (a && (i.push(a), a = ""); l.length > 1 && e(l) > n; ) {
        let o = 1, h = l.length, d = 1;
        for (; o <= h; ) {
          const u = o + h >> 1;
          e(l.slice(0, u)) <= n ? (d = u, o = u + 1) : h = u - 1;
        }
        i.push(l.slice(0, d)), l = l.slice(d);
      }
      a = l;
    }
    i.push(a);
  }
  return i.length ? i : [""];
}
function vi(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function Ym(e) {
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
function Vm(e) {
  const t = Ym(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function qs(e) {
  return Vm(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
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
    const s = qs(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = qs(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = qs(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = Bs((o) => vi(t, o), r.text, a), l = s * 1.25, p = r.outline ?? "none";
      c.forEach((o, h) => {
        const d = i + h * l;
        p !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, s * 0.18), t.strokeStyle = p === "white" ? "#ffffff" : "#111111", t.strokeText(o, n, d)), t.fillStyle = r.color, t.fillText(o, n, d);
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
    const p = l.data;
    for (let o = 0; o < a; o += c)
      for (let h = 0; h < s; h += c) {
        let d = 0, u = 0, m = 0, f = 0;
        const y = Math.min(o + c, a), M = Math.min(h + c, s);
        for (let w = o; w < y; w++)
          for (let v = h; v < M; v++) {
            const L = (w * s + v) * 4;
            d += p[L], u += p[L + 1], m += p[L + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(d / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + o, M - h, y - o));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), a = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, Bs((h) => vi(r, h), t.text, a).length));
    const p = l * c, o = Math.max(0, Math.min(t.y, Math.max(0, this.canvas.height - p)));
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
    const c = Bs((d) => vi(r, d), t.text, a);
    let l = 0;
    for (const d of c) l = Math.max(l, vi(r, d));
    const p = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(p, c.length * p), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function Gm(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function Xm(e, t, r, n) {
  return !e || !e.startsWith("data:image/") ? e || "" : !Array.isArray(t) || t.length === 0 || typeof document > "u" || typeof Image > "u" ? e : new Promise((i) => {
    try {
      const s = new Image();
      s.onload = () => {
        try {
          const a = s.naturalWidth || r || 1, c = s.naturalHeight || n || 1, l = document.createElement("canvas");
          l.width = a, l.height = c;
          const p = l.getContext("2d");
          if (!p) {
            i(e);
            return;
          }
          const o = new ia(l, e);
          t.forEach((h) => o.shapes.push({ ...h })), p.drawImage(s, 0, 0), o.redraw(), o.save().then((h) => {
            i(h || e);
          }).catch(() => {
            try {
              i(l.toDataURL("image/png") || e);
            } catch {
              i(e);
            }
          });
        } catch {
          i(e);
        }
      }, s.onerror = () => i(e), s.src = e;
    } catch {
      i(e);
    }
  });
}
async function Km(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: yd }, i = {
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
const Jm = 50, Zm = 2e3, Qm = 1e3, eg = 500, Ql = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function wi(e, t) {
  e.push(t), e.length > Jm && e.shift();
}
function va(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Ws(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      Ql.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => Ql.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return va(t, Qm);
}
function tg(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return va(JSON.stringify(e), eg);
  } catch {
    return String(e);
  }
}
function rg(e, t = {}) {
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
function ng(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, o) => {
    wi(e.consoleErrors, { message: va(p, Zm), stack: o, timestamp: Date.now(), level: l });
  }, s = window.onerror;
  if (window.onerror = (l, p, o, h, d) => {
    var u;
    if (n()) {
      const m = String(l);
      i("error", m, d == null ? void 0 : d.stack), (u = t.onError) == null || u.call(t, m, d == null ? void 0 : d.stack);
    }
    return typeof s == "function" ? s.call(window, l, p, o, h, d) : !1;
  }, window.addEventListener("unhandledrejection", (l) => {
    var h;
    if (!n()) return;
    const p = l.reason, o = String((p == null ? void 0 : p.message) ?? p);
    i("error", o, p == null ? void 0 : p.stack), (h = t.onError) == null || h.call(t, o, p == null ? void 0 : p.stack);
  }), t.consoleLevels) {
    const l = ["log", "info", "warn", "error"];
    for (const p of l) {
      const o = console[p];
      typeof o == "function" && (console[p] = (...h) => {
        try {
          n() && i(p, h.map(tg).join(" "));
        } catch {
        }
        return o.apply(console, h);
      });
    }
  }
  const a = window.fetch;
  window.fetch = async (...l) => {
    var d;
    if (!n()) return a(...l);
    const p = Date.now(), o = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (d = l[1]) == null ? void 0 : d.method) || "GET";
    try {
      const u = await a(...l);
      return wi(e.networkFailures, { url: Ws(o), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw wi(e.networkFailures, { url: Ws(o), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, p = c.prototype.send;
    c.prototype.open = function(o, h, ...d) {
      return this.__klav = { method: String(o || "GET").toUpperCase(), url: String(h || "") }, l.call(this, o, h, ...d);
    }, c.prototype.send = function(...o) {
      const h = this.__klav;
      if (h && n()) {
        const d = Date.now();
        this.addEventListener("loadend", () => {
          try {
            wi(e.networkFailures, {
              url: Ws(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: d,
              durationMs: Date.now() - d
            });
          } catch {
          }
        });
      }
      return p.apply(this, o);
    };
  }
  return e;
}
const ig = ["light", "dark", "glass", "neon", "custom", "liquid"], sg = ["hidden", "icon", "full", "custom"], og = ["lightbulb", "bug"], ag = ["full", "reportOnly", "off"], lg = /^#[0-9a-fA-F]{3,8}$/, cg = /^[\w \-,'"().]+$/, ec = (e) => typeof e == "object" && e !== null, xi = (e) => typeof e == "string" && lg.test(e.trim()) ? e.trim() : void 0, Si = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, ug = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && cg.test(t) ? t : void 0;
}, tc = {
  // Default = the marketing home surface: warm cream paper with Klavity-purple and amber atmosphere.
  // The panel is intentionally not stark white; chips/inputs are only a step lighter for affordance.
  //
  // KD-157: these used to read through generic host-page variable names — e.g.
  // '--kl-accent': 'var(--accent, #6366f1)' — so the widget could auto-match Klavity's OWN dashboard
  // theme when dogfooded there (which happens to define matching --ink/--paper/--line tokens). But
  // CSS custom properties inherit straight through Shadow DOM boundaries (unlike everything else,
  // which Shadow DOM correctly isolates), so on any OTHER host page that happens to define its own
  // same-named variable for unrelated reasons, the widget silently inherited THAT instead. Confirmed
  // live on PX4's React login page: its shadcn/ui theme defines a global `--accent: oklch(0.968 0.007
  // 247.896)` (a near-white gray, shadcn's subtle hover tint) — so the widget's Bug button rendered
  // white text on a near-white background instead of Klavity's purple. Every one of Klavity's own
  // fallback defaults below already matches what Klavity's dashboard.html defines for light mode
  // (and dark mode already renders via the fully-literal 'dark' theme below, never touching this
  // object), so collapsing these to literals changes nothing for Klavity's own embed and removes the
  // collision risk for every third-party one.
  light: {
    "--kl-overlay": "rgba(28,22,40,.30)",
    "--kl-bg": "#f5f3ee",
    "--kl-fg": "#19140f",
    "--kl-muted": "#574f45",
    "--kl-border": "rgba(25,20,15,.12)",
    "--kl-chip": "#fffdf8",
    "--kl-input-bg": "#fffdf8",
    "--kl-accent": "#6366f1",
    "--kl-on-accent": "#fff",
    "--kl-accent2": "#d98324",
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
function rc(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function bd(e) {
  const t = ec(e) ? e : {}, n = { theme: typeof t.theme == "string" && ig.includes(t.theme) ? t.theme : "light" }, i = xi(t.primary), s = xi(t.secondary), a = xi(t.background), c = Si(t.thankYou, 140), l = ug(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && sg.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Si(t.launcherText, 60);
  p && (n.launcherText = p);
  const o = xi(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && og.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && ag.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Si(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = ec(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Si(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function dg(e) {
  const t = bd(e), r = t.theme === "custom" ? { ...tc.light } : { ...tc[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = rc(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && rc(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function pg(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function Ei(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function nc(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = pg(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const ht = class ht {
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
    this._recording || !ht.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), ht.SESSION_MS), this._begin());
  }
  // Spin up a fresh SpeechRecognition instance. Called on start() and again on every auto-restart (a
  // silence timeout, an unexpected end, or a reconnect after a transient error) so a dropped backend
  // reconnects transparently while _recording stays true.
  _begin() {
    if (!this._recording) return;
    const t = window.SpeechRecognition ?? window.webkitSpeechRecognition, r = new t();
    this._recognition = r, r.continuous = !0, r.interimResults = !!this.onInterim, r.lang = typeof document < "u" && document.documentElement.lang || "en-US", r.onstart = () => {
      this._recovered();
    }, r.onresult = (n) => {
      var s;
      this._recovered();
      let i = "";
      for (let a = n.resultIndex; a < n.results.length; a++) {
        const c = n.results[a], l = ((s = c[0]) == null ? void 0 : s.transcript) || "";
        c.isFinal ? l && this.onTranscript(l) : i += l;
      }
      i && this.onInterim && this.onInterim(i);
    }, r.onerror = (n) => {
      if (this._stopping || !this._recording) return;
      const i = n == null ? void 0 : n.error;
      if (i && i in ht.TERMINAL_ERRORS) {
        this.onError(i, ht.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > ht.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? ht.BENIGN_RESTART_MS : Math.min(ht.MAX_BACKOFF_MS, ht.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
ht.MAX_CONSEC_FAILURES = 6, ht.BASE_BACKOFF_MS = 400, ht.MAX_BACKOFF_MS = 8e3, ht.BENIGN_RESTART_MS = 250, ht.SESSION_MS = 18e4, ht.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Gn = ht;
function hg() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const fg = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function kd(e) {
  for (const t of fg)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Tn = class Tn {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...hg(), ...t.deps || {} };
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
    this._stream = t, this._mime = kd(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Tn.MAX_SESSION_MS), this._beginSegment();
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
      }, Tn.SEGMENT_MS);
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
Tn.SEGMENT_MS = 2500, Tn.MAX_SESSION_MS = 18e4;
let ji = Tn;
function mg() {
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
const nt = class nt {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...mg(), ...t.deps || {} };
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
    this._stream = t, this._mime = kd(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), nt.MAX_SESSION_MS), this._openSocket();
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
    }, nt.CONNECT_TIMEOUT_MS), t.onopen = () => {
      this._startRecorder();
    }, t.onmessage = (r) => {
      let n = null;
      try {
        n = typeof r.data == "string" ? JSON.parse(r.data) : null;
      } catch {
        n = null;
      }
      if (n) {
        if (this._connected || (this._connected = !0, this._everConnected = !0, this._reconnects = 0, this._clearConnectTimer(), this._statusShown && (this._statusShown = !1, this.onStatus("idle", ""))), n.type === "interim")
          n.text && this.onInterim(n.text);
        else if (n.type === "final") {
          const i = (n.text || "").trim();
          i && this.onTranscript(i);
        } else if (n.type === "error" && n.fallback) {
          this._teardown(!1), this.onUnavailable();
          return;
        }
      }
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
    if (this._reconnects >= nt.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(nt.MAX_BACKOFF_MS, nt.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(nt.TIMESLICE_MS);
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
        this._recorder.start(nt.TIMESLICE_MS);
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
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, nt.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), nt.STOP_GRACE_MS);
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
nt.MAX_SESSION_MS = 18e4, nt.TIMESLICE_MS = 150, nt.CONNECT_TIMEOUT_MS = 4e3, nt.MAX_RECONNECTS = 3, nt.BASE_BACKOFF_MS = 500, nt.MAX_BACKOFF_MS = 4e3, nt.STOP_GRACE_MS = 2e3, nt.STOP_FLUSH_FALLBACK_MS = 1200;
let Hi = nt;
function gg(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Je(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const yg = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function vd(e) {
  const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(i) {
      let s = i.parentElement;
      for (; s && s !== e; ) {
        if (yg.has(s.tagName)) return NodeFilter.FILTER_REJECT;
        s = s.parentElement;
      }
      return /\d/.test(i.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), r = [];
  let n;
  for (; n = t.nextNode(); ) r.push(n);
  return r;
}
function bg(e) {
  const t = [], r = (i) => {
    i.width > 0 && i.height > 0 && t.push({ x: i.left, y: i.top, w: i.width, h: i.height });
  };
  for (const i of vd(e)) {
    const s = i.textContent ?? "", a = /\d+/g;
    let c;
    for (; c = a.exec(s); )
      try {
        const l = document.createRange();
        l.setStart(i, c.index), l.setEnd(i, c.index + c[0].length);
        const p = l.getClientRects ? l.getClientRects() : null;
        if (p) for (let o = 0; o < p.length; o++) r(p[o]);
      } catch {
      }
  }
  e.querySelectorAll("input, select").forEach((i) => {
    /\d/.test(i.value) && r(i.getBoundingClientRect());
  });
  const n = document.documentElement;
  return {
    rects: t,
    vw: window.innerWidth,
    vh: window.innerHeight,
    sx: window.scrollX || 0,
    sy: window.scrollY || 0,
    dw: Math.max(n.scrollWidth, window.innerWidth),
    dh: Math.max(n.scrollHeight, window.innerHeight)
  };
}
function kg(e, t, r, n) {
  if (!(t > 0 && r > 0)) return null;
  const i = (h, d) => d > 0 && Math.abs(h - d) / d < 0.04;
  let s, a, c;
  const l = (n == null ? void 0 : n.kind) === "region" || (n == null ? void 0 : n.kind) === "element" ? n.rect : void 0;
  if (l && l.w > 0 && l.h > 0)
    s = t / l.w, a = l.x, c = l.y;
  else {
    const h = t / r, d = i(h, e.vw / e.vh), u = i(h, e.dw / e.dh), m = (n == null ? void 0 : n.kind) === "full";
    if (u && (m || !d))
      s = t / e.dw, a = -e.sx, c = -e.sy;
    else if (d)
      s = t / e.vw, a = 0, c = 0;
    else return null;
  }
  const p = 2 * s, o = [];
  for (const h of e.rects) {
    const d = Math.max(0, (h.x - a) * s - p), u = Math.max(0, (h.y - c) * s - p), m = Math.min(t, (h.x - a + h.w) * s + p), f = Math.min(r, (h.y - c + h.h) * s + p);
    m > d && f > u && o.push({ x: d, y: u, w: m - d, h: f - u });
  }
  return o;
}
function vg(e, t) {
  return new Promise((r) => {
    const n = new Image();
    n.onload = () => {
      try {
        const i = n.naturalWidth, s = n.naturalHeight, a = t(i, s);
        if (!a || !a.length) return r(null);
        const c = document.createElement("canvas");
        c.width = i, c.height = s;
        const l = c.getContext("2d");
        if (!l) return r(null);
        l.drawImage(n, 0, 0), l.fillStyle = "#111";
        for (const p of a) l.fillRect(p.x, p.y, p.w, p.h);
        r({ url: c.toDataURL("image/png"), rects: a });
      } catch {
        r(null);
      }
    }, n.onerror = () => r(null), n.src = e;
  });
}
function wg(e) {
  const t = [], r = [], n = vd(e);
  for (const i of n) {
    const a = (i.textContent ?? "").split(/(\d+)/);
    if (a.length <= 1) continue;
    const c = i.parentNode, l = i.nextSibling, p = a.map((o, h) => {
      if (h % 2 === 1) {
        const d = document.createElement("span");
        return d.style.cssText = "background:#111;color:transparent;border-radius:2px;", d.textContent = o, d;
      }
      return document.createTextNode(o);
    });
    Je(i);
    for (const o of p) c.insertBefore(o, l);
    t.push({ parent: c, original: i, replacements: p });
  }
  return e.querySelectorAll("input, select").forEach((i) => {
    const s = i.value;
    /\d/.test(s) && (r.push({ el: i, original: s }), i.value = "█".repeat(s.length));
  }), () => {
    for (const { parent: i, original: s, replacements: a } of t) {
      const c = a[0];
      if ((c == null ? void 0 : c.parentNode) === i) {
        i.insertBefore(s, c);
        for (const l of a) l.parentNode === i && Je(l);
      }
    }
    for (const { el: i, original: s } of r)
      i.value = s;
  };
}
const wd = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], xg = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, Sg = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Eg = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Cg = /* @__PURE__ */ new Set([
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
]), Mg = { needs: "Needs detail", good: "Good", great: "Great" };
function Rg(e) {
  let t = e;
  for (const r of wd) t = t.split(r).join(" ");
  return t;
}
function Tg(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Cg.has(n) || r++;
  return r;
}
function xd(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Rg(r), i = Tg(n), s = t.length > 0 && wd.some((d) => r.includes(d)) && i < 3, a = i >= 3 && t.length >= 12, c = Eg.test(r), l = xg.test(r) || Sg.test(t), p = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: p, level: h, label: Mg[h], vague: s };
}
function Ag(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : xd(t).level !== "great";
}
const Lg = [
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
function _g(e) {
  const t = (e || "").toLowerCase();
  return t ? Lg.some((r) => t.includes(r)) : !1;
}
function Sd(e) {
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
function Ed(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", Sd(t.source)],
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
async function Ig() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function Og() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let Ng = 0;
function Pg(e) {
  const t = e.host || Og(), r = "kl-shp-" + ++Ng, n = document.createElement("div");
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
  const p = document.createElement("div");
  p.className = "kl-shp-dh";
  const o = document.createElement("div");
  o.className = "kl-shp-dt", o.textContent = `Allow ${t} to see this tab?`;
  const h = document.createElement("div");
  h.className = "kl-shp-ds", h.textContent = "The site will be able to see the contents of this tab", p.append(o, h);
  const d = document.createElement("div");
  d.className = "kl-shp-prev";
  const u = document.createElement("div");
  u.className = "kl-shp-shot";
  const m = document.createElement("div");
  m.className = "kl-shp-cap";
  const f = document.createElement("span");
  f.className = "kl-shp-fav", f.textContent = (t[0] || "K").toUpperCase();
  const y = document.createElement("span");
  y.className = "kl-shp-rt", y.textContent = "This tab", m.append(f, y), d.append(u, m);
  const M = document.createElement("div");
  M.className = "kl-shp-foot";
  const w = document.createElement("span");
  w.className = "kl-shp-cancel", w.textContent = "Cancel", w.style.cursor = "pointer", w.addEventListener("click", (T) => {
    var I;
    T.stopPropagation(), n.classList.remove("kl-show");
    try {
      (I = e.onCancel) == null || I.call(e);
    } catch {
    }
  });
  const v = document.createElement("span");
  v.className = "kl-shp-allow", v.textContent = "Allow", M.append(w, v), l.append(p, d, M);
  const L = document.createElement("div");
  L.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const x = document.createElement("span");
  return x.textContent = e.steer, L.append(S, x), n.append(i, s, l, L), n;
}
const zg = 1, $g = 6, Dg = 1.08;
function Fg(e, t = zg, r = $g) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Ug(e, t = Dg) {
  return e < 0 ? t : 1 / t;
}
function Bg(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Cd(e, t) {
  return t > 0 ? e.width / t : 1;
}
function qg(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Wg(e, t, r, n, i, s) {
  const a = Cd(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), p = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, d = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: p, y: h, w: Math.max(0, o - p), h: Math.max(0, d - h) };
}
function jg(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function Hg(e, t, r, n, i, s) {
  const a = Cd(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function Yg(e) {
  return Ed("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || Sd()
  });
}
function Vg(e) {
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
function Gg(e, t, r) {
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
function Le(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ic(e) {
  let t = Le(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function sc(e) {
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
const sa = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function Xg(e) {
  var t;
  return ((t = sa.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function Kg(e) {
  const t = (a) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(a) || /^\s*()(\d+)\s*$/.exec(a);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, s = n ? t(n) : null;
  return { startSec: i, endSec: i != null && s != null && s <= i ? null : s };
}
function Jg(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function Md(e, t, r = 960, n = 6e3) {
  return new Promise((i) => {
    let s = !1;
    const a = document.createElement("video"), c = (p) => {
      if (!s) {
        s = !0, clearTimeout(l);
        try {
          a.removeAttribute("src"), a.load();
        } catch {
        }
        i(p);
      }
    }, l = setTimeout(() => c(null), n);
    a.muted = !0, a.preload = "auto", a.setAttribute("playsinline", ""), a.onerror = () => c(null), a.onloadedmetadata = () => {
      const p = isFinite(a.duration) && a.duration > 0 ? a.duration : t + 1;
      try {
        a.currentTime = Math.max(0, Math.min(t, p - 0.1));
      } catch {
        c(null);
      }
    }, a.onseeked = () => {
      try {
        const p = a.videoWidth, o = a.videoHeight;
        if (!p || !o) return c(null);
        const h = Math.min(1, r / p), d = document.createElement("canvas");
        d.width = Math.round(p * h), d.height = Math.round(o * h);
        const u = d.getContext("2d");
        if (!u) return c(null);
        u.drawImage(a, 0, 0, d.width, d.height), c(d.toDataURL("image/jpeg", 0.82));
      } catch {
        c(null);
      }
    };
    try {
      a.src = e;
    } catch {
      c(null);
    }
  });
}
const Zg = 8;
function Qg(e, t = Zg) {
  const r = Number(e);
  if (!isFinite(r) || r <= 0) return [];
  const n = Math.max(2, Math.min(t, Math.ceil(r / 10)));
  return Array.from({ length: n }, (i, s) => Math.round((s + 0.5) * r / n * 10) / 10);
}
async function ey(e, t) {
  const r = [];
  for (const n of Qg(t)) {
    const i = await Md(e, n, 768, 4e3);
    if (!i) break;
    r.push({ atSec: n, dataUrl: i });
  }
  return r;
}
function oc(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : Rd({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function oa(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function ac(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = oa(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${s ? ` Related: ${s}.` : ""}`;
}
function Rd(e) {
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
function ty(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const ry = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function ny(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return ry.test(r) ? r : "";
  } catch {
    return "";
  }
}
function js(e, t) {
  return ny(t) || ty(e);
}
function Hs(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Ht(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function lc(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function iy(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const sy = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function aa(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function oy(e) {
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
const ay = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", ly = 100, cy = ly * 1024 * 1024;
function uy(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function yn(e) {
  return aa(e) ? "video" : uy(e) ? "image" : "file";
}
function dy(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function Ci(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function py(e, t, r = {}) {
  var Tl, Al, Ll, _l, Il;
  const n = bd(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, p = [], o = [], h = [], d = null, u = [], m = !1, f = !1, y = !1, M = !1;
  const w = !!t.onMinimize, v = w ? 8 : 5, L = 3e4, S = 10 * 1024 * 1024, x = !!t.allowFileAttachments, T = 5, I = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : cy, F = t.reporterRole ?? "anon", z = t.upgradeUrl, Q = Math.max(120 * 1024 * 1024, I + 20 * 1024 * 1024);
  let W = [];
  const N = /* @__PURE__ */ new WeakMap(), Ue = () => typeof URL < "u" && typeof URL.createObjectURL == "function", Ze = (g) => N.get(g) || g.dataUrl, me = (g) => {
    const b = N.get(g);
    if (b) {
      try {
        URL.revokeObjectURL(b);
      } catch {
      }
      N.delete(g);
    }
  };
  let pe = null;
  const _e = !!(t.allowRecording && t.onRecord), We = _e && !!t.onSplitRecording, Ie = gg({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: ji.isSupported(),
    webSpeechSupported: Gn.isSupported()
  }), we = Ie !== "none", Xe = 2;
  let P = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], K = P.map((g) => g.id || g.dataUrl).join("|");
  const ie = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, re = {}, fe = /* @__PURE__ */ new Map(), Re = /* @__PURE__ */ new Map(), He = /* @__PURE__ */ new Map(), gt = /* @__PURE__ */ new Map();
  let ce = 0, ye = null;
  const Ce = () => {
    const g = Object.keys(re);
    if (!g.length && !ye) return null;
    const b = {};
    if (g.length) {
      const k = {};
      for (const E of g) k[E] = re[E];
      const C = re[0] ?? re[Number(g[0])] ?? {};
      Object.assign(b, C, { byIndex: k });
    }
    return ye && (b.selector = ye.selector, b.selectorText = ye.text), b;
  };
  let xe = e, de = 0, oe = null, be = null, Ir = null, ci = t.replayState === "attached", Ot = null, Or = null, Be = "idle", lt = null, Se = null, yt = null, St = !1, ar = "", ut = 0, De = null, Zt = !1, Nr = "", se = null, Ee = null, Pe = null, rt = null, Oe = !1;
  const Pr = [];
  function on(g) {
    if (typeof window > "u") return;
    const b = () => {
      Oe || g();
    };
    window.addEventListener("beforeunload", b), window.addEventListener("pagehide", b), Pr.push(() => {
      window.removeEventListener("beforeunload", b), window.removeEventListener("pagehide", b);
    });
  }
  const zn = 4e3, $n = 5e3, Qe = {}, Tt = {}, Dn = (g) => g ? JSON.parse(JSON.stringify(g)) : null, an = (g) => {
    var b;
    try {
      (b = t.onAnnotationsChanged) == null || b.call(t, g, Dn(re[g]));
    } catch {
    }
  }, jp = () => {
    const g = {};
    for (const b of Object.keys(re)) {
      const k = re[b];
      k && (g[Number(b)] = Dn(k));
    }
    return g;
  }, Ga = (g) => ({
    url: c[g],
    compressed: p[g],
    ann: Dn(re[g])
  }), ln = (g) => {
    (Qe[g] ?? (Qe[g] = [])).push(Ga(g));
  }, Xa = (g, b) => {
    const k = i ? gt.get(b.url) : He.get(b.url);
    k ? (c[g] = k, p[g] = t.compressImage ? t.compressImage(k) : Promise.resolve(k)) : (c[g] = b.url, p[g] = b.compressed), b.ann ? re[g] = Dn(b.ann) : delete re[g];
  }, Ka = (g) => {
    const b = Qe[g];
    if (!b || !b.length) return !1;
    const k = b.pop(), C = Tt[g];
    for (; C && C.length && C[C.length - 1].mark >= b.length; ) C.pop();
    return Xa(g, k), an(g), Ne(), !0;
  }, Hp = (g) => {
    const b = Tt[g];
    if (!b || !b.length) return !1;
    const { snap: k, mark: C } = b.pop();
    return Qe[g] && (Qe[g].length = Math.min(Qe[g].length, C)), Xa(g, k), an(g), Ne(), !0;
  }, Ja = document.createElement("style");
  Ja.textContent = `
    ${dg(n)}
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
    .kl-side>.klavity-toggle,.kl-side>.klavity-page,.kl-side>.klavity-proof,.kl-hero>.klavity-strip,.kl-side>.klavity-actions,.kl-side>.klavity-desc,.kl-side>.klavity-remail-label,.kl-side>.klavity-remail-wrap,.kl-side>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .kl-side>.klavity-toggle{animation-delay:.05s}.kl-side>.klavity-page{animation-delay:.09s}.kl-side>.klavity-proof{animation-delay:.11s}.kl-hero>.klavity-strip{animation-delay:.12s}.kl-side>.klavity-actions{animation-delay:.15s}.kl-side>.klavity-desc{animation-delay:.18s}.kl-side>.klavity-remail-label{animation-delay:.20s}.kl-side>.klavity-remail-wrap{animation-delay:.21s}.kl-side>.klavity-submit{animation-delay:.23s}
    .klavity-modal.kl-closing{animation:kl-genie-out .5s cubic-bezier(.55,0,.85,.25) both;}
    .klavity-toggle{display:flex;gap:8px;margin-bottom:16px;padding-right:34px;}
    .klavity-toggle button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:var(--kl-chip);color:var(--kl-fg);line-height:1;}
    .klavity-toggle .kl-toggle-bug.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-toggle .kl-toggle-feat.active{background:var(--kl-accent);color:var(--kl-on-accent);}
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
    /* KD-995: "Report Multiple Issues" — entry card in the composer + the AI review screen over the composer. */
    .kl-multi{margin:0 0 14px;border:1.5px solid color-mix(in srgb,var(--kl-accent) 45%,var(--kl-border));border-radius:14px;background:color-mix(in srgb,var(--kl-accent) 5%,var(--kl-input-bg));padding:13px 14px;}
    .kl-multi-head{display:flex;align-items:center;gap:10px;}
    .kl-multi-ic{width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--kl-accent) 12%,transparent);color:var(--kl-accent);display:grid;place-items:center;flex:none;}
    .kl-multi-name{flex:1;min-width:0;font-size:13.5px;font-weight:750;color:var(--kl-fg);}
    .kl-multi-badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;background:color-mix(in srgb,var(--kl-accent) 12%,transparent);color:var(--kl-accent);padding:4px 8px;font-size:9.5px;font-weight:700;white-space:nowrap;}
    .kl-multi-copy{margin:9px 0 12px 44px;font-size:11.5px;line-height:1.45;color:var(--kl-muted);}
    .kl-multi-start{width:100%;height:42px;border:0;border-radius:10px;background:var(--kl-accent);color:#fff;font:inherit;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}
    .kl-multi-start:hover:not(:disabled){filter:brightness(1.06);}
    .kl-multi-start:disabled{opacity:.7;cursor:default;}
    .kl-multi-start .kl-enh-loader{border-color:rgba(255,255,255,.35);border-top-color:#fff;}
    .kl-multi-status{margin:8px 0 0;text-align:center;font-size:10.5px;font-weight:650;color:var(--kl-muted);line-height:1.4;}
    .kl-multi-status[hidden]{display:none;}
    .kl-multi-status.kl-rec{color:#F04448;}
    .kl-multi-status.kl-ok{color:#20b56a;}
    .kl-multi-reopen{border:0;background:none;color:var(--kl-accent);font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;padding:0 0 0 4px;}
    .kl-side.kl-mr-open{position:relative;overflow:hidden;}
    @media (max-width:760px){.kl-side.kl-mr-open{min-height:82vh;}}
    .kl-mr{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;background:var(--kl-bg);color:var(--kl-fg);}
    .kl-mr-head{display:flex;align-items:center;height:52px;flex:none;border-bottom:1px solid var(--kl-border);padding:0 8px 0 6px;gap:4px;}
    .kl-mr-title{margin:0;font-size:15px;font-weight:700;}
    .kl-mr-icon{width:38px;height:38px;border:0;border-radius:9px;background:transparent;color:var(--kl-fg);display:grid;place-items:center;cursor:pointer;}
    .kl-mr-icon:hover{background:color-mix(in srgb,var(--kl-fg) 7%,transparent);}
    .kl-mr-x{margin-left:auto;}
    .kl-mr-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px 14px;}
    .kl-mr-inner{max-width:760px;margin:0 auto;}
    .kl-mr-banner{display:flex;align-items:center;gap:10px;border-radius:12px;background:#E6F7EF;color:#242938;padding:10px 12px;}
    .kl-mr-ok{width:24px;height:24px;border-radius:50%;background:#168B54;color:#fff;display:grid;place-items:center;flex:none;}
    .kl-mr-b1{margin:0;font-size:13px;font-weight:700;}
    .kl-mr-b2{margin:2px 0 0;font-size:11px;color:#5F6675;}
    .kl-mr-counts{display:flex;align-items:center;margin:12px 0 0;border-bottom:1px solid var(--kl-border);padding:0 0 10px;font-size:13.5px;font-weight:700;}
    .kl-mr-counts p{margin:0;}
    .kl-mr-sel{margin-left:auto !important;font-size:12.5px;color:#168B54;}
    .kl-mr-all{display:flex;align-items:center;gap:10px;padding:10px 0;font-size:12.5px;font-weight:500;color:var(--kl-muted);cursor:pointer;}
    .kl-mr-kept{margin-left:auto;font-size:10px;opacity:.8;}
    .kl-mr input[type=checkbox]{width:18px;height:18px;margin:0;accent-color:var(--kl-accent);cursor:pointer;flex:none;}
    .kl-mr-list{display:flex;flex-direction:column;gap:12px;}
    .kl-mr-card{display:flex;gap:8px;border:1px solid var(--kl-border);border-radius:12px;background:var(--kl-input-bg);padding:9px;}
    .kl-mr-card.kl-off{opacity:.6;}
    .kl-mr-card>input{margin-top:2px !important;}
    .kl-mr-thumb{width:64px;height:56px;flex:none;border-radius:9px;overflow:hidden;background:color-mix(in srgb,var(--kl-fg) 6%,transparent);color:var(--kl-muted);display:grid;place-items:center;}
    .kl-mr-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
    .kl-mr-main{flex:1;min-width:0;}
    .kl-mr-row{display:flex;align-items:flex-start;gap:8px;}
    .kl-mr-t{flex:1;min-width:0;margin:0;font-size:13px;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .kl-mr-edit{width:28px;height:28px;flex:none;border:0;border-radius:8px;background:color-mix(in srgb,var(--kl-fg) 6%,transparent);color:var(--kl-fg);display:grid;place-items:center;cursor:pointer;}
    .kl-mr-edit:hover{background:color-mix(in srgb,var(--kl-fg) 11%,transparent);}
    .kl-mr-badges{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 0;}
    .kl-mr-badges span{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 8px;font-size:9.5px;font-weight:650;}
    .kl-mr-bug{background:#FEECEC;color:#EF4444;}
    .kl-mr-feat{background:#EAF4FF;color:#2184E8;}
    .kl-mr-p1{background:#FEECEC;color:#C93636;}
    .kl-mr-p2{background:#FFF4D9;color:#9A6815;}
    .kl-mr-p3{background:#E6F7EF;color:#168B54;}
    .kl-mr-conf{background:color-mix(in srgb,var(--kl-accent) 12%,transparent);color:var(--kl-accent);}
    .kl-mr-dup{background:#FFF4D9;color:#9A6815;}
    .kl-mr-enh{background:color-mix(in srgb,var(--kl-accent) 12%,transparent);color:var(--kl-accent);}
    .kl-mr-enh .kl-enh-loader{width:8px;height:8px;border-width:1.5px;}
    .kl-mr-d{margin:6px 0 0;font-size:11.5px;line-height:1.35;color:var(--kl-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .kl-mr-ts{display:inline-flex;align-items:center;gap:4px;margin:5px 0 0;border:0;background:none;padding:0;font:inherit;font-size:10px;font-weight:600;color:var(--kl-muted);cursor:pointer;font-variant-numeric:tabular-nums;}
    .kl-mr-ts:hover{color:var(--kl-accent);}
    .kl-mr-foot{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;min-height:68px;flex:none;border-top:1px solid var(--kl-border);padding:10px 14px;}
    .kl-mr-foot p{margin:0;font-size:12.5px;font-weight:600;color:var(--kl-muted);}
    .kl-mr-err{margin:0 0 0 auto;color:#C93636 !important;font-weight:600;}
    .kl-mr-submit{margin-left:auto;height:44px;min-width:150px;border:0;border-radius:12px;background:var(--kl-accent);color:#fff;font:inherit;font-size:13.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;padding:0 18px;}
    .kl-mr-err+.kl-mr-submit{margin-left:0;}
    .kl-mr-submit:disabled{opacity:.55;cursor:default;}
    .kl-mr-submit .kl-enh-loader{border-color:rgba(255,255,255,.35);border-top-color:#fff;}
    .kl-mr-layer{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(13,18,34,.4);padding:12px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);}
    .kl-mr-dlg{width:100%;max-width:520px;max-height:100%;overflow-y:auto;border-radius:16px;background:var(--kl-bg);color:var(--kl-fg);padding:16px;box-shadow:0 24px 60px rgba(0,0,0,.25);}
    .kl-mr-dlg-h{display:flex;align-items:flex-start;}
    .kl-mr-dlg-h h3{margin:0;font-size:20px;font-weight:650;}
    .kl-mr-dlg-h p{margin:4px 0 0;font-size:11.5px;color:var(--kl-muted);}
    .kl-mr-f{margin:16px 0 0;}
    .kl-mr-f>span{display:block;margin:0 0 6px;font-size:11px;font-weight:650;color:var(--kl-muted);}
    .kl-mr-in,.kl-mr-ta{width:100%;box-sizing:border-box;border:1px solid var(--kl-border);border-radius:11px;background:var(--kl-input-bg);color:var(--kl-fg);font:inherit;font-size:12.5px;padding:9px 11px;}
    .kl-mr-ta{min-height:150px;resize:vertical;line-height:1.45;}
    .kl-mr-in:focus,.kl-mr-ta:focus{outline:none;border-color:var(--kl-accent);}
    .kl-mr-seg{display:grid;gap:8px;}
    .kl-mr-seg button{height:36px;border:1px solid var(--kl-border);border-radius:10px;background:var(--kl-input-bg);color:var(--kl-fg);font:inherit;font-size:12.5px;font-weight:650;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;}
    .kl-mr-seg button.kl-on{background:var(--kl-accent);border-color:var(--kl-accent);color:#fff;}
    .kl-mr-dlg-f{display:flex;align-items:center;gap:8px;margin:20px 0 0;}
    .kl-mr-btn{height:38px;border:1px solid var(--kl-border);border-radius:10px;background:var(--kl-input-bg);color:var(--kl-fg);font:inherit;font-size:12.5px;font-weight:650;padding:0 14px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}
    .kl-mr-btn.kl-danger{color:#C93636;border-color:color-mix(in srgb,#C93636 35%,var(--kl-border));}
    .kl-mr-btn.kl-primary{background:var(--kl-accent);border-color:var(--kl-accent);color:#fff;}
    .kl-mr-btn:disabled{opacity:.5;cursor:default;}
    .kl-mr-btn.kl-ghost{margin-left:auto;border-color:transparent;background:transparent;}
    .kl-mr-done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20px;overflow-y:auto;}
    .kl-mr-done-ic{width:56px;height:56px;border-radius:50%;background:#E6F7EF;color:#168B54;display:grid;place-items:center;}
    .kl-mr-done h3{margin:20px 0 0;font-size:25px;font-weight:650;}
    .kl-mr-done p{margin:8px 0 0;max-width:380px;font-size:13px;line-height:1.5;color:var(--kl-muted);}
    .kl-mr-keys{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:20px 0 0;}
    .kl-mr-keys a,.kl-mr-keys span{border-radius:999px;background:color-mix(in srgb,var(--kl-accent) 12%,transparent);color:var(--kl-accent);padding:6px 12px;font-family:ui-monospace,monospace;font-size:10.5px;font-weight:650;text-decoration:none;}
    .kl-mr-done .kl-mr-btn{margin:28px 0 0;min-width:160px;justify-content:center;}
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
    /* KD-174: an OVERLAY anchored to the field, not an in-flow block. In the side column (a flex
       column with overflow-y:auto) an in-flow panel that also sets overflow:hidden gets
       min-height:0, so under vertical pressure it collapsed to its borders -- the list was
       'open' with zero height. Taking it out of flow removes that failure mode entirely and
       matches the reference control, which floats over the fields beneath it. */
    .klavity-remail-sugg{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:30;border:1px solid var(--kl-border);border-radius:8px;background:var(--kl-input-bg);box-shadow:0 12px 28px rgba(25,20,15,.18),0 2px 6px rgba(25,20,15,.08);overflow:hidden;}
    .klavity-remail-sugg-opt{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:transparent;border:0;padding:8px 10px;cursor:pointer;font-size:13px;color:var(--kl-fg);font-family:inherit;}
    .klavity-remail-sugg-opt:hover,.klavity-remail-sugg-opt:focus-visible{background:color-mix(in srgb,var(--kl-accent) 10%,transparent);outline:none;}
    .klavity-remail-sugg-opt[aria-selected="true"]{background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-remail-sugg-av{flex:0 0 auto;width:18px;height:18px;border-radius:50%;border:1px dashed var(--kl-accent);color:var(--kl-accent);display:grid;place-items:center;font-size:12px;line-height:1;}
    .klavity-remail-sugg-txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
    .klavity-remail-sugg-check{flex:0 0 auto;margin-left:auto;color:var(--kl-accent);display:inline-flex;}
    .klavity-remail-sugg-check[hidden]{display:none;}
    .klavity-remail-wrap{position:relative;display:block;}
    .klavity-remail-wrap.is-open{z-index:60;}
    .klavity-remail-wrap .klavity-remail{padding-right:30px;}
    .klavity-remail-caret{position:absolute;right:11px;top:calc(50% - 7px);width:0;height:0;border-left:4.5px solid transparent;border-right:4.5px solid transparent;border-top:5px solid var(--kl-muted);pointer-events:none;transition:transform .15s ease;}
    .klavity-remail-wrap.is-open .klavity-remail-caret{transform:rotate(180deg);}
    .klavity-remail-sugg-opt[hidden]{display:none;}
    .klavity-remail-matches{max-height:188px;overflow-y:auto;overscroll-behavior:contain;}
    .klavity-remail-person{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:transparent;border:0;padding:7px 10px;cursor:pointer;font-size:13px;color:var(--kl-fg);font-family:inherit;}
    .klavity-remail-person:hover,.klavity-remail-person:focus-visible{background:color-mix(in srgb,var(--kl-accent) 10%,transparent);outline:none;}
    .klavity-remail-av{flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:10px;font-weight:700;letter-spacing:.02em;}
    .klavity-remail-who{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
    .klavity-remail-who i{font-style:normal;color:var(--kl-muted);}
    .klavity-remail-sugg-hint{padding:0 10px 8px;font-size:11.5px;color:var(--kl-muted);line-height:1.35;}
    .klavity-remail-label{display:block;margin:2px 0 6px;font-size:12.5px;font-weight:600;color:var(--kl-muted);}
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
    /* Minimize (─) and Close (×) are pinned to the modal's top-right corner while the side column scrolls. Padding the first row
       wasn't enough: once scrolled, any row (e.g. "Start Recording") slid UNDER the buttons. So on the two-column layout the side
       column's scroll area starts BELOW the button row — nothing can ever pass beneath them. (The divider moves to the hero so it
       still runs full height.) */
    @media (min-width:761px){.kl-side{margin-top:52px;padding-top:6px;border-left:none;}.kl-hero{border-right:1px solid var(--kl-border);}.kl-side>.klavity-toggle,.kl-side>.klavity-types,.kl-side>.klavity-title-label{padding-right:0;}}
    /* Narrow layout: the screenshot toolbar is the top row instead, so it reserves the corner (× alone, or ─ + ×). */
    @media (max-width:760px){.kl-hero-tools{padding-right:50px;}.klavity-modal:has(.klavity-min) .kl-hero-tools{padding-right:86px;}}
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
  `, a.appendChild(Ja);
  const zr = document.createElement("div");
  zr.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${w ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${G("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${G("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${ie ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${ie.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Le(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Le(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Le(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${G("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${G("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      ${We ? `<div class="kl-multi" id="klavity-multi">
        <div class="kl-multi-head"><span class="kl-multi-ic">${G("monitor", { size: 18 })}</span><span class="kl-multi-name">Report Multiple Issues</span><span class="kl-multi-badge">${G("sparkles", { size: 10 })} AI Powered</span></div>
        <p class="kl-multi-copy">Record your screen with voice narration. AI will analyse it, identify multiple issues and create separate tickets for you.</p>
        <button type="button" class="kl-multi-start" id="klavity-multi-start"></button>
        <p class="kl-multi-status" id="klavity-multi-status" role="status" aria-live="polite" hidden></p>
      </div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${G("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${G("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${G(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${_e ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${G("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${G("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${G("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? ay : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(I / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${v} images</div>
        ${we ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${G("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${x ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${G("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${G("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${G("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${G("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      
      <label class="klavity-remail-label" for="klavity-remail">Email${t.requireEmail ? "" : " (optional)"}</label>
      <div class="klavity-remail-wrap">
        <input type="email" class="klavity-remail" id="klavity-remail" placeholder="name@company.com" autocomplete="klavity-off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-form-type="other" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="klavity-remail-sugg">
        <span class="klavity-remail-caret" id="klavity-remail-caret" aria-hidden="true"></span>
      <div class="klavity-remail-sugg" id="klavity-remail-sugg" role="listbox" aria-label="People" hidden>
        <div class="klavity-remail-matches" id="klavity-remail-matches"></div>
        <button type="button" class="klavity-remail-sugg-opt klavity-remail-create" id="klavity-remail-addcontact" role="option" aria-selected="false" title="Saves this email as a contact so the team can reply and tag you. Contacts don't get access to the project." hidden>
          <span class="klavity-remail-sugg-av" aria-hidden="true">+</span>
          <span class="klavity-remail-sugg-txt">Add "<b class="klavity-remail-sugg-em"></b>" as a contact</span>
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${G("check", { size: 13 })}</span>
        </button>
        <div class="klavity-remail-sugg-hint" id="klavity-remail-sugg-hint">Add it as a contact so the team can reply and tag you. Contacts don't get project access.</div>
      </div>
      
      </div>
      ${we ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
      ${n.reportClarity && n.preSubmitNudge !== !1 ? `<div class="klavity-nudge" id="klavity-nudge" role="alert" hidden>
        <div class="kl-nudge-h">This might be hard for the team to act on</div>
        <div class="kl-nudge-d">Adding what you expected + one step to reproduce gets it fixed faster. Or send it as-is — your call.</div>
        <div class="kl-nudge-row"><button type="button" class="kl-nudge-add" id="klavity-nudge-add">Add detail</button><button type="button" class="kl-nudge-anyway" id="klavity-nudge-anyway">Submit anyway</button></div>
      </div>` : ""}
      ${n.submitTargetToggle !== !1 ? `<div class="klavity-target" id="klavity-target">
        <div class="kl-tgt-label">Where should this go?</div>
        <div class="kl-tgt-seg" role="radiogroup" aria-label="Where should this report go?">
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${Le(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${G("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, zr.appendChild(le), a.appendChild(zr);
  const ze = a.getElementById("klavity-sharp"), Za = a.querySelector(".klavity-info-pop");
  if (ze && Za) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = Za.innerHTML, a.appendChild(g);
    const b = Pg({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    b.style.position = "fixed", a.appendChild(b);
    let k = !1;
    Ig().then((A) => {
      k = A;
    }).catch(() => {
    });
    const C = (A, O) => {
      const _ = ze.getBoundingClientRect(), U = Math.min(O, window.innerWidth - 16), D = 8, B = window.innerWidth, Y = window.innerHeight;
      A.style.left = Math.max(D, Math.min(_.left + _.width / 2 - U / 2, B - U - D)) + "px", A.style.top = "-9999px", A.style.visibility = "hidden", A.style.display = "block";
      const q = A.offsetHeight;
      A.style.display = "";
      let H = _.bottom + 8;
      H + q + D > Y && (H = _.top - q - 8), A.style.top = Math.max(D, Math.min(H, Y - q - D)) + "px", A.style.visibility = "";
    }, E = () => {
      !t.snapWithoutSharePrompt && !M && !k ? (g.classList.remove("kl-show"), C(b, 288), b.classList.add("kl-show")) : (b.classList.remove("kl-show"), C(g, 228), g.classList.add("kl-show"));
    }, R = () => {
      g.classList.remove("kl-show"), b.classList.remove("kl-show");
    };
    ze.addEventListener("mouseenter", E), ze.addEventListener("mouseleave", R), ze.addEventListener("focus", E), ze.addEventListener("blur", R);
  }
  let Qa = !1, cn = null;
  function ys() {
    try {
      cn == null || cn.remove();
    } catch {
    }
    cn = null;
    try {
      ze == null || ze.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Yp() {
    var R;
    if (Qa || !ze || Oe) return;
    Qa = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${G("x", { size: 13 })}</button></div>`, a.appendChild(g), cn = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const b = 8, k = Math.min(228, window.innerWidth - 16);
    let C = 0;
    const E = () => {
      if (!cn || Oe) return;
      const A = ze.getBoundingClientRect();
      if ((A.width === 0 || A.height === 0) && C++ < 20) {
        requestAnimationFrame(E);
        return;
      }
      const O = window.innerWidth, _ = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const U = g.offsetHeight;
      g.style.left = Math.max(b, Math.min(A.right - k, O - k - b)) + "px";
      let D = A.bottom + 8;
      D + U + b > _ && (D = A.top - U - 8), g.style.top = Math.max(b, Math.min(D, _ - U - b)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(E), (R = g.querySelector(".kl-nudge-x")) == null || R.addEventListener("click", ys);
    try {
      ze.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => ys(), 9e3);
    } catch {
    }
    ze.addEventListener("click", ys, { once: !0 });
  }
  function Vp(g) {
    ci = g === "attached", ot();
  }
  const el = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, b, k, C, E, R) => Nt(g, b, k, !1, !!C, E, R),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, b, k, C, E) => Nt(g, b, k, !0, !!C, E),
    close: lr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: jp,
    setReplayState: Vp,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (pe = Ci(g), !Oe)
        try {
          Ne(), ws();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || Oe) return;
      const b = P.findIndex((k) => k.id && g.id && k.id === g.id || k.dataUrl && g.dataUrl && k.dataUrl === g.dataUrl);
      b >= 0 ? (P[b] = g, be = b) : (P.push(g), be = P.length - 1), oe = null, un();
    }
  };
  function Ne() {
    const g = a.getElementById("klavity-strip"), b = a.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((k, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb", C === de && E.classList.add("kl-thumb-active");
      const R = document.createElement("img");
      R.src = k, R.title = "Click to select + mark up", R.addEventListener("load", () => {
        R.naturalHeight > R.naturalWidth * 1.4 && E.classList.add("kl-tall");
      }, { once: !0 }), R.addEventListener("click", () => {
        de = C, oe = null, be = null, Ne();
      });
      const A = document.createElement("button");
      A.className = "klavity-rm", A.innerHTML = G("x", { size: 13 }), A.title = "Remove", A.addEventListener("click", (D) => {
        D.stopPropagation(), tl(C), Ne();
      });
      const O = document.createElement("button");
      O.className = "klavity-mk", O.innerHTML = G("pencil", { size: 13 }), O.title = "Mark up", O.addEventListener("click", (D) => {
        D.stopPropagation(), Mh(C);
      });
      const _ = document.createElement("div");
      _.className = "klavity-thumb-media", _.append(R, A, O), E.append(_);
      const U = o[C];
      if (U) {
        const D = sy[U], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + U, B.title = U === "real-pixel" ? "Pixel-perfect capture (every image included)" : U === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', B.innerHTML = G(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Le(D.label) + "</span>", _.appendChild(B), D.degraded && t.onRetakeSharp) {
          const Y = document.createElement("button");
          Y.type = "button", Y.className = "klavity-retake", Y.innerHTML = G("zap", { size: 11 }) + "<span>Retake sharp</span>", Y.title = "Recapture this shot at full pixel quality", Y.addEventListener("click", (q) => {
            q.stopPropagation(), Kp(C, Y);
          }), E.appendChild(Y);
        }
      }
      if (il.has(C)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", E.appendChild(D);
      }
      g.appendChild(E);
    }), W.forEach((k, C) => {
      if (yn(k) !== "video") return;
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb", oe === C && E.classList.add("kl-thumb-active");
      const R = document.createElement("video");
      R.src = Ze(k), R.muted = !0, R.preload = "metadata", R.setAttribute("playsinline", ""), R.tabIndex = -1;
      const A = document.createElement("span");
      A.className = "kl-video-play", A.setAttribute("aria-hidden", "true"), A.innerHTML = G("play", { size: 16 });
      const O = document.createElement("span");
      O.className = "kl-video-badge", O.innerHTML = G("play", { size: 9 }) + "<span>Video</span>", E.title = "Click to play " + k.name, E.addEventListener("click", () => {
        oe = C, be = null, Ne();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = G("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (D) => {
        D.stopPropagation(), ol(C);
      }), E.append(R, A, O, _);
      const U = Ci(pe);
      if (U != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = U + "%", D.appendChild(B), E.appendChild(D);
      }
      g.appendChild(E);
    }), P.forEach((k, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb kl-rec-tile", be === C && E.classList.add("kl-thumb-active");
      const R = document.createElement("video");
      let A = k.dataUrl;
      k.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (A = k._previewUrl || (k._previewUrl = URL.createObjectURL(k.blob))), R.src = A, R.muted = !0, R.preload = "metadata", R.setAttribute("playsinline", ""), R.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = G("play", { size: 16 });
      const _ = Math.round(k.durationMs / 1e3), U = document.createElement("span");
      U.className = "kl-video-badge", U.innerHTML = G("play", { size: 9 }) + `<span>${Math.floor(_ / 60)}:${String(_ % 60).padStart(2, "0")}${k.screenOnly ? " · screen" : ""}</span>`, E.title = "Click to play your recording", E.addEventListener("click", () => {
        be = C, oe = null, Ne();
      });
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-rerec", D.innerHTML = G("refresh-cw", { size: 12 }), D.title = "Re-record", D.setAttribute("aria-label", "Re-record"), D.addEventListener("click", (q) => {
        var X;
        q.stopPropagation();
        const H = P.splice(C, 1)[0];
        if (H && H._previewUrl)
          try {
            URL.revokeObjectURL(H._previewUrl);
          } catch {
          }
        be === C ? be = null : be != null && be > C && (be -= 1), un();
        try {
          (X = a.getElementById("klavity-record")) == null || X.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = G("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (q) => {
        q.stopPropagation();
        const H = P.splice(C, 1)[0];
        if (H && H._previewUrl)
          try {
            URL.revokeObjectURL(H._previewUrl);
          } catch {
          }
        be === C ? be = null : be != null && be > C && (be -= 1), un();
      }), E.append(R, O, U, D, B);
      const Y = Ci(pe);
      if (Y != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const H = document.createElement("i");
        H.style.width = Y + "%", q.appendChild(H), E.appendChild(q);
      }
      g.appendChild(E);
    });
    try {
      const k = g.children[de];
      k && typeof k.scrollIntoView == "function" && k.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const k = document.createElement("div");
      k.className = "kl-thumb-skel kl-loading", k.setAttribute("role", "status"), k.setAttribute("aria-label", "Capturing screenshot"), k.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(k);
    }
    b.textContent = `${c.length}/${v} images`, b instanceof HTMLElement && (b.hidden = c.length === 0), ot(), ui(), Ml();
  }
  function ui() {
    const g = a.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && de >= 0 && de < c.length && !!h[de] && !m && !!t.onCaptureSharp && !Pt) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const C = document.createElement("span");
        C.className = "kl-sh-ic", C.innerHTML = G("triangle-alert", { size: 15 });
        const E = document.createElement("span");
        E.className = "kl-sh-txt", E.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const R = document.createElement("button");
        R.type = "button", R.className = "kl-sh-use", R.textContent = "Use Snap", R.addEventListener("click", () => {
          m = !0, ui(), ze == null || ze.click();
        });
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-x", A.setAttribute("aria-label", "Dismiss"), A.title = "Dismiss", A.innerHTML = G("x", { size: 12 }), A.addEventListener("click", () => {
          m = !0, ui();
        }), g.append(C, E, R, A);
      }
      g.hidden = !1, ze == null || ze.classList.add("kl-suggest");
    } else
      g.hidden = !0, ze == null || ze.classList.remove("kl-suggest");
  }
  function bs() {
    f = !0, l = !1, Ne();
  }
  function Gp() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Bt(g) {
    const b = a.getElementById("klavity-err");
    b && (b.textContent = g, b.style.display = "block");
  }
  function ks() {
    const g = a.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function tl(g) {
    var b;
    if (!(g < 0 || g >= c.length)) {
      c.splice(g, 1), p.splice(g, 1), o.splice(g, 1), h.splice(g, 1), u.splice(g, 1), delete re[g];
      for (const k of Object.keys(re).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        re[k - 1] = re[k], delete re[k];
      try {
        (b = t.onShotRemoved) == null || b.call(t, g);
      } catch {
      }
      delete Qe[g], delete Tt[g];
      for (const k of Object.keys(Qe).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        Qe[k - 1] = Qe[k], delete Qe[k];
      for (const k of Object.keys(Tt).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        Tt[k - 1] = Tt[k], delete Tt[k];
      c.length === 0 && er(null);
    }
  }
  function Nt(g, b, k, C = !0, E = !1, R, A) {
    var _;
    if (c.length >= v) {
      Bt(`You can attach up to ${v} images.`);
      return;
    }
    ks(), y = !1, f = !1, c.push(g);
    const O = c.length - 1;
    if (A && Array.isArray(A.shapes) && A.shapes.length && (re[O] = Dn(A)), p.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), o.push(b), h.push(E && b !== "real-pixel"), u.push(R), C && (de = c.length - 1, oe = null, be = null), Ne(), C)
      try {
        (_ = t.onShotAdded) == null || _.call(t, g, b);
      } catch {
      }
  }
  function $r() {
    let g = null;
    if (!i)
      try {
        g = bg(document.body);
      } catch {
        g = null;
      }
    return { restore: i ? wg(document.body) : null, geo: g };
  }
  function Dr(g, b, k) {
    g && b && b.rects.length && fe.set(g, { geo: b, capture: k });
  }
  function rl(g, b, k) {
    const C = Re.get(g);
    if (C) return C;
    const E = fe.get(g);
    if (!E) return null;
    const R = kg(E.geo, b, k, E.capture);
    return R && Re.set(g, R), R;
  }
  function nl(g, b) {
    var k;
    c[g] = b, p[g] = t.compressImage ? t.compressImage(b) : Promise.resolve(b), Ne();
    try {
      (k = t.onShotReplaced) == null || k.call(t, g, b, o[g]);
    } catch {
    }
  }
  async function Xp() {
    const g = ++ce;
    for (let b = 0; b < c.length; b++) {
      const k = c[b];
      if (!k) continue;
      if (!i) {
        const R = He.get(k);
        R && nl(b, R);
        continue;
      }
      if (He.has(k)) continue;
      let C = gt.get(k);
      if (!C) {
        const R = await vg(k, (A, O) => rl(k, A, O));
        if (!R) continue;
        C = R.url, gt.set(k, C), He.set(C, k), Re.set(C, R.rects);
      }
      if (g !== ce) return;
      const E = c.indexOf(k);
      E >= 0 && nl(E, C);
    }
  }
  const il = /* @__PURE__ */ new Set();
  async function Kp(g, b) {
    if (!(Pt || !t.onRetakeSharp)) {
      ct(!0), b.classList.add("kl-loading"), s.style.display = "none";
      try {
        const { restore: k, geo: C } = $r();
        let E;
        try {
          E = await t.onRetakeSharp(u[g]);
        } finally {
          k == null || k();
        }
        if (E) {
          const { dataUrl: R, quality: A } = Ht(E);
          Dr(R, C, u[g]), R && (c[g] = R, p[g] = t.compressImage ? t.compressImage(R) : Promise.resolve(R), o[g] = A ?? "real-pixel", h[g] = !1, re[g] && (delete re[g], il.add(g), an(g)), delete Qe[g], delete Tt[g]);
        }
      } catch {
      } finally {
        s.style.display = "", ct(!1), Ne();
      }
    }
  }
  function sl(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function vs(g) {
    ks();
    for (const b of g) {
      if (c.length >= v) {
        Bt(`You can attach up to ${v} images.`);
        break;
      }
      if (!sl(b)) {
        Bt(`"${b.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (b.size > S) {
        Bt(`"${b.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        Nt(await cc(b));
      } catch {
        Bt(`Couldn't add "${b.name}". Please try a different image.`);
      }
    }
  }
  function ws() {
    const g = a.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const b = W.filter((k) => yn(k) === "file");
    g.hidden = b.length === 0, W.forEach((k, C) => {
      if (yn(k) !== "file") return;
      const E = document.createElement("div");
      E.className = "kl-file-chip";
      const R = document.createElement("span");
      R.className = "kl-file-ic", R.innerHTML = G("file-text", { size: 14 });
      const A = document.createElement("span");
      A.className = "kl-file-nm", A.textContent = k.name, A.title = k.name;
      const O = document.createElement("span");
      O.className = "kl-file-sz", O.textContent = k.size < 1024 ? `${k.size} B` : k.size < 1024 * 1024 ? `${Math.round(k.size / 1024)} KB` : `${(k.size / 1024 / 1024).toFixed(1)} MB`;
      const _ = document.createElement("button");
      _.type = "button", _.className = "kl-file-rm", _.setAttribute("aria-label", `Remove ${k.name}`), _.title = "Remove", _.innerHTML = G("x", { size: 11 }), _.addEventListener("click", () => {
        ol(C);
      }), E.append(R, A, O, _);
      const U = Ci(pe);
      if (U != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = U + "%", D.appendChild(B), E.appendChild(D);
      }
      g.appendChild(E);
    }), ot();
  }
  function ol(g) {
    const b = W[g] && yn(W[g]) === "video";
    W[g] && me(W[g]), W.splice(g, 1), oe != null && (b && oe === g ? oe = null : oe > g && (oe -= 1)), ws(), Ne();
  }
  function Jp(g, b) {
    if (g.kind === "upgrade") {
      if (!g.url) return null;
      const C = document.createElement("a");
      return C.className = "kl-capmsg-cta", C.href = g.url, C.target = "_blank", C.rel = "noopener noreferrer", C.textContent = g.label, C;
    }
    if (!t.onRequestUpgrade) return null;
    const k = document.createElement("button");
    return k.type = "button", k.className = "kl-capmsg-cta kl-capmsg-req", k.textContent = g.label, k.addEventListener("click", async () => {
      if (k.disabled) return;
      const C = k.textContent || g.label;
      k.disabled = !0, k.textContent = "Requesting…";
      let E = !1;
      try {
        E = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: b });
      } catch {
        E = !1;
      }
      if (E) {
        const R = document.createElement("span");
        R.className = "kl-capmsg-sent", R.innerHTML = `<span class="kl-capmsg-sent-ic">${G("check")}</span>Request sent to your team`, k.replaceWith(R);
      } else
        k.disabled = !1, k.textContent = C;
    }), k;
  }
  function Zp(g, b) {
    const k = a.getElementById("klavity-capmsg");
    if (!k || !g.overCap) return;
    k.innerHTML = "";
    const C = document.createElement("span");
    if (C.className = "kl-capmsg-t", C.textContent = g.message || "", k.appendChild(C), g.cta) {
      const E = Jp(g.cta, b);
      if (E && k.appendChild(E), g.cta.hint) {
        const R = document.createElement("span");
        R.className = "kl-capmsg-hint", R.textContent = g.cta.hint, k.appendChild(R);
      }
    }
    k.hidden = !1;
  }
  function Qp() {
    const g = a.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function eh(g) {
    ks(), Qp();
    for (const b of g) {
      if (sl(b)) {
        await vs([b]);
        continue;
      }
      if (W.length >= T) {
        Bt(`You can attach up to ${T} files.`);
        break;
      }
      const k = dy(b, { capBytes: I, role: F, upgradeUrl: z });
      if (k.overCap) {
        Zp(k, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: b.name, sizeMb: Math.round(b.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (W.reduce((E, R) => E + R.size, 0) + b.size > Q) {
        Bt(`Attachments exceed the ${Math.round(Q / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const E = b.type || (aa(b) ? oy(b.name) : ""), R = aa(b) && Ue(), A = R ? { name: b.name, type: E, size: b.size, dataUrl: "", blob: b } : { name: b.name, type: E, size: b.size, dataUrl: await cc(b) };
        if (R)
          try {
            N.set(A, URL.createObjectURL(b));
          } catch {
          }
        const O = W.push(A) - 1;
        ws(), yn(W[O]) === "video" && (oe = O), Ne();
      } catch {
        Bt(`Couldn't add "${b.name}". Please try a different file.`);
      }
    }
  }
  function un() {
    Oe || (Ne(), ot(), oh(), th());
  }
  function th() {
    var b;
    const g = P.map((k) => k.id || k.dataUrl).join("|");
    if (g !== K) {
      K = g;
      try {
        (b = t.onRecordingsChange) == null || b.call(t, P.slice());
      } catch {
      }
    }
  }
  function Qt() {
    var C;
    const g = a.getElementById("klavity-multi-start"), b = a.getElementById("klavity-multi-status");
    if (!g || !b) return;
    const k = Be === "recording" ? "Stop &amp; analyse recording" : Be === "processing" ? "AI is analysing…" : Be === "done" ? "Record another walkthrough" : "Start Recording";
    if (g.innerHTML = `${Be === "processing" ? '<span class="kl-enh-loader"></span>' : G("monitor", { size: 15 })}<span>${k}</span>`, g.disabled = Be === "processing" || Be === "recording", b.classList.toggle("kl-rec", Be === "recording"), b.classList.toggle("kl-ok", Be === "done"), Be === "recording")
      b.hidden = !1, b.textContent = "Recording screen and microphone…";
    else if (Be === "done" && Se) {
      const E = Se.length;
      b.hidden = !1, b.innerHTML = `${E} issue${E === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (C = b.querySelector("#klavity-multi-reopen")) == null || C.addEventListener("click", () => ll());
    } else ar ? (b.hidden = !1, b.textContent = ar) : (b.hidden = !0, b.textContent = "");
  }
  async function rh() {
    if (Pt || Be === "processing" || Be === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(lt && P.includes(lt)) && P.length >= Xe) {
      Bt(`You can attach up to ${Xe} recordings.`);
      return;
    }
    const b = ++ut;
    ar = "", ct(!0);
    const k = (E) => {
      s.style.display = E === "recording" ? "none" : "", E === "recording" && b === ut && (Be = "recording", Qt());
    };
    let C = null;
    try {
      C = await t.onRecord(k, { purpose: "multi" });
    } catch {
      C = null;
    } finally {
      s.style.display = "", ct(!1);
    }
    if (!(b !== ut || Oe)) {
      if (!C) {
        Be = Se ? "done" : "idle", Qt();
        return;
      }
      await al(C, b);
    }
  }
  function nh(g) {
    const b = P.find((C) => C.id === g);
    if (!b || !t.onSplitRecording || Be !== "idle") return;
    const k = ++ut;
    Be = "processing", Promise.resolve().then(() => {
      if (k === ut && !Oe) return al(b, k);
    });
  }
  async function al(g, b) {
    var A, O;
    ar = "";
    for (let _ = c.length - 1; _ >= 0; _--)
      (O = (A = re[_]) == null ? void 0 : A.shapes) != null && O.length || tl(_);
    const k = P.indexOf(g), C = k >= 0 ? k : lt ? P.indexOf(lt) : -1;
    C >= 0 ? P[C] = g : P.push(g), be = C >= 0 ? C : P.length - 1, oe = null, lt = g, Se = null, yt = null, Fn(), Be = "processing", un(), Qt();
    let E = null;
    try {
      const _ = g.blob || await (await fetch(g.dataUrl)).blob();
      let U = [], D = null;
      try {
        if (g.blob)
          try {
            D = URL.createObjectURL(g.blob);
          } catch {
            D = null;
          }
        U = await ey(D || g.dataUrl, (g.durationMs || 0) / 1e3);
      } catch {
        U = [];
      } finally {
        if (D)
          try {
            URL.revokeObjectURL(D);
          } catch {
          }
      }
      if (b !== ut || Oe) return;
      E = await t.onSplitRecording(_, { text: J.value.trim(), ...U.length ? { frames: U } : {} });
    } catch {
      E = null;
    }
    if (b !== ut || Oe) return;
    const R = (E || []).filter((_) => _ && (String(_.title || "").trim() || String(_.description || "").trim()));
    if (!R.length) {
      lt = null, Se = null, yt = null, Be = "idle", ar = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", Qt();
      return;
    }
    Se = R.map((_, U) => ({
      ..._,
      id: `mi${b}_${U}`,
      title: String(_.title || "").trim() || `Issue ${U + 1}`,
      kind: _.kind === "feature" ? "feature" : "bug",
      description: oc(_),
      selected: !0,
      thumb: null
    })), yt = Se.map((_) => ({ ..._ })), St = !1, Pe = null, Nr = "", Be = "done", Qt(), ll(), ih(b);
  }
  async function ih(g) {
    const b = lt;
    if (!b || !Se) return;
    let k = b.dataUrl, C = null;
    if (b.blob)
      try {
        C = URL.createObjectURL(b.blob), k = C;
      } catch {
      }
    try {
      for (const E of [...Se]) {
        if (g !== ut || Oe) return;
        const R = typeof E.startSec == "number" ? E.startSec : 0, A = typeof E.endSec == "number" && E.endSec > R ? E.endSec : R + 2, O = k ? await Md(k, R + Math.min(1, (A - R) / 2)) : null;
        if (g !== ut) return;
        if (O) {
          for (const _ of [Se, yt]) {
            const U = _ == null ? void 0 : _.find((D) => D.id === E.id);
            U && (U.thumb = O);
          }
          At();
        }
        sh(E.id, O, g);
      }
    } finally {
      if (C)
        try {
          URL.revokeObjectURL(C);
        } catch {
        }
    }
  }
  async function sh(g, b, k) {
    const C = t.onEnhance, E = Se == null ? void 0 : Se.find((q) => q.id === g);
    if (!C || !E) return;
    const R = (q) => String(q || "").trim().toLowerCase().replace(/\s+/g, " "), A = R(E.narration), O = !!A && (Se || []).some((q) => {
      const H = q.id === g ? "" : R(q.narration);
      return !!H && (H === A || H.includes(A) || A.includes(H));
    }), _ = [E.title, E.actualResult, E.expectedResult ? `Expected: ${E.expectedResult}` : ""].map((q) => String(q || "").trim()).filter(Boolean).join(`
`), U = !O && String(E.narration || "").trim() || _ || E.title, D = (q) => {
      for (const H of [Se, yt]) {
        const X = H == null ? void 0 : H.find((Z) => Z.id === g);
        X && (X.enhancing = q);
      }
    };
    D(!0), At();
    let B = null;
    try {
      B = await C(U, { images: b ? 1 : 0, ...b ? { shot: b } : {} });
    } catch {
      B = null;
    }
    if (k !== ut || Oe) return;
    D(!1);
    const Y = R(B == null ? void 0 : B.summary);
    if (Y && (Se || []).some((q) => q.id !== g && R(q.title) === Y) && (B = null), B)
      for (const q of [Se, yt]) {
        const H = q == null ? void 0 : q.find((X) => X.id === g);
        !H || q === Se && H.edited || (H.title = String(B.summary || "").trim() || H.title, H.actualResult = B.actualResult || "", H.expectedResult = B.expectedResult || "", H.stepsToReproduce = Array.isArray(B.stepsToReproduce) ? B.stepsToReproduce : [], B.suggestedSeverity && (H.suggestedSeverity = B.suggestedSeverity), B.suggestedPriority && (H.suggestedPriority = B.suggestedPriority), H.description = oc(H));
      }
    At();
  }
  function ll() {
    if (!Se || Oe) return;
    const g = a.getElementById("klavity-side");
    De || (De = document.createElement("div"), De.className = "kl-mr", De.id = "klavity-mr", De.setAttribute("role", "dialog"), De.setAttribute("aria-label", "AI Analysis Complete"), (g || le).appendChild(De)), g && (g.scrollTop = 0, g.classList.add("kl-mr-open")), At();
  }
  function Fn() {
    var g;
    se = null, Ee = null, De == null || De.remove(), De = null, (g = a.getElementById("klavity-side")) == null || g.classList.remove("kl-mr-open");
  }
  function oh() {
    !lt || P.includes(lt) || (ut++, lt = null, Se = null, yt = null, St = !1, Be = "idle", ar = "", Fn(), Qt());
  }
  function ah(g) {
    if (!lt) return;
    const b = P.indexOf(lt);
    if (b < 0) return;
    (be !== b || !a.querySelector(".kl-hero-video")) && (be = b, oe = null, Ne());
    const k = a.querySelector(".kl-hero-video");
    if (!k) return;
    const C = () => {
      try {
        k.currentTime = Math.max(0, g);
        const E = k.play();
        E && typeof E.catch == "function" && E.catch(() => {
        });
      } catch {
      }
    };
    k.readyState >= 1 ? C() : k.addEventListener("loadedmetadata", C, { once: !0 });
  }
  function cl() {
    if (St && !Pe && typeof window.confirm == "function") {
      let g = !0;
      try {
        g = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        g = !0;
      }
      if (!g) return !1;
    }
    return yt && (Se = yt.map((g) => ({ ...g }))), St = !1, !0;
  }
  function lh(g) {
    return Jg(g.description, g.title);
  }
  function At() {
    if (!De || !Se) return;
    if (Pe) {
      ph();
      return;
    }
    const g = Se, b = g.filter((A) => A.selected), k = g.length > 0 && b.length === g.length, C = g.length, E = b.length, R = g.map((A) => {
      const O = oa(A.startSec, A.endSec), _ = Xg(A.suggestedPriority), U = typeof A.confidence == "number" && isFinite(A.confidence) ? Math.round(A.confidence * 100) : null, D = A.kind === "feature";
      return `<div class="kl-mr-card${A.selected ? "" : " kl-off"}" data-id="${Le(A.id)}"><input type="checkbox" class="kl-mr-cb" ${A.selected ? "checked" : ""} aria-label="${A.selected ? "Deselect" : "Select"} ${Le(A.title)}"><div class="kl-mr-thumb">${A.thumb ? `<img src="${Le(A.thumb)}" alt="">` : G("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Le(A.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Le(A.title)}">${G("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${D ? "kl-mr-feat" : "kl-mr-bug"}">${G(D ? "lightbulb" : "bug", { size: 10 })}${D ? "Feature" : "Bug"}</span>${_ ? `<span class="kl-mr-p${_ === "High" ? 1 : _ === "Medium" ? 2 : 3}">${_}</span>` : ""}${U != null && U < 85 ? `<span class="kl-mr-conf">${U}% · review</span>` : ""}${A.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${A.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Le(lh(A))}</p>${O ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${G("clock", { size: 11 })} ${Le(O)}</button>` : ""}</div></div>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${G("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${G("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${G("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${C} report${C === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${C} report${C === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${E} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${k ? "checked" : ""} aria-label="${k ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${R}</div></div></div><div class="kl-mr-foot"><p>${E} of ${C} tickets selected</p>${Nr ? `<p class="kl-mr-err" role="alert">${Le(Nr)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${E === 0 || Zt ? "disabled" : ""}>${Zt ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${E} ${E === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (se && Ee ? ch() : ""), uh();
  }
  function ch() {
    const g = Ee, b = (k, C) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${C.length},1fr)">${C.map(([E, R, A]) => `<button type="button" class="${k}${(k === "kl-mr-kind" ? g.kind : g.priority) === E ? " kl-on" : ""}" data-v="${E}">${A}${R}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${G("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Le(g.title)}"></label><div class="kl-mr-f"><span>Type</span>${b("kl-mr-kind", [["bug", "Bug", G("bug", { size: 13 })], ["feature", "Feature", G("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${b("kl-mr-pri", sa.map((k) => [k.priority, k.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Le(g.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Le(g.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${G("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${g.title.trim() && g.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function uh() {
    var b, k, C, E;
    if (!De || !Se) return;
    const g = (R) => De.querySelector(R);
    (b = g("#kl-mr-back")) == null || b.addEventListener("click", () => {
      Zt || !cl() || (Fn(), Qt());
    }), (k = g("#kl-mr-close")) == null || k.addEventListener("click", () => {
      Zt || !cl() || (Fn(), lr());
    }), (C = g("#kl-mr-all")) == null || C.addEventListener("change", (R) => {
      const A = R.target.checked;
      Se.forEach((O) => {
        O.selected = A;
      }), St = !0, At();
    }), (E = g("#kl-mr-submit")) == null || E.addEventListener("click", () => {
      hh();
    }), De.querySelectorAll(".kl-mr-card").forEach((R) => {
      var O, _, U;
      const A = Se.find((D) => D.id === R.dataset.id);
      A && ((O = R.querySelector(".kl-mr-cb")) == null || O.addEventListener("change", (D) => {
        A.selected = D.target.checked, St = !0, At();
      }), (_ = R.querySelector(".kl-mr-edit")) == null || _.addEventListener("click", () => {
        var D;
        se = A.id, Ee = { title: A.title, kind: A.kind === "feature" ? "feature" : "bug", priority: String(A.suggestedPriority || "").toUpperCase(), description: A.description, ts: oa(A.startSec, A.endSec) }, At(), (D = De == null ? void 0 : De.querySelector("#kl-mr-ed-title")) == null || D.focus();
      }), (U = R.querySelector(".kl-mr-ts")) == null || U.addEventListener("click", () => ah(typeof A.startSec == "number" ? A.startSec : 0)));
    }), se && Ee && dh();
  }
  function dh() {
    var R, A, O, _, U, D;
    const g = Ee, b = (B) => De.querySelector(B), k = b("#kl-mr-ed-save"), C = () => {
      k && (k.disabled = !(g.title.trim() && g.description.trim()));
    }, E = () => {
      se = null, Ee = null, At();
    };
    (R = b("#kl-mr-ed-title")) == null || R.addEventListener("input", (B) => {
      g.title = B.target.value, C();
    }), (A = b("#kl-mr-ed-desc")) == null || A.addEventListener("input", (B) => {
      g.description = B.target.value, C();
    }), (O = b("#kl-mr-ed-ts")) == null || O.addEventListener("input", (B) => {
      g.ts = B.target.value;
    }), De.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((B) => B.addEventListener("click", () => {
      B.classList.contains("kl-mr-kind") ? g.kind = B.dataset.v === "feature" ? "feature" : "bug" : g.priority = B.dataset.v || "";
      const Y = B.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      De.querySelectorAll(Y).forEach((q) => q.classList.toggle("kl-on", q === B));
    })), (_ = b("#kl-mr-ed-x")) == null || _.addEventListener("click", E), (U = b("#kl-mr-ed-cancel")) == null || U.addEventListener("click", E), (D = b("#kl-mr-ed-rm")) == null || D.addEventListener("click", () => {
      if (Se = Se.filter((B) => B.id !== se), St = !0, se = null, Ee = null, !Se.length) {
        Se = null, Be = "idle", Fn(), Qt();
        return;
      }
      At(), Qt();
    }), k == null || k.addEventListener("click", () => {
      const B = Se.find((H) => H.id === se);
      if (!B || !g.title.trim() || !g.description.trim()) return;
      B.title = g.title.trim(), B.edited = !0, B.kind = g.kind, B.description = g.description.trim();
      const Y = sa.find((H) => H.priority === g.priority);
      Y && (B.suggestedPriority = Y.priority, B.suggestedSeverity = Y.severity);
      const q = Kg(g.ts);
      B.startSec = q.startSec, B.endSec = q.endSec, St = !0, se = null, Ee = null, At();
    });
  }
  function ph() {
    var C, E;
    if (!De || !Pe) return;
    const g = Pe.refs.length, b = Pe.refs.filter((R) => R.key).map((R) => {
      const A = Hs(R.url), O = Le(js(R.key, R.url));
      return A ? `<a href="${Le(A)}" target="_blank" rel="noopener">${O}</a>` : `<span>${O}</span>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${G("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${G("check", { size: 25 })}</span><h3>${g} ticket${g === 1 ? "" : "s"} created</h3><p>${Le(n.thankYou || "Your AI-generated reports have been filed.")}</p>${Pe.failed ? `<p role="alert">${Pe.failed} ticket${Pe.failed === 1 ? "" : "s"} couldn't be created — please report ${Pe.failed === 1 ? "it" : "them"} again.</p>` : ""}${b ? `<div class="kl-mr-keys">${b}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const k = () => lr({ reason: "submitted" });
    (C = De.querySelector("#kl-mr-close")) == null || C.addEventListener("click", k), (E = De.querySelector("#kl-mr-done")) == null || E.addEventListener("click", k);
  }
  async function hh() {
    var O;
    if (!Se || !lt || Zt) return;
    const g = Se.filter((_) => _.selected).map((_) => ({ ..._, title: _.title.trim(), description: _.description.trim() }));
    if (!g.length) return;
    const b = wl(), k = n.submitTargetToggle !== !1 ? { feedbackTarget: Ss } : {}, C = (_) => _.kind === "feature" ? "feature" : "bug", E = (_) => ({
      ..._.suggestedSeverity ? { suggestedSeverity: _.suggestedSeverity } : {},
      ..._.suggestedPriority ? { suggestedPriority: _.suggestedPriority } : {}
    }), R = g[0], A = g.slice(1);
    Zt = !0, Nr = "", At();
    try {
      const _ = await Promise.all(p.slice()), U = lt, D = {
        type: C(R),
        ...ie ? { kind: C(R) } : {},
        title: R.title,
        description: ac(R, { primary: !0, reporterNote: J.value.trim() }),
        screenshots: _.length ? _ : R.thumb ? [R.thumb] : [],
        ...W.length ? { files: W.slice() } : {},
        recordings: [U, ...P.filter((X) => X !== U)],
        ..._.length ? { annotations: Ce() } : {},
        reporterEmail: b.email,
        createContact: b.createContact,
        ...k,
        ...E(R),
        ...t.consoleAttachToggle ? { attachConsole: !!((O = a.getElementById("klavity-conlog-cb")) != null && O.checked) } : {}
      }, B = (X, Z) => ({
        type: C(X),
        ...ie ? { kind: C(X) } : {},
        title: X.title,
        description: ac(X, { primary: !1, videoTitle: R.title, videoKey: Z }),
        screenshots: X.thumb ? [X.thumb] : [],
        recordings: [U],
        reporterEmail: b.email,
        createContact: !1,
        ...k,
        ...E(X)
      });
      if (t.backgroundUpload) {
        const X = t.onSubmit;
        X(D), (async () => {
          for (const Z of A)
            try {
              await X(B(Z));
            } catch (he) {
              try {
                console.error("[Klavity] multi-issue ticket failed:", he);
              } catch {
              }
            }
        })(), lr({ immediate: !0, reason: "submitted" });
        return;
      }
      const Y = await t.onSubmit(D), q = [{ key: Y.issueKey, url: Y.issueUrl }];
      let H = 0;
      for (const X of A)
        try {
          const Z = await t.onSubmit(B(X, Y.issueKey || void 0));
          q.push({ key: Z.issueKey, url: Z.issueUrl });
        } catch (Z) {
          H++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", Z);
          } catch {
          }
        }
      if (Oe) return;
      Zt = !1, Pe = { refs: q, failed: H }, St = !1, At();
    } catch (_) {
      try {
        console.error("[Klavity] multi-issue submit failed:", _);
      } catch {
      }
      if (Oe) return;
      Zt = !1, Nr = n.debug ? `Couldn't create the tickets — ${(_ == null ? void 0 : _.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", At();
    }
  }
  let Fr = null;
  function lr(g) {
    var C;
    if (Oe) return;
    Oe = !0;
    for (const E of Pr.splice(0))
      try {
        E();
      } catch {
      }
    ut++;
    for (const E of W) me(E);
    for (const E of P)
      if (E._previewUrl)
        try {
          URL.revokeObjectURL(E._previewUrl);
        } catch {
        }
    if (br) {
      try {
        URL.revokeObjectURL(br);
      } catch {
      }
      br = null;
    }
    Fr == null || Fr(), rt && (clearTimeout(rt), rt = null), document.removeEventListener("keydown", Ur, { capture: !0 }), document.removeEventListener("paste", dl);
    try {
      (C = t.onClose) == null || C.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const b = a.querySelector(".klavity-modal");
    if (g != null && g.immediate || !b) {
      Je(s);
      return;
    }
    b.classList.add("kl-closing");
    const k = () => Je(s);
    b.addEventListener("animationend", k, { once: !0 }), setTimeout(k, 700);
  }
  function ul(g, b) {
    if (rt || Oe) return;
    const k = document.createElement("div");
    k.className = "klavity-toast-progress", k.style.animationDuration = b + "ms", g.appendChild(k);
    let C = b, E = Date.now();
    const R = () => {
      E = Date.now(), rt = setTimeout(() => {
        lr();
      }, C);
    }, A = () => {
      rt && (clearTimeout(rt), rt = null, C = Math.max(0, C - (Date.now() - E)), k.style.animationPlayState = "paused");
    }, O = () => {
      rt || g.classList.contains("kl-closing") || (k.style.animationPlayState = "running", R());
    };
    g.addEventListener("mouseenter", A), g.addEventListener("mouseleave", O), g.addEventListener("focusin", A), g.addEventListener("focusout", (_) => {
      g.contains(_.relatedTarget) || O();
    }), R();
  }
  function Ur(g) {
    var b;
    if (pi) {
      g.key === "Escape" ? (g.stopPropagation(), pi()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), Cs();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const k = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (k && (k.tagName === "INPUT" || k.tagName === "TEXTAREA" || k.tagName === "SELECT" || k.isContentEditable || ((b = k.getAttribute) == null ? void 0 : b.call(k, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const C = a.getElementById("klavity-submit");
      C && !C.disabled && (g.preventDefault(), g.stopPropagation(), C.click());
    }
  }
  document.addEventListener("keydown", Ur, { capture: !0 });
  const dl = (g) => {
    if (!g.clipboardData) return;
    const b = Array.from(g.clipboardData.items).filter((k) => k.type.startsWith("image/")).map((k) => k.getAsFile()).filter((k) => !!k);
    b.length && vs(b);
  };
  document.addEventListener("paste", dl);
  const xs = () => {
    const g = le.querySelector("#klavity-desc");
    g && (g.placeholder = xe === "feature" ? "Describe the feature you'd like..." : xe === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (ie) {
    const g = Array.from(le.querySelectorAll(".kl-type-chip"));
    g.forEach((b) => {
      b.addEventListener("click", () => {
        xe = b.getAttribute("data-kind") || "bug", g.forEach((k) => {
          const C = k === b;
          k.classList.toggle("active", C), k.setAttribute("aria-checked", C ? "true" : "false");
        }), xs();
      });
    });
  } else {
    const g = le.querySelector(".kl-toggle-bug"), b = le.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      xe = "bug", g.classList.add("active"), b.classList.remove("active"), xs();
    }), b.addEventListener("click", () => {
      xe = "feature", b.classList.add("active"), g.classList.remove("active"), xs();
    });
  }
  let Ss = "project";
  {
    const g = le.querySelector("#klavity-target");
    if (g) {
      const b = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const k of b)
        k.addEventListener("click", () => {
          Ss = k.dataset.target === "klavity" ? "klavity" : "project";
          for (const E of b) {
            const R = E === k;
            E.classList.toggle("on", R), E.setAttribute("aria-checked", R ? "true" : "false");
          }
        });
    }
  }
  const J = le.querySelector("#klavity-desc");
  {
    const g = () => {
      try {
        return a.getSelection ? a.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, b = () => {
      const E = g();
      if (!E || !E.rangeCount) return -1;
      try {
        const R = E.getRangeAt(0);
        if (!J.contains(R.endContainer)) return -1;
        const A = R.cloneRange();
        return A.selectNodeContents(J), A.setEnd(R.endContainer, R.endOffset), A.toString().length;
      } catch {
        return -1;
      }
    }, k = (E) => {
      const R = g();
      if (R)
        try {
          const A = document.createRange(), O = document.createTreeWalker(J, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let _, U = E, D = !1;
          for (; _ = O.nextNode(); ) {
            if (_.nodeName === "BR") {
              if (U === 0) {
                A.setStartBefore(_), D = !0;
                break;
              }
              U -= 1;
              continue;
            }
            if (_.nodeType === 3) {
              const B = (_.textContent || "").length;
              if (U <= B) {
                A.setStart(_, U), D = !0;
                break;
              }
              U -= B;
            }
          }
          D ? A.collapse(!0) : (A.selectNodeContents(J), A.collapse(!1)), R.removeAllRanges(), R.addRange(A);
        } catch {
        }
    }, C = () => {
      const E = b(), R = sc(J).replace(/\n$/, "");
      J.innerHTML = R ? ic(R) : "", E >= 0 && k(E);
    };
    J.addEventListener("input", C), Object.defineProperty(J, "value", {
      configurable: !0,
      get() {
        return sc(J);
      },
      set(E) {
        const R = String(E ?? "").replace(/\n$/, "");
        J.innerHTML = R ? ic(R) : "";
      }
    }), Object.defineProperty(J, "disabled", {
      configurable: !0,
      get() {
        return J.getAttribute("contenteditable") === "false";
      },
      set(E) {
        J.setAttribute("contenteditable", E ? "false" : "true"), J.classList.toggle("kl-desc-disabled", !!E);
      }
    }), Object.defineProperty(J, "placeholder", {
      configurable: !0,
      get() {
        return J.getAttribute("data-ph") || "";
      },
      set(E) {
        J.setAttribute("data-ph", String(E ?? ""));
      }
    });
  }
  const Br = le.querySelector("#klavity-submit"), ke = le.querySelector("#klavity-remail");
  let mr = "", Un = !1;
  ke && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (ke.value = t.prefillEmail), ke && ke.value.trim() && (mr = ke.value.trim().toLowerCase());
  const pl = le.querySelector("#klavity-desc-hint"), fh = () => !t.requireEmail || !!ke && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ke.value.trim()), Es = () => {
    var g;
    return c.length > 0 || ci || W.length > 0 || P.length > 0 || J.value.trim().length > 0 || (((g = le.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let di = null, pi = null;
  const Cs = () => {
    var C, E, R;
    if (!Es()) {
      lr();
      return;
    }
    if (di) return;
    const g = document.createElement("div");
    di = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const b = () => {
      Je(g), di === g && (di = null, pi = null);
    };
    pi = b, g.addEventListener("click", (A) => {
      A.target === g && b();
    }), (C = g.querySelector("#kl-cc-keep")) == null || C.addEventListener("click", b), (E = g.querySelector("#kl-cc-discard")) == null || E.addEventListener("click", () => {
      b(), lr({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || zr).appendChild(g);
    try {
      (R = g.querySelector("#kl-cc-keep")) == null || R.focus();
    } catch {
    }
  }, mh = () => {
  }, ot = () => {
    const g = J.value.trim() === "";
    Br.disabled = g && !Es() || !fh(), pl && (pl.hidden = !(g && Es()));
  };
  if (J.addEventListener("input", mh), J.addEventListener("input", ot), ke == null || ke.addEventListener("input", ot), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let b = null;
    const k = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(J.value);
      } catch {
      }
    };
    J.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(k, 600);
    }), J.addEventListener("blur", k), J.addEventListener("change", k), on(k);
  }
  const Bn = le.querySelector("#klavity-title");
  if (Bn && t.onTitleChange) {
    const g = t.onTitleChange;
    let b = null;
    const k = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(Bn.value);
      } catch {
      }
    };
    Bn.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(k, 600);
    }), Bn.addEventListener("blur", k), Bn.addEventListener("change", k), on(k);
  }
  const qr = le.querySelector("#klavity-remail-sugg"), Ms = le.querySelector("#klavity-remail-matches"), hl = le.querySelector("#klavity-remail-sugg-hint"), gr = le.querySelector("#klavity-remail-addcontact"), fl = le.querySelector(".klavity-remail-sugg-em"), ml = le.querySelector(".klavity-remail-sugg-check");
  let qt = !1, dn = "", hi = [], Rs = "", Ts = !1, gl = 0;
  const yl = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), gh = (g) => {
    var C, E;
    const b = (g.name || g.email).trim(), k = b.split(/[\s._-]+/).filter(Boolean);
    return ((((C = k[0]) == null ? void 0 : C[0]) || "") + (((E = k[1]) == null ? void 0 : E[0]) || "")).toUpperCase() || b.slice(0, 1).toUpperCase();
  }, yh = (g) => {
    let b = 0;
    for (let k = 0; k < g.length; k++) b = b * 31 + g.charCodeAt(k) >>> 0;
    return `hsl(${b % 360} 58% 42%)`;
  };
  async function bl(g) {
    if (!t.onLookupPeople) {
      hi = [], Rs = g, Ts = !0;
      return;
    }
    const b = ++gl;
    try {
      const k = await t.onLookupPeople(g);
      if (b !== gl) return;
      hi = Array.isArray(k) ? k : [];
    } catch {
      hi = [];
    }
    Rs = g, Ts = !0, yr();
  }
  function yr() {
    if (!qr || !ke) return;
    const g = ke.value.trim(), b = g.toLowerCase();
    qt && b !== dn && (qt = !1, dn = "");
    const k = Un ? hi.filter((A) => !b || A.email.toLowerCase().includes(b)) : [], C = k.some((A) => A.email.toLowerCase() === b), E = Un && yl(g) && !C;
    Ms && (Ms.innerHTML = k.map((A) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Le(A.email)}">
          <span class="klavity-remail-av" style="background:${Le(yh(A.email))}">${Le(gh(A))}</span>
          <span class="klavity-remail-who">${A.name ? `${Le(A.name)} <i>(${Le(A.email)})</i>` : Le(A.email)}</span>
        </button>`).join(""), Ms.querySelectorAll(".klavity-remail-person").forEach((A) => {
      A.addEventListener("click", () => {
        var O;
        ke.value = A.getAttribute("data-email") || "", qt = !1, dn = "", mr = ke.value.trim().toLowerCase(), (O = t.onRememberEmail) == null || O.call(t, mr), yr(), ot();
      });
    }));
    const R = ke.parentElement;
    R && R.classList.contains("klavity-remail-wrap") && R.classList.toggle("is-open", !!(k.length || E)), ke.setAttribute("aria-expanded", k.length || E ? "true" : "false"), gr && (gr.hidden = !E), hl && (hl.hidden = !E), qr.hidden = !(k.length || E), fl && (fl.textContent = g), ml && (ml.hidden = !qt), gr == null || gr.setAttribute("aria-selected", qt ? "true" : "false");
  }
  gr == null || gr.addEventListener("click", () => {
    var b;
    const g = (ke == null ? void 0 : ke.value.trim()) || "";
    yl(g) && (qt = !qt, dn = qt ? g.toLowerCase() : "", mr = qt ? g.toLowerCase() : "", mr && ((b = t.onRememberEmail) == null || b.call(t, mr)), yr(), ot());
  });
  function bh() {
    if (!ke || t.requireEmail) return;
    const g = ke.value.trim();
    g && g.toLowerCase() !== mr && (ke.value = "", qt = !1, dn = "", mr = "", yr(), ot());
  }
  function kl() {
    setTimeout(() => {
      var C;
      const b = le.getRootNode().activeElement;
      b === ke || qr && b && qr.contains(b) || (Un = !1, ke && !ke.value.trim() && ((C = t.onRememberEmail) == null || C.call(t, "")), bh(), yr());
    }, 0);
  }
  ke == null || ke.addEventListener("blur", kl), qr == null || qr.addEventListener("focusout", kl);
  let As = null;
  if (ke == null || ke.addEventListener("focus", () => {
    Un = !0, yr(), Ts || bl("");
  }), ke == null || ke.addEventListener("input", () => {
    Un = !0, yr();
    const g = ke.value.trim().toLowerCase();
    g !== Rs && (As && clearTimeout(As), As = setTimeout(() => {
      bl(g);
    }, 180));
  }), yr(), t.onEnhance) {
    const g = t.onEnhance, b = le.querySelector("#klavity-enhance"), k = le.querySelector("#klavity-enhance-undo"), C = le.querySelector("#klavity-enhance-regen"), E = le.querySelector("#klavity-enhance-spin");
    let R = 0, A = null;
    const O = () => c[de] || c[0] || "", _ = () => {
      const D = O();
      if (!D) return "";
      const B = de >= 0 && de < c.length ? de : 0, Y = re[B] ?? (B === 0 ? re[0] : null);
      if (!Y || !Array.isArray(Y.shapes) || !Y.shapes.length) return D;
      const q = a.getElementById("klavity-hero-stage"), H = q == null ? void 0 : q.querySelector("canvas");
      if (H && de === B && H.width > 1 && H.height > 1)
        try {
          const X = H.toDataURL("image/png");
          if (X && X.length > 64) return X;
        } catch {
        }
      return null;
    }, U = async () => {
      if (Pt) return;
      const D = J.value.trim();
      A = J.value;
      const B = ++R;
      b && (b.disabled = !0), E && (E.hidden = !1);
      try {
        const Y = ye ? { selector: ye.selector, text: ye.text } : null, q = de >= 0 && de < c.length ? de : 0, H = re[q] ?? (q === 0 ? re[0] : null), X = Gm(H == null ? void 0 : H.shapes), Z = O();
        let he = _();
        he === null && (he = await Xm(Z, H.shapes, H.w, H.h));
        const Ye = await g(D, {
          images: c.length,
          shot: he,
          annotations: H,
          annotationTexts: X,
          picked: Y
        });
        if (B !== R || !Ye) return;
        J.value = Rd(Ye), J.dispatchEvent(new Event("input", { bubbles: !0 })), Ot = Ye.suggestedSeverity || null, Or = Ye.suggestedPriority || null, J.classList.add("kl-just-enhanced"), setTimeout(() => J.classList.remove("kl-just-enhanced"), 700), k && (k.hidden = !1), C && (C.hidden = !1), ot();
      } catch {
      } finally {
        B === R && (b && (b.disabled = !1), E && (E.hidden = !0));
      }
    };
    b == null || b.addEventListener("click", () => {
      U();
    }), C == null || C.addEventListener("click", () => {
      U();
    }), k == null || k.addEventListener("click", () => {
      A !== null && (J.value = A, J.dispatchEvent(new Event("input", { bubbles: !0 })), ot()), A = null, Ot = null, Or = null, k && (k.hidden = !0), C && (C.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = le.querySelector("#klavity-known"), b = t.onCheckKnown;
    let k = null, C = 0, E = "";
    const R = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, A = (_) => {
      var D;
      if (!g) return;
      const U = _.headline ? Le(_.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${G("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${U}</span> — status: <span class="kl-known-status">${Le(_.statusLabel)}</span>. We're already tracking "${Le(_.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (D = g.querySelector("#klavity-known-dismiss")) == null || D.addEventListener("click", () => {
        E = J.value.trim(), R();
      });
    }, O = async () => {
      const _ = J.value.trim();
      if (_.length < 12 || _ === E) {
        R();
        return;
      }
      const U = ++C;
      try {
        const D = await b(_);
        if (U !== C) return;
        if (J.value.trim() === E) {
          R();
          return;
        }
        D ? A(D) : R();
      } catch {
      }
    };
    J.addEventListener("input", () => {
      J.value.trim() !== E && (E = ""), k && clearTimeout(k), k = setTimeout(O, 500);
    });
  }
  if (n.reportClarity) {
    const g = le.querySelector("#klavity-clarity"), b = le.querySelector("#klavity-clarity-status"), k = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, C = le.querySelector("#klavity-clarity-tip"), E = le.querySelector("#klavity-clarity-tip-text"), R = le.querySelector("#klavity-nudge"), A = t.onClarityTip, O = /* @__PURE__ */ new Map();
    let _ = null, U = 0;
    const D = (X, Z, he) => {
      if (!X) return;
      X.classList.toggle("done", Z);
      const Ye = X.querySelector(".kl-clr-mark");
      Ye && (Ye.innerHTML = Z ? G("check", { size: 12 }) : "○"), X.setAttribute("aria-label", (Z ? "covered: " : "missing: ") + he);
    }, B = () => {
      C && (C.hidden = !0);
    }, Y = (X) => {
      !C || !E || _g(X) || (E.innerHTML = Le(X) + '<span class="kl-clr-aitag">AI</span>', C.hidden = !1);
    }, q = () => {
      const X = J.value, Z = xd(X);
      g && (g.hidden = X.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(Z.level === "great" ? "l3" : Z.level === "good" ? "l2" : "l1")), b && (b.textContent = Z.label), D(k.problem, Z.coverage.problem, "What's broken"), D(k.expected, Z.coverage.expected, "What you expected"), D(k.repro, Z.coverage.repro, "How to reproduce"), R && !R.hidden && (R.hidden = !0), Z.level === "great" && B();
    }, H = () => {
      !A || !C || (_ && clearTimeout(_), _ = setTimeout(async () => {
        const X = J.value.trim();
        if (!Ag(X)) {
          B();
          return;
        }
        if (O.has(X)) {
          Y(O.get(X));
          return;
        }
        const Z = ++U;
        try {
          const he = await A(X, { images: c.length });
          if (Z !== U || J.value.trim() !== X) return;
          he && he.tip && (O.set(X, he.tip), Y(he.tip));
        } catch {
        }
      }, 1e3));
    };
    J.addEventListener("input", () => {
      q(), H();
    }), q(), (Tl = le.querySelector("#klavity-nudge-add")) == null || Tl.addEventListener("click", () => {
      R && (R.hidden = !0);
      try {
        J.focus();
      } catch {
      }
    }), (Al = le.querySelector("#klavity-nudge-anyway")) == null || Al.addEventListener("click", () => {
      R && (R.hidden = !0), Br.click();
    });
  }
  zr.addEventListener("click", (g) => {
    g.target === zr && Cs();
  }), (Ll = le.querySelector("#klavity-x")) == null || Ll.addEventListener("click", () => Cs()), (_l = le.querySelector("#klavity-min")) == null || _l.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const vl = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Pt = !1;
  const ct = (g) => {
    Pt = g, vl().forEach((k) => {
      k.disabled = g;
    }), J.disabled = g;
    const b = le.querySelector("#klavity-voice");
    b && (b.disabled = g), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((k) => {
      k.disabled = g;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((k) => {
      k.disabled = g;
    }), g ? (Fr == null || Fr(), Br.disabled = !0) : (ot(), ui());
  }, er = (g) => {
    vl().forEach((b) => {
      b.classList.remove("kl-active"), b.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, cr = le.querySelector("#klavity-voice");
  if (cr) {
    const k = cr.querySelector(".kl-vring-prog");
    let C = 0, E = 0, R = !1, A, O = "";
    const _ = () => {
      E = Date.now();
      const ge = () => {
        const Fe = Date.now() - E, $e = Math.min(Fe / 18e4, 1);
        if (k == null || k.setAttribute("stroke-dashoffset", String($e * 81.68)), Fe >= 165e3 && cr.classList.add("kl-voice-warn"), Fe >= 18e4) {
          A.stop();
          return;
        }
        C = requestAnimationFrame(ge);
      };
      C = requestAnimationFrame(ge);
    }, U = () => {
      cancelAnimationFrame(C), k == null || k.setAttribute("stroke-dashoffset", String(81.68)), cr.classList.remove("kl-voice-warn");
    }, D = le.querySelector("#klavity-voice-status");
    let B = null;
    const Y = () => {
      B && (clearTimeout(B), B = null), D && (D.hidden = !0, D.textContent = "", D.classList.remove("kl-vs-info", "kl-vs-err"));
    }, q = (ge, Fe, $e) => {
      !D || !Fe || (B && (clearTimeout(B), B = null), D.classList.remove("kl-vs-info", "kl-vs-err"), D.classList.add(ge === "err" ? "kl-vs-err" : "kl-vs-info"), D.textContent = Fe, D.hidden = !1, $e && (B = setTimeout(Y, $e)));
    }, H = "Recording — tap to stop", X = () => {
      D && D.classList.contains("kl-vs-info") && Y();
    }, Z = (ge) => {
      cr.classList.toggle("kl-voice-rec", ge), cr.setAttribute("aria-pressed", ge ? "true" : "false"), cr.setAttribute("aria-label", ge ? "Stop recording" : "Voice dictation"), cr.title = ge ? H : "Voice dictation";
    }, he = (ge) => {
      let Fe = "";
      ge.onTranscript = ($e) => {
        Fe = "", O = Ei(O, $e), J.value = O;
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, ge.onInterim = ($e) => {
        Fe = $e || "";
        const ee = O.length > 0 && !/\s$/.test(O) ? " " : "";
        J.value = O + ($e ? ee + $e : "");
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, ge.onStatus = ($e, ee) => {
        $e === "idle" ? X() : q("info", ee);
      }, ge.onError = ($e, ee) => {
        ee && q("err", ee, 4e3);
      }, ge.onStop = () => {
        Fe && (O = Ei(O, Fe), Fe = ""), O && (O = nc(O), J.value = O);
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        R = !1, Z(!1), U(), X(), ot();
      };
    }, Ye = () => {
      const ge = new Gn();
      return he(ge), ge;
    }, tt = () => {
      if (!R) {
        Z(!1), U(), X();
        return;
      }
      Gn.isSupported() ? (O = J.value, A = Ye(), q("info", "Reconnecting dictation…"), A.start()) : (R = !1, Z(!1), U(), q("err", "Voice dictation is unavailable right now", 4e3));
    }, bt = () => {
      if (!(Ie === "server" && t.onDictate)) return null;
      const ge = new ji({ transcribe: (Fe) => t.onDictate(Fe) });
      return he(ge), ge.onUnavailable = tt, ge;
    }, kr = (ge) => {
      const Fe = () => O.length > 0 && !/\s$/.test(O) ? " " : "";
      let $e = "";
      ge.onTranscript = (ee) => {
        $e = "", O = Ei(O, ee), J.value = O;
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, ge.onInterim = (ee) => {
        $e = ee || "", J.value = O + Fe() + ee;
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, ge.onStatus = (ee, ue) => {
        ee === "idle" ? X() : q("info", ue);
      }, ge.onError = (ee, ue) => {
        ue && q("err", ue, 4e3);
      }, ge.onStop = () => {
        $e && (O = Ei(O, $e), $e = ""), O && (O = nc(O)), J.value = O;
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        R = !1, Z(!1), U(), X(), ot();
      }, ge.onUnavailable = () => {
        J.value = O;
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!R) {
          Z(!1), U(), X();
          return;
        }
        const ee = bt();
        if (ee) {
          A = ee, q("info", "Reconnecting dictation…"), A.start();
          return;
        }
        tt();
      };
    }, zt = () => {
      if (Ie === "server" && t.dictationStreamUrl && Hi.isSupported()) {
        const ge = new Hi({ url: t.dictationStreamUrl });
        return kr(ge), ge;
      }
      return bt() ?? Ye();
    };
    A = zt(), cr.addEventListener("click", () => {
      R ? A.stop() : (Y(), O = J.value, A = zt(), R = !0, Z(!0), A.start(), _());
    }), Fr = () => {
      R && A.stop();
    };
  }
  function wl() {
    var k;
    const g = (ke == null ? void 0 : ke.value.trim()) || "", b = g && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g)) ? g : void 0;
    return b && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b) && ((k = t.onRememberEmail) == null || k.call(t, b.toLowerCase())), { email: b, createContact: !!(b && qt && b.toLowerCase() === dn) };
  }
  Br.addEventListener("click", async () => {
    var Z;
    if (Pt || Br.disabled) return;
    const g = J.value.trim(), b = le.querySelector("#klavity-title"), k = b ? b.value.trim() : "", C = xe === "feature" ? "feature" : "bug";
    d && await Promise.race([d, Promise.resolve()]);
    const E = p.slice(), R = Ce(), A = W.slice(), O = P.slice(), _ = xe, { email: U, createContact: D } = wl();
    ct(!0), Br.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const Y = a.getElementById("klavity-progress"), q = a.getElementById("klavity-progress-fill");
    Y && q && (Y.classList.add("show"), q.style.transition = "none", q.style.width = "8%", q.offsetWidth, q.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      q.style.width = "90%";
    }));
    const H = () => {
      q && (q.style.transition = "width .25s ease", q.style.width = "100%");
    }, X = () => {
      Y && q && (Y.classList.remove("show"), q.style.transition = "none", q.style.width = "0");
    };
    try {
      const he = await Promise.all(E), Ye = {
        type: C,
        ...ie ? { kind: _ } : {},
        ...k ? { title: k } : {},
        description: g,
        screenshots: he,
        ...A.length ? { files: A } : {},
        ...O.length ? { recordings: O } : {},
        annotations: R,
        reporterEmail: U,
        createContact: D,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Ss } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...Ot ? { suggestedSeverity: Ot } : {},
        ...Or ? { suggestedPriority: Or } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((Z = a.getElementById("klavity-conlog-cb")) != null && Z.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(Ye), lr({ immediate: !0, reason: "submitted" });
        return;
      }
      const tt = await t.onSubmit(Ye);
      if (Oe) return;
      H(), t.success ? Th(tt.issueKey, tt.issueUrl, t.success) : Rh(tt.issueKey, tt.issueUrl);
    } catch (he) {
      X();
      const Ye = (he == null ? void 0 : he.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", he);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${Ye}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", Br.textContent = "Submit", ct(!1);
    }
  });
  function kh(g, b) {
    var A;
    const { dataUrl: k, quality: C, suggestSharp: E } = Ht(b);
    if (!k) return;
    const R = c.indexOf(g);
    if (!(R < 0)) {
      c[R] = k, p[R] = t.compressImage ? t.compressImage(k) : Promise.resolve(k), o[R] = C, h[R] = !!E && C !== "real-pixel", re[R] && delete re[R], delete Qe[R], delete Tt[R], Ne();
      try {
        (A = t.onShotReplaced) == null || A.call(t, R, k, C);
      } catch {
      }
    }
  }
  async function vh(g) {
    if (!t.onCaptureViewport) return !1;
    let b = null;
    const { restore: k, geo: C } = $r();
    try {
      const { dataUrl: R } = Ht(await t.onCaptureViewport());
      Dr(R, C, { kind: "viewport" }), R && (b = R, l = !1, Nt(R, "rendered", void 0, !0, !1), g && er(g));
    } catch {
    } finally {
      k == null || k();
    }
    const E = (async () => {
      const { restore: R, geo: A } = $r();
      try {
        const O = await t.onCaptureFull();
        if (Dr(Ht(O).dataUrl, A, { kind: "full" }), b) kh(b, O);
        else {
          l = !1;
          const { dataUrl: _, quality: U, suggestSharp: D } = Ht(O);
          _ && (Nt(_, U, void 0, !0, !!D), g && er(g));
        }
      } catch {
        l = !1, Ne();
      } finally {
        R == null || R(), d === E && (d = null);
      }
    })();
    return d = E, !0;
  }
  async function xl(g) {
    if (!t.onCaptureViewport) return !1;
    const { restore: b, geo: k } = $r();
    try {
      const { dataUrl: C, blank: E } = Ht(await t.onCaptureViewport());
      E || Dr(C, k, { kind: "viewport" }), E && c.length === 0 ? bs() : C ? (l = !1, Nt(C, "rendered", void 0, !0, !1)) : (l = !1, Ne());
    } catch {
      l = !1, Ne();
    } finally {
      b == null || b();
    }
    return !0;
  }
  const Wr = le.querySelector("#klavity-full");
  Wr.addEventListener("click", async () => {
    if (!Pt && !(t.onCaptureSharp && (await Ls()).ok)) {
      ct(!0), Wr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await vh(Wr);
          return;
        }
        const { restore: g, geo: b } = $r();
        try {
          const { dataUrl: k, quality: C, suggestSharp: E } = Ht(await t.onCaptureFull());
          Dr(k, b, { kind: "full" }), Nt(k, C, void 0, !0, !!E), er(Wr);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        Wr.classList.remove("kl-loading"), ct(!1);
      }
    }
  });
  async function Ls(g) {
    const b = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Pt || !b || !ze) return { ok: !1, declined: !1 };
    const k = ze.querySelector(".kl-sharp-label");
    ct(!0), ze.classList.add("kl-loading"), s.style.display = "none";
    const C = k ?? ze, E = C.textContent;
    C.textContent = "Capturing…";
    let R = !1, A = !1;
    try {
      const { restore: O, geo: _ } = $r();
      let U;
      try {
        U = await b();
      } finally {
        O == null || O();
      }
      if (U) {
        const { dataUrl: D, quality: B } = Ht(U);
        Dr(D, _, { kind: g != null && g.viewport ? "viewport" : "full" }), D && (Nt(D, B ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), er(ze), R = !0, M = !0);
      }
    } catch (O) {
      if (iy(O)) {
        if (A = !0, !(g != null && g.onOpen))
          try {
            Yp();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", O);
        } catch {
        }
    } finally {
      g != null && g.onOpen && A || (s.style.display = "", C.textContent = E, ze.classList.remove("kl-loading"), ct(!1));
    }
    return { ok: R, declined: A };
  }
  ze && t.onCaptureSharp && ze.addEventListener("click", () => {
    Ls();
  });
  const Sl = le.querySelector("#klavity-file"), El = le.querySelector("#klavity-upload");
  El.addEventListener("click", () => {
    if (!Pt) {
      if (!x && c.length >= v) {
        Bt(`You can attach up to ${v} images.`);
        return;
      }
      Sl.click();
    }
  }), Sl.addEventListener("change", async (g) => {
    const b = g.target, k = b.files ? Array.from(b.files) : [];
    if (b.value = "", !k.length) return;
    const C = c.length, E = W.length;
    x ? await eh(k) : await vs(k), (c.length > C || W.length > E) && er(El);
  });
  const qn = a.getElementById("klavity-record");
  qn && t.onRecord && qn.addEventListener("click", async () => {
    if (Pt) return;
    if (P.length >= Xe) {
      Bt(`You can attach up to ${Xe} recordings.`);
      return;
    }
    ct(!0), qn.classList.add("kl-loading");
    const g = (b) => {
      s.style.display = b === "recording" ? "none" : "";
    };
    try {
      const b = await t.onRecord(g);
      if (b) {
        const k = P.findIndex((C) => C.id && b.id && C.id === b.id || C.dataUrl && b.dataUrl && C.dataUrl === b.dataUrl);
        k >= 0 ? (P[k] = b, be = k) : (P.push(b), be = P.length - 1), oe = null, un(), er(qn);
      }
    } catch {
    } finally {
      s.style.display = "", qn.classList.remove("kl-loading"), ct(!1);
    }
  }), We && (Qt(), (Il = a.getElementById("klavity-multi-start")) == null || Il.addEventListener("click", () => {
    rh();
  }), t.initialMultiRecordingId && nh(t.initialMultiRecordingId));
  const _s = a.getElementById("klavity-region");
  _s && t.onRegionCapture && (_s.onclick = () => {
    Pt || (ct(!0), document.removeEventListener("keydown", Ur, { capture: !0 }), s.style.display = "none", hy(async (g) => {
      document.addEventListener("keydown", Ur, { capture: !0 });
      try {
        const { restore: b, geo: k } = $r();
        let C;
        try {
          C = await t.onRegionCapture(g);
        } finally {
          b == null || b();
        }
        if (C) {
          const { dataUrl: E, quality: R, suggestSharp: A } = Ht(C);
          Dr(E, k, { kind: "region", rect: g }), E && (Nt(E, R, void 0, !0, !!A, { kind: "region", rect: g }), er(_s));
        }
      } finally {
        s.style.display = "", ct(!1);
      }
    }, () => {
      document.addEventListener("keydown", Ur, { capture: !0 }), s.style.display = "", ct(!1);
    }));
  });
  const pn = a.getElementById("klavity-pick"), hn = a.getElementById("klavity-pickinfo"), Cl = () => {
    var k;
    if (pn && (pn.classList.toggle("kl-active", !!ye), ye ? pn.setAttribute("aria-pressed", "true") : pn.removeAttribute("aria-pressed")), !hn) return;
    if (!ye) {
      hn.hidden = !0, hn.innerHTML = "";
      return;
    }
    hn.hidden = !1;
    const { text: g } = ye, b = g ? `: <span class="kl-pick-txt">${Le(g)}</span>` : "";
    hn.innerHTML = `<span class="kl-pick-ic">${G("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${b}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (k = hn.querySelector("#klavity-pick-clear")) == null || k.addEventListener("click", () => {
      ye = null, Cl();
    });
  };
  pn && t.onPickElement && (pn.onclick = async () => {
    if (!Pt) {
      ct(!0), document.removeEventListener("keydown", Ur, { capture: !0 }), s.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (ye = g, Cl(), g.shot && Nt(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Ur, { capture: !0 }), s.style.display = "", ct(!1);
      }
    }
  });
  function Wt(g, b = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function wh(g) {
    const b = (R, A, O, _) => `<button type="button" class="kl-htool" data-tool="${R}" title="${A} (${_.toUpperCase()})" aria-label="${A}">${O}<span class="kl-hk">${_.toUpperCase()}</span></button>`, k = (R) => {
      const A = R.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(A)) return !1;
      const O = parseInt(A.slice(0, 2), 16), _ = parseInt(A.slice(2, 4), 16), U = parseInt(A.slice(4, 6), 16);
      return (0.2126 * O + 0.7152 * _ + 0.0722 * U) / 255 > 0.7;
    }, C = (R) => `<button type="button" class="kl-hcolor${k(R) ? " kl-hcolor-light" : ""}" data-color="${R}" style="background:${R}" title="${R}" aria-label="Colour ${R}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + b("pen", "Pen", G("pencil", { size: 15 }), "p") + b("line", "Line", Wt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + b("rect", "Rectangle", G("square", { size: 15 }), "r") + b("circle", "Circle", Wt('<circle cx="12" cy="12" r="9"/>'), "o") + b("arrow", "Arrow", Wt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + b("text", "Text", Wt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + b("count", "Numbers", Wt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Black out numbers in your screenshots"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${G("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + b("pixelate", "Redact (pixelate)", Wt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + b("crop", "Crop", Wt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + C("#ef4444") + C("#f97316") + C("#16a34a") + C("#3b82f6") + C("#ffffff") + C("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Wt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Wt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${G("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function Wn() {
    Ir && (document.removeEventListener("keydown", Ir, { capture: !0 }), Ir = null);
  }
  function Is() {
    const g = a.getElementById("klavity-hero-stage"), b = a.getElementById("klavity-hero-tools");
    b && (b.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${G("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Le(Gp())}</span></div>`), Wn();
  }
  function Ml() {
    if (oe != null && !(W[oe] && yn(W[oe]) === "video") && (oe = null), be != null && !P[be] && (be = null), be != null) {
      Rl(P[be].dataUrl);
      return;
    }
    if (oe != null) {
      Rl(W[oe] ? Ze(W[oe]) : void 0);
      return;
    }
    if (c.length === 0) {
      de = 0, Is();
      return;
    }
    de >= c.length && (de = c.length - 1), de < 0 && (de = 0), Ch(de);
  }
  let br = null;
  function Rl(g) {
    const b = a.getElementById("klavity-hero-stage"), k = a.getElementById("klavity-hero-tools");
    if (!b || !g) {
      Is();
      return;
    }
    if (Wn(), k && (k.innerHTML = ""), b.innerHTML = "", br) {
      try {
        URL.revokeObjectURL(br);
      } catch {
      }
      br = null;
    }
    let C = g;
    const E = be != null && P[be] ? P[be] : null;
    if (E && E.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        C = URL.createObjectURL(E.blob), br = C;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const U = g.split(",");
        if (U.length >= 2) {
          const D = U[0].match(/:(.*?);/), B = (D ? D[1] : "video/webm").split(";")[0], Y = atob(U[1]);
          let q = Y.length;
          const H = new Uint8Array(q);
          for (; q--; )
            H[q] = Y.charCodeAt(q);
          const X = new Blob([H], { type: B });
          C = URL.createObjectURL(X), br = C;
        }
      } catch {
      }
    const R = document.createElement("div");
    R.className = "kl-hero-vwrap", R.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const A = document.createElement("video");
    A.src = C, A.controls = !0, A.setAttribute("playsinline", ""), A.preload = "metadata", A.className = "kl-hero-video", A.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const O = document.createElement("div");
    O.className = "kl-hero-verror", O.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const _ = document.createElement("a");
    _.href = C || g, _.setAttribute("download", "recording.webm"), _.setAttribute("target", "_blank"), _.setAttribute("rel", "noopener"), _.textContent = "Download recording", _.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", O.innerHTML = "<span>This recording couldn’t play here.</span>", O.appendChild(_), R.appendChild(A), R.appendChild(O), b.appendChild(R), xh(A, O);
  }
  function xh(g, b) {
    let k = !1, C = null;
    g.addEventListener("loadedmetadata", () => {
      if (!isFinite(g.duration) || isNaN(g.duration) || g.duration <= 0) {
        k = !0;
        try {
          g.currentTime = 1e101;
        } catch {
        }
        C = setTimeout(() => {
          if (k) {
            k = !1;
            try {
              g.currentTime = 0;
            } catch {
            }
          }
        }, 400);
      }
    }), g.addEventListener("durationchange", () => {
      if (k && isFinite(g.duration) && g.duration > 0) {
        k = !1, C && clearTimeout(C);
        try {
          g.currentTime = 0;
        } catch {
        }
      }
    }), g.addEventListener("error", () => {
      if (k) {
        k = !1, C && clearTimeout(C);
        try {
          g.currentTime = 0, g.style.display = "block", b && (b.style.display = "none");
          return;
        } catch {
        }
      }
      try {
        g.style.display = "none";
      } catch {
      }
      b && (b.style.display = "flex");
    });
  }
  function Sh(g, b, k, C, E) {
    const R = c[g];
    if (!R) return;
    const A = new Image();
    A.onload = () => {
      var q, H;
      if (c[g] !== R) return;
      const O = document.createElement("canvas");
      O.width = Math.max(1, Math.round(C)), O.height = Math.max(1, Math.round(E));
      const _ = O.getContext("2d");
      if (!_) return;
      _.drawImage(A, b, k, C, E, 0, 0, O.width, O.height);
      let U;
      try {
        U = O.toDataURL("image/png");
      } catch {
        return;
      }
      const D = ((q = Qe[g]) == null ? void 0 : q.length) ?? 0, B = Ga(g);
      c[g] = U, p[g] = t.compressImage ? t.compressImage(U) : Promise.resolve(U);
      const Y = (H = re[g]) == null ? void 0 : H.shapes;
      Array.isArray(Y) && Y.length ? re[g] = { w: O.width, h: O.height, shapes: Gg(Y, -b, -k) } : delete re[g], (Qe[g] ?? (Qe[g] = [])).push(B), (Tt[g] ?? (Tt[g] = [])).push({ snap: B, mark: D }), an(g), Ne(), Eh(R, U, A.naturalWidth, A.naturalHeight, b, k, O.width, O.height);
    }, A.src = R;
  }
  function Eh(g, b, k, C, E, R, A, O) {
    const U = ((Y) => (Y || []).map((q) => ({ x: Math.max(0, q.x - E), y: Math.max(0, q.y - R), w: Math.min(A, q.x - E + q.w) - Math.max(0, q.x - E), h: Math.min(O, q.y - R + q.h) - Math.max(0, q.y - R) })).filter((q) => q.w > 0 && q.h > 0))(rl(g, k, C));
    U.length && Re.set(b, U);
    const D = He.get(g);
    if (!D) return;
    const B = new Image();
    B.onload = () => {
      const Y = document.createElement("canvas");
      Y.width = A, Y.height = O;
      const q = Y.getContext("2d");
      if (!q) return;
      q.drawImage(B, E, R, A, O, 0, 0, A, O);
      let H;
      try {
        H = Y.toDataURL("image/png");
      } catch {
        return;
      }
      He.set(b, H), gt.set(H, b), U.length && Re.set(H, U);
    }, B.src = D;
  }
  function Ch(g) {
    var _, U, D, B, Y, q, H;
    const b = a.getElementById("klavity-hero-stage"), k = a.getElementById("klavity-hero-tools");
    if (!b || !k) return;
    const C = c[g];
    if (!C) {
      Is();
      return;
    }
    Wn(), b.innerHTML = "";
    const E = document.createElement("canvas");
    E.width = 1, E.height = 1, E.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const R = new ia(E, C), A = (_ = re[g]) == null ? void 0 : _.shapes;
    Array.isArray(A) && A.forEach((X) => R.shapes.push({ ...X })), b.appendChild(E);
    const O = new Image();
    O.onload = () => {
      !document.body.contains(s) || de !== g || c[g] !== C || (E.width = O.naturalWidth || 1, E.height = O.naturalHeight || 1, R.redraw());
    }, O.src = C, R.redraw();
    {
      k.innerHTML = wh((((U = Tt[g]) == null ? void 0 : U.length) ?? 0) > 0);
      const X = k.querySelector("#kl-hero-logo");
      X && (X.href = Yg(n.projectId));
      let Z = "pen", he = "#ef4444", Ye = 26, tt = "black", bt = null;
      const kr = k.querySelector("#kl-hero-textopts"), zt = () => {
        R.shapes.length ? re[g] = { w: E.width, h: E.height, shapes: R.shapes.map(($) => ({ ...$ })) } : delete re[g], an(g);
      }, ge = ($) => {
        Z = $, k.querySelectorAll("[data-tool]").forEach((j) => j.classList.toggle("kl-on", j.dataset.tool === $)), kr && (kr.hidden = $ !== "text");
      }, Fe = k.querySelector(".kl-hcolor-custom"), $e = k.querySelector(".kl-hcolor-input"), ee = ($, j) => {
        he = $, k.querySelectorAll("[data-color]").forEach((ne) => ne.classList.toggle("kl-on", ne === j)), Fe && Fe.classList.toggle("kl-on", Fe === j);
      };
      if (k.querySelectorAll("[data-tool]").forEach(($) => $.addEventListener("click", () => ge($.dataset.tool))), k.querySelectorAll("[data-color]").forEach(($) => $.addEventListener("click", () => ee($.dataset.color, $))), Fe && $e) {
        Fe.addEventListener("click", () => $e.click());
        const $ = () => {
          Fe.style.background = $e.value, ee($e.value, Fe);
        };
        $e.addEventListener("input", $), $e.addEventListener("change", $);
      }
      const ue = k.querySelector(".kl-hmask-cb");
      ue && ue.addEventListener("change", () => {
        i = ue.checked, Xp();
      }), k.querySelectorAll("[data-outline]").forEach(($) => $.addEventListener("click", () => {
        tt = $.dataset.outline, k.querySelectorAll("[data-outline]").forEach((j) => j.classList.toggle("kl-on", j === $));
      })), k.querySelectorAll("[data-size]").forEach(($) => $.addEventListener("click", () => {
        Ye = Number($.dataset.size), k.querySelectorAll("[data-size]").forEach((j) => j.classList.toggle("kl-on", j === $));
      })), k.querySelectorAll("[data-stroke]").forEach(($) => $.addEventListener("click", () => {
        R.strokeScale = Number($.dataset.stroke) || 1, k.querySelectorAll("[data-stroke]").forEach((j) => j.classList.toggle("kl-on", j === $)), R.redraw();
      })), (D = k.querySelector("#kl-hero-undo")) == null || D.addEventListener("click", () => {
        Ka(g);
      }), (B = k.querySelector("#kl-hero-revert")) == null || B.addEventListener("click", () => {
        Hp(g);
      }), (Y = k.querySelector("#kl-hero-clear")) == null || Y.addEventListener("click", () => {
        ln(g), R.clearAll(), zt();
      }), ge(Z), ee(he, k.querySelector("[data-color]"));
      const qe = ($) => {
        const j = E.getBoundingClientRect(), ne = Math.min(j.width / E.width, j.height / E.height) || 1, te = E.width * ne, ae = E.height * ne, Ke = (j.width - te) / 2, kt = (j.height - ae) / 2;
        return { x: ($.clientX - j.left - Ke) / ne, y: ($.clientY - j.top - kt) / ne };
      }, fi = () => {
        const $ = E.getBoundingClientRect();
        return Math.min($.width / E.width, $.height / E.height) || 1;
      }, Ah = ($, j, ne, te, ae, Ke) => $ === "line" ? { type: "line", color: Ke, x1: j, y1: ne, x2: te, y2: ae } : $ === "arrow" ? { type: "arrow", color: Ke, x1: j, y1: ne, x2: te, y2: ae } : $ === "rect" ? { type: "rect", color: Ke, x: Math.min(j, te), y: Math.min(ne, ae), w: Math.abs(te - j), h: Math.abs(ae - ne) } : $ === "circle" ? { type: "circle", color: Ke, x: (j + te) / 2, y: (ne + ae) / 2, rx: Math.abs(te - j) / 2, ry: Math.abs(ae - ne) / 2 } : $ === "pixelate" ? { type: "pixelate", x: Math.min(j, te), y: Math.min(ne, ae), w: Math.abs(te - j), h: Math.abs(ae - ne) } : null;
      let dt = 1, vr = 0, wr = 0, mi = null;
      const Lh = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), gi = Bg(Lh), Os = () => {
        if (mi) return mi;
        const $ = E.style.transform;
        return E.style.transform = "", mi = E.getBoundingClientRect(), E.style.transform = $, mi;
      }, at = document.createElement("div");
      at.className = "kl-minimap", at.hidden = !0, at.setAttribute("role", "navigation"), at.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const jn = document.createElement("img");
      jn.className = "kl-minimap-img", jn.alt = "", jn.draggable = !1, jn.src = C;
      const fn = document.createElement("div");
      fn.className = "kl-minimap-vp", at.append(jn, fn), b.appendChild(at);
      const Ol = () => {
        const $ = E.width, j = E.height;
        if (dt <= 1 || $ < 2 || j < 2) {
          at.hidden = !0;
          return;
        }
        const ne = Os();
        if (!ne) {
          at.hidden = !0;
          return;
        }
        const te = 148, ae = Math.min(te / $, te / j), Ke = Math.max(1, Math.round($ * ae)), kt = Math.max(1, Math.round(j * ae));
        at.style.width = Ke + "px", at.style.height = kt + "px";
        const jt = b.getBoundingClientRect(), gn = Wg(
          { left: jt.left, top: jt.top, right: jt.right, bottom: jt.bottom },
          { left: ne.left, top: ne.top, width: ne.width, height: ne.height },
          { panX: vr, panY: wr },
          dt,
          $,
          j
        );
        fn.style.left = gn.x * ae + "px", fn.style.top = gn.y * ae + "px", fn.style.width = Math.max(3, gn.w * ae) + "px", fn.style.height = Math.max(3, gn.h * ae) + "px", at.hidden = !1;
      }, Hn = () => {
        if (dt === 1) {
          vr = 0, wr = 0, E.style.transform = "", E.style.cursor = "crosshair", Ol();
          return;
        }
        E.style.transformOrigin = "0 0", E.style.transform = `translate(${vr}px,${wr}px) scale(${dt})`, E.style.cursor = "grab", Ol();
      }, yi = ($, j, ne) => {
        const te = Os();
        if (!te) return;
        const ae = dt;
        if (dt = Fg(dt * ne), dt === ae) return;
        const Ke = qg($, j, { left: te.left, top: te.top, width: te.width, height: te.height }, ae, dt, { panX: vr, panY: wr });
        vr = Ke.panX, wr = Ke.panY, E.style.transition = gi, Hn();
      }, Ns = () => {
        const $ = b.getBoundingClientRect();
        return { cx: $.left + $.width / 2, cy: $.top + $.height / 2 };
      }, _h = () => {
        dt = 1, E.style.transition = gi, Hn();
      };
      (q = k.querySelector("#kl-hero-zoomin")) == null || q.addEventListener("click", () => {
        const { cx: $, cy: j } = Ns();
        yi($, j, 1.25);
      }), (H = k.querySelector("#kl-hero-zoomout")) == null || H.addEventListener("click", () => {
        const { cx: $, cy: j } = Ns();
        yi($, j, 0.8);
      });
      const Ih = ($, j) => {
        const ne = Os();
        if (!ne) return;
        const te = b.getBoundingClientRect(), ae = Hg($, j, { left: te.left, top: te.top, right: te.right, bottom: te.bottom }, { left: ne.left, top: ne.top, width: ne.width, height: ne.height }, dt, E.width);
        vr = ae.panX, wr = ae.panY, E.style.transition = gi, Hn();
      };
      let bi = !1;
      const Nl = ($, j) => {
        const ne = at.getBoundingClientRect(), { ix: te, iy: ae } = jg($ - ne.left, j - ne.top, ne.width, ne.height, E.width, E.height);
        Ih(te, ae);
      };
      at.addEventListener("pointerdown", ($) => {
        bi = !0;
        try {
          at.setPointerCapture($.pointerId);
        } catch {
        }
        Nl($.clientX, $.clientY), $.preventDefault(), $.stopPropagation();
      }), at.addEventListener("pointermove", ($) => {
        bi && (Nl($.clientX, $.clientY), $.preventDefault());
      });
      const Pl = ($) => {
        if (bi) {
          bi = !1;
          try {
            at.releasePointerCapture($.pointerId);
          } catch {
          }
        }
      };
      at.addEventListener("pointerup", Pl), at.addEventListener("pointercancel", Pl), b.addEventListener("wheel", ($) => {
        Z !== "crop" && ($.preventDefault(), yi($.clientX, $.clientY, Ug($.deltaY)));
      }, { passive: !1 }), b.addEventListener("dblclick", () => {
        dt = 1, E.style.transition = gi, Hn();
      });
      let Oh = R.shapes.reduce(($, j) => j.type === "count" ? Math.max($, j.n) : $, 0), xr = !1, Et = 0, Ct = 0, jr = [], mn = !1, zl = 0, $l = 0, Dl = 0, Fl = 0, Mt = null, Yn = { x: 0, y: 0 }, pt = null;
      const Nh = () => Math.max(14, R.computeFontSize() * 0.6), Ul = ($, j) => {
        for (let ne = R.shapes.length - 1; ne >= 0; ne--) {
          const te = R.shapes[ne];
          if (te.type !== "text") continue;
          const ae = R.textBounds(te);
          if (!ae) continue;
          const Ke = Nh();
          if ($ >= ae.x + ae.w - Ke && $ <= ae.x + ae.w + Ke && j >= ae.y + ae.h - Ke && j <= ae.y + ae.h + Ke)
            return { shape: te, mode: "resize" };
          const kt = 6;
          if ($ >= ae.x - kt && $ <= ae.x + ae.w + kt && j >= ae.y - kt && j <= ae.y + ae.h + kt)
            return { shape: te, mode: "move" };
        }
        return null;
      };
      E.addEventListener("pointerdown", ($) => {
        if ($.shiftKey && dt > 1) {
          mn = !0, zl = $.clientX, $l = $.clientY, Dl = vr, Fl = wr, E.style.transition = "none", E.style.cursor = "grabbing";
          try {
            E.setPointerCapture($.pointerId);
          } catch {
          }
          $.preventDefault();
          return;
        }
        const j = qe($);
        if (Et = j.x, Ct = j.y, Z === "crop") {
          xr = !0;
          try {
            E.setPointerCapture($.pointerId);
          } catch {
          }
          Yn = { x: $.clientX, y: $.clientY }, Mt = document.createElement("div"), Mt.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", b.appendChild(Mt);
          return;
        }
        if (Z === "text") {
          const ne = Ul(j.x, j.y);
          if (ne) {
            ln(g), pt = { shape: ne.shape, mode: ne.mode, grabX: j.x, grabY: j.y, origX: ne.shape.x, origY: ne.shape.y, origSize: ne.shape.size ?? R.computeFontSize() };
            try {
              E.setPointerCapture($.pointerId);
            } catch {
            }
            E.style.cursor = ne.mode === "resize" ? "nwse-resize" : "move", $.preventDefault();
            return;
          }
          const te = document.createElement("input"), ae = tt === "none" ? "none" : `0 0 2px ${tt}, 0 0 2px ${tt}`, Ke = fi(), kt = Math.max(6, Ye * Ke), jt = Ye, gn = tt;
          te.style.cssText = `position:fixed;left:${$.clientX}px;top:${$.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${he};font-size:${kt}px;font-family:sans-serif;font-weight:700;text-shadow:${ae};outline:1px dashed ${he};z-index:2147483647;min-width:80px;`, document.body.appendChild(te), bt = te, requestAnimationFrame(() => {
            document.body.contains(te) && te.focus();
          }), te.addEventListener("blur", () => {
            bt = null, te.value.trim() && (ln(g), R.addShape({ type: "text", color: he, x: Et, y: Ct, text: te.value.trim(), size: jt, outline: gn }), zt()), Je(te);
          }, { once: !0 }), te.addEventListener("keydown", (Ps) => {
            Ps.key === "Enter" && te.blur(), Ps.key === "Escape" && (te.value = "", te.blur()), Ps.stopPropagation();
          });
          return;
        }
        if (Z === "count") {
          ln(g), R.addShape({ type: "count", color: he, x: j.x, y: j.y, n: ++Oh }), zt();
          return;
        }
        xr = !0;
        try {
          E.setPointerCapture($.pointerId);
        } catch {
        }
        Z === "pen" && (jr = [j]);
      }), E.addEventListener("pointermove", ($) => {
        if (mn) {
          E.style.transition = "none", vr = Dl + ($.clientX - zl), wr = Fl + ($.clientY - $l), Hn(), E.style.cursor = "grabbing";
          return;
        }
        if (pt) {
          const te = qe($);
          pt.mode === "move" ? (pt.shape.x = pt.origX + (te.x - pt.grabX), pt.shape.y = pt.origY + (te.y - pt.grabY)) : pt.shape.size = Math.max(10, Math.min(240, pt.origSize + (te.y - pt.grabY))), R.redraw();
          return;
        }
        if (Z === "text" && !xr) {
          const te = qe($), ae = Ul(te.x, te.y);
          E.style.cursor = ae ? ae.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!xr) return;
        if (Z === "pen") {
          jr.push(qe($)), jr.length > 1 && R.drawPreview({ type: "pen", color: he, points: jr });
          return;
        }
        if (Z === "crop" && Mt) {
          const te = b.getBoundingClientRect(), ae = Math.min(Yn.x, $.clientX), Ke = Math.min(Yn.y, $.clientY), kt = Math.max(Yn.x, $.clientX), jt = Math.max(Yn.y, $.clientY);
          Mt.style.left = ae - te.left + "px", Mt.style.top = Ke - te.top + "px", Mt.style.width = kt - ae + "px", Mt.style.height = jt - Ke + "px";
          return;
        }
        const j = qe($), ne = Ah(Z, Et, Ct, j.x, j.y, he);
        ne && R.drawPreview(ne);
      }), E.addEventListener("pointerup", ($) => {
        if (mn) {
          mn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair";
          try {
            E.releasePointerCapture($.pointerId);
          } catch {
          }
          return;
        }
        if (pt) {
          pt = null;
          try {
            E.releasePointerCapture($.pointerId);
          } catch {
          }
          E.style.cursor = "crosshair", R.redraw(), zt();
          return;
        }
        if (!xr) return;
        xr = !1;
        try {
          E.releasePointerCapture($.pointerId);
        } catch {
        }
        const j = qe($);
        if (Z === "crop") {
          Mt && (Je(Mt), Mt = null);
          const ae = Math.max(0, Math.min(Et, j.x)), Ke = Math.max(0, Math.min(Ct, j.y)), kt = Math.abs(j.x - Et), jt = Math.abs(j.y - Ct);
          kt > 4 && jt > 4 && Sh(g, ae, Ke, kt, jt);
          return;
        }
        const ne = Z === "pixelate" && Math.abs(j.x - Et) > 4 && Math.abs(j.y - Ct) > 4;
        (Z === "pen" && jr.length > 1 || Z === "line" || Z === "rect" || Z === "circle" || Z === "arrow" || ne) && ln(g), Z === "pen" && jr.length > 1 ? R.addShape({ type: "pen", color: he, points: jr }) : Z === "line" ? R.addShape({ type: "line", color: he, x1: Et, y1: Ct, x2: j.x, y2: j.y }) : Z === "rect" ? R.addShape({ type: "rect", color: he, x: Math.min(Et, j.x), y: Math.min(Ct, j.y), w: Math.abs(j.x - Et), h: Math.abs(j.y - Ct) }) : Z === "circle" ? R.addShape({ type: "circle", color: he, x: (Et + j.x) / 2, y: (Ct + j.y) / 2, rx: Math.abs(j.x - Et) / 2, ry: Math.abs(j.y - Ct) / 2 }) : Z === "arrow" ? R.addShape({ type: "arrow", color: he, x1: Et, y1: Ct, x2: j.x, y2: j.y }) : ne && R.addShape({ type: "pixelate", x: Math.min(Et, j.x), y: Math.min(Ct, j.y), w: Math.abs(j.x - Et), h: Math.abs(j.y - Ct) }), zt();
      }), E.addEventListener("pointercancel", ($) => {
        try {
          E.releasePointerCapture($.pointerId);
        } catch {
        }
        Mt && (Je(Mt), Mt = null), mn && (mn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair"), pt && (pt = null, E.style.cursor = "crosshair", R.redraw(), zt()), xr && (xr = !1, R.redraw());
      });
      const Bl = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      Ir = ($) => {
        if (!document.body.contains(s)) {
          Wn();
          return;
        }
        if (bt && document.body.contains(bt)) return;
        const j = typeof $.composedPath == "function" && $.composedPath()[0] || $.target;
        if (j && (j.tagName === "INPUT" || j.tagName === "TEXTAREA" || j.tagName === "SELECT" || j.isContentEditable)) return;
        if (($.metaKey || $.ctrlKey) && $.key.toLowerCase() === "z") {
          $.preventDefault(), Ka(g);
          return;
        }
        if ($.metaKey || $.ctrlKey || $.altKey) return;
        const ne = $.key.toLowerCase();
        if (ne === "z") {
          if ($.preventDefault(), dt > 1) _h();
          else {
            const { cx: te, cy: ae } = Ns();
            yi(te, ae, 2);
          }
          return;
        }
        Bl[ne] && ($.preventDefault(), ge(Bl[ne]));
      }, document.addEventListener("keydown", Ir, { capture: !0 });
    }
  }
  function Mh(g) {
    const b = c[g], k = new Image();
    k.onload = () => {
      const C = document.createElement("canvas");
      C.width = k.naturalWidth, C.height = k.naturalHeight;
      const E = new ia(C, b);
      E.redraw();
      const R = document.createElement("div");
      R.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const A = document.createElement("div");
      A.className = "kl-edtb", A.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", A.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${G("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("x", { size: 14 })}</button>
      `, C.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const O = document.createElement("div");
      O.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", O.appendChild(C);
      const _ = document.createElement("style");
      _.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", R.append(_, A, O), a.appendChild(R), Wn();
      let U = 1;
      const D = (ee) => Math.max(0.05, Math.min(5, ee || 1));
      function B(ee) {
        U = D(ee), C.style.width = Math.round(C.width * U) + "px", C.style.height = Math.round(C.height * U) + "px";
        const ue = A.querySelector("#klavity-zoom-pct");
        ue && (ue.textContent = Math.round(U * 100) + "%");
      }
      const Y = () => Math.max(1, O.clientWidth - 24) / C.width, q = () => Math.min(Math.max(1, O.clientWidth - 24) / C.width, Math.max(1, O.clientHeight - 24) / C.height), H = C.height / C.width > Math.max(1, O.clientHeight) / Math.max(1, O.clientWidth);
      B(H ? Y() : q()), A.querySelector("#klavity-zoom-in").addEventListener("click", () => B(U * 1.25)), A.querySelector("#klavity-zoom-out").addEventListener("click", () => B(U / 1.25)), A.querySelector("#klavity-fit-width").addEventListener("click", () => B(Y())), A.querySelector("#klavity-fit-page").addEventListener("click", () => B(q()));
      let X = "rect", Z = "#ef4444", he = !1, Ye = [], tt = 0, bt = 0;
      function kr(ee) {
        X = ee, A.querySelectorAll("[data-tool]").forEach((ue) => {
          const qe = ue.dataset.tool === ee;
          ue.style.background = qe ? "#585b70" : "#313244", ue.style.outline = qe ? "2px solid #89b4fa" : "none";
        });
      }
      A.querySelectorAll("[data-tool]").forEach((ee) => ee.addEventListener("click", () => kr(ee.dataset.tool))), A.querySelectorAll("[data-color]").forEach((ee) => ee.addEventListener("click", () => {
        Z = ee.dataset.color;
      }));
      {
        const ee = A.querySelector("#klavity-color-custom"), ue = A.querySelector("#klavity-color-input");
        if (ee && ue) {
          ee.addEventListener("click", () => ue.click());
          const qe = () => {
            ee.style.background = ue.value, Z = ue.value;
          };
          ue.addEventListener("input", qe), ue.addEventListener("change", qe);
        }
      }
      A.querySelector("#klavity-undo").addEventListener("click", () => E.undo()), A.querySelector("#klavity-clear-ann").addEventListener("click", () => E.clearAll());
      const zt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function ge(ee) {
        const ue = ee.target;
        if (ue && (ue.tagName === "INPUT" || ue.tagName === "TEXTAREA" || ue.isContentEditable)) return;
        if (ee.key === "Escape") {
          ee.stopPropagation(), Fe();
          return;
        }
        if ((ee.metaKey || ee.ctrlKey) && ee.key.toLowerCase() === "z") {
          ee.preventDefault(), E.undo();
          return;
        }
        if (ee.metaKey || ee.ctrlKey || ee.altKey) return;
        const qe = ee.key.toLowerCase();
        zt[qe] ? (ee.preventDefault(), kr(zt[qe])) : qe === "u" && (ee.preventDefault(), E.undo());
      }
      function Fe() {
        document.removeEventListener("keydown", ge, { capture: !0 }), Je(R), Ml();
      }
      document.addEventListener("keydown", ge, { capture: !0 }), kr(X), A.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        ln(g), E.shapes.length ? re[g] = { w: C.width, h: C.height, shapes: E.shapes.map((ee) => ({ ...ee })) } : delete re[g], an(g), Fe(), Ne();
      }), A.querySelector("#klavity-cancel-ann").addEventListener("click", () => Fe());
      function $e(ee) {
        const ue = C.getBoundingClientRect();
        return { x: (ee.clientX - ue.left) / ue.width * C.width, y: (ee.clientY - ue.top) / ue.height * C.height };
      }
      C.addEventListener("pointerdown", (ee) => {
        he = !0;
        const ue = $e(ee);
        if ({ x: tt, y: bt } = ue, X === "pen" && (Ye = [ue]), X === "text") {
          he = !1;
          const qe = document.createElement("input");
          qe.style.cssText = `position:fixed;left:${ee.clientX}px;top:${ee.clientY}px;background:transparent;border:1px dashed ${Z};color:${Z};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(qe), requestAnimationFrame(() => {
            document.body.contains(qe) && qe.focus();
          }), qe.addEventListener("blur", () => {
            qe.value.trim() && E.addShape({ type: "text", color: Z, x: tt, y: bt, text: qe.value.trim() }), Je(qe);
          }, { once: !0 }), qe.addEventListener("keydown", (fi) => {
            fi.key === "Enter" && qe.blur(), fi.stopPropagation();
          });
        }
      }), C.addEventListener("pointermove", (ee) => {
        he && X === "pen" && Ye.push($e(ee));
      }), C.addEventListener("pointerup", (ee) => {
        if (!he) return;
        he = !1;
        const ue = $e(ee);
        X === "pen" && Ye.length > 1 ? E.addShape({ type: "pen", color: Z, points: Ye }) : X === "rect" ? E.addShape({ type: "rect", color: Z, x: Math.min(tt, ue.x), y: Math.min(bt, ue.y), w: Math.abs(ue.x - tt), h: Math.abs(ue.y - bt) }) : X === "circle" ? E.addShape({ type: "circle", color: Z, x: (tt + ue.x) / 2, y: (bt + ue.y) / 2, rx: Math.abs(ue.x - tt) / 2, ry: Math.abs(ue.y - bt) / 2 }) : X === "arrow" && E.addShape({ type: "arrow", color: Z, x1: tt, y1: bt, x2: ue.x, y2: ue.y });
      });
    }, k.src = b;
  }
  function Rh(g, b) {
    const k = document.createElement("div");
    k.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const C = document.createElement("div");
    C.className = "klavity-sent";
    const E = document.createElement("div");
    E.className = "kl-sent-check", E.innerHTML = G("check", { label: "Sent", size: 22 }), C.appendChild(E);
    const R = document.createElement("h2");
    R.textContent = "Report sent", C.appendChild(R);
    const A = document.createElement("p");
    if (A.textContent = n.thankYou || "We filed it and emailed you a copy.", C.appendChild(A), g) {
      const O = document.createElement("div");
      O.className = "klavity-ref";
      const _ = document.createElement("span");
      _.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = js(g, b), O.append(_, U);
      const D = Hs(b);
      if (D) {
        const B = document.createElement("a");
        B.href = D, B.target = "_blank", B.rel = "noopener", B.textContent = "Open in Klavity", O.appendChild(B);
      }
      C.appendChild(O);
    }
    k.appendChild(C), Je(zr), a.appendChild(k), ul(C, zn);
  }
  function Th(g, b, k) {
    const { copy: C, onLead: E } = k;
    le.innerHTML = "";
    const R = document.createElement("div");
    R.className = "klavity-success";
    const A = document.createElement("h2");
    if (A.innerHTML = C.headline, R.appendChild(A), C.body) {
      const _ = document.createElement("p");
      _.textContent = C.body, R.appendChild(_);
    }
    if (g) {
      const _ = document.createElement("div");
      _.className = "klavity-ref";
      const U = document.createElement("span");
      U.textContent = "Filed as";
      const D = document.createElement("code");
      D.textContent = js(g, b), _.append(U, D);
      const B = Hs(b);
      if (B) {
        const Y = document.createElement("a");
        Y.href = B, Y.target = "_blank", Y.rel = "noopener", Y.textContent = "Open in Klavity", _.appendChild(Y);
      }
      R.appendChild(_);
    }
    const O = () => ul(le, $n);
    if (C.showEmail) {
      const _ = document.createElement("div");
      _.className = "klavity-lead";
      const U = document.createElement("input");
      U.type = "email", U.placeholder = "you@company.com";
      const D = document.createElement("button"), B = C.emailLabel;
      D.textContent = B;
      const Y = document.createElement("div");
      Y.className = "klavity-lead-err", Y.setAttribute("role", "alert"), Y.style.display = "none";
      const q = async () => {
        const H = U.value.trim();
        if (!H || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(H)) {
          Y.textContent = "Please enter a valid email so we can reach you.", Y.style.display = "block", U.focus();
          return;
        }
        D.disabled = !0, D.textContent = "Saving…", Y.style.display = "none";
        try {
          E && await E(g, H);
        } catch (Z) {
          try {
            console.warn("[Klavity] lead capture failed:", (Z == null ? void 0 : Z.message) || Z);
          } catch {
          }
          Y.textContent = "Couldn't save your email — please try again.", Y.style.display = "block", D.disabled = !1, D.textContent = "Retry", U.focus();
          return;
        }
        const X = document.createElement("div");
        X.className = "klavity-thanks", X.textContent = "Thanks — we'll be in touch.", Je(Y), _.replaceWith(X), C.showCta || O();
      };
      D.addEventListener("click", q), U.addEventListener("keydown", (H) => {
        H.key === "Enter" && q();
      }), _.append(U, D), R.appendChild(_), R.appendChild(Y);
    }
    if (C.showCta && C.ctaUrl) {
      const _ = document.createElement("a");
      _.className = "klavity-cta", _.href = C.ctaUrl, _.target = "_blank", _.rel = "noopener", _.textContent = C.ctaText, R.appendChild(_);
    }
    if (le.appendChild(R), !n.whiteLabel) {
      const _ = document.createElement("div");
      _.className = "klavity-pb";
      const U = document.createElement("a");
      U.href = Ed("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), U.target = "_blank", U.rel = "noopener", U.textContent = "Klavity", _.append("Powered by ", U), le.appendChild(_);
    }
    !C.showEmail && !C.showCta && O();
  }
  if (P.length && (be = P.length - 1, un()), t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const b = g <= L;
    if (b || lc(t) === "screen") {
      if (l = !0, Ne(), lc(t) === "screen")
        return (async () => {
          const E = await Ls({ viewport: !0, onOpen: !0 });
          if (E.ok) {
            l = !1, Ne();
            return;
          }
          if (E.declined) {
            l = !1, lr({ immediate: !0, reason: "discard" });
            return;
          }
          if (c.length) {
            l = !1, Ne();
            return;
          }
          if (!b) {
            y = !0, l = !1, Ne();
            return;
          }
          if (l = !0, Ne(), t.onCaptureViewport) {
            xl(null).catch(() => {
              l = !1, Ne();
            });
            return;
          }
          t.onCaptureFull().then((R) => {
            const { dataUrl: A, quality: O, suggestSharp: _, blank: U } = Ht(R);
            if (l = !1, U && c.length === 0) {
              bs();
              return;
            }
            Nt(A, O, void 0, !0, !!_), er(Wr);
          }).catch(() => {
            l = !1, Ne();
          });
        })(), el;
      const k = () => {
        if (t.onCaptureViewport) {
          xl(null).catch(() => {
            l = !1, Ne();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: R, quality: A, suggestSharp: O, blank: _ } = Ht(E);
          if (l = !1, _ && c.length === 0) {
            bs();
            return;
          }
          Nt(R, A, void 0, !0, !!O), er(Wr);
        }).catch(() => {
          l = !1, Ne();
        });
      }, C = window.requestIdleCallback;
      typeof C == "function" ? C(() => k(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(k, 0));
    } else
      y = !0, Ne();
  }
  return el;
}
function hy(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Je(r), Je(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    a = !0, i = p.clientX, s = p.clientY, Je(n);
  }), r.addEventListener("pointermove", (p) => {
    if (!a) return;
    const o = Math.min(p.clientX, i), h = Math.min(p.clientY, s), d = Math.abs(p.clientX - i), u = Math.abs(p.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${o}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o + d}px 0/calc(100% - ${o + d}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px 0/${d}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px ${h + u}px/${d}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!a) return;
    a = !1;
    const o = Math.abs(p.clientX - i), h = Math.abs(p.clientY - s);
    if (o < 8 || h < 8) {
      c(), t();
      return;
    }
    const d = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, s), w: o, h };
    c(), e(d);
  });
}
const fy = 2e4;
async function cc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), fy);
        })
      ]);
      return uc(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return uc(e);
}
const my = 3e4;
function uc(e) {
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
    }, my), a = (c) => {
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
const gy = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function yy(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function by(e) {
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
const ky = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Hr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function vy(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: s = 58,
    eyes: a = !0,
    legs: c = !0,
    animate: l = !0,
    className: p = ""
  } = e, o = Hr(e.initials || yy(t)), h = i !== "none" ? gy[i] : null, d = h ? `<span class="ksim-mark ${l ? ky[h.mark] : ""}" style="color:${Hr(h.accent)}">${by(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Hr(r)}" alt="${Hr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), M = `--ksim-persona:${Hr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${Hr(h.accent)};` : "");
  return `<span class="${y}" style="${M}" data-emotion="${i}" title="${Hr(t)}">${d}${m}${f}</span>`;
}
function wy(e) {
  const t = document.createElement("template");
  return t.innerHTML = vy(e).trim(), t.content.firstElementChild;
}
const xy = `
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
function Sy(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = xy, t.appendChild(r);
}
function la(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let p = 0; p < c.length; p++) l[p] = c.charCodeAt(p);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function Ey(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function Cy(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? la(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", la(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return Ey(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function My(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function Ry(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = Cy({
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
  await My(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
  const p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
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
        l.append("screenshot_thumbs", la(u), "thumb.jpg");
      } catch {
      }
  const o = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: o, body: l });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return {
    issueKey: d.jira_key ?? d.id,
    issueUrl: d.issue_url ?? t.backendUrl
  };
}
const Ty = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Ay = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Ly(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Ay + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function _y(e) {
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
function Iy(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function Ys(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = _y(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = Iy(n);
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
function tr(e, t) {
  if (t >= e.length) return null;
  const r = e[t];
  let n = 0;
  for (let a = 7; a >= 0; a--)
    if ((r & 1 << a) !== 0) {
      n = 8 - a;
      break;
    }
  if (n === 0 || t + n > e.length) return null;
  let i = r & (1 << 8 - n) - 1;
  for (let a = 1; a < n; a++)
    i = i * 256 + e[t + a];
  let s = 0;
  for (let a = 0; a < n; a++)
    s = s * 256 + e[t + a];
  return { width: n, value: i, rawId: s };
}
function dc(e, t = 0) {
  let r = t;
  if (!r)
    for (let s = 1; s <= 8; s++) {
      const a = (1 << 7 * s) - 2;
      if (e <= a) {
        r = s;
        break;
      }
    }
  r || (r = 8);
  const n = new Uint8Array(r);
  let i = e;
  for (let s = r - 1; s > 0; s--)
    n[s] = i & 255, i = Math.floor(i / 256);
  return n[0] = i & 255 | 1 << 8 - r, n;
}
function pc(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function Oy(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = tr(e, 0);
  if (!r) return e;
  const n = tr(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = tr(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const a = tr(e, i + s.width);
  if (!a) return e;
  const c = i + s.width + a.width;
  let l = c;
  const p = a.width === 8 && a.value === 72057594037927940, o = p ? e.length : Math.min(e.length, c + a.value);
  let h = -1, d = null, u = 0;
  for (; l < o; ) {
    const K = tr(e, l);
    if (!K) break;
    const ie = tr(e, l + K.width);
    if (!ie) break;
    if (K.rawId === 357149030) {
      h = l, d = ie, u = K.width + ie.width;
      break;
    }
    if (K.rawId === 524531317) break;
    l += K.width + ie.width + ie.value;
  }
  if (h === -1 || !d) return e;
  const m = h + u, f = m + d.value;
  let y = m, M = 1e6, w = -1, v = 0, L = 0, S = !1;
  for (; y < f; ) {
    const K = tr(e, y);
    if (!K) break;
    const ie = tr(e, y + K.width);
    if (!ie) break;
    const re = y + K.width + ie.width, fe = re + ie.value;
    if (K.rawId === 2807729) {
      S = !0;
      let Re = 0;
      for (let He = 0; He < ie.value; He++)
        Re = Re * 256 + e[re + He];
      Re > 0 && (M = Re);
    } else K.rawId === 17545 && (w = y, v = fe - y, L = ie.value);
    y = fe;
  }
  const x = t * 1e6 / M;
  if (w !== -1 && L === 8) {
    const K = tr(e, w);
    if (K) {
      const ie = tr(e, w + K.width);
      if (ie && ie.value === 8) {
        const re = w + K.width + ie.width, fe = new Uint8Array(e);
        return fe.set(pc(x), re), fe;
      }
    }
  }
  const T = new Uint8Array(11);
  T[0] = 68, T[1] = 137, T[2] = 136, T.set(pc(x), 3);
  let I = null;
  S || (I = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let F;
  if (w === -1) {
    const K = e.subarray(m, f), ie = T.length + (I ? I.length : 0);
    F = new Uint8Array(K.length + ie);
    let re = 0;
    I && (F.set(I, re), re += I.length), F.set(K, re), re += K.length, F.set(T, re);
  } else {
    const K = e.subarray(m, w), ie = e.subarray(w + v, f), re = T.length + (I ? I.length : 0);
    F = new Uint8Array(K.length + re + ie.length);
    let fe = 0;
    I && (F.set(I, fe), fe += I.length), F.set(K, fe), fe += K.length, F.set(T, fe), fe += T.length, F.set(ie, fe);
  }
  const z = dc(F.length), Q = new Uint8Array(4 + z.length);
  Q[0] = 21, Q[1] = 73, Q[2] = 169, Q[3] = 102, Q.set(z, 4);
  const W = new Uint8Array(Q.length + F.length);
  W.set(Q, 0), W.set(F, Q.length);
  const N = u + d.value, Ue = W.length - N;
  let Ze = null;
  p || (Ze = dc(a.value + Ue, a.width));
  const me = e.subarray(0, i + s.width), pe = Ze || e.subarray(i + s.width, c), _e = e.subarray(c, h), We = W, Ie = e.subarray(h + N), we = me.length + pe.length + _e.length + We.length + Ie.length, Xe = new Uint8Array(we);
  let P = 0;
  return Xe.set(me, P), P += me.length, Xe.set(pe, P), P += pe.length, Xe.set(_e, P), P += _e.length, Xe.set(We, P), P += We.length, Xe.set(Ie, P), P += Ie.length, Xe;
}
function Ny(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Py(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await Ny(e)), n = Oy(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const zy = 180 * 1e3, $y = 50 * 1024 * 1024, Dy = 1e6, Fy = 96e3, Uy = 15, hc = 1280, Td = {
  maxDurationMs: zy,
  maxBytes: $y
}, By = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function wa() {
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
function qy(e, t = By) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Ad(e = wa()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Wy() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function jy(e = {}, t = wa()) {
  var w, v, L, S, x, T, I, F, z, Q, W, N, Ue, Ze, me, pe, _e, We, Ie, we, Xe;
  const r = { ...Td, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? Uy)), a = qy(
    (w = t.MediaRecorder) != null && w.isTypeSupported ? (P) => t.MediaRecorder.isTypeSupported(P) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Wy(), l = t.createElement("canvas"), p = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0, o.autoplay = !0;
  try {
    (v = o.setAttribute) == null || v.call(o, "playsinline", ""), (L = o.setAttribute) == null || L.call(o, "autoplay", ""), (S = o.setAttribute) == null || S.call(o, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (x = h.setAttribute) == null || x.call(h, "playsinline", ""), (T = h.setAttribute) == null || T.call(h, "autoplay", ""), (I = h.setAttribute) == null || I.call(h, "muted", "");
  } catch {
  }
  let d = "idle";
  const u = (P) => {
    var K;
    d = P;
    try {
      (K = e.onState) == null || K.call(e, P);
    } catch {
    }
  };
  let m = null;
  if (e.focusCapturedSurface)
    try {
      const P = globalThis.CaptureController;
      typeof P == "function" && (m = new P(), (F = m.setFocusBehavior) == null || F.call(m, "focus-captured-surface"));
    } catch {
      m = null;
    }
  const f = await t.mediaDevices.getDisplayMedia({
    video: { frameRate: s, displaySurface: e.preferSurface ?? "monitor" },
    audio: !1,
    preferCurrentTab: !1,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "include",
    monitorTypeSurfaces: "include",
    ...m ? { controller: m } : {}
  });
  let y = null;
  const M = () => {
    var P;
    for (const K of [f, y])
      try {
        (P = K == null ? void 0 : K.getTracks) == null || P.call(K).forEach((ie) => {
          var re;
          return (re = ie.stop) == null ? void 0 : re.call(ie);
        });
      } catch {
      }
  };
  try {
    let P = function() {
      if (!ar) {
        ar = !0;
        try {
          Ot.state !== "inactive" && Ot.stop();
        } catch {
        }
      }
    };
    const K = (z = f.getVideoTracks) == null ? void 0 : z.call(f)[0], ie = ((Q = K == null ? void 0 : K.getSettings) == null ? void 0 : Q.call(K)) ?? {}, re = ie.width && ie.height ? ie.width / ie.height : 16 / 9;
    l.width = hc, l.height = Math.round(hc / re);
    let fe = null, Re = !1, He = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((W = y.getVideoTracks) != null && W.call(y).length)) {
          Re = !0, He = !1;
          try {
            h.srcObject = y, await (((N = h.play) == null ? void 0 : N.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (fe = ((Ue = y.getAudioTracks) == null ? void 0 : Ue.call(y)[0]) || null, fe && (He = !1));
      } catch (se) {
        let Ee = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), fe = ((Ze = y.getAudioTracks) == null ? void 0 : Ze.call(y)[0]) || null, fe) {
              He = !1, Ee = !0;
              try {
                (me = e.onFallback) == null || me.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!Ee) {
          try {
            (pe = e.onFallback) == null || pe.call(e, (se == null ? void 0 : se.name) === "NotAllowedError" ? "permissions-policy" : (se == null ? void 0 : se.name) || "camera-mic-blocked");
          } catch {
          }
          He = !0;
        }
      }
    const gt = !!fe;
    if (Re)
      try {
        o.srcObject = f, await (((_e = o.play) == null ? void 0 : _e.call(o)) ?? Promise.resolve());
      } catch {
      }
    let ce = 0, ye = 0;
    const Ce = () => {
      if (!p) return;
      const se = l.width, Ee = l.height;
      if (o.videoWidth) {
        const Pe = o.videoWidth, rt = o.videoHeight, Oe = Pe / rt, Pr = se / Ee;
        let on = se, zn = Ee, $n = 0, Qe = 0;
        Oe > Pr ? (zn = se / Oe, Qe = (Ee - zn) / 2) : (on = Ee * Oe, $n = (se - on) / 2), ($n > 0 || Qe > 0) && (p.fillStyle = "#000", p.fillRect(0, 0, se, Ee)), p.drawImage(o, $n, Qe, on, zn);
      }
      if (Re && h.videoWidth) {
        const Pe = Math.round(se * 0.22), rt = Math.round(Pe * (h.videoHeight / h.videoWidth)), Oe = se - Pe - 20, Pr = Ee - rt - 20;
        p.drawImage(h, Oe, Pr, Pe, rt), p.strokeStyle = "#7c3aed", p.lineWidth = 2, p.strokeRect(Oe, Pr, Pe, rt);
      }
      d === "recording" && (p.fillStyle = "#e11", p.beginPath(), p.arc(24, 24, 7, 0, Math.PI * 2), p.fill());
    };
    if (Re) {
      let se = 0;
      const Ee = Math.floor(1e3 / s), Pe = () => {
        se = t.now(), Ce();
      }, rt = () => {
        ce = t.raf(rt), Pe();
      };
      rt(), ye = t.setInterval(() => {
        var Oe;
        if (o.paused && !(K != null && K.muted))
          try {
            (Oe = o.play) == null || Oe.call(o);
          } catch {
          }
        t.now() - se >= Ee && Pe();
      }, Math.max(16, Ee));
    }
    const xe = [];
    let de = null;
    if (Re) {
      try {
        de = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const se = (We = de == null ? void 0 : de.getVideoTracks) == null ? void 0 : We.call(de)[0];
      se ? xe.push(se) : K && xe.push(K);
    } else K && xe.push(K);
    fe && xe.push(fe);
    const oe = new t.MediaStream(xe);
    try {
      (Ie = K == null ? void 0 : K.addEventListener) == null || Ie.call(K, "ended", () => P()), (we = K == null ? void 0 : K.addEventListener) == null || we.call(K, "mute", () => {
      }), (Xe = K == null ? void 0 : K.addEventListener) == null || Xe.call(K, "unmute", () => {
        var se;
        if (Re) {
          try {
            (se = o.play) == null || se.call(o);
          } catch {
          }
          Ce();
        }
      });
    } catch {
    }
    const be = () => {
      var se, Ee;
      if (Re && typeof document < "u" && !document.hidden) {
        try {
          (se = o.play) == null || se.call(o);
        } catch {
        }
        try {
          (Ee = h.play) == null || Ee.call(h);
        } catch {
        }
        Ce();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", be);
    } catch {
    }
    const Ir = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? Dy)), ci = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? Fy)), Ot = new t.MediaRecorder(oe, { mimeType: a, videoBitsPerSecond: Ir, audioBitsPerSecond: ci }), Or = [];
    let Be = 0, lt = 0, Se = 0, yt = 0, St = 0, ar = !1;
    const ut = () => {
      if (d === "idle") return 0;
      const se = t.now() - lt - Se;
      return Math.max(0, se - (yt ? t.now() - yt : 0));
    };
    Ot.ondataavailable = (se) => {
      var Ee, Pe;
      if (se != null && se.data && se.data.size) {
        Or.push(se.data), Be += se.data.size;
        try {
          (Ee = e.onChunk) == null || Ee.call(e, se.data);
        } catch {
        }
      }
      try {
        (Pe = e.onStats) == null || Pe.call(e, { elapsedMs: ut(), bytes: Be });
      } catch {
      }
      Be >= r.maxBytes && P();
    };
    let De;
    const Zt = new Promise((se) => {
      De = se;
    }), Nr = M;
    return Ot.onstop = async () => {
      ce && t.caf(ce), ye && (t.clearInterval(ye), ye = 0), St && (t.clearInterval(St), St = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", be);
      } catch {
      }
      const se = ut();
      Nr();
      try {
        o.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      u("stopped");
      const Ee = new Blob(Or, { type: a.split(";")[0] });
      let Pe = Ee;
      if (se > 0 && (Ee.type.includes("webm") || a.includes("webm")))
        try {
          Pe = await Py(Ee, se);
        } catch {
          Pe = Ee;
        }
      const rt = ie.width && ie.width > 0 ? ie.width : l.width, Oe = ie.height && ie.height > 0 ? ie.height : l.height;
      De({
        id: c,
        blob: Pe,
        mime: (Pe.type || a || "video/webm").split(";")[0],
        durationMs: se,
        bytes: Pe.size || Be,
        width: Re ? l.width : rt,
        height: Re ? l.height : Oe,
        screenOnly: He,
        hadCamera: Re,
        hadAudio: gt
      });
    }, Ot.start(1e3), lt = t.now(), u("recording"), St = t.setInterval(() => {
      var Ee;
      const se = ut();
      try {
        (Ee = e.onStats) == null || Ee.call(e, { elapsedMs: se, bytes: Be });
      } catch {
      }
      se >= r.maxDurationMs && P();
    }, 200), {
      pause() {
        if (d === "recording") {
          try {
            Ot.pause();
          } catch {
          }
          yt = t.now(), u("paused");
        }
      },
      resume() {
        if (d === "paused") {
          try {
            Ot.resume();
          } catch {
          }
          Se += t.now() - yt, yt = 0, u("recording");
        }
      },
      stop() {
        P();
      },
      state() {
        return d;
      },
      screenOnly() {
        return He;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Re && y ? y : null;
      },
      done: Zt
    };
  } catch (P) {
    throw M(), P;
  }
}
function Hy(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Yy(e) {
  return {
    id: e.id,
    dataUrl: await Hy(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Vy(e) {
  var h, d;
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
    const u = (d = r.play) == null ? void 0 : d.call(r);
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
  }, p = (u) => {
    n && (t.style.left = Math.max(0, a + (u.clientX - i)) + "px", t.style.top = Math.max(0, c + (u.clientY - s)) + "px");
  }, o = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", p), t.addEventListener("pointerup", o), t;
}
async function Gy(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? wa();
  return Ad(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', a = (x) => {
      x === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (x) => {
      var T;
      try {
        (T = e.onPhase) == null || T.call(e, x);
      } catch {
      }
    };
    a("modal");
    let l = !1, p = null, o = !1;
    const h = () => {
      try {
        p == null || p.stop();
      } catch {
      }
    }, d = (x) => {
      x.key === "Escape" && (x.stopPropagation(), x.preventDefault(), f(null));
    }, u = () => {
      h();
    }, m = (x) => {
      o && x.target === n && (x.preventDefault(), x.stopPropagation(), f(null));
    };
    n.addEventListener("pointerdown", m), document.addEventListener("keydown", d, { capture: !0 }), typeof window < "u" && (window.addEventListener("pagehide", u), window.addEventListener("beforeunload", u));
    const f = (x) => {
      if (!l) {
        l = !0, h(), n.removeEventListener("pointerdown", m), document.removeEventListener("keydown", d, { capture: !0 }), typeof window < "u" && (window.removeEventListener("pagehide", u), window.removeEventListener("beforeunload", u));
        try {
          n.remove();
        } catch {
        }
        r(x);
      }
    }, y = (x) => {
      const T = Math.max(0, Math.round(x / 1e3));
      return `${Math.floor(T / 60)}:${String(T % 60).padStart(2, "0")}`;
    }, M = (x) => `${(x / 1048576).toFixed(1)} MB`, w = { ...Td, ...e.caps || {} }, v = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const x = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${x}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(w.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const T = i.querySelector("#klr-cam").checked, I = i.querySelector("#klr-mic").checked;
        L(T, I);
      };
    }, L = async (x, T) => {
      var F;
      let I = null;
      try {
        p = await jy({
          wantCamera: x,
          wantMic: T,
          caps: e.caps,
          onFallback: (z) => {
            I = z;
          },
          onStats: ({ elapsedMs: z, bytes: Q }) => {
            const W = i.querySelector("#klr-timer");
            W && (W.textContent = "REC " + y(z));
            const N = i.querySelector("#klr-meta");
            N && (N.innerHTML = `${y(Math.max(0, w.maxDurationMs - z))} left<br>~${M(Q)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(I);
      try {
        const z = Vy((F = p == null ? void 0 : p.cameraStream) == null ? void 0 : F.call(p));
        z && n.appendChild(z);
      } catch {
      }
      p.done.then(async (z) => {
        f(await Yy(z));
      });
    }, S = (x) => {
      const T = x === "camera-blocked", F = T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!x && !T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + F;
      const z = i.querySelector("#klr-pause");
      z.onclick = () => {
        p && (p.state() === "recording" ? (p.pause(), z.textContent = "Resume") : (p.resume(), z.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => p == null ? void 0 : p.stop();
    };
    v();
  }) : null;
}
async function fc(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((m, f) => {
      const y = new Image();
      y.onload = () => m(y), y.onerror = f, y.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight, c = 16e3;
    let l = s > r ? r / s : 1;
    a * l > c && (l = c / a);
    const p = Math.round(s * l), o = Math.round(a * l), h = document.createElement("canvas");
    h.width = p, h.height = o;
    const d = h.getContext("2d");
    if (!d) return e;
    d.fillStyle = "#fff", d.fillRect(0, 0, p, o), d.drawImage(i, 0, 0, p, o);
    const u = h.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
async function Xy(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((u, m) => {
      const f = new Image();
      f.onload = () => u(f), f.onerror = m, f.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight;
    if (!s || !a) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), p = Math.round(a * c), o = document.createElement("canvas");
    o.width = l, o.height = p;
    const h = o.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, p), h.drawImage(i, 0, 0, l, p);
    const d = o.toDataURL("image/jpeg", n);
    return d.length < e.length ? d : e;
  } catch {
    return e;
  }
}
var Ky = Object.defineProperty, Jy = (e, t, r) => t in e ? Ky(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, V = (e, t, r) => Jy(e, typeof t != "symbol" ? t + "" : t, r), mc, Zy = Object.defineProperty, Qy = (e, t, r) => t in e ? Zy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, gc = (e, t, r) => Qy(e, typeof t != "symbol" ? t + "" : t, r), it = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(it || {});
const yc = {
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
}, bc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Mi = {}, Ld = {}, eb = () => !!globalThis.Zone;
function xa(e) {
  if (Mi[e])
    return Mi[e];
  const t = globalThis[e], r = t.prototype, n = e in yc ? yc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in bc ? bc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !eb())
    return Mi[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Ld[e] = () => c.remove()) : c.remove(), Mi[e] = p;
  } catch {
    return r;
  }
}
const Vs = {};
function hr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Vs[i])
    return Vs[i].call(
      t
    );
  const s = xa(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Vs[i] = a, a.call(t)) : t[r];
}
const Gs = {};
function _d(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Gs[n])
    return Gs[n].bind(
      t
    );
  const s = xa(e)[r];
  return typeof s != "function" ? t[r] : (Gs[n] = s, s.bind(t));
}
function tb(e) {
  return hr("Node", e, "ownerDocument");
}
function rb(e) {
  return hr("Node", e, "childNodes");
}
function nb(e) {
  return hr("Node", e, "parentNode");
}
function ib(e) {
  return hr("Node", e, "parentElement");
}
function sb(e) {
  return hr("Node", e, "textContent");
}
function ob(e, t) {
  return _d("Node", e, "contains")(t);
}
function ab(e) {
  return _d("Node", e, "getRootNode")();
}
function lb(e) {
  return !e || !("host" in e) ? null : hr("ShadowRoot", e, "host");
}
function cb(e) {
  return e.styleSheets;
}
function ub(e) {
  return !e || !("shadowRoot" in e) ? null : hr("Element", e, "shadowRoot");
}
function db(e, t) {
  return hr("Element", e, "querySelector")(t);
}
function pb(e, t) {
  return hr("Element", e, "querySelectorAll")(t);
}
function hb() {
  return [
    xa("MutationObserver").constructor,
    Ld.MutationObserver ?? (() => {
    })
  ];
}
let Id = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Id = () => (/* @__PURE__ */ new Date()).getTime());
function fb(e, t, r) {
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
const mt = {
  ownerDocument: tb,
  childNodes: rb,
  parentNode: nb,
  parentElement: ib,
  textContent: sb,
  contains: ob,
  getRootNode: ab,
  host: lb,
  styleSheets: cb,
  shadowRoot: ub,
  querySelector: db,
  querySelectorAll: pb,
  nowTimestamp: Id,
  mutationObserverCtor: hb,
  patch: fb
};
function Od(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Xn(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && mt.host(e) || null
  );
  return !!(t && "shadowRoot" in t && mt.shadowRoot(t) === e);
}
function Kn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function mb(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function gb(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function ca(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Nd(i, r)
    ).join("");
    return mb(n);
  } catch {
    return null;
  }
}
function Nd(e, t) {
  if (bb(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      ca(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      gb(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Gi(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return kb(e) && e.selectorText.includes(":") && (r = yb(r)), t ? Gi(r, t) : r;
  }
}
function yb(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function bb(e) {
  return "styleSheet" in e;
}
function kb(e) {
  return "selectorText" in e;
}
class Pd {
  constructor() {
    gc(this, "idNodeMap", /* @__PURE__ */ new Map()), gc(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function vb() {
  return new Pd();
}
function Yi({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && Qr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function Qr(e) {
  return e.toLowerCase();
}
const kc = "__rrweb_original__";
function wb(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = kc in s ? s[kc] : s;
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
function Vi(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Qr(t)
  ) : null;
}
function zd(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function xb(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Sb = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Eb = /^(?:[a-z+]+:)?\/\//i, Cb = /^www\..*/i, Mb = /^(data:)([^,]*),(.*)/i;
function Gi(e, t) {
  return (e || "").replace(
    Sb,
    (r, n, i, s, a, c) => {
      const l = i || a || c, p = n || s || "";
      if (!l)
        return r;
      if (Eb.test(l) || Cb.test(l))
        return `url(${p}${l}${p})`;
      if (Mb.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${xb(t) + l}${p})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const d of h)
        d !== "." && (d === ".." ? o.pop() : o.push(d));
      return `url(${p}${o.join("/")}${p})`;
    }
  );
}
function Ri(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Rb(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Ri(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = Ri(
          n[l].textContent,
          r
        ), o = 100;
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
            h = o + 1;
          } else h === p.length - 1 && (m = a.indexOf(d));
          if (u.length >= 2 && h > o) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const y = Ri(f).length;
              m = a.indexOf(d, y);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = Ri(
                e.substring(0, f),
                r
              );
              if (y.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), a = a.substring(m);
                break;
              } else y.length < m ? f += Math.max(
                1,
                Math.floor((m - y.length) / c)
              ) : f -= Math.max(
                1,
                Math.floor((y.length - m) * c)
              );
            }
            break;
          }
        }
      }
  }
  return i.push(e), i;
}
function Tb(e, t) {
  return Rb(e, t).join("/* rr_split */");
}
let Ab = 1;
const Lb = new RegExp("[^a-z0-9-_:]"), ti = -2;
function $d() {
  return Ab++;
}
function _b(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Qr(e.tagName);
  return Lb.test(t) ? "div" : t;
}
let bn, vc;
const Ib = /^[^ \t\n\r\u000c]+/, Ob = /^[, \t\n\r\u000c]+/;
function Nb(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(Ob), !(r >= t.length); ) {
    let s = n(Ib);
    if (s.slice(-1) === ",")
      s = Sn(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Sn(e, s);
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
const wc = /* @__PURE__ */ new WeakMap();
function Sn(e, t) {
  return !t || t.trim() === "" ? t : Sa(e, t);
}
function Pb(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Sa(e, t) {
  let r = wc.get(e);
  if (r || (r = e.createElement("a"), wc.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Dd(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Sn(e, n) : r === "srcset" ? Nb(e, n) : r === "style" ? Gi(n, Sa(e)) : t === "object" && r === "data" ? Sn(e, n) : n);
}
function Fd(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function zb(e, t, r) {
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
function Xi(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Xi(mt.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Xi(mt.parentNode(e), t, r) : !1;
}
function Ud(e, t, r, n) {
  let i;
  if (Od(e)) {
    if (i = e, !mt.childNodes(i).length)
      return !1;
  } else {
    if (mt.parentElement(e) === null)
      return !1;
    i = mt.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Xi(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function $b(e, t, r) {
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
function Db(e, t, r) {
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
function Fb(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: a,
    inlineStylesheet: c,
    maskInputOptions: l = {},
    maskTextFn: p,
    maskInputFn: o,
    dataURLOptions: h = {},
    inlineImages: d,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: y = !1
  } = t, M = Ub(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: it.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: it.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: it.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: M
      };
    case e.ELEMENT_NODE:
      return qb(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: o,
        dataURLOptions: h,
        inlineImages: d,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: M
      });
    case e.TEXT_NODE:
      return Bb(e, {
        doc: r,
        needsMask: a,
        maskTextFn: p,
        rootId: M,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: it.CDATA,
        textContent: "",
        rootId: M
      };
    case e.COMMENT_NODE:
      return {
        type: it.Comment,
        textContent: mt.textContent(e) || "",
        rootId: M
      };
    default:
      return !1;
  }
}
function Ub(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Bb(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = mt.parentNode(e), c = a && a.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = mt.textContent(e), p && l && (l = Gi(l, Sa(t.doc)))), !p && !o && l && r && (l = n ? n(l, mt.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: it.Text,
    textContent: l || "",
    rootId: i
  };
}
function qb(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: s,
    maskInputOptions: a = {},
    maskInputFn: c,
    dataURLOptions: l = {},
    inlineImages: p,
    recordCanvas: o,
    keepIframeSrcFn: h,
    newlyAddedElement: d = !1,
    rootId: u
  } = t, m = zb(e, n, i), f = _b(e);
  let y = {};
  const M = e.attributes.length;
  for (let v = 0; v < M; v++) {
    const L = e.attributes[v];
    Fd(f, L.name, L.value) || (y[L.name] = Dd(
      r,
      f,
      Qr(L.name),
      L.value
    ));
  }
  if (f === "link" && s) {
    const v = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let L = null;
    v && (L = ca(v)), L && (delete y.rel, delete y.href, y._cssText = L);
  }
  if (f === "style" && e.sheet) {
    let v = ca(
      e.sheet
    );
    v && (e.childNodes.length > 1 && (v = Tb(v, e)), y._cssText = v);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const v = e.value, L = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && v ? y.value = Yi({
      element: e,
      type: Vi(e),
      tagName: f,
      value: v,
      maskInputOptions: a,
      maskInputFn: c
    }) : L && (y.checked = L);
  }
  if (f === "option" && (e.selected && !a.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      wb(e) || (y.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const v = e.toDataURL(
        l.type,
        l.quality
      ), L = r.createElement("canvas");
      L.width = e.width, L.height = e.height;
      const S = L.toDataURL(
        l.type,
        l.quality
      );
      v !== S && (y.rr_dataURL = v);
    }
  }
  if (f === "img" && p) {
    bn || (bn = r.createElement("canvas"), vc = bn.getContext("2d"));
    const v = e, L = v.currentSrc || v.getAttribute("src") || "<unknown-src>", S = v.crossOrigin, x = () => {
      v.removeEventListener("load", x);
      try {
        bn.width = v.naturalWidth, bn.height = v.naturalHeight, vc.drawImage(v, 0, 0), y.rr_dataURL = bn.toDataURL(
          l.type,
          l.quality
        );
      } catch (T) {
        if (v.crossOrigin !== "anonymous") {
          v.crossOrigin = "anonymous", v.complete && v.naturalWidth !== 0 ? x() : v.addEventListener("load", x);
          return;
        } else
          console.warn(
            `Cannot inline img src=${L}! Error: ${T}`
          );
      }
      v.crossOrigin === "anonymous" && (S ? y.crossOrigin = S : v.removeAttribute("crossorigin"));
    };
    v.complete && v.naturalWidth !== 0 ? x() : v.addEventListener("load", x);
  }
  if (["audio", "video"].includes(f)) {
    const v = y;
    v.rr_mediaState = e.paused ? "paused" : "played", v.rr_mediaCurrentTime = e.currentTime, v.rr_mediaPlaybackRate = e.playbackRate, v.rr_mediaMuted = e.muted, v.rr_mediaLoop = e.loop, v.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: v, height: L } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${v}px`,
      rr_height: `${L}px`
    };
  }
  f === "iframe" && !h(y.src) && (e.contentDocument || (y.rr_src = y.src), delete y.src);
  let w;
  try {
    customElements.get(f) && (w = !0);
  } catch {
  }
  return {
    type: it.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: Pb(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: w
  };
}
function je(e) {
  return e == null ? "" : e.toLowerCase();
}
function Bd(e) {
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
function Wb(e, t) {
  if (t.comment && e.type === it.Comment)
    return !0;
  if (e.type === it.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && zd(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (je(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || je(e.attributes.name) === "application-name" || je(e.attributes.rel) === "icon" || je(e.attributes.rel) === "apple-touch-icon" || je(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && je(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (je(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      je(e.attributes.name).match(/^(og|twitter):/) || je(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (je(e.attributes.name) === "robots" || je(e.attributes.name) === "googlebot" || je(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (je(e.attributes.name) === "author" || je(e.attributes.name) === "generator" || je(e.attributes.name) === "framework" || je(e.attributes.name) === "publisher" || je(e.attributes.name) === "progid" || je(e.attributes.property).match(/^article:/) || je(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (je(e.attributes.name) === "google-site-verification" || je(e.attributes.name) === "yandex-verification" || je(e.attributes.name) === "csrf-token" || je(e.attributes.name) === "p:domain_verify" || je(e.attributes.name) === "verify-v1" || je(e.attributes.name) === "verification" || je(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function En(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    maskTextClass: a,
    maskTextSelector: c,
    skipChild: l = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: o = {},
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: u,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: y = !1,
    onSerialize: M,
    onIframeLoad: w,
    iframeLoadTimeout: v = 5e3,
    onStylesheetLoad: L,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: x = () => !1,
    newlyAddedElement: T = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: F } = t, { preserveWhiteSpace: z = !0 } = t;
  F || (F = Ud(
    e,
    a,
    c,
    F === void 0
  ));
  const Q = Fb(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: F,
    inlineStylesheet: p,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: d,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: y,
    keepIframeSrcFn: x,
    newlyAddedElement: T,
    cssCaptured: I
  });
  if (!Q)
    return console.warn(e, "not serialized"), null;
  let W;
  n.hasNode(e) ? W = n.getId(e) : Wb(Q, u) || !z && Q.type === it.Text && !Q.textContent.replace(/^\s+|\s+$/gm, "").length ? W = ti : W = $d();
  const N = Object.assign(Q, { id: W });
  if (n.add(e, N), W === ti)
    return null;
  M && M(e);
  let Ue = !l;
  if (N.type === it.Element) {
    Ue = Ue && !N.needBlock, delete N.needBlock;
    const me = mt.shadowRoot(e);
    me && Kn(me) && (N.isShadowHost = !0);
  }
  if ((N.type === it.Document || N.type === it.Element) && Ue) {
    u.headWhitespace && N.type === it.Element && N.tagName === "head" && (z = !1);
    const me = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: F,
      maskTextClass: a,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: p,
      maskInputOptions: o,
      maskTextFn: h,
      maskInputFn: d,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: z,
      onSerialize: M,
      onIframeLoad: w,
      iframeLoadTimeout: v,
      onStylesheetLoad: L,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: x,
      cssCaptured: !1
    };
    if (!(N.type === it.Element && N.tagName === "textarea" && N.attributes.value !== void 0)) {
      N.type === it.Element && N.attributes._cssText !== void 0 && typeof N.attributes._cssText == "string" && (me.cssCaptured = !0);
      for (const _e of Array.from(mt.childNodes(e))) {
        const We = En(_e, me);
        We && N.childNodes.push(We);
      }
    }
    let pe = null;
    if (Od(e) && (pe = mt.shadowRoot(e)))
      for (const _e of Array.from(mt.childNodes(pe))) {
        const We = En(_e, me);
        We && (Kn(pe) && (We.isShadow = !0), N.childNodes.push(We));
      }
  }
  const Ze = mt.parentNode(e);
  return Ze && Xn(Ze) && Kn(Ze) && (N.isShadow = !0), N.type === it.Element && N.tagName === "iframe" && $b(
    e,
    () => {
      const me = e.contentDocument;
      if (me && w) {
        const pe = En(me, {
          doc: me,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: F,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: w,
          iframeLoadTimeout: v,
          onStylesheetLoad: L,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        pe && w(
          e,
          pe
        );
      }
    },
    v
  ), N.type === it.Element && N.tagName === "link" && typeof N.attributes.rel == "string" && (N.attributes.rel === "stylesheet" || N.attributes.rel === "preload" && typeof N.attributes.href == "string" && zd(N.attributes.href) === "css") && Db(
    e,
    () => {
      if (L) {
        const me = En(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: F,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: w,
          iframeLoadTimeout: v,
          onStylesheetLoad: L,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        me && L(
          e,
          me
        );
      }
    },
    S
  ), N;
}
function jb(e, t) {
  const {
    mirror: r = new Pd(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: a = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: p = !1,
    maskAllInputs: o = !1,
    maskTextFn: h,
    maskInputFn: d,
    slimDOM: u = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: w,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: L,
    keepIframeSrcFn: S = () => !1
  } = t, x = o === !0 ? {
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
  } : o, T = Bd(u);
  return En(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: s,
    maskTextSelector: a,
    skipChild: !1,
    inlineStylesheet: c,
    maskInputOptions: x,
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: T,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: w,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: L,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function Hb(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Yb(e) {
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
var Ti = { exports: {} }, xc;
function Vb() {
  if (xc) return Ti.exports;
  xc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ti.exports = t(), Ti.exports.createColors = t, Ti.exports;
}
const Gb = {}, Xb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Gb
}, Symbol.toStringTag, { value: "Module" })), Xt = /* @__PURE__ */ Yb(Xb);
var Xs, Sc;
function Ea() {
  if (Sc) return Xs;
  Sc = 1;
  let e = /* @__PURE__ */ Vb(), t = Xt;
  class r extends Error {
    constructor(i, s, a, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof s < "u" && typeof a < "u" && (typeof s == "number" ? (this.line = s, this.column = a) : (this.line = s.line, this.column = s.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let a = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), p = String(l).length, o, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        o = (f) => d(m(f)), h = (f) => u(f);
      } else
        o = h = (d) => d;
      return a.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + d + `
 ` + y + o("^");
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
  return Xs = r, r.default = r, Xs;
}
var Ai = {}, Ec;
function Ca() {
  return Ec || (Ec = 1, Ai.isClean = Symbol("isClean"), Ai.my = Symbol("my")), Ai;
}
var Ks, Cc;
function qd() {
  if (Cc) return Ks;
  Cc = 1;
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
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let o = 0; o < l; o++) a += p;
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
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, s !== c || a);
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
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[a] < "u")
        return p.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let o = "raw" + t(a);
        this[o] ? c = this[o](p, i) : p.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), p.rawCache[a] = c, c;
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
  return Ks = r, r.default = r, Ks;
}
var Js, Mc;
function is() {
  if (Mc) return Js;
  Mc = 1;
  let e = qd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Js = t, t.default = t, Js;
}
var Zs, Rc;
function ss() {
  if (Rc) return Zs;
  Rc = 1;
  let { isClean: e, my: t } = Ca(), r = Ea(), n = qd(), i = is();
  function s(c, l) {
    let p = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], d = typeof h;
      o === "parent" && d === "object" ? l && (p[o] = l) : o === "source" ? p[o] = h : Array.isArray(h) ? p[o] = h.map((u) => s(u, p)) : (d === "object" && h !== null && (h = s(h)), p[o] = h);
    }
    return p;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let o of l[p])
            typeof o.clone == "function" ? this.append(o.clone()) : this.append(o);
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
      let p = s(this);
      for (let o in l)
        p[o] = l[o];
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
        let { end: o, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: o.column, line: o.line },
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
        set(l, p, o) {
          return l[p] === o || (l[p] = o, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
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
      let o = this.source.start;
      if (l.index)
        o = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (o = this.positionInside(h, p));
      }
      return o;
    }
    positionInside(l, p) {
      let o = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        o[u] === `
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
      }, o = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), o = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? o = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? o = this.positionInside(l.endIndex) : l.index && (o = this.positionInside(l.index + 1));
      return (o.line < p.line || o.line === p.line && o.column <= p.column) && (o = { column: p.column + 1, line: p.line }), { end: o, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, o = !1;
        for (let h of l)
          h === this ? o = !0 : o ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
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
    toJSON(l, p) {
      let o = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          o[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          o[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), o[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[u] = m;
      }
      return h && (o.inputs = [...p.keys()].map((u) => u.toJSON())), o;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (o) => {
        p += o;
      }), p;
    }
    warn(l, p, o) {
      let h = { node: this };
      for (let d in o) h[d] = o[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Zs = a, a.default = a, Zs;
}
var Qs, Tc;
function os() {
  if (Tc) return Qs;
  Tc = 1;
  let e = ss();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Qs = t, t.default = t, Qs;
}
var eo, Ac;
function Kb() {
  if (Ac) return eo;
  Ac = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return eo = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, eo;
}
var to, Lc;
function Wd() {
  if (Lc) return to;
  Lc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { existsSync: r, readFileSync: n } = Xt, { dirname: i, join: s } = Xt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, o) {
      if (o.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, d = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (o.test(p) || h.test(p))
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
      let o = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!o) return;
      let h = p.lastIndexOf(o.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, o) {
      if (o === !1) return !1;
      if (o) {
        if (typeof o == "string")
          return o;
        if (typeof o == "function") {
          let h = o(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
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
          return p && (h = s(i(p), h)), this.loadFile(h);
        }
      }
    }
    startWith(p, o) {
      return p ? p.substr(0, o.length) === o : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return to = c, c.default = c, to;
}
var ro, _c;
function as() {
  if (_c) return ro;
  _c = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { fileURLToPath: r, pathToFileURL: n } = Xt, { isAbsolute: i, resolve: s } = Xt, { nanoid: a } = /* @__PURE__ */ Kb(), c = Xt, l = Ea(), p = Wd(), o = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let M = new p(this.css, y);
        if (M.text) {
          this.map = M;
          let w = M.consumer().file;
          !this.file && w && (this.file = this.mapResolve(w));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, w = {}) {
      let v, L, S;
      if (y && typeof y == "object") {
        let T = y, I = M;
        if (typeof T.offset == "number") {
          let F = this.fromOffset(T.offset);
          y = F.line, M = F.col;
        } else
          y = T.line, M = T.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          L = F.line, S = F.col;
        } else
          L = I.line, S = I.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? v = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        w.plugin
      ) : v = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        w.plugin
      ), v.input = { column: M, endColumn: S, endLine: L, line: y, source: this.css }, this.file && (n && (v.input.url = n(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let y, M;
      if (this[o])
        M = this[o];
      else {
        let v = this.css.split(`
`);
        M = new Array(v.length);
        let L = 0;
        for (let S = 0, x = v.length; S < x; S++)
          M[S] = L, L += v[S].length + 1;
        this[o] = M;
      }
      y = M[M.length - 1];
      let w = 0;
      if (f >= y)
        w = M.length - 1;
      else {
        let v = M.length - 2, L;
        for (; w < v; )
          if (L = w + (v - w >> 1), f < M[L])
            v = L - 1;
          else if (f >= M[L + 1])
            w = L + 1;
          else {
            w = L;
            break;
          }
      }
      return {
        col: f - M[w] + 1,
        line: w + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, w) {
      if (!this.map) return !1;
      let v = this.map.consumer(), L = v.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = v.originalPositionFor({ column: w, line: M }));
      let x;
      i(L.source) ? x = n(L.source) : x = new URL(
        L.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let T = {
        column: L.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: L.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          T.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = v.sourceContentFor(L.source);
      return I && (T.source = I), T;
    }
    toJSON() {
      let f = {};
      for (let y of ["hasBOM", "css", "file", "id"])
        this[y] != null && (f[y] = this[y]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return ro = u, u.default = u, c && c.registerInput && c.registerInput(u), ro;
}
var no, Ic;
function jd() {
  if (Ic) return no;
  Ic = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { dirname: r, relative: n, resolve: i, sep: s } = Xt, { pathToFileURL: a } = Xt, c = as(), l = !!(e && t), p = !!(r && i && n && s);
  class o {
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
      }, y, M;
      this.stringify(this.root, (w, v, L) => {
        if (this.css += w, v && L !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = w.match(/\n/g), y ? (d += y.length, M = w.lastIndexOf(`
`), u = w.length - M) : u += w.length, v && L !== "start") {
          let S = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== S.last || S.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      s === "\\" && (d = d.replace(/\\/g, "/"));
      let m = encodeURI(d).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(d, m), m;
    }
  }
  return no = o, no;
}
var io, Oc;
function ls() {
  if (Oc) return io;
  Oc = 1;
  let e = ss();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return io = t, t.default = t, io;
}
var so, Nc;
function tn() {
  if (Nc) return so;
  Nc = 1;
  let { isClean: e, my: t } = Ca(), r = os(), n = ls(), i = ss(), s, a, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function o(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        o(u);
  }
  class h extends i {
    append(...u) {
      for (let m of u) {
        let f = this.normalize(m, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(u) {
      if (super.cleanRaws(u), this.nodes)
        for (let m of this.nodes) m.cleanRaws(u);
    }
    each(u) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, y;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], y = u(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], y;
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
            ...f.map((y) => typeof y == "function" ? (M, w) => y(M.toProxy(), w) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...M) => f(y.toProxy(), ...M)
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
      let f = this.index(u), y = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(u);
      for (let w of y) this.proxyOf.nodes.splice(f + 1, 0, w);
      let M;
      for (let w in this.indexes)
        M = this.indexes[w], f < M && (this.indexes[w] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, M = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let v of M) this.proxyOf.nodes.splice(f, 0, v);
      let w;
      for (let v in this.indexes)
        w = this.indexes[v], f <= w && (this.indexes[v] = w + M.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = p(s(u).nodes);
      else if (typeof u > "u")
        u = [];
      else if (Array.isArray(u)) {
        u = u.slice(0);
        for (let y of u)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (u.type === "root" && this.type !== "document") {
        u = u.nodes.slice(0);
        for (let y of u)
          y.parent && y.parent.removeChild(y, "ignore");
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
      return u.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...u) {
      u = u.reverse();
      for (let m of u) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
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
      return f || (f = m, m = {}), this.walkDecls((y) => {
        m.props && !m.props.includes(y.prop) || m.fast && !y.value.includes(m.fast) || (y.value = y.value.replace(u, f));
      }), this.markDirty(), this;
    }
    some(u) {
      return this.nodes.some(u);
    }
    walk(u) {
      return this.each((m, f) => {
        let y;
        try {
          y = u(m, f);
        } catch (M) {
          throw m.addToError(M);
        }
        return y !== !1 && m.walk && (y = m.walk(u)), y;
      });
    }
    walkAtRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && u.test(f.name))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "atrule")
          return m(f, y);
      }));
    }
    walkComments(u) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return u(m, f);
      });
    }
    walkDecls(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && u.test(f.prop))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "decl")
          return m(f, y);
      }));
    }
    walkRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && u.test(f.selector))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "rule")
          return m(f, y);
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
    s = d;
  }, h.registerRule = (d) => {
    a = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, so = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, so;
}
var oo, Pc;
function Ma() {
  if (Pc) return oo;
  Pc = 1;
  let e = tn(), t, r;
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
  }, oo = n, n.default = n, oo;
}
var ao, zc;
function Hd() {
  if (zc) return ao;
  zc = 1;
  let e = {};
  return ao = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ao;
}
var lo, $c;
function Yd() {
  if ($c) return lo;
  $c = 1;
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
  return lo = e, e.default = e, lo;
}
var co, Dc;
function Ra() {
  if (Dc) return co;
  Dc = 1;
  let e = Yd();
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
  return co = t, t.default = t, co;
}
var uo, Fc;
function Jb() {
  if (Fc) return uo;
  Fc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, M = 58, w = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return uo = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, W, N, Ue, Ze, me, pe, _e, We, Ie, we, Xe = z.length, P = 0, K = [], ie = [];
    function re() {
      return P;
    }
    function fe(ce) {
      throw I.error("Unclosed " + ce, P);
    }
    function Re() {
      return ie.length === 0 && P >= Xe;
    }
    function He(ce) {
      if (ie.length) return ie.pop();
      if (P >= Xe) return;
      let ye = ce ? ce.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          N = P;
          do
            N += 1, W = z.charCodeAt(N);
          while (W === s || W === i || W === c || W === l || W === a);
          we = ["space", z.slice(P, N)], P = N - 1;
          break;
        }
        case p:
        case o:
        case u:
        case m:
        case M:
        case f:
        case d: {
          let Ce = String.fromCharCode(W);
          we = [Ce, Ce, P];
          break;
        }
        case h: {
          if (We = K.length ? K.pop()[1] : "", Ie = z.charCodeAt(P + 1), We === "url" && Ie !== e && Ie !== t && Ie !== s && Ie !== i && Ie !== c && Ie !== a && Ie !== l) {
            N = P;
            do {
              if (pe = !1, N = z.indexOf(")", N + 1), N === -1)
                if (Q || ye) {
                  N = P;
                  break;
                } else
                  fe("bracket");
              for (_e = N; z.charCodeAt(_e - 1) === r; )
                _e -= 1, pe = !pe;
            } while (pe);
            we = ["brackets", z.slice(P, N + 1), P, N], P = N;
          } else
            N = z.indexOf(")", P + 1), Ze = z.slice(P, N + 1), N === -1 || S.test(Ze) ? we = ["(", "(", P] : (we = ["brackets", Ze, P, N], P = N);
          break;
        }
        case e:
        case t: {
          Ue = W === e ? "'" : '"', N = P;
          do {
            if (pe = !1, N = z.indexOf(Ue, N + 1), N === -1)
              if (Q || ye) {
                N = P + 1;
                break;
              } else
                fe("string");
            for (_e = N; z.charCodeAt(_e - 1) === r; )
              _e -= 1, pe = !pe;
          } while (pe);
          we = ["string", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case w: {
          v.lastIndex = P + 1, v.test(z), v.lastIndex === 0 ? N = z.length - 1 : N = v.lastIndex - 2, we = ["at-word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case r: {
          for (N = P, me = !0; z.charCodeAt(N + 1) === r; )
            N += 1, me = !me;
          if (W = z.charCodeAt(N + 1), me && W !== n && W !== s && W !== i && W !== c && W !== l && W !== a && (N += 1, x.test(z.charAt(N)))) {
            for (; x.test(z.charAt(N + 1)); )
              N += 1;
            z.charCodeAt(N + 1) === s && (N += 1);
          }
          we = ["word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (N = z.indexOf("*/", P + 2) + 1, N === 0 && (Q || ye ? N = z.length : fe("comment")), we = ["comment", z.slice(P, N + 1), P, N], P = N) : (L.lastIndex = P + 1, L.test(z), L.lastIndex === 0 ? N = z.length - 1 : N = L.lastIndex - 2, we = ["word", z.slice(P, N + 1), P, N], K.push(we), P = N);
          break;
        }
      }
      return P++, we;
    }
    function gt(ce) {
      ie.push(ce);
    }
    return {
      back: gt,
      endOfFile: Re,
      nextToken: He,
      position: re
    };
  }, uo;
}
var po, Uc;
function Ta() {
  if (Uc) return po;
  Uc = 1;
  let e = tn();
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
  return po = t, t.default = t, e.registerAtRule(t), po;
}
var ho, Bc;
function si() {
  if (Bc) return ho;
  Bc = 1;
  let e = tn(), t, r;
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
          for (let p of l)
            p.raws.before = a.raws.before;
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
  }, ho = n, n.default = n, e.registerRoot(n), ho;
}
var fo, qc;
function Vd() {
  if (qc) return fo;
  qc = 1;
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
      let i = [], s = "", a = !1, c = 0, l = !1, p = "", o = !1;
      for (let h of t)
        o ? o = !1 : h === "\\" ? o = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (s !== "" && i.push(s.trim()), s = "", a = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return fo = e, e.default = e, fo;
}
var mo, Wc;
function Aa() {
  if (Wc) return mo;
  Wc = 1;
  let e = tn(), t = Vd();
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
  return mo = r, r.default = r, e.registerRule(r), mo;
}
var go, jc;
function Zb() {
  if (jc) return go;
  jc = 1;
  let e = os(), t = Jb(), r = ls(), n = Ta(), i = si(), s = Aa();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let o = p.length - 1; o >= 0; o--) {
      let h = p[o], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let d, u, m, f = !1, y = !1, M = [], w = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), d = o[0], d === "(" || d === "[" ? w.push(d === "(" ? ")" : "]") : d === "{" && w.length > 0 ? w.push("}") : d === w[w.length - 1] && w.pop(), w.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            y = !0;
            break;
          } else if (d === "}") {
            if (M.length > 0) {
              for (m = M.length - 1, u = M[m]; u && u[0] === "space"; )
                u = M[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            M.push(o);
        else
          M.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(M), M.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(M), this.raw(h, "params", M), f && (o = M[M.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = o[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(o) {
      let h = 0, d, u, m;
      for (let [f, y] of o.entries()) {
        if (d = y, u = d[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
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
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let d = o[1].slice(2, -2);
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
    decl(o, h) {
      let d = new e();
      this.init(d, o[0][2]);
      let u = o[o.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, o.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(o)
      ), d.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), d.raws.before += o.shift()[1];
      for (d.source.start = this.getPosition(o[0][2]), d.prop = ""; o.length; ) {
        let w = o[0][0];
        if (w === ":" || w === "space" || w === "comment")
          break;
        d.prop += o.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let w = o.length - 1; w >= 0; w--) {
        if (m = o[w], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(o, w);
          v = this.spacesFromEnd(o) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = o.slice(0), L = "";
          for (let S = w; S > 0; S--) {
            let x = v[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = v.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = L, o = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((w) => w[0] !== "space" && w[0] !== "comment") && (d.raws.between += f.map((w) => w[1]).join(""), f = []), this.raw(d, "value", f.concat(o), h), d.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, d = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), M = [], w = o;
      for (; w; ) {
        if (d = w[0], M.push(w), d === "(" || d === "[")
          m || (m = w), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = w), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(M);
            return;
          } else if (d === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        w = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; M.length && (w = M[M.length - 1][0], !(w !== "space" && w !== "comment")); )
            this.tokenizer.back(M.pop());
        this.decl(M, y);
      } else
        this.unknownWord(M);
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
    raw(o, h, d, u) {
      let m, f, y = d.length, M = "", w = !0, v, L;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? w = !1 : f === "comment" ? (L = d[S - 1] ? d[S - 1][0] : "empty", v = d[S + 1] ? d[S + 1][0] : "empty", !a[L] && !a[v] ? M.slice(-1) === "," ? w = !1 : M += m[1] : w = !1) : M += m[1];
      if (!w) {
        let S = d.reduce((x, T) => x + T[1], "");
        o.raws[h] = { raw: S, value: M };
      }
      o[h] = M;
    }
    rule(o) {
      o.pop();
      let h = new s();
      this.init(h, o[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(o), this.raw(h, "selector", o), this.current = h;
    }
    spacesAndCommentsFromEnd(o) {
      let h, d = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = o.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, d = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        d += o.shift()[1];
      return d;
    }
    spacesFromEnd(o) {
      let h, d = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        d = o.pop()[1] + d;
      return d;
    }
    stringFrom(o, h) {
      let d = "";
      for (let u = h; u < o.length; u++)
        d += o[u][1];
      return o.splice(h, o.length - h), d;
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
  return go = l, go;
}
var yo, Hc;
function La() {
  if (Hc) return yo;
  Hc = 1;
  let e = tn(), t = Zb(), r = as();
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
  return yo = n, n.default = n, e.registerParse(n), yo;
}
var bo, Yc;
function Gd() {
  if (Yc) return bo;
  Yc = 1;
  let { isClean: e, my: t } = Ca(), r = jd(), n = is(), i = tn(), s = Ma(), a = Hd(), c = Ra(), l = La(), p = si();
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
  }, d = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(L) {
    return typeof L == "object" && typeof L.then == "function";
  }
  function f(L) {
    let S = !1, x = o[L.type];
    return L.type === "decl" ? S = L.prop.toLowerCase() : L.type === "atrule" && (S = L.name.toLowerCase()), S && L.append ? [
      x,
      x + "-" + S,
      u,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : L.append ? [x, u, x + "Exit"] : [x, x + "Exit"];
  }
  function y(L) {
    let S;
    return L.type === "document" ? S = ["Document", u, "DocumentExit"] : L.type === "root" ? S = ["Root", u, "RootExit"] : S = f(L), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: L,
      visitorIndex: 0,
      visitors: []
    };
  }
  function M(L) {
    return L[e] = !1, L.nodes && L.nodes.forEach((S) => M(S)), L;
  }
  let w = {};
  class v {
    constructor(S, x, T) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = M(x);
      else if (x instanceof v || x instanceof c)
        I = M(x.root), x.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = x.map);
      else {
        let F = l;
        T.syntax && (F = T.syntax.parse), T.parser && (F = T.parser), F.parse && (F = F.parse);
        try {
          I = F(x, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(S, I, T), this.helpers = { ...w, postcss: w, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(S) {
      return this.async().catch(S);
    }
    finally(S) {
      return this.async().then(S, S);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(S, x) {
      let T = this.result.lastPlugin;
      try {
        if (x && x.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = T.postcssPlugin, S.setMessage();
        else if (T.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = T.postcssPlugin, F = T.postcssVersion, z = this.result.processor.version, Q = F.split("."), W = z.split(".");
          (Q[0] !== W[0] || parseInt(Q[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + I + " uses " + F + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, T, I) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([x, I]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let T in x) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[T])
              if (typeof x[T] == "object")
                for (let I in x[T])
                  I === "*" ? S(x, T, x[T][I]) : S(
                    x,
                    T + "-" + I.toLowerCase(),
                    x[T][I]
                  );
              else typeof x[T] == "function" && S(x, T, x[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], T = this.runOnRoot(x);
        if (m(T))
          try {
            await T;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let x = [y(S)];
          for (; x.length > 0; ) {
            let T = this.visitTick(x);
            if (m(T))
              try {
                await T;
              } catch (I) {
                let F = x[x.length - 1].node;
                throw this.handleError(I, F);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let I = S.nodes.map(
                  (F) => T(F, this.helpers)
                );
                await Promise.all(I);
              } else
                await T(S, this.helpers);
            } catch (I) {
              throw this.handleError(I);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(S) {
      this.result.lastPlugin = S;
      try {
        if (typeof S == "object" && S.Once) {
          if (this.result.root.type === "document") {
            let x = this.result.root.nodes.map(
              (T) => S.Once(T, this.helpers)
            );
            return m(x[0]) ? Promise.all(x) : x;
          }
          return S.Once(this.result.root, this.helpers);
        } else if (typeof S == "function")
          return S(this.result.root, this.result);
      } catch (x) {
        throw this.handleError(x);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let S = this.result.opts, x = n;
      S.syntax && (x = S.syntax.stringify), S.stringifier && (x = S.stringifier), x.stringify && (x = x.stringify);
      let I = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let x = this.runOnRoot(S);
        if (m(x))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; )
          S[e] = !0, this.walkSync(S);
        if (this.listeners.OnceExit)
          if (S.type === "document")
            for (let x of S.nodes)
              this.visitSync(this.listeners.OnceExit, x);
          else
            this.visitSync(this.listeners.OnceExit, S);
      }
      return this.result;
    }
    then(S, x) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(S, x);
    }
    toString() {
      return this.css;
    }
    visitSync(S, x) {
      for (let [T, I] of S) {
        this.result.lastPlugin = T;
        let F;
        try {
          F = I(x, this.helpers);
        } catch (z) {
          throw this.handleError(z, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (m(F))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: T, visitors: I } = x;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (I.length > 0 && x.visitorIndex < I.length) {
        let [z, Q] = I[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === I.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return Q(T.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, T);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, Q;
        for (; Q = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !Q[e]) {
            Q[e] = !0, S.push(y(Q));
            return;
          }
        x.iterator = 0, delete T.indexes[z];
      }
      let F = x.events;
      for (; x.eventIndex < F.length; ) {
        let z = F[x.eventIndex];
        if (x.eventIndex += 1, z === u) {
          T.nodes && T.nodes.length && (T[e] = !0, x.iterator = T.getIterator());
          return;
        } else if (this.listeners[z]) {
          x.visitors = this.listeners[z];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let x = f(S);
      for (let T of x)
        if (T === u)
          S.nodes && S.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[T];
          if (I && this.visitSync(I, S.toProxy()))
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
  return v.registerPostcss = (L) => {
    w = L;
  }, bo = v, v.default = v, p.registerLazyResult(v), s.registerLazyResult(v), bo;
}
var ko, Vc;
function Qb() {
  if (Vc) return ko;
  Vc = 1;
  let e = jd(), t = is(), r = Hd(), n = La();
  const i = Ra();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
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
  return ko = s, s.default = s, ko;
}
var vo, Gc;
function ek() {
  if (Gc) return vo;
  Gc = 1;
  let e = Qb(), t = Gd(), r = Ma(), n = si();
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
  return vo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), vo;
}
var wo, Xc;
function tk() {
  if (Xc) return wo;
  Xc = 1;
  let e = os(), t = Wd(), r = ls(), n = Ta(), i = as(), s = si(), a = Aa();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: o, ...h } = l;
    if (o) {
      p = [];
      for (let d of o) {
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
  return wo = c, c.default = c, wo;
}
var xo, Kc;
function rk() {
  if (Kc) return xo;
  Kc = 1;
  let e = Ea(), t = os(), r = Gd(), n = tn(), i = ek(), s = is(), a = tk(), c = Ma(), l = Yd(), p = ls(), o = Ta(), h = Ra(), d = as(), u = La(), m = Vd(), f = Aa(), y = si(), M = ss();
  function w(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return w.plugin = function(L, S) {
    let x = !1;
    function T(...F) {
      console && console.warn && !x && (x = !0, console.warn(
        L + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        L + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...F);
      return z.postcssPlugin = L, z.postcssVersion = new i().version, z;
    }
    let I;
    return Object.defineProperty(T, "postcss", {
      get() {
        return I || (I = T()), I;
      }
    }), T.process = function(F, z, Q) {
      return w([T(Q)]).process(F, z);
    }, T;
  }, w.stringify = s, w.parse = u, w.fromJSON = a, w.list = m, w.comment = (v) => new p(v), w.atRule = (v) => new o(v), w.decl = (v) => new t(v), w.rule = (v) => new f(v), w.root = (v) => new y(v), w.document = (v) => new c(v), w.CssSyntaxError = e, w.Declaration = t, w.Container = n, w.Processor = i, w.Document = c, w.Comment = p, w.Warning = l, w.AtRule = o, w.Result = h, w.Input = d, w.Rule = f, w.Root = y, w.Node = M, r.registerPostcss(w), xo = w, w.default = w, xo;
}
var nk = rk();
const Ve = /* @__PURE__ */ Hb(nk);
Ve.stringify;
Ve.fromJSON;
Ve.plugin;
Ve.parse;
Ve.list;
Ve.document;
Ve.comment;
Ve.atRule;
Ve.rule;
Ve.decl;
Ve.root;
Ve.CssSyntaxError;
Ve.Declaration;
Ve.Container;
Ve.Processor;
Ve.Document;
Ve.Comment;
Ve.Warning;
Ve.AtRule;
Ve.Result;
Ve.Input;
Ve.Rule;
Ve.Root;
Ve.Node;
var ik = Object.defineProperty, sk = (e, t, r) => t in e ? ik(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, $t = (e, t, r) => sk(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function ok(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function ak(e) {
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
var Li = { exports: {} }, Jc;
function lk() {
  if (Jc) return Li.exports;
  Jc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Li.exports = t(), Li.exports.createColors = t, Li.exports;
}
const ck = {}, uk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ck
}, Symbol.toStringTag, { value: "Module" })), Kt = /* @__PURE__ */ ak(uk);
var So, Zc;
function _a() {
  if (Zc) return So;
  Zc = 1;
  let e = /* @__PURE__ */ lk(), t = Kt;
  class r extends Error {
    constructor(i, s, a, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof s < "u" && typeof a < "u" && (typeof s == "number" ? (this.line = s, this.column = a) : (this.line = s.line, this.column = s.column, this.endLine = a.line, this.endColumn = a.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let a = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, a.length), p = String(l).length, o, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        o = (f) => d(m(f)), h = (f) => u(f);
      } else
        o = h = (d) => d;
      return a.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + d + `
 ` + y + o("^");
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
  return So = r, r.default = r, So;
}
var _i = {}, Qc;
function Ia() {
  return Qc || (Qc = 1, _i.isClean = Symbol("isClean"), _i.my = Symbol("my")), _i;
}
var Eo, eu;
function Xd() {
  if (eu) return Eo;
  eu = 1;
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
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let o = 0; o < l; o++) a += p;
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
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, s !== c || a);
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
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[a] < "u")
        return p.rawCache[a];
      if (a === "before" || a === "after")
        return this.beforeAfter(i, a);
      {
        let o = "raw" + t(a);
        this[o] ? c = this[o](p, i) : p.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[a]), p.rawCache[a] = c, c;
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
  return Eo = r, r.default = r, Eo;
}
var Co, tu;
function cs() {
  if (tu) return Co;
  tu = 1;
  let e = Xd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Co = t, t.default = t, Co;
}
var Mo, ru;
function us() {
  if (ru) return Mo;
  ru = 1;
  let { isClean: e, my: t } = Ia(), r = _a(), n = Xd(), i = cs();
  function s(c, l) {
    let p = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], d = typeof h;
      o === "parent" && d === "object" ? l && (p[o] = l) : o === "source" ? p[o] = h : Array.isArray(h) ? p[o] = h.map((u) => s(u, p)) : (d === "object" && h !== null && (h = s(h)), p[o] = h);
    }
    return p;
  }
  class a {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let o of l[p])
            typeof o.clone == "function" ? this.append(o.clone()) : this.append(o);
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
      let p = s(this);
      for (let o in l)
        p[o] = l[o];
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
        let { end: o, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: o.column, line: o.line },
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
        set(l, p, o) {
          return l[p] === o || (l[p] = o, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
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
      let o = this.source.start;
      if (l.index)
        o = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (o = this.positionInside(h, p));
      }
      return o;
    }
    positionInside(l, p) {
      let o = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        o[u] === `
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
      }, o = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), o = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? o = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? o = this.positionInside(l.endIndex) : l.index && (o = this.positionInside(l.index + 1));
      return (o.line < p.line || o.line === p.line && o.column <= p.column) && (o = { column: p.column + 1, line: p.line }), { end: o, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, o = !1;
        for (let h of l)
          h === this ? o = !0 : o ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
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
    toJSON(l, p) {
      let o = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          o[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          o[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), o[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[u] = m;
      }
      return h && (o.inputs = [...p.keys()].map((u) => u.toJSON())), o;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (o) => {
        p += o;
      }), p;
    }
    warn(l, p, o) {
      let h = { node: this };
      for (let d in o) h[d] = o[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Mo = a, a.default = a, Mo;
}
var Ro, nu;
function ds() {
  if (nu) return Ro;
  nu = 1;
  let e = us();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ro = t, t.default = t, Ro;
}
var To, iu;
function dk() {
  if (iu) return To;
  iu = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return To = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, To;
}
var Ao, su;
function Kd() {
  if (su) return Ao;
  su = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { existsSync: r, readFileSync: n } = Kt, { dirname: i, join: s } = Kt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, o) {
      if (o.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, d = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (o.test(p) || h.test(p))
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
      let o = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!o) return;
      let h = p.lastIndexOf(o.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, o) {
      if (o === !1) return !1;
      if (o) {
        if (typeof o == "string")
          return o;
        if (typeof o == "function") {
          let h = o(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
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
          return p && (h = s(i(p), h)), this.loadFile(h);
        }
      }
    }
    startWith(p, o) {
      return p ? p.substr(0, o.length) === o : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Ao = c, c.default = c, Ao;
}
var Lo, ou;
function ps() {
  if (ou) return Lo;
  ou = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { fileURLToPath: r, pathToFileURL: n } = Kt, { isAbsolute: i, resolve: s } = Kt, { nanoid: a } = /* @__PURE__ */ dk(), c = Kt, l = _a(), p = Kd(), o = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let M = new p(this.css, y);
        if (M.text) {
          this.map = M;
          let w = M.consumer().file;
          !this.file && w && (this.file = this.mapResolve(w));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, w = {}) {
      let v, L, S;
      if (y && typeof y == "object") {
        let T = y, I = M;
        if (typeof T.offset == "number") {
          let F = this.fromOffset(T.offset);
          y = F.line, M = F.col;
        } else
          y = T.line, M = T.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          L = F.line, S = F.col;
        } else
          L = I.line, S = I.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? v = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        w.plugin
      ) : v = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        w.plugin
      ), v.input = { column: M, endColumn: S, endLine: L, line: y, source: this.css }, this.file && (n && (v.input.url = n(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let y, M;
      if (this[o])
        M = this[o];
      else {
        let v = this.css.split(`
`);
        M = new Array(v.length);
        let L = 0;
        for (let S = 0, x = v.length; S < x; S++)
          M[S] = L, L += v[S].length + 1;
        this[o] = M;
      }
      y = M[M.length - 1];
      let w = 0;
      if (f >= y)
        w = M.length - 1;
      else {
        let v = M.length - 2, L;
        for (; w < v; )
          if (L = w + (v - w >> 1), f < M[L])
            v = L - 1;
          else if (f >= M[L + 1])
            w = L + 1;
          else {
            w = L;
            break;
          }
      }
      return {
        col: f - M[w] + 1,
        line: w + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, w) {
      if (!this.map) return !1;
      let v = this.map.consumer(), L = v.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = v.originalPositionFor({ column: w, line: M }));
      let x;
      i(L.source) ? x = n(L.source) : x = new URL(
        L.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let T = {
        column: L.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: L.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          T.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = v.sourceContentFor(L.source);
      return I && (T.source = I), T;
    }
    toJSON() {
      let f = {};
      for (let y of ["hasBOM", "css", "file", "id"])
        this[y] != null && (f[y] = this[y]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return Lo = u, u.default = u, c && c.registerInput && c.registerInput(u), Lo;
}
var _o, au;
function Jd() {
  if (au) return _o;
  au = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { dirname: r, relative: n, resolve: i, sep: s } = Kt, { pathToFileURL: a } = Kt, c = ps(), l = !!(e && t), p = !!(r && i && n && s);
  class o {
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
      }, y, M;
      this.stringify(this.root, (w, v, L) => {
        if (this.css += w, v && L !== "end" && (f.generated.line = d, f.generated.column = u - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = w.match(/\n/g), y ? (d += y.length, M = w.lastIndexOf(`
`), u = w.length - M) : u += w.length, v && L !== "start") {
          let S = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== S.last || S.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      s === "\\" && (d = d.replace(/\\/g, "/"));
      let m = encodeURI(d).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(d, m), m;
    }
  }
  return _o = o, _o;
}
var Io, lu;
function hs() {
  if (lu) return Io;
  lu = 1;
  let e = us();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Io = t, t.default = t, Io;
}
var Oo, cu;
function rn() {
  if (cu) return Oo;
  cu = 1;
  let { isClean: e, my: t } = Ia(), r = ds(), n = hs(), i = us(), s, a, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function o(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        o(u);
  }
  class h extends i {
    append(...u) {
      for (let m of u) {
        let f = this.normalize(m, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(u) {
      if (super.cleanRaws(u), this.nodes)
        for (let m of this.nodes) m.cleanRaws(u);
    }
    each(u) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, y;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], y = u(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], y;
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
            ...f.map((y) => typeof y == "function" ? (M, w) => y(M.toProxy(), w) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...M) => f(y.toProxy(), ...M)
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
      let f = this.index(u), y = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(u);
      for (let w of y) this.proxyOf.nodes.splice(f + 1, 0, w);
      let M;
      for (let w in this.indexes)
        M = this.indexes[w], f < M && (this.indexes[w] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, M = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let v of M) this.proxyOf.nodes.splice(f, 0, v);
      let w;
      for (let v in this.indexes)
        w = this.indexes[v], f <= w && (this.indexes[v] = w + M.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = p(s(u).nodes);
      else if (typeof u > "u")
        u = [];
      else if (Array.isArray(u)) {
        u = u.slice(0);
        for (let y of u)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (u.type === "root" && this.type !== "document") {
        u = u.nodes.slice(0);
        for (let y of u)
          y.parent && y.parent.removeChild(y, "ignore");
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
      return u.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...u) {
      u = u.reverse();
      for (let m of u) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
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
      return f || (f = m, m = {}), this.walkDecls((y) => {
        m.props && !m.props.includes(y.prop) || m.fast && !y.value.includes(m.fast) || (y.value = y.value.replace(u, f));
      }), this.markDirty(), this;
    }
    some(u) {
      return this.nodes.some(u);
    }
    walk(u) {
      return this.each((m, f) => {
        let y;
        try {
          y = u(m, f);
        } catch (M) {
          throw m.addToError(M);
        }
        return y !== !1 && m.walk && (y = m.walk(u)), y;
      });
    }
    walkAtRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && u.test(f.name))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "atrule")
          return m(f, y);
      }));
    }
    walkComments(u) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return u(m, f);
      });
    }
    walkDecls(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && u.test(f.prop))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "decl")
          return m(f, y);
      }));
    }
    walkRules(u, m) {
      return m ? u instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && u.test(f.selector))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === u)
          return m(f, y);
      }) : (m = u, this.walk((f, y) => {
        if (f.type === "rule")
          return m(f, y);
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
    s = d;
  }, h.registerRule = (d) => {
    a = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, Oo = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Oo;
}
var No, uu;
function Oa() {
  if (uu) return No;
  uu = 1;
  let e = rn(), t, r;
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
  }, No = n, n.default = n, No;
}
var Po, du;
function Zd() {
  if (du) return Po;
  du = 1;
  let e = {};
  return Po = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Po;
}
var zo, pu;
function Qd() {
  if (pu) return zo;
  pu = 1;
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
  return zo = e, e.default = e, zo;
}
var $o, hu;
function Na() {
  if (hu) return $o;
  hu = 1;
  let e = Qd();
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
  return $o = t, t.default = t, $o;
}
var Do, fu;
function pk() {
  if (fu) return Do;
  fu = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, M = 58, w = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return Do = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, W, N, Ue, Ze, me, pe, _e, We, Ie, we, Xe = z.length, P = 0, K = [], ie = [];
    function re() {
      return P;
    }
    function fe(ce) {
      throw I.error("Unclosed " + ce, P);
    }
    function Re() {
      return ie.length === 0 && P >= Xe;
    }
    function He(ce) {
      if (ie.length) return ie.pop();
      if (P >= Xe) return;
      let ye = ce ? ce.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          N = P;
          do
            N += 1, W = z.charCodeAt(N);
          while (W === s || W === i || W === c || W === l || W === a);
          we = ["space", z.slice(P, N)], P = N - 1;
          break;
        }
        case p:
        case o:
        case u:
        case m:
        case M:
        case f:
        case d: {
          let Ce = String.fromCharCode(W);
          we = [Ce, Ce, P];
          break;
        }
        case h: {
          if (We = K.length ? K.pop()[1] : "", Ie = z.charCodeAt(P + 1), We === "url" && Ie !== e && Ie !== t && Ie !== s && Ie !== i && Ie !== c && Ie !== a && Ie !== l) {
            N = P;
            do {
              if (pe = !1, N = z.indexOf(")", N + 1), N === -1)
                if (Q || ye) {
                  N = P;
                  break;
                } else
                  fe("bracket");
              for (_e = N; z.charCodeAt(_e - 1) === r; )
                _e -= 1, pe = !pe;
            } while (pe);
            we = ["brackets", z.slice(P, N + 1), P, N], P = N;
          } else
            N = z.indexOf(")", P + 1), Ze = z.slice(P, N + 1), N === -1 || S.test(Ze) ? we = ["(", "(", P] : (we = ["brackets", Ze, P, N], P = N);
          break;
        }
        case e:
        case t: {
          Ue = W === e ? "'" : '"', N = P;
          do {
            if (pe = !1, N = z.indexOf(Ue, N + 1), N === -1)
              if (Q || ye) {
                N = P + 1;
                break;
              } else
                fe("string");
            for (_e = N; z.charCodeAt(_e - 1) === r; )
              _e -= 1, pe = !pe;
          } while (pe);
          we = ["string", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case w: {
          v.lastIndex = P + 1, v.test(z), v.lastIndex === 0 ? N = z.length - 1 : N = v.lastIndex - 2, we = ["at-word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case r: {
          for (N = P, me = !0; z.charCodeAt(N + 1) === r; )
            N += 1, me = !me;
          if (W = z.charCodeAt(N + 1), me && W !== n && W !== s && W !== i && W !== c && W !== l && W !== a && (N += 1, x.test(z.charAt(N)))) {
            for (; x.test(z.charAt(N + 1)); )
              N += 1;
            z.charCodeAt(N + 1) === s && (N += 1);
          }
          we = ["word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (N = z.indexOf("*/", P + 2) + 1, N === 0 && (Q || ye ? N = z.length : fe("comment")), we = ["comment", z.slice(P, N + 1), P, N], P = N) : (L.lastIndex = P + 1, L.test(z), L.lastIndex === 0 ? N = z.length - 1 : N = L.lastIndex - 2, we = ["word", z.slice(P, N + 1), P, N], K.push(we), P = N);
          break;
        }
      }
      return P++, we;
    }
    function gt(ce) {
      ie.push(ce);
    }
    return {
      back: gt,
      endOfFile: Re,
      nextToken: He,
      position: re
    };
  }, Do;
}
var Fo, mu;
function Pa() {
  if (mu) return Fo;
  mu = 1;
  let e = rn();
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
  return Fo = t, t.default = t, e.registerAtRule(t), Fo;
}
var Uo, gu;
function oi() {
  if (gu) return Uo;
  gu = 1;
  let e = rn(), t, r;
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
          for (let p of l)
            p.raws.before = a.raws.before;
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
  }, Uo = n, n.default = n, e.registerRoot(n), Uo;
}
var Bo, yu;
function ep() {
  if (yu) return Bo;
  yu = 1;
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
      let i = [], s = "", a = !1, c = 0, l = !1, p = "", o = !1;
      for (let h of t)
        o ? o = !1 : h === "\\" ? o = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (a = !0), a ? (s !== "" && i.push(s.trim()), s = "", a = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return Bo = e, e.default = e, Bo;
}
var qo, bu;
function za() {
  if (bu) return qo;
  bu = 1;
  let e = rn(), t = ep();
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
  return qo = r, r.default = r, e.registerRule(r), qo;
}
var Wo, ku;
function hk() {
  if (ku) return Wo;
  ku = 1;
  let e = ds(), t = pk(), r = hs(), n = Pa(), i = oi(), s = za();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let o = p.length - 1; o >= 0; o--) {
      let h = p[o], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let d, u, m, f = !1, y = !1, M = [], w = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), d = o[0], d === "(" || d === "[" ? w.push(d === "(" ? ")" : "]") : d === "{" && w.length > 0 ? w.push("}") : d === w[w.length - 1] && w.pop(), w.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            y = !0;
            break;
          } else if (d === "}") {
            if (M.length > 0) {
              for (m = M.length - 1, u = M[m]; u && u[0] === "space"; )
                u = M[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            M.push(o);
        else
          M.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(M), M.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(M), this.raw(h, "params", M), f && (o = M[M.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = o[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(o) {
      let h = 0, d, u, m;
      for (let [f, y] of o.entries()) {
        if (d = y, u = d[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
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
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let d = o[1].slice(2, -2);
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
    decl(o, h) {
      let d = new e();
      this.init(d, o[0][2]);
      let u = o[o.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, o.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(o)
      ), d.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), d.raws.before += o.shift()[1];
      for (d.source.start = this.getPosition(o[0][2]), d.prop = ""; o.length; ) {
        let w = o[0][0];
        if (w === ":" || w === "space" || w === "comment")
          break;
        d.prop += o.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let w = o.length - 1; w >= 0; w--) {
        if (m = o[w], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let v = this.stringFrom(o, w);
          v = this.spacesFromEnd(o) + v, v !== " !important" && (d.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = o.slice(0), L = "";
          for (let S = w; S > 0; S--) {
            let x = v[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = v.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = L, o = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((w) => w[0] !== "space" && w[0] !== "comment") && (d.raws.between += f.map((w) => w[1]).join(""), f = []), this.raw(d, "value", f.concat(o), h), d.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, d = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), M = [], w = o;
      for (; w; ) {
        if (d = w[0], M.push(w), d === "(" || d === "[")
          m || (m = w), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = w), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(M);
            return;
          } else if (d === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        w = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; M.length && (w = M[M.length - 1][0], !(w !== "space" && w !== "comment")); )
            this.tokenizer.back(M.pop());
        this.decl(M, y);
      } else
        this.unknownWord(M);
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
    raw(o, h, d, u) {
      let m, f, y = d.length, M = "", w = !0, v, L;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? w = !1 : f === "comment" ? (L = d[S - 1] ? d[S - 1][0] : "empty", v = d[S + 1] ? d[S + 1][0] : "empty", !a[L] && !a[v] ? M.slice(-1) === "," ? w = !1 : M += m[1] : w = !1) : M += m[1];
      if (!w) {
        let S = d.reduce((x, T) => x + T[1], "");
        o.raws[h] = { raw: S, value: M };
      }
      o[h] = M;
    }
    rule(o) {
      o.pop();
      let h = new s();
      this.init(h, o[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(o), this.raw(h, "selector", o), this.current = h;
    }
    spacesAndCommentsFromEnd(o) {
      let h, d = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = o.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, d = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        d += o.shift()[1];
      return d;
    }
    spacesFromEnd(o) {
      let h, d = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        d = o.pop()[1] + d;
      return d;
    }
    stringFrom(o, h) {
      let d = "";
      for (let u = h; u < o.length; u++)
        d += o[u][1];
      return o.splice(h, o.length - h), d;
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
  return Wo = l, Wo;
}
var jo, vu;
function $a() {
  if (vu) return jo;
  vu = 1;
  let e = rn(), t = hk(), r = ps();
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
  return jo = n, n.default = n, e.registerParse(n), jo;
}
var Ho, wu;
function tp() {
  if (wu) return Ho;
  wu = 1;
  let { isClean: e, my: t } = Ia(), r = Jd(), n = cs(), i = rn(), s = Oa(), a = Zd(), c = Na(), l = $a(), p = oi();
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
  }, d = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(L) {
    return typeof L == "object" && typeof L.then == "function";
  }
  function f(L) {
    let S = !1, x = o[L.type];
    return L.type === "decl" ? S = L.prop.toLowerCase() : L.type === "atrule" && (S = L.name.toLowerCase()), S && L.append ? [
      x,
      x + "-" + S,
      u,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : L.append ? [x, u, x + "Exit"] : [x, x + "Exit"];
  }
  function y(L) {
    let S;
    return L.type === "document" ? S = ["Document", u, "DocumentExit"] : L.type === "root" ? S = ["Root", u, "RootExit"] : S = f(L), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: L,
      visitorIndex: 0,
      visitors: []
    };
  }
  function M(L) {
    return L[e] = !1, L.nodes && L.nodes.forEach((S) => M(S)), L;
  }
  let w = {};
  class v {
    constructor(S, x, T) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = M(x);
      else if (x instanceof v || x instanceof c)
        I = M(x.root), x.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = x.map);
      else {
        let F = l;
        T.syntax && (F = T.syntax.parse), T.parser && (F = T.parser), F.parse && (F = F.parse);
        try {
          I = F(x, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(S, I, T), this.helpers = { ...w, postcss: w, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(S) {
      return this.async().catch(S);
    }
    finally(S) {
      return this.async().then(S, S);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(S, x) {
      let T = this.result.lastPlugin;
      try {
        if (x && x.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = T.postcssPlugin, S.setMessage();
        else if (T.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = T.postcssPlugin, F = T.postcssVersion, z = this.result.processor.version, Q = F.split("."), W = z.split(".");
          (Q[0] !== W[0] || parseInt(Q[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + I + " uses " + F + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, T, I) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([x, I]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let T in x) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[T])
              if (typeof x[T] == "object")
                for (let I in x[T])
                  I === "*" ? S(x, T, x[T][I]) : S(
                    x,
                    T + "-" + I.toLowerCase(),
                    x[T][I]
                  );
              else typeof x[T] == "function" && S(x, T, x[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], T = this.runOnRoot(x);
        if (m(T))
          try {
            await T;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let x = [y(S)];
          for (; x.length > 0; ) {
            let T = this.visitTick(x);
            if (m(T))
              try {
                await T;
              } catch (I) {
                let F = x[x.length - 1].node;
                throw this.handleError(I, F);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let I = S.nodes.map(
                  (F) => T(F, this.helpers)
                );
                await Promise.all(I);
              } else
                await T(S, this.helpers);
            } catch (I) {
              throw this.handleError(I);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(S) {
      this.result.lastPlugin = S;
      try {
        if (typeof S == "object" && S.Once) {
          if (this.result.root.type === "document") {
            let x = this.result.root.nodes.map(
              (T) => S.Once(T, this.helpers)
            );
            return m(x[0]) ? Promise.all(x) : x;
          }
          return S.Once(this.result.root, this.helpers);
        } else if (typeof S == "function")
          return S(this.result.root, this.result);
      } catch (x) {
        throw this.handleError(x);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let S = this.result.opts, x = n;
      S.syntax && (x = S.syntax.stringify), S.stringifier && (x = S.stringifier), x.stringify && (x = x.stringify);
      let I = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = I[0], this.result.map = I[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let x = this.runOnRoot(S);
        if (m(x))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; )
          S[e] = !0, this.walkSync(S);
        if (this.listeners.OnceExit)
          if (S.type === "document")
            for (let x of S.nodes)
              this.visitSync(this.listeners.OnceExit, x);
          else
            this.visitSync(this.listeners.OnceExit, S);
      }
      return this.result;
    }
    then(S, x) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(S, x);
    }
    toString() {
      return this.css;
    }
    visitSync(S, x) {
      for (let [T, I] of S) {
        this.result.lastPlugin = T;
        let F;
        try {
          F = I(x, this.helpers);
        } catch (z) {
          throw this.handleError(z, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (m(F))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: T, visitors: I } = x;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (I.length > 0 && x.visitorIndex < I.length) {
        let [z, Q] = I[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === I.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return Q(T.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, T);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, Q;
        for (; Q = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !Q[e]) {
            Q[e] = !0, S.push(y(Q));
            return;
          }
        x.iterator = 0, delete T.indexes[z];
      }
      let F = x.events;
      for (; x.eventIndex < F.length; ) {
        let z = F[x.eventIndex];
        if (x.eventIndex += 1, z === u) {
          T.nodes && T.nodes.length && (T[e] = !0, x.iterator = T.getIterator());
          return;
        } else if (this.listeners[z]) {
          x.visitors = this.listeners[z];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let x = f(S);
      for (let T of x)
        if (T === u)
          S.nodes && S.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[T];
          if (I && this.visitSync(I, S.toProxy()))
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
  return v.registerPostcss = (L) => {
    w = L;
  }, Ho = v, v.default = v, p.registerLazyResult(v), s.registerLazyResult(v), Ho;
}
var Yo, xu;
function fk() {
  if (xu) return Yo;
  xu = 1;
  let e = Jd(), t = cs(), r = Zd(), n = $a();
  const i = Na();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
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
  return Yo = s, s.default = s, Yo;
}
var Vo, Su;
function mk() {
  if (Su) return Vo;
  Su = 1;
  let e = fk(), t = tp(), r = Oa(), n = oi();
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
  return Vo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Vo;
}
var Go, Eu;
function gk() {
  if (Eu) return Go;
  Eu = 1;
  let e = ds(), t = Kd(), r = hs(), n = Pa(), i = ps(), s = oi(), a = za();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: o, ...h } = l;
    if (o) {
      p = [];
      for (let d of o) {
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
  return Go = c, c.default = c, Go;
}
var Xo, Cu;
function yk() {
  if (Cu) return Xo;
  Cu = 1;
  let e = _a(), t = ds(), r = tp(), n = rn(), i = mk(), s = cs(), a = gk(), c = Oa(), l = Qd(), p = hs(), o = Pa(), h = Na(), d = ps(), u = $a(), m = ep(), f = za(), y = oi(), M = us();
  function w(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new i(v);
  }
  return w.plugin = function(L, S) {
    let x = !1;
    function T(...F) {
      console && console.warn && !x && (x = !0, console.warn(
        L + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        L + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...F);
      return z.postcssPlugin = L, z.postcssVersion = new i().version, z;
    }
    let I;
    return Object.defineProperty(T, "postcss", {
      get() {
        return I || (I = T()), I;
      }
    }), T.process = function(F, z, Q) {
      return w([T(Q)]).process(F, z);
    }, T;
  }, w.stringify = s, w.parse = u, w.fromJSON = a, w.list = m, w.comment = (v) => new p(v), w.atRule = (v) => new o(v), w.decl = (v) => new t(v), w.rule = (v) => new f(v), w.root = (v) => new y(v), w.document = (v) => new c(v), w.CssSyntaxError = e, w.Declaration = t, w.Container = n, w.Processor = i, w.Document = c, w.Comment = p, w.Warning = l, w.AtRule = o, w.Result = h, w.Input = d, w.Rule = f, w.Root = y, w.Node = M, r.registerPostcss(w), Xo = w, w.default = w, Xo;
}
var bk = yk();
const Ge = /* @__PURE__ */ ok(bk);
Ge.stringify;
Ge.fromJSON;
Ge.plugin;
Ge.parse;
Ge.list;
Ge.document;
Ge.comment;
Ge.atRule;
Ge.rule;
Ge.decl;
Ge.root;
Ge.CssSyntaxError;
Ge.Declaration;
Ge.Container;
Ge.Processor;
Ge.Document;
Ge.Comment;
Ge.Warning;
Ge.AtRule;
Ge.Result;
Ge.Input;
Ge.Rule;
Ge.Root;
Ge.Node;
class Da {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    $t(this, "parentElement", null), $t(this, "parentNode", null), $t(this, "ownerDocument"), $t(this, "firstChild", null), $t(this, "lastChild", null), $t(this, "previousSibling", null), $t(this, "nextSibling", null), $t(this, "ELEMENT_NODE", 1), $t(this, "TEXT_NODE", 3), $t(this, "nodeType"), $t(this, "nodeName"), $t(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Da) {
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
const Mu = {
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
}, Ru = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ii = {}, rp = {}, kk = () => !!globalThis.Zone;
function Fa(e) {
  if (Ii[e])
    return Ii[e];
  const t = globalThis[e], r = t.prototype, n = e in Mu ? Mu[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in Ru ? Ru[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !kk())
    return Ii[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), rp[e] = () => c.remove()) : c.remove(), Ii[e] = p;
  } catch {
    return r;
  }
}
const Ko = {};
function fr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ko[i])
    return Ko[i].call(
      t
    );
  const s = Fa(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Ko[i] = a, a.call(t)) : t[r];
}
const Jo = {};
function np(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Jo[n])
    return Jo[n].bind(
      t
    );
  const s = Fa(e)[r];
  return typeof s != "function" ? t[r] : (Jo[n] = s, s.bind(t));
}
function vk(e) {
  return fr("Node", e, "ownerDocument");
}
function wk(e) {
  return fr("Node", e, "childNodes");
}
function xk(e) {
  return fr("Node", e, "parentNode");
}
function Sk(e) {
  return fr("Node", e, "parentElement");
}
function Ek(e) {
  return fr("Node", e, "textContent");
}
function Ck(e, t) {
  return np("Node", e, "contains")(t);
}
function Mk(e) {
  return np("Node", e, "getRootNode")();
}
function Rk(e) {
  return !e || !("host" in e) ? null : fr("ShadowRoot", e, "host");
}
function Tk(e) {
  return e.styleSheets;
}
function Ak(e) {
  return !e || !("shadowRoot" in e) ? null : fr("Element", e, "shadowRoot");
}
function Lk(e, t) {
  return fr("Element", e, "querySelector")(t);
}
function _k(e, t) {
  return fr("Element", e, "querySelectorAll")(t);
}
function ip() {
  return [
    Fa("MutationObserver").constructor,
    rp.MutationObserver ?? (() => {
    })
  ];
}
let ri = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (ri = () => (/* @__PURE__ */ new Date()).getTime());
function nn(e, t, r) {
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
const ve = {
  ownerDocument: vk,
  childNodes: wk,
  parentNode: xk,
  parentElement: Sk,
  textContent: Ek,
  contains: Ck,
  getRootNode: Mk,
  host: Rk,
  styleSheets: Tk,
  shadowRoot: Ak,
  querySelector: Lk,
  querySelectorAll: _k,
  nowTimestamp: ri,
  mutationObserverCtor: ip,
  patch: nn
};
function wt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const wn = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Tu = {
  map: {},
  getId() {
    return console.error(wn), -1;
  },
  getNode() {
    return console.error(wn), null;
  },
  removeNodeFromMap() {
    console.error(wn);
  },
  has() {
    return console.error(wn), !1;
  },
  reset() {
    console.error(wn);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Tu = new Proxy(Tu, {
  get(e, t, r) {
    return t === "map" && console.error(wn), Reflect.get(e, t, r);
  }
}));
function ni(e, t, r = {}) {
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
function fs(e, t, r, n, i = window) {
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
  ), () => fs(e, t, s || {}, !0);
}
function sp(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = ve.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = ve.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function op() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function ap() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function lp(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ve.parentElement(e) : null;
}
function xt(e, t, r, n) {
  if (!e)
    return !1;
  const i = lp(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Xi(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Ik(e, t) {
  return t.getId(e) !== -1;
}
function Zo(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === ti;
}
function cp(e, t) {
  if (Xn(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ve.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? cp(n, t) : !0;
}
function ua(e) {
  return !!e.changedTouches;
}
function Ok(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function up(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function dp(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function da(e) {
  return e ? e instanceof Da && "shadowRoot" in e ? !!e.shadowRoot : !!ve.shadowRoot(e) : !1;
}
class Nk {
  constructor() {
    V(this, "id", 1), V(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), V(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function pp(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ve.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ve.host(ve.getRootNode(e)) && (r = ve.host(ve.getRootNode(e))), r;
}
function Pk(e) {
  let t = e, r;
  for (; r = pp(t); )
    t = r;
  return t;
}
function zk(e) {
  const t = ve.ownerDocument(e);
  if (!t) return !1;
  const r = Pk(e);
  return ve.contains(t, r);
}
function hp(e) {
  const t = ve.ownerDocument(e);
  return t ? ve.contains(t, e) || zk(e) : !1;
}
var Ae = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ae || {}), Me = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(Me || {}), Rt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Rt || {}), ur = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(ur || {}), Pn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Pn || {}), xn = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(xn || {}), fp = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(fp || {});
function Au(e) {
  return "__ln" in e;
}
class $k {
  constructor() {
    V(this, "length", 0), V(this, "head", null), V(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && Au(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Au(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Lu = (e, t) => `${e}@${t}`;
class Dk {
  constructor() {
    V(this, "frozen", !1), V(this, "locked", !1), V(this, "texts", []), V(this, "attributes", []), V(this, "attributeMap", /* @__PURE__ */ new WeakMap()), V(this, "removes", []), V(this, "mapRemoves", []), V(this, "movedMap", {}), V(this, "addedSet", /* @__PURE__ */ new Set()), V(this, "movedSet", /* @__PURE__ */ new Set()), V(this, "droppedSet", /* @__PURE__ */ new Set()), V(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), V(this, "mutationCb"), V(this, "blockClass"), V(this, "blockSelector"), V(this, "maskTextClass"), V(this, "maskTextSelector"), V(this, "inlineStylesheet"), V(this, "maskInputOptions"), V(this, "maskTextFn"), V(this, "maskInputFn"), V(this, "keepIframeSrcFn"), V(this, "recordCanvas"), V(this, "inlineImages"), V(this, "slimDOMOptions"), V(this, "dataURLOptions"), V(this, "doc"), V(this, "mirror"), V(this, "iframeManager"), V(this, "stylesheetManager"), V(this, "shadowDomManager"), V(this, "canvasManager"), V(this, "processedNodeManager"), V(this, "unattachedDoc"), V(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), V(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new $k(), i = (l) => {
        let p = l, o = ti;
        for (; o === ti; )
          p = p && p.nextSibling, o = p && this.mirror.getId(p);
        return o;
      }, s = (l) => {
        const p = ve.parentNode(l);
        if (!p || !hp(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (o = !0);
        }
        const h = Xn(p) ? this.mirror.getId(pp(l)) : this.mirror.getId(p), d = i(l);
        if (h === -1 || d === -1)
          return n.addNode(l);
        const u = En(l, {
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
            up(m, this.mirror) && this.iframeManager.addIframe(m), dp(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), da(l) && this.shadowDomManager.addShadowRoot(ve.shadowRoot(l), this.doc);
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
          nextId: d,
          node: u
        }), r.add(u.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        _u(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(ve.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Iu(this.droppedSet, l) && !_u(this.removesSubTreeCache, l, this.mirror) || Iu(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const p = this.mirror.getId(ve.parentNode(a.value)), o = i(a.value);
          p !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let p = n.tail;
          for (; p; ) {
            const o = p;
            if (p = p.previous, o) {
              const h = this.mirror.getId(ve.parentNode(o.value));
              if (i(o.value) === -1) continue;
              if (h !== -1) {
                l = o;
                break;
              } else {
                const u = o.value, m = ve.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = ve.host(m);
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
          const p = l.node, o = ve.parentNode(p);
          return o && o.tagName === "TEXTAREA" && this.genTextAreaValueMutation(o), {
            id: this.mirror.getId(p),
            value: l.value
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => {
          const { attributes: p } = l;
          if (typeof p.style == "string") {
            const o = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
            o.length < p.style.length && (o + h).split("var(").length === p.style.split("var(").length && (p.style = l.styleDiff);
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
    }), V(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        ve.childNodes(t),
        (i) => ve.textContent(i) || ""
      ).join("");
      r.attributes.value = Yi({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Vi(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), V(this, "processMutation", (t) => {
      if (!Zo(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ve.textContent(t.target);
            !xt(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Ud(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, lp(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Vi(r);
              i = Yi({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (xt(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Fd(r.tagName, n))
              if (s.attributes[n] = Dd(
                this.doc,
                Qr(r.tagName),
                Qr(n),
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
                  l !== a.style.getPropertyValue(c) || p !== a.style.getPropertyPriority(c) ? p === "" ? s.styleDiff[c] = l : s.styleDiff[c] = [l, p] : s._unchangedStyles[c] = [l, p];
                }
                for (const c of Array.from(a.style))
                  r.style.getPropertyValue(c) === "" && (s.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (xt(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Xn(t.target) ? this.mirror.getId(ve.host(t.target)) : this.mirror.getId(t.target);
              xt(t.target, this.blockClass, this.blockSelector, !1) || Zo(r, this.mirror, this.slimDOMOptions) || !Ik(r, this.mirror) || (this.addedSet.has(r) ? (pa(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || cp(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Lu(n, i)] ? pa(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Xn(t.target) && Kn(t.target) ? !0 : void 0
              }), Fk(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), V(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Zo(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Lu(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        xt(t, this.blockClass, this.blockSelector, !1) || (ve.childNodes(t).forEach((n) => this.genAdds(n)), da(t) && ve.childNodes(ve.shadowRoot(t)).forEach((n) => {
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
function pa(e, t) {
  e.delete(t), ve.childNodes(t).forEach((r) => pa(e, r));
}
function Fk(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ve.childNodes(n).forEach((i) => r.push(i)));
  }
}
function _u(e, t, r) {
  return e.size === 0 ? !1 : Uk(e, t);
}
function Uk(e, t, r) {
  const n = ve.parentNode(t);
  return n ? e.has(n) : !1;
}
function Iu(e, t) {
  return e.size === 0 ? !1 : mp(e, t);
}
function mp(e, t) {
  const r = ve.parentNode(t);
  return r ? e.has(r) ? !0 : mp(e, r) : !1;
}
let Jn;
function Bk(e) {
  Jn = e;
}
function qk() {
  Jn = void 0;
}
const Te = (e) => Jn ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Jn && Jn(n) === !0)
      return;
    throw n;
  }
} : e, Xr = [];
function ai(e) {
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
function gp(e, t) {
  const r = new Dk();
  Xr.push(r), r.init(e);
  const [n, i] = ip(), s = new n(
    Te(r.processMutations.bind(r))
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
function Wk({
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
  const l = ni(
    Te(
      (h) => {
        const d = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= d, u)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), p = Te(
    ni(
      Te((h) => {
        const d = ai(h), { clientX: u, clientY: m } = ua(h) ? h.changedTouches[0] : h;
        c || (c = ri()), a.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: ri() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? Me.Drag : h instanceof MouseEvent ? Me.MouseMove : Me.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    wt("mousemove", p, r),
    wt("touchmove", p, r),
    wt("drag", p, r)
  ];
  return Te(() => {
    o.forEach((h) => h());
  });
}
function jk({
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
  const p = (o) => (h) => {
    const d = ai(h);
    if (xt(d, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = ur.Mouse;
          break;
        case "touch":
          u = ur.Touch;
          break;
        case "pen":
          u = ur.Pen;
          break;
      }
      u === ur.Touch ? Rt[o] === Rt.MouseDown ? m = "TouchStart" : Rt[o] === Rt.MouseUp && (m = "TouchEnd") : ur.Pen;
    } else ua(h) && (u = ur.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === ur.Touch || m.startsWith("Mouse") && u === ur.Mouse) && (u = null)) : Rt[o] === Rt.Click && (u = l, l = null);
    const f = ua(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(d), { clientX: M, clientY: w } = f;
    Te(e)({
      type: Rt[m],
      id: y,
      x: M,
      y: w,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Rt).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = Qr(o);
    const d = p(o);
    if (window.PointerEvent)
      switch (Rt[o]) {
        case Rt.MouseDown:
        case Rt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Rt.TouchStart:
        case Rt.TouchEnd:
          return;
      }
    c.push(wt(h, d, t));
  }), Te(() => {
    c.forEach((o) => o());
  });
}
function yp({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Te(
    ni(
      Te((c) => {
        const l = ai(c);
        if (!l || xt(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const o = sp(t.defaultView);
          e({
            id: p,
            x: o.left,
            y: o.top
          });
        } else
          e({
            id: p,
            x: l.scrollLeft,
            y: l.scrollTop
          });
      }),
      s.scroll || 100
    )
  );
  return wt("scroll", a, t);
}
function Hk({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Te(
    ni(
      Te(() => {
        const s = op(), a = ap();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return wt("resize", i, t);
}
const Yk = ["INPUT", "TEXTAREA", "SELECT"], Ou = /* @__PURE__ */ new WeakMap();
function Vk({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: s,
  ignoreSelector: a,
  maskInputOptions: c,
  maskInputFn: l,
  sampling: p,
  userTriggeredOnInput: o
}) {
  function h(w) {
    let v = ai(w);
    const L = w.isTrusted, S = v && v.tagName;
    if (v && S === "OPTION" && (v = ve.parentElement(v)), !v || !S || Yk.indexOf(S) < 0 || xt(v, n, i, !0) || v.classList.contains(s) || a && v.matches(a))
      return;
    let x = v.value, T = !1;
    const I = Vi(v) || "";
    I === "radio" || I === "checkbox" ? T = v.checked : (c[S.toLowerCase()] || c[I]) && (x = Yi({
      element: v,
      maskInputOptions: c,
      tagName: S,
      type: I,
      value: x,
      maskInputFn: l
    })), d(
      v,
      o ? { text: x, isChecked: T, userTriggered: L } : { text: x, isChecked: T }
    );
    const F = v.name;
    I === "radio" && F && T && t.querySelectorAll(`input[type="radio"][name="${F}"]`).forEach((z) => {
      if (z !== v) {
        const Q = z.value;
        d(
          z,
          o ? { text: Q, isChecked: !T, userTriggered: !1 } : { text: Q, isChecked: !T }
        );
      }
    });
  }
  function d(w, v) {
    const L = Ou.get(w);
    if (!L || L.text !== v.text || L.isChecked !== v.isChecked) {
      Ou.set(w, v);
      const S = r.getId(w);
      Te(e)({
        ...v,
        id: S
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (w) => wt(w, Te(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((w) => w());
    };
  const y = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), M = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return y && y.set && m.push(
    ...M.map(
      (w) => fs(
        w[0],
        w[1],
        {
          set() {
            Te(h)({
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
  ), Te(() => {
    m.forEach((w) => w());
  });
}
function Ki(e) {
  const t = [];
  function r(n, i) {
    if (Oi("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Oi("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Oi("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Oi("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Sr(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Gk({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Te(
      (o, h, d) => {
        const [u, m] = d, { id: f, styleId: y } = Sr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
          adds: [{ rule: u, index: m }]
        }), o.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(o, h, d = this.cssRules.length) {
    const u = `${o} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [u, d]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: Te(
      (o, h, d) => {
        const [u] = d, { id: m, styleId: f } = Sr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: u }]
        }), o.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(o) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [o]);
  };
  let a;
  n.CSSStyleSheet.prototype.replace && (a = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(a, {
    apply: Te(
      (o, h, d) => {
        const [u] = d, { id: m, styleId: f } = Sr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: u
        }), o.apply(h, d);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: Te(
      (o, h, d) => {
        const [u] = d, { id: m, styleId: f } = Sr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: u
        }), o.apply(h, d);
      }
    )
  }));
  const l = {};
  Ni("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Ni("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Ni("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Ni("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
  const p = {};
  return Object.entries(l).forEach(([o, h]) => {
    p[o] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      p[o].insertRule,
      {
        apply: Te(
          (d, u, m) => {
            const [f, y] = m, { id: M, styleId: w } = Sr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (M && M !== -1 || w && w !== -1) && e({
              id: M,
              styleId: w,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Ki(u),
                    y || 0
                    // defaults to 0
                  ]
                }
              ]
            }), d.apply(u, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      p[o].deleteRule,
      {
        apply: Te(
          (d, u, m) => {
            const [f] = m, { id: y, styleId: M } = Sr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || M && M !== -1) && e({
              id: y,
              styleId: M,
              removes: [
                { index: [...Ki(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), Te(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = p[o].insertRule, h.prototype.deleteRule = p[o].deleteRule;
    });
  });
}
function bp({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(ve.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (s = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : s.ShadowRoot, l = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
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
      var o;
      const h = (o = l.set) == null ? void 0 : o.call(this, p);
      if (a !== null && a !== -1)
        try {
          t.adoptStyleSheets(p, a);
        } catch {
        }
      return h;
    }
  }), Te(() => {
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
function Xk({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Te(
      (c, l, p) => {
        var o;
        const [h, d, u] = p;
        if (r.has(h))
          return s.apply(l, [h, d, u]);
        const { id: m, styleId: f } = Sr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
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
          index: Ki(l.parentRule)
        }), c.apply(l, p);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: Te(
      (c, l, p) => {
        var o;
        const [h] = p;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: d, styleId: u } = Sr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
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
          index: Ki(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), Te(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Kk({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Te(
    (l) => ni(
      Te((p) => {
        const o = ai(p);
        if (!o || xt(o, t, r, !0))
          return;
        const { currentTime: h, volume: d, muted: u, playbackRate: m, loop: f } = o;
        e({
          type: l,
          id: n.getId(o),
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
    wt("play", a(xn.Play), s),
    wt("pause", a(xn.Pause), s),
    wt("seeked", a(xn.Seeked), s),
    wt("volumechange", a(xn.VolumeChange), s),
    wt("ratechange", a(xn.RateChange), s)
  ];
  return Te(() => {
    c.forEach((l) => l());
  });
}
function Jk({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(l, p, o) {
    const h = new s(l, p, o);
    return i.set(h, {
      family: l,
      buffer: typeof p != "string",
      descriptors: o,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), h;
  };
  const a = nn(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          Te(() => {
            const p = i.get(l);
            p && (e(p), i.delete(l));
          }),
          0
        ), c.apply(this, [l]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = s;
  }), n.push(a), Te(() => {
    n.forEach((c) => c());
  });
}
function Zk(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Te(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const p = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const d = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: y } = d;
      xt(u, n, i, !0) || xt(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: p });
  });
  return c(), wt("selectionchange", c);
}
function Qk({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : nn(
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
function ev(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: s,
    viewportResizeCb: a,
    inputCb: c,
    mediaInteractionCb: l,
    styleSheetRuleCb: p,
    styleDeclarationCb: o,
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
    t.scroll && t.scroll(...f), s(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), a(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), l(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), p(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), o(...f);
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
function tv(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  ev(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = gp(e, e.doc));
  const s = Wk(e), a = jk(e), c = yp(e), l = Hk(e, {
    win: r
  }), p = Vk(e), o = Kk(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Gk(e, { win: r }), d = bp(e, e.doc), u = Xk(e, {
    win: r
  }), e.collectFonts && (m = Jk(e)));
  const f = Zk(e), y = Qk(e), M = [];
  for (const w of e.plugins)
    M.push(
      w.observer(w.callback, r, w.options)
    );
  return Te(() => {
    Xr.forEach((w) => w.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), p(), o(), h(), d(), u(), m(), f(), y(), M.forEach((w) => w());
  });
}
function Oi(e) {
  return typeof window[e] < "u";
}
function Ni(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Nu {
  constructor(t) {
    V(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), V(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class rv {
  constructor(t) {
    V(this, "iframes", /* @__PURE__ */ new WeakMap()), V(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), V(this, "crossOriginIframeMirror", new Nu($d)), V(this, "crossOriginIframeStyleMirror"), V(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), V(this, "mirror"), V(this, "mutationCb"), V(this, "wrappedEmit"), V(this, "loadListener"), V(this, "stylesheetManager"), V(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Nu(
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
      case Ae.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: Ae.IncrementalSnapshot,
          data: {
            source: Me.Mutation,
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
      case Ae.Meta:
      case Ae.Load:
      case Ae.DomContentLoaded:
        return !1;
      case Ae.Plugin:
        return r;
      case Ae.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case Ae.IncrementalSnapshot:
        switch (r.data.source) {
          case Me.Mutation:
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
          case Me.Drag:
          case Me.TouchMove:
          case Me.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case Me.ViewportResize:
            return !1;
          case Me.MediaInteraction:
          case Me.MouseInteraction:
          case Me.Scroll:
          case Me.CanvasMutation:
          case Me.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case Me.StyleSheetRule:
          case Me.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case Me.Font:
            return r;
          case Me.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case Me.AdoptedStyleSheet:
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
    t.type !== fp.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class nv {
  constructor(t) {
    V(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), V(this, "mutationCb"), V(this, "scrollCb"), V(this, "bypassOptions"), V(this, "mirror"), V(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Kn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = gp(
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
      yp({
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
        this.mirror.getId(ve.host(t))
      ), this.restoreHandlers.push(
        bp(
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
      nn(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = ve.shadowRoot(this);
            return c && hp(this) && n.addShadowRoot(c, r), a;
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
var Cn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", iv = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Pi = 0; Pi < Cn.length; Pi++)
  iv[Cn.charCodeAt(Pi)] = Pi;
var sv = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Cn[t[r] >> 2], i += Cn[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Cn[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Cn[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Pu = /* @__PURE__ */ new Map();
function ov(e, t) {
  let r = Pu.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Pu.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const kp = (e, t, r) => {
  if (!e || !(wp(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = ov(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Fi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Fi(n, t, r));
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
    const n = e.constructor.name, i = sv(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Fi(e.buffer, t, r),
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
          args: [Fi(e.data, t, r), e.width, e.height]
        };
      if (wp(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = kp(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const vp = (e, t, r) => e.map((n) => Fi(n, t, r)), wp = (e, t) => !![
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
function av(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = nn(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...p) {
            return xt(this.canvas, r, n, !0) || setTimeout(() => {
              const o = vp(p, t, this);
              e(this.canvas, {
                type: Pn["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = fs(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Pn["2D"],
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
function lv(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function zu(e, t, r, n) {
  const i = [];
  try {
    const s = nn(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!xt(this, t, r, !0)) {
            const p = lv(c);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
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
function $u(e, t, r, n, i, s) {
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
        const p = nn(
          e,
          l,
          function(o) {
            return function(...h) {
              const d = o.apply(this, h);
              if (kp(d, s, this), "tagName" in this.canvas && !xt(this.canvas, n, i, !0)) {
                const u = vp(h, s, this), m = {
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
        const p = fs(e, l, {
          set(o) {
            r(this.canvas, {
              type: t,
              property: l,
              args: [o],
              setter: !0
            });
          }
        });
        a.push(p);
      }
  return a;
}
function cv(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...$u(
      t.WebGLRenderingContext.prototype,
      Pn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...$u(
      t.WebGL2RenderingContext.prototype,
      Pn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const xp = `(function() {
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
`, Du = typeof self < "u" && self.Blob && new Blob([xp], { type: "text/javascript;charset=utf-8" });
function uv(e) {
  let t;
  try {
    if (t = Du && (self.URL || self.webkitURL).createObjectURL(Du), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(xp),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class dv {
  constructor(t) {
    V(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), V(this, "rafStamps", { latestId: 0, invokeId: null }), V(this, "mirror"), V(this, "mutationCb"), V(this, "resetObservers"), V(this, "frozen", !1), V(this, "locked", !1), V(this, "processMutation", (l, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(l) || this.pendingCanvasMutations.set(l, []), this.pendingCanvasMutations.get(l).push(p);
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
    const a = zu(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new uv();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: M, width: w, height: v } = m.data;
      this.mutationCb({
        id: f,
        type: Pn["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, w, v]
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
                    data: [{ rr_type: "ArrayBuffer", base64: y }],
                    type: M
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
    let o = 0, h;
    const d = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        xt(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (o && m - o < p) {
        h = requestAnimationFrame(u);
        return;
      }
      o = m, d().forEach(async (f) => {
        var y;
        const M = this.mirror.getId(f);
        if (c.get(M) || f.width === 0 || f.height === 0) return;
        if (c.set(M, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const v = f.getContext(f.__context);
          ((y = v == null ? void 0 : v.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && v.clear(v.COLOR_BUFFER_BIT);
        }
        const w = await createImageBitmap(f);
        l.postMessage(
          {
            id: M,
            bitmap: w,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [w]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = zu(
      t,
      r,
      n,
      !1
    ), s = av(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = cv(
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
class pv {
  constructor(t) {
    V(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), V(this, "mutationCb"), V(this, "adoptedStyleSheetCb"), V(this, "styleMirror", new Nk()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: Nd(c, s.href),
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
class hv {
  constructor() {
    V(this, "nodeMap", /* @__PURE__ */ new WeakMap()), V(this, "active", !1);
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
let et, Ui, Qo, Ji = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((mc = e.contentWindow) == null ? void 0 : mc.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Yt = vb();
function _r(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: s = null,
    ignoreClass: a = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: l = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: o = !0,
    maskAllInputs: h,
    maskInputOptions: d,
    slimDOMOptions: u,
    maskInputFn: m,
    maskTextFn: f,
    hooks: y,
    packFn: M,
    sampling: w = {},
    dataURLOptions: v = {},
    mousemoveWait: L,
    recordDOM: S = !0,
    recordCanvas: x = !1,
    recordCrossOriginIframes: T = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: F = !1,
    collectFonts: z = !1,
    inlineImages: Q = !1,
    plugins: W,
    keepIframeSrcFn: N = () => !1,
    ignoreCSSAttributes: Ue = /* @__PURE__ */ new Set([]),
    errorHandler: Ze
  } = e;
  Bk(Ze);
  const me = T ? window.parent === window : !0;
  let pe = !1;
  if (!me)
    try {
      window.parent.document && (pe = !1);
    } catch {
      pe = !0;
    }
  if (me && !t)
    throw new Error("emit function is required");
  if (!me && !pe)
    return () => {
    };
  L !== void 0 && w.mousemove === void 0 && (w.mousemove = L), Yt.reset();
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
  } : d !== void 0 ? d : { password: !0 }, We = Bd(u);
  Ok();
  let Ie, we = 0;
  const Xe = (ce) => {
    for (const ye of W || [])
      ye.eventProcessor && (ce = ye.eventProcessor(ce));
    return M && // Disable packing events which will be emitted to parent frames.
    !pe && (ce = M(ce)), ce;
  };
  et = (ce, ye) => {
    var Ce;
    const xe = ce;
    if (xe.timestamp = ri(), (Ce = Xr[0]) != null && Ce.isFrozen() && xe.type !== Ae.FullSnapshot && !(xe.type === Ae.IncrementalSnapshot && xe.data.source === Me.Mutation) && Xr.forEach((de) => de.unfreeze()), me)
      t == null || t(Xe(xe), ye);
    else if (pe) {
      const de = {
        type: "rrweb",
        event: Xe(xe),
        origin: window.location.origin,
        isCheckout: ye
      };
      window.parent.postMessage(de, "*");
    }
    if (xe.type === Ae.FullSnapshot)
      Ie = xe, we = 0;
    else if (xe.type === Ae.IncrementalSnapshot) {
      if (xe.data.source === Me.Mutation && xe.data.isAttachIframe)
        return;
      we++;
      const de = n && we >= n, oe = r && xe.timestamp - Ie.timestamp > r;
      (de || oe) && Ui(!0);
    }
  };
  const P = (ce) => {
    et({
      type: Ae.IncrementalSnapshot,
      data: {
        source: Me.Mutation,
        ...ce
      }
    });
  }, K = (ce) => et({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.Scroll,
      ...ce
    }
  }), ie = (ce) => et({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.CanvasMutation,
      ...ce
    }
  }), re = (ce) => et({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.AdoptedStyleSheet,
      ...ce
    }
  }), fe = new pv({
    mutationCb: P,
    adoptedStyleSheetCb: re
  }), Re = new rv({
    mirror: Yt,
    mutationCb: P,
    stylesheetManager: fe,
    recordCrossOriginIframes: T,
    wrappedEmit: et
  });
  for (const ce of W || [])
    ce.getMirror && ce.getMirror({
      nodeMirror: Yt,
      crossOriginIframeMirror: Re.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Re.crossOriginIframeStyleMirror
    });
  const He = new hv();
  Qo = new dv({
    recordCanvas: x,
    mutationCb: ie,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Yt,
    sampling: w.canvas,
    dataURLOptions: v
  });
  const gt = new nv({
    mutationCb: P,
    scrollCb: K,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskInputOptions: _e,
      dataURLOptions: v,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: x,
      inlineImages: Q,
      sampling: w,
      slimDOMOptions: We,
      iframeManager: Re,
      stylesheetManager: fe,
      canvasManager: Qo,
      keepIframeSrcFn: N,
      processedNodeManager: He
    },
    mirror: Yt
  });
  Ui = (ce = !1) => {
    if (!S)
      return;
    et(
      {
        type: Ae.Meta,
        data: {
          href: window.location.href,
          width: ap(),
          height: op()
        }
      },
      ce
    ), fe.reset(), gt.init(), Xr.forEach((Ce) => Ce.lock());
    const ye = jb(document, {
      mirror: Yt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskAllInputs: _e,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: We,
      dataURLOptions: v,
      recordCanvas: x,
      inlineImages: Q,
      onSerialize: (Ce) => {
        up(Ce, Yt) && Re.addIframe(Ce), dp(Ce, Yt) && fe.trackLinkElement(Ce), da(Ce) && gt.addShadowRoot(ve.shadowRoot(Ce), document);
      },
      onIframeLoad: (Ce, xe) => {
        Re.attachIframe(Ce, xe), gt.observeAttachShadow(Ce);
      },
      onStylesheetLoad: (Ce, xe) => {
        fe.attachLinkElement(Ce, xe);
      },
      keepIframeSrcFn: N
    });
    if (!ye)
      return console.warn("Failed to snapshot the document");
    et(
      {
        type: Ae.FullSnapshot,
        data: {
          node: ye,
          initialOffset: sp(window)
        }
      },
      ce
    ), Xr.forEach((Ce) => Ce.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && fe.adoptStyleSheets(
      document.adoptedStyleSheets,
      Yt.getId(document)
    );
  };
  try {
    const ce = [], ye = (xe) => {
      var de;
      return Te(tv)(
        {
          mutationCb: P,
          mousemoveCb: (oe, be) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: be,
              positions: oe
            }
          }),
          mouseInteractionCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.MouseInteraction,
              ...oe
            }
          }),
          scrollCb: K,
          viewportResizeCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.ViewportResize,
              ...oe
            }
          }),
          inputCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.Input,
              ...oe
            }
          }),
          mediaInteractionCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.MediaInteraction,
              ...oe
            }
          }),
          styleSheetRuleCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.StyleSheetRule,
              ...oe
            }
          }),
          styleDeclarationCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.StyleDeclaration,
              ...oe
            }
          }),
          canvasMutationCb: ie,
          fontCb: (oe) => et({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.Font,
              ...oe
            }
          }),
          selectionCb: (oe) => {
            et({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Me.Selection,
                ...oe
              }
            });
          },
          customElementCb: (oe) => {
            et({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Me.CustomElement,
                ...oe
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: p,
          maskInputOptions: _e,
          inlineStylesheet: o,
          sampling: w,
          recordDOM: S,
          recordCanvas: x,
          inlineImages: Q,
          userTriggeredOnInput: F,
          collectFonts: z,
          doc: xe,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: N,
          blockSelector: s,
          slimDOMOptions: We,
          dataURLOptions: v,
          mirror: Yt,
          iframeManager: Re,
          stylesheetManager: fe,
          shadowDomManager: gt,
          processedNodeManager: He,
          canvasManager: Qo,
          ignoreCSSAttributes: Ue,
          plugins: ((de = W == null ? void 0 : W.filter((oe) => oe.observer)) == null ? void 0 : de.map((oe) => ({
            observer: oe.observer,
            options: oe.options,
            callback: (be) => et({
              type: Ae.Plugin,
              data: {
                plugin: oe.name,
                payload: be
              }
            })
          }))) || []
        },
        y
      );
    };
    Re.addLoadListener((xe) => {
      try {
        ce.push(ye(xe.contentDocument));
      } catch (de) {
        console.warn(de);
      }
    });
    const Ce = () => {
      Ui(), ce.push(ye(document)), Ji = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? Ce() : (ce.push(
      wt("DOMContentLoaded", () => {
        et({
          type: Ae.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && Ce();
      })
    ), ce.push(
      wt(
        "load",
        () => {
          et({
            type: Ae.Load,
            data: {}
          }), I === "load" && Ce();
        },
        window
      )
    )), () => {
      ce.forEach((xe) => {
        try {
          xe();
        } catch (de) {
          String(de).toLowerCase().includes("cross-origin") || console.warn(de);
        }
      }), He.destroy(), Ji = !1, qk();
    };
  } catch (ce) {
    console.warn(ce);
  }
}
_r.addCustomEvent = (e, t) => {
  if (!Ji)
    throw new Error("please add custom event after start recording");
  et({
    type: Ae.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
_r.freezePage = () => {
  Xr.forEach((e) => e.freeze());
};
_r.takeFullSnapshot = (e) => {
  if (!Ji)
    throw new Error("please take full snapshot after start recording");
  Ui(e);
};
_r.mirror = Yt;
var Fu;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Fu || (Fu = {}));
const { addCustomEvent: f0 } = _r, { freezePage: m0 } = _r, { takeFullSnapshot: g0 } = _r, zi = 2, ea = 4;
class fv {
  constructor(t) {
    ki(this, "events", []);
    ki(this, "lastMeta", null);
    ki(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === ea && (this.lastMeta = t), t.type === zi && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === zi), n = this.events.some((i) => i.type === ea);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === zi), n = t.some((i) => i.type !== zi && i.type !== ea);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function mv(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new fv({
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
const Sp = "klav-sims-live", Ep = "klav-sims-overlay", Uu = "klav-sims-ext-css";
let Lt = null, Vr = null, Dt = null, Mn = null;
const Tr = /* @__PURE__ */ new Map(), Ut = /* @__PURE__ */ new Map();
let ms = 0, Jt = !1, Kr = null, Ln = null, li = !1, pr = null, Ua = 0, Gr = 0, Ar = /* @__PURE__ */ new Set(), vt = null, Lr = null, _t = null, nr = [];
const ir = /* @__PURE__ */ new Set();
let _n = !1, sr = "", st = null, Jr = null, dr = null, Cr = null, ft = null, Zr = null, Gt = null, Vt = null, rr = null, It = null, Rn = null;
const gs = /* @__PURE__ */ new Set();
function gv(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Ba(e, t) {
  return `${e}::${gv(t.text)}`;
}
const yv = 0.55, bv = 0.8, qa = [];
function Cp(e) {
  const t = String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), r = /* @__PURE__ */ new Set();
  if (!t) return r;
  const n = `  ${t} `;
  for (let i = 0; i < n.length - 2; i++) r.add(n.slice(i, i + 3));
  return r;
}
function kv(e, t) {
  if (e.size === 0 || t.size === 0) return 0;
  let r = 0;
  for (const n of e) t.has(n) && r++;
  return r / Math.sqrt(e.size * t.size);
}
function vv(e, t) {
  const r = Cp(t.text);
  return qa.some((n) => kv(r, n.grams) >= (n.simId === e ? yv : bv));
}
function wv(e, t) {
  gs.add(Ba(e, t)), qa.push({ simId: e, grams: Cp(t.text) });
}
function Mp(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const xv = `
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
  /* KD-2870: the group IS the pill (one control). Inside it, two sibling buttons: the label (opens the panel) and, on the
     right, a red "Stop" (stops every Sim). Siblings — never a button nested in a button. */
  .ksl-launch-group {
    position: fixed; right: 20px; bottom: 20px;
    display: flex; align-items: center; gap: 0;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--accent-glow); border-radius: 999px;
    box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 4px rgba(139,92,246,.1);
    transition: transform .15s var(--ease), border-color .15s;
    pointer-events: auto;
  }
  .ksl-launch-group[hidden] { display: none; }
  .ksl-launch-group:hover { transform: translateY(-2px); border-color: var(--accent-2); }
  .ksl-launcher {
    position: relative;
    display: inline-flex; align-items: center; gap: 0;
    border: 0; cursor: pointer; background: transparent; padding: 0;
    pointer-events: auto;
  }
  .ksl-launcher[hidden] { display: none; }
  .ksl-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px 8px 10px; border-radius: 999px;
  }
  .ksl-launcher:active .ksl-pill { transform: scale(.97); }
  .ksl-launcher:focus-visible { outline: none; }
  .ksl-launcher:focus-visible .ksl-pill { box-shadow: 0 0 0 2px var(--accent-2); }
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
  .ksl-stop-all {
    position: relative; display: inline-flex; align-items: center; gap: 6px;
    margin: 4px 6px 4px 12px; padding: 5px 12px; border: 0; border-radius: 999px;
    background: rgba(233,79,55,.18); color: #ff9aa8;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: background .15s, color .15s, transform .15s var(--ease);
  }
  .ksl-stop-all::before { content: ''; position: absolute; left: -7px; top: 50%; width: 1px; height: 18px; margin-top: -9px; background: var(--accent-glow); }
  .ksl-stop-all:hover { background: #d93a4f; color: #fff; }
  .ksl-stop-all:active { transform: scale(.96); }
  .ksl-stop-all:focus-visible { outline: 2px solid #ff9aa8; outline-offset: 2px; }

  /* reviewing shimmer inside the launcher */
  .ksl-launch-group:has(.ksl-launcher.is-reviewing) { border-color: var(--accent-2); }
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
  /* KD-1465: Sim run status line */
  .ksl-status { display: flex; align-items: center; gap: 7px; margin-top: 6px; font-size: 12px; color: var(--fg-2); }
  .ksl-status[hidden] { display: none; }
  .ksl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: var(--accent-2); }
  .ksl-status.is-analysing .ksl-status-dot,
  .ksl-status.is-running .ksl-status-dot { animation: ksl-pulse 1.4s ease-out infinite; }
  .ksl-status.is-completed .ksl-status-dot { background: var(--sev-l-fg); }
  .ksl-status.is-failed .ksl-status-dot { background: var(--sev-h-fg); }
  .ksl-icon-btn {
    margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid var(--line); background: transparent; color: var(--fg-3);
    cursor: pointer; display: grid; place-items: center;
    transition: transform .15s var(--ease), background .15s, color .15s;
  }
  .ksl-icon-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.06); color: var(--fg); }
  .ksl-head-btns { margin-left: auto; display: inline-flex; gap: 6px; }
  .ksl-head-btns .ksl-icon-btn { margin-left: 0; }
  .ksl-close-btn:hover { color: #f87171; }

  /* ── header "Sims" button + menu (Run / Stop each Sim, multi-select) ── */
  .ksl-sims-btn {
    height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: transparent;
    color: var(--fg-2); font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: background .15s, color .15s, border-color .15s;
  }
  .ksl-sims-btn:hover, .ksl-sims-btn[aria-expanded="true"] { background: rgba(139,92,246,.14); border-color: rgba(139,92,246,.4); color: var(--accent-3); }
  .ksl-sims-btn:focus-visible, .ksl-sm-row:focus-visible, .ksl-sm-act:focus-visible, .ksl-sm-bulk:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  /* The Sims menu is a full view INSIDE the card (slides over the findings) — not a floating popover. */
  .ksl-simmenu {
    position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column;
    background: linear-gradient(168deg, var(--surface-2), var(--surface)); border-radius: inherit;
    animation: ksl-sm-in .22s var(--ease) both;
  }
  @keyframes ksl-sm-in { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
  .ksl-sm-head { display: flex; align-items: center; gap: 10px; padding: 16px 16px 14px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
  .ksl-sm-back { width: 30px; height: 30px; flex: none; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--fg-2); cursor: pointer; transition: background .15s, color .15s; }
  .ksl-sm-back:hover { background: rgba(255,255,255,.06); color: var(--fg); }
  .ksl-sm-back:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-sm-titles { min-width: 0; }
  .ksl-sm-title { font-size: 15px; font-weight: 700; color: var(--fg); letter-spacing: -.01em; }
  .ksl-sm-sub { font-size: 12px; color: var(--fg-3); margin-top: 2px; }
  .ksl-sm-list { flex: 1; overflow-y: auto; padding: 8px 12px 12px; scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
  /* Thin dark scrollbar (matches the findings list) instead of the browser's default white one. */
  .ksl-sm-list::-webkit-scrollbar { width: 9px; }
  .ksl-sm-list::-webkit-scrollbar-track { background: transparent; }
  .ksl-sm-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 6px; border: 2px solid var(--surface); }
  .ksl-sm-list::-webkit-scrollbar-button { display: none; height: 0; }
  .ksl-sm-head .ksl-head-btns { margin-left: auto; }
  .ksl-sm-empty { padding: 28px 16px; text-align: center; font-size: 12.5px; color: var(--fg-3); }
  .ksl-sm-all { display: flex; align-items: center; gap: 10px; margin: 4px 0 2px; padding: 9px 10px; border-radius: 10px; cursor: pointer; font-size: 12.5px; font-weight: 600; color: var(--fg-2); }
  .ksl-sm-all:hover { background: rgba(255,255,255,.04); }
  .ksl-sm-all:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-sm-group { margin: 14px 4px 6px; font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--fg-4); display: flex; align-items: center; gap: 8px; }
  .ksl-sm-group::after { content: ""; flex: 1; height: 1px; background: var(--line-soft); }
  .ksl-sm-group-note { margin: -2px 4px 8px; font-size: 11.5px; color: var(--fg-3); line-height: 1.4; }
  .ksl-sm-row { display: flex; align-items: center; gap: 10px; padding: 10px; margin-bottom: 6px; border-radius: 12px; border: 1px solid var(--line-soft); background: rgba(255,255,255,.02); cursor: pointer; transition: background .15s, border-color .15s; }
  .ksl-sm-row:hover { background: rgba(255,255,255,.045); }
  .ksl-sm-row.is-running { border-color: rgba(52,211,153,.24); background: rgba(52,211,153,.05); }
  .ksl-sm-row.is-sel { border-color: rgba(139,92,246,.5); background: rgba(139,92,246,.09); }
  .ksl-sm-row.is-off { border-color: transparent; background: transparent; opacity: .6; cursor: help; padding: 7px 10px; margin-bottom: 2px; }
  .ksl-sm-chk { width: 17px; height: 17px; flex: none; display: grid; place-items: center; border-radius: 5px; border: 1.5px solid var(--fg-4); color: #fff; transition: background .14s, border-color .14s; }
  .ksl-sm-chk.on, .ksl-sm-chk.mixed { background: var(--accent); border-color: var(--accent); }
  .ksl-sm-av { width: 32px; height: 32px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: #fff; }
  .ksl-sm-row.is-off .ksl-sm-av { width: 26px; height: 26px; font-size: 9.5px; filter: grayscale(1); }
  .ksl-sm-meta { flex: 1; min-width: 0; }
  .ksl-sm-name { font-size: 13px; font-weight: 600; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ksl-sm-st { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--fg-3); margin-top: 2px; }
  .ksl-sm-st::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .85; }
  .ksl-sm-row.is-running .ksl-sm-st { color: #6ee7b7; }
  .ksl-sm-row.is-off .ksl-sm-st { color: #f87171; }
  .ksl-sm-row.is-off .ksl-sm-name { font-size: 12.5px; color: var(--fg-2); }
  .ksl-sm-act, .ksl-sm-bulk {
    flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px;
    border: 1px solid rgba(52,211,153,.45); background: rgba(52,211,153,.08); color: #6ee7b7; font-size: 12px; font-weight: 700; cursor: pointer;
    transition: background .15s, transform .15s;
  }
  .ksl-sm-act.is-stop, .ksl-sm-bulk.is-stop { border-color: rgba(248,113,113,.42); background: rgba(248,113,113,.07); color: #fca5a5; }
  .ksl-sm-act:hover:not(:disabled), .ksl-sm-bulk:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); }
  .ksl-sm-act:disabled, .ksl-sm-bulk:disabled { opacity: .35; cursor: default; }
  .ksl-sm-note { margin: 0 12px 10px; padding: 9px 11px; border-radius: 10px; background: rgba(139,92,246,.13); border: 1px solid rgba(139,92,246,.25); color: var(--accent-3); font-size: 12px; line-height: 1.45; flex-shrink: 0; }
  .ksl-sm-foot { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-top: 1px solid var(--line-soft); background: rgba(0,0,0,.18); flex-shrink: 0; }
  .ksl-sm-cnt { margin-right: auto; font-size: 11.5px; color: var(--fg-3); }
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
    .ksl-launch-group { right: 12px; bottom: 12px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .ksl-panel.is-open,.ksl-row,.ksl-shimmer,.ksl-launcher.is-reviewing .ksl-pill-txt::after,.ksl-status-dot { animation: none !important; }
    .ksl-panel, .ksl-row, .ksl-pill, .ksl-chip, .ksl-r-act, .ksl-icon-btn { transition: none !important; }
  }
`, Sv = `
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
function Bu(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Ev(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ha() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Cv(e) {
  return new Promise((t) => setTimeout(t, e));
}
function In(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Rp = { HIGH: "h", MED: "m", LOW: "l" }, qu = { HIGH: 0, MED: 1, LOW: 2 };
function Mv(e) {
  if (!e) return !1;
  if (e === Dt || e === Lt || e.id === Ep || e.id === Sp || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Rv(e) {
  const t = [];
  for (const r of [Dt, Lt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Tp(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Ap(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Wu(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Tv(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Av(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Lp(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Mv(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Lv(e, t) {
  return Rv(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Lp(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function _v(e, t) {
  const r = Tp(t), n = Ap(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Lv(i, s);
  if (!a.length) return null;
  const c = Math.max(1, Wu(n));
  let l = null, p = -1 / 0;
  for (const o of a) {
    const h = Av(o.getBoundingClientRect()), d = Tv(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Wu(h)), m = d / c, f = Math.max(0, (u - d) / u), y = o.tagName.toLowerCase(), M = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, w = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, v = m - f * 0.35 + M - w;
    v > p && (l = o, p = v);
  }
  return l ?? a[0] ?? null;
}
async function Iv(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: ha() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Cv(ha() ? 80 : 520);
}
const Ov = /* @__PURE__ */ new Set([
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
function Nv(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Ov.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Pv(e) {
  const t = Nv(e.text);
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
    if (!Lp(a)) continue;
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
    const p = t.reduce((f, y) => f + (l.includes(y) ? 1 : 0), 0);
    if (!p) continue;
    const o = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(o) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - u;
    m > i && (n = a, i = m);
  }
  return n;
}
async function zv(e, t = {}) {
  if (e.region) {
    const r = Tp(e), n = Ap(e.region, r);
    t.scroll !== !1 && await Iv(n.left + n.width / 2, n.top + n.height / 2);
    const i = _v(e.region, e);
    if (i) return i;
  }
  return Pv(e);
}
function $v() {
  if (Lt && Vr) return Vr;
  Lt = document.createElement("div"), Lt.id = Sp, Lt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Vr = Lt.attachShadow({ mode: "open" }), Sy(Vr);
  const e = document.createElement("style");
  return e.textContent = xv, Vr.appendChild(e), document.body.appendChild(Lt), Vr;
}
function _p() {
  if (Dt) return Dt;
  if (!document.getElementById(Uu)) {
    const e = document.createElement("style");
    e.id = Uu, e.textContent = Sv, document.head.appendChild(e);
  }
  return Dt = document.createElement("div"), Dt.id = Ep, Dt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Dt), Dt;
}
function Ip(e, t) {
  return wy({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Op() {
  Jr && (Jr.textContent = "", [...Ar].slice(0, 3).forEach((e) => {
    const t = Tr.get(e);
    t && Jr.appendChild(Ip(t, 26));
  }));
}
function Dv(e, t = {}) {
  if (!(typeof document > "u")) {
    if (!Lt || !Lt.isConnected) {
      Np(e.map((r) => r.id), e, t);
      return;
    }
    t.onClose && (vt = t.onClose), t.simControls && (Lr = t.simControls);
    for (const r of e.slice(0, 8))
      Tr.has(r.id) || Tr.set(r.id, { simId: r.id, accent: r.accent || "#6366f1", initials: r.initials || r.name.slice(0, 2).toUpperCase(), name: r.name, photoUrl: r.photoUrl });
    Ar = new Set(e.slice(0, 8).map((r) => r.id)), Op(), sn(), Jt && en();
  }
}
function Zi() {
  var e;
  Je(_t), _t = null, ir.clear(), sr = "", (e = ft == null ? void 0 : ft.querySelector(".ksl-sims-btn")) == null || e.setAttribute("aria-expanded", "false");
}
function Fv(e) {
  if (_t) {
    Zi();
    return;
  }
  !ft || !Lr || (_t = document.createElement("div"), _t.className = "ksl-simmenu", _t.setAttribute("role", "dialog"), _t.setAttribute("aria-label", "Run or stop Sims"), ft.appendChild(_t), e.setAttribute("aria-expanded", "true"), nr = [], Mr(!0), Lr.list().then((t) => {
    nr = t, Mr();
  }).catch((t) => {
    sr = (t == null ? void 0 : t.message) || "Couldn't load your Sims.", Mr();
  }));
}
function Uv(e) {
  const t = document.createElement("div"), r = ir.has(e.id);
  t.className = "ksl-sm-row" + (e.active ? e.running ? " is-running" : "" : " is-off") + (r ? " is-sel" : ""), t.dataset.simId = e.id;
  const n = document.createElement("span");
  n.className = "ksl-sm-av", n.style.background = Bv(e.accent) || "#6366f1", n.textContent = (e.initials || e.name.slice(0, 2)).slice(0, 2).toUpperCase();
  const i = document.createElement("div");
  i.className = "ksl-sm-meta";
  const s = document.createElement("div");
  s.className = "ksl-sm-name", s.textContent = e.name;
  const a = document.createElement("div");
  if (a.className = "ksl-sm-st", a.textContent = e.active ? e.running ? "Running" : "Not running" : "Deactivated", a.dataset.kind = "run", i.append(s, a), !e.active) {
    t.setAttribute("aria-disabled", "true"), t.tabIndex = 0;
    const o = () => {
      sr = `${e.name} is deactivated. Activate this Sim on the Sims tab to run it.`, Mr();
    };
    return t.addEventListener("click", o), t.addEventListener("keydown", (h) => {
      (h.key === " " || h.key === "Enter") && (h.preventDefault(), o());
    }), t.append(n, i), t;
  }
  const c = document.createElement("span");
  c.className = "ksl-sm-chk" + (r ? " on" : ""), c.innerHTML = r ? G("check", { size: 11 }) : "", t.setAttribute("role", "checkbox"), t.setAttribute("aria-checked", String(r)), t.tabIndex = 0;
  const l = () => {
    _n || (r ? ir.delete(e.id) : ir.add(e.id), sr = "", Mr());
  };
  t.addEventListener("click", l), t.addEventListener("keydown", (o) => {
    o.target === t && (o.key === " " || o.key === "Enter") && (o.preventDefault(), l());
  });
  const p = document.createElement("button");
  return p.type = "button", p.className = "ksl-sm-act" + (e.running ? " is-stop" : ""), p.dataset.action = e.running ? "stop" : "run", p.disabled = _n, p.setAttribute("aria-label", `${e.running ? "Stop" : "Run"} ${e.name}`), p.innerHTML = G(e.running ? "square" : "play", { size: 11 }) + `<span>${e.running ? "Stop" : "Run"}</span>`, p.addEventListener("click", (o) => {
    o.stopPropagation(), fa(e.running ? "stop" : "run", [e.id]);
  }), p.addEventListener("keydown", (o) => o.stopPropagation()), t.append(c, n, i, p), t;
}
function Mr(e = !1) {
  var x;
  const t = _t;
  if (!t) return;
  const r = ((x = t.querySelector(".ksl-sm-list")) == null ? void 0 : x.scrollTop) ?? 0;
  t.textContent = "";
  const n = nr.filter((T) => T.active), i = n.filter((T) => T.running), s = n.filter((T) => !T.running), a = nr.filter((T) => !T.active), c = document.createElement("div");
  c.className = "ksl-sm-head";
  const l = document.createElement("button");
  l.type = "button", l.className = "ksl-sm-back", l.setAttribute("aria-label", "Back to findings"), l.title = "Back to findings", l.innerHTML = G("chevron-left", { size: 16 }), l.addEventListener("click", () => Zi());
  const p = document.createElement("div");
  p.className = "ksl-sm-titles";
  const o = document.createElement("div");
  o.className = "ksl-sm-title", o.textContent = "Sims on this page";
  const h = document.createElement("div");
  h.className = "ksl-sm-sub", h.textContent = e ? "Loading…" : n.length ? `${i.length} of ${n.length} running` : "No activated Sims yet", p.append(o, h);
  const d = document.createElement("span");
  d.className = "ksl-head-btns";
  const u = document.createElement("button");
  if (u.type = "button", u.className = "ksl-icon-btn ksl-sm-min", u.title = "Minimize", u.setAttribute("aria-label", "Minimize Sims feedback panel"), u.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', u.addEventListener("click", () => {
    Zi(), Bi();
  }), d.appendChild(u), vt) {
    const T = document.createElement("button");
    T.type = "button", T.className = "ksl-icon-btn ksl-close-btn ksl-sm-close", T.title = "Close and stop all Sims", T.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), T.innerHTML = G("x", { size: 15 }), T.addEventListener("click", () => {
      try {
        vt == null || vt();
      } catch {
      }
    }), d.appendChild(T);
  }
  c.append(l, p, d), t.appendChild(c);
  const m = document.createElement("div");
  if (m.className = "ksl-sm-list", e) m.innerHTML = '<div class="ksl-sm-empty">Loading Sims…</div>';
  else if (!nr.length) m.innerHTML = '<div class="ksl-sm-empty">No Sims in this project yet.</div>';
  else {
    if (n.length > 1) {
      const I = n.filter((Ue) => ir.has(Ue.id)).length, F = I === n.length, z = document.createElement("div");
      z.className = "ksl-sm-all", z.setAttribute("role", "checkbox"), z.setAttribute("aria-checked", F ? "true" : I ? "mixed" : "false"), z.tabIndex = 0;
      const Q = document.createElement("span");
      Q.className = "ksl-sm-chk" + (F ? " on" : I ? " mixed" : ""), Q.innerHTML = F ? G("check", { size: 11 }) : I ? '<span style="width:8px;height:2px;background:#fff;border-radius:2px"></span>' : "";
      const W = document.createElement("span");
      W.textContent = "Select all", z.append(Q, W);
      const N = () => {
        _n || (n.forEach((Ue) => F ? ir.delete(Ue.id) : ir.add(Ue.id)), sr = "", Mr());
      };
      z.addEventListener("click", N), z.addEventListener("keydown", (Ue) => {
        (Ue.key === " " || Ue.key === "Enter") && (Ue.preventDefault(), N());
      }), m.appendChild(z);
    }
    const T = (I, F, z) => {
      if (!F.length) return;
      const Q = document.createElement("div");
      if (Q.className = "ksl-sm-group", Q.textContent = `${I} · ${F.length}`, m.appendChild(Q), z) {
        const W = document.createElement("div");
        W.className = "ksl-sm-group-note", W.textContent = z, m.appendChild(W);
      }
      for (const W of F) m.appendChild(Uv(W));
    };
    T("Running", i), T("Not running", s), T("Deactivated", a, "Activate these on the Sims tab to run them here.");
  }
  if (t.appendChild(m), m.scrollTop = r, sr) {
    const T = document.createElement("div");
    T.className = "ksl-sm-note", T.setAttribute("role", "status"), T.textContent = sr, t.appendChild(T);
  }
  const f = n.filter((T) => ir.has(T.id)), y = f.filter((T) => !T.running).map((T) => T.id), M = f.filter((T) => T.running).map((T) => T.id), w = document.createElement("div");
  w.className = "ksl-sm-foot";
  const v = document.createElement("span");
  v.className = "ksl-sm-cnt", v.textContent = f.length ? `${f.length} selected` : "Tick Sims to run or stop several";
  const L = document.createElement("button");
  L.type = "button", L.className = "ksl-sm-bulk", L.dataset.action = "run-selected", L.disabled = _n || !y.length, L.innerHTML = G("play", { size: 11 }) + `<span>Run${y.length ? " " + y.length : ""}</span>`, L.addEventListener("click", () => void fa("run", y));
  const S = document.createElement("button");
  S.type = "button", S.className = "ksl-sm-bulk is-stop", S.dataset.action = "stop-selected", S.disabled = _n || !M.length, S.innerHTML = G("square", { size: 11 }) + `<span>Stop${M.length ? " " + M.length : ""}</span>`, S.addEventListener("click", () => void fa("stop", M)), w.append(v, L, S), t.appendChild(w);
}
let ta = Promise.resolve(), $i = 0;
async function fa(e, t) {
  if (!Lr || !t.length) return;
  const r = Lr, n = new Set(t);
  nr = nr.map((s) => s.active && n.has(s.id) ? { ...s, running: e === "run" } : s);
  for (const s of t) ir.delete(s);
  const i = t.length;
  sr = e === "run" ? `${i === 1 ? "Sim is" : `${i} Sims are`} running.` : `${i === 1 ? "Sim" : `${i} Sims`} stopped. Reported issues stay here and in Sim Reports.`, Mr(), $i++, ta = ta.then(async () => {
    try {
      const s = await (e === "run" ? r.run(t) : r.stop(t));
      $i--, $i || (nr = s);
    } catch (s) {
      $i--, sr = (s == null ? void 0 : s.message) || "Couldn't update the Sims — please try again.";
      try {
        nr = await r.list();
      } catch {
      }
    }
    _t && _t.isConnected && Mr();
  }), await ta;
}
function Bv(e) {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(e || "")) ? String(e) : null;
}
function Np(e, t = [], r = {}) {
  if (typeof document > "u") return;
  ga(), vt = r.onClose ?? null, Lr = r.simControls ?? null;
  const n = $v();
  _p(), Mn = new AbortController();
  const i = e === "all" ? t : t.filter((d) => e.includes(d.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), ga();
    return;
  }
  i.slice(0, 8).forEach((d) => {
    const u = d.accent || "#6366f1", m = d.initials || d.name.slice(0, 2).toUpperCase();
    Tr.set(d.id, { simId: d.id, accent: u, initials: m, name: d.name, photoUrl: d.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), It = document.createElement("div"), It.className = "ksl-sr", It.id = "ksl-announcer", It.setAttribute("aria-live", "polite"), It.setAttribute("aria-atomic", "true"), s.appendChild(It), st = document.createElement("button"), st.type = "button", st.className = "ksl-launcher", st.setAttribute("aria-label", "Open Sims feedback panel"), st.addEventListener("click", () => jv());
  const a = document.createElement("span");
  a.className = "ksl-pill", Jr = document.createElement("span"), Jr.className = "ksl-pill-avatars", dr = document.createElement("span"), dr.className = "ksl-pill-txt", a.append(Jr, dr), Cr = document.createElement("span"), Cr.className = "ksl-pill-badge", Cr.hidden = !0, st.append(a, Cr);
  const c = document.createElement("div");
  if (c.className = "ksl-launch-group", c.appendChild(st), vt) {
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-stop-all", d.title = "Stop all Sims", d.setAttribute("aria-label", "Stop all Sims"), d.textContent = "Stop", d.addEventListener("click", (u) => {
      u.stopPropagation();
      try {
        vt == null || vt();
      } catch {
      }
    }), c.appendChild(d);
  }
  s.appendChild(c), Ar = new Set(i.slice(0, 8).map((d) => d.id)), Op(), ft = document.createElement("section"), ft.className = "ksl-panel", ft.setAttribute("aria-label", "Sims feedback"), ft.setAttribute("role", "dialog");
  const l = document.createElement("div");
  l.className = "ksl-head";
  const p = document.createElement("div");
  p.className = "ksl-title-row";
  const o = document.createElement("div");
  o.className = "ksl-title", o.textContent = "Sims feedback";
  const h = document.createElement("button");
  if (h.type = "button", h.className = "ksl-icon-btn", h.title = "Minimize", h.setAttribute("aria-label", "Minimize Sims feedback panel"), vt) {
    h.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', h.addEventListener("click", () => Bi());
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-icon-btn ksl-close-btn", d.title = "Close and stop all Sims", d.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), d.innerHTML = G("x", { size: 15 }), d.addEventListener("click", () => {
      try {
        vt == null || vt();
      } catch {
      }
    });
    const u = document.createElement("span");
    if (u.className = "ksl-head-btns", Lr) {
      const m = document.createElement("button");
      m.type = "button", m.className = "ksl-sims-btn", m.setAttribute("aria-haspopup", "dialog"), m.setAttribute("aria-expanded", "false"), m.title = "Run or stop Sims", m.innerHTML = G("users", { size: 14 }) + "<span>Sims</span>", m.addEventListener("click", () => Fv(m)), u.append(m);
    }
    u.append(h, d), p.append(o, u);
  } else
    h.innerHTML = G("x", { size: 15 }), h.addEventListener("click", () => Bi()), p.append(o, h);
  Zr = document.createElement("div"), Zr.className = "ksl-count", Gt = document.createElement("div"), Gt.className = "ksl-status", Gt.hidden = !0, Gt.setAttribute("role", "status"), Vt = document.createElement("div"), Vt.className = "ksl-chips", l.append(p, Zr, Gt, Vt), rr = document.createElement("div"), rr.className = "ksl-list", rr.setAttribute("role", "list"), ft.append(l, rr), s.appendChild(ft), document.addEventListener("keydown", (d) => {
    if (d.key === "Escape" && _t) {
      Zi();
      return;
    }
    d.key === "Escape" && Jt && Bi();
  }, { signal: Mn.signal }), Mp(!0), sn();
}
function Wa(e) {
  li = e, st == null || st.classList.toggle("is-reviewing", e), sn(), Jt && en();
}
function ja() {
  const e = Ar.size || Tr.size, t = e === 1 ? "Sim is" : "Sims are";
  switch (pr) {
    case "analysing":
      return `${e === 1 ? "Sim is" : `${e} Sims are`} analysing this page…`;
    case "running":
      return `${t} running on this page…`;
    case "completed": {
      const r = ms - Ua;
      return `Sim run completed · ${r ? `${r} new finding${r === 1 ? "" : "s"}` : "no new findings"}`;
    }
    case "failed":
      return "Sim run didn't finish — it will retry on the next change.";
    default:
      return "";
  }
}
function qv(e) {
  e === "analysing" ? (Gr === 0 && (Ua = ms), Gr++) : e === "completed" || e === "failed" ? (Gr = Math.max(0, Gr - 1), Gr > 0 && (e = "running")) : e === null && (Gr = 0), pr = e, Wa(e === "analysing" || e === "running"), It && e && (It.textContent = ja());
}
function Wv() {
  if (!Gt || (Gt.hidden = !pr, Gt.className = "ksl-status" + (pr ? ` is-${pr}` : ""), Gt.textContent = "", !pr)) return;
  const e = document.createElement("span");
  e.className = "ksl-status-dot";
  const t = document.createElement("span");
  t.className = "ksl-status-txt", t.textContent = ja(), Gt.append(e, t);
}
function jv() {
  !ft || !st || (Jt = !0, ft.classList.add("is-open"), st.hidden = !0, st.parentElement && (st.parentElement.hidden = !0), en());
}
function Bi() {
  !ft || !st || (Jt = !1, ft.classList.remove("is-open"), st.hidden = !1, st.parentElement && (st.parentElement.hidden = !1), sn());
}
function Pp() {
  const e = Array.from(Ut.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => In(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function sn() {
  const e = Pp();
  if (dr)
    if (pr === "analysing" || pr === "running")
      dr.textContent = ja();
    else if (li && e.total === 0)
      dr.innerHTML = "Your Sims are reviewing…";
    else if (e.total === 0) {
      const t = Ar.size || Tr.size;
      dr.innerHTML = `${t} Sim${t === 1 ? " is" : "s are"} running on this page`;
    } else
      dr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`;
  Cr && (Cr.hidden = e.high === 0, Cr.textContent = `${e.high} high`), Wv(), Jt && zp(e);
}
function zp(e) {
  Zr && (e.total === 0 ? Zr.innerHTML = li ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Zr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Hv();
}
function Hv() {
  if (!Vt) return;
  const e = Array.from(Ut.values());
  if (Vt.hidden = e.length === 0, Vt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Vt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (Kr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(Kr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      Kr = Kr === i.simId ? null : i.simId, en();
    }), Vt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Vt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => In(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Ln === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${Rp[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      Ln = Ln === i ? null : i, en();
    }), Vt.appendChild(a);
  });
}
function Yv() {
  return Array.from(Ut.values()).filter((e) => !Kr || e.entry.simId === Kr).filter((e) => !Ln || In(e.obs) === Ln).sort((e, t) => {
    const r = In(e.obs), n = In(t.obs), i = r ? qu[r] : 3, s = n ? qu[n] : 3;
    return i - s;
  });
}
function Vv(e) {
  const { entry: t, obs: r } = e, n = In(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Ip(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Rp[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
  }
  i.appendChild(s);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-expand", p.textContent = "Show more", p.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    p.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(p);
  const o = document.createElement("div");
  o.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = G("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = qi.onTriage) == null || m.call(qi, r, t.name), ju(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = G("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    Xv(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    ju(e.id);
  }), o.append(h, d, u), i.appendChild(o), i;
}
function Gv(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function en() {
  if (!rr || !Jt) {
    sn();
    return;
  }
  const e = Pp();
  zp(e);
  const t = Yv();
  if (rr.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Ut.size > 0;
    if (li && !i) {
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
    rr.appendChild(n), Ut.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Vv(n);
    n.rowEl = i, rr.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Ut.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Gv(rr);
}
function ma() {
  Rn == null || Rn(), Rn = null;
}
async function Xv(e) {
  const t = Ut.get(e);
  if (!t) return;
  const r = await zv(t.obs, { scroll: !0 });
  !r || !Dt || Kv(r, t.entry.accent);
}
function Kv(e, t) {
  ma();
  const r = _p(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Bu(t, 0.16)},0 0 24px ${Bu(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const p = e.getBoundingClientRect(), o = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Rn === l && ma();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Je(n);
  };
  Rn = l;
}
function Jv(e, t) {
  const r = `f_${e.simId}_${++ms}`;
  Ut.set(r, { id: r, entry: e, obs: t, rowEl: null }), Jt ? en() : sn(), It && (It.textContent = "", requestAnimationFrame(() => {
    It && (It.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function Zv(e) {
  const t = Ut.get(e);
  if (!t) return;
  const r = () => {
    Ut.delete(e), Jt ? en() : sn();
  };
  t.rowEl && Jt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ha() ? 0 : 300)) : r();
}
function ju(e) {
  const t = Ut.get(e);
  t && (gs.add(Ba(t.entry.simId, t.obs)), Zv(e));
}
function Qv(e, t, r) {
  if (!Lt) return;
  const n = Tr.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length && !(Ar.size && !Ar.has(e))) {
    Wa(!1);
    for (const i of r) {
      if (!Ev(i)) continue;
      const s = Ba(e, i);
      gs.has(s) || vv(e, i) || (wv(e, i), Jv(n, i));
    }
  }
}
function ga() {
  ma(), Ut.clear(), ms = 0, Tr.clear(), gs.clear(), qa.length = 0, Jt = !1, Kr = null, Ln = null, li = !1, pr = null, Ua = 0, Gr = 0, Ar = /* @__PURE__ */ new Set(), vt = null, Lr = null, _t = null, nr = [], ir.clear(), _n = !1, sr = "", Mn == null || Mn.abort(), Mn = null, st = null, Jr = null, dr = null, Cr = null, ft = null, Zr = null, Gt = null, Vt = null, rr = null, It = null, Je(Dt), Dt = null, Je(Lt), Lt = null, Vr = null, Mp(!1);
}
const qi = {
  deploy: Np,
  updateSims: Dv,
  setReviewing: Wa,
  setRunStatus: qv,
  renderFeedback: Qv,
  undeploy: ga,
  onTriage: null
};
function e0() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = qi);
}
typeof window < "u" && e0();
const Hu = "klav-ao-css", t0 = "klav-ao-overlay";
function r0(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), p = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(p, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const n0 = `
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
let Yr = null, i0 = 1;
const Qi = /* @__PURE__ */ new Map();
function Yu(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function s0() {
  if (Yr) return Yr;
  if (!document.getElementById(Hu)) {
    const e = document.createElement("style");
    e.id = Hu, e.textContent = n0, document.head.appendChild(e);
  }
  return Yr = document.createElement("div"), Yr.id = t0, Yr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Yr), Yr;
}
function y0(e, t, r = {}) {
  const n = s0(), i = r.color ?? "#6366f1", s = `klav-ao-${i0++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Yu(i, 0.14)},0 0 24px ${Yu(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: d, top: u, below: m } = r0(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = s, l.style.borderLeftColor = i, l.style.left = d + "px", l.style.top = u + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const y = document.createElement("span");
    y.className = "klav-ao-lbl", y.style.color = i, y.textContent = t, f.appendChild(y);
    const M = r.priority ?? r.severity;
    if (M) {
      const v = M === "medium" ? " sev-m" : M === "low" ? " sev-l" : "", L = document.createElement("span");
      L.className = `klav-ao-sev${v}`, L.textContent = M, f.appendChild(L);
    }
    const w = document.createElement("button");
    w.className = "klav-ao-dismiss", w.textContent = "Dismiss", w.addEventListener("click", () => $p(s)), l.appendChild(f), l.appendChild(w), n.appendChild(l);
  }
  return Qi.set(s, { halo: c, pin: l }), s;
}
function $p(e) {
  const t = Qi.get(e);
  if (!t) return;
  Qi.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Je(n), Je(r);
  }, 240)) : Je(r);
}
function b0() {
  for (const e of [...Qi.keys()]) $p(e);
}
let Ha = vn, Er = "";
const Dp = { consoleErrors: [], networkFailures: [] };
let Ya, Fp, On = null;
function kn() {
  return Ha.backendUrl || yd;
}
const o0 = 15e3;
function Vn(e, t = {}, r = o0) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Up(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Vu() {
  return qm(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function a0() {
  return rg(Dp, { identity: Ya, metadata: Fp });
}
async function l0(e) {
  return Km(
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
      projectId: Er || void 0,
      replayEvents: e.replayEvents
    },
    Ha,
    { backend: Ry }
  );
}
function Va(e = "bug") {
  const t = py(e, {
    onCaptureFull: Vu,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: fc,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Vn(kn() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: Er, text: r, url: location.href })
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
        const i = await Vn(kn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: Er, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: Ys() })
        });
        if (!i.ok) return null;
        const s = await i.json().catch(() => null);
        return s && typeof s.tip == "string" && s.tip ? { tip: s.tip } : null;
      } catch {
        return null;
      }
    },
    // KLA-586 AI "Enhance" (POST /api/report/enhance): the reporter's one-liner + the primary shot + picked
    onEnhance: async (r, n) => {
      try {
        const i = await Vn(kn() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: Er,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: Ys()
          })
        }, 3e4);
        if (!i.ok) return null;
        const s = await i.json().catch(() => null);
        return s && s.draft ? s.draft : null;
      } catch {
        return null;
      }
    },
    // KD-995: split a "Record me" walkthrough into separate tickets (POST /api/report/split → the issues the
    // reporter narrated). Resolve null on any failure so the composer keeps the single ticket.
    onSplitRecording: async (r, n) => {
      var i;
      try {
        const s = new FormData();
        s.append("projectId", Er), s.append("audio", r, "recording.webm"), r.type && s.append("mime", r.type), s.append("pageUrl", location.href), n != null && n.text && s.append("text", n.text), (i = n == null ? void 0 : n.frames) != null && i.length && s.append("frames", JSON.stringify(n.frames));
        const a = await Vn(kn() + "/api/report/split", { method: "POST", body: s }, 9e4);
        if (!a.ok) return null;
        const c = await a.json().catch(() => null);
        return c && Array.isArray(c.issues) ? c.issues : null;
      } catch {
        return null;
      }
    },
    // KLA-505 server-side dictation (POST /api/voice/transcribe): the Voice button hands each mic clip here;
    // resolve null on any failure so the composer falls back to Web Speech.
    onDictate: async (r) => {
      try {
        const n = new FormData();
        n.append("projectId", Er), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Vn(kn() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(kn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", Er), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Ad();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => Gy({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => fc(a))), i = await Promise.all(n.map((a) => Xy(a))), s = a0();
      return r.attachConsole !== !0 && (s.consoleErrors = []), l0({
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
        reporter: Ya,
        clientInfo: Ys(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (On == null ? void 0 : On.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Vu();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function c0() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function u0() {
  ng(Dp, { consoleLevels: !0 });
}
function Bp(e) {
  Ya = e ? Up(e) : void 0;
}
function qp(e) {
  Fp = e ? Up(e) : void 0;
}
function d0() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = Ty, (document.head || document.documentElement).appendChild(e);
}
function p0() {
  document.addEventListener("contextmenu", (e) => {
    if (Vg(e.target)) return;
    e.preventDefault(), d0();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (p, o, h, d, u = {}) => {
      const m = Ly(document, { iconHtml: G(p), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), Va(d);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      Je(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
    }, c = (p) => {
      (!p || !t.contains(p.target)) && a();
    }, l = (p) => {
      p.key === "Escape" && a();
    };
    setTimeout(() => {
      document.addEventListener("click", c), document.addEventListener("keydown", l, !0);
    }, 0);
  });
}
function Wp(e = {}) {
  if (Ha = {
    ...vn,
    ...e,
    jira: { ...vn.jira, ...e.jira },
    linear: { ...vn.linear, ...e.linear },
    github: { ...vn.github, ...e.github },
    plane: { ...vn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (Er = e.projectId), u0(), c0(), p0(), !On)
    try {
      On = mv(_r);
    } catch {
      On = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Wp, openModal: Va, identify: Bp, setMetadata: qp });
const k0 = { init: Wp, openModal: Va, identify: Bp, setMetadata: qp };
export {
  qi as KlavitySims,
  qi as SimsLive,
  $p as clearAnnotation,
  b0 as clearAnnotations,
  k0 as default,
  Bp as identify,
  Wp as init,
  e0 as installKlavitySims,
  Va as openModal,
  qp as setMetadata,
  y0 as showAnnotation
};
