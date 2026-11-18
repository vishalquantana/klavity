var Dh = Object.defineProperty;
var Fh = (e, t, r) => t in e ? Dh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var wi = (e, t, r) => Fh(e, typeof t != "symbol" ? t + "" : t, r);
function Uh(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Qu = 112, ed = 72, td = 89, rd = 115;
let Ds;
function Bh() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function qh(e) {
  let t = -1;
  Ds || (Ds = Bh());
  for (let r = 0; r < e.length; r++)
    t = Ds[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Wh(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Qu && e[r - 2] === ed && e[r - 1] === td && e[r] === rd)
      return r - 3;
  return 0;
}
function Hh(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Qu, n[1] = ed, n[2] = td, n[3] = rd, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = qh(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Wh(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const jh = "AAlwSFlz", Yh = "AAAJcEhZ", Vh = "AAAACXBI";
function Gh(e) {
  let t = e.indexOf(jh);
  return t === -1 && (t = e.indexOf(Yh)), t === -1 && (t = e.indexOf(Vh)), t;
}
const nd = "[modern-screenshot]", Tr = typeof window < "u", Kh = Tr && "Worker" in window, Xh = Tr && "atob" in window, Jh = Tr && "btoa" in window;
var Zu;
const ka = Tr ? (Zu = window.navigator) == null ? void 0 : Zu.userAgent : "", id = ka.includes("Chrome"), ji = ka.includes("AppleWebKit") && !id, va = ka.includes("Firefox"), Zh = (e) => e && "__CONTEXT__" in e, Qh = (e) => e.constructor.name === "CSSFontFaceRule", ef = (e) => e.constructor.name === "CSSImportRule", tf = (e) => e.constructor.name === "CSSLayerBlockRule", or = (e) => e.nodeType === 1, oi = (e) => typeof e.className == "object", sd = (e) => e.tagName === "image", rf = (e) => e.tagName === "use", ei = (e) => or(e) && typeof e.style < "u" && !oi(e), nf = (e) => e.nodeType === 8, sf = (e) => e.nodeType === 3, Pn = (e) => e.tagName === "IMG", rs = (e) => e.tagName === "VIDEO", of = (e) => e.tagName === "CANVAS", af = (e) => e.tagName === "TEXTAREA", lf = (e) => e.tagName === "INPUT", cf = (e) => e.tagName === "STYLE", uf = (e) => e.tagName === "SCRIPT", df = (e) => e.tagName === "SELECT", pf = (e) => e.tagName === "SLOT", hf = (e) => e.tagName === "IFRAME", ff = (...e) => console.warn(nd, ...e);
function mf(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ia = (e) => e.startsWith("data:");
function od(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Tr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Tr)
    return e;
  const r = ns().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function ns(e) {
  return (e && or(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const is = "http://www.w3.org/2000/svg";
function gf(e, t, r) {
  const n = ns(r).createElementNS(is, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function yf(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function bf(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const kf = (e) => bf(e, "dataUrl");
function Ln(e, t) {
  const r = ns(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function ti(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? Ln(e, ns(i)) : e;
    let l = null, p = null;
    function o() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(o, n)), rs(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? ti(c.poster, t).then(r) : o();
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
      const h = sd(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const d = async () => {
        if (Pn(c) && "decode" in c)
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
      if (Pn(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function vf(e, t) {
  ei(e) && (Pn(e) || rs(e) ? await ti(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => ti(n, t)))
  ));
}
const ad = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function ld(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Yl = 0;
function wf(e) {
  const t = `${nd}[#${Yl}]`;
  return Yl++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && ff(...r)
  };
}
function xf(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function ss(e, t) {
  return Zh(e) ? e : Sf(e, { ...t, autoDestruct: !0 });
}
async function Sf(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Tr ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Tr ? window : void 0), p = /* @__PURE__ */ new Map(), o = {
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
      requestInit: xf((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: wf(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: cd(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(is, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Kh && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var k, L, S, x;
          const { url: M, result: v } = y.data;
          v ? (L = (k = p.get(M)) == null ? void 0 : k.resolve) == null || L.call(k, v) : (x = (S = p.get(M)) == null ? void 0 : S.reject) == null || x.call(S, new Error(`Error receiving message from worker: ${M}`));
        }, f.onmessageerror = (y) => {
          var v, k;
          const { url: M } = y.data;
          (k = (v = p.get(M)) == null ? void 0 : v.reject) == null || k.call(v, new Error(`Error receiving message from worker: ${M}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      mf(c) && "image/webp",
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
  o.log.time("wait until load"), await vf(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: d } = Ef(e, o);
  return o.width = h, o.height = d, o;
}
function cd(e) {
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
function Ef(e, t) {
  let { width: r, height: n } = t;
  if (or(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Cf(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await ti(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Mf(e.ownerDocument, t), p = () => {
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
function Mf(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function ud(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Ln(s, e.ownerDocument);
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
function Rf(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return wa(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Tf(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Af(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Ln(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await ti(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Ln(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Ln(e.poster, e.ownerDocument) : r;
    }
    return ud(s, t);
  }
  return r;
}
function Lf(e, t) {
  return of(e) ? ud(e, t) : hf(e) ? Rf(e, t) : Pn(e) ? Tf(e) : rs(e) ? Af(e, t) : e.cloneNode(!1);
}
function _f(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${ad()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const If = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Of = [
  "stroke",
  "fill"
];
function dd(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = oi(e) && i !== "svg", a = s ? Of.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = _f(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const o = p == null ? void 0 : p.document;
  let h, d;
  s ? (h = o.createElementNS(is, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, y]) => {
    d.setAttributeNS(null, f, y);
  }), h.appendChild(d)) : h = d = o.createElement(i), d.textContent = " ", o.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, y = 0; y < f; y++) {
    const M = u.item(y);
    If.includes(M) || m.set(M, u.getPropertyValue(M));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function pd(e, t, r) {
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
function Nf(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), p = dd(e, null, n);
  a == null || a.forEach((f, y) => {
    p.delete(y);
  });
  const o = pd(l, p, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), id && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((d = o.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return o.forEach(([f, y], M) => {
    c.setProperty(M, f, y);
  }), o;
}
function Pf(e, t) {
  (af(e) || lf(e) || df(e)) && t.setAttribute("value", e.value);
}
const zf = [
  "::before",
  "::after"
  // '::placeholder', TODO
], $f = [
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
function Df(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !s)
    return;
  function p(o) {
    var k;
    const h = s.getComputedStyle(e, o);
    let d = h.getPropertyValue("content");
    if (!d || d === "none")
      return;
    i == null || i(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [ad()], m = dd(e, o, n);
    l == null || l.forEach((L, S) => {
      m.delete(S);
    });
    const f = pd(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((k = f.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
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
    let v = c.get(M);
    v || (v = [], c.set(M, v)), v.push(`.${u[0]}${o}`);
  }
  zf.forEach(p), r && $f.forEach(p);
}
const Vl = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Gl(e, t, r, n, i) {
  if (or(r) && (cf(r) || uf(r)) || n.filter && !n.filter(r))
    return;
  Vl.has(t.nodeName) || Vl.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await wa(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Ff(e, s), t.appendChild(s);
}
async function Kl(e, t, r, n) {
  var s;
  let i = e.firstChild;
  or(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!nf(a))
      if (or(a) && pf(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await Gl(e, t, c[l], r, n);
      } else
        await Gl(e, t, a, r, n);
}
function Ff(e, t) {
  if (!ei(e) || !ei(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d: p } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = p, t.style.transform = s.toString();
}
function Uf(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const Bf = /^[\w-:]+$/;
async function wa(e, t, r = !1, n) {
  var p, o, h, d;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && sf(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && or(e) && (ei(e) || oi(e))) {
    const u = await Lf(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = u.getAttributeNames();
      for (let L = k.length, S = 0; S < L; S++) {
        const x = k[S];
        Bf.test(x) || u.removeAttribute(x);
      }
    }
    const m = t.currentNodeStyle = Nf(e, u, r, t);
    r && Uf(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], M = ld((d = m.get("font-family")) == null ? void 0 : d[0]), v = M ? (k) => {
      y === "uppercase" ? k = k.toUpperCase() : y === "lowercase" ? k = k.toLowerCase() : y === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), M.forEach((L) => {
        let S = a.get(L);
        S || a.set(L, S = /* @__PURE__ */ new Set()), k.split("").forEach((x) => S.add(x));
      });
    } : void 0;
    return Df(
      e,
      u,
      f,
      t,
      v
    ), Pf(e, u), rs(e) || await Kl(
      e,
      u,
      t,
      v
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Kl(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function qf(e) {
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
function Wf(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(kf);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function ri(e, t) {
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
  n === "image" && (ji || va) && e.drawImageCount++;
  let M = p.get(r);
  if (!M) {
    d && d instanceof RegExp && d.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, k = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((R) => {
      y.has(R) && y.get(R).forEach((I) => k.add(I));
    });
    const L = v && k.size, S = {
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
      return !ji && r.startsWith("http") && f.length ? new Promise((x, R) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...S }), M.resolve = x, M.reject = R;
      }) : Wf(S);
    })().catch((x) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw x;
    }), p.set(r, M);
  }
  return M.response;
}
async function hd(e, t, r, n) {
  if (!fd(e))
    return e;
  for (const [i, s] of Hf(e, t))
    try {
      const a = await ri(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(jf(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function fd(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const md = /url\((['"]?)([^'"]+?)\1\)/g;
function Hf(e, t) {
  const r = [];
  return e.replace(md, (n, i, s) => (r.push([s, od(s, t)]), n)), r.filter(([n]) => !ia(n));
}
function jf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Yf = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Vf(e, t) {
  return Yf.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((ji || va) && t.drawImageCount++, hd(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Gf(e, t) {
  if (Pn(e)) {
    const r = e.currentSrc || e.src;
    if (!ia(r))
      return [
        ri(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (ji || va) && t.drawImageCount++;
  } else if (oi(e) && !ia(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      ri(t, {
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
function Kf(e, t) {
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
        ri(t, {
          url: s,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function gd(e, t) {
  const { tasks: r } = t;
  or(e) && ((Pn(e) || sd(e)) && r.push(...Gf(e, t)), rf(e) && r.push(...Kf(e, t))), ei(e) && r.push(...Vf(e.style, t)), e.childNodes.forEach((n) => {
    gd(n, t);
  });
}
async function Xf(e, t) {
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
      const l = Jl(c.cssText, t);
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
          if (ef(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await ri(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const M = y.replace(
              md,
              (v, k, L) => v.replace(L, od(L, f))
            );
            for (const v of Zf(M))
              try {
                h.insertRule(v, h.cssRules.length);
              } catch (k) {
                t.log.warn("Error inserting rule from remote css import", { rule: v, error: k });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const d = [];
      l.forEach((u) => {
        sa(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return Qh(u) && fd(u.style.getPropertyValue("src")) && ((m = ld(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          hd(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = Jl(y, t), s.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const Jf = /(\/\*[\s\S]*?\*\/)/g, Xl = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Zf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Jf, "");
  for (; ; ) {
    const s = Xl.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Xl, "");
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
const Qf = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, em = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Jl(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(em, (i) => {
    for (; ; ) {
      const [s, , a] = Qf.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function sa(e, t = []) {
  for (const r of Array.from(e))
    tf(r) ? t.push(...sa(r.cssRules)) : "cssRules" in r ? sa(r.cssRules, t) : t.push(r);
  return t;
}
const tm = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function rm(e) {
  return tm.test(e.innerHTML);
}
async function nm(e, t) {
  const r = await ss(e, t);
  if (or(r.node) && oi(r.node) && !rm(r.node))
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
  const f = await wa(r.node, r, !0);
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
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && or(f) && (i.time("embed web font"), await Xf(f, r), i.timeEnd("embed web font")), i.time("embed node"), gd(f, r);
  const y = s.length;
  let M = 0;
  const v = async () => {
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
  o == null || o(M, y), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const k = im(f, r);
  return c && k.insertBefore(c, k.children[0]), a && k.insertBefore(a, k.children[0]), h && qf(r), await (m == null ? void 0 : m(k)), k;
}
function im(e, t) {
  const { width: r, height: n } = t, i = gf(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function sm(e, t) {
  var a;
  const r = await ss(e, t), n = await nm(r), i = yf(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = cd(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(is, "defs"), r.svgStyles.clear());
  const s = Ln(i, n.ownerDocument);
  return await Cf(s, r);
}
async function om(e, t) {
  const r = await ss(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await sm(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && Xh && Jh) {
    const [p, o] = l.split(",");
    let h = 0, d = !1;
    if (s === "image/png") {
      const k = Gh(o);
      k >= 0 ? (h = Math.ceil((k + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), y = new Uint8Array(f.length);
    for (let k = 0; k < y.length; k++)
      y[k] = f.charCodeAt(k);
    const M = s === "image/png" ? Hh(y, a, d) : Uh(y, a), v = window.btoa(String.fromCharCode(...M));
    l = [p, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function am(e, t) {
  return om(
    await ss(e, { ...t, type: "image/png" })
  );
}
const lm = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", cm = 8e3, um = 16384, Zl = 4096, dm = 16e6, pm = 500, hm = 1e4, Fs = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", yd = 600, fm = 1200, mm = 24, gm = 1024, Ft = 32, ym = 4, bd = 400, bm = 0.985, km = 250;
function kd(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function vm(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return kd(r, location.origin);
}
function wm(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && kd(t.src || "", location.origin)) return !0;
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
function Us(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Ql(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function xm(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Zl / i, Zl / s), l = Math.min(a, c, Math.sqrt(dm / (i * s))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(s * l));
    const o = p.getContext("2d");
    if (!o) return { dataUrl: Fs, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + pm;
    let d = 0;
    const u = () => d >= hm || Date.now() >= h, m = (y, M = !1) => {
      var x;
      if (u() || (d++, !M && t && !t(y))) return;
      const v = getComputedStyle(y);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const k = y.getBoundingClientRect(), L = k.left - n.left, S = k.top - n.top;
      if (k.width > 0 && k.height > 0) {
        Ql(v.backgroundColor) || (o.fillStyle = v.backgroundColor, o.fillRect(L, S, k.width, k.height));
        const R = parseFloat(v.borderTopWidth);
        R > 0 && v.borderTopStyle !== "none" && !Ql(v.borderTopColor) && (o.strokeStyle = v.borderTopColor, o.lineWidth = R, o.strokeRect(L, S, k.width, k.height)), y.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(L, S, k.width, k.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(L, S, k.width, k.height));
      }
      for (const R of Array.from(y.childNodes)) {
        if (u()) break;
        if (R instanceof HTMLElement) {
          m(R);
          continue;
        }
        if (!(R.nodeType !== Node.TEXT_NODE || !((x = R.textContent) != null && x.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(R);
            const F = I.getBoundingClientRect();
            if (F.width <= 0 || F.height <= 0) continue;
            o.save(), o.beginPath(), o.rect(F.left - n.left, F.top - n.top, F.width, F.height), o.clip(), o.fillStyle = v.color, o.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, o.textBaseline = "top", o.fillText(R.textContent.trim(), F.left - n.left, F.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: Fs, scale: 1 };
  } catch {
    return { dataUrl: Fs, scale: 1 };
  }
}
function Sm() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Bs(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Em(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < mm; s++) {
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
async function ec(e, t = yd) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Bs(i.ready, n());
    const s = Em(e);
    s.length && await Bs(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Bs(Sm(), Math.min(n(), 50));
  } catch {
  }
}
function vd(e, t) {
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
async function Cm(e) {
  if (typeof document > "u") return null;
  const t = await vd(e, bd);
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
async function qs(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= gm) return !0;
  try {
    const i = await Cm(e);
    if (i !== null && i <= ym) return !0;
  } catch {
  }
  return !1;
}
async function Mm(e) {
  if (typeof document > "u") return null;
  const t = await vd(e, bd);
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
      0.299 * p + 0.587 * o + 0.114 * h >= km && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function Rm(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Mm(e);
    if (r !== null && r >= bm) return !0;
  } catch {
  }
  return !1;
}
const Tm = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], Am = /* @__PURE__ */ new Set([
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
function Lm(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function _m(e) {
  const t = (e || "").toLowerCase();
  return Tm.some((r) => t.includes(r));
}
const Im = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Om(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Im.test(t);
}
function Nm(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Lm(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(_m(r) || n && !Am.has(n) && t.includes("_") && Om(t));
}
function Pm(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    Nm({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Ui = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, zm = 3e3, $m = 4e3, tc = 24, rc = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Dm(e, t = $m) {
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
function Fm(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < tc; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < tc; l++) {
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
function Um(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Bm(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Um(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function qm(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Fm(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => Dm(c)), a = [];
  for (const c of n) {
    const l = [];
    rc.lastIndex = 0;
    let p;
    for (; (p = rc.exec(c.src)) !== null; ) {
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
      m && (o = Bm(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Wm() {
  try {
    return await Promise.race([
      qm({}).catch(() => Ui),
      new Promise((e) => setTimeout(() => e(Ui), zm))
    ]);
  } catch {
    return Ui;
  }
}
function Hm(e, t) {
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
async function jm(e, t = {}) {
  return (await Ym(e, t)).dataUrl;
}
async function Ym(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? Ui : await Wm(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Hm(am(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (d) => Pm(d, c.embeddedFamilies),
      maximumCanvasSize: um,
      fetch: { placeholderImage: lm },
      filter: (d) => n && !n(d) || wm(d) ? !1 : vm(d) ? (r++, !1) : !0
    }), cm);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await ec(e, yd);
  try {
    let o = await p(), h = await qs(o);
    if (h) {
      await ec(e, fm);
      try {
        const u = await p();
        await qs(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && Us(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Us("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await Rm(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    Us(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = xm(e, n, a), u = await qs(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const Vm = {
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
function Gm(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function G(e, t = {}) {
  const r = Vm[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${Gm(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const wd = "https://klavity.in", wn = {
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
function Ws(e, t, r) {
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
function xi(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function Km(e) {
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
function Xm(e) {
  const t = Km(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function Hs(e) {
  return Xm(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class oa {
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
    const s = Hs(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = Hs(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = Hs(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = Ws((o) => xi(t, o), r.text, a), l = s * 1.25, p = r.outline ?? "none";
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
        for (let v = o; v < y; v++)
          for (let k = h; k < M; k++) {
            const L = (v * s + k) * 4;
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
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, Ws((h) => xi(r, h), t.text, a).length));
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
    const c = Ws((d) => xi(r, d), t.text, a);
    let l = 0;
    for (const d of c) l = Math.max(l, xi(r, d));
    const p = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(p, c.length * p), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function Jm(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function Zm(e, t, r, n) {
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
          const o = new oa(l, e);
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
async function Qm(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: wd }, i = {
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
const eg = 50, tg = 2e3, rg = 1e3, ng = 500, nc = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Si(e, t) {
  e.push(t), e.length > eg && e.shift();
}
function xa(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function js(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      nc.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => nc.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return xa(t, rg);
}
function ig(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return xa(JSON.stringify(e), ng);
  } catch {
    return String(e);
  }
}
function sg(e, t = {}) {
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
function og(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, o) => {
    Si(e.consoleErrors, { message: xa(p, tg), stack: o, timestamp: Date.now(), level: l });
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
          n() && i(p, h.map(ig).join(" "));
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
      return Si(e.networkFailures, { url: js(o), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw Si(e.networkFailures, { url: js(o), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
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
            Si(e.networkFailures, {
              url: js(h.url),
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
const ag = ["light", "dark", "glass", "neon", "custom", "liquid"], lg = ["hidden", "icon", "full", "custom"], cg = ["lightbulb", "bug"], ug = ["full", "reportOnly", "off"], dg = /^#[0-9a-fA-F]{3,8}$/, pg = /^[\w \-,'"().]+$/, ic = (e) => typeof e == "object" && e !== null, Ei = (e) => typeof e == "string" && dg.test(e.trim()) ? e.trim() : void 0, Ci = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, hg = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && pg.test(t) ? t : void 0;
}, sc = {
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
function oc(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function xd(e) {
  const t = ic(e) ? e : {}, n = { theme: typeof t.theme == "string" && ag.includes(t.theme) ? t.theme : "light" }, i = Ei(t.primary), s = Ei(t.secondary), a = Ei(t.background), c = Ci(t.thankYou, 140), l = hg(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && lg.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Ci(t.launcherText, 60);
  p && (n.launcherText = p);
  const o = Ei(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && cg.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && ug.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Ci(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = ic(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Ci(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function fg(e) {
  const t = xd(e), r = t.theme === "custom" ? { ...sc.light } : { ...sc[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = oc(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && oc(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function mg(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function Mi(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function ac(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = mg(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
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
let Xn = ht;
function gg() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const yg = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Sd(e) {
  for (const t of yg)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const An = class An {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...gg(), ...t.deps || {} };
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
    this._stream = t, this._mime = Sd(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), An.MAX_SESSION_MS), this._beginSegment();
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
      }, An.SEGMENT_MS);
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
An.SEGMENT_MS = 2500, An.MAX_SESSION_MS = 18e4;
let Yi = An;
function bg() {
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
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...bg(), ...t.deps || {} };
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
    this._stream = t, this._mime = Sd(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), nt.MAX_SESSION_MS), this._openSocket();
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
let Vi = nt;
function kg(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function tt(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const vg = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function wg(e) {
  const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(i) {
      let s = i.parentElement;
      for (; s && s !== e; ) {
        if (vg.has(s.tagName)) return NodeFilter.FILTER_REJECT;
        s = s.parentElement;
      }
      return /\d/.test(i.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), r = [];
  let n;
  for (; n = t.nextNode(); ) r.push(n);
  return r;
}
function xg(e) {
  const t = [], r = window.innerWidth, n = window.innerHeight, i = (o) => !!(o.closest && o.closest("[data-klavity-ui], #klavity-widget-host")), s = (o, h) => {
    if (!h || typeof document.elementsFromPoint != "function") return !1;
    const d = Math.min(2, o.width / 4), u = Math.min(2, o.height / 4), m = [
      [o.left + o.width / 2, o.top + o.height / 2],
      [o.left + d, o.top + u],
      [o.left + o.width - d, o.top + u],
      [o.left + d, o.top + o.height - u],
      [o.left + o.width - d, o.top + o.height - u]
    ];
    for (const [f, y] of m) {
      if (f < 0 || y < 0 || f >= r || y >= n) return !1;
      let M = null;
      try {
        M = document.elementsFromPoint(f, y).find((v) => !i(v)) || null;
      } catch {
        return !1;
      }
      if (!M || M === h || h.contains(M) || M.contains(h)) return !1;
    }
    return !0;
  }, a = (o, h, d) => {
    !(o.width > 0 && o.height > 0) || s(o, d) || t.push(h ? { x: o.left, y: o.top, w: o.width, h: o.height, fixed: h } : { x: o.left, y: o.top, w: o.width, h: o.height });
  }, c = /* @__PURE__ */ new Map(), l = (o) => {
    if (!o || o === document.documentElement) return !1;
    const h = c.get(o);
    if (h !== void 0) return h;
    let d = !1;
    try {
      d = getComputedStyle(o).position === "fixed";
    } catch {
      d = !1;
    }
    return d || (d = l(o.parentElement)), c.set(o, d), d;
  };
  for (const o of wg(e)) {
    const h = l(o.parentElement), d = o.textContent ?? "", u = /\d+/g;
    let m;
    for (; m = u.exec(d); )
      try {
        const f = document.createRange();
        f.setStart(o, m.index), f.setEnd(o, m.index + m[0].length);
        const y = f.getClientRects ? f.getClientRects() : null;
        if (y) for (let M = 0; M < y.length; M++) a(y[M], h, o.parentElement);
      } catch {
      }
  }
  e.querySelectorAll("input, select").forEach((o) => {
    /\d/.test(o.value) && a(o.getBoundingClientRect(), l(o), o);
  });
  const p = document.documentElement;
  return {
    rects: t,
    vw: window.innerWidth,
    vh: window.innerHeight,
    sx: window.scrollX || 0,
    sy: window.scrollY || 0,
    dw: Math.max(p.scrollWidth, window.innerWidth),
    dh: Math.max(p.scrollHeight, window.innerHeight)
  };
}
function Sg(e, t, r, n) {
  if (!(t > 0 && r > 0)) return null;
  const i = (m, f) => f > 0 && Math.abs(m - f) / f < 0.04;
  let s, a, c, l = !1;
  const p = (n == null ? void 0 : n.kind) === "region" || (n == null ? void 0 : n.kind) === "element" ? n.rect : void 0, o = t / r, h = i(o, e.vw / e.vh);
  if (p && p.w > 0 && p.h > 0)
    s = t / p.w, a = p.x, c = p.y;
  else if ((n == null ? void 0 : n.kind) === "full")
    s = t / e.dw, a = -e.sx, c = -e.sy, l = !0;
  else if ((n == null ? void 0 : n.kind) === "viewport") {
    if (!h) return null;
    s = t / e.vw, a = 0, c = 0;
  } else if (i(o, e.dw / e.dh) && !h)
    s = t / e.dw, a = -e.sx, c = -e.sy, l = !0;
  else if (h)
    s = t / e.vw, a = 0, c = 0;
  else return null;
  const d = 2 * s, u = [];
  for (const m of e.rects) {
    const f = l && m.fixed ? { x: m.x - e.sx, y: m.y - e.sy, w: m.w, h: m.h } : m, y = Math.max(0, (f.x - a) * s - d), M = Math.max(0, (f.y - c) * s - d), v = Math.min(t, (f.x - a + f.w) * s + d), k = Math.min(r, (f.y - c + f.h) * s + d);
    v > y && k > M && u.push({ x: y, y: M, w: v - y, h: k - M });
  }
  return u;
}
function Eg(e, t) {
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
const Ed = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Cg = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, Mg = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Rg = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Tg = /* @__PURE__ */ new Set([
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
]), Ag = { needs: "Needs detail", good: "Good", great: "Great" };
function Lg(e) {
  let t = e;
  for (const r of Ed) t = t.split(r).join(" ");
  return t;
}
function _g(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Tg.has(n) || r++;
  return r;
}
function Cd(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Lg(r), i = _g(n), s = t.length > 0 && Ed.some((d) => r.includes(d)) && i < 3, a = i >= 3 && t.length >= 12, c = Rg.test(r), l = Cg.test(r) || Mg.test(t), p = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: p, level: h, label: Ag[h], vague: s };
}
function Ig(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Cd(t).level !== "great";
}
const Og = [
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
function Ng(e) {
  const t = (e || "").toLowerCase();
  return t ? Og.some((r) => t.includes(r)) : !1;
}
function Md(e) {
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
function Rd(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", Md(t.source)],
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
async function Pg() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function zg() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let $g = 0;
function Dg(e) {
  const t = e.host || zg(), r = "kl-shp-" + ++$g, n = document.createElement("div");
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
  const v = document.createElement("span");
  v.className = "kl-shp-cancel", v.textContent = "Cancel", v.style.cursor = "pointer", v.addEventListener("click", (R) => {
    var I;
    R.stopPropagation(), n.classList.remove("kl-show");
    try {
      (I = e.onCancel) == null || I.call(e);
    } catch {
    }
  });
  const k = document.createElement("span");
  k.className = "kl-shp-allow", k.textContent = "Allow", M.append(v, k), l.append(p, d, M);
  const L = document.createElement("div");
  L.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const x = document.createElement("span");
  return x.textContent = e.steer, L.append(S, x), n.append(i, s, l, L), n;
}
const Fg = 1, Ug = 6, Bg = 1.08;
function qg(e, t = Fg, r = Ug) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Wg(e, t = Bg) {
  return e < 0 ? t : 1 / t;
}
function Hg(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Td(e, t) {
  return t > 0 ? e.width / t : 1;
}
function jg(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Yg(e, t, r, n, i, s) {
  const a = Td(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), p = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, d = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: p, y: h, w: Math.max(0, o - p), h: Math.max(0, d - h) };
}
function Vg(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function Gg(e, t, r, n, i, s) {
  const a = Td(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function Kg(e) {
  return Rd("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || Md()
  });
}
function Xg(e) {
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
function Jg(e, t, r) {
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
function lc(e) {
  let t = Le(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function cc(e) {
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
const aa = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function Zg(e) {
  var t;
  return ((t = aa.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function Qg(e) {
  const t = (a) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(a) || /^\s*()(\d+)\s*$/.exec(a);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, s = n ? t(n) : null;
  return { startSec: i, endSec: i != null && s != null && s <= i ? null : s };
}
function ey(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function Ad(e, t, r = 960, n = 6e3) {
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
const ty = 8;
function ry(e, t = ty) {
  const r = Number(e);
  if (!isFinite(r) || r <= 0) return [];
  const n = Math.max(2, Math.min(t, Math.ceil(r / 10)));
  return Array.from({ length: n }, (i, s) => Math.round((s + 0.5) * r / n * 10) / 10);
}
async function ny(e, t) {
  const r = [];
  for (const n of ry(t)) {
    const i = await Ad(e, n, 768, 4e3);
    if (!i) break;
    r.push({ atSec: n, dataUrl: i });
  }
  return r;
}
function uc(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : Ld({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function la(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function dc(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = la(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${s ? ` Related: ${s}.` : ""}`;
}
function Ld(e) {
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
function iy(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const sy = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function oy(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return sy.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Ys(e, t) {
  return oy(t) || iy(e);
}
function Vs(e) {
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
function pc(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function ay(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const ly = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function ca(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function cy(e) {
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
const uy = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", dy = 100, py = dy * 1024 * 1024;
function hy(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function bn(e) {
  return ca(e) ? "video" : hy(e) ? "image" : "file";
}
function fy(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function Ri(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function my(e, t, r = {}) {
  var Il, Ol, Nl, Pl, zl;
  const n = xd(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, p = [], o = [], h = [], d = null, u = [], m = !1, f = !1, y = !1, M = !1;
  const v = !!t.onMinimize, k = v ? 8 : 5, L = 3e4, S = 10 * 1024 * 1024, x = !!t.allowFileAttachments, R = 5, I = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : py, F = t.reporterRole ?? "anon", z = t.upgradeUrl, Q = Math.max(120 * 1024 * 1024, I + 20 * 1024 * 1024);
  let W = [];
  const O = /* @__PURE__ */ new WeakMap(), Ue = () => typeof URL < "u" && typeof URL.createObjectURL == "function", Xe = (g) => O.get(g) || g.dataUrl, me = (g) => {
    const b = O.get(g);
    if (b) {
      try {
        URL.revokeObjectURL(b);
      } catch {
      }
      O.delete(g);
    }
  };
  let pe = null;
  const _e = !!(t.allowRecording && t.onRecord), We = _e && !!t.onSplitRecording, Ie = kg({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Yi.isSupported(),
    webSpeechSupported: Xn.isSupported()
  }), we = Ie !== "none", Ke = 2;
  let P = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], X = P.map((g) => g.id || g.dataUrl).join("|");
  const se = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, re = {}, fe = /* @__PURE__ */ new Map(), Re = /* @__PURE__ */ new Map(), je = /* @__PURE__ */ new Map(), gt = /* @__PURE__ */ new Map();
  let ce = 0, ye = null;
  const Ce = () => {
    const g = Object.keys(re);
    if (!g.length && !ye) return null;
    const b = {};
    if (g.length) {
      const w = {};
      for (const E of g) w[E] = re[E];
      const C = re[0] ?? re[Number(g[0])] ?? {};
      Object.assign(b, C, { byIndex: w });
    }
    return ye && (b.selector = ye.selector, b.selectorText = ye.text), b;
  };
  let xe = e, de = 0, ae = null, be = null, Or = null, di = t.replayState === "attached", Ot = null, Nr = null, Be = "idle", lt = null, Se = null, yt = null, Et = !1, ar = "", ut = 0, De = null, Jt = !1, Pr = "", oe = null, Ee = null, Pe = null, rt = null, Oe = !1;
  const zr = [];
  function an(g) {
    if (typeof window > "u") return;
    const b = () => {
      Oe || g();
    };
    window.addEventListener("beforeunload", b), window.addEventListener("pagehide", b), zr.push(() => {
      window.removeEventListener("beforeunload", b), window.removeEventListener("pagehide", b);
    });
  }
  const $n = 4e3, Dn = 5e3, Je = {}, Tt = {}, Fn = (g) => g ? JSON.parse(JSON.stringify(g)) : null, ln = (g) => {
    var b;
    try {
      (b = t.onAnnotationsChanged) == null || b.call(t, g, Fn(re[g]));
    } catch {
    }
  }, Vp = () => {
    const g = {};
    for (const b of Object.keys(re)) {
      const w = re[b];
      w && (g[Number(b)] = Fn(w));
    }
    return g;
  }, Xa = (g) => ({
    url: c[g],
    compressed: p[g],
    ann: Fn(re[g])
  }), cn = (g) => {
    (Je[g] ?? (Je[g] = [])).push(Xa(g));
  }, Ja = (g, b) => {
    const w = i ? gt.get(b.url) : je.get(b.url);
    w ? (c[g] = w, p[g] = t.compressImage ? t.compressImage(w) : Promise.resolve(w)) : (c[g] = b.url, p[g] = b.compressed), b.ann ? re[g] = Fn(b.ann) : delete re[g];
  }, Za = (g) => {
    const b = Je[g];
    if (!b || !b.length) return !1;
    const w = b.pop(), C = Tt[g];
    for (; C && C.length && C[C.length - 1].mark >= b.length; ) C.pop();
    return Ja(g, w), ln(g), Ne(), !0;
  }, Gp = (g) => {
    const b = Tt[g];
    if (!b || !b.length) return !1;
    const { snap: w, mark: C } = b.pop();
    return Je[g] && (Je[g].length = Math.min(Je[g].length, C)), Ja(g, w), ln(g), Ne(), !0;
  }, Qa = document.createElement("style");
  Qa.textContent = `
    ${fg(n)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    /* KD-3086: the composer fills the window (36px side / 16px top-bottom inset) with a wider form column
       (--kl-side-w, 384-580px, scales with the screen) so the screenshot gets the most room and the form isn't cramped.
       A DEFINITE height (not just max-height) + grid-template-rows:minmax(0,1fr) so the row has a
       resolved height. This is what makes the hero canvas's object-fit:contain actually shrink a tall
       screenshot to fit (KLAVITYKLA-402) instead of the tall image blowing out the row and pushing the
       right-pane Submit button below the clipped fold. min-height:0 tracks let both panes scroll internally. */
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;--kl-side-w:clamp(384px,30vw,580px);width:calc(100vw - 72px);max-width:none;height:calc(100vh - 32px);max-height:calc(100vh - 32px);box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom right;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) var(--kl-side-w);grid-template-rows:minmax(0,1fr);}
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
    /* KD-3086: in the wide form column the capture buttons sit on a tidy 3-column grid (Snap/Full Page/Attach,
       Record me/Region/Pick element) instead of flex-wrapping 5 + 1 with a stretched last button. */
    @media (min-width:761px){.klavity-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));}.klavity-actions button{min-width:0;}}
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
    /* KD-3086: the side column's top row carries a "New report" heading, left of minimize / close (wide layout only). */
    .kl-side-head{display:none;}
    @media (min-width:761px){.kl-side-head{display:flex;align-items:center;position:absolute;top:0;right:0;width:var(--kl-side-w);height:58px;padding:0 96px 0 20px;box-sizing:border-box;font-size:15px;font-weight:700;letter-spacing:-.01em;color:var(--kl-fg);pointer-events:none;z-index:2;}}
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
  `, a.appendChild(Qa);
  const $r = document.createElement("div");
  $r.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${v ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${G("x", { size: 16 })}</button>
    <div class="kl-side-head" id="klavity-side-head" aria-hidden="true">New report</div>
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
      ${se ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${se.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Le(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Le(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Le(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
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
      
      
      <input type="file" id="klavity-file" accept="${x ? uy : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(I / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${k} images</div>
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
  `, $r.appendChild(le), a.appendChild($r);
  const ze = a.getElementById("klavity-sharp"), el = a.querySelector(".klavity-info-pop");
  if (ze && el) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = el.innerHTML, a.appendChild(g);
    const b = Dg({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    b.style.position = "fixed", a.appendChild(b);
    let w = !1;
    Pg().then((A) => {
      w = A;
    }).catch(() => {
    });
    const C = (A, N) => {
      const _ = ze.getBoundingClientRect(), U = Math.min(N, window.innerWidth - 16), D = 8, B = window.innerWidth, Y = window.innerHeight;
      A.style.left = Math.max(D, Math.min(_.left + _.width / 2 - U / 2, B - U - D)) + "px", A.style.top = "-9999px", A.style.visibility = "hidden", A.style.display = "block";
      const q = A.offsetHeight;
      A.style.display = "";
      let j = _.bottom + 8;
      j + q + D > Y && (j = _.top - q - 8), A.style.top = Math.max(D, Math.min(j, Y - q - D)) + "px", A.style.visibility = "";
    }, E = () => {
      !t.snapWithoutSharePrompt && !M && !w ? (g.classList.remove("kl-show"), C(b, 288), b.classList.add("kl-show")) : (b.classList.remove("kl-show"), C(g, 228), g.classList.add("kl-show"));
    }, T = () => {
      g.classList.remove("kl-show"), b.classList.remove("kl-show");
    };
    ze.addEventListener("mouseenter", E), ze.addEventListener("mouseleave", T), ze.addEventListener("focus", E), ze.addEventListener("blur", T);
  }
  let tl = !1, un = null;
  function ks() {
    try {
      un == null || un.remove();
    } catch {
    }
    un = null;
    try {
      ze == null || ze.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Kp() {
    var T;
    if (tl || !ze || Oe) return;
    tl = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${G("x", { size: 13 })}</button></div>`, a.appendChild(g), un = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const b = 8, w = Math.min(228, window.innerWidth - 16);
    let C = 0;
    const E = () => {
      if (!un || Oe) return;
      const A = ze.getBoundingClientRect();
      if ((A.width === 0 || A.height === 0) && C++ < 20) {
        requestAnimationFrame(E);
        return;
      }
      const N = window.innerWidth, _ = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const U = g.offsetHeight;
      g.style.left = Math.max(b, Math.min(A.right - w, N - w - b)) + "px";
      let D = A.bottom + 8;
      D + U + b > _ && (D = A.top - U - 8), g.style.top = Math.max(b, Math.min(D, _ - U - b)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(E), (T = g.querySelector(".kl-nudge-x")) == null || T.addEventListener("click", ks);
    try {
      ze.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => ks(), 9e3);
    } catch {
    }
    ze.addEventListener("click", ks, { once: !0 });
  }
  function Xp(g) {
    di = g === "attached", ot();
  }
  const rl = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, b, w, C, E, T) => Nt(g, b, w, !1, !!C, E, T),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, b, w, C, E) => Nt(g, b, w, !0, !!C, E),
    close: lr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: Vp,
    setReplayState: Xp,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (pe = Ri(g), !Oe)
        try {
          Ne(), Es();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || Oe) return;
      const b = P.findIndex((w) => w.id && g.id && w.id === g.id || w.dataUrl && g.dataUrl && w.dataUrl === g.dataUrl);
      b >= 0 ? (P[b] = g, be = b) : (P.push(g), be = P.length - 1), ae = null, dn();
    }
  };
  function Ne() {
    const g = a.getElementById("klavity-strip"), b = a.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((w, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb", C === de && E.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = w, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && E.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        de = C, ae = null, be = null, Ne();
      });
      const A = document.createElement("button");
      A.className = "klavity-rm", A.innerHTML = G("x", { size: 13 }), A.title = "Remove", A.addEventListener("click", (D) => {
        D.stopPropagation(), nl(C), Ne();
      });
      const N = document.createElement("button");
      N.className = "klavity-mk", N.innerHTML = G("pencil", { size: 13 }), N.title = "Mark up", N.addEventListener("click", (D) => {
        D.stopPropagation(), Ah(C);
      });
      const _ = document.createElement("div");
      _.className = "klavity-thumb-media", _.append(T, A, N), E.append(_);
      const U = o[C];
      if (U) {
        const D = ly[U], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + U, B.title = U === "real-pixel" ? "Pixel-perfect capture (every image included)" : U === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', B.innerHTML = G(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Le(D.label) + "</span>", _.appendChild(B), D.degraded && t.onRetakeSharp) {
          const Y = document.createElement("button");
          Y.type = "button", Y.className = "klavity-retake", Y.innerHTML = G("zap", { size: 11 }) + "<span>Retake sharp</span>", Y.title = "Recapture this shot at full pixel quality", Y.addEventListener("click", (q) => {
            q.stopPropagation(), Qp(C, Y);
          }), E.appendChild(Y);
        }
      }
      if (ll.has(C)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", E.appendChild(D);
      }
      g.appendChild(E);
    }), W.forEach((w, C) => {
      if (bn(w) !== "video") return;
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb", ae === C && E.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = Xe(w), T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const A = document.createElement("span");
      A.className = "kl-video-play", A.setAttribute("aria-hidden", "true"), A.innerHTML = G("play", { size: 16 });
      const N = document.createElement("span");
      N.className = "kl-video-badge", N.innerHTML = G("play", { size: 9 }) + "<span>Video</span>", E.title = "Click to play " + w.name, E.addEventListener("click", () => {
        ae = C, be = null, Ne();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = G("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (D) => {
        D.stopPropagation(), ul(C);
      }), E.append(T, A, N, _);
      const U = Ri(pe);
      if (U != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = U + "%", D.appendChild(B), E.appendChild(D);
      }
      g.appendChild(E);
    }), P.forEach((w, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb kl-rec-tile", be === C && E.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      let A = w.dataUrl;
      w.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (A = w._previewUrl || (w._previewUrl = URL.createObjectURL(w.blob))), T.src = A, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const N = document.createElement("span");
      N.className = "kl-video-play", N.setAttribute("aria-hidden", "true"), N.innerHTML = G("play", { size: 16 });
      const _ = Math.round(w.durationMs / 1e3), U = document.createElement("span");
      U.className = "kl-video-badge", U.innerHTML = G("play", { size: 9 }) + `<span>${Math.floor(_ / 60)}:${String(_ % 60).padStart(2, "0")}${w.screenOnly ? " · screen" : ""}</span>`, E.title = "Click to play your recording", E.addEventListener("click", () => {
        be = C, ae = null, Ne();
      });
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-rerec", D.innerHTML = G("refresh-cw", { size: 12 }), D.title = "Re-record", D.setAttribute("aria-label", "Re-record"), D.addEventListener("click", (q) => {
        var K;
        q.stopPropagation();
        const j = P.splice(C, 1)[0];
        if (j && j._previewUrl)
          try {
            URL.revokeObjectURL(j._previewUrl);
          } catch {
          }
        be === C ? be = null : be != null && be > C && (be -= 1), dn();
        try {
          (K = a.getElementById("klavity-record")) == null || K.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = G("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (q) => {
        q.stopPropagation();
        const j = P.splice(C, 1)[0];
        if (j && j._previewUrl)
          try {
            URL.revokeObjectURL(j._previewUrl);
          } catch {
          }
        be === C ? be = null : be != null && be > C && (be -= 1), dn();
      }), E.append(T, N, U, D, B);
      const Y = Ri(pe);
      if (Y != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const j = document.createElement("i");
        j.style.width = Y + "%", q.appendChild(j), E.appendChild(q);
      }
      g.appendChild(E);
    });
    try {
      const w = g.children[de];
      w && typeof w.scrollIntoView == "function" && w.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const w = document.createElement("div");
      w.className = "kl-thumb-skel kl-loading", w.setAttribute("role", "status"), w.setAttribute("aria-label", "Capturing screenshot"), w.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(w);
    }
    b.textContent = `${c.length}/${k} images`, b instanceof HTMLElement && (b.hidden = c.length === 0), ot(), pi(), Ll();
  }
  function pi() {
    const g = a.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && de >= 0 && de < c.length && !!h[de] && !m && !!t.onCaptureSharp && !Pt) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const C = document.createElement("span");
        C.className = "kl-sh-ic", C.innerHTML = G("triangle-alert", { size: 15 });
        const E = document.createElement("span");
        E.className = "kl-sh-txt", E.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          m = !0, pi(), ze == null || ze.click();
        });
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-x", A.setAttribute("aria-label", "Dismiss"), A.title = "Dismiss", A.innerHTML = G("x", { size: 12 }), A.addEventListener("click", () => {
          m = !0, pi();
        }), g.append(C, E, T, A);
      }
      g.hidden = !1, ze == null || ze.classList.add("kl-suggest");
    } else
      g.hidden = !0, ze == null || ze.classList.remove("kl-suggest");
  }
  function vs() {
    f = !0, l = !1, Ne();
  }
  function Jp() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Bt(g) {
    const b = a.getElementById("klavity-err");
    b && (b.textContent = g, b.style.display = "block");
  }
  function ws() {
    const g = a.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function nl(g) {
    var b;
    if (!(g < 0 || g >= c.length)) {
      c.splice(g, 1), p.splice(g, 1), o.splice(g, 1), h.splice(g, 1), u.splice(g, 1), delete re[g];
      for (const w of Object.keys(re).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        re[w - 1] = re[w], delete re[w];
      try {
        (b = t.onShotRemoved) == null || b.call(t, g);
      } catch {
      }
      delete Je[g], delete Tt[g];
      for (const w of Object.keys(Je).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        Je[w - 1] = Je[w], delete Je[w];
      for (const w of Object.keys(Tt).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        Tt[w - 1] = Tt[w], delete Tt[w];
      c.length === 0 && Qt(null);
    }
  }
  function Nt(g, b, w, C = !0, E = !1, T, A) {
    var _;
    if (c.length >= k) {
      Bt(`You can attach up to ${k} images.`);
      return;
    }
    ws(), y = !1, f = !1, c.push(g);
    const N = c.length - 1;
    if (A && Array.isArray(A.shapes) && A.shapes.length && (re[N] = Fn(A)), p.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), o.push(b), h.push(E && b !== "real-pixel"), u.push(T), C && (de = c.length - 1, ae = null, be = null), Ne(), C)
      try {
        (_ = t.onShotAdded) == null || _.call(t, g, b);
      } catch {
      }
  }
  function Dr() {
    return { restore: null, geo: null };
  }
  function Fr(g, b, w) {
    if (g) {
      try {
        const C = xg(document.body);
        C.rects.length && fe.set(g, { geo: C, capture: w });
      } catch {
      }
      i && Zp();
    }
  }
  let xs = Promise.resolve(), Un = 0;
  function il(g) {
    Un++, xs = g.then(() => {
      Un--;
    }, () => {
      Un--;
    });
  }
  function Zp() {
    il(new Promise((g) => setTimeout(() => {
      al().then(g, g);
    }, 0)));
  }
  function sl(g, b, w) {
    const C = Re.get(g);
    if (C) return C;
    const E = fe.get(g);
    if (!E) return null;
    const T = Sg(E.geo, b, w, E.capture);
    return T && Re.set(g, T), T;
  }
  function ol(g, b) {
    var w;
    c[g] = b, p[g] = t.compressImage ? t.compressImage(b) : Promise.resolve(b), Ne();
    try {
      (w = t.onShotReplaced) == null || w.call(t, g, b, o[g]);
    } catch {
    }
  }
  async function al() {
    const g = ++ce;
    for (let b = 0; b < c.length; b++) {
      const w = c[b];
      if (!w) continue;
      if (!i) {
        const T = je.get(w);
        T && ol(b, T);
        continue;
      }
      if (je.has(w)) continue;
      let C = gt.get(w);
      if (!C) {
        const T = await Eg(w, (A, N) => sl(w, A, N));
        if (!T) continue;
        C = T.url, gt.set(w, C), je.set(C, w), Re.set(C, T.rects);
      }
      if (g !== ce) return;
      const E = c.indexOf(w);
      E >= 0 && ol(E, C);
    }
  }
  const ll = /* @__PURE__ */ new Set();
  async function Qp(g, b) {
    if (!(Pt || !t.onRetakeSharp)) {
      ct(!0), b.classList.add("kl-loading"), s.style.display = "none";
      try {
        const { restore: w, geo: C } = Dr();
        let E;
        try {
          E = await t.onRetakeSharp(u[g]);
        } finally {
          w == null || w();
        }
        if (E) {
          const { dataUrl: T, quality: A } = Ht(E);
          Fr(T, C, u[g]), T && (c[g] = T, p[g] = t.compressImage ? t.compressImage(T) : Promise.resolve(T), o[g] = A ?? "real-pixel", h[g] = !1, re[g] && (delete re[g], ll.add(g), ln(g)), delete Je[g], delete Tt[g]);
        }
      } catch {
      } finally {
        s.style.display = "", ct(!1), Ne();
      }
    }
  }
  function cl(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function Ss(g) {
    ws();
    for (const b of g) {
      if (c.length >= k) {
        Bt(`You can attach up to ${k} images.`);
        break;
      }
      if (!cl(b)) {
        Bt(`"${b.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (b.size > S) {
        Bt(`"${b.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        Nt(await hc(b));
      } catch {
        Bt(`Couldn't add "${b.name}". Please try a different image.`);
      }
    }
  }
  function Es() {
    const g = a.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const b = W.filter((w) => bn(w) === "file");
    g.hidden = b.length === 0, W.forEach((w, C) => {
      if (bn(w) !== "file") return;
      const E = document.createElement("div");
      E.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = G("file-text", { size: 14 });
      const A = document.createElement("span");
      A.className = "kl-file-nm", A.textContent = w.name, A.title = w.name;
      const N = document.createElement("span");
      N.className = "kl-file-sz", N.textContent = w.size < 1024 ? `${w.size} B` : w.size < 1024 * 1024 ? `${Math.round(w.size / 1024)} KB` : `${(w.size / 1024 / 1024).toFixed(1)} MB`;
      const _ = document.createElement("button");
      _.type = "button", _.className = "kl-file-rm", _.setAttribute("aria-label", `Remove ${w.name}`), _.title = "Remove", _.innerHTML = G("x", { size: 11 }), _.addEventListener("click", () => {
        ul(C);
      }), E.append(T, A, N, _);
      const U = Ri(pe);
      if (U != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = U + "%", D.appendChild(B), E.appendChild(D);
      }
      g.appendChild(E);
    }), ot();
  }
  function ul(g) {
    const b = W[g] && bn(W[g]) === "video";
    W[g] && me(W[g]), W.splice(g, 1), ae != null && (b && ae === g ? ae = null : ae > g && (ae -= 1)), Es(), Ne();
  }
  function eh(g, b) {
    if (g.kind === "upgrade") {
      if (!g.url) return null;
      const C = document.createElement("a");
      return C.className = "kl-capmsg-cta", C.href = g.url, C.target = "_blank", C.rel = "noopener noreferrer", C.textContent = g.label, C;
    }
    if (!t.onRequestUpgrade) return null;
    const w = document.createElement("button");
    return w.type = "button", w.className = "kl-capmsg-cta kl-capmsg-req", w.textContent = g.label, w.addEventListener("click", async () => {
      if (w.disabled) return;
      const C = w.textContent || g.label;
      w.disabled = !0, w.textContent = "Requesting…";
      let E = !1;
      try {
        E = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: b });
      } catch {
        E = !1;
      }
      if (E) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${G("check")}</span>Request sent to your team`, w.replaceWith(T);
      } else
        w.disabled = !1, w.textContent = C;
    }), w;
  }
  function th(g, b) {
    const w = a.getElementById("klavity-capmsg");
    if (!w || !g.overCap) return;
    w.innerHTML = "";
    const C = document.createElement("span");
    if (C.className = "kl-capmsg-t", C.textContent = g.message || "", w.appendChild(C), g.cta) {
      const E = eh(g.cta, b);
      if (E && w.appendChild(E), g.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = g.cta.hint, w.appendChild(T);
      }
    }
    w.hidden = !1;
  }
  function rh() {
    const g = a.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function nh(g) {
    ws(), rh();
    for (const b of g) {
      if (cl(b)) {
        await Ss([b]);
        continue;
      }
      if (W.length >= R) {
        Bt(`You can attach up to ${R} files.`);
        break;
      }
      const w = fy(b, { capBytes: I, role: F, upgradeUrl: z });
      if (w.overCap) {
        th(w, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: b.name, sizeMb: Math.round(b.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (W.reduce((E, T) => E + T.size, 0) + b.size > Q) {
        Bt(`Attachments exceed the ${Math.round(Q / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const E = b.type || (ca(b) ? cy(b.name) : ""), T = ca(b) && Ue(), A = T ? { name: b.name, type: E, size: b.size, dataUrl: "", blob: b } : { name: b.name, type: E, size: b.size, dataUrl: await hc(b) };
        if (T)
          try {
            O.set(A, URL.createObjectURL(b));
          } catch {
          }
        const N = W.push(A) - 1;
        Es(), bn(W[N]) === "video" && (ae = N), Ne();
      } catch {
        Bt(`Couldn't add "${b.name}". Please try a different file.`);
      }
    }
  }
  function dn() {
    Oe || (Ne(), ot(), ch(), ih());
  }
  function ih() {
    var b;
    const g = P.map((w) => w.id || w.dataUrl).join("|");
    if (g !== X) {
      X = g;
      try {
        (b = t.onRecordingsChange) == null || b.call(t, P.slice());
      } catch {
      }
    }
  }
  function Zt() {
    var C;
    const g = a.getElementById("klavity-multi-start"), b = a.getElementById("klavity-multi-status");
    if (!g || !b) return;
    const w = Be === "recording" ? "Stop &amp; analyse recording" : Be === "processing" ? "AI is analysing…" : Be === "done" ? "Record another walkthrough" : "Start Recording";
    if (g.innerHTML = `${Be === "processing" ? '<span class="kl-enh-loader"></span>' : G("monitor", { size: 15 })}<span>${w}</span>`, g.disabled = Be === "processing" || Be === "recording", b.classList.toggle("kl-rec", Be === "recording"), b.classList.toggle("kl-ok", Be === "done"), Be === "recording")
      b.hidden = !1, b.textContent = "Recording screen and microphone…";
    else if (Be === "done" && Se) {
      const E = Se.length;
      b.hidden = !1, b.innerHTML = `${E} issue${E === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (C = b.querySelector("#klavity-multi-reopen")) == null || C.addEventListener("click", () => pl());
    } else ar ? (b.hidden = !1, b.textContent = ar) : (b.hidden = !0, b.textContent = "");
  }
  async function sh() {
    if (Pt || Be === "processing" || Be === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(lt && P.includes(lt)) && P.length >= Ke) {
      Bt(`You can attach up to ${Ke} recordings.`);
      return;
    }
    const b = ++ut;
    ar = "", ct(!0);
    const w = (E) => {
      s.style.display = E === "recording" ? "none" : "", E === "recording" && b === ut && (Be = "recording", Zt());
    };
    let C = null;
    try {
      C = await t.onRecord(w, { purpose: "multi" });
    } catch {
      C = null;
    } finally {
      s.style.display = "", ct(!1);
    }
    if (!(b !== ut || Oe)) {
      if (!C) {
        Be = Se ? "done" : "idle", Zt();
        return;
      }
      await dl(C, b);
    }
  }
  function oh(g) {
    const b = P.find((C) => C.id === g);
    if (!b || !t.onSplitRecording || Be !== "idle") return;
    const w = ++ut;
    Be = "processing", Promise.resolve().then(() => {
      if (w === ut && !Oe) return dl(b, w);
    });
  }
  async function dl(g, b) {
    var A, N;
    ar = "";
    for (let _ = c.length - 1; _ >= 0; _--)
      (N = (A = re[_]) == null ? void 0 : A.shapes) != null && N.length || nl(_);
    const w = P.indexOf(g), C = w >= 0 ? w : lt ? P.indexOf(lt) : -1;
    C >= 0 ? P[C] = g : P.push(g), be = C >= 0 ? C : P.length - 1, ae = null, lt = g, Se = null, yt = null, Bn(), Be = "processing", dn(), Zt();
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
        U = await ny(D || g.dataUrl, (g.durationMs || 0) / 1e3);
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
    const T = (E || []).filter((_) => _ && (String(_.title || "").trim() || String(_.description || "").trim()));
    if (!T.length) {
      lt = null, Se = null, yt = null, Be = "idle", ar = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", Zt();
      return;
    }
    Se = T.map((_, U) => ({
      ..._,
      id: `mi${b}_${U}`,
      title: String(_.title || "").trim() || `Issue ${U + 1}`,
      kind: _.kind === "feature" ? "feature" : "bug",
      description: uc(_),
      selected: !0,
      thumb: null
    })), yt = Se.map((_) => ({ ..._ })), Et = !1, Pe = null, Pr = "", Be = "done", Zt(), pl(), ah(b);
  }
  async function ah(g) {
    const b = lt;
    if (!b || !Se) return;
    let w = b.dataUrl, C = null;
    if (b.blob)
      try {
        C = URL.createObjectURL(b.blob), w = C;
      } catch {
      }
    try {
      for (const E of [...Se]) {
        if (g !== ut || Oe) return;
        const T = typeof E.startSec == "number" ? E.startSec : 0, A = typeof E.endSec == "number" && E.endSec > T ? E.endSec : T + 2, N = w ? await Ad(w, T + Math.min(1, (A - T) / 2)) : null;
        if (g !== ut) return;
        if (N) {
          for (const _ of [Se, yt]) {
            const U = _ == null ? void 0 : _.find((D) => D.id === E.id);
            U && (U.thumb = N);
          }
          At();
        }
        lh(E.id, N, g);
      }
    } finally {
      if (C)
        try {
          URL.revokeObjectURL(C);
        } catch {
        }
    }
  }
  async function lh(g, b, w) {
    const C = t.onEnhance, E = Se == null ? void 0 : Se.find((q) => q.id === g);
    if (!C || !E) return;
    const T = (q) => String(q || "").trim().toLowerCase().replace(/\s+/g, " "), A = T(E.narration), N = !!A && (Se || []).some((q) => {
      const j = q.id === g ? "" : T(q.narration);
      return !!j && (j === A || j.includes(A) || A.includes(j));
    }), _ = [E.title, E.actualResult, E.expectedResult ? `Expected: ${E.expectedResult}` : ""].map((q) => String(q || "").trim()).filter(Boolean).join(`
`), U = !N && String(E.narration || "").trim() || _ || E.title, D = (q) => {
      for (const j of [Se, yt]) {
        const K = j == null ? void 0 : j.find((Z) => Z.id === g);
        K && (K.enhancing = q);
      }
    };
    D(!0), At();
    let B = null;
    try {
      B = await C(U, { images: b ? 1 : 0, ...b ? { shot: b } : {} });
    } catch {
      B = null;
    }
    if (w !== ut || Oe) return;
    D(!1);
    const Y = T(B == null ? void 0 : B.summary);
    if (Y && (Se || []).some((q) => q.id !== g && T(q.title) === Y) && (B = null), B)
      for (const q of [Se, yt]) {
        const j = q == null ? void 0 : q.find((K) => K.id === g);
        !j || q === Se && j.edited || (j.title = String(B.summary || "").trim() || j.title, j.actualResult = B.actualResult || "", j.expectedResult = B.expectedResult || "", j.stepsToReproduce = Array.isArray(B.stepsToReproduce) ? B.stepsToReproduce : [], B.suggestedSeverity && (j.suggestedSeverity = B.suggestedSeverity), B.suggestedPriority && (j.suggestedPriority = B.suggestedPriority), j.description = uc(j));
      }
    At();
  }
  function pl() {
    if (!Se || Oe) return;
    const g = a.getElementById("klavity-side");
    De || (De = document.createElement("div"), De.className = "kl-mr", De.id = "klavity-mr", De.setAttribute("role", "dialog"), De.setAttribute("aria-label", "AI Analysis Complete"), (g || le).appendChild(De)), g && (g.scrollTop = 0, g.classList.add("kl-mr-open")), At();
  }
  function Bn() {
    var g;
    oe = null, Ee = null, De == null || De.remove(), De = null, (g = a.getElementById("klavity-side")) == null || g.classList.remove("kl-mr-open");
  }
  function ch() {
    !lt || P.includes(lt) || (ut++, lt = null, Se = null, yt = null, Et = !1, Be = "idle", ar = "", Bn(), Zt());
  }
  function uh(g) {
    if (!lt) return;
    const b = P.indexOf(lt);
    if (b < 0) return;
    (be !== b || !a.querySelector(".kl-hero-video")) && (be = b, ae = null, Ne());
    const w = a.querySelector(".kl-hero-video");
    if (!w) return;
    const C = () => {
      try {
        w.currentTime = Math.max(0, g);
        const E = w.play();
        E && typeof E.catch == "function" && E.catch(() => {
        });
      } catch {
      }
    };
    w.readyState >= 1 ? C() : w.addEventListener("loadedmetadata", C, { once: !0 });
  }
  function hl() {
    if (Et && !Pe && typeof window.confirm == "function") {
      let g = !0;
      try {
        g = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        g = !0;
      }
      if (!g) return !1;
    }
    return yt && (Se = yt.map((g) => ({ ...g }))), Et = !1, !0;
  }
  function dh(g) {
    return ey(g.description, g.title);
  }
  function At() {
    if (!De || !Se) return;
    if (Pe) {
      mh();
      return;
    }
    const g = Se, b = g.filter((A) => A.selected), w = g.length > 0 && b.length === g.length, C = g.length, E = b.length, T = g.map((A) => {
      const N = la(A.startSec, A.endSec), _ = Zg(A.suggestedPriority), U = typeof A.confidence == "number" && isFinite(A.confidence) ? Math.round(A.confidence * 100) : null, D = A.kind === "feature";
      return `<div class="kl-mr-card${A.selected ? "" : " kl-off"}" data-id="${Le(A.id)}"><input type="checkbox" class="kl-mr-cb" ${A.selected ? "checked" : ""} aria-label="${A.selected ? "Deselect" : "Select"} ${Le(A.title)}"><div class="kl-mr-thumb">${A.thumb ? `<img src="${Le(A.thumb)}" alt="">` : G("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Le(A.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Le(A.title)}">${G("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${D ? "kl-mr-feat" : "kl-mr-bug"}">${G(D ? "lightbulb" : "bug", { size: 10 })}${D ? "Feature" : "Bug"}</span>${_ ? `<span class="kl-mr-p${_ === "High" ? 1 : _ === "Medium" ? 2 : 3}">${_}</span>` : ""}${U != null && U < 85 ? `<span class="kl-mr-conf">${U}% · review</span>` : ""}${A.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${A.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Le(dh(A))}</p>${N ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${G("clock", { size: 11 })} ${Le(N)}</button>` : ""}</div></div>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${G("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${G("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${G("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${C} report${C === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${C} report${C === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${E} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${w ? "checked" : ""} aria-label="${w ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${T}</div></div></div><div class="kl-mr-foot"><p>${E} of ${C} tickets selected</p>${Pr ? `<p class="kl-mr-err" role="alert">${Le(Pr)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${E === 0 || Jt ? "disabled" : ""}>${Jt ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${E} ${E === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (oe && Ee ? ph() : ""), hh();
  }
  function ph() {
    const g = Ee, b = (w, C) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${C.length},1fr)">${C.map(([E, T, A]) => `<button type="button" class="${w}${(w === "kl-mr-kind" ? g.kind : g.priority) === E ? " kl-on" : ""}" data-v="${E}">${A}${T}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${G("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Le(g.title)}"></label><div class="kl-mr-f"><span>Type</span>${b("kl-mr-kind", [["bug", "Bug", G("bug", { size: 13 })], ["feature", "Feature", G("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${b("kl-mr-pri", aa.map((w) => [w.priority, w.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Le(g.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Le(g.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${G("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${g.title.trim() && g.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function hh() {
    var b, w, C, E;
    if (!De || !Se) return;
    const g = (T) => De.querySelector(T);
    (b = g("#kl-mr-back")) == null || b.addEventListener("click", () => {
      Jt || !hl() || (Bn(), Zt());
    }), (w = g("#kl-mr-close")) == null || w.addEventListener("click", () => {
      Jt || !hl() || (Bn(), lr());
    }), (C = g("#kl-mr-all")) == null || C.addEventListener("change", (T) => {
      const A = T.target.checked;
      Se.forEach((N) => {
        N.selected = A;
      }), Et = !0, At();
    }), (E = g("#kl-mr-submit")) == null || E.addEventListener("click", () => {
      gh();
    }), De.querySelectorAll(".kl-mr-card").forEach((T) => {
      var N, _, U;
      const A = Se.find((D) => D.id === T.dataset.id);
      A && ((N = T.querySelector(".kl-mr-cb")) == null || N.addEventListener("change", (D) => {
        A.selected = D.target.checked, Et = !0, At();
      }), (_ = T.querySelector(".kl-mr-edit")) == null || _.addEventListener("click", () => {
        var D;
        oe = A.id, Ee = { title: A.title, kind: A.kind === "feature" ? "feature" : "bug", priority: String(A.suggestedPriority || "").toUpperCase(), description: A.description, ts: la(A.startSec, A.endSec) }, At(), (D = De == null ? void 0 : De.querySelector("#kl-mr-ed-title")) == null || D.focus();
      }), (U = T.querySelector(".kl-mr-ts")) == null || U.addEventListener("click", () => uh(typeof A.startSec == "number" ? A.startSec : 0)));
    }), oe && Ee && fh();
  }
  function fh() {
    var T, A, N, _, U, D;
    const g = Ee, b = (B) => De.querySelector(B), w = b("#kl-mr-ed-save"), C = () => {
      w && (w.disabled = !(g.title.trim() && g.description.trim()));
    }, E = () => {
      oe = null, Ee = null, At();
    };
    (T = b("#kl-mr-ed-title")) == null || T.addEventListener("input", (B) => {
      g.title = B.target.value, C();
    }), (A = b("#kl-mr-ed-desc")) == null || A.addEventListener("input", (B) => {
      g.description = B.target.value, C();
    }), (N = b("#kl-mr-ed-ts")) == null || N.addEventListener("input", (B) => {
      g.ts = B.target.value;
    }), De.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((B) => B.addEventListener("click", () => {
      B.classList.contains("kl-mr-kind") ? g.kind = B.dataset.v === "feature" ? "feature" : "bug" : g.priority = B.dataset.v || "";
      const Y = B.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      De.querySelectorAll(Y).forEach((q) => q.classList.toggle("kl-on", q === B));
    })), (_ = b("#kl-mr-ed-x")) == null || _.addEventListener("click", E), (U = b("#kl-mr-ed-cancel")) == null || U.addEventListener("click", E), (D = b("#kl-mr-ed-rm")) == null || D.addEventListener("click", () => {
      if (Se = Se.filter((B) => B.id !== oe), Et = !0, oe = null, Ee = null, !Se.length) {
        Se = null, Be = "idle", Bn(), Zt();
        return;
      }
      At(), Zt();
    }), w == null || w.addEventListener("click", () => {
      const B = Se.find((j) => j.id === oe);
      if (!B || !g.title.trim() || !g.description.trim()) return;
      B.title = g.title.trim(), B.edited = !0, B.kind = g.kind, B.description = g.description.trim();
      const Y = aa.find((j) => j.priority === g.priority);
      Y && (B.suggestedPriority = Y.priority, B.suggestedSeverity = Y.severity);
      const q = Qg(g.ts);
      B.startSec = q.startSec, B.endSec = q.endSec, Et = !0, oe = null, Ee = null, At();
    });
  }
  function mh() {
    var C, E;
    if (!De || !Pe) return;
    const g = Pe.refs.length, b = Pe.refs.filter((T) => T.key).map((T) => {
      const A = Vs(T.url), N = Le(Ys(T.key, T.url));
      return A ? `<a href="${Le(A)}" target="_blank" rel="noopener">${N}</a>` : `<span>${N}</span>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${G("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${G("check", { size: 25 })}</span><h3>${g} ticket${g === 1 ? "" : "s"} created</h3><p>${Le(n.thankYou || "Your AI-generated reports have been filed.")}</p>${Pe.failed ? `<p role="alert">${Pe.failed} ticket${Pe.failed === 1 ? "" : "s"} couldn't be created — please report ${Pe.failed === 1 ? "it" : "them"} again.</p>` : ""}${b ? `<div class="kl-mr-keys">${b}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const w = () => lr({ reason: "submitted" });
    (C = De.querySelector("#kl-mr-close")) == null || C.addEventListener("click", w), (E = De.querySelector("#kl-mr-done")) == null || E.addEventListener("click", w);
  }
  async function gh() {
    var N;
    if (!Se || !lt || Jt) return;
    const g = Se.filter((_) => _.selected).map((_) => ({ ..._, title: _.title.trim(), description: _.description.trim() }));
    if (!g.length) return;
    const b = Cl(), w = n.submitTargetToggle !== !1 ? { feedbackTarget: Ms } : {}, C = (_) => _.kind === "feature" ? "feature" : "bug", E = (_) => ({
      ..._.suggestedSeverity ? { suggestedSeverity: _.suggestedSeverity } : {},
      ..._.suggestedPriority ? { suggestedPriority: _.suggestedPriority } : {}
    }), T = g[0], A = g.slice(1);
    Jt = !0, Pr = "", At();
    try {
      Un && await xs;
      const _ = await Promise.all(p.slice()), U = lt, D = {
        type: C(T),
        ...se ? { kind: C(T) } : {},
        title: T.title,
        description: dc(T, { primary: !0, reporterNote: J.value.trim() }),
        screenshots: _.length ? _ : T.thumb ? [T.thumb] : [],
        ...W.length ? { files: W.slice() } : {},
        recordings: [U, ...P.filter((K) => K !== U)],
        ..._.length ? { annotations: Ce() } : {},
        reporterEmail: b.email,
        createContact: b.createContact,
        ...w,
        ...E(T),
        ...t.consoleAttachToggle ? { attachConsole: !!((N = a.getElementById("klavity-conlog-cb")) != null && N.checked) } : {}
      }, B = (K, Z) => ({
        type: C(K),
        ...se ? { kind: C(K) } : {},
        title: K.title,
        description: dc(K, { primary: !1, videoTitle: T.title, videoKey: Z }),
        screenshots: K.thumb ? [K.thumb] : [],
        recordings: [U],
        reporterEmail: b.email,
        createContact: !1,
        ...w,
        ...E(K)
      });
      if (t.backgroundUpload) {
        const K = t.onSubmit;
        K(D), (async () => {
          for (const Z of A)
            try {
              await K(B(Z));
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
      let j = 0;
      for (const K of A)
        try {
          const Z = await t.onSubmit(B(K, Y.issueKey || void 0));
          q.push({ key: Z.issueKey, url: Z.issueUrl });
        } catch (Z) {
          j++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", Z);
          } catch {
          }
        }
      if (Oe) return;
      Jt = !1, Pe = { refs: q, failed: j }, Et = !1, At();
    } catch (_) {
      try {
        console.error("[Klavity] multi-issue submit failed:", _);
      } catch {
      }
      if (Oe) return;
      Jt = !1, Pr = n.debug ? `Couldn't create the tickets — ${(_ == null ? void 0 : _.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", At();
    }
  }
  let Ur = null;
  function lr(g) {
    var C;
    if (Oe) return;
    Oe = !0;
    for (const E of zr.splice(0))
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
    if (kr) {
      try {
        URL.revokeObjectURL(kr);
      } catch {
      }
      kr = null;
    }
    Ur == null || Ur(), rt && (clearTimeout(rt), rt = null), document.removeEventListener("keydown", Br, { capture: !0 }), document.removeEventListener("paste", ml);
    try {
      (C = t.onClose) == null || C.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const b = a.querySelector(".klavity-modal");
    if (g != null && g.immediate || !b) {
      tt(s);
      return;
    }
    b.classList.add("kl-closing");
    const w = () => tt(s);
    b.addEventListener("animationend", w, { once: !0 }), setTimeout(w, 700);
  }
  function fl(g, b) {
    if (rt || Oe) return;
    const w = document.createElement("div");
    w.className = "klavity-toast-progress", w.style.animationDuration = b + "ms", g.appendChild(w);
    let C = b, E = Date.now();
    const T = () => {
      E = Date.now(), rt = setTimeout(() => {
        lr();
      }, C);
    }, A = () => {
      rt && (clearTimeout(rt), rt = null, C = Math.max(0, C - (Date.now() - E)), w.style.animationPlayState = "paused");
    }, N = () => {
      rt || g.classList.contains("kl-closing") || (w.style.animationPlayState = "running", T());
    };
    g.addEventListener("mouseenter", A), g.addEventListener("mouseleave", N), g.addEventListener("focusin", A), g.addEventListener("focusout", (_) => {
      g.contains(_.relatedTarget) || N();
    }), T();
  }
  function Br(g) {
    var b;
    if (fi) {
      g.key === "Escape" ? (g.stopPropagation(), fi()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), Ts();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const w = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (w && (w.tagName === "INPUT" || w.tagName === "TEXTAREA" || w.tagName === "SELECT" || w.isContentEditable || ((b = w.getAttribute) == null ? void 0 : b.call(w, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const C = a.getElementById("klavity-submit");
      C && !C.disabled && (g.preventDefault(), g.stopPropagation(), C.click());
    }
  }
  document.addEventListener("keydown", Br, { capture: !0 });
  const ml = (g) => {
    if (!g.clipboardData) return;
    const b = Array.from(g.clipboardData.items).filter((w) => w.type.startsWith("image/")).map((w) => w.getAsFile()).filter((w) => !!w);
    b.length && Ss(b);
  };
  document.addEventListener("paste", ml);
  const Cs = () => {
    const g = le.querySelector("#klavity-desc");
    g && (g.placeholder = xe === "feature" ? "Describe the feature you'd like..." : xe === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (se) {
    const g = Array.from(le.querySelectorAll(".kl-type-chip"));
    g.forEach((b) => {
      b.addEventListener("click", () => {
        xe = b.getAttribute("data-kind") || "bug", g.forEach((w) => {
          const C = w === b;
          w.classList.toggle("active", C), w.setAttribute("aria-checked", C ? "true" : "false");
        }), Cs();
      });
    });
  } else {
    const g = le.querySelector(".kl-toggle-bug"), b = le.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      xe = "bug", g.classList.add("active"), b.classList.remove("active"), Cs();
    }), b.addEventListener("click", () => {
      xe = "feature", b.classList.add("active"), g.classList.remove("active"), Cs();
    });
  }
  let Ms = "project";
  {
    const g = le.querySelector("#klavity-target");
    if (g) {
      const b = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const w of b)
        w.addEventListener("click", () => {
          Ms = w.dataset.target === "klavity" ? "klavity" : "project";
          for (const E of b) {
            const T = E === w;
            E.classList.toggle("on", T), E.setAttribute("aria-checked", T ? "true" : "false");
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
        const T = E.getRangeAt(0);
        if (!J.contains(T.endContainer)) return -1;
        const A = T.cloneRange();
        return A.selectNodeContents(J), A.setEnd(T.endContainer, T.endOffset), A.toString().length;
      } catch {
        return -1;
      }
    }, w = (E) => {
      const T = g();
      if (T)
        try {
          const A = document.createRange(), N = document.createTreeWalker(J, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let _, U = E, D = !1;
          for (; _ = N.nextNode(); ) {
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
          D ? A.collapse(!0) : (A.selectNodeContents(J), A.collapse(!1)), T.removeAllRanges(), T.addRange(A);
        } catch {
        }
    }, C = () => {
      const E = b(), T = cc(J).replace(/\n$/, "");
      J.innerHTML = T ? lc(T) : "", E >= 0 && w(E);
    };
    J.addEventListener("input", C), Object.defineProperty(J, "value", {
      configurable: !0,
      get() {
        return cc(J);
      },
      set(E) {
        const T = String(E ?? "").replace(/\n$/, "");
        J.innerHTML = T ? lc(T) : "";
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
  const qr = le.querySelector("#klavity-submit"), ke = le.querySelector("#klavity-remail");
  let gr = "", qn = !1;
  ke && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (ke.value = t.prefillEmail), ke && ke.value.trim() && (gr = ke.value.trim().toLowerCase());
  const gl = le.querySelector("#klavity-desc-hint"), yh = () => !t.requireEmail || !!ke && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ke.value.trim()), Rs = () => {
    var g;
    return c.length > 0 || di || W.length > 0 || P.length > 0 || J.value.trim().length > 0 || (((g = le.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let hi = null, fi = null;
  const Ts = () => {
    var C, E, T;
    if (!Rs()) {
      lr();
      return;
    }
    if (hi) return;
    const g = document.createElement("div");
    hi = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const b = () => {
      tt(g), hi === g && (hi = null, fi = null);
    };
    fi = b, g.addEventListener("click", (A) => {
      A.target === g && b();
    }), (C = g.querySelector("#kl-cc-keep")) == null || C.addEventListener("click", b), (E = g.querySelector("#kl-cc-discard")) == null || E.addEventListener("click", () => {
      b(), lr({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || $r).appendChild(g);
    try {
      (T = g.querySelector("#kl-cc-keep")) == null || T.focus();
    } catch {
    }
  }, bh = () => {
  }, ot = () => {
    const g = J.value.trim() === "";
    qr.disabled = g && !Rs() || !yh(), gl && (gl.hidden = !(g && Rs()));
  };
  if (J.addEventListener("input", bh), J.addEventListener("input", ot), ke == null || ke.addEventListener("input", ot), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let b = null;
    const w = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(J.value);
      } catch {
      }
    };
    J.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(w, 600);
    }), J.addEventListener("blur", w), J.addEventListener("change", w), an(w);
  }
  const Wn = le.querySelector("#klavity-title");
  if (Wn && t.onTitleChange) {
    const g = t.onTitleChange;
    let b = null;
    const w = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(Wn.value);
      } catch {
      }
    };
    Wn.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(w, 600);
    }), Wn.addEventListener("blur", w), Wn.addEventListener("change", w), an(w);
  }
  const Wr = le.querySelector("#klavity-remail-sugg"), As = le.querySelector("#klavity-remail-matches"), yl = le.querySelector("#klavity-remail-sugg-hint"), yr = le.querySelector("#klavity-remail-addcontact"), bl = le.querySelector(".klavity-remail-sugg-em"), kl = le.querySelector(".klavity-remail-sugg-check");
  let qt = !1, pn = "", mi = [], Ls = "", _s = !1, vl = 0;
  const wl = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), kh = (g) => {
    var C, E;
    const b = (g.name || g.email).trim(), w = b.split(/[\s._-]+/).filter(Boolean);
    return ((((C = w[0]) == null ? void 0 : C[0]) || "") + (((E = w[1]) == null ? void 0 : E[0]) || "")).toUpperCase() || b.slice(0, 1).toUpperCase();
  }, vh = (g) => {
    let b = 0;
    for (let w = 0; w < g.length; w++) b = b * 31 + g.charCodeAt(w) >>> 0;
    return `hsl(${b % 360} 58% 42%)`;
  };
  async function xl(g) {
    if (!t.onLookupPeople) {
      mi = [], Ls = g, _s = !0;
      return;
    }
    const b = ++vl;
    try {
      const w = await t.onLookupPeople(g);
      if (b !== vl) return;
      mi = Array.isArray(w) ? w : [];
    } catch {
      mi = [];
    }
    Ls = g, _s = !0, br();
  }
  function br() {
    if (!Wr || !ke) return;
    const g = ke.value.trim(), b = g.toLowerCase();
    qt && b !== pn && (qt = !1, pn = "");
    const w = qn ? mi.filter((A) => !b || A.email.toLowerCase().includes(b)) : [], C = w.some((A) => A.email.toLowerCase() === b), E = qn && wl(g) && !C;
    As && (As.innerHTML = w.map((A) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Le(A.email)}">
          <span class="klavity-remail-av" style="background:${Le(vh(A.email))}">${Le(kh(A))}</span>
          <span class="klavity-remail-who">${A.name ? `${Le(A.name)} <i>(${Le(A.email)})</i>` : Le(A.email)}</span>
        </button>`).join(""), As.querySelectorAll(".klavity-remail-person").forEach((A) => {
      A.addEventListener("click", () => {
        var N;
        ke.value = A.getAttribute("data-email") || "", qt = !1, pn = "", gr = ke.value.trim().toLowerCase(), (N = t.onRememberEmail) == null || N.call(t, gr), br(), ot();
      });
    }));
    const T = ke.parentElement;
    T && T.classList.contains("klavity-remail-wrap") && T.classList.toggle("is-open", !!(w.length || E)), ke.setAttribute("aria-expanded", w.length || E ? "true" : "false"), yr && (yr.hidden = !E), yl && (yl.hidden = !E), Wr.hidden = !(w.length || E), bl && (bl.textContent = g), kl && (kl.hidden = !qt), yr == null || yr.setAttribute("aria-selected", qt ? "true" : "false");
  }
  yr == null || yr.addEventListener("click", () => {
    var b;
    const g = (ke == null ? void 0 : ke.value.trim()) || "";
    wl(g) && (qt = !qt, pn = qt ? g.toLowerCase() : "", gr = qt ? g.toLowerCase() : "", gr && ((b = t.onRememberEmail) == null || b.call(t, gr)), br(), ot());
  });
  function wh() {
    if (!ke || t.requireEmail) return;
    const g = ke.value.trim();
    g && g.toLowerCase() !== gr && (ke.value = "", qt = !1, pn = "", gr = "", br(), ot());
  }
  function Sl() {
    setTimeout(() => {
      var C;
      const b = le.getRootNode().activeElement;
      b === ke || Wr && b && Wr.contains(b) || (qn = !1, ke && !ke.value.trim() && ((C = t.onRememberEmail) == null || C.call(t, "")), wh(), br());
    }, 0);
  }
  ke == null || ke.addEventListener("blur", Sl), Wr == null || Wr.addEventListener("focusout", Sl);
  let Is = null;
  if (ke == null || ke.addEventListener("focus", () => {
    qn = !0, br(), _s || xl("");
  }), ke == null || ke.addEventListener("input", () => {
    qn = !0, br();
    const g = ke.value.trim().toLowerCase();
    g !== Ls && (Is && clearTimeout(Is), Is = setTimeout(() => {
      xl(g);
    }, 180));
  }), br(), t.onEnhance) {
    const g = t.onEnhance, b = le.querySelector("#klavity-enhance"), w = le.querySelector("#klavity-enhance-undo"), C = le.querySelector("#klavity-enhance-regen"), E = le.querySelector("#klavity-enhance-spin");
    let T = 0, A = null;
    const N = () => c[de] || c[0] || "", _ = () => {
      const D = N();
      if (!D) return "";
      const B = de >= 0 && de < c.length ? de : 0, Y = re[B] ?? (B === 0 ? re[0] : null);
      if (!Y || !Array.isArray(Y.shapes) || !Y.shapes.length) return D;
      const q = a.getElementById("klavity-hero-stage"), j = q == null ? void 0 : q.querySelector("canvas");
      if (j && de === B && j.width > 1 && j.height > 1)
        try {
          const K = j.toDataURL("image/png");
          if (K && K.length > 64) return K;
        } catch {
        }
      return null;
    }, U = async () => {
      if (Pt) return;
      const D = J.value.trim();
      A = J.value;
      const B = ++T;
      b && (b.disabled = !0), E && (E.hidden = !1);
      try {
        const Y = ye ? { selector: ye.selector, text: ye.text } : null, q = de >= 0 && de < c.length ? de : 0, j = re[q] ?? (q === 0 ? re[0] : null), K = Jm(j == null ? void 0 : j.shapes), Z = N();
        let he = _();
        he === null && (he = await Zm(Z, j.shapes, j.w, j.h));
        const Ye = await g(D, {
          images: c.length,
          shot: he,
          annotations: j,
          annotationTexts: K,
          picked: Y
        });
        if (B !== T || !Ye) return;
        J.value = Ld(Ye), J.dispatchEvent(new Event("input", { bubbles: !0 })), Ot = Ye.suggestedSeverity || null, Nr = Ye.suggestedPriority || null, J.classList.add("kl-just-enhanced"), setTimeout(() => J.classList.remove("kl-just-enhanced"), 700), w && (w.hidden = !1), C && (C.hidden = !1), ot();
      } catch {
      } finally {
        B === T && (b && (b.disabled = !1), E && (E.hidden = !0));
      }
    };
    b == null || b.addEventListener("click", () => {
      U();
    }), C == null || C.addEventListener("click", () => {
      U();
    }), w == null || w.addEventListener("click", () => {
      A !== null && (J.value = A, J.dispatchEvent(new Event("input", { bubbles: !0 })), ot()), A = null, Ot = null, Nr = null, w && (w.hidden = !0), C && (C.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = le.querySelector("#klavity-known"), b = t.onCheckKnown;
    let w = null, C = 0, E = "";
    const T = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, A = (_) => {
      var D;
      if (!g) return;
      const U = _.headline ? Le(_.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${G("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${U}</span> — status: <span class="kl-known-status">${Le(_.statusLabel)}</span>. We're already tracking "${Le(_.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (D = g.querySelector("#klavity-known-dismiss")) == null || D.addEventListener("click", () => {
        E = J.value.trim(), T();
      });
    }, N = async () => {
      const _ = J.value.trim();
      if (_.length < 12 || _ === E) {
        T();
        return;
      }
      const U = ++C;
      try {
        const D = await b(_);
        if (U !== C) return;
        if (J.value.trim() === E) {
          T();
          return;
        }
        D ? A(D) : T();
      } catch {
      }
    };
    J.addEventListener("input", () => {
      J.value.trim() !== E && (E = ""), w && clearTimeout(w), w = setTimeout(N, 500);
    });
  }
  if (n.reportClarity) {
    const g = le.querySelector("#klavity-clarity"), b = le.querySelector("#klavity-clarity-status"), w = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, C = le.querySelector("#klavity-clarity-tip"), E = le.querySelector("#klavity-clarity-tip-text"), T = le.querySelector("#klavity-nudge"), A = t.onClarityTip, N = /* @__PURE__ */ new Map();
    let _ = null, U = 0;
    const D = (K, Z, he) => {
      if (!K) return;
      K.classList.toggle("done", Z);
      const Ye = K.querySelector(".kl-clr-mark");
      Ye && (Ye.innerHTML = Z ? G("check", { size: 12 }) : "○"), K.setAttribute("aria-label", (Z ? "covered: " : "missing: ") + he);
    }, B = () => {
      C && (C.hidden = !0);
    }, Y = (K) => {
      !C || !E || Ng(K) || (E.innerHTML = Le(K) + '<span class="kl-clr-aitag">AI</span>', C.hidden = !1);
    }, q = () => {
      const K = J.value, Z = Cd(K);
      g && (g.hidden = K.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(Z.level === "great" ? "l3" : Z.level === "good" ? "l2" : "l1")), b && (b.textContent = Z.label), D(w.problem, Z.coverage.problem, "What's broken"), D(w.expected, Z.coverage.expected, "What you expected"), D(w.repro, Z.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), Z.level === "great" && B();
    }, j = () => {
      !A || !C || (_ && clearTimeout(_), _ = setTimeout(async () => {
        const K = J.value.trim();
        if (!Ig(K)) {
          B();
          return;
        }
        if (N.has(K)) {
          Y(N.get(K));
          return;
        }
        const Z = ++U;
        try {
          const he = await A(K, { images: c.length });
          if (Z !== U || J.value.trim() !== K) return;
          he && he.tip && (N.set(K, he.tip), Y(he.tip));
        } catch {
        }
      }, 1e3));
    };
    J.addEventListener("input", () => {
      q(), j();
    }), q(), (Il = le.querySelector("#klavity-nudge-add")) == null || Il.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        J.focus();
      } catch {
      }
    }), (Ol = le.querySelector("#klavity-nudge-anyway")) == null || Ol.addEventListener("click", () => {
      T && (T.hidden = !0), qr.click();
    });
  }
  $r.addEventListener("click", (g) => {
    g.target === $r && Ts();
  }), (Nl = le.querySelector("#klavity-x")) == null || Nl.addEventListener("click", () => Ts()), (Pl = le.querySelector("#klavity-min")) == null || Pl.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const El = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Pt = !1;
  const ct = (g) => {
    Pt = g, El().forEach((w) => {
      w.disabled = g;
    }), J.disabled = g;
    const b = le.querySelector("#klavity-voice");
    b && (b.disabled = g), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((w) => {
      w.disabled = g;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((w) => {
      w.disabled = g;
    }), g ? (Ur == null || Ur(), qr.disabled = !0) : (ot(), pi());
  }, Qt = (g) => {
    El().forEach((b) => {
      b.classList.remove("kl-active"), b.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, cr = le.querySelector("#klavity-voice");
  if (cr) {
    const w = cr.querySelector(".kl-vring-prog");
    let C = 0, E = 0, T = !1, A, N = "";
    const _ = () => {
      E = Date.now();
      const ge = () => {
        const Fe = Date.now() - E, $e = Math.min(Fe / 18e4, 1);
        if (w == null || w.setAttribute("stroke-dashoffset", String($e * 81.68)), Fe >= 165e3 && cr.classList.add("kl-voice-warn"), Fe >= 18e4) {
          A.stop();
          return;
        }
        C = requestAnimationFrame(ge);
      };
      C = requestAnimationFrame(ge);
    }, U = () => {
      cancelAnimationFrame(C), w == null || w.setAttribute("stroke-dashoffset", String(81.68)), cr.classList.remove("kl-voice-warn");
    }, D = le.querySelector("#klavity-voice-status");
    let B = null;
    const Y = () => {
      B && (clearTimeout(B), B = null), D && (D.hidden = !0, D.textContent = "", D.classList.remove("kl-vs-info", "kl-vs-err"));
    }, q = (ge, Fe, $e) => {
      !D || !Fe || (B && (clearTimeout(B), B = null), D.classList.remove("kl-vs-info", "kl-vs-err"), D.classList.add(ge === "err" ? "kl-vs-err" : "kl-vs-info"), D.textContent = Fe, D.hidden = !1, $e && (B = setTimeout(Y, $e)));
    }, j = "Recording — tap to stop", K = () => {
      D && D.classList.contains("kl-vs-info") && Y();
    }, Z = (ge) => {
      cr.classList.toggle("kl-voice-rec", ge), cr.setAttribute("aria-pressed", ge ? "true" : "false"), cr.setAttribute("aria-label", ge ? "Stop recording" : "Voice dictation"), cr.title = ge ? j : "Voice dictation";
    }, he = (ge) => {
      let Fe = "";
      ge.onTranscript = ($e) => {
        Fe = "", N = Mi(N, $e), J.value = N;
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
        const ee = N.length > 0 && !/\s$/.test(N) ? " " : "";
        J.value = N + ($e ? ee + $e : "");
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
        $e === "idle" ? K() : q("info", ee);
      }, ge.onError = ($e, ee) => {
        ee && q("err", ee, 4e3);
      }, ge.onStop = () => {
        Fe && (N = Mi(N, Fe), Fe = ""), N && (N = ac(N), J.value = N);
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, Z(!1), U(), K(), ot();
      };
    }, Ye = () => {
      const ge = new Xn();
      return he(ge), ge;
    }, et = () => {
      if (!T) {
        Z(!1), U(), K();
        return;
      }
      Xn.isSupported() ? (N = J.value, A = Ye(), q("info", "Reconnecting dictation…"), A.start()) : (T = !1, Z(!1), U(), q("err", "Voice dictation is unavailable right now", 4e3));
    }, bt = () => {
      if (!(Ie === "server" && t.onDictate)) return null;
      const ge = new Yi({ transcribe: (Fe) => t.onDictate(Fe) });
      return he(ge), ge.onUnavailable = et, ge;
    }, vr = (ge) => {
      const Fe = () => N.length > 0 && !/\s$/.test(N) ? " " : "";
      let $e = "";
      ge.onTranscript = (ee) => {
        $e = "", N = Mi(N, ee), J.value = N;
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
        $e = ee || "", J.value = N + Fe() + ee;
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
        ee === "idle" ? K() : q("info", ue);
      }, ge.onError = (ee, ue) => {
        ue && q("err", ue, 4e3);
      }, ge.onStop = () => {
        $e && (N = Mi(N, $e), $e = ""), N && (N = ac(N)), J.value = N;
        try {
          J.scrollTop = J.scrollHeight;
        } catch {
        }
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, Z(!1), U(), K(), ot();
      }, ge.onUnavailable = () => {
        J.value = N;
        try {
          J.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!T) {
          Z(!1), U(), K();
          return;
        }
        const ee = bt();
        if (ee) {
          A = ee, q("info", "Reconnecting dictation…"), A.start();
          return;
        }
        et();
      };
    }, zt = () => {
      if (Ie === "server" && t.dictationStreamUrl && Vi.isSupported()) {
        const ge = new Vi({ url: t.dictationStreamUrl });
        return vr(ge), ge;
      }
      return bt() ?? Ye();
    };
    A = zt(), cr.addEventListener("click", () => {
      T ? A.stop() : (Y(), N = J.value, A = zt(), T = !0, Z(!0), A.start(), _());
    }), Ur = () => {
      T && A.stop();
    };
  }
  function Cl() {
    var w;
    const g = (ke == null ? void 0 : ke.value.trim()) || "", b = g && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g)) ? g : void 0;
    return b && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b) && ((w = t.onRememberEmail) == null || w.call(t, b.toLowerCase())), { email: b, createContact: !!(b && qt && b.toLowerCase() === pn) };
  }
  qr.addEventListener("click", async () => {
    var Z;
    if (Pt || qr.disabled) return;
    const g = J.value.trim(), b = le.querySelector("#klavity-title"), w = b ? b.value.trim() : "", C = xe === "feature" ? "feature" : "bug";
    d && await Promise.race([d, Promise.resolve()]), Un && await xs;
    const E = p.slice(), T = Ce(), A = W.slice(), N = P.slice(), _ = xe, { email: U, createContact: D } = Cl();
    ct(!0), qr.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const Y = a.getElementById("klavity-progress"), q = a.getElementById("klavity-progress-fill");
    Y && q && (Y.classList.add("show"), q.style.transition = "none", q.style.width = "8%", q.offsetWidth, q.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      q.style.width = "90%";
    }));
    const j = () => {
      q && (q.style.transition = "width .25s ease", q.style.width = "100%");
    }, K = () => {
      Y && q && (Y.classList.remove("show"), q.style.transition = "none", q.style.width = "0");
    };
    try {
      const he = await Promise.all(E), Ye = {
        type: C,
        ...se ? { kind: _ } : {},
        ...w ? { title: w } : {},
        description: g,
        screenshots: he,
        ...A.length ? { files: A } : {},
        ...N.length ? { recordings: N } : {},
        annotations: T,
        reporterEmail: U,
        createContact: D,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Ms } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...Ot ? { suggestedSeverity: Ot } : {},
        ...Nr ? { suggestedPriority: Nr } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((Z = a.getElementById("klavity-conlog-cb")) != null && Z.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(Ye), lr({ immediate: !0, reason: "submitted" });
        return;
      }
      const et = await t.onSubmit(Ye);
      if (Oe) return;
      j(), t.success ? _h(et.issueKey, et.issueUrl, t.success) : Lh(et.issueKey, et.issueUrl);
    } catch (he) {
      K();
      const Ye = (he == null ? void 0 : he.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", he);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${Ye}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", qr.textContent = "Submit", ct(!1);
    }
  });
  function xh(g, b) {
    var A;
    const { dataUrl: w, quality: C, suggestSharp: E } = Ht(b);
    if (!w) return;
    const T = c.indexOf(g);
    if (!(T < 0)) {
      c[T] = w, p[T] = t.compressImage ? t.compressImage(w) : Promise.resolve(w), o[T] = C, h[T] = !!E && C !== "real-pixel", re[T] && delete re[T], delete Je[T], delete Tt[T], Ne();
      try {
        (A = t.onShotReplaced) == null || A.call(t, T, w, C);
      } catch {
      }
    }
  }
  async function Sh(g) {
    if (!t.onCaptureViewport) return !1;
    let b = null;
    const { geo: w } = Dr();
    try {
      const { dataUrl: E } = Ht(await t.onCaptureViewport());
      Fr(E, w, { kind: "viewport" }), E && (b = E, l = !1, Nt(E, "rendered", void 0, !0, !1), g && Qt(g));
    } catch {
    } finally {
    }
    const C = (async () => {
      const { geo: E } = Dr();
      try {
        const T = await t.onCaptureFull();
        if (Fr(Ht(T).dataUrl, E, { kind: "full" }), b) xh(b, T);
        else {
          l = !1;
          const { dataUrl: A, quality: N, suggestSharp: _ } = Ht(T);
          A && (Nt(A, N, void 0, !0, !!_), g && Qt(g));
        }
      } catch {
        l = !1, Ne();
      } finally {
        d === C && (d = null);
      }
    })();
    return d = C, !0;
  }
  async function Ml(g) {
    if (!t.onCaptureViewport) return !1;
    const { geo: b } = Dr();
    try {
      const { dataUrl: w, blank: C } = Ht(await t.onCaptureViewport());
      C || Fr(w, b, { kind: "viewport" }), C && c.length === 0 ? vs() : w ? (l = !1, Nt(w, "rendered", void 0, !0, !1)) : (l = !1, Ne());
    } catch {
      l = !1, Ne();
    } finally {
    }
    return !0;
  }
  const Hr = le.querySelector("#klavity-full");
  Hr.addEventListener("click", async () => {
    if (!Pt && !(t.onCaptureSharp && (await Os()).ok)) {
      ct(!0), Hr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Sh(Hr);
          return;
        }
        const { restore: g, geo: b } = Dr();
        try {
          const { dataUrl: w, quality: C, suggestSharp: E } = Ht(await t.onCaptureFull());
          Fr(w, b, { kind: "full" }), Nt(w, C, void 0, !0, !!E), Qt(Hr);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        Hr.classList.remove("kl-loading"), ct(!1);
      }
    }
  });
  async function Os(g) {
    const b = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Pt || !b || !ze) return { ok: !1, declined: !1 };
    const w = ze.querySelector(".kl-sharp-label");
    ct(!0), ze.classList.add("kl-loading"), s.style.display = "none";
    const C = w ?? ze, E = C.textContent;
    C.textContent = "Capturing…";
    let T = !1, A = !1;
    try {
      const { restore: N, geo: _ } = Dr();
      let U;
      try {
        U = await b();
      } finally {
        N == null || N();
      }
      if (U) {
        const { dataUrl: D, quality: B } = Ht(U);
        Fr(D, _, { kind: g != null && g.viewport ? "viewport" : "full" }), D && (Nt(D, B ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), Qt(ze), T = !0, M = !0);
      }
    } catch (N) {
      if (ay(N)) {
        if (A = !0, !(g != null && g.onOpen))
          try {
            Kp();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", N);
        } catch {
        }
    } finally {
      g != null && g.onOpen && A || (s.style.display = "", C.textContent = E, ze.classList.remove("kl-loading"), ct(!1));
    }
    return { ok: T, declined: A };
  }
  ze && t.onCaptureSharp && ze.addEventListener("click", () => {
    Os();
  });
  const Rl = le.querySelector("#klavity-file"), Tl = le.querySelector("#klavity-upload");
  Tl.addEventListener("click", () => {
    if (!Pt) {
      if (!x && c.length >= k) {
        Bt(`You can attach up to ${k} images.`);
        return;
      }
      Rl.click();
    }
  }), Rl.addEventListener("change", async (g) => {
    const b = g.target, w = b.files ? Array.from(b.files) : [];
    if (b.value = "", !w.length) return;
    const C = c.length, E = W.length;
    x ? await nh(w) : await Ss(w), (c.length > C || W.length > E) && Qt(Tl);
  });
  const Hn = a.getElementById("klavity-record");
  Hn && t.onRecord && Hn.addEventListener("click", async () => {
    if (Pt) return;
    if (P.length >= Ke) {
      Bt(`You can attach up to ${Ke} recordings.`);
      return;
    }
    ct(!0), Hn.classList.add("kl-loading");
    const g = (b) => {
      s.style.display = b === "recording" ? "none" : "";
    };
    try {
      const b = await t.onRecord(g);
      if (b) {
        const w = P.findIndex((C) => C.id && b.id && C.id === b.id || C.dataUrl && b.dataUrl && C.dataUrl === b.dataUrl);
        w >= 0 ? (P[w] = b, be = w) : (P.push(b), be = P.length - 1), ae = null, dn(), Qt(Hn);
      }
    } catch {
    } finally {
      s.style.display = "", Hn.classList.remove("kl-loading"), ct(!1);
    }
  }), We && (Zt(), (zl = a.getElementById("klavity-multi-start")) == null || zl.addEventListener("click", () => {
    sh();
  }), t.initialMultiRecordingId && oh(t.initialMultiRecordingId));
  const Ns = a.getElementById("klavity-region");
  Ns && t.onRegionCapture && (Ns.onclick = () => {
    Pt || (ct(!0), document.removeEventListener("keydown", Br, { capture: !0 }), s.style.display = "none", gy(async (g) => {
      document.addEventListener("keydown", Br, { capture: !0 });
      try {
        const { restore: b, geo: w } = Dr();
        let C;
        try {
          C = await t.onRegionCapture(g);
        } finally {
          b == null || b();
        }
        if (C) {
          const { dataUrl: E, quality: T, suggestSharp: A } = Ht(C);
          Fr(E, w, { kind: "region", rect: g }), E && (Nt(E, T, void 0, !0, !!A, { kind: "region", rect: g }), Qt(Ns));
        }
      } finally {
        s.style.display = "", ct(!1);
      }
    }, () => {
      document.addEventListener("keydown", Br, { capture: !0 }), s.style.display = "", ct(!1);
    }));
  });
  const hn = a.getElementById("klavity-pick"), fn = a.getElementById("klavity-pickinfo"), Al = () => {
    var w;
    if (hn && (hn.classList.toggle("kl-active", !!ye), ye ? hn.setAttribute("aria-pressed", "true") : hn.removeAttribute("aria-pressed")), !fn) return;
    if (!ye) {
      fn.hidden = !0, fn.innerHTML = "";
      return;
    }
    fn.hidden = !1;
    const { text: g } = ye, b = g ? `: <span class="kl-pick-txt">${Le(g)}</span>` : "";
    fn.innerHTML = `<span class="kl-pick-ic">${G("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${b}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (w = fn.querySelector("#klavity-pick-clear")) == null || w.addEventListener("click", () => {
      ye = null, Al();
    });
  };
  hn && t.onPickElement && (hn.onclick = async () => {
    if (!Pt) {
      ct(!0), document.removeEventListener("keydown", Br, { capture: !0 }), s.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (ye = g, Al(), g.shot && Nt(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Br, { capture: !0 }), s.style.display = "", ct(!1);
      }
    }
  });
  function Wt(g, b = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function Eh(g) {
    const b = (T, A, N, _) => `<button type="button" class="kl-htool" data-tool="${T}" title="${A} (${_.toUpperCase()})" aria-label="${A}">${N}<span class="kl-hk">${_.toUpperCase()}</span></button>`, w = (T) => {
      const A = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(A)) return !1;
      const N = parseInt(A.slice(0, 2), 16), _ = parseInt(A.slice(2, 4), 16), U = parseInt(A.slice(4, 6), 16);
      return (0.2126 * N + 0.7152 * _ + 0.0722 * U) / 255 > 0.7;
    }, C = (T) => `<button type="button" class="kl-hcolor${w(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + // Tool hierarchy: Rectangle (the default) → Circle → Arrow → Text, then Pen / Line / Numbers.
      b("rect", "Rectangle", G("square", { size: 15 }), "r") + b("circle", "Circle", Wt('<circle cx="12" cy="12" r="9"/>'), "o") + b("arrow", "Arrow", Wt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + b("text", "Text", Wt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + b("pen", "Pen", G("pencil", { size: 15 }), "p") + b("line", "Line", Wt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + b("count", "Numbers", Wt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Black out numbers in your screenshots"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${G("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + b("pixelate", "Redact (pixelate)", Wt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + b("crop", "Crop", Wt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + C("#ef4444") + C("#f97316") + C("#16a34a") + C("#3b82f6") + C("#ffffff") + C("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Wt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Wt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${G("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Wt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function jn() {
    Or && (document.removeEventListener("keydown", Or, { capture: !0 }), Or = null);
  }
  function Ps() {
    const g = a.getElementById("klavity-hero-stage"), b = a.getElementById("klavity-hero-tools");
    b && (b.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${G("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Le(Jp())}</span></div>`), jn();
  }
  function Ll() {
    if (ae != null && !(W[ae] && bn(W[ae]) === "video") && (ae = null), be != null && !P[be] && (be = null), be != null) {
      _l(P[be].dataUrl);
      return;
    }
    if (ae != null) {
      _l(W[ae] ? Xe(W[ae]) : void 0);
      return;
    }
    if (c.length === 0) {
      de = 0, Ps();
      return;
    }
    de >= c.length && (de = c.length - 1), de < 0 && (de = 0), Th(de);
  }
  let kr = null;
  function _l(g) {
    const b = a.getElementById("klavity-hero-stage"), w = a.getElementById("klavity-hero-tools");
    if (!b || !g) {
      Ps();
      return;
    }
    if (jn(), w && (w.innerHTML = ""), b.innerHTML = "", kr) {
      try {
        URL.revokeObjectURL(kr);
      } catch {
      }
      kr = null;
    }
    let C = g;
    const E = be != null && P[be] ? P[be] : null;
    if (E && E.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        C = URL.createObjectURL(E.blob), kr = C;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const U = g.split(",");
        if (U.length >= 2) {
          const D = U[0].match(/:(.*?);/), B = (D ? D[1] : "video/webm").split(";")[0], Y = atob(U[1]);
          let q = Y.length;
          const j = new Uint8Array(q);
          for (; q--; )
            j[q] = Y.charCodeAt(q);
          const K = new Blob([j], { type: B });
          C = URL.createObjectURL(K), kr = C;
        }
      } catch {
      }
    const T = document.createElement("div");
    T.className = "kl-hero-vwrap", T.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const A = document.createElement("video");
    A.src = C, A.controls = !0, A.setAttribute("playsinline", ""), A.preload = "metadata", A.className = "kl-hero-video", A.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const N = document.createElement("div");
    N.className = "kl-hero-verror", N.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const _ = document.createElement("a");
    _.href = C || g, _.setAttribute("download", "recording.webm"), _.setAttribute("target", "_blank"), _.setAttribute("rel", "noopener"), _.textContent = "Download recording", _.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", N.innerHTML = "<span>This recording couldn’t play here.</span>", N.appendChild(_), T.appendChild(A), T.appendChild(N), b.appendChild(T), Ch(A, N);
  }
  function Ch(g, b) {
    let w = !1, C = null;
    g.addEventListener("loadedmetadata", () => {
      if (!isFinite(g.duration) || isNaN(g.duration) || g.duration <= 0) {
        w = !0;
        try {
          g.currentTime = 1e101;
        } catch {
        }
        C = setTimeout(() => {
          if (w) {
            w = !1;
            try {
              g.currentTime = 0;
            } catch {
            }
          }
        }, 400);
      }
    }), g.addEventListener("durationchange", () => {
      if (w && isFinite(g.duration) && g.duration > 0) {
        w = !1, C && clearTimeout(C);
        try {
          g.currentTime = 0;
        } catch {
        }
      }
    }), g.addEventListener("error", () => {
      if (w) {
        w = !1, C && clearTimeout(C);
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
  function Mh(g, b, w, C, E) {
    const T = c[g];
    if (!T) return;
    const A = new Image();
    A.onload = () => {
      var q, j;
      if (c[g] !== T) return;
      const N = document.createElement("canvas");
      N.width = Math.max(1, Math.round(C)), N.height = Math.max(1, Math.round(E));
      const _ = N.getContext("2d");
      if (!_) return;
      _.drawImage(A, b, w, C, E, 0, 0, N.width, N.height);
      let U;
      try {
        U = N.toDataURL("image/png");
      } catch {
        return;
      }
      const D = ((q = Je[g]) == null ? void 0 : q.length) ?? 0, B = Xa(g);
      c[g] = U, p[g] = t.compressImage ? t.compressImage(U) : Promise.resolve(U);
      const Y = (j = re[g]) == null ? void 0 : j.shapes;
      Array.isArray(Y) && Y.length ? re[g] = { w: N.width, h: N.height, shapes: Jg(Y, -b, -w) } : delete re[g], (Je[g] ?? (Je[g] = [])).push(B), (Tt[g] ?? (Tt[g] = [])).push({ snap: B, mark: D }), ln(g), Ne(), Rh(T, U, A.naturalWidth, A.naturalHeight, b, w, N.width, N.height);
    }, A.src = T;
  }
  function Rh(g, b, w, C, E, T, A, N) {
    const U = ((Y) => (Y || []).map((q) => ({ x: Math.max(0, q.x - E), y: Math.max(0, q.y - T), w: Math.min(A, q.x - E + q.w) - Math.max(0, q.x - E), h: Math.min(N, q.y - T + q.h) - Math.max(0, q.y - T) })).filter((q) => q.w > 0 && q.h > 0))(sl(g, w, C));
    U.length && Re.set(b, U);
    const D = je.get(g);
    if (!D) return;
    const B = new Image();
    B.onload = () => {
      const Y = document.createElement("canvas");
      Y.width = A, Y.height = N;
      const q = Y.getContext("2d");
      if (!q) return;
      q.drawImage(B, E, T, A, N, 0, 0, A, N);
      let j;
      try {
        j = Y.toDataURL("image/png");
      } catch {
        return;
      }
      je.set(b, j), gt.set(j, b), U.length && Re.set(j, U);
    }, B.src = D;
  }
  function Th(g) {
    var _, U, D, B, Y, q, j;
    const b = a.getElementById("klavity-hero-stage"), w = a.getElementById("klavity-hero-tools");
    if (!b || !w) return;
    const C = c[g];
    if (!C) {
      Ps();
      return;
    }
    jn(), b.innerHTML = "";
    const E = document.createElement("canvas");
    E.width = 1, E.height = 1, E.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new oa(E, C), A = (_ = re[g]) == null ? void 0 : _.shapes;
    Array.isArray(A) && A.forEach((K) => T.shapes.push({ ...K })), b.appendChild(E);
    const N = new Image();
    N.onload = () => {
      !document.body.contains(s) || de !== g || c[g] !== C || (E.width = N.naturalWidth || 1, E.height = N.naturalHeight || 1, T.redraw());
    }, N.src = C, T.redraw();
    {
      w.innerHTML = Eh((((U = Tt[g]) == null ? void 0 : U.length) ?? 0) > 0);
      const K = w.querySelector("#kl-hero-logo");
      K && (K.href = Kg(n.projectId));
      let Z = "rect", he = "#ef4444", Ye = 26, et = "black", bt = null;
      const vr = w.querySelector("#kl-hero-textopts"), zt = () => {
        T.shapes.length ? re[g] = { w: E.width, h: E.height, shapes: T.shapes.map(($) => ({ ...$ })) } : delete re[g], ln(g);
      }, ge = ($) => {
        Z = $, w.querySelectorAll("[data-tool]").forEach((H) => H.classList.toggle("kl-on", H.dataset.tool === $)), vr && (vr.hidden = $ !== "text");
      }, Fe = w.querySelector(".kl-hcolor-custom"), $e = w.querySelector(".kl-hcolor-input"), ee = ($, H) => {
        he = $, w.querySelectorAll("[data-color]").forEach((ne) => ne.classList.toggle("kl-on", ne === H)), Fe && Fe.classList.toggle("kl-on", Fe === H);
      };
      if (w.querySelectorAll("[data-tool]").forEach(($) => $.addEventListener("click", () => ge($.dataset.tool))), w.querySelectorAll("[data-color]").forEach(($) => $.addEventListener("click", () => ee($.dataset.color, $))), Fe && $e) {
        Fe.addEventListener("click", () => $e.click());
        const $ = () => {
          Fe.style.background = $e.value, ee($e.value, Fe);
        };
        $e.addEventListener("input", $), $e.addEventListener("change", $);
      }
      const ue = w.querySelector(".kl-hmask-cb");
      ue && ue.addEventListener("change", () => {
        i = ue.checked, il(al());
      }), w.querySelectorAll("[data-outline]").forEach(($) => $.addEventListener("click", () => {
        et = $.dataset.outline, w.querySelectorAll("[data-outline]").forEach((H) => H.classList.toggle("kl-on", H === $));
      })), w.querySelectorAll("[data-size]").forEach(($) => $.addEventListener("click", () => {
        Ye = Number($.dataset.size), w.querySelectorAll("[data-size]").forEach((H) => H.classList.toggle("kl-on", H === $));
      })), w.querySelectorAll("[data-stroke]").forEach(($) => $.addEventListener("click", () => {
        T.strokeScale = Number($.dataset.stroke) || 1, w.querySelectorAll("[data-stroke]").forEach((H) => H.classList.toggle("kl-on", H === $)), T.redraw();
      })), (D = w.querySelector("#kl-hero-undo")) == null || D.addEventListener("click", () => {
        Za(g);
      }), (B = w.querySelector("#kl-hero-revert")) == null || B.addEventListener("click", () => {
        Gp(g);
      }), (Y = w.querySelector("#kl-hero-clear")) == null || Y.addEventListener("click", () => {
        cn(g), T.clearAll(), zt();
      }), ge(Z), ee(he, w.querySelector("[data-color]"));
      const qe = ($) => {
        const H = E.getBoundingClientRect(), ne = Math.min(H.width / E.width, H.height / E.height) || 1, te = E.width * ne, ie = E.height * ne, Ze = (H.width - te) / 2, Mt = (H.height - ie) / 2;
        return { x: ($.clientX - H.left - Ze) / ne, y: ($.clientY - H.top - Mt) / ne };
      }, gi = () => {
        const $ = E.getBoundingClientRect();
        return Math.min($.width / E.width, $.height / E.height) || 1;
      }, Ih = ($, H, ne, te, ie, Ze) => $ === "line" ? { type: "line", color: Ze, x1: H, y1: ne, x2: te, y2: ie } : $ === "arrow" ? { type: "arrow", color: Ze, x1: H, y1: ne, x2: te, y2: ie } : $ === "rect" ? { type: "rect", color: Ze, x: Math.min(H, te), y: Math.min(ne, ie), w: Math.abs(te - H), h: Math.abs(ie - ne) } : $ === "circle" ? { type: "circle", color: Ze, x: (H + te) / 2, y: (ne + ie) / 2, rx: Math.abs(te - H) / 2, ry: Math.abs(ie - ne) / 2 } : $ === "pixelate" ? { type: "pixelate", x: Math.min(H, te), y: Math.min(ne, ie), w: Math.abs(te - H), h: Math.abs(ie - ne) } : null;
      let dt = 1, wr = 0, xr = 0, yi = null;
      const Oh = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), bi = Hg(Oh), zs = () => {
        if (yi) return yi;
        const $ = E.style.transform;
        return E.style.transform = "", yi = E.getBoundingClientRect(), E.style.transform = $, yi;
      }, at = document.createElement("div");
      at.className = "kl-minimap", at.hidden = !0, at.setAttribute("role", "navigation"), at.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Yn = document.createElement("img");
      Yn.className = "kl-minimap-img", Yn.alt = "", Yn.draggable = !1, Yn.src = C;
      const mn = document.createElement("div");
      mn.className = "kl-minimap-vp", at.append(Yn, mn), b.appendChild(at);
      const $l = () => {
        const $ = E.width, H = E.height;
        if (dt <= 1 || $ < 2 || H < 2) {
          at.hidden = !0;
          return;
        }
        const ne = zs();
        if (!ne) {
          at.hidden = !0;
          return;
        }
        const te = 148, ie = Math.min(te / $, te / H), Ze = Math.max(1, Math.round($ * ie)), Mt = Math.max(1, Math.round(H * ie));
        at.style.width = Ze + "px", at.style.height = Mt + "px";
        const er = b.getBoundingClientRect(), ur = Yg(
          { left: er.left, top: er.top, right: er.right, bottom: er.bottom },
          { left: ne.left, top: ne.top, width: ne.width, height: ne.height },
          { panX: wr, panY: xr },
          dt,
          $,
          H
        );
        mn.style.left = ur.x * ie + "px", mn.style.top = ur.y * ie + "px", mn.style.width = Math.max(3, ur.w * ie) + "px", mn.style.height = Math.max(3, ur.h * ie) + "px", at.hidden = !1;
      }, Vn = () => {
        if (dt === 1) {
          wr = 0, xr = 0, E.style.transform = "", E.style.cursor = "crosshair", $l();
          return;
        }
        E.style.transformOrigin = "0 0", E.style.transform = `translate(${wr}px,${xr}px) scale(${dt})`, E.style.cursor = "grab", $l();
      }, ki = ($, H, ne) => {
        const te = zs();
        if (!te) return;
        const ie = dt;
        if (dt = qg(dt * ne), dt === ie) return;
        const Ze = jg($, H, { left: te.left, top: te.top, width: te.width, height: te.height }, ie, dt, { panX: wr, panY: xr });
        wr = Ze.panX, xr = Ze.panY, E.style.transition = bi, Vn();
      }, $s = () => {
        const $ = b.getBoundingClientRect();
        return { cx: $.left + $.width / 2, cy: $.top + $.height / 2 };
      }, Nh = () => {
        dt = 1, E.style.transition = bi, Vn();
      };
      (q = w.querySelector("#kl-hero-zoomin")) == null || q.addEventListener("click", () => {
        const { cx: $, cy: H } = $s();
        ki($, H, 1.25);
      }), (j = w.querySelector("#kl-hero-zoomout")) == null || j.addEventListener("click", () => {
        const { cx: $, cy: H } = $s();
        ki($, H, 0.8);
      });
      const Ph = ($, H) => {
        const ne = zs();
        if (!ne) return;
        const te = b.getBoundingClientRect(), ie = Gg($, H, { left: te.left, top: te.top, right: te.right, bottom: te.bottom }, { left: ne.left, top: ne.top, width: ne.width, height: ne.height }, dt, E.width);
        wr = ie.panX, xr = ie.panY, E.style.transition = bi, Vn();
      };
      let vi = !1;
      const Dl = ($, H) => {
        const ne = at.getBoundingClientRect(), { ix: te, iy: ie } = Vg($ - ne.left, H - ne.top, ne.width, ne.height, E.width, E.height);
        Ph(te, ie);
      };
      at.addEventListener("pointerdown", ($) => {
        vi = !0;
        try {
          at.setPointerCapture($.pointerId);
        } catch {
        }
        Dl($.clientX, $.clientY), $.preventDefault(), $.stopPropagation();
      }), at.addEventListener("pointermove", ($) => {
        vi && (Dl($.clientX, $.clientY), $.preventDefault());
      });
      const Fl = ($) => {
        if (vi) {
          vi = !1;
          try {
            at.releasePointerCapture($.pointerId);
          } catch {
          }
        }
      };
      at.addEventListener("pointerup", Fl), at.addEventListener("pointercancel", Fl), b.addEventListener("wheel", ($) => {
        Z !== "crop" && ($.preventDefault(), ki($.clientX, $.clientY, Wg($.deltaY)));
      }, { passive: !1 }), b.addEventListener("dblclick", () => {
        dt = 1, E.style.transition = bi, Vn();
      });
      let zh = T.shapes.reduce(($, H) => H.type === "count" ? Math.max($, H.n) : $, 0), Sr = !1, kt = 0, vt = 0, jr = [], gn = !1, Ul = 0, Bl = 0, ql = 0, Wl = 0, Ct = null, Gn = { x: 0, y: 0 }, pt = null;
      const $h = () => Math.max(14, T.computeFontSize() * 0.6), Hl = ($, H) => {
        for (let ne = T.shapes.length - 1; ne >= 0; ne--) {
          const te = T.shapes[ne];
          if (te.type !== "text") continue;
          const ie = T.textBounds(te);
          if (!ie) continue;
          const Ze = $h();
          if ($ >= ie.x + ie.w - Ze && $ <= ie.x + ie.w + Ze && H >= ie.y + ie.h - Ze && H <= ie.y + ie.h + Ze)
            return { shape: te, mode: "resize" };
          const Mt = 6;
          if ($ >= ie.x - Mt && $ <= ie.x + ie.w + Mt && H >= ie.y - Mt && H <= ie.y + ie.h + Mt)
            return { shape: te, mode: "move" };
        }
        return null;
      };
      E.addEventListener("pointerdown", ($) => {
        if ($.shiftKey && dt > 1) {
          gn = !0, Ul = $.clientX, Bl = $.clientY, ql = wr, Wl = xr, E.style.transition = "none", E.style.cursor = "grabbing";
          try {
            E.setPointerCapture($.pointerId);
          } catch {
          }
          $.preventDefault();
          return;
        }
        const H = qe($);
        if (kt = H.x, vt = H.y, Z === "crop") {
          Sr = !0;
          try {
            E.setPointerCapture($.pointerId);
          } catch {
          }
          Gn = { x: $.clientX, y: $.clientY }, Ct = document.createElement("div"), Ct.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", b.appendChild(Ct);
          return;
        }
        if (Z === "text") {
          const ne = Hl(H.x, H.y);
          if (ne) {
            cn(g), pt = { shape: ne.shape, mode: ne.mode, grabX: H.x, grabY: H.y, origX: ne.shape.x, origY: ne.shape.y, origSize: ne.shape.size ?? T.computeFontSize() };
            try {
              E.setPointerCapture($.pointerId);
            } catch {
            }
            E.style.cursor = ne.mode === "resize" ? "nwse-resize" : "move", $.preventDefault();
            return;
          }
          const te = document.createElement("input"), ie = et === "none" ? "none" : `0 0 2px ${et}, 0 0 2px ${et}`, Ze = gi(), Mt = Math.max(6, Ye * Ze), er = Ye, ur = et;
          te.style.cssText = `position:fixed;left:${$.clientX}px;top:${$.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${he};font-size:${Mt}px;font-family:sans-serif;font-weight:700;text-shadow:${ie};outline:1px dashed ${he};z-index:2147483647;min-width:80px;`, document.body.appendChild(te), bt = te, requestAnimationFrame(() => {
            document.body.contains(te) && te.focus();
          }), te.addEventListener("blur", () => {
            bt = null, te.value.trim() && (cn(g), T.addShape({ type: "text", color: he, x: kt, y: vt, text: te.value.trim(), size: er, outline: ur }), zt()), tt(te);
          }, { once: !0 }), te.addEventListener("keydown", (yn) => {
            yn.key === "Enter" && te.blur(), yn.key === "Escape" && (te.value = "", te.blur()), yn.stopPropagation();
          });
          return;
        }
        if (Z === "count") {
          cn(g), T.addShape({ type: "count", color: he, x: H.x, y: H.y, n: ++zh }), zt();
          return;
        }
        Sr = !0;
        try {
          E.setPointerCapture($.pointerId);
        } catch {
        }
        Z === "pen" && (jr = [H]);
      }), E.addEventListener("pointermove", ($) => {
        if (gn) {
          E.style.transition = "none", wr = ql + ($.clientX - Ul), xr = Wl + ($.clientY - Bl), Vn(), E.style.cursor = "grabbing";
          return;
        }
        if (pt) {
          const te = qe($);
          pt.mode === "move" ? (pt.shape.x = pt.origX + (te.x - pt.grabX), pt.shape.y = pt.origY + (te.y - pt.grabY)) : pt.shape.size = Math.max(10, Math.min(240, pt.origSize + (te.y - pt.grabY))), T.redraw();
          return;
        }
        if (Z === "text" && !Sr) {
          const te = qe($), ie = Hl(te.x, te.y);
          E.style.cursor = ie ? ie.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Sr) return;
        if (Z === "pen") {
          jr.push(qe($)), jr.length > 1 && T.drawPreview({ type: "pen", color: he, points: jr });
          return;
        }
        if (Z === "crop" && Ct) {
          const te = b.getBoundingClientRect(), ie = Math.min(Gn.x, $.clientX), Ze = Math.min(Gn.y, $.clientY), Mt = Math.max(Gn.x, $.clientX), er = Math.max(Gn.y, $.clientY);
          Ct.style.left = ie - te.left + "px", Ct.style.top = Ze - te.top + "px", Ct.style.width = Mt - ie + "px", Ct.style.height = er - Ze + "px";
          return;
        }
        const H = qe($), ne = Ih(Z, kt, vt, H.x, H.y, he);
        ne && T.drawPreview(ne);
      }), E.addEventListener("pointerup", ($) => {
        if (gn) {
          gn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair";
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
          E.style.cursor = "crosshair", T.redraw(), zt();
          return;
        }
        if (!Sr) return;
        Sr = !1;
        try {
          E.releasePointerCapture($.pointerId);
        } catch {
        }
        const H = qe($);
        if (Z === "crop") {
          Ct && (tt(Ct), Ct = null);
          const Mt = Math.max(0, Math.min(kt, H.x)), er = Math.max(0, Math.min(vt, H.y)), ur = Math.abs(H.x - kt), yn = Math.abs(H.y - vt);
          ur > 4 && yn > 4 && Mh(g, Mt, er, ur, yn);
          return;
        }
        const ne = Z === "pixelate" && Math.abs(H.x - kt) > 4 && Math.abs(H.y - vt) > 4, te = Math.abs(H.x - kt) > 3 || Math.abs(H.y - vt) > 3, ie = (Z === "line" || Z === "rect" || Z === "circle" || Z === "arrow") && te;
        (Z === "pen" && jr.length > 1 || ie || ne) && cn(g), Z === "pen" && jr.length > 1 ? T.addShape({ type: "pen", color: he, points: jr }) : ie && Z === "line" ? T.addShape({ type: "line", color: he, x1: kt, y1: vt, x2: H.x, y2: H.y }) : ie && Z === "rect" ? T.addShape({ type: "rect", color: he, x: Math.min(kt, H.x), y: Math.min(vt, H.y), w: Math.abs(H.x - kt), h: Math.abs(H.y - vt) }) : ie && Z === "circle" ? T.addShape({ type: "circle", color: he, x: (kt + H.x) / 2, y: (vt + H.y) / 2, rx: Math.abs(H.x - kt) / 2, ry: Math.abs(H.y - vt) / 2 }) : ie && Z === "arrow" ? T.addShape({ type: "arrow", color: he, x1: kt, y1: vt, x2: H.x, y2: H.y }) : ne && T.addShape({ type: "pixelate", x: Math.min(kt, H.x), y: Math.min(vt, H.y), w: Math.abs(H.x - kt), h: Math.abs(H.y - vt) }), zt();
      }), E.addEventListener("pointercancel", ($) => {
        try {
          E.releasePointerCapture($.pointerId);
        } catch {
        }
        Ct && (tt(Ct), Ct = null), gn && (gn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair"), pt && (pt = null, E.style.cursor = "crosshair", T.redraw(), zt()), Sr && (Sr = !1, T.redraw());
      });
      const jl = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      Or = ($) => {
        if (!document.body.contains(s)) {
          jn();
          return;
        }
        if (bt && document.body.contains(bt)) return;
        const H = typeof $.composedPath == "function" && $.composedPath()[0] || $.target;
        if (H && (H.tagName === "INPUT" || H.tagName === "TEXTAREA" || H.tagName === "SELECT" || H.isContentEditable)) return;
        if (($.metaKey || $.ctrlKey) && $.key.toLowerCase() === "z") {
          $.preventDefault(), Za(g);
          return;
        }
        if ($.metaKey || $.ctrlKey || $.altKey) return;
        const ne = $.key.toLowerCase();
        if (ne === "z") {
          if ($.preventDefault(), dt > 1) Nh();
          else {
            const { cx: te, cy: ie } = $s();
            ki(te, ie, 2);
          }
          return;
        }
        jl[ne] && ($.preventDefault(), ge(jl[ne]));
      }, document.addEventListener("keydown", Or, { capture: !0 });
    }
  }
  function Ah(g) {
    const b = c[g], w = new Image();
    w.onload = () => {
      const C = document.createElement("canvas");
      C.width = w.naturalWidth, C.height = w.naturalHeight;
      const E = new oa(C, b);
      E.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const A = document.createElement("div");
      A.className = "kl-edtb", A.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", A.innerHTML = `
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${G("pencil", { size: 14 })} Pen</button>
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
      const N = document.createElement("div");
      N.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", N.appendChild(C);
      const _ = document.createElement("style");
      _.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(_, A, N), a.appendChild(T), jn();
      let U = 1;
      const D = (ee) => Math.max(0.05, Math.min(5, ee || 1));
      function B(ee) {
        U = D(ee), C.style.width = Math.round(C.width * U) + "px", C.style.height = Math.round(C.height * U) + "px";
        const ue = A.querySelector("#klavity-zoom-pct");
        ue && (ue.textContent = Math.round(U * 100) + "%");
      }
      const Y = () => Math.max(1, N.clientWidth - 24) / C.width, q = () => Math.min(Math.max(1, N.clientWidth - 24) / C.width, Math.max(1, N.clientHeight - 24) / C.height), j = C.height / C.width > Math.max(1, N.clientHeight) / Math.max(1, N.clientWidth);
      B(j ? Y() : q()), A.querySelector("#klavity-zoom-in").addEventListener("click", () => B(U * 1.25)), A.querySelector("#klavity-zoom-out").addEventListener("click", () => B(U / 1.25)), A.querySelector("#klavity-fit-width").addEventListener("click", () => B(Y())), A.querySelector("#klavity-fit-page").addEventListener("click", () => B(q()));
      let K = "rect", Z = "#ef4444", he = !1, Ye = [], et = 0, bt = 0;
      function vr(ee) {
        K = ee, A.querySelectorAll("[data-tool]").forEach((ue) => {
          const qe = ue.dataset.tool === ee;
          ue.style.background = qe ? "#585b70" : "#313244", ue.style.outline = qe ? "2px solid #89b4fa" : "none";
        });
      }
      A.querySelectorAll("[data-tool]").forEach((ee) => ee.addEventListener("click", () => vr(ee.dataset.tool))), A.querySelectorAll("[data-color]").forEach((ee) => ee.addEventListener("click", () => {
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
        zt[qe] ? (ee.preventDefault(), vr(zt[qe])) : qe === "u" && (ee.preventDefault(), E.undo());
      }
      function Fe() {
        document.removeEventListener("keydown", ge, { capture: !0 }), tt(T), Ll();
      }
      document.addEventListener("keydown", ge, { capture: !0 }), vr(K), A.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        cn(g), E.shapes.length ? re[g] = { w: C.width, h: C.height, shapes: E.shapes.map((ee) => ({ ...ee })) } : delete re[g], ln(g), Fe(), Ne();
      }), A.querySelector("#klavity-cancel-ann").addEventListener("click", () => Fe());
      function $e(ee) {
        const ue = C.getBoundingClientRect();
        return { x: (ee.clientX - ue.left) / ue.width * C.width, y: (ee.clientY - ue.top) / ue.height * C.height };
      }
      C.addEventListener("pointerdown", (ee) => {
        he = !0;
        const ue = $e(ee);
        if ({ x: et, y: bt } = ue, K === "pen" && (Ye = [ue]), K === "text") {
          he = !1;
          const qe = document.createElement("input");
          qe.style.cssText = `position:fixed;left:${ee.clientX}px;top:${ee.clientY}px;background:transparent;border:1px dashed ${Z};color:${Z};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(qe), requestAnimationFrame(() => {
            document.body.contains(qe) && qe.focus();
          }), qe.addEventListener("blur", () => {
            qe.value.trim() && E.addShape({ type: "text", color: Z, x: et, y: bt, text: qe.value.trim() }), tt(qe);
          }, { once: !0 }), qe.addEventListener("keydown", (gi) => {
            gi.key === "Enter" && qe.blur(), gi.stopPropagation();
          });
        }
      }), C.addEventListener("pointermove", (ee) => {
        he && K === "pen" && Ye.push($e(ee));
      }), C.addEventListener("pointerup", (ee) => {
        if (!he) return;
        he = !1;
        const ue = $e(ee);
        K === "pen" && Ye.length > 1 ? E.addShape({ type: "pen", color: Z, points: Ye }) : K === "rect" ? E.addShape({ type: "rect", color: Z, x: Math.min(et, ue.x), y: Math.min(bt, ue.y), w: Math.abs(ue.x - et), h: Math.abs(ue.y - bt) }) : K === "circle" ? E.addShape({ type: "circle", color: Z, x: (et + ue.x) / 2, y: (bt + ue.y) / 2, rx: Math.abs(ue.x - et) / 2, ry: Math.abs(ue.y - bt) / 2 }) : K === "arrow" && E.addShape({ type: "arrow", color: Z, x1: et, y1: bt, x2: ue.x, y2: ue.y });
      });
    }, w.src = b;
  }
  function Lh(g, b) {
    const w = document.createElement("div");
    w.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const C = document.createElement("div");
    C.className = "klavity-sent";
    const E = document.createElement("div");
    E.className = "kl-sent-check", E.innerHTML = G("check", { label: "Sent", size: 22 }), C.appendChild(E);
    const T = document.createElement("h2");
    T.textContent = "Report sent", C.appendChild(T);
    const A = document.createElement("p");
    if (A.textContent = n.thankYou || "We filed it and emailed you a copy.", C.appendChild(A), g) {
      const N = document.createElement("div");
      N.className = "klavity-ref";
      const _ = document.createElement("span");
      _.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = Ys(g, b), N.append(_, U);
      const D = Vs(b);
      if (D) {
        const B = document.createElement("a");
        B.href = D, B.target = "_blank", B.rel = "noopener", B.textContent = "Open in Klavity", N.appendChild(B);
      }
      C.appendChild(N);
    }
    w.appendChild(C), tt($r), a.appendChild(w), fl(C, $n);
  }
  function _h(g, b, w) {
    const { copy: C, onLead: E } = w;
    le.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const A = document.createElement("h2");
    if (A.innerHTML = C.headline, T.appendChild(A), C.body) {
      const _ = document.createElement("p");
      _.textContent = C.body, T.appendChild(_);
    }
    if (g) {
      const _ = document.createElement("div");
      _.className = "klavity-ref";
      const U = document.createElement("span");
      U.textContent = "Filed as";
      const D = document.createElement("code");
      D.textContent = Ys(g, b), _.append(U, D);
      const B = Vs(b);
      if (B) {
        const Y = document.createElement("a");
        Y.href = B, Y.target = "_blank", Y.rel = "noopener", Y.textContent = "Open in Klavity", _.appendChild(Y);
      }
      T.appendChild(_);
    }
    const N = () => fl(le, Dn);
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
        const j = U.value.trim();
        if (!j || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(j)) {
          Y.textContent = "Please enter a valid email so we can reach you.", Y.style.display = "block", U.focus();
          return;
        }
        D.disabled = !0, D.textContent = "Saving…", Y.style.display = "none";
        try {
          E && await E(g, j);
        } catch (Z) {
          try {
            console.warn("[Klavity] lead capture failed:", (Z == null ? void 0 : Z.message) || Z);
          } catch {
          }
          Y.textContent = "Couldn't save your email — please try again.", Y.style.display = "block", D.disabled = !1, D.textContent = "Retry", U.focus();
          return;
        }
        const K = document.createElement("div");
        K.className = "klavity-thanks", K.textContent = "Thanks — we'll be in touch.", tt(Y), _.replaceWith(K), C.showCta || N();
      };
      D.addEventListener("click", q), U.addEventListener("keydown", (j) => {
        j.key === "Enter" && q();
      }), _.append(U, D), T.appendChild(_), T.appendChild(Y);
    }
    if (C.showCta && C.ctaUrl) {
      const _ = document.createElement("a");
      _.className = "klavity-cta", _.href = C.ctaUrl, _.target = "_blank", _.rel = "noopener", _.textContent = C.ctaText, T.appendChild(_);
    }
    if (le.appendChild(T), !n.whiteLabel) {
      const _ = document.createElement("div");
      _.className = "klavity-pb";
      const U = document.createElement("a");
      U.href = Rd("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), U.target = "_blank", U.rel = "noopener", U.textContent = "Klavity", _.append("Powered by ", U), le.appendChild(_);
    }
    !C.showEmail && !C.showCta && N();
  }
  if (P.length && (be = P.length - 1, dn()), t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const b = g <= L;
    if (b || pc(t) === "screen") {
      if (l = !0, Ne(), pc(t) === "screen")
        return (async () => {
          const E = await Os({ viewport: !0, onOpen: !0 });
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
            Ml(null).catch(() => {
              l = !1, Ne();
            });
            return;
          }
          t.onCaptureFull().then((T) => {
            const { dataUrl: A, quality: N, suggestSharp: _, blank: U } = Ht(T);
            if (l = !1, U && c.length === 0) {
              vs();
              return;
            }
            Nt(A, N, void 0, !0, !!_), Qt(Hr);
          }).catch(() => {
            l = !1, Ne();
          });
        })(), rl;
      const w = () => {
        if (t.onCaptureViewport) {
          Ml(null).catch(() => {
            l = !1, Ne();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: T, quality: A, suggestSharp: N, blank: _ } = Ht(E);
          if (l = !1, _ && c.length === 0) {
            vs();
            return;
          }
          Nt(T, A, void 0, !0, !!N), Qt(Hr);
        }).catch(() => {
          l = !1, Ne();
        });
      }, C = window.requestIdleCallback;
      typeof C == "function" ? C(() => w(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(w, 0));
    } else
      y = !0, Ne();
  }
  return rl;
}
function gy(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), tt(r), tt(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    a = !0, i = p.clientX, s = p.clientY, tt(n);
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
const yy = 2e4;
async function hc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), yy);
        })
      ]);
      return fc(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return fc(e);
}
const by = 3e4;
function fc(e) {
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
    }, by), a = (c) => {
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
const ky = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function vy(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function wy(e) {
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
const xy = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Yr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Sy(e) {
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
  } = e, o = Yr(e.initials || vy(t)), h = i !== "none" ? ky[i] : null, d = h ? `<span class="ksim-mark ${l ? xy[h.mark] : ""}" style="color:${Yr(h.accent)}">${wy(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Yr(r)}" alt="${Yr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), M = `--ksim-persona:${Yr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${Yr(h.accent)};` : "");
  return `<span class="${y}" style="${M}" data-emotion="${i}" title="${Yr(t)}">${d}${m}${f}</span>`;
}
function Ey(e) {
  const t = document.createElement("template");
  return t.innerHTML = Sy(e).trim(), t.content.firstElementChild;
}
const Cy = `
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
function My(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Cy, t.appendChild(r);
}
function ua(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let p = 0; p < c.length; p++) l[p] = c.charCodeAt(p);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function Ry(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function Ty(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? ua(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", ua(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return Ry(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function Ay(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function Ly(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = Ty({
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
  await Ay(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
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
        l.append("screenshot_thumbs", ua(u), "thumb.jpg");
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
const _y = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Iy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Oy(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Iy + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Ny(e) {
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
function Py(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function Gs(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Ny(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = Py(n);
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
function mc(e, t = 0) {
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
function gc(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function zy(e, t) {
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
    const X = tr(e, l);
    if (!X) break;
    const se = tr(e, l + X.width);
    if (!se) break;
    if (X.rawId === 357149030) {
      h = l, d = se, u = X.width + se.width;
      break;
    }
    if (X.rawId === 524531317) break;
    l += X.width + se.width + se.value;
  }
  if (h === -1 || !d) return e;
  const m = h + u, f = m + d.value;
  let y = m, M = 1e6, v = -1, k = 0, L = 0, S = !1;
  for (; y < f; ) {
    const X = tr(e, y);
    if (!X) break;
    const se = tr(e, y + X.width);
    if (!se) break;
    const re = y + X.width + se.width, fe = re + se.value;
    if (X.rawId === 2807729) {
      S = !0;
      let Re = 0;
      for (let je = 0; je < se.value; je++)
        Re = Re * 256 + e[re + je];
      Re > 0 && (M = Re);
    } else X.rawId === 17545 && (v = y, k = fe - y, L = se.value);
    y = fe;
  }
  const x = t * 1e6 / M;
  if (v !== -1 && L === 8) {
    const X = tr(e, v);
    if (X) {
      const se = tr(e, v + X.width);
      if (se && se.value === 8) {
        const re = v + X.width + se.width, fe = new Uint8Array(e);
        return fe.set(gc(x), re), fe;
      }
    }
  }
  const R = new Uint8Array(11);
  R[0] = 68, R[1] = 137, R[2] = 136, R.set(gc(x), 3);
  let I = null;
  S || (I = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let F;
  if (v === -1) {
    const X = e.subarray(m, f), se = R.length + (I ? I.length : 0);
    F = new Uint8Array(X.length + se);
    let re = 0;
    I && (F.set(I, re), re += I.length), F.set(X, re), re += X.length, F.set(R, re);
  } else {
    const X = e.subarray(m, v), se = e.subarray(v + k, f), re = R.length + (I ? I.length : 0);
    F = new Uint8Array(X.length + re + se.length);
    let fe = 0;
    I && (F.set(I, fe), fe += I.length), F.set(X, fe), fe += X.length, F.set(R, fe), fe += R.length, F.set(se, fe);
  }
  const z = mc(F.length), Q = new Uint8Array(4 + z.length);
  Q[0] = 21, Q[1] = 73, Q[2] = 169, Q[3] = 102, Q.set(z, 4);
  const W = new Uint8Array(Q.length + F.length);
  W.set(Q, 0), W.set(F, Q.length);
  const O = u + d.value, Ue = W.length - O;
  let Xe = null;
  p || (Xe = mc(a.value + Ue, a.width));
  const me = e.subarray(0, i + s.width), pe = Xe || e.subarray(i + s.width, c), _e = e.subarray(c, h), We = W, Ie = e.subarray(h + O), we = me.length + pe.length + _e.length + We.length + Ie.length, Ke = new Uint8Array(we);
  let P = 0;
  return Ke.set(me, P), P += me.length, Ke.set(pe, P), P += pe.length, Ke.set(_e, P), P += _e.length, Ke.set(We, P), P += We.length, Ke.set(Ie, P), P += Ie.length, Ke;
}
function $y(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Dy(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await $y(e)), n = zy(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const Fy = 180 * 1e3, Uy = 50 * 1024 * 1024, By = 1e6, qy = 96e3, Wy = 15, yc = 1280, _d = {
  maxDurationMs: Fy,
  maxBytes: Uy
}, Hy = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function Sa() {
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
function jy(e, t = Hy) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Id(e = Sa()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Yy() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function Vy(e = {}, t = Sa()) {
  var v, k, L, S, x, R, I, F, z, Q, W, O, Ue, Xe, me, pe, _e, We, Ie, we, Ke;
  const r = { ..._d, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? Wy)), a = jy(
    (v = t.MediaRecorder) != null && v.isTypeSupported ? (P) => t.MediaRecorder.isTypeSupported(P) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Yy(), l = t.createElement("canvas"), p = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0, o.autoplay = !0;
  try {
    (k = o.setAttribute) == null || k.call(o, "playsinline", ""), (L = o.setAttribute) == null || L.call(o, "autoplay", ""), (S = o.setAttribute) == null || S.call(o, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (x = h.setAttribute) == null || x.call(h, "playsinline", ""), (R = h.setAttribute) == null || R.call(h, "autoplay", ""), (I = h.setAttribute) == null || I.call(h, "muted", "");
  } catch {
  }
  let d = "idle";
  const u = (P) => {
    var X;
    d = P;
    try {
      (X = e.onState) == null || X.call(e, P);
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
    for (const X of [f, y])
      try {
        (P = X == null ? void 0 : X.getTracks) == null || P.call(X).forEach((se) => {
          var re;
          return (re = se.stop) == null ? void 0 : re.call(se);
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
    const X = (z = f.getVideoTracks) == null ? void 0 : z.call(f)[0], se = ((Q = X == null ? void 0 : X.getSettings) == null ? void 0 : Q.call(X)) ?? {}, re = se.width && se.height ? se.width / se.height : 16 / 9;
    l.width = yc, l.height = Math.round(yc / re);
    let fe = null, Re = !1, je = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((W = y.getVideoTracks) != null && W.call(y).length)) {
          Re = !0, je = !1;
          try {
            h.srcObject = y, await (((O = h.play) == null ? void 0 : O.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (fe = ((Ue = y.getAudioTracks) == null ? void 0 : Ue.call(y)[0]) || null, fe && (je = !1));
      } catch (oe) {
        let Ee = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), fe = ((Xe = y.getAudioTracks) == null ? void 0 : Xe.call(y)[0]) || null, fe) {
              je = !1, Ee = !0;
              try {
                (me = e.onFallback) == null || me.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!Ee) {
          try {
            (pe = e.onFallback) == null || pe.call(e, (oe == null ? void 0 : oe.name) === "NotAllowedError" ? "permissions-policy" : (oe == null ? void 0 : oe.name) || "camera-mic-blocked");
          } catch {
          }
          je = !0;
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
      const oe = l.width, Ee = l.height;
      if (o.videoWidth) {
        const Pe = o.videoWidth, rt = o.videoHeight, Oe = Pe / rt, zr = oe / Ee;
        let an = oe, $n = Ee, Dn = 0, Je = 0;
        Oe > zr ? ($n = oe / Oe, Je = (Ee - $n) / 2) : (an = Ee * Oe, Dn = (oe - an) / 2), (Dn > 0 || Je > 0) && (p.fillStyle = "#000", p.fillRect(0, 0, oe, Ee)), p.drawImage(o, Dn, Je, an, $n);
      }
      if (Re && h.videoWidth) {
        const Pe = Math.round(oe * 0.22), rt = Math.round(Pe * (h.videoHeight / h.videoWidth)), Oe = oe - Pe - 20, zr = Ee - rt - 20;
        p.drawImage(h, Oe, zr, Pe, rt), p.strokeStyle = "#7c3aed", p.lineWidth = 2, p.strokeRect(Oe, zr, Pe, rt);
      }
      d === "recording" && (p.fillStyle = "#e11", p.beginPath(), p.arc(24, 24, 7, 0, Math.PI * 2), p.fill());
    };
    if (Re) {
      let oe = 0;
      const Ee = Math.floor(1e3 / s), Pe = () => {
        oe = t.now(), Ce();
      }, rt = () => {
        ce = t.raf(rt), Pe();
      };
      rt(), ye = t.setInterval(() => {
        var Oe;
        if (o.paused && !(X != null && X.muted))
          try {
            (Oe = o.play) == null || Oe.call(o);
          } catch {
          }
        t.now() - oe >= Ee && Pe();
      }, Math.max(16, Ee));
    }
    const xe = [];
    let de = null;
    if (Re) {
      try {
        de = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const oe = (We = de == null ? void 0 : de.getVideoTracks) == null ? void 0 : We.call(de)[0];
      oe ? xe.push(oe) : X && xe.push(X);
    } else X && xe.push(X);
    fe && xe.push(fe);
    const ae = new t.MediaStream(xe);
    try {
      (Ie = X == null ? void 0 : X.addEventListener) == null || Ie.call(X, "ended", () => P()), (we = X == null ? void 0 : X.addEventListener) == null || we.call(X, "mute", () => {
      }), (Ke = X == null ? void 0 : X.addEventListener) == null || Ke.call(X, "unmute", () => {
        var oe;
        if (Re) {
          try {
            (oe = o.play) == null || oe.call(o);
          } catch {
          }
          Ce();
        }
      });
    } catch {
    }
    const be = () => {
      var oe, Ee;
      if (Re && typeof document < "u" && !document.hidden) {
        try {
          (oe = o.play) == null || oe.call(o);
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
    const Or = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? By)), di = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? qy)), Ot = new t.MediaRecorder(ae, { mimeType: a, videoBitsPerSecond: Or, audioBitsPerSecond: di }), Nr = [];
    let Be = 0, lt = 0, Se = 0, yt = 0, Et = 0, ar = !1;
    const ut = () => {
      if (d === "idle") return 0;
      const oe = t.now() - lt - Se;
      return Math.max(0, oe - (yt ? t.now() - yt : 0));
    };
    Ot.ondataavailable = (oe) => {
      var Ee, Pe;
      if (oe != null && oe.data && oe.data.size) {
        Nr.push(oe.data), Be += oe.data.size;
        try {
          (Ee = e.onChunk) == null || Ee.call(e, oe.data);
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
    const Jt = new Promise((oe) => {
      De = oe;
    }), Pr = M;
    return Ot.onstop = async () => {
      ce && t.caf(ce), ye && (t.clearInterval(ye), ye = 0), Et && (t.clearInterval(Et), Et = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", be);
      } catch {
      }
      const oe = ut();
      Pr();
      try {
        o.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      u("stopped");
      const Ee = new Blob(Nr, { type: a.split(";")[0] });
      let Pe = Ee;
      if (oe > 0 && (Ee.type.includes("webm") || a.includes("webm")))
        try {
          Pe = await Dy(Ee, oe);
        } catch {
          Pe = Ee;
        }
      const rt = se.width && se.width > 0 ? se.width : l.width, Oe = se.height && se.height > 0 ? se.height : l.height;
      De({
        id: c,
        blob: Pe,
        mime: (Pe.type || a || "video/webm").split(";")[0],
        durationMs: oe,
        bytes: Pe.size || Be,
        width: Re ? l.width : rt,
        height: Re ? l.height : Oe,
        screenOnly: je,
        hadCamera: Re,
        hadAudio: gt
      });
    }, Ot.start(1e3), lt = t.now(), u("recording"), Et = t.setInterval(() => {
      var Ee;
      const oe = ut();
      try {
        (Ee = e.onStats) == null || Ee.call(e, { elapsedMs: oe, bytes: Be });
      } catch {
      }
      oe >= r.maxDurationMs && P();
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
        return je;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Re && y ? y : null;
      },
      done: Jt
    };
  } catch (P) {
    throw M(), P;
  }
}
function Gy(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Ky(e) {
  return {
    id: e.id,
    dataUrl: await Gy(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Xy(e) {
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
async function Jy(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? Sa();
  return Id(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', a = (x) => {
      x === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (x) => {
      var R;
      try {
        (R = e.onPhase) == null || R.call(e, x);
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
      const R = Math.max(0, Math.round(x / 1e3));
      return `${Math.floor(R / 60)}:${String(R % 60).padStart(2, "0")}`;
    }, M = (x) => `${(x / 1048576).toFixed(1)} MB`, v = { ..._d, ...e.caps || {} }, k = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const x = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${x}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const R = i.querySelector("#klr-cam").checked, I = i.querySelector("#klr-mic").checked;
        L(R, I);
      };
    }, L = async (x, R) => {
      var F;
      let I = null;
      try {
        p = await Vy({
          wantCamera: x,
          wantMic: R,
          caps: e.caps,
          onFallback: (z) => {
            I = z;
          },
          onStats: ({ elapsedMs: z, bytes: Q }) => {
            const W = i.querySelector("#klr-timer");
            W && (W.textContent = "REC " + y(z));
            const O = i.querySelector("#klr-meta");
            O && (O.innerHTML = `${y(Math.max(0, v.maxDurationMs - z))} left<br>~${M(Q)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(I);
      try {
        const z = Xy((F = p == null ? void 0 : p.cameraStream) == null ? void 0 : F.call(p));
        z && n.appendChild(z);
      } catch {
      }
      p.done.then(async (z) => {
        f(await Ky(z));
      });
    }, S = (x) => {
      const R = x === "camera-blocked", F = R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!x && !R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + F;
      const z = i.querySelector("#klr-pause");
      z.onclick = () => {
        p && (p.state() === "recording" ? (p.pause(), z.textContent = "Resume") : (p.resume(), z.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => p == null ? void 0 : p.stop();
    };
    k();
  }) : null;
}
async function bc(e, t = {}) {
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
async function Zy(e, t = {}) {
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
var Qy = Object.defineProperty, eb = (e, t, r) => t in e ? Qy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, V = (e, t, r) => eb(e, typeof t != "symbol" ? t + "" : t, r), kc, tb = Object.defineProperty, rb = (e, t, r) => t in e ? tb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, vc = (e, t, r) => rb(e, typeof t != "symbol" ? t + "" : t, r), it = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(it || {});
const wc = {
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
}, xc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ti = {}, Od = {}, nb = () => !!globalThis.Zone;
function Ea(e) {
  if (Ti[e])
    return Ti[e];
  const t = globalThis[e], r = t.prototype, n = e in wc ? wc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in xc ? xc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !nb())
    return Ti[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Od[e] = () => c.remove()) : c.remove(), Ti[e] = p;
  } catch {
    return r;
  }
}
const Ks = {};
function fr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ks[i])
    return Ks[i].call(
      t
    );
  const s = Ea(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Ks[i] = a, a.call(t)) : t[r];
}
const Xs = {};
function Nd(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Xs[n])
    return Xs[n].bind(
      t
    );
  const s = Ea(e)[r];
  return typeof s != "function" ? t[r] : (Xs[n] = s, s.bind(t));
}
function ib(e) {
  return fr("Node", e, "ownerDocument");
}
function sb(e) {
  return fr("Node", e, "childNodes");
}
function ob(e) {
  return fr("Node", e, "parentNode");
}
function ab(e) {
  return fr("Node", e, "parentElement");
}
function lb(e) {
  return fr("Node", e, "textContent");
}
function cb(e, t) {
  return Nd("Node", e, "contains")(t);
}
function ub(e) {
  return Nd("Node", e, "getRootNode")();
}
function db(e) {
  return !e || !("host" in e) ? null : fr("ShadowRoot", e, "host");
}
function pb(e) {
  return e.styleSheets;
}
function hb(e) {
  return !e || !("shadowRoot" in e) ? null : fr("Element", e, "shadowRoot");
}
function fb(e, t) {
  return fr("Element", e, "querySelector")(t);
}
function mb(e, t) {
  return fr("Element", e, "querySelectorAll")(t);
}
function gb() {
  return [
    Ea("MutationObserver").constructor,
    Od.MutationObserver ?? (() => {
    })
  ];
}
let Pd = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Pd = () => (/* @__PURE__ */ new Date()).getTime());
function yb(e, t, r) {
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
  ownerDocument: ib,
  childNodes: sb,
  parentNode: ob,
  parentElement: ab,
  textContent: lb,
  contains: cb,
  getRootNode: ub,
  host: db,
  styleSheets: pb,
  shadowRoot: hb,
  querySelector: fb,
  querySelectorAll: mb,
  nowTimestamp: Pd,
  mutationObserverCtor: gb,
  patch: yb
};
function zd(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Jn(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && mt.host(e) || null
  );
  return !!(t && "shadowRoot" in t && mt.shadowRoot(t) === e);
}
function Zn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function bb(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function kb(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function da(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => $d(i, r)
    ).join("");
    return bb(n);
  } catch {
    return null;
  }
}
function $d(e, t) {
  if (wb(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      da(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      kb(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Xi(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return xb(e) && e.selectorText.includes(":") && (r = vb(r)), t ? Xi(r, t) : r;
  }
}
function vb(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function wb(e) {
  return "styleSheet" in e;
}
function xb(e) {
  return "selectorText" in e;
}
class Dd {
  constructor() {
    vc(this, "idNodeMap", /* @__PURE__ */ new Map()), vc(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Sb() {
  return new Dd();
}
function Gi({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && en(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function en(e) {
  return e.toLowerCase();
}
const Sc = "__rrweb_original__";
function Eb(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = Sc in s ? s[Sc] : s;
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
function Ki(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    en(t)
  ) : null;
}
function Fd(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Cb(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Mb = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Rb = /^(?:[a-z+]+:)?\/\//i, Tb = /^www\..*/i, Ab = /^(data:)([^,]*),(.*)/i;
function Xi(e, t) {
  return (e || "").replace(
    Mb,
    (r, n, i, s, a, c) => {
      const l = i || a || c, p = n || s || "";
      if (!l)
        return r;
      if (Rb.test(l) || Tb.test(l))
        return `url(${p}${l}${p})`;
      if (Ab.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${Cb(t) + l}${p})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const d of h)
        d !== "." && (d === ".." ? o.pop() : o.push(d));
      return `url(${p}${o.join("/")}${p})`;
    }
  );
}
function Ai(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Lb(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Ai(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = Ai(
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
              const y = Ai(f).length;
              m = a.indexOf(d, y);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = Ai(
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
function _b(e, t) {
  return Lb(e, t).join("/* rr_split */");
}
let Ib = 1;
const Ob = new RegExp("[^a-z0-9-_:]"), ni = -2;
function Ud() {
  return Ib++;
}
function Nb(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = en(e.tagName);
  return Ob.test(t) ? "div" : t;
}
let kn, Ec;
const Pb = /^[^ \t\n\r\u000c]+/, zb = /^[, \t\n\r\u000c]+/;
function $b(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(zb), !(r >= t.length); ) {
    let s = n(Pb);
    if (s.slice(-1) === ",")
      s = En(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = En(e, s);
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
const Cc = /* @__PURE__ */ new WeakMap();
function En(e, t) {
  return !t || t.trim() === "" ? t : Ca(e, t);
}
function Db(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Ca(e, t) {
  let r = Cc.get(e);
  if (r || (r = e.createElement("a"), Cc.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Bd(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? En(e, n) : r === "srcset" ? $b(e, n) : r === "style" ? Xi(n, Ca(e)) : t === "object" && r === "data" ? En(e, n) : n);
}
function qd(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Fb(e, t, r) {
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
function Ji(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Ji(mt.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Ji(mt.parentNode(e), t, r) : !1;
}
function Wd(e, t, r, n) {
  let i;
  if (zd(e)) {
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
    } else if (Ji(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Ub(e, t, r) {
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
function Bb(e, t, r) {
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
function qb(e, t) {
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
  } = t, M = Wb(r, n);
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
      return jb(e, {
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
      return Hb(e, {
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
function Wb(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Hb(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = mt.parentNode(e), c = a && a.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = mt.textContent(e), p && l && (l = Xi(l, Ca(t.doc)))), !p && !o && l && r && (l = n ? n(l, mt.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: it.Text,
    textContent: l || "",
    rootId: i
  };
}
function jb(e, t) {
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
  } = t, m = Fb(e, n, i), f = Nb(e);
  let y = {};
  const M = e.attributes.length;
  for (let k = 0; k < M; k++) {
    const L = e.attributes[k];
    qd(f, L.name, L.value) || (y[L.name] = Bd(
      r,
      f,
      en(L.name),
      L.value
    ));
  }
  if (f === "link" && s) {
    const k = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let L = null;
    k && (L = da(k)), L && (delete y.rel, delete y.href, y._cssText = L);
  }
  if (f === "style" && e.sheet) {
    let k = da(
      e.sheet
    );
    k && (e.childNodes.length > 1 && (k = _b(k, e)), y._cssText = k);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const k = e.value, L = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && k ? y.value = Gi({
      element: e,
      type: Ki(e),
      tagName: f,
      value: k,
      maskInputOptions: a,
      maskInputFn: c
    }) : L && (y.checked = L);
  }
  if (f === "option" && (e.selected && !a.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      Eb(e) || (y.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const k = e.toDataURL(
        l.type,
        l.quality
      ), L = r.createElement("canvas");
      L.width = e.width, L.height = e.height;
      const S = L.toDataURL(
        l.type,
        l.quality
      );
      k !== S && (y.rr_dataURL = k);
    }
  }
  if (f === "img" && p) {
    kn || (kn = r.createElement("canvas"), Ec = kn.getContext("2d"));
    const k = e, L = k.currentSrc || k.getAttribute("src") || "<unknown-src>", S = k.crossOrigin, x = () => {
      k.removeEventListener("load", x);
      try {
        kn.width = k.naturalWidth, kn.height = k.naturalHeight, Ec.drawImage(k, 0, 0), y.rr_dataURL = kn.toDataURL(
          l.type,
          l.quality
        );
      } catch (R) {
        if (k.crossOrigin !== "anonymous") {
          k.crossOrigin = "anonymous", k.complete && k.naturalWidth !== 0 ? x() : k.addEventListener("load", x);
          return;
        } else
          console.warn(
            `Cannot inline img src=${L}! Error: ${R}`
          );
      }
      k.crossOrigin === "anonymous" && (S ? y.crossOrigin = S : k.removeAttribute("crossorigin"));
    };
    k.complete && k.naturalWidth !== 0 ? x() : k.addEventListener("load", x);
  }
  if (["audio", "video"].includes(f)) {
    const k = y;
    k.rr_mediaState = e.paused ? "paused" : "played", k.rr_mediaCurrentTime = e.currentTime, k.rr_mediaPlaybackRate = e.playbackRate, k.rr_mediaMuted = e.muted, k.rr_mediaLoop = e.loop, k.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: k, height: L } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${k}px`,
      rr_height: `${L}px`
    };
  }
  f === "iframe" && !h(y.src) && (e.contentDocument || (y.rr_src = y.src), delete y.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: it.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: Db(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: v
  };
}
function He(e) {
  return e == null ? "" : e.toLowerCase();
}
function Hd(e) {
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
function Yb(e, t) {
  if (t.comment && e.type === it.Comment)
    return !0;
  if (e.type === it.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Fd(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (He(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || He(e.attributes.name) === "application-name" || He(e.attributes.rel) === "icon" || He(e.attributes.rel) === "apple-touch-icon" || He(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && He(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (He(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      He(e.attributes.name).match(/^(og|twitter):/) || He(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (He(e.attributes.name) === "robots" || He(e.attributes.name) === "googlebot" || He(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (He(e.attributes.name) === "author" || He(e.attributes.name) === "generator" || He(e.attributes.name) === "framework" || He(e.attributes.name) === "publisher" || He(e.attributes.name) === "progid" || He(e.attributes.property).match(/^article:/) || He(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (He(e.attributes.name) === "google-site-verification" || He(e.attributes.name) === "yandex-verification" || He(e.attributes.name) === "csrf-token" || He(e.attributes.name) === "p:domain_verify" || He(e.attributes.name) === "verify-v1" || He(e.attributes.name) === "verification" || He(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Cn(e, t) {
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
    onIframeLoad: v,
    iframeLoadTimeout: k = 5e3,
    onStylesheetLoad: L,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: x = () => !1,
    newlyAddedElement: R = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: F } = t, { preserveWhiteSpace: z = !0 } = t;
  F || (F = Wd(
    e,
    a,
    c,
    F === void 0
  ));
  const Q = qb(e, {
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
    newlyAddedElement: R,
    cssCaptured: I
  });
  if (!Q)
    return console.warn(e, "not serialized"), null;
  let W;
  n.hasNode(e) ? W = n.getId(e) : Yb(Q, u) || !z && Q.type === it.Text && !Q.textContent.replace(/^\s+|\s+$/gm, "").length ? W = ni : W = Ud();
  const O = Object.assign(Q, { id: W });
  if (n.add(e, O), W === ni)
    return null;
  M && M(e);
  let Ue = !l;
  if (O.type === it.Element) {
    Ue = Ue && !O.needBlock, delete O.needBlock;
    const me = mt.shadowRoot(e);
    me && Zn(me) && (O.isShadowHost = !0);
  }
  if ((O.type === it.Document || O.type === it.Element) && Ue) {
    u.headWhitespace && O.type === it.Element && O.tagName === "head" && (z = !1);
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
      onIframeLoad: v,
      iframeLoadTimeout: k,
      onStylesheetLoad: L,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: x,
      cssCaptured: !1
    };
    if (!(O.type === it.Element && O.tagName === "textarea" && O.attributes.value !== void 0)) {
      O.type === it.Element && O.attributes._cssText !== void 0 && typeof O.attributes._cssText == "string" && (me.cssCaptured = !0);
      for (const _e of Array.from(mt.childNodes(e))) {
        const We = Cn(_e, me);
        We && O.childNodes.push(We);
      }
    }
    let pe = null;
    if (zd(e) && (pe = mt.shadowRoot(e)))
      for (const _e of Array.from(mt.childNodes(pe))) {
        const We = Cn(_e, me);
        We && (Zn(pe) && (We.isShadow = !0), O.childNodes.push(We));
      }
  }
  const Xe = mt.parentNode(e);
  return Xe && Jn(Xe) && Zn(Xe) && (O.isShadow = !0), O.type === it.Element && O.tagName === "iframe" && Ub(
    e,
    () => {
      const me = e.contentDocument;
      if (me && v) {
        const pe = Cn(me, {
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
          onIframeLoad: v,
          iframeLoadTimeout: k,
          onStylesheetLoad: L,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        pe && v(
          e,
          pe
        );
      }
    },
    k
  ), O.type === it.Element && O.tagName === "link" && typeof O.attributes.rel == "string" && (O.attributes.rel === "stylesheet" || O.attributes.rel === "preload" && typeof O.attributes.href == "string" && Fd(O.attributes.href) === "css") && Bb(
    e,
    () => {
      if (L) {
        const me = Cn(e, {
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
          onIframeLoad: v,
          iframeLoadTimeout: k,
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
  ), O;
}
function Vb(e, t) {
  const {
    mirror: r = new Dd(),
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
    iframeLoadTimeout: v,
    onStylesheetLoad: k,
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
  } : o, R = Hd(u);
  return Cn(e, {
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
    slimDOMOptions: R,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: v,
    onStylesheetLoad: k,
    stylesheetLoadTimeout: L,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function Gb(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Kb(e) {
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
var Li = { exports: {} }, Mc;
function Xb() {
  if (Mc) return Li.exports;
  Mc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Li.exports = t(), Li.exports.createColors = t, Li.exports;
}
const Jb = {}, Zb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Jb
}, Symbol.toStringTag, { value: "Module" })), Gt = /* @__PURE__ */ Kb(Zb);
var Js, Rc;
function Ma() {
  if (Rc) return Js;
  Rc = 1;
  let e = /* @__PURE__ */ Xb(), t = Gt;
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
  return Js = r, r.default = r, Js;
}
var _i = {}, Tc;
function Ra() {
  return Tc || (Tc = 1, _i.isClean = Symbol("isClean"), _i.my = Symbol("my")), _i;
}
var Zs, Ac;
function jd() {
  if (Ac) return Zs;
  Ac = 1;
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
  return Zs = r, r.default = r, Zs;
}
var Qs, Lc;
function os() {
  if (Lc) return Qs;
  Lc = 1;
  let e = jd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Qs = t, t.default = t, Qs;
}
var eo, _c;
function as() {
  if (_c) return eo;
  _c = 1;
  let { isClean: e, my: t } = Ra(), r = Ma(), n = jd(), i = os();
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
  return eo = a, a.default = a, eo;
}
var to, Ic;
function ls() {
  if (Ic) return to;
  Ic = 1;
  let e = as();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return to = t, t.default = t, to;
}
var ro, Oc;
function Qb() {
  if (Oc) return ro;
  Oc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return ro = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, ro;
}
var no, Nc;
function Yd() {
  if (Nc) return no;
  Nc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Gt, { existsSync: r, readFileSync: n } = Gt, { dirname: i, join: s } = Gt;
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
  return no = c, c.default = c, no;
}
var io, Pc;
function cs() {
  if (Pc) return io;
  Pc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Gt, { fileURLToPath: r, pathToFileURL: n } = Gt, { isAbsolute: i, resolve: s } = Gt, { nanoid: a } = /* @__PURE__ */ Qb(), c = Gt, l = Ma(), p = Yd(), o = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let M = new p(this.css, y);
        if (M.text) {
          this.map = M;
          let v = M.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, v = {}) {
      let k, L, S;
      if (y && typeof y == "object") {
        let R = y, I = M;
        if (typeof R.offset == "number") {
          let F = this.fromOffset(R.offset);
          y = F.line, M = F.col;
        } else
          y = R.line, M = R.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          L = F.line, S = F.col;
        } else
          L = I.line, S = I.column;
      } else if (!M) {
        let R = this.fromOffset(y);
        y = R.line, M = R.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        v.plugin
      ) : k = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        v.plugin
      ), k.input = { column: M, endColumn: S, endLine: L, line: y, source: this.css }, this.file && (n && (k.input.url = n(this.file).toString()), k.input.file = this.file), k;
    }
    fromOffset(f) {
      let y, M;
      if (this[o])
        M = this[o];
      else {
        let k = this.css.split(`
`);
        M = new Array(k.length);
        let L = 0;
        for (let S = 0, x = k.length; S < x; S++)
          M[S] = L, L += k[S].length + 1;
        this[o] = M;
      }
      y = M[M.length - 1];
      let v = 0;
      if (f >= y)
        v = M.length - 1;
      else {
        let k = M.length - 2, L;
        for (; v < k; )
          if (L = v + (k - v >> 1), f < M[L])
            k = L - 1;
          else if (f >= M[L + 1])
            v = L + 1;
          else {
            v = L;
            break;
          }
      }
      return {
        col: f - M[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, v) {
      if (!this.map) return !1;
      let k = this.map.consumer(), L = k.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = k.originalPositionFor({ column: v, line: M }));
      let x;
      i(L.source) ? x = n(L.source) : x = new URL(
        L.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: L.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: L.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          R.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = k.sourceContentFor(L.source);
      return I && (R.source = I), R;
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
  return io = u, u.default = u, c && c.registerInput && c.registerInput(u), io;
}
var so, zc;
function Vd() {
  if (zc) return so;
  zc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Gt, { dirname: r, relative: n, resolve: i, sep: s } = Gt, { pathToFileURL: a } = Gt, c = cs(), l = !!(e && t), p = !!(r && i && n && s);
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
      this.stringify(this.root, (v, k, L) => {
        if (this.css += v, k && L !== "end" && (f.generated.line = d, f.generated.column = u - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (d += y.length, M = v.lastIndexOf(`
`), u = v.length - M) : u += v.length, k && L !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
  return so = o, so;
}
var oo, $c;
function us() {
  if ($c) return oo;
  $c = 1;
  let e = as();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return oo = t, t.default = t, oo;
}
var ao, Dc;
function rn() {
  if (Dc) return ao;
  Dc = 1;
  let { isClean: e, my: t } = Ra(), r = ls(), n = us(), i = as(), s, a, c, l;
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
            ...f.map((y) => typeof y == "function" ? (M, v) => y(M.toProxy(), v) : y)
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
      for (let v of y) this.proxyOf.nodes.splice(f + 1, 0, v);
      let M;
      for (let v in this.indexes)
        M = this.indexes[v], f < M && (this.indexes[v] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, M = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let k of M) this.proxyOf.nodes.splice(f, 0, k);
      let v;
      for (let k in this.indexes)
        v = this.indexes[k], f <= v && (this.indexes[k] = v + M.length);
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
  }, ao = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, ao;
}
var lo, Fc;
function Ta() {
  if (Fc) return lo;
  Fc = 1;
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
  }, lo = n, n.default = n, lo;
}
var co, Uc;
function Gd() {
  if (Uc) return co;
  Uc = 1;
  let e = {};
  return co = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, co;
}
var uo, Bc;
function Kd() {
  if (Bc) return uo;
  Bc = 1;
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
  return uo = e, e.default = e, uo;
}
var po, qc;
function Aa() {
  if (qc) return po;
  qc = 1;
  let e = Kd();
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
  return po = t, t.default = t, po;
}
var ho, Wc;
function ek() {
  if (Wc) return ho;
  Wc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, M = 58, v = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return ho = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, W, O, Ue, Xe, me, pe, _e, We, Ie, we, Ke = z.length, P = 0, X = [], se = [];
    function re() {
      return P;
    }
    function fe(ce) {
      throw I.error("Unclosed " + ce, P);
    }
    function Re() {
      return se.length === 0 && P >= Ke;
    }
    function je(ce) {
      if (se.length) return se.pop();
      if (P >= Ke) return;
      let ye = ce ? ce.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          O = P;
          do
            O += 1, W = z.charCodeAt(O);
          while (W === s || W === i || W === c || W === l || W === a);
          we = ["space", z.slice(P, O)], P = O - 1;
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
          if (We = X.length ? X.pop()[1] : "", Ie = z.charCodeAt(P + 1), We === "url" && Ie !== e && Ie !== t && Ie !== s && Ie !== i && Ie !== c && Ie !== a && Ie !== l) {
            O = P;
            do {
              if (pe = !1, O = z.indexOf(")", O + 1), O === -1)
                if (Q || ye) {
                  O = P;
                  break;
                } else
                  fe("bracket");
              for (_e = O; z.charCodeAt(_e - 1) === r; )
                _e -= 1, pe = !pe;
            } while (pe);
            we = ["brackets", z.slice(P, O + 1), P, O], P = O;
          } else
            O = z.indexOf(")", P + 1), Xe = z.slice(P, O + 1), O === -1 || S.test(Xe) ? we = ["(", "(", P] : (we = ["brackets", Xe, P, O], P = O);
          break;
        }
        case e:
        case t: {
          Ue = W === e ? "'" : '"', O = P;
          do {
            if (pe = !1, O = z.indexOf(Ue, O + 1), O === -1)
              if (Q || ye) {
                O = P + 1;
                break;
              } else
                fe("string");
            for (_e = O; z.charCodeAt(_e - 1) === r; )
              _e -= 1, pe = !pe;
          } while (pe);
          we = ["string", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case v: {
          k.lastIndex = P + 1, k.test(z), k.lastIndex === 0 ? O = z.length - 1 : O = k.lastIndex - 2, we = ["at-word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case r: {
          for (O = P, me = !0; z.charCodeAt(O + 1) === r; )
            O += 1, me = !me;
          if (W = z.charCodeAt(O + 1), me && W !== n && W !== s && W !== i && W !== c && W !== l && W !== a && (O += 1, x.test(z.charAt(O)))) {
            for (; x.test(z.charAt(O + 1)); )
              O += 1;
            z.charCodeAt(O + 1) === s && (O += 1);
          }
          we = ["word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (O = z.indexOf("*/", P + 2) + 1, O === 0 && (Q || ye ? O = z.length : fe("comment")), we = ["comment", z.slice(P, O + 1), P, O], P = O) : (L.lastIndex = P + 1, L.test(z), L.lastIndex === 0 ? O = z.length - 1 : O = L.lastIndex - 2, we = ["word", z.slice(P, O + 1), P, O], X.push(we), P = O);
          break;
        }
      }
      return P++, we;
    }
    function gt(ce) {
      se.push(ce);
    }
    return {
      back: gt,
      endOfFile: Re,
      nextToken: je,
      position: re
    };
  }, ho;
}
var fo, Hc;
function La() {
  if (Hc) return fo;
  Hc = 1;
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
  return fo = t, t.default = t, e.registerAtRule(t), fo;
}
var mo, jc;
function ai() {
  if (jc) return mo;
  jc = 1;
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
  }, mo = n, n.default = n, e.registerRoot(n), mo;
}
var go, Yc;
function Xd() {
  if (Yc) return go;
  Yc = 1;
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
  return go = e, e.default = e, go;
}
var yo, Vc;
function _a() {
  if (Vc) return yo;
  Vc = 1;
  let e = rn(), t = Xd();
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
  return yo = r, r.default = r, e.registerRule(r), yo;
}
var bo, Gc;
function tk() {
  if (Gc) return bo;
  Gc = 1;
  let e = ls(), t = ek(), r = us(), n = La(), i = ai(), s = _a();
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
      let d, u, m, f = !1, y = !1, M = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), d = o[0], d === "(" || d === "[" ? v.push(d === "(" ? ")" : "]") : d === "{" && v.length > 0 ? v.push("}") : d === v[v.length - 1] && v.pop(), v.length === 0)
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
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
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
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let k = this.stringFrom(o, v);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (d.raws.important = k);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let k = o.slice(0), L = "";
          for (let S = v; S > 0; S--) {
            let x = k[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = k.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = L, o = k);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (d.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(d, "value", f.concat(o), h), d.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, d = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), M = [], v = o;
      for (; v; ) {
        if (d = v[0], M.push(v), d === "(" || d === "[")
          m || (m = v), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = v), f.push("}");
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
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; M.length && (v = M[M.length - 1][0], !(v !== "space" && v !== "comment")); )
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
      let m, f, y = d.length, M = "", v = !0, k, L;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? v = !1 : f === "comment" ? (L = d[S - 1] ? d[S - 1][0] : "empty", k = d[S + 1] ? d[S + 1][0] : "empty", !a[L] && !a[k] ? M.slice(-1) === "," ? v = !1 : M += m[1] : v = !1) : M += m[1];
      if (!v) {
        let S = d.reduce((x, R) => x + R[1], "");
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
  return bo = l, bo;
}
var ko, Kc;
function Ia() {
  if (Kc) return ko;
  Kc = 1;
  let e = rn(), t = tk(), r = cs();
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
  return ko = n, n.default = n, e.registerParse(n), ko;
}
var vo, Xc;
function Jd() {
  if (Xc) return vo;
  Xc = 1;
  let { isClean: e, my: t } = Ra(), r = Vd(), n = os(), i = rn(), s = Ta(), a = Gd(), c = Aa(), l = Ia(), p = ai();
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
  let v = {};
  class k {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = M(x);
      else if (x instanceof k || x instanceof c)
        I = M(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
      else {
        let F = l;
        R.syntax && (F = R.syntax.parse), R.parser && (F = R.parser), F.parse && (F = F.parse);
        try {
          I = F(x, R);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(S, I, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
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
      let R = this.result.lastPlugin;
      try {
        if (x && x.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = R.postcssPlugin, S.setMessage();
        else if (R.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = R.postcssPlugin, F = R.postcssVersion, z = this.result.processor.version, Q = F.split("."), W = z.split(".");
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
      let S = (x, R, I) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([x, I]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let R in x) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[R])
              if (typeof x[R] == "object")
                for (let I in x[R])
                  I === "*" ? S(x, R, x[R][I]) : S(
                    x,
                    R + "-" + I.toLowerCase(),
                    x[R][I]
                  );
              else typeof x[R] == "function" && S(x, R, x[R]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], R = this.runOnRoot(x);
        if (m(R))
          try {
            await R;
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
            let R = this.visitTick(x);
            if (m(R))
              try {
                await R;
              } catch (I) {
                let F = x[x.length - 1].node;
                throw this.handleError(I, F);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let I = S.nodes.map(
                  (F) => R(F, this.helpers)
                );
                await Promise.all(I);
              } else
                await R(S, this.helpers);
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
              (R) => S.Once(R, this.helpers)
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
      for (let [R, I] of S) {
        this.result.lastPlugin = R;
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
      let x = S[S.length - 1], { node: R, visitors: I } = x;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        S.pop();
        return;
      }
      if (I.length > 0 && x.visitorIndex < I.length) {
        let [z, Q] = I[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === I.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return Q(R.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, R);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, Q;
        for (; Q = R.nodes[R.indexes[z]]; )
          if (R.indexes[z] += 1, !Q[e]) {
            Q[e] = !0, S.push(y(Q));
            return;
          }
        x.iterator = 0, delete R.indexes[z];
      }
      let F = x.events;
      for (; x.eventIndex < F.length; ) {
        let z = F[x.eventIndex];
        if (x.eventIndex += 1, z === u) {
          R.nodes && R.nodes.length && (R[e] = !0, x.iterator = R.getIterator());
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
      for (let R of x)
        if (R === u)
          S.nodes && S.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[R];
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
  return k.registerPostcss = (L) => {
    v = L;
  }, vo = k, k.default = k, p.registerLazyResult(k), s.registerLazyResult(k), vo;
}
var wo, Jc;
function rk() {
  if (Jc) return wo;
  Jc = 1;
  let e = Vd(), t = os(), r = Gd(), n = Ia();
  const i = Aa();
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
  return wo = s, s.default = s, wo;
}
var xo, Zc;
function nk() {
  if (Zc) return xo;
  Zc = 1;
  let e = rk(), t = Jd(), r = Ta(), n = ai();
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
  return xo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), xo;
}
var So, Qc;
function ik() {
  if (Qc) return So;
  Qc = 1;
  let e = ls(), t = Yd(), r = us(), n = La(), i = cs(), s = ai(), a = _a();
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
  return So = c, c.default = c, So;
}
var Eo, eu;
function sk() {
  if (eu) return Eo;
  eu = 1;
  let e = Ma(), t = ls(), r = Jd(), n = rn(), i = nk(), s = os(), a = ik(), c = Ta(), l = Kd(), p = us(), o = La(), h = Aa(), d = cs(), u = Ia(), m = Xd(), f = _a(), y = ai(), M = as();
  function v(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return v.plugin = function(L, S) {
    let x = !1;
    function R(...F) {
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
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function(F, z, Q) {
      return v([R(Q)]).process(F, z);
    }, R;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (k) => new p(k), v.atRule = (k) => new o(k), v.decl = (k) => new t(k), v.rule = (k) => new f(k), v.root = (k) => new y(k), v.document = (k) => new c(k), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = p, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = d, v.Rule = f, v.Root = y, v.Node = M, r.registerPostcss(v), Eo = v, v.default = v, Eo;
}
var ok = sk();
const Ve = /* @__PURE__ */ Gb(ok);
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
var ak = Object.defineProperty, lk = (e, t, r) => t in e ? ak(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, $t = (e, t, r) => lk(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function ck(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function uk(e) {
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
var Ii = { exports: {} }, tu;
function dk() {
  if (tu) return Ii.exports;
  tu = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ii.exports = t(), Ii.exports.createColors = t, Ii.exports;
}
const pk = {}, hk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: pk
}, Symbol.toStringTag, { value: "Module" })), Kt = /* @__PURE__ */ uk(hk);
var Co, ru;
function Oa() {
  if (ru) return Co;
  ru = 1;
  let e = /* @__PURE__ */ dk(), t = Kt;
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
  return Co = r, r.default = r, Co;
}
var Oi = {}, nu;
function Na() {
  return nu || (nu = 1, Oi.isClean = Symbol("isClean"), Oi.my = Symbol("my")), Oi;
}
var Mo, iu;
function Zd() {
  if (iu) return Mo;
  iu = 1;
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
  return Mo = r, r.default = r, Mo;
}
var Ro, su;
function ds() {
  if (su) return Ro;
  su = 1;
  let e = Zd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Ro = t, t.default = t, Ro;
}
var To, ou;
function ps() {
  if (ou) return To;
  ou = 1;
  let { isClean: e, my: t } = Na(), r = Oa(), n = Zd(), i = ds();
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
  return To = a, a.default = a, To;
}
var Ao, au;
function hs() {
  if (au) return Ao;
  au = 1;
  let e = ps();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ao = t, t.default = t, Ao;
}
var Lo, lu;
function fk() {
  if (lu) return Lo;
  lu = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Lo = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Lo;
}
var _o, cu;
function Qd() {
  if (cu) return _o;
  cu = 1;
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
  return _o = c, c.default = c, _o;
}
var Io, uu;
function fs() {
  if (uu) return Io;
  uu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { fileURLToPath: r, pathToFileURL: n } = Kt, { isAbsolute: i, resolve: s } = Kt, { nanoid: a } = /* @__PURE__ */ fk(), c = Kt, l = Oa(), p = Qd(), o = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let M = new p(this.css, y);
        if (M.text) {
          this.map = M;
          let v = M.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, v = {}) {
      let k, L, S;
      if (y && typeof y == "object") {
        let R = y, I = M;
        if (typeof R.offset == "number") {
          let F = this.fromOffset(R.offset);
          y = F.line, M = F.col;
        } else
          y = R.line, M = R.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          L = F.line, S = F.col;
        } else
          L = I.line, S = I.column;
      } else if (!M) {
        let R = this.fromOffset(y);
        y = R.line, M = R.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        v.plugin
      ) : k = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        v.plugin
      ), k.input = { column: M, endColumn: S, endLine: L, line: y, source: this.css }, this.file && (n && (k.input.url = n(this.file).toString()), k.input.file = this.file), k;
    }
    fromOffset(f) {
      let y, M;
      if (this[o])
        M = this[o];
      else {
        let k = this.css.split(`
`);
        M = new Array(k.length);
        let L = 0;
        for (let S = 0, x = k.length; S < x; S++)
          M[S] = L, L += k[S].length + 1;
        this[o] = M;
      }
      y = M[M.length - 1];
      let v = 0;
      if (f >= y)
        v = M.length - 1;
      else {
        let k = M.length - 2, L;
        for (; v < k; )
          if (L = v + (k - v >> 1), f < M[L])
            k = L - 1;
          else if (f >= M[L + 1])
            v = L + 1;
          else {
            v = L;
            break;
          }
      }
      return {
        col: f - M[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, v) {
      if (!this.map) return !1;
      let k = this.map.consumer(), L = k.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = k.originalPositionFor({ column: v, line: M }));
      let x;
      i(L.source) ? x = n(L.source) : x = new URL(
        L.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: L.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: L.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          R.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = k.sourceContentFor(L.source);
      return I && (R.source = I), R;
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
  return Io = u, u.default = u, c && c.registerInput && c.registerInput(u), Io;
}
var Oo, du;
function ep() {
  if (du) return Oo;
  du = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { dirname: r, relative: n, resolve: i, sep: s } = Kt, { pathToFileURL: a } = Kt, c = fs(), l = !!(e && t), p = !!(r && i && n && s);
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
      this.stringify(this.root, (v, k, L) => {
        if (this.css += v, k && L !== "end" && (f.generated.line = d, f.generated.column = u - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (d += y.length, M = v.lastIndexOf(`
`), u = v.length - M) : u += v.length, k && L !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
  return Oo = o, Oo;
}
var No, pu;
function ms() {
  if (pu) return No;
  pu = 1;
  let e = ps();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return No = t, t.default = t, No;
}
var Po, hu;
function nn() {
  if (hu) return Po;
  hu = 1;
  let { isClean: e, my: t } = Na(), r = hs(), n = ms(), i = ps(), s, a, c, l;
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
            ...f.map((y) => typeof y == "function" ? (M, v) => y(M.toProxy(), v) : y)
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
      for (let v of y) this.proxyOf.nodes.splice(f + 1, 0, v);
      let M;
      for (let v in this.indexes)
        M = this.indexes[v], f < M && (this.indexes[v] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, M = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let k of M) this.proxyOf.nodes.splice(f, 0, k);
      let v;
      for (let k in this.indexes)
        v = this.indexes[k], f <= v && (this.indexes[k] = v + M.length);
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
  }, Po = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, a.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Po;
}
var zo, fu;
function Pa() {
  if (fu) return zo;
  fu = 1;
  let e = nn(), t, r;
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
  }, zo = n, n.default = n, zo;
}
var $o, mu;
function tp() {
  if (mu) return $o;
  mu = 1;
  let e = {};
  return $o = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, $o;
}
var Do, gu;
function rp() {
  if (gu) return Do;
  gu = 1;
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
  return Do = e, e.default = e, Do;
}
var Fo, yu;
function za() {
  if (yu) return Fo;
  yu = 1;
  let e = rp();
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
  return Fo = t, t.default = t, Fo;
}
var Uo, bu;
function mk() {
  if (bu) return Uo;
  bu = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, M = 58, v = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return Uo = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, W, O, Ue, Xe, me, pe, _e, We, Ie, we, Ke = z.length, P = 0, X = [], se = [];
    function re() {
      return P;
    }
    function fe(ce) {
      throw I.error("Unclosed " + ce, P);
    }
    function Re() {
      return se.length === 0 && P >= Ke;
    }
    function je(ce) {
      if (se.length) return se.pop();
      if (P >= Ke) return;
      let ye = ce ? ce.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          O = P;
          do
            O += 1, W = z.charCodeAt(O);
          while (W === s || W === i || W === c || W === l || W === a);
          we = ["space", z.slice(P, O)], P = O - 1;
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
          if (We = X.length ? X.pop()[1] : "", Ie = z.charCodeAt(P + 1), We === "url" && Ie !== e && Ie !== t && Ie !== s && Ie !== i && Ie !== c && Ie !== a && Ie !== l) {
            O = P;
            do {
              if (pe = !1, O = z.indexOf(")", O + 1), O === -1)
                if (Q || ye) {
                  O = P;
                  break;
                } else
                  fe("bracket");
              for (_e = O; z.charCodeAt(_e - 1) === r; )
                _e -= 1, pe = !pe;
            } while (pe);
            we = ["brackets", z.slice(P, O + 1), P, O], P = O;
          } else
            O = z.indexOf(")", P + 1), Xe = z.slice(P, O + 1), O === -1 || S.test(Xe) ? we = ["(", "(", P] : (we = ["brackets", Xe, P, O], P = O);
          break;
        }
        case e:
        case t: {
          Ue = W === e ? "'" : '"', O = P;
          do {
            if (pe = !1, O = z.indexOf(Ue, O + 1), O === -1)
              if (Q || ye) {
                O = P + 1;
                break;
              } else
                fe("string");
            for (_e = O; z.charCodeAt(_e - 1) === r; )
              _e -= 1, pe = !pe;
          } while (pe);
          we = ["string", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case v: {
          k.lastIndex = P + 1, k.test(z), k.lastIndex === 0 ? O = z.length - 1 : O = k.lastIndex - 2, we = ["at-word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case r: {
          for (O = P, me = !0; z.charCodeAt(O + 1) === r; )
            O += 1, me = !me;
          if (W = z.charCodeAt(O + 1), me && W !== n && W !== s && W !== i && W !== c && W !== l && W !== a && (O += 1, x.test(z.charAt(O)))) {
            for (; x.test(z.charAt(O + 1)); )
              O += 1;
            z.charCodeAt(O + 1) === s && (O += 1);
          }
          we = ["word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (O = z.indexOf("*/", P + 2) + 1, O === 0 && (Q || ye ? O = z.length : fe("comment")), we = ["comment", z.slice(P, O + 1), P, O], P = O) : (L.lastIndex = P + 1, L.test(z), L.lastIndex === 0 ? O = z.length - 1 : O = L.lastIndex - 2, we = ["word", z.slice(P, O + 1), P, O], X.push(we), P = O);
          break;
        }
      }
      return P++, we;
    }
    function gt(ce) {
      se.push(ce);
    }
    return {
      back: gt,
      endOfFile: Re,
      nextToken: je,
      position: re
    };
  }, Uo;
}
var Bo, ku;
function $a() {
  if (ku) return Bo;
  ku = 1;
  let e = nn();
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
  return Bo = t, t.default = t, e.registerAtRule(t), Bo;
}
var qo, vu;
function li() {
  if (vu) return qo;
  vu = 1;
  let e = nn(), t, r;
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
  }, qo = n, n.default = n, e.registerRoot(n), qo;
}
var Wo, wu;
function np() {
  if (wu) return Wo;
  wu = 1;
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
  return Wo = e, e.default = e, Wo;
}
var Ho, xu;
function Da() {
  if (xu) return Ho;
  xu = 1;
  let e = nn(), t = np();
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
  return Ho = r, r.default = r, e.registerRule(r), Ho;
}
var jo, Su;
function gk() {
  if (Su) return jo;
  Su = 1;
  let e = hs(), t = mk(), r = ms(), n = $a(), i = li(), s = Da();
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
      let d, u, m, f = !1, y = !1, M = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), d = o[0], d === "(" || d === "[" ? v.push(d === "(" ? ")" : "]") : d === "{" && v.length > 0 ? v.push("}") : d === v[v.length - 1] && v.pop(), v.length === 0)
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
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
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
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let k = this.stringFrom(o, v);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (d.raws.important = k);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let k = o.slice(0), L = "";
          for (let S = v; S > 0; S--) {
            let x = k[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = k.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = L, o = k);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (d.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(d, "value", f.concat(o), h), d.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, d = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), M = [], v = o;
      for (; v; ) {
        if (d = v[0], M.push(v), d === "(" || d === "[")
          m || (m = v), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = v), f.push("}");
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
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; M.length && (v = M[M.length - 1][0], !(v !== "space" && v !== "comment")); )
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
      let m, f, y = d.length, M = "", v = !0, k, L;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? v = !1 : f === "comment" ? (L = d[S - 1] ? d[S - 1][0] : "empty", k = d[S + 1] ? d[S + 1][0] : "empty", !a[L] && !a[k] ? M.slice(-1) === "," ? v = !1 : M += m[1] : v = !1) : M += m[1];
      if (!v) {
        let S = d.reduce((x, R) => x + R[1], "");
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
  return jo = l, jo;
}
var Yo, Eu;
function Fa() {
  if (Eu) return Yo;
  Eu = 1;
  let e = nn(), t = gk(), r = fs();
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
  return Yo = n, n.default = n, e.registerParse(n), Yo;
}
var Vo, Cu;
function ip() {
  if (Cu) return Vo;
  Cu = 1;
  let { isClean: e, my: t } = Na(), r = ep(), n = ds(), i = nn(), s = Pa(), a = tp(), c = za(), l = Fa(), p = li();
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
  let v = {};
  class k {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = M(x);
      else if (x instanceof k || x instanceof c)
        I = M(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
      else {
        let F = l;
        R.syntax && (F = R.syntax.parse), R.parser && (F = R.parser), F.parse && (F = F.parse);
        try {
          I = F(x, R);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(S, I, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
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
      let R = this.result.lastPlugin;
      try {
        if (x && x.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = R.postcssPlugin, S.setMessage();
        else if (R.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = R.postcssPlugin, F = R.postcssVersion, z = this.result.processor.version, Q = F.split("."), W = z.split(".");
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
      let S = (x, R, I) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([x, I]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let R in x) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[R])
              if (typeof x[R] == "object")
                for (let I in x[R])
                  I === "*" ? S(x, R, x[R][I]) : S(
                    x,
                    R + "-" + I.toLowerCase(),
                    x[R][I]
                  );
              else typeof x[R] == "function" && S(x, R, x[R]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], R = this.runOnRoot(x);
        if (m(R))
          try {
            await R;
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
            let R = this.visitTick(x);
            if (m(R))
              try {
                await R;
              } catch (I) {
                let F = x[x.length - 1].node;
                throw this.handleError(I, F);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let I = S.nodes.map(
                  (F) => R(F, this.helpers)
                );
                await Promise.all(I);
              } else
                await R(S, this.helpers);
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
              (R) => S.Once(R, this.helpers)
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
      for (let [R, I] of S) {
        this.result.lastPlugin = R;
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
      let x = S[S.length - 1], { node: R, visitors: I } = x;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        S.pop();
        return;
      }
      if (I.length > 0 && x.visitorIndex < I.length) {
        let [z, Q] = I[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === I.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return Q(R.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, R);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, Q;
        for (; Q = R.nodes[R.indexes[z]]; )
          if (R.indexes[z] += 1, !Q[e]) {
            Q[e] = !0, S.push(y(Q));
            return;
          }
        x.iterator = 0, delete R.indexes[z];
      }
      let F = x.events;
      for (; x.eventIndex < F.length; ) {
        let z = F[x.eventIndex];
        if (x.eventIndex += 1, z === u) {
          R.nodes && R.nodes.length && (R[e] = !0, x.iterator = R.getIterator());
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
      for (let R of x)
        if (R === u)
          S.nodes && S.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[R];
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
  return k.registerPostcss = (L) => {
    v = L;
  }, Vo = k, k.default = k, p.registerLazyResult(k), s.registerLazyResult(k), Vo;
}
var Go, Mu;
function yk() {
  if (Mu) return Go;
  Mu = 1;
  let e = ep(), t = ds(), r = tp(), n = Fa();
  const i = za();
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
  return Go = s, s.default = s, Go;
}
var Ko, Ru;
function bk() {
  if (Ru) return Ko;
  Ru = 1;
  let e = yk(), t = ip(), r = Pa(), n = li();
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
  return Ko = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Ko;
}
var Xo, Tu;
function kk() {
  if (Tu) return Xo;
  Tu = 1;
  let e = hs(), t = Qd(), r = ms(), n = $a(), i = fs(), s = li(), a = Da();
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
  return Xo = c, c.default = c, Xo;
}
var Jo, Au;
function vk() {
  if (Au) return Jo;
  Au = 1;
  let e = Oa(), t = hs(), r = ip(), n = nn(), i = bk(), s = ds(), a = kk(), c = Pa(), l = rp(), p = ms(), o = $a(), h = za(), d = fs(), u = Fa(), m = np(), f = Da(), y = li(), M = ps();
  function v(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return v.plugin = function(L, S) {
    let x = !1;
    function R(...F) {
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
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function(F, z, Q) {
      return v([R(Q)]).process(F, z);
    }, R;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (k) => new p(k), v.atRule = (k) => new o(k), v.decl = (k) => new t(k), v.rule = (k) => new f(k), v.root = (k) => new y(k), v.document = (k) => new c(k), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = p, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = d, v.Rule = f, v.Root = y, v.Node = M, r.registerPostcss(v), Jo = v, v.default = v, Jo;
}
var wk = vk();
const Ge = /* @__PURE__ */ ck(wk);
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
class Ua {
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
    if (t instanceof Ua) {
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
const Lu = {
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
}, _u = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ni = {}, sp = {}, xk = () => !!globalThis.Zone;
function Ba(e) {
  if (Ni[e])
    return Ni[e];
  const t = globalThis[e], r = t.prototype, n = e in Lu ? Lu[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in _u ? _u[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !xk())
    return Ni[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), sp[e] = () => c.remove()) : c.remove(), Ni[e] = p;
  } catch {
    return r;
  }
}
const Zo = {};
function mr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Zo[i])
    return Zo[i].call(
      t
    );
  const s = Ba(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Zo[i] = a, a.call(t)) : t[r];
}
const Qo = {};
function op(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Qo[n])
    return Qo[n].bind(
      t
    );
  const s = Ba(e)[r];
  return typeof s != "function" ? t[r] : (Qo[n] = s, s.bind(t));
}
function Sk(e) {
  return mr("Node", e, "ownerDocument");
}
function Ek(e) {
  return mr("Node", e, "childNodes");
}
function Ck(e) {
  return mr("Node", e, "parentNode");
}
function Mk(e) {
  return mr("Node", e, "parentElement");
}
function Rk(e) {
  return mr("Node", e, "textContent");
}
function Tk(e, t) {
  return op("Node", e, "contains")(t);
}
function Ak(e) {
  return op("Node", e, "getRootNode")();
}
function Lk(e) {
  return !e || !("host" in e) ? null : mr("ShadowRoot", e, "host");
}
function _k(e) {
  return e.styleSheets;
}
function Ik(e) {
  return !e || !("shadowRoot" in e) ? null : mr("Element", e, "shadowRoot");
}
function Ok(e, t) {
  return mr("Element", e, "querySelector")(t);
}
function Nk(e, t) {
  return mr("Element", e, "querySelectorAll")(t);
}
function ap() {
  return [
    Ba("MutationObserver").constructor,
    sp.MutationObserver ?? (() => {
    })
  ];
}
let ii = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (ii = () => (/* @__PURE__ */ new Date()).getTime());
function sn(e, t, r) {
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
  ownerDocument: Sk,
  childNodes: Ek,
  parentNode: Ck,
  parentElement: Mk,
  textContent: Rk,
  contains: Tk,
  getRootNode: Ak,
  host: Lk,
  styleSheets: _k,
  shadowRoot: Ik,
  querySelector: Ok,
  querySelectorAll: Nk,
  nowTimestamp: ii,
  mutationObserverCtor: ap,
  patch: sn
};
function xt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const xn = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Iu = {
  map: {},
  getId() {
    return console.error(xn), -1;
  },
  getNode() {
    return console.error(xn), null;
  },
  removeNodeFromMap() {
    console.error(xn);
  },
  has() {
    return console.error(xn), !1;
  },
  reset() {
    console.error(xn);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Iu = new Proxy(Iu, {
  get(e, t, r) {
    return t === "map" && console.error(xn), Reflect.get(e, t, r);
  }
}));
function si(e, t, r = {}) {
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
function gs(e, t, r, n, i = window) {
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
  ), () => gs(e, t, s || {}, !0);
}
function lp(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = ve.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = ve.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function cp() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function up() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function dp(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ve.parentElement(e) : null;
}
function St(e, t, r, n) {
  if (!e)
    return !1;
  const i = dp(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Ji(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Pk(e, t) {
  return t.getId(e) !== -1;
}
function ea(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === ni;
}
function pp(e, t) {
  if (Jn(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ve.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? pp(n, t) : !0;
}
function pa(e) {
  return !!e.changedTouches;
}
function zk(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function hp(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function fp(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ha(e) {
  return e ? e instanceof Ua && "shadowRoot" in e ? !!e.shadowRoot : !!ve.shadowRoot(e) : !1;
}
class $k {
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
function mp(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ve.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ve.host(ve.getRootNode(e)) && (r = ve.host(ve.getRootNode(e))), r;
}
function Dk(e) {
  let t = e, r;
  for (; r = mp(t); )
    t = r;
  return t;
}
function Fk(e) {
  const t = ve.ownerDocument(e);
  if (!t) return !1;
  const r = Dk(e);
  return ve.contains(t, r);
}
function gp(e) {
  const t = ve.ownerDocument(e);
  return t ? ve.contains(t, e) || Fk(e) : !1;
}
var Ae = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ae || {}), Me = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(Me || {}), Rt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Rt || {}), dr = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(dr || {}), zn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(zn || {}), Sn = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Sn || {}), yp = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(yp || {});
function Ou(e) {
  return "__ln" in e;
}
class Uk {
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
    if (t.__ln = r, t.previousSibling && Ou(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Ou(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Nu = (e, t) => `${e}@${t}`;
class Bk {
  constructor() {
    V(this, "frozen", !1), V(this, "locked", !1), V(this, "texts", []), V(this, "attributes", []), V(this, "attributeMap", /* @__PURE__ */ new WeakMap()), V(this, "removes", []), V(this, "mapRemoves", []), V(this, "movedMap", {}), V(this, "addedSet", /* @__PURE__ */ new Set()), V(this, "movedSet", /* @__PURE__ */ new Set()), V(this, "droppedSet", /* @__PURE__ */ new Set()), V(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), V(this, "mutationCb"), V(this, "blockClass"), V(this, "blockSelector"), V(this, "maskTextClass"), V(this, "maskTextSelector"), V(this, "inlineStylesheet"), V(this, "maskInputOptions"), V(this, "maskTextFn"), V(this, "maskInputFn"), V(this, "keepIframeSrcFn"), V(this, "recordCanvas"), V(this, "inlineImages"), V(this, "slimDOMOptions"), V(this, "dataURLOptions"), V(this, "doc"), V(this, "mirror"), V(this, "iframeManager"), V(this, "stylesheetManager"), V(this, "shadowDomManager"), V(this, "canvasManager"), V(this, "processedNodeManager"), V(this, "unattachedDoc"), V(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), V(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Uk(), i = (l) => {
        let p = l, o = ni;
        for (; o === ni; )
          p = p && p.nextSibling, o = p && this.mirror.getId(p);
        return o;
      }, s = (l) => {
        const p = ve.parentNode(l);
        if (!p || !gp(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (o = !0);
        }
        const h = Jn(p) ? this.mirror.getId(mp(l)) : this.mirror.getId(p), d = i(l);
        if (h === -1 || d === -1)
          return n.addNode(l);
        const u = Cn(l, {
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
            hp(m, this.mirror) && this.iframeManager.addIframe(m), fp(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ha(l) && this.shadowDomManager.addShadowRoot(ve.shadowRoot(l), this.doc);
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
        Pu(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(ve.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !zu(this.droppedSet, l) && !Pu(this.removesSubTreeCache, l, this.mirror) || zu(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
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
      r.attributes.value = Gi({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Ki(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), V(this, "processMutation", (t) => {
      if (!ea(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ve.textContent(t.target);
            !St(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Wd(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, dp(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Ki(r);
              i = Gi({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (St(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !qd(r.tagName, n))
              if (s.attributes[n] = Bd(
                this.doc,
                en(r.tagName),
                en(n),
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
            if (St(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Jn(t.target) ? this.mirror.getId(ve.host(t.target)) : this.mirror.getId(t.target);
              St(t.target, this.blockClass, this.blockSelector, !1) || ea(r, this.mirror, this.slimDOMOptions) || !Pk(r, this.mirror) || (this.addedSet.has(r) ? (fa(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || pp(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Nu(n, i)] ? fa(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Jn(t.target) && Zn(t.target) ? !0 : void 0
              }), qk(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), V(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (ea(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Nu(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        St(t, this.blockClass, this.blockSelector, !1) || (ve.childNodes(t).forEach((n) => this.genAdds(n)), ha(t) && ve.childNodes(ve.shadowRoot(t)).forEach((n) => {
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
function fa(e, t) {
  e.delete(t), ve.childNodes(t).forEach((r) => fa(e, r));
}
function qk(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ve.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Pu(e, t, r) {
  return e.size === 0 ? !1 : Wk(e, t);
}
function Wk(e, t, r) {
  const n = ve.parentNode(t);
  return n ? e.has(n) : !1;
}
function zu(e, t) {
  return e.size === 0 ? !1 : bp(e, t);
}
function bp(e, t) {
  const r = ve.parentNode(t);
  return r ? e.has(r) ? !0 : bp(e, r) : !1;
}
let Qn;
function Hk(e) {
  Qn = e;
}
function jk() {
  Qn = void 0;
}
const Te = (e) => Qn ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Qn && Qn(n) === !0)
      return;
    throw n;
  }
} : e, Xr = [];
function ci(e) {
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
function kp(e, t) {
  const r = new Bk();
  Xr.push(r), r.init(e);
  const [n, i] = ap(), s = new n(
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
function Yk({
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
  const l = si(
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
    si(
      Te((h) => {
        const d = ci(h), { clientX: u, clientY: m } = pa(h) ? h.changedTouches[0] : h;
        c || (c = ii()), a.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: ii() - c
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
    xt("mousemove", p, r),
    xt("touchmove", p, r),
    xt("drag", p, r)
  ];
  return Te(() => {
    o.forEach((h) => h());
  });
}
function Vk({
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
    const d = ci(h);
    if (St(d, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = dr.Mouse;
          break;
        case "touch":
          u = dr.Touch;
          break;
        case "pen":
          u = dr.Pen;
          break;
      }
      u === dr.Touch ? Rt[o] === Rt.MouseDown ? m = "TouchStart" : Rt[o] === Rt.MouseUp && (m = "TouchEnd") : dr.Pen;
    } else pa(h) && (u = dr.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === dr.Touch || m.startsWith("Mouse") && u === dr.Mouse) && (u = null)) : Rt[o] === Rt.Click && (u = l, l = null);
    const f = pa(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(d), { clientX: M, clientY: v } = f;
    Te(e)({
      type: Rt[m],
      id: y,
      x: M,
      y: v,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Rt).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = en(o);
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
    c.push(xt(h, d, t));
  }), Te(() => {
    c.forEach((o) => o());
  });
}
function vp({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Te(
    si(
      Te((c) => {
        const l = ci(c);
        if (!l || St(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const o = lp(t.defaultView);
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
  return xt("scroll", a, t);
}
function Gk({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Te(
    si(
      Te(() => {
        const s = cp(), a = up();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return xt("resize", i, t);
}
const Kk = ["INPUT", "TEXTAREA", "SELECT"], $u = /* @__PURE__ */ new WeakMap();
function Xk({
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
  function h(v) {
    let k = ci(v);
    const L = v.isTrusted, S = k && k.tagName;
    if (k && S === "OPTION" && (k = ve.parentElement(k)), !k || !S || Kk.indexOf(S) < 0 || St(k, n, i, !0) || k.classList.contains(s) || a && k.matches(a))
      return;
    let x = k.value, R = !1;
    const I = Ki(k) || "";
    I === "radio" || I === "checkbox" ? R = k.checked : (c[S.toLowerCase()] || c[I]) && (x = Gi({
      element: k,
      maskInputOptions: c,
      tagName: S,
      type: I,
      value: x,
      maskInputFn: l
    })), d(
      k,
      o ? { text: x, isChecked: R, userTriggered: L } : { text: x, isChecked: R }
    );
    const F = k.name;
    I === "radio" && F && R && t.querySelectorAll(`input[type="radio"][name="${F}"]`).forEach((z) => {
      if (z !== k) {
        const Q = z.value;
        d(
          z,
          o ? { text: Q, isChecked: !R, userTriggered: !1 } : { text: Q, isChecked: !R }
        );
      }
    });
  }
  function d(v, k) {
    const L = $u.get(v);
    if (!L || L.text !== k.text || L.isChecked !== k.isChecked) {
      $u.set(v, k);
      const S = r.getId(v);
      Te(e)({
        ...k,
        id: S
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => xt(v, Te(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((v) => v());
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
      (v) => gs(
        v[0],
        v[1],
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
    m.forEach((v) => v());
  });
}
function Zi(e) {
  const t = [];
  function r(n, i) {
    if (Pi("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Pi("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Pi("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Pi("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Er(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Jk({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Te(
      (o, h, d) => {
        const [u, m] = d, { id: f, styleId: y } = Er(
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
        const [u] = d, { id: m, styleId: f } = Er(
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
        const [u] = d, { id: m, styleId: f } = Er(
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
        const [u] = d, { id: m, styleId: f } = Er(
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
  zi("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (zi("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), zi("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), zi("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
            const [f, y] = m, { id: M, styleId: v } = Er(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (M && M !== -1 || v && v !== -1) && e({
              id: M,
              styleId: v,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Zi(u),
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
            const [f] = m, { id: y, styleId: M } = Er(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || M && M !== -1) && e({
              id: y,
              styleId: M,
              removes: [
                { index: [...Zi(u), f] }
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
function wp({
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
function Zk({
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
        const { id: m, styleId: f } = Er(
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
          index: Zi(l.parentRule)
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
        const { id: d, styleId: u } = Er(
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
          index: Zi(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), Te(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Qk({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Te(
    (l) => si(
      Te((p) => {
        const o = ci(p);
        if (!o || St(o, t, r, !0))
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
    xt("play", a(Sn.Play), s),
    xt("pause", a(Sn.Pause), s),
    xt("seeked", a(Sn.Seeked), s),
    xt("volumechange", a(Sn.VolumeChange), s),
    xt("ratechange", a(Sn.RateChange), s)
  ];
  return Te(() => {
    c.forEach((l) => l());
  });
}
function ev({ fontCb: e, doc: t }) {
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
  const a = sn(
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
function tv(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Te(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const p = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const d = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: y } = d;
      St(u, n, i, !0) || St(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: p });
  });
  return c(), xt("selectionchange", c);
}
function rv({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : sn(
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
function nv(e, t) {
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
function iv(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  nv(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = kp(e, e.doc));
  const s = Yk(e), a = Vk(e), c = vp(e), l = Gk(e, {
    win: r
  }), p = Xk(e), o = Qk(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Jk(e, { win: r }), d = wp(e, e.doc), u = Zk(e, {
    win: r
  }), e.collectFonts && (m = ev(e)));
  const f = tv(e), y = rv(e), M = [];
  for (const v of e.plugins)
    M.push(
      v.observer(v.callback, r, v.options)
    );
  return Te(() => {
    Xr.forEach((v) => v.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), p(), o(), h(), d(), u(), m(), f(), y(), M.forEach((v) => v());
  });
}
function Pi(e) {
  return typeof window[e] < "u";
}
function zi(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Du {
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
class sv {
  constructor(t) {
    V(this, "iframes", /* @__PURE__ */ new WeakMap()), V(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), V(this, "crossOriginIframeMirror", new Du(Ud)), V(this, "crossOriginIframeStyleMirror"), V(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), V(this, "mirror"), V(this, "mutationCb"), V(this, "wrappedEmit"), V(this, "loadListener"), V(this, "stylesheetManager"), V(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Du(
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
    t.type !== yp.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class ov {
  constructor(t) {
    V(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), V(this, "mutationCb"), V(this, "scrollCb"), V(this, "bypassOptions"), V(this, "mirror"), V(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Zn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = kp(
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
      vp({
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
        wp(
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
      sn(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = ve.shadowRoot(this);
            return c && gp(this) && n.addShadowRoot(c, r), a;
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
var Mn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", av = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var $i = 0; $i < Mn.length; $i++)
  av[Mn.charCodeAt($i)] = $i;
var lv = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Mn[t[r] >> 2], i += Mn[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Mn[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Mn[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Fu = /* @__PURE__ */ new Map();
function cv(e, t) {
  let r = Fu.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Fu.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const xp = (e, t, r) => {
  if (!e || !(Ep(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = cv(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Bi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Bi(n, t, r));
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
    const n = e.constructor.name, i = lv(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Bi(e.buffer, t, r),
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
          args: [Bi(e.data, t, r), e.width, e.height]
        };
      if (Ep(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = xp(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const Sp = (e, t, r) => e.map((n) => Bi(n, t, r)), Ep = (e, t) => !![
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
function uv(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = sn(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...p) {
            return St(this.canvas, r, n, !0) || setTimeout(() => {
              const o = Sp(p, t, this);
              e(this.canvas, {
                type: zn["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = gs(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: zn["2D"],
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
function dv(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Uu(e, t, r, n) {
  const i = [];
  try {
    const s = sn(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!St(this, t, r, !0)) {
            const p = dv(c);
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
function Bu(e, t, r, n, i, s) {
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
        const p = sn(
          e,
          l,
          function(o) {
            return function(...h) {
              const d = o.apply(this, h);
              if (xp(d, s, this), "tagName" in this.canvas && !St(this.canvas, n, i, !0)) {
                const u = Sp(h, s, this), m = {
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
        const p = gs(e, l, {
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
function pv(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Bu(
      t.WebGLRenderingContext.prototype,
      zn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Bu(
      t.WebGL2RenderingContext.prototype,
      zn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const Cp = `(function() {
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
`, qu = typeof self < "u" && self.Blob && new Blob([Cp], { type: "text/javascript;charset=utf-8" });
function hv(e) {
  let t;
  try {
    if (t = qu && (self.URL || self.webkitURL).createObjectURL(qu), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Cp),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class fv {
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
    const a = Uu(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new hv();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: M, width: v, height: k } = m.data;
      this.mutationCb({
        id: f,
        type: zn["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, v, k]
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
        St(f, n, i, !0) || m.push(f);
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
          const k = f.getContext(f.__context);
          ((y = k == null ? void 0 : k.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && k.clear(k.COLOR_BUFFER_BIT);
        }
        const v = await createImageBitmap(f);
        l.postMessage(
          {
            id: M,
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
    const i = Uu(
      t,
      r,
      n,
      !1
    ), s = uv(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = pv(
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
class mv {
  constructor(t) {
    V(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), V(this, "mutationCb"), V(this, "adoptedStyleSheetCb"), V(this, "styleMirror", new $k()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: $d(c, s.href),
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
class gv {
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
let Qe, qi, ta, Qi = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((kc = e.contentWindow) == null ? void 0 : kc.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const jt = Sb();
function Ir(e = {}) {
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
    sampling: v = {},
    dataURLOptions: k = {},
    mousemoveWait: L,
    recordDOM: S = !0,
    recordCanvas: x = !1,
    recordCrossOriginIframes: R = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: F = !1,
    collectFonts: z = !1,
    inlineImages: Q = !1,
    plugins: W,
    keepIframeSrcFn: O = () => !1,
    ignoreCSSAttributes: Ue = /* @__PURE__ */ new Set([]),
    errorHandler: Xe
  } = e;
  Hk(Xe);
  const me = R ? window.parent === window : !0;
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
  L !== void 0 && v.mousemove === void 0 && (v.mousemove = L), jt.reset();
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
  } : d !== void 0 ? d : { password: !0 }, We = Hd(u);
  zk();
  let Ie, we = 0;
  const Ke = (ce) => {
    for (const ye of W || [])
      ye.eventProcessor && (ce = ye.eventProcessor(ce));
    return M && // Disable packing events which will be emitted to parent frames.
    !pe && (ce = M(ce)), ce;
  };
  Qe = (ce, ye) => {
    var Ce;
    const xe = ce;
    if (xe.timestamp = ii(), (Ce = Xr[0]) != null && Ce.isFrozen() && xe.type !== Ae.FullSnapshot && !(xe.type === Ae.IncrementalSnapshot && xe.data.source === Me.Mutation) && Xr.forEach((de) => de.unfreeze()), me)
      t == null || t(Ke(xe), ye);
    else if (pe) {
      const de = {
        type: "rrweb",
        event: Ke(xe),
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
      const de = n && we >= n, ae = r && xe.timestamp - Ie.timestamp > r;
      (de || ae) && qi(!0);
    }
  };
  const P = (ce) => {
    Qe({
      type: Ae.IncrementalSnapshot,
      data: {
        source: Me.Mutation,
        ...ce
      }
    });
  }, X = (ce) => Qe({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.Scroll,
      ...ce
    }
  }), se = (ce) => Qe({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.CanvasMutation,
      ...ce
    }
  }), re = (ce) => Qe({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Me.AdoptedStyleSheet,
      ...ce
    }
  }), fe = new mv({
    mutationCb: P,
    adoptedStyleSheetCb: re
  }), Re = new sv({
    mirror: jt,
    mutationCb: P,
    stylesheetManager: fe,
    recordCrossOriginIframes: R,
    wrappedEmit: Qe
  });
  for (const ce of W || [])
    ce.getMirror && ce.getMirror({
      nodeMirror: jt,
      crossOriginIframeMirror: Re.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Re.crossOriginIframeStyleMirror
    });
  const je = new gv();
  ta = new fv({
    recordCanvas: x,
    mutationCb: se,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: jt,
    sampling: v.canvas,
    dataURLOptions: k
  });
  const gt = new ov({
    mutationCb: P,
    scrollCb: X,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskInputOptions: _e,
      dataURLOptions: k,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: x,
      inlineImages: Q,
      sampling: v,
      slimDOMOptions: We,
      iframeManager: Re,
      stylesheetManager: fe,
      canvasManager: ta,
      keepIframeSrcFn: O,
      processedNodeManager: je
    },
    mirror: jt
  });
  qi = (ce = !1) => {
    if (!S)
      return;
    Qe(
      {
        type: Ae.Meta,
        data: {
          href: window.location.href,
          width: up(),
          height: cp()
        }
      },
      ce
    ), fe.reset(), gt.init(), Xr.forEach((Ce) => Ce.lock());
    const ye = Vb(document, {
      mirror: jt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskAllInputs: _e,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: We,
      dataURLOptions: k,
      recordCanvas: x,
      inlineImages: Q,
      onSerialize: (Ce) => {
        hp(Ce, jt) && Re.addIframe(Ce), fp(Ce, jt) && fe.trackLinkElement(Ce), ha(Ce) && gt.addShadowRoot(ve.shadowRoot(Ce), document);
      },
      onIframeLoad: (Ce, xe) => {
        Re.attachIframe(Ce, xe), gt.observeAttachShadow(Ce);
      },
      onStylesheetLoad: (Ce, xe) => {
        fe.attachLinkElement(Ce, xe);
      },
      keepIframeSrcFn: O
    });
    if (!ye)
      return console.warn("Failed to snapshot the document");
    Qe(
      {
        type: Ae.FullSnapshot,
        data: {
          node: ye,
          initialOffset: lp(window)
        }
      },
      ce
    ), Xr.forEach((Ce) => Ce.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && fe.adoptStyleSheets(
      document.adoptedStyleSheets,
      jt.getId(document)
    );
  };
  try {
    const ce = [], ye = (xe) => {
      var de;
      return Te(iv)(
        {
          mutationCb: P,
          mousemoveCb: (ae, be) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: be,
              positions: ae
            }
          }),
          mouseInteractionCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.MouseInteraction,
              ...ae
            }
          }),
          scrollCb: X,
          viewportResizeCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.ViewportResize,
              ...ae
            }
          }),
          inputCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.Input,
              ...ae
            }
          }),
          mediaInteractionCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.MediaInteraction,
              ...ae
            }
          }),
          styleSheetRuleCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.StyleSheetRule,
              ...ae
            }
          }),
          styleDeclarationCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.StyleDeclaration,
              ...ae
            }
          }),
          canvasMutationCb: se,
          fontCb: (ae) => Qe({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Me.Font,
              ...ae
            }
          }),
          selectionCb: (ae) => {
            Qe({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Me.Selection,
                ...ae
              }
            });
          },
          customElementCb: (ae) => {
            Qe({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Me.CustomElement,
                ...ae
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
          sampling: v,
          recordDOM: S,
          recordCanvas: x,
          inlineImages: Q,
          userTriggeredOnInput: F,
          collectFonts: z,
          doc: xe,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: O,
          blockSelector: s,
          slimDOMOptions: We,
          dataURLOptions: k,
          mirror: jt,
          iframeManager: Re,
          stylesheetManager: fe,
          shadowDomManager: gt,
          processedNodeManager: je,
          canvasManager: ta,
          ignoreCSSAttributes: Ue,
          plugins: ((de = W == null ? void 0 : W.filter((ae) => ae.observer)) == null ? void 0 : de.map((ae) => ({
            observer: ae.observer,
            options: ae.options,
            callback: (be) => Qe({
              type: Ae.Plugin,
              data: {
                plugin: ae.name,
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
      qi(), ce.push(ye(document)), Qi = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? Ce() : (ce.push(
      xt("DOMContentLoaded", () => {
        Qe({
          type: Ae.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && Ce();
      })
    ), ce.push(
      xt(
        "load",
        () => {
          Qe({
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
      }), je.destroy(), Qi = !1, jk();
    };
  } catch (ce) {
    console.warn(ce);
  }
}
Ir.addCustomEvent = (e, t) => {
  if (!Qi)
    throw new Error("please add custom event after start recording");
  Qe({
    type: Ae.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Ir.freezePage = () => {
  Xr.forEach((e) => e.freeze());
};
Ir.takeFullSnapshot = (e) => {
  if (!Qi)
    throw new Error("please take full snapshot after start recording");
  qi(e);
};
Ir.mirror = jt;
var Wu;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Wu || (Wu = {}));
const { addCustomEvent: y0 } = Ir, { freezePage: b0 } = Ir, { takeFullSnapshot: k0 } = Ir, Di = 2, ra = 4;
class yv {
  constructor(t) {
    wi(this, "events", []);
    wi(this, "lastMeta", null);
    wi(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === ra && (this.lastMeta = t), t.type === Di && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === Di), n = this.events.some((i) => i.type === ra);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === Di), n = t.some((i) => i.type !== Di && i.type !== ra);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function bv(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new yv({
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
const Mp = "klav-sims-live", Rp = "klav-sims-overlay", Hu = "klav-sims-ext-css";
let Lt = null, Gr = null, Dt = null, Rn = null;
const Ar = /* @__PURE__ */ new Map(), Ut = /* @__PURE__ */ new Map();
let ys = 0, Xt = !1, Jr = null, _n = null, ui = !1, hr = null, qa = 0, Kr = 0, Lr = /* @__PURE__ */ new Set(), wt = null, _r = null, _t = null, nr = [];
const ir = /* @__PURE__ */ new Set();
let In = !1, sr = "", st = null, Zr = null, pr = null, Mr = null, ft = null, Qr = null, Vt = null, Yt = null, rr = null, It = null, Tn = null;
const bs = /* @__PURE__ */ new Set();
function kv(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Wa(e, t) {
  return `${e}::${kv(t.text)}`;
}
const vv = 0.55, wv = 0.8, Ha = [];
function Tp(e) {
  const t = String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), r = /* @__PURE__ */ new Set();
  if (!t) return r;
  const n = `  ${t} `;
  for (let i = 0; i < n.length - 2; i++) r.add(n.slice(i, i + 3));
  return r;
}
function xv(e, t) {
  if (e.size === 0 || t.size === 0) return 0;
  let r = 0;
  for (const n of e) t.has(n) && r++;
  return r / Math.sqrt(e.size * t.size);
}
function Sv(e, t) {
  const r = Tp(t.text);
  return Ha.some((n) => xv(r, n.grams) >= (n.simId === e ? vv : wv));
}
function Ev(e, t) {
  bs.add(Wa(e, t)), Ha.push({ simId: e, grams: Tp(t.text) });
}
function Ap(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Cv = `
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
`, Mv = `
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
function ju(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Rv(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ma() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Tv(e) {
  return new Promise((t) => setTimeout(t, e));
}
function On(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Lp = { HIGH: "h", MED: "m", LOW: "l" }, Yu = { HIGH: 0, MED: 1, LOW: 2 };
function Av(e) {
  if (!e) return !1;
  if (e === Dt || e === Lt || e.id === Rp || e.id === Mp || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Lv(e) {
  const t = [];
  for (const r of [Dt, Lt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function _p(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Ip(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Vu(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function _v(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Iv(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Op(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Av(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Ov(e, t) {
  return Lv(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Op(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function Nv(e, t) {
  const r = _p(t), n = Ip(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Ov(i, s);
  if (!a.length) return null;
  const c = Math.max(1, Vu(n));
  let l = null, p = -1 / 0;
  for (const o of a) {
    const h = Iv(o.getBoundingClientRect()), d = _v(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Vu(h)), m = d / c, f = Math.max(0, (u - d) / u), y = o.tagName.toLowerCase(), M = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, v = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, k = m - f * 0.35 + M - v;
    k > p && (l = o, p = k);
  }
  return l ?? a[0] ?? null;
}
async function Pv(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: ma() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Tv(ma() ? 80 : 520);
}
const zv = /* @__PURE__ */ new Set([
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
function $v(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || zv.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Dv(e) {
  const t = $v(e.text);
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
    if (!Op(a)) continue;
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
async function Fv(e, t = {}) {
  if (e.region) {
    const r = _p(e), n = Ip(e.region, r);
    t.scroll !== !1 && await Pv(n.left + n.width / 2, n.top + n.height / 2);
    const i = Nv(e.region, e);
    if (i) return i;
  }
  return Dv(e);
}
function Uv() {
  if (Lt && Gr) return Gr;
  Lt = document.createElement("div"), Lt.id = Mp, Lt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Gr = Lt.attachShadow({ mode: "open" }), My(Gr);
  const e = document.createElement("style");
  return e.textContent = Cv, Gr.appendChild(e), document.body.appendChild(Lt), Gr;
}
function Np() {
  if (Dt) return Dt;
  if (!document.getElementById(Hu)) {
    const e = document.createElement("style");
    e.id = Hu, e.textContent = Mv, document.head.appendChild(e);
  }
  return Dt = document.createElement("div"), Dt.id = Rp, Dt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Dt), Dt;
}
function Pp(e, t) {
  return Ey({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function zp() {
  Zr && (Zr.textContent = "", [...Lr].slice(0, 3).forEach((e) => {
    const t = Ar.get(e);
    t && Zr.appendChild(Pp(t, 26));
  }));
}
function Bv(e, t = {}) {
  if (!(typeof document > "u")) {
    if (!Lt || !Lt.isConnected) {
      $p(e.map((r) => r.id), e, t);
      return;
    }
    t.onClose && (wt = t.onClose), t.simControls && (_r = t.simControls);
    for (const r of e.slice(0, 8))
      Ar.has(r.id) || Ar.set(r.id, { simId: r.id, accent: r.accent || "#6366f1", initials: r.initials || r.name.slice(0, 2).toUpperCase(), name: r.name, photoUrl: r.photoUrl });
    Lr = new Set(e.slice(0, 8).map((r) => r.id)), zp(), on(), Xt && tn();
  }
}
function es() {
  var e;
  tt(_t), _t = null, ir.clear(), sr = "", (e = ft == null ? void 0 : ft.querySelector(".ksl-sims-btn")) == null || e.setAttribute("aria-expanded", "false");
}
function qv(e) {
  if (_t) {
    es();
    return;
  }
  !ft || !_r || (_t = document.createElement("div"), _t.className = "ksl-simmenu", _t.setAttribute("role", "dialog"), _t.setAttribute("aria-label", "Run or stop Sims"), ft.appendChild(_t), e.setAttribute("aria-expanded", "true"), nr = [], Rr(!0), _r.list().then((t) => {
    nr = t, Rr();
  }).catch((t) => {
    sr = (t == null ? void 0 : t.message) || "Couldn't load your Sims.", Rr();
  }));
}
function Wv(e) {
  const t = document.createElement("div"), r = ir.has(e.id);
  t.className = "ksl-sm-row" + (e.active ? e.running ? " is-running" : "" : " is-off") + (r ? " is-sel" : ""), t.dataset.simId = e.id;
  const n = document.createElement("span");
  n.className = "ksl-sm-av", n.style.background = Hv(e.accent) || "#6366f1", n.textContent = (e.initials || e.name.slice(0, 2)).slice(0, 2).toUpperCase();
  const i = document.createElement("div");
  i.className = "ksl-sm-meta";
  const s = document.createElement("div");
  s.className = "ksl-sm-name", s.textContent = e.name;
  const a = document.createElement("div");
  if (a.className = "ksl-sm-st", a.textContent = e.active ? e.running ? "Running" : "Not running" : "Deactivated", a.dataset.kind = "run", i.append(s, a), !e.active) {
    t.setAttribute("aria-disabled", "true"), t.tabIndex = 0;
    const o = () => {
      sr = `${e.name} is deactivated. Activate this Sim on the Sims tab to run it.`, Rr();
    };
    return t.addEventListener("click", o), t.addEventListener("keydown", (h) => {
      (h.key === " " || h.key === "Enter") && (h.preventDefault(), o());
    }), t.append(n, i), t;
  }
  const c = document.createElement("span");
  c.className = "ksl-sm-chk" + (r ? " on" : ""), c.innerHTML = r ? G("check", { size: 11 }) : "", t.setAttribute("role", "checkbox"), t.setAttribute("aria-checked", String(r)), t.tabIndex = 0;
  const l = () => {
    In || (r ? ir.delete(e.id) : ir.add(e.id), sr = "", Rr());
  };
  t.addEventListener("click", l), t.addEventListener("keydown", (o) => {
    o.target === t && (o.key === " " || o.key === "Enter") && (o.preventDefault(), l());
  });
  const p = document.createElement("button");
  return p.type = "button", p.className = "ksl-sm-act" + (e.running ? " is-stop" : ""), p.dataset.action = e.running ? "stop" : "run", p.disabled = In, p.setAttribute("aria-label", `${e.running ? "Stop" : "Run"} ${e.name}`), p.innerHTML = G(e.running ? "square" : "play", { size: 11 }) + `<span>${e.running ? "Stop" : "Run"}</span>`, p.addEventListener("click", (o) => {
    o.stopPropagation(), ga(e.running ? "stop" : "run", [e.id]);
  }), p.addEventListener("keydown", (o) => o.stopPropagation()), t.append(c, n, i, p), t;
}
function Rr(e = !1) {
  var x;
  const t = _t;
  if (!t) return;
  const r = ((x = t.querySelector(".ksl-sm-list")) == null ? void 0 : x.scrollTop) ?? 0;
  t.textContent = "";
  const n = nr.filter((R) => R.active), i = n.filter((R) => R.running), s = n.filter((R) => !R.running), a = nr.filter((R) => !R.active), c = document.createElement("div");
  c.className = "ksl-sm-head";
  const l = document.createElement("button");
  l.type = "button", l.className = "ksl-sm-back", l.setAttribute("aria-label", "Back to findings"), l.title = "Back to findings", l.innerHTML = G("chevron-left", { size: 16 }), l.addEventListener("click", () => es());
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
    es(), Wi();
  }), d.appendChild(u), wt) {
    const R = document.createElement("button");
    R.type = "button", R.className = "ksl-icon-btn ksl-close-btn ksl-sm-close", R.title = "Close and stop all Sims", R.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), R.innerHTML = G("x", { size: 15 }), R.addEventListener("click", () => {
      try {
        wt == null || wt();
      } catch {
      }
    }), d.appendChild(R);
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
      const O = () => {
        In || (n.forEach((Ue) => F ? ir.delete(Ue.id) : ir.add(Ue.id)), sr = "", Rr());
      };
      z.addEventListener("click", O), z.addEventListener("keydown", (Ue) => {
        (Ue.key === " " || Ue.key === "Enter") && (Ue.preventDefault(), O());
      }), m.appendChild(z);
    }
    const R = (I, F, z) => {
      if (!F.length) return;
      const Q = document.createElement("div");
      if (Q.className = "ksl-sm-group", Q.textContent = `${I} · ${F.length}`, m.appendChild(Q), z) {
        const W = document.createElement("div");
        W.className = "ksl-sm-group-note", W.textContent = z, m.appendChild(W);
      }
      for (const W of F) m.appendChild(Wv(W));
    };
    R("Running", i), R("Not running", s), R("Deactivated", a, "Activate these on the Sims tab to run them here.");
  }
  if (t.appendChild(m), m.scrollTop = r, sr) {
    const R = document.createElement("div");
    R.className = "ksl-sm-note", R.setAttribute("role", "status"), R.textContent = sr, t.appendChild(R);
  }
  const f = n.filter((R) => ir.has(R.id)), y = f.filter((R) => !R.running).map((R) => R.id), M = f.filter((R) => R.running).map((R) => R.id), v = document.createElement("div");
  v.className = "ksl-sm-foot";
  const k = document.createElement("span");
  k.className = "ksl-sm-cnt", k.textContent = f.length ? `${f.length} selected` : "Tick Sims to run or stop several";
  const L = document.createElement("button");
  L.type = "button", L.className = "ksl-sm-bulk", L.dataset.action = "run-selected", L.disabled = In || !y.length, L.innerHTML = G("play", { size: 11 }) + `<span>Run${y.length ? " " + y.length : ""}</span>`, L.addEventListener("click", () => void ga("run", y));
  const S = document.createElement("button");
  S.type = "button", S.className = "ksl-sm-bulk is-stop", S.dataset.action = "stop-selected", S.disabled = In || !M.length, S.innerHTML = G("square", { size: 11 }) + `<span>Stop${M.length ? " " + M.length : ""}</span>`, S.addEventListener("click", () => void ga("stop", M)), v.append(k, L, S), t.appendChild(v);
}
let na = Promise.resolve(), Fi = 0;
async function ga(e, t) {
  if (!_r || !t.length) return;
  const r = _r, n = new Set(t);
  nr = nr.map((s) => s.active && n.has(s.id) ? { ...s, running: e === "run" } : s);
  for (const s of t) ir.delete(s);
  const i = t.length;
  sr = e === "run" ? `${i === 1 ? "Sim is" : `${i} Sims are`} running.` : `${i === 1 ? "Sim" : `${i} Sims`} stopped. Reported issues stay here and in Sim Reports.`, Rr(), Fi++, na = na.then(async () => {
    try {
      const s = await (e === "run" ? r.run(t) : r.stop(t));
      Fi--, Fi || (nr = s);
    } catch (s) {
      Fi--, sr = (s == null ? void 0 : s.message) || "Couldn't update the Sims — please try again.";
      try {
        nr = await r.list();
      } catch {
      }
    }
    _t && _t.isConnected && Rr();
  }), await na;
}
function Hv(e) {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(e || "")) ? String(e) : null;
}
function $p(e, t = [], r = {}) {
  if (typeof document > "u") return;
  ba(), wt = r.onClose ?? null, _r = r.simControls ?? null;
  const n = Uv();
  Np(), Rn = new AbortController();
  const i = e === "all" ? t : t.filter((d) => e.includes(d.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), ba();
    return;
  }
  i.slice(0, 8).forEach((d) => {
    const u = d.accent || "#6366f1", m = d.initials || d.name.slice(0, 2).toUpperCase();
    Ar.set(d.id, { simId: d.id, accent: u, initials: m, name: d.name, photoUrl: d.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), It = document.createElement("div"), It.className = "ksl-sr", It.id = "ksl-announcer", It.setAttribute("aria-live", "polite"), It.setAttribute("aria-atomic", "true"), s.appendChild(It), st = document.createElement("button"), st.type = "button", st.className = "ksl-launcher", st.setAttribute("aria-label", "Open Sims feedback panel"), st.addEventListener("click", () => Vv());
  const a = document.createElement("span");
  a.className = "ksl-pill", Zr = document.createElement("span"), Zr.className = "ksl-pill-avatars", pr = document.createElement("span"), pr.className = "ksl-pill-txt", a.append(Zr, pr), Mr = document.createElement("span"), Mr.className = "ksl-pill-badge", Mr.hidden = !0, st.append(a, Mr);
  const c = document.createElement("div");
  if (c.className = "ksl-launch-group", c.appendChild(st), wt) {
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-stop-all", d.title = "Stop all Sims", d.setAttribute("aria-label", "Stop all Sims"), d.textContent = "Stop", d.addEventListener("click", (u) => {
      u.stopPropagation();
      try {
        wt == null || wt();
      } catch {
      }
    }), c.appendChild(d);
  }
  s.appendChild(c), Lr = new Set(i.slice(0, 8).map((d) => d.id)), zp(), ft = document.createElement("section"), ft.className = "ksl-panel", ft.setAttribute("aria-label", "Sims feedback"), ft.setAttribute("role", "dialog");
  const l = document.createElement("div");
  l.className = "ksl-head";
  const p = document.createElement("div");
  p.className = "ksl-title-row";
  const o = document.createElement("div");
  o.className = "ksl-title", o.textContent = "Sims feedback";
  const h = document.createElement("button");
  if (h.type = "button", h.className = "ksl-icon-btn", h.title = "Minimize", h.setAttribute("aria-label", "Minimize Sims feedback panel"), wt) {
    h.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', h.addEventListener("click", () => Wi());
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-icon-btn ksl-close-btn", d.title = "Close and stop all Sims", d.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), d.innerHTML = G("x", { size: 15 }), d.addEventListener("click", () => {
      try {
        wt == null || wt();
      } catch {
      }
    });
    const u = document.createElement("span");
    if (u.className = "ksl-head-btns", _r) {
      const m = document.createElement("button");
      m.type = "button", m.className = "ksl-sims-btn", m.setAttribute("aria-haspopup", "dialog"), m.setAttribute("aria-expanded", "false"), m.title = "Run or stop Sims", m.innerHTML = G("users", { size: 14 }) + "<span>Sims</span>", m.addEventListener("click", () => qv(m)), u.append(m);
    }
    u.append(h, d), p.append(o, u);
  } else
    h.innerHTML = G("x", { size: 15 }), h.addEventListener("click", () => Wi()), p.append(o, h);
  Qr = document.createElement("div"), Qr.className = "ksl-count", Vt = document.createElement("div"), Vt.className = "ksl-status", Vt.hidden = !0, Vt.setAttribute("role", "status"), Yt = document.createElement("div"), Yt.className = "ksl-chips", l.append(p, Qr, Vt, Yt), rr = document.createElement("div"), rr.className = "ksl-list", rr.setAttribute("role", "list"), ft.append(l, rr), s.appendChild(ft), document.addEventListener("keydown", (d) => {
    if (d.key === "Escape" && _t) {
      es();
      return;
    }
    d.key === "Escape" && Xt && Wi();
  }, { signal: Rn.signal }), Ap(!0), on();
}
function ja(e) {
  ui = e, st == null || st.classList.toggle("is-reviewing", e), on(), Xt && tn();
}
function Ya() {
  const e = Lr.size || Ar.size, t = e === 1 ? "Sim is" : "Sims are";
  switch (hr) {
    case "analysing":
      return `${e === 1 ? "Sim is" : `${e} Sims are`} analysing this page…`;
    case "running":
      return `${t} running on this page…`;
    case "completed": {
      const r = ys - qa;
      return `Sim run completed · ${r ? `${r} new finding${r === 1 ? "" : "s"}` : "no new findings"}`;
    }
    case "failed":
      return "Sim run didn't finish — it will retry on the next change.";
    default:
      return "";
  }
}
function jv(e) {
  e === "analysing" ? (Kr === 0 && (qa = ys), Kr++) : e === "completed" || e === "failed" ? (Kr = Math.max(0, Kr - 1), Kr > 0 && (e = "running")) : e === null && (Kr = 0), hr = e, ja(e === "analysing" || e === "running"), It && e && (It.textContent = Ya());
}
function Yv() {
  if (!Vt || (Vt.hidden = !hr, Vt.className = "ksl-status" + (hr ? ` is-${hr}` : ""), Vt.textContent = "", !hr)) return;
  const e = document.createElement("span");
  e.className = "ksl-status-dot";
  const t = document.createElement("span");
  t.className = "ksl-status-txt", t.textContent = Ya(), Vt.append(e, t);
}
function Vv() {
  !ft || !st || (Xt = !0, ft.classList.add("is-open"), st.hidden = !0, st.parentElement && (st.parentElement.hidden = !0), tn());
}
function Wi() {
  !ft || !st || (Xt = !1, ft.classList.remove("is-open"), st.hidden = !1, st.parentElement && (st.parentElement.hidden = !1), on());
}
function Dp() {
  const e = Array.from(Ut.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => On(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function on() {
  const e = Dp();
  if (pr)
    if (hr === "analysing" || hr === "running")
      pr.textContent = Ya();
    else if (ui && e.total === 0)
      pr.innerHTML = "Your Sims are reviewing…";
    else if (e.total === 0) {
      const t = Lr.size || Ar.size;
      pr.innerHTML = `${t} Sim${t === 1 ? " is" : "s are"} running on this page`;
    } else
      pr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`;
  Mr && (Mr.hidden = e.high === 0, Mr.textContent = `${e.high} high`), Yv(), Xt && Fp(e);
}
function Fp(e) {
  Qr && (e.total === 0 ? Qr.innerHTML = ui ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Qr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Gv();
}
function Gv() {
  if (!Yt) return;
  const e = Array.from(Ut.values());
  if (Yt.hidden = e.length === 0, Yt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Yt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (Jr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(Jr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      Jr = Jr === i.simId ? null : i.simId, tn();
    }), Yt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Yt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => On(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = _n === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${Lp[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      _n = _n === i ? null : i, tn();
    }), Yt.appendChild(a);
  });
}
function Kv() {
  return Array.from(Ut.values()).filter((e) => !Jr || e.entry.simId === Jr).filter((e) => !_n || On(e.obs) === _n).sort((e, t) => {
    const r = On(e.obs), n = On(t.obs), i = r ? Yu[r] : 3, s = n ? Yu[n] : 3;
    return i - s;
  });
}
function Xv(e) {
  const { entry: t, obs: r } = e, n = On(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Pp(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Lp[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
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
    (m = Hi.onTriage) == null || m.call(Hi, r, t.name), Gu(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = G("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    Zv(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Gu(e.id);
  }), o.append(h, d, u), i.appendChild(o), i;
}
function Jv(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function tn() {
  if (!rr || !Xt) {
    on();
    return;
  }
  const e = Dp();
  Fp(e);
  const t = Kv();
  if (rr.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Ut.size > 0;
    if (ui && !i) {
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
    const i = Xv(n);
    n.rowEl = i, rr.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Ut.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Jv(rr);
}
function ya() {
  Tn == null || Tn(), Tn = null;
}
async function Zv(e) {
  const t = Ut.get(e);
  if (!t) return;
  const r = await Fv(t.obs, { scroll: !0 });
  !r || !Dt || Qv(r, t.entry.accent);
}
function Qv(e, t) {
  ya();
  const r = Np(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${ju(t, 0.16)},0 0 24px ${ju(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const p = e.getBoundingClientRect(), o = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Tn === l && ya();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), tt(n);
  };
  Tn = l;
}
function e0(e, t) {
  const r = `f_${e.simId}_${++ys}`;
  Ut.set(r, { id: r, entry: e, obs: t, rowEl: null }), Xt ? tn() : on(), It && (It.textContent = "", requestAnimationFrame(() => {
    It && (It.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function t0(e) {
  const t = Ut.get(e);
  if (!t) return;
  const r = () => {
    Ut.delete(e), Xt ? tn() : on();
  };
  t.rowEl && Xt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ma() ? 0 : 300)) : r();
}
function Gu(e) {
  const t = Ut.get(e);
  t && (bs.add(Wa(t.entry.simId, t.obs)), t0(e));
}
function r0(e, t, r) {
  if (!Lt) return;
  const n = Ar.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length && !(Lr.size && !Lr.has(e))) {
    ja(!1);
    for (const i of r) {
      if (!Rv(i)) continue;
      const s = Wa(e, i);
      bs.has(s) || Sv(e, i) || (Ev(e, i), e0(n, i));
    }
  }
}
function ba() {
  ya(), Ut.clear(), ys = 0, Ar.clear(), bs.clear(), Ha.length = 0, Xt = !1, Jr = null, _n = null, ui = !1, hr = null, qa = 0, Kr = 0, Lr = /* @__PURE__ */ new Set(), wt = null, _r = null, _t = null, nr = [], ir.clear(), In = !1, sr = "", Rn == null || Rn.abort(), Rn = null, st = null, Zr = null, pr = null, Mr = null, ft = null, Qr = null, Vt = null, Yt = null, rr = null, It = null, tt(Dt), Dt = null, tt(Lt), Lt = null, Gr = null, Ap(!1);
}
const Hi = {
  deploy: $p,
  updateSims: Bv,
  setReviewing: ja,
  setRunStatus: jv,
  renderFeedback: r0,
  undeploy: ba,
  onTriage: null
};
function n0() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Hi);
}
typeof window < "u" && n0();
const Ku = "klav-ao-css", i0 = "klav-ao-overlay";
function s0(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), p = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(p, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const o0 = `
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
let Vr = null, a0 = 1;
const ts = /* @__PURE__ */ new Map();
function Xu(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function l0() {
  if (Vr) return Vr;
  if (!document.getElementById(Ku)) {
    const e = document.createElement("style");
    e.id = Ku, e.textContent = o0, document.head.appendChild(e);
  }
  return Vr = document.createElement("div"), Vr.id = i0, Vr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Vr), Vr;
}
function v0(e, t, r = {}) {
  const n = l0(), i = r.color ?? "#6366f1", s = `klav-ao-${a0++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Xu(i, 0.14)},0 0 24px ${Xu(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: d, top: u, below: m } = s0(
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
      const k = M === "medium" ? " sev-m" : M === "low" ? " sev-l" : "", L = document.createElement("span");
      L.className = `klav-ao-sev${k}`, L.textContent = M, f.appendChild(L);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => Up(s)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return ts.set(s, { halo: c, pin: l }), s;
}
function Up(e) {
  const t = ts.get(e);
  if (!t) return;
  ts.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    tt(n), tt(r);
  }, 240)) : tt(r);
}
function w0() {
  for (const e of [...ts.keys()]) Up(e);
}
let Va = wn, Cr = "";
const Bp = { consoleErrors: [], networkFailures: [] };
let Ga, qp, Nn = null;
function vn() {
  return Va.backendUrl || wd;
}
const c0 = 15e3;
function Kn(e, t = {}, r = c0) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Wp(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Ju() {
  return jm(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function u0() {
  return sg(Bp, { identity: Ga, metadata: qp });
}
async function d0(e) {
  return Qm(
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
      projectId: Cr || void 0,
      replayEvents: e.replayEvents
    },
    Va,
    { backend: Ly }
  );
}
function Ka(e = "bug") {
  const t = my(e, {
    onCaptureFull: Ju,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: bc,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Kn(vn() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: Cr, text: r, url: location.href })
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
        const i = await Kn(vn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: Cr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: Gs() })
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
        const i = await Kn(vn() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: Cr,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: Gs()
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
        s.append("projectId", Cr), s.append("audio", r, "recording.webm"), r.type && s.append("mime", r.type), s.append("pageUrl", location.href), n != null && n.text && s.append("text", n.text), (i = n == null ? void 0 : n.frames) != null && i.length && s.append("frames", JSON.stringify(n.frames));
        const a = await Kn(vn() + "/api/report/split", { method: "POST", body: s }, 9e4);
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
        n.append("projectId", Cr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Kn(vn() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(vn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", Cr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Id();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => Jy({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => bc(a))), i = await Promise.all(n.map((a) => Zy(a))), s = u0();
      return r.attachConsole !== !0 && (s.consoleErrors = []), d0({
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
        reporter: Ga,
        clientInfo: Gs(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (Nn == null ? void 0 : Nn.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Ju();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function p0() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function h0() {
  og(Bp, { consoleLevels: !0 });
}
function Hp(e) {
  Ga = e ? Wp(e) : void 0;
}
function jp(e) {
  qp = e ? Wp(e) : void 0;
}
function f0() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = _y, (document.head || document.documentElement).appendChild(e);
}
function m0() {
  document.addEventListener("contextmenu", (e) => {
    if (Xg(e.target)) return;
    e.preventDefault(), f0();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (p, o, h, d, u = {}) => {
      const m = Oy(document, { iconHtml: G(p), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), Ka(d);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      tt(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Yp(e = {}) {
  if (Va = {
    ...wn,
    ...e,
    jira: { ...wn.jira, ...e.jira },
    linear: { ...wn.linear, ...e.linear },
    github: { ...wn.github, ...e.github },
    plane: { ...wn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (Cr = e.projectId), h0(), p0(), m0(), !Nn)
    try {
      Nn = bv(Ir);
    } catch {
      Nn = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Yp, openModal: Ka, identify: Hp, setMetadata: jp });
const x0 = { init: Yp, openModal: Ka, identify: Hp, setMetadata: jp };
export {
  Hi as KlavitySims,
  Hi as SimsLive,
  Up as clearAnnotation,
  w0 as clearAnnotations,
  x0 as default,
  Hp as identify,
  Yp as init,
  n0 as installKlavitySims,
  Ka as openModal,
  jp as setMetadata,
  v0 as showAnnotation
};
