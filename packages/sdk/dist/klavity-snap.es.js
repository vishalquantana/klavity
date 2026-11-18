var Yh = Object.defineProperty;
var Vh = (e, t, r) => t in e ? Yh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Ei = (e, t, r) => Vh(e, typeof t != "symbol" ? t + "" : t, r);
function Gh(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const id = 112, sd = 72, od = 89, ad = 115;
let Bs;
function Xh() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Kh(e) {
  let t = -1;
  Bs || (Bs = Xh());
  for (let r = 0; r < e.length; r++)
    t = Bs[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Jh(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === id && e[r - 2] === sd && e[r - 1] === od && e[r] === ad)
      return r - 3;
  return 0;
}
function Zh(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = id, n[1] = sd, n[2] = od, n[3] = ad, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Kh(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Jh(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const Qh = "AAlwSFlz", ef = "AAAJcEhZ", tf = "AAAACXBI";
function rf(e) {
  let t = e.indexOf(Qh);
  return t === -1 && (t = e.indexOf(ef)), t === -1 && (t = e.indexOf(tf)), t;
}
const ld = "[modern-screenshot]", Ir = typeof window < "u", nf = Ir && "Worker" in window, sf = Ir && "atob" in window, of = Ir && "btoa" in window;
var nd;
const Sa = Ir ? (nd = window.navigator) == null ? void 0 : nd.userAgent : "", cd = Sa.includes("Chrome"), Xi = Sa.includes("AppleWebKit") && !cd, Ea = Sa.includes("Firefox"), af = (e) => e && "__CONTEXT__" in e, lf = (e) => e.constructor.name === "CSSFontFaceRule", cf = (e) => e.constructor.name === "CSSImportRule", uf = (e) => e.constructor.name === "CSSLayerBlockRule", ur = (e) => e.nodeType === 1, ci = (e) => typeof e.className == "object", ud = (e) => e.tagName === "image", df = (e) => e.tagName === "use", ni = (e) => ur(e) && typeof e.style < "u" && !ci(e), pf = (e) => e.nodeType === 8, hf = (e) => e.nodeType === 3, $n = (e) => e.tagName === "IMG", os = (e) => e.tagName === "VIDEO", ff = (e) => e.tagName === "CANVAS", mf = (e) => e.tagName === "TEXTAREA", gf = (e) => e.tagName === "INPUT", yf = (e) => e.tagName === "STYLE", bf = (e) => e.tagName === "SCRIPT", kf = (e) => e.tagName === "SELECT", vf = (e) => e.tagName === "SLOT", wf = (e) => e.tagName === "IFRAME", xf = (...e) => console.warn(ld, ...e);
function Sf(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const la = (e) => e.startsWith("data:");
function dd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Ir && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Ir)
    return e;
  const r = as().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function as(e) {
  return (e && ur(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const ls = "http://www.w3.org/2000/svg";
function Ef(e, t, r) {
  const n = as(r).createElementNS(ls, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Cf(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Mf(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Rf = (e) => Mf(e, "dataUrl");
function In(e, t) {
  const r = as(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function ii(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? In(e, as(i)) : e;
    let l = null, p = null;
    function o() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(o, n)), os(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? ii(c.poster, t).then(r) : o();
      if (c.readyState >= 2)
        return o();
      const u = o, d = (m) => {
        a == null || a(
          "Failed video load",
          h,
          m
        ), s == null || s(m), o();
      };
      p = () => {
        c.removeEventListener("loadeddata", u), c.removeEventListener("error", d);
      }, c.addEventListener("loadeddata", u, { once: !0 }), c.addEventListener("error", d, { once: !0 });
    } else {
      const h = ud(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const u = async () => {
        if ($n(c) && "decode" in c)
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
      }, d = (m) => {
        a == null || a(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), o();
      };
      if ($n(c) && c.complete)
        return u();
      p = () => {
        c.removeEventListener("load", u), c.removeEventListener("error", d);
      }, c.addEventListener("load", u, { once: !0 }), c.addEventListener("error", d, { once: !0 });
    }
  });
}
async function Tf(e, t) {
  ni(e) && ($n(e) || os(e) ? await ii(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => ii(n, t)))
  ));
}
const pd = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function hd(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Kl = 0;
function Af(e) {
  const t = `${ld}[#${Kl}]`;
  return Kl++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && xf(...r)
  };
}
function Lf(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function cs(e, t) {
  return af(e) ? e : _f(e, { ...t, autoDestruct: !0 });
}
async function _f(e, t) {
  var d, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Ir ? window.document : void 0), l = ((d = e.ownerDocument) == null ? void 0 : d.defaultView) ?? (Ir ? window : void 0), p = /* @__PURE__ */ new Map(), o = {
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
      requestInit: Lf((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Af(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: fd(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(ls, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: nf && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var k, A, S, x;
          const { url: E, result: v } = y.data;
          v ? (A = (k = p.get(E)) == null ? void 0 : k.resolve) == null || A.call(k, v) : (x = (S = p.get(E)) == null ? void 0 : S.reject) == null || x.call(S, new Error(`Error receiving message from worker: ${E}`));
        }, f.onmessageerror = (y) => {
          var v, k;
          const { url: E } = y.data;
          (k = (v = p.get(E)) == null ? void 0 : v.reject) == null || k.call(v, new Error(`Error receiving message from worker: ${E}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Sf(c) && "image/webp",
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
  o.log.time("wait until load"), await Tf(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: u } = If(e, o);
  return o.width = h, o.height = u, o;
}
function fd(e) {
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
function If(e, t) {
  let { width: r, height: n } = t;
  if (ur(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Of(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await ii(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Nf(e.ownerDocument, t), p = () => {
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
function Nf(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function md(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return In(s, e.ownerDocument);
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
function Pf(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Ca(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function zf(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function $f(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return In(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await ii(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? In(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? In(e.poster, e.ownerDocument) : r;
    }
    return md(s, t);
  }
  return r;
}
function Df(e, t) {
  return ff(e) ? md(e, t) : wf(e) ? Pf(e, t) : $n(e) ? zf(e) : os(e) ? $f(e, t) : e.cloneNode(!1);
}
function Ff(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${pd()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Uf = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Bf = [
  "stroke",
  "fill"
];
function gd(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = ci(e) && i !== "svg", a = s ? Bf.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Ff(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const o = p == null ? void 0 : p.document;
  let h, u;
  s ? (h = o.createElementNS(ls, "svg"), u = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, y]) => {
    u.setAttributeNS(null, f, y);
  }), h.appendChild(u)) : h = u = o.createElement(i), u.textContent = " ", o.body.appendChild(h);
  const d = p.getComputedStyle(u, t), m = /* @__PURE__ */ new Map();
  for (let f = d.length, y = 0; y < f; y++) {
    const E = d.item(y);
    Uf.includes(E) || m.set(E, d.getPropertyValue(E));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function yd(e, t, r) {
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
    const p = e.getPropertyValue(l), o = e.getPropertyPriority(l), h = l.lastIndexOf("-"), u = h > -1 ? l.substring(0, h) : void 0;
    if (u) {
      let d = s.get(u);
      d || (d = /* @__PURE__ */ new Map(), s.set(u, d)), d.set(l, [p, o]);
    }
    t.get(l) === p && !o || (u ? i.push(u) : n.set(l, [p, o]));
  }
  return n;
}
function qf(e, t, r, n) {
  var h, u, d, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), p = gd(e, null, n);
  a == null || a.forEach((f, y) => {
    p.delete(y);
  });
  const o = yd(l, p, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), cd && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((u = o.get("overflow-x")) == null ? void 0 : u[0]) === "hidden" || ((d = o.get("overflow-y")) == null ? void 0 : d[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return o.forEach(([f, y], E) => {
    c.setProperty(E, f, y);
  }), o;
}
function jf(e, t) {
  (mf(e) || gf(e) || kf(e)) && t.setAttribute("value", e.value);
}
const Wf = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Hf = [
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
function Yf(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: c, currentNodeStyle: l } = n;
  if (!a || !s)
    return;
  function p(o) {
    var k;
    const h = s.getComputedStyle(e, o);
    let u = h.getPropertyValue("content");
    if (!u || u === "none")
      return;
    i == null || i(u), u = u.replace(/(')|(")|(counter\(.+\))/g, "");
    const d = [pd()], m = gd(e, o, n);
    l == null || l.forEach((A, S) => {
      m.delete(S);
    });
    const f = yd(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((k = f.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${u}';`
    ];
    if (f.forEach(([A, S], x) => {
      y.push(`${x}: ${A}${S ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...d].join(" ");
    } catch (A) {
      n.log.warn("Failed to copyPseudoClass", A);
      return;
    }
    const E = y.join(`
  `);
    let v = c.get(E);
    v || (v = [], c.set(E, v)), v.push(`.${d[0]}${o}`);
  }
  Wf.forEach(p), r && Hf.forEach(p);
}
const Jl = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Zl(e, t, r, n, i) {
  if (ur(r) && (yf(r) || bf(r)) || n.filter && !n.filter(r))
    return;
  Jl.has(t.nodeName) || Jl.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await Ca(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Vf(e, s), t.appendChild(s);
}
async function Ql(e, t, r, n) {
  var s;
  let i = e.firstChild;
  ur(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!pf(a))
      if (ur(a) && vf(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await Zl(e, t, c[l], r, n);
      } else
        await Zl(e, t, a, r, n);
}
function Vf(e, t) {
  if (!ni(e) || !ni(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d: p } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = p, t.style.transform = s.toString();
}
function Gf(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const Xf = /^[\w-:]+$/;
async function Ca(e, t, r = !1, n) {
  var p, o, h, u;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && hf(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && ur(e) && (ni(e) || ci(e))) {
    const d = await Df(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = d.getAttributeNames();
      for (let A = k.length, S = 0; S < A; S++) {
        const x = k[S];
        Xf.test(x) || d.removeAttribute(x);
      }
    }
    const m = t.currentNodeStyle = qf(e, d, r, t);
    r && Gf(d, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], E = hd((u = m.get("font-family")) == null ? void 0 : u[0]), v = E ? (k) => {
      y === "uppercase" ? k = k.toUpperCase() : y === "lowercase" ? k = k.toLowerCase() : y === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), E.forEach((A) => {
        let S = a.get(A);
        S || a.set(A, S = /* @__PURE__ */ new Set()), k.split("").forEach((x) => S.add(x));
      });
    } : void 0;
    return Yf(
      e,
      d,
      f,
      t,
      v
    ), jf(e, d), os(e) || await Ql(
      e,
      d,
      t,
      v
    ), await (c == null ? void 0 : c(d)), d;
  }
  const l = e.cloneNode(!1);
  return await Ql(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function Kf(e) {
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
function Jf(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Rf);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function si(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: s } = t;
  let a = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: p,
    fetchFn: o,
    fetch: {
      requestInit: h,
      bypassingCache: u,
      placeholderImage: d
    },
    font: m,
    workers: f,
    fontFamilies: y
  } = e;
  n === "image" && (Xi || Ea) && e.drawImageCount++;
  let E = p.get(r);
  if (!E) {
    u && u instanceof RegExp && u.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, k = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((R) => {
      y.has(R) && y.get(R).forEach((O) => k.add(O));
    });
    const A = v && k.size, S = {
      url: a,
      timeout: c,
      responseType: A ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: l } : void 0,
      ...h
    };
    E = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, E.response = (async () => {
      if (o && n === "image") {
        const x = await o(r);
        if (x)
          return x;
      }
      return !Xi && r.startsWith("http") && f.length ? new Promise((x, R) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...S }), E.resolve = x, E.reject = R;
      }) : Jf(S);
    })().catch((x) => {
      if (p.delete(r), n === "image" && d)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof d == "string" ? d : d(s);
      throw x;
    }), p.set(r, E);
  }
  return E.response;
}
async function bd(e, t, r, n) {
  if (!kd(e))
    return e;
  for (const [i, s] of Zf(e, t))
    try {
      const a = await si(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Qf(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function kd(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const vd = /url\((['"]?)([^'"]+?)\1\)/g;
function Zf(e, t) {
  const r = [];
  return e.replace(vd, (n, i, s) => (r.push([s, dd(s, t)]), n)), r.filter(([n]) => !la(n));
}
function Qf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const em = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function tm(e, t) {
  return em.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Xi || Ea) && t.drawImageCount++, bd(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function rm(e, t) {
  if ($n(e)) {
    const r = e.currentSrc || e.src;
    if (!la(r))
      return [
        si(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Xi || Ea) && t.drawImageCount++;
  } else if (ci(e) && !la(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      si(t, {
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
function nm(e, t) {
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
        si(t, {
          url: s,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function wd(e, t) {
  const { tasks: r } = t;
  ur(e) && (($n(e) || ud(e)) && r.push(...rm(e, t)), df(e) && r.push(...nm(e, t))), ni(e) && r.push(...tm(e.style, t)), e.childNodes.forEach((n) => {
    wd(n, t);
  });
}
async function im(e, t) {
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
      const l = tc(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((d) => {
        try {
          return "cssRules" in d && !!d.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${d.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), o = p.createElement("style");
      p.head.appendChild(o);
      const h = o.sheet;
      await Promise.all(
        l.flatMap((d) => Array.from(d.cssRules).map(async (m) => {
          if (cf(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await si(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const E = y.replace(
              vd,
              (v, k, A) => v.replace(A, dd(A, f))
            );
            for (const v of om(E))
              try {
                h.insertRule(v, h.cssRules.length);
              } catch (k) {
                t.log.warn("Error inserting rule from remote css import", { rule: v, error: k });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const u = [];
      l.forEach((d) => {
        ca(d.cssRules, u);
      }), u.filter((d) => {
        var m;
        return lf(d) && kd(d.style.getPropertyValue("src")) && ((m = hd(d.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((d) => {
        const m = d, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          bd(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = tc(y, t), s.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const sm = /(\/\*[\s\S]*?\*\/)/g, ec = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function om(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(sm, "");
  for (; ; ) {
    const s = ec.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(ec, "");
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
const am = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, lm = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function tc(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(lm, (i) => {
    for (; ; ) {
      const [s, , a] = am.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function ca(e, t = []) {
  for (const r of Array.from(e))
    uf(r) ? t.push(...ca(r.cssRules)) : "cssRules" in r ? ca(r.cssRules, t) : t.push(r);
  return t;
}
const cm = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function um(e) {
  return cm.test(e.innerHTML);
}
async function dm(e, t) {
  const r = await cs(e, t);
  if (ur(r.node) && ci(r.node) && !um(r.node))
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
    onCloneNode: u,
    onEmbedNode: d,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await Ca(r.node, r, !0);
  if (a && n) {
    let A = "";
    l.forEach((S, x) => {
      A += `${S.join(`,
`)} {
  ${x}
}
`;
    }), a.appendChild(n.createTextNode(A));
  }
  i.timeEnd("clone node"), await (u == null ? void 0 : u(f)), p !== !1 && ur(f) && (i.time("embed web font"), await im(f, r), i.timeEnd("embed web font")), i.time("embed node"), wd(f, r);
  const y = s.length;
  let E = 0;
  const v = async () => {
    for (; ; ) {
      const A = s.pop();
      if (!A)
        break;
      try {
        await A;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      o == null || o(++E, y);
    }
  };
  o == null || o(E, y), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (d == null ? void 0 : d(f));
  const k = pm(f, r);
  return c && k.insertBefore(c, k.children[0]), a && k.insertBefore(a, k.children[0]), h && Kf(r), await (m == null ? void 0 : m(k)), k;
}
function pm(e, t) {
  const { width: r, height: n } = t, i = Ef(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function hm(e, t) {
  var a;
  const r = await cs(e, t), n = await dm(r), i = Cf(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = fd(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(ls, "defs"), r.svgStyles.clear());
  const s = In(i, n.ownerDocument);
  return await Of(s, r);
}
async function fm(e, t) {
  const r = await cs(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await hm(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && sf && of) {
    const [p, o] = l.split(",");
    let h = 0, u = !1;
    if (s === "image/png") {
      const k = rf(o);
      k >= 0 ? (h = Math.ceil((k + 28) / 3) * 4, u = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const d = o.substring(0, h), m = o.substring(h), f = window.atob(d), y = new Uint8Array(f.length);
    for (let k = 0; k < y.length; k++)
      y[k] = f.charCodeAt(k);
    const E = s === "image/png" ? Zh(y, a, u) : Gh(y, a), v = window.btoa(String.fromCharCode(...E));
    l = [p, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function mm(e, t) {
  return fm(
    await cs(e, { ...t, type: "image/png" })
  );
}
const gm = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", ym = 8e3, bm = 16384, rc = 4096, km = 16e6, vm = 500, wm = 1e4, qs = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", xd = 600, xm = 1200, Sm = 24, Em = 1024, jt = 32, Cm = 4, Sd = 400, Mm = 0.985, Rm = 250;
function Ed(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Tm(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return Ed(r, location.origin);
}
function Am(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && Ed(t.src || "", location.origin)) return !0;
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
function js(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function nc(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Lm(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(rc / i, rc / s), l = Math.min(a, c, Math.sqrt(km / (i * s))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(s * l));
    const o = p.getContext("2d");
    if (!o) return { dataUrl: qs, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + vm;
    let u = 0;
    const d = () => u >= wm || Date.now() >= h, m = (y, E = !1) => {
      var x;
      if (d() || (u++, !E && t && !t(y))) return;
      const v = getComputedStyle(y);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const k = y.getBoundingClientRect(), A = k.left - n.left, S = k.top - n.top;
      if (k.width > 0 && k.height > 0) {
        nc(v.backgroundColor) || (o.fillStyle = v.backgroundColor, o.fillRect(A, S, k.width, k.height));
        const R = parseFloat(v.borderTopWidth);
        R > 0 && v.borderTopStyle !== "none" && !nc(v.borderTopColor) && (o.strokeStyle = v.borderTopColor, o.lineWidth = R, o.strokeRect(A, S, k.width, k.height)), y.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(A, S, k.width, k.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(A, S, k.width, k.height));
      }
      for (const R of Array.from(y.childNodes)) {
        if (d()) break;
        if (R instanceof HTMLElement) {
          m(R);
          continue;
        }
        if (!(R.nodeType !== Node.TEXT_NODE || !((x = R.textContent) != null && x.trim())))
          try {
            const O = document.createRange();
            O.selectNodeContents(R);
            const $ = O.getBoundingClientRect();
            if ($.width <= 0 || $.height <= 0) continue;
            o.save(), o.beginPath(), o.rect($.left - n.left, $.top - n.top, $.width, $.height), o.clip(), o.fillStyle = v.color, o.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, o.textBaseline = "top", o.fillText(R.textContent.trim(), $.left - n.left, $.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: qs, scale: 1 };
  } catch {
    return { dataUrl: qs, scale: 1 };
  }
}
function _m() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Ws(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Im(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < Sm; s++) {
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
async function ic(e, t = xd) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Ws(i.ready, n());
    const s = Im(e);
    s.length && await Ws(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Ws(_m(), Math.min(n(), 50));
  } catch {
  }
}
function Cd(e, t) {
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
async function Om(e) {
  if (typeof document > "u") return null;
  const t = await Cd(e, Sd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = jt, r.height = jt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, jt, jt);
    const { data: i } = n.getImageData(0, 0, jt, jt);
    let s = 0, a = 0, c = 0;
    for (let p = 0; p < i.length; p += 4) {
      const o = i[p + 3] / 255, h = i[p] * o + 255 * (1 - o), u = i[p + 1] * o + 255 * (1 - o), d = i[p + 2] * o + 255 * (1 - o), m = 0.299 * h + 0.587 * u + 0.114 * d;
      a += m, c += m * m, s++;
    }
    if (!s) return null;
    const l = a / s;
    return c / s - l * l;
  } catch {
    return null;
  }
}
async function Hs(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Em) return !0;
  try {
    const i = await Om(e);
    if (i !== null && i <= Cm) return !0;
  } catch {
  }
  return !1;
}
async function Nm(e) {
  if (typeof document > "u") return null;
  const t = await Cd(e, Sd);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = jt, r.height = jt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, jt, jt);
    const { data: i } = n.getImageData(0, 0, jt, jt);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, p = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * p + 0.587 * o + 0.114 * h >= Rm && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function Pm(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Nm(e);
    if (r !== null && r >= Mm) return !0;
  } catch {
  }
  return !1;
}
const zm = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], $m = /* @__PURE__ */ new Set([
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
function Dm(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Fm(e) {
  const t = (e || "").toLowerCase();
  return zm.some((r) => t.includes(r));
}
const Um = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Bm(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Um.test(t);
}
function qm(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Dm(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Fm(r) || n && !$m.has(n) && t.includes("_") && Bm(t));
}
function jm(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    qm({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Wi = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Wm = 3e3, Hm = 4e3, sc = 24, oc = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Ym(e, t = Hm) {
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
function Vm(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < sc; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < sc; l++) {
        const p = c[l];
        if (!(p && (((n = p.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || p.type === 5))) continue;
        let h = "", u = "";
        try {
          h = (((i = p.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), u = ((s = p.style) == null ? void 0 : s.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !u || t.push({ cssText: p.cssText, family: h, src: u });
      }
  }
  return t;
}
function Gm(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Xm(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Gm(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Km(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Vm(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => Ym(c)), a = [];
  for (const c of n) {
    const l = [];
    oc.lastIndex = 0;
    let p;
    for (; (p = oc.exec(c.src)) !== null; ) {
      const d = p[2];
      d && !d.startsWith("data:") && l.push(d);
    }
    if (!l.length) {
      a.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let o = c.cssText, h = !1;
    const u = await Promise.all(l.map(async (d) => {
      let m = d;
      try {
        m = new URL(d, i).href;
      } catch {
      }
      return { rawUrl: d, dataUrl: await s(m) };
    }));
    for (const { rawUrl: d, dataUrl: m } of u)
      m && (o = Xm(o, d, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Jm() {
  try {
    return await Promise.race([
      Km({}).catch(() => Wi),
      new Promise((e) => setTimeout(() => e(Wi), Wm))
    ]);
  } catch {
    return Wi;
  }
}
function Zm(e, t) {
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
async function Qm(e, t = {}) {
  return (await eg(e, t)).dataUrl;
}
async function eg(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? Wi : await Jm(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Zm(mm(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (u) => jm(u, c.embeddedFamilies),
      maximumCanvasSize: bm,
      fetch: { placeholderImage: gm },
      filter: (u) => n && !n(u) || Am(u) ? !1 : Tm(u) ? (r++, !1) : !0
    }), ym);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await ic(e, xd);
  try {
    let o = await p(), h = await Hs(o);
    if (h) {
      await ic(e, xm);
      try {
        const d = await p();
        await Hs(d) || (o = d, h = !1);
      } catch {
      }
    }
    r && js(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && js("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const u = h ? !1 : await Pm(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: u, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    js(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const u = Lm(e, n, a), d = await Hs(u.dataUrl);
    return { ...u, quality: "wireframe", blank: d, partial: !1, skippedImages: 0 };
  }
}
const tg = {
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
function rg(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function K(e, t = {}) {
  const r = tg[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${rg(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const Md = "https://klavity.in", Sn = {
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
function Ys(e, t, r) {
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
        let o = 1, h = l.length, u = 1;
        for (; o <= h; ) {
          const d = o + h >> 1;
          e(l.slice(0, d)) <= n ? (u = d, o = d + 1) : h = d - 1;
        }
        i.push(l.slice(0, u)), l = l.slice(u);
      }
      a = l;
    }
    i.push(a);
  }
  return i.length ? i : [""];
}
function Ci(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function ng(e) {
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
function ig(e) {
  const t = ng(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function Vs(e) {
  return ig(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class ua {
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
    const s = Vs(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = Vs(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = Vs(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = Ys((o) => Ci(t, o), r.text, a), l = s * 1.25, p = r.outline ?? "none";
      c.forEach((o, h) => {
        const u = i + h * l;
        p !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, s * 0.18), t.strokeStyle = p === "white" ? "#ffffff" : "#111111", t.strokeText(o, n, u)), t.fillStyle = r.color, t.fillText(o, n, u);
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
        let u = 0, d = 0, m = 0, f = 0;
        const y = Math.min(o + c, a), E = Math.min(h + c, s);
        for (let v = o; v < y; v++)
          for (let k = h; k < E; k++) {
            const A = (v * s + k) * 4;
            u += p[A], d += p[A + 1], m += p[A + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(u / f)},${Math.round(d / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + o, E - h, y - o));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), a = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, Ys((h) => Ci(r, h), t.text, a).length));
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
    const c = Ys((u) => Ci(r, u), t.text, a);
    let l = 0;
    for (const u of c) l = Math.max(l, Ci(r, u));
    const p = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(p, c.length * p), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function sg(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function og(e, t, r, n) {
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
          const o = new ua(l, e);
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
async function ag(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: Md }, i = {
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
const lg = 50, cg = 2e3, ug = 1e3, dg = 500, ac = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Mi(e, t) {
  e.push(t), e.length > lg && e.shift();
}
function Ma(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Gs(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      ac.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => ac.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Ma(t, ug);
}
function pg(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Ma(JSON.stringify(e), dg);
  } catch {
    return String(e);
  }
}
function hg(e, t = {}) {
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
function fg(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, o) => {
    Mi(e.consoleErrors, { message: Ma(p, cg), stack: o, timestamp: Date.now(), level: l });
  }, s = window.onerror;
  if (window.onerror = (l, p, o, h, u) => {
    var d;
    if (n()) {
      const m = String(l);
      i("error", m, u == null ? void 0 : u.stack), (d = t.onError) == null || d.call(t, m, u == null ? void 0 : u.stack);
    }
    return typeof s == "function" ? s.call(window, l, p, o, h, u) : !1;
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
          n() && i(p, h.map(pg).join(" "));
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
    const p = Date.now(), o = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (u = l[1]) == null ? void 0 : u.method) || "GET";
    try {
      const d = await a(...l);
      return Mi(e.networkFailures, { url: Gs(o), status: d.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), d;
    } catch (d) {
      throw Mi(e.networkFailures, { url: Gs(o), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), d;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, p = c.prototype.send;
    c.prototype.open = function(o, h, ...u) {
      return this.__klav = { method: String(o || "GET").toUpperCase(), url: String(h || "") }, l.call(this, o, h, ...u);
    }, c.prototype.send = function(...o) {
      const h = this.__klav;
      if (h && n()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            Mi(e.networkFailures, {
              url: Gs(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: u,
              durationMs: Date.now() - u
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
const mg = ["light", "dark", "glass", "neon", "custom", "liquid"], gg = ["hidden", "icon", "full", "custom"], yg = ["lightbulb", "bug"], bg = ["full", "reportOnly", "off"], kg = /^#[0-9a-fA-F]{3,8}$/, vg = /^[\w \-,'"().]+$/, lc = (e) => typeof e == "object" && e !== null, Ri = (e) => typeof e == "string" && kg.test(e.trim()) ? e.trim() : void 0, Ti = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, wg = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && vg.test(t) ? t : void 0;
}, cc = {
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
function uc(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Rd(e) {
  const t = lc(e) ? e : {}, n = { theme: typeof t.theme == "string" && mg.includes(t.theme) ? t.theme : "light" }, i = Ri(t.primary), s = Ri(t.secondary), a = Ri(t.background), c = Ti(t.thankYou, 140), l = wg(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && gg.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Ti(t.launcherText, 60);
  p && (n.launcherText = p);
  const o = Ri(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && yg.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && bg.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Ti(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const u = lc(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || u.whiteLabel === !0) && (n.whiteLabel = !0);
  const d = Ti(t.projectId, 200);
  return d && (n.projectId = d), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function xg(e) {
  const t = Rd(e), r = t.theme === "custom" ? { ...cc.light } : { ...cc[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = uc(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && uc(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function Sg(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function Ai(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function dc(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = Sg(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const gt = class gt {
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
    this._recording || !gt.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), gt.SESSION_MS), this._begin());
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
      if (i && i in gt.TERMINAL_ERRORS) {
        this.onError(i, gt.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > gt.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? gt.BENIGN_RESTART_MS : Math.min(gt.MAX_BACKOFF_MS, gt.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
gt.MAX_CONSEC_FAILURES = 6, gt.BASE_BACKOFF_MS = 400, gt.MAX_BACKOFF_MS = 8e3, gt.BENIGN_RESTART_MS = 250, gt.SESSION_MS = 18e4, gt.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Qn = gt;
function Eg() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Cg = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Td(e) {
  for (const t of Cg)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const _n = class _n {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Eg(), ...t.deps || {} };
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
    this._stream = t, this._mime = Td(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), _n.MAX_SESSION_MS), this._beginSegment();
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
      }, _n.SEGMENT_MS);
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
_n.SEGMENT_MS = 2500, _n.MAX_SESSION_MS = 18e4;
let Ki = _n;
function Mg() {
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
const ot = class ot {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...Mg(), ...t.deps || {} };
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
    this._stream = t, this._mime = Td(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), ot.MAX_SESSION_MS), this._openSocket();
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
    }, ot.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= ot.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(ot.MAX_BACKOFF_MS, ot.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(ot.TIMESLICE_MS);
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
        this._recorder.start(ot.TIMESLICE_MS);
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
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, ot.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), ot.STOP_GRACE_MS);
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
ot.MAX_SESSION_MS = 18e4, ot.TIMESLICE_MS = 150, ot.CONNECT_TIMEOUT_MS = 4e3, ot.MAX_RECONNECTS = 3, ot.BASE_BACKOFF_MS = 500, ot.MAX_BACKOFF_MS = 4e3, ot.STOP_GRACE_MS = 2e3, ot.STOP_FLUSH_FALLBACK_MS = 1200;
let Ji = ot;
function Rg(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function nt(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const Tg = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Ag(e) {
  const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(i) {
      let s = i.parentElement;
      for (; s && s !== e; ) {
        if (Tg.has(s.tagName)) return NodeFilter.FILTER_REJECT;
        s = s.parentElement;
      }
      return /\d/.test(i.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), r = [];
  let n;
  for (; n = t.nextNode(); ) r.push(n);
  return r;
}
function Lg(e) {
  const t = [], r = window.innerWidth, n = window.innerHeight, i = (o) => !!(o.closest && o.closest("[data-klavity-ui], #klavity-widget-host")), s = (o, h) => {
    if (!h || typeof document.elementsFromPoint != "function") return !1;
    const u = Math.min(2, o.width / 4), d = Math.min(2, o.height / 4), m = [
      [o.left + o.width / 2, o.top + o.height / 2],
      [o.left + u, o.top + d],
      [o.left + o.width - u, o.top + d],
      [o.left + u, o.top + o.height - d],
      [o.left + o.width - u, o.top + o.height - d]
    ];
    for (const [f, y] of m) {
      if (f < 0 || y < 0 || f >= r || y >= n) return !1;
      let E = null;
      try {
        E = document.elementsFromPoint(f, y).find((v) => !i(v)) || null;
      } catch {
        return !1;
      }
      if (!E || E === h || h.contains(E) || E.contains(h)) return !1;
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
  for (const o of Ag(e)) {
    const h = l(o.parentElement), u = o.textContent ?? "", d = /\d+/g;
    let m;
    for (; m = d.exec(u); )
      try {
        const f = document.createRange();
        f.setStart(o, m.index), f.setEnd(o, m.index + m[0].length);
        const y = f.getClientRects ? f.getClientRects() : null;
        if (y) for (let E = 0; E < y.length; E++) a(y[E], h, o.parentElement);
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
function _g(e, t, r, n) {
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
  const u = 2 * s, d = [];
  for (const m of e.rects) {
    const f = l && m.fixed ? { x: m.x - e.sx, y: m.y - e.sy, w: m.w, h: m.h } : m, y = Math.max(0, (f.x - a) * s - u), E = Math.max(0, (f.y - c) * s - u), v = Math.min(t, (f.x - a + f.w) * s + u), k = Math.min(r, (f.y - c + f.h) * s + u);
    v > y && k > E && d.push({ x: y, y: E, w: v - y, h: k - E });
  }
  return d;
}
function Ig(e, t) {
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
const Ad = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Og = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, Ng = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Pg = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, zg = /* @__PURE__ */ new Set([
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
]), $g = { needs: "Needs detail", good: "Good", great: "Great" };
function Dg(e) {
  let t = e;
  for (const r of Ad) t = t.split(r).join(" ");
  return t;
}
function Fg(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || zg.has(n) || r++;
  return r;
}
function Ld(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Dg(r), i = Fg(n), s = t.length > 0 && Ad.some((u) => r.includes(u)) && i < 3, a = i >= 3 && t.length >= 12, c = Pg.test(r), l = Og.test(r) || Ng.test(t), p = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: p, level: h, label: $g[h], vague: s };
}
function Ug(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Ld(t).level !== "great";
}
const Bg = [
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
function qg(e) {
  const t = (e || "").toLowerCase();
  return t ? Bg.some((r) => t.includes(r)) : !1;
}
function _d(e) {
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
function Id(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", _d(t.source)],
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
async function jg() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function Wg() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let Hg = 0;
function Yg(e) {
  const t = e.host || Wg(), r = "kl-shp-" + ++Hg, n = document.createElement("div");
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
  const u = document.createElement("div");
  u.className = "kl-shp-prev";
  const d = document.createElement("div");
  d.className = "kl-shp-shot";
  const m = document.createElement("div");
  m.className = "kl-shp-cap";
  const f = document.createElement("span");
  f.className = "kl-shp-fav", f.textContent = (t[0] || "K").toUpperCase();
  const y = document.createElement("span");
  y.className = "kl-shp-rt", y.textContent = "This tab", m.append(f, y), u.append(d, m);
  const E = document.createElement("div");
  E.className = "kl-shp-foot";
  const v = document.createElement("span");
  v.className = "kl-shp-cancel", v.textContent = "Cancel", v.style.cursor = "pointer", v.addEventListener("click", (R) => {
    var O;
    R.stopPropagation(), n.classList.remove("kl-show");
    try {
      (O = e.onCancel) == null || O.call(e);
    } catch {
    }
  });
  const k = document.createElement("span");
  k.className = "kl-shp-allow", k.textContent = "Allow", E.append(v, k), l.append(p, u, E);
  const A = document.createElement("div");
  A.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const x = document.createElement("span");
  return x.textContent = e.steer, A.append(S, x), n.append(i, s, l, A), n;
}
const Vg = 100 * 1024 * 1024, Gg = 8 * 1024 * 1024, Xg = 110 * 1024 * 1024, pc = 5 * 1024 * 1024 * 1024, Kg = /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i;
function Jg(e) {
  return /^video\//i.test(e.type || "") ? !0 : (!e.type || e.type === "application/octet-stream") && Kg.test(e.name || "");
}
function Od(e) {
  return e.size > (Jg(e) ? Vg : Gg);
}
function Zg(e) {
  const t = [], r = [];
  for (const i of e || []) (Od(i) ? r : t).push(i);
  let n = t.reduce((i, s) => i + s.size, 0);
  for (; n > Xg && t.length; ) {
    let i = 0;
    for (let a = 1; a < t.length; a++) t[a].size > t[i].size && (i = a);
    const [s] = t.splice(i, 1);
    n -= s.size, r.push(s);
  }
  return { inline: t, large: r };
}
function Qg(e, t = {}, r = fetch) {
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
class Zn extends Error {
  constructor(t, r) {
    super(t), this.name = "LargeUploadError", this.retryable = r;
  }
}
function Xs(e) {
  try {
    return JSON.parse(e.trim() || "{}");
  } catch {
    return {};
  }
}
const ey = (e) => new Promise((t) => setTimeout(t, e)), Li = [1e3, 2e3, 4e3, 8e3, 15e3, 3e4];
async function ty(e) {
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
  throw new Zn(`"${e.name}" has no data to upload.`, !1);
}
async function ry(e, t, r = {}) {
  var m;
  const n = r.sleep ?? ey, i = await ty(t), s = i.size, a = t.type || i.type || "application/octet-stream", c = async (f, y = [200]) => {
    let E = "";
    for (let v = 0; ; v++) {
      let k = null;
      try {
        k = await e(f);
      } catch (A) {
        E = String((A == null ? void 0 : A.message) || A);
      }
      if (k) {
        if (y.includes(k.status)) return k;
        const A = Xs(k.text).error;
        if (!(k.status === 0 || k.status === 429 || k.status >= 500)) throw new Zn(A || `Upload of "${t.name}" failed (${k.status}).`, k.status === 410);
        E = A || `HTTP ${k.status}`;
      }
      if (v >= Li.length) throw new Zn(`Couldn't upload "${t.name}" — check your connection and try again. (${E})`, !0);
      await n(Li[v]);
    }
  }, l = Xs((await c({ path: "/api/uploads/start", json: { project_id: r.projectId || "", filename: t.name, content_type: a, size: s } })).text), p = String(l.token || ""), o = Number(l.chunk_bytes), h = Number(l.chunks);
  if (!p || !(o > 0) || !(h > 0)) throw new Zn(`Upload of "${t.name}" could not start.`, !0);
  let u = 0;
  const d = async (f) => {
    const y = new Uint8Array(await i.slice(f * o, Math.min(s, (f + 1) * o)).arrayBuffer());
    return await c({ path: "/api/uploads/chunk", query: { token: p, n: String(f) }, bytes: y }), y.byteLength;
  };
  for (let f = 0; f < h; f++) {
    u += await d(f);
    try {
      (m = r.onProgress) == null || m.call(r, u, s);
    } catch {
    }
  }
  for (let f = 0; f < 4; f++) {
    const y = await c({ path: "/api/uploads/complete", json: { token: p } }, [200, 409]), E = Xs(y.text);
    if (y.status === 200 && typeof E.ref == "string" && E.ref) return E.ref;
    if (y.status === 409 && Array.isArray(E.missing) && E.missing.length) {
      for (const v of E.missing) Number.isInteger(v) && v >= 0 && v < h && await d(v);
      continue;
    }
    await n(Li[Math.min(f, Li.length - 1)]);
  }
  throw new Zn(`Couldn't finish uploading "${t.name}". Please try again.`, !0);
}
async function ny(e, t, r = {}) {
  const { inline: n, large: i } = Zg(e);
  if (!i.length) return { inline: e ? e.slice() : [], refs: [] };
  const s = i.reduce((l, p) => l + p.size, 0);
  let a = 0;
  const c = [];
  for (const l of i)
    c.push(await ry(t, l, { ...r, onProgress: (p) => {
      var o;
      return (o = r.onProgress) == null ? void 0 : o.call(r, a + p, s);
    } })), a += l.size;
  return { inline: n, refs: c };
}
const iy = 1, sy = 6, oy = 1.08;
function ay(e, t = iy, r = sy) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function ly(e, t = oy) {
  return e < 0 ? t : 1 / t;
}
function cy(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Nd(e, t) {
  return t > 0 ? e.width / t : 1;
}
function uy(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function dy(e, t, r, n, i, s) {
  const a = Nd(t, i) * n, c = (d) => Math.min(i, Math.max(0, d)), l = (d) => Math.min(s, Math.max(0, d)), p = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, u = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: p, y: h, w: Math.max(0, o - p), h: Math.max(0, u - h) };
}
function py(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function hy(e, t, r, n, i, s) {
  const a = Nd(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function fy(e) {
  return Id("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || _d()
  });
}
function my(e) {
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
function gy(e, t, r) {
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
function hc(e) {
  let t = Te(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function fc(e) {
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
const da = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function yy(e) {
  var t;
  return ((t = da.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function by(e) {
  const t = (a) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(a) || /^\s*()(\d+)\s*$/.exec(a);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, s = n ? t(n) : null;
  return { startSec: i, endSec: i != null && s != null && s <= i ? null : s };
}
function ky(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function Pd(e, t, r = 960, n = 6e3) {
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
        const h = Math.min(1, r / p), u = document.createElement("canvas");
        u.width = Math.round(p * h), u.height = Math.round(o * h);
        const d = u.getContext("2d");
        if (!d) return c(null);
        d.drawImage(a, 0, 0, u.width, u.height), c(u.toDataURL("image/jpeg", 0.82));
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
const vy = 8;
function wy(e, t = vy) {
  const r = Number(e);
  if (!isFinite(r) || r <= 0) return [];
  const n = Math.max(2, Math.min(t, Math.ceil(r / 10)));
  return Array.from({ length: n }, (i, s) => Math.round((s + 0.5) * r / n * 10) / 10);
}
async function xy(e, t) {
  const r = [];
  for (const n of wy(t)) {
    const i = await Pd(e, n, 768, 4e3);
    if (!i) break;
    r.push({ atSec: n, dataUrl: i });
  }
  return r;
}
function mc(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : zd({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function pa(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function gc(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = pa(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${s ? ` Related: ${s}.` : ""}`;
}
function zd(e) {
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
function Sy(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const Ey = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function Cy(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return Ey.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Ks(e, t) {
  return Cy(t) || Sy(e);
}
function Js(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Gt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function yc(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function My(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Ry = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function ha(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Ty(e) {
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
const Ay = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", Ly = 100, _y = Ly * 1024 * 1024;
function Iy(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function Vr(e) {
  return ha(e) ? "video" : Iy(e) ? "image" : "file";
}
function Oy(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function _i(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Ny(e, t, r = {}) {
  var zl, $l, Dl, Fl, Ul;
  const n = Rd(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, p = [], o = [], h = [], u = null, d = [], m = !1, f = !1, y = !1, E = !1;
  const v = !!t.onMinimize, k = v ? 8 : 5, A = 3e4, S = 10 * 1024 * 1024, x = !!t.allowFileAttachments, R = 5, O = !!t.largeFileUploads && !(t.maxFileBytes && t.maxFileBytes > 0), $ = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : O ? pc : _y, P = t.reporterRole ?? "anon", ee = t.upgradeUrl, Y = O ? pc * R : Math.max(120 * 1024 * 1024, $ + 20 * 1024 * 1024);
  let _ = Array.isArray(t.initialFiles) ? t.initialFiles.filter(Boolean) : [], Oe = _.slice();
  const je = /* @__PURE__ */ new WeakMap(), fe = () => typeof URL < "u" && typeof URL.createObjectURL == "function", he = (g) => je.get(g) || g.dataUrl, Ae = (g) => {
    const b = je.get(g);
    if (b) {
      try {
        URL.revokeObjectURL(b);
      } catch {
      }
      je.delete(g);
    }
  };
  for (const g of _)
    if (g.blob && fe())
      try {
        je.set(g, URL.createObjectURL(g.blob));
      } catch {
      }
  let ze = null;
  const Le = !!(t.allowRecording && t.onRecord), ve = Le && !!t.onSplitRecording, Ze = Rg({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Ki.isSupported(),
    webSpeechSupported: Qn.isSupported()
  }), U = Ze !== "none", X = 2;
  let W = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], Be = W.map((g) => g.id || g.dataUrl).join("|");
  const ue = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, re = {}, tt = /* @__PURE__ */ new Map(), ht = /* @__PURE__ */ new Map(), oe = /* @__PURE__ */ new Map(), Ne = /* @__PURE__ */ new Map();
  let we = 0, de = null;
  const Ke = () => {
    const g = Object.keys(re);
    if (!g.length && !de) return null;
    const b = {};
    if (g.length) {
      const w = {};
      for (const C of g) w[C] = re[C];
      const M = re[0] ?? re[Number(g[0])] ?? {};
      Object.assign(b, M, { byIndex: w });
    }
    return de && (b.selector = de.selector, b.selectorText = de.text), b;
  };
  let ge = e, Pe = 0, We = null, Se = null, Lt = null, Fn = t.replayState === "attached", tr = null, $r = null, He = "idle", it = null, ye = null, $t = null, _t = !1, dr = "", Ct = 0, $e = null, ae = !1, Me = "", De = null, st = null, Je = null, Mt = null, Ye = !1;
  const cn = [];
  function un(g) {
    if (typeof window > "u") return;
    const b = () => {
      Ye || g();
    };
    window.addEventListener("beforeunload", b), window.addEventListener("pagehide", b), cn.push(() => {
      window.removeEventListener("beforeunload", b), window.removeEventListener("pagehide", b);
    });
  }
  const Un = 4e3, Qp = 5e3, ct = {}, It = {}, Bn = (g) => g ? JSON.parse(JSON.stringify(g)) : null, dn = (g) => {
    var b;
    try {
      (b = t.onAnnotationsChanged) == null || b.call(t, g, Bn(re[g]));
    } catch {
    }
  }, eh = () => {
    const g = {};
    for (const b of Object.keys(re)) {
      const w = re[b];
      w && (g[Number(b)] = Bn(w));
    }
    return g;
  }, el = (g) => ({
    url: c[g],
    compressed: p[g],
    ann: Bn(re[g])
  }), pn = (g) => {
    (ct[g] ?? (ct[g] = [])).push(el(g));
  }, tl = (g, b) => {
    const w = i ? Ne.get(b.url) : oe.get(b.url);
    w ? (c[g] = w, p[g] = t.compressImage ? t.compressImage(w) : Promise.resolve(w)) : (c[g] = b.url, p[g] = b.compressed), b.ann ? re[g] = Bn(b.ann) : delete re[g];
  }, rl = (g) => {
    const b = ct[g];
    if (!b || !b.length) return !1;
    const w = b.pop(), M = It[g];
    for (; M && M.length && M[M.length - 1].mark >= b.length; ) M.pop();
    return tl(g, w), dn(g), Re(), !0;
  }, th = (g) => {
    const b = It[g];
    if (!b || !b.length) return !1;
    const { snap: w, mark: M } = b.pop();
    return ct[g] && (ct[g].length = Math.min(ct[g].length, M)), tl(g, w), dn(g), Re(), !0;
  }, nl = document.createElement("style");
  nl.textContent = `
    ${xg(n)}
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
  `, a.appendChild(nl);
  const Dr = document.createElement("div");
  Dr.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${v ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${K("x", { size: 16 })}</button>
    <div class="kl-side-head" id="klavity-side-head" aria-hidden="true">New report</div>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${K("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${ue ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${ue.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Te(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Te(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Te(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${K("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${K("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      ${ve ? `<div class="kl-multi" id="klavity-multi">
        <div class="kl-multi-head"><span class="kl-multi-ic">${K("monitor", { size: 18 })}</span><span class="kl-multi-name">Report Multiple Issues</span><span class="kl-multi-badge">${K("sparkles", { size: 10 })} AI Powered</span></div>
        <p class="kl-multi-copy">Record your screen with voice narration. AI will analyse it, identify multiple issues and create separate tickets for you.</p>
        <button type="button" class="kl-multi-start" id="klavity-multi-start"></button>
        <p class="kl-multi-status" id="klavity-multi-status" role="status" aria-live="polite" hidden></p>
      </div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${K("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${K("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${K(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${Le ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${K("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${K("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${K("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? Ay : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${$ >= 1024 * 1024 * 1024 ? Math.round($ / 1024 / 1024 / 1024) + "GB" : Math.round($ / 1024 / 1024) + "MB"} each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${k} images</div>
        ${U ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${K("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${x ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${K("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${K("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${K("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${K("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
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
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${K("check", { size: 13 })}</span>
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
          <input type="checkbox" id="klavity-conlog-cb" checked>${K("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, Dr.appendChild(le), a.appendChild(Dr);
  const _e = a.getElementById("klavity-sharp"), il = a.querySelector(".klavity-info-pop");
  if (_e && il) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = il.innerHTML, a.appendChild(g);
    const b = Yg({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    b.style.position = "fixed", a.appendChild(b);
    let w = !1;
    jg().then((L) => {
      w = L;
    }).catch(() => {
    });
    const M = (L, N) => {
      const I = _e.getBoundingClientRect(), F = Math.min(N, window.innerWidth - 16), D = 8, B = window.innerWidth, V = window.innerHeight;
      L.style.left = Math.max(D, Math.min(I.left + I.width / 2 - F / 2, B - F - D)) + "px", L.style.top = "-9999px", L.style.visibility = "hidden", L.style.display = "block";
      const q = L.offsetHeight;
      L.style.display = "";
      let H = I.bottom + 8;
      H + q + D > V && (H = I.top - q - 8), L.style.top = Math.max(D, Math.min(H, V - q - D)) + "px", L.style.visibility = "";
    }, C = () => {
      !t.snapWithoutSharePrompt && !E && !w ? (g.classList.remove("kl-show"), M(b, 288), b.classList.add("kl-show")) : (b.classList.remove("kl-show"), M(g, 228), g.classList.add("kl-show"));
    }, T = () => {
      g.classList.remove("kl-show"), b.classList.remove("kl-show");
    };
    _e.addEventListener("mouseenter", C), _e.addEventListener("mouseleave", T), _e.addEventListener("focus", C), _e.addEventListener("blur", T);
  }
  let sl = !1, hn = null;
  function Ss() {
    try {
      hn == null || hn.remove();
    } catch {
    }
    hn = null;
    try {
      _e == null || _e.classList.remove("kl-pulse");
    } catch {
    }
  }
  function rh() {
    var T;
    if (sl || !_e || Ye) return;
    sl = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${K("x", { size: 13 })}</button></div>`, a.appendChild(g), hn = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const b = 8, w = Math.min(228, window.innerWidth - 16);
    let M = 0;
    const C = () => {
      if (!hn || Ye) return;
      const L = _e.getBoundingClientRect();
      if ((L.width === 0 || L.height === 0) && M++ < 20) {
        requestAnimationFrame(C);
        return;
      }
      const N = window.innerWidth, I = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const F = g.offsetHeight;
      g.style.left = Math.max(b, Math.min(L.right - w, N - w - b)) + "px";
      let D = L.bottom + 8;
      D + F + b > I && (D = L.top - F - 8), g.style.top = Math.max(b, Math.min(D, I - F - b)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(C), (T = g.querySelector(".kl-nudge-x")) == null || T.addEventListener("click", Ss);
    try {
      _e.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Ss(), 9e3);
    } catch {
    }
    _e.addEventListener("click", Ss, { once: !0 });
  }
  function nh(g) {
    Fn = g === "attached", ut();
  }
  const ol = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, b, w, M, C, T) => Dt(g, b, w, !1, !!M, C, T),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, b, w, M, C) => Dt(g, b, w, !0, !!M, C),
    close: pr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: eh,
    setReplayState: nh,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (ze = _i(g), !Ye)
        try {
          Re(), mi();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || Ye) return;
      const b = W.findIndex((w) => w.id && g.id && w.id === g.id || w.dataUrl && g.dataUrl && w.dataUrl === g.dataUrl);
      b >= 0 ? (W[b] = g, Se = b) : (W.push(g), Se = W.length - 1), We = null, fn();
    }
  };
  function Re() {
    const g = a.getElementById("klavity-strip"), b = a.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((w, M) => {
      const C = document.createElement("div");
      C.className = "klavity-thumb", M === Pe && C.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = w, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && C.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        Pe = M, We = null, Se = null, Re();
      });
      const L = document.createElement("button");
      L.className = "klavity-rm", L.innerHTML = K("x", { size: 13 }), L.title = "Remove", L.addEventListener("click", (D) => {
        D.stopPropagation(), al(M), Re();
      });
      const N = document.createElement("button");
      N.className = "klavity-mk", N.innerHTML = K("pencil", { size: 13 }), N.title = "Mark up", N.addEventListener("click", (D) => {
        D.stopPropagation(), $h(M);
      });
      const I = document.createElement("div");
      I.className = "klavity-thumb-media", I.append(T, L, N), C.append(I);
      const F = o[M];
      if (F) {
        const D = Ry[F], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + F, B.title = F === "real-pixel" ? "Pixel-perfect capture (every image included)" : F === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', B.innerHTML = K(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Te(D.label) + "</span>", I.appendChild(B), D.degraded && t.onRetakeSharp) {
          const V = document.createElement("button");
          V.type = "button", V.className = "klavity-retake", V.innerHTML = K("zap", { size: 11 }) + "<span>Retake sharp</span>", V.title = "Recapture this shot at full pixel quality", V.addEventListener("click", (q) => {
            q.stopPropagation(), oh(M, V);
          }), C.appendChild(V);
        }
      }
      if (pl.has(M)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", C.appendChild(D);
      }
      g.appendChild(C);
    }), _.forEach((w, M) => {
      if (Vr(w) !== "video") return;
      const C = document.createElement("div");
      C.className = "klavity-thumb kl-video-thumb", We === M && C.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = he(w), T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const L = document.createElement("span");
      L.className = "kl-video-play", L.setAttribute("aria-hidden", "true"), L.innerHTML = K("play", { size: 16 });
      const N = document.createElement("span");
      N.className = "kl-video-badge", N.innerHTML = K("play", { size: 9 }) + "<span>Video</span>", C.title = "Click to play " + w.name, C.addEventListener("click", () => {
        We = M, Se = null, Re();
      });
      const I = document.createElement("button");
      I.className = "klavity-rm", I.innerHTML = K("x", { size: 13 }), I.title = "Remove", I.addEventListener("click", (D) => {
        D.stopPropagation(), fl(M);
      }), C.append(T, L, N, I);
      const F = _i(ze);
      if (F != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = F + "%", D.appendChild(B), C.appendChild(D);
      }
      g.appendChild(C);
    }), W.forEach((w, M) => {
      const C = document.createElement("div");
      C.className = "klavity-thumb kl-video-thumb kl-rec-tile", Se === M && C.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      let L = w.dataUrl;
      w.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (L = w._previewUrl || (w._previewUrl = URL.createObjectURL(w.blob))), T.src = L, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const N = document.createElement("span");
      N.className = "kl-video-play", N.setAttribute("aria-hidden", "true"), N.innerHTML = K("play", { size: 16 });
      const I = Math.round(w.durationMs / 1e3), F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = K("play", { size: 9 }) + `<span>${Math.floor(I / 60)}:${String(I % 60).padStart(2, "0")}${w.screenOnly ? " · screen" : ""}</span>`, C.title = "Click to play your recording", C.addEventListener("click", () => {
        Se = M, We = null, Re();
      });
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-rerec", D.innerHTML = K("refresh-cw", { size: 12 }), D.title = "Re-record", D.setAttribute("aria-label", "Re-record"), D.addEventListener("click", (q) => {
        var J;
        q.stopPropagation();
        const H = W.splice(M, 1)[0];
        if (H && H._previewUrl)
          try {
            URL.revokeObjectURL(H._previewUrl);
          } catch {
          }
        Se === M ? Se = null : Se != null && Se > M && (Se -= 1), fn();
        try {
          (J = a.getElementById("klavity-record")) == null || J.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = K("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (q) => {
        q.stopPropagation();
        const H = W.splice(M, 1)[0];
        if (H && H._previewUrl)
          try {
            URL.revokeObjectURL(H._previewUrl);
          } catch {
          }
        Se === M ? Se = null : Se != null && Se > M && (Se -= 1), fn();
      }), C.append(T, N, F, D, B);
      const V = _i(ze);
      if (V != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const H = document.createElement("i");
        H.style.width = V + "%", q.appendChild(H), C.appendChild(q);
      }
      g.appendChild(C);
    });
    try {
      const w = g.children[Pe];
      w && typeof w.scrollIntoView == "function" && w.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const w = document.createElement("div");
      w.className = "kl-thumb-skel kl-loading", w.setAttribute("role", "status"), w.setAttribute("aria-label", "Capturing screenshot"), w.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(w);
    }
    b.textContent = `${c.length}/${k} images`, b instanceof HTMLElement && (b.hidden = c.length === 0), ut(), fi(), Nl();
  }
  function fi() {
    const g = a.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && Pe >= 0 && Pe < c.length && !!h[Pe] && !m && !!t.onCaptureSharp && !Ft) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = K("triangle-alert", { size: 15 });
        const C = document.createElement("span");
        C.className = "kl-sh-txt", C.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          m = !0, fi(), _e == null || _e.click();
        });
        const L = document.createElement("button");
        L.type = "button", L.className = "kl-sh-x", L.setAttribute("aria-label", "Dismiss"), L.title = "Dismiss", L.innerHTML = K("x", { size: 12 }), L.addEventListener("click", () => {
          m = !0, fi();
        }), g.append(M, C, T, L);
      }
      g.hidden = !1, _e == null || _e.classList.add("kl-suggest");
    } else
      g.hidden = !0, _e == null || _e.classList.remove("kl-suggest");
  }
  function Es() {
    f = !0, l = !1, Re();
  }
  function ih() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Ht(g) {
    const b = a.getElementById("klavity-err");
    b && (b.textContent = g, b.style.display = "block");
  }
  function Cs() {
    const g = a.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function al(g) {
    var b;
    if (!(g < 0 || g >= c.length)) {
      c.splice(g, 1), p.splice(g, 1), o.splice(g, 1), h.splice(g, 1), d.splice(g, 1), delete re[g];
      for (const w of Object.keys(re).map(Number).filter((M) => M > g).sort((M, C) => M - C))
        re[w - 1] = re[w], delete re[w];
      try {
        (b = t.onShotRemoved) == null || b.call(t, g);
      } catch {
      }
      delete ct[g], delete It[g];
      for (const w of Object.keys(ct).map(Number).filter((M) => M > g).sort((M, C) => M - C))
        ct[w - 1] = ct[w], delete ct[w];
      for (const w of Object.keys(It).map(Number).filter((M) => M > g).sort((M, C) => M - C))
        It[w - 1] = It[w], delete It[w];
      c.length === 0 && nr(null);
    }
  }
  function Dt(g, b, w, M = !0, C = !1, T, L) {
    var I;
    if (c.length >= k) {
      Ht(`You can attach up to ${k} images.`);
      return;
    }
    Cs(), y = !1, f = !1, c.push(g);
    const N = c.length - 1;
    if (L && Array.isArray(L.shapes) && L.shapes.length && (re[N] = Bn(L)), p.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), o.push(b), h.push(C && b !== "real-pixel"), d.push(T), M && (Pe = c.length - 1, We = null, Se = null), Re(), M)
      try {
        (I = t.onShotAdded) == null || I.call(t, g, b);
      } catch {
      }
  }
  function Fr() {
    return { restore: null, geo: null };
  }
  function Ur(g, b, w) {
    if (g) {
      try {
        const M = Lg(document.body);
        M.rects.length && tt.set(g, { geo: M, capture: w });
      } catch {
      }
      i && sh();
    }
  }
  let Ms = Promise.resolve(), qn = 0;
  function ll(g) {
    qn++, Ms = g.then(() => {
      qn--;
    }, () => {
      qn--;
    });
  }
  function sh() {
    ll(new Promise((g) => setTimeout(() => {
      dl().then(g, g);
    }, 0)));
  }
  function cl(g, b, w) {
    const M = ht.get(g);
    if (M) return M;
    const C = tt.get(g);
    if (!C) return null;
    const T = _g(C.geo, b, w, C.capture);
    return T && ht.set(g, T), T;
  }
  function ul(g, b) {
    var w;
    c[g] = b, p[g] = t.compressImage ? t.compressImage(b) : Promise.resolve(b), Re();
    try {
      (w = t.onShotReplaced) == null || w.call(t, g, b, o[g]);
    } catch {
    }
  }
  async function dl() {
    const g = ++we;
    for (let b = 0; b < c.length; b++) {
      const w = c[b];
      if (!w) continue;
      if (!i) {
        const T = oe.get(w);
        T && ul(b, T);
        continue;
      }
      if (oe.has(w)) continue;
      let M = Ne.get(w);
      if (!M) {
        const T = await Ig(w, (L, N) => cl(w, L, N));
        if (!T) continue;
        M = T.url, Ne.set(w, M), oe.set(M, w), ht.set(M, T.rects);
      }
      if (g !== we) return;
      const C = c.indexOf(w);
      C >= 0 && ul(C, M);
    }
  }
  const pl = /* @__PURE__ */ new Set();
  async function oh(g, b) {
    if (!(Ft || !t.onRetakeSharp)) {
      pt(!0), b.classList.add("kl-loading"), s.style.display = "none";
      try {
        const { restore: w, geo: M } = Fr();
        let C;
        try {
          C = await t.onRetakeSharp(d[g]);
        } finally {
          w == null || w();
        }
        if (C) {
          const { dataUrl: T, quality: L } = Gt(C);
          Ur(T, M, d[g]), T && (c[g] = T, p[g] = t.compressImage ? t.compressImage(T) : Promise.resolve(T), o[g] = L ?? "real-pixel", h[g] = !1, re[g] && (delete re[g], pl.add(g), dn(g)), delete ct[g], delete It[g]);
        }
      } catch {
      } finally {
        s.style.display = "", pt(!1), Re();
      }
    }
  }
  function hl(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function Rs(g) {
    Cs();
    for (const b of g) {
      if (c.length >= k) {
        Ht(`You can attach up to ${k} images.`);
        break;
      }
      if (!hl(b)) {
        Ht(`"${b.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (b.size > S) {
        Ht(`"${b.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        Dt(await bc(b));
      } catch {
        Ht(`Couldn't add "${b.name}". Please try a different image.`);
      }
    }
  }
  function mi() {
    const g = a.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const b = _.filter((w) => Vr(w) === "file");
    g.hidden = b.length === 0, _.forEach((w, M) => {
      if (Vr(w) !== "file") return;
      const C = document.createElement("div");
      C.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = K("file-text", { size: 14 });
      const L = document.createElement("span");
      L.className = "kl-file-nm", L.textContent = w.name, L.title = w.name;
      const N = document.createElement("span");
      N.className = "kl-file-sz", N.textContent = w.size < 1024 ? `${w.size} B` : w.size < 1024 * 1024 ? `${Math.round(w.size / 1024)} KB` : `${(w.size / 1024 / 1024).toFixed(1)} MB`;
      const I = document.createElement("button");
      I.type = "button", I.className = "kl-file-rm", I.setAttribute("aria-label", `Remove ${w.name}`), I.title = "Remove", I.innerHTML = K("x", { size: 11 }), I.addEventListener("click", () => {
        fl(M);
      }), C.append(T, L, N, I);
      const F = _i(ze);
      if (F != null) {
        const D = document.createElement("div");
        D.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = F + "%", D.appendChild(B), C.appendChild(D);
      }
      g.appendChild(C);
    }), ut(), ah();
  }
  function ah() {
    var g;
    if (!Ye && !(Oe.length === _.length && Oe.every((b, w) => b === _[w]))) {
      Oe = _.slice();
      try {
        (g = t.onFilesChange) == null || g.call(t, _.slice());
      } catch {
      }
    }
  }
  function fl(g) {
    const b = _[g] && Vr(_[g]) === "video";
    _[g] && Ae(_[g]), _.splice(g, 1), We != null && (b && We === g ? We = null : We > g && (We -= 1)), mi(), Re();
  }
  function lh(g, b) {
    if (g.kind === "upgrade") {
      if (!g.url) return null;
      const M = document.createElement("a");
      return M.className = "kl-capmsg-cta", M.href = g.url, M.target = "_blank", M.rel = "noopener noreferrer", M.textContent = g.label, M;
    }
    if (!t.onRequestUpgrade) return null;
    const w = document.createElement("button");
    return w.type = "button", w.className = "kl-capmsg-cta kl-capmsg-req", w.textContent = g.label, w.addEventListener("click", async () => {
      if (w.disabled) return;
      const M = w.textContent || g.label;
      w.disabled = !0, w.textContent = "Requesting…";
      let C = !1;
      try {
        C = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: b });
      } catch {
        C = !1;
      }
      if (C) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${K("check")}</span>Request sent to your team`, w.replaceWith(T);
      } else
        w.disabled = !1, w.textContent = M;
    }), w;
  }
  function ch(g, b) {
    const w = a.getElementById("klavity-capmsg");
    if (!w || !g.overCap) return;
    w.innerHTML = "";
    const M = document.createElement("span");
    if (M.className = "kl-capmsg-t", M.textContent = g.message || "", w.appendChild(M), g.cta) {
      const C = lh(g.cta, b);
      if (C && w.appendChild(C), g.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = g.cta.hint, w.appendChild(T);
      }
    }
    w.hidden = !1;
  }
  function uh() {
    const g = a.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function dh(g) {
    Cs(), uh();
    for (const b of g) {
      if (hl(b)) {
        await Rs([b]);
        continue;
      }
      if (_.length >= R) {
        Ht(`You can attach up to ${R} files.`);
        break;
      }
      const w = Oy(b, { capBytes: $, role: P, upgradeUrl: ee });
      if (w.overCap) {
        ch(w, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: b.name, sizeMb: Math.round(b.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (_.reduce((C, T) => C + T.size, 0) + b.size > Y) {
        Ht(`Attachments exceed the ${Math.round(Y / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const C = b.type || (ha(b) ? Ty(b.name) : ""), T = ha(b) && fe() || O && Od(b), L = T ? { name: b.name, type: C, size: b.size, dataUrl: "", blob: b } : { name: b.name, type: C, size: b.size, dataUrl: await bc(b) };
        if (T)
          try {
            je.set(L, URL.createObjectURL(b));
          } catch {
          }
        const N = _.push(L) - 1;
        mi(), Vr(_[N]) === "video" && (We = N), Re();
      } catch {
        Ht(`Couldn't add "${b.name}". Please try a different file.`);
      }
    }
  }
  function fn() {
    Ye || (Re(), ut(), yh(), ph());
  }
  function ph() {
    var b;
    const g = W.map((w) => w.id || w.dataUrl).join("|");
    if (g !== Be) {
      Be = g;
      try {
        (b = t.onRecordingsChange) == null || b.call(t, W.slice());
      } catch {
      }
    }
  }
  function rr() {
    var M;
    const g = a.getElementById("klavity-multi-start"), b = a.getElementById("klavity-multi-status");
    if (!g || !b) return;
    const w = He === "recording" ? "Stop &amp; analyse recording" : He === "processing" ? "AI is analysing…" : He === "done" ? "Record another walkthrough" : "Start Recording";
    if (g.innerHTML = `${He === "processing" ? '<span class="kl-enh-loader"></span>' : K("monitor", { size: 15 })}<span>${w}</span>`, g.disabled = He === "processing" || He === "recording", b.classList.toggle("kl-rec", He === "recording"), b.classList.toggle("kl-ok", He === "done"), He === "recording")
      b.hidden = !1, b.textContent = "Recording screen and microphone…";
    else if (He === "done" && ye) {
      const C = ye.length;
      b.hidden = !1, b.innerHTML = `${C} issue${C === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (M = b.querySelector("#klavity-multi-reopen")) == null || M.addEventListener("click", () => gl());
    } else dr ? (b.hidden = !1, b.textContent = dr) : (b.hidden = !0, b.textContent = "");
  }
  async function hh() {
    if (Ft || He === "processing" || He === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(it && W.includes(it)) && W.length >= X) {
      Ht(`You can attach up to ${X} recordings.`);
      return;
    }
    const b = ++Ct;
    dr = "", pt(!0);
    const w = (C) => {
      s.style.display = C === "recording" ? "none" : "", C === "recording" && b === Ct && (He = "recording", rr());
    };
    let M = null;
    try {
      M = await t.onRecord(w, { purpose: "multi" });
    } catch {
      M = null;
    } finally {
      s.style.display = "", pt(!1);
    }
    if (!(b !== Ct || Ye)) {
      if (!M) {
        He = ye ? "done" : "idle", rr();
        return;
      }
      await ml(M, b);
    }
  }
  function fh(g) {
    const b = W.find((M) => M.id === g);
    if (!b || !t.onSplitRecording || He !== "idle") return;
    const w = ++Ct;
    He = "processing", Promise.resolve().then(() => {
      if (w === Ct && !Ye) return ml(b, w);
    });
  }
  async function ml(g, b) {
    var L, N;
    dr = "";
    for (let I = c.length - 1; I >= 0; I--)
      (N = (L = re[I]) == null ? void 0 : L.shapes) != null && N.length || al(I);
    const w = W.indexOf(g), M = w >= 0 ? w : it ? W.indexOf(it) : -1;
    M >= 0 ? W[M] = g : W.push(g), Se = M >= 0 ? M : W.length - 1, We = null, it = g, ye = null, $t = null, jn(), He = "processing", fn(), rr();
    let C = null;
    try {
      const I = g.blob || await (await fetch(g.dataUrl)).blob();
      let F = [], D = null;
      try {
        if (g.blob)
          try {
            D = URL.createObjectURL(g.blob);
          } catch {
            D = null;
          }
        F = await xy(D || g.dataUrl, (g.durationMs || 0) / 1e3);
      } catch {
        F = [];
      } finally {
        if (D)
          try {
            URL.revokeObjectURL(D);
          } catch {
          }
      }
      if (b !== Ct || Ye) return;
      C = await t.onSplitRecording(I, { text: Z.value.trim(), ...F.length ? { frames: F } : {} });
    } catch {
      C = null;
    }
    if (b !== Ct || Ye) return;
    const T = (C || []).filter((I) => I && (String(I.title || "").trim() || String(I.description || "").trim()));
    if (!T.length) {
      it = null, ye = null, $t = null, He = "idle", dr = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", rr();
      return;
    }
    ye = T.map((I, F) => ({
      ...I,
      id: `mi${b}_${F}`,
      title: String(I.title || "").trim() || `Issue ${F + 1}`,
      kind: I.kind === "feature" ? "feature" : "bug",
      description: mc(I),
      selected: !0,
      thumb: null
    })), $t = ye.map((I) => ({ ...I })), _t = !1, Je = null, Me = "", He = "done", rr(), gl(), mh(b);
  }
  async function mh(g) {
    const b = it;
    if (!b || !ye) return;
    let w = b.dataUrl, M = null;
    if (b.blob)
      try {
        M = URL.createObjectURL(b.blob), w = M;
      } catch {
      }
    try {
      for (const C of [...ye]) {
        if (g !== Ct || Ye) return;
        const T = typeof C.startSec == "number" ? C.startSec : 0, L = typeof C.endSec == "number" && C.endSec > T ? C.endSec : T + 2, N = w ? await Pd(w, T + Math.min(1, (L - T) / 2)) : null;
        if (g !== Ct) return;
        if (N) {
          for (const I of [ye, $t]) {
            const F = I == null ? void 0 : I.find((D) => D.id === C.id);
            F && (F.thumb = N);
          }
          Ot();
        }
        gh(C.id, N, g);
      }
    } finally {
      if (M)
        try {
          URL.revokeObjectURL(M);
        } catch {
        }
    }
  }
  async function gh(g, b, w) {
    const M = t.onEnhance, C = ye == null ? void 0 : ye.find((q) => q.id === g);
    if (!M || !C) return;
    const T = (q) => String(q || "").trim().toLowerCase().replace(/\s+/g, " "), L = T(C.narration), N = !!L && (ye || []).some((q) => {
      const H = q.id === g ? "" : T(q.narration);
      return !!H && (H === L || H.includes(L) || L.includes(H));
    }), I = [C.title, C.actualResult, C.expectedResult ? `Expected: ${C.expectedResult}` : ""].map((q) => String(q || "").trim()).filter(Boolean).join(`
`), F = !N && String(C.narration || "").trim() || I || C.title, D = (q) => {
      for (const H of [ye, $t]) {
        const J = H == null ? void 0 : H.find((Q) => Q.id === g);
        J && (J.enhancing = q);
      }
    };
    D(!0), Ot();
    let B = null;
    try {
      B = await M(F, { images: b ? 1 : 0, ...b ? { shot: b } : {} });
    } catch {
      B = null;
    }
    if (w !== Ct || Ye) return;
    D(!1);
    const V = T(B == null ? void 0 : B.summary);
    if (V && (ye || []).some((q) => q.id !== g && T(q.title) === V) && (B = null), B)
      for (const q of [ye, $t]) {
        const H = q == null ? void 0 : q.find((J) => J.id === g);
        !H || q === ye && H.edited || (H.title = String(B.summary || "").trim() || H.title, H.actualResult = B.actualResult || "", H.expectedResult = B.expectedResult || "", H.stepsToReproduce = Array.isArray(B.stepsToReproduce) ? B.stepsToReproduce : [], B.suggestedSeverity && (H.suggestedSeverity = B.suggestedSeverity), B.suggestedPriority && (H.suggestedPriority = B.suggestedPriority), H.description = mc(H));
      }
    Ot();
  }
  function gl() {
    if (!ye || Ye) return;
    const g = a.getElementById("klavity-side");
    $e || ($e = document.createElement("div"), $e.className = "kl-mr", $e.id = "klavity-mr", $e.setAttribute("role", "dialog"), $e.setAttribute("aria-label", "AI Analysis Complete"), (g || le).appendChild($e)), g && (g.scrollTop = 0, g.classList.add("kl-mr-open")), Ot();
  }
  function jn() {
    var g;
    De = null, st = null, $e == null || $e.remove(), $e = null, (g = a.getElementById("klavity-side")) == null || g.classList.remove("kl-mr-open");
  }
  function yh() {
    !it || W.includes(it) || (Ct++, it = null, ye = null, $t = null, _t = !1, He = "idle", dr = "", jn(), rr());
  }
  function bh(g) {
    if (!it) return;
    const b = W.indexOf(it);
    if (b < 0) return;
    (Se !== b || !a.querySelector(".kl-hero-video")) && (Se = b, We = null, Re());
    const w = a.querySelector(".kl-hero-video");
    if (!w) return;
    const M = () => {
      try {
        w.currentTime = Math.max(0, g);
        const C = w.play();
        C && typeof C.catch == "function" && C.catch(() => {
        });
      } catch {
      }
    };
    w.readyState >= 1 ? M() : w.addEventListener("loadedmetadata", M, { once: !0 });
  }
  function yl() {
    if (_t && !Je && typeof window.confirm == "function") {
      let g = !0;
      try {
        g = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        g = !0;
      }
      if (!g) return !1;
    }
    return $t && (ye = $t.map((g) => ({ ...g }))), _t = !1, !0;
  }
  function kh(g) {
    return ky(g.description, g.title);
  }
  function Ot() {
    if (!$e || !ye) return;
    if (Je) {
      Sh();
      return;
    }
    const g = ye, b = g.filter((L) => L.selected), w = g.length > 0 && b.length === g.length, M = g.length, C = b.length, T = g.map((L) => {
      const N = pa(L.startSec, L.endSec), I = yy(L.suggestedPriority), F = typeof L.confidence == "number" && isFinite(L.confidence) ? Math.round(L.confidence * 100) : null, D = L.kind === "feature";
      return `<div class="kl-mr-card${L.selected ? "" : " kl-off"}" data-id="${Te(L.id)}"><input type="checkbox" class="kl-mr-cb" ${L.selected ? "checked" : ""} aria-label="${L.selected ? "Deselect" : "Select"} ${Te(L.title)}"><div class="kl-mr-thumb">${L.thumb ? `<img src="${Te(L.thumb)}" alt="">` : K("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Te(L.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Te(L.title)}">${K("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${D ? "kl-mr-feat" : "kl-mr-bug"}">${K(D ? "lightbulb" : "bug", { size: 10 })}${D ? "Feature" : "Bug"}</span>${I ? `<span class="kl-mr-p${I === "High" ? 1 : I === "Medium" ? 2 : 3}">${I}</span>` : ""}${F != null && F < 85 ? `<span class="kl-mr-conf">${F}% · review</span>` : ""}${L.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${L.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Te(kh(L))}</p>${N ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${K("clock", { size: 11 })} ${Te(N)}</button>` : ""}</div></div>`;
    }).join("");
    $e.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${K("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${K("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${K("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${M} report${M === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${M} report${M === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${C} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${w ? "checked" : ""} aria-label="${w ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${T}</div></div></div><div class="kl-mr-foot"><p>${C} of ${M} tickets selected</p>${Me ? `<p class="kl-mr-err" role="alert">${Te(Me)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${C === 0 || ae ? "disabled" : ""}>${ae ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${C} ${C === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (De && st ? vh() : ""), wh();
  }
  function vh() {
    const g = st, b = (w, M) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${M.length},1fr)">${M.map(([C, T, L]) => `<button type="button" class="${w}${(w === "kl-mr-kind" ? g.kind : g.priority) === C ? " kl-on" : ""}" data-v="${C}">${L}${T}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${K("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Te(g.title)}"></label><div class="kl-mr-f"><span>Type</span>${b("kl-mr-kind", [["bug", "Bug", K("bug", { size: 13 })], ["feature", "Feature", K("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${b("kl-mr-pri", da.map((w) => [w.priority, w.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Te(g.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Te(g.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${K("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${g.title.trim() && g.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function wh() {
    var b, w, M, C;
    if (!$e || !ye) return;
    const g = (T) => $e.querySelector(T);
    (b = g("#kl-mr-back")) == null || b.addEventListener("click", () => {
      ae || !yl() || (jn(), rr());
    }), (w = g("#kl-mr-close")) == null || w.addEventListener("click", () => {
      ae || !yl() || (jn(), pr());
    }), (M = g("#kl-mr-all")) == null || M.addEventListener("change", (T) => {
      const L = T.target.checked;
      ye.forEach((N) => {
        N.selected = L;
      }), _t = !0, Ot();
    }), (C = g("#kl-mr-submit")) == null || C.addEventListener("click", () => {
      Eh();
    }), $e.querySelectorAll(".kl-mr-card").forEach((T) => {
      var N, I, F;
      const L = ye.find((D) => D.id === T.dataset.id);
      L && ((N = T.querySelector(".kl-mr-cb")) == null || N.addEventListener("change", (D) => {
        L.selected = D.target.checked, _t = !0, Ot();
      }), (I = T.querySelector(".kl-mr-edit")) == null || I.addEventListener("click", () => {
        var D;
        De = L.id, st = { title: L.title, kind: L.kind === "feature" ? "feature" : "bug", priority: String(L.suggestedPriority || "").toUpperCase(), description: L.description, ts: pa(L.startSec, L.endSec) }, Ot(), (D = $e == null ? void 0 : $e.querySelector("#kl-mr-ed-title")) == null || D.focus();
      }), (F = T.querySelector(".kl-mr-ts")) == null || F.addEventListener("click", () => bh(typeof L.startSec == "number" ? L.startSec : 0)));
    }), De && st && xh();
  }
  function xh() {
    var T, L, N, I, F, D;
    const g = st, b = (B) => $e.querySelector(B), w = b("#kl-mr-ed-save"), M = () => {
      w && (w.disabled = !(g.title.trim() && g.description.trim()));
    }, C = () => {
      De = null, st = null, Ot();
    };
    (T = b("#kl-mr-ed-title")) == null || T.addEventListener("input", (B) => {
      g.title = B.target.value, M();
    }), (L = b("#kl-mr-ed-desc")) == null || L.addEventListener("input", (B) => {
      g.description = B.target.value, M();
    }), (N = b("#kl-mr-ed-ts")) == null || N.addEventListener("input", (B) => {
      g.ts = B.target.value;
    }), $e.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((B) => B.addEventListener("click", () => {
      B.classList.contains("kl-mr-kind") ? g.kind = B.dataset.v === "feature" ? "feature" : "bug" : g.priority = B.dataset.v || "";
      const V = B.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      $e.querySelectorAll(V).forEach((q) => q.classList.toggle("kl-on", q === B));
    })), (I = b("#kl-mr-ed-x")) == null || I.addEventListener("click", C), (F = b("#kl-mr-ed-cancel")) == null || F.addEventListener("click", C), (D = b("#kl-mr-ed-rm")) == null || D.addEventListener("click", () => {
      if (ye = ye.filter((B) => B.id !== De), _t = !0, De = null, st = null, !ye.length) {
        ye = null, He = "idle", jn(), rr();
        return;
      }
      Ot(), rr();
    }), w == null || w.addEventListener("click", () => {
      const B = ye.find((H) => H.id === De);
      if (!B || !g.title.trim() || !g.description.trim()) return;
      B.title = g.title.trim(), B.edited = !0, B.kind = g.kind, B.description = g.description.trim();
      const V = da.find((H) => H.priority === g.priority);
      V && (B.suggestedPriority = V.priority, B.suggestedSeverity = V.severity);
      const q = by(g.ts);
      B.startSec = q.startSec, B.endSec = q.endSec, _t = !0, De = null, st = null, Ot();
    });
  }
  function Sh() {
    var M, C;
    if (!$e || !Je) return;
    const g = Je.refs.length, b = Je.refs.filter((T) => T.key).map((T) => {
      const L = Js(T.url), N = Te(Ks(T.key, T.url));
      return L ? `<a href="${Te(L)}" target="_blank" rel="noopener">${N}</a>` : `<span>${N}</span>`;
    }).join("");
    $e.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${K("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${K("check", { size: 25 })}</span><h3>${g} ticket${g === 1 ? "" : "s"} created</h3><p>${Te(n.thankYou || "Your AI-generated reports have been filed.")}</p>${Je.failed ? `<p role="alert">${Je.failed} ticket${Je.failed === 1 ? "" : "s"} couldn't be created — please report ${Je.failed === 1 ? "it" : "them"} again.</p>` : ""}${b ? `<div class="kl-mr-keys">${b}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const w = () => pr({ reason: "submitted" });
    (M = $e.querySelector("#kl-mr-close")) == null || M.addEventListener("click", w), (C = $e.querySelector("#kl-mr-done")) == null || C.addEventListener("click", w);
  }
  async function Eh() {
    var N;
    if (!ye || !it || ae) return;
    const g = ye.filter((I) => I.selected).map((I) => ({ ...I, title: I.title.trim(), description: I.description.trim() }));
    if (!g.length) return;
    const b = Al(), w = n.submitTargetToggle !== !1 ? { feedbackTarget: As } : {}, M = (I) => I.kind === "feature" ? "feature" : "bug", C = (I) => ({
      ...I.suggestedSeverity ? { suggestedSeverity: I.suggestedSeverity } : {},
      ...I.suggestedPriority ? { suggestedPriority: I.suggestedPriority } : {}
    }), T = g[0], L = g.slice(1);
    ae = !0, Me = "", Ot();
    try {
      qn && await Ms;
      const I = await Promise.all(p.slice()), F = it, D = {
        type: M(T),
        ...ue ? { kind: M(T) } : {},
        title: T.title,
        description: gc(T, { primary: !0, reporterNote: Z.value.trim() }),
        screenshots: I.length ? I : T.thumb ? [T.thumb] : [],
        ..._.length ? { files: _.slice() } : {},
        recordings: [F, ...W.filter((J) => J !== F)],
        ...I.length ? { annotations: Ke() } : {},
        reporterEmail: b.email,
        createContact: b.createContact,
        ...w,
        ...C(T),
        ...t.consoleAttachToggle ? { attachConsole: !!((N = a.getElementById("klavity-conlog-cb")) != null && N.checked) } : {}
      }, B = (J, Q) => ({
        type: M(J),
        ...ue ? { kind: M(J) } : {},
        title: J.title,
        description: gc(J, { primary: !1, videoTitle: T.title, videoKey: Q }),
        screenshots: J.thumb ? [J.thumb] : [],
        recordings: [F],
        reporterEmail: b.email,
        createContact: !1,
        ...w,
        ...C(J)
      });
      if (t.backgroundUpload) {
        const J = t.onSubmit;
        J(D), (async () => {
          for (const Q of L)
            try {
              await J(B(Q));
            } catch (pe) {
              try {
                console.error("[Klavity] multi-issue ticket failed:", pe);
              } catch {
              }
            }
        })(), pr({ immediate: !0, reason: "submitted" });
        return;
      }
      const V = await t.onSubmit(D), q = [{ key: V.issueKey, url: V.issueUrl }];
      let H = 0;
      for (const J of L)
        try {
          const Q = await t.onSubmit(B(J, V.issueKey || void 0));
          q.push({ key: Q.issueKey, url: Q.issueUrl });
        } catch (Q) {
          H++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", Q);
          } catch {
          }
        }
      if (Ye) return;
      ae = !1, Je = { refs: q, failed: H }, _t = !1, Ot();
    } catch (I) {
      try {
        console.error("[Klavity] multi-issue submit failed:", I);
      } catch {
      }
      if (Ye) return;
      ae = !1, Me = n.debug ? `Couldn't create the tickets — ${(I == null ? void 0 : I.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", Ot();
    }
  }
  let Br = null;
  function pr(g) {
    var M;
    if (Ye) return;
    Ye = !0;
    for (const C of cn.splice(0))
      try {
        C();
      } catch {
      }
    Ct++;
    for (const C of _) Ae(C);
    for (const C of W)
      if (C._previewUrl)
        try {
          URL.revokeObjectURL(C._previewUrl);
        } catch {
        }
    if (Sr) {
      try {
        URL.revokeObjectURL(Sr);
      } catch {
      }
      Sr = null;
    }
    Br == null || Br(), Mt && (clearTimeout(Mt), Mt = null), document.removeEventListener("keydown", qr, { capture: !0 }), document.removeEventListener("paste", kl);
    try {
      (M = t.onClose) == null || M.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const b = a.querySelector(".klavity-modal");
    if (g != null && g.immediate || !b) {
      nt(s);
      return;
    }
    b.classList.add("kl-closing");
    const w = () => nt(s);
    b.addEventListener("animationend", w, { once: !0 }), setTimeout(w, 700);
  }
  function bl(g, b) {
    if (Mt || Ye) return;
    const w = document.createElement("div");
    w.className = "klavity-toast-progress", w.style.animationDuration = b + "ms", g.appendChild(w);
    let M = b, C = Date.now();
    const T = () => {
      C = Date.now(), Mt = setTimeout(() => {
        pr();
      }, M);
    }, L = () => {
      Mt && (clearTimeout(Mt), Mt = null, M = Math.max(0, M - (Date.now() - C)), w.style.animationPlayState = "paused");
    }, N = () => {
      Mt || g.classList.contains("kl-closing") || (w.style.animationPlayState = "running", T());
    };
    g.addEventListener("mouseenter", L), g.addEventListener("mouseleave", N), g.addEventListener("focusin", L), g.addEventListener("focusout", (I) => {
      g.contains(I.relatedTarget) || N();
    }), T();
  }
  function qr(g) {
    var b;
    if (yi) {
      g.key === "Escape" ? (g.stopPropagation(), yi()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), _s();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const w = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (w && (w.tagName === "INPUT" || w.tagName === "TEXTAREA" || w.tagName === "SELECT" || w.isContentEditable || ((b = w.getAttribute) == null ? void 0 : b.call(w, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const M = a.getElementById("klavity-submit");
      M && !M.disabled && (g.preventDefault(), g.stopPropagation(), M.click());
    }
  }
  document.addEventListener("keydown", qr, { capture: !0 });
  const kl = (g) => {
    if (!g.clipboardData) return;
    const b = Array.from(g.clipboardData.items).filter((w) => w.type.startsWith("image/")).map((w) => w.getAsFile()).filter((w) => !!w);
    b.length && Rs(b);
  };
  document.addEventListener("paste", kl);
  const Ts = () => {
    const g = le.querySelector("#klavity-desc");
    g && (g.placeholder = ge === "feature" ? "Describe the feature you'd like..." : ge === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (ue) {
    const g = Array.from(le.querySelectorAll(".kl-type-chip"));
    g.forEach((b) => {
      b.addEventListener("click", () => {
        ge = b.getAttribute("data-kind") || "bug", g.forEach((w) => {
          const M = w === b;
          w.classList.toggle("active", M), w.setAttribute("aria-checked", M ? "true" : "false");
        }), Ts();
      });
    });
  } else {
    const g = le.querySelector(".kl-toggle-bug"), b = le.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      ge = "bug", g.classList.add("active"), b.classList.remove("active"), Ts();
    }), b.addEventListener("click", () => {
      ge = "feature", b.classList.add("active"), g.classList.remove("active"), Ts();
    });
  }
  let As = "project";
  {
    const g = le.querySelector("#klavity-target");
    if (g) {
      const b = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const w of b)
        w.addEventListener("click", () => {
          As = w.dataset.target === "klavity" ? "klavity" : "project";
          for (const C of b) {
            const T = C === w;
            C.classList.toggle("on", T), C.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const Z = le.querySelector("#klavity-desc");
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
      const C = g();
      if (!C || !C.rangeCount) return -1;
      try {
        const T = C.getRangeAt(0);
        if (!Z.contains(T.endContainer)) return -1;
        const L = T.cloneRange();
        return L.selectNodeContents(Z), L.setEnd(T.endContainer, T.endOffset), L.toString().length;
      } catch {
        return -1;
      }
    }, w = (C) => {
      const T = g();
      if (T)
        try {
          const L = document.createRange(), N = document.createTreeWalker(Z, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let I, F = C, D = !1;
          for (; I = N.nextNode(); ) {
            if (I.nodeName === "BR") {
              if (F === 0) {
                L.setStartBefore(I), D = !0;
                break;
              }
              F -= 1;
              continue;
            }
            if (I.nodeType === 3) {
              const B = (I.textContent || "").length;
              if (F <= B) {
                L.setStart(I, F), D = !0;
                break;
              }
              F -= B;
            }
          }
          D ? L.collapse(!0) : (L.selectNodeContents(Z), L.collapse(!1)), T.removeAllRanges(), T.addRange(L);
        } catch {
        }
    }, M = () => {
      const C = b(), T = fc(Z).replace(/\n$/, "");
      Z.innerHTML = T ? hc(T) : "", C >= 0 && w(C);
    };
    Z.addEventListener("input", M), Object.defineProperty(Z, "value", {
      configurable: !0,
      get() {
        return fc(Z);
      },
      set(C) {
        const T = String(C ?? "").replace(/\n$/, "");
        Z.innerHTML = T ? hc(T) : "";
      }
    }), Object.defineProperty(Z, "disabled", {
      configurable: !0,
      get() {
        return Z.getAttribute("contenteditable") === "false";
      },
      set(C) {
        Z.setAttribute("contenteditable", C ? "false" : "true"), Z.classList.toggle("kl-desc-disabled", !!C);
      }
    }), Object.defineProperty(Z, "placeholder", {
      configurable: !0,
      get() {
        return Z.getAttribute("data-ph") || "";
      },
      set(C) {
        Z.setAttribute("data-ph", String(C ?? ""));
      }
    });
  }
  const jr = le.querySelector("#klavity-submit"), be = le.querySelector("#klavity-remail");
  let vr = "", Wn = !1;
  be && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (be.value = t.prefillEmail), be && be.value.trim() && (vr = be.value.trim().toLowerCase());
  const vl = le.querySelector("#klavity-desc-hint"), Ch = () => !t.requireEmail || !!be && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(be.value.trim()), Ls = () => {
    var g;
    return c.length > 0 || Fn || _.length > 0 || W.length > 0 || Z.value.trim().length > 0 || (((g = le.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let gi = null, yi = null;
  const _s = () => {
    var M, C, T;
    if (!Ls()) {
      pr();
      return;
    }
    if (gi) return;
    const g = document.createElement("div");
    gi = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const b = () => {
      nt(g), gi === g && (gi = null, yi = null);
    };
    yi = b, g.addEventListener("click", (L) => {
      L.target === g && b();
    }), (M = g.querySelector("#kl-cc-keep")) == null || M.addEventListener("click", b), (C = g.querySelector("#kl-cc-discard")) == null || C.addEventListener("click", () => {
      b(), pr({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || Dr).appendChild(g);
    try {
      (T = g.querySelector("#kl-cc-keep")) == null || T.focus();
    } catch {
    }
  }, Mh = () => {
  }, ut = () => {
    const g = Z.value.trim() === "";
    jr.disabled = g && !Ls() || !Ch(), vl && (vl.hidden = !(g && Ls()));
  };
  if (Z.addEventListener("input", Mh), Z.addEventListener("input", ut), be == null || be.addEventListener("input", ut), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let b = null;
    const w = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(Z.value);
      } catch {
      }
    };
    Z.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(w, 600);
    }), Z.addEventListener("blur", w), Z.addEventListener("change", w), un(w);
  }
  const Hn = le.querySelector("#klavity-title");
  if (Hn && t.onTitleChange) {
    const g = t.onTitleChange;
    let b = null;
    const w = () => {
      b && (clearTimeout(b), b = null);
      try {
        g(Hn.value);
      } catch {
      }
    };
    Hn.addEventListener("input", () => {
      b && clearTimeout(b), b = setTimeout(w, 600);
    }), Hn.addEventListener("blur", w), Hn.addEventListener("change", w), un(w);
  }
  const Wr = le.querySelector("#klavity-remail-sugg"), Is = le.querySelector("#klavity-remail-matches"), wl = le.querySelector("#klavity-remail-sugg-hint"), wr = le.querySelector("#klavity-remail-addcontact"), xl = le.querySelector(".klavity-remail-sugg-em"), Sl = le.querySelector(".klavity-remail-sugg-check");
  let Yt = !1, mn = "", bi = [], Os = "", Ns = !1, El = 0;
  const Cl = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), Rh = (g) => {
    var M, C;
    const b = (g.name || g.email).trim(), w = b.split(/[\s._-]+/).filter(Boolean);
    return ((((M = w[0]) == null ? void 0 : M[0]) || "") + (((C = w[1]) == null ? void 0 : C[0]) || "")).toUpperCase() || b.slice(0, 1).toUpperCase();
  }, Th = (g) => {
    let b = 0;
    for (let w = 0; w < g.length; w++) b = b * 31 + g.charCodeAt(w) >>> 0;
    return `hsl(${b % 360} 58% 42%)`;
  };
  async function Ml(g) {
    if (!t.onLookupPeople) {
      bi = [], Os = g, Ns = !0;
      return;
    }
    const b = ++El;
    try {
      const w = await t.onLookupPeople(g);
      if (b !== El) return;
      bi = Array.isArray(w) ? w : [];
    } catch {
      bi = [];
    }
    Os = g, Ns = !0, xr();
  }
  function xr() {
    if (!Wr || !be) return;
    const g = be.value.trim(), b = g.toLowerCase();
    Yt && b !== mn && (Yt = !1, mn = "");
    const w = Wn ? bi.filter((L) => !b || L.email.toLowerCase().includes(b)) : [], M = w.some((L) => L.email.toLowerCase() === b), C = Wn && Cl(g) && !M;
    Is && (Is.innerHTML = w.map((L) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Te(L.email)}">
          <span class="klavity-remail-av" style="background:${Te(Th(L.email))}">${Te(Rh(L))}</span>
          <span class="klavity-remail-who">${L.name ? `${Te(L.name)} <i>(${Te(L.email)})</i>` : Te(L.email)}</span>
        </button>`).join(""), Is.querySelectorAll(".klavity-remail-person").forEach((L) => {
      L.addEventListener("click", () => {
        var N;
        be.value = L.getAttribute("data-email") || "", Yt = !1, mn = "", vr = be.value.trim().toLowerCase(), (N = t.onRememberEmail) == null || N.call(t, vr), xr(), ut();
      });
    }));
    const T = be.parentElement;
    T && T.classList.contains("klavity-remail-wrap") && T.classList.toggle("is-open", !!(w.length || C)), be.setAttribute("aria-expanded", w.length || C ? "true" : "false"), wr && (wr.hidden = !C), wl && (wl.hidden = !C), Wr.hidden = !(w.length || C), xl && (xl.textContent = g), Sl && (Sl.hidden = !Yt), wr == null || wr.setAttribute("aria-selected", Yt ? "true" : "false");
  }
  wr == null || wr.addEventListener("click", () => {
    var b;
    const g = (be == null ? void 0 : be.value.trim()) || "";
    Cl(g) && (Yt = !Yt, mn = Yt ? g.toLowerCase() : "", vr = Yt ? g.toLowerCase() : "", vr && ((b = t.onRememberEmail) == null || b.call(t, vr)), xr(), ut());
  });
  function Ah() {
    if (!be || t.requireEmail) return;
    const g = be.value.trim();
    g && g.toLowerCase() !== vr && (be.value = "", Yt = !1, mn = "", vr = "", xr(), ut());
  }
  function Rl() {
    setTimeout(() => {
      var M;
      const b = le.getRootNode().activeElement;
      b === be || Wr && b && Wr.contains(b) || (Wn = !1, be && !be.value.trim() && ((M = t.onRememberEmail) == null || M.call(t, "")), Ah(), xr());
    }, 0);
  }
  be == null || be.addEventListener("blur", Rl), Wr == null || Wr.addEventListener("focusout", Rl);
  let Ps = null;
  if (be == null || be.addEventListener("focus", () => {
    Wn = !0, xr(), Ns || Ml("");
  }), be == null || be.addEventListener("input", () => {
    Wn = !0, xr();
    const g = be.value.trim().toLowerCase();
    g !== Os && (Ps && clearTimeout(Ps), Ps = setTimeout(() => {
      Ml(g);
    }, 180));
  }), xr(), t.onEnhance) {
    const g = t.onEnhance, b = le.querySelector("#klavity-enhance"), w = le.querySelector("#klavity-enhance-undo"), M = le.querySelector("#klavity-enhance-regen"), C = le.querySelector("#klavity-enhance-spin");
    let T = 0, L = null;
    const N = () => c[Pe] || c[0] || "", I = () => {
      const D = N();
      if (!D) return "";
      const B = Pe >= 0 && Pe < c.length ? Pe : 0, V = re[B] ?? (B === 0 ? re[0] : null);
      if (!V || !Array.isArray(V.shapes) || !V.shapes.length) return D;
      const q = a.getElementById("klavity-hero-stage"), H = q == null ? void 0 : q.querySelector("canvas");
      if (H && Pe === B && H.width > 1 && H.height > 1)
        try {
          const J = H.toDataURL("image/png");
          if (J && J.length > 64) return J;
        } catch {
        }
      return null;
    }, F = async () => {
      if (Ft) return;
      const D = Z.value.trim();
      L = Z.value;
      const B = ++T;
      b && (b.disabled = !0), C && (C.hidden = !1);
      try {
        const V = de ? { selector: de.selector, text: de.text } : null, q = Pe >= 0 && Pe < c.length ? Pe : 0, H = re[q] ?? (q === 0 ? re[0] : null), J = sg(H == null ? void 0 : H.shapes), Q = N();
        let pe = I();
        pe === null && (pe = await og(Q, H.shapes, H.w, H.h));
        const Ve = await g(D, {
          images: c.length,
          shot: pe,
          annotations: H,
          annotationTexts: J,
          picked: V
        });
        if (B !== T || !Ve) return;
        Z.value = zd(Ve), Z.dispatchEvent(new Event("input", { bubbles: !0 })), tr = Ve.suggestedSeverity || null, $r = Ve.suggestedPriority || null, Z.classList.add("kl-just-enhanced"), setTimeout(() => Z.classList.remove("kl-just-enhanced"), 700), w && (w.hidden = !1), M && (M.hidden = !1), ut();
      } catch {
      } finally {
        B === T && (b && (b.disabled = !1), C && (C.hidden = !0));
      }
    };
    b == null || b.addEventListener("click", () => {
      F();
    }), M == null || M.addEventListener("click", () => {
      F();
    }), w == null || w.addEventListener("click", () => {
      L !== null && (Z.value = L, Z.dispatchEvent(new Event("input", { bubbles: !0 })), ut()), L = null, tr = null, $r = null, w && (w.hidden = !0), M && (M.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = le.querySelector("#klavity-known"), b = t.onCheckKnown;
    let w = null, M = 0, C = "";
    const T = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, L = (I) => {
      var D;
      if (!g) return;
      const F = I.headline ? Te(I.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${K("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${Te(I.statusLabel)}</span>. We're already tracking "${Te(I.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (D = g.querySelector("#klavity-known-dismiss")) == null || D.addEventListener("click", () => {
        C = Z.value.trim(), T();
      });
    }, N = async () => {
      const I = Z.value.trim();
      if (I.length < 12 || I === C) {
        T();
        return;
      }
      const F = ++M;
      try {
        const D = await b(I);
        if (F !== M) return;
        if (Z.value.trim() === C) {
          T();
          return;
        }
        D ? L(D) : T();
      } catch {
      }
    };
    Z.addEventListener("input", () => {
      Z.value.trim() !== C && (C = ""), w && clearTimeout(w), w = setTimeout(N, 500);
    });
  }
  if (n.reportClarity) {
    const g = le.querySelector("#klavity-clarity"), b = le.querySelector("#klavity-clarity-status"), w = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, M = le.querySelector("#klavity-clarity-tip"), C = le.querySelector("#klavity-clarity-tip-text"), T = le.querySelector("#klavity-nudge"), L = t.onClarityTip, N = /* @__PURE__ */ new Map();
    let I = null, F = 0;
    const D = (J, Q, pe) => {
      if (!J) return;
      J.classList.toggle("done", Q);
      const Ve = J.querySelector(".kl-clr-mark");
      Ve && (Ve.innerHTML = Q ? K("check", { size: 12 }) : "○"), J.setAttribute("aria-label", (Q ? "covered: " : "missing: ") + pe);
    }, B = () => {
      M && (M.hidden = !0);
    }, V = (J) => {
      !M || !C || qg(J) || (C.innerHTML = Te(J) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, q = () => {
      const J = Z.value, Q = Ld(J);
      g && (g.hidden = J.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(Q.level === "great" ? "l3" : Q.level === "good" ? "l2" : "l1")), b && (b.textContent = Q.label), D(w.problem, Q.coverage.problem, "What's broken"), D(w.expected, Q.coverage.expected, "What you expected"), D(w.repro, Q.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), Q.level === "great" && B();
    }, H = () => {
      !L || !M || (I && clearTimeout(I), I = setTimeout(async () => {
        const J = Z.value.trim();
        if (!Ug(J)) {
          B();
          return;
        }
        if (N.has(J)) {
          V(N.get(J));
          return;
        }
        const Q = ++F;
        try {
          const pe = await L(J, { images: c.length });
          if (Q !== F || Z.value.trim() !== J) return;
          pe && pe.tip && (N.set(J, pe.tip), V(pe.tip));
        } catch {
        }
      }, 1e3));
    };
    Z.addEventListener("input", () => {
      q(), H();
    }), q(), (zl = le.querySelector("#klavity-nudge-add")) == null || zl.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        Z.focus();
      } catch {
      }
    }), ($l = le.querySelector("#klavity-nudge-anyway")) == null || $l.addEventListener("click", () => {
      T && (T.hidden = !0), jr.click();
    });
  }
  Dr.addEventListener("click", (g) => {
    g.target === Dr && _s();
  }), (Dl = le.querySelector("#klavity-x")) == null || Dl.addEventListener("click", () => _s()), (Fl = le.querySelector("#klavity-min")) == null || Fl.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const Tl = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Ft = !1;
  const pt = (g) => {
    Ft = g, Tl().forEach((w) => {
      w.disabled = g;
    }), Z.disabled = g;
    const b = le.querySelector("#klavity-voice");
    b && (b.disabled = g), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((w) => {
      w.disabled = g;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((w) => {
      w.disabled = g;
    }), g ? (Br == null || Br(), jr.disabled = !0) : (ut(), fi());
  }, nr = (g) => {
    Tl().forEach((b) => {
      b.classList.remove("kl-active"), b.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, hr = le.querySelector("#klavity-voice");
  if (hr) {
    const w = hr.querySelector(".kl-vring-prog");
    let M = 0, C = 0, T = !1, L, N = "";
    const I = () => {
      C = Date.now();
      const me = () => {
        const Fe = Date.now() - C, Ie = Math.min(Fe / 18e4, 1);
        if (w == null || w.setAttribute("stroke-dashoffset", String(Ie * 81.68)), Fe >= 165e3 && hr.classList.add("kl-voice-warn"), Fe >= 18e4) {
          L.stop();
          return;
        }
        M = requestAnimationFrame(me);
      };
      M = requestAnimationFrame(me);
    }, F = () => {
      cancelAnimationFrame(M), w == null || w.setAttribute("stroke-dashoffset", String(81.68)), hr.classList.remove("kl-voice-warn");
    }, D = le.querySelector("#klavity-voice-status");
    let B = null;
    const V = () => {
      B && (clearTimeout(B), B = null), D && (D.hidden = !0, D.textContent = "", D.classList.remove("kl-vs-info", "kl-vs-err"));
    }, q = (me, Fe, Ie) => {
      !D || !Fe || (B && (clearTimeout(B), B = null), D.classList.remove("kl-vs-info", "kl-vs-err"), D.classList.add(me === "err" ? "kl-vs-err" : "kl-vs-info"), D.textContent = Fe, D.hidden = !1, Ie && (B = setTimeout(V, Ie)));
    }, H = "Recording — tap to stop", J = () => {
      D && D.classList.contains("kl-vs-info") && V();
    }, Q = (me) => {
      hr.classList.toggle("kl-voice-rec", me), hr.setAttribute("aria-pressed", me ? "true" : "false"), hr.setAttribute("aria-label", me ? "Stop recording" : "Voice dictation"), hr.title = me ? H : "Voice dictation";
    }, pe = (me) => {
      let Fe = "";
      me.onTranscript = (Ie) => {
        Fe = "", N = Ai(N, Ie), Z.value = N;
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ut();
      }, me.onInterim = (Ie) => {
        Fe = Ie || "";
        const te = N.length > 0 && !/\s$/.test(N) ? " " : "";
        Z.value = N + (Ie ? te + Ie : "");
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ut();
      }, me.onStatus = (Ie, te) => {
        Ie === "idle" ? J() : q("info", te);
      }, me.onError = (Ie, te) => {
        te && q("err", te, 4e3);
      }, me.onStop = () => {
        Fe && (N = Ai(N, Fe), Fe = ""), N && (N = dc(N), Z.value = N);
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, Q(!1), F(), J(), ut();
      };
    }, Ve = () => {
      const me = new Qn();
      return pe(me), me;
    }, rt = () => {
      if (!T) {
        Q(!1), F(), J();
        return;
      }
      Qn.isSupported() ? (N = Z.value, L = Ve(), q("info", "Reconnecting dictation…"), L.start()) : (T = !1, Q(!1), F(), q("err", "Voice dictation is unavailable right now", 4e3));
    }, kt = () => {
      if (!(Ze === "server" && t.onDictate)) return null;
      const me = new Ki({ transcribe: (Fe) => t.onDictate(Fe) });
      return pe(me), me.onUnavailable = rt, me;
    }, Er = (me) => {
      const Fe = () => N.length > 0 && !/\s$/.test(N) ? " " : "";
      let Ie = "";
      me.onTranscript = (te) => {
        Ie = "", N = Ai(N, te), Z.value = N;
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ut();
      }, me.onInterim = (te) => {
        Ie = te || "", Z.value = N + Fe() + te;
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ut();
      }, me.onStatus = (te, ce) => {
        te === "idle" ? J() : q("info", ce);
      }, me.onError = (te, ce) => {
        ce && q("err", ce, 4e3);
      }, me.onStop = () => {
        Ie && (N = Ai(N, Ie), Ie = ""), N && (N = dc(N)), Z.value = N;
        try {
          Z.scrollTop = Z.scrollHeight;
        } catch {
        }
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, Q(!1), F(), J(), ut();
      }, me.onUnavailable = () => {
        Z.value = N;
        try {
          Z.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!T) {
          Q(!1), F(), J();
          return;
        }
        const te = kt();
        if (te) {
          L = te, q("info", "Reconnecting dictation…"), L.start();
          return;
        }
        rt();
      };
    }, Ut = () => {
      if (Ze === "server" && t.dictationStreamUrl && Ji.isSupported()) {
        const me = new Ji({ url: t.dictationStreamUrl });
        return Er(me), me;
      }
      return kt() ?? Ve();
    };
    L = Ut(), hr.addEventListener("click", () => {
      T ? L.stop() : (V(), N = Z.value, L = Ut(), T = !0, Q(!0), L.start(), I());
    }), Br = () => {
      T && L.stop();
    };
  }
  function Al() {
    var w;
    const g = (be == null ? void 0 : be.value.trim()) || "", b = g && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g)) ? g : void 0;
    return b && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b) && ((w = t.onRememberEmail) == null || w.call(t, b.toLowerCase())), { email: b, createContact: !!(b && Yt && b.toLowerCase() === mn) };
  }
  jr.addEventListener("click", async () => {
    var Q;
    if (Ft || jr.disabled) return;
    const g = Z.value.trim(), b = le.querySelector("#klavity-title"), w = b ? b.value.trim() : "", M = ge === "feature" ? "feature" : "bug";
    u && await Promise.race([u, Promise.resolve()]), qn && await Ms;
    const C = p.slice(), T = Ke(), L = _.slice(), N = W.slice(), I = ge, { email: F, createContact: D } = Al();
    pt(!0), jr.textContent = "Uploading…";
    const B = a.getElementById("klavity-err");
    B.style.display = "none";
    const V = a.getElementById("klavity-progress"), q = a.getElementById("klavity-progress-fill");
    V && q && (V.classList.add("show"), q.style.transition = "none", q.style.width = "8%", q.offsetWidth, q.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      q.style.width = "90%";
    }));
    const H = () => {
      q && (q.style.transition = "width .25s ease", q.style.width = "100%");
    }, J = () => {
      V && q && (V.classList.remove("show"), q.style.transition = "none", q.style.width = "0");
    };
    try {
      const pe = await Promise.all(C), Ve = {
        type: M,
        ...ue ? { kind: I } : {},
        ...w ? { title: w } : {},
        description: g,
        screenshots: pe,
        ...L.length ? { files: L } : {},
        ...N.length ? { recordings: N } : {},
        annotations: T,
        reporterEmail: F,
        createContact: D,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: As } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...tr ? { suggestedSeverity: tr } : {},
        ...$r ? { suggestedPriority: $r } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((Q = a.getElementById("klavity-conlog-cb")) != null && Q.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(Ve), pr({ immediate: !0, reason: "submitted" });
        return;
      }
      const rt = await t.onSubmit(Ve);
      if (Ye) return;
      H(), t.success ? Fh(rt.issueKey, rt.issueUrl, t.success) : Dh(rt.issueKey, rt.issueUrl);
    } catch (pe) {
      J();
      const Ve = (pe == null ? void 0 : pe.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", pe);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${Ve}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", jr.textContent = "Submit", pt(!1);
    }
  });
  function Lh(g, b) {
    var L;
    const { dataUrl: w, quality: M, suggestSharp: C } = Gt(b);
    if (!w) return;
    const T = c.indexOf(g);
    if (!(T < 0)) {
      c[T] = w, p[T] = t.compressImage ? t.compressImage(w) : Promise.resolve(w), o[T] = M, h[T] = !!C && M !== "real-pixel", re[T] && delete re[T], delete ct[T], delete It[T], Re();
      try {
        (L = t.onShotReplaced) == null || L.call(t, T, w, M);
      } catch {
      }
    }
  }
  async function _h(g) {
    if (!t.onCaptureViewport) return !1;
    let b = null;
    const { geo: w } = Fr();
    try {
      const { dataUrl: C } = Gt(await t.onCaptureViewport());
      Ur(C, w, { kind: "viewport" }), C && (b = C, l = !1, Dt(C, "rendered", void 0, !0, !1), g && nr(g));
    } catch {
    } finally {
    }
    const M = (async () => {
      const { geo: C } = Fr();
      try {
        const T = await t.onCaptureFull();
        if (Ur(Gt(T).dataUrl, C, { kind: "full" }), b) Lh(b, T);
        else {
          l = !1;
          const { dataUrl: L, quality: N, suggestSharp: I } = Gt(T);
          L && (Dt(L, N, void 0, !0, !!I), g && nr(g));
        }
      } catch {
        l = !1, Re();
      } finally {
        u === M && (u = null);
      }
    })();
    return u = M, !0;
  }
  async function Ll(g) {
    if (!t.onCaptureViewport) return !1;
    const { geo: b } = Fr();
    try {
      const { dataUrl: w, blank: M } = Gt(await t.onCaptureViewport());
      M || Ur(w, b, { kind: "viewport" }), M && c.length === 0 ? Es() : w ? (l = !1, Dt(w, "rendered", void 0, !0, !1)) : (l = !1, Re());
    } catch {
      l = !1, Re();
    } finally {
    }
    return !0;
  }
  const Hr = le.querySelector("#klavity-full");
  Hr.addEventListener("click", async () => {
    if (!Ft && !(t.onCaptureSharp && (await zs()).ok)) {
      pt(!0), Hr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await _h(Hr);
          return;
        }
        const { restore: g, geo: b } = Fr();
        try {
          const { dataUrl: w, quality: M, suggestSharp: C } = Gt(await t.onCaptureFull());
          Ur(w, b, { kind: "full" }), Dt(w, M, void 0, !0, !!C), nr(Hr);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        Hr.classList.remove("kl-loading"), pt(!1);
      }
    }
  });
  async function zs(g) {
    const b = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Ft || !b || !_e) return { ok: !1, declined: !1 };
    const w = _e.querySelector(".kl-sharp-label");
    pt(!0), _e.classList.add("kl-loading"), s.style.display = "none";
    const M = w ?? _e, C = M.textContent;
    M.textContent = "Capturing…";
    let T = !1, L = !1;
    try {
      const { restore: N, geo: I } = Fr();
      let F;
      try {
        F = await b();
      } finally {
        N == null || N();
      }
      if (F) {
        const { dataUrl: D, quality: B } = Gt(F);
        Ur(D, I, { kind: g != null && g.viewport ? "viewport" : "full" }), D && (Dt(D, B ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), nr(_e), T = !0, E = !0);
      }
    } catch (N) {
      if (My(N)) {
        if (L = !0, !(g != null && g.onOpen))
          try {
            rh();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", N);
        } catch {
        }
    } finally {
      g != null && g.onOpen && L || (s.style.display = "", M.textContent = C, _e.classList.remove("kl-loading"), pt(!1));
    }
    return { ok: T, declined: L };
  }
  _e && t.onCaptureSharp && _e.addEventListener("click", () => {
    zs();
  });
  const _l = le.querySelector("#klavity-file"), Il = le.querySelector("#klavity-upload");
  Il.addEventListener("click", () => {
    if (!Ft) {
      if (!x && c.length >= k) {
        Ht(`You can attach up to ${k} images.`);
        return;
      }
      _l.click();
    }
  }), _l.addEventListener("change", async (g) => {
    const b = g.target, w = b.files ? Array.from(b.files) : [];
    if (b.value = "", !w.length) return;
    const M = c.length, C = _.length;
    x ? await dh(w) : await Rs(w), (c.length > M || _.length > C) && nr(Il);
  });
  const Yn = a.getElementById("klavity-record");
  Yn && t.onRecord && Yn.addEventListener("click", async () => {
    if (Ft) return;
    if (W.length >= X) {
      Ht(`You can attach up to ${X} recordings.`);
      return;
    }
    pt(!0), Yn.classList.add("kl-loading");
    const g = (b) => {
      s.style.display = b === "recording" ? "none" : "";
    };
    try {
      const b = await t.onRecord(g);
      if (b) {
        const w = W.findIndex((M) => M.id && b.id && M.id === b.id || M.dataUrl && b.dataUrl && M.dataUrl === b.dataUrl);
        w >= 0 ? (W[w] = b, Se = w) : (W.push(b), Se = W.length - 1), We = null, fn(), nr(Yn);
      }
    } catch {
    } finally {
      s.style.display = "", Yn.classList.remove("kl-loading"), pt(!1);
    }
  }), ve && (rr(), (Ul = a.getElementById("klavity-multi-start")) == null || Ul.addEventListener("click", () => {
    hh();
  }), t.initialMultiRecordingId && fh(t.initialMultiRecordingId));
  const $s = a.getElementById("klavity-region");
  $s && t.onRegionCapture && ($s.onclick = () => {
    Ft || (pt(!0), document.removeEventListener("keydown", qr, { capture: !0 }), s.style.display = "none", Py(async (g) => {
      document.addEventListener("keydown", qr, { capture: !0 });
      try {
        const { restore: b, geo: w } = Fr();
        let M;
        try {
          M = await t.onRegionCapture(g);
        } finally {
          b == null || b();
        }
        if (M) {
          const { dataUrl: C, quality: T, suggestSharp: L } = Gt(M);
          Ur(C, w, { kind: "region", rect: g }), C && (Dt(C, T, void 0, !0, !!L, { kind: "region", rect: g }), nr($s));
        }
      } finally {
        s.style.display = "", pt(!1);
      }
    }, () => {
      document.addEventListener("keydown", qr, { capture: !0 }), s.style.display = "", pt(!1);
    }));
  });
  const gn = a.getElementById("klavity-pick"), yn = a.getElementById("klavity-pickinfo"), Ol = () => {
    var w;
    if (gn && (gn.classList.toggle("kl-active", !!de), de ? gn.setAttribute("aria-pressed", "true") : gn.removeAttribute("aria-pressed")), !yn) return;
    if (!de) {
      yn.hidden = !0, yn.innerHTML = "";
      return;
    }
    yn.hidden = !1;
    const { text: g } = de, b = g ? `: <span class="kl-pick-txt">${Te(g)}</span>` : "";
    yn.innerHTML = `<span class="kl-pick-ic">${K("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${b}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (w = yn.querySelector("#klavity-pick-clear")) == null || w.addEventListener("click", () => {
      de = null, Ol();
    });
  };
  gn && t.onPickElement && (gn.onclick = async () => {
    if (!Ft) {
      pt(!0), document.removeEventListener("keydown", qr, { capture: !0 }), s.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (de = g, Ol(), g.shot && Dt(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", qr, { capture: !0 }), s.style.display = "", pt(!1);
      }
    }
  });
  function Vt(g, b = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function Ih(g) {
    const b = (T, L, N, I) => `<button type="button" class="kl-htool" data-tool="${T}" title="${L} (${I.toUpperCase()})" aria-label="${L}">${N}<span class="kl-hk">${I.toUpperCase()}</span></button>`, w = (T) => {
      const L = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(L)) return !1;
      const N = parseInt(L.slice(0, 2), 16), I = parseInt(L.slice(2, 4), 16), F = parseInt(L.slice(4, 6), 16);
      return (0.2126 * N + 0.7152 * I + 0.0722 * F) / 255 > 0.7;
    }, M = (T) => `<button type="button" class="kl-hcolor${w(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + // Tool hierarchy: Rectangle (the default) → Circle → Arrow → Text, then Pen / Line / Numbers.
      b("rect", "Rectangle", K("square", { size: 15 }), "r") + b("circle", "Circle", Vt('<circle cx="12" cy="12" r="9"/>'), "o") + b("arrow", "Arrow", Vt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + b("text", "Text", Vt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + b("pen", "Pen", K("pencil", { size: 15 }), "p") + b("line", "Line", Vt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + b("count", "Numbers", Vt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Black out numbers in your screenshots"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${K("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + b("pixelate", "Redact (pixelate)", Vt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + b("crop", "Crop", Vt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + M("#ef4444") + M("#f97316") + M("#16a34a") + M("#3b82f6") + M("#ffffff") + M("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Vt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Vt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${K("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Vt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Vt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function Vn() {
    Lt && (document.removeEventListener("keydown", Lt, { capture: !0 }), Lt = null);
  }
  function Ds() {
    const g = a.getElementById("klavity-hero-stage"), b = a.getElementById("klavity-hero-tools");
    b && (b.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${K("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Te(ih())}</span></div>`), Vn();
  }
  function Nl() {
    if (We != null && !(_[We] && Vr(_[We]) === "video") && (We = null), Se != null && !W[Se] && (Se = null), Se != null) {
      Pl(W[Se].dataUrl);
      return;
    }
    if (We != null) {
      Pl(_[We] ? he(_[We]) : void 0);
      return;
    }
    if (c.length === 0) {
      Pe = 0, Ds();
      return;
    }
    Pe >= c.length && (Pe = c.length - 1), Pe < 0 && (Pe = 0), zh(Pe);
  }
  let Sr = null;
  function Pl(g) {
    const b = a.getElementById("klavity-hero-stage"), w = a.getElementById("klavity-hero-tools");
    if (!b || !g) {
      Ds();
      return;
    }
    if (Vn(), w && (w.innerHTML = ""), b.innerHTML = "", Sr) {
      try {
        URL.revokeObjectURL(Sr);
      } catch {
      }
      Sr = null;
    }
    let M = g;
    const C = Se != null && W[Se] ? W[Se] : null;
    if (C && C.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        M = URL.createObjectURL(C.blob), Sr = M;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const F = g.split(",");
        if (F.length >= 2) {
          const D = F[0].match(/:(.*?);/), B = (D ? D[1] : "video/webm").split(";")[0], V = atob(F[1]);
          let q = V.length;
          const H = new Uint8Array(q);
          for (; q--; )
            H[q] = V.charCodeAt(q);
          const J = new Blob([H], { type: B });
          M = URL.createObjectURL(J), Sr = M;
        }
      } catch {
      }
    const T = document.createElement("div");
    T.className = "kl-hero-vwrap", T.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const L = document.createElement("video");
    L.src = M, L.controls = !0, L.setAttribute("playsinline", ""), L.preload = "metadata", L.className = "kl-hero-video", L.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const N = document.createElement("div");
    N.className = "kl-hero-verror", N.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const I = document.createElement("a");
    I.href = M || g, I.setAttribute("download", "recording.webm"), I.setAttribute("target", "_blank"), I.setAttribute("rel", "noopener"), I.textContent = "Download recording", I.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", N.innerHTML = "<span>This recording couldn’t play here.</span>", N.appendChild(I), T.appendChild(L), T.appendChild(N), b.appendChild(T), Oh(L, N);
  }
  function Oh(g, b) {
    let w = !1, M = null;
    g.addEventListener("loadedmetadata", () => {
      if (!isFinite(g.duration) || isNaN(g.duration) || g.duration <= 0) {
        w = !0;
        try {
          g.currentTime = 1e101;
        } catch {
        }
        M = setTimeout(() => {
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
        w = !1, M && clearTimeout(M);
        try {
          g.currentTime = 0;
        } catch {
        }
      }
    }), g.addEventListener("error", () => {
      if (w) {
        w = !1, M && clearTimeout(M);
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
  function Nh(g, b, w, M, C) {
    const T = c[g];
    if (!T) return;
    const L = new Image();
    L.onload = () => {
      var q, H;
      if (c[g] !== T) return;
      const N = document.createElement("canvas");
      N.width = Math.max(1, Math.round(M)), N.height = Math.max(1, Math.round(C));
      const I = N.getContext("2d");
      if (!I) return;
      I.drawImage(L, b, w, M, C, 0, 0, N.width, N.height);
      let F;
      try {
        F = N.toDataURL("image/png");
      } catch {
        return;
      }
      const D = ((q = ct[g]) == null ? void 0 : q.length) ?? 0, B = el(g);
      c[g] = F, p[g] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const V = (H = re[g]) == null ? void 0 : H.shapes;
      Array.isArray(V) && V.length ? re[g] = { w: N.width, h: N.height, shapes: gy(V, -b, -w) } : delete re[g], (ct[g] ?? (ct[g] = [])).push(B), (It[g] ?? (It[g] = [])).push({ snap: B, mark: D }), dn(g), Re(), Ph(T, F, L.naturalWidth, L.naturalHeight, b, w, N.width, N.height);
    }, L.src = T;
  }
  function Ph(g, b, w, M, C, T, L, N) {
    const F = ((V) => (V || []).map((q) => ({ x: Math.max(0, q.x - C), y: Math.max(0, q.y - T), w: Math.min(L, q.x - C + q.w) - Math.max(0, q.x - C), h: Math.min(N, q.y - T + q.h) - Math.max(0, q.y - T) })).filter((q) => q.w > 0 && q.h > 0))(cl(g, w, M));
    F.length && ht.set(b, F);
    const D = oe.get(g);
    if (!D) return;
    const B = new Image();
    B.onload = () => {
      const V = document.createElement("canvas");
      V.width = L, V.height = N;
      const q = V.getContext("2d");
      if (!q) return;
      q.drawImage(B, C, T, L, N, 0, 0, L, N);
      let H;
      try {
        H = V.toDataURL("image/png");
      } catch {
        return;
      }
      oe.set(b, H), Ne.set(H, b), F.length && ht.set(H, F);
    }, B.src = D;
  }
  function zh(g) {
    var I, F, D, B, V, q, H;
    const b = a.getElementById("klavity-hero-stage"), w = a.getElementById("klavity-hero-tools");
    if (!b || !w) return;
    const M = c[g];
    if (!M) {
      Ds();
      return;
    }
    Vn(), b.innerHTML = "";
    const C = document.createElement("canvas");
    C.width = 1, C.height = 1, C.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new ua(C, M), L = (I = re[g]) == null ? void 0 : I.shapes;
    Array.isArray(L) && L.forEach((J) => T.shapes.push({ ...J })), b.appendChild(C);
    const N = new Image();
    N.onload = () => {
      !document.body.contains(s) || Pe !== g || c[g] !== M || (C.width = N.naturalWidth || 1, C.height = N.naturalHeight || 1, T.redraw());
    }, N.src = M, T.redraw();
    {
      w.innerHTML = Ih((((F = It[g]) == null ? void 0 : F.length) ?? 0) > 0);
      const J = w.querySelector("#kl-hero-logo");
      J && (J.href = fy(n.projectId));
      let Q = "rect", pe = "#ef4444", Ve = 26, rt = "black", kt = null;
      const Er = w.querySelector("#kl-hero-textopts"), Ut = () => {
        T.shapes.length ? re[g] = { w: C.width, h: C.height, shapes: T.shapes.map((z) => ({ ...z })) } : delete re[g], dn(g);
      }, me = (z) => {
        Q = z, w.querySelectorAll("[data-tool]").forEach((j) => j.classList.toggle("kl-on", j.dataset.tool === z)), Er && (Er.hidden = z !== "text");
      }, Fe = w.querySelector(".kl-hcolor-custom"), Ie = w.querySelector(".kl-hcolor-input"), te = (z, j) => {
        pe = z, w.querySelectorAll("[data-color]").forEach((ie) => ie.classList.toggle("kl-on", ie === j)), Fe && Fe.classList.toggle("kl-on", Fe === j);
      };
      if (w.querySelectorAll("[data-tool]").forEach((z) => z.addEventListener("click", () => me(z.dataset.tool))), w.querySelectorAll("[data-color]").forEach((z) => z.addEventListener("click", () => te(z.dataset.color, z))), Fe && Ie) {
        Fe.addEventListener("click", () => Ie.click());
        const z = () => {
          Fe.style.background = Ie.value, te(Ie.value, Fe);
        };
        Ie.addEventListener("input", z), Ie.addEventListener("change", z);
      }
      const ce = w.querySelector(".kl-hmask-cb");
      ce && ce.addEventListener("change", () => {
        i = ce.checked, ll(dl());
      }), w.querySelectorAll("[data-outline]").forEach((z) => z.addEventListener("click", () => {
        rt = z.dataset.outline, w.querySelectorAll("[data-outline]").forEach((j) => j.classList.toggle("kl-on", j === z));
      })), w.querySelectorAll("[data-size]").forEach((z) => z.addEventListener("click", () => {
        Ve = Number(z.dataset.size), w.querySelectorAll("[data-size]").forEach((j) => j.classList.toggle("kl-on", j === z));
      })), w.querySelectorAll("[data-stroke]").forEach((z) => z.addEventListener("click", () => {
        T.strokeScale = Number(z.dataset.stroke) || 1, w.querySelectorAll("[data-stroke]").forEach((j) => j.classList.toggle("kl-on", j === z)), T.redraw();
      })), (D = w.querySelector("#kl-hero-undo")) == null || D.addEventListener("click", () => {
        rl(g);
      }), (B = w.querySelector("#kl-hero-revert")) == null || B.addEventListener("click", () => {
        th(g);
      }), (V = w.querySelector("#kl-hero-clear")) == null || V.addEventListener("click", () => {
        pn(g), T.clearAll(), Ut();
      }), me(Q), te(pe, w.querySelector("[data-color]"));
      const Ue = (z) => {
        const j = C.getBoundingClientRect(), ie = Math.min(j.width / C.width, j.height / C.height) || 1, ne = C.width * ie, se = C.height * ie, Qe = (j.width - ne) / 2, Tt = (j.height - se) / 2;
        return { x: (z.clientX - j.left - Qe) / ie, y: (z.clientY - j.top - Tt) / ie };
      }, ki = () => {
        const z = C.getBoundingClientRect();
        return Math.min(z.width / C.width, z.height / C.height) || 1;
      }, Uh = (z, j, ie, ne, se, Qe) => z === "line" ? { type: "line", color: Qe, x1: j, y1: ie, x2: ne, y2: se } : z === "arrow" ? { type: "arrow", color: Qe, x1: j, y1: ie, x2: ne, y2: se } : z === "rect" ? { type: "rect", color: Qe, x: Math.min(j, ne), y: Math.min(ie, se), w: Math.abs(ne - j), h: Math.abs(se - ie) } : z === "circle" ? { type: "circle", color: Qe, x: (j + ne) / 2, y: (ie + se) / 2, rx: Math.abs(ne - j) / 2, ry: Math.abs(se - ie) / 2 } : z === "pixelate" ? { type: "pixelate", x: Math.min(j, ne), y: Math.min(ie, se), w: Math.abs(ne - j), h: Math.abs(se - ie) } : null;
      let ft = 1, Cr = 0, Mr = 0, vi = null;
      const Bh = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), wi = cy(Bh), Fs = () => {
        if (vi) return vi;
        const z = C.style.transform;
        return C.style.transform = "", vi = C.getBoundingClientRect(), C.style.transform = z, vi;
      }, dt = document.createElement("div");
      dt.className = "kl-minimap", dt.hidden = !0, dt.setAttribute("role", "navigation"), dt.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Gn = document.createElement("img");
      Gn.className = "kl-minimap-img", Gn.alt = "", Gn.draggable = !1, Gn.src = M;
      const bn = document.createElement("div");
      bn.className = "kl-minimap-vp", dt.append(Gn, bn), b.appendChild(dt);
      const Bl = () => {
        const z = C.width, j = C.height;
        if (ft <= 1 || z < 2 || j < 2) {
          dt.hidden = !0;
          return;
        }
        const ie = Fs();
        if (!ie) {
          dt.hidden = !0;
          return;
        }
        const ne = 148, se = Math.min(ne / z, ne / j), Qe = Math.max(1, Math.round(z * se)), Tt = Math.max(1, Math.round(j * se));
        dt.style.width = Qe + "px", dt.style.height = Tt + "px";
        const ir = b.getBoundingClientRect(), fr = dy(
          { left: ir.left, top: ir.top, right: ir.right, bottom: ir.bottom },
          { left: ie.left, top: ie.top, width: ie.width, height: ie.height },
          { panX: Cr, panY: Mr },
          ft,
          z,
          j
        );
        bn.style.left = fr.x * se + "px", bn.style.top = fr.y * se + "px", bn.style.width = Math.max(3, fr.w * se) + "px", bn.style.height = Math.max(3, fr.h * se) + "px", dt.hidden = !1;
      }, Xn = () => {
        if (ft === 1) {
          Cr = 0, Mr = 0, C.style.transform = "", C.style.cursor = "crosshair", Bl();
          return;
        }
        C.style.transformOrigin = "0 0", C.style.transform = `translate(${Cr}px,${Mr}px) scale(${ft})`, C.style.cursor = "grab", Bl();
      }, xi = (z, j, ie) => {
        const ne = Fs();
        if (!ne) return;
        const se = ft;
        if (ft = ay(ft * ie), ft === se) return;
        const Qe = uy(z, j, { left: ne.left, top: ne.top, width: ne.width, height: ne.height }, se, ft, { panX: Cr, panY: Mr });
        Cr = Qe.panX, Mr = Qe.panY, C.style.transition = wi, Xn();
      }, Us = () => {
        const z = b.getBoundingClientRect();
        return { cx: z.left + z.width / 2, cy: z.top + z.height / 2 };
      }, qh = () => {
        ft = 1, C.style.transition = wi, Xn();
      };
      (q = w.querySelector("#kl-hero-zoomin")) == null || q.addEventListener("click", () => {
        const { cx: z, cy: j } = Us();
        xi(z, j, 1.25);
      }), (H = w.querySelector("#kl-hero-zoomout")) == null || H.addEventListener("click", () => {
        const { cx: z, cy: j } = Us();
        xi(z, j, 0.8);
      });
      const jh = (z, j) => {
        const ie = Fs();
        if (!ie) return;
        const ne = b.getBoundingClientRect(), se = hy(z, j, { left: ne.left, top: ne.top, right: ne.right, bottom: ne.bottom }, { left: ie.left, top: ie.top, width: ie.width, height: ie.height }, ft, C.width);
        Cr = se.panX, Mr = se.panY, C.style.transition = wi, Xn();
      };
      let Si = !1;
      const ql = (z, j) => {
        const ie = dt.getBoundingClientRect(), { ix: ne, iy: se } = py(z - ie.left, j - ie.top, ie.width, ie.height, C.width, C.height);
        jh(ne, se);
      };
      dt.addEventListener("pointerdown", (z) => {
        Si = !0;
        try {
          dt.setPointerCapture(z.pointerId);
        } catch {
        }
        ql(z.clientX, z.clientY), z.preventDefault(), z.stopPropagation();
      }), dt.addEventListener("pointermove", (z) => {
        Si && (ql(z.clientX, z.clientY), z.preventDefault());
      });
      const jl = (z) => {
        if (Si) {
          Si = !1;
          try {
            dt.releasePointerCapture(z.pointerId);
          } catch {
          }
        }
      };
      dt.addEventListener("pointerup", jl), dt.addEventListener("pointercancel", jl), b.addEventListener("wheel", (z) => {
        Q !== "crop" && (z.preventDefault(), xi(z.clientX, z.clientY, ly(z.deltaY)));
      }, { passive: !1 }), b.addEventListener("dblclick", () => {
        ft = 1, C.style.transition = wi, Xn();
      });
      let Wh = T.shapes.reduce((z, j) => j.type === "count" ? Math.max(z, j.n) : z, 0), Rr = !1, vt = 0, wt = 0, Yr = [], kn = !1, Wl = 0, Hl = 0, Yl = 0, Vl = 0, Rt = null, Kn = { x: 0, y: 0 }, mt = null;
      const Hh = () => Math.max(14, T.computeFontSize() * 0.6), Gl = (z, j) => {
        for (let ie = T.shapes.length - 1; ie >= 0; ie--) {
          const ne = T.shapes[ie];
          if (ne.type !== "text") continue;
          const se = T.textBounds(ne);
          if (!se) continue;
          const Qe = Hh();
          if (z >= se.x + se.w - Qe && z <= se.x + se.w + Qe && j >= se.y + se.h - Qe && j <= se.y + se.h + Qe)
            return { shape: ne, mode: "resize" };
          const Tt = 6;
          if (z >= se.x - Tt && z <= se.x + se.w + Tt && j >= se.y - Tt && j <= se.y + se.h + Tt)
            return { shape: ne, mode: "move" };
        }
        return null;
      };
      C.addEventListener("pointerdown", (z) => {
        if (z.shiftKey && ft > 1) {
          kn = !0, Wl = z.clientX, Hl = z.clientY, Yl = Cr, Vl = Mr, C.style.transition = "none", C.style.cursor = "grabbing";
          try {
            C.setPointerCapture(z.pointerId);
          } catch {
          }
          z.preventDefault();
          return;
        }
        const j = Ue(z);
        if (vt = j.x, wt = j.y, Q === "crop") {
          Rr = !0;
          try {
            C.setPointerCapture(z.pointerId);
          } catch {
          }
          Kn = { x: z.clientX, y: z.clientY }, Rt = document.createElement("div"), Rt.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", b.appendChild(Rt);
          return;
        }
        if (Q === "text") {
          const ie = Gl(j.x, j.y);
          if (ie) {
            pn(g), mt = { shape: ie.shape, mode: ie.mode, grabX: j.x, grabY: j.y, origX: ie.shape.x, origY: ie.shape.y, origSize: ie.shape.size ?? T.computeFontSize() };
            try {
              C.setPointerCapture(z.pointerId);
            } catch {
            }
            C.style.cursor = ie.mode === "resize" ? "nwse-resize" : "move", z.preventDefault();
            return;
          }
          const ne = document.createElement("input"), se = rt === "none" ? "none" : `0 0 2px ${rt}, 0 0 2px ${rt}`, Qe = ki(), Tt = Math.max(6, Ve * Qe), ir = Ve, fr = rt;
          ne.style.cssText = `position:fixed;left:${z.clientX}px;top:${z.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${pe};font-size:${Tt}px;font-family:sans-serif;font-weight:700;text-shadow:${se};outline:1px dashed ${pe};z-index:2147483647;min-width:80px;`, document.body.appendChild(ne), kt = ne, requestAnimationFrame(() => {
            document.body.contains(ne) && ne.focus();
          }), ne.addEventListener("blur", () => {
            kt = null, ne.value.trim() && (pn(g), T.addShape({ type: "text", color: pe, x: vt, y: wt, text: ne.value.trim(), size: ir, outline: fr }), Ut()), nt(ne);
          }, { once: !0 }), ne.addEventListener("keydown", (vn) => {
            vn.key === "Enter" && ne.blur(), vn.key === "Escape" && (ne.value = "", ne.blur()), vn.stopPropagation();
          });
          return;
        }
        if (Q === "count") {
          pn(g), T.addShape({ type: "count", color: pe, x: j.x, y: j.y, n: ++Wh }), Ut();
          return;
        }
        Rr = !0;
        try {
          C.setPointerCapture(z.pointerId);
        } catch {
        }
        Q === "pen" && (Yr = [j]);
      }), C.addEventListener("pointermove", (z) => {
        if (kn) {
          C.style.transition = "none", Cr = Yl + (z.clientX - Wl), Mr = Vl + (z.clientY - Hl), Xn(), C.style.cursor = "grabbing";
          return;
        }
        if (mt) {
          const ne = Ue(z);
          mt.mode === "move" ? (mt.shape.x = mt.origX + (ne.x - mt.grabX), mt.shape.y = mt.origY + (ne.y - mt.grabY)) : mt.shape.size = Math.max(10, Math.min(240, mt.origSize + (ne.y - mt.grabY))), T.redraw();
          return;
        }
        if (Q === "text" && !Rr) {
          const ne = Ue(z), se = Gl(ne.x, ne.y);
          C.style.cursor = se ? se.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Rr) return;
        if (Q === "pen") {
          Yr.push(Ue(z)), Yr.length > 1 && T.drawPreview({ type: "pen", color: pe, points: Yr });
          return;
        }
        if (Q === "crop" && Rt) {
          const ne = b.getBoundingClientRect(), se = Math.min(Kn.x, z.clientX), Qe = Math.min(Kn.y, z.clientY), Tt = Math.max(Kn.x, z.clientX), ir = Math.max(Kn.y, z.clientY);
          Rt.style.left = se - ne.left + "px", Rt.style.top = Qe - ne.top + "px", Rt.style.width = Tt - se + "px", Rt.style.height = ir - Qe + "px";
          return;
        }
        const j = Ue(z), ie = Uh(Q, vt, wt, j.x, j.y, pe);
        ie && T.drawPreview(ie);
      }), C.addEventListener("pointerup", (z) => {
        if (kn) {
          kn = !1, C.style.cursor = ft > 1 ? "grab" : "crosshair";
          try {
            C.releasePointerCapture(z.pointerId);
          } catch {
          }
          return;
        }
        if (mt) {
          mt = null;
          try {
            C.releasePointerCapture(z.pointerId);
          } catch {
          }
          C.style.cursor = "crosshair", T.redraw(), Ut();
          return;
        }
        if (!Rr) return;
        Rr = !1;
        try {
          C.releasePointerCapture(z.pointerId);
        } catch {
        }
        const j = Ue(z);
        if (Q === "crop") {
          Rt && (nt(Rt), Rt = null);
          const Tt = Math.max(0, Math.min(vt, j.x)), ir = Math.max(0, Math.min(wt, j.y)), fr = Math.abs(j.x - vt), vn = Math.abs(j.y - wt);
          fr > 4 && vn > 4 && Nh(g, Tt, ir, fr, vn);
          return;
        }
        const ie = Q === "pixelate" && Math.abs(j.x - vt) > 4 && Math.abs(j.y - wt) > 4, ne = Math.abs(j.x - vt) > 3 || Math.abs(j.y - wt) > 3, se = (Q === "line" || Q === "rect" || Q === "circle" || Q === "arrow") && ne;
        (Q === "pen" && Yr.length > 1 || se || ie) && pn(g), Q === "pen" && Yr.length > 1 ? T.addShape({ type: "pen", color: pe, points: Yr }) : se && Q === "line" ? T.addShape({ type: "line", color: pe, x1: vt, y1: wt, x2: j.x, y2: j.y }) : se && Q === "rect" ? T.addShape({ type: "rect", color: pe, x: Math.min(vt, j.x), y: Math.min(wt, j.y), w: Math.abs(j.x - vt), h: Math.abs(j.y - wt) }) : se && Q === "circle" ? T.addShape({ type: "circle", color: pe, x: (vt + j.x) / 2, y: (wt + j.y) / 2, rx: Math.abs(j.x - vt) / 2, ry: Math.abs(j.y - wt) / 2 }) : se && Q === "arrow" ? T.addShape({ type: "arrow", color: pe, x1: vt, y1: wt, x2: j.x, y2: j.y }) : ie && T.addShape({ type: "pixelate", x: Math.min(vt, j.x), y: Math.min(wt, j.y), w: Math.abs(j.x - vt), h: Math.abs(j.y - wt) }), Ut();
      }), C.addEventListener("pointercancel", (z) => {
        try {
          C.releasePointerCapture(z.pointerId);
        } catch {
        }
        Rt && (nt(Rt), Rt = null), kn && (kn = !1, C.style.cursor = ft > 1 ? "grab" : "crosshair"), mt && (mt = null, C.style.cursor = "crosshair", T.redraw(), Ut()), Rr && (Rr = !1, T.redraw());
      });
      const Xl = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      Lt = (z) => {
        if (!document.body.contains(s)) {
          Vn();
          return;
        }
        if (kt && document.body.contains(kt)) return;
        const j = typeof z.composedPath == "function" && z.composedPath()[0] || z.target;
        if (j && (j.tagName === "INPUT" || j.tagName === "TEXTAREA" || j.tagName === "SELECT" || j.isContentEditable)) return;
        if ((z.metaKey || z.ctrlKey) && z.key.toLowerCase() === "z") {
          z.preventDefault(), rl(g);
          return;
        }
        if (z.metaKey || z.ctrlKey || z.altKey) return;
        const ie = z.key.toLowerCase();
        if (ie === "z") {
          if (z.preventDefault(), ft > 1) qh();
          else {
            const { cx: ne, cy: se } = Us();
            xi(ne, se, 2);
          }
          return;
        }
        Xl[ie] && (z.preventDefault(), me(Xl[ie]));
      }, document.addEventListener("keydown", Lt, { capture: !0 });
    }
  }
  function $h(g) {
    const b = c[g], w = new Image();
    w.onload = () => {
      const M = document.createElement("canvas");
      M.width = w.naturalWidth, M.height = w.naturalHeight;
      const C = new ua(M, b);
      C.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const L = document.createElement("div");
      L.className = "kl-edtb", L.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", L.innerHTML = `
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("pencil", { size: 14 })} Pen</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${K("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("x", { size: 14 })}</button>
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const N = document.createElement("div");
      N.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", N.appendChild(M);
      const I = document.createElement("style");
      I.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(I, L, N), a.appendChild(T), Vn();
      let F = 1;
      const D = (te) => Math.max(0.05, Math.min(5, te || 1));
      function B(te) {
        F = D(te), M.style.width = Math.round(M.width * F) + "px", M.style.height = Math.round(M.height * F) + "px";
        const ce = L.querySelector("#klavity-zoom-pct");
        ce && (ce.textContent = Math.round(F * 100) + "%");
      }
      const V = () => Math.max(1, N.clientWidth - 24) / M.width, q = () => Math.min(Math.max(1, N.clientWidth - 24) / M.width, Math.max(1, N.clientHeight - 24) / M.height), H = M.height / M.width > Math.max(1, N.clientHeight) / Math.max(1, N.clientWidth);
      B(H ? V() : q()), L.querySelector("#klavity-zoom-in").addEventListener("click", () => B(F * 1.25)), L.querySelector("#klavity-zoom-out").addEventListener("click", () => B(F / 1.25)), L.querySelector("#klavity-fit-width").addEventListener("click", () => B(V())), L.querySelector("#klavity-fit-page").addEventListener("click", () => B(q()));
      let J = "rect", Q = "#ef4444", pe = !1, Ve = [], rt = 0, kt = 0;
      function Er(te) {
        J = te, L.querySelectorAll("[data-tool]").forEach((ce) => {
          const Ue = ce.dataset.tool === te;
          ce.style.background = Ue ? "#585b70" : "#313244", ce.style.outline = Ue ? "2px solid #89b4fa" : "none";
        });
      }
      L.querySelectorAll("[data-tool]").forEach((te) => te.addEventListener("click", () => Er(te.dataset.tool))), L.querySelectorAll("[data-color]").forEach((te) => te.addEventListener("click", () => {
        Q = te.dataset.color;
      }));
      {
        const te = L.querySelector("#klavity-color-custom"), ce = L.querySelector("#klavity-color-input");
        if (te && ce) {
          te.addEventListener("click", () => ce.click());
          const Ue = () => {
            te.style.background = ce.value, Q = ce.value;
          };
          ce.addEventListener("input", Ue), ce.addEventListener("change", Ue);
        }
      }
      L.querySelector("#klavity-undo").addEventListener("click", () => C.undo()), L.querySelector("#klavity-clear-ann").addEventListener("click", () => C.clearAll());
      const Ut = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function me(te) {
        const ce = te.target;
        if (ce && (ce.tagName === "INPUT" || ce.tagName === "TEXTAREA" || ce.isContentEditable)) return;
        if (te.key === "Escape") {
          te.stopPropagation(), Fe();
          return;
        }
        if ((te.metaKey || te.ctrlKey) && te.key.toLowerCase() === "z") {
          te.preventDefault(), C.undo();
          return;
        }
        if (te.metaKey || te.ctrlKey || te.altKey) return;
        const Ue = te.key.toLowerCase();
        Ut[Ue] ? (te.preventDefault(), Er(Ut[Ue])) : Ue === "u" && (te.preventDefault(), C.undo());
      }
      function Fe() {
        document.removeEventListener("keydown", me, { capture: !0 }), nt(T), Nl();
      }
      document.addEventListener("keydown", me, { capture: !0 }), Er(J), L.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        pn(g), C.shapes.length ? re[g] = { w: M.width, h: M.height, shapes: C.shapes.map((te) => ({ ...te })) } : delete re[g], dn(g), Fe(), Re();
      }), L.querySelector("#klavity-cancel-ann").addEventListener("click", () => Fe());
      function Ie(te) {
        const ce = M.getBoundingClientRect();
        return { x: (te.clientX - ce.left) / ce.width * M.width, y: (te.clientY - ce.top) / ce.height * M.height };
      }
      M.addEventListener("pointerdown", (te) => {
        pe = !0;
        const ce = Ie(te);
        if ({ x: rt, y: kt } = ce, J === "pen" && (Ve = [ce]), J === "text") {
          pe = !1;
          const Ue = document.createElement("input");
          Ue.style.cssText = `position:fixed;left:${te.clientX}px;top:${te.clientY}px;background:transparent;border:1px dashed ${Q};color:${Q};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Ue), requestAnimationFrame(() => {
            document.body.contains(Ue) && Ue.focus();
          }), Ue.addEventListener("blur", () => {
            Ue.value.trim() && C.addShape({ type: "text", color: Q, x: rt, y: kt, text: Ue.value.trim() }), nt(Ue);
          }, { once: !0 }), Ue.addEventListener("keydown", (ki) => {
            ki.key === "Enter" && Ue.blur(), ki.stopPropagation();
          });
        }
      }), M.addEventListener("pointermove", (te) => {
        pe && J === "pen" && Ve.push(Ie(te));
      }), M.addEventListener("pointerup", (te) => {
        if (!pe) return;
        pe = !1;
        const ce = Ie(te);
        J === "pen" && Ve.length > 1 ? C.addShape({ type: "pen", color: Q, points: Ve }) : J === "rect" ? C.addShape({ type: "rect", color: Q, x: Math.min(rt, ce.x), y: Math.min(kt, ce.y), w: Math.abs(ce.x - rt), h: Math.abs(ce.y - kt) }) : J === "circle" ? C.addShape({ type: "circle", color: Q, x: (rt + ce.x) / 2, y: (kt + ce.y) / 2, rx: Math.abs(ce.x - rt) / 2, ry: Math.abs(ce.y - kt) / 2 }) : J === "arrow" && C.addShape({ type: "arrow", color: Q, x1: rt, y1: kt, x2: ce.x, y2: ce.y });
      });
    }, w.src = b;
  }
  function Dh(g, b) {
    const w = document.createElement("div");
    w.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const M = document.createElement("div");
    M.className = "klavity-sent";
    const C = document.createElement("div");
    C.className = "kl-sent-check", C.innerHTML = K("check", { label: "Sent", size: 22 }), M.appendChild(C);
    const T = document.createElement("h2");
    T.textContent = "Report sent", M.appendChild(T);
    const L = document.createElement("p");
    if (L.textContent = n.thankYou || "We filed it and emailed you a copy.", M.appendChild(L), g) {
      const N = document.createElement("div");
      N.className = "klavity-ref";
      const I = document.createElement("span");
      I.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = Ks(g, b), N.append(I, F);
      const D = Js(b);
      if (D) {
        const B = document.createElement("a");
        B.href = D, B.target = "_blank", B.rel = "noopener", B.textContent = "Open in Klavity", N.appendChild(B);
      }
      M.appendChild(N);
    }
    w.appendChild(M), nt(Dr), a.appendChild(w), bl(M, Un);
  }
  function Fh(g, b, w) {
    const { copy: M, onLead: C } = w;
    le.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const L = document.createElement("h2");
    if (L.innerHTML = M.headline, T.appendChild(L), M.body) {
      const I = document.createElement("p");
      I.textContent = M.body, T.appendChild(I);
    }
    if (g) {
      const I = document.createElement("div");
      I.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const D = document.createElement("code");
      D.textContent = Ks(g, b), I.append(F, D);
      const B = Js(b);
      if (B) {
        const V = document.createElement("a");
        V.href = B, V.target = "_blank", V.rel = "noopener", V.textContent = "Open in Klavity", I.appendChild(V);
      }
      T.appendChild(I);
    }
    const N = () => bl(le, Qp);
    if (M.showEmail) {
      const I = document.createElement("div");
      I.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const D = document.createElement("button"), B = M.emailLabel;
      D.textContent = B;
      const V = document.createElement("div");
      V.className = "klavity-lead-err", V.setAttribute("role", "alert"), V.style.display = "none";
      const q = async () => {
        const H = F.value.trim();
        if (!H || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(H)) {
          V.textContent = "Please enter a valid email so we can reach you.", V.style.display = "block", F.focus();
          return;
        }
        D.disabled = !0, D.textContent = "Saving…", V.style.display = "none";
        try {
          C && await C(g, H);
        } catch (Q) {
          try {
            console.warn("[Klavity] lead capture failed:", (Q == null ? void 0 : Q.message) || Q);
          } catch {
          }
          V.textContent = "Couldn't save your email — please try again.", V.style.display = "block", D.disabled = !1, D.textContent = "Retry", F.focus();
          return;
        }
        const J = document.createElement("div");
        J.className = "klavity-thanks", J.textContent = "Thanks — we'll be in touch.", nt(V), I.replaceWith(J), M.showCta || N();
      };
      D.addEventListener("click", q), F.addEventListener("keydown", (H) => {
        H.key === "Enter" && q();
      }), I.append(F, D), T.appendChild(I), T.appendChild(V);
    }
    if (M.showCta && M.ctaUrl) {
      const I = document.createElement("a");
      I.className = "klavity-cta", I.href = M.ctaUrl, I.target = "_blank", I.rel = "noopener", I.textContent = M.ctaText, T.appendChild(I);
    }
    if (le.appendChild(T), !n.whiteLabel) {
      const I = document.createElement("div");
      I.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = Id("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", I.append("Powered by ", F), le.appendChild(I);
    }
    !M.showEmail && !M.showCta && N();
  }
  if (W.length && (Se = W.length - 1, fn()), _.length) {
    if (Se == null) {
      for (let g = _.length - 1; g >= 0; g--)
        if (Vr(_[g]) === "video") {
          We = g;
          break;
        }
    }
    mi(), Re();
  }
  if (t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const b = g <= A;
    if (b || yc(t) === "screen") {
      if (l = !0, Re(), yc(t) === "screen")
        return (async () => {
          const C = await zs({ viewport: !0, onOpen: !0 });
          if (C.ok) {
            l = !1, Re();
            return;
          }
          if (C.declined) {
            l = !1, pr({ immediate: !0, reason: "discard" });
            return;
          }
          if (c.length) {
            l = !1, Re();
            return;
          }
          if (!b) {
            y = !0, l = !1, Re();
            return;
          }
          if (l = !0, Re(), t.onCaptureViewport) {
            Ll(null).catch(() => {
              l = !1, Re();
            });
            return;
          }
          t.onCaptureFull().then((T) => {
            const { dataUrl: L, quality: N, suggestSharp: I, blank: F } = Gt(T);
            if (l = !1, F && c.length === 0) {
              Es();
              return;
            }
            Dt(L, N, void 0, !0, !!I), nr(Hr);
          }).catch(() => {
            l = !1, Re();
          });
        })(), ol;
      const w = () => {
        if (t.onCaptureViewport) {
          Ll(null).catch(() => {
            l = !1, Re();
          });
          return;
        }
        t.onCaptureFull().then((C) => {
          const { dataUrl: T, quality: L, suggestSharp: N, blank: I } = Gt(C);
          if (l = !1, I && c.length === 0) {
            Es();
            return;
          }
          Dt(T, L, void 0, !0, !!N), nr(Hr);
        }).catch(() => {
          l = !1, Re();
        });
      }, M = window.requestIdleCallback;
      typeof M == "function" ? M(() => w(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(w, 0));
    } else
      y = !0, Re();
  }
  return ol;
}
function Py(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), nt(r), nt(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    a = !0, i = p.clientX, s = p.clientY, nt(n);
  }), r.addEventListener("pointermove", (p) => {
    if (!a) return;
    const o = Math.min(p.clientX, i), h = Math.min(p.clientY, s), u = Math.abs(p.clientX - i), d = Math.abs(p.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${o}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o + u}px 0/calc(100% - ${o + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px 0/${u}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${o}px ${h + d}px/${u}px calc(100% - ${h + d}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!a) return;
    a = !1;
    const o = Math.abs(p.clientX - i), h = Math.abs(p.clientY - s);
    if (o < 8 || h < 8) {
      c(), t();
      return;
    }
    const u = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, s), w: o, h };
    c(), e(u);
  });
}
const zy = 2e4;
async function bc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), zy);
        })
      ]);
      return kc(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return kc(e);
}
const $y = 3e4;
function kc(e) {
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
    }, $y), a = (c) => {
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
const Dy = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Fy(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Uy(e) {
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
const By = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Gr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function qy(e) {
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
  } = e, o = Gr(e.initials || Fy(t)), h = i !== "none" ? Dy[i] : null, u = h ? `<span class="ksim-mark ${l ? By[h.mark] : ""}" style="color:${Gr(h.accent)}">${Uy(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Gr(r)}" alt="${Gr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), E = `--ksim-persona:${Gr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${Gr(h.accent)};` : "");
  return `<span class="${y}" style="${E}" data-emotion="${i}" title="${Gr(t)}">${u}${m}${f}</span>`;
}
function jy(e) {
  const t = document.createElement("template");
  return t.innerHTML = qy(e).trim(), t.content.firstElementChild;
}
const Wy = `
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
function Hy(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Wy, t.appendChild(r);
}
function fa(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let p = 0; p < c.length; p++) l[p] = c.charCodeAt(p);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function Yy(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function Vy(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? fa(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.fileRefs && e.fileRefs.length && t.set("file_refs", JSON.stringify(e.fileRefs)), e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", fa(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return Yy(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function Gy(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function Xy(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = t.connectionMode === "klavity" && !!t.klavToken, { inline: p, refs: o } = await ny(e.files, Qg(t.backendUrl, { token: l ? t.klavToken : void 0 }), { projectId: a }), h = [...e.fileRefs || [], ...o], u = Vy({
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
    files: p.length ? p : void 0,
    fileRefs: h,
    recordings: e.recordings,
    annotations: e.annotations
  });
  await Gy(u), e.reporterEmail && u.set("reporter_email", e.reporterEmail);
  const d = t.connectionMode === "klavity" && !!t.klavToken;
  if (!d) {
    const { plane: E } = t;
    u.append("plane_token", E.token), u.append("plane_workspace", E.workspace), u.append("plane_project_id", E.projectId), u.append("plane_host", E.host);
  }
  for (let E = 0; E < s.length; E++) {
    const v = await (await fetch(s[E])).blob();
    u.append("screenshots", v, `screenshot-${E}.png`);
  }
  if (e.screenshotThumbs)
    for (const E of e.screenshotThumbs)
      try {
        u.append("screenshot_thumbs", fa(E), "thumb.jpg");
      } catch {
      }
  const m = d ? { Authorization: `Bearer ${t.klavToken}` } : {}, f = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: m, body: u });
  if (!f.ok) throw new Error(`Klavity backend error ${f.status}: ${await f.text()}`);
  const y = await f.json();
  return {
    issueKey: y.jira_key ?? y.id,
    issueUrl: y.issue_url ?? t.backendUrl
  };
}
const Ky = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Jy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Zy(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Jy + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Qy(e) {
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
function eb(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function Zs(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Qy(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = eb(n);
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
function sr(e, t) {
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
function vc(e, t = 0) {
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
function wc(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function tb(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = sr(e, 0);
  if (!r) return e;
  const n = sr(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = sr(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const a = sr(e, i + s.width);
  if (!a) return e;
  const c = i + s.width + a.width;
  let l = c;
  const p = a.width === 8 && a.value === 72057594037927940, o = p ? e.length : Math.min(e.length, c + a.value);
  let h = -1, u = null, d = 0;
  for (; l < o; ) {
    const X = sr(e, l);
    if (!X) break;
    const W = sr(e, l + X.width);
    if (!W) break;
    if (X.rawId === 357149030) {
      h = l, u = W, d = X.width + W.width;
      break;
    }
    if (X.rawId === 524531317) break;
    l += X.width + W.width + W.value;
  }
  if (h === -1 || !u) return e;
  const m = h + d, f = m + u.value;
  let y = m, E = 1e6, v = -1, k = 0, A = 0, S = !1;
  for (; y < f; ) {
    const X = sr(e, y);
    if (!X) break;
    const W = sr(e, y + X.width);
    if (!W) break;
    const Be = y + X.width + W.width, ue = Be + W.value;
    if (X.rawId === 2807729) {
      S = !0;
      let re = 0;
      for (let tt = 0; tt < W.value; tt++)
        re = re * 256 + e[Be + tt];
      re > 0 && (E = re);
    } else X.rawId === 17545 && (v = y, k = ue - y, A = W.value);
    y = ue;
  }
  const x = t * 1e6 / E;
  if (v !== -1 && A === 8) {
    const X = sr(e, v);
    if (X) {
      const W = sr(e, v + X.width);
      if (W && W.value === 8) {
        const Be = v + X.width + W.width, ue = new Uint8Array(e);
        return ue.set(wc(x), Be), ue;
      }
    }
  }
  const R = new Uint8Array(11);
  R[0] = 68, R[1] = 137, R[2] = 136, R.set(wc(x), 3);
  let O = null;
  S || (O = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let $;
  if (v === -1) {
    const X = e.subarray(m, f), W = R.length + (O ? O.length : 0);
    $ = new Uint8Array(X.length + W);
    let Be = 0;
    O && ($.set(O, Be), Be += O.length), $.set(X, Be), Be += X.length, $.set(R, Be);
  } else {
    const X = e.subarray(m, v), W = e.subarray(v + k, f), Be = R.length + (O ? O.length : 0);
    $ = new Uint8Array(X.length + Be + W.length);
    let ue = 0;
    O && ($.set(O, ue), ue += O.length), $.set(X, ue), ue += X.length, $.set(R, ue), ue += R.length, $.set(W, ue);
  }
  const P = vc($.length), ee = new Uint8Array(4 + P.length);
  ee[0] = 21, ee[1] = 73, ee[2] = 169, ee[3] = 102, ee.set(P, 4);
  const Y = new Uint8Array(ee.length + $.length);
  Y.set(ee, 0), Y.set($, ee.length);
  const _ = d + u.value, Oe = Y.length - _;
  let je = null;
  p || (je = vc(a.value + Oe, a.width));
  const fe = e.subarray(0, i + s.width), he = je || e.subarray(i + s.width, c), Ae = e.subarray(c, h), ze = Y, Le = e.subarray(h + _), ve = fe.length + he.length + Ae.length + ze.length + Le.length, Ze = new Uint8Array(ve);
  let U = 0;
  return Ze.set(fe, U), U += fe.length, Ze.set(he, U), U += he.length, Ze.set(Ae, U), U += Ae.length, Ze.set(ze, U), U += ze.length, Ze.set(Le, U), U += Le.length, Ze;
}
function rb(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function nb(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await rb(e)), n = tb(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const ib = 180 * 1e3, sb = 50 * 1024 * 1024, ob = 1e6, ab = 96e3, lb = 15, xc = 1280, $d = {
  maxDurationMs: ib,
  maxBytes: sb
}, cb = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function Ra() {
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
function ub(e, t = cb) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Dd(e = Ra()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function db() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function pb(e = {}, t = Ra()) {
  var v, k, A, S, x, R, O, $, P, ee, Y, _, Oe, je, fe, he, Ae, ze, Le, ve, Ze;
  const r = { ...$d, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? lb)), a = ub(
    (v = t.MediaRecorder) != null && v.isTypeSupported ? (U) => t.MediaRecorder.isTypeSupported(U) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = db(), l = t.createElement("canvas"), p = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0, o.autoplay = !0;
  try {
    (k = o.setAttribute) == null || k.call(o, "playsinline", ""), (A = o.setAttribute) == null || A.call(o, "autoplay", ""), (S = o.setAttribute) == null || S.call(o, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (x = h.setAttribute) == null || x.call(h, "playsinline", ""), (R = h.setAttribute) == null || R.call(h, "autoplay", ""), (O = h.setAttribute) == null || O.call(h, "muted", "");
  } catch {
  }
  let u = "idle";
  const d = (U) => {
    var X;
    u = U;
    try {
      (X = e.onState) == null || X.call(e, U);
    } catch {
    }
  };
  let m = null;
  if (e.focusCapturedSurface)
    try {
      const U = globalThis.CaptureController;
      typeof U == "function" && (m = new U(), ($ = m.setFocusBehavior) == null || $.call(m, "focus-captured-surface"));
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
  const E = () => {
    var U;
    for (const X of [f, y])
      try {
        (U = X == null ? void 0 : X.getTracks) == null || U.call(X).forEach((W) => {
          var Be;
          return (Be = W.stop) == null ? void 0 : Be.call(W);
        });
      } catch {
      }
  };
  try {
    let U = function() {
      if (!$t) {
        $t = !0;
        try {
          Lt.state !== "inactive" && Lt.stop();
        } catch {
        }
      }
    };
    const X = (P = f.getVideoTracks) == null ? void 0 : P.call(f)[0], W = ((ee = X == null ? void 0 : X.getSettings) == null ? void 0 : ee.call(X)) ?? {}, Be = W.width && W.height ? W.width / W.height : 16 / 9;
    l.width = xc, l.height = Math.round(xc / Be);
    let ue = null, re = !1, tt = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((Y = y.getVideoTracks) != null && Y.call(y).length)) {
          re = !0, tt = !1;
          try {
            h.srcObject = y, await (((_ = h.play) == null ? void 0 : _.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ue = ((Oe = y.getAudioTracks) == null ? void 0 : Oe.call(y)[0]) || null, ue && (tt = !1));
      } catch (ae) {
        let Me = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ue = ((je = y.getAudioTracks) == null ? void 0 : je.call(y)[0]) || null, ue) {
              tt = !1, Me = !0;
              try {
                (fe = e.onFallback) == null || fe.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!Me) {
          try {
            (he = e.onFallback) == null || he.call(e, (ae == null ? void 0 : ae.name) === "NotAllowedError" ? "permissions-policy" : (ae == null ? void 0 : ae.name) || "camera-mic-blocked");
          } catch {
          }
          tt = !0;
        }
      }
    const ht = !!ue;
    if (re)
      try {
        o.srcObject = f, await (((Ae = o.play) == null ? void 0 : Ae.call(o)) ?? Promise.resolve());
      } catch {
      }
    let oe = 0, Ne = 0;
    const we = () => {
      if (!p) return;
      const ae = l.width, Me = l.height;
      if (o.videoWidth) {
        const De = o.videoWidth, st = o.videoHeight, Je = De / st, Mt = ae / Me;
        let Ye = ae, cn = Me, un = 0, Un = 0;
        Je > Mt ? (cn = ae / Je, Un = (Me - cn) / 2) : (Ye = Me * Je, un = (ae - Ye) / 2), (un > 0 || Un > 0) && (p.fillStyle = "#000", p.fillRect(0, 0, ae, Me)), p.drawImage(o, un, Un, Ye, cn);
      }
      if (re && h.videoWidth) {
        const De = Math.round(ae * 0.22), st = Math.round(De * (h.videoHeight / h.videoWidth)), Je = ae - De - 20, Mt = Me - st - 20;
        p.drawImage(h, Je, Mt, De, st), p.strokeStyle = "#7c3aed", p.lineWidth = 2, p.strokeRect(Je, Mt, De, st);
      }
      u === "recording" && (p.fillStyle = "#e11", p.beginPath(), p.arc(24, 24, 7, 0, Math.PI * 2), p.fill());
    };
    if (re) {
      let ae = 0;
      const Me = Math.floor(1e3 / s), De = () => {
        ae = t.now(), we();
      }, st = () => {
        oe = t.raf(st), De();
      };
      st(), Ne = t.setInterval(() => {
        var Je;
        if (o.paused && !(X != null && X.muted))
          try {
            (Je = o.play) == null || Je.call(o);
          } catch {
          }
        t.now() - ae >= Me && De();
      }, Math.max(16, Me));
    }
    const de = [];
    let Ke = null;
    if (re) {
      try {
        Ke = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const ae = (ze = Ke == null ? void 0 : Ke.getVideoTracks) == null ? void 0 : ze.call(Ke)[0];
      ae ? de.push(ae) : X && de.push(X);
    } else X && de.push(X);
    ue && de.push(ue);
    const ge = new t.MediaStream(de);
    try {
      (Le = X == null ? void 0 : X.addEventListener) == null || Le.call(X, "ended", () => U()), (ve = X == null ? void 0 : X.addEventListener) == null || ve.call(X, "mute", () => {
      }), (Ze = X == null ? void 0 : X.addEventListener) == null || Ze.call(X, "unmute", () => {
        var ae;
        if (re) {
          try {
            (ae = o.play) == null || ae.call(o);
          } catch {
          }
          we();
        }
      });
    } catch {
    }
    const Pe = () => {
      var ae, Me;
      if (re && typeof document < "u" && !document.hidden) {
        try {
          (ae = o.play) == null || ae.call(o);
        } catch {
        }
        try {
          (Me = h.play) == null || Me.call(h);
        } catch {
        }
        we();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", Pe);
    } catch {
    }
    const We = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? ob)), Se = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? ab)), Lt = new t.MediaRecorder(ge, { mimeType: a, videoBitsPerSecond: We, audioBitsPerSecond: Se }), Fn = [];
    let tr = 0, $r = 0, He = 0, it = 0, ye = 0, $t = !1;
    const _t = () => {
      if (u === "idle") return 0;
      const ae = t.now() - $r - He;
      return Math.max(0, ae - (it ? t.now() - it : 0));
    };
    Lt.ondataavailable = (ae) => {
      var Me, De;
      if (ae != null && ae.data && ae.data.size) {
        Fn.push(ae.data), tr += ae.data.size;
        try {
          (Me = e.onChunk) == null || Me.call(e, ae.data);
        } catch {
        }
      }
      try {
        (De = e.onStats) == null || De.call(e, { elapsedMs: _t(), bytes: tr });
      } catch {
      }
      tr >= r.maxBytes && U();
    };
    let dr;
    const Ct = new Promise((ae) => {
      dr = ae;
    }), $e = E;
    return Lt.onstop = async () => {
      oe && t.caf(oe), Ne && (t.clearInterval(Ne), Ne = 0), ye && (t.clearInterval(ye), ye = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", Pe);
      } catch {
      }
      const ae = _t();
      $e();
      try {
        o.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      d("stopped");
      const Me = new Blob(Fn, { type: a.split(";")[0] });
      let De = Me;
      if (ae > 0 && (Me.type.includes("webm") || a.includes("webm")))
        try {
          De = await nb(Me, ae);
        } catch {
          De = Me;
        }
      const st = W.width && W.width > 0 ? W.width : l.width, Je = W.height && W.height > 0 ? W.height : l.height;
      dr({
        id: c,
        blob: De,
        mime: (De.type || a || "video/webm").split(";")[0],
        durationMs: ae,
        bytes: De.size || tr,
        width: re ? l.width : st,
        height: re ? l.height : Je,
        screenOnly: tt,
        hadCamera: re,
        hadAudio: ht
      });
    }, Lt.start(1e3), $r = t.now(), d("recording"), ye = t.setInterval(() => {
      var Me;
      const ae = _t();
      try {
        (Me = e.onStats) == null || Me.call(e, { elapsedMs: ae, bytes: tr });
      } catch {
      }
      ae >= r.maxDurationMs && U();
    }, 200), {
      pause() {
        if (u === "recording") {
          try {
            Lt.pause();
          } catch {
          }
          it = t.now(), d("paused");
        }
      },
      resume() {
        if (u === "paused") {
          try {
            Lt.resume();
          } catch {
          }
          He += t.now() - it, it = 0, d("recording");
        }
      },
      stop() {
        U();
      },
      state() {
        return u;
      },
      screenOnly() {
        return tt;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return re && y ? y : null;
      },
      done: Ct
    };
  } catch (U) {
    throw E(), U;
  }
}
function hb(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function fb(e) {
  return {
    id: e.id,
    dataUrl: await hb(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function mb(e) {
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
    const d = (u = r.play) == null ? void 0 : u.call(r);
    d && typeof d.catch == "function" && d.catch(() => {
    });
  } catch {
  }
  t.appendChild(r);
  let n = !1, i = 0, s = 0, a = 0, c = 0;
  const l = (d) => {
    var f;
    n = !0, t.style.cursor = "grabbing";
    const m = t.getBoundingClientRect();
    a = m.left, c = m.top, i = d.clientX, s = d.clientY, t.style.right = "auto", t.style.bottom = "auto", t.style.left = a + "px", t.style.top = c + "px";
    try {
      (f = t.setPointerCapture) == null || f.call(t, d.pointerId);
    } catch {
    }
  }, p = (d) => {
    n && (t.style.left = Math.max(0, a + (d.clientX - i)) + "px", t.style.top = Math.max(0, c + (d.clientY - s)) + "px");
  }, o = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", p), t.addEventListener("pointerup", o), t;
}
async function gb(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? Ra();
  return Dd(t) ? new Promise((r) => {
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
    }, u = (x) => {
      x.key === "Escape" && (x.stopPropagation(), x.preventDefault(), f(null));
    }, d = () => {
      h();
    }, m = (x) => {
      o && x.target === n && (x.preventDefault(), x.stopPropagation(), f(null));
    };
    n.addEventListener("pointerdown", m), document.addEventListener("keydown", u, { capture: !0 }), typeof window < "u" && (window.addEventListener("pagehide", d), window.addEventListener("beforeunload", d));
    const f = (x) => {
      if (!l) {
        l = !0, h(), n.removeEventListener("pointerdown", m), document.removeEventListener("keydown", u, { capture: !0 }), typeof window < "u" && (window.removeEventListener("pagehide", d), window.removeEventListener("beforeunload", d));
        try {
          n.remove();
        } catch {
        }
        r(x);
      }
    }, y = (x) => {
      const R = Math.max(0, Math.round(x / 1e3));
      return `${Math.floor(R / 60)}:${String(R % 60).padStart(2, "0")}`;
    }, E = (x) => `${(x / 1048576).toFixed(1)} MB`, v = { ...$d, ...e.caps || {} }, k = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const x = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${x}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const R = i.querySelector("#klr-cam").checked, O = i.querySelector("#klr-mic").checked;
        A(R, O);
      };
    }, A = async (x, R) => {
      var $;
      let O = null;
      try {
        p = await pb({
          wantCamera: x,
          wantMic: R,
          caps: e.caps,
          onFallback: (P) => {
            O = P;
          },
          onStats: ({ elapsedMs: P, bytes: ee }) => {
            const Y = i.querySelector("#klr-timer");
            Y && (Y.textContent = "REC " + y(P));
            const _ = i.querySelector("#klr-meta");
            _ && (_.innerHTML = `${y(Math.max(0, v.maxDurationMs - P))} left<br>~${E(ee)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(O);
      try {
        const P = mb(($ = p == null ? void 0 : p.cameraStream) == null ? void 0 : $.call(p));
        P && n.appendChild(P);
      } catch {
      }
      p.done.then(async (P) => {
        f(await fb(P));
      });
    }, S = (x) => {
      const R = x === "camera-blocked", $ = R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!x && !R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + $;
      const P = i.querySelector("#klr-pause");
      P.onclick = () => {
        p && (p.state() === "recording" ? (p.pause(), P.textContent = "Resume") : (p.resume(), P.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => p == null ? void 0 : p.stop();
    };
    k();
  }) : null;
}
async function Sc(e, t = {}) {
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
    const u = h.getContext("2d");
    if (!u) return e;
    u.fillStyle = "#fff", u.fillRect(0, 0, p, o), u.drawImage(i, 0, 0, p, o);
    const d = h.toDataURL("image/jpeg", n);
    return d.length < e.length ? d : e;
  } catch {
    return e;
  }
}
async function yb(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((d, m) => {
      const f = new Image();
      f.onload = () => d(f), f.onerror = m, f.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight;
    if (!s || !a) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), p = Math.round(a * c), o = document.createElement("canvas");
    o.width = l, o.height = p;
    const h = o.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, p), h.drawImage(i, 0, 0, l, p);
    const u = o.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
var bb = Object.defineProperty, kb = (e, t, r) => t in e ? bb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, G = (e, t, r) => kb(e, typeof t != "symbol" ? t + "" : t, r), Ec, vb = Object.defineProperty, wb = (e, t, r) => t in e ? vb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Cc = (e, t, r) => wb(e, typeof t != "symbol" ? t + "" : t, r), at = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(at || {});
const Mc = {
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
}, Rc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ii = {}, Fd = {}, xb = () => !!globalThis.Zone;
function Ta(e) {
  if (Ii[e])
    return Ii[e];
  const t = globalThis[e], r = t.prototype, n = e in Mc ? Mc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in Rc ? Rc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !xb())
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
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Fd[e] = () => c.remove()) : c.remove(), Ii[e] = p;
  } catch {
    return r;
  }
}
const Qs = {};
function br(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Qs[i])
    return Qs[i].call(
      t
    );
  const s = Ta(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (Qs[i] = a, a.call(t)) : t[r];
}
const eo = {};
function Ud(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (eo[n])
    return eo[n].bind(
      t
    );
  const s = Ta(e)[r];
  return typeof s != "function" ? t[r] : (eo[n] = s, s.bind(t));
}
function Sb(e) {
  return br("Node", e, "ownerDocument");
}
function Eb(e) {
  return br("Node", e, "childNodes");
}
function Cb(e) {
  return br("Node", e, "parentNode");
}
function Mb(e) {
  return br("Node", e, "parentElement");
}
function Rb(e) {
  return br("Node", e, "textContent");
}
function Tb(e, t) {
  return Ud("Node", e, "contains")(t);
}
function Ab(e) {
  return Ud("Node", e, "getRootNode")();
}
function Lb(e) {
  return !e || !("host" in e) ? null : br("ShadowRoot", e, "host");
}
function _b(e) {
  return e.styleSheets;
}
function Ib(e) {
  return !e || !("shadowRoot" in e) ? null : br("Element", e, "shadowRoot");
}
function Ob(e, t) {
  return br("Element", e, "querySelector")(t);
}
function Nb(e, t) {
  return br("Element", e, "querySelectorAll")(t);
}
function Pb() {
  return [
    Ta("MutationObserver").constructor,
    Fd.MutationObserver ?? (() => {
    })
  ];
}
let Bd = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Bd = () => (/* @__PURE__ */ new Date()).getTime());
function zb(e, t, r) {
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
const bt = {
  ownerDocument: Sb,
  childNodes: Eb,
  parentNode: Cb,
  parentElement: Mb,
  textContent: Rb,
  contains: Tb,
  getRootNode: Ab,
  host: Lb,
  styleSheets: _b,
  shadowRoot: Ib,
  querySelector: Ob,
  querySelectorAll: Nb,
  nowTimestamp: Bd,
  mutationObserverCtor: Pb,
  patch: zb
};
function qd(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function ei(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && bt.host(e) || null
  );
  return !!(t && "shadowRoot" in t && bt.shadowRoot(t) === e);
}
function ti(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function $b(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Db(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function ma(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => jd(i, r)
    ).join("");
    return $b(n);
  } catch {
    return null;
  }
}
function jd(e, t) {
  if (Ub(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      ma(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Db(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? es(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Bb(e) && e.selectorText.includes(":") && (r = Fb(r)), t ? es(r, t) : r;
  }
}
function Fb(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Ub(e) {
  return "styleSheet" in e;
}
function Bb(e) {
  return "selectorText" in e;
}
class Wd {
  constructor() {
    Cc(this, "idNodeMap", /* @__PURE__ */ new Map()), Cc(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function qb() {
  return new Wd();
}
function Zi({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && rn(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function rn(e) {
  return e.toLowerCase();
}
const Tc = "__rrweb_original__";
function jb(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = Tc in s ? s[Tc] : s;
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
function Qi(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    rn(t)
  ) : null;
}
function Hd(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Wb(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Hb = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Yb = /^(?:[a-z+]+:)?\/\//i, Vb = /^www\..*/i, Gb = /^(data:)([^,]*),(.*)/i;
function es(e, t) {
  return (e || "").replace(
    Hb,
    (r, n, i, s, a, c) => {
      const l = i || a || c, p = n || s || "";
      if (!l)
        return r;
      if (Yb.test(l) || Vb.test(l))
        return `url(${p}${l}${p})`;
      if (Gb.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${Wb(t) + l}${p})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const u of h)
        u !== "." && (u === ".." ? o.pop() : o.push(u));
      return `url(${p}${o.join("/")}${p})`;
    }
  );
}
function Oi(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Xb(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Oi(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = Oi(
          n[l].textContent,
          r
        ), o = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let u = p.substring(0, h), d = a.split(u), m = -1;
          if (d.length === 2)
            m = d[0].length;
          else if (d.length > 2 && d[0] === "" && n[l - 1].textContent !== "")
            m = a.indexOf(u, 1);
          else if (d.length === 1) {
            if (u = u.substring(
              0,
              u.length - 1
            ), d = a.split(u), d.length <= 1)
              return i.push(e), i;
            h = o + 1;
          } else h === p.length - 1 && (m = a.indexOf(u));
          if (d.length >= 2 && h > o) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const y = Oi(f).length;
              m = a.indexOf(u, y);
            }
            m === -1 && (m = d[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = Oi(
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
function Kb(e, t) {
  return Xb(e, t).join("/* rr_split */");
}
let Jb = 1;
const Zb = new RegExp("[^a-z0-9-_:]"), oi = -2;
function Yd() {
  return Jb++;
}
function Qb(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = rn(e.tagName);
  return Zb.test(t) ? "div" : t;
}
let wn, Ac;
const ek = /^[^ \t\n\r\u000c]+/, tk = /^[, \t\n\r\u000c]+/;
function rk(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(tk), !(r >= t.length); ) {
    let s = n(ek);
    if (s.slice(-1) === ",")
      s = Mn(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Mn(e, s);
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
const Lc = /* @__PURE__ */ new WeakMap();
function Mn(e, t) {
  return !t || t.trim() === "" ? t : Aa(e, t);
}
function nk(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Aa(e, t) {
  let r = Lc.get(e);
  if (r || (r = e.createElement("a"), Lc.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Vd(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Mn(e, n) : r === "srcset" ? rk(e, n) : r === "style" ? es(n, Aa(e)) : t === "object" && r === "data" ? Mn(e, n) : n);
}
function Gd(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function ik(e, t, r) {
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
function ts(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? ts(bt.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? ts(bt.parentNode(e), t, r) : !1;
}
function Xd(e, t, r, n) {
  let i;
  if (qd(e)) {
    if (i = e, !bt.childNodes(i).length)
      return !1;
  } else {
    if (bt.parentElement(e) === null)
      return !1;
    i = bt.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (ts(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function sk(e, t, r) {
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
function ok(e, t, r) {
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
function ak(e, t) {
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
    inlineImages: u,
    recordCanvas: d,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: y = !1
  } = t, E = lk(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: at.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: at.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: at.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: E
      };
    case e.ELEMENT_NODE:
      return uk(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: o,
        dataURLOptions: h,
        inlineImages: u,
        recordCanvas: d,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: E
      });
    case e.TEXT_NODE:
      return ck(e, {
        doc: r,
        needsMask: a,
        maskTextFn: p,
        rootId: E,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: at.CDATA,
        textContent: "",
        rootId: E
      };
    case e.COMMENT_NODE:
      return {
        type: at.Comment,
        textContent: bt.textContent(e) || "",
        rootId: E
      };
    default:
      return !1;
  }
}
function lk(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function ck(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = bt.parentNode(e), c = a && a.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = bt.textContent(e), p && l && (l = es(l, Aa(t.doc)))), !p && !o && l && r && (l = n ? n(l, bt.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: at.Text,
    textContent: l || "",
    rootId: i
  };
}
function uk(e, t) {
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
    newlyAddedElement: u = !1,
    rootId: d
  } = t, m = ik(e, n, i), f = Qb(e);
  let y = {};
  const E = e.attributes.length;
  for (let k = 0; k < E; k++) {
    const A = e.attributes[k];
    Gd(f, A.name, A.value) || (y[A.name] = Vd(
      r,
      f,
      rn(A.name),
      A.value
    ));
  }
  if (f === "link" && s) {
    const k = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let A = null;
    k && (A = ma(k)), A && (delete y.rel, delete y.href, y._cssText = A);
  }
  if (f === "style" && e.sheet) {
    let k = ma(
      e.sheet
    );
    k && (e.childNodes.length > 1 && (k = Kb(k, e)), y._cssText = k);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const k = e.value, A = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && k ? y.value = Zi({
      element: e,
      type: Qi(e),
      tagName: f,
      value: k,
      maskInputOptions: a,
      maskInputFn: c
    }) : A && (y.checked = A);
  }
  if (f === "option" && (e.selected && !a.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      jb(e) || (y.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const k = e.toDataURL(
        l.type,
        l.quality
      ), A = r.createElement("canvas");
      A.width = e.width, A.height = e.height;
      const S = A.toDataURL(
        l.type,
        l.quality
      );
      k !== S && (y.rr_dataURL = k);
    }
  }
  if (f === "img" && p) {
    wn || (wn = r.createElement("canvas"), Ac = wn.getContext("2d"));
    const k = e, A = k.currentSrc || k.getAttribute("src") || "<unknown-src>", S = k.crossOrigin, x = () => {
      k.removeEventListener("load", x);
      try {
        wn.width = k.naturalWidth, wn.height = k.naturalHeight, Ac.drawImage(k, 0, 0), y.rr_dataURL = wn.toDataURL(
          l.type,
          l.quality
        );
      } catch (R) {
        if (k.crossOrigin !== "anonymous") {
          k.crossOrigin = "anonymous", k.complete && k.naturalWidth !== 0 ? x() : k.addEventListener("load", x);
          return;
        } else
          console.warn(
            `Cannot inline img src=${A}! Error: ${R}`
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
  if (u || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: k, height: A } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${k}px`,
      rr_height: `${A}px`
    };
  }
  f === "iframe" && !h(y.src) && (e.contentDocument || (y.rr_src = y.src), delete y.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: at.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: nk(e) || void 0,
    needBlock: m,
    rootId: d,
    isCustom: v
  };
}
function qe(e) {
  return e == null ? "" : e.toLowerCase();
}
function Kd(e) {
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
function dk(e, t) {
  if (t.comment && e.type === at.Comment)
    return !0;
  if (e.type === at.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Hd(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (qe(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || qe(e.attributes.name) === "application-name" || qe(e.attributes.rel) === "icon" || qe(e.attributes.rel) === "apple-touch-icon" || qe(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && qe(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (qe(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      qe(e.attributes.name).match(/^(og|twitter):/) || qe(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (qe(e.attributes.name) === "robots" || qe(e.attributes.name) === "googlebot" || qe(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (qe(e.attributes.name) === "author" || qe(e.attributes.name) === "generator" || qe(e.attributes.name) === "framework" || qe(e.attributes.name) === "publisher" || qe(e.attributes.name) === "progid" || qe(e.attributes.property).match(/^article:/) || qe(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (qe(e.attributes.name) === "google-site-verification" || qe(e.attributes.name) === "yandex-verification" || qe(e.attributes.name) === "csrf-token" || qe(e.attributes.name) === "p:domain_verify" || qe(e.attributes.name) === "verify-v1" || qe(e.attributes.name) === "verification" || qe(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Rn(e, t) {
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
    maskInputFn: u,
    slimDOMOptions: d,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: y = !1,
    onSerialize: E,
    onIframeLoad: v,
    iframeLoadTimeout: k = 5e3,
    onStylesheetLoad: A,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: x = () => !1,
    newlyAddedElement: R = !1,
    cssCaptured: O = !1
  } = t;
  let { needsMask: $ } = t, { preserveWhiteSpace: P = !0 } = t;
  $ || ($ = Xd(
    e,
    a,
    c,
    $ === void 0
  ));
  const ee = ak(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: $,
    inlineStylesheet: p,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: u,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: y,
    keepIframeSrcFn: x,
    newlyAddedElement: R,
    cssCaptured: O
  });
  if (!ee)
    return console.warn(e, "not serialized"), null;
  let Y;
  n.hasNode(e) ? Y = n.getId(e) : dk(ee, d) || !P && ee.type === at.Text && !ee.textContent.replace(/^\s+|\s+$/gm, "").length ? Y = oi : Y = Yd();
  const _ = Object.assign(ee, { id: Y });
  if (n.add(e, _), Y === oi)
    return null;
  E && E(e);
  let Oe = !l;
  if (_.type === at.Element) {
    Oe = Oe && !_.needBlock, delete _.needBlock;
    const fe = bt.shadowRoot(e);
    fe && ti(fe) && (_.isShadowHost = !0);
  }
  if ((_.type === at.Document || _.type === at.Element) && Oe) {
    d.headWhitespace && _.type === at.Element && _.tagName === "head" && (P = !1);
    const fe = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: $,
      maskTextClass: a,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: p,
      maskInputOptions: o,
      maskTextFn: h,
      maskInputFn: u,
      slimDOMOptions: d,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: P,
      onSerialize: E,
      onIframeLoad: v,
      iframeLoadTimeout: k,
      onStylesheetLoad: A,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: x,
      cssCaptured: !1
    };
    if (!(_.type === at.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === at.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (fe.cssCaptured = !0);
      for (const Ae of Array.from(bt.childNodes(e))) {
        const ze = Rn(Ae, fe);
        ze && _.childNodes.push(ze);
      }
    }
    let he = null;
    if (qd(e) && (he = bt.shadowRoot(e)))
      for (const Ae of Array.from(bt.childNodes(he))) {
        const ze = Rn(Ae, fe);
        ze && (ti(he) && (ze.isShadow = !0), _.childNodes.push(ze));
      }
  }
  const je = bt.parentNode(e);
  return je && ei(je) && ti(je) && (_.isShadow = !0), _.type === at.Element && _.tagName === "iframe" && sk(
    e,
    () => {
      const fe = e.contentDocument;
      if (fe && v) {
        const he = Rn(fe, {
          doc: fe,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: d,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: P,
          onSerialize: E,
          onIframeLoad: v,
          iframeLoadTimeout: k,
          onStylesheetLoad: A,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        he && v(
          e,
          he
        );
      }
    },
    k
  ), _.type === at.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && Hd(_.attributes.href) === "css") && ok(
    e,
    () => {
      if (A) {
        const fe = Rn(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: $,
          maskTextClass: a,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: o,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: d,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: P,
          onSerialize: E,
          onIframeLoad: v,
          iframeLoadTimeout: k,
          onStylesheetLoad: A,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        fe && A(
          e,
          fe
        );
      }
    },
    S
  ), _;
}
function pk(e, t) {
  const {
    mirror: r = new Wd(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: a = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: p = !1,
    maskAllInputs: o = !1,
    maskTextFn: h,
    maskInputFn: u,
    slimDOM: d = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: E,
    iframeLoadTimeout: v,
    onStylesheetLoad: k,
    stylesheetLoadTimeout: A,
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
  } : o, R = Kd(d);
  return Rn(e, {
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
    slimDOMOptions: R,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: E,
    iframeLoadTimeout: v,
    onStylesheetLoad: k,
    stylesheetLoadTimeout: A,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function hk(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function fk(e) {
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
var Ni = { exports: {} }, _c;
function mk() {
  if (_c) return Ni.exports;
  _c = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ni.exports = t(), Ni.exports.createColors = t, Ni.exports;
}
const gk = {}, yk = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: gk
}, Symbol.toStringTag, { value: "Module" })), Zt = /* @__PURE__ */ fk(yk);
var to, Ic;
function La() {
  if (Ic) return to;
  Ic = 1;
  let e = /* @__PURE__ */ mk(), t = Zt;
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
        let { bold: u, gray: d, red: m } = e.createColors(!0);
        o = (f) => u(m(f)), h = (f) => d(f);
      } else
        o = h = (u) => u;
      return a.slice(c, l).map((u, d) => {
        let m = c + 1 + d, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
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
  return to = r, r.default = r, to;
}
var Pi = {}, Oc;
function _a() {
  return Oc || (Oc = 1, Pi.isClean = Symbol("isClean"), Pi.my = Symbol("my")), Pi;
}
var ro, Nc;
function Jd() {
  if (Nc) return ro;
  Nc = 1;
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
  return ro = r, r.default = r, ro;
}
var no, Pc;
function us() {
  if (Pc) return no;
  Pc = 1;
  let e = Jd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return no = t, t.default = t, no;
}
var io, zc;
function ds() {
  if (zc) return io;
  zc = 1;
  let { isClean: e, my: t } = _a(), r = La(), n = Jd(), i = us();
  function s(c, l) {
    let p = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], u = typeof h;
      o === "parent" && u === "object" ? l && (p[o] = l) : o === "source" ? p[o] = h : Array.isArray(h) ? p[o] = h.map((d) => s(d, p)) : (u === "object" && h !== null && (h = s(h)), p[o] = h);
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
      let o = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let d = 0; d < l; d++)
        o[d] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(l.word);
        u !== -1 && (p = this.positionInside(u, h), o = this.positionInside(u + l.word.length, h));
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
      let u = 0;
      for (let d in this) {
        if (!Object.prototype.hasOwnProperty.call(this, d) || d === "parent" || d === "proxyCache") continue;
        let m = this[d];
        if (Array.isArray(m))
          o[d] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          o[d] = m.toJSON(null, p);
        else if (d === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), o[d] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[d] = m;
      }
      return h && (o.inputs = [...p.keys()].map((d) => d.toJSON())), o;
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
      for (let u in o) h[u] = o[u];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return io = a, a.default = a, io;
}
var so, $c;
function ps() {
  if ($c) return so;
  $c = 1;
  let e = ds();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return so = t, t.default = t, so;
}
var oo, Dc;
function bk() {
  if (Dc) return oo;
  Dc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return oo = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, oo;
}
var ao, Fc;
function Zd() {
  if (Fc) return ao;
  Fc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { existsSync: r, readFileSync: n } = Zt, { dirname: i, join: s } = Zt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, o) {
      if (o.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, u = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, d = /^data:application\/json,/;
      if (u.test(p) || d.test(p))
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
      let h = p.lastIndexOf(o.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
  return ao = c, c.default = c, ao;
}
var lo, Uc;
function hs() {
  if (Uc) return lo;
  Uc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { fileURLToPath: r, pathToFileURL: n } = Zt, { isAbsolute: i, resolve: s } = Zt, { nanoid: a } = /* @__PURE__ */ bk(), c = Zt, l = La(), p = Zd(), o = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class d {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!u || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), u && h) {
        let E = new p(this.css, y);
        if (E.text) {
          this.map = E;
          let v = E.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, E, v = {}) {
      let k, A, S;
      if (y && typeof y == "object") {
        let R = y, O = E;
        if (typeof R.offset == "number") {
          let $ = this.fromOffset(R.offset);
          y = $.line, E = $.col;
        } else
          y = R.line, E = R.column;
        if (typeof O.offset == "number") {
          let $ = this.fromOffset(O.offset);
          A = $.line, S = $.col;
        } else
          A = O.line, S = O.column;
      } else if (!E) {
        let R = this.fromOffset(y);
        y = R.line, E = R.col;
      }
      let x = this.origin(y, E, A, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        v.plugin
      ) : k = new l(
        f,
        A === void 0 ? y : { column: E, line: y },
        A === void 0 ? E : { column: S, line: A },
        this.css,
        this.file,
        v.plugin
      ), k.input = { column: E, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (k.input.url = n(this.file).toString()), k.input.file = this.file), k;
    }
    fromOffset(f) {
      let y, E;
      if (this[o])
        E = this[o];
      else {
        let k = this.css.split(`
`);
        E = new Array(k.length);
        let A = 0;
        for (let S = 0, x = k.length; S < x; S++)
          E[S] = A, A += k[S].length + 1;
        this[o] = E;
      }
      y = E[E.length - 1];
      let v = 0;
      if (f >= y)
        v = E.length - 1;
      else {
        let k = E.length - 2, A;
        for (; v < k; )
          if (A = v + (k - v >> 1), f < E[A])
            k = A - 1;
          else if (f >= E[A + 1])
            v = A + 1;
          else {
            v = A;
            break;
          }
      }
      return {
        col: f - E[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, E, v) {
      if (!this.map) return !1;
      let k = this.map.consumer(), A = k.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof E == "number" && (S = k.originalPositionFor({ column: v, line: E }));
      let x;
      i(A.source) ? x = n(A.source) : x = new URL(
        A.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: A.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: A.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          R.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = k.sourceContentFor(A.source);
      return O && (R.source = O), R;
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
  return lo = d, d.default = d, c && c.registerInput && c.registerInput(d), lo;
}
var co, Bc;
function Qd() {
  if (Bc) return co;
  Bc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { dirname: r, relative: n, resolve: i, sep: s } = Zt, { pathToFileURL: a } = Zt, c = hs(), l = !!(e && t), p = !!(r && i && n && s);
  class o {
    constructor(u, d, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = d, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let d = `
`;
      this.css.includes(`\r
`) && (d = `\r
`), this.css += d + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let d = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, d, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let d = this.root.nodes.length - 1; d >= 0; d--)
            u = this.root.nodes[d], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(d);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && l && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (d) => {
          u += d;
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
      let u = 1, d = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, y, E;
      this.stringify(this.root, (v, k, A) => {
        if (this.css += v, k && A !== "end" && (f.generated.line = u, f.generated.column = d - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (u += y.length, E = v.lastIndexOf(`
`), d = v.length - E) : d += v.length, k && A !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = u, f.generated.column = d - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = d - 1, this.map.addMapping(f)));
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
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((d) => d.inline) : !0;
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
      let d = this.memoizedPaths.get(u);
      if (d) return d;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let d = u.source.input.map;
              this.previousMaps.includes(d) || this.previousMaps.push(d);
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
        this.root.walk((d) => {
          if (d.source) {
            let m = d.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, d.source.input.css);
            }
          }
        });
      else if (this.css) {
        let d = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(d, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let d = this.memoizedFileURLs.get(u);
      if (d) return d;
      if (a) {
        let m = a(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let d = this.memoizedURLs.get(u);
      if (d) return d;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return co = o, co;
}
var uo, qc;
function fs() {
  if (qc) return uo;
  qc = 1;
  let e = ds();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return uo = t, t.default = t, uo;
}
var po, jc;
function sn() {
  if (jc) return po;
  jc = 1;
  let { isClean: e, my: t } = _a(), r = ps(), n = fs(), i = ds(), s, a, c, l;
  function p(u) {
    return u.map((d) => (d.nodes && (d.nodes = p(d.nodes)), delete d.source, d));
  }
  function o(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let d of u.proxyOf.nodes)
        o(d);
  }
  class h extends i {
    append(...d) {
      for (let m of d) {
        let f = this.normalize(m, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(d) {
      if (super.cleanRaws(d), this.nodes)
        for (let m of this.nodes) m.cleanRaws(d);
    }
    each(d) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, y;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], y = d(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], y;
    }
    every(d) {
      return this.nodes.every(d);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let d = this.lastEach;
      return this.indexes[d] = 0, d;
    }
    getProxyProcessor() {
      return {
        get(d, m) {
          return m === "proxyOf" ? d : d[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => d[m](
            ...f.map((y) => typeof y == "function" ? (E, v) => y(E.toProxy(), v) : y)
          ) : m === "every" || m === "some" ? (f) => d[m](
            (y, ...E) => f(y.toProxy(), ...E)
          ) : m === "root" ? () => d.root().toProxy() : m === "nodes" ? d.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? d[m].toProxy() : d[m] : d[m];
        },
        set(d, m, f) {
          return d[m] === f || (d[m] = f, (m === "name" || m === "params" || m === "selector") && d.markDirty()), !0;
        }
      };
    }
    index(d) {
      return typeof d == "number" ? d : (d.proxyOf && (d = d.proxyOf), this.proxyOf.nodes.indexOf(d));
    }
    insertAfter(d, m) {
      let f = this.index(d), y = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(d);
      for (let v of y) this.proxyOf.nodes.splice(f + 1, 0, v);
      let E;
      for (let v in this.indexes)
        E = this.indexes[v], f < E && (this.indexes[v] = E + y.length);
      return this.markDirty(), this;
    }
    insertBefore(d, m) {
      let f = this.index(d), y = f === 0 ? "prepend" : !1, E = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(d);
      for (let k of E) this.proxyOf.nodes.splice(f, 0, k);
      let v;
      for (let k in this.indexes)
        v = this.indexes[k], f <= v && (this.indexes[k] = v + E.length);
      return this.markDirty(), this;
    }
    normalize(d, m) {
      if (typeof d == "string")
        d = p(s(d).nodes);
      else if (typeof d > "u")
        d = [];
      else if (Array.isArray(d)) {
        d = d.slice(0);
        for (let y of d)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (d.type === "root" && this.type !== "document") {
        d = d.nodes.slice(0);
        for (let y of d)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (d.type)
        d = [d];
      else if (d.prop) {
        if (typeof d.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof d.value != "string" && (d.value = String(d.value)), d = [new r(d)];
      } else if (d.selector)
        d = [new a(d)];
      else if (d.name)
        d = [new c(d)];
      else if (d.text)
        d = [new n(d)];
      else
        throw new Error("Unknown node type in node creation");
      return d.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...d) {
      d = d.reverse();
      for (let m of d) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
      }
      return this.markDirty(), this;
    }
    push(d) {
      return d.parent = this, this.proxyOf.nodes.push(d), this;
    }
    removeAll() {
      for (let d of this.proxyOf.nodes) d.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(d) {
      d = this.index(d), this.proxyOf.nodes[d].parent = void 0, this.proxyOf.nodes.splice(d, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= d && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(d, m, f) {
      return f || (f = m, m = {}), this.walkDecls((y) => {
        m.props && !m.props.includes(y.prop) || m.fast && !y.value.includes(m.fast) || (y.value = y.value.replace(d, f));
      }), this.markDirty(), this;
    }
    some(d) {
      return this.nodes.some(d);
    }
    walk(d) {
      return this.each((m, f) => {
        let y;
        try {
          y = d(m, f);
        } catch (E) {
          throw m.addToError(E);
        }
        return y !== !1 && m.walk && (y = m.walk(d)), y;
      });
    }
    walkAtRules(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && d.test(f.name))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
        if (f.type === "atrule")
          return m(f, y);
      }));
    }
    walkComments(d) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return d(m, f);
      });
    }
    walkDecls(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && d.test(f.prop))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
        if (f.type === "decl")
          return m(f, y);
      }));
    }
    walkRules(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && d.test(f.selector))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
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
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    a = u;
  }, h.registerAtRule = (u) => {
    c = u;
  }, h.registerRoot = (u) => {
    l = u;
  }, po = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, c.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, a.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, l.prototype), u[t] = !0, u.nodes && u.nodes.forEach((d) => {
      h.rebuild(d);
    });
  }, po;
}
var ho, Wc;
function Ia() {
  if (Wc) return ho;
  Wc = 1;
  let e = sn(), t, r;
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
  }, ho = n, n.default = n, ho;
}
var fo, Hc;
function ep() {
  if (Hc) return fo;
  Hc = 1;
  let e = {};
  return fo = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, fo;
}
var mo, Yc;
function tp() {
  if (Yc) return mo;
  Yc = 1;
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
  return mo = e, e.default = e, mo;
}
var go, Vc;
function Oa() {
  if (Vc) return go;
  Vc = 1;
  let e = tp();
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
  return go = t, t.default = t, go;
}
var yo, Gc;
function kk() {
  if (Gc) return yo;
  Gc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, u = 41, d = 123, m = 125, f = 59, y = 42, E = 58, v = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return yo = function(O, $ = {}) {
    let P = O.css.valueOf(), ee = $.ignoreErrors, Y, _, Oe, je, fe, he, Ae, ze, Le, ve, Ze = P.length, U = 0, X = [], W = [];
    function Be() {
      return U;
    }
    function ue(oe) {
      throw O.error("Unclosed " + oe, U);
    }
    function re() {
      return W.length === 0 && U >= Ze;
    }
    function tt(oe) {
      if (W.length) return W.pop();
      if (U >= Ze) return;
      let Ne = oe ? oe.ignoreUnclosed : !1;
      switch (Y = P.charCodeAt(U), Y) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = U;
          do
            _ += 1, Y = P.charCodeAt(_);
          while (Y === s || Y === i || Y === c || Y === l || Y === a);
          ve = ["space", P.slice(U, _)], U = _ - 1;
          break;
        }
        case p:
        case o:
        case d:
        case m:
        case E:
        case f:
        case u: {
          let we = String.fromCharCode(Y);
          ve = [we, we, U];
          break;
        }
        case h: {
          if (ze = X.length ? X.pop()[1] : "", Le = P.charCodeAt(U + 1), ze === "url" && Le !== e && Le !== t && Le !== s && Le !== i && Le !== c && Le !== a && Le !== l) {
            _ = U;
            do {
              if (he = !1, _ = P.indexOf(")", _ + 1), _ === -1)
                if (ee || Ne) {
                  _ = U;
                  break;
                } else
                  ue("bracket");
              for (Ae = _; P.charCodeAt(Ae - 1) === r; )
                Ae -= 1, he = !he;
            } while (he);
            ve = ["brackets", P.slice(U, _ + 1), U, _], U = _;
          } else
            _ = P.indexOf(")", U + 1), je = P.slice(U, _ + 1), _ === -1 || S.test(je) ? ve = ["(", "(", U] : (ve = ["brackets", je, U, _], U = _);
          break;
        }
        case e:
        case t: {
          Oe = Y === e ? "'" : '"', _ = U;
          do {
            if (he = !1, _ = P.indexOf(Oe, _ + 1), _ === -1)
              if (ee || Ne) {
                _ = U + 1;
                break;
              } else
                ue("string");
            for (Ae = _; P.charCodeAt(Ae - 1) === r; )
              Ae -= 1, he = !he;
          } while (he);
          ve = ["string", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case v: {
          k.lastIndex = U + 1, k.test(P), k.lastIndex === 0 ? _ = P.length - 1 : _ = k.lastIndex - 2, ve = ["at-word", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case r: {
          for (_ = U, fe = !0; P.charCodeAt(_ + 1) === r; )
            _ += 1, fe = !fe;
          if (Y = P.charCodeAt(_ + 1), fe && Y !== n && Y !== s && Y !== i && Y !== c && Y !== l && Y !== a && (_ += 1, x.test(P.charAt(_)))) {
            for (; x.test(P.charAt(_ + 1)); )
              _ += 1;
            P.charCodeAt(_ + 1) === s && (_ += 1);
          }
          ve = ["word", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        default: {
          Y === n && P.charCodeAt(U + 1) === y ? (_ = P.indexOf("*/", U + 2) + 1, _ === 0 && (ee || Ne ? _ = P.length : ue("comment")), ve = ["comment", P.slice(U, _ + 1), U, _], U = _) : (A.lastIndex = U + 1, A.test(P), A.lastIndex === 0 ? _ = P.length - 1 : _ = A.lastIndex - 2, ve = ["word", P.slice(U, _ + 1), U, _], X.push(ve), U = _);
          break;
        }
      }
      return U++, ve;
    }
    function ht(oe) {
      W.push(oe);
    }
    return {
      back: ht,
      endOfFile: re,
      nextToken: tt,
      position: Be
    };
  }, yo;
}
var bo, Xc;
function Na() {
  if (Xc) return bo;
  Xc = 1;
  let e = sn();
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
  return bo = t, t.default = t, e.registerAtRule(t), bo;
}
var ko, Kc;
function ui() {
  if (Kc) return ko;
  Kc = 1;
  let e = sn(), t, r;
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
  }, ko = n, n.default = n, e.registerRoot(n), ko;
}
var vo, Jc;
function rp() {
  if (Jc) return vo;
  Jc = 1;
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
  return vo = e, e.default = e, vo;
}
var wo, Zc;
function Pa() {
  if (Zc) return wo;
  Zc = 1;
  let e = sn(), t = rp();
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
  return wo = r, r.default = r, e.registerRule(r), wo;
}
var xo, Qc;
function vk() {
  if (Qc) return xo;
  Qc = 1;
  let e = ps(), t = kk(), r = fs(), n = Na(), i = ui(), s = Pa();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let o = p.length - 1; o >= 0; o--) {
      let h = p[o], u = h[3] || h[2];
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
      let u, d, m, f = !1, y = !1, E = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), u = o[0], u === "(" || u === "[" ? v.push(u === "(" ? ")" : "]") : u === "{" && v.length > 0 ? v.push("}") : u === v[v.length - 1] && v.pop(), v.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            y = !0;
            break;
          } else if (u === "}") {
            if (E.length > 0) {
              for (m = E.length - 1, d = E[m]; d && d[0] === "space"; )
                d = E[--m];
              d && (h.source.end = this.getPosition(d[3] || d[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            E.push(o);
        else
          E.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(E), E.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(E), this.raw(h, "params", E), f && (o = E[E.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let u = 0, d;
      for (let m = h - 1; m >= 0 && (d = o[m], !(d[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        d[0] === "word" ? d[3] + 1 : d[2]
      );
    }
    colon(o) {
      let h = 0, u, d, m;
      for (let [f, y] of o.entries()) {
        if (u = y, d = u[0], d === "(" && (h += 1), d === ")" && (h -= 1), h === 0 && d === ":")
          if (!m)
            this.doubleColon(u);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = u;
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
        let d = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = d[2], h.raws.left = d[1], h.raws.right = d[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let u = new e();
      this.init(u, o[0][2]);
      let d = o[o.length - 1];
      for (d[0] === ";" && (this.semicolon = !0, o.pop()), u.source.end = this.getPosition(
        d[3] || d[2] || c(o)
      ), u.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), u.raws.before += o.shift()[1];
      for (u.source.start = this.getPosition(o[0][2]), u.prop = ""; o.length; ) {
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        u.prop += o.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let k = this.stringFrom(o, v);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (u.raws.important = k);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let k = o.slice(0), A = "";
          for (let S = v; S > 0; S--) {
            let x = k[S][0];
            if (A.trim().indexOf("!") === 0 && x !== "space")
              break;
            A = k.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = A, o = k);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (u.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(u, "value", f.concat(o), h), u.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, u = null, d = !1, m = null, f = [], y = o[1].startsWith("--"), E = [], v = o;
      for (; v; ) {
        if (u = v[0], E.push(v), u === "(" || u === "[")
          m || (m = v), f.push(u === "(" ? ")" : "]");
        else if (y && d && u === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (d) {
              this.decl(E, y);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(E);
            return;
          } else if (u === "}") {
            this.tokenizer.back(E.pop()), h = !0;
            break;
          } else u === ":" && (d = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && d) {
        if (!y)
          for (; E.length && (v = E[E.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(E.pop());
        this.decl(E, y);
      } else
        this.unknownWord(E);
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
    raw(o, h, u, d) {
      let m, f, y = u.length, E = "", v = !0, k, A;
      for (let S = 0; S < y; S += 1)
        m = u[S], f = m[0], f === "space" && S === y - 1 && !d ? v = !1 : f === "comment" ? (A = u[S - 1] ? u[S - 1][0] : "empty", k = u[S + 1] ? u[S + 1][0] : "empty", !a[A] && !a[k] ? E.slice(-1) === "," ? v = !1 : E += m[1] : v = !1) : E += m[1];
      if (!v) {
        let S = u.reduce((x, R) => x + R[1], "");
        o.raws[h] = { raw: S, value: E };
      }
      o[h] = E;
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
      for (let d = h; d < o.length; d++)
        u += o[d][1];
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
  return xo = l, xo;
}
var So, eu;
function za() {
  if (eu) return So;
  eu = 1;
  let e = sn(), t = vk(), r = hs();
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
  return So = n, n.default = n, e.registerParse(n), So;
}
var Eo, tu;
function np() {
  if (tu) return Eo;
  tu = 1;
  let { isClean: e, my: t } = _a(), r = Qd(), n = us(), i = sn(), s = Ia(), a = ep(), c = Oa(), l = za(), p = ui();
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
  }, d = 0;
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, x = o[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      x,
      x + "-" + S,
      d,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : A.append ? [x, d, x + "Exit"] : [x, x + "Exit"];
  }
  function y(A) {
    let S;
    return A.type === "document" ? S = ["Document", d, "DocumentExit"] : A.type === "root" ? S = ["Root", d, "RootExit"] : S = f(A), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: A,
      visitorIndex: 0,
      visitors: []
    };
  }
  function E(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => E(S)), A;
  }
  let v = {};
  class k {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        O = E(x);
      else if (x instanceof k || x instanceof c)
        O = E(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
      else {
        let $ = l;
        R.syntax && ($ = R.syntax.parse), R.parser && ($ = R.parser), $.parse && ($ = $.parse);
        try {
          O = $(x, R);
        } catch (P) {
          this.processed = !0, this.error = P;
        }
        O && !O[t] && i.rebuild(O);
      }
      this.result = new c(S, O, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
          let O = R.postcssPlugin, $ = R.postcssVersion, P = this.result.processor.version, ee = $.split("."), Y = P.split(".");
          (ee[0] !== Y[0] || parseInt(ee[1]) > parseInt(Y[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + P + ", but " + O + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, R, O) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([x, O]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let R in x) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[R])
              if (typeof x[R] == "object")
                for (let O in x[R])
                  O === "*" ? S(x, R, x[R][O]) : S(
                    x,
                    R + "-" + O.toLowerCase(),
                    x[R][O]
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
          } catch (O) {
            throw this.handleError(O);
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
              } catch (O) {
                let $ = x[x.length - 1].node;
                throw this.handleError(O, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let O = S.nodes.map(
                  ($) => R($, this.helpers)
                );
                await Promise.all(O);
              } else
                await R(S, this.helpers);
            } catch (O) {
              throw this.handleError(O);
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
      let O = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
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
      for (let [R, O] of S) {
        this.result.lastPlugin = R;
        let $;
        try {
          $ = O(x, this.helpers);
        } catch (P) {
          throw this.handleError(P, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: R, visitors: O } = x;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        S.pop();
        return;
      }
      if (O.length > 0 && x.visitorIndex < O.length) {
        let [P, ee] = O[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === O.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = P;
        try {
          return ee(R.toProxy(), this.helpers);
        } catch (Y) {
          throw this.handleError(Y, R);
        }
      }
      if (x.iterator !== 0) {
        let P = x.iterator, ee;
        for (; ee = R.nodes[R.indexes[P]]; )
          if (R.indexes[P] += 1, !ee[e]) {
            ee[e] = !0, S.push(y(ee));
            return;
          }
        x.iterator = 0, delete R.indexes[P];
      }
      let $ = x.events;
      for (; x.eventIndex < $.length; ) {
        let P = $[x.eventIndex];
        if (x.eventIndex += 1, P === d) {
          R.nodes && R.nodes.length && (R[e] = !0, x.iterator = R.getIterator());
          return;
        } else if (this.listeners[P]) {
          x.visitors = this.listeners[P];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let x = f(S);
      for (let R of x)
        if (R === d)
          S.nodes && S.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[R];
          if (O && this.visitSync(O, S.toProxy()))
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
  return k.registerPostcss = (A) => {
    v = A;
  }, Eo = k, k.default = k, p.registerLazyResult(k), s.registerLazyResult(k), Eo;
}
var Co, ru;
function wk() {
  if (ru) return Co;
  ru = 1;
  let e = Qd(), t = us(), r = ep(), n = za();
  const i = Oa();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let d = new e(h, o, this._opts, l);
      if (d.isMap()) {
        let [m, f] = d.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        d.clearAnnotation(), this.result.css = d.css;
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
  return Co = s, s.default = s, Co;
}
var Mo, nu;
function xk() {
  if (nu) return Mo;
  nu = 1;
  let e = wk(), t = np(), r = Ia(), n = ui();
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
  return Mo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Mo;
}
var Ro, iu;
function Sk() {
  if (iu) return Ro;
  iu = 1;
  let e = ps(), t = Zd(), r = fs(), n = Na(), i = hs(), s = ui(), a = Pa();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((u) => c(u));
    let { inputs: o, ...h } = l;
    if (o) {
      p = [];
      for (let u of o) {
        let d = { ...u, __proto__: i.prototype };
        d.map && (d.map = {
          ...d.map,
          __proto__: t.prototype
        }), p.push(d);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((u) => c(u, p))), h.source) {
      let { inputId: u, ...d } = h.source;
      h.source = d, u != null && (h.source.input = p[u]);
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
  return Ro = c, c.default = c, Ro;
}
var To, su;
function Ek() {
  if (su) return To;
  su = 1;
  let e = La(), t = ps(), r = np(), n = sn(), i = xk(), s = us(), a = Sk(), c = Ia(), l = tp(), p = fs(), o = Na(), h = Oa(), u = hs(), d = za(), m = rp(), f = Pa(), y = ui(), E = ds();
  function v(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return v.plugin = function(A, S) {
    let x = !1;
    function R(...$) {
      console && console.warn && !x && (x = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let P = S(...$);
      return P.postcssPlugin = A, P.postcssVersion = new i().version, P;
    }
    let O;
    return Object.defineProperty(R, "postcss", {
      get() {
        return O || (O = R()), O;
      }
    }), R.process = function($, P, ee) {
      return v([R(ee)]).process($, P);
    }, R;
  }, v.stringify = s, v.parse = d, v.fromJSON = a, v.list = m, v.comment = (k) => new p(k), v.atRule = (k) => new o(k), v.decl = (k) => new t(k), v.rule = (k) => new f(k), v.root = (k) => new y(k), v.document = (k) => new c(k), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = p, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = u, v.Rule = f, v.Root = y, v.Node = E, r.registerPostcss(v), To = v, v.default = v, To;
}
var Ck = Ek();
const Ge = /* @__PURE__ */ hk(Ck);
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
var Mk = Object.defineProperty, Rk = (e, t, r) => t in e ? Mk(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Bt = (e, t, r) => Rk(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Tk(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ak(e) {
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
var zi = { exports: {} }, ou;
function Lk() {
  if (ou) return zi.exports;
  ou = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return zi.exports = t(), zi.exports.createColors = t, zi.exports;
}
const _k = {}, Ik = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _k
}, Symbol.toStringTag, { value: "Module" })), Qt = /* @__PURE__ */ Ak(Ik);
var Ao, au;
function $a() {
  if (au) return Ao;
  au = 1;
  let e = /* @__PURE__ */ Lk(), t = Qt;
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
        let { bold: u, gray: d, red: m } = e.createColors(!0);
        o = (f) => u(m(f)), h = (f) => d(f);
      } else
        o = h = (u) => u;
      return a.slice(c, l).map((u, d) => {
        let m = c + 1 + d, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
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
  return Ao = r, r.default = r, Ao;
}
var $i = {}, lu;
function Da() {
  return lu || (lu = 1, $i.isClean = Symbol("isClean"), $i.my = Symbol("my")), $i;
}
var Lo, cu;
function ip() {
  if (cu) return Lo;
  cu = 1;
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
  return Lo = r, r.default = r, Lo;
}
var _o, uu;
function ms() {
  if (uu) return _o;
  uu = 1;
  let e = ip();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return _o = t, t.default = t, _o;
}
var Io, du;
function gs() {
  if (du) return Io;
  du = 1;
  let { isClean: e, my: t } = Da(), r = $a(), n = ip(), i = ms();
  function s(c, l) {
    let p = new c.constructor();
    for (let o in c) {
      if (!Object.prototype.hasOwnProperty.call(c, o) || o === "proxyCache") continue;
      let h = c[o], u = typeof h;
      o === "parent" && u === "object" ? l && (p[o] = l) : o === "source" ? p[o] = h : Array.isArray(h) ? p[o] = h.map((d) => s(d, p)) : (u === "object" && h !== null && (h = s(h)), p[o] = h);
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
      let o = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let d = 0; d < l; d++)
        o[d] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(l.word);
        u !== -1 && (p = this.positionInside(u, h), o = this.positionInside(u + l.word.length, h));
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
      let u = 0;
      for (let d in this) {
        if (!Object.prototype.hasOwnProperty.call(this, d) || d === "parent" || d === "proxyCache") continue;
        let m = this[d];
        if (Array.isArray(m))
          o[d] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          o[d] = m.toJSON(null, p);
        else if (d === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), o[d] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          o[d] = m;
      }
      return h && (o.inputs = [...p.keys()].map((d) => d.toJSON())), o;
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
      for (let u in o) h[u] = o[u];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Io = a, a.default = a, Io;
}
var Oo, pu;
function ys() {
  if (pu) return Oo;
  pu = 1;
  let e = gs();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Oo = t, t.default = t, Oo;
}
var No, hu;
function Ok() {
  if (hu) return No;
  hu = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return No = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, No;
}
var Po, fu;
function sp() {
  if (fu) return Po;
  fu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { existsSync: r, readFileSync: n } = Qt, { dirname: i, join: s } = Qt;
  function a(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, o) {
      if (o.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = o.map ? o.map.prev : void 0, u = this.loadMap(o.from, h);
      !this.mapFile && o.from && (this.mapFile = o.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let o = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, d = /^data:application\/json,/;
      if (u.test(p) || d.test(p))
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
      let h = p.lastIndexOf(o.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
  return Po = c, c.default = c, Po;
}
var zo, mu;
function bs() {
  if (mu) return zo;
  mu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { fileURLToPath: r, pathToFileURL: n } = Qt, { isAbsolute: i, resolve: s } = Qt, { nanoid: a } = /* @__PURE__ */ Ok(), c = Qt, l = $a(), p = sp(), o = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class d {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!u || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), u && h) {
        let E = new p(this.css, y);
        if (E.text) {
          this.map = E;
          let v = E.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, E, v = {}) {
      let k, A, S;
      if (y && typeof y == "object") {
        let R = y, O = E;
        if (typeof R.offset == "number") {
          let $ = this.fromOffset(R.offset);
          y = $.line, E = $.col;
        } else
          y = R.line, E = R.column;
        if (typeof O.offset == "number") {
          let $ = this.fromOffset(O.offset);
          A = $.line, S = $.col;
        } else
          A = O.line, S = O.column;
      } else if (!E) {
        let R = this.fromOffset(y);
        y = R.line, E = R.col;
      }
      let x = this.origin(y, E, A, S);
      return x ? k = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        v.plugin
      ) : k = new l(
        f,
        A === void 0 ? y : { column: E, line: y },
        A === void 0 ? E : { column: S, line: A },
        this.css,
        this.file,
        v.plugin
      ), k.input = { column: E, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (k.input.url = n(this.file).toString()), k.input.file = this.file), k;
    }
    fromOffset(f) {
      let y, E;
      if (this[o])
        E = this[o];
      else {
        let k = this.css.split(`
`);
        E = new Array(k.length);
        let A = 0;
        for (let S = 0, x = k.length; S < x; S++)
          E[S] = A, A += k[S].length + 1;
        this[o] = E;
      }
      y = E[E.length - 1];
      let v = 0;
      if (f >= y)
        v = E.length - 1;
      else {
        let k = E.length - 2, A;
        for (; v < k; )
          if (A = v + (k - v >> 1), f < E[A])
            k = A - 1;
          else if (f >= E[A + 1])
            v = A + 1;
          else {
            v = A;
            break;
          }
      }
      return {
        col: f - E[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, E, v) {
      if (!this.map) return !1;
      let k = this.map.consumer(), A = k.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof E == "number" && (S = k.originalPositionFor({ column: v, line: E }));
      let x;
      i(A.source) ? x = n(A.source) : x = new URL(
        A.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: A.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: A.line,
        url: x.toString()
      };
      if (x.protocol === "file:")
        if (r)
          R.file = r(x);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = k.sourceContentFor(A.source);
      return O && (R.source = O), R;
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
  return zo = d, d.default = d, c && c.registerInput && c.registerInput(d), zo;
}
var $o, gu;
function op() {
  if (gu) return $o;
  gu = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { dirname: r, relative: n, resolve: i, sep: s } = Qt, { pathToFileURL: a } = Qt, c = bs(), l = !!(e && t), p = !!(r && i && n && s);
  class o {
    constructor(u, d, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = d, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let d = `
`;
      this.css.includes(`\r
`) && (d = `\r
`), this.css += d + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let d = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, d, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let d = this.root.nodes.length - 1; d >= 0; d--)
            u = this.root.nodes[d], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(d);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && l && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (d) => {
          u += d;
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
      let u = 1, d = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, y, E;
      this.stringify(this.root, (v, k, A) => {
        if (this.css += v, k && A !== "end" && (f.generated.line = u, f.generated.column = d - 1, k.source && k.source.start ? (f.source = this.sourcePath(k), f.original.line = k.source.start.line, f.original.column = k.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (u += y.length, E = v.lastIndexOf(`
`), d = v.length - E) : d += v.length, k && A !== "start") {
          let S = k.parent || { raws: {} };
          (!(k.type === "decl" || k.type === "atrule" && !k.nodes) || k !== S.last || S.raws.semicolon) && (k.source && k.source.end ? (f.source = this.sourcePath(k), f.original.line = k.source.end.line, f.original.column = k.source.end.column - 1, f.generated.line = u, f.generated.column = d - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = d - 1, this.map.addMapping(f)));
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
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((d) => d.inline) : !0;
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
      let d = this.memoizedPaths.get(u);
      if (d) return d;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(i(m, this.mapOpts.annotation)));
      let f = n(m, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let d = u.source.input.map;
              this.previousMaps.includes(d) || this.previousMaps.push(d);
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
        this.root.walk((d) => {
          if (d.source) {
            let m = d.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, d.source.input.css);
            }
          }
        });
      else if (this.css) {
        let d = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(d, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let d = this.memoizedFileURLs.get(u);
      if (d) return d;
      if (a) {
        let m = a(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let d = this.memoizedURLs.get(u);
      if (d) return d;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return $o = o, $o;
}
var Do, yu;
function ks() {
  if (yu) return Do;
  yu = 1;
  let e = gs();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Do = t, t.default = t, Do;
}
var Fo, bu;
function on() {
  if (bu) return Fo;
  bu = 1;
  let { isClean: e, my: t } = Da(), r = ys(), n = ks(), i = gs(), s, a, c, l;
  function p(u) {
    return u.map((d) => (d.nodes && (d.nodes = p(d.nodes)), delete d.source, d));
  }
  function o(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let d of u.proxyOf.nodes)
        o(d);
  }
  class h extends i {
    append(...d) {
      for (let m of d) {
        let f = this.normalize(m, this.last);
        for (let y of f) this.proxyOf.nodes.push(y);
      }
      return this.markDirty(), this;
    }
    cleanRaws(d) {
      if (super.cleanRaws(d), this.nodes)
        for (let m of this.nodes) m.cleanRaws(d);
    }
    each(d) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, y;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], y = d(this.proxyOf.nodes[f], f), y !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], y;
    }
    every(d) {
      return this.nodes.every(d);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let d = this.lastEach;
      return this.indexes[d] = 0, d;
    }
    getProxyProcessor() {
      return {
        get(d, m) {
          return m === "proxyOf" ? d : d[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => d[m](
            ...f.map((y) => typeof y == "function" ? (E, v) => y(E.toProxy(), v) : y)
          ) : m === "every" || m === "some" ? (f) => d[m](
            (y, ...E) => f(y.toProxy(), ...E)
          ) : m === "root" ? () => d.root().toProxy() : m === "nodes" ? d.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? d[m].toProxy() : d[m] : d[m];
        },
        set(d, m, f) {
          return d[m] === f || (d[m] = f, (m === "name" || m === "params" || m === "selector") && d.markDirty()), !0;
        }
      };
    }
    index(d) {
      return typeof d == "number" ? d : (d.proxyOf && (d = d.proxyOf), this.proxyOf.nodes.indexOf(d));
    }
    insertAfter(d, m) {
      let f = this.index(d), y = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(d);
      for (let v of y) this.proxyOf.nodes.splice(f + 1, 0, v);
      let E;
      for (let v in this.indexes)
        E = this.indexes[v], f < E && (this.indexes[v] = E + y.length);
      return this.markDirty(), this;
    }
    insertBefore(d, m) {
      let f = this.index(d), y = f === 0 ? "prepend" : !1, E = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(d);
      for (let k of E) this.proxyOf.nodes.splice(f, 0, k);
      let v;
      for (let k in this.indexes)
        v = this.indexes[k], f <= v && (this.indexes[k] = v + E.length);
      return this.markDirty(), this;
    }
    normalize(d, m) {
      if (typeof d == "string")
        d = p(s(d).nodes);
      else if (typeof d > "u")
        d = [];
      else if (Array.isArray(d)) {
        d = d.slice(0);
        for (let y of d)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (d.type === "root" && this.type !== "document") {
        d = d.nodes.slice(0);
        for (let y of d)
          y.parent && y.parent.removeChild(y, "ignore");
      } else if (d.type)
        d = [d];
      else if (d.prop) {
        if (typeof d.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof d.value != "string" && (d.value = String(d.value)), d = [new r(d)];
      } else if (d.selector)
        d = [new a(d)];
      else if (d.name)
        d = [new c(d)];
      else if (d.text)
        d = [new n(d)];
      else
        throw new Error("Unknown node type in node creation");
      return d.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && o(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
    }
    prepend(...d) {
      d = d.reverse();
      for (let m of d) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let y of f) this.proxyOf.nodes.unshift(y);
        for (let y in this.indexes)
          this.indexes[y] = this.indexes[y] + f.length;
      }
      return this.markDirty(), this;
    }
    push(d) {
      return d.parent = this, this.proxyOf.nodes.push(d), this;
    }
    removeAll() {
      for (let d of this.proxyOf.nodes) d.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(d) {
      d = this.index(d), this.proxyOf.nodes[d].parent = void 0, this.proxyOf.nodes.splice(d, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= d && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(d, m, f) {
      return f || (f = m, m = {}), this.walkDecls((y) => {
        m.props && !m.props.includes(y.prop) || m.fast && !y.value.includes(m.fast) || (y.value = y.value.replace(d, f));
      }), this.markDirty(), this;
    }
    some(d) {
      return this.nodes.some(d);
    }
    walk(d) {
      return this.each((m, f) => {
        let y;
        try {
          y = d(m, f);
        } catch (E) {
          throw m.addToError(E);
        }
        return y !== !1 && m.walk && (y = m.walk(d)), y;
      });
    }
    walkAtRules(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "atrule" && d.test(f.name))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "atrule" && f.name === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
        if (f.type === "atrule")
          return m(f, y);
      }));
    }
    walkComments(d) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return d(m, f);
      });
    }
    walkDecls(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "decl" && d.test(f.prop))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "decl" && f.prop === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
        if (f.type === "decl")
          return m(f, y);
      }));
    }
    walkRules(d, m) {
      return m ? d instanceof RegExp ? this.walk((f, y) => {
        if (f.type === "rule" && d.test(f.selector))
          return m(f, y);
      }) : this.walk((f, y) => {
        if (f.type === "rule" && f.selector === d)
          return m(f, y);
      }) : (m = d, this.walk((f, y) => {
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
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    a = u;
  }, h.registerAtRule = (u) => {
    c = u;
  }, h.registerRoot = (u) => {
    l = u;
  }, Fo = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, c.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, a.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, l.prototype), u[t] = !0, u.nodes && u.nodes.forEach((d) => {
      h.rebuild(d);
    });
  }, Fo;
}
var Uo, ku;
function Fa() {
  if (ku) return Uo;
  ku = 1;
  let e = on(), t, r;
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
  }, Uo = n, n.default = n, Uo;
}
var Bo, vu;
function ap() {
  if (vu) return Bo;
  vu = 1;
  let e = {};
  return Bo = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Bo;
}
var qo, wu;
function lp() {
  if (wu) return qo;
  wu = 1;
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
  return qo = e, e.default = e, qo;
}
var jo, xu;
function Ua() {
  if (xu) return jo;
  xu = 1;
  let e = lp();
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
  return jo = t, t.default = t, jo;
}
var Wo, Su;
function Nk() {
  if (Su) return Wo;
  Su = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, p = 91, o = 93, h = 40, u = 41, d = 123, m = 125, f = 59, y = 42, E = 58, v = 64, k = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return Wo = function(O, $ = {}) {
    let P = O.css.valueOf(), ee = $.ignoreErrors, Y, _, Oe, je, fe, he, Ae, ze, Le, ve, Ze = P.length, U = 0, X = [], W = [];
    function Be() {
      return U;
    }
    function ue(oe) {
      throw O.error("Unclosed " + oe, U);
    }
    function re() {
      return W.length === 0 && U >= Ze;
    }
    function tt(oe) {
      if (W.length) return W.pop();
      if (U >= Ze) return;
      let Ne = oe ? oe.ignoreUnclosed : !1;
      switch (Y = P.charCodeAt(U), Y) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = U;
          do
            _ += 1, Y = P.charCodeAt(_);
          while (Y === s || Y === i || Y === c || Y === l || Y === a);
          ve = ["space", P.slice(U, _)], U = _ - 1;
          break;
        }
        case p:
        case o:
        case d:
        case m:
        case E:
        case f:
        case u: {
          let we = String.fromCharCode(Y);
          ve = [we, we, U];
          break;
        }
        case h: {
          if (ze = X.length ? X.pop()[1] : "", Le = P.charCodeAt(U + 1), ze === "url" && Le !== e && Le !== t && Le !== s && Le !== i && Le !== c && Le !== a && Le !== l) {
            _ = U;
            do {
              if (he = !1, _ = P.indexOf(")", _ + 1), _ === -1)
                if (ee || Ne) {
                  _ = U;
                  break;
                } else
                  ue("bracket");
              for (Ae = _; P.charCodeAt(Ae - 1) === r; )
                Ae -= 1, he = !he;
            } while (he);
            ve = ["brackets", P.slice(U, _ + 1), U, _], U = _;
          } else
            _ = P.indexOf(")", U + 1), je = P.slice(U, _ + 1), _ === -1 || S.test(je) ? ve = ["(", "(", U] : (ve = ["brackets", je, U, _], U = _);
          break;
        }
        case e:
        case t: {
          Oe = Y === e ? "'" : '"', _ = U;
          do {
            if (he = !1, _ = P.indexOf(Oe, _ + 1), _ === -1)
              if (ee || Ne) {
                _ = U + 1;
                break;
              } else
                ue("string");
            for (Ae = _; P.charCodeAt(Ae - 1) === r; )
              Ae -= 1, he = !he;
          } while (he);
          ve = ["string", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case v: {
          k.lastIndex = U + 1, k.test(P), k.lastIndex === 0 ? _ = P.length - 1 : _ = k.lastIndex - 2, ve = ["at-word", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        case r: {
          for (_ = U, fe = !0; P.charCodeAt(_ + 1) === r; )
            _ += 1, fe = !fe;
          if (Y = P.charCodeAt(_ + 1), fe && Y !== n && Y !== s && Y !== i && Y !== c && Y !== l && Y !== a && (_ += 1, x.test(P.charAt(_)))) {
            for (; x.test(P.charAt(_ + 1)); )
              _ += 1;
            P.charCodeAt(_ + 1) === s && (_ += 1);
          }
          ve = ["word", P.slice(U, _ + 1), U, _], U = _;
          break;
        }
        default: {
          Y === n && P.charCodeAt(U + 1) === y ? (_ = P.indexOf("*/", U + 2) + 1, _ === 0 && (ee || Ne ? _ = P.length : ue("comment")), ve = ["comment", P.slice(U, _ + 1), U, _], U = _) : (A.lastIndex = U + 1, A.test(P), A.lastIndex === 0 ? _ = P.length - 1 : _ = A.lastIndex - 2, ve = ["word", P.slice(U, _ + 1), U, _], X.push(ve), U = _);
          break;
        }
      }
      return U++, ve;
    }
    function ht(oe) {
      W.push(oe);
    }
    return {
      back: ht,
      endOfFile: re,
      nextToken: tt,
      position: Be
    };
  }, Wo;
}
var Ho, Eu;
function Ba() {
  if (Eu) return Ho;
  Eu = 1;
  let e = on();
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
  return Ho = t, t.default = t, e.registerAtRule(t), Ho;
}
var Yo, Cu;
function di() {
  if (Cu) return Yo;
  Cu = 1;
  let e = on(), t, r;
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
  }, Yo = n, n.default = n, e.registerRoot(n), Yo;
}
var Vo, Mu;
function cp() {
  if (Mu) return Vo;
  Mu = 1;
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
  return Vo = e, e.default = e, Vo;
}
var Go, Ru;
function qa() {
  if (Ru) return Go;
  Ru = 1;
  let e = on(), t = cp();
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
  return Go = r, r.default = r, e.registerRule(r), Go;
}
var Xo, Tu;
function Pk() {
  if (Tu) return Xo;
  Tu = 1;
  let e = ys(), t = Nk(), r = ks(), n = Ba(), i = di(), s = qa();
  const a = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let o = p.length - 1; o >= 0; o--) {
      let h = p[o], u = h[3] || h[2];
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
      let u, d, m, f = !1, y = !1, E = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), u = o[0], u === "(" || u === "[" ? v.push(u === "(" ? ")" : "]") : u === "{" && v.length > 0 ? v.push("}") : u === v[v.length - 1] && v.pop(), v.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            y = !0;
            break;
          } else if (u === "}") {
            if (E.length > 0) {
              for (m = E.length - 1, d = E[m]; d && d[0] === "space"; )
                d = E[--m];
              d && (h.source.end = this.getPosition(d[3] || d[2]), h.source.end.offset++);
            }
            this.end(o);
            break;
          } else
            E.push(o);
        else
          E.push(o);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(E), E.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(E), this.raw(h, "params", E), f && (o = E[E.length - 1], h.source.end = this.getPosition(o[3] || o[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(o) {
      let h = this.colon(o);
      if (h === !1) return;
      let u = 0, d;
      for (let m = h - 1; m >= 0 && (d = o[m], !(d[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        d[0] === "word" ? d[3] + 1 : d[2]
      );
    }
    colon(o) {
      let h = 0, u, d, m;
      for (let [f, y] of o.entries()) {
        if (u = y, d = u[0], d === "(" && (h += 1), d === ")" && (h -= 1), h === 0 && d === ":")
          if (!m)
            this.doubleColon(u);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = u;
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
        let d = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = d[2], h.raws.left = d[1], h.raws.right = d[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(o, h) {
      let u = new e();
      this.init(u, o[0][2]);
      let d = o[o.length - 1];
      for (d[0] === ";" && (this.semicolon = !0, o.pop()), u.source.end = this.getPosition(
        d[3] || d[2] || c(o)
      ), u.source.end.offset++; o[0][0] !== "word"; )
        o.length === 1 && this.unknownWord(o), u.raws.before += o.shift()[1];
      for (u.source.start = this.getPosition(o[0][2]), u.prop = ""; o.length; ) {
        let v = o[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        u.prop += o.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; o.length; )
        if (m = o.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let k = this.stringFrom(o, v);
          k = this.spacesFromEnd(o) + k, k !== " !important" && (u.raws.important = k);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let k = o.slice(0), A = "";
          for (let S = v; S > 0; S--) {
            let x = k[S][0];
            if (A.trim().indexOf("!") === 0 && x !== "space")
              break;
            A = k.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = A, o = k);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      o.some((v) => v[0] !== "space" && v[0] !== "comment") && (u.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(u, "value", f.concat(o), h), u.value.includes(":") && !h && this.checkMissedSemicolon(o);
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
      let h = !1, u = null, d = !1, m = null, f = [], y = o[1].startsWith("--"), E = [], v = o;
      for (; v; ) {
        if (u = v[0], E.push(v), u === "(" || u === "[")
          m || (m = v), f.push(u === "(" ? ")" : "]");
        else if (y && d && u === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (d) {
              this.decl(E, y);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(E);
            return;
          } else if (u === "}") {
            this.tokenizer.back(E.pop()), h = !0;
            break;
          } else u === ":" && (d = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && d) {
        if (!y)
          for (; E.length && (v = E[E.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(E.pop());
        this.decl(E, y);
      } else
        this.unknownWord(E);
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
    raw(o, h, u, d) {
      let m, f, y = u.length, E = "", v = !0, k, A;
      for (let S = 0; S < y; S += 1)
        m = u[S], f = m[0], f === "space" && S === y - 1 && !d ? v = !1 : f === "comment" ? (A = u[S - 1] ? u[S - 1][0] : "empty", k = u[S + 1] ? u[S + 1][0] : "empty", !a[A] && !a[k] ? E.slice(-1) === "," ? v = !1 : E += m[1] : v = !1) : E += m[1];
      if (!v) {
        let S = u.reduce((x, R) => x + R[1], "");
        o.raws[h] = { raw: S, value: E };
      }
      o[h] = E;
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
      for (let d = h; d < o.length; d++)
        u += o[d][1];
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
  return Xo = l, Xo;
}
var Ko, Au;
function ja() {
  if (Au) return Ko;
  Au = 1;
  let e = on(), t = Pk(), r = bs();
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
  return Ko = n, n.default = n, e.registerParse(n), Ko;
}
var Jo, Lu;
function up() {
  if (Lu) return Jo;
  Lu = 1;
  let { isClean: e, my: t } = Da(), r = op(), n = ms(), i = on(), s = Fa(), a = ap(), c = Ua(), l = ja(), p = di();
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
  }, d = 0;
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, x = o[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      x,
      x + "-" + S,
      d,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : A.append ? [x, d, x + "Exit"] : [x, x + "Exit"];
  }
  function y(A) {
    let S;
    return A.type === "document" ? S = ["Document", d, "DocumentExit"] : A.type === "root" ? S = ["Root", d, "RootExit"] : S = f(A), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: A,
      visitorIndex: 0,
      visitors: []
    };
  }
  function E(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => E(S)), A;
  }
  let v = {};
  class k {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        O = E(x);
      else if (x instanceof k || x instanceof c)
        O = E(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
      else {
        let $ = l;
        R.syntax && ($ = R.syntax.parse), R.parser && ($ = R.parser), $.parse && ($ = $.parse);
        try {
          O = $(x, R);
        } catch (P) {
          this.processed = !0, this.error = P;
        }
        O && !O[t] && i.rebuild(O);
      }
      this.result = new c(S, O, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
          let O = R.postcssPlugin, $ = R.postcssVersion, P = this.result.processor.version, ee = $.split("."), Y = P.split(".");
          (ee[0] !== Y[0] || parseInt(ee[1]) > parseInt(Y[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + P + ", but " + O + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (x, R, O) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([x, O]);
      };
      for (let x of this.plugins)
        if (typeof x == "object")
          for (let R in x) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${x.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[R])
              if (typeof x[R] == "object")
                for (let O in x[R])
                  O === "*" ? S(x, R, x[R][O]) : S(
                    x,
                    R + "-" + O.toLowerCase(),
                    x[R][O]
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
          } catch (O) {
            throw this.handleError(O);
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
              } catch (O) {
                let $ = x[x.length - 1].node;
                throw this.handleError(O, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [x, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = x;
            try {
              if (S.type === "document") {
                let O = S.nodes.map(
                  ($) => R($, this.helpers)
                );
                await Promise.all(O);
              } else
                await R(S, this.helpers);
            } catch (O) {
              throw this.handleError(O);
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
      let O = new r(x, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
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
      for (let [R, O] of S) {
        this.result.lastPlugin = R;
        let $;
        try {
          $ = O(x, this.helpers);
        } catch (P) {
          throw this.handleError(P, x.proxyOf);
        }
        if (x.type !== "root" && x.type !== "document" && !x.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let x = S[S.length - 1], { node: R, visitors: O } = x;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        S.pop();
        return;
      }
      if (O.length > 0 && x.visitorIndex < O.length) {
        let [P, ee] = O[x.visitorIndex];
        x.visitorIndex += 1, x.visitorIndex === O.length && (x.visitors = [], x.visitorIndex = 0), this.result.lastPlugin = P;
        try {
          return ee(R.toProxy(), this.helpers);
        } catch (Y) {
          throw this.handleError(Y, R);
        }
      }
      if (x.iterator !== 0) {
        let P = x.iterator, ee;
        for (; ee = R.nodes[R.indexes[P]]; )
          if (R.indexes[P] += 1, !ee[e]) {
            ee[e] = !0, S.push(y(ee));
            return;
          }
        x.iterator = 0, delete R.indexes[P];
      }
      let $ = x.events;
      for (; x.eventIndex < $.length; ) {
        let P = $[x.eventIndex];
        if (x.eventIndex += 1, P === d) {
          R.nodes && R.nodes.length && (R[e] = !0, x.iterator = R.getIterator());
          return;
        } else if (this.listeners[P]) {
          x.visitors = this.listeners[P];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let x = f(S);
      for (let R of x)
        if (R === d)
          S.nodes && S.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[R];
          if (O && this.visitSync(O, S.toProxy()))
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
  return k.registerPostcss = (A) => {
    v = A;
  }, Jo = k, k.default = k, p.registerLazyResult(k), s.registerLazyResult(k), Jo;
}
var Zo, _u;
function zk() {
  if (_u) return Zo;
  _u = 1;
  let e = op(), t = ms(), r = ap(), n = ja();
  const i = Ua();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let o, h = t;
      this.result = new i(this._processor, o, this._opts), this.result.css = l;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let d = new e(h, o, this._opts, l);
      if (d.isMap()) {
        let [m, f] = d.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        d.clearAnnotation(), this.result.css = d.css;
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
  return Zo = s, s.default = s, Zo;
}
var Qo, Iu;
function $k() {
  if (Iu) return Qo;
  Iu = 1;
  let e = zk(), t = up(), r = Fa(), n = di();
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
  return Qo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Qo;
}
var ea, Ou;
function Dk() {
  if (Ou) return ea;
  Ou = 1;
  let e = ys(), t = sp(), r = ks(), n = Ba(), i = bs(), s = di(), a = qa();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((u) => c(u));
    let { inputs: o, ...h } = l;
    if (o) {
      p = [];
      for (let u of o) {
        let d = { ...u, __proto__: i.prototype };
        d.map && (d.map = {
          ...d.map,
          __proto__: t.prototype
        }), p.push(d);
      }
    }
    if (h.nodes && (h.nodes = l.nodes.map((u) => c(u, p))), h.source) {
      let { inputId: u, ...d } = h.source;
      h.source = d, u != null && (h.source.input = p[u]);
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
  return ea = c, c.default = c, ea;
}
var ta, Nu;
function Fk() {
  if (Nu) return ta;
  Nu = 1;
  let e = $a(), t = ys(), r = up(), n = on(), i = $k(), s = ms(), a = Dk(), c = Fa(), l = lp(), p = ks(), o = Ba(), h = Ua(), u = bs(), d = ja(), m = cp(), f = qa(), y = di(), E = gs();
  function v(...k) {
    return k.length === 1 && Array.isArray(k[0]) && (k = k[0]), new i(k);
  }
  return v.plugin = function(A, S) {
    let x = !1;
    function R(...$) {
      console && console.warn && !x && (x = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let P = S(...$);
      return P.postcssPlugin = A, P.postcssVersion = new i().version, P;
    }
    let O;
    return Object.defineProperty(R, "postcss", {
      get() {
        return O || (O = R()), O;
      }
    }), R.process = function($, P, ee) {
      return v([R(ee)]).process($, P);
    }, R;
  }, v.stringify = s, v.parse = d, v.fromJSON = a, v.list = m, v.comment = (k) => new p(k), v.atRule = (k) => new o(k), v.decl = (k) => new t(k), v.rule = (k) => new f(k), v.root = (k) => new y(k), v.document = (k) => new c(k), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = p, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = u, v.Rule = f, v.Root = y, v.Node = E, r.registerPostcss(v), ta = v, v.default = v, ta;
}
var Uk = Fk();
const Xe = /* @__PURE__ */ Tk(Uk);
Xe.stringify;
Xe.fromJSON;
Xe.plugin;
Xe.parse;
Xe.list;
Xe.document;
Xe.comment;
Xe.atRule;
Xe.rule;
Xe.decl;
Xe.root;
Xe.CssSyntaxError;
Xe.Declaration;
Xe.Container;
Xe.Processor;
Xe.Document;
Xe.Comment;
Xe.Warning;
Xe.AtRule;
Xe.Result;
Xe.Input;
Xe.Rule;
Xe.Root;
Xe.Node;
class Wa {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Bt(this, "parentElement", null), Bt(this, "parentNode", null), Bt(this, "ownerDocument"), Bt(this, "firstChild", null), Bt(this, "lastChild", null), Bt(this, "previousSibling", null), Bt(this, "nextSibling", null), Bt(this, "ELEMENT_NODE", 1), Bt(this, "TEXT_NODE", 3), Bt(this, "nodeType"), Bt(this, "nodeName"), Bt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Wa) {
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
const Pu = {
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
}, zu = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Di = {}, dp = {}, Bk = () => !!globalThis.Zone;
function Ha(e) {
  if (Di[e])
    return Di[e];
  const t = globalThis[e], r = t.prototype, n = e in Pu ? Pu[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in zu ? zu[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Bk())
    return Di[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), dp[e] = () => c.remove()) : c.remove(), Di[e] = p;
  } catch {
    return r;
  }
}
const ra = {};
function kr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ra[i])
    return ra[i].call(
      t
    );
  const s = Ha(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (ra[i] = a, a.call(t)) : t[r];
}
const na = {};
function pp(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (na[n])
    return na[n].bind(
      t
    );
  const s = Ha(e)[r];
  return typeof s != "function" ? t[r] : (na[n] = s, s.bind(t));
}
function qk(e) {
  return kr("Node", e, "ownerDocument");
}
function jk(e) {
  return kr("Node", e, "childNodes");
}
function Wk(e) {
  return kr("Node", e, "parentNode");
}
function Hk(e) {
  return kr("Node", e, "parentElement");
}
function Yk(e) {
  return kr("Node", e, "textContent");
}
function Vk(e, t) {
  return pp("Node", e, "contains")(t);
}
function Gk(e) {
  return pp("Node", e, "getRootNode")();
}
function Xk(e) {
  return !e || !("host" in e) ? null : kr("ShadowRoot", e, "host");
}
function Kk(e) {
  return e.styleSheets;
}
function Jk(e) {
  return !e || !("shadowRoot" in e) ? null : kr("Element", e, "shadowRoot");
}
function Zk(e, t) {
  return kr("Element", e, "querySelector")(t);
}
function Qk(e, t) {
  return kr("Element", e, "querySelectorAll")(t);
}
function hp() {
  return [
    Ha("MutationObserver").constructor,
    dp.MutationObserver ?? (() => {
    })
  ];
}
let ai = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (ai = () => (/* @__PURE__ */ new Date()).getTime());
function an(e, t, r) {
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
const ke = {
  ownerDocument: qk,
  childNodes: jk,
  parentNode: Wk,
  parentElement: Hk,
  textContent: Yk,
  contains: Vk,
  getRootNode: Gk,
  host: Xk,
  styleSheets: Kk,
  shadowRoot: Jk,
  querySelector: Zk,
  querySelectorAll: Qk,
  nowTimestamp: ai,
  mutationObserverCtor: hp,
  patch: an
};
function St(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const En = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let $u = {
  map: {},
  getId() {
    return console.error(En), -1;
  },
  getNode() {
    return console.error(En), null;
  },
  removeNodeFromMap() {
    console.error(En);
  },
  has() {
    return console.error(En), !1;
  },
  reset() {
    console.error(En);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && ($u = new Proxy($u, {
  get(e, t, r) {
    return t === "map" && console.error(En), Reflect.get(e, t, r);
  }
}));
function li(e, t, r = {}) {
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
function vs(e, t, r, n, i = window) {
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
  ), () => vs(e, t, s || {}, !0);
}
function fp(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = ke.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = ke.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function mp() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function gp() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function yp(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ke.parentElement(e) : null;
}
function Et(e, t, r, n) {
  if (!e)
    return !1;
  const i = yp(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (ts(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function ev(e, t) {
  return t.getId(e) !== -1;
}
function ia(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === oi;
}
function bp(e, t) {
  if (ei(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ke.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? bp(n, t) : !0;
}
function ga(e) {
  return !!e.changedTouches;
}
function tv(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function kp(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function vp(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ya(e) {
  return e ? e instanceof Wa && "shadowRoot" in e ? !!e.shadowRoot : !!ke.shadowRoot(e) : !1;
}
class rv {
  constructor() {
    G(this, "id", 1), G(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), G(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function wp(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ke.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ke.host(ke.getRootNode(e)) && (r = ke.host(ke.getRootNode(e))), r;
}
function nv(e) {
  let t = e, r;
  for (; r = wp(t); )
    t = r;
  return t;
}
function iv(e) {
  const t = ke.ownerDocument(e);
  if (!t) return !1;
  const r = nv(e);
  return ke.contains(t, r);
}
function xp(e) {
  const t = ke.ownerDocument(e);
  return t ? ke.contains(t, e) || iv(e) : !1;
}
var Ce = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ce || {}), xe = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(xe || {}), At = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(At || {}), mr = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(mr || {}), Dn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Dn || {}), Cn = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Cn || {}), Sp = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Sp || {});
function Du(e) {
  return "__ln" in e;
}
class sv {
  constructor() {
    G(this, "length", 0), G(this, "head", null), G(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && Du(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Du(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Fu = (e, t) => `${e}@${t}`;
class ov {
  constructor() {
    G(this, "frozen", !1), G(this, "locked", !1), G(this, "texts", []), G(this, "attributes", []), G(this, "attributeMap", /* @__PURE__ */ new WeakMap()), G(this, "removes", []), G(this, "mapRemoves", []), G(this, "movedMap", {}), G(this, "addedSet", /* @__PURE__ */ new Set()), G(this, "movedSet", /* @__PURE__ */ new Set()), G(this, "droppedSet", /* @__PURE__ */ new Set()), G(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), G(this, "mutationCb"), G(this, "blockClass"), G(this, "blockSelector"), G(this, "maskTextClass"), G(this, "maskTextSelector"), G(this, "inlineStylesheet"), G(this, "maskInputOptions"), G(this, "maskTextFn"), G(this, "maskInputFn"), G(this, "keepIframeSrcFn"), G(this, "recordCanvas"), G(this, "inlineImages"), G(this, "slimDOMOptions"), G(this, "dataURLOptions"), G(this, "doc"), G(this, "mirror"), G(this, "iframeManager"), G(this, "stylesheetManager"), G(this, "shadowDomManager"), G(this, "canvasManager"), G(this, "processedNodeManager"), G(this, "unattachedDoc"), G(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), G(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new sv(), i = (l) => {
        let p = l, o = oi;
        for (; o === oi; )
          p = p && p.nextSibling, o = p && this.mirror.getId(p);
        return o;
      }, s = (l) => {
        const p = ke.parentNode(l);
        if (!p || !xp(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (o = !0);
        }
        const h = ei(p) ? this.mirror.getId(wp(l)) : this.mirror.getId(p), u = i(l);
        if (h === -1 || u === -1)
          return n.addNode(l);
        const d = Rn(l, {
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
            kp(m, this.mirror) && this.iframeManager.addIframe(m), vp(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ya(l) && this.shadowDomManager.addShadowRoot(ke.shadowRoot(l), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: o
        });
        d && (t.push({
          parentId: h,
          nextId: u,
          node: d
        }), r.add(d.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        Uu(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(ke.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Bu(this.droppedSet, l) && !Uu(this.removesSubTreeCache, l, this.mirror) || Bu(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const p = this.mirror.getId(ke.parentNode(a.value)), o = i(a.value);
          p !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let p = n.tail;
          for (; p; ) {
            const o = p;
            if (p = p.previous, o) {
              const h = this.mirror.getId(ke.parentNode(o.value));
              if (i(o.value) === -1) continue;
              if (h !== -1) {
                l = o;
                break;
              } else {
                const d = o.value, m = ke.parentNode(d);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = ke.host(m);
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
          const p = l.node, o = ke.parentNode(p);
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
    }), G(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        ke.childNodes(t),
        (i) => ke.textContent(i) || ""
      ).join("");
      r.attributes.value = Zi({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Qi(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), G(this, "processMutation", (t) => {
      if (!ia(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ke.textContent(t.target);
            !Et(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Xd(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, yp(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = Qi(r);
              i = Zi({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Et(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Gd(r.tagName, n))
              if (s.attributes[n] = Vd(
                this.doc,
                rn(r.tagName),
                rn(n),
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
            if (Et(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = ei(t.target) ? this.mirror.getId(ke.host(t.target)) : this.mirror.getId(t.target);
              Et(t.target, this.blockClass, this.blockSelector, !1) || ia(r, this.mirror, this.slimDOMOptions) || !ev(r, this.mirror) || (this.addedSet.has(r) ? (ba(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || bp(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Fu(n, i)] ? ba(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: ei(t.target) && ti(t.target) ? !0 : void 0
              }), av(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), G(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (ia(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Fu(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Et(t, this.blockClass, this.blockSelector, !1) || (ke.childNodes(t).forEach((n) => this.genAdds(n)), ya(t) && ke.childNodes(ke.shadowRoot(t)).forEach((n) => {
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
function ba(e, t) {
  e.delete(t), ke.childNodes(t).forEach((r) => ba(e, r));
}
function av(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ke.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Uu(e, t, r) {
  return e.size === 0 ? !1 : lv(e, t);
}
function lv(e, t, r) {
  const n = ke.parentNode(t);
  return n ? e.has(n) : !1;
}
function Bu(e, t) {
  return e.size === 0 ? !1 : Ep(e, t);
}
function Ep(e, t) {
  const r = ke.parentNode(t);
  return r ? e.has(r) ? !0 : Ep(e, r) : !1;
}
let ri;
function cv(e) {
  ri = e;
}
function uv() {
  ri = void 0;
}
const Ee = (e) => ri ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (ri && ri(n) === !0)
      return;
    throw n;
  }
} : e, Zr = [];
function pi(e) {
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
function Cp(e, t) {
  const r = new ov();
  Zr.push(r), r.init(e);
  const [n, i] = hp(), s = new n(
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
function dv({
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
  const l = li(
    Ee(
      (h) => {
        const u = Date.now() - c;
        e(
          a.map((d) => (d.timeOffset -= u, d)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), p = Ee(
    li(
      Ee((h) => {
        const u = pi(h), { clientX: d, clientY: m } = ga(h) ? h.changedTouches[0] : h;
        c || (c = ai()), a.push({
          x: d,
          y: m,
          id: n.getId(u),
          timeOffset: ai() - c
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
    St("mousemove", p, r),
    St("touchmove", p, r),
    St("drag", p, r)
  ];
  return Ee(() => {
    o.forEach((h) => h());
  });
}
function pv({
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
    const u = pi(h);
    if (Et(u, n, i, !0))
      return;
    let d = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          d = mr.Mouse;
          break;
        case "touch":
          d = mr.Touch;
          break;
        case "pen":
          d = mr.Pen;
          break;
      }
      d === mr.Touch ? At[o] === At.MouseDown ? m = "TouchStart" : At[o] === At.MouseUp && (m = "TouchEnd") : mr.Pen;
    } else ga(h) && (d = mr.Touch);
    d !== null ? (l = d, (m.startsWith("Touch") && d === mr.Touch || m.startsWith("Mouse") && d === mr.Mouse) && (d = null)) : At[o] === At.Click && (d = l, l = null);
    const f = ga(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(u), { clientX: E, clientY: v } = f;
    Ee(e)({
      type: At[m],
      id: y,
      x: E,
      y: v,
      ...d !== null && { pointerType: d }
    });
  };
  return Object.keys(At).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = rn(o);
    const u = p(o);
    if (window.PointerEvent)
      switch (At[o]) {
        case At.MouseDown:
        case At.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case At.TouchStart:
        case At.TouchEnd:
          return;
      }
    c.push(St(h, u, t));
  }), Ee(() => {
    c.forEach((o) => o());
  });
}
function Mp({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Ee(
    li(
      Ee((c) => {
        const l = pi(c);
        if (!l || Et(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const o = fp(t.defaultView);
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
  return St("scroll", a, t);
}
function hv({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Ee(
    li(
      Ee(() => {
        const s = mp(), a = gp();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return St("resize", i, t);
}
const fv = ["INPUT", "TEXTAREA", "SELECT"], qu = /* @__PURE__ */ new WeakMap();
function mv({
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
    let k = pi(v);
    const A = v.isTrusted, S = k && k.tagName;
    if (k && S === "OPTION" && (k = ke.parentElement(k)), !k || !S || fv.indexOf(S) < 0 || Et(k, n, i, !0) || k.classList.contains(s) || a && k.matches(a))
      return;
    let x = k.value, R = !1;
    const O = Qi(k) || "";
    O === "radio" || O === "checkbox" ? R = k.checked : (c[S.toLowerCase()] || c[O]) && (x = Zi({
      element: k,
      maskInputOptions: c,
      tagName: S,
      type: O,
      value: x,
      maskInputFn: l
    })), u(
      k,
      o ? { text: x, isChecked: R, userTriggered: A } : { text: x, isChecked: R }
    );
    const $ = k.name;
    O === "radio" && $ && R && t.querySelectorAll(`input[type="radio"][name="${$}"]`).forEach((P) => {
      if (P !== k) {
        const ee = P.value;
        u(
          P,
          o ? { text: ee, isChecked: !R, userTriggered: !1 } : { text: ee, isChecked: !R }
        );
      }
    });
  }
  function u(v, k) {
    const A = qu.get(v);
    if (!A || A.text !== k.text || A.isChecked !== k.isChecked) {
      qu.set(v, k);
      const S = r.getId(v);
      Ee(e)({
        ...k,
        id: S
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => St(v, Ee(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((v) => v());
    };
  const y = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), E = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return y && y.set && m.push(
    ...E.map(
      (v) => vs(
        v[0],
        v[1],
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
    m.forEach((v) => v());
  });
}
function rs(e) {
  const t = [];
  function r(n, i) {
    if (Fi("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Fi("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Fi("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Fi("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Tr(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function gv({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Ee(
      (o, h, u) => {
        const [d, m] = u, { id: f, styleId: y } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
          adds: [{ rule: d, index: m }]
        }), o.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(o, h, u = this.cssRules.length) {
    const d = `${o} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [d, u]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: Ee(
      (o, h, u) => {
        const [d] = u, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: d }]
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
        const [d] = u, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: d
        }), o.apply(h, u);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: Ee(
      (o, h, u) => {
        const [d] = u, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: d
        }), o.apply(h, u);
      }
    )
  }));
  const l = {};
  Ui("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Ui("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Ui("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Ui("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: Ee(
          (u, d, m) => {
            const [f, y] = m, { id: E, styleId: v } = Tr(
              d.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (E && E !== -1 || v && v !== -1) && e({
              id: E,
              styleId: v,
              adds: [
                {
                  rule: f,
                  index: [
                    ...rs(d),
                    y || 0
                    // defaults to 0
                  ]
                }
              ]
            }), u.apply(d, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      p[o].deleteRule,
      {
        apply: Ee(
          (u, d, m) => {
            const [f] = m, { id: y, styleId: E } = Tr(
              d.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || E && E !== -1) && e({
              id: y,
              styleId: E,
              removes: [
                { index: [...rs(d), f] }
              ]
            }), u.apply(d, m);
          }
        )
      }
    );
  }), Ee(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = p[o].insertRule, h.prototype.deleteRule = p[o].deleteRule;
    });
  });
}
function Rp({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(ke.host(r));
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
function yv({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Ee(
      (c, l, p) => {
        var o;
        const [h, u, d] = p;
        if (r.has(h))
          return s.apply(l, [h, u, d]);
        const { id: m, styleId: f } = Tr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: h,
            value: u,
            priority: d
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: rs(l.parentRule)
        }), c.apply(l, p);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: Ee(
      (c, l, p) => {
        var o;
        const [h] = p;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: u, styleId: d } = Tr(
          (o = l.parentRule) == null ? void 0 : o.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (u && u !== -1 || d && d !== -1) && e({
          id: u,
          styleId: d,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: rs(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), Ee(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function bv({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Ee(
    (l) => li(
      Ee((p) => {
        const o = pi(p);
        if (!o || Et(o, t, r, !0))
          return;
        const { currentTime: h, volume: u, muted: d, playbackRate: m, loop: f } = o;
        e({
          type: l,
          id: n.getId(o),
          currentTime: h,
          volume: u,
          muted: d,
          playbackRate: m,
          loop: f
        });
      }),
      i.media || 500
    )
  ), c = [
    St("play", a(Cn.Play), s),
    St("pause", a(Cn.Pause), s),
    St("seeked", a(Cn.Seeked), s),
    St("volumechange", a(Cn.VolumeChange), s),
    St("ratechange", a(Cn.RateChange), s)
  ];
  return Ee(() => {
    c.forEach((l) => l());
  });
}
function kv({ fontCb: e, doc: t }) {
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
  const a = an(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          Ee(() => {
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
  }), n.push(a), Ee(() => {
    n.forEach((c) => c());
  });
}
function vv(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Ee(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const p = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const u = l.getRangeAt(h), { startContainer: d, startOffset: m, endContainer: f, endOffset: y } = u;
      Et(d, n, i, !0) || Et(f, n, i, !0) || p.push({
        start: r.getId(d),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: p });
  });
  return c(), St("selectionchange", c);
}
function wv({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : an(
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
function xv(e, t) {
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
    fontCb: u,
    selectionCb: d,
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
    t.font && t.font(...f), u(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), d(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function Sv(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  xv(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Cp(e, e.doc));
  const s = dv(e), a = pv(e), c = Mp(e), l = hv(e, {
    win: r
  }), p = mv(e), o = bv(e);
  let h = () => {
  }, u = () => {
  }, d = () => {
  }, m = () => {
  };
  e.recordDOM && (h = gv(e, { win: r }), u = Rp(e, e.doc), d = yv(e, {
    win: r
  }), e.collectFonts && (m = kv(e)));
  const f = vv(e), y = wv(e), E = [];
  for (const v of e.plugins)
    E.push(
      v.observer(v.callback, r, v.options)
    );
  return Ee(() => {
    Zr.forEach((v) => v.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), p(), o(), h(), u(), d(), m(), f(), y(), E.forEach((v) => v());
  });
}
function Fi(e) {
  return typeof window[e] < "u";
}
function Ui(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class ju {
  constructor(t) {
    G(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), G(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class Ev {
  constructor(t) {
    G(this, "iframes", /* @__PURE__ */ new WeakMap()), G(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), G(this, "crossOriginIframeMirror", new ju(Yd)), G(this, "crossOriginIframeStyleMirror"), G(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), G(this, "mirror"), G(this, "mutationCb"), G(this, "wrappedEmit"), G(this, "loadListener"), G(this, "stylesheetManager"), G(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new ju(
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
      case Ce.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: Ce.IncrementalSnapshot,
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
      case Ce.Meta:
      case Ce.Load:
      case Ce.DomContentLoaded:
        return !1;
      case Ce.Plugin:
        return r;
      case Ce.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case Ce.IncrementalSnapshot:
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
    t.type !== Sp.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Cv {
  constructor(t) {
    G(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), G(this, "mutationCb"), G(this, "scrollCb"), G(this, "bypassOptions"), G(this, "mirror"), G(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!ti(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Cp(
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
      Mp({
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
        this.mirror.getId(ke.host(t))
      ), this.restoreHandlers.push(
        Rp(
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
      an(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = ke.shadowRoot(this);
            return c && xp(this) && n.addShadowRoot(c, r), a;
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
var Tn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Mv = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Bi = 0; Bi < Tn.length; Bi++)
  Mv[Tn.charCodeAt(Bi)] = Bi;
var Rv = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Tn[t[r] >> 2], i += Tn[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Tn[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Tn[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Wu = /* @__PURE__ */ new Map();
function Tv(e, t) {
  let r = Wu.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Wu.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Tp = (e, t, r) => {
  if (!e || !(Lp(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Tv(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Hi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Hi(n, t, r));
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
    const n = e.constructor.name, i = Rv(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Hi(e.buffer, t, r),
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
          args: [Hi(e.data, t, r), e.width, e.height]
        };
      if (Lp(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Tp(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const Ap = (e, t, r) => e.map((n) => Hi(n, t, r)), Lp = (e, t) => !![
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
function Av(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = an(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...p) {
            return Et(this.canvas, r, n, !0) || setTimeout(() => {
              const o = Ap(p, t, this);
              e(this.canvas, {
                type: Dn["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = vs(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Dn["2D"],
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
function Lv(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Hu(e, t, r, n) {
  const i = [];
  try {
    const s = an(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!Et(this, t, r, !0)) {
            const p = Lv(c);
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
function Yu(e, t, r, n, i, s) {
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
        const p = an(
          e,
          l,
          function(o) {
            return function(...h) {
              const u = o.apply(this, h);
              if (Tp(u, s, this), "tagName" in this.canvas && !Et(this.canvas, n, i, !0)) {
                const d = Ap(h, s, this), m = {
                  type: t,
                  property: l,
                  args: d
                };
                r(this.canvas, m);
              }
              return u;
            };
          }
        );
        a.push(p);
      } catch {
        const p = vs(e, l, {
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
function _v(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Yu(
      t.WebGLRenderingContext.prototype,
      Dn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Yu(
      t.WebGL2RenderingContext.prototype,
      Dn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const _p = `(function() {
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
`, Vu = typeof self < "u" && self.Blob && new Blob([_p], { type: "text/javascript;charset=utf-8" });
function Iv(e) {
  let t;
  try {
    if (t = Vu && (self.URL || self.webkitURL).createObjectURL(Vu), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(_p),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Ov {
  constructor(t) {
    G(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), G(this, "rafStamps", { latestId: 0, invokeId: null }), G(this, "mirror"), G(this, "mutationCb"), G(this, "resetObservers"), G(this, "frozen", !1), G(this, "locked", !1), G(this, "processMutation", (l, p) => {
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
    const a = Hu(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new Iv();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: E, width: v, height: k } = m.data;
      this.mutationCb({
        id: f,
        type: Dn["2D"],
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
                    type: E
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
    const u = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        Et(f, n, i, !0) || m.push(f);
      }), m;
    }, d = (m) => {
      if (o && m - o < p) {
        h = requestAnimationFrame(d);
        return;
      }
      o = m, u().forEach(async (f) => {
        var y;
        const E = this.mirror.getId(f);
        if (c.get(E) || f.width === 0 || f.height === 0) return;
        if (c.set(E, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const k = f.getContext(f.__context);
          ((y = k == null ? void 0 : k.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && k.clear(k.COLOR_BUFFER_BIT);
        }
        const v = await createImageBitmap(f);
        l.postMessage(
          {
            id: E,
            bitmap: v,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [v]
        );
      }), h = requestAnimationFrame(d);
    };
    h = requestAnimationFrame(d), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Hu(
      t,
      r,
      n,
      !1
    ), s = Av(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = _v(
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
class Nv {
  constructor(t) {
    G(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), G(this, "mutationCb"), G(this, "adoptedStyleSheetCb"), G(this, "styleMirror", new rv()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: jd(c, s.href),
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
class Pv {
  constructor() {
    G(this, "nodeMap", /* @__PURE__ */ new WeakMap()), G(this, "active", !1);
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
let et, Yi, sa, ns = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Ec = e.contentWindow) == null ? void 0 : Ec.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Xt = qb();
function zr(e = {}) {
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
    maskInputOptions: u,
    slimDOMOptions: d,
    maskInputFn: m,
    maskTextFn: f,
    hooks: y,
    packFn: E,
    sampling: v = {},
    dataURLOptions: k = {},
    mousemoveWait: A,
    recordDOM: S = !0,
    recordCanvas: x = !1,
    recordCrossOriginIframes: R = !1,
    recordAfter: O = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: $ = !1,
    collectFonts: P = !1,
    inlineImages: ee = !1,
    plugins: Y,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: Oe = /* @__PURE__ */ new Set([]),
    errorHandler: je
  } = e;
  cv(je);
  const fe = R ? window.parent === window : !0;
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
  A !== void 0 && v.mousemove === void 0 && (v.mousemove = A), Xt.reset();
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
  } : u !== void 0 ? u : { password: !0 }, ze = Kd(d);
  tv();
  let Le, ve = 0;
  const Ze = (oe) => {
    for (const Ne of Y || [])
      Ne.eventProcessor && (oe = Ne.eventProcessor(oe));
    return E && // Disable packing events which will be emitted to parent frames.
    !he && (oe = E(oe)), oe;
  };
  et = (oe, Ne) => {
    var we;
    const de = oe;
    if (de.timestamp = ai(), (we = Zr[0]) != null && we.isFrozen() && de.type !== Ce.FullSnapshot && !(de.type === Ce.IncrementalSnapshot && de.data.source === xe.Mutation) && Zr.forEach((Ke) => Ke.unfreeze()), fe)
      t == null || t(Ze(de), Ne);
    else if (he) {
      const Ke = {
        type: "rrweb",
        event: Ze(de),
        origin: window.location.origin,
        isCheckout: Ne
      };
      window.parent.postMessage(Ke, "*");
    }
    if (de.type === Ce.FullSnapshot)
      Le = de, ve = 0;
    else if (de.type === Ce.IncrementalSnapshot) {
      if (de.data.source === xe.Mutation && de.data.isAttachIframe)
        return;
      ve++;
      const Ke = n && ve >= n, ge = r && de.timestamp - Le.timestamp > r;
      (Ke || ge) && Yi(!0);
    }
  };
  const U = (oe) => {
    et({
      type: Ce.IncrementalSnapshot,
      data: {
        source: xe.Mutation,
        ...oe
      }
    });
  }, X = (oe) => et({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.Scroll,
      ...oe
    }
  }), W = (oe) => et({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.CanvasMutation,
      ...oe
    }
  }), Be = (oe) => et({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.AdoptedStyleSheet,
      ...oe
    }
  }), ue = new Nv({
    mutationCb: U,
    adoptedStyleSheetCb: Be
  }), re = new Ev({
    mirror: Xt,
    mutationCb: U,
    stylesheetManager: ue,
    recordCrossOriginIframes: R,
    wrappedEmit: et
  });
  for (const oe of Y || [])
    oe.getMirror && oe.getMirror({
      nodeMirror: Xt,
      crossOriginIframeMirror: re.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: re.crossOriginIframeStyleMirror
    });
  const tt = new Pv();
  sa = new Ov({
    recordCanvas: x,
    mutationCb: W,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Xt,
    sampling: v.canvas,
    dataURLOptions: k
  });
  const ht = new Cv({
    mutationCb: U,
    scrollCb: X,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskInputOptions: Ae,
      dataURLOptions: k,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: x,
      inlineImages: ee,
      sampling: v,
      slimDOMOptions: ze,
      iframeManager: re,
      stylesheetManager: ue,
      canvasManager: sa,
      keepIframeSrcFn: _,
      processedNodeManager: tt
    },
    mirror: Xt
  });
  Yi = (oe = !1) => {
    if (!S)
      return;
    et(
      {
        type: Ce.Meta,
        data: {
          href: window.location.href,
          width: gp(),
          height: mp()
        }
      },
      oe
    ), ue.reset(), ht.init(), Zr.forEach((we) => we.lock());
    const Ne = pk(document, {
      mirror: Xt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: o,
      maskAllInputs: Ae,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: ze,
      dataURLOptions: k,
      recordCanvas: x,
      inlineImages: ee,
      onSerialize: (we) => {
        kp(we, Xt) && re.addIframe(we), vp(we, Xt) && ue.trackLinkElement(we), ya(we) && ht.addShadowRoot(ke.shadowRoot(we), document);
      },
      onIframeLoad: (we, de) => {
        re.attachIframe(we, de), ht.observeAttachShadow(we);
      },
      onStylesheetLoad: (we, de) => {
        ue.attachLinkElement(we, de);
      },
      keepIframeSrcFn: _
    });
    if (!Ne)
      return console.warn("Failed to snapshot the document");
    et(
      {
        type: Ce.FullSnapshot,
        data: {
          node: Ne,
          initialOffset: fp(window)
        }
      },
      oe
    ), Zr.forEach((we) => we.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && ue.adoptStyleSheets(
      document.adoptedStyleSheets,
      Xt.getId(document)
    );
  };
  try {
    const oe = [], Ne = (de) => {
      var Ke;
      return Ee(Sv)(
        {
          mutationCb: U,
          mousemoveCb: (ge, Pe) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: Pe,
              positions: ge
            }
          }),
          mouseInteractionCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.MouseInteraction,
              ...ge
            }
          }),
          scrollCb: X,
          viewportResizeCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.ViewportResize,
              ...ge
            }
          }),
          inputCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.Input,
              ...ge
            }
          }),
          mediaInteractionCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.MediaInteraction,
              ...ge
            }
          }),
          styleSheetRuleCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.StyleSheetRule,
              ...ge
            }
          }),
          styleDeclarationCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.StyleDeclaration,
              ...ge
            }
          }),
          canvasMutationCb: W,
          fontCb: (ge) => et({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.Font,
              ...ge
            }
          }),
          selectionCb: (ge) => {
            et({
              type: Ce.IncrementalSnapshot,
              data: {
                source: xe.Selection,
                ...ge
              }
            });
          },
          customElementCb: (ge) => {
            et({
              type: Ce.IncrementalSnapshot,
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
          maskTextSelector: p,
          maskInputOptions: Ae,
          inlineStylesheet: o,
          sampling: v,
          recordDOM: S,
          recordCanvas: x,
          inlineImages: ee,
          userTriggeredOnInput: $,
          collectFonts: P,
          doc: de,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: s,
          slimDOMOptions: ze,
          dataURLOptions: k,
          mirror: Xt,
          iframeManager: re,
          stylesheetManager: ue,
          shadowDomManager: ht,
          processedNodeManager: tt,
          canvasManager: sa,
          ignoreCSSAttributes: Oe,
          plugins: ((Ke = Y == null ? void 0 : Y.filter((ge) => ge.observer)) == null ? void 0 : Ke.map((ge) => ({
            observer: ge.observer,
            options: ge.options,
            callback: (Pe) => et({
              type: Ce.Plugin,
              data: {
                plugin: ge.name,
                payload: Pe
              }
            })
          }))) || []
        },
        y
      );
    };
    re.addLoadListener((de) => {
      try {
        oe.push(Ne(de.contentDocument));
      } catch (Ke) {
        console.warn(Ke);
      }
    });
    const we = () => {
      Yi(), oe.push(Ne(document)), ns = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? we() : (oe.push(
      St("DOMContentLoaded", () => {
        et({
          type: Ce.DomContentLoaded,
          data: {}
        }), O === "DOMContentLoaded" && we();
      })
    ), oe.push(
      St(
        "load",
        () => {
          et({
            type: Ce.Load,
            data: {}
          }), O === "load" && we();
        },
        window
      )
    )), () => {
      oe.forEach((de) => {
        try {
          de();
        } catch (Ke) {
          String(Ke).toLowerCase().includes("cross-origin") || console.warn(Ke);
        }
      }), tt.destroy(), ns = !1, uv();
    };
  } catch (oe) {
    console.warn(oe);
  }
}
zr.addCustomEvent = (e, t) => {
  if (!ns)
    throw new Error("please add custom event after start recording");
  et({
    type: Ce.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
zr.freezePage = () => {
  Zr.forEach((e) => e.freeze());
};
zr.takeFullSnapshot = (e) => {
  if (!ns)
    throw new Error("please take full snapshot after start recording");
  Yi(e);
};
zr.mirror = Xt;
var Gu;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Gu || (Gu = {}));
const { addCustomEvent: z0 } = zr, { freezePage: $0 } = zr, { takeFullSnapshot: D0 } = zr, qi = 2, oa = 4;
class zv {
  constructor(t) {
    Ei(this, "events", []);
    Ei(this, "lastMeta", null);
    Ei(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === oa && (this.lastMeta = t), t.type === qi && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === qi), n = this.events.some((i) => i.type === oa);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === qi), n = t.some((i) => i.type !== qi && i.type !== oa);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function $v(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new zv({
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
const Ip = "klav-sims-live", Op = "klav-sims-overlay", Xu = "klav-sims-ext-css";
let Nt = null, Kr = null, qt = null, An = null;
const Or = /* @__PURE__ */ new Map(), Wt = /* @__PURE__ */ new Map();
let ws = 0, er = !1, Qr = null, On = null, hi = !1, yr = null, Ya = 0, Jr = 0, Nr = /* @__PURE__ */ new Set(), xt = null, Pr = null, Pt = null, ar = [];
const lr = /* @__PURE__ */ new Set();
let Nn = !1, cr = "", lt = null, en = null, gr = null, Lr = null, yt = null, tn = null, Jt = null, Kt = null, or = null, zt = null, Ln = null;
const xs = /* @__PURE__ */ new Set();
function Dv(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Va(e, t) {
  return `${e}::${Dv(t.text)}`;
}
const Fv = 0.55, Uv = 0.8, Ga = [];
function Np(e) {
  const t = String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), r = /* @__PURE__ */ new Set();
  if (!t) return r;
  const n = `  ${t} `;
  for (let i = 0; i < n.length - 2; i++) r.add(n.slice(i, i + 3));
  return r;
}
function Bv(e, t) {
  if (e.size === 0 || t.size === 0) return 0;
  let r = 0;
  for (const n of e) t.has(n) && r++;
  return r / Math.sqrt(e.size * t.size);
}
function qv(e, t) {
  const r = Np(t.text);
  return Ga.some((n) => Bv(r, n.grams) >= (n.simId === e ? Fv : Uv));
}
function jv(e, t) {
  xs.add(Va(e, t)), Ga.push({ simId: e, grams: Np(t.text) });
}
function Pp(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Wv = `
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
`, Hv = `
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
function Ku(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Yv(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ka() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Vv(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Pn(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const zp = { HIGH: "h", MED: "m", LOW: "l" }, Ju = { HIGH: 0, MED: 1, LOW: 2 };
function Gv(e) {
  if (!e) return !1;
  if (e === qt || e === Nt || e.id === Op || e.id === Ip || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Xv(e) {
  const t = [];
  for (const r of [qt, Nt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function $p(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Dp(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Zu(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Kv(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Jv(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Fp(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Gv(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Zv(e, t) {
  return Xv(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Fp(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function Qv(e, t) {
  const r = $p(t), n = Dp(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Zv(i, s);
  if (!a.length) return null;
  const c = Math.max(1, Zu(n));
  let l = null, p = -1 / 0;
  for (const o of a) {
    const h = Jv(o.getBoundingClientRect()), u = Kv(h, n);
    if (u <= 0) continue;
    const d = Math.max(1, Zu(h)), m = u / c, f = Math.max(0, (d - u) / d), y = o.tagName.toLowerCase(), E = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, v = d > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, k = m - f * 0.35 + E - v;
    k > p && (l = o, p = k);
  }
  return l ?? a[0] ?? null;
}
async function e0(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: ka() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await Vv(ka() ? 80 : 520);
}
const t0 = /* @__PURE__ */ new Set([
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
function r0(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || t0.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function n0(e) {
  const t = r0(e.text);
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
    if (!Fp(a)) continue;
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
    const o = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(o) ? 0.6 : 0, d = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - d;
    m > i && (n = a, i = m);
  }
  return n;
}
async function i0(e, t = {}) {
  if (e.region) {
    const r = $p(e), n = Dp(e.region, r);
    t.scroll !== !1 && await e0(n.left + n.width / 2, n.top + n.height / 2);
    const i = Qv(e.region, e);
    if (i) return i;
  }
  return n0(e);
}
function s0() {
  if (Nt && Kr) return Kr;
  Nt = document.createElement("div"), Nt.id = Ip, Nt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Kr = Nt.attachShadow({ mode: "open" }), Hy(Kr);
  const e = document.createElement("style");
  return e.textContent = Wv, Kr.appendChild(e), document.body.appendChild(Nt), Kr;
}
function Up() {
  if (qt) return qt;
  if (!document.getElementById(Xu)) {
    const e = document.createElement("style");
    e.id = Xu, e.textContent = Hv, document.head.appendChild(e);
  }
  return qt = document.createElement("div"), qt.id = Op, qt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(qt), qt;
}
function Bp(e, t) {
  return jy({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function qp() {
  en && (en.textContent = "", [...Nr].slice(0, 3).forEach((e) => {
    const t = Or.get(e);
    t && en.appendChild(Bp(t, 26));
  }));
}
function o0(e, t = {}) {
  if (!(typeof document > "u")) {
    if (!Nt || !Nt.isConnected) {
      jp(e.map((r) => r.id), e, t);
      return;
    }
    t.onClose && (xt = t.onClose), t.simControls && (Pr = t.simControls);
    for (const r of e.slice(0, 8))
      Or.has(r.id) || Or.set(r.id, { simId: r.id, accent: r.accent || "#6366f1", initials: r.initials || r.name.slice(0, 2).toUpperCase(), name: r.name, photoUrl: r.photoUrl });
    Nr = new Set(e.slice(0, 8).map((r) => r.id)), qp(), ln(), er && nn();
  }
}
function is() {
  var e;
  nt(Pt), Pt = null, lr.clear(), cr = "", (e = yt == null ? void 0 : yt.querySelector(".ksl-sims-btn")) == null || e.setAttribute("aria-expanded", "false");
}
function a0(e) {
  if (Pt) {
    is();
    return;
  }
  !yt || !Pr || (Pt = document.createElement("div"), Pt.className = "ksl-simmenu", Pt.setAttribute("role", "dialog"), Pt.setAttribute("aria-label", "Run or stop Sims"), yt.appendChild(Pt), e.setAttribute("aria-expanded", "true"), ar = [], _r(!0), Pr.list().then((t) => {
    ar = t, _r();
  }).catch((t) => {
    cr = (t == null ? void 0 : t.message) || "Couldn't load your Sims.", _r();
  }));
}
function l0(e) {
  const t = document.createElement("div"), r = lr.has(e.id);
  t.className = "ksl-sm-row" + (e.active ? e.running ? " is-running" : "" : " is-off") + (r ? " is-sel" : ""), t.dataset.simId = e.id;
  const n = document.createElement("span");
  n.className = "ksl-sm-av", n.style.background = c0(e.accent) || "#6366f1", n.textContent = (e.initials || e.name.slice(0, 2)).slice(0, 2).toUpperCase();
  const i = document.createElement("div");
  i.className = "ksl-sm-meta";
  const s = document.createElement("div");
  s.className = "ksl-sm-name", s.textContent = e.name;
  const a = document.createElement("div");
  if (a.className = "ksl-sm-st", a.textContent = e.active ? e.running ? "Running" : "Not running" : "Deactivated", a.dataset.kind = "run", i.append(s, a), !e.active) {
    t.setAttribute("aria-disabled", "true"), t.tabIndex = 0;
    const o = () => {
      cr = `${e.name} is deactivated. Activate this Sim on the Sims tab to run it.`, _r();
    };
    return t.addEventListener("click", o), t.addEventListener("keydown", (h) => {
      (h.key === " " || h.key === "Enter") && (h.preventDefault(), o());
    }), t.append(n, i), t;
  }
  const c = document.createElement("span");
  c.className = "ksl-sm-chk" + (r ? " on" : ""), c.innerHTML = r ? K("check", { size: 11 }) : "", t.setAttribute("role", "checkbox"), t.setAttribute("aria-checked", String(r)), t.tabIndex = 0;
  const l = () => {
    Nn || (r ? lr.delete(e.id) : lr.add(e.id), cr = "", _r());
  };
  t.addEventListener("click", l), t.addEventListener("keydown", (o) => {
    o.target === t && (o.key === " " || o.key === "Enter") && (o.preventDefault(), l());
  });
  const p = document.createElement("button");
  return p.type = "button", p.className = "ksl-sm-act" + (e.running ? " is-stop" : ""), p.dataset.action = e.running ? "stop" : "run", p.disabled = Nn, p.setAttribute("aria-label", `${e.running ? "Stop" : "Run"} ${e.name}`), p.innerHTML = K(e.running ? "square" : "play", { size: 11 }) + `<span>${e.running ? "Stop" : "Run"}</span>`, p.addEventListener("click", (o) => {
    o.stopPropagation(), va(e.running ? "stop" : "run", [e.id]);
  }), p.addEventListener("keydown", (o) => o.stopPropagation()), t.append(c, n, i, p), t;
}
function _r(e = !1) {
  var x;
  const t = Pt;
  if (!t) return;
  const r = ((x = t.querySelector(".ksl-sm-list")) == null ? void 0 : x.scrollTop) ?? 0;
  t.textContent = "";
  const n = ar.filter((R) => R.active), i = n.filter((R) => R.running), s = n.filter((R) => !R.running), a = ar.filter((R) => !R.active), c = document.createElement("div");
  c.className = "ksl-sm-head";
  const l = document.createElement("button");
  l.type = "button", l.className = "ksl-sm-back", l.setAttribute("aria-label", "Back to findings"), l.title = "Back to findings", l.innerHTML = K("chevron-left", { size: 16 }), l.addEventListener("click", () => is());
  const p = document.createElement("div");
  p.className = "ksl-sm-titles";
  const o = document.createElement("div");
  o.className = "ksl-sm-title", o.textContent = "Sims on this page";
  const h = document.createElement("div");
  h.className = "ksl-sm-sub", h.textContent = e ? "Loading…" : n.length ? `${i.length} of ${n.length} running` : "No activated Sims yet", p.append(o, h);
  const u = document.createElement("span");
  u.className = "ksl-head-btns";
  const d = document.createElement("button");
  if (d.type = "button", d.className = "ksl-icon-btn ksl-sm-min", d.title = "Minimize", d.setAttribute("aria-label", "Minimize Sims feedback panel"), d.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', d.addEventListener("click", () => {
    is(), Vi();
  }), u.appendChild(d), xt) {
    const R = document.createElement("button");
    R.type = "button", R.className = "ksl-icon-btn ksl-close-btn ksl-sm-close", R.title = "Close and stop all Sims", R.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), R.innerHTML = K("x", { size: 15 }), R.addEventListener("click", () => {
      try {
        xt == null || xt();
      } catch {
      }
    }), u.appendChild(R);
  }
  c.append(l, p, u), t.appendChild(c);
  const m = document.createElement("div");
  if (m.className = "ksl-sm-list", e) m.innerHTML = '<div class="ksl-sm-empty">Loading Sims…</div>';
  else if (!ar.length) m.innerHTML = '<div class="ksl-sm-empty">No Sims in this project yet.</div>';
  else {
    if (n.length > 1) {
      const O = n.filter((Oe) => lr.has(Oe.id)).length, $ = O === n.length, P = document.createElement("div");
      P.className = "ksl-sm-all", P.setAttribute("role", "checkbox"), P.setAttribute("aria-checked", $ ? "true" : O ? "mixed" : "false"), P.tabIndex = 0;
      const ee = document.createElement("span");
      ee.className = "ksl-sm-chk" + ($ ? " on" : O ? " mixed" : ""), ee.innerHTML = $ ? K("check", { size: 11 }) : O ? '<span style="width:8px;height:2px;background:#fff;border-radius:2px"></span>' : "";
      const Y = document.createElement("span");
      Y.textContent = "Select all", P.append(ee, Y);
      const _ = () => {
        Nn || (n.forEach((Oe) => $ ? lr.delete(Oe.id) : lr.add(Oe.id)), cr = "", _r());
      };
      P.addEventListener("click", _), P.addEventListener("keydown", (Oe) => {
        (Oe.key === " " || Oe.key === "Enter") && (Oe.preventDefault(), _());
      }), m.appendChild(P);
    }
    const R = (O, $, P) => {
      if (!$.length) return;
      const ee = document.createElement("div");
      if (ee.className = "ksl-sm-group", ee.textContent = `${O} · ${$.length}`, m.appendChild(ee), P) {
        const Y = document.createElement("div");
        Y.className = "ksl-sm-group-note", Y.textContent = P, m.appendChild(Y);
      }
      for (const Y of $) m.appendChild(l0(Y));
    };
    R("Running", i), R("Not running", s), R("Deactivated", a, "Activate these on the Sims tab to run them here.");
  }
  if (t.appendChild(m), m.scrollTop = r, cr) {
    const R = document.createElement("div");
    R.className = "ksl-sm-note", R.setAttribute("role", "status"), R.textContent = cr, t.appendChild(R);
  }
  const f = n.filter((R) => lr.has(R.id)), y = f.filter((R) => !R.running).map((R) => R.id), E = f.filter((R) => R.running).map((R) => R.id), v = document.createElement("div");
  v.className = "ksl-sm-foot";
  const k = document.createElement("span");
  k.className = "ksl-sm-cnt", k.textContent = f.length ? `${f.length} selected` : "Tick Sims to run or stop several";
  const A = document.createElement("button");
  A.type = "button", A.className = "ksl-sm-bulk", A.dataset.action = "run-selected", A.disabled = Nn || !y.length, A.innerHTML = K("play", { size: 11 }) + `<span>Run${y.length ? " " + y.length : ""}</span>`, A.addEventListener("click", () => void va("run", y));
  const S = document.createElement("button");
  S.type = "button", S.className = "ksl-sm-bulk is-stop", S.dataset.action = "stop-selected", S.disabled = Nn || !E.length, S.innerHTML = K("square", { size: 11 }) + `<span>Stop${E.length ? " " + E.length : ""}</span>`, S.addEventListener("click", () => void va("stop", E)), v.append(k, A, S), t.appendChild(v);
}
let aa = Promise.resolve(), ji = 0;
async function va(e, t) {
  if (!Pr || !t.length) return;
  const r = Pr, n = new Set(t);
  ar = ar.map((s) => s.active && n.has(s.id) ? { ...s, running: e === "run" } : s);
  for (const s of t) lr.delete(s);
  const i = t.length;
  cr = e === "run" ? `${i === 1 ? "Sim is" : `${i} Sims are`} running.` : `${i === 1 ? "Sim" : `${i} Sims`} stopped. Reported issues stay here and in Sim Reports.`, _r(), ji++, aa = aa.then(async () => {
    try {
      const s = await (e === "run" ? r.run(t) : r.stop(t));
      ji--, ji || (ar = s);
    } catch (s) {
      ji--, cr = (s == null ? void 0 : s.message) || "Couldn't update the Sims — please try again.";
      try {
        ar = await r.list();
      } catch {
      }
    }
    Pt && Pt.isConnected && _r();
  }), await aa;
}
function c0(e) {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(e || "")) ? String(e) : null;
}
function jp(e, t = [], r = {}) {
  if (typeof document > "u") return;
  xa(), xt = r.onClose ?? null, Pr = r.simControls ?? null;
  const n = s0();
  Up(), An = new AbortController();
  const i = e === "all" ? t : t.filter((u) => e.includes(u.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), xa();
    return;
  }
  i.slice(0, 8).forEach((u) => {
    const d = u.accent || "#6366f1", m = u.initials || u.name.slice(0, 2).toUpperCase();
    Or.set(u.id, { simId: u.id, accent: d, initials: m, name: u.name, photoUrl: u.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), zt = document.createElement("div"), zt.className = "ksl-sr", zt.id = "ksl-announcer", zt.setAttribute("aria-live", "polite"), zt.setAttribute("aria-atomic", "true"), s.appendChild(zt), lt = document.createElement("button"), lt.type = "button", lt.className = "ksl-launcher", lt.setAttribute("aria-label", "Open Sims feedback panel"), lt.addEventListener("click", () => p0());
  const a = document.createElement("span");
  a.className = "ksl-pill", en = document.createElement("span"), en.className = "ksl-pill-avatars", gr = document.createElement("span"), gr.className = "ksl-pill-txt", a.append(en, gr), Lr = document.createElement("span"), Lr.className = "ksl-pill-badge", Lr.hidden = !0, lt.append(a, Lr);
  const c = document.createElement("div");
  if (c.className = "ksl-launch-group", c.appendChild(lt), xt) {
    const u = document.createElement("button");
    u.type = "button", u.className = "ksl-stop-all", u.title = "Stop all Sims", u.setAttribute("aria-label", "Stop all Sims"), u.textContent = "Stop", u.addEventListener("click", (d) => {
      d.stopPropagation();
      try {
        xt == null || xt();
      } catch {
      }
    }), c.appendChild(u);
  }
  s.appendChild(c), Nr = new Set(i.slice(0, 8).map((u) => u.id)), qp(), yt = document.createElement("section"), yt.className = "ksl-panel", yt.setAttribute("aria-label", "Sims feedback"), yt.setAttribute("role", "dialog");
  const l = document.createElement("div");
  l.className = "ksl-head";
  const p = document.createElement("div");
  p.className = "ksl-title-row";
  const o = document.createElement("div");
  o.className = "ksl-title", o.textContent = "Sims feedback";
  const h = document.createElement("button");
  if (h.type = "button", h.className = "ksl-icon-btn", h.title = "Minimize", h.setAttribute("aria-label", "Minimize Sims feedback panel"), xt) {
    h.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', h.addEventListener("click", () => Vi());
    const u = document.createElement("button");
    u.type = "button", u.className = "ksl-icon-btn ksl-close-btn", u.title = "Close and stop all Sims", u.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), u.innerHTML = K("x", { size: 15 }), u.addEventListener("click", () => {
      try {
        xt == null || xt();
      } catch {
      }
    });
    const d = document.createElement("span");
    if (d.className = "ksl-head-btns", Pr) {
      const m = document.createElement("button");
      m.type = "button", m.className = "ksl-sims-btn", m.setAttribute("aria-haspopup", "dialog"), m.setAttribute("aria-expanded", "false"), m.title = "Run or stop Sims", m.innerHTML = K("users", { size: 14 }) + "<span>Sims</span>", m.addEventListener("click", () => a0(m)), d.append(m);
    }
    d.append(h, u), p.append(o, d);
  } else
    h.innerHTML = K("x", { size: 15 }), h.addEventListener("click", () => Vi()), p.append(o, h);
  tn = document.createElement("div"), tn.className = "ksl-count", Jt = document.createElement("div"), Jt.className = "ksl-status", Jt.hidden = !0, Jt.setAttribute("role", "status"), Kt = document.createElement("div"), Kt.className = "ksl-chips", l.append(p, tn, Jt, Kt), or = document.createElement("div"), or.className = "ksl-list", or.setAttribute("role", "list"), yt.append(l, or), s.appendChild(yt), document.addEventListener("keydown", (u) => {
    if (u.key === "Escape" && Pt) {
      is();
      return;
    }
    u.key === "Escape" && er && Vi();
  }, { signal: An.signal }), Pp(!0), ln();
}
function Xa(e) {
  hi = e, lt == null || lt.classList.toggle("is-reviewing", e), ln(), er && nn();
}
function Ka() {
  const e = Nr.size || Or.size, t = e === 1 ? "Sim is" : "Sims are";
  switch (yr) {
    case "analysing":
      return `${e === 1 ? "Sim is" : `${e} Sims are`} analysing this page…`;
    case "running":
      return `${t} running on this page…`;
    case "completed": {
      const r = ws - Ya;
      return `Sim run completed · ${r ? `${r} new finding${r === 1 ? "" : "s"}` : "no new findings"}`;
    }
    case "failed":
      return "Sim run didn't finish — it will retry on the next change.";
    default:
      return "";
  }
}
function u0(e) {
  e === "analysing" ? (Jr === 0 && (Ya = ws), Jr++) : e === "completed" || e === "failed" ? (Jr = Math.max(0, Jr - 1), Jr > 0 && (e = "running")) : e === null && (Jr = 0), yr = e, Xa(e === "analysing" || e === "running"), zt && e && (zt.textContent = Ka());
}
function d0() {
  if (!Jt || (Jt.hidden = !yr, Jt.className = "ksl-status" + (yr ? ` is-${yr}` : ""), Jt.textContent = "", !yr)) return;
  const e = document.createElement("span");
  e.className = "ksl-status-dot";
  const t = document.createElement("span");
  t.className = "ksl-status-txt", t.textContent = Ka(), Jt.append(e, t);
}
function p0() {
  !yt || !lt || (er = !0, yt.classList.add("is-open"), lt.hidden = !0, lt.parentElement && (lt.parentElement.hidden = !0), nn());
}
function Vi() {
  !yt || !lt || (er = !1, yt.classList.remove("is-open"), lt.hidden = !1, lt.parentElement && (lt.parentElement.hidden = !1), ln());
}
function Wp() {
  const e = Array.from(Wt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Pn(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function ln() {
  const e = Wp();
  if (gr)
    if (yr === "analysing" || yr === "running")
      gr.textContent = Ka();
    else if (hi && e.total === 0)
      gr.innerHTML = "Your Sims are reviewing…";
    else if (e.total === 0) {
      const t = Nr.size || Or.size;
      gr.innerHTML = `${t} Sim${t === 1 ? " is" : "s are"} running on this page`;
    } else
      gr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`;
  Lr && (Lr.hidden = e.high === 0, Lr.textContent = `${e.high} high`), d0(), er && Hp(e);
}
function Hp(e) {
  tn && (e.total === 0 ? tn.innerHTML = hi ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : tn.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), h0();
}
function h0() {
  if (!Kt) return;
  const e = Array.from(Wt.values());
  if (Kt.hidden = e.length === 0, Kt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Kt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (Qr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(Qr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      Qr = Qr === i.simId ? null : i.simId, nn();
    }), Kt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Kt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => Pn(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = On === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${zp[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      On = On === i ? null : i, nn();
    }), Kt.appendChild(a);
  });
}
function f0() {
  return Array.from(Wt.values()).filter((e) => !Qr || e.entry.simId === Qr).filter((e) => !On || Pn(e.obs) === On).sort((e, t) => {
    const r = Pn(e.obs), n = Pn(t.obs), i = r ? Ju[r] : 3, s = n ? Ju[n] : 3;
    return i - s;
  });
}
function m0(e) {
  const { entry: t, obs: r } = e, n = Pn(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Bp(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${zp[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = K("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Gi.onTriage) == null || m.call(Gi, r, t.name), Qu(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = K("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    y0(e.id);
  });
  const d = document.createElement("button");
  return d.type = "button", d.className = "ksl-r-act dismiss", d.textContent = "Dismiss", d.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), d.addEventListener("click", () => {
    Qu(e.id);
  }), o.append(h, u, d), i.appendChild(o), i;
}
function g0(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function nn() {
  if (!or || !er) {
    ln();
    return;
  }
  const e = Wp();
  Hp(e);
  const t = f0();
  if (or.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Wt.size > 0;
    if (hi && !i) {
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
    or.appendChild(n), Wt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = m0(n);
    n.rowEl = i, or.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Wt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), g0(or);
}
function wa() {
  Ln == null || Ln(), Ln = null;
}
async function y0(e) {
  const t = Wt.get(e);
  if (!t) return;
  const r = await i0(t.obs, { scroll: !0 });
  !r || !qt || b0(r, t.entry.accent);
}
function b0(e, t) {
  wa();
  const r = Up(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Ku(t, 0.16)},0 0 24px ${Ku(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const p = e.getBoundingClientRect(), o = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Ln === l && wa();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), nt(n);
  };
  Ln = l;
}
function k0(e, t) {
  const r = `f_${e.simId}_${++ws}`;
  Wt.set(r, { id: r, entry: e, obs: t, rowEl: null }), er ? nn() : ln(), zt && (zt.textContent = "", requestAnimationFrame(() => {
    zt && (zt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function v0(e) {
  const t = Wt.get(e);
  if (!t) return;
  const r = () => {
    Wt.delete(e), er ? nn() : ln();
  };
  t.rowEl && er ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ka() ? 0 : 300)) : r();
}
function Qu(e) {
  const t = Wt.get(e);
  t && (xs.add(Va(t.entry.simId, t.obs)), v0(e));
}
function w0(e, t, r) {
  if (!Nt) return;
  const n = Or.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length && !(Nr.size && !Nr.has(e))) {
    Xa(!1);
    for (const i of r) {
      if (!Yv(i)) continue;
      const s = Va(e, i);
      xs.has(s) || qv(e, i) || (jv(e, i), k0(n, i));
    }
  }
}
function xa() {
  wa(), Wt.clear(), ws = 0, Or.clear(), xs.clear(), Ga.length = 0, er = !1, Qr = null, On = null, hi = !1, yr = null, Ya = 0, Jr = 0, Nr = /* @__PURE__ */ new Set(), xt = null, Pr = null, Pt = null, ar = [], lr.clear(), Nn = !1, cr = "", An == null || An.abort(), An = null, lt = null, en = null, gr = null, Lr = null, yt = null, tn = null, Jt = null, Kt = null, or = null, zt = null, nt(qt), qt = null, nt(Nt), Nt = null, Kr = null, Pp(!1);
}
const Gi = {
  deploy: jp,
  updateSims: o0,
  setReviewing: Xa,
  setRunStatus: u0,
  renderFeedback: w0,
  undeploy: xa,
  onTriage: null
};
function x0() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Gi);
}
typeof window < "u" && x0();
const ed = "klav-ao-css", S0 = "klav-ao-overlay";
function E0(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), p = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(p, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const C0 = `
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
let Xr = null, M0 = 1;
const ss = /* @__PURE__ */ new Map();
function td(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function R0() {
  if (Xr) return Xr;
  if (!document.getElementById(ed)) {
    const e = document.createElement("style");
    e.id = ed, e.textContent = C0, document.head.appendChild(e);
  }
  return Xr = document.createElement("div"), Xr.id = S0, Xr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Xr), Xr;
}
function F0(e, t, r = {}) {
  const n = R0(), i = r.color ?? "#6366f1", s = `klav-ao-${M0++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${td(i, 0.14)},0 0 24px ${td(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: u, top: d, below: m } = E0(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = s, l.style.borderLeftColor = i, l.style.left = u + "px", l.style.top = d + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const y = document.createElement("span");
    y.className = "klav-ao-lbl", y.style.color = i, y.textContent = t, f.appendChild(y);
    const E = r.priority ?? r.severity;
    if (E) {
      const k = E === "medium" ? " sev-m" : E === "low" ? " sev-l" : "", A = document.createElement("span");
      A.className = `klav-ao-sev${k}`, A.textContent = E, f.appendChild(A);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => Yp(s)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return ss.set(s, { halo: c, pin: l }), s;
}
function Yp(e) {
  const t = ss.get(e);
  if (!t) return;
  ss.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    nt(n), nt(r);
  }, 240)) : nt(r);
}
function U0() {
  for (const e of [...ss.keys()]) Yp(e);
}
let Ja = Sn, Ar = "";
const Vp = { consoleErrors: [], networkFailures: [] };
let Za, Gp, zn = null;
function xn() {
  return Ja.backendUrl || Md;
}
const T0 = 15e3;
function Jn(e, t = {}, r = T0) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Xp(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function rd() {
  return Qm(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function A0() {
  return hg(Vp, { identity: Za, metadata: Gp });
}
async function L0(e) {
  return ag(
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
      projectId: Ar || void 0,
      replayEvents: e.replayEvents
    },
    Ja,
    { backend: Xy }
  );
}
function Qa(e = "bug") {
  const t = Ny(e, {
    onCaptureFull: rd,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: Sc,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Jn(xn() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: Ar, text: r, url: location.href })
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
        const i = await Jn(xn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: Ar, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: Zs() })
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
        const i = await Jn(xn() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: Ar,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: Zs()
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
        s.append("projectId", Ar), s.append("audio", r, "recording.webm"), r.type && s.append("mime", r.type), s.append("pageUrl", location.href), n != null && n.text && s.append("text", n.text), (i = n == null ? void 0 : n.frames) != null && i.length && s.append("frames", JSON.stringify(n.frames));
        const a = await Jn(xn() + "/api/report/split", { method: "POST", body: s }, 9e4);
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
        n.append("projectId", Ar), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Jn(xn() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(xn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", Ar), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Dd();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => gb({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    // Files over the single-request caps upload in chunks first (core submitReport → large-upload).
    largeFileUploads: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => Sc(a))), i = await Promise.all(n.map((a) => yb(a))), s = A0();
      return r.attachConsole !== !0 && (s.consoleErrors = []), L0({
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
        reporter: Za,
        clientInfo: Zs(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (zn == null ? void 0 : zn.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await rd();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function _0() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function I0() {
  fg(Vp, { consoleLevels: !0 });
}
function Kp(e) {
  Za = e ? Xp(e) : void 0;
}
function Jp(e) {
  Gp = e ? Xp(e) : void 0;
}
function O0() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = Ky, (document.head || document.documentElement).appendChild(e);
}
function N0() {
  document.addEventListener("contextmenu", (e) => {
    if (my(e.target)) return;
    e.preventDefault(), O0();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (p, o, h, u, d = {}) => {
      const m = Zy(document, { iconHtml: K(p), label: o, desc: h, primary: d.primary });
      return m.addEventListener("click", () => {
        a(), Qa(u);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      nt(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Zp(e = {}) {
  if (Ja = {
    ...Sn,
    ...e,
    jira: { ...Sn.jira, ...e.jira },
    linear: { ...Sn.linear, ...e.linear },
    github: { ...Sn.github, ...e.github },
    plane: { ...Sn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (Ar = e.projectId), I0(), _0(), N0(), !zn)
    try {
      zn = $v(zr);
    } catch {
      zn = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Zp, openModal: Qa, identify: Kp, setMetadata: Jp });
const B0 = { init: Zp, openModal: Qa, identify: Kp, setMetadata: Jp };
export {
  Gi as KlavitySims,
  Gi as SimsLive,
  Yp as clearAnnotation,
  U0 as clearAnnotations,
  B0 as default,
  Kp as identify,
  Zp as init,
  x0 as installKlavitySims,
  Qa as openModal,
  Jp as setMetadata,
  F0 as showAnnotation
};
