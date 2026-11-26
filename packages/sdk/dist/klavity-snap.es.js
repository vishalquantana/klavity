var bf = Object.defineProperty;
var kf = (e, t, r) => t in e ? bf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var _i = (e, t, r) => kf(e, typeof t != "symbol" ? t + "" : t, r);
function vf(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Rd = 112, Td = 72, Ad = 89, Ld = 115;
let ro;
function wf() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function xf(e) {
  let t = -1;
  ro || (ro = wf());
  for (let r = 0; r < e.length; r++)
    t = ro[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Sf(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Rd && e[r - 2] === Td && e[r - 1] === Ad && e[r] === Ld)
      return r - 3;
  return 0;
}
function Ef(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Rd, n[1] = Td, n[2] = Ad, n[3] = Ld, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = xf(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Sf(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const Cf = "AAlwSFlz", Mf = "AAAJcEhZ", Rf = "AAAACXBI";
function Tf(e) {
  let t = e.indexOf(Cf);
  return t === -1 && (t = e.indexOf(Mf)), t === -1 && (t = e.indexOf(Rf)), t;
}
const _d = "[modern-screenshot]", Fr = typeof window < "u", Af = Fr && "Worker" in window, Lf = Fr && "atob" in window, _f = Fr && "btoa" in window;
var Md;
const Ua = Fr ? (Md = window.navigator) == null ? void 0 : Md.userAgent : "", Id = Ua.includes("Chrome"), rs = Ua.includes("AppleWebKit") && !Id, Ba = Ua.includes("Firefox"), If = (e) => e && "__CONTEXT__" in e, Of = (e) => e.constructor.name === "CSSFontFaceRule", Nf = (e) => e.constructor.name === "CSSImportRule", Pf = (e) => e.constructor.name === "CSSLayerBlockRule", mr = (e) => e.nodeType === 1, mi = (e) => typeof e.className == "object", Od = (e) => e.tagName === "image", zf = (e) => e.tagName === "use", ci = (e) => mr(e) && typeof e.style < "u" && !mi(e), $f = (e) => e.nodeType === 8, Df = (e) => e.nodeType === 3, qn = (e) => e.tagName === "IMG", hs = (e) => e.tagName === "VIDEO", Ff = (e) => e.tagName === "CANVAS", Uf = (e) => e.tagName === "TEXTAREA", Bf = (e) => e.tagName === "INPUT", qf = (e) => e.tagName === "STYLE", Wf = (e) => e.tagName === "SCRIPT", jf = (e) => e.tagName === "SELECT", Hf = (e) => e.tagName === "SLOT", Yf = (e) => e.tagName === "IFRAME", Vf = (...e) => console.warn(_d, ...e);
function Kf(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ea = (e) => e.startsWith("data:");
function Nd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Fr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Fr)
    return e;
  const r = fs().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function fs(e) {
  return (e && mr(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const ms = "http://www.w3.org/2000/svg";
function Xf(e, t, r) {
  const n = fs(r).createElementNS(ms, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Gf(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Jf(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Zf = (e) => Jf(e, "dataUrl");
function $n(e, t) {
  const r = fs(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function ui(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? $n(e, fs(i)) : e;
    let l = null, d = null;
    function o() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(o, n)), hs(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? ui(c.poster, t).then(r) : o();
      if (c.readyState >= 2)
        return o();
      const u = o, p = (g) => {
        a == null || a(
          "Failed video load",
          h,
          g
        ), s == null || s(g), o();
      };
      d = () => {
        c.removeEventListener("loadeddata", u), c.removeEventListener("error", p);
      }, c.addEventListener("loadeddata", u, { once: !0 }), c.addEventListener("error", p, { once: !0 });
    } else {
      const h = Od(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const u = async () => {
        if (qn(c) && "decode" in c)
          try {
            await c.decode();
          } catch (g) {
            a == null || a(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              g
            );
          }
        o();
      }, p = (g) => {
        a == null || a(
          "Failed image load",
          c.dataset.originalSrc || h,
          g
        ), o();
      };
      if (qn(c) && c.complete)
        return u();
      d = () => {
        c.removeEventListener("load", u), c.removeEventListener("error", p);
      }, c.addEventListener("load", u, { once: !0 }), c.addEventListener("error", p, { once: !0 });
    }
  });
}
async function Qf(e, t) {
  ci(e) && (qn(e) || hs(e) ? await ui(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => ui(n, t)))
  ));
}
const Pd = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function zd(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let kc = 0;
function em(e) {
  const t = `${_d}[#${kc}]`;
  return kc++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Vf(...r)
  };
}
function tm(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function gs(e, t) {
  return If(e) ? e : rm(e, { ...t, autoDestruct: !0 });
}
async function rm(e, t) {
  var p, g;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Fr ? window.document : void 0), l = ((p = e.ownerDocument) == null ? void 0 : p.defaultView) ?? (Fr ? window : void 0), d = /* @__PURE__ */ new Map(), o = {
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
      requestInit: tm((g = t == null ? void 0 : t.fetch) == null ? void 0 : g.bypassingCache),
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
    log: em(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: $d(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(ms, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Af && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var k, L, S, x;
          const { url: M, result: w } = y.data;
          w ? (L = (k = d.get(M)) == null ? void 0 : k.resolve) == null || L.call(k, w) : (x = (S = d.get(M)) == null ? void 0 : S.reject) == null || x.call(S, new Error(`Error receiving message from worker: ${M}`));
        }, f.onmessageerror = (y) => {
          var w, k;
          const { url: M } = y.data;
          (k = (w = d.get(M)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${M}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Kf(c) && "image/webp",
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
  o.log.time("wait until load"), await Qf(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: u } = nm(e, o);
  return o.width = h, o.height = u, o;
}
function $d(e) {
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
function nm(e, t) {
  let { width: r, height: n } = t;
  if (mr(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function im(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await ui(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = sm(e.ownerDocument, t), d = () => {
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
function sm(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function Dd(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return $n(s, e.ownerDocument);
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
function om(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return qa(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function am(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function lm(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return $n(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await ui(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? $n(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? $n(e.poster, e.ownerDocument) : r;
    }
    return Dd(s, t);
  }
  return r;
}
function cm(e, t) {
  return Ff(e) ? Dd(e, t) : Yf(e) ? om(e, t) : qn(e) ? am(e) : hs(e) ? lm(e, t) : e.cloneNode(!1);
}
function um(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Pd()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const dm = [
  "width",
  "height",
  "-webkit-text-fill-color"
], pm = [
  "stroke",
  "fill"
];
function Fd(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = mi(e) && i !== "svg", a = s ? pm.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = um(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const o = d == null ? void 0 : d.document;
  let h, u;
  s ? (h = o.createElementNS(ms, "svg"), u = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, y]) => {
    u.setAttributeNS(null, f, y);
  }), h.appendChild(u)) : h = u = o.createElement(i), u.textContent = " ", o.body.appendChild(h);
  const p = d.getComputedStyle(u, t), g = /* @__PURE__ */ new Map();
  for (let f = p.length, y = 0; y < f; y++) {
    const M = p.item(y);
    dm.includes(M) || g.set(M, p.getPropertyValue(M));
  }
  return o.body.removeChild(h), n.set(c, g), g;
}
function Ud(e, t, r) {
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
    const d = e.getPropertyValue(l), o = e.getPropertyPriority(l), h = l.lastIndexOf("-"), u = h > -1 ? l.substring(0, h) : void 0;
    if (u) {
      let p = s.get(u);
      p || (p = /* @__PURE__ */ new Map(), s.set(u, p)), p.set(l, [d, o]);
    }
    t.get(l) === d && !o || (u ? i.push(u) : n.set(l, [d, o]));
  }
  return n;
}
function hm(e, t, r, n) {
  var h, u, p, g;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), d = Fd(e, null, n);
  a == null || a.forEach((f, y) => {
    d.delete(y);
  });
  const o = Ud(l, d, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Id && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((u = o.get("overflow-x")) == null ? void 0 : u[0]) === "hidden" || ((p = o.get("overflow-y")) == null ? void 0 : p[0]) === "hidden") && ((g = o.get("text-overflow")) == null ? void 0 : g[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return o.forEach(([f, y], M) => {
    c.setProperty(M, f, y);
  }), o;
}
function fm(e, t) {
  (Uf(e) || Bf(e) || jf(e)) && t.setAttribute("value", e.value);
}
const mm = [
  "::before",
  "::after"
  // '::placeholder', TODO
], gm = [
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
function ym(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !s)
    return;
  function d(o) {
    var k;
    const h = s.getComputedStyle(e, o);
    let u = h.getPropertyValue("content");
    if (!u || u === "none")
      return;
    i == null || i(u), u = u.replace(/(')|(")|(counter\(.+\))/g, "");
    const p = [Pd()], g = Fd(e, o, n);
    l == null || l.forEach((L, S) => {
      g.delete(S);
    });
    const f = Ud(h, g, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((k = f.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${u}';`
    ];
    if (f.forEach(([L, S], x) => {
      y.push(`${x}: ${L}${S ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...p].join(" ");
    } catch (L) {
      n.log.warn("Failed to copyPseudoClass", L);
      return;
    }
    const M = y.join(`
  `);
    let w = c.get(M);
    w || (w = [], c.set(M, w)), w.push(`.${p[0]}${o}`);
  }
  mm.forEach(d), r && gm.forEach(d);
}
const vc = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function wc(e, t, r, n, i) {
  if (mr(r) && (qf(r) || Wf(r)) || n.filter && !n.filter(r))
    return;
  vc.has(t.nodeName) || vc.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await qa(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && bm(e, s), t.appendChild(s);
}
async function xc(e, t, r, n) {
  var s;
  let i = e.firstChild;
  mr(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!$f(a))
      if (mr(a) && Hf(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await wc(e, t, c[l], r, n);
      } else
        await wc(e, t, a, r, n);
}
function bm(e, t) {
  if (!ci(e) || !ci(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = d, t.style.transform = s.toString();
}
function km(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const vm = /^[\w-:]+$/;
async function qa(e, t, r = !1, n) {
  var d, o, h, u;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && Df(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && mr(e) && (ci(e) || mi(e))) {
    const p = await cm(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = p.getAttributeNames();
      for (let L = k.length, S = 0; S < L; S++) {
        const x = k[S];
        vm.test(x) || p.removeAttribute(x);
      }
    }
    const g = t.currentNodeStyle = hm(e, p, r, t);
    r && km(p, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (d = g.get("overflow-x")) == null ? void 0 : d[0],
        (o = g.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = g.get("text-transform")) == null ? void 0 : h[0], M = zd((u = g.get("font-family")) == null ? void 0 : u[0]), w = M ? (k) => {
      y === "uppercase" ? k = k.toUpperCase() : y === "lowercase" ? k = k.toLowerCase() : y === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), M.forEach((L) => {
        let S = a.get(L);
        S || a.set(L, S = /* @__PURE__ */ new Set()), k.split("").forEach((x) => S.add(x));
      });
    } : void 0;
    return ym(
      e,
      p,
      f,
      t,
      w
    ), fm(e, p), hs(e) || await xc(
      e,
      p,
      t,
      w
    ), await (c == null ? void 0 : c(p)), p;
  }
  const l = e.cloneNode(!1);
  return await xc(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function wm(e) {
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
function xm(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Zf);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function di(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: s } = t;
  let a = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: d,
    fetchFn: o,
    fetch: {
      requestInit: h,
      bypassingCache: u,
      placeholderImage: p
    },
    font: g,
    workers: f,
    fontFamilies: y
  } = e;
  n === "image" && (rs || Ba) && e.drawImageCount++;
  let M = d.get(r);
  if (!M) {
    u && u instanceof RegExp && u.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const w = n.startsWith("font") && g && g.minify, k = /* @__PURE__ */ new Set();
    w && n.split(";")[1].split(",").forEach((T) => {
      y.has(T) && y.get(T).forEach((P) => k.add(P));
    });
    const L = w && k.size, S = {
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
      return !rs && r.startsWith("http") && f.length ? new Promise((x, T) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...S }), M.resolve = x, M.reject = T;
      }) : xm(S);
    })().catch((x) => {
      if (d.delete(r), n === "image" && p)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof p == "string" ? p : p(s);
      throw x;
    }), d.set(r, M);
  }
  return M.response;
}
async function Bd(e, t, r, n) {
  if (!qd(e))
    return e;
  for (const [i, s] of Sm(e, t))
    try {
      const a = await di(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Em(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function qd(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Wd = /url\((['"]?)([^'"]+?)\1\)/g;
function Sm(e, t) {
  const r = [];
  return e.replace(Wd, (n, i, s) => (r.push([s, Nd(s, t)]), n)), r.filter(([n]) => !Ea(n));
}
function Em(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Cm = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Mm(e, t) {
  return Cm.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((rs || Ba) && t.drawImageCount++, Bd(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Rm(e, t) {
  if (qn(e)) {
    const r = e.currentSrc || e.src;
    if (!Ea(r))
      return [
        di(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (rs || Ba) && t.drawImageCount++;
  } else if (mi(e) && !Ea(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      di(t, {
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
function Tm(e, t) {
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
        di(t, {
          url: s,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function jd(e, t) {
  const { tasks: r } = t;
  mr(e) && ((qn(e) || Od(e)) && r.push(...Rm(e, t)), zf(e) && r.push(...Tm(e, t))), ci(e) && r.push(...Mm(e.style, t)), e.childNodes.forEach((n) => {
    jd(n, t);
  });
}
async function Am(e, t) {
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
      const l = Ec(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((p) => {
        try {
          return "cssRules" in p && !!p.cssRules.length;
        } catch (g) {
          return t.log.warn(`Error while reading CSS rules from ${p.href}`, g), !1;
        }
      }), d = r.implementation.createHTMLDocument(""), o = d.createElement("style");
      d.head.appendChild(o);
      const h = o.sheet;
      await Promise.all(
        l.flatMap((p) => Array.from(p.cssRules).map(async (g) => {
          if (Nf(g)) {
            const f = g.href;
            let y = "";
            try {
              y = await di(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (w) {
              t.log.warn(`Error fetch remote css import from ${f}`, w);
            }
            const M = y.replace(
              Wd,
              (w, k, L) => w.replace(L, Nd(L, f))
            );
            for (const w of _m(M))
              try {
                h.insertRule(w, h.cssRules.length);
              } catch (k) {
                t.log.warn("Error inserting rule from remote css import", { rule: w, error: k });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const u = [];
      l.forEach((p) => {
        Ca(p.cssRules, u);
      }), u.filter((p) => {
        var g;
        return Of(p) && qd(p.style.getPropertyValue("src")) && ((g = zd(p.style.getPropertyValue("font-family"))) == null ? void 0 : g.some((f) => i.has(f)));
      }).forEach((p) => {
        const g = p, f = s.get(g.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          Bd(
            g.cssText,
            g.parentStyleSheet ? g.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = Ec(y, t), s.set(g.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const Lm = /(\/\*[\s\S]*?\*\/)/g, Sc = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function _m(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Lm, "");
  for (; ; ) {
    const s = Sc.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Sc, "");
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
const Im = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Om = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ec(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Om, (i) => {
    for (; ; ) {
      const [s, , a] = Im.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function Ca(e, t = []) {
  for (const r of Array.from(e))
    Pf(r) ? t.push(...Ca(r.cssRules)) : "cssRules" in r ? Ca(r.cssRules, t) : t.push(r);
  return t;
}
const Nm = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Pm(e) {
  return Nm.test(e.innerHTML);
}
async function zm(e, t) {
  const r = await gs(e, t);
  if (mr(r.node) && mi(r.node) && !Pm(r.node))
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
    onCloneNode: u,
    onEmbedNode: p,
    onCreateForeignObjectSvg: g
  } = r;
  i.time("clone node");
  const f = await qa(r.node, r, !0);
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
  i.timeEnd("clone node"), await (u == null ? void 0 : u(f)), d !== !1 && mr(f) && (i.time("embed web font"), await Am(f, r), i.timeEnd("embed web font")), i.time("embed node"), jd(f, r);
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
  o == null || o(M, y), await Promise.all([...Array.from({ length: 4 })].map(w)), i.timeEnd("embed node"), await (p == null ? void 0 : p(f));
  const k = $m(f, r);
  return c && k.insertBefore(c, k.children[0]), a && k.insertBefore(a, k.children[0]), h && wm(r), await (g == null ? void 0 : g(k)), k;
}
function $m(e, t) {
  const { width: r, height: n } = t, i = Xf(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function Dm(e, t) {
  var a;
  const r = await gs(e, t), n = await zm(r), i = Gf(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = $d(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(ms, "defs"), r.svgStyles.clear());
  const s = $n(i, n.ownerDocument);
  return await im(s, r);
}
async function Fm(e, t) {
  const r = await gs(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await Dm(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && Lf && _f) {
    const [d, o] = l.split(",");
    let h = 0, u = !1;
    if (s === "image/png") {
      const k = Tf(o);
      k >= 0 ? (h = Math.ceil((k + 28) / 3) * 4, u = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const p = o.substring(0, h), g = o.substring(h), f = window.atob(p), y = new Uint8Array(f.length);
    for (let k = 0; k < y.length; k++)
      y[k] = f.charCodeAt(k);
    const M = s === "image/png" ? Ef(y, a, u) : vf(y, a), w = window.btoa(String.fromCharCode(...M));
    l = [d, ",", w, g].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Um(e, t) {
  return Fm(
    await gs(e, { ...t, type: "image/png" })
  );
}
const Bm = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", qm = 8e3, Wm = 16384, Cc = 4096, jm = 16e6, Hm = 500, Ym = 1e4, no = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", Hd = 600, Vm = 1200, Km = 24, Xm = 1024, Yt = 32, Gm = 4, Yd = 400, Jm = 0.985, Zm = 250;
function Vd(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Qm(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return Vd(r, location.origin);
}
function eg(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && Vd(t.src || "", location.origin)) return !0;
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
function io(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Mc(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function tg(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Cc / i, Cc / s), l = Math.min(a, c, Math.sqrt(jm / (i * s))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(s * l));
    const o = d.getContext("2d");
    if (!o) return { dataUrl: no, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + Hm;
    let u = 0;
    const p = () => u >= Ym || Date.now() >= h, g = (y, M = !1) => {
      var x;
      if (p() || (u++, !M && t && !t(y))) return;
      const w = getComputedStyle(y);
      if (w.display === "none" || w.visibility === "hidden" || Number(w.opacity) === 0) return;
      const k = y.getBoundingClientRect(), L = k.left - n.left, S = k.top - n.top;
      if (k.width > 0 && k.height > 0) {
        Mc(w.backgroundColor) || (o.fillStyle = w.backgroundColor, o.fillRect(L, S, k.width, k.height));
        const T = parseFloat(w.borderTopWidth);
        T > 0 && w.borderTopStyle !== "none" && !Mc(w.borderTopColor) && (o.strokeStyle = w.borderTopColor, o.lineWidth = T, o.strokeRect(L, S, k.width, k.height)), y.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(L, S, k.width, k.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(L, S, k.width, k.height));
      }
      for (const T of Array.from(y.childNodes)) {
        if (p()) break;
        if (T instanceof HTMLElement) {
          g(T);
          continue;
        }
        if (!(T.nodeType !== Node.TEXT_NODE || !((x = T.textContent) != null && x.trim())))
          try {
            const P = document.createRange();
            P.selectNodeContents(T);
            const $ = P.getBoundingClientRect();
            if ($.width <= 0 || $.height <= 0) continue;
            o.save(), o.beginPath(), o.rect($.left - n.left, $.top - n.top, $.width, $.height), o.clip(), o.fillStyle = w.color, o.font = `${w.fontStyle} ${w.fontWeight} ${w.fontSize} ${w.fontFamily}`, o.textBaseline = "top", o.fillText(T.textContent.trim(), $.left - n.left, $.top - n.top), o.restore();
          } catch {
          }
      }
    };
    g(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: no, scale: 1 };
  } catch {
    return { dataUrl: no, scale: 1 };
  }
}
function rg() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function so(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function ng(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < Km; s++) {
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
async function Rc(e, t = Hd) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await so(i.ready, n());
    const s = ng(e);
    s.length && await so(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await so(rg(), Math.min(n(), 50));
  } catch {
  }
}
function Kd(e, t) {
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
async function ig(e) {
  if (typeof document > "u") return null;
  const t = await Kd(e, Yd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Yt, r.height = Yt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Yt, Yt);
    const { data: i } = n.getImageData(0, 0, Yt, Yt);
    let s = 0, a = 0, c = 0;
    for (let d = 0; d < i.length; d += 4) {
      const o = i[d + 3] / 255, h = i[d] * o + 255 * (1 - o), u = i[d + 1] * o + 255 * (1 - o), p = i[d + 2] * o + 255 * (1 - o), g = 0.299 * h + 0.587 * u + 0.114 * p;
      a += g, c += g * g, s++;
    }
    if (!s) return null;
    const l = a / s;
    return c / s - l * l;
  } catch {
    return null;
  }
}
async function oo(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Xm) return !0;
  try {
    const i = await ig(e);
    if (i !== null && i <= Gm) return !0;
  } catch {
  }
  return !1;
}
async function sg(e) {
  if (typeof document > "u") return null;
  const t = await Kd(e, Yd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Yt, r.height = Yt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Yt, Yt);
    const { data: i } = n.getImageData(0, 0, Yt, Yt);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * o + 0.114 * h >= Zm && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function og(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await sg(e);
    if (r !== null && r >= Jm) return !0;
  } catch {
  }
  return !1;
}
const ag = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], lg = /* @__PURE__ */ new Set([
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
function cg(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function ug(e) {
  const t = (e || "").toLowerCase();
  return ag.some((r) => t.includes(r));
}
const dg = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function pg(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : dg.test(t);
}
function hg(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = cg(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(ug(r) || n && !lg.has(n) && t.includes("_") && pg(t));
}
function fg(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    hg({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Ji = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, mg = 3e3, gg = 4e3, Tc = 24, Ac = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function yg(e, t = gg) {
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
function bg(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < Tc; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Tc; l++) {
        const d = c[l];
        if (!(d && (((n = d.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || d.type === 5))) continue;
        let h = "", u = "";
        try {
          h = (((i = d.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), u = ((s = d.style) == null ? void 0 : s.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !u || t.push({ cssText: d.cssText, family: h, src: u });
      }
  }
  return t;
}
function kg(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function vg(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${kg(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function wg(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? bg(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => yg(c)), a = [];
  for (const c of n) {
    const l = [];
    Ac.lastIndex = 0;
    let d;
    for (; (d = Ac.exec(c.src)) !== null; ) {
      const p = d[2];
      p && !p.startsWith("data:") && l.push(p);
    }
    if (!l.length) {
      a.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let o = c.cssText, h = !1;
    const u = await Promise.all(l.map(async (p) => {
      let g = p;
      try {
        g = new URL(p, i).href;
      } catch {
      }
      return { rawUrl: p, dataUrl: await s(g) };
    }));
    for (const { rawUrl: p, dataUrl: g } of u)
      g && (o = vg(o, p, g), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function xg() {
  try {
    return await Promise.race([
      wg({}).catch(() => Ji),
      new Promise((e) => setTimeout(() => e(Ji), mg))
    ]);
  } catch {
    return Ji;
  }
}
function Sg(e, t) {
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
async function Eg(e, t = {}) {
  return (await Cg(e, t)).dataUrl;
}
async function Cg(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? Ji : await xg(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Sg(Um(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (u) => fg(u, c.embeddedFamilies),
      maximumCanvasSize: Wm,
      fetch: { placeholderImage: Bm },
      filter: (u) => n && !n(u) || eg(u) ? !1 : Qm(u) ? (r++, !1) : !0
    }), qm);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Rc(e, Hd);
  try {
    let o = await d(), h = await oo(o);
    if (h) {
      await Rc(e, Vm);
      try {
        const p = await d();
        await oo(p) || (o = p, h = !1);
      } catch {
      }
    }
    r && io(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && io("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const u = h ? !1 : await og(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: u, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    io(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const u = tg(e, n, a), p = await oo(u.dataUrl);
    return { ...u, quality: "wireframe", blank: p, partial: !1, skippedImages: 0 };
  }
}
const Mg = {
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
function Rg(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Q(e, t = {}) {
  const r = Mg[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${Rg(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const Xd = "https://klavity.in", Tn = {
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
function ao(e, t, r) {
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
        let o = 1, h = l.length, u = 1;
        for (; o <= h; ) {
          const p = o + h >> 1;
          e(l.slice(0, p)) <= n ? (u = p, o = p + 1) : h = p - 1;
        }
        i.push(l.slice(0, u)), l = l.slice(u);
      }
      a = l;
    }
    i.push(a);
  }
  return i.length ? i : [""];
}
function Ii(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function Tg(e) {
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
function Ag(e) {
  const t = Tg(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function lo(e) {
  return Ag(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
function Gd(e, t, r, n) {
  return { x: Math.min(e, e + r), y: Math.min(t, t + n), w: Math.abs(r), h: Math.abs(n) };
}
function Lc(e, t, r, n, i, s) {
  const a = i - r, c = s - n, l = a * a + c * c, d = l ? Math.max(0, Math.min(1, ((e - r) * a + (t - n) * c) / l)) : 0;
  return Math.hypot(e - (r + d * a), t - (n + d * c));
}
function Lg(e, t, r, n, i) {
  if (e.type === "line" || e.type === "arrow") return Lc(t, r, e.x1, e.y1, e.x2, e.y2) <= n + i.computeLineWidth(e);
  if (e.type === "pen") {
    const a = n + i.computeLineWidth(e);
    if (e.points.length === 1) return Math.hypot(t - e.points[0].x, r - e.points[0].y) <= a;
    for (let c = 1; c < e.points.length; c++) {
      const l = e.points[c - 1], d = e.points[c];
      if (Lc(t, r, l.x, l.y, d.x, d.y) <= a) return !0;
    }
    return !1;
  }
  if (e.type === "circle") {
    const a = Math.abs(e.rx) + n, c = Math.abs(e.ry) + n;
    return ((t - e.x) / a) ** 2 + ((r - e.y) / c) ** 2 <= 1;
  }
  if (e.type === "count") return Math.hypot(t - e.x, r - e.y) <= i.countRadius(e) + n;
  const s = i.shapeBounds(e);
  return !!s && t >= s.x - n && t <= s.x + s.w + n && r >= s.y - n && r <= s.y + s.h + n;
}
function Ma(e) {
  return JSON.parse(JSON.stringify(e));
}
function Jd(e, t) {
  Object.assign(e, Ma(t));
}
function _g(e, t, r, n) {
  Jd(e, t);
  const i = e;
  i.type === "pen" ? i.points = i.points.map((s) => ({ x: s.x + r, y: s.y + n })) : i.type === "line" || i.type === "arrow" ? (i.x1 += r, i.y1 += n, i.x2 += r, i.y2 += n) : (i.x += r, i.y += n);
}
function Ig(e, t, r, n, i, s) {
  Jd(e, t);
  const a = e;
  if (a.type === "line" || a.type === "arrow") {
    n === "p1" ? (a.x1 = i, a.y1 = s) : n === "p2" && (a.x2 = i, a.y2 = s);
    return;
  }
  const c = r;
  if (a.type === "text") {
    const u = Math.max(0.2, (s - c.y) / Math.max(1, c.h));
    a.size = Math.max(10, Math.min(240, Math.round(t.size * u)));
    return;
  }
  if (a.type === "count") {
    a.size = Math.max(8, Math.min(400, Math.max(i - a.x, s - a.y)));
    return;
  }
  const l = n === "nw" || n === "sw" ? c.x + c.w : c.x, d = n === "nw" || n === "ne" ? c.y + c.h : c.y, o = Gd(l, d, i - l, s - d), h = 4;
  if (o.w < h && (o.w = h), o.h < h && (o.h = h), a.type === "rect" || a.type === "pixelate")
    a.x = o.x, a.y = o.y, a.w = o.w, a.h = o.h;
  else if (a.type === "circle")
    a.x = o.x + o.w / 2, a.y = o.y + o.h / 2, a.rx = o.w / 2, a.ry = o.h / 2;
  else if (a.type === "pen") {
    const u = c.w ? o.w / c.w : 1, p = c.h ? o.h / c.h : 1;
    a.points = a.points.map((g) => ({ x: o.x + (g.x - c.x) * u, y: o.y + (g.y - c.y) * p }));
  }
}
class Ra {
  constructor(t, r) {
    this.shapes = [], this.strokeScale = 1, this.baseImg = null, this.selected = null, this.uiScale = 1, this.canvas = t, this.imageDataUrl = r;
  }
  /** Base stroke width. A shape that recorded its own stroke multiplier (`sw`) keeps it; otherwise the
   *  editor's current Stroke setting (`strokeScale`) applies. */
  computeLineWidth(t) {
    const r = t && "sw" in t && typeof t.sw == "number" && t.sw > 0 ? t.sw : this.strokeScale;
    return Math.max(3, this.canvas.width / 400) * r;
  }
  computeFontSize() {
    return Math.max(16, this.canvas.width / 60);
  }
  /** Radius (image px) of a numbered counter badge — its own `size` once resized, else the default. */
  countRadius(t) {
    return t.size && t.size > 0 ? t.size : Math.max(13, this.computeFontSize());
  }
  /** Image-space bounding box of any shape (null when it can't be measured, e.g. text in a headless env). */
  shapeBounds(t) {
    switch (t.type) {
      case "pen": {
        if (!t.points.length) return null;
        let r = 1 / 0, n = 1 / 0, i = -1 / 0, s = -1 / 0;
        for (const a of t.points)
          r = Math.min(r, a.x), n = Math.min(n, a.y), i = Math.max(i, a.x), s = Math.max(s, a.y);
        return { x: r, y: n, w: i - r, h: s - n };
      }
      case "rect":
      case "pixelate":
        return Gd(t.x, t.y, t.w, t.h);
      case "arrow":
      case "line":
        return { x: Math.min(t.x1, t.x2), y: Math.min(t.y1, t.y2), w: Math.abs(t.x2 - t.x1), h: Math.abs(t.y2 - t.y1) };
      case "circle":
        return { x: t.x - Math.abs(t.rx), y: t.y - Math.abs(t.ry), w: Math.abs(t.rx) * 2, h: Math.abs(t.ry) * 2 };
      case "count": {
        const r = this.countRadius(t);
        return { x: t.x - r, y: t.y - r, w: r * 2, h: r * 2 };
      }
      case "text":
        return this.textBounds(t);
    }
    return null;
  }
  /** Resize handles for a shape: endpoints for line/arrow, the bottom-right corner for text and counters
   *  (they scale uniformly), four corners for everything else. */
  handlesFor(t) {
    if (t.type === "line" || t.type === "arrow") return [{ id: "p1", x: t.x1, y: t.y1 }, { id: "p2", x: t.x2, y: t.y2 }];
    const r = this.shapeBounds(t);
    return r ? t.type === "text" || t.type === "count" ? [{ id: "se", x: r.x + r.w, y: r.y + r.h }] : [{ id: "nw", x: r.x, y: r.y }, { id: "ne", x: r.x + r.w, y: r.y }, { id: "sw", x: r.x, y: r.y + r.h }, { id: "se", x: r.x + r.w, y: r.y + r.h }] : [];
  }
  /** Grab tolerance in image px (scaled so it stays ~8 screen px whatever the zoom/fit). */
  hitTolerance() {
    return Math.max(6, 8 * this.uiScale);
  }
  /** Topmost shape under an image-space point (strokes are hit near the line, filled/boxed shapes inside). */
  hitShape(t, r) {
    const n = this.hitTolerance();
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const s = this.shapes[i];
      if (Lg(s, t, r, n, this)) return s;
    }
    return null;
  }
  /** Which handle of the selected shape is under the point, if any. */
  hitHandle(t, r) {
    if (!this.selected) return null;
    const n = this.handleSize() / 2 + this.hitTolerance() / 2;
    for (const i of this.handlesFor(this.selected)) if (Math.abs(t - i.x) <= n && Math.abs(r - i.y) <= n) return i.id;
    return null;
  }
  handleSize() {
    return Math.max(8, 10 * this.uiScale);
  }
  drawSelection(t, r) {
    var c, l;
    const n = this.shapeBounds(r);
    if (!n) return;
    const i = Math.max(4, 5 * this.uiScale), s = Math.max(1.5, 1.5 * this.uiScale);
    t.save(), (c = t.setLineDash) == null || c.call(t, [6 * this.uiScale, 4 * this.uiScale]), t.lineWidth = s + 2 * this.uiScale, t.strokeStyle = "rgba(255,255,255,.9)", t.strokeRect(n.x - i, n.y - i, n.w + i * 2, n.h + i * 2), t.lineWidth = s, t.strokeStyle = "#6366f1", t.strokeRect(n.x - i, n.y - i, n.w + i * 2, n.h + i * 2), (l = t.setLineDash) == null || l.call(t, []);
    const a = this.handleSize();
    for (const d of this.handlesFor(r))
      t.fillStyle = "#ffffff", t.fillRect(d.x - a / 2, d.y - a / 2, a, a), t.lineWidth = s, t.strokeStyle = "#6366f1", t.strokeRect(d.x - a / 2, d.y - a / 2, a, a);
    t.restore();
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
    t.clearRect(0, 0, this.canvas.width, this.canvas.height), t.drawImage(r, 0, 0), this.shapes.forEach((i) => this.drawShape(t, i)), n && this.drawShape(t, n), this.selected && this.shapes.includes(this.selected) && this.drawSelection(t, this.selected);
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
    const s = lo(r);
    t.lineWidth = n + this.haloPad(n), t.strokeStyle = s, i(), t.stroke(), t.lineWidth = n, t.strokeStyle = r, i(), t.stroke();
  }
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(r), t.lineCap = "round", t.lineJoin = "round", r.type === "pen") {
      const n = this.computeLineWidth(r);
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), r.points.forEach(
          (i, s) => s === 0 ? t.moveTo(i.x, i.y) : t.lineTo(i.x, i.y)
        );
      });
    } else if (r.type === "rect") {
      const n = this.computeLineWidth(r);
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = lo(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
    } else if (r.type === "arrow") {
      const n = this.computeLineWidth(r) * 1.7, i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), s = Math.max(16, n * 4);
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
      const n = this.computeLineWidth(r) * 1.7;
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2);
      });
    } else if (r.type === "circle") {
      const n = this.computeLineWidth(r);
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.ellipse(r.x, r.y, Math.abs(r.rx), Math.abs(r.ry), 0, 0, Math.PI * 2);
      });
    } else if (r.type === "count") {
      const n = this.countRadius(r);
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth(r)), t.strokeStyle = lo(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = ao((o) => Ii(t, o), r.text, a), l = s * 1.25, d = r.outline ?? "none";
      c.forEach((o, h) => {
        const u = i + h * l;
        d !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, s * 0.18), t.strokeStyle = d === "white" ? "#ffffff" : "#111111", t.strokeText(o, n, u)), t.fillStyle = r.color, t.fillText(o, n, u);
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
        let u = 0, p = 0, g = 0, f = 0;
        const y = Math.min(o + c, a), M = Math.min(h + c, s);
        for (let w = o; w < y; w++)
          for (let k = h; k < M; k++) {
            const L = (w * s + k) * 4;
            u += d[L], p += d[L + 1], g += d[L + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(u / f)},${Math.round(p / f)},${Math.round(g / f)})`, t.fillRect(n + h, i + o, M - h, y - o));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), a = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, ao((h) => Ii(r, h), t.text, a).length));
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
    const c = ao((u) => Ii(r, u), t.text, a);
    let l = 0;
    for (const u of c) l = Math.max(l, Ii(r, u));
    const d = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(d, c.length * d), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function Og(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function Ng(e, t, r, n) {
  return !e || !e.startsWith("data:image/") ? e || "" : !Array.isArray(t) || t.length === 0 || typeof document > "u" || typeof Image > "u" ? e : new Promise((i) => {
    try {
      const s = new Image();
      s.onload = () => {
        try {
          const a = s.naturalWidth || r || 1, c = s.naturalHeight || n || 1, l = document.createElement("canvas");
          l.width = a, l.height = c;
          const d = l.getContext("2d");
          if (!d) {
            i(e);
            return;
          }
          const o = new Ra(l, e);
          t.forEach((h) => o.shapes.push({ ...h })), d.drawImage(s, 0, 0), o.redraw(), o.save().then((h) => {
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
async function Pg(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: Xd }, i = {
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
    fileRefs: e.fileRefs,
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
const zg = 50, $g = 2e3, Dg = 1e3, Fg = 500, _c = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Oi(e, t) {
  e.push(t), e.length > zg && e.shift();
}
function Wa(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function co(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      _c.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => _c.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Wa(t, Dg);
}
function Ug(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Wa(JSON.stringify(e), Fg);
  } catch {
    return String(e);
  }
}
function Bg(e, t = {}) {
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
function qg(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, o) => {
    Oi(e.consoleErrors, { message: Wa(d, $g), stack: o, timestamp: Date.now(), level: l });
  }, s = window.onerror;
  if (window.onerror = (l, d, o, h, u) => {
    var p;
    if (n()) {
      const g = String(l);
      i("error", g, u == null ? void 0 : u.stack), (p = t.onError) == null || p.call(t, g, u == null ? void 0 : u.stack);
    }
    return typeof s == "function" ? s.call(window, l, d, o, h, u) : !1;
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
          n() && i(d, h.map(Ug).join(" "));
        } catch {
        }
        return o.apply(console, h);
      });
    }
  }
  const a = window.fetch;
  window.fetch = async (...l) => {
    var u;
    if (!n()) return a(...l);
    const d = Date.now(), o = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (u = l[1]) == null ? void 0 : u.method) || "GET";
    try {
      const p = await a(...l);
      return Oi(e.networkFailures, { url: co(o), status: p.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), p;
    } catch (p) {
      throw Oi(e.networkFailures, { url: co(o), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), p;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, d = c.prototype.send;
    c.prototype.open = function(o, h, ...u) {
      return this.__klav = { method: String(o || "GET").toUpperCase(), url: String(h || "") }, l.call(this, o, h, ...u);
    }, c.prototype.send = function(...o) {
      const h = this.__klav;
      if (h && n()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            Oi(e.networkFailures, {
              url: co(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: u,
              durationMs: Date.now() - u
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
const Wg = ["light", "dark", "glass", "neon", "custom", "liquid"], jg = ["hidden", "icon", "full", "custom"], Hg = ["lightbulb", "bug"], Yg = ["full", "reportOnly", "off"], Vg = /^#[0-9a-fA-F]{3,8}$/, Kg = /^[\w \-,'"().]+$/, Ic = (e) => typeof e == "object" && e !== null, Ni = (e) => typeof e == "string" && Vg.test(e.trim()) ? e.trim() : void 0, Pi = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Xg = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Kg.test(t) ? t : void 0;
}, Oc = {
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
function Nc(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Zd(e) {
  const t = Ic(e) ? e : {}, n = { theme: typeof t.theme == "string" && Wg.includes(t.theme) ? t.theme : "light" }, i = Ni(t.primary), s = Ni(t.secondary), a = Ni(t.background), c = Pi(t.thankYou, 140), l = Xg(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && jg.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = Pi(t.launcherText, 60);
  d && (n.launcherText = d);
  const o = Ni(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && Hg.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Yg.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Pi(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const u = Ic(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || u.whiteLabel === !0) && (n.whiteLabel = !0);
  const p = Pi(t.projectId, 200);
  return p && (n.projectId = p), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Gg(e) {
  const t = Zd(e), r = t.theme === "custom" ? { ...Oc.light } : { ...Oc[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Nc(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Nc(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function Jg(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function zi(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function Pc(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = Jg(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const kt = class kt {
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
    this._recording || !kt.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), kt.SESSION_MS), this._begin());
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
      if (i && i in kt.TERMINAL_ERRORS) {
        this.onError(i, kt.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > kt.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? kt.BENIGN_RESTART_MS : Math.min(kt.MAX_BACKOFF_MS, kt.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
kt.MAX_CONSEC_FAILURES = 6, kt.BASE_BACKOFF_MS = 400, kt.MAX_BACKOFF_MS = 8e3, kt.BENIGN_RESTART_MS = 250, kt.SESSION_MS = 18e4, kt.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let si = kt;
function Zg() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Qg = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Qd(e) {
  for (const t of Qg)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const zn = class zn {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Zg(), ...t.deps || {} };
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
    this._stream = t, this._mime = Qd(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), zn.MAX_SESSION_MS), this._beginSegment();
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
      }, zn.SEGMENT_MS);
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
zn.SEGMENT_MS = 2500, zn.MAX_SESSION_MS = 18e4;
let ns = zn;
function ey() {
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
const ct = class ct {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...ey(), ...t.deps || {} };
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
    this._stream = t, this._mime = Qd(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), ct.MAX_SESSION_MS), this._openSocket();
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
    }, ct.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= ct.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(ct.MAX_BACKOFF_MS, ct.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(ct.TIMESLICE_MS);
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
        this._recorder.start(ct.TIMESLICE_MS);
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
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, ct.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), ct.STOP_GRACE_MS);
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
ct.MAX_SESSION_MS = 18e4, ct.TIMESLICE_MS = 150, ct.CONNECT_TIMEOUT_MS = 4e3, ct.MAX_RECONNECTS = 3, ct.BASE_BACKOFF_MS = 500, ct.MAX_BACKOFF_MS = 4e3, ct.STOP_GRACE_MS = 2e3, ct.STOP_FLUSH_FALLBACK_MS = 1200;
let is = ct;
function ty(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function ot(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const ry = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function ny(e) {
  const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(i) {
      let s = i.parentElement;
      for (; s && s !== e; ) {
        if (ry.has(s.tagName)) return NodeFilter.FILTER_REJECT;
        s = s.parentElement;
      }
      return /\d/.test(i.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), r = [];
  let n;
  for (; n = t.nextNode(); ) r.push(n);
  return r;
}
function iy(e) {
  const t = [], r = window.innerWidth, n = window.innerHeight, i = (o) => !!(o.closest && o.closest("[data-klavity-ui], #klavity-widget-host")), s = (o, h) => {
    if (!h || typeof document.elementsFromPoint != "function") return !1;
    const u = Math.min(2, o.width / 4), p = Math.min(2, o.height / 4), g = [
      [o.left + o.width / 2, o.top + o.height / 2],
      [o.left + u, o.top + p],
      [o.left + o.width - u, o.top + p],
      [o.left + u, o.top + o.height - p],
      [o.left + o.width - u, o.top + o.height - p]
    ];
    for (const [f, y] of g) {
      if (f < 0 || y < 0 || f >= r || y >= n) return !1;
      let M = null;
      try {
        M = document.elementsFromPoint(f, y).find((w) => !i(w)) || null;
      } catch {
        return !1;
      }
      if (!M || M === h || h.contains(M) || M.contains(h)) return !1;
    }
    return !0;
  }, a = (o, h, u) => {
    !(o.width > 0 && o.height > 0) || s(o, u) || t.push(h ? { x: o.left, y: o.top, w: o.width, h: o.height, fixed: h } : { x: o.left, y: o.top, w: o.width, h: o.height });
  }, c = /* @__PURE__ */ new Map(), l = (o) => {
    if (!o || o === document.documentElement) return !1;
    const h = c.get(o);
    if (h !== void 0) return h;
    let u = !1;
    try {
      u = getComputedStyle(o).position === "fixed";
    } catch {
      u = !1;
    }
    return u || (u = l(o.parentElement)), c.set(o, u), u;
  };
  for (const o of ny(e)) {
    const h = l(o.parentElement), u = o.textContent ?? "", p = /\d+/g;
    let g;
    for (; g = p.exec(u); )
      try {
        const f = document.createRange();
        f.setStart(o, g.index), f.setEnd(o, g.index + g[0].length);
        const y = f.getClientRects ? f.getClientRects() : null;
        if (y) for (let M = 0; M < y.length; M++) a(y[M], h, o.parentElement);
      } catch {
      }
  }
  e.querySelectorAll("input, select").forEach((o) => {
    /\d/.test(o.value) && a(o.getBoundingClientRect(), l(o), o);
  });
  const d = document.documentElement;
  return {
    rects: t,
    vw: window.innerWidth,
    vh: window.innerHeight,
    sx: window.scrollX || 0,
    sy: window.scrollY || 0,
    dw: Math.max(d.scrollWidth, window.innerWidth),
    dh: Math.max(d.scrollHeight, window.innerHeight)
  };
}
function sy(e, t, r, n) {
  if (!(t > 0 && r > 0)) return null;
  const i = (g, f) => f > 0 && Math.abs(g - f) / f < 0.04;
  let s, a, c, l = !1;
  const d = (n == null ? void 0 : n.kind) === "region" || (n == null ? void 0 : n.kind) === "element" ? n.rect : void 0, o = t / r, h = i(o, e.vw / e.vh);
  if (d && d.w > 0 && d.h > 0)
    s = t / d.w, a = d.x, c = d.y;
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
  const u = 2 * s, p = [];
  for (const g of e.rects) {
    const f = l && g.fixed ? { x: g.x - e.sx, y: g.y - e.sy, w: g.w, h: g.h } : g, y = Math.max(0, (f.x - a) * s - u), M = Math.max(0, (f.y - c) * s - u), w = Math.min(t, (f.x - a + f.w) * s + u), k = Math.min(r, (f.y - c + f.h) * s + u);
    w > y && k > M && p.push({ x: y, y: M, w: w - y, h: k - M });
  }
  return p;
}
function oy(e, t) {
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
        for (const d of a) l.fillRect(d.x, d.y, d.w, d.h);
        r({ url: c.toDataURL("image/png"), rects: a });
      } catch {
        r(null);
      }
    }, n.onerror = () => r(null), n.src = e;
  });
}
const ep = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], ay = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, ly = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, cy = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, uy = /* @__PURE__ */ new Set([
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
]), dy = { needs: "Needs detail", good: "Good", great: "Great" };
function py(e) {
  let t = e;
  for (const r of ep) t = t.split(r).join(" ");
  return t;
}
function hy(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || uy.has(n) || r++;
  return r;
}
function tp(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = py(r), i = hy(n), s = t.length > 0 && ep.some((u) => r.includes(u)) && i < 3, a = i >= 3 && t.length >= 12, c = cy.test(r), l = ay.test(r) || ly.test(t), d = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: d, level: h, label: dy[h], vague: s };
}
function fy(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : tp(t).level !== "great";
}
const my = [
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
function gy(e) {
  const t = (e || "").toLowerCase();
  return t ? my.some((r) => t.includes(r)) : !1;
}
function rp(e) {
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
function np(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", rp(t.source)],
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
async function yy() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function by() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let ky = 0;
function vy(e) {
  const t = e.host || by(), r = "kl-shp-" + ++ky, n = document.createElement("div");
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
  const u = document.createElement("div");
  u.className = "kl-shp-prev";
  const p = document.createElement("div");
  p.className = "kl-shp-shot";
  const g = document.createElement("div");
  g.className = "kl-shp-cap";
  const f = document.createElement("span");
  f.className = "kl-shp-fav", f.textContent = (t[0] || "K").toUpperCase();
  const y = document.createElement("span");
  y.className = "kl-shp-rt", y.textContent = "This tab", g.append(f, y), u.append(p, g);
  const M = document.createElement("div");
  M.className = "kl-shp-foot";
  const w = document.createElement("span");
  w.className = "kl-shp-cancel", w.textContent = "Cancel", w.style.cursor = "pointer", w.addEventListener("click", (T) => {
    var P;
    T.stopPropagation(), n.classList.remove("kl-show");
    try {
      (P = e.onCancel) == null || P.call(e);
    } catch {
    }
  });
  const k = document.createElement("span");
  k.className = "kl-shp-allow", k.textContent = "Allow", M.append(w, k), l.append(d, u, M);
  const L = document.createElement("div");
  L.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const x = document.createElement("span");
  return x.textContent = e.steer, L.append(S, x), n.append(i, s, l, L), n;
}
const wy = 100 * 1024 * 1024, xy = 8 * 1024 * 1024, Sy = 110 * 1024 * 1024, zc = 5 * 1024 * 1024 * 1024, Ey = /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i;
function Cy(e) {
  return /^video\//i.test(e.type || "") ? !0 : (!e.type || e.type === "application/octet-stream") && Ey.test(e.name || "");
}
function ip(e) {
  return e.size > (Cy(e) ? wy : xy);
}
function My(e) {
  const t = [], r = [];
  for (const i of e || []) (ip(i) ? r : t).push(i);
  let n = t.reduce((i, s) => i + s.size, 0);
  for (; n > Sy && t.length; ) {
    let i = 0;
    for (let a = 1; a < t.length; a++) t[a].size > t[i].size && (i = a);
    const [s] = t.splice(i, 1);
    n -= s.size, r.push(s);
  }
  return { inline: t, large: r };
}
function Ry(e, t = {}, r = fetch) {
  const n = e.replace(/\/+$/, "");
  return async (i) => {
    const s = i.query ? "?" + new URLSearchParams(i.query).toString() : "", a = {};
    !t.firstParty && t.token && (a.authorization = "Bearer " + t.token);
    let c;
    i.bytes ? (a["content-type"] = "application/octet-stream", c = i.bytes) : i.json !== void 0 && (a["content-type"] = "application/json", c = JSON.stringify(i.json));
    const l = await r(n + i.path + s, { method: "POST", headers: a, body: c, ...t.firstParty ? { credentials: "include" } : {} });
    return { status: l.status, text: await l.text().catch(() => "") };
  };
}
class ii extends Error {
  constructor(t, r) {
    super(t), this.name = "LargeUploadError", this.retryable = r;
  }
}
function uo(e) {
  try {
    return JSON.parse(e.trim() || "{}");
  } catch {
    return {};
  }
}
const Ty = (e) => new Promise((t) => setTimeout(t, e)), $i = [1e3, 2e3, 4e3, 8e3, 15e3, 3e4];
async function Ay(e) {
  var t;
  if (e.blob) return e.blob;
  if (e.dataUrl) {
    const r = e.dataUrl.indexOf(","), n = e.dataUrl.slice(0, r), i = e.dataUrl.slice(r + 1), s = e.type || ((t = /data:([^;,]+)/.exec(n)) == null ? void 0 : t[1]) || "application/octet-stream";
    if (/;base64/i.test(n)) {
      const a = atob(i), c = new Uint8Array(a.length);
      for (let l = 0; l < a.length; l++) c[l] = a.charCodeAt(l);
      return new Blob([c], { type: s });
    }
    return new Blob([decodeURIComponent(i)], { type: s });
  }
  throw new ii(`"${e.name}" has no data to upload.`, !1);
}
async function Ly(e, t, r = {}) {
  var g;
  const n = r.sleep ?? Ty, i = await Ay(t), s = i.size, a = t.type || i.type || "application/octet-stream", c = async (f, y = [200]) => {
    let M = "";
    for (let w = 0; ; w++) {
      let k = null;
      try {
        k = await e(f);
      } catch (L) {
        M = String((L == null ? void 0 : L.message) || L);
      }
      if (k) {
        if (y.includes(k.status)) return k;
        const L = uo(k.text).error;
        if (!(k.status === 0 || k.status === 429 || k.status >= 500)) throw new ii(L || `Upload of "${t.name}" failed (${k.status}).`, k.status === 410);
        M = L || `HTTP ${k.status}`;
      }
      if (w >= $i.length) throw new ii(`Couldn't upload "${t.name}" — check your connection and try again. (${M})`, !0);
      await n($i[w]);
    }
  }, l = uo((await c({ path: "/api/uploads/start", json: { project_id: r.projectId || "", filename: t.name, content_type: a, size: s } })).text), d = String(l.token || ""), o = Number(l.chunk_bytes), h = Number(l.chunks);
  if (!d || !(o > 0) || !(h > 0)) throw new ii(`Upload of "${t.name}" could not start.`, !0);
  let u = 0;
  const p = async (f) => {
    const y = new Uint8Array(await i.slice(f * o, Math.min(s, (f + 1) * o)).arrayBuffer());
    return await c({ path: "/api/uploads/chunk", query: { token: d, n: String(f) }, bytes: y }), y.byteLength;
  };
  for (let f = 0; f < h; f++) {
    u += await p(f);
    try {
      (g = r.onProgress) == null || g.call(r, u, s);
    } catch {
    }
  }
  for (let f = 0; f < 4; f++) {
    const y = await c({ path: "/api/uploads/complete", json: { token: d } }, [200, 409]), M = uo(y.text);
    if (y.status === 200 && typeof M.ref == "string" && M.ref) return M.ref;
    if (y.status === 409 && Array.isArray(M.missing) && M.missing.length) {
      for (const w of M.missing) Number.isInteger(w) && w >= 0 && w < h && await p(w);
      continue;
    }
    await n($i[Math.min(f, $i.length - 1)]);
  }
  throw new ii(`Couldn't finish uploading "${t.name}". Please try again.`, !0);
}
async function _y(e, t, r = {}) {
  const { inline: n, large: i } = My(e);
  if (!i.length) return { inline: e ? e.slice() : [], refs: [] };
  const s = i.reduce((l, d) => l + d.size, 0);
  let a = 0;
  const c = [];
  for (const l of i)
    c.push(await Ly(t, l, { ...r, onProgress: (d) => {
      var o;
      return (o = r.onProgress) == null ? void 0 : o.call(r, a + d, s);
    } })), a += l.size;
  return { inline: n, refs: c };
}
const Iy = 1, Oy = 6, Ny = 1.08;
function Py(e, t = Iy, r = Oy) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function zy(e, t = Ny) {
  return e < 0 ? t : 1 / t;
}
function $y(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function sp(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Dy(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Fy(e, t, r, n, i, s) {
  const a = sp(t, i) * n, c = (p) => Math.min(i, Math.max(0, p)), l = (p) => Math.min(s, Math.max(0, p)), d = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, u = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: d, y: h, w: Math.max(0, o - d), h: Math.max(0, u - h) };
}
function Uy(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function By(e, t, r, n, i, s) {
  const a = sp(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function qy(e) {
  return np("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || rp()
  });
}
function Wy(e) {
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
function jy(e, t, r) {
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
function Te(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function $c(e) {
  let t = Te(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function po(e) {
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
const Ta = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function Hy(e) {
  var t;
  return ((t = Ta.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function Yy(e) {
  const t = (a) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(a) || /^\s*()(\d+)\s*$/.exec(a);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, s = n ? t(n) : null;
  return { startSec: i, endSec: i != null && s != null && s <= i ? null : s };
}
function Vy(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function op(e, t, r = 960, n = 6e3) {
  return new Promise((i) => {
    let s = !1;
    const a = document.createElement("video"), c = (d) => {
      if (!s) {
        s = !0, clearTimeout(l);
        try {
          a.removeAttribute("src"), a.load();
        } catch {
        }
        i(d);
      }
    }, l = setTimeout(() => c(null), n);
    a.muted = !0, a.preload = "auto", a.setAttribute("playsinline", ""), a.onerror = () => c(null), a.onloadedmetadata = () => {
      const d = isFinite(a.duration) && a.duration > 0 ? a.duration : t + 1;
      try {
        a.currentTime = Math.max(0, Math.min(t, d - 0.1));
      } catch {
        c(null);
      }
    }, a.onseeked = () => {
      try {
        const d = a.videoWidth, o = a.videoHeight;
        if (!d || !o) return c(null);
        const h = Math.min(1, r / d), u = document.createElement("canvas");
        u.width = Math.round(d * h), u.height = Math.round(o * h);
        const p = u.getContext("2d");
        if (!p) return c(null);
        p.drawImage(a, 0, 0, u.width, u.height), c(u.toDataURL("image/jpeg", 0.82));
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
const Ky = 8;
function Xy(e, t = Ky) {
  const r = Number(e);
  if (!isFinite(r) || r <= 0) return [];
  const n = Math.max(2, Math.min(t, Math.ceil(r / 10)));
  return Array.from({ length: n }, (i, s) => Math.round((s + 0.5) * r / n * 10) / 10);
}
async function Gy(e, t) {
  const r = [];
  for (const n of Xy(t)) {
    const i = await op(e, n, 768, 4e3);
    if (!i) break;
    r.push({ atSec: n, dataUrl: i });
  }
  return r;
}
function Dc(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : ap({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function Aa(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function Fc(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = Aa(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${s ? ` Related: ${s}.` : ""}`;
}
function ap(e) {
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
function Jy(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const Zy = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function Qy(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return Zy.test(r) ? r : "";
  } catch {
    return "";
  }
}
function ho(e, t) {
  return Qy(t) || Jy(e);
}
function fo(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Qt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function Uc(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function eb(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const tb = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function La(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function rb(e) {
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
const nb = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", ib = 100, sb = ib * 1024 * 1024;
function ob(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function en(e) {
  return La(e) ? "video" : ob(e) ? "image" : "file";
}
function ab(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function Di(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function lb(e, t, r = {}) {
  var rc, nc, ic, sc, oc;
  const n = Zd(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, d = [], o = [], h = [], u = null, p = [], g = !1, f = !1, y = !1, M = !1;
  const w = !!t.onMinimize, k = w ? 8 : 5, L = 3e4, S = 10 * 1024 * 1024, x = !!t.allowFileAttachments, T = 5, P = !!t.largeFileUploads && !(t.maxFileBytes && t.maxFileBytes > 0), $ = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : P ? zc : sb, z = t.reporterRole ?? "anon", re = t.upgradeUrl, K = P ? zc * T : Math.max(120 * 1024 * 1024, $ + 20 * 1024 * 1024);
  let _ = Array.isArray(t.initialFiles) ? t.initialFiles.filter(Boolean) : [], ze = _.slice();
  const Ve = /* @__PURE__ */ new WeakMap(), fe = () => typeof URL < "u" && typeof URL.createObjectURL == "function", he = (m) => Ve.get(m) || m.dataUrl, Ae = (m) => {
    const b = Ve.get(m);
    if (b) {
      try {
        URL.revokeObjectURL(b);
      } catch {
      }
      Ve.delete(m);
    }
  };
  for (const m of _)
    if (m.blob && fe())
      try {
        Ve.set(m, URL.createObjectURL(m.blob));
      } catch {
      }
  let Fe = null;
  const Oe = !!(t.allowRecording && t.onRecord), me = Oe && !!t.onSplitRecording, nt = ty({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: ns.isSupported(),
    webSpeechSupported: si.isSupported()
  }), U = nt !== "none", Z = 2;
  let V = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], He = V.map((m) => m.id || m.dataUrl).join("|");
  const ue = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, se = {}, Je = /* @__PURE__ */ new Map(), mt = /* @__PURE__ */ new Map(), oe = /* @__PURE__ */ new Map(), $e = /* @__PURE__ */ new Map();
  let we = 0, de = null;
  const tt = () => {
    const m = Object.keys(se);
    if (!m.length && !de) return null;
    const b = {};
    if (m.length) {
      const v = {};
      for (const E of m) v[E] = se[E];
      const R = se[0] ?? se[Number(m[0])] ?? {};
      Object.assign(b, R, { byIndex: v });
    }
    return de && (b.selector = de.selector, b.selectorText = de.text), b;
  };
  let ge = e, Le = 0, Ke = null, Se = null, $t = null, jn = t.replayState === "attached", or = null, jr = null, We = "idle", Ze = null, pe = null, xt = null, Lt = !1, gr = "", St = 0, De = null, ae = !1, Ce = "", Ue = null, at = null, Xe = null, _t = null, Ge = !1;
  const gn = [];
  function yn(m) {
    if (typeof window > "u") return;
    const b = () => {
      Ge || m();
    };
    window.addEventListener("beforeunload", b), window.addEventListener("pagehide", b), gn.push(() => {
      window.removeEventListener("beforeunload", b), window.removeEventListener("pagehide", b);
    });
  }
  const Hn = 4e3, Eh = 5e3, lt = {}, gt = {}, Yn = (m) => m ? JSON.parse(JSON.stringify(m)) : null, Hr = (m) => {
    var b;
    try {
      (b = t.onAnnotationsChanged) == null || b.call(t, m, Yn(se[m]));
    } catch {
    }
  }, Ch = () => {
    const m = {};
    for (const b of Object.keys(se)) {
      const v = se[b];
      v && (m[Number(b)] = Yn(v));
    }
    return m;
  }, Vn = (m) => ({
    url: c[m],
    compressed: d[m],
    ann: Yn(se[m])
  }), It = {}, Mr = (m) => {
    Ls(m, Vn(m));
  }, Ls = (m, b) => {
    (lt[m] ?? (lt[m] = [])).push(b), delete It[m];
  }, _s = (m, b) => {
    const v = i ? $e.get(b.url) : oe.get(b.url);
    v ? (c[m] = v, d[m] = t.compressImage ? t.compressImage(v) : Promise.resolve(v)) : (c[m] = b.url, d[m] = b.compressed), b.ann ? se[m] = Yn(b.ann) : delete se[m];
  }, yl = (m) => {
    const b = lt[m];
    if (!b || !b.length) return !1;
    const v = b.pop(), R = gt[m];
    let E = !1;
    for (; R && R.length && R[R.length - 1].mark >= b.length; )
      R.pop(), E = !0;
    return (It[m] ?? (It[m] = [])).push({ snap: Vn(m), cropped: E }), _s(m, v), Hr(m), Me(), !0;
  }, bl = (m) => {
    const b = It[m];
    if (!b || !b.length) return !1;
    const { snap: v, cropped: R } = b.pop(), E = Vn(m);
    return (lt[m] ?? (lt[m] = [])).push(E), R && (gt[m] ?? (gt[m] = [])).push({ snap: E, mark: lt[m].length - 1 }), _s(m, v), Hr(m), Me(), !0;
  }, kl = (m) => {
    var b;
    return !!((b = lt[m]) != null && b.length);
  }, vl = (m) => {
    var b;
    return !!((b = It[m]) != null && b.length);
  }, Mh = (m) => {
    const b = gt[m];
    if (!b || !b.length) return !1;
    const { snap: v, mark: R } = b.pop();
    return lt[m] && (lt[m].length = Math.min(lt[m].length, R)), delete It[m], _s(m, v), Hr(m), Me(), !0;
  }, wl = document.createElement("style");
  wl.textContent = `
    ${Gg(n)}
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
    /* Annotation tools are larger (20px glyph, 46px target) so they're easy to tell apart and select. */
    .kl-htool{min-width:46px;height:46px;gap:2px;border-radius:10px;}
    .kl-htool .kl-hk{font-size:9.5px;}
    /* Undo / Redo (top-right): glyph + label; dimmed when there is nothing to undo / redo. */
    .kl-hhist{gap:4px;}
    .kl-htbtn.kl-hhistbtn{min-width:46px;height:42px;gap:2px;}
    .kl-htbtn.kl-hhistbtn .kl-hk{font-size:9px;font-weight:700;opacity:.7;}
    .kl-htbtn:disabled{opacity:.35;cursor:default;transform:none;background:transparent;}
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
    /* Forces a new toolbar row: tools + Undo/Redo/Clear on top, colours / stroke / zoom below. */
    .kl-hbreak{flex-basis:100%;height:0;}
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
    /* KD-3087: fill-mode BOTH kept kl-rise's final opacity:1 applied forever, overriding .klavity-submit:disabled
       {opacity:.5} -- a disabled Submit looked fully clickable. BACKWARDS still hides it during the delay, then
       hands opacity back to the normal cascade once the entrance ends. */
    .kl-side>.klavity-submit{animation-fill-mode:backwards}
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
  `, a.appendChild(wl);
  const Yr = document.createElement("div");
  Yr.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${w ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${Q("x", { size: 16 })}</button>
    <div class="kl-side-head" id="klavity-side-head" aria-hidden="true">New report</div>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${Q("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${ue ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${ue.map((m) => `<button type="button" class="kl-type-chip${m.value === e ? " active" : ""}" data-kind="${Te(m.value)}" role="radio" aria-checked="${m.value === e ? "true" : "false"}">${Te(m.label)}${m.mappingLabel ? `<span class="kl-type-map">${Te(m.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${Q("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${Q("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      ${me ? `<div class="kl-multi" id="klavity-multi">
        <div class="kl-multi-head"><span class="kl-multi-ic">${Q("monitor", { size: 18 })}</span><span class="kl-multi-name">Report Multiple Issues</span><span class="kl-multi-badge">${Q("sparkles", { size: 10 })} AI Powered</span></div>
        <p class="kl-multi-copy">Record your screen with voice narration. AI will analyse it, identify multiple issues and create separate tickets for you.</p>
        <button type="button" class="kl-multi-start" id="klavity-multi-start"></button>
        <p class="kl-multi-status" id="klavity-multi-status" role="status" aria-live="polite" hidden></p>
      </div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${Q("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${Q("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${Q(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${Oe ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${Q("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${Q("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${Q("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? nb : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${$ >= 1024 * 1024 * 1024 ? Math.round($ / 1024 / 1024 / 1024) + "GB" : Math.round($ / 1024 / 1024) + "MB"} each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${k} images</div>
        ${U ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${Q("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${x ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${Q("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${Q("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${Q("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${Q("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
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
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${Q("check", { size: 13 })}</span>
        </button>
        <div class="klavity-remail-sugg-hint" id="klavity-remail-sugg-hint">Add it as a contact so the team can reply and tag you. Contacts don't get project access.</div>
      </div>
      
      </div>
      ${U ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${Te(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${Q("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, Yr.appendChild(le), a.appendChild(Yr);
  const Ne = a.getElementById("klavity-sharp"), xl = a.querySelector(".klavity-info-pop");
  if (Ne && xl) {
    const m = document.createElement("div");
    m.className = "kl-float-tip", m.setAttribute("role", "tooltip"), m.innerHTML = xl.innerHTML, a.appendChild(m);
    const b = vy({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    b.style.position = "fixed", a.appendChild(b);
    let v = !1;
    yy().then((A) => {
      v = A;
    }).catch(() => {
    });
    const R = (A, N) => {
      const O = Ne.getBoundingClientRect(), F = Math.min(N, window.innerWidth - 16), D = 8, B = window.innerWidth, X = window.innerHeight;
      A.style.left = Math.max(D, Math.min(O.left + O.width / 2 - F / 2, B - F - D)) + "px", A.style.top = "-9999px", A.style.visibility = "hidden", A.style.display = "block";
      const j = A.offsetHeight;
      A.style.display = "";
      let Y = O.bottom + 8;
      Y + j + D > X && (Y = O.top - j - 8), A.style.top = Math.max(D, Math.min(Y, X - j - D)) + "px", A.style.visibility = "";
    }, E = () => {
      !t.snapWithoutSharePrompt && !M && !v ? (m.classList.remove("kl-show"), R(b, 288), b.classList.add("kl-show")) : (b.classList.remove("kl-show"), R(m, 228), m.classList.add("kl-show"));
    }, C = () => {
      m.classList.remove("kl-show"), b.classList.remove("kl-show");
    };
    Ne.addEventListener("mouseenter", E), Ne.addEventListener("mouseleave", C), Ne.addEventListener("focus", E), Ne.addEventListener("blur", C);
  }
  let Sl = !1, bn = null;
  function Is() {
    try {
      bn == null || bn.remove();
    } catch {
    }
    bn = null;
    try {
      Ne == null || Ne.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Rh() {
    var C;
    if (Sl || !Ne || Ge) return;
    Sl = !0;
    const m = document.createElement("div");
    m.className = "kl-float-tip kl-nudge", m.setAttribute("role", "status"), m.setAttribute("aria-live", "polite"), m.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${Q("x", { size: 13 })}</button></div>`, a.appendChild(m), bn = m, m.style.visibility = "hidden", m.style.left = "-9999px", m.style.top = "-9999px", m.style.display = "block";
    const b = 8, v = Math.min(228, window.innerWidth - 16);
    let R = 0;
    const E = () => {
      if (!bn || Ge) return;
      const A = Ne.getBoundingClientRect();
      if ((A.width === 0 || A.height === 0) && R++ < 20) {
        requestAnimationFrame(E);
        return;
      }
      const N = window.innerWidth, O = window.innerHeight;
      m.style.visibility = "hidden", m.style.display = "block";
      const F = m.offsetHeight;
      m.style.left = Math.max(b, Math.min(A.right - v, N - v - b)) + "px";
      let D = A.bottom + 8;
      D + F + b > O && (D = A.top - F - 8), m.style.top = Math.max(b, Math.min(D, O - F - b)) + "px", m.style.visibility = "", m.classList.add("kl-show");
    };
    requestAnimationFrame(E), (C = m.querySelector(".kl-nudge-x")) == null || C.addEventListener("click", Is);
    try {
      Ne.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Is(), 9e3);
    } catch {
    }
    Ne.addEventListener("click", Is, { once: !0 });
  }
  function Th(m) {
    jn = m === "attached", pt();
  }
  const El = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (m, b, v, R, E, C, A) => qt(m, b, v, !1, !!R, E, C, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (m, b, v, R, E) => qt(m, b, v, !0, !!R, E),
    close: yr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: Ch,
    setReplayState: Th,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (m) => {
      if (Fe = Di(m), !Ge)
        try {
          Me(), wi();
        } catch {
        }
    },
    addRecording: (m) => {
      if (!m || Ge) return;
      const b = V.findIndex((v) => v.id && m.id && v.id === m.id || v.dataUrl && m.dataUrl && v.dataUrl === m.dataUrl);
      b >= 0 ? (V[b] = m, Se = b) : (V.push(m), Se = V.length - 1), Ke = null, kn();
    }
  };
  function Me() {
    const m = a.getElementById("klavity-strip"), b = a.getElementById("klavity-counter");
    m.innerHTML = "", c.forEach((v, R) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb", R === Le && E.classList.add("kl-thumb-active");
      const C = document.createElement("img");
      C.src = v, C.title = "Click to select + mark up", C.addEventListener("load", () => {
        C.naturalHeight > C.naturalWidth * 1.4 && E.classList.add("kl-tall");
      }, { once: !0 }), C.addEventListener("click", () => {
        Le = R, Ke = null, Se = null, Me();
      });
      const A = document.createElement("button");
      A.className = "klavity-rm", A.innerHTML = Q("x", { size: 13 }), A.title = "Remove", A.addEventListener("click", (D) => {
        D.stopPropagation(), Cl(R), Me();
      });
      const N = document.createElement("button");
      N.className = "klavity-mk", N.innerHTML = Q("pencil", { size: 13 }), N.title = "Mark up", N.addEventListener("click", (D) => {
        D.stopPropagation(), lf(R);
      });
      const O = document.createElement("div");
      O.className = "klavity-thumb-media", O.append(C, A, N), E.append(O);
      const F = o[R];
      if (F) {
        const D = tb[F], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + F, B.title = F === "real-pixel" ? "Pixel-perfect capture (every image included)" : F === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', B.innerHTML = Q(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Te(D.label) + "</span>", O.appendChild(B), D.degraded && t.onRetakeSharp) {
          const X = document.createElement("button");
          X.type = "button", X.className = "klavity-retake", X.innerHTML = Q("zap", { size: 11 }) + "<span>Retake sharp</span>", X.title = "Recapture this shot at full pixel quality", X.addEventListener("click", (j) => {
            j.stopPropagation(), Lh(R, X);
          }), E.appendChild(X);
        }
      }
      if (_l.has(R)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", E.appendChild(D);
      }
      m.appendChild(E);
    }), _.forEach((v, R) => {
      if (en(v) !== "video") return;
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb", Ke === R && E.classList.add("kl-thumb-active");
      const C = document.createElement("video");
      C.src = he(v), C.muted = !0, C.preload = "metadata", C.setAttribute("playsinline", ""), C.tabIndex = -1;
      const A = document.createElement("span");
      A.className = "kl-video-play", A.setAttribute("aria-hidden", "true"), A.innerHTML = Q("play", { size: 16 });
      const N = document.createElement("span");
      N.className = "kl-video-badge", N.innerHTML = Q("play", { size: 9 }) + "<span>Video</span>", E.title = "Click to play " + v.name, E.addEventListener("click", () => {
        Ke = R, Se = null, Me();
      });
      const O = document.createElement("button");
      O.className = "klavity-rm", O.innerHTML = Q("x", { size: 13 }), O.title = "Remove", O.addEventListener("click", (D) => {
        D.stopPropagation(), Ol(R);
      }), E.append(C, A, N, O);
      const F = Di(Fe);
      if (F != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = F + "%", D.appendChild(B), E.appendChild(D);
      }
      m.appendChild(E);
    }), V.forEach((v, R) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb kl-rec-tile", Se === R && E.classList.add("kl-thumb-active");
      const C = document.createElement("video");
      let A = v.dataUrl;
      v.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (A = v._previewUrl || (v._previewUrl = URL.createObjectURL(v.blob))), C.src = A, C.muted = !0, C.preload = "metadata", C.setAttribute("playsinline", ""), C.tabIndex = -1;
      const N = document.createElement("span");
      N.className = "kl-video-play", N.setAttribute("aria-hidden", "true"), N.innerHTML = Q("play", { size: 16 });
      const O = Math.round(v.durationMs / 1e3), F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = Q("play", { size: 9 }) + `<span>${Math.floor(O / 60)}:${String(O % 60).padStart(2, "0")}${v.screenOnly ? " · screen" : ""}</span>`, E.title = "Click to play your recording", E.addEventListener("click", () => {
        Se = R, Ke = null, Me();
      });
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-rerec", D.innerHTML = Q("refresh-cw", { size: 12 }), D.title = "Re-record", D.setAttribute("aria-label", "Re-record"), D.addEventListener("click", (j) => {
        var W;
        j.stopPropagation();
        const Y = V.splice(R, 1)[0];
        if (Y && Y._previewUrl)
          try {
            URL.revokeObjectURL(Y._previewUrl);
          } catch {
          }
        Se === R ? Se = null : Se != null && Se > R && (Se -= 1), kn();
        try {
          (W = a.getElementById("klavity-record")) == null || W.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = Q("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (j) => {
        j.stopPropagation();
        const Y = V.splice(R, 1)[0];
        if (Y && Y._previewUrl)
          try {
            URL.revokeObjectURL(Y._previewUrl);
          } catch {
          }
        Se === R ? Se = null : Se != null && Se > R && (Se -= 1), kn();
      }), E.append(C, N, F, D, B);
      const X = Di(Fe);
      if (X != null) {
        const j = document.createElement("div");
        j.className = "kl-att-prog";
        const Y = document.createElement("i");
        Y.style.width = X + "%", j.appendChild(Y), E.appendChild(j);
      }
      m.appendChild(E);
    });
    try {
      const v = m.children[Le];
      v && typeof v.scrollIntoView == "function" && v.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const v = document.createElement("div");
      v.className = "kl-thumb-skel kl-loading", v.setAttribute("role", "status"), v.setAttribute("aria-label", "Capturing screenshot"), v.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', m.appendChild(v);
    }
    b.textContent = `${c.length}/${k} images`, b instanceof HTMLElement && (b.hidden = c.length === 0), pt(), vi(), ec();
  }
  function vi() {
    const m = a.getElementById("klavity-sharphint");
    if (!m) return;
    if (c.length > 0 && Le >= 0 && Le < c.length && !!h[Le] && !g && !!t.onCaptureSharp && !Wt) {
      if (!m.dataset.built) {
        m.dataset.built = "1", m.innerHTML = "";
        const R = document.createElement("span");
        R.className = "kl-sh-ic", R.innerHTML = Q("triangle-alert", { size: 15 });
        const E = document.createElement("span");
        E.className = "kl-sh-txt", E.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const C = document.createElement("button");
        C.type = "button", C.className = "kl-sh-use", C.textContent = "Use Snap", C.addEventListener("click", () => {
          g = !0, vi(), Ne == null || Ne.click();
        });
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-x", A.setAttribute("aria-label", "Dismiss"), A.title = "Dismiss", A.innerHTML = Q("x", { size: 12 }), A.addEventListener("click", () => {
          g = !0, vi();
        }), m.append(R, E, C, A);
      }
      m.hidden = !1, Ne == null || Ne.classList.add("kl-suggest");
    } else
      m.hidden = !0, Ne == null || Ne.classList.remove("kl-suggest");
  }
  function Os() {
    f = !0, l = !1, Me();
  }
  function Ah() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Kt(m) {
    const b = a.getElementById("klavity-err");
    b && (b.textContent = m, b.style.display = "block");
  }
  function Ns() {
    const m = a.getElementById("klavity-err");
    m && (m.style.display = "none");
  }
  function Cl(m) {
    var b;
    if (!(m < 0 || m >= c.length)) {
      c.splice(m, 1), d.splice(m, 1), o.splice(m, 1), h.splice(m, 1), p.splice(m, 1), delete se[m];
      for (const v of Object.keys(se).map(Number).filter((R) => R > m).sort((R, E) => R - E))
        se[v - 1] = se[v], delete se[v];
      try {
        (b = t.onShotRemoved) == null || b.call(t, m);
      } catch {
      }
      delete lt[m], delete gt[m], delete It[m];
      for (const v of Object.keys(lt).map(Number).filter((R) => R > m).sort((R, E) => R - E))
        lt[v - 1] = lt[v], delete lt[v];
      for (const v of Object.keys(It).map(Number).filter((R) => R > m).sort((R, E) => R - E))
        It[v - 1] = It[v], delete It[v];
      for (const v of Object.keys(gt).map(Number).filter((R) => R > m).sort((R, E) => R - E))
        gt[v - 1] = gt[v], delete gt[v];
      c.length === 0 && ar(null);
    }
  }
  function qt(m, b, v, R = !0, E = !1, C, A, N) {
    var F;
    if (c.length >= k) {
      Kt(`You can attach up to ${k} images.`);
      return;
    }
    Ns(), y = !1, f = !1, c.push(m);
    const O = c.length - 1;
    if (A && Array.isArray(A.shapes) && A.shapes.length && (se[O] = Yn(A)), d.push(t.compressImage ? t.compressImage(m) : Promise.resolve(m)), o.push(b), h.push(E && b !== "real-pixel"), p.push(C), R && (Le = c.length - 1, Ke = null, Se = null), Me(), N && N.geo && Array.isArray(N.geo.rects) && !Je.has(m) && (Je.set(m, { geo: N.geo, capture: N.capture }), i && !R && Rl()), R)
      try {
        (F = t.onShotAdded) == null || F.call(t, m, b, Je.get(m));
      } catch {
      }
  }
  function Vr() {
    return { restore: null, geo: null };
  }
  function Kr(m, b, v) {
    if (m) {
      try {
        const R = iy(document.body);
        R.rects.length && Je.set(m, { geo: R, capture: v });
      } catch {
      }
      i && Rl();
    }
  }
  let Ps = Promise.resolve(), Kn = 0;
  function Ml(m) {
    Kn++, Ps = m.then(() => {
      Kn--;
    }, () => {
      Kn--;
    });
  }
  function Rl() {
    Ml(new Promise((m) => setTimeout(() => {
      Ll().then(m, m);
    }, 0)));
  }
  function Tl(m, b, v) {
    const R = mt.get(m);
    if (R) return R;
    const E = Je.get(m);
    if (!E) return null;
    const C = sy(E.geo, b, v, E.capture);
    return C && mt.set(m, C), C;
  }
  function Al(m, b) {
    var v;
    c[m] = b, d[m] = t.compressImage ? t.compressImage(b) : Promise.resolve(b), Me();
    try {
      (v = t.onShotReplaced) == null || v.call(t, m, b, o[m]);
    } catch {
    }
  }
  async function Ll() {
    const m = ++we;
    for (let b = 0; b < c.length; b++) {
      const v = c[b];
      if (!v) continue;
      if (!i) {
        const C = oe.get(v);
        C && Al(b, C);
        continue;
      }
      if (oe.has(v)) continue;
      let R = $e.get(v);
      if (!R) {
        const C = await oy(v, (A, N) => Tl(v, A, N));
        if (!C) continue;
        R = C.url, $e.set(v, R), oe.set(R, v), mt.set(R, C.rects);
      }
      if (m !== we) return;
      const E = c.indexOf(v);
      E >= 0 && Al(E, R);
    }
  }
  const _l = /* @__PURE__ */ new Set();
  async function Lh(m, b) {
    if (!(Wt || !t.onRetakeSharp)) {
      ft(!0), b.classList.add("kl-loading"), s.style.display = "none";
      try {
        const { restore: v, geo: R } = Vr();
        let E;
        try {
          E = await t.onRetakeSharp(p[m]);
        } finally {
          v == null || v();
        }
        if (E) {
          const { dataUrl: C, quality: A } = Qt(E);
          Kr(C, R, p[m]), C && (c[m] = C, d[m] = t.compressImage ? t.compressImage(C) : Promise.resolve(C), o[m] = A ?? "real-pixel", h[m] = !1, se[m] && (delete se[m], _l.add(m), Hr(m)), delete lt[m], delete gt[m], delete It[m]);
        }
      } catch {
      } finally {
        s.style.display = "", ft(!1), Me();
      }
    }
  }
  function Il(m) {
    return m.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(m.name);
  }
  async function zs(m) {
    Ns();
    for (const b of m) {
      if (c.length >= k) {
        Kt(`You can attach up to ${k} images.`);
        break;
      }
      if (!Il(b)) {
        Kt(`"${b.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (b.size > S) {
        Kt(`"${b.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        qt(await Bc(b));
      } catch {
        Kt(`Couldn't add "${b.name}". Please try a different image.`);
      }
    }
  }
  function wi() {
    const m = a.getElementById("klavity-files");
    if (!m) return;
    m.innerHTML = "";
    const b = _.filter((v) => en(v) === "file");
    m.hidden = b.length === 0, _.forEach((v, R) => {
      if (en(v) !== "file") return;
      const E = document.createElement("div");
      E.className = "kl-file-chip";
      const C = document.createElement("span");
      C.className = "kl-file-ic", C.innerHTML = Q("file-text", { size: 14 });
      const A = document.createElement("span");
      A.className = "kl-file-nm", A.textContent = v.name, A.title = v.name;
      const N = document.createElement("span");
      N.className = "kl-file-sz", N.textContent = v.size < 1024 ? `${v.size} B` : v.size < 1024 * 1024 ? `${Math.round(v.size / 1024)} KB` : `${(v.size / 1024 / 1024).toFixed(1)} MB`;
      const O = document.createElement("button");
      O.type = "button", O.className = "kl-file-rm", O.setAttribute("aria-label", `Remove ${v.name}`), O.title = "Remove", O.innerHTML = Q("x", { size: 11 }), O.addEventListener("click", () => {
        Ol(R);
      }), E.append(C, A, N, O);
      const F = Di(Fe);
      if (F != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = F + "%", D.appendChild(B), E.appendChild(D);
      }
      m.appendChild(E);
    }), pt(), _h();
  }
  function _h() {
    var m;
    if (!Ge && !(ze.length === _.length && ze.every((b, v) => b === _[v]))) {
      ze = _.slice();
      try {
        (m = t.onFilesChange) == null || m.call(t, _.slice());
      } catch {
      }
    }
  }
  function Ol(m) {
    const b = _[m] && en(_[m]) === "video";
    _[m] && Ae(_[m]), _.splice(m, 1), Ke != null && (b && Ke === m ? Ke = null : Ke > m && (Ke -= 1)), wi(), Me();
  }
  function Ih(m, b) {
    if (m.kind === "upgrade") {
      if (!m.url) return null;
      const R = document.createElement("a");
      return R.className = "kl-capmsg-cta", R.href = m.url, R.target = "_blank", R.rel = "noopener noreferrer", R.textContent = m.label, R;
    }
    if (!t.onRequestUpgrade) return null;
    const v = document.createElement("button");
    return v.type = "button", v.className = "kl-capmsg-cta kl-capmsg-req", v.textContent = m.label, v.addEventListener("click", async () => {
      if (v.disabled) return;
      const R = v.textContent || m.label;
      v.disabled = !0, v.textContent = "Requesting…";
      let E = !1;
      try {
        E = await t.onRequestUpgrade({ reason: m.reason || "upgrade", context: b });
      } catch {
        E = !1;
      }
      if (E) {
        const C = document.createElement("span");
        C.className = "kl-capmsg-sent", C.innerHTML = `<span class="kl-capmsg-sent-ic">${Q("check")}</span>Request sent to your team`, v.replaceWith(C);
      } else
        v.disabled = !1, v.textContent = R;
    }), v;
  }
  function Oh(m, b) {
    const v = a.getElementById("klavity-capmsg");
    if (!v || !m.overCap) return;
    v.innerHTML = "";
    const R = document.createElement("span");
    if (R.className = "kl-capmsg-t", R.textContent = m.message || "", v.appendChild(R), m.cta) {
      const E = Ih(m.cta, b);
      if (E && v.appendChild(E), m.cta.hint) {
        const C = document.createElement("span");
        C.className = "kl-capmsg-hint", C.textContent = m.cta.hint, v.appendChild(C);
      }
    }
    v.hidden = !1;
  }
  function Nh() {
    const m = a.getElementById("klavity-capmsg");
    m && (m.hidden = !0, m.innerHTML = "");
  }
  async function Ph(m) {
    Ns(), Nh();
    for (const b of m) {
      if (Il(b)) {
        await zs([b]);
        continue;
      }
      if (_.length >= T) {
        Kt(`You can attach up to ${T} files.`);
        break;
      }
      const v = ab(b, { capBytes: $, role: z, upgradeUrl: re });
      if (v.overCap) {
        Oh(v, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: b.name, sizeMb: Math.round(b.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (_.reduce((E, C) => E + C.size, 0) + b.size > K) {
        Kt(`Attachments exceed the ${Math.round(K / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const E = b.type || (La(b) ? rb(b.name) : ""), C = La(b) && fe() || P && ip(b), A = C ? { name: b.name, type: E, size: b.size, dataUrl: "", blob: b } : { name: b.name, type: E, size: b.size, dataUrl: await Bc(b) };
        if (C)
          try {
            Ve.set(A, URL.createObjectURL(b));
          } catch {
          }
        const N = _.push(A) - 1;
        wi(), en(_[N]) === "video" && (Ke = N), Me();
      } catch {
        Kt(`Couldn't add "${b.name}". Please try a different file.`);
      }
    }
  }
  function kn() {
    Ge || (Me(), pt(), Bh(), zh());
  }
  function zh() {
    var b;
    const m = V.map((v) => v.id || v.dataUrl).join("|");
    if (m !== He) {
      He = m;
      try {
        (b = t.onRecordingsChange) == null || b.call(t, V.slice());
      } catch {
      }
    }
  }
  let $s = "";
  function Nl() {
    if (We !== "done" || !pe || !pe.length || !Ze || !Ze.id || Xe) return null;
    const m = (b) => {
      const { thumb: v, enhancing: R, ...E } = b;
      return { ...E, ...R ? { pendingEnhance: !0 } : {} };
    };
    return JSON.parse(JSON.stringify({
      recordingId: Ze.id,
      items: pe.map(m),
      original: xt ? xt.map(m) : null,
      ...De ? { reviewOpen: !0 } : {}
    }));
  }
  let Ds = !1;
  function Fs() {
    if (Ge || Ds || !t.onMultiIssuesChange) return;
    const m = Nl(), b = m ? JSON.stringify(m) : "";
    if (b !== $s) {
      $s = b;
      try {
        t.onMultiIssuesChange(m);
      } catch {
      }
    }
  }
  function $h(m) {
    const b = V.find((C) => C.id === m.recordingId);
    if (!b || !Array.isArray(m.items) || !m.items.length || We !== "idle") return;
    const v = ++St, R = (C) => {
      const { pendingEnhance: A, ...N } = C;
      return { ...N, thumb: null };
    };
    Ze = b, pe = m.items.map(R), xt = (m.original && m.original.length ? m.original : m.items).map(R), Lt = !1, Xe = null, Ce = "", We = "done", Ds = !0;
    try {
      Xt(), m.reviewOpen && Us();
    } finally {
      Ds = !1;
    }
    $s = JSON.stringify(Nl());
    const E = new Set(m.items.filter((C) => C.pendingEnhance).map((C) => C.id));
    zl(v, (C) => E.has(C));
  }
  function Xt() {
    var R;
    Fs();
    const m = a.getElementById("klavity-multi-start"), b = a.getElementById("klavity-multi-status");
    if (!m || !b) return;
    const v = We === "recording" ? "Stop &amp; analyse recording" : We === "processing" ? "AI is analysing…" : We === "done" ? "Record another walkthrough" : "Start Recording";
    if (m.innerHTML = `${We === "processing" ? '<span class="kl-enh-loader"></span>' : Q("monitor", { size: 15 })}<span>${v}</span>`, m.disabled = We === "processing" || We === "recording", b.classList.toggle("kl-rec", We === "recording"), b.classList.toggle("kl-ok", We === "done"), We === "recording")
      b.hidden = !1, b.textContent = "Recording screen and microphone…";
    else if (We === "done" && pe) {
      const E = pe.length;
      b.hidden = !1, b.innerHTML = `${E} issue${E === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (R = b.querySelector("#klavity-multi-reopen")) == null || R.addEventListener("click", () => Us());
    } else gr ? (b.hidden = !1, b.textContent = gr) : (b.hidden = !0, b.textContent = "");
  }
  async function Dh() {
    if (Wt || We === "processing" || We === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(Ze && V.includes(Ze)) && V.length >= Z) {
      Kt(`You can attach up to ${Z} recordings.`);
      return;
    }
    const b = ++St;
    gr = "", ft(!0);
    const v = (E) => {
      s.style.display = E === "recording" ? "none" : "", E === "recording" && b === St && (We = "recording", Xt());
    };
    let R = null;
    try {
      R = await t.onRecord(v, { purpose: "multi" });
    } catch {
      R = null;
    } finally {
      s.style.display = "", ft(!1);
    }
    if (!(b !== St || Ge)) {
      if (!R) {
        We = pe ? "done" : "idle", Xt();
        return;
      }
      await Pl(R, b);
    }
  }
  function Fh(m) {
    const b = V.find((R) => R.id === m);
    if (!b || !t.onSplitRecording || We !== "idle") return;
    const v = ++St;
    We = "processing", Promise.resolve().then(() => {
      if (v === St && !Ge) return Pl(b, v);
    });
  }
  async function Pl(m, b) {
    var A, N;
    gr = "";
    for (let O = c.length - 1; O >= 0; O--)
      (N = (A = se[O]) == null ? void 0 : A.shapes) != null && N.length || Cl(O);
    const v = V.indexOf(m), R = v >= 0 ? v : Ze ? V.indexOf(Ze) : -1;
    R >= 0 ? V[R] = m : V.push(m), Se = R >= 0 ? R : V.length - 1, Ke = null, Ze = m, pe = null, xt = null, Xn(), We = "processing", kn(), Xt();
    let E = null;
    try {
      const O = m.blob || await (await fetch(m.dataUrl)).blob();
      let F = [], D = null;
      try {
        if (m.blob)
          try {
            D = URL.createObjectURL(m.blob);
          } catch {
            D = null;
          }
        F = await Gy(D || m.dataUrl, (m.durationMs || 0) / 1e3);
      } catch {
        F = [];
      } finally {
        if (D)
          try {
            URL.revokeObjectURL(D);
          } catch {
          }
      }
      if (b !== St || Ge) return;
      E = await t.onSplitRecording(O, { text: ee.value.trim(), ...F.length ? { frames: F } : {} });
    } catch {
      E = null;
    }
    if (b !== St || Ge) return;
    const C = (E || []).filter((O) => O && (String(O.title || "").trim() || String(O.description || "").trim()));
    if (!C.length) {
      Ze = null, pe = null, xt = null, We = "idle", gr = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", Xt();
      return;
    }
    pe = C.map((O, F) => ({
      ...O,
      id: `mi${b}_${F}`,
      title: String(O.title || "").trim() || `Issue ${F + 1}`,
      kind: O.kind === "feature" ? "feature" : "bug",
      description: Dc(O),
      selected: !0,
      thumb: null
    })), xt = pe.map((O) => ({ ...O })), Lt = !1, Xe = null, Ce = "", We = "done", Xt(), Us(), zl(b);
  }
  async function zl(m, b = () => !0) {
    const v = Ze;
    if (!v || !pe) return;
    let R = v.dataUrl, E = null;
    if (v.blob)
      try {
        E = URL.createObjectURL(v.blob), R = E;
      } catch {
      }
    try {
      for (const C of [...pe]) {
        if (m !== St || Ge) return;
        const A = typeof C.startSec == "number" ? C.startSec : 0, N = typeof C.endSec == "number" && C.endSec > A ? C.endSec : A + 2, O = R ? await op(R, A + Math.min(1, (N - A) / 2)) : null;
        if (m !== St) return;
        if (O) {
          for (const F of [pe, xt]) {
            const D = F == null ? void 0 : F.find((B) => B.id === C.id);
            D && (D.thumb = O);
          }
          Dt();
        }
        b(C.id) && Uh(C.id, O, m);
      }
    } finally {
      if (E)
        try {
          URL.revokeObjectURL(E);
        } catch {
        }
    }
  }
  async function Uh(m, b, v) {
    const R = t.onEnhance, E = pe == null ? void 0 : pe.find((j) => j.id === m);
    if (!R || !E) return;
    const C = (j) => String(j || "").trim().toLowerCase().replace(/\s+/g, " "), A = C(E.narration), N = !!A && (pe || []).some((j) => {
      const Y = j.id === m ? "" : C(j.narration);
      return !!Y && (Y === A || Y.includes(A) || A.includes(Y));
    }), O = [E.title, E.actualResult, E.expectedResult ? `Expected: ${E.expectedResult}` : ""].map((j) => String(j || "").trim()).filter(Boolean).join(`
`), F = !N && String(E.narration || "").trim() || O || E.title, D = (j) => {
      for (const Y of [pe, xt]) {
        const W = Y == null ? void 0 : Y.find((te) => te.id === m);
        W && (W.enhancing = j);
      }
    };
    D(!0), Dt();
    let B = null;
    try {
      B = await R(F, { images: b ? 1 : 0, ...b ? { shot: b } : {} });
    } catch {
      B = null;
    }
    if (v !== St || Ge) return;
    D(!1);
    const X = C(B == null ? void 0 : B.summary);
    if (X && (pe || []).some((j) => j.id !== m && C(j.title) === X) && (B = null), B)
      for (const j of [pe, xt]) {
        const Y = j == null ? void 0 : j.find((W) => W.id === m);
        !Y || j === pe && Y.edited || (Y.title = String(B.summary || "").trim() || Y.title, Y.actualResult = B.actualResult || "", Y.expectedResult = B.expectedResult || "", Y.stepsToReproduce = Array.isArray(B.stepsToReproduce) ? B.stepsToReproduce : [], B.suggestedSeverity && (Y.suggestedSeverity = B.suggestedSeverity), B.suggestedPriority && (Y.suggestedPriority = B.suggestedPriority), Y.description = Dc(Y));
      }
    Dt();
  }
  function Us() {
    if (!pe || Ge) return;
    const m = a.getElementById("klavity-side");
    De || (De = document.createElement("div"), De.className = "kl-mr", De.id = "klavity-mr", De.setAttribute("role", "dialog"), De.setAttribute("aria-label", "AI Analysis Complete"), (m || le).appendChild(De)), m && (m.scrollTop = 0, m.classList.add("kl-mr-open")), Dt();
  }
  function Xn() {
    var m;
    Ue = null, at = null, De == null || De.remove(), De = null, (m = a.getElementById("klavity-side")) == null || m.classList.remove("kl-mr-open"), Fs();
  }
  function Bh() {
    !Ze || V.includes(Ze) || (St++, Ze = null, pe = null, xt = null, Lt = !1, We = "idle", gr = "", Xn(), Xt());
  }
  function qh(m) {
    if (!Ze) return;
    const b = V.indexOf(Ze);
    if (b < 0) return;
    (Se !== b || !a.querySelector(".kl-hero-video")) && (Se = b, Ke = null, Me());
    const v = a.querySelector(".kl-hero-video");
    if (!v) return;
    const R = () => {
      try {
        v.currentTime = Math.max(0, m);
        const E = v.play();
        E && typeof E.catch == "function" && E.catch(() => {
        });
      } catch {
      }
    };
    v.readyState >= 1 ? R() : v.addEventListener("loadedmetadata", R, { once: !0 });
  }
  function $l() {
    if (Lt && !Xe && typeof window.confirm == "function") {
      let m = !0;
      try {
        m = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        m = !0;
      }
      if (!m) return !1;
    }
    return xt && (pe = xt.map((m) => ({ ...m }))), Lt = !1, !0;
  }
  function Wh(m) {
    return Vy(m.description, m.title);
  }
  function Dt() {
    if (Fs(), !De || !pe) return;
    if (Xe) {
      Vh();
      return;
    }
    const m = pe, b = m.filter((A) => A.selected), v = m.length > 0 && b.length === m.length, R = m.length, E = b.length, C = m.map((A) => {
      const N = Aa(A.startSec, A.endSec), O = Hy(A.suggestedPriority), F = typeof A.confidence == "number" && isFinite(A.confidence) ? Math.round(A.confidence * 100) : null, D = A.kind === "feature";
      return `<div class="kl-mr-card${A.selected ? "" : " kl-off"}" data-id="${Te(A.id)}"><input type="checkbox" class="kl-mr-cb" ${A.selected ? "checked" : ""} aria-label="${A.selected ? "Deselect" : "Select"} ${Te(A.title)}"><div class="kl-mr-thumb">${A.thumb ? `<img src="${Te(A.thumb)}" alt="">` : Q("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Te(A.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Te(A.title)}">${Q("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${D ? "kl-mr-feat" : "kl-mr-bug"}">${Q(D ? "lightbulb" : "bug", { size: 10 })}${D ? "Feature" : "Bug"}</span>${O ? `<span class="kl-mr-p${O === "High" ? 1 : O === "Medium" ? 2 : 3}">${O}</span>` : ""}${F != null && F < 85 ? `<span class="kl-mr-conf">${F}% · review</span>` : ""}${A.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${A.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Te(Wh(A))}</p>${N ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${Q("clock", { size: 11 })} ${Te(N)}</button>` : ""}</div></div>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${Q("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${Q("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${Q("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${R} report${R === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${R} report${R === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${E} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${v ? "checked" : ""} aria-label="${v ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${C}</div></div></div><div class="kl-mr-foot"><p>${E} of ${R} tickets selected</p>${Ce ? `<p class="kl-mr-err" role="alert">${Te(Ce)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${E === 0 || ae ? "disabled" : ""}>${ae ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${E} ${E === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (Ue && at ? jh() : ""), Hh();
  }
  function jh() {
    const m = at, b = (v, R) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${R.length},1fr)">${R.map(([E, C, A]) => `<button type="button" class="${v}${(v === "kl-mr-kind" ? m.kind : m.priority) === E ? " kl-on" : ""}" data-v="${E}">${A}${C}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${Q("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Te(m.title)}"></label><div class="kl-mr-f"><span>Type</span>${b("kl-mr-kind", [["bug", "Bug", Q("bug", { size: 13 })], ["feature", "Feature", Q("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${b("kl-mr-pri", Ta.map((v) => [v.priority, v.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Te(m.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Te(m.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${Q("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${m.title.trim() && m.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function Hh() {
    var b, v, R, E;
    if (!De || !pe) return;
    const m = (C) => De.querySelector(C);
    (b = m("#kl-mr-back")) == null || b.addEventListener("click", () => {
      ae || !$l() || (Xn(), Xt());
    }), (v = m("#kl-mr-close")) == null || v.addEventListener("click", () => {
      ae || !$l() || (Xn(), yr());
    }), (R = m("#kl-mr-all")) == null || R.addEventListener("change", (C) => {
      const A = C.target.checked;
      pe.forEach((N) => {
        N.selected = A;
      }), Lt = !0, Dt();
    }), (E = m("#kl-mr-submit")) == null || E.addEventListener("click", () => {
      Kh();
    }), De.querySelectorAll(".kl-mr-card").forEach((C) => {
      var N, O, F;
      const A = pe.find((D) => D.id === C.dataset.id);
      A && ((N = C.querySelector(".kl-mr-cb")) == null || N.addEventListener("change", (D) => {
        A.selected = D.target.checked, Lt = !0, Dt();
      }), (O = C.querySelector(".kl-mr-edit")) == null || O.addEventListener("click", () => {
        var D;
        Ue = A.id, at = { title: A.title, kind: A.kind === "feature" ? "feature" : "bug", priority: String(A.suggestedPriority || "").toUpperCase(), description: A.description, ts: Aa(A.startSec, A.endSec) }, Dt(), (D = De == null ? void 0 : De.querySelector("#kl-mr-ed-title")) == null || D.focus();
      }), (F = C.querySelector(".kl-mr-ts")) == null || F.addEventListener("click", () => qh(typeof A.startSec == "number" ? A.startSec : 0)));
    }), Ue && at && Yh();
  }
  function Yh() {
    var C, A, N, O, F, D;
    const m = at, b = (B) => De.querySelector(B), v = b("#kl-mr-ed-save"), R = () => {
      v && (v.disabled = !(m.title.trim() && m.description.trim()));
    }, E = () => {
      Ue = null, at = null, Dt();
    };
    (C = b("#kl-mr-ed-title")) == null || C.addEventListener("input", (B) => {
      m.title = B.target.value, R();
    }), (A = b("#kl-mr-ed-desc")) == null || A.addEventListener("input", (B) => {
      m.description = B.target.value, R();
    }), (N = b("#kl-mr-ed-ts")) == null || N.addEventListener("input", (B) => {
      m.ts = B.target.value;
    }), De.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((B) => B.addEventListener("click", () => {
      B.classList.contains("kl-mr-kind") ? m.kind = B.dataset.v === "feature" ? "feature" : "bug" : m.priority = B.dataset.v || "";
      const X = B.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      De.querySelectorAll(X).forEach((j) => j.classList.toggle("kl-on", j === B));
    })), (O = b("#kl-mr-ed-x")) == null || O.addEventListener("click", E), (F = b("#kl-mr-ed-cancel")) == null || F.addEventListener("click", E), (D = b("#kl-mr-ed-rm")) == null || D.addEventListener("click", () => {
      if (pe = pe.filter((B) => B.id !== Ue), Lt = !0, Ue = null, at = null, !pe.length) {
        pe = null, We = "idle", Xn(), Xt();
        return;
      }
      Dt(), Xt();
    }), v == null || v.addEventListener("click", () => {
      const B = pe.find((Y) => Y.id === Ue);
      if (!B || !m.title.trim() || !m.description.trim()) return;
      B.title = m.title.trim(), B.edited = !0, B.kind = m.kind, B.description = m.description.trim();
      const X = Ta.find((Y) => Y.priority === m.priority);
      X && (B.suggestedPriority = X.priority, B.suggestedSeverity = X.severity);
      const j = Yy(m.ts);
      B.startSec = j.startSec, B.endSec = j.endSec, Lt = !0, Ue = null, at = null, Dt();
    });
  }
  function Vh() {
    var R, E;
    if (!De || !Xe) return;
    const m = Xe.refs.length, b = Xe.refs.filter((C) => C.key).map((C) => {
      const A = fo(C.url), N = Te(ho(C.key, C.url));
      return A ? `<a href="${Te(A)}" target="_blank" rel="noopener">${N}</a>` : `<span>${N}</span>`;
    }).join("");
    De.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${Q("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${Q("check", { size: 25 })}</span><h3>${m} ticket${m === 1 ? "" : "s"} created</h3><p>${Te(n.thankYou || "Your AI-generated reports have been filed.")}</p>${Xe.failed ? `<p role="alert">${Xe.failed} ticket${Xe.failed === 1 ? "" : "s"} couldn't be created — please report ${Xe.failed === 1 ? "it" : "them"} again.</p>` : ""}${b ? `<div class="kl-mr-keys">${b}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const v = () => yr({ reason: "submitted" });
    (R = De.querySelector("#kl-mr-close")) == null || R.addEventListener("click", v), (E = De.querySelector("#kl-mr-done")) == null || E.addEventListener("click", v);
  }
  async function Kh() {
    var N;
    if (!pe || !Ze || ae) return;
    const m = pe.filter((O) => O.selected).map((O) => ({ ...O, title: O.title.trim(), description: O.description.trim() }));
    if (!m.length) return;
    const b = Xl(), v = n.submitTargetToggle !== !1 ? { feedbackTarget: qs } : {}, R = (O) => O.kind === "feature" ? "feature" : "bug", E = (O) => ({
      ...O.suggestedSeverity ? { suggestedSeverity: O.suggestedSeverity } : {},
      ...O.suggestedPriority ? { suggestedPriority: O.suggestedPriority } : {}
    }), C = m[0], A = m.slice(1);
    ae = !0, Ce = "", Dt();
    try {
      Kn && await Ps;
      const O = await Promise.all(d.slice()), F = Ze, D = {
        type: R(C),
        ...ue ? { kind: R(C) } : {},
        title: C.title,
        description: Fc(C, { primary: !0, reporterNote: ee.value.trim() }),
        screenshots: O.length ? O : C.thumb ? [C.thumb] : [],
        ..._.length ? { files: _.slice() } : {},
        recordings: [F, ...V.filter((W) => W !== F)],
        ...O.length ? { annotations: tt() } : {},
        reporterEmail: b.email,
        createContact: b.createContact,
        ...v,
        ...E(C),
        ...t.consoleAttachToggle ? { attachConsole: !!((N = a.getElementById("klavity-conlog-cb")) != null && N.checked) } : {}
      }, B = (W, te) => ({
        type: R(W),
        ...ue ? { kind: R(W) } : {},
        title: W.title,
        description: Fc(W, { primary: !1, videoTitle: C.title, videoKey: te }),
        screenshots: W.thumb ? [W.thumb] : [],
        recordings: [F],
        reporterEmail: b.email,
        createContact: !1,
        ...v,
        ...E(W)
      });
      if (t.backgroundUpload) {
        const W = t.onSubmit;
        W(D), (async () => {
          for (const te of A)
            try {
              await W(B(te));
            } catch (ke) {
              try {
                console.error("[Klavity] multi-issue ticket failed:", ke);
              } catch {
              }
            }
        })(), yr({ immediate: !0, reason: "submitted" });
        return;
      }
      const X = await t.onSubmit(D), j = [{ key: X.issueKey, url: X.issueUrl }];
      let Y = 0;
      for (const W of A)
        try {
          const te = await t.onSubmit(B(W, X.issueKey || void 0));
          j.push({ key: te.issueKey, url: te.issueUrl });
        } catch (te) {
          Y++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", te);
          } catch {
          }
        }
      if (Ge) return;
      ae = !1, Xe = { refs: j, failed: Y }, Lt = !1, Dt();
    } catch (O) {
      try {
        console.error("[Klavity] multi-issue submit failed:", O);
      } catch {
      }
      if (Ge) return;
      ae = !1, Ce = n.debug ? `Couldn't create the tickets — ${(O == null ? void 0 : O.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", Dt();
    }
  }
  let Xr = null;
  function yr(m) {
    var R;
    if (Ge) return;
    Ge = !0;
    for (const E of gn.splice(0))
      try {
        E();
      } catch {
      }
    St++;
    for (const E of _) Ae(E);
    for (const E of V)
      if (E._previewUrl)
        try {
          URL.revokeObjectURL(E._previewUrl);
        } catch {
        }
    if (Lr) {
      try {
        URL.revokeObjectURL(Lr);
      } catch {
      }
      Lr = null;
    }
    Xr == null || Xr(), _t && (clearTimeout(_t), _t = null), document.removeEventListener("keydown", Gr, { capture: !0 }), document.removeEventListener("paste", Fl);
    try {
      (R = t.onClose) == null || R.call(t, m == null ? void 0 : m.reason);
    } catch {
    }
    const b = a.querySelector(".klavity-modal");
    if (m != null && m.immediate || !b) {
      ot(s);
      return;
    }
    b.classList.add("kl-closing");
    const v = () => ot(s);
    b.addEventListener("animationend", v, { once: !0 }), setTimeout(v, 700);
  }
  function Dl(m, b) {
    if (_t || Ge) return;
    const v = document.createElement("div");
    v.className = "klavity-toast-progress", v.style.animationDuration = b + "ms", m.appendChild(v);
    let R = b, E = Date.now();
    const C = () => {
      E = Date.now(), _t = setTimeout(() => {
        yr();
      }, R);
    }, A = () => {
      _t && (clearTimeout(_t), _t = null, R = Math.max(0, R - (Date.now() - E)), v.style.animationPlayState = "paused");
    }, N = () => {
      _t || m.classList.contains("kl-closing") || (v.style.animationPlayState = "running", C());
    };
    m.addEventListener("mouseenter", A), m.addEventListener("mouseleave", N), m.addEventListener("focusin", A), m.addEventListener("focusout", (O) => {
      m.contains(O.relatedTarget) || N();
    }), C();
  }
  function Gr(m) {
    var b;
    if (Si) {
      m.key === "Escape" ? (m.stopPropagation(), Si()) : (m.key === "s" || m.key === "S") && m.stopPropagation();
      return;
    }
    if (m.key === "Escape") {
      m.stopPropagation(), js();
      return;
    }
    if ((m.key === "s" || m.key === "S") && !m.metaKey && !m.ctrlKey && !m.altKey) {
      const v = typeof m.composedPath == "function" && m.composedPath()[0] || m.target;
      if (v && (v.tagName === "INPUT" || v.tagName === "TEXTAREA" || v.tagName === "SELECT" || v.isContentEditable || ((b = v.getAttribute) == null ? void 0 : b.call(v, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const R = a.getElementById("klavity-submit");
      R && !R.disabled && (m.preventDefault(), m.stopPropagation(), R.click());
    }
  }
  document.addEventListener("keydown", Gr, { capture: !0 });
  const Fl = (m) => {
    if (!m.clipboardData) return;
    const b = Array.from(m.clipboardData.items).filter((v) => v.type.startsWith("image/")).map((v) => v.getAsFile()).filter((v) => !!v);
    b.length && zs(b);
  };
  document.addEventListener("paste", Fl);
  const Bs = () => {
    const m = le.querySelector("#klavity-desc");
    m && (m.placeholder = ge === "feature" ? "Describe the feature you'd like..." : ge === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (ue) {
    const m = Array.from(le.querySelectorAll(".kl-type-chip"));
    m.forEach((b) => {
      b.addEventListener("click", () => {
        ge = b.getAttribute("data-kind") || "bug", m.forEach((v) => {
          const R = v === b;
          v.classList.toggle("active", R), v.setAttribute("aria-checked", R ? "true" : "false");
        }), Bs();
      });
    });
  } else {
    const m = le.querySelector(".kl-toggle-bug"), b = le.querySelector(".kl-toggle-feat");
    m.addEventListener("click", () => {
      ge = "bug", m.classList.add("active"), b.classList.remove("active"), Bs();
    }), b.addEventListener("click", () => {
      ge = "feature", b.classList.add("active"), m.classList.remove("active"), Bs();
    });
  }
  let qs = "project";
  {
    const m = le.querySelector("#klavity-target");
    if (m) {
      const b = Array.from(m.querySelectorAll(".kl-tgt-opt"));
      for (const v of b)
        v.addEventListener("click", () => {
          qs = v.dataset.target === "klavity" ? "klavity" : "project";
          for (const E of b) {
            const C = E === v;
            E.classList.toggle("on", C), E.setAttribute("aria-checked", C ? "true" : "false");
          }
        });
    }
  }
  const ee = le.querySelector("#klavity-desc");
  {
    const m = () => {
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
      const E = m();
      if (!E || !E.rangeCount) return -1;
      try {
        const C = E.getRangeAt(0);
        if (!ee.contains(C.endContainer)) return -1;
        const A = C.cloneRange();
        return A.selectNodeContents(ee), A.setEnd(C.endContainer, C.endOffset), po(A.cloneContents()).length;
      } catch {
        return -1;
      }
    }, v = (E) => {
      const C = m();
      if (C)
        try {
          const A = document.createRange(), N = document.createTreeWalker(ee, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let O, F = E, D = !1;
          for (; O = N.nextNode(); ) {
            if (O.nodeName === "BR") {
              if (F === 0) {
                A.setStartBefore(O), D = !0;
                break;
              }
              F -= 1;
              continue;
            }
            if (O.nodeType === 3) {
              const B = (O.textContent || "").length;
              if (F <= B) {
                A.setStart(O, F), D = !0;
                break;
              }
              F -= B;
            }
          }
          D ? A.collapse(!0) : (A.selectNodeContents(ee), A.collapse(!1)), C.removeAllRanges(), C.addRange(A);
        } catch {
        }
    }, R = () => {
      const E = b(), C = po(ee).replace(/\n$/, "");
      ee.innerHTML = C ? $c(C) : "", E >= 0 && v(E);
    };
    ee.addEventListener("input", R), Object.defineProperty(ee, "value", {
      configurable: !0,
      get() {
        return po(ee);
      },
      set(E) {
        const C = String(E ?? "").replace(/\n$/, "");
        ee.innerHTML = C ? $c(C) : "";
      }
    }), Object.defineProperty(ee, "disabled", {
      configurable: !0,
      get() {
        return ee.getAttribute("contenteditable") === "false";
      },
      set(E) {
        ee.setAttribute("contenteditable", E ? "false" : "true"), ee.classList.toggle("kl-desc-disabled", !!E);
      }
    }), Object.defineProperty(ee, "placeholder", {
      configurable: !0,
      get() {
        return ee.getAttribute("data-ph") || "";
      },
      set(E) {
        ee.setAttribute("data-ph", String(E ?? ""));
      }
    });
  }
  const br = le.querySelector("#klavity-submit"), ye = le.querySelector("#klavity-remail");
  let Rr = "", Gn = !1;
  ye && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (ye.value = t.prefillEmail), ye && ye.value.trim() && (Rr = ye.value.trim().toLowerCase());
  const Ul = le.querySelector("#klavity-desc-hint"), Xh = () => !t.requireEmail || !!ye && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ye.value.trim()), Ws = () => {
    var m;
    return c.length > 0 || jn || _.length > 0 || V.length > 0 || ee.value.trim().length > 0 || (((m = le.querySelector("#klavity-title")) == null ? void 0 : m.value.trim().length) ?? 0) > 0;
  };
  let xi = null, Si = null;
  const js = () => {
    var R, E, C;
    if (!Ws()) {
      yr();
      return;
    }
    if (xi) return;
    const m = document.createElement("div");
    xi = m, m.setAttribute("role", "alertdialog"), m.setAttribute("aria-modal", "true"), m.setAttribute("aria-labelledby", "kl-cc-title"), m.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", m.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const b = () => {
      ot(m), xi === m && (xi = null, Si = null);
    };
    Si = b, m.addEventListener("click", (A) => {
      A.target === m && b();
    }), (R = m.querySelector("#kl-cc-keep")) == null || R.addEventListener("click", b), (E = m.querySelector("#kl-cc-discard")) == null || E.addEventListener("click", () => {
      b(), yr({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || Yr).appendChild(m);
    try {
      (C = m.querySelector("#kl-cc-keep")) == null || C.focus();
    } catch {
    }
  }, Gh = () => {
  };
  let Ei = !1;
  const pt = () => {
    if (Ei) {
      br.disabled = !0;
      return;
    }
    const m = ee.value.trim() === "";
    br.disabled = m && !Ws() || !Xh(), Ul && (Ul.hidden = !(m && Ws()));
  };
  if (ee.addEventListener("input", Gh), ee.addEventListener("input", pt), ye == null || ye.addEventListener("input", pt), t.onDescriptionChange) {
    const m = t.onDescriptionChange;
    let b = null;
    const v = () => {
      b && (clearTimeout(b), b = null);
      try {
        m(ee.value);
      } catch {
      }
    };
    ee.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(v, 600);
    }), ee.addEventListener("blur", v), ee.addEventListener("change", v), yn(v);
  }
  const Jn = le.querySelector("#klavity-title");
  if (Jn && t.onTitleChange) {
    const m = t.onTitleChange;
    let b = null;
    const v = () => {
      b && (clearTimeout(b), b = null);
      try {
        m(Jn.value);
      } catch {
      }
    };
    Jn.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(v, 600);
    }), Jn.addEventListener("blur", v), Jn.addEventListener("change", v), yn(v);
  }
  const Jr = le.querySelector("#klavity-remail-sugg"), Hs = le.querySelector("#klavity-remail-matches"), Bl = le.querySelector("#klavity-remail-sugg-hint"), Tr = le.querySelector("#klavity-remail-addcontact"), ql = le.querySelector(".klavity-remail-sugg-em"), Wl = le.querySelector(".klavity-remail-sugg-check");
  let Gt = !1, vn = "", Ci = [], Ys = "", Vs = !1, jl = 0;
  const Hl = (m) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m), Jh = (m) => {
    var R, E;
    const b = (m.name || m.email).trim(), v = b.split(/[\s._-]+/).filter(Boolean);
    return ((((R = v[0]) == null ? void 0 : R[0]) || "") + (((E = v[1]) == null ? void 0 : E[0]) || "")).toUpperCase() || b.slice(0, 1).toUpperCase();
  }, Zh = (m) => {
    let b = 0;
    for (let v = 0; v < m.length; v++) b = b * 31 + m.charCodeAt(v) >>> 0;
    return `hsl(${b % 360} 58% 42%)`;
  };
  async function Yl(m) {
    if (!t.onLookupPeople) {
      Ci = [], Ys = m, Vs = !0;
      return;
    }
    const b = ++jl;
    try {
      const v = await t.onLookupPeople(m);
      if (b !== jl) return;
      Ci = Array.isArray(v) ? v : [];
    } catch {
      Ci = [];
    }
    Ys = m, Vs = !0, Ar();
  }
  function Ar() {
    if (!Jr || !ye) return;
    const m = ye.value.trim(), b = m.toLowerCase();
    Gt && b !== vn && (Gt = !1, vn = "");
    const v = Gn ? Ci.filter((A) => !b || A.email.toLowerCase().includes(b)) : [], R = v.some((A) => A.email.toLowerCase() === b), E = Gn && Hl(m) && !R;
    Hs && (Hs.innerHTML = v.map((A) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Te(A.email)}">
          <span class="klavity-remail-av" style="background:${Te(Zh(A.email))}">${Te(Jh(A))}</span>
          <span class="klavity-remail-who">${A.name ? `${Te(A.name)} <i>(${Te(A.email)})</i>` : Te(A.email)}</span>
        </button>`).join(""), Hs.querySelectorAll(".klavity-remail-person").forEach((A) => {
      A.addEventListener("click", () => {
        var N;
        ye.value = A.getAttribute("data-email") || "", Gt = !1, vn = "", Rr = ye.value.trim().toLowerCase(), (N = t.onRememberEmail) == null || N.call(t, Rr), Ar(), pt();
      });
    }));
    const C = ye.parentElement;
    C && C.classList.contains("klavity-remail-wrap") && C.classList.toggle("is-open", !!(v.length || E)), ye.setAttribute("aria-expanded", v.length || E ? "true" : "false"), Tr && (Tr.hidden = !E), Bl && (Bl.hidden = !E), Jr.hidden = !(v.length || E), ql && (ql.textContent = m), Wl && (Wl.hidden = !Gt), Tr == null || Tr.setAttribute("aria-selected", Gt ? "true" : "false");
  }
  Tr == null || Tr.addEventListener("click", () => {
    var b;
    const m = (ye == null ? void 0 : ye.value.trim()) || "";
    Hl(m) && (Gt = !Gt, vn = Gt ? m.toLowerCase() : "", Rr = Gt ? m.toLowerCase() : "", Rr && ((b = t.onRememberEmail) == null || b.call(t, Rr)), Ar(), pt());
  });
  function Qh() {
    if (!ye || t.requireEmail) return;
    const m = ye.value.trim();
    m && m.toLowerCase() !== Rr && (ye.value = "", Gt = !1, vn = "", Rr = "", Ar(), pt());
  }
  function Vl() {
    setTimeout(() => {
      var R;
      const b = le.getRootNode().activeElement;
      b === ye || Jr && b && Jr.contains(b) || (Gn = !1, ye && !ye.value.trim() && ((R = t.onRememberEmail) == null || R.call(t, "")), Qh(), Ar());
    }, 0);
  }
  ye == null || ye.addEventListener("blur", Vl), Jr == null || Jr.addEventListener("focusout", Vl);
  let Ks = null;
  if (ye == null || ye.addEventListener("focus", () => {
    Gn = !0, Ar(), Vs || Yl("");
  }), ye == null || ye.addEventListener("input", () => {
    Gn = !0, Ar();
    const m = ye.value.trim().toLowerCase();
    m !== Ys && (Ks && clearTimeout(Ks), Ks = setTimeout(() => {
      Yl(m);
    }, 180));
  }), Ar(), t.onEnhance) {
    const m = t.onEnhance, b = le.querySelector("#klavity-enhance"), v = le.querySelector("#klavity-enhance-undo"), R = le.querySelector("#klavity-enhance-regen"), E = le.querySelector("#klavity-enhance-spin");
    let C = 0, A = null;
    const N = () => c[Le] || c[0] || "", O = () => {
      const D = N();
      if (!D) return "";
      const B = Le >= 0 && Le < c.length ? Le : 0, X = se[B] ?? (B === 0 ? se[0] : null);
      if (!X || !Array.isArray(X.shapes) || !X.shapes.length) return D;
      const j = a.getElementById("klavity-hero-stage"), Y = j == null ? void 0 : j.querySelector("canvas");
      if (Y && Le === B && Y.width > 1 && Y.height > 1) {
        const W = Y._klvAnnotator, te = (W == null ? void 0 : W.selected) ?? null;
        W && te && (W.selected = null, W.redraw());
        try {
          const ke = Y.toDataURL("image/png");
          if (ke && ke.length > 64) return ke;
        } catch {
        } finally {
          W && te && (W.selected = te, W.redraw());
        }
      }
      return null;
    }, F = async () => {
      if (Wt) return;
      const D = ee.value.trim();
      A = ee.value;
      const B = ++C;
      b && (b.disabled = !0), E && (E.hidden = !1);
      try {
        const X = de ? { selector: de.selector, text: de.text } : null, j = Le >= 0 && Le < c.length ? Le : 0, Y = se[j] ?? (j === 0 ? se[0] : null), W = Og(Y == null ? void 0 : Y.shapes), te = N();
        let ke = O();
        ke === null && (ke = await Ng(te, Y.shapes, Y.w, Y.h));
        const je = await m(D, {
          images: c.length,
          shot: ke,
          annotations: Y,
          annotationTexts: W,
          picked: X
        });
        if (B !== C || !je) return;
        ee.value = ap(je), ee.dispatchEvent(new Event("input", { bubbles: !0 })), or = je.suggestedSeverity || null, jr = je.suggestedPriority || null, ee.classList.add("kl-just-enhanced"), setTimeout(() => ee.classList.remove("kl-just-enhanced"), 700), v && (v.hidden = !1), R && (R.hidden = !1), pt();
      } catch {
      } finally {
        B === C && (b && (b.disabled = !1), E && (E.hidden = !0));
      }
    };
    b == null || b.addEventListener("click", () => {
      F();
    }), R == null || R.addEventListener("click", () => {
      F();
    }), v == null || v.addEventListener("click", () => {
      A !== null && (ee.value = A, ee.dispatchEvent(new Event("input", { bubbles: !0 })), pt()), A = null, or = null, jr = null, v && (v.hidden = !0), R && (R.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const m = le.querySelector("#klavity-known"), b = t.onCheckKnown;
    let v = null, R = 0, E = "";
    const C = () => {
      m && (m.hidden = !0, m.textContent = "");
    }, A = (O) => {
      var D;
      if (!m) return;
      const F = O.headline ? Te(O.headline) : "Already reported";
      m.innerHTML = `<span class="kl-known-ic">${Q("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${Te(O.statusLabel)}</span>. We're already tracking "${Te(O.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, m.hidden = !1, (D = m.querySelector("#klavity-known-dismiss")) == null || D.addEventListener("click", () => {
        E = ee.value.trim(), C();
      });
    }, N = async () => {
      const O = ee.value.trim();
      if (O.length < 12 || O === E) {
        C();
        return;
      }
      const F = ++R;
      try {
        const D = await b(O);
        if (F !== R) return;
        if (ee.value.trim() === E) {
          C();
          return;
        }
        D ? A(D) : C();
      } catch {
      }
    };
    ee.addEventListener("input", () => {
      ee.value.trim() !== E && (E = ""), v && clearTimeout(v), v = setTimeout(N, 500);
    });
  }
  if (n.reportClarity) {
    const m = le.querySelector("#klavity-clarity"), b = le.querySelector("#klavity-clarity-status"), v = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, R = le.querySelector("#klavity-clarity-tip"), E = le.querySelector("#klavity-clarity-tip-text"), C = le.querySelector("#klavity-nudge"), A = t.onClarityTip, N = /* @__PURE__ */ new Map();
    let O = null, F = 0;
    const D = (W, te, ke) => {
      if (!W) return;
      W.classList.toggle("done", te);
      const je = W.querySelector(".kl-clr-mark");
      je && (je.innerHTML = te ? Q("check", { size: 12 }) : "○"), W.setAttribute("aria-label", (te ? "covered: " : "missing: ") + ke);
    }, B = () => {
      R && (R.hidden = !0);
    }, X = (W) => {
      !R || !E || gy(W) || (E.innerHTML = Te(W) + '<span class="kl-clr-aitag">AI</span>', R.hidden = !1);
    }, j = () => {
      const W = ee.value, te = tp(W);
      m && (m.hidden = W.trim().length === 0, m.classList.remove("l1", "l2", "l3"), m.classList.add(te.level === "great" ? "l3" : te.level === "good" ? "l2" : "l1")), b && (b.textContent = te.label), D(v.problem, te.coverage.problem, "What's broken"), D(v.expected, te.coverage.expected, "What you expected"), D(v.repro, te.coverage.repro, "How to reproduce"), C && !C.hidden && (C.hidden = !0), te.level === "great" && B();
    }, Y = () => {
      !A || !R || (O && clearTimeout(O), O = setTimeout(async () => {
        const W = ee.value.trim();
        if (!fy(W)) {
          B();
          return;
        }
        if (N.has(W)) {
          X(N.get(W));
          return;
        }
        const te = ++F;
        try {
          const ke = await A(W, { images: c.length });
          if (te !== F || ee.value.trim() !== W) return;
          ke && ke.tip && (N.set(W, ke.tip), X(ke.tip));
        } catch {
        }
      }, 1e3));
    };
    ee.addEventListener("input", () => {
      j(), Y();
    }), j(), (rc = le.querySelector("#klavity-nudge-add")) == null || rc.addEventListener("click", () => {
      C && (C.hidden = !0);
      try {
        ee.focus();
      } catch {
      }
    }), (nc = le.querySelector("#klavity-nudge-anyway")) == null || nc.addEventListener("click", () => {
      C && (C.hidden = !0), br.click();
    });
  }
  Yr.addEventListener("click", (m) => {
    m.target === Yr && js();
  }), (ic = le.querySelector("#klavity-x")) == null || ic.addEventListener("click", () => js()), (sc = le.querySelector("#klavity-min")) == null || sc.addEventListener("click", () => {
    var m;
    try {
      (m = t.onMinimize) == null || m.call(t);
    } catch {
    }
  });
  const Kl = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Wt = !1;
  const ft = (m) => {
    Wt = m, Kl().forEach((v) => {
      v.disabled = m;
    }), ee.disabled = m;
    const b = le.querySelector("#klavity-voice");
    b && (b.disabled = m), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((v) => {
      v.disabled = m;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((v) => {
      v.disabled = m;
    }), m ? (Xr == null || Xr(), br.disabled = !0) : (pt(), vi());
  }, ar = (m) => {
    Kl().forEach((b) => {
      b.classList.remove("kl-active"), b.removeAttribute("aria-pressed");
    }), m && (m.classList.add("kl-active"), m.setAttribute("aria-pressed", "true"));
  }, kr = le.querySelector("#klavity-voice");
  if (kr) {
    const v = kr.querySelector(".kl-vring-prog");
    let R = 0, E = 0, C = !1, A, N = "";
    const O = () => {
      E = Date.now();
      const ve = () => {
        const _e = Date.now() - E, Pe = Math.min(_e / 18e4, 1);
        if (v == null || v.setAttribute("stroke-dashoffset", String(Pe * 81.68)), _e >= 165e3 && kr.classList.add("kl-voice-warn"), _e >= 18e4) {
          A.stop();
          return;
        }
        R = requestAnimationFrame(ve);
      };
      R = requestAnimationFrame(ve);
    }, F = () => {
      cancelAnimationFrame(R), v == null || v.setAttribute("stroke-dashoffset", String(81.68)), kr.classList.remove("kl-voice-warn");
    }, D = le.querySelector("#klavity-voice-status");
    let B = null;
    const X = () => {
      B && (clearTimeout(B), B = null), D && (D.hidden = !0, D.textContent = "", D.classList.remove("kl-vs-info", "kl-vs-err"));
    }, j = (ve, _e, Pe) => {
      !D || !_e || (B && (clearTimeout(B), B = null), D.classList.remove("kl-vs-info", "kl-vs-err"), D.classList.add(ve === "err" ? "kl-vs-err" : "kl-vs-info"), D.textContent = _e, D.hidden = !1, Pe && (B = setTimeout(X, Pe)));
    }, Y = "Recording — tap to stop", W = () => {
      D && D.classList.contains("kl-vs-info") && X();
    }, te = (ve) => {
      kr.classList.toggle("kl-voice-rec", ve), kr.setAttribute("aria-pressed", ve ? "true" : "false"), kr.setAttribute("aria-label", ve ? "Stop recording" : "Voice dictation"), kr.title = ve ? Y : "Voice dictation";
    }, ke = (ve) => {
      let _e = "";
      ve.onTranscript = (Pe) => {
        _e = "", N = zi(N, Pe), ee.value = N;
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        pt();
      }, ve.onInterim = (Pe) => {
        _e = Pe || "";
        const ne = N.length > 0 && !/\s$/.test(N) ? " " : "";
        ee.value = N + (Pe ? ne + Pe : "");
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        pt();
      }, ve.onStatus = (Pe, ne) => {
        Pe === "idle" ? W() : j("info", ne);
      }, ve.onError = (Pe, ne) => {
        ne && j("err", ne, 4e3);
      }, ve.onStop = () => {
        _e && (N = zi(N, _e), _e = ""), N && (N = Pc(N), ee.value = N);
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        C = !1, te(!1), F(), W(), pt();
      };
    }, je = () => {
      const ve = new si();
      return ke(ve), ve;
    }, it = () => {
      if (!C) {
        te(!1), F(), W();
        return;
      }
      si.isSupported() ? (N = ee.value, A = je(), j("info", "Reconnecting dictation…"), A.start()) : (C = !1, te(!1), F(), j("err", "Voice dictation is unavailable right now", 4e3));
    }, Et = () => {
      if (!(nt === "server" && t.onDictate)) return null;
      const ve = new ns({ transcribe: (_e) => t.onDictate(_e) });
      return ke(ve), ve.onUnavailable = it, ve;
    }, Jt = (ve) => {
      const _e = () => N.length > 0 && !/\s$/.test(N) ? " " : "";
      let Pe = "";
      ve.onTranscript = (ne) => {
        Pe = "", N = zi(N, ne), ee.value = N;
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        pt();
      }, ve.onInterim = (ne) => {
        Pe = ne || "", ee.value = N + _e() + ne;
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        pt();
      }, ve.onStatus = (ne, ce) => {
        ne === "idle" ? W() : j("info", ce);
      }, ve.onError = (ne, ce) => {
        ce && j("err", ce, 4e3);
      }, ve.onStop = () => {
        Pe && (N = zi(N, Pe), Pe = ""), N && (N = Pc(N)), ee.value = N;
        try {
          ee.scrollTop = ee.scrollHeight;
        } catch {
        }
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        C = !1, te(!1), F(), W(), pt();
      }, ve.onUnavailable = () => {
        ee.value = N;
        try {
          ee.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!C) {
          te(!1), F(), W();
          return;
        }
        const ne = Et();
        if (ne) {
          A = ne, j("info", "Reconnecting dictation…"), A.start();
          return;
        }
        it();
      };
    }, Zt = () => {
      if (nt === "server" && t.dictationStreamUrl && is.isSupported()) {
        const ve = new is({ url: t.dictationStreamUrl });
        return Jt(ve), ve;
      }
      return Et() ?? je();
    };
    A = Zt(), kr.addEventListener("click", () => {
      C ? A.stop() : (X(), N = ee.value, A = Zt(), C = !0, te(!0), A.start(), O());
    }), Xr = () => {
      C && A.stop();
    };
  }
  function Xl() {
    var v;
    const m = (ye == null ? void 0 : ye.value.trim()) || "", b = m && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) ? m : void 0;
    return b && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b) && ((v = t.onRememberEmail) == null || v.call(t, b.toLowerCase())), { email: b, createContact: !!(b && Gt && b.toLowerCase() === vn) };
  }
  br.addEventListener("click", async () => {
    var te;
    if (Ei || Wt || br.disabled) return;
    Ei = !0, br.disabled = !0;
    const m = ee.value.trim(), b = le.querySelector("#klavity-title"), v = b ? b.value.trim() : "", R = ge === "feature" ? "feature" : "bug";
    u && await Promise.race([u, Promise.resolve()]), Kn && await Ps;
    const E = d.slice(), C = tt(), A = _.slice(), N = V.slice(), O = ge, { email: F, createContact: D } = Xl();
    ft(!0), br.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const X = a.getElementById("klavity-progress"), j = a.getElementById("klavity-progress-fill");
    X && j && (X.classList.add("show"), j.style.transition = "none", j.style.width = "8%", j.offsetWidth, j.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      j.style.width = "90%";
    }));
    const Y = () => {
      j && (j.style.transition = "width .25s ease", j.style.width = "100%");
    }, W = () => {
      X && j && (X.classList.remove("show"), j.style.transition = "none", j.style.width = "0");
    };
    try {
      const ke = await Promise.all(E), je = {
        type: R,
        ...ue ? { kind: O } : {},
        ...v ? { title: v } : {},
        description: m,
        screenshots: ke,
        ...A.length ? { files: A } : {},
        ...N.length ? { recordings: N } : {},
        annotations: C,
        reporterEmail: F,
        createContact: D,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: qs } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...or ? { suggestedSeverity: or } : {},
        ...jr ? { suggestedPriority: jr } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((te = a.getElementById("klavity-conlog-cb")) != null && te.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(je), yr({ immediate: !0, reason: "submitted" });
        return;
      }
      const it = await t.onSubmit(je);
      if (Ge) return;
      Y(), t.success ? uf(it.issueKey, it.issueUrl, t.success) : cf(it.issueKey, it.issueUrl);
    } catch (ke) {
      W();
      const je = (ke == null ? void 0 : ke.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", ke);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${je}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", br.textContent = "Submit", Ei = !1, ft(!1);
    }
  });
  function ef(m, b) {
    var A;
    const { dataUrl: v, quality: R, suggestSharp: E } = Qt(b);
    if (!v) return;
    const C = c.indexOf(m);
    if (!(C < 0)) {
      c[C] = v, d[C] = t.compressImage ? t.compressImage(v) : Promise.resolve(v), o[C] = R, h[C] = !!E && R !== "real-pixel", se[C] && delete se[C], delete lt[C], delete gt[C], delete It[C], Me();
      try {
        (A = t.onShotReplaced) == null || A.call(t, C, v, R);
      } catch {
      }
    }
  }
  async function tf(m) {
    if (!t.onCaptureViewport) return !1;
    let b = null;
    const { geo: v } = Vr();
    try {
      const { dataUrl: E } = Qt(await t.onCaptureViewport());
      Kr(E, v, { kind: "viewport" }), E && (b = E, l = !1, qt(E, "rendered", void 0, !0, !1), m && ar(m));
    } catch {
    } finally {
    }
    const R = (async () => {
      const { geo: E } = Vr();
      try {
        const C = await t.onCaptureFull();
        if (Kr(Qt(C).dataUrl, E, { kind: "full" }), b) ef(b, C);
        else {
          l = !1;
          const { dataUrl: A, quality: N, suggestSharp: O } = Qt(C);
          A && (qt(A, N, void 0, !0, !!O), m && ar(m));
        }
      } catch {
        l = !1, Me();
      } finally {
        u === R && (u = null);
      }
    })();
    return u = R, !0;
  }
  async function Gl(m) {
    if (!t.onCaptureViewport) return !1;
    const { geo: b } = Vr();
    try {
      const { dataUrl: v, blank: R } = Qt(await t.onCaptureViewport());
      R || Kr(v, b, { kind: "viewport" }), R && c.length === 0 ? Os() : v ? (l = !1, qt(v, "rendered", void 0, !0, !1)) : (l = !1, Me());
    } catch {
      l = !1, Me();
    } finally {
    }
    return !0;
  }
  const Zr = le.querySelector("#klavity-full");
  Zr.addEventListener("click", async () => {
    if (!Wt && !(t.onCaptureSharp && (await Xs()).ok)) {
      ft(!0), Zr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await tf(Zr);
          return;
        }
        const { restore: m, geo: b } = Vr();
        try {
          const { dataUrl: v, quality: R, suggestSharp: E } = Qt(await t.onCaptureFull());
          Kr(v, b, { kind: "full" }), qt(v, R, void 0, !0, !!E), ar(Zr);
        } finally {
          m == null || m();
        }
      } catch {
      } finally {
        Zr.classList.remove("kl-loading"), ft(!1);
      }
    }
  });
  async function Xs(m) {
    const b = m != null && m.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Wt || !b || !Ne) return { ok: !1, declined: !1 };
    const v = Ne.querySelector(".kl-sharp-label");
    ft(!0), Ne.classList.add("kl-loading"), s.style.display = "none";
    const R = v ?? Ne, E = R.textContent;
    R.textContent = "Capturing…";
    let C = !1, A = !1;
    try {
      const { restore: N, geo: O } = Vr();
      let F;
      try {
        F = await b();
      } finally {
        N == null || N();
      }
      if (F) {
        const { dataUrl: D, quality: B } = Qt(F);
        Kr(D, O, { kind: m != null && m.viewport ? "viewport" : "full" }), D && (qt(D, B ?? "real-pixel", void 0, !0, !1, { kind: m != null && m.viewport ? "viewport" : "full" }), ar(Ne), C = !0, M = !0);
      }
    } catch (N) {
      if (eb(N)) {
        if (A = !0, !(m != null && m.onOpen))
          try {
            Rh();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", N);
        } catch {
        }
    } finally {
      m != null && m.onOpen && A || (s.style.display = "", R.textContent = E, Ne.classList.remove("kl-loading"), ft(!1));
    }
    return { ok: C, declined: A };
  }
  Ne && t.onCaptureSharp && Ne.addEventListener("click", () => {
    Xs();
  });
  const Jl = le.querySelector("#klavity-file"), Zl = le.querySelector("#klavity-upload");
  Zl.addEventListener("click", () => {
    if (!Wt) {
      if (!x && c.length >= k) {
        Kt(`You can attach up to ${k} images.`);
        return;
      }
      Jl.click();
    }
  }), Jl.addEventListener("change", async (m) => {
    const b = m.target, v = b.files ? Array.from(b.files) : [];
    if (b.value = "", !v.length) return;
    const R = c.length, E = _.length;
    x ? await Ph(v) : await zs(v), (c.length > R || _.length > E) && ar(Zl);
  });
  const Zn = a.getElementById("klavity-record");
  Zn && t.onRecord && Zn.addEventListener("click", async () => {
    if (Wt) return;
    if (V.length >= Z) {
      Kt(`You can attach up to ${Z} recordings.`);
      return;
    }
    ft(!0), Zn.classList.add("kl-loading");
    const m = (b) => {
      s.style.display = b === "recording" ? "none" : "";
    };
    try {
      const b = await t.onRecord(m);
      if (b) {
        const v = V.findIndex((R) => R.id && b.id && R.id === b.id || R.dataUrl && b.dataUrl && R.dataUrl === b.dataUrl);
        v >= 0 ? (V[v] = b, Se = v) : (V.push(b), Se = V.length - 1), Ke = null, kn(), ar(Zn);
      }
    } catch {
    } finally {
      s.style.display = "", Zn.classList.remove("kl-loading"), ft(!1);
    }
  }), me && (Xt(), (oc = a.getElementById("klavity-multi-start")) == null || oc.addEventListener("click", () => {
    Dh();
  }), t.initialMultiRecordingId ? Fh(t.initialMultiRecordingId) : me && t.initialMultiIssues && $h(t.initialMultiIssues));
  const Gs = a.getElementById("klavity-region");
  Gs && t.onRegionCapture && (Gs.onclick = () => {
    Wt || (ft(!0), document.removeEventListener("keydown", Gr, { capture: !0 }), s.style.display = "none", cb(async (m) => {
      document.addEventListener("keydown", Gr, { capture: !0 });
      try {
        const { restore: b, geo: v } = Vr();
        let R;
        try {
          R = await t.onRegionCapture(m);
        } finally {
          b == null || b();
        }
        if (R) {
          const { dataUrl: E, quality: C, suggestSharp: A } = Qt(R);
          Kr(E, v, { kind: "region", rect: m }), E && (qt(E, C, void 0, !0, !!A, { kind: "region", rect: m }), ar(Gs));
        }
      } finally {
        s.style.display = "", ft(!1);
      }
    }, () => {
      document.addEventListener("keydown", Gr, { capture: !0 }), s.style.display = "", ft(!1);
    }));
  });
  const wn = a.getElementById("klavity-pick"), xn = a.getElementById("klavity-pickinfo"), Ql = () => {
    var v;
    if (wn && (wn.classList.toggle("kl-active", !!de), de ? wn.setAttribute("aria-pressed", "true") : wn.removeAttribute("aria-pressed")), !xn) return;
    if (!de) {
      xn.hidden = !0, xn.innerHTML = "";
      return;
    }
    xn.hidden = !1;
    const { text: m } = de, b = m ? `: <span class="kl-pick-txt">${Te(m)}</span>` : "";
    xn.innerHTML = `<span class="kl-pick-ic">${Q("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${b}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (v = xn.querySelector("#klavity-pick-clear")) == null || v.addEventListener("click", () => {
      de = null, Ql();
    });
  };
  wn && t.onPickElement && (wn.onclick = async () => {
    if (!Wt) {
      ft(!0), document.removeEventListener("keydown", Gr, { capture: !0 }), s.style.display = "none";
      try {
        const m = await t.onPickElement();
        m && (de = m, Ql(), m.shot && qt(m.shot, m.shotQuality, void 0, !0, !1, { kind: "element", selector: m.selector, rect: m.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Gr, { capture: !0 }), s.style.display = "", ft(!1);
      }
    }
  });
  function Ot(m, b = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${m}</svg>`;
  }
  const lr = 20;
  function rf(m) {
    const b = (C, A, N, O) => `<button type="button" class="kl-htool" data-tool="${C}" title="${A} (${O.toUpperCase()})" aria-label="${A}">${N}<span class="kl-hk">${O.toUpperCase()}</span></button>`, v = (C) => {
      const A = C.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(A)) return !1;
      const N = parseInt(A.slice(0, 2), 16), O = parseInt(A.slice(2, 4), 16), F = parseInt(A.slice(4, 6), 16);
      return (0.2126 * N + 0.7152 * O + 0.0722 * F) / 255 > 0.7;
    }, R = (C) => `<button type="button" class="kl-hcolor${v(C) ? " kl-hcolor-light" : ""}" data-color="${C}" style="background:${C}" title="${C}" aria-label="Colour ${C}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + // Select: pick an added annotation to move / resize it, recolour it, change its stroke/size, edit a
      // text's words (double-click) or delete it (Delete key).
      b("select", "Select & edit", Ot('<path d="M5 3l14 8-6 1.5L9.5 19z"/>', lr), "v") + '<span class="kl-hsep"></span>' + // Annotation tools, in the product-specified order: Rectangle (the default), Arrow, Text, Counter,
      // Pencil, Line, Circle — larger glyphs (TOOL_ICON) so they're easy to tell apart and select.
      b("rect", "Rectangle", Ot('<rect x="4" y="5" width="16" height="14" rx="1.5"/>', lr), "r") + b("arrow", "Arrow", Ot('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>', lr), "a") + b("text", "Text", Ot('<path d="M5 6h14M12 6v13M9 19h6"/>', lr), "t") + b("count", "Counter", Ot('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>', lr), "c") + b("pen", "Pencil", Q("pencil", { size: lr }), "p") + b("line", "Line", Ot('<line x1="5" y1="19" x2="19" y2="5"/>', lr), "l") + b("circle", "Circle", Ot('<circle cx="12" cy="12" r="9"/>', lr), "o") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Black out numbers in your screenshots"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${Q("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + b("pixelate", "Redact (pixelate)", Ot('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>', lr), "b") + b("crop", "Crop", Ot('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>', lr), "k") + // Undo / Redo / Clear — pushed to the TOP-RIGHT of the Screenshot tab (end of the tools row). They cover
      // every annotation tool, edits, crop and clear. The break after them starts the colour/stroke/zoom row.
      `<span class="kl-hgrow"></span><span class="kl-hgroup kl-hhist"><button type="button" class="kl-htbtn kl-hhistbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo"${kl(Le) ? "" : " disabled"}>${Ot('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 17)}<span class="kl-hk">Undo</span></button><button type="button" class="kl-htbtn kl-hhistbtn" id="kl-hero-redo" title="Redo (Cmd+Shift+Z / Ctrl+Y)" aria-label="Redo"${vl(Le) ? "" : " disabled"}>${Ot('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/>', 17)}<span class="kl-hk">Redo</span></button><button type="button" class="kl-htbtn kl-hhistbtn" id="kl-hero-clear" title="Clear all annotations" aria-label="Clear">${Q("trash-2", { size: 17 })}<span class="kl-hk">Clear</span></button></span><span class="kl-hbreak" aria-hidden="true"></span><span class="kl-hcolors">` + R("#ef4444") + R("#f97316") + R("#16a34a") + R("#3b82f6") + R("#ffffff") + R("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      '<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span>' + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (m ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Ot('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Ot('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Ot('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function Qn() {
    $t && (document.removeEventListener("keydown", $t, { capture: !0 }), $t = null);
  }
  function Js() {
    const m = a.getElementById("klavity-hero-stage"), b = a.getElementById("klavity-hero-tools");
    b && (b.innerHTML = ""), m && (m.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${Q("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Te(Ah())}</span></div>`), Qn();
  }
  function ec() {
    if (Ke != null && !(_[Ke] && en(_[Ke]) === "video") && (Ke = null), Se != null && !V[Se] && (Se = null), Se != null) {
      tc(V[Se].dataUrl);
      return;
    }
    if (Ke != null) {
      tc(_[Ke] ? he(_[Ke]) : void 0);
      return;
    }
    if (c.length === 0) {
      Le = 0, Js();
      return;
    }
    Le >= c.length && (Le = c.length - 1), Le < 0 && (Le = 0), af(Le);
  }
  let Lr = null;
  function tc(m) {
    const b = a.getElementById("klavity-hero-stage"), v = a.getElementById("klavity-hero-tools");
    if (!b || !m) {
      Js();
      return;
    }
    if (Qn(), v && (v.innerHTML = ""), b.innerHTML = "", Lr) {
      try {
        URL.revokeObjectURL(Lr);
      } catch {
      }
      Lr = null;
    }
    let R = m;
    const E = Se != null && V[Se] ? V[Se] : null;
    if (E && E.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        R = URL.createObjectURL(E.blob), Lr = R;
      } catch {
      }
    else if (m.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const F = m.split(",");
        if (F.length >= 2) {
          const D = F[0].match(/:(.*?);/), B = (D ? D[1] : "video/webm").split(";")[0], X = atob(F[1]);
          let j = X.length;
          const Y = new Uint8Array(j);
          for (; j--; )
            Y[j] = X.charCodeAt(j);
          const W = new Blob([Y], { type: B });
          R = URL.createObjectURL(W), Lr = R;
        }
      } catch {
      }
    const C = document.createElement("div");
    C.className = "kl-hero-vwrap", C.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const A = document.createElement("video");
    A.src = R, A.controls = !0, A.setAttribute("playsinline", ""), A.preload = "metadata", A.className = "kl-hero-video", A.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const N = document.createElement("div");
    N.className = "kl-hero-verror", N.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const O = document.createElement("a");
    O.href = R || m, O.setAttribute("download", "recording.webm"), O.setAttribute("target", "_blank"), O.setAttribute("rel", "noopener"), O.textContent = "Download recording", O.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", N.innerHTML = "<span>This recording couldn’t play here.</span>", N.appendChild(O), C.appendChild(A), C.appendChild(N), b.appendChild(C), nf(A, N);
  }
  function nf(m, b) {
    let v = !1, R = null;
    m.addEventListener("loadedmetadata", () => {
      if (!isFinite(m.duration) || isNaN(m.duration) || m.duration <= 0) {
        v = !0;
        try {
          m.currentTime = 1e101;
        } catch {
        }
        R = setTimeout(() => {
          if (v) {
            v = !1;
            try {
              m.currentTime = 0;
            } catch {
            }
          }
        }, 400);
      }
    }), m.addEventListener("durationchange", () => {
      if (v && isFinite(m.duration) && m.duration > 0) {
        v = !1, R && clearTimeout(R);
        try {
          m.currentTime = 0;
        } catch {
        }
      }
    }), m.addEventListener("error", () => {
      if (v) {
        v = !1, R && clearTimeout(R);
        try {
          m.currentTime = 0, m.style.display = "block", b && (b.style.display = "none");
          return;
        } catch {
        }
      }
      try {
        m.style.display = "none";
      } catch {
      }
      b && (b.style.display = "flex");
    });
  }
  function sf(m, b, v, R, E) {
    const C = c[m];
    if (!C) return;
    const A = new Image();
    A.onload = () => {
      var j, Y;
      if (c[m] !== C) return;
      const N = document.createElement("canvas");
      N.width = Math.max(1, Math.round(R)), N.height = Math.max(1, Math.round(E));
      const O = N.getContext("2d");
      if (!O) return;
      O.drawImage(A, b, v, R, E, 0, 0, N.width, N.height);
      let F;
      try {
        F = N.toDataURL("image/png");
      } catch {
        return;
      }
      const D = ((j = lt[m]) == null ? void 0 : j.length) ?? 0, B = Vn(m);
      c[m] = F, d[m] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const X = (Y = se[m]) == null ? void 0 : Y.shapes;
      Array.isArray(X) && X.length ? se[m] = { w: N.width, h: N.height, shapes: jy(X, -b, -v) } : delete se[m], Ls(m, B), (gt[m] ?? (gt[m] = [])).push({ snap: B, mark: D }), Hr(m), Me(), of(C, F, A.naturalWidth, A.naturalHeight, b, v, N.width, N.height);
    }, A.src = C;
  }
  function of(m, b, v, R, E, C, A, N) {
    const F = ((X) => (X || []).map((j) => ({ x: Math.max(0, j.x - E), y: Math.max(0, j.y - C), w: Math.min(A, j.x - E + j.w) - Math.max(0, j.x - E), h: Math.min(N, j.y - C + j.h) - Math.max(0, j.y - C) })).filter((j) => j.w > 0 && j.h > 0))(Tl(m, v, R));
    F.length && mt.set(b, F);
    const D = oe.get(m);
    if (!D) return;
    const B = new Image();
    B.onload = () => {
      const X = document.createElement("canvas");
      X.width = A, X.height = N;
      const j = X.getContext("2d");
      if (!j) return;
      j.drawImage(B, E, C, A, N, 0, 0, A, N);
      let Y;
      try {
        Y = X.toDataURL("image/png");
      } catch {
        return;
      }
      oe.set(b, Y), $e.set(Y, b), F.length && mt.set(Y, F);
    }, B.src = D;
  }
  function af(m) {
    var O, F, D, B, X, j;
    const b = a.getElementById("klavity-hero-stage"), v = a.getElementById("klavity-hero-tools");
    if (!b || !v) return;
    const R = c[m];
    if (!R) {
      Js();
      return;
    }
    Qn(), b.innerHTML = "";
    const E = document.createElement("canvas");
    E.width = 1, E.height = 1, E.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const C = new Ra(E, R), A = (O = se[m]) == null ? void 0 : O.shapes;
    Array.isArray(A) && A.forEach((Y) => C.shapes.push({ ...Y })), b.appendChild(E);
    const N = new Image();
    N.onload = () => {
      !document.body.contains(s) || Le !== m || c[m] !== R || (E.width = N.naturalWidth || 1, E.height = N.naturalHeight || 1, C.redraw());
    }, N.src = R, C.redraw();
    {
      v.innerHTML = rf((((F = gt[m]) == null ? void 0 : F.length) ?? 0) > 0);
      const Y = v.querySelector("#kl-hero-logo");
      Y && (Y.href = qy(n.projectId));
      let W = "rect", te = "#ef4444", ke = 26, je = "black", it = null;
      const Et = v.querySelector("#kl-hero-textopts");
      E._klvAnnotator = C;
      const Jt = v.querySelector("#kl-hero-undo"), Zt = v.querySelector("#kl-hero-redo"), ve = () => {
        Jt && (Jt.disabled = !kl(m)), Zt && (Zt.disabled = !vl(m));
      }, _e = () => {
        C.shapes.length ? se[m] = { w: E.width, h: E.height, shapes: C.shapes.map((I) => Ma(I)) } : delete se[m], Hr(m), ve();
      }, Pe = (I) => {
        C.selected = I, Et && (Et.hidden = !(W === "text" || I && I.type === "text")), C.redraw();
      }, ne = (I) => {
        const q = C.selected;
        return !q || !C.shapes.includes(q) ? !1 : (Mr(m), I(q), C.redraw(), _e(), !0);
      }, ce = (I) => {
        W = I, v.querySelectorAll("[data-tool]").forEach((q) => q.classList.toggle("kl-on", q.dataset.tool === I)), I !== "select" && C.selected && Pe(null), Et && (Et.hidden = !(I === "text" || C.selected && C.selected.type === "text")), E.style.cursor = I === "select" ? "default" : "crosshair";
      }, Be = v.querySelector(".kl-hcolor-custom"), vr = v.querySelector(".kl-hcolor-input"), ac = (I) => {
        v.querySelectorAll("[data-color]").forEach((q) => q.classList.toggle("kl-on", q === I)), Be && Be.classList.toggle("kl-on", Be === I);
      }, Zs = (I, q) => {
        te = I, ac(q);
        const G = C.selected;
        G && G.type !== "pixelate" && G.color !== I && ne((H) => {
          H.color = I;
        });
      };
      if (v.querySelectorAll("[data-tool]").forEach((I) => I.addEventListener("click", () => ce(I.dataset.tool))), v.querySelectorAll("[data-color]").forEach((I) => I.addEventListener("click", () => Zs(I.dataset.color, I))), Be && vr) {
        Be.addEventListener("click", () => vr.click());
        const I = () => {
          Be.style.background = vr.value, Zs(vr.value, Be);
        };
        vr.addEventListener("input", I), vr.addEventListener("change", I);
      }
      const Qs = v.querySelector(".kl-hmask-cb");
      Qs && Qs.addEventListener("change", () => {
        var I;
        i = Qs.checked, Ml(Ll());
        try {
          (I = t.onMaskNumbersChange) == null || I.call(t, i);
        } catch {
        }
      }), v.querySelectorAll("[data-outline]").forEach((I) => I.addEventListener("click", () => {
        var q;
        je = I.dataset.outline, v.querySelectorAll("[data-outline]").forEach((G) => G.classList.toggle("kl-on", G === I)), ((q = C.selected) == null ? void 0 : q.type) === "text" && ne((G) => {
          G.outline = je;
        });
      })), v.querySelectorAll("[data-size]").forEach((I) => I.addEventListener("click", () => {
        var q;
        ke = Number(I.dataset.size), v.querySelectorAll("[data-size]").forEach((G) => G.classList.toggle("kl-on", G === I)), ((q = C.selected) == null ? void 0 : q.type) === "text" && ne((G) => {
          G.size = ke;
        });
      })), v.querySelectorAll("[data-stroke]").forEach((I) => I.addEventListener("click", () => {
        C.strokeScale = Number(I.dataset.stroke) || 1, v.querySelectorAll("[data-stroke]").forEach((G) => G.classList.toggle("kl-on", G === I));
        const q = C.selected;
        q && ["pen", "line", "rect", "circle", "arrow"].includes(q.type) ? ne((G) => {
          G.sw = C.strokeScale;
        }) : C.redraw();
      })), Jt == null || Jt.addEventListener("click", () => {
        yl(m);
      }), Zt == null || Zt.addEventListener("click", () => {
        bl(m);
      }), (D = v.querySelector("#kl-hero-revert")) == null || D.addEventListener("click", () => {
        Mh(m);
      }), (B = v.querySelector("#kl-hero-clear")) == null || B.addEventListener("click", () => {
        Mr(m), C.clearAll(), _e();
      }), ce(W), Zs(te, v.querySelector("[data-color]"));
      const cr = (I) => {
        const q = E.getBoundingClientRect(), G = Math.min(q.width / E.width, q.height / E.height) || 1, H = E.width * G, ie = E.height * G, qe = (q.width - H) / 2, Ie = (q.height - ie) / 2;
        return { x: (I.clientX - q.left - qe) / G, y: (I.clientY - q.top - Ie) / G };
      }, Mi = () => {
        const I = E.getBoundingClientRect();
        return Math.min(I.width / E.width, I.height / E.height) || 1;
      }, df = (I, q, G, H, ie, qe) => {
        const Ie = C.strokeScale;
        return I === "line" ? { type: "line", color: qe, x1: q, y1: G, x2: H, y2: ie, sw: Ie } : I === "arrow" ? { type: "arrow", color: qe, x1: q, y1: G, x2: H, y2: ie, sw: Ie } : I === "rect" ? { type: "rect", color: qe, x: Math.min(q, H), y: Math.min(G, ie), w: Math.abs(H - q), h: Math.abs(ie - G), sw: Ie } : I === "circle" ? { type: "circle", color: qe, x: (q + H) / 2, y: (G + ie) / 2, rx: Math.abs(H - q) / 2, ry: Math.abs(ie - G) / 2, sw: Ie } : I === "pixelate" ? { type: "pixelate", x: Math.min(q, H), y: Math.min(G, ie), w: Math.abs(H - q), h: Math.abs(ie - G) } : null;
      };
      let yt = 1, _r = 0, Ir = 0, Ri = null;
      const pf = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), Ti = $y(pf), eo = () => {
        if (Ri) return Ri;
        const I = E.style.transform;
        return E.style.transform = "", Ri = E.getBoundingClientRect(), E.style.transform = I, Ri;
      }, ht = document.createElement("div");
      ht.className = "kl-minimap", ht.hidden = !0, ht.setAttribute("role", "navigation"), ht.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const ei = document.createElement("img");
      ei.className = "kl-minimap-img", ei.alt = "", ei.draggable = !1, ei.src = R;
      const Sn = document.createElement("div");
      Sn.className = "kl-minimap-vp", ht.append(ei, Sn), b.appendChild(ht);
      const lc = () => {
        const I = E.width, q = E.height;
        if (yt <= 1 || I < 2 || q < 2) {
          ht.hidden = !0;
          return;
        }
        const G = eo();
        if (!G) {
          ht.hidden = !0;
          return;
        }
        const H = 148, ie = Math.min(H / I, H / q), qe = Math.max(1, Math.round(I * ie)), Ie = Math.max(1, Math.round(q * ie));
        ht.style.width = qe + "px", ht.style.height = Ie + "px";
        const Pt = b.getBoundingClientRect(), Nr = Fy(
          { left: Pt.left, top: Pt.top, right: Pt.right, bottom: Pt.bottom },
          { left: G.left, top: G.top, width: G.width, height: G.height },
          { panX: _r, panY: Ir },
          yt,
          I,
          q
        );
        Sn.style.left = Nr.x * ie + "px", Sn.style.top = Nr.y * ie + "px", Sn.style.width = Math.max(3, Nr.w * ie) + "px", Sn.style.height = Math.max(3, Nr.h * ie) + "px", ht.hidden = !1;
      }, ti = () => {
        if (yt === 1) {
          _r = 0, Ir = 0, E.style.transform = "", E.style.cursor = "crosshair", lc();
          return;
        }
        E.style.transformOrigin = "0 0", E.style.transform = `translate(${_r}px,${Ir}px) scale(${yt})`, E.style.cursor = "grab", lc();
      }, Ai = (I, q, G) => {
        const H = eo();
        if (!H) return;
        const ie = yt;
        if (yt = Py(yt * G), yt === ie) return;
        const qe = Dy(I, q, { left: H.left, top: H.top, width: H.width, height: H.height }, ie, yt, { panX: _r, panY: Ir });
        _r = qe.panX, Ir = qe.panY, E.style.transition = Ti, ti();
      }, to = () => {
        const I = b.getBoundingClientRect();
        return { cx: I.left + I.width / 2, cy: I.top + I.height / 2 };
      }, hf = () => {
        yt = 1, E.style.transition = Ti, ti();
      };
      (X = v.querySelector("#kl-hero-zoomin")) == null || X.addEventListener("click", () => {
        const { cx: I, cy: q } = to();
        Ai(I, q, 1.25);
      }), (j = v.querySelector("#kl-hero-zoomout")) == null || j.addEventListener("click", () => {
        const { cx: I, cy: q } = to();
        Ai(I, q, 0.8);
      });
      const ff = (I, q) => {
        const G = eo();
        if (!G) return;
        const H = b.getBoundingClientRect(), ie = By(I, q, { left: H.left, top: H.top, right: H.right, bottom: H.bottom }, { left: G.left, top: G.top, width: G.width, height: G.height }, yt, E.width);
        _r = ie.panX, Ir = ie.panY, E.style.transition = Ti, ti();
      };
      let Li = !1;
      const cc = (I, q) => {
        const G = ht.getBoundingClientRect(), { ix: H, iy: ie } = Uy(I - G.left, q - G.top, G.width, G.height, E.width, E.height);
        ff(H, ie);
      };
      ht.addEventListener("pointerdown", (I) => {
        Li = !0;
        try {
          ht.setPointerCapture(I.pointerId);
        } catch {
        }
        cc(I.clientX, I.clientY), I.preventDefault(), I.stopPropagation();
      }), ht.addEventListener("pointermove", (I) => {
        Li && (cc(I.clientX, I.clientY), I.preventDefault());
      });
      const uc = (I) => {
        if (Li) {
          Li = !1;
          try {
            ht.releasePointerCapture(I.pointerId);
          } catch {
          }
        }
      };
      ht.addEventListener("pointerup", uc), ht.addEventListener("pointercancel", uc), b.addEventListener("wheel", (I) => {
        W !== "crop" && (I.preventDefault(), Ai(I.clientX, I.clientY, zy(I.deltaY)));
      }, { passive: !1 }), b.addEventListener("dblclick", () => {
        yt = 1, E.style.transition = Ti, ti();
      });
      let mf = C.shapes.reduce((I, q) => q.type === "count" ? Math.max(I, q.n) : I, 0), Or = !1, Ct = 0, Mt = 0, Qr = [], En = !1, dc = 0, pc = 0, hc = 0, fc = 0, Nt = null, ri = { x: 0, y: 0 }, bt = null;
      const gf = () => Math.max(14, C.computeFontSize() * 0.6), mc = (I, q) => {
        for (let G = C.shapes.length - 1; G >= 0; G--) {
          const H = C.shapes[G];
          if (H.type !== "text") continue;
          const ie = C.textBounds(H);
          if (!ie) continue;
          const qe = gf();
          if (I >= ie.x + ie.w - qe && I <= ie.x + ie.w + qe && q >= ie.y + ie.h - qe && q <= ie.y + ie.h + qe)
            return { shape: H, mode: "resize" };
          const Ie = 6;
          if (I >= ie.x - Ie && I <= ie.x + ie.w + Ie && q >= ie.y - Ie && q <= ie.y + ie.h + Ie)
            return { shape: H, mode: "move" };
        }
        return null;
      };
      let rt = null;
      const gc = (I) => I === "nw" || I === "se" ? "nwse-resize" : I === "ne" || I === "sw" ? "nesw-resize" : "move", yf = (I, q, G) => {
        const H = document.createElement("input"), ie = Mi(), qe = I.size ?? C.computeFontSize();
        H.value = I.text, H.style.cssText = `position:fixed;left:${q}px;top:${G}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:rgba(255,255,255,.92);border:0;color:${I.color};font-size:${Math.max(6, qe * ie)}px;font-family:sans-serif;font-weight:700;outline:1px dashed ${I.color};z-index:2147483647;min-width:120px;`, document.body.appendChild(H), it = H, requestAnimationFrame(() => {
          document.body.contains(H) && (H.focus(), H.select());
        }), H.addEventListener("blur", () => {
          it = null;
          const Ie = H.value.trim();
          Ie && Ie !== I.text && (Pe(I), ne((Pt) => {
            Pt.text = Ie;
          })), ot(H);
        }, { once: !0 }), H.addEventListener("keydown", (Ie) => {
          Ie.key === "Enter" && H.blur(), Ie.key === "Escape" && (H.value = I.text, H.blur()), Ie.stopPropagation();
        });
      };
      E.addEventListener("dblclick", (I) => {
        if (W !== "select") return;
        const q = C.hitShape(cr(I).x, cr(I).y);
        q && q.type === "text" && (I.stopPropagation(), yf(q, I.clientX, I.clientY));
      }), E.addEventListener("pointerdown", (I) => {
        if (I.shiftKey && yt > 1) {
          En = !0, dc = I.clientX, pc = I.clientY, hc = _r, fc = Ir, E.style.transition = "none", E.style.cursor = "grabbing";
          try {
            E.setPointerCapture(I.pointerId);
          } catch {
          }
          I.preventDefault();
          return;
        }
        const q = cr(I);
        if (Ct = q.x, Mt = q.y, W === "select") {
          C.uiScale = 1 / Mi();
          const G = C.hitHandle(q.x, q.y), H = G ? C.selected : C.hitShape(q.x, q.y);
          if (!H) {
            Pe(null);
            return;
          }
          H !== C.selected && Pe(H);
          const ie = C.shapeBounds(H) || { x: q.x, y: q.y, w: 0, h: 0 };
          rt = { shape: H, orig: Ma(H), bounds: ie, mode: G ? "resize" : "move", handle: G, grabX: q.x, grabY: q.y, snap: Vn(m), moved: !1 };
          const qe = H.color;
          qe && (te = qe, ac(v.querySelector(`[data-color="${qe}"]`)));
          try {
            E.setPointerCapture(I.pointerId);
          } catch {
          }
          E.style.cursor = G ? gc(G) : "move", I.preventDefault();
          return;
        }
        if (W === "crop") {
          Or = !0;
          try {
            E.setPointerCapture(I.pointerId);
          } catch {
          }
          ri = { x: I.clientX, y: I.clientY }, Nt = document.createElement("div"), Nt.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", b.appendChild(Nt);
          return;
        }
        if (W === "text") {
          const G = mc(q.x, q.y);
          if (G) {
            Mr(m), bt = { shape: G.shape, mode: G.mode, grabX: q.x, grabY: q.y, origX: G.shape.x, origY: G.shape.y, origSize: G.shape.size ?? C.computeFontSize() };
            try {
              E.setPointerCapture(I.pointerId);
            } catch {
            }
            E.style.cursor = G.mode === "resize" ? "nwse-resize" : "move", I.preventDefault();
            return;
          }
          const H = document.createElement("input"), ie = je === "none" ? "none" : `0 0 2px ${je}, 0 0 2px ${je}`, qe = Mi(), Ie = Math.max(6, ke * qe), Pt = ke, Nr = je;
          H.style.cssText = `position:fixed;left:${I.clientX}px;top:${I.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${te};font-size:${Ie}px;font-family:sans-serif;font-weight:700;text-shadow:${ie};outline:1px dashed ${te};z-index:2147483647;min-width:80px;`, document.body.appendChild(H), it = H, requestAnimationFrame(() => {
            document.body.contains(H) && H.focus();
          }), H.addEventListener("blur", () => {
            it = null, H.value.trim() && (Mr(m), C.addShape({ type: "text", color: te, x: Ct, y: Mt, text: H.value.trim(), size: Pt, outline: Nr }), _e()), ot(H);
          }, { once: !0 }), H.addEventListener("keydown", (Cn) => {
            Cn.key === "Enter" && H.blur(), Cn.key === "Escape" && (H.value = "", H.blur()), Cn.stopPropagation();
          });
          return;
        }
        if (W === "count") {
          Mr(m), C.addShape({ type: "count", color: te, x: q.x, y: q.y, n: ++mf }), _e();
          return;
        }
        Or = !0;
        try {
          E.setPointerCapture(I.pointerId);
        } catch {
        }
        W === "pen" && (Qr = [q]);
      }), E.addEventListener("pointermove", (I) => {
        if (En) {
          E.style.transition = "none", _r = hc + (I.clientX - dc), Ir = fc + (I.clientY - pc), ti(), E.style.cursor = "grabbing";
          return;
        }
        if (rt) {
          const H = cr(I);
          if (!rt.moved) {
            if (Math.hypot(H.x - rt.grabX, H.y - rt.grabY) < 2) return;
            rt.moved = !0, Ls(m, rt.snap);
          }
          rt.mode === "move" ? _g(rt.shape, rt.orig, H.x - rt.grabX, H.y - rt.grabY) : rt.handle && Ig(rt.shape, rt.orig, rt.bounds, rt.handle, H.x, H.y), C.redraw();
          return;
        }
        if (W === "select") {
          const H = cr(I);
          C.uiScale = 1 / Mi();
          const ie = C.hitHandle(H.x, H.y);
          E.style.cursor = ie ? gc(ie) : C.hitShape(H.x, H.y) ? "move" : "default";
          return;
        }
        if (bt) {
          const H = cr(I);
          bt.mode === "move" ? (bt.shape.x = bt.origX + (H.x - bt.grabX), bt.shape.y = bt.origY + (H.y - bt.grabY)) : bt.shape.size = Math.max(10, Math.min(240, bt.origSize + (H.y - bt.grabY))), C.redraw();
          return;
        }
        if (W === "text" && !Or) {
          const H = cr(I), ie = mc(H.x, H.y);
          E.style.cursor = ie ? ie.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Or) return;
        if (W === "pen") {
          Qr.push(cr(I)), Qr.length > 1 && C.drawPreview({ type: "pen", color: te, points: Qr, sw: C.strokeScale });
          return;
        }
        if (W === "crop" && Nt) {
          const H = b.getBoundingClientRect(), ie = Math.min(ri.x, I.clientX), qe = Math.min(ri.y, I.clientY), Ie = Math.max(ri.x, I.clientX), Pt = Math.max(ri.y, I.clientY);
          Nt.style.left = ie - H.left + "px", Nt.style.top = qe - H.top + "px", Nt.style.width = Ie - ie + "px", Nt.style.height = Pt - qe + "px";
          return;
        }
        const q = cr(I), G = df(W, Ct, Mt, q.x, q.y, te);
        G && C.drawPreview(G);
      }), E.addEventListener("pointerup", (I) => {
        if (En) {
          En = !1, E.style.cursor = yt > 1 ? "grab" : "crosshair";
          try {
            E.releasePointerCapture(I.pointerId);
          } catch {
          }
          return;
        }
        if (rt) {
          const Pt = rt.moved;
          rt = null;
          try {
            E.releasePointerCapture(I.pointerId);
          } catch {
          }
          E.style.cursor = "default", C.redraw(), Pt && _e();
          return;
        }
        if (bt) {
          bt = null;
          try {
            E.releasePointerCapture(I.pointerId);
          } catch {
          }
          E.style.cursor = "crosshair", C.redraw(), _e();
          return;
        }
        if (!Or) return;
        Or = !1;
        try {
          E.releasePointerCapture(I.pointerId);
        } catch {
        }
        const q = cr(I);
        if (W === "crop") {
          Nt && (ot(Nt), Nt = null);
          const Pt = Math.max(0, Math.min(Ct, q.x)), Nr = Math.max(0, Math.min(Mt, q.y)), Cn = Math.abs(q.x - Ct), bc = Math.abs(q.y - Mt);
          Cn > 4 && bc > 4 && sf(m, Pt, Nr, Cn, bc);
          return;
        }
        const G = W === "pixelate" && Math.abs(q.x - Ct) > 4 && Math.abs(q.y - Mt) > 4, H = Math.abs(q.x - Ct) > 3 || Math.abs(q.y - Mt) > 3, ie = (W === "line" || W === "rect" || W === "circle" || W === "arrow") && H;
        (W === "pen" && Qr.length > 1 || ie || G) && Mr(m);
        const Ie = C.strokeScale;
        W === "pen" && Qr.length > 1 ? C.addShape({ type: "pen", color: te, points: Qr, sw: Ie }) : ie && W === "line" ? C.addShape({ type: "line", color: te, x1: Ct, y1: Mt, x2: q.x, y2: q.y, sw: Ie }) : ie && W === "rect" ? C.addShape({ type: "rect", color: te, x: Math.min(Ct, q.x), y: Math.min(Mt, q.y), w: Math.abs(q.x - Ct), h: Math.abs(q.y - Mt), sw: Ie }) : ie && W === "circle" ? C.addShape({ type: "circle", color: te, x: (Ct + q.x) / 2, y: (Mt + q.y) / 2, rx: Math.abs(q.x - Ct) / 2, ry: Math.abs(q.y - Mt) / 2, sw: Ie }) : ie && W === "arrow" ? C.addShape({ type: "arrow", color: te, x1: Ct, y1: Mt, x2: q.x, y2: q.y, sw: Ie }) : G && C.addShape({ type: "pixelate", x: Math.min(Ct, q.x), y: Math.min(Mt, q.y), w: Math.abs(q.x - Ct), h: Math.abs(q.y - Mt) }), _e();
      }), E.addEventListener("pointercancel", (I) => {
        try {
          E.releasePointerCapture(I.pointerId);
        } catch {
        }
        if (Nt && (ot(Nt), Nt = null), En && (En = !1, E.style.cursor = yt > 1 ? "grab" : "crosshair"), bt && (bt = null, E.style.cursor = "crosshair", C.redraw(), _e()), rt) {
          const q = rt.moved;
          rt = null, C.redraw(), q && _e();
        }
        Or && (Or = !1, C.redraw());
      });
      const yc = { v: "select", p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      $t = (I) => {
        if (!document.body.contains(s)) {
          Qn();
          return;
        }
        if (it && document.body.contains(it)) return;
        const q = typeof I.composedPath == "function" && I.composedPath()[0] || I.target;
        if (q && (q.tagName === "INPUT" || q.tagName === "TEXTAREA" || q.tagName === "SELECT" || q.isContentEditable)) return;
        if ((I.metaKey || I.ctrlKey) && (I.shiftKey && I.key.toLowerCase() === "z" || !I.shiftKey && I.key.toLowerCase() === "y")) {
          I.preventDefault(), bl(m);
          return;
        }
        if ((I.metaKey || I.ctrlKey) && I.key.toLowerCase() === "z") {
          I.preventDefault(), yl(m);
          return;
        }
        if (I.metaKey || I.ctrlKey || I.altKey) return;
        if (C.selected && (I.key === "Delete" || I.key === "Backspace")) {
          I.preventDefault();
          const H = C.selected, ie = C.shapes.indexOf(H);
          ie >= 0 && (Mr(m), C.shapes.splice(ie, 1), Pe(null), _e());
          return;
        }
        if (C.selected && I.key === "Escape") {
          I.preventDefault(), Pe(null);
          return;
        }
        const G = I.key.toLowerCase();
        if (G === "z") {
          if (I.preventDefault(), yt > 1) hf();
          else {
            const { cx: H, cy: ie } = to();
            Ai(H, ie, 2);
          }
          return;
        }
        yc[G] && (I.preventDefault(), ce(yc[G]));
      }, document.addEventListener("keydown", $t, { capture: !0 });
    }
  }
  function lf(m) {
    const b = c[m], v = new Image();
    v.onload = () => {
      const R = document.createElement("canvas");
      R.width = v.naturalWidth, R.height = v.naturalHeight;
      const E = new Ra(R, b);
      E.redraw();
      const C = document.createElement("div");
      C.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const A = document.createElement("div");
      A.className = "kl-edtb", A.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", A.innerHTML = `
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Q("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Q("pencil", { size: 14 })} Pen</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Q("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${Q("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Q("x", { size: 14 })}</button>
      `, R.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const N = document.createElement("div");
      N.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", N.appendChild(R);
      const O = document.createElement("style");
      O.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", C.append(O, A, N), a.appendChild(C), Qn();
      let F = 1;
      const D = (ne) => Math.max(0.05, Math.min(5, ne || 1));
      function B(ne) {
        F = D(ne), R.style.width = Math.round(R.width * F) + "px", R.style.height = Math.round(R.height * F) + "px";
        const ce = A.querySelector("#klavity-zoom-pct");
        ce && (ce.textContent = Math.round(F * 100) + "%");
      }
      const X = () => Math.max(1, N.clientWidth - 24) / R.width, j = () => Math.min(Math.max(1, N.clientWidth - 24) / R.width, Math.max(1, N.clientHeight - 24) / R.height), Y = R.height / R.width > Math.max(1, N.clientHeight) / Math.max(1, N.clientWidth);
      B(Y ? X() : j()), A.querySelector("#klavity-zoom-in").addEventListener("click", () => B(F * 1.25)), A.querySelector("#klavity-zoom-out").addEventListener("click", () => B(F / 1.25)), A.querySelector("#klavity-fit-width").addEventListener("click", () => B(X())), A.querySelector("#klavity-fit-page").addEventListener("click", () => B(j()));
      let W = "rect", te = "#ef4444", ke = !1, je = [], it = 0, Et = 0;
      function Jt(ne) {
        W = ne, A.querySelectorAll("[data-tool]").forEach((ce) => {
          const Be = ce.dataset.tool === ne;
          ce.style.background = Be ? "#585b70" : "#313244", ce.style.outline = Be ? "2px solid #89b4fa" : "none";
        });
      }
      A.querySelectorAll("[data-tool]").forEach((ne) => ne.addEventListener("click", () => Jt(ne.dataset.tool))), A.querySelectorAll("[data-color]").forEach((ne) => ne.addEventListener("click", () => {
        te = ne.dataset.color;
      }));
      {
        const ne = A.querySelector("#klavity-color-custom"), ce = A.querySelector("#klavity-color-input");
        if (ne && ce) {
          ne.addEventListener("click", () => ce.click());
          const Be = () => {
            ne.style.background = ce.value, te = ce.value;
          };
          ce.addEventListener("input", Be), ce.addEventListener("change", Be);
        }
      }
      A.querySelector("#klavity-undo").addEventListener("click", () => E.undo()), A.querySelector("#klavity-clear-ann").addEventListener("click", () => E.clearAll());
      const Zt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function ve(ne) {
        const ce = ne.target;
        if (ce && (ce.tagName === "INPUT" || ce.tagName === "TEXTAREA" || ce.isContentEditable)) return;
        if (ne.key === "Escape") {
          ne.stopPropagation(), _e();
          return;
        }
        if ((ne.metaKey || ne.ctrlKey) && ne.key.toLowerCase() === "z") {
          ne.preventDefault(), E.undo();
          return;
        }
        if (ne.metaKey || ne.ctrlKey || ne.altKey) return;
        const Be = ne.key.toLowerCase();
        Zt[Be] ? (ne.preventDefault(), Jt(Zt[Be])) : Be === "u" && (ne.preventDefault(), E.undo());
      }
      function _e() {
        document.removeEventListener("keydown", ve, { capture: !0 }), ot(C), ec();
      }
      document.addEventListener("keydown", ve, { capture: !0 }), Jt(W), A.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        Mr(m), E.shapes.length ? se[m] = { w: R.width, h: R.height, shapes: E.shapes.map((ne) => ({ ...ne })) } : delete se[m], Hr(m), _e(), Me();
      }), A.querySelector("#klavity-cancel-ann").addEventListener("click", () => _e());
      function Pe(ne) {
        const ce = R.getBoundingClientRect();
        return { x: (ne.clientX - ce.left) / ce.width * R.width, y: (ne.clientY - ce.top) / ce.height * R.height };
      }
      R.addEventListener("pointerdown", (ne) => {
        ke = !0;
        const ce = Pe(ne);
        if ({ x: it, y: Et } = ce, W === "pen" && (je = [ce]), W === "text") {
          ke = !1;
          const Be = document.createElement("input");
          Be.style.cssText = `position:fixed;left:${ne.clientX}px;top:${ne.clientY}px;background:transparent;border:1px dashed ${te};color:${te};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Be), requestAnimationFrame(() => {
            document.body.contains(Be) && Be.focus();
          }), Be.addEventListener("blur", () => {
            Be.value.trim() && E.addShape({ type: "text", color: te, x: it, y: Et, text: Be.value.trim() }), ot(Be);
          }, { once: !0 }), Be.addEventListener("keydown", (vr) => {
            vr.key === "Enter" && Be.blur(), vr.stopPropagation();
          });
        }
      }), R.addEventListener("pointermove", (ne) => {
        ke && W === "pen" && je.push(Pe(ne));
      }), R.addEventListener("pointerup", (ne) => {
        if (!ke) return;
        ke = !1;
        const ce = Pe(ne);
        W === "pen" && je.length > 1 ? E.addShape({ type: "pen", color: te, points: je }) : W === "rect" ? E.addShape({ type: "rect", color: te, x: Math.min(it, ce.x), y: Math.min(Et, ce.y), w: Math.abs(ce.x - it), h: Math.abs(ce.y - Et) }) : W === "circle" ? E.addShape({ type: "circle", color: te, x: (it + ce.x) / 2, y: (Et + ce.y) / 2, rx: Math.abs(ce.x - it) / 2, ry: Math.abs(ce.y - Et) / 2 }) : W === "arrow" && E.addShape({ type: "arrow", color: te, x1: it, y1: Et, x2: ce.x, y2: ce.y });
      });
    }, v.src = b;
  }
  function cf(m, b) {
    const v = document.createElement("div");
    v.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const R = document.createElement("div");
    R.className = "klavity-sent";
    const E = document.createElement("div");
    E.className = "kl-sent-check", E.innerHTML = Q("check", { label: "Sent", size: 22 }), R.appendChild(E);
    const C = document.createElement("h2");
    C.textContent = "Report sent", R.appendChild(C);
    const A = document.createElement("p");
    if (A.textContent = n.thankYou || "We filed it and emailed you a copy.", R.appendChild(A), m) {
      const N = document.createElement("div");
      N.className = "klavity-ref";
      const O = document.createElement("span");
      O.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = ho(m, b), N.append(O, F);
      const D = fo(b);
      if (D) {
        const B = document.createElement("a");
        B.href = D, B.target = "_blank", B.rel = "noopener", B.textContent = "Open in Klavity", N.appendChild(B);
      }
      R.appendChild(N);
    }
    v.appendChild(R), ot(Yr), a.appendChild(v), Dl(R, Hn);
  }
  function uf(m, b, v) {
    const { copy: R, onLead: E } = v;
    le.innerHTML = "";
    const C = document.createElement("div");
    C.className = "klavity-success";
    const A = document.createElement("h2");
    if (A.innerHTML = R.headline, C.appendChild(A), R.body) {
      const O = document.createElement("p");
      O.textContent = R.body, C.appendChild(O);
    }
    if (m) {
      const O = document.createElement("div");
      O.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const D = document.createElement("code");
      D.textContent = ho(m, b), O.append(F, D);
      const B = fo(b);
      if (B) {
        const X = document.createElement("a");
        X.href = B, X.target = "_blank", X.rel = "noopener", X.textContent = "Open in Klavity", O.appendChild(X);
      }
      C.appendChild(O);
    }
    const N = () => Dl(le, Eh);
    if (R.showEmail) {
      const O = document.createElement("div");
      O.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const D = document.createElement("button"), B = R.emailLabel;
      D.textContent = B;
      const X = document.createElement("div");
      X.className = "klavity-lead-err", X.setAttribute("role", "alert"), X.style.display = "none";
      const j = async () => {
        const Y = F.value.trim();
        if (!Y || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Y)) {
          X.textContent = "Please enter a valid email so we can reach you.", X.style.display = "block", F.focus();
          return;
        }
        D.disabled = !0, D.textContent = "Saving…", X.style.display = "none";
        try {
          E && await E(m, Y);
        } catch (te) {
          try {
            console.warn("[Klavity] lead capture failed:", (te == null ? void 0 : te.message) || te);
          } catch {
          }
          X.textContent = "Couldn't save your email — please try again.", X.style.display = "block", D.disabled = !1, D.textContent = "Retry", F.focus();
          return;
        }
        const W = document.createElement("div");
        W.className = "klavity-thanks", W.textContent = "Thanks — we'll be in touch.", ot(X), O.replaceWith(W), R.showCta || N();
      };
      D.addEventListener("click", j), F.addEventListener("keydown", (Y) => {
        Y.key === "Enter" && j();
      }), O.append(F, D), C.appendChild(O), C.appendChild(X);
    }
    if (R.showCta && R.ctaUrl) {
      const O = document.createElement("a");
      O.className = "klavity-cta", O.href = R.ctaUrl, O.target = "_blank", O.rel = "noopener", O.textContent = R.ctaText, C.appendChild(O);
    }
    if (le.appendChild(C), !n.whiteLabel) {
      const O = document.createElement("div");
      O.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = np("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", O.append("Powered by ", F), le.appendChild(O);
    }
    !R.showEmail && !R.showCta && N();
  }
  if (V.length && (Se = V.length - 1, kn()), _.length) {
    if (Se == null) {
      for (let m = _.length - 1; m >= 0; m--)
        if (en(_[m]) === "video") {
          Ke = m;
          break;
        }
    }
    wi(), Me();
  }
  if (t.autoCaptureOnOpen) {
    let m = 0;
    try {
      m = document.getElementsByTagName("*").length;
    } catch {
      m = 0;
    }
    const b = m <= L;
    if (b || Uc(t) === "screen") {
      if (l = !0, Me(), Uc(t) === "screen")
        return (async () => {
          const E = await Xs({ viewport: !0, onOpen: !0 });
          if (E.ok) {
            l = !1, Me();
            return;
          }
          if (E.declined) {
            l = !1, yr({ immediate: !0, reason: "discard" });
            return;
          }
          if (c.length) {
            l = !1, Me();
            return;
          }
          if (!b) {
            y = !0, l = !1, Me();
            return;
          }
          if (l = !0, Me(), t.onCaptureViewport) {
            Gl(null).catch(() => {
              l = !1, Me();
            });
            return;
          }
          t.onCaptureFull().then((C) => {
            const { dataUrl: A, quality: N, suggestSharp: O, blank: F } = Qt(C);
            if (l = !1, F && c.length === 0) {
              Os();
              return;
            }
            qt(A, N, void 0, !0, !!O), ar(Zr);
          }).catch(() => {
            l = !1, Me();
          });
        })(), El;
      const v = () => {
        if (t.onCaptureViewport) {
          Gl(null).catch(() => {
            l = !1, Me();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: C, quality: A, suggestSharp: N, blank: O } = Qt(E);
          if (l = !1, O && c.length === 0) {
            Os();
            return;
          }
          qt(C, A, void 0, !0, !!N), ar(Zr);
        }).catch(() => {
          l = !1, Me();
        });
      }, R = window.requestIdleCallback;
      typeof R == "function" ? R(() => v(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(v, 0));
    } else
      y = !0, Me();
  }
  return El;
}
function cb(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), ot(r), ot(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    a = !0, i = d.clientX, s = d.clientY, ot(n);
  }), r.addEventListener("pointermove", (d) => {
    if (!a) return;
    const o = Math.min(d.clientX, i), h = Math.min(d.clientY, s), u = Math.abs(d.clientX - i), p = Math.abs(d.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${o}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o + u}px 0/calc(100% - ${o + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px 0/${u}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px ${h + p}px/${u}px calc(100% - ${h + p}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (d) => {
    if (!a) return;
    a = !1;
    const o = Math.abs(d.clientX - i), h = Math.abs(d.clientY - s);
    if (o < 8 || h < 8) {
      c(), t();
      return;
    }
    const u = { x: Math.min(d.clientX, i), y: Math.min(d.clientY, s), w: o, h };
    c(), e(u);
  });
}
const ub = 2e4;
async function Bc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), ub);
        })
      ]);
      return qc(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return qc(e);
}
const db = 3e4;
function qc(e) {
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
    }, db), a = (c) => {
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
const pb = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function hb(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function fb(e) {
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
const mb = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function tn(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function gb(e) {
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
  } = e, o = tn(e.initials || hb(t)), h = i !== "none" ? pb[i] : null, u = h ? `<span class="ksim-mark ${l ? mb[h.mark] : ""}" style="color:${tn(h.accent)}">${fb(h.mark)}</span>` : "", g = r ? `<span class="ksim-head ksim-photo"><img src="${tn(r)}" alt="${tn(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), M = `--ksim-persona:${tn(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${tn(h.accent)};` : "");
  return `<span class="${y}" style="${M}" data-emotion="${i}" title="${tn(t)}">${u}${g}${f}</span>`;
}
function yb(e) {
  const t = document.createElement("template");
  return t.innerHTML = gb(e).trim(), t.content.firstElementChild;
}
const bb = `
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
function kb(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = bb, t.appendChild(r);
}
function _a(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function vb(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function wb(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? _a(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.fileRefs && e.fileRefs.length && t.set("file_refs", JSON.stringify(e.fileRefs)), e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", _a(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return vb(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function xb(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function Sb(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = t.connectionMode === "klavity" && !!t.klavToken, { inline: d, refs: o } = await _y(e.files, Ry(t.backendUrl, { token: l ? t.klavToken : void 0 }), { projectId: a }), h = [...e.fileRefs || [], ...o], u = wb({
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
    files: d.length ? d : void 0,
    fileRefs: h,
    recordings: e.recordings,
    annotations: e.annotations
  });
  await xb(u), e.reporterEmail && u.set("reporter_email", e.reporterEmail);
  const p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
    const { plane: M } = t;
    u.append("plane_token", M.token), u.append("plane_workspace", M.workspace), u.append("plane_project_id", M.projectId), u.append("plane_host", M.host);
  }
  for (let M = 0; M < s.length; M++) {
    const w = await (await fetch(s[M])).blob();
    u.append("screenshots", w, `screenshot-${M}.png`);
  }
  if (e.screenshotThumbs)
    for (const M of e.screenshotThumbs)
      try {
        u.append("screenshot_thumbs", _a(M), "thumb.jpg");
      } catch {
      }
  const g = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, f = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: g, body: u });
  if (!f.ok) throw new Error(`Klavity backend error ${f.status}: ${await f.text()}`);
  const y = await f.json();
  return {
    issueKey: y.jira_key ?? y.id,
    issueUrl: y.issue_url ?? t.backendUrl
  };
}
const Eb = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Cb = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Mb(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Cb + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Rb(e) {
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
function Tb(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function mo(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Rb(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = Tb(n);
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
function ur(e, t) {
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
function Wc(e, t = 0) {
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
function jc(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function Ab(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = ur(e, 0);
  if (!r) return e;
  const n = ur(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = ur(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const a = ur(e, i + s.width);
  if (!a) return e;
  const c = i + s.width + a.width;
  let l = c;
  const d = a.width === 8 && a.value === 72057594037927940, o = d ? e.length : Math.min(e.length, c + a.value);
  let h = -1, u = null, p = 0;
  for (; l < o; ) {
    const Z = ur(e, l);
    if (!Z) break;
    const V = ur(e, l + Z.width);
    if (!V) break;
    if (Z.rawId === 357149030) {
      h = l, u = V, p = Z.width + V.width;
      break;
    }
    if (Z.rawId === 524531317) break;
    l += Z.width + V.width + V.value;
  }
  if (h === -1 || !u) return e;
  const g = h + p, f = g + u.value;
  let y = g, M = 1e6, w = -1, k = 0, L = 0, S = !1;
  for (; y < f; ) {
    const Z = ur(e, y);
    if (!Z) break;
    const V = ur(e, y + Z.width);
    if (!V) break;
    const He = y + Z.width + V.width, ue = He + V.value;
    if (Z.rawId === 2807729) {
      S = !0;
      let se = 0;
      for (let Je = 0; Je < V.value; Je++)
        se = se * 256 + e[He + Je];
      se > 0 && (M = se);
    } else Z.rawId === 17545 && (w = y, k = ue - y, L = V.value);
    y = ue;
  }
  const x = t * 1e6 / M;
  if (w !== -1 && L === 8) {
    const Z = ur(e, w);
    if (Z) {
      const V = ur(e, w + Z.width);
      if (V && V.value === 8) {
        const He = w + Z.width + V.width, ue = new Uint8Array(e);
        return ue.set(jc(x), He), ue;
      }
    }
  }
  const T = new Uint8Array(11);
  T[0] = 68, T[1] = 137, T[2] = 136, T.set(jc(x), 3);
  let P = null;
  S || (P = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let $;
  if (w === -1) {
    const Z = e.subarray(g, f), V = T.length + (P ? P.length : 0);
    $ = new Uint8Array(Z.length + V);
    let He = 0;
    P && ($.set(P, He), He += P.length), $.set(Z, He), He += Z.length, $.set(T, He);
  } else {
    const Z = e.subarray(g, w), V = e.subarray(w + k, f), He = T.length + (P ? P.length : 0);
    $ = new Uint8Array(Z.length + He + V.length);
    let ue = 0;
    P && ($.set(P, ue), ue += P.length), $.set(Z, ue), ue += Z.length, $.set(T, ue), ue += T.length, $.set(V, ue);
  }
  const z = Wc($.length), re = new Uint8Array(4 + z.length);
  re[0] = 21, re[1] = 73, re[2] = 169, re[3] = 102, re.set(z, 4);
  const K = new Uint8Array(re.length + $.length);
  K.set(re, 0), K.set($, re.length);
  const _ = p + u.value, ze = K.length - _;
  let Ve = null;
  d || (Ve = Wc(a.value + ze, a.width));
  const fe = e.subarray(0, i + s.width), he = Ve || e.subarray(i + s.width, c), Ae = e.subarray(c, h), Fe = K, Oe = e.subarray(h + _), me = fe.length + he.length + Ae.length + Fe.length + Oe.length, nt = new Uint8Array(me);
  let U = 0;
  return nt.set(fe, U), U += fe.length, nt.set(he, U), U += he.length, nt.set(Ae, U), U += Ae.length, nt.set(Fe, U), U += Fe.length, nt.set(Oe, U), U += Oe.length, nt;
}
function Lb(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function _b(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await Lb(e)), n = Ab(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const Ib = 180 * 1e3, Ob = 50 * 1024 * 1024, Nb = 1e6, Pb = 96e3, zb = 15, Hc = 1280, lp = {
  maxDurationMs: Ib,
  maxBytes: Ob
}, $b = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function ja() {
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
function Db(e, t = $b) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function cp(e = ja()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Fb() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function Ub(e = {}, t = ja()) {
  var w, k, L, S, x, T, P, $, z, re, K, _, ze, Ve, fe, he, Ae, Fe, Oe, me, nt;
  const r = { ...lp, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? zb)), a = Db(
    (w = t.MediaRecorder) != null && w.isTypeSupported ? (U) => t.MediaRecorder.isTypeSupported(U) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Fb(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0, o.autoplay = !0;
  try {
    (k = o.setAttribute) == null || k.call(o, "playsinline", ""), (L = o.setAttribute) == null || L.call(o, "autoplay", ""), (S = o.setAttribute) == null || S.call(o, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (x = h.setAttribute) == null || x.call(h, "playsinline", ""), (T = h.setAttribute) == null || T.call(h, "autoplay", ""), (P = h.setAttribute) == null || P.call(h, "muted", "");
  } catch {
  }
  let u = "idle";
  const p = (U) => {
    var Z;
    u = U;
    try {
      (Z = e.onState) == null || Z.call(e, U);
    } catch {
    }
  };
  let g = null;
  if (e.focusCapturedSurface)
    try {
      const U = globalThis.CaptureController;
      typeof U == "function" && (g = new U(), ($ = g.setFocusBehavior) == null || $.call(g, "focus-captured-surface"));
    } catch {
      g = null;
    }
  const f = await t.mediaDevices.getDisplayMedia({
    video: { frameRate: s, displaySurface: e.preferSurface ?? "monitor" },
    audio: !1,
    preferCurrentTab: !1,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "include",
    monitorTypeSurfaces: "include",
    ...g ? { controller: g } : {}
  });
  let y = null;
  const M = () => {
    var U;
    for (const Z of [f, y])
      try {
        (U = Z == null ? void 0 : Z.getTracks) == null || U.call(Z).forEach((V) => {
          var He;
          return (He = V.stop) == null ? void 0 : He.call(V);
        });
      } catch {
      }
  };
  try {
    let U = function() {
      if (!xt) {
        xt = !0;
        try {
          $t.state !== "inactive" && $t.stop();
        } catch {
        }
      }
    };
    const Z = (z = f.getVideoTracks) == null ? void 0 : z.call(f)[0], V = ((re = Z == null ? void 0 : Z.getSettings) == null ? void 0 : re.call(Z)) ?? {}, He = V.width && V.height ? V.width / V.height : 16 / 9;
    l.width = Hc, l.height = Math.round(Hc / He);
    let ue = null, se = !1, Je = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((K = y.getVideoTracks) != null && K.call(y).length)) {
          se = !0, Je = !1;
          try {
            h.srcObject = y, await (((_ = h.play) == null ? void 0 : _.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ue = ((ze = y.getAudioTracks) == null ? void 0 : ze.call(y)[0]) || null, ue && (Je = !1));
      } catch (ae) {
        let Ce = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ue = ((Ve = y.getAudioTracks) == null ? void 0 : Ve.call(y)[0]) || null, ue) {
              Je = !1, Ce = !0;
              try {
                (fe = e.onFallback) == null || fe.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!Ce) {
          try {
            (he = e.onFallback) == null || he.call(e, (ae == null ? void 0 : ae.name) === "NotAllowedError" ? "permissions-policy" : (ae == null ? void 0 : ae.name) || "camera-mic-blocked");
          } catch {
          }
          Je = !0;
        }
      }
    const mt = !!ue;
    if (se)
      try {
        o.srcObject = f, await (((Ae = o.play) == null ? void 0 : Ae.call(o)) ?? Promise.resolve());
      } catch {
      }
    let oe = 0, $e = 0;
    const we = () => {
      if (!d) return;
      const ae = l.width, Ce = l.height;
      if (o.videoWidth) {
        const Ue = o.videoWidth, at = o.videoHeight, Xe = Ue / at, _t = ae / Ce;
        let Ge = ae, gn = Ce, yn = 0, Hn = 0;
        Xe > _t ? (gn = ae / Xe, Hn = (Ce - gn) / 2) : (Ge = Ce * Xe, yn = (ae - Ge) / 2), (yn > 0 || Hn > 0) && (d.fillStyle = "#000", d.fillRect(0, 0, ae, Ce)), d.drawImage(o, yn, Hn, Ge, gn);
      }
      if (se && h.videoWidth) {
        const Ue = Math.round(ae * 0.22), at = Math.round(Ue * (h.videoHeight / h.videoWidth)), Xe = ae - Ue - 20, _t = Ce - at - 20;
        d.drawImage(h, Xe, _t, Ue, at), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(Xe, _t, Ue, at);
      }
      u === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    if (se) {
      let ae = 0;
      const Ce = Math.floor(1e3 / s), Ue = () => {
        ae = t.now(), we();
      }, at = () => {
        oe = t.raf(at), Ue();
      };
      at(), $e = t.setInterval(() => {
        var Xe;
        if (o.paused && !(Z != null && Z.muted))
          try {
            (Xe = o.play) == null || Xe.call(o);
          } catch {
          }
        t.now() - ae >= Ce && Ue();
      }, Math.max(16, Ce));
    }
    const de = [];
    let tt = null;
    if (se) {
      try {
        tt = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const ae = (Fe = tt == null ? void 0 : tt.getVideoTracks) == null ? void 0 : Fe.call(tt)[0];
      ae ? de.push(ae) : Z && de.push(Z);
    } else Z && de.push(Z);
    ue && de.push(ue);
    const ge = new t.MediaStream(de);
    try {
      (Oe = Z == null ? void 0 : Z.addEventListener) == null || Oe.call(Z, "ended", () => U()), (me = Z == null ? void 0 : Z.addEventListener) == null || me.call(Z, "mute", () => {
      }), (nt = Z == null ? void 0 : Z.addEventListener) == null || nt.call(Z, "unmute", () => {
        var ae;
        if (se) {
          try {
            (ae = o.play) == null || ae.call(o);
          } catch {
          }
          we();
        }
      });
    } catch {
    }
    const Le = () => {
      var ae, Ce;
      if (se && typeof document < "u" && !document.hidden) {
        try {
          (ae = o.play) == null || ae.call(o);
        } catch {
        }
        try {
          (Ce = h.play) == null || Ce.call(h);
        } catch {
        }
        we();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", Le);
    } catch {
    }
    const Ke = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? Nb)), Se = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? Pb)), $t = new t.MediaRecorder(ge, { mimeType: a, videoBitsPerSecond: Ke, audioBitsPerSecond: Se }), jn = [];
    let or = 0, jr = 0, We = 0, Ze = 0, pe = 0, xt = !1;
    const Lt = () => {
      if (u === "idle") return 0;
      const ae = t.now() - jr - We;
      return Math.max(0, ae - (Ze ? t.now() - Ze : 0));
    };
    $t.ondataavailable = (ae) => {
      var Ce, Ue;
      if (ae != null && ae.data && ae.data.size) {
        jn.push(ae.data), or += ae.data.size;
        try {
          (Ce = e.onChunk) == null || Ce.call(e, ae.data);
        } catch {
        }
      }
      try {
        (Ue = e.onStats) == null || Ue.call(e, { elapsedMs: Lt(), bytes: or });
      } catch {
      }
      or >= r.maxBytes && U();
    };
    let gr;
    const St = new Promise((ae) => {
      gr = ae;
    }), De = M;
    return $t.onstop = async () => {
      oe && t.caf(oe), $e && (t.clearInterval($e), $e = 0), pe && (t.clearInterval(pe), pe = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", Le);
      } catch {
      }
      const ae = Lt();
      De();
      try {
        o.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      p("stopped");
      const Ce = new Blob(jn, { type: a.split(";")[0] });
      let Ue = Ce;
      if (ae > 0 && (Ce.type.includes("webm") || a.includes("webm")))
        try {
          Ue = await _b(Ce, ae);
        } catch {
          Ue = Ce;
        }
      const at = V.width && V.width > 0 ? V.width : l.width, Xe = V.height && V.height > 0 ? V.height : l.height;
      gr({
        id: c,
        blob: Ue,
        mime: (Ue.type || a || "video/webm").split(";")[0],
        durationMs: ae,
        bytes: Ue.size || or,
        width: se ? l.width : at,
        height: se ? l.height : Xe,
        screenOnly: Je,
        hadCamera: se,
        hadAudio: mt
      });
    }, $t.start(1e3), jr = t.now(), p("recording"), pe = t.setInterval(() => {
      var Ce;
      const ae = Lt();
      try {
        (Ce = e.onStats) == null || Ce.call(e, { elapsedMs: ae, bytes: or });
      } catch {
      }
      ae >= r.maxDurationMs && U();
    }, 200), {
      pause() {
        if (u === "recording") {
          try {
            $t.pause();
          } catch {
          }
          Ze = t.now(), p("paused");
        }
      },
      resume() {
        if (u === "paused") {
          try {
            $t.resume();
          } catch {
          }
          We += t.now() - Ze, Ze = 0, p("recording");
        }
      },
      stop() {
        U();
      },
      state() {
        return u;
      },
      screenOnly() {
        return Je;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return se && y ? y : null;
      },
      done: St
    };
  } catch (U) {
    throw M(), U;
  }
}
function Bb(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function qb(e) {
  return {
    id: e.id,
    dataUrl: await Bb(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Wb(e) {
  var h, u;
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
    const p = (u = r.play) == null ? void 0 : u.call(r);
    p && typeof p.catch == "function" && p.catch(() => {
    });
  } catch {
  }
  t.appendChild(r);
  let n = !1, i = 0, s = 0, a = 0, c = 0;
  const l = (p) => {
    var f;
    n = !0, t.style.cursor = "grabbing";
    const g = t.getBoundingClientRect();
    a = g.left, c = g.top, i = p.clientX, s = p.clientY, t.style.right = "auto", t.style.bottom = "auto", t.style.left = a + "px", t.style.top = c + "px";
    try {
      (f = t.setPointerCapture) == null || f.call(t, p.pointerId);
    } catch {
    }
  }, d = (p) => {
    n && (t.style.left = Math.max(0, a + (p.clientX - i)) + "px", t.style.top = Math.max(0, c + (p.clientY - s)) + "px");
  }, o = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", d), t.addEventListener("pointerup", o), t;
}
async function jb(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? ja();
  return cp(t) ? new Promise((r) => {
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
    let l = !1, d = null, o = !1;
    const h = () => {
      try {
        d == null || d.stop();
      } catch {
      }
    }, u = (x) => {
      x.key === "Escape" && (x.stopPropagation(), x.preventDefault(), f(null));
    }, p = () => {
      h();
    }, g = (x) => {
      o && x.target === n && (x.preventDefault(), x.stopPropagation(), f(null));
    };
    n.addEventListener("pointerdown", g), document.addEventListener("keydown", u, { capture: !0 }), typeof window < "u" && (window.addEventListener("pagehide", p), window.addEventListener("beforeunload", p));
    const f = (x) => {
      if (!l) {
        l = !0, h(), n.removeEventListener("pointerdown", g), document.removeEventListener("keydown", u, { capture: !0 }), typeof window < "u" && (window.removeEventListener("pagehide", p), window.removeEventListener("beforeunload", p));
        try {
          n.remove();
        } catch {
        }
        r(x);
      }
    }, y = (x) => {
      const T = Math.max(0, Math.round(x / 1e3));
      return `${Math.floor(T / 60)}:${String(T % 60).padStart(2, "0")}`;
    }, M = (x) => `${(x / 1048576).toFixed(1)} MB`, w = { ...lp, ...e.caps || {} }, k = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const x = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${x}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(w.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const T = i.querySelector("#klr-cam").checked, P = i.querySelector("#klr-mic").checked;
        L(T, P);
      };
    }, L = async (x, T) => {
      var $;
      let P = null;
      try {
        d = await Ub({
          wantCamera: x,
          wantMic: T,
          caps: e.caps,
          onFallback: (z) => {
            P = z;
          },
          onStats: ({ elapsedMs: z, bytes: re }) => {
            const K = i.querySelector("#klr-timer");
            K && (K.textContent = "REC " + y(z));
            const _ = i.querySelector("#klr-meta");
            _ && (_.innerHTML = `${y(Math.max(0, w.maxDurationMs - z))} left<br>~${M(re)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(P);
      try {
        const z = Wb(($ = d == null ? void 0 : d.cameraStream) == null ? void 0 : $.call(d));
        z && n.appendChild(z);
      } catch {
      }
      d.done.then(async (z) => {
        f(await qb(z));
      });
    }, S = (x) => {
      const T = x === "camera-blocked", $ = T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!x && !T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + $;
      const z = i.querySelector("#klr-pause");
      z.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), z.textContent = "Resume") : (d.resume(), z.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    k();
  }) : null;
}
async function Yc(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((g, f) => {
      const y = new Image();
      y.onload = () => g(y), y.onerror = f, y.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight, c = 16e3;
    let l = s > r ? r / s : 1;
    a * l > c && (l = c / a);
    const d = Math.round(s * l), o = Math.round(a * l), h = document.createElement("canvas");
    h.width = d, h.height = o;
    const u = h.getContext("2d");
    if (!u) return e;
    u.fillStyle = "#fff", u.fillRect(0, 0, d, o), u.drawImage(i, 0, 0, d, o);
    const p = h.toDataURL("image/jpeg", n);
    return p.length < e.length ? p : e;
  } catch {
    return e;
  }
}
async function Hb(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((p, g) => {
      const f = new Image();
      f.onload = () => p(f), f.onerror = g, f.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight;
    if (!s || !a) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), d = Math.round(a * c), o = document.createElement("canvas");
    o.width = l, o.height = d;
    const h = o.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, d), h.drawImage(i, 0, 0, l, d);
    const u = o.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
var Yb = Object.defineProperty, Vb = (e, t, r) => t in e ? Yb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, J = (e, t, r) => Vb(e, typeof t != "symbol" ? t + "" : t, r), Vc, Kb = Object.defineProperty, Xb = (e, t, r) => t in e ? Kb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Kc = (e, t, r) => Xb(e, typeof t != "symbol" ? t + "" : t, r), ut = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(ut || {});
const Xc = {
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
}, Gc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Fi = {}, up = {}, Gb = () => !!globalThis.Zone;
function Ha(e) {
  if (Fi[e])
    return Fi[e];
  const t = globalThis[e], r = t.prototype, n = e in Xc ? Xc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in Gc ? Gc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Gb())
    return Fi[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), up[e] = () => c.remove()) : c.remove(), Fi[e] = d;
  } catch {
    return r;
  }
}
const go = {};
function Er(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (go[i])
    return go[i].call(
      t
    );
  const s = Ha(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (go[i] = a, a.call(t)) : t[r];
}
const yo = {};
function dp(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (yo[n])
    return yo[n].bind(
      t
    );
  const s = Ha(e)[r];
  return typeof s != "function" ? t[r] : (yo[n] = s, s.bind(t));
}
function Jb(e) {
  return Er("Node", e, "ownerDocument");
}
function Zb(e) {
  return Er("Node", e, "childNodes");
}
function Qb(e) {
  return Er("Node", e, "parentNode");
}
function ek(e) {
  return Er("Node", e, "parentElement");
}
function tk(e) {
  return Er("Node", e, "textContent");
}
function rk(e, t) {
  return dp("Node", e, "contains")(t);
}
function nk(e) {
  return dp("Node", e, "getRootNode")();
}
function ik(e) {
  return !e || !("host" in e) ? null : Er("ShadowRoot", e, "host");
}
function sk(e) {
  return e.styleSheets;
}
function ok(e) {
  return !e || !("shadowRoot" in e) ? null : Er("Element", e, "shadowRoot");
}
function ak(e, t) {
  return Er("Element", e, "querySelector")(t);
}
function lk(e, t) {
  return Er("Element", e, "querySelectorAll")(t);
}
function ck() {
  return [
    Ha("MutationObserver").constructor,
    up.MutationObserver ?? (() => {
    })
  ];
}
let pp = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (pp = () => (/* @__PURE__ */ new Date()).getTime());
function uk(e, t, r) {
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
const wt = {
  ownerDocument: Jb,
  childNodes: Zb,
  parentNode: Qb,
  parentElement: ek,
  textContent: tk,
  contains: rk,
  getRootNode: nk,
  host: ik,
  styleSheets: sk,
  shadowRoot: ok,
  querySelector: ak,
  querySelectorAll: lk,
  nowTimestamp: pp,
  mutationObserverCtor: ck,
  patch: uk
};
function hp(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function oi(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && wt.host(e) || null
  );
  return !!(t && "shadowRoot" in t && wt.shadowRoot(t) === e);
}
function ai(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function dk(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function pk(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Ia(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => fp(i, r)
    ).join("");
    return dk(n);
  } catch {
    return null;
  }
}
function fp(e, t) {
  if (fk(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Ia(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      pk(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? as(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return mk(e) && e.selectorText.includes(":") && (r = hk(r)), t ? as(r, t) : r;
  }
}
function hk(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function fk(e) {
  return "styleSheet" in e;
}
function mk(e) {
  return "selectorText" in e;
}
class mp {
  constructor() {
    Kc(this, "idNodeMap", /* @__PURE__ */ new Map()), Kc(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function gk() {
  return new mp();
}
function ss({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && un(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function un(e) {
  return e.toLowerCase();
}
const Jc = "__rrweb_original__";
function yk(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = Jc in s ? s[Jc] : s;
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
function os(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    un(t)
  ) : null;
}
function gp(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function bk(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const kk = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, vk = /^(?:[a-z+]+:)?\/\//i, wk = /^www\..*/i, xk = /^(data:)([^,]*),(.*)/i;
function as(e, t) {
  return (e || "").replace(
    kk,
    (r, n, i, s, a, c) => {
      const l = i || a || c, d = n || s || "";
      if (!l)
        return r;
      if (vk.test(l) || wk.test(l))
        return `url(${d}${l}${d})`;
      if (xk.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${bk(t) + l}${d})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const u of h)
        u !== "." && (u === ".." ? o.pop() : o.push(u));
      return `url(${d}${o.join("/")}${d})`;
    }
  );
}
function Ui(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Sk(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Ui(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = Ui(
          n[l].textContent,
          r
        ), o = 100;
        let h = 3;
        for (; h < d.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (d[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        d.indexOf(d.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < d.length; h++) {
          let u = d.substring(0, h), p = a.split(u), g = -1;
          if (p.length === 2)
            g = p[0].length;
          else if (p.length > 2 && p[0] === "" && n[l - 1].textContent !== "")
            g = a.indexOf(u, 1);
          else if (p.length === 1) {
            if (u = u.substring(
              0,
              u.length - 1
            ), p = a.split(u), p.length <= 1)
              return i.push(e), i;
            h = o + 1;
          } else h === d.length - 1 && (g = a.indexOf(u));
          if (p.length >= 2 && h > o) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const y = Ui(f).length;
              g = a.indexOf(u, y);
            }
            g === -1 && (g = p[0].length);
          }
          if (g !== -1) {
            let f = Math.floor(g / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = Ui(
                e.substring(0, f),
                r
              );
              if (y.length === g) {
                i.push(e.substring(0, f)), e = e.substring(f), a = a.substring(g);
                break;
              } else y.length < g ? f += Math.max(
                1,
                Math.floor((g - y.length) / c)
              ) : f -= Math.max(
                1,
                Math.floor((y.length - g) * c)
              );
            }
            break;
          }
        }
      }
  }
  return i.push(e), i;
}
function Ek(e, t) {
  return Sk(e, t).join("/* rr_split */");
}
let Ck = 1;
const Mk = new RegExp("[^a-z0-9-_:]"), pi = -2;
function yp() {
  return Ck++;
}
function Rk(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = un(e.tagName);
  return Mk.test(t) ? "div" : t;
}
let Mn, Zc;
const Tk = /^[^ \t\n\r\u000c]+/, Ak = /^[, \t\n\r\u000c]+/;
function Lk(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(Ak), !(r >= t.length); ) {
    let s = n(Tk);
    if (s.slice(-1) === ",")
      s = _n(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = _n(e, s);
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
const Qc = /* @__PURE__ */ new WeakMap();
function _n(e, t) {
  return !t || t.trim() === "" ? t : Ya(e, t);
}
function _k(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Ya(e, t) {
  let r = Qc.get(e);
  if (r || (r = e.createElement("a"), Qc.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function bp(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? _n(e, n) : r === "srcset" ? Lk(e, n) : r === "style" ? as(n, Ya(e)) : t === "object" && r === "data" ? _n(e, n) : n);
}
function kp(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Ik(e, t, r) {
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
function ls(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? ls(wt.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? ls(wt.parentNode(e), t, r) : !1;
}
function vp(e, t, r, n) {
  let i;
  if (hp(e)) {
    if (i = e, !wt.childNodes(i).length)
      return !1;
  } else {
    if (wt.parentElement(e) === null)
      return !1;
    i = wt.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (ls(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Ok(e, t, r) {
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
function Nk(e, t, r) {
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
function Pk(e, t) {
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
    inlineImages: u,
    recordCanvas: p,
    keepIframeSrcFn: g,
    newlyAddedElement: f = !1,
    cssCaptured: y = !1
  } = t, M = zk(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: ut.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: ut.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: ut.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: M
      };
    case e.ELEMENT_NODE:
      return Dk(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: o,
        dataURLOptions: h,
        inlineImages: u,
        recordCanvas: p,
        keepIframeSrcFn: g,
        newlyAddedElement: f,
        rootId: M
      });
    case e.TEXT_NODE:
      return $k(e, {
        doc: r,
        needsMask: a,
        maskTextFn: d,
        rootId: M,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: ut.CDATA,
        textContent: "",
        rootId: M
      };
    case e.COMMENT_NODE:
      return {
        type: ut.Comment,
        textContent: wt.textContent(e) || "",
        rootId: M
      };
    default:
      return !1;
  }
}
function zk(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function $k(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = wt.parentNode(e), c = a && a.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = wt.textContent(e), d && l && (l = as(l, Ya(t.doc)))), !d && !o && l && r && (l = n ? n(l, wt.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: ut.Text,
    textContent: l || "",
    rootId: i
  };
}
function Dk(e, t) {
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
    newlyAddedElement: u = !1,
    rootId: p
  } = t, g = Ik(e, n, i), f = Rk(e);
  let y = {};
  const M = e.attributes.length;
  for (let k = 0; k < M; k++) {
    const L = e.attributes[k];
    kp(f, L.name, L.value) || (y[L.name] = bp(
      r,
      f,
      un(L.name),
      L.value
    ));
  }
  if (f === "link" && s) {
    const k = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let L = null;
    k && (L = Ia(k)), L && (delete y.rel, delete y.href, y._cssText = L);
  }
  if (f === "style" && e.sheet) {
    let k = Ia(
      e.sheet
    );
    k && (e.childNodes.length > 1 && (k = Ek(k, e)), y._cssText = k);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const k = e.value, L = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && k ? y.value = ss({
      element: e,
      type: os(e),
      tagName: f,
      value: k,
      maskInputOptions: a,
      maskInputFn: c
    }) : L && (y.checked = L);
  }
  if (f === "option" && (e.selected && !a.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      yk(e) || (y.rr_dataURL = e.toDataURL(
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
  if (f === "img" && d) {
    Mn || (Mn = r.createElement("canvas"), Zc = Mn.getContext("2d"));
    const k = e, L = k.currentSrc || k.getAttribute("src") || "<unknown-src>", S = k.crossOrigin, x = () => {
      k.removeEventListener("load", x);
      try {
        Mn.width = k.naturalWidth, Mn.height = k.naturalHeight, Zc.drawImage(k, 0, 0), y.rr_dataURL = Mn.toDataURL(
          l.type,
          l.quality
        );
      } catch (T) {
        if (k.crossOrigin !== "anonymous") {
          k.crossOrigin = "anonymous", k.complete && k.naturalWidth !== 0 ? x() : k.addEventListener("load", x);
          return;
        } else
          console.warn(
            `Cannot inline img src=${L}! Error: ${T}`
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
  if (u || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), g) {
    const { width: k, height: L } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${k}px`,
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
    type: ut.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: _k(e) || void 0,
    needBlock: g,
    rootId: p,
    isCustom: w
  };
}
function Ye(e) {
  return e == null ? "" : e.toLowerCase();
}
function wp(e) {
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
function Fk(e, t) {
  if (t.comment && e.type === ut.Comment)
    return !0;
  if (e.type === ut.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && gp(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (Ye(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || Ye(e.attributes.name) === "application-name" || Ye(e.attributes.rel) === "icon" || Ye(e.attributes.rel) === "apple-touch-icon" || Ye(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && Ye(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (Ye(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      Ye(e.attributes.name).match(/^(og|twitter):/) || Ye(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (Ye(e.attributes.name) === "robots" || Ye(e.attributes.name) === "googlebot" || Ye(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (Ye(e.attributes.name) === "author" || Ye(e.attributes.name) === "generator" || Ye(e.attributes.name) === "framework" || Ye(e.attributes.name) === "publisher" || Ye(e.attributes.name) === "progid" || Ye(e.attributes.property).match(/^article:/) || Ye(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (Ye(e.attributes.name) === "google-site-verification" || Ye(e.attributes.name) === "yandex-verification" || Ye(e.attributes.name) === "csrf-token" || Ye(e.attributes.name) === "p:domain_verify" || Ye(e.attributes.name) === "verify-v1" || Ye(e.attributes.name) === "verification" || Ye(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function In(e, t) {
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
    maskInputFn: u,
    slimDOMOptions: p,
    dataURLOptions: g = {},
    inlineImages: f = !1,
    recordCanvas: y = !1,
    onSerialize: M,
    onIframeLoad: w,
    iframeLoadTimeout: k = 5e3,
    onStylesheetLoad: L,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: x = () => !1,
    newlyAddedElement: T = !1,
    cssCaptured: P = !1
  } = t;
  let { needsMask: $ } = t, { preserveWhiteSpace: z = !0 } = t;
  $ || ($ = vp(
    e,
    a,
    c,
    $ === void 0
  ));
  const re = Pk(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: $,
    inlineStylesheet: d,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: u,
    dataURLOptions: g,
    inlineImages: f,
    recordCanvas: y,
    keepIframeSrcFn: x,
    newlyAddedElement: T,
    cssCaptured: P
  });
  if (!re)
    return console.warn(e, "not serialized"), null;
  let K;
  n.hasNode(e) ? K = n.getId(e) : Fk(re, p) || !z && re.type === ut.Text && !re.textContent.replace(/^\s+|\s+$/gm, "").length ? K = pi : K = yp();
  const _ = Object.assign(re, { id: K });
  if (n.add(e, _), K === pi)
    return null;
  M && M(e);
  let ze = !l;
  if (_.type === ut.Element) {
    ze = ze && !_.needBlock, delete _.needBlock;
    const fe = wt.shadowRoot(e);
    fe && ai(fe) && (_.isShadowHost = !0);
  }
  if ((_.type === ut.Document || _.type === ut.Element) && ze) {
    p.headWhitespace && _.type === ut.Element && _.tagName === "head" && (z = !1);
    const fe = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: $,
      maskTextClass: a,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: d,
      maskInputOptions: o,
      maskTextFn: h,
      maskInputFn: u,
      slimDOMOptions: p,
      dataURLOptions: g,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: z,
      onSerialize: M,
      onIframeLoad: w,
      iframeLoadTimeout: k,
      onStylesheetLoad: L,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: x,
      cssCaptured: !1
    };
    if (!(_.type === ut.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === ut.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (fe.cssCaptured = !0);
      for (const Ae of Array.from(wt.childNodes(e))) {
        const Fe = In(Ae, fe);
        Fe && _.childNodes.push(Fe);
      }
    }
    let he = null;
    if (hp(e) && (he = wt.shadowRoot(e)))
      for (const Ae of Array.from(wt.childNodes(he))) {
        const Fe = In(Ae, fe);
        Fe && (ai(he) && (Fe.isShadow = !0), _.childNodes.push(Fe));
      }
  }
  const Ve = wt.parentNode(e);
  return Ve && oi(Ve) && ai(Ve) && (_.isShadow = !0), _.type === ut.Element && _.tagName === "iframe" && Ok(
    e,
    () => {
      const fe = e.contentDocument;
      if (fe && w) {
        const he = In(fe, {
          doc: fe,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: p,
          dataURLOptions: g,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: w,
          iframeLoadTimeout: k,
          onStylesheetLoad: L,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        he && w(
          e,
          he
        );
      }
    },
    k
  ), _.type === ut.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && gp(_.attributes.href) === "css") && Nk(
    e,
    () => {
      if (L) {
        const fe = In(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: p,
          dataURLOptions: g,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: w,
          iframeLoadTimeout: k,
          onStylesheetLoad: L,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        fe && L(
          e,
          fe
        );
      }
    },
    S
  ), _;
}
function Uk(e, t) {
  const {
    mirror: r = new mp(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: a = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: d = !1,
    maskAllInputs: o = !1,
    maskTextFn: h,
    maskInputFn: u,
    slimDOM: p = !1,
    dataURLOptions: g,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: w,
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
  } : o, T = wp(p);
  return In(e, {
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
    maskInputFn: u,
    slimDOMOptions: T,
    dataURLOptions: g,
    inlineImages: l,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: w,
    onStylesheetLoad: k,
    stylesheetLoadTimeout: L,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function Bk(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function qk(e) {
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
var Bi = { exports: {} }, eu;
function Wk() {
  if (eu) return Bi.exports;
  eu = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Bi.exports = t(), Bi.exports.createColors = t, Bi.exports;
}
const jk = {}, Hk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: jk
}, Symbol.toStringTag, { value: "Module" })), nr = /* @__PURE__ */ qk(Hk);
var bo, tu;
function Va() {
  if (tu) return bo;
  tu = 1;
  let e = /* @__PURE__ */ Wk(), t = nr;
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
        let { bold: u, gray: p, red: g } = e.createColors(!0);
        o = (f) => u(g(f)), h = (f) => p(f);
      } else
        o = h = (u) => u;
      return a.slice(c, l).map((u, p) => {
        let g = c + 1 + p, f = " " + (" " + g).slice(-d) + " | ";
        if (g === this.line) {
          let y = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + u + `
 ` + y + o("^");
        }
        return " " + h(f) + u;
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
  return bo = r, r.default = r, bo;
}
var qi = {}, ru;
function Ka() {
  return ru || (ru = 1, qi.isClean = Symbol("isClean"), qi.my = Symbol("my")), qi;
}
var ko, nu;
function xp() {
  if (nu) return ko;
  nu = 1;
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
  return ko = r, r.default = r, ko;
}
var vo, iu;
function ys() {
  if (iu) return vo;
  iu = 1;
  let e = xp();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return vo = t, t.default = t, vo;
}
var wo, su;
function bs() {
  if (su) return wo;
  su = 1;
  let { isClean: e, my: t } = Ka(), r = Va(), n = xp(), i = ys();
  function s(c, l) {
    let d = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], u = typeof h;
      o === "parent" && u === "object" ? l && (d[o] = l) : o === "source" ? d[o] = h : Array.isArray(h) ? d[o] = h.map((p) => s(p, d)) : (u === "object" && h !== null && (h = s(h)), d[o] = h);
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
      let o = d || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let p = 0; p < l; p++)
        o[p] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(l.word);
        u !== -1 && (d = this.positionInside(u, h), o = this.positionInside(u + l.word.length, h));
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
      let u = 0;
      for (let p in this) {
        if (!Object.prototype.hasOwnProperty.call(this, p) || p === "parent" || p === "proxyCache") continue;
        let g = this[p];
        if (Array.isArray(g))
          o[p] = g.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof g == "object" && g.toJSON)
          o[p] = g.toJSON(null, d);
        else if (p === "source") {
          let f = d.get(g.input);
          f == null && (f = u, d.set(g.input, u), u++), o[p] = {
            end: g.end,
            inputId: f,
            start: g.start
          };
        } else
          o[p] = g;
      }
      return h && (o.inputs = [...d.keys()].map((p) => p.toJSON())), o;
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
      for (let u in o) h[u] = o[u];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return wo = a, a.default = a, wo;
}
var xo, ou;
function ks() {
  if (ou) return xo;
  ou = 1;
  let e = bs();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return xo = t, t.default = t, xo;
}
var So, au;
function Yk() {
  if (au) return So;
  au = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return So = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, So;
}
var Eo, lu;
function Sp() {
  if (lu) return Eo;
  lu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = nr, { existsSync: r, readFileSync: n } = nr, { dirname: i, join: s } = nr;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, o) {
      if (o.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, u = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, p = /^data:application\/json,/;
      if (u.test(d) || p.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (o.test(d) || h.test(d))
        return a(d.substr(RegExp.lastMatch.length));
      let g = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + g);
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
      let h = d.lastIndexOf(o.pop()), u = d.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
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
  return Eo = c, c.default = c, Eo;
}
var Co, cu;
function vs() {
  if (cu) return Co;
  cu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = nr, { fileURLToPath: r, pathToFileURL: n } = nr, { isAbsolute: i, resolve: s } = nr, { nanoid: a } = /* @__PURE__ */ Yk(), c = nr, l = Va(), d = Sp(), o = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class p {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!u || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), u && h) {
        let M = new d(this.css, y);
        if (M.text) {
          this.map = M;
          let w = M.consumer().file;
          !this.file && w && (this.file = this.mapResolve(w));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, w = {}) {
      let k, L, S;
      if (y && typeof y == "object") {
        let T = y, P = M;
        if (typeof T.offset == "number") {
          let $ = this.fromOffset(T.offset);
          y = $.line, M = $.col;
        } else
          y = T.line, M = T.column;
        if (typeof P.offset == "number") {
          let $ = this.fromOffset(P.offset);
          L = $.line, S = $.col;
        } else
          L = P.line, S = P.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        w.plugin
      ) : k = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        w.plugin
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
      let w = 0;
      if (f >= y)
        w = M.length - 1;
      else {
        let k = M.length - 2, L;
        for (; w < k; )
          if (L = w + (k - w >> 1), f < M[L])
            k = L - 1;
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
      let k = this.map.consumer(), L = k.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = k.originalPositionFor({ column: w, line: M }));
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
      let P = k.sourceContentFor(L.source);
      return P && (T.source = P), T;
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
  return Co = p, p.default = p, c && c.registerInput && c.registerInput(p), Co;
}
var Mo, uu;
function Ep() {
  if (uu) return Mo;
  uu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = nr, { dirname: r, relative: n, resolve: i, sep: s } = nr, { pathToFileURL: a } = nr, c = vs(), l = !!(e && t), d = !!(r && i && n && s);
  class o {
    constructor(u, p, g, f) {
      this.stringify = u, this.mapOpts = g.map || {}, this.root = p, this.opts = g, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let p = `
`;
      this.css.includes(`\r
`) && (p = `\r
`), this.css += p + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let p = this.toUrl(this.path(u.file)), g = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, p, this.toUrl(this.path(g)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let p = this.root.nodes.length - 1; p >= 0; p--)
            u = this.root.nodes[p], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(p);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && l && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (p) => {
          u += p;
        }), [u];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let u = this.previous()[0].consumer();
        u.file = this.outputFile(), this.map = t.fromSourceMap(u, {
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
      let u = 1, p = 1, g = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, y, M;
      this.stringify(this.root, (w, k, L) => {
        if (this.css += w, k && L !== "end" && (f.generated.line = u, f.generated.column = p - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = g, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = w.match(/\n/g), y ? (u += y.length, M = w.lastIndexOf(`
`), p = w.length - M) : p += w.length, k && L !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = u, f.generated.column = p - 2, this.map.addMapping(f)) : (f.source = g, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = p - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((u) => u.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let u = this.mapOpts.annotation;
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((p) => p.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((u) => u.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(u) {
      if (this.mapOpts.absolute || u.charCodeAt(0) === 60 || /^\w+:\/\//.test(u)) return u;
      let p = this.memoizedPaths.get(u);
      if (p) return p;
      let g = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (g = r(i(g, this.mapOpts.annotation)));
      let f = n(g, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let p = u.source.input.map;
              this.previousMaps.includes(p) || this.previousMaps.push(p);
            }
          });
        else {
          let u = new c(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((p) => {
          if (p.source) {
            let g = p.source.input.from;
            if (g && !u[g]) {
              u[g] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(g) : this.toUrl(this.path(g));
              this.map.setSourceContent(f, p.source.input.css);
            }
          }
        });
      else if (this.css) {
        let p = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(p, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let p = this.memoizedFileURLs.get(u);
      if (p) return p;
      if (a) {
        let g = a(u).toString();
        return this.memoizedFileURLs.set(u, g), g;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let p = this.memoizedURLs.get(u);
      if (p) return p;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let g = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, g), g;
    }
  }
  return Mo = o, Mo;
}
var Ro, du;
function ws() {
  if (du) return Ro;
  du = 1;
  let e = bs();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ro = t, t.default = t, Ro;
}
var To, pu;
function pn() {
  if (pu) return To;
  pu = 1;
  let { isClean: e, my: t } = Ka(), r = ks(), n = ws(), i = bs(), s, a, c, l;
  function d(u) {
    return u.map((p) => (p.nodes && (p.nodes = d(p.nodes)), delete p.source, p));
  }
  function o(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let p of u.proxyOf.nodes)
        o(p);
  }
  class h extends i {
    append(...p) {
      for (let g of p) {
        let f = this.normalize(g, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(p) {
      if (super.cleanRaws(p), this.nodes)
        for (let g of this.nodes) g.cleanRaws(p);
    }
    each(p) {
      if (!this.proxyOf.nodes) return;
      let g = this.getIterator(), f, y;
      for (; this.indexes[g] < this.proxyOf.nodes.length && (f = this.indexes[g], y = p(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[g] += 1;
      return delete this.indexes[g], y;
    }
    every(p) {
      return this.nodes.every(p);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let p = this.lastEach;
      return this.indexes[p] = 0, p;
    }
    getProxyProcessor() {
      return {
        get(p, g) {
          return g === "proxyOf" ? p : p[g] ? g === "each" || typeof g == "string" && g.startsWith("walk") ? (...f) => p[g](
            ...f.map((y) => typeof y == "function" ? (M, w) => y(M.toProxy(), w) : y)
          ) : g === "every" || g === "some" ? (f) => p[g](
            (y, ...M) => f(y.toProxy(), ...M)
          ) : g === "root" ? () => p.root().toProxy() : g === "nodes" ? p.nodes.map((f) => f.toProxy()) : g === "first" || g === "last" ? p[g].toProxy() : p[g] : p[g];
        },
        set(p, g, f) {
          return p[g] === f || (p[g] = f, (g === "name" || g === "params" || g === "selector") && p.markDirty()), !0;
        }
      };
    }
    index(p) {
      return typeof p == "number" ? p : (p.proxyOf && (p = p.proxyOf), this.proxyOf.nodes.indexOf(p));
    }
    insertAfter(p, g) {
      let f = this.index(p), y = this.normalize(g, this.proxyOf.nodes[f]).reverse();
      f = this.index(p);
      for (let w of y) this.proxyOf.nodes.splice(f + 1, 0, w);
      let M;
      for (let w in this.indexes)
        M = this.indexes[w], f < M && (this.indexes[w] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(p, g) {
      let f = this.index(p), y = f === 0 ? "prepend" : !1, M = this.normalize(g, this.proxyOf.nodes[f], y).reverse();
      f = this.index(p);
      for (let k of M) this.proxyOf.nodes.splice(f, 0, k);
      let w;
      for (let k in this.indexes)
        w = this.indexes[k], f <= w && (this.indexes[k] = w + M.length);
      return this.markDirty(), this;
    }
    normalize(p, g) {
      if (typeof p == "string")
        p = d(s(p).nodes);
      else if (typeof p > "u")
        p = [];
      else if (Array.isArray(p)) {
        p = p.slice(0);
        for (let y of p)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (p.type === "root" && this.type !== "document") {
        p = p.nodes.slice(0);
        for (let y of p)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (p.type)
        p = [p];
      else if (p.prop) {
        if (typeof p.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof p.value != "string" && (p.value = String(p.value)), p = [new r(p)];
      } else if (p.selector)
        p = [new a(p)];
      else if (p.name)
        p = [new c(p)];
      else if (p.text)
        p = [new n(p)];
      else
        throw new Error("Unknown node type in node creation");
      return p.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && g && typeof g.raws.before < "u" && (y.raws.before = g.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...p) {
      p = p.reverse();
      for (let g of p) {
        let f = this.normalize(g, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
      }
      return this.markDirty(), this;
    }
    push(p) {
      return p.parent = this, this.proxyOf.nodes.push(p), this;
    }
    removeAll() {
      for (let p of this.proxyOf.nodes) p.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(p) {
      p = this.index(p), this.proxyOf.nodes[p].parent = void 0, this.proxyOf.nodes.splice(p, 1);
      let g;
      for (let f in this.indexes)
        g = this.indexes[f], g >= p && (this.indexes[f] = g - 1);
      return this.markDirty(), this;
    }
    replaceValues(p, g, f) {
      return f || (f = g, g = {}), this.walkDecls((y) => {
        g.props && !g.props.includes(y.prop) || g.fast && !y.value.includes(g.fast) || (y.value = y.value.replace(p, f));
      }), this.markDirty(), this;
    }
    some(p) {
      return this.nodes.some(p);
    }
    walk(p) {
      return this.each((g, f) => {
        let y;
        try {
          y = p(g, f);
        } catch (M) {
          throw g.addToError(M);
        }
        return y !== !1 && g.walk && (y = g.walk(p)), y;
      });
    }
    walkAtRules(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && p.test(f.name))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "atrule")
          return g(f, y);
      }));
    }
    walkComments(p) {
      return this.walk((g, f) => {
        if (g.type === "comment")
          return p(g, f);
      });
    }
    walkDecls(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && p.test(f.prop))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "decl")
          return g(f, y);
      }));
    }
    walkRules(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && p.test(f.selector))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "rule")
          return g(f, y);
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
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    a = u;
  }, h.registerAtRule = (u) => {
    c = u;
  }, h.registerRoot = (u) => {
    l = u;
  }, To = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, c.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, a.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, l.prototype), u[t] = !0, u.nodes && u.nodes.forEach((p) => {
      h.rebuild(p);
    });
  }, To;
}
var Ao, hu;
function Xa() {
  if (hu) return Ao;
  hu = 1;
  let e = pn(), t, r;
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
  }, Ao = n, n.default = n, Ao;
}
var Lo, fu;
function Cp() {
  if (fu) return Lo;
  fu = 1;
  let e = {};
  return Lo = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Lo;
}
var _o, mu;
function Mp() {
  if (mu) return _o;
  mu = 1;
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
  return _o = e, e.default = e, _o;
}
var Io, gu;
function Ga() {
  if (gu) return Io;
  gu = 1;
  let e = Mp();
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
  return Io = t, t.default = t, Io;
}
var Oo, yu;
function Vk() {
  if (yu) return Oo;
  yu = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, u = 41, p = 123, g = 125, f = 59, y = 42, M = 58, w = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return Oo = function(P, $ = {}) {
    let z = P.css.valueOf(), re = $.ignoreErrors, K, _, ze, Ve, fe, he, Ae, Fe, Oe, me, nt = z.length, U = 0, Z = [], V = [];
    function He() {
      return U;
    }
    function ue(oe) {
      throw P.error("Unclosed " + oe, U);
    }
    function se() {
      return V.length === 0 && U >= nt;
    }
    function Je(oe) {
      if (V.length) return V.pop();
      if (U >= nt) return;
      let $e = oe ? oe.ignoreUnclosed : !1;
      switch (K = z.charCodeAt(U), K) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = U;
          do
            _ += 1, K = z.charCodeAt(_);
          while (K === s || K === i || K === c || K === l || K === a);
          me = ["space", z.slice(U, _)], U = _ - 1;
          break;
        }
        case d:
        case o:
        case p:
        case g:
        case M:
        case f:
        case u: {
          let we = String.fromCharCode(K);
          me = [we, we, U];
          break;
        }
        case h: {
          if (Fe = Z.length ? Z.pop()[1] : "", Oe = z.charCodeAt(U + 1), Fe === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            _ = U;
            do {
              if (he = !1, _ = z.indexOf(")", _ + 1), _ === -1)
                if (re || $e) {
                  _ = U;
                  break;
                } else
                  ue("bracket");
              for (Ae = _; z.charCodeAt(Ae - 1) === r; )
                Ae -= 1, he = !he;
            } while (he);
            me = ["brackets", z.slice(U, _ + 1), U, _], U = _;
          } else
            _ = z.indexOf(")", U + 1), Ve = z.slice(U, _ + 1), _ === -1 || S.test(Ve) ? me = ["(", "(", U] : (me = ["brackets", Ve, U, _], U = _);
          break;
        }
        case e:
        case t: {
          ze = K === e ? "'" : '"', _ = U;
          do {
            if (he = !1, _ = z.indexOf(ze, _ + 1), _ === -1)
              if (re || $e) {
                _ = U + 1;
                break;
              } else
                ue("string");
            for (Ae = _; z.charCodeAt(Ae - 1) === r; )
              Ae -= 1, he = !he;
          } while (he);
          me = ["string", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case w: {
          k.lastIndex = U + 1, k.test(z), k.lastIndex === 0 ? _ = z.length - 1 : _ = k.lastIndex - 2, me = ["at-word", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case r: {
          for (_ = U, fe = !0; z.charCodeAt(_ + 1) === r; )
            _ += 1, fe = !fe;
          if (K = z.charCodeAt(_ + 1), fe && K !== n && K !== s && K !== i && K !== c && K !== l && K !== a && (_ += 1, x.test(z.charAt(_)))) {
            for (; x.test(z.charAt(_ + 1)); )
              _ += 1;
            z.charCodeAt(_ + 1) === s && (_ += 1);
          }
          me = ["word", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        default: {
          K === n && z.charCodeAt(U + 1) === y ? (_ = z.indexOf("*/", U + 2) + 1, _ === 0 && (re || $e ? _ = z.length : ue("comment")), me = ["comment", z.slice(U, _ + 1), U, _], U = _) : (L.lastIndex = U + 1, L.test(z), L.lastIndex === 0 ? _ = z.length - 1 : _ = L.lastIndex - 2, me = ["word", z.slice(U, _ + 1), U, _], Z.push(me), U = _);
          break;
        }
      }
      return U++, me;
    }
    function mt(oe) {
      V.push(oe);
    }
    return {
      back: mt,
      endOfFile: se,
      nextToken: Je,
      position: He
    };
  }, Oo;
}
var No, bu;
function Ja() {
  if (bu) return No;
  bu = 1;
  let e = pn();
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
  return No = t, t.default = t, e.registerAtRule(t), No;
}
var Po, ku;
function gi() {
  if (ku) return Po;
  ku = 1;
  let e = pn(), t, r;
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
  }, Po = n, n.default = n, e.registerRoot(n), Po;
}
var zo, vu;
function Rp() {
  if (vu) return zo;
  vu = 1;
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
  return zo = e, e.default = e, zo;
}
var $o, wu;
function Za() {
  if (wu) return $o;
  wu = 1;
  let e = pn(), t = Rp();
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
  return $o = r, r.default = r, e.registerRule(r), $o;
}
var Do, xu;
function Kk() {
  if (xu) return Do;
  xu = 1;
  let e = ks(), t = Vk(), r = ws(), n = Ja(), i = gi(), s = Za();
  const a = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let o = d.length - 1; o >= 0; o--) {
      let h = d[o], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let u, p, g, f = !1, y = !1, M = [], w = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), u = o[0], u === "(" || u === "[" ? w.push(u === "(" ? ")" : "]") : u === "{" && w.length > 0 ? w.push("}") : u === w[w.length - 1] && w.pop(), w.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            y = !0;
            break;
          } else if (u === "}") {
            if (M.length > 0) {
              for (g = M.length - 1, p = M[g]; p && p[0] === "space"; )
                p = M[--g];
              p && (h.source.end = this.getPosition(p[3] || p[2]), h.source.end.offset++);
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
      let u = 0, p;
      for (let g = h - 1; g >= 0 && (p = o[g], !(p[0] !== "space" && (u += 1, u === 2))); g--)
        ;
      throw this.input.error(
        "Missed semicolon",
        p[0] === "word" ? p[3] + 1 : p[2]
      );
    }
    colon(o) {
      let h = 0, u, p, g;
      for (let [f, y] of o.entries()) {
        if (u = y, p = u[0], p === "(" && (h += 1), p === ")" && (h -= 1), h === 0 && p === ":")
          if (!g)
            this.doubleColon(u);
          else {
            if (g[0] === "word" && g[1] === "progid")
              continue;
            return f;
          }
        g = u;
      }
      return !1;
    }
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let u = o[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let p = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = p[2], h.raws.left = p[1], h.raws.right = p[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let u = new e();
      this.init(u, o[0][2]);
      let p = o[o.length - 1];
      for (p[0] === ";" && (this.semicolon = !0, o.pop()), u.source.end = this.getPosition(
        p[3] || p[2] || c(o)
      ), u.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), u.raws.before += o.shift()[1];
      for (u.source.start = this.getPosition(o[0][2]), u.prop = ""; o.length; ) {
        let w = o[0][0];
        if (w === ":" || w === "space" || w === "comment")
          break;
        u.prop += o.shift()[1];
      }
      u.raws.between = "";
      let g;
      for (; o.length; )
        if (g = o.shift(), g[0] === ":") {
          u.raws.between += g[1];
          break;
        } else
          g[0] === "word" && /\w/.test(g[1]) && this.unknownWord([g]), u.raws.between += g[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let w = o.length - 1; w >= 0; w--) {
        if (g = o[w], g[1].toLowerCase() === "!important") {
          u.important = !0;
          let k = this.stringFrom(o, w);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (u.raws.important = k);
          break;
        } else if (g[1].toLowerCase() === "important") {
          let k = o.slice(0), L = "";
          for (let S = w; S > 0; S--) {
            let x = k[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = k.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = L, o = k);
        }
        if (g[0] !== "space" && g[0] !== "comment")
          break;
      }
      o.some((w) => w[0] !== "space" && w[0] !== "comment") && (u.raws.between += f.map((w) => w[1]).join(""), f = []), this.raw(u, "value", f.concat(o), h), u.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, u = null, p = !1, g = null, f = [], y = o[1].startsWith("--"), M = [], w = o;
      for (; w; ) {
        if (u = w[0], M.push(w), u === "(" || u === "[")
          g || (g = w), f.push(u === "(" ? ")" : "]");
        else if (y && p && u === "{")
          g || (g = w), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (p) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(M);
            return;
          } else if (u === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else u === ":" && (p = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (g = null));
        w = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(g), h && p) {
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
    raw(o, h, u, p) {
      let g, f, y = u.length, M = "", w = !0, k, L;
      for (let S = 0; S < y; S += 1)
        g = u[S], f = g[0], f === "space" && S === y - 1 && !p ? w = !1 : f === "comment" ? (L = u[S - 1] ? u[S - 1][0] : "empty", k = u[S + 1] ? u[S + 1][0] : "empty", !a[L] && !a[k] ? M.slice(-1) === "," ? w = !1 : M += g[1] : w = !1) : M += g[1];
      if (!w) {
        let S = u.reduce((x, T) => x + T[1], "");
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
      let h, u = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = o.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, u = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        u += o.shift()[1];
      return u;
    }
    spacesFromEnd(o) {
      let h, u = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        u = o.pop()[1] + u;
      return u;
    }
    stringFrom(o, h) {
      let u = "";
      for (let p = h; p < o.length; p++)
        u += o[p][1];
      return o.splice(h, o.length - h), u;
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
  return Do = l, Do;
}
var Fo, Su;
function Qa() {
  if (Su) return Fo;
  Su = 1;
  let e = pn(), t = Kk(), r = vs();
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
  return Fo = n, n.default = n, e.registerParse(n), Fo;
}
var Uo, Eu;
function Tp() {
  if (Eu) return Uo;
  Eu = 1;
  let { isClean: e, my: t } = Ka(), r = Ep(), n = ys(), i = pn(), s = Xa(), a = Cp(), c = Ga(), l = Qa(), d = gi();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, p = 0;
  function g(L) {
    return typeof L == "object" && typeof L.then == "function";
  }
  function f(L) {
    let S = !1, x = o[L.type];
    return L.type === "decl" ? S = L.prop.toLowerCase() : L.type === "atrule" && (S = L.name.toLowerCase()), S && L.append ? [
      x,
      x + "-" + S,
      p,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : L.append ? [x, p, x + "Exit"] : [x, x + "Exit"];
  }
  function y(L) {
    let S;
    return L.type === "document" ? S = ["Document", p, "DocumentExit"] : L.type === "root" ? S = ["Root", p, "RootExit"] : S = f(L), {
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
  class k {
    constructor(S, x, T) {
      this.stringified = !1, this.processed = !1;
      let P;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        P = M(x);
      else if (x instanceof k || x instanceof c)
        P = M(x.root), x.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = x.map);
      else {
        let $ = l;
        T.syntax && ($ = T.syntax.parse), T.parser && ($ = T.parser), $.parse && ($ = $.parse);
        try {
          P = $(x, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        P && !P[t] && i.rebuild(P);
      }
      this.result = new c(S, P, T), this.helpers = { ...w, postcss: w, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
          let P = T.postcssPlugin, $ = T.postcssVersion, z = this.result.processor.version, re = $.split("."), K = z.split(".");
          (re[0] !== K[0] || parseInt(re[1]) > parseInt(K[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + P + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (P) {
        console && console.error && console.error(P);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, T, P) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([x, P]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let T in x) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[T])
              if (typeof x[T] == "object")
                for (let P in x[T])
                  P === "*" ? S(x, T, x[T][P]) : S(
                    x,
                    T + "-" + P.toLowerCase(),
                    x[T][P]
                  );
              else typeof x[T] == "function" && S(x, T, x[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], T = this.runOnRoot(x);
        if (g(T))
          try {
            await T;
          } catch (P) {
            throw this.handleError(P);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let x = [y(S)];
          for (; x.length > 0; ) {
            let T = this.visitTick(x);
            if (g(T))
              try {
                await T;
              } catch (P) {
                let $ = x[x.length - 1].node;
                throw this.handleError(P, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let P = S.nodes.map(
                  ($) => T($, this.helpers)
                );
                await Promise.all(P);
              } else
                await T(S, this.helpers);
            } catch (P) {
              throw this.handleError(P);
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
            return g(x[0]) ? Promise.all(x) : x;
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
      let P = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = P[0], this.result.map = P[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let x = this.runOnRoot(S);
        if (g(x))
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
      for (let [T, P] of S) {
        this.result.lastPlugin = T;
        let $;
        try {
          $ = P(x, this.helpers);
        } catch (z) {
          throw this.handleError(z, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (g($))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: T, visitors: P } = x;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (P.length > 0 && x.visitorIndex < P.length) {
        let [z, re] = P[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === P.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return re(T.toProxy(), this.helpers);
        } catch (K) {
          throw this.handleError(K, T);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, re;
        for (; re = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !re[e]) {
            re[e] = !0, S.push(y(re));
            return;
          }
        x.iterator = 0, delete T.indexes[z];
      }
      let $ = x.events;
      for (; x.eventIndex < $.length; ) {
        let z = $[x.eventIndex];
        if (x.eventIndex += 1, z === p) {
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
        if (T === p)
          S.nodes && S.each((P) => {
            P[e] || this.walkSync(P);
          });
        else {
          let P = this.listeners[T];
          if (P && this.visitSync(P, S.toProxy()))
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
    w = L;
  }, Uo = k, k.default = k, d.registerLazyResult(k), s.registerLazyResult(k), Uo;
}
var Bo, Cu;
function Xk() {
  if (Cu) return Bo;
  Cu = 1;
  let e = Ep(), t = ys(), r = Cp(), n = Qa();
  const i = Ga();
  class s {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let p = new e(h, o, this._opts, l);
      if (p.isMap()) {
        let [g, f] = p.generate();
        g && (this.result.css = g), f && (this.result.map = f);
      } else
        p.clearAnnotation(), this.result.css = p.css;
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
  return Bo = s, s.default = s, Bo;
}
var qo, Mu;
function Gk() {
  if (Mu) return qo;
  Mu = 1;
  let e = Xk(), t = Tp(), r = Xa(), n = gi();
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
  return qo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), qo;
}
var Wo, Ru;
function Jk() {
  if (Ru) return Wo;
  Ru = 1;
  let e = ks(), t = Sp(), r = ws(), n = Ja(), i = vs(), s = gi(), a = Za();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((u) => c(u));
    let { inputs: o, ...h } = l;
    if (o) {
      d = [];
      for (let u of o) {
        let p = { ...u, __proto__: i.prototype };
        p.map && (p.map = {
          ...p.map,
          __proto__: t.prototype
        }), d.push(p);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((u) => c(u, d))), h.source) {
      let { inputId: u, ...p } = h.source;
      h.source = p, u != null && (h.source.input = d[u]);
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
  return Wo = c, c.default = c, Wo;
}
var jo, Tu;
function Zk() {
  if (Tu) return jo;
  Tu = 1;
  let e = Va(), t = ks(), r = Tp(), n = pn(), i = Gk(), s = ys(), a = Jk(), c = Xa(), l = Mp(), d = ws(), o = Ja(), h = Ga(), u = vs(), p = Qa(), g = Rp(), f = Za(), y = gi(), M = bs();
  function w(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return w.plugin = function(L, S) {
    let x = !1;
    function T(...$) {
      console && console.warn && !x && (x = !0, console.warn(
        L + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        L + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...$);
      return z.postcssPlugin = L, z.postcssVersion = new i().version, z;
    }
    let P;
    return Object.defineProperty(T, "postcss", {
      get() {
        return P || (P = T()), P;
      }
    }), T.process = function($, z, re) {
      return w([T(re)]).process($, z);
    }, T;
  }, w.stringify = s, w.parse = p, w.fromJSON = a, w.list = g, w.comment = (k) => new d(k), w.atRule = (k) => new o(k), w.decl = (k) => new t(k), w.rule = (k) => new f(k), w.root = (k) => new y(k), w.document = (k) => new c(k), w.CssSyntaxError = e, w.Declaration = t, w.Container = n, w.Processor = i, w.Document = c, w.Comment = d, w.Warning = l, w.AtRule = o, w.Result = h, w.Input = u, w.Rule = f, w.Root = y, w.Node = M, r.registerPostcss(w), jo = w, w.default = w, jo;
}
var Qk = Zk();
const Qe = /* @__PURE__ */ Bk(Qk);
Qe.stringify;
Qe.fromJSON;
Qe.plugin;
Qe.parse;
Qe.list;
Qe.document;
Qe.comment;
Qe.atRule;
Qe.rule;
Qe.decl;
Qe.root;
Qe.CssSyntaxError;
Qe.Declaration;
Qe.Container;
Qe.Processor;
Qe.Document;
Qe.Comment;
Qe.Warning;
Qe.AtRule;
Qe.Result;
Qe.Input;
Qe.Rule;
Qe.Root;
Qe.Node;
var ev = Object.defineProperty, tv = (e, t, r) => t in e ? ev(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, jt = (e, t, r) => tv(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function rv(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function nv(e) {
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
var Wi = { exports: {} }, Au;
function iv() {
  if (Au) return Wi.exports;
  Au = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Wi.exports = t(), Wi.exports.createColors = t, Wi.exports;
}
const sv = {}, ov = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sv
}, Symbol.toStringTag, { value: "Module" })), ir = /* @__PURE__ */ nv(ov);
var Ho, Lu;
function el() {
  if (Lu) return Ho;
  Lu = 1;
  let e = /* @__PURE__ */ iv(), t = ir;
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
        let { bold: u, gray: p, red: g } = e.createColors(!0);
        o = (f) => u(g(f)), h = (f) => p(f);
      } else
        o = h = (u) => u;
      return a.slice(c, l).map((u, p) => {
        let g = c + 1 + p, f = " " + (" " + g).slice(-d) + " | ";
        if (g === this.line) {
          let y = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + u + `
 ` + y + o("^");
        }
        return " " + h(f) + u;
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
  return Ho = r, r.default = r, Ho;
}
var ji = {}, _u;
function tl() {
  return _u || (_u = 1, ji.isClean = Symbol("isClean"), ji.my = Symbol("my")), ji;
}
var Yo, Iu;
function Ap() {
  if (Iu) return Yo;
  Iu = 1;
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
  return Yo = r, r.default = r, Yo;
}
var Vo, Ou;
function xs() {
  if (Ou) return Vo;
  Ou = 1;
  let e = Ap();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Vo = t, t.default = t, Vo;
}
var Ko, Nu;
function Ss() {
  if (Nu) return Ko;
  Nu = 1;
  let { isClean: e, my: t } = tl(), r = el(), n = Ap(), i = xs();
  function s(c, l) {
    let d = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], u = typeof h;
      o === "parent" && u === "object" ? l && (d[o] = l) : o === "source" ? d[o] = h : Array.isArray(h) ? d[o] = h.map((p) => s(p, d)) : (u === "object" && h !== null && (h = s(h)), d[o] = h);
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
      let o = d || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let p = 0; p < l; p++)
        o[p] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(l.word);
        u !== -1 && (d = this.positionInside(u, h), o = this.positionInside(u + l.word.length, h));
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
      let u = 0;
      for (let p in this) {
        if (!Object.prototype.hasOwnProperty.call(this, p) || p === "parent" || p === "proxyCache") continue;
        let g = this[p];
        if (Array.isArray(g))
          o[p] = g.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof g == "object" && g.toJSON)
          o[p] = g.toJSON(null, d);
        else if (p === "source") {
          let f = d.get(g.input);
          f == null && (f = u, d.set(g.input, u), u++), o[p] = {
            end: g.end,
            inputId: f,
            start: g.start
          };
        } else
          o[p] = g;
      }
      return h && (o.inputs = [...d.keys()].map((p) => p.toJSON())), o;
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
      for (let u in o) h[u] = o[u];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Ko = a, a.default = a, Ko;
}
var Xo, Pu;
function Es() {
  if (Pu) return Xo;
  Pu = 1;
  let e = Ss();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Xo = t, t.default = t, Xo;
}
var Go, zu;
function av() {
  if (zu) return Go;
  zu = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Go = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Go;
}
var Jo, $u;
function Lp() {
  if ($u) return Jo;
  $u = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ir, { existsSync: r, readFileSync: n } = ir, { dirname: i, join: s } = ir;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, o) {
      if (o.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, u = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, p = /^data:application\/json,/;
      if (u.test(d) || p.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (o.test(d) || h.test(d))
        return a(d.substr(RegExp.lastMatch.length));
      let g = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + g);
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
      let h = d.lastIndexOf(o.pop()), u = d.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
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
  return Jo = c, c.default = c, Jo;
}
var Zo, Du;
function Cs() {
  if (Du) return Zo;
  Du = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ir, { fileURLToPath: r, pathToFileURL: n } = ir, { isAbsolute: i, resolve: s } = ir, { nanoid: a } = /* @__PURE__ */ av(), c = ir, l = el(), d = Lp(), o = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class p {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!u || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), u && h) {
        let M = new d(this.css, y);
        if (M.text) {
          this.map = M;
          let w = M.consumer().file;
          !this.file && w && (this.file = this.mapResolve(w));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, w = {}) {
      let k, L, S;
      if (y && typeof y == "object") {
        let T = y, P = M;
        if (typeof T.offset == "number") {
          let $ = this.fromOffset(T.offset);
          y = $.line, M = $.col;
        } else
          y = T.line, M = T.column;
        if (typeof P.offset == "number") {
          let $ = this.fromOffset(P.offset);
          L = $.line, S = $.col;
        } else
          L = P.line, S = P.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let x = this.origin(y, M, L, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        w.plugin
      ) : k = new l(
        f,
        L === void 0 ? y : { column: M, line: y },
        L === void 0 ? M : { column: S, line: L },
        this.css,
        this.file,
        w.plugin
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
      let w = 0;
      if (f >= y)
        w = M.length - 1;
      else {
        let k = M.length - 2, L;
        for (; w < k; )
          if (L = w + (k - w >> 1), f < M[L])
            k = L - 1;
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
      let k = this.map.consumer(), L = k.originalPositionFor({ column: y, line: f });
      if (!L.source) return !1;
      let S;
      typeof M == "number" && (S = k.originalPositionFor({ column: w, line: M }));
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
      let P = k.sourceContentFor(L.source);
      return P && (T.source = P), T;
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
  return Zo = p, p.default = p, c && c.registerInput && c.registerInput(p), Zo;
}
var Qo, Fu;
function _p() {
  if (Fu) return Qo;
  Fu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ir, { dirname: r, relative: n, resolve: i, sep: s } = ir, { pathToFileURL: a } = ir, c = Cs(), l = !!(e && t), d = !!(r && i && n && s);
  class o {
    constructor(u, p, g, f) {
      this.stringify = u, this.mapOpts = g.map || {}, this.root = p, this.opts = g, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let p = `
`;
      this.css.includes(`\r
`) && (p = `\r
`), this.css += p + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let p = this.toUrl(this.path(u.file)), g = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, p, this.toUrl(this.path(g)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let p = this.root.nodes.length - 1; p >= 0; p--)
            u = this.root.nodes[p], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(p);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && l && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (p) => {
          u += p;
        }), [u];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let u = this.previous()[0].consumer();
        u.file = this.outputFile(), this.map = t.fromSourceMap(u, {
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
      let u = 1, p = 1, g = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, y, M;
      this.stringify(this.root, (w, k, L) => {
        if (this.css += w, k && L !== "end" && (f.generated.line = u, f.generated.column = p - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = g, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = w.match(/\n/g), y ? (u += y.length, M = w.lastIndexOf(`
`), p = w.length - M) : p += w.length, k && L !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = u, f.generated.column = p - 2, this.map.addMapping(f)) : (f.source = g, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = p - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((u) => u.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let u = this.mapOpts.annotation;
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((p) => p.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((u) => u.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(u) {
      if (this.mapOpts.absolute || u.charCodeAt(0) === 60 || /^\w+:\/\//.test(u)) return u;
      let p = this.memoizedPaths.get(u);
      if (p) return p;
      let g = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (g = r(i(g, this.mapOpts.annotation)));
      let f = n(g, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let p = u.source.input.map;
              this.previousMaps.includes(p) || this.previousMaps.push(p);
            }
          });
        else {
          let u = new c(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((p) => {
          if (p.source) {
            let g = p.source.input.from;
            if (g && !u[g]) {
              u[g] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(g) : this.toUrl(this.path(g));
              this.map.setSourceContent(f, p.source.input.css);
            }
          }
        });
      else if (this.css) {
        let p = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(p, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let p = this.memoizedFileURLs.get(u);
      if (p) return p;
      if (a) {
        let g = a(u).toString();
        return this.memoizedFileURLs.set(u, g), g;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let p = this.memoizedURLs.get(u);
      if (p) return p;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let g = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, g), g;
    }
  }
  return Qo = o, Qo;
}
var ea, Uu;
function Ms() {
  if (Uu) return ea;
  Uu = 1;
  let e = Ss();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return ea = t, t.default = t, ea;
}
var ta, Bu;
function hn() {
  if (Bu) return ta;
  Bu = 1;
  let { isClean: e, my: t } = tl(), r = Es(), n = Ms(), i = Ss(), s, a, c, l;
  function d(u) {
    return u.map((p) => (p.nodes && (p.nodes = d(p.nodes)), delete p.source, p));
  }
  function o(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let p of u.proxyOf.nodes)
        o(p);
  }
  class h extends i {
    append(...p) {
      for (let g of p) {
        let f = this.normalize(g, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(p) {
      if (super.cleanRaws(p), this.nodes)
        for (let g of this.nodes) g.cleanRaws(p);
    }
    each(p) {
      if (!this.proxyOf.nodes) return;
      let g = this.getIterator(), f, y;
      for (; this.indexes[g] < this.proxyOf.nodes.length && (f = this.indexes[g], y = p(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[g] += 1;
      return delete this.indexes[g], y;
    }
    every(p) {
      return this.nodes.every(p);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let p = this.lastEach;
      return this.indexes[p] = 0, p;
    }
    getProxyProcessor() {
      return {
        get(p, g) {
          return g === "proxyOf" ? p : p[g] ? g === "each" || typeof g == "string" && g.startsWith("walk") ? (...f) => p[g](
            ...f.map((y) => typeof y == "function" ? (M, w) => y(M.toProxy(), w) : y)
          ) : g === "every" || g === "some" ? (f) => p[g](
            (y, ...M) => f(y.toProxy(), ...M)
          ) : g === "root" ? () => p.root().toProxy() : g === "nodes" ? p.nodes.map((f) => f.toProxy()) : g === "first" || g === "last" ? p[g].toProxy() : p[g] : p[g];
        },
        set(p, g, f) {
          return p[g] === f || (p[g] = f, (g === "name" || g === "params" || g === "selector") && p.markDirty()), !0;
        }
      };
    }
    index(p) {
      return typeof p == "number" ? p : (p.proxyOf && (p = p.proxyOf), this.proxyOf.nodes.indexOf(p));
    }
    insertAfter(p, g) {
      let f = this.index(p), y = this.normalize(g, this.proxyOf.nodes[f]).reverse();
      f = this.index(p);
      for (let w of y) this.proxyOf.nodes.splice(f + 1, 0, w);
      let M;
      for (let w in this.indexes)
        M = this.indexes[w], f < M && (this.indexes[w] = M + y.length);
      return this.markDirty(), this;
    }
    insertBefore(p, g) {
      let f = this.index(p), y = f === 0 ? "prepend" : !1, M = this.normalize(g, this.proxyOf.nodes[f], y).reverse();
      f = this.index(p);
      for (let k of M) this.proxyOf.nodes.splice(f, 0, k);
      let w;
      for (let k in this.indexes)
        w = this.indexes[k], f <= w && (this.indexes[k] = w + M.length);
      return this.markDirty(), this;
    }
    normalize(p, g) {
      if (typeof p == "string")
        p = d(s(p).nodes);
      else if (typeof p > "u")
        p = [];
      else if (Array.isArray(p)) {
        p = p.slice(0);
        for (let y of p)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (p.type === "root" && this.type !== "document") {
        p = p.nodes.slice(0);
        for (let y of p)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (p.type)
        p = [p];
      else if (p.prop) {
        if (typeof p.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof p.value != "string" && (p.value = String(p.value)), p = [new r(p)];
      } else if (p.selector)
        p = [new a(p)];
      else if (p.name)
        p = [new c(p)];
      else if (p.text)
        p = [new n(p)];
      else
        throw new Error("Unknown node type in node creation");
      return p.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && g && typeof g.raws.before < "u" && (y.raws.before = g.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...p) {
      p = p.reverse();
      for (let g of p) {
        let f = this.normalize(g, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
      }
      return this.markDirty(), this;
    }
    push(p) {
      return p.parent = this, this.proxyOf.nodes.push(p), this;
    }
    removeAll() {
      for (let p of this.proxyOf.nodes) p.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(p) {
      p = this.index(p), this.proxyOf.nodes[p].parent = void 0, this.proxyOf.nodes.splice(p, 1);
      let g;
      for (let f in this.indexes)
        g = this.indexes[f], g >= p && (this.indexes[f] = g - 1);
      return this.markDirty(), this;
    }
    replaceValues(p, g, f) {
      return f || (f = g, g = {}), this.walkDecls((y) => {
        g.props && !g.props.includes(y.prop) || g.fast && !y.value.includes(g.fast) || (y.value = y.value.replace(p, f));
      }), this.markDirty(), this;
    }
    some(p) {
      return this.nodes.some(p);
    }
    walk(p) {
      return this.each((g, f) => {
        let y;
        try {
          y = p(g, f);
        } catch (M) {
          throw g.addToError(M);
        }
        return y !== !1 && g.walk && (y = g.walk(p)), y;
      });
    }
    walkAtRules(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && p.test(f.name))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "atrule")
          return g(f, y);
      }));
    }
    walkComments(p) {
      return this.walk((g, f) => {
        if (g.type === "comment")
          return p(g, f);
      });
    }
    walkDecls(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && p.test(f.prop))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "decl")
          return g(f, y);
      }));
    }
    walkRules(p, g) {
      return g ? p instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && p.test(f.selector))
          return g(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === p)
          return g(f, y);
      }) : (g = p, this.walk((f, y) => {
        if (f.type === "rule")
          return g(f, y);
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
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    a = u;
  }, h.registerAtRule = (u) => {
    c = u;
  }, h.registerRoot = (u) => {
    l = u;
  }, ta = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, c.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, a.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, l.prototype), u[t] = !0, u.nodes && u.nodes.forEach((p) => {
      h.rebuild(p);
    });
  }, ta;
}
var ra, qu;
function rl() {
  if (qu) return ra;
  qu = 1;
  let e = hn(), t, r;
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
  }, ra = n, n.default = n, ra;
}
var na, Wu;
function Ip() {
  if (Wu) return na;
  Wu = 1;
  let e = {};
  return na = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, na;
}
var ia, ju;
function Op() {
  if (ju) return ia;
  ju = 1;
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
  return ia = e, e.default = e, ia;
}
var sa, Hu;
function nl() {
  if (Hu) return sa;
  Hu = 1;
  let e = Op();
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
  return sa = t, t.default = t, sa;
}
var oa, Yu;
function lv() {
  if (Yu) return oa;
  Yu = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, u = 41, p = 123, g = 125, f = 59, y = 42, M = 58, w = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, L = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return oa = function(P, $ = {}) {
    let z = P.css.valueOf(), re = $.ignoreErrors, K, _, ze, Ve, fe, he, Ae, Fe, Oe, me, nt = z.length, U = 0, Z = [], V = [];
    function He() {
      return U;
    }
    function ue(oe) {
      throw P.error("Unclosed " + oe, U);
    }
    function se() {
      return V.length === 0 && U >= nt;
    }
    function Je(oe) {
      if (V.length) return V.pop();
      if (U >= nt) return;
      let $e = oe ? oe.ignoreUnclosed : !1;
      switch (K = z.charCodeAt(U), K) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = U;
          do
            _ += 1, K = z.charCodeAt(_);
          while (K === s || K === i || K === c || K === l || K === a);
          me = ["space", z.slice(U, _)], U = _ - 1;
          break;
        }
        case d:
        case o:
        case p:
        case g:
        case M:
        case f:
        case u: {
          let we = String.fromCharCode(K);
          me = [we, we, U];
          break;
        }
        case h: {
          if (Fe = Z.length ? Z.pop()[1] : "", Oe = z.charCodeAt(U + 1), Fe === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            _ = U;
            do {
              if (he = !1, _ = z.indexOf(")", _ + 1), _ === -1)
                if (re || $e) {
                  _ = U;
                  break;
                } else
                  ue("bracket");
              for (Ae = _; z.charCodeAt(Ae - 1) === r; )
                Ae -= 1, he = !he;
            } while (he);
            me = ["brackets", z.slice(U, _ + 1), U, _], U = _;
          } else
            _ = z.indexOf(")", U + 1), Ve = z.slice(U, _ + 1), _ === -1 || S.test(Ve) ? me = ["(", "(", U] : (me = ["brackets", Ve, U, _], U = _);
          break;
        }
        case e:
        case t: {
          ze = K === e ? "'" : '"', _ = U;
          do {
            if (he = !1, _ = z.indexOf(ze, _ + 1), _ === -1)
              if (re || $e) {
                _ = U + 1;
                break;
              } else
                ue("string");
            for (Ae = _; z.charCodeAt(Ae - 1) === r; )
              Ae -= 1, he = !he;
          } while (he);
          me = ["string", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case w: {
          k.lastIndex = U + 1, k.test(z), k.lastIndex === 0 ? _ = z.length - 1 : _ = k.lastIndex - 2, me = ["at-word", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case r: {
          for (_ = U, fe = !0; z.charCodeAt(_ + 1) === r; )
            _ += 1, fe = !fe;
          if (K = z.charCodeAt(_ + 1), fe && K !== n && K !== s && K !== i && K !== c && K !== l && K !== a && (_ += 1, x.test(z.charAt(_)))) {
            for (; x.test(z.charAt(_ + 1)); )
              _ += 1;
            z.charCodeAt(_ + 1) === s && (_ += 1);
          }
          me = ["word", z.slice(U, _ + 1), U, _], U = _;
          break;
        }
        default: {
          K === n && z.charCodeAt(U + 1) === y ? (_ = z.indexOf("*/", U + 2) + 1, _ === 0 && (re || $e ? _ = z.length : ue("comment")), me = ["comment", z.slice(U, _ + 1), U, _], U = _) : (L.lastIndex = U + 1, L.test(z), L.lastIndex === 0 ? _ = z.length - 1 : _ = L.lastIndex - 2, me = ["word", z.slice(U, _ + 1), U, _], Z.push(me), U = _);
          break;
        }
      }
      return U++, me;
    }
    function mt(oe) {
      V.push(oe);
    }
    return {
      back: mt,
      endOfFile: se,
      nextToken: Je,
      position: He
    };
  }, oa;
}
var aa, Vu;
function il() {
  if (Vu) return aa;
  Vu = 1;
  let e = hn();
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
  return aa = t, t.default = t, e.registerAtRule(t), aa;
}
var la, Ku;
function yi() {
  if (Ku) return la;
  Ku = 1;
  let e = hn(), t, r;
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
  }, la = n, n.default = n, e.registerRoot(n), la;
}
var ca, Xu;
function Np() {
  if (Xu) return ca;
  Xu = 1;
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
  return ca = e, e.default = e, ca;
}
var ua, Gu;
function sl() {
  if (Gu) return ua;
  Gu = 1;
  let e = hn(), t = Np();
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
  return ua = r, r.default = r, e.registerRule(r), ua;
}
var da, Ju;
function cv() {
  if (Ju) return da;
  Ju = 1;
  let e = Es(), t = lv(), r = Ms(), n = il(), i = yi(), s = sl();
  const a = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let o = d.length - 1; o >= 0; o--) {
      let h = d[o], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class l {
    constructor(o) {
      this.input = o, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: o, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(o) {
      let h = new n();
      h.name = o[1].slice(1), h.name === "" && this.unnamedAtrule(h, o), this.init(h, o[2]);
      let u, p, g, f = !1, y = !1, M = [], w = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), u = o[0], u === "(" || u === "[" ? w.push(u === "(" ? ")" : "]") : u === "{" && w.length > 0 ? w.push("}") : u === w[w.length - 1] && w.pop(), w.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            y = !0;
            break;
          } else if (u === "}") {
            if (M.length > 0) {
              for (g = M.length - 1, p = M[g]; p && p[0] === "space"; )
                p = M[--g];
              p && (h.source.end = this.getPosition(p[3] || p[2]), h.source.end.offset++);
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
      let u = 0, p;
      for (let g = h - 1; g >= 0 && (p = o[g], !(p[0] !== "space" && (u += 1, u === 2))); g--)
        ;
      throw this.input.error(
        "Missed semicolon",
        p[0] === "word" ? p[3] + 1 : p[2]
      );
    }
    colon(o) {
      let h = 0, u, p, g;
      for (let [f, y] of o.entries()) {
        if (u = y, p = u[0], p === "(" && (h += 1), p === ")" && (h -= 1), h === 0 && p === ":")
          if (!g)
            this.doubleColon(u);
          else {
            if (g[0] === "word" && g[1] === "progid")
              continue;
            return f;
          }
        g = u;
      }
      return !1;
    }
    comment(o) {
      let h = new r();
      this.init(h, o[2]), h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++;
      let u = o[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let p = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = p[2], h.raws.left = p[1], h.raws.right = p[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let u = new e();
      this.init(u, o[0][2]);
      let p = o[o.length - 1];
      for (p[0] === ";" && (this.semicolon = !0, o.pop()), u.source.end = this.getPosition(
        p[3] || p[2] || c(o)
      ), u.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), u.raws.before += o.shift()[1];
      for (u.source.start = this.getPosition(o[0][2]), u.prop = ""; o.length; ) {
        let w = o[0][0];
        if (w === ":" || w === "space" || w === "comment")
          break;
        u.prop += o.shift()[1];
      }
      u.raws.between = "";
      let g;
      for (; o.length; )
        if (g = o.shift(), g[0] === ":") {
          u.raws.between += g[1];
          break;
        } else
          g[0] === "word" && /\w/.test(g[1]) && this.unknownWord([g]), u.raws.between += g[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let w = o.length - 1; w >= 0; w--) {
        if (g = o[w], g[1].toLowerCase() === "!important") {
          u.important = !0;
          let k = this.stringFrom(o, w);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (u.raws.important = k);
          break;
        } else if (g[1].toLowerCase() === "important") {
          let k = o.slice(0), L = "";
          for (let S = w; S > 0; S--) {
            let x = k[S][0];
            if (L.trim().indexOf("!") === 0 && x !== "space")
              break;
            L = k.pop()[1] + L;
          }
          L.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = L, o = k);
        }
        if (g[0] !== "space" && g[0] !== "comment")
          break;
      }
      o.some((w) => w[0] !== "space" && w[0] !== "comment") && (u.raws.between += f.map((w) => w[1]).join(""), f = []), this.raw(u, "value", f.concat(o), h), u.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, u = null, p = !1, g = null, f = [], y = o[1].startsWith("--"), M = [], w = o;
      for (; w; ) {
        if (u = w[0], M.push(w), u === "(" || u === "[")
          g || (g = w), f.push(u === "(" ? ")" : "]");
        else if (y && p && u === "{")
          g || (g = w), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (p) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(M);
            return;
          } else if (u === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else u === ":" && (p = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (g = null));
        w = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(g), h && p) {
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
    raw(o, h, u, p) {
      let g, f, y = u.length, M = "", w = !0, k, L;
      for (let S = 0; S < y; S += 1)
        g = u[S], f = g[0], f === "space" && S === y - 1 && !p ? w = !1 : f === "comment" ? (L = u[S - 1] ? u[S - 1][0] : "empty", k = u[S + 1] ? u[S + 1][0] : "empty", !a[L] && !a[k] ? M.slice(-1) === "," ? w = !1 : M += g[1] : w = !1) : M += g[1];
      if (!w) {
        let S = u.reduce((x, T) => x + T[1], "");
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
      let h, u = "";
      for (; o.length && (h = o[o.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = o.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(o) {
      let h, u = "";
      for (; o.length && (h = o[0][0], !(h !== "space" && h !== "comment")); )
        u += o.shift()[1];
      return u;
    }
    spacesFromEnd(o) {
      let h, u = "";
      for (; o.length && (h = o[o.length - 1][0], h === "space"); )
        u = o.pop()[1] + u;
      return u;
    }
    stringFrom(o, h) {
      let u = "";
      for (let p = h; p < o.length; p++)
        u += o[p][1];
      return o.splice(h, o.length - h), u;
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
  return da = l, da;
}
var pa, Zu;
function ol() {
  if (Zu) return pa;
  Zu = 1;
  let e = hn(), t = cv(), r = Cs();
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
  return pa = n, n.default = n, e.registerParse(n), pa;
}
var ha, Qu;
function Pp() {
  if (Qu) return ha;
  Qu = 1;
  let { isClean: e, my: t } = tl(), r = _p(), n = xs(), i = hn(), s = rl(), a = Ip(), c = nl(), l = ol(), d = yi();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, p = 0;
  function g(L) {
    return typeof L == "object" && typeof L.then == "function";
  }
  function f(L) {
    let S = !1, x = o[L.type];
    return L.type === "decl" ? S = L.prop.toLowerCase() : L.type === "atrule" && (S = L.name.toLowerCase()), S && L.append ? [
      x,
      x + "-" + S,
      p,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : L.append ? [x, p, x + "Exit"] : [x, x + "Exit"];
  }
  function y(L) {
    let S;
    return L.type === "document" ? S = ["Document", p, "DocumentExit"] : L.type === "root" ? S = ["Root", p, "RootExit"] : S = f(L), {
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
  class k {
    constructor(S, x, T) {
      this.stringified = !1, this.processed = !1;
      let P;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        P = M(x);
      else if (x instanceof k || x instanceof c)
        P = M(x.root), x.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = x.map);
      else {
        let $ = l;
        T.syntax && ($ = T.syntax.parse), T.parser && ($ = T.parser), $.parse && ($ = $.parse);
        try {
          P = $(x, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        P && !P[t] && i.rebuild(P);
      }
      this.result = new c(S, P, T), this.helpers = { ...w, postcss: w, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
          let P = T.postcssPlugin, $ = T.postcssVersion, z = this.result.processor.version, re = $.split("."), K = z.split(".");
          (re[0] !== K[0] || parseInt(re[1]) > parseInt(K[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + P + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (P) {
        console && console.error && console.error(P);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, T, P) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([x, P]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let T in x) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[T])
              if (typeof x[T] == "object")
                for (let P in x[T])
                  P === "*" ? S(x, T, x[T][P]) : S(
                    x,
                    T + "-" + P.toLowerCase(),
                    x[T][P]
                  );
              else typeof x[T] == "function" && S(x, T, x[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let x = this.plugins[S], T = this.runOnRoot(x);
        if (g(T))
          try {
            await T;
          } catch (P) {
            throw this.handleError(P);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let x = [y(S)];
          for (; x.length > 0; ) {
            let T = this.visitTick(x);
            if (g(T))
              try {
                await T;
              } catch (P) {
                let $ = x[x.length - 1].node;
                throw this.handleError(P, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let P = S.nodes.map(
                  ($) => T($, this.helpers)
                );
                await Promise.all(P);
              } else
                await T(S, this.helpers);
            } catch (P) {
              throw this.handleError(P);
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
            return g(x[0]) ? Promise.all(x) : x;
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
      let P = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = P[0], this.result.map = P[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let x = this.runOnRoot(S);
        if (g(x))
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
      for (let [T, P] of S) {
        this.result.lastPlugin = T;
        let $;
        try {
          $ = P(x, this.helpers);
        } catch (z) {
          throw this.handleError(z, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (g($))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: T, visitors: P } = x;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (P.length > 0 && x.visitorIndex < P.length) {
        let [z, re] = P[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === P.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return re(T.toProxy(), this.helpers);
        } catch (K) {
          throw this.handleError(K, T);
        }
      }
      if (x.iterator !== 0) {
        let z = x.iterator, re;
        for (; re = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !re[e]) {
            re[e] = !0, S.push(y(re));
            return;
          }
        x.iterator = 0, delete T.indexes[z];
      }
      let $ = x.events;
      for (; x.eventIndex < $.length; ) {
        let z = $[x.eventIndex];
        if (x.eventIndex += 1, z === p) {
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
        if (T === p)
          S.nodes && S.each((P) => {
            P[e] || this.walkSync(P);
          });
        else {
          let P = this.listeners[T];
          if (P && this.visitSync(P, S.toProxy()))
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
    w = L;
  }, ha = k, k.default = k, d.registerLazyResult(k), s.registerLazyResult(k), ha;
}
var fa, ed;
function uv() {
  if (ed) return fa;
  ed = 1;
  let e = _p(), t = xs(), r = Ip(), n = ol();
  const i = nl();
  class s {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let p = new e(h, o, this._opts, l);
      if (p.isMap()) {
        let [g, f] = p.generate();
        g && (this.result.css = g), f && (this.result.map = f);
      } else
        p.clearAnnotation(), this.result.css = p.css;
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
  return fa = s, s.default = s, fa;
}
var ma, td;
function dv() {
  if (td) return ma;
  td = 1;
  let e = uv(), t = Pp(), r = rl(), n = yi();
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
  return ma = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ma;
}
var ga, rd;
function pv() {
  if (rd) return ga;
  rd = 1;
  let e = Es(), t = Lp(), r = Ms(), n = il(), i = Cs(), s = yi(), a = sl();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((u) => c(u));
    let { inputs: o, ...h } = l;
    if (o) {
      d = [];
      for (let u of o) {
        let p = { ...u, __proto__: i.prototype };
        p.map && (p.map = {
          ...p.map,
          __proto__: t.prototype
        }), d.push(p);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((u) => c(u, d))), h.source) {
      let { inputId: u, ...p } = h.source;
      h.source = p, u != null && (h.source.input = d[u]);
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
  return ga = c, c.default = c, ga;
}
var ya, nd;
function hv() {
  if (nd) return ya;
  nd = 1;
  let e = el(), t = Es(), r = Pp(), n = hn(), i = dv(), s = xs(), a = pv(), c = rl(), l = Op(), d = Ms(), o = il(), h = nl(), u = Cs(), p = ol(), g = Np(), f = sl(), y = yi(), M = Ss();
  function w(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return w.plugin = function(L, S) {
    let x = !1;
    function T(...$) {
      console && console.warn && !x && (x = !0, console.warn(
        L + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        L + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...$);
      return z.postcssPlugin = L, z.postcssVersion = new i().version, z;
    }
    let P;
    return Object.defineProperty(T, "postcss", {
      get() {
        return P || (P = T()), P;
      }
    }), T.process = function($, z, re) {
      return w([T(re)]).process($, z);
    }, T;
  }, w.stringify = s, w.parse = p, w.fromJSON = a, w.list = g, w.comment = (k) => new d(k), w.atRule = (k) => new o(k), w.decl = (k) => new t(k), w.rule = (k) => new f(k), w.root = (k) => new y(k), w.document = (k) => new c(k), w.CssSyntaxError = e, w.Declaration = t, w.Container = n, w.Processor = i, w.Document = c, w.Comment = d, w.Warning = l, w.AtRule = o, w.Result = h, w.Input = u, w.Rule = f, w.Root = y, w.Node = M, r.registerPostcss(w), ya = w, w.default = w, ya;
}
var fv = hv();
const et = /* @__PURE__ */ rv(fv);
et.stringify;
et.fromJSON;
et.plugin;
et.parse;
et.list;
et.document;
et.comment;
et.atRule;
et.rule;
et.decl;
et.root;
et.CssSyntaxError;
et.Declaration;
et.Container;
et.Processor;
et.Document;
et.Comment;
et.Warning;
et.AtRule;
et.Result;
et.Input;
et.Rule;
et.Root;
et.Node;
class al {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    jt(this, "parentElement", null), jt(this, "parentNode", null), jt(this, "ownerDocument"), jt(this, "firstChild", null), jt(this, "lastChild", null), jt(this, "previousSibling", null), jt(this, "nextSibling", null), jt(this, "ELEMENT_NODE", 1), jt(this, "TEXT_NODE", 3), jt(this, "nodeType"), jt(this, "nodeName"), jt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof al) {
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
const id = {
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
}, sd = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Hi = {}, zp = {}, mv = () => !!globalThis.Zone;
function ll(e) {
  if (Hi[e])
    return Hi[e];
  const t = globalThis[e], r = t.prototype, n = e in id ? id[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in sd ? sd[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !mv())
    return Hi[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), zp[e] = () => c.remove()) : c.remove(), Hi[e] = d;
  } catch {
    return r;
  }
}
const ba = {};
function Cr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ba[i])
    return ba[i].call(
      t
    );
  const s = ll(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (ba[i] = a, a.call(t)) : t[r];
}
const ka = {};
function $p(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (ka[n])
    return ka[n].bind(
      t
    );
  const s = ll(e)[r];
  return typeof s != "function" ? t[r] : (ka[n] = s, s.bind(t));
}
function gv(e) {
  return Cr("Node", e, "ownerDocument");
}
function yv(e) {
  return Cr("Node", e, "childNodes");
}
function bv(e) {
  return Cr("Node", e, "parentNode");
}
function kv(e) {
  return Cr("Node", e, "parentElement");
}
function vv(e) {
  return Cr("Node", e, "textContent");
}
function wv(e, t) {
  return $p("Node", e, "contains")(t);
}
function xv(e) {
  return $p("Node", e, "getRootNode")();
}
function Sv(e) {
  return !e || !("host" in e) ? null : Cr("ShadowRoot", e, "host");
}
function Ev(e) {
  return e.styleSheets;
}
function Cv(e) {
  return !e || !("shadowRoot" in e) ? null : Cr("Element", e, "shadowRoot");
}
function Mv(e, t) {
  return Cr("Element", e, "querySelector")(t);
}
function Rv(e, t) {
  return Cr("Element", e, "querySelectorAll")(t);
}
function Dp() {
  return [
    ll("MutationObserver").constructor,
    zp.MutationObserver ?? (() => {
    })
  ];
}
let hi = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (hi = () => (/* @__PURE__ */ new Date()).getTime());
function fn(e, t, r) {
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
const be = {
  ownerDocument: gv,
  childNodes: yv,
  parentNode: bv,
  parentElement: kv,
  textContent: vv,
  contains: wv,
  getRootNode: xv,
  host: Sv,
  styleSheets: Ev,
  shadowRoot: Cv,
  querySelector: Mv,
  querySelectorAll: Rv,
  nowTimestamp: hi,
  mutationObserverCtor: Dp,
  patch: fn
};
function Tt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const An = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let od = {
  map: {},
  getId() {
    return console.error(An), -1;
  },
  getNode() {
    return console.error(An), null;
  },
  removeNodeFromMap() {
    console.error(An);
  },
  has() {
    return console.error(An), !1;
  },
  reset() {
    console.error(An);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (od = new Proxy(od, {
  get(e, t, r) {
    return t === "map" && console.error(An), Reflect.get(e, t, r);
  }
}));
function fi(e, t, r = {}) {
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
function Rs(e, t, r, n, i = window) {
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
  ), () => Rs(e, t, s || {}, !0);
}
function Fp(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = be.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = be.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Up() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Bp() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function qp(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : be.parentElement(e) : null;
}
function At(e, t, r, n) {
  if (!e)
    return !1;
  const i = qp(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (ls(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Tv(e, t) {
  return t.getId(e) !== -1;
}
function va(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === pi;
}
function Wp(e, t) {
  if (oi(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = be.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Wp(n, t) : !0;
}
function Oa(e) {
  return !!e.changedTouches;
}
function Av(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function jp(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Hp(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Na(e) {
  return e ? e instanceof al && "shadowRoot" in e ? !!e.shadowRoot : !!be.shadowRoot(e) : !1;
}
class Lv {
  constructor() {
    J(this, "id", 1), J(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), J(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function Yp(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = be.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && be.host(be.getRootNode(e)) && (r = be.host(be.getRootNode(e))), r;
}
function _v(e) {
  let t = e, r;
  for (; r = Yp(t); )
    t = r;
  return t;
}
function Iv(e) {
  const t = be.ownerDocument(e);
  if (!t) return !1;
  const r = _v(e);
  return be.contains(t, r);
}
function Vp(e) {
  const t = be.ownerDocument(e);
  return t ? be.contains(t, e) || Iv(e) : !1;
}
var Re = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Re || {}), xe = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(xe || {}), zt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(zt || {}), wr = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(wr || {}), Wn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Wn || {}), Ln = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Ln || {}), Kp = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Kp || {});
function ad(e) {
  return "__ln" in e;
}
class Ov {
  constructor() {
    J(this, "length", 0), J(this, "head", null), J(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && ad(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && ad(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const ld = (e, t) => `${e}@${t}`;
class Nv {
  constructor() {
    J(this, "frozen", !1), J(this, "locked", !1), J(this, "texts", []), J(this, "attributes", []), J(this, "attributeMap", /* @__PURE__ */ new WeakMap()), J(this, "removes", []), J(this, "mapRemoves", []), J(this, "movedMap", {}), J(this, "addedSet", /* @__PURE__ */ new Set()), J(this, "movedSet", /* @__PURE__ */ new Set()), J(this, "droppedSet", /* @__PURE__ */ new Set()), J(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), J(this, "mutationCb"), J(this, "blockClass"), J(this, "blockSelector"), J(this, "maskTextClass"), J(this, "maskTextSelector"), J(this, "inlineStylesheet"), J(this, "maskInputOptions"), J(this, "maskTextFn"), J(this, "maskInputFn"), J(this, "keepIframeSrcFn"), J(this, "recordCanvas"), J(this, "inlineImages"), J(this, "slimDOMOptions"), J(this, "dataURLOptions"), J(this, "doc"), J(this, "mirror"), J(this, "iframeManager"), J(this, "stylesheetManager"), J(this, "shadowDomManager"), J(this, "canvasManager"), J(this, "processedNodeManager"), J(this, "unattachedDoc"), J(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), J(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Ov(), i = (l) => {
        let d = l, o = pi;
        for (; o === pi; )
          d = d && d.nextSibling, o = d && this.mirror.getId(d);
        return o;
      }, s = (l) => {
        const d = be.parentNode(l);
        if (!d || !Vp(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const g = d.tagName;
          if (g === "TEXTAREA")
            return;
          g === "STYLE" && this.addedSet.has(d) && (o = !0);
        }
        const h = oi(d) ? this.mirror.getId(Yp(l)) : this.mirror.getId(d), u = i(l);
        if (h === -1 || u === -1)
          return n.addNode(l);
        const p = In(l, {
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
          onSerialize: (g) => {
            jp(g, this.mirror) && this.iframeManager.addIframe(g), Hp(g, this.mirror) && this.stylesheetManager.trackLinkElement(
              g
            ), Na(l) && this.shadowDomManager.addShadowRoot(be.shadowRoot(l), this.doc);
          },
          onIframeLoad: (g, f) => {
            this.iframeManager.attachIframe(g, f), this.shadowDomManager.observeAttachShadow(g);
          },
          onStylesheetLoad: (g, f) => {
            this.stylesheetManager.attachLinkElement(g, f);
          },
          cssCaptured: o
        });
        p && (t.push({
          parentId: h,
          nextId: u,
          node: p
        }), r.add(p.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        cd(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(be.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !ud(this.droppedSet, l) && !cd(this.removesSubTreeCache, l, this.mirror) || ud(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const d = this.mirror.getId(be.parentNode(a.value)), o = i(a.value);
          d !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let d = n.tail;
          for (; d; ) {
            const o = d;
            if (d = d.previous, o) {
              const h = this.mirror.getId(be.parentNode(o.value));
              if (i(o.value) === -1) continue;
              if (h !== -1) {
                l = o;
                break;
              } else {
                const p = o.value, g = be.parentNode(p);
                if (g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = be.host(g);
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
          const d = l.node, o = be.parentNode(d);
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
    }), J(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        be.childNodes(t),
        (i) => be.textContent(i) || ""
      ).join("");
      r.attributes.value = ss({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: os(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), J(this, "processMutation", (t) => {
      if (!va(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = be.textContent(t.target);
            !At(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: vp(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, qp(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = os(r);
              i = ss({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (At(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !kp(r.tagName, n))
              if (s.attributes[n] = bp(
                this.doc,
                un(r.tagName),
                un(n),
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
            if (At(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = oi(t.target) ? this.mirror.getId(be.host(t.target)) : this.mirror.getId(t.target);
              At(t.target, this.blockClass, this.blockSelector, !1) || va(r, this.mirror, this.slimDOMOptions) || !Tv(r, this.mirror) || (this.addedSet.has(r) ? (Pa(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Wp(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[ld(n, i)] ? Pa(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: oi(t.target) && ai(t.target) ? !0 : void 0
              }), Pv(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), J(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (va(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[ld(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        At(t, this.blockClass, this.blockSelector, !1) || (be.childNodes(t).forEach((n) => this.genAdds(n)), Na(t) && be.childNodes(be.shadowRoot(t)).forEach((n) => {
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
function Pa(e, t) {
  e.delete(t), be.childNodes(t).forEach((r) => Pa(e, r));
}
function Pv(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), be.childNodes(n).forEach((i) => r.push(i)));
  }
}
function cd(e, t, r) {
  return e.size === 0 ? !1 : zv(e, t);
}
function zv(e, t, r) {
  const n = be.parentNode(t);
  return n ? e.has(n) : !1;
}
function ud(e, t) {
  return e.size === 0 ? !1 : Xp(e, t);
}
function Xp(e, t) {
  const r = be.parentNode(t);
  return r ? e.has(r) ? !0 : Xp(e, r) : !1;
}
let li;
function $v(e) {
  li = e;
}
function Dv() {
  li = void 0;
}
const Ee = (e) => li ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (li && li(n) === !0)
      return;
    throw n;
  }
} : e, on = [];
function bi(e) {
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
function Gp(e, t) {
  const r = new Nv();
  on.push(r), r.init(e);
  const [n, i] = Dp(), s = new n(
    Ee(r.processMutations.bind(r))
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
function Fv({
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
  const l = fi(
    Ee(
      (h) => {
        const u = Date.now() - c;
        e(
          a.map((p) => (p.timeOffset -= u, p)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), d = Ee(
    fi(
      Ee((h) => {
        const u = bi(h), { clientX: p, clientY: g } = Oa(h) ? h.changedTouches[0] : h;
        c || (c = hi()), a.push({
          x: p,
          y: g,
          id: n.getId(u),
          timeOffset: hi() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? xe.Drag : h instanceof MouseEvent ? xe.MouseMove : xe.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    Tt("mousemove", d, r),
    Tt("touchmove", d, r),
    Tt("drag", d, r)
  ];
  return Ee(() => {
    o.forEach((h) => h());
  });
}
function Uv({
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
    const u = bi(h);
    if (At(u, n, i, !0))
      return;
    let p = null, g = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          p = wr.Mouse;
          break;
        case "touch":
          p = wr.Touch;
          break;
        case "pen":
          p = wr.Pen;
          break;
      }
      p === wr.Touch ? zt[o] === zt.MouseDown ? g = "TouchStart" : zt[o] === zt.MouseUp && (g = "TouchEnd") : wr.Pen;
    } else Oa(h) && (p = wr.Touch);
    p !== null ? (l = p, (g.startsWith("Touch") && p === wr.Touch || g.startsWith("Mouse") && p === wr.Mouse) && (p = null)) : zt[o] === zt.Click && (p = l, l = null);
    const f = Oa(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(u), { clientX: M, clientY: w } = f;
    Ee(e)({
      type: zt[g],
      id: y,
      x: M,
      y: w,
      ...p !== null && { pointerType: p }
    });
  };
  return Object.keys(zt).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = un(o);
    const u = d(o);
    if (window.PointerEvent)
      switch (zt[o]) {
        case zt.MouseDown:
        case zt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case zt.TouchStart:
        case zt.TouchEnd:
          return;
      }
    c.push(Tt(h, u, t));
  }), Ee(() => {
    c.forEach((o) => o());
  });
}
function Jp({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Ee(
    fi(
      Ee((c) => {
        const l = bi(c);
        if (!l || At(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const o = Fp(t.defaultView);
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
  return Tt("scroll", a, t);
}
function Bv({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Ee(
    fi(
      Ee(() => {
        const s = Up(), a = Bp();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return Tt("resize", i, t);
}
const qv = ["INPUT", "TEXTAREA", "SELECT"], dd = /* @__PURE__ */ new WeakMap();
function Wv({
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
  function h(w) {
    let k = bi(w);
    const L = w.isTrusted, S = k && k.tagName;
    if (k && S === "OPTION" && (k = be.parentElement(k)), !k || !S || qv.indexOf(S) < 0 || At(k, n, i, !0) || k.classList.contains(s) || a && k.matches(a))
      return;
    let x = k.value, T = !1;
    const P = os(k) || "";
    P === "radio" || P === "checkbox" ? T = k.checked : (c[S.toLowerCase()] || c[P]) && (x = ss({
      element: k,
      maskInputOptions: c,
      tagName: S,
      type: P,
      value: x,
      maskInputFn: l
    })), u(
      k,
      o ? { text: x, isChecked: T, userTriggered: L } : { text: x, isChecked: T }
    );
    const $ = k.name;
    P === "radio" && $ && T && t.querySelectorAll(`input[type="radio"][name="${$}"]`).forEach((z) => {
      if (z !== k) {
        const re = z.value;
        u(
          z,
          o ? { text: re, isChecked: !T, userTriggered: !1 } : { text: re, isChecked: !T }
        );
      }
    });
  }
  function u(w, k) {
    const L = dd.get(w);
    if (!L || L.text !== k.text || L.isChecked !== k.isChecked) {
      dd.set(w, k);
      const S = r.getId(w);
      Ee(e)({
        ...k,
        id: S
      });
    }
  }
  const g = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (w) => Tt(w, Ee(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      g.forEach((w) => w());
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
  return y && y.set && g.push(
    ...M.map(
      (w) => Rs(
        w[0],
        w[1],
        {
          set() {
            Ee(h)({
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
  ), Ee(() => {
    g.forEach((w) => w());
  });
}
function cs(e) {
  const t = [];
  function r(n, i) {
    if (Yi("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Yi("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Yi("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Yi("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Pr(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function jv({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Ee(
      (o, h, u) => {
        const [p, g] = u, { id: f, styleId: y } = Pr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
          adds: [{ rule: p, index: g }]
        }), o.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(o, h, u = this.cssRules.length) {
    const p = `${o} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [p, u]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: Ee(
      (o, h, u) => {
        const [p] = u, { id: g, styleId: f } = Pr(
          h,
          t,
          r.styleMirror
        );
        return (g && g !== -1 || f && f !== -1) && e({
          id: g,
          styleId: f,
          removes: [{ index: p }]
        }), o.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(o) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [o]);
  };
  let a;
  n.CSSStyleSheet.prototype.replace && (a = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(a, {
    apply: Ee(
      (o, h, u) => {
        const [p] = u, { id: g, styleId: f } = Pr(
          h,
          t,
          r.styleMirror
        );
        return (g && g !== -1 || f && f !== -1) && e({
          id: g,
          styleId: f,
          replace: p
        }), o.apply(h, u);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: Ee(
      (o, h, u) => {
        const [p] = u, { id: g, styleId: f } = Pr(
          h,
          t,
          r.styleMirror
        );
        return (g && g !== -1 || f && f !== -1) && e({
          id: g,
          styleId: f,
          replaceSync: p
        }), o.apply(h, u);
      }
    )
  }));
  const l = {};
  Vi("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Vi("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Vi("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Vi("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: Ee(
          (u, p, g) => {
            const [f, y] = g, { id: M, styleId: w } = Pr(
              p.parentStyleSheet,
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
                    ...cs(p),
                    y || 0
                    // defaults to 0
                  ]
                }
              ]
            }), u.apply(p, g);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      d[o].deleteRule,
      {
        apply: Ee(
          (u, p, g) => {
            const [f] = g, { id: y, styleId: M } = Pr(
              p.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || M && M !== -1) && e({
              id: y,
              styleId: M,
              removes: [
                { index: [...cs(p), f] }
              ]
            }), u.apply(p, g);
          }
        )
      }
    );
  }), Ee(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = d[o].insertRule, h.prototype.deleteRule = d[o].deleteRule;
    });
  });
}
function Zp({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(be.host(r));
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
  }), Ee(() => {
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
function Hv({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Ee(
      (c, l, d) => {
        var o;
        const [h, u, p] = d;
        if (r.has(h))
          return s.apply(l, [h, u, p]);
        const { id: g, styleId: f } = Pr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (g && g !== -1 || f && f !== -1) && e({
          id: g,
          styleId: f,
          set: {
            property: h,
            value: u,
            priority: p
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: cs(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: Ee(
      (c, l, d) => {
        var o;
        const [h] = d;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: u, styleId: p } = Pr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (u && u !== -1 || p && p !== -1) && e({
          id: u,
          styleId: p,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: cs(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), Ee(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function Yv({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Ee(
    (l) => fi(
      Ee((d) => {
        const o = bi(d);
        if (!o || At(o, t, r, !0))
          return;
        const { currentTime: h, volume: u, muted: p, playbackRate: g, loop: f } = o;
        e({
          type: l,
          id: n.getId(o),
          currentTime: h,
          volume: u,
          muted: p,
          playbackRate: g,
          loop: f
        });
      }),
      i.media || 500
    )
  ), c = [
    Tt("play", a(Ln.Play), s),
    Tt("pause", a(Ln.Pause), s),
    Tt("seeked", a(Ln.Seeked), s),
    Tt("volumechange", a(Ln.VolumeChange), s),
    Tt("ratechange", a(Ln.RateChange), s)
  ];
  return Ee(() => {
    c.forEach((l) => l());
  });
}
function Vv({ fontCb: e, doc: t }) {
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
  const a = fn(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          Ee(() => {
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
  }), n.push(a), Ee(() => {
    n.forEach((c) => c());
  });
}
function Kv(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Ee(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const d = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const u = l.getRangeAt(h), { startContainer: p, startOffset: g, endContainer: f, endOffset: y } = u;
      At(p, n, i, !0) || At(f, n, i, !0) || d.push({
        start: r.getId(p),
        startOffset: g,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: d });
  });
  return c(), Tt("selectionchange", c);
}
function Xv({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : fn(
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
function Gv(e, t) {
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
    fontCb: u,
    selectionCb: p,
    customElementCb: g
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
    t.font && t.font(...f), u(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), p(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), g(...f);
  };
}
function Jv(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Gv(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Gp(e, e.doc));
  const s = Fv(e), a = Uv(e), c = Jp(e), l = Bv(e, {
    win: r
  }), d = Wv(e), o = Yv(e);
  let h = () => {
  }, u = () => {
  }, p = () => {
  }, g = () => {
  };
  e.recordDOM && (h = jv(e, { win: r }), u = Zp(e, e.doc), p = Hv(e, {
    win: r
  }), e.collectFonts && (g = Vv(e)));
  const f = Kv(e), y = Xv(e), M = [];
  for (const w of e.plugins)
    M.push(
      w.observer(w.callback, r, w.options)
    );
  return Ee(() => {
    on.forEach((w) => w.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), d(), o(), h(), u(), p(), g(), f(), y(), M.forEach((w) => w());
  });
}
function Yi(e) {
  return typeof window[e] < "u";
}
function Vi(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class pd {
  constructor(t) {
    J(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), J(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class Zv {
  constructor(t) {
    J(this, "iframes", /* @__PURE__ */ new WeakMap()), J(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), J(this, "crossOriginIframeMirror", new pd(yp)), J(this, "crossOriginIframeStyleMirror"), J(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), J(this, "mirror"), J(this, "mutationCb"), J(this, "wrappedEmit"), J(this, "loadListener"), J(this, "stylesheetManager"), J(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new pd(
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
      case Re.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: Re.IncrementalSnapshot,
          data: {
            source: xe.Mutation,
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
      case Re.Meta:
      case Re.Load:
      case Re.DomContentLoaded:
        return !1;
      case Re.Plugin:
        return r;
      case Re.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case Re.IncrementalSnapshot:
        switch (r.data.source) {
          case xe.Mutation:
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
          case xe.Drag:
          case xe.TouchMove:
          case xe.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case xe.ViewportResize:
            return !1;
          case xe.MediaInteraction:
          case xe.MouseInteraction:
          case xe.Scroll:
          case xe.CanvasMutation:
          case xe.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case xe.StyleSheetRule:
          case xe.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case xe.Font:
            return r;
          case xe.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case xe.AdoptedStyleSheet:
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
    t.type !== Kp.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Qv {
  constructor(t) {
    J(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), J(this, "mutationCb"), J(this, "scrollCb"), J(this, "bypassOptions"), J(this, "mirror"), J(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!ai(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Gp(
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
      Jp({
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
        this.mirror.getId(be.host(t))
      ), this.restoreHandlers.push(
        Zp(
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
      fn(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = be.shadowRoot(this);
            return c && Vp(this) && n.addShadowRoot(c, r), a;
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
var On = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", e0 = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Ki = 0; Ki < On.length; Ki++)
  e0[On.charCodeAt(Ki)] = Ki;
var t0 = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += On[t[r] >> 2], i += On[(t[r] & 3) << 4 | t[r + 1] >> 4], i += On[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += On[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const hd = /* @__PURE__ */ new Map();
function r0(e, t) {
  let r = hd.get(e);
  return r || (r = /* @__PURE__ */ new Map(), hd.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Qp = (e, t, r) => {
  if (!e || !(th(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = r0(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Zi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Zi(n, t, r));
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
    const n = e.constructor.name, i = t0(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Zi(e.buffer, t, r),
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
          args: [Zi(e.data, t, r), e.width, e.height]
        };
      if (th(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Qp(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const eh = (e, t, r) => e.map((n) => Zi(n, t, r)), th = (e, t) => !![
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
function n0(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = fn(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...d) {
            return At(this.canvas, r, n, !0) || setTimeout(() => {
              const o = eh(d, t, this);
              e(this.canvas, {
                type: Wn["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = Rs(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Wn["2D"],
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
function i0(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function fd(e, t, r, n) {
  const i = [];
  try {
    const s = fn(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!At(this, t, r, !0)) {
            const d = i0(c);
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
function md(e, t, r, n, i, s) {
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
        const d = fn(
          e,
          l,
          function(o) {
            return function(...h) {
              const u = o.apply(this, h);
              if (Qp(u, s, this), "tagName" in this.canvas && !At(this.canvas, n, i, !0)) {
                const p = eh(h, s, this), g = {
                  type: t,
                  property: l,
                  args: p
                };
                r(this.canvas, g);
              }
              return u;
            };
          }
        );
        a.push(d);
      } catch {
        const d = Rs(e, l, {
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
function s0(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...md(
      t.WebGLRenderingContext.prototype,
      Wn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...md(
      t.WebGL2RenderingContext.prototype,
      Wn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const rh = `(function() {
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
`, gd = typeof self < "u" && self.Blob && new Blob([rh], { type: "text/javascript;charset=utf-8" });
function o0(e) {
  let t;
  try {
    if (t = gd && (self.URL || self.webkitURL).createObjectURL(gd), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(rh),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class a0 {
  constructor(t) {
    J(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), J(this, "rafStamps", { latestId: 0, invokeId: null }), J(this, "mirror"), J(this, "mutationCb"), J(this, "resetObservers"), J(this, "frozen", !1), J(this, "locked", !1), J(this, "processMutation", (l, d) => {
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
    const a = fd(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new o0();
    l.onmessage = (g) => {
      const { id: f } = g.data;
      if (c.set(f, !1), !("base64" in g.data)) return;
      const { base64: y, type: M, width: w, height: k } = g.data;
      this.mutationCb({
        id: f,
        type: Wn["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, w, k]
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
    const d = 1e3 / t;
    let o = 0, h;
    const u = () => {
      const g = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        At(f, n, i, !0) || g.push(f);
      }), g;
    }, p = (g) => {
      if (o && g - o < d) {
        h = requestAnimationFrame(p);
        return;
      }
      o = g, u().forEach(async (f) => {
        var y;
        const M = this.mirror.getId(f);
        if (c.get(M) || f.width === 0 || f.height === 0) return;
        if (c.set(M, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const k = f.getContext(f.__context);
          ((y = k == null ? void 0 : k.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && k.clear(k.COLOR_BUFFER_BIT);
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
      }), h = requestAnimationFrame(p);
    };
    h = requestAnimationFrame(p), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = fd(
      t,
      r,
      n,
      !1
    ), s = n0(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = s0(
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
class l0 {
  constructor(t) {
    J(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), J(this, "mutationCb"), J(this, "adoptedStyleSheetCb"), J(this, "styleMirror", new Lv()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: fp(c, s.href),
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
class c0 {
  constructor() {
    J(this, "nodeMap", /* @__PURE__ */ new WeakMap()), J(this, "active", !1);
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
let st, Qi, wa, us = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Vc = e.contentWindow) == null ? void 0 : Vc.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const er = gk();
function Wr(e = {}) {
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
    maskInputOptions: u,
    slimDOMOptions: p,
    maskInputFn: g,
    maskTextFn: f,
    hooks: y,
    packFn: M,
    sampling: w = {},
    dataURLOptions: k = {},
    mousemoveWait: L,
    recordDOM: S = !0,
    recordCanvas: x = !1,
    recordCrossOriginIframes: T = !1,
    recordAfter: P = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: $ = !1,
    collectFonts: z = !1,
    inlineImages: re = !1,
    plugins: K,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: ze = /* @__PURE__ */ new Set([]),
    errorHandler: Ve
  } = e;
  $v(Ve);
  const fe = T ? window.parent === window : !0;
  let he = !1;
  if (!fe)
    try {
      window.parent.document && (he = !1);
    } catch {
      he = !0;
    }
  if (fe && !t)
    throw new Error("emit function is required");
  if (!fe && !he)
    return () => {
    };
  L !== void 0 && w.mousemove === void 0 && (w.mousemove = L), er.reset();
  const Ae = h === !0 ? {
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
  } : u !== void 0 ? u : { password: !0 }, Fe = wp(p);
  Av();
  let Oe, me = 0;
  const nt = (oe) => {
    for (const $e of K || [])
      $e.eventProcessor && (oe = $e.eventProcessor(oe));
    return M && // Disable packing events which will be emitted to parent frames.
    !he && (oe = M(oe)), oe;
  };
  st = (oe, $e) => {
    var we;
    const de = oe;
    if (de.timestamp = hi(), (we = on[0]) != null && we.isFrozen() && de.type !== Re.FullSnapshot && !(de.type === Re.IncrementalSnapshot && de.data.source === xe.Mutation) && on.forEach((tt) => tt.unfreeze()), fe)
      t == null || t(nt(de), $e);
    else if (he) {
      const tt = {
        type: "rrweb",
        event: nt(de),
        origin: window.location.origin,
        isCheckout: $e
      };
      window.parent.postMessage(tt, "*");
    }
    if (de.type === Re.FullSnapshot)
      Oe = de, me = 0;
    else if (de.type === Re.IncrementalSnapshot) {
      if (de.data.source === xe.Mutation && de.data.isAttachIframe)
        return;
      me++;
      const tt = n && me >= n, ge = r && de.timestamp - Oe.timestamp > r;
      (tt || ge) && Qi(!0);
    }
  };
  const U = (oe) => {
    st({
      type: Re.IncrementalSnapshot,
      data: {
        source: xe.Mutation,
        ...oe
      }
    });
  }, Z = (oe) => st({
    type: Re.IncrementalSnapshot,
    data: {
      source: xe.Scroll,
      ...oe
    }
  }), V = (oe) => st({
    type: Re.IncrementalSnapshot,
    data: {
      source: xe.CanvasMutation,
      ...oe
    }
  }), He = (oe) => st({
    type: Re.IncrementalSnapshot,
    data: {
      source: xe.AdoptedStyleSheet,
      ...oe
    }
  }), ue = new l0({
    mutationCb: U,
    adoptedStyleSheetCb: He
  }), se = new Zv({
    mirror: er,
    mutationCb: U,
    stylesheetManager: ue,
    recordCrossOriginIframes: T,
    wrappedEmit: st
  });
  for (const oe of K || [])
    oe.getMirror && oe.getMirror({
      nodeMirror: er,
      crossOriginIframeMirror: se.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: se.crossOriginIframeStyleMirror
    });
  const Je = new c0();
  wa = new a0({
    recordCanvas: x,
    mutationCb: V,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: er,
    sampling: w.canvas,
    dataURLOptions: k
  });
  const mt = new Qv({
    mutationCb: U,
    scrollCb: Z,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskInputOptions: Ae,
      dataURLOptions: k,
      maskTextFn: f,
      maskInputFn: g,
      recordCanvas: x,
      inlineImages: re,
      sampling: w,
      slimDOMOptions: Fe,
      iframeManager: se,
      stylesheetManager: ue,
      canvasManager: wa,
      keepIframeSrcFn: _,
      processedNodeManager: Je
    },
    mirror: er
  });
  Qi = (oe = !1) => {
    if (!S)
      return;
    st(
      {
        type: Re.Meta,
        data: {
          href: window.location.href,
          width: Bp(),
          height: Up()
        }
      },
      oe
    ), ue.reset(), mt.init(), on.forEach((we) => we.lock());
    const $e = Uk(document, {
      mirror: er,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskAllInputs: Ae,
      maskTextFn: f,
      maskInputFn: g,
      slimDOM: Fe,
      dataURLOptions: k,
      recordCanvas: x,
      inlineImages: re,
      onSerialize: (we) => {
        jp(we, er) && se.addIframe(we), Hp(we, er) && ue.trackLinkElement(we), Na(we) && mt.addShadowRoot(be.shadowRoot(we), document);
      },
      onIframeLoad: (we, de) => {
        se.attachIframe(we, de), mt.observeAttachShadow(we);
      },
      onStylesheetLoad: (we, de) => {
        ue.attachLinkElement(we, de);
      },
      keepIframeSrcFn: _
    });
    if (!$e)
      return console.warn("Failed to snapshot the document");
    st(
      {
        type: Re.FullSnapshot,
        data: {
          node: $e,
          initialOffset: Fp(window)
        }
      },
      oe
    ), on.forEach((we) => we.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && ue.adoptStyleSheets(
      document.adoptedStyleSheets,
      er.getId(document)
    );
  };
  try {
    const oe = [], $e = (de) => {
      var tt;
      return Ee(Jv)(
        {
          mutationCb: U,
          mousemoveCb: (ge, Le) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: Le,
              positions: ge
            }
          }),
          mouseInteractionCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.MouseInteraction,
              ...ge
            }
          }),
          scrollCb: Z,
          viewportResizeCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.ViewportResize,
              ...ge
            }
          }),
          inputCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.Input,
              ...ge
            }
          }),
          mediaInteractionCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.MediaInteraction,
              ...ge
            }
          }),
          styleSheetRuleCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.StyleSheetRule,
              ...ge
            }
          }),
          styleDeclarationCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.StyleDeclaration,
              ...ge
            }
          }),
          canvasMutationCb: V,
          fontCb: (ge) => st({
            type: Re.IncrementalSnapshot,
            data: {
              source: xe.Font,
              ...ge
            }
          }),
          selectionCb: (ge) => {
            st({
              type: Re.IncrementalSnapshot,
              data: {
                source: xe.Selection,
                ...ge
              }
            });
          },
          customElementCb: (ge) => {
            st({
              type: Re.IncrementalSnapshot,
              data: {
                source: xe.CustomElement,
                ...ge
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: Ae,
          inlineStylesheet: o,
          sampling: w,
          recordDOM: S,
          recordCanvas: x,
          inlineImages: re,
          userTriggeredOnInput: $,
          collectFonts: z,
          doc: de,
          maskInputFn: g,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: s,
          slimDOMOptions: Fe,
          dataURLOptions: k,
          mirror: er,
          iframeManager: se,
          stylesheetManager: ue,
          shadowDomManager: mt,
          processedNodeManager: Je,
          canvasManager: wa,
          ignoreCSSAttributes: ze,
          plugins: ((tt = K == null ? void 0 : K.filter((ge) => ge.observer)) == null ? void 0 : tt.map((ge) => ({
            observer: ge.observer,
            options: ge.options,
            callback: (Le) => st({
              type: Re.Plugin,
              data: {
                plugin: ge.name,
                payload: Le
              }
            })
          }))) || []
        },
        y
      );
    };
    se.addLoadListener((de) => {
      try {
        oe.push($e(de.contentDocument));
      } catch (tt) {
        console.warn(tt);
      }
    });
    const we = () => {
      Qi(), oe.push($e(document)), us = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? we() : (oe.push(
      Tt("DOMContentLoaded", () => {
        st({
          type: Re.DomContentLoaded,
          data: {}
        }), P === "DOMContentLoaded" && we();
      })
    ), oe.push(
      Tt(
        "load",
        () => {
          st({
            type: Re.Load,
            data: {}
          }), P === "load" && we();
        },
        window
      )
    )), () => {
      oe.forEach((de) => {
        try {
          de();
        } catch (tt) {
          String(tt).toLowerCase().includes("cross-origin") || console.warn(tt);
        }
      }), Je.destroy(), us = !1, Dv();
    };
  } catch (oe) {
    console.warn(oe);
  }
}
Wr.addCustomEvent = (e, t) => {
  if (!us)
    throw new Error("please add custom event after start recording");
  st({
    type: Re.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Wr.freezePage = () => {
  on.forEach((e) => e.freeze());
};
Wr.takeFullSnapshot = (e) => {
  if (!us)
    throw new Error("please take full snapshot after start recording");
  Qi(e);
};
Wr.mirror = er;
var yd;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(yd || (yd = {}));
const { addCustomEvent: u1 } = Wr, { freezePage: d1 } = Wr, { takeFullSnapshot: p1 } = Wr, Xi = 2, xa = 4;
class u0 {
  constructor(t) {
    _i(this, "events", []);
    _i(this, "lastMeta", null);
    _i(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === xa && (this.lastMeta = t), t.type === Xi && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === Xi), n = this.events.some((i) => i.type === xa);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === Xi), n = t.some((i) => i.type !== Xi && i.type !== xa);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function d0(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new u0({
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
const nh = "klav-sims-live", ih = "klav-sims-overlay", bd = "klav-sims-ext-css";
let Ft = null, nn = null, Ht = null, Nn = null;
const Ur = /* @__PURE__ */ new Map(), Vt = /* @__PURE__ */ new Map();
let Ts = 0, sr = !1, an = null, Dn = null, ki = !1, Sr = null, cl = 0, sn = 0, Br = /* @__PURE__ */ new Set(), Rt = null, qr = null, Ut = null, pr = [];
const hr = /* @__PURE__ */ new Set();
let Fn = !1, fr = "", dt = null, ln = null, xr = null, $r = null, vt = null, cn = null, rr = null, tr = null, dr = null, Bt = null, Pn = null;
const As = /* @__PURE__ */ new Set();
function p0(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function ul(e, t) {
  return `${e}::${p0(t.text)}`;
}
const h0 = 0.55, f0 = 0.8, dl = [];
function sh(e) {
  const t = String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), r = /* @__PURE__ */ new Set();
  if (!t) return r;
  const n = `  ${t} `;
  for (let i = 0; i < n.length - 2; i++) r.add(n.slice(i, i + 3));
  return r;
}
function m0(e, t) {
  if (e.size === 0 || t.size === 0) return 0;
  let r = 0;
  for (const n of e) t.has(n) && r++;
  return r / Math.sqrt(e.size * t.size);
}
function g0(e, t) {
  const r = sh(t.text);
  return dl.some((n) => m0(r, n.grams) >= (n.simId === e ? h0 : f0));
}
function y0(e, t) {
  As.add(ul(e, t)), dl.push({ simId: e, grams: sh(t.text) });
}
function oh(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const b0 = `
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
`, k0 = `
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
function kd(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function v0(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function za() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function w0(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Un(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const ah = { HIGH: "h", MED: "m", LOW: "l" }, vd = { HIGH: 0, MED: 1, LOW: 2 };
function x0(e) {
  if (!e) return !1;
  if (e === Ht || e === Ft || e.id === ih || e.id === nh || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function S0(e) {
  const t = [];
  for (const r of [Ht, Ft])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function lh(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function ch(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function wd(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function E0(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function C0(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function uh(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || x0(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function M0(e, t) {
  return S0(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && uh(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function R0(e, t) {
  const r = lh(t), n = ch(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = M0(i, s);
  if (!a.length) return null;
  const c = Math.max(1, wd(n));
  let l = null, d = -1 / 0;
  for (const o of a) {
    const h = C0(o.getBoundingClientRect()), u = E0(h, n);
    if (u <= 0) continue;
    const p = Math.max(1, wd(h)), g = u / c, f = Math.max(0, (p - u) / p), y = o.tagName.toLowerCase(), M = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, w = p > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, k = g - f * 0.35 + M - w;
    k > d && (l = o, d = k);
  }
  return l ?? a[0] ?? null;
}
async function T0(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: za() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await w0(za() ? 80 : 520);
}
const A0 = /* @__PURE__ */ new Set([
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
function L0(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || A0.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function _0(e) {
  const t = L0(e.text);
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
    if (!uh(a)) continue;
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
    const d = t.reduce((f, y) => f + (l.includes(y) ? 1 : 0), 0);
    if (!d) continue;
    const o = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(o) ? 0.6 : 0, p = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, g = d / t.length + h - p;
    g > i && (n = a, i = g);
  }
  return n;
}
async function I0(e, t = {}) {
  if (e.region) {
    const r = lh(e), n = ch(e.region, r);
    t.scroll !== !1 && await T0(n.left + n.width / 2, n.top + n.height / 2);
    const i = R0(e.region, e);
    if (i) return i;
  }
  return _0(e);
}
function O0() {
  if (Ft && nn) return nn;
  Ft = document.createElement("div"), Ft.id = nh, Ft.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", nn = Ft.attachShadow({ mode: "open" }), kb(nn);
  const e = document.createElement("style");
  return e.textContent = b0, nn.appendChild(e), document.body.appendChild(Ft), nn;
}
function dh() {
  if (Ht) return Ht;
  if (!document.getElementById(bd)) {
    const e = document.createElement("style");
    e.id = bd, e.textContent = k0, document.head.appendChild(e);
  }
  return Ht = document.createElement("div"), Ht.id = ih, Ht.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Ht), Ht;
}
function ph(e, t) {
  return yb({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function hh() {
  ln && (ln.textContent = "", [...Br].slice(0, 3).forEach((e) => {
    const t = Ur.get(e);
    t && ln.appendChild(ph(t, 26));
  }));
}
function N0(e, t = {}) {
  if (!(typeof document > "u")) {
    if (!Ft || !Ft.isConnected) {
      fh(e.map((r) => r.id), e, t);
      return;
    }
    t.onClose && (Rt = t.onClose), t.simControls && (qr = t.simControls);
    for (const r of e.slice(0, 8))
      Ur.has(r.id) || Ur.set(r.id, { simId: r.id, accent: r.accent || "#6366f1", initials: r.initials || r.name.slice(0, 2).toUpperCase(), name: r.name, photoUrl: r.photoUrl });
    Br = new Set(e.slice(0, 8).map((r) => r.id)), hh(), mn(), sr && dn();
  }
}
function ds() {
  var e;
  ot(Ut), Ut = null, hr.clear(), fr = "", (e = vt == null ? void 0 : vt.querySelector(".ksl-sims-btn")) == null || e.setAttribute("aria-expanded", "false");
}
function P0(e) {
  if (Ut) {
    ds();
    return;
  }
  !vt || !qr || (Ut = document.createElement("div"), Ut.className = "ksl-simmenu", Ut.setAttribute("role", "dialog"), Ut.setAttribute("aria-label", "Run or stop Sims"), vt.appendChild(Ut), e.setAttribute("aria-expanded", "true"), pr = [], Dr(!0), qr.list().then((t) => {
    pr = t, Dr();
  }).catch((t) => {
    fr = (t == null ? void 0 : t.message) || "Couldn't load your Sims.", Dr();
  }));
}
function z0(e) {
  const t = document.createElement("div"), r = hr.has(e.id);
  t.className = "ksl-sm-row" + (e.active ? e.running ? " is-running" : "" : " is-off") + (r ? " is-sel" : ""), t.dataset.simId = e.id;
  const n = document.createElement("span");
  n.className = "ksl-sm-av", n.style.background = $0(e.accent) || "#6366f1", n.textContent = (e.initials || e.name.slice(0, 2)).slice(0, 2).toUpperCase();
  const i = document.createElement("div");
  i.className = "ksl-sm-meta";
  const s = document.createElement("div");
  s.className = "ksl-sm-name", s.textContent = e.name;
  const a = document.createElement("div");
  if (a.className = "ksl-sm-st", a.textContent = e.active ? e.running ? "Running" : "Not running" : "Deactivated", a.dataset.kind = "run", i.append(s, a), !e.active) {
    t.setAttribute("aria-disabled", "true"), t.tabIndex = 0;
    const o = () => {
      fr = `${e.name} is deactivated. Activate this Sim on the Sims tab to run it.`, Dr();
    };
    return t.addEventListener("click", o), t.addEventListener("keydown", (h) => {
      (h.key === " " || h.key === "Enter") && (h.preventDefault(), o());
    }), t.append(n, i), t;
  }
  const c = document.createElement("span");
  c.className = "ksl-sm-chk" + (r ? " on" : ""), c.innerHTML = r ? Q("check", { size: 11 }) : "", t.setAttribute("role", "checkbox"), t.setAttribute("aria-checked", String(r)), t.tabIndex = 0;
  const l = () => {
    Fn || (r ? hr.delete(e.id) : hr.add(e.id), fr = "", Dr());
  };
  t.addEventListener("click", l), t.addEventListener("keydown", (o) => {
    o.target === t && (o.key === " " || o.key === "Enter") && (o.preventDefault(), l());
  });
  const d = document.createElement("button");
  return d.type = "button", d.className = "ksl-sm-act" + (e.running ? " is-stop" : ""), d.dataset.action = e.running ? "stop" : "run", d.disabled = Fn, d.setAttribute("aria-label", `${e.running ? "Stop" : "Run"} ${e.name}`), d.innerHTML = Q(e.running ? "square" : "play", { size: 11 }) + `<span>${e.running ? "Stop" : "Run"}</span>`, d.addEventListener("click", (o) => {
    o.stopPropagation(), $a(e.running ? "stop" : "run", [e.id]);
  }), d.addEventListener("keydown", (o) => o.stopPropagation()), t.append(c, n, i, d), t;
}
function Dr(e = !1) {
  var x;
  const t = Ut;
  if (!t) return;
  const r = ((x = t.querySelector(".ksl-sm-list")) == null ? void 0 : x.scrollTop) ?? 0;
  t.textContent = "";
  const n = pr.filter((T) => T.active), i = n.filter((T) => T.running), s = n.filter((T) => !T.running), a = pr.filter((T) => !T.active), c = document.createElement("div");
  c.className = "ksl-sm-head";
  const l = document.createElement("button");
  l.type = "button", l.className = "ksl-sm-back", l.setAttribute("aria-label", "Back to findings"), l.title = "Back to findings", l.innerHTML = Q("chevron-left", { size: 16 }), l.addEventListener("click", () => ds());
  const d = document.createElement("div");
  d.className = "ksl-sm-titles";
  const o = document.createElement("div");
  o.className = "ksl-sm-title", o.textContent = "Sims on this page";
  const h = document.createElement("div");
  h.className = "ksl-sm-sub", h.textContent = e ? "Loading…" : n.length ? `${i.length} of ${n.length} running` : "No activated Sims yet", d.append(o, h);
  const u = document.createElement("span");
  u.className = "ksl-head-btns";
  const p = document.createElement("button");
  if (p.type = "button", p.className = "ksl-icon-btn ksl-sm-min", p.title = "Minimize", p.setAttribute("aria-label", "Minimize Sims feedback panel"), p.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', p.addEventListener("click", () => {
    ds(), es();
  }), u.appendChild(p), Rt) {
    const T = document.createElement("button");
    T.type = "button", T.className = "ksl-icon-btn ksl-close-btn ksl-sm-close", T.title = "Close and stop all Sims", T.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), T.innerHTML = Q("x", { size: 15 }), T.addEventListener("click", () => {
      try {
        Rt == null || Rt();
      } catch {
      }
    }), u.appendChild(T);
  }
  c.append(l, d, u), t.appendChild(c);
  const g = document.createElement("div");
  if (g.className = "ksl-sm-list", e) g.innerHTML = '<div class="ksl-sm-empty">Loading Sims…</div>';
  else if (!pr.length) g.innerHTML = '<div class="ksl-sm-empty">No Sims in this project yet.</div>';
  else {
    if (n.length > 1) {
      const P = n.filter((ze) => hr.has(ze.id)).length, $ = P === n.length, z = document.createElement("div");
      z.className = "ksl-sm-all", z.setAttribute("role", "checkbox"), z.setAttribute("aria-checked", $ ? "true" : P ? "mixed" : "false"), z.tabIndex = 0;
      const re = document.createElement("span");
      re.className = "ksl-sm-chk" + ($ ? " on" : P ? " mixed" : ""), re.innerHTML = $ ? Q("check", { size: 11 }) : P ? '<span style="width:8px;height:2px;background:#fff;border-radius:2px"></span>' : "";
      const K = document.createElement("span");
      K.textContent = "Select all", z.append(re, K);
      const _ = () => {
        Fn || (n.forEach((ze) => $ ? hr.delete(ze.id) : hr.add(ze.id)), fr = "", Dr());
      };
      z.addEventListener("click", _), z.addEventListener("keydown", (ze) => {
        (ze.key === " " || ze.key === "Enter") && (ze.preventDefault(), _());
      }), g.appendChild(z);
    }
    const T = (P, $, z) => {
      if (!$.length) return;
      const re = document.createElement("div");
      if (re.className = "ksl-sm-group", re.textContent = `${P} · ${$.length}`, g.appendChild(re), z) {
        const K = document.createElement("div");
        K.className = "ksl-sm-group-note", K.textContent = z, g.appendChild(K);
      }
      for (const K of $) g.appendChild(z0(K));
    };
    T("Running", i), T("Not running", s), T("Deactivated", a, "Activate these on the Sims tab to run them here.");
  }
  if (t.appendChild(g), g.scrollTop = r, fr) {
    const T = document.createElement("div");
    T.className = "ksl-sm-note", T.setAttribute("role", "status"), T.textContent = fr, t.appendChild(T);
  }
  const f = n.filter((T) => hr.has(T.id)), y = f.filter((T) => !T.running).map((T) => T.id), M = f.filter((T) => T.running).map((T) => T.id), w = document.createElement("div");
  w.className = "ksl-sm-foot";
  const k = document.createElement("span");
  k.className = "ksl-sm-cnt", k.textContent = f.length ? `${f.length} selected` : "Tick Sims to run or stop several";
  const L = document.createElement("button");
  L.type = "button", L.className = "ksl-sm-bulk", L.dataset.action = "run-selected", L.disabled = Fn || !y.length, L.innerHTML = Q("play", { size: 11 }) + `<span>Run${y.length ? " " + y.length : ""}</span>`, L.addEventListener("click", () => void $a("run", y));
  const S = document.createElement("button");
  S.type = "button", S.className = "ksl-sm-bulk is-stop", S.dataset.action = "stop-selected", S.disabled = Fn || !M.length, S.innerHTML = Q("square", { size: 11 }) + `<span>Stop${M.length ? " " + M.length : ""}</span>`, S.addEventListener("click", () => void $a("stop", M)), w.append(k, L, S), t.appendChild(w);
}
let Sa = Promise.resolve(), Gi = 0;
async function $a(e, t) {
  if (!qr || !t.length) return;
  const r = qr, n = new Set(t);
  pr = pr.map((s) => s.active && n.has(s.id) ? { ...s, running: e === "run" } : s);
  for (const s of t) hr.delete(s);
  const i = t.length;
  fr = e === "run" ? `${i === 1 ? "Sim is" : `${i} Sims are`} running.` : `${i === 1 ? "Sim" : `${i} Sims`} stopped. Reported issues stay here and in Sim Reports.`, Dr(), Gi++, Sa = Sa.then(async () => {
    try {
      const s = await (e === "run" ? r.run(t) : r.stop(t));
      Gi--, Gi || (pr = s);
    } catch (s) {
      Gi--, fr = (s == null ? void 0 : s.message) || "Couldn't update the Sims — please try again.";
      try {
        pr = await r.list();
      } catch {
      }
    }
    Ut && Ut.isConnected && Dr();
  }), await Sa;
}
function $0(e) {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(e || "")) ? String(e) : null;
}
function fh(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Fa(), Rt = r.onClose ?? null, qr = r.simControls ?? null;
  const n = O0();
  dh(), Nn = new AbortController();
  const i = e === "all" ? t : t.filter((u) => e.includes(u.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Fa();
    return;
  }
  i.slice(0, 8).forEach((u) => {
    const p = u.accent || "#6366f1", g = u.initials || u.name.slice(0, 2).toUpperCase();
    Ur.set(u.id, { simId: u.id, accent: p, initials: g, name: u.name, photoUrl: u.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Bt = document.createElement("div"), Bt.className = "ksl-sr", Bt.id = "ksl-announcer", Bt.setAttribute("aria-live", "polite"), Bt.setAttribute("aria-atomic", "true"), s.appendChild(Bt), dt = document.createElement("button"), dt.type = "button", dt.className = "ksl-launcher", dt.setAttribute("aria-label", "Open Sims feedback panel"), dt.addEventListener("click", () => U0());
  const a = document.createElement("span");
  a.className = "ksl-pill", ln = document.createElement("span"), ln.className = "ksl-pill-avatars", xr = document.createElement("span"), xr.className = "ksl-pill-txt", a.append(ln, xr), $r = document.createElement("span"), $r.className = "ksl-pill-badge", $r.hidden = !0, dt.append(a, $r);
  const c = document.createElement("div");
  if (c.className = "ksl-launch-group", c.appendChild(dt), Rt) {
    const u = document.createElement("button");
    u.type = "button", u.className = "ksl-stop-all", u.title = "Stop all Sims", u.setAttribute("aria-label", "Stop all Sims"), u.textContent = "Stop", u.addEventListener("click", (p) => {
      p.stopPropagation();
      try {
        Rt == null || Rt();
      } catch {
      }
    }), c.appendChild(u);
  }
  s.appendChild(c), Br = new Set(i.slice(0, 8).map((u) => u.id)), hh(), vt = document.createElement("section"), vt.className = "ksl-panel", vt.setAttribute("aria-label", "Sims feedback"), vt.setAttribute("role", "dialog");
  const l = document.createElement("div");
  l.className = "ksl-head";
  const d = document.createElement("div");
  d.className = "ksl-title-row";
  const o = document.createElement("div");
  o.className = "ksl-title", o.textContent = "Sims feedback";
  const h = document.createElement("button");
  if (h.type = "button", h.className = "ksl-icon-btn", h.title = "Minimize", h.setAttribute("aria-label", "Minimize Sims feedback panel"), Rt) {
    h.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', h.addEventListener("click", () => es());
    const u = document.createElement("button");
    u.type = "button", u.className = "ksl-icon-btn ksl-close-btn", u.title = "Close and stop all Sims", u.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), u.innerHTML = Q("x", { size: 15 }), u.addEventListener("click", () => {
      try {
        Rt == null || Rt();
      } catch {
      }
    });
    const p = document.createElement("span");
    if (p.className = "ksl-head-btns", qr) {
      const g = document.createElement("button");
      g.type = "button", g.className = "ksl-sims-btn", g.setAttribute("aria-haspopup", "dialog"), g.setAttribute("aria-expanded", "false"), g.title = "Run or stop Sims", g.innerHTML = Q("users", { size: 14 }) + "<span>Sims</span>", g.addEventListener("click", () => P0(g)), p.append(g);
    }
    p.append(h, u), d.append(o, p);
  } else
    h.innerHTML = Q("x", { size: 15 }), h.addEventListener("click", () => es()), d.append(o, h);
  cn = document.createElement("div"), cn.className = "ksl-count", rr = document.createElement("div"), rr.className = "ksl-status", rr.hidden = !0, rr.setAttribute("role", "status"), tr = document.createElement("div"), tr.className = "ksl-chips", l.append(d, cn, rr, tr), dr = document.createElement("div"), dr.className = "ksl-list", dr.setAttribute("role", "list"), vt.append(l, dr), s.appendChild(vt), document.addEventListener("keydown", (u) => {
    if (u.key === "Escape" && Ut) {
      ds();
      return;
    }
    u.key === "Escape" && sr && es();
  }, { signal: Nn.signal }), oh(!0), mn();
}
function pl(e) {
  ki = e, dt == null || dt.classList.toggle("is-reviewing", e), mn(), sr && dn();
}
function hl() {
  const e = Br.size || Ur.size, t = e === 1 ? "Sim is" : "Sims are";
  switch (Sr) {
    case "analysing":
      return `${e === 1 ? "Sim is" : `${e} Sims are`} analysing this page…`;
    case "running":
      return `${t} running on this page…`;
    case "completed": {
      const r = Ts - cl;
      return `Sim run completed · ${r ? `${r} new finding${r === 1 ? "" : "s"}` : "no new findings"}`;
    }
    case "failed":
      return "Sim run didn't finish — it will retry on the next change.";
    default:
      return "";
  }
}
function D0(e) {
  e === "analysing" ? (sn === 0 && (cl = Ts), sn++) : e === "completed" || e === "failed" ? (sn = Math.max(0, sn - 1), sn > 0 && (e = "running")) : e === null && (sn = 0), Sr = e, pl(e === "analysing" || e === "running"), Bt && e && (Bt.textContent = hl());
}
function F0() {
  if (!rr || (rr.hidden = !Sr, rr.className = "ksl-status" + (Sr ? ` is-${Sr}` : ""), rr.textContent = "", !Sr)) return;
  const e = document.createElement("span");
  e.className = "ksl-status-dot";
  const t = document.createElement("span");
  t.className = "ksl-status-txt", t.textContent = hl(), rr.append(e, t);
}
function U0() {
  !vt || !dt || (sr = !0, vt.classList.add("is-open"), dt.hidden = !0, dt.parentElement && (dt.parentElement.hidden = !0), dn());
}
function es() {
  !vt || !dt || (sr = !1, vt.classList.remove("is-open"), dt.hidden = !1, dt.parentElement && (dt.parentElement.hidden = !1), mn());
}
function mh() {
  const e = Array.from(Vt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Un(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function mn() {
  const e = mh();
  if (xr)
    if (Sr === "analysing" || Sr === "running")
      xr.textContent = hl();
    else if (ki && e.total === 0)
      xr.innerHTML = "Your Sims are reviewing…";
    else if (e.total === 0) {
      const t = Br.size || Ur.size;
      xr.innerHTML = `${t} Sim${t === 1 ? " is" : "s are"} running on this page`;
    } else
      xr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`;
  $r && ($r.hidden = e.high === 0, $r.textContent = `${e.high} high`), F0(), sr && gh(e);
}
function gh(e) {
  cn && (e.total === 0 ? cn.innerHTML = ki ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : cn.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), B0();
}
function B0() {
  if (!tr) return;
  const e = Array.from(Vt.values());
  if (tr.hidden = e.length === 0, tr.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", tr.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (an === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(an === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      an = an === i.simId ? null : i.simId, dn();
    }), tr.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", tr.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => Un(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Dn === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${ah[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      Dn = Dn === i ? null : i, dn();
    }), tr.appendChild(a);
  });
}
function q0() {
  return Array.from(Vt.values()).filter((e) => !an || e.entry.simId === an).filter((e) => !Dn || Un(e.obs) === Dn).sort((e, t) => {
    const r = Un(e.obs), n = Un(t.obs), i = r ? vd[r] : 3, s = n ? vd[n] : 3;
    return i - s;
  });
}
function W0(e) {
  const { entry: t, obs: r } = e, n = Un(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(ph(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const g = document.createElement("span");
    g.className = "ksl-r-sent", g.textContent = c, s.appendChild(g);
  }
  if (n) {
    const g = document.createElement("span");
    g.className = `ksl-sev ${ah[n]}`, g.setAttribute("aria-label", `Priority: ${n}`), g.textContent = n, s.appendChild(g);
  }
  i.appendChild(s);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-expand", d.textContent = "Show more", d.addEventListener("click", () => {
    const g = i.classList.toggle("is-expanded");
    d.textContent = g ? "Show less" : "Show more";
  }), i.appendChild(d);
  const o = document.createElement("div");
  o.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = Q("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var g;
    (g = ts.onTriage) == null || g.call(ts, r, t.name), xd(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = Q("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    H0(e.id);
  });
  const p = document.createElement("button");
  return p.type = "button", p.className = "ksl-r-act dismiss", p.textContent = "Dismiss", p.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), p.addEventListener("click", () => {
    xd(e.id);
  }), o.append(h, u, p), i.appendChild(o), i;
}
function j0(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function dn() {
  if (!dr || !sr) {
    mn();
    return;
  }
  const e = mh();
  gh(e);
  const t = q0();
  if (dr.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Vt.size > 0;
    if (ki && !i) {
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
    dr.appendChild(n), Vt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = W0(n);
    n.rowEl = i, dr.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Vt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), j0(dr);
}
function Da() {
  Pn == null || Pn(), Pn = null;
}
async function H0(e) {
  const t = Vt.get(e);
  if (!t) return;
  const r = await I0(t.obs, { scroll: !0 });
  !r || !Ht || Y0(r, t.entry.accent);
}
function Y0(e, t) {
  Da();
  const r = dh(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${kd(t, 0.16)},0 0 24px ${kd(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), o = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Pn === l && Da();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), ot(n);
  };
  Pn = l;
}
function V0(e, t) {
  const r = `f_${e.simId}_${++Ts}`;
  Vt.set(r, { id: r, entry: e, obs: t, rowEl: null }), sr ? dn() : mn(), Bt && (Bt.textContent = "", requestAnimationFrame(() => {
    Bt && (Bt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function K0(e) {
  const t = Vt.get(e);
  if (!t) return;
  const r = () => {
    Vt.delete(e), sr ? dn() : mn();
  };
  t.rowEl && sr ? (t.rowEl.classList.add("is-removing"), setTimeout(r, za() ? 0 : 300)) : r();
}
function xd(e) {
  const t = Vt.get(e);
  t && (As.add(ul(t.entry.simId, t.obs)), K0(e));
}
function X0(e, t, r) {
  if (!Ft) return;
  const n = Ur.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length && !(Br.size && !Br.has(e))) {
    pl(!1);
    for (const i of r) {
      if (!v0(i)) continue;
      const s = ul(e, i);
      As.has(s) || g0(e, i) || (y0(e, i), V0(n, i));
    }
  }
}
function Fa() {
  Da(), Vt.clear(), Ts = 0, Ur.clear(), As.clear(), dl.length = 0, sr = !1, an = null, Dn = null, ki = !1, Sr = null, cl = 0, sn = 0, Br = /* @__PURE__ */ new Set(), Rt = null, qr = null, Ut = null, pr = [], hr.clear(), Fn = !1, fr = "", Nn == null || Nn.abort(), Nn = null, dt = null, ln = null, xr = null, $r = null, vt = null, cn = null, rr = null, tr = null, dr = null, Bt = null, ot(Ht), Ht = null, ot(Ft), Ft = null, nn = null, oh(!1);
}
const ts = {
  deploy: fh,
  updateSims: N0,
  setReviewing: pl,
  setRunStatus: D0,
  renderFeedback: X0,
  undeploy: Fa,
  onTriage: null
};
function G0() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = ts);
}
typeof window < "u" && G0();
const Sd = "klav-ao-css", J0 = "klav-ao-overlay";
function Z0(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), d = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(d, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const Q0 = `
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
let rn = null, e1 = 1;
const ps = /* @__PURE__ */ new Map();
function Ed(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function t1() {
  if (rn) return rn;
  if (!document.getElementById(Sd)) {
    const e = document.createElement("style");
    e.id = Sd, e.textContent = Q0, document.head.appendChild(e);
  }
  return rn = document.createElement("div"), rn.id = J0, rn.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(rn), rn;
}
function h1(e, t, r = {}) {
  const n = t1(), i = r.color ?? "#6366f1", s = `klav-ao-${e1++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Ed(i, 0.14)},0 0 24px ${Ed(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: u, top: p, below: g } = Z0(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (g ? " tail-top" : ""), l.dataset.aoId = s, l.style.borderLeftColor = i, l.style.left = u + "px", l.style.top = p + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const y = document.createElement("span");
    y.className = "klav-ao-lbl", y.style.color = i, y.textContent = t, f.appendChild(y);
    const M = r.priority ?? r.severity;
    if (M) {
      const k = M === "medium" ? " sev-m" : M === "low" ? " sev-l" : "", L = document.createElement("span");
      L.className = `klav-ao-sev${k}`, L.textContent = M, f.appendChild(L);
    }
    const w = document.createElement("button");
    w.className = "klav-ao-dismiss", w.textContent = "Dismiss", w.addEventListener("click", () => yh(s)), l.appendChild(f), l.appendChild(w), n.appendChild(l);
  }
  return ps.set(s, { halo: c, pin: l }), s;
}
function yh(e) {
  const t = ps.get(e);
  if (!t) return;
  ps.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    ot(n), ot(r);
  }, 240)) : ot(r);
}
function f1() {
  for (const e of [...ps.keys()]) yh(e);
}
let fl = Tn, zr = "";
const bh = { consoleErrors: [], networkFailures: [] };
let ml, kh, Bn = null;
function Rn() {
  return fl.backendUrl || Xd;
}
const r1 = 15e3;
function ni(e, t = {}, r = r1) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function vh(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Cd() {
  return Eg(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function n1() {
  return Bg(bh, { identity: ml, metadata: kh });
}
async function i1(e) {
  return Pg(
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
      projectId: zr || void 0,
      replayEvents: e.replayEvents
    },
    fl,
    { backend: Sb }
  );
}
function gl(e = "bug") {
  const t = lb(e, {
    onCaptureFull: Cd,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: Yc,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await ni(Rn() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: zr, text: r, url: location.href })
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
        const i = await ni(Rn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: zr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: mo() })
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
        const i = await ni(Rn() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: zr,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: mo()
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
        s.append("projectId", zr), s.append("audio", r, "recording.webm"), r.type && s.append("mime", r.type), s.append("pageUrl", location.href), n != null && n.text && s.append("text", n.text), (i = n == null ? void 0 : n.frames) != null && i.length && s.append("frames", JSON.stringify(n.frames));
        const a = await ni(Rn() + "/api/report/split", { method: "POST", body: s }, 9e4);
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
        n.append("projectId", zr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await ni(Rn() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(Rn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", zr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return cp();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => jb({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    // Files over the single-request caps upload in chunks first (core submitReport → large-upload).
    largeFileUploads: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => Yc(a))), i = await Promise.all(n.map((a) => Hb(a))), s = n1();
      return r.attachConsole !== !0 && (s.consoleErrors = []), i1({
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
        reporter: ml,
        clientInfo: mo(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (Bn == null ? void 0 : Bn.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Cd();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function s1() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function o1() {
  qg(bh, { consoleLevels: !0 });
}
function wh(e) {
  ml = e ? vh(e) : void 0;
}
function xh(e) {
  kh = e ? vh(e) : void 0;
}
function a1() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = Eb, (document.head || document.documentElement).appendChild(e);
}
function l1() {
  document.addEventListener("contextmenu", (e) => {
    if (Wy(e.target)) return;
    e.preventDefault(), a1();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, o, h, u, p = {}) => {
      const g = Mb(document, { iconHtml: Q(d), label: o, desc: h, primary: p.primary });
      return g.addEventListener("click", () => {
        a(), gl(u);
      }), g;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      ot(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Sh(e = {}) {
  if (fl = {
    ...Tn,
    ...e,
    jira: { ...Tn.jira, ...e.jira },
    linear: { ...Tn.linear, ...e.linear },
    github: { ...Tn.github, ...e.github },
    plane: { ...Tn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (zr = e.projectId), o1(), s1(), l1(), !Bn)
    try {
      Bn = d0(Wr);
    } catch {
      Bn = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Sh, openModal: gl, identify: wh, setMetadata: xh });
const m1 = { init: Sh, openModal: gl, identify: wh, setMetadata: xh };
export {
  ts as KlavitySims,
  ts as SimsLive,
  yh as clearAnnotation,
  f1 as clearAnnotations,
  m1 as default,
  wh as identify,
  Sh as init,
  G0 as installKlavitySims,
  gl as openModal,
  xh as setMetadata,
  h1 as showAnnotation
};
